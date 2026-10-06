'use strict';
(function(){
  const scripts=[
    {src:'./js/save-migration.js?v=1.0',critical:true},
    {src:'./js/game.js?v=4.86',critical:true},
    /* Визуалы груши сразу после ядра — локация без серой задержки */
    {src:'./js/object-visuals.js?v=3.3',critical:true},
    /* Барак и нижнее меню — critical, чтобы не было «дождитесь загрузки» */
    {src:'./js/npc-stat-cleanup.js?v=1.1',critical:true},
    {src:'./js/npc-ui.js?v=2.9',critical:true},
    {src:'./js/npc-no-emoji.js?v=1.0',critical:true},
    {src:'./js/npc5-ui.js?v=1.1',critical:true},
    /* equipment.js disabled — use equipment-v2.js from index.html */
    {src:'./js/shop-ui.js?v=2.2',critical:false},
    {src:'./js/name-ui.js?v=2.2',critical:false},
    {src:'./js/prison-ui.js?v=3.4',critical:false},
    {src:'./js/rank-ui.js?v=2.4',critical:false},
    {src:'./js/stories-ui-v2.js?v=2.1',critical:false},
    {src:'./js/stability-fixes.js?v=1.4',critical:false},
    {src:'./js/authority-css-restore.js?v=1.6',critical:false},
    {src:'./js/authority-ui.js?v=1.8',critical:false},
    {src:'./js/authority-folder-fix.js?v=1.0',critical:false},
    {src:'./js/authority-gate.js?v=1.1',critical:false}
  ];
  function preloadProgress(step,message){try{if(typeof window.__setPreloaderProgress==='function')window.__setPreloaderProgress(step,message)}catch(e){}}
  function finishPreloader(){try{if(typeof window.__finishPreloader==='function')window.__finishPreloader()}catch(e){}}
  function ready(){
    try{const s=window.ysdk;if(s&&s.features&&s.features.LoadingAPI&&typeof s.features.LoadingAPI.ready==='function')s.features.LoadingAPI.ready()}catch(e){console.debug('[Bootstrap] LoadingAPI.ready failed',e)}
  }
  function showFatal(src){
    console.error('[Bootstrap] Critical script failed:',src);
    const box=document.createElement('div');box.setAttribute('role','alert');
    box.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;background:#111;color:#fff;font:16px/1.5 system-ui,sans-serif;text-align:center';
    box.innerHTML='<div style="max-width:520px"><h2 style="margin:0 0 12px">Не удалось запустить игру</h2><p style="margin:0 0 18px">Произошла ошибка загрузки игры. Обнови страницу и попробуй ещё раз.</p><button type="button" style="padding:12px 20px;border:0;border-radius:10px;font:inherit;cursor:pointer" onclick="location.reload()">Обновить</button></div>';
    document.body.appendChild(box);
  }
  function waitForYandexReady(){
    const p=window.YandexGameReady;
    if(!p||typeof p.then!=='function')return Promise.resolve();
    return Promise.race([
      p.catch(function(){}),
      new Promise(function(res){setTimeout(res,2500);})
    ]);
  }
  function loadOne(item){
    return new Promise(function(resolve,reject){
      const s=document.createElement('script');
      s.src=item.src;
      s.async=false;
      s.onload=function(){resolve(item);};
      s.onerror=function(){
        if(item.critical){reject(new Error(item.src));return;}
        console.warn('[Bootstrap] optional failed',item.src);
        resolve(item);
      };
      (document.head||document.documentElement).appendChild(s);
    });
  }
  async function run(){
    preloadProgress(12,'ЯДРО');
    await waitForYandexReady();
    let step=18;
    for(const item of scripts){
      try{
        await loadOne(item);
        step=Math.min(92,step+(item.critical?6:3));
        preloadProgress(step,item.src.replace(/^\.\/js\//,'').replace(/\?.*$/,'').toUpperCase());
        if(item.src.indexOf('./js/game.js')===0){
          try{if(typeof window.__markCoreReady==='function')window.__markCoreReady()}catch(e){}
        }
      }catch(err){
        finishPreloader();
        showFatal(item.src);
        return;
      }
    }
    preloadProgress(96,'ГОТОВО');
    try{
      if(typeof window.bootGame==='function')window.bootGame();
      else if(typeof window.startGame==='function')window.startGame();
    }catch(e){console.error('[Bootstrap] boot',e)}
    finishPreloader();
    ready();
    console.log('[bootstrap] v2.81 ready (equipment-v2)');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){run()});
  else run();
})();
