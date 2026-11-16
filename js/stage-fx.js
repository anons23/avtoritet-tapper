/* stage-fx.js v1 — transitions between stages (Груша → Сокамерник → Отжимания → Тренажёр → Разборка).
   game.js calls AVT_StageFX.play(from, to, names) right after the stage index changes in tap(),
   BEFORE the UI swaps the object and rank background. We snapshot the old look, let the game
   swap underneath, and hide the swap behind the chosen effect. */
'use strict';
(function () {
  // from-stage → effect
  var EFFECT_BY_TARGET = { 1: 'flash', 2: 'bars', 3: 'fade', 4: 'gold' };
  var busy = false;

  function css() {
    if (document.getElementById('stage-fx-style')) return;
    var s = document.createElement('style');
    s.id = 'stage-fx-style';
    s.textContent =
      '.sfx-layer{position:absolute;inset:0;pointer-events:none}' +
      '.sfx-oldbg{z-index:0;background-size:cover;background-position:center}' +
      '.sfx-oldobj{z-index:3;display:flex;align-items:center;justify-content:center}' +
      '.sfx-oldobj img{position:absolute;filter:drop-shadow(0 14px 18px rgba(0,0,0,.55))}' +
      '.sfx-cover{z-index:1400}' +
      '.sfx-flash{background:#fff;opacity:0}' +
      '.sfx-flash.gold{background:radial-gradient(circle at 50% 45%,#fff6d6 0,#f3c14b 45%,#7a5410 100%)}' +
      '.sfx-bars{transform:translateY(-102%);box-shadow:0 10px 30px #000;' +
        'background:repeating-linear-gradient(90deg,transparent 0 26px,#262626 26px 31px,#8c8c8c 31px 32px,#191919 32px 36px,transparent 36px 62px),' +
        'linear-gradient(180deg,#171717 0 6%,transparent 6% 47%,#171717 47% 51%,transparent 51% 94%,#171717 94%)}' +
      '.sfx-bars:after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.35)}' +
      '.sfx-banner{z-index:1410;top:27%;bottom:auto;left:8%;right:8%;text-align:center;opacity:0;padding:12px 10px 14px;border-radius:18px;background:radial-gradient(ellipse at center,rgba(0,0,0,.62) 0,rgba(0,0,0,.35) 60%,rgba(0,0,0,0) 100%)}' +
      '.sfx-banner .k{font-size:12px;letter-spacing:.2em;color:#d5a84a;font-weight:900;text-shadow:0 2px 6px #000}' +
      '.sfx-banner .t{font-size:clamp(30px,9vw,46px);font-weight:1000;color:#fff;line-height:1.05;text-shadow:0 4px 18px #000,0 0 2px #000}' +
      '.sfx-banner .s{font-size:13px;color:#e6e0d0;text-shadow:0 2px 6px #000;margin-top:2px}' +
      '.sfx-banner.gold .t{color:#ffd66b}';
    document.head.appendChild(s);
  }
  function game() { return document.getElementById('game-container'); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function layer(cls) { var d = document.createElement('div'); d.className = 'sfx-layer ' + cls; game().appendChild(d); return d; }
  function shake(px, ms) {
    var g = game(); if (!g || !g.animate) return;
    g.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + (-px) + 'px,' + (px / 2) + 'px)' }, { transform: 'translate(' + px + 'px,' + (-px / 2) + 'px)' },
      { transform: 'translate(' + (-px / 2) + 'px,0)' }, { transform: 'translate(0,0)' }], { duration: ms || 240 });
  }

  /* Snapshot of the old background + old object so the swap underneath stays hidden. */
  function snapshot() {
    var g = game(), snap = {};
    var bg = getComputedStyle(g).backgroundImage;
    if (bg && bg !== 'none') { snap.bg = layer('sfx-oldbg'); g.insertBefore(snap.bg, g.firstChild); snap.bg.style.backgroundImage = bg; }
    var emoji = document.getElementById('object-emoji');
    var img = emoji && [].slice.call(emoji.querySelectorAll('img[data-stage]')).find(function (i) { return i.style.display !== 'none' && i.style.visibility !== 'hidden'; });
    if (img) {
      var gr = g.getBoundingClientRect(), r = img.getBoundingClientRect();
      var holder = layer('sfx-oldobj');
      var c = img.cloneNode(true);
      c.removeAttribute('data-stage'); c.className = ''; c.style.cssText = '';
      c.style.left = (r.left - gr.left) + 'px'; c.style.top = (r.top - gr.top) + 'px';
      c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; c.style.objectFit = 'contain';
      holder.appendChild(c); snap.obj = holder; snap.img = c;
    }
    /* hide the live object so the swap to the new stage can't be seen before the cover is up */
    if (emoji) { emoji.style.opacity = '0'; snap.emoji = emoji; }
    return snap;
  }
  function dropSnapshot(snap) {
    if (snap.emoji) snap.emoji.style.opacity = '';
    if (snap.bg) snap.bg.remove();
    if (snap.obj) snap.obj.remove();
  }
  function newObjectImg() {
    var emoji = document.getElementById('object-emoji');
    return emoji && [].slice.call(emoji.querySelectorAll('img[data-stage]')).find(function (i) { return i.style.display !== 'none'; });
  }
  function banner(names, gold) {
    var b = layer('sfx-banner' + (gold ? ' gold' : ''));
    b.innerHTML = '<div class="k">НОВАЯ МАСТЬ</div><div class="t">' + String(names.rank || '').toUpperCase() + '</div><div class="s">этап: ' + (names.stage || '') + ' · +1 сила тапа</div>';
    return b;
  }

  var EFFECTS = {
    /* П2 — удар со вспышкой */
    flash: async function (snap, names, gold) {
      shake(6);
      var f = layer('sfx-cover sfx-flash' + (gold ? ' gold' : ''));
      await f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished;
      dropSnapshot(snap);
      var im = newObjectImg();
      if (im) im.animate([{ opacity: 0.4, filter: 'brightness(2)' }, { opacity: 1, filter: 'brightness(1.15)', offset: 0.6 }, { opacity: 1, filter: 'brightness(1)' }], { duration: 520 });
      var obj = document.getElementById('object-emoji');
      if (obj) obj.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(.96)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: gold ? 700 : 420, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { f.remove(); };
      setTimeout(function () { shake(4); }, 280);
      var b = banner(names, gold);
      await b.animate([{ opacity: 0, transform: 'scale(2.4) rotate(-8deg)' }, { opacity: 1, transform: 'scale(.95) rotate(-5deg)', offset: 0.12 },
        { opacity: 1, transform: 'scale(1) rotate(-5deg)', offset: 0.2 }, { opacity: 1, transform: 'scale(1) rotate(-5deg)', offset: 0.85 },
        { opacity: 0, transform: 'scale(1) rotate(-5deg)' }], { duration: 2300, easing: 'ease-out' }).finished;
      b.remove();
    },
    /* П3 — решётка */
    bars: async function (snap, names) {
      var bars = layer('sfx-cover sfx-bars');
      await bars.animate([{ transform: 'translateY(-102%)' }, { transform: 'translateY(3%)', offset: 0.82 }, { transform: 'translateY(0)' }],
        { duration: 520, easing: 'cubic-bezier(.55,0,.9,.45)', fill: 'forwards' }).finished;
      shake(5);
      try { if (window.GameSFX && typeof window.GameSFX.punch === 'function') window.GameSFX.punch(true); } catch (e) {}
      dropSnapshot(snap);
      var b = banner(names);
      b.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none', offset: 0.15 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], { duration: 2100 })
        .onfinish = function () { b.remove(); };
      await wait(650);
      await bars.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-102%)' }], { duration: 600, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
      bars.remove();
      await wait(800);
    },
    /* П1 — плавный кросс-фейд */
    fade: async function (snap, names) {
      if (snap.obj) snap.obj.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(40px) scale(.82)', opacity: 0 }], { duration: 420, easing: 'ease-in', fill: 'forwards' });
      if (snap.bg) snap.bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1100, easing: 'ease-in-out', fill: 'forwards' });
      if (snap.emoji) snap.emoji.style.opacity = '';
      var obj = document.getElementById('object-emoji');
      if (obj) obj.animate([{ transform: 'translateY(60px) scale(.7)', opacity: 0 }, { transform: 'translateY(0) scale(.7)', opacity: 0, offset: 0.35 },
        { transform: 'translateY(-8px) scale(1.04)', opacity: 1, offset: 0.8 }, { transform: 'none', opacity: 1 }], { duration: 1000, easing: 'cubic-bezier(.2,.8,.2,1)' });
      var b = banner(names);
      await b.animate([{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none', offset: 0.2 }, { opacity: 1, transform: 'none', offset: 0.8 },
        { opacity: 0, transform: 'translateY(-10px)' }], { duration: 2200, easing: 'ease-out' }).finished;
      b.remove(); dropSnapshot(snap);
    },
    /* Авторитет — золотая вспышка со штампом */
    gold: function (snap, names) { return EFFECTS.flash(snap, names, true); }
  };

  function play(from, to, names) {
    try {
      if (busy || !game() || !document.body.animate) return;
      var st = window.getGameState ? window.getGameState() : null;
      if (st && st.jailed) return;
      var effect = EFFECT_BY_TARGET[to];
      if (!effect || to <= from) return;
      css();
      busy = true;
      var snap = snapshot();
      Promise.resolve(EFFECTS[effect](snap, names || {}))
        .catch(function (e) { console.warn('[stage-fx]', e); })
        .then(function () { dropSnapshot(snap); busy = false; });
    } catch (e) { busy = false; console.warn('[stage-fx]', e); }
  }

  window.AVT_StageFX = { play: play };
})();
