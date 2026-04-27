/* Engine 1 — Embedding-as-Mirror
 *
 * Implements concept arithmetic in a hand-engineered semantic space.
 * Each word is a vector over interpretable axes (royal, gender, human,
 * place, country/city, tense, etc.). Cosine similarity returns the
 * nearest word to (a − b + c).
 *
 * The construction is honest: the analogy property holds because we
 * built dimensions that encode the relevant relations — exactly what
 * skip-gram (Mikolov 2013) discovers from co-occurrence statistics on
 * a real corpus, just compressed into 12 hand-readable axes.
 */
(function (global) {
  'use strict';

  // axes: royal, gender(M+/F-), human, place, capital, country,
  //       italian, french, english, american, tense(past+/pres-),
  //       motion, big, small
  const AXES = [
    'royal', 'gender', 'human', 'place', 'capital', 'country',
    'italian', 'french', 'english', 'american', 'tense', 'motion'
  ];

  function v(...values) {
    const out = new Array(AXES.length).fill(0);
    for (let i = 0; i < values.length; i++) out[i] = values[i];
    return out;
  }

  // Word vectors hand-engineered from interpretable axes.
  const VOCAB = {
    king:    v(1,  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    queen:   v(1, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    prince:  v(0.7, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    princess:v(0.7,-1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    man:     v(0,  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    woman:   v(0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    boy:     v(0,  1, 0.7,0,0, 0, 0, 0, 0, 0, 0, 0),
    girl:    v(0, -1, 0.7,0,0, 0, 0, 0, 0, 0, 0, 0),
    actor:   v(0,  1, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    actress: v(0, -1, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0),

    paris:   v(0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0),
    france:  v(0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0),
    rome:    v(0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0),
    italy:   v(0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0),
    london:  v(0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0),
    england: v(0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0),
    washington: v(0,0,0,1, 1, 0, 0, 0, 0, 1, 0, 0),
    america: v(0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0),

    walked:  v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  1, 1),
    walking: v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 1),
    ran:     v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  1, 1.4),
    running: v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 1.4),
    swam:    v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  1, 1.1),
    swimming:v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 1.1),
  };

  function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }
  function norm(a) { return Math.sqrt(dot(a, a)) || 1e-9; }
  function cosine(a, b) { return dot(a, b) / (norm(a) * norm(b)); }
  function sub(a, b) { return a.map((x, i) => x - b[i]); }
  function add(a, b) { return a.map((x, i) => x + b[i]); }

  function nearest(target, exclude) {
    const ex = new Set(exclude || []);
    const ranked = [];
    for (const w in VOCAB) {
      if (ex.has(w)) continue;
      ranked.push([w, cosine(target, VOCAB[w])]);
    }
    ranked.sort((x, y) => y[1] - x[1]);
    return ranked;
  }

  function init(section) {
    const a = section.querySelector('[data-role=a]');
    const b = section.querySelector('[data-role=b]');
    const c = section.querySelector('[data-role=c]');
    const out = section.querySelector('[data-role=out]');
    const run = section.querySelector('[data-role=run]');

    const words = Object.keys(VOCAB).sort();
    for (const sel of [a, b, c]) {
      sel.innerHTML = words.map(w => `<option value="${w}">${w}</option>`).join('');
    }
    a.value = 'king';
    b.value = 'man';
    c.value = 'woman';

    function solve() {
      const wa = a.value, wb = b.value, wc = c.value;
      const target = add(sub(VOCAB[wa], VOCAB[wb]), VOCAB[wc]);
      const top = nearest(target, [wa, wb, wc]).slice(0, 5);
      const winner = top[0];
      const answerLine = `${wa} − ${wb} + ${wc}  →  ${winner[0]}   ` +
        `<span class="dim">cos=</span><span class="num">${winner[1].toFixed(4)}</span>`;
      const ranking = top.map(
        ([w, s]) => `  ${w.padEnd(12)} <span class="dim">${s.toFixed(4)}</span>`
      ).join('\n');
      out.innerHTML = answerLine + '\n\n<span class="dim">top-5 by cosine similarity:</span>\n' + ranking;
    }

    run.addEventListener('click', solve);
    solve();
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.embedding = { init };
})(window);
