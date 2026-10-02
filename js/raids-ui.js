/* RAID SYSTEM - selection, progress, energy, reactions */
'use strict';
(()=>{
  const RAID_RANK_REQUIREMENTS=[0,1500,5000,15000,50000];
  const RAID_FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,first:{chifir:2000,points:150},repeat:{chifir:500,points:40},scene:'talk'},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,first:{chifir:2500,points:200},repeat:{chifir:625,points:50},scene:'talk'},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,first:{chifir:4000,points:300},repeat:{chifir:1000,points:75},scene:'fight'},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,first:{chifir:5500,points:400},repeat:{chifir:1375,points:100},scene:'fight'},
    {id:'glaz',name:'ГЛАЗ',rank:2,hp:5000,first:{chifir:7000,points:500},repeat:{chifir:1750,points:125},scene:'glaz'},
    {id:'krest',name:'КРЕСТ',rank:3,hp:6500,first:{chifir:9000,points:700},repeat:{chifir:2250,points:175},scene:'krest'},
    {id:'psikh',name:'ПСИХ АРКАША',rank:4,hp:8000,first:{chifir:12000,points:1000},repeat:{chifir:3000,points:250},scene:'psikh'}
  ];
  // truncated for length - will fix
  window.openRaidMenu=function(){alert('temp');};
})();
