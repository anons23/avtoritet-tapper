/* АВТОРИТЕТ 2.0 — core v4.82 (menus + barrack) */
'use strict';
const TEST_MODE = true;
const TEST_POINTS_PER_TAP = 500;
const N = ['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник'];
const R = [['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',50000]];
const O = [['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,50000]];
const FUN = ['Надзиратель идёт... сделай умный вид.','Сегодня без шмона. Чудо.','Шайба в кармане греет душу.','В столовой сегодня мясо. Или что-то похожее.','Кто-то опять забрал папиросы. Классика.','Сегодня раздача посылок. Надежда умирает последней.'];
const EVENTS=[
  ['Шмон!','Надзиратели ворвались в камеру. Что делаешь?',[['Спрятать папиросы',.55,40,15,2],['Стоять спокойно',0,10,5,1],['Сделать вид, что спишь',.25,5,8,1]],0],
  ['Малява','Тебе передали маляву. Что в ней?',[['Прочитать сразу',.4,30,20,2],['Спрятать до завтра',.15,15,10,1],['Выбросить',0,0,3,0]],0],
  ['Посылка','Пришла посылка, но непонятно чья.',[['Забрать себе',.6,60,10,-1],['Отдать смотрящему',0,0,20,3],['Оставить',.1,0,5,0]],0],
  ['Тихий разговор','Сосед по камере просит помочь решить мелкий спор.',[['Выслушать обе стороны',.65,35,18,3],['Не вмешиваться',.35,10,5,0],['Сразу поддержать знакомого',.2,20,2,-2]],1],
  ['Проверка камеры','Кто-то ищет пропавшую вещь.',[['Помочь проверить',.7,45,22,3],['Спрятать свою вещь',.45,65,8,0],['Сделать вид, что не слышал',.2,0,4,-1]],1],
  ['Слух','По бараку пошёл слух о твоём деле.',[['Проверить источник',.65,20,28,4],['Не обращать внимания',.5,5,12,1],['Спорить со всеми',.25,40,0,-4]],2],
  ['Шайба','Шайба предлагает «выгодный обмен».',[['Согласиться',.45,50,20,1],['Торговаться',.3,20,10,2],['Отказаться',0,0,0,0]],1],
  ['Карцерный слух','Ходят слухи, что тебя хотят закрыть.',[['Залечь на дно',.4,10,5,0],['Дать отпор',.35,30,25,3],['Игнорировать',.2,0,0,0]],2]
];
const TASKS = {
  taps10000:{title:'Первые 10 000 тапов',desc:'Сделай 10 000 обычных тапов.',target:10000,rewardAmount:500,rewardType:'chifir',reward:'500 🍵',get:()=>s.tasks.taps},
  bugor10:{title:'Десять тренировок',desc:'Успешно пройди 10 тренировок с Бугром.',target:10,rewardAmount:750,rewardType:'chifir',reward:'750 🍵',get:()=>s.tasks.bugorSuccess||0},
  crit100:{title:'Точный удар',desc:'Сделай 100 критических тапов.',target:100,rewardAmount:1000,rewardType:'chifir',reward:'1000 🍵',get:()=>s.tasks.crit},
  earned100k:{title:'Запас на чёрный день',desc:'Заработай 100 000 🍵 тапами и делами.',target:100000,rewardAmount:5000,rewardType:'chifir',reward:'5000 🍵',get:()=>Math.floor(s.tasks.earned||0)},
  tasks25:{title:'Опытный порученец',desc:'Успешно выполни 25 поручений.',target:25,rewardAmount:1500,rewardType:'points',reward:'1500 ⭐',get:()=>s.tasks.npcSuccess||0}
};

let activeEvent=false;
let s = {
  chifir:0, points:0, energy:250, maxEnergy:250, power:1, critChance:0.05,
  respect:0, wealth:0, nickname:'', currentObject:0, prestige:0,
  upgrades:{power:0, crit:0, energyMax:0}, boosters:{double:0},
  tasks:{taps:0, crit:0, events:0, earned:0, jail:0, bugorSuccess:0, npcSuccess:0},
  completed:{}, achievements:{}, lastEnergyTime:Date.now(),
  saveUpdatedAt:Date.now(), lastChoiceEvent:0, totalTaps:0,
  jailed:false, jailTaps:0, jailRequired:500, confiscatedChifir:0, jailProtection:0,
  authorityTaps:0, sentenceDays:100, servedSentenceMinutes:0, lastSentenceTick:Date.now()
};

const $ = id => document.getElementById(id);
function fmt(n){ return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
function rank(){ let r=R[0]; for(const x of R) if(s.points>=x[1]) r=x; return r; }
function highestUnlocked(){ let i=0; for(let k=0;k<O.length;k++) if(s.points>=O[k][3]) i=k; return i; }

function msg(t){
  const el = $('event-message');
  if(!el) return;
  el.textContent = t;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2200);
}

function restoreEnergy(now){
  now = Number(now)||Date.now();
  if(s.energy >= s.maxEnergy){ s.lastEnergyTime = now; return; }
  const gain = Math.floor(Math.max(0, now - s.lastEnergyTime) / 30000);
  if(gain > 0){
    s.energy = Math.min(s.maxEnergy, s.energy + gain);
    s.lastEnergyTime += gain * 30000;
  }
}

function ui(){
  try{
    if($('chifir')) $('chifir').textContent = fmt(s.chifir);
    if($('points')) $('points').textContent = fmt(s.points);
    if($('energy')) $('energy').textContent = fmt(s.energy);
    if($('max-energy')) $('max-energy').textContent = fmt(s.maxEnergy);
    if($('nickname')) $('nickname').textContent = s.nickname || 'Салага';
    if($('rank')) $('rank').textContent = rank()[0];
    if($('power-stat')) $('power-stat').textContent = fmt(s.power);
    if($('respect-stat')) $('respect-stat').textContent = fmt(s.respect);
    if($('wealth-stat')) $('wealth-stat').textContent = fmt(s.wealth);
    const o = O[s.currentObject] || O[0];
    if($('object-name')) $('object-name').textContent = s.jailed ? 'Карцер' : o[0];
    if($('object-action')) $('object-action').textContent = s.jailed ? 'ТАПАЙ ДЛЯ ВЫХОДА' : (s.currentObject===4 ? 'РАЗОБРАТЬ ДЕЛО' : 'ТАПАЙ!');
    if($('sentence-left')) $('sentence-left').textContent = Math.max(0, Math.ceil(s.sentenceDays - s.servedSentenceMinutes/1440)) + ' дней';
    const t = $('tap-object');
    if(t){ t.classList.remove('preload-hidden'); t.style.visibility = 'visible'; t.style.opacity = '1'; }
    const g = $('game-container');
    if(g){ g.classList.remove('game-booting'); g.classList.toggle('jail-mode', !!s.jailed); }
    const pre = $('preloader');
    if(pre){ pre.style.display = 'none'; pre.remove(); }
    if(typeof window.__finishPreloader === 'function') try{ window.__finishPreloader(); }catch(e){}
    if(typeof window.refreshObjectVisuals === 'function') try{ window.refreshObjectVisuals(); }catch(e){}
    const jp = $('jail-panel');
    if(jp){
      jp.classList.toggle('hidden', !s.jailed);
      if(s.jailed){
        if($('jail-count')) $('jail-count').textContent = Math.min(s.jailTaps,s.jailRequired)+' / '+s.jailRequired;
        if($('jail-left')) $('jail-left').textContent = Math.max(0,s.jailRequired-s.jailTaps);
      }
    }
    try{
      const nextRank = R.find(x => x[1] > s.points);
      const curIdx = (()=>{ let i=0; for(let k=0;k<R.length;k++) if(s.points>=R[k][1]) i=k; return i; })();
      const from = R[curIdx] ? R[curIdx][1] : 0;
      const to = nextRank ? nextRank[1] : (R[R.length-1][1] || from);
      const span = Math.max(1, to - from);
      const progressed = Math.max(0, Math.min(span, s.points - from));
      const pct = nextRank ? Math.min(100, (progressed / span) * 100) : 100;
      const label = $('rank-goal-label');
      const value = $('rank-goal-value');
      const fill = $('rank-goal-fill');
      if(label) label.textContent = nextRank ? ('До масти «'+nextRank[0]+'»') : 'Максимальная масть';
      if(value) value.textContent = nextRank ? (fmt(s.points)+' / '+fmt(to)+' ⭐') : (fmt(s.points)+' ⭐');
      if(fill) fill.style.width = pct + '%';
    }catch(e){}
    ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(id=>{
      const b=$(id); if(b) b.disabled=!!s.jailed;
    });
  }catch(e){ console.warn('[ui]', e); }
}

function feedback(e, g, c){
  let f = $('tap-feedback');
  if(!f){
    f = document.createElement('div');
    f.id = 'tap-feedback';
    f.setAttribute('aria-hidden','true');
    document.body.appendChild(f);
  }
  const x = (e && (e.clientX||(e.touches&&e.touches[0]&&e.touches[0].clientX))) || (window.innerWidth/2);
  const y = (e && (e.clientY||(e.touches&&e.touches[0]&&e.touches[0].clientY))) || (window.innerHeight/2);
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  f.textContent = (c ? '⚡ ' : '') + '+' + Math.floor(g);
  f.classList.remove('show');
  void f.offsetWidth;
  f.classList.add('show');
  clearTimeout(f._hideT);
  f._hideT = setTimeout(()=>f.classList.remove('show'), 700);
}

function saveNow(){
  try{
    s.saveUpdatedAt = Date.now();
    localStorage.setItem('avtoritet_save_v2', JSON.stringify(s));
  }catch(e){}
}

function load(){
  try{
    const raw = localStorage.getItem('avtoritet_save_v2');
    if(raw){
      const d = JSON.parse(raw);
      if(d && typeof d === 'object'){
        Object.assign(s, d);
        s.upgrades = Object.assign({power:0,crit:0,energyMax:0}, d.upgrades||{});
        s.boosters = Object.assign({double:0}, d.boosters||{});
        s.tasks = Object.assign({taps:0,crit:0,events:0,earned:0,jail:0,bugorSuccess:0,npcSuccess:0}, d.tasks||{});
        s.completed = d.completed || {};
      }
    }
  }catch(e){}
  if(!s.nickname) s.nickname = N[Math.floor(Math.random()*N.length)];
  s.currentObject = highestUnlocked();
  if(!Number.isFinite(s.energy)) s.energy = 250;
  if(!Number.isFinite(s.maxEnergy)) s.maxEnergy = 250;
}

function openModal(h,locked){
  const c = $('modal-content'), o = $('modal-overlay');
  if(!c || !o) return;
  c.innerHTML = h;
  o.classList.remove('hidden');
  o.classList.add('show');
  o.dataset.locked = locked ? '1' : '0';
  const m = $('modal');
  if(m) m.classList.toggle('locked', !!locked);
}

function closeModal(){
  const o = $('modal-overlay');
  if(!o) return;
  if(o.dataset.locked==='1' && activeEvent) return;
  activeEvent=false;
  o.dataset.locked='0';
  o.classList.remove('raid-fullscreen','raid-selection-fullscreen','show');
  o.classList.add('hidden');
}

function tasksCheck(){
  if(!s.tasks) return;
  let changed = false;
  Object.entries(TASKS).forEach(([id,t])=>{
    if(!s.completed[id] && t.get() >= t.target){
      s.completed[id] = {completedAt:Date.now()};
      if(t.rewardType==='points') s.points += t.rewardAmount;
      else s.chifir += t.rewardAmount;
      msg('🎯 Поручение выполнено: '+t.title+' · награда '+t.reward);
      changed = true;
    }
  });
  if(changed){ saveNow(); ui(); }
}

function choiceResult(x,ok){
  const e=$('choice-result');
  if(!e)return;
  e.textContent=String(x);
  e.classList.remove('show','success','fail');
  e.classList.add(ok?'success':'fail');
  void e.offsetWidth;
  e.classList.add('show');
  clearTimeout(choiceResult.timer);
  choiceResult.timer=setTimeout(()=>e.classList.remove('show'),2600);
}
function finishEvent(){
  activeEvent=false;
  const o=$('modal-overlay');
  if(o) o.dataset.locked='0';
  closeModal();
  tasksCheck();
  ui();
  saveNow();
}
function addSentence(days,reason){
  days=Math.max(0,Math.floor(Number(days)||0));
  if(!days)return;
  const current=Number(s.sentenceDays||0);
  const baseDays=current<=0?100:current;
  s.sentenceDays=baseDays+days;
  if(current<=0)s.servedSentenceMinutes=0;
  s.lastSentenceTick=Date.now();
  if(reason) msg('⛓️ Срок +'+days+' дн. · '+reason);
}
function enterJail(reason){
  if(s.jailed)return;
  addSentence(3,'карцер');
  s.jailed=true;
  s.jailRequired=500;
  s.jailTaps=0;
  const rate=.20+Math.random()*.05;
  s.confiscatedChifir=Math.min(Math.max(0,Math.floor(s.chifir)),Math.floor(Math.max(0,s.chifir)*rate));
  s.chifir=Math.max(0,s.chifir-s.confiscatedChifir);
  s.jailProtection=0;
  activeEvent=false;
  const o=$('modal-overlay');
  if(o){o.dataset.locked='0';o.classList.add('hidden');o.classList.remove('show')}
  msg('🚨 Карцер. Изъято '+fmt(s.confiscatedChifir)+' 🍵. Отсидеть: 500 тапов.');
  if(reason) msg(reason);
  ui();
  saveNow();
}
function openEvent(){
  if(s.jailed||activeEvent)return;
  const stage=Math.max(0,Number(s.currentObject)||0);
  const available=EVENTS.filter(e=>stage>=Number(e[3]||0));
  if(!available.length)return;
  activeEvent=true;
  const v=available[Math.floor(Math.random()*available.length)];
  let h='<div class="section-window event-window"><div class="section-kicker">СОБЫТИЕ</div><h2>⚠️ '+v[0]+'</h2><p>'+v[1]+'</p><p><b>Решай быстро:</b></p><div class="choices">';
  v[2].forEach((c,i)=>{ h+='<button type="button" class="choice" data-i="'+i+'">'+c[0]+'</button>'; });
  h+='</div></div>';
  openModal(h,true);
  document.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    if(!activeEvent||s.jailed)return;
    const c=v[2][Number(b.dataset.i)];
    s.tasks.events=(s.tasks.events||0)+1;
    s.lastChoiceEvent=s.points;
    if(Math.random()<c[1]){
      s.chifir+=c[2];
      s.tasks.earned=(s.tasks.earned||0)+c[2];
      s.points+=c[3];
      s.respect=Math.max(0,(s.respect||0)+Number(c[4]||0));
      const bonus=c[4]?(' · уважение '+(c[4]>0?'+':'')+c[4]):'';
      choiceResult('Удачно! +'+c[2]+' 🍵 +'+c[3]+' ⭐'+bonus,true);
      finishEvent();
    }else{
      const loss=Math.max(3,Math.ceil(Math.max(1,c[3])*1.5));
      addSentence(c[1]>=.6?2:1,'провал события');
      s.points=Math.max(0,s.points-loss);
      if(c[1]>0&&(s.jailProtection||0)<=0&&Math.random()<.08){
        finishEvent();
        enterJail('❌ Рискованный ход провалился.');
      }else{
        choiceResult('Не повезло. Последствия уже чувствуются.',false);
        finishEvent();
      }
    }
  }));
}

function shop(){
  if(s.jailed){ msg('🔒 Качалка закрыта до выхода из карцера'); return; }
  const costP = 100 + s.upgrades.power * 250;
  const costC = 300 + s.upgrades.crit * 500;
  const costE = 400 + s.upgrades.energyMax * 700;
  openModal(
    '<div class="section-window shop-window">'+
    '<div class="section-kicker">ПРОКАЧКА</div>'+
    '<h2>💪 Качалка</h2>'+
    '<p class="section-subtitle">Трать чефир на постоянные улучшения.</p>'+
    '<div class="shop-grid">'+
    '<button type="button" data-b="p">💪 <b>Сила</b><br><small>+1 сила · сейчас '+s.power+'</small><br>Цена '+costP+' 🍵</button>'+
    '<button type="button" data-b="c">🎯 <b>Крит</b><br><small>+2% · сейчас '+Math.round(s.critChance*100)+'%</small><br>Цена '+costC+' 🍵</button>'+
    '<button type="button" data-b="e">⚡ <b>Энергия</b><br><small>+25 макс · сейчас '+s.maxEnergy+'</small><br>Цена '+costE+' 🍵</button>'+
    '<button type="button" data-b="d">🔥 <b>Ускоритель</b><br><small>×2 на 100 тапов · '+(s.boosters.double||0)+'</small><br>Цена 500 🍵</button>'+
    '</div>'+
    '<button type="button" id="shop-eq-btn" class="eq-btn shop-eq-link" style="width:100%;margin:12px 0 0;padding:12px;font-size:14px">⚔️ Оружие и броня</button>'+
    '</div>'
  );
  document.querySelectorAll('[data-b]').forEach(b=>{
    b.style.pointerEvents = 'auto';
    b.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); buy(b); });
  });
  var eqBtn=document.getElementById('shop-eq-btn');
  if(eqBtn){
    eqBtn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if(typeof window.openEquipment==='function') window.openEquipment();
      else if(typeof window.msg==='function') window.msg('⚔️ Снаряжение ещё загружается…');
    });
  }
  function buy(b){
    const type = b.dataset.b;
    const cost = type==='p' ? costP : type==='c' ? costC : type==='e' ? costE : 500;
    if(s.chifir < cost){ msg('🍵 Не хватает чефира. Нужно '+fmt(cost)+'.'); return; }
    s.chifir -= cost;
    if(type==='p'){ s.power++; s.upgrades.power++; msg('💪 Сила теперь '+s.power); }
    if(type==='c'){ s.critChance = Math.min(0.5, s.critChance+0.02); s.upgrades.crit++; msg('🎯 Крит '+Math.round(s.critChance*100)+'%'); }
    if(type==='e'){ s.maxEnergy += 25; s.energy = s.maxEnergy; s.upgrades.energyMax++; s.lastEnergyTime = Date.now(); msg('⚡ Макс. энергия '+s.maxEnergy); }
    if(type==='d'){ s.boosters.double = (s.boosters.double||0)+100; msg('🔥 Ускоритель +100 тапов'); }
    ui(); saveNow(); shop();
  }
}

function rankMenu(){
  const r = rank(), next = R.find(x => x[1] > s.points);
  const stage = O[s.currentObject] ? O[s.currentObject][0] : 'Груша';
  const curIdx = (()=>{ let i=0; for(let k=0;k<R.length;k++) if(s.points>=R[k][1]) i=k; return i; })();
  let ladder = '';
  R.forEach(function(row, j){
    const unlocked = j <= curIdx;
    const mark = unlocked ? '✓ ' : '🔒 ';
    ladder += '<div class="rank-ladder-row" style="padding:9px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.12);margin:0 0 7px;opacity:'+(unlocked?'1':'.48')+'"><b>'+mark+row[0]+'</b><br><small>от '+fmt(row[1])+' ⭐</small></div>';
  });
  openModal(
    '<div class="section-window">'+
    '<div class="section-kicker">ПРОГРЕСС</div>'+
    '<h2>🏆 Масть</h2>'+
    '<p>Твоя масть: <b>'+r[0]+'</b> · этап: <b>'+stage+'</b></p>'+
    (next ? '<p>До «'+next[0]+'»: <b>'+fmt(Math.max(0,next[1]-s.points))+'</b> ⭐</p>' : '<p>Максимальная масть.</p>')+
    '<div style="margin-top:10px">'+ladder+'</div>'+
    '</div>'
  );
}

function tasksMenu(){
  if(s.jailed) return;
  const cards = Object.entries(TASKS).map(([id,t])=>{
    const cur = Math.min(t.target, Math.floor(t.get()));
    const done = !!s.completed[id];
    const pct = Math.min(100, cur / t.target * 100);
    return '<div class="task-card '+(done?'task-done':'')+'"><div class="task-icon">'+(done?'✓':'🎯')+'</div><div class="task-body"><b>'+t.title+'</b><p>'+t.desc+'</p><div class="task-progress"><span style="width:'+pct+'%"></span></div><small>'+fmt(cur)+' / '+fmt(t.target)+' · Награда: <strong>'+t.reward+'</strong></small></div></div>';
  }).join('');
  openModal('<div class="section-window tasks-window"><div class="section-kicker">ЦЕЛИ НА СЕЙЧАС</div><h2>🎯 Поручения</h2><p class="section-subtitle">Выполняй простые цели и забирай награды. Каждое поручение даёт приз.</p><div class="tasks-list">'+cards+'</div><div class="tasks-footer">Выполнено поручений: <b>'+Object.keys(s.completed).length+'</b></div></div>');
}

function more(){
  if(typeof window.renderBarrack === 'function'){ window.renderBarrack(); return; }
  openModal('<div class="section-window"><div class="section-kicker">ТВОЁ МЕСТО</div><h2>☰ Барак</h2><p class="section-subtitle">Персонажи барака загружаются…</p></div>');
}

function tap(e){
  if(e && e.preventDefault) e.preventDefault();
  if(activeEvent)return;
  if(s.jailed){
    s.jailTaps++;
    const t = $('tap-object');
    if(t){ t.classList.remove('punch','crit'); void t.offsetWidth; t.classList.add('punch'); clearTimeout(t._punchT); t._punchT=setTimeout(function(){ t.classList.remove('punch','crit'); },280); }
    try{ if(window.GameSFX && typeof window.GameSFX.punch==='function') window.GameSFX.punch(false); }catch(e){}
    if(typeof window.animateObjectVisual === 'function') window.animateObjectVisual();
    feedback(e, 1, false);
    if(s.jailTaps >= s.jailRequired){ s.jailed = false; s.tasks.jail = (s.tasks.jail||0)+1; msg('🔓 Вышел из карцера'); }
    ui(); saveNow(); return;
  }
  restoreEnergy(Date.now());
  if(s.energy < 1){ msg('⚡ Нет энергии'); return; }
  s.energy--;
  s.totalTaps++;
  s.tasks.taps++;
  let g = TEST_MODE ? TEST_POINTS_PER_TAP : s.power * O[s.currentObject][2];
  const c = Math.random() < s.critChance;
  if(c){ s.tasks.crit++; if(!TEST_MODE) g *= 2; }
  if(s.boosters.double > 0 && !TEST_MODE){ g *= 2; s.boosters.double--; }
  s.chifir += g;
  s.points += g;
  s.tasks.earned = (s.tasks.earned||0) + g;
  const old = s.currentObject;
  s.currentObject = highestUnlocked();
  if(old !== s.currentObject) msg('🏆 Новая масть: '+R[s.currentObject][0]+' · этап: '+O[s.currentObject][0]);
  const t = $('tap-object');
  if(t){ t.classList.remove('punch','crit'); void t.offsetWidth; t.classList.add('punch'); if(c) t.classList.add('crit'); clearTimeout(t._punchT); t._punchT=setTimeout(function(){ t.classList.remove('punch','crit'); },280); }
  try{ if(window.GameSFX && typeof window.GameSFX.punch==='function') window.GameSFX.punch(!!c); }catch(e){}
  if(typeof window.animateObjectVisual === 'function') window.animateObjectVisual();
  if(typeof window.refreshObjectVisuals === 'function') window.refreshObjectVisuals();
  feedback(e, g, c);
  if(Math.random() < 0.03) msg(FUN[Math.floor(Math.random()*FUN.length)]);
  if(Math.random() < 0.10 && s.points - (s.lastChoiceEvent||0) > 30) openEvent();
  tasksCheck();
  try{ if(typeof window.__maybePreloadNextStage==='function') window.__maybePreloadNextStage(s.points, TEST_MODE ? TEST_POINTS_PER_TAP : Math.max(1, s.power)); }catch(e){}
  ui();
  saveNow();
}

function bind(){
  load();
  ui();
  try{ if(typeof window.__finishPreloader === 'function') window.__finishPreloader(); }catch(e){}
  const pre = document.getElementById('preloader');
  if(pre){ pre.style.display='none'; pre.remove(); }
  document.body.classList.remove('game-booting');
  const gc = document.getElementById('game-container');
  if(gc) gc.classList.remove('game-booting');

  const area = $('tap-area') || $('tap-object');
  let last = 0;
  const handler = e => {
    const n = Date.now();
    if(n - last < 80) return;
    last = n;
    if(e.cancelable) e.preventDefault();
    tap(e);
  };
  if(area){
    area.addEventListener('pointerdown', handler, {capture:true, passive:false});
  }
  $('btn-shop')?.addEventListener('click', shop);
  $('btn-rank')?.addEventListener('click', rankMenu);
  $('btn-tasks')?.addEventListener('click', tasksMenu);
  $('btn-more')?.addEventListener('click', more);
  $('modal-close')?.addEventListener('click', closeModal);

  setInterval(()=>{ restoreEnergy(Date.now()); ui(); }, 1000);
  setInterval(saveNow, 15000);
  window.addEventListener('pagehide', saveNow);

  window.getGameState = () => s;
  window.saveGame = saveNow;
  window.ui = ui;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.checkTasks = tasksCheck;
  window.TEST_MODE = TEST_MODE;
  window.TEST_POINTS_PER_TAP = TEST_POINTS_PER_TAP;
  window.spendEnergyForRaid = function(){
    if(s.energy < 1) return false;
    s.energy--;
    ui();
    return true;
  };

  console.log('[game] v4.86 OK TEST_MODE=', TEST_MODE, 'pts/tap=', TEST_POINTS_PER_TAP);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
else bind();
