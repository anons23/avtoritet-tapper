/* onboarding.js v6.0 — tour highlights tabs with a "Понятно" button; windows are not opened during the tour */
'use strict';
(function () {
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
    'Кабачок','Мокрый Носок','Кривой Шнурок','Клоп','Малявка',
    'Тапок','Чайник','Потеряшка','Шмоня','Почти Пацан'
  ];

  var CRIME_OPTIONS = [
    { id: 'grab', label: 'Грабёж', tone: 'serious' },
    { id: 'huligan', label: 'Хулиганка', tone: 'serious' },
    { id: 'razboy', label: 'Разбой', tone: 'serious' },
    { id: 'ugon', label: 'Угон', tone: 'serious' },
    { id: 'tazik', label: 'Кража тазика с рынка', tone: 'funny' },
    { id: 'tires', label: 'Соседу шины порезал — занимал мою парковку!', tone: 'funny' },
    { id: 'scooter', label: 'Снёс остановку на самокате!', tone: 'funny' },
    { id: 'torrent', label: 'Скачал игру с торрента', tone: 'funny' },
    { id: 'crackers', label: 'Утащил сухарики из магазина', tone: 'funny' },
    { id: 'tree', label: 'Срубил ёлку во дворе', tone: 'funny' }
  ];

  var REPLY_SERIOUS = [
    'Серьёзная статья. Тут таких уважают — если не будешь рыпаться.',
    'Понятно. Чефирить будешь по распорядку, без самодеятельности.',
    'Не первый и не последний. Главное — голову на плечах держи.',
    'Ок. За такие дела на зоне быстро учат молчать и работать.'
  ];
  var REPLY_FUNNY = [
    'Ха! Тут таких пол зоны — тазики, самокаты и торренты наперечёт.',
    'Ну ты даёшь… За ерунду б штраф выписали, а тебя сюда привезли.',
    'Смешно. Только не хвастайся этим при авторитетах — поржут.',
    'Классика. За мелкую дичь сел — зато история на весь отряд.'
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
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

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
    /* Existing players already answered (or skipped) the crime question — don't ask again. */
    if (typeof s.onboarding.crimeAsked !== 'boolean') s.onboarding.crimeAsked = !!s.onboarding.nameGiven;
    /* One-time: old saves started with 100 days; new cap is 80. */
    if (!s.onboarding.sentenceCap80) {
      s.onboarding.sentenceCap80 = true;
      if (!s.released && Number(s.sentenceDays) > 80) s.sentenceDays = 80;
    }
  }
  function isDone(s) {
    ensureState(s);
    return !!(s && s.onboarding && s.onboarding.done);
  }

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
      '#onboarding-overlay.card-mode{pointer-events:auto;background:rgba(0,0,0,.78)}' +
      '#onboarding-hole{position:absolute;border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,0,.72);transition:all .28s ease;pointer-events:none}' +
      '#onboarding-tip{position:absolute;width:min(360px,calc(100vw - 28px));max-width:calc(100vw - 28px);max-height:min(78vh,560px);display:flex;flex-direction:column;box-sizing:border-box;background:linear-gradient(180deg,#242018 0%,#1a1712 100%);border:1px solid #8a6d2e;border-radius:18px;padding:16px 16px 14px;color:#f0e6c8;font-size:15px;line-height:1.5;box-shadow:0 16px 40px rgba(0,0,0,.55);pointer-events:auto;z-index:99991}' +
      '#onboarding-tip.card{left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;right:auto!important;bottom:auto!important}' +
      '#onboarding-tip-kicker{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#d4b24a;margin-bottom:10px;flex:0 0 auto;font-weight:700}' +
      '#onboarding-tip-text{margin:0 0 14px;flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}' +
      '#onboarding-tip-text p{margin:0 0 10px}' +
      '#onboarding-tip-text p:last-child{margin-bottom:0}' +
      '#onboarding-tip-actions{display:flex;gap:8px;flex-wrap:wrap;flex:0 0 auto}' +
      '#onboarding-tip-actions button{flex:1 1 calc(50% - 6px);min-width:120px;padding:12px 12px;border-radius:12px;border:1px solid #665329;background:#2a2418;color:#f0e6c8;font-size:13px;font-weight:600;cursor:pointer;line-height:1.25}' +
      '#onboarding-tip-actions button.primary{background:#c9a227;color:#1a1408;border-color:#c9a227;font-weight:800}' +
      '#onboarding-tip-actions button.wide{flex:1 1 100%}' +
      '#onboarding-tip-actions button:active{transform:scale(.97)}' +
      '#onboarding-tip-actions button.onboarding-skip{flex:0 0 100%;background:#242424;border-color:#555;color:#bbb;font-size:12px;padding:9px;font-weight:500}' +
      'body.onboarding-lock #settings-gear-button{pointer-events:none}' +
      '.ob-target{pointer-events:auto!important}' +
      '#onboarding-overlay.coach-mode{pointer-events:none;background:none}' +
      '#onboarding-tip.coach{left:50%!important;transform:translateX(-50%)!important;top:calc(env(safe-area-inset-top) + 10px)!important;bottom:auto!important;width:min(380px,calc(100vw - 20px))!important;max-height:40vh!important;padding:12px 14px 10px;box-shadow:0 10px 30px rgba(0,0,0,.7)}' +
      '#onboarding-tip.coach #onboarding-tip-text{margin-bottom:10px;font-size:14px}' +
      '#onboarding-tip.coach.coach-bottom{top:auto!important;bottom:calc(env(safe-area-inset-bottom) + 12px)!important}';
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
    if (target) {
      var rect = target.getBoundingClientRect();
      var pad = options.padding != null ? options.padding : 10;
      holeEl.style.display = 'block';
      holeEl.style.left = (rect.left - pad) + 'px';
      holeEl.style.top = (rect.top - pad) + 'px';
      holeEl.style.width = (rect.width + pad * 2) + 'px';
      holeEl.style.height = (rect.height + pad * 2) + 'px';
      holeEl.style.borderRadius = (options.radius != null ? options.radius : 16) + 'px';
      var tipWidth = Math.min(340, window.innerWidth - 28);
      var tipLeft = Math.max(14, Math.min(window.innerWidth - tipWidth - 14, rect.left + rect.width / 2 - tipWidth / 2));
      var tipTop;
      if (rect.top > window.innerHeight * 0.45) {
        tipTop = rect.top - 12 - 150;
        if (tipTop < 16) tipTop = rect.bottom + 12;
      } else tipTop = rect.bottom + 12;
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
        var cls = [];
        if (b.primary) cls.push('primary');
        if (b.wide) cls.push('wide');
        btn.className = cls.join(' ');
        btn.onclick = function () { if (b.onClick) b.onClick(); };
        actions.appendChild(btn);
      });
    }
    if (options.allowSkip && Number(window.__AVT_ONBOARDING_STEP) >= 0 && Number(window.__AVT_ONBOARDING_STEP) < LAST_STEP) {
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.textContent = 'Пропустить обучение';
      skip.className = 'onboarding-skip';
      skip.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        finishOnboarding();
      };
      actions.appendChild(skip);
    }
    if (target) placeTipAround(target.getBoundingClientRect(), options.padding != null ? options.padding : 10);
  }

  /* Put the tip above or below the highlighted element using its real height,
     so it never covers the element (bottom tabs, side buttons). */
  function placeTipAround(rect, pad) {
    var h = tipEl.offsetHeight || 180;
    var gap = 12, vh = window.innerHeight;
    var above = rect.top - pad - gap - h;
    var below = rect.bottom + pad + gap;
    var top;
    if (rect.top > vh * 0.45 && above >= 8) top = above;
    else if (below + h <= vh - 8) top = below;
    else top = Math.max(8, above);
    tipEl.style.top = top + 'px';
  }

  function hideSpotlight() {
    if (overlayEl) { overlayEl.classList.remove('active'); overlayEl.classList.remove('card-mode'); }
    if (tipEl) { tipEl.classList.remove('card'); tipEl.style.transform = ''; tipEl.style.width = ''; tipEl.style.maxHeight = ''; }
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

  function startArrivalDialog() {
    var s = st();
    if (!s) return;
    ensureState(s);
    if (s.onboarding.nameGiven && s.onboarding.crimeAsked) { hideSpotlight(); return; }
    showCrimeQuestion();
  }

  function showCrimeQuestion() {
    var opts = shuffle(CRIME_OPTIONS).slice(0, 6);
    var buttons = opts.map(function (o) {
      return { label: o.label, wide: true, onClick: function () { onCrimeChosen(o); } };
    });
    showSpotlight(null, {
      kicker: 'ПРИБЫТИЕ',
      text: '<p><b>За что к нам загремел, бедолага?</b></p><p style="color:#cbb89a;font-size:13px">Выбери, как ответишь пацанам у ворот.</p>',
      buttons: buttons
    });
  }

  function onCrimeChosen(opt) {
    var reply = opt.tone === 'funny' ? pick(REPLY_FUNNY) : pick(REPLY_SERIOUS);
    var s = st(); if (s) { ensureState(s); s.onboarding.crimeAsked = true; }
    var verdict = '';
    try {
      if (typeof window.AVT_assignSentence === 'function') {
        var r = window.AVT_assignSentence(opt.id);
        verdict = '<p style="margin-top:10px">⚖️ Суд впаял <b>' + r.days + ' дней</b>. Тапай — каждые 50 тапов срок короче на день.</p>';
      }
    } catch (e) {}
    save();
    var needName = !(s && s.onboarding && s.onboarding.nameGiven);
    showSpotlight(null, {
      kicker: 'ПРИБЫТИЕ',
      text: '<p><i>«' + opt.label + '»</i></p><p>' + reply + '</p>' + verdict + (needName ? '<p style="margin-top:12px"><b>Ну а как тебя кличать будем?</b></p>' : ''),
      buttons: needName
        ? [{ label: 'Я без погремухи!', primary: true, wide: true, onClick: showNameStyleChoice }]
        : [{ label: 'Заехать в хату', primary: true, wide: true, onClick: function () { hideSpotlight(); ui(); } }]
    });
  }

  function showNameStyleChoice() {
    showSpotlight(null, {
      kicker: 'КЛИЧКА',
      text: '<p>Без погремухи — плохо. Зона любит имена.</p><p><b>Как подберём?</b></p>',
      buttons: [
        { label: 'Поспокойнее', wide: true, onClick: function () { assignNameFromPool(NAMES_CALM, 'спокойную'); } },
        { label: 'Позлее / пожёстче', primary: true, wide: true, onClick: function () { assignNameFromPool(NAMES_TOUGH, 'жёсткую'); } },
        { label: 'Мне всё равно — сами', wide: true, onClick: function () { assignNameFromPool(NAMES_RANDOM, 'любую'); } }
      ]
    });
  }

  function assignNameFromPool(pool, kindLabel) {
    var s = st();
    if (!s) return;
    ensureState(s);
    var name = pick(pool);
    s.nickname = name;
    s.onboarding.nameGiven = true;
    save();
    ui();
    showSpotlight(null, {
      kicker: 'КЛИЧКА',
      text: '<p>Ну вот и договорились.</p><p>Отныне ты — <b>«' + name + '»</b>.</p><p style="color:#cbb89a;font-size:13px">Подобрали ' + kindLabel + ' кличку. Поменять потом можно в настройках за рекламу.</p>',
      buttons: [{ label: 'Понятно, братуха!', primary: true, wide: true, onClick: function () { hideSpotlight(); msg('Теперь тебя зовут «' + name + '»'); } }]
    });
  }

  function finishOnboarding() {
    stopAwait();
    clearTargetMark();
    window.__AVT_ONBOARDING_ACTIVE = false;
    window.__AVT_ONBOARDING_STEP = -1;
    var s = st();
    if (!s) return;
    ensureState(s);
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
    try { if (typeof window.ui === 'function') window.ui(); } catch (e) {}
    msg('Обучение завершено! +100 🍵 и 80 тапов ×2 — вперёд!');
    if (!s.onboarding.nameGiven || !s.onboarding.crimeAsked) setTimeout(startArrivalDialog, 400);
  }

  /* ---------- Tour steps (v6) ----------
     info      : spotlight + tap anywhere to continue
     practice  : tap the pear N times
     highlight : spotlight a button with a description and a "Понятно" button.
                 Windows are NOT opened during the tour — the player opens them later. */
  var STEPS = [
    { type: 'info', target: '#tap-object', kicker: 'НАЧАЛО', text: 'Это <b>груша</b>. Тапай по ней, чтобы зарабатывать ресурсы и расти в масти.', padding: 14 },
    { type: 'info', target: '.resource-chifir', kicker: 'РЕСУРСЫ', text: '<b>Чефир 🍵</b> — основная валюта. Трать его в Магазе на улучшения.', padding: 8 },
    { type: 'info', target: '.resource-points', kicker: 'РЕСУРСЫ', text: '<b>Понты ⭐</b> — твой авторитет. Чем больше понтов, тем выше масть.', padding: 8 },
    { type: 'info', target: '.resource-energy', kicker: 'РЕСУРСЫ', text: '<b>Энергия ⚡</b> тратится на удары. Она постепенно восстанавливается сама.', padding: 8 },
    { type: 'practice', target: '#tap-object' },
    { type: 'highlight', target: '#btn-shop', kicker: 'МАГАЗ', padding: 8,
      text: 'Это <b>Магаз</b>: покупай улучшения и экипировку за чефир, чтобы бить сильнее.' },
    { type: 'highlight', target: '#raid-open-button', kicker: 'РЕЙДЫ', padding: 10,
      text: 'Это <b>Рейды</b>: выбери бойца и тапай, пока он не свалится. Победа даёт чефир и понты.' },
    { type: 'highlight', target: '#booster-open-button', kicker: 'БОНУС ×2', padding: 8,
      text: 'Это <b>×2 за тап</b>: за просмотр рекламы следующие <b>100 тапов</b> дают ×2.' },
    { type: 'highlight', target: '#btn-rank', kicker: 'МАСТЬ', padding: 8,
      text: 'Это <b>Масть</b>: здесь видно твой ранг на зоне и сколько понтов нужно до следующего.' },
    { type: 'highlight', target: '#btn-tasks', kicker: 'ДЕЛА', padding: 8,
      text: 'Это <b>Дела</b>: выполняй поручения и забирай награды.' },
    { type: 'highlight', target: '#btn-more', kicker: 'БАРАК', padding: 8,
      text: 'Это <b>Барак</b>: здесь живут персонажи зоны — просьбы, дела и награды: чефир, понты, энергия, а позже шмот.' },
    { type: 'final' }
  ];
  var LAST_STEP = STEPS.length - 1;

  function clearTargetMark() {
    document.querySelectorAll('.ob-target').forEach(function (el) { el.classList.remove('ob-target'); });
  }
  function stopAwait() {
    if (tipEl) tipEl.classList.remove('coach', 'coach-bottom');
    if (overlayEl) overlayEl.classList.remove('coach-mode');
  }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    var cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }

  function runStep(step) {
    var s = st();
    if (!s || isDone(s)) { hideSpotlight(); return; }
    stopAwait();
    clearTargetMark();
    bindOnboardingInput();
    window.__AVT_ONBOARDING_ACTIVE = true;
    window.__AVT_ONBOARDING_STEP = step;
    var def = STEPS[step];
    if (!def) { finishOnboarding(); return; }
    ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.display = step < 5 ? 'none' : ''; el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
    });
    if (def.type === 'final') {
      showSpotlight(null, {
        kicker: 'ГОТОВО',
        text: '<p><b>Теперь ты знаешь основы.</b></p><p>Тапай грушу, качайся в Магазе, ходи в Рейды и выполняй Дела — так растёт масть.</p>',
        buttons: [{ label: 'Понятно, братуха!', primary: true, wide: true, onClick: finishOnboarding }]
      });
      return;
    }
    var target = document.querySelector(def.target);
    if ((def.type === 'highlight' || def.type === 'info') && !visible(target)) {
      /* Element not on screen (e.g. hidden in karcer) — skip this step. */
      setTimeout(function () { goToStep(step + 1); }, 0);
      return;
    }
    if (def.type === 'practice') {
      s.onboarding.practiceTaps = 0;
      try { if (typeof s.maxEnergy === 'number') s.energy = Math.max(Number(s.energy) || 0, Math.min(s.maxEnergy, Math.max(50, REQUIRED_PRACTICE_TAPS + 15))); } catch (e) {}
      save();
      showSpotlight('#tap-object', {
        kicker: 'ПРАКТИКА',
        text: 'Тапни по груше <b>' + REQUIRED_PRACTICE_TAPS + ' раз</b> (0/' + REQUIRED_PRACTICE_TAPS + ').',
        padding: 14, allowSkip: true
      });
      return;
    }
    if (def.type === 'highlight') {
      showSpotlight(target, {
        kicker: def.kicker, padding: def.padding, text: def.text, allowSkip: true,
        buttons: [{ label: 'Понятно →', primary: true, wide: true, onClick: function () { goToStep(step + 1); } }]
      });
      return;
    }
    showSpotlight(target, {
      kicker: def.kicker, padding: def.padding,
      text: def.text + '<p style="color:#9d8f73;font-size:12px;margin-top:8px">Нажми в любом месте, чтобы продолжить</p>',
      allowSkip: true
    });
  }

  function bindOnboardingInput() {
    if (window.__AVT_ONBOARDING_INPUT_BOUND) return;
    window.__AVT_ONBOARDING_INPUT_BOUND = true;
    function inTip(t) { return !!(t && t.closest && t.closest('#onboarding-tip')); }
    function isPear(t) { return !!(t && t.closest && (t.closest('#tap-object') || t.closest('#tap-area') || t.closest('#object-emoji'))); }
    function curStep() { var ps = st(); if (!ps || isDone(ps) || !ps.onboarding) return -1; return ps.onboarding.step; }
    document.addEventListener('pointerdown', function (e) {
      if (window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK || inTip(e.target)) return;
      var step = curStep(); if (step < 0) return;
      var def = STEPS[step]; if (!def) return;
      if (def.type === 'info') {
        e.preventDefault(); e.stopImmediatePropagation();
        window.__AVT_ONBOARDING_SUPPRESS_CLICK = true;
        goToStep(step + 1);
      } else if (def.type === 'practice') {
        if (!isPear(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); }
      } else if (def.type === 'highlight') {
        /* only the tip's "Понятно" moves on — tabs don't open during the tour */
        e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener('click', function (e) {
      if (window.__AVT_TUTORIAL_PROGRAMMATIC_CLICK || inTip(e.target)) return;
      if (window.__AVT_ONBOARDING_SUPPRESS_CLICK) { window.__AVT_ONBOARDING_SUPPRESS_CLICK = false; e.preventDefault(); e.stopImmediatePropagation(); return; }
      var step = curStep(); if (step < 0) return;
      var def = STEPS[step]; if (!def) return;
      if (def.type === 'practice') { if (!isPear(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
      if (def.type === 'highlight' || def.type === 'final') { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  }

  var __practiceLastAt = 0;
  function notePracticeTap() {
    var s = st(); if (!s || isDone(s)) return; ensureState(s); if (s.onboarding.step !== 4) return;
    var now = Date.now(); if (now - __practiceLastAt < 120) return; __practiceLastAt = now;
    try { if (typeof s.energy === 'number' && typeof s.maxEnergy === 'number' && s.energy < 8) s.energy = Math.min(s.maxEnergy, Math.max(s.energy, 40)); } catch (e) {}
    s.onboarding.practiceTaps = (Number(s.onboarding.practiceTaps) || 0) + 1;
    var done = s.onboarding.practiceTaps; var left = Math.max(0, REQUIRED_PRACTICE_TAPS - done); save();
    var textEl = document.getElementById('onboarding-tip-text');
    if (textEl) textEl.innerHTML = left > 0 ? ('Тапай: <b>' + done + '/' + REQUIRED_PRACTICE_TAPS + '</b>. Ещё ' + left + '.') : 'Готово! Переходим дальше…';
    if (left <= 0) setTimeout(function () { var live = st(); if (live && live.onboarding && live.onboarding.step === 4) goToStep(5); }, 400);
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var s = st();
      if (!s && tries < 300) return;
      clearInterval(timer);
      if (!s) { setTimeout(boot, 1000); return; }
      ensureState(s);
      var nick = String(s.nickname || '').trim();
      if (Number(s.onboarding.tutorialVersion || 0) < 10) {
        s.onboarding.tutorialVersion = 10;
        if (!s.onboarding.done) { s.onboarding.step = 0; s.onboarding.practiceTaps = 0; }
        if (!s.onboarding.nameGiven && (!nick || nick === 'Салага' || nick === 'Новичок')) s.onboarding.nameGiven = false;
        save();
      }
      if (!nick) { s.nickname = 'Салага'; save(); ui(); }
      if (!window.__onboardingTapHooked) {
        window.__onboardingTapHooked = true;
        document.addEventListener('pointerdown', function (e) {
          try {
            var gs = st(); if (!gs || isDone(gs) || !gs.onboarding || gs.onboarding.step !== 4) return;
            var t = e.target; if (!t || !t.closest) return;
            if (t.closest('#tap-object') || t.closest('#tap-area') || t.closest('#object-emoji') || t.closest('#object-name') || t.closest('#object-action')) notePracticeTap();
          } catch (err) {}
        }, true);
        var lastTaps = -1;
        setInterval(function () {
          var gs = st(); if (!gs || isDone(gs) || !gs.onboarding || gs.onboarding.step !== 4) return;
          var t = Math.max(0, Number(gs.totalTaps) || 0);
          if (lastTaps < 0) { lastTaps = t; return; }
          if (t > lastTaps) { lastTaps = t; notePracticeTap(); }
        }, 250);
      }
      if (isDone(s)) {
        ['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(function (id) { var el = document.getElementById(id); if (el) { el.style.display = ''; el.style.opacity = '1'; } });
        if (!s.onboarding.nameGiven || !s.onboarding.crimeAsked) setTimeout(startArrivalDialog, 600);
        return;
      }
      bindOnboardingInput();
      window.__AVT_ONBOARDING_ACTIVE = true;
      function startWhenReady() {
        var pre = document.getElementById('preloader');
        if (pre && pre.style && pre.style.display !== 'none' && !pre.classList.contains('hidden') && !pre.classList.contains('done')) { setTimeout(startWhenReady, 200); return; }
        runStep(s.onboarding.step || 0);
      }
      startWhenReady();
      console.log('[onboarding] v4.2 ready, step=', s.onboarding.step);
    }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.AVT_Onboarding = {
    goToStep: goToStep,
    finish: finishOnboarding,
    isDone: function () { return isDone(st()); },
    startArrivalDialog: startArrivalDialog
  };
})();
