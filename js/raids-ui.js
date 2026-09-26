/* RAID SYSTEM — selection screen, persistent fighter progress, energy and unique reactions */
'use strict';
(()=>{
  const RAID_FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,first:{chifir:2000,points:150},repeat:{chifir:500,points:40},scene:'talk'},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,first:{chifir:2500,points:200},repeat:{chifir:625,points:50},scene:'talk'},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,first:{chifir:4000,points:300},repeat:{chifir:1000,points:75},scene:'fight'},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,first:{chifir:5500,points:400},repeat:{chifir:1375,points:100},scene:'fight'}
  ];
  const $=id=>document.getElementById(id);
  const state=()=>window.getGameState?.();
  let raid={fighter:0,active:false};
  function s(){return state()}
  function progress(){
    const g=s(); if(!g)return {};
    if(!g.raidProgress||typeof g.raidProgress!=='object')g.raidProgress={};
    return g.raidProgress;
  }
  function unlocked(f){return (Number(s()?.points)||0)>=f.rank*500}
  function pFor(f){
    const p=progress();
    if(!p[f.id])p[f.id]={hp:f.hp,startedAt:0,extensionUsed:false,wins:0};
    if(!Number.isFinite(p[f.id].hp)||p[f.id].hp<0)p[f.id].hp=f.hp;
    return p[f.id];
  }
  function formatTime(ms){const sec=Math.max(0,Math.ceil(ms/1000));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
  function remaining(f){
    const p=pFor(f);
    if(!p.startedAt||p.hp<=0)return 0;
    return Math.max(0,90*60*1000-(Date.now()-p.startedAt));
  }
  function save(){window.saveGame?.();window.ui?.()}
  function ensureRaidButton(){
    if($('raid-open-button'))return;
    const b=document.createElement('button');
    b.id='raid-open-button';b.type='button';b.title='Рейд';b.setAttribute('aria-label','Открыть рейд');
    b.innerHTML='<img src="./assets/raids/ui/raid-button.png" alt="Рейд">';
    b.addEventListener('click',openRaidMenu);
    const host=$('game-container');
    (host||document.body).appendChild(b);
  }
  function menuCard(f){
    const open=unlocked(f),p=pFor(f),time=remaining(f),started=!!p.startedAt&&p.hp>0;
    const status=!open?'🔒 Закрыто по масти':(!started?'Не начат':(time>0?'⏱ '+formatTime(time):'⏱ Время вышло'));
    return '<button type="button" class="raid-fighter-card '+(open?'':'locked')+'" data-raid-fighter="'+f.id+'" '+(open?'':'disabled')+'>'+
      '<span class="raid-card-portrait"><img src="./assets/raids/fighters/'+f.id+'.png" alt=""></span>'+
      '<span class="raid-card-info"><b class="raid-card-name '+f.id+'">'+f.name+'</b><small>'+status+'</small>'+
      (open&&started?'<small>HP: '+Math.max(0,p.hp)+' / '+f.hp+'</small>':'')+
      '</span></button>';
  }
  function openRaidMenu(){
    if(!window.openModal)return;
    $('modal-overlay')?.classList.remove('raid-fullscreen');
    window.openModal('<div class="raid-select-screen"><div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙД</h2><p>Выбери противника. У каждого бойца свой бой и свой прогресс.</p></div><button type="button" id="raid-menu-close" class="raid-menu-close">✕</button></div><div class="raid-fighter-list">'+RAID_FIGHTERS.map(menuCard).join('')+'</div></div></div>');
    $('modal-overlay')?.classList.add('raid-selection-fullscreen');
    $('raid-menu-close')?.addEventListener('click',()=>window.closeModal?.());
    document.querySelectorAll('[data-raid-fighter]').forEach(b=>b.addEventListener('click',()=>openBattle(b.dataset.raidFighter)));
  }
  function openBattle(id){
    const idx=RAID_FIGHTERS.findIndex(f=>f.id===id);if(idx<0)return;
    const f=RAID_FIGHTERS[idx];if(!unlocked(f))return;
    raid.fighter=idx;
    const p=pFor(f);
    if(p.hp<=0){p.hp=f.hp;p.startedAt=0;p.extensionUsed=false;}
    if(!p.startedAt)p.startedAt=Date.now();
    save();
    renderBattle();
  }
  function fighter(){return RAID_FIGHTERS[raid.fighter]}
  function renderBattle(){
    const f=fighter(),p=pFor(f),pct=Math.max(0,p.hp/f.hp*100);
    window.openModal?.('<div class="raid-window"><div id="raid-scene" class="raid-scene '+f.scene+'"></div></div>');
    $('modal-overlay')?.classList.add('raid-fullscreen');
    const root=$('raid-scene');if(!root)return;
    root.innerHTML=
      '<div class="raid-hud"><div class="raid-title">⚔️ РЕЙД · '+f.name+'</div><div id="raid-timer" class="raid-timer">'+formatTime(remaining(f))+'</div></div>'+
      '<div class="raid-fighter '+f.id+'" id="raid-fighter"><div class="raid-name '+f.id+'">'+f.name+'</div>'+
      '<div class="raid-hp"><div class="raid-hp-track"><div id="raid-hp-fill" class="raid-hp-fill" style="width:'+pct+'%"></div></div><div id="raid-hp-text" class="raid-hp-text">'+Math.max(0,p.hp)+' / '+f.hp+'</div></div>'+
      '<img src="./assets/raids/fighters/'+f.id+'.png" alt="'+f.name+'"></div>'+
      '<div id="raid-damage" class="raid-damage"></div>'+
      '<div id="raid-note" class="raid-note">⚡ Тапай по бойцу · расходуется энергия</div>'+
      '<div class="raid-controls"><button type="button" id="raid-back" class="raid-next">← К бойцам</button></div>'+
      '<div id="raid-result" class="raid-result"><div class="raid-result-card"><h2 id="raid-result-title"></h2><div id="raid-result-text"></div><button type="button" id="raid-close" class="raid-close">Закрыть</button></div></div>';
    $('raid-back').addEventListener('click',()=>{ $('modal-overlay')?.classList.remove('raid-fullscreen'); openRaidMenu(); });
    $('raid-close').addEventListener('click',()=>window.closeModal?.());
    $('raid-fighter').addEventListener('pointerdown',onTap,{passive:false});
    updateTimer();
  }
  function damageValue(){return Math.max(1,Math.floor(Number(s()?.power)||1))}
  function onTap(e){
    e.preventDefault();e.stopPropagation();
    const f=fighter(),g=s(),p=pFor(f);if(!g||!raid.active&&false)return;
    if(!window.spendEnergyForRaid?.()){showRaidNote('⚡ Энергия закончилась');return}
    if(p.hp<=0)return;
    const dmg=Math.min(damageValue(),p.hp);p.hp-=dmg;
    const el=$('raid-fighter');
    if(el){el.classList.remove(f.id+'-hit');void el.offsetWidth;el.classList.add(f.id+'-hit')}
    const d=$('raid-damage');
    if(d){d.textContent='-'+dmg;d.classList.remove('show');void d.offsetWidth;d.classList.add('show')}
    const fill=$('raid-hp-fill'),txt=$('raid-hp-text');
    if(fill)fill.style.width=(p.hp/f.hp*100)+'%';
    if(txt)txt.textContent=p.hp+' / '+f.hp;
    save();
    showFighterShout(f.id);
    if(p.hp<=0)win();
  }
  const FIGHTER_SHOUTS={
    petrovich:[
      'Котлетки потом!','Ща, брат, договорим!','Ты чего творишь?!','Давай без кипиша!','Я вообще-то занят!','Котлетки остывают!','Ну ты даёшь!','Погоди, братан!','Эй, полегче!','Не мешай котлетки делать!','Всё, хватит!','Я сейчас отвечу!'
    ],
    vtirach:[
      'Ты втираешь мне какую-то дичь!','Ты это серьёзно сейчас?!','Что ты мне рассказываешь?','Не гони пургу!','Ты меня за кого держишь?!','Какая ещё дичь?!','Слышь, объясни нормально!','Вот это поворот!','Ты вообще о чём?!','Не втирай мне тут!','Я всё слышал!','Ну и что это было?!'
    ],
    mafioznik:[
      'Ну всё, братва!','Спокойно, пацаны!','Ты нарываешься!','Разговор короткий!','Эй, полегче!','Так не пойдёт!','Давай по-хорошему!','Брат, остановись!','Ты чего начинаешь?!','Ща разберёмся!','Без лишних движений!','Всё, разговор окончен!'
    ],
    mongol:[
      'Роднулькины мои!','Ой, всё!','Ну здравствуй!','Ты чё, родной?!','Ай, больно же!','Спокойно, спокойно!','Давай без этого!','Ну ты даёшь!','Эх, братцы!','Не трогай меня!','Вот это ты разошёлся!','Ладно, договорились!'
    ]
  };
  function showFighterShout(id){
    if(Math.random()>0.20)return;
    const root=$('raid-fighter');if(!root)return;
    const list=FIGHTER_SHOUTS[id]||[];if(!list.length)return;
    let b=root.querySelector('.raid-shout');
    if(!b){b=document.createElement('div');b.className='raid-shout';root.appendChild(b)}
    b.className='raid-shout '+id;
    b.textContent=list[Math.floor(Math.random()*list.length)];
    b.classList.remove('show');void b.offsetWidth;b.classList.add('show');
    clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('show'),1250);
  }
  function showRaidNote(t){const n=$('raid-note');if(n){n.textContent=t;clearTimeout(n._t);n._t=setTimeout(()=>n.textContent='⚡ Тапай по бойцу · расходуется энергия',1400)}}
  function win(){
    const f=fighter(),g=s(),p=pFor(f),first=!(Number(p.wins)||0);
    p.wins=(Number(p.wins)||0)+1;p.hp=0;
    const reward=first?f.first:f.repeat;g.chifir+=reward.chifir;g.tasks.earned=(Number(g.tasks.earned)||0)+reward.chifir;g.points+=reward.points;
    save();
    const rt=$('raid-result-title'),rx=$('raid-result-text'),rr=$('raid-result');
    if(rt)rt.textContent='🏆 '+f.name+' побеждён!';
    if(rx)rx.innerHTML='Награда: <b>+'+reward.chifir+' 🍵</b> · <b>+'+reward.points+' ⭐</b>'+(first?' · первая победа':' · повторная победа');
    if(rr)rr.classList.add('show');
  }
  function updateTimer(){
    const f=fighter(),p=pFor(f);if(!p.startedAt||p.hp<=0)return;
    const left=remaining(f),t=$('raid-timer');if(t)t.textContent=formatTime(left);
    if(left<=0){showRaidTimeout();return}
    requestAnimationFrame(updateTimer);
  }
  function showRaidTimeout(){
    const rr=$('raid-result'),rt=$('raid-result-title'),rx=$('raid-result-text');if(!rr)return;
    if(rt)rt.textContent='⏱️ Время рейда вышло';
    if(rx)rx.innerHTML='HP и прогресс сохранены. Можно продлить этот бой на 15 минут за просмотр рекламы.';
    rr.classList.add('show');
    const card=rr.querySelector('.raid-result-card');
    if(card&&!$('raid-extend')){const b=document.createElement('button');b.id='raid-extend';b.className='raid-close';b.textContent='Продлить на 15 минут';b.addEventListener('click',extendRaid);card.insertBefore(b,$('raid-close'))}
  }
  function extendRaid(){
    const f=fighter(),p=pFor(f);if(p.extensionUsed)return;
    if(typeof window.showRewardedAd!=='function'){showRaidNote('Реклама пока недоступна');return}
    window.showRewardedAd(ok=>{
      if(!ok){showRaidNote('Награда за рекламу не получена');return}
      p.extensionUsed=true;p.startedAt=Date.now();save();
      $('raid-result')?.classList.remove('show');updateTimer();
    });
  }
  window.openRaid=openRaidMenu;
  ensureRaidButton();
  window.addEventListener('load',ensureRaidButton);
})();
