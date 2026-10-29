/* ads-config.js — ID рекламных блоков Яндекса (RuStore) */
'use strict';
(function () {
  window.AVT_ADS_CONFIG = {
    // Приложение в partner.yandex.ru
    appId: '20297973',
    packageName: 'ru.avtoritet.game',

    // Блоки (проверь в кабинете, что форматы совпадают)
    rewardedBlockId: 'R-M-20297973-1',
    interstitialBlockId: 'R-M-20297973-2',

    // Пока нет нативного Android SDK — на вебе остаётся mock.
    // В APK window.AndroidAds должен быть внедрён из Kotlin/Java.
    useMockOnWeb: true
  };

  console.log('[ads-config] rewarded=', window.AVT_ADS_CONFIG.rewardedBlockId,
    'interstitial=', window.AVT_ADS_CONFIG.interstitialBlockId);
})();
