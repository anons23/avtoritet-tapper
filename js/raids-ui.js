/* RAID SYSTEM — four fighters, two locations, unique reactions */
'use strict';
(()=>{
  const RAID_FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,first:{chifir:2000,points:150},repeat:{chifir:500,points:40},scene:'talk'},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,first:{chifir:2500,points:200},repeat:{chifir:625,points:50},scene:'talk'},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,first:{chifir:4000,points:300},repeat:{chifir:1000,points:75},scene:'fight'},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,first:{chifir:5500,points:400},repeat:{chifir:1375,points:100},scene:'fight'}
  ];
  let raid={fighter:0,hp:0,startedAt:0,extensionUsed:false,active:false};
  const $=id=>document.getElementById(id);
  const state=()=>window.getGameState?.();
  function fighter(){return RAID_FIGHTERS[raid.fighter]||RAID_FIGHTERS[0]}
  function unlockedIndexes(){const s=state();const points=Number(s?.points)||0;return RAID_FIGHTERS.map((f,i)=>({f,i})).filter(x=>points>=x.f.rank*500).map(x=>x.i)}
  function ensureRaidButton(){
    if($('raid-open-button'))return;
    const b=document.createElement('button');
    b.id='raid-open-button';b.type='button';b.title='Рейд';b.setAttribute('aria-label','Открыть рейд');
    b.innerHTML='<img src="./assets/raids/ui/raid-button.png" alt="Рейд">';
    b.addEventListener('click',openRaid);
    document.body.appendChild(b);
  }
  function formatTime(ms){const sec=Math.max(0,Math.ceil(ms/1000));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
  function damageValue(){const s=state();return Math.max(1,Math.floor(Number(s?.power)||1))}
  function render(){
    const f=fighter(), pct=Math.max(0,raid.hp/f.hp*100);
    const root=$('raid-scene');if(!root)return;
    root.className='raid-scene '+f.scene;
    root.innerHTML=
      '<div class="raid-hud"><div class="raid-title">⚔️ РЕЙД · '+f.name+'</div><div id="raid-timer" class="raid-timer">90:00</div></div>'+
      '<div class="raid-fighter '+f.id+'" id="raid-fighter"><div class="raid-name '+f.id+'">'+f.name+'</div>'+
      '<div class="raid-hp"><div class="raid-hp-track"><div id="raid-hp-fill" class="raid-hp-fill" style="width:'+pct+'%"></div></div><div id="raid-hp-text" class="raid-hp-text">'+raid.hp+' / '+f.hp+'</div></div>'+
      '<img src="./assets/raids/fighters/'+f.id+'.png" alt="'+f.name+'"></div>'+
      '<div id="raid-damage" class="raid-damage"></div>'+
      '<div class="raid-note">Тапай по бойцу · урон = текущая сила</div>'+
      '<div class="raid-controls"><button type="button" id="raid-next" class="raid-next">Следующий</button></div>'+
      '<div id="raid-result" class="raid-result"><div class="raid-result-card"><h2 id="raid-result-title"></h2><div id="raid-result-text"></div><button type="button" id="raid-close" class="raid-close">Закрыть</button></div></div>';
    $('raid-next').addEventListener('click',()=>{const ids=unlockedIndexes();const pos=ids.indexOf(raid.fighter);raid.fighter=ids[(pos+1)%ids.length];startFighter()});
    $('raid-close').addEventListener('click',()=>{raid.active=false;window.closeModal?.()});
    $('raid-fighter').addEventListener('pointerdown',onTap,{passive:false});
    updateTimer();
  }
  function startFighter(){
    const ids=unlockedIndexes();if(!ids.includes(raid.fighter))raid.fighter=ids[0]??0;
    const f=fighter();raid.hp=f.hp;raid.startedAt=Date.now();raid.extensionUsed=false;raid.active=true;render();
  }
  function onTap(e){
    e.preventDefault();e.stopPropagation();
    if(!raid.active)return;
    const f=fighter(),s=state();if(!s)return;
    const dmg=damageValue();raid.hp=Math.max(0,raid.hp-dmg);
    const el=$('raid-fighter');if(el){el.classList.remove(f.id+'-hit');void el.offsetWidth;el.classList.add(f.id+'-hit')}
    const d=$('raid-damage');if(d){d.textContent='-'+dmg;d.classList.remove('show');void d.offsetWidth;d.classList.add('show')}
    const fill=$('raid-hp-fill'),txt=$('raid-hp-text');if(fill)fill.style.width=(raid.hp/f.hp*100)+'%';if(txt)txt.textContent=raid.hp+' / '+f.hp;
    if(f.id==='vtirach'&&Math.random()<.08)showRaidNote('Ты втираешь мне какую-то дичь!');
    if(f.id==='mongol'&&Math.random()<.07)showRaidNote('Роднулькины мои');
    if(raid.hp<=0)win();
  }
  function showRaidNote(t){const n=document.querySelector('.raid-note');if(n){n.textContent=t;clearTimeout(n._t);n._t=setTimeout(()=>n.textContent='Тапай по бойцу · урон = текущая сила',1400)}}
  function win(){
    const f=fighter(),s=state();raid.active=false;
    const key='raid_'+f.id+'_wins',first=!s[key];s[key]=true;
    const reward=first?f.first:f.repeat;s.chifir+=reward.chifir;s.points+=reward.points;
    s.tasks.earned=(Number(s.tasks.earned)||0)+reward.chifir;
    window.saveGame?.();window.ui?.();
    const rt=$('raid-result-title'),rx=$('raid-result-text'),rr=$('raid-result');
    if(rt)rt.textContent='🏆 '+f.name+' побеждён!';
    if(rx)rx.innerHTML='Награда: <b>+'+reward.chifir+' 🍵</b> · <b>+'+reward.points+' ⭐</b>'+(first?' · первая победа':' · повторная победа');
    if(rr)rr.classList.add('show');
  }
  function updateTimer(){
    if(!raid.active)return;
    const left=90*60*1000-(Date.now()-raid.startedAt);
    const t=$('raid-timer');if(t)t.textContent=formatTime(left);
    if(left<=0){raid.active=false;showRaidTimeout();return}
    requestAnimationFrame(updateTimer);
  }
  function showRaidTimeout(){
    const rr=$('raid-result'),rt=$('raid-result-title'),rx=$('raid-result-text');
    if(!rr)return;
    if(rt)rt.textContent='⏱️ Время рейда вышло';
    if(rx)rx.innerHTML='Текущий прогресс бойца сохранён в этом рейде. Продление на 15 минут доступно за просмотр рекламы.';
    rr.classList.add('show');
    const card=rr.querySelector('.raid-result-card');
    if(card&&!$('raid-extend')){const b=document.createElement('button');b.id='raid-extend';b.className='raid-close';b.textContent='Продлить на 15 минут';b.addEventListener('click',extendRaid);card.insertBefore(b,$('raid-close'))}
  }
  function extendRaid(){
    if(raid.extensionUsed)return;
    if(typeof window.showRewardedAd!=='function'){showRaidNote('Реклама пока недоступна');return}
    window.showRewardedAd(ok=>{
      if(!ok){showRaidNote('Награда за рекламу не получена');return}
      raid.extensionUsed=true;raid.startedAt=Date.now();raid.active=true;
      const rr=$('raid-result');if(rr)rr.classList.remove('show');
      updateTimer();
    });
  }
  function openRaid(){
    if(window.openModal){
      window.openModal('<div class="raid-window"><div id="raid-scene" class="raid-scene talk"></div></div>');
      startFighter();
    }
  }
  window.openRaid=openRaid;
  ensureRaidButton();
})();
