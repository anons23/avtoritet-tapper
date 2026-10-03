/* game.js v4.71 — sequential load of full game-main (2 parts) */
'use strict';
(function(){
  function killPreloader(){
    try{
      if(typeof window.__finishPreloader==='function')window.__finishPreloader();
      var p=document.getElementById('preloader')||document.querySelector('.preloader');
      if(p){p.style.display='none';p.classList.add('hidden');p.remove();}
      document.body&&document.body.classList.remove('booting','loading');
      var gc=document.getElementById('game-container');
      if(gc)gc.classList.remove('game-booting');
    }catch(e){}
  }
  var PARTS=['./js/game-main.p0.js?v=4.71','./js/game-main.p1.js?v=4.71'];
  var i=0;
  function next(){
    if(i>=PARTS.length){
      try{
        if(typeof TEST_MODE!=='undefined')window.TEST_MODE=TEST_MODE;
        if(typeof TEST_POINTS_PER_TAP!=='undefined')window.TEST_POINTS_PER_TAP=TEST_POINTS_PER_TAP;
      }catch(e){}
      killPreloader();
      console.log('[game] full core v4.71 OK (game-main 2 parts)','TEST_MODE=',typeof TEST_MODE!=='undefined'?TEST_MODE:'?');
      return;
    }
    var s=document.createElement('script');
    s.src=PARTS[i];
    s.async=false;
    s.onload=function(){i++;next();};
    s.onerror=function(){console.error('[game] failed',PARTS[i]);killPreloader();};
    document.head.appendChild(s);
  }
  next();
})();
