/* АВТОРИТЕТ 2.0 — стабильная версия (anim trigger unified) */
'use strict';
const TEST_MODE=true;
const TEST_POINTS_PER_TAP=500;
const N=['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник','Криворукий','Недомерок','Каштан','Мятый','Забытый','Ходячая Ошибка','Кривой Прицел','Потеряшка','Мелкий Косяк','Батон','Вечный Новенький','Шмоня','Картонный Боец','Голова-Кирпич','Тихий Пельмень','Сбитый Прицел','Герой Очереди','Местный Балбес','Почти Пацан','Не Суетись'];
const R=[['Салага',0],['Пацан',1500],['Блатной',5000],['Смотрящий',15000],['Авторитет',50000]];
const O=[['Груша','🥊',1,0],['Сокамерник','👊',1.3,1500],['Отжимания','💪',1.6,5000],['Тренажёр','🏋️',2.2,15000],['Разборка','🗣️',3.2,50000]];
const AUTHORITY_DEALS=[['📋 Дело барака','Спор из-за места улажен.'],['📦 Распределение','Проблему с передачей припасов решили.'],['🗣️ Разговор','Конфликт между заключёнными прекращён.'],['⚖️ Решение','Спор решён без лишнего шума.'],['🤝 Договорённость','Стороны пришли к общему решению.']];
const EVENTS=[];
const FUN=['Надзиратель идёт... сделай умный вид.'];
const TASKS={taps10000:{title:'Первые 10 000 тапов',desc:'Сделай 10 000 обычных тапов.',target:10000,rewardAmount:500,rewardType:'chifir',reward:'500 🍵',get:()=>s.tasks.taps},bugor10:{title:'Десять тренировок',desc:'Успешно пройди 10 тренировок с Бугром.',target:10,rewardAmount:750,rewardType:'chifir',reward:'750 🍵',get:()=>s.tasks.bugorSuccess||0},crit100:{title:'Точный удар',desc:'Сделай 100 критических тапов.',target:100,rewardAmount:1000,rewardType:'chifir',reward:'1000 🍵',get:()=>s.tasks.crit},earned100k:{title:'Запас на чёрный день',desc:'Заработай 100 000 🍵 тапами и делами.',target:100000,rewardAmount:5000,rewardType:'chifir',reward:'5000 🍵',get:()=>Math.floor(s.tasks.earned||0)},tasks25:{title:'Опытный порученец',desc:'Успешно выполни 25 поручений.',target:25,rewardAmount:1500,rewardType:'points',reward:'1500 ⭐',get:()=>s.tasks.npcSuccess||0}};
const STORY=[];
const ACHIEVEMENTS={};
const SENTENCE_MINUTES_PER_DAY=24*60;
let s={chifir:0,points:0,energy:250,maxEnergy:250,power:1,critChance:.05,respect:0,wealth:0,nickname:'',currentObject:0,prestige:0,upgrades:{power:0,crit:0,energyMax:0},boosters:{double:0},tasks:{taps:0,crit:0,events:0,earned:0,jail:0,bugorSuccess:0,npcSuccess:0},completed:{},achievements:{},storySeen:{},lastEnergyTime:Date.now(),saveUpdatedAt:Date.now(),lastChoiceEvent:0,totalTaps:0,jailed:false,jailTaps:0,jailRequired:500,confiscatedChifir:0,jailProtection:0,authorityTaps:0,energyRepairVersion:0,sentenceDays:100,servedSentenceMinutes:0,lastSentenceTick:Date.now(),sentenceReleaseCount:0};
let messageQueue=[],messageBusy=false,activeEvent=false;
const $=id=>document.getElementById(id);
function trustedSaveTime(){try{if(window.ysdk&&typeof window.ysdk.serverTime==='function'){const t=Number(window.ysdk.serverTime());if(Number.isFinite(t)&&t>0)return t}}catch(e){}return Date.now()}
function nextSaveTimestamp(){const t=trustedSaveTime();try{const prev=Number(localStorage.getItem('avt_save_clock')||0);const next=Math.max(t,(Number.isFinite(prev)?prev:0)+1);localStorage.setItem('avt_save_clock',String(next));return next}catch(e){return t}}
function sentenceRemaining(){const total=Number(s.sentenceDays);if(!Number.isFinite(total)||total<=0)return 0;return Math.max(0,Math.ceil(total-Number(s.servedSentenceMinutes||0)/SENTENCE_MINUTES_PER_DAY))}
function addSentence(days,reason){days=Math.max(0,Math.floor(Number(days)||0));if(!days)return;const currentSentence=Number(s.sentenceDays||0);const base=currentSentence<=0?100:currentSentence;s.sentenceDays=base+days;if(currentSentence<=0)s.servedSentenceMinutes=0;s.lastSentenceTick=Date.now();if(typeof msg==='function')msg('⛓️ Срок +'+days+(reason?' · '+reason:''));if(typeof ui==='function')ui();if(typeof saveNow==='function')saveNow()}
function reduceSentence(days,reason){days=Math.max(0,Math.floor(Number(days)||0));if(!days)return;const before=Number(s.sentenceDays);if(!Number.isFinite(before)||before<=0)return;s.sentenceDays=Math.max(0,before-days);if(typeof msg==='function')msg('⏳ Срок -'+days);if(typeof ui==='function')ui();if(typeof saveNow==='function')saveNow()}
function checkSentenceRelease(){const total=Number(s.sentenceDays);if(!Number.isFinite(total)||total<=0)return false;if(Number(s.servedSentenceMinutes||0)+0.0001<total*SENTENCE_MINUTES_PER_DAY)return false;if(s.jailed)return false;s.sentenceReleaseCount=(Number(s.sentenceReleaseCount)||0)+1;s.sentenceDays=0;s.servedSentenceMinutes=0;s.lastSentenceTick=Date.now();if(typeof msg==='function')msg('🎉 СРОК ОТБЫТ!');return true}
window.addSentence=addSentence;window.reduceSentence=reduceSentence;
function tickSentence(now){if(s.jailed||typeof document==='undefined'||document.visibilityState!=='visible'){s.lastSentenceTick=now;return false}const total=Number(s.sentenceDays);if(!Number.isFinite(total)||total<=0){s.lastSentenceTick=now;return false}if(!Number.isFinite(s.lastSentenceTick))s.lastSentenceTick=now;const elapsed=Math.max(0,Math.min(now-s.lastSentenceTick,60000));s.lastSentenceTick=now;if(elapsed<=0)return false;s.servedSentenceMinutes=Math.min(total*SENTENCE_MINUTES_PER_DAY,Number(s.servedSentenceMinutes||0)+elapsed/60000);return checkSentenceRelease()}
let localSaveTimer=null;
const LOCAL_SAVE_DEBOUNCE=1500;
const LOCAL_SAVE_BACKUP=15000;
