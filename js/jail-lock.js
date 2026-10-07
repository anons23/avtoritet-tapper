/* jail-lock v1.0 — в карцере: свои события + рейды закрыты */
'use strict';
(function(){
  var JAIL_EVENTS=[
    {
      title:'Помыть пол',
      text:'Надзиратель кидает тряпку: «Пол — до блеска. Без разговоров.»',
      choices:[
        {t:'Мыть молча',ok:1,pts:15,msg:'Пол вымыт. Надзиратель кивает и уходит.'},
        {t:'Просить тряпку почище',ok:.6,pts:25,msg:'Дали другую тряпку. Работа затянулась, но засчитали.'},
        {t:'Отказаться',ok:.2,pts:0,failMsg:'Отказ. Добавили ещё приседаний.',extraJail:40}
      ]
    },
    {
      title:'Уборка параши',
      text:'«Твоя очередь. Быстро и без слов.»',
      choices:[
        {t:'Сделать как сказали',ok:1,pts:20,msg:'Сделано. Лишний раз на тебя не смотрят.'},
        {t:'Торговаться за чефир',ok:.45,pts:10,chifir:15,msg:'Выторговал чуть чефира. Запах остался.'},
        {t:'Слиться',ok:.15,pts:0,failMsg:'Не вышло. Надзиратель злится.',extraJail:50}
      ]
    },
    {
      title:'Отжимания',
      text:'«Пятьдесят от пола. Сейчас.»',
      choices:[
        {t:'Отжаться',ok:.85,pts:25,msg:'Дожал. Спина ноет, но засчитали.'},
        {t:'Соврать, что болен',ok:.4,pts:5,msg:'Почти поверили. Отпустили с парой лишних приседаний.',extraJail:15},
        {t:'Спорить',ok:.25,pts:0,failMsg:'Спор закончился не в твою пользу.',extraJail:60}
      ]
    },
    {
      title:'Передать маляву',
      text:'Сосед пошептал: «Перекинь записку в соседнюю камеру. Тихо.»',
      choices:[
        {t:'Передать',ok:.7,pts:30,chifir:10,msg:'Передал. Записка ушла, тебе — чуть уважения и чефира.'},
        {t:'Отказаться',ok:1,pts:0,msg:'Не ввязался. В карцере это иногда умнее.'},
        {t:'Сдать надзирателю',ok:.5,pts:5,failMsg:'Тебя запомнили и там, и тут.',extraJail:30}
      ]
    },
    {
      title:'Проверка',
      text:'Шмон в карцере. «Карманы. Быстро.»',
      choices:[
        {t:'Стоять спокойно',ok:1,pts:10,msg:'Проверили и ушли. Чисто.'},
        {t:'Шутить',ok:.55,pts:15,msg:'Шутка зашла. На этот раз.'},
        {t:'Дёрнуться',ok:.3,pts:0,failMsg:'Дёрнулся — добавили срок в карцере.',extraJail:45}
      ]
    },
    {
      title:'Тишина',
      text:'«Чтоб ни звука до утра. Кто зашумит — ещё сутки.»',
      choices:[
        {t:'Молчать',ok:1,pts:12,msg:'Тишина. Утро ближе на один спокойный час.'},
        {t:'Шептаться с соседом',ok:.5,pts:20,msg:'Обменялись парой слов. Не поймали.'},
        {t:'Стучать в дверь',ok:.2,pts:0,failMsg:'Стучал зря. Надзиратель не оценил.',extraJail:35}
      ]
    }
  ];

  var busy=false;
  var lastAt=0;

  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }
  function ui(){ try{ if(typeof window.ui==='function') window.ui(); }catch(e){} }
  function msg(t){
    var e=document.getElementById('event-message');
    if(e){ e.textContent=t; e.classList.add('show'); setTimeout(function(){ e.classList.remove('show'); },2600); }
    else if(typeof window.msg==='function') try{ window.msg(t); }catch(err){}
  }

  function isJailed(){
    var s=st();
    return !!(s&&s.jailed);
  }

  /* ===== Блок рейдов ===== */
  function syncRaidButton(){
    var btn=document.getElementById('raid-open-button');
    if(!btn)return;
    var jailed=isJailed();
    btn.disabled=jailed;
    btn.setAttribute('aria-disabled', jailed?'true':'false');
    btn.classList.toggle('jail-locked', jailed);
    if(jailed){
      btn.style.opacity='0.35';
      btn.style.pointerEvents='none';
      btn.title='Рейды недоступны в карцере';
    }else{
      btn.style.opacity='1';
      btn.style.pointerEvents='auto';
      btn.title='Рейды';
    }
  }

  function blockRaidOpen(){
    // перехват до raid-button-fix
    document.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('#raid-open-button');
      if(!t)return;
      if(!isJailed())return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      msg('🔒 Рейды закрыты до выхода из карцера');
    },true);

    // обёртка openRaidMenu
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      if(typeof window.openRaidMenu==='function' && !window.openRaidMenu.__jailWrapped){
        var orig=window.openRaidMenu;
        window.openRaidMenu=function(){
          if(isJailed()){
            msg('🔒 Рейды закрыты до выхода из карцера');
            return;
          }
          return orig.apply(this, arguments);
        };
        window.openRaidMenu.__jailWrapped=true;
        clearInterval(timer);
      }
      if(tries>40) clearInterval(timer);
    },250);
  }

  /* ===== События карцера ===== */
  function maybeJailEvent(){
    var s=st();
    if(!s||!s.jailed||busy)return;
    var taps=Number(s.jailTaps)||0;
    // не чаще чем раз в ~45 тапов, шанс ~22%
    if(taps<25)return;
    if(taps-lastAt<40)return;
    if(Math.random()>0.22)return;
    lastAt=taps;
    showJailEvent();
  }

  function showJailEvent(){
    var s=st();
    if(!s||!s.jailed||busy)return;
    busy=true;
    var ev=JAIL_EVENTS[Math.floor(Math.random()*JAIL_EVENTS.length)];
    var overlay=document.getElementById('modal-overlay');
    var content=document.getElementById('modal-content');
    if(!overlay||!content){ busy=false; return; }

    var html='<div class="section-window jail-event-window">';
    html+='<div class="section-kicker">КАРЦЕР</div>';
    html+='<h2>'+ev.title+'</h2>';
    html+='<p class="section-subtitle">'+ev.text+'</p>';
    html+='<div class="npc-choice-title">ТВОЙ ОТВЕТ</div>';
    ev.choices.forEach(function(c,i){
      html+='<button type="button" class="npc-choice jail-ev-choice" data-i="'+i+'">'+c.t+'</button>';
    });
    html+='</div>';
    content.innerHTML=html;
    overlay.classList.remove('hidden');
    overlay.classList.add('show');
    overlay.dataset.locked='1';

    content.querySelectorAll('.jail-ev-choice').forEach(function(btn){
      btn.addEventListener('click',function(){
        var idx=Number(btn.getAttribute('data-i'));
        resolveJailEvent(ev, ev.choices[idx]);
      });
    });
  }

  function resolveJailEvent(ev, choice){
    var s=st();
    if(!s)return;
    var ok=Math.random()<Math.max(0,Math.min(1,Number(choice.ok)||0));
    var text;
    if(ok){
      text=choice.msg||'Сделано.';
      if(choice.pts) s.points=(Number(s.points)||0)+Number(choice.pts);
      if(choice.chifir) s.chifir=(Number(s.chifir)||0)+Number(choice.chifir);
    }else{
      text=choice.failMsg||'Не вышло.';
      if(choice.extraJail){
        s.jailRequired=(Number(s.jailRequired)||500)+Number(choice.extraJail);
        text+=' (+'+choice.extraJail+' тапов)';
      }
    }
    save();ui();

    var content=document.getElementById('modal-content');
    var overlay=document.getElementById('modal-overlay');
    if(content){
      content.innerHTML=
        '<div class="section-window jail-event-window">'+
        '<div class="section-kicker">КАРЦЕР</div>'+
        '<h2>'+ev.title+'</h2>'+
        '<p class="section-subtitle">'+text+'</p>'+
        '<button type="button" class="npc-primary" id="jail-ev-ok">Понятно</button>'+
        '</div>';
      var okb=document.getElementById('jail-ev-ok');
      if(okb) okb.onclick=function(){ closeJailEvent(); };
    }
    msg(text);
  }

  function closeJailEvent(){
    var overlay=document.getElementById('modal-overlay');
    if(overlay){
      overlay.dataset.locked='0';
      overlay.classList.add('hidden');
      overlay.classList.remove('show');
    }
    busy=false;
    ui();
  }

  // следим за ростом jailTaps
  var lastSeenTaps=-1;
  function poll(){
    syncRaidButton();
    var s=st();
    if(!s||!s.jailed){
      lastSeenTaps=-1;
      busy=false;
      return;
    }
    var taps=Number(s.jailTaps)||0;
    if(taps!==lastSeenTaps){
      lastSeenTaps=taps;
      maybeJailEvent();
    }
  }

  function boot(){
    blockRaidOpen();
    syncRaidButton();
    setInterval(poll,400);
    // на смене jailed через ui
    var g=document.getElementById('game-container');
    if(g){
      new MutationObserver(function(){ syncRaidButton(); }).observe(g,{attributes:true,attributeFilter:['class']});
    }
    console.log('[jail-lock] v1.0 ready, events', JAIL_EVENTS.length);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
