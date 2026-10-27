import { openCore, createCoreServer } from './core.mjs';

const file = process.env.CORE_DB_PATH;
if (!file) throw new Error('Set CORE_DB_PATH to a local SQLite file');
const core = openCore(file);
const command = process.argv[2];
if (command === 'provision') {
  const token = core.provision(process.argv[3]);
  process.stdout.write(`${token}\n`);
  core.close();
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
  throw new Error('Usage: node server.mjs [provision storybook|sandbox|comic]');
}
