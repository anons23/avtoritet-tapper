'use strict';
(function(){
  const scripts=[
    {src:'./js/input-guard.js?v=1.1',critical:false},
    {src:'./js/save-migration.js?v=1.0',critical:true},
    {src:'./js/game.js?v=4.6',critical:true},
    {src:'./js/test-mode.js?v=1.3',critical:false},
    {src:'./js/shop-ui.js?v=2.1',critical:false},
    {src:'./js/name-ui.js?v=2.1',critical:false},
    {src:'./js/prison-ui.js?v=3.2',critical:false},
    {src:'./js/rank-ui.js?v=2.2',critical:false},
    {src:'./js/npc-stat-cleanup.js?v=1.1',critical:false},
    {src:'./js/npc-ui.js?v=2.7',critical:false},
    {src:'./js/npc-no-emoji.js?v=1.0',critical:false},
    {src:'./js/npc5-ui.js?v=1.0',critical:false},
    {src:'./js/stories-ui-v2.js?v=2.1',critical:false},
    {src:'./js/stability-fixes.js?v=1.1',critical:false},
    {src:'./js/object-visuals.js?v=2.1',critical:false},
    {src:'./js/authority-ui.js?v=1.3',critical:false},
    {src:'./js/authority-gate.js?v=1.0',critical:false}
  ];
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
      Promise.resolve(p).catch(()=>{}),
      new Promise(resolve=>setTimeout(resolve,4000))
    ]);
  }
  function appendScript(item,next){
    const script=document.createElement('script');script.src=item.src;script.async=false;
    script.onload=()=>next();
    script.onerror=()=>{console.error('[Bootstrap] Failed to load',item.src);if(item.critical){showFatal(item.src);return}next()};
    document.body.appendChild(script);
  }
  function loadScripts(i){
    if(i>=scripts.length){ready();return}
    const item=scripts[i];
    if(item.src.indexOf('./js/game.js')===0){
      waitForYandexReady().then(()=>appendScript(item,()=>loadScripts(i+1)));
      return;
    }
    appendScript(item,()=>loadScripts(i+1));
  }
  document.addEventListener('contextmenu',e=>{if(e.target.closest('#game-container'))e.preventDefault()},{passive:false});
  loadScripts(0);Promise.resolve(window.YandexGameReady).catch(()=>{}).then(ready);
})();
