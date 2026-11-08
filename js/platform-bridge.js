/* platform-bridge.js — Capacitor YandexAds + legacy AndroidAds */
'use strict';
(function () {
  const log = function () {
    try {
      var args = ['[PlatformBridge]'].concat([].slice.call(arguments));
      console.log.apply(console, args);
    } catch (e) {}
  };
  var adBusy = false;

  function pauseMusicForAd() {
    try {
      if (window.GameMusic && typeof window.GameMusic.pauseForAd === 'function') {
        window.GameMusic.pauseForAd();
      }
    } catch (e) { log('music pause failed', e); }
  }

  function resumeMusicAfterAd() {
    try {
      if (window.GameMusic && typeof window.GameMusic.resumeAfterAd === 'function') {
        window.GameMusic.resumeAfterAd();
      }
    } catch (e) { log('music resume failed', e); }
  }

  function markRewardedViewed() {
    try {
      if (window.AdsPolicy && typeof window.AdsPolicy.markRewardedViewed === 'function') {
        window.AdsPolicy.markRewardedViewed();
      }
    } catch (e) { log('rewarded cooldown mark failed', e); }
  }

  function cfg() {
    return window.AVT_ADS_CONFIG || {
      rewardedBlockId: 'R-M-20344973-1',
      interstitialBlockId: 'R-M-20344973-2',
      useMockOnWeb: true
    };
  }

  function isNative() {
    try {
      var cap = window.Capacitor;
      if (!cap) return !!(window.AndroidAds);
      if (typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) return true;
      if (typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web') return true;
      return false;
    } catch (e) {
      return !!window.AndroidAds;
    }
  }

  function capacitorAds() {
    try {
      var cap = window.Capacitor;
      if (!cap || !cap.Plugins) return null;
      return cap.Plugins.YandexAds || null;
    } catch (e) {
      return null;
    }
  }

  function diagnose() {
    var plugin = capacitorAds();
    var legacy = window.AndroidAds;
    log(
      'diag native=', isNative(),
      'plugin=', !!(plugin && typeof plugin.showRewardedAd === 'function'),
      'legacy=', !!(legacy && (typeof legacy.showRewardedAd === 'function' || typeof legacy.showRewarded === 'function')),
      'rewardedId=', cfg().rewardedBlockId
    );
  }

  window.PlatformBridge = {
    showFullscreenAd: function () {
      if (adBusy) return false;
      var blockId = cfg().interstitialBlockId;
      var plugin = capacitorAds();
      var legacy = window.AndroidAds;

      if (plugin && typeof plugin.showInterstitialAd === 'function') {
        adBusy = true;
        pauseMusicForAd();
        plugin.showInterstitialAd({ blockId: blockId })
          .catch(function (err) { log('interstitial failed', err); })
          .finally(function () { adBusy = false; resumeMusicAfterAd(); });
        return true;
      }
      if (legacy) {
        var method = legacy.showFullscreenAd || legacy.showInterstitial;
        if (typeof method !== 'function') return false;
        adBusy = true;
        pauseMusicForAd();
        try {
          method.call(legacy, blockId, function () { adBusy = false; resumeMusicAfterAd(); });
          setTimeout(function () { if (adBusy) { adBusy = false; resumeMusicAfterAd(); } }, 90000);
          return true;
        } catch (e) {
          adBusy = false;
          resumeMusicAfterAd();
          log('fullscreen failed', e);
          return false;
        }
      }
      log('fullscreen unavailable — native plugin missing');
      return false;
    },
    getSDK: function () { return null; },
    queueSave: function () {},
    flushSave: function () {},
    resetCloudData: async function () { return true; },
    diagnose: diagnose
  };

  window.showRewardedAd = function (onReward) {
    var done = typeof onReward === 'function' ? onReward : function () {};
    if (adBusy) {
      log('rewarded busy');
      done(false);
      return false;
    }

    var blockId = cfg().rewardedBlockId;
    var plugin = capacitorAds();
    var legacy = window.AndroidAds;

    if (plugin && typeof plugin.showRewardedAd === 'function') {
      adBusy = true;
      pauseMusicForAd();
      log('rewarded via Capacitor YandexAds, block=', blockId);
      plugin.showRewardedAd({ blockId: blockId })
        .then(function (result) {
          var ok = !!(result && result.rewarded === true);
          log('rewarded result', ok, result);
          if (ok) markRewardedViewed();
          done(ok);
        })
        .catch(function (err) {
          log('rewarded plugin error', err);
          done(false);
        })
        .finally(function () { adBusy = false; resumeMusicAfterAd(); });
      return true;
    }

    if (legacy && (typeof legacy.showRewardedAd === 'function' || typeof legacy.showRewarded === 'function')) {
      adBusy = true;
      log('rewarded via legacy AndroidAds, block=', blockId);
      var finished = false;
      pauseMusicForAd();
      var finish = function (rewarded) {
        if (finished) return;
        finished = true;
        adBusy = false;
        if (rewarded === true) markRewardedViewed();
        done(rewarded === true);
        resumeMusicAfterAd();
      };
      try {
        if (typeof legacy.showRewardedAd === 'function') {
          legacy.showRewardedAd(blockId, finish);
        } else {
          legacy.showRewarded({
            blockId: blockId,
            onRewarded: function () { finish(true); },
            onClosed: function (ok) { finish(!!ok); },
            onError: function () { finish(false); }
          });
        }
        setTimeout(function () { if (!finished) finish(false); }, 90000);
        return true;
      } catch (e) {
        log('legacy rewarded failed', e);
        finish(false);
        return false;
      }
    }

    if (!isNative() && cfg().useMockOnWeb === true) {
      log('rewarded browser mock');
      adBusy = true;
      pauseMusicForAd();
      setTimeout(function () {
        adBusy = false;
        done(true);
        resumeMusicAfterAd();
      }, 700);
      return true;
    }

    diagnose();
    log('rewarded UNAVAILABLE — rebuild APK with npm run android:sync');
    done(false);
    return false;
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      try {
        if (typeof window.saveGame === 'function') window.saveGame();
      } catch (e) {}
    }
  });

  setTimeout(function () {
    if (isNative()) diagnose();
  }, 1500);

  log('ready; rewarded=', cfg().rewardedBlockId, 'interstitial=', cfg().interstitialBlockId, 'native=', isNative());
})();
