/* ads-adapter.js v1.0 — RuStore ads-only (mock until native SDK)
   Compatibility: window.showRewardedAd, window.YandexGameBridge */
'use strict';
(function () {
  var adBusy = false;
  var sessionId = 0;
  var MOCK_REWARD = true;
  var MOCK_DELAY_MS = 600;

  function log() {
    if (window.console && console.debug) {
      console.debug.apply(console, ['[ads-adapter]'].concat([].slice.call(arguments)));
    }
  }

  function gameplayStart() {
    try {
      if (window.AVT_Gameplay && typeof window.AVT_Gameplay.start === 'function') {
        window.AVT_Gameplay.start();
      }
    } catch (e) {}
  }

  function gameplayStop() {
    try {
      if (window.AVT_Gameplay && typeof window.AVT_Gameplay.stop === 'function') {
        window.AVT_Gameplay.stop();
      }
    } catch (e) {}
  }

  function nativeRewarded(onDone) {
    if (window.AndroidAds && typeof window.AndroidAds.showRewarded === 'function') {
      try {
        window.AndroidAds.showRewarded({
          onRewarded: function () { onDone(true); },
          onClosed: function (ok) { onDone(!!ok); },
          onError: function () { onDone(false); }
        });
        return true;
      } catch (e) {
        log('native rewarded error', e);
      }
    }
    return false;
  }

  function nativeInterstitial(onDone) {
    if (window.AndroidAds && typeof window.AndroidAds.showInterstitial === 'function') {
      try {
        window.AndroidAds.showInterstitial({
          onClosed: function () { onDone(true); },
          onError: function () { onDone(false); }
        });
        return true;
      } catch (e) {
        log('native interstitial error', e);
      }
    }
    return false;
  }

  function mockRewarded(onDone) {
    log('mock rewarded (ads-only build)');
    setTimeout(function () { onDone(MOCK_REWARD); }, MOCK_DELAY_MS);
  }

  function mockInterstitial(onDone) {
    log('mock interstitial');
    setTimeout(function () { onDone(true); }, 400);
  }

  window.showRewardedAd = function (onReward) {
    if (adBusy) {
      if (typeof onReward === 'function') onReward(false);
      return false;
    }
    adBusy = true;
    var sid = ++sessionId;
    var finished = false;
    gameplayStop();

    function done(ok) {
      if (sid !== sessionId || finished) return;
      finished = true;
      adBusy = false;
      gameplayStart();
      if (typeof onReward === 'function') onReward(!!ok);
    }

    if (nativeRewarded(done)) return true;
    mockRewarded(done);
    return true;
  };

  function showFullscreenAd() {
    if (adBusy) return false;
    adBusy = true;
    var sid = ++sessionId;
    gameplayStop();
    function done() {
      if (sid !== sessionId) return;
      adBusy = false;
      gameplayStart();
    }
    if (nativeInterstitial(function () { done(); })) return true;
    mockInterstitial(function () { done(); });
    return true;
  }

  window.YandexGameBridge = {
    getSDK: function () { return null; },
    queueSave: function () {},
    flushSave: function () {},
    resetCloudData: function () { return Promise.resolve(false); },
    showFullscreenAd: showFullscreenAd
  };

  window.YandexGameReady = Promise.resolve(null);

  window.AVT_Ads = {
    showRewarded: window.showRewardedAd,
    showInterstitial: showFullscreenAd,
    setMock: function (enabled) { MOCK_REWARD = !!enabled; },
    isBusy: function () { return adBusy; },
    platform: function () { return window.AVT_PLATFORM || 'web'; }
  };

  log('ready, platform=', window.AVT_PLATFORM || 'web', 'mock=', MOCK_REWARD);
})();
