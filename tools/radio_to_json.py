#!/usr/bin/env python3
"""
Reads binary packets from a serial port and streams them as JSON
via Server-Sent Events at http://localhost:<port>/stream.
"""

import argparse
import json
import struct
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from enum import IntEnum
import threading
import serial


DELIMITER = 0xAAAAAAAA
PACKET_HEADER_SIZE = 3   # header (1) + rssi (1) + reserved (1)
FRAME_HEADER_SIZE  = 6   # id (1) + timestamp (4) + length (1)


class DataType(IntEnum):
    WHEEL_RPM          = 0x01
    CAR_STATE          = 0x02
    MOTOR_RPM          = 0x03
    IMU_ROTATION       = 0x04
    IMU_ACCELERATION   = 0x05
    BRAKE_PRESSURE     = 0x06
    SHOCK_DISPLACEMENT = 0x07
    CVT_TEMPERATURE    = 0x08
    GPS_POSITION       = 0x09
    ERRORS             = 0xAA

FRAME_FIELDS: dict[DataType, tuple[str, ...]] = {
    DataType.WHEEL_RPM:          ("wheel_rpm_front_left", "wheel_rpm_front_right", "wheel_rpm_rear"),
    DataType.CAR_STATE:          ("car_state_distance", "car_state_speed"),
    DataType.MOTOR_RPM:          ("motor_rpm",),
    DataType.IMU_ROTATION:       ("imu_rotation_x", "imu_rotation_y", "imu_rotation_z"),
    DataType.IMU_ACCELERATION:   ("imu_acceleration_x", "imu_acceleration_y", "imu_acceleration_z"),
    DataType.BRAKE_PRESSURE:     ("brake_pressure_front", "brake_pressure_rear"),
    DataType.SHOCK_DISPLACEMENT: ("shock_displacement_front_left", "shock_displacement_front_right", "shock_displacement_rear_left", "shock_displacement_rear_right"),
    DataType.CVT_TEMPERATURE:    ("cvt_temperature",),
    DataType.GPS_POSITION:       ("gps_longitude", "gps_latitude", "gps_altitude"),
    DataType.ERRORS:             ("error_code",),
}

# ---------------------------------------------------------------------------
# Packet parsing
# ---------------------------------------------------------------------------

class PacketError(Exception):
    pass

class PacketParser:
    """Parses raw binary packets into a list of JSON-serialisable dicts."""

    def parse(self, packet: bytearray) -> list[dict]:

        if len(packet) < PACKET_HEADER_SIZE:
            raise PacketError(f"Packet too short: {len(packet)} bytes")

        header = packet[0]
        rssi = int.from_bytes(packet[1:2], byteorder="big", signed=True)

        if len(packet) == 3:
            return [{"header": header, "rssi": rssi}]

        return [
            {
                "header": header,
                "rssi": rssi,
                **frame
            }
            for frame in self._iter_frames(packet, offset=PACKET_HEADER_SIZE)
        ]

    def _iter_frames(self, packet: bytearray, offset: int):
        while offset < len(packet):
            if offset + FRAME_HEADER_SIZE > len(packet):
                raise PacketError(
                    f"Truncated frame header at offset {offset}: "
                    f"need {FRAME_HEADER_SIZE} bytes, have {len(packet) - offset}"
                )
            
            raw_id = packet[offset]
            timestamp = struct.unpack_from("<f", packet, offset + 1)[0]
            length = packet[offset + 5]

            # --- resolve type ---
            try:
                data_type = DataType(raw_id)
            except ValueError:
                raise PacketError(f"Unknown data type 0x{raw_id:02X} at offset {offset}")

            # --- validate payload length against schema ---
            fields          = FRAME_FIELDS[data_type]
            expected_length = len(fields) * 4   # every field is one 32-bit value
            if length != expected_length:
                raise PacketError(
                    f"{data_type.name} at offset {offset}: "
                    f"expected {expected_length} payload bytes, got {length}"
                )
            
            # --- validate enough bytes remain ---
            payload_start = offset + FRAME_HEADER_SIZE
            payload_end   = payload_start + length
            if payload_end > len(packet):
                raise PacketError(
                    f"Truncated payload for {data_type.name} at offset {offset}: "
                    f"need {length} bytes, have {len(packet) - payload_start}"
                )
    

            # --- unpack payload ---
            if data_type == DataType.ERRORS:
                values = struct.unpack_from("<I", packet, payload_start)   # uint32
            else:
                values = struct.unpack_from(f"<{len(fields)}f", packet, payload_start)

            yield {"ts": timestamp, **dict(zip(fields, values))}

            offset = payload_end


# ---------------------------------------------------------------------------
# Serial reader
# ---------------------------------------------------------------------------

class SerialReader:
    """Yields complete packets read from a serial port."""

    def __init__(self, port: serial.Serial):
        self._port = port
        self._running = False
        self._latest_packet = bytearray()
        self._packet_event = threading.Event()  # <-- add this

    def packets(self):

        if not self._running:
            self._running = True
            t = threading.Thread(target=self.packet_producer, daemon=True)
            t.start()

        while True:
            self._packet_event.wait()       # blocks until producer calls .set()
            self._packet_event.clear()      # reset for the next packet
            yield self._latest_packet

    def packet_producer(self):
        """Infinite generator; yields one bytearray per complete packet."""
        self._sync()
        buf = bytearray()
        trailing = 0

        while True:

            byte = self._port.read(1)[0]
            buf.append(byte)
            trailing = ((trailing << 8) | byte) & 0xFFFFFFFF

            if trailing == DELIMITER:
                self._latest_packet = buf[:-4]
                self._packet_event.set()
                # signal all of the things waiting for this
                # yield buf[:-4]   # strip the delimiter that closed the packet
                buf = bytearray()
                trailing = 0

    def _sync(self):
        """Discard bytes until the first delimiter is found."""
        trailing = 0
        while trailing != DELIMITER:
            if self._port.in_waiting:
                byte = self._port.read(1)[0]
                trailing = ((trailing << 8) | byte) & 0xFFFFFFFF


# ---------------------------------------------------------------------------
# SSE HTTP server
# ---------------------------------------------------------------------------

class SSEHandler(BaseHTTPRequestHandler):

    # Injected by SSEServer before the server starts.
    serial_reader: SerialReader = None
    packet_parser: PacketParser = None

    def log_message(self, fmt, *args):
        pass  # suppress per-request noise

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length"))
        
        body = self.rfile.read(content_length)

        self.send_response(200)
        self.end_headers()

        self.wfile.write(body)

        print("hi")

    def do_GET(self):
        if self.path != "/stream":
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found. Use /stream")
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Accel-Buffering", "no")
        self._send_cors_headers()
        self.end_headers()


        try:
            for packet in self.serial_reader.packets():
                for point in self.packet_parser.parse(packet):
                    self._emit(point)
        except (BrokenPipeError, ConnectionResetError):
            pass  # client disconnected — that's fine

    def _emit(self, point: dict):
        self.wfile.write(f"data: {json.dumps(point)}\n\n".encode())
        self.wfile.flush()

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


class SSEServer:
    def __init__(self, host: str, port: int, reader: SerialReader, parser: PacketParser):
        # Inject dependencies into the handler class before the server starts.
        SSEHandler.serial_reader = reader
        SSEHandler.packet_parser = parser

        self._server = ThreadingHTTPServer((host, port), SSEHandler)
        self._url = f"http://{host}:{port}/stream"

    def serve(self):
        print(f"SSE server running at {self._url}")
        print("Press Ctrl-C to stop.")
        try:
            self._server.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Stream serial packet data as SSE JSON."
    )
    parser.add_argument("--port",        type=int, default=8000)
    parser.add_argument("--serial_port", type=str, default="/dev/ttyUSB0")
    args = parser.parse_args()

    ser = serial.Serial(args.serial_port, 115200, timeout=1)
    time.sleep(2)  # let the device settle

    reader = SerialReader(ser)
    packet_parser = PacketParser()
    SSEServer("localhost", args.port, reader, packet_parser).serve()


if __name__ == "__main__":
    main()