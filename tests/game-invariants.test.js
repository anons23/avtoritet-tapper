const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const gamePath = path.join(root, 'js', 'game.js');
const gameSource = fs.readFileSync(gamePath, 'utf8');
const authoritySource = fs.readFileSync(path.join(root, 'js', 'authority-ui.js'), 'utf8');
const authorityGateSource = fs.readFileSync(path.join(root, 'js', 'authority-gate.js'), 'utf8');
const prisonSource = fs.readFileSync(path.join(root, 'js', 'prison-ui.js'), 'utf8');
const yandexSource = fs.readFileSync(path.join(root, 'js', 'yandex-sdk.js'), 'utf8');

assert.ok(gameSource.length > 10000, 'game.js looks truncated or replaced by a stub');
assert.match(gameSource, /const TEST_MODE=true;/, 'test mode must remain enabled for the current test branch');
assert.match(gameSource, /window\.saveGame=save;/, 'central save API is missing');
assert.match(gameSource, /function trustedSaveTime\(\)/, 'trusted save time helper is missing');
assert.match(gameSource, /serverTime\(\)/, 'Yandex server time is not used for save timestamps');
assert.doesNotMatch(gameSource, /\\\\nwindow\./, 'game.js contains the old literal \\n corruption');
assert.doesNotMatch(gameSource, /setInterval\(\(\)=>\{wrapMessages\(\);guard\(\)\},80\)/, '80ms authority polling is still present');
assert.doesNotMatch(gameSource, /setInterval\(check,100\)/, '100ms prison polling is still present');

const context = {
  console,
  Date,
  Math,
  JSON,
  Number,
  String,
  Object,
  Array,
  Promise,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  performance: { now: () => 0 },
  window: {},
  document: {
    readyState: 'loading',
    visibilityState: 'visible',
    addEventListener() {},
    getElementById() { return null; }
  },
  localStorage: {
    data: Object.create(null),
    getItem(key) { return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null; },
    setItem(key, value) { this.data[key] = String(value); },
    removeItem(key) { delete this.data[key]; }
  }
};
context.globalThis = context;

vm.runInNewContext(gameSource, context, { filename: 'js/game.js' });

assert.equal(typeof context.window.getGameState, 'function', 'getGameState API missing');
assert.equal(typeof context.window.saveGame, 'function', 'saveGame API missing');
assert.equal(typeof context.window.addSentence, 'function', 'addSentence API missing');
assert.equal(typeof context.window.reduceSentence, 'function', 'reduceSentence API missing');

const state = context.window.getGameState();
assert.equal(state.maxEnergy, 250, 'default max energy changed unexpectedly');
assert.equal(state.energy, 250, 'default energy changed unexpectedly');
assert.equal(state.jailRequired, 500, 'default jail requirement changed unexpectedly');
assert.equal(state.sentenceDays, 100, 'default sentence changed unexpectedly');

state.saveUpdatedAt = 1000;
context.window.saveGame();
const saved = JSON.parse(context.localStorage.getItem('avtoritet_save_v2'));
assert.ok(saved.saveUpdatedAt >= 1001, 'save timestamp must never move backwards');
assert.equal(saved.energy, 250, 'save/load state shape changed unexpectedly');

state.sentenceDays = 100;
state.servedSentenceMinutes = 0;
context.window.addSentence(3, 'test');
assert.equal(state.sentenceDays, 103, 'adding a sentence must increase the sentence');

context.window.reduceSentence(3, 'test');
assert.equal(state.sentenceDays, 100, 'reducing a sentence must remove the requested days');

state.tasks = { taps: 10000, crit: 0, events: 0, earned: 0, jail: 0, bugorSuccess: 0, npcSuccess: 0 };
state.completed = {};
state.achievements = {};
context.window.checkTasks();
assert.equal(state.completed.taps10000 != null, true, 'task completion logic is broken');
assert.equal(state.chifir, 500, 'task reward logic is broken');

console.log('Game invariants: OK');
