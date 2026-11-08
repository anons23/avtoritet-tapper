/* ads-policy v1.1 — мягкая реклама: interstitial ≥3.5 мин, ×2 рейд */
'use strict';
(function(){
  var FULLSCREEN_CD=210000;
  var REWARDED_INTERSTITIAL_CD=120000;
  var LS_KEY='avt_ads_policy_v1';
  var lastFs=0;
  var lastRewarded=0;
  var hasSavedFullscreenTime=false;
  var pendingRaidDouble=null;
  var raidDoubleUsed=false;
  var pendingFullscreen=false;
  var transitionTimer=0;

  try{
    var saved=JSON.parse(localStorage.getItem(LS_KEY)||'{}');
    if(saved&&typeof saved.lastFs==='number'){ lastFs=saved.lastFs; hasSavedFullscreenTime=true; }
    if(saved&&typeof saved.lastRewarded==='number') lastRewarded=saved.lastRewarded;
  }catch(e){}
  // Do not show an interstitial immediately on a fresh install; start the first cooldown now.
  if(!hasSavedFullscreenTime) lastFs=Date.now();

  function persist(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify({lastFs:lastFs,lastRewarded:lastRewarded})); }catch(e){}
  }
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

  function canFullscreen(){
    var now=Date.now();
    return now-lastFs>=FULLSCREEN_CD && now-lastRewarded>=REWARDED_INTERSTITIAL_CD;
  }
  function markFullscreenShown(){ lastFs=Date.now(); pendingFullscreen=false; persist(); }
  function markRewardedViewed(){ lastRewarded=Date.now(); pendingFullscreen=false; persist(); }

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

  function raidIsActive(){
    var selectors=['#raid-scene','#raid-fighter-list','.raid-fighter-list','#raid-result'];
    for(var i=0;i<selectors.length;i++){
      var nodes=document.querySelectorAll(selectors[i]);
      for(var j=0;j<nodes.length;j++)if(isVisible(nodes[j]))return true;
    }
    return false;
  }

  function refreshPending(){
    if(canFullscreen())pendingFullscreen=true;
    return pendingFullscreen;
  }

  function scheduleSafeTransition(reason,delay){
    refreshPending();
    if(!pendingFullscreen)return;
    clearTimeout(transitionTimer);
    transitionTimer=setTimeout(function(){
      refreshPending();
      if(!pendingFullscreen||!canFullscreen())return;
      if(raidIsActive()){
        console.log('[ads-policy] fullscreen queued: raid is active',reason);
        return;
      }
      var shown=tryFullscreen(reason);
      if(shown)pendingFullscreen=false;
    },typeof delay==='number'?delay:450);
  }

  function boot(){
    wrapBridgeFullscreen();

    // Cooldown expiry only queues an ad. It never launches one during active play.
    refreshPending();
    setInterval(refreshPending,1000);

    var obsRoot=document.getElementById('game-container')||document.body;
    new MutationObserver(function(){ setTimeout(injectRaidDouble,50); })
      .observe(obsRoot,{childList:true,subtree:true});

    document.addEventListener('click',function(e){
      var t=e.target;
      if(!t||!t.closest)return;

      // Main navigation and Settings are the only ordinary safe transition points.
      if(t.closest('#btn-shop,#btn-rank,#btn-tasks,#btn-more,#settings-gear-button')){
        scheduleSafeTransition('section-open',550);
        return;
      }

      // Closing a section (including Android Back) is also a safe transition.
      if(t.closest('#modal-close')){
        var content=document.getElementById('modal-content');
        if(content&&content.querySelector('.section-window,.settings-window')){
          scheduleSafeTransition('section-close',350);
        }
        return;
      }

      // Leaving raid screens may trigger an interstitial only after the raid UI is gone.
      if(t.closest('#raid-menu-close,#raid-result-close,[data-raid-close],#raid-back')){
        setTimeout(function(){
          if(!raidIsActive())scheduleSafeTransition('raid-exit',0);
        },650);
      }
    },true);

    // Observe modal closure for Android's native back gesture, but only for section screens.
    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.adsPol){
      overlay.dataset.adsPol='1';
      var wasOpen=!overlay.classList.contains('hidden');
      var wasSection=false;
      new MutationObserver(function(){
        var open=!overlay.classList.contains('hidden');
        var content=document.getElementById('modal-content');
        if(open&&content){
          wasSection=!!content.querySelector('.section-window,.settings-window');
        }
        if(wasOpen&&!open&&wasSection){
          wasSection=false;
          scheduleSafeTransition('section-back',350);
        }
        wasOpen=open;
      }).observe(overlay,{attributes:true,attributeFilter:['class']});
    }

    console.log('[ads-policy] v1.3 safe transitions; fullscreen cooldown',FULLSCREEN_CD/1000+'s, rewarded cooldown',REWARDED_INTERSTITIAL_CD/1000+'s');
  }

  window.AdsPolicy={ tryFullscreen:tryFullscreen, canFullscreen:canFullscreen, markRewardedViewed:markRewardedViewed, FULLSCREEN_CD:FULLSCREEN_CD, REWARDED_INTERSTITIAL_CD:REWARDED_INTERSTITIAL_CD, hasPendingFullscreen:function(){return pendingFullscreen;} };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
