/* Тюремный антураж магазина и динамическая доступность покупок */
'use strict';
(function(){
  const $=id=>document.getElementById(id);
  function cigarettes(){return Math.floor(Number(($('cigarettes')||{}).textContent||0).replace(/[^0-9]/g,''))||0}
  function refreshShop(){
    const content=$('modal-content');
    if(!content)return;
    content.querySelectorAll('[data-b]').forEach(btn=>{
      const m=btn.innerHTML.match(/Цена\s+([0-9.,]+)/);
      if(!m)return;
      const cost=Math.floor(Number(m[1].replace(/,/g,'')));
      if(!btn.dataset.priceDecorated){
        btn.innerHTML=btn.innerHTML.replace(/Цена\s+[0-9.,]+/, 'Цена '+cost+' 🚬');
        btn.dataset.priceDecorated='1';
      }
      btn.disabled=cigarettes()<cost;
      btn.title=btn.disabled?'Не хватает сигарет':'Купить за '+cost+' 🚬';
    });
  }
  function renameNav(){
    const shop=$('btn-shop'),rank=$('btn-rank');
    if(shop)shop.textContent='🛒 Лавка';
    if(rank)rank.textContent='🏆 Масть';
  }
  function init(){
    renameNav();
    const content=$('modal-content');
    if(content){
      new MutationObserver(refreshShop).observe(content,{childList:true,subtree:true,characterData:true});
    }
    const shopBtn=$('btn-shop');
    if(shopBtn)shopBtn.addEventListener('click',()=>setTimeout(refreshShop,0));
    setInterval(refreshShop,250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
