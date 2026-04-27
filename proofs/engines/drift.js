/* Engine 2 — Diachronic Drift
 *
 * Hamilton, Leskovec & Jurafsky (2016) trained word2vec on Google Books
 * sliced by decade and aligned the embedding spaces with orthogonal
 * Procrustes. They measured cosine distance between a word's vector at
 * decade t and its vector at decade t' to quantify semantic change.
 *
 * Here we reproduce the *operation* on a small synthetic time-sliced
 * vocabulary. Each word has a trajectory in semantic space across
 * decades [1850 … 2000]. We compute cosine distance from the 1850
 * anchor at every later decade — exactly the Hamilton procedure.
 */
(function (global) {
  'use strict';

  // axes: happy, deviant_sex, awe, terrible, transmit_signal, broadcast_audio,
  //       written, fast_transport, friendly, animal
  const DIM = 10;
  const DECADES = [1850, 1870, 1890, 1910, 1930, 1950, 1970, 1990, 2010];

  function vec(obj) {
    const map = {
      happy: 0, deviant: 1, awe: 2, terrible: 3,
      signal: 4, audio: 5, written: 6, fast: 7,
      friendly: 8, animal: 9
    };
    const v = new Array(DIM).fill(0);
    for (const k in obj) v[map[k]] = obj[k];
    return v;
  }

  // Trajectories at each decade, capturing documented historical drifts.
  const TRAJECTORIES = {
    gay: [
      vec({ happy: 1.0, friendly: 0.6 }),
      vec({ happy: 1.0, friendly: 0.6 }),
      vec({ happy: 0.95, friendly: 0.6 }),
      vec({ happy: 0.85, friendly: 0.6, deviant: 0.1 }),
      vec({ happy: 0.7, friendly: 0.5, deviant: 0.2 }),
      vec({ happy: 0.4, friendly: 0.4, deviant: 0.5 }),
      vec({ happy: 0.2, friendly: 0.3, deviant: 0.85 }),
      vec({ happy: 0.1, friendly: 0.3, deviant: 1.0 }),
      vec({ happy: 0.1, friendly: 0.3, deviant: 1.0 }),
    ],
    awful: [
      vec({ awe: 1.0, terrible: 0.0 }),
      vec({ awe: 0.95, terrible: 0.05 }),
      vec({ awe: 0.85, terrible: 0.15 }),
      vec({ awe: 0.7, terrible: 0.3 }),
      vec({ awe: 0.5, terrible: 0.5 }),
      vec({ awe: 0.3, terrible: 0.7 }),
      vec({ awe: 0.15, terrible: 0.85 }),
      vec({ awe: 0.05, terrible: 0.95 }),
      vec({ awe: 0.0, terrible: 1.0 }),
    ],
    broadcast: [
      vec({ written: 1.0 }),
      vec({ written: 0.95 }),
      vec({ written: 0.85, signal: 0.15 }),
      vec({ written: 0.4, signal: 0.6 }),
      vec({ written: 0.15, signal: 0.85, audio: 0.6 }),
      vec({ written: 0.1, signal: 0.9, audio: 0.85 }),
      vec({ written: 0.1, signal: 0.9, audio: 0.85 }),
      vec({ written: 0.1, signal: 0.9, audio: 0.7 }),
      vec({ written: 0.1, signal: 0.9, audio: 0.6 }),
    ],
    mouse: [
      vec({ animal: 1.0 }),
      vec({ animal: 1.0 }),
      vec({ animal: 1.0 }),
      vec({ animal: 1.0 }),
      vec({ animal: 1.0 }),
      vec({ animal: 1.0 }),
      vec({ animal: 0.85, signal: 0.2 }),
      vec({ animal: 0.55, signal: 0.7 }),
      vec({ animal: 0.45, signal: 0.85 }),
    ],
  };

  function dot(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]*b[i]; return s; }
  function norm(a) { return Math.sqrt(dot(a,a)) || 1e-9; }
  function cos(a, b) { return dot(a,b)/(norm(a)*norm(b)); }

  function init(section) {
    const sel = section.querySelector('[data-role=word]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=chart]');
    const run = section.querySelector('[data-role=run]');

    const words = Object.keys(TRAJECTORIES);
    sel.innerHTML = words.map(w => `<option value="${w}">${w}</option>`).join('');
    sel.value = 'gay';

    function measure() {
      const w = sel.value;
      const traj = TRAJECTORIES[w];
      const anchor = traj[0];
      const dists = traj.map(v => 1 - cos(anchor, v));
      drawChart(canvas, DECADES, dists, w);

      const total = dists[dists.length - 1];
      const lines = [
        `word = "${w}",  anchor = ${DECADES[0]}`,
        `cosine distance from anchor at each decade:`,
        ...DECADES.map((d, i) =>
          `  ${d}:  <span class="num">${dists[i].toFixed(4)}</span>`),
        ``,
        `total drift ${DECADES[0]} → ${DECADES.at(-1)}: <span class="hi">${total.toFixed(4)}</span>`,
        `(scalar > 0 ⇒ semantic change measurable; Hamilton et al. 2016)`,
      ];
      out.innerHTML = lines.join('\n');
    }

    run.addEventListener('click', measure);
    sel.addEventListener('change', measure);
    measure();
  }

  function drawChart(canvas, xs, ys, label) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const padL = 50, padR = 16, padT = 16, padB = 32;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    ctx.strokeStyle = 'rgba(243,239,230,0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (innerH * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    }

    ctx.fillStyle = '#cdc8ba';
    ctx.font = '11px monospace';
    for (let i = 0; i <= 4; i++) {
      const v = (1 - i/4).toFixed(2);
      ctx.fillText(v, 8, padT + (innerH * i / 4) + 4);
    }
    for (let i = 0; i < xs.length; i++) {
      const x = padL + innerW * i / (xs.length - 1);
      ctx.fillText(xs[i], x - 14, H - 10);
    }

    ctx.strokeStyle = '#f5d76e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < ys.length; i++) {
      const x = padL + innerW * i / (ys.length - 1);
      const y = padT + innerH * (1 - Math.min(1, ys[i]));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#f5d76e';
    for (let i = 0; i < ys.length; i++) {
      const x = padL + innerW * i / (ys.length - 1);
      const y = padT + innerH * (1 - Math.min(1, ys[i]));
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = '#f3efe6';
    ctx.fillText(`cos-dist("${label}", anchor) over time`, padL, 12);
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.drift = { init };
})(window);
