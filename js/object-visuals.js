'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=7';
  const CELL_SRC='./assets/backgrounds/cellmate.png?v=3';
  const PUSHUPS_UP='./assets/backgrounds/pushups.png?v=3';
  const PUSHUPS_DOWN='./assets/backgrounds/pushups_2.png?v=3';
  const TRAINER_DOWN='./assets/backgrounds/trainer_down.png?v=3';
  const TRAINER_UP='./assets/backgrounds/trainer_up.png?v=3';
  const BAG_NAME='Груша',CELL_NAME='Сокамерник',PUSHUPS_NAME='Отжимания',TRAINER_NAME='Тренажёр';
  const AUTHORITY_NAME='Разборка',BREAKTHROUGH_NAME='Прорыв';
  let pushupQueue=0,pushupRunning=false,trainerQueue=0,trainerRunning=false;
  const nameOf=()=>String(document.getElementById('object-name')?.textContent||'').trim();
  function sync(){
    const emoji=document.getElementById('object-emoji'),target=document.getElementById('tap-object');if(!emoji||!target)return;
    const n=nameOf(),bag=n===BAG_NAME,cell=n===CELL_NAME,push=n===PUSHUPS_NAME,train=n===TRAINER_NAME,auth=n===AUTHORITY_NAME,breakth=n===BREAKTHROUGH_NAME;
    const old=emoji.querySelectorAll('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
    target.classList.toggle('bag-mode',bag);target.classList.toggle('cellmate-mode',cell);target.classList.toggle('pushups-mode',push);target.classList.toggle('trainer-mode',train);target.classList.toggle('authority-mode',auth);target.classList.toggle('breakthrough-mode',breakth);
    if(!bag&&!cell&&!push&&!train&&!auth&&!breakth){old.forEach(x=>x.remove());target.classList.remove('preload-hidden');pushupQueue=0;pushupRunning=false;trainerQueue=0;trainerRunning=false;return;}
    if(auth||breakth){old.forEach(x=>x.remove());pushupQueue=0;pushupRunning=false;trainerQueue=0;trainerRunning=false;target.classList.remove('preload-hidden');return;}
    const cls=bag?'boxing-bag-image':cell?'cellmate-image':push?'pushups-image':'trainer-image';
    if(emoji.querySelector('.'+cls)){target.classList.remove('preload-hidden');return;}
    old.forEach(x=>x.remove());target.classList.add('preload-hidden');
    if(push||train){
      const a=document.createElement('img'),b=document.createElement('img');a.alt='';b.alt='';a.className=cls+' frame-a';b.className=cls+' frame-b';a.draggable=false;b.draggable=false;
      a.src=push?PUSHUPS_UP:TRAINER_DOWN;b.src=push?PUSHUPS_DOWN:TRAINER_UP;a.style.opacity='1';b.style.opacity='0';a.style.zIndex='2';b.style.zIndex='1';emoji.append(a,b);
      const reveal=()=>target.classList.remove('preload-hidden');a.onload=reveal;b.onload=reveal;a.onerror=reveal;b.onerror=reveal;
    }else{
      const img=document.createElement('img');img.src=bag?BAG_SRC:CELL_SRC;img.alt='';img.className=cls;img.draggable=false;img.onload=()=>target.classList.remove('preload-hidden');img.onerror=()=>target.classList.remove('preload-hidden');emoji.appendChild(img);
    }
  }
  function swing(img){img.style.animation='none';void img.offsetWidth;img.style.setProperty('--object-base-transform',img.classList.contains('cellmate-image')?'scale(2.5) ':'');img.style.transformOrigin=img.classList.contains('cellmate-image')?'50% 50%':'50% 8%';img.style.animation='object-swing .68s cubic-bezier(.22,.61,.36,1) both';}
  function style(){if(document.getElementById('object-visuals-anim-style'))return;const s=document.createElement('style');s.id='object-visuals-anim-style';s.textContent='@keyframes object-swing{0%{transform:var(--object-base-transform) rotate(0deg)}12%{transform:var(--object-base-transform) rotate(-9deg) translate3d(-3px,0,0)}27%{transform:var(--object-base-transform) rotate(7deg) translate3d(3px,0,0)}45%{transform:var(--object-base-transform) rotate(-5deg) translate3d(-2px,0,0)}63%{transform:var(--object-base-transform) rotate(3deg) translate3d(2px,0,0)}80%{transform:var(--object-base-transform) rotate(-1.5deg) translate3d(-1px,0,0)}100%{transform:var(--object-base-transform) rotate(0deg)}}@keyframes authority-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}@keyframes breakthrough-pulse{0%,100%{transform:translateX(0)}35%{transform:translateX(-5px)}65%{transform:translateX(5px)}}.authority-mode #object-emoji{animation:authority-pulse .9s ease-in-out infinite}.breakthrough-mode #object-emoji{animation:breakthrough-pulse .7s ease-in-out infinite}';document.head.appendChild(s);}
  function swap(emoji,cls){const f=emoji.querySelectorAll('.'+cls);if(f.length<2)return;const cur=f[0].style.opacity==='1'?f[0]:f[1],next=cur===f[0]?f[1]:f[0];next.style.zIndex='2';cur.style.zIndex='1';next.style.opacity='1';cur.style.opacity='0';}
  function runPush(){if(pushupRunning)return;const emoji=document.getElementById('object-emoji');if(!emoji||emoji.querySelectorAll('.pushups-image').length<2){pushupQueue=0;return;}pushupRunning=true;const step=()=>{const live=emoji.querySelectorAll('.pushups-image');if(live.length<2){pushupQueue=0;pushupRunning=false;return;}if(pushupQueue<=0){if(live[0].style.opacity!=='1')swap(emoji,'pushups-image');pushupRunning=false;return;}pushupQueue--;swap(emoji,'pushups-image');setTimeout(()=>{swap(emoji,'pushups-image');setTimeout(step,70)},190)};step();}
  function runTrainer(){if(trainerRunning)return;const emoji=document.getElementById('object-emoji');if(!emoji||emoji.querySelectorAll('.trainer-image').length<2){trainerQueue=0;return;}trainerRunning=true;const step=()=>{const live=emoji.querySelectorAll('.trainer-image');if(live.length<2){trainerQueue=0;trainerRunning=false;return;}if(trainerQueue<=0){if(live[0].style.opacity!=='1')swap(emoji,'trainer-image');trainerRunning=false;return;}trainerQueue--;swap(emoji,'trainer-image');setTimeout(()=>{swap(emoji,'trainer-image');setTimeout(step,90)},190)};step();}
  function animate(){const n=nameOf();if(n===AUTHORITY_NAME||n===BREAKTHROUGH_NAME)return;const emoji=document.getElementById('object-emoji');const img=emoji?.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');if(!img)return;if(img.classList.contains('pushups-image')){pushupQueue=Math.min(12,pushupQueue+1);runPush();return;}if(img.classList.contains('trainer-image')){trainerQueue=Math.min(12,trainerQueue+1);runTrainer();return;}swing(img);}
  function init(){style();const name=document.getElementById('object-name'),target=document.getElementById('tap-object');if(!target)return;if(name){const observer=new MutationObserver(sync);observer.observe(name,{childList:true,characterData:true,subtree:true});}sync();target.addEventListener('pointerdown',animate,{passive:true,capture:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();