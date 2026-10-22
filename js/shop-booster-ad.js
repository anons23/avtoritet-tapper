/* shop-booster-ad v1.0 — ускоритель только за рекламу (вместо 500 🍵) */
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

  function grant(){
    var s=st();
    if(!s)return;
    s.boosters=s.boosters||{double:0};
    s.boosters.double=(Number(s.boosters.double)||0)+100;
    save(); ui();
    msg('🔥 Ускоритель +100 тапов (×2) за рекламу');
    // обновить подпись в открытом магазине
    relabel();
  }

  function watchAd(){
    if(typeof window.showRewardedAd==='function'){
      window.showRewardedAd(function(ok){
        if(ok) grant();
        else msg('📺 Реклама не просмотрена — ускоритель не выдан');
      });
    }else{
      // локально без SDK
      grant();
    }
  }

  function relabel(){
    var s=st();
    var left=s&&s.boosters?Number(s.boosters.double)||0:0;
    document.querySelectorAll('[data-b="d"]').forEach(function(btn){
      btn.innerHTML='🔥 <b>Ускоритель</b><br><small>×2 на 100 тапов · осталось '+left+'</small><br>📺 За рекламу';
      btn.dataset.adOnly='1';
    });
    // убрать дубль из ads-policy если был
    var extra=document.getElementById('shop-booster-ad');
    if(extra&&extra.getAttribute('data-b')!=='d') extra.remove();
  }

  // Перехват клика до обработчика game.js (capture)
  document.addEventListener('click',function(e){
    var btn=e.target&&e.target.closest&&e.target.closest('[data-b="d"]');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    watchAd();
  },true);

  function boot(){
    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.boosterObs){
      overlay.dataset.boosterObs='1';
      new MutationObserver(function(){ setTimeout(relabel,30); }).observe(overlay,{childList:true,subtree:true});
    }
    console.log('[shop-booster-ad] v1.0 ready');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
