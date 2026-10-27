import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export async function inspectRestoredCore(destination) {
  const db = new DatabaseSync(join(destination, 'core.db'), { readOnly: true });
  let counts, references;
  try {
    if (db.prepare('PRAGMA integrity_check').get()?.integrity_check !== 'ok') throw new Error('SQLite integrity check failed');
    if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('SQLite foreign key check failed');
    counts = Object.fromEntries(['workspaces', 'records', 'revisions', 'media', 'app_keys', 'admin_keys'].map(table =>
      [table, db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count]));
    references = db.prepare('SELECT sha256, size FROM media').all();
  } finally { db.close(); }
  for (const { sha256, size } of references) {
    if (typeof sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(sha256) || !Number.isSafeInteger(size) || size < 0) throw new Error('Invalid media reference');
    const path = join(destination, 'media', sha256);
    let info;
    try { info = await stat(path); }
    catch (error) { if (error.code === 'ENOENT') throw new Error('Restored Core media is missing'); throw error; }
    if (!info.isFile() || info.size !== size) throw new Error('Restored Core media size mismatch');
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    if (hash.digest('hex') !== sha256) throw new Error('Restored Core media checksum mismatch');
  }
  return counts;
}
