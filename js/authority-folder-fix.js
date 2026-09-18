'use strict';
(function(){
  const FOLDER_TAPS_NEEDED=50;
  const FOLDER_SRC='./assets/authority/barrack_cases_icon.jfif';
  let folderTaps=0;
  let wired=false;

  const state=()=>window.getGameState?window.getGameState():null;

  function setMessage(text){
    const e=document.getElementById('event-message');
    if(!e)return;
    e.textContent=text;
    e.classList.remove('show');
    void e.offsetWidth;
    e.classList.add('show');
    setTimeout(()=>e.classList.remove('show'),2600);
  }

  function spendEnergy(amount){
    const s=state();
    amount=Math.max(0,Math.floor(amount||0));
    if(!s)return false;
    if(typeof s.energy!=='number')s.energy=0;
    if(s.energy<amount){
      setMessage('⚡ Не хватает энергии. Нужно '+amount+'.');
      return false;
    }
    s.energy-=amount;
    if(typeof s.lastEnergyTime!=='number')s.lastEnergyTime=Date.now();
    const e=document.getElementById('energy');
    if(e)e.textContent=Math.floor(s.energy);
    try{localStorage.setItem('avtoritet_save_v2',JSON.stringify(s))}catch(err){}
    return true;
  }

  function updateProgress(){
    const el=document.getElementById('authority-folder-count');
    if(el)el.textContent=String(Math.min(folderTaps,FOLDER_TAPS_NEEDED));
  }

  function installFolderUI(){
    const wrap=document.querySelector('.authority-action-wrap');
    if(!wrap)return false;
    if(wrap.querySelector('.authority-folder-btn'))return true;
    wrap.innerHTML=
      '<button type="button" class="authority-folder-btn" data-authority-action="folder" aria-label="Папки дел">'+
        '<img class="authority-img authority-folder-img" src="'+FOLDER_SRC+'" draggable="false" alt="">'+
      '</button>'+
      '<div class="authority-folder-progress"><span id="authority-folder-count">'+folderTaps+'</span> / '+FOLDER_TAPS_NEEDED+' тапов по папкам</div>'+
      '<div class="authority-action-hint">Тапай папки на столе · после '+FOLDER_TAPS_NEEDED+' откроется дело</div>';
    return true;
  }

  function openDeal(){
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return;
    const area=document.getElementById('tap-area');
    if(!area)return;
    let hidden=area.querySelector('.authority-deal-btn');
    if(!hidden){
      hidden=document.createElement('button');
      hidden.type='button';
      hidden.className='authority-deal-btn';
      hidden.style.cssText='position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
      area.appendChild(hidden);
    }
    const ev=new PointerEvent('pointerdown',{bubbles:true,cancelable:true,view:window});
    hidden.dispatchEvent(ev);
  }

  function folderTap(e){
    if(e&&e.preventDefault)e.preventDefault();
    if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation();
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return;
    if(document.querySelector('.authority-modal')||document.querySelector('.authority-clash-window'))return;
    if(s.energy<1){setMessage('⚡ Энергия закончилась. Отдохни или используй бонус.');return;}
    if(folderTaps%5===0){
      if(!spendEnergy(1))return;
    }
    folderTaps++;
    updateProgress();
    const btn=document.querySelector('.authority-folder-btn');
    if(btn){btn.classList.remove('folder-punch');void btn.offsetWidth;btn.classList.add('folder-punch');}
    if(folderTaps>=FOLDER_TAPS_NEEDED){
      folderTaps=0;
      updateProgress();
      openDeal();
    }
  }

  function onPointer(e){
    const t=e.target&&e.target.closest&&e.target.closest('.authority-folder-btn');
    if(!t)return;
    folderTap(e);
  }

  function tick(){
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed){
      folderTaps=0;
      return;
    }
    installFolderUI();
  }

  function init(){
    if(wired)return;
    wired=true;
    document.addEventListener('pointerdown',onPointer,true);
    setInterval(tick,300);
    tick();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
