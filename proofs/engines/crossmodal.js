/* Engine 8 — Cross-Modal Isomorphism
 *
 * Radford et al. (2021), CLIP: trained image and text encoders to map
 * into the same embedding space via contrastive loss; cosine
 * similarity then works *across modalities*.
 * Girdhar et al. (2023), ImageBind: extended to six modalities
 * (image, text, audio, depth, thermal, IMU) sharing a single space.
 *
 * Toy implementation: items from three "modalities" (text, glyph,
 * color) are hand-embedded into a shared 4D semantic space spanned by
 * (heat, sacred, decay, machine). Cosine similarity on this shared
 * space lets us probe across modalities — exactly the operation
 * CLIP/ImageBind expose at scale.
 */
(function (global) {
  'use strict';

  // axes: heat, sacred, decay, machine
  const ITEMS = [
    // text
    { mod: 'text',  label: 'fire',         v: [ 0.95,  0.10,  0.10,  0.00] },
    { mod: 'text',  label: 'ice',          v: [-0.95,  0.05,  0.10,  0.00] },
    { mod: 'text',  label: 'cathedral',    v: [ 0.05,  0.95,  0.20,  0.00] },
    { mod: 'text',  label: 'rust',         v: [-0.10,  0.10,  0.95,  0.20] },
    { mod: 'text',  label: 'circuit',      v: [ 0.05,  0.05,  0.10,  0.95] },
    { mod: 'text',  label: 'gospel',       v: [ 0.10,  0.90,  0.10,  0.00] },
    // glyph
    { mod: 'glyph', label: '🔥',           v: [ 0.95,  0.05,  0.10,  0.00] },
    { mod: 'glyph', label: '❄️',           v: [-0.95,  0.05,  0.05,  0.00] },
    { mod: 'glyph', label: '⛪',           v: [ 0.05,  0.95,  0.15,  0.00] },
    { mod: 'glyph', label: '🦴',           v: [-0.05,  0.10,  0.90,  0.00] },
    { mod: 'glyph', label: '🤖',           v: [ 0.05,  0.00,  0.10,  0.95] },
    { mod: 'glyph', label: '✝️',           v: [ 0.05,  0.95,  0.10,  0.00] },
    // color (HSV-ish summarized into the shared semantic space)
    { mod: 'color', label: '#ff5a30 red',  v: [ 0.90,  0.05,  0.10,  0.00] },
    { mod: 'color', label: '#5fa8ff blue', v: [-0.85,  0.10,  0.05,  0.10] },
    { mod: 'color', label: '#f4d35e gold', v: [ 0.30,  0.85,  0.10,  0.00] },
    { mod: 'color', label: '#7a5b3c brown',v: [-0.10,  0.10,  0.90,  0.10] },
    { mod: 'color', label: '#a0a0a0 grey', v: [ 0.00,  0.05,  0.30,  0.90] },
    { mod: 'color', label: '#fff8e6 ivory',v: [ 0.10,  0.85,  0.10,  0.00] },
  ];

  function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;}
  function norm(a){return Math.sqrt(dot(a,a))||1e-9;}
  function cos(a,b){return dot(a,b)/(norm(a)*norm(b));}

  // Project a 4D vector to 2D via fixed PCA-like axes for visualization.
  // The two display axes are linear combinations of the semantic axes
  // chosen so the layout reads cleanly.
  function project(v) {
    return [
      0.7*v[0] - 0.4*v[3],            // x: heat ↔ machine
      0.6*v[1] - 0.6*v[2] - 0.1*v[3], // y: sacred ↔ decay
    ];
  }

  function init(section) {
    const sel = section.querySelector('[data-role=probe]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    sel.innerHTML = ITEMS.map((it,i) =>
      `<option value="${i}">[${it.mod}] ${it.label}</option>`
    ).join('');
    sel.value = '0';

    function project_and_show() {
      const probe = ITEMS[+sel.value];

      // Cosine similarities of every item to the probe.
      const sims = ITEMS.map((it, i) => ({
        i, mod: it.mod, label: it.label,
        sim: cos(probe.v, it.v),
      })).sort((a,b)=>b.sim-a.sim);

      // Top neighbors *from each other modality*.
      const otherMods = ['text','glyph','color'].filter(m => m !== probe.mod);
      const crossNeighbors = otherMods.map(m =>
        sims.find(s => s.mod === m && s.label !== probe.label)
      );

      draw(canvas, +sel.value);

      const lines = [
        `probe: [${probe.mod}] "${probe.label}"`,
        ``,
        `<span class="dim">top-3 overall (any modality):</span>`,
        ...sims.slice(0,3).map(s =>
          `  [${s.mod.padEnd(5)}] ${s.label.padEnd(16)} cos=<span class="num">${s.sim.toFixed(4)}</span>`),
        ``,
        `<span class="dim">cross-modal nearest (per other modality):</span>`,
        ...crossNeighbors.map(s =>
          `  [${s.mod.padEnd(5)}] ${s.label.padEnd(16)} cos=<span class="hi">${s.sim.toFixed(4)}</span>`),
        ``,
        `same concept lives in one shared manifold.`,
        `the chef-flex is the cosine. CLIP / ImageBind.`,
      ];
      out.innerHTML = lines.join('\n');
    }

    sel.addEventListener('change', project_and_show);
    run.addEventListener('click', project_and_show);
    project_and_show();
  }

  function draw(canvas, probeIdx) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2, K = 130;
    const toS = ([x,y]) => [cx + x*K, cy - y*K];

    // axes
    ctx.strokeStyle = 'rgba(243,239,230,0.18)';
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    ctx.font = '11px monospace';
    ctx.fillStyle = '#cdc8ba';
    ctx.fillText('heat →', W-60, cy-6);
    ctx.fillText('← machine', 8, cy-6);
    ctx.fillText('sacred ↑', cx+6, 14);
    ctx.fillText('decay ↓', cx+6, H-6);

    const colors = { text: '#f5d76e', glyph: '#9bd49b', color: '#f0a0b8' };

    // legend
    ctx.fillStyle = colors.text;  ctx.fillText('● text',  14, 18);
    ctx.fillStyle = colors.glyph; ctx.fillText('● glyph', 14, 36);
    ctx.fillStyle = colors.color; ctx.fillText('● color', 14, 54);

    // probe halo: connect probe to its top-2 cross-modal neighbors
    const probe = ITEMS[probeIdx];
    const others = ITEMS.map((it, i) => ({ i, sim: dotcos(probe.v, it.v) }))
      .filter(s => ITEMS[s.i].mod !== probe.mod)
      .sort((a,b)=>b.sim-a.sim).slice(0,2);

    const [px, py] = toS(project(probe.v));
    for (const o of others) {
      const [ox, oy] = toS(project(ITEMS[o.i].v));
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(ox,oy); ctx.stroke();
      ctx.setLineDash([]);
    }

    // points + labels
    for (let i = 0; i < ITEMS.length; i++) {
      const it = ITEMS[i];
      const [sx, sy] = toS(project(it.v));
      const isProbe = i === probeIdx;
      ctx.fillStyle = colors[it.mod];
      ctx.beginPath(); ctx.arc(sx, sy, isProbe ? 7 : 4, 0, Math.PI*2); ctx.fill();
      if (isProbe) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = isProbe ? '#fff' : 'rgba(205,200,186,0.85)';
      ctx.fillText(it.label, sx+8, sy-6);
    }
  }

  function dotcos(a,b){
    let d=0,na=0,nb=0;
    for(let i=0;i<a.length;i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
    return d/(Math.sqrt(na*nb)||1e-9);
  }

  global.ProofEngines = global.ProofEngines || {};
  global.ProofEngines.crossmodal = { init };
})(window);
