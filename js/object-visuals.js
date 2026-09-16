'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=3';
  const BAG_NAME='Груша';

  function sync(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji)return;
    const isBag=!!(name && name.textContent.trim()===BAG_NAME);
    if(!isBag){
      const img=emoji.querySelector('.boxing-bag-image');
      if(img)img.remove();
      if(target){target.classList.remove('bag-mode');target.classList.remove('preload-hidden');}
      return;
    }
    if(!target)return;
    target.classList.add('bag-mode');
    let img=emoji.querySelector('.boxing-bag-image');
    if(img)return;
    target.classList.add('preload-hidden');
    emoji.textContent='';
    img=document.createElement('img');
    img.src=BAG_SRC;
    img.alt=BAG_NAME;
    img.className='boxing-bag-image';
    img.draggable=false;
    img.onload=()=>{target.classList.remove('preload-hidden');};
    img.onerror=()=>{target.classList.remove('preload-hidden');emoji.textContent='🥊';};
    emoji.appendChild(img);
  }

  function animate(){
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.boxing-bag-image');
    if(!img)return;
    img.classList.remove('hit');
    void img.offsetWidth;
    img.classList.add('hit');
  }

  function init(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji)return;
    const observer=new MutationObserver(sync);
    observer.observe(emoji,{childList:true,characterData:true,subtree:true});
    if(name)observer.observe(name,{childList:true,characterData:true,subtree:true});
    sync();
    if(target)target.addEventListener('pointerdown',animate,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
