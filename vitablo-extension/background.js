// Vitablo D4 Build Extractor - Background Service Worker

// Extension-Installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Vitablo Extractor] Extension installiert');

    // Initiale Storage-Struktur erstellen
    chrome.storage.local.set({
      vitabloBuilds: {
        builds: [],
        lastUpdate: null,
        version: '1.0.0'
      }
    });
  } else if (details.reason === 'update') {
    console.log('[Vitablo Extractor] Extension aktualisiert');
  }
});

// Nachrichten vom Content Script verarbeiten
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Vitablo Extractor] Nachricht empfangen:', request.type);

  switch (request.type) {
    case 'BUILD_SAVED':
      console.log('[Vitablo Extractor] Build gespeichert:', request.data.name);
      // Badge-Update
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
      break;

    case 'BUILDS_FOUND':
      console.log('[Vitablo Extractor] Builds gefunden:', request.data.count);
      chrome.action.setBadgeText({ text: request.data.count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#2196F3' });
      break;

    case 'GET_BUILDS':
      // Alle Builds aus dem Storage abrufen
      chrome.storage.local.get('vitabloBuilds', (result) => {
        sendResponse({ success: true, data: result.vitabloBuilds || { builds: [] } });
      });
      return true;

    case 'CLEAR_BUILDS':
      // Alle Builds löschen
      chrome.storage.local.set({
        vitabloBuilds: {
          builds: [],
          lastUpdate: null,
          version: '1.0.0'
        }
      }, () => {
        sendResponse({ success: true });
        chrome.action.setBadgeText({ text: '' });
      });
      return true;

    case 'EXPORT_BUILDS':
      // Builds als JSON exportieren
      chrome.storage.local.get('vitabloBuilds', (result) => {
        const builds = result.vitabloBuilds || { builds: [] };
        sendResponse({ success: true, data: builds });
      });
      return true;

    case 'IMPORT_BUILDS':
      // Builds aus JSON importieren
      chrome.storage.local.set({ vitabloBuilds: request.data }, () => {
        sendResponse({ success: true });
        chrome.action.setBadgeText({ text: '✓' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
      });
      return true;
  }

  return false;
});

// When user clicks on a Vitablo tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes('vitablo.de')) {
      // Setze Badge wenn wir auf Vitablo sind
      chrome.action.setBadgeText({ text: 'V', tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId: activeInfo.tabId });
    }
  });
});

// Context Menu für Schnellzugriff
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extractBuild',
    title: 'Build extrahieren',
    contexts: ['page'],
    documentUrlPatterns: ['https://vitablo.de/diablo-4-build/*']
  });

  chrome.contextMenus.create({
    id: 'openManager',
    title: 'D4 Build Manager öffnen',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extractBuild') {
    // Extraktion auslösen
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_BUILD' });
  } else if (info.menuItemId === 'openManager') {
    // Build Manager öffnen
    chrome.tabs.create({ url: 'file:///C:/Users/Mandy/Documents/d4-build-manager/d4-build-manager.html' });
  }
});

// Alle 24 Stunden nach Updates suchen (optional)
chrome.alarms.create('checkForUpdates', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkForUpdates') {
    console.log('[Vitablo Extractor] Nach Updates suchen...');
    // Hier könnte man automatisch Vitablo nach neuen Builds prüfen
  }
});
