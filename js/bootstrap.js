'use strict';
(function(){
  const scripts=[
    {src:'./js/save-migration.js?v=1.0',critical:true},
    {src:'./js/game.js?v=4.42',critical:true},
    {src:'./js/shop-ui.js?v=2.1',critical:false},
    {src:'./js/name-ui.js?v=2.2',critical:false},
    {src:'./js/prison-ui.js?v=3.4',critical:false},
    {src:'./js/rank-ui.js?v=2.4',critical:false},
    {src:'./js/npc-stat-cleanup.js?v=1.1',critical:false},
    {src:'./js/npc-ui.js?v=2.9',critical:false},
    {src:'./js/npc-no-emoji.js?v=1.0',critical:false},
    {src:'./js/npc5-ui.js?v=1.1',critical:false},
    {src:'./js/stories-ui-v2.js?v=2.1',critical:false},
    {src:'./js/stability-fixes.js?v=1.4',critical:false},
    {src:'./js/object-visuals.js?v=3.1',critical:false},
    {src:'./js/authority-css-restore.js?v=1.6',critical:false},
    {src:'./js/authority-ui.js?v=1.8',critical:false},
    {src:'./js/authority-folder-fix.js?v=1.0',critical:false},
    {src:'./js/authority-gate.js?v=1.1',critical:false}
  ];
  function preloadProgress(step,message){try{if(typeof window.__setPreloaderProgress==='function')window.__setPreloaderProgress(step,message)}catch(e){}}
  function finishPreloader(){
    try{if(typeof window.__finishPreloader==='function')window.__finishPreloader()}catch(e){}
    try{
      var p=document.getElementById('preloader');
      if(p){p.classList.add('is-hidden');p.style.cssText='display:none!important;opacity:0!important;visibility:hidden!important';p.remove();}
      var g=document.getElementById('game-container');
      if(g){g.classList.remove('game-booting');g.style.visibility='visible';}
    }catch(e){}
  }
  function ready(){
    try{const s=window.ysdk;if(s&&s.features&&s.features.LoadingAPI&&typeof s.features.LoadingAPI.ready==='function')s.features.LoadingAPI.ready()}catch(e){console.debug('[Bootstrap] LoadingAPI.ready failed',e)}
  }
  function showFatal(src){
    console.error('[Bootstrap] Critical script failed:',src);
    finishPreloader();
    const box=document.createElement('div');box.setAttribute('role','alert');
    box.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;background:#111;color:#fff;font:16px/1.5 system-ui,sans-serif;text-align:center';
    box.innerHTML='<div style="max-width:520px"><h2 style="margin:0 0 12px">Не удалось запустить игру</h2><p style="margin:0 0 18px">Произошла ошибка загрузки. Обнови страницу.</p><button type="button" style="padding:12px 20px;border:0;border-radius:10px;font:inherit;cursor:pointer" onclick="location.reload()">Обновить</button></div>';
    document.body.appendChild(box);
  }
  function waitForYandexReady(){
    const p=window.YandexGameReady;
    if(!p||typeof p.then!=='function')return Promise.resolve();
    return Promise.race([
      Promise.resolve(p).catch(function(){}),
      new Promise(function(resolve){setTimeout(resolve,2000)})
    ]);
  }
  function waitForRaidAssets(){
    const p=window.__raidAssetsReady;
    if(!p||typeof p.then!=='function')return Promise.resolve();
    return Promise.race([
      Promise.resolve(p).catch(function(){}),
      new Promise(function(resolve){setTimeout(resolve,3000)})
    ]);
  }
  function appendScript(item,index,next){
    const script=document.createElement('script');script.src=item.src;script.async=false;
    script.onload=function(){const loaded=Math.round(42+(index+1)*(54/scripts.length));preloadProgress(Math.min(96,loaded),item.critical?'Запускаем ядро':'Загружаем модули');next()};
    script.onerror=function(){console.error('[Bootstrap] Failed to load',item.src);if(item.critical){showFatal(item.src);return}const loaded=Math.round(42+(index+1)*(54/scripts.length));preloadProgress(Math.min(96,loaded),'Продолжаем запуск');next()};
    document.body.appendChild(script);
  }
  function loadScripts(i){
    if(i>=scripts.length){
      preloadProgress(96,'Почти готово');
      waitForRaidAssets().then(function(){
        preloadProgress(100,'Готово');
        ready();
        finishPreloader();
      });
      return;
    }
    const item=scripts[i];
    if(item.src.indexOf('./js/game.js')===0){
      waitForYandexReady().then(function(){appendScript(item,i,function(){loadScripts(i+1)});});
      return;
    }
    appendScript(item,i,function(){loadScripts(i+1);});
  }
  document.addEventListener('contextmenu',function(e){if(e.target.closest('#game-container'))e.preventDefault()},{passive:false});
  preloadProgress(16,'Подготавливаем игровой код');
  loadScripts(0);
  Promise.resolve(window.YandexGameReady).catch(function(){}).then(ready);
  setTimeout(finishPreloader,8000);
})();
