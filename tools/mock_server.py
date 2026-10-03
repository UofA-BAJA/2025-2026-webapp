#!/usr/bin/env python3
"""
Mock data generator for the serial SSE server.

Generates realistic fake binary packets and serves them at
http://localhost:<port>/stream — no hardware required.

Usage:
    python mock_serial_sse.py
    python mock_serial_sse.py --port 8001 --hz 20
"""

import argparse
import json
import math
import random
import struct
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from enum import IntEnum


# ---------------------------------------------------------------------------
# Shared constants (mirrors the real server)
# ---------------------------------------------------------------------------

DELIMITER          = 0xAAAAAAAA
PACKET_HEADER_SIZE = 3
FRAME_HEADER_SIZE  = 6


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
# Packet building helpers
# ---------------------------------------------------------------------------

def build_frame(data_type: DataType, timestamp: float, values: list[float]) -> bytes:
    """Pack one frame (header + payload) into bytes."""
    fields = FRAME_FIELDS[data_type]
    assert len(values) == len(fields), f"{data_type.name}: expected {len(fields)} values"

    if data_type == DataType.ERRORS:
        payload = struct.pack("<I", int(values[0]))
    else:
        payload = struct.pack(f"<{len(fields)}f", *values)

    length = len(payload)
    header = struct.pack("<B", data_type.value)          # id (1 byte)
    header += struct.pack("<f", timestamp)               # timestamp (4 bytes, little-endian float)
    header += struct.pack("<B", length)                  # length (1 byte)
    return header + payload


def build_packet(frames: list[bytes], rssi: int = -60) -> bytes:
    """Wrap frames in a packet header and append the delimiter."""
    packet_header = bytes([0x01, rssi & 0xFF, 0x00])    # header=1, rssi, reserved
    body = packet_header + b"".join(frames)
    delimiter = struct.pack(">I", DELIMITER)             # big-endian for wire format
    return body + delimiter


# ---------------------------------------------------------------------------
# Fake physics / sensor simulation
# ---------------------------------------------------------------------------

class CarSimulator:
    """
    Drives a simple fake car around a virtual track.

    All state is updated in `step(dt)` and readable as properties.
    """

    # GPS bounding box: Baja California peninsula approximate start
    BASE_LAT  =  31.7
    BASE_LON  = -116.6

    def __init__(self):
        self._t        = 0.0           # elapsed seconds
        self._distance = 0.0
        self._speed    = 0.0           # m/s
        self._motor_rpm = 0.0
        self._lat      = self.BASE_LAT
        self._lon      = self.BASE_LON
        self._alt      = 850.0        # metres above sea level

        # slow-drift state for temperature
        self._cvt_temp = 80.0         # °C

    def step(self, dt: float):
        self._t += dt

        # --- speed: sinusoidal "accelerate / brake" cycle ----
        # target speed oscillates between ~5 and ~28 m/s (~18–100 km/h)
        target = 16.0 + 12.0 * math.sin(self._t * 0.07)
        self._speed += (target - self._speed) * min(dt * 0.8, 1.0)
        self._speed = max(0.0, self._speed)

        # --- distance ---
        self._distance += self._speed * dt

        # --- motor rpm: loosely coupled to speed ---
        self._motor_rpm = self._speed * 120 + random.gauss(0, 30)
        self._motor_rpm = max(0, self._motor_rpm)

        # --- GPS: fake straight-ish track drifting north-east ---
        self._lat += self._speed * dt * 1e-5 + random.gauss(0, 1e-6)
        self._lon += self._speed * dt * 5e-6 + random.gauss(0, 1e-6)
        self._alt  = 850.0 + 10.0 * math.sin(self._t * 0.02) + random.gauss(0, 0.3)

        # --- CVT temperature: rises with speed, slow decay ---
        heat = (self._speed / 30.0) * 0.2
        self._cvt_temp += (heat - 0.02) * dt
        self._cvt_temp = max(70.0, min(140.0, self._cvt_temp))

    # ---- sensor readouts ----

    def wheel_rpm(self) -> list[float]:
        base = self._speed * 60 / (math.pi * 0.28)      # ~28 cm radius wheel
        noise = lambda: random.gauss(0, 2)
        return [base + noise(), base + noise(), base * 0.98 + noise()]

    def car_state(self) -> list[float]:
        return [self._distance, self._speed]

    def motor_rpm(self) -> list[float]:
        return [self._motor_rpm]

    def imu_rotation(self) -> list[float]:
        # gentle yaw oscillation, tiny pitch/roll from terrain
        yaw   =  5.0 * math.sin(self._t * 0.3)
        pitch =  1.5 * math.sin(self._t * 1.1) + random.gauss(0, 0.3)
        roll  =  2.0 * math.sin(self._t * 0.7) + random.gauss(0, 0.3)
        return [pitch, roll, yaw]

    def imu_acceleration(self) -> list[float]:
        ax = random.gauss(0, 0.4)
        ay = random.gauss(0, 0.4)
        az = 9.81 + random.gauss(0, 0.1)
        return [ax, ay, az]

    def brake_pressure(self) -> list[float]:
        # occasional braking events
        p = max(0.0, -math.sin(self._t * 0.07) * 15.0)
        return [p + random.gauss(0, 0.3), p * 0.9 + random.gauss(0, 0.2)]

    def shock_displacement(self) -> list[float]:
        base = 50.0 + 5.0 * math.sin(self._t * 2.3)
        return [base + random.gauss(0, 1) for _ in range(4)]

    def cvt_temperature(self) -> list[float]:
        return [self._cvt_temp + random.gauss(0, 0.2)]

    def gps_position(self) -> list[float]:
        return [self._lon, self._lat, self._alt]


# ---------------------------------------------------------------------------
# Mock reader — drop-in replacement for SerialReader
# ---------------------------------------------------------------------------

class MockSerialReader:
    """
    Generates fake packets at `hz` Hz.
    Presents the same interface as SerialReader so the SSE handler is unchanged.
    """

    def __init__(self, hz: float = 10.0):
        self._hz      = hz
        self._sim     = CarSimulator()
        self._running = False
        self._latest_packet = bytearray()
        self._packet_event  = threading.Event()

    def packets(self):
        if not self._running:
            self._running = True
            t = threading.Thread(target=self._producer, daemon=True)
            t.start()

        while True:
            self._packet_event.wait()
            self._packet_event.clear()
            yield self._latest_packet

    def _producer(self):
        interval = 1.0 / self._hz
        t0 = time.time()
        tick = 0

        while True:
            tick += 1
            target_time = t0 + tick * interval
            sleep_for = target_time - time.time()
            if sleep_for > 0:
                time.sleep(sleep_for)

            dt = interval
            self._sim.step(dt)
            ts = float(time.time() - t0)

            frames = self._build_frames(ts)
            raw    = build_packet(frames, rssi=random.randint(-80, -40))
            self._latest_packet = bytearray(raw[:-4])
            self._packet_event.set()

    def _build_frames(self, ts: float) -> list[bytes]:
        sim = self._sim
        return [
            build_frame(DataType.WHEEL_RPM,          ts, sim.wheel_rpm()),
            build_frame(DataType.CAR_STATE,          ts, sim.car_state()),
            build_frame(DataType.MOTOR_RPM,          ts, sim.motor_rpm()),
            build_frame(DataType.IMU_ROTATION,       ts, sim.imu_rotation()),
            build_frame(DataType.IMU_ACCELERATION,   ts, sim.imu_acceleration()),
            build_frame(DataType.BRAKE_PRESSURE,     ts, sim.brake_pressure()),
            build_frame(DataType.SHOCK_DISPLACEMENT, ts, sim.shock_displacement()),
            build_frame(DataType.CVT_TEMPERATURE,    ts, sim.cvt_temperature()),
            build_frame(DataType.GPS_POSITION,       ts, sim.gps_position()),
        ]


# ---------------------------------------------------------------------------
# Packet parser (copied verbatim from the real server)
# ---------------------------------------------------------------------------

class PacketError(Exception):
    pass

class PacketParser:
    def parse(self, packet: bytearray) -> list[dict]:
        if len(packet) < PACKET_HEADER_SIZE:
            raise PacketError(f"Packet too short: {len(packet)} bytes")

        header = packet[0]
        rssi   = int.from_bytes(packet[1:2], byteorder="big", signed=True)

        if len(packet) == 3:
            return [{"header": header, "rssi": rssi}]

        return [
            {"header": header, "rssi": rssi, **frame}
            for frame in self._iter_frames(packet, offset=PACKET_HEADER_SIZE)
        ]

    def _iter_frames(self, packet: bytearray, offset: int):
        while offset < len(packet):
            if offset + FRAME_HEADER_SIZE > len(packet):
                raise PacketError(f"Truncated frame header at offset {offset}")

            raw_id    = packet[offset]
            timestamp = struct.unpack_from("<f", packet, offset + 1)[0]
            length    = packet[offset + 5]

            try:
                data_type = DataType(raw_id)
            except ValueError:
                raise PacketError(f"Unknown data type 0x{raw_id:02X} at offset {offset}")

            fields          = FRAME_FIELDS[data_type]
            expected_length = len(fields) * 4
            if length != expected_length:
                raise PacketError(
                    f"{data_type.name}: expected {expected_length} bytes, got {length}"
                )

            payload_start = offset + FRAME_HEADER_SIZE
            payload_end   = payload_start + length
            if payload_end > len(packet):
                raise PacketError(f"Truncated payload for {data_type.name}")

            if data_type == DataType.ERRORS:
                values = struct.unpack_from("<I", packet, payload_start)
            else:
                values = struct.unpack_from(f"<{len(fields)}f", packet, payload_start)

            yield {"ts": timestamp, **dict(zip(fields, values))}
            offset = payload_end


# ---------------------------------------------------------------------------
# SSE HTTP server (identical to the real one)
# ---------------------------------------------------------------------------

class SSEHandler(BaseHTTPRequestHandler):
    serial_reader: MockSerialReader = None
    packet_parser: PacketParser     = None

    def log_message(self, fmt, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

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
        self._cors()
        self.end_headers()

        try:
            for packet in self.serial_reader.packets():
                for point in self.packet_parser.parse(packet):
                    self._emit(point)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _emit(self, point: dict):
        self.wfile.write(f"data: {json.dumps(point)}\n\n".encode())
        self.wfile.flush()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Mock SSE server — no hardware needed.")
    ap.add_argument("--port", type=int,   default=8000, help="HTTP port (default 8000)")
    ap.add_argument("--hz",   type=float, default=10.0, help="Packets per second (default 10)")
    args = ap.parse_args()

    reader = MockSerialReader(hz=args.hz)
    parser = PacketParser()

    SSEHandler.serial_reader = reader
    SSEHandler.packet_parser = parser

    server = ThreadingHTTPServer(("localhost", args.port), SSEHandler)
    url    = f"http://localhost:{args.port}/stream"
    print(f"Mock SSE server running at {url}  ({args.hz} Hz)")
    print("Press Ctrl-C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()