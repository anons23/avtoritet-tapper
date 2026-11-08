/* ads-policy v1.5 — interstitial только при переходе на вкладку; rewarded отдельно */
'use strict';
(function(){
  var FULLSCREEN_CD=300000;
  var LS_KEY='avt_ads_policy_v1';
  var lastFs=0;
  var hasSavedFullscreenTime=false;
  var pendingRaidDouble=null;
  var raidDoubleUsed=false;
  var pendingFullscreen=false;
  var transitionTimer=0;

  try{
    var saved=JSON.parse(localStorage.getItem(LS_KEY)||'{}');
    if(saved&&typeof saved.lastFs==='number'){ lastFs=saved.lastFs; hasSavedFullscreenTime=true; }
  }catch(e){}
  // Do not show an interstitial immediately on a fresh install; start the first cooldown now.
  if(!hasSavedFullscreenTime) lastFs=Date.now();

  function persist(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify({lastFs:lastFs})); }catch(e){}
  }
  if(!hasSavedFullscreenTime) persist();
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

  // Пятиминутный интервал относится только к автоматической межстраничной рекламе.
  // Rewarded-реклама вызывается отдельно по кнопкам и не меняет этот таймер.
  function canShowAd(){
    return Date.now()-lastFs>=FULLSCREEN_CD;
  }
  function canFullscreen(){ return canShowAd(); }
  function markFullscreenShown(){ lastFs=Date.now(); pendingFullscreen=false; persist(); }
  function markRewardedViewed(){ /* rewarded не влияет на interstitial cooldown */ }

  function tryFullscreen(reason){
    if(!canFullscreen()){
      console.log('[ads-policy] fullscreen skip (cd)', reason);
      return false;
    }
    var bridge=window.PlatformBridge;
    var fn=bridge&&typeof bridge.showFullscreenAd==='function'?bridge.showFullscreenAd:null;
    if(!fn&&typeof window.showFullscreenAd==='function') fn=window.showFullscreenAd;
    if(!fn)return false;
    try{
      var ok=fn.call(bridge||window);
      if(ok!==false){ markFullscreenShown(); return true; }
    }catch(e){ console.warn('[ads-policy] fullscreen error',e); }
    return false;
  }

  function wrapBridgeFullscreen(){
    var bridge=window.PlatformBridge;
    if(!bridge||typeof bridge.showFullscreenAd!=='function'||bridge.__adsPolicyWrapped)return;
    var orig=bridge.showFullscreenAd.bind(bridge);
    bridge.showFullscreenAd=function(){
      if(!canFullscreen())return false;
      var ok=orig();
      if(ok!==false) markFullscreenShown();
      return ok;
    };
    bridge.__adsPolicyWrapped=true;
  }

  function captureRaidWinFromDom(){
    var title=document.getElementById('raid-result-title');
    var text=document.getElementById('raid-result-text');
    if(!title||!text)return null;
    if((title.textContent||'').indexOf('ПОБЕДА')<0)return null;
    var m=(text.textContent||'').match(/\+(\d[\d\s]*)\s*🍵\s*·\s*\+(\d[\d\s]*)\s*⭐/);
    if(!m)return null;
    return {chifir:parseInt(String(m[1]).replace(/\s/g,''),10)||0, points:parseInt(String(m[2]).replace(/\s/g,''),10)||0};
  }

  function injectRaidDouble(){
    var card=document.getElementById('raid-result');
    if(!card||card.classList.contains('hidden'))return;
    if(card.dataset.doubleAd==='1')return;
    var rew=captureRaidWinFromDom();
    if(!rew)return;
    var sig=rew.chifir+':'+rew.points+':'+(document.getElementById('raid-result-text')||{}).textContent;
    if(card.dataset.doubleSig!==sig){
      card.dataset.doubleSig=sig;
      raidDoubleUsed=false;
      pendingRaidDouble=rew;
    }
    if(raidDoubleUsed)return;
    card.dataset.doubleAd='1';
    var wrap=document.createElement('div');
    wrap.id='raid-double-wrap';
    wrap.style.cssText='margin:12px 0 0;padding:0 4px';
    wrap.innerHTML='<button type="button" id="raid-double-ad" style="width:100%;padding:14px;border-radius:12px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;font-weight:900;font-size:14px;cursor:pointer">📺 Удвоить награду (+'+rew.chifir+' 🍵 · +'+rew.points+' ⭐)</button>';
    var text=document.getElementById('raid-result-text');
    if(text&&text.parentNode) text.parentNode.insertBefore(wrap, text.nextSibling);
    else card.appendChild(wrap);
    var b=document.getElementById('raid-double-ad');
    if(b) b.onclick=function(){
      if(raidDoubleUsed){ msg('Уже удвоено'); return; }
      if(typeof window.showRewardedAd!=='function'){ msg('📺 Реклама пока недоступна'); return; }
      window.showRewardedAd(function(ok){
        if(!ok){ msg('📺 Реклама не просмотрена'); return; }
        var s=st();
        if(!s||!pendingRaidDouble)return;
        s.chifir=(Number(s.chifir)||0)+pendingRaidDouble.chifir;
        s.points=(Number(s.points)||0)+pendingRaidDouble.points;
        if(s.tasks) s.tasks.earned=(Number(s.tasks.earned)||0)+pendingRaidDouble.chifir;
        raidDoubleUsed=true;
        save(); ui();
        var rx=document.getElementById('raid-result-text');
        if(rx) rx.textContent=(rx.textContent||'')+' · ×2 за рекламу';
        b.disabled=true; b.textContent='✅ Награда удвоена'; b.style.opacity='0.7';
        msg('🎁 Награда удвоена!');
      });
    };
  }

  function isVisible(el){
    if(!el)return false;
    if(el.classList&&el.classList.contains('hidden'))return false;
    try{return el.getClientRects().length>0&&window.getComputedStyle(el).visibility!=='hidden';}
    catch(e){return true;}
  }

  function refreshPending(){
    pendingFullscreen=canFullscreen();
    return pendingFullscreen;
  }

  // Проверка выполняется только по реальному переходу на вкладку.
  // Таймеры никогда не запускают рекламу сами по себе.
  function scheduleSafeTransition(reason,delay){
    refreshPending();
    if(!pendingFullscreen)return;
    clearTimeout(transitionTimer);
    transitionTimer=setTimeout(function(){
      refreshPending();
      if(!pendingFullscreen||!canFullscreen())return;
      var shown=tryFullscreen(reason);
      if(shown)pendingFullscreen=false;
    },typeof delay==='number'?delay:450);
  }

  function boot(){
    wrapBridgeFullscreen();

    // Не запускаем рекламу по истечению времени: только обработчик перехода на вкладку.

    var obsRoot=document.getElementById('game-container')||document.body;
    new MutationObserver(function(){ setTimeout(injectRaidDouble,50); })
      .observe(obsRoot,{childList:true,subtree:true});

    document.addEventListener('click',function(e){
      var t=e.target;
      if(!t||!t.closest)return;

      // Единственная точка автоматического показа — переход игрока на вкладку.
      // Тапы по игровому объекту, бой и закрытие экранов сюда не попадают.
      if(t.closest('#btn-shop,#btn-rank,#btn-tasks,#btn-more,#settings-gear-button')){
        scheduleSafeTransition('tab-open',550);
      }
    },true);

    console.log('[ads-policy] v1.5 interstitial only on tab transitions; cooldown',FULLSCREEN_CD/1000+'s');
  }

  window.AdsPolicy={
    tryFullscreen:tryFullscreen,
    canFullscreen:canFullscreen,
    canShowAd:canShowAd,
    secondsUntilNextAd:function(){
      return Math.max(0,Math.ceil((FULLSCREEN_CD-(Date.now()-lastFs))/1000));
    },
    markRewardedViewed:markRewardedViewed,
    FULLSCREEN_CD:FULLSCREEN_CD,
    hasPendingFullscreen:function(){return pendingFullscreen;}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
