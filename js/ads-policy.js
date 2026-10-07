/* ads-policy v1.0 — мягкая реклама: interstitial ≥3.5 мин, ×2 рейд, ускоритель за rewarded */
'use strict';
(function(){
  var FULLSCREEN_CD=210000; // 3.5 минуты между fullscreen
  var LS_KEY='avt_ads_policy_v1';
  var lastFs=0;
  var pendingRaidDouble=null; // {chifir,points,fighter}
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

  function canFullscreen(){
    return Date.now()-lastFs>=FULLSCREEN_CD;
  }

  function markFullscreenShown(){
    lastFs=Date.now();
    persist();
  }

  /** Fullscreen только если прошло ≥3.5 мин */
  function tryFullscreen(reason){
    if(!canFullscreen()){
      console.log('[ads-policy] fullscreen skip (cd)', reason, Math.ceil((FULLSCREEN_CD-(Date.now()-lastFs))/1000)+'s');
      return false;
    }
    var bridge=window.YandexGameBridge;
    var fn=bridge&&typeof bridge.showFullscreenAd==='function'?bridge.showFullscreenAd:null;
    // fallback если кто-то повесил на window
    if(!fn&&typeof window.showFullscreenAd==='function') fn=window.showFullscreenAd;
    if(!fn)return false;
    try{
      var ok=fn.call(bridge||window);
      if(ok!==false){
        markFullscreenShown();
        console.log('[ads-policy] fullscreen shown', reason||'');
        return true;
      }
    }catch(e){ console.warn('[ads-policy] fullscreen error',e); }
    return false;
  }

  function wrapBridgeFullscreen(){
    var bridge=window.YandexGameBridge;
    if(!bridge||typeof bridge.showFullscreenAd!=='function'||bridge.__adsPolicyWrapped)return;
    var orig=bridge.showFullscreenAd.bind(bridge);
    bridge.showFullscreenAd=function(){
      if(!canFullscreen()){
        console.log('[ads-policy] blocked raw fullscreen (cd)');
        return false;
      }
      var ok=orig();
      if(ok!==false) markFullscreenShown();
      return ok;
    };
    bridge.__adsPolicyWrapped=true;
  }

  /* ===== Ускоритель ×2 на 100 тапов за рекламу ===== */
  function grantBooster(){
    var s=st();
    if(!s)return;
    s.boosters=s.boosters||{double:0};
    s.boosters.double=(Number(s.boosters.double)||0)+100;
    save(); ui();
    msg('🔥 Ускоритель +100 тапов (×2) за рекламу');
  }

  function watchBoosterAd(){
    if(typeof window.showRewardedAd!=='function'){
      msg('📺 Реклама пока недоступна');
      return;
    }
    window.showRewardedAd(function(ok){
      if(ok) grantBooster();
      else msg('📺 Реклама не просмотрена — ускоритель не выдан');
    });
  }

  function injectShopBoosterAd(){
    var content=document.getElementById('modal-content');
    if(!content)return;
    if(content.dataset.boosterAd==='1')return;
    // только качалка / shop с ускорителем
    var hasBoost=content.querySelector('[data-b="d"]');
    if(!hasBoost)return;
    content.dataset.boosterAd='1';

    var btn=document.createElement('button');
    btn.type='button';
    btn.id='shop-booster-ad';
    btn.className='eq-btn shop-eq-link';
    btn.style.cssText='width:100%;margin:10px 0 0;padding:12px;font-size:14px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;border-radius:12px;font-weight:800;cursor:pointer';
    btn.innerHTML='📺 Ускоритель ×2 на 100 тапов <small style="opacity:.85">за рекламу</small>';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      watchBoosterAd();
    });

    var eq=content.querySelector('#shop-eq-btn');
    if(eq&&eq.parentNode) eq.parentNode.insertBefore(btn, eq);
    else content.appendChild(btn);
  }

  /* ===== ×2 награда после победы в рейде ===== */
  function captureRaidWinFromDom(){
    var title=document.getElementById('raid-result-title');
    var text=document.getElementById('raid-result-text');
    if(!title||!text)return null;
    if((title.textContent||'').indexOf('ПОБЕДА')<0)return null;
    var m=(text.textContent||'').match(/\+(\d[\d\s]*)\s*🍵\s*·\s*\+(\d[\d\s]*)\s*⭐/);
    if(!m)return null;
    var chifir=parseInt(String(m[1]).replace(/\s/g,''),10)||0;
    var points=parseInt(String(m[2]).replace(/\s/g,''),10)||0;
    if(chifir<=0&&points<=0)return null;
    return {chifir:chifir,points:points};
  }

  function injectRaidDouble(){
    var card=document.getElementById('raid-result');
    if(!card||card.classList.contains('hidden'))return;
    if(card.dataset.doubleAd==='1')return;

    var rew=captureRaidWinFromDom();
    if(!rew)return;

    // новая победа — сбрасываем флаг использования
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
    wrap.innerHTML=
      '<button type="button" id="raid-double-ad" style="width:100%;padding:14px;border-radius:12px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;font-weight:900;font-size:14px;cursor:pointer">'+
      '📺 Удвоить награду (+'+rew.chifir+' 🍵 · +'+rew.points+' ⭐)</button>';

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
        if(rx){
          rx.textContent=(rx.textContent||'')+' · ×2 за рекламу';
        }
        var btn=document.getElementById('raid-double-ad');
        if(btn){ btn.disabled=true; btn.textContent='✅ Награда удвоена'; btn.style.opacity='0.7'; }
        msg('🎁 Награда удвоена!');
      });
    };
  }

  /* Fullscreen после закрытия тяжёлых экранов (с КД) */
  function onSoftClose(reason){
    // небольшая задержка, чтобы UI успел закрыться
    setTimeout(function(){ tryFullscreen(reason); }, 400);
  }

  function boot(){
    wrapBridgeFullscreen();
    // мост может появиться позже
    var tries=0;
    var t=setInterval(function(){
      wrapBridgeFullscreen();
      if(window.YandexGameBridge&&window.YandexGameBridge.__adsPolicyWrapped) clearInterval(t);
      if(++tries>40) clearInterval(t);
    },500);

    var overlay=document.getElementById('modal-overlay');
    if(overlay&&!overlay.dataset.adsPol){
      overlay.dataset.adsPol='1';
      new MutationObserver(function(){
        setTimeout(injectShopBoosterAd, 40);
      }).observe(overlay,{childList:true,subtree:true});

      // fullscreen при закрытии модалки
      var wasOpen=!overlay.classList.contains('hidden');
      new MutationObserver(function(){
        var open=!overlay.classList.contains('hidden');
        if(wasOpen&&!open) onSoftClose('modal-close');
        wasOpen=open;
      }).observe(overlay,{attributes:true,attributeFilter:['class']});
    }

    // рейд-результат
    var obsRoot=document.getElementById('game-container')||document.body;
    new MutationObserver(function(){
      setTimeout(injectRaidDouble, 50);
    }).observe(obsRoot,{childList:true,subtree:true});

    // закрытие рейд-карточки → soft fullscreen
    document.addEventListener('click',function(e){
      var t=e.target;
      if(!t||!t.closest)return;
      if(t.closest('#raid-result-close')||t.closest('[data-raid-close]')||t.id==='raid-back'||(t.closest('button')&&/в меню|назад|закрыть/i.test(t.textContent||''))){
        var card=document.getElementById('raid-result');
        if(card&&!card.classList.contains('hidden')){
          setTimeout(function(){ onSoftClose('raid-close'); }, 500);
        }
      }
    },true);

    console.log('[ads-policy] v1.0 ready, fullscreen CD', FULLSCREEN_CD/1000+'s');
  }

  window.AdsPolicy={
    tryFullscreen:tryFullscreen,
    canFullscreen:canFullscreen,
    watchBoosterAd:watchBoosterAd,
    FULLSCREEN_CD:FULLSCREEN_CD
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
