// Voice-to-text via the LOCAL faster-whisper service (127.0.0.1:3178).
// The browser captures PCM directly (no MediaRecorder/webm — Chrome's
// AudioContext can't decode webm, which caused "unable to decode audio data"),
// resamples to 16 kHz mono at capture time, and sends base64 — audio never
// leaves the machine (same philosophy as the BYOK relay).
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
  let ctx: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let processor: ScriptProcessorNode | null = null;
  let sink: MediaStreamAudioDestinationNode | null = null;
  let stream: MediaStream | null = null;
  let actualRate = TARGET_RATE;
  const chunks: Int16Array[] = [];
  let stopped = false;

  const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ctx = new AudioContext({ sampleRate: TARGET_RATE });
    actualRate = ctx.sampleRate; // some browsers clamp to 44.1k/48k
    source = ctx.createMediaStreamSource(stream);
    processor = ctx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      // resample to 16 kHz if the context rate got clamped
      if (actualRate !== TARGET_RATE) {
        const step = actualRate / TARGET_RATE;
        const outLen = Math.ceil(data.length / step);
        const out = new Int16Array(outLen);
        for (let i = 0; i < outLen; i++) {
          const pos = i * step;
          const i0 = Math.floor(pos);
          const i1 = Math.min(i0 + 1, data.length - 1);
          const frac = pos - i0;
          const v = data[i0] * (1 - frac) + data[i1] * frac;
          out[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
        }
        chunks.push(out);
        return;
      }
      const int16 = new Int16Array(data.length);
      for (let i = 0; i < data.length; i++) {
        int16[i] = Math.max(-1, Math.min(1, data[i])) * 0x7fff;
      }
      chunks.push(int16);
    };
    // sink instead of ctx.destination — the mic must NOT play back through speakers
    sink = ctx.createMediaStreamDestination();
    source.connect(processor);
    processor.connect(sink);
  };

  const ready = init();

  const cleanup = () => {
    processor?.disconnect();
    source?.disconnect();
    sink?.disconnect();
    stream?.getTracks().forEach((t) => t.stop());
    void ctx?.close();
  };

  return {
    stop: async () => {
      if (stopped) return "";
      stopped = true;
      await ready;
      // give the processor a beat to flush the tail
      await new Promise((r) => setTimeout(r, 250));
      const total = chunks.reduce((n, c) => n + c.length, 0);
      if (!total) return "";
      const out = new Int16Array(total);
      let off = 0;
      for (const c of chunks) {
        out.set(c, off);
        off += c.length;
      }
      cleanup();
      return transcribe(out);
    },
    cancel: () => {
      stopped = true;
      cleanup();
    },
  };
}

async function transcribe(pcm: Int16Array): Promise<string> {
  const res = await fetch(STT + "/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio: b64FromBytes(pcm), language: "en" }),
    signal: AbortSignal.timeout(60000),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || `stt ${res.status}`);
  return (data.text ?? "").trim();
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
