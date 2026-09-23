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
    'Барак готов. Осталось дождаться тебя.'
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
      img.onload=()=>resolve(true);
      img.onerror=()=>resolve(false);
      img.src=src;
    });
  }
  async function start(){
    if(!preloader)return;
    setProgress(3,messages[messageIndex]);
    messageTimer=window.setInterval(()=>{messageIndex=(messageIndex+1)%messages.length;setProgress(current,messages[messageIndex]);},2200);
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
    const bg=mobile?'./assets/backgrounds/mobile/loading-mobile.jpg':'./assets/backgrounds/desktop/loading-desktop.jpg';
    const results=await Promise.all([preloadImage(bg),preloadImage('./assets/backgrounds/handcuffs.png')]);
    setProgress(15,results.every(Boolean)?messages[messageIndex]:'Запускаем игру');
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