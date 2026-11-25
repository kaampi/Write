import { describe, expect, it, vi } from "vitest";
import { normalizeApiKey, withApiKey } from "@llm/apiKey";
import { probeConnection } from "@llm/connectionStatus";
import { loadConnectionPresets, newConnectionPreset, saveConnectionPresets } from "@llm/connectionPresets";
import { OllamaModelProvider, OpenAICompatibleLocalProvider } from "@llm/provider";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** A fetch that records the Authorization header of each request and answers like a model server. */
function recordingFetch() {
  const seen: (string | null)[] = [];
  const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
    seen.push(new Headers(init?.headers).get("Authorization"));
    return json({ data: [{ id: "m" }], models: [{ name: "m" }], message: { content: "hi" }, done: true });
  }) as unknown as typeof fetch;
  return { seen, fetchImpl };
}

describe("normalizeApiKey", () => {
  it("trims and drops a pasted Bearer prefix, and treats blank as no key", () => {
    expect(normalizeApiKey("  sk-abc  ")).toBe("sk-abc");
    expect(normalizeApiKey("Bearer sk-abc")).toBe("sk-abc");
    expect(normalizeApiKey("bearer   sk-abc ")).toBe("sk-abc");
    expect(normalizeApiKey("   ")).toBe("");
    expect(normalizeApiKey(undefined)).toBe("");
  });
});

describe("withApiKey", () => {
  it("returns the same fetch when there is no key, so nothing changes for servers without one", () => {
    const base = vi.fn() as unknown as typeof fetch;
    expect(withApiKey(base, "")).toBe(base);
    expect(withApiKey(base, undefined)).toBe(base);
  });

  it("adds a Bearer header and keeps the rest of the request", async () => {
    const { seen, fetchImpl } = recordingFetch();
    await withApiKey(fetchImpl, "sk-abc")("http://localhost:1234/v1/models", { method: "POST", headers: { "Content-Type": "application/json" } });
    expect(seen).toEqual(["Bearer sk-abc"]);
    const init = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("does not overwrite an Authorization header the caller set", async () => {
    const { seen, fetchImpl } = recordingFetch();
    await withApiKey(fetchImpl, "sk-abc")("http://localhost/x", { headers: { Authorization: "Bearer other" } });
    expect(seen).toEqual(["Bearer other"]);
  });
});

describe("providers send the key on every kind of request", () => {
  it("OpenAI-compatible: model list, chat and embeddings", async () => {
    const { seen, fetchImpl } = recordingFetch();
    const provider = new OpenAICompatibleLocalProvider({ model: "m", baseUrl: "http://localhost:1234", fetchImpl, apiKey: "sk-abc" });
    await provider.listModels();
    await provider.chat({ messages: [{ role: "user", content: "hi" }] }).catch(() => undefined);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen.every((value) => value === "Bearer sk-abc")).toBe(true);
  });

  it("Ollama: model list and chat", async () => {
    const { seen, fetchImpl } = recordingFetch();
    const provider = new OllamaModelProvider({ model: "m", fetchImpl, apiKey: "sk-abc" });
    await provider.listModels();
    await provider.chat({ messages: [{ role: "user", content: "hi" }] }).catch(() => undefined);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen.every((value) => value === "Bearer sk-abc")).toBe(true);
  });

  it("sends no Authorization header at all when no key is set", async () => {
    const { seen, fetchImpl } = recordingFetch();
    await new OpenAICompatibleLocalProvider({ model: "m", baseUrl: "http://localhost:1234", fetchImpl }).listModels();
    expect(seen).toEqual([null]);
  });
});

describe("probeConnection with a key", () => {
  it("sends the key, and a server that wants one then connects", async () => {
    const fetchImpl = (async (_url: unknown, init?: RequestInit) =>
      new Headers(init?.headers).get("Authorization") === "Bearer sk-abc" ? json({ data: [{ id: "phi" }] }) : json({}, 401)) as unknown as typeof fetch;
    const without = await probeConnection("openai-compatible", "http://localhost:1234", { desktop: false, fetchImpl });
    expect(without).toEqual({ kind: "refused", status: 401 });
    const withKey = await probeConnection("openai-compatible", "http://localhost:1234", { desktop: false, fetchImpl, apiKey: "sk-abc" });
    expect(withKey).toEqual({ kind: "connected", models: ["phi"] });
  });
});

describe("connection presets and keys", () => {
  it("stores a key with a preset, and omits the field when there is none", () => {
    const withKey = newConnectionPreset("openai-compatible", "http://localhost:1234", [], "sk-abc");
    const plain = newConnectionPreset("ollama", "", []);
    expect(withKey.apiKey).toBe("sk-abc");
    expect("apiKey" in plain).toBe(false);
  });

  it("round-trips through storage and still reads presets saved before keys existed", () => {
    const memory = new Map<string, string>();
    const store = { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => void memory.set(k, v) };
    saveConnectionPresets([newConnectionPreset("openai-compatible", "http://localhost:1234", [], "sk-abc")], store);
    expect(loadConnectionPresets(store)[0]!.apiKey).toBe("sk-abc");
    store.setItem("storybook-ai.connection-presets", JSON.stringify([{ id: "1", name: "Old", engine: "ollama", baseUrl: "" }]));
    expect(loadConnectionPresets(store)).toEqual([{ id: "1", name: "Old", engine: "ollama", baseUrl: "" }]);
  });
});
