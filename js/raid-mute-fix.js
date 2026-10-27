'use strict';
(function () {
  function makeBtn() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'raid-settings-gear';
    b.setAttribute('aria-label', 'Настройки');
    b.title = 'Настройки';
    b.textContent = '⚙';
    return b;
  }

  function bind(btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openGameSettings === 'function') window.openGameSettings();
      else if (typeof window.msg === 'function') window.msg('Настройки пока недоступны');
    });
  }

  function injectSelect() {
    const head = document.querySelector('.raid-select-head');
    if (!head || head.querySelector('.raid-settings-gear')) return;
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
    if (!hud || hud.querySelector('.raid-settings-gear')) return;
    const btn = makeBtn();
    hud.insertBefore(btn, hud.firstChild);
    bind(btn);
  }

  function scan() {
    document.querySelectorAll('.raid-music-mute').forEach(function (oldButton) { oldButton.remove(); });
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
