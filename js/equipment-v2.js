/* equipment-v2 — rebalanced rarities, new items, icons */
'use strict';
(function(){
  var ICON_BASE='./assets/equipment-icons/';
  /* rarity: common | rare | extreme | authority
     common raid dmg: 2–6 */
  var WEAPONS=[
    {id:'fists',name:'Кулаки',icon:'👊',img:'fists.webp',cost:0,power:0,raid:0,rarity:'common',shop:true,desc:'Голые руки'},
    {id:'nail',name:'Ржавый гвоздь',icon:'📌',img:'nail.png',cost:800,power:0,raid:2,rarity:'common',shop:true,desc:'+2 урон в рейдах'},
    {id:'glass',name:'Осколок стекла',icon:'🔪',img:'glass.png',cost:1200,power:0,raid:3,rarity:'common',shop:true,desc:'+3 урон в рейдах'},
    {id:'razor',name:'Бритва',icon:'🪒',img:'razor.png',cost:1500,power:0,raid:4,rarity:'common',shop:true,desc:'+4 урон в рейдах'},
    {id:'awl',name:'Шило',icon:'📍',img:'awl.png',cost:4000,power:0,raid:6,rarity:'common',shop:true,desc:'+6 урон в рейдах'},
    {id:'hammer',name:'Молоток',icon:'🔨',img:'hammer.png',cost:12000,power:1,raid:18,rarity:'rare',shop:true,desc:'+1 сила · +18 урон в рейдах'},
    {id:'shank',name:'Заточка',icon:'🗡️',img:'shank.webp',cost:18000,power:1,raid:24,rarity:'rare',shop:true,desc:'+1 сила · +24 урон в рейдах'},
    {id:'bat',name:'Бита',icon:'🏏',img:'bat.webp',cost:35000,power:2,raid:36,rarity:'rare',shop:true,desc:'+2 сила · +36 урон в рейдах'},
    {id:'butterfly',name:'Нож-бабочка',icon:'🦋',img:'butterfly.png',cost:0,power:3,raid:55,rarity:'extreme',shop:false,desc:'Только из рейдов · +3 сила · +55 урон'},
    {id:'knuckles',name:'Кастет',icon:'✊',img:'knuckles.webp',cost:0,power:4,raid:85,rarity:'extreme',shop:false,desc:'Только из рейдов · +4 сила · +85 урон'},
    {id:'pipe',name:'Труба',icon:'🔩',img:'pipe.webp',cost:90000,power:4,raid:90,rarity:'extreme',shop:true,desc:'+4 сила · +90 урон в рейдах'},
    {id:'chain',name:'Цепь',icon:'⛓️',img:'chain.png',cost:0,power:5,raid:110,rarity:'extreme',shop:false,desc:'Только из рейдов · +5 сила · +110 урон'},
    {id:'authority',name:'Секира',icon:'🪓',img:'sekira.webp',cost:0,power:8,raid:200,rarity:'authority',shop:false,desc:'Только с босса · +8 сила · +200 урон'}
  ];
  var ARMORS=[
    {id:'tee',name:'Майка',icon:'👕',img:'tee.webp',cost:0,energy:0,crit:0,rarity:'common',shop:true,desc:'Без защиты'},
    {id:'fufayka',name:'Фуфайка',icon:'🧥',cost:1800,energy:15,crit:0,rarity:'common',shop:true,desc:'+15 макс. энергия'},
    {id:'vatnik',name:'Ватник',icon:'🧶',img:'padded_jacket.webp',cost:3500,energy:25,crit:0.005,rarity:'common',shop:true,desc:'+25 энергия · +0.5% крит'},
    {id:'leather',name:'Кожанка',icon:'🧥',img:'leather.webp',cost:15000,energy:45,crit:0.015,rarity:'rare',shop:true,desc:'+45 энергия · +1.5% крит'},
    {id:'crosschain',name:'Цепь с крестом',icon:'✝️',img:'cross_chain.png',cost:28000,energy:60,crit:0.025,rarity:'rare',shop:true,desc:'+60 энергия · +2.5% крит'},
    {id:'plate',name:'Броник',icon:'🛡️',img:'plate.webp',cost:55000,energy:90,crit:0.03,rarity:'extreme',shop:true,desc:'+90 энергия · +3% крит'},
    {id:'vest',name:'Разгрузка',icon:'🦺',img:'vest.png',cost:0,energy:110,crit:0.04,rarity:'extreme',shop:false,desc:'Только из рейдов · +110 энергия · +4% крит'},
    {id:'crown',name:'Корона зоны',icon:'👑',img:'zone_crown.png',cost:0,energy:160,crit:0.06,rarity:'authority',shop:false,desc:'Только с босса · +160 энергия · +6% крит'}
  ];

  var RL={common:'Обычное',rare:'Редкое',extreme:'Крайне редкое',authority:'Авторитетное'};
  var RC={common:'#9a9a9a',rare:'#3dcf5a',extreme:'#e74c3c',authority:'#ffd24a'};

  var DROPS={
    petrovich:[
      {id:'nail',kind:'weapon',chance:0.22},
      {id:'glass',kind:'weapon',chance:0.18},
      {id:'razor',kind:'weapon',chance:0.14},
      {id:'fufayka',kind:'armor',chance:0.12}
    ],
    vtirach:[
      {id:'glass',kind:'weapon',chance:0.14},
      {id:'awl',kind:'weapon',chance:0.12},
      {id:'razor',kind:'weapon',chance:0.12},
      {id:'vatnik',kind:'armor',chance:0.14},
      {id:'fufayka',kind:'armor',chance:0.1}
    ],
    mafioznik:[
      {id:'hammer',kind:'weapon',chance:0.12},
      {id:'shank',kind:'weapon',chance:0.1},
      {id:'leather',kind:'armor',chance:0.1}
    ],
    mongol:[
      {id:'bat',kind:'weapon',chance:0.1},
      {id:'hammer',kind:'weapon',chance:0.1},
      {id:'crosschain',kind:'armor',chance:0.08},
      {id:'leather',kind:'armor',chance:0.1}
    ],
    glaz:[
      {id:'butterfly',kind:'weapon',chance:0.08},
      {id:'knuckles',kind:'weapon',chance:0.08},
      {id:'plate',kind:'armor',chance:0.07}
    ],
    krest:[
      {id:'pipe',kind:'weapon',chance:0.07},
      {id:'knuckles',kind:'weapon',chance:0.07},
      {id:'chain',kind:'weapon',chance:0.06},
      {id:'vest',kind:'armor',chance:0.07},
      {id:'butterfly',kind:'weapon',chance:0.06}
    ],
    psikh:[
      {id:'authority',kind:'weapon',chance:0.1},
      {id:'crown',kind:'armor',chance:0.1},
      {id:'chain',kind:'weapon',chance:0.12},
      {id:'vest',kind:'armor',chance:0.12}
    ]
  };

  function st(){try{if(typeof window.getGameState==='function'){var g=window.getGameState();if(g)return g}}catch(e){} return window.s||null}
  function fmt(n){n=Math.floor(Number(n)||0);return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ')}
  function save(){try{if(typeof window.saveGame==='function')window.saveGame();else if(typeof window.saveNow==='function')window.saveNow()}catch(e){}}
  function ui(){try{if(typeof window.ui==='function')window.ui()}catch(e){}}
  function msg(t){var e=document.getElementById('event-message');if(e){e.textContent=t;e.classList.add('show');setTimeout(function(){e.classList.remove('show')},2200)}}
  function ensure(){
    var s=st();if(!s)return;
    if(!s.equipment)s.equipment={weapon:'fists',armor:'tee'};
    if(!s.ownedWeapons)s.ownedWeapons=['fists'];
    if(!s.ownedArmor)s.ownedArmor=['tee'];
    if(s.ownedWeapons.indexOf('fists')<0)s.ownedWeapons.unshift('fists');
    if(s.ownedArmor.indexOf('tee')<0)s.ownedArmor.unshift('tee');
    if(s.equipment.armor==='telnyashka')s.equipment.armor='tee';
    if(s.ownedArmor){
      var i=s.ownedArmor.indexOf('telnyashka');
      if(i>=0)s.ownedArmor.splice(i,1);
    }
  }
  function find(id,kind){
    var arr=kind==='weapon'?WEAPONS:ARMORS;
    for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];
    return null;
  }
  function iconHtml(item){
    if(item && item.img){
      return '<img class="eq-icon-img" src="'+ICON_BASE+item.img+'" alt="" draggable="false">';
    }
    return item && item.icon ? item.icon : '';
  }
  function rarityTag(r){
    var c=RC[r]||'#aaa';
    var n=RL[r]||r;
    return '<span class="eq-rarity" style="color:'+c+'">'+n+'</span>';
  }
  function card(item,kind,owned,eq){
    var isOn=eq===item.id;
    var canBuy=item.shop!==false&&!owned&&item.cost>0;
    var onlyDrop=item.shop===false&&!owned;
    var btn='';
    if(isOn)btn='<span class="eq-badge eq-on">Надето</span>';
    else if(owned)btn='<button type="button" class="eq-btn" data-eq="'+kind+'" data-id="'+item.id+'">Выбрать</button>';
    else if(canBuy)btn='<button type="button" class="eq-btn" data-buy="'+kind+'" data-id="'+item.id+'">'+fmt(item.cost)+' 🍵</button>';
    else if(onlyDrop)btn='<span class="eq-badge eq-drop">Дроп</span>';
    else btn='<span class="eq-badge">—</span>';
    return '<div class="eq-card eq-r-'+item.rarity+(isOn?' eq-equipped':'')+'">'
      +'<div class="eq-icon eq-icon-'+item.rarity+'">'+iconHtml(item)+'</div>'
      +'<div class="eq-body"><b>'+item.name+' '+rarityTag(item.rarity)+'</b><small>'+item.desc+'</small></div>'
      +btn+'</div>';
  }
  function openEquipment(){
    ensure();
    var s=st();
    if(!s){
      msg('⚔️ Игра ещё загружается…');
      return;
    }
    var w=s.equipment.weapon||'fists';
    var a=s.equipment.armor||'tee';
    var html='<div class="eq-window"><div class="eq-kicker">СНАРЯЖЕНИЕ</div><h2>Оружие и броня</h2>';
    html+='<p class="eq-sub">Обычное — серое · Редкое — зелёное · Крайне редкое — красное · Авторитетное — золото</p>';
    html+='<div class="eq-section"><b>🗡 Оружие</b>';
    WEAPONS.forEach(function(it){html+=card(it,'weapon',s.ownedWeapons.indexOf(it.id)>=0,w)});
    html+='</div><div class="eq-section"><b>🛡 Броня</b>';
    ARMORS.forEach(function(it){html+=card(it,'armor',s.ownedArmor.indexOf(it.id)>=0,a)});
    html+='</div><p style="margin-top:12px"><button type="button" class="eq-btn" id="eq-back-shop">← В качалку</button></p></div>';
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
        msg((item.icon||'')+' Купил и надел: '+item.name);save();ui();openEquipment();
      };
    });
    document.querySelectorAll('[data-eq]').forEach(function(btn){
      btn.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var kind=btn.dataset.eq,id=btn.dataset.id;
        if(kind==='weapon'){if(s.ownedWeapons.indexOf(id)<0)return;s.equipment.weapon=id}
        else{if(s.ownedArmor.indexOf(id)<0)return;s.equipment.armor=id}
        var item=find(id,kind);msg((item.icon||'')+' Выбрал: '+item.name);save();ui();openEquipment();
      };
    });
  }
  function tryDrop(fighterId){
    var s=st();if(!s)return null;
    ensure();
    var table=DROPS[fighterId];if(!table||!table.length)return null;
    var got=[];
    table.forEach(function(d){
      if(Math.random()>d.chance)return;
      var item=find(d.id,d.kind);if(!item)return;
      if(d.kind==='weapon'){
        if(s.ownedWeapons.indexOf(d.id)>=0)return;
        s.ownedWeapons.push(d.id);got.push(item);
      }else{
        if(s.ownedArmor.indexOf(d.id)>=0)return;
        s.ownedArmor.push(d.id);got.push(item);
      }
    });
    if(got.length){save();return got}
    return null;
  }
  function rollRaidDrops(fighterId){
    var got=null;
    try{ got=tryDrop(fighterId); }catch(e){ console.warn('[equipment] drop error',e); return null; }
    if(got && got.length){
      var names=got.map(function(it){ return (it.icon||'')+' '+it.name; }).join(', ');
      msg('🎁 Дроп: '+names);
      try{ if(typeof window.ui==='function') window.ui(); }catch(e){}
    }
    return got;
  }
  function $(id){return document.getElementById(id);}
  function injectShopTab(){
    var content=$('modal-content');
    if(!content) return;
    if(content.querySelector('.shop-eq-link')) return;
    var h2=content.querySelector('h2');
    if(!h2 || h2.textContent.indexOf('Качалка')<0) return;
    var link=document.createElement('button');
    link.type='button';
    link.className='eq-btn shop-eq-link';
    link.id='shop-eq-btn';
    link.style.cssText='width:100%;margin:12px 0 0;padding:12px;font-size:14px';
    link.textContent='⚔️ Оружие и броня';
    link.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); openEquipment(); });
    var grid=content.querySelector('.shop-grid');
    if(grid && grid.parentNode) grid.parentNode.appendChild(link);
    else if(h2.parentNode) h2.parentNode.appendChild(link);
  }
  function bootEq(){
    var overlay=$('modal-overlay');
    if(overlay){
      new MutationObserver(function(){ setTimeout(injectShopTab, 20); })
        .observe(overlay, {childList:true, subtree:true, attributes:true});
    }
    var shop=$('btn-shop');
    if(shop) shop.addEventListener('click', function(){ setTimeout(injectShopTab, 30); setTimeout(injectShopTab, 120); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bootEq);
  else bootEq();
  window.__raidTryDrop=tryDrop;
  window.rollRaidDrops=rollRaidDrops;
  window.openEquipment=openEquipment;
  window.getEquipRaidBonus=function(){var s=st();if(!s||!s.equipment)return 0;var w=WEAPONS.find(function(x){return x.id===s.equipment.weapon});return w?Number(w.raid)||0:0};
  window.getEffectivePower=function(){var s=st();if(!s)return 1;var w=WEAPONS.find(function(x){return x.id===(s.equipment&&s.equipment.weapon)});var bonus=w?Number(w.power)||0:0;return Math.max(1,(Number(s.power)||1)+bonus)};
  window.getEffectiveCrit=function(){var s=st();if(!s)return 0.05;var a=ARMORS.find(function(x){return x.id===(s.equipment&&s.equipment.armor)});var bonus=a?Number(a.crit)||0:0;return Math.min(0.55,(Number(s.critChance)||0.05)+bonus)};
  console.log('[equipment-v2] rebalance v3.3');
})();
