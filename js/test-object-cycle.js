'use strict';
(function(){
  const TEST_MODE=true;
  if(!TEST_MODE)return;
  const OBJECT_COUNT=5;
  function install(){
    const area=document.getElementById('tap-area');
    if(!area||typeof window.getGameState!=='function'||typeof window.ui!=='function')return false;
    const state=window.getGameState();
    state.currentObject=0;
    window.ui();
    area.addEventListener('pointerdown',function(){
      const beforeTaps=state.totalTaps;
      const beforeObject=state.currentObject;
      setTimeout(function(){
        if(state.totalTaps!==beforeTaps+1||state.jailed)return;
        const delay=beforeObject===2?450:0;
        setTimeout(function(){
          if(state.totalTaps!==beforeTaps+1||state.jailed)return;
          state.currentObject=(beforeObject+1)%OBJECT_COUNT;
          window.ui();
          try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(state))}catch(e){}
        },delay);
      },0);
    },{passive:true});
    return true;
  }
  if(!install()){
    const timer=setInterval(function(){if(install())clearInterval(timer)},50);
  }
})();
