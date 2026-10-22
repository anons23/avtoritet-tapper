'use strict';
(function () {
  function playPunch(crit) {
    try { window.GameSFX && window.GameSFX.punch(!!crit); } catch (e) {}
  }
  function playWin() {
    try { window.GameSFX && window.GameSFX.win(); } catch (e) {}
  }
  function playClick() {
    try { window.GameSFX && window.GameSFX.click(); } catch (e) {}
  }

  /* Menu / UI button clicks only — no SFX on raid fighter taps */
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
        /* Never click-sfx on the raid fight scene body (fighter taps) */
        if (t.closest && t.closest('#raid-scene') && !t.closest('.raid-controls, #raid-back, .raid-result, .raid-next, .raid-menu-close')) return;
        playClick();
      },
      true
    );
  }

  /* Punch SFX теперь вызывается напрямую из game.js (tap/jailTap).
     MutationObserver убран: ui()/refreshObjectVisuals каждые 1с меняли class
     и на части устройств давали повторный/ритмичный звук. */
  function observePunch() {
    /* no-op — left for compatibility with old boot path */
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

  function boot() {
    observeRaidResult();
    uiClickCapture();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
