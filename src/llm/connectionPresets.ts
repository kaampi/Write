import type { LlmEngine } from "./provider";

export type ConnectionPreset = {
  id: string;
  name: string;
  engine: LlmEngine;
  baseUrl: string;
};

export const CONNECTION_PRESETS_KEY = "storybook-ai.connection-presets";

export function loadConnectionPresets(store: Pick<Storage, "getItem"> = localStorage): ConnectionPreset[] {
  try {
    const raw = store.getItem(CONNECTION_PRESETS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConnectionPreset);
  } catch {
    return [];
  }
}

export function saveConnectionPresets(presets: ConnectionPreset[], store: Pick<Storage, "setItem"> = localStorage): void {
  store.setItem(CONNECTION_PRESETS_KEY, JSON.stringify(presets));
}

export function newConnectionPreset(engine: LlmEngine, baseUrl: string, existingNames: string[]): ConnectionPreset {
  return { id: crypto.randomUUID(), name: uniqueDefaultName(existingNames), engine, baseUrl };
}

/**
 * A saved preset is "active" when the live engine/address is exactly what
 * it holds. Both engines compare on address now — Ollama used to be
 * locked to localhost (engine match alone was enough), but it can point
 * at another machine on the network too, so its address matters just as
 * much as the OpenAI-compatible engine's.
 */
export function matchesPreset(preset: ConnectionPreset, engine: LlmEngine, baseUrl: string): boolean {
  if (preset.engine !== engine) return false;
  return preset.baseUrl.trim() === baseUrl.trim();
}

function uniqueDefaultName(existingNames: string[]): string {
  const base = "New connection";
  if (!existingNames.includes(base)) return base;
  let suffix = 2;
  while (existingNames.includes(`${base} ${suffix}`)) suffix++;
  return `${base} ${suffix}`;
}

function isConnectionPreset(value: unknown): value is ConnectionPreset {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.id === "string" &&
    typeof rec.name === "string" &&
    (rec.engine === "ollama" || rec.engine === "openai-compatible") &&
    typeof rec.baseUrl === "string"
  );
}
