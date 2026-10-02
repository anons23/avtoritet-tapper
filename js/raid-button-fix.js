'use strict';
(function () {
  /* Guarantee the raid open button is present and opens the menu even if raids-ui.js failed. */

  function closeOverlay() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('show', 'raid-fullscreen', 'raid-selection-fullscreen');
    overlay.classList.add('hidden');
  }

  function openMenuFallback() {
    var overlay = document.getElementById('modal-overlay');
    var content = document.getElementById('modal-content');
    if (!overlay || !content) return false;
    overlay.classList.remove('hidden');
    overlay.classList.add('show', 'raid-selection-fullscreen');
    overlay.classList.remove('raid-fullscreen');
    content.innerHTML =
      '<div class="raid-select">' +
        '<div class="raid-select-head">' +
          '<div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай, пока не свалится.</p></div>' +
          '<div class="raid-select-actions">' +
            '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="raid-fighter-list" id="raid-fighter-list">' +
          '<p style="padding:16px;color:#aaa">Загрузка бойцов… Если пусто — Ctrl+F5.</p>' +
        '</div>' +
      '</div>';
    var closeBtn = document.getElementById('raid-menu-close');
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    try { if (typeof window.openRaidMenu === 'function') { window.openRaidMenu(); return true; } } catch(e){}
    return true;
  }

  function tryOpen() {
    try {
      if (typeof window.openRaidMenu === 'function') {
        window.openRaidMenu();
        return true;
      }
    } catch (err) {
      console.error('[RaidButton] openRaidMenu failed', err);
    }
    return openMenuFallback();
  }

  function onBtn(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    tryOpen();
  }

  function ensure() {
    try {
      var parent = document.getElementById('game-container') || document.body;
      if (!parent) return;
      var btn = document.getElementById('raid-open-button');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'raid-open-button';
        btn.type = 'button';
        btn.title = 'Рейды';
        btn.setAttribute('aria-label', 'Рейды');
        btn.innerHTML = '<img src="./assets/raids/ui/raid-button.png" alt="Рейды">';
        parent.appendChild(btn);
      }
      if (!btn.__avtRaidBound) {
        btn.addEventListener('click', onBtn, true);
        btn.addEventListener('pointerdown', onBtn, true);
        btn.__avtRaidBound = true;
      }
      btn.style.display = 'block';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.style.zIndex = '60';
      if (btn.parentElement !== parent) parent.appendChild(btn);
    } catch (e) {}
  }

  function boot() {
    ensure();
    setTimeout(ensure, 300);
    setTimeout(ensure, 1000);
    setTimeout(ensure, 2500);
    setTimeout(ensure, 5000);
    window.addEventListener('orientationchange', function () { setTimeout(ensure, 150); });
    window.addEventListener('resize', function () { setTimeout(ensure, 150); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
