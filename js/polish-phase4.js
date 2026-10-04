/* polish-phase4 v1.0 — UI transitions helpers + extra short SFX */
'use strict';
(function () {
  function muted() {
    try {
      if (window.GameMusic && typeof window.GameMusic.isMuted === 'function') {
        return !!window.GameMusic.isMuted();
      }
    } catch (e) {}
    return false;
  }

  function ensureExtraSfx() {
    if (!window.GameSFX) return;
    if (window.GameSFX.open) return;

    var ctx = null;
    var master = null;

    function ac() {
      if (ctx) return ctx;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.42;
      master.connect(ctx.destination);
      return ctx;
    }

    function env(g, t0, a, d, s, r, peak) {
      g.cancelScheduledValues(t0);
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(peak, t0 + a);
      g.exponentialRampToValueAtTime(Math.max(0.0001, peak * s), t0 + a + d);
      g.exponentialRampToValueAtTime(0.0001, t0 + a + d + r);
    }

    function playOpen() {
      if (muted()) return;
      var c = ac();
      if (!c || !master) return;
      if (c.state === 'suspended') c.resume().catch(function () {});
      var t0 = c.currentTime;
      [320, 480].forEach(function (f, i) {
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        var st = t0 + i * 0.04;
        env(g.gain, st, 0.008, 0.04, 0.4, 0.08, 0.1);
        o.connect(g);
        g.connect(master);
        o.start(st);
        o.stop(st + 0.18);
      });
    }

    function playDeny() {
      if (muted()) return;
      var c = ac();
      if (!c || !master) return;
      if (c.state === 'suspended') c.resume().catch(function () {});
      var t0 = c.currentTime;
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(220, t0);
      o.frequency.exponentialRampToValueAtTime(90, t0 + 0.16);
      env(g.gain, t0, 0.005, 0.05, 0.3, 0.1, 0.12);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + 0.22);
    }

    function playCoin() {
      if (muted()) return;
      var c = ac();
      if (!c || !master) return;
      if (c.state === 'suspended') c.resume().catch(function () {});
      var t0 = c.currentTime;
      [880, 1320].forEach(function (f, i) {
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        var st = t0 + i * 0.045;
        env(g.gain, st, 0.004, 0.03, 0.35, 0.08, 0.09);
        o.connect(g);
        g.connect(master);
        o.start(st);
        o.stop(st + 0.16);
      });
    }

    window.GameSFX.open = playOpen;
    window.GameSFX.deny = playDeny;
    window.GameSFX.coin = playCoin;
  }

  function flash() {
    var gc = document.getElementById('game-container');
    if (!gc) return;
    gc.classList.remove('phase4-flash');
    void gc.offsetWidth;
    gc.classList.add('phase4-flash');
    setTimeout(function () { gc.classList.remove('phase4-flash'); }, 240);
  }

  function bump(el) {
    if (!el) return;
    el.classList.remove('is-bump');
    void el.offsetWidth;
    el.classList.add('is-bump');
    setTimeout(function () { el.classList.remove('is-bump'); }, 300);
  }

  function watchModal() {
    var o = document.getElementById('modal-overlay');
    if (!o) return;
    var wasHidden = o.classList.contains('hidden');
    new MutationObserver(function () {
      var hidden = o.classList.contains('hidden');
      if (wasHidden && !hidden) {
        try { window.GameSFX && window.GameSFX.open && window.GameSFX.open(); } catch (e) {}
      }
      wasHidden = hidden;
    }).observe(o, { attributes: true, attributeFilter: ['class'] });
  }

  function watchFeedback() {
    var f = document.getElementById('tap-feedback');
    if (!f) return;
    new MutationObserver(function () {
      if (!f.classList.contains('show')) return;
      var t = (f.textContent || '').trim();
      if (t.indexOf('\u26a1') !== -1 || t.indexOf('⚡') !== -1) flash();
    }).observe(f, { attributes: true, attributeFilter: ['class'] });
  }

  function watchResources() {
    ['points', 'chifir', 'energy'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var last = el.textContent;
      new MutationObserver(function () {
        var now = el.textContent;
        if (now === last) return;
        var prev = last;
        last = now;
        var wrap = el.closest('.resource') || el.parentElement;
        bump(wrap);
        if (id === 'chifir' || id === 'points') {
          try {
            var n = parseInt(String(now).replace(/\s/g, ''), 10);
            var p = parseInt(String(prev).replace(/\s/g, ''), 10);
            if (Number.isFinite(n) && Number.isFinite(p) && (n - p) >= 25) {
              window.GameSFX && window.GameSFX.coin && window.GameSFX.coin();
            }
          } catch (e) {}
        }
      }).observe(el, { characterData: true, childList: true, subtree: true });
    });
  }

  function denyClicks() {
    document.addEventListener(
      'pointerdown',
      function (e) {
        if (e.button != null && e.button !== 0) return;
        var t = e.target;
        if (!t || !t.closest) return;
        var btn = t.closest('button');
        if (!btn || !btn.disabled) return;
        try { window.GameSFX && window.GameSFX.deny && window.GameSFX.deny(); } catch (err) {}
      },
      true
    );
  }

  function boot() {
    ensureExtraSfx();
    watchModal();
    watchFeedback();
    watchResources();
    denyClicks();
    console.log('[polish-phase4] ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
