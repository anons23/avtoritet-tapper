'use strict';
(function(){
  const BG_CLASSES=['rank-salaga','rank-pacan','rank-blatnoi','rank-smotryashiy','rank-avtoritet'];
  const RANK_CLASSES={
    'Салага':'rank-salaga',
    'Пацан':'rank-pacan',
    'Блатной':'rank-blatnoi',
    'Смотрящий':'rank-smotryashiy',
    'Авторитет':'rank-avtoritet'
  };
  function sync(){
    const game=document.getElementById('game-container');
    const rank=document.getElementById('rank');
    if(!game)return;
    /* Touch the classes only when the rank background really changes:
       removing and re-adding them on every ui() restyled the whole game. */
    const want=game.classList.contains('jail-mode')?null:(rank&&RANK_CLASSES[rank.textContent.trim()]||'rank-salaga');
    BG_CLASSES.forEach(c=>{ if(c!==want&&game.classList.contains(c))game.classList.remove(c); });
    if(want&&!game.classList.contains(want))game.classList.add(want);
  }
  function init(){
    sync();
    const rank=document.getElementById('rank');
    const jail=document.getElementById('jail-panel');
    if(rank)new MutationObserver(sync).observe(rank,{childList:true,characterData:true,subtree:true});
    if(jail)new MutationObserver(sync).observe(jail,{attributes:true,attributeFilter:['class']});
    setInterval(sync,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
