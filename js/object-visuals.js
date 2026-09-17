'use strict';
(function(){
  function img(src,cls,alt){
    return '<img class="'+cls+'" src="'+src+'" alt="'+alt+'" draggable="false">';
  }
  function setObjectVisuals(){
    const el=document.getElementById('object-emoji');
    const tap=document.getElementById('tap-object');
    if(!el||!tap)return;
    const name=(el.textContent||'').trim();
    tap.classList.remove('bag-mode','cellmate-mode','pushups-mode','trainer-mode');
    el.querySelectorAll('.boxing-bag-image,.cellmate-image,.pushups-image,.trainer-image').forEach(n=>n.remove());
    if(name==='🥊'||name==='Груша'){
      tap.classList.add('bag-mode');
      el.innerHTML=img('./assets/backgrounds/boxing-bag.png','boxing-bag-image','Боксёрская груша');
    }else if(name==='👊'||name==='Сокамерник'){
      tap.classList.add('cellmate-mode');
      el.innerHTML=img('./assets/backgrounds/cellmate.png','cellmate-image','Сокамерник');
    }else if(name==='💪'||name==='Отжимания'){
      tap.classList.add('pushups-mode');
      el.innerHTML=img('./assets/backgrounds/pushups.png','pushups-image','Отжимания');
    }else if(name==='🏋️'||name==='Тренажёр'){
      tap.classList.add('trainer-mode');
      el.innerHTML=img('./assets/backgrounds/trainer_down.png','trainer-image','Тренажёр');
    }
  }
  function install(){
    if(typeof window.ui!=='function')return false;
    const oldUi=window.ui;
    if(oldUi.__visualWrapped)return true;
    function wrappedUi(){oldUi();setObjectVisuals();}
    wrappedUi.__visualWrapped=true;
    window.ui=wrappedUi;
    setObjectVisuals();
    return true;
  }
  if(!install()){
    const timer=setInterval(function(){if(install())clearInterval(timer)},50);
  }
})();
