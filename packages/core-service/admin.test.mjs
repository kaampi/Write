import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { once } from 'node:events';
import { request } from 'node:http';
import { openCore, createCoreServer } from './core.mjs';
import { createAdminBackup } from './admin.mjs';

test('Core management uses a separate administrator identity and verifies backup archives', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'core-admin-'));
  const core = openCore(join(dir, 'core.db'));
  const appToken = core.provision('storybook'), adminToken = core.provisionAdmin();
  const server = createCoreServer(core, { mediaDir: join(dir, 'media'), adminBackup: createAdminBackup(core, join(dir, 'media')) });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (token, method, path, input) => {
    const response = await fetch(base + path, {
      method, headers: { authorization: `Bearer ${token}`, ...(input ? { 'content-type': 'application/json' } : {}) },
      ...(input ? { body: JSON.stringify(input) } : {})
    });
    return { status: response.status, data: await response.json() };
  };
  try {
    const page = await fetch(base + '/admin');
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-security-policy'), /script-src 'self'/);
    assert.match(await page.text(), /Backupinställningar/);
    assert.equal((await fetch(base + '/admin.js')).status, 200);
    assert.equal((await fetch(base + '/admin.css')).status, 200);
    const wrongHost = await new Promise((resolve, reject) => {
      const req = request(base + '/admin', { headers: { host: 'untrusted.example' } }, response => {
        response.resume(); response.on('end', () => resolve(response.statusCode));
      });
      req.on('error', reject); req.end();
    });
    assert.equal(wrongHost, 403);
    assert.equal((await fetch(base + '/admin/api/settings', { headers: { authorization: `Bearer ${adminToken}`, origin: 'http://untrusted.example' } })).status, 403);
    assert.equal((await call(appToken, 'GET', '/admin/api/settings')).status, 401);
    assert.equal((await call(adminToken, 'GET', '/v1/workspaces')).status, 401);
    assert.equal((await call(adminToken, 'GET', '/admin/api/settings')).data, null);
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups', {})).status, 409);
    assert.equal((await call(adminToken, 'PUT', '/admin/api/settings', { backupDir: '../relative', encrypted: false, keep: 1 })).status, 400);
    assert.equal((await call(adminToken, 'PUT', '/admin/api/settings', { backupDir: join(dir, 'media', 'backups'), encrypted: false, keep: 1 })).status, 200);
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups', {})).status, 400);
    const backupDir = join(dir, 'backups');
    const settings = await call(adminToken, 'PUT', '/admin/api/settings', { backupDir, encrypted: false, keep: 1 });
    assert.deepEqual(settings.data, { backupDir, encrypted: false, keep: 1 });
    const plain = await call(adminToken, 'POST', '/admin/api/backups', {});
    assert.equal(plain.status, 200);
    assert.equal(plain.data.encryption, 'plain');
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups/verify', { name: '../core.db' })).status, 404);
    const plainName = basename(plain.data.path);
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups/verify', { name: plainName })).data.verified, true);
    await call(adminToken, 'PUT', '/admin/api/settings', { backupDir, encrypted: true, keep: 1 });
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups', { passphrase: 'short' })).status, 400);
    const encrypted = await call(adminToken, 'POST', '/admin/api/backups', { passphrase: 'recovery-phrase-long-enough' });
    assert.equal(encrypted.status, 200);
    assert.equal(encrypted.data.encryption, 'encrypted');
    const encryptedName = basename(encrypted.data.path);
    const list = await call(adminToken, 'GET', '/admin/api/backups');
    assert.deepEqual(list.data.map(file => file.name), [encryptedName]);
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups/verify', { name: encryptedName, passphrase: 'wrong-passphrase' })).status, 400);
    assert.equal((await call(adminToken, 'POST', '/admin/api/backups/verify', { name: encryptedName, passphrase: 'recovery-phrase-long-enough' })).data.verified, true);
  } finally { server.close(); await once(server, 'close'); core.close(); rmSync(dir, { recursive: true, force: true }); }
});
