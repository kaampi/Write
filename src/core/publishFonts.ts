import asapRegularUrl from "../assets/fonts/asap/Asap-Regular.ttf?url";
import asapBoldUrl from "../assets/fonts/asap/Asap-Bold.ttf?url";
import literataRegularUrl from "../assets/fonts/literata/Literata-Regular.ttf?url";
import literataBoldUrl from "../assets/fonts/literata/Literata-Bold.ttf?url";
import loraRegularUrl from "../assets/fonts/lora/Lora-Regular.ttf?url";
import loraBoldUrl from "../assets/fonts/lora/Lora-Bold.ttf?url";
import sourceSerif4RegularUrl from "../assets/fonts/source-serif-4/SourceSerif4-Regular.ttf?url";
import sourceSerif4BoldUrl from "../assets/fonts/source-serif-4/SourceSerif4-Bold.ttf?url";
import alegreyaRegularUrl from "../assets/fonts/alegreya/Alegreya-Regular.ttf?url";
import alegreyaBoldUrl from "../assets/fonts/alegreya/Alegreya-Bold.ttf?url";
import frauncesRegularUrl from "../assets/fonts/fraunces/Fraunces-Regular.ttf?url";
import frauncesBoldUrl from "../assets/fonts/fraunces/Fraunces-Bold.ttf?url";
import libronRegularUrl from "../assets/fonts/libron/Libron-Regular.ttf?url";
import libronBoldUrl from "../assets/fonts/libron/Libron-Bold.ttf?url";
import spectralRegularUrl from "../assets/fonts/spectral/Spectral-Regular.ttf?url";
import spectralBoldUrl from "../assets/fonts/spectral/Spectral-Bold.ttf?url";
import ptSerifRegularUrl from "../assets/fonts/pt-serif/PTSerif-Regular.ttf?url";
import ptSerifBoldUrl from "../assets/fonts/pt-serif/PTSerif-Bold.ttf?url";
import ptSansRegularUrl from "../assets/fonts/pt-sans/PTSans-Regular.ttf?url";
import ptSansBoldUrl from "../assets/fonts/pt-sans/PTSans-Bold.ttf?url";
import chivoRegularUrl from "../assets/fonts/chivo/Chivo-Regular.ttf?url";
import chivoBoldUrl from "../assets/fonts/chivo/Chivo-Bold.ttf?url";
import openSansRegularUrl from "../assets/fonts/open-sans/OpenSans-Regular.ttf?url";
import openSansBoldUrl from "../assets/fonts/open-sans/OpenSans-Bold.ttf?url";
import rubikRegularUrl from "../assets/fonts/rubik/Rubik-Regular.ttf?url";
import rubikBoldUrl from "../assets/fonts/rubik/Rubik-Bold.ttf?url";

export const PUBLISH_FONT_IDS = [
  "system",
  "alegreya",
  "fraunces",
  "source-serif-4",
  "literata",
  "lora",
  "libron",
  "spectral",
  "pt-serif",
  "pt-sans",
  "chivo",
  "asap",
  "open-sans",
  "rubik"
] as const;
export type PublishFontId = (typeof PUBLISH_FONT_IDS)[number];

export type PublishFontOption = {
  id: PublishFontId;
  label: string;
  /** The bare family name, used in @font-face declarations, RTF/ODT font tables, and PDF metadata. */
  name: string;
  /** The CSS font-family value, name plus fallbacks. */
  stack: string;
  category: "serif" | "sans";
};

export const PUBLISH_FONTS: PublishFontOption[] = [
  {
    id: "system",
    label: "System serif (Times/Georgia)",
    name: "Georgia",
    stack: `Georgia, "Times New Roman", serif`,
    category: "serif"
  },
  { id: "alegreya", label: "Alegreya", name: "Alegreya", stack: `Alegreya, Georgia, serif`, category: "serif" },
  { id: "fraunces", label: "Fraunces", name: "Fraunces", stack: `Fraunces, Georgia, serif`, category: "serif" },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    name: "Source Serif 4",
    stack: `"Source Serif 4", Georgia, serif`,
    category: "serif"
  },
  { id: "literata", label: "Literata", name: "Literata", stack: `Literata, Georgia, serif`, category: "serif" },
  { id: "lora", label: "Lora", name: "Lora", stack: `Lora, Georgia, serif`, category: "serif" },
  { id: "libron", label: "Libron", name: "Libron", stack: `Libron, Georgia, serif`, category: "serif" },
  { id: "spectral", label: "Spectral", name: "Spectral", stack: `Spectral, Georgia, serif`, category: "serif" },
  { id: "pt-serif", label: "PT Serif", name: "PT Serif", stack: `"PT Serif", Georgia, serif`, category: "serif" },
  { id: "pt-sans", label: "PT Sans", name: "PT Sans", stack: `"PT Sans", Arial, sans-serif`, category: "sans" },
  { id: "chivo", label: "Chivo", name: "Chivo", stack: `Chivo, Arial, sans-serif`, category: "sans" },
  { id: "asap", label: "Asap", name: "Asap", stack: `Asap, Arial, sans-serif`, category: "sans" },
  {
    id: "open-sans",
    label: "Open Sans",
    name: "Open Sans",
    stack: `"Open Sans", Arial, sans-serif`,
    category: "sans"
  },
  { id: "rubik", label: "Rubik", name: "Rubik", stack: `Rubik, Arial, sans-serif`, category: "sans" }
];

const PUBLISH_FONT_FILES: Record<Exclude<PublishFontId, "system">, { regular: string; bold: string }> = {
  alegreya: { regular: alegreyaRegularUrl, bold: alegreyaBoldUrl },
  fraunces: { regular: frauncesRegularUrl, bold: frauncesBoldUrl },
  "source-serif-4": { regular: sourceSerif4RegularUrl, bold: sourceSerif4BoldUrl },
  literata: { regular: literataRegularUrl, bold: literataBoldUrl },
  lora: { regular: loraRegularUrl, bold: loraBoldUrl },
  libron: { regular: libronRegularUrl, bold: libronBoldUrl },
  spectral: { regular: spectralRegularUrl, bold: spectralBoldUrl },
  "pt-serif": { regular: ptSerifRegularUrl, bold: ptSerifBoldUrl },
  "pt-sans": { regular: ptSansRegularUrl, bold: ptSansBoldUrl },
  chivo: { regular: chivoRegularUrl, bold: chivoBoldUrl },
  asap: { regular: asapRegularUrl, bold: asapBoldUrl },
  "open-sans": { regular: openSansRegularUrl, bold: openSansBoldUrl },
  rubik: { regular: rubikRegularUrl, bold: rubikBoldUrl }
};

export function publishFontById(id: PublishFontId): PublishFontOption {
  return PUBLISH_FONTS.find((font) => font.id === id) ?? PUBLISH_FONTS[0]!;
}

export type PublishFontEmbed = { regular: Uint8Array; bold: Uint8Array };

/**
 * Cached by font id — these are the app's own bundled font files, never
 * change at runtime, so there's no reason to re-fetch them on every single
 * Publish click. Beyond the obvious waste, re-fetching matters for a
 * different reason: some browsers only allow a `<a download>` click to
 * actually trigger a save if it happens within a short window of the
 * user's own gesture (the Publish button click) — an `await` on a real
 * network fetch in between can be enough to lose that window in a
 * stricter browser even when a more lenient one still allows it, which
 * fits a real report of Publish doing nothing in Brave while the same
 * build worked in Chrome. Caching can't remove every async step before
 * the download fires (packPdf/packIdml still do genuine async work
 * embedding fonts into pdf-lib), but it removes this one, and `openPublish`
 * additionally pre-warms the cache before the Publish button is even
 * clicked, so by the time it is, this call resolves immediately.
 */
const fontEmbedCache = new Map<PublishFontId, Promise<PublishFontEmbed | undefined>>();

/** Fetches the regular and bold font files for embedding. `system` has none — the formats fall back to their built-in default. */
export function loadPublishFontEmbed(id: PublishFontId): Promise<PublishFontEmbed | undefined> {
  if (id === "system") return Promise.resolve(undefined);
  const cached = fontEmbedCache.get(id);
  if (cached) return cached;
  const files = PUBLISH_FONT_FILES[id];
  const promise = Promise.all([
    fetch(files.regular).then((res) => res.arrayBuffer()),
    fetch(files.bold).then((res) => res.arrayBuffer())
  ]).then(([regular, bold]) => ({ regular: new Uint8Array(regular), bold: new Uint8Array(bold) }));
  // Don't cache a failed fetch — a transient network error shouldn't
  // permanently poison every later Publish attempt for this font.
  promise.catch(() => fontEmbedCache.delete(id));
  fontEmbedCache.set(id, promise);
  return promise;
}
