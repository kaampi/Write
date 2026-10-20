import forestUrl from "../assets/backgrounds/forest-mist.jpg?url";
import milkyWayUrl from "../assets/backgrounds/milky-way.jpg?url";
import corkUrl from "../assets/backgrounds/cork-tile.png?url";
import trianglesUrl from "../assets/backgrounds/triangles-tile.png?url";
import fabricUrl from "../assets/backgrounds/fabric-tile.png?url";
import schoolUrl from "../assets/backgrounds/school-tile.png?url";
import pineUrl from "../assets/backgrounds/pine-tile.png?url";
import leavesUrl from "../assets/backgrounds/leaves-tile.png?url";
import type { Book } from "../core/BookSchema";

/**
 * Bundled decorative backdrops for BookSchema's editor_background setting —
 * "none" has no entry here since it renders the editor's plain default
 * background (no inline style override) instead of an image.
 *
 * forest/milky-way are single scenic photos, stretched to cover the whole
 * backdrop (see manuscriptBackgroundStyle in Editor.tsx) — not meant to
 * repeat. The rest are seamless tiles, meant to repeat at their own natural
 * size instead; EDITOR_BACKGROUND_TILED below marks which is which.
 */
export const EDITOR_BACKGROUND_URLS: Record<Exclude<Book["editor_background"], "none">, string> = {
  forest: forestUrl,
  "milky-way": milkyWayUrl,
  cork: corkUrl,
  triangles: trianglesUrl,
  fabric: fabricUrl,
  school: schoolUrl,
  pine: pineUrl,
  leaves: leavesUrl
};

/** Which editor_background values are seamless repeating tiles rather than a single cover-scaled photo. */
export const EDITOR_BACKGROUND_TILED: Record<Exclude<Book["editor_background"], "none">, boolean> = {
  forest: false,
  "milky-way": false,
  cork: true,
  triangles: true,
  fabric: true,
  school: true,
  pine: true,
  leaves: true
};
