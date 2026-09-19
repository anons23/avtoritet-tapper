'use strict';
(function(){
  // Remove only decorative NPC emojis and restore the portrait thumbnails
  // explicitly. Portraits are real <img> elements, not emoji glyphs.
  const NPC_EMOJIS=/[🧢💪😏👑]/gu;
  const AVATARS={
    'Шайба':'./assets/backgrounds/shaiba_avatar.png',
    'Бугор':'./assets/backgrounds/Bugor_avatar.png',
    'Косой':'./assets/backgrounds/Kosoy_avatar.png',
    'Смотрящий':'./assets/backgrounds/Smotraishia_avatar.png',
    'Авторитет':'./assets/backgrounds/avtoritet_avatar.png'
  };

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

  function restorePortraits(root){
    if(!root)return;
    root.querySelectorAll('.npc-list .npc-link').forEach(card=>{
      const nameEl=card.querySelector('b,strong');
      const name=nameEl ? nameEl.textContent.trim() : '';
      const src=AVATARS[name];
      if(!src)return;
      let holder=card.querySelector(':scope > span:first-child');
      if(!holder){
        holder=document.createElement('span');
        card.insertBefore(holder,card.firstChild);
      }
      holder.textContent='';
      holder.setAttribute('aria-hidden','true');
      holder.style.cssText='box-sizing:border-box;width:58px;height:58px;flex:0 0 58px;margin:0 auto;border-radius:18px;border:1px solid rgba(213,168,74,.55);background:#171719;overflow:hidden;position:relative;display:block;box-shadow:0 7px 18px rgba(0,0,0,.38),inset 0 1px rgba(255,255,255,.12);';
      let img=holder.querySelector('img');
      if(!img){
        img=document.createElement('img');
        holder.appendChild(img);
      }
      img.src=src;
      img.alt='';
      img.draggable=false;
      img.loading='eager';
      img.style.cssText='display:block;width:100%;height:100%;object-fit:cover;object-position:center;';
    });
  }

  function run(){
    const barrack=document.querySelector('.barrack-window');
    clean(barrack);
    restorePortraits(barrack);
    const modal=document.getElementById('modal');
    if(modal && (modal.classList.contains('npc-modal')||modal.classList.contains('-modal'))){
      clean(modal);
      restorePortraits(modal);
    }
  }

  function init(){
    const overlay=document.getElementById('modal-overlay');
    if(!overlay)return;
    const observer=new MutationObserver(()=>setTimeout(run,0));
    observer.observe(overlay,{childList:true,characterData:true,subtree:true});
    run();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
