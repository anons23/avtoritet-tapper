'use strict';
(function () {
  /* Runtime patch: rarer random events (approx 2.5%) + 650ms soft-lock on choice buttons */
  function softLockChoices() {
    try {
      var choices = document.querySelectorAll("#modal-content .choice, .choices .choice");
      if (!choices.length) return;
      choices.forEach(function (b) {
        b.disabled = true;
        b.style.opacity = "0.55";
        b.style.pointerEvents = "none";
      });
      setTimeout(function () {
        choices.forEach(function (b) {
          b.disabled = false;
          b.style.opacity = "";
          b.style.pointerEvents = "";
        });
      }, 650);
    } catch (e) {}
  }

  function patchOpenEvent() {
    if (typeof window.openEvent !== "function") return false;
    if (window.openEvent.__eventUx) return true;
    var orig = window.openEvent;
    window.openEvent = function () {
      var r = orig.apply(this, arguments);
      softLockChoices();
      return r;
    };
    window.openEvent.__eventUx = true;
    return true;
  }

  /* Reduce effective event rate: original is 10% with 30pt cooldown.
     We intercept openEvent and only allow ~1/4 of calls + enforce 150pt cooldown. */
  function patchRate() {
    if (typeof window.openEvent !== "function") return false;
    if (window.openEvent.__ratePatched) return true;
    var inner = window.openEvent;
    window.openEvent = function () {
      try {
        var st = window.getGameState && window.getGameState();
        if (st) {
          var pts = Number(st.points) || 0;
          var last = Number(st.lastChoiceEvent) || 0;
          if (pts - last < 150) return;
        }
      } catch (e) {}
      /* Keep only ~25% of the original 10% rolls => ~2.5% */
      if (Math.random() > 0.25) return;
      return inner.apply(this, arguments);
    };
    window.openEvent.__ratePatched = true;
    window.openEvent.__eventUx = true;
    return true;
  }

  function boot() {
    if (!patchOpenEvent()) {
      setTimeout(boot, 150);
      return;
    }
    patchRate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setInterval(function () {
    patchOpenEvent();
    patchRate();
  }, 2500);
})();
