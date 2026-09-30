'use strict';
(function () {
  function playPunch(crit) {
    try { window.GameSFX && window.GameSFX.punch(!!crit); } catch (e) {}
  }
  function playHit(crit) {
    try { window.GameSFX && window.GameSFX.hit(!!crit); } catch (e) {}
  }
  function playWin() {
    try { window.GameSFX && window.GameSFX.win(); } catch (e) {}
  }
  function playClick() {
    try { window.GameSFX && window.GameSFX.click(); } catch (e) {}
  }

  /* Menu / UI button click sounds */
  const CLICK_SEL = [
    '.nav-btn',
    '#btn-shop',
    '#btn-rank',
    '#btn-tasks',
    '#btn-more',
    '#modal-close',
    '.raid-menu-close',
    '.raid-fighter-card',
    '.raid-next',
    '#raid-back',
    '#raid-result-ok',
    '#music-mute-btn',
    '.choice',
    '.shop-grid button',
    '#prestige',
    '.resource.energy'
  ].join(',');

  function isClickTarget(el) {
    if (!el || !el.closest) return false;
    if (el.closest(CLICK_SEL)) return true;
    /* Generic modal / panel buttons inside #modal-content */
    if (el.closest('#modal-content button, #modal button, .raid-select button, .raid-controls button')) return true;
    return false;
  }

  function uiClickCapture() {
    document.addEventListener(
      'pointerdown',
      function (e) {
        if (e.button != null && e.button !== 0) return;
        const t = e.target;
        if (!isClickTarget(t)) return;
        /* Avoid double with raid hit on scene */
        if (t.closest && t.closest('#raid-scene') && !t.closest('.raid-controls, #raid-back, .raid-result, .raid-next, .raid-menu-close')) return;
        playClick();
      },
      true
    );
  }

  function observePunch() {
    const obj = document.getElementById('tap-object');
    if (!obj || obj.dataset.sfxPunch === '1') return;
    obj.dataset.sfxPunch = '1';
    new MutationObserver(function (muts) {
      for (let i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === 'class' && obj.classList.contains('punch')) {
          playPunch(obj.classList.contains('crit'));
        }
      }
    }).observe(obj, { attributes: true, attributeFilter: ['class'] });
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

  function raidCapture() {
    document.addEventListener(
      'pointerdown',
      function (e) {
        const scene = e.target && e.target.closest && e.target.closest('#raid-scene');
        if (!scene) return;
        if (e.target.closest('.raid-controls, #raid-back, .raid-result, .raid-next')) return;
        if (window.__sfxRaidHitAt && Date.now() - window.__sfxRaidHitAt < 40) return;
        playHit(false);
      },
      true
    );
  }

  function wrap(name) {
    if (!window.GameSFX || !window.GameSFX[name]) return;
    const orig = window.GameSFX[name].bind(window.GameSFX);
    window.GameSFX[name] = function () {
      if (name === 'hit') window.__sfxRaidHitAt = Date.now();
      return orig.apply(null, arguments);
    };
  }

  function boot() {
    wrap('hit');
    observePunch();
    observeRaidResult();
    raidCapture();
    uiClickCapture();
    setInterval(observePunch, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
