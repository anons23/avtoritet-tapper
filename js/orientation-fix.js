/* orientation-fix v2.0 — только портрет на мобильных */
'use strict';
(function(){
  var OVERLAY_ID='portrait-lock-overlay';

  function ensureOverlay(){
    var el=document.getElementById(OVERLAY_ID);
    if(el)return el;
    el=document.createElement('div');
    el.id=OVERLAY_ID;
    el.setAttribute('aria-live','polite');
    el.innerHTML=
      '<div class="portrait-lock-card">'+
        '<div class="portrait-lock-icon">📱</div>'+
        '<b>Переверните телефон</b>'+
        '<p>Игра работает только в вертикальном положении</p>'+
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function isMobile(){
    try{
      if(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)return true;
    }catch(e){}
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
  }

  function isLandscape(){
    try{
      if(window.matchMedia&&window.matchMedia('(orientation: landscape)').matches)return true;
    }catch(e){}
    return window.innerWidth>window.innerHeight;
  }

  function update(){
    var el=ensureOverlay();
    var lock=isMobile()&&isLandscape();
    el.classList.toggle('show',!!lock);
    document.documentElement.classList.toggle('force-portrait',!!lock);
    document.body.classList.toggle('force-portrait',!!lock);

    // попытка системной блокировки (работает не везде, только fullscreen/жест)
    try{
      if(screen.orientation&&typeof screen.orientation.lock==='function'){
        if(!isLandscape()){
          screen.orientation.lock('portrait').catch(function(){});
        }
      }
    }catch(e){}

    // подправить высоту контейнера
    try{
      var gc=document.getElementById('game-container');
      if(gc){
        gc.style.height='100dvh';
        gc.style.maxHeight='100dvh';
      }
    }catch(e){}
  }

  var t=0;
  function onChange(){
    clearTimeout(t);
    t=setTimeout(update,80);
  }

  window.addEventListener('orientationchange',onChange);
  window.addEventListener('resize',onChange);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',onChange);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update);
  else update();

  console.log('[orientation-fix] v2.0 portrait-only');
})();
