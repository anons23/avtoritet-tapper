'use strict';
(function () {
  let ctx = null;
  let unlocked = false;
  let master = null;

  function isMuted() {
    try {
      if (window.GameMusic && typeof window.GameMusic.isMuted === 'function') {
        return !!window.GameMusic.isMuted();
      }
    } catch (e) {}
    return false;
  }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') {
      c.resume().catch(function () {});
    }
    unlocked = true;
  }

  function env(gainNode, t0, a, d, s, r, peak) {
    const g = gainNode.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(peak, t0 + a);
    g.exponentialRampToValueAtTime(Math.max(0.0001, peak * s), t0 + a + d);
    g.exponentialRampToValueAtTime(0.0001, t0 + a + d + r);
  }

  function noiseBuffer(duration) {
    const c = ensureCtx();
    if (!c) return null;
    const n = Math.max(1, Math.floor(c.sampleRate * duration));
    const buf = c.createBuffer(1, n, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    return buf;
  }

  function playPunch(crit) {
    if (isMuted()) return;
    const c = ensureCtx();
    if (!c || !master) return;
    unlock();
    const t0 = c.currentTime;

    // body thud
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(crit ? 140 : 95, t0);
    osc.frequency.exponentialRampToValueAtTime(crit ? 55 : 40, t0 + 0.12);
    env(g, t0, 0.005, 0.04, 0.35, 0.1, crit ? 0.55 : 0.38);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.22);

    // noise slap
    const buf = noiseBuffer(0.08);
    if (buf) {
      const src = c.createBufferSource();
      const ng = c.createGain();
      const filt = c.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = crit ? 1800 : 900;
      filt.Q.value = 0.7;
      src.buffer = buf;
      env(ng, t0, 0.001, 0.02, 0.2, 0.05, crit ? 0.35 : 0.22);
      src.connect(filt);
      filt.connect(ng);
      ng.connect(master);
      src.start(t0);
    }

    if (crit) {
      // bright click on top
      const o2 = c.createOscillator();
      const g2 = c.createGain();
      o2.type = 'square';
      o2.frequency.setValueAtTime(880, t0);
      o2.frequency.exponentialRampToValueAtTime(440, t0 + 0.08);
      env(g2, t0, 0.002, 0.03, 0.15, 0.06, 0.12);
      o2.connect(g2);
      g2.connect(master);
      o2.start(t0);
      o2.stop(t0 + 0.12);
    }
  }

  function playHit(crit) {
    // slightly heavier for raids
    if (isMuted()) return;
    const c = ensureCtx();
    if (!c || !master) return;
    unlock();
    const t0 = c.currentTime;

    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(crit ? 160 : 110, t0);
    osc.frequency.exponentialRampToValueAtTime(crit ? 48 : 36, t0 + 0.14);
    env(g, t0, 0.004, 0.05, 0.3, 0.12, crit ? 0.5 : 0.34);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.26);

    const buf = noiseBuffer(0.1);
    if (buf) {
      const src = c.createBufferSource();
      const ng = c.createGain();
      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = crit ? 2400 : 1200;
      src.buffer = buf;
      env(ng, t0, 0.001, 0.025, 0.25, 0.07, crit ? 0.4 : 0.26);
      src.connect(filt);
      filt.connect(ng);
      ng.connect(master);
      src.start(t0);
    }
  }

  function playWin() {
    if (isMuted()) return;
    const c = ensureCtx();
    if (!c || !master) return;
    unlock();
    const t0 = c.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach(function (freq, i) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = t0 + i * 0.08;
      env(g, start, 0.01, 0.08, 0.5, 0.2, 0.22);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  function playClick() {
    if (isMuted()) return;
    const c = ensureCtx();
    if (!c || !master) return;
    unlock();
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t0);
    osc.frequency.exponentialRampToValueAtTime(800, t0 + 0.04);
    env(g, t0, 0.001, 0.02, 0.2, 0.03, 0.1);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.06);
  }

  function playEmpty() {
    if (isMuted()) return;
    const c = ensureCtx();
    if (!c || !master) return;
    unlock();
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.linearRampToValueAtTime(120, t0 + 0.15);
    env(g, t0, 0.01, 0.05, 0.4, 0.1, 0.12);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  }

  // unlock with first gesture
  function boot() {
    const once = function () {
      unlock();
      document.removeEventListener('pointerdown', once, true);
    };
    document.addEventListener('pointerdown', once, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.GameSFX = {
    unlock: unlock,
    punch: playPunch,
    hit: playHit,
    win: playWin,
    click: playClick,
    empty: playEmpty
  };
})();
