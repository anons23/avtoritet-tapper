'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const NAMES=['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок'];
  function openNameEditor(){
    const modal=$('modal-overlay'), content=$('modal-content');
    if(!modal||!content)return;
    const current=($('nickname')?.textContent||'').trim();
    content.innerHTML='<h2>🥷 Погремуха</h2><div class="name-editor"><input id="nickname-input" type="text" maxlength="24" autocomplete="off" placeholder="Новая погремуха"><button type="button" id="apply-nickname">Сменить погремуху</button></div>';
    const input=$('nickname-input');
    if(input){input.value=current;setTimeout(()=>{input.focus();input.select()},0)}
    const btn=$('apply-nickname');
    if(btn)btn.onclick=()=>{const value=(input?.value||'').trim();if(!value)return;if(typeof window.requestNameChange==='function'){window.requestNameChange()}else if($('nickname'))$('nickname').textContent=value};
    modal.classList.remove('hidden');
  }
  function init(){
    const nick=$('nickname');
    if(nick){nick.style.cursor='pointer';nick.title='Сменить погремуху';nick.addEventListener('click',openNameEditor)}
    const saved=localStorage.getItem('avtoritet_nickname_migrated_v1');
    if(!saved){
      const raw=localStorage.getItem('avtoritet_save_v2');
      try{
        const state=raw?JSON.parse(raw):null;
        if(state&&state.nickname){
          state.nickname=NAMES[Math.floor(Math.random()*NAMES.length)];
          localStorage.setItem('avtoritet_save_v2',JSON.stringify(state));
          if(nick)nick.textContent=state.nickname;
        }
      }catch(e){}
      localStorage.setItem('avtoritet_nickname_migrated_v1','1');
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
