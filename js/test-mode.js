'use strict';
(function(){
  const TEST_POINTS_PER_TAP=1000;
  const OBJECT_THRESHOLDS=[0,150,400,1500,6000];
  let busy=false;
  document.addEventListener('pointerup',function(e){
    const target=e.target&&e.target.closest&&e.target.closest('#tap-object');
    if(!target||busy||!window.getGameState)return;
    const before=window.getGameState();
    if(before.jailed)return;
    const tapsBefore=Number(before.totalTaps)||0;
    const pointsBefore=Math.floor(Number(before.points)||0);
    setTimeout(function(){
      try{
        const s=window.getGameState();
        if(!s||s.jailed||(Number(s.totalTaps)||0)<=tapsBefore)return;
        const delta=Math.max(0,Math.floor(Number(s.points)||0)-pointsBefore);
        const extra=Math.max(0,TEST_POINTS_PER_TAP-delta);
        if(!extra)return;
        busy=true;
        s.points+=extra;
        s.cigarettes+=extra;
        s.tasks.earned=(Number(s.tasks.earned)||0)+extra;
        let max=0;
        for(let i=0;i<OBJECT_THRESHOLDS.length;i++)if(s.points>=OBJECT_THRESHOLDS[i])max=i;
        if((Number(s.currentObject)||0)<max)s.currentObject=max;
        s.saveUpdatedAt=Date.now();
        localStorage.setItem('avtoritet_save_v2',JSON.stringify(s));
        if(typeof window.ui==='function')window.ui();
      }catch(err){console.debug('[TestMode] apply failed',err)}
      finally{busy=false}
    },0);
  },true);
})();
