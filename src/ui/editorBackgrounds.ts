import forestUrl from "../assets/backgrounds/forest-mist.jpg?url";
import milkyWayUrl from "../assets/backgrounds/milky-way.jpg?url";
import type { Book } from "../core/BookSchema";

/**
 * Bundled decorative backdrops for BookSchema's editor_background setting —
 * "none" has no entry here since it renders the editor's plain default
 * background (no inline style override) instead of an image.
 */
export const EDITOR_BACKGROUND_URLS: Record<Exclude<Book["editor_background"], "none">, string> = {
  forest: forestUrl,
  "milky-way": milkyWayUrl
};
