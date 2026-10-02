/* АВТОРИТЕТ 2.0 — gzip full-core loader v4.51 */
'use strict';
(function(){
  var PARTS = 3, acc = [], i = 0;
  function next(){
    if(i >= PARTS){
      try{
        var b64 = acc.join('');
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for(var k=0;k<bin.length;k++) bytes[k] = bin.charCodeAt(k);
        if(typeof DecompressionStream !== 'undefined'){
          var ds = new DecompressionStream('gzip');
          var stream = new Blob([bytes]).stream().pipeThrough(ds);
          new Response(stream).arrayBuffer().then(function(buf){
            var code = new TextDecoder().decode(buf);
            var s = document.createElement('script');
            s.textContent = code;
            document.head.appendChild(s);
            console.log('[game] full core v4.51 OK TEST_MODE=', typeof TEST_MODE !== 'undefined' ? TEST_MODE : '?');
          }).catch(function(e){console.error('[game] decompress failed',e); fallback();});
        } else {
          console.warn('[game] no DecompressionStream, fallback');
          fallback();
        }
      }catch(e){console.error('[game] assemble failed',e); fallback();}
      return;
    }
    var x = new XMLHttpRequest();
    x.open('GET', './js/game.gz.p'+i+'.b64.txt?v=4.51', true);
    x.onload = function(){
      if(x.status>=200 && x.status<300){ acc.push(x.responseText.trim()); i++; next(); }
      else { console.error('[game] missing part', i, x.status); fallback(); }
    };
    x.onerror = function(){ console.error('[game] network', i); fallback(); };
    x.send();
  }
  function fallback(){
    console.warn('[game] using emergency minimal');
    var s = document.createElement('script');
    s.textContent = "const TEST_MODE=true;const TEST_POINTS_PER_TAP=500;console.log('[game] emergency');"
    document.head.appendChild(s);
  }
  next();
})();
