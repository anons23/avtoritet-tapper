/* ads-policy v1.9 (raid double button lives in raids-ui.js) — interstitial 3min; +2min grace after rewarded; tabs only; no fight */
'use strict';
(function () {
  var FULLSCREEN_CD = 180000; // 3 minutes between auto interstitials
  var REWARDED_GRACE = 120000; // 2 minutes after rewarded before any auto interstitial
  var LS_KEY = 'avt_ads_policy_v1';
  var lastFs = 0;
  var lastRewarded = 0;
  var sessionStartedAt = Date.now();
  var hasSavedFullscreenTime = false;
  var pendingFullscreen = false;
  var transitionTimer = 0;

  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (saved && typeof saved.lastFs === 'number') {
      lastFs = saved.lastFs;
      hasSavedFullscreenTime = true;
    }
    if (saved && typeof saved.lastRewarded === 'number') {
      lastRewarded = saved.lastRewarded;
    }
  } catch (e) {}

  if (!hasSavedFullscreenTime) {
    lastFs = Date.now();
  }

  function persist() {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ lastFs: lastFs, lastRewarded: lastRewarded })
      );
    } catch (e) {}
  }
  if (!hasSavedFullscreenTime) persist();

  function pauseMusic() {
    try {
      window.__AVT_AD_SHOWING = true;
      if (window.GameMusic && typeof window.GameMusic.pauseForAd === 'function') {
        window.GameMusic.pauseForAd();
      }
    } catch (e) {}
  }

  function inRaidFight() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return false;
    if (overlay.classList.contains('raid-selection-fullscreen')) return false;
    return overlay.classList.contains('raid-fullscreen');
  }

  function isBusyGameplay() {
    var br = window.PlatformBridge;
    if (br && typeof br.isAdBusy === 'function') {
      if (br.isAdBusy()) return true;
    } else if (window.__AVT_AD_SHOWING === true) return true;
    if (window.__AVT_ONBOARDING_ACTIVE === true) return true;
    if (inRaidFight()) return true;
    if (document.body && document.body.classList.contains('raid-fight-active')) return true;
    return false;
  }

  function canShowAd() {
    var now = Date.now();
    if (now - sessionStartedAt < FULLSCREEN_CD) return false;
    if (now - lastFs < FULLSCREEN_CD) return false;
    // After player watched rewarded — wait 2 more minutes before auto interstitial
    if (lastRewarded && now - lastRewarded < REWARDED_GRACE) return false;
    if (isBusyGameplay()) return false;
    return true;
  }
  function canFullscreen() {
    return canShowAd();
  }
  function markFullscreenShown() {
    lastFs = Date.now();
    pendingFullscreen = false;
    persist();
  }
  function markRewardedViewed() {
    lastRewarded = Date.now();
    persist();
    console.log('[ads-policy] rewarded grace 2min started');
  }

  function tryFullscreen(reason) {
    if (!canFullscreen()) {
      console.log('[ads-policy] fullscreen skip', reason);
      return false;
    }
    var bridge = window.PlatformBridge;
    var fn =
      bridge && typeof bridge.showFullscreenAd === 'function'
        ? bridge.showFullscreenAd
        : null;
    if (!fn && typeof window.showFullscreenAd === 'function') fn = window.showFullscreenAd;
    if (!fn) return false;
    try {
      // Do NOT pre-pause music / set __AVT_AD_SHOWING here: the wrapped bridge call
      // re-checks isBusyGameplay() and would refuse, leaving the flag stuck forever
      // (that broke both interstitials and music). The bridge pauses music itself.
      var ok = fn.call(bridge || window);
      if (ok !== false) {
        if (!(bridge && bridge.__adsPolicyWrapped)) markFullscreenShown();
        return true;
      }
    } catch (e) {
      console.warn('[ads-policy] fullscreen error', e);
    }
    return false;
  }

  function wrapBridgeFullscreen() {
    var bridge = window.PlatformBridge;
    if (!bridge || typeof bridge.showFullscreenAd !== 'function' || bridge.__adsPolicyWrapped) return;
    var orig = bridge.showFullscreenAd.bind(bridge);
    bridge.showFullscreenAd = function () {
      if (!canFullscreen()) return false;
      var ok = orig();
      if (ok !== false) markFullscreenShown();
      return ok;
    };
    bridge.__adsPolicyWrapped = true;
  }

  /* The raid "double reward" button lives in raids-ui.js (#raid-result-double).
     A second copy used to be injected here — two independent buttons let a player
     double the same win twice (x3), and its body-wide MutationObserver ran on every hit. */

  function refreshPending() {
    pendingFullscreen = canFullscreen();
    return pendingFullscreen;
  }

  function scheduleSafeTransition(reason, delay) {
    if (isBusyGameplay()) return;
    refreshPending();
    if (!pendingFullscreen) return;
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function () {
      if (isBusyGameplay()) return;
      refreshPending();
      if (!pendingFullscreen || !canFullscreen()) return;
      var shown = tryFullscreen(reason);
      if (shown) pendingFullscreen = false;
    }, typeof delay === 'number' ? delay : 450);
  }

  function boot() {
    wrapBridgeFullscreen();

    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('#btn-shop,#btn-rank,#btn-tasks,#btn-more,#settings-gear-button')) {
          if (isBusyGameplay()) return;
          scheduleSafeTransition('tab-open', 550);
        }
      },
      true
    );

    console.log(
      '[ads-policy] v1.7 interstitial 3min + 2min after rewarded; tabs only; no fight'
    );
  }

  window.AdsPolicy = {
    tryFullscreen: tryFullscreen,
    canFullscreen: canFullscreen,
    canShowAd: canShowAd,
    secondsUntilNextAd: function () {
      var now = Date.now();
      var a = FULLSCREEN_CD - (now - sessionStartedAt);
      var b = FULLSCREEN_CD - (now - lastFs);
      var c = lastRewarded ? REWARDED_GRACE - (now - lastRewarded) : 0;
      return Math.max(0, Math.ceil(Math.max(a, b, c) / 1000));
    },
    markRewardedViewed: markRewardedViewed,
    FULLSCREEN_CD: FULLSCREEN_CD,
    REWARDED_GRACE: REWARDED_GRACE,
    hasPendingFullscreen: function () {
      return pendingFullscreen;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
