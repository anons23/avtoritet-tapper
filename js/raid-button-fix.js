'use strict';
(function () {
  /* Guarantee the raid open button is present and visible after load / rotation. */
  function ensure() {
    try {
      var parent = document.getElementById('game-container') || document.body;
      if (!parent) return;
      var btn = document.getElementById('raid-open-button');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'raid-open-button';
        btn.type = 'button';
        btn.title = 'Рейды';
        btn.setAttribute('aria-label', 'Рейды');
        btn.innerHTML = '<img src="./assets/raids/ui/raid-button.png" alt="Рейды">';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          try {
            if (typeof window.openRaidMenu === 'function') window.openRaidMenu();
            else if (typeof window.__raidBoot === 'function') window.__raidBoot();
          } catch (err) {}
        });
        parent.appendChild(btn);
      }
      /* Force visible in case something hid it */
      btn.style.display = 'block';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.style.zIndex = '60';
      if (btn.parentElement !== parent) parent.appendChild(btn);
    } catch (e) {}
  }

  function boot() {
    ensure();
    setTimeout(ensure, 400);
    setTimeout(ensure, 1200);
    setTimeout(ensure, 3000);
    window.addEventListener('orientationchange', function () { setTimeout(ensure, 150); });
    window.addEventListener('resize', function () { setTimeout(ensure, 150); });
    window.addEventListener('avt-orientation', ensure);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
