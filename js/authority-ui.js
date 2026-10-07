'use strict';
(function(){
  const AS='./assets/authority/';
  const A={hero:'./assets/backgrounds/desktop/avtoritet.webp',deal:AS+'deal_button.webp',pressure:AS+'authority_pressure.webp',folder:AS+'barrack_cases_icon.webp',resolved:AS+'deal_resolved.webp',clash:AS+'barrack_clash.webp'};
  const DEALS=[
    {title:'Место у окна',story:'Двое заключённых не поделили место в общей зоне. Оба считают, что правы.',img:'clash',choices:[['Поговорить с обоими',180,40,'clash'],['Разделить поровну',150,25,'safe'],['Отдать старшему',120,15,'safe']]},
    {title:'Очередь за чаем',story:'В столовой начался спор: один человек пытается пройти без очереди. Люди ждут твоего решения.',img:'hero',choices:[['Вернуть очередь',170,30,'safe'],['Разобрать на месте',200,45,'clash'],['Пусть разбираются сами',90,10,'safe']]},
    {title:'Пропавшая посылка',story:'Посылка пришла без подписи. Несколько человек уверяют, что она их. Нужно установить порядок.',img:'hero',choices:[['Проверить список',200,35,'safe'],['Позвать смотрящего',160,25,'safe'],['Разобрать жёстко',220,50,'clash']]},
    {title:'Шум в бараке',story:'Двое спорят из-за шума после отбоя. Спор быстро собирает зрителей.',img:'clash',choices:[['Развести по местам',210,40,'safe'],['Поговорить один на один',180,30,'safe'],['Пресечь сразу',240,55,'clash']]},
    {title:'Долг за услугу',story:'Один человек требует вернуть долг, второй говорит, что срок ещё не вышел. Оба пришли к тебе.',img:'hero',choices:[['Дать срок',160,35,'safe'],['Заставить вернуть',200,45,'clash'],['Разделить ответственность',140,25,'safe']]},
    {title:'Кому достанется место',story:'Освободилась койка в более тихом углу барака. За неё уже спорят двое.',img:'clash',choices:[['Жребий',190,40,'safe'],['По очереди',150,20,'safe'],['Решить силой авторитета',230,50,'clash']]}
  ];

  let root=null,tapArea=null,originalTapHTML='',authorityActive=false,modalOpen=false,dealResolving=false,clashState=null,clashTimer=null,oppTimer=null;
  const $=id=>document.getElementById(id);
  function st(){try{if(typeof window.getGameState==='function')return window.getGameState();}catch(e){}return window.s||null;}
  function save(){try{if(typeof window.saveGame==='function')window.saveGame();}catch(e){}}
  function ui(){try{if(typeof window.ui==='function')window.ui();}catch(e){}}
  function msg(t){const e=$('event-message');if(e){e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2400);}else if(typeof window.msg==='function')try{window.msg(t);}catch(err){}}
  function img(key,cls){return '<img class="'+(cls||'')+'" src="'+(A[key]||A.hero)+'" alt="" draggable="false">';}
  function reward(points,respect,chifir){const s=st();if(!s)return;s.points=(Number(s.points)||0)+points;s.respect=(Number(s.respect)||0)+respect;if(chifir)s.chifir=(Number(s.chifir)||0)+chifir;if(s.tasks)s.tasks.authorityDeals=(Number(s.tasks.authorityDeals)||0)+1;save();ui();}

  function openAuthorityModal(html,lock){const overlay=$('modal-overlay'),modal=$('modal'),content=$('modal-content');if(!overlay||!content)return;modalOpen=true;content.innerHTML=html;overlay.classList.remove('hidden');overlay.classList.add('show');if(lock)overlay.dataset.locked='1';else overlay.dataset.locked='0';}
  function closeAuthorityModal(){stopClash();const overlay=$('modal-overlay'),modal=$('modal');if(overlay)overlay.classList.add('hidden');if(overlay)overlay.dataset.locked='0';if(overlay)overlay.classList.remove('show');modalOpen=false;dealResolving=false;}

  function openDeal(){
    stopClash();
    const d=DEALS[Math.floor(Math.random()*DEALS.length)];
    let choices='';
    d.choices.forEach((c,i)=>{choices+='<button type="button" class="authority-choice" data-i="'+i+'">'+c[0]+'</button>';});
    openAuthorityModal('<div class="authority-deal-window"><div class="authority-modal-head"><span class="authority-modal-icon">📁</span><div><small>ДЕЛО</small><h2>'+d.title+'</h2></div></div><div class="authority-deal-art">'+img(d.img,'authority-deal-img')+'</div><p class="authority-story">'+d.story+'</p><div class="authority-choices">'+choices+'</div></div>',true);
    const content=$('modal-content');
    content.querySelectorAll('.authority-choice').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const i=Number(btn.getAttribute('data-i'));
        const c=d.choices[i];
        if(c&&c[3]==='clash') startClash({base:c[1],respect:c[2],image:d.img});
        else resolveDeal(d,i,true);
      });
    });
  }

  function resolveDeal(d,index,support){
    if(!modalOpen||dealResolving)return;
    dealResolving=true;
    const c=d.choices[index];
    if(!c){dealResolving=false;return;}
    const success=Math.random()<0.72;
    if(success){
      reward(c[1],c[2],Math.floor(c[1]/8));
      showResult(true,c[1],c[2],'Дело закрыто. Авторитет укреплён.');
    }else{
      showResult(false,0,0,'Не все согласились с решением. Попробуй иначе в следующий раз.');
    }
  }

  function startClash(info){
    stopClash();
    // Сложнее: цель 15–22, время 5с, соперник иногда ускоряется
    const target=15+Math.floor(Math.random()*8);
    const time=5000;
    clashState={...info,target,player:0,opponent:0,started:performance.now(),time,oppBoost:0,rage:false};
    openAuthorityModal('<div class="authority-clash-window"><div class="authority-modal-head"><span class="authority-modal-icon">⚡</span><div><small>СТЫЧКА</small><h2>Кто быстрее?</h2></div></div><div class="authority-clash-art">'+img(info.image,'authority-clash-img')+'<div class="authority-art-vignette"></div></div><p class="authority-story">Спор перешёл в проверку реакции. Набери <b>'+target+'</b> раньше оппонента. Он может ускориться!</p><div class="clash-score-row"><div><small>ТВОЁ ВЛИЯНИЕ</small><b id="authority-player-score">0 / '+target+'</b></div><div><small>ОППОНЕНТ</small><b id="authority-opponent-score">0 / '+target+'</b></div></div><div class="clash-bars"><div class="clash-bar"><span id="authority-player-bar"></span></div><div class="clash-bar opponent"><span id="authority-opponent-bar"></span></div></div><button type="button" class="authority-pressure-btn" id="authority-pressure">'+img('pressure','authority-pressure-img')+'</button><div class="authority-clash-timer" id="authority-clash-timer">5.0</div><div class="authority-clash-note" id="authority-clash-note">Нажимай быстро — соперник не дремлет</div></div>',true);
    oppTimer=setInterval(()=>{
      if(!clashState)return;
      const elapsed=performance.now()-clashState.started;
      if(!clashState.rage && elapsed>900 && Math.random()<0.12){
        clashState.rage=true;
        clashState.oppBoost=6+Math.floor(Math.random()*8);
        const note=$('authority-clash-note');
        if(note) note.textContent='Соперник ускорился! Жми сильнее!';
      }
      if(clashState.rage && clashState.oppBoost<=0){
        clashState.rage=false;
        const note=$('authority-clash-note');
        if(note) note.textContent='Нажимай быстро — соперник не дремлет';
      }
      if(!clashState.rage && elapsed>2200 && Math.random()<0.08){
        clashState.rage=true;
        clashState.oppBoost=5+Math.floor(Math.random()*7);
        const note=$('authority-clash-note');
        if(note) note.textContent='Соперник пошёл в напор!';
      }
      let add=1;
      if(clashState.oppBoost>0){
        add=2+(Math.random()<0.45?1:0);
        clashState.oppBoost--;
      }else{
        add=1+(Math.random()<0.32?1:0);
      }
      if(clashState.player>clashState.opponent+2 && Math.random()<0.4) add+=1;
      clashState.opponent+=add;
      updateClash();
      checkClashEnd();
    },260);
    clashTimer=setInterval(()=>{
      if(!clashState)return;
      const left=Math.max(0,clashState.time-(performance.now()-clashState.started));
      const el=$('authority-clash-timer');
      if(el) el.textContent=(left/1000).toFixed(1);
      if(left<=0) finishClash(false);
    },50);
  }

  function clashTap(e){if(e&&e.preventDefault)e.preventDefault();if(!clashState)return;clashState.player+=1+(Math.random()<.16?1:0);updateClash();checkClashEnd()}
  function updateClash(){if(!clashState)return;const p=$('authority-player-score'),o=$('authority-opponent-score'),pb=$('authority-player-bar'),ob=$('authority-opponent-bar');if(p)p.textContent=clashState.player+' / '+clashState.target;if(o)o.textContent=clashState.opponent+' / '+clashState.target;if(pb)pb.style.width=Math.min(100,clashState.player/clashState.target*100)+'%';if(ob)ob.style.width=Math.min(100,clashState.opponent/clashState.target*100)+'%'}
  function checkClashEnd(){if(!clashState)return;if(clashState.player>=clashState.target){finishClash(true);return}if(clashState.opponent>=clashState.target)finishClash(false)}
  function finishClash(win){if(!clashState)return;const info=clashState;stopClash();if(win){const bonus=info.base+60;reward(bonus,info.respect,Math.floor(bonus/7));showResult(true,bonus,info.respect,'Ты продавил ситуацию авторитетом.');}else{showResult(false,0,0,'Соперник оказался быстрее. Авторитет не сработал.');}}
  function stopClash(){if(clashTimer){clearInterval(clashTimer);clashTimer=null}if(oppTimer){clearInterval(oppTimer);oppTimer=null}clashState=null}
  function showResult(win,influence,respect,text){openAuthorityModal('<div class="authority-result '+(win?'success':'fail')+'"><div class="authority-result-art">'+img(win?'resolved':'clash','authority-result-img')+'</div><h2>'+(win?'Дело решено':'Не вышло')+'</h2><p>'+text+'</p>'+(win?'<p class="authority-reward">+'+influence+' ⭐ · +'+respect+' уважения</p>':'')+'<button type="button" class="authority-ok" id="authority-result-ok">Понятно</button></div>',false);const b=$('authority-result-ok');if(b)b.onclick=()=>closeAuthorityModal();}

  function onTapAreaClick(e){
    const target=e.target;
    if(!target||!target.closest)return;
    if(target.closest('.authority-pressure-btn')||target.classList.contains('authority-pressure-btn'))clashTap(e);
  }

  function activateAuthorityStage(){
    if(authorityActive)return;
    authorityActive=true;
    const s=st();
    if(s){s.currentObject=4;save();}
    tapArea=$('tap-area');
    if(tapArea&&!originalTapHTML) originalTapHTML=tapArea.innerHTML;
    if(tapArea){
      tapArea.innerHTML='<div class="authority-stage" id="authority-stage"><div class="authority-stage-bg"></div><div class="authority-stage-content"><h2>Авторитет</h2><p>Разбирай дела барака</p><button type="button" class="authority-deal-btn" id="authority-deal-btn">'+img('deal','authority-deal-btn-img')+'<span>Взять дело</span></button></div></div>';
      const btn=$('authority-deal-btn');
      if(btn)btn.onclick=()=>openDeal();
    }
    document.addEventListener('click',onTapAreaClick,true);
    document.addEventListener('pointerdown',function(e){const target=e.target;if(target&&target.closest&&target.closest('.authority-pressure-btn'))clashTap(e);},true);
  }

  function deactivateAuthorityStage(){
    authorityActive=false;
    stopClash();
    closeAuthorityModal();
    if(tapArea&&originalTapHTML){tapArea.innerHTML=originalTapHTML;originalTapHTML='';}
  }

  function watchStage(){
    const s=st();
    if(!s)return;
    const rank=($('rank')&&$('rank').textContent)||'';
    const isAuth=/Авторитет|Вор/i.test(rank)||Number(s.points)>=40000;
    if(isAuth&&Number(s.currentObject)>=4) activateAuthorityStage();
    else if(!isAuth&&authorityActive) deactivateAuthorityStage();
  }

  // auto deals roughly after 50 taps on authority
  let lastTapCheck=0;
  function maybeAutoDeal(){
    if(!authorityActive||modalOpen||clashState)return;
    const s=st();if(!s)return;
    const taps=Number(s.totalTaps)||0;
    if(taps-lastTapCheck>=50){ lastTapCheck=taps; if(Math.random()<0.55) openDeal(); }
  }

  function boot(){
    setInterval(watchStage,800);
    setInterval(maybeAutoDeal,1200);
    console.log('[authority-ui] ready (hard clash)');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
