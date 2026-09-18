'use strict';
(function(){
  const EVENT_CHANCE=.18;
  let wired=false;
  const state=()=>window.getGameState?window.getGameState():null;
  function setMessage(text){
    const e=document.getElementById('event-message');if(!e)return;
    e.textContent=text;e.classList.remove('show');void e.offsetWidth;e.classList.add('show');
    setTimeout(()=>e.classList.remove('show'),2600);
  }
  function openDeal(){
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return false;
    const area=document.getElementById('tap-area');if(!area)return false;
    let hidden=area.querySelector('.authority-deal-btn');
    if(!hidden){
      hidden=document.createElement('button');
      hidden.type='button';hidden.className='authority-deal-btn';
      hidden.style.cssText='position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
      area.appendChild(hidden);
    }
    const ev=new PointerEvent('pointerdown',{bubbles:true,cancelable:true,view:window});
    hidden.dispatchEvent(ev);
    return true;
  }
  function folderTap(e){
    if(e&&e.preventDefault)e.preventDefault();
    if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation();
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return;
    if(document.querySelector('.authority-modal')||document.querySelector('.authority-clash-window'))return;
    const btn=e&&e.target&&e.target.closest?e.target.closest('.authority-desk-hotspot'):null;
    if(btn){btn.classList.remove('folder-punch');void btn.offsetWidth;btn.classList.add('folder-punch');}
    if(Math.random()<EVENT_CHANCE){
      openDeal();
    }
  }
  function onPointer(e){
    const t=e.target&&e.target.closest&&e.target.closest('.authority-desk-hotspot');
    if(!t)return;
    folderTap(e);
  }
  function init(){
    if(wired)return;
    wired=true;
    document.addEventListener('pointerdown',onPointer,true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();