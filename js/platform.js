/* platform.js v1.0 — RuStore / web build (no Yandex Games dependency) */
'use strict';
(function () {
  var ua = (navigator.userAgent || '').toLowerCase();
  var isCapacitor =
    !!(window.Capacitor && (window.Capacitor.isNativePlatform
      ? window.Capacitor.isNativePlatform()
      : window.Capacitor.platform && window.Capacitor.platform !== 'web'));
  var isAndroidApp = isCapacitor || /; wv\)/.test(ua) || !!window.AndroidBridge;
  var platform = isAndroidApp ? 'rustore' : 'web';

  window.AVT_PLATFORM = platform;
  window.AVT_IS_NATIVE = isAndroidApp;
  window.AVT_ADS_ONLY = true;

  document.documentElement.setAttribute('data-platform', platform);
  if (isAndroidApp) document.documentElement.classList.add('platform-native');

  if (isAndroidApp) {
    document.addEventListener('backbutton', function (e) {
      var overlay = document.getElementById('modal-overlay');
      if (overlay && !overlay.classList.contains('hidden')) {
        e.preventDefault();
        var close = document.getElementById('modal-close');
        if (close) close.click();
        else overlay.classList.add('hidden');
      }
    }, false);
  }

  console.log('[platform] mode=', platform, 'adsOnly=', true);
})();
