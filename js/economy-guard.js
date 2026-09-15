'use strict';
(function(){
  const KEY='avtoritet_save_v2';
  const map={power:'power',crit:'crit',energy:'energyMax'};
  function read(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');return d&&typeof d==='object'?d:null}catch(e){return null}}
  function fix(button,before){
    const kind=button&&button.dataset&&button.dataset.b;
    const field=map[kind];
    if(!field)return;
    const after=read();
    if(!after||!before)return;
    const spent=Number(before.cigarettes||0)>Number(after.cigarettes||0);
    if(!spent)return;
    after.upgrades={...(after.upgrades||{})};
    after.upgrades[field]=Math.max(0,Math.floor(Number(after.upgrades[field]||0)))+1;
    try{localStorage.setItem(KEY,JSON.stringify(after))}catch(e){}
  }
  function init(){
    document.addEventListener('click',function(e){
      const button=e.target.closest('[data-b]');
      if(!button)return;
      const before=read();
      setTimeout(function(){fix(button,before)},0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
