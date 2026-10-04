/* Equipment system v1.0 — weapons & armor */
'use strict';
(function(){
  var WEAPONS = [
    {id:'fists',   name:'Кулаки',  icon:'👊', cost:0,     power:0, raid:0,   desc:'Голые руки'},
    {id:'knuckles',name:'Кастет',  icon:'🥊', cost:800,   power:1, raid:40,  desc:'+1 сила · +40 урон в рейдах'},
    {id:'shank',   name:'Заточка', icon:'🔪', cost:2500,  power:2, raid:90,  desc:'+2 сила · +90 урон в рейдах'},
    {id:'bat',     name:'Бита',    icon:'🏏', cost:8000,  power:4, raid:180, desc:'+4 сила · +180 урон в рейдах'},
    {id:'pipe',    name:'Труба',   icon:'🔧', cost:20000, power:6, raid:280, desc:'+6 сила · +280 урон в рейдах'}
  ];
  var ARMORS = [
    {id:'tee',    name:'Майка',   icon:'👕', cost:0,     energy:0,   crit:0,    desc:'Без защиты'},
    {id:'vatnik', name:'Ватник',  icon:'🧥', cost:1000,  energy:25,  crit:0.01, desc:'+25 макс. энергия'},
    {id:'leather',name:'Кожанка', icon:'🥋', cost:4000,  energy:50,  crit:0.02, desc:'+50 энергия · +2% крит'},
    {id:'plate',  name:'Броник',  icon:'🛡️', cost:15000, energy:100, crit:0.03, desc:'+100 энергия · +3% крит'}
  ];

  function $(id){ return document.getElementById(id); }
  function st(){ return typeof window.getGameState==='function' ? window.getGameState() : null; }
  function fmt(n){ return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
  function msg(t){
    if(typeof window.msg==='function'){ window.msg(t); return; }
    var el=$('event-message');
    if(!el) return;
    el.textContent=t;
    el.classList.add('show');
    setTimeout(function(){ el.classList.remove('show'); }, 2200);
  }

  function ensure(s){
    if(!s) return;
    if(!s.equipment) s.equipment = {weapon:'fists', armor:'tee'};
    if(!Array.isArray(s.ownedWeapons) || !s.ownedWeapons.length) s.ownedWeapons = ['fists'];
    if(!Array.isArray(s.ownedArmor) || !s.ownedArmor.length) s.ownedArmor = ['tee'];
    if(s.ownedWeapons.indexOf('fists')<0) s.ownedWeapons.unshift('fists');
    if(s.ownedArmor.indexOf('tee')<0) s.ownedArmor.unshift('tee');
    if(!WEAPONS.some(function(w){return w.id===s.equipment.weapon;})) s.equipment.weapon='fists';
    if(!ARMORS.some(function(a){return a.id===s.equipment.armor;})) s.equipment.armor='tee';
  }

  function weaponOf(s){ s=s||st(); ensure(s); return WEAPONS.find(function(w){return w.id===s.equipment.weapon;})||WEAPONS[0]; }
  function armorOf(s){ s=s||st(); ensure(s); return ARMORS.find(function(a){return a.id===s.equipment.armor;})||ARMORS[0]; }

  function equipPowerBonus(){ return Number(weaponOf().power)||0; }
  function equipRaidBonus(){ return Number(weaponOf().raid)||0; }
  function equipCritBonus(){ return Number(armorOf().crit)||0; }
  function equipEnergyBonus(){ return Number(armorOf().energy)||0; }

  function effectivePower(){
    var s=st(); if(!s) return 1;
    return Math.max(1, Number(s.power)||1) + equipPowerBonus();
  }
  function effectiveCrit(){
    var s=st(); if(!s) return 0.05;
    return Math.min(0.55, (Number(s.critChance)||0.05) + equipCritBonus());
  }

  function recalcMaxEnergy(){
    var s=st(); if(!s) return;
    ensure(s);
    var base = 250 + (Number(s.upgrades&&s.upgrades.energyMax)||0)*25;
    s.maxEnergy = base + equipEnergyBonus();
    if(s.energy > s.maxEnergy) s.energy = s.maxEnergy;
  }

  function save(){ if(typeof window.saveGame==='function') window.saveGame(); }
  function ui(){ if(typeof window.ui==='function') window.ui(); }

  function equipCard(item, kind, owned, equipped){
    var isOwn = owned.indexOf(item.id)>=0;
    var isEq = equipped === item.id;
    var action;
    if(isEq) action = '<span class="eq-badge eq-on">Надето</span>';
    else if(isOwn) action = '<button type="button" class="eq-btn" data-eq="'+kind+'" data-id="'+item.id+'">Надеть</button>';
    else action = '<button type="button" class="eq-btn eq-buy" data-buy="'+kind+'" data-id="'+item.id+'">'+fmt(item.cost)+' 🍵</button>';
    return '<div class="eq-card'+(isEq?' eq-equipped':'')+(isOwn?'':' eq-locked')+'">'+ 
      '<div class="eq-icon">'+item.icon+'</div>'+
      '<div class="eq-body"><b>'+item.name+'</b><small>'+item.desc+'</small></div>'+
      '<div class="eq-action">'+action+'</div></div>';
  }

  function openEquipment(){
    var s=st(); if(!s) return;
    if(s.jailed){ msg('🔒 Снаряга недоступна в карцере'); return; }
    ensure(s);
    var wEq=weaponOf(s), aEq=armorOf(s);
    var wHtml=WEAPONS.map(function(w){return equipCard(w,'weapon',s.ownedWeapons,s.equipment.weapon);}).join('');
    var aHtml=ARMORS.map(function(a){return equipCard(a,'armor',s.ownedArmor,s.equipment.armor);}).join('');
    var html=
      '<div class="section-window shop-window">'+
      '<div class="section-kicker">СНАРЯЖЕНИЕ</div>'+
      '<h2>⚔️ Оружие и броня</h2>'+
      '<p class="section-subtitle">Сейчас: '+wEq.icon+' <b>'+wEq.name+'</b> · '+aEq.icon+' <b>'+aEq.name+'</b></p>'+
      '<div class="eq-section-title">⚔️ Оружие</div><div class="eq-list">'+wHtml+'</div>'+
      '<div class="eq-section-title">🛡️ Броня</div><div class="eq-list">'+aHtml+'</div>'+
      '<p style="margin-top:12px"><button type="button" class="eq-btn" id="eq-back-shop">← В качалку</button></p>'+
      '</div>';
    if(typeof window.openModal==='function') window.openModal(html);
    bindEquipActions();
    var back=$('eq-back-shop');
    if(back) back.addEventListener('click', function(){
      var btn=$('btn-shop');
      if(btn) btn.click();
    });
  }

  function bindEquipActions(){
    var s=st(); if(!s) return;
    document.querySelectorAll('[data-buy]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var kind=btn.dataset.buy, id=btn.dataset.id;
        var list=kind==='weapon'?WEAPONS:ARMORS;
        var item=list.find(function(x){return x.id===id;});
        if(!item) return;
        if(s.chifir < item.cost){ msg('🍵 Нужно '+fmt(item.cost)+' чефира'); return; }
        s.chifir -= item.cost;
        if(kind==='weapon'){
          if(s.ownedWeapons.indexOf(id)<0) s.ownedWeapons.push(id);
          s.equipment.weapon=id;
          msg(item.icon+' Купил и надел: '+item.name);
        } else {
          if(s.ownedArmor.indexOf(id)<0) s.ownedArmor.push(id);
          var prev=equipEnergyBonus();
          s.equipment.armor=id;
          recalcMaxEnergy();
          s.energy=Math.min(s.maxEnergy, s.energy+Math.max(0,equipEnergyBonus()-prev));
          msg(item.icon+' Купил и надел: '+item.name);
        }
        save(); ui(); openEquipment();
      });
    });
    document.querySelectorAll('[data-eq]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var kind=btn.dataset.eq, id=btn.dataset.id;
        if(kind==='weapon'){
          if(s.ownedWeapons.indexOf(id)<0) return;
          s.equipment.weapon=id;
          msg(weaponOf().icon+' Надел: '+weaponOf().name);
        } else {
          if(s.ownedArmor.indexOf(id)<0) return;
          var prev=equipEnergyBonus();
          s.equipment.armor=id;
          recalcMaxEnergy();
          s.energy=Math.min(s.maxEnergy, Math.max(0, s.energy+(equipEnergyBonus()-prev)));
          msg(armorOf().icon+' Надел: '+armorOf().name);
        }
        save(); ui(); openEquipment();
      });
    });
  }

  function injectShopTab(){
    var content=$('modal-content');
    if(!content) return;
    if(content.querySelector('.shop-eq-link')) return;
    var h2=content.querySelector('h2');
    if(!h2 || h2.textContent.indexOf('Качалка')<0) return;
    var link=document.createElement('button');
    link.type='button';
    link.className='eq-btn shop-eq-link';
    link.style.cssText='width:100%;margin:8px 0 4px;padding:12px;font-size:14px';
    link.textContent='⚔️ Оружие и броня';
    link.addEventListener('click', function(e){ e.preventDefault(); openEquipment(); });
    var sub=content.querySelector('.section-subtitle');
    if(sub && sub.parentNode) sub.parentNode.insertBefore(link, sub.nextSibling);
    else content.insertBefore(link, h2.nextSibling);
  }

  function boot(){
    window.getEquipRaidBonus = equipRaidBonus;
    window.getEffectiveCrit = effectiveCrit;
    window.getEffectivePower = effectivePower;
    window.openEquipment = openEquipment;

    var tries=0;
    var t=setInterval(function(){
      tries++;
      var s=st();
      if(s){ ensure(s); recalcMaxEnergy(); clearInterval(t); }
      if(tries>40) clearInterval(t);
    }, 250);

    var overlay=$('modal-overlay');
    if(overlay){
      new MutationObserver(function(){ setTimeout(injectShopTab, 30); })
        .observe(overlay, {childList:true, subtree:true, attributes:true});
    }
    var shop=$('btn-shop');
    if(shop) shop.addEventListener('click', function(){ setTimeout(injectShopTab, 50); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
