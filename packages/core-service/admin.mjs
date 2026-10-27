import { readdir, stat, realpath } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { createBackup } from './backup.mjs';
import { drillBackup } from './drill.mjs';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const archiveName = name => typeof name === 'string' && /^storybook-core-[a-zA-Z0-9-]+\.sbcore$/.test(name);

export function createAdminBackup(core, mediaDir, { schedule = setTimeout, cancel = clearTimeout, now = Date.now } = {}) {
  let running = false, pending;
  let stopped = false, phrase, timer, nextRunAt = null, lastSuccessAt = null, lastError = null;
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
    pending = task();
    try { return await pending; } finally { pending = undefined; running = false; }
  };
  const clearSchedule = () => { if (timer !== undefined) cancel(timer); timer = undefined; nextRunAt = null; };
  const scheduleNext = () => {
    clearSchedule();
    const config = core.backupSettings();
    if (stopped || !config?.intervalHours || (config.encrypted && !phrase)) return;
    const delay = config.intervalHours * 60 * 60 * 1000;
    nextRunAt = new Date(now() + delay).toISOString();
    timer = schedule(async () => {
      timer = undefined; nextRunAt = null;
      if (stopped) return;
      try {
        await api.backup(phrase);
        lastSuccessAt = new Date(now()).toISOString(); lastError = null;
      } catch (error) { lastError = error instanceof Error ? error.message : String(error); }
      scheduleNext();
    }, delay);
    timer?.unref?.();
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
  const api = {
    scheduleStatus() {
      const config = core.backupSettings();
      return { state: !config?.intervalHours ? 'off' : config.encrypted && !phrase ? 'locked' : 'active',
        nextRunAt, lastSuccessAt, lastError, running };
    },
    reconfigure() {
      phrase = undefined;
      lastError = null;
      scheduleNext();
      return this.scheduleStatus();
    },
    unlock(passphrase) {
      const config = settings();
      if (!config.intervalHours || !config.encrypted) fail(409, 'Encrypted schedule is not enabled');
      if (typeof passphrase !== 'string' || passphrase.length < 12) fail(400, 'Recovery phrase must contain at least 12 characters');
      phrase = passphrase;
      scheduleNext();
      return this.scheduleStatus();
    },
    lock() { phrase = undefined; scheduleNext(); return this.scheduleStatus(); },
    async stop() { stopped = true; phrase = undefined; clearSchedule(); try { await pending; } catch { /* Already reported to the caller or schedule status. */ } },
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
        try {
          const result = await drillBackup(join(dir, name), passphrase);
          core.recordAdminAction('backup.drill', name);
          return { name, ...result };
        } catch (error) {
          if (error.status) throw error;
          fail(400, 'Restore drill failed; check the recovery phrase, archive and Core media');
        }
      });
    }
  };
  scheduleNext();
  return api;
}
