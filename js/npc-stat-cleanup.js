'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const originalSetItem=Storage.prototype.setItem;
  function cleanText(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const old=node.nodeValue||'';
      const next=old
        .replace(/\s*\+\d+\s*💪/g,'')
        .replace(/\s*\+\d+\s*🧠/g,'')
        .replace(/\s*\+\d+\s*💰/g,'')
        .replace(/\s{2,}/g,' ')
        .trim();
      if(next!==old)node.nodeValue=next;
    });
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
    const c=document.getElementById('modal-content');
    if(c)cleanText(c);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>cleanText(document.body),{once:true});
  else cleanText(document.body);
})();
