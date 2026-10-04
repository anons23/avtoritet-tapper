/* Качалка: обновление доступности без блокировки кликов */
'use strict';
(function(){
  var $=function(id){return document.getElementById(id);};
  function parseCompact(value){
    var v=String(value||'').trim().replace(/\s/g,'').replace(',','.');
    var n=parseFloat(v);
    if(!Number.isFinite(n)) return 0;
    if(/M$/i.test(v)) return Math.floor(n*1000000);
    if(/K$/i.test(v)) return Math.floor(n*1000);
    return Math.floor(n);
  }
  function chifir(){
    var el=$('chifir');
    return parseCompact(el && el.textContent);
  }
  function refreshShop(){
    var content=$('modal-content');
    if(!content) return;
    var money=chifir();
    content.querySelectorAll('button.shop-card[data-b], button[data-b]').forEach(function(btn){
      var cost=0;
      var priceEl=btn.querySelector('.shop-price');
      if(priceEl){
        cost=parseCompact(priceEl.textContent.replace(/[^\d.,KMkm]/g,''));
      } else {
        var m=btn.innerHTML.match(/(?:Цена\s*)?([0-9.,]+(?:K|M)?)\s*🍵/i) || btn.innerHTML.match(/([0-9.,]+(?:K|M)?)/);
        if(m) cost=parseCompact(m[1]);
      }
      if(!cost) return;
      // Только визуал: не disabled (на Android disabled-кнопки часто «мёртвые» после перерисовки)
      if(money < cost){
        btn.classList.add('shop-card-locked');
        btn.style.opacity='0.55';
        btn.title='Не хватает чефира';
      } else {
        btn.classList.remove('shop-card-locked');
        btn.style.opacity='1';
        btn.title='Купить';
      }
      try { btn.disabled=false; } catch(e){}
    });
  }
  function init(){
    var shop=$('btn-shop'), rank=$('btn-rank');
    if(shop) shop.textContent='💪 Качалка';
    if(rank) rank.textContent='🏆 Масть';
    var content=$('modal-content');
    if(content){
      new MutationObserver(function(){ setTimeout(refreshShop, 0); }).observe(content,{childList:true,subtree:true});
    }
    if(shop) shop.addEventListener('click', function(){ setTimeout(refreshShop, 30); });
    document.addEventListener('click', function(e){
      if(e.target && e.target.closest && e.target.closest('[data-b]')) setTimeout(refreshShop, 30);
    }, true);
    refreshShop();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
