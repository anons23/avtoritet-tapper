'use strict';
(function () {
  // Platform-neutral adapter for the Android / RuStore build.
  // Game progress is stored locally; ads go through native Yandex Mobile Ads SDK.
  const log = (...args) => console.debug('[PlatformBridge]', ...args);
  let adBusy = false;

  function cfg() {
    return window.AVT_ADS_CONFIG || {
      rewardedBlockId: 'R-M-20297973-1',
      interstitialBlockId: 'R-M-20297973-2'
    };
  }

  function releaseBusySoon(ms) {
    window.setTimeout(function () { adBusy = false; }, ms || 60000);
  }

  const bridge = {
    showFullscreenAd: function () {
      const ads = window.AndroidAds;
      const blockId = cfg().interstitialBlockId;
      if (adBusy) return false;
      if (!ads) {
        log('fullscreen: AndroidAds missing (web/mock)');
        return false;
      }
      adBusy = true;
      let released = false;
      const release = function () {
        if (released) return;
        released = true;
        adBusy = false;
      };
      try {
        if (typeof ads.showFullscreenAd === 'function') {
          ads.showFullscreenAd(blockId, release);
        } else if (typeof ads.showInterstitial === 'function') {
          ads.showInterstitial(blockId, release);
        } else {
          release();
          return false;
        }
        releaseBusySoon(90000);
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
    const blockId = cfg().rewardedBlockId;

    if (adBusy) {
      done(false);
      return false;
    }

    // Нет нативного моста — mock только если явно разрешён (для тестов в браузере)
    if (!ads || (typeof ads.showRewardedAd !== 'function' && typeof ads.showRewarded !== 'function')) {
      if (cfg().useMockOnWeb !== false && !window.Capacitor && !window.AndroidAds) {
        log('rewarded mock (no native SDK)');
        adBusy = true;
        window.setTimeout(function () {
          adBusy = false;
          done(true);
        }, 700);
        return true;
      }
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
      if (typeof ads.showRewardedAd === 'function') {
        ads.showRewardedAd(blockId, finish);
      } else if (typeof ads.showRewarded === 'function') {
        ads.showRewarded({
          blockId: blockId,
          onRewarded: function () { finish(true); },
          onClosed: function (ok) { finish(!!ok); },
          onError: function () { finish(false); }
        });
      }
      releaseBusySoon(90000);
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

  log('ready; rewarded=', cfg().rewardedBlockId, 'interstitial=', cfg().interstitialBlockId);
})();
