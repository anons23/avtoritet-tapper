/* raid-hide-gear.js — hide settings gear during active raid fight */
'use strict';
(function () {
  function sync() {
    var gear = document.getElementById('settings-gear-button');
    if (!gear) return;
    var overlay = document.getElementById('modal-overlay');
    var inFight = !!(overlay && overlay.classList.contains('raid-fullscreen'));
    var inSelection = !!(overlay && overlay.classList.contains('raid-selection-fullscreen'));
    if (inFight && !inSelection) {
      gear.style.display = 'none';
      gear.setAttribute('aria-hidden', 'true');
    } else {
      gear.style.display = '';
      gear.removeAttribute('aria-hidden');
    }
  }

  var obs = new MutationObserver(sync);
  function boot() {
    var overlay = document.getElementById('modal-overlay');
    if (overlay) obs.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    sync();
    setInterval(sync, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
