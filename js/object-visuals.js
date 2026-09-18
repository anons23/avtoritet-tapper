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
  let areaObserver=null,nameObserver=null;
  let lastSyncedName='';
  let initRetries=0;

  const nameOf=()=>String(document.getElementById('object-name')?.textContent||'').trim();

  function sync(){
    const emoji=document.getElementById('object-emoji'),target=document.getElementById('tap-object');
    if(!emoji||!target)return;
    const st=window.getGameState?window.getGameState():null;
    const idx=st&&Number.isFinite(Number(st.currentObject))?Number(st.currentObject):Number(emoji.dataset.objectIndex||0);
    emoji.dataset.objectIndex=String(idx);
    const bag=idx===0,cell=idx===1,push=idx===2,train=idx===3;
    const auth=idx===4,breakth=idx===5;
    target.classList.toggle('bag-mode',bag);target.classList.toggle('cellmate-mode',cell);target.classList.toggle('pushups-mode',push);target.classList.toggle('trainer-mode',train);target.classList.toggle('authority-mode',auth);target.classList.toggle('breakthrough-mode',breakth);
    const old=emoji.querySelectorAll('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
    if(!bag&&!cell&&!push&&!train){
      old.forEach(x=>x.remove());
      target.classList.remove('preload-hidden');
      pushupQueue=0;pushupRunning=false;trainerQueue=0;trainerRunning=false;lastSyncedName=String(idx);
      return;
    }
    const cls=bag?'boxing-bag-image':cell?'cellmate-image':push?'pushups-image':'trainer-image';
    const existing=emoji.querySelectorAll('.'+cls);
    if(existing.length){
      old.forEach(x=>{if(!x.classList.contains(cls))x.remove()});
      target.classList.remove('preload-hidden');
      lastSyncedName=String(idx);
      return;
    }
    old.forEach(x=>x.remove());
    target.classList.add('preload-hidden');
    if(push||train){
      const a=document.createElement('img'),b=document.createElement('img');
      a.alt='';b.alt='';a.className=cls+' frame-a';b.className=cls+' frame-b';
      a.draggable=false;b.draggable=false;
      a.src=push?PUSHUPS_UP:TRAINER_DOWN;b.src=push?PUSHUPS_DOWN:TRAINER_UP;
      a.style.opacity='1';b.style.opacity='0';a.style.visibility='visible';b.style.visibility='hidden';a.style.zIndex='2';b.style.zIndex='1';
      emoji.append(a,b);
      const reveal=()=>{target.classList.remove('preload-hidden');lastSyncedName=String(idx)};
      a.onload=reveal;b.onload=reveal;a.onerror=reveal;b.onerror=reveal;
      if(a.complete&&b.complete)reveal();
    }else{
      const img=document.createElement('img');
      img.src=bag?BAG_SRC:CELL_SRC;img.alt='';img.className=cls;img.draggable=false;
      const reveal=()=>{target.classList.remove('preload-hidden');lastSyncedName=String(idx)};
      img.onload=reveal;img.onerror=reveal;emoji.appendChild(img);if(img.complete)reveal();
    }
  }
  function playEntrance(img){
    if(!img)return;
    img.style.animation='none';
    void img.offsetWidth;
    const base=img.classList.contains('cellmate-image')?'scale(1.85) ':'';
    img.style.setProperty('--object-base-transform',base);
    img.style.animation='object-enter .42s cubic-bezier(.22,.61,.36,1) both';
  }

  function swing(img){
    img.style.animation='none';
    void img.offsetWidth;
    img.style.setProperty('--object-base-transform',img.classList.contains('cellmate-image')?'scale(1.85) ':'');
    img.style.transformOrigin=img.classList.contains('cellmate-image')?'50% 50%':'50% 8%';
    img.style.animation='object-swing .68s cubic-bezier(.22,.61,.36,1) both';
  }

  function style(){
    if(document.getElementById('object-visuals-anim-style'))return;
    const s=document.createElement('style');
    s.id='object-visuals-anim-style';
    s.textContent='@keyframes object-swing{0%{transform:var(--object-base-transform) rotate(0deg)}12%{transform:var(--object-base-transform) rotate(-9deg) translate3d(-3px,0,0)}27%{transform:var(--object-base-transform) rotate(7deg) translate3d(3px,0,0)}45%{transform:var(--object-base-transform) rotate(-5deg) translate3d(-2px,0,0)}63%{transform:var(--object-base-transform) rotate(3deg) translate3d(2px,0,0)}80%{transform:var(--object-base-transform) rotate(-1.5deg) translate3d(-1px,0,0)}100%{transform:var(--object-base-transform) rotate(0deg)}}'+
      '@keyframes authority-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}'+
      '@keyframes breakthrough-pulse{0%,100%{transform:translateX(0)}35%{transform:translateX(-5px)}65%{transform:translateX(5px)}}'+
      '.authority-mode #object-emoji{animation:authority-pulse .9s ease-in-out infinite}'+
      '.breakthrough-mode #object-emoji{animation:breakthrough-pulse .7s ease-in-out infinite}'+
      '@keyframes object-enter{0%{opacity:0;transform:var(--object-base-transform) scale(.88) translateY(12px)}100%{opacity:1;transform:var(--object-base-transform) scale(1) translateY(0)}}';
    document.head.appendChild(s);
  }

  function swap(emoji,cls){
    const f=emoji.querySelectorAll('.'+cls);if(f.length<2)return;
    const cur=f[0].style.visibility!=='hidden'?f[0]:f[1];
    const next=cur===f[0]?f[1]:f[0];
    cur.style.opacity='0';cur.style.visibility='hidden';cur.style.zIndex='1';
    next.style.opacity='1';next.style.visibility='visible';next.style.zIndex='2';
  }
  const PUSH_DOWN_MS=190, PUSH_UP_MS=70, PUSH_CYCLE=PUSH_DOWN_MS+PUSH_UP_MS;
  function runPush(){
    if(pushupRunning)return;
    const emoji=document.getElementById('object-emoji');
    if(!emoji||emoji.querySelectorAll('.pushups-image').length<2){pushupQueue=0;return;}
    pushupRunning=true;
    let phaseStart=performance.now();
    let phase='down'; // down = showing down frame, up = showing up frame
    // Start cycle: go to down frame immediately
    swap(emoji,'pushups-image');
    function tick(now){
      const live=emoji.querySelectorAll('.pushups-image');
      if(live.length<2){pushupQueue=0;pushupRunning=false;return;}
      const elapsed=now-phaseStart;
      if(phase==='down'){
        if(elapsed>=PUSH_DOWN_MS){
          swap(emoji,'pushups-image');
          phase='up';
          phaseStart=now;
        }
      }else{ // up
        if(elapsed>=PUSH_UP_MS){
          pushupQueue=Math.max(0,pushupQueue-1);
          if(pushupQueue<=0){
            // Ensure resting frame is the "up" one
            if(live[0].style.opacity!=='1')swap(emoji,'pushups-image');
            pushupRunning=false;
            return;
          }
          // Next cycle
          swap(emoji,'pushups-image');
          phase='down';
          phaseStart=now;
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const TRAIN_DOWN_MS=190, TRAIN_UP_MS=90;
  function runTrainer(){
    if(trainerRunning)return;
    const emoji=document.getElementById('object-emoji');
    if(!emoji||emoji.querySelectorAll('.trainer-image').length<2){trainerQueue=0;return;}
    trainerRunning=true;
    let phaseStart=performance.now();
    let phase='down';
    swap(emoji,'trainer-image');
    function tick(now){
      const live=emoji.querySelectorAll('.trainer-image');
      if(live.length<2){trainerQueue=0;trainerRunning=false;return;}
      const elapsed=now-phaseStart;
      if(phase==='down'){
        if(elapsed>=TRAIN_DOWN_MS){
          swap(emoji,'trainer-image');
          phase='up';
          phaseStart=now;
        }
      }else{
        if(elapsed>=TRAIN_UP_MS){
          trainerQueue=Math.max(0,trainerQueue-1);
          if(trainerQueue<=0){
            if(live[0].style.opacity!=='1')swap(emoji,'trainer-image');
            trainerRunning=false;
            return;
          }
          swap(emoji,'trainer-image');
          phase='down';
          phaseStart=now;
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animate(){
    const n=nameOf();
    if(n===AUTHORITY_NAME||n===BREAKTHROUGH_NAME)return;
    const emoji=document.getElementById('object-emoji');
    const img=emoji?.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
    if(!img)return;
    if(img.classList.contains('pushups-image')){
      pushupQueue=Math.min(12,pushupQueue+1);
      runPush();
      return;
    }
    if(img.classList.contains('trainer-image')){
      trainerQueue=Math.min(12,trainerQueue+1);
      runTrainer();
      return;
    }
    swing(img);
  }

  function ensureObservers(){
    const name=document.getElementById('object-name');
    const area=document.getElementById('tap-area');

    // Re-attach name observer if the node was recreated
    if(name && (!nameObserver || nameObserver._node!==name)){
      if(nameObserver)nameObserver.disconnect();
      nameObserver=new MutationObserver(sync);
      nameObserver._node=name;
      nameObserver.observe(name,{childList:true,characterData:true,subtree:true});
    }

    // Watch the whole tap-area so we recover after authority-ui rewrites innerHTML
    if(area && (!areaObserver || areaObserver._node!==area)){
      if(areaObserver)areaObserver.disconnect();
      areaObserver=new MutationObserver(function(){
        // Debounce a bit — authority rewrite is a single burst
        clearTimeout(areaObserver._t);
        areaObserver._t=setTimeout(function(){
          ensureObservers();
          sync();
        },0);
      });
      areaObserver._node=area;
      areaObserver.observe(area,{childList:true,subtree:true});
    }
  }

  function init(){
    style();
    ensureObservers();
    sync();
    // Race fix: name/ui may not be ready on first paint — retry a few times
    function retry(){
      if(initRetries>=8)return;
      initRetries++;
      const emoji=document.getElementById('object-emoji');
      const name=nameOf();
      const hasImg=emoji&&emoji.querySelector('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image');
      // If we have a known object name but no image yet, or name changed — re-sync
      if((name==='Груша'||name==='Сокамерник'||name==='Отжимания'||name==='Тренажёр')&&!hasImg){
        sync();
        setTimeout(retry,120);
        return;
      }
      // Also re-sync once after short delay in case game.js ui() runs after us
      if(initRetries<=3){
        setTimeout(function(){sync();retry();},150);
      }
    }
    setTimeout(retry,80);
    // Backup: watch game state object index every 400ms for the first few seconds
    let polls=0;
    const poll=setInterval(function(){
      polls++;
      try{
        if(typeof window.getGameState==='function'){
          const s=window.getGameState();
          if(s&&typeof s.currentObject==='number'){
            const names=['Груша','Сокамерник','Отжимания','Тренажёр','Разборка','Прорыв'];
            const expected=s.jailed?'Карцер':(names[s.currentObject]||'');
            if(expected && expected!==nameOf()){
              // Force name from state if DOM lags behind
              const nameEl=document.getElementById('object-name');
              if(nameEl)nameEl.textContent=expected;
            }
            sync();
          }
        }
      }catch(e){}
      if(polls>=15)clearInterval(poll);
    },400);
  }

  // Public API used by game.js and authority-ui.js
  window.refreshObjectVisuals=function(){
    ensureObservers();
    sync();
  };
  window.animateObjectVisual=animate;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
