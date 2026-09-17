'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=5';
  const CELL_SRC='./assets/backgrounds/cellmate.png?v=1';
  const BAG_NAME='Груша';
  const CELL_NAME='Сокамерник';
  let activeAnimation=null;

  function sync(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji||!target)return;
    const current=String(name&&name.textContent||'').trim();
    const isBag=current===BAG_NAME;
    const isCell=current===CELL_NAME;
    if(!isBag&&!isCell){
      const old=emoji.querySelector('.boxing-bag-image,.cellmate-image');
      if(old)old.remove();
      if(activeAnimation)activeAnimation.cancel();
      activeAnimation=null;
      target.classList.remove('bag-mode','cellmate-mode','preload-hidden');
      return;
    }
    target.classList.toggle('bag-mode',isBag);
    target.classList.toggle('cellmate-mode',isCell);
    target.classList.add('preload-hidden');
    const cls=isBag?'boxing-bag-image':'cellmate-image';
    let img=emoji.querySelector('.'+cls);
    if(img){target.classList.remove('preload-hidden');return;}
    const old=emoji.querySelector('.boxing-bag-image,.cellmate-image');
    if(old)old.remove();
    emoji.textContent='';
    img=document.createElement('img');
    img.src=isBag?BAG_SRC:CELL_SRC;
    img.alt='';
    img.className=cls;
    img.draggable=false;
    img.onload=()=>target.classList.remove('preload-hidden');
    img.onerror=()=>target.classList.remove('preload-hidden');
    emoji.appendChild(img);
  }

  function animate(){
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.boxing-bag-image,.cellmate-image');
    if(!img||typeof img.animate!=='function')return;
    if(activeAnimation)activeAnimation.cancel();
    activeAnimation=img.animate([
      {transform:'rotate(0deg) translate3d(0,0,0)'},
      {transform:'rotate(-9deg) translate3d(-3px,0,0)',offset:.12},
      {transform:'rotate(7deg) translate3d(3px,0,0)',offset:.27},
      {transform:'rotate(-5deg) translate3d(-2px,0,0)',offset:.45},
      {transform:'rotate(3deg) translate3d(2px,0,0)',offset:.63},
      {transform:'rotate(-1.5deg) translate3d(-1px,0,0)',offset:.80},
      {transform:'rotate(0deg) translate3d(0,0,0)'}
    ],{duration:680,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none'});
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
