'use strict';
(function(){
  const scripts=[
    './js/game.js?v=4.0',
    './js/shop-ui.js?v=2.0',
    './js/name-ui.js?v=2.0',
    './js/prison-ui.js?v=2.0',
    './js/rank-ui.js?v=2.0',
    './js/npc-ui.js?v=2.0',
    './js/health-ui.js?v=3.0',
    './js/stories-ui-v2.js?v=2.0'
  ];

  function loadNext(index){
    if(index>=scripts.length)return;
    const script=document.createElement('script');
    script.src=scripts[index];
    script.async=false;
    script.onload=function(){loadNext(index+1);};
    script.onerror=function(){console.error('[Bootstrap] Failed to load',scripts[index]);loadNext(index+1);};
    document.body.appendChild(script);
  }

  Promise.resolve(window.YandexGameReady).catch(function(){}) .then(function(){loadNext(0);});
})();
