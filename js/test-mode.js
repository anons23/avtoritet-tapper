'use strict';
(function(){
  const TEST_POINTS_PER_TAP=1000;
  const OBJECT_THRESHOLDS=[0,150,400,1500,6000];
  let busy=false;
  function apply(e){
    if(busy||!window.getGameState)return;
    const before=window.getGameState();
    const tapsBefore=Number(before.totalTaps)||0;
    if(before.jailed)return;
    setTimeout(function(){
      try{
        const s=window.getGameState();
        if(!s||s.jailed||(Number(s.totalTaps)||0)<=tapsBefore)return;
        const delta=Math.floor(Number(s.points)||0)-Math.floor(Number(s.pointsBeforeTest)||0);
        const earned=Math.max(0,TEST_POINTS_PER_TAP-delta);
        if(!earned)return;
        busy=true;
        s.points+=earned;
        s.cigarettes+=earned;
        s.tasks.earned=(Number(s.tasks.earned)||0)+earned;
        let max=0;
        for(let i=0;i<OBJECT_THRESHOLDS.length;i++)if(s.points>=OBJECT_THRESHOLDS[i])max=i;
        if(Number(s.currentObject)||0<max)s.currentObject=max;
        s.saveUpdatedAt=Date.now();
        localStorage.setItem('avtoritet_save_v2',JSON.stringify(s));
        if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(function(){location.replace(location.href)});
      }catch(err){console.debug('[TestMode] apply failed',err)}
      finally{busy=false}
    },0);
  }
  document.addEventListener('pointerup',function(e){
    const target=e.target&&e.target.closest&&e.target.closest('#tap-object');
    if(target){
      const s=window.getGameState&&window.getGameState();
      if(s){s.pointsBeforeTest=Number(s.points)||0;setTimeout(function(){try{delete s.pointsBeforeTest}catch(_){ }},50)}
    }
    apply(e);
  },true);
})();
