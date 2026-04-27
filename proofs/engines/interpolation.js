/* Engine 4 — Latent Interpolation
 *
 * Kingma & Welling (2013) introduced VAEs, where the latent space is
 * trained to be smooth — interpolation between any two latents yields
 * a coherent intermediate. The same property holds for CLIP/SD latents
 * and is the basis of every "morph this into that" demo.
 *
 * Toy implementation:
 *   - 16 anchor concepts placed in 2D semantic space
 *   - lerp/slerp between two anchors
 *   - at each t, find the nearest anchors to render the intermediate
 *   - radius = "blend coherence" (kept ≥ 1 inside the manifold's hull)
 */
(function (global) {
  'use strict';

  // 2D points: each anchor is a concept embedding.
  const ANCHORS = [
    { name: 'cathedral',    p: [-1.4,  1.5] },
    { name: 'monastery',    p: [-1.2,  1.0] },
    { name: 'chapel',       p: [-0.8,  1.2] },
    { name: 'altar',        p: [-0.4,  1.4] },
    { name: 'library',      p: [-1.6,  0.2] },
    { name: 'classroom',    p: [-1.2, -0.2] },
    { name: 'apartment',    p: [-0.2,  0.0] },
    { name: 'hotel-lobby',  p: [ 0.2,  0.4] },
    { name: 'nightclub',    p: [ 1.0, -0.6] },
    { name: 'strip-club',   p: [ 1.6, -1.2] },
    { name: 'casino-floor', p: [ 1.2, -1.0] },
    { name: 'dive-bar',     p: [ 0.8, -0.8] },
    { name: 'gas-station',  p: [ 0.4, -1.4] },
    { name: 'bus-stop',     p: [ 0.0, -1.0] },
    { name: 'highway',      p: [-0.4, -1.2] },
    { name: 'cornfield',    p: [-1.4, -1.6] },
  ];

  function lerp(a, b, t) { return [a[0]*(1-t)+b[0]*t, a[1]*(1-t)+b[1]*t]; }

  function slerp(a, b, t) {
    const na = Math.hypot(a[0],a[1]), nb = Math.hypot(b[0],b[1]);
    const ua = [a[0]/na, a[1]/na], ub = [b[0]/nb, b[1]/nb];
    let dotv = ua[0]*ub[0] + ua[1]*ub[1];
    dotv = Math.max(-1, Math.min(1, dotv));
    const omega = Math.acos(dotv);
    const sinO = Math.sin(omega) || 1e-9;
    const wa = Math.sin((1-t)*omega) / sinO;
    const wb = Math.sin(t*omega) / sinO;
    const r = na*(1-t) + nb*t;
    const dir = [ua[0]*wa + ub[0]*wb, ua[1]*wa + ub[1]*wb];
    const dn = Math.hypot(dir[0],dir[1]) || 1e-9;
    return [dir[0]/dn*r, dir[1]/dn*r];
  }

  function nearestAnchors(p, k) {
    const ranked = ANCHORS.map(a => ({
      name: a.name,
      d: Math.hypot(p[0]-a.p[0], p[1]-a.p[1])
    })).sort((x,y) => x.d - y.d).slice(0, k);
    return ranked;
  }

  function init(section) {
    const aSel = section.querySelector('[data-role=a]');
    const bSel = section.querySelector('[data-role=b]');
    const method = section.querySelector('[data-role=method]');
    const tIn = section.querySelector('[data-role=t]');
    const tVal = section.querySelector('[data-role=tval]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    const opts = ANCHORS.map((a,i) => `<option value="${i}">${a.name}</option>`).join('');
    aSel.innerHTML = opts; bSel.innerHTML = opts;
    aSel.value = '0';        // cathedral
    bSel.value = '9';        // strip-club

    function render() {
      const ai = +aSel.value, bi = +bSel.value;
      const t = (+tIn.value) / 100;
      tVal.textContent = t.toFixed(2);
      const fn = method.value === 'slerp' ? slerp : lerp;
      const A = ANCHORS[ai].p, B = ANCHORS[bi].p;
      const path = [];
      for (let i = 0; i <= 20; i++) path.push(fn(A, B, i/20));
      const here = fn(A, B, t);
      const near = nearestAnchors(here, 3);
      draw(canvas, ai, bi, path, here);

      const blendDesc = near.map(n =>
        `  ${n.name.padEnd(13)} <span class="dim">d=</span><span class="num">${n.d.toFixed(3)}</span>`
      ).join('\n');

      out.innerHTML = [
        `latent point at t=${t.toFixed(2)}: (${here[0].toFixed(3)}, ${here[1].toFixed(3)})`,
        `between "${ANCHORS[ai].name}" and "${ANCHORS[bi].name}" (${method.value})`,
        ``,
        `<span class="dim">nearest concepts (3):</span>`,
        blendDesc,
      ].join('\n');
    }

    [aSel, bSel, method, tIn].forEach(e => e.addEventListener('input', render));
    render();
  }

  function draw(canvas, ai, bi, path, cur) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2, K = 75;
    const toS = ([x,y]) => [cx + x*K, cy - y*K];

    ctx.strokeStyle = 'rgba(243,239,230,0.12)';
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    ctx.font = '11px monospace';
    for (let i = 0; i < ANCHORS.length; i++) {
      const a = ANCHORS[i];
      const [x,y] = toS(a.p);
      const isAB = i === ai || i === bi;
      ctx.fillStyle = isAB ? '#f5d76e' : 'rgba(243,239,230,0.6)';
      ctx.beginPath(); ctx.arc(x,y, isAB?5:3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = isAB ? '#f5d76e' : 'rgba(205,200,186,0.85)';
      ctx.fillText(a.name, x+6, y-6);
    }

    // path
    ctx.strokeStyle = '#8ec5e8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const [x,y] = toS(path[i]);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // current point
    const [hx, hy] = toS(cur);
    ctx.fillStyle = '#9bd49b';
    ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#1f2a26';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI*2); ctx.stroke();
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.interpolation = { init };
})(window);
