/* npc-barrack v2.5 — список персонажей барака + диалоги */
'use strict';
(function(){
  var AV='./assets/backgrounds/';
  var NPCS=[
    {id:'shaiba',name:'Шайба',role:'Сокамерник',icon:'🪙',avatar:AV+'shaiba_avatar.webp',
      greet:'Шайба кивает: «Ну что, по делу или просто так зашёл?»',
      dialogs:[
        {q:'Шайба понижает голос: «В бараке сегодня неспокойно. Что хочешь узнать?»',choices:[
          {t:'Спросить, кто мутит воду',ok:.65,pts:20,msg:'Шайба шепчет имя и добавляет: «Только меня не сдавай.»'},
          {t:'Дать 30 🍵 за свежий слух',ok:.75,chifir:-30,pts:45,msg:'Шайба берёт чефир и рассказывает свежий слух. Получаешь 45 ⭐.'},
          {t:'Сказать, что тебе всё равно',ok:1,msg:'Шайба усмехается: «Вот и правильно. Лишние вопросы иногда дорого стоят.»'}
        ]},
        {q:'Шайба ухмыляется: «Есть разговор про одну вещь из кладовки. Интересно?»',choices:[
          {t:'Расспросить про кладовку',ok:.55,pts:30,msg:'Шайба делится полезной наводкой. Теперь ты знаешь, где искать.'},
          {t:'Заплатить 30 🍵 за подробности',ok:.7,chifir:-30,pts:55,msg:'Шайба рассказывает подробности. Слух оказался правдой.'},
          {t:'Не лезть в чужие дела',ok:1,msg:'Шайба одобрительно кивает: «Умный ход.»'}
        ]},
        {q:'Шайба: «Хочешь узнать, кто сейчас набирает влияние?»',choices:[
          {t:'Назвать того, кого подозреваешь',ok:.7,pts:25,msg:'Шайба подтверждает догадку и добавляет пару деталей.'},
          {t:'30 🍵 за точное имя',ok:.65,chifir:-30,pts:70,msg:'За чефир Шайба выдаёт имя и важную деталь.'},
          {t:'Сменить тему',ok:1,msg:'Шайба: «И правильно. Сегодня язык лучше держать за зубами.»'}
        ]},
        {q:'Шайба смеётся: «Последний слух на сегодня. Проверишь удачу?»',choices:[
          {t:'Спросить напрямую',ok:.5,pts:35,msg:'Слух оказывается правдой. Неплохая удача.'},
          {t:'Заплатить 30 🍵 и рискнуть',ok:.6,chifir:-30,pts:90,msg:'Шайба рассказывает редкий слух. За любопытство ты получил хорошую награду.'},
          {t:'Отказаться',ok:1,msg:'Шайба пожимает плечами: «Тоже вариант.»'}
        ]}
      ]},
    {id:'bugor',name:'Бугор',role:'Тренер',icon:'💪',avatar:AV+'Bugor_avatar.webp',
      greet:'Бугор хрустит костяшками: «Готов поработать?»',
      dialogs:[
        {q:'Бугор: «Как думаешь, что важнее — сила или терпение?»',choices:[
          {t:'Сказать: сила',ok:.7,power:1,pts:25,msg:'Бугор кивает: «Сила нужна. Но без головы она бесполезна.» +1 силы.'},
          {t:'Спросить за 20 🍵',ok:.8,chifir:-20,power:1,pts:45,msg:'Бугор даёт совет и заставляет сделать несколько подходов. +1 силы и 45 ⭐.'},
          {t:'Сказать: терпение',ok:.9,pts:20,msg:'Бугор одобряет: «Вот это уже разговор.»'}
        ]},
        {q:'Бугор: «В зале народ спорит, кто самый крепкий. Хочешь проверить себя?»',choices:[
          {t:'Вызваться первым',ok:.6,power:1,pts:35,msg:'Ты выдерживаешь испытание. Бугор уважительно кивает. +1 силы.'},
          {t:'Заплатить 25 🍵 за тренировочный секрет',ok:.75,chifir:-25,power:2,pts:50,msg:'Бугор показывает секретный приём. +2 силы.'},
          {t:'Сказать, что сегодня без геройства',ok:1,msg:'Бугор усмехается: «Разумно. Завтра доберём.»'}
        ]},
        {q:'Бугор смотрит на тебя: «Нужен совет перед тяжёлым делом?»',choices:[
          {t:'Попросить короткий совет',ok:.75,pts:40,msg:'Бугор даёт простой, но полезный совет. +40 ⭐.'},
          {t:'20 🍵 за подробный совет',ok:.8,chifir:-20,pts:70,msg:'Бугор разбирает ситуацию по шагам. +70 ⭐.'},
          {t:'Отказаться',ok:1,msg:'Бугор: «Сам разберёшься — тоже навык.»'}
        ]},
        {q:'Бугор: «Последний вопрос. Пойдёшь на риск ради авторитета?»',choices:[
          {t:'Да, если риск оправдан',ok:.6,power:1,pts:50,msg:'Бугор хлопает по плечу: «Вот теперь понимаю.» +1 силы.'},
          {t:'30 🍵 за тренировку перед риском',ok:.7,chifir:-30,power:1,pts:80,msg:'Тренировка прошла жёстко. +1 силы и 80 ⭐.'},
          {t:'Нет, сначала подготовлюсь',ok:.95,pts:25,msg:'Бугор одобряет осторожность. «Подготовка тоже сила.»'}
        ]}
      ]},
    {id:'kosoy',name:'Косой',role:'Торговец слухами',icon:'👁',avatar:AV+'Kosoy_avatar.webp',
      greet:'Косой щурится: «Информация — товар. Что нужно?»',
      dialogs:[
        {q:'Косой: «Есть слух, который стоит тридцать чефира. Берёшь?»',choices:[
          {t:'Заплатить 30 🍵 за слух',ok:.65,chifir:-30,rewardChifir:45,pts:60,msg:'Косой шепчет: «Слух свежий. Проверяй сам.» Ты получил ценную наводку.'},
          {t:'Попробовать выведать бесплатно',ok:.35,pts:30,msg:'Косой неожиданно сдаётся и делится частью информации.'},
          {t:'Отказаться',ok:1,msg:'Косой пожимает плечами: «Дешевле любопытства ничего нет.»'}
        ]},
        {q:'Косой улыбается: «Хочешь узнать, кто получил редкую вещь?»',choices:[
          {t:'Спросить прямо',ok:.55,pts:35,msg:'Косой называет имя и примету вещи.'},
          {t:'Заплатить 30 🍵 за точный ответ',ok:.7,chifir:-30,pts:75,msg:'Косой выдаёт точную информацию. Сделка удалась.'},
          {t:'Сделать вид, что неинтересно',ok:1,msg:'Косой: «Вот это выдержка. Не каждый умеет остановиться.»'}
        ]},
        {q:'Косой: «За тридцать чефира могу рассказать, где сегодня лучше не появляться.»',choices:[
          {t:'Заплатить 30 🍵',ok:.5,chifir:-30,pts:80,msg:'Косой рассказывает опасное место. Хорошо, что спросил.'},
          {t:'Попросить намёк бесплатно',ok:.45,pts:25,msg:'Косой даёт небольшой намёк, но просит не распространяться.'},
          {t:'Сказать, что не боишься',ok:.7,msg:'Косой смеётся: «Смелость без информации долго не живёт.»'}
        ]},
        {q:'Косой прищуривается: «Последняя сделка. Готов рискнуть ради редкого слуха?»',choices:[
          {t:'30 🍵 и рискнуть',ok:.55,chifir:-30,rewardChifir:80,pts:100,msg:'Слух оказывается ценным. Ты сорвал хороший куш.'},
          {t:'Поторговаться',ok:.45,pts:40,msg:'Косой уступает часть информации. Неплохо для бесплатного разговора.'},
          {t:'Уйти',ok:1,msg:'Косой: «Возвращайся, когда любопытство победит осторожность.»'}
        ]}
      ]},
    {id:'smotryashiy',name:'Смотрящий',role:'Порядок в бараке',icon:'👁‍🗨',avatar:AV+'Smotraishia_avatar.webp',
      greet:'Смотрящий смотрит холодно: «Говори по делу.»',
      dialogs:[
        {q:'Смотрящий: «В бараке есть напряжение. Что будешь делать?»',choices:[
          {t:'Доложить обстановку',ok:.7,chifir:-10,pts:45,msg:'Смотрящий кивает: «Нормально доложил.» +45 ⭐.'},
          {t:'Заплатить 30 🍵 за совет',ok:.65,chifir:-30,pts:70,msg:'Смотрящий даёт совет, который поможет избежать проблем.'},
          {t:'Не вмешиваться',ok:.9,pts:15,msg:'Смотрящий: «Иногда молчание — правильный ответ.»'}
        ]},
        {q:'Смотрящий: «Хочешь, чтобы к тебе относились серьёзнее?»',choices:[
          {t:'Спросить, как заработать уважение',ok:.65,pts:60,msg:'Смотрящий объясняет, какой поступок здесь ценят.'},
          {t:'30 🍵 за личную рекомендацию',ok:.7,chifir:-30,pts:90,msg:'Смотрящий даёт конкретный совет. +90 ⭐.'},
          {t:'Сказать, что справишься сам',ok:.75,pts:25,msg:'Смотрящий: «Посмотрим.»'}
        ]},
        {q:'Смотрящий: «Есть одна проблема. Хочешь узнать детали?»',choices:[
          {t:'Выслушать',ok:.6,pts:50,msg:'Ты получаешь важную информацию о проблеме.'},
          {t:'Заплатить 40 🍵 за полную картину',ok:.65,chifir:-40,pts:110,msg:'Смотрящий раскрывает детали. Информация действительно стоила денег.'},
          {t:'Не лезть',ok:1,msg:'Смотрящий коротко кивает: «Мудро.»'}
        ]},
        {q:'Смотрящий: «Последний вопрос. Готов отвечать за свои слова?»',choices:[
          {t:'Да',ok:.75,pts:70,msg:'Смотрящий: «Тогда слова чего-то стоят.» +70 ⭐.'},
          {t:'30 🍵 за шанс узнать больше',ok:.55,chifir:-30,pts:120,msg:'Смотрящий делится редкой информацией. +120 ⭐.'},
          {t:'Промолчать',ok:.9,pts:20,msg:'Смотрящий принимает молчание за разумность.'}
        ]}
      ]},
    {id:'avtoritet',name:'Авторитет',role:'Старый волк',icon:'👑',avatar:AV+'avtoritet_avatar.webp',
      greet:'Авторитет не торопится: «Слова должны весить.»',
      dialogs:[
        {q:'Авторитет: «Скажи, что для тебя важнее — деньги или имя?»',choices:[
          {t:'Имя',ok:.7,pts:80,msg:'Авторитет кивает: «Правильный ответ, если за именем стоят поступки.»'},
          {t:'30 🍵 за его мнение',ok:.75,chifir:-30,rewardChifir:60,pts:110,msg:'Он делится старым правилом зоны. +110 ⭐.'},
          {t:'Деньги',ok:.6,pts:40,msg:'Авторитет усмехается: «Честно. Но деньги без имени быстро заканчиваются.»'}
        ]},
        {q:'Авторитет: «Хочешь услышать историю, которую здесь мало кто знает?»',choices:[
          {t:'Попросить рассказать',ok:.65,pts:90,msg:'Авторитет рассказывает старую историю и делает из неё вывод.'},
          {t:'40 🍵 за всю историю',ok:.8,chifir:-40,pts:140,msg:'История оказывается ценной. Авторитет уважает твоё любопытство.'},
          {t:'Не сейчас',ok:1,msg:'Авторитет: «Умение ждать тоже дорогого стоит.»'}
        ]},
        {q:'Авторитет смотрит прямо: «Иногда за любопытство приходится платить. Проверишь?»',choices:[
          {t:'Рискнуть и спросить',ok:.45,pts:120,msg:'В этот раз тебе повезло. Авторитет отвечает прямо.'},
          {t:'30 🍵 за честный ответ',ok:.55,chifir:-30,pts:150,msg:'Авторитет отвечает, но предупреждает: «Теперь ты знаешь. Не болтай.»'},
          {t:'Отказаться',ok:1,msg:'Авторитет одобрительно кивает: «Значит, умеешь держать себя в руках.»'}
        ]},
        {q:'Авторитет: «Последний разговор. Как поступишь, если никто не видит?»',choices:[
          {t:'Сделаю как правильно',ok:.7,pts:130,msg:'Авторитет улыбается: «Вот теперь ты начинаешь понимать.»'},
          {t:'50 🍵 за его совет',ok:.75,chifir:-50,pts:180,msg:'Авторитет даёт редкий совет. +180 ⭐.'},
          {t:'Промолчу',ok:.9,pts:35,msg:'Авторитет: «Иногда молчание говорит больше слов.»'}
        ]}
      ]}
  ];

  function $(id){return document.getElementById(id)}
  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }
  function ui(){ try{ if(typeof window.ui==='function') window.ui(); }catch(e){} }
  function fmt(n){ n=Math.floor(Number(n)||0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
  function msg(t){
    var e=$('event-message');
    if(e){ e.textContent=t; e.classList.add('show'); setTimeout(function(){ e.classList.remove('show'); },2200); }
  }
  function openModal(html){
    if(typeof window.openModal==='function'){ window.openModal(html); return; }
    var c=$('modal-content'), o=$('modal-overlay'), m=$('modal');
    if(!c||!o)return;
    c.innerHTML=html;
    o.classList.remove('hidden');
    o.classList.add('show');
    if(m) m.classList.remove('npc-modal');
  }
  function openNpcModal(html){
    openModal(html);
    var m=$('modal');
    if(m) m.classList.add('npc-modal');
  }

  function renderList(){
    var html='<div class="barrack-window section-window">'+
      '<div class="section-kicker">ТВОЁ МЕСТО</div>'+
      '<h2>☰ Барак</h2>'+
      '<p class="section-subtitle">Люди, с которыми стоит говорить</p>'+
      '<div class="npc-list">';
    NPCS.forEach(function(n){
      html+='<button type="button" class="npc-link" data-npc="'+n.id+'">'+
        '<span aria-hidden="true">'+n.icon+'</span>'+
        '<b>'+n.name+'</b>'+
        '<small>'+n.role+'</small>'+
      '</button>';
    });
    html+='</div></div>';
    openModal(html);
    var m=$('modal');
    if(m) m.classList.remove('npc-modal');
    document.querySelectorAll('.npc-link[data-npc]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        var id=btn.getAttribute('data-npc');
        var npc=NPCS.find(function(x){return x.id===id});
        if(npc) openDialogue(npc);
      });
    });
  }

  function openDialogue(npc, roundIndex){
    roundIndex=Number(roundIndex)||0;
    var round=npc.dialogs[roundIndex];
    var html='<div class="npc-hero">'+
      '<img class="npc-hero-img" src="'+npc.avatar+'" alt="" draggable="false">'+
      '<div class="npc-hero-title"><b>'+npc.name+'</b><small>'+npc.role+'</small></div>'+
      '</div>'+
      '<div class="npc-action-panel">'+
      '<div class="npc-dialogue"><p>'+(round?round.q:npc.greet)+'</p></div>'+
      '<div class="npc-choice-title">ТВОЙ ОТВЕТ</div>';
    if(!round){
      html+='<div class="npc-dialogue npc-dialogue-finished"><p>На сегодня разговор закончен.</p></div>'+
        '<button type="button" class="npc-primary" id="npc-back-list">← К списку</button>';
    }else{
      round.choices.forEach(function(choice,i){
        html+='<button type="button" class="npc-choice" data-choice="'+i+'">'+choice.t+'</button>';
      });
      html+='<button type="button" class="npc-primary" id="npc-back-list">← К списку</button>';
    }
    html+='</div>';
    openNpcModal(html);
    document.querySelectorAll('.npc-choice[data-choice]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        var i=Number(btn.getAttribute('data-choice'));
        resolveLine(npc, round, round.choices[i], roundIndex);
      });
    });
    var back=$('npc-back-list');
    if(back) back.addEventListener('click',function(e){ e.preventDefault(); renderList(); });
  }

  function showNpcResponse(npc, text, nextRound){
    var html='<div class="npc-hero">'+
      '<img class="npc-hero-img" src="'+npc.avatar+'" alt="" draggable="false">'+
      '<div class="npc-hero-title"><b>'+npc.name+'</b><small>'+npc.role+'</small></div>'+
      '</div>'+
      '<div class="npc-action-panel npc-response-panel">'+
      '<div class="npc-dialogue npc-dialogue-response"><p>'+text+'</p></div>'+
      '<button type="button" class="npc-primary" id="npc-continue">'+
      (nextRound<npc.dialogs.length?'Продолжить разговор':'Закончить разговор')+
      '</button>'+
      '<button type="button" class="npc-primary npc-secondary" id="npc-back-list">← К списку</button>'+
      '</div>';
    openNpcModal(html);
    var next=$('npc-continue');
    if(next) next.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      openDialogue(npc,nextRound);
    });
    var back=$('npc-back-list');
    if(back) back.addEventListener('click',function(e){ e.preventDefault(); renderList(); });
  }

  function resolveLine(npc, round, choice, roundIndex){
    if(!choice)return;
    var s=st();
    if(!s){ showNpcResponse(npc,'Игра ещё загружается…',roundIndex+1); return; }
    var cost=Math.min(0,Number(choice.chifir)||0);
    if(cost<0 && (Number(s.chifir)||0)<Math.abs(cost)){
      showNpcResponse(npc,'🍵 Не хватает чефира. Для этого ответа нужно '+fmt(Math.abs(cost))+' чефира.',roundIndex);
      return;
    }

    // Оплата за риск происходит сразу, а результат определяется отдельно.
    if(cost<0) s.chifir=(Number(s.chifir)||0)+cost;

    var ok=Math.random() < Math.max(0,Math.min(1,Number(choice.ok)||0));
    var text;
    if(ok){
      var rewardChifir=Math.max(0,Number(choice.rewardChifir)||0);
      var rewardPts=Number(choice.pts)||0;
      if(rewardChifir) s.chifir=(Number(s.chifir)||0)+rewardChifir;
      if(rewardPts) s.points=(Number(s.points)||0)+rewardPts;
      if(choice.power) s.power=(Number(s.power)||1)+Number(choice.power);
      s.tasks=s.tasks||{};
      s.tasks.npcSuccess=(Number(s.tasks.npcSuccess)||0)+1;
      if(choice.bugor) s.tasks.bugorSuccess=(Number(s.tasks.bugorSuccess)||0)+1;
      text=(npc.icon||'')+' '+(choice.msg||'Получилось.');
    }else{
      var failPts=Number(choice.failPts);
      if(!isFinite(failPts)) failPts=cost<0?-30:0;
      if(failPts) s.points=Math.max(0,(Number(s.points)||0)+failPts);
      if(choice.failChifir) s.chifir=Math.max(0,(Number(s.chifir)||0)+Number(choice.failChifir));
      text=(npc.icon||'')+' '+(choice.failMsg||'Не вышло. '+(cost<0?'Любопытной Варваре на базаре нос оторвали. Опыт потерян.':'Похоже, сегодня не твой день.'));
    }
    save(); ui();
    showNpcResponse(npc,text,roundIndex+1);
  }

  function bind(){
    var btn=$('btn-more');
    if(btn && !btn.dataset.npcBarrack){
      btn.dataset.npcBarrack='1';
      btn.addEventListener('click', function(){
        // чуть позже game.more() откроет «загружаются» — заменим
        setTimeout(renderList, 30);
        setTimeout(renderList, 120);
      }, true);
    }
    // если кто-то открыл заглушку — подменим
    var overlay=$('modal-overlay');
    if(overlay && !overlay.dataset.npcObs){
      overlay.dataset.npcObs='1';
      new MutationObserver(function(){
        var c=$('modal-content');
        if(!c)return;
        var t=c.textContent||'';
        if(t.indexOf('Персонажи барака загружаются')>=0){
          renderList();
        }
      }).observe(overlay,{childList:true,subtree:true});
    }
  }

  window.openBarrack=renderList;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  console.log('[npc-barrack] v2.5 ready');
})();
