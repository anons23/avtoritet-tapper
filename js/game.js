/* TEMP RECOVERY: load known-good game.js until full file is restored */
(function () {
  var sources = [
    'https://cdn.jsdelivr.net/gh/anons23/avtoritet-tapper@8e9939cc90db42f6fff618534266902d2fc6f8d1/js/game.js',
    'https://cdn.jsdelivr.net/gh/anons23/avtoritet-tapper@8e9939cc/js/game.js',
    'https://raw.githack.com/anons23/avtoritet-tapper/8e9939cc90db42f6fff618534266902d2fc6f8d1/js/game.js'
  ];
  var i = 0;
  function next() {
    if (i >= sources.length) {
      console.error('[game] recovery failed: could not load game.js');
      return;
    }
    var s = document.createElement('script');
    s.src = sources[i++];
    s.async = false;
    s.onerror = next;
    s.onload = function () { console.debug('[game] recovery loaded from', s.src); };
    document.head.appendChild(s);
  }
  next();
})();
