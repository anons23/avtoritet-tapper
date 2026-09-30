'use strict';
(function () {
  /* Two main-menu tracks rotate each time music is turned back on */
  const MAIN_TRACKS = [
    './assets/fon_osnova.mp3',
    './assets/fon_osnova1.mp3'
  ];
  const TRACKS = {
    main0: MAIN_TRACKS[0],
    main1: MAIN_TRACKS[1],
    raid: './assets/reid.mp3'
  };
  /* Background levels kept moderate so SFX stay audible */
  const VOLUME = { main0: 0.22, main1: 0.22, raid: 0.28 };
  const FADE_MS = 450;

  let unlocked = false;
  let muted = false;
  let current = null;
  let mainIndex = 0;
  let fadeTimer = 0;
  const players = {};

  function loadMuted() {
    try { return localStorage.getItem('avt_music_muted') === '1'; }
    catch (e) { return false; }
  }
  function saveMuted() {
    try { localStorage.setItem('avt_music_muted', muted ? '1' : '0'); }
    catch (e) {}
  }
  function loadMainIndex() {
    try {
      const v = parseInt(localStorage.getItem('avt_main_track') || '0', 10);
      return v === 1 ? 1 : 0;
    } catch (e) { return 0; }
  }
  function saveMainIndex() {
    try { localStorage.setItem('avt_main_track', String(mainIndex)); }
    catch (e) {}
  }

  function ensure(id) {
    if (players[id]) return players[id];
    if (!TRACKS[id]) return null;
    const a = new Audio(TRACKS[id]);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    players[id] = a;
    return a;
  }

  function stopFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = 0; }
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
    if (current === id && players[id] && !players[id].paused && players[id].volume > 0.01) return;

    const next = ensure(id);
    if (!next) return;
    const targetVol = muted ? 0 : VOLUME[id];

    const prevId = current;
    const prev = prevId ? players[prevId] : null;
    current = id;

    function startNext() {
      try { next.currentTime = 0; } catch (e) {}
      next.volume = 0;
      const p = next.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          if (!muted) fadeTo(next, targetVol, FADE_MS);
          else next.volume = 0;
        }).catch(function () {});
      } else if (!muted) {
        fadeTo(next, targetVol, FADE_MS);
      }
    }

    if (prev && prev !== next && !prev.paused) {
      fadeTo(prev, 0, FADE_MS, function () {
        try { prev.pause(); } catch (e) {}
        startNext();
      });
    } else {
      startNext();
    }
  }

  function playMain() {
    playTrack('main' + mainIndex);
  }

  function playRaid() {
    playTrack('raid');
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ensure('main0');
    ensure('main1');
    ensure('raid');
    if (!muted) {
      if (current === 'raid') playRaid();
      else playMain();
    }
  }

  function setMuted(v) {
    const wasMuted = muted;
    muted = !!v;
    saveMuted();
    updateMuteBtn();

    if (muted) {
      Object.keys(players).forEach(function (id) {
        const a = players[id];
        if (!a) return;
        try { a.pause(); } catch (e) {}
        a.volume = 0;
      });
      return;
    }

    if (wasMuted) {
      if (!current || String(current).indexOf('main') === 0) {
        mainIndex = mainIndex === 0 ? 1 : 0;
        saveMainIndex();
        playMain();
        return;
      }
      if (current === 'raid') {
        playRaid();
        return;
      }
    }

    if (current) playTrack(current);
    else playMain();
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
    btn.classList.toggle('is-muted', muted);
  }

  function injectMuteStyles() {
    if (document.getElementById('music-mute-style')) return;
    const s = document.createElement('style');
    s.id = 'music-mute-style';
    s.textContent =
      '#music-mute-btn{' +
      'position:absolute;left:8px;top:52px;z-index:40;' +
      'width:38px;height:38px;padding:0;' +
      'border:1px solid rgba(255,255,255,.28);border-radius:10px;' +
      'background:rgba(0,0,0,.58);color:#fff;font-size:17px;line-height:1;' +
      'cursor:pointer;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.35);' +
      '}' +
      '#music-mute-btn:active{transform:scale(.92)}' +
      '#music-mute-btn.is-muted{opacity:.85;border-color:rgba(255,120,120,.4)}' +
      '@media (min-width:701px){' +
      '#music-mute-btn{left:12px;top:14px;width:40px;height:40px;font-size:18px}' +
      '}' +
      '@media (max-width:700px){' +
      '#music-mute-btn{left:8px;top:54px;width:36px;height:36px;font-size:16px}' +
      '}' +
      '@media (max-width:700px) and (orientation:landscape){' +
      '#music-mute-btn{top:46px;width:32px;height:32px;font-size:14px}' +
      '}';
    document.head.appendChild(s);
  }

  function ensureMuteButton() {
    injectMuteStyles();
    if (document.getElementById('music-mute-btn')) {
      updateMuteBtn();
      return;
    }
    const parent = document.getElementById('game-container') || document.body;
    const btn = document.createElement('button');
    btn.id = 'music-mute-btn';
    btn.type = 'button';
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
  mainIndex = loadMainIndex();

  function boot() {
    ensureMuteButton();
    const unlockOnce = function () {
      unlock();
      document.removeEventListener('pointerdown', unlockOnce, true);
      document.removeEventListener('keydown', unlockOnce, true);
    };
    document.addEventListener('pointerdown', unlockOnce, true);
    document.addEventListener('keydown', unlockOnce, true);

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
    isMuted: function () { return muted; },
    getMainTrackIndex: function () { return mainIndex; },
    setVolume: function (mainVol, raidVol) {
      if (typeof mainVol === 'number') {
        VOLUME.main0 = Math.max(0, Math.min(1, mainVol));
        VOLUME.main1 = VOLUME.main0;
      }
      if (typeof raidVol === 'number') {
        VOLUME.raid = Math.max(0, Math.min(1, raidVol));
      }
      if (!muted && current && players[current]) {
        players[current].volume = VOLUME[current] || 0.22;
      }
    }
  };
})();
