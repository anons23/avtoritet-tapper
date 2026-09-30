'use strict';
(function () {
  function playPunch(crit) {
    try {
      window.GameSFX && window.GameSFX.punch(!!crit);
    } catch (e) {}
  }
  function playHit(crit) {
    try {
      window.GameSFX && window.GameSFX.hit(!!crit);
    } catch (e) {}
  }
  function playWin() {
    try {
      window.GameSFX && window.GameSFX.win();
    } catch (e) {}
  }

  function observePunch() {
    const el = document.getElementById('tap-object');
    if (!el || el.dataset.sfxPunch === '1') return;
    el.dataset.sfxPunch = '1';
    new MutationObserver(function (muts) {
      for (let i = 0; i < muts.length; i++) {
        const m = muts[i];
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (el.classList.contains('punch')) {
            const crit =
              !!document.querySelector('#tap-feedback .crit, #tap-feedback.crit, .raid-fighter.crit');
            playPunch(crit);
          }
        }
      }
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  }

  function observeRaidResult() {
    const bodyObs = new MutationObserver(function () {
      const r = document.getElementById('raid-result');
      if (!r || r.dataset.sfxWin === '1') return;
      r.dataset.sfxWin = '1';
      new MutationObserver(function (muts) {
        for (let i = 0; i < muts.length; i++) {
          if (muts[i].attributeName === 'class' && r.classList.contains('show')) playWin();
        }
      }).observe(r, { attributes: true, attributeFilter: ['class'] });
    });
    bodyObs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Raid hits: if raids-ui didn't call GameSFX.hit, still play on scene tap
  function raidCapture() {
    document.addEventListener(
      'pointerdown',
      function (e) {
        const scene = e.target && e.target.closest && e.target.closest('#raid-scene');
        if (!scene) return;
        if (e.target.closest('.raid-controls, #raid-back, .raid-result, .raid-next')) return;
        // Prefer explicit call from raids-ui; this is backup with slight delay skip if already playing
        if (window.__sfxRaidHitAt && Date.now() - window.__sfxRaidHitAt < 40) return;
        playHit(false);
      },
      true
    );
  }

  // Mark when explicit SFX plays so capture doesn't double
  const wrap = function (name) {
    if (!window.GameSFX || !window.GameSFX[name]) return;
    const orig = window.GameSFX[name].bind(window.GameSFX);
    window.GameSFX[name] = function () {
      if (name === 'hit') window.__sfxRaidHitAt = Date.now();
      return orig.apply(null, arguments);
    };
  };

  function boot() {
    wrap('hit');
    observePunch();
    observeRaidResult();
    raidCapture();
    setInterval(observePunch, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
