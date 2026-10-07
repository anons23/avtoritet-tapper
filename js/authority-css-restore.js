/* authority-css-restore v1.7 — layout fixes without full-screen hotspot */
'use strict';
(function(){
  if (document.getElementById('authority-ui-css-restore')) return;
  var s = document.createElement('style');
  s.id = 'authority-ui-css-restore';
  s.textContent = [
    /* Portrait / default */
    '@media (max-width:900px){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.12),rgba(4,8,10,.32)),url("./assets/backgrounds/desktop/avtoritet.webp")!important;',
    '    background-size:cover!important;background-position:center center!important;',
    '  }',
    '  #game-container.authority-mode #tap-area{padding:8px!important;}',
    '  #game-container.authority-mode .authority-deal-btn{',
    '    position:relative!important;z-index:6!important;margin:0 auto!important;',
    '  }',
    '  #game-container.authority-mode .authority-desk-hotspot{',
    '    left:18%!important;right:18%!important;bottom:12%!important;',
    '    width:auto!important;height:22%!important;max-height:140px!important;',
    '    z-index:8!important;pointer-events:auto!important;',
    '  }',
    '}',

    /* Landscape compact UI */
    '@media (max-width:900px) and (orientation:landscape){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.30)),url("./assets/backgrounds/desktop/avtoritet.webp")!important;',
    '    background-size:cover!important;background-position:center center!important;',
    '    width:100vw!important;max-width:none!important;padding-bottom:48px!important;',
    '  }',
    '  #game-container.authority-mode #top-bar{padding:3px 10px!important;min-height:0!important}',
    '  #game-container.authority-mode .authority-desk-hotspot{',
    '    left:20%!important;right:20%!important;bottom:8%!important;',
    '    width:auto!important;height:20%!important;max-height:120px!important;',
    '    z-index:8!important;',
    '  }',
    '}',

    /* Centered authority dialogs */
    '#modal-overlay.authority-open{',
    '  align-items:center!important;',
    '  justify-content:center!important;',
    '  padding:12px!important;',
    '}',
    '#modal.authority-modal{',
    '  border-radius:22px!important;',
    '  width:min(520px,94vw)!important;',
    '  max-height:min(88svh,720px)!important;',
    '  margin:0 auto!important;',
    '}',
    '.authority-deal-btn img,.authority-deal-btn .authority-deal-img{',
    '  max-width:min(280px,70vw)!important;',
    '  max-height:120px!important;',
    '  width:auto!important;height:auto!important;',
    '  display:block!important;margin:0 auto!important;',
    '}'
  ].join('\n');
  document.head.appendChild(s);
  console.log('[authority-css-restore] v1.7');
})();
