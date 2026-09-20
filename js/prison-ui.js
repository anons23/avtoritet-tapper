'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const SAVE_KEY='avtoritet_save_v2';
  const THRESHOLDS=[60,180,320];
  const RANK_POINTS=[0,500,2500,10000,40000,150000];
  const RANK_NAMES=['Салага','Пацан','Блатной','Смотрящий','Авторитет','Вор в законе'];
  const RANK_MULTIPLIERS=[1,1.5,2.5,4,7,12];
  let busy=false;
  let count=0;
  let lastJailed=false;

  function readGame(){
    try{
      if(typeof window.getGameState==='function'){
        const live=window.getGameState();
        if(live&&typeof live==='object')return live;
      }
    }catch(e){}
    try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(e){return {}}
  }

  function saveGame(s){
    try{s.saveUpdatedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true}catch(e){return false}
  }

  function rankIndex(s){
    const points=Math.max(0,Number(s.points)||0);
    let i=0;
    for(let j=0;j<RANK_POINTS.length;j++)if(points>=RANK_POINTS[j])i=j;
    return i;
  }

  function randomInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}
  function scaledAmount(s,base){const mult=RANK_MULTIPLIERS[rankIndex(s)]||1;return randomInt(Math.round(base*.85*mult),Math.round(base*1.15*mult))}

  function takeCigarettes(s,percent){
    const available=Math.max(0,Number(s.cigarettes)||0);
    const loss=Math.min(available,Math.max(0,Math.floor(available*percent)));
    s.cigarettes=Math.max(0,available-loss);
    return loss;
  }

  function takePoints(s,base){
    const available=Math.max(0,Number(s.points)||0);
    const loss=Math.min(available,scaledAmount(s,base));
    s.points=Math.max(0,available-loss);
    return loss;
  }

  function demoteOneRank(s){
    const current=rankIndex(s);
    if(current<=0)return {from:0,to:0,loss:0};
    const target=RANK_POINTS[current-1];
    const loss=Math.max(0,Number(s.points||0)-target);
    s.points=target;
    return {from:current,to:current-1,loss};
  }

  function finish(s,text){saveGame(s);if(typeof window.ui==='function')window.ui();return text}

  const events=[
    ['🧹 Коридор','Надзиратель требует привести коридор в порядок.',[
      ['Согласиться',function(s){const q=Math.random();if(q<.4)return finish(s,'🧹 Ты сделал работу спокойно. Авторитеты отметили, что слово держишь. ⭐ Понты не сняли.');if(q<.75){const n=takePoints(s,220);return finish(s,'🧹 Пол помыт, но без последствий не обошлось. С тебя сняли '+n+' ⭐ понтов.');}const r=demoteOneRank(s);if(!r.loss)return finish(s,'🧹 Работа выполнена, но ты и так на самой низкой масти. Ниже уже некуда.');return finish(s,'🧹 Авторитеты не поняли твоего поступка и решили понизить тебя в масти: «'+RANK_NAMES[r.from]+'» → «'+RANK_NAMES[r.to]+'». −'+r.loss+' ⭐.')}],
      ['Отказаться',function(s){const cig=takeCigarettes(s,.20);return finish(s,'🚨 Ты уважаемый арестант, но здесь закон: за отказ конфискуем '+cig+' 🚬 чефира (20% твоего запаса).');}],
      ['Попытаться договориться',function(s){const cig=takeCigarettes(s,.10);return finish(s,'🤝 Договориться получилось. В качестве платы конфисковали только '+cig+' 🚬 чефира (10% запаса). ⭐ сохранены.');}]
    ]],
    ['🧹 Камера','Требуют привести камеру в порядок.',[
      ['Согласиться',function(s){const q=Math.random();if(q<.42)return finish(s,'🧹 Камера приведена в порядок. Авторитеты увидели, что ты не отлыниваешь. ⭐ Понты сохранены.');if(q<.74){const n=takePoints(s,260);return finish(s,'🧹 Камеру ты убрал, но за результат сняли '+n+' ⭐ понтов.');}const r=demoteOneRank(s);if(!r.loss)return finish(s,'🧹 Камера убрана. Ты уже на самой низкой масти, поэтому понижать дальше некуда.');return finish(s,'🧹 Авторитеты не оценили твой подход и решили понизить тебя в масти: «'+RANK_NAMES[r.from]+'» → «'+RANK_NAMES[r.to]+'». −'+r.loss+' ⭐.')}],
      ['Отказаться',function(s){const cig=takeCigarettes(s,.20);return finish(s,'🚨 Ты уважаемый арестант, но здесь закон: за отказ конфискуем '+cig+' 🚬 чефира (20% твоего запаса).');}],
      ['Попытаться договориться',function(s){const cig=takeCigarettes(s,.10);return finish(s,'🤝 Договор сработал. За возможность не делать работу изъяли '+cig+' 🚬 чефира (10% запаса). ⭐ сохранены.');}]
    ]],
    ['🤐 Сокамерник','От тебя хотят услышать лишнее.',[
      ['Рассказать',function(s){const q=Math.random();if(q<.45){const n=randomInt(80,160);s.points=(Number(s.points)||0)+n;return finish(s,'🗣️ Разговор оказался полезным. Тебе добавили '+n+' ⭐ понтов.');}if(q<.75){const n=takePoints(s,300);return finish(s,'🗣️ Слова не зашли авторитетам. Сняли '+n+' ⭐ понтов.');}const r=demoteOneRank(s);if(!r.loss)return finish(s,'🗣️ Тебя не поняли, но ты и так на самой низкой масти. Ниже уже некуда.');return finish(s,'🗣️ Авторитеты не поняли твоего поступка и решили понизить тебя в масти: «'+RANK_NAMES[r.from]+'» → «'+RANK_NAMES[r.to]+'». −'+r.loss+' ⭐.')}],
      ['Промолчать',function(s){const cig=takeCigarettes(s,.20);return finish(s,'🤫 За отказ вмешиваться в разговор изъяли '+cig+' 🚬 чефира (20% запаса).');}],
      ['Попытаться договориться',function(s){const cig=takeCigarettes(s,.10);return finish(s,'🤝 Договорились без лишнего шума. За это изъяли '+cig+' 🚬 чефира (10% запаса). ⭐ сохранены.');}]
    ]]
  ];

  function show(){
    if(busy)return;
    const s=readGame();
    if(!s.jailed)return;
    const o=$('modal-overlay'),c=$('modal-content');
    if(!o||!c)return;
    busy=true;
    const e=events[Math.floor(Math.random()*events.length)];
    o.dataset.locked='1';
    o.classList.remove('hidden');
    c.innerHTML='<div class="section-window"><div class="section-kicker">КАРЦЕР</div><h2>'+e[0]+'</h2><p class="section-subtitle">'+e[1]+'</p><div class="choices">'+e[2].map((v,i)=>'<button type="button" data-prison-choice="'+i+'">'+v[0]+'</button>').join('')+'</div></div>';
    c.querySelectorAll('[data-prison-choice]').forEach(button=>{
      button.onclick=function(){
        if(!busy)return;
        const index=Number(button.dataset.prisonChoice);
        const live=readGame();
        if(!live.jailed){busy=false;o.dataset.locked='0';o.classList.add('hidden');return}
        const text=e[2][index][1](live);
        if(typeof window.choiceResult==='function'){const positive=!(/[−-]|понизить|конфис|изъяли|изъят|сняли|не поняли|не оценили/.test(text));window.choiceResult(text,positive)}else if(typeof window.msg==='function')window.msg(text);
        o.dataset.locked='0';o.classList.add('hidden');busy=false;count++;
        if(typeof window.ui==='function')window.ui();
      };
    });
  }

  function check(){
    const s=readGame();
    const jailed=!!s.jailed;
    if(!jailed){count=0;lastJailed=false;return}
    if(!lastJailed){count=0;lastJailed=true}
    const taps=Math.max(0,Number(s.jailTaps)||0);
    if(!busy&&count<THRESHOLDS.length&&taps>=THRESHOLDS[count]){
      count++;
      setTimeout(show,150);
    }
  }

  window.onPrisonTap=check;

  function rename(){
    const nav=$('btn-tasks');
    if(nav)nav.textContent='🎯 Поручения';
    document.querySelectorAll('#modal-content h2').forEach(h=>{if(h.textContent.includes('Задания'))h.textContent=h.textContent.replace('Задания','Поручения')});
  }

  function init(){
    rename();
    const c=$('modal-content');
    if(c)new MutationObserver(rename).observe(c,{childList:true,subtree:true,characterData:true});
    check();
    setInterval(check,100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();