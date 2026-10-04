/* polish-phase2 v1.0 — toggle energy low/critical classes */
'use strict';
(function(){
  function $(id){ return document.getElementById(id); }
  function refresh(){
    var wrap = document.querySelector('#top-bar .resource.energy') || document.querySelector('.resource.energy');
    if(!wrap) return;
    var eEl = $('energy');
    var mEl = $('max-energy');
    var energy = eEl ? parseInt(String(eEl.textContent||'0').replace(/\s/g,''),10) : NaN;
    var max = mEl ? parseInt(String(mEl.textContent||'250').replace(/\s/g,''),10) : 250;
    if(!Number.isFinite(energy) || !Number.isFinite(max) || max <= 0){
      wrap.classList.remove('is-low','is-critical');
      return;
    }
    var ratio = energy / max;
    wrap.classList.toggle('is-critical', ratio <= 0.15);
    wrap.classList.toggle('is-low', ratio > 0.15 && ratio <= 0.35);
  }
  setInterval(refresh, 500);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh);
  else refresh();
  console.log('[polish-phase2] ready');
})();
