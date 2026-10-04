/* equipment-v2 overlay — prices, rarities, drops */
'use strict';
(function(){
  var WEAPONS=[
    {id:'fists',name:'Кулаки',icon:'👊',cost:0,power:0,raid:0,rarity:'common',shop:true,desc:'Голые руки'},
    {id:'knuckles',name:'Кастет',icon:'✊',cost:5000,power:1,raid:50,rarity:'common',shop:true,desc:'+1 сила · +50 урон в рейдах'},
    {id:'shank',name:'Заточка',icon:'🗡️',cost:18000,power:2,raid:110,rarity:'uncommon',shop:true,desc:'+2 сила · +110 урон в рейдах'},
    {id:'bat',name:'Бита',icon:'🏏',cost:55000,power:4,raid:220,rarity:'rare',shop:true,desc:'+4 сила · +220 урон в рейдах'},
    {id:'pipe',name:'Труба',icon:'🔩',cost:140000,power:6,raid:350,rarity:'epic',shop:true,desc:'+6 сила · +350 урон в рейдах'},
    {id:'razor',name:'Бритва',icon:'🪒',cost:0,power:5,raid:280,rarity:'rare',shop:false,desc:'Только из рейдов · +5 сила · +280 урон'},
    {id:'chain',name:'Цепь',icon:'⛓️',cost:0,power:8,raid:420,rarity:'epic',shop:false,desc:'Только из рейдов · +8 сила · +420 урон'},
    {id:'authority',name:'Авторитетка',icon:'⚔️',cost:0,power:12,raid:600,rarity:'legendary',shop:false,desc:'Только с босса · +12 сила · +600 урон'}
  ];
  var ARMORS=[
    {id:'tee',name:'Майка',icon:'👕',cost:0,energy:0,crit:0,rarity:'common',shop:true,desc:'Без защиты'},
    {id:'vatnik',name:'Ватник',icon:'🧶',cost:7000,energy:30,crit:0.01,rarity:'common',shop:true,desc:'+30 макс. энергия'},
    {id:'leather',name:'Кожанка',icon:'🧥',cost:28000,energy:60,crit:0.02,rarity:'uncommon',shop:true,desc:'+60 энергия · +2% крит'},
    {id:'plate',name:'Броник',icon:'🛡️',cost:95000,energy:120,crit:0.04,rarity:'rare',shop:true,desc:'+120 энергия · +4% крит'},
    {id:'vest',name:'Разгрузка',icon:'🦺',cost:0,energy:100,crit:0.03,rarity:'epic',shop:false,desc:'Только из рейдов · +100 энергия · +3% крит'},
    {id:'crown',name:'Корона зоны',icon:'👑',cost:0,energy:180,crit:0.06,rarity:'legendary',shop:false,desc:'Только с босса · +180 энергия · +6% крит'}
  ];
  var RL={common:'Обычное',uncommon:'Необычное',rare:'Редкое',epic:'Эпическое',legendary:'Легендарное'};
  var RC={common:'#b0b0b0',uncommon:'#5dcf6e',rare:'#5da8ff',epic:'#c77dff',legendary:'#ffb84d'};
  var DROPS={
    petrovich:[{id:'knuckles',kind:'weapon',chance:0.18},{id:'vatnik',kind:'armor',chance:0.14}],
    vtirach:[{id:'knuckles',kind:'weapon',chance:0.2},{id:'shank',kind:'weapon',chance:0.1},{id:'vatnik',kind:'armor',chance:0.16}],
    mafioznik:[{id:'shank',kind:'weapon',chance:0.18},{id:'bat',kind:'weapon',chance:0.08},{id:'leather',kind:'armor',chance:0.12}],
    mongol:[{id:'bat',kind:'weapon',chance:0.14},{id:'razor',kind:'weapon',chance:0.08},{id:'leather',kind:'armor',chance:0.14}],
    glaz:[{id:'razor',kind:'weapon',chance:0.12},{id:'pipe',kind:'weapon',chance:0.06},{id:'plate',kind:'armor',chance:0.1}],
    krest:[{id:'pipe',kind:'weapon',chance:0.1},{id:'chain',kind:'weapon',chance:0.06},{id:'vest',kind:'armor',chance:0.08},{id:'plate',kind:'armor',chance:0.1}],
    psikh:[{id:'authority',kind:'weapon',chance:0.12},{id:'crown',kind:'armor',chance:0.12},{id:'chain',kind:'weapon',chance:0.18},{id:'vest',kind:'armor',chance:0.15}]
  };
  function st(){return window.s||null}
  function fmt(n){n=Math.floor(Number(n)||0);return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ')}
  function save(){try{if(typeof window.saveNow==='function')window.saveNow()}catch(e){}}
  function ui(){try{if(typeof window.ui==='function')window.ui()}catch(e){}}
  function msg(t){var e=document.getElementById('event-message');if(e){e.textContent=t;e.classList.add('show');setTimeout(function(){e.classList.remove('show')},2200)}}
  function ensure(){
    var s=st();if(!s)return;
    if(!s.equipment)s.equipment={weapon:'fists',armor:'tee'};
    if(!s.ownedWeapons)s.ownedWeapons=['fists'];
    if(!s.ownedArmor)s.ownedArmor=['tee'];
    if(s.ownedWeapons.indexOf('fists')<0)s.ownedWeapons.unshift('fists');
    if(s.ownedArmor.indexOf('tee')<0)s.ownedArmor.unshift('tee');
  }
  function find(id,kind){
    var arr=kind==='weapon'?WEAPONS:ARMORS;
    for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];
    return null;
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
    else if(owned)btn='<button type="button" class="eq-btn" data-eq="'+kind+'" data-id="'+item.id+'">Надеть</button>';
    else if(canBuy)btn='<button type="button" class="eq-btn" data-buy="'+kind+'" data-id="'+item.id+'">'+fmt(item.cost)+' 🍵</button>';
    else if(onlyDrop)btn='<span class="eq-badge eq-drop">Дроп</span>';
    else btn='<span class="eq-badge">—</span>';
    return '<div class="eq-card eq-r-'+item.rarity+(isOn?' eq-equipped':'')+'">'
      +'<div class="eq-icon">'+item.icon+'</div>'
      +'<div class="eq-body"><b>'+item.name+' '+rarityTag(item.rarity)+'</b><small>'+item.desc+'</small></div>'
      +btn+'</div>';
  }
  function openEquipment(){
    ensure();
    var s=st();if(!s)return;
    var w=s.equipment.weapon||'fists';
    var a=s.equipment.armor||'tee';
    var html='<div class="eq-window"><div class="eq-kicker">СНАРЯЖЕНИЕ</div><h2>Оружие и броня</h2>';
    html+='<p class="eq-sub">Чем круче вещь — тем выше урон в рейдах и бонусы</p>';
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
  window.__raidTryDrop=tryDrop;
  window.openEquipment=openEquipment;
  window.getEquipRaidBonus=function(){var s=st();if(!s||!s.equipment)return 0;var w=WEAPONS.find(function(x){return x.id===s.equipment.weapon});return w?Number(w.raid)||0:0};
  window.getEffectivePower=function(){var s=st();if(!s)return 1;var w=WEAPONS.find(function(x){return x.id===(s.equipment&&s.equipment.weapon)});var bonus=w?Number(w.power)||0:0;return Math.max(1,(Number(s.power)||1)+bonus)};
  window.getEffectiveCrit=function(){var s=st();if(!s)return 0.05;var a=ARMORS.find(function(x){return x.id===(s.equipment&&s.equipment.armor)});var bonus=a?Number(a.crit)||0:0;return Math.min(0.55,(Number(s.critChance)||0.05)+bonus)};
  console.log('[equipment-v2] icons v2.1');
})();
