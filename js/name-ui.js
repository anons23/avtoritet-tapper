'use strict';
(function(){
  const $=id=>document.getElementById(id);
  // Самоироничные погремухи: слегка обидные, но без жести — чтобы хотелось поменять или посмеяться.
  const NAMES=['Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух','Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот','Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп','Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин','Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник','Криворукий','Недомерок','Каштан','Мятый','Забытый','Ходячая Ошибка','Кривой Прицел','Потеряшка','Мелкий Косяк','Батон','Вечный Новенький','Шмоня','Картонный Боец','Голова-Кирпич','Тихий Пельмень','Сбитый Прицел','Герой Очереди','Местный Балбес','Почти Пацан','Не Суетись'];
  const OLD_DEFAULTS=['Кирпич','Шайба','Бугор','Хмурый','Косой','Гвоздь','Топор','Серый','Лысый','Крест','Малой','Брат','Штиль','Волк','Кабан','Ёжик','Пупс','Змей','Тигр','Кощей','Батя','Шустрый','Немой','Гроза'];
  function randomName(){return NAMES[Math.floor(Math.random()*NAMES.length)]}
  function openNameEditor(){
    const modal=$('modal-overlay'), content=$('modal-content');if(!modal||!content)return;
    const current=($('nickname')?.textContent||'').trim();
    content.innerHTML='<h2>🥷 Погремуха</h2><div class="name-editor"><input id="nickname-input" type="text" maxlength="24" autocomplete="off" placeholder="Новая погремуха"><button type="button" id="apply-nickname">Сменить погремуху</button></div>';
    const input=$('nickname-input');if(input){input.value=current;setTimeout(()=>{input.focus();input.select()},0)}
    const btn=$('apply-nickname');if(btn)btn.onclick=()=>{const value=(input?.value||'').trim();if(!value)return;if(typeof window.requestNameChange==='function')window.requestNameChange();};
    modal.classList.remove('hidden');
  }
  function hideOldNameBlock(){const old=$('name-btn');if(old){const row=old.closest('button,.menu-item,.settings-row,div');(row||old).style.display='none'}document.querySelectorAll('#modal-content button,#modal-content p,#modal-content div').forEach(el=>{if(el.id==='apply-nickname'||el.id==='nickname-input')return;const text=(el.textContent||'').trim();if(text.includes('Смена имени')||text.includes('Сменить имя')){if(el.closest('#modal-content'))el.style.display='none'}})}
  function init(){
    const nick=$('nickname');
    if(nick){nick.style.cursor='pointer';nick.title='Сменить погремуху';nick.addEventListener('click',openNameEditor)}
    try{
      const raw=localStorage.getItem('avtoritet_save_v2');
      const state=raw?JSON.parse(raw):null;
      const migrated=localStorage.getItem('avtoritet_nickname_migrated_v2');
      if(state&&state.nickname&&(OLD_DEFAULTS.includes(state.nickname)||!migrated)){
        state.nickname=randomName();
        localStorage.setItem('avtoritet_save_v2',JSON.stringify(state));
        if(nick)nick.textContent=state.nickname;
      }
      localStorage.setItem('avtoritet_nickname_migrated_v2','1');
    }catch(e){}
    hideOldNameBlock();
    const content=$('modal-content');if(content)new MutationObserver(hideOldNameBlock).observe(content,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
