/* АВТОРИТЕТ 2.0 — core v4.55 (TEST_MODE) */
'use strict';
const TEST_MODE = true;
const TEST_POINTS_PER_TAP = 500;
const N = ['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп'];
const R = [['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',50000]];
const O = [['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,50000]];
const FUN = ['Надзиратель идёт... сделай умный вид.','Сегодня без шмона. Чудо.','Шайба в кармане греет душу.','В столовой сегодня мясо. Или что-то похожее.'];

let s = {
  chifir:0, points:0, energy:250, maxEnergy:250, power:1, critChance:0.05,
  respect:0, wealth:0, nickname:'', currentObject:0, prestige:0,
  upgrades:{power:0, crit:0, energyMax:0}, boosters:{double:0},
  tasks:{taps:0, crit:0, events:0, earned:0, jail:0},
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
    if($('object-name')) $('object-name').textContent = O[s.currentObject][0];
    if($('object-action')) $('object-action').textContent = 'ТАПАЙ!';
    if($('sentence-left')) $('sentence-left').textContent = Math.max(0, Math.ceil(s.sentenceDays - s.servedSentenceMinutes/1440)) + ' дней';
    const t = $('tap-object');
    if(t){ t.classList.remove('preload-hidden'); t.style.visibility = 'visible'; t.style.opacity = '1'; }
    const g = $('game-container');
    if(g) g.classList.remove('game-booting');
    const pre = $('preloader');
    if(pre){ pre.style.display = 'none'; pre.remove(); }
    if(typeof window.__finishPreloader === 'function') try{ window.__finishPreloader(); }catch(e){}
    if(typeof window.refreshObjectVisuals === 'function') try{ window.refreshObjectVisuals(); }catch(e){}
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
      if(d && typeof d === 'object') Object.assign(s, d);
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

function shop(){
  if(s.jailed){ msg('🔒 Закрыто'); return; }
  openModal('<div class="section-window"><h2>💪 Качалка</h2><p>Сила: '+s.power+' · Крит: '+Math.round(s.critChance*100)+'%</p>'+
    '<button type="button" data-b="p">Сила +1 · '+(100+s.upgrades.power*250)+' 🍵</button> '+
    '<button type="button" data-b="c">Крит +2% · '+(300+s.upgrades.crit*500)+' 🍵</button> '+
    '<button type="button" data-b="e">Энергия +25 · '+(400+s.upgrades.energyMax*700)+' 🍵</button></div>');
  document.querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.b;
    const cost = t==='p' ? 100+s.upgrades.power*250 : t==='c' ? 300+s.upgrades.crit*500 : 400+s.upgrades.energyMax*700;
    if(s.chifir < cost){ msg('Мало чефира'); return; }
    s.chifir -= cost;
    if(t==='p'){ s.power++; s.upgrades.power++; }
    if(t==='c'){ s.critChance = Math.min(0.5, s.critChance+0.02); s.upgrades.crit++; }
    if(t==='e'){ s.maxEnergy += 25; s.energy = s.maxEnergy; s.upgrades.energyMax++; }
    ui(); saveNow(); shop();
  }));
}

function rankMenu(){
  const r = rank(), next = R.find(x => x[1] > s.points);
  openModal('<div class="section-window"><h2>🏆 Масть</h2><p>Твоя масть: <b>'+r[0]+'</b></p><p>Следующая: '+(next ? next[0]+' · '+fmt(next[1])+' ⭐' : 'Максимум')+'</p></div>');
}

function tasksMenu(){
  openModal('<div class="section-window"><h2>🎯 Поручения</h2><p>Тапов: '+fmt(s.tasks.taps)+'</p><p>Критов: '+fmt(s.tasks.crit)+'</p></div>');
}

function more(){
  if(typeof window.renderBarrack === 'function'){ window.renderBarrack(); return; }
  openModal('<div class="section-window"><h2>☰ Барак</h2><p>Персонажи загружаются…</p></div>');
}

function tap(e){
  if(e && e.preventDefault) e.preventDefault();
  if(s.jailed){
    s.jailTaps++;
    if(s.jailTaps >= s.jailRequired){ s.jailed = false; msg('🔓 Вышел из карцера'); }
    ui(); return;
  }
  restoreEnergy(Date.now());
  if(s.energy < 1){ msg('⚡ Нет энергии'); return; }
  s.energy--;
  s.totalTaps++;
  s.tasks.taps++;
  let g = TEST_MODE ? TEST_POINTS_PER_TAP : s.power * O[s.currentObject][2];
  const c = Math.random() < s.critChance;
  if(c){ s.tasks.crit++; if(!TEST_MODE) g *= 2; }
  s.chifir += g;
  s.points += g;
  s.tasks.earned += g;
  s.currentObject = highestUnlocked();
  const t = $('tap-object');
  if(t){ t.classList.remove('punch'); void t.offsetWidth; t.classList.add('punch'); }
  if(typeof window.animateObjectVisual === 'function') window.animateObjectVisual();
  if(typeof window.refreshObjectVisuals === 'function') window.refreshObjectVisuals();
  feedback(e, g, c);
  if(Math.random() < 0.03) msg(FUN[Math.floor(Math.random()*FUN.length)]);
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
    area.addEventListener('click', handler, {capture:true});
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
  window.TEST_MODE = TEST_MODE;
  window.TEST_POINTS_PER_TAP = TEST_POINTS_PER_TAP;
  window.spendEnergyForRaid = function(){
    if(s.energy < 1) return false;
    s.energy--;
    ui();
    return true;
  };

  console.log('[game] v4.55 OK TEST_MODE=', TEST_MODE, 'pts/tap=', TEST_POINTS_PER_TAP);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
else bind();
