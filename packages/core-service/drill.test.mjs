import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { openCore, createCoreServer } from './core.mjs';
import { createBackup, restoreBackup } from './backup.mjs';
import { drillBackup } from './drill.mjs';

test('a restored Core serves original credentials, records and media with owner isolation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'core-drill-test-'));
  const file = join(root, 'live.db'), mediaDir = join(root, 'media'), backupDir = join(root, 'backups');
  await mkdir(mediaDir);
  const core = openCore(file);
  let server, restored;
  try {
    const storyToken = core.provision('storybook'), comicToken = core.provision('comic');
    const ws = core.createWorkspace('storybook', { kind: 'test-manuscript' });
    const record = core.writeRecord('storybook', ws.id, { body: { title: 'Chapter one' } });
    core.updateRecord('storybook', record.id, { expectedRevision: 1, body: { title: 'Chapter two' } });
    const bytes = Buffer.from('cover bytes');
    const hash = createHash('sha256').update(bytes).digest('hex');
    await writeFile(join(mediaDir, hash), bytes);
    const media = core.registerMedia('storybook', ws.id, { sha256: hash, size: bytes.length, contentType: 'image/png' });
    const phrase = 'recover-this-core-safely';
    const archive = await createBackup(core, { mediaDir, backupDir, encrypted: true, passphrase: phrase });
    await assert.rejects(drillBackup(archive.path, 'wrong-passphrase-long'), /authenticate|decrypt|Unsupported/);
    const report = await drillBackup(archive.path, phrase);
    assert.deepEqual(report, { verified: true, encryption: 'encrypted', counts: { workspaces: 1, records: 1, revisions: 2, media: 1, app_keys: 2, admin_keys: 0 } });
    const target = join(root, 'recovered');
    await restoreBackup(archive.path, target, phrase);
    restored = openCore(join(target, 'core.db'));
    server = createCoreServer(restored, { mediaDir: join(target, 'media') });
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const get = (token, path) => fetch(base + path, { headers: { authorization: `Bearer ${token}` } });
    assert.deepEqual(await (await get(storyToken, '/v1/identity')).json(), { app: 'storybook' });
    assert.equal((await get('0'.repeat(64), '/v1/identity')).status, 401);
    assert.deepEqual((await (await get(storyToken, `/v1/records/${record.id}`)).json()).body, { title: 'Chapter two' });
    assert.equal((await get(comicToken, `/v1/records/${record.id}`)).status, 403);
    assert.equal((await get(comicToken, `/v1/media/${media.id}`)).status, 403);
    assert.deepEqual(Buffer.from(await (await get(storyToken, `/v1/media/${media.id}`)).arrayBuffer()), bytes);
  } finally {
    if (server) { server.close(); await once(server, 'close'); }
    restored?.close(); core.close(); await rm(root, { recursive: true, force: true });
  }
});

test('missing media prevents backup publication and retains older archives', async () => {
  const root = await mkdtemp(join(tmpdir(), 'core-drill-missing-'));
  const core = openCore(join(root, 'live.db'));
  try {
    const ws = core.createWorkspace('comic', { kind: 'comic-project' });
    const good = await createBackup(core, { mediaDir: join(root, 'media'), backupDir: join(root, 'backups'), encrypted: false, keep: 1 });
    core.registerMedia('comic', ws.id, { sha256: 'a'.repeat(64), size: 5, contentType: 'image/png' });
    await assert.rejects(createBackup(core, { mediaDir: join(root, 'media'), backupDir: join(root, 'backups'), encrypted: false, keep: 1 }), /media is missing/);
    assert.equal((await drillBackup(good.path)).verified, true);
  } finally { core.close(); await rm(root, { recursive: true, force: true }); }
});

test('restore drill CLI works without an active Core database and reads the phrase on stdin', async () => {
  const root = await mkdtemp(join(tmpdir(), 'core-drill-cli-'));
  const core = openCore(join(root, 'live.db'));
  try {
    const archive = await createBackup(core, { mediaDir: join(root, 'media'), backupDir: join(root, 'backups'), passphrase: 'cli-recovery-phrase' });
    const child = spawn(process.execPath, [fileURLToPath(new URL('./server.mjs', import.meta.url)), 'drill', archive.path], { env: { ...process.env, CORE_DB_PATH: '' }, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '', errors = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { errors += chunk; });
    child.stdin.end('cli-recovery-phrase\n');
    const [code] = await once(child, 'close');
    assert.equal(code, 0, errors);
    assert.equal(JSON.parse(output).verified, true);
  } finally { core.close(); await rm(root, { recursive: true, force: true }); }
});
