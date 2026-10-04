/* raids-ux-patch v1.0 — energy HUD, float dmg, blood, hit only on fighter */
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
    var left=document.querySelector('.raid-hud-left')||document.querySelector('.raid-hud');
    if(!left) return;
    var el=$('raid-energy');
    if(!el){
      el=document.createElement('div');
      el.id='raid-energy';
      el.className='raid-energy';
      left.appendChild(el);
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
  function spawnBlood(x,y){
    var scene=$('raid-scene'); if(!scene) return;
    var rect=scene.getBoundingClientRect();
    var lx=x-rect.left, ly=y-rect.top;
    var splat=document.createElement('div');
    splat.className='raid-blood-splat';
    splat.style.left=lx+'px'; splat.style.top=ly+'px';
    scene.appendChild(splat);
    setTimeout(function(){ try{splat.remove();}catch(e){} },520);
    for(var i=0;i<5;i++){
      var drop=document.createElement('div');
      drop.className='raid-blood';
      var size=6+Math.random()*10;
      drop.style.width=size+'px'; drop.style.height=size+'px';
      drop.style.left=lx+'px'; drop.style.top=ly+'px';
      var ang=Math.random()*Math.PI*2, dist=18+Math.random()*36;
      drop.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      drop.style.setProperty('--dy',(Math.sin(ang)*dist-12)+'px');
      scene.appendChild(drop);
      (function(d){ setTimeout(function(){ try{d.remove();}catch(e){} },560); })(drop);
    }
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
        spawnBlood(cx,cy);
        ensureEnergyHud();
      },0);
    }, true);
    ensureEnergyHud();
    if(!scene._energyTimer){
      scene._energyTimer=setInterval(function(){
        if(!$('raid-scene')){ clearInterval(scene._energyTimer); return; }
        ensureEnergyHud();
      },1000);
    }
  }
  var obs=new MutationObserver(function(){
    if($('raid-scene')&&$('raid-fighter')) bindFightUx();
  });
  function start(){
    if(document.body) obs.observe(document.body,{childList:true,subtree:true});
    if($('raid-scene')) bindFightUx();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
