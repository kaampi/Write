import { readdir, mkdtemp, rm, stat, chmod, realpath } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { createBackup, restoreBackup } from './backup.mjs';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const archiveName = name => typeof name === 'string' && /^storybook-core-[a-zA-Z0-9-]+\.sbcore$/.test(name);

export function createAdminBackup(core, mediaDir) {
  let running = false;
  const settings = () => core.backupSettings() ?? fail(409, 'Configure a backup directory first');
  const directory = async config => {
    const dir = resolve(config.backupDir), media = resolve(mediaDir);
    if (dir === media || dir.startsWith(media + sep)) fail(400, 'Backup directory cannot be inside Core media');
    try {
      const actual = await realpath(dir), actualMedia = await realpath(media);
      if (actual === actualMedia || actual.startsWith(actualMedia + sep)) fail(400, 'Backup directory cannot be inside Core media');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    return dir;
  };
  const exclusive = async task => {
    if (running) fail(409, 'Another backup operation is running');
    running = true;
    try { return await task(); } finally { running = false; }
  };
  const listIn = async dir => {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    const files = [];
    for (const entry of entries) {
      if (!entry.isFile() || !archiveName(entry.name)) continue;
      const info = await stat(join(dir, entry.name));
      files.push({ name: entry.name, size: info.size, modifiedAt: info.mtime.toISOString() });
    }
    return files.sort((a, b) => b.name.localeCompare(a.name));
  };
  return {
    async list() {
      return listIn(await directory(settings()));
    },
    backup(passphrase) {
      return exclusive(async () => {
        const config = settings(), dir = await directory(config);
        if (config.encrypted && (typeof passphrase !== 'string' || passphrase.length < 12)) fail(400, 'Recovery phrase must contain at least 12 characters');
        const result = await createBackup(core, { mediaDir, backupDir: dir, encrypted: config.encrypted, keep: config.keep, ...(config.encrypted ? { passphrase } : {}) });
        core.recordAdminAction('backup.create', result.path);
        return result;
      });
    },
    verify(name, passphrase) {
      return exclusive(async () => {
        const dir = await directory(settings());
        if (!archiveName(name) || !(await listIn(dir)).some(file => file.name === name)) fail(404, 'Backup not found');
        const stage = await mkdtemp(join(tmpdir(), 'core-verify-'));
        await chmod(stage, 0o700);
        try {
          const result = await restoreBackup(join(dir, name), join(stage, 'checked'), passphrase);
          core.recordAdminAction('backup.verify', name);
          return { name, verified: result.verified, encryption: result.encryption };
        } catch (error) {
          if (error.status) throw error;
          fail(400, 'Backup verification failed; check the recovery phrase and archive');
        } finally { await rm(stage, { recursive: true, force: true }); }
      });
    }
  };
}
