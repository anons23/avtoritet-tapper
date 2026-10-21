
function writeSave(){
  try{
    if(window.__AVT_RESET_LOCK)return false;
    s.saveUpdatedAt=nextSaveTimestamp();
    localStorage.setItem('avtoritet_save_v2',JSON.stringify(s));
    return true;
  }catch(e){
    return false;
  }
}

function save(){
  clearTimeout(localSaveTimer);
  localSaveTimer=setTimeout(()=>{
    localSaveTimer=null;
    writeSave();
  },LOCAL_SAVE_DEBOUNCE);
}

function saveNow(){
  clearTimeout(localSaveTimer);
  localSaveTimer=null;
  return writeSave();
}

window.saveGame=saveNow;
function restoreEnergy(now){now=Number(now)||Date.now();if(!Number.isFinite(s.lastEnergyTime))s.lastEnergyTime=now;if(!Number.isFinite(s.energy))s.energy=0;if(!Number.isFinite(s.maxEnergy)||s.maxEnergy<1)s.maxEnergy=250;if(s.energy>=s.maxEnergy){s.energy=s.maxEnergy;s.lastEnergyTime=now;return 0}const elapsed=Math.max(0,now-s.lastEnergyTime),gain=Math.floor(elapsed/30000);if(gain>0){s.energy=Math.min(s.maxEnergy,s.energy+gain);s.lastEnergyTime+=gain*30000;if(s.energy>=s.maxEnergy)s.lastEnergyTime=now}return gain}
function spendEnergyForRaid(){
  restoreEnergy(Date.now());
  if(s.energy<1)return false;
  s.energy--;
  if(s.energy===s.maxEnergy-1)s.lastEnergyTime=Date.now();
  save();
  ui();
  return true;
}
window.spendEnergyForRaid=spendEnergyForRaid;

function highestUnlocked(){let i=0;for(let j=0;j<R.length;j++)if(s.points>=R[j][1])i=j;return Math.min(i,O.length-1)}
function syncObject(showMessage){const next=highestUnlocked(),old=s.currentObject;if(showMessage&&next>old)msg('🏆 Новая масть: '+R[next][0]+' · новый этап: '+O[next][0]);s.currentObject=next}
function checkStoryProgress(silent=false){
  if(!s.storySeen||typeof s.storySeen!=='object')s.storySeen={};
  let changed=false;
  STORY.forEach((part,i)=>{
    if(s.currentObject>=part.rank&&!s.storySeen[i]){
      s.storySeen[i]={unlockedAt:Date.now()};
      if(!silent)msg('📖 Открыта новая часть истории: '+part.title);
      changed=true;
    }
  });
  return changed;
}
function load(){try{const raw=localStorage.getItem('avtoritet_save_v2');if(raw){const d=JSON.parse(raw);if(d&&typeof d==='object')s={...s,...d,upgrades:{...s.upgrades,...(d.upgrades||{})},tasks:{...s.tasks,...(d.tasks||{})},boosters:{...s.boosters,...(d.boosters||{})},achievements:{...s.achievements,...(d.achievements||{})}}}}catch(e){}if(!s.nickname)s.nickname=N[Math.floor(Math.random()*N.length)];if(!Number.isFinite(s.energy))s.energy=250;if(Number(s.energy)<=0&&!Number(s.energyRepairVersion)){s.energy=Math.max(1,Number(s.maxEnergy)||250);s.lastEnergyTime=Date.now();s.energyRepairVersion=1;}if(!Number.isFinite(s.maxEnergy))s.maxEnergy=250;if(!Number.isFinite(s.lastEnergyTime))s.lastEnergyTime=Date.now();if(!Number.isFinite(s.saveUpdatedAt))s.saveUpdatedAt=Date.now();if(!Number.isFinite(s.jailTaps)||s.jailTaps<0)s.jailTaps=0;if(!Number.isFinite(s.jailRequired)||s.jailRequired<1)s.jailRequired=500;if(!Number.isFinite(s.confiscatedChifir)||s.confiscatedChifir<0)s.confiscatedChifir=0;if(!Number.isFinite(s.jailProtection)||s.jailProtection<0)s.jailProtection=0;if(!Number.isFinite(s.sentenceDays)||s.sentenceDays<0)s.sentenceDays=100;if(!Number.isFinite(s.servedSentenceMinutes)||s.servedSentenceMinutes<0)s.servedSentenceMinutes=0;if(!Number.isFinite(s.lastSentenceTick))s.lastSentenceTick=Date.now();if(!Number.isFinite(s.sentenceReleaseCount))s.sentenceReleaseCount=0;if(!Number.isFinite(s.tasks.bugorSuccess))s.tasks.bugorSuccess=0;if(!Number.isFinite(s.tasks.npcSuccess))s.tasks.npcSuccess=0;if(s.achievements&&typeof s.achievements==='object')delete s.achievements.rankThief;if(s.storySeen&&typeof s.storySeen==='object')delete s.storySeen[5];restoreEnergy(Date.now());syncObject(false);checkStoryProgress(true);tasksCheck();saveNow()}
function fmt(n){n=Math.floor(Number(n)||0);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n)}
function rank(){let r=R[0];for(const x of R)if(s.points>=x[1])r=x;return r}
function updateRankGoal(){
  const label=$('rank-goal-label'),value=$('rank-goal-value'),fill=$('rank-goal-fill');
  if(!label||!value||!fill)return;
  const current=rank(),i=R.findIndex(x=>x[0]===current[0]);
  const next=R[i+1];
  if(!next){
    label.textContent='Максимальная масть';
    value.textContent='50 000 ⭐ · максимум';
    fill.style.width='100%';
    return;
  }
  const start=current[1],target=next[1],progress=Math.max(0,Math.min(1,(s.points-start)/(target-start)));
  label.textContent='До следующей масти: '+next[0];
  value.textContent=fmt(Math.max(0,target-s.points))+' ⭐ осталось';
  fill.style.width=(progress*100).toFixed(1)+'%';
}
function requestNameChange(value){const name=String(value??'').trim().replace(/[<>]/g,'').slice(0,24);if(!name){msg('🥷 Введи погремуху');return false}s.nickname=name;saveNow();ui();msg('🥷 Погремуха изменена: '+name);return true}
window.requestNameChange=requestNameChange;
function updateEnergyHint(){
  const el=$('energy-hint');
  if(!el)return;
  if(s.energy>=s.maxEnergy){el.textContent='✓ Полная';return}
  const left=Math.max(0,30000-(Date.now()-s.lastEnergyTime));
  const sec=Math.ceil(left/1000);
  const mins=Math.floor(sec/60),secs=sec%60;
  el.textContent='+1 через '+(mins?mins+'м ':'')+String(secs).padStart(2,'0')+'с';
}
function updateSentenceUi(){
  const left=$('sentence-left'),detail=$('sentence-detail'),fill=$('sentence-fill');
  if(!left||!detail||!fill)return;
  const total=Math.max(0,Number(s.sentenceDays)||0);
  const served=Math.min(total,Number(s.servedSentenceMinutes||0)/SENTENCE_MINUTES_PER_DAY);
  const remaining=Math.max(0,total-served);
  left.textContent=remaining<=0?'Свобода':Math.ceil(remaining)+' дн.';
  detail.textContent=remaining<=0?'Срок отбыт.':('Отбыл '+Math.floor(served)+' / '+Math.ceil(total)+' дней · 1 день = 10 мин активной игры');
  fill.style.width=(total?Math.min(100,served/total*100):100).toFixed(1)+'%';
}
function ui(){tickSentence(Date.now());const set=(id,value)=>{const el=$(id);if(el)el.textContent=value};set('chifir',fmt(s.chifir));set('points',fmt(s.points));set('energy',Math.floor(s.energy));set('max-energy',s.maxEnergy);updateEnergyHint();set('authority-influence-value',fmt(s.points));set('nickname',s.nickname);set('rank',rank()[0]);updateRankGoal();updateSentenceUi();set('power-stat',s.power);set('respect-stat',s.respect);set('wealth-stat',s.wealth);const o=O[s.currentObject]||O[0],emoji=$('object-emoji'),name=$('object-name'),action=$('object-action');if(emoji){emoji.dataset.objectIndex=String(s.currentObject);const mark=emoji.querySelector('.jail-emoji-mark');if(s.jailed){emoji.querySelectorAll('img[data-stage]').forEach(img=>{img.style.display='none';});if(!mark){const m=document.createElement('span');m.className='jail-emoji-mark';m.textContent='⛓️';emoji.appendChild(m);}}else if(mark){mark.remove();}}if(name){const next=s.jailed?'Карцер':o[0];if(name.textContent!==next)name.textContent=next;}if(action){const next=s.jailed?'ТАПАЙ ДЛЯ ВЫХОДА':s.currentObject===4?'РАЗОБРАТЬ ДЕЛО':'ТАПАЙ!';if(action.textContent!==next)action.textContent=next;}const gc=$('game-container');if(gc)gc.classList.toggle('jail-mode',!!s.jailed);const jp=$('jail-panel');if(jp){jp.classList.toggle('hidden',!s.jailed);const jc=$('jail-count'),jl=$('jail-left');if(s.jailed){if(jc)jc.textContent=Math.min(s.jailTaps,s.jailRequired)+' / '+s.jailRequired;if(jl)jl.textContent=Math.max(0,s.jailRequired-s.jailTaps)}else{if(jc)jc.textContent='0 / '+s.jailRequired;if(jl)jl.textContent=s.jailRequired}}['btn-shop','btn-rank','btn-tasks','btn-more'].forEach(id=>{const b=$(id);if(b)b.disabled=!!s.jailed})}
function choiceResult(x,ok){const e=$('choice-result');if(!e)return;e.textContent=String(x);e.classList.remove('show','success','fail');e.classList.add(ok?'success':'fail');void e.offsetWidth;e.classList.add('show');clearTimeout(choiceResult.timer);choiceResult.timer=setTimeout(()=>e.classList.remove('show'),2600)}
window.choiceResult=choiceResult;
function msg(x){messageQueue.push(String(x));processMessages()}
function processMessages(){if(messageBusy||!messageQueue.length)return;const e=$('event-message');if(!e){messageQueue=[];return}messageBusy=true;e.textContent=messageQueue.shift();e.classList.add('show');setTimeout(()=>{e.classList.remove('show');setTimeout(()=>{messageBusy=false;processMessages()},250)},4200)}
function feedback(e,n,c){
  let x=$('tap-feedback');
  if(!x){
    x=document.createElement('div');
    x.id='tap-feedback';
    const parent=$('tap-area')||$('game-container')||document.body;
    parent.appendChild(x);
  }
  x.textContent=(c?'КРИТ! ':'+')+n;
  x.style.left=(e&&e.clientX||150)+'px';
  x.style.top=(e&&e.clientY||250)+'px';
  x.classList.remove('show');
  void x.offsetWidth;
  x.classList.add('show');
}
