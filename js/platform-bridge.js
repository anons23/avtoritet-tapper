'use strict';
(function () {
  // Platform-neutral adapter for the Android build.
  // Game progress is stored locally; cloud saves are not used in this build.
  const log = (...args) => console.debug('[PlatformBridge]', ...args);
  let adBusy = false;

  const bridge = {
    showFullscreenAd: function () {
      const ads = window.AndroidAds;
      if (adBusy || !ads || typeof ads.showFullscreenAd !== 'function') return false;
      adBusy = true;
      let released = false;
      const release = function () {
        if (released) return;
        released = true;
        adBusy = false;
      };
      try {
        // Native adapter may accept a completion callback. The timeout is a
        // fallback for providers that do not send one.
        ads.showFullscreenAd(release);
        window.setTimeout(release, 60000);
        return true;
      } catch (e) {
        release();
        log('fullscreen ad unavailable', e);
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
    const ads = window.AndroidAds;
    if (adBusy || !ads || typeof ads.showRewardedAd !== 'function') {
      log('rewarded ad unavailable: native Android ad adapter is not connected');
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
  log('local-save adapter initialized; native Android ads are not connected yet');
})();
