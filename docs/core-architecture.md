# Storybook Core — isolated workspaces (draft v0)

Core is a neutral local service for Storybook, Sandbox and Comic. Every application owns its facts and derivatives. Shared entity IDs are references, **not** shared mutable records.

## Invariants

1. Every record has `ownerApp`, `workspaceId`, `id`, `revision`, `createdAt`, `updatedAt`.
2. Write/delete operations require an authenticated app identity matching `ownerApp`. The client must never be trusted to assert its own identity.
3. Reading another workspace requires an explicit publication or grant. A grant to read never grants write access.
4. Storybook canon can change only through Storybook-owned writes. Incoming proposals are immutable submissions, not canon.
5. Sandbox sessions and Comic projects pin the source manuscript revision and record local overrides as separate data.
6. No cross-app cascade update or delete; a source revision does not rewrite consumers' historical snapshots.
7. Each accepted proposal creates a new revision with provenance; previous revisions remain retrievable.
8. Denied operations must be atomic and leave data unchanged.
9. Core is equally restrictive toward all three apps.
10. Storybook's existing IndexedDB repositories remain its primary, working persistence. Core is optional; an unavailable Core must never block or alter local save, load, or delete. Synchronization never bypasses Core's access checks.

## Additive integration contract

The current Storybook IndexedDB stores (`books`, `series`, `illustration_styles`) are not being replaced or migrated by this Core slice. Core starts as an opt-in copy of explicitly selected Storybook-owned data, with separate Core revision IDs. The existing repository APIs and local behavior remain unchanged.

Future synchronization must be a separate adapter outside the IndexedDB write transaction: complete the local save first, queue a retryable outbound change, then send it when Core is available. A Core failure must leave the local write successful and visibly mark the copy as pending. Import from Core into Storybook must require an explicit user choice and must not silently overwrite IndexedDB data. Core backups cover only successfully synchronized data; local app export remains necessary for pending changes. Any later decision to change the primary store requires its own migration plan, tests and explicit product decision.

## Initial resources

- `/v1/workspaces`: list workspaces visible to caller.
- `/v1/workspaces/:id/records`: read published or owned records, write only owned records.
- `/v1/proposals`: submit a proposal to another workspace; receiving owner alone may accept and materialize it.
- `/v1/revisions/:id`: retrieve permitted immutable revisions.

A record can reference `entityId` and `sourceRevision`; references never imply ownership of the source record. Store large media separately, under the same access policy.

## Implementation order

1. Pure authorization/domain module and denial tests.
2. SQLite-backed transactional service with app authentication and audit log.
3. Publication and proposal workflow.
4. Local discovery API and read-only Storybook catalog for Sandbox.
5. Comic integration, migrations, backup and offline sync.

**Security note:** a caller-supplied `ownerApp` is not authentication. Desktop apps must obtain scoped credentials through the local service; the service validates them before passing the verified principal to the authorization layer.

## Executable local service (first slice)

`packages/core-service` runs independently of the Storybook UI on Node 22.13+ (tested on Node 24). It uses Node's built-in SQLite driver and HTTP server; no Tauri or Vite process is required. Data persists at `CORE_DB_PATH`. The server listens on `127.0.0.1` only, default port 43127. For example:

```sh
CORE_DB_PATH=./core.db node packages/core-service/server.mjs provision storybook
CORE_DB_PATH=./core.db node packages/core-service/server.mjs provision sandbox
CORE_DB_PATH=./core.db node packages/core-service/server.mjs provision comic
CORE_DB_PATH=./core.db node packages/core-service/server.mjs
```

Capture each generated token once and supply it as `Authorization: Bearer <token>` to that app. Provisioning is an administrator action performed outside the HTTP API. Store the tokens in an OS credential store, keep the SQLite file and token storage private to the local account, and never embed any token in frontend JavaScript. A same-user process with direct filesystem access to the DB remains outside this API's isolation boundary. Token rotation, OS-mediated app attestation, encrypted storage and multi-user installation are future integration work.

### Data model and routes

SQLite tables: `app_keys` (hashed credentials and verified app), `workspaces` (owner and kind), `grants` (explicit read permission), `records` (current state), `revisions` (immutable per-record history), `proposals` (separate pending submission), and `audit` (successful changes). IDs are UUIDs. A record optionally has `entityId` and `sourceRevision` as references; these do not transfer ownership. `kind` distinguishes manuscript, session and comic project, but each workspace has its own timeline. The DB is version zero; migrations and external media storage are not yet implemented.

| Method | Route | Permission |
| --- | --- | --- |
| GET, POST | `/v1/workspaces` | List owned or granted; create owned |
| POST | `/v1/workspaces/:id/grants` | Owner grants a reader app |
| GET, POST | `/v1/workspaces/:id/records` | Owner or grantee reads; owner writes |
| GET, PUT, DELETE | `/v1/records/:id` | Owner or grantee reads; owner changes |
| GET | `/v1/revisions/:id` | Owner or grantee reads |
| POST | `/v1/proposals` | Source owner submits its own existing revision |
| POST | `/v1/proposals/:id/review` | Target owner rejects or accepts |

PUT and DELETE require `expectedRevision`; conflicts return 409 without changing data. A proposal has `sourceWorkspaceId`, `targetWorkspaceId`, `sourceRevision`, `entityId`, and `proposedChange` (a complete replacement body). Acceptance requires `targetRecordId` and `expectedRevision`: the target owner explicitly selects its record, creates a new immutable revision with source provenance, and marks the proposal accepted in one transaction. Rejection records the decision without changing canon. The initial API leaves record creation, discovery, offline queues and synchronization to later app integration.

Run `npm run test:core-service` for HTTP/SQLite isolation tests and `npm test -- --run tests/core/workspace-access.test.ts` for the pure policy tests.

## Encrypted Core backups (first slice)

The operator can select any writable directory through `CORE_BACKUP_DIR`, including a mounted external disk or a folder synchronized by another program. Core writes an authenticated AES-256-GCM encrypted `.sbcore` archive there. The archive contains a consistent SQLite snapshot made with `VACUUM INTO`, the contents of `CORE_MEDIA_DIR` (default: `CORE_DB_PATH.media`), and an encrypted manifest with checksums. The archive is decrypted and checked before its temporary name is published. Files with invalid media types such as symlinks are rejected. The CLI supports one-shot and scheduled runs; direct cloud uploads are not implemented.

```sh
# Supply the recovery phrase on standard input using a secure prompt or secret store.
CORE_DB_PATH=./core.db CORE_MEDIA_DIR=./media CORE_BACKUP_DIR=/mounted/backups \
  CORE_BACKUP_KEEP=10 node packages/core-service/server.mjs backup

# Restore to a NEW directory, leaving the running installation untouched.
node packages/core-service/server.mjs restore /mounted/backups/storybook-core-....sbcore ./restored-core
```

The backup and restore commands read one recovery phrase line from standard input. Do not put it in shell arguments, environment variables, logs, or in the backup folder. Keep a recoverable copy separate from the storage destination: losing the phrase means losing access to the archive. The target folder receives only encrypted `.sbcore` files and optional `.keep` markers. An archive can be pinned by placing an empty `<archive>.keep` file next to it.

`CORE_BACKUP_KEEP` defaults to 10 (range 1–1000). After a new backup passes decryption, checksums, and SQLite integrity validation, Core retains the newest N unpinned archives and removes older unpinned archives. Pinned copies are additional to N. Failed backup creation does not trigger pruning. Restoring refuses to overwrite an existing directory, checks authentication, every file hash and SQLite integrity, then publishes the restored directory. The operator must stop the old service before switching `CORE_DB_PATH` and `CORE_MEDIA_DIR` to the restored directory. App credentials are stored as hashes in SQLite; provision new credentials if required after moving installations.

Media writers external to Core must not change files while a backup runs. This is a local encrypted export; destination health reporting and periodic restore drills remain follow-up work.

### Core-managed media and scheduled runs

The service now accepts binary `POST /v1/workspaces/:id/media` with a valid content type and up to 10 MB, and serves `GET /v1/media/:id`. The verified workspace owner alone uploads; owner and explicit grantees can read. Files are written to a temporary name, flushed, then published under their SHA-256 hash and registered in SQLite. They are immutable and never physically removed by the API, so a backup can snapshot SQLite and then copy completed files without a cross-process write pause. Temporary `.partial` files are skipped by backup. Old unreferenced media still needs a retention-aware garbage collection design.

Run `backup-schedule` instead of `backup` with the same environment and recovery phrase supplied on stdin. It creates one backup immediately and repeats every `CORE_BACKUP_INTERVAL_HOURS` (default 24, range 1–168) while the process remains running. Each run verifies the archive before retention pruning. Errors are reported on stderr and the next scheduled run remains pending. An OS service or scheduler must keep this process running; after restart, the recovery phrase must be supplied again. A desktop settings view and OS credential storage are still future integrations.
