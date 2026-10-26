/* raids-ux-patch v1.4 — float dmg = power+equip (no test 300) */
'use strict';
(function(){
  function $(id){ return document.getElementById(id); }
  function st(){ return typeof window.getGameState==='function' ? window.getGameState() : null; }
  function energyLabel(){
    var s=st();
    if(!s) return '\u26a1 \u2014';
    return '\u26a1 '+Math.max(0,Number(s.energy)||0)+' / '+Math.max(0,Number(s.maxEnergy)||250);
  }
  function ensureEnergyHud(){
    var scene=$('raid-scene');
    if(!scene) return;
    var el=$('raid-energy-hud');
    if(!el){
      el=document.createElement('div');
      el.id='raid-energy-hud';
      el.className='raid-energy';
      scene.appendChild(el);
    }
    el.textContent=energyLabel();
  }
  function spawnFloatDmg(x,y,dmg,crit,phase){
    var scene=$('raid-scene'); if(!scene) return;
    var rect=scene.getBoundingClientRect();
    var el=document.createElement('div');
    el.className='raid-float-dmg phase-'+(phase||1)+(crit?' is-crit':'');
    el.textContent=(crit?'CRIT ':'')+'-'+dmg;
    el.style.left=(x-rect.left)+'px';
    el.style.top=(y-rect.top)+'px';
    scene.appendChild(el);
    setTimeout(function(){ try{el.remove();}catch(e){} },700);
  }
  function spawnBlood(x,y,phase){
    var scene=$('raid-scene'); if(!scene) return;
    var rect=scene.getBoundingClientRect();
    var lx=x-rect.left, ly=y-rect.top;
    var splat=document.createElement('div');
    splat.className='raid-blood-splat phase-'+phase;
    splat.style.left=lx+'px'; splat.style.top=ly+'px';
    scene.appendChild(splat);
    setTimeout(function(){ try{splat.remove();}catch(e){} },620);
    if(phase===1) return;
    var count=phase===3?10:8;
    for(var i=0;i<count;i++){
      var drop=document.createElement('div');
      drop.className='raid-blood raid-blood-spray phase-'+phase;
      var size=(phase===3?7:5)+Math.random()*(phase===3?12:9);
      drop.style.width=size+'px'; drop.style.height=(size*(.7+Math.random()*.55))+'px';
      drop.style.left=lx+'px'; drop.style.top=ly+'px';
      var ang=Math.random()*Math.PI*2, dist=(phase===3?38:30)+Math.random()*(phase===3?78:58);
      drop.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      drop.style.setProperty('--dy',(Math.sin(ang)*dist-10-Math.random()*16)+'px');
      scene.appendChild(drop);
      (function(d){ setTimeout(function(){ try{d.remove();}catch(e){} },720); })(drop);
    }
    if(phase>=2){
      for(var j=0;j<(phase===3?5:3);j++){
        var drip=document.createElement('div');
        drip.className='raid-blood-drip phase-'+phase;
        drip.style.left=(lx-6+Math.random()*12)+'px';
        drip.style.top=(ly+4+Math.random()*10)+'px';
        drip.style.setProperty('--fall',(28+Math.random()*40)+'px');
        scene.appendChild(drip);
        (function(d){ setTimeout(function(){ try{d.remove();}catch(e){} },900); })(drip);
      }
    }
  }
  var _hpLastPct=100;
  function syncHpAnim(){
    var fill=$('raid-hp-fill');
    var bar=$('raid-hp');
    if(!fill||!bar) return;
    var w=fill.style.width||'100%';
    var pct=parseFloat(w);
    if(!isFinite(pct)) pct=100;
    if(pct < _hpLastPct - 0.2){
      bar.classList.remove('is-hit');
      void bar.offsetWidth;
      bar.classList.add('is-hit');
      setTimeout(function(){ try{ bar.classList.remove('is-hit'); }catch(e){} }, 300);
    }
    _hpLastPct=pct;
    var ghost=bar.querySelector('.raid-hp-ghost');
    if(!ghost){
      ghost=document.createElement('div');
      ghost.className='raid-hp-ghost';
      var track=bar.querySelector('.raid-hp-track')||bar;
      track.insertBefore(ghost, fill);
    }
    if(ghost) ghost.style.width = _hpLastPct + '%';
  }
  function watchHpBar(){
    var fill=$('raid-hp-fill');
    if(!fill||fill.dataset.hpWatch==='1') return;
    fill.dataset.hpWatch='1';
    var bar=$('raid-hp');
    if(bar){
      var ghost=bar.querySelector('.raid-hp-ghost');
      if(!ghost){
        ghost=document.createElement('div');
        ghost.className='raid-hp-ghost';
        var track=bar.querySelector('.raid-hp-track')||bar;
        track.insertBefore(ghost, fill);
      }
    }
    if(ghost) ghost.style.width = _hpLastPct + '%';
    new MutationObserver(function(){ syncHpAnim(); }).observe(fill, { attributes: true, attributeFilter: ['style', 'class'] });
  }

  function bindFightUx(){
    var scene=$('raid-scene');
    var fighter=$('raid-fighter');
    if(!scene||!fighter||scene.dataset.uxBound==='1') return;
    scene.dataset.uxBound='1';
    scene.addEventListener('pointerdown', function(e){
      if(e.target.closest('#raid-back,.raid-result,.raid-controls,#raid-timeup')) return;
      if(!e.target.closest('#raid-fighter')){
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
      }
      var cx=e.clientX, cy=e.clientY;
      var phaseEl=$('raid-phase');
      var phaseText=phaseEl?phaseEl.textContent:'';
      var phase=/ФАЗА 3/.test(phaseText)?3:(/ФАЗА 2/.test(phaseText)?2:1);
      var bonus=0;
      try{ if(typeof window.getEquipRaidBonus==='function') bonus=Number(window.getEquipRaidBonus())||0; }catch(err){}
      var basePower=1;
      try{
        if(typeof window.getGameState==='function'){
          var gs=window.getGameState();
          basePower=Math.max(1, Number(gs&&gs.power)||1);
        }
        if(typeof window.getEffectivePower==='function') basePower=Math.max(1, Number(window.getEffectivePower())||basePower);
      }catch(err){}
      var dmg=(window.TEST_MODE===true)?300:Math.max(1, Math.round(basePower+bonus));
      var crit=false;
      try{
        var ch=0.05;
        if(typeof window.getEffectiveCrit==='function') ch=Number(window.getEffectiveCrit())||0.05;
        crit=window.TEST_MODE===true?false:(Math.random()<ch);
        if(crit) dmg=Math.round(dmg*2.2);
      }catch(err){}
      setTimeout(function(){
        spawnFloatDmg(cx,cy,dmg,crit,phase);
        spawnBlood(cx,cy,phase);
        ensureEnergyHud();
        setTimeout(syncHpAnim, 30);
        setTimeout(syncHpAnim, 120);
      },0);
    }, true);
    ensureEnergyHud();
    watchHpBar();
    if(!scene._energyTimer){
      scene._energyTimer=setInterval(function(){
        if(!$('raid-scene')){ clearInterval(scene._energyTimer); return; }
        ensureEnergyHud();
      },1000);
    }
  }
  var obs=new MutationObserver(function(){
    if($('raid-scene')&&$('raid-fighter')){ bindFightUx(); watchHpBar(); }
  });
  function start(){
    if(document.body) obs.observe(document.body,{childList:true,subtree:true});
    if($('raid-scene')) bindFightUx();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
