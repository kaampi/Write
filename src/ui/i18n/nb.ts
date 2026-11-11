import type { Messages } from "./en";

export const nb: Messages = {
  common: {
    fileSaveError: "Kunne ikke lagre filen. Prøv igjen.",
    cancel: "Avbryt",
    close: "Lukk",
    stop: "Stopp",
    save: "Lagre",
    copy: "Kopier",
    copied: "Kopiert",
    infoAbout: "Mer om {field}",
    previous: "Forrige",
    next: "Neste"
  },
  busy: {
    title: "Arbeider",
    help: "Den lokale AI-en jobber med dette. Første forespørsel kan ta litt lengre tid mens modellen lastes.",
    drafting: "Skriver utkast…",
    analyzing: "Analyserer…",
    polishing: "Pusser…",
    illustrating: "Skriver en illustrasjonsprompt…",
    developing: "Utvikler…",
    importing: "Importerer {current} av {total}…"
  },
  app: {
    crash: "Appen støtte på en feil.",
    tryAgain: "Prøv på nytt",
    missingRoot: "Mangler elementet #root"
  },
  chrome: {
    language: "Språk",
    light: "Lyst",
    dark: "Mørkt",
    lightTitle: "Bruk en lys side",
    darkTitle: "Bruk en mørk side"
  },
  appBar: {
    nav: "Filer",
    newManuscript: "Nytt manuskript…",
    viewAll: "Vis alle manuskripter",
    goHome: "Gå til alle manuskripter",
    importBackupItem: "Importer en backup…",
    importManuscriptItem: "Importer en tekstfil…",
    loadSampleManuscriptItem: "Last inn eksempelmanuskript…",
    importCodexItem: "Importer en Codex-bok…"
  },
  companionApps: {
    nav: "Dine kreative apper",
    openApp: "Åpne {name}",
    appInfo: "Informasjon og adresse for {name}",
    aboutApp: "Om {name}",
    addressLabel: "App-adresse",
    statusAvailable: "Appen kjører og er klar til å åpnes.",
    statusUnreachable: "Appen kan ikke nås. Den kan være installert, men ikke i gang. Start den og prøv igjen.",
    statusWrongApp: "En annen tjeneste svarte på denne adressen. Sjekk appens adresse og prøv igjen.",
    statusUnknown: "Automatiske kontroller finnes bare i skrivebordsappen. Du kan fortsatt åpne adressen selv.",
    checking: "Kontrollerer appen…",
    tryAgain: "Prøv igjen",
    saveAddress: "Lagre adresse",
    openAppAction: "Åpne appen ↗",
    getApp: "Hent appen og installasjonsguiden ↗",
    invalidAddress: "Bruk en HTTP- eller HTTPS-adresse uten påloggingsinformasjon."
  },
  home: {
    headline: "Skriv prosaen.",
    truth: "Story Bible holder sanning.",
    lede: "Et lokalt manuskriptverktøy der du bestemmer.",
    newManuscript: "Start nytt manuskript",
    newManuscriptCardLede: "Gi det en tittel, la deretter historien vokse i Brainstorm — modellen skriver utkast til kapitlene, du bestemmer.",
    titlePlaceholder: "Tittel",
    open: "Opprett",
    importCodexBookTitle: "Importer en bok fra kaampi Codex",
    importCodexBookLede:
      "Hvert manuskript kaampi Codex har en privat backup av, som ikke allerede finnes i denne installasjonen. Å velge en henter den inn med sin egen opprinnelige historikk - kapitler, Story Bible, alt - akkurat slik Codex sist så den.",
    importCodexBookLoading: "Sjekker kaampi Codex…",
    importCodexBookEmpty: "Ingenting å importere - enten har kaampi Codex ingen private backuper, eller så finnes de allerede alle i denne installasjonen.",
    importCodexBookImport: "Importer",
    importCodexBookImporting: "Importerer…",
    guideCardLede: "Usikker på hvor du skal begynne? Guiden går gjennom hver del av appen.",
    guideCardAction: "Åpne Guiden",
    mascotIntroText:
      "Dette er Kaamilla, din assistent. Hun dukker opp innimellom med tips og info. Du kan slå henne av i Innstillinger, eller bytte til Kaamy eller Kaambot der.",
    mascotIntroUnderstood: "Forstått",
    codexCard: "kaampi Codex",
    codexConnected: "Tilkoblet — sikkerhetskopier og deling med dine andre kaampi-apper er på.",
    codexOffline: "Paret, men kan ikke nås akkurat nå. Arbeidet ditt lagres fortsatt lokalt.",
    codexCardLede: "Ikke tilkoblet ennå. Lim inn paringsnøkkelen fra kaampi Codex sin egen førstegangsskjerm, eller la dette stå — helt valgfritt.",
    codexDesktopOnly: "Tilkobling til kaampi Codex er bare mulig i skrivebordsappen, ikke her i nettleseren.",
    codexTokenPlaceholder: "Paringsnøkkel",
    codexConnectAction: "Koble til",
    codexConnecting: "Kobler til…",
    startHeading: "Hvor vil du begynne?",
    importManuscriptTitle: "Importer et manuskript (tekstfil)",
    importManuscriptLede:
      "Starter et helt nytt manuskript fra en vanlig tekst- eller Markdown-fil — en eksport fra et annet skriveverktøy, eller bare en .txt/.md-fil du allerede har. Deler opp på overskrifter til kapitler (tekst uten overskrifter blir ett enkelt kapittel), og gjør om *kursiv*/**fet**-markører til ekte formatering, akkurat som Verktøy → Konverter markører til formatering.",
    importManuscriptContact:
      "Jobber du i et verktøy som ikke eksporterer vanlig tekst eller Markdown? Ta kontakt og del en eksportfil — vi kan undersøke om vi kan bygge støtte for den.",
    importManuscriptBookTitle: "Manuskriptets tittel",
    importManuscriptBookTitlePlaceholder: "Tittel",
    importManuscriptUpload: "Last opp en fil…",
    importManuscriptText: "Eller lim inn den eksporterte teksten",
    importManuscriptTextPlaceholder: "Lim inn en Markdown-eksport her, eller last opp en fil over…",
    importManuscriptLevelLabel: "Hvilket overskriftsnivå markerer et nytt kapittel?",
    importManuscriptLevelOption: "{hashes} ({count} funnet)",
    importManuscriptFoundCount: "Fant {count}.",
    importManuscriptChaptersCount: { one: "{count} kapittel", other: "{count} kapitler" },
    importManuscriptUntitledChapter: "Kapittel {n}",
    importManuscriptAction: "Importer",
    shelf: "Manuskripter",
    shelfHeading: "Dine manuskripter",
    listView: "Listevisning",
    shelfView: "Hyllevisning",
    shelfOpen: "Åpne",
    seriesTag: "Serie: {series}",
    searchPlaceholder: "Søk manuskripter…",
    noSearchResults: "Ingen manuskripter samsvarer med søket.",
    emptyShelf: "Ingen manuskripter ennå. En tittel er nok til å starte.",
    delete: "Slett",
    deleteConfirm: "Slett “{title}”? Dette kan ikke angres.",
    replaceConfirm: "Erstatt “{title}” med denne sikkerhetskopien? Alt som er skrevet siden den filen går tapt.",
    languageVersionUnset: "Navnløst språk",
    chapters: { one: "{count} kapittel", other: "{count} kapitler" },
    facts: { one: "{count} låst faktum", other: "{count} låste fakta" },
    connectFound: { one: "Tilkoblet — {count} modell funnet.", other: "Tilkoblet — {count} modeller funnet." },
    connectNotFound:
      "Ikke tilkoblet ennå. Har du ingen lokal AI-server? Vi anbefaler Ollama — gratis, fra ollama.com. Installer en modell (søk på «stheno» for en tilpasset skjønnlitteratur, eller en hvilken som helst vanlig chattmodell, f.eks. llama3), så dukker den opp her automatisk.",
    desktopInstallOllama: "Installer Ollama",
    desktopGpuSuggestion: "Basert på grafikkortets minne (~{gb} GB) takler denne datamaskinen trolig {tier}.",
    desktopGpuTier3b: "en liten modell, omtrent 3 milliarder parametere (4-bit)",
    desktopGpuTier7b: "en modell på omtrent 7-8 milliarder parametere (4-bit)",
    desktopGpuTier14b: "en modell på omtrent 13-14 milliarder parametere (4-bit)",
    desktopGpuTier30b: "en modell på omtrent 30-34 milliarder parametere (4-bit)",
    desktopGpuTier70b: "en stor modell, 70 milliarder parametere eller mer (4-bit)",
    desktopCheckUpdate: "Se etter oppdateringer",
    desktopCheckingUpdate: "Ser etter oppdateringer…",
    desktopUpdateAvailableShort: "Oppdatering tilgjengelig",
    desktopUpdateAvailable: "En ny versjon finnes ({latest}, du har {current}).",
    desktopViewChangelog: "Vis endringslogg",
    desktopDownloadUpdate: "Last ned oppdatering",
    desktopUpToDate: "Du har den nyeste versjonen ({current}).",
    desktopUpdateCheckFailed: "Kunne ikke se etter oppdateringer: {error}"
  },
  series: {
    heading: "Dine serier",
    newSeries: "+ Ny serie",
    newSeriesTitlePlaceholder: "Seriens tittel",
    create: "Opprett",
    open: "Åpne serien →",
    books: { one: "{count} bok", other: "{count} bøker" },
    facts: { one: "{count} låst faktum", other: "{count} låste fakta" },
    newBookInSeries: "+ Ny bok i denne serien",
    assignLabel: "Serie",
    assignNone: "— Frittstående —",
    backToShelf: "← Til hyllen",
    titleLabel: "Seriens tittel",
    booksHeading: "Bøker i denne serien",
    noBooksYet: "Ingen bøker i denne serien ennå.",
    removeFromSeries: "Fjern fra serien",
    removeFromSeriesTitle: "Gjør boken frittstående igjen — dens egne låste fakta blir værende, den slutter bare å arve serie-canon.",
    removeFromSeriesConfirm: "Fjern \"{title}\" fra denne serien? Den blir frittstående igjen — dens egne fakta blir værende, men den slutter å arve serie-canon.",
    deleteSeries: "Slett serien",
    deleteConfirm: 'Slette serien "{title}"? Bøkene i den blir værende — de slutter bare å tilhøre en serie.',
    deleteBlocked: "Flytt ut bøkene først (eller slett dem) for å kunne slette denne serien.",
    notFound: "Den serien finnes ikke lenger.",
    unreadable: "Den serien kunne ikke leses.",
    tabs: { brainstorm: "Idémyldring", synopsis: "Synopsis", bible: "Story Bible", books: "Bøker" },
    brainstormLede: "Privat skisseflate for seriens egen verden — deles ikke med noen boks egen idémyldring, og Draft leser aldri dette direkte. Løft det som holder mål til Synopsis når du er klar.",
    brainstormPlaceholder: "Skisser verdenen her — historie, fraksjoner, hvordan magi fungerer, hva enn serien trenger før noen bok begynner…",
    liftToSynopsis: "Løft til Synopsis →",
    synopsisLede: "En kortfattet presentasjon av seriens verden — et skrivekart for dens egne fakta, ikke låst sannhet i seg selv. Hent ut fakta fra den når den er klar; ingenting låses rett inn, alt havner i gjennomgangskøen nedenfor.",
    synopsisPlaceholder: "Oppsummer seriens verden i noen avsnitt…",
    extractFacts: "Hent ut fakta",
    extracting: "Henter ut…",
    lockedFactsHeading: "Seriens kanon",
    noFactsYet: "Ingen låste fakta ennå — skriv en synopsis og hent ut fra den, eller legg til ett for hånd nedenfor.",
    addFact: "Legg til et faktum for hånd",
    entityNamePlaceholder: "Entitetens navn (f.eks. «Luke Skywalker»)",
    establishedIn: "Etablert i: {book}",
    establishedInChapter: "Etablert i: {book}, {chapter}",
    sendToSeries: "Send til serien",
    conflictTitle: "Avviker fra serien",
    conflictBody: 'Serien sier {predicate}: «{seriesValue}» — denne boken ville nå si noe annet. Ingenting annet endres; serien beholder sin egen verdi til du sender opp denne også.',
    conflictLockAnyway: "Lås likevel",
    consistencyHeading: "Konsistenssjekk",
    consistencyCheck: "Sjekk konsistens",
    consistencyChecking: "Sjekker…",
    consistencyLede: "Sammenligner hvert låste faktum i hele serien og alle bøkene i den, ser etter påstander ingen har avstemt mot hverandre — ikke bare det du allerede fikk en advarsel om mens du skrev.",
    consistencyNone: "Ingen motsigelser funnet.",
    historyHeading: "Historie & beskrivelse",
    historyPlaceholder: "Skriv denne entitetens historie like fritt som en wiki-artikkel — ikke en liste med fakta, historien om hvem eller hva de er…",
    historyHint: "For deg — sendes aldri til Draft som den er. Bare det du henter ut fra den nedenfor blir kanon.",
    extractFromHistory: "Hent ut fakta fra denne teksten",
    whatDraftSees: "det Draft ser",
    imagesNote: "Bilder er bare visuell referanse — sendes aldri til Draft som tekstkontekst.",
    searchPlaceholder: "Søk serier…",
    noSearchResults: "Ingen serier matcher søket ditt.",
    previousBook: "Forrige bok",
    nextBook: "Neste bok",
    detailWords: "{words} ord, ~{pages} sider",
    detailFacts: "{own} / {cumulative} låste fakta",
    timelineLabel: "Serietidslinje",
    timelineLede: "Rekkefølgen bøkene skjer i historien — ikke rekkefølgen du skrev dem i. En lesehjelp for deg; endrer ikke hva Draft ser ennå.",
    timelineReordered: "Omordnet",
    timelineMoveEarlier: "Flytt tidligere",
    timelineMoveLater: "Flytt senere",
    synopsisHeading: "Synopsis",
    detailNoSynopsis: "Ingen synopsis ennå — skriv en i seriens arbeidsflate.",
    detailOpenBook: "Åpne denne boken",
    detailOpenWorkspace: "Åpne seriens arbeidsflate →"
  },
  shelfEdit: {
    settingsLabel: "Rediger hyllekort",
    title: "Hyllekort",
    coverLabel: "Omslag",
    addCover: "Legg til et omslag",
    replaceCover: "Bytt ut",
    removeCover: "Fjern",
    authorLabel: "Forfatternavn",
    authorPlaceholder: "kaampi Write",
    colorLabel: "Ryggfarge",
    heightLabel: "Høyde",
    heightValue: "{sign}{percent}%",
    descriptionLabel: "Beskrivelse",
    descriptionPlaceholder: "En kort linje til hyllekortet…"
  },
  editor: {
    manuscriptTitle: "Manuskripttittel",
    writing: "Skriving",
    primer: "Startprompt",
    primerTitle: "Startprompt for denne skrivemodellen",
    primerLede: "Den går ut før hver skrivejobb. Kapitlets regler følger likevel. Tom betyr bare de reglene.",
    primerRestore: "Bruk startprompten",
    primerAria: "Startprompt for {model}",
    polishPromptLabel: "Polish-instruksjoner",
    polishPromptLede:
      "Hva Polish-steget ber modellen gjøre — en hardhendt redaktørrunde som standard. Endre fritt etter hva som passer manuset ditt; Polish viser alltid en diff å se gjennom før noe lagres.",
    polishPromptRestore: "Tilbakestill til standard",
    polishPromptAria: "Polish-instruksjoner",
    review: "Gjennomgang",
    translateModelLabel: "Oversettelse",
    translateModelFollowWriting: "Bruk skrivemodellen",
    languageSwitcherOriginal: "Original",
    languageSwitcherCurrentHint: "Dette manuskriptets språk",
    languageSwitcherNew: "Ny språkversjon…",
    languageSwitcherNewPlaceholder: "Språk, f.eks. Svensk",
    languageSwitcherAdd: "Opprett",
    translationStatusLoading: "Sjekker kildekapittelet…",
    translationStatusOrphaned: "Kildekapittelet dette ble oversatt fra finnes ikke lenger.",
    translationStatusUntranslated: "Ikke oversatt ennå",
    translationStatusStale: "Kilden er endret siden dette ble oversatt",
    translationStatusCurrent: "Oppdatert mot kilden",
    translationStatusShowDiff: "Vis hva som er endret",
    translationStatusHideDiff: "Skjul hva som er endret",
    translationStatusSnapshotLabel: "Sist oversatt fra",
    translationStatusLiveSourceLabel: "Kilden nå",
    translateChapterAction: "Oversett kapittel",
    retranslateChapterAction: "Oversett kapittel på nytt",
    noModels: "Ingen lokale modeller funnet",
    backup: "Sikkerhetskopi",
    backupDue: "! Sikkerhetskopi",
    backupDueTitle: "Manuskriptet har endret seg siden siste JSON-sikkerhetskopi",
    backupTitle: "Sikkerhetskopi",
    appExport: "Eksporter for andre apper",
    appExportTitle: "Last ned en kaampi Codex-eksport av manuset — låste Story Bible-fakta og kapitler, til for at en søsterapp som kaampi Comic skal kunne importere. Et øyeblikksbilde, ingen levende kobling.",
    publish: "Publiser",
    archiveNav: "Arkiv",
    toolsNav: "Verktøy",
    codexNav: "Codex",
    settings: "Manuskriptinnstillinger",
    settingsLede:
      "Hvordan dette manuskriptet skrives. Ikke Story Bible. Kapitlene kan fortsatt overstyre kamera, stemme og Leser.",
    appSettings: "Innstillinger",
    appSettingsLede:
      "Gjelder hele appen, ikke et enkelt manuskript: hvilken AI-server som brukes, skriveprimer, hvor mange versjoner som lagres, og redigeringsvinduets papirfarge.",
    editorSettingsHeading: "Redigering",
    proofreadHeading: "Korrekturlesing",
    generalHeading: "Generelt",
    typographyHeading: "Typografi",
    sceneBreakHeading: "Scenebrudd",
    illustrationsHeading: "Illustrasjoner",
    proseLanguage: "Prosaens språk",
    proseLanguagePlaceholder: "f.eks. engelsk",
    proseLanguageTitle: "Språket setningene skrives på. Tomt gjetter fra manuskriptet. En skriveinstruksjon, ikke kanon.",
    modelsHeading: "AI-innstillinger",
    aiFreeModeLabel: "AI-fri modus",
    aiFreeModeHint:
      "Gråer ut hvert verktøy som krever AI (utkast, omskriving, analyse, intervjuer…) i stedet for å skjule dem. Skriving, kapitler, Story Bible og eksport fungerer alltid uten AI uansett denne innstillingen — denne slår bare av AI-verktøyene på toppen, selv om en lokal AI er tilkoblet.",
    aiFreeModeDisabledHint: "Slått av i AI-fri modus (Settings).",
    engineLabel: "Motor",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / annen lokal server",
    engineLede: "Ingen skytjenester eller kontoer, aldri — bare en server som kjører på denne maskinen eller ditt lokale nettverk.",
    baseUrlLabel: "Serveradresse",
    baseUrlLede: "La stå tomt for å bruke denne maskinens egen standardadresse. For å nå en server på en annen maskin i ditt lokale nettverk i stedet — Ollama, LM Studio eller en annen lokal server som llama.cpp — angi nettverksadressen her, f.eks. http://192.168.1.50:11434.",
    connectionPresetsCurrentLabel: "Nåværende tilkobling",
    connectionPresetActive: "Aktiv",
    connectionPresetUpdate: "Oppdater",
    connectionPresetNew: "+ Ny modell",
    connectionPresetDelete: "Slett",
    connectionPresetDeleteConfirm: "Slette “{name}”? Dette kan ikke angres.",
    connectionPresetNameLabel: "Navn på tilkobling",
    contextWindowLabel: "Kontekstvindu",
    contextWindowLede: "Hvor mye tekst modellen får vite at den faktisk kan se på. Ollamas eget standardverdi er ofte mye mindre enn det modellen og maskinen din faktisk klarer, noe som kan gjøre at Draft mister oversikten over detaljer som ble skrevet bare et avsnitt eller to tilbake. Et høyere tall krever mer minne (RAM/VRAM) — senk det hvis genereringen blir svært treg eller mislykkes.",
    contextWindowSuggest: "Foreslå fra modellen",
    contextWindowSuggesting: "Sjekker…",
    contextWindowSuggested: "Satt til {value}, modellens egen rapporterte maksverdi.",
    contextWindowSuggestError: "Klarte ikke hente dette fra modellen — angi det for hånd.",
    contextWindowOpenAiNote: "For LM Studio og andre OpenAI-kompatible servere settes kontekstlengden når du laster modellen der, ikke her.",
    proofreadThoroughnessLabel: "Korrekturlesingens grundighet",
    proofreadThoroughnessLede:
      "Hvor hardt Korrekturlesingens Scener-steg leter etter gjentatte scener — flere kandidatpar gir et grundigere søk, men flere modellkall, altså en lengre kjøring. Style-stegets egen tekstsampling (hvor mye av hvert kapittel det leser etter en register-/stemningsglipp) skalerer allerede på egen hånd fra Context window ovenfor; dette gjelder spesifikt Scener-stegets antall kall, der Context window ikke er en god målestokk.",
    proofreadThoroughnessFast: "Rask — færre kandidater, raskere kjøring",
    proofreadThoroughnessBalanced: "Balansert (standard)",
    proofreadThoroughnessThorough: "Grundig — flere kandidater, tregere kjøring",
    filterLoreLabel: "Vis bare relevant lore for Skriv utkast",
    filterLoreLede: "Avslått som standard. Lore-fakta (importert, ikke skrevet i et kapittel) tas ellers alltid med, uansett om kapittelet faktisk handler om dem. Slå på denne hvis Story Bible-en din har mye importert lore og prompten begynner å bli for stor — da tas bare lore med hvis navnet (eller, for Hendelser, en deltaker eller et sted) nevnes i kapittelets brief eller tekst så langt. Pin en enkelt lore-fakta for å alltid ta den med uansett, med samme knapp som allerede finnes i Story Bible.",
    historyLimit: "Versjoner",
    historyLimitLede:
      "Hvor mange tidligere versjoner av et kapittel som lagres, fra Lag utkast, Omskriv, Forleng, Utdyp og Skriv om. Så snart grensen nås, forsvinner den eldste versjonen først. Det du skriver selv for hånd lagres ikke som en egen versjon — bare disse handlingene gjør det.",
    paperLabel: "Papiroverflate",
    paperLede:
      "Selve skriveflatens bakgrunn og tekstfarge, separat fra appens mørke/lyse tema — så du kan ha mørkt tema overalt ellers, men skrive på en lysere side. Gjelder hele appen, ikke bare dette manuset.",
    paperOptions: {
      default: "Følg temaet",
      warm: "Varm hvit",
      sepia: "Sepia",
      gray: "Myk grå",
      dark: "Mørk"
    },
    spellcheckLabel: "Stavekontroll",
    spellcheckHint:
      "De røde understrekningene i skrivebordsappen er operativsystemets egen stavekontroll, ikke noe appen selv kjører — å slå den av her sier bare fra til vinduet at det ikke skal be om den. Gjelder hele appen, ikke bare dette manuset.",
    mascotLabel: "Maskot",
    mascotLede:
      "En følgesvenn som dukker opp med tips innimellom, som å peke ut Guiden på en ny startskjerm. Velg en nedenfor, eller la den stå av — du kan endre dette når som helst. Gjelder hele appen, ikke bare dette manuset.",
    mascotOptions: {
      none: "Av",
      kaamilla: "Kaamilla",
      kaamy: "Kaamy",
      kaambot: "Kaambot"
    },
    assistantHeading: "Assistent",
    dropCapLabel: "Anfang",
    dropCapLede:
      "En stor forbokstav på hvert kapittels første avsnitt, som strekker seg over valgt antall linjer. Vises direkte i skriveflaten og følger med til Publish-eksport (HTML, ePub, RTF, ODT; PDF ikke ennå).",
    dropCapOff: "Av",
    dropCapLines: "{n} linjer",
    sceneBreakLabel: "Stil",
    sceneBreakLede:
      "Dekorasjon for et scenebrudd (et eget `---`-avsnitt) — en uttonende linje med et sentrert symbol istedenfor en enkel kort linje. Vises direkte i skriveflaten og følger med til Publish-eksport, med forenklede varianter i formater som ikke klarer en ekte uttoning (ODT, RTF) eller selve symbolet (PDF tegner en form istedenfor tegnet).",
    sceneBreakPlain: "Enkel (dagens korte linje)",
    sceneBreakVignette: "Klassisk bokvignett (❦)",
    sceneBreakDiamond: "Minimalistisk diamant (❖)",
    sceneBreakFleur: "Fransk eleganse (⚜)",
    sceneBreakSparkle: "Glimmer / stjerne (✦)",
    sceneBreakWidthLabel: "Bredde",
    sceneBreakWidthLede:
      "Hvor bred scenebruddets linje blir, som en skalering på toppen av den valgte stilens egen bredde — en smalere diamant og en smalere vignett holder samme proporsjoner mot hverandre som de alltid har hatt. Vises direkte i skriveflaten og følger med til Publish-eksportene HTML, ePub og PDF (RTF, ODT og IDML tegner scenebrudd som et enkelt sentrert symbol uten linje i det hele tatt, så bredden har ingenting å skalere der).",
    sceneBreakWidthNarrow: "Smal",
    sceneBreakWidthDefault: "Standard",
    sceneBreakWidthWide: "Bred",
    sceneBreakSpacingLabel: "Mellomrom",
    sceneBreakSpacingLede:
      "Rommet over og under scenebruddets linje, som en skalering på toppen av den valgte stilens eget mellomrom. Vises direkte i skriveflaten og følger med til Publish-eksportene HTML, ePub og PDF (RTF, ODT og IDML påvirkes ikke, av samme grunn som Bredde ovenfor).",
    sceneBreakSpacingTight: "Trang",
    sceneBreakSpacingDefault: "Standard",
    sceneBreakSpacingLoose: "Luftig",
    pageSizeLabel: "Sidestørrelse",
    pageSizeLede:
      "Sidemålene for hvert eksportformat med en ekte trykt side — IDML, PDF og ODT (RTF og HTML/ePub flyter fritt uten fast side). Skalerer også omtrent skriveflatens egen bredde etter samme proporsjoner — ikke ekte sideinndeling, skriveflaten ruller fortsatt som én sammenhengende kolonne; ekte side-for-side-layout skjer i Publish-eksportene og, for IDML, til slutt i InDesign eller Affinity.",
    pageSizeA4: "A4",
    pageSizeLetter: "US Letter",
    pageSize6x9: "6 × 9 tommer (pocketbok/trade)",
    pageSizePocket: "Pocket / A-pocket (110 × 180 mm)",
    pageSizeStorpocket: "Storpocket / Forfatterpocket (135 × 210 mm)",
    pageSizeA5: "A5 (148 × 210 mm)",
    pageSizeS5: "S5 / Mellomformat (165 × 242 mm)",
    pageMarginLabel: "Sidemarg",
    pageMarginLede: "Marg på alle fire sider, for de samme tre formatene som Sidestørrelse.",
    pageMarginNarrow: "Smal (0,5 tommer)",
    pageMarginNormal: "Normal (0,75 tommer)",
    pageMarginWide: "Bred (1 tomme)",
    editorBackgroundLabel: "Bakgrunn i redigeringen",
    editorBackgroundLede:
      "En dekorativ bakgrunn bak kapittelkortet og tekstsiden — bare i redigeringsvisningen, påvirker aldri Publish-eksporter som ikke har et slikt lerret. Selve tekstflatene forblir alltid helt solide, så bildet trenger aldri kontrollsjekkes mot teksten din.",
    editorBackgroundNone: "Ingen (vanlig panel)",
    editorBackgroundForest: "Tåkete skog",
    editorBackgroundMilkyWay: "Melkeveien",
    editorBackgroundCork: "Korktavle",
    editorBackgroundTriangles: "Trekanter",
    editorBackgroundFabric: "Stoff",
    editorBackgroundSchool: "Skoledoodler",
    editorBackgroundPine: "Graner",
    editorBackgroundLeaves: "Blader",
    bodyFontLabel: "Skrift",
    bodyFontLede:
      "Skrifttypen for manusets brødtekst — i selve redigeringen, og med i hver eksport fra Publish, så det blir ett valg istedenfor et separat, ulagret valg hver gang.",
    fontCategorySerif: "Serif",
    fontCategorySans: "Grotesk (sans serif)",
    bodyWeightLabel: "Vekt",
    bodyWeightLede:
      "Hvor tung manusets brødtekst ligger på siden — i selve redigeringen, og med i hver eksport fra Publish, akkurat som Font. Bare Normal og Fet fordi det er det hver bundlede skrifttype faktisk leverer.",
    bodyWeightRegular: "Normal",
    bodyWeightBold: "Fet",
    bodyColorDarkLabel: "Farge (mørk modus)",
    bodyColorLightLabel: "Farge (lys modus)",
    bodyColorLede:
      "Manusets tekstfarge — en for appens mørke tema, en for lyst, så den forblir lesbar og bevisst i begge istedenfor en farge valgt for det temaet du tilfeldigvis var i. Publish-eksporter bruker alltid fargen for lyst modus — en statisk side har ingen egen temabryter, samme prinsipp (mørk tekst på lys side) som alle eksporter allerede hadde før denne innstillingen fantes.",
    uiLanguageStays: "Sidens språk blir liggende i hodet.",
    brainstorm: "Brainstorm",
    synopsis: "Synopsis",
    briefs: "Disposisjoner",
    briefsLede:
      "Hvert kort er et kapittel. Dra et kort så følger det med, og de andre glir unna. Dobbeltklikk på en tittel for å skrive kapittelet.",
    reorderBriefs: "Kapitteldisposisjoner. Dra for å endre rekkefølgen.",
    openChapter: "Skriv {title}",
    chapters: "Kapitler",
    add: "Legg til",
    untitled: "Uten tittel",
    removeChapter: "Slett {title}",
    removeChapterFallback: "kapittel",
    discardChapterConfirm: "Flytt “{title}” til Forkastede kapitler?",
    discardedChapters: "Forkastede kapitler",
    restoreChapter: "Gjenopprett {title}",
    restoreDiscarded: "Gjenopprett",
    throwAwayChapter: "Kast {title}",
    throwAwayConfirm: "Kast “{title}” for godt? Kapittelet forsvinner. Dette kan ikke angres.",
    chapterFactsNote: {
      one: "{count} faktum i Story Bible kommer fra dette kapittelet. Det fjernes eller endres ikke automatisk — sjekk Story Bible hvis du vil oppdatere eller slette det for hånd.",
      other: "{count} fakta i Story Bible kommer fra dette kapittelet. De fjernes eller endres ikke automatisk — sjekk Story Bible hvis du vil oppdatere eller slette dem for hånd."
    },
    reorderChapters: "Kapitler. Dra for å endre rekkefølgen.",
    showBrief: "Vis brief for {title}",
    hideBrief: "Skjul brief for {title}",
    continuesCleared:
      "{title} fortsetter ikke lenger fra “{from}”, fordi det kapittelet kommer senere. Nå følger det forrige kapittel i listen.",
    voice: "Forfatterstemme",
    voicePlaceholder: "Tone, rytme, ordvalg",
    chapterVoiceInherit: "Manuskriptets stemme",
    manuscript: "Manuskript",
    brief: "Brief",
    briefPlaceholder: "Hva kapitlet må gjøre. En skriveinstruksjon, ikke kanon.",
    chapterTitle: "Kapitteltittel",
    chapterBrief: "Kapittelbrief",
    chapterVoice: "Kapitlets forfatterstemme",
    voiceCue: "Forfatterstemme",
    reader: "Leser",
    readerTitle: "Hvem teksten skrives for. Velg aldersgruppen som passer best — Voksen skriver uten aldersgrenser i tankene.",
    readerTierHint:
      "Kapitler som skrives for denne leseren får kortere setninger og enklere ord, tilpasset aldersgruppen. Korrekturlesing flagger også banning, vold eller eksplisitt innhold som ikke passer den alderen.",
    readerCategories: {
      board: "Pekebok (opp til 3 år)",
      early: "Lettlest (4–7 år)",
      chapter: "Kapittelbok (8–9 år)",
      middle: "Mellomalder (10–12 år)",
      ya: "Ungdom (13–17 år)",
      adult: "Voksen"
    },
    chapterReader: "Kapitlets leser",
    chapterSettingsToggle: "Kapitlets innstillinger",
    chapterSettingsFor: "Innstillinger for {title}",
    scenesFor: "Scener for {title}",
    scenesPopoverTitle: "Scener",
    chapterReaderInheritOption: "Samme som manuskriptet — {category}",
    readerCue: "Leser",
    placeholdersCue: "Har en plassholder å komme tilbake til",
    newStrand: "ny tråd",
    startChapter: "Start kapittel {n}",
    draft: "Lag utkast",
    extract: "Hent ut fakta",
    extracting: "Henter ut…",
    analyze: "Analyser",
    critics: "Kritikere",
    askPassage: "Spør om kapittelet…",
    proofread: "Korrektur",
    notes: "Notater",
    history: "Historikk",
    recast: "Omskriv prosa",
    recasting: "Omskriver…",
    recastTitle: "Omskriv kapitlet til gjeldende perspektiv, tempus og synsvinkel",
    polish: "Polish",
    polishTitle: "Kjør en vaskerunde på kapitlet, se gjennom endringene før de lagres",
    stop: "Stopp",
    brainstormChat: "Diskuter idéer…",
    openSynopsis: "Åpne synopsis",
    maximize: "Maksimer",
    restore: "Gjenopprett",
    maximizeTitle: "Skjul paneler og skriv",
    restoreTitle: "Vis paneler (Esc)",
    pinPanel: "Fest panelet",
    unpinPanel: "Skjul panelet automatisk — før pekeren mot kanten for å hente det fram igjen",
    resizePanel: "Dra for å endre panelets bredde",
    brainstormLede:
      "Privat kladd. En lapp per idé. Dra dem fritt — det finnes ingen rekkefølge ennå. Når en lapp er klar, dra den til kolonnen Til synopsis til høyre.",
    brainstormPlaceholder: "En idé…",
    synopsisLede:
      "Historien i kortform: hvem som er med, hva som skjer og hvordan den ender. Utkastene tar alltid utgangspunkt i denne oppsummeringen – men ingenting blir bindende før du fastslår det som fakta.",
    synopsisPlaceholder: "Historien i noen setninger.",
    chapterPlaceholder: "Kapitlet lever her. Skriv utkast, skriv om til det er ditt.",
    chapterImageAdd: "Legg til kapittelbilde",
    chapterImageReplace: "Bytt bilde",
    chapterImageRemove: "Fjern bilde",
    instructTitle: "Endre dette notatet",
    instructHint: "Si til modellen hva den skal gjøre med det markerte notatet. Bare det spannet byttes ut.",
    instructPlaceholder: "Hva skal endres?",
    instructAction: "Skriv om",
    addNote: "Ny lapp",
    removeNote: "Fjern lapp",
    removeNoteConfirm: "Kast denne lappen?",
    noteLabel: "Brainstorm-lapp",
    reorderNotes: "Dra for å flytte lappen",
    resizeNote: "Dra for å skalere lappen",
    noteColor: "Lappens farge",
    noteColors: {
      paper: "Papir",
      rust: "Rust",
      sage: "Salvie",
      gold: "Gull",
      lilac: "Lilla"
    },
    sendLane: "Til synopsis",
    sendLaneLede: "Slipp lapper her. Rekkefølgen i kolonnen er rekkefølgen de lander som avsnitt.",
    sendLaneEmpty: "Slipp lapper her",
    sendToSynopsis: "Send til synopsis",
    extractNoteFacts: "Hent ut fakta",
    extractNoteFactsHint: "Finn mulige Story Bible-fakta i denne lappen. De havner i granskingskøen som kandidater — ingenting blir kanon før du låser det.",
    extractSynopsisFacts: "Hent ut fakta",
    extractSynopsisFactsHint: "Finn mulige Story Bible-fakta i denne synopsis. De havner i granskingskøen som kandidater — ingenting blir kanon før du låser det.",
    extractBriefFacts: "Hent ut fakta",
    extractBriefFactsHint: "Finn mulige Story Bible-fakta i denne brief-en. De havner i granskingskøen som kandidater — ingenting blir kanon før du låser det.",
    chapterSummary: "Kapittelsammendrag",
    summaryPlaceholder: "",
    summarizeChapterAction: "Oppsummer",
    summarizeChapterHint: "Et kort sammendrag av hva som skjer i dette kapittelet, så senere kapitlers Skriv utkast/Fortsett/Utdyp/Beat kan se det uten å trenge hele kapittelets tekst. Foreslås under for at du skal godkjenne eller avvise — lagres aldri før du velger.",
    summarizing: "Oppsummerer…",
    summarizeSuggestionLabel: "Foreslått sammendrag",
    applySummarySuggestion: "Bruk denne",
    rejectSummarySuggestion: "Avvis"
  },
  backup: {
    title: "Sikkerhetskopi",
    body: "En JSON-kopi appen kan lese tilbake. Importer sikkerhetskopi på hyllen gjenoppretter den. Alt som er skrevet siden den filen går tapt.",
    downloadHint: "Hvis ingen lagringsdialog vises, sjekk Nedlastinger. I Brave kan du aktivere «Spør hvor hver fil skal lagres før nedlasting» under Innstillinger → Nedlastinger for å velge plassering ved vanlige nedlastinger.",
    saveError: "Kunne ikke lagre sikkerhetskopien. Prøv igjen.",
    whatHappened: "Historikk",
    whatHappenedPlaceholder: "Valgfritt. Omskriv kapittel 2, ny forfatterstemme på 3.",
    documentName: "Dokumentnavn",
    action: "Sikkerhetskopi",
    sendToCore: "Send til kaampi Codex",
    sendToCoreHint: "Lagrer en privat versjon av manuset til din parede kaampi Codex, i tillegg til JSON-filen.",
    sendToCoreSending: "Sender…",
    sendToCoreDone: "Lagret i kaampi Codex.",
    sendToCoreError: "Fikk ikke kontakt med kaampi Codex akkurat nå. Lagres lokalt og sendes automatisk når tilkoblingen er tilbake.",
    errors: {
      "not-backup": "Den filen er ikke en manuskriptsikkerhetskopi.",
      "sandbox-export": "Den filen er en karteksport fra kaampi Explore. Importer den i kaampi Explore, ikke her.",
      "not-manuscript": "Den filen er ikke en kaampi Write-manuskriptsikkerhetskopi.",
      "newer-format": "Denne sikkerhetskopien kommer fra en nyere kaampi Write. Oppdater appen og prøv på nytt.",
      unreadable: "Manuskriptet i filen kunne ikke leses."
    }
  },
  illustration: {
    fieldLabel: "Illustrasjonsstil",
    browseLibrary: "Bla i biblioteket…",
    libraryTitle: "Illustrasjonsstiler",
    searchPlaceholder: "Søk stiler…",
    searchResults: "Søkeresultater",
    saveCurrentAsNew: "Lagre gjeldende tekst som ny stil",
    select: "Bruk denne stilen",
    edit: "Endre",
    delete: "Fjern",
    untagged: "Utaggede",
    noResults: "Ingen stiler passer.",
    newStyleTitle: "Ny stil",
    editStyleTitle: "Endre stil",
    nameLabel: "Navn",
    promptTextLabel: "Prompttekst",
    genreTagsLabel: "Sjangertagger",
    genreTagsPlaceholder: "Kommaseparert, f.eks. Fantasy, Eventyr",
    exampleImageLabel: "Eksempelbilde",
    uploadImage: "Last opp bilde",
    replaceImage: "Bytt bilde",
    removeImage: "Fjern bilde",
    deleteConfirm: "Fjerne “{name}” fra biblioteket? Dette kan ikke angres.",
    promptTitle: "Illustrasjonsprompt",
    promptHint: "Generert fra utdraget, låste Story Bible-fakta og manuskriptets illustrasjonsstil.",
    generating: "Genererer…",
    generateError: "Kunne ikke generere en prompt denne gangen.",
    viewFullImage: "Vis bildet i full størrelse",
    noStyleSelected: "Ingen stil valgt",
    customStyleLabel: "Egen prompt",
    editTextManually: "Rediger teksten manuelt",
    hideManualEdit: "Skjul manuell tekst",
    orientationLabel: "Illustrasjonsformat",
    orientations: {
      landscape: "Liggende",
      portrait: "Stående"
    }
  },
  aiContext: {
    trigger: "Vis AI-kontekst…",
    title: "AI-kontekst",
    hint: "Nøyaktig hva som ble sendt til modellen for den siste jobben, inkludert det som ble utelatt.",
    empty: "Ingen AI-jobb har kjørt ennå denne økten. Kjør en skrive- eller vurderingsjobb og kom tilbake hit.",
    operation: "Jobb",
    model: "Modell",
    tokensEstimate: "~{n} tokens (grovt estimat)",
    systemInstructions: "Systeminstruks",
    whatWasSent: "Det som ble sendt",
    whatCameBack: "Hva modellen svarte (rått, uredigert)",
    target: {
      prose: "kapittel",
      synopsis: "synopsis",
      brainstorm: "brainstorm-lapp"
    },
    operations: {
      draft: "Skriv utkast",
      recast: "Recast",
      polish: "Polish",
      extend: "Fortsett",
      elaborate: "Utdyp",
      instruct: "Skriv om",
      "brainstorm-chat": "Brainstorm-chat",
      "word-swap": "Ordalternativer",
      "sentence-split": "Setningsdeling",
      "paragraph-break": "Avsnittsdeling",
      extract: "Hent fakta",
      analyze: "Analyser",
      critics: "Kritikere",
      illustrate: "Illustrasjonsprompt",
      proofread: "Korrekturlesing",
      "ask-manuscript": "Spør manuset",
      "ask-passage": "Spør om passasje",
      interview: "Karakterintervju",
      develop: "Utviklingsmetode",
      "extract-interview": "Hent ut fakta (intervju)",
      "extract-brainstorm": "Hent ut fakta (brainstorm)",
      "extract-synopsis": "Hent ut fakta (synopsis)",
      "extract-brief": "Hent ut fakta (brief)",
      "import-lore": "Importer lore",
      beat: "Skriv en beat",
      summarize: "Oppsummer kapittel",
      translate: "Oversett kapittel",
      developmental: "Developmental analyse"
    }
  },
  askManuscript: {
    nav: "Spør manuset",
    title: "Spør manuset ditt",
    placeholder: "Still et spørsmål om historien din. Svaret bruker bare det som faktisk er skrevet — med kapitlene det er hentet fra, så du selv kan sjekke det.",
    action: "Spør",
    asking: "Spør…",
    answerHeading: "Svar",
    sourcesHeading: "Kilder",
    jumpToChapter: "Åpne «{chapter}»"
  },
  askPassage: {
    title: "Spør om dette kapittelet",
    lede: "Spør om hva som helst om kapittelets håndverk — tempo, spenning, stemme, om slutten funker. Vær så kritisk du vil, dette er bare til å lese, ingenting lagres.",
    placeholder: "F.eks. «Bygger dette mot en sterk slutt?»",
    action: "Spør",
    asking: "Spør…",
    answerHeading: "Svar"
  },
  interview: {
    action: "Intervju",
    title: "Intervju med {name}",
    titleWorld: "Spør om {name}",
    lede: "En privat samtale med {name}, bygget bare på det som til nå er låst i Story Bible. Ingenting som sies her blir kanon av seg selv — en måte å høre stemmen på og oppdage hull i det som er etablert.",
    ledeWorld: "En privat samtale om {name}, bygget bare på det som til nå er låst i Story Bible. Ingenting som sies her blir kanon av seg selv — en måte å utforske idéer på og oppdage hull i det som er etablert.",
    placeholder: "Spør {name} om noe…",
    placeholderWorld: "Spør om noe angående {name}…",
    ask: "Spør",
    asking: "Spør…",
    you: "Du",
    thinking: "{name} tenker…",
    thinkingWorld: "Tenker på {name}…",
    empty: "Ingenting spurt om ennå. Start samtalen med {name} nedenfor.",
    emptyWorld: "Ingenting spurt om ennå. Start med å utforske {name} nedenfor.",
    extractAction: "Hent ut fakta",
    extracting: "Henter ut…",
    extractAsOf: "Fra og med",
    extractAsOfHint: "Hvilket kapittel — eller, for et kapittel delt i scener, hvilken scene — denne fakta hører til i historiens egen tidsrekkefølge, ikke manuskriptets sideorden. Et Draft for hele kapittelet ser en fakta allerede fra kapittelets første side; et scene-for-scene-Draft ser den først fra og med sin egen scene. Velg punktet der det faktisk blir sant (f.eks. når to karakterer møtes for første gang, eller en avsløring midt i et kapittel), ikke bare det kapittelet du tilfeldigvis har åpent.",
    extractWholeChapter: "Hele kapittelet",
    extractSceneFallback: "Scene {index}",
    personalityLabel: "Personlighet for denne samtalen — prøv deg fram, lagre til profilen når tonen føles riktig",
    personalityPlaceholder: "Hvordan de snakker og reagerer",
    personalitySave: "Lagre til profilen"
  },
  brainstormChat: {
    title: "Tenk høyt",
    lede: "En løs samtale fram og tilbake om historien din — som å snakke med en kompis. Ingenting her er kanon, og ingenting lagres; dra selv inn de ideene du fester deg ved på tavlen.",
    placeholder: "Skriv hva du tenker på…",
    send: "Send",
    sending: "Tenker…",
    you: "Du",
    partner: "Partner",
    thinking: "Tenker…",
    empty: "Ingenting sagt ennå. Begynn å tenke høyt om en idé nedenfor.",
    addToNotes: "Legg til i notatene"
  },
  timeline: {
    nav: "Tidslinje",
    title: "Tidslinje",
    lede: "Leserekkefølgen er ikke alltid når ting skjer. Gi et kapittel en tidsnotat og flytt det for å se hvor det egentlig hører hjemme, sammenlignet med hvor det ligger i manuset.",
    readingPosition: "Manusposisjon {n}",
    storyTimeCaption: "Kronologisk posisjon",
    storyTimePlaceholder: "F.eks. «Tre år tidligere»",
    storyTimeLabel: "Fortellertid for «{chapter}»",
    outOfOrder: "Avviker fra leserekkefølgen",
    moveEarlier: "Flytt tidligere",
    moveLater: "Flytt senere"
  },
  continuity: {
    leakCount: {
      one: "{count} faktum fra senere i historien",
      other: "{count} fakta fra senere i historien"
    },
    leakHint: "Disse er allerede låst sannhet, men etablert etter dette kapitlet — modellen kan likevel se dem her. Ikke nødvendigvis et problem (kanskje er dette kapitlet et hopp fremover), men verdt en rask sjekk.",
    establishedIn: "Etablert i «{chapter}»"
  },
  placeholders: {
    count: {
      one: "{count} plassholder å komme tilbake til",
      other: "{count} plassholdere å komme tilbake til"
    },
    empty: "Plassholder",
    jumpTo: "I «{chapter}»"
  },
  darlings: {
    count: {
      one: "{count} yndling bevart",
      other: "{count} yndlinger bevart"
    },
    jumpTo: "I «{chapter}»",
    restore: "Gjenopprett",
    discard: "Kast for godt"
  },
  plotlines: {
    nav: "Tråder",
    title: "Tråder",
    lede: "Hvilke tråder som går gjennom hvilket kapittel, på et blikk. Merk et kapittel mot hver tråd det berører.",
    chapterColumn: "Kapittel",
    addPlaceholder: "Nytt trådnavn",
    addAction: "Legg til",
    removeThread: "Fjern tråden «{title}»",
    renameLabel: "Trådens navn",
    cellLabel: "{chapter} — {thread}",
    emptyPlotlines: "Ingen tråder ennå. Legg til en under for å starte matrisen.",
    emptyChapters: "Skriv et kapittel først — matrisen trenger noe å vise.",
    colorSwatchLabel: "Sett «{thread}» til fargen {color}",
    colorNames: {
      lime: "Limegrønn",
      green: "Grønn",
      cyan: "Cyan",
      blue: "Blå",
      violet: "Fiolett",
      magenta: "Magenta",
      orange: "Oransje",
      coral: "Korall",
      grey: "Grå",
      charcoal: "Mørkegrå"
    },
    editAction: "Rediger",
    editLabel: "Rediger tråden «{title}»",
    editTitle: "Rediger tråd",
    colorFieldLabel: "Farge",
    descriptionLabel: "Beskrivelse (valgfritt)",
    descriptionPlaceholder: "Vises som en tooltip over trådens navn og dens stolper",
    hideFromAiLabel: "Skjul for AI",
    hideFromAiHint: "Sendes ikke med i Skriv/Fortsett/Utdyp-prompten for kapitler merket med denne tråden. Vises fortsatt for deg mens du skriver.",
    chapterThreadsLabel: "Tråder:"
  },
  method: {
    nav: "Utviklingsmetode",
    title: "Utviklingsmetode",
    lede: "En utviklingsmetode er en ferdig serie steg for å la historien din vokse fra en gnist til en form. Den beholder aldri noe eget — hvert steg skriver bare inn i Synopsis eller Tråder, som du allerede har. Hopp over dette helt hvis du heller vil skrive fritt.",
    pickerLede: "Velg en metode for å få en veiledet vei. Du kan ombestemme deg senere — ingenting som allerede er skrevet, blir noensinne slettet.",
    useAction: "Bruk denne metoden",
    changeAction: "Bytt metode",
    noneAction: "Ingen metode — skriv fritt",
    activeBadge: "I bruk",
    beatsHeading: "Vendepunkter",
    beatsHint: "Hvert vendepunkt under ble en tråd i Tråder. Åpne Tråder for å merke hvilke kapitler som dekker hvilket vendepunkt.",
    openPlotlines: "Åpne Tråder",
    assistAction: "Foreslå en start",
    assisting: "Tenker…",
    draftPlaceholder: "Skriv din egen tekst, eller be assistenten om en start…",
    suggestionHeading: "Forslag",
    useSuggestionAction: "Bruk denne teksten",
    sendToSynopsisAction: "Send til Synopsis",
    sentToSynopsis: "Lagt til i Synopsis.",
    removeOldBeatsConfirm: {
      one: "Fjerne den {count} gjenglemte tråden fra {method} — {titles}?",
      other: "Fjerne de {count} gjenglemte trådene fra {method} — {titles}?"
    },
    methods: {
      snowflake: {
        name: "Snowflake Method",
        description:
          "Start med én setning og la historien vokse utover i noen stadig bredere runder. En forenklet, tre-stegs variant av Randy Ingermansons metode.",
        steps: {
          logline: {
            label: "Én setning",
            prompt: "Oppsummer hele historien i én setning — karakteren, hva hen vil ha, og hva som står i veien."
          },
          paragraph: {
            label: "Ett avsnitt",
            prompt: "La setningen vokse til et kort avsnitt: opptakten, konflikten som utvikler den, vendepunktet underveis, og hvordan det ender."
          },
          synopsis: {
            label: "Full synopsis",
            prompt: "La avsnittet vokse til en full synopsis — hele bokens form, scene for scene der det hjelper."
          }
        }
      },
      "three-act": {
        name: "Three-Act Structure",
        description: "Den klassiske formen opptakt / konfrontasjon / oppløsning, som sju gjenkjennelige vendepunkter.",
        steps: {
          setup: { label: "Opptakt", hint: "Hverdagsverdenen, før historien forstyrrer den." },
          inciting: { label: "Utløsende hendelse", hint: "Hendelsen som setter historien i bevegelse." },
          "break-two": { label: "Steget inn i andre akt", hint: "Karakteren bestemmer seg — det er ingen vei tilbake til hverdagsverdenen." },
          midpoint: { label: "Midtpunkt", hint: "En falsk seier eller falskt nederlag som øker innsatsen." },
          "all-is-lost": { label: "Alt er tapt", hint: "Lavpunktet — det ser ut som karakteren ikke kan vinne." },
          climax: { label: "Klimaks", hint: "Den endelige konfrontasjonen hele historien har bygget mot." },
          resolution: { label: "Oppløsning", hint: "Den nye hverdagsverdenen, etter historiens forandring." }
        }
      },
      "save-the-cat": {
        name: "Save the Cat",
        description: "Blake Snyders 15 vendepunkter — en detaljert, prosentbasert struktur som er populær i sjangerlitteratur og film.",
        steps: {
          "opening-image": { label: "Åpningsbilde", hint: "Et glimt av karakterens verden før historien." },
          "theme-stated": { label: "Temaet sies", hint: "Noen sier, nesten i forbifarten, hva historien egentlig handler om." },
          "set-up": { label: "Opptakt", hint: "Verdenen, persongalleriet, og hva som mangler i karakterens liv." },
          catalyst: { label: "Katalysator", hint: "Hendelsen som setter historien i bevegelse." },
          debate: { label: "Nøling", hint: "Karakteren nøler — kan hen virkelig gjøre dette?" },
          "break-two": { label: "Steget inn i andre akt", hint: "Karakteren velger å handle og forlater den gamle verdenen." },
          "b-story": { label: "B-historien", hint: "En ny tråd begynner — ofte en relasjon som bærer temaet." },
          "fun-and-games": { label: "Løftet innfris", hint: "Grunnideen leverer det den lovet — de klassiske scenene." },
          midpoint: { label: "Midtpunkt", hint: "En falsk seier eller falskt nederlag; innsatsen økes, klokken begynner å tikke." },
          "bad-guys-close-in": { label: "Motstanden presser på", hint: "Både ytre og indre press hardner." },
          "all-is-lost": { label: "Alt er tapt", hint: "Lavpunktet — ofte markert av et tap eller en død." },
          "dark-night": { label: "Sjelens mørke natt", hint: "Karakteren sitter igjen i tapet før hen finner en vei videre." },
          "break-three": { label: "Steget inn i tredje akt", hint: "Karakteren finner løsningen, ofte fra B-historiens lærdom." },
          finale: { label: "Finale", hint: "Karakteren handler på lærdommen og løser historiens problem." },
          "final-image": { label: "Sluttbilde", hint: "Et bilde som speiler åpningsbildet og viser hvor mye som har forandret seg." }
        }
      },
      "hero-journey": {
        name: "Hero's Journey",
        description: "Campbells og Voglers mytiske struktur — tolv steg for en karakter som forlater den kjente verdenen og vender tilbake forandret.",
        steps: {
          "ordinary-world": { label: "Hverdagsverdenen", hint: "Livet før eventyret." },
          call: { label: "Kallet", hint: "Noe forstyrrer hverdagsverdenen." },
          refusal: { label: "Å avvise kallet", hint: "Frykt eller nøling holder karakteren tilbake." },
          mentor: { label: "Å møte mentoren", hint: "Noen gir karakteren det hen trenger for å gå videre." },
          threshold: { label: "Å krysse terskelen", hint: "Karakteren bestemmer seg og forlater hverdagsverdenen." },
          tests: { label: "Prøvelser, allierte, fiender", hint: "Den nye verdenens regler, venner og rivaler læres." },
          approach: { label: "Tilnærming til den indre hulen", hint: "Forberedelser til den sentrale prøvelsen." },
          ordeal: { label: "Den store prøvelsen", hint: "Den sentrale krisen — en berøring med døden, bokstavelig eller ikke." },
          reward: { label: "Belønningen", hint: "Karakteren tar det hen kom for." },
          "road-back": { label: "Veien tilbake", hint: "Å bestemme seg for å fullføre reisen og vende tilbake." },
          resurrection: { label: "Gjenoppstandelsen", hint: "En siste, mer avgjørende prøve som beviser at forandringen er ekte." },
          return: { label: "Hjemkomsten med eliksiren", hint: "Karakteren kommer hjem forandret, med noe å gi tilbake." }
        }
      }
    }
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "En kort gjennomgang — hvordan du får appen til å snakke med en modell, og hva alt gjør når den først gjør det.",
    closeAction: "Lukk",
    fromErrorLink: "Se hurtigstartguiden",
    helpFor: "Guide: {topic}",
    connectAiButton: "Koble til en lokal AI",
    quickstartHeading: "Kom i gang med en lokal AI",
    quickstartCards: [
      {
        heading: "Installer en lokal AI-server",
        body: "Har du ikke allerede en installert, anbefaler vi Ollama — gratis, fra ollama.com. Foretrekker du noe annet? LM Studio eller en annen lokal server fungerer også."
      },
      {
        heading: "Velg din AI-modell",
        body: "AI-modellen er det som faktisk skriver og resonnerer med deg. Vi anbefaler en modell trent for skjønnlitterær prosa, for eksempel fluffy/l3-8b-stheno-v3.2 (søk etter «stheno» i Ollama). Ellers fungerer enhver vanlig chat-modell — for eksempel llama3 eller mistral."
      },
      {
        heading: "Koble den til kaampi Write",
        body: "Kjører du Ollama? Ingenting å stille inn — kaampi Write finner den automatisk. Kjører du LM Studio eller en annen server i stedet? Åpne Innstillinger → Modeller, velg den under Motor, og lim inn serveradressen den viser deg."
      }
    ],
    categories: {
      "getting-started": "Introduksjon",
      "basic-writing": "Grunnleggende skriving",
      "the-writer": "Skriveverktøyet",
      images: "Bilder",
      "focused-workflow": "Fokusert arbeidsflyt",
      "advanced-tools": "Avanserte skriveverktøy",
      "world-bible": "Story Bible",
      "polish-publish": "Puss & publiser",
      troubleshooting: "Feilsøking"
    },
    sections: {
      privacy: {
        heading: "Et helt lukket digitalt pengeskap",
        body: "kaampi Write er bygget rundt én regel: manuset ditt er din eiendom, og det skal aldri forlate datamaskinen din. Det finnes ingen vei ut til internett i selve appen — ingen API-nøkler til ChatGPT, Claude eller andre skytjenester (det er ikke en manglende funksjon, men et bevisst valg), og skriftene følger med i appen i stedet for å hentes utenfra. Teksten din lever bare lokalt i nettleseren, og AI-modellen kjører bare på din egen prosessor. Den frittstående skrivebordsappen (valgfri) kan sjekke om det finnes en nyere versjon av seg selv — aldri av manuset ditt, som den ikke engang har tilgang til. Uansett hva du skriver — dagbok, forretningshemmeligheter eller det neste store fantasy-eposet — blir hver bokstav hos deg."
      },
      author: {
        heading: "Forfatteren vinner alltid over AI-en",
        body: "Modellen foreslår, du bestemmer. En detalj modellen finner på i prosaen forblir et forslag — vist med en lett stiplet understrek — til du låser den i Story Bible. Ingenting blir kanon av seg selv."
      },
      chapters: {
        heading: "Kapitler: Lag utkast, Omskriv, Analyser",
        body: "Lag utkast skriver ny prosa ut fra det som allerede er etablert. Omskriv skriver om samme kapittel i et annet perspektiv eller tempus, med samme hendelser. Analyser gjennomgår et kapittel for vanlige skriveproblemer uten å skrive om en eneste linje — for eksempel å \"fortelle\" i stedet for å vise (i stedet for \"Lisa var rasende\" foreslår den kanskje \"Lisa smalt igjen døren så kaffekoppene skalv\"), fyll-dialog, eller et trekk som kolliderer med et låst karaktertrekk. Leser (i Innstillinger, og per kapittel) angir hvem teksten skrives for — Pekebok til Voksen — slik at setningslengde og ordvalg passer den alderen. Under teksten veksler Sjeldne ord og Klisjeer mellom to valgfrie markeringer — uvanlige ord for den leseren, og formuleringer som høres AI-skrevne ut (\"et bevis på\", overbrukte tankestreker) — én om gangen, avslått som standard."
      },
      "editor-tools": {
        heading: "Høyreklikkmenyen",
        body: "Merk et avsnitt og høyreklikk for Forleng (fortsetter der merkingen slutter), Utdyp (utvider selve avsnittet), Skriv om… (din egen instruks, f.eks. «gjør henne sintere»), Illustrasjonsprompt… (se Images) og Manuell redigering (skriv om bare det markerte avsnittet selv, for hånd — resten av kapittelet blir liggende). Høyreklikker du i stedet uten å merke noe, får du ett eneste valg, Skriv en beat…: beskriv i én linje hva som skjer videre, så skriver modellen bare den beaten — et kort avsnitt, ikke resten av scenen — og setter den inn akkurat der markøren står. Merker du et avsnitt dukker det også opp en liten Fet/Kursiv/Understreket-verktøylinje over det (eller Ctrl+B/I/U) — bare visuell formatering, lagret atskilt fra selve teksten, så den når aldri modellen."
      },
      "add-picture": {
        heading: "Et bilde til kapittelet",
        body: "Legg til et eget bilde — JPEG, PNG eller WebP — øverst i et kapittel. Det er dekorativt, ikke AI-generert: velg en fil fra datamaskinen din, så vises det over kapittelets første linjer, og følger med når du publiserer til HTML, ePub eller PDF."
      },
      "illustration-prompts": {
        heading: "Illustrasjonsprompter",
        body: "Merk et avsnitt og velg Illustrasjonsprompt… i høyreklikkmenyen. Modellen skriver en bildegenereringsprompt — ikke et bilde — bygget på avsnittet, dine låste Story Bible-fakta og manusets illustrasjonsstil, klar til å limes inn i det bildeverktøyet du bruker; kaampi Write forblir helt lokalt og genererer aldri selve bildet. Sett en standardstil under Innstillinger → Illustrasjonsstil, eller åpne stilbiblioteket for å lagre navngitte, gjenbrukbare stiler — hver med egne sjangertagger og et eksempelbilde — slik at hver prompt holder samme utseende gjennom hele boken."
      },
      "brainstorm-synopsis": {
        heading: "Idémyldring & Synopsis",
        body: "Idémyldring er din private oppslagstavle — kladdepapir eller en tavle med post-it-lapper, ett notat per idé, dragbart, ingen rekkefølge kreves. Lag utkast lener seg aldri på et notat du ikke har løftet over til Synopsis. (Spør du modellen om notatene dine, eller ber den forlenge eller utdype et av dem, leser den selvsagt det du spør om — men ingenting derfra blir kanon eller lekker inn i kapittelskrivingen av seg selv.) Løft ideene som holder mål over til Synopsis: formen på hele boken, i noen setninger. Det er dette AI-modellen lener seg på når den senere hjelper deg å skrive kapitler."
      },
      method: {
        heading: "Utviklingsmetode",
        body: "En valgfri, ferdig serie steg for å la en gnist vokse til en form — Snowflake, Three-Act Structure, Save the Cat eller Hero's Journey. Den beholder aldri noe eget: en vendepunktbasert metodes vendepunkter blir tråder i Tråder, og Snowflakes steg skriver rett inn i Synopsis, akkurat som enhver annen notat du sender dit. Å bytte metode, eller velge ingen, sletter aldri noe som allerede finnes i noen av dem."
      },
      plotlines: {
        heading: "Tråder (Plotlines)",
        body: "Hold styr på hvilken tråd som går gjennom hvilket kapittel i en tabell, så en tråd som har vært stille i ti kapitler er lett å oppdage."
      },
      scenes: {
        heading: "Scener",
        body: "Et langt kapittel kan deles opp i scener — velg hvor en slutter og neste begynner, gi den navn, legg til et kort notat. Når et kapittel har scener, kan Lag utkast, Omskriv og Analyser hver for seg rettes mot bare én av dem."
      },
      timeline: {
        heading: "Tidslinje",
        body: "Leserekkefølge og historiens egen tidsrekkefølge er ikke alltid det samme. Gi et kapittel et tidsnotat, og se hvordan boken faller når den sorteres etter når ting faktisk skjer, ved siden av hvor det ligger i manuskriptet."
      },
      "story-bible": {
        heading: "Story Bible",
        body: "Den ene sannhetskilden for historiens fakta — hvem noen er, hvor et sted ligger, hva et navn betyr. Et faktum starter som et forslag, fra deg eller fra en ekstraksjon, og blir bare låst sannhet når du godkjenner det. Låste fakta er det modellen får vite at den ikke får motsi — motsier et nytt forslag et allerede låst faktum (for eksempel at noen plutselig har brune øyne når du har låst blå), blir det flagget ekstra tydelig i gjennomgangskøen. Åpne et kort og trykk Intervju for å chatte om det — i en karakters egen stemme, eller for et sted, en gjenstand, en gruppe eller et konsept, med en verdensbygger-kollega som drøfter det i tredje person — bygget bare på det som til nå er låst. En måte å høre en stemme på eller utforske lore og oppdage hull, ikke skape ny kanon. Sies det noe verdt å ta vare på, trykk Hent ut fakta for å foreslå det til Story Bible — samme gjennomgangskø som all annen ekstraksjon, ingenting legges til før du godkjenner. Ctrl-klikk (Cmd-klikk på Mac) på et navn du kjenner igjen hvor som helst i teksten for å hoppe rett til kortet — et vanlig klikk plasserer bare markøren der, som vanlig."
      },
      continuity: {
        heading: "Kontinuitetsvarsler",
        body: "Når et kapittel kan se et faktum som først ble etablert senere i manuskriptet, blir det flagget — ikke nødvendigvis feil, kanskje er det et tilbakeblikk, bare verdt en rask sjekk. Korrekturlesing går lenger: den sjekker en persons eller en gjenstands registrerte sted gjennom hele historien, i historiens egen tidsrekkefølge, og flagger en forflytning som ser umulig eller uforklart ut gitt hvor mye tid som har gått."
      },
      proofread: {
        heading: "Korrekturlesing",
        body: "En siste gjennomgang av hele manuskriptet: grammatikk, gjentatte scener, stil- og stemningsdrift mellom kapitler, alderstilpasning, en kontinuitetssjekk, et søk etter plantede detaljer som aldri innfris (en pistol som vises i kapittel 4, men som ingen noensinne avfyrer), og en faktasjekk mot hele boken. Når Leser er satt til et barne- eller ungdomsnivå, flagger den også banning, vold eller eksplisitt innhold som ikke passer den alderen. Bare notater — ingenting skrives om for deg. Den pauser og gjenopptar, og sjekker bare på nytt det som faktisk har endret seg."
      },
      "ask-manuscript": {
        heading: "Spør manuskriptet",
        body: "Still et spørsmål om din egen historie og få et svar bygget bare på det som faktisk er skrevet — med kapitlene det kom fra, så du kan sjekke det selv."
      },
      publish: {
        heading: "Publiser",
        body: "Eksporter en ren lesekopi — Markdown, RTF, ODT, HTML, ePub eller PDF. Idémyldring forlater aldri boken; bare selve manuskriptet gjør det."
      }
    },
    faqHeading: "Feilsøking",
    faq: [
      {
        heading: "«Ingen lokal modell funnet»",
        body: "kaampi Write når ikke den lokale serveren din. Kjører du Ollama? Sørg for at den kjører. Kjører du LM Studio eller en annen server? Sjekk Innstillinger → Modeller — motoren og serveradressen må stemme med det som faktisk kjører på datamaskinen din."
      },
      {
        heading: "Hvor lagres boken min?",
        body: "På din egen datamaskin, i nettleserens lokale lagring — ingenting lastes opp noe sted. Bruk Sikkerhetskopi innimellom for å lagre en kopi du kan gjenopprette fra, i tilfelle du sletter nettleserdataene dine."
      },
      {
        heading: "Kan jeg kjøre appen på en annen datamaskin eller mobil i hjemmenettverket mitt?",
        body: "Ja, men det er to separate ting. For å nå selve appen fra en annen enhet, start den med \"npm run dev -- --host\" og bruk nettverksadressen terminalen viser (f.eks. http://192.168.1.23:5175) i stedet for localhost. For at den enheten også skal kunne snakke med den lokale AI-modellen din, må modellserveren (f.eks. Ollama) selv tillate det: la den lytte bredt (OLLAMA_HOST=0.0.0.0), tillat adressen (OLLAMA_ORIGINS), og pek appens modellinnstilling mot datamaskinens nettverksadresse i stedet for localhost. Husk at hver enhet likevel har sitt eget bibliotek — manuskripter deles ikke automatisk mellom dem, du må flytte en bok mellom enheter via Sikkerhetskopi/Gjenopprett."
      },
      {
        heading: "Kan jeg bruke en betalt AI-tjeneste i stedet?",
        body: "Nei — med vilje. kaampi Write snakker bare noensinne med en modell som kjører på din egen datamaskin eller nettverk. Det er ikke en manglende funksjon; det er hele poenget: manuskriptet ditt trenger aldri å forlate maskinen din."
      }
    ]
  },
  handbook: {
    title: "Guide",
    intro:
      "kaampi Write inneholder mange verktøy, men du trenger ikke lære deg alt før du begynner.\nDu kan skrive en hel bok bare ved å opprette kapitler og skrive i editoren. De andre verktøyene finnes der når du trenger hjelp med idéer, struktur, karakterer, kontinuitet, redigering eller publisering.\n\nBegynn enkelt. Legg til struktur når historien trenger det.",
    categories: {
      "getting-started": "Kom i gang",
      "how-you-work": "Slik kan du jobbe",
      plan: "Planlegg historien",
      "story-bible-world": "Story Bible & verdenen",
      writing: "Skrive",
      revise: "Bearbeide manuset",
      "images-publish-backup": "Bilder, publisering & sikkerhetskopi",
      "writing-tips": "Skrivetips",
      help: "Hjelp & feilsøking"
    },
    sections: {
      "connect-local-ai": {
        heading: "Koble til en lokal AI",
        body: "kaampi Write snakker aldri med en skybasert AI-tjeneste. Utkast, omskriving, analyse og intervjuer kjører mot en modell du selv installerer og kjører på din egen datamaskin — ingenting å abonnere på, ingen API-nøkkelfelt noe sted i appen, ingenting som forlater maskinen din.",
        steps: [
          {
            heading: "Hvorfor en lokal modell, ikke en skybasert",
            body: "Dette er ingen manglende funksjon — det er hele poenget med kaampi Write. Manuset ditt er din eiendom og skal aldri måtte forlate datamaskinen din for å være nyttig. Å kjøre modellen lokalt er det som gjør løftet bokstavelig talt sant, ikke bare en policy: det finnes ingen server i andre enden av tilkoblingen å sende teksten din til i det hele tatt."
          },
          {
            heading: "1. Installer en lokal AI-motor",
            body: "En motor er programmet som faktisk kjører en modell på datamaskinen din; kaampi Write snakker med motoren, og motoren snakker med modellen. Har du ingen fra før, anbefaler vi Ollama — gratis, fra ollama.com, og enklest å få i gang. Foretrekker du noe annet, fungerer LM Studio og andre lokale servere også."
          },
          {
            heading: "2. Velg en modell",
            body: "Modellen er det som faktisk skriver og resonnerer sammen med deg — motoren fra steg 1 bare kjører den. Vi anbefaler én tilpasset skjønnlitteratur, for eksempel fluffy/l3-8b-stheno-v3.2 (søk på «stheno» i Ollama). Ellers fungerer enhver vanlig chat-modell fint — llama3 eller mistral, for eksempel."
          },
          {
            heading: "3. Koble den til kaampi Write",
            body: "Bruker du Ollama? Ingenting å stille inn — kaampi Write finner den automatisk på datamaskinen din. Bruker du LM Studio eller en annen server i stedet? Åpne Settings → Models, velg den under Engine, og lim inn serveradressen den viser deg."
          },
          {
            heading: "Hvis ingenting skjer når du skriver utkast",
            body: "kaampi Write når ikke den lokale serveren din. Sørg for at motoren fra steg 1 faktisk kjører, og at en chat-modell er installert i den. Settings → Models viser hvilken motor og adresse den prøver å bruke — de må stemme med det som faktisk kjører på datamaskinen din."
          }
        ]
      },
      "connection-presets": {
        heading: "Tilkoblingssnarveier",
        body: "En snarvei er en lagret vei tilbake til én bestemt motor og serveradresse — nyttig så snart du jevnlig snakker med mer enn én.",
        steps: [
          {
            heading: "Hvem dette er for",
            body: "Bruker du bare én lokal server noensinne, trenger du trolig aldri dette — Settings → Models husker allerede den ene tilkoblingen din. Snarveier begynner å lønne seg først når du bytter mellom mer enn én: Ollama for hverdagsskriving, LM Studio for en annen modell, en testmaskin på nettverket ditt."
          },
          {
            heading: "Lagre en tilkobling som en rute",
            body: "Settings → Models lar deg lagre en Engine og Server address som en navngitt rute, i stedet for å skrive inn adressen på nytt hver gang du bytter mellom dem. Klikk på en rute for å gjøre den til den aktive tilkoblingen igjen."
          },
          {
            heading: "Rediger eller fjern en rute",
            body: "Hver rute utvides for å vise og redigere sine egne innstillinger — en Update-knapp lagrer endringer på akkurat den ruten, og en slett-knapp fjerner den. Å redigere en rute endrer bare den lagrede snarveien; det rører ikke den aktive tilkoblingen akkurat nå med mindre du også klikker på den."
          },
          {
            heading: "Det som er aktivt, forblir alltid synlig",
            body: "Hvilken motor og adresse kaampi Write faktisk bruker akkurat nå, vises og forblir redigerbart enten den tilfeldigvis er lagret som en rute eller ikke. Å lagre en rute er bare en bekvemmelighet for å finne tilbake senere — det kreves aldri for å bruke en tilkobling."
          }
        ]
      },
      "first-book": {
        heading: "Opprett din første bok",
        body: "Et navn er alt kaampi Write faktisk trenger fra deg for å begynne — alt annet er valgfritt, og ingenting trenger å skje i en bestemt rekkefølge.",
        steps: [
          {
            heading: "1. Gi den et navn",
            body: "Skriv en tittel og trykk Enter, eller klikk på pilen ved siden av feltet. Det er hele forberedelsen — du trenger ingen Synopsis, ingen Story Bible, ingen fortellermetode eller noen form for disposisjon før du begynner."
          },
          {
            heading: "2. Gå rett til siden",
            body: "Et nytt manus åpnes med ett tomt kapittel som allerede venter. Kapitler → Kapittel 1 → begynn å skrive, akkurat som å åpne et tomt dokument i et vanlig skriveprogram — klikk inn på siden og skriv."
          },
          {
            heading: "3. Ordene dine lagres underveis",
            body: "kaampi Write lagrer det du skriver automatisk, et kort øyeblikk etter at du har sluttet å skrive — ingen Lagre-knapp å huske på, og ingenting å miste om du lukker fanen eller appen."
          },
          {
            heading: "Ta i bruk AI bare når du vil",
            body: "Å skrive alt for hånd er en fullverdig, normal måte å bruke kaampi Write på. AI-verktøyene (Skriv utkast, Forleng, Utbrodér og resten) ligger under siden når du bestemmer deg for at du vil ha hjelp med et bestemt kapittel — aldri et krav for å få ord på siden."
          }
        ]
      },
      "first-chapter": {
        heading: "Ditt første kapittel",
        body: "Et kapittel er i bunn og grunn to atskilte ting som bor på to atskilte steder: en brief som beskriver hva det skal oppnå, og selve manuset — ordene en leser faktisk kommer til å se.",
        steps: [
          {
            heading: "Briefen er en instruksjon, ikke prosa",
            body: "Briefen ligger over siden og beskriver hva kapittelet skal oppnå — for deg, og for AI-verktøyene hvis du bruker dem. Den trenger aldri å være velskrevet; det er et notat til deg selv, ikke en del av historien. For eksempel: «Erik ankommer den gamle jernbanestasjonen. Der møter han en kvinne som virker å kjenne faren hans. Hun nekter å forklare hvordan, og legger igjen et gammelt fotografi på bordet.»"
          },
          {
            heading: "Manuset er det som vokser frem fra den",
            body: "Under briefen er selve siden — kapittelets faktiske tekst, delen en leser vil se. Det er historien som vokser frem fra det briefen beskrev, skrevet i så mye eller så lite detalj som briefen ga deg."
          },
          {
            heading: "Skriv det selv, eller la Skriv utkast begynne",
            body: "Du kan skrive kapittelet for hånd ut fra briefen, akkurat som du ville skrevet ut fra hvilken som helst disposisjon. Eller trykk Skriv utkast for å få en hel første runde fra modellen, bygget på briefen pluss alt annet som allerede er etablert om historien — noe å lese, beholde eller skrive om, ikke en endelig versjon."
          },
          {
            heading: "En brief er ikke et sammendrag",
            body: "Briefen beskriver hva som skal skje, skrevet før kapittelet finnes. Når kapittelet først er skrevet, registrerer et eget felt — Summary — hva som faktisk skjedde, i etterkant. De to peker motsatt vei langs samme kapittel; Summary får sitt eget kapittel lenger ut i denne guiden."
          }
        ]
      },
      "map-of-storybook-ai": {
        heading: "Et kart over kaampi Write",
        body: "Verktøyene i kaampi Write faller ganske greit inn under seks steg — Utforsk, Planlegg, Etabler, Skriv, Gjennomgå, Ferdigstill. Kartet under går fra venstre til høyre fordi det er lettest å vise på en side, ikke fordi hver bok faktisk går gjennom det i den rekkefølgen.",
        steps: [
          {
            heading: "Utforsk – her får idéer være usikre",
            body: "Brainstorm og Intervju verdenen. Ingenting her er fastsatt ennå; det er et sted å prøve en idé høyt før du bestemmer om den i det hele tatt hører til historien."
          },
          {
            heading: "Planlegg – her former du historien",
            body: "Synopsis, Kapittelbriefer, Scener, Tråder, Tidslinje. Disse gir historien en retning og en form — så løs eller så detaljert som du vil."
          },
          {
            heading: "Etabler – her bestemmer du hva som regnes som sant",
            body: "Story Bible, Trekk ut fakta, Gjennomgå, Lås. Dette er det eneste steget som faktisk binder noe — et faktum begynner først å begrense senere skriving når du har låst det her."
          },
          {
            heading: "Skriv – her blir det prosa",
            body: "Kapitler — Skriv utkast, Skriv en beat, Forleng, Utdyp, Skriv om. Alt oppstrøms (Planlegg, Etabler) finnes for å gi mat til dette steget; dette er det eneste steget ingen bok hopper over."
          },
          {
            heading: "Gjennomgå – her kontrollerer du hva du har skrevet",
            body: "Analyser, Polish, Spør manuset, Spør om en passasje, Kontinuitet, Korrekturles, Developmental analysis. Ulike verktøy her stiller ulike spørsmål — en kapittelnivå-kontroll av håndverket er en annen jobb enn en kontroll av bokens tempo."
          },
          {
            heading: "Ferdigstill – å få ut boken",
            body: "Bilder, Språkversjoner, Publiser, Sikkerhetskopier. Det siste steget, nådd når et kapittel — eller hele boken — er klar til å forlate kaampi Write."
          }
        ],
        tip: "Det er et kart, ikke en obligatorisk rekkefølge. Mange kapitler går rett fra Skriv til Skriv igjen, og hopper helt over Planlegg og Gjennomgå til mye senere — eller aldri."
      },
      "no-required-workflow": {
        heading: "Du trenger ikke bruke alt",
        body: "kaampi Write kan brukes på mange ulike måter. Det finnes ingen obligatorisk arbeidsflyt — de fem eksemplene under er utgangspunkter, ikke en meny du må velge nøyaktig ett fra.",
        steps: [
          {
            heading: "Jeg vil bare begynne å skrive",
            body: "Kapittel → Skriv → Neste kapittel. Planlegg senere, bare når du faktisk trenger det — ingenting hindrer deg fra å legge til en Synopsis eller et Story Bible-faktum midt i kapittel 12."
          },
          {
            heading: "Jeg vil planlegge historien",
            body: "Brainstorm → Synopsis → Kapittelbriefer → Kapitler. Form historien før du skriver den scene for scene, uten å binde deg til en navngitt fortellermetode."
          },
          {
            heading: "Jeg vil jobbe svært strukturert",
            body: "Synopsis → Fortellermetode → Tråder → Kapittelbriefer → Scener → Tidslinje → Kapitler. Alle planleggingsverktøyene kaampi Write har, brukt sammen, før det første ordet prosa."
          },
          {
            heading: "Jeg har allerede et manus",
            body: "Legg inn eksisterende tekst → Analyser → Story Bible → Bearbeid → Publiser. Å begynne med ferdig eller delvis skrevet prosa i stedet for et tomt dokument endrer ikke hvilke verktøy som er tilgjengelige for deg."
          },
          {
            heading: "Jeg kommer fra et annet skriveverktøy",
            body: "Ta med manus og lore → Importer → Gjennomgå → Fortsett å skrive. Samme vei som over, bare med materiale bygget et annet sted som utgangspunkt."
          }
        ],
        tip: "Du velger selv hvor mye struktur du trenger — og svaret kan gjerne endre seg mellom bøker, eller mellom kapitler i samme bok."
      },
      "three-workflows": {
        heading: "Tre komplette arbeidsflyter",
        body: "Tre måter å bruke kaampi Write fra start til slutt, fra løsest til mest strukturert. Ingen av de tre er mer riktig enn de andre — de er ulike avveininger mellom fart og støtte.",
        steps: [
          {
            heading: "Jeg skriver intuitivt",
            body: "Nytt manus → Kapittel 1 → Skriv → Kapittel 2 → Skriv. Når historien vokser: Trekk ut fakta → Story Bible, for å holde kontinuiteten uten å planlegge i forveien. Senere: Analyser → Polish → Korrekturles → Publiser. Du trenger aldri lage en detaljert plan noe sted på denne veien."
          },
          {
            heading: "Jeg vil planlegge først",
            body: "Brainstorm → Synopsis → Kapittelbriefer → Skriv kapitler → Story Bible → Analyser → Polish → Korrekturles → Publiser. Dette gir historien en reell retning før du skriver et ord prosa, uten å kreve en navngitt dramatisk struktur."
          },
          {
            heading: "Jeg vil planlegge mye",
            body: "Brainstorm → Snowflake → Synopsis → Tre akter / Save the Cat / Heltens reise → Tråder → Kapittelbriefer → Scener → Tidslinje → Skriv → Story Bible + kontinuitet → Analyser → Developmental analysis → Polish → Korrekturles → Publiser. Alle verktøyene, i omtrent den rekkefølgen de er mest nyttige — den mest strukturerte av de tre, bygget for forfattere som vil ha støtten på plass før de skriver."
          }
        ]
      },
      "which-tool-do-i-need": {
        heading: "Hvilket verktøy trenger jeg?",
        body: "Et symptombasert register — finn det du føler deg fast på under, og se hvilket verktøy som faktisk løser det.",
        steps: [
          {
            heading: "Finne historien",
            body: "”Jeg vet ikke hva historien handler om.” → Brainstorm. ”Jeg har en idé men får den ikke til en hel historie.” → Snowflake. ”Jeg har mange idéer men ingen helhet.” → Synopsis. ”Jeg vet ikke helt hvem karakteren min er ennå.” → Intervju verdenen. ”Jeg vil prøve idéer om karakteren uten å påvirke boken.” → Intervju verdenen."
          },
          {
            heading: "Forme strukturen",
            body: "”Jeg trenger en enkel dramatisk struktur.” → Tre akter. ”Jeg vil jobbe med flere tydelige beats.” → Save the Cat. ”Historien handler om hovedpersonens forandringsreise.” → Heltens reise."
          },
          {
            heading: "Holde oversikt under skrivingen",
            body: "”Jeg trenger å huske hva som faktisk gjelder.” → Story Bible. ”Jeg mister oversikten over hva kapittelet skal gjøre.” → Kapittelbrief. ”Kapittelet har blitt for komplisert.” → Scener. ”Jeg mister oversikten over ulike handlinger og relasjoner.” → Tråder. ”Jeg mister oversikten over når ting skjer.” → Tidslinje."
          },
          {
            heading: "Komme seg videre midt i en scene",
            body: "”Jeg har satt meg fast midt i en scene.” → Skriv en beat, Forleng eller Utdyp. ”Dette kapittelet må leses nøyaktig som et tidligere gjorde, ord for ord.” → Vedlagt kontekst. ”Jeg klippet bort noe bra, men er ikke klar for å miste det for godt.” → Darlings. ”Et lite spørsmål ville brutt flyten min hvis jeg stoppet for det akkurat nå.” → Plassholdere."
          },
          {
            heading: "Gjennomgå det du har skrevet",
            body: "”Jeg vet ikke om kapittelet fungerer.” → Analyser. ”Jeg vil at AI skal stramme opp selve prosaen, ikke bare peke ut ting.” → Polish. ”Jeg vil ha ærlig, kritisk tilbakemelding på et konkret spørsmål.” → Spør om kapittelet / Spør om en passasje. ”Jeg finner ikke tilbake til noe i det lange manuset mitt.” → Spør manuset. ”Jeg vil vite om bokens tempo og tråder faktisk henger sammen.” → Developmental analysis."
          },
          {
            heading: "Ferdigstille",
            body: "”Historien er ferdig og jeg vil ha en siste linje-for-linje-sjekk før noen leser den.” → Korrekturles. ”Jeg trenger boken på et annet språk også.” → Språkversjoner. ”Jeg vil gi noen boken å lese.” → Publiser."
          }
        ]
      },
      "most-important-principle": {
        heading: "Det viktigste prinsippet",
        body: "kaampi Write inneholder mange funksjoner fordi ulike forfattere jobber på ulike måter. Det betyr ikke at alle funksjonene må brukes — å ikke bruke de fleste av dem er en helt normal måte å skrive en bok på her.",
        steps: [
          {
            heading: "Begynn med historien, ikke verktøyene",
            body: "Når du støter på et problem, velg verktøyet som hjelper med akkurat det problemet — gå aldri gjennom funksjonslisten for å finne noe å bruke."
          },
          {
            heading: "Ett verktøy per steg",
            body: "Utforsk når du trenger idéer. Planlegg når du trenger retning. Lås fakta når noe skal bli etablert. Skriv når du vet nok til å fortsette. Gjennomgå når du vil forstå hva du har skrevet."
          }
        ],
        tip: "Verktøyene skal tilpasse seg måten du skriver på — ikke omvendt. Hvis en funksjon ikke løser et problem du faktisk har, går du ikke glipp av noe ved å hoppe over den."
      },
      "brainstorm-free": {
        heading: "Brainstorm – tenk fritt",
        body: "Brainstorm er din private kladdeblokk — en fri korktavle med lapper, ikke et skjema å fylle ut. Ingenting her trenger å være bestemt ennå.",
        steps: [
          {
            heading: "Legg til en lapp",
            body: "Klikk på ”Ny lapp” i bunnteksten, eller klikk hvor som helst på en tom flate på brettet — begge måtene gir en tom lapp nøyaktig der du forventer den. (Hvis en lapp allerede er markert, avmarkerer det første klikket på tom flate bare den — klikk igjen for å legge til en ny.)"
          },
          {
            heading: "Fargekod, flytt og skaler fritt",
            body: "Hver lapp har fem fargeprikker øverst — Papir, Rust, Salvie, Gull, Lilla — klikk på en for å bytte; fargene er bare til din egen sortering, ingenting leser dem. Dra i det stripete håndtaket i lappens header for å flytte den hvor som helst på brettet, også oppå en annen lapp — det finnes ikke noe rutenett eller tvungen rekkefølge. Dra langs høyrekanten for å gjøre den bredere eller smalere.",
            image: { src: "/handbook/brainstorm-free/note-detail.png", alt: "En brainstorm-lapp som viser drahåndtaket, fem fargeprikker med Rust valgt, fjern-knappen og snarveien Hent ut fakta" }
          },
          {
            heading: "Brainstorm påvirker ikke historien automatisk",
            body: "Dette er den viktige delen. En idé som ligger i Brainstorm blir ikke automatisk en del av historien, og den skal ikke i det stille begynne å styre vanlige kapittelutkast bare fordi den finnes."
          },
          {
            heading: "Køe idéer, send dem så til Synopsis",
            body: "Dra en lapps håndtak inn i kolonnen «Til synopsis» til høyre — plasseringen der blir dens avsnittsrekkefølge, og ingenting er endret i historien ennå. Først når du trykker «Send til synopsis» skrives de køede lappene faktisk inn i Synopsis, i den rekkefølgen; frem til da kan du fortsette å omorganisere, bytte lapper inn og ut, eller bare la dem ligge køet og komme tilbake senere.",
            image: { src: "/handbook/brainstorm-free/send-lane.png", alt: "To lapper på brainstorm-brettet som overlapper hverandre, og en tredje lapp køet i kolonnen Til synopsis ved siden av knappen Send til synopsis" }
          }
        ],
        tip: "Hver lapp har også sin egen «Hent ut fakta»-knapp — en snarvei for å hente mulige Story Bible-fakta direkte ut av én idé, uten å forlate Brainstorm."
      },
      "synopsis-short": {
        heading: "Synopsis – historien i kortform",
        body: "Synopsis beskriver historien som helhet — ikke et enkelt kapittel, men formen på hele historien.",
        steps: [
          {
            heading: "Hva som hører hjemme i en Synopsis",
            body: "Hvem som er viktige, hva som skjer, hvilke større konflikter som finnes, og hvor historien er på vei. Ikke scene-for-scene-detalj — den overblikket en fremmed ville trengt for å forstå hva boken handler om."
          },
          {
            heading: "Fra en Brainstorm-lapp til en Synopsis-linje",
            body: "Brainstorm: ”Tenk om kvinnen på toget kjenner Eriks far?” Når du bestemmer deg for å bruke idéen, kan den utvikles til: ”Under reisen møter Erik en kvinne som viser seg å kjenne til omstendighetene rundt farens forsvinning.” Den setningen hører hjemme i Synopsis — den er ikke lenger et kanskje."
          },
          {
            heading: "Hvordan planleggingsverktøyene forholder seg til hverandre",
            body: "Brainstorm = kanskje. Synopsis = historiens plan. Kapittelbrief = ett kapittels oppgave. Manus = selve historien, slik den faktisk er skrevet."
          }
        ]
      },
      "chapter-briefs": {
        heading: "Kapittelbriefer",
        body: "En kapittelbrief beskriver hva et kapittel skal oppnå. Den trenger ikke være velskrevet — den er en instruksjon til deg selv, og til AI når du bruker skrivehjelpen.",
        steps: [
          {
            heading: "Hvordan en brief kan se ut",
            body: "”Erik møter kvinnen i spisevognen. Hun antyder at hun kjente faren hans, men nekter å si hvordan. Kapittelet slutter med at hun legger igjen et fotografi på bordet.” Usminket, funksjonell, skrevet for å være nyttig snarere enn vakker."
          },
          {
            heading: "Briefen er ikke selve historien",
            body: "Den beskriver hva historien skal gjøre i dette kapittelet — ikke hvordan det formuleres, ikke eksakt dialog, ikke prosaen. Skriveverktøyene omgjør briefen til det faktiske kapittelet."
          },
          {
            heading: "Hvordan det hører sammen med Synopsis og manuset",
            body: "Synopsis = hele historien. Brief = ett kapittel. Manus = det leseren faktisk får."
          }
        ]
      },
      "chapter-summary": {
        heading: "Kapittelsammendrag",
        body: "Ved siden av Kapittelbrief finnes et nytt felt, Kapittelsammendrag — en kort notis om hva som faktisk skjedde i kapittelet, når det er skrevet.",
        steps: [
          {
            heading: "Før og etter",
            body: "Brief = hva kapittelet skal gjøre, skrevet før du skriver utkastet. Sammendrag = hva kapittelet faktisk gjorde, skrevet etterpå."
          },
          {
            heading: "Å skrive sammendraget",
            body: "Skriv det for hånd, eller klikk ”Oppsummer kapittel” for å få det generert direkte fra teksten du nettopp skrev."
          },
          {
            heading: "Hvorfor sammendrag betyr noe for senere kapitler",
            body: "Når et kapittel har et sammendrag, flyter tidligere kapitlers sammendrag inn i Utkast, Forleng, Utdyp og Beat for senere kapitler — i historiens tidsrekkefølge, ikke bare kapittelrekkefølge — slik at modellen kan holde styr på hva som allerede har skjedd uten at hvert tidligere kapittels fulle tekst trenger å presses inn i prompten."
          },
          {
            heading: "Ingenting er påkrevd",
            body: "Et kapittel ingen har sammendratt ennå, blir ganske enkelt utelatt fra den konteksten. Ingenting går i stykker — det betyr bare at kapittelets hendelser ikke er tilgjengelige som bakgrunn for senere kapitler før du legger til et sammendrag."
          }
        ]
      },
      "development-methods": {
        heading: "Fortellermetoder",
        body: "kaampi Write inneholder flere metoder som kan hjelpe deg å utvikle eller strukturere historien. De er helt frivillige — du kan alltid velge Ingen metode, og skrive fritt i stedet.",
        steps: [
          {
            heading: "Hva metodene er til for",
            body: "Snowflake, Tre akter, Save the Cat og Heltens reise tilbyr hver sin egen måte å tenke på en historie — noen fokuserer på å utvikle innhold, andre på å strukturere det. Kapitlene som følger går gjennom hver av dem."
          }
        ]
      },
      "snowflake-method": {
        heading: "Snowflake",
        body: "Snowflake passer når du har en idé men ennå ikke en hel historie. Den hjelper deg å utvikle innholdet steg for steg, der hver runde legger til mer detalj enn den forrige.",
        steps: [
          {
            heading: "Én setning",
            body: "”En journalist vender tilbake til hjemøya for å undersøke farens tjue år gamle forsvinning.” Hele historien, komprimert til sin kjerne."
          },
          {
            heading: "Ett avsnitt",
            body: "Utvikle grunnidéen med konflikt, utvikling og retning — fortsatt kort, men ikke lenger bare én linje."
          },
          {
            heading: "Full synopsis",
            body: "Bygg videre til du har en sammenhengende beskrivelse av hele historien, og send den deretter til Synopsis."
          },
          {
            heading: "Skriv selv, eller med AI",
            body: "Hvert steg kan gjøres for hånd eller med AI som støtte — metoden krever ikke spesifikt det ene eller det andre."
          }
        ],
        tip: "Snowflake hjelper først og fremst med å svare på ett spørsmål: ”Hva er dette egentlig for en historie jeg holder på å skrive?”"
      },
      "three-act": {
        heading: "Tre akter",
        body: "Tre akter passer når du vil ha en enkel dramatisk ryggrad for historien, uten en lang liste navngitte beats å holde styr på.",
        steps: [
          {
            heading: "Vendepunktene",
            body: "kaampi Write bruker sentrale vendepunkter: Opptakt, Utløsende hendelse, Steget inn i andre akt, Midtpunkt, Alt er tapt, Klimaks, Oppløsning."
          },
          {
            heading: "De blir Tråder",
            body: "Hvert vendepunkt blir en Tråd du kan koble til spesifikke kapitler i historien."
          },
          {
            heading: "Eksempel fra virkeligheten",
            body: "Utløsende hendelse: ”Nora finner et brev fra sin forsvunne far.” (Kapittel 3). Senere — Midtpunkt: ”Nora oppdager at brevet ble skrevet etter datoen faren skal ha forsvunnet.” (Kapittel 12)."
          }
        ],
        tip: "Metoden hjelper deg å se historiens større bevegelse. Den skriver ikke historien for deg."
      },
      "save-the-cat": {
        heading: "Save the Cat",
        body: "Save the Cat gir flere holdepunkter enn Tre akter — et finere kart over samme type reise.",
        steps: [
          {
            heading: "De femten holdepunktene",
            body: "Åpningsbilde, Temaet uttales, Opptakt, Katalysator, Nøling, Steget inn i andre akt, B-historien, Løftet innfris, Midtpunkt, Motstanden presser på, Alt er tapt, Sjelens mørke natt, Steget inn i tredje akt, Finale, Sluttbilde."
          },
          {
            heading: "Opprettes som Tråder",
            body: "Hvert holdepunkt blir en Tråd. Du bestemmer selv hvordan – og om – det faktisk passer historien din."
          }
        ],
        tip: "Eventuelle prosentangivelser metoden nevner er retningslinjer, ikke regler for nøyaktig hvor noe må skje. Bruk den som et kart, ikke en fasit."
      },
      "heros-journey": {
        heading: "Heltens reise",
        body: "Heltens reise passer historier der hovedpersonens forandring er selve temaet for boken.",
        steps: [
          {
            heading: "De tolv stegene",
            body: "Hverdagsverdenen, Kallet, Å avvise kallet, Å møte mentoren, Å krysse terskelen, Prøvelser/allierte/fiender, Nærmer seg den innerste hulen, Den store prøvelsen, Belønningen, Veien tilbake, Gjenoppstandelsen, Hjemkomsten med eliksiren."
          },
          {
            heading: "Også disse opprettes som Tråder",
            body: "Hvert steg blir en Tråd du kan koble til et kapittel, akkurat som med de andre metodene."
          },
          {
            heading: "Reisen behøver ikke være bokstavelig",
            body: "En karakter kan forlate sin trygge verden ved å flytte, starte et forhold, miste jobben, oppdage en hemmelighet eller ta en beslutning som forandrer livet — ingen oppdrag eller magi kreves."
          }
        ]
      },
      "method-differences": {
        heading: "Forskjellen mellom metodene",
        body: "De fire fortellermetodene deler seg i to ulike oppgaver, og det hjelper å vite hvilken du faktisk trenger.",
        steps: [
          {
            heading: "Snowflake utvikler innhold",
            body: "Idé → Én setning → Ett avsnitt → Full synopsis → Synopsis. Snowflake handler om å finne ut hva historien egentlig er."
          },
          {
            heading: "De tre beat-metodene strukturerer utvikling",
            body: "Tre akter / Save the Cat / Heltens reise: Metode → Beats og vendepunkter → Tråder → Kapitler. Disse hjelper deg å ordne en historie du allerede har et visst grep om."
          },
          {
            heading: "Å bytte metode senere er trygt",
            body: "Det du allerede har skrevet i Synopsis, eller allerede opprettet som Tråder, slettes ikke bare fordi du velger en annen metode, eller bestemmer deg for å gå tilbake til å skrive fritt."
          }
        ]
      },
      scenes: {
        heading: "Scener",
        body: "Når et kapittel blir langt eller komplisert, kan det hjelpe å dele det opp i Scener — mindre, navngitte beats inni samme kapittel.",
        steps: [
          {
            heading: "Eksempel fra virkeligheten",
            body: "Kapittel 8 – Fyrtårnet. Scene 1: Nora ankommer øya. Scene 2: Hun bryter seg inn i fyrtårnet. Scene 3: Hun finner fotografiene. Scene 4: Noen låser døren utenfra."
          },
          {
            heading: "Hvordan Scener forholder seg til briefen",
            body: "Brief = kapittelets oppdrag. Scener = veien gjennom kapittelet — stegene som tar det fra start til slutt."
          },
          {
            heading: "To måter å dele av en på",
            body: "I Scener-panelet velger ”Split into two…” et avsnitt å bryte ved. Eller marker nøyaktig den teksten som skal bli sin egen scene og velg ”Create scene” fra merkemenyen."
          }
        ],
        tip: "Du trenger ikke Scener for enkle kapitler der du allerede har oversikten i hodet."
      },
      plotlines: {
        heading: "Tråder",
        body: "Tråder hjelper deg å følge ting som utvikler seg gradvis gjennom historien, i stedet for ting som skjer i ett enkelt kapittel.",
        steps: [
          {
            heading: "Hva du kan følge med en Tråd",
            body: "Hovedkonflikten, et forhold, et mysterium, en hemmelighet, en rivalisering, en karakterforandring, eller en samling dramaturgiske beats fra en fortellermetode."
          },
          {
            heading: "Eksempel fra virkeligheten",
            body: "🔴 Farens forsvinning. 🟡 Nora og Elias. 🔵 Fyrtårnets historie. Hver farge merker en egen tråd du kan følge gjennom kapitlene."
          }
        ],
        tip: "Du kan se hvordan disse løper gjennom kapitlene. Hvis en viktig sidehandling plutselig forsvinner i ti kapitler, blir det lett å oppdage — fargen slutter bare å dukke opp."
      },
      timeline: {
        heading: "Tidslinje",
        body: "Tidslinje svarer på ett spørsmål: når skjer dette? Den blir spesielt nyttig når kapittelrekkefølgen ikke er det samme som historiens faktiske kronologi.",
        steps: [
          {
            heading: "Kapittelrekkefølge",
            body: "Kapittel 1 – 2026: Nora vender tilbake. Kapittel 2 – 2006: Faren forsvinner. Kapittel 3 – 2026: Nora finner brevet. Kapittel 4 – 1998: Faren møter Elias."
          },
          {
            heading: "Kronologisk rekkefølge",
            body: "1998 → 2006 → 2026. De samme fire kapitlene, omordnet etter når hendelsene faktisk skjedde, i stedet for når leseren møter dem."
          }
        ],
        tip: "Tidslinje hjelper deg å holde styr på forskjellen mellom de to rekkefølgene, slik at et tidshopp forblir bevisst snarere enn forvirrende."
      },
      "scenes-plotlines-timeline": {
        heading: "Scener, Tråder og Tidslinje",
        body: "De tre verktøyene kan se like ut ved et første blikk, men de svarer på tre ulike spørsmål.",
        steps: [
          {
            heading: "Tre ulike spørsmål",
            body: "Scener: hva skjer? Tråder: hva utvikler seg? Tidslinje: når skjer det?"
          }
        ],
        tip: "Den samme hendelsen kan finnes i alle tre uten at verktøyene gjør samme jobb — en scene kan drive en tråd videre og samtidig ligge på et bestemt punkt på tidslinjen, alt på én gang."
      },
      "story-bible-memory": {
        heading: "Story Bible – historiens hukommelse",
        body: "Story Bible samler informasjon historien trenger å huske, slik at den kan skille mellom hva som faktisk er sant i verdenen og hva som bare var en forbigående detalj.",
        steps: [
          {
            heading: "Hva Story Bible holder",
            body: "Personer, steder, relasjoner, grupper, gjenstander, hendelser, og regler og begreper i verdenen — alt senere kapitler trenger å forbli konsekvente med."
          },
          {
            heading: "Fra manustekst til mulige fakta",
            body: "Anta at manuset sier: ”Nora gikk opp trappen til fyrtårnet. Hun hadde ikke vært der siden faren forsvant for tjue år siden.” kaampi Write kan identifisere mulige fakta fra det: ”Nora har en far.” ”Noras far forsvant for tjue år siden.” ”Nora har vært ved fyrtårnet tidligere.”"
          },
          {
            heading: "Du bestemmer hva som blir etablert",
            body: "Du gjennomgår forslagene. Først når du bestemmer at noe skal låses, blir det etablert informasjon kaampi Write kan forholde seg til — et forslag som ligger ugjennomgått endrer ennå ingenting."
          }
        ]
      },
      "what-is-canon": {
        heading: "Hva betyr kanon?",
        body: "Kanon er det du har bestemt skal regnes som sant i historien. Ikke all tekst trenger å bli kanon — det meste skal det ikke.",
        steps: [
          {
            heading: "En detalj trenger ikke lagres bare fordi den ble skrevet",
            body: "Hvis AI skriver: ”Nora dro det røde skjerfet tettere rundt halsen,” trenger du ikke lagre fargen på skjerfet bare fordi den tilfeldigvis dukket opp i teksten."
          },
          {
            heading: "Med mindre det senere blir viktig",
            body: "Blir skjerfet senere viktig — si at det dukker opp igjen i kapittel 20 — kan informasjonen være verdt å låse på det punktet."
          }
        ],
        tip: "Story Bible skal huske det som trenger å være konsekvent. Den trenger ikke bli en database over hver detalj i hver setning."
      },
      "aliases-and-exclusions": {
        heading: "Alias og unntaksfraser",
        body: "En karakter, et sted eller en gjenstand dukker ikke alltid opp i teksten under kortets eget navn — to verktøy håndterer de to måtene det kan gå galt.",
        steps: [
          {
            heading: "Alias fanger andre navn på samme ting",
            body: "Åpne et Story Bible-kort, og du kan gi det alias — kallenavn, titler, alter egoer — slik at en omtale under noen av dem fortsatt telles. En karakter som heter ”Emma” på kortet sitt, men kalles ”Em” gjennom hele manuset, gjenkjennes uansett — i Omtaler-sporeren, og i lore-relevansfilteret hvis du bruker et."
          },
          {
            heading: "Unntaksfraser fanger falske treff",
            body: "Det motsatte problemet skjer også: et navn som også er et vanlig ord. En karakter som heter Rose gjør at hver omtale av en rosehage, en rosebusk eller roser på et bord ser ut som en omtale av henne. Unntaksfraser retter opp det — legg til ”rosehage” som et unntak på Roses kort, så slutter nettopp den frasen å telle som en omtale av henne, mens ”Rose smilte” fortsatt gjør det."
          }
        ]
      },
      "merge-story-bible-cards": {
        heading: "Slå sammen Story Bible-kort",
        body: "Noen ganger viser det seg at to Story Bible-kort er samme ting — du opprettet ”Kael” tidlig, og mye senere innser du at ”Kapteinen” som dukket opp nå og da, også er Kael.",
        steps: [
          {
            heading: "Hvordan sammenslåing fungerer",
            body: "”Slå sammen kort…” i Story Bible-panelet håndterer det: velg to eller flere kort av samme slag og slå dem sammen til ett. Ingenting slettes — hver fakta flyttes over til det sammenslåtte kortet; der de to kortene var uenige, velger du hvilken verdi som vinner; hvert gamle navn blir et alias på det sammenslåtte kortet, slik at en senere omtale av begge fortsatt løses riktig."
          },
          {
            heading: "Oppdater manusteksten også",
            body: "Det finnes også et valg for å erstatte de gamle navnene med det nye direkte i manusteksten, hvis du vil at begge navnene skal forsvinne fra prosaen, ikke bare samles på kortet."
          },
          {
            heading: "Sammenslåing fungerer fra gjennomgangskøen også",
            body: "Den samme sammenslåingen fungerer også den andre veien — et ventende forslag fra Hent ut fakta kan slås sammen direkte mot et eksisterende kort i gjennomgangskøen, i stedet for å låses som et nytt kort først og slås sammen etterpå."
          }
        ]
      },
      "edit-vs-update": {
        heading: "Rediger vs. Oppdater en fakta",
        body: "En låst fakta kan endres på to forskjellige måter, og de betyr forskjellige ting — hvilken du velger avgjør om historien har én sann verdi eller to, på ulike tidspunkt.",
        steps: [
          {
            heading: "Rediger retter en feil",
            body: "Fakta var alltid slik, du skrev den bare ned feil. Ingen historikk, intet ”fra og med”-kapittel; den blir ganske enkelt korrekt."
          },
          {
            heading: "Oppdater registrerer en reell endring",
            body: "Fakta var sann, og fra et visst kapittel endres den til noe annet. ”Noras hår var svart” (etablert i kapittel 1), ”Noras hår er nå grått” (Oppdater, forankret til kapittel 14, etter hendelsene som eldet henne). Den tidligere verdien forblir synlig i Historikk i stedet for å bli overskrevet, siden begge var sanne — bare på forskjellige punkter i historien."
          },
          {
            heading: "Identitetsfakta tar bare Rediger",
            body: "Fakta som navn eller art får bare Rediger — det er sjelden en historiegrunn til at noens navn skal endres midt i boken på samme måte som hårfarge eller bosted kan gjøre."
          }
        ]
      },
      "interview-world": {
        heading: "Intervju verdenen",
        body: "Story Bible trenger ikke bare brukes til å lagre det du allerede vet. Du kan også bruke Intervju verdenen for å oppdage mer — utforske en karakter gjennom samtale i stedet for å fylle ut lange skjemaer.",
        steps: [
          {
            heading: "Ta utgangspunkt i det du allerede vet",
            body: "Anta at du vet: ”Nora Berg. 38 år. Journalist. Vokste opp på øya. Faren forsvant da hun var atten.”"
          },
          {
            heading: "Spør karakteren direkte",
            body: "”Hvorfor ble du journalist?” ”Hva husker du fra dagen faren din forsvant?” ”Hvem stoler du minst på?” ”Hva ville du aldri innrømme for Elias?” ”Hva er du mest redd for å oppdage?”"
          }
        ],
        tip: "Intervjuet kan hjelpe deg å finne personlighet, motiv, bakgrunn, relasjoner og konflikter — ofte raskere enn å bestemme alt det på forhånd."
      },
      "interview-sandbox": {
        heading: "Intervjuet er en sandkasse",
        body: "Dette er svært viktig: det som sies under intervjuet påvirker ikke hvordan boken skrives. AI får dikte opp og eksperimentere under samtalen.",
        steps: [
          {
            heading: "Et svar i intervjuet er ikke automatisk sant",
            body: "Anta at Nora sier: ”Faren min pleide å ta meg med til fyrtårnet da jeg var liten.” Det betyr ikke at kaampi Write heretter kan bruke dette som etablert informasjon når et kapittel skrives. Du må først velge å gjøre informasjonen til et faktum."
          },
          {
            heading: "Veien fra en linje i intervjuet til kanon",
            body: "Intervju → AI sier noe interessant → Trekk ut fakta → Gjennomgå → Lås fakta → Story Bible → nå kan informasjonen påvirke fremtidig AI-skriving."
          }
        ],
        tip: "Intervju ≠ kanon. Låste fakta = kanon. Det gjør at du kan stille ville spørsmål og prøve idéer uten å risikere at de begynner å påvirke historien."
      },
      "interview-to-story": {
        heading: "Fra intervju til historie",
        body: "En idé fra intervjuet blir ikke en del av historien før du låser den — og når du gjør det, er det verdt å forstå nøyaktig når den begynner å gjelde i manuset.",
        steps: [
          {
            heading: "Fra en interessant linje til et mulig faktum",
            body: "Under intervjuet sier Nora kanskje: ”Moren min løy alltid om hva som skjedde med pappa. Jeg lærte tidlig at voksne forteller den versjonen av sannheten som passer dem.” Du synes idéen er interessant. Etter intervjuet kan kaampi Write hjelpe deg å identifisere mulige fakta: ”Noras mor holdt tilbake informasjon om farens forsvinning.”"
          },
          {
            heading: "Lås den, eller la den bli stående som utforskning",
            body: "Lås faktumet og det blir en etablert del av Story Bible. Ikke lås det, og det forblir bare noe som ble utforsket under intervjuet — det skal ikke behandles som etablert informasjon når boken skrives."
          },
          {
            heading: "Et faktum kan gjelde fra kapittelets første side, selv om det blir sant senere",
            body: "Et faktum som låses til et kapittel gjelder fra kapittelets første side. Draft kan altså bruke faktumet allerede der — selv om det egentlig først blir sant senere i kapittelet. Eksempel: hovedpersonen møter en gammel venn, Marcus, i kapittel 6. Kapittelet åpner som en vanlig gjenforening. Først et stykke ut innser hovedpersonen at Marcus i hemmelighet har arbeidet mot ham hele tiden — Marcus er antagonisten. Plukker du ut «Marcus er antagonisten» fra Intervjuet og låser det til kapittel 6, har Draft tilgang til avsløringen allerede når den innledende gjenforeningen skal skrives som om ingen ennå vet hva Marcus egentlig driver med."
          },
          {
            heading: "Lås faktumet til en bestemt scene i stedet",
            body: "Skal faktumet først bli tilgjengelig når avsløringen skjer, kan du koble det til scenen der det skjer. Del først kapittel 6 i scener (Scener → Del i to…) på punktet der avsløringen skjer, slik at gjenforeningen og avsløringen blir egne scener. Når du deretter plukker ut faktumet fra Intervjuet, viser velgeren «Fra og med» kapittelets scener — velg avsløringens scene i stedet for «Hele kapittelet». Nå får Draft tilgang til faktumet først fra og med den scenen."
          },
          {
            heading: "Dette fungerer bare ved scenevis Draft",
            body: "Scenekoblingen påvirker bare Draft når du skriver én scene om gangen (Scener → Draft). Kjører du Draft for hele kapittelet i ett strekk, får Draft tilgang til alle fakta som hører til kapittelet, uansett hvilken scene de er koblet til. Foretrekker du å skrive hele kapitler i ett strekk, gjelder derfor den enklere løsningen fortsatt: vent med å låse faktumet til du har skrevet forbi vendepunktet, eller skriv kapittelet i to omganger og lås faktumet først før den andre omgangen."
          }
        ]
      },
      "brainstorm-vs-interview": {
        heading: "Brainstorm og intervju",
        body: "De er to ulike måter å utforske historien på, og ingen av dem trenger automatisk å forandre den — begge er steder der du får lov til å tenke.",
        steps: [
          {
            heading: "Brainstorm ser utenfra",
            body: "”Tenk om Noras mor vet mer om forsvinningen?” — et spørsmål om historien, stilt utenfra."
          },
          {
            heading: "Intervju ser innenfra",
            body: "”Nora, tror du moren din vet hva som skjedde med faren din?” — samme type spørsmål, men stilt direkte til karakteren, i hennes egen stemme."
          }
        ]
      },
      "three-levels-of-information": {
        heading: "Tre nivåer av informasjon",
        body: "En nyttig mental modell for hvor usikker eller fastsatt en bit historieinformasjon er, på et gitt tidspunkt.",
        steps: [
          {
            heading: "Utforsk",
            body: "Brainstorm og intervjuer. ”Tenk om…?” Her får idéene være usikre."
          },
          {
            heading: "Planlegg",
            body: "Synopsis, briefer, Scener og Tråder. ”Dette tenker jeg skal skje.” Her former du historien."
          },
          {
            heading: "Etabler",
            body: "Låste fakta i Story Bible. ”Dette er sant i historiens verden.” Her finnes informasjon kaampi Write kan forholde seg til når historien skrives."
          }
        ]
      },
      "extract-facts": {
        heading: "Trekk ut fakta fra manuset",
        body: "Du trenger ikke fylle Story Bible manuelt mens du skriver. Når et kapittel inneholder informasjon som er verdt å huske, kan kaampi Write hjelpe deg å trekke ut mulige fakta direkte fra prosaen.",
        steps: [
          {
            heading: "Arbeidsflyten",
            body: "Kapittel → Trekk ut fakta → Forslag → Gjennomgå → Godkjenn og lås → Story Bible."
          }
        ],
        tip: "AI foreslår. Du bestemmer — ingenting legges til i Story Bible uten din godkjenning."
      },
      "moving-from-other-tool": {
        heading: "Flytte fra et annet skriveverktøy",
        body: "Har du allerede jobbet med historien et annet sted, trenger du ikke begynne på nytt.",
        steps: [
          {
            heading: "Hva du kanskje allerede har",
            body: "Et manus, karakterbeskrivelser, steder, verdensbygging, lore, organisasjoner, gjenstander, historikk, regler for verdenen — alt som er bygget opp i et annet verktøy før du kom hit."
          },
          {
            heading: "kaampi Write kan hjelpe deg å ta det med",
            body: "Kapitlene som følger går gjennom de spesifikke verktøyene for det: importere et manus, importere lore, og begynne ut fra materiale du allerede har."
          }
        ]
      },
      "import-lore": {
        heading: "Importer lore",
        body: "Åpne: Story Bible → Importer lore.",
        steps: [
          {
            heading: "Lim inn eksisterende materiale",
            body: "Lim inn en artikkel eller tekst fra ditt eksisterende materiale. Det kan for eksempel være: ”Fyrtårnet ble bygget i 1892 på øyas nordspiss. Tårnet har vært ubemannet siden 1987. Lokalbefolkningen unngår stedet etter mørkets frembrudd.”"
          },
          {
            heading: "AI leser og foreslår fakta",
            body: "kaampi Writes lokale AI leser teksten og foreslår fakta. Du gjennomgår deretter forslagene, akkurat som med Trekk ut fakta."
          },
          {
            heading: "Bare de godkjente faktaene føres videre",
            body: "Originalteksten lagres ikke som en del av boken. Det er faktaene du velger å godkjenne som føres videre til Story Bible."
          }
        ],
        tip: "Dagens lore-import jobber med én artikkel eller tekst om gangen."
      },
      "lore-relevance-filter": {
        heading: "Hold en stor importert Story Bible relevant",
        body: "To typer Story Bible-fakta oppfører seg forskjellig når det gjelder hva Draft faktisk trenger å se.",
        steps: [
          {
            heading: "Manusfakta tas alltid med",
            body: "Fakta som manuset selv har etablert — skrevet i et kapittel, eller godkjent fra et intervju — tas alltid med i Skriv utkast. De er historiens eget minne, og det finnes ingen trygg måte å utelate dem på."
          },
          {
            heading: "Importert lore er annerledes",
            body: "Importert lore (Importer lore) er bakgrunnsinformasjon, bare nyttig når kapittelet som skrives faktisk handler om det. Med en stor importert verden kan det svelle prompten kraftig å ta med hver eneste slik fakta i hvert Skriv utkast-kall — og begrave den håndfullen som faktisk er relevant for akkurat det kapittelet."
          },
          {
            heading: "Relevansfilteret",
            body: "Innstillinger → Vis bare relevant lore for Skriv utkast (avslått som standard) endrer det: en importert lore-fakta tas bare med hvis dens eget navn nevnes i kapittelet, eller — for en Hendelse, som et historisk slag eller en sponsoravtale — hvis en deltaker eller stedet nevnes i stedet, selv om selve hendelsen aldri nevnes ved navn."
          },
          {
            heading: "Fest en fakta filteret gjetter feil på",
            body: "Hvis filteret noen gang gjetter feil på en bestemt fakta, fest den: den samme syklus-knappen i Story Bible som allerede brukes til å overstyre en fakta sin posisjon i story-tiden, betyr nå også «ta alltid med denne, uansett»."
          }
        ]
      },
      "already-have-manuscript": {
        heading: "Du har allerede et manus",
        body: "Har du allerede skrevet deler av eller hele historien, trenger du ikke begynne med Brainstorm eller en fortellermetode. Begynn med teksten du har.",
        steps: [
          {
            heading: "En mulig arbeidsflyt",
            body: "Eksisterende manus → Kapitler → Trekk ut fakta → Story Bible → Analyser og bearbeid → Fortsett å skrive."
          }
        ],
        tip: "Brainstorm, Synopsis og fortellermetoder er hjelpemidler. De er ikke obligatoriske steg."
      },
      "write-with-ai": {
        heading: "Skriv sammen med AI",
        body: "AI trenger ikke skrive hele kapitler. Velg det minste verktøyet som faktisk løser problemet du har akkurat nå — de tre måtene nedenfor dekker et tomt kapittel, et kapittel som allerede er i gang, og en enkelt manglende hendelse.",
        steps: [
          {
            heading: "Begynn med Draft",
            body: "Et nytt kapittel åpnes tomt, med bare sin brief over siden. Trykk Draft, så skriver modellen hele kapittelet ut fra synopsis, Story Bible, briefen, kameraet, Reader og prosaspråket — alt som allerede er etablert, ingenting du må gjenta for hånd. Samme knapp fortsetter å fungere når kapittelet allerede har noe prosa: den fyller inn det som mangler og fortsetter der teksten slutter, i stedet for å begynne på nytt.",
            image: { src: "/handbook/write-with-ai/draft-empty-chapter.png", alt: "Et tomt kapittel med Draft-knappen markert i verktøylinjen under siden" }
          },
          {
            heading: "Marker en passasje for Extend, Elaborate eller Rewrite",
            body: "Marker en hvilken som helst del av teksten og høyreklikk: Extend fortsetter der markeringen slutter, Elaborate utdyper selve passasjen uten å drive historien videre, og Rewrite… åpner et felt for din egen instruksjon — for eksempel «gjør dialogen mer ubehagelig uten at personene sier rett ut hva de er sinte for». Bare den markerte teksten endres; resten av kapittelet forblir nøyaktig som det var.",
            image: { src: "/handbook/write-with-ai/selection-menu.png", alt: "En markert setning med høyreklikkmenyen åpen, som viser Extend, Elaborate, Rewrite… og mer" }
          },
          {
            heading: "Skriv en beat, uten å markere noe",
            body: "Høyreklikk uten å markere noe, og menyen krymper til ett enkelt par alternativer. Write a beat… beskriver hva som skjer videre i én linje — «Nora hører steg i trappen og gjemmer brevet før døren åpnes» — og modellen skriver bare det: et kort avsnitt, ikke resten av scenen, satt inn nøyaktig ved markøren.",
            image: { src: "/handbook/write-with-ai/beat-menu.png", alt: "Markøren plassert midt i et avsnitt med høyreklikkmenyen åpen, som viser Write a beat… og Drop a placeholder…" }
          }
        ],
        tip: "Prøv dette: hvis et kapittel stopper opp midt i en scene, bruk Write a beat før Draft eller Extend — å navngi den neste lille tingen som skjer er ofte enklere enn å be modellen fortsette på egen hånd, og det holder deg, ikke modellen, som den som bestemmer hva som skjer videre."
      },
      "attached-context": {
        heading: "Vedlagt kontekst",
        body: "Story Bible holder fakta, men ikke alltid de nøyaktige ordene et sted, en gjenstand eller en karakter først ble beskrevet med — og noen ganger er det nettopp det som teller.",
        steps: [
          {
            heading: "Fest et tidligere kapittel, eller bare en scene",
            body: "Kapittelinnstillinger → Vedlagt kontekst lar et kapittel feste et tidligere kapittel, eller bare en av scenene dets, som ekstra referansemateriale for Skriv utkast og Recast."
          },
          {
            heading: "Faktisk prosa, ikke et sammendrag",
            body: "I motsetning til Story Bible-fakta sendes det som festes som sin faktiske prosa — nyttig når fyrtårnet, for eksempel, trenger å leses nøyaktig som det først ble malt opp i kapittel 2, ikke bare som Story Bible-fakta ”et forlatt fyrtårn på nordspissen”."
          },
          {
            heading: "Å vite hva det koster",
            body: "Et omtrentlig anslag over kostnaden i tokens vises ved siden av det som festes, slik at du ser hva det legger til prompten."
          }
        ]
      },
      "smallest-tool": {
        heading: "Velg det minste verktøyet",
        body: "Skriveverktøyene skalerer nedover like godt som oppover — å matche verktøyet mot størrelsen på det faktiske behovet gir deg mer kontroll enn å generere om store mengder tekst.",
        steps: [
          {
            heading: "Hva \"minst\" faktisk betyr",
            body: "Ikke minst innsats, og ikke enklest å bruke — minst betyr hvor mye eksisterende tekst verktøyet rører ved. Skriv utkast kan fylle eller skrive om et helt kapittel. Skriv en beat slipper inn et kort avsnitt ved markøren og lar alt annet være urørt. Utdyp utvider en enkelt passasje du har markert, uten å drive historien videre rundt den. Jo mindre verktøyet er, desto mindre av din egen prosa blir generert på nytt — og desto mindre må du lese gjennom etterpå for å være sikker på at ingenting uønsket endret seg."
          },
          {
            heading: "Hvordan du avgjør hvilket du trenger",
            body: "Spør deg selv: hvor mye av den eksisterende teksten krever problemet egentlig at du endrer? En manglende beat trenger ett nytt avsnitt, ikke et omskrevet kapittel. En tynn passasje trenger å utvides på stedet, ikke å fortsettes videre. Bruk det minste verktøyet som kan løse det som faktisk ligger foran deg, og gå bare opp til et større — Forleng, Skriv om eller Skriv utkast — når problemet virkelig krever at så mye røres ved."
          },
          {
            heading: "Match verktøyet mot problemet",
            body: "Helt tomt kapittel → Skriv utkast. En mindre hendelse mangler → Skriv en beat. Passasjen er for tynn → Utdyp. Jeg trenger å komme videre → Forleng. Jeg vet hva jeg vil forandre → Skriv om. Jeg vil vite om kapittelet fungerer → Analyser."
          }
        ]
      },
      "ai-not-autopilot": {
        heading: "AI er ikke autopilot",
        body: "kaampi Write er ikke bygget rundt ”Skriv boken min.” Det er bygget rundt en løkke der du beholder kontrollen over hvert steg.",
        steps: [
          {
            heading: "Løkken",
            body: "Du bestemmer retningen. AI hjelper der du vil ha hjelp. Du leser resultatet. Du endrer, beholder eller forkaster det. Historien utvikler seg."
          },
          {
            heading: "Det finnes ingen eneste korrekte mengde AI å bruke",
            body: "Du kan skrive flere kapitler helt uten AI. Du kan bruke AI bare når du sitter fast. Eller lage råutkast som du deretter skriver kraftig om. Alt dette er normale måter å bruke kaampi Write på."
          }
        ]
      },
      darlings: {
        heading: "Darlings — drep dine kjæledyr, behold likene",
        body: "”Kill your darlings” — men en passasje som er feil her er ikke nødvendigvis feil overalt. Klipp den uten å ødelegge den.",
        steps: [
          {
            heading: "Klipp uten å slette",
            body: "Marker passasjen og velg ”Cut to Darlings” i høyreklikk-menyen. Passasjen løftes ut av kapittelet og legges på bokens felles darlings-hylle — ”N darlings kept”. Den finnes fortsatt, søkbar og gjenopprettbar, men er ikke lenger i veien for utkastet."
          },
          {
            heading: "Gjenopprett — eller begrav den for godt",
            body: "Fra hyllen kan du flytte en darling tilbake dit den ble klippet, eller forkaste den for godt når du er sikker. Hver klipping og gjenoppretting får sin egen rad i kapittelets Historikk, så du alltid kan spore hva som flyttet hvor."
          }
        ]
      },
      placeholders: {
        heading: "Plassholdere",
        body: "Et spørsmål midt i skrivingen trenger ikke bryte flyten.",
        steps: [
          {
            heading: "Slipp en notis og fortsett",
            body: "Høyreklikk der spørsmålet dukker opp — ”hva het egentlig etternavnet til denne karakteren?” — og slipp en plassholder-notis, fortsett så å skrive. En liten nål markerer hvor den sitter i teksten; klikk på den når som helst for å lese notisen, redigere den eller merke den som løst."
          },
          {
            heading: "Finne åpne plassholdere senere",
            body: "Et kapittel med en åpen plassholder får en liten prikk i kapittellisten, og et kompakt ”N plassholdere å komme tilbake til”-panel lister opp hver åpne i boken med en direktelenke til kapittelet."
          }
        ],
        tip: "Korrekturlesing sjekker også om noen fortsatt er åpen før den kjøres, i tilfelle en er glemt."
      },
      "pov-tense-voice": {
        heading: "Perspektiv, tid og fortellerstemme",
        body: "En roman vet hvordan den skal fortelles. kaampi Write kan vite det sammen med den.",
        steps: [
          {
            heading: "Bokens fortellerkonvensjon",
            body: "Velg på boknivå hvordan historien skal høres ut: perspektiv (første, andre eller tredje person), tid (datid eller nåtid), synsvinkel (hvem som ser og vet) og fortellerstemme (tonen og avstanden som bærer hele verket). Innstillingene gjelder hele boken — korrekturlesingen bruker dem, og AI-en holder seg til dem når den foreslår tekst."
          },
          {
            heading: "Kapitler som bryter mønsteret — med vilje",
            body: "En prolog i jeg-form i en roman som ellers er i tredje person. Et sluttkapittel som hopper til nåtid i en bok som ellers er fortalt i datid. Sett avviket på det enkelte kapittelet, og resten av boken merker ingenting: hovedinnstillingene gjelder fortsatt alle andre kapitler som vanlig."
          },
          {
            heading: "Perspektivbytte er mer enn pronomen",
            body: "Å flytte en roman fra «hun» til «jeg» handler ikke om søk-og-erstatt — det handler om hvem som får vite hva, hvilke tanker som vises, og hvor skyggene faller. kaampi Write holder styr på konvensjonene, men etter en større omskriving til et nytt perspektiv bør du alltid lese resultatet nøye — spesielt hvis AI-en har gjort grovarbeidet."
          }
        ]
      },
      reader: {
        heading: "Leser",
        body: "Si hvem historien er for, så skriver AI-en mot den leseren — ikke mot en gjennomsnittsperson.",
        steps: [
          {
            heading: "En målgruppe forandrer prosaen",
            body: "En ungdomsroman i jeg-form tåler korte, rappe setninger og en rett tone. En psykologisk thriller for voksne bærer lengre, tyngre replikker. Når du angir historiens leser, bruker AI-en det som veiledning — ordvalg, setningsbygning, tone — når den skriver sammen med deg, og lar det som ikke passer den leseren, ligge."
          },
          {
            heading: "Skrivestøtte, ikke en aldersmerking",
            body: "Dette er støtte for skrivingen, ingen aldersgrense. Leser-innstillingen bestemmer ikke hvilken alder den ferdige boken passer for — det avgjør du fortsatt selv, kapittel for kapittel."
          }
        ]
      },
      "author-voice": {
        heading: "Forfatterstemme",
        body: "To forfattere som beskriver samme hendelse, skriver to ulike bøker. Forfatterstemmen er hvordan prosaen din skal føles — og den hjelper AI-en å skrive som deg, ikke som en gjennomsnittsforfatter.",
        steps: [
          {
            heading: "Hva du kan styre",
            body: "Setningslengde og rytme. Hvor mye miljø som får vises før handlingen går videre. Hvor tett dialogen er, hvor mye som blir usagt mellom linjene. Direkte eller tilbakeholdent språk, nakne verb eller blomstrende metaforer. Alt som gjør at en leser kjenner igjen en side uten å se navnet ditt på den."
          },
          {
            heading: "Veiledning, ikke regel",
            body: "Forfatterstemmen styrer hva AI-en sikter mot når den foreslår tekst — den styrer aldri hva du får lov til å skrive. En setning som bryter med din egen stil, er ikke en feil, det er et valg. Din tekst har alltid siste ord."
          }
        ]
      },
      "live-formatting": {
        heading: "Formatering mens du skriver",
        body: "Tre ting skjer automatisk mens du skriver — ingen av dem krever en meny, og én av dem krever en verktøylinje i stedet.",
        steps: [
          {
            heading: "Fet, kursiv, understreket",
            body: "Marker tekst og klikk enten på den flytende verktøylinjen som vises over markeringen, eller bruk Ctrl/Cmd+B, Ctrl/Cmd+I eller Ctrl/Cmd+U. I motsetning til de to andre tingene her er dette et bevisst valg — ingenting du skriver blir fet eller kursiv av seg selv."
          },
          {
            heading: "Scenebrudd",
            body: "Skriv tre eller flere bindestreker — «---» — alene i et eget avsnitt, så gjøres det om til et scenebrudd i stedet for bokstavelige streker så snart du avslutter linjen. Hvilket ornament som vises (en vanlig kort strek, eller en av fire dekorative stiler) stilles inn én gang for hele manuset i Settings → Typography → Scene break."
          },
          {
            heading: "Siterte passasjer",
            body: "Begynn et avsnitt med «> » så gjøres det om til en innrykket blokk med en strek nedover siden — omtrent som et brev eller en melding inni historien kan se ut. Selve «>»-tegnet forsvinner fra visningen; bare teksten vises."
          },
          {
            heading: "Anfangen følger det første avsnittet automatisk",
            body: "Hvis Settings → Typography → Drop cap er satt til noe annet enn Off, får den åpnende bokstaven i det som akkurat nå er kapittelets første avsnitt, den forstørrede behandlingen. Ingenting å skrive — den følger bare hvilket avsnitt som tilfeldigvis er først."
          }
        ],
        tip: "Har du allerede tekst med rette anførselstegn fra et annet sted? Se Smarte anførselstegn (Skriving) — samme type levende konvertering, med et samlet «Smarten quotes in whole manuscript» for alt som er limt inn eller importert før denne oppførselen fantes."
      },
      "smart-quotes": {
        heading: "Smarte anførselstegn",
        body: "Et rett \" du skriver i kapittelredigeringen blir automatisk et ekte åpnende eller lukkende, kurvet anførselstegn, avhengig av hva som kommer rett før — ingenting å tenke på, ingenting å slå på.",
        steps: [
          {
            heading: "Konverter eksisterende tekst",
            body: "Har du allerede tekst med rette anførselstegn — limt inn, eller importert fra et annet sted? Tools → Convert markers → ”Smarten quotes in whole manuscript” konverterer hvert ett som allerede finnes i manuset på samme måte, i ett eneste sveip."
          }
        ]
      },
      "analyze-chapter": {
        heading: "Analyser et kapittel",
        body: "Analyser gjennomgår teksten uten å skrive den om for deg. Hensikten er å hjelpe deg å oppdage ting du selv kanskje vil undersøke nærmere.",
        steps: [
          {
            heading: "Tenk på det som en ekstra leser",
            body: "Ikke: ”Slik skal du skrive.” Men: ”Her er noe du kanskje vil se nærmere på.”"
          },
          {
            heading: "Du bestemmer hva som er relevant",
            body: "Analyser bare peker ut ting — du bestemmer om hvert innspill faktisk er verdt å handle på."
          }
        ]
      },
      polish: {
        heading: "Polish",
        body: "Der Analyser bare peker ut ting, skriver Polish om.",
        steps: [
          {
            heading: "Hva den rydder opp i",
            body: "Den kjører en opprydningsrunde over hele kapittelet — stryker innskutte forklaringer, følelses-navngivning (”hun kjente et støt av anger”), vage påstander, lilla prosa, og strammer opp dialog."
          },
          {
            heading: "Sammenlign før du bestemmer deg",
            body: "Den viser deretter originalen og omskrivningen side om side, med ordnivå-markering, før noe beholdes. Aksepter eller forkast — ingenting rører kapittelet før du sier ifra."
          },
          {
            heading: "Tilpass den til stemmen din",
            body: "Hvis Polishs standardinstinkter ikke matcher stemmen din — kanskje du vil beholde mer følelses-navngivning, ikke mindre — kan du redigere instruksjonene den gir modellen i Settings → Polish, per manus."
          }
        ]
      },
      continuity: {
        heading: "Kontinuitet",
        body: "Jo lengre manuset blir, desto vanskeligere blir det å huske alt. En person kan få ulik øyenfarge. Et sted kan plutselig forandre seg. En karakter kan virke å kjenne til informasjon hen ennå ikke burde kjenne til.",
        steps: [
          {
            heading: "Sammenligne mot det som allerede er etablert",
            body: "Her hjelper Story Bible og historiens kontinuitetsverktøy deg å sammenligne det du skriver med det som allerede er etablert."
          },
          {
            heading: "Hvem vet hva?",
            body: "Kontinuitet handler ikke bare om fysiske detaljer. Det handler også om informasjon. Leseren kjenner kanskje til en hemmelighet. Det betyr ikke at alle karakterene gjør det."
          }
        ],
        tip: "Dette blir spesielt viktig i mysterier, thrillere, flere perspektiver og historier der informasjon avsløres gradvis."
      },
      "ask-manuscript": {
        heading: "Spør manuset",
        body: "Når boken har blitt lang, kan du bruke Spør manuset til å undersøke din egen historie.",
        steps: [
          {
            heading: "Faktaspørsmål om det som allerede er skrevet",
            body: "”Når møter Erik kvinnen på toget for første gang?” ”I hvilke kapitler nevnes fyrtårnet?” ”Hva vet Lena om Eriks far?” ”Når får leseren vite at fotografiet er fra 1932?”"
          },
          {
            heading: "Bredere spørsmål også",
            body: "”Hvilke kapitler handler mest om forholdet mellom Nora og Elias?” eller: ”Hvor nevnes nøkkelen før den blir viktig senere?”"
          }
        ],
        tip: "Svaret er et hjelpemiddel for deg. Det blir ikke automatisk kanon og skal ikke i seg selv forandre kapitlene."
      },
      "ask-about-passage": {
        heading: "Spør om et kapittel eller en passasje",
        body: "Analyser sjekker faste kategorier. Spør manuset svarer på faktaspørsmål om det som allerede er skrevet. Ingen av dem kan svare på noe i stil med: «Bygger dette mot en sterk slutt?» eller «Virker dette argumentet troverdig, eller konstruert?» — Spør om kapittelet / Spør om en passasje er til for akkurat den typen spørsmål.",
        steps: [
          {
            heading: "To måter å bruke det på",
            body: "«Spør om kapittelet…» (ved siden av Analyser) spør om hele kapittelet. Marker en passasje i teksten, velg så «Spør…» fra menyen dens, for å bare spørre om den passasjen, med den omkringliggende teksten som kontekst."
          },
          {
            heading: "Hva slags spørsmål det er til for",
            body: "«Gjør slutten at du vil lese neste kapittel?» «Viser denne scenen for mye, for fort?» Ditt eget spørsmål om håndverket, med et ærlig — og kritisk, hvis du ber om det — svar."
          }
        ],
        tip: "Svaret er bare til å lese. Ingenting endres eller lagres — akkurat som Spør manuset."
      },
      history: {
        heading: "Historikk",
        body: "AI-assistert skriving innebærer ofte eksperimentering. En omskriving blir kanskje bedre. Eller du oppdager at den gamle versjonen faktisk fungerte bedre.",
        steps: [
          {
            heading: "Sammenligne og gå tilbake",
            body: "Når tidligere versjoner er tilgjengelige, kan Historikk hjelpe deg å sammenligne og gå tilbake. Tenk: Prøv → Les → Behold eller gå tilbake."
          }
        ],
        tip: "Du trenger ikke akseptere en endring bare fordi AI laget den."
      },
      proofread: {
        heading: "Korrekturles",
        body: "Korrekturlesing passer senere i prosessen. Tidligere var kanskje spørsmålet: ”Hvordan kan scenen utvikle seg?” Nå blir spørsmålet: ”Er det noe her som trenger å rettes eller sjekkes?”",
        steps: [
          {
            heading: "Jobb fra stort til smått",
            body: "Det er sjelden meningsfullt å pusse på hver setning hvis du fortsatt planlegger å skrive om hele kapitler. Historien → Kontinuiteten → Kapitlene → Developmental analysis → Polish → Korrekturlesingen → Din egen sluttlesing."
          },
          {
            heading: "Sju sjekker i ett sveip",
            body: "Korrekturles kjører sju sjekker over hele manuset samtidig — grammatikk, gjentatte scener, stil- og stemningskonsekvens mellom kapitler, en aldersrapport, kontinuitet, oppsett og betalinger, samt en faktasjekk mot Story Bible."
          },
          {
            heading: "En påminnelse før den starter",
            body: "Den varsler først hvis det finnes en åpen plassholder-notis som fortsatt venter, i tilfelle den er glemt underveis."
          }
        ],
        tip: "AI kan finne ting. Forfatteren avgjør hva som fungerer."
      },
      "developmental-analysis": {
        heading: "Developmental analysis",
        body: "Korrekturles leser linje for linje. Developmental analysis leser hele bokens form i stedet: stiger spenningen virkelig etter hvert som historien går videre, synker midten sammen, hvilke Tråder blir faktisk betalt av og hvilke stilner i ti kapitler.",
        steps: [
          {
            heading: "Tre trinn, aldri hele boken på én gang",
            body: "Den jobber i tre trinn — scene for scene, så kapittel for kapittel, så en avsluttende rapport — aldri hele manuset i ett sveip, slik at den forblir håndterbar selv for en lang bok."
          },
          {
            heading: "Grunnet i Tråder og Tidslinje, men ikke avhengig av dem",
            body: "En manuelt startet kjøring, ikke noe som skjer automatisk. Den grunner seg i hvilke Tråd-tagger og Timeline-posisjoner manuset allerede har, men fungerer også uten — bare en grovere lesning, og den sier det før den starter."
          },
          {
            heading: "Hva du faktisk ser",
            body: "Det eneste du noensinne ser, er sluttrapporten: et sammendrag i løpende tekst, pluss en klikkbar liste over spesifikke kapitler verdt et blikk. Scene-for-scene- og kapittel-for-kapittel-lesningene under forblir intern arbeidsdata — samme ”aldri rådata, alltid syntetisert”-prinsipp som overalt ellers der AI gjennomgår skrivingen din."
          }
        ]
      },
      "images-illustrations": {
        heading: "Bilder og illustrasjoner",
        body: "kaampi Write kan hjelpe deg å jobbe med bilder på to ulike måter.",
        steps: [
          {
            heading: "Egne bilder",
            body: "Du kan legge til bilder i historien. Nyttig for illustrerte historier, barnebøker eller prosjekter der bilder er en del av leseopplevelsen."
          },
          {
            heading: "Illustrasjonsprompter",
            body: "Du kan også bruke tekst fra historien som grunnlag for en bildebeskrivelse. Eksempel — manus: ”Erik sto alene på perrongen. Tåken lå tett over sporene, og stasjonsklokken hadde stoppet på 03:17.” kaampi Write kan hjelpe deg å gjøre om passasjen til en illustrasjonsprompt basert på motivet og prosjektets valgte visuelle stil. Selve historieteksten endres ikke."
          }
        ]
      },
      typography: {
        heading: "Typografi",
        body: "Settings → Typography former hvordan prosaen faktisk ser ut, live i redigeringen og med i hver Publish-eksport — slik at det du ser mens du skriver, er det leseren får.",
        steps: [
          {
            heading: "Skrifttype og vekt",
            body: "Font — et valg mellom tretten skrifttyper, serif og sans serif, hver vist i sin egen skrift slik at du kan skille dem fra hverandre før du velger. Weight — Regular eller Bold, for prosa som ligger tyngre på siden."
          },
          {
            heading: "Farge",
            body: "Én nyanse for mørkt tema, én for lyst, slik at den forblir lesbar og bevisst i begge."
          },
          {
            heading: "Drop cap og scenebrudd",
            body: "Drop cap — av, eller 2–5 linjer, for kapittelets åpnende bokstav. Scene break — den vanlige korte linjen, eller ett av fire navngitte ornament (en klassisk bokvignett, en minimalistisk diamant, fransk eleganse eller en glitrende stjerne) for et `---`-avsnitt."
          }
        ],
        tip: "Ingenting av dette er påkrevd. Standardverdiene er et rimelig utgangspunkt; Typography finnes for når sidens utseende begynner å bety like mye som ordene på den."
      },
      "language-versions": {
        heading: "Språkversjoner av et manus",
        body: "Et ferdig — eller fortsatt voksende — manus kan spinne av en separat, lenket utgave på et annet språk.",
        steps: [
          {
            heading: "Start en språkversjon",
            body: "Fra språkbryteren ved siden av manustittelen (”New language version…”). Kapitlene opprettes tomme på forhånd, hvert lenket til sin motpart i kilden."
          },
          {
            heading: "Å oversette et kapittel",
            body: "Oversett hvert av dem fra kapittelredigeringen (”Translate chapter”) — den tar med seg kildekapittelets prosa sammen med manusets Story Bible og Stemme, slik at navn og termer forblir konsekvente gjennom hele oversettelsen, ikke bare innad i den."
          },
          {
            heading: "Når kildekapittelet endres senere",
            body: "Det oversatte kapittelet flagger det (”Source changed since this was translated”), med en diff på samme språk som viser nøyaktig hva som endret seg, og en ”Re-translate chapter”-handling. Manushyllen grupperer et kildemanus sammen med språkversjonene sine, i stedet for å liste dem som urelaterte bøker."
          }
        ],
        tip: "Settings → AI settings har et tredje modellvalg for dette, Translate, ved siden av Writing og Review."
      },
      publish: {
        heading: "Publiser",
        body: "Når historien er klar til å forlate arbeidsflaten, bruker du Publiser.",
        steps: [
          {
            heading: "Verksted kontra ferdig kopi",
            body: "kaampi Write-prosjektet er verkstedet ditt. Publiseringen er det leseren får. Brainstorm, arbeidsnotater og annen planlegging trenger derfor ikke bli med i den publiserte historien."
          },
          {
            heading: "Å velge en avsnittsstil",
            body: "Paragraph style tilbyr to konvensjoner: den vante tomme linjen mellom avsnitt, eller en innrykket stil uten tom linje i klassisk bokstil, med kapittelets åpnende avsnitt satt uten innrykk, som i trykk."
          }
        ],
        tip: "Velg formatet som passer hvordan teksten skal brukes, og jobb videre med resultatet der det trengs."
      },
      backup: {
        heading: "Sikkerhetskopi",
        body: "Publisering og sikkerhetskopiering er ikke det samme.",
        steps: [
          {
            heading: "En publisert bok kontra en sikkerhetskopi",
            body: "En publisert bok er for leseren. En kaampi Write-sikkerhetskopi er for å kunne gjenopprette selve prosjektet. Den kan derfor inneholde informasjon som ikke finnes i den publiserte versjonen."
          },
          {
            heading: "Importer sikkerhetskopi er ikke manusimport",
            body: "Importer sikkerhetskopi brukes til kaampi Writes egne sikkerhetskopier. Det er ikke det samme som å importere et manus eller lore fra et annet skriveprogram."
          },
          {
            heading: "Export for other apps",
            body: "En tredje, annerledes ting — verken en sikkerhetskopi eller en lesekopi. Den skriver et øyeblikksbilde i et delt format for et søskenprogram (som kaampi Comic) å importere: låste, synlige Story Bible-fakta og kapitler, gruppert etter type. Ulåste, flaggede eller skjult-for-AI-fakta er aldri med — samme synlighetsregel som Skriv utkast selv følger."
          }
        ],
        tip: "Lagre sikkerhetskopier jevnlig, spesielt før større endringer."
      },
      "network-ai-server": {
        heading: "En AI-server på en annen datamaskin i nettverket",
        body: "Har du en kraftig datamaskin eller server på samme nettverk, og vil skrive i kaampi Write fra en annen maskin — en bærbar, for eksempel? Det går, men krever innstillinger tre steder: i kaampi Write, på servermaskinen, og i brannmuren dens.",
        steps: [
          {
            heading: "Velg motoren som matcher det som kjører der",
            body: "Åpne Innstillinger → Modeller. Uansett om den andre maskinen kjører Ollama eller LM Studio, velg samme motor her — begge har nå et felt for serveradresse."
          },
          {
            heading: "Skriv inn den andre datamaskinens nettverksadresse",
            body: "I feltet Serveradresse: http://[den andre maskinens nettverks-IP]:[port] — for eksempel http://192.168.1.50:11434 for Ollama, eller http://192.168.1.50:1234 for LM Studio. La stå tomt for å bruke denne maskinens egen standard i stedet. Ikke legg til /v1 på slutten, kaampi Write gjør det selv. Finn den andre maskinens nettverksadresse med ipconfig (Windows) eller ifconfig/ip addr (Mac/Linux) på nettopp den maskinen."
          },
          {
            heading: "La serveren lytte på nettverket, ikke bare seg selv",
            body: "Kjører den andre maskinen Ollama: start den med miljøvariabelen OLLAMA_HOST=0.0.0.0 slik at den lytter bredt, og OLLAMA_ORIGINS satt til adressen kaampi Write faktisk kjører fra (eller OLLAMA_ORIGINS=* for å tillate hvilken som helst adresse) — ellers avviser den nettleserens forespørsel selv om selve forbindelsen fungerer. Kjører den LM Studio: fanen Developer → Server-innstillingene → slå på «Serve on Local Network» og «Enable CORS»."
          },
          {
            heading: "Brannmuren på servermaskinen",
            body: "Den må tillate innkommende forbindelser på porten (11434 for Ollama, vanligvis 1234 for LM Studio) fra resten av nettverket — ellers slipper forespørselen aldri gjennom, selv om alt ovenfor er riktig satt opp."
          }
        ],
        tip: "Hver datamaskin har for øvrig sitt eget bibliotek med manuskripter — bare AI-tilkoblingen deles, ikke det du har skrevet. Vil du fortsette på samme bok fra begge maskinene, bruk Sikkerhetskopi/Gjenopprett for å flytte den."
      },
      "ai-writing-wrong-things": {
        heading: "Hvis AI begynner å skrive feil ting",
        body: "Tenk først på hvilken informasjon modellen faktisk har fått.",
        steps: [
          {
            heading: "Kapittelbriefen er utdatert",
            body: "Sjekk om briefen fortsatt beskriver kapittelet du vil skrive."
          },
          {
            heading: "Synopsis har ikke fulgt med historiens utvikling",
            body: "Historien har kanskje endret seg siden du planla den."
          },
          {
            heading: "Idéen finnes bare i Brainstorm, eller kommer bare fra et intervju",
            body: "Brainstorm er et utforskende område. En idé der skal ikke automatisk behandles som en del av historien. Samme prinsipp gjelder et intervju — det som ble sagt påvirker ikke hvordan boken skrives, med mindre du har valgt å låse informasjonen som et faktum."
          },
          {
            heading: "Viktig informasjon mangler i Story Bible",
            body: "Hvis noe må være konsekvent, kan det trenge å bli etablert og låst som et faktum."
          },
          {
            heading: "Instruksjonen din er for bred",
            body: "I stedet for: ”Skriv om scenen så den blir bedre,” prøv: ”Gjør dialogen mellom Nora og Elias mer tilbakeholden. De mistenker hverandre, men ingen vil vise det ennå.”"
          }
        ],
        tip: "Jo tydeligere problemet er, desto lettere blir det å velge riktig verktøy."
      },
      "marker-conversion-no-match": {
        heading: "«Convert markers to formatting» finner ingen markeringer",
        body: "To ulike årsaker, avhengig av hva du prøver å konvertere.",
        steps: [
          {
            heading: "Hvis dette gjelder anførselstegn spesifikt",
            body: "Du trenger nok ikke Convert markers til det lenger. Se Smarte anførselstegn (Skriving) — et rett \" blir allerede kurvet mens du skriver, og «Smarten quotes in whole manuscript» konverterer et helt importert eller innlimt manus i ett sveip, rette anførselstegn inkludert."
          },
          {
            heading: "For alt annet Convert markers håndterer",
            body: "*Stjerner* for kursiv, egne par du har satt opp — «ingenting funnet» betyr som regel at tegnet du skrev inn i feltet ikke er nøyaktig samme tegn som i manuskriptet. Lett å oppleve med tegnsetting som finnes i mer enn én lik-ut-seende form."
          },
          {
            heading: "Den sikreste løsningen",
            body: "Åpne kapittelet, marker ett av de faktiske tegnene i teksten din, kopier det (Ctrl/Cmd+C), og lim det inn i feltet for åpnings- eller avslutningstegn i stedet for å skrive det på tastaturet på nytt. Da er det garantert nøyaktig riktig tegn."
          }
        ]
      },
      "routine-short-often": {
        heading: "Skriv litt, men ofte",
        body: "Det vanskeligste med å skrive er noen ganger å komme i gang. Små endringer i rutinen kan utgjøre en stor forskjell — dette kapittelet og de fire etter gir fem tips som hjelper deg å skape gode vaner, finne fokus og komme videre når du kjører deg fast.",
        steps: [
          {
            heading: "Korte økter kan slå å vente på det perfekte tidspunktet",
            body: "Du trenger ikke flere ledige timer for å få skrevet noe. Korte, regelmessige skriveøkter kan være mer effektive enn å vente på det perfekte tidspunktet."
          }
        ],
        tip: "Prøv selv: Sett av 15–30 minutter noen dager i uken. Fokuser på å skrive, ikke på hvor mye du rekker å produsere."
      },
      "routine-draft-then-edit": {
        heading: "Skriv først, rediger senere",
        body: "Det er vanskelig å være kreativ og kritisk samtidig. Stopper du stadig for å rette formuleringer, risikerer du å miste både fokus og historiens retning.",
        steps: [
          {
            heading: "La det første utkastet være et utkast",
            body: "Du kan forbedre språket senere — det første gjennomtrekket trenger bare å få ned historien."
          }
        ],
        tip: "Prøv selv: Skriv en scene uten å gå tilbake og endre. Les gjennom og rediger først når scenen er ferdig."
      },
      "routine-set-time-place": {
        heading: "Bestem når og hvor du skal skrive",
        body: "Det er lett å utsette noe som ikke har et bestemt tidspunkt. En konkret plan gjør det enklere å faktisk sette seg ned og skrive.",
        steps: [
          {
            heading: "Bytt hensikt mot en plan",
            body: "Bytt ut «Jeg skal prøve å skrive mer» med «Lørdag etter frokost skriver jeg i 30 minutter»."
          }
        ],
        tip: "Prøv selv: Velg et tidspunkt og et sted som passer i hverdagen din. Koble gjerne skrivingen til noe du allerede gjør regelmessig."
      },
      "routine-pause-when-stuck": {
        heading: "Ta en pause når du kjører deg fast",
        body: "Noen ganger hjelper det ikke å stirre lenger på samme setning eller scene. Å gjøre noe annet en stund kan gi deg et nytt perspektiv.",
        steps: [
          {
            heading: "Gå bort med hensikt",
            body: "Ta en spasertur, vask opp, eller gjør noe som ikke krever all oppmerksomheten din. Når du kommer tilbake, kan problemet føles lettere å løse."
          }
        ],
        tip: "Prøv selv: Skriv ned hva du har kjørt deg fast på før du tar pausen. Da blir det enklere å fortsette når du kommer tilbake."
      },
      "routine-read-widely": {
        heading: "Les for å utvikle skrivingen din",
        body: "Ved å lese ulike forfattere og sjangre får du en bedre følelse for språk, dialog, tempo og fortellerstruktur.",
        steps: [
          {
            heading: "Du trenger ikke analysere hver bok",
            body: "Men noen ganger kan det være verdifullt å tenke over hvorfor en scene fungerer spesielt godt."
          }
        ],
        tip: "Prøv selv: Neste gang en bok fanger deg, stopp opp og spør deg selv: Hva gjorde forfatteren for å vekke interessen min?"
      },
      "opening-raise-a-question": {
        heading: "Vekk et spørsmål hos leseren",
        body: "De første sidene hjelper leseren å avgjøre om historien er verdt å fortsette med — dette kapittelet og de tre etter går gjennom fire måter å skape en åpning som vekker nysgjerrighet.",
        steps: [
          {
            heading: "En god åpning trenger ikke dramatikk",
            body: "Men noe bør vekke leserens interesse. Det kan være en uventet hendelse, en merkelig oppførsel eller noe som ikke virker å stemme."
          },
          {
            heading: "Å lure er det som holder leseren fast",
            body: "Når leseren begynner å lure på hva som har skjedd, hvorfor det skjer, eller hva som kommer til å skje, er det en grunn til å lese videre."
          }
        ],
        tip: "Spør deg selv: Hvilket spørsmål vil jeg at leseren skal bære med seg etter første side?"
      },
      "opening-wait-on-backstory": {
        heading: "Vent med bakgrunnshistorien",
        body: "Du trenger ikke fortelle alt om hovedpersonen eller verdenen med en gang.",
        steps: [
          {
            heading: "For mye bakgrunn bremser åpningen",
            body: "For mye bakgrunnsinformasjon i starten kan bremse historien før leseren har blitt engasjert."
          },
          {
            heading: "Vis bare det som trengs, for nå",
            body: "Vis i stedet det som trengs for å forstå situasjonen. La resten av informasjonen komme når den blir relevant."
          }
        ],
        tip: "Spør deg selv: Trenger leseren virkelig å vite dette allerede?"
      },
      "opening-let-details-show": {
        heading: "La detaljene fortelle",
        body: "Du trenger ikke alltid beskrive en persons egenskaper rett ut. Ofte blir karakteren mer levende gjennom hva personen gjør, sier eller legger merke til.",
        steps: [
          {
            heading: "Vis egenskapen gjennom en handling",
            body: "I stedet for å skrive at en person er kontrollerende, kan du for eksempel vise hvordan personen retter på gjenstandene på et bord før en vanskelig samtale."
          }
        ],
        tip: "En godt valgt detalj kan si mer enn en lang forklaring. Spør deg selv: Kan jeg vise denne egenskapen gjennom en handling eller detalj?"
      },
      "opening-save-the-surprises": {
        heading: "Spar på overraskelsene",
        body: "Det kan være fristende å åpne med historiens mest dramatiske hendelse for å fange leseren.",
        steps: [
          {
            heading: "Å avsløre for mye for tidlig koster senere",
            body: "Avslører du for mye for tidlig, risikerer senere vendepunkter å miste effekten sin."
          },
          {
            heading: "En prolog eller et tilbakeblikk kan likevel fungere",
            body: "Så lenge det tilfører noe mer enn en forhåndsvisning av det som skal skje."
          }
        ],
        tip: "Spør deg selv: Vekker åpningen min nysgjerrighet, eller avslører den noe som hadde vært mer spennende å oppdage senere?"
      },
      "voice-overexplaining": {
        heading: "Gi teksten din en personlig stemme",
        body: "AI-verktøy kan hjelpe deg å skrive og bearbeide tekst. Men resultatet må fortsatt føles som din historie. Når du bruker Draft, Recast eller Polish, kan det være lurt å se over noen tilbakevendende mønstre — dette kapittelet og de tre etter går gjennom fire av dem.",
        steps: [
          {
            heading: "Forklarer teksten for mye?",
            body: "Noen ganger sier fortelleren rett ut hva en hendelse betyr eller hva leseren skal føle."
          },
          {
            heading: "La historien tale for seg selv",
            body: "La gjerne handlingen, dialogen og karakterenes valg tale for seg selv. Leseren trenger ikke få alt forklart."
          }
        ]
      },
      "voice-too-predictable": {
        heading: "Er historien for forutsigbar?",
        body: "Hvis hver hendelse leder rett til den neste, kan historien begynne å føles vel tilrettelagt.",
        steps: [
          {
            heading: "Spørsmål verdt å stille",
            body: "Vurder om karakterene har egne mål, om det finnes konflikter ved siden av hovedhandlingen, og om noe kan utvikle seg på en uventet, men troverdig måte."
          }
        ]
      },
      "voice-varied-emotion": {
        heading: "Beskrives følelser på samme måte?",
        body: "En klump i magen, et hjerte som raser eller hender som skjelver kan fungere bra. Men beskrives hver følelse gjennom en kroppslig reaksjon, blir språket lett ensformig.",
        steps: [
          {
            heading: "Varier tilnærmingen",
            body: "Varier mellom handlinger, tanker, dialog, kroppslige reaksjoner og direkte følelsesord."
          }
        ]
      },
      "voice-straight-timeline": {
        heading: "Følger alt en rett tidslinje?",
        body: "En historie må ikke alltid følge hendelsene i akkurat den rekkefølgen de skjer.",
        steps: [
          {
            heading: "Tilbakeblikk og tidshopp kan gi ny betydning",
            body: "Tilbakeblikk, tidshopp og endringer i perspektiv kan noen ganger skape spenning eller gi en hendelse ny betydning."
          },
          {
            heading: "Bruk dem med hensikt",
            body: "Bruk dem når de styrker historien — ikke bare for variasjonens skyld."
          }
        ],
        tip: "Dette er ingen regler for hvordan en historie må skrives. Se dem som spørsmål å stille når du bearbeider teksten din. Det viktigste er at språket, strukturen og fortellerstilen passer akkurat din historie."
      },
      "writing-tips-sources": {
        heading: "Kilder og videre lesning",
        body: "Tipsene bygger på følgende forskning og litteratur om skrivevaner, kreativitet, språkutvikling og fortellerteknikk.",
        steps: [
          {
            heading: "Skrivevaner og kreativitet",
            body: "Boice, R. (1990). Procrastination, busyness and bingeing. Behaviour Research and Therapy, 27(6), 605–611. Kellogg, R. T. (1996). A model of working memory in writing. Memory & Cognition, 24(3), 318–329. Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503. Sio, U. N. & Ormerod, T. C. (2009). Does incubation enhance problem solving? Psychological Bulletin, 135(1), 94–120. Krashen, S. (2004). The Power of Reading: Insights from the Research. Libraries Unlimited."
          },
          {
            heading: "Fortellerteknikk og AI-generert tekst",
            body: "Ephron, H. The Importance of a Strong Opening Scene. Writer's Digest. StoryScope. Forskning fra University of Maryland og Google DeepMind om tilbakevendende mønstre i AI-generert tekst (arxiv.org/html/2604.03136v6)."
          }
        ],
        tip: "Tipsene er praktiske anbefalinger, ikke absolutte regler. Tilpass dem til din egen skriving."
      }
    }
  },
  scenes: {
    toggleCount: {
      one: "{count} scene",
      other: "{count} scener"
    },
    titlePlaceholder: "Navnløs scene",
    titleLabel: "Tittel for scene {index}",
    briefPlaceholder: "Skrivenotat bare for denne scenen (valgfritt)",
    briefLabel: "Notat for scene {index}",
    mergeWithNext: "Slå sammen med neste ↓",
    splitHere: "Del i to…",
    splitHint: "Velg hvor den nye scenen skal starte:",
    draft: "Lag utkast",
    recast: "Omskriv",
    analyze: "Analyser",
    addScene: "Legg til scene",
    addSceneDisabledHint: "Fullfør denne scenen før du legger til neste"
  },
  publish: {
    title: "Publiser",
    body: "En lesbar kopi av historien. Lar brainstorm ligge. RTF og ODT åpnes i Scrivener. HTML åpnes i en hvilken som helst nettleser. ePub åpnes i en e-bokleser. PDF er klar til utskrift. IDML åpnes i InDesign, for den som vil gjøre bokens egen sidelayout der — én høy side per kapittel, ingen sidelayout allerede valgt for deg.",
    documentName: "Dokumentnavn",
    format: "Format",
    font: "Skrift",
    systemFont: "Standardserif (Times/Georgia)",
    fontSetInSettings: "stilles inn i Settings → Typography",
    paragraphStyle: "Avsnittsformat",
    paragraphStyleSpaced: "Tom linje mellom avsnitt",
    paragraphStyleIndented: "Innrykk, ingen tom linje (klassisk bokstil)",
    action: "Publiser",
    markdown: "Markdown",
    txt: "Ren tekst",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub",
    pdf: "PDF",
    idml: "IDML (InDesign)"
  },
  progress: {
    title: "Fremgang",
    setGoal: "Sett mål",
    editGoal: "Endre mål",
    removeGoal: "Fjern mål",
    saveGoal: "Lagre mål",
    targetWordsLabel: "Måltall ord",
    deadlineLabel: "Sluttdato",
    daysPerWeekLabel: "Skrivedager per uke",
    wordsOfTarget: "{current} av {target} ord",
    percentComplete: "{percent} % dit",
    dailyPaceNeeded: "~{perDay} ord/dag trengs for å rekke det",
    overdue: "Sluttdato passert — {remaining} ord igjen",
    targetReached: "Mål nådd"
  },
  find: {
    action: "Søk/Erstatt",
    title: "Søk og erstatt",
    body: "Treffene markeres i tekstfeltet. Pilene hopper til neste eller forrige. Story Bible blir liggende. Brainstorm blir liggende med mindre du tar den med.",
    find: "Søk",
    replaceWith: "Erstatt med",
    matchCase: "Skill store og små",
    wholeWord: "Hele ord",
    includeBrainstorm: "Ta med brainstorm",
    here: "Denne siden",
    echoes: "Gjentatte ord",
    phrases: "Gjentatte fraser",
    noneEcho: "Ingen gjentatte ord på denne siden.",
    nonePhrases: "Ingen gjentatte fraser på denne siden.",
    none: "Ingenting matcher.",
    hits: { one: "{count} treff", other: "{count} treff" },
    snippetHint: "Linjene under en overskrift er ordet med teksten rundt. Søkevinduet ligger oppå siden, så stedene listes her.",
    moreSnippets: "Og {count} til på dette stedet.",
    fields: {
      title: "Tittel",
      brief: "Brief",
      voice: "Forfatterstemme",
      viewpoint: "Synsvinkel"
    },
    replace: "Erstatt",
    replaceCount: "Erstatt {count}",
    showHit: "Vis {place}",
    untitled: "Uten tittel",
    prev: "Forrige treff",
    next: "Neste treff",
    position: "{current} av {total}"
  },
  proofread: {
    action: "Korrektur",
    title: "Korrektur",
    runningTitle: "Korrektur pågår — et godt tidspunkt for kaffe.",
    lede: "En siste Review-runde over hele manuskriptet. Bare sitater og notater. Ingenting skrives om.",
    grammar: "Grammatikk",
    scenes: "Gjentatte scener",
    style: "Stil og følelse mellom kapitler",
    age: "Aldersrapport",
    continuity: "Kontinuitet",
    setups: "Plantet & innfridd",
    facts: "Faktakontroll",
    grammarProgress: "Grammatikk — {done} av {total} kapitler ferdige",
    scenesProgress: "Leter etter gjentatte scener — {done} av {total} avsnittspar sammenlignet",
    styleProgress: "Stil- og følelseskonsekvens mellom kapitler",
    ageProgress: "Setter sammen aldersrapporten",
    continuityProgress: "Sjekker at ingen er på to steder samtidig",
    setupsProgress: "Leter etter plantede detaljer som ikke er innfridd ennå",
    factsProgress: "Kontrollerer fakta mot Story Bible — {done} av {total} kapitler ferdige",
    now: "Akkurat nå: {detail}",
    nowGrammar: "leser kapittel {n}…",
    nowScenes: "sammenligner kapittel {a} med kapittel {b}…",
    nowStyle: "lytter etter et skifte i register eller følelse…",
    nowAge: "veier prosaen mot Leser…",
    nowContinuity: "sjekker hvem og hva som er hvor, og når…",
    nowSetups: "sjekker hva som er plantet, og hva som er innfridd…",
    nowFacts: "kontrollerer kapittel {n} mot Story Bible…",
    stillWorking: "Jobber fortsatt — et enkelt kapittel kan ta noen minutter på tregere maskinvare. Ingenting har stanset.",
    percent: "{n}%",
    continue: "Fortsett",
    runAgain: "Kjør på nytt",
    resultsTitle: "Notater fra korrektur",
    emptyResults: "Ingenting fast denne gangen.",
    clickHint: "Klikk på en linje for å åpne kapitlet.",
    stale: "Kapitlet er endret siden passet.",
    suggestion: "Forslag",
    chapter: "Kapittel {n}",
    chapters: "Kapittel {a} og {b}",
    paused: "Pauset. Det som rakk å bli ferdig er lagret.",
    error: "Passet stoppet. Det som rakk å bli ferdig er lagret.",
    craft: "Kamera på kortene",
    contentFlag: "Innholdsvarsel",
    stageSkipped: "Ikke valgt denne gangen",
    scopeSummary: "Omfang: bare {chapter}. Grammatikk og Faktasjekk gjelder bare det kapitlet; de andre stegene sammenligner alltid hele manuset.",
    setupTitle: "Før vi kjører",
    setupLede: "Kryss av det du vil kontrollere denne gangen. Alt er forhåndsavkrysset, akkurat som før.",
    setupStagesLabel: "Hva skal kontrolleres",
    setupScopeLabel: "Omfang",
    setupScopeManuscript: "Hele manuset",
    setupScopeChapter: "Bare \"{chapter}\" (det åpne kapitlet)",
    setupScopeChapterHint: "Gjelder bare Grammatikk og Faktasjekk — de eneste to stegene som skalerer med antall kapitler. De andre sammenligner alltid mellom kapitler, så de kjøres over hele manuset uansett.",
    openPlaceholdersChapter: {
      one: "{count} åpen plassholder-notat i dette kapitlet — lett å kjøre korrekturlesing og glemme at den fortsatt er der.",
      other: "{count} åpne plassholder-notater i dette kapitlet — lett å kjøre korrekturlesing og glemme at de fortsatt er der."
    },
    openPlaceholdersManuscript: {
      one: "{count} åpen plassholder-notat i manuset — lett å kjøre korrekturlesing og glemme at den fortsatt er der.",
      other: "{count} åpne plassholder-notater i manuset — lett å kjøre korrekturlesing og glemme at de fortsatt er der."
    },
    setupStart: "Start korrekturlesing",
    setupNothingSelected: "Velg minst én ting å kontrollere."
  },
  developmental: {
    action: "Developmental analyse",
    runningTitle: "Developmental analyse pågår — dette dekker hele manuset, så det kan ta en stund.",
    resultsTitle: "Developmental-rapport",
    lede: "En strukturell lesning av hele manuset — tempo, spenning, og hvilke tråder som betales av. Scene for scene, så kapittel for kapittel, så en endelig rapport. Ingenting skrives om.",
    stageScene: "Leser scener",
    stageChapter: "Syntetiserer kapitler",
    stageReport: "Skriver rapporten",
    sceneProgress: "Scener — {done} av {total} lest",
    chapterProgress: "Kapitler — {done} av {total} syntetisert",
    reportProgress: "Skriver den endelige rapporten",
    now: "Nå: {detail}",
    nowScene: "leser kapittel {chapter}, scene {scene}…",
    nowChapter: "syntetiserer kapittel {n}…",
    nowReport: "skriver den endelige rapporten…",
    stillWorking: "Jobber fortsatt — dette dekker hele manuset, så det kan ta en god stund på tregere maskinvare. Ingenting har stoppet opp.",
    percent: "{n}%",
    continue: "Fortsett",
    runAgain: "Kjør igjen",
    emptyResults: "Ingen rapport ennå.",
    openingHookLabel: "Krok i åpningen",
    openingHookGood: "Kapittel 1 kroker leseren — et konkret ubesvart spørsmål eller en uvanlig hendelse drar dem videre.",
    openingHookIssues: {
      none: "Kapittel 1 kroker ikke leseren tydelig.",
      no_question: "Kapittel 1 reiser ingenting uløst — ingenting drar leseren til neste side.",
      backstory_dump: "Kapittel 1 åpner med å forklare historie/bakgrunn i stedet for å starte historiens faktiske nåtidige handling.",
      reveals_too_much: "Kapittel 1 avslører mysteriet eller innsatsen før de rekker å fungere som et spørsmål."
    },
    summaryLabel: "Sammendrag",
    concernsLabel: "Verdt et blikk",
    clickHint: "Klikk på et kapittel for å åpne det.",
    chapter: "Kapittel {n}",
    paused: "Pauset. Det som er ferdig er lagret.",
    error: "Kjøringen stoppet. Det som er ferdig er lagret.",
    setupTitle: "Før vi kjører dette",
    setupLede: "En manuelt startet kjøring over hele manuset — scene for scene, så kapittel for kapittel, så en endelig rapport. Kan ta en stund; start gjerne og kom tilbake senere.",
    setupNoThreadsWarning: "Ingen tråder er tagget noe sted i dette manuset ennå (Plotlines) — lesningen fungerer likevel, bare litt grovere uten det grunnlaget.",
    setupStart: "Start analyse"
  },
  craft: {
    pov: "Perspektiv",
    povAria: "Fortellerperspektiv",
    chapterPov: "Kapitlets fortellerperspektiv",
    tense: "Tempus",
    tenseAria: "Tempus",
    chapterTense: "Kapitlets tempus",
    viewpoint: "Synsvinkel",
    viewpointPlaceholder: "Hvem er i fokus?",
    viewpointAria: "Synsvinkelkarakter",
    chapterViewpoint: "Kapitlets synsvinkelkarakter",
    viewpointInherit: "{name} (manuskript)",
    usual: "Vanlige",
    more: "Flere",
    inheritPov: "Manuskript · {label}",
    inheritTense: "Manuskript · {label}",
    continuesFrom: "Fortsetter fra",
    previousChapter: "Forrige kapittel",
    previousChapterNamed: "Forrige kapittel · {label}",
    noneStrand: "Ingen · ny tråd",
    attachedContextLabel: "Vedlagt kontekst",
    attachedContextLede:
      "Fest et tidligere kapittel — eller bare en av scenene dets — som ekstra kontekst for Lag utkast og Omskriv på dette kapittelet. Sender hele prosaen, ikke bare en oppsummeringslinje: nyttig når et sted, en gjenstand eller en karakter må leses akkurat som den ble beskrevet første gang, noe \"Story so far\" alene kan miste.",
    attachedContextPickChapter: "Velg et kapittel…",
    attachedContextWholeChapter: "Hele kapittelet",
    attachedContextSceneFallback: "Scene {index}",
    attachedContextAdd: "Fest",
    attachedContextRemove: "Fjern {label} fra vedlagt kontekst",
    attachedContextCost: "~{n} tokens vedlagt kontekst",
    modes: {
      limited: "Tredje person begrenset",
      first: "Første person",
      omniscient: "Tredje person allvitende",
      objective: "Tredje person objektiv",
      second: "Andre person"
    },
    tenses: {
      past: "Fortid",
      present: "Nåtid"
    }
  },
  bible: {
    title: "Story Bible",
    search: "Søk i Story Bible",
    searchPlaceholder: "Finn et navn eller en påstand",
    shelves: "Story Bible-hyller",
    review: "Gjennomgå fakta",
    reviewCount: "Gjennomgang · {count}",
    lockedCount: "{count} låste",
    exportCards: "Eksporter kort",
    exportCardsTitle: "Last ned karakterer, steder og gjenstander til kaampi Explore",
    importLoreNav: "Importer lore",
    importLoreTitle: "Importer en lore-artikkel",
    importLoreLede: "Lim inn tekst fra din egen lorebok. En AI leser gjennom den og foreslår fakta til riktig kort — akkurat som når fakta hentes ut fra et kapittel. Ingenting låses direkte; alt havner i granskingskøen. Selve teksten lagres ikke i boken, bare faktaene den gir opphav til.",
    importLoreArticleTitle: "Artikkelens navn (valgfritt, vises i granskingen)",
    importLoreArticleTitlePlaceholder: "F.eks. \"Fyrtårnet\" eller \"Ordenens regler\"",
    importLoreText: "Tekst å hente fakta fra",
    importLoreTextPlaceholder: "Lim inn artikkelen her…",
    importLoreAction: "Hent ut fakta",
    importLoreExtracting: "Henter ut…",
    importLoreUpload: "Last opp fil",
    importLoreFoundCount: "Fant {count}",
    importLoreArticlesCount: { one: "{count} artikkel", other: "{count} artikler" },
    importLoreExtractingProgress: "Henter ut {current} av {total}…",
    importLoreActionCount: "Hent ut fakta fra {count}",
    importSeriesNav: "Importer forrige bok",
    importSeriesTitle: "Ta med serien videre",
    importSeriesLede: "Last opp forrige boks \"Eksport for andre apper\"-fil for å ta med de låste faktaene som forslag i gjennomgangskøen — et faktum som gjaldt i forrige bok er ikke automatisk sant i denne, så ingenting låses rett inn. Velg hvilke karakterer, steder og andre entiteter som skal tas med nedenfor.",
    importSeriesUpload: "Last opp eksportfil",
    importSeriesParseError: {
      "not-export": "Den filen er ikke en eksport fra kaampi Write.",
      "wrong-kind": "Den filen er ikke en manuseksport.",
      "newer-format": "Den eksporten ble laget med en nyere versjon av kaampi Write enn denne forstår.",
      invalid: "Den filen kunne ikke leses som en eksport."
    },
    importSeriesFoundCount: "\"{title}\" — fant {count} entiteter",
    importSeriesFactsCount: { one: "{count} faktum", other: "{count} fakta" },
    importSeriesActionCount: "Ta med {count}",
    importSeriesImported: "La til {count} i gjennomgangskøen.",
    importSeriesTextTitle: "Noe annet å ta med videre?",
    importSeriesTextLede: "Noe fra forrige bok som aldri ble et strukturert faktum — skriv det her, og en AI foreslår fakta fra det, akkurat som å importere en lore-artikkel.",
    importSeriesTextPlaceholder: "f.eks. notater, et oppdrag, eller noe annet verdt å ta med…",
    importSeriesTextAction: "Hent ut fakta",
    nothingMatches: "Ingenting matcher.",
    hidden: "Skjult",
    name: "Navn",
    close: "Lukk",
    reviewBody: "Foreslåtte rader i Story Bible. Gjør dem tydeligere, lås — eller avvis.",
    hideFromDraft: "Skjul for utkast",
    interview: "Intervju",
    interviewPickerTitle: "Hvem eller hva vil du intervjue?",
    interviewPickerLede: "Hvilket som helst kort i Story Bible — ikke bare karakterer. Et sted eller en gjenstand kan også intervjues, i tredje person, som en måte å bygge ut verdenen din på.",
    showToDraft: "Vis for utkast",
    hiddenNote: "Modellen ser ikke dette kortet før du viser det igjen.",
    deleteEntity: "Slett dette kortet",
    deleteConfirm: "Slette “{name}” helt, med alle fakta, bilder og profil? Dette kan ikke angres.",
    thisIsA: "Dette er en",
    pictures: "Bilder",
    picturesAside: "(Til senere eksport. Utkast ser aldri disse.)",
    removePicture: "Slett bilde {n}",
    addImage: "Legg til bilde",
    addingImage: "Legger til bilde",
    addFact: "Legg til fakta",
    addFactHint: "Legger du til et påstand under en kategori som allerede har en, tilbys du å erstatte den — den tidligere verdien er fortsatt synlig i Historikk, koblet til kapittelet du skriver nå.",
    claimPlaceholder: "Påstanden, på én linje",
    lockInto: "Lås til Story Bible",
    addChoiceTitle: "Erstatt eller legg til?",
    addChoiceBody: "Feltet {predicate} har allerede “{existing}”. Skal den nye teksten erstatte den, eller ligge ved siden av som enda en {predicate}-rad?",
    addChoiceKeepBoth: "Legg til som enda en",
    addChoiceReplace: "Erstatt den eksisterende",
    mergeStart: "Slå sammen kort…",
    createSeriesFromBook: "Gjør til serie",
    creatingSeriesFromBook: "Oppretter serie…",
    createSeriesFromBookTitle:
      "Oppretter en ny serie med samme navn som boken, knytter boken til den, og sender opp hver eneste låste fakta i boken til serien som fastslått kanon.",
    createSeriesFromBookConfirm:
      'Opprette en serie som heter "{title}", med denne boken som dens første? Hver eneste låste fakta i boken blir seriens egen kanon.',
    createSeriesFromBookDone: 'Opprettet serien "{title}", med denne boken som dens første.',
    seriesMissing: "Denne boken tilhører en serie som ikke finnes — slettet, eller aldri synkronisert til denne installasjonen. Bokens egen Story Bible er upåvirket, men boken vises ikke på startsidens frittstående hylle før den enten kobles til igjen eller gjøres frittstående på nytt.",
    seriesMissingConfirm: "Gjør boken frittstående igjen? Dens egne låste fakta blir værende akkurat som de er — den slutter bare å peke på en serie som ikke finnes.",
    seriesMissingFix: "Gjør boken frittstående",
    mergeSelectedCount: { one: "{count} kort valgt", other: "{count} kort valgt" },
    mergeAction: "Slå sammen ({count})",
    mergeKindMismatch: "Disse kortene er ulike typer (f.eks. en karakter og et sted) — sammenslåing fungerer bare innenfor samme type.",
    mergeTitle: "Slå sammen {count} kort til ett",
    mergeLede: "Ingenting slettes — hver fakta flyttes til det sammenslåtte kortet, og hvert gamle navn blir et alias så en senere omtale av et av dem fortsatt finner hit.",
    mergeLabelLegend: "Hvilket navn skal det sammenslåtte kortet vise?",
    mergeLabelCustom: "Noe annet",
    mergeConflictsLabel: "Disse kortene er uenige — velg hva som skal bli stående",
    mergeConfirm: "Slå sammen",
    mergeReplaceTitle: "Bytt ut de gamle navnene i manusteksten også?",
    mergeReplaceBody: "Det sammenslåtte kortet heter nå “{to}”. De tidligere navnene finnes fortsatt i teksten din — skal de byttes ut der også?",
    mergeReplaceRow: "“{from}” i {places}",
    mergeWithPlaceholder: "Slå sammen med…",
    history: "Historikk",
    historyAside: "(Å erstatte et påstand under legger til en rad her.)",
    historyCurrent: "nå",
    asOfLabel: "Vis Story Bible slik den var ved",
    asOfNow: "Nåtiden",
    asOfBanner: "Viser Story Bible slik den var ved «{chapter}» — skrivebeskyttet.",
    asOfBack: "Tilbake til nåtiden",
    asOfEntityLede: "Slik det sto ved «{chapter}».",
    mentions: "Omtaler",
    mentionsAside: "(Hvert kapittel som nevner denne entiteten i prosaen.)",
    aliases: "Alias",
    aliasesAside: "(Kallenavn og titler. Teller også som en omtale.)",
    aliasesPlaceholder: "Kommaseparerte kallenavn",
    exclusions: "Unntak",
    exclusionsAside: "(Fraser som ikke skal telle som en omtale.)",
    exclusionsPlaceholder: "Kommaseparerte fraser som skal ignoreres",
    replaceTitle: "Erstatt i manuskriptet?",
    replaceBody: "Erstatt “{from}” med “{to}” på {places}. Brainstorm blir liggende urørt.",
    places: { one: "{count} sted", other: "{count} steder" },
    keepTexts: "Behold tekstene",
    replace: "Erstatt",
    pronoun: "Pronomen",
    age: "Omtrentlig alder",
    looks: "Utseende",
    looksPlaceholder: "Kropp og ansikt. Ikke klær.",
    tags: "Tagger",
    tagsAside: "(Bare hyllen. Utkast ser aldri disse.)",
    tagsPlaceholder: "Kommaseparerte trekk",
    personality: "Personlighet",
    personalityPlaceholder: "Hvordan de pleier å være",
    goals: "Mål",
    goalsPlaceholder: "Hva de vil",
    fears: "Frykter",
    fearsPlaceholder: "Hva de er redde for",
    eventWhere: "Hvor",
    eventWhereNone: "Ikke plassert ennå",
    eventParticipants: "Hvem som var der",
    eventsHere: "Hendelser her",
    peopleHere: "Personer her",
    namePlaceholder: "Navn",
    factText: "Faktatekst",
    sourceLabel: "Kilde: {source}",
    sources: {
      chapter: "Kapittel",
      interview: "Intervju",
      lore: "Lore",
      brainstorm: "Brainstorm",
      synopsis: "Synopsis",
      brief: "Brief",
      series: "Forrige bok"
    },
    unconfirmed: "Ubekreftet — bare noe en karakter har hevdet, ikke fastslått bakgrunn.",
    unconfirmedClaimedBy: "Ubekreftet — hevdet av {name}, ikke fastslått bakgrunn.",
    unconfirmedBadge: "Ubekreftet",
    promoteUnconfirmedConfirm: "Send denne til serien likevel? \"{value}\" er fortsatt ubekreftet — ingen har bekreftet det uavhengig. Å sende den gjør den til fastslått canon for hele serien.",
    promoteUnconfirmedConfirmClaimedBy: "Send denne til serien likevel? \"{value}\" er fortsatt bare hevdet av {name}, ikke uavhengig bekreftet. Å sende den gjør den til fastslått canon for hele serien.",
    seriesSkippedUnconfirmed: "Hoppet over {count} ubekreftede påstand(er) — de ble igjen i denne boken istedenfor å bli serie-canon. Send dem enkeltvis fra entitetens kort hvis de likevel skal gjelde for hele serien.",
    conflictsWith: "Kolliderer med: {value}",
    similarTo: "Ligner: {value} — ser ut som samme fakta, bare mer detaljert",
    lock: "Lås",
    merge: "Slå sammen",
    keepSeparate: "Behold begge",
    reject: "Avvis",
    show: "Vis",
    hide: "Skjul",
    showClaim: "Vis denne påstanden for utkast",
    hideClaim: "Skjul denne påstanden for utkast",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Alltid med",
    positionOverrideExclude: "Aldri med",
    positionOverrideToInclude: "Inkluder alltid i Lag utkast, uansett kapittelets posisjon i story-tiden og uansett relevansfilteret for lore",
    positionOverrideToExclude: "Utelat alltid fra Lag utkast, uansett kapittelets posisjon i story-tiden",
    positionOverrideToAuto: "Gå tilbake til automatisk posisjonering (styres av story-tiden)",
    edit: "Rediger",
    editFact: "Rediger fakta",
    save: "Lagre",
    remove: "Fjern",
    removeFactConfirm: "Fjern denne faktaen — \"{value}\"? Dette kan ikke angres. Bruk dette for en påstand som rett og slett er feil, ikke en du retter med en ny verdi (bruk Rediger for det, eller Oppdater… hvis den endres herfra).",
    updateFact: "Oppdater…",
    updateFactHint: "Merk at dette endres herfra — fyller inn Legg til fakta under, koblet til kapittelet du skriver nå. I motsetning til Rediger, som retter det det alltid har vært.",
    kinds: {
      characters: "Karakterer",
      locations: "Steder",
      objects: "Gjenstander",
      groups: "Grupper",
      events: "Hendelser",
      concepts: "Konsepter"
    },
    singular: {
      characters: "Karakter",
      locations: "Sted",
      objects: "Gjenstand",
      groups: "Gruppe",
      events: "Hendelse",
      concepts: "Konsept"
    },
    newLabel: {
      characters: "Ny karakter",
      locations: "Nytt sted",
      objects: "Ny gjenstand",
      groups: "Ny gruppe",
      events: "Ny hendelse",
      concepts: "Nytt konsept"
    },
    empty: {
      characters: "Ingen karakterer ennå.",
      locations: "Ingen steder ennå.",
      objects: "Ingen gjenstander ennå.",
      groups: "Ingen grupper ennå.",
      events: "Ingen hendelser ennå.",
      concepts: "Ingen konsepter ennå."
    },
    predicates: {
      "core.identity": "Identitet",
      "core.trait": "Karaktertrekk",
      "core.place": "Sted",
      "core.object": "Gjenstand",
      "core.group": "Gruppe",
      "core.relationship": "Relasjon",
      "core.event": "Hendelse",
      "core.concept": "Konsept"
    },
    pronouns: {
      she: "Hun",
      he: "Han",
      it: "Hen"
    }
  },
  canvas: {
    jumpToEntity: "Ctrl-klikk (Cmd-klikk på Mac) for å åpne {name}s Story Bible-kort",
    extend: "Forleng",
    elaborate: "Utdyp",
    beat: "Skriv en beat…",
    beatTitle: "Skriv en beat",
    beatHint: "Kort og konkret: hva skjer nå? Modellen skriver bare den beaten, ikke mer, og setter den inn akkurat der markøren står.",
    beatPlaceholder: "Hva skjer videre, i én linje",
    beatAction: "Skriv beaten",
    rewriteMenu: "Skriv om…",
    illustrate: "Illustrasjonsprompt…",
    lift: "Løft til synopsis",
    cutToDarling: "Klipp til yndlinger",
    createScene: "Lag scene",
    formatToolbar: "Formatering",
    bold: "Fet",
    italic: "Kursiv",
    underline: "Understreket",
    manual: "Manuell redigering",
    insteadOf: "I stedet for “{word}”",
    looking: "Søker…",
    noAlts: "Ingen alternativer denne gangen.",
    retry: "Prøv på nytt",
    manualTitle: "Manuell redigering",
    manualBody: "Skriv om bare det markerte avsnittet. Resten av teksten blir liggende.",
    apply: "Bruk",
    rewriteTitle: "Skriv om",
    rewriteHint: "Si til modellen hvordan det markerte avsnittet skal endres. Bare det spannet byttes ut.",
    rewritePlaceholder: "Hva skal endres?",
    rewriteAction: "Skriv om",
    ask: "Spør…",
    askTitle: "Spør om denne passasjen",
    askHint: "Spør om hva som helst om den markerte passasjen — vær så kritisk du vil. Svaret er bare til å lese, ingenting endres eller lagres.",
    askPlaceholder: "Hva vil du vite?",
    askAction: "Spør",
    placeholderAdd: "Legg til plassholder…",
    placeholderAddTitle: "Legg til plassholder",
    placeholderAddHint: "En rask notis til deg selv — et navn, en fakta, en dato du fyller inn senere. Fortsett å skrive; kom tilbake når du vil.",
    placeholderPlaceholder: "Hva trenger du å komme tilbake til?",
    placeholderAddAction: "Legg til",
    placeholderViewTitle: "Plassholder",
    placeholderSave: "Lagre",
    placeholderResolve: "Marker som løst",
    placeholderOpen: "Åpne denne plassholderen",
    placeholderEmptyNote: "Plassholder",
    rewriteChips: {
      group: "Snarveier fra Statistikk og Analyse",
      povLeakCamera:
        "Bli i det aktuelle kameraet. Ikke gå inn i et sinn kameraet ikke kan kjenne. Samme hendelser.",
      povLeak: {
        label: "Fiks perspektivbrudd",
        prompt:
          "Bli i {who}s oppfatning. Ikke gjengi en annen karakters tanker eller følelser. Samme hendelser."
      },
      strongerVerbs: {
        label: "Sterkere verb",
        prompt:
          "Bytt svake verb pluss måtesadverb mot sterkere verb (løp fort → raste). Ikke bare ta bort -t-ordene. Samme hendelser."
      },
      activeVoice: {
        label: "Aktiv form",
        prompt:
          "Gjør mulige passiver aktive (døren ble åpnet av henne → hun åpnet døren). Samme hendelser."
      },
      showDontTell: {
        label: "Vis, fortell ikke",
        prompt:
          "Der en følelse navngis, la kroppen eller scenen bære den. Ikke legg til forklaring. Samme hendelser."
      },
      breakLong: {
        label: "Bryt den lange setningen",
        prompt:
          "Bryt den lange setningen. Behold meningen. Et kort støt etter en lang linje, ikke en rekke like korte."
      }
    },
    modelAside: "Modellen la til dette. Det ligger ikke i manuset."
  },
  stats: {
    report: {
      current: "Åpen tekst",
      manuscript: "Hele manuset",
      textMeasures: "Tekstmål",
      passages: "Passasjer å lese nærmere",
      title: "Manusrapport",
      chapter: "Kapittel {n}",
      empty: "Skriv litt prosa i et kapittel for å se en manusrapport.",
      dialogue: "Dialog",
      dialogueSummary: "Omtrent {share} % av ordene i manuset står i anførselstegn som Stats gjenkjenner. Kapittellisten viser hvordan andelen varierer gjennom boka.",
      byChapter: "Dialog per kapittel",
      repetitions: "Gjentatte fraser",
      repetitionIntro: "I passasjene nedenfor gjentas den samme frasen på fire ord innenfor 120 ord, noen ganger over en kapittelgrense. Åpne utdragene for å se hvordan frasen fungerer på hvert sted.",
      noRepetitions: "Sjekken fant ingen gjentatte fireordsfraser nær hverandre med minst to innholdsord.",
      dialogueShift: "Den største endringen mellom kapitler som følger etter hverandre i sammenligningen, går fra {before} % i {from} til {after} % i {to}.",
      dialogueAction: "Hvis du vil se hvordan skiftet fungerer i teksten, kan du sammenligne slutten av det første kapittelet med begynnelsen av det neste. Passer endringen i hvor mye plass replikkene får til overgangen du ønsker?",
      dialogueMethod: "Tellingen bygger på anførselstegn som Stats gjenkjenner. Dialog med replikkstrek faller utenfor. Rapporten trekker fram endringer på minst 10 prosentpoeng mellom kapitler som følger etter hverandre og har minst 100 ord hver.",
      actionWithin: "Les de to forekomstene etter hverandre. Hvis gjentakelsen gir rytme eller framhever noe leseren skal merke seg, kan du beholde den. Hvis begge gjør samme jobb, kan du prøve å variere den ene.",
      actionAcross: "Les passasjene på hver sin side av kapittelgrensen. Frasen kan skape en forbindelse mellom kapitlene. Hvis ekkoet virker utilsiktet, kan du prøve å variere den ene forekomsten.",
      openDialogue: "Åpne {chapter}",
      characterMentions: "Karakteromtaler",
      chooseCharacter: "Velg karakter",
      mentionMethod: "Rapporten søker etter navn og aliaser fra Story Bible og bruker unntakene dine. Den teller også når en karakter bare blir omtalt.",
      noCharacters: "Legg til en karakter i Story Bible for å se hvor navnet og eventuelle aliaser nevnes.",
      noMentions: "Rapporten fant ingen treff på navn eller aliaser for {name}.",
      mentionSceneOne: "{name} nevnes i én scene.",
      mentionSceneMany: "{name} nevnes i {n} scener.",
      mentionGap: "Det lengste oppholdet mellom navneomtaler omfatter {n} scener med tekst. Utdragene viser scenene på hver sin side.",
      mentionAction: "Les de to scenene sammen. Hvis du vil at leseren skal ha karakterens tråd i tankene i mellomtiden, se om teksten allerede bærer den på en annen måte. Du kan prøve en kort påminnelse hvis den passer fortellingen.",
      mentionList: "Scener med omtaler",
      scene: "Scene {n}",
      mentionOne: "1 omtale",
      mentionMany: "{n} omtaler",
      dialogueDistribution: "Dialog i kapittelet",
      dialogueChartHint: "Åpne en kapittelrad for å se dialogfordelingen. Hver stolpe viser andelen ord innenfor anførselstegn i ett avsnitt.",
      goToDialogueChapter: "Gå til kapittelet",
      dialogueParagraph: "Avsnitt {n} · {share} % dialog",
      openDialogueParagraph: "Åpne avsnittet i manuset",
      chapterLength: "Kapittellengde",
      chapterLengthMedian: "Medianen for kapittellengde er {count}.",
      chapterLengthRange: "Kapittellengden varierer fra {shortest} til {longest}.",
      chapterLengthHint: "Kapitler med prosa vises i manusrekkefølge. Velg en rad for å åpne kapittelet.",
      chapterLengthMedianLine: "Streken viser medianen",
      network: "Karakternettverk",
      networkMethod: "Avstanden viser hvor nært bundet to karakterer er i manuset: desto flere scener de deler, desto nærmere hverandre plasseres de — uansett om de faktisk snakker med hverandre eller ikke. Sirkelens størrelse viser hvor mange scener karakteren forekommer i totalt.",
      networkEmpty: "Legg til minst to karakterer som deler en scene for å se et nettverk.",
      networkHint: "Klikk på et navn for å se nøyaktig hva det er nærmest, og hvorfor.",
      networkFocus: "{name} deler flest scener med {list}.",
      networkLegendSize: "Sirkelens størrelse = scener karakteren forekommer i",
      networkLegendLine: "Linjens tykkelse = scener delt med den karakteren",
      networkFocusQuestions: [
        "Hva skjer mellom dem selv når de ikke snakker med hverandre?",
        "Hvem blir sett i disse scenene, og av hvem?",
        "Hva ville endret seg hvis en av dem ikke var der?"
      ],
      networkPatternIntro: "Når du ser på mønsteret over hele manuset:",
      networkPatternQuestions: [
        "Hvilken relasjon overrasker deg mest her?",
        "Hvordan endrer karakterenes oppmerksomhet mot hverandre seg gjennom historien?",
        "Hvor godt stemmer mønsteret med relasjonen du vil skildre?"
      ]
    },
    label: "Statistikk",
    wordsShort: { one: "{count} ord", other: "{count} ord" },
    rareOn: "Sjeldne ord på",
    rareOff: "Sjeldne ord av",
    rareOnTitle: "Skjul uvanlige ord",
    rareOffTitle: "Merk uvanlige ord",
    ticsOn: "Klisjeer på",
    ticsOff: "Klisjeer av",
    ticsOnTitle: "Skjul AI-klingende fraser",
    ticsOffTitle: "Merk AI-klingende fraser",
    factsOn: "Story Bible-navn på",
    factsOff: "Story Bible-navn av",
    factsOnTitle: "Skjul understreking av Story Bible-navn",
    factsOffTitle: "Understrek navn som finnes i Story Bible",
    rareMarkTitle: "Uvanlig ord — kan være vanskeligere for denne leseren",
    ticPhraseTitle: "Høres ut som en AI-generert frase",
    ticDashTitle: "Dette avsnittet støtter seg tungt på tankestreker",
    title: "Slik leses det",
    emptyTitle: "Ingen prosa ennå",
    writeSome: "Skriv litt prosa for å se hvordan det leses.",
    sentence: "Setning {n} · {words}",
    alreadyShort: "Allerede kort.",
    suggestSplit: "Foreslå en deling",
    looking: "Søker…",
    noSplit: "Ingen deling denne gangen.",
    split: "Deling",
    editSplit: "Rediger deling",
    useSplit: "Bruk denne delingen",
    paragraph: "Avsnitt {n} · {words}",
    packedHint: "Handling, et langt blikk bakover og stablede sanser i denne blokken.",
    suggestBreak: "Foreslå et brudd",
    noBreak: "Ingen brudd denne gangen.",
    break: "Brudd",
    editBreak: "Rediger avsnittsbrudd",
    useBreak: "Bruk dette bruddet",
    clickBar: "Klikk på en stolpe for å lese setningen.",
    mixedFocus: "Blandet fokus",
    mixedOne: "Denne blokken blander nåtidig handling, et langt blikk bakover og stablede sanser.",
    mixedMany: "Disse blokkene blander nåtidig handling, et langt blikk bakover og stablede sanser.",
    echo: "Gjentakelser",
    echoBody: "Samme ord eller frase gjentas på kort avstand. Klikk for å søke. Et omkved kan være poenget.",
    reuse: "Gjentatt frase",
    reuseBody: "Samme ordkjede dukker opp i mer enn ett avsnitt. Klikk for å søke. Et omkved kan være poenget.",
    reuseWhere: "Avsnitt {list} · {n} ord",
    openFind: "Søk «{phrase}» i teksten",
    povLeak: "Perspektivbrudd",
    foot: "{words} ord · {sentences} setninger · {spoken}% tale",
    highlight: "Merk i teksten",
    keepHighlight: "Behold merking",
    measures: "Hva dette måler",
    raise: "Hvordan du hever det",
    remember: "Husk",
    longSentences: "{n}+ ord",
    rareList: "Utenfor den kjente listen",
    hideGauge: "Skjul denne måleren.",
    aboutGauge: "Om denne måleren.",
    gaugeAria: "{label} {score}. {detail}",
    sparkTitle: "{count} ord",
    sparkAria: "Setning {n}, {count} ord",
    leakObjective: "Disse linjene ligner tanke. Objektiv viser bare det et kamera ville sett. Et forslag, ikke en dom.",
    leakFirstNamed: "Disse linjene ligner et annet sinn enn {who}. Et forslag, ikke en dom.",
    leakOther: "Disse linjene ligner et annet sinn. Et forslag, ikke en dom.",
    leakLimitedNamed: "Begrenset til {who} — disse linjene ligner et annet sinn. Et forslag, ikke en dom.",
    directnessReadout:
      "{adverbs} -t-adverb / 1 000 · {passives} mulige passiver / 1 000 · starter på 100, minus de to.",
    pacingSpanSame: "{count} ord hver",
    pacingSpanRange: "{min}–{max} ord",
    pacingReadout:
      "{mix} · {mean} ord typisk · {span}. Variasjon hever; en stabel av {n}+-setninger eller en monoton senker.",
    vocabularyReadout: "{share}% uvanlige · variasjon {ttr}. En mix scorer høyere enn bare enkelt eller bare sjeldent.",
    vocabularyReadoutKid: "{share}% uvanlige · variasjon {ttr}. Kjente ord scorer høyere for denne leseren.",
    mix: {
      mixed: "Blandet",
      choppy: "Kort og jevnt",
      sweeping: "Langt og jevnt",
      even: "Jevnt"
    },
    profiles: {
      empty: { label: "Ingen prosa ennå", genres: "" },
      short: { label: "For kort å måle", genres: "Skriv litt mer" },
      breezy: { label: "Raskt og lett", genres: "Thriller / YA" },
      brisk: { label: "Rørlig", genres: "Eventyr / romantikk" },
      balanced: { label: "Balansert", genres: "Allmenn fiksjon" },
      atmospheric: { label: "Tett og atmosfærisk", genres: "Litterært / episk fantasy" },
      heavy: { label: "Tungt", genres: "Litterært / eksperimentelt" }
    },
    gauges: {
      directness: {
        label: "Direkthet",
        measures: "Hvor direkte du skriver, ut fra andelen måtesadverb og mulige passiver.",
        raise: [
          "Bytt et svakt verb pluss adverb mot et sterkere verb (løp fort → stormet).",
          "Gjør om en mulig passiv til aktiv (døren ble åpnet av henne → hun åpnet døren)."
        ],
        remember:
          "100 er ikke alltid målet. I drømmeaktige eller atmosfæriske passasjer kan passiver og måtesadverb være det rette valget. La scenen lede."
      },
      pacing: {
        label: "Tempo",
        measures:
          "Hvor mye setningslengden varierer, og om lange linjer stables. En mix av korte og lange holder oftest farten.",
        raise: [
          "Bryt en rekke setninger på {n}+ ord. Klikk på en høy stolpe for å granske en.",
          "Følg en lang linje med et kort treff, eller omvendt.",
          "Hvis hver setning er like lang, varier én."
        ],
        remember:
          "Jevn, knallhard prosa kan være poenget — en slåsskamp, en jakt, dialog. Et sveipende avsnitt kan også være det. Dette flagger en monoton eller en stabel lange linjer, ikke en sjanger."
      },
      vocabulary: {
        label: "Vokabular",
        measures: "Balansen mellom kjente ord og uvanlige. Navn i Story Bible telles ikke med.",
        raise: [
          "Hvis prosaen bare har vanlige ord, gjør et presist substantiv eller verb ofte mer enn en rekke adjektiv.",
          "Hvis uvanlige ord hoper seg opp, bytt noen mot enklere — med mindre akkurat den diksjonen er forfatterstemmen.",
          "Merk i teksten viser ord utenfor Dale–Challs kjente liste."
        ],
        remember: "Uvanlig kan være poenget. En havnehistorie trenger kai og blindpassasjer. 100 er en mix, ikke et enklere vokabular."
      }
    }
  },
  notes: {
    review: "Gjennomgang",
    title: "Kapittelnotater",
    emptyTitle: "Ingenting å flagge",
    intro:
      "Gjennomgangen prøver å finne linjer som verken viser karakterens personlighet eller driver scenen framover.",
    introReader: "Rett mot {category}, rundt {age} år.",
    paragraph: "Avsnitt {n}",
    note: "Notat",
    clickHint: "Klikk på et notat for å lese sitatet. Notater er ikke omskrivinger.",
    nothingSolid: "Gjennomgangsmodellen fant ingenting solid i denne runden.",
    foot: "Notater flagger et sted. De skriver ikke om kapitlet og rører ikke Story Bible.",
    categories: {
      show_vs_tell: {
        label: "Vis, ikke fortell",
        blurb: "En navngitt følelse der kroppen eller scenen kunne bære den."
      },
      dialogue_purpose: {
        label: "Dialog",
        blurb: "En talt linje som verken viser karakter eller flytter scenen."
      },
      voice_drift: {
        label: "Forfatterstemme",
        blurb: "Registeret gled fra feltet Forfatterstemme."
      },
      character_fidelity: {
        label: "Karakter",
        blurb: "Et slag som sitter mot et låst Story Bible-karaktertrekk."
      },
      child_agency: {
        label: "Handling",
        blurb: "En voksen tar det avgjørende steget. Barnet skal gjøre det."
      },
      lecture: {
        label: "Pekepinn",
        blurb: "En moral som sies av en voksen, ikke tjenes av protagonistens valg."
      }
    }
  },
  critics: {
    action: "Kritikere",
    setupTitle: "Hvem skal lese dette kapittelet?",
    setupLede: "Hver stemme under leser kapittelet på egen hånd — velg en eller flere. Hver avkrysset stemme er sitt eget kall, så valget er også kostnaden.",
    setupPersonasLabel: "Kritikere å kjøre",
    setupStart: "Kjør kritikere",
    setupNothingSelected: "Velg minst én kritiker å kjøre.",
    review: "Kritikere",
    title: "Kritikernotater",
    emptyTitle: "Ingenting å flagge",
    intro: "Tre distinkte lesere, hver på jakt etter noe de andre ikke ser etter — ingen omskriving, bare det de la merke til.",
    paragraph: "Avsnitt {n}",
    note: "Notat",
    clickHint: "Klikk på et notat for å lese sitatet.",
    nothingSolid: "Ingen av kritikerne fant noe solid i denne runden.",
    foot: "Notater flagger et sted, i den kritikerens egen stemme. De skriver ikke om kapitlet og rører ikke Story Bible.",
    personas: {
      "impatient-reader": {
        label: "Utålmodig leser",
        blurb: "Flagger der tempoet seiger seg forbi punktet det faktisk tjener noe på."
      },
      "pacing-critic": {
        label: "Pacing-kritiker",
        blurb: "Leser kapittelets rytme — der spenningen bygges, holder seg, eller slakker når den ikke burde."
      },
      "confused-reader": {
        label: "Forvirret leser",
        blurb: "Flagger et sted som ved et uhell er blitt vanskelig å følge, ikke et mysterium du plantet med vilje."
      }
    }
  },
  history: {
    kicker: "Kapittel",
    title: "Historikk",
    emptyTitle: "Ingen historikk ennå",
    intro:
      "Tidligere versjoner fra utkast, omskriving, forlengelse, utvidelse og omskriv. Gjenopprett hopper til den versjonen. Senere rader blir liggende.",
    empty: "Modellen har ikke skrevet om dette kapittelet ennå.",
    emptyProse: "(tomt)",
    clickHint: "Klikk på en versjon for å lese den, og Gjenopprett for å legge den i kapittelet.",
    restore: "Gjenopprett",
    compare: "Sammenlign",
    compareHint: "Klikk på en annen versjon for å sammenligne med denne. Gjenopprett bruker fortsatt den valgte versjonen.",
    comparePair: "{from} → {to}",
    live: "Kapittelet nå",
    same: "Disse to er like.",
    fromOnly: "Bare i denne teksten, det du mister hvis du gjenoppretter",
    toOnly: "Bare i denne teksten, det du får hvis du gjenoppretter",
    foot: "Listen er ikke angring. Det du skriver selv lagres ikke. Prompter ser bare det aktuelle kapittelet.",
    ops: {
      draft: "Utkast",
      recast: "Omskriving",
      polish: "Polish",
      extend: "Forleng",
      elaborate: "Utvid",
      rewrite: "Skriv om",
      beat: "Beat",
      restore: "Gjenopprett",
      format: "Formatering",
      darling: "Yndling",
      translate: "Oversettelse"
    }
  },
  polishReview: {
    title: "Se gjennom Polish",
    hint: "Modellens vaskerunde, ikke lagret ennå. Sammenlign de to versjonene, godkjenn eller forkast.",
    original: "Original",
    candidate: "Polish-forslag",
    originalHint: "Det du beholder hvis du forkaster",
    candidateHint: "Det du får hvis du godkjenner",
    accept: "Behold denne versjonen",
    discard: "Forkast"
  },
  markerConvert: {
    nav: "Konverter markeringer",
    heading: "Konverter markeringer til formatering",
    intro:
      "Gjør om tegn som *asterisker* — eller par av åpnings-/avslutningstegn som «smarte anførselstegn» — fra et importert manus til ekte fet skrift, kursiv eller understreking. Markeringene fjernes fra teksten — bare formateringen blir igjen. Lengre markeringer kjøres først, slik at \"**\" ikke tolkes som to enkle \"*\" — legg til begge hvis manuset ditt bruker dem til ulike ting.",
    openLabel: "Åpningstegn",
    openPlaceholder: "f.eks. * eller «",
    closeLabel: "Avslutningstegn",
    closePlaceholder: "f.eks. * eller »",
    becomes: "blir",
    styleLabel: "Stil",
    addRule: "Legg til rad",
    removeRule: "Fjern",
    convertAction: "Konverter hele manuset",
    converting: "Konverterer…",
    resultSummary: "Konverterte {markers} i {chapters}.",
    resultNone: "Ingen markeringer funnet — ingenting å konvertere.",
    markersCount: { one: "{count} markering", other: "{count} markeringer" },
    chaptersCount: { one: "{count} kapittel", other: "{count} kapitler" },
    smartQuotesIntro:
      "Rette anførselstegn (\") du skriver fra nå av blir automatisk ekte åpnende/avsluttende buede anførselstegn. Dette konverterer hvert rette anførselstegn som allerede finnes i manuset på samme måte, i én kjøring.",
    smartQuotesAction: "Gjør om anførselstegn i hele manuset",
    smartQuotesConverting: "Konverterer…",
    smartQuotesResultSummary: "Gjorde om anførselstegn i {chapters}.",
    smartQuotesResultNone: "Ingen rette anførselstegn funnet — ingenting å konvertere."
  },
  errors: {
    ollamaOrigins: "Den lokale serveren tok ikke imot nettleseren. Kjører du Ollama? Start den med OLLAMA_ORIGINS satt til adressen kaampi Write faktisk kjører fra — OLLAMA_ORIGINS=http://localhost:5175 hvis det er denne maskinen, eller OLLAMA_ORIGINS=* for å tillate hvilken som helst adresse, enklest når du kobler til fra en annen maskin i nettverket. Kjører du LM Studio eller en annen server? Se etter en innstilling for hvilke nettadresser som får koble til (kalles ofte CORS eller allowed origins).",
    noModel: "Ingen lokal modell funnet. Start Ollama eller din lokale server, og last inn på nytt.",
    notJson: "Den filen er ikke JSON.",
    backupUnreadable: "Kunne ikke lese den sikkerhetskopien.",
    sampleManuscriptUnavailable: "Kunne ikke laste inn eksempelmanuskriptet.",
    shelfUnreadable: "Kunne ikke lese hyllen.",
    recastEmpty: "Skriv eller ta fram litt prosa før du omskriver.",
    extractEmpty: "Skriv eller ta fram litt prosa før du henter ut fakta.",
    analyzeEmpty: "Skriv eller ta fram litt prosa før du analyserer kapitlet.",
    polishEmpty: "Skriv eller ta fram litt prosa før du pusser kapitlet.",
    extractorNone: "Ekstraktoren fant ingen uttalte fakta i dette kapitlet.",
    interviewExtractorNone: "Ekstraktoren fant ingen uttalte fakta i denne samtalen.",
    brainstormExtractorNone: "Ekstraktoren fant ingen uttalte fakta i denne lappen.",
    synopsisExtractorNone: "Ekstraktoren fant ingen uttalte fakta i synopsis.",
    briefExtractorNone: "Ekstraktoren fant ingen uttalte fakta i denne brief-en.",
    importLoreNone: "Ekstraktoren fant ingen uttalte fakta i den innlimte teksten.",
    summarizeNone: "Kunne ikke oppsummere dette kapittelet — prøv igjen, eller skriv sammendraget for hånd.",
    proofreadEmpty: "Skriv eller ta fram litt kapittelprosa før korrektur.",
    developmentalEmpty: "Skriv eller ta fram litt kapittelprosa før en developmental analyse.",
    askManuscriptEmpty: "Skriv eller ta fram litt kapittelprosa før du spør om manuset.",
    askManuscriptNoMatch: "Ingenting i manuset matcher det spørsmålet.",
    translateSourceEmpty: "Kildekapittelet har ingen tekst ennå — skriv eller lag utkast der først.",
    translateSourceMissing: "Kunne ikke laste inn kildemanuset dette kapittelet er lenket til.",
    serverUrlMissing: "Skriv inn den lokale serverens adresse i Innstillinger.",
    busy: "En annen handling pågår allerede. Vent til den er ferdig, og prøv igjen.",
    timeout: "Den lokale modellen svarte ikke i tide. Den kan fortsatt laste, eller datamaskinen din kan trenge lengre tid enn vanlig — sjekk at den kjører, prøv så igjen.",
    imageChoose: "Velg en bildefil.",
    imageRead: "Kunne ikke lese det bildet.",
    imageAdd: "Kunne ikke legge til det bildet."
  }
};
