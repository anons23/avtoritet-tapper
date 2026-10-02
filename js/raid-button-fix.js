'use strict';
(function () {
  /* Guarantee the raid open button is present and opens the menu even if raids-ui.js failed to parse. */

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
          '<div><h2>⚔️ РЕЙДЫ</h2><p>Модуль рейдов загружается… Нажми ещё раз через секунду.</p></div>' +
          '<div class="raid-select-actions">' +
            '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="raid-fighter-list" id="raid-fighter-list">' +
          '<p style="padding:16px;color:#aaa">Если список пуст — обнови страницу (Ctrl+F5).</p>' +
        '</div>' +
      '</div>';
    var closeBtn = document.getElementById('raid-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        overlay.classList.remove('show', 'raid-fullscreen', 'raid-selection-fullscreen');
        overlay.classList.add('hidden');
      });
    }
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
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var attempts = 0;
          function open() {
            if (tryOpen()) return;
            if (attempts++ < 25) window.setTimeout(open, 120);
          }
          open();
        });
        parent.appendChild(btn);
      } else if (!btn.__avtRaidBound) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          tryOpen();
        });
      }
      btn.__avtRaidBound = true;
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
    setTimeout(ensure, 400);
    setTimeout(ensure, 1200);
    setTimeout(ensure, 3000);
    window.addEventListener('orientationchange', function () { setTimeout(ensure, 150); });
    window.addEventListener('resize', function () { setTimeout(ensure, 150); });
    window.addEventListener('avt-orientation', ensure);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
