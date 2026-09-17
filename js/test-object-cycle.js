'use strict';
(function(){
  const TEST_MODE=true;
  if(!TEST_MODE)return;

  const OBJECTS=[
    ['Груша','🥊'],
    ['Сокамерник','👊'],
    ['Отжимания','💪'],
    ['Тренажёр','🏋️'],
    ['Авторитет','👑']
  ];

  function render(state){
    const o=OBJECTS[state.currentObject]||OBJECTS[0];
    const emoji=document.getElementById('object-emoji');
    const name=document.getElementById('object-name');
    if(emoji)emoji.textContent=o[1];
    if(name)name.textContent=o[0];
  }

  function install(){
    const area=document.getElementById('tap-area');
    if(!area||typeof window.getGameState!=='function')return false;
    const state=window.getGameState();
    state.currentObject=0;
    render(state);

    area.addEventListener('pointerdown',function(){
      const beforeTaps=state.totalTaps;
      const beforeObject=state.currentObject;
      setTimeout(function(){
        if(state.totalTaps!==beforeTaps+1||state.jailed)return;
        state.currentObject=(beforeObject+1)%OBJECTS.length;
        render(state);
        try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(state))}catch(e){}
      },0);
    },{passive:true});
    return true;
  }

  if(!install()){
    const timer=setInterval(function(){if(install())clearInterval(timer)},50);
  }
})();
