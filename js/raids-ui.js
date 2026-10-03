/* raids-ui v4.76 — menu, backgrounds, hit frames, idle video, layout */
'use strict';
(function(){
  var REQS=[0,1500,5000,15000,50000];
  var RANK_NAMES=['Салага','Пацан','Блатной','Смотрящий','Авторитет'];
  var FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,scene:'talk',first:{chifir:2000,points:150},repeat:{chifir:500,points:40}},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,scene:'talk',first:{chifir:2500,points:200},repeat:{chifir:625,points:50}},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,scene:'fight',first:{chifir:4000,points:300},repeat:{chifir:1000,points:75}},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,scene:'fight',first:{chifir:5500,points:400},repeat:{chifir:1375,points:100}},
    {id:'glaz',name:'ГЛАЗ',rank:2,hp:5000,scene:'glaz',first:{chifir:7000,points:500},repeat:{chifir:1750,points:125}},
    {id:'krest',name:'КРЕСТ',rank:3,hp:6500,scene:'krest',first:{chifir:9000,points:700},repeat:{chifir:2250,points:175}},
    {id:'psikh',name:'ПСИХ АРКАША',rank:4,hp:8000,scene:'psikh',first:{chifir:12000,points:1000},repeat:{chifir:3000,points:250}}
  ];
  var PORTRAIT={
    petrovich:'./assets/raids/fighters/petrovich1.png',
    vtirach:'./assets/raids/fighters/Vtirach1.png',
    mafioznik:'./assets/raids/fighters/mafioznik_hit_1.png',
    mongol:'./assets/raids/fighters/Mongol1.png',
    glaz:'./assets/raids/fighters/Glaz1.png',
    krest:'./assets/raids/fighters/Crest%20(1).jpg',
    psikh:'./assets/raids/fighters/Psish1%20(1).jpg'
  };
  var IDLE={
    petrovich:'./assets/raids/fighters/petrovich.webm',
    vtirach:'./assets/raids/fighters/Vtirach.webm',
    mafioznik:'./assets/raids/fighters/mafioznik_idle.webm',
    mongol:'./assets/raids/fighters/Mongol.webm',
    glaz:'./assets/raids/fighters/Glaz.webm',
    krest:'./assets/raids/fighters/krest.webm',
    psikh:'./assets/raids/fighters/Psish.webm'
  };
  var HITS={
    petrovich:['./assets/raids/fighters/petrovich1.png','./assets/raids/fighters/petrovich2.png','./assets/raids/fighters/petrovich3.png','./assets/raids/fighters/petrovich4.png'],
    vtirach:['./assets/raids/fighters/Vtirach1.png','./assets/raids/fighters/Vtirach2.png','./assets/raids/fighters/Vtirach3.png','./assets/raids/fighters/Vtirach4.png'],
    mafioznik:['./assets/raids/fighters/mafioznik_hit_1.png','./assets/raids/fighters/mafioznik_hit_2.png','./assets/raids/fighters/mafioznik_hit_3.png','./assets/raids/fighters/mafioznik_hit_4.png'],
    mongol:['./assets/raids/fighters/Mongol1.png','./assets/raids/fighters/Mongol2.png','./assets/raids/fighters/Mongol3.png','./assets/raids/fighters/Mongol4.png'],
    glaz:['./assets/raids/fighters/Glaz1.png','./assets/raids/fighters/Glaz2.png','./assets/raids/fighters/Glaz3.png','./assets/raids/fighters/Glaz4.png'],
    krest:['./assets/raids/fighters/Crest%20(1).jpg','./assets/raids/fighters/Crest%20(2).jpg','./assets/raids/fighters/Crest%20(3).jpg','./assets/raids/fighters/Crest%20(4).jpg','./assets/raids/fighters/Crest%20(5).jpg'],
    psikh:['./assets/raids/fighters/Psish1%20(1).jpg','./assets/raids/fighters/Psish1%20(2).jpg','./assets/raids/fighters/Psish1%20(3).jpg','./assets/raids/fighters/Psish1%20(4).jpg','./assets/raids/fighters/Psish1%20(5).jpg']
  };
  var progress={}, idleTimer=0, lastHit=-1, raidActive=false;

  function $(id){return document.getElementById(id);}
  function st(){return typeof window.getGameState==='function'?window.getGameState():null;}
  function pts(){var s=st();return Number(s&&s.points)||0;}
  function pFor(f){if(!progress[f.id])progress[f.id]={hp:f.hp,wins:0};return progress[f.id];}
  function unlocked(f){return pts()>=(REQS[f.rank]||0);}

  function stopIdle(){
    var v=$('raid-idle-video');
    if(v){try{v.pause();}catch(e){} v.removeAttribute('src'); try{v.load();}catch(e){}}
    if(idleTimer){clearTimeout(idleTimer);idleTimer=0;}
  }

  function playIdle(f){
    stopIdle();
    var src=IDLE[f.id]; if(!src) return;
    var media=$('raid-fighter-media'); if(!media) return;
    var v=$('raid-idle-video');
    if(!v){
      v=document.createElement('video');
      v.id='raid-idle-video'; v.muted=true; v.loop=true; v.playsInline=true;
      v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
      v.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;z-index:2;pointer-events:none;background:transparent';
      media.appendChild(v);
    }
    v.src=src; v.style.display='block';
    var img=$('raid-fighter-img'); if(img) img.style.opacity='0';
    v.play().catch(function(){});
  }

  function showHit(f){
    var frames=HITS[f.id]; if(!frames||!frames.length) return;
    var idx=Math.floor(Math.random()*frames.length);
    if(frames.length>1&&idx===lastHit) idx=(idx+1)%frames.length;
    lastHit=idx;
    var img=$('raid-fighter-img');
    var v=$('raid-idle-video');
    var media=$('raid-fighter-media');
    if(v){try{v.pause();}catch(e){} v.style.display='none';}
    if(img){img.style.opacity='1'; img.src=frames[idx];}
    if(media){media.classList.remove('hit-pulse'); void media.offsetWidth; media.classList.add('hit-pulse');}
    if(idleTimer) clearTimeout(idleTimer);
    idleTimer=setTimeout(function(){
      if(IDLE[f.id]){
        if(v){v.style.display='block'; v.play().catch(function(){});}
        if(img) img.style.opacity='0';
      }
      if(media) media.classList.remove('hit-pulse');
    },280);
  }

  function openRaidMenu(){
    var overlay=$('modal-overlay'), content=$('modal-content');
    if(!overlay||!content) return;
    stopIdle(); raidActive=false;
    overlay.classList.remove('hidden','raid-fullscreen');
    overlay.classList.add('show','raid-selection-fullscreen');
    var list='';
    FIGHTERS.forEach(function(f,i){
      var ok=unlocked(f), pr=pFor(f), need=REQS[f.rank]||0;
      var hpShow=pr.hp>0?pr.hp:f.hp;
      list+='<button type="button" class="raid-fighter-card'+(ok?'':' locked')+'" data-i="'+i+'" '+(ok?'':'disabled')+'>'+
        '<div class="raid-card-portrait"><img src="'+PORTRAIT[f.id]+'" alt="" onerror="this.style.opacity=.3"></div>'+
        '<div class="raid-card-info"><div class="raid-card-name '+f.id+'">'+f.name+'</div>'+
        '<small>'+(ok?('HP '+hpShow+'/'+f.hp+(pr.wins?' · побед: '+pr.wins:'')):('🔒 '+RANK_NAMES[f.rank]+' ('+need+' ⭐)'))+'</small></div></button>';
    });
    content.innerHTML='<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай, пока не свалится.</p></div>'+
      '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div>'+
      '<div class="raid-fighter-list">'+list+'</div></div>';
    var cl=$('raid-menu-close');
    if(cl) cl.addEventListener('click',function(){
      overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
      overlay.classList.add('hidden');
      stopIdle();
    });
    content.querySelectorAll('.raid-fighter-card:not(.locked)').forEach(function(btn){
      btn.addEventListener('click',function(){ startRaid(+btn.dataset.i); });
    });
  }

  function startRaid(i){
    var f=FIGHTERS[i]; if(!f||!unlocked(f)) return;
    var pr=pFor(f);
    if(pr.hp<=0) pr.hp=f.hp;
    var hp=pr.hp;
    raidActive=true;
    var overlay=$('modal-overlay'), content=$('modal-content');
    if(!overlay||!content) return;
    overlay.classList.remove('raid-selection-fullscreen','hidden');
    overlay.classList.add('show','raid-fullscreen');
    var pct=hp/f.hp*100;
    var still=PORTRAIT[f.id];
    var hasIdle=!!IDLE[f.id];
    content.innerHTML='<div class="raid-window"><div class="raid-scene '+f.scene+'" id="raid-scene">'+
      '<div class="raid-hud"><div class="raid-name '+f.id+'">'+f.name+'</div>'+
      '<div class="raid-hp'+(pct<=25?' low-hp':'')+'" id="raid-hp"><div class="raid-hp-track"><div id="raid-hp-fill" class="raid-hp-fill" style="width:'+pct+'%"></div></div>'+
      '<div id="raid-hp-text" class="raid-hp-text">'+hp+' / '+f.hp+'</div></div></div>'+
      '<div class="raid-fighter '+f.id+'" id="raid-fighter">'+
      '<div class="raid-fighter-media" id="raid-fighter-media">'+
      '<img id="raid-fighter-img" src="'+still+'" alt="'+f.name+'" style="'+(hasIdle?'opacity:0':'')+'">'+
      '</div></div>'+
      '<div class="raid-controls"><button type="button" class="raid-next" id="raid-back">← К бойцам</button></div>'+
      '<div class="raid-note" id="raid-note"></div>'+
      '<div class="raid-result" id="raid-result"><div class="raid-result-card"><div id="raid-result-title"></div><div id="raid-result-text"></div><button type="button" id="raid-result-ok">Ок</button></div></div>'+
      '</div></div>';
    if(hasIdle) playIdle(f);
    (HITS[f.id]||[]).forEach(function(src){ var im=new Image(); im.src=src; });
    var back=$('raid-back');
    if(back) back.addEventListener('click',function(e){ e.stopPropagation(); pr.hp=hp; openRaidMenu(); });
    var scene=$('raid-scene');
    if(scene) scene.addEventListener('pointerdown',function(e){
      if(!raidActive) return;
      if(e.target.closest('#raid-back,.raid-result,.raid-controls')) return;
      if(hp<=0) return;
      if(typeof window.spendEnergyForRaid==='function' && !window.spendEnergyForRaid()){
        var n=$('raid-note'); if(n){n.textContent='⚡ Нет энергии';n.classList.add('show');setTimeout(function(){n.classList.remove('show');},1500);}
        return;
      }
      var dmg=300;
      var s=st();
      var crit=Math.random()<(Number(s&&s.critChance)||0.05);
      if(crit) dmg=Math.round(dmg*2.2);
      hp=Math.max(0,hp-dmg); pr.hp=hp;
      var fill=$('raid-hp-fill'), txt=$('raid-hp-text'), bar=$('raid-hp');
      var p2=hp/f.hp*100;
      if(fill) fill.style.width=p2+'%';
      if(txt) txt.textContent=hp+' / '+f.hp;
      if(bar) bar.classList.toggle('low-hp', p2<=25&&p2>0);
      showHit(f);
      scene.classList.remove('shake','crit-flash'); void scene.offsetWidth;
      scene.classList.add(crit?'crit-flash':'shake');
      if(hp<=0){
        raidActive=false;
        pr.wins=(pr.wins||0)+1; pr.hp=0;
        var first=pr.wins===1;
        var rew=first?f.first:f.repeat;
        var gs=st();
        if(gs){
          gs.chifir=(Number(gs.chifir)||0)+rew.chifir;
          gs.points=(Number(gs.points)||0)+rew.points;
          if(gs.tasks) gs.tasks.earned=(Number(gs.tasks.earned)||0)+rew.chifir;
        }
        if(typeof window.saveGame==='function') window.saveGame();
        if(typeof window.ui==='function') window.ui();
        stopIdle();
        var card=$('raid-result');
        if(card){
          var rt=$('raid-result-title'), rx=$('raid-result-text');
          if(rt) rt.textContent='ПОБЕДА!';
          if(rx) rx.textContent='+'+rew.chifir+' 🍵 · +'+rew.points+' ⭐'+(first?' (первый раз)':'');
          card.classList.add('show');
        }
        var ok=$('raid-result-ok');
        if(ok) ok.addEventListener('click',function(){ openRaidMenu(); });
      }
    });
  }

  function ensureBtn(){
    if($('raid-open-button')) return;
    var parent=$('game-container')||document.body; if(!parent) return;
    var btn=document.createElement('button');
    btn.id='raid-open-button'; btn.type='button'; btn.title='Рейды';
    btn.setAttribute('aria-label','Рейды');
    btn.innerHTML='<img src="./assets/raids/ui/raid-button.png" alt="Рейды" onerror="this.parentElement.textContent=\'⚔️\'">';
    btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openRaidMenu();});
    parent.appendChild(btn);
  }
  function boot(){ensureBtn();setTimeout(ensureBtn,500);setTimeout(ensureBtn,2000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  window.openRaidMenu=openRaidMenu;
})();
