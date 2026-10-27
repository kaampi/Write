import { parseManuscriptExport, type ManuscriptExport } from "@ocedo-apps/storycore";
import { packManuscriptExport } from "@core/manuscriptAppExport";
import type { Book } from "@core/BookSchema";
import type { NarrativeFact } from "@core/NarrativeFact";

export type CoreShareReader = "sandbox" | "comic";

export type CoreManuscriptPublication = {
  projectId: string;
  manuscript: ManuscriptExport;
  readers: CoreShareReader[];
};

/** The only Storybook payload for the shareable Core workspace. Full Book snapshots use a private workspace. */
export function buildCoreManuscriptPublication(
  book: Book,
  seriesFacts: NarrativeFact[] = [],
  readers: readonly CoreShareReader[] = [],
  exportedAt?: string
): CoreManuscriptPublication {
  return {
    projectId: book.id,
    manuscript: parseManuscriptExport(packManuscriptExport(book, exportedAt, seriesFacts)),
    readers: [...new Set(readers)]
  };
}
