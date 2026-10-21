'use strict';
(function(){
  const SELECTORS=['#player-info .stats'];
  function hideStats(){
    SELECTORS.forEach(sel=>{
      const el=document.querySelector(sel);
      if(el){el.style.display='none';el.setAttribute('aria-hidden','true');}
    });
  }
  function run(){hideStats();}
  run();
  const observer=new MutationObserver(run);
  observer.observe(document.body,{childList:true,subtree:true});
  window.setInterval(run,1000);
})();
