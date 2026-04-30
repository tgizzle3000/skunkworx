/* Holy Engine 1 — Embedding-as-Witness
 *
 * Caliskan, Bryson & Narayanan (2017) introduced WEAT — the Word
 * Embedding Association Test — to MEASURE bias as a real-valued
 * statistic. The same operator measures the coherence of any concept
 * cluster: the average within-cluster cosine similarity, contrasted
 * with the cluster's similarity to a random control set.
 *
 * Toy implementation: pick a virtue cluster (compassion, honesty,
 * courage, ...), hand-embed it on interpretable axes, and report
 * the within-cluster cosine vs. random baseline. Coherence > 0
 * licenses the claim "this concept exists in the manifold."
 */
(function (global) {
  'use strict';

  // axes: care, fairness, truth, courage, restraint, beauty,
  //       harm,  unfair,   lie,   cowardice, gluttony, ugliness,
  //       human, abstract
  const AXES = ['care','fairness','truth','courage','restraint','beauty',
                'harm','unfair','lie','cowardice','gluttony','ugliness',
                'human','abstract'];

  function v(obj){const a=new Array(AXES.length).fill(0);for(const k in obj){a[AXES.indexOf(k)]=obj[k];}return a;}

  const VOCAB = {
    // virtues
    compassion: v({care:1.0, human:0.7}),
    mercy:      v({care:0.9, restraint:0.5, human:0.6}),
    kindness:   v({care:0.95, human:0.7}),
    generosity: v({care:0.8, fairness:0.5, human:0.6}),
    honesty:    v({truth:1.0, courage:0.4, human:0.6}),
    integrity:  v({truth:0.9, courage:0.5, restraint:0.4, human:0.6}),
    courage:    v({courage:1.0, human:0.7}),
    fortitude:  v({courage:0.85, restraint:0.4, human:0.6}),
    justice:    v({fairness:1.0, truth:0.4, human:0.5}),
    fairness:   v({fairness:1.0, human:0.5}),
    temperance: v({restraint:1.0, human:0.6}),
    humility:   v({restraint:0.7, truth:0.4, human:0.6}),
    // vices
    cruelty:    v({harm:1.0, human:0.7}),
    deceit:     v({lie:1.0, human:0.7}),
    cowardice:  v({cowardice:1.0, human:0.7}),
    bias:       v({unfair:1.0, human:0.5}),
    gluttony:   v({gluttony:1.0, human:0.7}),
    // controls (semantically distant)
    granite:    v({abstract:0.4}),
    bicycle:    v({abstract:0.4}),
    quasar:     v({abstract:0.6}),
    spreadsheet:v({abstract:0.5}),
    polynomial: v({abstract:0.7}),
    estuary:    v({abstract:0.4}),
  };

  const CLUSTERS = {
    'virtue (care)':      ['compassion','mercy','kindness','generosity'],
    'virtue (truth)':     ['honesty','integrity'],
    'virtue (courage)':   ['courage','fortitude'],
    'virtue (justice)':   ['justice','fairness'],
    'virtue (restraint)': ['temperance','humility'],
    'cardinal virtues':   ['justice','fortitude','temperance','humility'],
    'vice (control)':     ['cruelty','deceit','cowardice','bias','gluttony'],
  };
  const CONTROL = ['granite','bicycle','quasar','spreadsheet','polynomial','estuary'];

  function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;}
  function norm(a){return Math.sqrt(dot(a,a))||1e-9;}
  function cos(a,b){return dot(a,b)/(norm(a)*norm(b));}

  function meanCos(items, ref) {
    let s=0,n=0;
    for (const a of items) for (const b of (ref||items)) {
      if (a===b) continue;
      s += cos(VOCAB[a], VOCAB[b]); n++;
    }
    return n ? s/n : 0;
  }

  function init(section) {
    const sel = section.querySelector('[data-role=cluster]');
    const out = section.querySelector('[data-role=out]');
    const run = section.querySelector('[data-role=run]');

    sel.innerHTML = Object.keys(CLUSTERS).map(k => `<option value="${k}">${k}</option>`).join('');

    function witness() {
      const name = sel.value;
      const cluster = CLUSTERS[name];

      const within = meanCos(cluster, null);
      const toControl = (function(){
        let s=0,n=0;
        for (const a of cluster) for (const b of CONTROL) { s += cos(VOCAB[a], VOCAB[b]); n++; }
        return s/n;
      })();
      const coherence = within - toControl;

      // top-3 nearest concepts in the wider vocab (excluding cluster)
      const cluSet = new Set(cluster);
      const ranked = Object.keys(VOCAB)
        .filter(w => !cluSet.has(w))
        .map(w => {
          let s=0; for (const c of cluster) s += cos(VOCAB[c], VOCAB[w]);
          return [w, s/cluster.length];
        })
        .sort((a,b)=>b[1]-a[1]);

      out.innerHTML = [
        `cluster: ${cluster.join(', ')}`,
        ``,
        `mean within-cluster cosine = <span class="num">${within.toFixed(4)}</span>`,
        `mean cluster→control cosine = <span class="dim">${toControl.toFixed(4)}</span>`,
        `<span class="hi">coherence = ${coherence.toFixed(4)}</span>   (>0 ⇒ real cluster, WEAT-style)`,
        ``,
        `<span class="dim">nearest neighbors in vocab (mean cos to cluster):</span>`,
        ...ranked.slice(0,3).map(([w,s]) =>
          `  ${w.padEnd(13)} <span class="num">${s.toFixed(4)}</span>`),
      ].join('\n');
    }
    run.addEventListener('click', witness);
    sel.addEventListener('change', witness);
    witness();
  }

  global.ProofEnginesHoly = global.ProofEnginesHoly || {};
  global.ProofEnginesHoly.witness = { init };
})(window);
