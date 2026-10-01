'use strict';
(function () {
  if (document.getElementById('authority-ui-css-restore')) return;
  var s = document.createElement('style');
  s.id = 'authority-ui-css-restore';
  s.textContent = [
    /* Always hide legacy strip and test badge */
    '.authority-strip{display:none!important}',
    '#test-version,#test-reset-btn,.test-reset-btn{display:none!important}',

    /* Base full-bleed authority room */
    '#game-container.authority-mode{',
    '  background:#0a0e10!important;',
    '  background-image:linear-gradient(rgba(4,8,10,.12),rgba(4,8,10,.32)),url("./assets/backgrounds/desktop/avtoritet.png")!important;',
    '  background-size:cover!important;',
    '  background-position:center center!important;',
    '  background-repeat:no-repeat!important;',
    '  height:100dvh!important;',
    '  min-height:100dvh!important;',
    '  max-height:100dvh!important;',
    '}',
    '#game-container.authority-mode .authority-hero{',
    '  background:transparent!important;',
    '  border:0!important;',
    '  border-radius:0!important;',
    '  box-shadow:none!important;',
    '  min-height:0!important;',
    '}',
    '#game-container.authority-mode .authority-hero-bg{display:none!important}',
    '#game-container.authority-mode .authority-shade{',
    '  display:block!important;',
    '  background:linear-gradient(180deg,rgba(3,7,9,.14) 0%,rgba(3,7,9,.05) 45%,rgba(3,7,9,.42) 100%)!important;',
    '}',

    /* Portrait phones — tall mobile artwork */
    '@media (max-width:700px) and (orientation:portrait){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.28)),url("./assets/backgrounds/mobile/avtoritet.png")!important;',
    '    background-size:cover!important;',
    '    background-position:center 32%!important;',
    '    background-repeat:no-repeat!important;',
    '  }',
    '  #game-container.authority-mode .authority-context,',
    '  #game-container.authority-mode .authority-influence{display:flex!important}',
    '  #game-container.authority-mode .authority-mini-row{',
    '    position:absolute!important;',
    '    left:10px!important;',
    '    right:10px!important;',
    '    bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;',
    '    z-index:6!important;',
    '    margin:0!important;',
    '  }',
    '  #game-container.authority-mode .authority-desk-hotspot{',
    '    left:8%!important;right:8%!important;bottom:10%!important;',
    '    width:auto!important;height:42%!important;z-index:100!important;pointer-events:auto!important;',
    '  }',
    '}',

    /* Landscape phones — wide desktop artwork */
    '@media (max-width:900px) and (orientation:landscape){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.30)),url("./assets/backgrounds/desktop/avtoritet.png")!important;',
    '    background-size:cover!important;',
    '    background-position:center center!important;',
    '    background-repeat:no-repeat!important;',
    '    width:100vw!important;max-width:none!important;',
    '  }',
    '  #game-container.authority-mode .authority-context,',
    '  #game-container.authority-mode .authority-influence{display:flex!important}',
    '  #game-container.authority-mode .authority-mini-row{',
    '    position:absolute!important;',
    '    left:12px!important;right:12px!important;',
    '    bottom:calc(56px + env(safe-area-inset-bottom,0px))!important;',
    '    z-index:6!important;margin:0!important;gap:6px!important;',
    '  }',
    '  #game-container.authority-mode .authority-desk-hotspot{',
    '    left:18%!important;right:18%!important;bottom:6%!important;',
    '    width:auto!important;height:55%!important;z-index:100!important;pointer-events:auto!important;',
    '  }',
    '}',

    /* Desktop large */
    '@media (min-width:701px){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.28)),url("./assets/backgrounds/desktop/avtoritet.png")!important;',
    '    background-size:cover!important;',
    '    background-position:center center!important;',
    '  }',
    '}'
  ].join('');
  document.head.appendChild(s);
})();
