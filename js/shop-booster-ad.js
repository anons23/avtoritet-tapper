/* shop-booster-ad v2.1 — clearly explained rewarded tap bonus (main screen only) */
'use strict';
(function(){
  var BTN_ID = 'booster-open-button';

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

  function leftCount(){
    var s=st();
    return s&&s.boosters ? (Number(s.boosters.double)||0) : 0;
  }

  function updateLabel(){
    var btn=document.getElementById(BTN_ID);
    if(!btn) return;
    var left=leftCount();
    var countEl=btn.querySelector('.booster-btn-count');
    if(countEl){
      if(left>0){
        countEl.textContent='×2 · '+left;
        countEl.classList.add('active');
      } else {
        countEl.textContent='';
        countEl.classList.remove('active');
      }
    }
    btn.title = left>0
      ? 'Бонус за рекламу: ×2 ещё на '+left+' тапов'
      : 'Посмотри рекламу и получи ×2 на следующие 100 тапов';
  }

  function grant(){
    var s=st();
    if(!s) return;
    s.boosters = s.boosters || {double:0};
    s.boosters.double = (Number(s.boosters.double)||0) + 100;
    save();
    ui();
    updateLabel();
    msg('📺 Бонус за рекламу получен: ×2 на следующие 100 тапов');
  }

  function watchAd(){
    if(typeof window.showRewardedAd==='function'){
      window.showRewardedAd(function(ok){
        if(ok) grant();
        else msg('📺 Реклама не просмотрена — ускоритель не выдан');
      });
    } else {
      msg('📺 Реклама пока недоступна — ускоритель не выдан');
    }
  }

  function iconHtml(){
    return ''+
      '<span class="booster-btn-icon" aria-hidden="true">📺</span>'+
      '<span class="booster-btn-label">×2 ЗА ТАП</span>'+
      '<span class="booster-btn-count"></span>';
  }


  function openBoosterInfo(){
    var s=st();
    var left=leftCount();
    var html='<div class="section-window booster-info-window">'+
      '<div class="section-kicker">БОНУС ЗА ПРОСМОТР РЕКЛАМЫ</div>'+
      '<h2>📺 Бонус ×2</h2>'+
      '<p class="section-subtitle">Посмотри короткую рекламную вставку и получи удвоение награды за обычные тапы.</p>'+
      '<div class="booster-info-card"><div class="booster-info-icon">×2</div><div><b>Удвоенная награда</b><p>Следующие <strong>100 обычных тапов</strong> принесут вдвое больше очков и чефира. Один бонус расходуется за каждый тап.</p></div></div>'+
      '<div class="booster-info-status">'+(left>0?'<span class="booster-status-active">Уже активно: '+left+' тапов ×2</span><small>Новый просмотр добавит ещё 100 тапов к запасу.</small>':'<span>Сейчас бонус не активен</span><small>После успешного просмотра бонус появится автоматически.</small>')+'</div>'+
      '<button type="button" id="booster-watch-ad" class="booster-watch-ad">📺 Смотреть рекламу и получить бонус</button>'+
      '<p class="booster-info-note">Бонус выдаётся только после успешного завершения рекламы. Если реклама недоступна или не досмотрена, награда не начисляется.</p>'+
      '</div>';
    if(typeof window.openModal==='function')window.openModal(html);
    else {msg('📺 Бонус ×2: +100 тапов за просмотр рекламы');return;}
    var action=document.getElementById('booster-watch-ad');
    if(action)action.addEventListener('click',function(){
      action.disabled=true;
      action.textContent='Ожидаем завершения рекламы…';
      if(typeof window.closeModal==='function')window.closeModal();
      watchAd();
    });
  }

  function ensureBtn(){
    var parent=document.getElementById('game-container')||document.body;
    if(!parent) return;
    var btn=document.getElementById(BTN_ID);
    if(!btn){
      btn=document.createElement('button');
      btn.id=BTN_ID;
      btn.type='button';
      btn.setAttribute('aria-label','Ускоритель за рекламу');
      btn.innerHTML=iconHtml();
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        openBoosterInfo();
      });
      parent.appendChild(btn);
    } else if(!btn.querySelector('.booster-btn-label')){
      btn.innerHTML=iconHtml();
    }
    updateLabel();
  }

  function hookUi(){
    if(window.__boosterUiHooked) return;
    window.__boosterUiHooked=true;
    var orig=window.ui;
    if(typeof orig==='function'){
      window.ui=function(){
        var r=orig.apply(this,arguments);
        try{ updateLabel(); }catch(e){}
        return r;
      };
    }
    setInterval(updateLabel, 2000);
  }

  function boot(){
    ensureBtn();
    hookUi();
    setTimeout(ensureBtn, 400);
    setTimeout(ensureBtn, 1500);
    console.log('[shop-booster-ad] v2.1 RuStore main-screen');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
