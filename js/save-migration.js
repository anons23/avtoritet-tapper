'use strict';
(function(){
  const KEY='avtoritet_save_v2';
  const BACKUP_KEY='avtoritet_save_v2_backup';
  const VERSION=7;
  const MAX_RES=1e12;
  const NUMERIC=['cigarettes','chifir','points','energy','maxEnergy','power','critChance','respect','wealth','currentObject','prestige','lastEnergyTime','saveUpdatedAt','lastChoiceEvent','totalTaps','jailTaps','jailRequired','confiscatedCigarettes','confiscatedChifir','jailProtection'];
  const DEFAULTS={upgrades:{power:0,crit:0,energyMax:0},boosters:{double:0},tasks:{taps:0,crit:0,events:0,earned:0,jail:0},completed:{}};
  function finite(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback}
  function clamp(value,min,max,fallback){
    const n=finite(value,fallback);
    return Math.min(max,Math.max(min,n));
  }
  function migrate(){
    let raw='';
    try{
      raw=localStorage.getItem(KEY);if(!raw)return;
      try{localStorage.setItem(BACKUP_KEY,raw)}catch(ignore){}
      const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('invalid save');
      /* Resource migration: old cigarette saves become chifir without loss. */
      const oldChifir=finite(data.chifir,0);
      const oldCigarettes=finite(data.cigarettes,0);
      data.chifir=Math.max(oldChifir,oldCigarettes);
      const oldConfiscatedChifir=finite(data.confiscatedChifir,0);
      const oldConfiscatedCigarettes=finite(data.confiscatedCigarettes,0);
      data.confiscatedChifir=Math.max(oldConfiscatedChifir,oldConfiscatedCigarettes);
      data.upgrades={...DEFAULTS.upgrades,...(data.upgrades||{})};
      data.boosters={...DEFAULTS.boosters,...(data.boosters||{})};
      data.tasks={...DEFAULTS.tasks,...(data.tasks||{})};
      data.completed={...DEFAULTS.completed,...(data.completed||{})};
      NUMERIC.forEach(function(key){if(key in data)data[key]=finite(data[key],key==='energy'?250:0);});
      if(!data.saveUpdatedAt||data.saveUpdatedAt<1)data.saveUpdatedAt=Date.now();
      /* Clamp absurd / injected values (anti-cheat baseline) */
      data.chifir=clamp(data.chifir,0,MAX_RES,0);
      data.points=clamp(data.points,0,MAX_RES,0);
      data.respect=clamp(data.respect,0,1e6,0);
      data.wealth=clamp(data.wealth,0,1e6,0);
      data.maxEnergy=clamp(data.maxEnergy,1,100000,250);
      data.energy=clamp(data.energy,0,data.maxEnergy,Math.min(250,data.maxEnergy));
      data.power=clamp(data.power,1,100000,1);
      data.critChance=clamp(data.critChance,0,0.95,0.05);
      data.currentObject=Math.max(0,Math.floor(clamp(data.currentObject,0,20,0)));
      data.prestige=Math.max(0,Math.floor(clamp(data.prestige,0,1000,0)));
      data.totalTaps=clamp(data.totalTaps,0,MAX_RES,0);
      data.jailTaps=Math.max(0,Math.floor(clamp(data.jailTaps,0,1e6,0)));
      data.jailRequired=Math.max(1,Math.floor(clamp(data.jailRequired,1,1e6,500)));
      data.confiscatedChifir=clamp(data.confiscatedChifir,0,MAX_RES,0);
      data.jailProtection=Math.max(0,Math.floor(clamp(data.jailProtection,0,1e5,0)));
      data.upgrades.power=Math.max(0,Math.floor(clamp(data.upgrades.power,0,1e5,0)));
      data.upgrades.crit=Math.max(0,Math.floor(clamp(data.upgrades.crit,0,1e5,0)));
      data.upgrades.energyMax=Math.max(0,Math.floor(clamp(data.upgrades.energyMax,0,1e5,0)));
      if(data.boosters)data.boosters.double=Math.max(0,Math.floor(clamp(data.boosters.double,0,1e6,0)));
      if(data.tasks){
        ['taps','crit','events','jail','bugorSuccess','npcSuccess'].forEach(function(k){
          if(k in data.tasks)data.tasks[k]=Math.max(0,Math.floor(clamp(data.tasks[k],0,MAX_RES,0)));
        });
        if('earned' in data.tasks)data.tasks.earned=clamp(data.tasks.earned,0,MAX_RES,0);
      }
      data.saveVersion=VERSION;
      localStorage.setItem(KEY,JSON.stringify(data));
    }catch(e){
      /* Never delete the user's save because migration failed. The original raw save is preserved. */
      try{if(raw)localStorage.setItem(BACKUP_KEY,raw)}catch(ignore){}
    }
  }
  migrate();
})();
