/**
 * App-wide, localStorage-backed - same pattern as theme.ts. Per-app, not
 * per-manuscript (Mats: "Kanske ska inställningen vara per app?") - Home's
 * own tips need it before any manuscript exists.
 *
 * Only "kaamilla" has real art so far; Mats is sending Kaamy/Kaambot
 * artwork separately. Add them here (and to MASCOT_IDS/MASCOT_IMAGES)
 * once those files land, rather than offering a picker option with
 * nothing behind it.
 */
export type MascotId = "none" | "kaamilla";

export const MASCOT_IDS: MascotId[] = ["none", "kaamilla"];

export const MASCOT_IMAGES: Record<Exclude<MascotId, "none">, string> = {
  kaamilla: "/mascots/kaamilla.png"
};

/** Proper names, same in every language - like the app's own name, not translated. */
export const MASCOT_NAMES: Record<Exclude<MascotId, "none">, string> = {
  kaamilla: "Kaamilla"
};

const MASCOT_KEY = "storybook-ai.mascot";

export function parseMascot(value: string | null | undefined): MascotId {
  return value === "kaamilla" ? "kaamilla" : "none";
}

export function readMascot(): MascotId {
  try {
    return parseMascot(localStorage.getItem(MASCOT_KEY));
  } catch {
    return "none";
  }
}

/**
 * The `storage` event only fires in OTHER tabs, never the one that wrote
 * the value - and AppSettingsDialog (Settings) and Home (the mascot tip)
 * are both mounted the whole time in the same tab, Home just hidden
 * behind the dialog. Without this, Home's own useState(readMascot) would
 * only ever see the value from when it first mounted.
 */
const listeners = new Set<(mascot: MascotId) => void>();

export function setMascot(mascot: MascotId): void {
  try {
    localStorage.setItem(MASCOT_KEY, mascot);
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener(mascot));
}

export function subscribeMascot(listener: (mascot: MascotId) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
