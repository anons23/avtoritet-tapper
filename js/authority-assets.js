'use strict';
(function(){
  const BASE='./assets/authority/';
  const MAP={
    'Разобрать дела.png':'deal_button.png',
    'давить авторитетом.png':'authority_pressure.png',
    'дела барака иконка.jfif':'barrack_cases_icon.jfif',
    'дело решено.png':'case_resolved.png',
    'драка.jfif':'fight.jfif',
    'отлично.png':'excellent.png',
    'стычка.png':'clash.png'
  };
  const rewrite=url=>{
    let s=String(url||'');
    Object.keys(MAP).forEach(oldName=>{s=s.split(encodeURIComponent(oldName)).join(MAP[oldName]);s=s.split(oldName).join(MAP[oldName]);});
    return s;
  };
  const fixImage=img=>{
    if(!img||!img.getAttribute)return;
    const src=img.getAttribute('src');
    if(src&&src.indexOf('/assets/authority/')!==-1){const next=rewrite(src);if(next!==src)img.setAttribute('src',next);}
  };
  const style=document.createElement('style');
  style.textContent='#game-container.authority-mode{background-image:linear-gradient(rgba(4,8,10,.18),rgba(4,8,10,.55)),url("./assets/backgrounds/desktop/avtoritet.png")!important;}';
  (document.head||document.documentElement).appendChild(style);
  const observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(node=>{
    if(node.nodeType!==1)return;
    if(node.tagName==='IMG')fixImage(node);
    if(node.querySelectorAll)node.querySelectorAll('img[src]').forEach(fixImage);
  })));
  const start=()=>observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.documentElement)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
