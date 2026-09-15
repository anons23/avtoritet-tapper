'use strict';
(function(){
  const KEY='avtoritet_health_v2';
  const MAX=100;
  const PONT_COST=250;
  const PONT_HEAL=10;
  const RANKS=[0,100,500,2000,8000,25000];
  const JAIL_THRESHOLDS=[60,250,420];
  const $=id=>document.getElementById(id);
  function read(){try{return JSON.parse(localStorage.getItem('avtoritet_save_v2')||'{}')||{}}catch(e){return {}}}
  function write(s){try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(s));return true}catch(e){return false}}
  function health(){const s=read();let h=Number(s.health);if(!Number.isFinite(h))h=MAX;return Math.max(0,Math.min(MAX,h))}
  function setHealth(h){const s=read();s.health=Math.max(0,Math.min(MAX,Math.round(h)));write(s);render();if(s.health<=0)gameOver()}
  function rankIndex(points){let i=0;for(let j=0;j<RANKS.length;j++)if(points>=RANKS[j])i=j;return i}
  function healAd(){if(typeof window.showRewardedAd==='function')window.showRewardedAd(()=>setHealth(MAX));else msg('📺 Rewarded-реклама пока не подключена.')}
  function healPoints(){const s=read();if(Number(s.points||0)<PONT_COST){msg('⭐ Нужно '+PONT_COST+' понтов для восстановления '+PONT_HEAL+'% здоровья.');return}s.points-=PONT_COST;s.health=Math.min(MAX,(Number(s.health)||0)+PONT_HEAL);write(s);render();msg('🩹 За '+PONT_COST+' понтов восстановлено +'+PONT_HEAL+'% здоровья.')}
  function gameOver(){const c=$('modal-content'),o=$('modal-overlay');if(!c||!o)return;o.dataset.locked='1';o.classList.remove('hidden');c.innerHTML='<h2>☠️ Срок окончен</h2><p>Здоровье закончилось. Авторитет потерян.</p><p>Придётся начинать с нуля.</p><button type="button" id="restart-game" style="width:100%;padding:13px">🔄 Начать сначала</button>';const b=$('restart-game');if(b)b.onclick=()=>{localStorage.removeItem('avtoritet_save_v2');localStorage.removeItem(KEY);location.reload()}}
  function render(){let box=$('health-box');if(!box){const p=$('player-info');if(!p)return;box=document.createElement('div');box.id='health-box';box.style='margin-top:6px;text-align:center';p.appendChild(box)}const h=health();box.innerHTML='<div>❤️ Здоровье: <b>'+h+'%</b></div><div style="height:8px;background:#333;border-radius:6px;overflow:hidden;margin:4px 18px"><div style="width:'+h+'%;height:100%;background:#d33"></div></div><div style="display:flex;gap:6px;justify-content:center;margin-top:5px"><button type="button" id="health-ad">🎬 Восстановить 100%</button><button type="button" id="health-points">⭐ +10% за '+PONT_COST+' понтов</button></div>';$('health-ad').onclick=healAd;$('health-points').onclick=healPoints}
  function normalEventDamage(){const before=health();const damage=5+Math.floor(Math.random()*6);setHealth(before-damage);msg('🥊 Негативное происшествие: -'+damage+'% здоровья.')}
  function interceptNormalChoices(){document.addEventListener('click',e=>{const b=e.target.closest('.choice');if(!b)return;const i=Number(b.dataset.i)||0;const risk=[.55,0,.25,.4,.15,.6,.1];const p=risk[Math.min(risk.length-1,i)];if(p<=0)return;const first=Math.random(),fail=first<=p;if(!fail)return;const second=Math.random();const old=Math.random;let calls=0;Math.random=()=>calls++===0?first:second;setTimeout(()=>{Math.random=old;normalEventDamage()},0)},true)}
  function newJailSession(s){return Number(s.jailed)&&!localStorage.getItem(KEY+'_active')}
  function enterJailEffects(s){
    localStorage.setItem(KEY+'_active','1');
    // Сигареты НЕ уменьшаются при входе в карцер. game.js временно переносит их в confiscatedCigarettes и вернёт при выходе.
    // В карцере платёжные события уменьшают именно confiscatedCigarettes.
    const h=Number.isFinite(Number(s.health))?Number(s.health):MAX;
    s.health=Math.max(0,Math.round(h*0.5));
    s.__healthJailEvents=[];
    write(s);
    msg('🔒 Карцер: здоровье уменьшилось вдвое — '+s.health+'%. Сигареты сохранены.');
    if(s.health<=0){gameOver();return}
  }
  function clearJailSession(){localStorage.removeItem(KEY+'_active');localStorage.removeItem(KEY+'_event_count')}
  function refusalResult(s,label){
    const i=rankIndex(Number(s.points||0));
    const noTrouble=Math.min(.85,.45+i*.08);
    if(Math.random()<noTrouble){s.points=Number(s.points||0)+5;s.respect=Number(s.respect||0)+1;write(s);msg('😏 '+label+': отказ прокатил. +5 ⭐ и +1 🧠 — понты на месте.');return}
    const d=5+Math.floor(Math.random()*6);s.health=Math.max(0,(Number(s.health)||0)-d);write(s);msg('🥊 '+label+': за отказ прилетело -'+d+'% здоровья.');if(s.health<=0)gameOver()
  }
  function prisonEvents(){
    const s=read();if(!s.jailed||Number(s.health||0)<=0)return;
    const events=[
      {title:'🧹 Коридор',text:'Надзиратель требует вымыть пол. Можно сохранить достоинство, но рискнуть здоровьем.',a:'Вымыть',b:'Отказаться',c:'Подкупить',run:x=>{if(x===0){const i=rankIndex(Number(s.points||0));if(i>0)s.points=Math.max(0,RANKS[i]-1);write(s);msg('🧹 Вымыл пол. Понты просели до предыдущей масти.')}else if(x===1)refusalResult(s,'Коридор')else{const pay=Math.floor(Number(s.confiscatedCigarettes||0)*(0.20+Math.random()*0.11));s.confiscatedCigarettes=Math.max(0,Number(s.confiscatedCigarettes||0)-pay);write(s);msg('💸 Подкупил надзирателя. Отдано '+pay+' 🚬.')}}},
      {title:'🚽 Толчок',text:'Приказали отмыть туалет.',a:'Вымыть',b:'Отказаться',c:'Подкупить',run:x=>{if(x===0){const i=rankIndex(Number(s.points||0));if(i>0)s.points=Math.max(0,RANKS[i]-1);write(s);msg('🚽 Отмыл толчок. Понты просели до предыдущей масти.')}else if(x===1)refusalResult(s,'Толчок')else{const pay=Math.floor(Number(s.confiscatedCigarettes||0)*(0.20+Math.random()*0.11));s.confiscatedCigarettes=Math.max(0,Number(s.confiscatedCigarettes||0)-pay);write(s);msg('💸 Подкуп сработал. Отдано '+pay+' 🚬.')}}},
      {title:'🤐 Сокамерник',text:'Надзиратель предлагает настучать на сокамерника.',a:'Настучать',b:'Промолчать',c:'Перевести стрелки',run:x=>{if(x===0){s.points=Number(s.points||0)+10;s.respect=Math.max(0,Number(s.respect||0)-3);write(s);msg('🤐 +10 ⭐, но -3 🧠 уважения.')}else if(x===1)refusalResult(s,'Молчание')else{if(Math.random()<.5){s.points=Math.max(0,Number(s.points||0)-15);write(s);msg('😬 Не прокатило. -15 ⭐.')}else{write(s);msg('😏 Перевёл стрелки и вышел сухим.')}}}},
      {title:'📦 Чужая посылка',text:'В камере нашли чужую посылку и требуют назвать владельца.',a:'Взять вину',b:'Сдать владельца',c:'Молчать',run:x=>{if(x===0){s.points=Math.max(0,Number(s.points||0)-20);write(s);msg('📦 Взял вину на себя. -20 ⭐.')}else if(x===1){s.respect=Math.max(0,Number(s.respect||0)-5);s.points=Number(s.points||0)+15;write(s);msg('📦 Сдал владельца. +15 ⭐, но -5 🧠.')}else refusalResult(s,'Посылка')}}
    ];
    const e=events[Math.floor(Math.random()*events.length)],o=$('modal-overlay'),c=$('modal-content');if(!o||!c)return;o.dataset.locked='1';o.classList.remove('hidden');c.innerHTML='<h2>'+e.title+'</h2><p>'+e.text+'</p><div class="choices"><button type="button" data-jc="0">'+e.a+'</button><button type="button" data-jc="1">'+e.b+'</button><button type="button" data-jc="2">'+e.c+'</button></div>';c.querySelectorAll('[data-jc]').forEach(b=>b.onclick=()=>{e.run(Number(b.dataset.jc));o.dataset.locked='0';o.classList.add('hidden');render();const x=read();if(Number(x.health||0)<=0)return;if(Number(x.jailed))setTimeout(prisonEvents,900)})
  }
  function jailStartCheck(){const s=read();if(!s.jailed){clearJailSession();return}if(newJailSession(s)){enterJailEffects(s);return}const done=Number(localStorage.getItem(KEY+'_event_count')||0),taps=Number(s.jailTaps||0);if(done<JAIL_THRESHOLDS.length&&taps>=JAIL_THRESHOLDS[done]){localStorage.setItem(KEY+'_event_count',String(done+1));setTimeout(prisonEvents,250)}}
  function init(){render();interceptNormalChoices();setInterval(jailStartCheck,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();