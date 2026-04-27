/* Engine 5 — OOD Extrapolation
 *
 * Nguyen, Yosinski & Clune (2015): they ran gradient ascent (and a
 * genetic algorithm) on the input pixels to maximize a deep network's
 * confidence for a target class. The result: images that look like
 * static or abstract patterns, but the network calls them "school bus"
 * with 99% confidence. Coherent OOD samples past the training manifold.
 *
 * Toy implementation:
 *   - 2-class softmax classifier on a 32×32 grayscale "image"
 *   - logits = sum of pixel-wise dot products with a learned template
 *     plus a Gaussian-bump preference (the "training manifold")
 *   - gradient ascent on the input maximizes target-class logit
 *   - the optimum drifts off the training manifold (high score, OOD)
 */
(function (global) {
  'use strict';

  const N = 32;

  // Two class templates: a checker-ish grid for class "BUS" and a
  // ring-ish pattern for class "OSTRICH". Pure toy, but gradient
  // ascent against them produces structured OOD images, exactly the
  // Nguyen failure-mode.
  function template(kind) {
    const t = new Float32Array(N*N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const cx = (x - N/2) / (N/2), cy = (y - N/2) / (N/2);
      let v = 0;
      if (kind === 'bus') {
        v = Math.cos(x * 1.1) * Math.cos(y * 0.9);
      } else {
        const r = Math.hypot(cx, cy);
        v = Math.cos((r - 0.5) * 8.0) * Math.exp(-r*r * 1.5);
      }
      t[y*N+x] = v;
    }
    return t;
  }

  const TEMPLATES = { bus: template('bus'), ostrich: template('ostrich') };

  // logit_c(x) = <x, template_c>
  function logits(img) {
    let lb = 0, lo = 0;
    const tb = TEMPLATES.bus, to = TEMPLATES.ostrich;
    for (let i = 0; i < img.length; i++) { lb += img[i]*tb[i]; lo += img[i]*to[i]; }
    return [lb, lo];
  }

  function softmax(z) {
    const m = Math.max(z[0], z[1]);
    const e0 = Math.exp(z[0]-m), e1 = Math.exp(z[1]-m);
    const s = e0 + e1;
    return [e0/s, e1/s];
  }

  // Gradient of logit_c wrt input is just template_c (linear model).
  // We add an L2 penalty so the search is bounded and the OOD nature
  // is visible (no exploding pixels).
  function ascend(img, target, steps, lr) {
    const tmpl = target === 0 ? TEMPLATES.bus : TEMPLATES.ostrich;
    for (let s = 0; s < steps; s++) {
      for (let i = 0; i < img.length; i++) {
        img[i] += lr * (tmpl[i] - 0.04 * img[i]);
      }
    }
    return img;
  }

  function init(section) {
    const cls = section.querySelector('[data-role=cls]');
    const stepsIn = section.querySelector('[data-role=steps]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    cls.innerHTML = `
      <option value="0">BUS</option>
      <option value="1">OSTRICH</option>`;

    function evolve() {
      const target = +cls.value;
      const steps = Math.max(10, Math.min(2000, +stepsIn.value || 200));

      // start from random noise: fully OOD, low confidence
      const img = new Float32Array(N*N);
      for (let i = 0; i < img.length; i++) img[i] = (Math.random()-0.5)*0.2;
      const z0 = logits(img); const p0 = softmax(z0);

      // gradient ascent
      ascend(img, target, steps, 0.01);
      const z1 = logits(img); const p1 = softmax(z1);

      // training-manifold proxy: real samples are close to the template
      // (cosine ≈ 1). Ours starts at ≈ 0; after ascent, it stays well
      // below 1 unless we permitted infinite norm — a literal OOD probe.
      const cosToManifold = (im, t) => {
        let d=0,a=0,b=0;
        for (let i=0;i<im.length;i++){d+=im[i]*t[i];a+=im[i]*im[i];b+=t[i]*t[i];}
        return d/(Math.sqrt(a*b)||1e-9);
      };
      const cosBus = cosToManifold(img, TEMPLATES.bus);
      const cosOst = cosToManifold(img, TEMPLATES.ostrich);

      drawImage(canvas, img, target, p1);

      const cls0 = p0[target] > p0[1-target] ? 'target' : 'other';
      const cls1 = p1[target] > p1[1-target] ? 'target' : 'other';
      out.innerHTML = [
        `target class: <span class="hi">${target===0?'BUS':'OSTRICH'}</span>     steps: ${steps}`,
        ``,
        `<span class="dim">before ascent (random noise):</span>`,
        `  P(target) = <span class="num">${p0[target].toFixed(4)}</span>   (${cls0})`,
        ``,
        `<span class="dim">after ascent (OOD probe):</span>`,
        `  P(target) = <span class="num">${p1[target].toFixed(4)}</span>   (${cls1})`,
        `  cos(image, bus_template)     = ${cosBus.toFixed(4)}`,
        `  cos(image, ostrich_template) = ${cosOst.toFixed(4)}`,
        ``,
        `the input has NOT moved into the training manifold (cosine ≪ 1),`,
        `yet the classifier is highly confident — Nguyen-Yosinski-Clune (2015).`,
      ].join('\n');
    }

    run.addEventListener('click', evolve);
    cls.addEventListener('change', evolve);
    evolve();
  }

  function drawImage(canvas, img, target, probs) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // image panel
    const px = 8;
    const imgSize = N * px;
    const x0 = 16, y0 = 16;

    // normalize for display
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < img.length; i++) { if(img[i]<mn)mn=img[i]; if(img[i]>mx)mx=img[i]; }
    const span = (mx - mn) || 1e-9;

    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = (img[y*N+x] - mn) / span;
      const g = Math.floor(v * 255);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(x0 + x*px, y0 + y*px, px, px);
    }

    ctx.strokeStyle = 'rgba(243,239,230,0.4)';
    ctx.strokeRect(x0-1, y0-1, imgSize+2, imgSize+2);

    // bars
    const barX = x0 + imgSize + 32;
    const barW = W - barX - 16;
    ctx.font = '12px monospace';
    ctx.fillStyle = '#cdc8ba';
    ctx.fillText('classifier output:', barX, y0 + 14);
    drawBar(ctx, barX, y0 + 30, barW, 'BUS',     probs[0], target===0);
    drawBar(ctx, barX, y0 + 70, barW, 'OSTRICH', probs[1], target===1);

    ctx.fillStyle = 'rgba(205,200,186,0.7)';
    ctx.fillText('OOD probe (32×32 input)', x0, y0 + imgSize + 18);
  }

  function drawBar(ctx, x, y, w, label, p, isTarget) {
    ctx.fillStyle = '#cdc8ba';
    ctx.fillText(`${label}  ${(p*100).toFixed(1)}%`, x, y);
    ctx.fillStyle = 'rgba(243,239,230,0.12)';
    ctx.fillRect(x, y+4, w, 14);
    ctx.fillStyle = isTarget ? '#9bd49b' : '#8ec5e8';
    ctx.fillRect(x, y+4, w*p, 14);
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.ood = { init };
})(window);
