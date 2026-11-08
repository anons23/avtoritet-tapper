/* platform.js v1.4 — native Android back navigation */
'use strict';
(function () {
  var ua = (navigator.userAgent || '').toLowerCase();
  var isCapacitor =
    !!(window.Capacitor && (window.Capacitor.isNativePlatform
      ? window.Capacitor.isNativePlatform()
      : window.Capacitor.getPlatform && window.Capacitor.getPlatform() !== 'web'));
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
      var raidBack = document.getElementById('raid-back');
      var raidClose = document.getElementById('raid-menu-close');
      var close = document.getElementById('modal-close');
      if (raidBack && overlay.classList.contains('raid-fullscreen')) {
        try { raidBack.click(); return true; } catch (e) {}
      }
      if (raidClose && isVisible(raidClose)) {
        try { raidClose.click(); return true; } catch (e) {}
      }
      if (close && isVisible(close)) {
        try { close.click(); return true; } catch (e) {}
      }
      overlay.classList.add('hidden');
      overlay.classList.remove('show', 'raid-fullscreen', 'raid-selection-fullscreen');
      return true;
    }
    return false;
  }

  function getAppPlugin() {
    try {
      if (window.Capacitor && typeof window.Capacitor.registerPlugin === 'function') {
        return window.Capacitor.registerPlugin('App');
      }
      if (window.Capacitor && window.Capacitor.Plugins) {
        return window.Capacitor.Plugins.App || null;
      }
    } catch (e) {}
    return null;
  }

  function installBackHandlers() {
    // Capacitor App plugin intercepts Android's native back action.
    var App = isAndroidApp ? getAppPlugin() : null;
    if (App && typeof App.addListener === 'function') {
      App.addListener('backButton', function () {
        if (!closeTopUi()) {
          // On the main game screen, send the app to background instead of destroying it.
          if (typeof App.minimizeApp === 'function') {
            App.minimizeApp().catch(function (e) {
              console.warn('[platform] minimizeApp failed', e);
            });
          }
        }
      }).catch(function (e) {
        console.warn('[platform] backButton listener failed', e);
      });
    }

    // Fallback for native WebViews which dispatch the legacy DOM event.
    document.addEventListener('backbutton', function (e) {
      if (closeTopUi() && e && e.preventDefault) e.preventDefault();
    }, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installBackHandlers, { once: true });
  } else {
    installBackHandlers();
  }

  console.log('[platform] mode=', platform, 'adsOnly=', true, 'backHandlers=1.4');
})();
