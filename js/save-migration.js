'use strict';
(function(){
  const KEY='avtoritet_save_v2';
  const VERSION=6;
  const NUMERIC=['cigarettes','chifir','points','energy','maxEnergy','power','critChance','respect','wealth','currentObject','prestige','lastEnergyTime','saveUpdatedAt','lastChoiceEvent','totalTaps','jailTaps','jailRequired','confiscatedCigarettes','confiscatedChifir','jailProtection'];
  const DEFAULTS={upgrades:{power:0,crit:0,energyMax:0},boosters:{double:0},tasks:{taps:0,crit:0,events:0,earned:0,jail:0},completed:{}};
  function finite(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback}
  function migrate(){
    try{
      const raw=localStorage.getItem(KEY);if(!raw)return;
      const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('invalid save');
      /* Resource migration: old cigarette saves become chifir without loss. */
      const oldChifir=finite(data.chifir,0);
      const oldCigarettes=finite(data.cigarettes,0);
      data.chifir=Math.max(oldChifir,oldCigarettes);
      const oldConfiscatedChifir=finite(data.confiscatedChifir,0);
      const oldConfiscatedCigarettes=finite(data.confiscatedCigarettes,0);
      data.confiscatedChifir=Math.max(oldConfiscatedChifir,oldConfiscatedCigarettes);
      data.upgrades={...DEFAULTS.upgrades,...(data.upgrades||{})};data.boosters={...DEFAULTS.boosters,...(data.boosters||{})};data.tasks={...DEFAULTS.tasks,...(data.tasks||{})};data.completed={...DEFAULTS.completed,...(data.completed||{})};
      NUMERIC.forEach(function(key){if(key in data)data[key]=finite(data[key],key==='energy'?250:0);});
      if(!data.saveUpdatedAt||data.saveUpdatedAt<1)data.saveUpdatedAt=Date.now();
      data.maxEnergy=Math.max(1,data.maxEnergy||250);data.energy=Math.max(0,Math.min(data.maxEnergy,data.energy));data.power=Math.max(1,data.power||1);data.critChance=Math.max(0,Math.min(.95,data.critChance||.05));data.currentObject=Math.max(0,Math.floor(data.currentObject||0));data.jailTaps=Math.max(0,Math.floor(data.jailTaps||0));data.jailRequired=Math.max(1,Math.floor(data.jailRequired||500));data.confiscatedChifir=Math.max(0,Math.floor(data.confiscatedChifir||0));data.upgrades.power=Math.max(0,Math.floor(data.upgrades.power||0));data.upgrades.crit=Math.max(0,Math.floor(data.upgrades.crit||0));data.upgrades.energyMax=Math.max(0,Math.floor(data.upgrades.energyMax||0));data.saveVersion=VERSION;localStorage.setItem(KEY,JSON.stringify(data));
    }catch(e){try{localStorage.removeItem(KEY)}catch(ignore){}}
  }
  migrate();
})();