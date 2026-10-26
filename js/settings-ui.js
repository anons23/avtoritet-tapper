/* Settings screen + safe progress reset. */
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);};
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function musicMuted(){try{return !!(window.GameMusic&&window.GameMusic.isMuted&&window.GameMusic.isMuted());}catch(e){return false;}}
  function sfxMuted(){try{return !!(window.GameSFX&&window.GameSFX.isMuted&&window.GameSFX.isMuted());}catch(e){return false;}}
  function modal(html){
    if(typeof window.openModal==='function'){window.openModal(html);return;}
    var o=$('modal-overlay'),c=$('modal-content');
    if(o&&c){c.innerHTML=html;o.classList.remove('hidden');o.classList.add('show');}
  }
  function settingButton(id,label,desc,on){
    return '<button type="button" class="settings-toggle" id="'+id+'"><span class="settings-toggle-copy"><b>'+label+'</b><small>'+desc+'</small></span><strong class="settings-state '+(on?'is-on':'')+'">'+(on?'ВКЛ':'ВЫКЛ')+'</strong></button>';
  }
  function renderSettings(){
    var state=typeof window.getGameState==='function'?window.getGameState():{};
    var nick=state&&state.nickname?state.nickname:'Салага';
    var html='<div class="section-window settings-window">'+
      '<div class="section-kicker">ИГРОВЫЕ ПАРАМЕТРЫ</div><h2>⚙ Настройки</h2>'+
      '<p class="section-subtitle">Управляй звуком, погремухой и прогрессом игры.</p>'+
      '<div class="settings-group"><h3>Звук</h3>'+
      settingButton('settings-music','Музыка','Фоновая музыка в игре',!musicMuted())+
      settingButton('settings-sfx','Звуковые эффекты','Удары, нажатия и победы',!sfxMuted())+
      '</div><div class="settings-group"><h3>Погремуха</h3>'+
      '<form id="settings-nickname-form" class="settings-name-form"><label for="settings-nickname">Имя игрока</label><input id="settings-nickname" name="nickname" maxlength="16" autocomplete="nickname" value="'+esc(nick)+'" placeholder="Введи погремуху" required><button type="submit" class="settings-primary">Сохранить имя</button></form>'+
      '</div><div class="settings-group"><h3>Как играть</h3>'+
      '<div class="settings-help"><p><b>Тапай по объекту</b> на главном экране, чтобы получать очки и чефир.</p><p><b>Энергия</b> расходуется на действия; улучшения доступны в «Качалке».</p><p><b>Масть и поручения</b> показывают развитие персонажа и дополнительные цели.</p><p><b>Рейды</b> открывают бои с персонажами. Следи за энергией и таймером бойца.</p><p><b>Барак</b> — разговоры с персонажами и их истории.</p></div>'+
      '</div><div class="settings-group settings-danger"><h3>Данные игры</h3><p>Сброс удалит очки, ресурсы, улучшения, масть, поручения и прогресс рейдов на этом устройстве. Настройки звука сохранятся.</p><button type="button" id="settings-reset-open" class="settings-reset">↻ Сбросить весь прогресс</button></div>'+
      '<p class="settings-footnote">Изменения сохраняются на этом устройстве.</p></div>';
    modal(html);
    var music=$('settings-music');
    if(music)music.addEventListener('click',function(){if(window.GameMusic&&window.GameMusic.setMuted)window.GameMusic.setMuted(!musicMuted());renderSettings();});
    var sfx=$('settings-sfx');
    if(sfx)sfx.addEventListener('click',function(){if(window.GameSFX&&window.GameSFX.setMuted)window.GameSFX.setMuted(!sfxMuted());renderSettings();});
    var form=$('settings-nickname-form');
    if(form)form.addEventListener('submit',function(e){
      e.preventDefault();
      var input=$('settings-nickname');
      var value=String(input&&input.value||'').replace(/[^\w\u0400-\u04FF\- ]/g,'').trim().slice(0,16);
      if(!value){if(input)input.focus();return;}
      var s=typeof window.getGameState==='function'?window.getGameState():null;
      if(!s)return;
      s.nickname=value;
      if(typeof window.saveGame==='function')window.saveGame();
      if(typeof window.ui==='function')window.ui();
      renderSettings();
      var updated=$('settings-nickname');if(updated){updated.value=value;updated.focus();}
    });
    var reset=$('settings-reset-open');
    if(reset)reset.addEventListener('click',renderResetConfirmation);
  }
  function renderResetConfirmation(){
    modal('<div class="section-window settings-window settings-reset-confirm"><div class="section-kicker">НЕОБРАТИМОЕ ДЕЙСТВИЕ</div><h2>↻ Сбросить прогресс?</h2><p class="section-subtitle">Все очки, ресурсы, улучшения, масти, поручения и результаты рейдов будут удалены с этого устройства. Музыка и настройки звука останутся. Отменить сброс нельзя.</p><div class="settings-confirm-actions"><button type="button" id="settings-reset-cancel" class="settings-secondary">Отмена</button><button type="button" id="settings-reset-confirm" class="settings-reset">Да, начать заново</button></div></div>');
    var cancel=$('settings-reset-cancel');if(cancel)cancel.addEventListener('click',renderSettings);
    var confirm=$('settings-reset-confirm');if(confirm)confirm.addEventListener('click',window.resetGameProgress);
  }
  window.resetGameProgress=function(){
    // Set the guard BEFORE removing keys; interval, debounce and pagehide saves must not restore the old state.
    window.__AVTORITET_RESETTING=true;
    try{
      var keys=[];
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(key&&(/^avtoritet_/i.test(key)||/^avtoritet-/i.test(key)||/^raid_progress$/i.test(key)))keys.push(key);
      }
      keys.forEach(function(key){localStorage.removeItem(key);});
      ['avtoritet_save_v2','avtoritet_save_v2_backup','raid_progress'].forEach(function(key){localStorage.removeItem(key);});
    }catch(e){}
    location.reload();
  };
  function bind(){
    var btn=$('btn-settings');
    if(btn&&!btn.dataset.settingsBound){btn.dataset.settingsBound='1';btn.addEventListener('click',renderSettings);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  window.openGameSettings=renderSettings;
})();
