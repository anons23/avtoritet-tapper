'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const NAMES=['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник','Криворукий','Недомерок','Каштан','Мятый','Забытый','Ходячая Ошибка','Кривой Прицел','Потеряшка','Мелкий Косяк','Батон','Вечный Новенький','Шмоня','Картонный Боец','Голова-Кирпич','Тихий Пельмень','Сбитый Прицел','Герой Очереди','Местный Балбес','Почти Пацан','Не Суетись'];
  const OLD_DEFAULTS=['Кирпич','Шайба','Бугор','Хмурый','Косой','Гвоздь','Топор','Серый','Лысый','Крест','Малой','Брат','Штиль','Волк','Кабан','Ёжик','Пупс','Змей','Тигр','Кощей','Батя','Шустрый','Немой','Гроза'];
  function randomName(){return NAMES[Math.floor(Math.random()*NAMES.length)]}
  function openNameEditor(){
    const modal=$('modal-overlay'),content=$('modal-content');if(!modal||!content)return;
    const current=($('nickname')?.textContent||'').trim();
    content.innerHTML='<h2>🥷 Погремуха</h2><div class="name-editor"><input id="nickname-input" type="text" maxlength="24" autocomplete="off" placeholder="Новая погремуха"><button type="button" id="apply-nickname">Сменить погремуху</button></div>';
    modal.dataset.locked='0';modal.classList.remove('hidden');
    const input=$('nickname-input');
    if(input){input.value=current;setTimeout(()=>{input.focus();input.select()},0);input.addEventListener('keydown',e=>{if(e.key==='Enter')applyName()})}
    const btn=$('apply-nickname');if(btn)btn.onclick=applyName;
    function applyName(){const value=(input?.value||'').trim();if(typeof window.requestNameChange==='function'){window.requestNameChange(value);return}if(!value)return;try{const state=JSON.parse(localStorage.getItem('avtoritet_save_v2')||'{}');state.nickname=value.slice(0,24);state.saveUpdatedAt=Date.now();localStorage.setItem('avtoritet_save_v2',JSON.stringify(state));if($('nickname'))$('nickname').textContent=state.nickname;modal.classList.add('hidden')}catch(e){}}
  }
  function hideOldNameBlock(){const old=$('name-btn');if(old){const row=old.closest('button,.menu-item,.settings-row,div');(row||old).style.display='none'}document.querySelectorAll('#modal-content button,#modal-content p,#modal-content div').forEach(el=>{if(el.id==='apply-nickname'||el.id==='nickname-input')return;const text=(el.textContent||'').trim();if(text.includes('Смена имени')||text.includes('Сменить имя'))el.style.display='none'})}
  function init(){
    const nick=$('nickname');
    if(nick){nick.style.cursor='pointer';nick.title='Сменить погремуху';nick.addEventListener('click',openNameEditor)}
    try{
      const raw=localStorage.getItem('avtoritet_save_v2');
      const state=raw?JSON.parse(raw):null;
      if(state&&state.nickname&&OLD_DEFAULTS.includes(state.nickname)){
        state.nickname=randomName();state.saveUpdatedAt=Date.now();localStorage.setItem('avtoritet_save_v2',JSON.stringify(state));
        if(nick)nick.textContent=state.nickname;
      }
    }catch(e){}
    hideOldNameBlock();
    const content=$('modal-content');if(content)new MutationObserver(hideOldNameBlock).observe(content,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
