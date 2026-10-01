'use strict';
(function () {
  /* Force layout refresh after phone rotation (svh/dvh lag on some mobile browsers). */
  function refreshViewport() {
    try {
      var gc = document.getElementById('game-container');
      if (!gc) return;
      /* Nudge height so the browser recomputes 100dvh/100svh. */
      gc.style.height = '100dvh';
      gc.style.maxHeight = '100dvh';
      gc.style.minHeight = '0';
      /* Optional: notify other modules that layout changed. */
      try {
        window.dispatchEvent(new Event('avt-orientation'));
      } catch (e) {}
    } catch (e) {}
  }

  var timer = 0;
  function onOrient() {
    clearTimeout(timer);
    timer = setTimeout(refreshViewport, 120);
  }

  window.addEventListener('orientationchange', onOrient);
  window.addEventListener('resize', onOrient);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onOrient);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshViewport);
  } else {
    refreshViewport();
  }
})();
