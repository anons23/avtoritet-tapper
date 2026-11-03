/* ads-config.js — Yandex Mobile Ads (RuStore) */
'use strict';
(function () {
  window.AVT_ADS_CONFIG = {
    appId: '20297973',
    packageName: 'ru.avtoritet.game',

    // Боевые блоки из кабинета partner.yandex.ru
    rewardedBlockId: 'R-M-20297973-1',
    interstitialBlockId: 'R-M-20297973-2',

    // Mock только в браузере. В APK mock никогда не выдаёт награду.
    useMockOnWeb: true
  };

  console.log(
    '[ads-config] rewarded=', window.AVT_ADS_CONFIG.rewardedBlockId,
    'interstitial=', window.AVT_ADS_CONFIG.interstitialBlockId
  );
})();
