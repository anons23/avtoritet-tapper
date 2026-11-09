/* onboarding.js v3.9-practice-fix — practice taps without energy dependency; ads untouched */
'use strict';
(function () {
  var NAME_TRIGGER_TAPS = 20;
  var REQUIRED_PRACTICE_TAPS = 8;

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
    // Separate an explicitly chosen nickname from a placeholder/legacy auto-assigned nickname.
    if (typeof s.onboarding.nicknameChoiceDone !== 'boolean') s.onboarding.nicknameChoiceDone = false;
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
      '#onboarding-overlay.card-mode{pointer-events:auto;background:rgba(0,0,0,.72)}' +
      '#onboarding-hole{position:absolute;border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,0,.72);transition:all .28s ease;pointer-events:none}' +
      '#onboarding-tip{position:absolute;width:min(340px,calc(100vw - 32px));max-width:calc(100vw - 32px);max-height:min(70vh,520px);display:flex;flex-direction:column;box-sizing:border-box;background:#1c1c1f;border:1px solid #665329;border-radius:16px;padding:14px 16px;color:#f0e6c8;font-size:14px;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,.5);pointer-events:auto;z-index:99991}' +
      '#onboarding-tip.card{left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;right:auto!important;bottom:auto!important}' +
      '#onboarding-tip-kicker{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#c9a227;margin-bottom:8px;flex:0 0 auto}' +
      '#onboarding-tip-text{margin:0 0 12px;flex:1 1 auto;min-height:0;max-height:none;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}' +
      '#onboarding-tip-text ul{margin:8px 0 8px 18px;padding:0}' +
      '#onboarding-tip-text li{margin:0 0 6px}' +
      '#onboarding-tip-actions{display:flex;gap:8px;flex-wrap:wrap;flex:0 0 auto}' +
      '#onboarding-tip-actions button{flex:1;min-width:110px;padding:12px 14px;border-radius:12px;border:1px solid #665329;background:#2a2418;color:#f0e6c8;font-size:14px;cursor:pointer}' +
      '#onboarding-tip-actions button.primary{background:#c9a227;color:#1a1408;border-color:#c9a227;font-weight:700}' +
      '#onboarding-tip-actions button:active{transform:scale(.97)}' +
      '#onboarding-tip-actions button.onboarding-skip{flex:0 0 100%;background:#242424;border-color:#555;color:#bbb;font-size:12px;padding:9px}' +
      'body.onboarding-lock #bottom-nav,body.onboarding-lock .bottom-nav,body.onboarding-lock #settings-gear-button{pointer-events:none;opacity:.35}';
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

    tipEl.classList.remove('card');
    overlayEl.classList.remove('card-mode');
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
      tipEl.style.top = Math.max(16, Math.min(tipTop, window.innerHeight - 200)) + 'px';
      tipEl.style.width = tipWidth + 'px';
      tipEl.style.maxHeight = 'min(42vh, 320px)';
    } else {
      holeEl.style.display = 'none';
      overlayEl.classList.add('card-mode');
      tipEl.classList.add('card');
      tipEl.style.left = '';
      tipEl.style.top = '';
      tipEl.style.width = '';
      tipEl.style.maxHeight = '';
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
    if (Number(window.__AVT_ONBOARDING_STEP) >= 0 && Number(window.__AVT_ONBOARDING_STEP) < 13) {
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.textContent = 'Пропустить обучение';
      skip.className = 'onboarding-skip';
      skip.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        finishOnboarding(true);
      };
      actions.appendChild(skip);
    }
  }

  function hideSpotlight() {
    if (overlayEl) {
      overlayEl.classList.remove('active');
      overlayEl.classList.remove('card-mode');
    }
    if (tipEl) {
      tipEl.classList.remove('card');
      tipEl.style.transform = '';
      tipEl.style.width = '';
      tipEl.style.maxHeight = '';
    }
    document.body.classList.remove('onboarding-lock');
  }

  function goToStep(step) {
    var s = st();
    if (!s) return;
    ensureState(s);
    s.onboarding.step = step;
    save();
    runStep(step);
  }

  function finishOnboarding() {
    window.__AVT_ONBOARDING_ACTIVE = false;
    window.__AVT_ONBOARDING_STEP = -1;
    var s = st();
    if (!s) return;
    ensureState(s);
    // The nickname card must appear after either completing or skipping the tutorial.
    // Do not infer completion from nickname: older builds assigned nicknames automatically.
    if (!s.onboarding.nicknameChoiceDone) s.onboarding.nameGiven = false;
    s.onboarding.done = true;
    s.onboarding.unlocked = { shop: true, rank: true, tasks: true, more: true };
    if (!s.onboarding.starterPack) {
      s.onboarding.starterPack = true;
      s.chifir = (Number(s.chifir) || 0) + 100;
      s.boosters = s.boosters || { double: 0 };
      s.boosters.double = (Number(s.boosters.double) || 0) + 80;
      if (typeof s.maxEnergy === 'number' && s.maxEnergy < 350) s.maxEnergy = 350;
      if (typeof s.energy === 'number') s.energy = Math.min(s.maxEnergy, Math.max(Number(s.energy) || 0, 350));
    }
    save();
    hideSpotlight();
    ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.display = ''; el.style.opacity = '1'; el.style.pointerEvents = ''; }
    });
    if (typeof ui === 'function') try { ui(); } catch (e) {}
    if (typeof window.ui === 'function') try { window.ui(); } catch (e) {}
    msg('Обучение завершено! +100 🍵 и 80 тапов ×2 — вперёд!');
    // Open the existing nickname-choice card after the game UI has finished refreshing.
    if (!s.onboarding.nicknameChoiceDone) {
      setTimeout(function () {
        var live = st();
        if (live && live.onboarding && !live.onboarding.nicknameChoiceDone) openNameEvent();
      }, 250);
    }
  }

  function runStep(step) {
    var s = st();
    if (!s || isDone(s)) { hideSpotlight(); return; }
    window.__AVT_ONBOARDING_ACTIVE = true;
    window.__AVT_ONBOARDING_STEP = step;

    ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.display = step < 6 ? 'none' : '';
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    });

    switch (step) {
      case 0:
        showSpotlight('#tap-object', { kicker:'НАЧАЛО', text:'Это <b>груша</b>. Тапай по ней, чтобы зарабатывать ресурсы и расти в масти.', padding:14 });
        break;
      case 1:
        showSpotlight('.resource-chifir', { kicker:'РЕСУРСЫ', text:'<b>Чефир 🍵</b> — основная валюта. Трать его в Качалке на улучшения.', padding:8 });
        break;
      case 2:
        showSpotlight('.resource-points', { kicker:'РЕСУРСЫ', text:'<b>Понты ⭐</b> — твой авторитет. Чем больше понтов, тем выше масть.', padding:8 });
        break;
      case 3:
        showSpotlight('.resource-energy', { kicker:'РЕСУРСЫ', text:'<b>Энергия ⚡</b> тратится на действия. Она постепенно восстанавливается сама.', padding:8 });
        break;
      case 4:
        s.onboarding.practiceTaps = 0;
        try {
          if (typeof s.maxEnergy === 'number') {
            s.energy = Math.max(Number(s.energy) || 0, Math.min(s.maxEnergy, Math.max(50, REQUIRED_PRACTICE_TAPS + 15)));
          }
        } catch (e) {}
        save();
        showSpotlight('#tap-object', {
          kicker: 'ПРАКТИКА',
          text: 'Тапни по груше <b>' + REQUIRED_PRACTICE_TAPS + ' раз</b> (0/' + REQUIRED_PRACTICE_TAPS + '). Энергия на практику есть.',
          padding: 14,
          buttons: [{
            label: 'Дальше →',
            primary: true,
            onClick: function () {
              var cur = st();
              if (!cur) return;
              ensureState(cur);
              if (cur.onboarding.step !== 4) return;
              var n = Number(cur.onboarding.practiceTaps) || 0;
              if (n >= 3) {
                goToStep(5);
              } else {
                var te = document.getElementById('onboarding-tip-text');
                if (te) te.innerHTML = 'Сделай минимум <b>3 тапа</b> по груше, потом жми «Дальше». Сейчас: ' + n + '/3';
              }
            }
          }]
        });
        break;
      case 5:
        goToStep(6);
        break;
      case 6:
        showSpotlight('#btn-shop', { kicker:'КАЧАЛКА', text:'Нажми на <b>Качалку</b>, чтобы посмотреть, где развивать персонажа.', padding:8 });
        break;
      case 7:
        showSpotlight('#modal', { kicker:'КАЧАЛКА', text:'Здесь можно улучшать персонажа и просматривать доступную экипировку.', padding:8 });
        break;
      case 8:
        showSpotlight('#raid-open-button', { kicker:'РЕЙДЫ', text:'Здесь можно выбирать бойцов и участвовать в сражениях за награды.', padding:10 });
        break;
      case 9:
        showSpotlight('#booster-open-button', { kicker:'БОНУС ×2', text:'Открой эту кнопку. За просмотр рекламы можно получить <b>×2 награды за обычные тапы</b> на следующие 100 тапов. Бонус помогает быстрее копить чефир и понты.', padding:8 });
        break;
      case 10:
        showSpotlight('#btn-rank', { kicker:'МАСТЬ', text:'Здесь отображается твоя <b>масть</b> и продвижение по рангам.', padding:8 });
        break;
      case 11:
        showSpotlight('#btn-tasks', { kicker:'ПОРУЧЕНИЯ', text:'В <b>Поручениях</b> собраны цели и задания, за которые можно получать награды.', padding:8 });
        break;
      case 12:
        showSpotlight('#btn-more', { kicker:'БАРАК', text:'Открой <b>Барак</b>: внутри объясним, зачем разговаривать с персонажами и помогать им решать проблемы.', padding:8 });
        break;
      case 13:
        showSpotlight(null, {
          kicker: 'БАРАК',
          text:
            '<b>Зачем заходить в Барак?</b><br>' +
            'Здесь живут <b>персонажи зоны</b>. У каждого свои дела и просьбы. Общайся и решай, как поступить — от ответов зависит награда.<br><br>' +
            '<b>Что можно получить:</b>' +
            '<ul>' +
            '<li><b>Чефир 🍵</b> — на прокачку</li>' +
            '<li><b>Понты ⭐</b> — рост масти</li>' +
            '<li><b>Энергия ⚡</b> — тапать дольше</li>' +
            '<li><b>Отношения</b> — лучше диалоги</li>' +
            '</ul>' +
            '<b>3 ступени развития</b><br>' +
            'Чем выше доверие, тем жирнее награды. На высоких ступенях может выпасть <b>шмот или оружие</b>.<br><br>' +
            'Зашёл → поговорил → забрал плюшки. Так и качают авторитет.',
          buttons: [{ label: 'Понятно братуха!', primary: true, onClick: finishOnboarding }]
        });
        break;
      default:
        finishOnboarding();
    }
  }

  function advanceFromTap(step) {
    if (step === 0) goToStep(1);
    else if (step === 1) goToStep(2);
    else if (step === 2) goToStep(3);
    else if (step === 3) goToStep(4);
    else if (step === 6) {
      var shop = document.getElementById('btn-shop');
      if (shop) { window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK = true; shop.click(); window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK = false; }
      setTimeout(function () { goToStep(7); }, 250);
    } else if (step === 10) goToStep(11);
    else if (step === 11) goToStep(12);
    else if (step === 12) goToStep(13);
    else if (step === 13) finishOnboarding();
  }

  function bindOnboardingInput() {
    if (window.__AVT_ONBOARDING_INPUT_BOUND) return;
    window.__AVT_ONBOARDING_INPUT_BOUND = true;
    document.addEventListener('pointerdown', function (e) {
      if (window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK) return;
      if (e.target && e.target.closest && e.target.closest('#onboarding-tip-actions button')) return;
      var ps = st();
      if (!ps || isDone(ps) || !ps.onboarding) return;
      var pstep = ps.onboarding.step;
      if (pstep >= 0 && pstep <= 3) {
        e.preventDefault(); e.stopImmediatePropagation();
        window.__AVT_ONBOARDING_SUPPRESS_CLICK = true;
        advanceFromTap(pstep);
      } else if (pstep === 4 && !(e.target && e.target.closest && (e.target.closest('#tap-object') || e.target.closest('#tap-area') || e.target.closest('#object-emoji')))) {
        e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener('click', function (e) {
      if (window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK) return;
      if (e.target && e.target.closest && e.target.closest('#onboarding-tip-actions button')) return;
      if (window.__AVT_ONBOARDING_SUPPRESS_CLICK) {
        window.__AVT_ONBOARDING_SUPPRESS_CLICK = false;
        e.preventDefault(); e.stopImmediatePropagation(); return;
      }
      var s = st();
      if (!s || isDone(s) || !s.onboarding) return;
      var step = s.onboarding.step;
      if (step === 5) return;
      var isPear = !!(e.target && e.target.closest && (e.target.closest('#tap-object') || e.target.closest('#tap-area') || e.target.closest('#object-emoji')));
      if (step === 4) {
        if (!isPear) { e.preventDefault(); e.stopImmediatePropagation(); }
        return;
      }
      if (step === 6) {
        var allowed = !!(e.target && e.target.closest && e.target.closest('#btn-shop'));
        if (!allowed) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        e.preventDefault(); e.stopImmediatePropagation(); advanceFromTap(step); return;
      }
      if (step === 7) {
        if (e.target && e.target.closest && !e.target.closest('#modal-close')) hideSpotlight();
        if (e.target && e.target.closest && e.target.closest('#modal-close')) {
          setTimeout(function () {
            var overlay = document.getElementById('modal-overlay');
            if (!overlay || overlay.classList.contains('hidden') || !overlay.classList.contains('show')) goToStep(8);
          }, 180);
        }
        return;
      }
      if (step === 8) {
        if (e.target && e.target.closest && e.target.closest('#raid-open-button')) {
          window.__AVT_TUTORIAL_RAIDS_OPEN = true;
          return;
        }
        return;
      }
      if (step === 9) {
        if (e.target && e.target.closest && e.target.closest('#booster-open-button')) return;
        return;
      }
      if (step === 10 || step === 11 || step === 12) {
        var ids = {10:'#btn-rank',11:'#btn-tasks',12:'#btn-more'};
        var sel = ids[step];
        var ok = !!(e.target && e.target.closest && e.target.closest(sel));
        if (!ok) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        e.preventDefault(); e.stopImmediatePropagation();
        advanceFromTap(step);
        return;
      }
    }, true);
  }

  /* ========== NAME EVENT (end of tutorial) ========= */
  function openNameEvent(done) {
    var s = st();
    if (!s) return;
    ensureState(s);
    if (s.onboarding.nicknameChoiceDone) { if (done) done(); return; }

    var tough = pick(NAMES_TOUGH);
    var calm = pick(NAMES_CALM);
    var rnd = pick(NAMES_RANDOM);

    function applyName(name) {
      var live = st();
      if (!live) return;
      ensureState(live);
      live.nickname = name;
      live.onboarding.nameGiven = true;
      live.onboarding.nicknameChoiceDone = true;
      save();
      ui();
      msg('Теперь тебя зовут «' + name + '»');
      hideSpotlight();
      if (done) done();
    }

    showSpotlight(null, {
      kicker: 'КЛИЧКА',
      text: 'Выбери кличку или возьми случайную.',
      buttons: [
        { label: 'Крутая / жёсткая', primary: true, onClick: function () { applyName(tough); } },
        { label: 'Спокойная / нейтральная', onClick: function () { applyName(calm); } },
        { label: 'Случайная смешная', onClick: function () { applyName(rnd); } }
      ]
    });
  }

  var __practiceLastAt = 0;
  function notePracticeTap(source) {
    var s = st();
    if (!s || isDone(s)) return;
    ensureState(s);
    if (s.onboarding.step !== 4) return;
    var now = Date.now();
    if (now - __practiceLastAt < 120) return;
    __practiceLastAt = now;
    try {
      if (typeof s.energy === 'number' && typeof s.maxEnergy === 'number' && s.energy < 8) {
        s.energy = Math.min(s.maxEnergy, Math.max(s.energy, 40));
      }
    } catch (e) {}
    s.onboarding.practiceTaps = (Number(s.onboarding.practiceTaps) || 0) + 1;
    var done = s.onboarding.practiceTaps;
    var left = Math.max(0, REQUIRED_PRACTICE_TAPS - done);
    save();
    var textEl = document.getElementById('onboarding-tip-text');
    if (textEl) {
      if (left > 0) {
        textEl.innerHTML = 'Тапай: <b>' + done + '/' + REQUIRED_PRACTICE_TAPS + '</b>. Ещё ' + left + '.';
      } else {
        textEl.innerHTML = 'Готово! Переходим дальше…';
      }
    }
    if (left <= 0) {
      setTimeout(function () {
        var live = st();
        if (live && live.onboarding && live.onboarding.step === 4) goToStep(5);
      }, 180);
    }
  }
  function onTap() { notePracticeTap('totalTaps'); }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var s = st();
      if (!s && tries < 300) return;
      clearInterval(timer);
      if (!s) {
        setTimeout(boot, 1000);
        return;
      }

      ensureState(s);
      var nick = String(s.nickname || '').trim();

      if (Number(s.onboarding.tutorialVersion || 0) < 8) {
        s.onboarding.tutorialVersion = 8;
        s.onboarding.done = false;
        s.onboarding.step = 0;
        s.onboarding.nameGiven = !!(nick && nick !== 'Салага' && nick !== 'Новичок');
        s.onboarding.practiceTaps = 0;
        save();
      }

      if (!s.onboarding.nameGiven && !nick) {
        s.nickname = 'Салага';
        save();
        ui();
      }

      if (!window.__onboardingTapHooked) {
        window.__onboardingTapHooked = true;
        document.addEventListener('pointerdown', function (e) {
          try {
            var gs = st();
            if (!gs || isDone(gs) || !gs.onboarding || gs.onboarding.step !== 4) return;
            var t = e.target;
            if (!t || !t.closest) return;
            if (t.closest('#tap-object') || t.closest('#tap-area') || t.closest('#object-emoji') || t.closest('#object-name') || t.closest('#object-action')) {
              notePracticeTap('pointer');
            }
          } catch (err) {}
        }, true);
        var lastTaps = -1;
        setInterval(function () {
          var gs = st();
          if (!gs || isDone(gs) || !gs.onboarding || gs.onboarding.step !== 4) return;
          var t = Math.max(0, Number(gs.totalTaps) || 0);
          if (lastTaps < 0) { lastTaps = t; return; }
          if (t > lastTaps) {
            lastTaps = t;
            notePracticeTap('totalTaps');
          }
        }, 250);
      }

      if (isDone(s)) {
        ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.style.display = ''; el.style.opacity = '1'; }
        });
        return;
      }

      bindOnboardingInput();
      window.__AVT_ONBOARDING_ACTIVE = true;

      // Wait for preloader if present
      function startWhenReady() {
        var pre = document.getElementById('preloader');
        if (pre && pre.style && pre.style.display !== 'none' && !pre.classList.contains('hidden') && !pre.classList.contains('done')) {
          setTimeout(startWhenReady, 200);
          return;
        }
        runStep(s.onboarding.step || 0);
      }
      startWhenReady();

      console.log('[onboarding] v3.9-practice-fix ready, step=', s.onboarding.step);
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
    isDone: function () { return isDone(st()); },
    openNameEvent: openNameEvent
  };
})();
