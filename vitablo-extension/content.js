// Vitablo D4 Build Extractor - Content Script
// Extrahiert Build-Daten von Vitablo.de

class VitabloExtractor {
  constructor() {
    this.currentBuildData = null;
  }

  // Prüft ob wir auf einer Build-Detailseite sind
  isBuildDetailPage() {
    return window.location.href.match(/\/diablo-4-build\/[\w-]+\/$/);
  }

  // Prüft ob wir auf der Build-Übersichtsseite sind
  isBuildOverviewPage() {
    return window.location.href.match(/\/diablo-4-build\/$/);
  }

  // Extrahiert Daten von einer Build-Detailseite
  extractFromDetailPage() {
    const build = {
      url: window.location.href,
      extractedAt: new Date().toISOString()
    };

    // Build-Name
    const titleEl = document.querySelector('h1, .entry-title, .post-title');
    if (titleEl) {
      build.name = titleEl.textContent.trim();
    }

    // Klasse
    const classIconEl = document.querySelector('[class*="klasse-icon"], [class*="class-icon"]');
    if (classIconEl) {
      const classMatch = classIconEl.className.match(/(hexenmeister|paladin|barbar|zauberin|jaegerin|druide|totenbeschwoerer|geistgeborener)/i);
      if (classMatch) {
        build.class = this.translateClassName(classMatch[1]);
      }
    }

    // Skills extrahieren
    build.skills = this.extractSkills();

    // Aspekte extrahieren
    build.aspects = this.extractAspects();

    // Legendary Aspekte
    build.legendaryAspects = this.extractLegendaryAspects();

    // Paragon
    build.paragon = this.extractParagon();

    // Items
    build.items = this.extractItems();

    // Talisman & Runen
    build.talisman = this.extractTalisman();

    // Seelenträger / Böser
    build.soulbearer = this.extractSoulbearer();

    // Söldner
    build.mercenary = this.extractMercenary();

    return build;
  }

  // Extrahiert alle Builds von der Übersichtsseite
  extractFromOverviewPage() {
    const builds = [];
    const buildCards = document.querySelectorAll('[class*="build"], article, .post');

    buildCards.forEach(card => {
      const linkEl = card.querySelector('a[href*="/diablo-4-build/"]');
      if (linkEl) {
        const buildUrl = linkEl.href;
        if (buildUrl.match(/\/diablo-4-build\/[\w-]+\/$/)) {
          builds.push({
            url: buildUrl,
            name: linkEl.textContent.trim() || card.querySelector('h2, h3')?.textContent.trim(),
            class: this.extractClassFromCard(card)
          });
        }
      }
    });

    return builds;
  }

  extractSkills() {
    const skills = [];
    const skillElements = document.querySelectorAll('[class*="skill"], [data-skill]');

    skillElements.forEach(el => {
      const skillNameEl = el.querySelector('[class*="skill-name"], .name, h3, h4');
      const imgEl = el.querySelector('img');

      if (skillNameEl || imgEl) {
        const name = skillNameEl?.textContent.trim() || imgEl?.alt || '';
        const imageUrl = imgEl?.src || '';

        // Deutscher und englischer Name
        const parts = name.split('|').map(p => p.trim());
        const skill = {
          german: parts[0] || name,
          english: parts[1] || '',
          imageUrl: imageUrl
        };

        // Skill-Code extrahieren (z.B. "Hex 2a")
        const codeMatch = name.match(/^([A-Za-z]+)\s+(\d+[a-z]?)/i);
        if (codeMatch) {
          skill.code = codeMatch[0];
        }

        skills.push(skill);
      }
    });

    return skills;
  }

  extractAspects() {
    const aspects = [];
    const aspectElements = document.querySelectorAll('[class*="aspect"], [class*="aspekt"]');

    aspectElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4, p');
      if (nameEl) {
        aspects.push({
          name: nameEl.textContent.trim(),
          type: 'aspect'
        });
      }
    });

    return aspects;
  }

  extractLegendaryAspects() {
    const legendaryAspects = [];
    const legendElements = document.querySelectorAll('[class*="legendary"], [class*="legendär"]');

    legendElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4, p');
      if (nameEl) {
        legendaryAspects.push({
          name: nameEl.textContent.trim(),
          type: 'legendary-aspect'
        });
      }
    });

    return legendaryAspects;
  }

  extractParagon() {
    const paragon = {
      nodes: [],
      glyphs: []
    };

    // Paragon-Knoten
    const nodeElements = document.querySelectorAll('[class*="paragon"], [class*="node"]');
    nodeElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4');
      if (nameEl) {
        paragon.nodes.push(nameEl.textContent.trim());
      }
    });

    // Glyphen
    const glyphElements = document.querySelectorAll('[class*="glyph"]');
    glyphElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4');
      if (nameEl) {
        paragon.glyphs.push(nameEl.textContent.trim());
      }
    });

    return paragon;
  }

  extractItems() {
    const items = [];
    const itemElements = document.querySelectorAll('[class*="item"], [class*="equipment"]');

    itemElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4, p');
      const rarityEl = el.querySelector('[class*="rarity"], [class*="unique"], [class*="legendary"]');
      const imgEl = el.querySelector('img');

      if (nameEl) {
        items.push({
          name: nameEl.textContent.trim(),
          rarity: rarityEl?.className.match(/(unique|legendary|mythic)/i)?.[0] || 'rare',
          imageUrl: imgEl?.src || ''
        });
      }
    });

    return items;
  }

  extractTalisman() {
    const talisman = {
      items: [],
      runes: []
    };

    const talismanElements = document.querySelectorAll('[class*="talisman"], [class*="zauber"]');
    talismanElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4');
      if (nameEl) {
        talisman.items.push(nameEl.textContent.trim());
      }
    });

    const runeElements = document.querySelectorAll('[class*="rune"]');
    runeElements.forEach(el => {
      const nameEl = el.querySelector('.name, h3, h4');
      if (nameEl) {
        talisman.runes.push(nameEl.textContent.trim());
      }
    });

    return talisman;
  }

  extractSoulbearer() {
    const soulbearer = {
      active: false,
      name: ''
    };

    const bearerEl = document.querySelector('[class*="soulbearer"], [class*="seelenträger"], [class*="böser"]');
    if (bearerEl) {
      soulbearer.active = true;
      const nameEl = bearerEl.querySelector('.name, h3, h4, p');
      if (nameEl) {
        soulbearer.name = nameEl.textContent.trim();
      }
    }

    return soulbearer;
  }

  extractMercenary() {
    const mercenary = {
      active: false,
      name: '',
      skills: []
    };

    const mercElements = document.querySelectorAll('[class*="mercenary"], [class*="söldner"], [class*="repartiate"]');
    if (mercElements.length > 0) {
      mercenary.active = true;

      const nameEl = mercElements[0].querySelector('.name, h2, h3');
      if (nameEl) {
        mercenary.name = nameEl.textContent.trim();
      }

      mercElements.forEach(el => {
        const skillEl = el.querySelector('[class*="skill"]');
        if (skillEl) {
          mercenary.skills.push(skillEl.textContent.trim());
        }
      });
    }

    return mercenary;
  }

  extractClassFromCard(card) {
    const iconEl = card.querySelector('[class*="klasse-icon"], [class*="class-icon"]');
    if (iconEl) {
      const classMatch = iconEl.className.match(/(hexenmeister|paladin|barbar|zauberin|jaegerin|druide|totenbeschwoerer|geistgeborener)/i);
      if (classMatch) {
        return this.translateClassName(classMatch[1]);
      }
    }
    return null;
  }

  translateClassName(germanClass) {
    const translations = {
      'hexenmeister': 'Warlock',
      'paladin': 'Paladin',
      'barbar': 'Barbarian',
      'zauberin': 'Sorceress',
      'jaegerin': 'Rogue',
      'druide': 'Druid',
      'totenbeschwoerer': 'Necromancer',
      'geistgeborener': 'Spiritborn'
    };

    const lower = germanClass.toLowerCase();
    return translations[lower] || germanClass;
  }

  // Speichert Daten im Chrome Storage
  async saveToStorage(data) {
    try {
      const result = await chrome.storage.local.get('vitabloBuilds');
      const existingBuilds = result.vitabloBuilds || { builds: [], lastUpdate: null };

      // Update oder neuer Build
      const existingIndex = existingBuilds.builds.findIndex(b => b.url === data.url);

      if (existingIndex >= 0) {
        existingBuilds.builds[existingIndex] = data;
      } else {
        existingBuilds.builds.push(data);
      }

      existingBuilds.lastUpdate = new Date().toISOString();

      await chrome.storage.local.set({ vitabloBuilds: existingBuilds });

      // Benachrichtigung senden
      chrome.runtime.sendMessage({
        type: 'BUILD_SAVED',
        data: data
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      return false;
    }
  }
}

// Initialisierung
const extractor = new VitabloExtractor();

// Automatische Extraktion beim Laden der Seite
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtractor);
} else {
  initExtractor();
}

function initExtractor() {
  // Prüfe welche Seite wir sind
  if (extractor.isBuildDetailPage()) {
    console.log('[Vitablo Extractor] Build-Detailseite erkannt');

    // Button hinzufügen
    addExtractButton();

    // Automatisch extrahieren (optional)
    const buildData = extractor.extractFromDetailPage();
    if (buildData.name || buildData.skills.length > 0) {
      extractor.currentBuildData = buildData;
      showNotification('Build-Daten können extrahiert werden!');
    }
  } else if (extractor.isBuildOverviewPage()) {
    console.log('[Vitablo Extractor] Build-Übersichtsseite erkannt');
    addExtractAllButton();
  }
}

function addExtractButton() {
  const button = document.createElement('button');
  button.id = 'vitablo-extract-btn';
  button.textContent = '📥 Build extrahieren';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
  });

  button.addEventListener('click', async () => {
    if (extractor.currentBuildData) {
      const success = await extractor.saveToStorage(extractor.currentBuildData);
      if (success) {
        showNotification('✅ Build erfolgreich gespeichert!');
        button.textContent = '✅ Gespeichert!';
        setTimeout(() => {
          button.textContent = '📥 Build aktualisieren';
        }, 2000);
      } else {
        showNotification('❌ Fehler beim Speichern!');
      }
    } else {
      showNotification('⚠️ Keine Build-Daten gefunden!');
    }
  });

  document.body.appendChild(button);
}

function addExtractAllButton() {
  const button = document.createElement('button');
  button.id = 'vitablo-extract-all-btn';
  button.textContent = '📥 Alle Builds extrahieren';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    padding: 12px 24px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;

  button.addEventListener('click', async () => {
    const builds = extractor.extractFromOverviewPage();
    showNotification(`${builds.length} Builds gefunden!`);
    // Hier würden wir die Builds speichern
    chrome.runtime.sendMessage({
      type: 'BUILDS_FOUND',
      data: { count: builds.length, builds: builds }
    });
  });

  document.body.appendChild(button);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 16px 24px;
    background: #1a1a2e;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: slideIn 0.3s ease;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: 500;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Nachrichten vom Background Script empfangen
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_BUILD') {
    const buildData = extractor.extractFromDetailPage();
    sendResponse({ success: true, data: buildData });
  } else if (request.type === 'GET_BUILD') {
    sendResponse({ success: true, data: extractor.currentBuildData });
  }
  return true;
});
