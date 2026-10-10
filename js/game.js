'use strict';
(function(){
  function load(url){return fetch(url).then(function(r){if(!r.ok)throw new Error(url);return r.text();});}
  Promise.all([
    load('./js/game-body-a.js?v=1'),
    load('./js/game-body-b.js?v=1')
  ]).then(function(parts){
    var s=document.createElement('script');
    s.text=parts[0]+parts[1];
    document.head.appendChild(s);
  }).catch(function(e){console.error('[game] split load failed',e);});
})();
