'use strict';
(function () {
  const log = (...args) => console.debug('[PlatformBridge]', ...args);
  let adBusy = false;

  function cfg() {
    return window.AVT_ADS_CONFIG || {
      rewardedBlockId: 'R-M-20297973-1',
      interstitialBlockId: 'R-M-20297973-2',
      useMockOnWeb: true
    };
  }

  function isNative() {
    try {
      const cap = window.Capacitor;
      return !!(cap && ((typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) ||
        (typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web')));
    } catch (e) { return false; }
  }

  function capacitorAds() {
    try {
      const cap = window.Capacitor;
      return cap && cap.Plugins && cap.Plugins.YandexAds ? cap.Plugins.YandexAds : null;
    } catch (e) { return null; }
  }

  const bridge = {
    showFullscreenAd: function () {
      if (adBusy) return false;
      const blockId = cfg().interstitialBlockId;
      const plugin = capacitorAds();
      const legacy = window.AndroidAds;
      if (plugin && typeof plugin.showInterstitialAd === 'function') {
        adBusy = true;
        plugin.showInterstitialAd({ blockId }).catch(err => log('interstitial failed', err))
          .finally(() => { adBusy = false; });
        return true;
      }
      if (legacy) {
        const method = legacy.showFullscreenAd || legacy.showInterstitial;
        if (typeof method !== 'function') return false;
        adBusy = true;
        try {
          method.call(legacy, blockId, () => { adBusy = false; });
          window.setTimeout(() => { adBusy = false; }, 90000);
          return true;
        } catch (e) {
          adBusy = false;
          log('fullscreen ad failed', e);
          return false;
        }
      }
      log('fullscreen unavailable: native Yandex Ads plugin is not connected');
      return false;
    },
    getSDK: () => null,
    queueSave: () => {},
    flushSave: () => {},
    resetCloudData: async () => true
  };

  window.PlatformBridge = bridge;

  window.showRewardedAd = function (onReward) {
    const done = typeof onReward === 'function' ? onReward : function () {};
    if (adBusy) { done(false); return false; }

    const blockId = cfg().rewardedBlockId;
    const plugin = capacitorAds();
    const legacy = window.AndroidAds;

    if (plugin && typeof plugin.showRewardedAd === 'function') {
      adBusy = true;
      plugin.showRewardedAd({ blockId })
        .then(result => done(!!(result && result.rewarded === true)))
        .catch(err => { log('rewarded ad failed', err); done(false); })
        .finally(() => { adBusy = false; });
      return true;
    }

    if (legacy && (typeof legacy.showRewardedAd === 'function' || typeof legacy.showRewarded === 'function')) {
      adBusy = true;
      let finished = false;
      const finish = rewarded => {
        if (finished) return;
        finished = true;
        adBusy = false;
        done(rewarded === true);
      };
      try {
        if (typeof legacy.showRewardedAd === 'function') legacy.showRewardedAd(blockId, finish);
        else legacy.showRewarded({
          blockId,
          onRewarded: () => finish(true),
          onClosed: ok => finish(!!ok),
          onError: () => finish(false)
        });
        window.setTimeout(() => { if (!finished) finish(false); }, 90000);
        return true;
      } catch (e) {
        log('legacy rewarded ad failed', e);
        finish(false);
        return false;
      }
    }

    // The mock is only for desktop/mobile browsers. It can never grant rewards inside an APK.
    if (!isNative() && cfg().useMockOnWeb === true) {
      log('rewarded browser mock (no real ad impression)');
      adBusy = true;
      window.setTimeout(() => { adBusy = false; done(true); }, 700);
      return true;
    }

    log('rewarded unavailable: native Yandex Ads plugin is missing');
    done(false);
    return false;
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      try { if (typeof window.saveGame === 'function') window.saveGame(); } catch (e) {}
    }
  });

  log('ready; rewarded=', cfg().rewardedBlockId, 'interstitial=', cfg().interstitialBlockId,
    'native=', isNative());
})();
