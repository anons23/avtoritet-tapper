'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const RANKS=[
    {name:'Салага',threshold:0,multiplier:1},
    {name:'Пацан',threshold:500,multiplier:1.5},
    {name:'Блатной',threshold:2500,multiplier:2.5},
    {name:'Смотрящий',threshold:10000,multiplier:4},
    {name:'Авторитет',threshold:40000,multiplier:7},
    {name:'Вор в законе',threshold:150000,multiplier:12}
  ];
  const BASE_CIGARETTES=1000;
  const BASE_POINTS=500;
  const ENERGY_PART=0.5;
  let ready=false;

  const $=id=>document.getElementById(id);

  function game(){
    try{
      if(typeof window.getGameState==='function'){
        const s=window.getGameState();
        if(s&&typeof s==='object')return s;
      }
    }catch(e){}
    try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{};}catch(e){return null;}
  }

  function save(s){
    try{
      s.saveUpdatedAt=Date.now();
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
      return true;
    }catch(e){return false;}
  }

  function rankData(s){
    const points=Math.max(0,Number(s?.points||0));
    let current=RANKS[0];
    for(const rank of RANKS)if(points>=rank.threshold)current=rank;
    return current;
  }

  function costs(s){
    const rank=rankData(s);
    return {
      rank,
      cigarettes:Math.round(BASE_CIGARETTES*rank.multiplier),
      points:Math.round(BASE_POINTS*rank.multiplier)
    };
  }

  function format(n){
    return Math.floor(Number(n)||0).toLocaleString('ru-RU');
  }

  function energyPercent(s){
    const max=Math.max(1,Number(s?.maxEnergy||250));
    return Math.max(0,Math.min(100,Math.round(Number(s?.energy||0)/max*100)));
  }

  function showMessage(text){
    if(typeof window.msg==='function')window.msg(text);
  }

  function close(){
    const overlay=$('modal-overlay');
    if(!overlay)return;
    if(overlay.dataset.locked==='1')return;
    overlay.classList.add('hidden');
  }

  function open(){
    const overlay=$('modal-overlay'),content=$('modal-content');
    if(!overlay||!content)return;
    const s=game();
    if(!s)return;
    const c=costs(s);
    const current=Math.max(0,Number(s.energy||0));
    const max=Math.max(1,Number(s.maxEnergy||250));
    const gain=Math.min(Math.ceil(max*ENERGY_PART),Math.max(0,max-current));
    const full=current>=max;
    const enoughCigarettes=Number(s.cigarettes||0)>=c.cigarettes;
    const enoughPoints=Number(s.points||0)>=c.points;

    content.innerHTML='<div class="energy-window">'
      +'<div class="energy-kicker">ВОССТАНОВЛЕНИЕ</div>'
      +'<h2>⚡ Энергия</h2>'
      +'<p class="energy-subtitle">Сейчас: <b>'+format(current)+'</b> / '+format(max)+' ('+energyPercent(s)+'%)</p>'
      +'<div class="energy-offer energy-buy-offer">'
      +'<div class="energy-offer-icon">⚡</div>'
      +'<div class="energy-offer-body"><b>Восстановить 50%</b><span>+'+format(gain)+' энергии · масть «'+c.rank.name+'»</span><small>🚬 '+format(c.cigarettes)+' + ⭐ '+format(c.points)+'</small></div>'
      +'<button type="button" id="energy-buy" '+(full||!enoughCigarettes||!enoughPoints?'disabled':'')+'>Купить</button>'
      +'</div>'
      +'<div class="energy-or">ИЛИ</div>'
      +'<div class="energy-offer energy-ad-offer">'
      +'<div class="energy-offer-icon">📺</div>'
      +'<div class="energy-offer-body"><b>Посмотреть рекламу</b><span>Полное восстановление энергии · 100%</span><small>Бесплатно</small></div>'
      +'<button type="button" id="energy-ad" '+(full?'disabled':'')+'>Смотреть</button>'
      +'</div>'
      +(full?'<div class="energy-note">⚡ Энергия уже полностью восстановлена.</div>':'<div class="energy-note">Стоимость покупки растёт вместе с мастью персонажа.</div>')
      +'</div>';

    overlay.dataset.locked='0';
    overlay.classList.remove('hidden');

    const buy=$('energy-buy');
    if(buy)buy.onclick=()=>buyEnergy();
    const ad=$('energy-ad');
    if(ad)ad.onclick=()=>watchAd();
  }

  function buyEnergy(){
    const s=game();
    if(!s)return;
    const c=costs(s);
    const max=Math.max(1,Number(s.maxEnergy||250));
    const current=Math.max(0,Number(s.energy||0));
    const gain=Math.min(Math.ceil(max*ENERGY_PART),Math.max(0,max-current));
    if(gain<=0){showMessage('⚡ Энергия уже полностью восстановлена');open();return;}
    if(Number(s.cigarettes||0)<c.cigarettes){showMessage('🚬 Не хватает сигарет для восстановления энергии');return;}
    if(Number(s.points||0)<c.points){showMessage('⭐ Не хватает понтов для восстановления энергии');return;}
    s.cigarettes-=c.cigarettes;
    s.points-=c.points;
    s.energy=Math.min(max,current+gain);
    s.lastEnergyTime=Date.now();
    save(s);
    if(typeof window.ui==='function')window.ui();
    if(typeof window.checkTasks==='function')window.checkTasks();
    showMessage('⚡ Энергия восстановлена на '+format(gain)+'. Потрачено 🚬 '+format(c.cigarettes)+' и ⭐ '+format(c.points));
    open();
  }

  function watchAd(){
    const s=game();
    if(!s)return;
    const max=Math.max(1,Number(s.maxEnergy||250));
    if(Number(s.energy||0)>=max){showMessage('⚡ Энергия уже полностью восстановлена');return;}
    if(typeof window.showRewardedAd!=='function'){
      showMessage('📺 Реклама сейчас недоступна');
      return;
    }
    const button=$('energy-ad');
    if(button){button.disabled=true;button.textContent='Загрузка…';}
    const started=window.showRewardedAd(function(rewarded){
      const live=game();
      if(rewarded&&live){
        const liveMax=Math.max(1,Number(live.maxEnergy||250));
        live.energy=liveMax;
        live.lastEnergyTime=Date.now();
        save(live);
        if(typeof window.ui==='function')window.ui();
        if(typeof window.checkTasks==='function')window.checkTasks();
        showMessage('📺 Реклама просмотрена! Энергия восстановлена на 100%');
      }else if(!rewarded){
        showMessage('📺 Реклама не была засчитана. Энергия не изменена');
      }
      open();
    });
    if(!started){
      if(button){button.disabled=false;button.textContent='Смотреть';}
      showMessage('📺 Реклама сейчас недоступна');
    }
  }

  function bind(){
    if(ready)return;
    const energy=document.querySelector('#top-bar .energy');
    if(!energy)return;
    ready=true;
    energy.classList.add('energy-clickable');
    energy.setAttribute('role','button');
    energy.setAttribute('tabindex','0');
    energy.setAttribute('aria-label','Восстановить энергию');
    energy.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();open();});
    energy.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
    const closeButton=$('modal-close');
    if(closeButton)closeButton.addEventListener('click',close);
    const overlay=$('modal-overlay');
    if(overlay)overlay.addEventListener('click',function(event){if(event.target===overlay)close();});
  }

  const timer=setInterval(()=>{
    bind();
    if(ready)clearInterval(timer);
  },250);
  if(document.readyState!=='loading')bind();
  else document.addEventListener('DOMContentLoaded',bind,{once:true});

  window.EnergyUI={open,close,buyEnergy,watchAd,costs};
})();
