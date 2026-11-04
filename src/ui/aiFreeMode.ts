/**
 * "AI-free mode" (Mats, 2026-11-04: "appen är faktiskt rätt bra även utan
 * AI" ... "man ska kunna ställa appen i AI-fritt läge så att man inte ser
 * de verktyg som kräver AI... man ser menyval men de är gråade och
 * inaktiverade"). Same localStorage-backed pub-sub shape as mascot.ts.
 *
 * Deliberately independent of whether a local AI is actually connected
 * (`engine`/`baseUrl`/`models` in useBookStore) — Mats: "man borde kunna ha
 * AI-fritt läge även om man har en lokal AI installerad." This is an
 * explicit author choice, not a derived "AI unavailable" state; a consumer
 * that wants "is AI actually usable right now" combines this with its own
 * connection check, it doesn't come from here.
 */
const AI_FREE_MODE_KEY = "storybook-ai.ai-free-mode";

export function readAiFreeMode(): boolean {
  try {
    return localStorage.getItem(AI_FREE_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

const listeners = new Set<(aiFree: boolean) => void>();

export function setAiFreeMode(aiFree: boolean): void {
  try {
    localStorage.setItem(AI_FREE_MODE_KEY, aiFree ? "1" : "0");
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener(aiFree));
}

export function subscribeAiFreeMode(listener: (aiFree: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
