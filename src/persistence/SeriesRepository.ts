import { parseSeries, summarizeSeries, type Series, type SeriesSummary } from "@core/SeriesSchema";
import { openStorybookDb, asPromise, SERIES_STORE as STORE } from "./Repository";

export class SeriesNotFoundError extends Error {
  constructor(id: string) {
    super(`Series not found: ${id}`);
    this.name = "SeriesNotFoundError";
  }
}

export class SeriesSchemaValidationError extends Error {
  constructor(id: string, issues: string) {
    super(`Series ${id} failed schema validation on load: ${issues}`);
    this.name = "SeriesSchemaValidationError";
  }
}

function parseSeriesSafe(row: unknown): Series | undefined {
  try {
    return parseSeries(row);
  } catch {
    return undefined;
  }
}

/**
 * Same shape as `BookRepository` (Repository.ts), its own object store in
 * the same IndexedDB database — a series has no books of its own to look
 * up a count against, so `list` takes the caller's own book summaries
 * instead of querying `BookRepository` itself, keeping the two repositories
 * independent of each other.
 */
export class SeriesRepository {
  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private db(): Promise<IDBDatabase> {
    return openStorybookDb(this.factory);
  }

  async list(bookCountBySeriesId: ReadonlyMap<string, number> = new Map()): Promise<SeriesSummary[]> {
    const db = await this.db();
    const rows = await asPromise(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
    db.close();
    const series: SeriesSummary[] = [];
    for (const row of rows) {
      const parsed = parseSeriesSafe(row);
      if (parsed) series.push(summarizeSeries(parsed, bookCountBySeriesId.get(parsed.id) ?? 0));
    }
    return series.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  async get(id: string): Promise<Series> {
    const db = await this.db();
    const row = await asPromise(db.transaction(STORE, "readonly").objectStore(STORE).get(id));
    db.close();
    if (!row) throw new SeriesNotFoundError(id);
    try {
      return parseSeries(row);
    } catch (error) {
      throw new SeriesSchemaValidationError(id, error instanceof Error ? error.message : String(error));
    }
  }

  async save(series: Series): Promise<void> {
    const parsed = parseSeries(series);
    const db = await this.db();
    await asPromise(db.transaction(STORE, "readwrite").objectStore(STORE).put(parsed));
    db.close();
  }

  async delete(id: string): Promise<void> {
    const db = await this.db();
    await asPromise(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
    db.close();
  }
}
