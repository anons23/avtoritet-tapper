/* game monolithic loader v4.40 */
'use strict';
(function(){
  var parts=7, acc=[], i=0;
  function next(){
    if(i>=parts){
      try{
        var bin=atob(acc.join(''));
        var bytes=new Uint8Array(bin.length);
        for(var k=0;k<bin.length;k++) bytes[k]=bin.charCodeAt(k);
        var code=new TextDecoder('utf-8').decode(bytes);
        var s=document.createElement('script');
        s.textContent=code;
        document.head.appendChild(s);
        console.log('[game] monolithic OK TEST_MODE=', typeof TEST_MODE!=='undefined'?TEST_MODE:'?');
      }catch(e){console.error('[game] decode failed',e)}
      return;
    }
    var x=new XMLHttpRequest();
    x.open('GET','./js/game.p'+i+'.b64.txt?v=4.40',true);
    x.onload=function(){
      if(x.status>=200&&x.status<300){acc.push(x.responseText.trim());i++;next();}
      else console.error('[game] missing part',i,x.status);
    };
    x.onerror=function(){console.error('[game] network',i);};
    x.send();
  }
  next();
})();
