'use strict';
(function(){
  /* Temporary restore: load last known-good game.js until full file is recommitted */
  var URL = 'https://raw.githubusercontent.com/anons23/avtoritet-tapper/0b065cb82f7c0e0f0/js/game.js';
  /* resolve full commit sha */
  var CANDIDATES = [
    'https://raw.githubusercontent.com/anons23/avtoritet-tapper/0b065cb/js/game.js',
    'https://cdn.jsdelivr.net/gh/anons23/avtoritet-tapper@0b065cb/js/game.js'
  ];
  function inject(code){
    var s = document.createElement('script');
    s.text = code;
    document.head.appendChild(s);
  }
  function tryLoad(i){
    if(i >= CANDIDATES.length){
      console.error('[game] restore failed: could not load good game.js');
      return;
    }
    fetch(CANDIDATES[i], {cache:'no-store'})
      .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.text(); })
      .then(function(code){
        if(!code || code.indexOf('function tap') < 0) throw new Error('bad payload');
        inject(code);
        console.log('[game] restored from', CANDIDATES[i]);
      })
      .catch(function(err){
        console.warn('[game] candidate failed', CANDIDATES[i], err);
        tryLoad(i+1);
      });
  }
  tryLoad(0);
})();
