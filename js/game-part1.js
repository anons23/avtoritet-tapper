/* АВТОРИТЕТ 2.0 — стабильная версия (anim trigger unified) */
'use strict';
const TEST_MODE=true;
const TEST_POINTS_PER_TAP=500;
const N=['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник','Криворукий','Недомерок','Каштан','Мятый','Забытый','Ходячая Ошибка','Кривой Прицел','Потеряшка','Мелкий Косяк','Батон','Вечный Новенький','Шмоня','Картонный Боец','Голова-Кирпич','Тихий Пельмень','Сбитый Прицел','Герой Очереди','Местный Балбес','Почти Пацан','Не Суетись'];
const R=[['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',50000]];
const O=[['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,50000]];
const AUTHORITY_DEALS=[['📋 Дело барака','Спор из-за места улажен.'],['📦 Распределение','Проблему с передачей припасов решили.'],['🗣️ Разговор','Конфликт между заключёнными прекращён.'],['⚖️ Решение','Спор решён без лишнего шума.'],['🤝 Договорённость','Стороны пришли к общему решению.']];
const EVENTS=[
  ['Шмон!','Надзиратели ворвались в камеру. Что делаешь?',[
    ['Спрятать папиросы',.55,40,15,2],['Стоять спокойно',0,10,5,1],['Сделать вид, что спишь',.25,5,8,1]
  ],0],
  ['Малява','Тебе передали маляву. Что в ней?',[
    ['Прочитать сразу',.4,30,20,2],['Спрятать до завтра',.15,15,10,1],['Выбросить',0,0,3,0]
  ],0],
  ['Посылка','Пришла посылка, но непонятно чья.',[
    ['Забрать себе',.6,60,10,-1],['Отдать смотрящему',0,0,20,3],['Оставить',.1,0,5,0]
  ],0],
  ['Тихий разговор','Сосед по камере просит помочь решить мелкий спор.',[
    ['Выслушать обе стороны',.65,35,18,3],['Не вмешиваться',.35,10,5,0],['Сразу поддержать знакомого',.2,20,2,-2]
  ],1],
  ['Проверка камеры','Кто-то ищет пропавшую вещь. Похоже, скоро начнут проверять всех.',[
    ['Помочь спокойно всё проверить',.7,45,22,3],['Спрятать свою вещь',.45,65,8,0],['Сделать вид, что ничего не слышал',.2,0,4,-1]
  ],1],
  ['Слух','По бараку пошёл слух о твоём последнем деле. Нужно решить, как реагировать.',[
    ['Проверить, откуда пошёл слух',.65,20,28,4],['Не обращать внимания',.5,5,12,1],['Начать спорить со всеми',.25,40,0,-4]
  ],2],
  ['Неожиданный обмен','Тебе предлагают редкую вещь в обмен на часть запаса.',[
    ['Торговаться до конца',.55,90,35,2],['Согласиться сразу',.7,25,15,0],['Отказаться',.15,0,8,1]
  ],3],
  ['Разговор со старшим','Смотрящий неожиданно вызывает тебя на короткий разговор.',[
    ['Говорить прямо',.6,30,45,6],['Сначала выслушать',.75,15,30,5],['Отшутиться',.3,10,5,-2]
  ],3]
];
const FUN=['Надзиратель идёт... сделай умный вид.','Сегодня без шмона. Чудо.','Шайба сказал, что ты нормальный пацан.','Кто-то опять забрал папиросы. Классика.','В столовой сегодня мясо. Или что-то похожее.','Сегодня раздача посылок. Надежда умирает последней.'];
const TASKS={taps10000:{title:'Первые 10 000 тапов',desc:'Сделай 10 000 обычных тапов.',target:10000,rewardAmount:500,rewardType:'chifir',reward:'500 🍵',get:()=>s.tasks.taps},bugor10:{title:'Десять тренировок',desc:'Успешно пройди 10 тренировок с Бугром.',target:10,rewardAmount:750,rewardType:'chifir',reward:'750 🍵',get:()=>s.tasks.bugorSuccess||0},crit100:{title:'Точный удар',desc:'Сделай 100 критических тапов.',target:100,rewardAmount:1000,rewardType:'chifir',reward:'1000 🍵',get:()=>s.tasks.crit},earned100k:{title:'Запас на чёрный день',desc:'Заработай 100 000 🍵 тапами и делами.',target:100000,rewardAmount:5000,rewardType:'chifir',reward:'5000 🍵',get:()=>Math.floor(s.tasks.earned||0)},tasks25:{title:'Опытный порученец',desc:'Успешно выполни 25 поручений.',target:25,rewardAmount:1500,rewardType:'points',reward:'1500 ⭐',get:()=>s.tasks.npcSuccess||0]};
const STORY=[
  {title:'Часть 1 · Первый вечер',rank:0,icon:'🌒',text:'В первый вечер ты ещё никто. Барак шумит, каждый занят своим делом. Ты быстро понимаешь главное: здесь замечают не слова, а поступки.'},
  {title:'Часть 2 · Первое имя',rank:1,icon:'👀',text:'О тебе начинают говорить. Шайба узнаёт тебя в лицо, а Бугор замечает, что ты не бросаешь дело на полпути. У тебя появляется первое настоящее имя среди своих.'},
  {title:'Часть 3 · Свой человек',rank:2,icon:'🤝',text:'Косой предлагает не просто поручение, а проверку. В бараке становится понятно: теперь твои решения влияют не только на тебя.'},
  {title:'Часть 4 · Вес слова',rank:3,icon:'🧠',text:'Тебя начинают слушать. Случайные споры превращаются в дела, где приходится выбирать между быстрым решением и правильным.'},
  {title:'Часть 5 · Разговор со старшим',rank:4,icon:'🕶️',text:'Старшие уже знают твоё имя. Один короткий разговор меняет отношение к тебе: впереди дела, в которых одной силы будет мало.'},
  {title:'Часть 6 · Последняя дверь',rank:5,icon:'🚪',text:'Ты дошёл до вершины мастей. Но за последней дверью начинается история нового срока — и пока никто не знает, чем она закончится.'}
];
const ACHIEVEMENTS={first10000:{title:'10 000 шагов',desc:'Сделано 10 000 тапов.',icon:'👣',check:()=>s.tasks.taps>=10000},crit100:{title:'Точный глаз',desc:'100 критических тапов.',icon:'🎯',check:()=>s.tasks.crit>=100},bugor2:{title:'Бугор тебя уважает',desc:'2 успешных тренировки с Бугром.',icon:'💪',check:()=>s.tasks.bugorSuccess>=2},tasks25:{title:'Свой человек',desc:'25 успешных поручений.',icon:'🤝',check:()=>s.tasks.npcSuccess>=25},rich100k:{title:'Запас на чёрный день',desc:'Заработано 100 000 🍵.',icon:'📦',check:()=>s.tasks.earned>=100000},jail5:{title:'Пять сроков',desc:'Пять раз пройти карцер до конца.',icon:'⛓️',check:()=>s.tasks.jail>=5},events10:{title:'Неспокойный барак',desc:'Пережить 10 случайных событий.',icon:'⚠️',check:()=>s.tasks.events>=10},npc50:{title:'Свой среди своих',desc:'Успешно выполнить 50 поручений НПС.',icon:'🤝',check:()=>s.tasks.npcSuccess>=50},respect100:{title:'Вес в бараке',desc:'Набрать 100 уважения.',icon:'🧠',check:()=>s.respect>=100},rich250k:{title:'Запас серьёзный',desc:'Заработать 250 000 🍵.',icon:'📦',check:()=>s.tasks.earned>=250000}};
let s={chifir:0,points:0,energy:250,maxEnergy:250,power:1,critChance:.05,respect:0,wealth:0,nickname:'',currentObject:0,prestige:0,upgrades:{power:0,crit:0,energyMax:0},boosters:{double:0},tasks:{taps:0,crit:0,events:0,earned:0,jail:0,bugorSuccess:0,npcSuccess:0},completed:{},achievements:{},storySeen:{},lastEnergyTime:Date.now(),saveUpdatedAt:Date.now(),lastChoiceEvent:0,totalTaps:0,jailed:false,jailTaps:0,jailRequired:500,confiscatedChifir:0,jailProtection:0,authorityTaps:0,energyRepairVersion:0,sentenceDays:100,servedSentenceMinutes:0,lastSentenceTick:Date.now(),sentenceReleaseCount:0};
let messageQueue=[],messageBusy=false,activeEvent=false;
const $=id=>document.getElementById(id);
const SENTENCE_MINUTES_PER_DAY=10;
const SAVE_CLOCK_KEY='avtoritet_save_clock_v1';
function trustedSaveTime(){
  try{
    const t=Number(window.ysdk&&typeof window.ysdk.serverTime==='function'?window.ysdk.serverTime():0);
    if(Number.isFinite(t)&&t>0)return t;
  }catch(e){}
  return Date.now();
}
function nextSaveTimestamp(){
  const now=trustedSaveTime();
  let localClock=0;
  try{localClock=Number(localStorage.getItem(SAVE_CLOCK_KEY))||0}catch(e){}
  const previous=Number(s.saveUpdatedAt)||0;
  const next=Math.max(now,localClock+1,previous+1);
  try{localStorage.setItem(SAVE_CLOCK_KEY,String(next))}catch(e){}
  return next;
}
function sentenceRemaining(){const total=Number(s.sentenceDays);if(!Number.isFinite(total)||total<=0)return 0;return Math.max(0,Math.ceil(total-Number(s.servedSentenceMinutes||0)/SENTENCE_MINUTES_PER_DAY))}
function addSentence(days,reason){
  days=Math.max(0,Math.floor(Number(days)||0));if(!days)return;
  const currentSentence=Number(s.sentenceDays||0);const base=currentSentence<=0?100:currentSentence;s.sentenceDays=base+days;if(currentSentence<=0)s.servedSentenceMinutes=0;s.lastSentenceTick=Date.now();
  msg('⛓️ Срок увеличен на '+days+' дн.'+(reason?' · '+reason:'')+' Осталось: '+sentenceRemaining()+' дн.');
  ui();saveNow();
}
function reduceSentence(days,reason){
  days=Math.max(0,Math.floor(Number(days)||0));if(!days)return;
  const before=Number(s.sentenceDays);if(!Number.isFinite(before)||before<=0)return;
  const served=Number(s.servedSentenceMinutes||0);
  const remaining=Math.max(0,before-served/SENTENCE_MINUTES_PER_DAY);
  const cut=Math.min(days,Math.ceil(remaining));
  s.sentenceDays=Math.max(0,before-cut);
  msg('⏳ Срок сокращён на '+cut+' дн.'+(reason?' · '+reason:''));
  checkSentenceRelease();
  ui();saveNow();
}
function checkSentenceRelease(){
  const total=Number(s.sentenceDays);if(!Number.isFinite(total)||total<=0)return false;
  if(Number(s.servedSentenceMinutes||0)+0.0001 < total*SENTENCE_MINUTES_PER_DAY)return false;
  if(s.jailed)return false;
  s.sentenceReleaseCount=(Number(s.sentenceReleaseCount)||0)+1;
  s.sentenceDays=0;
  s.servedSentenceMinutes=0;
  s.lastSentenceTick=Date.now();
  msg('🎉 СРОК ОТБЫТ! Ты вышел на свободу.');
  return true;
}
window.addSentence=addSentence;window.reduceSentence=reduceSentence;
function tickSentence(now){
  if(s.jailed||typeof document==='undefined'||document.visibilityState!=='visible'){s.lastSentenceTick=now;return false}
  const total=Number(s.sentenceDays);if(!Number.isFinite(total)||total<=0){s.lastSentenceTick=now;return false}
  if(!Number.isFinite(s.lastSentenceTick))s.lastSentenceTick=now;
  const elapsed=Math.max(0,Math.min(now-s.lastSentenceTick,60000));
  s.lastSentenceTick=now;
  if(elapsed<=0)return false;
  s.servedSentenceMinutes=Math.min(total*SENTENCE_MINUTES_PER_DAY,Number(s.servedSentenceMinutes||0)+elapsed/60000);
  return checkSentenceRelease();
}
let localSaveTimer=null;
const LOCAL_SAVE_DEBOUNCE=1500;
const LOCAL_SAVE_BACKUP=15000;
