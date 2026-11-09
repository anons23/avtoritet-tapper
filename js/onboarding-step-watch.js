/* onboarding-step-watch.js — advance tutorial after raid/booster panels close */
'use strict';
(function () {
  var raidOpened = false;
  var boosterOpened = false;

  function st() {
    try {
      if (typeof window.getGameState === 'function') return window.getGameState();
    } catch (e) {}
    return null;
  }

  function go(step) {
    try {
      if (window.AVT_Onboarding && typeof window.AVT_Onboarding.goToStep === 'function') {
        window.AVT_Onboarding.goToStep(step);
      }
    } catch (e) {}
  }

  function modalOpen() {
    var o = document.getElementById('modal-overlay');
    if (!o) return false;
    if (o.classList.contains('hidden')) return false;
    return true;
  }

  document.addEventListener(
    'click',
    function (e) {
      if (!e.target || !e.target.closest) return;
      if (e.target.closest('#raid-open-button')) raidOpened = true;
      if (e.target.closest('#booster-open-button')) boosterOpened = true;
    },
    true
  );

  setInterval(function () {
    var s = st();
    if (!s || !s.onboarding || s.onboarding.done) return;
    var step = Number(s.onboarding.step);
    if (step === 8) {
      if (raidOpened || window.__AVT_TUTORIAL_RAIDS_OPEN) {
        if (!modalOpen()) {
          raidOpened = false;
          window.__AVT_TUTORIAL_RAIDS_OPEN = false;
          go(9);
        }
      }
    }
    if (step === 9) {
      if (boosterOpened || window.__AVT_TUTORIAL_BOOSTER_OPEN) {
        if (!modalOpen()) {
          boosterOpened = false;
          window.__AVT_TUTORIAL_BOOSTER_OPEN = false;
          go(10);
        }
      }
    }
  }, 400);
})();
