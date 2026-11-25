import http from "node:http";
import type { AddressInfo } from "node:net";

export type ChatBody = { model?: string; stream?: boolean; messages?: { role: string; content: string }[] };

export type FakeModelOptions = {
  /** Listen on this port instead of a random one — to bring a stopped server back at the same address. */
  port?: number;
  /** Model names the server lists at /api/tags. Empty = a running server with nothing installed. */
  models?: string[];
  /** Send CORS headers. Without them a browser can reach the server but not read its answers. */
  cors?: boolean;
  /** Require `Authorization: Bearer <this>`; anything else gets 401, like a server started with an API key. */
  requireKey?: string;
  /** Answer every request with this HTTP status instead (e.g. 401 for a server that wants an API key). */
  status?: number;
  /** Decides the reply text for one /api/chat request. */
  reply?: (body: ChatBody) => string;
};

export type FakeModelServer = {
  url: string;
  /** Every /api/chat request body received, in order. */
  chats: ChatBody[];
  /** The Authorization header of every request (tags and chat), in order; null when absent. */
  authorizations: (string | null)[];
  close: () => Promise<void>;
};

/** What a real model would plausibly say for each kind of request the app makes — just enough shape for the app to parse. */
export function defaultReply(body: ChatBody): string {
  const prompt = (body.messages ?? []).map((m) => m.content).join("\n");
  if (/Return JSON only, shaped as/.test(prompt)) {
    return JSON.stringify({ facts: [{ entity_label: "Emma", predicate: "core.identity", value: "Emma is a smuggler." }] });
  }
  return "Emma stood on the quay as the tide turned.";
}

/**
 * A small stand-in for a local Ollama server, so end-to-end tests can drive the
 * AI features deterministically without a real model. Speaks just the two
 * endpoints the app uses: GET /api/tags and POST /api/chat (streamed NDJSON or
 * a single JSON reply, depending on the request's `stream` flag).
 */
export async function startFakeModelServer(options: FakeModelOptions = {}): Promise<FakeModelServer> {
  const { models = ["fake-model:latest"], cors = true, status, requireKey, reply = defaultReply, port: wantedPort = 0 } = options;
  const chats: ChatBody[] = [];
  const authorizations: (string | null)[] = [];
  const server = http.createServer((req, res) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (cors) {
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Headers"] = "content-type, authorization";
      headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
      return;
    }
    authorizations.push(req.headers.authorization ?? null);
    if (requireKey && req.headers.authorization !== `Bearer ${requireKey}`) {
      res.writeHead(401, headers);
      res.end("{}");
      return;
    }
    if (status) {
      res.writeHead(status, headers);
      res.end("{}");
      return;
    }
    if (req.method === "GET" && req.url === "/api/tags") {
      res.writeHead(200, headers);
      res.end(JSON.stringify({ models: models.map((name) => ({ name })) }));
      return;
    }
    if (req.method === "POST" && req.url === "/api/chat") {
      let raw = "";
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", () => {
        const body = JSON.parse(raw || "{}") as ChatBody;
        chats.push(body);
        const text = reply(body);
        if (body.stream === false) {
          res.writeHead(200, headers);
          res.end(JSON.stringify({ message: { role: "assistant", content: text }, done: true, done_reason: "stop" }));
          return;
        }
        res.writeHead(200, { ...headers, "Content-Type": "application/x-ndjson" });
        const words = text.split(/(?<= )/);
        for (const word of words) res.write(JSON.stringify({ message: { role: "assistant", content: word }, done: false }) + "\n");
        res.end(JSON.stringify({ done: true, done_reason: "stop" }) + "\n");
      });
      return;
    }
    res.writeHead(404, headers);
    res.end("{}");
  });
  await new Promise<void>((resolve) => server.listen(wantedPort, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    chats,
    authorizations,
    close: () => new Promise<void>((resolve) => server.close(() => resolve()))
  };
}
