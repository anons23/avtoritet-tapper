'use strict';
(function () {
  /* TEST ONLY — hard reset local + Yandex cloud save. Remove before release. */
  const KEYS = [
    'avtoritet_save_v2',
    'avtoritet_save_v2_backup',
    'avtoritet_health_v3',
    'avtoritet_save_clock_v1',
    'avtoritet_save_conflict_local_v1',
    'avtoritet_save_conflict_cloud_v1',
    'avt_music_muted',
    'avt_main_track'
  ];

  function wipeLocal() {
    KEYS.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    /* Also clear any other avtoritet_ / avt_ leftovers */
    try {
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key) continue;
        if (key.indexOf('avtoritet_') === 0 || key.indexOf('avt_') === 0) toRemove.push(key);
      }
      toRemove.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });
    } catch (e) {}
  }

  async function hardReset() {
    var ok = window.confirm(
      'TEST: полный сброс прогресса?\n\n' +
      '• localStorage\n' +
      '• облако Яндекс.Игр\n\n' +
      'Это нельзя отменить.'
    );
    if (!ok) return;

    var btn = document.getElementById('test-reset-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '…';
    }

    wipeLocal();

    try {
      if (window.YandexGameBridge && typeof window.YandexGameBridge.resetCloudData === 'function') {
        await window.YandexGameBridge.resetCloudData();
      }
    } catch (e) {
      console.warn('[TEST RESET] cloud wipe failed', e);
    }

    /* Prevent beforeunload from re-saving current in-memory state */
    try {
      window.onbeforeunload = null;
      window.onpagehide = null;
    } catch (e) {}

    wipeLocal();
    location.reload();
  }

  function injectStyles() {
    if (document.getElementById('test-reset-style')) return;
    var s = document.createElement('style');
    s.id = 'test-reset-style';
    s.textContent =
      '#test-reset-btn{' +
      'margin-left:8px;padding:3px 8px;border:1px solid rgba(255,100,100,.55);' +
      'border-radius:8px;background:rgba(80,16,16,.85);color:#ffb4b4;' +
      'font:700 10px/1.2 system-ui,sans-serif;cursor:pointer;vertical-align:middle;' +
      'letter-spacing:.3px;text-transform:uppercase;' +
      '}' +
      '#test-reset-btn:active{transform:scale(.95)}' +
      '#test-reset-btn:disabled{opacity:.55;cursor:wait}' +
      '@media (max-width:700px){#test-reset-btn{font-size:9px;padding:2px 6px}}' +
      '@media (orientation:landscape) and (max-height:700px){#test-reset-btn{font-size:8px;padding:2px 5px}}';
    document.head.appendChild(s);
  }

  function mount() {
    var badge = document.getElementById('test-version');
    if (!badge) return;
    if (document.getElementById('test-reset-btn')) return;
    injectStyles();
    var btn = document.createElement('button');
    btn.id = 'test-reset-btn';
    btn.type = 'button';
    btn.title = 'TEST: сбросить прогресс (local + cloud)';
    btn.textContent = 'Сброс';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      hardReset();
    });
    badge.insertAdjacentElement('afterend', btn);
  }

  function boot() {
    mount();
    setTimeout(mount, 500);
    setTimeout(mount, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
