/* platform.js v1.6 — native + WebView history back navigation */
'use strict';
(function () {
  var ua = (navigator.userAgent || '').toLowerCase();
  var isCapacitor =
    !!(window.Capacitor && (window.Capacitor.isNativePlatform
      ? window.Capacitor.isNativePlatform()
      : window.Capacitor.getPlatform && window.Capacitor.getPlatform() !== 'web'));
  if (!isCapacitor && window.Capacitor && window.capacitorApp && window.capacitorApp.App) isCapacitor = true;
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
      // The standalone web build loads the official @capacitor/app proxy as a browser script.
      if (window.capacitorApp && window.capacitorApp.App) return window.capacitorApp.App;
      if (window.Capacitor && typeof window.Capacitor.registerPlugin === 'function') {
        return window.Capacitor.registerPlugin('App');
      }
      if (window.Capacitor && window.Capacitor.Plugins) {
        return window.Capacitor.Plugins.App || null;
      }
    } catch (e) {}
    return null;
  }

  function minimizeApp(App) {
    try {
      if (App && typeof App.minimizeApp === 'function') {
        var result = App.minimizeApp();
        if (result && typeof result.catch === 'function') result.catch(function (e) {
          console.warn('[platform] minimizeApp failed', e);
        });
      }
    } catch (e) { console.warn('[platform] minimizeApp failed', e); }
  }

  function installHistoryBackGuard(App) {
    if (!isAndroidApp || window.__AVT_BACK_HISTORY_GUARD) return;
    window.__AVT_BACK_HISTORY_GUARD = true;
    try {
      // Capacitor's default back handler calls WebView.goBack() when no JS listener
      // is registered. Keep one harmless history entry so Back becomes popstate.
      window.history.replaceState({ avtBackGuard: true }, document.title, window.location.href);
      window.history.pushState({ avtBackGuard: true }, document.title, window.location.href);
      window.addEventListener('popstate', function () {
        var closed = closeTopUi();
        if (!closed) minimizeApp(App);
        try { window.history.pushState({ avtBackGuard: true }, document.title, window.location.href); } catch (e) {}
      });
      console.log('[platform] WebView history back guard installed');
    } catch (e) { console.warn('[platform] history back guard failed', e); }
  }

  function installBackHandlers() {
    var App = isAndroidApp ? getAppPlugin() : null;
    var listenerInstalled = false;
    if (App && typeof App.addListener === 'function') {
      try {
        var registration = App.addListener('backButton', function () {
          if (!closeTopUi()) minimizeApp(App);
        });
        if (registration && typeof registration.then === 'function') {
          registration.then(function () {
            listenerInstalled = true;
            console.log('[platform] native backButton listener registered');
          }).catch(function (e) {
            console.warn('[platform] backButton listener failed', e);
          });
        } else {
          listenerInstalled = true;
        }
      } catch (e) { console.warn('[platform] backButton registration error', e); }
    }

    // Fallback if the native plugin listener is unavailable or fails to register.
    installHistoryBackGuard(App);
    document.addEventListener('backbutton', function (e) {
      // The native App listener may already have closed the screen before
      // Capacitor dispatches this compatibility DOM event. Never minimize here.
      if (closeTopUi() && e && e.preventDefault) e.preventDefault();
    }, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installBackHandlers, { once: true });
  } else {
    installBackHandlers();
  }

  console.log('[platform] mode=', platform, 'adsOnly=', true, 'backHandlers=1.6', 'appPlugin=', !!(getAppPlugin()));
})();
