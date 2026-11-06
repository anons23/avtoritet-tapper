/* ads-config.js — Yandex Mobile Ads (RuStore) */
'use strict';
(function () {
  window.AVT_ADS_CONFIG = {
    appId: '20344973',
    packageName: 'ru.avtoritet.game',
    rewardedBlockId: 'R-M-20344973-1',
    interstitialBlockId: 'R-M-20344973-2',
    useMockOnWeb: true
  };
  console.log('[ads-config] rewarded=', window.AVT_ADS_CONFIG.rewardedBlockId);
})();
