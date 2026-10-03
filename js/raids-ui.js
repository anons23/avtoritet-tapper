/* raids-ui v4.74 — fighters, HP, 300 dmg TEST, portraits */
'use strict';
(function(){
  var REQS=[0,1500,5000,15000,50000];
  var FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,img:'./assets/raids/fighters/petrovich1.png',reward:{chifir:2000,points:150}},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,img:'./assets/raids/fighters/Vtirach1.png',reward:{chifir:2500,points:200}},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,img:'./assets/raids/fighters/mafioznik_hit_1.png',reward:{chifir:4000,points:300}},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,img:'./assets/raids/fighters/Mongol1.png',reward:{chifir:5500,points:400}},
    {id:'glaz',name:'ГЛАЗ',rank:2,hp:5000,img:'./assets/raids/fighters/Glaz1.png',reward:{chifir:7000,points:500}},
    {id:'krest',name:'КРЕСТ',rank:3,hp:6500,img:'./assets/raids/fighters/Crest%20(1).jpg',reward:{chifir:9000,points:700}},
    {id:'psikh',name:'ПСИХ АРКАША',rank:4,hp:8000,img:'./assets/raids/fighters/Psish1%20(1).jpg',reward:{chifir:12000,points:1000}}
  ];
  var RANK_NAMES=['Салага','Пацан','Блатной','Смотрящий','Авторитет'];
  var progress={};

  function $(id){ return document.getElementById(id); }
  function st(){ return typeof window.getGameState==='function' ? window.getGameState() : null; }
  function pts(){ var s=st(); return Number(s&&s.points)||0; }
  function pFor(f){
    if(!progress[f.id]) progress[f.id]={hp:f.hp,wins:0};
    return progress[f.id];
  }

  function openRaidMenu(){
    var overlay=$('modal-overlay');
    var content=$('modal-content');
    if(!overlay||!content)return;
    overlay.classList.remove('hidden');
    overlay.classList.add('show','raid-selection-fullscreen');
    overlay.classList.remove('raid-fullscreen');
    var p=pts();
    var list='';
    FIGHTERS.forEach(function(f,i){
      var need=REQS[f.rank]||0;
      var ok=p>=need;
      var pr=pFor(f);
      var hpShow=pr.hp>0?pr.hp:f.hp;
      list+='<button type="button" class="raid-fighter-card'+(ok?'':' locked')+'" data-i="'+i+'" '+(ok?'':'disabled')+'>'+
        '<div class="raid-card-portrait"><img src="'+f.img+'" alt="" onerror="this.style.opacity=0.3"></div>'+
        '<div class="raid-card-info"><div class="raid-card-name '+f.id+'">'+f.name+'</div>'+
        '<small>'+(ok?('HP '+hpShow+'/'+f.hp+(pr.wins?' · побед: '+pr.wins:'')):('🔒 '+RANK_NAMES[f.rank]+' ('+need+' ⭐)'))+'</small></div></button>';
    });
    content.innerHTML='<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай, пока не свалится.</p></div>'+
      '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div>'+
      '<div class="raid-fighter-list" id="raid-fighter-list">'+list+'</div></div>';
    var closeBtn=$('raid-menu-close');
    if(closeBtn) closeBtn.addEventListener('click',function(){
      overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
      overlay.classList.add('hidden');
    });
    content.querySelectorAll('.raid-fighter-card:not(.locked)').forEach(function(btn){
      btn.addEventListener('click',function(){ startFight(+btn.dataset.i); });
    });
  }

  function startFight(i){
    var f=FIGHTERS[i]; if(!f)return;
    var pr=pFor(f);
    if(pr.hp<=0) pr.hp=f.hp;
    var hp=pr.hp;
    var overlay=$('modal-overlay');
    var content=$('modal-content');
    if(!overlay||!content)return;
    overlay.classList.remove('raid-selection-fullscreen');
    overlay.classList.add('raid-fullscreen','show');
    overlay.classList.remove('hidden');
    var pct=hp/f.hp*100;
    content.innerHTML='<div class="raid-window"><div class="raid-scene" id="raid-scene">'+
      '<div class="raid-hud"><span class="raid-name '+f.id+'">'+f.name+'</span>'+
      '<div class="raid-hp'+(pct<=25?' low-hp':'')+'" id="raid-hp"><div class="raid-hp-track"><div id="raid-hp-fill" class="raid-hp-fill" style="width:'+pct+'%"></div></div>'+
      '<div id="raid-hp-text" class="raid-hp-text">'+hp+' / '+f.hp+'</div></div></div>'+
      '<div class="raid-fighter '+f.id+'" id="raid-fighter"><img id="raid-fighter-img" src="'+f.img+'" alt="'+f.name+'" style="max-width:75%;max-height:50vh;object-fit:contain" onerror="this.alt=\'👊\'"></div>'+
      '<div class="raid-controls"><button type="button" class="raid-next" id="raid-back">← К бойцам</button></div>'+
      '<div class="raid-note" id="raid-note"></div>'+
      '<div class="raid-result" id="raid-result"><div class="raid-result-card"><div id="raid-result-title"></div><div id="raid-result-text"></div><button type="button" id="raid-result-ok">Ок</button></div></div>'+
      '</div></div>';
    var back=$('raid-back');
    if(back) back.addEventListener('click',function(e){ e.stopPropagation(); pr.hp=hp; openRaidMenu(); });
    var scene=$('raid-scene');
    if(scene) scene.addEventListener('pointerdown',function(e){
      if(e.target.closest('#raid-back')||e.target.closest('.raid-result')||e.target.closest('.raid-controls')) return;
      if(hp<=0) return;
      if(typeof window.spendEnergyForRaid==='function'){
        if(!window.spendEnergyForRaid()){
          var n=$('raid-note'); if(n){ n.textContent='⚡ Нет энергии'; n.classList.add('show'); setTimeout(function(){n.classList.remove('show');},1500); }
          return;
        }
      }
      var dmg=300;
      var s=st();
      var crit=Math.random()<(Number(s&&s.critChance)||0.05);
      if(crit) dmg=Math.round(dmg*2.2);
      hp=Math.max(0,hp-dmg);
      pr.hp=hp;
      var fill=$('raid-hp-fill'), txt=$('raid-hp-text'), bar=$('raid-hp');
      var p2=hp/f.hp*100;
      if(fill) fill.style.width=p2+'%';
      if(txt) txt.textContent=hp+' / '+f.hp;
      if(bar) bar.classList.toggle('low-hp', p2<=25&&p2>0);
      var img=$('raid-fighter-img');
      if(img&&img.animate){ try{ img.animate([{transform:'scale(1)'},{transform:'scale(0.92)'},{transform:'scale(1)'}],{duration:140}); }catch(err){} }
      if(scene){ scene.classList.remove('shake','crit-flash'); void scene.offsetWidth; scene.classList.add(crit?'crit-flash':'shake'); }
      if(hp<=0){
        pr.wins=(pr.wins||0)+1;
        pr.hp=0;
        var rew=f.reward;
        var gs=st();
        if(gs){
          gs.chifir=(Number(gs.chifir)||0)+rew.chifir;
          gs.points=(Number(gs.points)||0)+rew.points;
          if(gs.tasks) gs.tasks.earned=(Number(gs.tasks.earned)||0)+rew.chifir;
        }
        if(typeof window.saveGame==='function') window.saveGame();
        if(typeof window.ui==='function') window.ui();
        var card=$('raid-result');
        if(card){
          var rt=$('raid-result-title'), rx=$('raid-result-text');
          if(rt) rt.textContent='ПОБЕДА!';
          if(rx) rx.textContent='+'+rew.chifir+' 🍵 · +'+rew.points+' ⭐';
          card.classList.add('show');
        }
        var ok=$('raid-result-ok');
        if(ok) ok.addEventListener('click',function(){ openRaidMenu(); });
      }
    });
  }

  function ensureBtn(){
    if($('raid-open-button')) return;
    var parent=$('game-container')||document.body;
    if(!parent) return;
    var btn=document.createElement('button');
    btn.id='raid-open-button';
    btn.type='button';
    btn.title='Рейды';
    btn.setAttribute('aria-label','Рейды');
    btn.innerHTML='<img src="./assets/raids/ui/raid-button.png" alt="Рейды" onerror="this.parentElement.textContent=\'⚔️\'">';
    btn.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); openRaidMenu(); });
    parent.appendChild(btn);
  }
  function boot(){ ensureBtn(); setTimeout(ensureBtn,500); setTimeout(ensureBtn,2000); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  window.openRaidMenu=openRaidMenu;
})();
