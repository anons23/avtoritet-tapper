'use strict';
(function () {
  /* Raid open button: transparent icon (webm + fallbacks), opens MENU not fight. */

  var ICON_SRC_WEBM = './assets/raids/raid_icon_transparent.webm';
  var ICON_SRC_WEBP = './assets/raids/raid_icon_transparent.webp';
  var ICON_SRC_OLD = './assets/raids/ui/raid-button.webp';

  function iconHtml() {
    return (
      '<span class="raid-btn-icon">' +
        '<video class="raid-btn-media" autoplay muted loop playsinline webkit-playsinline disablepictureinpicture' +
        ' preload="auto" aria-hidden="true">' +
          '<source src="' + ICON_SRC_WEBM + '" type="video/webm">' +
        '</video>' +
        '<img class="raid-btn-fallback" src="' + ICON_SRC_WEBP + '" alt=""' +
        ' onerror="this.onerror=null;this.src=\'' + ICON_SRC_OLD + '\'">' +
      '</span>' +
      '<span class="raid-btn-label">Рейды</span>'
    );
  }

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

  function styleTransparent(btn) {
    if (!btn) return;
    btn.style.background = 'transparent';
    btn.style.backgroundColor = 'transparent';
    btn.style.border = '0';
    btn.style.boxShadow = 'none';
    btn.style.webkitAppearance = 'none';
    btn.style.appearance = 'none';
  }

  function ensureMedia(btn) {
    var video = btn.querySelector('video.raid-btn-media');
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.addEventListener('error', function () {
        video.style.display = 'none';
        var fb = btn.querySelector('.raid-btn-fallback');
        if (fb) fb.style.display = 'block';
      });
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
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
        btn.innerHTML = iconHtml();
        parent.appendChild(btn);
      } else {
        var hasNew =
          btn.querySelector('video.raid-btn-media') ||
          (btn.querySelector('img.raid-btn-fallback') &&
            (btn.querySelector('img.raid-btn-fallback').getAttribute('src') || '').indexOf('raid_icon_transparent') >= 0);
        if (!hasNew || !btn.querySelector('.raid-btn-label')) {
          btn.innerHTML = iconHtml();
        }
      }
      if (!btn.__avtRaidBound) {
        btn.addEventListener('click', onBtn, true);
        btn.__avtRaidBound = true;
      }
      styleTransparent(btn);
      ensureMedia(btn);
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
