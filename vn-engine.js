/**
 * NEON VENOM: TALES FROM THE DOPAMINE CATHEDRAL
 * VN Engine — Twine-style passage system
 * Phase 1 Prototype
 */

'use strict';

// ── Utility ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Asset Manager ─────────────────────────────────────────────────────────────

class AssetManager {
  constructor() {
    this.backgrounds = {};
    this.characters  = {};
    this._loaded     = new Set();
  }

  registerBg(id, url)   { this.backgrounds[id] = url; }
  registerChar(id, url) { this.characters[id]   = url; }
  getBg(id)   { return this.backgrounds[id] || null; }
  getChar(id) { return this.characters[id]  || null; }

  preload(url) {
    if (this._loaded.has(url)) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => { this._loaded.add(url); resolve(); };
      img.src = url;
    });
  }
}

// ── Audio Manager ─────────────────────────────────────────────────────────────
// Stub: ready for real Web Audio integration in Phase 3

class AudioManager {
  constructor() {
    this._currentTrack = null;
  }

  register(id, url) { /* store url keyed by id for Phase 3 */ }

  async crossfade(id, durationMs = 800) {
    // In Phase 3: decode buffer, crossfade gainNodes
    this._currentTrack = id;
  }

  stop() { this._currentTrack = null; }
}

// ── UI Renderer ───────────────────────────────────────────────────────────────

class UIRenderer {
  constructor() {
    this._bg        = document.getElementById('bg-layer');
    this._char      = document.getElementById('char-layer');
    this._textBox   = document.getElementById('text-box');
    this._prose     = document.getElementById('prose-text');
    this._choices   = document.getElementById('choices-container');
    this._speaker   = document.getElementById('speaker-tag');
    this._advance   = document.getElementById('advance-hint');
    this._glitch    = document.getElementById('glitch-overlay');
    this._flash     = document.getElementById('flash-overlay');

    // Stat elements
    this._lucidityBar = document.getElementById('lucidity-bar');
    this._arousalBar  = document.getElementById('arousal-bar');
    this._lucidityVal = document.getElementById('lucidity-value');
    this._arousalVal  = document.getElementById('arousal-value');
    this._devotionVal = document.getElementById('devotion-value');
    this._cluesVal    = document.getElementById('clues-value');

    // Internal state
    this._advanceFn       = null;
    this._skipRequested   = false;
    this._typewriting     = false;
    this._currentResolve  = null;

    this._bindGlobalClick();
  }

  // ── Click handling ──────────────────────────────────────────────────────────

  _bindGlobalClick() {
    document.getElementById('game').addEventListener('click', (e) => {
      if (e.target.closest('.choice')) return; // let choice handler fire
      if (this._typewriting) {
        this._skipRequested = true;
      } else if (this._advanceFn) {
        const fn = this._advanceFn;
        this._advanceFn = null;
        this._advance.style.display = 'none';
        fn();
      }
    });
  }

  // ── Background ─────────────────────────────────────────────────────────────

  setBackground(id, assets) {
    const url = assets ? assets.getBg(id) : null;
    if (url) {
      this._bg.style.backgroundImage = `url('${encodeURI(url)}')`;
    } else {
      // CSS gradient placeholder keyed by passage id
      const h = this._hashHue(id || 'default');
      this._bg.style.backgroundImage =
        `linear-gradient(135deg,hsl(${h},60%,7%) 0%,hsl(${(h+45)%360},50%,14%) 100%)`;
    }
  }

  // ── Character art ───────────────────────────────────────────────────────────

  setCharacter(id, assets) {
    if (!id) {
      this._char.style.opacity = '0';
      this._char.classList.remove('visible');
      return;
    }
    const url = assets ? assets.getChar(id) : null;
    if (url) {
      this._char.src = url;
      this._char.classList.add('visible');
    } else {
      // No art asset yet — hide so there's no broken image
      this._char.style.opacity = '0';
      this._char.classList.remove('visible');
    }
  }

  // ── Speaker tag ─────────────────────────────────────────────────────────────

  setSpeaker(name, type = 'narrator') {
    if (!name) {
      this._speaker.textContent = '';
      this._speaker.className = 'speaker';
    } else {
      this._speaker.textContent = name;
      this._speaker.className = `speaker ${type}`;
    }
  }

  // ── Typewriter text ─────────────────────────────────────────────────────────

  async displayText(rawText) {
    this._choices.innerHTML = '';
    this._advance.style.display = 'none';
    this._prose.innerHTML = '';
    this._skipRequested = false;
    this._typewriting = true;

    // Parse markup → DOM, then typewrite
    const temp = document.createElement('div');
    temp.innerHTML = this._parseMarkup(rawText.trim());

    await this._typewriteNode(temp, this._prose);
    this._typewriting = false;

    // Auto-scroll to bottom
    this._textBox.scrollTop = this._textBox.scrollHeight;
  }

  async _typewriteNode(src, dest) {
    for (const child of Array.from(src.childNodes)) {
      if (this._skipRequested) {
        // Dump remaining as text
        dest.innerHTML += src.innerHTML;
        return;
      }
      if (child.nodeType === Node.TEXT_NODE) {
        await this._typewriteText(child.textContent, dest);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag   = child.tagName.toLowerCase();
        const clone = document.createElement(tag);
        if (child.className) clone.className = child.className;
        dest.appendChild(clone);
        await this._typewriteNode(child, clone);
      }
    }
  }

  _typewriteText(text, container) {
    return new Promise((resolve) => {
      let i = 0;
      const SPEED = 16; // ms per character — feel free to tune

      const tick = () => {
        if (this._skipRequested || i >= text.length) {
          if (this._skipRequested && i < text.length) {
            container.textContent += text.slice(i);
          }
          this._skipRequested = false;
          this._textBox.scrollTop = this._textBox.scrollHeight;
          resolve();
          return;
        }
        container.textContent += text[i++];
        this._textBox.scrollTop = this._textBox.scrollHeight;
        setTimeout(tick, SPEED);
      };

      tick();
    });
  }

  // Convert loose markup to HTML
  _parseMarkup(raw) {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Restore intentional HTML-like tags we use as markup
      .replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gs,     '<em>$1</em>')
      .replace(/\[whisper\](.*?)\[\/whisper\]/gs, '<span class="whisper">$1</span>')
      .replace(/\[clue\](.*?)\[\/clue\]/gs,       '<span class="clue-text">$1</span>')
      .replace(/\[warn\](.*?)\[\/warn\]/gs,        '<span class="warn">$1</span>')
      .replace(/\[flesh\](.*?)\[\/flesh\]/gs,      '<span class="flesh">$1</span>')
      .replace(/\[sacred\](.*?)\[\/sacred\]/gs,    '<span class="sacred">$1</span>')
      // Paragraphs from blank lines
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  // ── Choices ─────────────────────────────────────────────────────────────────

  showChoices(choices, onSelect) {
    this._choices.innerHTML = '';
    this._advance.style.display = 'none';

    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = `choice ${choice.class || ''}`;

      if (choice.locked) {
        btn.classList.add('locked');
        btn.textContent = `⊘ ${choice.text}`;
        if (choice.lockHint) btn.title = choice.lockHint;
      } else {
        btn.textContent = `► ${choice.text}`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          btn.style.opacity = '0.4';
          btn.style.pointerEvents = 'none';
          this._choices.querySelectorAll('.choice').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => onSelect(choice), 120);
        });
      }

      this._choices.appendChild(btn);
    });
  }

  // ── Advance ─────────────────────────────────────────────────────────────────

  onAdvance(fn) {
    this._advance.style.display = 'block';
    this._advanceFn = fn;
  }

  waitForAdvance() {
    return new Promise((resolve) => this.onAdvance(resolve));
  }

  // ── Stat HUD ────────────────────────────────────────────────────────────────

  updateStats(state) {
    const lPct = Math.max(0, Math.min(100, state.lucidity));
    const aPct = Math.max(0, Math.min(100, state.arousal));

    this._lucidityBar.style.width = `${lPct}%`;
    this._lucidityVal.textContent = Math.floor(lPct);

    // Lucidity colour
    this._lucidityBar.className = 'stat-bar' + (lPct < 30 ? ' low' : lPct < 60 ? ' mid' : '');

    this._arousalBar.style.width = `${aPct}%`;
    this._arousalVal.textContent = Math.floor(aPct);

    this._devotionVal.textContent = Math.floor(state.devotion);
    this._cluesVal.textContent    = state.clues.length;

    // ── Dynamic visual feedback ───────────────────────────────────────────────

    let bgFilter = 'brightness(0.82) saturate(1.2)';
    let bgTransform = '';

    // Arousal shifts hue toward warm
    if (aPct > 50) {
      const warmth = (aPct - 50) * 0.35;
      bgFilter = `brightness(0.9) saturate(1.55) hue-rotate(-${warmth}deg)`;
    }

    // Low lucidity: blur + micro-tremor
    if (lPct < 40) {
      const blurAmt = (40 - lPct) * 0.07;
      const sX = (Math.random() * 2 - 1) * (40 - lPct) * 0.06;
      const sY = (Math.random() * 2 - 1) * (40 - lPct) * 0.06;
      bgFilter    += ` blur(${blurAmt}px)`;
      bgTransform  = `translate(${sX}px,${sY}px)`;
    }

    this._bg.style.filter    = bgFilter;
    this._bg.style.transform = bgTransform;
  }

  // ── Transitions ─────────────────────────────────────────────────────────────

  async transition(type) {
    switch (type) {
      case 'glitch':      await this._glitchTransition();      break;
      case 'dissolve':    await this._dissolveTransition();    break;
      case 'psychedelic': await this._psychedelicTransition(); break;
      case 'whiteout':    await this._whiteoutTransition();    break;
      case 'blackout':    await this._blackoutTransition();    break;
      default:            await this._fadeTransition();        break;
    }
  }

  async _fadeTransition() {
    const g = document.getElementById('game');
    g.style.transition = 'opacity 0.35s';
    g.style.opacity = '0';
    await sleep(350);
    g.style.opacity = '1';
  }

  async _glitchTransition() {
    this._glitch.style.display = 'block';
    const colors = ['#ff2d7b', '#00f0ff', '#39ff14', '#ff1744'];

    const populate = (count) => {
      this._glitch.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        const h   = 1 + Math.random() * 7;
        const top = Math.random() * 100;
        const c   = colors[~~(Math.random() * colors.length)];
        const w   = 40 + Math.random() * 60;
        const l   = Math.random() * (100 - w);
        bar.style.cssText =
          `position:absolute;width:${w}%;height:${h}px;top:${top}%;left:${l}%;` +
          `background:${c};mix-blend-mode:screen;opacity:0.88;`;
        this._glitch.appendChild(bar);
      }
    };

    populate(14);
    await sleep(110);
    populate(7);
    await sleep(70);
    this._glitch.innerHTML = '';
    this._glitch.style.display = 'none';
  }

  async _dissolveTransition() {
    this._bg.style.transition = 'filter 0.28s';
    this._bg.style.filter = 'blur(8px) brightness(2.2)';
    await sleep(280);
    this._bg.style.filter = '';
  }

  async _psychedelicTransition() {
    const g = document.getElementById('game');
    g.style.transition = 'filter 0.5s, transform 0.5s';
    g.style.filter    = 'hue-rotate(180deg) saturate(4) brightness(1.6)';
    g.style.transform = 'scale(1.045)';
    await sleep(500);
    g.style.filter    = '';
    g.style.transform = '';
  }

  async _whiteoutTransition() {
    this._flash.style.background  = '#fff';
    this._flash.style.transition  = 'opacity 0.08s';
    this._flash.style.opacity     = '1';
    await sleep(180);
    this._flash.style.transition  = 'opacity 0.5s';
    this._flash.style.opacity     = '0';
  }

  async _blackoutTransition() {
    this._flash.style.background  = '#000';
    this._flash.style.transition  = 'opacity 0.7s';
    this._flash.style.opacity     = '1';
    await sleep(1400);
    this._flash.style.transition  = 'opacity 0.5s';
    this._flash.style.opacity     = '0';
  }

  // ── Menu ────────────────────────────────────────────────────────────────────

  showMenu()  { document.getElementById('main-menu').classList.add('active');    }
  hideMenu()  { document.getElementById('main-menu').classList.remove('active'); }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _hashHue(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
  }
}

// ── Save Manager ──────────────────────────────────────────────────────────────

class SaveManager {
  static AUTO_KEY  = 'nv_autosave';
  static SLOT_KEY  = (n) => `nv_slot_${n}`;

  static save(state) {
    try {
      localStorage.setItem(this.AUTO_KEY, JSON.stringify({ state, ts: Date.now() }));
    } catch (e) { /* storage full */ }
  }

  static load() {
    try {
      const raw = localStorage.getItem(this.AUTO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  static hasSave() { return localStorage.getItem(this.AUTO_KEY) !== null; }

  static clear()   { localStorage.removeItem(this.AUTO_KEY); }

  static saveSlot(n, state) {
    try { localStorage.setItem(this.SLOT_KEY(n), JSON.stringify({ state, ts: Date.now() })); }
    catch (e) {}
  }

  static loadSlot(n) {
    try {
      const raw = localStorage.getItem(this.SLOT_KEY(n));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
}

// ── NeonVenom — Main Engine ───────────────────────────────────────────────────

class NeonVenom {
  constructor() {
    this.passages   = {};
    this.ui         = new UIRenderer();
    this.audio      = new AudioManager();
    this.assets     = new AssetManager();
    this.state      = this._defaultState();
    this._navigating = false; // guard against double-clicks mid-transition
  }

  // ── State ───────────────────────────────────────────────────────────────────

  _defaultState() {
    return {
      episode:    'ep01',
      passage:    null,
      checkpoint: null, // last non-hallucination passage for death-reset
      lucidity:   100,
      arousal:    0,
      devotion:   0,
      clues:      [],
      flags:      {},
      relationships: {},
      history:    [],
      deathCount: 0,
    };
  }

  // ── Passage registration ────────────────────────────────────────────────────

  passage(id, data) {
    this.passages[id] = data;
    return this; // fluent
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async goto(id) {
    if (this._navigating) return;
    this._navigating = true;

    const p = this.passages[id];
    if (!p) {
      console.error(`[NeonVenom] Passage not found: "${id}"`);
      this._navigating = false;
      return;
    }

    // Track history
    this.state.history.push(id);
    this.state.passage = id;

    // Checkpoint — where we reset to after hallucination
    if (!id.startsWith('hallucination_')) {
      this.state.checkpoint = id;
    }

    // Lifecycle hook
    if (p.onEnter) p.onEnter(this.state);

    // Transition
    await this.ui.transition(p.transition || 'fade');

    // Background
    const bgId = typeof p.bg === 'function' ? p.bg(this.state) : p.bg;
    if (bgId) this.ui.setBackground(bgId, this.assets);

    // Character
    const charId = typeof p.character === 'function' ? p.character(this.state) : (p.character || null);
    this.ui.setCharacter(charId, this.assets);

    // Speaker
    const spName = typeof p.speaker === 'function' ? p.speaker(this.state) : (p.speaker || '');
    this.ui.setSpeaker(spName, p.speakerType || 'narrator');

    // Music
    if (p.music) this.audio.crossfade(p.music);

    // Text
    const text = typeof p.text === 'function' ? p.text(this.state) : (p.text || '');
    await this.ui.displayText(text);

    // HUD
    this.ui.updateStats(this.state);

    // Auto-save
    SaveManager.save(this.state);

    this._navigating = false;

    // Lucidity death check
    if (this.state.lucidity <= 0) {
      await sleep(700);
      await this._hallucinate();
      return;
    }

    // Resolve: choices or auto-advance
    if (p.choices) {
      const raw = p.choices(this.state);
      // Map: hidden choices disappear; locked choices show greyed with hint
      const visible = raw.map(c => {
        if (c.if && !c.if(this.state)) {
          return c.lockHint ? { ...c, locked: true } : null;
        }
        return c;
      }).filter(Boolean);

      this.ui.showChoices(visible, (choice) => {
        if (choice.effect) choice.effect(this.state);
        this.ui.updateStats(this.state);
        SaveManager.save(this.state);
        this.goto(choice.goto);
      });

    } else if (p.next) {
      this.ui.onAdvance(() => this.goto(p.next));
    }
  }

  // ── Hallucination death ─────────────────────────────────────────────────────

  async _hallucinate() {
    this.state.deathCount++;
    const hallId = `hallucination_${this.state.episode}`;
    if (this.passages[hallId]) {
      await this.goto(hallId);
    }
  }

  // ── Init / boot ─────────────────────────────────────────────────────────────

  init() {
    // Show continue button only if a save exists
    const hasSave = SaveManager.hasSave();
    const btnCont = document.getElementById('btn-continue');
    if (hasSave) {
      btnCont.style.display = 'block';
    }

    document.getElementById('btn-start').addEventListener('click', () => {
      this._startNew();
    });

    btnCont.addEventListener('click', () => {
      this._continue();
    });

    document.getElementById('btn-new').addEventListener('click', () => {
      if (confirm('Start a new game? Your saved progress will be erased.')) {
        SaveManager.clear();
        this._startNew();
      }
    });

    this.ui.showMenu();
  }

  _startNew() {
    this.state = this._defaultState();
    this.ui.hideMenu();
    this.goto('ep01_start');
  }

  _continue() {
    const saved = SaveManager.load();
    if (saved && saved.state) {
      this.state = saved.state;
      this.ui.hideMenu();
      this.goto(this.state.passage || 'ep01_start');
    } else {
      this._startNew();
    }
  }
}

// ── Export ────────────────────────────────────────────────────────────────────

window.NeonVenom   = NeonVenom;
window.SaveManager = SaveManager;

window.addEventListener('DOMContentLoaded', () => {
  window.game = new NeonVenom();
  window.game.init();
});
