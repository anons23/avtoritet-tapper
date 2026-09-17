'use strict';
(function(){
  // Temporary visual-test helper: make every NPC reachable without changing production rank rules.
  function unlock(){
    if(typeof window.getGameState!=='function')return false;
    const s=window.getGameState();
    if(s&&Number(s.points||0)<50000){
      s.points=50000;
      try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(s))}catch(e){}
      if(typeof window.ui==='function')window.ui();
    }
    return true;
  }
  if(!unlock()){
    const timer=setInterval(function(){if(unlock())clearInterval(timer)},50);
  }
})();
