/* raid-mute-fix.js v1.2 — no settings gear in fight; strip legacy mute clones */
'use strict';
(function () {
  function scan() {
    // Remove old floating mute buttons if any leftover nodes appear
    document.querySelectorAll('.raid-music-mute').forEach(function (el) {
      try { el.remove(); } catch (e) {}
    });
    // Never show a settings gear inside the active fight HUD
    var scene = document.getElementById('raid-scene');
    if (scene) {
      scene.querySelectorAll('.raid-settings-gear').forEach(function (el) {
        try { el.remove(); } catch (e) {}
      });
    }
  }

  var obs = new MutationObserver(function () { scan(); });
  function boot() {
    scan();
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
