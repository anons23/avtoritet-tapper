'use strict';
(function(){
  const scripts=[
    {src:'./js/save-migration.js?v=1.0',critical:true},
    {src:'./js/game.js?v=4.87',critical:true},
    {src:'./js/music-stage.js?v=1.0',critical:false},
    {src:'./js/tasks-ui.js?v=1.2',critical:false},
    {src:'./js/npc-barrack.js?v=4.3',critical:true},
    {src:'./js/object-visuals.js?v=3.3',critical:true},
    {src:'./js/choice-events.js?v=1.1',critical:false},
    {src:'./js/sentence.js?v=1.0',critical:false},
    {src:'./js/prestige.js?v=1.0',critical:false},
    /* equipment.js disabled — use equipment-v2.js from index.html */
    {src:'./js/ads.js?v=1.0',critical:false},
    {src:'./js/yandex-progress.js?v=1.0',critical:false},
    {src:'./js/offline.js?v=1.0',critical:false},
    {src:'./js/share.js?v=1.0',critical:false},
    {src:'./js/leaderboard.js?v=1.0',critical:false},
    {src:'./js/daily.js?v=2.1',critical:false},
    {src:'./js/authority-css-restore.js?v=1.6',critical:false},
    {src:'./js/authority-ui.js?v=1.9',critical:false},
    {src:'./js/authority-folder-fix.js?v=1.0',critical:false},
    {src:'./js/authority-gate.js?v=1.3',critical:false},
    {src:'./js/authority-auto-deal.js?v=1.0',critical:false},
    {src:'./js/authority-choice-guard.js?v=1.1',critical:false},
    {src:'./js/authority-clash-anim.js?v=1.0',critical:false},
    {src:'./js/authority-anim-fix.js?v=1.0',critical:false}
  ];

  function loadScript(item){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=item.src;
      s.async=false;
      s.onload=function(){resolve(item)};
      s.onerror=function(){
        if(item.critical)reject(new Error('Failed '+item.src));
        else resolve(item);
      };
      document.head.appendChild(s);
    });
  }

  async function boot(){
    for(var i=0;i<scripts.length;i++){
      var item=scripts[i];
      try{
        await loadScript(item);
      }catch(e){
        console.error(e);
        if(item.critical)return;
      }
    }
    console.log('[bootstrap] v2.88 ready (npc-barrack restored)');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
