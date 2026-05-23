[README.md](https://github.com/user-attachments/files/28183140/README.md)
# ⚔️ D4 Build Manager

> **⚠️ Quellenhinweis:** Alle in dieser App enthaltenen Informationen (Builds, Kriegspläne, Skillungen, etc.) stammen von [vitablo.de](https://vitablo.de). Dies ist ein privates Projekt zur besseren Übersicht und lokalen Verwaltung dieser Informationen.

Eine lokale Web-App zur Verwaltung von Diablo 4 Builds und Kriegsplänen.

## 🎮 Features

### Klassen-Builds
- **Alle 6 Klassen** aus Diablo 4 - Lord of Hatred:
  - 🔮 Hexenmeister (Warlock)
  - 💀 Totenbeschwörer (Necromancer)
  - ✨ Zauberin (Sorceress)
  - 🗡️ Jägerin (Rogue)
  - ⚔️ Paladin
  - 🐻 Druide

### Kriegspläne
- **7 Endgame-Aktivitäten** mit detaillierten Skillungen:
  - 🌳 Flüsternder Baum
  - 👻 Alptraumdungeons
  - 🔥 Höllenflut
  - 🏛️ Unterstadt von Kurast
  - 👹 Unterschlupf-Bosse
  - ⚔️ Höllenhorden
  - ⏳ Grube

### Funktionen
- ✅ S-Tier / A-Tier Filter
- 🔅 Hot-Build Markierung
- 🔍 Suche nach Builds
- 📝 Eigene Notizen pro Build/Kriegsplan
- 💾 Lokale Speicherung (localStorage)
- 📤 Daten Export/Import
- 🖼️ Screenshots mit Lightbox-Vollbildansicht
- 🔌 **Chrome Extension für automatische Vitablo-Sync**

## 🚀 Installation & Nutzung

### Lokale Nutzung
1. Lade die Datei `d4-build-manager.html` herunter
2. Stelle sicher, dass der `Screenshots/` Ordner im gleichen Verzeichnis liegt
3. Öffne die HTML-Datei in deinem Browser (Chrome, Firefox, Edge)

### 🔌 Chrome Extension (Optional)
Mit der Vitablo D4 Build Extractor Extension kannst du Builds automatisch von vitablo.de importieren:

**Installation:**
1. Öffne Chrome → `chrome://extensions/`
2. Aktiviere "Entwicklermodus"
3. Klicke "Entpackte Extension laden"
4. Wähle den `vitablo-extension/` Ordner

**Verwendung:**
1. Öffne [vitablo.de/diablo-4-build/](https://vitablo.de/diablo-4-build/)
2. Besuche einen Build
3. Klicke auf "📥 Build extrahieren"
4. Öffne den D4 Build Manager - die Daten sind automatisch da!

Die Extension extrahiert:
- Skills (deutsch + englisch)
- Aspekte (ordinär + legendär)
- Items mit Seltenheit
- Paragon-Daten
- Talisman & Runen
- Seelenträger & Söldner

### Online Hosting
Diese App kann kostenlos auf folgenden Plattformen gehostet werden:
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com)
- [Netlify](https://netlify.com)

## 📸 Screenshots

Die App enthält 7 Screenshots von vitablo.de mit den Kriegsplänen für jede Endgame-Aktivität.

## 💾 Daten-Speicherung

Alle Notizen und Kriegspläne werden lokal im `localStorage` deines Browsers gespeichert. Über die Export-Funktion kannst du deine Daten sichern und auf anderen Geräten importieren.

## 🛠️ Technologien

- HTML5
- CSS3 (mit Gradienten und Animationen)
- Vanilla JavaScript (keine Dependencies)

## 📄 Credits

- Build-Informationen basieren auf [vitablo.de](https://vitablo.de)
- Screenshots von vitablo.de Kriegsplänen

## 📜 Lizenz

Dies ist ein privates Projekt für persönliche Nutzung.

---

**Made with ❤️ for Diablo 4 players**
