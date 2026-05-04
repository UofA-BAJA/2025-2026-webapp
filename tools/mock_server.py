#!/usr/bin/env python3
"""
Mock SSE server that emits data matching the refactored DATA_TYPE_MAP.

Frame format:
  { "header": int, "rssi": int, "type": int, "ts": float, "data": [float, ...] }

Scalar types  → data is a 1-element list  (fieldIndex 0)
Struct types  → data is a multi-element list, one entry per struct field:
    IMU_ROTATION     (0x04) → [rotationX, rotationY, rotationZ]
    IMU_ACCELERATION (0x05) → [accelX,    accelY,    accelZ   ]
    GPS_POSITION     (0x10) → [latitude,  longitude            ]
"""

import json
import math
import random
import time
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ---------------------------------------------------------------------------
# Signal definitions — mirrors DATA_TYPE_MAP in dataTypes.ts
# ---------------------------------------------------------------------------

_boot_time = time.time()

def t() -> float:
    return time.time() - _boot_time

from collections.abc import Callable

DATA_SOURCES: dict[int, Callable[[float], list[float]]] = {

    # WHEEL_RPM (0x01) → [wheel_rpm_front_left, wheel_rpm_front_right, wheel_rpm_rear]
    0x01: lambda t: [
        round(300 + 120 * math.sin(2 * math.pi * t / 30) + random.gauss(0, 2), 3),    # wheel_rpm_front_left
        round(298 + 118 * math.sin(2 * math.pi * t / 30) + random.gauss(0, 2), 3),    # wheel_rpm_front_right
        round(295 + 115 * math.sin(2 * math.pi * t / 30) + random.gauss(0, 2), 3),    # wheel_rpm_rear
    ],

    # CAR_STATE (0x02) → [car_state_distance, car_state_speed]
    0x02: lambda t: [
        round(t * 5.0, 3),                                                              # car_state_distance
        round(5.0 + 3.0 * math.cos(2 * math.pi * t / 20) + random.gauss(0, 0.2), 3),  # car_state_speed
    ],

    # MOTOR_RPM (0x03) → [motor_rpm]
    0x03: lambda t: [
        round(280 + 100 * math.sin(2 * math.pi * t / 25) + random.gauss(0, 3), 3),    # motor_rpm
    ],

    # IMU_ROTATION (0x04) → [imu_rotation_x, imu_rotation_y, imu_rotation_z]
    0x04: lambda t: [
        round(15.0 * math.sin(2 * math.pi * t / 10) + random.gauss(0, 0.2), 4),       # imu_rotation_x
        round(10.0 * math.cos(2 * math.pi * t / 14) + random.gauss(0, 0.2), 4),       # imu_rotation_y
        round( 5.0 * math.sin(2 * math.pi * t /  7) + random.gauss(0, 0.1), 4),       # imu_rotation_z
    ],

    # IMU_ACCELERATION (0x05) → [imu_acceleration_x, imu_acceleration_y, imu_acceleration_z]
    0x05: lambda t: [
        round(0.1  * math.sin(2 * math.pi * t / 5)  + random.gauss(0, 0.05), 4),      # imu_acceleration_x
        round(0.1  * math.cos(2 * math.pi * t / 5)  + random.gauss(0, 0.05), 4),      # imu_acceleration_y
        round(9.81 + 0.05 * math.sin(2 * math.pi * t / 3) + random.gauss(0, 0.02), 4),# imu_acceleration_z
    ],

    # BRAKE_PRESSURE (0x06) → [brake_pressure_front, brake_pressure_rear]
    0x06: lambda t: [
        round(2.5 + 1.0 * math.sin(2 * math.pi * t / 15) + random.gauss(0, 0.1), 3), # brake_pressure_front
        round(2.3 + 0.9 * math.sin(2 * math.pi * t / 15) + random.gauss(0, 0.1), 3), # brake_pressure_rear
    ],

    # SHOCK_DISPLACEMENT (0x07) → [shock_displacement_front_left, shock_displacement_front_right, shock_displacement_rear]
    0x07: lambda t: [
        round(10.0 + 4.0 * math.sin(2 * math.pi * t / 18) + random.gauss(0, 0.3), 3),# shock_displacement_front_left
        round( 9.8 + 3.8 * math.sin(2 * math.pi * t / 18) + random.gauss(0, 0.3), 3),# shock_displacement_front_right
        round( 9.5 + 3.5 * math.sin(2 * math.pi * t / 18) + random.gauss(0, 0.3), 3),# shock_displacement_rear
    ],

    # CVT_TEMPERATURE (0x08) → [cvt_temperature]
    0x08: lambda t: [
        round(20.0 + 8.0 * math.sin(2 * math.pi * t / 40) + random.gauss(0, 0.4), 3),# cvt_temperature
    ],

    # GPS_POSITION (0x09) → [gps_longitude, gps_latitude, gps_altitude]
    0x09: lambda t: [
        round(-122.4194 + 0.0001 * math.cos(2 * math.pi * t / 60), 6),                # gps_longitude
        round(  37.7749 + 0.0001 * math.sin(2 * math.pi * t / 60), 6),                # gps_latitude
        round( 100.0    + 2.0    * math.sin(2 * math.pi * t / 90) + random.gauss(0, 0.1), 3), # gps_altitude
    ],

    # ERRORS (0xAA) → [error_code]
    0xAA: lambda t: [0.0],                                                             # error_code
}

# Weighted pool — rotation and temp are the most frequent, matching real hardware
_TYPE_POOL = [
    0x04, 0x04, 0x04,   # IMU_ROTATION  (highest priority — 3 charts default to this)
    0x08,               # CVT_TEMPERATURE
    0x02,               # CAR_SPEED
    0x05,               # IMU_ACCELERATION
    0x01,               # WHEEL_RPM
]


def elapsed() -> float:
    return round(t(), 3)


def generate_frame(type_code: int) -> dict:
    ts = elapsed()
    return {
        "header": 1,
        "rssi": random.randint(-60, -20),
        "type": type_code,
        "ts": ts,
        "data": DATA_SOURCES[type_code](ts),
    }


def generate_packet() -> list[dict]:
    """2–4 frames per packet, mirroring a real hardware burst."""
    return [generate_frame(random.choice(_TYPE_POOL)) for _ in range(random.randint(2, 4))]


# ---------------------------------------------------------------------------
# SSE server (unchanged from original)
# ---------------------------------------------------------------------------

def make_handler(args):

    class SSEHandler(BaseHTTPRequestHandler):

        def log_message(self, fmt, *a):
            pass

        def send_cors_headers(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

        def do_OPTIONS(self):
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
            self.send_header("X-Accel-Buffering", "no")
            self.send_cors_headers()
            self.end_headers()

            def emit(frame: dict):
                self.wfile.write(f"data: {json.dumps(frame)}\n\n".encode())
                self.wfile.flush()

            try:
                while True:
                    for frame in generate_packet():
                        emit(frame)
                    time.sleep(args.interval)
            except (BrokenPipeError, ConnectionResetError):
                pass

    return SSEHandler


def run_server(args):
    handler = make_handler(args)
    server = ThreadingHTTPServer(("localhost", args.port), handler)
    print(f"Mock SSE server → http://localhost:{args.port}/stream")
    print(f"Packet rate : one burst every {args.interval}s  |  Ctrl-C to stop")
    print(f"Active types: { {hex(k) for k in DATA_SOURCES} }")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Mock hardware SSE stream.")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--interval", type=float, default=1 / 10,
                        help="Seconds between packets (default: 0.1)")
    args = parser.parse_args()
    random.seed()
    run_server(args)


if __name__ == "__main__":
    main()