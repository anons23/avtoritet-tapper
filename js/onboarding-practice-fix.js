/* onboarding-practice-fix.js v2 — unstick practice even if visuals cover #tap-object */
'use strict';
(function () {
  var NEED = 8;
  var bound = false;
  var lastAdvanceAt = 0;

  function st() {
    try {
      if (typeof window.getGameState === 'function') {
        var s = window.getGameState();
        if (s) return s;
      }
    } catch (e) {}
    try { return window.s || null; } catch (e2) { return null; }
  }
  function save() {
    try { if (typeof window.saveGame === 'function') window.saveGame(); } catch (e) {}
  }
  function ensure(s) {
    if (!s) return;
    if (!s.onboarding || typeof s.onboarding !== 'object') {
      s.onboarding = { done: false, step: 0, nameGiven: false, practiceTaps: 0, tipsShown: {}, unlocked: {} };
    }
    if (typeof s.onboarding.practiceTaps !== 'number') s.onboarding.practiceTaps = 0;
  }

  function go(step) {
    var now = Date.now();
    if (now - lastAdvanceAt < 400) return;
    lastAdvanceAt = now;
    try {
      if (window.AVT_Onboarding && typeof window.AVT_Onboarding.goToStep === 'function') {
        window.AVT_Onboarding.goToStep(step);
        return;
      }
    } catch (e) {}
    var s = st();
    if (!s) return;
    ensure(s);
    s.onboarding.step = step;
    save();
  }

  function isPractice() {
    var s = st();
    return !!(s && s.onboarding && !s.onboarding.done && Number(s.onboarding.step) === 4);
  }

  function isTapTarget(el) {
    if (!el || !el.closest) return false;
    return !!(el.closest('#tap-object') || el.closest('#tap-area') || el.closest('.tap-object') || el.closest('.tap-area') || el.closest('#object-name') || el.closest('#object-action'));
  }

  function updateTip(done) {
    var textEl = document.getElementById('onboarding-tip-text');
    if (!textEl) return;
    var left = Math.max(0, NEED - done);
    if (left > 0) {
      textEl.innerHTML = 'Тапай по груше: <b>' + done + ' / ' + NEED + '</b>. Ещё ' + left + '.';
    } else {
      textEl.innerHTML = 'Готово! Переходим дальше…';
    }
  }

  function ensureSkipBtn() {
    var actions = document.getElementById('onboarding-tip-actions');
    if (!actions) return;
    if (actions.querySelector('[data-practice-skip]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'primary';
    btn.setAttribute('data-practice-skip', '1');
    btn.textContent = 'Дальше →';
    btn.onclick = function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      if (!isPractice()) return;
      var s = st();
      ensure(s);
      // жёсткий переход — не блокируем игрока
      s.onboarding.practiceTaps = Math.max(Number(s.onboarding.practiceTaps) || 0, NEED);
      save();
      go(5);
    };
    actions.appendChild(btn);
  }

  function notePractice() {
    if (!isPractice()) return;
    var s = st();
    ensure(s);

    try {
      if (typeof s.energy === 'number' && typeof s.maxEnergy === 'number') {
        if (s.energy < 10) s.energy = Math.min(s.maxEnergy, 60);
      }
    } catch (e) {}

    s.onboarding.practiceTaps = (Number(s.onboarding.practiceTaps) || 0) + 1;
    var done = s.onboarding.practiceTaps;
    save();
    updateTip(done);
    ensureSkipBtn();

    if (done >= NEED) {
      setTimeout(function () { if (isPractice()) go(5); }, 200);
    }
  }

  function onPointer(e) {
    try {
      if (!isPractice()) return;
      if (!isTapTarget(e.target)) return;
      notePractice();
    } catch (err) {}
  }

  function tick() {
    if (!isPractice()) return;
    try {
      var s = st();
      ensure(s);
      if (typeof s.maxEnergy === 'number' && (Number(s.energy) || 0) < 15) {
        s.energy = Math.min(s.maxEnergy, 60);
        save();
      }
    } catch (e) {}
    ensureSkipBtn();
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('pointerup', onPointer, true);
    document.addEventListener('click', onPointer, true);
    setInterval(tick, 500);
    console.log('[onboarding-practice-fix] v2 active');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 300);
  setTimeout(bind, 1500);
})();
