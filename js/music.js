'use strict';
(function () {
  const TRACKS = {
    main: './assets/fon_osnova.mp3',
    raid: './assets/reid.mp3'
  };
  const VOLUME = { main: 0.35, raid: 0.4 };
  const FADE_MS = 450;

  let unlocked = false;
  let muted = false;
  let current = null; // 'main' | 'raid' | null
  let fadeTimer = 0;
  const players = {};

  function loadMuted() {
    try {
      return localStorage.getItem('avt_music_muted') === '1';
    } catch (e) {
      return false;
    }
  }
  function saveMuted() {
    try {
      localStorage.setItem('avt_music_muted', muted ? '1' : '0');
    } catch (e) {}
  }

  function ensure(id) {
    if (players[id]) return players[id];
    const a = new Audio(TRACKS[id]);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    players[id] = a;
    return a;
  }

  function stopFade() {
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = 0;
    }
  }

  function fadeTo(audio, target, ms, onDone) {
    stopFade();
    const start = audio.volume;
    const t0 = performance.now();
    fadeTimer = setInterval(function () {
      const t = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = start + (target - start) * t;
      if (t >= 1) {
        stopFade();
        audio.volume = target;
        if (onDone) onDone();
      }
    }, 30);
  }

  function playTrack(id) {
    if (!TRACKS[id]) return;
    if (current === id && players[id] && !players[id].paused) return;

    const next = ensure(id);
    const targetVol = muted ? 0 : VOLUME[id];

    // pause previous with fade
    const prevId = current;
    const prev = prevId ? players[prevId] : null;
    current = id;

    function startNext() {
      try {
        next.currentTime = 0;
      } catch (e) {}
      next.volume = 0;
      const p = next.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          if (!muted) fadeTo(next, targetVol, FADE_MS);
          else next.volume = 0;
        }).catch(function () {
          // autoplay blocked — wait for unlock
        });
      } else if (!muted) {
        fadeTo(next, targetVol, FADE_MS);
      }
    }

    if (prev && prev !== next && !prev.paused) {
      fadeTo(prev, 0, FADE_MS, function () {
        try {
          prev.pause();
        } catch (e) {}
        startNext();
      });
    } else {
      startNext();
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    // warm both
    ensure('main');
    ensure('raid');
    if (!muted && !current) playTrack('main');
    else if (current) playTrack(current);
  }

  function playMain() {
    if (muted) {
      current = 'main';
      return;
    }
    playTrack('main');
  }
  function playRaid() {
    if (muted) {
      current = 'raid';
      return;
    }
    playTrack('raid');
  }

  function setMuted(v) {
    muted = !!v;
    saveMuted();
    updateMuteBtn();
    Object.keys(players).forEach(function (id) {
      const a = players[id];
      if (!a) return;
      if (muted) {
        try {
          a.pause();
        } catch (e) {}
        a.volume = 0;
      } else if (current === id) {
        a.volume = VOLUME[id];
        a.play().catch(function () {});
      }
    });
    if (!muted && unlocked && current) playTrack(current);
  }

  function toggleMute() {
    setMuted(!muted);
  }

  function updateMuteBtn() {
    const btn = document.getElementById('music-mute-btn');
    if (!btn) return;
    btn.textContent = muted ? '🔇' : '🔊';
    btn.title = muted ? 'Включить музыку' : 'Выключить музыку';
    btn.setAttribute('aria-label', btn.title);
  }

  function ensureMuteButton() {
    if (document.getElementById('music-mute-btn')) return;
    const parent = document.getElementById('game-container') || document.body;
    const btn = document.createElement('button');
    btn.id = 'music-mute-btn';
    btn.type = 'button';
    btn.style.cssText =
      'position:absolute;left:10px;top:12px;z-index:40;width:40px;height:40px;border:1px solid rgba(255,255,255,.25);border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font-size:18px;cursor:pointer;backdrop-filter:blur(4px)';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      unlock();
      toggleMute();
    });
    parent.appendChild(btn);
    updateMuteBtn();
  }

  muted = loadMuted();

  function boot() {
    ensureMuteButton();
    // unlock on first interaction
    const unlockOnce = function () {
      unlock();
      document.removeEventListener('pointerdown', unlockOnce, true);
      document.removeEventListener('keydown', unlockOnce, true);
    };
    document.addEventListener('pointerdown', unlockOnce, true);
    document.addEventListener('keydown', unlockOnce, true);

    // start main after preloader if already unlocked somehow
    window.addEventListener('load', function () {
      setTimeout(function () {
        if (unlocked && !muted) playMain();
      }, 600);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.GameMusic = {
    playMain: playMain,
    playRaid: playRaid,
    unlock: unlock,
    toggleMute: toggleMute,
    setMuted: setMuted,
    isMuted: function () {
      return muted;
    }
  };
})();
