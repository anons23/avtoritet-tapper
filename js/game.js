/* АВТОРИТЕТ 2.0 — sequential full-core loader v4.60
 * Root-cause fix: do NOT use gzip/base64 parts (they get corrupted on push).
 * Load the 3 already-valid source files that live in the repo:
 *   game-core-p1.js + game-part2.js + game-part3.js
 * They share global scope (no IIFE) and form the full core with TEST_MODE=true.
 */
'use strict';
(function () {
  var PARTS = [
    './js/game-core-p1.js?v=4.60',
    './js/game-part2.js?v=4.60',
    './js/game-part3.js?v=4.60'
  ];
  var i = 0;

  function killPreloader() {
    try {
      var pre = document.getElementById('preloader');
      if (pre) { pre.style.display = 'none'; pre.remove(); }
      document.body.classList.remove('game-booting');
      var gc = document.getElementById('game-container');
      if (gc) gc.classList.remove('game-booting');
      if (typeof window.__finishPreloader === 'function') window.__finishPreloader();
    } catch (e) {}
  }

  function fallback() {
    console.error('[game] full-core part failed, keeping page alive');
    killPreloader();
    // minimal emergency so the page is not black
    if (typeof window.TEST_MODE === 'undefined') {
      window.TEST_MODE = true;
      window.TEST_POINTS_PER_TAP = 500;
    }
  }

  function next() {
    if (i >= PARTS.length) {
      // all parts loaded — export TEST flags + kill preloader
      try {
        if (typeof TEST_MODE !== 'undefined') window.TEST_MODE = TEST_MODE;
        if (typeof TEST_POINTS_PER_TAP !== 'undefined') window.TEST_POINTS_PER_TAP = TEST_POINTS_PER_TAP;
      } catch (e) {}
      killPreloader();
      console.log('[game] full core v4.60 OK (3 sequential parts)',
        'TEST_MODE=', typeof TEST_MODE !== 'undefined' ? TEST_MODE : '?');
      return;
    }
    var s = document.createElement('script');
    s.src = PARTS[i];
    s.async = false;
    s.onload = function () { i++; next(); };
    s.onerror = function () {
      console.error('[game] failed to load', PARTS[i]);
      fallback();
    };
    document.head.appendChild(s);
  }

  next();
})();
