import { openCore, createCoreServer } from './core.mjs';
import { createBackup, restoreBackup } from './backup.mjs';
import { createInterface } from 'node:readline/promises';

const recoveryPhrase = async () => {
  if (process.stdin.isTTY) throw new Error('Supply recovery phrase via stdin from a secure prompt, never a command argument');
  const lines = createInterface({ input: process.stdin });
  try { const phrase = await new Promise((resolve, reject) => {
    lines.once('line', resolve);
    lines.once('close', () => reject(new Error('Missing recovery phrase')));
  }); return phrase; } finally { lines.close(); }
};

const command = process.argv[2];
if (command === 'restore') {
  const [archive, destination] = process.argv.slice(3);
  if (!archive || !destination) throw new Error('Usage: restore <archive> <new-directory>');
  process.stdout.write(JSON.stringify(await restoreBackup(archive, destination, await recoveryPhrase())) + '\n');
} else {
const file = process.env.CORE_DB_PATH;
if (!file) throw new Error('Set CORE_DB_PATH to a local SQLite file');
const core = openCore(file);
if (command === 'provision') {
  const token = core.provision(process.argv[3]);
  process.stdout.write(`${token}\n`);
  core.close();
} else if (command === 'backup') {
  if (!process.env.CORE_BACKUP_DIR) throw new Error('Set CORE_BACKUP_DIR');
  try {
    const result = await createBackup(core, {
      mediaDir: process.env.CORE_MEDIA_DIR ?? file + '.media',
      backupDir: process.env.CORE_BACKUP_DIR,
      passphrase: await recoveryPhrase(),
      keep: Number(process.env.CORE_BACKUP_KEEP ?? 10)
    });
    process.stdout.write(JSON.stringify(result) + '\n');
  } finally { core.close(); }
} else if (!command) {
  const port = Number(process.env.CORE_PORT ?? 43127);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid CORE_PORT');
  const server = createCoreServer(core);
  server.listen(port, '127.0.0.1', () => process.stdout.write(`Core listening on 127.0.0.1:${port}\n`));
  const shutdown = () => server.close(() => { core.close(); process.exit(0); });
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} else {
  core.close();
  throw new Error('Usage: node server.mjs [provision <app>|backup|restore <archive> <new-directory>]');
}
}
