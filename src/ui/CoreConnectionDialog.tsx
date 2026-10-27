import { useCallback, useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import type { CoreShareReader } from "@persistence/CoreManuscriptPublication";
import { coreConnection, coreSharedAccess, pairCore, type CoreConnection } from "@persistence/CoreDesktopTransport";
import { coreSharingOutbox, flushCoreSharing } from "@persistence/CoreSharingRuntime";
import { useLocale } from "./i18n";

const copy = {
  en: {
    title: "Storybook Core", close: "Close", local: "This manuscript stays in Storybook's local storage.",
    unavailable: "Core connection requires the Windows desktop app.",
    disconnected: "Core is not paired.", offline: "Core is paired but currently unavailable. Changes will be queued locally.",
    connected: "Core is connected.", token: "Storybook pairing key", pair: "Connect", refresh: "Check connection",
    pairing: "Connecting…", saving: "Saving…", sandbox: "Show this manuscript in Sandbox",
    comic: "Show this manuscript in Comic", pending: "Waiting to sync with Core.", synced: "No local changes waiting to sync.",
    private: "Off by default. Turning both off removes access in Core when it reconnects.",
    shared: "Sharing includes all chapter prose, synopsis and approved visible Story Bible facts. Brainstorm and hidden or unapproved facts stay private.",
    actual: "Current access in Core", unknown: "Core access has not been verified. Previously shared copies may still be accessible.", nobody: "No other app"
  },
  sv: {
    title: "Storybook Core", close: "Stäng", local: "Manuset sparas fortfarande lokalt i Storybook.",
    unavailable: "Core-anslutning kräver Windows-appen.",
    disconnected: "Core är inte parkopplad.", offline: "Core är parkopplad men inte tillgänglig just nu. Ändringar köas lokalt.",
    connected: "Core är ansluten.", token: "Parkopplingsnyckel för Storybook", pair: "Anslut", refresh: "Kontrollera anslutning",
    pairing: "Ansluter…", saving: "Sparar…", sandbox: "Visa det här manuset i Sandbox",
    comic: "Visa det här manuset i Comic", pending: "Väntar på synk till Core.", synced: "Inga lokala ändringar väntar på synk.",
    private: "Av som standard. Stäng av båda för att återkalla åtkomst i Core när tjänsten nås igen.",
    shared: "Delning omfattar alla kapitels prosa, synopsis och godkända synliga fakta i Story Bible. Brainstorm och dolda eller ogranskade fakta förblir privata.",
    actual: "Faktisk åtkomst i Core", unknown: "Åtkomsten i Core är inte verifierad. Tidigare delade kopior kan fortfarande vara åtkomliga.", nobody: "Ingen annan app"
  },
  nb: {
    title: "Storybook Core", close: "Lukk", local: "Manuset lagres fortsatt lokalt i Storybook.",
    unavailable: "Core-tilkobling krever Windows-appen.",
    disconnected: "Core er ikke paret.", offline: "Core er paret, men ikke tilgjengelig nå. Endringer legges i lokal kø.",
    connected: "Core er tilkoblet.", token: "Paringsnøkkel for Storybook", pair: "Koble til", refresh: "Kontroller tilkobling",
    pairing: "Kobler til…", saving: "Lagrer…", sandbox: "Vis dette manuset i Sandbox",
    comic: "Vis dette manuset i Comic", pending: "Venter på synkronisering med Core.", synced: "Ingen lokale endringer venter på synkronisering.",
    private: "Av som standard. Slå av begge for å trekke tilbake tilgangen i Core når tjenesten er tilgjengelig igjen.",
    shared: "Deling omfatter all kapittelprosa, synopsis og godkjente synlige fakta i Story Bible. Brainstorm og skjulte eller ikke godkjente fakta forblir private.",
    actual: "Faktisk tilgang i Core", unknown: "Tilgangen i Core er ikke bekreftet. Tidligere delte kopier kan fortsatt være tilgjengelige.", nobody: "Ingen annen app"
  }
};

export function CoreConnectionDialog({ bookId, onClose }: { bookId: string; onClose: () => void }) {
  const { locale } = useLocale();
  const m = copy[locale as keyof typeof copy] ?? copy.en;
  const desktop = isTauri();
  const [connection, setConnection] = useState<CoreConnection>({ paired: false, reachable: false });
  const [readers, setReaders] = useState<CoreShareReader[]>([]);
  const [pending, setPending] = useState(false);
  const [remoteReaders, setRemoteReaders] = useState<CoreShareReader[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const choiceVersion = await coreSharingOutbox.choiceVersion(bookId);
    const status = await coreConnection();
    let remote: CoreShareReader[] | null = null;
    let issue: unknown = null;
    if (status.reachable) {
      try {
        remote = (await coreSharedAccess(bookId)).readers;
        await coreSharingOutbox.reconcile(bookId, remote, choiceVersion);
      } catch (error) { issue = error; }
    }
    const choice = await coreSharingOutbox.choice(bookId);
    return { status, remote, choice, issue };
  }, [bookId]);

  const refresh = useCallback(async () => {
    const { status, remote, choice, issue } = await load();
    setConnection(status); setRemoteReaders(remote); setReaders(choice.readers); setPending(choice.pending);
    if (issue) throw issue;
  }, [load]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void load()
      .then(({ status, remote, choice, issue }) => {
        if (!active) return;
        setConnection(status); setRemoteReaders(remote); setReaders(choice.readers); setPending(choice.pending);
        if (issue) setError(issue instanceof Error ? issue.message : String(issue));
      })
      .catch(err => { if (active) setError(String(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const run = async (action: () => Promise<void>) => {
    setWorking(true); setError("");
    try { await action(); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); await refresh().catch(() => {}); }
    finally { setWorking(false); }
  };

  const toggle = (reader: CoreShareReader) => void run(async () => {
    const next = readers.includes(reader) ? readers.filter(item => item !== reader) : [...readers, reader];
    await coreSharingOutbox.setReaders(bookId, next);
    if (connection.reachable) await flushCoreSharing();
  });

  return (
    <div className="edit-overlay" role="presentation" onClick={onClose}>
      <section className="edit-card core-connection-card" role="dialog" aria-modal="true" aria-labelledby="core-connection-title" onClick={event => event.stopPropagation()}>
        <div className="dialog-head"><h2 id="core-connection-title">{m.title}</h2><button type="button" className="text-button" onClick={onClose}>{m.close}</button></div>
        <p>{m.local}</p>
        <p role="status">{!desktop ? m.unavailable : connection.reachable ? m.connected : connection.paired ? m.offline : m.disconnected}</p>
        {desktop && !connection.paired ? (
          <form onSubmit={event => { event.preventDefault(); void run(async () => { await pairCore(token.trim()); setToken(""); await flushCoreSharing(); }); }}>
            <label>{m.token}<input type="password" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} disabled={working} /></label>
            <button type="submit" disabled={working || !token.trim()}>{working ? m.pairing : m.pair}</button>
          </form>
        ) : null}
        {desktop && connection.paired ? <button type="button" disabled={working} onClick={() => void run(async () => { const status = await coreConnection(); if (status.reachable) await flushCoreSharing(); })}>{m.refresh}</button> : null}
        {desktop ? (
          <fieldset disabled={working || loading || (connection.reachable && remoteReaders === null)}>
            <legend>{m.title}</legend>
            <label><input type="checkbox" checked={readers.includes("sandbox")} onChange={() => toggle("sandbox")} /> {m.sandbox}</label>
            <label><input type="checkbox" checked={readers.includes("comic")} onChange={() => toggle("comic")} /> {m.comic}</label>
          </fieldset>
        ) : null}
        <p>{m.private}</p><p>{m.shared}</p>
        {desktop ? <p role="status">{remoteReaders ? `${m.actual}: ${remoteReaders.length ? remoteReaders.join(", ") : m.nobody}` : m.unknown}</p> : null}
        {desktop ? <p role="status">{working ? m.saving : pending ? m.pending : m.synced}</p> : null}
        {error ? <p role="alert">{error}</p> : null}
      </section>
    </div>
  );
}
