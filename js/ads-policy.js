/* ads-policy v1.1 — мягкая реклама: interstitial ≥3.5 мин, ×2 рейд */
'use strict';
(function(){
  var FULLSCREEN_CD=210000;
  var LS_KEY='avt_ads_policy_v1';
  var lastFs=0;
  var pendingRaidDouble=null;
  var raidDoubleUsed=false;

  try{
    var saved=JSON.parse(localStorage.getItem(LS_KEY)||'{}');
    if(saved&&typeof saved.lastFs==='number') lastFs=saved.lastFs;
  }catch(e){}

  function persist(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify({lastFs:lastFs})); }catch(e){}
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

  function canFullscreen(){ return Date.now()-lastFs>=FULLSCREEN_CD; }
  function markFullscreenShown(){ lastFs=Date.now(); persist(); }

  function tryFullscreen(reason){
    if(!canFullscreen()){
      console.log('[ads-policy] fullscreen skip (cd)', reason);
      return false;
    }
    var bridge=window.YandexGameBridge;
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
    var bridge=window.YandexGameBridge;
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

  function onSoftClose(reason){
    setTimeout(function(){ tryFullscreen(reason); }, 400);
  }

  function boot(){
    wrapBridgeFullscreen();
    var tries=0;
    var t=setInterval(function(){
      wrapBridgeFullscreen();
      if(window.YandexGameBridge&&window.YandexGameBridge.__adsPolicyWrapped) clearInterval(t);
      if(++tries>40) clearInterval(t);
    },500);

    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.adsPol){
      overlay.dataset.adsPol='1';
      var wasOpen=!overlay.classList.contains('hidden');
      new MutationObserver(function(){
        var open=!overlay.classList.contains('hidden');
        if(wasOpen&&!open) onSoftClose('modal-close');
        wasOpen=open;
      }).observe(overlay,{attributes:true,attributeFilter:['class']});
    }

    var obsRoot=document.getElementById('game-container')||document.body;
    new MutationObserver(function(){ setTimeout(injectRaidDouble, 50); }).observe(obsRoot,{childList:true,subtree:true});

    document.addEventListener('click',function(e){
      var t=e.target;
      if(!t||!t.closest)return;
      if(t.closest('#raid-result-close')||t.closest('[data-raid-close]')||t.id==='raid-back'||(t.closest('button')&&/в меню|назад|закрыть/i.test(t.textContent||''))){
        var card=document.getElementById('raid-result');
        if(card&&!card.classList.contains('hidden')) setTimeout(function(){ onSoftClose('raid-close'); }, 500);
      }
    },true);

    console.log('[ads-policy] v1.1 ready, fullscreen CD', FULLSCREEN_CD/1000+'s');
  }

  window.AdsPolicy={ tryFullscreen:tryFullscreen, canFullscreen:canFullscreen, FULLSCREEN_CD:FULLSCREEN_CD };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
