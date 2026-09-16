'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const OBJECT_UNLOCKS=[0,150,400,1500,6000];
  let refreshing=false;
  let refreshQueued=false;

  function state(){
    try{return typeof window.getGameState==='function'?window.getGameState():JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch(e){return {}}
  }

  function save(s){
    try{s.saveUpdatedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true}catch(e){return false}
  }

  function syncObjectAfterPointsChange(){
    const s=state();
    if(!s||typeof s!=='object')return;
    const points=Math.max(0,Number(s.points)||0);
    let max=0;
    for(let i=0;i<OBJECT_UNLOCKS.length;i++)if(points>=OBJECT_UNLOCKS[i])max=i;
    const current=Math.max(0,Number(s.currentObject)||0);
    if(current>max){s.currentObject=max;save(s)}
    if(s.jailed){
      const emoji=document.getElementById('object-emoji');
      const name=document.getElementById('object-name');
      if(emoji)emoji.textContent='⛓️';
      if(name)name.textContent='Карцер';
    }
  }

  function removeLegacyPrestige(){
    const modal=document.getElementById('modal-content');
    if(!modal)return;
    modal.querySelectorAll('.prestige-card').forEach(card=>card.remove());
  }

  function refresh(){
    if(refreshing)return;
    refreshing=true;
    try{
      syncObjectAfterPointsChange();
      removeLegacyPrestige();
    }finally{
      refreshing=false;
    }
  }

  function queueRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    queueMicrotask(()=>{
      refreshQueued=false;
      refresh();
    });
  }

  function init(){
    const modal=document.getElementById('modal-content');
    if(modal)new MutationObserver(queueRefresh).observe(modal,{childList:true,subtree:true,characterData:true});
    refresh();
    setInterval(refresh,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
