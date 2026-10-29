import { useCallback, useEffect, useState } from "react";
import { coreAutoClaim, coreConnection, pairCore, type CoreConnection } from "@persistence/CoreDesktopTransport";
import { useLocale } from "./i18n";

/**
 * Mats: connecting to kaampi Codex wasn't obvious from Write's own start
 * screen — the only entry point was a small, unlabeled-in-practice "Core"
 * text button that only appeared once a manuscript was already open. This
 * card makes connection status visible on Home itself, as prominent as
 * the other start cards, with its own inline pairing form when there's
 * nothing connected yet — same "form right there in the card" pattern the
 * New manuscript card already uses, not a separate dialog.
 *
 * Pairing itself (pairCore/coreConnection) was never book-scoped to begin
 * with — it's one app-wide credential — so this card needs nothing from
 * useBookStore beyond what it already fetches for itself.
 */
export function CodexHomeCard() {
  const { messages: m } = useLocale();
  const [status, setStatus] = useState<CoreConnection | null>(null);
  const [token, setToken] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(() => coreConnection().then(setStatus), []);

  useEffect(() => {
    let active = true;
    // A freshly installed Core left its pairing key in a local file next
    // to the database; try that silently before ever asking for one.
    void coreAutoClaim()
      .then(() => coreConnection())
      .then((result) => {
        if (active) setStatus(result);
      });
    return () => {
      active = false;
    };
  }, []);

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

  if (!status) return null;

  return (
    <div className="home-start-card home-codex-card">
      <span className="home-start-card-copy">
        <strong>{m.home.codexCard}</strong>
        {status.reachable ? (
          <span className="home-codex-status is-connected">{m.home.codexConnected}</span>
        ) : status.paired ? (
          <span className="home-codex-status is-offline">{m.home.codexOffline}</span>
        ) : (
          <>
            <span>{m.home.codexCardLede}</span>
            <form className="home-start-card-form" onSubmit={connect}>
              <input
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder={m.home.codexTokenPlaceholder}
                disabled={working}
                aria-label={m.home.codexTokenPlaceholder}
              />
              <button type="submit" className="home-start-card-action" disabled={working || !token.trim()}>
                {working ? m.home.codexConnecting : `${m.home.codexConnectAction} →`}
              </button>
            </form>
            {error ? <p className="conflict-note">{error}</p> : null}
          </>
        )}
      </span>
    </div>
  );
}
