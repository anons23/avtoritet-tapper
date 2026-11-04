/* platform.js v1.2 — RuStore back-button + platform flags */
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

  function closeTopUi() {
    var overlay = document.getElementById('modal-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      var close = document.getElementById('modal-close');
      if (close) {
        close.click();
        return true;
      }
      overlay.classList.add('hidden');
      overlay.classList.remove('show', 'raid-fullscreen', 'raid-selection-fullscreen');
      return true;
    }
    var onb = document.getElementById('onboarding-overlay');
    if (onb && onb.style.display !== 'none') {
      try {
        if (window.getComputedStyle(onb).display !== 'none') return true;
      } catch (e) {
        return true;
      }
    }
    return false;
  }

  function installBackHandlers() {
    document.addEventListener('backbutton', function (e) {
      if (closeTopUi()) {
        if (e && e.preventDefault) e.preventDefault();
      }
    }, false);

    try {
      var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (App && typeof App.addListener === 'function') {
        App.addListener('backButton', function () {
          var closed = closeTopUi();
          if (!closed && App.exitApp) App.exitApp();
        });
      }
    } catch (e) {}

    if (isAndroidApp) {
      try {
        history.pushState({ avt: 1 }, '');
        window.addEventListener('popstate', function () {
          closeTopUi();
          history.pushState({ avt: 1 }, '');
        });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installBackHandlers);
  } else {
    installBackHandlers();
  }

  console.log('[platform] mode=', platform, 'adsOnly=', true, 'backHandlers=1');
})();
