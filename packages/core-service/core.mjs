import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { MANUSCRIPT_EXPORT_FORMAT, parseManuscriptExport } from '@ocedo-apps/storycore';

const apps = new Set(['storybook', 'sandbox', 'comic']);
const shareReaders = new Set(['sandbox', 'comic']);
const MAX_SHARED_MANUSCRIPT_BYTES = 20_000_000;
const digest = token => createHash('sha256').update(token).digest();
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const required = (value, name) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 256) fail(400, `Invalid ${name}`);
  return value;
};

export function openCore(path) {
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_keys (key_hash TEXT PRIMARY KEY, app TEXT NOT NULL CHECK(app IN ('storybook','sandbox','comic')));
    CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, owner_app TEXT NOT NULL CHECK(owner_app IN ('storybook','sandbox','comic')), kind TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS grants (workspace_id TEXT NOT NULL REFERENCES workspaces(id), reader_app TEXT NOT NULL, PRIMARY KEY(workspace_id,reader_app));
    CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), entity_id TEXT, source_revision TEXT, revision INTEGER NOT NULL, body TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id), workspace_id TEXT NOT NULL REFERENCES workspaces(id), number INTEGER NOT NULL, body TEXT NOT NULL, deleted INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(record_id,number));
    CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, source_workspace_id TEXT NOT NULL REFERENCES workspaces(id), target_workspace_id TEXT NOT NULL REFERENCES workspaces(id), source_revision TEXT NOT NULL REFERENCES revisions(id), entity_id TEXT NOT NULL, change_body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, reviewed_at TEXT);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, app TEXT NOT NULL, action TEXT NOT NULL, resource_id TEXT NOT NULL, at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), sha256 TEXT NOT NULL, size INTEGER NOT NULL, content_type TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  if (!db.prepare('PRAGMA table_info(workspaces)').all().some(column => column.name === 'project_id')) {
    db.exec('ALTER TABLE workspaces ADD COLUMN project_id TEXT');
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS workspaces_project_owner ON workspaces(owner_app,kind,project_id) WHERE project_id IS NOT NULL');
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  const get = (sql, ...args) => db.prepare(sql).get(...args);
  const all = (sql, ...args) => db.prepare(sql).all(...args);
  const transaction = fn => {
    db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); db.exec('COMMIT'); return result; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  const audit = (app, action, id) => run('INSERT INTO audit(app,action,resource_id,at) VALUES(?,?,?,?)', app, action, id, new Date().toISOString());
  const workspace = id => get('SELECT * FROM workspaces WHERE id=?', id) ?? fail(404, 'Workspace not found');
  const authorize = (app, id, operation) => {
    const ws = workspace(id);
    if (ws.owner_app !== app && ws.kind === 'private-snapshot') fail(403, 'Forbidden');
    if (ws.owner_app !== app && (operation !== 'read' || !get('SELECT 1 FROM grants WHERE workspace_id=? AND reader_app=?', id, app))) fail(403, 'Forbidden');
    return ws;
  };
  const record = id => get('SELECT * FROM records WHERE id=?', id) ?? fail(404, 'Record not found');
  const publicRecord = row => ({ id: row.id, workspaceId: row.workspace_id, entityId: row.entity_id, sourceRevision: row.source_revision, revision: row.revision, revisionId: get('SELECT id FROM revisions WHERE record_id=? AND number=?', row.id, row.revision)?.id, body: JSON.parse(row.body), deleted: !!row.deleted, createdAt: row.created_at, updatedAt: row.updated_at });
  const revision = (rec, now) => {
    const id = randomUUID();
    run('INSERT INTO revisions(id,record_id,workspace_id,number,body,deleted,created_at) VALUES(?,?,?,?,?,?,?)', id, rec.id, rec.workspace_id, rec.revision, rec.body, rec.deleted, now);
    return id;
  };
  return {
    close: () => db.close(),
    snapshotTo(destination) {
      db.prepare('VACUUM INTO ?').run(destination);
    },
    integrityCheck() { return db.prepare('PRAGMA integrity_check').get()?.integrity_check; },
    authorizeWorkspace: authorize,
    registerMedia(app, workspaceId, input) {
      return transaction(() => {
        const ws = authorize(app, workspaceId, 'write');
        if (ws.kind === 'shared-manuscript') fail(403, 'Shared manuscripts use the validated export only');
        const id = randomUUID();
        run('INSERT INTO media VALUES(?,?,?,?,?,?)', id, workspaceId, input.sha256, input.size, input.contentType, new Date().toISOString());
        audit(app, 'media.create', id);
        return { id, workspaceId, ...input };
      });
    },
    getMedia(app, id) {
      const media = get('SELECT * FROM media WHERE id=?', id) ?? fail(404, 'Media not found');
      authorize(app, media.workspace_id, 'read');
      return { id: media.id, workspaceId: media.workspace_id, sha256: media.sha256, size: media.size, contentType: media.content_type };
    },
    provision(app) {
      if (!apps.has(app)) fail(400, 'Unknown app');
      const token = randomBytes(32).toString('hex');
      run('INSERT INTO app_keys(key_hash,app) VALUES(?,?)', digest(token).toString('hex'), app);
      return token;
    },
    authenticate(token) {
      if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) fail(401, 'Unauthorized');
      const hash = digest(token);
      // Lookup is by the full secret hash; a constant time comparison avoids exposing a prefix.
      const row = get('SELECT key_hash,app FROM app_keys WHERE key_hash=?', hash.toString('hex'));
      if (!row || !timingSafeEqual(hash, Buffer.from(row.key_hash, 'hex'))) fail(401, 'Unauthorized');
      return row.app;
    },
    listWorkspaces(app) { return all("SELECT w.* FROM workspaces w WHERE w.owner_app=? OR (w.kind!='private-snapshot' AND EXISTS (SELECT 1 FROM grants g WHERE g.workspace_id=w.id AND g.reader_app=?))", app, app); },
    createWorkspace(app, input) {
      const kind = required(input.kind, 'kind');
      const projectId = input.projectId == null ? null : required(input.projectId, 'projectId');
      if (kind === 'shared-manuscript') fail(403, 'Use the manuscript publication route');
      const id = randomUUID(), now = new Date().toISOString();
      transaction(() => { run('INSERT INTO workspaces(id,owner_app,kind,created_at,project_id) VALUES(?,?,?,?,?)', id, app, kind, now, projectId); audit(app, 'workspace.create', id); });
      return workspace(id);
    },
    listGrants(app, id) {
      authorize(app, id, 'write');
      return all('SELECT reader_app AS readerApp FROM grants WHERE workspace_id=? ORDER BY reader_app', id);
    },
    grant(app, id, readerApp) {
      return this.setVisibility(app, id, readerApp, true);
    },
    setVisibility(app, id, readerApp, visible) {
      if (!apps.has(readerApp) || typeof visible !== 'boolean') fail(400, 'Invalid visibility');
      return transaction(() => {
        const ws = authorize(app, id, 'write');
        if (readerApp === ws.owner_app) fail(400, 'Owner access is inherent');
        // Full local project snapshots may contain hidden facts, notes and drafts.
        // They must never become readable through a workspace grant.
        if (visible && ws.kind === 'private-snapshot') fail(403, 'Private snapshots cannot be shared');
        if (visible) run('INSERT OR IGNORE INTO grants VALUES(?,?)', id, readerApp);
        else run('DELETE FROM grants WHERE workspace_id=? AND reader_app=?', id, readerApp);
        audit(app, visible ? 'grant.create' : 'grant.revoke', id);
        return { workspaceId: id, readerApp, visible };
      });
    },
    listRecords(app, id) {
      authorize(app, id, 'read');
      return all('SELECT * FROM records WHERE workspace_id=? AND deleted=0 ORDER BY created_at', id).map(publicRecord);
    },
    getRecord(app, id) { const rec = record(id); authorize(app, rec.workspace_id, 'read'); return publicRecord(rec); },
    publishSharedManuscript(app, projectId, input) {
      if (app !== 'storybook') fail(403, 'Only Storybook can publish a manuscript');
      required(projectId, 'projectId');
      if (!Array.isArray(input.readers) || new Set(input.readers).size !== input.readers.length ||
          input.readers.some(reader => !shareReaders.has(reader))) fail(400, 'Invalid readers');
      let manuscript;
      try { manuscript = parseManuscriptExport(input.manuscript); }
      catch { fail(400, 'Invalid manuscript export'); }
      if (manuscript.format !== MANUSCRIPT_EXPORT_FORMAT) fail(400, 'Current manuscript export format required');
      if (manuscript.sourceBookId !== projectId) fail(400, 'Manuscript ID mismatch');
      // Store the parsed contract, never unrecognized fields from a full Book.
      const body = JSON.stringify(manuscript);
      if (Buffer.byteLength(body) > MAX_SHARED_MANUSCRIPT_BYTES) fail(413, 'Manuscript too large');
      return transaction(() => {
        let ws = get('SELECT * FROM workspaces WHERE owner_app=? AND kind=? AND project_id=?', app, 'shared-manuscript', projectId);
        const now = new Date().toISOString();
        if (!ws) {
          const id = randomUUID();
          run('INSERT INTO workspaces(id,owner_app,kind,created_at,project_id) VALUES(?,?,?,?,?)', id, app, 'shared-manuscript', now, projectId);
          ws = workspace(id);
          audit(app, 'workspace.create', id);
        }
        const old = get('SELECT * FROM records WHERE workspace_id=?', ws.id);
        let recordId;
        if (old) {
          recordId = old.id;
          const previous = JSON.parse(old.body);
          // A retry, a reader toggle or a private-only edit must not invent a
          // manuscript revision merely because exportedAt changed.
          const { exportedAt: _oldAt, ...oldContent } = previous;
          const { exportedAt: _newAt, ...newContent } = manuscript;
          if (old.deleted || JSON.stringify(oldContent) !== JSON.stringify(newContent)) {
            run('UPDATE records SET revision=?, body=?, deleted=0, updated_at=? WHERE id=?', old.revision + 1, body, now, recordId);
            revision(record(recordId), now);
            audit(app, 'record.update', recordId);
          }
        } else {
          recordId = randomUUID();
          run('INSERT INTO records VALUES(?,?,?,?,?,?,?,?,?)', recordId, ws.id, null, null, 1, body, 0, now, now);
          revision(record(recordId), now);
          audit(app, 'record.create', recordId);
        }
        for (const reader of shareReaders) {
          if (input.readers.includes(reader)) run('INSERT OR IGNORE INTO grants VALUES(?,?)', ws.id, reader);
          else run('DELETE FROM grants WHERE workspace_id=? AND reader_app=?', ws.id, reader);
        }
        audit(app, 'manuscript.publish', ws.id);
        return { workspace: ws, record: publicRecord(record(recordId)), readers: input.readers };
      });
    },
    revokeSharedManuscript(app, projectId) {
      if (app !== 'storybook') fail(403, 'Only Storybook can revoke a manuscript');
      required(projectId, 'projectId');
      return transaction(() => {
        const ws = get('SELECT * FROM workspaces WHERE owner_app=? AND kind=? AND project_id=?', app, 'shared-manuscript', projectId);
        if (ws) {
          run('DELETE FROM grants WHERE workspace_id=?', ws.id);
          audit(app, 'manuscript.revoke', ws.id);
        }
        return { projectId, readers: [] };
      });
    },
    writeRecord(app, id, input) {
      return transaction(() => {
        const ws = authorize(app, id, 'write');
        if (ws.kind === 'shared-manuscript') fail(403, 'Use the manuscript publication route');
        if (input.body === undefined) fail(400, 'Missing body');
        const body = JSON.stringify(input.body);
        if (!body || body.length > 1_000_000) fail(400, 'Invalid body');
        const entityId = input.entityId == null ? null : required(input.entityId, 'entityId');
        const sourceRevision = input.sourceRevision == null ? null : required(input.sourceRevision, 'sourceRevision');
        const recordId = randomUUID(), now = new Date().toISOString();
        run('INSERT INTO records VALUES(?,?,?,?,?,?,?,?,?)', recordId, id, entityId, sourceRevision, 1, body, 0, now, now);
        revision(record(recordId), now); audit(app, 'record.create', recordId);
        return publicRecord(record(recordId));
      });
    },
    updateRecord(app, id, input, deleting = false) {
      return transaction(() => {
        const old = record(id); const ws = authorize(app, old.workspace_id, deleting ? 'delete' : 'write');
        if (ws.kind === 'shared-manuscript') fail(403, 'Use the manuscript publication route');
        if (old.deleted) fail(404, 'Record not found');
        if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision !== old.revision) fail(409, 'Revision conflict');
        if (!deleting && input.body === undefined) fail(400, 'Missing body');
        const body = deleting ? old.body : JSON.stringify(input.body);
        if (!body || body.length > 1_000_000) fail(400, 'Invalid body');
        const now = new Date().toISOString();
        run('UPDATE records SET revision=?, body=?, deleted=?, updated_at=? WHERE id=?', old.revision + 1, body, deleting ? 1 : 0, now, id);
        revision(record(id), now); audit(app, deleting ? 'record.delete' : 'record.update', id);
        return publicRecord(record(id));
      });
    },
    getRevision(app, id) {
      const rev = get('SELECT * FROM revisions WHERE id=?', id) ?? fail(404, 'Revision not found');
      authorize(app, rev.workspace_id, 'read');
      return { ...rev, body: JSON.parse(rev.body), deleted: !!rev.deleted };
    },
    propose(app, input) {
      return transaction(() => {
        const source = required(input.sourceWorkspaceId, 'sourceWorkspaceId');
        const target = required(input.targetWorkspaceId, 'targetWorkspaceId');
        authorize(app, source, 'write'); workspace(target);
        const rev = get('SELECT * FROM revisions WHERE id=?', required(input.sourceRevision, 'sourceRevision'));
        if (!rev || rev.workspace_id !== source) fail(400, 'Invalid source revision');
        const entityId = required(input.entityId, 'entityId');
        const change = JSON.stringify(input.proposedChange);
        if (!change || change.length > 1_000_000) fail(400, 'Invalid proposed change');
        const id = randomUUID(), now = new Date().toISOString();
        run('INSERT INTO proposals(id,source_workspace_id,target_workspace_id,source_revision,entity_id,change_body,created_at) VALUES(?,?,?,?,?,?,?)', id, source, target, rev.id, entityId, change, now);
        audit(app, 'proposal.submit', id);
        return { id, status: 'pending' };
      });
    },
    review(app, id, status, targetRecordId, expectedRevision) {
      if (!['accepted', 'rejected'].includes(status)) fail(400, 'Invalid status');
      return transaction(() => {
        const proposal = get('SELECT * FROM proposals WHERE id=?', id) ?? fail(404, 'Proposal not found');
        authorize(app, proposal.target_workspace_id, 'write');
        if (proposal.status !== 'pending') fail(409, 'Already reviewed');
        const now = new Date().toISOString();
        let materialized;
        if (status === 'accepted') {
          const target = record(required(targetRecordId, 'targetRecordId'));
          if (target.workspace_id !== proposal.target_workspace_id) fail(403, 'Forbidden');
          if (workspace(target.workspace_id).kind === 'shared-manuscript') fail(403, 'Shared manuscripts cannot accept direct record changes');
          if (target.deleted || !Number.isSafeInteger(expectedRevision) || expectedRevision !== target.revision) fail(409, 'Revision conflict');
          run('UPDATE records SET revision=?,body=?,source_revision=?,updated_at=? WHERE id=?',
            target.revision + 1, proposal.change_body, proposal.source_revision, now, target.id);
          const updated = record(target.id);
          revision(updated, now); audit(app, 'record.update', target.id);
          materialized = publicRecord(updated);
        }
        run('UPDATE proposals SET status=?,reviewed_at=? WHERE id=?', status, now, id);
        audit(app, 'proposal.review', id);
        return { id, status, ...(materialized ? { record: materialized } : {}) };
      });
    },
    auditRows: () => all('SELECT * FROM audit ORDER BY id')
  };
}

export function createCoreServer(core, { mediaDir } = {}) {
  return createServer(async (req, res) => {
    const send = (status, value) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(value)); };
    try {
      const app = core.authenticate(/^Bearer ([0-9a-f]{64})$/.exec(req.headers.authorization ?? '')?.[1]);
      const url = new URL(req.url ?? '/', 'http://localhost');
      const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      if (parts[0] !== 'v1') fail(404, 'Not found');
      const body = async () => {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > MAX_SHARED_MANUSCRIPT_BYTES + 1_000_000) fail(413, 'Body too large'); chunks.push(chunk); }
        try { const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail(400, 'Invalid JSON object'); return parsed; }
        catch (error) { if (error.status) throw error; fail(400, 'Invalid JSON'); }
      };
      const method = req.method;
      let result;
      if (parts.length === 4 && parts[1] === 'workspaces' && parts[3] === 'media' && method === 'POST') {
        if (!mediaDir) fail(503, 'Media storage not configured');
        core.authorizeWorkspace(app, parts[2], 'write');
        const contentType = req.headers['content-type'];
        if (typeof contentType !== 'string' || !/^(image|audio|video|application)\/[a-z0-9.+-]+$/.test(contentType)) fail(400, 'Invalid content type');
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 10_000_000) fail(413, 'Media too large'); chunks.push(chunk); }
        if (!size) fail(400, 'Empty media');
        const bytes = Buffer.concat(chunks);
        const hash = createHash('sha256').update(bytes).digest('hex');
        await mkdir(mediaDir, { recursive: true, mode: 0o700 });
        const path = join(mediaDir, hash), temp = join(mediaDir, '.' + randomUUID() + '.partial');
        const file = await open(temp, 'wx', 0o600);
        try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
        try {
          // Content-addressed files are immutable. Existing identical bytes need no replacement.
          try { await rename(temp, path); } catch (error) { throw error; }
          result = core.registerMedia(app, parts[2], { sha256: hash, size, contentType });
        } finally { await rm(temp, { force: true }); }
        send(201, result); return;
      }
      if (parts.length === 3 && parts[1] === 'media' && method === 'GET') {
        if (!mediaDir) fail(503, 'Media storage not configured');
        const media = core.getMedia(app, parts[2]);
        const bytes = await readFile(join(mediaDir, media.sha256));
        if (bytes.length !== media.size || createHash('sha256').update(bytes).digest('hex') !== media.sha256) fail(500, 'Media integrity error');
        res.writeHead(200, { 'content-type': media.contentType, 'content-length': bytes.length, 'cache-control': 'no-store' }); res.end(bytes); return;
      }
      if (parts.length === 2 && parts[1] === 'workspaces' && method === 'GET') result = core.listWorkspaces(app);
      else if (parts.length === 3 && parts[1] === 'shared-manuscripts' && method === 'PUT') result = core.publishSharedManuscript(app, parts[2], await body());
      else if (parts.length === 3 && parts[1] === 'shared-manuscripts' && method === 'DELETE') result = core.revokeSharedManuscript(app, parts[2]);
      else if (parts.length === 2 && parts[1] === 'workspaces' && method === 'POST') result = core.createWorkspace(app, await body());
      else if (parts.length === 4 && parts[1] === 'workspaces' && parts[3] === 'grants' && method === 'POST') result = core.grant(app, parts[2], (await body()).readerApp);
      else if (parts.length === 4 && parts[1] === 'workspaces' && parts[3] === 'grants' && method === 'GET') result = core.listGrants(app, parts[2]);
      else if (parts.length === 5 && parts[1] === 'workspaces' && parts[3] === 'grants' && method === 'PUT') {
        result = core.setVisibility(app, parts[2], parts[4], (await body()).visible);
      }
      else if (parts.length === 4 && parts[1] === 'workspaces' && parts[3] === 'records' && method === 'GET') result = core.listRecords(app, parts[2]);
      else if (parts.length === 4 && parts[1] === 'workspaces' && parts[3] === 'records' && method === 'POST') result = core.writeRecord(app, parts[2], await body());
      else if (parts.length === 3 && parts[1] === 'records' && method === 'GET') result = core.getRecord(app, parts[2]);
      else if (parts.length === 3 && parts[1] === 'records' && method === 'PUT') result = core.updateRecord(app, parts[2], await body());
      else if (parts.length === 3 && parts[1] === 'records' && method === 'DELETE') result = core.updateRecord(app, parts[2], await body(), true);
      else if (parts.length === 3 && parts[1] === 'revisions' && method === 'GET') result = core.getRevision(app, parts[2]);
      else if (parts.length === 2 && parts[1] === 'proposals' && method === 'POST') result = core.propose(app, await body());
      else if (parts.length === 4 && parts[1] === 'proposals' && parts[3] === 'review' && method === 'POST') {
        const input = await body();
        result = core.review(app, parts[2], input.status, input.targetRecordId, input.expectedRevision);
      }
      else fail(404, 'Not found');
      send(method === 'POST' ? 201 : 200, result);
    } catch (error) { send(error.status ?? 500, { error: error.status ? error.message : 'Internal error' }); }
  });
}
