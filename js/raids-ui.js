/* raids-ui v4.62 — fighters with images, HP bar, 300 dmg TEST */
'use strict';
(function(){
  var REQS=[0,1500,5000,15000,50000];
  var FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,img:'./assets/raids/fighters/petrovich1.png'},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,img:'./assets/raids/fighters/Vtirach1.png'},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,img:'./assets/raids/fighters/mafioznik_hit_1.png'},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,img:'./assets/raids/fighters/Mongol1.png'},
    {id:'glaz',name:'ГЛАЗ',rank:2,hp:5000,img:'./assets/raids/fighters/Glaz1.png'},
    {id:'krest',name:'КРЕСТ',rank:3,hp:6500,img:'./assets/raids/fighters/petrovich1.png'},
    {id:'psikh',name:'ПСИХ АРКАША',rank:4,hp:8000,img:'./assets/raids/fighters/Glaz1.png'}
  ];
  function st(){ return typeof window.getGameState==='function' ? window.getGameState() : null; }
  function pts(){ var s=st(); return Number(s&&s.points)||0; }

  function openRaidMenu(){
    var overlay=document.getElementById('modal-overlay');
    var content=document.getElementById('modal-content');
    if(!overlay||!content)return;
    overlay.classList.remove('hidden');
    overlay.classList.add('show','raid-selection-fullscreen');
    overlay.classList.remove('raid-fullscreen');
    var p=pts();
    var list='';
    FIGHTERS.forEach(function(f,i){
      var ok=p>=(REQS[f.rank]||0);
      list+='<button type="button" class="raid-fighter-card'+(ok?'':' locked')+'" data-i="'+i+'" '+(ok?'':'disabled')+'>'+
        '<img class="raid-card-avatar" src="'+f.img+'" alt="" onerror="this.style.display=\'none\'">'+ 
        '<div class="raid-card-name">'+f.name+'</div><small>HP '+f.hp+(ok?'':' · 🔒')+'</small></button>';
    });
    content.innerHTML='<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай по нему.</p></div>'+
      '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div>'+
      '<div class="raid-fighter-list" id="raid-fighter-list">'+list+'</div></div>';
    document.getElementById('raid-menu-close')?.addEventListener('click',function(){
      overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
      overlay.classList.add('hidden');
    });
    content.querySelectorAll('.raid-fighter-card:not(.locked)').forEach(function(btn){
      btn.addEventListener('click',function(){
        startFight(+btn.dataset.i);
      });
    });
  }

  function startFight(i){
    var f=FIGHTERS[i]; if(!f)return;
    var overlay=document.getElementById('modal-overlay');
    var content=document.getElementById('modal-content');
    var hp=f.hp;
    overlay.classList.remove('raid-selection-fullscreen');
    overlay.classList.add('raid-fullscreen');
    content.innerHTML='<div class="raid-window"><div class="raid-scene" id="raid-scene">'+
      '<div class="raid-hud"><span class="raid-name">'+f.name+'</span>'+
      '<div class="raid-hp"><div id="raid-hp-fill" style="width:100%"></div></div>'+
      '<span id="raid-hp-text">'+hp+' / '+f.hp+'</span></div>'+
      '<div class="raid-fighter" id="raid-fighter"><img src="'+f.img+'" alt="'+f.name+'" style="max-width:70%;max-height:55vh;object-fit:contain" onerror="this.parentElement.textContent=\'👊\'"></div>'+
      '<p style="color:#aaa;font-size:13px;margin:8px 0">Тапай по бойцу · урон 300</p>'+
      '<button type="button" id="raid-back">← Назад</button></div></div>';
    document.getElementById('raid-back')?.addEventListener('click', openRaidMenu);
    document.getElementById('raid-scene')?.addEventListener('pointerdown', function(e){
      if(e.target.closest('#raid-back')) return;
      var dmg=300;
      hp=Math.max(0,hp-dmg);
      var fill=document.getElementById('raid-hp-fill');
      var txt=document.getElementById('raid-hp-text');
      if(fill) fill.style.width=(hp/f.hp*100)+'%';
      if(txt) txt.textContent=hp+' / '+f.hp;
      var img=document.querySelector('#raid-fighter img');
      if(img&&img.animate){ try{ img.animate([{transform:'scale(1)'},{transform:'scale(0.9)'},{transform:'scale(1)'}],{duration:150}); }catch(err){} }
      if(hp<=0){
        if(typeof window.msg==='function') window.msg('🏆 ПОБЕДА! '+f.name);
        setTimeout(openRaidMenu, 700);
      }
    });
  }

  function ensureBtn(){
    if(document.getElementById('raid-open-button')) return;
    var parent=document.getElementById('game-container')||document.body;
    var btn=document.createElement('button');
    btn.id='raid-open-button'; btn.type='button'; btn.title='Рейды';
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
