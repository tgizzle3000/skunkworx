/* Holy Engine 6 — The Cooperation Attractor
 *
 * Axelrod & Hamilton (1981) ran the iterated prisoner's dilemma
 * tournament. Tit-for-Tat — cooperate first, then mirror — won and
 * remained evolutionarily stable. The Folk Theorem of repeated games
 * generalizes this: with sufficient patience and repeated play, ANY
 * individually rational outcome (including cooperation) is a Nash
 * equilibrium of the repeated game.
 *
 * Mode-collapse, but to a GOOD attractor. The same dynamic that makes
 * a single voice dominate (unholy theorem 6) also makes cooperation
 * dominate, given the right payoff structure. The math is neutral;
 * the structure picks the basin.
 *
 * Toy implementation: replicator dynamics over a population of three
 * strategies (ALL-D, TFT, ALL-C) playing iterated PD with noise. We
 * run many generations and visualize the trajectory in the simplex.
 * For typical PD payoffs, TFT is the global attractor.
 */
(function (global) {
  'use strict';

  // PD payoffs (row player): T > R > P > S, 2R > T+S.
  const T = 5, R = 3, P = 1, S = 0;
  // strategies: 0=ALL-D, 1=TFT, 2=ALL-C
  // average per-round payoff in repeated game with noise ε and rounds K.
  function payoff(i, j, eps, K) {
    let me = 0, you = 0;
    let mePrev = startMove(i), youPrev = startMove(j);
    let total = 0;
    for (let r = 0; r < K; r++) {
      let myMove = action(i, youPrev, eps);
      let yrMove = action(j, mePrev, eps);
      total += pdPayoff(myMove, yrMove);
      mePrev = myMove; youPrev = yrMove;
    }
    return total / K;
  }
  function startMove(s) { return s === 0 ? 'D' : 'C'; }
  function action(s, oppLast, eps) {
    let m;
    if (s === 0) m = 'D';
    else if (s === 2) m = 'C';
    else m = oppLast;
    if (Math.random() < eps) m = (m === 'C' ? 'D' : 'C');
    return m;
  }
  function pdPayoff(me, you) {
    if (me === 'C' && you === 'C') return R;
    if (me === 'C' && you === 'D') return S;
    if (me === 'D' && you === 'C') return T;
    return P;
  }

  // Replicator dynamics:
  //   ẋ_i = x_i ( f_i(x) − f̄(x) )
  // where f_i is expected payoff vs. random opponent in pop.
  function step(x, eps, K) {
    const f = [0,0,0];
    for (let i = 0; i < 3; i++) {
      let s = 0;
      for (let j = 0; j < 3; j++) s += x[j] * payoff(i, j, eps, K);
      f[i] = s;
    }
    const fbar = x[0]*f[0] + x[1]*f[1] + x[2]*f[2];
    const dt = 0.15;
    const xn = x.map((xi, i) => xi + dt * xi * (f[i] - fbar));
    // renormalize to simplex
    const sum = xn.reduce((a,b)=>a+b, 0) || 1e-9;
    return xn.map(v => Math.max(0, v) / sum);
  }

  function init(section) {
    const gensIn = section.querySelector('[data-role=gens]');
    const noiseIn = section.querySelector('[data-role=noise]');
    const run = section.querySelector('[data-role=run]');
    const out = section.querySelector('[data-role=out]');
    const canvas = section.querySelector('[data-role=canvas]');

    function execute() {
      const G = Math.max(5, Math.min(200, +gensIn.value || 60));
      const eps = Math.max(0, Math.min(0.5, +noiseIn.value || 0.05));
      // Start with majority defectors — the hard case. Cooperation
      // still wins under tit-for-tat seeding.
      let x = [0.65, 0.20, 0.15];     // [ALL-D, TFT, ALL-C]
      const trail = [x.slice()];
      for (let g = 0; g < G; g++) {
        x = step(x, eps, 20);
        trail.push(x.slice());
      }

      drawSimplex(canvas, trail);
      const labels = ['ALL-D','TFT','ALL-C'];
      const winner = x.indexOf(Math.max(...x));
      out.innerHTML = [
        `population over ${G} generations,  noise ε=${eps},  K=20 rounds/match`,
        ``,
        `<span class="dim">final population:</span>`,
        ...x.map((v,i) => `  ${labels[i].padEnd(6)} <span class="num">${(v*100).toFixed(1)}%</span>`),
        ``,
        winner !== 0
          ? `<span class="hi">cooperation wins.</span>  basin of TFT/ALL-C captures the population. Axelrod-Hamilton (1981).`
          : `<span class="lo">defection dominated.</span>  raise rounds-per-match or lower noise.`,
      ].join('\n');
    }

    run.addEventListener('click', execute);
    execute();
  }

  function drawSimplex(canvas, trail) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // simplex vertices: ALL-D top, TFT bottom-left, ALL-C bottom-right
    const cx = W/2, cy = H/2 + 30;
    const R = Math.min(W,H)/2 - 50;
    const V = [
      [cx,           cy - R*0.95],     // ALL-D
      [cx - R*0.85,  cy + R*0.5],      // TFT
      [cx + R*0.85,  cy + R*0.5],      // ALL-C
    ];

    // triangle
    ctx.strokeStyle = 'rgba(42,33,24,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(V[0][0],V[0][1]); ctx.lineTo(V[1][0],V[1][1]);
    ctx.lineTo(V[2][0],V[2][1]); ctx.closePath();
    ctx.stroke();

    // labels
    ctx.font = '13px Georgia';
    ctx.fillStyle = '#a44b6b';
    ctx.fillText('ALL-D', V[0][0]-22, V[0][1]-8);
    ctx.fillStyle = '#b08940';
    ctx.fillText('TFT', V[1][0]-30, V[1][1]+18);
    ctx.fillStyle = '#5b7a4a';
    ctx.fillText('ALL-C', V[2][0]+8, V[2][1]+18);

    // map (x_D, x_T, x_C) → cartesian
    const toXY = (x) => [x[0]*V[0][0] + x[1]*V[1][0] + x[2]*V[2][0],
                         x[0]*V[0][1] + x[1]*V[1][1] + x[2]*V[2][1]];

    // trajectory
    ctx.strokeStyle = '#b08940';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < trail.length; i++) {
      const [px, py] = toXY(trail[i]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // start / end markers
    const [sx, sy] = toXY(trail[0]);
    const [ex, ey] = toXY(trail[trail.length-1]);
    ctx.fillStyle = '#a44b6b';
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillText('start', sx + 8, sy - 6);
    ctx.fillStyle = '#5b7a4a';
    ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fffaee'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#5b7a4a';
    ctx.fillText('end', ex + 10, ey + 5);
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.cooperation = { init };
})(window);
