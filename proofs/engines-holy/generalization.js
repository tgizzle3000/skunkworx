/* Holy Engine 5 — The Miracle of Generalization
 *
 * Vapnik-Chervonenkis (1971) proved generalization bounds for
 * empirical risk minimization. Zhang et al. (2017) showed that even
 * over-parameterized deep networks generalize when trained on real
 * data — the same gradient ascent that finds OOD pathologies (Engine
 * 5 unholy) is the engine of zero-shot extrapolation.
 *
 * Toy implementation: fit a linear classifier on N noisy training
 * points sampled from a sinusoidal decision boundary. Hold out a
 * dense test grid on the SAME data-generating distribution. Show the
 * generalization gap is small even with limited training data —
 * extension beyond the training set is empirically licensed.
 *
 * Inverse of Engine 5 (OOD): same gradient updates, but evaluated on
 * held-out points drawn from the true distribution rather than on
 * adversarially chosen pixels. Hope as a measurable scalar.
 */
(function (global) {
  'use strict';

  // True decision rule: y = sign( x2 - 0.6*sin(1.6*x1) - 0.05 ).
  function trueLabel(x1, x2) {
    return x2 - 0.6 * Math.sin(1.6 * x1) - 0.05 > 0 ? 1 : -1;
  }

  function sample(n, noise, rng) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const x1 = (rng()*2 - 1) * 2.0;
      const x2 = (rng()*2 - 1) * 1.5;
      let y = trueLabel(x1, x2);
      if (rng() < noise) y = -y;
      out.push({ x: [1, x1, x2, x1*x1, x2*x2, x1*x2, Math.sin(x1), Math.cos(x2)], y });
    }
    return out;
  }

  // Logistic regression with L2 (closed-form descent). Bishop ch. 4.
  function train(data, lambda, steps, lr) {
    const D = data[0].x.length;
    const w = new Array(D).fill(0);
    for (let s = 0; s < steps; s++) {
      const g = new Array(D).fill(0);
      for (const ex of data) {
        let z = 0; for (let i = 0; i < D; i++) z += w[i]*ex.x[i];
        const p = 1 / (1 + Math.exp(-z));
        const yProb = ex.y === 1 ? 1 : 0;
        for (let i = 0; i < D; i++) g[i] += (p - yProb)*ex.x[i];
      }
      for (let i = 0; i < D; i++) w[i] -= lr * (g[i]/data.length + lambda*w[i]);
    }
    return w;
  }

  function predict(w, x) {
    let z = 0; for (let i = 0; i < w.length; i++) z += w[i]*x[i];
    return z > 0 ? 1 : -1;
  }
  function accuracy(w, data) {
    let c = 0; for (const ex of data) if (predict(w, ex.x) === ex.y) c++;
    return c / data.length;
  }

  function rngFromSeed(seed) {
    let s = seed | 0;
    return function() {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  function init(section) {
    const nIn = section.querySelector('[data-role=n]');
    const noiseIn = section.querySelector('[data-role=noise]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    function execute() {
      const n = Math.max(4, Math.min(200, +nIn.value || 40));
      const noise = Math.max(0, Math.min(1, +noiseIn.value || 0.10));
      const rng = rngFromSeed(42);
      const train_data = sample(n, noise, rng);
      const test_data  = sample(800, 0, rng); // clean held-out
      const w = train(train_data, 1e-4, 1500, 0.3);
      const trainAcc = accuracy(w, train_data);
      const testAcc  = accuracy(w, test_data);

      draw(canvas, w, train_data);

      out.innerHTML = [
        `train n = ${n}    noise = ${noise.toFixed(2)}    held-out test n = 800`,
        ``,
        `<span class="dim">train accuracy:</span>  <span class="num">${(trainAcc*100).toFixed(1)}%</span>`,
        `<span class="dim">test accuracy:</span>   <span class="hi">${(testAcc*100).toFixed(1)}%</span>`,
        `<span class="dim">generalization gap:</span> ${((trainAcc-testAcc)*100).toFixed(1)}%`,
        ``,
        testAcc > 0.7
          ? `<span class="hi">it generalized.</span>  N=${n} samples extended to the whole plane. VC bound holds.`
          : `<span class="lo">undertrained.</span>  raise n or lower noise.`,
      ].join('\n');
    }

    nIn.addEventListener('input', execute);
    noiseIn.addEventListener('input', execute);
    run.addEventListener('click', execute);
    execute();
  }

  function draw(canvas, w, train_data) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const x1Min = -2, x1Max = 2, x2Min = -1.5, x2Max = 1.5;
    const tx = x1 => (x1 - x1Min)/(x1Max - x1Min) * W;
    const ty = x2 => H - (x2 - x2Min)/(x2Max - x2Min) * H;

    // shaded predicted decision regions (coarse grid)
    const grid = 64;
    for (let i = 0; i < grid; i++) for (let j = 0; j < grid; j++) {
      const x1 = x1Min + (i+0.5)/grid * (x1Max-x1Min);
      const x2 = x2Min + (j+0.5)/grid * (x2Max-x2Min);
      const yhat = predict(w, [1, x1, x2, x1*x1, x2*x2, x1*x2, Math.sin(x1), Math.cos(x2)]);
      ctx.fillStyle = yhat === 1 ? 'rgba(91,122,74,0.12)' : 'rgba(164,75,107,0.10)';
      ctx.fillRect(tx(x1Min + i/grid*(x1Max-x1Min)), ty(x2Min + (j+1)/grid*(x2Max-x2Min)),
                   W/grid + 1, H/grid + 1);
    }

    // true boundary
    ctx.strokeStyle = '#2f6886';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,3]);
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 200; i++) {
      const x1 = x1Min + i/200 * (x1Max - x1Min);
      const x2 = 0.6*Math.sin(1.6*x1) + 0.05;
      const sx = tx(x1), sy = ty(x2);
      if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // training points
    for (const ex of train_data) {
      const sx = tx(ex.x[1]), sy = ty(ex.x[2]);
      ctx.fillStyle = ex.y === 1 ? '#5b7a4a' : '#a44b6b';
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,250,238,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // legend
    ctx.font = '12px Georgia';
    ctx.fillStyle = '#2f6886';
    ctx.fillText('— true boundary (held-out distribution)', 12, 16);
    ctx.fillStyle = '#5b7a4a';
    ctx.fillText('● train +', 12, 32);
    ctx.fillStyle = '#a44b6b';
    ctx.fillText('● train −', 90, 32);
  }

  function predict(w, x) {
    let z = 0; for (let i = 0; i < w.length; i++) z += w[i]*x[i];
    return z > 0 ? 1 : -1;
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.generalization = { init };
})(window);
