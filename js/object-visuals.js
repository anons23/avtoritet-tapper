'use strict';
(function(){
  const BAG_SRC='./assets/backgrounds/boxing-bag.webp?v=7';
  const CELL_SRC='./assets/backgrounds/cellmate.webp?v=3';
  const PUSHUPS_UP='./assets/backgrounds/pushups.webp?v=3';
  const PUSHUPS_DOWN='./assets/backgrounds/pushups_2.webp?v=3';
  const TRAINER_DOWN='./assets/backgrounds/trainer_down.webp?v=4';
  const TRAINER_UP='./assets/backgrounds/trainer_up.webp?v=4';
  const SQUAT_A='./assets/backgrounds/squat.webp?v=1';
  const SQUAT_B='./assets/backgrounds/squat_2.webp?v=1';
  const BAG_NAME='Груша',CELL_NAME='Сокамерник',PUSHUPS_NAME='Отжимания',TRAINER_NAME='Тренажёр';
  const AUTHORITY_NAME='Разборка';
  let pushupQueue=0,pushupRunning=false,trainerQueue=0,trainerRunning=false;
  let squatQueue=0,squatRunning=false,squatLastTick=0,squatRunId=0;
  let pushupLastTick=0,trainerLastTick=0;
  let pushupRunId=0,trainerRunId=0;
  let built=false;
  let lastIdx=-1;
  let lastJailMode=false;

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
    if(!emoji)return;
    const existing=emoji.querySelectorAll('img[data-stage]');
    if(built&&existing.length>=6)return;
    built=true;
    existing.forEach(n=>n.remove());

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

    const sA=document.createElement('img'),sB=document.createElement('img');
    sA.className='squat-image frame-a';sB.className='squat-image frame-b';
    sA.src=SQUAT_A;sB.src=SQUAT_B;sA.draggable=false;sB.draggable=false;sA.alt='';sB.alt='';
    sA.dataset.jailFrame='1';sB.dataset.jailFrame='1';
    sA.style.display='none';sB.style.display='none';
    sA.style.opacity='1';sB.style.opacity='0';sA.style.visibility='visible';sB.style.visibility='hidden';
    sA.style.zIndex='2';sB.style.zIndex='1';
    emoji.append(bag,cell,pA,pB,tA,tB,sA,sB);
  }

  function showOnly(idx){
    const emoji=document.getElementById('object-emoji'),target=document.getElementById('tap-object');
    if(!emoji||!target)return;
    ensureBuilt();
    const st=window.getGameState?window.getGameState():null;
    const jailed=!!st?.jailed;

    // When the stage or jail mode changes, invalidate queued frame animations from the old mode.
    // All images stay mounted in DOM; only the current data-stage remains visible.
    if(lastIdx!==idx||lastJailMode!==jailed){
      pushupQueue=0;
      pushupRunning=false;
      pushupLastTick=0;
      pushupRunId++;
      trainerQueue=0;
      trainerRunning=false;
      trainerLastTick=0;
      trainerRunId++;
      squatQueue=0;squatRunning=false;squatLastTick=0;squatRunId++;
      emoji.querySelectorAll('img[data-stage],img[data-jail-frame]').forEach(img=>{
        img.style.display='none';
      });
    }

    emoji.dataset.objectIndex=String(idx);

    const bag=idx===0,cell=idx===1,push=idx===2,train=idx===3;
    const auth=idx===4;
    target.classList.toggle('bag-mode',bag);
    target.classList.toggle('cellmate-mode',cell);
    target.classList.toggle('pushups-mode',push);
    target.classList.toggle('trainer-mode',train);
    target.classList.toggle('authority-mode',auth);
    target.classList.toggle('jail-mode',jailed);

    emoji.querySelectorAll('img[data-stage]').forEach(img=>{
      const on=!jailed&&Number(img.dataset.stage)===idx&&idx<=3;
      img.style.display=on?'block':'none';
    });
    emoji.querySelectorAll('img[data-jail-frame]').forEach(img=>{
      img.style.display=jailed?'block':'none';
    });

    target.classList.remove('preload-hidden');
    document.getElementById('game-container')?.classList.remove('game-booting');
    lastIdx=idx;
    lastJailMode=jailed;
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

  /* Tap animation styles (only груша and сокамерник; other stages keep their frame animations).
     BAG_TAP:  'phys'  = Г2 физика удара | 'heavy' = Г3 тяжёлый мешок | 'classic' = старое покачивание
     CELL_TAP: 'recoil'= С2 отдача       | 'stagger'= С3 пропустил удар | 'classic' = старое покачивание */
  const BAG_TAP='phys';
  const CELL_TAP='recoil';
  const BASE_FILTER='drop-shadow(0 14px 18px rgba(0,0,0,.55))';
  let fxLayer=null,lastTapAt=0,combo=0,heavyCount=0,lastFxAt=0;

  function fxRoot(){
    if(fxLayer&&fxLayer.isConnected)return fxLayer;
    fxLayer=document.createElement('div');
    fxLayer.id='tap-fx-layer';
    fxLayer.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1300;overflow:hidden';
    document.body.appendChild(fxLayer);
    return fxLayer;
  }
  function tapPoint(img,e){
    const r=img.getBoundingClientRect();
    let x=r.left+r.width/2,y=r.top+r.height*0.55;
    const t=e&&(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e);
    if(t&&Number.isFinite(t.clientX)&&t.clientX>0){x=t.clientX;y=t.clientY;}
    const dir=x<r.left+r.width/2?1:-1; // tap on the left pushes to the right
    return {x,y,dir};
  }
  function damped(base,amp,freq,decay,n,fn){
    const k=[];
    for(let i=0;i<=n;i++){const t=i/n;k.push({transform:base+' '+fn(amp*Math.exp(-decay*t)*Math.cos(freq*t),i),offset:t});}
    k[k.length-1].transform=base;
    return k;
  }
  function dust(x,y,dir){
    const now=performance.now(); if(now-lastFxAt<90)return; lastFxAt=now;
    const root=fxRoot();
    for(let i=0;i<6;i++){
      const d=document.createElement('div');
      d.style.cssText='position:absolute;width:8px;height:8px;border-radius:50%;background:#d9c7a3;left:'+x+'px;top:'+y+'px';
      root.appendChild(d);
      const ang=(Math.random()*2.2-1.1)+(dir>0?Math.PI:0),dist=18+Math.random()*28;
      d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},
        {transform:'translate(calc(-50% + '+(Math.cos(ang)*dist).toFixed(1)+'px),calc(-50% + '+(Math.sin(ang)*dist-10).toFixed(1)+'px)) scale(.3)',opacity:0}],
        {duration:380+Math.random()*180,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>d.remove();
    }
  }
  function ring(x,y,big){
    const r=document.createElement('div'),s=big?150:90;
    r.style.cssText='position:absolute;border:3px solid #ffd27a;border-radius:50%;left:'+x+'px;top:'+y+'px';
    fxRoot().appendChild(r);
    r.animate([{width:'10px',height:'10px',margin:'-5px 0 0 -5px',opacity:1},{width:s+'px',height:s+'px',margin:'-'+s/2+'px 0 0 -'+s/2+'px',opacity:0}],
      {duration:big?520:380,easing:'ease-out'}).onfinish=()=>r.remove();
  }
  function screenShake(px){
    const g=document.getElementById('tap-area')||document.getElementById('game-container');
    if(!g||!g.animate)return;
    g.animate([{transform:'translate(0,0)'},{transform:'translate('+(-px)+'px,'+(px/2)+'px)'},{transform:'translate('+px+'px,'+(-px/2)+'px)'},{transform:'translate(0,0)'}],{duration:200});
  }
  function classicSwing(img,base){
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

  function swing(img,e){
    if(!img)return;
    if(img._tapMotion){try{img._tapMotion.cancel()}catch(err){}}
    const isBag=img.classList.contains('boxing-bag-image');
    const isCell=img.classList.contains('cellmate-image');
    // Use the transform the element really has at rest (CSS rules differ per screen size),
    // otherwise the tap animation jumps to another scale (cellmate grew ~35% on every tap).
    const rest=getComputedStyle(img).transform;
    const base=(rest&&rest!=='none')?rest:'translate(0,0)';
    const p=tapPoint(img,e);

    if(isBag){
      img.style.transformOrigin='50% 8%';
      if(BAG_TAP==='phys'){ // Г2
        const now=performance.now(); combo=(now-lastTapAt<450)?Math.min(6,combo+1):0; lastTapAt=now;
        const amp=(9+combo*2)*p.dir;
        img._tapMotion=img.animate(damped(base,amp,Math.PI*5.2,3.4,26,(v,i)=>{
          const sq=i<3?' scale('+(1-0.05*(3-i)/3).toFixed(3)+','+(1+0.04*(3-i)/3).toFixed(3)+')':'';
          return 'rotate('+v.toFixed(2)+'deg) translateX('+(v*0.6).toFixed(1)+'px)'+sq;}),{duration:1150,easing:'linear'});
        dust(p.x,p.y,p.dir);
        return;
      }
      if(BAG_TAP==='heavy'){ // Г3
        heavyCount++; const big=heavyCount%5===0, a=(big?7:4)*p.dir;
        img._tapMotion=img.animate([
          {transform:base},
          {transform:base+' rotate('+a+'deg) scale('+(big?.9:.95)+','+(big?1.06:1.03)+')',offset:.12},
          {transform:base+' rotate('+(-a*0.45)+'deg) scale(1.02,.99)',offset:.38},
          {transform:base+' rotate('+(a*0.18)+'deg)',offset:.66},
          {transform:base}],{duration:big?760:560,easing:'cubic-bezier(.2,.8,.2,1)'});
        ring(p.x,p.y,big); screenShake(big?5:2);
        return;
      }
      classicSwing(img,base); return;
    }

    if(isCell){
      if(CELL_TAP==='recoil'){ // С2
        img._tapMotion=img.animate(damped(base,1,Math.PI*3.4,4.2,22,(v)=>
          'translateX('+(-v*10*p.dir).toFixed(1)+'px) rotate('+(-v*4*p.dir).toFixed(2)+'deg) skewX('+(v*3*p.dir).toFixed(2)+'deg)'),{duration:700,easing:'linear'});
        if(img._tint){try{img._tint.cancel()}catch(err){}}
        img._tint=img.animate([{filter:BASE_FILTER+' sepia(.6) saturate(4) hue-rotate(-30deg) brightness(1.05)'},{filter:BASE_FILTER}],{duration:260,easing:'ease-out'});
        return;
      }
      if(CELL_TAP==='stagger'){ // С3
        const crit=!!(document.getElementById('tap-object')||{}).classList?.contains('crit');
        const k=crit?1.6:1;
        img._tapMotion=img.animate([
          {transform:base},
          {transform:base+' translateX('+(-8*k*p.dir)+'px) rotate('+(-6*k*p.dir)+'deg) scale(1.02,.94)',offset:.14},
          {transform:base+' translateX('+(3*k*p.dir)+'px) rotate('+(2.5*k*p.dir)+'deg) scale(.99,1.02)',offset:.4},
          {transform:base+' translateX('+(-1.5*k*p.dir)+'px) rotate('+(-1.2*k*p.dir)+'deg)',offset:.65},
          {transform:base}],{duration:crit?820:560,easing:'cubic-bezier(.25,.8,.25,1)'});
        return;
      }
      classicSwing(img,base); return;
    }

    img.style.transformOrigin='50% 8%';
    classicSwing(img,base);
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
    const f=[...emoji.querySelectorAll('.'+cls)].filter(el=>el.style.display!=='none');
    if(f.length<2)return;
    const cur=f[0].style.visibility!=='hidden'?f[0]:f[1];
    const next=cur===f[0]?f[1]:f[0];
    cur.style.opacity='0';cur.style.visibility='hidden';cur.style.zIndex='1';
    next.style.opacity='1';next.style.visibility='visible';next.style.zIndex='2';
  }
  const PUSH_DOWN_MS=190, PUSH_UP_MS=70;
  function runPush(){
    const emoji=document.getElementById('object-emoji');
    if(!emoji||emoji.querySelectorAll('.pushups-image').length<2){pushupQueue=0;pushupRunning=false;return;}
    const now=performance.now();
    if(pushupRunning && now-pushupLastTick<=500)return;
    pushupRunId++;
    const runId=pushupRunId;
    pushupRunning=true;
    pushupLastTick=now;
    let phaseStart=now,phase='down';
    swap(emoji,'pushups-image');
    function tick(frameNow){
      if(runId!==pushupRunId || Number(emoji.dataset.objectIndex)!==2){
        if(runId===pushupRunId)pushupRunning=false;
        return;
      }
      pushupLastTick=frameNow;
      const live=[...emoji.querySelectorAll('.pushups-image')].filter(el=>el.style.display!=='none');
      if(live.length<2){pushupQueue=0;pushupRunning=false;return;}
      const elapsed=frameNow-phaseStart;
      if(phase==='down' && elapsed>=PUSH_DOWN_MS){
        swap(emoji,'pushups-image');phase='up';phaseStart=frameNow;
      }else if(phase==='up' && elapsed>=PUSH_UP_MS){
        pushupQueue=Math.max(0,pushupQueue-1);
        if(pushupQueue<=0){pushupRunning=false;return;}
        swap(emoji,'pushups-image');phase='down';phaseStart=frameNow;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const TRAIN_DOWN_MS=190, TRAIN_UP_MS=90;
  const SQUAT_DOWN_MS=210, SQUAT_UP_MS=90;

  function runSquat(){
    const emoji=document.getElementById('object-emoji');
    if(!emoji||emoji.querySelectorAll('.squat-image').length<2){squatQueue=0;squatRunning=false;return;}
    const now=performance.now();
    if(squatRunning&&now-squatLastTick<=500)return;
    squatRunId++;
    const runId=squatRunId;
    squatRunning=true;
    squatLastTick=now;
    let phaseStart=now,phase='down';
    swap(emoji,'squat-image');
    function tick(frameNow){
      const state=window.getGameState?window.getGameState():null;
      if(runId!==squatRunId||!state?.jailed){
        if(runId===squatRunId)squatRunning=false;
        return;
      }
      squatLastTick=frameNow;
      const live=[...emoji.querySelectorAll('.squat-image')].filter(el=>el.style.display!=='none');
      if(live.length<2){squatQueue=0;squatRunning=false;return;}
      const elapsed=frameNow-phaseStart;
      if(phase==='down'&&elapsed>=SQUAT_DOWN_MS){swap(emoji,'squat-image');phase='up';phaseStart=frameNow;}
      else if(phase==='up'&&elapsed>=SQUAT_UP_MS){
        squatQueue=Math.max(0,squatQueue-1);
        if(squatQueue<=0){squatRunning=false;return;}
        swap(emoji,'squat-image');phase='down';phaseStart=frameNow;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function runTrainer(){
    const emoji=document.getElementById('object-emoji');
    if(!emoji||emoji.querySelectorAll('.trainer-image').length<2){trainerQueue=0;trainerRunning=false;return;}
    const now=performance.now();
    if(trainerRunning && now-trainerLastTick<=500)return;
    trainerRunId++;
    const runId=trainerRunId;
    trainerRunning=true;
    trainerLastTick=now;
    let phaseStart=now,phase='down';
    swap(emoji,'trainer-image');
    function tick(frameNow){
      if(runId!==trainerRunId || Number(emoji.dataset.objectIndex)!==3){
        if(runId===trainerRunId)trainerRunning=false;
        return;
      }
      trainerLastTick=frameNow;
      const live=[...emoji.querySelectorAll('.trainer-image')].filter(el=>el.style.display!=='none');
      if(live.length<2){trainerQueue=0;trainerRunning=false;return;}
      const elapsed=frameNow-phaseStart;
      if(phase==='down' && elapsed>=TRAIN_DOWN_MS){
        swap(emoji,'trainer-image');phase='up';phaseStart=frameNow;
      }else if(phase==='up' && elapsed>=TRAIN_UP_MS){
        trainerQueue=Math.max(0,trainerQueue-1);
        if(trainerQueue<=0){trainerRunning=false;return;}
        swap(emoji,'trainer-image');phase='down';phaseStart=frameNow;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      pushupQueue=0;pushupRunning=false;pushupLastTick=0;pushupRunId++;
      trainerQueue=0;trainerRunning=false;trainerLastTick=0;trainerRunId++;
      squatQueue=0;squatRunning=false;squatLastTick=0;squatRunId++;
    }
  });

  function animate(e){
    const n=nameOf();
    const st=window.getGameState?window.getGameState():null;
    if(st?.jailed){
      squatQueue=Math.min(12,squatQueue+1);
      runSquat();
      return;
    }
    if(n===AUTHORITY_NAME)return;
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
    swing(img,e);
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
