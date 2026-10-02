/* raids-ui minimal v4.41 */
'use strict';
(function(){
  function openRaidMenu(){
    var overlay=document.getElementById('modal-overlay');
    var content=document.getElementById('modal-content');
    if(!overlay||!content)return;
    overlay.classList.remove('hidden');
    overlay.classList.add('show','raid-selection-fullscreen');
    overlay.classList.remove('raid-fullscreen');
    content.innerHTML='<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Модуль рейдов восстанавливается. Тапы уже работают (+500).</p></div><div class="raid-select-actions"><button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div></div><div class="raid-fighter-list" id="raid-fighter-list"><p style="padding:16px;color:#aaa">Полный список бойцов вернём в следующем обновлении.</p></div></div>';
    var closeBtn=document.getElementById('raid-menu-close');
    if(closeBtn)closeBtn.addEventListener('click',function(){
      overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
      overlay.classList.add('hidden');
    });
  }
  window.openRaidMenu=openRaidMenu;
  function ensureBtn(){
    if(document.getElementById('raid-open-button'))return;
    var parent=document.getElementById('game-container')||document.body;
    if(!parent)return;
    var btn=document.createElement('button');
    btn.id='raid-open-button';
    btn.type='button';
    btn.title='Рейды';
    btn.setAttribute('aria-label','Рейды');
    btn.innerHTML='<img src="./assets/raids/ui/raid-button.png" alt="Рейды">';
    btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openRaidMenu();});
    parent.appendChild(btn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureBtn);
  else ensureBtn();
  setTimeout(ensureBtn,500);
  setTimeout(ensureBtn,2000);
})();
