/* authority-choice-guard v1.1 — один раз на дело, без зацикливания */
'use strict';
(function(){
  var LOCK_MS=1800;

  function lockChoices(root){
    var box=root.querySelector('.authority-choices');
    if(!box)return;
    // уже блокировали / уже разблокировали это дело — больше не трогаем
    if(box.dataset.guardDone==='1')return;
    if(box.dataset.guardLocked==='1')return;

    box.dataset.guardLocked='1';
    box.classList.add('choices-locked');

    var hint=root.querySelector('.authority-choice-guard-hint');
    if(!hint){
      hint=document.createElement('div');
      hint.className='authority-choice-guard-hint';
      var title=root.querySelector('.authority-choice-title');
      if(title&&title.parentNode) title.parentNode.insertBefore(hint, title.nextSibling);
      else if(box.parentNode) box.parentNode.insertBefore(hint, box);
    }

    var left=Math.ceil(LOCK_MS/1000);
    var tickTimer=null;
    function tick(){
      if(!box.classList.contains('choices-locked'))return;
      if(left>0){
        hint.textContent='⏳ Подожди '+left+' сек — прочитай варианты';
        hint.style.display='block';
        left--;
        tickTimer=setTimeout(tick,1000);
      }
    }

    box.querySelectorAll('.authority-choice').forEach(function(b){
      b.disabled=true;
      b.classList.add('choice-disabled');
    });

    tick();

    setTimeout(function(){
      if(tickTimer)clearTimeout(tickTimer);
      box.classList.remove('choices-locked');
      box.dataset.guardLocked='0';
      box.dataset.guardDone='1'; // не запускать снова на этом же деле
      box.querySelectorAll('.authority-choice').forEach(function(b){
        b.disabled=false;
        b.classList.remove('choice-disabled');
      });
      if(hint){ hint.style.display='none'; hint.textContent=''; }
    }, LOCK_MS);
  }

  function scan(){
    var content=document.getElementById('modal-content');
    if(!content)return;
    if(!content.querySelector('.authority-deal-window'))return;
    var box=content.querySelector('.authority-choices');
    if(!box)return;
    if(box.dataset.guardDone==='1')return;
    if(box.dataset.guardLocked==='1')return;
    lockChoices(content);
  }

  var overlay=document.getElementById('modal-overlay');
  if(overlay){
    new MutationObserver(function(){
      // только childList модалки, без attributes — иначе разблокировка снова триггерит scan
      setTimeout(scan, 30);
    }).observe(overlay,{childList:true,subtree:true});
  }

  document.addEventListener('pointerdown', function(e){
    var btn=e.target&&e.target.closest&&e.target.closest('.authority-choice');
    if(!btn)return;
    var box=btn.closest('.authority-choices');
    if(box&&box.classList.contains('choices-locked')){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  console.log('[authority-choice-guard] v1.1 once-per-deal');
})();
