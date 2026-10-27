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
10. Offline apps may keep local caches, but synchronization never bypasses these checks.

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
