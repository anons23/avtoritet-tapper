/* ads-config.js — рекламные блоки Яндекса для Android / RuStore и браузерного превью */
'use strict';
(function () {
  window.AVT_ADS_CONFIG = {
    // ID приложения в Рекламной сети Яндекса и package name Android-приложения.
    appId: '20297973',
    packageName: 'ru.avtoritet.game',

    // ID рекламных мест из кабинета Яндекса. Форматы должны совпадать с назначением.
    rewardedBlockId: 'R-M-20297973-1',
    interstitialBlockId: 'R-M-20297973-2',

    // Только браузерное превью. В Android APK имитация отключается мостом автоматически.
    useMockOnWeb: true
  };

  console.log('[ads-config] Yandex ad blocks configured');
})();
