/* Boots every proof engine. Each engine module registers itself on
 * window.ProofEngines.<name> with an init(section) entry point. We
 * walk the DOM, find sections with [data-engine], and wire them up.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('[data-engine]');
    const reg = window.ProofEngines || {};
    sections.forEach(function (sec) {
      const name = sec.getAttribute('data-engine');
      const eng = reg[name];
      if (!eng || typeof eng.init !== 'function') {
        console.warn('proof engine missing:', name);
        return;
      }
      try {
        eng.init(sec);
      } catch (err) {
        console.error('engine ' + name + ' failed:', err);
        const out = sec.querySelector('[data-role=out]');
        if (out) out.textContent = 'error: ' + err.message;
      }
    });
  });
})();
