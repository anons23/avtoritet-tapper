/* raids-ui v4.53 — working with TEST 300 dmg */
'use strict';
(function(){
  const RAID_FIGHTERS = [
    {id:'petrovich', name:'ПЕТРОВИЧ', rank:0, hp:1500},
    {id:'vtirach', name:'ВТИРАЧ', rank:0, hp:2000},
    {id:'mafioznik', name:'МАФИОЗНИК', rank:1, hp:3000},
    {id:'mongol', name:'МОНГОЛ', rank:1, hp:4000},
    {id:'glaz', name:'ГЛАЗ', rank:2, hp:5000},
    {id:'krest', name:'КРЕСТ', rank:3, hp:6500},
    {id:'psikh', name:'ПСИХ АРКАША', rank:4, hp:8000}
  ];
  const REQS = [0, 1500, 5000, 15000, 50000];

  function getState(){ return (typeof window.getGameState === 'function') ? window.getGameState() : null; }

  function openRaidMenu(){
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if(!overlay || !content) return;
    overlay.classList.remove('hidden');
    overlay.classList.add('show', 'raid-selection-fullscreen');
    overlay.classList.remove('raid-fullscreen');

    const st = getState();
    const pts = Number(st && st.points) || 0;
    let list = '';
    RAID_FIGHTERS.forEach((f, i) => {
      const ok = pts >= (REQS[f.rank] || 0);
      list += '<button type="button" class="raid-fighter-card'+(ok?'':' locked')+'" data-i="'+i+'" '+(ok?'':'disabled')+'>'+
        '<div class="raid-card-name">'+f.name+'</div><small>HP '+f.hp+(ok?'':' · 🔒')+'</small></button>';
    });
    content.innerHTML = '<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай по нему.</p></div>'+
      '<button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div>'+
      '<div class="raid-fighter-list" id="raid-fighter-list">'+list+'</div></div>';

    document.getElementById('raid-menu-close')?.addEventListener('click', () => {
      overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
      overlay.classList.add('hidden');
    });

    content.querySelectorAll('.raid-fighter-card:not(.locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        const f = RAID_FIGHTERS[i];
        let hp = f.hp;
        overlay.classList.remove('raid-selection-fullscreen');
        overlay.classList.add('raid-fullscreen');
        content.innerHTML = '<div class="raid-window"><div class="raid-scene" id="raid-scene">'+
          '<div class="raid-hud"><span class="raid-name">'+f.name+'</span>'+
          '<div class="raid-hp"><div id="raid-hp-fill" style="width:100%"></div></div>'+
          '<span id="raid-hp-text">'+hp+' / '+f.hp+'</span></div>'+
          '<div class="raid-fighter" id="raid-fighter">👊</div>'+
          '<button type="button" id="raid-back">← Назад</button></div></div>';

        document.getElementById('raid-back')?.addEventListener('click', openRaidMenu);
        document.getElementById('raid-scene')?.addEventListener('pointerdown', function(e){
          if(e.target.closest('#raid-back')) return;
          const dmg = (typeof TEST_MODE !== 'undefined' && TEST_MODE) ? 300 : Math.max(1, Number(getState()?.power)||1);
          hp = Math.max(0, hp - dmg);
          const fill = document.getElementById('raid-hp-fill');
          const txt = document.getElementById('raid-hp-text');
          if(fill) fill.style.width = (hp / f.hp * 100) + '%';
          if(txt) txt.textContent = hp + ' / ' + f.hp;
          if(hp <= 0){
            msgWin(f.name);
            setTimeout(openRaidMenu, 800);
          }
        });
      });
    });
  }

  function msgWin(name){
    if(typeof window.msg === 'function') window.msg('🏆 ПОБЕДА! '+name);
    else alert('ПОБЕДА! '+name);
  }

  function ensureBtn(){
    if(document.getElementById('raid-open-button')) return;
    const parent = document.getElementById('game-container') || document.body;
    const btn = document.createElement('button');
    btn.id = 'raid-open-button';
    btn.type = 'button';
    btn.title = 'Рейды';
    btn.setAttribute('aria-label', 'Рейды');
    btn.innerHTML = '<img src="./assets/raids/ui/raid-button.png" alt="Рейды" onerror="this.parentElement.textContent=\'⚔️\'">';
    btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); openRaidMenu(); });
    parent.appendChild(btn);
  }

  function boot(){
    ensureBtn();
    setTimeout(ensureBtn, 500);
    setTimeout(ensureBtn, 2000);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.openRaidMenu = openRaidMenu;
})();
