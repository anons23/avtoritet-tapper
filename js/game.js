/* game.js v4.50 — gzip full core loader (4 parts) */
'use strict';
(function(){
  var parts=4, acc=[], i=0;
  function fail(msg){console.error('[game]',msg);}
  function inject(code){
    try{
      var s=document.createElement('script');
      s.textContent=code;
      document.head.appendChild(s);
      console.log('[game] full core v4.50 OK TEST_MODE=', typeof TEST_MODE!=='undefined'?TEST_MODE:'?');
    }catch(e){fail(e);}
  }
  function decodeAndRun(){
    try{
      var bin=Uint8Array.from(atob(acc.join('')), function(c){return c.charCodeAt(0);});
      if(typeof DecompressionStream==='function'){
        var ds=new DecompressionStream('gzip');
        var stream=new Response(bin).body.pipeThrough(ds);
        new Response(stream).text().then(inject).catch(function(e){fail(e);});
      }else{
        fail('DecompressionStream not supported');
      }
    }catch(e){fail(e);}
  }
  function next(){
    if(i>=parts){decodeAndRun();return;}
    var x=new XMLHttpRequest();
    x.open('GET','./js/game.gz.p'+i+'.b64.txt?v=4.50',true);
    x.onload=function(){
      if(x.status>=200&&x.status<300){acc.push(x.responseText.trim());i++;next();}
      else fail('missing part '+i+' status '+x.status);
    };
    x.onerror=function(){fail('network part '+i);};
    x.send();
  }
  next();
})();
