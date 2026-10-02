/* EMERGENCY game.js v4.42 — force kill black preloader */
'use strict';
const TEST_MODE=true;
const TEST_POINTS_PER_TAP=500;
const N=['Салага'];
const R=[['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',50000]];
const O=[['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,50000]];
let s={chifir:0,points:0,energy:250,maxEnergy:250,power:1,critChance:.05,respect:0,wealth:0,nickname:'Салага',currentObject:0,prestige:0,upgrades:{power:0,crit:0,energyMax:0},boosters:{double:0},tasks:{taps:0,crit:0,events:0,earned:0,jail:0,bugorSuccess:0,npcSuccess:0},completed:{},achievements:{},storySeen:{},lastEnergyTime:Date.now(),saveUpdatedAt:Date.now(),lastChoiceEvent:0,totalTaps:0,jailed:false,jailTaps:0,jailRequired:500,confiscatedChifir:0,jailProtection:0,authorityTaps:0,energyRepairVersion:0,sentenceDays:100,servedSentenceMinutes:0,lastSentenceTick:Date.now(),sentenceReleaseCount:0};
const $=id=>document.getElementById(id);
function fmt(n){return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ')}
function killBlackScreen(){
  try{
    const p=document.getElementById('preloader');
    if(p){p.classList.add('is-hidden');p.style.cssText='display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important';p.remove();}
    const g=document.getElementById('game-container');
    if(g){g.classList.remove('game-booting');g.style.visibility='visible';}
    document.querySelectorAll('#tap-object.preload-hidden,.preload-hidden').forEach(function(el){el.classList.remove('preload-hidden');el.style.visibility='visible';});
  }catch(e){}
}
function ui(){
  try{
    if($('chifir'))$('chifir').textContent=fmt(s.chifir);
    if($('points'))$('points').textContent=fmt(s.points);
    if($('energy'))$('energy').textContent=fmt(s.energy);
    if($('max-energy'))$('max-energy').textContent=fmt(s.maxEnergy);
    if($('nickname'))$('nickname').textContent=s.nickname||'Салага';
    if($('rank'))$('rank').textContent=(R.find(r=>s.points>=r[1])||R[0])[0];
    if($('power-stat'))$('power-stat').textContent=fmt(s.power);
    if($('object-name'))$('object-name').textContent=O[s.currentObject][0];
    if($('object-action'))$('object-action').textContent='ТАПАЙ!';
    const t=$('tap-object');if(t){t.classList.remove('preload-hidden');t.style.visibility='visible';}
  }catch(e){}
}
function feedback(e,g,c){
  const f=$('tap-feedback');if(!f)return;
  f.textContent=(c?'⚡ ':'')+'+'+g;
  f.classList.add('show');
  setTimeout(function(){f.classList.remove('show');},600);
}
function tap(e){
  if(e&&e.preventDefault)e.preventDefault();
  if(s.energy<1)return;
  s.energy--;
  s.totalTaps++;
  s.tasks.taps++;
  let g=TEST_MODE?TEST_POINTS_PER_TAP:s.power;
  const c=Math.random()<s.critChance;
  if(c)g=Math.round(g*2);
  s.chifir+=g;s.points+=g;s.tasks.earned+=g;
  const t=$('tap-object');if(t){t.classList.remove('punch');void t.offsetWidth;t.classList.add('punch');}
  feedback(e,Math.floor(g),c);
  ui();
}
function bind(){
  killBlackScreen();
  const area=$('tap-area')||$('tap-object');
  if(area){
    area.addEventListener('pointerdown',tap,{passive:false});
    area.addEventListener('click',tap,{passive:false});
  }
  ui();
  try{if(typeof window.__finishPreloader==='function')window.__finishPreloader();}catch(e){}
  try{if(typeof window.__setPreloaderProgress==='function')window.__setPreloaderProgress(100,'Готово');}catch(e){}
  setTimeout(killBlackScreen,100);
  setTimeout(killBlackScreen,500);
  setTimeout(killBlackScreen,1500);
  console.log('[game] v4.42 OK — preloader killed, TEST_MODE=',TEST_MODE);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.getGameState=function(){return s;};
window.saveGame=function(){};
window.ui=ui;
