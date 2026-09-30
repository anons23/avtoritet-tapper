'use strict';
(function () {
  /* Soft-lock choice buttons 650ms when event modal opens; reduce event spam */

  function softLockChoices(root) {
    try {
      var choices = (root || document).querySelectorAll('.choice');
      if (!choices.length) return;
      choices.forEach(function (b) {
        b.disabled = true;
        b.style.opacity = '0.55';
        b.style.pointerEvents = 'none';
      });
      setTimeout(function () {
        choices.forEach(function (b) {
          b.disabled = false;
          b.style.opacity = '';
          b.style.pointerEvents = '';
        });
      }, 650);
    } catch (e) {}
  }

  var lastLock = 0;
  function onModalMut(muts) {
    for (var i = 0; i < muts.length; i++) {
      var n = muts[i];
      if (n.type === 'childList' && n.addedNodes && n.addedNodes.length) {
        var content = document.getElementById('modal-content');
        if (content && content.querySelector('.choice')) {
          var now = Date.now();
          if (now - lastLock > 400) {
            lastLock = now;
            softLockChoices(content);
          }
        }
      }
    }
  }

  function boot() {
    var content = document.getElementById('modal-content');
    if (content) {
      new MutationObserver(onModalMut).observe(content, { childList: true, subtree: true });
    } else {
      setTimeout(boot, 200);
      return;
    }
    var overlay = document.getElementById('modal-overlay');
    if (overlay) {
      new MutationObserver(function () {
        if (overlay.classList.contains('show')) {
          setTimeout(function () {
            softLockChoices(document.getElementById('modal-content'));
          }, 30);
        }
      }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function tryPatchOpenEvent() {
    if (typeof window.openEvent !== 'function') return;
    if (window.openEvent.__eventUx) return;
    var orig = window.openEvent;
    window.openEvent = function () {
      try {
        var st = window.getGameState && window.getGameState();
        if (st) {
          var pts = Number(st.points) || 0;
          var last = Number(st.lastChoiceEvent) || 0;
          if (pts - last < 150) return;
        }
      } catch (e) {}
      if (Math.random() > 0.25) return;
      return orig.apply(this, arguments);
    };
    window.openEvent.__eventUx = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(tryPatchOpenEvent, 500);
})();
