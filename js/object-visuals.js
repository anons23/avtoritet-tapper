'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=2';
  const BAG_NAME='Груша';

  function sync(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji)return;
    const isBag=!!(name && name.textContent.trim()===BAG_NAME);
    if(target)target.classList.toggle('bag-mode',isBag);
    if(isBag){
      let img=emoji.querySelector('.boxing-bag-image');
      if(!img){
        emoji.textContent='';
        img=document.createElement('img');
        img.src=BAG_SRC;
        img.alt=BAG_NAME;
        img.className='boxing-bag-image';
        img.draggable=false;
        emoji.appendChild(img);
      }
    }else{
      const img=emoji.querySelector('.boxing-bag-image');
      if(img)img.remove();
    }
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
    if(target){
      target.addEventListener('pointerdown',animate,{passive:true});
      target.addEventListener('click',animate,{passive:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
