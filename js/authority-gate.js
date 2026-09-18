'use strict';
(function(){
  const MIN_POINTS=40000;
  const MIN_OBJECT=4;
  const DEAL_COOLDOWN_TAPS=100;
  const DEAL_RE=/^(📋\s*)?(Дело барака|Распределение|Разговор|Решение|Договорённость)/;
  let lastDealTap=-Infinity;
  let originalTapHTML='<div id="tap-object" class="tap-target preload-hidden"><div id="object-emoji"></div><div id="object-name">Груша</div><small id="object-action">ТАПАЙ!</small></div><div id="tap-feedback"></div>';
  function state(){return window.getGameState?window.getGameState():null}
  function eligible(s){return !!s&&!s.jailed&&Number(s.points)>=MIN_POINTS&&Number(s.currentObject)>=MIN_OBJECT}
  function normalize(s){
    if(!s)return false;
    if(Number(s.points)<MIN_POINTS&&Number(s.currentObject)>=MIN_OBJECT){
      s.currentObject=3;
      s.saveUpdatedAt=Date.now();
      try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(s))}catch(e){}
    }
    return eligible(s);
  }
  function restoreBase(){
    const area=document.getElementById('tap-area');
    if(!area)return;
    const screen=area.querySelector('.authority-screen');
    if(!screen)return;
    area.innerHTML=originalTapHTML;
    document.getElementById('game-container')?.classList.remove('authority-mode');
    area.classList.remove('authority-tap-area');
    try{window.ui&&window.ui()}catch(e){}
  }
  function guard(){
    const s=state();
    if(!normalize(s))restoreBase();
  }
  function wrapMessages(){
    if(typeof window.msg!=='function'||window.msg.__authorityGate)return;
    const original=window.msg;
    function gatedMessage(value){
      const text=String(value||'');
      if(DEAL_RE.test(text)){
        const s=state();
        const taps=Number(s?.totalTaps)||0;
        if(!eligible(s)||taps-lastDealTap<DEAL_COOLDOWN_TAPS)return;
        lastDealTap=taps;
      }
      return original.apply(this,arguments);
    }
    gatedMessage.__authorityGate=true;
    window.msg=gatedMessage;
  }
  function init(){
    const area=document.getElementById('tap-area');
    if(area){const base=area.innerHTML;if(base&&!base.includes('authority-screen'))originalTapHTML=base}
    wrapMessages();
    guard();
    setInterval(()=>{wrapMessages();guard()},80);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();