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

  /* Video: warm HTTP cache so raid idle starts without grey flash */
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
    './assets/raids/fighters/Glaz4.png'
  ];
  const RAID_VIDEOS=[
    './assets/raids/fighters/mafioznik_idle.webm',
    './assets/raids/fighters/petrovich.webm',
    './assets/raids/fighters/Vtirach.webm',
    './assets/raids/fighters/Mongol.webm',
    './assets/raids/fighters/Glaz.webm'
  ];

  function raidBackgrounds(mobile){
    if(mobile){
      return [
        './assets/raids/backgrounds/petrovich_vtirach_mobile.png',
        './assets/raids/backgrounds/mafioznik_mongol_mobile.png',
        './assets/raids/backgrounds/%D1%84%D0%BE%D0%BD%20%D0%B3%D0%BB%D0%B0%D0%B7%20%D0%9C%D0%BE%D0%B1%D0%B8%D0%BB.jpeg'
      ];
    }
    return [
      './assets/raids/backgrounds/petrovich_vtirach_pc.png',
      './assets/raids/backgrounds/mafioznik_mongol_pc.png',
      './assets/raids/backgrounds/%D1%84%D0%BE%D0%BD%20%D0%93%D0%BB%D0%B0%D0%B7%D0%9F%D0%9A.jpeg'
    ];
  }

  let raidReadyResolve;
  window.__raidAssetsReady=new Promise(r=>{raidReadyResolve=r});

  async function preloadRaidAssets(){
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
    const images=raidBackgrounds(mobile).concat(RAID_IMAGES);
    const total=images.length+RAID_VIDEOS.length;
    let done=0;
    function tick(msg){
      done++;
      /* progress band reserved for raids: 15% → 42% */
      const p=15+Math.round((done/total)*27);
      setProgress(p,msg||messages[messageIndex]);
    }
    setProgress(16,'Грузим рейды…');
    await Promise.all(images.map(src=>preloadImage(src).then(()=>tick('Грузим картинки рейдов…'))));
    setProgress(Math.max(current,32),'Грузим видео бойцов…');
    await Promise.all(RAID_VIDEOS.map(src=>preloadVideo(src).then(()=>tick('Грузим видео бойцов…'))));
    setProgress(Math.max(current,42),'Рейды готовы');
    if(typeof raidReadyResolve==='function')raidReadyResolve(true);
    return true;
  }

  window.__preloadRaidAssets=preloadRaidAssets;

  async function start(){
    if(!preloader){
      if(typeof raidReadyResolve==='function')raidReadyResolve(true);
      return;
    }
    setProgress(3,messages[messageIndex]);
    messageTimer=window.setInterval(()=>{messageIndex=(messageIndex+1)%messages.length;setProgress(current,messages[messageIndex]);},2200);
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
    const bg=mobile?'./assets/backgrounds/mobile/loading-mobile.jpg':'./assets/backgrounds/desktop/loading-desktop.jpg';
    const results=await Promise.all([preloadImage(bg),preloadImage('./assets/backgrounds/handcuffs.png')]);
    setProgress(15,results.every(Boolean)?messages[messageIndex]:'Запускаем игру');
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
    window.setTimeout(()=>{
      const game=document.getElementById('game-container');
      if(game){
        game.classList.remove('game-booting');
        document.querySelectorAll('#tap-object.preload-hidden').forEach(el=>el.classList.remove('preload-hidden'));
      }
      if(preloader){
        preloader.classList.add('is-hidden');
        window.setTimeout(()=>preloader.remove(),500);
      }
    },180);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
