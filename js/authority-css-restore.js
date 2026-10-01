'use strict';
(function(){
  if(document.getElementById('authority-ui-css-restore'))return;
  var s=document.createElement('style');
  s.id='authority-ui-css-restore';
  s.textContent=[
    /* Always hide legacy strip and test badge */
    '.authority-strip{display:none!important}',
    '#test-version,#test-reset-btn,.test-reset-btn{display:none!important}',

    /* Full-bleed authority room background — no black voids */
    '#game-container.authority-mode{',
    '  background:#0a0e10!important;',
    '  background-image:linear-gradient(rgba(4,8,10,.12),rgba(4,8,10,.32)),url("./assets/backgrounds/desktop/avtoritet.png")!important;',
    '  background-size:cover!important;',
    '  background-position:center center!important;',
    '  background-repeat:no-repeat!important;',
    '}',
    '@media(max-width:700px){',
    '  #game-container.authority-mode{',
    '    background-image:linear-gradient(rgba(4,8,10,.10),rgba(4,8,10,.28)),url("./assets/backgrounds/mobile/avtoritet.png")!important;',
    '    background-size:cover!important;',
    '    background-position:center center!important;',
    '    background-repeat:no-repeat!important;',
    '  }',
    '}',

    /* Hero area fills the screen; use container background as the art */
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

    /* Context + influence badges */
    '#game-container.authority-mode .authority-context,',
    '#game-container.authority-mode .authority-influence{display:flex!important}',

    /* Mini cards sit above the bottom nav */
    '#game-container.authority-mode .authority-mini-row{',
    '  position:absolute!important;',
    '  left:10px!important;',
    '  right:10px!important;',
    '  bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;',
    '  z-index:6!important;',
    '  margin:0!important;',
    '}',

    /* Hotspot for desk / folders */
    '#game-container.authority-mode .authority-desk-hotspot{',
    '  left:10%!important;',
    '  right:10%!important;',
    '  bottom:8%!important;',
    '  width:auto!important;',
    '  height:48%!important;',
    '  z-index:100!important;',
    '  pointer-events:auto!important;',
    '}'
  ].join('');
  document.head.appendChild(s);
})();
