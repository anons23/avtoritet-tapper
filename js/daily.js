/* daily.js v1.1 — ежедневные задания: тапы / рейд / дело */
'use strict';
(function(){
  var QUEST_POOL=[
    {id:'d_taps',title:'Размяться',desc:'Сделай 200 тапов за сегодня.',target:200,key:'taps',rewardType:'chifir',rewardAmount:100,reward:'100 🍵'},
    {id:'d_raid',title:'Зашёл на район',desc:'Выиграй 1 рейд сегодня.',target:1,key:'raids',rewardType:'chifir',rewardAmount:150,reward:'150 🍵'},
    {id:'d_deal',title:'Дело барака',desc:'Разбери 1 дело на масти Авторитет (или поговори в бараке ×2).',target:1,key:'deals',targetAlt:2,keyAlt:'npc',rewardType:'chifir',rewardAmount:120,reward:'120 🍵'}
  ];

  var QUESTS=[];
  function buildQuestSet(s){
    var d=s.daily;
    if(!d)return;
    var ids=Array.isArray(d.questIds)?d.questIds:[];
    if(ids.length!==3){
      ids=QUEST_POOL.slice().sort(function(){return Math.random()-.5;}).slice(0,3).map(function(q){return q.id;});
      d.questIds=ids;
      save();
    }
    QUESTS=ids.map(function(id){return QUEST_POOL.find(function(q){return q.id===id;});}).filter(Boolean);
  }

  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){
    try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){}
  }
  function ui(){
    try{ if(typeof window.ui==='function') window.ui(); }catch(e){}
  }
  function msg(t){
    var e=document.getElementById('event-message');
    if(e){ e.textContent=t; e.classList.add('show'); setTimeout(function(){ e.classList.remove('show'); },2400); }
    else if(typeof window.msg==='function') try{ window.msg(t); }catch(e){}
  }
  function fmt(n){ return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }

  function todayKey(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function ensure(s){
    if(!s)return null;
    var day=todayKey();
    if(!s.daily || s.daily.day!==day){
      s.daily={
        day:day,
        taps:0,
        raids:0,
        deals:0,
        npc:0,
        claimed:{},
        lastTotalTaps:Number(s.totalTaps)||0,
        lastAuthorityDeals:Number(s.tasks&&s.tasks.authorityDeals)||0,
        lastNpcSuccess:Number(s.tasks&&s.tasks.npcSuccess)||0
      };
      save();
    }
    if(!s.daily.claimed)s.daily.claimed={};
    if(typeof s.daily.refreshFreeUsed!=='boolean')s.daily.refreshFreeUsed=false;
    if(!Number.isFinite(Number(s.daily.refreshCount)))s.daily.refreshCount=0;
    if(!Number.isFinite(Number(s.daily.rewardClaims)))s.daily.rewardClaims=0;
    buildQuestSet(s);
    return s.daily;
  }

  function progress(s,q){
    var d=ensure(s);
    if(!d)return 0;
    var main=Number(d[q.key])||0;
    if(q.keyAlt){
      var alt=Number(d[q.keyAlt])||0;
      // дело: 1 deal ИЛИ targetAlt npc
      if(q.key==='deals'){
        if(main>=q.target)return q.target;
        if(alt>=(q.targetAlt||2))return q.target;
        // show better progress toward completion as 0 or partial via deals only for bar
        return main;
      }
    }
    return main;
  }

  function isDone(s,q){
    var d=ensure(s);
    if(!d)return false;
    if(d.claimed[q.id])return true;
    var main=Number(d[q.key])||0;
    if(main>=q.target)return true;
    if(q.keyAlt&&(Number(d[q.keyAlt])||0)>=(q.targetAlt||2))return true;
    return false;
  }

  function canClaim(s,q){
    var d=ensure(s);
    if(!d||d.claimed[q.id])return false;
    return isDone(s,q);
  }

  function refreshDaily(s,viaAd){
    var d=ensure(s);if(!d)return false;
    if(!viaAd && d.refreshFreeUsed){msg('📅 Бесплатное обновление на сегодня уже использовано.');return false;}
    if(Number(d.rewardClaims)>=3){msg('📅 Все 3 награды за сегодня уже можно получить только по текущим заданиям.');return false;}
    if(!viaAd)d.refreshFreeUsed=true;
    d.refreshCount=(Number(d.refreshCount)||0)+1;
    var old=Array.isArray(d.questIds)?d.questIds.slice():[];
    var pool=QUEST_POOL.filter(function(q){return old.indexOf(q.id)<0;});
    if(pool.length<3)pool=QUEST_POOL.slice();
    d.questIds=pool.sort(function(){return Math.random()-.5;}).slice(0,3).map(function(q){return q.id;});
    d.taps=0;d.raids=0;d.deals=0;d.npc=0;d.claimed={};
    d.lastTotalTaps=Number(s.totalTaps)||0;
    d.lastAuthorityDeals=Number(s.tasks&&s.tasks.authorityDeals)||0;
    d.lastNpcSuccess=Number(s.tasks&&s.tasks.npcSuccess)||0;
    save();ui();
    msg(viaAd?'📺 Задания обновлены за рекламу.':'🔄 Ежедневные задания обновлены бесплатно.');
    return true;
  }

  function requestRefreshAd(){
    if(typeof window.showRewardedAd!=='function'){msg('📺 Реклама пока недоступна.');return;}
    window.showRewardedAd(function(ok){if(!ok){msg('📺 Реклама не просмотрена полностью.');return;}var s=st();if(s)refreshDaily(s,true);});
  }

  function claim(s,q){
    var d=ensure(s);
    if(!d||d.claimed[q.id])return false;
    if(!isDone(s,q))return false;
    d.claimed[q.id]=Date.now();
    d.rewardClaims=(Number(d.rewardClaims)||0)+1;
    if(q.rewardType==='points') s.points=(Number(s.points)||0)+q.rewardAmount;
    else s.chifir=(Number(s.chifir)||0)+q.rewardAmount;
    msg('📅 День: '+q.title+' · +'+q.reward);
    save(); ui();
    return true;
  }

  function claimAllReady(s){
    QUESTS.forEach(function(q){ if(canClaim(s,q)) claim(s,q); });
  }

  function syncCounters(){
    var s=st();
    if(!s)return;
    var d=ensure(s);
    if(!d)return;

    var total=Number(s.totalTaps)||0;
    if(typeof d.lastTotalTaps!=='number') d.lastTotalTaps=total;
    if(total>d.lastTotalTaps){
      d.taps+=(total-d.lastTotalTaps);
      d.lastTotalTaps=total;
      save();
    }

    var ad=Number(s.tasks&&s.tasks.authorityDeals)||0;
    if(typeof d.lastAuthorityDeals!=='number') d.lastAuthorityDeals=ad;
    if(ad>d.lastAuthorityDeals){
      d.deals+=(ad-d.lastAuthorityDeals);
      d.lastAuthorityDeals=ad;
      save();
    }

    var ns=Number(s.tasks&&s.tasks.npcSuccess)||0;
    if(typeof d.lastNpcSuccess!=='number') d.lastNpcSuccess=ns;
    if(ns>d.lastNpcSuccess){
      d.npc+=(ns-d.lastNpcSuccess);
      d.lastNpcSuccess=ns;
      save();
    }

    // авто-награда при выполнении
    claimAllReady(s);
  }

  function noteRaidWin(){
    var s=st();
    if(!s)return;
    var d=ensure(s);
    if(!d)return;
    d.raids=(Number(d.raids)||0)+1;
    save();
    claimAllReady(s);
  }

  function wrapMarkWin(){
    if(typeof window.markWin==='function' && !window.markWin.__dailyWrapped){
      var orig=window.markWin;
      function wrapped(){
        var r=orig.apply(this,arguments);
        try{ noteRaidWin(); }catch(e){}
        return r;
      }
      wrapped.__dailyWrapped=true;
      window.markWin=wrapped;
      return;
    }
    // raids-ui may define markWin as local — hook via custom event if exposed later
  }

  // raids-ui markWin is internal; listen to common patterns
  function hookRaids(){
    wrapMarkWin();
    // patch if raids expose on win message
    if(typeof window.__raidOnWin==='function' && !window.__raidOnWin.__daily){
      var o=window.__raidOnWin;
      window.__raidOnWin=function(){ try{ noteRaidWin(); }catch(e){} return o.apply(this,arguments); };
      window.__raidOnWin.__daily=true;
    }
  }

  function cardsHtml(s){
    ensure(s);
    return QUESTS.map(function(q){
      var cur=Math.min(q.target, progress(s,q));
      // for deal+npc alt show combined hint
      var d=s.daily;
      var extra='';
      if(q.key==='deals'){
        var deals=Number(d.deals)||0;
        var npc=Number(d.npc)||0;
        extra=' <span style="opacity:.75">(дела '+deals+', барак '+npc+'/2)</span>';
        if(deals>=1||npc>=2)cur=q.target;
        else cur=deals>=1?1:0;
      }
      var done=!!(d.claimed&&d.claimed[q.id])||isDone(s,q);
      var claimed=!!(d.claimed&&d.claimed[q.id]);
      var pct=Math.min(100,(cur/q.target)*100);
      var icon=claimed?'✓':(done?'🎁':'📅');
      return '<div class="task-card daily-card '+(claimed?'task-done':'')+'">'+
        '<div class="task-icon">'+icon+'</div>'+
        '<div class="task-body">'+
        '<b>'+q.title+'</b>'+
        '<p>'+q.desc+extra+'</p>'+
        '<div class="task-progress"><span style="width:'+pct+'%"></span></div>'+
        '<small>'+fmt(cur)+' / '+fmt(q.target)+' · Награда: <strong>'+q.reward+'</strong>'+
        (claimed?' · получено':(done?' · забирается…':''))+'</small>'+
        '</div></div>';
    }).join('');
  }

  function injectIntoTasksMenu(){
    var content=document.getElementById('modal-content');
    if(!content)return;
    if(!content.querySelector('.tasks-window'))return;
    if(content.querySelector('.daily-block'))return;
    var s=st();
    if(!s)return;
    ensure(s);
    claimAllReady(s);

    var d=s.daily;
    var free=!!d.refreshFreeUsed;
    var claims=Math.min(3,Number(d.rewardClaims)||0);
    var refreshHtml='<div class="daily-refresh"><button type="button" id="daily-refresh-btn">🔄 Обновить задания <span>'+(free?'📺 за рекламу':'🆓 бесплатно')+'</span></button><small>'+(free?'Бесплатное обновление уже использовано · дальше можно обновлять за рекламу без ограничений.':'1 бесплатное обновление в день · после него — за рекламу без ограничений.')+' Награды за день: '+claims+'/3.</small></div>';
    var block=document.createElement('div');
    block.className='daily-block';
    block.innerHTML=
      '<div class="daily-head"><span class="section-kicker">СЕГОДНЯ</span>'+
      '<p class="section-subtitle" style="margin:6px 0 10px">Сброс в полночь · '+todayKey()+'</p></div>'+
      refreshHtml+'<div class="tasks-list daily-list">'+cardsHtml(s)+'</div>'+
      '<hr class="daily-sep">';

    var h2=content.querySelector('h2');
    var list=content.querySelector('.tasks-list');
    var rb=content.querySelector('#daily-refresh-btn');
    if(rb&&!rb.dataset.bound){rb.dataset.bound='1';rb.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(s.daily.refreshFreeUsed)requestRefreshAd();else refreshDaily(s,false);});}
    if(list&&list.parentNode){
      list.parentNode.insertBefore(block, list);
    }else if(h2&&h2.parentNode){
      h2.parentNode.insertBefore(block, h2.nextSibling);
    }
  }

  function bindTasksButton(){
    var btn=document.getElementById('btn-tasks');
    if(btn&&!btn.dataset.dailyBound){
      btn.dataset.dailyBound='1';
      btn.addEventListener('click',function(){
        setTimeout(injectIntoTasksMenu,40);
        setTimeout(injectIntoTasksMenu,150);
      });
    }
    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.dailyObs){
      overlay.dataset.dailyObs='1';
      new MutationObserver(function(){
        setTimeout(injectIntoTasksMenu,20);
      }).observe(overlay,{childList:true,subtree:true});
    }
  }

  // Public API for other modules
  window.__dailyNoteRaidWin=noteRaidWin;
  window.__dailySync=syncCounters;
  window.getDailyQuests=function(){var s=st();if(s)ensure(s);return QUESTS.slice()};

  function boot(){
    bindTasksButton();
    syncCounters();
    setInterval(function(){ syncCounters(); hookRaids(); },1000);
    hookRaids();
    // also after raid timer patch loads
    setTimeout(hookRaids,2000);
    setTimeout(hookRaids,5000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();

  console.log('[daily] v2.0 quests ready');
})();
