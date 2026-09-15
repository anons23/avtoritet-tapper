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

const EVENTS = [
  "Надзиратель идёт... сделай умный вид.",
  "Кореш передал маляву: «Не высовывайся».",
  "Кто-то опять спиздил папиросы. Классика.",
  "Тебя вызвали на стрелку. Пока лучше не ходить.",
  "В камере пахнет жареной картошкой. Странно.",
  "Шайба сказал, что ты нормальный пацан.",
  "Сегодня без шмона. Чудо.",
  "Кто-то храпит как трактор.",
  "Ты случайно задел смотрящего. Неловко.",
  "Папиросы закончились у всех. Напряжёнка."
];

// Состояние игры
let state = {
  cigarettes: 0,
  points: 0,
  energy: 100,
  maxEnergy: 100,
  power: 1,          // сила удара
  critChance: 0.05,
  nickname: "",
  currentObject: 0,
  upgrades: {
    power: 0,
    crit: 0,
    energyMax: 0
  },
  lastEnergyTime: Date.now()
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
}

// ----- UI обновление -----
function updateUI() {
  document.getElementById("cigarettes").textContent = formatNumber(Math.floor(state.cigarettes));
  document.getElementById("points").textContent = formatNumber(Math.floor(state.points));
  document.getElementById("energy").textContent = Math.floor(state.energy);
  document.getElementById("max-energy").textContent = state.maxEnergy;
  document.getElementById("nickname").textContent = state.nickname;

  // Звание
  let currentRank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (state.points >= RANKS[i].points) {
      currentRank = RANKS[i];
      break;
    }
  }
  document.getElementById("rank").textContent = currentRank.name;

  // Объект
  const obj = OBJECTS[state.currentObject];
  document.getElementById("object-emoji").textContent = obj.emoji;
  document.getElementById("object-name").textContent = obj.name;
}

function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
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

  // Визуальный фидбек
  const target = document.getElementById("tap-object");
  target.classList.remove("punch");
  void target.offsetWidth;
  target.classList.add("punch");

  showTapFeedback(e, Math.floor(gain), isCrit);
  updateUI();
  save();

  // Случайное событие
  if (Math.random() < 0.08) {
    showMessage(EVENTS[Math.floor(Math.random() * EVENTS.length)]);
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
  }, 4000);
}

// ----- Энергия -----
function regenEnergy() {
  const now = Date.now();
  const diff = (now - state.lastEnergyTime) / 1000; // секунды
  // 1 энергия каждые 8 секунд
  const regen = Math.floor(diff / 8);
  if (regen > 0) {
    state.energy = Math.min(state.maxEnergy, state.energy + regen);
    state.lastEnergyTime = now - (diff % 8) * 1000;
    updateUI();
    save();
  }
}

// ----- Магазин -----
function openShop() {
  const content = document.getElementById("modal-content");
  content.innerHTML = "<h2>Магазин</h2>";

  const upgrades = [
    {
      key: "power",
      name: "Сила удара",
      desc: "+1 к урону за тап",
      cost: () => 50 * Math.pow(1.6, state.upgrades.power),
      level: state.upgrades.power,
      action: () => { state.power += 1; state.upgrades.power++; }
    },
    {
      key: "crit",
      name: "Критический удар",
      desc: "+3% шанс крита",
      cost: () => 80 * Math.pow(1.7, state.upgrades.crit),
      level: state.upgrades.crit,
      action: () => { state.critChance += 0.03; state.upgrades.crit++; }
    },
    {
      key: "energyMax",
      name: "Запас энергии",
      desc: "+20 к максимуму энергии",
      cost: () => 120 * Math.pow(1.65, state.upgrades.energyMax),
      level: state.upgrades.energyMax,
      action: () => { state.maxEnergy += 20; state.upgrades.energyMax++; }
    }
  ];

  upgrades.forEach(u => {
    const cost = Math.floor(u.cost());
    const canBuy = state.cigarettes >= cost;
    const div = document.createElement("div");
    div.className = "upgrade-item";
    div.innerHTML = `
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name} (ур. ${u.level})</div>
        <div class="upgrade-desc">${u.desc}</div>
      </div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${cost} 🚬</button>
    `;
    div.querySelector("button").onclick = () => {
      if (state.cigarettes >= cost) {
        state.cigarettes -= cost;
        u.action();
        updateUI();
        save();
        openShop(); // обновить
      }
    };
    content.appendChild(div);
  });

  // Смена объекта
  content.innerHTML += "<h2 style='margin-top:20px'>Занятия</h2>";
  OBJECTS.forEach((obj, idx) => {
    const unlocked = state.points >= obj.unlock;
    const div = document.createElement("div");
    div.className = "upgrade-item";
    div.innerHTML = `
      <div class="upgrade-info">
        <div class="upgrade-name">${obj.emoji} ${obj.name}</div>
        <div class="upgrade-desc">x${obj.mult} к награде ${unlocked ? "" : `(нужно ${obj.unlock} понтов)`}</div>
      </div>
      <button class="buy-btn" ${unlocked && state.currentObject !== idx ? "" : "disabled"}>
        ${state.currentObject === idx ? "Выбрано" : unlocked ? "Выбрать" : "Закрыто"}
      </button>
    `;
    if (unlocked && state.currentObject !== idx) {
      div.querySelector("button").onclick = () => {
        state.currentObject = idx;
        updateUI();
        save();
        openShop();
      };
    }
    content.appendChild(div);
  });

  showModal();
}

// ----- Звания -----
function openRanks() {
  const content = document.getElementById("modal-content");
  content.innerHTML = "<h2>Звания</h2>";

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
  // Здесь будет вызов Yandex rewarded
  // Пока просто даём энергию для теста
  showMessage("Реклама пока заглушка. +40 энергии.");
  state.energy = Math.min(state.maxEnergy, state.energy + 40);
  updateUI();
  save();
}

function changeNickname() {
  // Заглушка под рекламу
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
}

// ----- Инициализация -----
function init() {
  load();
  updateUI();

  // Тап
  const tapObj = document.getElementById("tap-object");
  tapObj.addEventListener("click", doTap);
  tapObj.addEventListener("touchstart", (e) => {
    e.preventDefault();
    doTap(e.touches[0]);
  }, { passive: false });

  // Кнопки
  document.getElementById("btn-shop").onclick = openShop;
  document.getElementById("btn-rank").onclick = openRanks;
  document.getElementById("btn-energy").onclick = watchAdForEnergy;

  document.getElementById("modal-close").onclick = hideModal;
  document.getElementById("modal-overlay").onclick = (e) => {
    if (e.target.id === "modal-overlay") hideModal();
  };

  // Долгий тап по кличке — смена имени
  document.getElementById("nickname").onclick = changeNickname;

  // Реген энергии
  setInterval(regenEnergy, 1000);

  // Yandex SDK (если есть)
  if (typeof YaGames !== "undefined") {
    YaGames.init().then(ysdk => {
      console.log("Yandex SDK ready");
      // ysdk.features.LoadingAPI?.ready();
    }).catch(console.error);
  }
}

init();