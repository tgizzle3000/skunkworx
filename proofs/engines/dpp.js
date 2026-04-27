/* Engine 7 — DPP Diversity Sampling
 *
 * Kulesza & Taskar (2012). Determinantal Point Processes assign every
 * subset S a probability proportional to det(L_S), where L is a PSD
 * kernel matrix over items. Geometrically, det(L_S) is the squared
 * volume of the parallelepiped spanned by the items' feature vectors,
 * so subsets of similar items have low probability and diverse
 * subsets have high probability.
 *
 * Exact MAP for k-DPP is NP-hard, but the standard greedy is a
 * (1 − 1/e) approximation: at each step pick the item that maximally
 * increases the log-determinant. We implement that here (equivalent
 * to greedy farthest-first under cosine similarity for unit vectors).
 *
 * Compare to uniform-random sampling on the same item set to make
 * the diversity-as-volume claim measurable.
 */
(function (global) {
  'use strict';

  // 2D items (also serving as feature vectors for the kernel).
  // We arrange them into a few clusters so that uniform sampling
  // tends to oversample dense clusters and DPP doesn't.
  const ITEMS = (function () {
    const out = [];
    const clusters = [
      { c: [-1.4, -1.0], n: 8 },
      { c: [-1.0,  1.2], n: 7 },
      { c: [ 0.0,  0.0], n: 4 },
      { c: [ 1.3, -1.1], n: 7 },
      { c: [ 1.4,  1.1], n: 6 },
    ];
    let id = 0;
    for (const cl of clusters) {
      for (let i = 0; i < cl.n; i++) {
        out.push({
          id: id++,
          p: [cl.c[0] + (Math.random()-0.5)*0.5, cl.c[1] + (Math.random()-0.5)*0.5],
        });
      }
    }
    return out;
  })();

  // RBF kernel L_ij = exp(-||x_i - x_j||^2 / (2 sigma^2)). PSD, so
  // det(L_S) is well-defined and equals the squared volume in feature
  // space (Kulesza-Taskar §2).
  const SIGMA = 0.9;
  function L(i, j) {
    const dx = ITEMS[i].p[0]-ITEMS[j].p[0];
    const dy = ITEMS[i].p[1]-ITEMS[j].p[1];
    const d2 = dx*dx + dy*dy;
    return Math.exp(-d2 / (2*SIGMA*SIGMA));
  }

  // Determinant via LU (small matrices, naive is fine).
  function det(M) {
    const n = M.length;
    const A = M.map(r => r.slice());
    let sign = 1;
    for (let i = 0; i < n; i++) {
      let pivot = i;
      for (let k = i+1; k < n; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[pivot][i])) pivot = k;
      }
      if (pivot !== i) { [A[i], A[pivot]] = [A[pivot], A[i]]; sign = -sign; }
      if (Math.abs(A[i][i]) < 1e-12) return 0;
      for (let k = i+1; k < n; k++) {
        const f = A[k][i] / A[i][i];
        for (let j = i; j < n; j++) A[k][j] -= f * A[i][j];
      }
    }
    let d = sign;
    for (let i = 0; i < n; i++) d *= A[i][i];
    return d;
  }

  function submatrix(idxs) {
    return idxs.map(i => idxs.map(j => L(i, j)));
  }

  // Greedy MAP for k-DPP: pick items one at a time to maximize the
  // marginal log-det gain. (1 − 1/e)-approximation for monotone
  // submodular log-det (Kulesza-Taskar §4).
  function greedyDPP(k) {
    const n = ITEMS.length;
    const chosen = [];
    const remaining = new Set();
    for (let i = 0; i < n; i++) remaining.add(i);

    while (chosen.length < k && remaining.size) {
      let best = -1, bestVal = -Infinity;
      for (const c of remaining) {
        const trial = chosen.concat(c);
        const sub = submatrix(trial);
        const d = det(sub);
        if (d > bestVal) { bestVal = d; best = c; }
      }
      if (best === -1) break;
      chosen.push(best);
      remaining.delete(best);
    }
    return chosen;
  }

  function uniformSample(k) {
    const idxs = [];
    const taken = new Set();
    while (idxs.length < k) {
      const i = Math.floor(Math.random() * ITEMS.length);
      if (!taken.has(i)) { idxs.push(i); taken.add(i); }
    }
    return idxs;
  }

  function init(section) {
    const kIn = section.querySelector('[data-role=k]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    function sample() {
      const k = Math.max(2, Math.min(12, +kIn.value || 6));
      const dppIdx = greedyDPP(k);
      const uniIdx = uniformSample(k);
      const dppDet = det(submatrix(dppIdx));
      const uniDet = det(submatrix(uniIdx));

      draw(canvas, dppIdx, uniIdx);

      out.innerHTML = [
        `n = ${ITEMS.length} items, k = ${k},  RBF kernel σ = ${SIGMA}`,
        ``,
        `<span class="dim">DPP-greedy:</span>     det(L_S) = <span class="num">${dppDet.toExponential(3)}</span>`,
        `<span class="dim">uniform random:</span>  det(L_S) = <span class="num">${uniDet.toExponential(3)}</span>`,
        ``,
        `ratio (DPP / uniform) = <span class="hi">${(dppDet / Math.max(1e-30, uniDet)).toFixed(2)}×</span>`,
        ``,
        `det(L_S) is the squared volume of the chosen set —`,
        `larger ⇒ more diverse. Kulesza-Taskar (2012).`,
      ].join('\n');
    }

    run.addEventListener('click', sample);
    sample();
  }

  function draw(canvas, dppIdx, uniIdx) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // two-panel layout
    const panelW = (W - 24) / 2;
    drawPanel(ctx, 8,        8, panelW, H-16, 'DPP-greedy', dppIdx, '#9bd49b');
    drawPanel(ctx, 16+panelW,8, panelW, H-16, 'uniform random', uniIdx, '#ef6b6b');
  }

  function drawPanel(ctx, x, y, w, h, title, idxs, color) {
    ctx.strokeStyle = 'rgba(243,239,230,0.25)';
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#cdc8ba';
    ctx.font = '12px monospace';
    ctx.fillText(title, x+8, y+16);

    const cx = x + w/2, cy = y + h/2 + 8, K = Math.min(w, h) * 0.30;
    const toS = ([px,py]) => [cx + px*K, cy - py*K];
    const sel = new Set(idxs);

    for (let i = 0; i < ITEMS.length; i++) {
      const [sx, sy] = toS(ITEMS[i].p);
      if (sel.has(i)) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(205,200,186,0.4)';
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.dpp = { init };
})(window);
