'use strict';
(function(){
  /*
   * This module is intentionally limited to legacy UI cleanup.
   * Game state, object unlocks and saving are owned by game.js.
   * Keeping those responsibilities in one place prevents conflicting saves.
   */
  let refreshQueued=false;

  function removeLegacyPrestige(){
    const modal=document.getElementById('modal-content');
    if(!modal)return;
    modal.querySelectorAll('.prestige-card').forEach(card=>card.remove());
  }

  function queueRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    queueMicrotask(()=>{
      refreshQueued=false;
      removeLegacyPrestige();
    });
  }

  function init(){
    const modal=document.getElementById('modal-content');
    if(modal)new MutationObserver(queueRefresh).observe(modal,{
      childList:true,
      subtree:true,
      characterData:true
    });
    removeLegacyPrestige();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
