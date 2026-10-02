/* АВТОРИТЕТ 2.0 — multi-part load */
'use strict';
(function(){
  var parts=['./js/game-part1.js?v=4.31','./js/game-part2.js?v=4.31','./js/game-part3.js?v=4.31'];
  function next(i){
    if(i>=parts.length)return;
    var s=document.createElement('script');
    s.src=parts[i];
    s.async=false;
    s.onload=function(){next(i+1)};
    s.onerror=function(){console.error('[game] failed',parts[i]);next(i+1)};
    document.head.appendChild(s);
  }
  next(0);
})();
