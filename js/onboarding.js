/* onboarding.js v2.1 — Spotlight / coach-marks онбординг */
'use strict';
(function () {
  var NAME_TRIGGER_TAPS = 20;
  var REQUIRED_PRACTICE_TAPS = 12;

  var NAMES_TOUGH = [
    'Гвоздь','Топор','Крест','Кабан','Волк','Змей','Тигр','Кощей',
    'Гроза','Штиль','Немой','Хмурый','Косой','Батя','Шустрый',
    'Кирпич','Молот','Рубец','Клык','Тень'
  ];
  var NAMES_CALM = [
    'Тихий','Серый','Малой','Брат','Ёжик','Пупс','Тиша',
    'Мятый','Каштан','Батон','Мелкий','Спокойный','Ровный',
    'Тихий Пельмень','Не Суетись','Вечный Новенький'
  ];
  var NAMES_RANDOM = [
    'Чахлый','Додик','Дрыщ','Шкет','Хлюпик','Тормоз','Балбес','Лопух',
    'Тюфяк','Заморыш','Пузан','Пельмень','Кочерыжка','Шнурок','Обормот',
    'Кабачок','Мокрый Носок','Кривой Шнурок','Тормозной','Клоп',
    'Пузатый Шкет','Малявка','Руки-Крюки','Горе-Авторитет','Гремлин',
    'Пельмень Без Вилки','Шнурок Без Ботинка','Тапок','Сопливый Шкет','Чайник',
    'Криворукий','Недомерок','Забытый','Ходячая Ошибка','Кривой Прицел',
    'Потеряшка','Мелкий Косяк','Шмоня','Картонный Боец','Голова-Кирпич',
    'Сбитый Прицел','Герой Очереди','Местный Балбес','Почти Пацан'
  ];

  function st() {
    try { if (typeof window.getGameState === 'function') return window.getGameState(); } catch (e) {}
    return window.s || null;
  }
  function save() {
    try { if (typeof window.saveGame === 'function') window.saveGame(); } catch (e) {}
  }
  function ui() {
    try { if (typeof window.ui === 'function') window.ui(); } catch (e) {}
  }
  function msg(t) {
    if (typeof window.msg === 'function') { try { window.msg(t); return; } catch (e) {} }
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function ensureState(s) {
    if (!s) return;
    if (!s.onboarding || typeof s.onboarding !== 'object') {
      s.onboarding = { done: false, step: 0, nameGiven: false, practiceTaps: 0, tipsShown: {}, unlocked: {} };
    }
    if (typeof s.onboarding.done !== 'boolean') s.onboarding.done = false;
    if (typeof s.onboarding.step !== 'number') s.onboarding.step = 0;
    if (typeof s.onboarding.nameGiven !== 'boolean') s.onboarding.nameGiven = false;
    if (typeof s.onboarding.practiceTaps !== 'number') s.onboarding.practiceTaps = 0;
    if (!s.onboarding.tipsShown) s.onboarding.tipsShown = {};
    if (!s.onboarding.unlocked) s.onboarding.unlocked = {};
  }

  function isDone(s) {
    ensureState(s);
    return !!(s && s.onboarding && s.onboarding.done);
  }

  /* ========== SPOTLIGHT UI ========== */
  var overlayEl = null;
  var holeEl = null;
  var tipEl = null;

  function ensureSpotlightDOM() {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.id = 'onboarding-overlay';
    overlayEl.innerHTML =
      '<div id="onboarding-hole"></div>' +
      '<div id="onboarding-tip">' +
        '<div id="onboarding-tip-kicker"></div>' +
        '<div id="onboarding-tip-text"></div>' +
        '<div id="onboarding-tip-actions"></div>' +
      '</div>';
    document.body.appendChild(overlayEl);

    var style = document.createElement('style');
    style.id = 'onboarding-styles';
    style.textContent =
      '#onboarding-overlay{position:fixed;inset:0;z-index:99990;pointer-events:none;display:none}' +
      '#onboarding-overlay.active{display:block}' +
      '#onboarding-hole{position:absolute;border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,0,.72);transition:all .28s ease;pointer-events:none}' +
      '#onboarding-tip{position:absolute;max-width:min(320px,calc(100vw - 32px));background:#1c1c1f;border:1px solid #665329;border-radius:14px;padding:14px 16px;color:#f0e6c8;font-size:14px;line-height:1.4;box-shadow:0 10px 28px rgba(0,0,0,.45);pointer-events:auto;z-index:99991}' +
      '#onboarding-tip-kicker{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#c9a227;margin-bottom:6px}' +
      '#onboarding-tip-text{margin-bottom:12px}' +
      '#onboarding-tip-actions{display:flex;gap:8px;flex-wrap:wrap}' +
      '#onboarding-tip-actions button{flex:1;min-width:110px;padding:10px 12px;border-radius:10px;border:1px solid #665329;background:#2a2418;color:#f0e6c8;font-size:13px;cursor:pointer}' +
      '#onboarding-tip-actions button.primary{background:#c9a227;color:#1a1408;border-color:#c9a227;font-weight:600}' +
      '#onboarding-tip-actions button:active{transform:scale(.97)}' +
      'body.onboarding-lock #bottom-bar,body.onboarding-lock #settings-gear-button{pointer-events:none;opacity:.35}';
    document.head.appendChild(style);

    holeEl = document.getElementById('onboarding-hole');
    tipEl = document.getElementById('onboarding-tip');
  }

  function showSpotlight(targetSelector, options) {
    ensureSpotlightDOM();
    options = options || {};
    var target = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;

    overlayEl.classList.add('active');
    document.body.classList.add('onboarding-lock');
    tipEl.style.transform = '';

    if (target) {
      var rect = target.getBoundingClientRect();
      var pad = options.padding != null ? options.padding : 10;
      holeEl.style.display = 'block';
      holeEl.style.left = (rect.left - pad) + 'px';
      holeEl.style.top = (rect.top - pad) + 'px';
      holeEl.style.width = (rect.width + pad * 2) + 'px';
      holeEl.style.height = (rect.height + pad * 2) + 'px';
      holeEl.style.borderRadius = (options.radius != null ? options.radius : 16) + 'px';

      var tipWidth = Math.min(320, window.innerWidth - 32);
      var tipLeft = Math.max(16, Math.min(window.innerWidth - tipWidth - 16, rect.left + rect.width / 2 - tipWidth / 2));
      var tipTop;
      if (rect.top > window.innerHeight * 0.45) {
        tipTop = rect.top - 12 - 150;
        if (tipTop < 16) tipTop = rect.bottom + 12;
      } else {
        tipTop = rect.bottom + 12;
      }
      tipEl.style.left = tipLeft + 'px';
      tipEl.style.top = Math.max(16, Math.min(tipTop, window.innerHeight - 180)) + 'px';
    } else {
      holeEl.style.display = 'none';
      tipEl.style.left = '50%';
      tipEl.style.top = '40%';
      tipEl.style.transform = 'translate(-50%,-50%)';
    }

    document.getElementById('onboarding-tip-kicker').textContent = options.kicker || 'ОБУЧЕНИЕ';
    document.getElementById('onboarding-tip-text').innerHTML = options.text || '';

    var actions = document.getElementById('onboarding-tip-actions');
    actions.innerHTML = '';
    if (options.buttons && options.buttons.length) {
      options.buttons.forEach(function (b) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = b.label;
        if (b.primary) btn.className = 'primary';
        btn.onclick = function () { if (b.onClick) b.onClick(); };
        actions.appendChild(btn);
      });
    }
  }

  function hideSpotlight() {
    if (overlayEl) overlayEl.classList.remove('active');
    document.body.classList.remove('onboarding-lock');
  }

  /* ========== STEPS ========== */
  function goToStep(step) {
    var s = st();
    if (!s) return;
    ensureState(s);
    s.onboarding.step = step;
    save();
    runStep(step);
  }

  function finishOnboarding() {
    var s = st();
    if (!s) return;
    ensureState(s);
    s.onboarding.done = true;
    s.onboarding.unlocked = { shop: true, rank: true, tasks: true, more: true };
    save();
    hideSpotlight();
    ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.display = ''; el.style.opacity = '1'; el.style.pointerEvents = ''; }
    });
    msg('Обучение завершено. Удачи в зоне!');
  }

  function runStep(step) {
    var s = st();
    if (!s || isDone(s)) { hideSpotlight(); return; }

    if (step < 6) {
      ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    }

    switch (step) {
      case 0:
        showSpotlight('#tap-object', {
          kicker: 'НАЧАЛО',
          text: 'Это <b>груша</b>. Тапай по ней, чтобы зарабатывать ресурсы и расти в масти.',
          padding: 14,
          buttons: [{ label: 'Дальше', primary: true, onClick: function () { goToStep(1); } }]
        });
        break;

      case 1:
        showSpotlight('.resource-chifir', {
          kicker: 'РЕСУРСЫ',
          text: '<b>Чефир 🍵</b> — основная валюта. Трать его в Качалке на силу, крит и энергию.',
          padding: 8,
          buttons: [{ label: 'Дальше', primary: true, onClick: function () { goToStep(2); } }]
        });
        break;

      case 2:
        showSpotlight('.resource-points', {
          kicker: 'РЕСУРСЫ',
          text: '<b>Понты ⭐</b> — твой авторитет. Чем больше понтов, тем выше масть.',
          padding: 8,
          buttons: [{ label: 'Дальше', primary: true, onClick: function () { goToStep(3); } }]
        });
        break;

      case 3:
        showSpotlight('.resource-energy', {
          kicker: 'РЕСУРСЫ',
          text: '<b>Энергия ⚡</b> тратится на тапы. Она медленно восстанавливается сама.',
          padding: 8,
          buttons: [{ label: 'Дальше', primary: true, onClick: function () { goToStep(4); } }]
        });
        break;

      case 4:
        s.onboarding.practiceTaps = 0;
        save();
        showSpotlight('#tap-object', {
          kicker: 'ПРАКТИКА',
          text: 'Тапани по груше <b>' + REQUIRED_PRACTICE_TAPS + ' раз</b>, чтобы почувствовать игру.',
          padding: 14,
          buttons: []
        });
        break;

      case 5:
        hideSpotlight();
        openNameEvent(function () { goToStep(6); });
        break;

      case 6:
        var shopBtn = document.getElementById('btn-shop');
        if (shopBtn) {
          shopBtn.style.display = '';
          shopBtn.style.opacity = '1';
          shopBtn.style.pointerEvents = 'auto';
        }
        showSpotlight('#btn-shop', {
          kicker: 'МЕНЮ',
          text: 'Это <b>Качалка</b>. Здесь прокачивают силу и покупают улучшения за чефир.',
          padding: 8,
          buttons: [{
            label: 'Открыть Качалку',
            primary: true,
            onClick: function () {
              hideSpotlight();
              var b = document.getElementById('btn-shop');
              if (b) b.click();
              setTimeout(function () { goToStep(7); }, 450);
            }
          }]
        });
        break;

      case 7:
        var eqBtn = document.getElementById('shop-eq-btn');
        if (eqBtn) {
          showSpotlight('#shop-eq-btn', {
            kicker: 'СНАРЯЖЕНИЕ',
            text: 'Здесь <b>оружие и броня</b>. Часть шмота можно достать бесплатно в Бараке и на рейдах.',
            padding: 8,
            buttons: [{
              label: 'Понятно',
              primary: true,
              onClick: function () {
                var close = document.getElementById('modal-close');
                if (close) close.click();
                goToStep(8);
              }
            }]
          });
        } else {
          goToStep(8);
        }
        break;

      case 8:
        // Кнопка рейдов — только показ с пояснением, без входа в бой
        var raidBtn = document.getElementById('raid-open-button');
        if (raidBtn) {
          raidBtn.style.display = '';
          raidBtn.style.opacity = '1';
          raidBtn.style.pointerEvents = 'none'; // не даём открыть во время обучения
          showSpotlight('#raid-open-button', {
            kicker: 'РЕЙДЫ',
            text: 'Это <b>Рейды</b>. Здесь можно сражаться с бойцами зоны и получать награды, в том числе шмот.',
            padding: 10,
            buttons: [{
              label: 'Дальше',
              primary: true,
              onClick: function () {
                if (raidBtn) raidBtn.style.pointerEvents = '';
                goToStep(9);
              }
            }]
          });
        } else {
          goToStep(9);
        }
        break;

      case 9:
        ['btn-rank','btn-tasks','btn-more'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.style.display = ''; el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
        });
        showSpotlight(null, {
          kicker: 'ГОТОВО',
          text: 'Теперь тебе открыты <b>Масть</b>, <b>Поручения</b> и <b>Барак</b>.<br>Тапай, качайся и поднимай авторитет.',
          buttons: [{ label: 'Начать игру', primary: true, onClick: finishOnboarding }]
        });
        break;

      default:
        finishOnboarding();
    }
  }

  /* ========== NAME EVENT ========== */
  var nameCallback = null;

  function openNameEvent(cb) {
    nameCallback = cb || null;
    var s = st();
    if (!s) return;
    ensureState(s);
    if (s.onboarding.nameGiven) {
      if (nameCallback) nameCallback();
      return;
    }

    var overlay = document.getElementById('modal-overlay');
    var content = document.getElementById('modal-content');
    if (!overlay || !content) {
      if (nameCallback) nameCallback();
      return;
    }

    content.innerHTML =
      '<div class="section-window event-window">' +
        '<div class="section-kicker">ПОГРЕМУХА</div>' +
        '<h2>📛 Как тебя звать?</h2>' +
        '<p>В камере уже присматриваются. От твоего ответа зависит, какую кличку тебе дадут.</p>' +
        '<p><b>Выбери, как ответить:</b></p>' +
        '<div class="choices">' +
          '<button type="button" class="choice" data-style="random">Пусть сами придумают</button>' +
          '<button type="button" class="choice" data-style="tough">Хочу звучать пожёстче</button>' +
          '<button type="button" class="choice" data-style="calm">Лучше что-то поспокойнее</button>' +
          '<button type="button" class="choice" data-style="custom">Сам скажу (за рекламу)</button>' +
        '</div>' +
      '</div>';

    overlay.classList.remove('hidden');
    overlay.classList.add('show');
    overlay.dataset.locked = '1';
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.style.visibility = 'hidden';

    content.querySelectorAll('.choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleNameChoice(btn.getAttribute('data-style'));
      });
    });
  }

  function applyName(name) {
    var s = st();
    if (!s) return;
    ensureState(s);
    s.nickname = String(name || '').slice(0, 16);
    s.onboarding.nameGiven = true;
    save();
    ui();
    msg('Отныне ты — «' + s.nickname + '»');

    var overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.dataset.locked = '0';
      overlay.classList.add('hidden');
      overlay.classList.remove('show');
    }
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.style.visibility = '';

    if (nameCallback) {
      var cb = nameCallback;
      nameCallback = null;
      setTimeout(cb, 300);
    }
  }

  function handleNameChoice(style) {
    if (style === 'custom') { openCustomName(); return; }
    var list = NAMES_RANDOM;
    if (style === 'tough') list = NAMES_TOUGH;
    else if (style === 'calm') list = NAMES_CALM;
    applyName(pick(list));
  }

  function openCustomName() {
    var overlay = document.getElementById('modal-overlay');
    var content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    var s = st();
    var cur = (s && s.nickname) ? s.nickname : 'Салага';

    content.innerHTML =
      '<div class="section-window">' +
        '<div class="section-kicker">СВОЯ КЛИЧКА</div>' +
        '<h2>Как тебя звать?</h2>' +
        '<p>Сейчас: <b>' + cur + '</b></p>' +
        '<input id="onboard-rename-input" type="text" maxlength="16" placeholder="Например: Кеша" ' +
          'style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid #665329;background:#1a1a1c;color:#fff;font-size:16px;margin-top:8px">' +
        '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' +
          '<button type="button" id="onboard-rename-ad" class="npc-primary" style="flex:1">📺 Получить кличку за рекламу</button>' +
          '<button type="button" id="onboard-rename-back" class="npc-choice">Назад</button>' +
        '</div>' +
      '</div>';

    var input = document.getElementById('onboard-rename-input');
    if (input) setTimeout(function () { input.focus(); }, 80);

    document.getElementById('onboard-rename-back').onclick = function () {
      openNameEvent(nameCallback);
    };

    document.getElementById('onboard-rename-ad').onclick = function () {
      var name = String((input && input.value) || '').replace(/[^\w\u0400-\u04FF\- ]/g, '').trim().slice(0, 16);
      if (!name) { msg('Введи кличку'); return; }
      var btn = document.getElementById('onboard-rename-ad');
      if (typeof window.showRewardedAd === 'function') {
        btn.disabled = true;
        btn.textContent = 'Смотри рекламу…';
        window.showRewardedAd(function (ok) {
          btn.disabled = false;
          btn.textContent = '📺 Получить кличку за рекламу';
          if (!ok) { msg('Реклама не просмотрена'); return; }
          applyName(name);
        });
      } else {
        applyName(name);
      }
    };
  }

  /* ========== TAP HOOK ========== */
  function onTap() {
    var s = st();
    if (!s || isDone(s)) return;
    ensureState(s);
    if (s.onboarding.step === 4) {
      s.onboarding.practiceTaps = (s.onboarding.practiceTaps || 0) + 1;
      var left = REQUIRED_PRACTICE_TAPS - s.onboarding.practiceTaps;
      save();
      if (left > 0) {
        var textEl = document.getElementById('onboarding-tip-text');
        if (textEl) textEl.innerHTML = 'Тапани ещё <b>' + left + '</b> раз' + (left > 1 ? 'а' : '') + '.';
      } else {
        goToStep(5);
      }
    }
  }

  /* ========== BOOT ========== */
  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var s = st();
      if (!s && tries < 60) return;
      clearInterval(timer);
      if (!s) return;

      ensureState(s);
      var taps = Math.max(0, Number(s.totalTaps) || 0);
      var nick = String(s.nickname || '').trim();

      if (!s.onboarding.done) {
        if ((nick && nick !== 'Салага' && nick !== 'Новичок') || taps > 80) {
          s.onboarding.done = true;
          s.onboarding.nameGiven = true;
          s.onboarding.unlocked = { shop: true, rank: true, tasks: true, more: true };
          save();
        }
      }

      if (!s.onboarding.nameGiven && (!nick || nick === '')) {
        s.nickname = 'Салага';
        save();
        ui();
      }

      if (!window.__onboardingTapHooked) {
        window.__onboardingTapHooked = true;
        var lastTaps = -1;
        setInterval(function () {
          var gs = st();
          if (!gs) return;
          var t = Math.max(0, Number(gs.totalTaps) || 0);
          if (t !== lastTaps) {
            lastTaps = t;
            onTap();
          }
        }, 200);
      }

      if (isDone(s)) {
        ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.style.display = ''; el.style.opacity = '1'; }
        });
        return;
      }

      setTimeout(function () {
        runStep(s.onboarding.step || 0);
      }, 700);

      console.log('[onboarding] v2.0 spotlight ready, step=', s.onboarding.step);
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.AVT_Onboarding = {
    goToStep: goToStep,
    finish: finishOnboarding,
    isDone: function () { return isDone(st()); }
  };
})();
