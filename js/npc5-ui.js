'use strict';
(function(){
  const ID='avtoritet',SAVE_KEY='avtoritet_save_v2',USE_KEY='npc5_uses_v1';
  const RANK_POINTS=[0,500,2500,10000,40000,150000];
  const RANK_NAMES=['Салага','Пацан','Блатной','Смотрящий','Авторитет','Вор в законе'];
  const NPC={name:'Авторитет',icon:'👑',avatar:'./assets/backgrounds/avtoritet_avatar.png',desc:'старший',rank:4,baseChance:78};
  const TASKS=[
    ['Проверь решение','Нужно оценить спокойный вариант перед общим разговором.','Проверить последствия','Согласиться сразу'],
    ['Разбери спор','Две стороны по-разному помнят договорённость.','Собрать обе версии','Выбрать первую версию'],
    ['Подготовь разговор','Старший хочет, чтобы разговор прошёл без лишнего шума.','Составить порядок разговора','Импровизировать'],
    ['Проверь человека','Новый знакомый просит доверия.','Проверить поступками','Поверить словам'],
    ['Найди компромисс','Два человека не хотят уступать.','Предложить взаимный вариант','Давить на одну сторону'],
    ['Сверь условия','В договорённости появились новые детали.','Перечитать всё','Принять на веру'],
    ['Передай решение','Нужно точно донести решение старшего.','Передать без изменений','Добавить своё мнение'],
    ['Проверь факты','Слишком много слухов вокруг одной истории.','Отделить факты от слухов','Выбрать громкую версию'],
    ['Подготовь встречу','Нужно выбрать спокойное время и место.','Продумать заранее','Собрать всех без подготовки'],
    ['Разрули очередь','Несколько человек спорят о порядке.','Распределить по договорённости','Выбрать знакомого'],
    ['Проверь обещание','Человек дал слово и должен его подтвердить.','Проверить результат','Верить обещанию'],
    ['Собери информацию','Нужны факты для принятия решения.','Проверить несколько источников','Довериться одному'],
    ['Закрой старый спор','Осталось выяснить последнюю деталь.','Выслушать каждого','Закончить разговор быстро'],
    ['Проверь порядок','Нужно убедиться, что договорённости соблюдаются.','Сверить всё по пунктам','Надеяться на порядок'],
    ['Подготовь запасной план','Основной вариант может измениться.','Продумать альтернативу','Идти без плана'],
    ['Помоги новичку','Новичок хочет доказать, что ему можно доверять.','Дать понятные правила','Оставить всё без объяснений'],
    ['Проведи итог','Нужно подвести итог после нескольких решений.','Собрать результаты','Оставить всё как есть'],
    ['Проверь договорённость','Кто-то утверждает, что условия изменились.','Сверить исходные условия','Верить словам'],
    ['Выбери порядок действий','Есть несколько спокойных вариантов.','Сравнить последствия','Выбрать первый'],
    ['Закрой дело','Последние детали нужно проверить и завершить.','Проверить всё ещё раз','Закончить как можно быстрее']
  ];

  let adBusy=false;

  function game(){try{return typeof window.getGameState==='function'?window.getGameState():JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch(e){return {}}}
  function save(s){try{s.saveUpdatedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch(e){}}
  function rank(){const s=game();let i=0;for(let j=0;j<RANK_POINTS.length;j++)if(Number(s.points||0)>=RANK_POINTS[j])i=j;return i}
  function uses(){try{const v=JSON.parse(localStorage.getItem(USE_KEY)||'{"used":0,"extra":0,"until":0}')||{};return {used:Math.max(0,Number(v.used)||0),extra:Math.max(0,Number(v.extra)||0),until:Number(v.until)||0}}catch(e){return {used:0,extra:0,until:0}}}
  function saveUses(v){try{localStorage.setItem(USE_KEY,JSON.stringify({used:Math.max(0,Number(v.used)||0),extra:Math.max(0,Number(v.extra)||0),until:Number(v.until)||0}))}catch(e){}}
  function msg(t){if(typeof window.msg==='function')window.msg(t)}
  function hero(){return '<div class="-hero"><img class="-hero-img" src="'+NPC.avatar+'" alt="Аватар '+NPC.name+'" loading="eager"><div class="-hero-gradient"></div><div class="-hero-title"><span>'+NPC.icon+'</span><b>'+NPC.name+'</b><small>'+NPC.desc+'</small></div></div>'}
  function open(){
    const s=game(),modal=document.getElementById('modal-content');
    if(!modal)return;
    if(s.jailed){msg('🔒 Сначала выйди из карцера');return}
    if(rank()<NPC.rank){msg('🔒 '+NPC.name+' пока не для твоей масти. Нужна масть «'+RANK_NAMES[NPC.rank]+'».');return}
    const u=uses();
    if(u.used>=3&&u.extra<=0){adOffer();return}
    modal.innerHTML=hero()+'<div class="-action-panel"><h2>'+NPC.icon+' '+NPC.name+'</h2><div class="-dialogue"><b>'+NPC.name+':</b><p>Есть серьёзное поручение. Решение за тобой.</p></div><button type="button" class="-primary" id="npc5-start">Получить поручение →</button><button type="button" id="npc5-back" style="width:100%;margin-top:8px">Вернуться к бараку</button></div>';
    document.getElementById('npc5-start').onclick=start;
    document.getElementById('npc5-back').onclick=back;
  }
  function start(){
    const u=uses();
    if(u.used>=3&&u.extra<=0){adOffer();return}
    const t=TASKS[Math.floor(Math.random()*TASKS.length)];
    const modal=document.getElementById('modal-content');
    modal.innerHTML=hero()+'<div class="-action-panel"><div class="-dialogue -question"><span class="-dialogue-label">'+NPC.name+'</span><h3>'+t[0]+'</h3><p>'+t[1]+'</p></div><div class="-choice-title">Выбери, как поступить.</div><div class="-choices"><button type="button" class="-choice" data-n5="0">«'+t[2]+'»</button><button type="button" class="-choice" data-n5="1">«'+t[3]+'»</button><button type="button" class="-choice" data-n5="2">«Сначала всё проверить.»</button></div><button type="button" id="npc5-back" style="width:100%;margin-top:8px">Назад</button></div>';
    modal.querySelectorAll('[data-n5]').forEach(b=>b.onclick=()=>result(t,Number(b.dataset.n5)));
    document.getElementById('npc5-back').onclick=open;
  }
  function result(t,index){
    const modal=document.getElementById('modal-content');
    const text=index===0?t[2]:index===1?t[3]:'Сначала всё проверить.';
    modal.innerHTML=hero()+'<div class="-action-panel"><div class="-dialogue"><span class="-dialogue-label">'+NPC.name+'</span><h3>'+t[0]+'</h3><p>Твой выбор: «'+text+'».</p></div><button type="button" class="-primary" id="npc5-confirm">Продолжить</button><button type="button" id="npc5-change" style="width:100%;margin-top:8px">Изменить ответ</button></div>';
    document.getElementById('npc5-confirm').onclick=()=>run(t,index);
    document.getElementById('npc5-change').onclick=start;
  }
  function run(t,index){
    const s=game();
    if(s.jailed){msg('🔒 Сначала выйди из карцера');return}
    let u=uses();
    if(u.used>=3&&u.extra<=0){adOffer();return}
    if(u.used<3)u.used++;else u.extra--;
    saveUses(u);
    const chance=NPC.baseChance+[12,-8,5][index];
    const success=Math.random()*100<chance;
    s.tasks=s.tasks||{};
    if(success){
      s.points=Number(s.points||0)+75;
      s.tasks.npcSuccess=(Number(s.tasks.npcSuccess)||0)+1;
      s.tasks.avtoritetSuccess=(Number(s.tasks.avtoritetSuccess)||0)+1;
      s.tasks.earned=(Number(s.tasks.earned)||0)+100;
      s.cigarettes=Number(s.cigarettes||0)+100;
      save(s);
      if(typeof window.ui==='function')window.ui();
      if(typeof window.checkTasks==='function')window.checkTasks();
      showResult('✅ '+NPC.name+': поручение выполнено. +100 🚬 и +75 ⭐.',true);
    }else{
      const cig=Math.min(Number(s.cigarettes||0),2500),points=Math.min(Number(s.points||0),1500);
      s.cigarettes=Math.max(0,Number(s.cigarettes||0)-cig);
      s.points=Math.max(0,Number(s.points||0)-points);
      save(s);
      if(typeof window.ui==='function')window.ui();
      showResult('❌ '+NPC.name+': поручение сорвалось. Потеряно 🚬 −'+cig+' и ⭐ −'+points+'.',false);
    }
  }
  function showResult(text,success){
    const modal=document.getElementById('modal-content'),u=uses();
    modal.innerHTML=hero()+'<div class="-action-panel"><div class="-result '+(success?'-success':'-fail')+'"><div class="-result-icon">'+(success?'✅':'❌')+'</div><p><b>'+text+'</b></p><small>Осталось обращений: '+Math.max(0,3-u.used)+(u.extra?' · бонусных: '+u.extra:'')+'</small></div><button type="button" class="-primary" id="npc5-again">Ещё раз поговорить</button><button type="button" id="npc5-back" style="width:100%;margin-top:8px">Вернуться к бараку</button></div>';
    document.getElementById('npc5-again').onclick=open;
    document.getElementById('npc5-back').onclick=back;
  }
  function adOffer(){
    if(adBusy)return;
    const modal=document.getElementById('modal-content');
    modal.innerHTML=hero()+'<div class="-action-panel"><h2>🎬 Ещё два дела</h2><p>'+NPC.icon+' '+NPC.name+' сейчас недоступен.</p><p>Посмотри рекламу и получи ещё <b>2 обращения</b>.</p><button type="button" class="-primary" id="npc5-ad">🎬 Посмотреть рекламу → +2</button><button type="button" id="npc5-back" style="width:100%;margin-top:8px">Вернуться к бараку</button></div>';
    document.getElementById('npc5-ad').onclick=()=>{
      if(adBusy)return;
      if(typeof window.showRewardedAd!=='function'){msg('📺 Реклама пока не подключена.');return}
      adBusy=true;
      const finish=function(rewarded){
        if(!adBusy)return;
        adBusy=false;
        if(rewarded===false){msg('📺 Награда не получена.');return}
        const u=uses();
        u.extra=(Number(u.extra)||0)+2;
        saveUses(u);
        open();
      };
      const started=window.showRewardedAd(finish);
      if(started===false)adBusy=false;
    };
    document.getElementById('npc5-back').onclick=back;
  }
  function back(){const b=document.getElementById('btn-more');if(b)b.click()}
  function add(){
    const list=document.querySelector('.npc-list');
    if(!list||list.querySelector('[data-open-npc5]'))return;
    const b=document.createElement('button');
    b.type='button';b.className='-link npc-link';b.dataset.openNpc5='1';
    b.innerHTML='<span>'+NPC.icon+'</span><b>'+NPC.name+'</b><small>'+NPC.desc+'</small>';
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open()});
    list.appendChild(b);
  }
  function init(){
    const root=document.getElementById('modal-content');
    if(root)new MutationObserver(()=>setTimeout(add,0)).observe(root,{childList:true,subtree:true});
    setTimeout(add,50);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
