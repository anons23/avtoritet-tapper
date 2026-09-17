'use strict';
(function(){
  // NPC-specific cleanup: remove only the four decorative NPC emojis from
  // barrack cards and NPC dialogs, while leaving unrelated game UI emojis intact.
  const NPC_EMOJIS=/[🧢💪😏👑]/gu;

  function clean(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(n=>{
      const cleaned=n.nodeValue.replace(NPC_EMOJIS,'');
      if(cleaned!==n.nodeValue)n.nodeValue=cleaned;
    });
  }

  function init(){
    const overlay=document.getElementById('modal-overlay');
    if(!overlay)return;
    const run=()=>{
      clean(document.querySelector('.barrack-window'));
      const modal=document.getElementById('modal');
      if(modal && (modal.classList.contains('npc-modal')||modal.classList.contains('-modal')))clean(modal);
    };
    const observer=new MutationObserver(run);
    observer.observe(overlay,{childList:true,characterData:true,subtree:true});
    run();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
