/* Лавка: без постоянного polling на мобильных устройствах */
'use strict';
(function(){
  const $=id=>document.getElementById(id);
  function parseCompact(value){
    const v=String(value||'').trim().replace(',','.');
    const n=parseFloat(v);
    if(!Number.isFinite(n))return 0;
    if(/M$/i.test(v))return Math.floor(n*1000000);
    if(/K$/i.test(v))return Math.floor(n*1000);
    return Math.floor(n);
  }
  function cigarettes(){return parseCompact(($('cigarettes')||{}).textContent);}
  function refreshShop(){
    const content=$('modal-content');
    if(!content)return;
    content.querySelectorAll('[data-b]').forEach(function(btn){
      const m=btn.innerHTML.match(/Цена\s+([0-9.,]+(?:K|M)?)/i);
      if(!m)return;
      const cost=parseCompact(m[1]);
      if(!btn.dataset.priceDecorated){
        btn.innerHTML=btn.innerHTML.replace(/Цена\s+[0-9.,]+(?:K|M)?/i,'Цена '+m[1]+' 🚬');
        btn.dataset.priceDecorated='1';
      }
      btn.disabled=cigarettes()<cost;
      btn.title=btn.disabled?'Не хватает сигарет':'Купить за '+m[1]+' 🚬';
    });
  }
  function init(){
    const shop=$('btn-shop'),rank=$('btn-rank');
    if(shop)shop.textContent='🛒 Лавка';
    if(rank)rank.textContent='🏆 Масть';
    const content=$('modal-content');
    if(content)new MutationObserver(refreshShop).observe(content,{childList:true,subtree:true,characterData:true});
    if(shop)shop.addEventListener('click',()=>setTimeout(refreshShop,0));
    document.addEventListener('click',function(e){
      if(e.target.closest('[data-b]'))setTimeout(refreshShop,0);
    },true);
    refreshShop();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
