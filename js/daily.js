/* daily.js v1.4 */
'use strict';
(function(){
  var QUEST_POOL=[
    {id:'d_taps',title:'Размяться',desc:'Сделай 200 тапов за сегодня.',target:200,key:'taps',rewardType:'chifir',rewardAmount:100,reward:'100 🍵'},
    {id:'d_raid',title:'Зашёл на район',desc:'Выиграй 1 рейд сегодня.',target:1,key:'raids',rewardType:'chifir',rewardAmount:150,reward:'150 🍵'},
    {id:'d_deal',title:'Дело барака',desc:'Разбери 1 дело на масти Авторитет (или поговори в бараке).',target:1,key:'deals',rewardType:'chifir',rewardAmount:120,reward:'120 🍵'},
    {id:'d_taps_500',title:'Разогрев',desc:'Сделай 500 тапов за сегодня.',target:500,key:'taps',rewardType:'chifir',rewardAmount:180,reward:'180 🍵'},
    {id:'d_raid_2',title:'Двойной заход',desc:'Выиграй 2 рейда сегодня.',target:2,key:'raids',rewardType:'chifir',rewardAmount:220,reward:'220 🍵'},
    {id:'d_npc_3',title:'Разговор в бараке',desc:'Успешно закрой 3 диалога с NPC.',target:3,key:'npc',rewardType:'chifir',rewardAmount:160,reward:'160 🍵'},
    {id:'d_taps_800',title:'Смена на груше',desc:'Сделай 800 тапов за сегодня.',target:800,key:'taps',rewardType:'chifir',rewardAmount:250,reward:'250 🍵'},
    {id:'d_raid_3',title:'Три района',desc:'Выиграй 3 рейда сегодня.',target:3,key:'raids',rewardType:'chifir',rewardAmount:300,reward:'300 🍵'},
    {id:'d_deal_2',title:'Два дела',desc:'Разбери 2 дела / диалога.',target:2,key:'deals',rewardType:'chifir',rewardAmount:200,reward:'200 🍵'},
    {id:'d_npc_5',title:'Свой в бараке',desc:'Успешно закрой 5 диалогов с NPC.',target:5,key:'npc',rewardType:'chifir',rewardAmount:280,reward:'280 🍵'}
  ];
  var QUESTS=[];

  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }
  function ui(){ try{ if(typeof window.ui==='function') window.ui(); }catch(e){} }
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

  function buildQuestSet(s){
    var d=s.daily;
    if(!d)return;
    var ids=Array.isArray(d.questIds)?d.questIds:[];
    if(ids.length!==3){
      ids=QUEST_POOL.slice().sort(function(){return Math.random()-.5;}).slice(0,3).map(function(q){return q.id;});
      d.questIds=ids;
      save();
    }
    QUESTS=ids.map(function(id){
      for(var i=0;i<QUEST_POOL.length;i++) if(QUEST_POOL[i].id===id) return QUEST_POOL[i];
      return null;
    }).filter(Boolean);
  }

  function ensure(s){
    if(!s)return null;
    if(!s.daily||typeof s.daily!=='object') s.daily={};
    var d=s.daily;
    var key=todayKey();
    if(d.day!==key){
      s.daily={
        day:key,taps:0,raids:0,deals:0,npc:0,claimed:{},questIds:[],
        refreshFreeUsed:false,refreshCount:0,rewardClaims:0,
        lastTotalTaps:Number(s.totalTaps)||0,
        lastAuthorityDeals:Number(s.tasks&&s.tasks.authorityDeals)||0,
        lastNpcSuccess:Number(s.tasks&&s.tasks.npcSuccess)||0
      };
      d=s.daily;
    }
    if(!d.claimed)d.claimed={};
    if(typeof d.refreshFreeUsed!=='boolean')d.refreshFreeUsed=false;
    if(!Number.isFinite(Number(d.refreshCount)))d.refreshCount=0;
    if(!Number.isFinite(Number(d.rewardClaims)))d.rewardClaims=0;
    buildQuestSet(s);
    return d;
  }

  function progress(s,q){
    var d=ensure(s);if(!d||!q)return 0;
    if(q.key==='taps')return Number(d.taps)||0;
    if(q.key==='raids')return Number(d.raids)||0;
    if(q.key==='deals')return Number(d.deals)||0;
    if(q.key==='npc')return Number(d.npc)||0;
    return 0;
  }
  function isDone(s,q){
    var d=ensure(s);if(!d||!q)return false;
    if(d.claimed[q.id])return true;
    return progress(s,q)>=Number(q.target||1);
  }

  function rebuildDailyBlock(){
    var content=document.getElementById('modal-content');
    if(!content)return;
    var old=content.querySelector('.daily-block');
    if(old) old.remove();
    injectIntoTasksMenu();
  }

  function refreshDaily(s,viaAd){
    var d=ensure(s);if(!d)return false;
    if(!viaAd && d.refreshFreeUsed){
      msg('Бесплатное обновление на сегодня уже использовано.');
      return false;
    }
    if(!viaAd)d.refreshFreeUsed=true;
    d.refreshCount=(Number(d.refreshCount)||0)+1;
    var prev=Array.isArray(d.questIds)?d.questIds.slice():[];
    var pool=QUEST_POOL.filter(function(q){return prev.indexOf(q.id)<0;});
    if(pool.length<3) pool=QUEST_POOL.slice();
    pool=pool.sort(function(){return Math.random()-.5;});
    var next=pool.slice(0,3).map(function(q){return q.id;});
    if(next.length<3){
      var rest=QUEST_POOL.map(function(q){return q.id;}).filter(function(id){return next.indexOf(id)<0;});
      rest.sort(function(){return Math.random()-.5;});
      while(next.length<3&&rest.length) next.push(rest.shift());
    }
    d.questIds=next;
    d.taps=0;d.raids=0;d.deals=0;d.npc=0;d.claimed={};
    d.lastTotalTaps=Number(s.totalTaps)||0;
    d.lastAuthorityDeals=Number(s.tasks&&s.tasks.authorityDeals)||0;
    d.lastNpcSuccess=Number(s.tasks&&s.tasks.npcSuccess)||0;
    save();ui();
    msg(viaAd?'Задания обновлены за рекламу.':'Ежедневные задания обновлены.');
    rebuildDailyBlock();
    return true;
  }

  function requestRefreshAd(){
    if(typeof window.showRewardedAd!=='function'){
      var s=st(); if(s) refreshDaily(s,true); else msg('Реклама пока недоступна.');
      return;
    }
    window.showRewardedAd(function(ok){
      if(!ok){ msg('Реклама не просмотрена полностью.'); return; }
      var s=st(); if(s) refreshDaily(s,true);
    });
  }

  function claim(s,q){
    var d=ensure(s);
    if(!d||d.claimed[q.id])return false;
    if(!isDone(s,q))return false;
    d.claimed[q.id]=Date.now();
    d.rewardClaims=(Number(d.rewardClaims)||0)+1;
    if(q.rewardType==='chifir') s.chifir=(Number(s.chifir)||0)+Number(q.rewardAmount||0);
    save();ui();
    msg(q.title+': +'+(q.reward||''));
    return true;
  }
  function claimAllReady(s){
    ensure(s);
    QUESTS.forEach(function(q){ if(isDone(s,q)&&!s.daily.claimed[q.id]) claim(s,q); });
  }

  function syncProgress(s){
    var d=ensure(s);if(!d)return;
    var taps=Number(s.totalTaps)||0;
    var last=Number(d.lastTotalTaps)||0;
    if(taps>last){ d.taps=(Number(d.taps)||0)+(taps-last); d.lastTotalTaps=taps; }
    var deals=Number(s.tasks&&s.tasks.authorityDeals)||0;
    var ld=Number(d.lastAuthorityDeals)||0;
    if(deals>ld){ d.deals=(Number(d.deals)||0)+(deals-ld); d.lastAuthorityDeals=deals; }
    var npc=Number(s.tasks&&s.tasks.npcSuccess)||0;
    var ln=Number(d.lastNpcSuccess)||0;
    if(npc>ln){ d.npc=(Number(d.npc)||0)+(npc-ln); d.lastNpcSuccess=npc; }
  }

  window.__dailyNoteRaidWin=function(){
    var s=st();if(!s)return; var d=ensure(s);if(!d)return;
    d.raids=(Number(d.raids)||0)+1; save();
  };
  window.__dailyNoteTap=function(){
    var s=st();if(!s)return; var d=ensure(s);if(!d)return;
    d.taps=(Number(d.taps)||0)+1; save();
  };

  function cardsHtml(s){
    var d=ensure(s);
    var out='';
    for(var i=0;i<QUESTS.length;i++){
      var q=QUESTS[i];
      var p=progress(s,q);
      var done=!!(d.claimed&&d.claimed[q.id])||isDone(s,q);
      var claimed=!!(d.claimed&&d.claimed[q.id]);
      var pct=Math.min(100,Math.floor(p/Math.max(1,q.target)*100));
      var status=claimed?' · получено':(done?' · забирается…':'');
      var icon=claimed?'✓':(done?'🎁':'📅');
      out+='<div class="task-card daily-card'+(claimed?' task-done':'')+'">';
      out+='<div class="task-icon">'+icon+'</div>';
      out+='<div class="task-body">';
      out+='<b>'+q.title+'</b>';
      out+='<p>'+q.desc+'</p>';
      out+='<div class="task-track"><span style="width:'+pct+'%"></span></div>';
      out+='<small>'+fmt(p)+' / '+fmt(q.target)+' · награда '+q.reward+status+'</small>';
      out+='</div></div>';
    }
    return out;
  }

  function injectIntoTasksMenu(){
    try{
      var content=document.getElementById('modal-content');
      if(!content)return;
      var isTasks=!!content.querySelector('.tasks-window');
      if(!isTasks){
        // запасной признак меню поручений
        var txt=content.textContent||'';
        if(txt.indexOf('Поручения')<0 && txt.indexOf('ЦЕЛИ')<0) return;
      }
      if(content.querySelector('.daily-block'))return;
      var s=st();
      if(!s)return;
      ensure(s);
      claimAllReady(s);
      var d=s.daily;
      var free=!!d.refreshFreeUsed;
      var claims=Math.min(3,Number(d.rewardClaims)||0);
      var freeLabel=free?'за рекламу':'бесплатно';
      var freeHint=free
        ?'Бесплатное обновление уже использовано · дальше — за рекламу.'
        :'1 бесплатное обновление в день · дальше — за рекламу.';

      var block=document.createElement('div');
      block.className='daily-block';
      var html='';
      html+='<div class="daily-head">';
      html+='<span class="section-kicker">СЕГОДНЯ</span>';
      html+='<p class="section-subtitle" style="margin:6px 0 10px">Сброс в полночь · '+todayKey()+'</p>';
      html+='</div>';
      html+='<div class="daily-refresh">';
      html+='<button type="button" id="daily-refresh-btn">Обновить задания ('+freeLabel+')</button>';
      html+='<small>'+freeHint+' Награды: '+claims+'/3.</small>';
      html+='</div>';
      html+='<div class="tasks-list daily-list">'+cardsHtml(s)+'</div>';
      html+='<hr class="daily-sep" style="margin:14px 0;border:none;border-top:1px solid rgba(255,255,255,.08)">';
      block.innerHTML=html;

      var list=content.querySelector('.tasks-list');
      if(list&&list.parentNode) list.parentNode.insertBefore(block, list);
      else content.insertBefore(block, content.firstChild);

      var rb=block.querySelector('#daily-refresh-btn');
      if(rb){
        rb.style.pointerEvents='auto';
        rb.style.cursor='pointer';
        rb.onclick=function(e){
          e.preventDefault();
          e.stopPropagation();
          var current=st();
          if(!current){ msg('Игра ещё загружается…'); return; }
          ensure(current);
          if(current.daily.refreshFreeUsed) requestRefreshAd();
          else refreshDaily(current,false);
        };
      }
    }catch(err){
      console.warn('[daily] inject error', err);
    }
  }

  function bindTasksButton(){
    var btn=document.getElementById('btn-tasks');
    if(btn&&!btn.dataset.dailyBound){
      btn.dataset.dailyBound='1';
      btn.addEventListener('click',function(){
        setTimeout(injectIntoTasksMenu,40);
        setTimeout(injectIntoTasksMenu,150);
        setTimeout(injectIntoTasksMenu,400);
      });
    }
    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.dailyObs){
      overlay.dataset.dailyObs='1';
      new MutationObserver(function(){ setTimeout(injectIntoTasksMenu,30); }).observe(overlay,{childList:true,subtree:true});
    }
  }

  function tick(){
    var s=st();if(!s)return;
    syncProgress(s);
    claimAllReady(s);
  }

  function boot(){
    bindTasksButton();
    setInterval(tick,2000);
    console.log('[daily] v1.4 ready');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
