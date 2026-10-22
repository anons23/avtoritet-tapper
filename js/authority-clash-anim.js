/* authority-clash-anim v1.0 — hit flash + urgent timer on стычка */
'use strict';
(function(){
  function $(id){return document.getElementById(id)}

  function markHit(){
    var win=document.querySelector('.authority-clash-window');
    if(!win)return;
    win.classList.remove('hit');
    void win.offsetWidth;
    win.classList.add('hit');
    clearTimeout(win._hitT);
    win._hitT=setTimeout(function(){ try{win.classList.remove('hit')}catch(e){} },180);
  }

  function tickTimer(){
    var el=document.querySelector('.authority-clash-timer');
    if(!el)return;
    var t=parseFloat(el.textContent);
    if(!isNaN(t) && t<=1.2) el.classList.add('urgent');
    else if(el) el.classList.remove('urgent');
  }

  document.addEventListener('pointerdown',function(e){
    var btn=e.target&&e.target.closest&&e.target.closest('.authority-pressure-btn');
    if(btn) markHit();
  },true);

  setInterval(tickTimer,120);
  console.log('[authority-clash-anim] v1.0');
})();
