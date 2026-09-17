'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=5';
  const CELL_SRC='./assets/backgrounds/cellmate.png?v=1';
  const PUSHUPS_SRC='./assets/backgrounds/pushups.png?v=1';
  const BAG_NAME='Груша';
  const CELL_NAME='Сокамерник';
  const PUSHUPS_NAME='Отжимания';
  let activeAnimation=null;
  let pushupQueue=0;
  let pushupRunning=false;

  function sync(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji||!target)return;
    const current=String(name&&name.textContent||'').trim();
    const isBag=current===BAG_NAME;
    const isCell=current===CELL_NAME;
    const isPushups=current===PUSHUPS_NAME;
    if(!isBag&&!isCell&&!isPushups){
      const old=emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image');
      if(old)old.remove();
      if(activeAnimation)activeAnimation.cancel();
      activeAnimation=null;
      pushupQueue=0;
      pushupRunning=false;
      target.classList.remove('bag-mode','cellmate-mode','pushups-mode','preload-hidden');
      return;
    }
    target.classList.toggle('bag-mode',isBag);
    target.classList.toggle('cellmate-mode',isCell);
    target.classList.toggle('pushups-mode',isPushups);
    target.classList.add('preload-hidden');
    const cls=isBag?'boxing-bag-image':isCell?'cellmate-image':'pushups-image';
    let img=emoji.querySelector('.'+cls);
    if(img){target.classList.remove('preload-hidden');return;}
    const old=emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image');
    if(old)old.remove();
    emoji.textContent='';
    img=document.createElement('img');
    img.src=isBag?BAG_SRC:isCell?CELL_SRC:PUSHUPS_SRC;
    img.alt='';
    img.className=cls;
    img.draggable=false;
    img.onload=()=>target.classList.remove('preload-hidden');
    img.onerror=()=>target.classList.remove('preload-hidden');
    emoji.appendChild(img);
  }

  function animateSwing(img){
    if(!img||typeof img.animate!=='function')return;
    if(activeAnimation)activeAnimation.cancel();
    const scale=img.classList.contains('cellmate-image')?'scale(2.5) ':'';
    activeAnimation=img.animate([
      {transform:scale+'rotate(0deg) translate3d(0,0,0)'},
      {transform:scale+'rotate(-9deg) translate3d(-3px,0,0)',offset:.12},
      {transform:scale+'rotate(7deg) translate3d(3px,0,0)',offset:.27},
      {transform:scale+'rotate(-5deg) translate3d(-2px,0,0)',offset:.45},
      {transform:scale+'rotate(3deg) translate3d(2px,0,0)',offset:.63},
      {transform:scale+'rotate(-1.5deg) translate3d(-1px,0,0)',offset:.80},
      {transform:scale+'rotate(0deg) translate3d(0,0,0)'}
    ],{duration:680,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none'});
  }

  function runPushup(){
    if(pushupRunning)return;
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.pushups-image');
    if(!img||typeof img.animate!=='function'){pushupQueue=0;return;}
    pushupRunning=true;
    const step=()=>{
      if(pushupQueue<=0){pushupRunning=false;return;}
      pushupQueue--;
      activeAnimation=img.animate([
        {transform:'translate3d(0,0,0)'},
        {transform:'translate3d(0,34px,0)',offset:.45},
        {transform:'translate3d(0,0,0)'}
      ],{duration:380,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none'});
      activeAnimation.finished.then(step).catch(()=>{pushupRunning=false;});
    };
    step();
  }

  function animate(){
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image');
    if(!img)return;
    if(img.classList.contains('pushups-image')){
      pushupQueue=Math.min(12,pushupQueue+1);
      runPushup();
      return;
    }
    animateSwing(img);
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
