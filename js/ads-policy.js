/* ads-policy v1.7 — interstitial 5min; +2min grace after rewarded; tabs only; no fight */
'use strict';
(function () {
  var FULLSCREEN_CD = 300000; // 5 minutes between auto interstitials
  var REWARDED_GRACE = 120000; // 2 minutes after rewarded before any auto interstitial
  var LS_KEY = 'avt_ads_policy_v1';
  var lastFs = 0;
  var lastRewarded = 0;
  var sessionStartedAt = Date.now();
  var hasSavedFullscreenTime = false;
  var pendingRaidDouble = null;
  var raidDoubleUsed = false;
  var pendingFullscreen = false;
  var transitionTimer = 0;

  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (saved && typeof saved.lastFs === 'number') {
      lastFs = saved.lastFs;
      hasSavedFullscreenTime = true;
    }
    if (saved && typeof saved.lastRewarded === 'number') {
      lastRewarded = saved.lastRewarded;
    }
  } catch (e) {}

  if (!hasSavedFullscreenTime) {
    lastFs = Date.now();
  }

  function persist() {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ lastFs: lastFs, lastRewarded: lastRewarded })
      );
    } catch (e) {}
  }
  if (!hasSavedFullscreenTime) persist();

  function st() {
    try {
      if (typeof window.getGameState === 'function') return window.getGameState();
    } catch (e) {}
    return window.s || null;
  }
  function save() {
    try {
      if (typeof window.saveGame === 'function') window.saveGame();
    } catch (e) {}
  }
  function ui() {
    try {
      if (typeof window.ui === 'function') window.ui();
    } catch (e) {}
  }
  function msg(t) {
    var e = document.getElementById('event-message');
    if (e) {
      e.textContent = t;
      e.classList.add('show');
      setTimeout(function () {
        e.classList.remove('show');
      }, 2400);
    } else if (typeof window.msg === 'function') {
      try {
        window.msg(t);
      } catch (err) {}
    }
  }

  function pauseMusic() {
    try {
      window.__AVT_AD_SHOWING = true;
      if (window.GameMusic && typeof window.GameMusic.pauseForAd === 'function') {
        window.GameMusic.pauseForAd();
      }
    } catch (e) {}
  }

  function inRaidFight() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return false;
    if (overlay.classList.contains('raid-selection-fullscreen')) return false;
    return overlay.classList.contains('raid-fullscreen');
  }

  function isBusyGameplay() {
    if (window.__AVT_AD_SHOWING === true) return true;
    if (window.__AVT_ONBOARDING_ACTIVE === true) return true;
    if (inRaidFight()) return true;
    if (document.body && document.body.classList.contains('raid-fight-active')) return true;
    return false;
  }

  function canShowAd() {
    var now = Date.now();
    if (now - sessionStartedAt < FULLSCREEN_CD) return false;
    if (now - lastFs < FULLSCREEN_CD) return false;
    // After player watched rewarded — wait 2 more minutes before auto interstitial
    if (lastRewarded && now - lastRewarded < REWARDED_GRACE) return false;
    if (isBusyGameplay()) return false;
    return true;
  }
  function canFullscreen() {
    return canShowAd();
  }
  function markFullscreenShown() {
    lastFs = Date.now();
    pendingFullscreen = false;
    persist();
  }
  function markRewardedViewed() {
    lastRewarded = Date.now();
    persist();
    console.log('[ads-policy] rewarded grace 2min started');
  }

  function tryFullscreen(reason) {
    if (!canFullscreen()) {
      console.log('[ads-policy] fullscreen skip', reason);
      return false;
    }
    var bridge = window.PlatformBridge;
    var fn =
      bridge && typeof bridge.showFullscreenAd === 'function'
        ? bridge.showFullscreenAd
        : null;
    if (!fn && typeof window.showFullscreenAd === 'function') fn = window.showFullscreenAd;
    if (!fn) return false;
    try {
      pauseMusic();
      var ok = fn.call(bridge || window);
      if (ok !== false) {
        markFullscreenShown();
        return true;
      }
    } catch (e) {
      console.warn('[ads-policy] fullscreen error', e);
    }
    return false;
  }

  function wrapBridgeFullscreen() {
    var bridge = window.PlatformBridge;
    if (!bridge || typeof bridge.showFullscreenAd !== 'function' || bridge.__adsPolicyWrapped) return;
    var orig = bridge.showFullscreenAd.bind(bridge);
    bridge.showFullscreenAd = function () {
      if (!canFullscreen()) return false;
      pauseMusic();
      var ok = orig();
      if (ok !== false) markFullscreenShown();
      return ok;
    };
    bridge.__adsPolicyWrapped = true;
  }

  function captureRaidWinFromDom() {
    var title = document.getElementById('raid-result-title');
    var text = document.getElementById('raid-result-text');
    if (!title || !text) return null;
    if ((title.textContent || '').indexOf('ПОБЕДА') < 0) return null;
    var m = (text.textContent || '').match(/\+(\d[\d\s]*)\s*🍵\s*·\s*\+(\d[\d\s]*)\s*⭐/);
    if (!m) return null;
    return {
      chifir: parseInt(String(m[1]).replace(/\s/g, ''), 10) || 0,
      points: parseInt(String(m[2]).replace(/\s/g, ''), 10) || 0
    };
  }

  function injectRaidDouble() {
    var card = document.getElementById('raid-result');
    if (!card || card.classList.contains('hidden')) return;
    if (card.dataset.doubleAd === '1') return;
    var rew = captureRaidWinFromDom();
    if (!rew) return;
    var sig =
      rew.chifir +
      ':' +
      rew.points +
      ':' +
      (document.getElementById('raid-result-text') || {}).textContent;
    if (card.dataset.doubleSig !== sig) {
      card.dataset.doubleSig = sig;
      raidDoubleUsed = false;
      pendingRaidDouble = rew;
    }
    if (raidDoubleUsed) return;
    card.dataset.doubleAd = '1';
    var wrap = document.createElement('div');
    wrap.id = 'raid-double-wrap';
    wrap.style.cssText = 'margin:12px 0 0;padding:0 4px';
    wrap.innerHTML =
      '<button type="button" id="raid-double-ad" style="width:100%;padding:14px;border-radius:12px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;font-weight:900;font-size:14px;cursor:pointer">📺 Удвоить награду (+' +
      rew.chifir +
      ' 🍵 · +' +
      rew.points +
      ' ⭐)</button>';
    var text = document.getElementById('raid-result-text');
    if (text && text.parentNode) text.parentNode.insertBefore(wrap, text.nextSibling);
    else card.appendChild(wrap);
    var b = document.getElementById('raid-double-ad');
    if (b)
      b.onclick = function () {
        if (raidDoubleUsed) {
          msg('Уже удвоено');
          return;
        }
        if (typeof window.showRewardedAd !== 'function') {
          msg('📺 Реклама пока недоступна');
          return;
        }
        window.showRewardedAd(function (ok) {
          if (!ok) {
            msg('📺 Реклама не просмотрена');
            return;
          }
          var s = st();
          if (!s || !pendingRaidDouble) return;
          s.chifir = (Number(s.chifir) || 0) + pendingRaidDouble.chifir;
          s.points = (Number(s.points) || 0) + pendingRaidDouble.points;
          if (s.tasks) s.tasks.earned = (Number(s.tasks.earned) || 0) + pendingRaidDouble.chifir;
          raidDoubleUsed = true;
          save();
          ui();
          var rx = document.getElementById('raid-result-text');
          if (rx) rx.textContent = (rx.textContent || '') + ' · ×2 за рекламу';
          b.disabled = true;
          b.textContent = '✅ Награда удвоена';
          b.style.opacity = '0.7';
          msg('🎁 Награда удвоена!');
        });
      };
  }

  function refreshPending() {
    pendingFullscreen = canFullscreen();
    return pendingFullscreen;
  }

  function scheduleSafeTransition(reason, delay) {
    if (isBusyGameplay()) return;
    refreshPending();
    if (!pendingFullscreen) return;
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function () {
      if (isBusyGameplay()) return;
      refreshPending();
      if (!pendingFullscreen || !canFullscreen()) return;
      var shown = tryFullscreen(reason);
      if (shown) pendingFullscreen = false;
    }, typeof delay === 'number' ? delay : 450);
  }

  function boot() {
    wrapBridgeFullscreen();

    var obsRoot = document.getElementById('game-container') || document.body;
    new MutationObserver(function () {
      setTimeout(injectRaidDouble, 50);
    }).observe(obsRoot, { childList: true, subtree: true });

    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('#btn-shop,#btn-rank,#btn-tasks,#btn-more,#settings-gear-button')) {
          if (isBusyGameplay()) return;
          scheduleSafeTransition('tab-open', 550);
        }
      },
      true
    );

    console.log(
      '[ads-policy] v1.7 interstitial 5min + 2min after rewarded; tabs only; no fight'
    );
  }

  window.AdsPolicy = {
    tryFullscreen: tryFullscreen,
    canFullscreen: canFullscreen,
    canShowAd: canShowAd,
    secondsUntilNextAd: function () {
      var now = Date.now();
      var a = FULLSCREEN_CD - (now - sessionStartedAt);
      var b = FULLSCREEN_CD - (now - lastFs);
      var c = lastRewarded ? REWARDED_GRACE - (now - lastRewarded) : 0;
      return Math.max(0, Math.ceil(Math.max(a, b, c) / 1000));
    },
    markRewardedViewed: markRewardedViewed,
    FULLSCREEN_CD: FULLSCREEN_CD,
    REWARDED_GRACE: REWARDED_GRACE,
    hasPendingFullscreen: function () {
      return pendingFullscreen;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
