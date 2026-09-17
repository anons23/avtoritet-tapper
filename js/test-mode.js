'use strict';
(function(){
  const TEST_POINTS_PER_TAP=1000;
  const OBJECT_THRESHOLDS=[0,150,400,1500,6000];
  let busy=false;
  function reset(){
    try{
      if(!window.getGameState)return;
      const s=window.getGameState();
      if(s.jailed)return;
      s.points=0;
      s.cigarettes=0;
      s.currentObject=0;
      s.tasks.earned=0;
      s.saveUpdatedAt=Date.now();
      localStorage.setItem('avtoritet_save_v2',JSON.stringify(s));
      const p=document.getElementById('points'),c=document.getElementById('cigarettes');
      if(p)p.textContent='0';
      if(c)c.textContent='0';
    }catch(err){console.debug('[TestMode] reset failed',err)}
  }
  function apply(){
    if(busy||!window.getGameState)return;
    const s=window.getGameState();
    if(!s||s.jailed)return;
    busy=true;
    try{
      s.points+=TEST_POINTS_PER_TAP;
      s.cigarettes+=TEST_POINTS_PER_TAP;
      s.tasks.earned=(Number(s.tasks.earned)||0)+TEST_POINTS_PER_TAP;
      let max=0;
      for(let i=0;i<OBJECT_THRESHOLDS.length;i++)if(s.points>=OBJECT_THRESHOLDS[i])max=i;
      if((Number(s.currentObject)||0)<max)s.currentObject=max;
      s.saveUpdatedAt=Date.now();
      localStorage.setItem('avtoritet_save_v2',JSON.stringify(s));
      const p=document.getElementById('points'),c=document.getElementById('cigarettes');
      if(p)p.textContent=s.points>=1000?(s.points/1000).toFixed(1)+'K':String(s.points);
      if(c)c.textContent=s.cigarettes>=1000?(s.cigarettes/1000).toFixed(1)+'K':String(s.cigarettes);
    }catch(err){console.debug('[TestMode] apply failed',err)}
    finally{busy=false}
  }
  function start(){
    reset();
    document.addEventListener('pointerup',function(e){
      if(e.target&&e.target.closest&&e.target.closest('#tap-object'))setTimeout(apply,0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
