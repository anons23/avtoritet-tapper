/* balance-rank-tasks.js v1.0 — щедрые поручения +1 сила при масти */
'use strict';
(function () {
  // Переопределяем награды основных поручений, если TASKS доступен глобально — в game.js TASKS в замыкании.
  // Основное — патч через game.js; этот файл — запасной хук на rank-up если нужен.
  var lastObj = null;
  function tick() {
    try {
      var s = typeof window.getGameState === 'function' ? window.getGameState() : null;
      if (!s) return;
      var cur = Number(s.currentObject) || 0;
      if (lastObj === null) { lastObj = cur; return; }
      if (cur > lastObj) {
        var steps = cur - lastObj;
        s.power = Math.max(1, (Number(s.power) || 1) + steps);
        lastObj = cur;
        if (typeof window.saveGame === 'function') window.saveGame();
        if (typeof window.msg === 'function') {
          window.msg('🏆 +сила за новую масть! Сейчас: ' + s.power);
        }
        if (typeof window.ui === 'function') window.ui();
      } else if (cur < lastObj) {
        lastObj = cur;
      }
    } catch (e) {}
  }
  setInterval(tick, 1000);
  console.log('[balance-rank-tasks] rank power hook ready');
})();
