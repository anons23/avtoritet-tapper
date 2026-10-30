'use strict';
(function () {
  // Web game stays platform-neutral. Android ads are provided by a native Capacitor plugin.
  const log = (...args) => console.debug('[PlatformBridge]', ...args);
  let adBusy = false;

  function cfg() {
    return window.AVT_ADS_CONFIG || {
      rewardedBlockId: 'R-M-20297973-1',
      interstitialBlockId: 'R-M-20297973-2',
      useMockOnWeb: true
    };
  }

  function nativePlatform() {
    try {
      const cap = window.Capacitor;
      return !!(cap && ((typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) ||
        (typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web')));
    } catch (e) { return false; }
  }

  function nativeAds() {
    if (window.AndroidAds) return window.AndroidAds;
    try {
      const cap = window.Capacitor;
      if (cap && cap.Plugins && cap.Plugins.YandexAds) return cap.Plugins.YandexAds;
    } catch (e) {}
    return null;
  }

  const bridge = {
    showFullscreenAd: function () {
      const ads = nativeAds();
      const blockId = cfg().interstitialBlockId;
      if (adBusy) return false;
      if (!ads) {
        log('fullscreen unavailable: native Yandex Ads plugin is not connected');
        return false;
      }
      const method = typeof ads.showInterstitialAd === 'function'
        ? ads.showInterstitialAd.bind(ads)
        : (typeof ads.showFullscreenAd === 'function'
          ? ads.showFullscreenAd.bind(ads)
          : (typeof ads.showInterstitial === 'function' ? ads.showInterstitial.bind(ads) : null));
      if (!method) return false;
      adBusy = true;
      try {
        const result = method({ blockId: blockId });
        if (result && typeof result.then === 'function') {
          result.then(() => log('interstitial closed')).catch(err => log('interstitial failed', err))
            .finally(() => { adBusy = false; });
        } else {
          window.setTimeout(() => { adBusy = false; }, 90000);
        }
        return true;
      } catch (e) {
        adBusy = false;
        log('fullscreen ad failed', e);
        return false;
      }
    },
    getSDK: () => null,
    queueSave: () => {},
    flushSave: () => {},
    resetCloudData: async () => true
  };

  window.PlatformBridge = bridge;

  window.showRewardedAd = function (onReward) {
    const done = typeof onReward === 'function' ? onReward : function () {};
    const ads = nativeAds();
    const blockId = cfg().rewardedBlockId;

    if (adBusy) {
      done(false);
      return false;
    }

    if (!ads) {
      // The mock is intentionally browser-only. It can never grant rewards inside the APK.
      if (!nativePlatform() && cfg().useMockOnWeb === true) {
        log('rewarded browser mock (no real ad impression)');
        adBusy = true;
        window.setTimeout(function () {
          adBusy = false;
          done(true);
        }, 700);
        return true;
      }
      log('rewarded unavailable: native Yandex Ads plugin is missing');
      done(false);
      return false;
    }

    const show = typeof ads.showRewardedAd === 'function'
      ? ads.showRewardedAd.bind(ads)
      : (typeof ads.showRewarded === 'function' ? ads.showRewarded.bind(ads) : null);
    if (!show) {
      done(false);
      return false;
    }

    adBusy = true;
    let finished = false;
    const finish = function (rewarded) {
      if (finished) return;
      finished = true;
      adBusy = false;
      done(rewarded === true);
    };

    try {
      // Capacitor plugin returns a Promise; old AndroidAds adapters may use callbacks.
      if (ads.showRewardedAd && show === ads.showRewardedAd.bind(ads)) {
        // Kept for compatibility with legacy adapters below.
      }
      const result = show({ blockId: blockId }, finish);
      if (result && typeof result.then === 'function') {
        result.then(value => finish(!!(value && value.rewarded === true)))
          .catch(err => { log('rewarded ad failed', err); finish(false); });
      } else if (typeof result === 'boolean' && result === false) {
        finish(false);
      }
      return true;
    } catch (e) {
      log('rewarded ad failed', e);
      finish(false);
      return false;
    }
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      try { if (typeof window.saveGame === 'function') window.saveGame(); } catch (e) {}
    }
  });

  log('ready; rewarded=', cfg().rewardedBlockId, 'interstitial=', cfg().interstitialBlockId,
    'native=', nativePlatform());
})();
