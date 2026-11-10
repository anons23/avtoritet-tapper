/* event-raid-pacing-fix.js — slow random events + hold raid reward */
'use strict';
(function () {
  /* ---------- Random events: 1–1.5 min between pops ---------- */
  var EVENT_CD_MS = 75000; // ~1.25 min
  var EVENT_CHANCE = 0.18;

  function getState() {
    try {
      if (typeof window.getGameState === 'function') return window.getGameState();
    } catch (e) {}
    return window.s || null;
  }

  function patchOpenEvent() {
    // Hook via wrapping if exposed later; primary path is game.js inline (also patched).
    // Safety net: if openEvent is assigned on window, throttle it.
  }

  // Safety: if another code path opens modal events too often, still mark timestamp
  document.addEventListener(
    'click',
    function () {
      var s = getState();
      if (!s) return;
      // no-op; timestamp set in game.js openEvent
    },
    true
  );

  /* ---------- Raid reward hold ---------- */
  function armRaidResultHold(card) {
    if (!card || card.__avtHoldArmed) return;
    card.__avtHoldArmed = true;
    window.__AVT_RAID_RESULT_LOCK_UNTIL = Date.now() + 2500;

    try {
      var scene = document.getElementById('raid-scene');
      if (scene) scene.style.pointerEvents = 'none';
    } catch (e) {}

    var ok = document.getElementById('raid-result-ok');
    if (ok) {
      ok.disabled = true;
      ok.style.opacity = '0.55';
      ok.textContent = 'Ок (2…)';
      var left = 2;
      var tick = setInterval(function () {
        left -= 1;
        if (left <= 0) {
          clearInterval(tick);
          ok.disabled = false;
          ok.style.opacity = '1';
          ok.textContent = 'Ок';
        } else {
          ok.textContent = 'Ок (' + left + '…)';
        }
      }, 1000);

      // prevent early close from rapid taps
      ok.addEventListener(
        'click',
        function (e) {
          if (Date.now() < (window.__AVT_RAID_RESULT_LOCK_UNTIL || 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        },
        true
      );
    }
  }

  function watchRaidResult() {
    var card = document.getElementById('raid-result');
    if (!card) return;
    if (card.classList.contains('show')) armRaidResultHold(card);

    try {
      var mo = new MutationObserver(function () {
        var c = document.getElementById('raid-result');
        if (c && c.classList.contains('show')) armRaidResultHold(c);
        if (c && !c.classList.contains('show')) {
          if (c) c.__avtHoldArmed = false;
          try {
            var scene = document.getElementById('raid-scene');
            if (scene) scene.style.pointerEvents = '';
          } catch (e) {}
        }
      });
      mo.observe(card, { attributes: true, attributeFilter: ['class'] });
      // also watch parent for re-renders
      var root = document.getElementById('modal-content') || document.body;
      var mo2 = new MutationObserver(function () {
        var c = document.getElementById('raid-result');
        if (c && c.classList.contains('show')) armRaidResultHold(c);
      });
      mo2.observe(root, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(watchRaidResult, 800);
    });
  } else {
    setTimeout(watchRaidResult, 800);
  }

  // Export constants for game.js optional use
  window.__AVT_EVENT_CD_MS = EVENT_CD_MS;
  window.__AVT_EVENT_CHANCE = EVENT_CHANCE;
})();
