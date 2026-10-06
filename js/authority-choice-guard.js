/* authority-choice-guard v1.0 — защита от случайного выбора в деле барака */
'use strict';
(function(){
  var LOCK_MS=1800;
  var lastLock=0;

  function lockChoices(root){
    var box=root.querySelector('.authority-choices');
    if(!box)return;
    if(box.dataset.guardLocked==='1')return;
    box.dataset.guardLocked='1';
    box.classList.add('choices-locked');

    var hint=root.querySelector('.authority-choice-guard-hint');
    if(!hint){
      hint=document.createElement('div');
      hint.className='authority-choice-guard-hint';
      var title=root.querySelector('.authority-choice-title');
      if(title&&title.parentNode) title.parentNode.insertBefore(hint, title.nextSibling);
      else box.parentNode.insertBefore(hint, box);
    }

    var left=Math.ceil(LOCK_MS/1000);
    function tick(){
      if(left>0){
        hint.textContent='⏳ Подожди '+left+' сек — прочитай варианты';
        hint.style.display='block';
        left--;
        setTimeout(tick,1000);
      }else{
        hint.textContent='';
        hint.style.display='none';
        box.classList.remove('choices-locked');
        box.dataset.guardLocked='0';
        box.querySelectorAll('.authority-choice').forEach(function(b){
          b.disabled=false;
          b.classList.remove('choice-disabled');
        });
      }
    }

    box.querySelectorAll('.authority-choice').forEach(function(b){
      b.disabled=true;
      b.classList.add('choice-disabled');
      // блокируем pointerdown в capture, чтобы тап не прошёл сразу
      b.addEventListener('pointerdown', blockWhileLocked, true);
      b.addEventListener('click', blockWhileLocked, true);
    });

    lastLock=Date.now();
    tick();
    setTimeout(function(){
      box.classList.remove('choices-locked');
      box.dataset.guardLocked='0';
      box.querySelectorAll('.authority-choice').forEach(function(b){
        b.disabled=false;
        b.classList.remove('choice-disabled');
      });
      if(hint){ hint.style.display='none'; hint.textContent=''; }
    }, LOCK_MS);
  }

  function blockWhileLocked(e){
    var box=e.currentTarget&&e.currentTarget.closest&&e.currentTarget.closest('.authority-choices');
    if(box&&box.classList.contains('choices-locked')){
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      return false;
    }
  }

  function scan(){
    var content=document.getElementById('modal-content');
    if(!content)return;
    if(!content.querySelector('.authority-deal-window'))return;
    if(!content.querySelector('.authority-choices'))return;
    // не блокируем повторно слишком часто
    if(Date.now()-lastLock<500)return;
    lockChoices(content);
  }

  var overlay=document.getElementById('modal-overlay');
  if(overlay){
    new MutationObserver(function(){ setTimeout(scan, 20); })
      .observe(overlay,{childList:true,subtree:true,attributes:true});
  }
  // глобальный guard: любые клики по choice в первые LOCK_MS после появления
  document.addEventListener('pointerdown', function(e){
    var btn=e.target&&e.target.closest&&e.target.closest('.authority-choice');
    if(!btn)return;
    var box=btn.closest('.authority-choices');
    if(box&&box.classList.contains('choices-locked')){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  console.log('[authority-choice-guard] lock', LOCK_MS,'ms');
})();
