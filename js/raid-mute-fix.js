'use strict';
(function () {
  function makeBtn() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'raid-music-mute';
    b.setAttribute('aria-label', 'Музыка');
    b.textContent = '🔊';
    return b;
  }

  function bind(btn) {
    try {
      if (window.GameMusic && typeof window.GameMusic.bindRaidMuteBtn === 'function') {
        window.GameMusic.bindRaidMuteBtn(btn);
      } else {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          try { window.GameMusic && window.GameMusic.toggleMute(); } catch (err) {}
        });
      }
    } catch (e) {}
  }

  function injectSelect() {
    const head = document.querySelector('.raid-select-head');
    if (!head || head.querySelector('.raid-music-mute')) return;
    let actions = head.querySelector('.raid-select-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'raid-select-actions';
      actions.style.cssText = 'display:flex;align-items:center;gap:8px;flex:0 0 auto';
      const close = head.querySelector('.raid-menu-close');
      if (close) {
        head.insertBefore(actions, close);
        actions.appendChild(close);
      } else {
        head.appendChild(actions);
      }
    }
    const btn = makeBtn();
    actions.insertBefore(btn, actions.firstChild);
    bind(btn);
  }

  function injectHud() {
    const hud = document.querySelector('#raid-scene .raid-hud');
    if (!hud || hud.querySelector('.raid-music-mute')) return;
    const btn = makeBtn();
    hud.insertBefore(btn, hud.firstChild);
    bind(btn);
  }

  function scan() {
    injectSelect();
    injectHud();
  }

  const obs = new MutationObserver(function () { scan(); });
  function boot() {
    scan();
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
