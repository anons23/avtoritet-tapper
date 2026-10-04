'use strict';
(function () {
  /* Guarantee the raid open button is present and opens the MENU (not a fight). */

  function closeOverlay() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('show', 'raid-fullscreen', 'raid-selection-fullscreen');
    overlay.classList.add('hidden');
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
    // Fallback: empty selection shell
    var overlay = document.getElementById('modal-overlay');
    var content = document.getElementById('modal-content');
    if (!overlay || !content) return false;
    overlay.classList.remove('hidden', 'raid-fullscreen');
    overlay.classList.add('show', 'raid-selection-fullscreen');
    content.innerHTML =
      '<div class="raid-select">' +
        '<div class="raid-select-head">' +
          '<div><h2>⚔️ РЕЙДЫ</h2><p>Загрузка бойцов…</p></div>' +
          '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button>' +
        '</div>' +
        '<div class="raid-fighter-list" id="raid-fighter-list"><p style="padding:16px;color:#aaa">Обнови страницу (Ctrl+F5), если список пуст.</p></div>' +
      '</div>';
    var closeBtn = document.getElementById('raid-menu-close');
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    return true;
  }

  function onBtn(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
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
        btn.innerHTML =
          '<span class="raid-btn-icon"><img src="./assets/raids/ui/raid-button.png" alt=""></span>' +
          '<span class="raid-btn-label">Рейды</span>';
        parent.appendChild(btn);
      } else if (!btn.querySelector('.raid-btn-label')) {
        var img = btn.querySelector('img');
        var src = img ? img.getAttribute('src') : './assets/raids/ui/raid-button.png';
        btn.innerHTML =
          '<span class="raid-btn-icon"><img src="'+src+'" alt=""></span>' +
          '<span class="raid-btn-label">Рейды</span>';
      }
      if (!btn.__avtRaidBound) {
        // Только click — pointerdown на Android «прокликивает» первого бойца
        btn.addEventListener('click', onBtn, true);
        btn.__avtRaidBound = true;
      }
      btn.style.display = 'flex';
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
