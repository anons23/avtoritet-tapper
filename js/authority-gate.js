'use strict';
(function(){
  const MIN_POINTS=40000;
  const MIN_OBJECT=4;
  const DEAL_COOLDOWN_TAPS=100;
  const DEAL_RE=/^(📋\s*)?(Дело барака|Распределение|Разговор|Решение|Договорённость)/;
  let lastDealTap=-Infinity;
  let originalTapHTML='<div id="tap-object" class="tap-target preload-hidden"><div id="object-emoji"></div><div id="object-name">Груша</div><small id="object-action">ТАПАЙ!</small></div><div id="tap-feedback"></div>';
  let originalUi=null;
  let uiWrapped=false;

  function state(){
    return window.getGameState?window.getGameState():null
  }

  function eligible(s){
    return !!s&&!s.jailed&&Number(s.points)>=MIN_POINTS&&Number(s.currentObject)>=MIN_OBJECT
  }

  function normalize(s){
    if(!s)return false;
    if(Number(s.points)<MIN_POINTS&&Number(s.currentObject)>=MIN_OBJECT){
      s.currentObject=3;
      if(typeof window.saveGame==='function')window.saveGame();
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
    try{
      if(originalUi)originalUi();
      else if(typeof window.ui==='function'&&!uiWrapped)window.ui();
    }catch(e){}
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

  function wrapUi(){
    if(typeof window.ui!=='function'||window.ui.__authorityGate)return;
    originalUi=window.ui;
    function guardedUi(){
      const s=state();
      normalize(s);
      const result=originalUi.apply(this,arguments);
      if(!eligible(s))restoreBase();
      return result;
    }
    guardedUi.__authorityGate=true;
    window.ui=guardedUi;
    uiWrapped=true;
  }

  function init(){
    const area=document.getElementById('tap-area');
    if(area){
      const base=area.innerHTML;
      if(base&&!base.includes('authority-screen'))originalTapHTML=base;
    }

    wrapMessages();
    wrapUi();
    guard();

    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)guard();
    });

    window.addEventListener('focus',guard,{passive:true});
    window.addEventListener('pageshow',guard,{passive:true});

    const areaObserver=document.getElementById('tap-area');
    if(areaObserver){
      const observer=new MutationObserver(()=>{
        const s=state();
        const screen=areaObserver.querySelector('.authority-screen');
        if(screen&&!eligible(s))restoreBase();
      });
      observer.observe(areaObserver,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();