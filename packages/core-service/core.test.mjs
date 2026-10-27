import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { openCore, createCoreServer } from './core.mjs';

test('HTTP credentials, owner isolation, grants, revisions and proposal review', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'storybook-core-'));
  const core = openCore(join(dir, 'core.db'));
  const tokens = Object.fromEntries(['storybook', 'sandbox', 'comic'].map(app => [app, core.provision(app)]));
  const server = createCoreServer(core);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (app, method, path, data, overrideToken) => {
    const res = await fetch(base + path, {
      method, headers: { authorization: `Bearer ${overrideToken ?? tokens[app]}`, ...(data === undefined ? {} : { 'content-type': 'application/json' }) },
      ...(data === undefined ? {} : { body: JSON.stringify(data) })
    });
    return { status: res.status, data: await res.json() };
  };
  try {
    assert.equal((await call('storybook', 'GET', '/v1/workspaces', undefined, '0'.repeat(64))).status, 401);
    const workspaces = {};
    for (const app of Object.keys(tokens)) {
      const result = await call(app, 'POST', '/v1/workspaces', { kind: app === 'storybook' ? 'manuscript' : app === 'sandbox' ? 'session' : 'comic-project', ownerApp: 'comic' });
      assert.equal(result.status, 201);
      assert.equal(result.data.owner_app, app);
      workspaces[app] = result.data.id;
    }
    const manuscript = await call('storybook', 'POST', `/v1/workspaces/${workspaces.storybook}/records`, { entityId: 'shared-character', body: { text: 'original' }, ownerApp: 'sandbox' });
    assert.equal(manuscript.status, 201);
    const id = manuscript.data.id;
    for (const app of ['sandbox', 'comic']) {
      assert.equal((await call(app, 'GET', `/v1/workspaces/${workspaces.storybook}/records`)).status, 403);
      assert.equal((await call(app, 'PUT', `/v1/records/${id}`, { expectedRevision: 1, body: { text: 'tampered' } })).status, 403);
      assert.equal((await call(app, 'DELETE', `/v1/records/${id}`, { expectedRevision: 1 })).status, 403);
      assert.equal((await call(app, 'POST', `/v1/workspaces/${workspaces.storybook}/grants`, { readerApp: app })).status, 403);
      assert.equal((await call(app, 'POST', `/v1/workspaces/${workspaces.storybook}/records`, { body: { text: 'tampered' } })).status, 403);
    }
    assert.deepEqual((await call('storybook', 'GET', `/v1/records/${id}`)).data.body, { text: 'original' });
    assert.equal((await call('storybook', 'POST', `/v1/workspaces/${workspaces.storybook}/grants`, { readerApp: 'sandbox' })).status, 201);
    assert.equal((await call('sandbox', 'GET', `/v1/records/${id}`)).status, 200);
    assert.equal((await call('sandbox', 'PUT', `/v1/records/${id}`, { expectedRevision: 1, body: {} })).status, 403);
    const updated = await call('storybook', 'PUT', `/v1/records/${id}`, { expectedRevision: 1, body: { text: 'new canon' } });
    assert.equal(updated.data.revision, 2);
    assert.equal((await call('storybook', 'PUT', `/v1/records/${id}`, { expectedRevision: 1, body: {} })).status, 409);
    const source = await call('sandbox', 'POST', `/v1/workspaces/${workspaces.sandbox}/records`, { body: { observation: 1 } });
    assert.equal((await call('sandbox', 'GET', `/v1/revisions/${source.data.revisionId}`)).status, 200);
    assert.equal((await call('comic', 'GET', `/v1/revisions/${source.data.revisionId}`)).status, 403);
    assert.equal((await call('sandbox', 'POST', '/v1/proposals', { sourceWorkspaceId: workspaces.sandbox, targetWorkspaceId: workspaces.storybook, sourceRevision: randomInvalid(), entityId: 'shared-character', proposedChange: {} })).status, 400);
    const proposal = await call('sandbox', 'POST', '/v1/proposals', { sourceWorkspaceId: workspaces.sandbox, targetWorkspaceId: workspaces.storybook, sourceRevision: source.data.revisionId, entityId: 'shared-character', proposedChange: { text: 'suggested' } });
    assert.equal(proposal.status, 201);
    assert.equal((await call('sandbox', 'POST', `/v1/proposals/${proposal.data.id}/review`, { status: 'accepted' })).status, 403);
    assert.equal((await call('storybook', 'POST', `/v1/proposals/${proposal.data.id}/review`, { status: 'accepted', targetRecordId: source.data.id, expectedRevision: 1 })).status, 403);
    assert.equal((await call('storybook', 'POST', `/v1/proposals/${proposal.data.id}/review`, { status: 'accepted', targetRecordId: id, expectedRevision: 1 })).status, 409);
    const accepted = await call('storybook', 'POST', `/v1/proposals/${proposal.data.id}/review`, { status: 'accepted', targetRecordId: id, expectedRevision: 2 });
    assert.equal(accepted.status, 201);
    assert.equal(accepted.data.record.revision, 3);
    assert.equal(accepted.data.record.sourceRevision, source.data.revisionId);
    assert.deepEqual((await call('storybook', 'GET', `/v1/revisions/${updated.data.revisionId}`)).data.body, { text: 'new canon' });
    assert.equal((await call('storybook', 'POST', `/v1/proposals/${proposal.data.id}/review`, { status: 'accepted' })).status, 409);
    assert.deepEqual((await call('storybook', 'GET', `/v1/records/${id}`)).data.body, { text: 'suggested' });
    assert.equal((await call('comic', 'GET', `/v1/records/${id}`)).status, 403);
  } finally { server.close(); await once(server, 'close'); core.close(); rmSync(dir, { recursive: true, force: true }); }
});
function randomInvalid() { return 'missing-revision'; }

test('every app is subject to the same ownership rule, including after a read grant', () => {
  const dir = mkdtempSync(join(tmpdir(), 'storybook-core-'));
  const core = openCore(join(dir, 'core.db'));
  const apps = ['storybook', 'sandbox', 'comic'];
  try {
    for (const owner of apps) {
      const workspace = core.createWorkspace(owner, { kind: 'test' });
      const record = core.writeRecord(owner, workspace.id, { body: { owner } });
      for (const caller of apps.filter(app => app !== owner)) {
        assert.throws(() => core.updateRecord(caller, record.id, { expectedRevision: 1, body: {} }), { status: 403 });
        core.grant(owner, workspace.id, caller);
        assert.equal(core.getRecord(caller, record.id).revision, 1);
        assert.throws(() => core.updateRecord(caller, record.id, { expectedRevision: 1, body: {} }), { status: 403 });
        assert.throws(() => core.updateRecord(caller, record.id, { expectedRevision: 1 }, true), { status: 403 });
        assert.throws(() => core.writeRecord(caller, workspace.id, { body: {} }), { status: 403 });
      }
      assert.deepEqual(core.getRecord(owner, record.id).body, { owner });
      assert.equal(core.getRecord(owner, record.id).revision, 1);
    }
    assert.equal(core.auditRows().filter(row => row.action === 'record.update' || row.action === 'record.delete').length, 0);
  } finally { core.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('each project is private by default and its owner can share and revoke separately', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'core-visibility-'));
  const core = openCore(join(dir, 'core.db'));
  const tokens = Object.fromEntries(['storybook', 'sandbox', 'comic'].map(app => [app, core.provision(app)]));
  const server = createCoreServer(core);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (app, method, path, body) => {
    const response = await fetch(base + path, {
      method, headers: { authorization: `Bearer ${tokens[app]}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    const first = (await call('storybook', 'POST', '/v1/workspaces', { kind: 'manuscript', projectId: 'book-one' })).body;
    const second = (await call('storybook', 'POST', '/v1/workspaces', { kind: 'manuscript', projectId: 'book-two' })).body;
    const comic = (await call('comic', 'POST', '/v1/workspaces', { kind: 'comic-project', projectId: 'comic-one' })).body;
    assert.equal(first.project_id, 'book-one');
    assert.equal((await call('sandbox', 'GET', '/v1/workspaces')).body.length, 0);
    assert.equal((await call('storybook', 'GET', `/v1/workspaces/${first.id}/grants`)).body.length, 0);
    assert.equal((await call('sandbox', 'PUT', `/v1/workspaces/${first.id}/grants/comic`, { visible: true })).status, 403);
    assert.equal((await call('storybook', 'PUT', `/v1/workspaces/${first.id}/grants/sandbox`, { visible: true })).status, 200);
    assert.deepEqual((await call('sandbox', 'GET', '/v1/workspaces')).body.map(w => w.project_id), ['book-one']);
    assert.equal((await call('comic', 'GET', '/v1/workspaces')).body.length, 1);
    assert.equal((await call('sandbox', 'GET', `/v1/workspaces/${second.id}/records`)).status, 403);
    assert.equal((await call('storybook', 'PUT', `/v1/workspaces/${first.id}/grants/sandbox`, { visible: false })).status, 200);
    assert.equal((await call('sandbox', 'GET', '/v1/workspaces')).body.length, 0);
    assert.equal((await call('sandbox', 'GET', `/v1/workspaces/${first.id}/records`)).status, 403);
    assert.equal((await call('comic', 'PUT', `/v1/workspaces/${comic.id}/grants/storybook`, { visible: true })).status, 200);
    assert.equal((await call('storybook', 'GET', '/v1/workspaces')).body.some(w => w.id === comic.id), true);
    assert.equal((await call('storybook', 'PUT', `/v1/workspaces/${comic.id}/grants/sandbox`, { visible: true })).status, 403);
  } finally { server.close(); await once(server, 'close'); core.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('private full-book snapshots cannot be granted to another app', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'core-private-snapshot-'));
  const core = openCore(join(dir, 'core.db'));
  const tokens = Object.fromEntries(['storybook', 'sandbox', 'comic'].map(app => [app, core.provision(app)]));
  const server = createCoreServer(core);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (app, method, path, body) => {
    const response = await fetch(base + path, {
      method, headers: { authorization: `Bearer ${tokens[app]}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    const ws = (await call('storybook', 'POST', '/v1/workspaces', { kind: 'private-snapshot', projectId: 'book-one' })).body;
    const rec = (await call('storybook', 'POST', `/v1/workspaces/${ws.id}/records`, {
      body: { title: 'Draft', brainstorm: 'private notes', facts: [{ status: 'ai_proposed' }] }
    })).body;
    for (const app of ['sandbox', 'comic']) {
      assert.equal((await call('storybook', 'POST', `/v1/workspaces/${ws.id}/grants`, { readerApp: app })).status, 403);
      assert.equal((await call('storybook', 'PUT', `/v1/workspaces/${ws.id}/grants/${app}`, { visible: true })).status, 403);
      assert.equal((await call(app, 'GET', '/v1/workspaces')).body.length, 0);
      assert.equal((await call(app, 'GET', `/v1/records/${rec.id}`)).status, 403);
      assert.equal((await call(app, 'GET', `/v1/revisions/${rec.revisionId}`)).status, 403);
    }
    // A stale grant from an older database must not bypass the read boundary.
    const db = new DatabaseSync(join(dir, 'core.db'));
    try { db.prepare('INSERT INTO grants(workspace_id,reader_app) VALUES(?,?)').run(ws.id, 'sandbox'); }
    finally { db.close(); }
    assert.equal((await call('sandbox', 'GET', '/v1/workspaces')).body.length, 0);
    assert.equal((await call('sandbox', 'GET', `/v1/records/${rec.id}`)).status, 403);
    assert.equal((await call('sandbox', 'GET', `/v1/revisions/${rec.revisionId}`)).status, 403);
    assert.equal((await call('storybook', 'PUT', `/v1/workspaces/${ws.id}/grants/sandbox`, { visible: false })).status, 200);
    assert.deepEqual((await call('storybook', 'GET', `/v1/workspaces/${ws.id}/grants`)).body, []);
    assert.equal((await call('storybook', 'GET', `/v1/records/${rec.id}`)).body.body.brainstorm, 'private notes');
  } finally { server.close(); await once(server, 'close'); core.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('shared manuscript publishing stores only a validated projection and atomically changes readers', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'core-shared-manuscript-'));
  const core = openCore(join(dir, 'core.db'));
  const tokens = Object.fromEntries(['storybook', 'sandbox', 'comic'].map(app => [app, core.provision(app)]));
  const server = createCoreServer(core);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (app, method, path, body) => {
    const response = await fetch(base + path, {
      method, headers: { authorization: `Bearer ${tokens[app]}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return { status: response.status, body: await response.json() };
  };
  const projectId = 'book-one';
  const route = `/v1/shared-manuscripts/${projectId}`;
  const manuscript = {
    kind: 'storycore.manuscript-export', format: 2, exportedAt: '2026-10-27T00:00:00.000Z',
    sourceApp: 'storybook-ai', sourceBookId: projectId, title: 'Night Keys', illustrationStyle: '',
    synopsis: 'The full synopsis.',
    chapters: [
      { id: 'one', sequence_index: 0, title: 'One', prose: 'Entire chapter one.', brief: '', scenes: [] },
      { id: 'two', sequence_index: 1, title: 'Two', prose: 'Entire chapter two.', brief: '', scenes: [] }
    ],
    bible: [{ kind: 'characters', label: 'Characters', entities: [{ entity_ref: 'emma', name: 'Emma', facts: [{ predicate: 'core.identity', label: 'Identity', value: 'Bartender' }], referenceImages: [] }] }]
  };
  try {
    const privateWs = core.createWorkspace('storybook', { kind: 'private-snapshot', projectId });
    core.writeRecord('storybook', privateWs.id, { body: { brainstorm: 'Never shared', facts: [{ status: 'ai_proposed' }] } });
    assert.equal((await call('sandbox', 'PUT', route, { manuscript, readers: ['sandbox'] })).status, 403);
    assert.equal((await call('storybook', 'PUT', route, { manuscript: { title: 'Raw Book', brainstorm: 'Secret' }, readers: ['sandbox'] })).status, 400);
    assert.equal((await call('storybook', 'PUT', route, { manuscript: { ...manuscript, format: 1 }, readers: ['sandbox'] })).status, 400);
    assert.equal((await call('sandbox', 'GET', '/v1/workspaces')).body.length, 0);

    const published = await call('storybook', 'PUT', route, {
      manuscript: { ...manuscript, brainstorm: 'Secret root field', chapters: manuscript.chapters.map(chapter => ({ ...chapter, privateNotes: 'Secret chapter field' })) },
      readers: ['sandbox']
    });
    assert.equal(published.status, 200);
    const { workspace, record } = published.body;
    assert.equal(workspace.kind, 'shared-manuscript');
    assert.notEqual(workspace.id, privateWs.id);
    assert.equal(record.revision, 1);
    assert.equal(record.body.synopsis, 'The full synopsis.');
    assert.deepEqual(record.body.chapters.map(chapter => chapter.prose), ['Entire chapter one.', 'Entire chapter two.']);
    assert.equal(JSON.stringify(record.body).includes('Secret'), false);
    assert.deepEqual((await call('sandbox', 'GET', '/v1/workspaces')).body.map(ws => ws.id), [workspace.id]);
    assert.equal((await call('comic', 'GET', '/v1/workspaces')).body.length, 0);
    assert.equal((await call('sandbox', 'GET', `/v1/records/${record.id}`)).status, 200);
    assert.equal((await call('sandbox', 'GET', `/v1/workspaces/${privateWs.id}/records`)).status, 403);
    assert.equal((await call('sandbox', 'POST', `/v1/workspaces/${workspace.id}/records`, { body: manuscript })).status, 403);
    assert.equal((await call('storybook', 'POST', `/v1/workspaces/${workspace.id}/records`, { body: { brainstorm: 'Secret' } })).status, 403);
    assert.equal((await call('storybook', 'PUT', `/v1/records/${record.id}`, { expectedRevision: 1, body: { brainstorm: 'Secret' } })).status, 403);

    const repeated = await call('storybook', 'PUT', route, { manuscript: { ...manuscript, exportedAt: '2026-10-27T01:00:00.000Z' }, readers: ['sandbox'] });
    assert.equal(repeated.status, 200);
    assert.equal(repeated.body.record.revision, 1);

    const invalid = await call('storybook', 'PUT', route, { manuscript: { ...manuscript, sourceBookId: 'other' }, readers: ['comic'] });
    assert.equal(invalid.status, 400);
    assert.deepEqual((await call('sandbox', 'GET', '/v1/workspaces')).body.map(ws => ws.id), [workspace.id]);
    assert.equal((await call('comic', 'GET', '/v1/workspaces')).body.length, 0);

    const changed = await call('storybook', 'PUT', route, { manuscript: { ...manuscript, synopsis: 'Second synopsis.' }, readers: ['comic'] });
    assert.equal(changed.status, 200);
    assert.equal(changed.body.workspace.id, workspace.id);
    assert.equal(changed.body.record.revision, 2);
    assert.equal((await call('sandbox', 'GET', `/v1/records/${record.id}`)).status, 403);
    assert.equal((await call('sandbox', 'GET', `/v1/revisions/${record.revisionId}`)).status, 403);
    assert.equal((await call('comic', 'GET', `/v1/records/${record.id}`)).body.body.synopsis, 'Second synopsis.');
    assert.equal((await call('comic', 'GET', `/v1/revisions/${record.revisionId}`)).body.body.synopsis, 'The full synopsis.');
    assert.equal((await call('sandbox', 'DELETE', route)).status, 403);
    assert.equal((await call('storybook', 'DELETE', route)).status, 200);
    assert.equal((await call('comic', 'GET', `/v1/records/${record.id}`)).status, 403);
    assert.equal((await call('comic', 'GET', `/v1/revisions/${record.revisionId}`)).status, 403);
    assert.equal((await call('storybook', 'DELETE', route)).status, 200);
    assert.equal((await call('storybook', 'DELETE', '/v1/shared-manuscripts/never-shared')).status, 200);

    const sourceMetadata = await call('storybook', 'PUT', route, {
      manuscript: { ...manuscript, synopsis: 'Second synopsis.' }, readers: [],
      translationGroupId: 'translation-family', language: 'English'
    });
    assert.equal(sourceMetadata.body.record.revision, 2);
    const translated = await call('storybook', 'PUT', '/v1/shared-manuscripts/book-sv', {
      manuscript: { ...manuscript, sourceBookId: 'book-sv', synopsis: '', chapters: manuscript.chapters.map(chapter => ({ ...chapter, prose: 'Swedish prose' })), bible: [] },
      readers: ['comic'], translationGroupId: 'translation-family', language: 'Svenska'
    });
    assert.equal(translated.status, 200);
    assert.notEqual(translated.body.workspace.id, workspace.id);
    assert.equal(translated.body.record.revision, 1);
    const comicCatalog = (await call('comic', 'GET', '/v1/workspaces')).body;
    assert.deepEqual(comicCatalog.map(ws => [ws.project_id, ws.translation_group_id, ws.language]),
      [['book-sv', 'translation-family', 'Svenska']]);
    assert.equal((await call('comic', 'GET', `/v1/records/${record.id}`)).status, 403);
    assert.equal((await call('comic', 'GET', `/v1/workspaces/${privateWs.id}/records`)).status, 403);
  } finally { server.close(); await once(server, 'close'); core.close(); rmSync(dir, { recursive: true, force: true }); }
});
