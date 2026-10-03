/* АВТОРИТЕТ 2.0 — core v4.73 (full shop + tasks) */
'use strict';
const TEST_MODE = true;
const TEST_POINTS_PER_TAP = 500;
const N = ['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник'];
const R = [['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',50000]];
const O = [['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,50000]];
const FUN = ['Надзиратель идёт... сделай умный вид.','Сегодня без шмона. Чудо.','Шайба в кармане греет душу.','В столовой сегодня мясо. Или что-то похожее.','Кто-то опять забрал папиросы. Классика.','Сегодня раздача посылок. Надежда умирает последней.'];
const TASKS = {
  taps10000:{title:'Первые 10 000 тапов',desc:'Сделай 10 000 обычных тапов.',target:10000,rewardAmount:500,rewardType:'chifir',reward:'500 🍵',get:()=>s.tasks.taps},
  bugor10:{title:'Десять тренировок',desc:'Успешно пройди 10 тренировок с Бугром.',target:10,rewardAmount:750,rewardType:'chifir',reward:'750 🍵',get:()=>s.tasks.bugorSuccess||0},
  crit100:{title:'Точный удар',desc:'Сделай 100 критических тапов.',target:100,rewardAmount:1000,rewardType:'chifir',reward:'1000 🍵',get:()=>s.tasks.crit},
  earned100k:{title:'Запас на чёрный день',desc:'Заработай 100 000 🍵 тапами и делами.',target:100000,rewardAmount:5000,rewardType:'chifir',reward:'5000 🍵',get:()=>Math.floor(s.tasks.earned||0)},
  tasks25:{title:'Опытный порученец',desc:'Успешно выполни 25 поручений.',target:25,rewardAmount:1500,rewardType:'points',reward:'1500 ⭐',get:()=>s.tasks.npcSuccess||0}
};

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
    ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(id=>{
      const b=$(id); if(b) b.disabled=!!s.jailed;
    });
  }catch(e){ console.warn('[ui]', e); }
}

function feedback(e, g, c){
  const f = $('tap-feedback');
  if(!f) return;
  f.textContent = (c ? '⚡ ' : '') + '+' + Math.floor(g);
  f.classList.add('show');
  setTimeout(()=>f.classList.remove('show'), 600);
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

function openModal(h){
  const c = $('modal-content'), o = $('modal-overlay');
  if(!c || !o) return;
  c.innerHTML = h;
  o.classList.remove('hidden');
  o.classList.add('show');
}

function closeModal(){
  const o = $('modal-overlay');
  if(!o) return;
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

function shop(){
  if(s.jailed){ msg('🔒 Качалка закрыта до выхода из карцера'); return; }
  const costP = 100 + s.upgrades.power * 250;
  const costC = 300 + s.upgrades.crit * 500;
  const costE = 400 + s.upgrades.energyMax * 700;
  openModal(
    '<div class="section-window shop-window">'+
    '<div class="section-kicker">ПРОКАЧКА</div>'+
    '<h2>💪 Качалка</h2>'+
    '<p class="section-subtitle">Трать чефир на постоянные улучшения. Новые этапы открываются автоматически при смене масти ⭐.</p>'+
    '<div class="shop-grid">'+
    '<button type="button" data-b="p">💪 <b>Сила</b><br><small>+1 сила · сейчас '+s.power+'</small><br>Цена '+costP+' 🍵</button>'+
    '<button type="button" data-b="c">🎯 <b>Крит</b><br><small>+2% к шансу · сейчас '+Math.round(s.critChance*100)+'%</small><br>Цена '+costC+' 🍵</button>'+
    '<button type="button" data-b="e">⚡ <b>Энергия</b><br><small>+25 максимум · сейчас '+s.maxEnergy+'</small><br>Цена '+costE+' 🍵</button>'+
    '<button type="button" data-b="d">🔥 <b>Ускоритель</b><br><small>×2 на 100 тапов · запас '+(s.boosters.double||0)+'</small><br>Цена 500 🍵</button>'+
    '</div></div>'
  );
  document.querySelectorAll('[data-b]').forEach(b=>b.addEventListener('click',()=>{
    const type = b.dataset.b;
    const cost = type==='p' ? costP : type==='c' ? costC : type==='e' ? costE : 500;
    if(s.chifir < cost){ msg('🍵 Не хватает чефира. Нужно '+fmt(cost)+'.'); return; }
    s.chifir -= cost;
    if(type==='p'){ s.power++; s.upgrades.power++; msg('💪 Сила теперь '+s.power); }
    if(type==='c'){ s.critChance = Math.min(0.5, s.critChance+0.02); s.upgrades.crit++; msg('🎯 Крит '+Math.round(s.critChance*100)+'%'); }
    if(type==='e'){ s.maxEnergy += 25; s.energy = s.maxEnergy; s.upgrades.energyMax++; s.lastEnergyTime = Date.now(); msg('⚡ Макс. энергия '+s.maxEnergy); }
    if(type==='d'){ s.boosters.double = (s.boosters.double||0)+100; msg('🔥 Ускоритель +100 тапов'); }
    ui(); saveNow(); shop();
  }));
}

function rankMenu(){
  const r = rank(), next = R.find(x => x[1] > s.points);
  const stage = O[s.currentObject] ? O[s.currentObject][0] : 'Груша';
  openModal(
    '<div class="section-window">'+
    '<div class="section-kicker">ПРОГРЕСС</div>'+
    '<h2>🏆 Масть</h2>'+
    '<p>Твоя масть: <b>'+r[0]+'</b></p>'+
    '<p>Текущий этап: <b>'+stage+'</b></p>'+
    '<p>Следующая ступень: '+(next ? '<b>'+next[0]+'</b> · '+fmt(next[1])+' ⭐' : 'Максимальная масть')+'</p>'+
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
  if(s.jailed){
    s.jailTaps++;
    const t = $('tap-object');
    if(t){ t.classList.remove('punch'); void t.offsetWidth; t.classList.add('punch'); }
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
  if(t){ t.classList.remove('punch'); void t.offsetWidth; t.classList.add('punch'); }
  if(typeof window.animateObjectVisual === 'function') window.animateObjectVisual();
  if(typeof window.refreshObjectVisuals === 'function') window.refreshObjectVisuals();
  feedback(e, g, c);
  if(Math.random() < 0.03) msg(FUN[Math.floor(Math.random()*FUN.length)]);
  tasksCheck();
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

  console.log('[game] v4.73 OK TEST_MODE=', TEST_MODE, 'pts/tap=', TEST_POINTS_PER_TAP);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
else bind();
