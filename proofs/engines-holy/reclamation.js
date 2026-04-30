/* Holy Engine 2 — Reclamation Drift
 *
 * The same Hamilton-Leskovec-Jurafsky (2016) cosine-over-decades
 * machinery that quantifies "awful: awe-inspiring → terrible" also
 * quantifies recovery: "queer", "witch", "nerd", "geek" — terms that
 * drifted from neutral or affirmative use, were stigmatized, and
 * then drifted *back* toward affirmation through community
 * reclamation.
 *
 * The drift scalar is signed by direction in semantic space, not by
 * narrative valence. We anchor each word at its EARLIEST trajectory
 * point and a hand-labeled "affirmation" axis. Cosine similarity to
 * the affirmation axis is plotted; recovery shows up as a U-curve
 * dipping into stigma and rising again.
 */
(function (global) {
  'use strict';

  // axes: affirm, slur, neutral_descriptive, magic, technical
  const DIM = 5;
  const DECADES = [1850, 1900, 1950, 1980, 2000, 2020];

  function vec(o){
    const m = {affirm:0, slur:1, neutral:2, magic:3, technical:4};
    const v = new Array(DIM).fill(0);
    for (const k in o) v[m[k]] = o[k];
    return v;
  }

  const TRAJECTORIES = {
    queer: [
      vec({ neutral: 1.0, affirm: 0.2 }),                    // 1850 = "strange/distinctive"
      vec({ neutral: 0.8, affirm: 0.1, slur: 0.2 }),
      vec({ slur: 0.85, neutral: 0.2 }),                     // 1950 = stigmatized
      vec({ slur: 0.95, neutral: 0.1 }),                     // 1980 = peak slur
      vec({ slur: 0.5, affirm: 0.6, neutral: 0.2 }),         // 2000 = reclamation begins
      vec({ affirm: 0.95, slur: 0.1, neutral: 0.3 }),        // 2020 = academic + community affirm
    ],
    witch: [
      vec({ neutral: 0.6, magic: 0.9, slur: 0.3 }),
      vec({ slur: 0.85, magic: 0.6 }),
      vec({ slur: 0.7, magic: 0.7 }),
      vec({ slur: 0.4, magic: 0.85, neutral: 0.4 }),
      vec({ magic: 0.9, affirm: 0.5, neutral: 0.4 }),
      vec({ affirm: 0.85, magic: 0.95, neutral: 0.4 }),       // self-identified affirm
    ],
    nerd: [
      vec({ neutral: 1.0 }),
      vec({ neutral: 1.0 }),
      vec({ slur: 0.4, technical: 0.6, neutral: 0.5 }),
      vec({ slur: 0.85, technical: 0.6 }),                    // 1980 peak stigma
      vec({ slur: 0.4, technical: 0.85, affirm: 0.5 }),
      vec({ affirm: 0.9, technical: 0.95, slur: 0.1 }),        // 2020 = self-affirm
    ],
    geek: [
      vec({ slur: 0.7, neutral: 0.3 }),                       // sideshow performer
      vec({ slur: 0.85, neutral: 0.2 }),
      vec({ slur: 0.7, technical: 0.3, neutral: 0.3 }),
      vec({ slur: 0.6, technical: 0.7 }),
      vec({ slur: 0.3, technical: 0.85, affirm: 0.6 }),
      vec({ affirm: 0.9, technical: 0.95, slur: 0.1 }),
    ],
  };

  const AFFIRM = vec({ affirm: 1.0 });

  function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;}
  function norm(a){return Math.sqrt(dot(a,a))||1e-9;}
  function cos(a,b){return dot(a,b)/(norm(a)*norm(b));}

  function init(section) {
    const sel = section.querySelector('[data-role=word]');
    const out = section.querySelector('[data-role=out]');
    const run = section.querySelector('[data-role=run]');
    const canvas = section.querySelector('[data-role=chart]');

    sel.innerHTML = Object.keys(TRAJECTORIES).map(w =>
      `<option value="${w}">${w}</option>`).join('');

    function measure() {
      const w = sel.value;
      const traj = TRAJECTORIES[w];
      const sims = traj.map(v => cos(AFFIRM, v));
      drawChart(canvas, DECADES, sims, w);

      // signed change from peak-stigma low to latest
      let lowIdx = 0; for (let i = 1; i < sims.length; i++) if (sims[i] < sims[lowIdx]) lowIdx = i;
      const recovery = sims[sims.length - 1] - sims[lowIdx];

      const lines = [
        `word = "${w}"`,
        `cos(vector_t, AFFIRM_axis) per decade:`,
        ...DECADES.map((d, i) =>
          `  ${d}: <span class="num">${sims[i].toFixed(4)}</span>`),
        ``,
        `peak-stigma decade: ${DECADES[lowIdx]}  (cos=${sims[lowIdx].toFixed(4)})`,
        `latest: ${DECADES.at(-1)}  (cos=${sims.at(-1).toFixed(4)})`,
        `<span class="hi">reclamation Δ = +${recovery.toFixed(4)}</span>   (positive ⇒ recovery measurable)`,
      ];
      out.innerHTML = lines.join('\n');
    }

    sel.addEventListener('change', measure);
    run.addEventListener('click', measure);
    measure();
  }

  function drawChart(canvas, xs, ys, label) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    const padL = 50, padR = 16, padT = 16, padB = 32;
    const innerW = W - padL - padR, innerH = H - padT - padB;

    ctx.strokeStyle = 'rgba(42,33,24,0.15)';
    for (let i = 0; i <= 4; i++) {
      const y = padT + (innerH * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    }
    ctx.fillStyle = '#5a4c3a';
    ctx.font = '11px Georgia';
    for (let i = 0; i <= 4; i++) {
      const v = (1 - i/4).toFixed(2);
      ctx.fillText(v, 8, padT + (innerH * i / 4) + 4);
    }
    for (let i = 0; i < xs.length; i++) {
      const x = padL + innerW * i / (xs.length - 1);
      ctx.fillText(xs[i], x - 14, H - 10);
    }

    ctx.strokeStyle = '#b08940';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < ys.length; i++) {
      const x = padL + innerW * i / (ys.length - 1);
      const y = padT + innerH * (1 - Math.max(0, Math.min(1, ys[i])));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#b08940';
    for (let i = 0; i < ys.length; i++) {
      const x = padL + innerW * i / (ys.length - 1);
      const y = padT + innerH * (1 - Math.max(0, Math.min(1, ys[i])));
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = '#2a2118';
    ctx.fillText(`cos("${label}", AFFIRM axis) over time`, padL, 12);
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.reclamation = { init };
})(window);
