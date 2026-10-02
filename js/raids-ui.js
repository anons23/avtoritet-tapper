/* raids-ui loader v4.7 — 4 base64 parts */
'use strict';
(function(){
  var parts = 4, acc = [], i = 0;
  function next(){
    if(i>=parts){
      try{
        var bin = atob(acc.join(''));
        var bytes = new Uint8Array(bin.length);
        for(var k=0;k<bin.length;k++) bytes[k]=bin.charCodeAt(k);
        var code = new TextDecoder('utf-8').decode(bytes);
        var s = document.createElement('script');
        s.textContent = code;
        document.head.appendChild(s);
        console.log('[raids-ui] OK openRaidMenu=', typeof window.openRaidMenu);
      }catch(e){console.error('[raids-ui] decode failed', e)}
      return;
    }
    var x = new XMLHttpRequest();
    x.open('GET', './js/raids-ui.p'+i+'.b64.txt?v=4.7', true);
    x.onload = function(){
      if(x.status>=200&&x.status<300){ acc.push(x.responseText.trim()); i++; next(); }
      else console.error('[raids-ui] missing part', i, x.status);
    };
    x.onerror = function(){ console.error('[raids-ui] network error', i); };
    x.send();
  }
  next();
})();
