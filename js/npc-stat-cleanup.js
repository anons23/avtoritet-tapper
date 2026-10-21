'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const originalSetItem=Storage.prototype.setItem;
  let gameStateWrapped=false;

  function cleanText(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const old=node.nodeValue||'';
      const next=old.replace(/\s*\+\d+\s*💪/g,'').replace(/\s*\+\d+\s*🧠/g,'').replace(/\s*\+\d+\s*💰/g,'').replace(/\s{2,}/g,' ').trim();
      if(next!==old)node.nodeValue=next;
    });
  }

  function wrapGameState(){
    if(gameStateWrapped||typeof window.getGameState!=='function')return;
    const original=window.getGameState;
    window.getGameState=function(){
      const state=original();
      if(!state||typeof state!=='object')return state;
      return new Proxy(state,{
        set(target,key,value){
          if(key==='power'||key==='respect'||key==='wealth')return true;
          target[key]=value;
          return true;
        }
      });
    };
    gameStateWrapped=true;
  }

  Storage.prototype.setItem=function(key,value){
    if(key===SAVE_KEY){
      try{
        const modal=document.getElementById('modal');
        if(modal&&modal.classList.contains('-modal')){
          const before=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');
          const next=JSON.parse(String(value)||'{}');
          ['power','respect','wealth'].forEach(k=>{
            if(Object.prototype.hasOwnProperty.call(before,k))next[k]=before[k];
          });
          value=JSON.stringify(next);
        }
      }catch(e){}
    }
    return originalSetItem.call(this,key,value);
  };

  const observer=new MutationObserver(()=>{
    wrapGameState();
    const c=document.getElementById('modal-content');
    if(c)cleanText(c);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  wrapGameState();
  window.setInterval(wrapGameState,100);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>cleanText(document.body),{once:true});
  else cleanText(document.body);
})();
