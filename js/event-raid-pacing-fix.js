/* event-raid-pacing-fix.js v1.3 — close button «Ништяк» + double ad */
'use strict';
(function () {
  var EVENT_CD_MS = 75000;

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
      if (now - last < EVENT_CD_MS) return;
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

  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (wrapOpenEvent() || tries > 80) clearInterval(timer);
  }, 250);

  function isResultShown() {
    var c = document.getElementById('raid-result');
    return !!(c && c.classList.contains('show'));
  }

  function isRewardActionTarget(t) {
    return !!(t && t.closest && (t.closest('#raid-result-ok') || t.closest('#raid-result-double')));
  }

  function setBackDisabled(disabled) {
    var back = document.getElementById('raid-back');
    if (!back) return;
    if (disabled) {
      back.setAttribute('data-avt-was-pe', back.style.pointerEvents || '');
      back.style.pointerEvents = 'none';
      back.style.opacity = '0.35';
    } else {
      var prev = back.getAttribute('data-avt-was-pe');
      back.style.pointerEvents = prev != null ? prev : '';
      back.style.opacity = '';
      back.removeAttribute('data-avt-was-pe');
    }
  }

  function armRaidResultHold(card) {
    if (!card || card.__avtHoldArmed) return;
    card.__avtHoldArmed = true;
    window.__AVT_RAID_RESULT_LOCK_UNTIL = Date.now() + 2500;

    try {
      var scene = document.getElementById('raid-scene');
      if (scene) scene.style.pointerEvents = 'none';
    } catch (e) {}
    setBackDisabled(true);

    if (!card.__avtBackdropBlock) {
      card.__avtBackdropBlock = true;
      var blockOutside = function (e) {
        if (!isResultShown()) return;
        if (isRewardActionTarget(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      };
      card.addEventListener('pointerdown', blockOutside, true);
      card.addEventListener('click', blockOutside, true);
      card.addEventListener('touchstart', blockOutside, true);
    }

    var dblBtn = document.getElementById('raid-result-double');
    if (dblBtn) dblBtn.style.pointerEvents = 'auto';

    var ok = document.getElementById('raid-result-ok');
    if (ok) {
      ok.style.pointerEvents = 'auto';
      ok.disabled = true;
      ok.style.opacity = '0.55';
      ok.textContent = 'Ништяк (2…)';
      var left = 2;
      var tick = setInterval(function () {
        left -= 1;
        var live = document.getElementById('raid-result-ok');
        if (!live) {
          clearInterval(tick);
          return;
        }
        if (left <= 0) {
          clearInterval(tick);
          live.disabled = false;
          live.style.opacity = '1';
          live.textContent = 'Ништяк';
        } else {
          live.textContent = 'Ништяк (' + left + '…)';
        }
      }, 1000);

      if (!ok.__avtCloseBound) {
        ok.__avtCloseBound = true;
        ok.addEventListener(
          'click',
          function (e) {
            if (Date.now() < (window.__AVT_RAID_RESULT_LOCK_UNTIL || 0)) {
              e.preventDefault();
              e.stopImmediatePropagation();
              return;
            }
            try {
              var scene2 = document.getElementById('raid-scene');
              if (scene2) scene2.style.pointerEvents = '';
            } catch (e2) {}
            setBackDisabled(false);
            var c = document.getElementById('raid-result');
            if (c) c.__avtHoldArmed = false;
          },
          true
        );
      }
    }
  }

  function onResultHidden() {
    setBackDisabled(false);
    try {
      var scene = document.getElementById('raid-scene');
      if (scene) scene.style.pointerEvents = '';
    } catch (e) {}
    var c = document.getElementById('raid-result');
    if (c) c.__avtHoldArmed = false;
  }

  function watchRaidResult() {
    function check() {
      var c = document.getElementById('raid-result');
      if (c && c.classList.contains('show')) armRaidResultHold(c);
      else if (c && !c.classList.contains('show')) onResultHidden();
    }
    check();
    try {
      var root = document.getElementById('modal-content') || document.body;
      var mo = new MutationObserver(function () {
        check();
      });
      mo.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    } catch (e) {
      setInterval(check, 400);
    }

    document.addEventListener(
      'pointerdown',
      function (e) {
        if (!isResultShown()) return;
        if (isRewardActionTarget(e.target)) return;
        if (e.target && e.target.closest && e.target.closest('#raid-result')) {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        }
      },
      true
    );
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
