'use strict';
/* TEMP for video recording: no progress. Delete this file + index script tag after filming. */
(function () {
  window.__AVT_NO_SAVE = true;
  window.__AVT_RESET_LOCK = true;
  function wipe() {
    try {
      [
        'avtoritet_save_v2',
        'avtoritet_save_v2_backup',
        'avtoritet_save_v3',
        'avtoritet_health_v3'
      ].forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });
    } catch (e) {}
    try {
      sessionStorage.setItem('avt_force_fresh', '1');
      sessionStorage.setItem('avt_skip_cloud_once', '1');
    } catch (e) {}
  }
  wipe();
  setInterval(wipe, 2000);
  function patch() {
    window.__AVT_RESET_LOCK = true;
    window.saveGame = function () {};
    if (typeof window.YandexGameBridge === 'object' && window.YandexGameBridge) {
      window.YandexGameBridge.queueSave = function () {};
      window.YandexGameBridge.flushSave = function () {};
    }
  }
  patch();
  setInterval(patch, 1000);
  console.log('[NO_SAVE] progress disabled for video recording');
})();
