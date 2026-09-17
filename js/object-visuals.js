'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=6';
  const CELL_SRC='./assets/backgrounds/cellmate.png?v=2';
  const PUSHUPS_UP='./assets/backgrounds/pushups.png?v=2';
  const PUSHUPS_DOWN='./assets/backgrounds/pushups_2.png?v=2';
  const TRAINER_DOWN='./assets/backgrounds/trainer_down.png?v=2';
  const TRAINER_UP='./assets/backgrounds/trainer_up.png?v=2';
  const BAG_NAME='Груша';
  const CELL_NAME='Сокамерник';
  const PUSHUPS_NAME='Отжимания';
  const TRAINER_NAME='Тренажёр';
  const AUTHORITY_NAME='Разборка';
  const BREAKTHROUGH_NAME='Прорыв';
  let pushupQueue=0;
  let pushupRunning=false;
  let trainerQueue=0;
  let trainerRunning=false;

  function sync(){
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    const target=document.getElementById('tap-object');
    if(!emoji||!target)return;
    const current=String(name&&name.textContent||'').trim();
    const isBag=current===BAG_NAME;
    const isCell=current===CELL_NAME;
    const isPushups=current===PUSHUPS_NAME;
    const isTrainer=current===TRAINER_NAME;
    const isAuthority=current===AUTHORITY_NAME;
    const isBreakthrough=current===BREAKTHROUGH_NAME;
    if(!isBag&&!isCell&&!isPushups&&!isTrainer&&!isAuthority&&!isBreakthrough){
      const old=emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
      if(old)old.remove();
      pushupQueue=0;pushupRunning=false;trainerQueue=0;trainerRunning=false;
      target.classList.remove('bag-mode','cellmate-mode','pushups-mode','trainer-mode','authority-mode','breakthrough-mode','preload-hidden');
      return;
    }
    target.classList.toggle('bag-mode',isBag);
    target.classList.toggle('cellmate-mode',isCell);
    target.classList.toggle('pushups-mode',isPushups);
    target.classList.toggle('trainer-mode',isTrainer);
    target.classList.toggle('authority-mode',isAuthority);
    target.classList.toggle('breakthrough-mode',isBreakthrough);
    if(isAuthority||isBreakthrough){
      const old=emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
      if(old)old.remove();
      pushupQueue=0;pushupRunning=false;trainerQueue=0;trainerRunning=false;
      target.classList.remove('preload-hidden');
      return;
    }
    target.classList.add('preload-hidden');
    const cls=isBag?'boxing-bag-image':isCell?'cellmate-image':isPushups?'pushups-image':'trainer-image';
    let img=emoji.querySelector('.'+cls);
    if(img){target.classList.remove('preload-hidden');return;}
    const old=emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
    if(old)old.remove();
    emoji.textContent='';
    img=document.createElement('img');
    img.src=isBag?BAG_SRC:isCell?CELL_SRC:isPushups?PUSHUPS_UP:TRAINER_DOWN;
    img.alt='';
    img.className=cls;
    img.draggable=false;
    img.onload=()=>target.classList.remove('preload-hidden');
    img.onerror=()=>target.classList.remove('preload-hidden');
    emoji.appendChild(img);
  }

  function animateSwing(img){
    if(!img)return;
    img.style.animation='none';
    void img.offsetWidth;
    const base=img.classList.contains('cellmate-image')?'scale(2.5) ':'';
    img.style.animation='object-swing .68s cubic-bezier(.22,.61,.36,1) both';
    img.style.transformOrigin=img.classList.contains('cellmate-image')?'50% 50%':'50% 8%';
    img.style.setProperty('--object-base-transform',base);
  }

  function ensureStyle(){
    if(document.getElementById('object-visuals-anim-style'))return;
    const style=document.createElement('style');
    style.id='object-visuals-anim-style';
    style.textContent='@keyframes object-swing{0%{transform:var(--object-base-transform) rotate(0deg) translate3d(0,0,0)}12%{transform:var(--object-base-transform) rotate(-9deg) translate3d(-3px,0,0)}27%{transform:var(--object-base-transform) rotate(7deg) translate3d(3px,0,0)}45%{transform:var(--object-base-transform) rotate(-5deg) translate3d(-2px,0,0)}63%{transform:var(--object-base-transform) rotate(3deg) translate3d(2px,0,0)}80%{transform:var(--object-base-transform) rotate(-1.5deg) translate3d(-1px,0,0)}100%{transform:var(--object-base-transform) rotate(0deg) translate3d(0,0,0)}}@keyframes authority-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}@keyframes breakthrough-pulse{0%,100%{transform:translateX(0)}35%{transform:translateX(-5px)}65%{transform:translateX(5px)}}.authority-mode #object-emoji{animation:authority-pulse .9s ease-in-out infinite}.breakthrough-mode #object-emoji{animation:breakthrough-pulse .7s ease-in-out infinite}';
    document.head.appendChild(style);
  }

  function runPushup(){
    if(pushupRunning)return;
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.pushups-image');
    if(!img){pushupQueue=0;return;}
    pushupRunning=true;
    const step=()=>{
      if(pushupQueue<=0){img.src=PUSHUPS_UP;pushupRunning=false;return;}
      pushupQueue--;img.src=PUSHUPS_DOWN;
      setTimeout(()=>{img.src=PUSHUPS_UP;setTimeout(step,70)},190);
    };
    step();
  }

  function runTrainer(){
    if(trainerRunning)return;
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.trainer-image');
    if(!img)return;
    trainerRunning=true;
    const step=()=>{
      if(trainerQueue<=0){img.src=TRAINER_DOWN;trainerRunning=false;return;}
      trainerQueue--;img.src=TRAINER_UP;
      setTimeout(()=>{img.src=TRAINER_DOWN;setTimeout(step,90)},190);
    };
    step();
  }

  function animate(){
    const emoji=document.getElementById('object-emoji');
    const img=emoji&&emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
    if(!img)return;
    if(img.classList.contains('pushups-image')){pushupQueue=Math.min(12,pushupQueue+1);runPushup();return;}
    if(img.classList.contains('trainer-image')){trainerQueue=Math.min(12,trainerQueue+1);runTrainer();return;}
    animateSwing(img);
  }

  function init(){
    ensureStyle();
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
