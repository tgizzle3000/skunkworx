/* Boots every holy-math engine. Each module registers itself on
 * window.ProofEnginesHoly.<name>; we wire data-engine sections to
 * their corresponding init().
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('[data-engine]');
    const reg = window.ProofEnginesHoly || {};
    sections.forEach(function (sec) {
      const name = sec.getAttribute('data-engine');
      const eng = reg[name];
      if (!eng || typeof eng.init !== 'function') {
        console.warn('holy proof engine missing:', name);
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
