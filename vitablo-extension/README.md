# Vitablo D4 Build Extractor - Chrome Extension

Diese Chrome Extension extrahiert automatisch Diablo 4 Build-Daten von vitablo.de und macht sie im D4 Build Manager verfügbar.

## Installation

### Methode 1: Manuelle Installation (Empfohlen)

1. **Chrome öffnen** und zu `chrome://extensions` navigieren
2. **"Entwicklermodus"** in der oberen rechten Ecke aktivieren
3. **"Entpackte Extension laden"** klicken
4. Den Ordner `vitablo-extension` auswählen:
   ```
   C:\Users\Mandy\Documents\d4-build-manager\vitablo-extension\
   ```
5. Fertig! Die Extension ist jetzt installiert.

### Methode 2: Icons erstellen (optional)

Damit die Extension schöne Icons hat, musst du PNG-Dateien erstellen:

1. Öffere die `icon.svg` Datei in einem Bildbearbeitungsprogramm
2. Exportiere sie als PNG in drei Größen:
   - `icon16.png` - 16x16 Pixel
   - `icon48.png` - 48x48 Pixel
   - `icon128.png` - 128x128 Pixel
3. Speichere die Dateien im `icons/` Ordner

## Verwendung

### Builds extrahieren

1. Öffne [vitablo.de/diablo-4-build/](https://vitablo.de/diablo-4-build/)
2. Navigiere zu einem beliebigen Build
3. Klicke auf den **"📥 Build extrahieren"** Button in der unteren rechten Ecke
4. Der Build wird automatisch gespeichert!

### Alle Builds auf einmal

1. Öffne die Build-Übersichtsseite
2. Klicke auf **"📥 Alle Builds extrahieren"**
3. Alle Builds werden automatisch erkannt

### D4 Build Manager verwenden

1. Öffne deine `d4-build-manager.html` Datei im Browser
2. Die App lädt automatisch alle Builds aus der Extension
3. Klicke auf **"🔄 Extension neu laden"** um die Daten zu aktualisieren

## Features

- ✅ Automatische Extraktion von Skills, Aspekten, Items, etc.
- ✅ Speicherung im Chrome Storage (bleibt auch nach Browser-Neustart erhalten)
- ✅ Integration mit dem D4 Build Manager
- ✅ Export/Import der Build-Daten
- ✅ Unterstützung für alle Klassen
- ✅ Paragon-Daten werden extrahiert
- ✅ Talisman & Runen werden erfasst
- ✅ Seelenträger & Söldner-Informationen

## Extrahierte Daten

Die Extension extrahiert folgende Informationen von Vitablo:

- **Skills** (deutsch + englisch)
- **Aspekte** (ordinär + legendär)
- **Items** (mit Seltenheit: Unique, Legendary, Mythic)
- **Paragon-Knoten & Glyphen**
- **Talisman & Runen**
- **Seelenträger**
- **Söldner mit Skills**

## Troubleshooting

### Extension wird nicht geladen

- Prüfe ob der "Entwicklermodus" aktiviert ist
- Prüfe ob der Pfad zum Ordner korrekt ist

### Keine Daten im Build Manager

- Stelle sicher, dass du die Datei `d4-build-manager.html` direkt im Browser öffnest
- Prüfe ob du Builds auf Vitablo extrahiert hast
- Klicke auf "Extension neu laden" im Build Manager

### "Build extrahieren" Button erscheint nicht

- Prüfe ob du wirklich auf einer Build-Detailseite bist (URL endet mit `/`)
- Lade die Seite neu (F5)

## Entwicklung

Die Extension besteht aus:

- `manifest.json` - Extension-Konfiguration
- `content.js` - Extrahiert Daten von Vitablo-Seiten
- `background.js` - Service Worker für Storage-Management
- `popup.html/js` - Extension-Popup
- `icons/` - Extension-Icons

## Credits

- Datenquelle: [vitablo.de](https://vitablo.de)
- Build Manager: Mandy (Skulli485)

## Version

1.0.0 - Erstveröffentlichung
