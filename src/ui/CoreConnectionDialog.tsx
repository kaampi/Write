import { useCallback, useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { CloseIconButton } from "./CloseIconButton";
import { sortedChapters, type Book } from "@core/BookSchema";
import { prepareCoreBookRestore, type CoreBookRevision } from "@core/coreRevisionRestore";
import type { CoreShareReader } from "@persistence/CoreManuscriptPublication";
import { coreAutoClaim, coreConnection, corePrivateRevision, corePrivateVersions, coreSharedAccess, pairCore, type CoreConnection, type CorePrivateVersions } from "@persistence/CoreDesktopTransport";
import { coreSharingOutbox, coreSnapshotOutbox, flushCoreSharing, flushCoreSnapshots } from "@persistence/CoreSharingRuntime";
import { useLocale } from "./i18n";

const copy = {
  en: {
    title: "kaampi Write Codex", close: "Close",
    local: "By default, this manuscript stays only in kaampi Write's own local storage on this computer — nothing else is needed.",
    unavailable: "Connecting to kaampi Codex is only possible in the desktop app, not here in the browser.",
    disconnected: "kaampi Codex isn't connected yet. Pair it below to turn on automatic backups and sharing with your other kaampi apps.",
    offline: "kaampi Codex is paired, but isn't reachable right now. Your work keeps saving locally and will sync automatically once it's back.",
    connected: "kaampi Codex is connected — this manuscript can back up and sync.",
    token: "kaampi Write pairing key", pair: "Connect", refresh: "Check connection",
    pairing: "Connecting…", saving: "Saving…", sandbox: "Show this manuscript in kaampi Explore",
    comic: "Show this manuscript in kaampi Comic", pending: "Waiting to sync with kaampi Codex.", synced: "No local changes waiting to sync.",
    private: "Off by default — nothing is shared until you turn one of these on. Turning both off removes access in kaampi Codex the next time it reconnects.",
    shared: "Sharing includes all chapter prose, synopsis and approved visible Story Bible facts. Brainstorm and hidden or unapproved facts stay private.",
    actual: "Current access in kaampi Codex", unknown: "Access in kaampi Codex hasn't been verified yet. Previously shared copies may still be reachable.", nobody: "No other app",
    saveVersion: "Save private version to kaampi Codex", versions: "Private manuscript versions", noVersions: "No versions saved in kaampi Codex yet.",
    versionPending: "A private version is waiting to sync. Only versions kaampi Codex has confirmed can be restored.",
    view: "View", compare: "Compare", old: "Selected version", current: "Current manuscript", noChanges: "No text or fact changes in this view.",
    synopsis: "Synopsis", brainstorm: "Brainstorm", facts: "Story Bible facts", restore: "Restore this manuscript", fork: "Create new manuscript",
    auto: "Save private versions automatically", autoHint: "After local saves, kaampi Codex makes a new version at most about every ten minutes. Offline changes stay queued as the latest copy. Turning this off stops future checkpoints; an already queued one still syncs.",
    lastSnapshot: "Last confirmed private version",
    subtitle: "kaampi Codex is an optional local helper: it can back up this manuscript and share parts of it with your other kaampi apps.", tabSharing: "Sharing", tabVersions: "Versions",
    shareHeading: "Show this manuscript in"
  },
  sv: {
    title: "kaampi Write Codex", close: "Stäng",
    local: "Som standard sparas det här manuset bara lokalt i kaampi Write på den här datorn — inget annat behövs.",
    unavailable: "Koppling till kaampi Codex går bara att göra i skrivbordsappen, inte här i webbläsaren.",
    disconnected: "kaampi Codex är inte kopplad än. Parkoppla nedan för att slå på automatiska säkerhetskopior och delning med dina andra kaampi-appar.",
    offline: "kaampi Codex är parkopplad men går inte att nå just nu. Ditt arbete sparas fortsatt lokalt och synkas automatiskt när den är tillbaka.",
    connected: "kaampi Codex är ansluten — manuset kan säkerhetskopieras och synkas.",
    token: "Parkopplingsnyckel för kaampi Write", pair: "Anslut", refresh: "Kontrollera anslutning",
    pairing: "Ansluter…", saving: "Sparar…", sandbox: "Visa det här manuset i kaampi Explore",
    comic: "Visa det här manuset i kaampi Comic", pending: "Väntar på synk med kaampi Codex.", synced: "Inga lokala ändringar väntar på synk.",
    private: "Av som standard — inget delas förrän du slår på något av de här. Stäng av båda för att återkalla åtkomsten i kaampi Codex nästa gång den ansluter.",
    shared: "Delning omfattar alla kapitels prosa, synopsis och godkända synliga fakta i Story Bible. Brainstorm och dolda eller ogranskade fakta förblir privata.",
    actual: "Faktisk åtkomst i kaampi Codex", unknown: "Åtkomsten i kaampi Codex är inte verifierad än. Tidigare delade kopior kan fortfarande vara åtkomliga.", nobody: "Ingen annan app",
    saveVersion: "Spara privat version i kaampi Codex", versions: "Privata manusversioner", noVersions: "Inga versioner sparade i kaampi Codex ännu.",
    versionPending: "En privat version väntar på synk. Bara versioner som kaampi Codex har bekräftat kan återställas.",
    view: "Visa", compare: "Jämför", old: "Vald version", current: "Nuvarande manus", noChanges: "Inga text- eller faktaändringar i den här vyn.",
    synopsis: "Synopsis", brainstorm: "Brainstorm", facts: "Fakta i Story Bible", restore: "Återställ detta manus", fork: "Skapa nytt manus",
    auto: "Spara privata versioner automatiskt", autoHint: "Efter lokal sparning skapar kaampi Codex en ny version högst ungefär var tionde minut. Vid avbrott köas den senaste kopian. Avstängning stoppar framtida checkpoints; en redan köad kopia synkas fortfarande.",
    lastSnapshot: "Senaste bekräftade privata version",
    subtitle: "kaampi Codex är en valfri lokal hjälptjänst: den kan säkerhetskopiera det här manuset och dela delar av det med dina andra kaampi-appar.", tabSharing: "Delning", tabVersions: "Versioner",
    shareHeading: "Visa manuskriptet i"
  },
  nb: {
    title: "kaampi Write Codex", close: "Lukk",
    local: "Som standard lagres dette manuset bare lokalt i kaampi Write på denne datamaskinen — ingenting annet trengs.",
    unavailable: "Tilkobling til kaampi Codex er bare mulig i skrivebordsappen, ikke her i nettleseren.",
    disconnected: "kaampi Codex er ikke tilkoblet ennå. Par den under for å slå på automatiske sikkerhetskopier og deling med dine andre kaampi-apper.",
    offline: "kaampi Codex er paret, men kan ikke nås akkurat nå. Arbeidet ditt lagres fortsatt lokalt og synkroniseres automatisk når den er tilbake.",
    connected: "kaampi Codex er tilkoblet — manuset kan sikkerhetskopieres og synkroniseres.",
    token: "Paringsnøkkel for kaampi Write", pair: "Koble til", refresh: "Kontroller tilkobling",
    pairing: "Kobler til…", saving: "Lagrer…", sandbox: "Vis dette manuset i kaampi Explore",
    comic: "Vis dette manuset i kaampi Comic", pending: "Venter på synkronisering med kaampi Codex.", synced: "Ingen lokale endringer venter på synkronisering.",
    private: "Av som standard — ingenting deles før du slår på en av disse. Slå av begge for å trekke tilbake tilgangen i kaampi Codex neste gang den kobler til.",
    shared: "Deling omfatter all kapittelprosa, synopsis og godkjente synlige fakta i Story Bible. Brainstorm og skjulte eller ikke godkjente fakta forblir private.",
    actual: "Faktisk tilgang i kaampi Codex", unknown: "Tilgangen i kaampi Codex er ikke bekreftet ennå. Tidligere delte kopier kan fortsatt være tilgjengelige.", nobody: "Ingen annen app",
    saveVersion: "Lagre privat versjon i kaampi Codex", versions: "Private manusversjoner", noVersions: "Ingen versjoner lagret i kaampi Codex ennå.",
    versionPending: "En privat versjon venter på synkronisering. Bare versjoner kaampi Codex har bekreftet kan gjenopprettes.",
    view: "Vis", compare: "Sammenlign", old: "Valgt versjon", current: "Nåværende manus", noChanges: "Ingen tekst- eller faktaendringer i denne visningen.",
    synopsis: "Synopsis", brainstorm: "Brainstorm", facts: "Fakta i Story Bible", restore: "Gjenopprett dette manuset", fork: "Opprett nytt manus",
    auto: "Lagre private versjoner automatisk", autoHint: "Etter lokal lagring lager kaampi Codex en ny versjon høyst omtrent hvert tiende minutt. Ved avbrudd legges den nyeste kopien i kø. Avslåing stopper fremtidige checkpoints; en allerede kølagt kopi synkroniseres fortsatt.",
    lastSnapshot: "Siste bekreftede private versjon",
    subtitle: "kaampi Codex er en valgfri lokal hjelpetjeneste: den kan sikkerhetskopiere dette manuset og dele deler av det med dine andre kaampi-apper.", tabSharing: "Deling", tabVersions: "Versjoner",
    shareHeading: "Vis dette manuset i"
  }
};

export function CoreConnectionDialog({ bookId, currentBook, onCheckpoint, onRestore, onClose }: { bookId: string; currentBook: Book; onCheckpoint: () => Promise<void>; onRestore: (source: CoreBookRevision, mode: "same-book" | "new-book") => Promise<boolean>; onClose: () => void }) {
  const { locale } = useLocale();
  const m = copy[locale as keyof typeof copy] ?? copy.en;
  const desktop = isTauri();
  const [connection, setConnection] = useState<CoreConnection>({ paired: false, reachable: false });
  const [readers, setReaders] = useState<CoreShareReader[]>([]);
  const [pending, setPending] = useState(false);
  const [remoteReaders, setRemoteReaders] = useState<CoreShareReader[] | null>(null);
  const [versions, setVersions] = useState<CorePrivateVersions | null>(null);
  const [snapshotPending, setSnapshotPending] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [lastSnapshotAt, setLastSnapshotAt] = useState<number | null>(null);
  const [inspection, setInspection] = useState<{ book: Book; source: CoreBookRevision; mode: "view" | "compare" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"sharing" | "versions">("sharing");

  const TITLE_MAX_CHARS = 32;
  const shortTitle = currentBook.title.length > TITLE_MAX_CHARS
    ? currentBook.title.slice(0, TITLE_MAX_CHARS).trimEnd() + "…"
    : currentBook.title;

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
    let privateVersions: CorePrivateVersions | null = null;
    if (status.reachable) {
      try { privateVersions = await corePrivateVersions(bookId); }
      catch (error) { issue ??= error; }
    }
    const choice = await coreSharingOutbox.choice(bookId);
    const waiting = (await coreSnapshotOutbox.pending()).some(change => change.id === bookId);
    const auto = await coreSnapshotOutbox.autoChoice(bookId);
    return { status, remote, choice, issue, privateVersions, waiting, auto };
  }, [bookId]);

  const refresh = useCallback(async () => {
    const { status, remote, choice, issue, privateVersions, waiting, auto } = await load();
    setConnection(status); setRemoteReaders(remote); setReaders(choice.readers); setPending(choice.pending);
    setVersions(privateVersions); setSnapshotPending(waiting);
    setAutoEnabled(auto.enabled); setLastSnapshotAt(auto.lastSentAt);
    if (issue) throw issue;
  }, [load]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    // A freshly installed Core left its pairing key in a local file next to the
    // database; try that silently before ever asking the user to paste one.
    void (desktop ? coreAutoClaim() : Promise.resolve(false))
      .then(() => load())
      .then(({ status, remote, choice, issue, privateVersions, waiting, auto }) => {
        if (!active) return;
        setConnection(status); setRemoteReaders(remote); setReaders(choice.readers); setPending(choice.pending);
        setVersions(privateVersions); setSnapshotPending(waiting);
        setAutoEnabled(auto.enabled); setLastSnapshotAt(auto.lastSentAt);
        if (issue) setError(issue instanceof Error ? issue.message : String(issue));
      })
      .catch(err => { if (active) setError(String(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load, desktop]);

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

  const toggleAuto = () => void run(async () => {
    await coreSnapshotOutbox.setAutoEnabled(bookId, !autoEnabled);
    if (!autoEnabled) {
      await onCheckpoint();
      if (connection.reachable) await flushCoreSnapshots();
    }
  });

  const inspect = (id: string, mode: "view" | "compare") => void run(async () => {
    const workspace = versions?.workspace;
    if (!workspace || !versions?.revisions.some(rev => rev.id === id)) throw new Error("Core version is unavailable");
    const revision = await corePrivateRevision(id);
    const source = { workspace, revision };
    const prepared = prepareCoreBookRestore(source, "same-book");
    setInspection({ book: prepared.backup.book, source, mode });
  });

  const restore = (mode: "same-book" | "new-book") => void run(async () => {
    if (!inspection) return;
    const changed = await onRestore(inspection.source, mode);
    if (changed) {
      setInspection(null);
      if (mode === "new-book") onClose();
    }
  });

  return (
    <div className="edit-overlay" role="presentation" onClick={onClose}>
      <section className="edit-card core-connection-card" role="dialog" aria-modal="true" aria-labelledby="core-connection-title" onClick={event => event.stopPropagation()}>
        <div className="dialog-head">
          <div>
            <div className="core-connection-eyebrow">{m.title}</div>
            <h2 id="core-connection-title" title={currentBook.title} className="core-connection-title">{shortTitle}</h2>
            <p className="quiet">{m.subtitle}</p>
          </div>
          <CloseIconButton onClick={onClose} label={m.close} />
        </div>
        <div className="core-connection-status">
          <p>{m.local}</p>
          <p role="status">{!desktop ? m.unavailable : connection.reachable ? m.connected : connection.paired ? m.offline : m.disconnected}</p>
          {desktop && !connection.paired ? (
            <form onSubmit={event => { event.preventDefault(); void run(async () => { await pairCore(token.trim()); setToken(""); await Promise.allSettled([flushCoreSharing(), flushCoreSnapshots()]); }); }}>
              <label>{m.token}<input type="password" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} disabled={working} /></label>
              <button type="submit" disabled={working || !token.trim()}>{working ? m.pairing : m.pair}</button>
            </form>
          ) : null}
          {desktop && connection.paired ? <button type="button" disabled={working} onClick={() => void run(async () => { const status = await coreConnection(); if (status.reachable) await Promise.allSettled([flushCoreSharing(), flushCoreSnapshots()]); })}>{m.refresh}</button> : null}
        </div>
        {desktop ? (
          <div role="tablist" aria-label={m.title} className="core-tabs">
            <button type="button" role="tab" aria-selected={tab === "sharing"} className={tab === "sharing" ? "core-tab is-active" : "core-tab"} onClick={() => setTab("sharing")}>{m.tabSharing}</button>
            <button type="button" role="tab" aria-selected={tab === "versions"} className={tab === "versions" ? "core-tab is-active" : "core-tab"} onClick={() => setTab("versions")}>{m.tabVersions}</button>
          </div>
        ) : null}
        {desktop ? <div className="core-tab-panel">
          {tab === "sharing" ? (
            <section>
              <fieldset disabled={working || loading || (connection.reachable && remoteReaders === null)}>
                <legend>{m.shareHeading}</legend>
                <label><input type="checkbox" checked={readers.includes("sandbox")} onChange={() => toggle("sandbox")} /> {m.sandbox}</label>
                <label><input type="checkbox" checked={readers.includes("comic")} onChange={() => toggle("comic")} /> {m.comic}</label>
              </fieldset>
              <p>{m.private}</p><p>{m.shared}</p>
              <p role="status">{remoteReaders ? `${m.actual}: ${remoteReaders.length ? remoteReaders.join(", ") : m.nobody}` : m.unknown}</p>
              <p role="status">{working ? m.saving : pending ? m.pending : m.synced}</p>
            </section>
          ) : (
            <section>
              <label><input type="checkbox" checked={autoEnabled} disabled={working || loading} onChange={toggleAuto} /> {m.auto}</label>
              <p>{m.autoHint}</p>
              {lastSnapshotAt ? <p>{m.lastSnapshot}: {new Date(lastSnapshotAt).toLocaleString(locale)}</p> : null}
              <button type="button" disabled={working || loading} onClick={() => void run(async () => { await onCheckpoint(); if (connection.reachable) await flushCoreSnapshots(); })}>{m.saveVersion}</button>
              {snapshotPending ? <p role="status">{m.versionPending}</p> : null}
              {versions ? <div className="core-version-list">
                {versions.revisions.length ? <ol>{versions.revisions.map(rev => <li key={rev.id}>#{rev.number} · {new Date(rev.created_at).toLocaleString(locale)} <button type="button" disabled={working} onClick={() => inspect(rev.id, "view")}>{m.view}</button> <button type="button" disabled={working} onClick={() => inspect(rev.id, "compare")}>{m.compare}</button></li>)}</ol> : <p>{m.noVersions}</p>}
              </div> : null}
              {inspection ? <div className="core-revision-inspection">
                <h3>{inspection.mode === "view" ? m.view : m.compare} · {inspection.book.title}</h3>
                <div className="core-restore-actions"><button type="button" disabled={working} onClick={() => restore("same-book")}>{m.restore}</button><button type="button" disabled={working} onClick={() => restore("new-book")}>{m.fork}</button></div>
                {inspection.mode === "view" ? <>
                  <h4>{m.synopsis}</h4><pre>{inspection.book.synopsis}</pre>
                  <h4>{m.brainstorm}</h4><pre>{inspection.book.brainstorm}</pre>
                  <h4>{m.facts}</h4><ul>{inspection.book.facts.map(fact => <li key={fact.id}>{fact.entity_label}: {fact.value}</li>)}</ul>
                  {sortedChapters(inspection.book).map(chapter => <section key={chapter.id}><h4>{chapter.title}</h4><pre>{chapter.prose}</pre></section>)}
                </> : <>
                  {([
                    [m.synopsis, inspection.book.synopsis, currentBook.synopsis],
                    [m.brainstorm, inspection.book.brainstorm, currentBook.brainstorm],
                    [m.facts, JSON.stringify(inspection.book.facts, null, 2), JSON.stringify(currentBook.facts, null, 2)],
                    ...sortedChapters(inspection.book).map(chapter => [chapter.title, chapter.prose, currentBook.chapters.find(current => current.id === chapter.id)?.prose ?? ""]),
                    ...sortedChapters(currentBook).filter(chapter => !inspection.book.chapters.some(old => old.id === chapter.id)).map(chapter => [chapter.title, "", chapter.prose])
                  ] as string[][]).filter(([, old, current]) => old !== current).map(([label, old, current], index) =>
                    <section key={`${label}-${index}`}><h4>{label}</h4><div className="core-compare-columns"><div><strong>{m.old}</strong><pre>{old}</pre></div><div><strong>{m.current}</strong><pre>{current}</pre></div></div></section>
                  )}
                  {inspection.book.synopsis === currentBook.synopsis && inspection.book.brainstorm === currentBook.brainstorm &&
                    JSON.stringify(inspection.book.facts) === JSON.stringify(currentBook.facts) &&
                    JSON.stringify(inspection.book.chapters.map(ch => [ch.id, ch.prose])) === JSON.stringify(currentBook.chapters.map(ch => [ch.id, ch.prose])) ? <p>{m.noChanges}</p> : null}
                </>}
              </div> : null}
            </section>
          )}
        </div> : null}
        {error ? <p role="alert">{error}</p> : null}
      </section>
    </div>
  );
}
