import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { CloseIconButton } from "./CloseIconButton";
import { coreAutoClaim, coreConnection, pairCore, type CoreConnection } from "@persistence/CoreDesktopTransport";
import { useLocale } from "./i18n";

/**
 * The book-less counterpart to CoreConnectionDialog (AppTopBar.tsx opens
 * this one instead when no manuscript is open): just pairing and
 * connection status, none of the per-book sharing/versions tabs, which
 * need a bookId. Mirrors what CodexHomeCard used to show as a card on
 * Home before the top bar's own Codex button became always visible there.
 */
export function CodexConnectDialog({ onClose, onStatusChange }: { onClose: () => void; onStatusChange: (status: CoreConnection) => void }) {
  const { messages: m } = useLocale();
  const desktop = isTauri();
  const [status, setStatus] = useState<CoreConnection | null>(null);
  const [token, setToken] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    return coreConnection().then((result) => {
      setStatus(result);
      onStatusChange(result);
      return result;
    });
  }

  useEffect(() => {
    let active = true;
    void coreAutoClaim()
      .then(() => coreConnection())
      .then((result) => {
        if (!active) return;
        setStatus(result);
        onStatusChange(result);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function connect(event: React.FormEvent) {
    event.preventDefault();
    setWorking(true);
    setError("");
    pairCore(token.trim())
      .then(() => {
        setToken("");
        return refresh();
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setWorking(false));
  }

  return (
    <div className="edit-overlay" role="presentation" onClick={onClose}>
      <div className="edit-card app-switcher-card" role="dialog" aria-modal="true" aria-labelledby="codex-connect-title" onClick={(event) => event.stopPropagation()}>
        <div className="dialog-head">
          <h2 id="codex-connect-title">{m.home.codexCard}</h2>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>
        {!desktop ? (
          <p className="quiet">{m.home.codexDesktopOnly}</p>
        ) : !status ? null : status.reachable ? (
          <p className="home-codex-status is-connected" role="status">
            {m.home.codexConnected}
          </p>
        ) : status.paired ? (
          <p className="home-codex-status is-offline" role="status">
            {m.home.codexOffline}
          </p>
        ) : (
          <>
            <p className="quiet">{m.home.codexCardLede}</p>
            <form className="voice-field" onSubmit={connect}>
              <label>
                <span>{m.home.codexTokenPlaceholder}</span>
                <input
                  type="password"
                  autoComplete="off"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder={m.home.codexTokenPlaceholder}
                  disabled={working}
                  aria-label={m.home.codexTokenPlaceholder}
                />
              </label>
              <div className="edit-actions">
                <button type="submit" className="home-start-card-action" disabled={working || !token.trim()}>
                  {working ? m.home.codexConnecting : `${m.home.codexConnectAction} →`}
                </button>
              </div>
            </form>
            {error ? (
              <p className="conflict-note" role="alert">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
