'use strict';
(function(){
  /* Emergency restore of core game from last good commit (sync so bootstrap order is preserved) */
  var urls = [
    'https://raw.githubusercontent.com/anons23/avtoritet-tapper/0b065cb/js/game.js',
    'https://cdn.jsdelivr.net/gh/anons23/avtoritet-tapper@0b065cb/js/game.js'
  ];
  var code = null, lastErr = null;
  for (var i = 0; i < urls.length; i++) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', urls[i], false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText && xhr.responseText.indexOf('function tap') >= 0) {
        code = xhr.responseText;
        console.log('[game] restored sync from', urls[i]);
        break;
      }
      lastErr = 'status ' + xhr.status;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!code) {
    console.error('[game] restore failed', lastErr);
    return;
  }
  var s = document.createElement('script');
  s.text = code;
  document.head.appendChild(s);
})();
