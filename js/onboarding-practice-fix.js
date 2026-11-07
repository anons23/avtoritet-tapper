/* onboarding-practice-fix.js v1 — fix stuck practice step */
'use strict';
(function () {
  var NEED = 8;
  var bound = false;
  var lastCount = -1;

  function st() {
    try {
      if (typeof window.getGameState === 'function') return window.getGameState();
    } catch (e) {}
    return null;
  }
  function save() {
    try {
      if (typeof window.saveGame === 'function') window.saveGame();
    } catch (e) {}
  }
  function ensure(s) {
    if (!s.onboarding || typeof s.onboarding !== 'object') {
      s.onboarding = { done: false, step: 0, nameGiven: false, practiceTaps: 0, tipsShown: {}, unlocked: {} };
    }
  }

  function go(step) {
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

  function updateTip(left, done) {
    var textEl = document.getElementById('onboarding-tip-text');
    if (!textEl) return;
    if (left > 0) {
      textEl.innerHTML = 'Отлично! Ещё <b>' + left + '</b> по груше. (' + done + '/' + NEED + ')';
    } else {
      textEl.innerHTML = 'Готово! Переходим дальше…';
    }
  }

  function ensureSkipBtn() {
    var actions = document.getElementById('onboarding-tip-actions');
    if (!actions || actions.querySelector('[data-practice-skip]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-practice-skip', '1');
    btn.textContent = 'Уже тапнул — дальше';
    btn.onclick = function () {
      var s = st();
      if (!s) return;
      ensure(s);
      if (s.onboarding.step !== 4) return;
      var n = Number(s.onboarding.practiceTaps) || 0;
      if (n >= 3) {
        go(5);
      } else {
        updateTip(Math.max(0, 3 - n), n);
        var te = document.getElementById('onboarding-tip-text');
        if (te) te.innerHTML = 'Сделай минимум <b>3 тапа</b> по груше, потом жми снова.';
      }
    };
    actions.appendChild(btn);
  }

  function notePractice() {
    var s = st();
    if (!s || !s.onboarding || s.onboarding.done) return;
    ensure(s);
    if (s.onboarding.step !== 4) return;

    // Энергия, чтобы тапы не «съедались»
    try {
      if (typeof s.energy === 'number' && typeof s.maxEnergy === 'number') {
        if (s.energy < 8) s.energy = Math.min(s.maxEnergy, Math.max(s.energy, 40));
      }
    } catch (e) {}

    s.onboarding.practiceTaps = (Number(s.onboarding.practiceTaps) || 0) + 1;
    var done = s.onboarding.practiceTaps;
    var left = Math.max(0, NEED - done);
    save();
    updateTip(left, done);
    ensureSkipBtn();

    if (left <= 0) {
      setTimeout(function () { go(5); }, 250);
    }
  }

  function onPearPointer(e) {
    try {
      if (!e.target || !e.target.closest) return;
      if (!e.target.closest('#tap-object')) return;
      var s = st();
      if (!s || !s.onboarding || s.onboarding.done) return;
      if (s.onboarding.step !== 4) return;
      notePractice();
    } catch (err) {}
  }

  function onStepEnter() {
    var s = st();
    if (!s || !s.onboarding || s.onboarding.done) return;
    if (s.onboarding.step !== 4) return;
    // При входе в практику — энергия
    try {
      if (typeof s.maxEnergy === 'number') {
        s.energy = Math.max(Number(s.energy) || 0, Math.min(s.maxEnergy, 50));
        save();
      }
    } catch (e) {}
    ensureSkipBtn();
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('pointerup', onPearPointer, true);
    document.addEventListener('click', onPearPointer, true);
    setInterval(onStepEnter, 800);
    console.log('[onboarding-practice-fix] active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  setTimeout(bind, 500);
})();
