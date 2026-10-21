/* authority-anim-fix v1.0 — enable tap animation on Разборка stage */
'use strict';
(function(){
  function patch(){
    var orig = window.animateObjectVisual;
    if(typeof orig!=='function' || orig.__authFixed) return false;
    window.animateObjectVisual = function(){
      try{
        var nameEl = document.getElementById('object-name');
        var n = nameEl ? String(nameEl.textContent||'').trim() : '';
        var emoji = document.getElementById('object-emoji');
        var target = document.getElementById('tap-object');
        if(n==='Разборка' && emoji){
          // simple punch/scale feedback for authority stage
          if(target){ target.classList.remove('punch'); void target.offsetWidth; target.classList.add('punch'); }
          var img = emoji.querySelector('img');
          if(img && img.animate){
            try{ img.animate([
              {transform:'scale(1) rotate(0deg)'},
              {transform:'scale(0.92) rotate(-2deg)'},
              {transform:'scale(1.04) rotate(1deg)'},
              {transform:'scale(1) rotate(0deg)'}
            ], {duration:280, easing:'cubic-bezier(.22,.61,.36,1)'}); }catch(e){}
          }
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    window.animateObjectVisual.__authFixed = true;
    console.log('[authority-anim-fix] OK');
    return true;
  }
  if(!patch()){
    setTimeout(patch, 500);
    setTimeout(patch, 1500);
    setTimeout(patch, 3000);
  }
})();
