#!/usr/bin/env python3
"""
Generates a JSON stream of simple time series data.

Modes:
  stdout      — print NDJSON to stdout (original behaviour)
  serve       — run an SSE HTTP server at http://localhost:<port>/stream
"""

import json
import time
import math
import random
import argparse
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


# ---------------------------------------------------------------------------
# Data generation
# ---------------------------------------------------------------------------


def generate_datapoint(t: float, noise: float = 0.5) -> dict:
    """Generate a single time series data point."""
    timestamp = datetime.fromtimestamp(t, tz=timezone.utc).isoformat()
    value = (
        10.0
        + 5.0 * math.sin(2 * math.pi * t / 60)  # 60-second sine wave
        + 2.0 * math.cos(2 * math.pi * t / 15)  # 15-second cosine wave
        + random.gauss(0, noise)  # Gaussian noise
    )
    return {
        "timestamp": timestamp,
        "value": round(value, 4),
        "epoch": round(t, 3),
        "data_origin": random.randint(1, 10),
    }


# ---------------------------------------------------------------------------
# Stdout streaming (original behaviour)
# ---------------------------------------------------------------------------


def stream_historical_stdout(start: float, end: float, interval: float):
    t = start
    while t <= end:
        print(json.dumps(generate_datapoint(t)), flush=True)
        t += interval


def stream_live_stdout(interval: float, duration: float | None):
    start = time.time()
    while True:
        print(json.dumps(generate_datapoint(time.time())), flush=True)
        if duration and (time.time() - start) >= duration:
            break
        time.sleep(interval)


# ---------------------------------------------------------------------------
# SSE server
# ---------------------------------------------------------------------------


def make_handler(args):
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
                if args.mode == "historical":
                    end_t = time.time()
                    start_t = end_t - args.interval * (args.points - 1)
                    t = start_t
                    while t <= end_t:
                        emit(generate_datapoint(t))
                        t += args.interval
                else:  # live
                    stream_start = time.time()
                    while True:
                        emit(generate_datapoint(time.time()))
                        if (
                            args.duration
                            and (time.time() - stream_start) >= args.duration
                        ):
                            break
                        time.sleep(args.interval)
            except (BrokenPipeError, ConnectionResetError):
                pass  # client disconnected — that's fine

    return SSEHandler


def run_server(args):
    host = "localhost"
    port = args.port
    handler = make_handler(args)
    server = ThreadingHTTPServer((host, port), handler)
    print(f"SSE server running at http://{host}:{port}/stream")
    print("Press Ctrl-C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Stream time series data as NDJSON (stdout) or SSE (HTTP server)."
    )
    parser.add_argument(
        "--serve",
        action="store_true",
        help="Run as an SSE HTTP server instead of printing to stdout",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port for the SSE server (default: 8000, only used with --serve)",
    )
    parser.add_argument(
        "--mode",
        choices=["historical", "live"],
        default="live",
        help="historical: emit past data instantly | live: emit in real time (default: live)",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=(1 / 30),
        help="Seconds between data points (default: 1.0)",
    )
    parser.add_argument(
        "--points",
        type=int,
        default=100,
        help="Number of historical data points to generate (default: 100)",
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=None,
        help="How many seconds to stream in live mode (default: run forever)",
    )
    parser.add_argument(
        "--noise",
        type=float,
        default=0.5,
        help="Standard deviation of Gaussian noise (default: 0.5)",
    )
    args = parser.parse_args()

    random.seed(42)

    if args.serve:
        run_server(args)
    elif args.mode == "historical":
        end_time = time.time()
        start_time = end_time - args.interval * (args.points - 1)
        stream_historical_stdout(start_time, end_time, args.interval)
    else:
        stream_live_stdout(args.interval, args.duration)


if __name__ == "__main__":
    main()
