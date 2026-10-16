'use strict';
(function(){
  const preloader=document.getElementById('preloader');
  const progress=document.getElementById('preloader-progress');
  const percent=document.getElementById('preloader-percent');
  const status=document.getElementById('preloader-status');
  let current=0;
  let messageTimer=null;
  const messages=[
    'Готовим нары. Картишки раздавать будем?',
    'Ты откуда будешь, браток?',
    'Место на шконке уже присмотрел?',
    'Проверяем барак. Всё по понятиям.',
    'Чифирок заварим — и можно начинать.',
    'Проверяем карты, нары и авторитет.',
    'Спокойно, браток. Всё идёт по плану.',
    'Сейчас разберёмся, кто тут свой.',
    'Барак готов. Осталось дождаться тебя.',
    'Грузим рейды — бойцы уже на подходе.'
  ];
  let messageIndex=Math.floor(Math.random()*messages.length);
  function setProgress(value,message){
    current=Math.max(current,Math.min(100,Number(value)||0));
    if(progress)progress.style.width=current+'%';
    if(percent)percent.textContent=Math.round(current)+'%';
    if(message&&status)status.textContent=message;
    const track=document.getElementById('preloader-track');
    if(track)track.setAttribute('aria-valuenow',String(Math.round(current)));
  }
  window.__setPreloaderProgress=setProgress;

  function preloadImage(src){
    return new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>resolve(true);
      img.onerror=()=>resolve(false);
      img.src=src;
    });
  }

  function preloadVideo(src){
    return new Promise(resolve=>{
      let settled=false;
      const done=(ok)=>{
        if(settled)return;
        settled=true;
        resolve(!!ok);
      };
      const v=document.createElement('video');
      v.muted=true;
      v.playsInline=true;
      v.setAttribute('playsinline','');
      v.preload='auto';
      const t=window.setTimeout(()=>done(false),10000);
      v.addEventListener('canplaythrough',()=>{window.clearTimeout(t);done(true)},{once:true});
      v.addEventListener('loadeddata',()=>{window.clearTimeout(t);done(true)},{once:true});
      v.addEventListener('error',()=>{window.clearTimeout(t);done(false)},{once:true});
      v.src=src;
      try{v.load()}catch(e){window.clearTimeout(t);done(false)}
    });
  }

  const RAID_IMAGES=[
    './assets/raids/raid_icon_transparent.webm',
    './assets/raids/fighters/mafioznik_hit_1.webp',
    './assets/raids/fighters/mafioznik_hit_2.webp',
    './assets/raids/fighters/mafioznik_hit_3.webp',
    './assets/raids/fighters/mafioznik_hit_4.webp',
    './assets/raids/fighters/Vtirach1.webp',
    './assets/raids/fighters/Vtirach2.webp',
    './assets/raids/fighters/Vtirach3.webp',
    './assets/raids/fighters/Vtirach4.webp',
    './assets/raids/fighters/Mongol1.webp',
    './assets/raids/fighters/Mongol2.webp',
    './assets/raids/fighters/Mongol3.webp',
    './assets/raids/fighters/Mongol4.webp',
    './assets/raids/fighters/Glaz1.webp',
    './assets/raids/fighters/Glaz2.webp',
    './assets/raids/fighters/Glaz3.webp',
    './assets/raids/fighters/Glaz4.webp',
    './assets/raids/fighters/krest1.webp',
    './assets/raids/fighters/krest2.webp',
    './assets/raids/fighters/krest3.webp',
    './assets/raids/fighters/krest4.webp',
    './assets/raids/fighters/psikh1.webp',
    './assets/raids/fighters/psikh2.webp',
    './assets/raids/fighters/psikh3.webp',
    './assets/raids/fighters/psikh4.webp',
    './assets/raids/fighters/petrovich1.webp',
    './assets/raids/fighters/petrovich2.webp',
    './assets/raids/fighters/petrovich3.webp',
    './assets/raids/fighters/petrovich4.webp'
  ];
  const RAID_VIDEOS=[
    './assets/raids/fighters/petrovich_idle.mp4',
    './assets/raids/fighters/vtirach_idle.mp4',
    './assets/raids/fighters/mafioznik_idle.mp4',
    './assets/raids/fighters/mongol_idle.mp4',
    './assets/raids/fighters/glaz_idle.mp4',
    './assets/raids/fighters/krest_idle.mp4',
    './assets/raids/fighters/psikh_idle.mp4'
  ];

  let raidReadyResolve=null;
  window.__raidAssetsReady=new Promise(function(resolve){raidReadyResolve=resolve;});

  async function preloadRaidAssets(){
    const essential=['./assets/raids/raid_icon_transparent.webm'];
    setProgress(28,'Готовим бойцов…');
    await Promise.all(essential.map(src=>preloadImage(src).catch(()=>false)));
    setProgress(40,'Рейды почти готовы');
    const imgs=RAID_IMAGES.filter(s=>!essential.includes(s));
    let done=0;
    await Promise.all(imgs.map(async src=>{
      await preloadImage(src);
      done++;
      if(done%4===0)setProgress(40+Math.min(25,done),messages[messageIndex]);
    }));
    setProgress(70,'Подгружаем анимации');
    await Promise.all(RAID_VIDEOS.map(src=>preloadVideo(src).catch(()=>false)));
    setProgress(88,'Почти готово');
    if(typeof raidReadyResolve==='function')raidReadyResolve(true);
  }

  const STAGE_THRESHOLDS=[0,1500,5000,15000,50000];
  function stage0Assets(mobile){
    const folder=mobile?'mobile':'desktop';
    return [
      './assets/backgrounds/'+folder+'/salaga.webp',
      './assets/backgrounds/boxing-bag.webp'
    ];
  }
  window.__preloadStageAssets=function(idx){
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
    const folder=mobile?'mobile':'desktop';
    const map={
      1:['./assets/backgrounds/'+folder+'/pacan.webp','./assets/backgrounds/cellmate.webp'],
      2:['./assets/backgrounds/'+folder+'/blatnoi.webp','./assets/backgrounds/pushups.webp'],
      3:['./assets/backgrounds/'+folder+'/smotryashiy.webp','./assets/backgrounds/trainer_up.webp'],
      4:['./assets/backgrounds/'+folder+'/avtoritet.webp']
    };
    const list=map[idx]||[];
    return Promise.all(list.map(function(src){ return preloadImage(src); }));
  };
  window.__maybePreloadNextStage = function(points, pointsPerTap){
    points = Number(points)||0;
    pointsPerTap = Math.max(1, Number(pointsPerTap)||1);
    let nextIdx = -1;
    for(let i=1;i<STAGE_THRESHOLDS.length;i++){
      if(points < STAGE_THRESHOLDS[i]){ nextIdx = i; break; }
    }
    if(nextIdx < 0) return;
    const remain = STAGE_THRESHOLDS[nextIdx] - points;
    const tapsLeft = remain / pointsPerTap;
    if(tapsLeft <= 100){
      const key = 'stage'+nextIdx;
      if(window.__preloadedStages && window.__preloadedStages[key]) return;
      window.__preloadedStages = window.__preloadedStages || {};
      window.__preloadedStages[key] = true;
      window.__preloadStageAssets(nextIdx);
    }
  };

  async function start(){
    if(!preloader){
      if(typeof raidReadyResolve==='function')raidReadyResolve(true);
      return;
    }
    setProgress(3,messages[messageIndex]);
    messageTimer=window.setInterval(()=>{messageIndex=(messageIndex+1)%messages.length;setProgress(current,messages[messageIndex]);},2200);
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
    const bg=mobile?'./assets/backgrounds/mobile/loading-mobile.webp':'./assets/backgrounds/desktop/loading-desktop.webp';
    await Promise.all([preloadImage(bg),preloadImage('./assets/backgrounds/handcuffs.webp')]);
    setProgress(12,messages[messageIndex]);
    setProgress(16,'Грузим грушу…');
    await Promise.all(stage0Assets(mobile).map(src=>preloadImage(src)));
    setProgress(24,'Локация готова');
    try{ await preloadRaidAssets(); }
    catch(e){
      console.debug('[Preloader] raid assets',e);
      if(typeof raidReadyResolve==='function')raidReadyResolve(false);
    }
  }

  window.__finishPreloader=function(){
    if(messageTimer){window.clearInterval(messageTimer);messageTimer=null;}
    setProgress(100,'Готово');
    window.setTimeout(function(){
      const game=document.getElementById('game-container');
      if(game){
        game.classList.remove('game-booting');
        document.querySelectorAll('#tap-object.preload-hidden').forEach(function(el){ el.classList.remove('preload-hidden'); });
      }
      if(preloader){
        preloader.classList.add('is-hidden');
        window.setTimeout(function(){ try{ preloader.remove(); }catch(e){} },500);
      }
    },120);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
