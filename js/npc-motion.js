'use strict';
(function(){
  const MODAL='#modal.npc-modal';
  const TYPES=['npc-open','npc-talk','npc-positive','npc-negative','npc-risk'];
  let lastImage=null;

  function getImage(){return document.querySelector(MODAL+' .npc-hero-img')}
  function pulse(type){
    const img=getImage();
    if(!img)return;
    TYPES.forEach(c=>img.classList.remove(c));
    void img.offsetWidth;
    img.classList.add(type);
    window.setTimeout(()=>img.classList.remove(type),900);
  }
  function classify(button){
    const text=(button.textContent||'').trim().toLowerCase();
    if(/риск|импровиз|максим|жёст|дав|сразу/.test(text))return 'npc-risk';
    if(/не |отказ|уйти|перенест|оставить|не рисков|довер|быстрее/.test(text))return 'npc-negative';
    return 'npc-positive';
  }
  function sync(){
    const img=getImage();
    if(!img)return;
    if(img!==lastImage){
      lastImage=img;
      pulse('npc-open');
    }
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest('#modal.npc-modal .npc-choice');
    if(button)window.setTimeout(()=>pulse(classify(button)),20);
  },true);

  const observer=new MutationObserver(sync);
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','src']});
  sync();
  window.setInterval(sync,250);
})();
