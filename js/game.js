/* АВТОРИТЕТ 2.0 — core v4.90 (save keep raid/npc + debounce) */
'use strict';
const TEST_MODE = true;
const TEST_POINTS_PER_TAP = 500;
// Expose test flag for separately loaded raid scripts.
window.TEST_MODE = TEST_MODE;
window.TEST_POINTS_PER_TAP = TEST_POINTS_PER_TAP;
const N = ['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник'];
const R = [['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',30000]];
const O = [['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,30000]];
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

const AUTHORITY_EVENTS = [
 ['Недостача в общаке','В общаке не хватает крупной суммы. Два человека обвиняют друг друга.',[
 ['Провести закрытую сверку',.82,180,120,5,'Сверка выявила ошибку в записях. Недостачу закрыли.','След нашли, но часть денег уже ушла.',35],
 ['Выслушать обоих по очереди',.68,120,85,4,'Противоречия вскрылись, деньги вернули.','Версии не сошлись, часть суммы потеряна.',70],
 ['Временно заморозить выплаты',.55,240,150,2,'Выплаты остановили вовремя.','Решение вызвало недовольство, след пока холодный.',110]],4,'authority'],
 ['Спор за территорию','Два авторитета не поделили влияние на соседнем участке. Оба ждут решения.',[
 ['Собрать нейтральную встречу',.82,160,130,6,'Стороны согласовали границы без продолжения конфликта.','Встреча не сняла напряжение.',40],
 ['Разделить зоны ответственности',.72,130,100,4,'Полномочия разграничены, спор остановлен.','Обе стороны считают раздел несправедливым.',65],
 ['Потребовать временный нейтралитет',.62,210,150,3,'Нейтралитет принят, время на переговоры выиграно.','Конфликт остался, несмотря на паузу.',90]],4,'authority'],
 ['Звонок с воли','Проверенный контакт сообщает о задержке важного дела и просит решить, что делать.',[
 ['Перепроверить детали через второй контакт',.86,150,110,4,'Информация подтвердилась, план скорректировали.','Детали не подтвердились, решение отложено.',30],
 ['Поставить дело на паузу',.76,100,75,3,'Пауза помогла избежать лишнего риска.','Пауза сорвала сроки, договорённости ослабли.',55],
 ['Поручить переговоры доверенному человеку',.65,220,160,5,'Доверенный человек согласовал новый порядок действий.','Посредник не договорился, пришлось потратить резерв.',95]],4,'authority'],
 ['Партия задержана','Поставка для зоны задержалась. Нужно распределить остатки и не сорвать договорённости.',[
 ['Распределить остатки по списку',.84,140,100,5,'Распределение прошло спокойно.','Список устарел, часть людей осталась недовольна.',35],
 ['Согласовать новую дату',.74,180,120,4,'Новая дата подтверждена, договорённости сохранены.','Поставщик не дал гарантий, появились расходы.',75],
 ['Использовать резерв общака',.64,240,150,2,'Резерв закрыл проблему без срыва дела.','Резерв сократился, задержка не устранена.',120]],4,'authority'],
 ['Разговор со старшим вором','Через доверенного человека передали: старший вор хочет обсудить спорный вопрос.',[
 ['Подготовить факты и говорить по делу',.84,200,160,7,'Разговор прошёл предметно, позицию приняли к сведению.','Фактов оказалось мало, разговор перенесли.',45],
 ['Попросить время на проверку',.78,130,95,5,'Время дали, детали можно проверить без поспешных обещаний.','Дело затянулось, собеседник остался недоволен.',65],
 ['Предложить компромисс без потери лица',.68,230,145,6,'Компромисс устроил стороны и сохранил отношения.','Компромисс не приняли, выросли расходы.',100]],4,'authority'],
 ['Долг между своими','Старый долг стал причиной спора: стороны по-разному помнят сроки возврата.',[
 ['Поднять прежние договорённости',.85,150,105,5,'Сумма и сроки подтверждены, спор закрыт.','Записи неполные, вопрос остался открытым.',35],
 ['Установить график возврата',.78,180,115,4,'График принят, долг будут возвращать частями.','Первый платёж сорван, доверие снизилось.',60],
 ['Назначить встречу с гарантом',.7,220,140,5,'Гарант подтвердил условия, спор закрыт.','Гарант не подтвердил одну из версий.',85]],4,'authority'],
 ['Утечка информации','Появился слух, что внутренние договорённости стали известны посторонним.',[
 ['Проверить круг доступа',.82,170,125,5,'Источник утечки локализован, доступы пересмотрены.','Лишние пересказы нашли, источник не установлен.',50],
 ['Проверить достоверность слуха',.78,120,95,4,'Выяснилось, что часть слуха выдумана.','Слух подтвердился частично, планы пришлось менять.',75],
 ['Изменить порядок передачи сведений',.72,210,145,3,'Новый порядок снизил риск повторения.','Перестройка задержала текущие дела.',100]],4,'authority'],
 ['Просьба поручиться','Человек с воли просит рекомендацию. Сведения о нём пока неполные.',[
 ['Проверить рекомендации независимо',.86,140,100,4,'Рекомендации подтвердились, решение принято на фактах.','Проверка выявила противоречия, поручительство отложено.',30],
 ['Дать ограниченную рекомендацию',.72,180,120,3,'Условия обозначены заранее, рекомендацию приняли.','Условия нарушены, репутация поручителя под ударом.',70],
 ['Отказать до полной проверки',.8,90,80,2,'Осторожность оценили: необоснованных обещаний не было.','Отказ задел посредника, отношения охладели.',45]],4,'authority'],
 ['Расходы на общее дело','Казначей предлагает крупную трату из общака, но смета кажется завышенной.',[
 ['Запросить вторую смету',.88,160,110,4,'Вторая смета выявила завышение, общак сэкономил.','Сметы расходятся, решение отложено.',25],
 ['Выделить деньги по этапам',.8,190,130,5,'Поэтапная оплата удержала расходы под контролем.','Первый этап вышел дороже плана.',60],
 ['Сократить объём расходов',.73,120,100,3,'Расходы сократили без ущерба главной задаче.','Сокращение вызвало задержку и дополнительные траты.',80]],4,'authority'],
 ['Два срочных дела','Одновременно пришли спор между своими и задержка договорённости с воли.',[
 ['Сначала закрыть внутренний спор',.8,190,130,6,'Внутренний конфликт снят, второе дело передано доверенному человеку.','Спор затянулся, второе дело потребовало расходов.',55],
 ['Разделить задачи между доверенными людьми',.76,220,145,4,'Оба вопроса продвинулись параллельно.','Один исполнитель задержал ответ, часть резерва потрачена.',85],
 ['Определить приоритет после проверки рисков',.86,150,120,5,'Приоритет выбран верно, лишних потерь удалось избежать.','Проверка затянулась, одно дело перенесли.',45]],4,'authority']
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
  tasks:{taps:0, crit:0, events:0, earned:0, jail:0, bugorSuccess:0, npcSuccess:0, authorityDeals:0, npcDrop:0},
  completed:{}, achievements:{}, lastEnergyTime:Date.now(),
  saveUpdatedAt:Date.now(), lastChoiceEvent:0, totalTaps:0,
  jailed:false, jailTaps:0, jailRequired:500, confiscatedChifir:0, jailProtection:0,
  authorityTaps:0, sentenceDays:100, servedSentenceMinutes:0, sentenceTapCounter:0, lastSentenceTick:Date.now()
};

const $ = id => document.getElementById(id);
function fmt(n){ return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
function rank(){ let r=R[0]; for(const x of R) if(s.points>=x[1]) r=x; return r; }
function rankRewardScale(points){
  const p=Math.max(0,Number(points)||0);
  if(p>=30000)return 4.5;
  if(p>=15000)return 3.2;
  if(p>=5000)return 2.2;
  if(p>=1500)return 1.5;
  return 1;
}
function highestUnlocked(){ let i=0; for(let k=0;k<O.length;k++) if(s.points>=O[k][3]) i=k; return i; }

function msg(t){
  const el = $('event-message');
  if(!el) return;
  el.textContent = t;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2200);
}
window.msg = msg;

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
    if($('sentence-left')) $('sentence-left').textContent = Math.max(0, Math.ceil(Number(s.sentenceDays)||0)) + ' дней';
    const sentenceTaps = Math.max(0, Number(s.sentenceTapCounter)||0) % 50;
    const sentenceDone = Number(s.sentenceDays||0) <= 0;
    if($('sentence-fill')) $('sentence-fill').style.width = (sentenceDone ? 100 : sentenceTaps * 2) + '%';
    if($('sentence-detail')) $('sentence-detail').textContent = sentenceDone
      ? 'Срок отбыт · нарушения могут добавить дни'
      : 'До сокращения на 1 день: ' + sentenceTaps + ' / 50 тапов';
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

function clampNum(v, min, max, fallback){
  const n = Number(v);
  if(!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function clampInt(v, min, max, fallback){
  return Math.floor(clampNum(v, min, max, fallback));
}
function isPlainObject(o){
  return !!o && typeof o === 'object' && !Array.isArray(o);
}
function sanitizeNickname(v){
  let n = String(v == null ? '' : v);
  n = n.replace(/[^\w\u0400-\u04FF\- ]/g, '').trim();
  if(n.length > 16) n = n.slice(0, 16);
  return n;
}
/** Sanitize save payload in-place. Caps absurd values, drops unknown types. */
function sanitizeGameState(state){
  if(!isPlainObject(state)) return state;
  const MAX_RES = 1e12;
  const MAX_STAT = 1e6;
  const MAX_TS = Date.now() + 86400000 * 365;

  state.chifir = clampNum(state.chifir, 0, MAX_RES, 0);
  state.points = clampNum(state.points, 0, MAX_RES, 0);
  state.respect = clampNum(state.respect, 0, MAX_STAT, 0);
  state.wealth = clampNum(state.wealth, 0, MAX_STAT, 0);
  state.power = clampInt(state.power, 1, 100000, 1);
  state.critChance = clampNum(state.critChance, 0, 0.5, 0.05);
  state.maxEnergy = clampInt(state.maxEnergy, 1, 100000, 250);
  state.energy = clampInt(state.energy, 0, state.maxEnergy, Math.min(250, state.maxEnergy));
  state.currentObject = clampInt(state.currentObject, 0, Math.max(0, O.length - 1), 0);
  state.prestige = clampInt(state.prestige, 0, 1000, 0);
  state.totalTaps = clampInt(state.totalTaps, 0, MAX_RES, 0);
  state.lastChoiceEvent = clampNum(state.lastChoiceEvent, 0, MAX_RES, 0);
  state.lastEnergyTime = clampNum(state.lastEnergyTime, 0, MAX_TS, Date.now());
  state.saveUpdatedAt = clampNum(state.saveUpdatedAt, 0, MAX_TS, Date.now());

  state.jailed = !!state.jailed;
  state.jailTaps = clampInt(state.jailTaps, 0, 1000000, 0);
  state.jailRequired = clampInt(state.jailRequired, 1, 1000000, 500);
  state.confiscatedChifir = clampNum(state.confiscatedChifir, 0, MAX_RES, 0);
  state.jailProtection = clampInt(state.jailProtection, 0, 100000, 0);

  state.authorityTaps = clampInt(state.authorityTaps, 0, MAX_RES, 0);
  state.sentenceDays = clampNum(state.sentenceDays, 0, 100000, 100);
  state.servedSentenceMinutes = clampNum(state.servedSentenceMinutes, 0, 1e9, 0);
  state.sentenceTapCounter = clampInt(state.sentenceTapCounter, 0, MAX_RES, 0);
  state.lastSentenceTick = clampNum(state.lastSentenceTick, 0, MAX_TS, Date.now());

  const up = isPlainObject(state.upgrades) ? state.upgrades : {};
  state.upgrades = {
    power: clampInt(up.power, 0, 100000, 0),
    crit: clampInt(up.crit, 0, 100000, 0),
    energyMax: clampInt(up.energyMax, 0, 100000, 0)
  };
  const bo = isPlainObject(state.boosters) ? state.boosters : {};
  state.boosters = {
    double: clampInt(bo.double, 0, 1000000, 0)
  };
  const tk = isPlainObject(state.tasks) ? state.tasks : {};
  state.tasks = {
    taps: clampInt(tk.taps, 0, MAX_RES, 0),
    crit: clampInt(tk.crit, 0, MAX_RES, 0),
    events: clampInt(tk.events, 0, MAX_RES, 0),
    earned: clampNum(tk.earned, 0, MAX_RES, 0),
    jail: clampInt(tk.jail, 0, MAX_RES, 0),
    bugorSuccess: clampInt(tk.bugorSuccess, 0, MAX_RES, 0),
    npcSuccess: clampInt(tk.npcSuccess, 0, MAX_RES, 0),
    authorityDeals: clampInt(tk.authorityDeals, 0, MAX_RES, 0),
    npcDrop: clampInt(tk.npcDrop, 0, MAX_RES, 0)
  };

  if(!isPlainObject(state.completed)) state.completed = {};
  else {
    const clean = {};
    Object.keys(state.completed).slice(0, 200).forEach(function(k){
      const key = String(k).slice(0, 64);
      const v = state.completed[k];
      if(v && typeof v === 'object') clean[key] = {completedAt: clampNum(v.completedAt, 0, MAX_TS, Date.now())};
      else if(v) clean[key] = {completedAt: Date.now()};
    });
    state.completed = clean;
  }
  if(!isPlainObject(state.achievements)) state.achievements = {};

  state.nickname = sanitizeNickname(state.nickname);

  /* Equipment: keep only string ids / lists, equipment module re-validates against catalog */
  if(isPlainObject(state.equipment)){
    state.equipment = {
      weapon: String(state.equipment.weapon || 'fists').slice(0, 32),
      armor: String(state.equipment.armor || 'tee').slice(0, 32)
    };
  }
  if(Array.isArray(state.ownedWeapons)){
    state.ownedWeapons = state.ownedWeapons.slice(0, 64).map(function(x){ return String(x).slice(0, 32); }).filter(Boolean);
  }
  if(Array.isArray(state.ownedArmor)){
    state.ownedArmor = state.ownedArmor.slice(0, 64).map(function(x){ return String(x).slice(0, 32); }).filter(Boolean);
  }

  const rs = isPlainObject(state.raidStats) ? state.raidStats : (isPlainObject(state.raidProgress) ? state.raidProgress : {});
  state.raidStats = {
    wins: clampInt(rs.wins, 0, MAX_RES, 0),
    bugorLevel: clampInt(rs.bugorLevel, 1, 5, 1)
  };
  state.raidProgress = state.raidStats;

  function sanitizeTalkMap(src){
    const clean = {};
    if(!isPlainObject(src)) return clean;
    Object.keys(src).slice(0, 64).forEach(function(k){
      const key = String(k).slice(0, 48);
      const v = src[k];
      if(typeof v === 'number' || typeof v === 'string'){
        clean[key] = clampInt(v, 0, 100000, 0);
      }else if(isPlainObject(v)){
        clean[key] = {
          used: clampInt(v.used, 0, 100000, 0),
          extra: clampInt(v.extra, 0, 100000, 0),
          until: clampNum(v.until, 0, MAX_TS, 0)
        };
      }
    });
    return clean;
  }
  const talks = isPlainObject(state.npcTalks) ? state.npcTalks : (isPlainObject(state.npcTalk) ? state.npcTalk : {});
  state.npcTalks = sanitizeTalkMap(talks);
  state.npcTalk = state.npcTalks;

  const relSrc = isPlainObject(state.npcRelations) ? state.npcRelations : {};
  const relClean = {};
  Object.keys(relSrc).slice(0, 32).forEach(function(k){
    const key = String(k).slice(0, 32);
    const v = relSrc[k];
    if(!isPlainObject(v)) return;
    relClean[key] = {
      rep: clampInt(v.rep, 0, 60, 0),
      helped: clampInt(v.helped, 0, MAX_RES, 0),
      failed: clampInt(v.failed, 0, MAX_RES, 0),
      betrayed: clampInt(v.betrayed, 0, MAX_RES, 0),
      saved: clampInt(v.saved, 0, MAX_RES, 0)
    };
  });
  state.npcRelations = relClean;

  return state;
}

let saveTimer = null;
function saveNow(){
  if(window.__AVTORITET_RESETTING) return;
  try{
    if(saveTimer){ clearTimeout(saveTimer); saveTimer = null; }
    sanitizeGameState(s);
    s.saveUpdatedAt = Date.now();
    localStorage.setItem('avtoritet_save_v2', JSON.stringify(s));
  }catch(e){}
}
function saveSoon(){
  if(window.__AVTORITET_RESETTING) return;
  if(saveTimer) return;
  saveTimer = setTimeout(function(){
    saveTimer = null;
    saveNow();
  }, 1500);
}

function load(){
  try{
    const raw = localStorage.getItem('avtoritet_save_v2');
    if(raw){
      const d = JSON.parse(raw);
      if(d && typeof d === 'object' && !Array.isArray(d)){
        /* Whitelist merge: only known top-level keys from defaults + common extensions */
        const allowed = {
          chifir:1, points:1, energy:1, maxEnergy:1, power:1, critChance:1,
          respect:1, wealth:1, nickname:1, currentObject:1, prestige:1,
          upgrades:1, boosters:1, tasks:1, completed:1, achievements:1,
          lastEnergyTime:1, saveUpdatedAt:1, lastChoiceEvent:1, totalTaps:1,
          jailed:1, jailTaps:1, jailRequired:1, confiscatedChifir:1, jailProtection:1,
          authorityTaps:1, sentenceDays:1, servedSentenceMinutes:1, sentenceTapCounter:1, lastSentenceTick:1,
          equipment:1, ownedWeapons:1, ownedArmor:1, saveVersion:1,
          raidProgress:1, raidStats:1, npcTalk:1, npcTalks:1, npcRelations:1,
          daily:1, authority:1, cigarettes:1
        };
        Object.keys(d).forEach(function(k){
          if(allowed[k]) s[k] = d[k];
        });
        s.upgrades = Object.assign({power:0,crit:0,energyMax:0}, isPlainObject(d.upgrades) ? d.upgrades : {});
        s.boosters = Object.assign({double:0}, isPlainObject(d.boosters) ? d.boosters : {});
        s.tasks = Object.assign({taps:0,crit:0,events:0,earned:0,jail:0,bugorSuccess:0,npcSuccess:0,authorityDeals:0,npcDrop:0}, isPlainObject(d.tasks) ? d.tasks : {});
        s.completed = isPlainObject(d.completed) ? d.completed : {};
        s.achievements = isPlainObject(d.achievements) ? d.achievements : {};
      }
    }
  }catch(e){}
  sanitizeGameState(s);
  if(!s.nickname) s.nickname = N[Math.floor(Math.random()*N.length)];
  s.currentObject = highestUnlocked();
  s.energy = Math.min(s.energy, s.maxEnergy);
  /* Persist cleaned save so cloud/local stay consistent */
  try{
    s.saveUpdatedAt = Date.now();
    localStorage.setItem('avtoritet_save_v2', JSON.stringify(s));
  }catch(e){}
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
function reduceSentenceForTap(){
  // Считаются только обычные тапы по объектам. Карцер имеет отдельный tap-режим,
  // а рейды не вызывают эту функцию.
  s.sentenceTapCounter=Math.max(0,Number(s.sentenceTapCounter)||0)+1;
  if(s.sentenceTapCounter<50)return;
  const daysToRemove=Math.floor(s.sentenceTapCounter/50);
  s.sentenceTapCounter=s.sentenceTapCounter%50;
  if(Number(s.sentenceDays||0)<=0)return;
  const before=Math.max(0,Number(s.sentenceDays)||0);
  s.sentenceDays=Math.max(0,before-daysToRemove);
  const removed=before-s.sentenceDays;
  if(removed>0)msg('⛓️ 50 тапов — срок сокращён на '+removed+' дн.');
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
  const isAuthority=s.points>=30000;
  const available=isAuthority ? AUTHORITY_EVENTS : EVENTS.filter(e=>stage>=Number(e[3]||0));
  if(!available.length)return;
  activeEvent=true;
  const v=available[Math.floor(Math.random()*available.length)];
  const authorityEvent=!!(v[4]==='authority');
  const authorityEventImages = {
    'Недостача в общаке':'common_fund_shortage.webp',
    'Спор за территорию':'territory_dispute.webp',
    'Звонок с воли':'call_from_outside.webp',
    'Партия задержана':'shipment_delayed.webp',
    'Разговор со старшим вором':'talk_with_thief.webp',
    'Долг между своими':'debt_between_own.webp',
    'Утечка информации':'information_leak.webp',
    'Просьба поручиться':'vouch_request.webp',
    'Расходы на общее дело':'common_fund_expenses.webp',
    'Два срочных дела':'two_urgent_matters.webp'
  };
  const authorityEventOriginalImages = {
    'Недостача в общаке':'недостача в общаке.jfif',
    'Спор за территорию':'Спор за территорию.jfif',
    'Звонок с воли':'звонок с воли.jfif',
    'Партия задержана':'партия задержана.jfif',
    'Разговор со старшим вором':'Разговор со старшим вором.jfif',
    'Долг между своими':'Долг между своими.jfif',
    'Утечка информации':'Утечка информации.jfif',
    'Просьба поручиться':'Просьба поручиться.jfif',
    'Расходы на общее дело':'Расходы на общее дело.jfif',
    'Два срочных дела':'Два срочных дела.jfif'
  };
  const authorityArt = authorityEvent
    ? '<div class="authority-event-art"><img src="./assets/authority/events/'+authorityEventImages[v[0]]+'" alt="" loading="eager" decoding="async"></div>'
    : '';
  let h='<div class="section-window event-window"><div class="section-kicker">'+(authorityEvent?'ДЕЛО АВТОРИТЕТА':'СОБЫТИЕ')+'</div><h2>⚠️ '+v[0]+'</h2>'+authorityArt+'<p>'+v[1]+'</p><p><b>'+(authorityEvent?'Выбери, как решить вопрос:':'Решай быстро:')+'</b></p><div class="choices">';
  v[2].forEach((c,i)=>{ h+='<button type="button" class="choice" data-i="'+i+'">'+c[0]+'</button>'; });
  h+='</div></div>';
  openModal(h,true);
  const authorityEventImage=document.querySelector('.authority-event-art img');
  if(authorityEventImage&&authorityEvent){
    authorityEventImage.onerror=()=>{
      authorityEventImage.onerror=null;
      const original=authorityEventOriginalImages[v[0]];
      if(original)authorityEventImage.src='./assets/authority/events/'+encodeURIComponent(original);
    };
  }
  document.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    if(!activeEvent||s.jailed)return;
    const c=v[2][Number(b.dataset.i)];
    s.tasks.events=(s.tasks.events||0)+1;
    s.lastChoiceEvent=s.points;
    if(Math.random()<c[1]){
      const scale=rankRewardScale(s.points);
      let gotChifir=0,gotPoints=0,gotRespect=0,gotEnergy=0;
      if(authorityEvent){
        // Дела Авторитета чередуют тип награды: не каждый успех выдаёт все ресурсы сразу.
        const rewardKind=(available.indexOf(v)*3+Number(b.dataset.i))%3;
        if(rewardKind===0){ gotChifir=Math.round((Number(c[2])||0)*scale); gotRespect=Number(c[4])||0; }
        else if(rewardKind===1){ gotPoints=Math.round((Number(c[3])||0)*scale); gotEnergy=Math.max(5,Math.round((Number(c[3])||100)*0.12*Math.min(scale,2.5))); }
        else { gotChifir=Math.round((Number(c[2])||0)*scale); gotPoints=Math.round((Number(c[3])||0)*scale); }
      }else{
        // В обычных событиях состав награды тоже меняется: не выдаём все показатели одновременно.
        const rewardKind=(Math.floor(Math.max(0,Number(s.points)||0)/1500)+Number(b.dataset.i))%3;
        const choiceText=String(c[0]||'').toLowerCase();
        if(rewardKind===0){
          gotChifir=Math.round((Number(c[2])||0)*scale);
          gotRespect=Number(c[4])||0;
        }else if(rewardKind===1){
          gotRespect=Number(c[4])||0;
          if(/спать|отдых|залечь|спокойно|не вмешиваться/.test(choiceText)){
            gotEnergy=Math.max(5,Math.round((Number(c[3])||40)*0.15*Math.min(scale,2.5)));
          }else{
            gotPoints=Math.round((Number(c[3])||0)*scale);
          }
        }else{
          gotChifir=Math.round((Number(c[2])||0)*scale);
          gotPoints=Math.round((Number(c[3])||0)*scale);
        }
      }
      s.chifir+=gotChifir;
      s.tasks.earned=(s.tasks.earned||0)+gotChifir;
      s.points+=gotPoints;
      s.respect=Math.max(0,(s.respect||0)+gotRespect);
      if(gotEnergy){ const before=s.energy; s.energy=Math.min(s.maxEnergy,s.energy+gotEnergy); gotEnergy=s.energy-before; s.lastEnergyTime=Date.now(); }
      const rewards=[];
      if(gotChifir)rewards.push('+'+fmt(gotChifir)+' 🍵');
      if(gotPoints)rewards.push('+'+fmt(gotPoints)+' ⭐');
      if(gotRespect)rewards.push('уважение +'+gotRespect);
      if(gotEnergy)rewards.push('+'+fmt(gotEnergy)+' ⚡');
      const rewardText=rewards.length?' · '+rewards.join(' · '):'';
      choiceResult((c[5]||'Удачно!')+rewardText,true);
      finishEvent();
    }else{
      const loss=Math.max(3,Math.ceil(Math.max(1,c[3])*1.5));
      if(authorityEvent){
        const chifirLoss=Math.max(0,Number(c[7])||25);
        s.chifir=Math.max(0,s.chifir-chifirLoss);
        s.points=Math.max(0,s.points-Math.max(1,Math.ceil(loss*.35)));
        choiceResult((c[6]||'Решение не сработало. Вопрос остаётся открытым.')+' −'+fmt(chifirLoss)+' 🍵',false);
        finishEvent();
      }else{
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
    ''+
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
    if(type==='d'){ msg('📺 Ускоритель доступен только за рекламу'); return; }
    const cost = type==='p' ? costP : type==='c' ? costC : costE;
    if(s.chifir < cost){ msg('🍵 Не хватает чефира. Нужно '+fmt(cost)+'.'); return; }
    s.chifir -= cost;
    if(type==='p'){ s.power++; s.upgrades.power++; msg('💪 Сила теперь '+s.power); }
    if(type==='c'){ s.critChance = Math.min(0.5, s.critChance+0.02); s.upgrades.crit++; msg('🎯 Крит '+Math.round(s.critChance*100)+'%'); }
    if(type==='e'){ s.maxEnergy += 25; s.energy = s.maxEnergy; s.upgrades.energyMax++; s.lastEnergyTime = Date.now(); msg('⚡ Макс. энергия '+s.maxEnergy); }
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

function showNoEnergyPrompt(){
  const overlay=$('modal-overlay'), content=$('modal-content');
  if(!overlay||!content){ msg('⚡ Нет энергии'); return; }
  content.innerHTML='<div class="no-energy-prompt"><div class="energy-kicker">НУЖНО ВОССТАНОВИТЬСЯ</div><h2>⚡ Нет энергии</h2><p>Энергия закончилась — восстанови её, чтобы продолжить удары.</p><button type="button" id="no-energy-restore">Восстановить</button></div>';
  overlay.dataset.locked='0';
  overlay.classList.remove('hidden');
  overlay.classList.add('show');
  const button=$('no-energy-restore');
  if(button)button.onclick=function(){
    if(window.EnergyUI&&typeof window.EnergyUI.open==='function')window.EnergyUI.open();
    else { msg('⚡ Открой индикатор энергии для восстановления'); overlay.classList.add('hidden'); overlay.classList.remove('show'); }
  };
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
    if(s.jailTaps >= s.jailRequired){ s.jailed = false; s.energy = s.maxEnergy; s.lastEnergyTime = Date.now(); s.tasks.jail = (s.tasks.jail||0)+1; msg('🔓 Вышел из карцера — энергия полностью восстановлена! ⚡ '+fmt(s.energy)+'/'+fmt(s.maxEnergy)); ui(); saveNow(); return; }
    ui(); saveSoon(); return;
  }
  restoreEnergy(Date.now());
  if(s.energy < 1){ showNoEnergyPrompt(); return; }
  s.energy--;
  s.totalTaps++;
  s.tasks.taps++;
  reduceSentenceForTap();
  let g = TEST_MODE ? TEST_POINTS_PER_TAP : s.power * O[s.currentObject][2];
  const c = Math.random() < s.critChance;
  if(c){ s.tasks.crit++; if(!TEST_MODE) g *= 2; }
  if(s.boosters.double > 0){ g *= 2; s.boosters.double--; }
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
  saveSoon();
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
  window.sanitizeGameState = sanitizeGameState;
  window.saveGame = saveNow;
  window.saveSoon = saveSoon;
  window.msg = msg;
  window.ui = ui;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.checkTasks = tasksCheck;
  window.TEST_MODE = TEST_MODE;
  window.TEST_POINTS_PER_TAP = TEST_POINTS_PER_TAP;
  window.showNoEnergyPrompt = showNoEnergyPrompt;
  window.spendEnergyForRaid = function(){
    if(s.energy < 1) return false;
    s.energy--;
    ui();
    saveSoon();
    return true;
  };

  console.log('[game] v4.90 OK TEST_MODE=', TEST_MODE, 'pts/tap=', TEST_POINTS_PER_TAP);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
else bind();
