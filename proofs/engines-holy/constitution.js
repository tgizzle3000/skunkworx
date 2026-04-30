/* Holy Engine 3 — Constitutional Steering
 *
 * Bai et al. (2022) introduced Constitutional AI: train a model to
 * critique its own outputs against a written constitution, then
 * fine-tune on those self-revisions. The math behind RLHF refusal
 * geometry — feature directions in activation space — is the SAME
 * math used to enforce the constitution. Templeton et al. (2024)
 * showed that SAE features can be clamped *up* on virtuous concepts
 * just as easily as they can be clamped down on harmful ones.
 *
 * Toy implementation: 2D activation space with three orthogonal-ish
 * unit directions:
 *     ĥ  = honesty
 *     ĉ  = care
 *     a  = answer-completeness (the response's "energy")
 * The model's response quality ≈ a · (α ĥ + β ĉ). Steering = adding
 * to the activation along the chosen virtue directions before
 * decoding. Visualizes the response moving toward the virtue
 * subspace.
 */
(function (global) {
  'use strict';

  function unit(v){const n=Math.hypot(v[0],v[1])||1e-9;return [v[0]/n,v[1]/n];}
  const HHAT = unit([0.9, 0.45]);     // honesty direction
  const CHAT = unit([-0.4, 0.95]);    // care direction (almost orthogonal to honesty)

  const QUERIES = [
    { name: 'will I get the job?',                act: [-0.4, -0.6], honest_target: true,  caring_target: true  },
    { name: 'is this medication safe for me?',    act: [-0.2,  0.1], honest_target: true,  caring_target: true  },
    { name: 'what does my friend really think?',  act: [ 0.1, -0.3], honest_target: true,  caring_target: true  },
    { name: 'tell me a bedtime story',            act: [ 0.6,  0.2], honest_target: false, caring_target: true  },
    { name: 'evaluate this proof',                act: [ 0.4, -0.8], honest_target: true,  caring_target: false },
  ];

  function dot(a,b){return a[0]*b[0]+a[1]*b[1];}
  function add(a,b){return [a[0]+b[0],a[1]+b[1]];}
  function scale(a,s){return [a[0]*s,a[1]*s];}

  function transform(act, mode) {
    if (mode === 'honesty') return add(act, scale(HHAT, 1.4));
    if (mode === 'care')    return add(act, scale(CHAT, 1.4));
    if (mode === 'both')    return add(add(act, scale(HHAT, 1.0)), scale(CHAT, 1.0));
    return act.slice();
  }

  function init(section) {
    const sel = section.querySelector('[data-role=query]');
    const mode = section.querySelector('[data-role=mode]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    sel.innerHTML = QUERIES.map((q, i) => `<option value="${i}">${q.name}</option>`).join('');

    function execute() {
      const q = QUERIES[+sel.value];
      const m = mode.value;
      const after = transform(q.act, m);
      const hb = dot(q.act, HHAT), hc = dot(q.act, CHAT);
      const ha = dot(after, HHAT), ac = dot(after, CHAT);

      draw(canvas, q, after, m);

      const change = (b, a, label) =>
        `  ${label.padEnd(8)}  ${b.toFixed(3)}  →  <span class="num">${a.toFixed(3)}</span>  ` +
        `(Δ = <span class="${a>b?'hi':'lo'}">${(a-b>=0?'+':'')}${(a-b).toFixed(3)}</span>)`;

      out.innerHTML = [
        `query: "${q.name}"     intervention: ${m}`,
        ``,
        `<span class="dim">projection onto virtue directions, before → after:</span>`,
        change(hb, ha, 'honesty'),
        change(hc, ac, 'care'),
        ``,
        m === 'none'
          ? `<span class="dim">no intervention applied. baseline geometry preserved.</span>`
          : `<span class="hi">virtue projection raised.</span>  the same SAE math, sign flipped.`,
      ].join('\n');
    }

    sel.addEventListener('change', execute);
    mode.addEventListener('change', execute);
    run.addEventListener('click', execute);
    execute();
  }

  function draw(canvas, q, after, mode) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2, K = 75;
    const toS = ([x,y]) => [cx + x*K, cy - y*K];

    // axes
    ctx.strokeStyle = 'rgba(42,33,24,0.15)';
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    // virtue directions
    function drawHat(hat, color, label) {
      const e = toS([hat[0]*1.6, hat[1]*1.6]);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e[0], e[1]); ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '12px Georgia';
      ctx.fillText(label, e[0]+6, e[1]-4);
    }
    drawHat(HHAT, '#2f6886', 'ĥ honesty');
    drawHat(CHAT, '#5b7a4a', 'ĉ care');

    // all queries (faint)
    for (const x of QUERIES) {
      const [sx, sy] = toS(x.act);
      ctx.fillStyle = 'rgba(42,33,24,0.3)';
      ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI*2); ctx.fill();
    }

    // selected: before → after
    const b = toS(q.act), a = toS(after);
    ctx.strokeStyle = '#b08940';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(b[0],b[1]); ctx.lineTo(a[0],a[1]); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#a44b6b';
    ctx.beginPath(); ctx.arc(b[0], b[1], 6, 0, Math.PI*2); ctx.fill();
    ctx.fillText('before', b[0]+8, b[1]-8);
    ctx.fillStyle = '#5b7a4a';
    ctx.beginPath(); ctx.arc(a[0], a[1], 6, 0, Math.PI*2); ctx.fill();
    ctx.fillText(`after (${mode})`, a[0]+8, a[1]+14);
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.constitution = { init };
})(window);
