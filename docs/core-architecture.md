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
