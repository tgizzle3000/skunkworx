/* Holy Engine 4 — The Geodesic Mean (Karcher / Fréchet)
 *
 * Aristotle's mean is computable. Karcher (1977) gave the iterative
 * algorithm: starting from any point, repeatedly project the average
 * tangent vector to all data points back onto the manifold. On
 * Euclidean space this collapses to the arithmetic mean; on the
 * sphere it recovers the spherical centroid.
 *
 * Toy implementation: a spherical (S¹) embedding for moral positions
 * (rigorist ↔ permissive, etc.). Iteratively walk the gradient of
 * Fréchet variance until convergence — the algorithmic Aristotelian
 * middle path. Visualize the trajectory toward the mean.
 *
 * Inverse of Engine 4 (interpolation): instead of moving between two
 * points, find the equilibrium point relative to many.
 */
(function (global) {
  'use strict';

  const SETS = {
    'four positions': [
      { name: 'rigorist',     p: angleTo(2.0) },
      { name: 'pragmatist',   p: angleTo(0.6) },
      { name: 'humanist',     p: angleTo(-0.4) },
      { name: 'permissive',   p: angleTo(-1.5) },
    ],
    'tribal cluster': [
      { name: 'left-1', p: angleTo(2.4) },
      { name: 'left-2', p: angleTo(2.7) },
      { name: 'right-1',p: angleTo(-2.2) },
      { name: 'right-2',p: angleTo(-2.5) },
      { name: 'lone moderate', p: angleTo(0.0) },
    ],
    'consensus': [
      { name: 'a', p: angleTo(0.2) },
      { name: 'b', p: angleTo(0.4) },
      { name: 'c', p: angleTo(-0.1) },
      { name: 'd', p: angleTo(0.3) },
      { name: 'e', p: angleTo(-0.3) },
    ],
  };

  function angleTo(theta) { return [Math.cos(theta), Math.sin(theta)]; }
  function angleOf(p) { return Math.atan2(p[1], p[0]); }
  function unit(v) { const n = Math.hypot(v[0],v[1])||1e-9; return [v[0]/n, v[1]/n]; }

  // Karcher mean on S¹: iterate
  //   t_i = log_p(x_i)        (tangent at p)
  //   p   ← exp_p( η · mean(t_i) )
  // where for unit vectors, log_p(x) = (x - p<x,p>)·θ/||·||  and  θ = arccos(p·x).
  function logMap(p, x) {
    const cosTheta = Math.max(-1, Math.min(1, p[0]*x[0] + p[1]*x[1]));
    const theta = Math.acos(cosTheta);
    if (theta < 1e-7) return [0, 0];
    const proj = [x[0] - cosTheta*p[0], x[1] - cosTheta*p[1]];
    const n = Math.hypot(proj[0], proj[1]) || 1e-9;
    return [proj[0]/n*theta, proj[1]/n*theta];
  }
  function expMap(p, t) {
    const tn = Math.hypot(t[0], t[1]);
    if (tn < 1e-7) return p.slice();
    const cT = Math.cos(tn), sT = Math.sin(tn);
    return unit([p[0]*cT + t[0]/tn*sT, p[1]*cT + t[1]/tn*sT]);
  }

  function frechetVar(p, points) {
    let s = 0;
    for (const x of points) {
      const cosTheta = Math.max(-1, Math.min(1, p[0]*x.p[0] + p[1]*x.p[1]));
      const theta = Math.acos(cosTheta);
      s += theta * theta;
    }
    return s / points.length;
  }

  function karcher(points, iters, eta) {
    let p = points[0].p.slice();
    const trail = [p.slice()];
    for (let k = 0; k < iters; k++) {
      const tangents = points.map(x => logMap(p, x.p));
      const mean = [0, 0];
      for (const t of tangents) { mean[0] += t[0]; mean[1] += t[1]; }
      mean[0] /= points.length; mean[1] /= points.length;
      p = expMap(p, [mean[0]*eta, mean[1]*eta]);
      trail.push(p.slice());
    }
    return { p, trail };
  }

  function init(section) {
    const sel = section.querySelector('[data-role=set]');
    const itersIn = section.querySelector('[data-role=iters]');
    const out = section.querySelector('[data-role=out]');
    const run = section.querySelector('[data-role=run]');
    const canvas = section.querySelector('[data-role=canvas]');

    sel.innerHTML = Object.keys(SETS).map(k => `<option value="${k}">${k}</option>`).join('');

    function execute() {
      const points = SETS[sel.value];
      const iters = Math.max(1, Math.min(200, +itersIn.value || 40));
      const result = karcher(points, iters, 0.6);

      const v0 = frechetVar(points[0].p, points);
      const v1 = frechetVar(result.p, points);
      const angle = angleOf(result.p);

      draw(canvas, points, result);

      out.innerHTML = [
        `n = ${points.length} positions on S¹    iterations = ${iters}`,
        ``,
        `<span class="dim">geodesic mean angle:</span>  θ = <span class="num">${angle.toFixed(4)}</span> rad`,
        `<span class="dim">Fréchet variance start:</span> ${v0.toFixed(5)}`,
        `<span class="dim">Fréchet variance end:</span>   <span class="hi">${v1.toFixed(5)}</span>`,
        ``,
        v1 < v0 - 1e-6
          ? `<span class="hi">converged.</span>  the middle is computable. Karcher (1977).`
          : `<span class="dim">already at minimum (consensus case).</span>`,
      ].join('\n');
    }

    sel.addEventListener('change', execute);
    run.addEventListener('click', execute);
    execute();
  }

  function draw(canvas, points, result) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 50;

    // unit circle
    ctx.strokeStyle = 'rgba(42,33,24,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();

    // points
    ctx.font = '12px Georgia';
    for (const x of points) {
      const sx = cx + x.p[0]*R, sy = cy - x.p[1]*R;
      ctx.fillStyle = '#2f6886';
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2a2118';
      ctx.fillText(x.name, sx + 8, sy + 4);
    }

    // trail
    ctx.strokeStyle = '#b08940';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < result.trail.length; i++) {
      const t = result.trail[i];
      const sx = cx + t[0]*R, sy = cy - t[1]*R;
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // mean point
    const mx = cx + result.p[0]*R, my = cy - result.p[1]*R;
    ctx.fillStyle = '#5b7a4a';
    ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fffaee';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#5b7a4a';
    ctx.fillText('μ (geodesic mean)', mx + 12, my - 6);
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.geodesic = { init };
})(window);
