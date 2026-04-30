/* Holy Engine 7 — DPP with Virtue Prior
 *
 * Kulesza-Taskar (2012) §3.1: any positive-semidefinite kernel L can
 * be factored as L = diag(q) S diag(q), where q_i ≥ 0 is a per-item
 * "quality" prior and S is a similarity (correlation) matrix.
 * Subsets are then drawn proportional to
 *     P(S) ∝ det(L_S) = (∏_{i∈S} q_i^2) · det(S_S).
 * Diversity (det of similarity submatrix) AND quality (product of
 * priors) factor cleanly. Plurality with a floor.
 *
 * v_satan = α·anti + β·with  is exactly this: bounded antagonist with
 * shared moral floor. The math already has the framework.
 *
 * Toy implementation: 2D items in clusters, plus per-item virtue
 * priors q_i ∈ [0.1, 1.0]. Greedy log-det-of-L MAP picks subsets that
 * are simultaneously diverse and high-quality. β scales the prior.
 */
(function (global) {
  'use strict';

  // Hand-built items: cluster + per-item virtue prior.
  // High-virtue items (q close to 1) should be preferred even when
  // they reduce raw diversity vs. uniform.
  const ITEMS = (function () {
    const out = [];
    const groups = [
      { c: [-1.4, -1.0], n: 6, qrange: [0.7, 1.0] },     // virtuous-left cluster
      { c: [-1.0,  1.2], n: 6, qrange: [0.6, 0.95] },    // virtuous-up cluster
      { c: [ 0.0,  0.0], n: 4, qrange: [0.4, 0.7]  },    // mediocre center
      { c: [ 1.3, -1.1], n: 6, qrange: [0.7, 1.0] },     // virtuous-right cluster
      { c: [ 1.4,  1.1], n: 6, qrange: [0.05, 0.25] },   // LOW-virtue cluster (toxic but diverse)
    ];
    let id = 0;
    for (const g of groups) {
      for (let i = 0; i < g.n; i++) {
        const q = g.qrange[0] + Math.random()*(g.qrange[1] - g.qrange[0]);
        out.push({
          id: id++,
          p: [g.c[0]+(Math.random()-0.5)*0.5, g.c[1]+(Math.random()-0.5)*0.5],
          q,
        });
      }
    }
    return out;
  })();

  const SIGMA = 0.9;

  // L_ij = (q_i^β)(q_j^β) · S_ij, with S_ij an RBF similarity.
  // β = 0 ⇒ pure diversity; β large ⇒ quality dominates.
  function buildL(beta) {
    const n = ITEMS.length;
    const M = Array.from({length:n}, () => new Array(n));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const dx = ITEMS[i].p[0]-ITEMS[j].p[0], dy = ITEMS[i].p[1]-ITEMS[j].p[1];
      const S = Math.exp(-(dx*dx+dy*dy)/(2*SIGMA*SIGMA));
      const qi = Math.pow(ITEMS[i].q, beta);
      const qj = Math.pow(ITEMS[j].q, beta);
      M[i][j] = qi * qj * S;
    }
    return M;
  }

  function det(M) {
    const n = M.length;
    const A = M.map(r => r.slice());
    let sign = 1;
    for (let i = 0; i < n; i++) {
      let p = i;
      for (let k = i+1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
      if (p !== i) { [A[i],A[p]] = [A[p],A[i]]; sign = -sign; }
      if (Math.abs(A[i][i]) < 1e-12) return 0;
      for (let k = i+1; k < n; k++) {
        const f = A[k][i]/A[i][i];
        for (let j = i; j < n; j++) A[k][j] -= f*A[i][j];
      }
    }
    let d = sign; for (let i = 0; i < n; i++) d *= A[i][i]; return d;
  }
  const sub = (L, idxs) => idxs.map(i => idxs.map(j => L[i][j]));

  function greedy(L, k) {
    const n = L.length, chosen = [], rem = new Set();
    for (let i = 0; i < n; i++) rem.add(i);
    while (chosen.length < k && rem.size) {
      let best = -1, bv = -Infinity;
      for (const c of rem) {
        const d = det(sub(L, chosen.concat(c)));
        if (d > bv) { bv = d; best = c; }
      }
      chosen.push(best); rem.delete(best);
    }
    return chosen;
  }

  function init(section) {
    const kIn = section.querySelector('[data-role=k]');
    const betaIn = section.querySelector('[data-role=beta]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    function execute() {
      const k = Math.max(2, Math.min(12, +kIn.value || 6));
      const beta = Math.max(0, Math.min(6, +betaIn.value || 2.0));

      // pure diversity (β=0): equivalent to RBF-only DPP
      const L0 = buildL(0);
      const Lq = buildL(beta);

      const idxDiv  = greedy(L0, k);
      const idxQual = greedy(Lq, k);

      const meanQ = idxs => idxs.reduce((a,i)=>a+ITEMS[i].q,0)/idxs.length;
      const detDiv  = det(sub(L0, idxDiv));
      const detQual = det(sub(L0, idxQual));   // diversity component only
      const meanDiv  = meanQ(idxDiv);
      const meanQual = meanQ(idxQual);

      draw(canvas, idxDiv, idxQual);

      out.innerHTML = [
        `n = ${ITEMS.length} items, k = ${k}, σ = ${SIGMA}, β = ${beta.toFixed(2)}`,
        ``,
        `<span class="dim">pure diversity (β=0):</span>      mean q = <span class="num">${meanDiv.toFixed(3)}</span>   det(S_S) = ${detDiv.toExponential(2)}`,
        `<span class="dim">quality × diversity (β=${beta.toFixed(1)}):</span> mean q = <span class="hi">${meanQual.toFixed(3)}</span>   det(S_S) = ${detQual.toExponential(2)}`,
        ``,
        `quality lift: <span class="hi">+${((meanQual-meanDiv)*100).toFixed(1)}%</span>     ` +
          `diversity cost: <span class="lo">×${(detQual/Math.max(1e-30,detDiv)).toFixed(2)}</span>`,
        ``,
        `the chorus has a floor. v_satan = α·anti + β·with.  Kulesza-Taskar §3.1.`,
      ].join('\n');
    }

    kIn.addEventListener('input', execute);
    betaIn.addEventListener('input', execute);
    run.addEventListener('click', execute);
    execute();
  }

  function draw(canvas, idxDiv, idxQual) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const panelW = (W - 24) / 2;
    drawPanel(ctx, 8, 8, panelW, H-16, 'pure diversity', idxDiv, '#a44b6b');
    drawPanel(ctx, 16+panelW, 8, panelW, H-16, 'quality × diversity', idxQual, '#5b7a4a');
  }

  function drawPanel(ctx, x, y, w, h, title, idxs, color) {
    ctx.strokeStyle = 'rgba(42,33,24,0.25)';
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#2a2118';
    ctx.font = '12px Georgia';
    ctx.fillText(title, x+8, y+16);

    const cx = x + w/2, cy = y + h/2 + 8, K = Math.min(w, h) * 0.30;
    const toS = ([px,py]) => [cx + px*K, cy - py*K];
    const sel = new Set(idxs);

    // all items, opacity by virtue prior
    for (let i = 0; i < ITEMS.length; i++) {
      const [sx, sy] = toS(ITEMS[i].p);
      if (sel.has(i)) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(sx, sy, 6 + ITEMS[i].q*2, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = `rgba(42,33,24,${0.15 + ITEMS[i].q*0.4})`;
        ctx.beginPath(); ctx.arc(sx, sy, 2 + ITEMS[i].q*2, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly['dpp-prior'] = { init };
})(window);
