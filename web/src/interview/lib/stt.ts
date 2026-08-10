// Voice-to-text via the LOCAL faster-whisper service (127.0.0.1:3178).
// The browser records, decodes to 16 kHz mono PCM, and sends base64 — audio
// never leaves the machine (same philosophy as the BYOK relay).
const STT = "http://127.0.0.1:3178";
const TARGET_RATE = 16000;

export async function sttHealth(): Promise<boolean> {
  try {
    const r = await fetch(STT + "/health", { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

/** Records until stop() is called, then returns the transcript. */
export function startRecording(): {
  stop: () => Promise<string>;
  cancel: () => void;
} {
  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let stopped = false;
  let resolveStop: (() => void) | null = null;

  const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = () => resolveStop?.();
    mediaRecorder.start();
    return () => {
      const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || "audio/webm" });
      mediaRecorder?.stop();
      return blob;
    };
  };

  const blobPromise = init();

  return {
    stop: async () => {
      if (stopped) return "";
      stopped = true;
      const getBlob = await blobPromise;
      const blob = getBlob();
      stream?.getTracks().forEach((t) => t.stop());
      const done = new Promise<void>((res) => (resolveStop = res));
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        await done;
      }
      return transcribe(blob);
    },
    cancel: () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    },
  };
}

async function transcribe(blob: Blob): Promise<string> {
  // decode (any format the browser recorded) → resample → PCM16 base64
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
  const pcm = toPcm16(buffer);
  ctx.close();
  const b64 = b64FromBytes(pcm);
  const res = await fetch(STT + "/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio: b64, language: "en" }),
    signal: AbortSignal.timeout(60000),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || `stt ${res.status}`);
  return (data.text ?? "").trim();
}

function toPcm16(buffer: AudioBuffer): Int16Array {
  const src = buffer.getChannelData(0);
  const srcRate = buffer.sampleRate;
  const outLen = Math.ceil((src.length * TARGET_RATE) / srcRate);
  const out = new Int16Array(outLen);
  const step = srcRate / TARGET_RATE;
  for (let i = 0; i < outLen; i++) {
    const pos = i * step;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, src.length - 1);
    const frac = pos - i0;
    const v = src[i0] * (1 - frac) + src[i1] * frac;
    out[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
  }
  return out;
}

function b64FromBytes(arr: Int16Array): string {
  const bytes = new Uint8Array(arr.buffer);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}
