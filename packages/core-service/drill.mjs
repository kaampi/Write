import { chmod, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { restoreBackup } from './backup.mjs';

/** Restore to a disposable directory and check the data needed to start Core. */
export async function drillBackup(archive, passphrase) {
  const stage = await mkdtemp(join(tmpdir(), 'core-drill-'));
  await chmod(stage, 0o700);
  try {
    const result = await restoreBackup(archive, join(stage, 'restored'), passphrase);
    return { verified: true, encryption: result.encryption, counts: result.counts };
  } finally { await rm(stage, { recursive: true, force: true }); }
}
