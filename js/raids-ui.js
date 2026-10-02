/* raids-ui loader — assembles base64 parts then evals */
'use strict';
(function(){
  var parts = 5;
  var acc = [];
  var i = 0;
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
      }catch(e){console.error('[raids-ui] decode failed', e)}
      return;
    }
    var x = new XMLHttpRequest();
    x.open('GET', './js/raids-ui.b64.'+i+'.txt?v=4.5', true);
    x.onload = function(){
      if(x.status>=200 && x.status<300){ acc.push(x.responseText); i++; next(); }
      else console.error('[raids-ui] missing b64 part', i, x.status);
    };
    x.onerror = function(){ console.error('[raids-ui] network error part', i); };
    x.send();
  }
  next();
})();
