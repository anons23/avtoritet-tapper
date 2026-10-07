/* raids-ux-patch v1.2 — phase blood progression + rare screen blood */
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
  function spawnFloatDmg(x,y,dmg,crit){
    var scene=$('raid-scene'); if(!scene) return;
    var rect=scene.getBoundingClientRect();
    var el=document.createElement('div');
    el.className='raid-float-dmg'+(crit?' is-crit':'');
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

    /* Phase 1: only the compact blood mark at the tap point. */
    if(phase===1) return;

    /* Phase 2/3: stronger spray radiating from the actual tap. */
    var count=phase===3?8:6;
    for(var i=0;i<count;i++){
      var drop=document.createElement('div');
      drop.className='raid-blood raid-blood-spray phase-'+phase;
      var size=(phase===3?4:3)+Math.random()*(phase===3?8:6);
      drop.style.width=size+'px'; drop.style.height=(size*(.7+Math.random()*.55))+'px';
      drop.style.left=lx+'px'; drop.style.top=ly+'px';
      var ang=Math.random()*Math.PI*2, dist=(phase===3?28:22)+Math.random()*(phase===3?58:42);
      drop.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      drop.style.setProperty('--dy',(Math.sin(ang)*dist-10-Math.random()*16)+'px');
      scene.appendChild(drop);
      (function(d){ setTimeout(function(){ try{d.remove();}catch(e){} },720); })(drop);
    }

    /* Phase 3: rare blood hits the "camera" and then a drop slowly runs down. */
    if(phase===3 && Math.random()<0.16){
      spawnScreenBlood(scene,lx,ly);
    }
  }

  function spawnScreenBlood(scene,lx,ly){
    var stain=document.createElement('div');
    stain.className='raid-screen-blood';
    var w=22+Math.random()*30;
    var h=18+Math.random()*28;
    var sx=Math.max(8,Math.min(scene.clientWidth-w-8,lx+(Math.random()-.5)*90));
    var sy=Math.max(12,Math.min(scene.clientHeight-h-12,ly+(Math.random()-.5)*70));
    stain.style.left=sx+'px';
    stain.style.top=sy+'px';
    stain.style.setProperty('--drip-len',(55+Math.random()*110)+'px');
    stain.style.setProperty('--drip-x',((Math.random()-.5)*18)+'px');
    scene.appendChild(stain);

    var spots=3+Math.floor(Math.random()*4);
    for(var i=0;i<spots;i++){
      var dot=document.createElement('i');
      dot.className='raid-screen-blood-dot';
      dot.style.left=(sx+(Math.random()*w))+'px';
      dot.style.top=(sy+(Math.random()*h*.8))+'px';
      dot.style.setProperty('--dot-size',(3+Math.random()*8)+'px');
      dot.style.setProperty('--dot-dx',((Math.random()-.5)*22)+'px');
      dot.style.setProperty('--dot-dy',((Math.random()-.5)*18)+'px');
      scene.appendChild(dot);
      (function(d){ setTimeout(function(){ try{d.remove();}catch(e){} },3000); })(dot);
    }
    setTimeout(function(){ try{stain.remove();}catch(e){} },3600);
  }

  var _hpLastPct = 100;
  function ensureHpGhost(){
    var track = document.querySelector('#raid-hp .raid-hp-track, .raid-hp .raid-hp-track');
    if(!track) return null;
    var ghost = track.querySelector('.raid-hp-ghost');
    if(!ghost){
      ghost = document.createElement('div');
      ghost.className = 'raid-hp-ghost';
      track.insertBefore(ghost, track.firstChild);
    }
    return ghost;
  }
  function pulseHpBar(){
    var bar = $('raid-hp') || document.querySelector('.raid-hp');
    if(!bar) return;
    bar.classList.remove('is-hit');
    void bar.offsetWidth;
    bar.classList.add('is-hit');
    setTimeout(function(){ try{ bar.classList.remove('is-hit'); }catch(e){} }, 300);
  }
  function syncHpAnim(){
    var fill = $('raid-hp-fill');
    var bar = $('raid-hp') || document.querySelector('.raid-hp');
    if(!fill || !bar) return;
    var ghost = ensureHpGhost();
    var w = fill.style.width || '';
    var pct = parseFloat(w);
    if(!Number.isFinite(pct)){
      var cs = window.getComputedStyle(fill);
      pct = parseFloat(cs.width);
      var parentW = fill.parentElement ? fill.parentElement.clientWidth : 0;
      if(parentW > 0 && Number.isFinite(pct)) pct = (pct / parentW) * 100;
      else return;
    }
    if(pct < _hpLastPct - 0.2){
      if(ghost){
        ghost.style.width = _hpLastPct + '%';
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            ghost.style.width = pct + '%';
          });
        });
      }
      pulseHpBar();
    } else if(pct > _hpLastPct + 0.5 && ghost){
      ghost.style.width = pct + '%';
    }
    _hpLastPct = pct;
    bar.classList.toggle('low-hp', pct <= 25);
  }
  function watchHpBar(){
    var fill = $('raid-hp-fill');
    if(!fill || fill.dataset.hpAnim === '1') return;
    fill.dataset.hpAnim = '1';
    _hpLastPct = parseFloat(fill.style.width) || 100;
    ensureHpGhost();
    var ghost = ensureHpGhost();
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
      var dmg=300+bonus;
      var crit=false;
      try{
        var ch=0.05;
        if(typeof window.getEffectiveCrit==='function') ch=Number(window.getEffectiveCrit())||0.05;
        crit=Math.random()<ch;
        if(crit) dmg=Math.round(dmg*2.2);
      }catch(err){}
      setTimeout(function(){
        spawnFloatDmg(cx,cy,dmg,crit);
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
