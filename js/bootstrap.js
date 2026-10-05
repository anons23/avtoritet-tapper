/* bootstrap.js v2.80 — dynamic module loader */
'use strict';
(function(){
  var MODULES=[
    {src:'./js/game-core.js?v=3.1',critical:true},
    {src:'./js/save-load.js?v=2.4',critical:true},
    {src:'./js/ui-core.js?v=2.5',critical:true},
    {src:'./js/tap-engine.js?v=2.2',critical:true},
    {src:'./js/rank-system.js?v=2.1',critical:true},
    {src:'./js/tasks-ui.js?v=2.3',critical:false},
    {src:'./js/npc-ui.js?v=2.9',critical:true},
    {src:'./js/npc-no-emoji.js?v=1.0',critical:true},
    {src:'./js/npc5-ui.js?v=1.1',critical:true},
    /* equipment.js disabled — use equipment-v2.js from index */
    {src:'./js/shop-ui.js?v=2.2',critical:false},
    {src:'./js/name-ui.js?v=2.2',critical:false},
    {src:'./js/prison-ui.js?v=3.4',critical:false},
    {src:'./js/prestige-ui.js?v=1.2',critical:false},
    {src:'./js/settings-ui.js?v=1.3',critical:false},
    {src:'./js/more-menu.js?v=2.0',critical:false}
  ];

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=function(){ resolve(src); };
      s.onerror=function(){ reject(new Error('fail '+src)); };
      (document.head||document.documentElement).appendChild(s);
    });
  }

  function boot(){
    var chain=Promise.resolve();
    MODULES.forEach(function(m){
      chain=chain.then(function(){
        return loadScript(m.src).catch(function(err){
          console.warn('[bootstrap]', err&&err.message||err);
          if(m.critical) throw err;
        });
      });
    });
    return chain.then(function(){
      try{
        if(typeof window.startGame==='function') window.startGame();
        else if(typeof window.initGame==='function') window.initGame();
      }catch(e){ console.error('[bootstrap] start', e); }
      var gc=document.getElementById('game-container');
      if(gc) gc.classList.remove('game-booting');
      console.log('[bootstrap] v2.80 ready');
    }).catch(function(e){
      console.error('[bootstrap] critical fail', e);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
