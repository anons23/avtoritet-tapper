const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'yandex-sdk.js'),
  'utf8'
);

let rewardedCallbacks = null;
let watchdog = null;
let watchdogId = 0;
let gameplayStarts = 0;
let gameplayStops = 0;

const fakePlayer = {
  async getData(){ return {}; },
  async setData(){},
  async setStats(){}
};

const fakeYsdk = {
  features:{
    GameplayAPI:{
      start(){ gameplayStarts++; },
      stop(){ gameplayStops++; }
    }
  },
  async getPlayer(){ return fakePlayer; },
  on(){},
  adv:{
    showRewardedVideo({callbacks}){
      rewardedCallbacks=callbacks;
    },
    showFullscreenAdv(){}
  },
  serverTime(){ return Date.now(); }
};

const realSetTimeout = setTimeout;
const realClearTimeout = clearTimeout;

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
  setTimeout(fn,ms){
    if(ms===120000){
      watchdog=fn;
      watchdogId++;
      return watchdogId;
    }
    return realSetTimeout(fn,ms);
  },
  clearTimeout(id){
    if(id===watchdogId)watchdog=null;
    else realClearTimeout(id);
  },
  setInterval(){ return 1; },
  clearInterval(){},
  window:{
    YaGames:{
      async init(){ return fakeYsdk; }
    },
    addEventListener(){}
  },
  document:{
    addEventListener(){}
  },
  localStorage:{
    data:Object.create(null),
    getItem(key){ return this.data[key] ?? null; },
    setItem(key,value){ this.data[key]=String(value); },
    removeItem(key){ delete this.data[key]; }
  }
};

context.globalThis=context;

vm.runInNewContext(source,context,{filename:'js/yandex-sdk.js'});

(async()=>{
  await context.window.YandexGameReady;

  assert.equal(
    typeof context.window.showRewardedAd,
    'function',
    'showRewardedAd API is missing'
  );

  // 1) User starts an ad, closes it without reward.
  let result=[];
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    true,
    'first rewarded ad should start'
  );

  const first=rewardedCallbacks;
  assert.ok(first,'first rewarded callbacks were not registered');

  // 2) Fast second click must be rejected while the first ad is active.
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    false,
    'second rewarded ad must be blocked while busy'
  );

  first.onClose(false);
  assert.deepEqual(result,[false],'closing without reward must notify false');

  // 3) onRewarded grants exactly one reward even if close follows.
  result=[];
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    true,
    'second rewarded session should start after cleanup'
  );

  const second=rewardedCallbacks;
  second.onRewarded();
  second.onRewarded();
  second.onClose(true);

  assert.deepEqual(
    result,
    [true],
    'reward callback must fire exactly once'
  );

  // 4) SDK error must finish the session without a reward.
  result=[];
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    true,
    'third rewarded session should start'
  );

  const third=rewardedCallbacks;
  third.onError(new Error('test error'));

  assert.deepEqual(
    result,
    [false],
    'SDK error must notify false'
  );

  // 5) Hung ad: watchdog must release the game and report no reward.
  result=[];
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    true,
    'fourth rewarded session should start'
  );

  assert.equal(typeof watchdog,'function','rewarded watchdog was not installed');
  const firstWatchdog=watchdog;
  firstWatchdog();

  assert.deepEqual(
    result,
    [false],
    'watchdog timeout must notify false'
  );

  // 6) A stale callback from the old session must not unlock a new ad.
  result=[];
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    true,
    'new rewarded session should start'
  );

  const stale=rewardedCallbacks;
  const staleWatchdog=watchdog;
  staleWatchdog();

  result=[];
  assert.equal(
    context.window.showRewardedAd(ok=>result.push(ok)),
    true,
    'another rewarded session should start after watchdog cleanup'
  );

  const current=rewardedCallbacks;
  stale.onClose(false);

  assert.equal(
    context.window.showRewardedAd(()=>{}),
    false,
    'stale callback must not unlock the current rewarded session'
  );

  current.onClose(false);

  assert.ok(gameplayStops>=1,'GameplayAPI.stop was not called');
  assert.ok(gameplayStarts>=1,'GameplayAPI.start was not restored');

  console.log('Rewarded ad lifecycle: OK');
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
