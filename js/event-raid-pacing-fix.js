/* event-raid-pacing-fix.js v1 — events every 1–1.5 min; raid reward hold */
'use strict';
(function () {
  var EVENT_CD_MS = 75000; // ~1.25 мин между случайными событиями

  function getState() {
    try {
      if (typeof window.getGameState === 'function') return window.getGameState();
    } catch (e) {}
    return window.s || null;
  }

  function wrapOpenEvent() {
    if (typeof window.openEvent !== 'function') return false;
    if (window.openEvent.__avtThrottled) return true;
    var original = window.openEvent;
    window.openEvent = function () {
      var s = getState();
      var now = Date.now();
      var last = Number(s && s.lastEventAt) || 0;
      if (now - last < EVENT_CD_MS) {
        // слишком рано — не открываем событие
        return;
      }
      if (s) {
        s.lastEventAt = now;
        try {
          if (typeof window.saveGame === 'function') window.saveGame();
        } catch (e) {}
      }
      return original.apply(this, arguments);
    };
    window.openEvent.__avtThrottled = true;
    return true;
  }

  // game.js грузится асинхронно из bootstrap — ждём openEvent
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (wrapOpenEvent() || tries > 80) clearInterval(timer);
  }, 250);

  /* ---- Рейд: держим окно награды ~2.5 сек ---- */
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
        if (!document.getElementById('raid-result-ok')) {
          clearInterval(tick);
          return;
        }
        if (left <= 0) {
          clearInterval(tick);
          ok.disabled = false;
          ok.style.opacity = '1';
          ok.textContent = 'Ок';
        } else {
          ok.textContent = 'Ок (' + left + '…)';
        }
      }, 1000);

      ok.addEventListener(
        'click',
        function (e) {
          if (Date.now() < (window.__AVT_RAID_RESULT_LOCK_UNTIL || 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
          } else {
            try {
              var scene2 = document.getElementById('raid-scene');
              if (scene2) scene2.style.pointerEvents = '';
            } catch (e2) {}
          }
        },
        true
      );
    }
  }

  function watchRaidResult() {
    function check() {
      var c = document.getElementById('raid-result');
      if (c && c.classList.contains('show')) armRaidResultHold(c);
      if (c && !c.classList.contains('show')) {
        c.__avtHoldArmed = false;
      }
    }
    check();
    try {
      var root = document.getElementById('modal-content') || document.body;
      var mo = new MutationObserver(function () {
        check();
      });
      mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) {
      setInterval(check, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(watchRaidResult, 600);
    });
  } else {
    setTimeout(watchRaidResult, 600);
  }

  window.__AVT_EVENT_CD_MS = EVENT_CD_MS;
})();
