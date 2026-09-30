/* RAID SYSTEM - selection, progress, energy, reactions */
'use strict';
(()=>{
  const RAID_RANK_REQUIREMENTS=[0,1500,5000,15000,50000];
  const RAID_FIGHTERS=[
    {id:'petrovich',name:'ПЕТРОВИЧ',rank:0,hp:1500,first:{chifir:2000,points:150},repeat:{chifir:500,points:40},scene:'talk'},
    {id:'vtirach',name:'ВТИРАЧ',rank:0,hp:2000,first:{chifir:2500,points:200},repeat:{chifir:625,points:50},scene:'talk'},
    {id:'mafioznik',name:'МАФИОЗНИК',rank:1,hp:3000,first:{chifir:4000,points:300},repeat:{chifir:1000,points:75},scene:'fight'},
    {id:'mongol',name:'МОНГОЛ',rank:1,hp:4000,first:{chifir:5500,points:400},repeat:{chifir:1375,points:100},scene:'fight'},
    {id:'glaz',name:'ГЛАЗ',rank:2,hp:5000,first:{chifir:7000,points:500},repeat:{chifir:1750,points:125},scene:'glaz'},
    {id:'krest',name:'КРЕСТ',rank:3,hp:6500,first:{chifir:9000,points:700},repeat:{chifir:2250,points:175},scene:'krest'},
    {id:'psikh',name:'ПСИХ АРКАША',rank:4,hp:8000,first:{chifir:12000,points:1000},repeat:{chifir:3000,points:250},scene:'psikh'}
  ];
  const FIGHTER_IDLE_VIDEO={
    mafioznik:'./assets/raids/fighters/mafioznik_idle.webm',
    petrovich:'./assets/raids/fighters/petrovich.webm',
    vtirach:'./assets/raids/fighters/Vtirach.webm',
    mongol:'./assets/raids/fighters/Mongol.webm',
    glaz:'./assets/raids/fighters/Glaz.webm',
    krest:'./assets/raids/fighters/krest.webm',
    psikh:'./assets/raids/fighters/psikh.webm'
  };
  const FIGHTER_HIT_FRAMES={
    mafioznik:['./assets/raids/fighters/mafioznik_hit_1.png','./assets/raids/fighters/mafioznik_hit_2.png','./assets/raids/fighters/mafioznik_hit_3.png','./assets/raids/fighters/mafioznik_hit_4.png'],
    petrovich:['./assets/raids/fighters/petrovich1.png','./assets/raids/fighters/petrovich2.png','./assets/raids/fighters/petrovich3.png','./assets/raids/fighters/petrovich4.png'],
    vtirach:['./assets/raids/fighters/Vtirach1.png','./assets/raids/fighters/Vtirach2.png','./assets/raids/fighters/Vtirach3.png','./assets/raids/fighters/Vtirach4.png'],
    mongol:['./assets/raids/fighters/Mongol1.png','./assets/raids/fighters/Mongol2.png','./assets/raids/fighters/Mongol3.png','./assets/raids/fighters/Mongol4.png'],
    glaz:['./assets/raids/fighters/Glaz1.png','./assets/raids/fighters/Glaz2.png','./assets/raids/fighters/Glaz3.png','./assets/raids/fighters/Glaz4.png'],
    krest:['./assets/raids/fighters/krest1.jpg','./assets/raids/fighters/krest2.jpg','./assets/raids/fighters/krest3.jpg','./assets/raids/fighters/krest4.jpg','./assets/raids/fighters/krest5.jpg'],
    psikh:['./assets/raids/fighters/psikh1.jpg','./assets/raids/fighters/psikh2.jpg','./assets/raids/fighters/psikh3.jpg','./assets/raids/fighters/psikh4.jpg','./assets/raids/fighters/psikh5.jpg']
  };
  const FIGHTER_PORTRAIT={
    mafioznik:'./assets/raids/fighters/mafioznik_hit_1.png',
    petrovich:'./assets/raids/fighters/petrovich1.png',
    vtirach:'./assets/raids/fighters/Vtirach1.png',
    mongol:'./assets/raids/fighters/Mongol1.png',
    glaz:'./assets/raids/fighters/Glaz1.png',
    krest:'./assets/raids/fighters/krest1.jpg',
    psikh:'./assets/raids/fighters/psikh1.jpg'
  };
  let lastHitFrame=-1;
  let idleResumeTimer=0;
  const IDLE_RESUME_MS=520;
  const $=id=>document.getElementById(id);
  const state=()=>window.getGameState?.();
  let raid={fighter:0,active:false};
  let raidTimeoutShown=false;
  let raidTicker=0;
  function s(){return state()}
  function progress(){
    const g=s(); if(!g)return {};
    if(!g.raidProgress||typeof g.raidProgress!=='object')g.raidProgress={};
    return g.raidProgress;
  }
  function unlocked(f){return (Number(s()?.points)||0)>=Number(RAID_RANK_REQUIREMENTS[f.rank]??0)}
  function pFor(f){
    const p=progress();
    if(!p[f.id])p[f.id]={hp:f.hp,startedAt:0,extensionUsed:false,wins:0};
    if(!Number.isFinite(p[f.id].hp)||p[f.id].hp<0)p[f.id].hp=f.hp;
    return p[f.id];
  }
  function formatTime(ms){const sec=Math.max(0,Math.ceil(ms/1000));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
  function remaining(f){
    const p=pFor(f);
    if(!p.startedAt||p.hp<=0)return 0;
    return Math.max(0,90*60*1000-(Date.now()-p.startedAt));
  }
  function save(){window.saveGame?.();window.ui?.()}
  function portraitSrc(f){return FIGHTER_PORTRAIT[f.id]||('./assets/raids/fighters/'+f.id+'.png')}
  function updateLowHp(pct){const bar=$('raid-hp');if(bar)bar.classList.toggle('low-hp',pct<=25&&pct>0)}
  function ensureRaidButton(){
    if($('raid-open-button'))return true;
    const parent=$('game-container')||document.body;
    if(!parent)return false;
    const btn=document.createElement('button');
    btn.id='raid-open-button';btn.type='button';btn.title='Рейды';
    btn.setAttribute('aria-label','Рейды');
    btn.innerHTML='<img src="./assets/raids/ui/raid-button.png" alt="Рейды">';
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openRaidMenu();});
    parent.appendChild(btn);return true;
  }
  function refreshRaidMenu(){
    const list=$('raid-fighter-list');if(!list)return;list.innerHTML='';
    RAID_FIGHTERS.forEach((f,i)=>{
      const ok=unlocked(f);const p=pFor(f);
      const card=document.createElement('button');card.type='button';
      card.className='raid-fighter-card'+(ok?'':' locked');card.dataset.idx=String(i);
      const rankNeed=RAID_RANK_REQUIREMENTS[f.rank]??0;
      const rankNames=['Салага','Пацан','Блатной','Смотрящий','Авторитет'];
      const rankLabel=rankNames[f.rank]||('масть '+f.rank);
      card.innerHTML='<div class="raid-card-portrait"><img src="'+portraitSrc(f)+'" alt="'+f.name+'"></div><div class="raid-card-info"><div class="raid-card-name '+f.id+'">'+f.name+'</div><small>'+(ok?('HP '+p.hp+'/'+f.hp+(p.wins?' · побед: '+p.wins:'')):('🔒 Нужна масть: '+rankLabel+' ('+rankNeed+' ⭐)'))+'</small></div>';
      if(ok)card.addEventListener('click',()=>startRaid(i));
      list.appendChild(card);
    });
  }
  function openRaidMenu(){
    const overlay=$('modal-overlay');const content=$('modal-content');
    if(!overlay||!content)return;
    overlay.classList.remove('hidden');
    overlay.classList.add('show','raid-selection-fullscreen');
    overlay.classList.remove('raid-fullscreen');
    content.innerHTML='<div class="raid-select"><div class="raid-select-head"><div><h2>⚔️ РЕЙДЫ</h2><p>Выбери бойца. Тапай, пока не свалится. 90 минут на бой.</p></div><button type="button" class="raid-menu-close" id="raid-menu-close">✕</button></div><div class="raid-fighter-list" id="raid-fighter-list"></div></div>';
    $('raid-menu-close')?.addEventListener('click',closeModal);
    refreshRaidMenu();
  }
  function closeModal(){
    const overlay=$('modal-overlay');if(!overlay)return;
    overlay.classList.remove('show','raid-fullscreen','raid-selection-fullscreen');
    overlay.classList.add('hidden');stopIdleVideo();
  }
  function stopIdleVideo(){
    const v=$('raid-idle-video');
    if(v){try{v.pause()}catch(e){} v.removeAttribute('src'); v.load();}
    if(idleResumeTimer){clearTimeout(idleResumeTimer);idleResumeTimer=0;}
  }
  function playIdleVideo(f){
    stopIdleVideo();const src=FIGHTER_IDLE_VIDEO[f.id];if(!src)return;
    let v=$('raid-idle-video');
    if(!v){
      v=document.createElement('video');v.id='raid-idle-video';v.muted=true;v.loop=true;v.playsInline=true;
      v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
      v.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;background:transparent;z-index:2;pointer-events:none';
      ($('raid-fighter-media')||$('raid-fighter'))?.appendChild(v);
    }
    v.src=src;v.style.display='block';
    const img=$('raid-fighter-img');if(img)img.style.opacity='0';
    v.play().catch(()=>{});
  }
  function showHitFrame(id){
    const frames=FIGHTER_HIT_FRAMES[id];if(!frames||!frames.length)return;
    let idx=Math.floor(Math.random()*frames.length);
    if(frames.length>1&&idx===lastHitFrame)idx=(idx+1)%frames.length;
    lastHitFrame=idx;
    const img=$('raid-fighter-img');const v=$('raid-idle-video');const media=$('raid-fighter-media');
    if(v){try{v.pause()}catch(e){} v.style.display='none';}
    if(img){img.style.opacity='1';img.src=frames[idx];}
    if(media){media.classList.remove('hit-pulse');void media.offsetWidth;media.classList.add('hit-pulse');}
    if(idleResumeTimer)clearTimeout(idleResumeTimer);
    idleResumeTimer=setTimeout(()=>{
      if(FIGHTER_IDLE_VIDEO[id]){
        if(v){v.style.display='block';v.play().catch(()=>{});}
        if(img)img.style.opacity='0';
      }
      media?.classList.remove('hit-pulse');
    },IDLE_RESUME_MS);
  }
  function startRaid(idx){
    const f=RAID_FIGHTERS[idx];if(!f||!unlocked(f))return;
    const p=pFor(f);
    if(p.hp<=0){p.hp=f.hp;p.startedAt=Date.now();p.extensionUsed=false;}
    if(!p.startedAt)p.startedAt=Date.now();
    raid={fighter:idx,active:true};raidTimeoutShown=false;save();
    const overlay=$('modal-overlay');const content=$('modal-content');
    if(!overlay||!content)return;
    overlay.classList.remove('hidden');
    overlay.classList.add('show','raid-fullscreen');
    overlay.classList.remove('raid-selection-fullscreen');
    const hasIdle=!!FIGHTER_IDLE_VIDEO[f.id];
    const stillSrc=FIGHTER_HIT_FRAMES[f.id]?.[0]||portraitSrc(f);
    const pct=p.hp/f.hp*100;
    content.innerHTML='<div class="raid-window"><div class="raid-scene '+f.scene+'" id="raid-scene"><div class="raid-hud"><div class="raid-title">'+f.name+'</div><div class="raid-timer" id="raid-timer">'+formatTime(remaining(f))+'</div></div><div class="raid-fighter '+f.id+'" id="raid-fighter"><div class="raid-name '+f.id+'">'+f.name+'</div><div class="raid-hp'+(pct<25?' low-hp':'')+'" id="raid-hp"><div class="raid-hp-track"><div id="raid-hp-fill" class="raid-hp-fill" style="width:'+pct+'%"></div></div><div id="raid-hp-text" class="raid-hp-text">'+Math.max(0,p.hp)+' / '+f.hp+'</div></div><div class="raid-fighter-media" id="raid-fighter-media"><img id="raid-fighter-img" src="'+stillSrc+'" alt="'+f.name+'" style="'+(hasIdle?'opacity:0':'')+'"></div></div><div class="raid-controls"><button type="button" class="raid-next" id="raid-back">← К бойцам</button></div><div class="raid-note" id="raid-note"></div><div class="raid-result" id="raid-result"><div class="raid-result-card"><div id="raid-result-title"></div><div id="raid-result-text"></div><button type="button" id="raid-result-ok">Ок</button></div></div></div></div>';
    (FIGHTER_HIT_FRAMES[f.id]||[]).forEach(src=>{const i=new Image();i.src=src});
    if(hasIdle)playIdleVideo(f);
    $('raid-scene')?.addEventListener('pointerdown',onTap);
    $('raid-back')?.addEventListener('click',e=>{e.stopPropagation();closeModal();openRaidMenu();});
    $('raid-result-ok')?.addEventListener('click',()=>{closeModal();openRaidMenu();});
  }
  function fighter(){return RAID_FIGHTERS[raid.fighter]}
  function onTap(e){
    if(!raid.active)return;
    if(e.target?.closest?.('.raid-controls,.raid-next,#raid-back,.raid-result'))return;
    const f=fighter(),p=pFor(f);
    if(p.hp<=0)return;
    if(remaining(f)<=0){showRaidNote('⏱ Время вышло');return;}
    const power=Number(s()?.power)||1;let dmg=power;
    const crit=Math.random()<(Number(s()?.critChance)||0.05);
    if(crit)dmg=Math.round(dmg*2.2);
    p.hp=Math.max(0,p.hp-dmg);
    const fill=$('raid-hp-fill'),txt=$('raid-hp-text');const pct=p.hp/f.hp*100;
    if(fill)fill.style.width=pct+'%';if(txt)txt.textContent=p.hp+' / '+f.hp;
    updateLowHp(pct);save();
    if(Math.random()<0.2)showFighterShout(f.id);
    showHitFrame(f.id);
    spawnBlood(crit,e);
    const scene=$('raid-scene');
    if(scene){scene.classList.remove('shake');void scene.offsetWidth;scene.classList.add('shake');}
    const fighterEl=$('raid-fighter');
    if(crit&&fighterEl){fighterEl.classList.add('crit');setTimeout(()=>fighterEl.classList.remove('crit'),400);}
    if(p.hp<=0)win();
  }
  function spawnBlood(crit,e){
    const scene=$('raid-scene');
    if(!scene)return;
    const rect=scene.getBoundingClientRect();
    const cx=(e&&typeof e.clientX==='number')?e.clientX:(rect.left+rect.width*0.5);
    const cy=(e&&typeof e.clientY==='number')?e.clientY:(rect.top+rect.height*0.45);
    const baseX=cx-rect.left;
    const baseY=cy-rect.top;
    const n=crit?10:5;
    for(let i=0;i<n;i++){
      const d=document.createElement('span');
      d.className='raid-blood'+(crit?' crit':'');
      const angle=(Math.random()*360)|0;
      const dist=12+Math.random()*(crit?55:32);
      const size=4+Math.random()*(crit?14:8);
      const ox=Math.random()*18-9;
      const oy=Math.random()*18-9;
      const dx=Math.cos(angle*Math.PI/180)*dist;
      const dy=-Math.abs(Math.sin(angle*Math.PI/180)*dist)-6;
      d.style.cssText='left:'+(baseX+ox)+'px;top:'+(baseY+oy)+'px;width:'+size+'px;height:'+(size*(0.7+Math.random()*0.6))+'px;--dx:'+dx+'px;--dy:'+dy+'px;animation-delay:'+(Math.random()*40)+'ms';
      scene.appendChild(d);
      setTimeout(()=>d.remove(),700);
    }
    const splat=document.createElement('span');
    splat.className='raid-blood-splat'+(crit?' crit':'');
    splat.style.cssText='left:'+baseX+'px;top:'+baseY+'px;';
    scene.appendChild(splat);
    setTimeout(()=>splat.remove(),crit?650:480);
  }
  const FIGHTER_SHOUTS={
    petrovich:['Котлетки потом!','Ща, брат, договорим!','Ты чего творишь?!','Давай без кипиша!','Я вообще-то занят!','Котлетки остывают!','Ну ты даёшь!','Погоди, братан!','Эй, полегче!','Не мешай котлетки делать!','Всё, хватит!','Я сейчас отвечу!'],
    vtirach:['Ты втираешь мне какую-то дичь!','Ты это серьёзно сейчас?!','Что ты мне рассказываешь?','Не гони пургу!','Ты меня за кого держишь?!','Какая ещё дичь?!','Слышь, объясни нормально!','Вот это поворот!','Ты вообще о чём?!','Не втирай мне тут!','Я всё слышал!','Ну и что это было?!'],
    mafioznik:['По понятиям!','Ты че, охренел?!','Сейчас разберёмся!','Не на того наехал!','Погоди, браток!','Это серьёзный разговор!','Ты за кого меня держишь?','Слышь, полегче!','Я тебе покажу!','Не шути со мной!','Всё по понятиям будет!','Ты пожалеешь!'],
    mongol:['Аррр!','Сила!','Не сдамся!','Ещё!','Крепче!','Давай!','Ха!','Слабак!','Ещё раз!','Не больно!','Сильнее!','Продолжай!'],
    glaz:['Вижу всё...','Интересно...','Продолжай.','Хм.','Забавно.','Неплохо.','Ещё.','Так-так.','Наблюдаю.','Продолжай тапать.','Записал.','Учёл.'],
    krest:['Крест не гнётся.','По понятиям ответишь.','Тише, браток.','Не на того наехал.','Крест видишь?','Спокойно.','Ещё раз — и пожалеешь.','Я всё видел.','Держись.','Не шуми.','По делу говори.','Хватит.'],
    psikh:['Ммррфф!!','Грррхх...','Нгххх!!','Ррррф!!','Хррр...','Ммфф-грр!','Нннхх!!','Гхаа...','Рррммф!','Ххрр!!','Ммрр...','Грррфф!!']
  };
  function showFighterShout(id){
    const list=FIGHTER_SHOUTS[id]||[];if(!list.length)return;
    const scene=$('raid-scene');if(!scene)return;
    let el=$('raid-shout');
    if(!el){el=document.createElement('div');el.id='raid-shout';el.className='raid-shout';scene.appendChild(el);}
    el.className='raid-shout '+id;
    el.textContent=list[Math.floor(Math.random()*list.length)];
    const media=$('raid-fighter-media')||$('raid-fighter');
    if(media){
      const mr=media.getBoundingClientRect();
      const sr=scene.getBoundingClientRect();
      const left=mr.left-sr.left+mr.width*(0.42+Math.random()*0.2);
      const top=mr.top-sr.top+mr.height*(0.02+Math.random()*0.08);
      el.style.left=left+'px';
      el.style.top=top+'px';
      el.style.right='auto';
      el.style.bottom='auto';
      el.style.transform='translate(-50%,0) rotate('+((Math.random()*6)-3)+'deg)';
    }
    el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  }
  function showRaidNote(msg){
    const n=$('raid-note');
    if(n){n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),1800)}
  }
  function win(){
    const f=fighter(),p=pFor(f);p.wins=(p.wins||0)+1;
    const first=p.wins===1;const rew=first?f.first:f.repeat;
    if(window.addChifir)window.addChifir(rew.chifir);
    if(window.addPoints)window.addPoints(rew.points);
    p.hp=0;save();
    const card=$('raid-result');
    if(card){
      $('raid-result-title').textContent='ПОБЕДА!';
      $('raid-result-text').textContent='+'+rew.chifir+' чифира · +'+rew.points+' авторитета'+(first?' (первый раз)':'');
      card.classList.add('show');
    }
    stopIdleVideo();
  }
  function updateTimer(){
    const f=fighter(),t=remaining(f),el=$('raid-timer');
    if(el)el.textContent=formatTime(t);
    if(t<=0&&!raidTimeoutShown&&pFor(f).hp>0){raidTimeoutShown=true;showRaidNote('⏱ Время вышло');}
  }
  function tickRaidClock(){
    if($('modal-overlay')?.classList.contains('raid-fullscreen'))updateTimer();
    if($('modal-overlay')?.classList.contains('raid-selection-fullscreen'))refreshRaidMenu();
  }
  function boot(){
    if(!ensureRaidButton()){window.setTimeout(boot,50);return;}
    if(!raidTicker)raidTicker=window.setInterval(tickRaidClock,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.openRaidMenu=openRaidMenu;
  window.__raidBoot=boot;
})();
