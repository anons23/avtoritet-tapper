/* equipment-v2 overlay — prices, rarities, drops */
'use strict';
(function(){
  var WEAPONS=[
    {id:'fists',name:'Кулаки',icon:'👊',cost:0,power:0,raid:0,rarity:'common',shop:true,desc:'Голые руки'},
    {id:'knuckles',name:'Кастет',icon:'🥊',cost:5000,power:1,raid:50,rarity:'common',shop:true,desc:'+1 сила · +50 урон в рейдах'},
    {id:'shank',name:'Заточка',icon:'🔪',cost:18000,power:2,raid:110,rarity:'uncommon',shop:true,desc:'+2 сила · +110 урон в рейдах'},
    {id:'bat',name:'Бита',icon:'🏏',cost:55000,power:4,raid:220,rarity:'rare',shop:true,desc:'+4 сила · +220 урон в рейдах'},
    {id:'pipe',name:'Труба',icon:'🔧',cost:140000,power:6,raid:350,rarity:'epic',shop:true,desc:'+6 сила · +350 урон в рейдах'},
    {id:'razor',name:'Бритва',icon:'🪒',cost:0,power:5,raid:280,rarity:'rare',shop:false,desc:'Только из рейдов · +5 сила · +280 урон'},
    {id:'chain',name:'Цепь',icon:'⛓️',cost:0,power:8,raid:420,rarity:'epic',shop:false,desc:'Только из рейдов · +8 сила · +420 урон'},
    {id:'authority',name:'Авторитетка',icon:'⚔️',cost:0,power:12,raid:600,rarity:'legendary',shop:false,desc:'Только с босса · +12 сила · +600 урон'}
  ];
  var ARMORS=[
    {id:'tee',name:'Майка',icon:'👕',cost:0,energy:0,crit:0,rarity:'common',shop:true,desc:'Без защиты'},
    {id:'vatnik',name:'Ватник',icon:'🧥',cost:7000,energy:30,crit:0.01,rarity:'common',shop:true,desc:'+30 макс. энергия'},
    {id:'leather',name:'Кожанка',icon:'🥋',cost:28000,energy:60,crit:0.02,rarity:'uncommon',shop:true,desc:'+60 энергия · +2% крит'},
    {id:'plate',name:'Броник',icon:'🛡️',cost:95000,energy:120,crit:0.04,rarity:'rare',shop:true,desc:'+120 энергия · +4% крит'},
    {id:'vest',name:'Разгрузка',icon:'🦺',cost:0,energy:100,crit:0.03,rarity:'epic',shop:false,desc:'Только из рейдов · +100 энергия · +3% крит'},
    {id:'crown',name:'Корона зоны',icon:'👑',cost:0,energy:180,crit:0.06,rarity:'legendary',shop:false,desc:'Только с босса · +180 энергия · +6% крит'}
  ];
  var RL={common:'Обычное',uncommon:'Необычное',rare:'Редкое',epic:'Эпическое',legendary:'Легендарное'};
  var RC={common:'#b0b0b0',uncommon:'#5dcf6e',rare:'#5da8ff',epic:'#c77dff',legendary:'#ffb84d'};
  var DROPS={
    petrovich:[{id:'knuckles',kind:'weapon',chance:0.18},{id:'vatnik',kind:'armor',chance:0.14}],
    vtirach:[{id:'knuckles',kind:'weapon',chance:0.2},{id:'shank',kind:'weapon',chance:0.1},{id:'vatnik',kind:'armor',chance:0.16}],
    mafioznik:[{id:'shank',kind:'weapon',chance:0.18},{id:'bat',kind:'weapon',chance:0.08},{id:'leather',kind:'armor',chance:0.14}],
    mongol:[{id:'shank',kind:'weapon',chance:0.16},{id:'bat',kind:'weapon',chance:0.12},{id:'razor',kind:'weapon',chance:0.07},{id:'leather',kind:'armor',chance:0.14}],
    glaz:[{id:'bat',kind:'weapon',chance:0.14},{id:'razor',kind:'weapon',chance:0.12},{id:'pipe',kind:'weapon',chance:0.06},{id:'plate',kind:'armor',chance:0.1},{id:'vest',kind:'armor',chance:0.06}],
    krest:[{id:'razor',kind:'weapon',chance:0.14},{id:'chain',kind:'weapon',chance:0.08},{id:'pipe',kind:'weapon',chance:0.1},{id:'vest',kind:'armor',chance:0.1},{id:'plate',kind:'armor',chance:0.12}],
    psikh:[{id:'chain',kind:'weapon',chance:0.16},{id:'authority',kind:'weapon',chance:0.08},{id:'vest',kind:'armor',chance:0.14},{id:'crown',kind:'armor',chance:0.07},{id:'pipe',kind:'weapon',chance:0.12}]
  };
  function st(){return typeof window.getGameState==='function'?window.getGameState():null}
  function save(){if(typeof window.saveGame==='function')window.saveGame()}
  function ui(){if(typeof window.ui==='function')window.ui()}
  function msg(t){if(typeof window.msg==='function'){window.msg(t);return}var el=document.getElementById('event-message');if(!el)return;el.textContent=t;el.classList.add('show');setTimeout(function(){el.classList.remove('show')},2800)}
  function ensure(s){if(!s)return;if(!s.equipment)s.equipment={weapon:'fists',armor:'tee'};if(!Array.isArray(s.ownedWeapons)||!s.ownedWeapons.length)s.ownedWeapons=['fists'];if(!Array.isArray(s.ownedArmor)||!s.ownedArmor.length)s.ownedArmor=['tee']}
  function find(id,kind){var L=kind==='armor'?ARMORS:WEAPONS;return L.find(function(x){return x.id===id})||null}
  function grantEquipment(id,kind,silent){
    var s=st();if(!s)return null;ensure(s);var item=find(id,kind);if(!item)return null;
    if(kind==='armor'){if(s.ownedArmor.indexOf(id)>=0)return null;s.ownedArmor.push(id)}
    else{if(s.ownedWeapons.indexOf(id)>=0)return null;s.ownedWeapons.push(id)}
    save();if(!silent)msg(item.icon+' Дроп: '+item.name+' ('+(RL[item.rarity]||'')+')');return item;
  }
  function rollRaidDrops(fid){
    var table=DROPS[fid];if(!table)return[];var got=[];
    for(var i=0;i<table.length;i++){var row=table[i];if(Math.random()<row.chance){var it=grantEquipment(row.id,row.kind,true);if(it)got.push(it)}}
    if(got.length){msg('🎁 Дроп: '+got.map(function(it){return it.icon+' '+it.name}).join(', '));ui()}
    return got;
  }
  window.rollRaidDrops=rollRaidDrops;
  window.grantEquipment=grantEquipment;
  var fmt=function(n){return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ')};
  function card(item,kind,owned,eq){
    var isOwn=owned.indexOf(item.id)>=0,isEq=eq===item.id,action;
    if(isEq)action='<span class="eq-badge eq-on">Надето</span>';
    else if(isOwn)action='<button type="button" class="eq-btn" data-eq="'+kind+'" data-id="'+item.id+'">Надеть</button>';
    else if(item.shop===false)action='<span class="eq-badge eq-drop">Только дроп</span>';
    else action='<button type="button" class="eq-btn eq-buy" data-buy="'+kind+'" data-id="'+item.id+'">'+fmt(item.cost)+' 🍵</button>';
    var col=RC[item.rarity]||'#ccc';
    return '<div class="eq-card eq-r-'+item.rarity+(isEq?' eq-equipped':'')+'"><div class="eq-icon">'+item.icon+'</div><div class="eq-body"><b>'+item.name+' <span class="eq-rarity" style="color:'+col+'">'+(RL[item.rarity]||'')+'</span></b><small>'+item.desc+'</small></div><div class="eq-action">'+action+'</div></div>';
  }
  function openEquipment(){
    var s=st();if(!s)return;ensure(s);
    var w=WEAPONS.find(function(x){return x.id===s.equipment.weapon})||WEAPONS[0];
    var a=ARMORS.find(function(x){return x.id===s.equipment.armor})||ARMORS[0];
    var html='<div class="section-window shop-window"><div class="section-kicker">СНАРЯЖЕНИЕ</div><h2>⚔️ Оружие и броня</h2>'+
      '<p class="section-subtitle">Сейчас: '+w.icon+' <b>'+w.name+'</b> · '+a.icon+' <b>'+a.name+'</b></p>'+
      '<p class="section-subtitle" style="opacity:.85">Часть вещей — только дроп из рейдов / босса.</p>'+
      '<div class="eq-section-title">⚔️ Оружие</div><div class="eq-list">'+WEAPONS.map(function(i){return card(i,'weapon',s.ownedWeapons,s.equipment.weapon)}).join('')+'</div>'+
      '<div class="eq-section-title">🛡️ Броня</div><div class="eq-list">'+ARMORS.map(function(i){return card(i,'armor',s.ownedArmor,s.equipment.armor)}).join('')+'</div>'+
      '<p style="margin-top:12px"><button type="button" class="eq-btn" id="eq-back-shop">← В качалку</button></p></div>';
    if(typeof window.openModal==='function')window.openModal(html);
    bind();
    var back=document.getElementById('eq-back-shop');
    if(back)back.onclick=function(){var b=document.getElementById('btn-shop');if(b)b.click()};
  }
  function bind(){
    var s=st();if(!s)return;
    document.querySelectorAll('[data-buy]').forEach(function(btn){
      btn.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var kind=btn.dataset.buy,id=btn.dataset.id;
        var item=find(id,kind);if(!item)return;
        if(item.shop===false){msg('🔒 Только из рейдов / с босса');return}
        if(s.chifir<item.cost){msg('🍵 Нужно '+fmt(item.cost)+' чефира');return}
        s.chifir-=item.cost;
        if(kind==='weapon'){if(s.ownedWeapons.indexOf(id)<0)s.ownedWeapons.push(id);s.equipment.weapon=id}
        else{if(s.ownedArmor.indexOf(id)<0)s.ownedArmor.push(id);s.equipment.armor=id}
        msg(item.icon+' Купил и надел: '+item.name);save();ui();openEquipment();
      };
    });
    document.querySelectorAll('[data-eq]').forEach(function(btn){
      btn.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var kind=btn.dataset.eq,id=btn.dataset.id;
        if(kind==='weapon'){if(s.ownedWeapons.indexOf(id)<0)return;s.equipment.weapon=id}
        else{if(s.ownedArmor.indexOf(id)<0)return;s.equipment.armor=id}
        var item=find(id,kind);msg(item.icon+' Надел: '+item.name);save();ui();openEquipment();
      };
    });
  }
  window.openEquipment=openEquipment;
  window.getEquipRaidBonus=function(){var s=st();if(!s||!s.equipment)return 0;var w=WEAPONS.find(function(x){return x.id===s.equipment.weapon});return w?Number(w.raid)||0:0};
  window.getEffectivePower=function(){var s=st();if(!s)return 1;var w=WEAPONS.find(function(x){return x.id===(s.equipment&&s.equipment.weapon)});var bonus=w?Number(w.power)||0:0;return Math.max(1,(Number(s.power)||1)+bonus)};
  window.getEffectiveCrit=function(){var s=st();if(!s)return 0.05;var a=ARMORS.find(function(x){return x.id===(s.equipment&&s.equipment.armor)});var bonus=a?Number(a.crit)||0:0;return Math.min(0.55,(Number(s.critChance)||0.05)+bonus)};
  console.log('[equipment-v2] overlay ready');
})();
