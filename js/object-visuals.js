'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=5';
  const BAG_NAME='Груша';
  let activeAnimation=null;

  function sync(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji)return;
    const isBag=!!(name && name.textContent.trim()===BAG_NAME);
    if(!isBag){
      const img=emoji.querySelector('.boxing-bag-image');
      if(img){if(activeAnimation)activeAnimation.cancel();activeAnimation=null;img.remove();}
      if(target)target.classList.remove('bag-mode','preload-hidden');
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
    img.onload=()=>target.classList.remove('preload-hidden');
    img.onerror=()=>{target.classList.remove('preload-hidden');emoji.textContent='🥊';};
    emoji.appendChild(img);
  }

  function animate(){
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.boxing-bag-image');
    if(!img||typeof img.animate!=='function')return;
    if(activeAnimation)activeAnimation.cancel();
    activeAnimation=img.animate([
      {transform:'rotate(0deg) translate3d(0,0,0)'},
      {transform:'rotate(-13deg) translate3d(-4px,0,0)',offset:.10},
      {transform:'rotate(10deg) translate3d(4px,0,0)',offset:.25},
      {transform:'rotate(-7deg) translate3d(-3px,0,0)',offset:.42},
      {transform:'rotate(5deg) translate3d(2px,0,0)',offset:.59},
      {transform:'rotate(-2.8deg) translate3d(-1px,0,0)',offset:.76},
      {transform:'rotate(1.2deg) translate3d(0,0,0)',offset:.90},
      {transform:'rotate(0deg) translate3d(0,0,0)'}
    ],{duration:780,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none'});
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
    if(target)target.addEventListener('pointerdown',animate,{passive:true,capture:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
