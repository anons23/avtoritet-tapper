/* onboarding-force-v8.js — re-open tutorial if version < 8 */
'use strict';
(function () {
  function run() {
    try {
      if (!window.AVT_Onboarding) return;
      var s = typeof window.getGameState === 'function' ? window.getGameState() : null;
      if (!s) return;
      if (!s.onboarding || typeof s.onboarding !== 'object') {
        s.onboarding = { done: false, step: 0, nameGiven: false, practiceTaps: 0, tipsShown: {}, unlocked: {} };
      }
      if (Number(s.onboarding.tutorialVersion || 0) < 8) {
        s.onboarding.tutorialVersion = 8;
        s.onboarding.done = false;
        s.onboarding.step = 0;
        s.onboarding.practiceTaps = 0;
        if (typeof window.saveGame === 'function') window.saveGame();
        if (typeof window.AVT_Onboarding.goToStep === 'function') {
          window.AVT_Onboarding.goToStep(0);
        }
        console.log('[onboarding-force] tutorial reset to v8');
      }
    } catch (e) {
      console.warn('[onboarding-force]', e);
    }
  }
  setTimeout(run, 1200);
  setTimeout(run, 3000);
})();
