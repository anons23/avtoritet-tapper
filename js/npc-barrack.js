/* npc-barrack v2.5 — список персонажей барака + диалоги */
'use strict';
(function(){
  var AV='./assets/backgrounds/';
  var NPCS=[
    {id:'shaiba',name:'Шайба',role:'Сокамерник',icon:'🪙',avatar:AV+'shaiba_avatar.webp',
      greet:'Шайба кивает: «Ну что, по делу или просто так зашёл?»',
      lines:[
        {t:'Спросить про дела',ok:0.7,chifir:25,pts:15,msg:'Шайба делится слухами. Полезно.'},
        {t:'Кинуть чефира',ok:0.9,chifir:-20,pts:30,msg:'Шайба доволен. Авторитет чуть подрос.'},
        {t:'Уйти',ok:1,chifir:0,pts:0,msg:'Шайба пожимает плечами.'}
      ]},
    {id:'bugor',name:'Бугор',role:'Тренер',icon:'💪',avatar:AV+'Bugor_avatar.webp',
      greet:'Бугор хрустит костяшками: «Готов поработать?»',
      lines:[
        {t:'Потренироваться',ok:0.75,chifir:0,pts:40,power:1,bugor:true,msg:'Тренировка прошла. Сила растёт.'},
        {t:'Спросить совет',ok:0.85,chifir:15,pts:20,msg:'Бугор даёт дельный совет.'},
        {t:'Не сегодня',ok:1,chifir:0,pts:0,msg:'Бугор: «Как будешь готов — подходи.»'}
      ]},
    {id:'kosoy',name:'Косой',role:'Торговец слухами',icon:'👁',avatar:AV+'Kosoy_avatar.webp',
      greet:'Косой щурится: «Информация — товар. Что нужно?»',
      lines:[
        {t:'Купить слух (30 🍵)',ok:0.8,chifir:-30,pts:25,msg:'Косой шепчет полезный слух.'},
        {t:'Просто поболтать',ok:0.6,chifir:10,pts:10,msg:'Пустая болтовня, но настроение лучше.'},
        {t:'Уйти',ok:1,chifir:0,pts:0,msg:'Косой отворачивается.'}
      ]},
    {id:'smotryashiy',name:'Смотрящий',role:'Порядок в бараке',icon:'👁‍🗨',avatar:AV+'Smotraishia_avatar.webp',
      greet:'Смотрящий смотрит холодно: «Говори по делу.»',
      lines:[
        {t:'Доложить обстановку',ok:0.7,chifir:20,pts:35,msg:'Смотрящий кивает. Уважение +.'},
        {t:'Просить защиту',ok:0.5,chifir:-40,pts:50,msg:'Договорились. Пока тебя прикрывают.'},
        {t:'Молча уйти',ok:1,chifir:0,pts:0,msg:'Смотрящий не задерживает.'}
      ]},
    {id:'avtoritet',name:'Авторитет',role:'Старый волк',icon:'👑',avatar:AV+'avtoritet_avatar.webp',
      greet:'Авторитет не торопится: «Слова должны весить.»',
      lines:[
        {t:'Попросить совет',ok:0.65,chifir:0,pts:45,msg:'Короткий совет, но меткий.'},
        {t:'Показать уважение',ok:0.8,chifir:-25,pts:40,msg:'Он замечает жест. Это зачтётся.'},
        {t:'Отойти',ok:1,chifir:0,pts:0,msg:'Разговор окончен.'}
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

  function openDialogue(npc){
    var html='<div class="npc-hero">'+
      '<img class="npc-hero-img" src="'+npc.avatar+'" alt="" draggable="false">'+
      '<div class="npc-hero-title"><b>'+npc.name+'</b><small>'+npc.role+'</small></div>'+
      '</div>'+
      '<div class="npc-action-panel">'+
      '<div class="npc-dialogue"><p>'+npc.greet+'</p></div>'+
      '<div class="npc-choice-title">ЧТО СКАЖЕШЬ?</div>';
    npc.lines.forEach(function(line,i){
      html+='<button type="button" class="npc-choice" data-line="'+i+'">'+line.t+'</button>';
    });
    html+='<button type="button" class="npc-primary" id="npc-back-list">← К списку</button>';
    html+='</div>';
    openNpcModal(html);
    document.querySelectorAll('.npc-choice[data-line]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        var i=Number(btn.getAttribute('data-line'));
        resolveLine(npc, npc.lines[i]);
      });
    });
    var back=$('npc-back-list');
    if(back) back.addEventListener('click',function(e){ e.preventDefault(); renderList(); });
  }

  function resolveLine(npc, line){
    if(!line)return;
    var s=st();
    if(!s){ msg('Игра ещё загружается…'); return; }
    var ok=Math.random()< (Number(line.ok)||0);
    if(line.chifir<0 && (Number(s.chifir)||0) < Math.abs(line.chifir)){
      msg('🍵 Не хватает чефира');
      return;
    }
    if(ok){
      if(line.chifir) s.chifir=(Number(s.chifir)||0)+line.chifir;
      if(line.pts) s.points=(Number(s.points)||0)+line.pts;
      if(line.power) s.power=(Number(s.power)||1)+line.power;
      if(line.bugor){
        s.tasks=s.tasks||{};
        s.tasks.bugorSuccess=(Number(s.tasks.bugorSuccess)||0)+1;
      }
      s.tasks=s.tasks||{};
      s.tasks.npcSuccess=(Number(s.tasks.npcSuccess)||0)+1;
      msg((npc.icon||'')+' '+(line.msg||'Готово.'));
    }else{
      msg((npc.icon||'')+' Не вышло. Попробуй иначе.');
    }
    save(); ui();
    openDialogue(npc);
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
