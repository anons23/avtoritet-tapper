/* game.js v4.70 — load full stable monolithic core (game-main.js) */
'use strict';
(function(){
  function killPreloader(){
    try{
      if(typeof window.__finishPreloader==='function')window.__finishPreloader();
      var p=document.getElementById('preloader')||document.querySelector('.preloader');
      if(p){p.style.display='none';p.classList.add('hidden');p.remove();}
      document.body&&document.body.classList.remove('booting','loading');
      document.getElementById('game-container')&&document.getElementById('game-container').classList.remove('game-booting');
    }catch(e){}
  }
  var s=document.createElement('script');
  s.src='./js/game-main.js?v=4.70';
  s.async=false;
  s.onload=function(){
    try{
      if(typeof TEST_MODE!=='undefined')window.TEST_MODE=TEST_MODE;
      if(typeof TEST_POINTS_PER_TAP!=='undefined')window.TEST_POINTS_PER_TAP=TEST_POINTS_PER_TAP;
    }catch(e){}
    killPreloader();
    console.log('[game] full core v4.70 OK (game-main monolithic)',
      'TEST_MODE=', typeof TEST_MODE!=='undefined'?TEST_MODE:'?');
  };
  s.onerror=function(){
    console.error('[game] failed to load game-main.js');
    killPreloader();
  };
  document.head.appendChild(s);
})();
