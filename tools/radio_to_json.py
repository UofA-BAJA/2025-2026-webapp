
#!/usr/bin/env python3
"""
Generates a JSON stream of simple time series data.

Modes:
  stdout      — print NDJSON to stdout (original behaviour)
  serve       — run an SSE HTTP server at http://localhost:<port>/stream
"""

import json
import time
import argparse
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import struct

import serial

# ---------------------------------------------------------------------------
# SSE server
# ---------------------------------------------------------------------------


def make_handler(args, ser):
    """Return an HTTP request handler class closed over CLI args."""

    class SSEHandler(BaseHTTPRequestHandler):

        def log_message(self, format, *a):
            # Suppress per-request noise; keep it clean.
            pass

        def send_cors_headers(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

        def do_OPTIONS(self):
            # Pre-flight CORS request from the browser.
            self.send_response(204)
            self.send_cors_headers()
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
            self.send_header("X-Accel-Buffering", "no")  # disable nginx buffering
            self.send_cors_headers()
            self.end_headers()

            def emit(point: dict):
                """Write one SSE event to the response."""
                line = f"data: {json.dumps(point)}\n\n"
                self.wfile.write(line.encode())
                self.wfile.flush()

            try:
                
                    prev_4 = 0x00000000

                    # Phase 1: Find first delimeter
                    while True:
                        if ser.in_waiting > 0:
                            byte = ser.read(1)[0]

                            prev_4 = (prev_4 << 8) | byte
                            prev_4 &= 0xFFFFFFFF

                            if prev_4 == 0xAAAAAAAA:
                                # Found first delimeter!
                                break

                    packet = bytearray()

                    # Phase 2: Read data
                    while True:
                        if ser.in_waiting > 0:
                            byte = ser.read(1)[0]


                            packet.append(byte)

                            prev_4 = (prev_4 << 8) | byte
                            prev_4 &= 0xFFFFFFFF

                            if prev_4 == 0xAAAAAAAA:
                                packet = packet[:-4]
                                # Packet complete: parse it and convert to JSON
                                json_data = parse_packet(packet)

                                for entry in json_data:
                                    emit(entry)
                                # Send json over web socket

                                packet = bytearray()



            except (BrokenPipeError, ConnectionResetError):
                pass  # client disconnected — that's fine

    return SSEHandler


def run_server(args, ser):
    host = "localhost"
    port = args.port
    handler = make_handler(args, ser)
    server = ThreadingHTTPServer((host, port), handler)
    print(f"SSE server running at http://{host}:{port}/stream")
    print("Press Ctrl-C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


def parse_packet(packet):


    header = packet[0]
    rssi = int.from_bytes(packet[1:2], byteorder='big', signed=True)
    if(len(packet) == 3):
        return [{
            "header": header,
            "rssi": rssi
        }]

    json_arr = []

    frame_start = 3
    while (frame_start < len(packet)):
        id = packet[frame_start]
        ts = struct.unpack('<f', packet[frame_start + 1: frame_start + 5])[0]
        length = packet[frame_start + 5]

        data = []
        frame_increment = 0
        for i in range((length // 4)):
            idx = frame_start + 6 + (4 * i)
            data.append(struct.unpack('<f', packet[idx: idx + 4])[0])
            frame_increment += 4

        frame_start += 1
        frame_start += 4
        frame_start += 1
        frame_start += frame_increment

        json_arr.append({
            "header": header,
            "rssi": rssi,
            "type": id,
            "ts": ts,
            "data": data
            })

    return json_arr



def read_port(ser):

    prev_4 = 0x00000000

    # Phase 1: Find first delimeter
    while True:
        if ser.in_waiting > 0:
            byte = ser.read(1)[0]

            prev_4 = (prev_4 << 8) | byte
            prev_4 &= 0xFFFFFFFF

            if prev_4 == 0xAAAAAAAA:
                # Found first delimeter!
                break

    packet = bytearray()

    # Phase 2: Read data
    while True:
        if ser.in_waiting > 0:
            byte = ser.read(1)[0]


            packet.append(byte)

            prev_4 = (prev_4 << 8) | byte
            prev_4 &= 0xFFFFFFFF

            if prev_4 == 0xAAAAAAAA:
                packet = packet[:-4]
                # Packet complete: parse it and convert to JSON
                json = parse_packet(packet)

                # Send json over web socket

                packet = bytearray()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Stream time series data as NDJSON (stdout) or SSE (HTTP server)."
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port for the SSE server (default: 8000, only used with --serve)",
    )
    parser.add_argument(
        "--serial_port",
        type=str,
        default="/dev/ttyUSB0",
    )
    args = parser.parse_args()

    ser = serial.Serial(args.serial_port, 115200, timeout=1)
    time.sleep(2)

    run_server(args, ser)



if __name__ == "__main__":
    main()
