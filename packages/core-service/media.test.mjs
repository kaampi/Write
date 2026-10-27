import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { openCore, createCoreServer } from './core.mjs';
import { createBackup, restoreBackup } from './backup.mjs';

test('owned immutable media is readable only with permission and survives a backup', async () => {
  const root = await mkdtemp(join(tmpdir(), 'core-media-'));
  const mediaDir = join(root, 'media'), core = openCore(join(root, 'core.db'));
  const tokens = Object.fromEntries(['storybook', 'sandbox', 'comic'].map(app => [app, core.provision(app)]));
  const ws = core.createWorkspace('comic', { kind: 'comic-project' });
  const server = createCoreServer(core, { mediaDir });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (app, method, path, body) => fetch(base + path, {
    method, headers: { authorization: `Bearer ${tokens[app]}`, ...(body ? { 'content-type': 'image/png' } : {}) },
    ...(body ? { body } : {})
  });
  try {
    const bytes = Buffer.from([137, 80, 78, 71, 1]);
    const media = await request('comic', 'POST', `/v1/workspaces/${ws.id}/media`, bytes);
    assert.equal(media.status, 201);
    const data = await media.json();
    assert.equal((await request('storybook', 'GET', `/v1/media/${data.id}`)).status, 403);
    assert.equal((await request('storybook', 'POST', `/v1/workspaces/${ws.id}/media`, bytes)).status, 403);
    core.grant('comic', ws.id, 'sandbox');
    assert.deepEqual(Buffer.from(await (await request('sandbox', 'GET', `/v1/media/${data.id}`)).arrayBuffer()), bytes);
    assert.equal((await request('sandbox', 'POST', `/v1/workspaces/${ws.id}/media`, bytes)).status, 403);
    await writeFile(join(mediaDir, '.upload.partial'), Buffer.from('incomplete'));
    const backup = await createBackup(core, { mediaDir, backupDir: join(root, 'backups'), passphrase: 'a-long-recovery-phrase', keep: 2 });
    const restoredPath = join(root, 'restored');
    await restoreBackup(backup.path, restoredPath, 'a-long-recovery-phrase');
    assert.deepEqual(await readFile(join(restoredPath, 'media', data.sha256)), bytes);
    assert.equal((await readdir(join(restoredPath, 'media'))).includes('.upload.partial'), false);
    const restored = openCore(join(restoredPath, 'core.db'));
    try { assert.equal(restored.getMedia('comic', data.id).sha256, data.sha256); }
    finally { restored.close(); }
  } finally { server.close(); await once(server, 'close'); core.close(); await rm(root, { recursive: true, force: true }); }
});
