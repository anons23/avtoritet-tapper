'use strict';
(function(){
  const MODAL='#modal.npc-modal';
  let lastModal=null;

  function getModal(){return document.querySelector(MODAL)}
  function pulse(cls){
    const modal=getModal();
    if(!modal)return;
    ['npc-motion-open','npc-motion-talk','npc-motion-positive','npc-motion-negative','npc-motion-risk'].forEach(c=>modal.classList.remove(c));
    void modal.offsetWidth;
    modal.classList.add(cls);
    window.setTimeout(()=>modal.classList.remove(cls),700);
  }

  function classifyButton(button){
    const text=(button.textContent||'').trim().toLowerCase();
    if(/риск|импровиз|максим|жёст|дав|сразу/.test(text))return 'npc-motion-risk';
    if(/не |отказ|уйти|перенест|оставить|не рисков|довер|быстрее/.test(text))return 'npc-motion-negative';
    return 'npc-motion-positive';
  }

  function observe(){
    const modal=getModal();
    if(!modal||modal===lastModal)return;
    lastModal=modal;
    pulse('npc-motion-open');
    const observer=new MutationObserver(()=>{
      const current=getModal();
      if(current&&current===modal) pulse('npc-motion-talk');
    });
    observer.observe(modal,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),15000);
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest('#modal.npc-modal button, #modal.npc-modal .npc-choice');
    if(button)pulse(classifyButton(button));
  },true);

  const root=document.getElementById('modal-overlay');
  if(root)new MutationObserver(observe).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  observe();
  window.setInterval(observe,1000);
})();
