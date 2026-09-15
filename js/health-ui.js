'use strict';
(function(){
  const KEY='avtoritet_health_v3';
  const SAVE_KEY='avtoritet_save_v2';
  const MAX=100;
  const POINT_COST=250;
  const POINT_HEAL=10;
  const RANKS=[0,100,500,2000,8000,25000];
  const JAIL_THRESHOLDS=[60,250,420];
  const $=id=>document.getElementById(id);
  let prisonEventCount=0;
  let prisonEventBusy=false;

  function readGame(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{};}catch(e){return {};}}
  function readHealth(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'{}');
      const h=Number(raw.health);
      return Number.isFinite(h)?Math.max(0,Math.min(MAX,h)):MAX;
    }catch(e){return MAX;}
  }
  function hasHealthSave(){try{return localStorage.getItem(KEY)!==null;}catch(e){return false;}}
  function writeHealth(h){
    try{localStorage.setItem(KEY,JSON.stringify({version:3,health:Math.max(0,Math.min(MAX,Math.round(h)))}));return true;}catch(e){return false;}
  }
  function health(){return readHealth();}
  function setHealth(h){
    const next=Math.max(0,Math.min(MAX,Math.round(h)));
    writeHealth(next);
    render();
    if(next<=0)gameOver();
  }
  function rankOf(s){let i=0;for(let j=0;j<RANKS.length;j++)if(Number(s.points||0)>=RANKS[j])i=j;return i;}
  function msg(text){if(typeof window.msg==='function'){window.msg(text);return;}const el=$('event-message');if(el)el.textContent=text;}

  function healAd(){
    if(health()>=MAX){msg('❤️ Здоровье уже полностью восстановлено.');return;}
    if(typeof window.showRewardedAd!=='function'){msg('📺 Реклама временно недоступна.');return;}
    const started=window.showRewardedAd(function(rewarded){if(rewarded!==false){setHealth(MAX);msg('❤️ Здоровье полностью восстановлено.');}});
    if(started===false)msg('📺 Реклама временно недоступна.');
  }
  function healPoints(){
    const s=readGame(),h=health();
    if(h>=MAX){msg('❤️ Здоровье уже полностью восстановлено.');return;}
    if(Number(s.points||0)<POINT_COST){msg('⭐ Нужно '+POINT_COST+' понтов для восстановления '+POINT_HEAL+'% здоровья.');return;}
    s.points-=POINT_COST;
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(e){return;}
    setHealth(h+POINT_HEAL);msg('🩹 За '+POINT_COST+' понтов восстановлено +'+POINT_HEAL+'% здоровья.');
    if(typeof window.ui==='function')window.ui();
  }
  function gameOver(){
    const c=$('modal-content'),o=$('modal-overlay');if(!c||!o)return;
    o.dataset.locked='1';o.classList.remove('hidden');
    c.innerHTML='<h2>☠️ Срок окончен</h2><p>Здоровье закончилось. Авторитет потерян.</p><p>Придётся начинать с нуля.</p><button type="button" id="restart-game" style="width:100%;padding:13px">🔄 Начать сначала</button>';
    const b=$('restart-game');if(b)b.onclick=function(){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(KEY);location.reload();};
  }
  function render(){
    let box=$('health-box');
    if(!box){const p=$('player-info');if(!p)return;box=document.createElement('div');box.id='health-box';p.insertBefore(box,p.firstChild);}
    const h=health(),pts=Number(readGame().points||0),status=h>=80?'Крепкий':h>=55?'В норме':h>=30?'Побитый':'На пределе',icon=h>=80?'💪':h>=55?'🩹':h>=30?'⚠️':'🚨',canHeal=pts>=POINT_COST&&h<MAX;
    box.innerHTML='<div style="margin:6px 0 0;padding:7px 9px;border:1px solid rgba(255,255,255,.10);border-radius:11px;background:rgba(0,0,0,.14)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-weight:700;font-size:13px">❤️ Здоровье</span><span style="font-weight:800;font-size:13px">'+h+'%</span></div><div style="height:8px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden"><div style="width:'+h+'%;height:100%;border-radius:99px;background:linear-gradient(90deg,#b51f2a,#e65b45 55%,#69c96b);transition:width .35s ease"></div></div><div style="display:flex;justify-content:space-between;margin-top:3px;font-size:10px;opacity:.72"><span>'+icon+' '+status+'</span><span>макс. 100%</span></div><div style="margin-top:5px;font-size:10px;font-weight:700;opacity:.65">ВОССТАНОВЛЕНИЕ</div><div style="display:flex;gap:5px;margin-top:3px"><button type="button" id="health-ad" '+(h>=MAX?'disabled':'')+' style="flex:1;min-height:32px;padding:3px 5px;line-height:1;border-radius:8px;font-size:10px">🎬 <b>Восстановить</b><br><small>до 100%</small></button><button type="button" id="health-points" '+(canHeal?'':'disabled')+' style="flex:1;min-height:32px;padding:3px 5px;line-height:1;border-radius:8px;font-size:10px">⭐ <b>Восстановить</b><br><small>+10% · 250 ⭐</small></button></div></div>';
    const a=$('health-ad'),p=$('health-points');if(a)a.onclick=healAd;if(p)p.onclick=healPoints;
  }
  function normalEventDamage(){const damage=5+Math.floor(Math.random()*6);setHealth(health()-damage);msg('🥊 Негативное происшествие: -'+damage+'% здоровья.');}
  function interceptNormalChoices(){
    document.addEventListener('click',function(e){const b=e.target.closest('.choice');if(!b)return;const risk=[.55,0,.25,.4,.15,.6,.1],p=risk[Math.min(risk.length-1,Number(b.dataset.i)||0)];if(p<=0)return;if(Math.random()<=p)setTimeout(normalEventDamage,0);},true);
  }
  function refusalResult(s,label){
    const i=rankOf(s),noTrouble=Math.min(.85,.45+i*.08);
    if(Math.random()<noTrouble){s.points=Number(s.points||0)+5;s.respect=Number(s.respect||0)+1;localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('😏 '+label+': отказ прокатил. +5 ⭐ и +1 🧠.');return;}
    const d=5+Math.floor(Math.random()*6);setHealth(health()-d);msg('🥊 '+label+': за отказ прилетело -'+d+'% здоровья.');
  }
  function prisonEvents(){
    if(prisonEventBusy)return;const s=readGame();if(!s.jailed||health()<=0)return;prisonEventBusy=true;
    const events=[
      {title:'🧹 Коридор',text:'Надзиратель требует привести коридор в порядок.',a:'Сделать',b:'Отказаться',c:'Договориться',run:function(x){if(x===0){const i=rankOf(s);if(i>0)s.points=Math.max(0,RANKS[i]-1);localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('🧹 Работа выполнена. Понты немного просели.');}else if(x===1)refusalResult(s,'Коридор');else{const pay=Math.floor(Number(s.confiscatedCigarettes||0)*(.20+Math.random()*.11));s.confiscatedCigarettes=Math.max(0,Number(s.confiscatedCigarettes||0)-pay);localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('💬 Договорились. Отдано '+pay+' 🚬.');}}},
      {title:'🧹 Камера',text:'Нужно привести камеру в порядок.',a:'Сделать',b:'Отказаться',c:'Договориться',run:function(x){if(x===0){const i=rankOf(s);if(i>0)s.points=Math.max(0,RANKS[i]-1);localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('🧹 Камера приведена в порядок.');}else if(x===1)refusalResult(s,'Камера');else{const pay=Math.floor(Number(s.confiscatedCigarettes||0)*(.20+Math.random()*.11));s.confiscatedCigarettes=Math.max(0,Number(s.confiscatedCigarettes||0)-pay);localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('💬 Договорились. Отдано '+pay+' 🚬.');}}},
      {title:'🤐 Сокамерник',text:'Надзиратель предлагает рассказать о сокамернике.',a:'Рассказать',b:'Промолчать',c:'Сменить тему',run:function(x){if(x===0){s.points=Number(s.points||0)+10;s.respect=Math.max(0,Number(s.respect||0)-3);localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('🤐 +10 ⭐, но -3 🧠 уважения.');}else if(x===1)refusalResult(s,'Молчание');else if(Math.random()<.5){s.points=Math.max(0,Number(s.points||0)-15);localStorage.setItem(SAVE_KEY,JSON.stringify(s));msg('😬 Не прокатило. -15 ⭐.');}else msg('😏 Удалось сменить тему.');}}}
    ];
    const e=events[Math.floor(Math.random()*events.length)],o=$('modal-overlay'),c=$('modal-content');
    if(!o||!c){prisonEventBusy=false;return;}o.dataset.locked='1';o.classList.remove('hidden');
    c.innerHTML='<h2>'+e.title+'</h2><p>'+e.text+'</p><div class="choices"><button type="button" data-jc="0">'+e.a+'</button><button type="button" data-jc="1">'+e.b+'</button><button type="button" data-jc="2">'+e.c+'</button></div>';
    c.querySelectorAll('[data-jc]').forEach(function(b){b.onclick=function(){e.run(Number(b.dataset.jc));o.dataset.locked='0';o.classList.add('hidden');prisonEventBusy=false;render();if(typeof window.ui==='function')window.ui();if(health()<=0)return;checkPrisonProgress(true);};});
  }
  function checkPrisonProgress(force){const s=readGame();if(!s.jailed){prisonEventCount=0;return;}const taps=Number(s.jailTaps||0);while(prisonEventCount<JAIL_THRESHOLDS.length&&taps>=JAIL_THRESHOLDS[prisonEventCount]){prisonEventCount++;if(force||prisonEventCount===1){setTimeout(prisonEvents,250);break;}}}
  function watchJail(){
    const panel=$('jail-panel');
    if(panel){const observer=new MutationObserver(function(){const jailed=readGame().jailed;if(jailed){if(prisonEventCount===0){const h=health();setHealth(h*0.5);msg('🔒 Карцер: здоровье уменьшилось вдвое — '+health()+'%.');}checkPrisonProgress(false);}else prisonEventCount=0;});observer.observe(panel,{attributes:true,attributeFilter:['class']});}
    const tap=$('tap-object');if(tap)tap.addEventListener('click',function(){checkPrisonProgress(false);},true);
  }
  function init(){
    if(!hasHealthSave())writeHealth(MAX);
    render();
    if(hasHealthSave()&&health()<=0)gameOver();
    interceptNormalChoices();watchJail();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
