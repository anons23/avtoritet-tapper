const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const gameSource = read('js/game.js');
const authoritySource = read('js/authority-ui.js');
const authorityGateSource = read('js/authority-gate.js');
const prisonSource = read('js/prison-ui.js');
const yandexSource = read('js/yandex-sdk.js');
const migrationSource = read('js/save-migration.js');

assert.ok(gameSource.length > 10000, 'game.js looks truncated or replaced by a stub');
assert.match(gameSource, /const TEST_MODE=true;/, 'test mode must remain enabled for the current test branch');
assert.match(gameSource, /window\.saveGame=saveNow;/, 'central immediate save API is missing');
assert.equal(
  (gameSource.match(/window\.saveGame=/g)||[]).length,
  1,
  'game.js must expose exactly one saveGame API'
);
assert.match(
  gameSource,
  /const LOCAL_SAVE_DEBOUNCE=1500/,
  'local save debounce is missing'
);
assert.match(
  gameSource,
  /const LOCAL_SAVE_BACKUP=15000/,
  'periodic local save backup is missing'
);
assert.doesNotMatch(
  gameSource,
  /setInterval\(\(\)=>\{restoreEnergy\(Date\.now\(\)\);ui\(\);save\(\)\},1000\)/,
  'game.js still writes localStorage every second'
);
assert.match(gameSource, /function trustedSaveTime\(\)/, 'trusted save time helper is missing');
assert.match(gameSource, /serverTime\(\)/, 'Yandex server time is not used for save timestamps');
assert.match(migrationSource, /const BACKUP_KEY='avtoritet_save_v2_backup';/, 'migration backup key is missing');
assert.doesNotMatch(migrationSource, /localStorage\.removeItem\(KEY\)/, 'migration must never delete the main save on failure');

assert.doesNotMatch(
  authorityGateSource,
  /setInterval\(\(\)=>\{wrapMessages\(\);guard\(\)\},80\)/,
  '80ms authority polling is still present'
);

assert.doesNotMatch(
  prisonSource,
  /setInterval\(check,100\)/,
  '100ms prison polling is still present'
);

assert.match(
  authoritySource,
  /dealResolving=false/,
  'authority deal re-entry guard is missing'
);

assert.match(
  authoritySource,
  /if\(!modalOpen\|\|dealResolving\)return;/,
  'authority deal double-submit guard is missing'
);

assert.match(
  yandexSource,
  /function backupConflict\(/,
  'cloud conflict backup helper is missing'
);

assert.match(
  yandexSource,
  /onRewarded:handleRewarded/,
  'rewarded-ad reward handler is missing'
);

assert.match(
  yandexSource,
  /function localSnapshotKey\(/,
  'lightweight local snapshot polling is missing'
);

assert.doesNotMatch(
  yandexSource,
  /const data=snapshot\(\);const key=snapshotKey\(data\);/,
  'cloud polling still serializes the full snapshot every cycle'
);

assert.match(
  yandexSource,
  /setInterval\(pollLocalChanges,2000\)/,
  'cloud polling interval was not reduced to 2 seconds'
);

assert.match(
  yandexSource,
  /if\(!rewarded\)[\s\S]{0,80}notify\(false\)/,
  'rewarded-ad close/error fallback is missing'
);

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
  window: { ysdk: { serverTime: () => 2000000000000 } },
  document: {
    readyState: 'loading',
    visibilityState: 'visible',
    addEventListener() {},
    getElementById() { return null; }
  },
  localStorage: {
    data: Object.create(null),
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.data, key)
        ? this.data[key]
        : null;
    },
    setItem(key, value) {
      this.data[key] = String(value);
    },
    removeItem(key) {
      delete this.data[key];
    }
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

const saved = JSON.parse(
  context.localStorage.getItem('avtoritet_save_v2')
);

assert.ok(
  saved.saveUpdatedAt >= 2000000000000,
  'save timestamp must use trusted server time when available'
);

assert.equal(
  saved.energy,
  250,
  'save state shape changed unexpectedly'
);

state.sentenceDays = 100;
state.servedSentenceMinutes = 0;

context.window.addSentence(3, 'test');

assert.equal(
  state.sentenceDays,
  103,
  'adding a sentence must increase the sentence'
);

context.window.reduceSentence(3, 'test');

assert.equal(
  state.sentenceDays,
  100,
  'reducing a sentence must remove the requested days'
);

state.sentenceDays = 1;
state.servedSentenceMinutes = 10;
state.jailed = false;
const releasesBefore = Number(state.sentenceReleaseCount) || 0;

context.window.reduceSentence(1, 'full sentence test');

assert.equal(state.sentenceDays, 0, 'completed sentence must end at zero days');
assert.equal(state.servedSentenceMinutes, 0, 'completed sentence must reset served minutes');
assert.equal(
  state.sentenceReleaseCount,
  releasesBefore + 1,
  'completed sentence must release the player exactly once'
);

state.tasks = {
  taps: 10000,
  crit: 0,
  events: 0,
  earned: 0,
  jail: 0,
  bugorSuccess: 0,
  npcSuccess: 0
};

state.completed = {};
state.achievements = {};

context.window.checkTasks();

assert.ok(
  state.completed.taps10000,
  'task completion logic is broken'
);

assert.equal(
  state.chifir,
  500,
  'task reward logic is broken'
);


state.sentenceDays = 0;
state.servedSentenceMinutes = 0;
state.lastSentenceTick = Date.now() - 120000;
const releaseAfterFullSentence = Number(state.sentenceReleaseCount) || 0;

context.window.reduceSentence(1, 'after release');
assert.equal(state.sentenceDays, 0, 'free state must not resurrect a sentence when reducing');
assert.equal(context.window.getGameState().sentenceDays, 0, 'free state must remain zero');

assert.equal(
  state.sentenceReleaseCount,
  releaseAfterFullSentence,
  'release counter must not increase after the player is already free'
);

state.sentenceDays = 5;
state.servedSentenceMinutes = 20;
context.window.addSentence(2, 'extension test');

assert.equal(
  state.sentenceDays,
  7,
  'extending an active sentence must add days without replacing the existing sentence'
);
assert.equal(
  state.servedSentenceMinutes,
  20,
  'extending an active sentence must preserve already served time'
);

state.sentenceDays = 0;
state.servedSentenceMinutes = 0;
context.window.addSentence(3, 'new sentence test');

assert.equal(
  state.sentenceDays,
  103,
  'adding a sentence after release must start a fresh sentence from the base term'
);
assert.equal(
  state.servedSentenceMinutes,
  0,
  'new sentence after release must reset served time'
);

state.sentenceDays = 0;
state.servedSentenceMinutes = 0;
context.window.reduceSentence(3, 'free-state regression');

assert.equal(
  state.sentenceDays,
  0,
  'full lifecycle regression: a free player must remain free after sentence reduction'
);

assert.equal(
  context.window.getGameState().sentenceDays,
  0,
  'sentence lifecycle must keep zero as the persistent free state'
);

console.log('Game invariants: OK');
