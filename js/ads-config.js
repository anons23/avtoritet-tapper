/* ads-config.js — временная проверка rewarded-рекламы Яндекса */
'use strict';
(function () {
  window.AVT_ADS_CONFIG = {
    appId: '20297973',
    packageName: 'ru.avtoritet.game',

    // ВРЕМЕННО: официальный тестовый блок Яндекса для проверки награды.
    // После успешного теста вернуть реальный ID из кабинета РСЯ.
    rewardedBlockId: 'demo-rewarded-yandex',
    interstitialBlockId: 'R-M-20297973-2',

    useMockOnWeb: true
  };

  console.log('[ads-config] Rewarded test ad block configured');
})();
