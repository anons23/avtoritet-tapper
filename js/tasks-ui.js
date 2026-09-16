'use strict';
(function(){
  const KEY='avtoritet_save_v2';
  const TASKS=[
    ['taps10000','Первые 10 000 тапов','Сделай 10 000 обычных тапов.',10000,'500 🚬','taps'],
    ['bugor10','Десять тренировок','Успешно пройди 10 тренировок с Бугром.',10,'750 🚬','bugorSuccess'],
    ['crit100','Точный удар','Сделай 100 критических тапов.',100,'1000 🚬','crit'],
    ['earned100k','Запас на чёрный день','Заработай 100 000 🚬 тапами и делами.',100000,'5000 🚬','earned'],
    ['tasks25','Опытный порученец','Успешно выполни 25 поручений.',25,'1500 ⭐','npcSuccess']
  ];
  const $=id=>document.getElementById(id);
  function read(){try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');return d&&typeof d==='object'?d:null}catch(e){return null}}
  function value(s,key){return Math.max(0,Number((s.tasks||{})[key])||0)}
  function open(){
    const s=read(); if(!s)return;
    const overlay=$('modal-overlay'), content=$('modal-content');
    if(!overlay||!content)return;
    content.innerHTML='';
    const h=document.createElement('h2'); h.textContent='🎯 Поручения'; content.appendChild(h);
    const p=document.createElement('p'); p.textContent='Выполняй поручения и получай награды. Награда выдаётся автоматически при выполнении.'; content.appendChild(p);
    TASKS.forEach(t=>{
      const cur=value(s,t[5]), done=!!((s.completed||{})[t[0]]), card=document.createElement('div');
      card.className='task-card'; card.style.cssText='padding:10px;margin:8px 0;border:1px solid rgba(255,255,255,.1);border-radius:10px';
      const title=document.createElement('b'); title.textContent=(done?'✅ ':'🎯 ')+t[1]; card.appendChild(title);
      const desc=document.createElement('div'); desc.textContent=t[2]; desc.style.margin='5px 0'; card.appendChild(desc);
      const small=document.createElement('small'); small.textContent='Прогресс: '+Math.min(cur,t[3]).toLocaleString('ru-RU')+' / '+t[3].toLocaleString('ru-RU')+' · Награда: '+t[4]; card.appendChild(small);
      content.appendChild(card);
    });
    overlay.classList.remove('hidden');
  }
  function init(){
    const b=$('btn-tasks'); if(!b)return;
    b.addEventListener('click',function(e){
      e.preventDefault(); e.stopImmediatePropagation(); open();
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
