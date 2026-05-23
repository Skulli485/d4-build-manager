// Vitablo D4 Build Extractor - Popup Script

class PopupManager {
  constructor() {
    this.builds = [];
    this.init();
  }

  async init() {
    // Daten laden
    await this.loadBuilds();

    // UI aktualisieren
    this.updateUI();

    // Event Listener binden
    this.bindEvents();
  }

  async loadBuilds() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_BUILDS' });
    this.builds = response.data.builds || [];
  }

  updateUI() {
    this.updateStats();
    this.updateBuildList();
    this.updateLastUpdate();
  }

  updateStats() {
    const buildCount = this.builds.length;
    const classes = new Set(this.builds.map(b => b.class).filter(Boolean));
    const skillCount = this.builds.reduce((sum, b) => sum + (b.skills?.length || 0), 0);

    document.getElementById('build-count').textContent = buildCount;
    document.getElementById('class-count').textContent = classes.size;
    document.getElementById('skill-count').textContent = skillCount;
  }

  updateBuildList() {
    const listEl = document.getElementById('build-list');
    const emptyState = document.getElementById('empty-state');

    if (this.builds.length === 0) {
      listEl.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    listEl.style.display = 'block';
    emptyState.style.display = 'none';
    listEl.innerHTML = '';

    this.builds.forEach(build => {
      const li = document.createElement('li');
      li.className = 'build-item';
      li.innerHTML = `
        <div class="build-name">${this.escapeHtml(build.name || 'Unbekannter Build')}</div>
        <div class="build-class">
          ${build.class ? `<span class="icon"></span> ${this.escapeHtml(build.class)}` : 'Unbekannte Klasse'}
        </div>
        <div class="build-actions">
          <button data-action="view" data-url="${this.escapeHtml(build.url || '')}" title="Ansehen">👁️ Ansehen</button>
          <button data-action="delete" data-url="${this.escapeHtml(build.url || '')}" title="Löschen">🗑️</button>
        </div>
      `;

      listEl.appendChild(li);
    });

    // Event Delegation für Build-Actions
    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (btn) {
        const action = btn.dataset.action;
        const url = btn.dataset.url;

        if (action === 'view') {
          chrome.tabs.create({ url: url });
        } else if (action === 'delete') {
          this.deleteBuild(url);
        }
      }
    });
  }

  updateLastUpdate() {
    const lastUpdateEl = document.getElementById('last-update');

    chrome.storage.local.get('vitabloBuilds', (result) => {
      const data = result.vitabloBuilds || {};
      if (data.lastUpdate) {
        const date = new Date(data.lastUpdate);
        const now = new Date();
        const diff = now - date;

        let text = 'Zuletzt aktualisiert: ';

        if (diff < 60000) {
          text += 'Gerade eben';
        } else if (diff < 3600000) {
          const mins = Math.floor(diff / 60000);
          text += `Vor ${mins} Minute${mins > 1 ? 'n' : ''}`;
        } else if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000);
          text += `Vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
        } else {
          text += date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        lastUpdateEl.textContent = text;
      }
    });
  }

  bindEvents() {
    // Build Manager öffnen
    document.getElementById('open-manager').addEventListener('click', () => {
      chrome.tabs.create({
        url: 'file:///C:/Users/Mandy/Documents/d4-build-manager/d4-build-manager.html'
      });
    });

    // Export
    document.getElementById('export-builds').addEventListener('click', () => {
      this.exportBuilds();
    });

    // Import
    document.getElementById('import-builds').addEventListener('click', () => {
      this.importBuilds();
    });

    // Alle löschen
    document.getElementById('clear-builds').addEventListener('click', () => {
      if (confirm('Möchtest du wirklich alle gespeicherten Builds löschen?')) {
        chrome.runtime.sendMessage({ type: 'CLEAR_BUILDS' }, () => {
          this.builds = [];
          this.updateUI();
        });
      }
    });
  }

  exportBuilds() {
    chrome.runtime.sendMessage({ type: 'EXPORT_BUILDS' }, (response) => {
      const data = JSON.stringify(response.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `d4-builds-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  importBuilds() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            chrome.runtime.sendMessage({
              type: 'IMPORT_BUILDS',
              data: data
            }, () => {
              this.loadBuilds().then(() => this.updateUI());
              alert('Builds erfolgreich importiert!');
            });
          } catch (error) {
            alert('Fehler beim Importieren: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    });

    input.click();
  }

  deleteBuild(url) {
    chrome.storage.local.get('vitabloBuilds', (result) => {
      const data = result.vitabloBuilds || { builds: [] };
      data.builds = data.builds.filter(b => b.url !== url);
      data.lastUpdate = new Date().toISOString();

      chrome.storage.local.set({ vitabloBuilds: data }, () => {
        this.builds = data.builds;
        this.updateUI();
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
