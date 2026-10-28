/* onboarding.js v3.0 — launch tutorial immediately on every first session after update */
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
      '#onboarding-tip{position:absolute;max-width:min(320px,calc(100vw - 32px));background:#1c1c1f;border:1px solid #665329;border-radius:14px;padding:14px 16px;color:#f0e6c8;font-size:14px;line-height:1.4;box-shadow:0 10px 28px rgba(0,0,0,.45);pointer-events:none;z-index:99991}' +
      '#onboarding-tip-kicker{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#c9a227;margin-bottom:6px}' +
      '#onboarding-tip-text{margin-bottom:0}' +
      '#onboarding-tip-actions{display:none}' +
      'body.onboarding-lock #bottom-bar,body.onboarding-lock #settings-gear-button{opacity:.35}';
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
    window.__AVT_ONBOARDING_ACTIVE = false;
    window.__AVT_ONBOARDING_STEP = -1;
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
        save();
        showSpotlight('#tap-object', { kicker:'ПРАКТИКА', text:'Тапни по груше <b>' + REQUIRED_PRACTICE_TAPS + ' раз</b>. Остальные кнопки пока заблокированы.', padding:14 });
        break;
      case 5:
        hideSpotlight();
        openNameEvent(function () { goToStep(6); });
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
        showSpotlight(null, { kicker:'ГОТОВО', text:'Ты освоился! Теперь можешь свободно исследовать зону, качаться и повышать авторитет.' });
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
      var ps = st();
      if (!ps || isDone(ps) || !ps.onboarding) return;
      var pstep = ps.onboarding.step;
      if (pstep >= 0 && pstep <= 3) {
        e.preventDefault(); e.stopImmediatePropagation();
        window.__AVT_ONBOARDING_SUPPRESS_CLICK = true;
        advanceFromTap(pstep);
      } else if (pstep === 4 && !(e.target && e.target.closest && e.target.closest('#tap-object'))) {
        e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener('click', function (e) {
      if (window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK) return;
      if (window.__AVT_ONBOARDING_SUPPRESS_CLICK) {
        window.__AVT_ONBOARDING_SUPPRESS_CLICK = false;
        e.preventDefault(); e.stopImmediatePropagation(); return;
      }
      var s = st();
      if (!s || isDone(s) || !s.onboarding) return;
      var step = s.onboarding.step;
      if (step === 5) return;
      var target = e.target && e.target.closest ? e.target.closest('button, a, #tap-object, .resource, #modal-close, #modal, #modal-overlay') : e.target;
      var isPear = !!(e.target && e.target.closest && e.target.closest('#tap-object'));
      var allowed = false;
      if (step === 4) {
        allowed = isPear;
        if (!allowed) { e.preventDefault(); e.stopImmediatePropagation(); }
        return;
      }
      if (step === 6) {
        allowed = !!(e.target && e.target.closest && e.target.closest('#btn-shop'));
        if (!allowed) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        e.preventDefault(); e.stopImmediatePropagation(); advanceFromTap(step); return;
      }
      if (step === 7) {
        // Let the player inspect tabs; hide the coach mark after the first interaction.
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
        // The raids view is intentionally unmasked and fully playable. Wait for the player to close it.
        if (e.target && e.target.closest && e.target.closest('#raid-open-button')) {
          e.preventDefault(); e.stopImmediatePropagation();
          hideSpotlight();
          window.__AVT_TUTORIAL_RAIDS_OPEN = true;
          window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK = true;
          e.target.closest('#raid-open-button').click();
          window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK = false;
          var raidOverlay = document.getElementById('modal-overlay');
          if (raidOverlay && !window.__AVT_TUTORIAL_RAID_CLOSE_WATCHER) {
            window.__AVT_TUTORIAL_RAID_CLOSE_WATCHER = new MutationObserver(function () {
              if (window.__AVT_TUTORIAL_RAIDS_OPEN && (raidOverlay.classList.contains('hidden') || !raidOverlay.classList.contains('show'))) {
                window.__AVT_TUTORIAL_RAIDS_OPEN = false;
                window.__AVT_TUTORIAL_RAID_CLOSE_WATCHER.disconnect();
                window.__AVT_TUTORIAL_RAID_CLOSE_WATCHER = null;
                goToStep(9);
              }
            });
            window.__AVT_TUTORIAL_RAID_CLOSE_WATCHER.observe(raidOverlay, {attributes:true, attributeFilter:['class']});
          }
          return;
        }
        if (window.__AVT_TUTORIAL_RAIDS_OPEN && e.target && e.target.closest && e.target.closest('#raid-menu-close, .raid-menu-close, .raid-close, #raid-back, #modal-close')) {
          window.__AVT_TUTORIAL_RAIDS_OPEN = false;
          setTimeout(function () {
            var overlay = document.getElementById('modal-overlay');
            if (!overlay || overlay.classList.contains('hidden') || !overlay.classList.contains('show')) goToStep(9);
          }, 220);
        }
        return;
      }
      if (step === 9) {
        allowed = !!(e.target && e.target.closest && e.target.closest('#booster-open-button'));
        if (!allowed) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        hideSpotlight();
        var boosterOverlay = document.getElementById('modal-overlay');
        if (boosterOverlay) {
          var boosterObserver = new MutationObserver(function () {
            if (boosterOverlay.classList.contains('hidden') || !boosterOverlay.classList.contains('show')) {
              boosterObserver.disconnect(); goToStep(10);
            }
          });
          boosterObserver.observe(boosterOverlay, {attributes:true, attributeFilter:['class']});
        }
        return;
      }
      if (step === 10 || step === 11) {
        var ids = {10:'#btn-rank',11:'#btn-tasks'};
        allowed = !!(e.target && e.target.closest && e.target.closest(ids[step]));
        if (!allowed) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        hideSpotlight();
        setTimeout(function () {
          var overlay = document.getElementById('modal-overlay');
          if (overlay) {
            var observer = new MutationObserver(function () {
              if (overlay.classList.contains('hidden') || !overlay.classList.contains('show')) {
                observer.disconnect(); goToStep(step + 1);
              }
            });
            observer.observe(overlay, {attributes:true, attributeFilter:['class']});
          }
        }, 100);
        return;
      }
      if (step === 12) {
        allowed = !!(e.target && e.target.closest && e.target.closest('#btn-more'));
        if (!allowed) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        hideSpotlight();
        setTimeout(function () {
          var content = document.getElementById('modal-content');
          var overlay = document.getElementById('modal-overlay');
          if (!content || !overlay || !overlay.classList.contains('show')) return;
          var info = document.createElement('div');
          info.className = 'section-window onboarding-barrack-info';
          info.style.cssText = 'margin:0 0 12px;padding:14px;border:1px solid #665329;border-radius:12px;background:#1c1c1f;color:#f0e6c8';
          info.innerHTML = '<div class="section-kicker">ЗАЧЕМ ОБЩАТЬСЯ С ПЕРСОНАЖАМИ</div><h3>Диалоги, поручения и помощь</h3><p>У каждого НПС свои заботы, просьбы и проблемы. Выбирай ответы в диалогах, выясняй подробности и решай, как поступить: помочь напрямую, договориться, поискать информацию или отказаться.</p><ul><li><b>Награды:</b> за удачные разговоры и помощь можно получать чефир, понты и другие игровые бонусы.</li><li><b>Репутация и доверие:</b> поступки влияют на отношения с персонажами и могут открывать новые варианты общения.</li><li><b>Решение проблем:</b> поручения помогают разобраться в событиях барака, получить полезные сведения и иногда избежать неприятностей. Некоторые решения рискованны — читай варианты и последствия.</li></ul><h4>3 ступени развития персонажа</h4><p>По мере роста отношений и прогресса открываются следующие ступени. С каждой ступенью становятся доступны новые диалоги и более ценные бонусы; чем выше развитие персонажа, тем выгоднее может быть взаимодействие с ним.</p>';
          content.insertBefore(info, content.firstChild);
          var observer = new MutationObserver(function () {
            if (overlay.classList.contains('hidden') || !overlay.classList.contains('show')) {
              observer.disconnect(); goToStep(13);
            }
          });
          observer.observe(overlay, {attributes:true, attributeFilter:['class']});
        }, 180);
        return;
      }
      if (step === 13) {
        e.preventDefault(); e.stopImmediatePropagation(); finishOnboarding(); return;
      }
      // Intro spotlights advance on taps, but never let the underlying game receive that same tap.
      if (step >= 0 && step <= 3) {
        e.preventDefault(); e.stopImmediatePropagation(); advanceFromTap(step);
      }
    }, true);
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
      // The game state can arrive late on slow devices or after a delayed bootstrap.
      // Keep retrying instead of permanently abandoning the tutorial after 12 seconds.
      if (!s && tries < 300) return;
      clearInterval(timer);
      if (!s) {
        setTimeout(boot, 1000);
        return;
      }

      ensureState(s);
      var nick = String(s.nickname || '').trim();

      // Version the tutorial so old saves that were auto-marked as completed can see it.
      // Existing nicknames are preserved and skip the nickname event.
      if (Number(s.onboarding.tutorialVersion || 0) < 6) {
        s.onboarding.tutorialVersion = 6;
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

      bindOnboardingInput();
      window.__AVT_ONBOARDING_ACTIVE = true;
      // Show the first tutorial step as soon as state exists; do not leave a playable gap on slow devices.
      runStep(s.onboarding.step || 0);

      console.log('[onboarding] v3.0 autostart ready, step=', s.onboarding.step);
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
