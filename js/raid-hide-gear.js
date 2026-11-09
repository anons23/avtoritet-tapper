/* raid-hide-gear.js v1.1 — completely hide settings gear during raid fight */
'use strict';
(function () {
  var STYLE_ID = 'raid-hide-gear-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      'body.raid-fight-active #settings-gear-button,' +
      'body.raid-fight-active #sentence-panel #settings-gear-button,' +
      'body.raid-fight-active .sentence-layout #settings-gear-button{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;' +
      '}';
    document.head.appendChild(s);
  }

  function inFight() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) return false;
    // Active fight only — not the fighter selection list
    if (overlay.classList.contains('hidden')) return false;
    if (overlay.classList.contains('raid-selection-fullscreen')) return false;
    return overlay.classList.contains('raid-fullscreen');
  }

  function sync() {
    ensureStyle();
    var gear = document.getElementById('settings-gear-button');
    var fight = inFight();
    document.body.classList.toggle('raid-fight-active', fight);
    if (!gear) return;
    if (fight) {
      gear.style.setProperty('display', 'none', 'important');
      gear.style.setProperty('visibility', 'hidden', 'important');
      gear.style.setProperty('pointer-events', 'none', 'important');
      gear.setAttribute('aria-hidden', 'true');
    } else {
      gear.style.removeProperty('display');
      gear.style.removeProperty('visibility');
      gear.style.removeProperty('pointer-events');
      gear.removeAttribute('aria-hidden');
    }
  }

  function boot() {
    ensureStyle();
    var overlay = document.getElementById('modal-overlay');
    if (overlay) {
      new MutationObserver(sync).observe(overlay, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    sync();
    setInterval(sync, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
