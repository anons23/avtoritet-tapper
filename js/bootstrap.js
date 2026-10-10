'use strict';
(function(){
  /* Only scripts that exist on the branch. Removed 404s:
     music-stage, tasks-ui, choice-events, sentence, prestige,
     yandex-progress, offline, share, leaderboard */
  const scripts=[
    {src:'./js/save-migration.js?v=1.1',critical:true},
    {src:'./js/game.js?v=4.88',critical:true},
    {src:'./js/save-guard.js?v=1.0',critical:false},
    {src:'./js/npc-barrack.js?v=4.4',critical:true},
    {src:'./js/npc-memory.js?v=1.0',critical:false},
    {src:'./js/npc-rumors.js?v=1.4',critical:false},
    {src:'./js/object-visuals.js?v=3.3',critical:true},
    {src:'./js/ads-policy.js?v=1.1',critical:false},
    {src:'./js/shop-booster-ad.js?v=1.0',critical:false},
    {src:'./js/jail-lock.js?v=1.0',critical:false},
    {src:'./js/nickname-rename.js?v=1.1',critical:false},
    {src:'./js/daily.js?v=1.4',critical:false},
    {src:'./js/authority-css-restore.js?v=1.8',critical:false},
    {src:'./js/authority-ui.js?v=2.4',critical:false},
    {src:'./js/authority-folder-fix.js?v=1.0',critical:false},
    {src:'./js/authority-gate.js?v=1.3',critical:false},
    {src:'./js/authority-auto-deal.js?v=1.1',critical:false},
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
    console.log('[bootstrap] v3.6');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
