/* onboarding-force-v7.js — one-shot: re-open tutorial if version < 7 */
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
      if (Number(s.onboarding.tutorialVersion || 0) < 7) {
        s.onboarding.tutorialVersion = 7;
        s.onboarding.done = false;
        s.onboarding.step = 0;
        s.onboarding.practiceTaps = 0;
        if (typeof window.saveGame === 'function') window.saveGame();
        if (typeof window.AVT_Onboarding.goToStep === 'function') {
          window.AVT_Onboarding.goToStep(0);
        }
        console.log('[onboarding-force-v7] tutorial reset to v7');
      }
    } catch (e) {
      console.warn('[onboarding-force-v7]', e);
    }
  }
  setTimeout(run, 1200);
  setTimeout(run, 3000);
})();
