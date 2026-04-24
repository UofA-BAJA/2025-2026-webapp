#!/usr/bin/env python3
"""
Mock SSE server that emits data in the same format as the real hardware parser.

Each SSE event is one frame:
  { "header": int, "rssi": int, "type": int, "ts": float, "data": [float] }

The server sends a small burst of frames per tick (like a real packet containing
multiple frames), which matches the behaviour you saw in the logs — one "match"
log followed by several data-count logs.
"""

import json
import math
import random
import time
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


# ---------------------------------------------------------------------------
# Data generation  
# ---------------------------------------------------------------------------

# Mirrors the two data types the real hardware sends most often.
DATA_TYPES = [8, 8, 8, 2]  # weighted: ~75% type 8, ~25% type 2

# Each type has its own simulated signal so the charts look distinct.
_SIGNALS = {
    8: lambda t: 20.0 + 8.0 * math.sin(2 * math.pi * t / 40) + random.gauss(0, 0.4),
    2: lambda t: 5.0  + 3.0 * math.cos(2 * math.pi * t / 20) + random.gauss(0, 0.2),
}

# ts is a monotonically increasing float (seconds since boot), matching the
# microcontroller's HAL_GetTick() / 1000.0 style timestamp — NOT a wall-clock
# ISO string.  ECharts xAxis { type: "value" } handles this correctly.
_boot_time = time.time()

def elapsed() -> float:
    return round(time.time() - _boot_time, 3)


def generate_frame(data_type: int) -> dict:
    ts = elapsed()
    value = _SIGNALS[data_type](ts)
    return {
        "header": 1,
        "rssi": random.randint(-60, -20),
        "type": data_type,
        "ts": ts,
        "data": [round(value, 4)],
    }


def generate_packet() -> list[dict]:
    """
    Simulate one hardware packet: 2-4 frames, mixed types, same timestamp
    window — mirrors what parse_packet() yields per delimiter boundary.
    """
    frames_per_packet = random.randint(2, 4)
    return [generate_frame(random.choice(DATA_TYPES)) for _ in range(frames_per_packet)]


# ---------------------------------------------------------------------------
# SSE server
# ---------------------------------------------------------------------------

def make_handler(args):

    class SSEHandler(BaseHTTPRequestHandler):

        def log_message(self, fmt, *a):
            pass  # suppress per-request noise

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
                line = f"data: {json.dumps(frame)}\n\n"
                self.wfile.write(line.encode())
                self.wfile.flush()

            try:
                while True:
                    for frame in generate_packet():
                        emit(frame)
                    time.sleep(args.interval)
            except (BrokenPipeError, ConnectionResetError):
                pass  # client disconnected

    return SSEHandler


def run_server(args):
    handler = make_handler(args)
    server = ThreadingHTTPServer(("localhost", args.port), handler)
    print(f"Mock SSE server → http://localhost:{args.port}/stream")
    print(f"Packet rate: one burst every {args.interval}s  |  Ctrl-C to stop")
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
    parser.add_argument(
        "--interval",
        type=float,
        default=1 / 10,  # 10 packets/sec → ~30 frames/sec total
        help="Seconds between packets (default: 0.1)",
    )
    args = parser.parse_args()
    random.seed()  # unseeded so each run looks different
    run_server(args)


if __name__ == "__main__":
    main()