'use strict';
(function () {
  // Platform-neutral bridge for the RuStore/Android build.
  // Progress remains in localStorage; cloud saves are intentionally disabled.
  const log = (...args) => console.debug('[PlatformBridge]', ...args);
  let adBusy = false;

  window.YandexGameReady = Promise.resolve(null);
  window.YandexGameBridge = {
    getSDK: () => null,
    queueSave: () => {},
    flushSave: () => {},
    resetCloudData: async () => true,
    showFullscreenAd: function () {
      const ads = window.AndroidAds;
      if (adBusy || !ads || typeof ads.showFullscreenAd !== 'function') return false;
      adBusy = true;
      try {
        ads.showFullscreenAd();
        window.setTimeout(() => { adBusy = false; }, 1000);
        return true;
      } catch (e) {
        adBusy = false;
        log('fullscreen ad unavailable', e);
        return false;
      }
    }
  };

  window.showRewardedAd = function (onReward) {
    const done = typeof onReward === 'function' ? onReward : function () {};
    const ads = window.AndroidAds;
    if (adBusy || !ads || typeof ads.showRewardedAd !== 'function') {
      log('rewarded ad unavailable: Android ad provider is not connected');
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
      ads.showRewardedAd(finish);
      window.setTimeout(() => finish(false), 60000);
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
  log('local-save bridge initialized; Android ads require native SDK bridge');
})();