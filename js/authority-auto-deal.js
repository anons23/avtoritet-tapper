/* authority-auto-deal v1.0 — каждые ~50 тапов на Авторитете открывает дело барака */
'use strict';
(function(){
  var EVERY=50;
  var count=0;
  var lastAt=0;

  function state(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return null;
  }

  function onAuthority(){
    var s=state();
    if(!s||s.jailed) return false;
    if(Number(s.points)<40000) return false;
    if(Number(s.currentObject)<4) return false;
    if(!document.getElementById('game-container')||!document.getElementById('game-container').classList.contains('authority-mode')) return false;
    return true;
  }

  function noteTap(){
    if(!onAuthority()) return;
    if(document.getElementById('modal-overlay')&&!document.getElementById('modal-overlay').classList.contains('hidden')) return;
    var now=Date.now();
    if(now-lastAt<60) return;
    lastAt=now;
    count++;
    if(count<EVERY) return;
    count=0;
    setTimeout(function(){
      try{
        if(typeof window.startAuthorityDeal==='function') window.startAuthorityDeal();
      }catch(e){}
    },40);
  }

  document.addEventListener('pointerdown', function(e){
    if(!onAuthority()) return;
    if(e.target&&e.target.closest&&e.target.closest('.authority-deal-btn,.authority-pressure-btn,.authority-great-btn,.authority-desk-hotspot,#modal-overlay')) return;
    noteTap();
  }, true);

  console.log('[authority-auto-deal] every', EVERY, 'taps');
})();
