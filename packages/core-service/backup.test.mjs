import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openCore } from './core.mjs';
import { backupEncryption, createBackup, restoreBackup } from './backup.mjs';

test('encrypted backup restores revisions and media, validates key, and retains newest versions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'core-backup-test-'));
  const file = join(root, 'live.db'), backupDir = join(root, 'remote'), mediaDir = join(root, 'media');
  const phrase = 'a-long-independent-recovery-phrase';
  await mkdir(mediaDir);
  await writeFile(join(mediaDir, 'cover.png'), Buffer.from([0, 1, 2, 255]));
  const core = openCore(file);
  try {
    const ws = core.createWorkspace('comic', { kind: 'comic-project' });
    const rec = core.writeRecord('comic', ws.id, { body: { page: 1 } });
    core.updateRecord('comic', rec.id, { expectedRevision: 1, body: { page: 2 } });
    const first = await createBackup(core, { backupDir, mediaDir, passphrase: phrase, keep: 2 });
    const bytes = await readFile(first.path);
    assert.equal(bytes.includes(Buffer.from('comic-project')), false);
    await assert.rejects(restoreBackup(first.path, join(root, 'wrong-key'), 'wrong-but-long-passphrase'));
    assert.equal((await readdir(root)).includes('wrong-key'), false);
    const tampered = join(root, 'tampered.sbcore');
    const altered = Buffer.from(bytes);
    altered[altered.length - 20] ^= 1;
    await writeFile(tampered, altered);
    await assert.rejects(restoreBackup(tampered, join(root, 'tampered-restore'), phrase));
    assert.equal((await readdir(root)).includes('tampered-restore'), false);
    const restoredPath = join(root, 'restored');
    await restoreBackup(first.path, restoredPath, phrase);
    assert.deepEqual(await readFile(join(restoredPath, 'media', 'cover.png')), Buffer.from([0, 1, 2, 255]));
    const restored = openCore(join(restoredPath, 'core.db'));
    try {
      assert.equal(restored.getRecord('comic', rec.id).revision, 2);
      assert.deepEqual(restored.getRevision('comic', rec.revisionId).body, { page: 1 });
      assert.equal(restored.integrityCheck(), 'ok');
    } finally { restored.close(); }
    await assert.rejects(restoreBackup(first.path, restoredPath, phrase), /must not exist/);
    await writeFile(first.path + '.keep', '');
    for (let i = 0; i < 3; i++) await createBackup(core, { backupDir, mediaDir, passphrase: phrase, keep: 2 });
    const names = (await readdir(backupDir)).filter(name => name.endsWith('.sbcore'));
    assert.equal(names.length, 3);
    assert.ok(names.includes(first.path.split('/').at(-1)));
  } finally { core.close(); await rm(root, { recursive: true, force: true }); }
});

test('plain backup restores without a phrase, detects corruption, and coexists with encrypted versions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'core-plain-test-'));
  const backupDir = join(root, 'backups'), mediaDir = join(root, 'media');
  await mkdir(mediaDir);
  const core = openCore(join(root, 'live.db'));
  try {
    const ws = core.createWorkspace('storybook', { kind: 'manuscript' });
    const rec = core.writeRecord('storybook', ws.id, { body: { title: 'A private draft' } });
    const secret = await createBackup(core, { backupDir, mediaDir, passphrase: 'long-recovery-phrase', keep: 2 });
    const plain = await createBackup(core, { backupDir, mediaDir, encrypted: false, keep: 2 });
    assert.equal(await backupEncryption(secret.path), 'encrypted');
    assert.equal(await backupEncryption(plain.path), 'plain');
    assert.equal((await readFile(plain.path)).includes(Buffer.from('A private draft')), true);
    const restoredPath = join(root, 'plain-restored');
    assert.equal((await restoreBackup(plain.path, restoredPath)).encryption, 'plain');
    const restored = openCore(join(restoredPath, 'core.db'));
    try { assert.deepEqual(restored.getRecord('storybook', rec.id).body, { title: 'A private draft' }); }
    finally { restored.close(); }
    const damaged = Buffer.from(await readFile(plain.path));
    damaged[damaged.length - 1] ^= 1;
    const damagedPath = join(root, 'damaged.sbcore');
    await writeFile(damagedPath, damaged);
    await assert.rejects(restoreBackup(damagedPath, join(root, 'damaged-restored')), /checksum|integrity|Invalid/);
    assert.equal((await readdir(root)).includes('damaged-restored'), false);
    assert.equal((await readdir(backupDir)).filter(name => name.endsWith('.sbcore')).length, 2);
  } finally { core.close(); await rm(root, { recursive: true, force: true }); }
});
