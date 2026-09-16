'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const OBJECT_UNLOCKS=[0,150,400,1500,6000];

  function state(){
    try{return typeof window.getGameState==='function'?window.getGameState():JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch(e){return {}}
  }
  function save(s){try{s.saveUpdatedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true}catch(e){return false}}

  function syncObjectAfterPointsChange(){
    const s=state();
    if(!s||typeof s!=='object'||!Array.isArray(OBJECT_UNLOCKS))return;
    const points=Math.max(0,Number(s.points)||0);
    let max=0;
    for(let i=0;i<OBJECT_UNLOCKS.length;i++)if(points>=OBJECT_UNLOCKS[i])max=i;
    const current=Math.max(0,Number(s.currentObject)||0);
    if(current>max){
      s.currentObject=max;
      save(s);
    }
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    if(s.jailed){
      if(emoji)emoji.textContent='⛓️';
      if(name)name.textContent='Карцер';
    }
  }

  function fixVisibleTaskRewards(){
    const modal=document.getElementById('modal-content');
    if(!modal)return;
    modal.querySelectorAll('.task-card small').forEach(el=>{
      const text=el.textContent||'';
      if(!text.includes('Награда:'))return;
      if(text.includes('Первые 10 000 тапов'))return;
    });
    const cards=[...modal.querySelectorAll('.task-card')];
    const rewards=['500 🚬','750 🚬','1000 🚬','5000 🚬','1500 ⭐'];
    cards.forEach((card,i)=>{
      const small=card.querySelector('small');
      if(!small||!rewards[i])return;
      const parts=small.textContent.split('· Награда:');
      if(parts.length!==2)return;
      small.innerHTML=parts[0]+'· Награда: <strong>'+rewards[i]+'</strong>';
    });
  }

  function fixLegacyPrestigeText(){
    const modal=document.getElementById('modal-content');
    if(!modal)return;
    modal.querySelectorAll('.prestige-card p').forEach(p=>{
      if((p.textContent||'').includes('25 000'))p.textContent=p.textContent.replace('25 000','150 000');
    });
  }

  function refresh(){
    syncObjectAfterPointsChange();
    fixVisibleTaskRewards();
    fixLegacyPrestigeText();
  }

  function init(){
    const modal=document.getElementById('modal-content');
    if(modal)new MutationObserver(refresh).observe(modal,{childList:true,subtree:true,characterData:true});
    refresh();
    setInterval(refresh,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();