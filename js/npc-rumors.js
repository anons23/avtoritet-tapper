/* npc-rumors v1.1 — слухи: шутки + отложенные крючки к квестам NPC */
'use strict';
(function(){
  var KEY='npcRumors';

  var FLAVOR=[
    'Вчера, говорят, нашего кума-надзирателя овчарка цапнула за штанину. 🤣 Теперь он на всех орёт вдвойне.',
    'На кухне снова «случайно» перепутали соль с стиральным порошком. Кто-то сегодня ужинает стоя.',
    'Шайба хвастался, что выиграл в карты три чайных пакета. К утру пакетов не было — зато синяк есть.',
    'Говорят, в ночной смене радио ловило шансон сквозь решётку. Даже надзиратель ногой в такт бил.',
    'Один салага пытался пронести конфеты в подшиве. Конфеты нашли. Подшиву тоже. Салагу — в карцер на разговор.',
    'В душевой якобы видели таракана размером с напёрсток. Три мужика одновременно «внезапно закончили мыться».',
    'Кум обещал «проверку на честность». Честными остались только те, кто спал.',
    'Кто-то подписал на стене «здесь был Вася». Васю нашли. Стену покрасили. Васю — нет.',
    'Передают: на прогулке ворона утянула у надзирателя фуражку. Ворону теперь уважают больше кума.',
    'В бараке спорили, что крепче — чай или чефир. Победил тот, кто не пил и молча забрал оба стакана.',
    'Говорят, крыса в кладовке организовала свой «общак». Люди завидуют.',
    'Ночью кто-то пел «Владимирский централ». Соседи просили на бис. Надзиратель — наоборот.'
  ];

  var HOOKS=[
    {id:'bugor_strelka',target:'bugor',unlockPoints:1500,flag:'rumor_bugor_strelka',
      text:'Вчера видели, как Бугор в качалке чуть не сцепился с другим зэком. Глядишь, кипеш назревает.',
      hint:'Просто слух с зоны. Если что — Бугор сам заговорит, когда будет дело.'},
    {id:'bugor_stash',target:'bugor',unlockPoints:1500,flag:'rumor_bugor_stash',
      text:'Шепчутся, Бугор прятал «тяжёлое» после прокачки. Ищет надёжного, кто придержит до завтра.',
      hint:'Слух есть. До Бугра дойдёт — сам скажет, если понадобишься.'},
    {id:'shaiba_trade',target:'shaiba',unlockPoints:0,flag:'rumor_shaiba_trade',
      text:'Шайба снова гоняет слухи про обмен в третьей хате. Кто принесёт ему имя — будет в плюсе.',
      hint:'Обычный базар. Шайба потом может сам зацепиться этой темой.'},
    {id:'kosoy_deal',target:'kosoy',unlockPoints:5000,flag:'rumor_kosoy_deal',
      text:'Косой ищет пару на тихую сделку. Говорит, наводка свежая, но без второго человека не полезет.',
      hint:'Пока просто слух. Косой сам откроет рот, если дозреет.'},
    {id:'smotr_order',target:'smotryashiy',unlockPoints:15000,flag:'rumor_smotr_order',
      text:'В бараке снова спор: двое готовы сцепиться. Смотрящий ищет, кто разрулит без шума.',
      hint:'По зоне шушукаются. Смотрящий сам решит, кого звать.'},
    {id:'avt_fact',target:'avtoritet',unlockPoints:50000,flag:'rumor_avt_fact',
      text:'Авторитету нужен не слух, а факт. Кто притащит проверенное — того запомнят.',
      hint:'Слух до Авторитета не обязан. Если позовёт — тогда и дело.'}
  ];

  var HOOK_SCENES=[
    {id:'hook_bugor_strelka',npc:'bugor',need:['rumor_bugor_strelka'],once:true,
      q:'Бугор хмурится: «Слышал, язык уже чешется по зоне. Сегодня могут подойти «поговорить». Прикроешь или опять мимо?»',
      choices:[
        {t:'Прикрою',ok:.8,pts:45,rep:2,memAdd:['bugor_helped','bugor_helped_strelka'],memClear:['rumor_bugor_strelka'],msg:'Бугор: «Вот. С такими и стоишь.»'},
        {t:'Не сегодня',ok:1,rep:0,memClear:['rumor_bugor_strelka'],msg:'Бугор: «Ясно. Тогда сам разберусь.»'},
        {t:'Слиться по-тихому',ok:.4,rep:-1,memAdd:['bugor_refused','bugor_refused_strelka'],memClear:['rumor_bugor_strelka'],msg:'Бугор смотрит тяжело: «И не подходи потом.»'}
      ]},
    {id:'hook_bugor_stash',npc:'bugor',need:['rumor_bugor_stash'],once:true,
      q:'Бугор тихо: «Есть одна вещь. Придержи до утра. Не для чужих глаз.»',
      choices:[
        {t:'Давай, спрячу',ok:.85,pts:50,rep:2,memAdd:['bugor_helped','bugor_helped_stash'],memClear:['rumor_bugor_stash'],msg:'Бугор кивает: «Ровно. Утром заберу.»'},
        {t:'Слишком горячо',ok:1,rep:0,memClear:['rumor_bugor_stash'],msg:'Бугор: «Тогда забудь, что слышал.»'},
        {t:'А что с меня?',ok:.7,pts:20,rep:1,chifir:15,memAdd:['bugor_helped_stash'],memClear:['rumor_bugor_stash'],msg:'Бугор кидает немного чефира: «За работу. И молчи.»'}
      ]},
    {id:'hook_shaiba_trade',npc:'shaiba',need:['rumor_shaiba_trade'],once:true,
      q:'Шайба: «Ты в курсе про третью хату? Мне нужно имя — кто меня там мусолит.»',
      choices:[
        {t:'Узнаю и скажу',ok:.8,pts:40,rep:2,memAdd:['shaiba_helped'],memClear:['rumor_shaiba_trade'],msg:'Шайба: «Только без шума.»'},
        {t:'Не мой разговор',ok:1,rep:0,memClear:['rumor_shaiba_trade'],msg:'Шайба: «Ладно, сам покопаю.»'},
        {t:'За 25 🍵 могу быстрее',ok:.75,chifir:-25,pts:55,rep:2,memAdd:['shaiba_helped'],memClear:['rumor_shaiba_trade'],msg:'Шайба платит уважением. Ты в плюсе.'}
      ]},
    {id:'hook_kosoy_deal',npc:'kosoy',need:['rumor_kosoy_deal'],once:true,
      q:'Косой: «Раз слух дошёл — можно говорить прямо. Впишешься в тихую сделку?»',
      choices:[
        {t:'Вписываюсь',ok:.75,pts:55,rep:2,memAdd:['kosoy_helped'],memClear:['rumor_kosoy_deal'],msg:'Косой: «Умно.»'},
        {t:'Только наводка, без сделки',ok:.8,pts:25,rep:1,memClear:['rumor_kosoy_deal'],msg:'Косой даёт короткую наводку.'},
        {t:'Не лезу',ok:1,rep:0,memClear:['rumor_kosoy_deal'],msg:'Косой: «Дело твоё.»'}
      ]},
    {id:'hook_smotr_order',npc:'smotryashiy',need:['rumor_smotr_order'],once:true,
      q:'Смотрящий: «Двое уже глазами едят друг друга. Разведи без шума.»',
      choices:[
        {t:'Разведу',ok:.8,pts:50,rep:2,memAdd:['smotryashiy_helped'],memClear:['rumor_smotr_order'],msg:'Смотрящий: «Сделано тихо — ценят.»'},
        {t:'Пусть сами',ok:1,rep:-1,memClear:['rumor_smotr_order'],msg:'Смотрящий: «Тогда не жалуйся.»'},
        {t:'Сначала поговорю с каждым',ok:.85,pts:40,rep:2,memAdd:['smotryashiy_helped'],memClear:['rumor_smotr_order'],msg:'Смотрящий одобряет.'}
      ]},
    {id:'hook_avt_fact',npc:'avtoritet',need:['rumor_avt_fact'],once:true,
      q:'Авторитет: «Мне не нужен базар. Нужен факт. Принесёшь — зачтётся.»',
      choices:[
        {t:'Принесу как есть',ok:.75,pts:70,rep:2,memAdd:['avtoritet_helped'],memClear:['rumor_avt_fact'],msg:'Авторитет: «Так и работай.»'},
        {t:'Слишком тонкий лёд',ok:1,rep:0,memClear:['rumor_avt_fact'],msg:'Авторитет: «Значит, не твоё.»'},
        {t:'Скажу, что слышал, без прикрас',ok:.8,pts:45,rep:1,memClear:['rumor_avt_fact'],msg:'Авторитет кивает.'}
      ]}
  ];

  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }

  function memStore(s){
    if(!s)return null;
    if(!s.npcMem||typeof s.npcMem!=='object') s.npcMem={flags:{},used:{}};
    if(!s.npcMem.flags) s.npcMem.flags={};
    if(!s.npcMem.used) s.npcMem.used={};
    return s.npcMem;
  }
  function rumorStore(s){
    if(!s)return null;
    if(!s[KEY]||typeof s[KEY]!=='object') s[KEY]={heard:[],lastFlavor:-1};
    if(!Array.isArray(s[KEY].heard)) s[KEY].heard=[];
    return s[KEY];
  }
  function points(){ var s=st(); return Number(s&&s.points)||0; }

  function isRumorClick(text){
    var t=String(text||'').toLowerCase();
    return /слух|наводк|кладовк|мутит|влияние|заплатить.*🍵|дать .*🍵|точное имя|рискнуть|расспросить|спросить напрям|кто мутит|свежий слух|редкого слуха|за слух/.test(t);
  }
  function isRefuse(text){
    return /отказ|не лезть|уйти|всё равно|сменить тему|не сейчас|неинтерес/.test(String(text||'').toLowerCase());
  }

  function pickFlavor(rs){
    var idx=Math.floor(Math.random()*FLAVOR.length);
    if(rs&&typeof rs.lastFlavor==='number'&&FLAVOR.length>1&&idx===rs.lastFlavor) idx=(idx+1)%FLAVOR.length;
    if(rs) rs.lastFlavor=idx;
    return FLAVOR[idx];
  }
  function pickHook(rs){
    var pts=points();
    var available=HOOKS.filter(function(h){
      if(pts<Number(h.unlockPoints||0))return false;
      var s=st(), mem=memStore(s);
      if(mem&&mem.flags&&mem.flags[h.flag])return false;
      if(rs&&rs.heard&&rs.heard.indexOf(h.id)>=0) return Math.random()<0.25;
      return true;
    });
    if(!available.length)return null;
    return available[Math.floor(Math.random()*available.length)];
  }
  function applyHookFlag(hook){
    var s=st(), mem=memStore(s), rs=rumorStore(s);
    if(!mem||!hook)return;
    mem.flags[hook.flag]=Date.now();
    // визиты ещё не считали
    mem.flags[hook.flag+'_visits']=0;
    if(rs.heard.indexOf(hook.id)<0) rs.heard.push(hook.id);
    if(rs.heard.length>20) rs.heard=rs.heard.slice(-20);
    save();
  }
  function buildRumorMessage(){
    var s=st(), rs=rumorStore(s), hook=null;
    if(Math.random()<0.45) hook=pickHook(rs);
    if(hook){
      applyHookFlag(hook);
      return '📢 Слух: '+hook.text+'\n\n'+hook.hint;
    }
    var flavor=pickFlavor(rs);
    save();
    return '📢 Слух: '+flavor;
  }
  function nameToId(name){
    return {'Шайба':'shaiba','Бугор':'bugor','Косой':'kosoy','Смотрящий':'smotryashiy','Авторитет':'avtoritet'}[name]||null;
  }

  function talkKey(flag){ return flag+'_visits'; }
  function noteVisit(npcId,s){
    var mem=memStore(s);
    if(!mem||!mem.flags)return;
    HOOKS.forEach(function(h){
      if(h.target!==npcId)return;
      if(!mem.flags[h.flag])return;
      var k=talkKey(h.flag);
      mem.flags[k]=(Number(mem.flags[k])||0)+1;
    });
    save();
  }

  /* НЕ сразу: шанс растёт с числом визитов после слуха */
  function pickHookScene(npcId,s){
    var mem=memStore(s);
    if(!mem)return null;
    for(var i=0;i<HOOK_SCENES.length;i++){
      var sc=HOOK_SCENES[i];
      if(sc.npc!==npcId)continue;
      if(sc.once&&mem.used&&mem.used[sc.id])continue;
      var need=sc.need||[], flag=null;
      for(var j=0;j<need.length;j++){
        if(mem.flags&&mem.flags[need[j]]){ flag=need[j]; break; }
      }
      if(!flag)continue;
      var visits=Number(mem.flags[talkKey(flag)])||0;
      var chance=0.08;
      if(visits>=4)chance=0.75;
      else if(visits>=3)chance=0.55;
      else if(visits>=2)chance=0.35;
      else if(visits>=1)chance=0.08;
      if(Math.random()>chance)continue;
      return sc;
    }
    return null;
  }

  function injectHookScene(){
    var content=document.getElementById('modal-content');
    if(!content||!content.querySelector('.npc-hero-title'))return;
    if(content.dataset.rumorHook==='1')return;
    if(content.dataset.memInjected==='1')return;
    var nameEl=content.querySelector('.npc-hero-title b');
    if(!nameEl)return;
    var npcId=nameToId(nameEl.textContent.trim());
    if(!npcId)return;
    var s=st();
    if(content.dataset.rumorVisit!=='1'){
      content.dataset.rumorVisit='1';
      noteVisit(npcId,s);
    }
    var scene=pickHookScene(npcId,s);
    if(!scene)return;

    var dlg=content.querySelector('.npc-dialogue p');
    var title=content.querySelector('.npc-choice-title');
    var panel=content.querySelector('.npc-action-panel');
    if(!dlg||!panel)return;
    content.dataset.rumorHook='1';
    dlg.textContent=scene.q;
    panel.querySelectorAll('.npc-choice').forEach(function(b){b.remove();});
    var insertAfter=title||dlg;
    scene.choices.forEach(function(c){
      var b=document.createElement('button');
      b.type='button'; b.className='npc-choice'; b.textContent=c.t;
      b.addEventListener('click',function(ev){
        ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
        resolveHookChoice(npcId, scene, c);
      });
      if(insertAfter.nextSibling) panel.insertBefore(b, insertAfter.nextSibling);
      else panel.appendChild(b);
      insertAfter=b;
    });
  }

  function resolveHookChoice(npcId, scene, choice){
    var s=st(); if(!s)return;
    var mem=memStore(s);
    if(mem){
      mem.used=mem.used||{};
      mem.used[scene.id]=Date.now();
      if(choice.memClear) choice.memClear.forEach(function(t){ delete mem.flags[t]; delete mem.flags[t+'_visits']; });
      if(choice.memAdd) choice.memAdd.forEach(function(t){ mem.flags[t]=Date.now(); });
    }
    var ok=Math.random()<Math.max(0,Math.min(1,Number(choice.ok)||1));
    var text=choice.msg||'…';
    if(ok){
      if(choice.pts) s.points=(Number(s.points)||0)+Number(choice.pts);
      if(choice.chifir) s.chifir=(Number(s.chifir)||0)+Number(choice.chifir);
      if(choice.rep){
        s.npcRelations=s.npcRelations||{};
        var x=s.npcRelations[npcId]||{rep:0,helped:0,failed:0,betrayed:0,saved:0};
        x.rep=Math.max(0,Math.min(60,(Number(x.rep)||0)+Number(choice.rep)));
        if(choice.rep>0)x.helped=(x.helped||0)+1;
        s.npcRelations[npcId]=x;
      }
      s.tasks=s.tasks||{};
      s.tasks.npcSuccess=(Number(s.tasks.npcSuccess)||0)+1;
    }else text='Не вышло. '+(choice.failMsg||text);
    save();
    try{ if(typeof window.ui==='function') window.ui(); }catch(e){}
    var content=document.getElementById('modal-content');
    if(!content)return;
    var nameMap={shaiba:'Шайба',bugor:'Бугор',kosoy:'Косой',smotryashiy:'Смотрящий',avtoritet:'Авторитет'};
    var roleMap={shaiba:'Сокамерник',bugor:'Тренер',kosoy:'Торговец слухами',smotryashiy:'Порядок в бараке',avtoritet:'Старый волк'};
    var avMap={shaiba:'shaiba_avatar.webp',bugor:'Bugor_avatar.webp',kosoy:'Kosoy_avatar.webp',smotryashiy:'Smotraishia_avatar.webp',avtoritet:'avtoritet_avatar.webp'};
    content.innerHTML='<div class="npc-hero"><img class="npc-hero-img" src="./assets/backgrounds/'+(avMap[npcId]||'shaiba_avatar.webp')+'" alt="">'+
      '<div class="npc-hero-title"><b>'+(nameMap[npcId]||'')+'</b><small>'+(roleMap[npcId]||'')+'</small></div></div>'+
      '<div class="npc-action-panel"><div class="npc-dialogue npc-dialogue-response"><p>'+text+'</p></div>'+
      '<button type="button" class="npc-primary" id="rumor-back">← К списку</button></div>';
    var back=document.getElementById('rumor-back');
    if(back) back.onclick=function(){ if(typeof window.openBarrack==='function') window.openBarrack(); };
  }

  function onRumorChoice(btn){
    var text=btn.textContent||'';
    if(!isRumorClick(text)||isRefuse(text))return;
    var rumor=buildRumorMessage();
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      var p=document.querySelector('.npc-dialogue-response p');
      if(p){
        clearInterval(timer);
        var base=p.textContent||'';
        if(/слух|наводк|шепч|рассказ/i.test(base)||base.length<80) p.textContent=rumor;
        else p.textContent=base+'\n\n'+rumor;
        p.style.whiteSpace='pre-wrap';
      }else if(tries>25) clearInterval(timer);
    },40);
  }

  function boot(){
    document.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest&&e.target.closest('.npc-choice');
      if(!btn)return;
      onRumorChoice(btn);
    },true);
    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.rumorObs){
      overlay.dataset.rumorObs='1';
      new MutationObserver(function(){ setTimeout(injectHookScene,35); }).observe(overlay,{childList:true,subtree:true});
    }
    console.log('[npc-rumors] v1.1 delayed hooks');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
