/* rank-bg-fx.js v1 — живые фоны для каждой масти.
   Салага: капель, лунный свет из окна, мигающие плафоны.
   Пацан: качающаяся лампа с пятном света, иногда пробегает таракан.
   Блатной: мерцающий телик с отсветами, парящий чайник, огонёк радио.
   Смотрящий: закатные лучи, прожектор с вышки, птицы, блики в лужах, фонари.
   Авторитет: лампа, пыль, дым, дождь с прожектором, блик короны (+ Т3 «Влияние» на тап).
   Слой совмещается с фоновой картинкой (cover/contain + position), поэтому эффекты стоят на деталях картинки.
   Не работает в карцере, при открытых окнах и когда приложение свёрнуто. */
'use strict';
(function () {
  var SIZE = {
    'mobile/salaga': [768, 1376], 'desktop/salaga': [1920, 1080],
    'mobile/pacan': [940, 1672], 'desktop/pacan': [1920, 1071],
    'mobile/blatnoi': [941, 1672], 'desktop/blatnoi': [1376, 768],
    'mobile/smotryashiy': [941, 1671], 'desktop/smotryashiy': [1668, 943],
    'mobile/avtoritet': [941, 1672], 'desktop/avtoritet': [1505, 697]
  };
  var layer = null, key = '', anims = [], timers = [];
  var R = function (a, b) { return a + Math.random() * (b - a); };
  var P = function (v) { return v.toFixed(2) + '%'; };

  function css() {
    if (document.getElementById('rank-bg-fx-style')) return;
    var s = document.createElement('style');
    s.id = 'rank-bg-fx-style';
    s.textContent =
      '#rank-bg-fx{position:absolute;z-index:0;pointer-events:none;overflow:hidden}' +
      '#rank-bg-fx div,#rank-bg-fx svg{position:absolute;pointer-events:none}' +
      '#rank-bg-fx .glow{border-radius:50%;transform:translate(-50%,-50%);aspect-ratio:1;mix-blend-mode:screen;background:radial-gradient(circle,rgba(255,196,110,.42) 0,rgba(255,170,70,.16) 30%,rgba(255,150,50,0) 62%)}' +
      '#rank-bg-fx .glow.cold{background:radial-gradient(circle,rgba(225,235,255,.38) 0,rgba(200,215,255,.12) 32%,rgba(200,215,255,0) 62%)}' +
      '#rank-bg-fx .soft{animation:rbfx-soft 7s infinite}' +
      '#rank-bg-fx .buzz{animation:rbfx-buzz 5.3s infinite}' +
      '#rank-bg-fx .buzz2{animation:rbfx-buzz 7.9s infinite 1.7s}' +
      '@keyframes rbfx-soft{0%,61%,63%,66%,90%,100%{opacity:1}62%{opacity:.35}64.5%{opacity:.55}88%{opacity:.92}}' +
      '@keyframes rbfx-buzz{0%,40%,44%,47%,100%{opacity:1}41%{opacity:.2}42%{opacity:.9}43%{opacity:.15}45.5%{opacity:.6}}' +
      '#rank-bg-fx .cone{transform-origin:50% 0;mix-blend-mode:screen;background:conic-gradient(from 180deg at 50% 0,transparent 0 152deg,rgba(255,190,110,.13) 165deg,rgba(255,200,120,.18) 180deg,rgba(255,190,110,.13) 195deg,transparent 208deg);-webkit-mask:linear-gradient(#000 40%,transparent);mask:linear-gradient(#000 40%,transparent)}' +
      '#rank-bg-fx .full{left:0;top:0;width:100%;height:100%}' +
      '#rank-bg-fx .mote{width:3px;height:3px;border-radius:50%;background:#ffe2a8;box-shadow:0 0 6px #ffcf7a;opacity:0}' +
      '#rank-bg-fx .mote.cold{background:#e6eeff;box-shadow:0 0 6px #b9cdfa}' +
      '#rank-bg-fx .ember{border-radius:50%;transform:translate(-50%,-50%);aspect-ratio:1;background:radial-gradient(circle,#fff2b0 0,#ff7a1a 35%,rgba(255,80,0,0) 70%);mix-blend-mode:screen;animation:rbfx-ember 2.6s ease-in-out infinite}' +
      '@keyframes rbfx-ember{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.9)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.35)}}' +
      '#rank-bg-fx .puff{border-radius:50%;aspect-ratio:1;background:radial-gradient(circle,rgba(225,225,230,.34) 0,rgba(205,205,215,.14) 40%,rgba(205,205,215,0) 70%)}' +
      '#rank-bg-fx .win{overflow:hidden}' +
      '#rank-bg-fx .rain{left:0;right:0;top:-20%;bottom:0;background:repeating-linear-gradient(100deg,rgba(190,210,240,0) 0 9px,rgba(190,210,240,.22) 9px 10px);animation:rbfx-rain .45s linear infinite;opacity:.8}' +
      '@keyframes rbfx-rain{from{transform:translateY(-14%)}to{transform:translateY(0)}}' +
      '#rank-bg-fx .sweep{top:-30%;height:160%;width:55%;left:-60%;background:linear-gradient(90deg,transparent,rgba(210,230,255,.55),rgba(255,255,255,.75),rgba(210,230,255,.55),transparent);transform:skewX(-14deg);mix-blend-mode:screen}' +
      '#rank-bg-fx .glint{aspect-ratio:1;transform:translate(-50%,-50%) scale(0);mix-blend-mode:screen;background:radial-gradient(circle,#fff 0,rgba(255,230,140,.9) 18%,transparent 45%),linear-gradient(90deg,transparent 46%,rgba(255,240,180,.9) 50%,transparent 54%),linear-gradient(0deg,transparent 46%,rgba(255,240,180,.9) 50%,transparent 54%)}' +
      '#rank-bg-fx .drop{width:3px;height:9px;border-radius:2px 2px 3px 3px;background:linear-gradient(rgba(220,235,255,.2),rgba(230,240,255,.95));transform:translate(-50%,0);opacity:0}' +
      '#rank-bg-fx .ripple{border:1.5px solid rgba(220,235,255,.75);border-radius:50%;transform:translate(-50%,-50%);opacity:0}' +
      '#rank-bg-fx .tvscreen{mix-blend-mode:screen;background:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 1px,transparent 1px 3px),radial-gradient(ellipse,rgba(170,205,255,.85),rgba(110,150,230,.35) 70%,transparent);border-radius:12%}' +
      '#rank-bg-fx .sparkle{width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 6px 2px rgba(255,220,150,.9);opacity:0;transform:translate(-50%,-50%)}' +
      '#rank-bg-fx .rays{aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;mix-blend-mode:screen;opacity:.55;' +
        'background:repeating-conic-gradient(from 0deg,rgba(255,200,120,.22) 0 4deg,rgba(255,200,120,0) 4deg 13deg);' +
        '-webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.6) 30%,transparent 68%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,.6) 30%,transparent 68%);animation:rbfx-spin 90s linear infinite}' +
      '@keyframes rbfx-spin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}' +
      '#rank-bg-fx .searchbeam{transform-origin:0 50%;height:6%;mix-blend-mode:screen;background:linear-gradient(90deg,rgba(255,250,220,.65),rgba(255,240,200,.18) 55%,transparent);clip-path:polygon(0 45%,100% 0,100% 100%,0 55%)}' +
      '@media (prefers-reduced-motion:reduce){#rank-bg-fx{display:none!important}}';
    document.head.appendChild(s);
  }
  function div(p, cls, css) { var d = document.createElement('div'); d.className = cls; if (css) d.style.cssText = css; p.appendChild(d); return d; }
  function at(d, x, y) { d.style.left = P(x); d.style.top = P(y); return d; }
  function wpx(d, wPct) { d.style.width = P(wPct); return d; }
  function anim(n, kf, opt) { var a = n.animate(kf, opt); anims.push(a); return a; }
  function every(ms, fn, jitter) {
    var t = { id: 0 };
    (function loop() { t.id = setTimeout(function () { try { fn(); } catch (e) {} loop(); }, ms + R(0, jitter || 0)); })();
    timers.push(t);
  }

  /* ---------- building blocks ---------- */
  function lamp(x, y, size, mode, cold) { return wpx(at(div(layer, 'glow ' + (mode || 'soft') + (cold ? ' cold' : '')), x, y), size); }
  function dust(n, x0, x1, y0, y1, cold) {
    for (var i = 0; i < n; i++) {
      var m = at(div(layer, 'mote' + (cold ? ' cold' : '')), R(x0, x1), R(y0, y1));
      anim(m, [{ opacity: 0, transform: 'translate(0,0)' }, { opacity: R(.4, .9), offset: .3 }, { opacity: R(.3, .7), offset: .7 },
        { opacity: 0, transform: 'translate(' + R(-30, 30).toFixed(0) + 'px,' + R(-40, 20).toFixed(0) + 'px)' }], { duration: R(5000, 9000), iterations: Infinity, delay: -R(0, 8000), easing: 'ease-in-out' });
    }
  }
  function shaft(poly, cold) { // light shaft from a window to the floor
    var d = div(layer, 'full');
    d.style.clipPath = 'polygon(' + poly.map(function (p) { return P(p[0]) + ' ' + P(p[1]); }).join(',') + ')';
    var top = Math.min.apply(null, poly.map(function (p) { return p[1]; })), bot = Math.max.apply(null, poly.map(function (p) { return p[1]; }));
    d.style.background = 'linear-gradient(180deg,transparent ' + P(top) + ',' + (cold ? 'rgba(200,220,255,.16)' : 'rgba(255,220,160,.14)') + ' ' + P(top + 2) + ',' + (cold ? 'rgba(200,220,255,.05)' : 'rgba(255,220,160,.05)') + ' ' + P(bot) + ')';
    d.style.mixBlendMode = 'screen';
    anim(d, [{ opacity: .75 }, { opacity: 1 }, { opacity: .8 }], { duration: 6000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
  }
  function drip(x, y0, y1) {
    var drop = at(div(layer, 'drop'), x, y0), rip = at(div(layer, 'ripple'), x, y1), rip2 = at(div(layer, 'ripple'), x, y1);
    every(3600, function () {
      var H = layer.clientHeight, dy = (y1 - y0) / 100 * H;
      drop.animate([{ opacity: 0, transform: 'translate(-50%,0) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1)', offset: .35 },
        { opacity: 1, transform: 'translate(-50%,0)', offset: .4 }, { opacity: 1, transform: 'translate(-50%,' + dy.toFixed(0) + 'px)' }], { duration: 1500, easing: 'cubic-bezier(.55,0,1,.45)' });
      [rip, rip2].forEach(function (r, i) {
        r.animate([{ width: '4px', height: '2px', opacity: 0 }, { width: '4px', height: '2px', opacity: .9, offset: .01 },
          { width: (layer.clientWidth * .07).toFixed(0) + 'px', height: (layer.clientWidth * .022).toFixed(0) + 'px', opacity: 0 }], { duration: 900, delay: 1500 + i * 220, easing: 'ease-out' });
      });
    }, 1500);
  }
  function steam(x, y, size, n) {
    for (var k = 0; k < (n || 4); k++) {
      var s = wpx(at(div(layer, 'puff'), x, y), size);
      anim(s, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.4)' }, { opacity: .9, offset: .15 },
        { opacity: .45, transform: 'translate(calc(-50% + ' + R(-6, 8).toFixed(0) + 'px),calc(-50% - 45px)) scale(1.3)', offset: .6 },
        { opacity: 0, transform: 'translate(calc(-50% + ' + R(-16, 18).toFixed(0) + 'px),calc(-50% - 95px)) scale(2.2)' }], { duration: R(3600, 5000), iterations: Infinity, delay: -k * 1100, easing: 'ease-out' });
    }
  }
  function sparkles(n, x0, x1, y0, y1) {
    for (var i = 0; i < n; i++) {
      var s = at(div(layer, 'sparkle'), R(x0, x1), R(y0, y1));
      anim(s, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 0, offset: .6 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .75 },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.3)', offset: .9 }, { opacity: 0 }], { duration: R(2200, 4200), iterations: Infinity, delay: -R(0, 4000) });
    }
  }
  function swingLamp(cx, cy0, lampY, glowSize, coneW, coneH, spot) { // pendant lamp on a cord + moving light spot on the floor
    var pend = div(layer, '', 'left:' + P(cx) + ';top:' + P(cy0) + ';width:0;height:0');
    var H = function () { return layer.clientHeight; };
    var g = div(pend, 'glow soft', 'left:0;width:' + glowSize + 'vw');
    var c = div(pend, 'cone soft', 'left:0;transform:translateX(-50%)');
    function size() {
      var lw = layer.clientWidth, lh = layer.clientHeight, dy = (lampY - cy0) / 100 * lh;
      g.style.top = dy + 'px'; g.style.width = (glowSize / 100 * lw) + 'px';
      c.style.top = dy + 'px'; c.style.width = (coneW / 100 * lw) + 'px'; c.style.height = (coneH / 100 * lh) + 'px';
    }
    size(); pend._size = size;
    anim(pend, [{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], { duration: 4200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    if (spot) {
      var sp = div(layer, '', 'left:' + P(spot[0]) + ';top:' + P(spot[1]) + ';width:' + P(spot[2]) + ';aspect-ratio:3/1;transform:translate(-50%,-50%);border-radius:50%;mix-blend-mode:screen;background:radial-gradient(ellipse,rgba(255,200,130,.22),transparent 70%)');
      anim(sp, [{ transform: 'translate(-50%,-50%) translateX(' + (-spot[3]) + 'vw)' }, { transform: 'translate(-50%,-50%) translateX(' + spot[3] + 'vw)' }], { duration: 4200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    }
    return pend;
  }
  var ROACH_SVG = '<svg viewBox="0 0 40 20" width="100%" height="100%"><g fill="#5e3b20" stroke="#3a2212" stroke-width="1.3" stroke-linecap="round">' +
    '<path d="M10 6 4 1M10 14 4 19M17 5 15 0M17 15 15 20M24 6 28 1M24 14 28 19M30 8 39 3M30 12 39 17" fill="none"/>' +
    '<ellipse cx="18" cy="10" rx="11" ry="5.2"/><ellipse cx="18" cy="8.6" rx="8" ry="2" fill="#8a5a32" stroke="none" opacity=".6"/><ellipse cx="30" cy="10" rx="3.6" ry="3.2" fill="#4e2f18"/></g></svg>';
  function roach(xa, xb, y0, y1, size) {
    var r = div(layer, '', 'width:' + P(size) + ';aspect-ratio:2/1;opacity:0;filter:drop-shadow(0 2px 2px rgba(0,0,0,.7))');
    r.innerHTML = ROACH_SVG;
    every(13000, function () {
      var ltr = Math.random() < .5, y = R(y0, y1), lw = layer.clientWidth;
      r.style.top = P(y); r.style.left = P(ltr ? xa : xb);
      var dx = (xb - xa) / 100 * lw * (ltr ? 1 : -1), flip = ltr ? '' : ' scaleX(-1)';
      var kf = [];
      for (var i = 0; i <= 10; i++) {
        var t = i / 10, stop = (i === 5) ? 1 : 0; // short pause in the middle
        kf.push({ transform: 'translate(' + (dx * Math.min(1, t + (i > 5 ? 0 : 0))).toFixed(0) + 'px,' + (Math.sin(t * 12) * 3).toFixed(1) + 'px)' + flip, opacity: (i === 0 || i === 10) ? 0 : 1, offset: t });
      }
      r.animate(kf, { duration: R(2600, 3600), easing: 'linear' });
    }, 6000);
  }
  var BIRD_SVG = '<svg viewBox="0 0 30 12" width="100%" height="100%"><path d="M1 8 Q8 0 15 7 Q22 0 29 8" fill="none" stroke="#1d1410" stroke-width="2.2" stroke-linecap="round"/></svg>';
  function birds(y0, y1) {
    var flock = div(layer, '', 'left:100%;width:16%;aspect-ratio:3/1;opacity:0');
    for (var i = 0; i < 3; i++) {
      var b = div(flock, '', 'width:' + (32 - i * 6) + '%;aspect-ratio:30/12;left:' + (i * 28) + '%;top:' + (i % 2 ? 40 : 0) + '%');
      b.innerHTML = BIRD_SVG;
      b.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.6)' }, { transform: 'scaleY(1)' }], { duration: 520 + i * 60, iterations: Infinity });
    }
    every(11000, function () {
      flock.style.top = P(R(y0, y1));
      flock.animate([{ transform: 'translateX(0)', opacity: 0 }, { opacity: .9, offset: .08 }, { opacity: .9, offset: .9 },
        { transform: 'translateX(-' + (layer.clientWidth * 1.25).toFixed(0) + 'px) translateY(-' + (layer.clientHeight * .04).toFixed(0) + 'px)', opacity: 0 }], { duration: 9000, easing: 'linear' });
    }, 4000);
  }
  function tv(x, y, w, h, glowX, glowY, glowW) {
    var scr = div(layer, 'tvscreen', 'left:' + P(x) + ';top:' + P(y) + ';width:' + P(w) + ';height:' + P(h));
    var glow = wpx(at(div(layer, 'glow cold'), glowX, glowY), glowW);
    var kf = [], kf2 = [];
    for (var i = 0; i <= 16; i++) { var v = R(.35, 1); kf.push({ opacity: v, offset: i / 16 }); kf2.push({ opacity: v * .9, offset: i / 16 }); }
    anim(scr, kf, { duration: 2400, iterations: Infinity, easing: 'steps(1,end)' });
    anim(glow, kf2, { duration: 2400, iterations: Infinity, easing: 'steps(1,end)' });
  }
  function searchlight(x, y, lenPct, a0, a1) {
    var b = div(layer, 'searchbeam', 'left:' + P(x) + ';top:' + P(y) + ';width:' + P(lenPct) + ';transform:translateY(-50%) rotate(' + a0 + 'deg)');
    anim(b, [{ transform: 'translateY(-50%) rotate(' + a0 + 'deg)' }, { transform: 'translateY(-50%) rotate(' + a1 + 'deg)' }], { duration: 9000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    wpx(at(div(layer, 'glow'), x, y), 6);
  }

  /* ---------- scenes ---------- */
  var SCENES = {
    'mobile/salaga': function () {
      lamp(48, 11.5, 30, 'buzz', true); lamp(48, 24.5, 20, 'buzz2', true);
      shaft([[35, 42], [64, 42], [74, 70], [24, 70]], true); dust(12, 30, 68, 42, 70, true);
      sparkles(4, 40, 62, 78, 88); drip(24, 30, 88);
    },
    'desktop/salaga': function () {
      lamp(47, 3, 14, 'buzz', true);
      shaft([[40, 36], [57.5, 36], [70, 87], [30, 87]], true); dust(12, 36, 64, 38, 84, true);
      sparkles(4, 38, 62, 88, 96); drip(22, 12, 93);
    },
    'mobile/pacan': function () {
      swingLamp(54, 9, 15.5, 34, 70, 60, [54, 86, 46, 6]);
      dust(10, 34, 74, 18, 55); roach(12, 88, 72, 86, 8.5); sparkles(3, 45, 65, 80, 95);
    },
    'desktop/pacan': function () {
      swingLamp(59.5, 0, 8.5, 14, 30, 85, [56, 92, 30, 3]);
      dust(10, 45, 75, 10, 60); roach(22, 84, 83, 93, 4.2); sparkles(3, 55, 70, 90, 98);
    },
    'mobile/blatnoi': function () {
      lamp(52, 7.5, 30, 'soft');
      tv(50.3, 42.2, 9.6, 4.2, 55, 45, 60); steam(32.2, 34, 6, 4);
      wpx(at(div(layer, 'ember', 'animation-duration:3.4s'), 72.5, 45.4), 1.2);
      dust(8, 35, 70, 10, 40);
    },
    'desktop/blatnoi': function () {
      lamp(30, 7, 16, 'soft');
      tv(55.6, 45.2, 5.8, 6.6, 58.5, 49, 30); steam(49.8, 34, 3, 4);
      wpx(at(div(layer, 'ember', 'animation-duration:3.4s'), 64.5, 51), 0.7);
      dust(8, 22, 40, 8, 40);
    },
    'mobile/smotryashiy': function () {
      wpx(at(div(layer, 'rays'), 61, 43), 150); wpx(at(div(layer, 'glow'), 61, 43), 40);
      searchlight(83.5, 36, 70, 190, 235); birds(8, 26);
      lamp(19, 13.5, 10, 'buzz'); lamp(22, 20.5, 8, 'soft'); lamp(19.5, 37.5, 8, 'buzz2');
      sparkles(6, 52, 64, 72, 92); sparkles(4, 82, 92, 76, 90);
    },
    'desktop/smotryashiy': function () {
      wpx(at(div(layer, 'rays'), 58.5, 31), 90); wpx(at(div(layer, 'glow'), 58.5, 31), 22);
      searchlight(73, 15.5, 45, 175, 215); birds(4, 18);
      lamp(25.5, 18, 6, 'buzz');
      sparkles(6, 52, 64, 84, 96); sparkles(4, 40, 50, 82, 92);
    },
    'mobile/avtoritet': function () { authority({ S: 180, w: 941, h: 1672, lamp: [64.3, 15], win: [15.5, 15.5, 20.5, 25.5], ember: [55.2, 58.6], crown: [79, 55.6], dust: [44, 84, 18, 52] }); },
    'desktop/avtoritet': function () { authority({ S: 150, w: 1505, h: 697, lamp: [63.3, 14.8], win: [30.2, 6.5, 15.6, 39.7], ember: [53.4, 68], crown: [71.3, 62.8], dust: [50, 80, 15, 60] }); }
  };

  function authority(a) {
    var sw = function (k) { return k * a.S / a.w * 100; };
    lamp(a.lamp[0], a.lamp[1], sw(3.6), 'soft');
    var c = div(layer, 'cone soft', 'left:' + P(a.lamp[0]) + ';top:' + P(a.lamp[1] + 1) + ';width:' + P(sw(6.3)) + ';height:' + P(6.5 * a.S / a.h * 100));
    anim(c, [{ transform: 'translateX(-50%) rotate(-1.6deg)' }, { transform: 'translateX(-50%) rotate(1.6deg)' }], { duration: 3000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    dust(14, a.dust[0], a.dust[1], a.dust[2], a.dust[3]);
    wpx(at(div(layer, 'ember'), a.ember[0], a.ember[1]), sw(0.115));
    steam(a.ember[0], a.ember[1] - 1.2, sw(0.47), 5);
    var w = div(layer, 'win', 'left:' + P(a.win[0]) + ';top:' + P(a.win[1]) + ';width:' + P(a.win[2]) + ';height:' + P(a.win[3]));
    div(w, 'rain');
    anim(div(w, 'sweep'), [{ left: '-60%' }, { left: '-60%', offset: .55 }, { left: '110%' }], { duration: 6500, iterations: Infinity, easing: 'ease-in-out' });
    var f = div(layer, 'full', 'mix-blend-mode:screen;opacity:0;background:radial-gradient(ellipse at ' + P(a.win[0] + a.win[2] / 2) + ' ' + P(a.win[1] + a.win[3] / 2) + ',rgba(190,215,255,.32),transparent 60%)');
    anim(f, [{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1, offset: .72 }, { opacity: 0, offset: .86 }, { opacity: 0 }], { duration: 6500, iterations: Infinity });
    var gl = wpx(at(div(layer, 'glint'), a.crown[0], a.crown[1]), sw(0.36));
    anim(gl, [{ transform: 'translate(-50%,-50%) scale(0) rotate(0)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(0)', opacity: 0, offset: .8 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(45deg)', opacity: 1, offset: .88 }, { transform: 'translate(-50%,-50%) scale(0) rotate(90deg)', opacity: 0, offset: .96 }, { opacity: 0 }], { duration: 5000, iterations: Infinity });
  }

  function clear() {
    anims.forEach(function (x) { try { x.cancel(); } catch (e) {} }); anims = [];
    timers.forEach(function (t) { clearTimeout(t.id); }); timers = [];
    if (layer) layer.innerHTML = '';
  }

  /* Where the picture is drawn inside the container. */
  function place(g, size) {
    var cs = getComputedStyle(g), cw = g.clientWidth, ch = g.clientHeight;
    var bs = (cs.backgroundSize || 'cover').split(',').pop().trim();
    var sc = bs === 'contain' ? Math.min(cw / size[0], ch / size[1]) : Math.max(cw / size[0], ch / size[1]);
    var dw = size[0] * sc, dh = size[1] * sc;
    var pos = (cs.backgroundPosition || '50% 50%').split(',').pop().trim().split(/\s+/);
    function frac(v) { if (!v) return .5; if (v.indexOf('%') > 0) return parseFloat(v) / 100; if (v === 'left' || v === 'top') return 0; if (v === 'right' || v === 'bottom') return 1; if (v === 'center') return .5; return null; }
    var fx = frac(pos[0]), fy = frac(pos[1] || '50%');
    layer.style.left = (fx == null ? parseFloat(pos[0]) || 0 : (cw - dw) * fx) + 'px';
    layer.style.top = (fy == null ? parseFloat(pos[1]) || 0 : (ch - dh) * fy) + 'px';
    layer.style.width = dw + 'px'; layer.style.height = dh + 'px';
    [].forEach.call(layer.children, function (n) { if (n._size) n._size(); });
  }

  function running(g) {
    if (!g || g.classList.contains('jail-mode') || document.hidden) return false;
    var o = document.getElementById('modal-overlay');
    return !(o && !o.classList.contains('hidden'));
  }

  function tick() {
    var g = document.getElementById('game-container');
    if (!running(g)) { if (layer) { layer.style.display = 'none'; } return; }
    var m = (getComputedStyle(g).backgroundImage || '').match(/(mobile|desktop)\/(salaga|pacan|blatnoi|smotryashiy|avtoritet)\.webp/);
    var k = m ? m[1] + '/' + m[2] : '';
    if (!k || !SCENES[k]) { if (layer) layer.style.display = 'none'; return; }
    css();
    if (!layer || !layer.isConnected) { layer = document.createElement('div'); layer.id = 'rank-bg-fx'; g.insertBefore(layer, g.firstChild); key = ''; }
    layer.style.display = '';
    place(g, SIZE[k]);
    if (k !== key) { clear(); key = k; SCENES[k](); place(g, SIZE[k]); }
  }

  /* ---------- Т3 «Влияние»: эффект тапа на этапе «Авторитет» ---------- */
  var tapLayer = null, lastTapFx = 0;
  function tapRoot() {
    if (tapLayer && tapLayer.isConnected) return tapLayer;
    tapLayer = document.createElement('div');
    tapLayer.id = 'authority-tap-fx';
    tapLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1300;overflow:hidden';
    document.body.appendChild(tapLayer);
    return tapLayer;
  }
  function point(e) {
    var t = e && (e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0] || e);
    if (t && Number.isFinite(t.clientX) && (t.clientX || t.clientY)) return { x: t.clientX, y: t.clientY };
    var a = document.getElementById('tap-area'), r = a ? a.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.6 };
  }
  function influenceTap(e) {
    var g = document.getElementById('game-container');
    if (!g || !g.classList.contains('authority-mode') || document.hidden) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var now = performance.now(), full = now - lastTapFx > 70; lastTapFx = now;
    var p = point(e), root = tapRoot();
    var r = document.createElement('div');
    r.style.cssText = 'position:absolute;left:' + p.x + 'px;top:' + p.y + 'px;border:4px solid rgba(255,214,107,.95);border-radius:50%;box-shadow:0 0 14px rgba(255,190,60,.7)';
    root.appendChild(r);
    r.animate([{ width: '10px', height: '10px', margin: '-5px 0 0 -5px', opacity: .9, borderWidth: '4px' },
      { width: '170px', height: '170px', margin: '-85px 0 0 -85px', opacity: 0, borderWidth: '1px' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { r.remove(); };
    if (!full) return;
    var target = document.getElementById('authority-influence-value') || document.querySelector('.resource-points');
    var tr = target ? target.getBoundingClientRect() : { left: innerWidth - 60, top: 20, width: 40, height: 20 };
    var tx = tr.left + tr.width / 2, ty = tr.top + tr.height / 2;
    for (var i = 0; i < 4; i++) {
      var sp = document.createElement('div');
      sp.style.cssText = 'position:absolute;left:' + p.x + 'px;top:' + p.y + 'px;width:5px;height:5px;border-radius:50%;background:#ffd36b;box-shadow:0 0 8px #ffb02e';
      root.appendChild(sp);
      var mx = R(-40, 40);
      sp.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + mx.toFixed(0) + 'px),calc(-50% - 40px)) scale(1.2)', opacity: 1, offset: .35 },
        { transform: 'translate(calc(-50% + ' + (tx - p.x).toFixed(0) + 'px),calc(-50% + ' + (ty - p.y).toFixed(0) + 'px)) scale(.4)', opacity: .2 }],
        { duration: R(650, 850), delay: i * 40, easing: 'cubic-bezier(.5,0,.6,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(sp);
    }
    var glow = layer && layer.querySelector('.glow');
    if (glow) glow.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }], { duration: 450 });
    var box = target && (target.closest('.authority-influence') || target);
    if (box && box.animate) box.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 300, delay: 600 });
  }

  setInterval(tick, 700);
  window.addEventListener('resize', tick);
  document.addEventListener('visibilitychange', tick);
  window.AVT_RankBgFX = { refresh: tick, scene: function () { return key; } };
  window.AVT_AuthorityBgFX = { refresh: tick, tap: influenceTap, layer: function () { return layer; } };
})();
