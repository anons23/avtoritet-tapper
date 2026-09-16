'use strict';
(function(){
  const scripts=[
    './js/input-guard.js?v=1.1',
    './js/save-migration.js?v=1.0',
    './js/game.js?v=4.4',
    './js/shop-ui.js?v=2.1',
    './js/name-ui.js?v=2.1',
    './js/prison-ui.js?v=3.2',
    './js/rank-ui.js?v=2.2',
    './js/npc-ui.js?v=2.7',
    './js/npc5-ui.js?v=1.0',
    './js/stories-ui-v2.js?v=2.1',
    './js/stability-fixes.js?v=1.1'
  ];

  function ready(){
    try{
      const s=window.ysdk;
      if(s&&s.features&&s.features.LoadingAPI&&typeof s.features.LoadingAPI.ready==='function')s.features.LoadingAPI.ready();
    }catch(e){}
  }

  function next(i){
    if(i>=scripts.length){ready();return}
    const s=document.createElement('script');
    s.src=scripts[i];
    s.async=false;
    s.onload=()=>next(i+1);
    s.onerror=()=>next(i+1);
    document.body.appendChild(s);
  }

  document.addEventListener('contextmenu',e=>{
    if(e.target.closest('#game-container'))e.preventDefault();
  },{passive:false});

  Promise.resolve(window.YandexGameReady).catch(()=>{}).then(()=>next(0));
})();