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
    './assets/raids/ui/raid-button.png',
    './assets/raids/fighters/mafioznik_hit_1.png',
    './assets/raids/fighters/mafioznik_hit_2.png',
    './assets/raids/fighters/mafioznik_hit_3.png',
    './assets/raids/fighters/mafioznik_hit_4.png',
    './assets/raids/fighters/petrovich1.png',
    './assets/raids/fighters/petrovich2.png',
    './assets/raids/fighters/petrovich3.png',
    './assets/raids/fighters/petrovich4.png',
    './assets/raids/fighters/Vtirach1.png',
    './assets/raids/fighters/Vtirach2.png',
    './assets/raids/fighters/Vtirach3.png',
    './assets/raids/fighters/Vtirach4.png',
    './assets/raids/fighters/Mongol1.png',
    './assets/raids/fighters/Mongol2.png',
    './assets/raids/fighters/Mongol3.png',
    './assets/raids/fighters/Mongol4.png',
    './assets/raids/fighters/Glaz1.png',
    './assets/raids/fighters/Glaz2.png',
    './assets/raids/fighters/Glaz3.png',
    './assets/raids/fighters/Glaz4.png',
    './assets/raids/fighters/Crest%20(1).jpg',
    './assets/raids/fighters/Crest%20(2).jpg',
    './assets/raids/fighters/Crest%20(3).jpg',
    './assets/raids/fighters/Crest%20(4).jpg',
    './assets/raids/fighters/Crest%20(5).jpg',
    './assets/raids/fighters/Psish1%20(1).jpg',
    './assets/raids/fighters/Psish1%20(2).jpg',
    './assets/raids/fighters/Psish1%20(3).jpg',
    './assets/raids/fighters/Psish1%20(4).jpg',
    './assets/raids/fighters/Psish1%20(5).jpg'
  ];
  const RAID_VIDEOS=[
    './assets/raids/fighters/mafioznik_idle.webm',
    './assets/raids/fighters/petrovich.webm',
    './assets/raids/fighters/Vtirach.webm',
    './assets/raids/fighters/Mongol.webm',
    './assets/raids/fighters/Glaz.webm',
    './assets/raids/fighters/krest.webm',
    './assets/raids/fighters/Psish.webm'
  ];

  function raidBackgrounds(mobile){
    if(mobile){
      return [
        './assets/raids/backgrounds/petrovich_vtirach_mobile.png',
        './assets/raids/backgrounds/mafioznik_mongol_mobile.png',
        './assets/raids/backgrounds/glaz_mobile.jpeg',
        './assets/raids/backgrounds/krest_mobile.jpeg',
        './assets/raids/backgrounds/%D1%84%D0%BE%D0%BD%D0%9F%D1%81%D0%B8%D1%85%D0%9C%D0%BE%D0%B1%D0%B8%D0%BB%20(1).jpg'
      ];
    }
    return [
      './assets/raids/backgrounds/petrovich_vtirach_pc.png',
      './assets/raids/backgrounds/mafioznik_mongol_pc.png',
      './assets/raids/backgrounds/glaz_pc.jpeg',
      './assets/raids/backgrounds/krest_pc.jpeg',
      './assets/raids/backgrounds/%D1%84%D0%BE%D0%BD%D0%9F%D1%81%D0%B8%D1%85%D0%9C%D0%BE%D0%B1%D0%B8%D0%BB%20(2).jpg'
    ];
  }

  let raidReadyResolve;
  window.__raidAssetsReady=new Promise(function(r){raidReadyResolve=r;});

  function stage0Assets(mobile){
    return [
      './assets/backgrounds/boxing-bag.png?v=7',
      mobile ? './assets/backgrounds/mobile/salaga.png' : './assets/backgrounds/desktop/salaga.png'
    ];
  }
  const STAGE_ASSETS = {
    1: ['./assets/backgrounds/cellmate.png?v=3', './assets/backgrounds/desktop/pacan.png', './assets/backgrounds/mobile/pacan.png'],
    2: ['./assets/backgrounds/pushups.png?v=3', './assets/backgrounds/pushups_2.png?v=3', './assets/backgrounds/desktop/blatnoi.png', './assets/backgrounds/mobile/blatnoi.png'],
    3: ['./assets/backgrounds/trainer_down.png?v=4', './assets/backgrounds/trainer_up.png?v=4', './assets/backgrounds/desktop/smotryashiy.png', './assets/backgrounds/mobile/smotryashiy.png'],
    4: ['./assets/backgrounds/desktop/avtoritet.png', './assets/backgrounds/mobile/avtoritet.png']
  };
  const STAGE_THRESHOLDS = [0, 1500, 5000, 15000, 50000];

  async function preloadRaidAssets(){
    const mobile = window.matchMedia && window.matchMedia('(max-width:700px)').matches;
    const essential = [
      './assets/raids/ui/raid-button.png',
      './assets/raids/fighters/petrovich1.png',
      './assets/raids/fighters/Vtirach1.png'
    ].concat(raidBackgrounds(mobile).slice(0,1));
    let done = 0;
    const tick = function(msg){
      done++;
      const p = 28 + Math.round((done/Math.max(1,essential.length))*12);
      setProgress(Math.min(40,p), msg||'Готовим рейды…');
    };
    setProgress(Math.max(current,26),'Кнопка рейдов…');
    await Promise.all(essential.map(function(src){ return preloadImage(src).then(function(){ tick('Рейды…'); }); }));
    setProgress(Math.max(current,40),'Рейды готовы к старту');
    if(typeof raidReadyResolve==='function') raidReadyResolve(true);
    setTimeout(function(){
      const restImg = RAID_IMAGES.filter(function(s){ return essential.indexOf(s)<0; });
      restImg.forEach(function(src){ preloadImage(src); });
      (raidBackgrounds(mobile)||[]).forEach(function(src){ preloadImage(src); });
      const ua = navigator.userAgent||'';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
      if(!ios){
        RAID_VIDEOS.forEach(function(src){ preloadVideo(src); });
      }
    }, 600);
    return true;
  }

  window.__preloadRaidAssets = preloadRaidAssets;

  window.__preloadStageAssets = function(stageIndex){
    const list = STAGE_ASSETS[stageIndex];
    if(!list) return Promise.resolve();
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
    messageTimer=window.setInterval(function(){messageIndex=(messageIndex+1)%messages.length;setProgress(current,messages[messageIndex]);},2200);
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
    const bg=mobile?'./assets/backgrounds/mobile/loading-mobile.jpg':'./assets/backgrounds/desktop/loading-desktop.jpg';
    await Promise.all([preloadImage(bg),preloadImage('./assets/backgrounds/handcuffs.png')]);
    setProgress(12,messages[messageIndex]);
    setProgress(16,'Грузим грушу…');
    await Promise.all(stage0Assets(mobile).map(function(src){ return preloadImage(src); }));
    setProgress(24,'Локация готова');
    try{
      await preloadRaidAssets();
    }catch(e){
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
