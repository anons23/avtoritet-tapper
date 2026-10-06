/* raids-ui v4.81 — English asset paths for psikh/krest */
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
    petrovich:'./assets/raids/fighters/petrovich1.webp',
    vtirach:'./assets/raids/fighters/Vtirach1.webp',
    mafioznik:'./assets/raids/fighters/mafioznik_hit_1.webp',
    mongol:'./assets/raids/fighters/Mongol1.webp',
    glaz:'./assets/raids/fighters/Glaz1.webp',
    krest:'./assets/raids/fighters/krest1.webp',
    psikh:'./assets/raids/fighters/psikh1.webp'
  };
  var IDLE={
    petrovich:'./assets/raids/fighters/petrovich.webm',
    vtirach:'./assets/raids/fighters/Vtirach.webm',
    mafioznik:'./assets/raids/fighters/mafioznik_idle.webm',
    mongol:'./assets/raids/fighters/Mongol.webm',
    glaz:'./assets/raids/fighters/Glaz.webm',
    krest:'./assets/raids/fighters/krest.webm',
    psikh:'./assets/raids/fighters/psikh.webm'
  };
  var HITS={
    petrovich:['./assets/raids/fighters/petrovich1.webp','./assets/raids/fighters/petrovich2.webp','./assets/raids/fighters/petrovich3.webp','./assets/raids/fighters/petrovich4.webp'],
    vtirach:['./assets/raids/fighters/Vtirach1.webp','./assets/raids/fighters/Vtirach2.webp','./assets/raids/fighters/Vtirach3.webp','./assets/raids/fighters/Vtirach4.webp'],
    mafioznik:['./assets/raids/fighters/mafioznik_hit_1.webp','./assets/raids/fighters/mafioznik_hit_2.webp','./assets/raids/fighters/mafioznik_hit_3.webp','./assets/raids/fighters/mafioznik_hit_4.webp'],
    mongol:['./assets/raids/fighters/Mongol1.webp','./assets/raids/fighters/Mongol2.webp','./assets/raids/fighters/Mongol3.webp','./assets/raids/fighters/Mongol4.webp'],
    glaz:['./assets/raids/fighters/Glaz1.webp','./assets/raids/fighters/Glaz2.webp','./assets/raids/fighters/Glaz3.webp','./assets/raids/fighters/Glaz4.webp'],
    krest:['./assets/raids/fighters/krest1.webp','./assets/raids/fighters/krest2.webp','./assets/raids/fighters/krest3.webp','./assets/raids/fighters/krest4.webp','./assets/raids/fighters/krest5.webp'],
    psikh:['./assets/raids/fighters/psikh1.webp','./assets/raids/fighters/psikh2.webp','./assets/raids/fighters/psikh3.webp','./assets/raids/fighters/psikh4.webp','./assets/raids/fighters/psikh5.webp']
  };
  var progress={}, idleTimer=0, lastHit=-1, raidActive=false, menuOpenedAt=0;

  function raidMeta(){
    var s=st();
    if(!s) return {wins:0,bugorLevel:1};
    if(!s.raidStats) s.raidStats={wins:0,bugorLevel:1};
    s.raidStats.wins=Math.max(0,Number(s.raidStats.wins)||0);
    s.raidStats.bugorLevel=Math.max(1,Number(s.raidStats.bugorLevel)||1);
    var w=s.raidStats.wins;
    var lvl=w>=25?5:w>=15?4:w>=8?3:w>=3?2:1;
    if(lvl>s.raidStats.bugorLevel) s.raidStats.bugorLevel=lvl;
    return s.raidStats;
  }
  function phaseFor(hp,maxHp){var ratio=maxHp>0?hp/maxHp:1;return ratio<=.3333?3:(ratio<=.6666?2:1);}
  function phaseLabel(phase){return phase===3?'ФАЗА 3 · ЯРОСТЬ':(phase===2?'ФАЗА 2 · НАПОР':'ФАЗА 1 · РАЗВЕДКА');}
  function bugorLabel(level){return 'Бугор '+['I','II','III','IV','V'][Math.max(0,Math.min(4,level-1))];}

  function $(id){return document.getElementById(id);}
  function st(){return typeof window.getGameState==='function'?window.getGameState():null;}
  function pts(){var s=st();return Number(s&&s.points)||0;}
  function pFor(f){if(!progress[f.id])progress[f.id]={hp:f.hp,wins:0};return progress[f.id];}
  function unlocked(f){return pts()>=(REQS[f.rank]||0);}

  function raidMusicOn(){
    try{
      if(window.GameMusic){
        if(typeof window.GameMusic.unlock==='function') window.GameMusic.unlock();
        if(typeof window.GameMusic.playRaid==='function') window.GameMusic.playRaid();
      }
    }catch(e){}
  }
  function mainMusicOn(){
    try{
      if(window.GameMusic && typeof window.GameMusic.playMain==='function') window.GameMusic.playMain();
    }catch(e){}
  }

  function stopIdle(){
    var v=$('raid-idle-video');
    if(v){try{v.pause();}catch(e){} v.removeAttribute('src'); try{v.load();}catch(e){}}
    if(idleTimer){clearTimeout(idleTimer);idleTimer=0;}
  }

  function isIOSLike(){
    var ua=navigator.userAgent||'';
    if(/iPad|iPhone|iPod/.test(ua)) return true;
    if(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1) return true;
    return false;
  }
  function canPlayWebm(){
    if(isIOSLike()) return false;
    try{
      var v=document.createElement('video');
      var t=v.canPlayType('video/webm; codecs="vp9"')||v.canPlayType('video/webm; codecs="vp8"')||v.canPlayType('video/webm');
      return !!t && t!=='';
    }catch(e){ return false; }
  }
  function playIdle(f){
    stopIdle();
    var img=$('raid-fighter-img');
    var media=$('raid-fighter-media'); if(!media) return;
    if(!canPlayWebm() || !IDLE[f.id]){
      if(img){ img.style.opacity='1'; img.style.display='block'; }
      return;
    }
    var src=IDLE[f.id];
    var v=$('raid-idle-video');
    if(!v){
      v=document.createElement('video');
      v.id='raid-idle-video'; v.muted=true; v.loop=true; v.playsInline=true;
      v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
      v.setAttribute('preload','auto');
      v.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;z-index:2;pointer-events:none;background:transparent';
      v.addEventListener('error',function(){
        try{v.style.display='none';}catch(e){}
        if(img){ img.style.opacity='1'; img.style.display='block'; }
      });
      media.appendChild(v);
    }
    v.src=src; v.style.display='block';
    if(img) img.style.opacity='0';
    var p=v.play();
    if(p&&p.catch) p.catch(function(){
      if(img){ img.style.opacity='1'; }
      try{v.style.display='none';}catch(e){}
    });
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
    if(img){img.style.opacity='1'; img.style.display='block'; img.src=frames[idx];}
    if(media){media.classList.remove('hit-pulse'); void media.offsetWidth; media.classList.add('hit-pulse');}
    if(idleTimer) clearTimeout(idleTimer);
    idleTimer=setTimeout(function(){
      if(canPlayWebm() && IDLE[f.id] && v){
        v.style.display='block';
        v.play().catch(function(){});
        if(img) img.style.opacity='0';
      } else if(img){
        img.style.opacity='1';
      }
      if(media) media.classList.remove('hit-pulse');
    },280);
  }

  function openRaidMenu(){
    var overlay=$('modal-overlay'), content=$('modal-content');
    if(!overlay||!content) return;
    stopIdle(); raidActive=false;
    menuOpenedAt=Date.now();
    raidMusicOn();
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
    var meta=raidMeta();
    content.innerHTML='<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай, пока не свалится.</p><div class="raid-progression"><b>'+bugorLabel(meta.bugorLevel)+'</b> · побед: '+meta.wins+' · следующий уровень: '+(meta.bugorLevel<5?([3,8,15,25][meta.bugorLevel-1]||25):'МАКС')+'</div></div>'+
      '<div class="raid-select-actions"><button type="button" class="raid-music-mute" aria-label="Музыка">🔊</button>'+
      '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div></div>'+
      '<div class="raid-fighter-list">'+list+'</div></div>';
    var cl=$('raid-menu-close');
    if(cl) cl.addEventListener('click',function(){
      overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
      overlay.classList.add('hidden');
      stopIdle();
      mainMusicOn();
    });
    content.querySelectorAll('.raid-fighter-card:not(.locked)').forEach(function(btn){
      btn.addEventListener('click',function(){ if(Date.now()-menuOpenedAt<400) return; startRaid(+btn.dataset.i); });
    });
    try{
      var mb=content.querySelector('.raid-music-mute');
      if(mb && window.GameMusic && typeof window.GameMusic.bindRaidMuteBtn==='function'){
        window.GameMusic.bindRaidMuteBtn(mb);
      }
    }catch(e){}
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
    raidMusicOn();
    var pct=hp/f.hp*100;
    var phase=phaseFor(hp,f.hp);
    var meta=raidMeta();
    var still=PORTRAIT[f.id];
    var hasIdle=!!IDLE[f.id] && canPlayWebm();
    content.innerHTML='<div class="raid-window"><div class="raid-scene '+f.scene+'" id="raid-scene">'+
      '<div class="raid-hud"><div class="raid-name '+f.id+'">'+f.name+'</div>'+
      '<div class="raid-hp'+(pct<=25?' low-hp':'')+'" id="raid-hp"><div class="raid-hp-track"><div id="raid-hp-fill" class="raid-hp-fill" style="width:'+pct+'%"></div></div>'+
      '<div id="raid-hp-text" class="raid-hp-text">'+hp+' / '+f.hp+'</div><div id="raid-phase" class="raid-phase">'+phaseLabel(phase)+'</div></div></div>'+
      '<div class="raid-fighter '+f.id+'" id="raid-fighter">'+
      '<div class="raid-fighter-media" id="raid-fighter-media">'+
      '<img id="raid-fighter-img" src="'+still+'" alt="'+f.name+'" style="'+(hasIdle?'opacity:0':'')+'">'+
      '</div></div>'+
      '<div class="raid-controls"><button type="button" class="raid-next" id="raid-back">← К бойцам</button></div>'+
      '<div class="raid-note" id="raid-note"></div>'+
      '<div class="raid-result" id="raid-result"><div class="raid-result-card"><div id="raid-result-title"></div><div id="raid-result-text"></div><div id="raid-result-drop" class="raid-result-drop"></div><button type="button" id="raid-result-ok">Ок</button></div></div>'+
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
      var s=st();
      var bonus=0;
      try{ if(typeof window.getEquipRaidBonus==='function') bonus=Number(window.getEquipRaidBonus())||0; }catch(err){}
      var metaNow=raidMeta();
      var currentPhase=phaseFor(hp,f.hp);
      var phaseMultiplier=currentPhase===3?0.72:(currentPhase===2?0.86:1);
      var bugorMultiplier=1+Math.max(0,metaNow.bugorLevel-1)*0.04;
      var dmg=Math.max(1,Math.round((300+bonus)*phaseMultiplier/bugorMultiplier));
      var critChance=0.05;
      try{ if(typeof window.getEffectiveCrit==='function') critChance=Number(window.getEffectiveCrit())||0.05; }
      catch(err){ critChance=Number(s&&s.critChance)||0.05; }
      var crit=Math.random()<critChance;
      if(crit) dmg=Math.round(dmg*2.2);
      hp=Math.max(0,hp-dmg); pr.hp=hp;
      var fill=$('raid-hp-fill'), txt=$('raid-hp-text'), bar=$('raid-hp');
      var p2=hp/f.hp*100;
      var newPhase=phaseFor(hp,f.hp);
      if(fill) fill.style.width=p2+'%';
      var phaseEl=$('raid-phase'); if(phaseEl) phaseEl.textContent=phaseLabel(newPhase);
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
        var winMeta=raidMeta();
        var drop=null;
        try{ if(typeof window.rollRaidDrops==='function') drop=window.rollRaidDrops(f.id); }catch(dropErr){ console.warn('[raids] drop error',dropErr); }
        var rewardMultiplier=1+Math.max(0,winMeta.bugorLevel-1)*0.05;
        rew={chifir:Math.round(rew.chifir*rewardMultiplier),points:Math.round(rew.points*rewardMultiplier)};
        winMeta.wins=(winMeta.wins||0)+1;
        if(winMeta.wins>=25) winMeta.bugorLevel=5;
        else if(winMeta.wins>=15) winMeta.bugorLevel=Math.max(winMeta.bugorLevel,4);
        else if(winMeta.wins>=8) winMeta.bugorLevel=Math.max(winMeta.bugorLevel,3);
        else if(winMeta.wins>=3) winMeta.bugorLevel=Math.max(winMeta.bugorLevel,2);
        var gs=st();
        if(gs){
          gs.chifir=(Number(gs.chifir)||0)+rew.chifir;
          gs.points=(Number(gs.points)||0)+rew.points;
          if(gs.tasks) gs.tasks.earned=(Number(gs.tasks.earned)||0)+rew.chifir;
        }
        if(typeof window.saveGame==='function') window.saveGame();
        if(typeof window.ui==='function') window.ui();
        try{ if(typeof window.__dailyNoteRaidWin==='function') window.__dailyNoteRaidWin(); }catch(e){}
        stopIdle();
        var card=$('raid-result');
        if(card){
          var rt=$('raid-result-title'), rx=$('raid-result-text');
          if(rt) rt.textContent='ПОБЕДА!';
          if(rx) rx.textContent='+'+rew.chifir+' 🍵 · +'+rew.points+' ⭐'+(first?' (первый раз)':'')+' · '+bugorLabel(winMeta.bugorLevel);
          var dropEl=$('raid-result-drop');
          if(dropEl){
            if(drop&&drop.length){
              dropEl.innerHTML='<b>🎁 ДРОП</b><br>'+drop.map(function(it){return '<span class="raid-drop-item">'+(it.icon||'')+' '+it.name+' · '+(it.rarity==='authority'?'Авторитетное':it.rarity==='extreme'?'Крайне редкое':it.rarity==='rare'?'Редкое':'Обычное')+'</span>';}).join('<br>');
            }else{
              dropEl.innerHTML='<b>🎁 ДРОП</b><br><span class="raid-drop-empty">В этот раз ничего нового не выпало.</span>';
            }
          }
          card.classList.add('show');
        }
        var ok=$('raid-result-ok');
        if(ok) ok.addEventListener('click',function(){ openRaidMenu(); });
      }
    });
  }

  function ensureBtn(){
    var parent=$('game-container')||document.body; if(!parent) return;
    var btn=$('raid-open-button');
    if(!btn){
      btn=document.createElement('button');
      btn.id='raid-open-button'; btn.type='button'; btn.title='Рейды';
      btn.setAttribute('aria-label','Рейды');
      btn.innerHTML='<span class="raid-btn-icon"><img src="./assets/raids/ui/raid-button.webp" alt="" onerror="this.parentElement.textContent=\'⚔️\'"></span><span class="raid-btn-label">Рейды</span>';
      btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openRaidMenu();});
      parent.appendChild(btn);
    } else if(!btn.querySelector('.raid-btn-label')){
      var img=btn.querySelector('img');
      var src=img?img.getAttribute('src'):'./assets/raids/ui/raid-button.webp';
      btn.innerHTML='<span class="raid-btn-icon"><img src="'+src+'" alt=""></span><span class="raid-btn-label">Рейды</span>';
    }
  }
  function boot(){ensureBtn();setTimeout(ensureBtn,500);setTimeout(ensureBtn,2000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  window.openRaidMenu=openRaidMenu;
})();
