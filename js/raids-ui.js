/* raids-ui loader v4.5 — single base64 blob */
'use strict';
(function(){
  var x = new XMLHttpRequest();
  x.open('GET', './js/raids-ui.full.b64.txt?v=4.5', true);
  x.onload = function(){
    if(x.status<200||x.status>=300){console.error('[raids-ui] b64 missing', x.status);return;}
    try{
      var bin = atob(x.responseText.trim());
      var bytes = new Uint8Array(bin.length);
      for(var k=0;k<bin.length;k++) bytes[k]=bin.charCodeAt(k);
      var code = new TextDecoder('utf-8').decode(bytes);
      var s = document.createElement('script');
      s.textContent = code;
      document.head.appendChild(s);
    }catch(e){console.error('[raids-ui] decode failed', e)}
  };
  x.onerror = function(){ console.error('[raids-ui] network error'); };
  x.send();
})();
