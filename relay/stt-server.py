#!/usr/bin/env python3
"""Local speech-to-text for the interview feature.

A tiny HTTP service (127.0.0.1:3178) that runs faster-whisper locally:
the browser records audio, decodes it to 16 kHz mono PCM, sends it here
as base64, and gets back plain text. No audio ever leaves the machine.

Run:  relay/stt-venv/bin/python relay/stt-server.py   (or: npm run stt)
"""
import base64
import io
import json
import os
import sys
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MODEL_SIZE = "base"  # small = more accurate, slower; base = good + fast
PORT = 3178
# ~30 minutes of 16 kHz mono PCM (32 KB/s) — anything larger is junk or abuse
MAX_BODY = 32 * 1024 * 1024

from faster_whisper import WhisperModel  # noqa: E402

model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

# Only the app (3001) and the vite dev server (5173) may call the STT
# service; anything else (another localhost page, a DNS-rebinding attacker)
# is rejected before any work happens.
APP_ORIGIN = os.environ.get("APP_ORIGIN", "http://localhost:3001")
ALLOWED_ORIGINS = {
    APP_ORIGIN,
    APP_ORIGIN.replace("://localhost:", "://127.0.0.1:"),
    APP_ORIGIN.replace("://127.0.0.1:", "://localhost:"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")

    def _origin_allowed(self) -> bool:
        origin = self.headers.get("Origin", "")
        # no Origin (curl, tests) = local by construction
        return not origin or origin in ALLOWED_ORIGINS

    def _reject(self, code: int, message: str):
        body = json.dumps({"error": message}).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")  # body may be unread — no keep-alive
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):  # keep the console quiet
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if not self._origin_allowed():
            return self._reject(403, "origin not allowed")
        if self.path == "/health":
            body = json.dumps({"ok": True, "model": MODEL_SIZE}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._cors()
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if not self._origin_allowed():
            return self._reject(403, "origin not allowed")
        if self.path != "/transcribe":
            self.send_response(404)
            self.end_headers()
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self._reject(400, "bad content-length")
        if length <= 0 or length > MAX_BODY:
            return self._reject(413, "payload too large")
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw)
            audio_b64 = payload.get("audio", "")
            language = payload.get("language", "en")
            pcm = base64.b64decode(audio_b64)
            # expect raw signed 16-bit LE PCM, 16 kHz, mono
            with io.BytesIO() as buf:
                with wave.open(buf, "wb") as w:
                    w.setnchannels(1)
                    w.setsampwidth(2)
                    w.setframerate(16000)
                    w.writeframes(pcm)
                wave_bytes = buf.getvalue()
            segments, info = model.transcribe(
                io.BytesIO(wave_bytes),
                language=language,
                beam_size=5,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 400},
            )
            text = "".join(seg.text for seg in segments).strip()
            body = json.dumps({"text": text}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._cors()
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:  # noqa: BLE001
            body = json.dumps({"error": str(e)}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._cors()
            self.end_headers()
            self.wfile.write(body)


if __name__ == "__main__":
    print(f"[stt] loading faster-whisper '{MODEL_SIZE}'…", flush=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"[stt] listening on http://127.0.0.1:{PORT} (local only)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)
