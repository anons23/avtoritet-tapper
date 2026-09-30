'use strict';
(function(){
  // На телефонах touchstart обычно сопровождается synthetic click.
  // Игра слушает оба события, поэтому второй tap нужно погасить.
  function init(){
    const area=document.getElementById('tap-area');
    if(!area)return;
    let lastTouch=0;
    area.addEventListener('touchstart',function(){lastTouch=Date.now()},{passive:true});
    area.addEventListener('click',function(event){
      if(Date.now()-lastTouch<650){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
