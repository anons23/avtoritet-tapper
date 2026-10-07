/* npc-memory v1.0 — память ответов + слухи/похвала между NPC */
'use strict';
(function(){
  var KEY='npcMem';

  /* Флаги, которые ставятся по смыслу ответа (эвристика по тексту кнопки) */
  function inferTags(npcId, choiceText, ok){
    var t=String(choiceText||'').toLowerCase();
    var tags=[];
    var helpish=/помог|пойд|впишус|соглас|сделаю|принесу|узнаю|провед|оставлю|схрон|спряч|провер|раскопа|останов|передам|возьму|прикры|вмест|со мной|да, я|готов/i.test(t);
    var refuse=/отказ|не сейчас|не пойду|не лезть|не вмеш|уйти|слить|неинтерес|промолч|сменить тему|всё равно|не боюсь|без геройства|не сегодня|не надо|не хочу/i.test(t);
    var strelka=/стрел|разговор|бык|подстав|схрон|обмен|наводк|дело|сделк|шмон|сообщен/i.test(t);

    if(strelka||helpish||refuse){
      if(refuse){
        tags.push(npcId+'_refused');
        if(/стрел|разговор|бык|подстав/.test(t)) tags.push(npcId+'_refused_strelka');
        if(/схрон|спрят/.test(t)) tags.push(npcId+'_refused_stash');
        if(/помог|просьб|сдела|провед|узна/.test(t)) tags.push(npcId+'_refused_help');
      }else if(helpish && ok){
        tags.push(npcId+'_helped');
        if(/стрел|разговор|бык/.test(t)) tags.push(npcId+'_helped_strelka');
        if(/схрон|спрят/.test(t)) tags.push(npcId+'_helped_stash');
        if(/наводк|слух|информац/.test(t)) tags.push(npcId+'_helped_info');
      }else if(helpish && !ok){
        tags.push(npcId+'_failed_help');
      }
    }
    // явные «оправдания» в ответах на слухи — снимаем остроту
    if(/приболел|заболел|не смог|обстоятельства/.test(t)) tags.push('excuse_sick');
    if(/быканул|сам начал|сам виноват/.test(t)) tags.push('excuse_blame');
    if(/сыкат|страшно|чесно|честно/.test(t)) tags.push('excuse_scared');
    return tags;
  }

  /* Сцены памяти: same-NPC и cross-NPC */
  var SCENES=[
    /* —— Бугор помнит отказ —— */
    {
      id:'bugor_remembers_refuse',
      npc:'bugor',
      need:['bugor_refused','bugor_refused_strelka','bugor_refused_help'],
      needAny:true,
      once:true,
      q:'Бугор смотрит тяжело: «Сегодня стрелка будет. Надеюсь, ты не кинешь меня, как в прошлый раз?»',
      choices:[
        {t:'В этот раз я с тобой',ok:.8,pts:40,rep:2,memClear:['bugor_refused','bugor_refused_strelka','bugor_refused_help'],memAdd:['bugor_helped_strelka','bugor_helped'],msg:'Бугор кивает: «Вот так и надо. Забыл прошлый раз — смотри не подведи.»'},
        {t:'Давай без меня, у меня свои дела',ok:1,rep:-1,memAdd:['bugor_refused_again'],msg:'Бугор цедит: «Ясно. Тогда и не подходи, когда прижмёт.»'},
        {t:'Я тогда не смог — объясню',ok:.7,pts:15,rep:1,msg:'Бугор слушает. Не до конца доволен, но злость чуть спадает.'}
      ]
    },
    /* —— Косой сплетничает про отказ Бугру —— */
    {
      id:'kosoy_gossip_bugor_refuse',
      npc:'kosoy',
      need:['bugor_refused','bugor_refused_strelka','bugor_refused_help'],
      needAny:true,
      once:true,
      q:'Косой щурится: «Птичка нашептала, что ты Бугра кинул и не пошёл с ним. Даже не знаю, стоит ли тебе теперь доверять…»',
      choices:[
        {t:'Да я приболел в тот день',ok:.75,pts:20,rep:1,memAdd:['excuse_sick','kosoy_heard_excuse'],msg:'Косой хмыкает: «Болезнь — удобная штука. Ладно, пока верю на слово.»'},
        {t:'Бугор сам быканул на них',ok:.55,pts:10,rep:0,memAdd:['excuse_blame'],msg:'Косой: «Свалить на Бугра легко. Смотри, чтоб это к тебе же не вернулось.»'},
        {t:'Честно — сыкатно было',ok:.8,pts:25,rep:1,memAdd:['excuse_scared'],msg:'Косой кивает: «Хоть не врёшь. За честность плюс. За трусость — сами разберётесь.»'}
      ]
    },
    /* —— Шайба слышал про отказ —— */
    {
      id:'shaiba_gossip_bugor_refuse',
      npc:'shaiba',
      need:['bugor_refused','bugor_refused_strelka'],
      needAny:true,
      once:true,
      q:'Шайба тихо: «Говорят, Бугор злится. Ты якобы не прикрыл его. Это правда?»',
      choices:[
        {t:'Не всё так было',ok:.7,pts:15,rep:1,msg:'Шайба: «Ну-ну. Главное — чтоб слух дальше не пошёл.»'},
        {t:'Да, не пошёл. Не суйся',ok:1,rep:0,msg:'Шайба поднимает руки: «Я только спросил.»'},
        {t:'Передай, что я ещё подойду',ok:.8,pts:20,rep:1,memAdd:['bugor_will_make_up'],msg:'Шайба: «Передам. Лучше бы тебе и правда подойти.»'}
      ]
    },
    /* —— Смотрящий хвалит за помощь Бугру / схрон —— */
    {
      id:'smotr_praise_bugor_help',
      npc:'smotryashiy',
      need:['bugor_helped','bugor_helped_strelka','bugor_helped_stash'],
      needAny:true,
      once:true,
      q:'Смотрящий коротко кивает: «Бугор сказал, ты помог ему схрон сныкать. Ровный поступок. Теперь и я попрошу: спрячь одну вещь на время. Ты пацан правильный.»',
      choices:[
        {t:'Хорошо, спрячу',ok:.85,pts:50,rep:2,chifir:0,memAdd:['smotr_helped_stash','smotryashiy_helped'],msg:'Смотрящий: «Тихо и без разговоров. Я это запомню.»'},
        {t:'Сейчас не могу',ok:1,rep:0,msg:'Смотрящий: «Тогда потом. Но слово я уже дал, что ты надёжный.»'},
        {t:'Слиться — пусть другой',ok:.4,rep:-1,memAdd:['smotr_refused_stash'],msg:'Смотрящий холодеет: «Слова и дела у тебя расходятся. Учту.»'}
      ]
    },
    /* —— Авторитет про помощь Смотрящему —— */
    {
      id:'avt_praise_smotr',
      npc:'avtoritet',
      need:['smotr_helped_stash','smotryashiy_helped'],
      needAny:true,
      once:true,
      q:'Авторитет неторопливо: «Смотрящий отозвался о тебе хорошо. Редко кто держит слово. Не подведи и меня, если попрошу.»',
      choices:[
        {t:'Можешь рассчитывать',ok:.8,pts:60,rep:2,msg:'Авторитет: «Увидим по делам, не по языку.»'},
        {t:'Я просто делал своё',ok:.9,pts:30,rep:1,msg:'Авторитет чуть кивает: «Скромность — тоже монета.»'},
        {t:'Не люблю чужие просьбы',ok:1,rep:0,msg:'Авторитет: «Тогда и не жди чужой помощи.»'}
      ]
    },
    /* —— Косой хвалит за помощь с информацией —— */
    {
      id:'kosoy_praise_info',
      npc:'kosoy',
      need:['shaiba_helped','shaiba_helped_info','kosoy_helped'],
      needAny:true,
      once:true,
      q:'Косой: «Слышал, ты Шайбе/мне не соврал по делу. С такими можно делиться наводками. Есть ещё одна…»',
      choices:[
        {t:'Давай наводку',ok:.7,pts:35,rep:1,msg:'Косой шепчет коротко. Информация может пригодиться.'},
        {t:'Потом, не сейчас',ok:1,rep:0,msg:'Косой: «Как скажешь. Наводка остывает быстро.»'},
        {t:'Не хочу в это лезть',ok:1,rep:0,msg:'Косой пожимает плечами.'}
      ]
    },
    /* —— Бугор помнит помощь —— */
    {
      id:'bugor_remembers_help',
      npc:'bugor',
      need:['bugor_helped','bugor_helped_strelka'],
      needAny:true,
      once:true,
      q:'Бугор хлопает по плечу: «В прошлый раз ты не слился. Сегодня снова могу взять тебя. Идёшь?»',
      choices:[
        {t:'Иду',ok:.85,pts:45,rep:2,power:0,memAdd:['bugor_helped_strelka'],msg:'Бугор: «Вот. С такими и стоишь рядом.»'},
        {t:'В этот раз пас',ok:1,rep:0,msg:'Бугор: «Ладно. Кредит доверия ещё есть.»'},
        {t:'Только если без лишнего риска',ok:.75,pts:25,rep:1,msg:'Бугор хмыкает: «Осторожность — тоже сила.»'}
      ]
    },
    /* —— Смотрящий про повторный отказ —— */
    {
      id:'smotr_about_bugor_refuse',
      npc:'smotryashiy',
      need:['bugor_refused_again'],
      once:true,
      q:'Смотрящий: «Бугор больше не считает тебя своим. В бараке это быстро разносится. Будешь исправлять — или так и останешься?»',
      choices:[
        {t:'Исправлю делом',ok:.7,pts:30,rep:1,memClear:['bugor_refused_again'],msg:'Смотрящий: «Тогда не тяни. Слова тут дешёвые.»'},
        {t:'Меня это не парит',ok:1,rep:-1,msg:'Смотрящий: «Как хочешь. Потом не удивляйся.»'},
        {t:'Это личное между нами',ok:.6,pts:10,rep:0,msg:'Смотрящий: «Личное быстро становится общим.»'}
      ]
    }
  ];

  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }

  function store(s){
    if(!s)return null;
    if(!s[KEY]||typeof s[KEY]!=='object') s[KEY]={flags:{},used:{},pending:null};
    if(!s[KEY].flags) s[KEY].flags={};
    if(!s[KEY].used) s[KEY].used={};
    return s[KEY];
  }

  function hasFlag(mem, tag){ return !!(mem&&mem.flags&&mem.flags[tag]); }
  function addFlags(mem, tags){
    if(!mem||!tags)return;
    tags.forEach(function(t){ if(t) mem.flags[t]=Date.now(); });
  }
  function clearFlags(mem, tags){
    if(!mem||!tags)return;
    tags.forEach(function(t){ if(t&&mem.flags) delete mem.flags[t]; });
  }

  function sceneReady(scene, mem){
    if(!scene||!mem)return false;
    if(scene.once&&mem.used[scene.id])return false;
    var need=scene.need||[];
    if(!need.length)return false;
    if(scene.needAny){
      return need.some(function(t){return hasFlag(mem,t);});
    }
    return need.every(function(t){return hasFlag(mem,t);});
  }

  function pickScene(npcId, s){
    var mem=store(s);
    if(!mem)return null;
    for(var i=0;i<SCENES.length;i++){
      var sc=SCENES[i];
      if(sc.npc!==npcId)continue;
      if(sceneReady(sc, mem)) return sc;
    }
    return null;
  }

  function recordChoice(npcId, choiceText, ok, choiceObj){
    var s=st();
    var mem=store(s);
    if(!mem)return;
    var tags=inferTags(npcId, choiceText, ok);
    // явные метки с кнопки сцены памяти
    if(choiceObj&&Array.isArray(choiceObj.memAdd)) tags=tags.concat(choiceObj.memAdd);
    if(choiceObj&&Array.isArray(choiceObj.memClear)) clearFlags(mem, choiceObj.memClear);
    addFlags(mem, tags);
    save();
  }

  function markSceneUsed(sceneId){
    var s=st();
    var mem=store(s);
    if(!mem||!sceneId)return;
    mem.used[sceneId]=Date.now();
    save();
  }

  /* ===== Hook into npc-barrack UI ===== */
  var pendingMemory=null; // {npcId, scene}

  function bindChoiceCapture(){
    document.addEventListener('click', function(e){
      var btn=e.target&&e.target.closest&&e.target.closest('.npc-choice');
      if(!btn)return;
      var panel=btn.closest('.npc-action-panel');
      if(!panel)return;
      var title=panel.parentNode&&panel.parentNode.querySelector('.npc-hero-title b');
      var name=title?title.textContent.trim():'';
      var npcId=nameToId(name);
      if(!npcId)return;
      // результат ok/fail узнаем чуть позже по тексту ответа — ставим предварительный тег
      btn.dataset.npcMemId=npcId;
      btn.dataset.npcMemText=btn.textContent||'';
      // если это сцена памяти — пометить used при клике
      if(pendingMemory&&pendingMemory.npcId===npcId&&pendingMemory.scene){
        markSceneUsed(pendingMemory.scene.id);
      }
      // запись флагов после короткой задержки (когда уже ясен исход в resolveLine)
      var text=btn.textContent||'';
      setTimeout(function(){
        // если в ответе есть негатив — считаем fail
        var resp=document.querySelector('.npc-dialogue-response p');
        var rtxt=resp?resp.textContent||'':'';
        var ok=!/не вышло|не удалось|провал|обернулось|не пошло|потерял|наезд/i.test(rtxt);
        // для памяти «отказа» ok не важен — важен сам выбор
        recordChoice(npcId, text, ok, null);
        // memAdd from pending scene choice
        if(pendingMemory&&pendingMemory.scene){
          var ch=null;
          (pendingMemory.scene.choices||[]).forEach(function(c){
            if(c.t===text) ch=c;
          });
          if(ch) recordChoice(npcId, text, ok, ch);
        }
        pendingMemory=null;
      }, 80);
    }, true);
  }

  function nameToId(name){
    var map={ 'Шайба':'shaiba','Бугор':'bugor','Косой':'kosoy','Смотрящий':'smotryashiy','Авторитет':'avtoritet' };
    return map[name]||null;
  }

  function injectMemoryRound(){
    var content=document.getElementById('modal-content');
    if(!content)return;
    if(!content.querySelector('.npc-hero-title'))return;
    if(content.dataset.memInjected==='1')return;
    var nameEl=content.querySelector('.npc-hero-title b');
    if(!nameEl)return;
    var npcId=nameToId(nameEl.textContent.trim());
    if(!npcId)return;
    var s=st();
    var scene=pickScene(npcId, s);
    if(!scene)return;

    // Заменяем текст вопроса и кнопки на сцену памяти
    var dlg=content.querySelector('.npc-dialogue p');
    var title=content.querySelector('.npc-choice-title');
    var panel=content.querySelector('.npc-action-panel');
    if(!dlg||!panel)return;

    content.dataset.memInjected='1';
    pendingMemory={npcId:npcId, scene:scene};
    dlg.textContent=scene.q;

    // убрать старые choice buttons
    panel.querySelectorAll('.npc-choice').forEach(function(b){ b.remove(); });
    var insertAfter=title||dlg;
    scene.choices.forEach(function(c,i){
      var b=document.createElement('button');
      b.type='button';
      b.className='npc-choice';
      b.setAttribute('data-choice', String(i));
      b.setAttribute('data-mem-scene', scene.id);
      b.textContent=c.t;
      // свой обработчик: показать ответ сцены без штатного resolve (он ждёт index из npc.dialogs)
      b.addEventListener('click', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        applyMemoryChoice(npcId, scene, c);
      });
      if(insertAfter.nextSibling) panel.insertBefore(b, insertAfter.nextSibling);
      else panel.appendChild(b);
      insertAfter=b;
    });
  }

  function applyMemoryChoice(npcId, scene, choice){
    var s=st();
    if(!s)return;
    var mem=store(s);
    markSceneUsed(scene.id);
    if(choice.memClear) clearFlags(mem, choice.memClear);
    if(choice.memAdd) addFlags(mem, choice.memAdd);
    // также эвристика
    addFlags(mem, inferTags(npcId, choice.t, true));

    var ok=Math.random()<Math.max(0,Math.min(1,Number(choice.ok)||1));
    var text=choice.msg||'…';
    if(ok){
      if(choice.pts) s.points=(Number(s.points)||0)+Number(choice.pts);
      if(choice.chifir) s.chifir=(Number(s.chifir)||0)+Number(choice.chifir);
      if(choice.rep&&typeof window!=='undefined'){
        // мягко трогаем npcRelations если есть
        try{
          s.npcRelations=s.npcRelations||{};
          var x=s.npcRelations[npcId]||{rep:0,helped:0,failed:0,betrayed:0,saved:0};
          x.rep=Math.max(0,Math.min(60,(Number(x.rep)||0)+Number(choice.rep)));
          if(choice.rep>0)x.helped=(Number(x.helped)||0)+1;
          if(choice.rep<0)x.failed=(Number(x.failed)||0)+1;
          s.npcRelations[npcId]=x;
        }catch(e){}
      }
      s.tasks=s.tasks||{};
      s.tasks.npcSuccess=(Number(s.tasks.npcSuccess)||0)+1;
    }else{
      text=(choice.failMsg)||('Не вышло. '+text);
      try{
        s.npcRelations=s.npcRelations||{};
        var y=s.npcRelations[npcId]||{rep:0,helped:0,failed:0,betrayed:0,saved:0};
        y.rep=Math.max(0,(Number(y.rep)||0)-1);
        y.failed=(Number(y.failed)||0)+1;
        s.npcRelations[npcId]=y;
      }catch(e){}
    }
    save();
    try{ if(typeof window.ui==='function') window.ui(); }catch(e){}

    // показать ответ в том же стиле
    var content=document.getElementById('modal-content');
    if(!content)return;
    var panel=content.querySelector('.npc-action-panel');
    if(!panel)return;
    var nameMap={shaiba:'Шайба',bugor:'Бугор',kosoy:'Косой',smotryashiy:'Смотрящий',avtoritet:'Авторитет'};
    var roleMap={shaiba:'Сокамерник',bugor:'Тренер',kosoy:'Торговец слухами',smotryashiy:'Порядок в бараке',avtoritet:'Старый волк'};
    var av='./assets/backgrounds/'+
      ({shaiba:'shaiba_avatar.webp',bugor:'Bugor_avatar.webp',kosoy:'Kosoy_avatar.webp',smotryashiy:'Smotraishia_avatar.webp',avtoritet:'avtoritet_avatar.webp'}[npcId]||'shaiba_avatar.webp');

    content.innerHTML=
      '<div class="npc-hero">'+
      '<img class="npc-hero-img" src="'+av+'" alt="" draggable="false">'+
      '<div class="npc-hero-title"><b>'+(nameMap[npcId]||npcId)+'</b><small>'+(roleMap[npcId]||'')+'</small></div></div>'+
      '<div class="npc-action-panel">'+
      '<div class="npc-dialogue npc-dialogue-response"><p>'+text+'</p></div>'+
      '<button type="button" class="npc-primary" id="npc-mem-back">← К списку</button>'+
      '</div>';
    content.dataset.memInjected='0';
    pendingMemory=null;
    var back=document.getElementById('npc-mem-back');
    if(back) back.onclick=function(){
      if(typeof window.openBarrack==='function') window.openBarrack();
    };
  }

  function boot(){
    bindChoiceCapture();
    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.npcMemObs){
      overlay.dataset.npcMemObs='1';
      new MutationObserver(function(){
        setTimeout(injectMemoryRound, 30);
      }).observe(overlay,{childList:true,subtree:true});
    }
    console.log('[npc-memory] v1.0 ready, scenes', SCENES.length);
  }

  window.__npcMemRecord=recordChoice;
  window.__npcMemPick=pickScene;
  window.__npcMemDebug=function(){ var s=st(); return store(s); };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
