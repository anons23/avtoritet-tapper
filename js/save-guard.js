'use strict';
(function(){
  var MAX_RES=1e12;
  function clampNum(v,min,max,fb){var n=Number(v);if(!Number.isFinite(n))return fb;return Math.min(max,Math.max(min,n));}
  function clampInt(v,min,max,fb){return Math.floor(clampNum(v,min,max,fb));}
  function sanitize(state){
    if(!state||typeof state!=='object')return state;
    state.chifir=clampNum(state.chifir,0,MAX_RES,0);
    state.points=clampNum(state.points,0,MAX_RES,0);
    state.respect=clampNum(state.respect,0,1e6,0);
    state.wealth=clampNum(state.wealth,0,1e6,0);
    state.power=clampInt(state.power,1,1e5,1);
    state.critChance=clampNum(state.critChance,0,0.95,0.05);
    state.maxEnergy=clampInt(state.maxEnergy,1,1e5,250);
    state.energy=clampInt(state.energy,0,state.maxEnergy,Math.min(250,state.maxEnergy));
    state.totalTaps=clampInt(state.totalTaps,0,MAX_RES,0);
    state.jailTaps=clampInt(state.jailTaps,0,1e6,0);
    state.jailRequired=clampInt(state.jailRequired,1,1e6,500);
    state.confiscatedChifir=clampNum(state.confiscatedChifir,0,MAX_RES,0);
    if(state.upgrades&&typeof state.upgrades==='object'){
      state.upgrades.power=clampInt(state.upgrades.power,0,1e5,0);
      state.upgrades.crit=clampInt(state.upgrades.crit,0,1e5,0);
      state.upgrades.energyMax=clampInt(state.upgrades.energyMax,0,1e5,0);
    }
    if(state.boosters&&typeof state.boosters==='object'){
      state.boosters.double=clampInt(state.boosters.double,0,1e6,0);
    }
    if(state.tasks&&typeof state.tasks==='object'){
      ['taps','crit','events','jail','bugorSuccess','npcSuccess'].forEach(function(k){
        if(k in state.tasks) state.tasks[k]=clampInt(state.tasks[k],0,MAX_RES,0);
      });
      if('earned' in state.tasks) state.tasks.earned=clampNum(state.tasks.earned,0,MAX_RES,0);
    }
    if(typeof state.nickname==='string'){
      state.nickname=state.nickname.replace(/[^\w\u0400-\u04FF\- ]/g,'').trim().slice(0,16);
    }
    return state;
  }
  function wrap(){
    if(typeof window.getGameState!=='function'){setTimeout(wrap,50);return;}
    var s=window.getGameState();
    if(s) sanitize(s);
    var origSave=window.saveGame;
    if(typeof origSave==='function' && !origSave.__sanitized){
      window.saveGame=function(){
        try{var st=window.getGameState();if(st)sanitize(st);}catch(e){}
        return origSave.apply(this,arguments);
      };
      window.saveGame.__sanitized=true;
    }
    window.sanitizeGameState=sanitize;
    console.log('[save-guard] active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrap);
  else wrap();
})();
