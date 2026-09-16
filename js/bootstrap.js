'use strict';
(function(){
  const scripts=[
    './js/input-guard.js?v=1.1',
    './js/save-migration.js?v=1.0',
    './js/game.js?v=4.3',
    './js/shop-ui.js?v=2.0',
    './js/name-ui.js?v=2.1',
    './js/prison-ui.js?v=2.0',
    './js/rank-ui.js?v=2.2',
    './js/npc-ui.js?v=2.2',
    './js/health-ui.js?v=3.3',
    './js/stories-ui-v2.js?v=2.1'
  ];
  function markGameReady(){try{const sdk=window.ysdk;if(sdk&&sdk.features&&sdk.features.LoadingAPI&&typeof sdk.features.LoadingAPI.ready==='function')sdk.features.LoadingAPI.ready();}catch(e){console.debug('[Bootstrap] LoadingAPI.ready failed',e);}}
  function loadNext(index){if(index>=scripts.length){markGameReady();return;}const script=document.createElement('script');script.src=scripts[index];script.async=false;script.onload=function(){loadNext(index+1);};script.onerror=function(){console.error('[Bootstrap] Failed to load',scripts[index]);loadNext(index+1);};document.body.appendChild(script);}
  document.addEventListener('contextmenu',function(event){if(event.target.closest('#game-container'))event.preventDefault();},{passive:false});
  Promise.resolve(window.YandexGameReady).catch(function(){}).then(function(){loadNext(0);});
})();
