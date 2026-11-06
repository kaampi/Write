import type { Messages } from "./en";

export const sv: Messages = {
  common: {
    fileSaveError: "Kunde inte spara filen. Försök igen.",
    cancel: "Avbryt",
    close: "Stäng",
    stop: "Stopp",
    save: "Spara",
    copy: "Kopiera",
    copied: "Kopierat",
    infoAbout: "Mer om {field}",
    previous: "Föregående",
    next: "Nästa"
  },
  busy: {
    title: "Arbetar",
    help: "Den lokala AI:n jobbar med det här. Första anropet kan ta lite längre tid medan modellen laddas.",
    drafting: "Skriver utkast…",
    analyzing: "Analyserar…",
    polishing: "Putsar…",
    illustrating: "Skriver en illustrationsprompt…",
    developing: "Utvecklar…",
    importing: "Importerar {current} av {total}…"
  },
  app: {
    crash: "Appen stötte på ett fel.",
    tryAgain: "Försök igen",
    missingRoot: "Saknar elementet #root"
  },
  chrome: {
    language: "Språk",
    light: "Ljust",
    dark: "Mörkt",
    lightTitle: "Använd en ljus sida",
    darkTitle: "Använd en mörk sida"
  },
  appBar: {
    nav: "Filer",
    newManuscript: "Nytt manuskript…",
    viewAll: "Visa alla manuskript",
    goHome: "Gå till alla manuskript",
    importBackupItem: "Importera en backup…",
    importManuscriptItem: "Importera en textfil…",
    loadSampleManuscriptItem: "Läs in exempelmanuskript…",
    importCodexItem: "Importera en Codex-bok…"
  },
  companionApps: {
    nav: "Dina kreativa appar",
    openApp: "Öppna {name}",
    appInfo: "Information och adress för {name}",
    aboutApp: "Om {name}",
    addressLabel: "App-adress",
    statusAvailable: "Appen körs och är redo att öppnas.",
    statusUnreachable: "Appen kan inte nås. Den kan vara installerad men inte igång. Starta den och försök igen.",
    statusWrongApp: "En annan tjänst svarade på den här adressen. Kontrollera appens adress och försök igen.",
    statusUnknown: "Automatiska kontroller finns bara i skrivbordsappen. Du kan fortfarande öppna adressen själv.",
    checking: "Kontrollerar appen…",
    tryAgain: "Försök igen",
    saveAddress: "Spara adress",
    openAppAction: "Öppna appen ↗",
    getApp: "Hämta appen och installationsguiden ↗",
    invalidAddress: "Använd en HTTP- eller HTTPS-adress utan inloggningsuppgifter."
  },
  home: {
    headline: "Skriv prosan.",
    truth: "Story Bible håller sanning.",
    lede: "Ett lokalt manusverktyg där du bestämmer.",
    newManuscript: "Starta nytt manus",
    newManuscriptCardLede: "Ge det en titel, väx sedan historien i Brainstorm — modellen skriver utkast till kapitlen, du bestämmer.",
    titlePlaceholder: "Titel",
    open: "Skapa",
    importCodexBookTitle: "Importera en bok från kaampi Codex",
    importCodexBookLede:
      "Varje manus kaampi Codex har en privat backup av, som inte redan finns i den här installationen. Att välja ett tar in det med sin egen ursprungliga historik - kapitel, Story Bible, allt - precis som Codex senast såg det.",
    importCodexBookLoading: "Kollar kaampi Codex…",
    importCodexBookEmpty: "Inget att importera - antingen har kaampi Codex inga privata backuper, eller så finns de redan alla i den här installationen.",
    importCodexBookImport: "Importera",
    importCodexBookImporting: "Importerar…",
    guideCardLede: "Osäker på var du ska börja? Guiden går igenom varje del av appen.",
    guideCardAction: "Öppna Guiden",
    mascotIntroText:
      "Det här är Kaamilla, din assistent. Hon dyker upp då och då med tips och info. Du kan stänga av henne i Inställningar, eller byta till Kaamy eller Kaambot där.",
    mascotIntroUnderstood: "Förstått",
    codexCard: "kaampi Codex",
    codexConnected: "Ansluten — säkerhetskopior och delning med dina andra kaampi-appar är på.",
    codexOffline: "Parkopplad, men går inte att nå just nu. Ditt arbete sparas fortsatt lokalt.",
    codexCardLede: "Inte ansluten än. Klistra in parkopplingsnyckeln från kaampi Codex första-gången-skärm, eller lämna det här — helt valfritt.",
    codexDesktopOnly: "Koppling till kaampi Codex går bara att göra i skrivbordsappen, inte här i webbläsaren.",
    codexTokenPlaceholder: "Parkopplingsnyckel",
    codexConnectAction: "Anslut",
    codexConnecting: "Ansluter…",
    startHeading: "Var vill du börja?",
    importManuscriptTitle: "Importera ett manus (textfil)",
    importManuscriptLede:
      "Startar ett helt nytt manus från en vanlig text- eller Markdown-fil — en export från ett annat skrivverktyg, eller bara en .txt/.md-fil du redan har. Delar upp på rubriker till kapitel (text utan rubriker blir ett enda kapitel), och omvandlar *kursiv*/**fet**-markörer till riktig formatering, precis som Verktyg → Konvertera markörer till formatering.",
    importManuscriptContact:
      "Jobbar du i ett verktyg som inte exporterar vanlig text eller Markdown? Hör av dig och dela en exportfil — vi kan undersöka om vi kan bygga stöd för den.",
    importManuscriptBookTitle: "Manusets titel",
    importManuscriptBookTitlePlaceholder: "Titel",
    importManuscriptUpload: "Ladda upp en fil…",
    importManuscriptText: "Eller klistra in den exporterade texten",
    importManuscriptTextPlaceholder: "Klistra in en Markdown-export här, eller ladda upp en fil ovan…",
    importManuscriptLevelLabel: "Vilken rubriknivå markerar ett nytt kapitel?",
    importManuscriptLevelOption: "{hashes} ({count} hittade)",
    importManuscriptFoundCount: "Hittade {count}.",
    importManuscriptChaptersCount: { one: "{count} kapitel", other: "{count} kapitel" },
    importManuscriptUntitledChapter: "Kapitel {n}",
    importManuscriptAction: "Importera",
    shelf: "Manus",
    shelfHeading: "Dina manus",
    listView: "Listvy",
    shelfView: "Hyllvy",
    shelfOpen: "Öppna",
    seriesTag: "Serie: {series}",
    searchPlaceholder: "Sök manus…",
    noSearchResults: "Inga manus matchar sökningen.",
    emptyShelf: "Inga manus ännu. En titel räcker för att börja.",
    delete: "Radera",
    deleteConfirm: "Radera “{title}”? Det går inte att ångra.",
    replaceConfirm: "Ersätt “{title}” med den här säkerhetskopian? Allt som skrivits sedan den filen går förlorat.",
    languageVersionUnset: "Namnlöst språk",
    chapters: { one: "{count} kapitel", other: "{count} kapitel" },
    facts: { one: "{count} låst faktum", other: "{count} låsta fakta" },
    connectFound: { one: "Ansluten — {count} modell hittad.", other: "Ansluten — {count} modeller hittade." },
    connectNotFound:
      "Inte ansluten än. Har du ingen lokal AI-server? Vi rekommenderar Ollama — gratis, från ollama.com. Installera en modell (sök på ”stheno” för en anpassad för skönlitteratur, eller vilken vanlig chattmodell som helst, t.ex. llama3), så dyker den upp här automatiskt.",
    desktopInstallOllama: "Installera Ollama",
    desktopGpuSuggestion: "Baserat på grafikkortets minne (~{gb} GB) klarar den här datorn troligen {tier}.",
    desktopGpuTier3b: "en liten modell, ungefär 3 miljarder parametrar (4-bit)",
    desktopGpuTier7b: "en modell på ungefär 7-8 miljarder parametrar (4-bit)",
    desktopGpuTier14b: "en modell på ungefär 13-14 miljarder parametrar (4-bit)",
    desktopGpuTier30b: "en modell på ungefär 30-34 miljarder parametrar (4-bit)",
    desktopGpuTier70b: "en stor modell, 70 miljarder parametrar eller mer (4-bit)",
    desktopCheckUpdate: "Kolla efter uppdateringar",
    desktopCheckingUpdate: "Letar efter uppdateringar…",
    desktopUpdateAvailableShort: "Uppdatering tillgänglig",
    desktopUpdateAvailable: "En ny version finns ({latest}, du har {current}).",
    desktopViewChangelog: "Visa ändringslogg",
    desktopDownloadUpdate: "Ladda ner uppdatering",
    desktopUpToDate: "Du har den senaste versionen ({current}).",
    desktopUpdateCheckFailed: "Kunde inte kolla efter uppdateringar: {error}"
  },
  series: {
    heading: "Dina serier",
    newSeries: "+ Ny serie",
    newSeriesTitlePlaceholder: "Seriens titel",
    create: "Skapa",
    open: "Öppna serien →",
    books: { one: "{count} bok", other: "{count} böcker" },
    facts: { one: "{count} låst faktum", other: "{count} låsta fakta" },
    newBookInSeries: "+ Ny bok i den här serien",
    assignLabel: "Serie",
    assignNone: "— Fristående —",
    backToShelf: "← Till hyllan",
    titleLabel: "Seriens titel",
    booksHeading: "Böcker i den här serien",
    noBooksYet: "Inga böcker i den här serien än.",
    removeFromSeries: "Ta bort från serien",
    removeFromSeriesTitle: "Gör boken fristående igen — dess egna låsta fakta finns kvar, den slutar bara ärva serie-canon.",
    removeFromSeriesConfirm: "Ta bort \"{title}\" från den här serien? Den blir fristående igen — dess egna fakta finns kvar, men den slutar ärva serie-canon.",
    deleteSeries: "Ta bort serien",
    deleteConfirm: 'Ta bort serien "{title}"? Böckerna i den finns kvar — de slutar bara tillhöra en serie.',
    deleteBlocked: "Flytta ut böckerna först (eller ta bort dem) för att kunna ta bort den här serien.",
    notFound: "Den serien finns inte längre.",
    unreadable: "Den serien gick inte att läsa.",
    tabs: { brainstorm: "Brainstorm", synopsis: "Synopsis", bible: "Story Bible", books: "Böcker" },
    brainstormLede: "Privat skissyta för seriens egen värld — delas inte med någon boks egen Brainstorm, och Draft läser aldrig det här direkt. Lyft det som håller till Synopsis när du är redo.",
    brainstormPlaceholder: "Skissa världen här — historia, fraktioner, hur magi fungerar, vad serien än behöver innan någon bok börjar…",
    liftToSynopsis: "Lyft till Synopsis →",
    synopsisLede: "En kortfattad presentation av seriens värld — en skrivkarta för dess egna fakta, inte låst sanning i sig. Extrahera fakta ur den när den är redo; inget låses in direkt, allt hamnar i granskningskön nedan.",
    synopsisPlaceholder: "Sammanfatta seriens värld i några stycken…",
    extractFacts: "Extrahera fakta",
    extracting: "Extraherar…",
    lockedFactsHeading: "Seriens kanon",
    noFactsYet: "Inga låsta fakta än — skriv en synopsis och extrahera ur den, eller lägg till ett för hand nedan.",
    addFact: "Lägg till ett faktum för hand",
    entityNamePlaceholder: "Entitetens namn (t.ex. \"Luke Skywalker\")",
    establishedIn: "Etablerad i: {book}",
    establishedInChapter: "Etablerad i: {book}, {chapter}",
    sendToSeries: "Skicka till serien",
    conflictTitle: "Skiljer sig från serien",
    conflictBody: 'Serien säger {predicate}: "{seriesValue}" — den här boken skulle nu säga något annat. Inget annat ändras; serien behåller sitt eget värde tills du skickar upp det här också.',
    conflictLockAnyway: "Lås ändå",
    consistencyHeading: "Konsistenskontroll",
    consistencyCheck: "Kontrollera konsistens",
    consistencyChecking: "Kontrollerar…",
    consistencyLede: "Jämför varje låst faktum i hela serien och alla dess böcker, letar efter påståenden ingen stämt av mot varandra — inte bara det du redan fått en varning om medan du skrev.",
    consistencyNone: "Inga motsägelser hittades.",
    historyHeading: "Historia & beskrivning",
    historyPlaceholder: "Skriv den här entitetens historia lika fritt som en wiki-artikel — inte en lista med fakta, berättelsen om vem eller vad de är…",
    historyHint: "För dig — skickas aldrig till Draft som den är. Bara det du extraherar ur den nedan blir kanon.",
    extractFromHistory: "Extrahera fakta ur den här texten",
    whatDraftSees: "det här ser Draft",
    imagesNote: "Bilder är bara visuell referens — skickas aldrig till Draft som textkontext.",
    searchPlaceholder: "Sök serier…",
    noSearchResults: "Inga serier matchar din sökning.",
    previousBook: "Föregående bok",
    nextBook: "Nästa bok",
    detailWords: "{words} ord, ~{pages} sidor",
    detailFacts: "{own} / {cumulative} låsta fakta",
    timelineLabel: "Serietidslinje",
    timelineLede: "Ordningen böckerna händer i berättelsen — inte ordningen du skrev dem i. En läshjälp för dig; ändrar inte vad Draft ser ännu.",
    timelineReordered: "Omordnad",
    timelineMoveEarlier: "Flytta tidigare",
    timelineMoveLater: "Flytta senare",
    synopsisHeading: "Synopsis",
    detailNoSynopsis: "Ingen synopsis än — skriv en i serie-arbetsytan.",
    detailOpenBook: "Öppna den här boken",
    detailOpenWorkspace: "Öppna serie-arbetsytan →"
  },
  shelfEdit: {
    settingsLabel: "Redigera hyllkort",
    title: "Hyllkort",
    coverLabel: "Omslag",
    addCover: "Lägg till ett omslag",
    replaceCover: "Byt ut",
    removeCover: "Ta bort",
    authorLabel: "Författarnamn",
    authorPlaceholder: "kaampi Write",
    colorLabel: "Ryggfärg",
    heightLabel: "Höjd",
    heightValue: "{sign}{percent}%",
    descriptionLabel: "Beskrivning",
    descriptionPlaceholder: "En kort rad till hyllkortet…"
  },
  editor: {
    manuscriptTitle: "Manustitel",
    writing: "Skrivande",
    primer: "Startprompt",
    primerTitle: "Startprompt för den här skrivmodellen",
    primerLede: "Den går ut före varje skrivjobb. Kapitlets regler följer ändå. Tom betyder bara de reglerna.",
    primerRestore: "Använd startprompten",
    primerAria: "Startprompt för {model}",
    polishPromptLabel: "Polish-instruktioner",
    polishPromptLede:
      "Vad Polish-steget ber modellen göra — en hårdhänt redaktörsomgång som default. Ändra fritt efter vad som passar ditt manus; Polish visar alltid en diff att granska innan något sparas.",
    polishPromptRestore: "Återställ till standard",
    polishPromptAria: "Polish-instruktioner",
    review: "Granskning",
    translateModelLabel: "Översättning",
    translateModelFollowWriting: "Använd skrivmodellen",
    languageSwitcherOriginal: "Original",
    languageSwitcherCurrentHint: "Detta manus språk",
    languageSwitcherNew: "Ny språkversion…",
    languageSwitcherNewPlaceholder: "Språk, t.ex. Svenska",
    languageSwitcherAdd: "Skapa",
    translationStatusLoading: "Kontrollerar källkapitlet…",
    translationStatusOrphaned: "Källkapitlet detta översattes från finns inte längre.",
    translationStatusUntranslated: "Inte översatt än",
    translationStatusStale: "Källan har ändrats sedan detta översattes",
    translationStatusCurrent: "Uppdaterad mot källan",
    translationStatusShowDiff: "Visa vad som ändrats",
    translationStatusHideDiff: "Dölj vad som ändrats",
    translationStatusSnapshotLabel: "Senast översatt från",
    translationStatusLiveSourceLabel: "Källan nu",
    translateChapterAction: "Översätt kapitel",
    retranslateChapterAction: "Översätt om kapitel",
    noModels: "Inga lokala modeller hittades",
    backup: "Säkerhetskopia",
    backupDue: "! Säkerhetskopia",
    backupDueTitle: "Manuset har ändrats sedan senaste JSON-säkerhetskopian",
    backupTitle: "Säkerhetskopia",
    appExport: "Exportera för andra appar",
    appExportTitle: "Ladda ner en kaampi Codex-export av manuset — låsta Story Bible-fakta och kapitel, till för att en syskonapp som kaampi Comic ska kunna importera. En ögonblicksbild, ingen levande koppling.",
    publish: "Publicera",
    archiveNav: "Arkiv",
    toolsNav: "Verktyg",
    codexNav: "Codex",
    settings: "Manusinställningar",
    settingsLede:
      "Hur det här manuset skrivs. Inte Story Bible. Kapitlen kan fortfarande överstyra kamera, röst och Läsare.",
    appSettings: "Inställningar",
    appSettingsLede:
      "Gäller hela appen, inte ett enskilt manus: vilken AI-server som används, skrivprimer, hur många versioner som sparas, och redigerarens pappersfärg.",
    editorSettingsHeading: "Redigerare",
    proofreadHeading: "Korrekturläsning",
    generalHeading: "Allmänt",
    typographyHeading: "Typografi",
    sceneBreakHeading: "Scenbrytare",
    illustrationsHeading: "Illustrationer",
    proseLanguage: "Prosans språk",
    proseLanguagePlaceholder: "t.ex. engelska",
    proseLanguageTitle: "Språket meningarna skrivs på. Tomt gissar från manuset. En skrivinstruktion, inte kanon.",
    modelsHeading: "AI-inställningar",
    aiFreeModeLabel: "AI-fritt läge",
    aiFreeModeHint:
      "Gråar ut varje verktyg som kräver AI (utkast, omskrivning, analys, intervjuer…) istället för att dölja dem. Skrivande, kapitel, Story Bible och export fungerar alltid utan AI oavsett denna inställning — den här stänger bara av AI-verktygen ovanpå, även om en lokal AI är ansluten.",
    aiFreeModeDisabledHint: "Avstängt i AI-fritt läge (Settings).",
    engineLabel: "Motor",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / annan lokal server",
    engineLede: "Inga molntjänster eller konton, aldrig — bara en server som körs på den här datorn eller ditt lokala nätverk.",
    baseUrlLabel: "Serveradress",
    baseUrlLede: "Lämna tomt för att använda den här datorns egen standardadress. För att nå en server på en annan maskin i ditt lokala nätverk istället — Ollama, LM Studio eller en annan lokal server som llama.cpp — ange dess nätverksadress här, t.ex. http://192.168.1.50:11434.",
    connectionPresetsCurrentLabel: "Nuvarande anslutning",
    connectionPresetActive: "Aktiv",
    connectionPresetUpdate: "Uppdatera",
    connectionPresetNew: "+ Ny modell",
    connectionPresetDelete: "Ta bort",
    connectionPresetDeleteConfirm: "Ta bort “{name}”? Det går inte att ångra.",
    connectionPresetNameLabel: "Namn på anslutning",
    contextWindowLabel: "Kontextfönster",
    contextWindowLede: "Hur mycket text modellen får veta att den faktiskt får titta på. Ollamas eget standardvärde är ofta mycket mindre än vad din modell och dator egentligen klarar, vilket kan göra att Draft tappar bort detaljer som skrevs bara ett stycke eller två tillbaka. Ett högre tal kräver mer minne (RAM/VRAM) — sänk det om genereringen blir mycket långsam eller misslyckas.",
    contextWindowSuggest: "Föreslå från modellen",
    contextWindowSuggesting: "Kontrollerar…",
    contextWindowSuggested: "Satt till {value}, modellens egna rapporterade maxvärde.",
    contextWindowSuggestError: "Kunde inte hämta det här från modellen — ange det för hand.",
    contextWindowOpenAiNote: "För LM Studio och andra OpenAI-kompatibla servrar sätts kontextlängden när du laddar modellen där, inte här.",
    proofreadThoroughnessLabel: "Korrekturläsningens grundlighet",
    proofreadThoroughnessLede:
      "Hur hårt Korrekturläsningens Scener-steg letar efter upprepade scener — fler kandidatpar ger en mer grundlig sökning men fler modellanrop, alltså en längre körning. Style-stegets egen textsampling (hur mycket av varje kapitel det läser efter ett register-/känsloglapp) skalar redan på egen hand från Context window ovan; det här gäller specifikt Scener-stegets antal anrop, där Context window inte är en bra måttstock.",
    proofreadThoroughnessFast: "Snabb — färre kandidater, snabbare körning",
    proofreadThoroughnessBalanced: "Balanserad (standard)",
    proofreadThoroughnessThorough: "Grundlig — fler kandidater, långsammare körning",
    filterLoreLabel: "Visa bara relevant lore för Skriv utkast",
    filterLoreLede: "Avstängt som standard. Lore-fakta (importerade, inte skrivna i ett kapitel) tas annars alltid med, oavsett om kapitlet faktiskt handlar om dem. Slå på det här om din Story Bible har mycket importerad lore och prompten börjar bli för stor — då tas bara lore vars namn (eller, för Händelser, en deltagare eller plats) nämns i kapitlets brief eller text hittills. Pinna en enskild lore-fakta för att alltid ta med den oavsett, med samma knapp som redan finns i Story Bible.",
    historyLimit: "Versioner",
    historyLimitLede:
      "Hur många tidigare versioner av ett kapitel som sparas, från Skriv utkast, Omskriv, Förläng, Utveckla och Skriv om. Så fort gränsen nås försvinner den äldsta versionen först. Det du skriver själv för hand sparas inte som en egen version — bara de här åtgärderna gör det.",
    paperLabel: "Pappersyta",
    paperLede:
      "Själva skrivytans bakgrund och textfärg, separat från appens mörka/ljusa tema — så du kan ha mörkt tema överallt annars men skriva på en ljusare sida. Gäller hela appen, inte bara det här manuset.",
    paperOptions: {
      default: "Följ temat",
      warm: "Varm vit",
      sepia: "Sepia",
      gray: "Mjuk grå",
      dark: "Mörk"
    },
    spellcheckLabel: "Stavningskontroll",
    spellcheckHint:
      "De röda understrykningarna i skrivbordsappen är operativsystemets egen stavningskontroll, inte något appen själv kör — att stänga av den här talar bara om för fönstret att inte fråga efter den. Gäller hela appen, inte bara det här manuset.",
    mascotLabel: "Maskot",
    mascotLede:
      "En följeslagare som dyker upp med tips då och då, som att peka ut Guiden på en ny startsida. Välj en nedan, eller låt den vara av — du kan ändra dig när som helst. Gäller hela appen, inte bara det här manuset.",
    mascotOptions: {
      none: "Av",
      kaamilla: "Kaamilla",
      kaamy: "Kaamy",
      kaambot: "Kaambot"
    },
    assistantHeading: "Assistent",
    dropCapLabel: "Anfang",
    dropCapLede:
      "En stor begynnelsebokstav på varje kapitels första stycke, som sträcker sig över valt antal rader. Visas direkt i skrivytan och följer med till Publish-export (HTML, ePub, RTF, ODT; PDF inte än).",
    dropCapOff: "Av",
    dropCapLines: "{n} rader",
    sceneBreakLabel: "Stil",
    sceneBreakLede:
      "Dekoration för en scenbrytare (ett eget `---`-stycke) — en uttonande linje med en centrerad symbol istället för en enkel kort linje. Visas direkt i skrivytan och följer med till Publish-export, med förenklade varianter i format som inte klarar en riktig uttoning (ODT, RTF) eller själva symbolen (PDF ritar en form istället för tecknet).",
    sceneBreakPlain: "Enkel (dagens korta linje)",
    sceneBreakVignette: "Klassisk bokvinjett (❦)",
    sceneBreakDiamond: "Minimalistisk diamant (❖)",
    sceneBreakFleur: "Fransk elegans (⚜)",
    sceneBreakSparkle: "Glimmer / stjärna (✦)",
    sceneBreakWidthLabel: "Bredd",
    sceneBreakWidthLede:
      "Hur bred scenbrytarens linje blir, som en skalning ovanpå den valda stilens egen bredd — en smalare diamant och en smalare vinjett behåller samma proportioner mot varandra som de alltid haft. Visas direkt i skrivytan och följer med till Publish-exporterna HTML, ePub och PDF (RTF, ODT och IDML ritar scenbrytare som en enkel centrerad symbol utan någon linje alls, så bredden har inget att skala där).",
    sceneBreakWidthNarrow: "Smal",
    sceneBreakWidthDefault: "Standard",
    sceneBreakWidthWide: "Bred",
    sceneBreakSpacingLabel: "Mellanrum",
    sceneBreakSpacingLede:
      "Utrymmet ovanför och under scenbrytarens linje, som en skalning ovanpå den valda stilens egna mellanrum. Visas direkt i skrivytan och följer med till Publish-exporterna HTML, ePub och PDF (RTF, ODT och IDML påverkas inte, av samma skäl som Bredd ovan).",
    sceneBreakSpacingTight: "Snäv",
    sceneBreakSpacingDefault: "Standard",
    sceneBreakSpacingLoose: "Rymlig",
    pageSizeLabel: "Sidstorlek",
    pageSizeLede:
      "Sidmåtten för varje exportformat med en riktig tryckt sida — IDML, PDF och ODT (RTF och HTML/ePub flödar fritt utan fast sida). Skalar också ungefär skrivytans egen bredd efter samma proportioner — ingen riktig sidindelning, skrivytan rullar fortfarande som en enda sammanhängande kolumn; riktig sida-för-sida-layout sker i Publish-exporterna och, för IDML, till slut i InDesign eller Affinity.",
    pageSizeA4: "A4",
    pageSizeLetter: "US Letter",
    pageSize6x9: "6 × 9 tum (pocketbok/trade)",
    pageSizePocket: "Pocket / A-pocket (110 × 180 mm)",
    pageSizeStorpocket: "Storpocket / Författarpocket (135 × 210 mm)",
    pageSizeA5: "A5 (148 × 210 mm)",
    pageSizeS5: "S5 / Mellanformat (165 × 242 mm)",
    pageMarginLabel: "Sidmarginal",
    pageMarginLede: "Marginal på alla fyra sidor, för samma tre format som Sidstorlek.",
    pageMarginNarrow: "Smal (0,5 tum)",
    pageMarginNormal: "Normal (0,75 tum)",
    pageMarginWide: "Bred (1 tum)",
    editorBackgroundLabel: "Bakgrund i redigeraren",
    editorBackgroundLede:
      "En dekorativ bakgrund bakom kapitelkortet och textsidan — bara i redigeraren, påverkar aldrig Publish-exporter som saknar en sådan duk. Själva textytorna förblir alltid helt solida, så bilden behöver aldrig kontrollkontrasteras mot din text.",
    editorBackgroundNone: "Ingen (vanlig panel)",
    editorBackgroundForest: "Dimmig skog",
    editorBackgroundMilkyWay: "Vintergatan",
    editorBackgroundCork: "Korkbräda",
    editorBackgroundTriangles: "Trianglar",
    editorBackgroundFabric: "Tyg",
    editorBackgroundSchool: "Skolklotter",
    editorBackgroundPine: "Granar",
    editorBackgroundLeaves: "Löv",
    bodyFontLabel: "Typsnitt",
    bodyFontLede:
      "Typsnittet för manusets brödtext — i själva redigeraren, och med i varje export från Publish, så det blir ett val istället för ett separat, osparat val varje gång.",
    fontCategorySerif: "Serif",
    fontCategorySans: "Sans serif",
    bodyWeightLabel: "Vikt",
    bodyWeightLede:
      "Hur tung manusets brödtext ligger på sidan — i själva redigeraren, och med i varje export från Publish, precis som Font. Bara Normal och Fet eftersom det är vad varje bundlat typsnitt faktiskt levererar.",
    bodyWeightRegular: "Normal",
    bodyWeightBold: "Fet",
    bodyColorDarkLabel: "Färg (mörkt läge)",
    bodyColorLightLabel: "Färg (ljust läge)",
    bodyColorLede:
      "Manusets textfärg — en för appens mörka tema, en för ljust, så den förblir läsbar och medveten i båda istället för en färg vald för vilket tema man råkade vara i. Publish-exporter använder alltid färgen för ljust läge — en statisk sida har inget eget temaval, samma princip (mörk text på ljus sida) som alla exporter redan hade innan den här inställningen fanns.",
    uiLanguageStays: "Sidans språk ligger kvar i headern.",
    brainstorm: "Brainstorm",
    synopsis: "Synopsis",
    briefs: "Dispositioner",
    briefsLede:
      "Varje kort är ett kapitel. Dra ett kort så följer det med, och de andra glider undan. Dubbelklicka på en titel för att skriva kapitlet.",
    reorderBriefs: "Kapiteldispositioner. Dra för att byta ordning.",
    openChapter: "Skriv {title}",
    chapters: "Kapitel",
    add: "Lägg till",
    untitled: "Namnlöst",
    removeChapter: "Radera {title}",
    removeChapterFallback: "kapitel",
    discardChapterConfirm: "Flytta “{title}” till Borttagna kapitel?",
    discardedChapters: "Borttagna kapitel",
    restoreChapter: "Återställ {title}",
    restoreDiscarded: "Återställ",
    throwAwayChapter: "Kasta {title}",
    throwAwayConfirm: "Kasta “{title}” för gott? Kapitlet försvinner. Det går inte att ångra.",
    chapterFactsNote: {
      one: "{count} faktum i Story Bible kommer från det här kapitlet. Det tas inte bort eller ändras automatiskt — kolla Story Bible om du vill uppdatera eller ta bort det för hand.",
      other: "{count} fakta i Story Bible kommer från det här kapitlet. De tas inte bort eller ändras automatiskt — kolla Story Bible om du vill uppdatera eller ta bort dem för hand."
    },
    reorderChapters: "Kapitel. Dra för att ändra ordningen.",
    showBrief: "Visa disposition för {title}",
    hideBrief: "Dölj disposition för {title}",
    continuesCleared:
      "{title} fortsätter inte längre från “{from}”, för det kapitlet kommer senare. Nu följer det föregående i listan.",
    voice: "Författarröst",
    voicePlaceholder: "Ton, rytm, ordval",
    chapterVoiceInherit: "Manusets röst",
    manuscript: "Manus",
    brief: "Disposition",
    briefPlaceholder: "Vad kapitlet måste göra. En skrivinstruktion, inte kanon.",
    chapterTitle: "Kapitelrubrik",
    chapterBrief: "Kapiteldisposition",
    chapterVoice: "Kapitlets författarröst",
    voiceCue: "Författarröst",
    reader: "Läsare",
    readerTitle: "Vem texten skrivs för. Välj den åldersgrupp som stämmer bäst — Vuxen skriver utan åldersgränser i åtanke.",
    readerTierHint:
      "Kapitel som skrivs för den här läsaren får kortare meningar och enklare ord, anpassat efter åldersgruppen. Korrekturläsningen flaggar dessutom svordomar, våld eller explicit innehåll som inte passar den åldern.",
    readerCategories: {
      board: "Pekbok (upp till 3 år)",
      early: "Lättläst (4–7 år)",
      chapter: "Kapitelbok (8–9 år)",
      middle: "Mellanålder (10–12 år)",
      ya: "Ungdom (13–17 år)",
      adult: "Vuxen"
    },
    chapterReader: "Kapitlets läsare",
    chapterSettingsToggle: "Kapitlets inställningar",
    chapterSettingsFor: "Inställningar för {title}",
    scenesFor: "Scener för {title}",
    scenesPopoverTitle: "Scener",
    chapterReaderInheritOption: "Samma som manuset — {category}",
    readerCue: "Läsare",
    placeholdersCue: "Har en platshållare att återkomma till",
    newStrand: "ny tråd",
    startChapter: "Börja kapitel {n}",
    draft: "Skriv utkast",
    extract: "Extrahera fakta",
    extracting: "Extraherar…",
    analyze: "Analysera",
    critics: "Kritiker",
    askPassage: "Fråga om kapitlet…",
    proofread: "Korrekturläsning",
    notes: "Anteckningar",
    history: "Historik",
    recast: "Omskriv prosan",
    recasting: "Omskriver…",
    recastTitle: "Omskriv kapitlet till nuvarande perspektiv, tempus och synvinkel",
    polish: "Polish",
    polishTitle: "Kör en städomgång på kapitlet, granska ändringarna innan de sparas",
    stop: "Stopp",
    brainstormChat: "Bolla idéer…",
    openSynopsis: "Öppna synopsis",
    maximize: "Maximera",
    restore: "Återställ",
    maximizeTitle: "Dölj paneler och skriv",
    restoreTitle: "Visa paneler (Esc)",
    pinPanel: "Nåla fast panelen",
    unpinPanel: "Dölj panelen automatiskt — för muspekaren mot kanten för att ta fram den igen",
    resizePanel: "Dra för att ändra panelens bredd",
    brainstormLede:
      "Privat kladd. En lapp per idé. Dra dem fritt — det finns ingen ordning än. När en lapp är redo drar du den till kolumnen Till synopsis till höger.",
    brainstormPlaceholder: "En idé…",
    synopsisLede:
      "Berättelsen i kortform: vem som är med, vad som händer, och var den landar. Utkast utgår alltid från den här sammanfattningen — men inget blir bindande förrän du låser det som fakta.",
    synopsisPlaceholder: "Berättelsen i några meningar.",
    chapterPlaceholder: "Kapitlet lever här. Skriv utkast, skriv om tills det är ditt.",
    chapterImageAdd: "Lägg till kapitelbild",
    chapterImageReplace: "Byt bild",
    chapterImageRemove: "Ta bort bild",
    instructTitle: "Ändra den här noten",
    instructHint: "Säg åt modellen vad den ska göra med den markerade noten. Bara det spannet byts ut.",
    instructPlaceholder: "Vad ska ändras?",
    instructAction: "Skriv om",
    addNote: "Ny lapp",
    removeNote: "Ta bort lapp",
    removeNoteConfirm: "Kasta den här lappen?",
    noteLabel: "Brainstorm-lapp",
    reorderNotes: "Dra för att flytta lappen",
    resizeNote: "Dra för att skala om lappen",
    noteColor: "Lappens färg",
    noteColors: {
      paper: "Papper",
      rust: "Rost",
      sage: "Salvia",
      gold: "Guld",
      lilac: "Lila"
    },
    sendLane: "Till synopsis",
    sendLaneLede: "Släpp lappar här. Ordningen i kolumnen är ordningen de landar som stycken.",
    sendLaneEmpty: "Släpp lappar här",
    sendToSynopsis: "Skicka till synopsis",
    extractNoteFacts: "Plocka ut fakta",
    extractNoteFactsHint: "Hitta möjliga Story Bible-fakta i den här lappen. De hamnar i granskningskön som kandidater — inget blir kanon förrän du låser det.",
    extractSynopsisFacts: "Plocka ut fakta",
    extractSynopsisFactsHint: "Hitta möjliga Story Bible-fakta i det här synopsiset. De hamnar i granskningskön som kandidater — inget blir kanon förrän du låser det.",
    extractBriefFacts: "Plocka ut fakta",
    extractBriefFactsHint: "Hitta möjliga Story Bible-fakta i den här brief:en. De hamnar i granskningskön som kandidater — inget blir kanon förrän du låser det.",
    chapterSummary: "Kapitelsammanfattning",
    summaryPlaceholder: "",
    summarizeChapterAction: "Sammanfatta",
    summarizeChapterHint: "En kort sammanfattning av vad som händer i det här kapitlet, så att senare kapitels Skriv utkast/Fortsätt/Utveckla/Beat kan se det utan att behöva hela kapitlets text. Föreslås nedan för att du ska godkänna eller avvisa — sparas aldrig förrän du väljer.",
    summarizing: "Sammanfattar…",
    summarizeSuggestionLabel: "Föreslagen sammanfattning",
    applySummarySuggestion: "Använd den",
    rejectSummarySuggestion: "Avvisa"
  },
  backup: {
    title: "Säkerhetskopia",
    body: "En JSON-kopia som appen kan läsa tillbaka. Importera backup på hyllan återställer den. Allt som skrivits sedan den filen går förlorat.",
    downloadHint: "Om ingen spara-dialog visas, kontrollera Hämtade filer. I Brave kan du aktivera ”Fråga var varje fil ska sparas före nedladdning” under Inställningar → Nedladdningar för att välja plats vid vanliga nedladdningar.",
    saveError: "Kunde inte spara säkerhetskopian. Försök igen.",
    whatHappened: "Historik",
    whatHappenedPlaceholder: "Valfritt. Omskriv kapitel 2, ny författarröst på 3.",
    documentName: "Dokumentnamn",
    action: "Säkerhetskopia",
    sendToCore: "Skicka till kaampi Codex",
    sendToCoreHint: "Sparar en privat version av manuset i din parkopplade kaampi Codex, utöver JSON-filen.",
    sendToCoreSending: "Skickar…",
    sendToCoreDone: "Sparat i kaampi Codex.",
    sendToCoreError: "Kunde inte nå kaampi Codex just nu. Sparas lokalt och skickas automatiskt när anslutningen är tillbaka.",
    errors: {
      "not-backup": "Den filen är inte en manussäkerhetskopia.",
      "sandbox-export": "Den filen är en kartexport från kaampi Explore. Importera den i kaampi Explore, inte här.",
      "not-manuscript": "Den filen är inte en kaampi Write-manussäkerhetskopia.",
      "newer-format": "Den här säkerhetskopian kommer från en nyare kaampi Write. Uppdatera appen och försök igen.",
      unreadable: "Manuset i filen gick inte att läsa."
    }
  },
  illustration: {
    fieldLabel: "Illustrationsstil",
    browseLibrary: "Bläddra i biblioteket…",
    libraryTitle: "Illustrationsstilar",
    searchPlaceholder: "Sök stilar…",
    searchResults: "Sökresultat",
    saveCurrentAsNew: "Spara nuvarande text som ny stil",
    select: "Använd den här stilen",
    edit: "Ändra",
    delete: "Ta bort",
    untagged: "Otaggade",
    noResults: "Inga stilar matchar.",
    newStyleTitle: "Ny stil",
    editStyleTitle: "Ändra stil",
    nameLabel: "Namn",
    promptTextLabel: "Prompttext",
    genreTagsLabel: "Genretaggar",
    genreTagsPlaceholder: "Kommaseparerat, t.ex. Fantasy, Äventyr",
    exampleImageLabel: "Exempelbild",
    uploadImage: "Ladda upp bild",
    replaceImage: "Byt bild",
    removeImage: "Ta bort bild",
    deleteConfirm: "Ta bort “{name}” från biblioteket? Det går inte att ångra.",
    promptTitle: "Illustrationsprompt",
    promptHint: "Genererad från stycket, låsta Story Bible-fakta och manusets illustrationsstil.",
    generating: "Genererar…",
    generateError: "Kunde inte generera en prompt den här gången.",
    viewFullImage: "Visa bilden i full storlek",
    noStyleSelected: "Ingen stil vald",
    customStyleLabel: "Egen prompt",
    editTextManually: "Redigera texten manuellt",
    hideManualEdit: "Dölj manuell text",
    orientationLabel: "Illustrationsformat",
    orientations: {
      landscape: "Liggande",
      portrait: "Stående"
    }
  },
  aiContext: {
    trigger: "Visa AI-kontext…",
    title: "AI-kontext",
    hint: "Exakt vad som skickades till modellen för det senaste jobbet, inklusive det som uteslöts.",
    empty: "Inget AI-jobb har körts än den här sessionen. Kör ett skriv- eller granskningsjobb och kom sedan tillbaka hit.",
    operation: "Jobb",
    model: "Modell",
    tokensEstimate: "~{n} tokens (grov uppskattning)",
    systemInstructions: "Systeminstruktion",
    whatWasSent: "Det som skickades",
    whatCameBack: "Vad modellen svarade (rått, oredigerat)",
    target: {
      prose: "kapitel",
      synopsis: "synopsis",
      brainstorm: "brainstorm-lapp"
    },
    operations: {
      draft: "Skriv utkast",
      recast: "Recast",
      polish: "Polish",
      extend: "Fortsätt",
      elaborate: "Utveckla",
      instruct: "Skriv om",
      "brainstorm-chat": "Brainstorm-chatt",
      "word-swap": "Ordalternativ",
      "sentence-split": "Meningsbrytning",
      "paragraph-break": "Styckebrytning",
      extract: "Extrahera fakta",
      analyze: "Analysera",
      critics: "Kritiker",
      illustrate: "Illustrationsprompt",
      proofread: "Korrekturläsning",
      "ask-manuscript": "Fråga manuset",
      "ask-passage": "Fråga om passage",
      interview: "Karaktärsintervju",
      develop: "Utvecklingsmetod",
      "extract-interview": "Extrahera fakta (intervju)",
      "extract-brainstorm": "Extrahera fakta (brainstorm)",
      "extract-synopsis": "Extrahera fakta (synopsis)",
      "extract-brief": "Extrahera fakta (brief)",
      "import-lore": "Importera lore",
      beat: "Skriv en beat",
      summarize: "Sammanfatta kapitel",
      translate: "Översätt kapitel",
      developmental: "Developmental analys"
    }
  },
  askManuscript: {
    nav: "Fråga manuset",
    title: "Fråga ditt manus",
    placeholder: "Ställ en fråga om din berättelse. Svaret använder bara det som faktiskt är skrivet — med de kapitel det hämtats från, så att du själv kan kontrollera det.",
    action: "Fråga",
    asking: "Frågar…",
    answerHeading: "Svar",
    sourcesHeading: "Källor",
    jumpToChapter: "Öppna ”{chapter}”"
  },
  askPassage: {
    title: "Fråga om det här kapitlet",
    lede: "Fråga vad som helst om kapitlets hantverk — tempo, spänning, röst, om slutet funkar. Var så kritisk du vill, det här är bara till för att läsas, inget sparas.",
    placeholder: "T.ex. ”Bygger det här upp mot ett starkt slut?”",
    action: "Fråga",
    asking: "Frågar…",
    answerHeading: "Svar"
  },
  interview: {
    action: "Intervju",
    title: "Intervjua {name}",
    titleWorld: "Fråga om {name}",
    lede: "Ett privat samtal med {name}, byggt bara på det som hittills är låst i din Story Bible. Inget som sägs här blir kanon av sig självt — ett sätt att höra rösten och upptäcka luckor i det som är etablerat.",
    ledeWorld: "Ett privat samtal om {name}, byggt bara på det som hittills är låst i din Story Bible. Inget som sägs här blir kanon av sig självt — ett sätt att utforska idéer och upptäcka luckor i det som är etablerat.",
    placeholder: "Fråga {name} något…",
    placeholderWorld: "Fråga något om {name}…",
    ask: "Fråga",
    asking: "Frågar…",
    you: "Du",
    thinking: "{name} tänker…",
    thinkingWorld: "Tänker på {name}…",
    empty: "Inget frågat än. Börja samtalet med {name} nedan.",
    emptyWorld: "Inget frågat än. Börja utforska {name} nedan.",
    extractAction: "Plocka ut fakta",
    extracting: "Plockar ut…",
    extractAsOf: "Från och med",
    extractAsOfHint: "Vilket kapitel — eller, för ett kapitel som delats i scener, vilken scen — den här faktan hör till i berättelsens egen tidsordning, inte manusets sidordning. Ett Draft för hela kapitlet ser en fakta redan från kapitlets första sida; ett scen-för-scen-Draft ser den först från och med sin egen scen. Välj punkten där det faktiskt blir sant (t.ex. när två karaktärer möts första gången, eller en avslöjande vändning mitt i ett kapitel), inte bara vilket kapitel du råkar ha öppet.",
    extractWholeChapter: "Hela kapitlet",
    extractSceneFallback: "Scen {index}",
    personalityLabel: "Personlighet för det här samtalet — testa dig fram, spara till profilen när tonen känns rätt",
    personalityPlaceholder: "Hur de pratar och reagerar",
    personalitySave: "Spara till profilen"
  },
  brainstormChat: {
    title: "Bolla idéer",
    lede: "Ett löst samtal fram och tillbaka om din story — som att prata med en polare. Inget här är kanon, och inget sparas; dra själv in de idéer du fastnar för på brädet.",
    placeholder: "Skriv vad du tänker på…",
    send: "Skicka",
    sending: "Tänker…",
    you: "Du",
    partner: "Partner",
    thinking: "Tänker…",
    empty: "Inget sagt än. Börja bolla en idé nedan.",
    addToNotes: "Lägg till i anteckningar"
  },
  timeline: {
    nav: "Tidslinje",
    title: "Tidslinje",
    lede: "Läsordningen är inte alltid när saker händer. Ge ett kapitel en tidsnotering och flytta det för att se var det egentligen hör hemma, jämfört med var det ligger i manuset.",
    readingPosition: "Manusposition {n}",
    storyTimeCaption: "Kronologisk position",
    storyTimePlaceholder: "T.ex. ”Tre år tidigare”",
    storyTimeLabel: "Berättelsetid för ”{chapter}”",
    outOfOrder: "Avviker från läsordningen",
    moveEarlier: "Flytta tidigare",
    moveLater: "Flytta senare"
  },
  continuity: {
    leakCount: {
      one: "{count} fakta från senare i berättelsen",
      other: "{count} fakta från senare i berättelsen"
    },
    leakHint: "De här är redan låst sanning, men etablerade efter det här kapitlet — modellen kan ändå se dem här. Inte nödvändigtvis ett problem (kanske är det här kapitlet ett hopp framåt), men värt en snabb koll.",
    establishedIn: "Etablerad i ”{chapter}”"
  },
  placeholders: {
    count: {
      one: "{count} platshållare att återkomma till",
      other: "{count} platshållare att återkomma till"
    },
    empty: "Platshållare",
    jumpTo: "I ”{chapter}”"
  },
  darlings: {
    count: {
      one: "{count} älskling sparad",
      other: "{count} älsklingar sparade"
    },
    jumpTo: "I ”{chapter}”",
    restore: "Återställ",
    discard: "Släng för gott"
  },
  plotlines: {
    nav: "Trådar",
    title: "Trådar",
    lede: "Vilka trådar som går genom vilket kapitel, på en snabb blick. Bocka av ett kapitel mot varje tråd det rör.",
    chapterColumn: "Kapitel",
    addPlaceholder: "Ny tråds namn",
    addAction: "Lägg till",
    removeThread: "Ta bort tråden ”{title}”",
    renameLabel: "Trådens namn",
    cellLabel: "{chapter} — {thread}",
    emptyPlotlines: "Inga trådar än. Lägg till en nedanför för att starta matrisen.",
    emptyChapters: "Skriv ett kapitel först — matrisen behöver något att visa.",
    colorSwatchLabel: "Sätt ”{thread}” till färgen {color}",
    colorNames: {
      lime: "Limegrön",
      green: "Grön",
      cyan: "Turkos",
      blue: "Blå",
      violet: "Violett",
      magenta: "Magenta",
      orange: "Orange",
      coral: "Korall",
      grey: "Grå",
      charcoal: "Mörkgrå"
    },
    editAction: "Redigera",
    editLabel: "Redigera tråden ”{title}”",
    editTitle: "Redigera tråd",
    colorFieldLabel: "Färg",
    descriptionLabel: "Beskrivning (frivillig)",
    descriptionPlaceholder: "Visas som en tooltip över trådens namn och dess staplar",
    hideFromAiLabel: "Dölj för AI",
    hideFromAiHint: "Skickas inte med i Skriv/Fortsätt/Utveckla-prompten för kapitel taggade med den här tråden. Visas fortfarande för dig medan du skriver.",
    chapterThreadsLabel: "Trådar:"
  },
  method: {
    nav: "Utvecklingsmetod",
    title: "Utvecklingsmetod",
    lede: "En utvecklingsmetod är en färdig serie steg för att låta din berättelse växa från en gnista till en form. Den behåller aldrig något eget — varje steg skriver bara in i Synopsis eller Trådar, som du redan har. Hoppa över det här helt om du hellre skriver fritt.",
    pickerLede: "Välj en metod för att få en vägledd väg. Du kan ändra dig senare — inget som redan är skrivet tas någonsin bort.",
    useAction: "Använd den här metoden",
    changeAction: "Byt metod",
    noneAction: "Ingen metod — skriv fritt",
    activeBadge: "Används",
    beatsHeading: "Vändpunkter",
    beatsHint: "Varje vändpunkt nedan blev en tråd i Trådar. Öppna Trådar för att markera vilka kapitel som täcker vilken vändpunkt.",
    openPlotlines: "Öppna Trådar",
    assistAction: "Föreslå en start",
    assisting: "Tänker…",
    draftPlaceholder: "Skriv egen text, eller be assistenten om en start…",
    suggestionHeading: "Förslag",
    useSuggestionAction: "Använd den här texten",
    sendToSynopsisAction: "Skicka till Synopsis",
    sentToSynopsis: "Tillagd i Synopsis.",
    removeOldBeatsConfirm: {
      one: "Ta bort den {count} kvarglömda tråden från {method} — {titles}?",
      other: "Ta bort de {count} kvarglömda trådarna från {method} — {titles}?"
    },
    methods: {
      snowflake: {
        name: "Snowflake Method",
        description:
          "Börja med en enda mening och låt berättelsen växa utåt i några allt bredare omgångar. En förenklad, tre-stegs variant av Randy Ingermansons metod.",
        steps: {
          logline: {
            label: "En mening",
            prompt: "Sammanfatta hela berättelsen i en mening — karaktären, vad hen vill ha, och vad som står i vägen."
          },
          paragraph: {
            label: "Ett stycke",
            prompt: "Väx meningen till ett kort stycke: upptakten, konflikten som utvecklar den, vändpunkten på vägen, och hur det slutar."
          },
          synopsis: {
            label: "Full synopsis",
            prompt: "Väx stycket till en full synopsis — hela bokens form, scen för scen där det hjälper."
          }
        }
      },
      "three-act": {
        name: "Three-Act Structure",
        description: "Den klassiska formen upptakt / konfrontation / upplösning, som sju igenkännbara vändpunkter.",
        steps: {
          setup: { label: "Upptakt", hint: "Vardagsvärlden, innan berättelsen rubbar den." },
          inciting: { label: "Utlösande händelse", hint: "Händelsen som sätter berättelsen i rörelse." },
          "break-two": { label: "Steget in i andra akten", hint: "Karaktären bestämmer sig — det finns ingen väg tillbaka till vardagsvärlden." },
          midpoint: { label: "Mittpunkt", hint: "En falsk seger eller falskt nederlag som höjer insatserna." },
          "all-is-lost": { label: "Allt är förlorat", hint: "Lågpunkten — det ser ut som att karaktären inte kan vinna." },
          climax: { label: "Klimax", hint: "Den slutgiltiga konfrontationen som hela berättelsen har byggt mot." },
          resolution: { label: "Upplösning", hint: "Den nya vardagsvärlden, efter berättelsens förändring." }
        }
      },
      "save-the-cat": {
        name: "Save the Cat",
        description: "Blake Snyders 15 vändpunkter — en detaljerad, procentbaserad struktur som är populär i genrelitteratur och film.",
        steps: {
          "opening-image": { label: "Öppningsbild", hint: "En glimt av karaktärens värld innan berättelsen." },
          "theme-stated": { label: "Temat sägs", hint: "Någon säger, nästan i förbifarten, vad berättelsen egentligen handlar om." },
          "set-up": { label: "Upptakt", hint: "Världen, persongalleriet, och vad som saknas i karaktärens liv." },
          catalyst: { label: "Katalysator", hint: "Händelsen som sätter berättelsen i rörelse." },
          debate: { label: "Tvekan", hint: "Karaktären tvekar — kan hen verkligen göra det här?" },
          "break-two": { label: "Steget in i andra akten", hint: "Karaktären väljer att agera och lämnar den gamla världen bakom sig." },
          "b-story": { label: "B-berättelsen", hint: "En andra tråd börjar — ofta en relation som bär temat." },
          "fun-and-games": { label: "Löftet infrias", hint: "Grundidén levererar det den lovade — de klassiska scenerna." },
          midpoint: { label: "Mittpunkt", hint: "En falsk seger eller falskt nederlag; insatserna höjs, klockan börjar ticka." },
          "bad-guys-close-in": { label: "Motståndet trycker på", hint: "Både yttre och inre press hårdnar." },
          "all-is-lost": { label: "Allt är förlorat", hint: "Lågpunkten — ofta markerad av en förlust eller en död." },
          "dark-night": { label: "Själens mörka natt", hint: "Karaktären sitter kvar i förlusten innan hen hittar en väg framåt." },
          "break-three": { label: "Steget in i tredje akten", hint: "Karaktären hittar lösningen, ofta från B-berättelsens lärdom." },
          finale: { label: "Final", hint: "Karaktären agerar på lärdomen och löser berättelsens problem." },
          "final-image": { label: "Slutbild", hint: "En bild som speglar öppningsbilden och visar hur mycket som förändrats." }
        }
      },
      "hero-journey": {
        name: "Hero's Journey",
        description: "Campbells och Voglers mytiska struktur — tolv steg för en karaktär som lämnar den kända världen och återvänder förändrad.",
        steps: {
          "ordinary-world": { label: "Vardagsvärlden", hint: "Livet innan äventyret." },
          call: { label: "Kallelsen", hint: "Något rubbar vardagsvärlden." },
          refusal: { label: "Att avvisa kallelsen", hint: "Rädsla eller tvekan håller karaktären tillbaka." },
          mentor: { label: "Att möta mentorn", hint: "Någon ger karaktären det hen behöver för att gå vidare." },
          threshold: { label: "Att korsa tröskeln", hint: "Karaktären bestämmer sig och lämnar vardagsvärlden." },
          tests: { label: "Prövningar, allierade, fiender", hint: "Den nya världens regler, vänner och rivaler lärs in." },
          approach: { label: "Närmande till den inre grottan", hint: "Förberedelser inför den centrala prövningen." },
          ordeal: { label: "Den stora prövningen", hint: "Den centrala krisen — en beröring med döden, bokstavlig eller inte." },
          reward: { label: "Belöningen", hint: "Karaktären tar det hen kom för." },
          "road-back": { label: "Vägen tillbaka", hint: "Att bestämma sig för att fullfölja resan och återvända." },
          resurrection: { label: "Återuppståndelsen", hint: "En sista, mer avgörande prövning som bevisar att förändringen är äkta." },
          return: { label: "Återkomsten med elixiret", hint: "Karaktären kommer hem förändrad, med något att ge tillbaka." }
        }
      }
    }
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "En kort genomgång — hur du får appen att prata med en modell, och vad allt gör när den väl gör det.",
    closeAction: "Stäng",
    fromErrorLink: "Se snabbstartsguiden",
    helpFor: "Guide: {topic}",
    connectAiButton: "Anslut en lokal AI",
    quickstartHeading: "Kom igång med en lokal AI",
    quickstartCards: [
      {
        heading: "Installera en lokal AI-server",
        body: "Har du inte redan en installerad rekommenderar vi Ollama — gratis, från ollama.com. Föredrar du något annat? LM Studio eller en annan lokal server fungerar också."
      },
      {
        heading: "Välj din AI-modell",
        body: "AI-modellen är det som faktiskt skriver och resonerar med dig. Vi rekommenderar en modell tränad för skönlitterär prosa, till exempel fluffy/l3-8b-stheno-v3.2 (sök efter \"stheno\" i Ollama). Annars fungerar vilken allmän chattmodell som helst — till exempel llama3 eller mistral."
      },
      {
        heading: "Koppla den till kaampi Write",
        body: "Kör du Ollama? Inget att ställa in — kaampi Write hittar den automatiskt. Kör du LM Studio eller en annan server istället? Öppna Inställningar → Modeller, välj den under Motor, och klistra in serveradressen den visar dig."
      }
    ],
    categories: {
      "getting-started": "Introduktion",
      "basic-writing": "Grundläggande skrivande",
      "the-writer": "Skrivverktyget",
      images: "Bilder",
      "focused-workflow": "Fokuserat arbetsflöde",
      "advanced-tools": "Avancerade skrivverktyg",
      "world-bible": "Story Bible",
      "polish-publish": "Polera & publicera",
      troubleshooting: "Felsökning"
    },
    sections: {
      privacy: {
        heading: "Ett helt stängt digitalt kassaskåp",
        body: "kaampi Write är byggd kring en enda regel: ditt manus är din egendom, och det ska aldrig lämna din dator. Det finns ingen väg ut mot internet i själva appen — inga API-nycklar till ChatGPT, Claude eller andra molntjänster (det är inte en saknad funktion, utan ett medvetet val), och typsnitten ligger paketerade i appen istället för att hämtas utifrån. Din text lagras enbart lokalt i webbläsaren, och AI-modellen körs enbart på din egen processor. Den fristående skrivbordsappen (frivillig) kan kolla om det finns en nyare version av sig själv — aldrig av ditt manus, som den inte ens har tillgång till. Oavsett vad du skriver — dagbok, företagshemligheter eller nästa stora fantasy-epos — stannar varje bokstav hos dig."
      },
      author: {
        heading: "Författaren vinner alltid över AI:n",
        body: "Modellen föreslår, du bestämmer. En detalj modellen hittar på i prosan förblir ett förslag — visas med en lätt streckad understrykning — tills du låser den i Story Bible. Inget blir kanon av sig självt."
      },
      chapters: {
        heading: "Kapitel: Skriv utkast, Omskriv, Analysera",
        body: "Skriv utkast skriver ny prosa utifrån det som redan är etablerat. Omskriv skriver om samma kapitel i ett annat perspektiv eller tempus, med samma händelser kvar. Analysera granskar ett kapitel för vanliga skrivproblem utan att skriva om en enda rad — till exempel \"berätta\" istället för att visa (istället för \"Lisa var jättearg\" föreslår den kanske \"Lisa smällde igen dörren så att kaffekopparna skallrade\"), meningslös dialog, eller ett drag som krockar med ett låst karaktärsdrag. Läsare (i Inställningar, och per kapitel) anger vem texten skrivs för — Pekbok till Vuxen — så meningslängd och ordval matchar den åldern. Under texten växlar Ovanliga ord och Klichéer mellan två valfria markeringar — ovanliga ord för den läsaren, och formuleringar som låter AI-skrivna (\"ett bevis på\", överanvända tankstreck) — en i taget, avstängt som standard."
      },
      "editor-tools": {
        heading: "Högerklicksmenyn",
        body: "Markera ett stycke och högerklicka för Förläng (fortsätter där markeringen slutar), Brodera ut (utvecklar själva stycket), Skriv om… (din egen instruktion, t.ex. \"gör henne argare\"), Illustrationsprompt… (se Images) och Manuell redigering (skriv om bara det markerade stycket själv, för hand — resten av kapitlet ligger kvar). Högerklickar du istället utan att markera något får du ett enda val, Skriv en beat…: beskriv i en rad vad som händer härnäst, så skriver modellen bara den beaten — ett kort stycke, inte resten av scenen — och lägger in den precis vid markören. Markerar du ett stycke dyker det också upp en liten Fet/Kursiv/Understruken-verktygsrad ovanför (eller Ctrl+B/I/U) — bara visuell formatering, sparas separat från själva texten, så den når aldrig modellen."
      },
      "add-picture": {
        heading: "En bild till kapitlet",
        body: "Lägg till en egen bild — JPEG, PNG eller WebP — högst upp i ett kapitel. Den är dekorativ, inte AI-genererad: välj en fil från din dator så visas den ovanför kapitlets första rader, och följer med när du publicerar till HTML, ePub eller PDF."
      },
      "illustration-prompts": {
        heading: "Illustrationsprompter",
        body: "Markera ett stycke och välj Illustrationsprompt… i högerklicksmenyn. Modellen skriver en bildgenereringsprompt — inte en bild — byggd på stycket, dina låsta Story Bible-fakta och manusets illustrationsstil, redo att klistras in i vilket bildverktyg du än använder; kaampi Write förblir helt lokal och genererar aldrig själva bilden. Sätt en standardstil under Inställningar → Illustrationsstil, eller öppna stilbiblioteket för att spara namngivna, återanvändbara stilar — var och en med egna genretaggar och en exempelbild — så att varje prompt håller samma look genom hela boken."
      },
      "brainstorm-synopsis": {
        heading: "Brainstorm & Synopsis",
        body: "Brainstorm är din privata anslagstavla — ett kladdpapper eller en tavla med post-it-lappar, en anteckning per idé, dragbar, ingen ordning krävs. Skriv utkast lutar sig aldrig mot en anteckning du inte lyft över till Synopsis. (Frågar du modellen om dina anteckningar, eller ber den förlänga eller utveckla en av dem, läser den förstås det du frågar om — men inget därifrån blir kanon eller läcker in i kapitel-skrivandet av sig självt.) Dra de idéer som håller till Synopsis: formen på hela boken, i några meningar. Det är detta AI-modellen lutar sig mot när den senare hjälper dig skriva kapitel."
      },
      method: {
        heading: "Utvecklingsmetod",
        body: "En valfri, färdig serie steg för att låta en gnista växa till en form — Snowflake, Three-Act Structure, Save the Cat eller Hero's Journey. Den behåller aldrig något eget: en vändpunktsbaserad metods vändpunkter blir trådar i Trådar, och Snowflakes steg skriver rakt in i Synopsis, precis som vilken annan anteckning du lyfter dit. Att byta metod, eller välja ingen alls, tar aldrig bort något som redan finns i endera."
      },
      plotlines: {
        heading: "Trådar (Plotlines)",
        body: "Håll koll på vilken tråd som går genom vilket kapitel i en tabell, så en tråd som varit tyst i tio kapitel är lätt att upptäcka."
      },
      scenes: {
        heading: "Scener",
        body: "Ett långt kapitel kan delas upp i scener — välj var en slutar och nästa börjar, namnge den, lägg till en kort anteckning. När ett kapitel har scener kan Skriv utkast, Omskriv och Analysera var för sig riktas mot bara en av dem."
      },
      timeline: {
        heading: "Timeline",
        body: "Läsordning och berättelsens egen tidsordning är inte alltid samma sak. Ge ett kapitel en tidsanteckning, och se hur boken faller ut sorterad efter när saker faktiskt händer, bredvid var det ligger i manuset."
      },
      "story-bible": {
        heading: "Story Bible",
        body: "Den enda sanningskällan för din berättelses fakta — vem någon är, var en plats ligger, vad ett namn betyder. Ett fakta börjar som ett förslag, från dig eller från en extraktion, och blir bara låst sanning när du godkänner det. Låsta fakta är det modellen får veta att den inte får motsäga — motsäger ett nytt förslag redan låst fakta (till exempel att någon plötsligt har bruna ögon fast du låst att de är blå) flaggas det extra tydligt i granskningskön. Öppna ett kort och tryck Intervjua för att chatta om det — i en karaktärs egen röst, eller för en plats, ett föremål, en grupp eller ett koncept, med en världsbyggar-kollega som diskuterar det i tredje person — byggt bara på det som hittills är låst. Ett sätt att höra en röst eller utforska lore och upptäcka luckor, inte skapa ny kanon. Är något som sägs värt att spara, tryck Plocka ut fakta för att föreslå det till Story Bible — samma granskningskö som all annan extraktion, inget läggs till förrän du godkänner. Ctrl-klicka (Cmd-klicka på Mac) på ett namn du känner igen var som helst i din text för att hoppa direkt till kortet — ett vanligt klick placerar bara markören där, som vanligt."
      },
      continuity: {
        heading: "Kontinuitetsvarningar",
        body: "När ett kapitel kan se ett fakta som bara etablerades senare i manuset flaggas det — inte nödvändigtvis fel, kanske är det en tillbakablick, bara värt en snabb koll. Korrekturläsningen går längre: den kontrollerar en persons eller ett föremåls registrerade plats genom hela berättelsen, i berättelsens egen tidsordning, och flaggar en förflyttning som ser omöjlig eller oförklarad ut med tanke på hur mycket tid som gått."
      },
      proofread: {
        heading: "Korrekturläsning",
        body: "En sista genomgång av hela manuset: grammatik, upprepade scener, stil- och känsloglidning mellan kapitel, åldersanpassning, en kontinuitetskontroll, en koll efter planterade detaljer som aldrig löses in (en pistol som visas i kapitel 4 men som ingen någonsin avfyrar), och en faktakontroll mot hela boken. När Läsare är satt till en barn- eller ungdomsnivå flaggar den dessutom svordomar, våld eller explicit innehåll som inte passar den åldern. Bara anteckningar — inget skrivs om åt dig. Den pausar och återupptar, och kollar bara om det som faktiskt ändrats."
      },
      "ask-manuscript": {
        heading: "Fråga manuset",
        body: "Ställ en fråga om din egen berättelse och få ett svar byggt bara på det som faktiskt är skrivet — med kapitlen det kom från, så att du kan kontrollera det själv."
      },
      publish: {
        heading: "Publicera",
        body: "Exportera en ren läskopia — Markdown, RTF, ODT, HTML, ePub eller PDF. Brainstorm lämnar aldrig boken; bara själva manuset gör det."
      }
    },
    faqHeading: "Felsökning",
    faq: [
      {
        heading: "”Ingen lokal modell hittades”",
        body: "kaampi Write når inte din lokala server. Kör du Ollama? Se till att den är igång. Kör du LM Studio eller en annan server? Kolla Inställningar → Modeller — motorn och serveradressen måste stämma med det som faktiskt körs på din dator."
      },
      {
        heading: "Var lagras min bok?",
        body: "På din egen dator, i webbläsarens lokala lagring — inget laddas upp någonstans. Använd Backup då och då för att spara en kopia du kan återställa från, ifall du rensar webbläsarens data."
      },
      {
        heading: "Kan jag köra appen på en annan dator eller mobil i mitt hemnätverk?",
        body: "Ja, men det är två separata saker. För att nå själva appen från en annan enhet, starta den med \"npm run dev -- --host\" och använd nätverksadressen terminalen visar (t.ex. http://192.168.1.23:5175) istället för localhost. För att den enheten också ska kunna prata med din lokala AI-modell måste modellservern (t.ex. Ollama) själv tillåta det: låt den lyssna brett (OLLAMA_HOST=0.0.0.0), tillåt adressen (OLLAMA_ORIGINS), och peka appens modellinställning mot datorns nätverksadress istället för localhost. Tänk på att varje enhet ändå har sitt eget bibliotek — manus delas inte automatiskt mellan dem, du får flytta en bok mellan enheter via Backup/Återställ."
      },
      {
        heading: "Kan jag använda en betald AI-tjänst istället?",
        body: "Nej — medvetet. kaampi Write pratar bara någonsin med en modell som körs på din egen dator eller nätverk. Det är inte en saknad funktion; det är hela poängen: ditt manus behöver aldrig lämna din maskin."
      }
    ]
  },
  handbook: {
    title: "Guide",
    intro:
      "kaampi Write innehåller många verktyg, men du behöver inte lära dig allt innan du börjar.\nDu kan skriva en hel bok genom att skapa kapitel och skriva i editorn. De andra verktygen finns där när du behöver hjälp med idéer, struktur, karaktärer, kontinuitet, redigering eller publicering.\n\nBörja enkelt. Lägg till struktur när berättelsen behöver den.",
    categories: {
      "getting-started": "Kom igång",
      "how-you-work": "Så kan du arbeta",
      plan: "Planera berättelsen",
      "story-bible-world": "Story Bible & världen",
      writing: "Skriva",
      revise: "Bearbeta manuset",
      "images-publish-backup": "Bilder, publicering & backup",
      "writing-tips": "Skrivtips",
      help: "Hjälp & felsökning"
    },
    sections: {
      "connect-local-ai": {
        heading: "Koppla en lokal AI",
        body: "kaampi Write pratar aldrig med en molnbaserad AI-tjänst. Utkast, omskrivning, analys och intervjuer körs mot en modell du själv installerar och kör på din egen dator — inget att prenumerera på, inget API-nyckelfält någonstans i appen, inget som lämnar din maskin.",
        steps: [
          {
            heading: "Varför en lokal modell, inte en molnbaserad",
            body: "Det här är ingen saknad funktion — det är hela poängen med kaampi Write. Ditt manus är din egendom och ska aldrig behöva lämna din dator för att vara användbart. Att köra modellen lokalt är det som gör löftet bokstavligen sant, inte bara en policy: det finns ingen server i andra änden av anslutningen att skicka din text till över huvud taget."
          },
          {
            heading: "1. Installera en lokal AI-motor",
            body: "En motor är programmet som faktiskt kör en modell på din dator; kaampi Write pratar med motorn, och motorn pratar med modellen. Har du ingen redan rekommenderar vi Ollama — gratis, från ollama.com, och enklast att få igång. Föredrar du något annat fungerar LM Studio och andra lokala servrar också."
          },
          {
            heading: "2. Välj en modell",
            body: "Modellen är det som faktiskt skriver och resonerar tillsammans med dig — motorn från steg 1 bara kör den. Vi rekommenderar en anpassad för skönlitteratur, till exempel fluffy/l3-8b-stheno-v3.2 (sök på ”stheno” i Ollama). I övrigt fungerar vilken allmän chattmodell som helst fint — llama3 eller mistral, till exempel."
          },
          {
            heading: "3. Anslut den till kaampi Write",
            body: "Använder du Ollama? Inget att ställa in — kaampi Write hittar den automatiskt på din dator. Använder du LM Studio eller en annan server istället? Öppna Settings → Models, välj den under Engine och klistra in serveradressen den visar dig."
          },
          {
            heading: "Om inget händer när du skriver utkast",
            body: "kaampi Write når inte din lokala server. Se till att motorn från steg 1 faktiskt körs och att en chattmodell är installerad i den. Settings → Models visar vilken motor och adress den försöker använda — de behöver matcha vad som faktiskt körs på din dator."
          }
        ]
      },
      "connection-presets": {
        heading: "Anslutningsgenvägar",
        body: "En genväg är en sparad snabbväg tillbaka till en viss motor och serveradress — användbar så fort du pratar med mer än en regelbundet.",
        steps: [
          {
            heading: "Vem det här är för",
            body: "Använder du bara en lokal server någonsin kommer du troligen aldrig behöva det här — Settings → Models kommer redan ihåg din enda anslutning. Genvägar börjar löna sig först när du växlar mellan mer än en: Ollama för vardagsskrivande, LM Studio för en annan modell, en testdator på ditt nätverk."
          },
          {
            heading: "Spara en anslutning som en ruta",
            body: "Settings → Models låter dig spara en Engine och Server address som en namngiven ruta, istället för att skriva om adressen varje gång du växlar mellan dem. Klicka på en ruta för att göra den till den aktiva anslutningen igen."
          },
          {
            heading: "Redigera eller ta bort en ruta",
            body: "Varje ruta expanderas för att visa och redigera sina egna inställningar — en Update-knapp sparar ändringar på just den rutan, och en papperskorgsknapp tar bort den. Att redigera en ruta ändrar bara den sparade genvägen; det rör inte den aktiva anslutningen just nu om du inte också klickar på den."
          },
          {
            heading: "Det som är aktivt förblir alltid synligt",
            body: "Vilken motor och adress kaampi Write faktiskt använder just nu visas och förblir redigerbart oavsett om det råkar vara sparat som en ruta eller inte. Att spara en ruta är bara en bekvämlighet för att hitta tillbaka senare — det krävs aldrig för att använda en anslutning."
          }
        ]
      },
      "first-book": {
        heading: "Skapa din första bok",
        body: "Ett namn är allt kaampi Write faktiskt behöver av dig för att börja — allt annat är valfritt, och inget behöver ske i en viss ordning.",
        steps: [
          {
            heading: "1. Ge det ett namn",
            body: "Skriv en titel och tryck Enter, eller klicka på pilen bredvid fältet. Det är hela förberedelsen — du behöver ingen Synopsis, ingen Story Bible, ingen berättelsemetod eller någon sorts disposition innan du börjar."
          },
          {
            heading: "2. Gå direkt till sidan",
            body: "Ett nytt manus öppnas med ett tomt kapitel redan väntande. Kapitel → Kapitel 1 → börja skriva, precis som att öppna ett tomt dokument i ett vanligt skrivprogram — klicka in på sidan och skriv."
          },
          {
            heading: "3. Dina ord sparas allteftersom",
            body: "kaampi Write sparar vad du skriver automatiskt, en kort stund efter att du slutat skriva — ingen Spara-knapp att komma ihåg, och inget att förlora om du stänger fliken eller appen."
          },
          {
            heading: "Ta till AI bara när du vill",
            body: "Att skriva allt för hand är ett fullständigt, normalt sätt att använda kaampi Write på. AI-verktygen (Skriv utkast, Förläng, Brodera ut och resten) finns under sidan när du bestämmer dig för att du vill ha hjälp med ett visst kapitel — aldrig ett krav för att få ord på sidan."
          }
        ]
      },
      "first-chapter": {
        heading: "Ditt första kapitel",
        body: "Ett kapitel är i grunden två skilda saker som bor på två skilda ställen: en brief som beskriver vad det ska göra, och själva manuset — orden en läsare faktiskt kommer att se.",
        steps: [
          {
            heading: "Briefen är en instruktion, inte prosa",
            body: "Briefen ligger ovanför sidan och beskriver vad kapitlet ska uppnå — för dig, och för AI-verktygen om du använder dem. Den behöver aldrig vara välskriven; det är en anteckning till dig själv, inte en del av berättelsen. Till exempel: ”Erik anländer till den gamla järnvägsstationen. Där möter han en kvinna som verkar känna hans far. Hon vägrar förklara hur och lämnar ett gammalt fotografi på bordet.”"
          },
          {
            heading: "Manuset är det som växer fram ur den",
            body: "Under briefen finns själva sidan — kapitlets faktiska text, den del en läsare kommer att se. Det är berättelsen som växer fram ur vad briefen beskrev, skriven i så mycket eller så lite detalj som briefen gav dig."
          },
          {
            heading: "Skriv det själv, eller låt Skriv utkast börja",
            body: "Du kan skriva kapitlet för hand utifrån briefen, precis som du skulle skriva utifrån vilken disposition som helst. Eller tryck Skriv utkast för att få ett helt första varv från modellen, byggt på briefen plus allt annat redan etablerat om berättelsen — något att läsa, behålla eller skriva om, inte en slutversion."
          },
          {
            heading: "En brief är inte en sammanfattning",
            body: "Briefen beskriver vad som ska hända, skriven innan kapitlet finns. När kapitlet väl är skrivet registrerar ett separat fält — Summary — vad som faktiskt hände, i efterhand. De två pekar åt motsatta håll längs samma kapitel; Summary får sitt eget kapitel längre fram i den här guiden."
          }
        ]
      },
      "map-of-storybook-ai": {
        heading: "En karta över kaampi Write",
        body: "Verktygen i kaampi Write faller ungefär inom sex steg — Utforska, Planera, Etablera, Skriv, Granska, Färdigställ. Kartan nedan går från vänster till höger eftersom det är lättast att visa på en sida, inte eftersom varje bok verkligen går igenom den i den ordningen.",
        steps: [
          {
            heading: "Utforska – här får idéer vara osäkra",
            body: "Brainstorm och Intervjua världen. Ingenting här är kanon ännu; det är en plats att pröva en idé högt innan du bestämmer om den alls hör till berättelsen."
          },
          {
            heading: "Planera – här formar du berättelsen",
            body: "Synopsis, Kapitelbriefs, Scener, Trådar, Timeline. De ger berättelsen en riktning och en form — så lös eller så detaljerad du vill."
          },
          {
            heading: "Etablera – här bestämmer du vad som räknas som sant",
            body: "Story Bible, Extrahera fakta, Granska, Lås. Det här är det enda steget som faktiskt binder något — ett faktum börjar bara begränsa senare skrivande när du har låst det här."
          },
          {
            heading: "Skriv – här blir det prosa",
            body: "Kapitel — Skriv utkast, Skriv en beat, Förläng, Brodera ut, Skriv om. Allt uppströms (Planera, Etablera) finns för att mata det här steget; det här är det enda steget ingen bok hoppar över."
          },
          {
            heading: "Granska – här kontrollerar du vad du har skrivit",
            body: "Analysera, Polish, Fråga manuset, Fråga om en passage, Kontinuitet, Korrekturläs, Developmental analysis. Olika verktyg här ställer olika frågor — en kapitelnivå-kontroll av hantverket är en annan uppgift än en kontroll av hela bokens tempo."
          },
          {
            heading: "Färdigställ – att få ut boken",
            body: "Bilder, Språkversioner, Publicera, Säkerhetskopiera. Det sista steget, nått när ett kapitel — eller hela boken — är redo att lämna kaampi Write."
          }
        ],
        tip: "Det är en karta, inte en obligatorisk ordning. Många kapitel går rakt från Skriv till Skriv igen, och hoppar helt över Planera och Granska tills mycket senare — eller aldrig."
      },
      "no-required-workflow": {
        heading: "Du behöver inte använda allt",
        body: "kaampi Write kan användas på många olika sätt. Det finns inget obligatoriskt arbetsflöde — de fem exemplen nedan är utgångspunkter, inte en meny du måste välja exakt en från.",
        steps: [
          {
            heading: "Jag vill bara börja skriva",
            body: "Kapitel → Skriv → Nästa kapitel. Planera senare, bara när du faktiskt behöver det — ingenting hindrar dig från att lägga till en Synopsis eller ett Story Bible-faktum mitt i kapitel 12."
          },
          {
            heading: "Jag vill planera berättelsen",
            body: "Brainstorm → Synopsis → Kapitelbriefs → Kapitel. Forma berättelsen innan du skriver den scen för scen, utan att behöva binda dig till en namngiven berättelsemetod."
          },
          {
            heading: "Jag vill arbeta mycket strukturerat",
            body: "Synopsis → Berättelsemetod → Trådar → Kapitelbriefs → Scener → Timeline → Kapitel. Alla planeringsverktyg kaampi Write har, använda tillsammans, innan det första ordet prosa."
          },
          {
            heading: "Jag har redan ett manus",
            body: "Lägg in befintlig text → Analysera → Story Bible → Bearbeta → Publicera. Att börja med färdig eller delvis skriven prosa istället för ett tomt dokument ändrar inte vilka verktyg som finns tillgängliga för dig."
          },
          {
            heading: "Jag kommer från ett annat skrivverktyg",
            body: "Ta med manus och lore → Importera → Granska → Fortsätt skriva. Samma väg som ovan, bara med material byggt någon annanstans som startpunkt."
          }
        ],
        tip: "Du väljer själv hur mycket struktur du behöver — och svaret får ändras mellan böcker, eller mellan kapitel i samma bok."
      },
      "three-workflows": {
        heading: "Tre kompletta arbetsflöden",
        body: "Tre sätt att använda kaampi Write från början till slut, från lösast till mest strukturerat. Inget av de tre är mer rätt än de andra — de är olika avvägningar mellan hastighet och stöttning.",
        steps: [
          {
            heading: "Jag skriver intuitivt",
            body: "Nytt manus → Kapitel 1 → Skriv → Kapitel 2 → Skriv. När berättelsen växer: Extrahera fakta → Story Bible, för att hålla kontinuiteten utan att planera i förväg. Senare: Analysera → Polish → Korrekturläs → Publicera. Du behöver aldrig skapa en detaljerad plan någonstans på den här vägen."
          },
          {
            heading: "Jag vill planera först",
            body: "Brainstorm → Synopsis → Kapitelbriefs → Skriv kapitel → Story Bible → Analysera → Polish → Korrekturläs → Publicera. Det ger berättelsen en verklig riktning innan du skriver ett ord prosa, utan att kräva en namngiven dramatisk struktur."
          },
          {
            heading: "Jag vill planera mycket",
            body: "Brainstorm → Snowflake → Synopsis → Tre akter / Save the Cat / Hjältens resa → Trådar → Kapitelbriefs → Scener → Timeline → Skriv → Story Bible + kontinuitet → Analysera → Developmental analysis → Polish → Korrekturläs → Publicera. Alla verktyg, i ungefär den ordning de är mest användbara — det mest strukturerade av de tre, byggt för författare som vill ha stöttningen på plats innan de skriver."
          }
        ]
      },
      "which-tool-do-i-need": {
        heading: "Vilket verktyg behöver jag?",
        body: "Ett symtombaserat register — hitta vad du känner dig fast på nedan, och se vilket verktyg som faktiskt löser det.",
        steps: [
          {
            heading: "Hitta berättelsen",
            body: "”Jag vet inte vad berättelsen handlar om.” → Brainstorm. ”Jag har en idé men får inte ihop en hel berättelse.” → Snowflake. ”Jag har många idéer men ingen helhet.” → Synopsis. ”Jag vet inte riktigt vem min karaktär är ännu.” → Intervjua världen. ”Jag vill prova idéer om karaktären utan att påverka boken.” → Intervjua världen."
          },
          {
            heading: "Forma strukturen",
            body: "”Jag behöver en enkel dramatisk struktur.” → Tre akter. ”Jag vill arbeta med fler tydliga beats.” → Save the Cat. ”Berättelsen handlar om huvudpersonens förändringsresa.” → Hjältens resa."
          },
          {
            heading: "Hålla koll under skrivandet",
            body: "”Jag behöver komma ihåg vad som faktiskt gäller.” → Story Bible. ”Jag tappar bort vad kapitlet ska göra.” → Kapitelbrief. ”Kapitlet har blivit för komplicerat.” → Scener. ”Jag tappar bort olika handlingar och relationer.” → Trådar. ”Jag tappar bort när saker händer.” → Timeline."
          },
          {
            heading: "Ta sig vidare mitt i en scen",
            body: "”Jag har fastnat mitt i en scen.” → Skriv en beat, Förläng eller Brodera ut. ”Det här kapitlet behöver läsas precis som ett tidigare gjorde, ord för ord.” → Bifogad kontext. ”Jag klippte bort något bra men är inte redo att förlora det för gott.” → Darlings. ”En liten fråga skulle bryta mitt flyt om jag stannade upp för den just nu.” → Platshållare."
          },
          {
            heading: "Granska det du skrivit",
            body: "”Jag vet inte om kapitlet fungerar.” → Analysera. ”Jag vill att AI stramar upp själva prosan, inte bara pekar ut saker.” → Polish. ”Jag vill ha ärlig, kritisk feedback på en specifik fråga.” → Fråga om kapitlet / Fråga om en passage. ”Jag hittar inte tillbaka till något i mitt långa manus.” → Fråga manuset. ”Jag vill veta om bokens tempo och trådar faktiskt håller ihop.” → Developmental analysis."
          },
          {
            heading: "Färdigställa",
            body: "”Berättelsen är klar och jag vill ha en sista radgranskning innan någon läser den.” → Korrekturläs. ”Jag behöver boken på ett annat språk också.” → Språkversioner. ”Jag vill ge någon boken att läsa.” → Publicera."
          }
        ]
      },
      "most-important-principle": {
        heading: "Den viktigaste principen",
        body: "kaampi Write innehåller många funktioner eftersom olika författare arbetar på olika sätt. Det betyder inte att alla funktioner måste användas — att inte använda de flesta av dem är ett helt normalt sätt att skriva en bok här.",
        steps: [
          {
            heading: "Börja med berättelsen, inte verktygen",
            body: "När du stöter på ett problem, välj det verktyg som hjälper med just det problemet — gå aldrig igenom funktionslistan för att hitta något att använda."
          },
          {
            heading: "Ett verktyg per steg",
            body: "Utforska när du behöver idéer. Planera när du behöver riktning. Lås fakta när något ska bli etablerat. Skriv när du vet tillräckligt för att fortsätta. Granska när du vill förstå vad du har skrivit."
          }
        ],
        tip: "Verktygen ska anpassa sig efter ditt sätt att skriva – inte tvärtom. Om en funktion inte löser ett problem du faktiskt har missar du ingenting genom att hoppa över den."
      },
      "brainstorm-free": {
        heading: "Brainstorm – tänk fritt",
        body: "Brainstorm är ditt privata kladdblock. Ingenting du lägger här behöver vara bestämt ännu — det är en plats att pröva en idé högt innan du vet om den hör till berättelsen.",
        steps: [
          {
            heading: "Skriv en lapp per idé",
            body: "”Tänk om kvinnan på tåget egentligen känner Eriks far?” ”Kanske är fyrtornet inte övergivet?” ”Skulle berättelsen fungera bättre om brodern fortfarande lever?” Var och en får sin egen lapp, så att du kan flytta runt dem och jämföra sida vid sida."
          },
          {
            heading: "Brainstorm påverkar inte automatiskt berättelsen",
            body: "Det här är den viktiga delen. En idé som ligger i Brainstorm blir inte automatiskt en del av berättelsen, och den ska inte i tysthet börja styra vanliga kapitelutkast bara för att den existerar."
          },
          {
            heading: "Du bestämmer vilka idéer som lämnar kladdbordet",
            body: "När du bestämmer att en idé ska gå vidare drar du den till Till synopsis. Tills du gör det är den precis vad den är — ett kanske."
          }
        ]
      },
      "synopsis-short": {
        heading: "Synopsis – berättelsen i kortform",
        body: "Synopsis beskriver berättelsen som helhet — inte ett enskilt kapitel, utan formen på hela berättelsen.",
        steps: [
          {
            heading: "Vad som hör hemma i en Synopsis",
            body: "Vilka som är viktiga, vad som händer, vilka större konflikter som finns, och vart berättelsen är på väg. Inte scen-för-scen-detalj — den överblick en främling skulle behöva för att förstå vad boken handlar om."
          },
          {
            heading: "Från en Brainstorm-lapp till en Synopsis-rad",
            body: "Brainstorm: ”Tänk om kvinnan på tåget känner Eriks far?” När du bestämmer dig för att använda idén kan den utvecklas till: ”Under resan möter Erik en kvinna som visar sig känna till omständigheterna kring hans fars försvinnande.” Den meningen hör hemma i Synopsis — den är inte längre ett kanske."
          },
          {
            heading: "Hur planeringsverktygen förhåller sig till varandra",
            body: "Brainstorm = kanske. Synopsis = berättelsens plan. Kapitelbrief = ett kapitels uppgift. Manus = själva berättelsen, som den faktiskt är skriven."
          }
        ]
      },
      "chapter-briefs": {
        heading: "Kapitelbriefs",
        body: "En kapitelbrief beskriver vad ett kapitel ska åstadkomma. Den behöver inte vara välskriven — den är en instruktion till dig själv, och till AI när du använder skrivhjälpen.",
        steps: [
          {
            heading: "Hur en brief kan se ut",
            body: "”Erik möter kvinnan i restaurangvagnen. Hon antyder att hon kände hans far men vägrar berätta hur. Kapitlet slutar med att hon lämnar ett fotografi på bordet.” Osminkad, funktionell, skriven för att vara användbar snarare än vacker."
          },
          {
            heading: "Briefen är inte själva berättelsen",
            body: "Den beskriver vad berättelsen ska göra i det här kapitlet — inte hur det formuleras, inte exakt dialog, inte prosan. Skrivverktygen omvandlar briefen till det faktiska kapitlet."
          },
          {
            heading: "Hur det hör ihop med Synopsis och manuset",
            body: "Synopsis = hela berättelsen. Brief = ett kapitel. Manus = det läsaren faktiskt får."
          }
        ]
      },
      "chapter-summary": {
        heading: "Kapitelsammanfattning",
        body: "Bredvid Kapitelbrief finns ett andra fält, Kapitelsammanfattning — en kort notis om vad som faktiskt hände i kapitlet, när det väl är skrivet.",
        steps: [
          {
            heading: "Före och efter",
            body: "Brief = vad kapitlet ska göra, skriven innan du skriver utkastet. Sammanfattning = vad kapitlet faktiskt gjorde, skriven efteråt."
          },
          {
            heading: "Att skriva sammanfattningen",
            body: "Skriv den för hand, eller klicka på ”Sammanfatta kapitel” för att få den genererad direkt från texten du just skrev."
          },
          {
            heading: "Varför sammanfattningar spelar roll för senare kapitel",
            body: "När ett kapitel har en sammanfattning flödar tidigare kapitels sammanfattningar in i Utkast, Förläng, Utveckla och Beat för senare kapitel — i berättelsens tidsordning, inte bara kapitelordning — så att modellen kan hålla reda på vad som redan har hänt utan att behöva varje tidigare kapitels fulla text trängd in i prompten."
          },
          {
            heading: "Inget krävs",
            body: "Ett kapitel ingen sammanfattat ännu lämnas helt enkelt utanför den kontexten. Inget går sönder — det betyder bara att kapitlets händelser inte finns tillgängliga som bakgrund för senare kapitel förrän du lägger till en sammanfattning."
          }
        ]
      },
      "development-methods": {
        heading: "Berättelsemetoder",
        body: "kaampi Write innehåller flera metoder som kan hjälpa dig utveckla eller strukturera berättelsen. De är helt frivilliga — du kan alltid välja Ingen metod, och skriva fritt istället.",
        steps: [
          {
            heading: "Vad metoderna är till för",
            body: "Snowflake, Tre akter, Save the Cat och Hjältens resa erbjuder varje ett eget sätt att tänka på en berättelse — några fokuserar på att utveckla innehåll, andra på att strukturera det. Kapitlen som följer går igenom var och en."
          }
        ]
      },
      "snowflake-method": {
        heading: "Snowflake",
        body: "Snowflake passar när du har en idé men ännu inte en hel berättelse. Den hjälper dig utveckla innehållet steg för steg, där varje omgång lägger till mer detalj än den förra.",
        steps: [
          {
            heading: "En mening",
            body: "”En journalist återvänder till sin hemö för att undersöka sin fars tjugo år gamla försvinnande.” Hela berättelsen, komprimerad till sin kärna."
          },
          {
            heading: "Ett stycke",
            body: "Utveckla grundidén med konflikt, utveckling och riktning — fortfarande kort, men inte längre en enda rad."
          },
          {
            heading: "Full synopsis",
            body: "Bygg vidare tills du har en sammanhängande beskrivning av hela berättelsen, och skicka den sedan till Synopsis."
          },
          {
            heading: "Skriv själv, eller med AI",
            body: "Varje steg kan göras för hand eller med AI som stöd — metoden kräver inte specifikt det ena eller det andra."
          }
        ],
        tip: "Snowflake hjälper framför allt till att besvara en fråga: ”Vad är det egentligen för berättelse jag håller på att skriva?”"
      },
      "three-act": {
        heading: "Tre akter",
        body: "Tre akter passar när du vill ha en enkel dramatisk stomme för berättelsen, utan en lång lista namngivna beats att hålla reda på.",
        steps: [
          {
            heading: "Vändpunkterna",
            body: "kaampi Write använder centrala vändpunkter: Upptakt, Utlösande händelse, Steget in i andra akten, Mittpunkt, Allt är förlorat, Klimax, Upplösning."
          },
          {
            heading: "De blir Trådar",
            body: "Varje vändpunkt blir en Tråd du kan koppla till specifika kapitel i berättelsen."
          },
          {
            heading: "Exempel från verkligheten",
            body: "Utlösande händelse: ”Nora hittar ett brev från sin försvunne far.” (Kapitel 3). Senare — Mittpunkt: ”Nora upptäcker att brevet skrevs efter datumet då hennes far påstås ha försvunnit.” (Kapitel 12)."
          }
        ],
        tip: "Metoden hjälper dig se berättelsens större rörelse. Den skriver inte berättelsen åt dig."
      },
      "save-the-cat": {
        heading: "Save the Cat",
        body: "Save the Cat ger fler hållpunkter än Tre akter — en finare karta över samma typ av resa.",
        steps: [
          {
            heading: "De femton hållpunkterna",
            body: "Öppningsbild, Temat sägs, Upptakt, Katalysator, Tvekan, Steget in i andra akten, B-berättelsen, Löftet infrias, Mittpunkt, Motståndet trycker på, Allt är förlorat, Själens mörka natt, Steget in i tredje akten, Final, Slutbild."
          },
          {
            heading: "Skapas som Trådar",
            body: "Varje hållpunkt blir en Tråd. Du bestämmer sedan hur – och om – den faktiskt passar din berättelse."
          }
        ],
        tip: "Eventuella procentangivelser metoden nämner är riktmärken, inte regler för exakt var något måste inträffa. Använd den som karta, inte som facit."
      },
      "heros-journey": {
        heading: "Hjältens resa",
        body: "Hjältens resa passar berättelser där huvudpersonens förändring är själva ämnet för boken.",
        steps: [
          {
            heading: "De tolv stegen",
            body: "Vardagsvärlden, Kallelsen, Att avvisa kallelsen, Att möta mentorn, Att korsa tröskeln, Prövningar/allierade/fiender, Närmande till den inre grottan, Den stora prövningen, Belöningen, Vägen tillbaka, Återuppståndelsen, Återkomsten med elixiret."
          },
          {
            heading: "Även dessa skapas som Trådar",
            body: "Varje steg blir en Tråd du kan koppla till ett kapitel, precis som med de andra metoderna."
          },
          {
            heading: "Resan behöver inte vara bokstavlig",
            body: "En karaktär kan lämna sin trygga värld genom att flytta, börja en relation, förlora sitt arbete, upptäcka en hemlighet eller fatta ett beslut som förändrar livet — inget uppdrag eller magi krävs."
          }
        ]
      },
      "method-differences": {
        heading: "Skillnaden mellan metoderna",
        body: "De fyra berättelsemetoderna delar sig i två olika uppgifter, och det hjälper att veta vilken du faktiskt behöver.",
        steps: [
          {
            heading: "Snowflake utvecklar innehåll",
            body: "Idé → En mening → Ett stycke → Full synopsis → Synopsis. Snowflake handlar om att räkna ut vad berättelsen egentligen är."
          },
          {
            heading: "De tre beat-metoderna strukturerar utveckling",
            body: "Tre akter / Save the Cat / Hjältens resa: Metod → Beats och vändpunkter → Trådar → Kapitel. De hjälper dig ordna en berättelse du redan har ett visst grepp om."
          },
          {
            heading: "Att byta metod senare är säkert",
            body: "Det du redan har skrivit i Synopsis, eller redan skapat som Trådar, raderas inte bara för att du väljer en annan metod, eller bestämmer dig för att återgå till fritt skrivande."
          }
        ]
      },
      scenes: {
        heading: "Scener",
        body: "När ett kapitel blir långt eller komplicerat kan det hjälpa att dela upp det i Scener — mindre, namngivna beats inuti samma kapitel.",
        steps: [
          {
            heading: "Exempel från verkligheten",
            body: "Kapitel 8 – Fyrtornet. Scen 1: Nora anländer till ön. Scen 2: Hon bryter sig in i fyrtornet. Scen 3: Hon hittar fotografierna. Scen 4: Någon låser dörren utifrån."
          },
          {
            heading: "Hur Scener förhåller sig till briefen",
            body: "Brief = kapitlets uppdrag. Scener = vägen genom kapitlet — stegen som tar det från början till slut."
          },
          {
            heading: "Två sätt att dela av en",
            body: "I Scener-panelen väljer ”Split into two…” ett stycke att bryta vid. Eller markera exakt den text som ska bli sin egen scen och välj ”Create scene” i markeringsmenyn."
          }
        ],
        tip: "Du behöver inte Scener för enkla kapitel där du redan har överblicken i huvudet."
      },
      plotlines: {
        heading: "Trådar",
        body: "Trådar hjälper dig följa saker som utvecklas gradvis genom berättelsen, snarare än saker som händer i ett enda kapitel.",
        steps: [
          {
            heading: "Vad du kan följa med en Tråd",
            body: "Huvudkonflikten, en relation, ett mysterium, en hemlighet, en rivalitet, en karaktärsförändring, eller en uppsättning dramaturgiska beats från en berättelsemetod."
          },
          {
            heading: "Exempel från verkligheten",
            body: "🔴 Faderns försvinnande. 🟡 Nora och Elias. 🔵 Fyrtornets historia. Varje färg markerar en egen tråd du kan följa genom kapitlen."
          }
        ],
        tip: "Du kan se hur dessa löper genom kapitlen. Om en viktig sidohandling plötsligt försvinner under tio kapitel blir det lätt att upptäcka — färgen bara slutar dyka upp."
      },
      timeline: {
        heading: "Timeline",
        body: "Timeline svarar på en fråga: när händer detta? Den blir särskilt användbar när kapitelordningen inte är samma sak som berättelsens faktiska kronologi.",
        steps: [
          {
            heading: "Kapitelordning",
            body: "Kapitel 1 – 2026: Nora återvänder. Kapitel 2 – 2006: Fadern försvinner. Kapitel 3 – 2026: Nora hittar brevet. Kapitel 4 – 1998: Fadern träffar Elias."
          },
          {
            heading: "Kronologisk ordning",
            body: "1998 → 2006 → 2026. Samma fyra kapitel, omordnade efter när händelserna faktiskt skedde snarare än när läsaren möter dem."
          }
        ],
        tip: "Timeline hjälper dig hålla reda på skillnaden mellan de två ordningarna, så att ett tidshopp förblir medvetet snarare än förvirrande."
      },
      "scenes-plotlines-timeline": {
        heading: "Scener, Trådar och Timeline",
        body: "De tre verktygen kan se lika ut vid en första blick, men de svarar på tre olika frågor.",
        steps: [
          {
            heading: "Tre olika frågor",
            body: "Scener: vad händer? Trådar: vad utvecklas? Timeline: när händer det?"
          }
        ],
        tip: "Samma händelse kan finnas i alla tre utan att verktygen gör samma sak — en scen kan driva en tråd framåt och samtidigt sitta på en bestämd punkt på timeline, allt på en gång."
      },
      "story-bible-memory": {
        heading: "Story Bible – berättelsens minne",
        body: "Story Bible samlar information som berättelsen behöver komma ihåg, så att den kan skilja på vad som faktiskt är sant i världen och vad som bara var en förbigående detalj.",
        steps: [
          {
            heading: "Vad Story Bible håller",
            body: "Personer, platser, relationer, grupper, föremål, händelser, samt regler och begrepp i världen — allt senare kapitel behöver förbli konsekventa med."
          },
          {
            heading: "Från manustext till möjliga fakta",
            body: "Anta att manuset säger: ”Nora gick uppför trappan till fyrtornet. Hon hade inte varit där sedan hennes far försvann för tjugo år sedan.” kaampi Write kan identifiera möjliga fakta från det: ”Nora har en far.” ”Noras far försvann för tjugo år sedan.” ”Nora har tidigare varit vid fyrtornet.”"
          },
          {
            heading: "Du bestämmer vad som blir etablerat",
            body: "Du granskar förslagen. Först när du bestämmer att något ska låsas blir det etablerad information som kaampi Write kan förhålla sig till — ett förslag som ligger ogranskat ändrar ännu ingenting."
          }
        ]
      },
      "what-is-canon": {
        heading: "Vad betyder kanon?",
        body: "Kanon är sådant du har bestämt ska betraktas som sant i berättelsen. All text behöver inte bli kanon — det mesta ska det inte.",
        steps: [
          {
            heading: "En detalj behöver inte sparas bara för att den skrevs",
            body: "Om AI skriver: ”Nora drog den röda halsduken tätare kring halsen,” behöver du inte spara färgen på halsduken bara för att den råkade förekomma i texten."
          },
          {
            heading: "Om den inte senare blir viktig",
            body: "Blir halsduken senare viktig — säg att den dyker upp igen i kapitel 20 — kan informationen vara värd att låsa vid den punkten."
          }
        ],
        tip: "Story Bible ska komma ihåg det som behöver vara konsekvent. Den behöver inte bli en databas över varje detalj i varje mening."
      },
      "aliases-and-exclusions": {
        heading: "Alias och undantagsfraser",
        body: "En karaktär, plats eller ett föremål dyker inte alltid upp i texten under kortets eget namn — två verktyg hanterar de två sätten det kan gå fel.",
        steps: [
          {
            heading: "Alias fångar andra namn på samma sak",
            body: "Öppna ett Story Bible-kort och du kan ge det alias — smeknamn, titlar, alter egon — så att ett omnämnande under något av dem ändå räknas. En karaktär som heter ”Emma” på sitt kort men kallas ”Em” genom hela manuset känns igen ändå — i Omnämnanden-spåraren, och i lore-relevansfiltret om du använder ett sådant."
          },
          {
            heading: "Undantagsfraser fångar falska träffar",
            body: "Det omvända problemet förekommer också: ett namn som också är ett vanligt ord. En karaktär som heter Rosa gör att varje omnämnande av en rosenträdgård, en rosenbuske eller rosor på ett bord ser ut som ett omnämnande av henne. Undantagsfraser löser det — lägg till ”rosenträdgård” som ett undantag på Rosas kort, så slutar just den frasen räknas som ett omnämnande av henne, medan ”Rosa log” fortfarande gör det."
          }
        ]
      },
      "merge-story-bible-cards": {
        heading: "Slå ihop Story Bible-kort",
        body: "Ibland visar det sig att två Story Bible-kort är samma sak — du skapade ”Kael” tidigt, och långt senare inser du att ”Kaptenen” som dök upp då och då faktiskt också är Kael.",
        steps: [
          {
            heading: "Hur sammanslagning fungerar",
            body: "”Slå ihop kort…” i Story Bible-panelen hanterar det: välj två eller fler kort av samma sort och slå ihop dem till ett. Inget raderas — varje fakta flyttas över till det sammanslagna kortet; där de två korten sa emot varandra väljer du vilket värde som vinner; varje gammalt namn blir ett alias på det sammanslagna kortet, så ett senare omnämnande av endera fortfarande löser rätt."
          },
          {
            heading: "Uppdatera manustexten också",
            body: "Det finns också ett alternativ att byta ut de gamla namnen mot det nya direkt i manustexten, om du vill att de båda namnen försvinner ur prosan, inte bara förenas på kortet."
          },
          {
            heading: "Sammanslagning fungerar från granskningskön också",
            body: "Samma sammanslagning fungerar även åt andra hållet — ett väntande förslag från Extrahera fakta kan slås ihop direkt mot ett befintligt kort i granskningskön, istället för att först låsas som ett nytt kort och slås ihop efteråt."
          }
        ]
      },
      "edit-vs-update": {
        heading: "Redigera vs. Uppdatera en fakta",
        body: "En låst fakta kan ändras på två olika sätt, och de betyder olika saker — vilket du väljer avgör om berättelsen har ett sant värde eller två, vid olika tidpunkter.",
        steps: [
          {
            heading: "Redigera rättar ett misstag",
            body: "Faktan var alltid sådan, du skrev bara ner den fel. Ingen historik, inget ”från och med”-kapitel; den blir helt enkelt korrekt."
          },
          {
            heading: "Uppdatera registrerar en verklig förändring",
            body: "Faktan var sann, och från ett visst kapitel ändras den till något annat. ”Noras hår var svart” (etablerat i kapitel 1), ”Noras hår är nu grått” (Uppdatera, ankrat till kapitel 14, efter händelserna som åldrade henne). Det tidigare värdet syns kvar i Historik istället för att skrivas över, eftersom båda var sanna — bara vid olika punkter i berättelsen."
          },
          {
            heading: "Identitetsfakta tar bara Redigera",
            body: "Fakta som namn eller art får bara Redigera — det finns sällan en berättelseanledning till att någons namn ska ändras mitt i boken på samma sätt som hårfärg eller bostadsort kan göra."
          }
        ]
      },
      "interview-world": {
        heading: "Intervjua världen",
        body: "Story Bible behöver inte bara användas för att lagra sådant du redan vet. Du kan också använda Intervjua världen för att upptäcka mer — utforska en karaktär genom samtal istället för att fylla i långa formulär.",
        steps: [
          {
            heading: "Utgå från det du redan vet",
            body: "Anta att du vet: ”Nora Berg. 38 år. Journalist. Uppvuxen på ön. Hennes far försvann när hon var arton.”"
          },
          {
            heading: "Fråga karaktären direkt",
            body: "”Varför blev du journalist?” ”Vad minns du av dagen då din far försvann?” ”Vem litar du minst på?” ”Vad skulle du aldrig erkänna för Elias?” ”Vad är du mest rädd för att upptäcka?”"
          }
        ],
        tip: "Intervjun kan hjälpa dig hitta personlighet, motiv, bakgrund, relationer och konflikter — ofta snabbare än att bestämma allt det i förväg."
      },
      "interview-sandbox": {
        heading: "Intervjun är en sandlåda",
        body: "Det här är mycket viktigt: det som sägs under intervjun påverkar inte hur boken skrivs. AI får hitta på och experimentera under samtalet.",
        steps: [
          {
            heading: "Ett svar i intervjun är inte automatiskt sant",
            body: "Anta att Nora säger: ”Min far brukade ta med mig till fyrtornet när jag var liten.” Det betyder inte att kaampi Write hädanefter får använda detta som etablerad information när ett kapitel skrivs. Först måste du välja att göra informationen till fakta."
          },
          {
            heading: "Vägen från en rad i intervjun till kanon",
            body: "Intervju → AI säger något intressant → Extrahera fakta → Granska → Lås fakta → Story Bible → nu kan informationen påverka framtida AI-skrivande."
          }
        ],
        tip: "Intervju ≠ kanon. Låsta fakta = kanon. Det gör att du kan ställa vilda frågor och prova idéer utan att riskera att de börjar påverka berättelsen."
      },
      "interview-to-story": {
        heading: "Från intervju till berättelse",
        body: "En idé från intervjun blir inte en del av berättelsen förrän du låser den — och när du gör det är det värt att förstå exakt när den börjar gälla i manuset.",
        steps: [
          {
            heading: "Från en intressant rad till en möjlig fakta",
            body: "Under intervjun kanske Nora säger: ”Min mor ljög alltid om vad som hände med pappa. Jag lärde mig tidigt att vuxna berättar den version av sanningen som passar dem.” Du tycker att idén är intressant. Efter intervjun kan kaampi Write hjälpa dig identifiera möjliga fakta: ”Noras mor undanhöll information om faderns försvinnande.”"
          },
          {
            heading: "Lås den, eller låt den stanna kvar som utforskning",
            body: "Lås faktan och den blir en etablerad del av Story Bible. Låt bli, och den förblir något som bara utforskades under intervjun — den ska inte behandlas som etablerad information när boken skrivs."
          },
          {
            heading: "En fakta kan gälla från kapitlets första sida, även om den blir sann senare",
            body: "En fakta som låses till ett kapitel gäller från kapitlets första sida. Draft får alltså använda faktan redan där — även om den egentligen blir sann först senare i kapitlet. Exempel: huvudpersonen träffar en gammal vän, Marcus, i kapitel 6. Kapitlet börjar som en vanlig återförening. Först en bit in inser huvudpersonen att Marcus i hemlighet har arbetat emot honom hela tiden — Marcus är antagonisten. Plockar du ut ”Marcus är antagonisten” från intervjun och låser den till kapitel 6, har Draft tillgång till avslöjandet redan när den inledande återföreningen ska skrivas som om ingen ännu vet vad Marcus egentligen gör."
          },
          {
            heading: "Lås faktan till en specifik scen istället",
            body: "Ska faktan bli tillgänglig först när avslöjandet sker, koppla den till den scen där det händer. Dela först kapitel 6 i scener (Scener → Dela i två…) vid punkten där avslöjandet sker, så att återföreningen och avslöjandet blir separata scener. När du sedan plockar ut faktan från intervjun visar väljaren Från och med kapitlets scener — välj avslöjandets scen istället för Hela kapitlet. Nu får Draft tillgång till faktan först från och med den scenen."
          },
          {
            heading: "Det fungerar bara vid scenvis Draft",
            body: "Scenkopplingen påverkar bara Draft när du skriver en scen i taget (Scener → Draft). Kör du Draft för hela kapitlet i ett svep får Draft tillgång till alla fakta som hör till kapitlet, oavsett vilken scen de är kopplade till. Föredrar du att skriva hela kapitel i ett svep gäller därför den enklare lösningen fortfarande: vänta med att låsa faktan tills du har skrivit förbi vändningen, eller skriv kapitlet i två omgångar och lås faktan först inför den andra omgången."
          }
        ]
      },
      "brainstorm-vs-interview": {
        heading: "Brainstorm och intervju",
        body: "De är två olika sätt att utforska berättelsen, och ingen av dem behöver automatiskt förändra den — båda är platser där du får tänka.",
        steps: [
          {
            heading: "Brainstorm tittar utifrån",
            body: "”Tänk om Noras mor vet mer om försvinnandet?” — en fråga om berättelsen, ställd utifrån."
          },
          {
            heading: "Intervju tittar inifrån",
            body: "”Nora, tror du att din mor vet vad som hände med din far?” — samma sorts fråga, men ställd direkt till karaktären, i hennes egen röst."
          }
        ]
      },
      "three-levels-of-information": {
        heading: "Tre nivåer av information",
        body: "En användbar mental modell för hur osäker eller fastställd en bit berättelseinformation är, vid en given tidpunkt.",
        steps: [
          {
            heading: "Utforska",
            body: "Brainstorm och intervjuer. ”Tänk om…?” Här får idéerna vara osäkra."
          },
          {
            heading: "Planera",
            body: "Synopsis, briefs, Scener och Trådar. ”Det här tänker jag ska hända.” Här formar du berättelsen."
          },
          {
            heading: "Etablera",
            body: "Låsta fakta i Story Bible. ”Det här är sant i berättelsens värld.” Här finns information som kaampi Write kan förhålla sig till när berättelsen skrivs."
          }
        ]
      },
      "extract-facts": {
        heading: "Extrahera fakta ur manus",
        body: "Du behöver inte fylla Story Bible manuellt medan du skriver. När ett kapitel innehåller information som kan vara värd att komma ihåg kan kaampi Write hjälpa dig extrahera möjliga fakta direkt ur prosan.",
        steps: [
          {
            heading: "Arbetsflödet",
            body: "Kapitel → Extrahera fakta → Förslag → Granska → Godkänn och lås → Story Bible."
          }
        ],
        tip: "AI föreslår. Du bestämmer — inget läggs till i Story Bible utan ditt godkännande."
      },
      "moving-from-other-tool": {
        heading: "Flytta från ett annat skrivverktyg",
        body: "Har du redan arbetat med berättelsen någon annanstans behöver du inte börja om.",
        steps: [
          {
            heading: "Vad du kanske redan har",
            body: "Ett manus, karaktärsbeskrivningar, platser, worldbuilding, lore, organisationer, föremål, historik, regler för världen — allt som byggts upp i ett annat verktyg innan du kom hit."
          },
          {
            heading: "kaampi Write kan hjälpa dig ta med det",
            body: "Kapitlen som följer går igenom de specifika verktygen för det: importera ett manus, importera lore, och börja utifrån material du redan har."
          }
        ]
      },
      "import-lore": {
        heading: "Importera lore",
        body: "Öppna: Story Bible → Importera lore.",
        steps: [
          {
            heading: "Klistra in befintligt material",
            body: "Klistra in en artikel eller text från ditt befintliga material. Det kan exempelvis vara: ”Fyrtornet byggdes 1892 på öns norra udde. Tornet har varit obemannat sedan 1987. Lokalbefolkningen undviker platsen efter mörkrets inbrott.”"
          },
          {
            heading: "AI läser och föreslår fakta",
            body: "kaampi Write:s lokala AI läser texten och föreslår fakta. Du granskar sedan förslagen, precis som med Extrahera fakta."
          },
          {
            heading: "Bara de godkända fakta förs vidare",
            body: "Originaltexten sparas inte som en del av boken. Det är de fakta du väljer att godkänna som förs vidare till Story Bible."
          }
        ],
        tip: "Den nuvarande lore-importen arbetar med en artikel eller text i taget."
      },
      "lore-relevance-filter": {
        heading: "Håll en stor importerad Story Bible relevant",
        body: "Två sorters Story Bible-fakta beter sig olika när det kommer till vad Draft faktiskt behöver se.",
        steps: [
          {
            heading: "Manusfakta tas alltid med",
            body: "Fakta som manuset självt har etablerat — skrivet i ett kapitel, eller godkänt från en intervju — tas alltid med i Skriv utkast. De är berättelsens egna minne, och det finns inget säkert sätt att utelämna dem."
          },
          {
            heading: "Importerad lore är annorlunda",
            body: "Importerad lore (Importera lore) är bakgrundsinformation, bara användbar när kapitlet som skrivs faktiskt handlar om det. Med en stor importerad värld kan det svälla prompten rejält att ta med varenda sådan fakta i varje Skriv utkast-anrop — och begrava den handfull som faktiskt är relevant för just det kapitlet."
          },
          {
            heading: "Relevansfiltret",
            body: "Inställningar → Visa bara relevant lore för Skriv utkast (avstängt som standard) ändrar det: en importerad lore-fakta tas bara med om dess eget namn nämns i kapitlet, eller — för en Händelse, som ett historiskt slag eller ett sponsringsavtal — om en deltagare eller platsen nämns istället, även om själva händelsen aldrig nämns vid namn."
          },
          {
            heading: "Pinna en fakta filtret gissar fel på",
            body: "Om filtret någon gång gissar fel på en viss fakta, pinna den: samma cykel-knapp i Story Bible som redan används för att styra en fakta story-tid-position betyder nu också ”ta alltid med den här, oavsett”."
          }
        ]
      },
      "already-have-manuscript": {
        heading: "Du har redan ett manus",
        body: "Har du redan skrivit delar av eller hela berättelsen behöver du inte börja med Brainstorm eller en berättelsemetod. Börja med texten du har.",
        steps: [
          {
            heading: "Ett möjligt arbetsflöde",
            body: "Befintligt manus → Kapitel → Extrahera fakta → Story Bible → Analysera och bearbeta → Fortsätt skriva."
          }
        ],
        tip: "Brainstorm, Synopsis och berättelsemetoder är hjälpmedel. De är inte obligatoriska steg."
      },
      "write-with-ai": {
        heading: "Skriv tillsammans med AI",
        body: "AI behöver inte skriva hela kapitel. Välj det minsta verktyget som faktiskt löser problemet du har just nu — de tre sätten nedan täcker ett tomt kapitel, ett kapitel som redan är på gång, och en enstaka saknad händelse.",
        steps: [
          {
            heading: "Börja med Draft",
            body: "Ett nytt kapitel öppnas tomt, med bara sin brief ovanför sidan. Tryck Draft så skriver modellen hela kapitlet utifrån synopsis, Story Bible, briefen, kameran, Reader och prosaspråket — allt som redan är etablerat, inget du behöver upprepa för hand. Samma knapp fortsätter fungera även när kapitlet redan har viss prosa: den fyller i det som saknas och fortsätter där texten slutar, istället för att börja om.",
            image: { src: "/handbook/write-with-ai/draft-empty-chapter.png", alt: "Ett tomt kapitel med Draft-knappen markerad i verktygsraden under sidan" }
          },
          {
            heading: "Markera en passage för Extend, Elaborate eller Rewrite",
            body: "Markera valfri sträcka text och högerklicka: Extend fortsätter där markeringen slutar, Elaborate utvidgar själva passagen utan att driva berättelsen framåt, och Rewrite… öppnar ett fält för din egen instruktion — till exempel ”gör dialogen mer obekväm utan att personerna säger rakt ut vad de är arga över”. Bara den markerade texten ändras; resten av kapitlet förblir exakt som det var.",
            image: { src: "/handbook/write-with-ai/selection-menu.png", alt: "En markerad mening med högerklicksmenyn öppen, som visar Extend, Elaborate, Rewrite… med mera" }
          },
          {
            heading: "Skriv en beat, utan att markera något",
            body: "Högerklicka utan att markera något och menyn krymper till ett enda par alternativ. Write a beat… beskriver vad som händer härnäst i en rad — ”Nora hör steg i trappan och gömmer brevet innan dörren öppnas” — och modellen skriver bara det: ett kort stycke, inte resten av scenen, infogat exakt vid markören.",
            image: { src: "/handbook/write-with-ai/beat-menu.png", alt: "Markören placerad mitt i ett stycke med högerklicksmenyn öppen, som visar Write a beat… och Drop a placeholder…" }
          }
        ],
        tip: "Prova detta: om ett kapitel kör fast mitt i en scen, ta till Write a beat innan Draft eller Extend — att namnge nästa lilla sak som händer är ofta lättare än att be modellen fortsätta på egen hand, och det håller dig, inte modellen, som den som bestämmer vad som händer härnäst."
      },
      "attached-context": {
        heading: "Bifogad kontext",
        body: "Story Bible håller fakta, men inte alltid de exakta orden en plats, ett föremål eller en karaktär först beskrevs med — och ibland är det precis det som räknas.",
        steps: [
          {
            heading: "Fäst ett tidigare kapitel, eller bara en scen",
            body: "Kapitelinställningar → Bifogad kontext låter ett kapitel fästa ett tidigare kapitel, eller bara en av dess scener, som extra referensmaterial för Skriv utkast och Recast."
          },
          {
            heading: "Faktisk prosa, inte en sammanfattning",
            body: "Till skillnad från Story Bible-fakta skickas det som fästs som sin faktiska prosa — användbart när fyrtornet, till exempel, behöver läsas precis som det först målades upp i kapitel 2, inte bara som Story Bible-faktan ”ett övergivet fyrtorn på norra udden”."
          },
          {
            heading: "Att veta vad det kostar",
            body: "En ungefärlig uppskattning av kostnaden i tokens visas bredvid det som fästs, så du kan se vad det lägger till prompten."
          }
        ]
      },
      "smallest-tool": {
        heading: "Välj minsta verktyget",
        body: "Skrivverktygen skalar nedåt lika väl som uppåt — att matcha verktyget mot storleken på det faktiska behovet ger dig mer kontroll än att generera om stora mängder text.",
        steps: [
          {
            heading: "Vad \"minst\" faktiskt betyder",
            body: "Inte minst ansträngning, och inte enklast att använda — minst betyder hur mycket befintlig text verktyget rör vid. Skriv utkast kan fylla eller skriva om ett helt kapitel. Skriv en beat släpper in ett kort stycke vid markören och lämnar allt annat orört. Brodera ut utvidgar en enskild passage du markerat, utan att driva berättelsen framåt runt den. Ju mindre verktyget är, desto mindre av din egen prosa genereras om — och desto mindre behöver du läsa igenom efteråt för att vara säker på att inget oönskat ändrades."
          },
          {
            heading: "Hur du avgör vilket du behöver",
            body: "Fråga dig själv: hur mycket av den befintliga texten kräver problemet egentligen att du ändrar? En saknad beat behöver ett nytt stycke, inte ett omskrivet kapitel. En tunn passage behöver utvidgas på plats, inte fortsättas framåt. Ta till det minsta verktyget som kan lösa det som faktiskt ligger framför dig, och gå bara upp till ett större — Förläng, Skriv om eller Skriv utkast — när problemet verkligen kräver att så mycket rörs vid."
          },
          {
            heading: "Matcha verktyget mot problemet",
            body: "Helt tomt kapitel → Skriv utkast. En mindre händelse saknas → Skriv en beat. Passagen är för tunn → Brodera ut. Jag behöver komma vidare → Förläng. Jag vet vad jag vill förändra → Skriv om. Jag vill veta om kapitlet fungerar → Analysera."
          }
        ]
      },
      "ai-not-autopilot": {
        heading: "AI är inte autopilot",
        body: "kaampi Write är inte byggt kring ”Skriv min bok.” Det är byggt kring en loop där du håller kontrollen över varje steg.",
        steps: [
          {
            heading: "Loopen",
            body: "Du bestämmer riktningen. AI hjälper där du vill ha hjälp. Du läser resultatet. Du ändrar, behåller eller kastar det. Berättelsen utvecklas."
          },
          {
            heading: "Det finns ingen enda korrekt mängd AI att använda",
            body: "Du kan skriva flera kapitel helt utan AI. Du kan använda AI bara när du fastnar. Eller skapa råutkast som du sedan skriver om kraftigt. Alla är normala sätt att använda kaampi Write."
          }
        ]
      },
      darlings: {
        heading: "Darlings — döda dina älsklingar, behåll kropparna",
        body: "”Kill your darlings” — men en passage som är fel här är inte nödvändigtvis fel överallt. Klipp den utan att förstöra den.",
        steps: [
          {
            heading: "Klipp utan att radera",
            body: "Markera passagen och välj ”Cut to Darlings” i högerklicksmenyn. Passagen lyfts ur kapitlet och läggs på bokens gemensamma darlinghylla — ”N darlings kept”. Den finns kvar, sökbar och återställningsbar, men stör inte utkastet längre."
          },
          {
            heading: "Återställ — eller begrava den på riktigt",
            body: "Från hyllan kan du flytta tillbaka en darling till där den klipptes, eller kasta den för gott när du är säker. Varje klippning och återställning får en egen rad i kapitlets Historik, så du kan alltid spåra vad som flyttats vart."
          }
        ]
      },
      placeholders: {
        heading: "Platshållare",
        body: "En fråga mitt i skrivandet behöver inte bryta flödet.",
        steps: [
          {
            heading: "Släpp en notis och fortsätt",
            body: "Högerklicka där frågan dyker upp — ”vad hette den här karaktärens efternamn igen?” — och släpp en platshållar-notis, fortsätt sedan skriva. En liten nål markerar var den sitter i texten; klicka på den när som helst för att läsa notisen, redigera den eller markera den som löst."
          },
          {
            heading: "Hitta öppna platshållare senare",
            body: "Ett kapitel med en öppen platshållare får en liten prick i kapitellistan, och en kompakt ”N platshållare att återvända till”-panel listar varje öppen i boken med en direktlänk till dess kapitel."
          }
        ],
        tip: "Korrekturläsning kontrollerar också om någon fortfarande är öppen innan den körs, ifall en glömts bort."
      },
      "pov-tense-voice": {
        heading: "Perspektiv, tempus och berättarröst",
        body: "En roman vet hur den ska berättas. kaampi Write kan veta det med den.",
        steps: [
          {
            heading: "Bokens berättarkonvention",
            body: "Välj på boknivå hur berättelsen ska låta: perspektiv (första, andra eller tredje person), tempus (dåtid eller nutid), synvinkel (vem som ser och vet) och berättarröst (den ton och det avstånd som bär hela verket). Inställningarna gäller hela boken — korrekturläsningen använder dem, och AI:n håller sig till dem när den föreslår text."
          },
          {
            heading: "Kapitel som bryter mönstret — med vilje",
            body: "En prolog i jag-form i en roman som är i tredje person. Ett finalkapitel som hoppar till nutid i en bok som annars är berättad i dåtid. Sätt avvikelsen på det enskilda kapitlet, och resten av boken märker ingenting: huvudinställningarna gäller alla andra kapitel som vanligt."
          },
          {
            heading: "Perspektivbyte är mer än pronomen",
            body: "Att flytta en roman från ”hon” till ”jag” handlar inte om sök-och-ersätt — det handlar om vem som får veta vad, vilka tankar som syns och var skuggorna faller. kaampi Write håller reda på konventionerna, men efter en större omskrivning i nytt perspektiv bör du alltid läsa resultatet noggrant — särskilt om AI:n fått göra grovjobbet."
          }
        ]
      },
      reader: {
        heading: "Läsare",
        body: "Säg vem berättelsen är för, så skriver AI:n mot den läsaren — inte mot en genomsnittsperson.",
        steps: [
          {
            heading: "En målgrupp förändrar prosan",
            body: "En ungdomsroman i jag-form tål korta, riviga meningar och ett rakt tonläge. En psykologisk thriller för vuxna bär längre, tyngre repliker. När du anger berättelsens läsare använder AI:n det som vägledning — ordval, meningsbyggnad, ton — när den skriver tillsammans med dig, och lämnar det som inte passar den läsaren på hyllan."
          },
          {
            heading: "Ett skrivstöd, inte en åldersmärkning",
            body: "Det här är stöd för skrivandet, ingen åldersgräns. Läsarinställningen bestämmer inte vilken ålder den färdiga boken passar för — det avgör du fortfarande själv, kapitel för kapitel."
          }
        ]
      },
      "author-voice": {
        heading: "Författarröst",
        body: "Två författare som beskriver samma händelse skriver två olika böcker. Författarrösten är hur din prosa ska kännas — och den hjälper AI:n att skriva som du, inte som en genomsnittsförfattare.",
        steps: [
          {
            heading: "Vad du kan styra",
            body: "Meningslängd och rytm. Hur mycket miljö som får synas innan handlingen går vidare. Hur tät dialogen är, hur mycket som lämnas osagt mellan raderna. Direkt eller återhållsamt språk, nakna verb eller blommande metaforer. Allt som gör att en läsare känner igen en sida utan att se ditt namn på den."
          },
          {
            heading: "Vägledning, inte regel",
            body: "Författarrösten styr vad AI:n strävar mot när den föreslår text — den styr aldrig vad du får skriva. En mening som bryter mot din egen stil är inte ett fel, det är ett val. Din text har alltid sista ordet."
          }
        ]
      },
      "live-formatting": {
        heading: "Formatering medan du skriver",
        body: "Tre saker händer automatiskt medan du skriver — ingen av dem kräver en meny, och en av dem kräver ett verktygsfält istället.",
        steps: [
          {
            heading: "Fet, kursiv, understruken",
            body: "Markera text och klicka antingen på det flytande verktygsfältet som visas ovanför markeringen, eller använd Ctrl/Cmd+B, Ctrl/Cmd+I eller Ctrl/Cmd+U. Till skillnad från de andra två sakerna här är det här ett medvetet val — inget du skriver blir fetstilt eller kursivt av sig självt."
          },
          {
            heading: "Scenbrytningar",
            body: "Skriv tre eller fler bindestreck — ”---” — ensamma i ett eget stycke, så renderas det som en scenbrytning istället för bokstavliga streck så snart du avslutar raden. Vilket ornament som visas (en vanlig kort linje, eller en av fyra dekorativa stilar) ställs in en gång för hela manuset i Settings → Typography → Scene break."
          },
          {
            heading: "Citerade passager",
            body: "Börja ett stycke med ”> ” så renderas det som ett indraget block med en linje nerför sidan — ungefär som ett brev eller ett meddelande inuti berättelsen kan se ut. Själva ”>”-tecknet försvinner från vyn; bara texten visas."
          },
          {
            heading: "Anfanget följer första stycket automatiskt",
            body: "Om Settings → Typography → Drop cap är satt till något annat än Off får den öppnande bokstaven i det som för tillfället är kapitlets första stycke den förstorade behandlingen. Inget att skriva — det följer bara vilket stycke som råkar vara först."
          }
        ],
        tip: "Har du redan text med raka citattecken någon annanstans ifrån? Se Smarta citattecken (Skriva) — samma sorts levande konvertering, med ett samlat ”Smarten quotes in whole manuscript” för allt som klistrats in eller importerats innan det här beteendet fanns."
      },
      "smart-quotes": {
        heading: "Smarta citattecken",
        body: "Ett rakt \" du skriver i kapitelredigeraren blir automatiskt ett riktigt öppnande eller stängande kurvigt citattecken, beroende på vad som kommer precis innan — inget att tänka på, inget att slå på.",
        steps: [
          {
            heading: "Konvertera befintlig text",
            body: "Har du redan text med raka citattecken — inklistrad, eller importerad någon annanstans ifrån? Tools → Convert markers → ”Smarten quotes in whole manuscript” konverterar varje ett som redan finns i manuset på samma sätt, i ett enda svep."
          }
        ]
      },
      "analyze-chapter": {
        heading: "Analysera ett kapitel",
        body: "Analysera granskar texten utan att skriva om den åt dig. Syftet är att hjälpa dig upptäcka sådant du själv kanske vill undersöka närmare.",
        steps: [
          {
            heading: "Tänk på det som en extra läsare",
            body: "Inte: ”Så här ska du skriva.” Utan: ”Här finns något du kanske vill titta på.”"
          },
          {
            heading: "Du bestämmer vad som är relevant",
            body: "Analysera bara pekar ut saker — du bestämmer om varje synpunkt faktiskt är värd att agera på."
          }
        ]
      },
      polish: {
        heading: "Polish",
        body: "Där Analysera bara pekar ut saker, skriver Polish om.",
        steps: [
          {
            heading: "Vad den städar upp",
            body: "Den kör en städpassage över hela kapitlet — stryker inskjutna förklaringar, känslo-namngivning (”hon kände en stöt av ånger”), vaga påståenden, lila prosa, och stramar upp dialog."
          },
          {
            heading: "Jämför innan du bestämmer dig",
            body: "Den visar sedan originalet och omskrivningen sida vid sida, med ordnivå-markering, innan något behålls. Acceptera eller förkasta — inget rör kapitlet förrän du säger till."
          },
          {
            heading: "Anpassa den efter din röst",
            body: "Om Polishs standardinstinkter inte matchar din röst — kanske du vill behålla mer känslo-namngivning, inte mindre — kan du redigera instruktionerna den ger modellen i Settings → Polish, per manus."
          }
        ]
      },
      continuity: {
        heading: "Kontinuitet",
        body: "Ju längre manuset blir, desto svårare blir det att minnas allt. En person kan få olika ögonfärg. En plats kan plötsligt förändras. En karaktär kan verka känna till information som hen ännu inte borde känna till.",
        steps: [
          {
            heading: "Jämföra mot det som redan är etablerat",
            body: "Här hjälper Story Bible och berättelsens kontinuitetsverktyg dig att jämföra det du skriver med sådant som redan etablerats."
          },
          {
            heading: "Vem vet vad?",
            body: "Kontinuitet handlar inte bara om fysiska detaljer. Det handlar också om information. Läsaren kanske känner till en hemlighet. Det betyder inte att alla karaktärer gör det."
          }
        ],
        tip: "Det blir särskilt viktigt i mysterier, thrillers, flera perspektiv och berättelser där information avslöjas stegvis."
      },
      "ask-manuscript": {
        heading: "Fråga manuset",
        body: "När boken blivit lång kan du använda Fråga manuset för att undersöka din egen berättelse.",
        steps: [
          {
            heading: "Faktafrågor om det som redan är skrivet",
            body: "”När träffar Erik kvinnan på tåget första gången?” ”I vilka kapitel nämns fyrtornet?” ”Vad vet Lena om Eriks far?” ”När får läsaren veta att fotografiet är från 1932?”"
          },
          {
            heading: "Bredare frågor också",
            body: "”Vilka kapitel handlar mest om relationen mellan Nora och Elias?” eller: ”Var nämns nyckeln innan den blir viktig senare?”"
          }
        ],
        tip: "Svaret är ett hjälpmedel för dig. Det blir inte automatiskt kanon och ska inte i sig förändra kapitlen."
      },
      "ask-about-passage": {
        heading: "Fråga om ett kapitel eller en passage",
        body: "Analysera kollar fasta kategorier. Fråga manuset svarar på faktafrågor om det som redan är skrivet. Ingen av dem kan svara på något i stil med: ”Bygger det här upp mot ett starkt slut?” eller ”Känns det här argumentet trovärdigt, eller konstruerat?” — Fråga om kapitlet / Fråga om en passage är till för just den typen av fråga.",
        steps: [
          {
            heading: "Två sätt att använda det",
            body: "”Fråga om kapitlet…” (bredvid Analysera) frågar om hela kapitlet. Markera en passage i texten, välj sedan ”Fråga…” i dess meny, för att bara fråga om den passagen, med den omgivande texten som sammanhang."
          },
          {
            heading: "Vilken typ av fråga det är till för",
            body: "”Får slutet dig att vilja läsa nästa kapitel?” ”Visar den här scenen för mycket, för fort?” Din egen fråga om hantverket, med ett ärligt — och kritiskt, om du ber om det — svar."
          }
        ],
        tip: "Svaret är bara till för att läsas. Inget ändras eller sparas — precis som Fråga manuset."
      },
      history: {
        heading: "Historik",
        body: "AI-assisterat skrivande innebär ofta experiment. En omskrivning kanske blir bättre. Eller så upptäcker du att den gamla versionen fungerade bättre.",
        steps: [
          {
            heading: "Jämföra och gå tillbaka",
            body: "När tidigare versioner finns tillgängliga kan Historik hjälpa dig jämföra och gå tillbaka. Tänk: Prova → Läs → Behåll eller återgå."
          }
        ],
        tip: "Du behöver inte acceptera en förändring bara för att AI skapade den."
      },
      proofread: {
        heading: "Korrekturläs",
        body: "Korrekturläsning passar senare i processen. Tidigare kanske frågan var: ”Hur kan scenen utvecklas?” Nu blir frågan: ”Finns det något här som behöver rättas eller kontrolleras?”",
        steps: [
          {
            heading: "Arbeta från stort till smått",
            body: "Det är sällan meningsfullt att finslipa varje mening om du fortfarande tänker skriva om hela kapitel. Berättelsen → Kontinuiteten → Kapitlen → Developmental analysis → Polish → Korrekturläsningen → Din egen slutläsning."
          },
          {
            heading: "Sju kontroller i ett svep",
            body: "Korrekturläs kör sju kontroller över hela manuset samtidigt — grammatik, upprepade scener, stil- och stämningskonsekvens mellan kapitel, en åldersrapport, kontinuitet, upplägg och betalningar, samt en faktakontroll mot Story Bible."
          },
          {
            heading: "En påminnelse innan den startar",
            body: "Den varnar först om det finns en öppen platshållar-notis som fortfarande väntar, ifall den glömts bort på vägen."
          }
        ],
        tip: "AI kan hitta saker. Författaren avgör vad som fungerar."
      },
      "developmental-analysis": {
        heading: "Developmental analysis",
        body: "Korrekturläs läser rad för rad. Developmental analysis läser hela bokens form istället: stiger spänningen verkligen allt eftersom berättelsen går vidare, sjunker mitten ihop, vilka Trådar betalas faktiskt av och vilka tystnar i tio kapitel.",
        steps: [
          {
            heading: "Tre steg, aldrig hela boken på en gång",
            body: "Den arbetar i tre steg — scen för scen, sedan kapitel för kapitel, sedan en slutlig rapport — aldrig hela manuset i ett enda svep, så den förblir hanterbar även för en lång bok."
          },
          {
            heading: "Grundad i Trådar och Timeline, men inte beroende av dem",
            body: "En manuellt startad körning, inget som sker automatiskt. Den grundar sig i vilka Tråd-taggar och Timeline-positioner manuset redan har, men fungerar även utan — bara en grövre läsning, och den säger det innan den startar."
          },
          {
            heading: "Vad du faktiskt ser",
            body: "Det enda du någonsin ser är slutrapporten: en sammanfattning i löpande text, plus en klickbar lista över specifika kapitel värda en titt. Scen-för-scen- och kapitel-för-kapitel-läsningarna under förblir intern arbetsdata — samma ”aldrig rådata, alltid syntetiserat”-princip som överallt annars där AI granskar ditt skrivande."
          }
        ]
      },
      "images-illustrations": {
        heading: "Bilder och illustrationer",
        body: "kaampi Write kan hjälpa dig arbeta med bilder på två olika sätt.",
        steps: [
          {
            heading: "Egna bilder",
            body: "Du kan lägga till bilder till berättelsen. Det kan vara användbart för illustrerade berättelser, barnböcker eller projekt där bilder är en del av läsupplevelsen."
          },
          {
            heading: "Illustrationsprompter",
            body: "Du kan också använda text ur berättelsen som grund för en bildbeskrivning. Exempel — manus: ”Erik stod ensam på perrongen. Dimman låg tät över spåren och stationsklockan hade stannat på 03:17.” kaampi Write kan hjälpa dig omvandla passagen till en illustrationsprompt baserad på motivet och projektets valda visuella stil. Själva berättelsetexten ändras inte."
          }
        ]
      },
      typography: {
        heading: "Typografi",
        body: "Settings → Typography formar hur prosan faktiskt ser ut, live i editorn och med i varje Publish-export — så det du ser medan du skriver är det läsaren får.",
        steps: [
          {
            heading: "Typsnitt och vikt",
            body: "Font — ett val mellan tretton typsnitt, serif och sans serif, var och en visad i sitt eget typsnitt så du kan skilja dem åt innan du väljer. Weight — Regular eller Bold, för prosa som ligger tyngre på sidan."
          },
          {
            heading: "Färg",
            body: "En nyans för mörkt tema, en för ljust, så den förblir läsbar och medveten i båda."
          },
          {
            heading: "Drop cap och scenbrytning",
            body: "Drop cap — av, eller 2–5 rader, för kapitlets öppnande bokstav. Scene break — den vanliga korta linjen, eller en av fyra namngivna ornament (en klassisk bokvinjett, en minimalistisk diamant, fransk elegans eller en glittrande stjärna) för ett `---`-stycke."
          }
        ],
        tip: "Inget av detta krävs. Standardvärdena är en rimlig utgångspunkt; Typography finns där för när sidans utseende börjar betyda lika mycket som orden på den."
      },
      "language-versions": {
        heading: "Språkversioner av ett manus",
        body: "Ett färdigt — eller fortfarande växande — manus kan spinna av en separat, länkad utgåva på ett annat språk.",
        steps: [
          {
            heading: "Starta en språkversion",
            body: "Från språkväxlaren bredvid manustiteln (”New language version…”). Dess kapitel skapas tomma i förväg, var och en länkad till sin motsvarighet i källan."
          },
          {
            heading: "Att översätta ett kapitel",
            body: "Översätt vart och ett från kapitelredigeraren (”Translate chapter”) — den för med sig källkapitlets prosa tillsammans med manusets Story Bible och Röst, så namn och termer förblir konsekventa genom hela översättningen, inte bara inom den."
          },
          {
            heading: "När källkapitlet ändras senare",
            body: "Det översatta kapitlet flaggar det (”Source changed since this was translated”), med en diff på samma språk som visar exakt vad som ändrats, och en ”Re-translate chapter”-åtgärd. Manushyllan grupperar ett källmanus tillsammans med sina språkversioner, istället för att lista dem som orelaterade böcker."
          }
        ],
        tip: "Settings → AI settings har ett tredje modellval för detta, Translate, vid sidan av Writing och Review."
      },
      publish: {
        heading: "Publicera",
        body: "När berättelsen är redo att lämna arbetsytan använder du Publicera.",
        steps: [
          {
            heading: "Verkstad kontra färdig kopia",
            body: "kaampi Write-projektet är din verkstad. Publiceringen är det läsaren får. Brainstorm, arbetsanteckningar och annan planering behöver alltså inte följa med i den publicerade berättelsen."
          },
          {
            heading: "Att välja en styckestil",
            body: "Paragraph style erbjuder två konventioner: den invanda tomma raden mellan stycken, eller en indragen stil utan tom rad i klassisk bokstil, med kapitlets öppnande stycke satt utan indrag, som i tryck."
          }
        ],
        tip: "Välj det format som passar hur texten ska användas, och arbeta sedan vidare med resultatet där det behövs."
      },
      backup: {
        heading: "Säkerhetskopiera",
        body: "Publicering och säkerhetskopiering är inte samma sak.",
        steps: [
          {
            heading: "En publicerad bok kontra en säkerhetskopia",
            body: "En publicerad bok är till för läsaren. En kaampi Write-säkerhetskopia är till för att kunna återställa själva projektet. Den kan därför innehålla information som inte finns i den publicerade versionen."
          },
          {
            heading: "Importera backup är inte manusimport",
            body: "Importera backup används för kaampi Write:s egna säkerhetskopior. Det är inte samma sak som att importera ett manus eller lore från ett annat skrivprogram."
          },
          {
            heading: "Export for other apps",
            body: "En tredje, annorlunda sak — varken en säkerhetskopia eller en läskopia. Den skriver en ögonblicksbild i ett delat format för ett syskonprogram (som kaampi Comic) att importera: låsta, synliga Story Bible-fakta och kapitel, grupperade efter sort. Olåsta, flaggade eller dolda-för-AI-fakta finns aldrig med — samma synlighetsregel som Skriv utkast själv följer."
          }
        ],
        tip: "Spara säkerhetskopior regelbundet, särskilt innan större förändringar."
      },
      "network-ai-server": {
        heading: "En AI-server på en annan dator i nätverket",
        body: "Har du en kraftfull dator eller server på samma nätverk, och vill skriva på kaampi Write från en annan dator — en bärbar, till exempel? Det går, men kräver inställningar på tre ställen: i kaampi Write, på serverdatorn, och i dess brandvägg.",
        steps: [
          {
            heading: "Välj motorn som matchar det som körs där",
            body: "Öppna Inställningar → Modeller. Oavsett om den andra datorn kör Ollama eller LM Studio, välj samma motor här — båda har nu ett fält för serveradress."
          },
          {
            heading: "Skriv in den andra datorns nätverksadress",
            body: "I fältet Serveradress: http://[den andra datorns nätverks-IP]:[port] — till exempel http://192.168.1.50:11434 för Ollama, eller http://192.168.1.50:1234 för LM Studio. Lämna tomt för att använda den här datorns egen standard istället. Lägg inte till /v1 på slutet, kaampi Write gör det själv. Hitta den andra datorns nätverksadress med ipconfig (Windows) eller ifconfig/ip addr (Mac/Linux) på just den datorn."
          },
          {
            heading: "Låt servern lyssna på nätverket, inte bara sig själv",
            body: "Kör den andra datorn Ollama: starta den med miljövariabeln OLLAMA_HOST=0.0.0.0 så den lyssnar brett, och OLLAMA_ORIGINS satt till adressen kaampi Write faktiskt körs ifrån (eller OLLAMA_ORIGINS=* för att tillåta vilken adress som helst) — annars nekar den webbläsarens anrop även om själva anslutningen fungerar. Kör den LM Studio: fliken Developer → Server-inställningarna → slå på ”Serve on Local Network” och ”Enable CORS”."
          },
          {
            heading: "Brandväggen på serverdatorn",
            body: "Den måste tillåta inkommande anslutningar på porten (11434 för Ollama, oftast 1234 för LM Studio) från resten av nätverket — annars släpps anropet aldrig igenom, även om allt ovan är rätt."
          }
        ],
        tip: "Varje dator har för övrigt sitt eget bibliotek av manus — bara AI-anslutningen delas, inte det du skrivit. Vill du fortsätta på samma bok från båda datorerna, använd Backup/Återställ för att flytta den."
      },
      "ai-writing-wrong-things": {
        heading: "Om AI börjar skriva fel saker",
        body: "Fundera först på vilken information modellen faktiskt har fått.",
        steps: [
          {
            heading: "Kapitelbriefen är gammal",
            body: "Kontrollera om briefen fortfarande beskriver kapitlet du vill skriva."
          },
          {
            heading: "Synopsis har inte följt med berättelsens utveckling",
            body: "Berättelsen kanske har förändrats sedan du planerade den."
          },
          {
            heading: "Idén finns bara i Brainstorm, eller kommer bara från en intervju",
            body: "Brainstorm är ett utforskande område. En idé där ska inte automatiskt behandlas som en del av berättelsen. Samma princip gäller en intervju — det som sades påverkar inte hur boken skrivs om du inte har valt att låsa informationen som fakta."
          },
          {
            heading: "Viktig information saknas i Story Bible",
            body: "Om något måste vara konsekvent kan det behöva etableras och låsas som fakta."
          },
          {
            heading: "Din instruktion är för bred",
            body: "Istället för: ”Skriv om scenen så att den blir bättre,” prova: ”Gör dialogen mellan Nora och Elias mer reserverad. De misstänker varandra men ingen vill visa det ännu.”"
          }
        ],
        tip: "Ju tydligare problemet är, desto lättare blir det att välja rätt verktyg."
      },
      "marker-conversion-no-match": {
        heading: "”Convert markers to formatting” hittar inga markeringar",
        body: "Två olika orsaker, beroende på vad du försöker konvertera.",
        steps: [
          {
            heading: "Om det här gäller citattecken specifikt",
            body: "Du behöver nog inte Convert markers för det alls längre. Se Smarta citattecken (Skriva) — ett rakt \" blir redan kurvigt medan du skriver, och ”Smarten quotes in whole manuscript” konverterar ett helt importerat eller inklistrat manus i ett svep, raka citattecken inkluderat."
          },
          {
            heading: "För allt annat Convert markers hanterar",
            body: "*Asterisker* för kursiv, egna par du satt upp — ”inget hittades” betyder oftast att tecknet du skrev in i fältet inte är exakt samma tecken som finns i manuset. Lätt hänt med skiljetecken som finns i mer än en likadan-ut-seende form."
          },
          {
            heading: "Den säkraste lösningen",
            body: "Öppna kapitlet, markera ett av de riktiga tecknen i din text, kopiera det (Ctrl/Cmd+C), och klistra in det i fältet för öppnings- eller avslutningstecken istället för att skriva om det på tangentbordet. Då är det garanterat exakt rätt tecken."
          }
        ]
      },
      "routine-short-often": {
        heading: "Skriv lite, men ofta",
        body: "Det svåraste med att skriva är ibland att komma igång. Små förändringar i rutinen kan göra stor skillnad — det här kapitlet och de fyra efter ger fem tips som hjälper dig skapa goda vanor, hitta fokus och komma vidare när du kör fast.",
        steps: [
          {
            heading: "Korta pass kan slå väntan på rätt tillfälle",
            body: "Du behöver inte flera lediga timmar för att få något skrivet. Korta, regelbundna skrivpass kan vara mer effektiva än att vänta på det perfekta tillfället."
          }
        ],
        tip: "Prova själv: Avsätt 15–30 minuter några dagar i veckan. Fokusera på att skriva, inte på hur mycket du hinner producera."
      },
      "routine-draft-then-edit": {
        heading: "Skriv först, redigera sedan",
        body: "Det är svårt att vara kreativ och kritisk samtidigt. Om du hela tiden stannar för att rätta formuleringar riskerar du att tappa både fokus och berättelsens riktning.",
        steps: [
          {
            heading: "Låt första utkastet vara ett utkast",
            body: "Du kan förbättra språket senare — första passet behöver bara få ner berättelsen."
          }
        ],
        tip: "Prova själv: Skriv en scen utan att gå tillbaka och ändra. Läs igenom och redigera först när scenen är klar."
      },
      "routine-set-time-place": {
        heading: "Bestäm när och var du ska skriva",
        body: "Det är lätt att skjuta upp något som inte har en bestämd tid. En konkret plan gör det enklare att faktiskt sätta sig och skriva.",
        steps: [
          {
            heading: "Byt avsikt mot en plan",
            body: "Byt ut \"Jag ska försöka skriva mer\" mot \"På lördag efter frukost skriver jag i 30 minuter\"."
          }
        ],
        tip: "Prova själv: Välj en tid och en plats som fungerar i din vardag. Koppla gärna skrivandet till något du redan gör regelbundet."
      },
      "routine-pause-when-stuck": {
        heading: "Ta en paus när du kör fast",
        body: "Ibland hjälper det inte att stirra längre på samma mening eller scen. Att göra något annat en stund kan ge dig nya perspektiv.",
        steps: [
          {
            heading: "Kliv bort med avsikt",
            body: "Ta en promenad, diska eller gör något som inte kräver all din uppmärksamhet. När du återvänder kan problemet kännas lättare att lösa."
          }
        ],
        tip: "Prova själv: Skriv ned vad du har fastnat på innan du tar paus. Då blir det enklare att fortsätta när du kommer tillbaka."
      },
      "routine-read-widely": {
        heading: "Läs för att utveckla ditt skrivande",
        body: "Genom att läsa olika författare och genrer får du en bättre känsla för språk, dialog, tempo och berättelsestruktur.",
        steps: [
          {
            heading: "Du behöver inte analysera varje bok",
            body: "Men ibland kan det vara värdefullt att fundera över varför en scen fungerar särskilt bra."
          }
        ],
        tip: "Prova själv: Nästa gång en bok fångar dig, stanna upp och fråga dig: Vad gjorde författaren för att väcka mitt intresse?"
      },
      "opening-raise-a-question": {
        heading: "Väck en fråga hos läsaren",
        body: "De första sidorna hjälper läsaren att avgöra om berättelsen är värd att fortsätta med — det här kapitlet och de tre efter går igenom fyra sätt att skapa en inledning som väcker nyfikenhet.",
        steps: [
          {
            heading: "En bra öppning behöver inte dramatik",
            body: "Men något bör väcka läsarens intresse. Det kan vara en oväntad händelse, ett märkligt beteende eller något som inte verkar stämma."
          },
          {
            heading: "Att undra är det som håller läsaren kvar",
            body: "När läsaren börjar undra vad som har hänt, varför det händer eller vad som kommer att ske, finns det en anledning att läsa vidare."
          }
        ],
        tip: "Fråga dig: Vilken fråga vill jag att läsaren ska bära med sig efter första sidan?"
      },
      "opening-wait-on-backstory": {
        heading: "Vänta med bakgrundshistorien",
        body: "Du behöver inte berätta allt om huvudpersonen eller världen direkt.",
        steps: [
          {
            heading: "För mycket bakgrund bromsar öppningen",
            body: "För mycket bakgrundsinformation i början kan bromsa berättelsen innan läsaren hunnit bli engagerad."
          },
          {
            heading: "Visa bara det som behövs, för tillfället",
            body: "Visa i stället det som behövs för att förstå situationen. Låt resten av informationen komma när den blir relevant."
          }
        ],
        tip: "Fråga dig: Behöver läsaren verkligen veta det här redan nu?"
      },
      "opening-let-details-show": {
        heading: "Låt detaljerna berätta",
        body: "Du behöver inte alltid beskriva en persons egenskaper rakt ut. Ofta blir karaktären mer levande genom vad personen gör, säger eller lägger märke till.",
        steps: [
          {
            heading: "Visa egenskapen genom en handling",
            body: "I stället för att skriva att en person är kontrollerande kan du till exempel visa hur personen rättar till föremålen på ett bord innan ett svårt samtal."
          }
        ],
        tip: "En väl vald detalj kan säga mer än en lång förklaring. Fråga dig: Kan jag visa den här egenskapen genom en handling eller detalj?"
      },
      "opening-save-the-surprises": {
        heading: "Spara på överraskningarna",
        body: "Det kan vara lockande att börja med berättelsens mest dramatiska händelse för att fånga läsaren.",
        steps: [
          {
            heading: "Att avslöja för mycket för tidigt kostar senare",
            body: "Om du avslöjar för mycket för tidigt riskerar senare vändningar att förlora sin effekt."
          },
          {
            heading: "En prolog eller tillbakablick kan ändå fungera",
            body: "Så länge den tillför något mer än en förhandsvisning av det som ska hända."
          }
        ],
        tip: "Fråga dig: Väcker min öppning nyfikenhet, eller avslöjar den sådant som hade varit mer spännande att upptäcka senare?"
      },
      "voice-overexplaining": {
        heading: "Ge din text en personlig röst",
        body: "AI-verktyg kan hjälpa dig att skriva och bearbeta text. Men resultatet behöver fortfarande kännas som din berättelse. När du använder Draft, Recast eller Polish kan det vara bra att se över några återkommande mönster — det här kapitlet och de tre efter går igenom fyra av dem.",
        steps: [
          {
            heading: "Förklarar texten för mycket?",
            body: "Ibland säger berättaren rakt ut vad en händelse betyder eller vad läsaren ska känna."
          },
          {
            heading: "Låt berättelsen tala för sig själv",
            body: "Låt gärna handlingen, dialogen och karaktärernas val tala för sig själva. Läsaren behöver inte få allt förklarat."
          }
        ]
      },
      "voice-too-predictable": {
        heading: "Är berättelsen för förutsägbar?",
        body: "Om varje händelse leder direkt till nästa kan berättelsen kännas väl tillrättalagd.",
        steps: [
          {
            heading: "Frågor värda att ställa",
            body: "Fundera på om karaktärerna har egna mål, om det finns konflikter vid sidan av huvudhandlingen och om något kan utvecklas på ett oväntat men trovärdigt sätt."
          }
        ]
      },
      "voice-varied-emotion": {
        heading: "Beskrivs känslor på samma sätt?",
        body: "En klump i magen, ett hjärta som rusar eller händer som skakar kan fungera bra. Men om varje känsla beskrivs genom en kroppslig reaktion blir språket lätt enformigt.",
        steps: [
          {
            heading: "Variera sättet",
            body: "Variera mellan handlingar, tankar, dialog, kroppsliga reaktioner och direkta känsloord."
          }
        ]
      },
      "voice-straight-timeline": {
        heading: "Följer allt en rak tidslinje?",
        body: "En berättelse behöver inte alltid följa händelserna i exakt den ordning de inträffar.",
        steps: [
          {
            heading: "Tillbakablickar och tidshopp kan ge ny betydelse",
            body: "Tillbakablickar, tidshopp och förändringar i perspektiv kan ibland skapa spänning eller ge en händelse ny betydelse."
          },
          {
            heading: "Använd dem medvetet",
            body: "Använd dem när de stärker berättelsen — inte bara för variationens skull."
          }
        ],
        tip: "Det här är inga regler för hur en berättelse måste skrivas. Se dem som frågor att ställa när du bearbetar din text. Det viktigaste är att språket, strukturen och berättarstilen passar just din historia."
      },
      "writing-tips-sources": {
        heading: "Källor och vidare läsning",
        body: "Tipsen bygger på följande forskning och litteratur om skrivvanor, kreativitet, språkutveckling och berättarteknik.",
        steps: [
          {
            heading: "Skrivvanor och kreativitet",
            body: "Boice, R. (1990). Procrastination, busyness and bingeing. Behaviour Research and Therapy, 27(6), 605–611. Kellogg, R. T. (1996). A model of working memory in writing. Memory & Cognition, 24(3), 318–329. Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503. Sio, U. N. & Ormerod, T. C. (2009). Does incubation enhance problem solving? Psychological Bulletin, 135(1), 94–120. Krashen, S. (2004). The Power of Reading: Insights from the Research. Libraries Unlimited."
          },
          {
            heading: "Berättarteknik och AI-genererad text",
            body: "Ephron, H. The Importance of a Strong Opening Scene. Writer's Digest. StoryScope. Forskning från University of Maryland och Google DeepMind om berättarmönster i AI-genererad text (arxiv.org/html/2604.03136v6)."
          }
        ],
        tip: "Tipsen är praktiska rekommendationer, inte absoluta regler. Anpassa dem efter ditt eget skrivande."
      }
    }
  },
  scenes: {
    toggleCount: {
      one: "{count} scen",
      other: "{count} scener"
    },
    titlePlaceholder: "Namnlös scen",
    titleLabel: "Titel för scen {index}",
    briefPlaceholder: "Skrivanteckning bara för den här scenen (frivilligt)",
    briefLabel: "Anteckning för scen {index}",
    mergeWithNext: "Slå ihop med nästa ↓",
    splitHere: "Dela i två…",
    splitHint: "Välj var den nya scenen ska börja:",
    draft: "Skriv utkast",
    recast: "Omskriv",
    analyze: "Analysera",
    addScene: "Lägg till scen",
    addSceneDisabledHint: "Skriv klart den här scenen innan du lägger till nästa"
  },
  publish: {
    title: "Publicera",
    body: "En läsbar kopia av berättelsen. Lämnar brainstorm utanför. RTF och ODT öppnas i Scrivener. HTML öppnas i valfri webbläsare. ePub öppnas i en e-boksläsare. PDF är redo att skriva ut. IDML öppnas i InDesign, för den som vill göra bokens egna sidlayout där — en hög sida per kapitel, ingen sidlayout redan vald åt dig.",
    documentName: "Dokumentnamn",
    format: "Format",
    font: "Typsnitt",
    systemFont: "Standardserif (Times/Georgia)",
    fontSetInSettings: "ställs in i Settings → Typography",
    paragraphStyle: "Styckeformat",
    paragraphStyleSpaced: "Tom rad mellan stycken",
    paragraphStyleIndented: "Indrag, ingen tom rad (klassiskt bokformat)",
    action: "Publicera",
    markdown: "Markdown",
    txt: "Ren text",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub",
    pdf: "PDF",
    idml: "IDML (InDesign)"
  },
  progress: {
    title: "Framsteg",
    setGoal: "Sätt mål",
    editGoal: "Ändra mål",
    removeGoal: "Ta bort mål",
    saveGoal: "Spara mål",
    targetWordsLabel: "Målantal ord",
    deadlineLabel: "Slutdatum",
    daysPerWeekLabel: "Skrivdagar per vecka",
    wordsOfTarget: "{current} av {target} ord",
    percentComplete: "{percent} % dit",
    dailyPaceNeeded: "~{perDay} ord/dag behövs för att hinna",
    overdue: "Slutdatum passerat — {remaining} ord kvar",
    targetReached: "Mål uppnått"
  },
  find: {
    action: "Sök/Ersätt",
    title: "Sök och ersätt",
    body: "Träffarna markeras i textfältet. Pilarna hoppar till nästa eller föregående. Story Bible lämnas. Brainstorm lämnas om du inte tar med den.",
    find: "Sök",
    replaceWith: "Ersätt med",
    matchCase: "Skilj på versaler",
    wholeWord: "Hela ord",
    includeBrainstorm: "Ta med brainstorm",
    here: "Den här sidan",
    echoes: "Upprepade ord",
    phrases: "Upprepade fraser",
    noneEcho: "Inga upprepade ord på den här sidan.",
    nonePhrases: "Inga upprepade fraser på den här sidan.",
    none: "Inget matchar.",
    hits: { one: "{count} träff", other: "{count} träffar" },
    snippetHint: "Raderna under en rubrik är ordet med texten runt om. Sökrutan ligger ovanpå sidan, så ställena listas här.",
    moreSnippets: "Och {count} till på den här platsen.",
    fields: {
      title: "Titel",
      brief: "Disposition",
      voice: "Författarröst",
      viewpoint: "Synvinkel"
    },
    replace: "Ersätt",
    replaceCount: "Ersätt {count}",
    showHit: "Visa {place}",
    untitled: "Namnlöst",
    prev: "Föregående träff",
    next: "Nästa träff",
    position: "{current} av {total}"
  },
  proofread: {
    action: "Korrekturläsning",
    title: "Korrekturläsning",
    runningTitle: "Korrekturläsning pågår — bra tillfälle för en fika.",
    lede: "En sista Review-runda över hela manuset. Bara citat och anteckningar. Ingenting skrivs om.",
    grammar: "Grammatik",
    scenes: "Upprepade scener",
    style: "Stil och känsla mellan kapitel",
    age: "Åldersrapport",
    continuity: "Kontinuitet",
    setups: "Planterat & inlöst",
    facts: "Faktakontroll",
    grammarProgress: "Grammatik — {done} av {total} kapitel klara",
    scenesProgress: "Letar upprepade scener — {done} av {total} styckepar jämförda",
    styleProgress: "Stil- och känslokonsekvens mellan kapitel",
    ageProgress: "Sammanställer åldersrapport",
    continuityProgress: "Kontrollerar att ingen är på två platser samtidigt",
    setupsProgress: "Letar efter planterade detaljer som inte lösts in än",
    factsProgress: "Kontrollerar fakta mot Story Bible — {done} av {total} kapitel klara",
    now: "Just nu: {detail}",
    nowGrammar: "läser kapitel {n}…",
    nowScenes: "jämför kapitel {a} med kapitel {b}…",
    nowStyle: "lyssnar efter ett skifte i register eller känsla…",
    nowAge: "väger prosan mot Läsare…",
    nowContinuity: "kontrollerar vem och vad som är var, och när…",
    nowSetups: "kontrollerar vad som planterats, och vad som lösts in…",
    nowFacts: "kontrollerar kapitel {n} mot Story Bible…",
    stillWorking: "Jobbar fortfarande — ett enda kapitel kan ta några minuter på långsammare hårdvara. Inget har fastnat.",
    percent: "{n}%",
    continue: "Fortsätt",
    runAgain: "Kör igen",
    resultsTitle: "Anteckningar från korrektur",
    emptyResults: "Inget fast den här gången.",
    clickHint: "Klicka på en rad för att öppna kapitlet.",
    stale: "Kapitlet har ändrats sedan passet.",
    suggestion: "Förslag",
    chapter: "Kapitel {n}",
    chapters: "Kapitel {a} och {b}",
    paused: "Pausad. Det som hunnit klart är sparat.",
    error: "Passet stannade. Det som hunnit klart är sparat.",
    craft: "Kamera på korten",
    contentFlag: "Innehållsvarning",
    stageSkipped: "Inte vald den här gången",
    scopeSummary: "Omfattning: bara {chapter}. Grammatik och Faktakontroll gäller bara det kapitlet; övriga steg jämför alltid hela manuset.",
    setupTitle: "Innan vi kör",
    setupLede: "Kryssa i det du vill kontrollera den här gången. Allt är förbockat som standard, precis som förut.",
    setupStagesLabel: "Vad ska kontrolleras",
    setupScopeLabel: "Omfattning",
    setupScopeManuscript: "Hela manuset",
    setupScopeChapter: "Bara \"{chapter}\" (det öppna kapitlet)",
    setupScopeChapterHint: "Gäller bara Grammatik och Faktakontroll — de är de enda två stegen som skalar med antal kapitel. De andra jämför alltid mellan kapitel, så de körs över hela manuset oavsett.",
    openPlaceholdersChapter: {
      one: "{count} öppen platshållar-not i det här kapitlet — lätt att köra korrekturläsning och glömma att den finns kvar.",
      other: "{count} öppna platshållar-noter i det här kapitlet — lätt att köra korrekturläsning och glömma att de finns kvar."
    },
    openPlaceholdersManuscript: {
      one: "{count} öppen platshållar-not i manuset — lätt att köra korrekturläsning och glömma att den finns kvar.",
      other: "{count} öppna platshållar-noter i manuset — lätt att köra korrekturläsning och glömma att de finns kvar."
    },
    setupStart: "Starta korrekturläsning",
    setupNothingSelected: "Välj minst en sak att kontrollera."
  },
  developmental: {
    action: "Developmental analys",
    runningTitle: "Developmental analys pågår — det här täcker hela manuset, så det kan ta ett tag.",
    resultsTitle: "Developmental-rapport",
    lede: "En strukturell läsning av hela manuset — tempo, spänning, och vilka trådar som betalas av. Scen för scen, sedan kapitel för kapitel, sedan en slutgiltig rapport. Inget skrivs om.",
    stageScene: "Läser scener",
    stageChapter: "Syntetiserar kapitel",
    stageReport: "Skriver rapporten",
    sceneProgress: "Scener — {done} av {total} lästa",
    chapterProgress: "Kapitel — {done} av {total} syntetiserade",
    reportProgress: "Skriver den slutgiltiga rapporten",
    now: "Nu: {detail}",
    nowScene: "läser kapitel {chapter}, scen {scene}…",
    nowChapter: "syntetiserar kapitel {n}…",
    nowReport: "skriver den slutgiltiga rapporten…",
    stillWorking: "Jobbar fortfarande — det här täcker hela manuset, så det kan ta ett bra tag på långsammare hårdvara. Inget har fastnat.",
    percent: "{n}%",
    continue: "Fortsätt",
    runAgain: "Kör igen",
    emptyResults: "Ingen rapport än.",
    openingHookLabel: "Krok i öppningen",
    openingHookGood: "Kapitel 1 krokar läsaren — en konkret obesvarad fråga eller en ovanlig händelse drar dem vidare.",
    openingHookIssues: {
      none: "Kapitel 1 krokar inte läsaren tydligt.",
      no_question: "Kapitel 1 väcker inget olöst — inget drar läsaren till nästa sida.",
      backstory_dump: "Kapitel 1 öppnar med att förklara historia/bakgrund istället för att starta berättelsens faktiska nutida handling.",
      reveals_too_much: "Kapitel 1 avslöjar mysteriet eller insatserna innan de hinner fungera som en fråga."
    },
    summaryLabel: "Sammanfattning",
    concernsLabel: "Värt en titt",
    clickHint: "Klicka på ett kapitel för att öppna det.",
    chapter: "Kapitel {n}",
    paused: "Pausad. Det som är klart är sparat.",
    error: "Körningen stannade. Det som är klart är sparat.",
    setupTitle: "Innan vi kör detta",
    setupLede: "En manuellt startad körning över hela manuset — scen för scen, sedan kapitel för kapitel, sedan en slutgiltig rapport. Kan ta ett tag; starta gärna och kom tillbaka senare.",
    setupNoThreadsWarning: "Inga trådar är taggade någonstans i det här manuset än (Plotlines) — läsningen fungerar ändå, bara lite grövre utan den grunden.",
    setupStart: "Starta analys"
  },
  craft: {
    pov: "Perspektiv",
    povAria: "Berättarperspektiv",
    chapterPov: "Kapitlets berättarperspektiv",
    tense: "Tempus",
    tenseAria: "Tempus",
    chapterTense: "Kapitlets tempus",
    viewpoint: "Synvinkel",
    viewpointPlaceholder: "Vem är i fokus?",
    viewpointAria: "Synvinkelkaraktär",
    chapterViewpoint: "Kapitlets synvinkelkaraktär",
    viewpointInherit: "{name} (manus)",
    usual: "Vanliga",
    more: "Fler",
    inheritPov: "Manus · {label}",
    inheritTense: "Manus · {label}",
    continuesFrom: "Fortsätter från",
    previousChapter: "Föregående kapitel",
    previousChapterNamed: "Föregående kapitel · {label}",
    noneStrand: "Ingen · ny tråd",
    attachedContextLabel: "Bifogad kontext",
    attachedContextLede:
      "Fäst ett tidigare kapitel — eller bara en av dess scener — som extra kontext för Skriv utkast och Omskriv på det här kapitlet. Skickar hela prosan, inte bara en sammanfattningsrad: användbart när en plats, ett föremål eller en karaktär behöver läsas exakt som den beskrevs första gången, något \"Story so far\" ensamt kan tappa.",
    attachedContextPickChapter: "Välj ett kapitel…",
    attachedContextWholeChapter: "Hela kapitlet",
    attachedContextSceneFallback: "Scen {index}",
    attachedContextAdd: "Fäst",
    attachedContextRemove: "Ta bort {label} från bifogad kontext",
    attachedContextCost: "~{n} token bifogad kontext",
    modes: {
      limited: "Tredje person begränsad",
      first: "Första person",
      omniscient: "Tredje person allvetande",
      objective: "Tredje person objektiv",
      second: "Andra person"
    },
    tenses: {
      past: "Dåtid",
      present: "Nutid"
    }
  },
  bible: {
    title: "Story Bible",
    search: "Sök i Story Bible",
    searchPlaceholder: "Hitta ett namn eller ett påstående",
    shelves: "Story Bible-hyllor",
    review: "Granska fakta",
    reviewCount: "Granskning · {count}",
    lockedCount: "{count} låsta",
    exportCards: "Exportera kort",
    exportCardsTitle: "Ladda ner karaktärer, platser och föremål till kaampi Explore",
    importLoreNav: "Importera lore",
    importLoreTitle: "Importera en lore-artikel",
    importLoreLede: "Klistra in text från din egen lorebok. En AI läser igenom den och föreslår fakta till rätt kort — precis som när fakta plockas ut ur ett kapitel. Inget låses direkt; allt hamnar i granskningskön. Texten sparas inte i boken, bara de fakta som blir av den.",
    importLoreArticleTitle: "Artikelns namn (frivilligt, syns i granskningen)",
    importLoreArticleTitlePlaceholder: "T.ex. \"Fyrtornet\" eller \"Ordens regler\"",
    importLoreText: "Text att extrahera fakta ur",
    importLoreTextPlaceholder: "Klistra in artikeln här…",
    importLoreAction: "Extrahera fakta",
    importLoreExtracting: "Extraherar…",
    importLoreUpload: "Ladda upp fil",
    importLoreFoundCount: "Hittade {count}",
    importLoreArticlesCount: { one: "{count} artikel", other: "{count} artiklar" },
    importLoreExtractingProgress: "Extraherar {current} av {total}…",
    importLoreActionCount: "Extrahera fakta från {count}",
    importSeriesNav: "Importera föregående bok",
    importSeriesTitle: "Ta med serien vidare",
    importSeriesLede: "Ladda upp föregående boks \"Export för andra appar\"-fil för att ta med dess låsta fakta som förslag i granskningskön — ett faktum som gällde i förra boken är inte automatiskt sant i den här, så inget låses in direkt. Välj vilka karaktärer, platser och andra entiteter som ska tas med nedan.",
    importSeriesUpload: "Ladda upp exportfil",
    importSeriesParseError: {
      "not-export": "Den filen är inte en export från kaampi Write.",
      "wrong-kind": "Den filen är inte en manusexport.",
      "newer-format": "Den exporten gjordes med en nyare version av kaampi Write än den här förstår.",
      invalid: "Den filen kunde inte läsas som en export."
    },
    importSeriesFoundCount: "\"{title}\" — hittade {count} entiteter",
    importSeriesFactsCount: { one: "{count} faktum", other: "{count} fakta" },
    importSeriesActionCount: "Ta med {count}",
    importSeriesImported: "La till {count} i granskningskön.",
    importSeriesTextTitle: "Något annat att ta med vidare?",
    importSeriesTextLede: "Något från föregående bok som aldrig blev ett strukturerat faktum — skriv det här och en AI föreslår fakta utifrån det, precis som att importera en lore-artikel.",
    importSeriesTextPlaceholder: "t.ex. anteckningar, en instruktion, eller något annat värt att ta med…",
    importSeriesTextAction: "Extrahera fakta",
    nothingMatches: "Inget matchar.",
    hidden: "Dold",
    name: "Namn",
    close: "Stäng",
    reviewBody: "Föreslagna rader i Story Bible. Förtydliga dem, lås — eller förkasta.",
    hideFromDraft: "Dölj för utkast",
    interview: "Intervjua",
    interviewPickerTitle: "Vem eller vad vill du intervjua?",
    interviewPickerLede: "Vilket kort som helst i Story Bible — inte bara karaktärer. En plats eller ett objekt går också att intervjua, i tredje person, som ett sätt att bygga ut din värld.",
    showToDraft: "Visa för utkast",
    hiddenNote: "Modellen ser inte det här kortet förrän du visar det igen.",
    deleteEntity: "Ta bort kortet",
    deleteConfirm: "Ta bort “{name}” helt, med alla dess fakta, bilder och profil? Det går inte att ångra.",
    thisIsA: "Detta är en",
    pictures: "Bilder",
    picturesAside: "(För senare export. Utkast ser aldrig dessa.)",
    removePicture: "Radera bild {n}",
    addImage: "Lägg till bild",
    addingImage: "Lägger till bild",
    addFact: "Lägg till fakta",
    addFactHint: "Lägger du till ett påstående under en kategori som redan har ett erbjuds du att ersätta det — det tidigare värdet syns kvar i Historik, kopplat till kapitlet du skriver just nu.",
    claimPlaceholder: "Påståendet, på en rad",
    lockInto: "Lås till Story Bible",
    addChoiceTitle: "Ersätt eller lägg till?",
    addChoiceBody: "Fältet {predicate} har redan “{existing}”. Ska den nya texten ersätta den, eller ligga kvar som en till {predicate}-rad?",
    addChoiceKeepBoth: "Lägg till som ytterligare en",
    addChoiceReplace: "Ersätt den befintliga",
    mergeStart: "Slå samman kort…",
    createSeriesFromBook: "Gör till serie",
    creatingSeriesFromBook: "Skapar serie…",
    createSeriesFromBookTitle:
      "Skapar en ny serie med samma namn som boken, kopplar boken till den, och skickar upp varenda låst fakta i boken till serien som fastslagen canon.",
    createSeriesFromBookConfirm:
      'Skapa en serie som heter "{title}", med den här boken som dess första? Varenda låst fakta i boken blir seriens egen canon.',
    createSeriesFromBookDone: 'Skapade serien "{title}", med den här boken som dess första.',
    seriesMissing: "Den här boken tillhör en serie som inte går att hitta — borttagen, eller aldrig synkad till den här installationen. Bokens egen Story Bible är opåverkad, men boken visas inte på startsidans fristående hylla förrän den antingen återkopplas eller görs fristående igen.",
    seriesMissingConfirm: "Gör boken fristående igen? Dess egna låsta fakta ligger kvar precis som de är — den slutar bara peka på en serie som inte går att hitta.",
    seriesMissingFix: "Gör boken fristående",
    mergeSelectedCount: { one: "{count} kort markerat", other: "{count} kort markerade" },
    mergeAction: "Slå samman ({count})",
    mergeKindMismatch: "De här korten är olika sorter (t.ex. en karaktär och en plats) — sammanslagning funkar bara inom samma sort.",
    mergeTitle: "Slå samman {count} kort till ett",
    mergeLede: "Inget tas bort — varje fakta flyttas till det sammanslagna kortet, och varje gammalt namn blir ett alias så att en senare omnämning av något av dem fortfarande hittar hit.",
    mergeLabelLegend: "Vilket namn ska det sammanslagna kortet visa?",
    mergeLabelCustom: "Något annat",
    mergeConflictsLabel: "De här korten är oense — välj vad som ska stå kvar",
    mergeConfirm: "Slå samman",
    mergeReplaceTitle: "Byt ut de gamla namnen i manustexten också?",
    mergeReplaceBody: "Det sammanslagna kortet heter nu “{to}”. De tidigare namnen finns kvar i din text — ska de bytas ut där också?",
    mergeReplaceRow: "“{from}” på {places}",
    mergeWithPlaceholder: "Slå samman med…",
    history: "Historik",
    historyAside: "(Att ersätta ett påstående nedan lägger till en rad här.)",
    historyCurrent: "nu",
    asOfLabel: "Visa Story Bible som den var vid",
    asOfNow: "Nuläget",
    asOfBanner: "Visar Story Bible som den såg ut vid ”{chapter}” — skrivskyddat.",
    asOfBack: "Tillbaka till nuläget",
    asOfEntityLede: "Som det stod vid ”{chapter}”.",
    mentions: "Omnämnanden",
    mentionsAside: "(Varje kapitel där den här entiteten nämns i prosan.)",
    aliases: "Alias",
    aliasesAside: "(Smeknamn och titlar. Räknas också som ett omnämnande.)",
    aliasesPlaceholder: "Kommaseparerade smeknamn",
    exclusions: "Undantag",
    exclusionsAside: "(Fraser som inte ska räknas som omnämnande.)",
    exclusionsPlaceholder: "Kommaseparerade fraser att ignorera",
    replaceTitle: "Ersätt i manuset?",
    replaceBody: "Ersätt “{from}” med “{to}” på {places}. Brainstorm lämnas orörd.",
    places: { one: "{count} ställe", other: "{count} ställen" },
    keepTexts: "Behåll texterna",
    replace: "Ersätt",
    pronoun: "Pronomen",
    age: "Ungefärlig ålder",
    looks: "Utseende",
    looksPlaceholder: "Kropp och ansikte. Inte kläder.",
    tags: "Etiketter",
    tagsAside: "(Bara hyllan. Utkast ser aldrig dessa.)",
    tagsPlaceholder: "Kommaseparerade drag",
    personality: "Personlighet",
    personalityPlaceholder: "Hur de brukar vara",
    goals: "Mål",
    goalsPlaceholder: "Vad de vill",
    fears: "Rädslor",
    fearsPlaceholder: "Vad de är rädda för",
    eventWhere: "Var",
    eventWhereNone: "Inte placerad än",
    eventParticipants: "Vilka som var där",
    eventsHere: "Händelser här",
    peopleHere: "Personer här",
    namePlaceholder: "Namn",
    factText: "Faktatext",
    sourceLabel: "Källa: {source}",
    sources: {
      chapter: "Kapitel",
      interview: "Intervju",
      lore: "Lore",
      brainstorm: "Brainstorm",
      synopsis: "Synopsis",
      brief: "Brief",
      series: "Föregående bok"
    },
    unconfirmed: "Obekräftat — bara något en karaktär påstått, inte fastslagen bakgrund.",
    unconfirmedClaimedBy: "Obekräftat — hävdat av {name}, inte fastslagen bakgrund.",
    unconfirmedBadge: "Obekräftat",
    promoteUnconfirmedConfirm: "Skicka den här till serien ändå? \"{value}\" är fortfarande obekräftat — ingen har bekräftat det oberoende. Att skicka den gör den till fastslagen canon för hela serien.",
    promoteUnconfirmedConfirmClaimedBy: "Skicka den här till serien ändå? \"{value}\" är fortfarande bara hävdat av {name}, inte oberoende bekräftat. Att skicka den gör den till fastslagen canon för hela serien.",
    seriesSkippedUnconfirmed: "Hoppade över {count} obekräftade påstående(n) — de stannade i den här boken istället för att bli serie-canon. Skicka dem enskilt från entitetens kort om de ändå ska gälla för hela serien.",
    conflictsWith: "Krockar med: {value}",
    similarTo: "Liknar: {value} — verkar vara samma fakta, fast mer detaljerad",
    lock: "Lås",
    merge: "Slå ihop",
    keepSeparate: "Behåll båda",
    reject: "Förkasta",
    show: "Visa",
    hide: "Dölj",
    showClaim: "Visa det här påståendet för utkast",
    hideClaim: "Dölj det här påståendet för utkast",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Alltid med",
    positionOverrideExclude: "Aldrig med",
    positionOverrideToInclude: "Inkludera alltid i Skriv utkast, oavsett kapitlets position i story-tiden och oavsett relevansfiltret för lore",
    positionOverrideToExclude: "Uteslut alltid från Skriv utkast, oavsett kapitlets position i story-tiden",
    positionOverrideToAuto: "Återgå till automatisk positionering (styrs av story-tiden)",
    edit: "Redigera",
    editFact: "Redigera fakta",
    save: "Spara",
    remove: "Ta bort",
    removeFactConfirm: "Ta bort den här faktan — \"{value}\"? Det går inte att ångra. Använd det här för ett påstående som helt enkelt är fel, inte ett du rättar med ett nytt värde (använd Redigera för det, eller Uppdatera… om det ändras härifrån).",
    updateFact: "Uppdatera…",
    updateFactHint: "Markera att det här ändras härifrån — fyller i Lägg till fakta nedan, kopplat till kapitlet du skriver just nu. Till skillnad från Redigera, som rättar vad det alltid varit.",
    kinds: {
      characters: "Karaktärer",
      locations: "Platser",
      objects: "Föremål",
      groups: "Grupper",
      events: "Händelser",
      concepts: "Koncept"
    },
    singular: {
      characters: "Karaktär",
      locations: "Plats",
      objects: "Föremål",
      groups: "Grupp",
      events: "Händelse",
      concepts: "Koncept"
    },
    newLabel: {
      characters: "Ny karaktär",
      locations: "Ny plats",
      objects: "Nytt föremål",
      groups: "Ny grupp",
      events: "Ny händelse",
      concepts: "Nytt koncept"
    },
    empty: {
      characters: "Inga karaktärer ännu.",
      locations: "Inga platser ännu.",
      objects: "Inga föremål ännu.",
      groups: "Inga grupper ännu.",
      events: "Inga händelser ännu.",
      concepts: "Inga koncept ännu."
    },
    predicates: {
      "core.identity": "Identitet",
      "core.trait": "Karaktärsdrag",
      "core.place": "Plats",
      "core.object": "Föremål",
      "core.group": "Grupp",
      "core.relationship": "Relation",
      "core.event": "Händelse",
      "core.concept": "Koncept"
    },
    pronouns: {
      she: "Hon",
      he: "Han",
      it: "Hen"
    }
  },
  canvas: {
    jumpToEntity: "Ctrl-klicka (Cmd-klicka på Mac) för att öppna {name}s Story Bible-kort",
    extend: "Förläng",
    elaborate: "Brodera ut",
    beat: "Skriv en beat…",
    beatTitle: "Skriv en beat",
    beatHint: "Kort och konkret: vad händer härnäst? Modellen skriver bara den beaten, inget mer, och lägger in den precis vid markören.",
    beatPlaceholder: "Vad händer härnäst, i en rad",
    beatAction: "Skriv beaten",
    rewriteMenu: "Skriv om…",
    illustrate: "Illustrationsprompt…",
    lift: "Lyft till synopsis",
    cutToDarling: "Klipp till älsklingar",
    createScene: "Skapa scen",
    formatToolbar: "Formatering",
    bold: "Fet",
    italic: "Kursiv",
    underline: "Understruken",
    manual: "Manuell redigering",
    insteadOf: "I stället för “{word}”",
    looking: "Söker…",
    noAlts: "Inga alternativ den här gången.",
    retry: "Försök igen",
    manualTitle: "Manuell redigering",
    manualBody: "Skriv om bara det markerade stycket. Resten av texten ligger kvar.",
    apply: "Verkställ",
    rewriteTitle: "Skriv om",
    rewriteHint: "Säg åt modellen hur det markerade stycket ska ändras. Bara det spannet byts ut.",
    rewritePlaceholder: "Vad ska ändras?",
    rewriteAction: "Skriv om",
    ask: "Fråga…",
    askTitle: "Fråga om den här passagen",
    askHint: "Fråga vad som helst om den markerade passagen — var så kritisk du vill. Svaret är bara till för att läsas, inget ändras eller sparas.",
    askPlaceholder: "Vad vill du veta?",
    askAction: "Fråga",
    placeholderAdd: "Lägg till platshållare…",
    placeholderAddTitle: "Lägg till platshållare",
    placeholderAddHint: "En snabb notering till dig själv — ett namn, en fakta, ett datum du fyller i senare. Fortsätt skriva; kom tillbaka när du vill.",
    placeholderPlaceholder: "Vad behöver du återkomma till?",
    placeholderAddAction: "Lägg till",
    placeholderViewTitle: "Platshållare",
    placeholderSave: "Spara",
    placeholderResolve: "Markera löst",
    placeholderOpen: "Öppna den här platshållaren",
    placeholderEmptyNote: "Platshållare",
    rewriteChips: {
      group: "Snabbval från Statistik och Analys",
      povLeakCamera:
        "Stanna i den aktuella kameran. Gå inte in i ett medvetande kameran inte kan känna. Samma händelser.",
      povLeak: {
        label: "Fixa perspektivbrott",
        prompt:
          "Stanna i {who}s varseblivning. Återge inte en annan karaktärs tankar eller känslor. Samma händelser."
      },
      strongerVerbs: {
        label: "Starkare verb",
        prompt:
          "Byt svaga verb plus sättsadverb mot starkare verb (sprang snabbt → rusade). Ta inte bara bort -t-orden. Samma händelser."
      },
      activeVoice: {
        label: "Aktiv form",
        prompt:
          "Gör misstänkta passiver aktiva (dörren öppnades av henne → hon öppnade dörren). Samma händelser."
      },
      showDontTell: {
        label: "Visa, berätta inte",
        prompt:
          "Där en känsla namnges, låt kroppen eller scenen bära den. Lägg inte till förklaring. Samma händelser."
      },
      breakLong: {
        label: "Bryt den långa meningen",
        prompt:
          "Bryt den långa meningen. Behåll betydelsen. En kort stöt efter en lång rad, inte en rad lika korta."
      }
    },
    modelAside: "Modellen lade till det här. Det ligger inte i manuset."
  },
  stats: {
    label: "Statistik",
    wordsShort: { one: "{count} ord", other: "{count} ord" },
    rareOn: "Ovanliga ord på",
    rareOff: "Ovanliga ord av",
    rareOnTitle: "Dölj ovanliga ord",
    rareOffTitle: "Markera ovanliga ord",
    ticsOn: "Klichéer på",
    ticsOff: "Klichéer av",
    ticsOnTitle: "Dölj AI-klingande fraser",
    ticsOffTitle: "Markera AI-klingande fraser",
    factsOn: "Story Bible-namn på",
    factsOff: "Story Bible-namn av",
    factsOnTitle: "Dölj understrykning av Story Bible-namn",
    factsOffTitle: "Stryk under namn som finns i Story Bible",
    rareMarkTitle: "Ovanligt ord — kan vara svårare för den här läsaren",
    ticPhraseTitle: "Låter som en AI-genererad fras",
    ticDashTitle: "Det här avsnittet lutar sig tungt mot tankstreck",
    title: "Så läses det",
    emptyTitle: "Ingen prosa ännu",
    writeSome: "Skriv lite prosa för att se hur det läses.",
    sentence: "Mening {n} · {words}",
    alreadyShort: "Redan kort.",
    suggestSplit: "Föreslå en delning",
    looking: "Söker…",
    noSplit: "Ingen delning den här gången.",
    split: "Delning",
    editSplit: "Redigera delning",
    useSplit: "Använd den här delningen",
    paragraph: "Stycke {n} · {words}",
    packedHint: "Handling, en lång blick bakåt och staplade sinnen i det här blocket.",
    suggestBreak: "Föreslå en brytning",
    noBreak: "Ingen brytning den här gången.",
    break: "Brytning",
    editBreak: "Redigera styckesbrytning",
    useBreak: "Använd den här brytningen",
    clickBar: "Klicka på en stapel för att läsa meningen.",
    mixedFocus: "Blandat fokus",
    mixedOne: "Det här blocket blandar nutida handling, en lång blick bakåt och staplade sinnen.",
    mixedMany: "De här blocken blandar nutida handling, en lång blick bakåt och staplade sinnen.",
    echo: "Upprepningar",
    echoBody: "Samma ord eller fras upprepas på kort avstånd. Klicka för att söka. En refräng kan vara poängen.",
    reuse: "Upprepad fras",
    reuseBody: "Samma ordkedja dyker upp i mer än ett stycke. Klicka för att söka. En refräng kan vara poängen.",
    reuseWhere: "Styckena {list} · {n} ord",
    openFind: "Sök “{phrase}” i texten",
    povLeak: "Perspektivbrott",
    foot: "{words} ord · {sentences} meningar · {spoken}% tal",
    highlight: "Markera i texten",
    keepHighlight: "Behåll markering",
    measures: "Vad detta mäter",
    raise: "Hur du höjer det",
    remember: "Kom ihåg",
    longSentences: "{n}+ ord",
    rareList: "Utanför den välkända listan",
    hideGauge: "Dölj den här mätaren.",
    aboutGauge: "Om den här mätaren.",
    gaugeAria: "{label} {score}. {detail}",
    sparkTitle: "{count} ord",
    sparkAria: "Mening {n}, {count} ord",
    leakObjective: "De här raderna liknar tanke. Objektiv visar bara vad en kamera skulle se. Ett förslag, inte en dom.",
    leakFirstNamed: "De här raderna liknar ett annat medvetande än {who}. Ett förslag, inte en dom.",
    leakOther: "De här raderna liknar ett annat medvetande. Ett förslag, inte en dom.",
    leakLimitedNamed: "Begränsad till {who} — de här raderna liknar ett annat medvetande. Ett förslag, inte en dom.",
    directnessReadout:
      "{adverbs} -t-adverb / 1 000 · {passives} möjliga passiver / 1 000 · börjar på 100, minus de två.",
    pacingSpanSame: "{count} ord vardera",
    pacingSpanRange: "{min}–{max} ord",
    pacingReadout:
      "{mix} · {mean} ord typiskt · {span}. Variation höjer; en stapel av {n}+-meningar eller en monoton sänker.",
    vocabularyReadout: "{share}% ovanliga · variation {ttr}. En mix poängsätter högre än bara enkelt eller bara sällsynt.",
    vocabularyReadoutKid: "{share}% ovanliga · variation {ttr}. Bekanta ord poängsätter högre för den här läsaren.",
    mix: {
      mixed: "Blandat",
      choppy: "Kort och jämnt",
      sweeping: "Långt och jämnt",
      even: "Jämnt"
    },
    profiles: {
      empty: { label: "Ingen prosa ännu", genres: "" },
      short: { label: "För kort att mäta", genres: "Skriv lite till" },
      breezy: { label: "Snabbt och lätt", genres: "Thriller / YA" },
      brisk: { label: "Rörligt", genres: "Äventyr / romantik" },
      balanced: { label: "Balanserat", genres: "Allmän fiktion" },
      atmospheric: { label: "Tätt och atmosfäriskt", genres: "Litterärt / episk fantasy" },
      heavy: { label: "Tungt", genres: "Litterärt / experimentellt" }
    },
    gauges: {
      directness: {
        label: "Direkthet",
        measures: "Hur direkt du skriver, utifrån andelen sättsadverb och möjliga passiver.",
        raise: [
          "Byt ett svagt verb plus adverb mot ett starkare verb (sprang snabbt → rusade).",
          "Gör om en möjlig passiv till aktiv (dörren öppnades av henne → hon öppnade dörren)."
        ],
        remember:
          "100 är inte alltid målet. I drömlika eller atmosfäriska passager kan passiver och sättsadverb vara rätt val. Låt scenen leda."
      },
      pacing: {
        label: "Tempo",
        measures:
          "Hur mycket meningslängden varierar, och om långa rader staplas. En mix av korta och långa håller oftast farten.",
        raise: [
          "Bryt en svit av meningar på {n}+ ord. Klicka på en hög stapel för att granska en.",
          "Följ en lång rad med en kort stöt, eller tvärtom.",
          "Om varje mening är lika lång, variera en."
        ],
        remember:
          "Jämn, knackig prosa kan vara poängen — ett slagsmål, en jakt, dialog. Ett svepande stycke kan också vara det. Det här flaggar en monoton eller en stapel långa rader, inte en genre."
      },
      vocabulary: {
        label: "Ordförråd",
        measures: "Balansen mellan bekanta ord och ovanliga. Namn i Story Bible räknas bort.",
        raise: [
          "Om prosan bara har vanliga ord gör ett precist substantiv eller verb ofta mer än en rad adjektiv.",
          "Om ovanliga ord hopar sig, byt några mot enklare — om inte just den diktionen är författarrösten.",
          "Markera i texten visar ord utanför Dale–Challs bekanta lista."
        ],
        remember: "Ovanligt kan vara poängen. En hamnhistoria behöver kaj och blinda passagerare. 100 är en mix, inte ett enklare ordförråd."
      }
    }
  },
  notes: {
    review: "Granskning",
    title: "Kapitelanteckningar",
    emptyTitle: "Inget att flagga",
    intro:
      "Granskningen försöker hitta rader som varken visar karaktärens personlighet eller driver scenen framåt.",
    introReader: "Riktad till {category}, runt {age} år.",
    paragraph: "Stycke {n}",
    note: "Anteckning",
    clickHint: "Klicka på en anteckning för att läsa citatet. Anteckningar är inte omskrivningar.",
    nothingSolid: "Granskningsmodellen hittade inget hållbart i den här vändan.",
    foot: "Anteckningar flaggar ett ställe. De skriver inte om kapitlet och rör inte Story Bible.",
    categories: {
      show_vs_tell: {
        label: "Gestaltning",
        blurb: "En namngiven känsla där kroppen eller scenen kunde bära den."
      },
      dialogue_purpose: {
        label: "Dialog",
        blurb: "En talad rad som varken visar karaktär eller flyttar scenen."
      },
      voice_drift: {
        label: "Författarröst",
        blurb: "Registret gled från fältet Författarröst."
      },
      character_fidelity: {
        label: "Karaktär",
        blurb: "Ett slag som sitter mot ett låst Story Bible-karaktärsdrag."
      },
      child_agency: {
        label: "Handling",
        blurb: "En vuxen tar det avgörande steget. Barnet ska göra det."
      },
      lecture: {
        label: "Pekpinne",
        blurb: "En moral som sägs av en vuxen, inte tjänas av protagonistens val."
      }
    }
  },
  critics: {
    action: "Kritiker",
    setupTitle: "Vem ska läsa det här kapitlet?",
    setupLede: "Varje röst nedan läser kapitlet på egen hand — välj en eller flera. Varje kryssad röst är ett eget anrop, så valet är också kostnaden.",
    setupPersonasLabel: "Kritiker att köra",
    setupStart: "Kör kritiker",
    setupNothingSelected: "Välj minst en kritiker att köra.",
    review: "Kritiker",
    title: "Kritiker-anteckningar",
    emptyTitle: "Inget att flagga",
    intro: "Tre distinkta läsare, var och en på jakt efter något de andra inte letar efter — ingen omskrivning, bara vad de lade märke till.",
    paragraph: "Stycke {n}",
    note: "Anteckning",
    clickHint: "Klicka på en anteckning för att läsa citatet.",
    nothingSolid: "Ingen av kritikerna hittade något hållbart i den här vändan.",
    foot: "Anteckningar flaggar ett ställe, i den kritikerns egen röst. De skriver inte om kapitlet och rör inte Story Bible.",
    personas: {
      "impatient-reader": {
        label: "Otålig läsare",
        blurb: "Flaggar där tempot segar sig förbi den punkt det faktiskt tjänar något på."
      },
      "pacing-critic": {
        label: "Pacing-kritiker",
        blurb: "Läser kapitlets rytm — var spänningen byggs, håller i sig, eller tappas när den inte borde."
      },
      "confused-reader": {
        label: "Förvirrad läsare",
        blurb: "Flaggar ett ställe som av misstag blivit svårt att följa, inte ett mysterium du planterat med flit."
      }
    }
  },
  history: {
    kicker: "Kapitel",
    title: "Historik",
    emptyTitle: "Ingen historik än",
    intro:
      "Tidigare versioner från utkast, omskrivning, förlängning, utvidgning och omskriv. Återställ hoppar till den versionen. Senare rader blir kvar.",
    empty: "Modellen har inte skrivit om det här kapitlet än.",
    emptyProse: "(tomt)",
    clickHint: "Klicka på en version för att läsa den, och Återställ för att lägga den i kapitlet.",
    restore: "Återställ",
    compare: "Jämför",
    compareHint: "Klicka på en annan version för att jämföra med den här. Återställ använder fortfarande den valda versionen.",
    comparePair: "{from} → {to}",
    live: "Kapitlet nu",
    same: "De här två är lika.",
    fromOnly: "Bara i den här texten, det du tappar om du återställer",
    toOnly: "Bara i den här texten, det du får om du återställer",
    foot: "Listan är inte ångra. Det du skriver själv sparas inte. Prompter ser bara det aktuella kapitlet.",
    ops: {
      draft: "Utkast",
      recast: "Omskrivning",
      polish: "Polish",
      extend: "Förläng",
      elaborate: "Utvidga",
      rewrite: "Skriv om",
      beat: "Beat",
      restore: "Återställ",
      format: "Formatering",
      darling: "Älskling",
      translate: "Översättning"
    }
  },
  polishReview: {
    title: "Granska Polish",
    hint: "Modellens städomgång, inte sparad än. Jämför de två versionerna, godkänn eller förkasta.",
    original: "Original",
    candidate: "Polish-förslag",
    originalHint: "Det du behåller om du förkastar",
    candidateHint: "Det du får om du godkänner",
    accept: "Behåll den här versionen",
    discard: "Förkasta"
  },
  markerConvert: {
    nav: "Konvertera markeringar",
    heading: "Konvertera markeringar till formatering",
    intro:
      "Gör om tecken som *asterisker* — eller par av öppnings-/avslutningstecken som ”smarta citattecken” — från ett importerat manus till riktig fetstil, kursiv eller understrykning. Markeringarna tas bort ur texten — bara formateringen blir kvar. Längre markeringar körs först, så \"**\" inte tolkas som två enstaka \"*\" — lägg till båda om ditt manus använder dem för olika saker.",
    openLabel: "Öppningstecken",
    openPlaceholder: "t.ex. * eller ”",
    closeLabel: "Avslutningstecken",
    closePlaceholder: "t.ex. * eller ”",
    becomes: "blir",
    styleLabel: "Stil",
    addRule: "Lägg till rad",
    removeRule: "Ta bort",
    convertAction: "Konvertera hela manuset",
    converting: "Konverterar…",
    resultSummary: "Konverterade {markers} i {chapters}.",
    resultNone: "Inga markeringar hittades — inget att konvertera.",
    markersCount: { one: "{count} markering", other: "{count} markeringar" },
    chaptersCount: { one: "{count} kapitel", other: "{count} kapitel" },
    smartQuotesIntro:
      "Raka citattecken (\") du skriver från och med nu blir automatiskt riktiga öppnande/avslutande svängda citattecken. Det här konverterar varje rakt citattecken som redan finns i manuset på samma sätt, i en körning.",
    smartQuotesAction: "Gör om citattecken i hela manuset",
    smartQuotesConverting: "Konverterar…",
    smartQuotesResultSummary: "Gjorde om citattecken i {chapters}.",
    smartQuotesResultNone: "Inga raka citattecken hittades — inget att konvertera."
  },
  errors: {
    ollamaOrigins: "Den lokala servern tog inte emot webbläsaren. Kör du Ollama? Starta den med OLLAMA_ORIGINS satt till adressen kaampi Write faktiskt körs från — OLLAMA_ORIGINS=http://localhost:5175 om det är den här datorn, eller OLLAMA_ORIGINS=* för att tillåta vilken adress som helst, enklast när du ansluter från en annan maskin i nätverket. Kör du LM Studio eller en annan server? Leta efter en inställning för vilka webbadresser som får ansluta (kallas ofta CORS eller allowed origins).",
    noModel: "Ingen lokal modell hittades. Starta Ollama eller din lokala server och ladda om.",
    notJson: "Den filen är inte JSON.",
    backupUnreadable: "Kunde inte läsa den säkerhetskopian.",
    sampleManuscriptUnavailable: "Kunde inte läsa in exempelmanuskriptet.",
    shelfUnreadable: "Kunde inte läsa hyllan.",
    recastEmpty: "Skriv eller ta fram lite prosa innan du omskriver.",
    extractEmpty: "Skriv eller ta fram lite prosa innan du extraherar fakta.",
    analyzeEmpty: "Skriv eller ta fram lite prosa innan du analyserar kapitlet.",
    polishEmpty: "Skriv eller ta fram lite prosa innan du putsar kapitlet.",
    extractorNone: "Extraktorn hittade inga uttalade fakta i det här kapitlet.",
    interviewExtractorNone: "Extraktorn hittade inga uttalade fakta i det här samtalet.",
    brainstormExtractorNone: "Extraktorn hittade inga uttalade fakta i den här lappen.",
    synopsisExtractorNone: "Extraktorn hittade inga uttalade fakta i synopsis.",
    briefExtractorNone: "Extraktorn hittade inga uttalade fakta i den här brief:en.",
    importLoreNone: "Extraktorn hittade inga uttalade fakta i den inklistrade texten.",
    summarizeNone: "Kunde inte sammanfatta det här kapitlet — försök igen, eller skriv sammanfattningen för hand.",
    proofreadEmpty: "Skriv eller ta fram lite kapitelprosa innan korrekturläsning.",
    developmentalEmpty: "Skriv eller ta fram lite kapitelprosa innan en developmental analys.",
    askManuscriptEmpty: "Skriv eller ta fram lite kapitelprosa innan du frågar om manuset.",
    askManuscriptNoMatch: "Inget i manuset matchar den frågan.",
    translateSourceEmpty: "Källkapitlet har ingen text än — skriv eller skapa utkast där först.",
    translateSourceMissing: "Kunde inte läsa in källmanuset detta kapitel är länkat till.",
    serverUrlMissing: "Ange din lokala servers adress i Inställningar.",
    busy: "En annan åtgärd pågår redan. Vänta tills den är klar och försök igen.",
    timeout: "Den lokala modellen svarade inte i tid. Den kanske fortfarande laddas, eller så behöver din dator längre tid än vanligt — kolla att den kör, försök sedan igen.",
    imageChoose: "Välj en bildfil.",
    imageRead: "Kunde inte läsa den bilden.",
    imageAdd: "Kunde inte lägga till den bilden."
  }
};
