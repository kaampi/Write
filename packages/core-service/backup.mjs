import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, chmod, mkdtemp, mkdir, open, readdir, rename, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { openCore } from './core.mjs';

const MAGIC = Buffer.from('SBCORE01');
const HEADER_SIZE = MAGIC.length + 16 + 12;
const MAX_MANIFEST = 8 * 1024 * 1024;
const key = (passphrase, salt) => {
  if (typeof passphrase !== 'string' || passphrase.length < 12) throw new Error('Recovery passphrase must contain at least 12 characters');
  return scryptSync(passphrase, salt, 32, { N: 1 << 15, maxmem: 64 * 1024 * 1024 });
};
const exists = async path => { try { await access(path); return true; } catch { return false; } };
const hashFile = async path => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};
const filesIn = async (root, sub = '') => {
  if (!await exists(root)) return [];
  const result = [];
  for (const entry of await readdir(join(root, sub), { withFileTypes: true })) {
    const name = join(sub, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(root, name));
    else if (entry.isFile()) result.push({ path: join(root, name), name: 'media/' + name.split(sep).join('/') });
    else throw new Error('Media symlinks and special files are unsupported');
  }
  return result;
};
const write = async (stream, data) => { if (!stream.write(data)) await once(stream, 'drain'); };
const finish = async stream => { stream.end(); await once(stream, 'finish'); };
const checkName = name => {
  if (name !== 'core.db' && !/^media\/[a-zA-Z0-9_.\/-]+$/.test(name)) throw new Error('Invalid archive path');
  if (name.split('/').includes('..') || name.split('/').includes('.')) throw new Error('Invalid archive path');
};

export async function restoreBackup(archive, destination, passphrase) {
  if (await exists(destination)) throw new Error('Restore destination must not exist');
  const parent = resolve(dirname(destination));
  await mkdir(parent, { recursive: true });
  const stage = await mkdtemp(join(parent, '.core-restore-'));
  await chmod(stage, 0o700);
  const plain = join(stage, 'payload.tmp');
  try {
    const source = await open(archive, 'r');
    let header;
    try {
      header = Buffer.alloc(HEADER_SIZE);
      if ((await source.read(header, 0, HEADER_SIZE, 0)).bytesRead !== HEADER_SIZE || !header.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Invalid backup format');
    } finally { await source.close(); }
    const size = (await stat(archive)).size;
    if (size < HEADER_SIZE + 16) throw new Error('Truncated backup');
    const tag = Buffer.alloc(16);
    const handle = await open(archive, 'r');
    try { await handle.read(tag, 0, 16, size - 16); } finally { await handle.close(); }
    const decipher = createDecipheriv('aes-256-gcm', key(passphrase, header.subarray(8, 24)), header.subarray(24, 36));
    decipher.setAuthTag(tag);
    const out = await open(plain, 'wx', 0o600);
    try {
      for await (const chunk of createReadStream(archive, { start: HEADER_SIZE, end: size - 17 })) await out.writeFile(decipher.update(chunk));
      await out.writeFile(decipher.final());
    } finally { await out.close(); }
    const input = await open(plain, 'r');
    try {
      const length = Buffer.alloc(4);
      if ((await input.read(length, 0, 4, 0)).bytesRead !== 4) throw new Error('Invalid manifest');
      const count = length.readUInt32BE();
      if (count < 2 || count > MAX_MANIFEST) throw new Error('Invalid manifest size');
      const bytes = Buffer.alloc(count);
      if ((await input.read(bytes, 0, count, 4)).bytesRead !== count) throw new Error('Invalid manifest');
      const manifest = JSON.parse(bytes.toString('utf8'));
      if (manifest.version !== 1 || !Array.isArray(manifest.files)) throw new Error('Unsupported backup version');
      const seen = new Set();
      let offset = 4 + count;
      for (const file of manifest.files) {
        checkName(file.name);
        if (seen.has(file.name) || !Number.isSafeInteger(file.size) || file.size < 0 || !/^[0-9a-f]{64}$/.test(file.sha256)) throw new Error('Invalid manifest entry');
        seen.add(file.name);
        const target = join(stage, ...file.name.split('/'));
        await mkdir(dirname(target), { recursive: true });
        const output = await open(target, 'wx', 0o600);
        const hash = createHash('sha256');
        try {
          let remaining = file.size;
          while (remaining) {
            const chunk = Buffer.alloc(Math.min(65536, remaining));
            const { bytesRead } = await input.read(chunk, 0, chunk.length, offset);
            if (!bytesRead) throw new Error('Truncated payload');
            await output.write(chunk.subarray(0, bytesRead));
            hash.update(chunk.subarray(0, bytesRead));
            remaining -= bytesRead; offset += bytesRead;
          }
        } finally { await output.close(); }
        if (hash.digest('hex') !== file.sha256) throw new Error('Backup checksum mismatch');
      }
      if (!seen.has('core.db') || offset !== (await stat(plain)).size) throw new Error('Invalid backup contents');
    } finally { await input.close(); }
    const db = openCore(join(stage, 'core.db'));
    try {
      // A malformed database must never be installed as a restored Core.
      if (db.integrityCheck() !== 'ok') throw new Error('SQLite integrity check failed');
    } finally { db.close(); }
    await rm(plain);
    await rename(stage, destination);
    return { destination, verified: true };
  } catch (error) { await rm(stage, { recursive: true, force: true }); throw error; }
}

export async function createBackup(core, { mediaDir, backupDir, passphrase, keep = 10 }) {
  if (!Number.isInteger(keep) || keep < 1 || keep > 1000) throw new Error('Keep must be between 1 and 1000');
  key(passphrase, Buffer.alloc(16)); // Validate before creating a snapshot.
  await mkdir(backupDir, { recursive: true, mode: 0o700 });
  const stage = await mkdtemp(join(tmpdir(), 'core-backup-'));
  await chmod(stage, 0o700);
  const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(6).toString('hex');
  const filename = `storybook-core-${id}.sbcore`;
  const target = join(backupDir, filename), temporary = target + '.partial';
  try {
    const snapshot = join(stage, 'core.db');
    core.snapshotTo(snapshot);
    const entries = [{ path: snapshot, name: 'core.db' }, ...await filesIn(mediaDir)];
    const files = [];
    for (const entry of entries) {
      const info = await stat(entry.path);
      files.push({ name: entry.name, size: info.size, sha256: await hashFile(entry.path) });
    }
    const manifest = Buffer.from(JSON.stringify({ version: 1, createdAt: new Date().toISOString(), files }));
    if (manifest.length > MAX_MANIFEST) throw new Error('Too many media files');
    const salt = randomBytes(16), iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key(passphrase, salt), iv);
    const output = createWriteStream(temporary, { flags: 'wx', mode: 0o600 });
    try {
      await write(output, Buffer.concat([MAGIC, salt, iv]));
      const length = Buffer.alloc(4); length.writeUInt32BE(manifest.length);
      await write(output, cipher.update(length));
      await write(output, cipher.update(manifest));
      for (const entry of entries) {
        for await (const chunk of createReadStream(entry.path)) await write(output, cipher.update(chunk));
      }
      await write(output, cipher.final());
      await write(output, cipher.getAuthTag());
      await finish(output);
    } catch (error) { output.destroy(); throw error; }
    // Verify decryption and all file hashes before publishing or pruning old copies.
    await restoreBackup(temporary, join(stage, 'verified'), passphrase);
    await rename(temporary, target);
    const previous = (await readdir(backupDir)).filter(name => /^storybook-core-.*\.sbcore$/.test(name)).sort().reverse();
    let retained = 0;
    for (const name of previous) {
      if (await exists(join(backupDir, name + '.keep'))) continue;
      if (++retained > keep) await rm(join(backupDir, name));
    }
    return { path: target, verified: true };
  } finally {
    await rm(temporary, { force: true });
    await rm(stage, { recursive: true, force: true });
  }
}
