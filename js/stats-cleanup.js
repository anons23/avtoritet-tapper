'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  let wrapped=false;

  function cleanMessage(text){
    return String(text||'')
      .replace(/\s*\+\d+\s*💪/g,'')
      .replace(/\s*\+\d+\s*🧠/g,'')
      .replace(/\s*\+\d+\s*💰/g,'')
      .replace(/\s{2,}/g,' ')
      .trim();
  }

  function hideStats(){
    const stats=document.querySelector('#player-info .stats');
    if(stats)stats.remove();
  }

  function wrapMessages(){
    if(wrapped || typeof window.msg!=='function')return;
    const original=window.msg;
    window.msg=function(text){
      const cleaned=cleanMessage(text);
      if(cleaned)original(cleaned);
    };
    wrapped=true;
  }

  function run(){
    hideStats();
    wrapMessages();
  }

  run();
  const observer=new MutationObserver(run);
  observer.observe(document.body,{childList:true,subtree:true});
  window.setInterval(run,500);
})();
