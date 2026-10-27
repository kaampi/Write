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
11. A full app-owned snapshot containing private fields belongs to a `private-snapshot` workspace. Core rejects read grants on that workspace. A shared manuscript is a separate projection, never the full `Book` object.

## Additive integration contract

The current Storybook IndexedDB stores (`books`, `series`, `illustration_styles`) are not being replaced or migrated by this Core slice. Core starts as an opt-in copy of explicitly selected Storybook-owned data, with separate Core revision IDs. The existing repository APIs and local behavior remain unchanged.

Future automatic synchronization must be a separate adapter outside the IndexedDB write transaction: complete the local save first, queue a retryable outbound change, then send it when Core is available. No manual backup action is needed for sharing. A Core failure must leave the local write successful and visibly mark the copy as pending. Import from Core into Storybook must require an explicit user choice and must not silently overwrite IndexedDB data. Core backups cover only successfully synchronized data; local app export remains necessary for pending changes. Any later decision to change the primary store requires its own migration plan, tests and explicit product decision.

The first opt-in Storybook pilot adds a separate `storybook-core-outbox` IndexedDB database. The existing `storybook-ai` schema is untouched. An injected sink can enqueue saves and deletes only after the local repository operation succeeds; Core transport errors keep changes pending and do not fail the local operation. The queue contains a **full `Book` snapshot for an owner-only `private-snapshot` workspace**, not a sharing payload; Core rejects grants to that kind. The queue collapses repeated saves of one book to the latest snapshot and protects newer edits from a late acknowledgment. It is not enabled in the UI or connected to live Core credentials yet. Before enabling it, implement privileged app authentication, a Core transport that creates only `private-snapshot` workspaces for this queue, persistent workspace/record mapping and revision-conflict handling, startup reconciliation for queue-storage failures, and deliberate manuscript history checkpoints (the collapsed snapshots are not a complete revision history). Large books and media may exceed the current API body limit and need a separate transfer design.

The per-manuscript sharing switch must publish a **separate, shareable projection** built by Storybook's existing `packManuscriptExport(book, exportedAt, seriesFacts)`, including the applicable inherited series facts. It includes the full prose of every chapter and the synopsis, plus only locked Story Bible facts surviving `visibleLockedFacts` (the Draft visibility rule); Brainstorm and its notes, `ai_proposed`/`flagged` facts, hidden facts and hidden entities do not cross this boundary. A grant applies only to that projected workspace. Revoking a grant removes Core read access to its current record and revisions; already imported independent projects cannot be retracted. The projection must be regenerated when the book or inherited facts change. A raw `Book` must never be written to a grantable workspace.

Storybook now has a pure `buildCoreManuscriptPublication()` adapter that calls that existing export path. Core accepts `PUT /v1/shared-manuscripts/:projectId` from its verified Storybook identity with `{ manuscript, readers }`, where `readers` is an explicit subset of `sandbox` and `comic`. In one SQLite transaction it creates or revises a separate `shared-manuscript` workspace/record and sets the grants. It rejects raw `Book` bodies and mismatched book IDs, parses with the shared StoryCore schema, and stores only the parsed fields so unexpected private properties are discarded. Generic workspace creation, record changes and media uploads cannot populate this special workspace; accepting a proposal cannot replace its record. Changed manuscript content creates an immutable revision. The endpoint accepts up to 20 MB of serialized export and fails whole on larger input; there is no partial publication. No credentials are kept in frontend storage.
`DELETE /v1/shared-manuscripts/:projectId` revokes every reader without requiring a manuscript body. It is idempotent, so deletion or opt-out can be retried after an offline period. Repeated publication of unchanged manuscript content does not create a duplicate revision merely because `exportedAt` or readers changed.

The publication request also carries `translationGroupId` and `language` as catalog metadata outside the StoryCore export body. Older clients default to a one-book group and empty language. Updating the metadata alone does not create a manuscript revision.

The optional `CoreSharingOutbox` stores per-book Sandbox/Comic choices and pending status in a separate `storybook-core-sharing` IndexedDB database, defaulting to neither app. It is now injected into the running Storybook `BookRepository`: a local save marks only an already shared manuscript pending, and deletion queues revocation; local operations still succeed if this queue fails. Saving a series also marks its shared member books pending so the next publication loads current inherited facts; other series and private books are unaffected. On flush it loads the latest book and inherited series facts, builds the existing filtered export, and sends it through the native transport; a failed call leaves the choice pending, and an in-flight acknowledgment cannot erase a newer opt-out. The desktop app retries on launch, network reconnection and a 30-second interval, and the per-book Core dialog allows manual retry. The browser UI cannot connect. Reconciliation after queue-storage failure or a restored/lost local choice database remains an integration gate; deleting a series while books still refer to it must also be reconciled before safely republishing those books. Until Core acknowledges revocation, a previously shared remote projection remains readable. The dialog reports local pending state, not a verified remote grant inventory. No credential is stored in IndexedDB or frontend JavaScript.

The first Windows desktop bridge has a fixed loopback destination (`127.0.0.1:43127`) and commands to pair, check connection, publish and revoke. Pairing validates the token against Core's authenticated `/v1/identity` endpoint and requires the verified `storybook` identity before it is stored in Windows Credential Manager. Publication/revocation read it natively; the secret is never returned to JavaScript or persisted in IndexedDB/localStorage. The pairing input itself passes through the desktop UI transiently. The browser-only version has no native Core transport. The running UI opens the Core dialog from the top bar of a manuscript. Non-default Core ports, other operating systems, credential rotation, series-triggered republishing and remote grant reconciliation remain future work. Windows CI compiles the native bridge separately from the Node/TypeScript checks.

Each manuscript, Sandbox session or Comic project gets its own workspace, optionally linked to the local app's project ID through `projectId`. A new workspace is private. The owning app may grant read access to `storybook`, `sandbox`, or `comic` individually, and may revoke it at any time. Revocation immediately removes access to workspace discovery, current records, revisions and media through the Core API. Neither a shared entity ID nor a grant gives another app write access. A client UI should show per-project switches for the other apps, default off; the Core setting is the enforced authority for shared reads.

Storybook language versions are separate `Book` records with distinct IDs. Each has its own private snapshot, optional shared workspace, revision history and Sandbox/Comic reader choices. The shared workspace catalog stores `language` and `translation_group_id` alongside its project ID so consumers can group **only the versions they may read**; grouping never grants access to another version, and updating or restoring one does not mutate its siblings. The StoryCore `ManuscriptExport` body remains unchanged. Storybook currently creates a translated book with empty synopsis and Bible and links it to its source for translation. Publishing that version uses its own prose/synopsis/facts and does **not** expose the source book's private Bible. If Comic needs the original's canon too, the original must be independently shared and selected with its own grant. A detached new-book restore of a translation becomes independent; same-book restore retains translation links.

From an older project revision, its owning app should offer two distinct actions: restore into the same project as a new revision (preserving the intervening Core history), or create a new project from that snapshot. The latter receives its own workspace, revision timeline and private-by-default grants, with a provenance reference to the source revision. Neither action rewrites the original historical revision or another app's project. Storybook currently has only per-chapter prose history: Core can create whole-book revisions from deliberate confirmed snapshots, but the coalescing outbox cannot reconstruct every intermediate local edit. Version summaries are illustrative UI copy until deterministic diffs or optional author notes exist; do not invent summaries of changes.

Storybook's existing Home import already parses a `storybook-ai.manuscript` JSON backup with `parseManuscriptBackup()`. It checks `backup.book.id`: an existing local ID prompts before replacing that IndexedDB row, while a missing ID saves a new book. Reuse this validated save flow for a **full, owner-only `Book` snapshot** retrieved from Core, after wrapping it in the Storybook backup envelope and validating it; a shareable `ManuscriptExport` projection lacks private fields and is not a whole-book restore source. Core's `.sbcore` archive is a backup of the entire Core service and must first be restored as a service, not passed to Storybook's file-import parser.

`prepareCoreBookRestore()` now performs that pure, read-only preparation. It requires a non-deleted revision from a Storybook-owned `private-snapshot` workspace whose project ID matches the validated Book ID, then round-trips through the existing backup parser. `same-book` retains the ID and, when supplied the current local Book, preserves its present translation family/source-book links: an old revision may predate the creation of sibling language versions. `new-book` creates a distinct ID, detaches book/chapter translation source pointers and translation group, and retains `series_id` only if that series is known locally. It returns Core source workspace/revision IDs as separate provenance metadata. It does not save, prompt, checkpoint or fetch anything; the UI and privileged transport are still future wiring. Internal chapter/entity IDs remain scoped within the newly distinct Book; a collision check against the actual shelf must precede saving a new ID.

For “restore as new version,” keep the book ID, confirm replacement, and create a new Core revision after the write. The current file-import path overwrites the local row and may replace newer per-chapter `revisions`; it does not itself preserve a local whole-book timeline or make a Core checkpoint. Before wiring the action, ensure the current local state has been captured if it is to remain recoverable, and handle conflicts/offline status. For “create new manuscript,” check the fresh ID against the local shelf before the same save flow. The new Core workspace and provenance link are separate metadata, and its sharing choices start private. This is small adaptation around the import flow, not a new manuscript parser.

Each app should expose a small Core panel for its own projects: connection and pending-sync state, plus the per-project sharing switches. Service-wide administration belongs to a separate local Core management surface: backup destination and schedule, recovery, storage health and credential provisioning. The management surface must not grant one creative app permission to change another app's project data.

## Initial resources

- `/v1/workspaces`: list workspaces visible to caller.
- `/v1/workspaces/:id/records`: read published or owned records, write only owned records.
- `/v1/proposals`: submit a proposal to another workspace; receiving owner alone may accept and materialize it.
- `/v1/revisions/:id`: retrieve permitted immutable revisions.
- `PUT /v1/shared-manuscripts/:projectId`: Storybook alone publishes a validated export and sets its readers atomically.
- `DELETE /v1/shared-manuscripts/:projectId`: Storybook revokes all readers, including after local book deletion.

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
| PUT | `/v1/shared-manuscripts/:projectId` | Verified Storybook app publishes the filtered export and sets Sandbox/Comic readers |
| DELETE | `/v1/shared-manuscripts/:projectId` | Verified Storybook app revokes every reader; safe to retry |
| POST | `/v1/workspaces/:id/grants` | Owner grants a reader app, except on private snapshots |
| GET | `/v1/workspaces/:id/grants` | Owner views reader apps |
| PUT | `/v1/workspaces/:id/grants/:readerApp` | Owner sets `visible: true/false` |
| GET, POST | `/v1/workspaces/:id/records` | Owner or grantee reads; owner writes |
| GET, PUT, DELETE | `/v1/records/:id` | Owner or grantee reads; owner changes |
| GET | `/v1/revisions/:id` | Owner or grantee reads |
| POST | `/v1/proposals` | Source owner submits its own existing revision |
| POST | `/v1/proposals/:id/review` | Target owner rejects or accepts |

Generic record PUT and DELETE require `expectedRevision`; conflicts return 409 without changing data. Shared manuscripts are changed only through their dedicated publication route. A proposal has `sourceWorkspaceId`, `targetWorkspaceId`, `sourceRevision`, `entityId`, and `proposedChange` (a complete replacement body). Acceptance requires `targetRecordId` and `expectedRevision`: the target owner explicitly selects its record, creates a new immutable revision with source provenance, and marks the proposal accepted in one transaction. Rejection records the decision without changing canon. A shared manuscript cannot be overwritten by proposal acceptance. The initial API still needs a privileged desktop client and offline synchronization wiring.

Run `npm run test:core-service` for HTTP/SQLite isolation tests and `npm test -- --run tests/core/workspace-access.test.ts` for the pure policy tests.

## Encrypted Core backups (first slice)

The operator can select any writable directory through `CORE_BACKUP_DIR`, including a mounted external disk or a folder synchronized by another program. `CORE_BACKUP_ENCRYPTION=on` (the default) writes an authenticated AES-256-GCM encrypted `.sbcore` archive. `CORE_BACKUP_ENCRYPTION=off` writes an unencrypted archive that needs no recovery phrase. Both formats contain a consistent SQLite snapshot made with `VACUUM INTO`, the contents of `CORE_MEDIA_DIR` (default: `CORE_DB_PATH.media`), and a manifest with checksums. Each archive is read back and checked before its temporary name is published. Files with invalid media types such as symlinks are rejected. The CLI supports one-shot and scheduled runs; direct cloud uploads are not implemented.

```sh
# Supply the recovery phrase on standard input using a secure prompt or secret store.
CORE_DB_PATH=./core.db CORE_MEDIA_DIR=./media CORE_BACKUP_DIR=/mounted/backups \
  CORE_BACKUP_KEEP=10 node packages/core-service/server.mjs backup

# A plain backup needs no phrase on stdin.
CORE_DB_PATH=./core.db CORE_BACKUP_DIR=/mounted/backups \
  CORE_BACKUP_ENCRYPTION=off node packages/core-service/server.mjs backup

# Restore to a NEW directory, leaving the running installation untouched.
node packages/core-service/server.mjs restore /mounted/backups/storybook-core-....sbcore ./restored-core
```

Encrypted backup and restore commands read one recovery phrase line from standard input. Do not put it in shell arguments, environment variables, logs, or in the backup folder. Keep a recoverable copy separate from the storage destination: losing the phrase means losing access to encrypted archives. Plain backups neither prompt for nor require a phrase. The target folder receives `.sbcore` files and optional `.keep` markers. An archive can be pinned by placing an empty `<archive>.keep` file next to it. The mode is recorded in each archive, so changing the setting affects future backups only; restore recognizes both formats.

Plain backups expose the entire database, media and manifest to anyone who can read the destination. Their checksums detect accidental damage, but an attacker who can replace a plain archive can also replace its checksums. Encrypted archives authenticate their contents. Core must not claim that Nextcloud's server-side encryption, a private server or HTTPS provides the same protection as encryption before upload. Use HTTPS for any remote destination regardless of this setting.

This setting encrypts only the exported backup archive. The live SQLite database and media directory are not encrypted by Core; access to them depends on local filesystem permissions or optional operating-system disk encryption.

`CORE_BACKUP_KEEP` defaults to 10 (range 1–1000). After a new backup passes verification, Core retains the newest N unpinned archives across both formats and removes older unpinned archives. Pinned copies are additional to N. Failed backup creation does not trigger pruning. Restoring refuses to overwrite an existing directory, checks file hashes and SQLite integrity (plus authentication for encrypted archives), then publishes the restored directory. The operator must stop the old service before switching `CORE_DB_PATH` and `CORE_MEDIA_DIR` to the restored directory. App credentials are stored as hashes in SQLite; provision new credentials if required after moving installations.

Media writers external to Core must not change files while a backup runs. This is a local encrypted export; destination health reporting and periodic restore drills remain follow-up work.

### Core-managed media and scheduled runs

The service now accepts binary `POST /v1/workspaces/:id/media` with a valid content type and up to 10 MB, and serves `GET /v1/media/:id`. The verified workspace owner alone uploads; owner and explicit grantees can read. Files are written to a temporary name, flushed, then published under their SHA-256 hash and registered in SQLite. They are immutable and never physically removed by the API, so a backup can snapshot SQLite and then copy completed files without a cross-process write pause. Temporary `.partial` files are skipped by backup. Old unreferenced media still needs a retention-aware garbage collection design.

Run `backup-schedule` instead of `backup` with the same environment. Supply the recovery phrase on stdin when encryption is on; no phrase is used when it is off. It creates one backup immediately and repeats every `CORE_BACKUP_INTERVAL_HOURS` (default 24, range 1–168) while the process remains running. Each run verifies the archive before retention pruning. Errors are reported on stderr and the next scheduled run remains pending. An OS service or scheduler must keep this process running; encrypted mode requires the recovery phrase again after restart. A desktop settings view and OS credential storage are still future integrations.
