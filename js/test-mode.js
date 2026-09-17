'use strict';
(function(){
  const TEST_POINTS_PER_TAP=500;
  const OBJECT_THRESHOLDS=[0,150,400,1500,6000];
  let startPoints=0,startCigarettes=0,startEarned=0,armed=false,resetDone=false;
  function render(s){
    const p=document.getElementById('points'),c=document.getElementById('cigarettes');
    if(p)p.textContent=s.points>=1000?(s.points/1000).toFixed(1)+'K':String(Math.floor(s.points));
    if(c)c.textContent=s.cigarettes>=1000?(s.cigarettes/1000).toFixed(1)+'K':String(Math.floor(s.cigarettes));
  }
  function save(s){
    s.saveUpdatedAt=Date.now();
    try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(s))}catch(e){}
  }
  function reset(){
    const s=window.getGameState&&window.getGameState();
    if(!s||s.jailed)return;
    s.points=0;s.cigarettes=0;s.currentObject=0;s.tasks.earned=0;
    save(s);render(s);resetDone=true;
  }
  function normalize(){
    const s=window.getGameState&&window.getGameState();
    if(!s||s.jailed||!armed)return;
    s.points=startPoints+TEST_POINTS_PER_TAP;
    s.cigarettes=startCigarettes+TEST_POINTS_PER_TAP;
    s.tasks.earned=startEarned+TEST_POINTS_PER_TAP;
    let max=0;
    for(let i=0;i<OBJECT_THRESHOLDS.length;i++)if(s.points>=OBJECT_THRESHOLDS[i])max=i;
    s.currentObject=max;
    save(s);render(s);armed=false;
  }
  function start(){
    if(!window.getGameState){setTimeout(start,50);return}
    reset();
    document.addEventListener('pointerdown',function(e){
      if(!e.target||!e.target.closest||!e.target.closest('#tap-object'))return;
      const s=window.getGameState&&window.getGameState();
      if(!s||s.jailed)return;
      startPoints=s.points;startCigarettes=s.cigarettes;startEarned=Number(s.tasks.earned)||0;armed=true;
    },true);
    document.addEventListener('click',function(e){
      if(!e.target||!e.target.closest||!e.target.closest('#tap-object'))return;
      if(!armed)return;
      setTimeout(normalize,0);
    },true);
    document.addEventListener('pointerup',function(e){
      if(!e.target||!e.target.closest||!e.target.closest('#tap-object'))return;
      if(!resetDone||!armed)return;
      setTimeout(function(){if(armed)normalize()},30);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
