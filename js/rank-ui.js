'use strict';
(function(){
  const THRESHOLDS=[0,100,500,2000,8000,25000];
  const NAMES=['Лох','Мужик','Блатной','Смотрящий','Авторитет','Вор в законе'];
  function points(){
    const el=document.getElementById('points');
    return Number(String(el?.textContent||'0').replace(/[^0-9.]/g,''))||0;
  }
  function apply(){
    const el=document.getElementById('rank');
    if(!el)return;
    const p=points();
    let i=0;for(let j=0;j<THRESHOLDS.length;j++)if(p>=THRESHOLDS[j])i=j;
    if(el.textContent!==NAMES[i])el.textContent=NAMES[i];
  }
  function init(){
    apply();
    const p=document.getElementById('points');
    if(p)new MutationObserver(apply).observe(p,{childList:true,characterData:true,subtree:true});
    setInterval(apply,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
