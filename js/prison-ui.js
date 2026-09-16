'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const SAVE_KEY='avtoritet_save_v2';
  const THRESHOLDS=[60,180,320];
  const RANK_POINTS=[0,100,500,2000,8000,25000];
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
    try{
      s.saveUpdatedAt=Date.now();
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
      return true;
    }catch(e){return false}
  }

  function rankIndex(s){
    const points=Math.max(0,Number(s.points)||0);
    let i=0;
    for(let j=0;j<RANK_POINTS.length;j++)if(points>=RANK_POINTS[j])i=j;
    return i;
  }

  function randomInt(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
  }

  function scaledAmount(s,base){
    const mult=RANK_MULTIPLIERS[rankIndex(s)]||1;
    return randomInt(Math.round(base*.85*mult),Math.round(base*1.15*mult));
  }

  function takeCigarettes(s,base){
    const key=s.jailed?'confiscatedCigarettes':'cigarettes';
    const available=Math.max(0,Number(s[key])||0);
    const loss=Math.min(available,scaledAmount(s,base));
    s[key]=Math.max(0,available-loss);
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

  function finish(s,text){
    saveGame(s);
    if(typeof window.ui==='function')window.ui();
    return text;
  }

  const events=[
    ['🧹 Коридор','Надзиратель требует привести коридор в порядок.',[
      ['Согласиться',function(s){
        const q=Math.random();
        if(q<.4)return finish(s,'Работа прошла спокойно. Ничего не потеряно.');
        if(q<.75){const n=takePoints(s,220);return finish(s,'Пришлось отработать. −'+n+' ⭐.');}
        const r=demoteOneRank(s);
        if(!r.loss)return finish(s,'Зашквар не случился: ты и так на самой низкой масти.');
        return finish(s,'Зашквар. «'+RANK_NAMES[r.from]+'» → «'+RANK_NAMES[r.to]+'». −'+r.loss+' ⭐.');
      }],
      ['Отказаться',function(s){
        const cig=takeCigarettes(s,550),pts=takePoints(s,70);
        return finish(s,'Отказ обошёлся дорого: −'+cig+' 🚬 и −'+pts+' ⭐.');
      }],
      ['Попытаться договориться',function(s){
        const cig=takeCigarettes(s,1000);
        return finish(s,'Договорились. −'+cig+' 🚬. ⭐ сохранены.');
      }]
    ]],
    ['🧹 Камера','Требуют привести камеру в порядок.',[
      ['Согласиться',function(s){
        const q=Math.random();
        if(q<.42)return finish(s,'Повезло. Ничего не потеряно.');
        if(q<.74){const n=takePoints(s,260);return finish(s,'Пришлось отработать. −'+n+' ⭐.');}
        const r=demoteOneRank(s);
        if(!r.loss)return finish(s,'Зашквар не случился: ты и так на самой низкой масти.');
        return finish(s,'Зашквар. «'+RANK_NAMES[r.from]+'» → «'+RANK_NAMES[r.to]+'». −'+r.loss+' ⭐.');
      }],
      ['Отказаться',function(s){
        const cig=takeCigarettes(s,700),pts=takePoints(s,90);
        return finish(s,'За отказ: −'+cig+' 🚬 и −'+pts+' ⭐.');
      }],
      ['Попытаться договориться',function(s){
        const cig=takeCigarettes(s,1400);
        return finish(s,'Договор сработал. −'+cig+' 🚬, ⭐ сохранены.');
      }]
    ]],
    ['🤐 Сокамерник','От тебя хотят услышать лишнее.',[
      ['Рассказать',function(s){
        const q=Math.random();
        if(q<.45){const n=randomInt(80,160);s.points=(Number(s.points)||0)+n;return finish(s,'Информация пригодилась. +'+n+' ⭐.');}
        if(q<.75){const n=takePoints(s,300);return finish(s,'История обернулась боком. −'+n+' ⭐.');}
        const r=demoteOneRank(s);
        if(!r.loss)return finish(s,'Зашквар не случился: ты и так на самой низкой масти.');
        return finish(s,'Зашквар. «'+RANK_NAMES[r.from]+'» → «'+RANK_NAMES[r.to]+'». −'+r.loss+' ⭐.');
      }],
      ['Промолчать',function(s){
        const cig=takeCigarettes(s,800),pts=takePoints(s,50);
        return finish(s,'Промолчал. −'+cig+' 🚬 и −'+pts+' ⭐.');
      }],
      ['Попытаться договориться',function(s){
        const cig=takeCigarettes(s,1700);
        return finish(s,'Договорились. −'+cig+' 🚬. ⭐ сохранены.');
      }]
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
        if(!live.jailed){
          busy=false;
          o.dataset.locked='0';
          o.classList.add('hidden');
          return;
        }
        const text=e[2][index][1](live);
        if(typeof window.msg==='function')window.msg(text);
        o.dataset.locked='0';
        o.classList.add('hidden');
        busy=false;
        count++;
        if(typeof window.ui==='function')window.ui();
      };
    });
  }

  function check(){
    const s=readGame();
    const jailed=!!s.jailed;
    if(!jailed){
      count=0;
      lastJailed=false;
      return;
    }
    if(!lastJailed){
      count=0;
      lastJailed=true;
    }
    if(!busy&&count<THRESHOLDS.length&&Number(s.jailTaps||0)>=THRESHOLDS[count]){
      count++;
      setTimeout(show,150);
    }
  }

  function rename(){
    const nav=$('btn-tasks');
    if(nav)nav.textContent='🎯 Поручения';
    document.querySelectorAll('#modal-content h2').forEach(h=>{
      if(h.textContent.includes('Задания'))h.textContent=h.textContent.replace('Задания','Поручения');
    });
  }

  function init(){
    rename();
    const tap=$('tap-object');
    if(tap)tap.addEventListener('click',function(){setTimeout(check,0)},true);
    const c=$('modal-content');
    if(c)new MutationObserver(rename).observe(c,{childList:true,subtree:true,characterData:true});
    check();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();