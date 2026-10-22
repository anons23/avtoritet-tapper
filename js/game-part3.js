function jailTap(e){if(!s.jailed)return;e&&e.preventDefault&&e.preventDefault();if(s.jailTaps>=s.jailRequired)return;s.jailTaps++;if(s.jailTaps%100===0)reduceSentence(1,'работа в карцере');const t=$('tap-object');if(t){t.classList.remove('punch');void t.offsetWidth;t.classList.add('punch')}if(typeof window.animateObjectVisual==='function')window.animateObjectVisual();feedback(e,1,false);if(s.jailTaps>=s.jailRequired)releaseFromJail();else ui();save()}
function releaseFromJail(){const confiscated=Math.max(0,Math.floor(s.confiscatedChifir));s.jailed=false;s.confiscatedChifir=0;s.jailTaps=0;s.tasks.jail=(s.tasks.jail||0)+1;s.jailProtection=250;msg('🔓 Карцер пройден! Тебя выпустили. 🍵 Изъято чефира: '+fmt(confiscated));tasksCheck();ui();saveNow()}
function enterJail(reason){if(s.jailed)return;addSentence(3,'карцер');s.jailed=true;s.jailRequired=500;s.jailTaps=0;const jailRate=.20+Math.random()*.05;s.confiscatedChifir=Math.min(Math.max(0,Math.floor(s.chifir)),Math.floor(Math.max(0,s.chifir)*jailRate));s.chifir=Math.max(0,s.chifir-s.confiscatedChifir);s.jailProtection=0;activeEvent=false;const o=$('modal-overlay');if(o){o.dataset.locked='0';o.classList.add('hidden')}msg('🚨 Ты загремел в карцер из-за своего буйного характера. Надзиратели нашли твой тайник и забрали '+fmt(s.confiscatedChifir)+' 🍵 чефира.');if(reason)msg(reason+' Отсидеть: 500 тапов.');ui();saveNow()}
function checkAchievements(){let changed=false;Object.entries(ACHIEVEMENTS).forEach(([id,a])=>{if(!s.achievements[id]&&a.check()){s.achievements[id]={unlockedAt:Date.now()};changed=true;msg('🏆 Достижение разблокировано: '+a.title)}});return changed}
function tasksCheck(){if(!s.tasks)return;const storyChanged=checkStoryProgress();let changed=storyChanged;Object.entries(TASKS).forEach(([id,t])=>{if(!s.completed[id]&&t.get()>=t.target){s.completed[id]={completedAt:Date.now()};const reward=t.reward;if(t.rewardType==='points')s.points+=t.rewardAmount;else s.chifir+=t.rewardAmount;s.tasks.completedCount=(s.tasks.completedCount||0)+1;reduceSentence(1,'выполнено поручение');msg('🎯 Поручение выполнено: '+t.title+' · награда '+reward);changed=true}});if(checkAchievements())changed=true;if(changed){saveNow();ui()}}
window.checkTasks=tasksCheck;
window.getGameState=()=>s;
window.getStoryState=()=>STORY.map((x,i)=>({...x,unlocked:!!(s.storySeen&&s.storySeen[i])}));
function tap(e){tickSentence(Date.now());if(s.jailed){jailTap(e);return}if(activeEvent)return;e&&e.preventDefault&&e.preventDefault();restoreEnergy(Date.now());if(s.energy<1){msg('⚡ Энергия закончилась. Отдохни или используй бонус.');return}s.energy--;s.totalTaps++;s.tasks.taps++;if(s.energy===s.maxEnergy-1)s.lastEnergyTime=Date.now();if(s.jailProtection>0)s.jailProtection--;const oldObject=s.currentObject;let g=TEST_MODE?TEST_POINTS_PER_TAP:s.power*O[s.currentObject][2];const c=Math.random()<s.critChance;if(c&&!TEST_MODE){g*=2;s.tasks.crit++}else if(c){s.tasks.crit++}if(s.boosters.double>0&&!TEST_MODE){g*=2;s.boosters.double--}s.chifir+=g;s.tasks.earned+=g;s.points+=g;const current=highestUnlocked();s.currentObject=current;if(oldObject!==s.currentObject){ui();}if(typeof window.refreshObjectVisuals==='function'){window.refreshObjectVisuals();}const t=$('tap-object');if(t){t.classList.remove('punch');void t.offsetWidth;t.classList.add('punch')}if(typeof window.animateObjectVisual==='function')window.animateObjectVisual();feedback(e,Math.floor(g),c);if(s.currentObject===4){s.authorityTaps=Math.max(0,Math.floor(s.authorityTaps||0))+1;if(s.authorityTaps>=50&&!c&&Math.random()<.18){s.authorityTaps=0;if(typeof window.startAuthorityDeal==='function')setTimeout(()=>window.startAuthorityDeal(),0);}}else{s.authorityTaps=0}syncObject(false);if(oldObject!==s.currentObject){msg('🏆 Новая масть: '+R[s.currentObject][0]+' · новый этап: '+O[s.currentObject][0]);ui();}if(Math.random()<.025)msg(FUN[Math.floor(Math.random()*FUN.length)]);if(Math.random()<.025&&s.points-s.lastChoiceEvent>150)openEvent();tasksCheck();ui();save()}
function openModal(h,locked=false){if(s.jailed)return;const c=$('modal-content'),o=$('modal-overlay');if(!c||!o)return;c.innerHTML=h;o.classList.remove('hidden');o.dataset.locked=locked?'1':'0'}
function closeModal(){const o=$('modal-overlay');if(!o)return;if(o.dataset.locked==='1')return;o.classList.remove('raid-fullscreen');o.classList.add('hidden')}
function finishEvent(){activeEvent=false;const o=$('modal-overlay');if(o)o.dataset.locked='0';closeModal();tasksCheck();ui();saveNow()}
function openEvent(){
  if(s.jailed||activeEvent)return;
  const stage=Math.max(0,Number(s.currentObject)||0);
  const available=EVENTS.filter(e=>stage>=Number(e[3]||0));
  if(!available.length)return;
  activeEvent=true;
  const v=available[Math.floor(Math.random()*available.length)];
  let h='<h2>⚠️ '+v[0]+'</h2><p>'+v[1]+'</p><p><b>Ситуация меняется — решай быстро:</b></p><div class="choices">';
  v[2].forEach((c,i)=>h+='<button type="button" class="choice" data-i="'+i+'">'+c[0]+'</button>');
  openModal(h+'</div>',true);
  document.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    if(!activeEvent||s.jailed)return;
    const c=v[2][Number(b.dataset.i)];
    s.tasks.events++;
    s.lastChoiceEvent=s.points;
    if(Math.random()<c[1]){
      s.chifir+=c[2];
      s.tasks.earned+=c[2];
      s.points+=c[3];
      s.respect=Math.max(0,(s.respect||0)+Number(c[4]||0));
      const bonus=c[4]?(' · уважение '+(c[4]>0?'+':'')+c[4]):'';
      choiceResult('Удачно!  +'+c[2]+' 🍵  +'+c[3]+' ⭐'+bonus,true);
      finishEvent();
    }else{
      const loss=Math.max(3,Math.ceil(Math.max(1,c[3])*1.5));addSentence(c[1]>=.6?2:1,'провал события');
      s.points=Math.max(0,s.points-loss);
      if(c[1]>0&&s.jailProtection<=0&&Math.random()<.08){
        finishEvent();
        enterJail('❌ Рискованный ход провалился.');
      }else{
        choiceResult('Не повезло. Последствия уже чувствуются.',false);
        finishEvent();
      }
    }
  }));
}
function shop(){if(s.jailed){msg('🔒 Качалка закрыта до выхода из карцера');return}openModal('<div class="section-window shop-window"><div class="section-kicker">ПРОКАЧКА</div><h2>💪 Качалка</h2><p class="section-subtitle">Трать чефир на постоянные улучшения. Новые этапы открываются автоматически при смене масти ⭐.</p><div class="shop-grid"><button type="button" data-b="p">💪 <b>Сила</b><br><small>+1 сила</small><br>Цена '+(100+s.upgrades.power*250)+' 🍵</button><button type="button" data-b="c">🎯 <b>Крит</b><br><small>+2% к шансу</small><br>Цена '+(300+s.upgrades.crit*500)+' 🍵</button><button type="button" data-b="e">⚡ <b>Энергия</b><br><small>+25 максимум</small><br>Цена '+(400+s.upgrades.energyMax*700)+' 🍵</button><button type="button" data-b="d">🔥 <b>Ускоритель</b><br><small>×2 на 100 тапов</small><br>Цена 500 🍵</button></div></div>');document.querySelectorAll('[data-b]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.b,cost=type==='p'?100+s.upgrades.power*250:type==='c'?300+s.upgrades.crit*500:type==='e'?400+s.upgrades.energyMax*700:500;if(s.chifir<cost){msg('🍵 Не хватает чефира. Нужно '+cost+'.');return}s.chifir-=cost;if(type==='p'){s.power++;s.upgrades.power++}if(type==='c'){s.critChance=Math.min(.5,s.critChance+.02);s.upgrades.crit++}if(type==='e'){s.maxEnergy+=25;s.energy=s.maxEnergy;s.upgrades.energyMax++;s.lastEnergyTime=Date.now()}if(type==='d')s.boosters.double+=100;ui();saveNow();shop()}))}
function rankMenu(){if(s.jailed)return;const r=rank(),next=R.find(x=>x[1]>s.points);let stage='Физическая прокачка';if(s.currentObject===4)stage='Дела и влияние';openModal('<div class="section-window"><div class="section-kicker">ПРОГРЕСС</div><h2>🏆 Масть</h2><p>Твоя масть: <b>'+r[0]+'</b></p><p>Текущий этап: <b>'+O[s.currentObject][0]+'</b> · '+stage+'</p><p>Следующая ступень: '+(next?next[0]:'Максимальная масть')+(next?' · '+fmt(next[1])+' ⭐':'')+'</p></div>')}
function tasksMenu(){if(s.jailed)return;const cards=Object.entries(TASKS).map(([id,t])=>{const cur=Math.min(t.target,Math.floor(t.get())),done=!!s.completed[id];return '<div class="task-card '+(done?'task-done':'')+'"><div class="task-icon">'+(done?'✓':'🎯')+'</div><div class="task-body"><b>'+t.title+'</b><p>'+t.desc+'</p><div class="task-progress"><span style="width:'+Math.min(100,cur/t.target*100)+'%"></span></div><small>'+cur+' / '+t.target+' · Награда: <strong>'+t.reward+'</strong></small></div></div>'}).join('');openModal('<div class="section-window tasks-window"><div class="section-kicker">ЦЕЛИ НА СЕЙЧАС</div><h2>🎯 Поручения</h2><p class="section-subtitle">Выполняй простые цели и забирай награды. Здесь нет статистики ради статистики — каждое поручение даёт приз.</p><div class="tasks-list">'+cards+'</div><div class="tasks-footer">Выполнено поручений: <b>'+Object.keys(s.completed).length+'</b></div></div>')}
function more(){
  if(s.jailed)return;
  if(typeof window.renderBarrack==='function'){
    window.renderBarrack();
    return;
  }
  openModal('<div class="section-window barrack-window"><div class="section-kicker">ТВОЁ МЕСТО</div><h2>☰ Барак</h2><p class="section-subtitle">Загрузка персонажей барака…</p><div class="npc-list"><div class="achievement-card"><div class="achievement-icon">⏳</div><div><b>Загружаем барак</b><p>Персонажи появятся после загрузки игрового модуля.</p></div></div></div></div>');
}function bind(){
  load();
  ui();
  const tapArea=$('tap-area');
  let lastTapAt=0;
  const handleTap=e=>{
    const now=Date.now();
    if(now-lastTapAt<120)return;
    lastTapAt=now;
    if(e.cancelable)e.preventDefault();
    tap(e);
  };
  if(tapArea){
    tapArea.addEventListener('pointerdown',handleTap,{capture:true,passive:false});
  }
  $('btn-shop')?.addEventListener('click',shop);
  $('btn-rank')?.addEventListener('click',rankMenu);
  $('btn-tasks')?.addEventListener('click',tasksMenu);
  $('btn-more')?.addEventListener('click',more);
  $('modal-close')?.addEventListener('click',closeModal);
  setInterval(()=>{
    restoreEnergy(Date.now());
    ui();
  },1000);

  /* Backup save: passive energy/sentence progress is persisted every 15s. */
  setInterval(()=>{
    saveNow();
  },LOCAL_SAVE_BACKUP);

  window.addEventListener('pagehide',function(){if(!window.__AVT_RESET_LOCK)saveNow();});
  window.addEventListener('beforeunload',function(){if(!window.__AVT_RESET_LOCK)saveNow();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
