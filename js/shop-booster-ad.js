/* shop-booster-ad v2.0 — main screen booster, ads only (RuStore) */
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
      ? 'Ускоритель: осталось '+left+' тапов ×2'
      : 'Ускоритель: реклама → ×2 на 100 тапов';
  }

  function grant(){
    var s=st();
    if(!s) return;
    s.boosters = s.boosters || {double:0};
    s.boosters.double = (Number(s.boosters.double)||0) + 100;
    save();
    ui();
    updateLabel();
    msg('🔥 Ускоритель +100 тапов (×2) за рекламу');
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
      '<span class="booster-btn-icon" aria-hidden="true">🔥</span>'+
      '<span class="booster-btn-label">Ускоритель</span>'+
      '<span class="booster-btn-count"></span>';
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
        watchAd();
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
    console.log('[shop-booster-ad] v2.0 RuStore main-screen');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
