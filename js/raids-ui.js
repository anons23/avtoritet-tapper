/* raids-ui loader v4.60 — 2 base64 parts of full raids module */
'use strict';
(function(){
  var PARTS=2, acc=[], i=0;
  function done(){
    try{
      var code = atob(acc.join(''));
      var s=document.createElement('script');
      s.textContent=code;
      document.head.appendChild(s);
      console.log('[raids] full module v4.60 OK');
    }catch(e){
      console.error('[raids] assemble failed',e);
    }
  }
  function next(){
    if(i>=PARTS){ done(); return; }
    var x=new XMLHttpRequest();
    x.open('GET','./js/raids-ui.p'+i+'.b64.txt?v=4.60',true);
    x.onload=function(){
      if(x.status>=200&&x.status<300){ acc.push(x.responseText.trim()); i++; next(); }
      else console.error('[raids] missing part',i,x.status);
    };
    x.onerror=function(){ console.error('[raids] network',i); };
    x.send();
  }
  next();
})();
