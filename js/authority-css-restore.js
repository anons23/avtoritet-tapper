/* authority-css-restore v1.8 — mobile portrait bg */
'use strict';
(function(){
  if (document.getElementById('authority-ui-css-restore')) return;
  var s = document.createElement('style');
  s.id = 'authority-ui-css-restore';
  s.textContent = [
    '@media (max-width:900px){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.28)),url("./assets/backgrounds/mobile/avtoritet.webp")!important;',
    '    background-size:cover!important;background-position:center center!important;',
    '  }',
    '  #game-container.authority-mode #tap-area{padding:6px!important;}',
    '  #game-container.authority-mode .authority-hero-bg{',
    '    object-fit:cover!important;object-position:center 55%!important;transform:none!important;',
    '  }',
    '}',
    '@media (max-width:900px) and (orientation:landscape){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.30)),url("./assets/backgrounds/mobile/avtoritet.webp")!important;',
    '    background-size:cover!important;background-position:center center!important;',
    '  }',
    '}',
    '#modal-overlay.authority-open{align-items:center!important;justify-content:center!important;padding:12px!important;}',
    '#modal.authority-modal{border-radius:22px!important;width:min(520px,94vw)!important;max-height:min(88svh,720px)!important;margin:0 auto!important;}'
  ].join('\n');
  document.head.appendChild(s);
  console.log('[authority-css-restore] v1.8 mobile bg');
})();
