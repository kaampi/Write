/**
 * Optional access token for a local model server that requires one — llama.cpp
 * (`--api-key`), LM Studio's API tokens, vLLM, LocalAI, Jan, or Ollama behind a
 * reverse proxy such as nginx or Open WebUI. Sent as `Authorization: Bearer …`,
 * the scheme all of those use. This is for servers the author runs; the
 * cloud-host guard (`assertLocalOnlyBaseUrl`) still applies unchanged.
 *
 * The key lives only in this device's settings (localStorage), next to the
 * server address — never in a book, a backup, a Codex checkpoint or the prompt
 * inspector.
 */

/** Trims whitespace and a pasted `Bearer ` prefix, so "Bearer sk-abc" and "sk-abc" mean the same thing. Empty means "no key". */
export function normalizeApiKey(value: string | undefined | null): string {
  return (value ?? "").trim().replace(/^bearer\s+/i, "").trim();
}

/**
 * Returns `fetchImpl` unchanged when there is no key; otherwise a fetch that
 * adds the Authorization header to every request. A caller-supplied
 * Authorization header is left alone.
 */
export function withApiKey(fetchImpl: typeof fetch, apiKey: string | undefined | null): typeof fetch {
  const key = normalizeApiKey(apiKey);
  if (!key) return fetchImpl;
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${key}`);
    // A plain object, not the Headers instance, so every fetch implementation (including Tauri's) takes it as-is.
    return fetchImpl(input, { ...init, headers: Object.fromEntries(headers.entries()) });
  };
}
