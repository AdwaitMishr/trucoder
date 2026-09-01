// Shared, free-only OpenRouter access (browser-direct, no server).
// The shared key is bundled at build time (web/.env -> VITE_OPENROUTER_SHARED_KEY,
// gitignored). This is the "everyone can use it" path: model picker + requests
// are restricted to OpenRouter's :free models.
export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export const sharedKey = import.meta.env.VITE_OPENROUTER_SHARED_KEY as string | undefined;

/** Curated fallback list of known OpenRouter free models (used if the live
 *  /models fetch is unreachable — e.g. an offline/flaky network). */
const FREE_FALLBACK: string[] = [
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "minimax/minimax-m3:free",
  "minimax/minimax-m2.7:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "cohere/north-mini-code:free",
  "liquid/lfm-2.5-2.6b:free",
  "thinkingmachines/inkling:free",
].sort();

/** Fetch OpenRouter's models, returning only the free (":free") ones. */
export async function freeModels(): Promise<string[]> {
  try {
    const r = await fetch(`${OPENROUTER_BASE}/models`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return FREE_FALLBACK;
    const d = (await r.json()) as { data?: { id: string }[] };
    const list = (d.data ?? [])
      .map((m) => m.id)
      .filter((id) => id.endsWith(":free"))
      .sort();
    return list.length > 0 ? list : FREE_FALLBACK;
  } catch {
    return FREE_FALLBACK;
  }
}

export function isFreeModel(id: string): boolean {
  return id.endsWith(":free");
}

/** OpenAI-SSE streaming chat to OpenRouter. Free-model ids only — enforced here
 *  regardless of what the UI offers, so the shared bundle can't send paid ids. */
export async function openrouterStreamChat(
  model: string,
  messages: { role: string; content: string }[],
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  if (!isFreeModel(model)) throw new Error(`model not allowed for shared free tier: ${model}`);
  const key = sharedKey;
  if (!key) throw new Error("no shared OpenRouter key configured — bring your own key instead");
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });
  if (!res.ok || !res.body) {
    let msg = `openrouter ${res.status}`;
    try {
      const d = (await res.json()) as { error?: unknown };
      if (d.error) msg = typeof d.error === "string" ? d.error : JSON.stringify(d.error);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const chunk = JSON.parse(payload) as {
          choices?: { delta?: { content?: string | null } }[];
        };
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        /* ignore partial */
      }
    }
  }
  return full;
}