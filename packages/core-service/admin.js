const byId = id => document.getElementById(id);
let adminToken = '';

function status(message, error = false) {
  byId('status').textContent = message;
  byId('status').classList.toggle('error', error);
}

function lock() {
  adminToken = '';
  byId('admin-token').value = '';
  byId('passphrase').value = '';
  byId('controls').hidden = true;
  byId('login-card').hidden = false;
  byId('backups').replaceChildren();
}

async function api(path, method = 'GET', data) {
  const response = await fetch(`/admin/api/${path}`, {
    method, cache: 'no-store', credentials: 'omit',
    headers: { authorization: `Bearer ${adminToken}`, ...(data === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(data === undefined ? {} : { body: JSON.stringify(data) })
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401) lock();
    throw new Error(result.error ?? 'Core svarade inte');
  }
  return result;
}

async function run(button, action) {
  button.disabled = true;
  status('Arbetar…');
  try { await action(); }
  catch (error) { status(error instanceof Error ? error.message : String(error), true); }
  finally { button.disabled = false; }
}

async function listBackups() {
  const files = await api('backups');
  const list = byId('backups');
  list.replaceChildren();
  for (const file of files) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${file.name} · ${(file.size / 1_000_000).toFixed(1)} MB · ${new Date(file.modifiedAt).toLocaleString('sv-SE')}`;
    const verify = document.createElement('button');
    verify.type = 'button'; verify.className = 'secondary'; verify.textContent = 'Kontrollera';
    verify.addEventListener('click', () => void run(verify, async () => {
      const passphrase = byId('passphrase').value;
      try {
        const result = await api('backups/verify', 'POST', { name: file.name, passphrase });
        status(`${result.name}: verifierad (${result.encryption === 'encrypted' ? 'krypterad' : 'okrypterad'}).`);
      } finally { byId('passphrase').value = ''; }
    }));
    item.append(label, verify); list.append(item);
  }
  if (!files.length) {
    const empty = document.createElement('li'); empty.textContent = 'Inga backupfiler i den valda mappen.';
    list.append(empty);
  }
}

byId('login-form').addEventListener('submit', event => {
  event.preventDefault();
  const button = event.submitter;
  adminToken = byId('admin-token').value.trim();
  byId('admin-token').value = '';
  void run(button, async () => {
    const settings = await api('settings');
    byId('login-card').hidden = true;
    byId('controls').hidden = false;
    if (settings) {
      byId('backup-dir').value = settings.backupDir;
      byId('encrypted').value = settings.encrypted ? 'on' : 'off';
      byId('keep').value = String(settings.keep);
      await listBackups();
    }
    status('Core-hantering är upplåst för den här fliken.');
  });
});

byId('lock').addEventListener('click', () => { lock(); status('Hanteringen är låst.'); });

byId('settings-form').addEventListener('submit', event => {
  event.preventDefault();
  void run(event.submitter, async () => {
    await api('settings', 'PUT', {
      backupDir: byId('backup-dir').value.trim(), encrypted: byId('encrypted').value === 'on',
      keep: Number(byId('keep').value)
    });
    await listBackups();
    status('Backupinställningarna är sparade.');
  });
});

byId('backup-now').addEventListener('click', event => void run(event.currentTarget, async () => {
  const passphrase = byId('passphrase').value;
  try {
    const result = await api('backups', 'POST', { passphrase });
    await listBackups();
    status(`Backup skapad och verifierad: ${result.path}`);
  } finally { byId('passphrase').value = ''; }
}));

byId('refresh').addEventListener('click', event => void run(event.currentTarget, async () => {
  await listBackups(); status('Listan är uppdaterad.');
}));
