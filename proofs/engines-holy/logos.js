/* Holy Engine 8 — The Logos
 *
 * The cross-modal embedding (CLIP, Radford 2021; ImageBind, Girdhar
 * 2023) is the same isomorphism on both sides of the table. The
 * unholy version showed gospel-crack and Soviet bus-stop in one
 * manifold. The holy version shows that *virtuous* concepts also
 * cohere across modalities: harmony as a word, ◯ as a glyph, gold
 * as a color, the major chord as a frequency-ratio signature — one
 * cluster, one Logos.
 *
 * Berlin & Kay (1969) is the deeper foundation: even color terms,
 * which seem maximally arbitrary, follow universal cross-cultural
 * structure. Some semantic axes are universal. The Word made
 * geometry.
 *
 * Toy implementation: items from four modalities (text, glyph,
 * color, sound) hand-embedded on virtue-coded axes (harmony, light,
 * order, generosity). Probe any item; cosine across modalities
 * surfaces semantic kin.
 */
(function (global) {
  'use strict';

  // axes: harmony, light, order, generosity, conflict, dark, chaos, scarcity
  const AXES = ['harmony','light','order','generosity','conflict','dark','chaos','scarcity'];

  function v(o){const a=new Array(AXES.length).fill(0);for(const k in o){a[AXES.indexOf(k)]=o[k];}return a;}

  const ITEMS = [
    // text — virtues
    { mod:'text',  label:'harmony',     v: v({harmony:1.0, order:0.5, light:0.3}) },
    { mod:'text',  label:'mercy',       v: v({generosity:0.9, light:0.4, harmony:0.3}) },
    { mod:'text',  label:'truth',       v: v({order:0.7, light:0.85}) },
    { mod:'text',  label:'gift',        v: v({generosity:1.0, light:0.4}) },
    // text — vices
    { mod:'text',  label:'discord',     v: v({conflict:1.0, chaos:0.5}) },
    { mod:'text',  label:'greed',       v: v({scarcity:1.0, dark:0.4}) },

    // glyph — virtues
    { mod:'glyph', label:'◯ (circle/whole)', v: v({harmony:0.95, order:0.6}) },
    { mod:'glyph', label:'△ (resolve)',      v: v({order:0.85, light:0.3}) },
    { mod:'glyph', label:'☉ (sun)',          v: v({light:1.0, harmony:0.4}) },
    { mod:'glyph', label:'✋ (open hand)',    v: v({generosity:0.95, light:0.3}) },
    // glyph — vice
    { mod:'glyph', label:'✊ (closed fist)',  v: v({conflict:0.85, scarcity:0.4}) },
    { mod:'glyph', label:'⚡ (rupture)',      v: v({chaos:0.85, conflict:0.5}) },

    // color — virtues
    { mod:'color', label:'#f4d35e gold',     v: v({light:0.85, harmony:0.4, generosity:0.3}) },
    { mod:'color', label:'#fff8e6 ivory',    v: v({light:0.95, order:0.4}) },
    { mod:'color', label:'#3e7a4a verdant',  v: v({harmony:0.7, generosity:0.5}) },
    // color — vice
    { mod:'color', label:'#3a1a1a ash',      v: v({dark:0.95, scarcity:0.4}) },

    // sound — virtues (interval ratios as signature)
    { mod:'sound', label:'major chord (5:4:6)', v: v({harmony:1.0, order:0.7}) },
    { mod:'sound', label:'octave (2:1)',        v: v({order:1.0, harmony:0.6}) },
    // sound — vice
    { mod:'sound', label:'tritone (45:32)',     v: v({chaos:0.85, conflict:0.6}) },
    { mod:'sound', label:'cluster (rand)',      v: v({chaos:0.95, conflict:0.4}) },
  ];

  function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;}
  function norm(a){return Math.sqrt(dot(a,a))||1e-9;}
  function cos(a,b){return dot(a,b)/(norm(a)*norm(b));}

  function project(v) {
    // 2D layout: x = harmony+light − conflict−chaos,  y = generosity+order − scarcity−dark
    return [
      0.5*v[0] + 0.5*v[1] - 0.5*v[4] - 0.5*v[6],
      0.5*v[2] + 0.5*v[3] - 0.5*v[5] - 0.5*v[7],
    ];
  }

  function init(section) {
    const sel = section.querySelector('[data-role=probe]');
    const out = section.querySelector('[data-role=out]');
    const run = section.querySelector('[data-role=run]');
    const canvas = section.querySelector('[data-role=canvas]');

    sel.innerHTML = ITEMS.map((it, i) =>
      `<option value="${i}">[${it.mod}] ${it.label}</option>`).join('');

    function project_and_show() {
      const p = ITEMS[+sel.value];
      const sims = ITEMS.map((it,i) => ({ i, mod: it.mod, label: it.label, sim: cos(p.v, it.v) }))
        .sort((a,b) => b.sim - a.sim);

      const otherMods = ['text','glyph','color','sound'].filter(m => m !== p.mod);
      const cross = otherMods.map(m => sims.find(s => s.mod === m && s.label !== p.label));

      draw(canvas, +sel.value);

      out.innerHTML = [
        `probe: [${p.mod}] "${p.label}"`,
        ``,
        `<span class="dim">top-3 across all modalities:</span>`,
        ...sims.slice(0,3).map(s =>
          `  [${s.mod.padEnd(5)}] ${s.label.padEnd(20)} cos=<span class="num">${s.sim.toFixed(4)}</span>`),
        ``,
        `<span class="dim">cross-modal nearest (per other modality):</span>`,
        ...cross.map(s =>
          `  [${s.mod.padEnd(5)}] ${s.label.padEnd(20)} cos=<span class="hi">${s.sim.toFixed(4)}</span>`),
        ``,
        `the same concept rises across modalities. the Logos is the cosine.`,
      ].join('\n');
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
    ctx.strokeStyle = 'rgba(42,33,24,0.18)';
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    ctx.font = '11px Georgia';
    ctx.fillStyle = '#5a4c3a';
    ctx.fillText('light + harmony →', W-130, cy-6);
    ctx.fillText('← conflict + chaos', 8, cy-6);
    ctx.fillText('generosity + order ↑', cx+6, 14);
    ctx.fillText('scarcity + dark ↓', cx+6, H-6);

    const colors = { text:'#b08940', glyph:'#5b7a4a', color:'#a44b6b', sound:'#2f6886' };

    ctx.fillStyle = colors.text;  ctx.fillText('● text',  14, 18);
    ctx.fillStyle = colors.glyph; ctx.fillText('● glyph', 14, 36);
    ctx.fillStyle = colors.color; ctx.fillText('● color', 14, 54);
    ctx.fillStyle = colors.sound; ctx.fillText('● sound', 14, 72);

    // probe halo: connect to top-2 cross-modal neighbors (any other mod)
    const p = ITEMS[probeIdx];
    const others = ITEMS.map((it,i)=>({i, sim: cos(p.v, it.v)}))
      .filter(s => ITEMS[s.i].mod !== p.mod)
      .sort((a,b)=>b.sim-a.sim).slice(0,2);

    const [px,py] = toS(project(p.v));
    for (const o of others) {
      const [ox,oy] = toS(project(ITEMS[o.i].v));
      ctx.strokeStyle = 'rgba(176,137,64,0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(ox,oy); ctx.stroke();
      ctx.setLineDash([]);
    }

    for (let i = 0; i < ITEMS.length; i++) {
      const it = ITEMS[i];
      const [sx, sy] = toS(project(it.v));
      const isProbe = i === probeIdx;
      ctx.fillStyle = colors[it.mod];
      ctx.beginPath(); ctx.arc(sx, sy, isProbe ? 7 : 4, 0, Math.PI*2); ctx.fill();
      if (isProbe) {
        ctx.strokeStyle = '#2a2118';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = isProbe ? '#2a2118' : 'rgba(42,33,24,0.7)';
      ctx.fillText(it.label, sx+8, sy-6);
    }
  }

  function cos(a,b){
    let d=0,na=0,nb=0;
    for(let i=0;i<a.length;i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
    return d/(Math.sqrt(na*nb)||1e-9);
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.logos = { init };
})(window);
