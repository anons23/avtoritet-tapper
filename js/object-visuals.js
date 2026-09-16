'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=1';
  const BAG_ICON='🥊';
  function sync(){
    const el=document.getElementById('object-emoji');
    if(!el)return;
    if(el.textContent.trim()===BAG_ICON && !el.querySelector('img')){
      el.textContent='';
      const img=document.createElement('img');
      img.src=BAG_SRC;
      img.alt='Груша';
      img.className='boxing-bag-image';
      el.appendChild(img);
    }
  }
  function init(){
    const el=document.getElementById('object-emoji');
    if(!el)return;
    new MutationObserver(sync).observe(el,{childList:true,characterData:true,subtree:true});
    sync();
    const target=document.getElementById('tap-object');
    if(target){
      target.addEventListener('pointerdown',()=>{
        const img=el.querySelector('.boxing-bag-image');
        if(!img)return;
        img.classList.remove('hit');
        void img.offsetWidth;
        img.classList.add('hit');
      },{passive:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
