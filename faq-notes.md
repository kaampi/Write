# FAQ-anteckningar — problem och frågor vi stöter på

Status: levande dokument, startat 2026-10-29

Syftet med den här filen är att **samla** problem, felmeddelanden och
frågor vi faktiskt stöter på under utveckling/installation/användning —
rått och oredigerat, i den ordning de dyker upp. Inte den polerade FAQ:n
själv; en råvarulista vi senare sovrar och skriver om till en riktig FAQ
(troligen `docs/faq.md`, eller en sida på webben) när vi har tillräckligt
med material och ett bra läge att göra det ordentligt.

Varje post: vad som hände, vad lösningen blev (om vi hittade en), och
varifrån den kom (vilket OS, vilken app) om det är relevant.

---

## Linux — "Unable to install kaampi-write: couldn't get lock /var/lib/dpkg/lock-frontend"

**OS:** ZorinOS (Linux)

**Vad hände:** Mats försökte installera `.deb`-paketet och fick felet att
dpkg-låset hölls av en annan process (`aptd`, process-ID i felmeddelandet).

**Orsak:** `aptd` är processen bakom den grafiska "Programvara"/
uppdateringshanteraren (GNOME Software och liknande) — den höll låset,
troligen för att den kollade efter eller installerade uppdateringar i
bakgrunden. Inget fel i vårt `.deb`-paket.

**Lösning:** Vänta en minut eller två (stäng gärna "Programvara"-appen om
den är öppen) och försök installera igen. Om det inte löser sig:
```bash
ps aux | grep -i aptd
sudo killall aptd
```
sedan försöka installationen på nytt. (Kolla att inget annat apt-kommando
faktiskt kör innan man manuellt tar bort låsfiler — det kan korrumpera
paketdatabasen.)

**Status:** Löst genom att vänta. Inte testat om `killall aptd`-vägen
faktiskt behövdes i praktiken.
