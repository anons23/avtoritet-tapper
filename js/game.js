/* game.js v4.50 loader — pulls full core */
'use strict';
(function(){
  var x=new XMLHttpRequest();
  x.open('GET','./js/game-full.js?v=4.50',true);
  x.onload=function(){
    if(x.status<200||x.status>=300){console.error('[game] full missing',x.status);return;}
    try{
      var s=document.createElement('script');
      s.textContent=x.responseText;
      document.head.appendChild(s);
      console.log('[game] full core loaded v4.50');
    }catch(e){console.error('[game] inject failed',e)}
  };
  x.onerror=function(){console.error('[game] network error loading full core')};
  x.send();
})();
