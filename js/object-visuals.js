'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.png?v=7';
  const CELL_SRC='./assets/backgrounds/cellmate.png?v=3';
  const PUSHUPS_UP='./assets/backgrounds/pushups.png?v=3';
  const PUSHUPS_DOWN='./assets/backgrounds/pushups_2.png?v=3';
  const TRAINER_DOWN='./assets/backgrounds/trainer_down.png?v=4';
  const TRAINER_UP='./assets/backgrounds/trainer_up.png?v=4';
  const BAG_NAME='Груша',CELL_NAME='Сокамерник',PUSHUPS_NAME='Отжимания',TRAINER_NAME='Тренажёр';
  const AUTHORITY_NAME='Разборка',BREAKTHROUGH_NAME='Прорыв';
  let pushupQueue=0,pushupRunning=false,trainerQueue=0,trainerRunning=false;\n  let pushupLastTick=0,trainerLastTick=0;\n  let pushupRunId=0,trainerRunId=0;
  let built=false;
  let lastIdx=-1;

  const nameOf=()=>String(document.getElementById('object-name')?.textContent||'').trim();

  let visualGeneration=0;
  function getIdx(){
    const st=window.getGameState?window.getGameState():null;
    if(st&&Number.isFinite(Number(st.currentObject)))return Number(st.currentObject);
    const emoji=document.getElementById('object-emoji');
    return Number(emoji?.dataset.objectIndex||0);
  }

  function ensureBuilt(){
    const emoji=document.getElementById('object-emoji');
    if(!emoji||built)return;
    built=true;

    const bag=document.createElement('img');
    bag.className='boxing-bag-image';bag.src=BAG_SRC;bag.draggable=false;bag.alt='';
    bag.dataset.stage='0';bag.style.display='none';

    const cell=document.createElement('img');
    cell.className='cellmate-image';cell.src=CELL_SRC;cell.draggable=false;cell.alt='';
    cell.dataset.stage='1';cell.style.display='none';

    const pA=document.createElement('img'),pB=document.createElement('img');
    pA.className='pushups-image frame-a';pB.className='pushups-image frame-b';
    pA.src=PUSHUPS_UP;pB.src=PUSHUPS_DOWN;pA.draggable=false;pB.draggable=false;pA.alt='';pB.alt='';
    pA.dataset.stage='2';pB.dataset.stage='2';
    pA.style.display='none';pB.style.display='none';
    pA.style.opacity='1';pB.style.opacity='0';pA.style.visibility='visible';pB.style.visibility='hidden';
    pA.style.zIndex='2';pB.style.zIndex='1';

    const tA=document.createElement('img'),tB=document.createElement('img');
    tA.className='trainer-image frame-a';tB.className='trainer-image frame-b';
    tA.src=TRAINER_DOWN;tB.src=TRAINER_UP;tA.draggable=false;tB.draggable=false;tA.alt='';tB.alt='';
    tA.dataset.stage='3';tB.dataset.stage='3';
    tA.style.display='none';tB.style.display='none';
    tA.style.opacity='1';tB.style.opacity='0';tA.style.visibility='visible';tB.style.visibility='hidden';
    tA.style.zIndex='2';tB.style.zIndex='1';

    emoji.append(bag,cell,pA,pB,tA,tB);
  }

  function showOnly(idx){
    const emoji=document.getElementById('object-emoji'),target=document.getElementById('tap-object');
    if(!emoji||!target)return;
    ensureBuilt();

    // When the stage changes, invalidate queued frame animations from the old stage.
    // All images stay mounted in DOM; only the current data-stage remains visible.
    if(lastIdx!==idx){
      pushupQueue=0;
      trainerQueue=0;
      if(idx!==2)pushupRunning=false;
      if(idx!==3)trainerRunning=false;
      emoji.querySelectorAll('img[data-stage]').forEach(img=>{
        img.style.display='none';
      });
    }

    emoji.dataset.objectIndex=String(idx);

    const bag=idx===0,cell=idx===1,push=idx===2,train=idx===3;
    const auth=idx===4,breakth=idx===5;
    target.classList.toggle('bag-mode',bag);
    target.classList.toggle('cellmate-mode',cell);
    target.classList.toggle('pushups-mode',push);
    target.classList.toggle('trainer-mode',train);
    target.classList.toggle('authority-mode',auth);
    target.classList.toggle('breakthrough-mode',breakth);

    emoji.querySelectorAll('img[data-stage]').forEach(img=>{
      const on=Number(img.dataset.stage)===idx&&idx<=3;
      img.style.display=on?'block':'none';
    });

    target.classList.remove('preload-hidden');
    document.getElementById('game-container')?.classList.remove('game-booting');
    lastIdx=idx;
  }

  function sync(){
    showOnly(getIdx());
  }

  function playEntrance(img){
    if(!img)return;
    img.style.animation='none';
    void img.offsetWidth;
    const base=img.classList.contains('cellmate-image')?'scale(var(--cellmate-scale,2.05)) ':img.classList.contains('trainer-image')?'scale(1.14) ':'';
    img.style.setProperty('--object-base-transform',base);
    img.style.animation='object-enter .42s cubic-bezier(.22,.61,.36,1) both';
  }

  function swing(img){
    if(!img)return;
    // Use the Web Animations API for the actual tap motion. This avoids
    // conflicts with static CSS transform/animation rules on the image.
    if(img._tapMotion){
      try{img._tapMotion.cancel()}catch(e){}
    }
    const base=img.classList.contains('cellmate-image')
      ?'scale(1.85)'
      :img.classList.contains('trainer-image')
        ?'scale(1.14)'
        :'none';
    img.style.transformOrigin=img.classList.contains('cellmate-image')?'50% 50%':'50% 8%';
    img._tapMotion=img.animate([
      {transform:base},
      {transform:base+' rotate(-9deg) translate3d(-3px,0,0)',offset:.12},
      {transform:base+' rotate(7deg) translate3d(3px,0,0)',offset:.27},
      {transform:base+' rotate(-5deg) translate3d(-2px,0,0)',offset:.45},
      {transform:base+' rotate(3deg) translate3d(2px,0,0)',offset:.63},
      {transform:base+' rotate(-1.5deg) translate3d(-1px,0,0)',offset:.80},
      {transform:base}
    ],{duration:680,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none'});
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
  const PUSH_DOWN_MS=190, PUSH_UP_MS=70;\n  function runPush(){\n    const emoji=document.getElementById('object-emoji');\n    if(!emoji||emoji.querySelectorAll('.pushups-image').length<2){pushupQueue=0;pushupRunning=false;return;}\n    if(pushupRunning && performance.now()-pushupLastTick<=500)return;\n    pushupRunId++;\n    const runId=pushupRunId;\n    pushupRunning=true;\n    pushupLastTick=performance.now();\n    let phaseStart=pushupLastTick,phase='down';\n    swap(emoji,'pushups-image');\n    function tick(now){\n      if(runId!==pushupRunId || Number(emoji.dataset.objectIndex)!==2){if(runId===pushupRunId)pushupRunning=false;return;}\n      pushupLastTick=now;\n      const live=[...emoji.querySelectorAll('.pushups-image')].filter(el=>el.style.display!=='none');\n      if(live.length<2){pushupQueue=0;pushupRunning=false;return;}\n      const elapsed=now-phaseStart;\n      if(phase==='down' && elapsed>=PUSH_DOWN_MS){swap(emoji,'pushups-image');phase='up';phaseStart=now;}\n      else if(phase==='up' && elapsed>=PUSH_UP_MS){\n        pushupQueue=Math.max(0,pushupQueue-1);\n        if(pushupQueue<=0){pushupRunning=false;return;}\n        swap(emoji,'pushups-image');phase='down';phaseStart=now;\n      }\n      requestAnimationFrame(tick);\n    }\n    requestAnimationFrame(tick);\n  }\n\n  const TRAIN_DOWN_MS=190, TRAIN_UP_MS=90;\n  function runTrainer(){\n    const emoji=document.getElementById('object-emoji');\n    if(!emoji||emoji.querySelectorAll('.trainer-image').length<2){trainerQueue=0;trainerRunning=false;return;}\n    if(trainerRunning && performance.now()-trainerLastTick<=500)return;\n    trainerRunId++;\n    const runId=trainerRunId;\n    trainerRunning=true;\n    trainerLastTick=performance.now();\n    let phaseStart=trainerLastTick,phase='down';\n    swap(emoji,'trainer-image');\n    function tick(now){\n      if(runId!==trainerRunId || Number(emoji.dataset.objectIndex)!==3){if(runId===trainerRunId)trainerRunning=false;return;}\n      trainerLastTick=now;\n      const live=[...emoji.querySelectorAll('.trainer-image')].filter(el=>el.style.display!=='none');\n      if(live.length<2){trainerQueue=0;trainerRunning=false;return;}\n      const elapsed=now-phaseStart;\n      if(phase==='down' && elapsed>=TRAIN_DOWN_MS){swap(emoji,'trainer-image');phase='up';phaseStart=now;}\n      else if(phase==='up' && elapsed>=TRAIN_UP_MS){\n        trainerQueue=Math.max(0,trainerQueue-1);\n        if(trainerQueue<=0){trainerRunning=false;return;}\n        swap(emoji,'trainer-image');phase='down';phaseStart=now;\n      }\n      requestAnimationFrame(tick);\n    }\n    requestAnimationFrame(tick);\n  }\n\n  document.addEventListener('visibilitychange',()=>{\n    if(document.hidden){\n      pushupQueue=0;pushupRunning=false;pushupLastTick=0;pushupRunId++;\n      trainerQueue=0;trainerRunning=false;trainerLastTick=0;trainerRunId++;\n    }\n  });\n
  function animate(){
    const n=nameOf();
    if(n===AUTHORITY_NAME||n===BREAKTHROUGH_NAME)return;
    const emoji=document.getElementById('object-emoji');
    if(!emoji)return;
    const stage=Number(emoji.dataset.objectIndex);
    const img=[...emoji.querySelectorAll('img[data-stage="'+stage+'"]')]
      .find(el=>el.style.display!=='none');
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

  function init(){
    style();
    ensureBuilt();
    sync();
    // Expose a tiny diagnostic flag so the game can be checked without
    // changing the DOM/animation architecture.
    window.__objectVisualsReady=true;
  }

  // Public API used by game.js and authority-ui.js
  window.refreshObjectVisuals=function(){
    sync();
  };
  window.animateObjectVisual=animate;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
