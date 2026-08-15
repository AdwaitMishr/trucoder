// Client for the local BYOK relay (http://127.0.0.1:3177).
// The key never enters the browser DOM beyond the settings input — the relay
// stores it locally and injects it into upstream calls.
const RELAY = "http://127.0.0.1:3177";

async function j(method: string, path: string, body?: unknown) {
  const res = await fetch(RELAY + path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `relay ${res.status}`;
    try {
      const d = await res.json();
      if (d.error) msg = d.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export const relay = {
  health: () => j("GET", "/health") as Promise<{ ok: boolean; hasKey: boolean }>,
  hasKey: () => j("GET", "/key") as Promise<{ hasKey: boolean }>,
  saveKey: (key: string) => j("PUT", "/key", { key }) as Promise<{ ok: boolean }>,
  deleteKey: () => j("DELETE", "/key") as Promise<{ ok: boolean }>,
  models: () => j("GET", "/v1/models") as Promise<{ data: { id: string }[] }>,
  /** OpenAI-compatible streaming chat call. */
  streamChat: async (
    model: string,
    messages: { role: string; content: string }[],
    onDelta: (text: string) => void,
    signal?: AbortSignal
  ): Promise<string> => {
    // never hang forever: 3-minute cap, merged with any caller abort
    const timeout = AbortSignal.timeout(180000);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let res: Response;
    try {
      res = await fetch(RELAY + "/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true }),
        signal: combined,
      });
    } catch (e) {
      throw new Error("relay unreachable: " + (e instanceof Error ? e.message : String(e)));
    }
    if (!res.ok || !res.body) {
      let msg = `relay ${res.status}`;
      try {
        const d = await res.json();
        if (d.error) msg = typeof d.error === "string" ? d.error : JSON.stringify(d.error);
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // SSE lines: "data: {...}"
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const payload = t.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const chunk = JSON.parse(payload);
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          /* skip malformed */
        }
      }
    }
    return full;
  },
};
