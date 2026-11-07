'use strict';
(function(){
  /* RuStore branch bootstrap — rewards + rank power v5.15 */
  const scripts=[
    {src:'./js/save-migration.js?v=1.2',critical:true},
    {src:'./js/game.js?v=5.15-rewards',critical:true},
    {src:'./js/save-guard.js?v=1.1',critical:false},
    {src:'./js/npc-barrack.js?v=4.9-blatnoy4000',critical:true},
    {src:'./js/npc-memory.js?v=1.0',critical:false},
    {src:'./js/npc-rumors.js?v=1.5',critical:false},
    {src:'./js/object-visuals.js?v=3.3',critical:true},
    {src:'./js/ads-policy.js?v=1.1',critical:false},
    {src:'./js/shop-booster-ad.js?v=2.1-ad-explainer',critical:false},
    {src:'./js/jail-lock.js?v=1.0',critical:false},
    {src:'./js/nickname-rename.js?v=1.1',critical:false},
    {src:'./js/daily.js?v=1.4',critical:false},
    {src:'./js/authority-css-restore.js?v=1.8',critical:false},
    {src:'./js/authority-ui.js?v=2.7-no-crown',critical:false},
    {src:'./js/authority-folder-fix.js?v=1.0',critical:false},
    {src:'./js/authority-gate.js?v=1.5',critical:false},
    {src:'./js/authority-auto-deal.js?v=1.1',critical:false},
    {src:'./js/authority-choice-guard.js?v=1.1',critical:false},
    {src:'./js/authority-clash-anim.js?v=1.0',critical:false},
    {src:'./js/authority-anim-fix.js?v=1.0',critical:false}
  ];

  const loadedScripts=new Set();
  let booting=false;
  let bootErrorScreen=null;
  let bootErrorText=null;
  let retryButton=null;

  function createBootErrorScreen(){
    if(bootErrorScreen)return;
    const screen=document.createElement('div');
    screen.id='boot-error-screen';
    screen.setAttribute('role','alert');
    screen.setAttribute('aria-live','assertive');
    screen.style.cssText=[
      'position:fixed','inset:0','z-index:2147483647','display:none',
      'align-items:center','justify-content:center','padding:24px',
      'padding-top: max(24px, env(safe-area-inset-top))',
      'padding-bottom: max(24px, env(safe-area-inset-bottom))',
      'box-sizing:border-box','background:rgba(8,8,8,.97)',
      'color:#f4eee5','font-family:Arial,sans-serif','text-align:center'
    ].join(';');

    const panel=document.createElement('div');
    panel.style.cssText='width:100%;max-width:420px;padding:26px 20px;border:1px solid #704b35;border-radius:16px;background:#191512;box-shadow:0 12px 40px rgba(0,0,0,.55);box-sizing:border-box';

    const title=document.createElement('div');
    title.textContent='Не удалось загрузить игру';
    title.style.cssText='font-size:22px;font-weight:800;margin-bottom:12px;color:#f2c28c';

    const description=document.createElement('div');
    description.textContent='Похоже, соединение прервалось или один из файлов не загрузился. Проверь интернет и попробуй ещё раз.';
    description.style.cssText='font-size:15px;line-height:1.5;color:#ddd;margin-bottom:12px';

    const details=document.createElement('div');
    details.style.cssText='font-size:12px;line-height:1.4;color:#a99b8d;overflow-wrap:anywhere;margin-bottom:20px';

    const button=document.createElement('button');
    button.type='button';
    button.textContent='Повторить загрузку';
    button.style.cssText='width:100%;min-height:50px;padding:12px 18px;border:0;border-radius:10px;background:#a94f2d;color:#fff;font-size:16px;font-weight:800;cursor:pointer;touch-action:manipulation';

    button.addEventListener('click',function(){
      if(booting)return;
      button.disabled=true;
      button.textContent='Загружаем…';
      button.style.opacity='.7';
      if(bootErrorText)bootErrorText.textContent='Повторная попытка загрузки…';
      boot();
    });

    panel.appendChild(title);
    panel.appendChild(description);
    panel.appendChild(details);
    panel.appendChild(button);
    screen.appendChild(panel);
    document.body.appendChild(screen);
    bootErrorScreen=screen;
    bootErrorText=details;
    retryButton=button;
  }

  function showBootError(item,error){
    createBootErrorScreen();
    const file=item&&item.src?item.src:'неизвестный файл';
    if(bootErrorText)bootErrorText.textContent='Проблемный файл: '+file;
    if(retryButton){
      retryButton.disabled=false;
      retryButton.textContent='Повторить загрузку';
      retryButton.style.opacity='1';
    }
    bootErrorScreen.style.display='flex';
    console.error('[bootstrap] Critical script failed:',file,error||'');
  }

  function hideBootError(){
    if(bootErrorScreen)bootErrorScreen.style.display='none';
  }

  function loadScript(item){
    if(loadedScripts.has(item.src))return Promise.resolve(item);
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=item.src;
      s.async=false;
      s.onload=function(){
        loadedScripts.add(item.src);
        resolve(item);
      };
      s.onerror=function(){
        s.remove();
        if(item.critical)reject(new Error('Failed '+item.src));
        else{
          console.warn('[bootstrap] Optional script failed:',item.src);
          resolve(item);
        }
      };
      document.head.appendChild(s);
    });
  }

  async function boot(){
    if(booting)return;
    booting=true;
    try{
      for(var i=0;i<scripts.length;i++){
        var item=scripts[i];
        try{
          await loadScript(item);
        }catch(e){
          showBootError(item,e);
          return;
        }
      }
      hideBootError();
      console.log('[bootstrap] rustore rewards v5.15');
      if(typeof window.__finishPreloader==='function')window.__finishPreloader();
    }finally{
      booting=false;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
