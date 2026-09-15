// ======================
// АВТОРИТЕТ - Прототип
// ======================

const NICKNAMES = [
  "Кирпич", "Шайба", "Бугор", "Хмурый", "Косой",
  "Гвоздь", "Топор", "Серый", "Лысый", "Крест",
  "Малой", "Дядя", "Брат", "Штиль", "Волк",
  "Кабан", "Ёжик", "Пупс", "Змей", "Тигр",
  "Кощей", "Батя", "Шустрый", "Немой", "Гроза"
];

const RANKS = [
  { name: "Салага", points: 0 },
  { name: "Пацан", points: 100 },
  { name: "Блатной", points: 500 },
  { name: "Смотрящий", points: 2000 },
  { name: "Авторитет", points: 8000 },
  { name: "Вор в законе", points: 25000 }
];

const OBJECTS = [
  { id: "bag", name: "Груша", emoji: "🥊", unlock: 0, mult: 1 },
  { id: "inmate", name: "Сокамерник", emoji: "👊", unlock: 150, mult: 1.3 },
  { id: "pushups", name: "Отжимания", emoji: "💪", unlock: 400, mult: 1.6 }
];

// Просто смешные фразы (без выбора)
const FUNNY_MESSAGES = [
  "Надзиратель идёт... сделай умный вид.",
  "Кореш передал маляву: «Не высовывайся».",
  "Кореш передал маляву: «Сегодня каша нормальная».",
  "Кореш передал маляву: «В бане сегодня свободно».",
  "Кореш передал маляву: «Не бери в долг у Шайбы».",
  "Кореш передал маляву: «Завтра шмон, прячь всё».",
  "Кто-то опять спиздил папиросы. Классика.",
  "Тебя вызвали на стрелку. Пока лучше не ходить.",
  "В камере пахнет жареной картошкой. Странно.",
  "Шайба сказал, что ты нормальный пацан.",
  "Сегодня без шмона. Чудо.",
  "Кто-то храпит как трактор.",
  "Ты случайно задел смотрящего. Неловко.",
  "Папиросы закончились у всех. Напряжёнка.",
  "Сокамерник роняет мыло... Ту-ту-ту.",
  "Мыло упало. Все сделали вид, что ничего не видели.",
  "В душе снова кончилось жидкое мыло. Саботаж.",
  "Кто-то намылил пол. Классика жанра.",
  "Сокамерник предлагает «по-братски» поделиться мылом.",
  "Ты нашёл под матрасом чужую маляву. Интересно...",
  "В столовой сегодня мясо. Или что-то похожее.",
  "Надзиратель шутит. Все смеются. На всякий случай.",
  "Кто-то пытается продать тебе «настоящий» чай.",
  "В камере появился новый. Пахнет страхом и дешёвым одеколоном.",
  "Ты услышал, как где-то играют на гитаре «Владимирский централ».",
  "Сокамерник снова рассказывает одну и ту же байку.",
  "Кто-то пытается завести крысу. В прямом смысле.",
  "Сегодня раздача посылок. Надежда умирает последней."
];

// Интерактивные события с выбором
const CHOICE_EVENTS = [
  {
    title: "Шмон!",
    text: "Надзиратели ворвались в камеру. Что делаешь?",
    choices: [
      {
        text: "Рисковать и спрятать папиросы",
        risk: 0.55,
        success: { cigarettes: 40, points: 15, msg: "Пронесло! Папиросы целы, ещё и нашёл чужие." },
        fail: { points: -25, msg: "Попался. Забрали папиросы и сняли понты." }
      },
      {
        text: "Спокойно стоять и ждать",
        risk: 0,
        success: { cigarettes: 10, points: 5, msg: "Прошли мимо. Даже дали сигарету «за поведение»." },
        fail: null
      },
      {
        text: "Сделать вид, что спишь",
        risk: 0.25,
        success: { cigarettes: 5, points: 8, msg: "Сработало. Тебя не тронули." },
        fail: { points: -10, msg: "Разбудили пинком. Минус авторитет." }
      }
    ]
  },
  {
    title: "Малява",
    text: "Тебе передали маляву. Что в ней?",
    choices: [
      {
        text: "Прочитать сразу",
        risk: 0.4,
        success: { cigarettes: 30, points: 20, msg: "Полезный совет и пачка папирос в придачу!" },
        fail: { points: -15, msg: "Это была подстава. Минус понты." }
      },
      {
        text: "Спрятать и прочитать потом",
        risk: 0.15,
        success: { cigarettes: 15, points: 10, msg: "Умно. Инфа оказалась полезной." },
        fail: { points: -5, msg: "Маляву нашли при шмоне. Неловко." }
      },
      {
        text: "Выбросить не читая",
        risk: 0,
        success: { points: 3, msg: "Безопасно. Но вдруг там было что-то важное..." },
        fail: null
      }
    ]
  },
  {
    title: "Мыло",
    text: "В душевой кто-то уронил мыло. Все смотрят на тебя.",
    choices: [
      {
        text: "Поднять и отдать",
        risk: 0.3,
        success: { points: 25, cigarettes: 10, msg: "Все уважительно кивнули. +авторитет." },
        fail: { points: -20, msg: "Кто-то ржал. Минус понты. Ту-ту-ту." }
      },
      {
        text: "Сделать вид, что не заметил",
        risk: 0,
        success: { points: 5, msg: "Классика. Все сделали вид, что ничего не было." },
        fail: null
      },
      {
        text: "Громко пошутить на эту тему",
        risk: 0.5,
        success: { cigarettes: 25, points: 15, msg: "Все поржали. Ты свой." },
        fail: { points: -30, msg: "Шутка не зашла. Напряжёнка." }
      }
    ]
  },
  {
    title: "Стрелка",
    text: "Тебя вызывают «поговорить». Что ответишь?",
    choices: [
      {
        text: "Пойти и выяснить",
        risk: 0.5,
        success: { cigarettes: 50, points: 30, msg: "Всё решили по-пацански. Уважуха." },
        fail: { points: -40, msg: "Получил по щам. Минус авторитет." }
      },
      {
        text: "Сказать, что занят",
        risk: 0.2,
        success: { points: 10, msg: "Отложилось. Пока тихо." },
        fail: { points: -15, msg: "Посчитали за труса." }
      },
      {
        text: "Послать надёжного кореша",
        risk: 0.35,
        success: { cigarettes: 20, points: 15, msg: "Кореш разобрался. Ты в плюсе." },
        fail: { points: -20, msg: "Кореш подвёл. Теперь проблемы у тебя." }
      }
    ]
  },
  {
    title: "Посылка",
    text: "Пришла посылка, но непонятно чья. Что делаешь?",
    choices: [
      {
        text: "Забрать себе",
        risk: 0.6,
        success: { cigarettes: 60, points: 10, msg: "Джекпот! Папиросы, чай и печенье." },
        fail: { points: -35, cigarettes: -20, msg: "Хозяин нашёлся. Пришлось возвращать с извинениями." }
      },
      {
        text: "Отдать смотрящему",
        risk: 0,
        success: { points: 20, msg: "Правильный ход. Засчитали как уважение." },
        fail: null
      },
      {
        text: "Оставить на месте",
        risk: 0.1,
        success: { points: 5, msg: "Никто не тронул. Чисто." },
        fail: { points: -5, msg: "Всё равно кто-то решил, что это ты взял." }
      }
    ]
  }
];

// Состояние игры
let state = {
  cigarettes: 0,
  points: 0,
  energy: 250,
  maxEnergy: 250,
  power: 1,
  critChance: 0.05,
  nickname: "",
  currentObject: 0,
  upgrades: {
    power: 0,
    crit: 0,
    energyMax: 0
  },
  lastEnergyTime: Date.now(),
  lastChoiceEvent: 0
};

// ----- Сохранение / загрузка -----
function save() {
  localStorage.setItem("avtoritet_save", JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem("avtoritet_save");
  if (raw) {
    try {
      const data = JSON.parse(raw);
      state = { ...state, ...data };
    } catch (e) {}
  }
  if (!state.nickname) {
    state.nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  }
  if (state.maxEnergy < 250) {
    state.maxEnergy = 250;
    state.energy = Math.max(state.energy, 250);
  }
}

// ----- UI обновление -----
function updateUI() {
  document.getElementById("cigarettes").textContent = formatNumber(Math.floor(state.cigarettes));
  document.getElementById("points").textContent = formatNumber(Math.floor(state.points));
  document.getElementById("energy").textContent = Math.floor(state.energy);
  document.getElementById("max-energy").textContent = state.maxEnergy;
  document.getElementById("nickname").textContent = state.nickname;

  let currentRank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (state.points >= RANKS[i].points) {
      currentRank = RANKS[i];
      break;
    }
  }
  document.getElementById("rank").textContent = currentRank.name;

  const obj = OBJECTS[state.currentObject];
  document.getElementById("object-emoji").textContent = obj.emoji;
  document.getElementById("object-name").textContent = obj.name;
}

function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}

// ----- Тап -----
function doTap(e) {
  if (state.energy < 1) {
    showMessage("Энергия на нуле. Отдохни или посмотри рекламу.");
    return;
  }

  state.energy -= 1;

  const obj = OBJECTS[state.currentObject];
  let gain = state.power * obj.mult;
  let isCrit = Math.random() < state.critChance;

  if (isCrit) gain *= 2;

  state.cigarettes += gain;
  state.points += gain * 0.8;

  const target = document.getElementById("tap-object");
  target.classList.remove("punch");
  void target.offsetWidth;
  target.classList.add("punch");

  showTapFeedback(e, Math.floor(gain), isCrit);
  updateUI();
  save();

  // Обычные смешные фразы (редко)
  if (Math.random() < 0.022) {
    showMessage(FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
  }

  // Интерактивные события (ещё реже + не чаще чем раз в 40 тапов)
  if (Math.random() < 0.012 && state.points - state.lastChoiceEvent > 30) {
    triggerChoiceEvent();
  }
}

function showTapFeedback(e, amount, isCrit) {
  const el = document.getElementById("tap-feedback");
  el.textContent = (isCrit ? "КРИТ! " : "+") + amount;
  el.style.left = (e.clientX || 150) + "px";
  el.style.top = (e.clientY || 300) + "px";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 400);
}

function showMessage(text) {
  const el = document.getElementById("event-message");
  el.textContent = text;
  setTimeout(() => {
    if (el.textContent === text) el.textContent = "";
  }, 4500);
}

// ----- Интерактивные события -----
function triggerChoiceEvent() {
  const event = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)];
  state.lastChoiceEvent = state.points;

  const content = document.getElementById("modal-content");
  content.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = event.title;
  content.appendChild(title);

  const text = document.createElement("p");
  text.style.margin = "12px 0 20px";
  text.style.lineHeight = "1.4";
  text.textContent = event.text;
  content.appendChild(text);

  event.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.style.marginBottom = "10px";
    btn.style.width = "100%";
    btn.textContent = choice.text;

    btn.onclick = () => {
      resolveChoice(choice);
    };

    content.appendChild(btn);
  });

  // Прячем крестик на время события
  document.getElementById("modal-close").style.display = "none";
  showModal();
}

function resolveChoice(choice) {
  document.getElementById("modal-close").style.display = "";

  let result;
  if (choice.risk === 0 || Math.random() > choice.risk) {
    // Успех
    result = choice.success;
  } else {
    // Провал
    result = choice.fail;
  }

  if (!result) result = { msg: "Ничего не произошло." };

  if (result.cigarettes) state.cigarettes = Math.max(0, state.cigarettes + result.cigarettes);
  if (result.points) state.points = Math.max(0, state.points + result.points);

  updateUI();
  save();

  // Показываем результат
  const content = document.getElementById("modal-content");
  content.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = result.points > 0 || result.cigarettes > 0 ? "Удачно!" : "Эх...";
  content.appendChild(title);

  const msg = document.createElement("p");
  msg.style.margin = "16px 0";
  msg.style.lineHeight = "1.4";
  msg.textContent = result.msg;
  content.appendChild(msg);

  if (result.cigarettes || result.points) {
    const reward = document.createElement("p");
    reward.style.color = "#ffcc00";
    reward.style.fontWeight = "600";
    let txt = "";
    if (result.cigarettes) txt += (result.cigarettes > 0 ? "+" : "") + result.cigarettes + " 🚬  ";
    if (result.points) txt += (result.points > 0 ? "+" : "") + result.points + " ⭐";
    reward.textContent = txt;
    content.appendChild(reward);
  }

  const okBtn = document.createElement("button");
  okBtn.className = "nav-btn";
  okBtn.style.width = "100%";
  okBtn.style.marginTop = "16px";
  okBtn.textContent = "Понятно";
  okBtn.onclick = hideModal;
  content.appendChild(okBtn);
}

// ----- Энергия -----
function regenEnergy() {
  const now = Date.now();
  const diff = (now - state.lastEnergyTime) / 1000;
  const regen = Math.floor(diff / 4);
  if (regen > 0) {
    state.energy = Math.min(state.maxEnergy, state.energy + regen);
    state.lastEnergyTime = now - (diff % 4) * 1000;
    updateUI();
    save();
  }
}

// ----- Магазин -----
function openShop() {
  const content = document.getElementById("modal-content");
  content.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Магазин";
  content.appendChild(title);

  const upgrades = [
    {
      key: "power",
      name: "Сила удара",
      desc: "+1 к урону за тап",
      cost: () => Math.floor(50 * Math.pow(1.55, state.upgrades.power)),
      level: state.upgrades.power,
      action: () => { state.power += 1; state.upgrades.power++; }
    },
    {
      key: "crit",
      name: "Критический удар",
      desc: "+3% шанс крита",
      cost: () => Math.floor(80 * Math.pow(1.65, state.upgrades.crit)),
      level: state.upgrades.crit,
      action: () => { state.critChance += 0.03; state.upgrades.crit++; }
    },
    {
      key: "energyMax",
      name: "Запас энергии",
      desc: "+50 к максимуму энергии",
      cost: () => Math.floor(100 * Math.pow(1.6, state.upgrades.energyMax)),
      level: state.upgrades.energyMax,
      action: () => {
        state.maxEnergy += 50;
        state.energy += 50;
        state.upgrades.energyMax++;
      }
    }
  ];

  upgrades.forEach(u => {
    const cost = u.cost();
    const canBuy = state.cigarettes >= cost;

    const div = document.createElement("div");
    div.className = "upgrade-item";

    const info = document.createElement("div");
    info.className = "upgrade-info";
    info.innerHTML = `
      <div class="upgrade-name">${u.name} (ур. ${u.level})</div>
      <div class="upgrade-desc">${u.desc}</div>
    `;

    const btn = document.createElement("button");
    btn.className = "buy-btn";
    btn.textContent = cost + " 🚬";
    if (!canBuy) btn.disabled = true;

    btn.onclick = () => {
      if (state.cigarettes >= cost) {
        state.cigarettes -= cost;
        u.action();
        updateUI();
        save();
        openShop();
      }
    };

    div.appendChild(info);
    div.appendChild(btn);
    content.appendChild(div);
  });

  const activitiesTitle = document.createElement("h2");
  activitiesTitle.style.marginTop = "20px";
  activitiesTitle.textContent = "Занятия";
  content.appendChild(activitiesTitle);

  OBJECTS.forEach((obj, idx) => {
    const unlocked = state.points >= obj.unlock;

    const div = document.createElement("div");
    div.className = "upgrade-item";

    const info = document.createElement("div");
    info.className = "upgrade-info";
    info.innerHTML = `
      <div class="upgrade-name">${obj.emoji} ${obj.name}</div>
      <div class="upgrade-desc">x${obj.mult} к награде ${unlocked ? "" : `(нужно ${obj.unlock} понтов)`}</div>
    `;

    const btn = document.createElement("button");
    btn.className = "buy-btn";

    if (state.currentObject === idx) {
      btn.textContent = "Выбрано";
      btn.disabled = true;
    } else if (unlocked) {
      btn.textContent = "Выбрать";
      btn.onclick = () => {
        state.currentObject = idx;
        updateUI();
        save();
        openShop();
      };
    } else {
      btn.textContent = "Закрыто";
      btn.disabled = true;
    }

    div.appendChild(info);
    div.appendChild(btn);
    content.appendChild(div);
  });

  showModal();
}

// ----- Звания -----
function openRanks() {
  const content = document.getElementById("modal-content");
  content.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Звания";
  content.appendChild(title);

  RANKS.forEach(r => {
    const reached = state.points >= r.points;
    const div = document.createElement("div");
    div.className = "rank-item";
    div.innerHTML = `
      <div class="${reached ? "rank-current" : ""}">${r.name}</div>
      <div>${r.points} ⭐</div>
    `;
    content.appendChild(div);
  });

  showModal();
}

// ----- Реклама (заглушки) -----
function watchAdForEnergy() {
  showMessage("Реклама пока заглушка. +80 энергии.");
  state.energy = Math.min(state.maxEnergy, state.energy + 80);
  updateUI();
  save();
}

function changeNickname() {
  const newName = prompt("Введи новую кличку (потом будет за рекламу):", state.nickname);
  if (newName && newName.trim().length > 1) {
    state.nickname = newName.trim().slice(0, 16);
    updateUI();
    save();
  }
}

// ----- Модалка -----
function showModal() {
  document.getElementById("modal-overlay").classList.remove("hidden");
}
function hideModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("modal-close").style.display = "";
}

// ----- Инициализация -----
function init() {
  load();
  updateUI();

  const tapObj = document.getElementById("tap-object");
  tapObj.addEventListener("click", doTap);
  tapObj.addEventListener("touchstart", (e) => {
    e.preventDefault();
    doTap(e.touches[0]);
  }, { passive: false });

  document.getElementById("btn-shop").onclick = openShop;
  document.getElementById("btn-rank").onclick = openRanks;
  document.getElementById("btn-energy").onclick = watchAdForEnergy;

  document.getElementById("modal-close").onclick = hideModal;
  document.getElementById("modal-overlay").onclick = (e) => {
    if (e.target.id === "modal-overlay") hideModal();
  };

  document.getElementById("nickname").onclick = changeNickname;

  setInterval(regenEnergy, 1000);

  if (typeof YaGames !== "undefined") {
    YaGames.init().then(ysdk => {
      console.log("Yandex SDK ready");
    }).catch(console.error);
  }
}

init();
