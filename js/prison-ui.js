'use strict';
(function(){
  function rename(){
    const nav=document.getElementById('btn-tasks');
    if(nav)nav.textContent='🎯 Поручения';
    document.querySelectorAll('#modal-content h2').forEach(h=>{
      if(h.textContent.includes('Задания'))h.textContent=h.textContent.replace('Задания','Поручения');
    });
  }
  function init(){
    rename();
    const c=document.getElementById('modal-content');
    if(c)new MutationObserver(rename).observe(c,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
