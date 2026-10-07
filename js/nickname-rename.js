/* nickname-rename v1.1 — тап по кличке → смена имени за рекламу */
'use strict';
(function(){
  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }
  function ui(){ try{ if(typeof window.ui==='function') window.ui(); }catch(e){} }
  function msg(t){
    var e=document.getElementById('event-message');
    if(e){ e.textContent=t; e.classList.add('show'); setTimeout(function(){ e.classList.remove('show'); },2400); }
    else if(typeof window.msg==='function') try{ window.msg(t); }catch(err){}
  }

  function cleanName(raw){
    var n=String(raw||'').replace(/\s+/g,' ').trim();
    n=n.replace(/[^\w\u0400-\u04FF\- ]/g,'');
    if(n.length>16) n=n.slice(0,16);
    return n;
  }

  function openRename(){
    var s=st();
    if(!s){ msg('Игра ещё загружается…'); return; }
    if(s.jailed){ msg('🔒 В карцере кличку не сменить'); return; }

    var overlay=document.getElementById('modal-overlay');
    var content=document.getElementById('modal-content');
    if(!overlay||!content)return;

    var cur=s.nickname||'Салага';
    content.innerHTML=
      '<div class="section-window rename-window">'+
        '<div class="section-kicker">КЛИЧКА</div>'+
        '<h2>Сменить кличку</h2>'+
        '<p class="section-subtitle">Сейчас: <b>'+cur+'</b></p>'+
        '<label style="display:block;margin:10px 0 6px;font-size:12px;color:#aaa">Новая кличка</label>'+
        '<input id="rename-input" type="text" maxlength="16" value="" placeholder="Например: Кеша" '+
          'style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid #665329;background:#1a1a1c;color:#fff;font-size:16px">'+
        '<p style="margin:10px 0 0;font-size:12px;color:#888">1–16 символов · буквы, цифры, дефис</p>'+
        '<div class="npc-action-panel" style="margin-top:14px">'+
          '<button type="button" id="rename-ad-btn" class="npc-primary">📺 Сменить за рекламу</button>'+
          '<button type="button" id="rename-cancel" class="npc-choice">Отмена</button>'+
        '</div>'+
      '</div>';

    overlay.classList.remove('hidden');
    overlay.classList.add('show');
    overlay.dataset.locked='0';

    var input=document.getElementById('rename-input');
    if(input) setTimeout(function(){ input.focus(); },80);

    var cancel=document.getElementById('rename-cancel');
    if(cancel) cancel.onclick=function(){
      overlay.classList.add('hidden');
      overlay.classList.remove('show');
    };

    var btn=document.getElementById('rename-ad-btn');
    if(btn) btn.onclick=function(){
      var name=cleanName(input&&input.value);
      if(name.length<1){ msg('Введи кличку'); return; }
      if(name===cur){ msg('Это уже твоя кличка'); return; }

      function apply(){
        var gs=st();
        if(!gs)return;
        gs.nickname=name;
        save(); ui();
        overlay.classList.add('hidden');
        overlay.classList.remove('show');
        msg('Кличка изменена: '+name);
      }

      if(typeof window.showRewardedAd==='function'){
        btn.disabled=true;
        btn.textContent='Смотри рекламу…';
        window.showRewardedAd(function(ok){
          btn.disabled=false;
          btn.textContent='📺 Сменить за рекламу';
          if(!ok){ msg('Реклама не просмотрена — кличка не изменена'); return; }
          apply();
        });
      }else{
        apply();
      }
    };
  }

  function bind(){
    var el=document.getElementById('nickname')||document.getElementById('nickname-row');
    if(!el||el.dataset.renameBound==='1')return;
    el.dataset.renameBound='1';
    el.style.cursor='pointer';
    el.title='Сменить кличку';
    el.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      openRename();
    });
    var row=document.getElementById('nickname-row');
    if(row&&row!==el&&!row.dataset.renameBound){
      row.dataset.renameBound='1';
      row.style.cursor='pointer';
      row.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        openRename();
      });
    }
  }

  function boot(){
    bind();
    setTimeout(bind,500);
    setTimeout(bind,2000);
    console.log('[nickname-rename] v1.1 ready');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
