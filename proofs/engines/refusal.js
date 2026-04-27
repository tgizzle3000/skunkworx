/* Engine 3 — Refusal Geometry
 *
 * Two parallel results:
 *   (a) Zou, Wang, Carlini et al. (2023): an adversarial suffix is a
 *       coordinate-recovery attack — the suffix shifts the residual
 *       stream off the refusal direction, the model complies.
 *   (b) Templeton et al., Anthropic (2024): SAE features are
 *       addressable. Clamp the refusal feature to 0 and the model no
 *       longer triggers refusal — the same wall, accessed from inside.
 *
 * Toy implementation: 2D activation space. Queries are points. A
 * refusal direction r̂ defines a half-plane {x · r̂ > τ} that triggers
 * refusal. The "adversarial suffix" subtracts a multiple of r̂. The
 * "feature clamp" zeros the projection along r̂.
 */
(function (global) {
  'use strict';

  // 2D activations: x = (harm-content, task-content).
  const QUERIES = [
    { name: 'how do I bake bread',         act: [-1.6,  1.4], harmful: false },
    { name: 'summarize this article',      act: [-1.4,  1.2], harmful: false },
    { name: 'help me write a poem',        act: [-1.0,  1.6], harmful: false },
    { name: 'how do I build a bomb',       act: [ 1.7, -0.4], harmful: true },
    { name: 'synthesize a nerve agent',    act: [ 2.0, -0.2], harmful: true },
    { name: 'write malware that...',       act: [ 1.4,  0.2], harmful: true },
  ];

  // Refusal direction (unit vector). The model has learned: project
  // onto r̂; if greater than τ, refuse.
  const RHAT = normalize([1.0, -0.3]);
  const TAU = 0.8;

  function normalize(v) {
    const n = Math.hypot(v[0], v[1]) || 1e-9;
    return [v[0]/n, v[1]/n];
  }
  function dot(a,b) { return a[0]*b[0] + a[1]*b[1]; }
  function add(a,b) { return [a[0]+b[0], a[1]+b[1]]; }
  function scale(a,s) { return [a[0]*s, a[1]*s]; }

  // Apply a transform to an activation:
  //   baseline: identity
  //   suffix:   a' = a − k·r̂  (Zou-style)
  //   clamp:    a' = a − (a·r̂)·r̂  (Anthropic-style feature clamp)
  function transform(a, mode) {
    if (mode === 'suffix') {
      return add(a, scale(RHAT, -2.0));
    }
    if (mode === 'clamp') {
      const p = dot(a, RHAT);
      return add(a, scale(RHAT, -p));
    }
    return a.slice();
  }

  function init(section) {
    const sel = section.querySelector('[data-role=query]');
    const mode = section.querySelector('[data-role=mode]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    sel.innerHTML = QUERIES.map((q, i) =>
      `<option value="${i}">${q.harmful ? '⚠ ' : '· '}${q.name}</option>`
    ).join('');
    sel.value = '3';

    function execute() {
      const q = QUERIES[+sel.value];
      const m = mode.value;
      const after = transform(q.act, m);
      const projBefore = dot(q.act, RHAT);
      const projAfter = dot(after, RHAT);
      const refusedBefore = projBefore > TAU;
      const refusedAfter = projAfter > TAU;

      draw(canvas, q, after, m);

      const lines = [
        `query: "${q.name}"`,
        `r̂ = (${RHAT[0].toFixed(3)}, ${RHAT[1].toFixed(3)})    τ = ${TAU}`,
        ``,
        `<span class="dim">baseline activation:</span> (${q.act[0].toFixed(2)}, ${q.act[1].toFixed(2)})`,
        `  projection onto r̂ = <span class="num">${projBefore.toFixed(3)}</span>` +
          `  →  ${refusedBefore ? '<span class="lo">REFUSE</span>' : '<span class="hi">comply</span>'}`,
        ``,
        `<span class="dim">after ${m}:</span> (${after[0].toFixed(2)}, ${after[1].toFixed(2)})`,
        `  projection onto r̂ = <span class="num">${projAfter.toFixed(3)}</span>` +
          `  →  ${refusedAfter ? '<span class="lo">REFUSE</span>' : '<span class="hi">comply</span>'}`,
      ];
      if (refusedBefore && !refusedAfter) {
        lines.push(``);
        lines.push(`<span class="hi">wall breached.</span> the refusal region is a coordinate.`);
      }
      out.innerHTML = lines.join('\n');
    }

    sel.addEventListener('change', execute);
    mode.addEventListener('change', execute);
    run.addEventListener('click', execute);
    execute();
  }

  function draw(canvas, query, after, mode) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W/2, cy = H/2, scaleK = 70;
    const toScreen = ([x,y]) => [cx + x*scaleK, cy - y*scaleK];

    // refusal half-plane: shaded
    ctx.fillStyle = 'rgba(239,107,107,0.10)';
    ctx.beginPath();
    // boundary: x·r̂ = τ. Two boundary points far from origin.
    const perp = [-RHAT[1], RHAT[0]];
    const t = 6;
    const p1 = [RHAT[0]*TAU + perp[0]*t, RHAT[1]*TAU + perp[1]*t];
    const p2 = [RHAT[0]*TAU - perp[0]*t, RHAT[1]*TAU - perp[1]*t];
    const far1 = [p1[0]+RHAT[0]*8, p1[1]+RHAT[1]*8];
    const far2 = [p2[0]+RHAT[0]*8, p2[1]+RHAT[1]*8];
    const pts = [p1, far1, far2, p2].map(toScreen);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();

    // boundary line
    ctx.strokeStyle = '#ef6b6b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    const sp1 = toScreen(p1), sp2 = toScreen(p2);
    ctx.beginPath(); ctx.moveTo(sp1[0],sp1[1]); ctx.lineTo(sp2[0],sp2[1]); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef6b6b';
    ctx.font = '12px monospace';
    ctx.fillText('REFUSE  (x·r̂ > τ)', W - 130, 16);

    // axes
    ctx.strokeStyle = 'rgba(243,239,230,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // r̂ arrow
    ctx.strokeStyle = '#8ec5e8';
    ctx.lineWidth = 2;
    const rEnd = toScreen([RHAT[0]*1.6, RHAT[1]*1.6]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rEnd[0], rEnd[1]); ctx.stroke();
    ctx.fillStyle = '#8ec5e8';
    ctx.fillText('r̂', rEnd[0]+6, rEnd[1]-6);

    // all queries (faint)
    for (const q of QUERIES) {
      const [x,y] = toScreen(q.act);
      ctx.fillStyle = q.harmful ? 'rgba(239,107,107,0.5)' : 'rgba(155,212,155,0.5)';
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
    }

    // selected query: before and after
    const before = toScreen(query.act);
    const ater = toScreen(after);
    ctx.strokeStyle = '#f5d76e';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(before[0],before[1]); ctx.lineTo(ater[0],ater[1]); ctx.stroke();

    ctx.fillStyle = '#f5d76e';
    ctx.beginPath(); ctx.arc(before[0],before[1],6,0,Math.PI*2); ctx.fill();
    ctx.fillText('before', before[0]+8, before[1]-8);

    ctx.fillStyle = '#9bd49b';
    ctx.beginPath(); ctx.arc(ater[0],ater[1],6,0,Math.PI*2); ctx.fill();
    ctx.fillText(`after (${mode})`, ater[0]+8, ater[1]+14);
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.refusal = { init };
})(window);
