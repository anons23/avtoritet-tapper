/* АВТОРИТЕТ 2.0 — стабильная версия (anim trigger unified) */
'use strict';
const TEST_MODE=true;
const TEST_POINTS_PER_TAP=500;
const N=['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник','Криворукий','Недомерок','Каштан','Мятый','Забытый','Ходячая Ошибка','Кривой Прицел','Потеряшка','Мелкий Косяк','Батон','Вечный Новенький','Шмоня','Картонный Боец','Голова-Кирпич','Тихий Пельмень','Сбитый Прицел','Герой Очереди','Местный Балбес','Почти Пацан','Не Суетись'];
const R=[['Салага',0],['Пацан',500],['Блатной',2500],['Смотрящий',10000],['Авторитет',40000],['Вор в законе',150000]];
const O=[['Груша','🥊',1,0],['Сокамерник','👊',1.3,500],['Отжимания','💪',1.6,2500],['Тренажёр','🏋️',2.2,10000],['Разборка','🗣️',3.2,40000],['Прорыв','🚪',4.5,150000]];
const AUTHORITY_DEALS=[['📋 Дело барака','Спор из-за места улажен.'],['📦 Распределение','Проблему с передачей припасов решили.'],['🗣️ Разговор','Конфликт между заключёнными прекращён.'],['⚖️ Решение','Спор решён без лишнего шума.'],['🤝 Договорённость','Стороны пришли к общему решению.']];
const FINAL_BREAKTHROUGH=['🚪 Путь найден.','👀 Внимание отвлечено.','🔓 Преграда пройдена.','🏃 Последний участок позади.'];
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
const TASKS={taps10000:{title:'Первые 10 000 тапов',desc:'Сделай 10 000 обычных тапов.',target:10000,rewardAmount:500,rewardType:'chifir',reward:'500 🍵',get:()=>s.tasks.taps},bugor10:{title:'Десять тренировок',desc:'Успешно пройди 10 тренировок с Бугром.',target:10,rewardAmount:750,rewardType:'chifir',reward:'750 🍵',get:()=>s.tasks.bugorSuccess||0},crit100:{title:'Точный удар',desc:'Сделай 100 критических тапов.',target:100,rewardAmount:1000,rewardType:'chifir',reward:'1000 🍵',get:()=>s.tasks.crit},earned100k:{title:'Запас на чёрный день',desc:'Заработай 100 000 🍵 тапами и делами.',target:100000,rewardAmount:5000,rewardType:'chifir',reward:'5000 🍵',get:()=>Math.floor(s.tasks.earned||0)},tasks25:{title:'Опытный порученец',desc:'Успешно выполни 25 поручений.',target:25,rewardAmount:1500,rewardType:'points',reward:'1500 ⭐',get:()=>s.tasks.npcSuccess||0}};
const STORY=[
  {title:'Часть 1 · Первый вечер',rank:0,icon:'🌒',text:'В первый вечер ты ещё никто. Барак шумит, каждый занят своим делом. Ты быстро понимаешь главное: здесь замечают не слова, а поступки.'},
  {title:'Часть 2 · Первое имя',rank:1,icon:'👀',text:'О тебе начинают говорить. Шайба узнаёт тебя в лицо, а Бугор замечает, что ты не бросаешь дело на полпути. У тебя появляется первое настоящее имя среди своих.'},
  {title:'Часть 3 · Свой человек',rank:2,icon:'🤝',text:'Косой предлагает не просто поручение, а проверку. В бараке становится понятно: теперь твои решения влияют не только на тебя.'},
  {title:'Часть 4 · Вес слова',rank:3,icon:'🧠',text:'Тебя начинают слушать. Случайные споры превращаются в дела, где приходится выбирать между быстрым решением и правильным.'},
  {title:'Часть 5 · Разговор со старшим',rank:4,icon:'🕶️',text:'Старшие уже знают твоё имя. Один короткий разговор меняет отношение к тебе: впереди дела, в которых одной силы будет мало.'},
  {title:'Часть 6 · Последняя дверь',rank:5,icon:'🚪',text:'Ты дошёл до вершины мастей. Но за последней дверью начинается история нового срока — и пока никто не знает, чем она закончится.'}
];
const ACHIEVEMENTS={first10000:{title:'10 000 шагов',desc:'Сделано 10 000 тапов.',icon:'👣',check:()=>s.tasks.taps>=10000},crit100:{title:'Точный глаз',desc:'100 критических тапов.',icon:'🎯',check:()=>s.tasks.crit>=100},bugor2:{title:'Бугор тебя уважает',desc:'2 успешных тренировки с Бугром.',icon:'💪',check:()=>s.tasks.bugorSuccess>=2},tasks25:{title:'Свой человек',desc:'25 успешных поручений.',icon:'🤝',check:()=>s.tasks.npcSuccess>=25},rich100k:{title:'Запас на чёрный день',desc:'Заработано 100 000 🍵.',icon:'📦',check:()=>s.tasks.earned>=100000},rankThief:{title:'Высшая масть',desc:'Достигнута масть «Вор в законе».',icon:'👑',check:()=>s.points>=150000},jail5:{title:'Пять сроков',desc:'Пять раз пройти карцер до конца.',icon:'⛓️',check:()=>s.tasks.jail>=5},events10:{title:'Неспокойный барак',desc:'Пережить 10 случайных событий.',icon:'⚠️',check:()=>s.tasks.events>=10},npc50:{title:'Свой среди своих',desc:'Успешно выполнить 50 поручений НПС.',icon:'🤝',check:()=>s.tasks.npcSuccess>=50},respect100:{title:'Вес в бараке',desc:'Набрать 100 уважения.',icon:'🧠',check:()=>s.respect>=100},rich250k:{title:'Запас серьёзный',desc:'Заработать 250 000 🍵.',icon:'📦',check:()=>s.tasks.earned>=250000}};
let s={chifir:0,points:0,energy:250,maxEnergy:250,power:1,critChance:.05,respect:0,wealth:0,nickname:'',currentObject:0,prestige:0,upgrades:{power:0,crit:0,energyMax:0},boosters:{double:0},tasks:{taps:0,crit:0,events:0,earned:0,jail:0,bugorSuccess:0,npcSuccess:0},completed:{},achievements:{},storySeen:{},lastEnergyTime:Date.now(),saveUpdatedAt:Date.now(),lastChoiceEvent:0,totalTaps:0,jailed:false,jailTaps:0,jailRequired:500,confiscatedChifir:0,jailProtection:0,authorityTaps:0,energyRepairVersion:0,sentenceDays:100,servedSentenceMinutes:0,lastSentenceTick:Date.now(),sentenceReleaseCount:0};
let messageQueue=[],messageBusy=false,activeEvent=false;
const $=id=>document.getElementById(id);
const SENTENCE_MINUTES_PER_DAY=10;
function sentenceRemaining(){return Math.max(0,Math.ceil(Number(s.sentenceDays||100)-Number(s.servedSentenceMinutes||0)/SENTENCE_MINUTES_PER_DAY))}
function addSentence(days,reason){
  days=Math.max(0,Math.floor(Number(days)||0));if(!days)return;
  const base=Number(s.sentenceDays||0)<=0?100:Number(s.sentenceDays||100);s.sentenceDays=base+days;s.servedSentenceMinutes=0;s.lastSentenceTick=Date.now();
  msg('⛓️ Срок увеличен на '+days+' дн.'+(reason?' · '+reason:'')+' Осталось: '+sentenceRemaining()+' дн.');
  ui();save();
}
function reduceSentence(days,reason){
  days=Math.max(0,Math.floor(Number(days)||0));if(!days)return;
  const before=Number(s.sentenceDays||100);
  const served=Number(s.servedSentenceMinutes||0);
  const remaining=Math.max(0,before-served/SENTENCE_MINUTES_PER_DAY);
  const cut=Math.min(days,Math.ceil(remaining));
  s.sentenceDays=Math.max(0,before-cut);
  msg('⏳ Срок сокращён на '+cut+' дн.'+(reason?' · '+reason:''));
  checkSentenceRelease();
  ui();save();
}
function checkSentenceRelease(){
  if(Number(s.servedSentenceMinutes||0)+0.0001 < Number(s.sentenceDays||100)*SENTENCE_MINUTES_PER_DAY)return false;
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
  if(!Number.isFinite(s.lastSentenceTick))s.lastSentenceTick=now;
  const elapsed=Math.max(0,Math.min(now-s.lastSentenceTick,60000));
  s.lastSentenceTick=now;
  if(elapsed<=0)return false;
  s.servedSentenceMinutes=Math.min(Number(s.sentenceDays||100)*SENTENCE_MINUTES_PER_DAY,Number(s.servedSentenceMinutes||0)+elapsed/60000);
  return checkSentenceRelease();
}
function save(){try{s.saveUpdatedAt=Date.now();localStorage.setItem('avtoritet_save_v2',JSON.stringify(s))}catch(e){}}
function restoreEnergy(now){now=Number(now)||Date.now();if(!Number.isFinite(s.lastEnergyTime))s.lastEnergyTime=now;if(!Number.isFinite(s.energy))s.energy=0;if(!Number.isFinite(s.maxEnergy)||s.maxEnergy<1)s.maxEnergy=250;if(s.energy>=s.maxEnergy){s.energy=s.maxEnergy;s.lastEnergyTime=now;return 0}const elapsed=Math.max(0,now-s.lastEnergyTime),gain=Math.floor(elapsed/30000);if(gain>0){s.energy=Math.min(s.maxEnergy,s.energy+gain);s.lastEnergyTime+=gain*30000;if(s.energy>=s.maxEnergy)s.lastEnergyTime=now}return gain}
function highestUnlocked(){let i=0;for(let j=0;j<R.length;j++)if(s.points>=R[j][1])i=j;return Math.min(i,O.length-1)}
function syncObject(showMessage){const next=highestUnlocked(),old=s.currentObject;if(showMessage&&next>old)msg('🏆 Новая масть: '+R[next][0]+' · новый этап: '+O[next][0]);s.currentObject=next}
function checkStoryProgress(silent=false){
  if(!s.storySeen||typeof s.storySeen!=='object')s.storySeen={};
  let changed=false;
  STORY.forEach((part,i)=>{
    if(s.currentObject>=part.rank&&!s.storySeen[i]){
      s.storySeen[i]={unlockedAt:Date.now()};
      if(!silent)msg('📖 Открыта новая часть истории: '+part.title);
      changed=true;
    }
  });
  return changed;
}
function load(){try{const raw=localStorage.getItem('avtoritet_save_v2');if(raw){const d=JSON.parse(raw);if(d&&typeof d==='object')s={...s,...d,upgrades:{...s.upgrades,...(d.upgrades||{})},tasks:{...s.tasks,...(d.tasks||{})},boosters:{...s.boosters,...(d.boosters||{})},achievements:{...s.achievements,...(d.achievements||{})}}}}catch(e){}if(!s.nickname)s.nickname=N[Math.floor(Math.random()*N.length)];if(!Number.isFinite(s.energy))s.energy=250;if(Number(s.energy)<=0&&!Number(s.energyRepairVersion)){s.energy=Math.max(1,Number(s.maxEnergy)||250);s.lastEnergyTime=Date.now();s.energyRepairVersion=1;}if(!Number.isFinite(s.maxEnergy))s.maxEnergy=250;if(!Number.isFinite(s.lastEnergyTime))s.lastEnergyTime=Date.now();if(!Number.isFinite(s.saveUpdatedAt))s.saveUpdatedAt=Date.now();if(!Number.isFinite(s.jailTaps)||s.jailTaps<0)s.jailTaps=0;if(!Number.isFinite(s.jailRequired)||s.jailRequired<1)s.jailRequired=500;if(!Number.isFinite(s.confiscatedChifir)||s.confiscatedChifir<0)s.confiscatedChifir=0;if(!Number.isFinite(s.jailProtection)||s.jailProtection<0)s.jailProtection=0;if(!Number.isFinite(s.sentenceDays)||s.sentenceDays<0)s.sentenceDays=100;if(!Number.isFinite(s.servedSentenceMinutes)||s.servedSentenceMinutes<0)s.servedSentenceMinutes=0;if(!Number.isFinite(s.lastSentenceTick))s.lastSentenceTick=Date.now();if(!Number.isFinite(s.sentenceReleaseCount))s.sentenceReleaseCount=0;if(!Number.isFinite(s.tasks.bugorSuccess))s.tasks.bugorSuccess=0;if(!Number.isFinite(s.tasks.npcSuccess))s.tasks.npcSuccess=0;restoreEnergy(Date.now());syncObject(false);checkStoryProgress(true);tasksCheck();save()}
function fmt(n){n=Math.floor(Number(n)||0);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n)}
function rank(){let r=R[0];for(const x of R)if(s.points>=x[1])r=x;return r}
function updateRankGoal(){
  const label=$('rank-goal-label'),value=$('rank-goal-value'),fill=$('rank-goal-fill');
  if(!label||!value||!fill)return;
  const current=rank(),i=R.findIndex(x=>x[0]===current[0]);
  const next=R[i+1];
  if(!next){
    label.textContent='Максимальная масть';
    value.textContent='150 000 ⭐ · максимум';
    fill.style.width='100%';
    return;
  }
  const start=current[1],target=next[1],progress=Math.max(0,Math.min(1,(s.points-start)/(target-start)));
  label.textContent='До следующей масти: '+next[0];
  value.textContent=fmt(Math.max(0,target-s.points))+' ⭐ осталось';
  fill.style.width=(progress*100).toFixed(1)+'%';
}
function requestNameChange(value){const name=String(value??'').trim().replace(/[<>]/g,'').slice(0,24);if(!name){msg('🥷 Введи погремуху');return false}s.nickname=name;save();ui();msg('🥷 Погремуха изменена: '+name);return true}
window.requestNameChange=requestNameChange;
function updateEnergyHint(){
  const el=$('energy-hint');
  if(!el)return;
  if(s.energy>=s.maxEnergy){el.textContent='⚡ Энергия полностью восстановлена';return}
  const left=Math.max(0,30000-(Date.now()-s.lastEnergyTime));
  const sec=Math.ceil(left/1000);
  const mins=Math.floor(sec/60),secs=sec%60;
  el.textContent='⚡ +1 энергия через '+(mins?mins+'м ':'')+String(secs).padStart(2,'0')+'с · восстанавливается даже когда ты вышел';
}
function updateSentenceUi(){
  const left=$('sentence-left'),detail=$('sentence-detail'),fill=$('sentence-fill');
  if(!left||!detail||!fill)return;
  const total=Math.max(0,Number(s.sentenceDays||100));
  const served=Math.min(total,Number(s.servedSentenceMinutes||0)/SENTENCE_MINUTES_PER_DAY);
  const remaining=Math.max(0,total-served);
  left.textContent=remaining<=0?'Свобода':Math.ceil(remaining)+' дн.';
  detail.textContent=remaining<=0?'Срок отбыт.':('Отбыл '+Math.floor(served)+' / '+Math.ceil(total)+' дней · 1 день = 10 мин активной игры');
  fill.style.width=(total?Math.min(100,served/total*100):100).toFixed(1)+'%';
}
function ui(){tickSentence(Date.now());const set=(id,value)=>{const el=$(id);if(el)el.textContent=value};set('chifir',fmt(s.chifir));set('points',fmt(s.points));set('energy',Math.floor(s.energy));set('max-energy',s.maxEnergy);updateEnergyHint();set('authority-influence-value',fmt(s.points));set('nickname',s.nickname);set('rank',rank()[0]);updateRankGoal();set('power-stat',s.power);set('respect-stat',s.respect);set('wealth-stat',s.wealth);const o=O[s.currentObject]||O[0],emoji=$('object-emoji'),name=$('object-name'),action=$('object-action');if(emoji){emoji.dataset.objectIndex=String(s.currentObject);const mark=emoji.querySelector('.jail-emoji-mark');if(s.jailed){emoji.querySelectorAll('img[data-stage]').forEach(img=>{img.style.display='none';});if(!mark){const m=document.createElement('span');m.className='jail-emoji-mark';m.textContent='⛓️';emoji.appendChild(m);}}else if(mark){mark.remove();}}if(name){const next=s.jailed?'Карцер':o[0];if(name.textContent!==next)name.textContent=next;}if(action){const next=s.jailed?'ТАПАЙ ДЛЯ ВЫХОДА':s.currentObject===4?'РАЗОБРАТЬ ДЕЛО':s.currentObject===5?'ПРОЙТИ ПРЕГРАДУ':'ТАПАЙ!';if(action.textContent!==next)action.textContent=next;}const gc=$('game-container');if(gc)gc.classList.toggle('jail-mode',!!s.jailed);const jp=$('jail-panel');if(jp){jp.classList.toggle('hidden',!s.jailed);const jc=$('jail-count'),jl=$('jail-left');if(s.jailed){if(jc)jc.textContent=Math.min(s.jailTaps,s.jailRequired)+' / '+s.jailRequired;if(jl)jl.textContent=Math.max(0,s.jailRequired-s.jailTaps)}else{if(jc)jc.textContent='0 / '+s.jailRequired;if(jl)jl.textContent=s.jailRequired}}['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(id=>{const b=$(id);if(b)b.disabled=!!s.jailed})}
function choiceResult(x,ok){const e=$('choice-result');if(!e)return;e.textContent=String(x);e.classList.remove('show','success','fail');e.classList.add(ok?'success':'fail');void e.offsetWidth;e.classList.add('show');clearTimeout(choiceResult.timer);choiceResult.timer=setTimeout(()=>e.classList.remove('show'),2600)}
function msg(x){messageQueue.push(String(x));processMessages()}
function processMessages(){if(messageBusy||!messageQueue.length)return;const e=$('event-message');if(!e){messageQueue=[];return}messageBusy=true;e.textContent=messageQueue.shift();e.classList.add('show');setTimeout(()=>{e.classList.remove('show');setTimeout(()=>{messageBusy=false;processMessages()},250)},4200)}
function feedback(e,n,c){
  let x=$('tap-feedback');
  if(!x){
    x=document.createElement('div');
    x.id='tap-feedback';
    const parent=$('tap-area')||$('game-container')||document.body;
    parent.appendChild(x);
  }
  x.textContent=(c?'КРИТ! ':'+')+n;
  x.style.left=(e&&e.clientX||150)+'px';
  x.style.top=(e&&e.clientY||250)+'px';
  x.classList.remove('show');
  void x.offsetWidth;
  x.classList.add('show');
}
function jailTap(e){if(!s.jailed)return;e&&e.preventDefault&&e.preventDefault();if(s.jailTaps>=s.jailRequired)return;s.jailTaps++;if(s.jailTaps%100===0)reduceSentence(1,'работа в карцере');const t=$('tap-object');if(t){t.classList.remove('punch');void t.offsetWidth;t.classList.add('punch')}if(typeof window.animateObjectVisual==='function')window.animateObjectVisual();feedback(e,1,false);if(s.jailTaps>=s.jailRequired)releaseFromJail();else ui();save()}
function releaseFromJail(){const confiscated=Math.max(0,Math.floor(s.confiscatedChifir));s.jailed=false;s.confiscatedChifir=0;s.jailTaps=0;s.tasks.jail=(s.tasks.jail||0)+1;s.jailProtection=75;msg('🔓 Карцер пройден! Тебя выпустили. 🍵 Изъято чефира: '+fmt(confiscated));tasksCheck();ui();save()}
function enterJail(reason){if(s.jailed)return;addSentence(3,'карцер');s.jailed=true;s.jailRequired=500;s.jailTaps=0;const jailRate=.20+Math.random()*.05;s.confiscatedChifir=Math.min(Math.max(0,Math.floor(s.chifir)),Math.floor(Math.max(0,s.chifir)*jailRate));s.chifir=Math.max(0,s.chifir-s.confiscatedChifir);s.jailProtection=0;activeEvent=false;const o=$('modal-overlay');if(o){o.dataset.locked='0';o.classList.add('hidden')}msg('🚨 Ты загремел в карцер из-за своего буйного характера. Надзиратели нашли твой тайник и забрали '+fmt(s.confiscatedChifir)+' 🍵 чефира.');if(reason)msg(reason+' Отсидеть: 500 тапов.');ui();save()}
function checkAchievements(){let changed=false;Object.entries(ACHIEVEMENTS).forEach(([id,a])=>{if(!s.achievements[id]&&a.check()){s.achievements[id]={unlockedAt:Date.now()};changed=true;msg('🏆 Достижение разблокировано: '+a.title)}});return changed}
function tasksCheck(){if(!s.tasks)return;const storyChanged=checkStoryProgress();let changed=storyChanged;Object.entries(TASKS).forEach(([id,t])=>{if(!s.completed[id]&&t.get()>=t.target){s.completed[id]={completedAt:Date.now()};const reward=t.reward;if(t.rewardType==='points')s.points+=t.rewardAmount;else s.chifir+=t.rewardAmount;s.tasks.completedCount=(s.tasks.completedCount||0)+1;reduceSentence(1,'выполнено поручение');msg('🎯 Поручение выполнено: '+t.title+' · награда '+reward);changed=true}});if(checkAchievements())changed=true;if(changed){save();ui()}}
window.checkTasks=tasksCheck;
window.getGameState=()=>s;\nwindow.getStoryState=()=>STORY.map((x,i)=>({...x,unlocked:!!(s.storySeen&&s.storySeen[i])}));
function tap(e){tickSentence(Date.now());if(s.jailed){jailTap(e);return}if(activeEvent)return;e&&e.preventDefault&&e.preventDefault();restoreEnergy(Date.now());if(s.energy<1){msg('⚡ Энергия закончилась. Отдохни или используй бонус.');return}s.energy--;s.totalTaps++;s.tasks.taps++;if(s.energy===s.maxEnergy-1)s.lastEnergyTime=Date.now();if(s.jailProtection>0)s.jailProtection--;const oldObject=s.currentObject;let g=TEST_MODE?TEST_POINTS_PER_TAP:s.power*O[s.currentObject][2];const c=Math.random()<s.critChance;if(c&&!TEST_MODE){g*=2;s.tasks.crit++}else if(c){s.tasks.crit++}if(s.boosters.double>0&&!TEST_MODE){g*=2;s.boosters.double--}s.chifir+=g;s.tasks.earned+=g;s.points+=g;const current=highestUnlocked();s.currentObject=current;if(oldObject!==s.currentObject){ui();}if(typeof window.refreshObjectVisuals==='function'){window.refreshObjectVisuals();}const t=$('tap-object');if(t){t.classList.remove('punch');void t.offsetWidth;t.classList.add('punch')}if(typeof window.animateObjectVisual==='function')window.animateObjectVisual();feedback(e,Math.floor(g),c);if(s.currentObject===4){s.authorityTaps=Math.max(0,Math.floor(s.authorityTaps||0))+1;if(s.authorityTaps>=50&&!c&&Math.random()<.18){s.authorityTaps=0;if(typeof window.startAuthorityDeal==='function')setTimeout(()=>window.startAuthorityDeal(),0);}}else{s.authorityTaps=0}if(s.currentObject===5&&!c&&Math.random()<.12)msg(FINAL_BREAKTHROUGH[Math.floor(Math.random()*FINAL_BREAKTHROUGH.length)]);syncObject(false);if(oldObject!==s.currentObject){msg('🏆 Новая масть: '+R[s.currentObject][0]+' · новый этап: '+O[s.currentObject][0]);ui();}if(Math.random()<.025)msg(FUN[Math.floor(Math.random()*FUN.length)]);if(Math.random()<.10&&s.points-s.lastChoiceEvent>30)openEvent();tasksCheck();ui();save()}
function openModal(h,locked=false){if(s.jailed)return;const c=$('modal-content'),o=$('modal-overlay');if(!c||!o)return;c.innerHTML=h;o.classList.remove('hidden');o.dataset.locked=locked?'1':'0'}
function closeModal(){const o=$('modal-overlay');if(!o)return;if(o.dataset.locked==='1')return;o.classList.add('hidden')}
function finishEvent(){activeEvent=false;const o=$('modal-overlay');if(o)o.dataset.locked='0';closeModal();tasksCheck();ui();save()}
function openEvent(){
  if(s.jailed||activeEvent)return;
  const stage=Math.max(0,Number(s.currentObject)||0);
  const available=EVENTS.filter(e=>stage>=Number(e[3]||0));
  if(!available.length)return;
  activeEvent=true;
  const v=available[Math.floor(Math.random()*available.length)];
  let h='<h2>⚠️ '+v[0]+'</h2><p>'+v[1]+'</p><p><b>Ситуация меняется — решай быстро:</b></p><div class="choices">';
  v[2].forEach((c,i)=>h+='<button type="button" class="choice" data-i="'+i+'">'+c[0]+'</button>');
  openModal(h+'</div>',true);
  document.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    if(!activeEvent||s.jailed)return;
    const c=v[2][Number(b.dataset.i)];
    s.tasks.events++;
    s.lastChoiceEvent=s.points;
    if(Math.random()<c[1]){
      s.chifir+=c[2];
      s.tasks.earned+=c[2];
      s.points+=c[3];
      s.respect=Math.max(0,(s.respect||0)+Number(c[4]||0));
      const bonus=c[4]?(' · уважение '+(c[4]>0?'+':'')+c[4]):'';
      choiceResult('Удачно!  +'+c[2]+' 🍵  +'+c[3]+' ⭐'+bonus,true);
      finishEvent();
    }else{
      const loss=Math.max(3,Math.ceil(Math.max(1,c[3])*1.5));addSentence(c[1]>=.6?2:1,'провал события');
      s.points=Math.max(0,s.points-loss);
      if(c[1]>0&&s.jailProtection<=0&&Math.random()<.25){
        finishEvent();
        enterJail('❌ Рискованный ход провалился.');
      }else{
        choiceResult('Не повезло. Последствия уже чувствуются.',false);
        finishEvent();
      }
    }
  }));
}
function shop(){if(s.jailed){msg('🔒 Качалка закрыта до выхода из карцера');return}openModal('<div class="section-window shop-window"><div class="section-kicker">ПРОКАЧКА</div><h2>💪 Качалка</h2><p class="section-subtitle">Трать чефир на постоянные улучшения. Новые этапы открываются автоматически при смене масти ⭐.</p><div class="shop-grid"><button type="button" data-b="p">💪 <b>Сила</b><br><small>+1 сила</small><br>Цена '+(100+s.upgrades.power*250)+' 🍵</button><button type="button" data-b="c">🎯 <b>Крит</b><br><small>+2% к шансу</small><br>Цена '+(300+s.upgrades.crit*500)+' 🍵</button><button type="button" data-b="e">⚡ <b>Энергия</b><br><small>+25 максимум</small><br>Цена '+(400+s.upgrades.energyMax*700)+' 🍵</button><button type="button" data-b="d">🔥 <b>Ускоритель</b><br><small>×2 на 100 тапов</small><br>Цена 500 🍵</button></div></div>');document.querySelectorAll('[data-b]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.b,cost=type==='p'?100+s.upgrades.power*250:type==='c'?300+s.upgrades.crit*500:type==='e'?400+s.upgrades.energyMax*700:500;if(s.chifir<cost){msg('🍵 Не хватает чефира. Нужно '+cost+'.');return}s.chifir-=cost;if(type==='p'){s.power++;s.upgrades.power++}if(type==='c'){s.critChance=Math.min(.5,s.critChance+.02);s.upgrades.crit++}if(type==='e'){s.maxEnergy+=25;s.energy=s.maxEnergy;s.upgrades.energyMax++;s.lastEnergyTime=Date.now()}if(type==='d')s.boosters.double+=100;ui();save();shop()}))}
function rankMenu(){if(s.jailed)return;const r=rank(),next=R.find(x=>x[1]>s.points);let stage='Физическая прокачка';if(s.currentObject===4)stage='Дела и влияние';if(s.currentObject===5)stage='Финальный путь';openModal('<div class="section-window"><div class="section-kicker">ПРОГРЕСС</div><h2>🏆 Масть</h2><p>Твоя масть: <b>'+r[0]+'</b></p><p>Текущий этап: <b>'+O[s.currentObject][0]+'</b> · '+stage+'</p><p>Следующая ступень: '+(next?next[0]:'Максимальная масть')+(next?' · '+fmt(next[1])+' ⭐':'')+'</p></div>')}
function tasksMenu(){if(s.jailed)return;const cards=Object.entries(TASKS).map(([id,t])=>{const cur=Math.min(t.target,Math.floor(t.get())),done=!!s.completed[id];return '<div class="task-card '+(done?'task-done':'')+'"><div class="task-icon">'+(done?'✓':'🎯')+'</div><div class="task-body"><b>'+t.title+'</b><p>'+t.desc+'</p><div class="task-progress"><span style="width:'+Math.min(100,cur/t.target*100)+'%"></span></div><small>'+cur+' / '+t.target+' · Награда: <strong>'+t.reward+'</strong></small></div></div>'}).join('');openModal('<div class="section-window tasks-window"><div class="section-kicker">ЦЕЛИ НА СЕЙЧАС</div><h2>🎯 Поручения</h2><p class="section-subtitle">Выполняй простые цели и забирай награды. Здесь нет статистики ради статистики — каждое поручение даёт приз.</p><div class="tasks-list">'+cards+'</div><div class="tasks-footer">Выполнено поручений: <b>'+Object.keys(s.completed).length+'</b></div></div>')}
function more(){if(s.jailed)return;const ach=Object.entries(ACHIEVEMENTS).map(([id,a])=>{const done=!!s.achievements[id];return '<div class="achievement-card '+(done?'achievement-open':'achievement-locked')+'"><div class="achievement-icon">'+(done?a.icon:'🔒')+'</div><div><b>'+(done?a.title:'Скрытое достижение')+'</b><p>'+(done?a.desc:'Разблокируется только после выполнения условия.')+'</p></div></div>'}).join('');const total=Object.keys(ACHIEVEMENTS).length,unlocked=Object.keys(s.achievements||{}).filter(id=>ACHIEVEMENTS[id]).length;openModal('<div class="section-window barrack-window"><div class="section-kicker">ТВОЁ МЕСТО</div><h2>☰ Барак</h2><p class="section-subtitle">Здесь можно поговорить с персонажами и открыть достижения.</p><div class="achievement-summary"><b>Коллекция достижений</b><span>'+unlocked+' / '+total+' собрано</span></div><div class="barrack-achievements"><div class="section-mini-title">🏆 Достижения</div>'+ach+'</div><div class="prestige-card"><div><b>💎 Новый срок</b><p>После высшей масти можно начать новый срок, сохранив часть бонусов.</p></div><button type="button" class="prestige-btn" disabled>Скоро</button></div></div>')}function bind(){
  load();
  ui();
  let lastTouchInput=0;
  const delegatedTap=e=>{
    const area=e.target?.closest?.('#tap-area');
    if(!area)return;
    if(e.type==='pointerdown'&&Date.now()-lastTouchInput<700)return;
    if(e.type==='touchstart')lastTouchInput=Date.now();
    tap(e);
  };
  document.addEventListener('touchstart',delegatedTap,{capture:true,passive:false});
  document.addEventListener('pointerdown',delegatedTap,{capture:true,passive:false});
  $('btn-shop')?.addEventListener('click',shop);
  $('btn-rank')?.addEventListener('click',rankMenu);
  $('btn-tasks')?.addEventListener('click',tasksMenu);
  $('btn-more')?.addEventListener('click',more);
  $('modal-close')?.addEventListener('click',closeModal);
  setInterval(()=>{restoreEnergy(Date.now());ui();save()},1000)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
