import { useEffect, useState } from "react";
import { CloseIconButton } from "./CloseIconButton";
import {
  checkCompanionApp,
  COMPANION_APP_IDS,
  COMPANION_APPS,
  DEFAULT_COMPANION_ADDRESSES,
  openCompanionAddress,
  readCompanionAddress,
  safeAppAddress,
  saveCompanionAddress,
  type CompanionAppId,
  type CompanionAppStatus
} from "./companionApps";
import { format, useLocale } from "./i18n";

/**
 * Mirrors kaampi Explore's own top-bar app switcher (Mats: "Explore har en
 * koppling överst i toppmenyn till andra appar som jag tänker att vi kan
 * lägga in i Writer också") — kaampi Write's own name sits as a plain,
 * non-interactive current-app pill; kaampi Explore and kaampi Comic are
 * reachable links when a live check finds them running, otherwise a button
 * that opens the same address/info dialog Explore uses.
 */
export function AppSwitcher() {
  const { messages: m } = useLocale();
  const [addresses, setAddresses] = useState(() => ({
    explore: readCompanionAddress("explore"),
    comic: readCompanionAddress("comic")
  }));
  const [statuses, setStatuses] = useState<Partial<Record<CompanionAppId, CompanionAppStatus>>>({});
  const [openId, setOpenId] = useState<CompanionAppId | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      const results = await Promise.all(COMPANION_APP_IDS.map((id) => checkCompanionApp(id, addresses[id])));
      if (!cancelled) setStatuses(Object.fromEntries(results.map((status) => [status.appId, status])));
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [addresses]);

  function savedStatus(id: CompanionAppId): CompanionAppStatus | undefined {
    const status = statuses[id];
    return status?.address === addresses[id] ? status : undefined;
  }

  return (
    <>
      <nav className="app-switcher" aria-label={m.companionApps.nav}>
        <span className="app-switcher-item is-active" aria-current="page">
          kaampi Write
        </span>
        {COMPANION_APP_IDS.map((id) => {
          const app = COMPANION_APPS[id];
          const status = savedStatus(id);
          return status?.state === "available" ? (
            <span className="app-switcher-link" key={id}>
              <button
                type="button"
                className="app-switcher-item"
                onClick={() => void openCompanionAddress(status.address)}
                title={format(m.companionApps.openApp, { name: app.name })}
              >
                {app.name}
                <i className="app-switcher-dot is-available" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="app-switcher-config"
                aria-label={format(m.companionApps.appInfo, { name: app.name })}
                onClick={() => setOpenId(id)}
              >
                ⌄
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="app-switcher-item"
              key={id}
              onClick={() => setOpenId(id)}
              title={format(m.companionApps.aboutApp, { name: app.name })}
            >
              {app.name}
            </button>
          );
        })}
      </nav>
      {openId ? (
        <CompanionAppDialog
          appId={openId}
          address={addresses[openId]}
          status={savedStatus(openId)}
          onSave={(address) => setAddresses((current) => ({ ...current, [openId]: address }))}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </>
  );
}

function CompanionAppDialog({
  appId,
  address,
  status,
  onSave,
  onClose
}: {
  appId: CompanionAppId;
  address: string;
  status: CompanionAppStatus | undefined;
  onSave: (address: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const app = COMPANION_APPS[appId];
  const [draft, setDraft] = useState(address);
  const [liveStatus, setLiveStatus] = useState(status);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  let validAddress = "";
  try {
    validAddress = safeAppAddress(draft) || DEFAULT_COMPANION_ADDRESSES[appId];
  } catch {
    /* surfaced on check/save */
  }

  function check() {
    setError("");
    setChecking(true);
    checkCompanionApp(appId, draft)
      .then((result) => {
        setDraft(result.address);
        setLiveStatus(result);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : m.companionApps.invalidAddress))
      .finally(() => setChecking(false));
  }

  function save() {
    setError("");
    try {
      const saved = saveCompanionAddress(appId, draft);
      setDraft(saved);
      onSave(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : m.companionApps.invalidAddress);
    }
  }

  const statusText = checking
    ? m.companionApps.checking
    : liveStatus?.state === "available"
      ? m.companionApps.statusAvailable
      : liveStatus?.state === "unreachable"
        ? m.companionApps.statusUnreachable
        : liveStatus?.state === "wrong-app"
          ? m.companionApps.statusWrongApp
          : m.companionApps.statusUnknown;

  return (
    <div className="edit-overlay" role="presentation" onClick={onClose}>
      <div
        className="edit-card app-switcher-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="companion-app-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <h2 id="companion-app-title">{app.name}</h2>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>
        <a className="text-button" href={app.repository} target="_blank" rel="noreferrer">
          {m.companionApps.getApp}
        </a>
        <label className="voice-field">
          <span>{m.companionApps.addressLabel}</span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={DEFAULT_COMPANION_ADDRESSES[appId]}
            aria-label={m.companionApps.addressLabel}
          />
        </label>
        <p className="quiet" role="status">
          {statusText}
        </p>
        {error ? (
          <p className="conflict-note" role="alert">
            {error}
          </p>
        ) : null}
        <div className="edit-actions">
          <button type="button" className="text-button" disabled={checking} onClick={check}>
            {m.companionApps.tryAgain}
          </button>
          <button type="button" className="text-button" onClick={save}>
            {m.companionApps.saveAddress}
          </button>
          {validAddress ? (
            <button type="button" className="home-start-card-action" onClick={() => void openCompanionAddress(validAddress)}>
              {m.companionApps.openAppAction}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
