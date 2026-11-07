/* platform.js v1.3 — RuStore back-button (modals first, exit last) */
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

  function isVisible(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains('hidden')) return false;
    try {
      var st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    return true;
  }

  function closeTopUi() {
    var onb = document.getElementById('onboarding-overlay');
    if (onb && isVisible(onb)) return true;

    var overlay = document.getElementById('modal-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      var close = document.getElementById('modal-close');
      var raidClose = document.getElementById('raid-menu-close');
      var raidBack = document.getElementById('raid-back');
      if (raidBack && overlay.classList.contains('raid-fullscreen')) {
        try { raidBack.click(); return true; } catch (e) {}
      }
      if (raidClose) {
        try { raidClose.click(); return true; } catch (e) {}
      }
      if (close) {
        try { close.click(); return true; } catch (e) {}
      }
      overlay.classList.add('hidden');
      overlay.classList.remove('show', 'raid-fullscreen', 'raid-selection-fullscreen');
      return true;
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
          if (!closed && typeof App.exitApp === 'function') App.exitApp();
        });
      }
    } catch (e) {}

    if (isAndroidApp) {
      try {
        history.pushState({ avt: 1 }, '');
        window.addEventListener('popstate', function () {
          var closed = closeTopUi();
          history.pushState({ avt: 1 }, '');
          if (!closed) {
            try {
              var App2 = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
              if (App2 && typeof App2.exitApp === 'function') App2.exitApp();
            } catch (err) {}
          }
        });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installBackHandlers);
  } else {
    installBackHandlers();
  }

  console.log('[platform] mode=', platform, 'adsOnly=', true, 'backHandlers=1.3');
})();
