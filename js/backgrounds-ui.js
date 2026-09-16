'use strict';
(function(){
  const BG_CLASSES=['rank-salaga','rank-pacan','rank-blatnoi','rank-smotryashiy','rank-avtoritet','rank-vor'];
  const RANK_CLASSES={
    'Салага':'rank-salaga',
    'Пацан':'rank-pacan',
    'Блатной':'rank-blatnoi',
    'Смотрящий':'rank-smotryashiy',
    'Авторитет':'rank-avtoritet',
    'Вор в законе':'rank-vor'
  };
  function sync(){
    const game=document.getElementById('game-container');
    const rank=document.getElementById('rank');
    if(!game)return;
    BG_CLASSES.forEach(c=>game.classList.remove(c));
    if(game.classList.contains('jail-mode'))return;
    const cls=rank&&RANK_CLASSES[rank.textContent.trim()]||'rank-salaga';
    game.classList.add(cls);
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
