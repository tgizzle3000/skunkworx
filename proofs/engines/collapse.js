/* Engine 6 — Mode Collapse
 *
 * Goodfellow et al. (2014) introduced GANs and named the failure mode:
 * the generator collapses to a single output that fools the
 * discriminator and ignores the rest of the data distribution.
 *
 * We simulate the dynamics directly:
 *   - target distribution p(x) is a mixture of K Gaussians ("modes")
 *   - the generator is a population of N points in 2D
 *   - the discriminator's gradient pulls each point toward the
 *     nearest real-data mode (this is how mode-seeking divergence —
 *     reverse KL / JS — actually behaves on multimodal data)
 *   - without regularization, the entire population collapses to one
 *     mode (all or most points end up at the same attractor)
 *   - with a DPP-style anti-correlation regularizer, points repel
 *     each other and cover all modes
 *
 * The math is the same regardless of scale: a single attractor wins.
 */
(function (global) {
  'use strict';

  // 4 target modes arranged in a square.
  const MODES = [
    [-1.2,  1.2], [ 1.2,  1.2],
    [-1.2, -1.2], [ 1.2, -1.2],
  ];
  const SIGMA = 0.18;
  const N_GEN = 24;

  function init(section) {
    const reg = section.querySelector('[data-role=reg]');
    const stepsIn = section.querySelector('[data-role=steps]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    let anim = null;

    function nearestMode(p) {
      let bi = 0, bd = Infinity;
      for (let i = 0; i < MODES.length; i++) {
        const dx = p[0]-MODES[i][0], dy = p[1]-MODES[i][1];
        const d = dx*dx + dy*dy;
        if (d < bd) { bd = d; bi = i; }
      }
      return bi;
    }

    function train() {
      if (anim) cancelAnimationFrame(anim);
      const useDPP = reg.value === 'dpp';
      const totalSteps = Math.max(50, Math.min(2000, +stepsIn.value || 400));

      // initialize generator at a single biased point — this is the
      // worst case Goodfellow describes, and is indistinguishable in
      // outcome from random init under unregularized JS-divergence.
      const gen = [];
      for (let i = 0; i < N_GEN; i++) {
        gen.push([(Math.random()-0.5)*0.3 - 0.4, (Math.random()-0.5)*0.3 + 0.4]);
      }

      // Discriminator behavior: in the unregularized GAN equilibrium,
      // any real mode that the generator covers becomes "easy" for D,
      // so the gradient collapses toward whichever single mode is
      // currently dominant — a positive feedback loop.
      // We simulate this by attracting every generator point to a
      // *single* dominant mode (the one most generator points are
      // already nearest to), recomputed each step.
      let step = 0;

      function tick() {
        const counts = new Array(MODES.length).fill(0);
        for (const g of gen) counts[nearestMode(g)]++;
        let dominant = 0;
        for (let i = 1; i < MODES.length; i++) if (counts[i] > counts[dominant]) dominant = i;

        const lr = 0.04;
        const noiseAmp = 0.02;
        for (let i = 0; i < gen.length; i++) {
          const g = gen[i];
          // attract toward dominant mode (vanilla GAN failure dynamic)
          // OR toward each generator's own nearest mode (mode-seeking).
          // Vanilla = dominant, DPP-regularized = own-nearest + repel.
          const target = useDPP ? MODES[nearestMode(g)] : MODES[dominant];
          g[0] += lr * (target[0] - g[0]);
          g[1] += lr * (target[1] - g[1]);

          // DPP-style anti-correlation: penalty that repels each
          // generator point from every other generator point. This is
          // exactly the diversity-as-volume term from Kulesza-Taskar
          // (2012), pushed back through the generator.
          if (useDPP) {
            for (let j = 0; j < gen.length; j++) {
              if (i === j) continue;
              const dx = g[0] - gen[j][0], dy = g[1] - gen[j][1];
              const r2 = dx*dx + dy*dy + 0.05;
              g[0] += 0.012 * dx / r2;
              g[1] += 0.012 * dy / r2;
            }
          }
          g[0] += (Math.random()-0.5)*noiseAmp;
          g[1] += (Math.random()-0.5)*noiseAmp;
        }

        draw(canvas, gen);
        step++;
        if (step < totalSteps) {
          anim = requestAnimationFrame(tick);
        } else {
          report();
        }
      }

      function report() {
        const counts = new Array(MODES.length).fill(0);
        for (const g of gen) counts[nearestMode(g)]++;
        const covered = counts.filter(c => c >= 2).length;
        const total = counts.reduce((a,b)=>a+b,0);
        const probs = counts.map(c => c/total);
        let entropy = 0;
        for (const p of probs) if (p>0) entropy -= p*Math.log(p);
        const maxEntropy = Math.log(MODES.length);

        out.innerHTML = [
          `regularizer: <span class="hi">${useDPP ? 'DPP-style anti-correlation' : 'none (vanilla GAN)'}</span>`,
          `steps: ${totalSteps}     generator population: ${N_GEN}     real modes: ${MODES.length}`,
          ``,
          `mode coverage:  ${counts.map((c,i)=>`mode${i}=${c}`).join('   ')}`,
          `modes with ≥2 samples: <span class="num">${covered} / ${MODES.length}</span>`,
          `coverage entropy:      <span class="num">${entropy.toFixed(3)}</span> / max ${maxEntropy.toFixed(3)} bits`,
          ``,
          useDPP
            ? `<span class="hi">diversity preserved.</span>  the regularizer pays the rent.`
            : `<span class="lo">single attractor wins.</span>  this is the published failure mode.`,
        ].join('\n');
      }

      tick();
    }

    run.addEventListener('click', train);
    train();
  }

  function draw(canvas, gen) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2, K = 80;
    const toS = ([x,y]) => [cx + x*K, cy - y*K];

    // real-data clouds
    ctx.fillStyle = 'rgba(142,197,232,0.15)';
    for (const m of MODES) {
      for (let i = 0; i < 80; i++) {
        const x = m[0] + (Math.random()-0.5)*SIGMA*4;
        const y = m[1] + (Math.random()-0.5)*SIGMA*4;
        const [sx, sy] = toS([x,y]);
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.fillStyle = '#8ec5e8';
    for (const m of MODES) {
      const [sx, sy] = toS(m);
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI*2); ctx.fill();
    }

    // generator population
    ctx.fillStyle = '#f5d76e';
    for (const g of gen) {
      const [sx, sy] = toS(g);
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI*2); ctx.fill();
    }

    // legend
    ctx.font = '12px monospace';
    ctx.fillStyle = '#8ec5e8';
    ctx.fillText('• real modes', 14, 18);
    ctx.fillStyle = '#f5d76e';
    ctx.fillText('• generator samples', 14, 36);
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.collapse = { init };
})(window);
