import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { probeConnection } from "@llm/connectionStatus";
import { LOCAL_SERVER_PROBE_TIMEOUT_MS } from "@llm/provider";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const networkFailure = async (): Promise<Response> => {
  throw new TypeError("Failed to fetch");
};

describe("probeConnection", () => {
  it("is connected when the server lists models, for both engines", async () => {
    expect(
      await probeConnection("ollama", "", { desktop: false, fetchImpl: async () => json({ models: [{ name: "llama3" }] }) })
    ).toEqual({ kind: "connected", models: ["llama3"] });
    expect(
      await probeConnection("openai-compatible", "http://localhost:1234", {
        desktop: false,
        fetchImpl: async () => json({ data: [{ id: "phi-4" }] })
      })
    ).toEqual({ kind: "connected", models: ["phi-4"] });
  });

  it("says the server is running but has no models when the list is empty", async () => {
    expect(await probeConnection("ollama", "", { desktop: false, fetchImpl: async () => json({ models: [] }) })).toEqual({
      kind: "no-models"
    });
  });

  it("calls a network failure 'unreachable' when nothing answers the follow-up request either", async () => {
    const noCors = vi.fn(networkFailure as unknown as typeof fetch);
    expect(await probeConnection("ollama", "", { desktop: false, fetchImpl: networkFailure as typeof fetch, noCorsFetch: noCors })).toEqual({
      kind: "unreachable"
    });
    expect(noCors).toHaveBeenCalledWith("http://localhost:11434/api/tags", expect.objectContaining({ mode: "no-cors" }));
  });

  it("calls it 'blocked' when the no-cors follow-up shows something is listening", async () => {
    const noCors = vi.fn(async () => new Response(null));
    expect(
      await probeConnection("openai-compatible", "http://localhost:1234/", {
        desktop: false,
        fetchImpl: networkFailure as typeof fetch,
        noCorsFetch: noCors as unknown as typeof fetch
      })
    ).toEqual({ kind: "blocked" });
    expect(noCors).toHaveBeenCalledWith("http://localhost:1234/v1/models", expect.objectContaining({ mode: "no-cors" }));
  });

  it("recognizes the Firefox and Safari wordings of a network failure", async () => {
    for (const message of ["NetworkError when attempting to fetch resource.", "Load failed"]) {
      const status = await probeConnection("ollama", "", {
        desktop: false,
        fetchImpl: (async () => {
          throw new Error(message);
        }) as typeof fetch,
        noCorsFetch: networkFailure as typeof fetch
      });
      expect(status).toEqual({ kind: "unreachable" });
    }
  });

  it("never tries the no-cors follow-up in the desktop app, where CORS does not exist", async () => {
    const noCors = vi.fn();
    const status = await probeConnection("ollama", "", {
      desktop: true,
      fetchImpl: (async () => {
        throw "error sending request for url (http://localhost:11434/api/tags)";
      }) as typeof fetch,
      noCorsFetch: noCors as unknown as typeof fetch
    });
    expect(status).toEqual({ kind: "unreachable" });
    expect(noCors).not.toHaveBeenCalled();
  });

  it("keeps an unreadable reply from a reachable server as an error, even on desktop", async () => {
    const status = await probeConnection("ollama", "", {
      desktop: true,
      fetchImpl: async () => new Response("not json", { status: 200 })
    });
    expect(status.kind).toBe("error");
  });

  it("reports a server that answers 401 or 403 as refusing the request", async () => {
    for (const code of [401, 403]) {
      expect(await probeConnection("openai-compatible", "http://localhost:1234", { desktop: false, fetchImpl: async () => json({}, code) })).toEqual({
        kind: "refused",
        status: code
      });
    }
  });

  it("leaves any other HTTP failure as a plain error with the server's own wording", async () => {
    const status = await probeConnection("ollama", "", { desktop: false, fetchImpl: async () => json({}, 500) });
    expect(status).toMatchObject({ kind: "error", message: expect.stringContaining("500") });
  });

  it("needs an address for the OpenAI-compatible engine", async () => {
    expect(await probeConnection("openai-compatible", "   ", { desktop: false })).toEqual({ kind: "no-address" });
  });

  it("reports a cloud address as a configuration error, not as a network problem", async () => {
    const status = await probeConnection("openai-compatible", "https://api.openai.com", { desktop: false });
    expect(status).toMatchObject({ kind: "error", message: expect.stringContaining("cloud API host") });
  });

  describe("when the server accepts the connection but never answers", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("gives up after the probe timeout and says so", async () => {
      const hanging = ((_url: unknown, init?: RequestInit) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        })) as unknown as typeof fetch;
      const result = probeConnection("ollama", "", { desktop: false, fetchImpl: hanging });
      await vi.advanceTimersByTimeAsync(LOCAL_SERVER_PROBE_TIMEOUT_MS);
      expect(await result).toEqual({ kind: "timeout" });
    });
  });
});
