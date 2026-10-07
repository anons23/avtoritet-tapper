'use strict';
(function(){
  const AS='./assets/authority/';
  const A={hero:'./assets/backgrounds/desktop/avtoritet.webp',deal:AS+'deal_button.webp',pressure:AS+'authority_pressure.webp',folder:AS+'barrack_cases_icon.webp',resolved:AS+'case_resolved.webp',clash:AS+'clash.webp',fight:AS+'fight.webp',great:AS+'excellent.webp'};
  const DEALS=[
    {title:'Место у окна',story:'Двое заключённых не поделили место в общей зоне. Оба считают, что правы.',img:'clash',choices:[['Поговорить с обоими',180,40,'clash'],['Разделить поровну',150,25,'safe'],['Отдать старшему',120,15,'safe']]},
    {title:'Очередь за чаем',story:'В столовой начался спор: один человек пытается пройти без очереди. Люди ждут твоего решения.',img:'hero',choices:[['Вернуть очередь',170,30,'safe'],['Разобрать на месте',200,45,'clash'],['Пусть разбираются сами',90,10,'safe']]},
    {title:'Пропавшая посылка',story:'Посылка пришла без подписи. Несколько человек уверяют, что она их. Нужно установить порядок.',img:'hero',choices:[['Проверить список',200,35,'safe'],['Позвать смотрящего',160,25,'safe'],['Разобрать жёстко',220,50,'clash']]},
    {title:'Шум в бараке',story:'Двое спорят из-за шума после отбоя. Спор быстро собирает зрителей.',img:'clash',choices:[['Развести по местам',210,40,'safe'],['Поговорить один на один',180,30,'safe'],['Пресечь сразу',240,55,'clash']]},
    {title:'Долг за услугу',story:'Один человек требует вернуть долг, второй говорит, что срок ещё не вышел. Оба пришли к тебе.',img:'hero',choices:[['Дать срок',160,35,'safe'],['Заставить вернуть',200,45,'clash'],['Разделить ответственность',140,25,'safe']]},
    {title:'Кому достанется место',story:'Освободилась койка в более тихом углу барака. За неё уже спорят двое.',img:'clash',choices:[['Жребий',190,40,'safe'],['По очереди',150,20,'safe'],['Решить силой авторитета',230,50,'clash']]}
  ];
  const SUPPORTS=[['Союзник','Старший заключённый предлагает поддержать твоё решение.',10,8],['Староста','Староста хаты кивает: можно опереться на его слово.',12,10]];

  let root=null,tapArea=null,originalTapHTML='',authorityActive=false,modalOpen=false,dealResolving=false,clashState=null,clashTimer=null,oppTimer=null,tapsSinceDeal=0;
  const AUTO_DEAL_EVERY=50;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>{n=Math.floor(Number(n)||0);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n)};
  const state=()=>window.getGameState?window.getGameState():null;

  function img(name,cls){return '<img class="'+(cls||'')+'" src="'+(A[name]||A.hero)+'" alt="" draggable="false">';}

  function openAuthorityModal(html,locked){
    const overlay=$('modal-overlay'),modal=$('modal'),content=$('modal-content');
    if(!overlay||!modal||!content)return;
    modal.classList.add('authority-modal');
    overlay.classList.remove('hidden');
    overlay.classList.add('show','authority-open');
    overlay.dataset.locked=locked?'1':'0';
    content.innerHTML=html;
    modalOpen=true;
  }
  function closeAuthorityModal(){
    stopClash();
    const overlay=$('modal-overlay'),modal=$('modal');
    if(overlay){overlay.classList.add('hidden');overlay.classList.remove('show','authority-open');overlay.dataset.locked='0';}
    if(modal)modal.classList.remove('authority-modal');
    modalOpen=false;dealResolving=false;
  }

  function reward(influence,respect,bonus){
    const s=state();if(!s)return;
    s.points=(Number(s.points)||0)+influence;
    s.chifir=(Number(s.chifir)||0)+Math.max(0,bonus||0);
    s.respect=(Number(s.respect)||0)+(respect||0);
    if(s.tasks)s.tasks.authorityDeals=(Number(s.tasks.authorityDeals)||0)+1;
    if(typeof window.saveGame==='function')window.saveGame();
    if(typeof window.ui==='function')window.ui();
  }
  function setMessage(t){
    const e=$('event-message');
    if(e){e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2400);}
    else if(typeof window.msg==='function')try{window.msg(t);}catch(err){}
  }
  function spendEnergy(amount){
    const s=state();amount=Math.max(0,Math.floor(amount||0));if(!s)return false;
    if(typeof s.energy!=='number')s.energy=0;
    if(s.energy<amount){setMessage('⚡ Нужно '+amount+' энергии');return false;}
    s.energy-=amount;
    if(typeof window.saveGame==='function')window.saveGame();
    if(typeof window.ui==='function')window.ui();
    return true;
  }

  function renderAuthority(){
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed){deactivate();return;}
    if(!tapArea||!root)return;
    if(!originalTapHTML) originalTapHTML=tapArea.innerHTML;
    authorityActive=true;
    root.classList.add('authority-mode');
    root.classList.remove('game-booting');
    tapArea.classList.add('authority-tap-area');
    // Полный UI с hero — не жёлтая кнопка на весь экран
    tapArea.innerHTML=
      '<div class="authority-screen">'+
        '<div class="authority-hero">'+
          img('hero','authority-hero-bg')+
          '<div class="authority-shade"></div>'+
          '<div class="authority-heading">'+
            '<div class="authority-crown">👑</div>'+
            '<div><div class="authority-kicker">МАСТЬ</div><h1>Авторитет</h1><p>Разбирай дела барака. Твой голос имеет вес.</p></div>'+
          '</div>'+
          '<div class="authority-influence"><span>🧠 ВЛИЯНИЕ</span><b id="authority-influence-value">'+fmt(s.points)+'</b></div>'+
          '<div class="authority-action-wrap">'+
            '<button type="button" class="authority-desk-hotspot" data-authority-action="folder" aria-label="Папки с делами"></button>'+
          '</div>'+
        '</div>'+
        '<div class="authority-strip">'+
          '<div><small>ЧЕФИР</small><b>🍵 '+fmt(s.chifir||0)+'</b></div>'+
          '<div><small>УВАЖЕНИЕ</small><b>🧠 '+fmt(s.respect||0)+'</b></div>'+
          '<div><small>СИЛА</small><b>💪 '+fmt(s.power||0)+'</b></div>'+
        '</div>'+
        '<div class="authority-mini-row">'+
          '<div class="authority-mini-card"><b>📋 Дело барака</b><span>Нажми на папку на столе или подожди ~50 тапов.</span></div>'+
        '</div>'+
        '<button type="button" class="authority-deal-btn" id="authority-deal-btn">'+img('deal','authority-deal-img')+'</button>'+
      '</div>';
    if(typeof window.refreshObjectVisuals==='function'){
      queueMicrotask(function(){try{window.refreshObjectVisuals();}catch(e){}});
    }
  }

  function deactivate(){
    if(!authorityActive)return;
    authorityActive=false;
    stopClash();
    closeAuthorityModal();
    if(root) root.classList.remove('authority-mode');
    if(tapArea){
      tapArea.classList.remove('authority-tap-area');
      if(originalTapHTML) tapArea.innerHTML=originalTapHTML;
    }
  }

  function startDeal(free){
    if(modalOpen||clashState)return;
    dealResolving=false;
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return;
    if(!free&&!spendEnergy(3))return;
    const d=DEALS[Math.floor(Math.random()*DEALS.length)];
    let choices='';
    d.choices.forEach((c,i)=>{choices+='<button type="button" class="authority-choice" data-i="'+i+'">'+esc(c[0])+'</button>';});
    openAuthorityModal(
      '<div class="authority-deal-window">'+
        '<div class="authority-modal-head"><span class="authority-modal-icon">📁</span><div><small>ДЕЛО БАРАКА</small><h2>'+esc(d.title)+'</h2></div></div>'+
        '<div class="authority-deal-art">'+img(d.img,'authority-deal-img')+'</div>'+
        '<p class="authority-story">'+esc(d.story)+'</p>'+
        '<div class="authority-choice-title">ТВОЁ РЕШЕНИЕ</div>'+
        '<div class="authority-choices">'+choices+'</div>'+
      '</div>', true);
    const content=$('modal-content');
    content.querySelectorAll('.authority-choice').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const i=Number(btn.getAttribute('data-i'));
        const c=d.choices[i];
        if(!c)return;
        if(c[3]==='clash') startClash({base:c[1],respect:c[2],image:'clash'});
        else resolveDeal(d,i);
      });
    });
  }

  function resolveDeal(d,index){
    if(!modalOpen||dealResolving)return;
    dealResolving=true;
    const c=d.choices[index];
    if(!c){dealResolving=false;return;}
    const success=Math.random()<0.78;
    if(success){
      reward(c[1],c[2],Math.floor(c[1]/8));
      showResult(true,c[1],c[2],'Дело закрыто. Авторитет укреплён.');
    }else{
      showResult(false,0,0,'Не все согласились с решением. Попробуй иначе в следующий раз.');
    }
  }

  function startClash(info){
    stopClash();
    const target=15+Math.floor(Math.random()*8);
    const time=5000;
    clashState={...info,target,player:0,opponent:0,started:performance.now(),time,oppBoost:0,rage:false};
    openAuthorityModal('<div class="authority-clash-window"><div class="authority-modal-head"><span class="authority-modal-icon">⚡</span><div><small>СТЫЧКА</small><h2>Кто быстрее?</h2></div></div><div class="authority-clash-art">'+img(info.image,'authority-clash-img')+'<div class="authority-art-vignette"></div></div><p class="authority-story">Набери <b>'+target+'</b> раньше оппонента. Он может ускориться!</p><div class="clash-score-row"><div><small>ТЫ</small><b id="authority-player-score">0 / '+target+'</b></div><div><small>ОППОНЕНТ</small><b id="authority-opponent-score">0 / '+target+'</b></div></div><div class="clash-bars"><div class="clash-bar"><span id="authority-player-bar"></span></div><div class="clash-bar opponent"><span id="authority-opponent-bar"></span></div></div><button type="button" class="authority-pressure-btn" id="authority-pressure">'+img('pressure','authority-pressure-img')+'</button><div class="authority-clash-timer" id="authority-clash-timer">5.0</div><div class="authority-clash-note" id="authority-clash-note">Нажимай быстро</div></div>',true);
    oppTimer=setInterval(()=>{
      if(!clashState)return;
      const elapsed=performance.now()-clashState.started;
      if(!clashState.rage&&elapsed>900&&Math.random()<0.12){
        clashState.rage=true;clashState.oppBoost=6+Math.floor(Math.random()*8);
        const note=$('authority-clash-note');if(note) note.textContent='Соперник ускорился!';
      }
      if(clashState.rage&&clashState.oppBoost<=0){
        clashState.rage=false;
        const note=$('authority-clash-note');if(note) note.textContent='Нажимай быстро';
      }
      if(!clashState.rage&&elapsed>2200&&Math.random()<0.08){
        clashState.rage=true;clashState.oppBoost=5+Math.floor(Math.random()*7);
        const note=$('authority-clash-note');if(note) note.textContent='Соперник в напор!';
      }
      let add=1;
      if(clashState.oppBoost>0){add=2+(Math.random()<0.45?1:0);clashState.oppBoost--;}
      else{add=1+(Math.random()<0.32?1:0);}
      if(clashState.player>clashState.opponent+2&&Math.random()<0.4) add+=1;
      clashState.opponent+=add;updateClash();checkClashEnd();
    },260);
    clashTimer=setInterval(()=>{
      if(!clashState)return;
      const left=Math.max(0,clashState.time-(performance.now()-clashState.started));
      const el=$('authority-clash-timer');if(el) el.textContent=(left/1000).toFixed(1);
      if(left<=0) finishClash(false);
    },50);
  }

  function clashTap(e){if(e&&e.preventDefault)e.preventDefault();if(!clashState)return;clashState.player+=1+(Math.random()<.16?1:0);updateClash();checkClashEnd();}
  function updateClash(){if(!clashState)return;const p=$('authority-player-score'),o=$('authority-opponent-score'),pb=$('authority-player-bar'),ob=$('authority-opponent-bar');if(p)p.textContent=clashState.player+' / '+clashState.target;if(o)o.textContent=clashState.opponent+' / '+clashState.target;if(pb)pb.style.width=Math.min(100,clashState.player/clashState.target*100)+'%';if(ob)ob.style.width=Math.min(100,clashState.opponent/clashState.target*100)+'%';}
  function checkClashEnd(){if(!clashState)return;if(clashState.player>=clashState.target){finishClash(true);return;}if(clashState.opponent>=clashState.target)finishClash(false);}
  function finishClash(win){if(!clashState)return;const info=clashState;stopClash();if(win){const bonus=info.base+60;reward(bonus,info.respect,Math.floor(bonus/7));showResult(true,bonus,info.respect,'Ты продавил ситуацию авторитетом.');}else{showResult(false,0,0,'Соперник оказался быстрее.');}}
  function stopClash(){if(clashTimer){clearInterval(clashTimer);clashTimer=null;}if(oppTimer){clearInterval(oppTimer);oppTimer=null;}clashState=null;}

  function showResult(win,influence,respect,text){
    openAuthorityModal(
      '<div class="authority-result '+(win?'success':'fail')+'">'+
        '<div class="authority-result-art">'+img(win?'resolved':'clash','authority-result-img')+'</div>'+
        '<h2>'+(win?'Дело решено':'Не вышло')+'</h2>'+
        '<p>'+esc(text)+'</p>'+
        (win?'<p class="authority-reward">+'+influence+' ⭐ · +'+respect+' уважения</p>':'')+
        '<button type="button" class="authority-ok" id="authority-result-ok">Понятно</button>'+
      '</div>', false);
    const b=$('authority-result-ok');
    if(b) b.onclick=()=>closeAuthorityModal();
  }

  function handleAuthorityButton(e){
    const t=e.target;
    if(!t||!t.closest)return;
    const hotspot=t.closest('.authority-desk-hotspot');
    if(hotspot){e.preventDefault();e.stopImmediatePropagation();startDeal(false);return;}
    const dealBtn=t.closest('.authority-deal-btn');
    if(dealBtn){e.preventDefault();e.stopImmediatePropagation();startDeal(false);return;}
    if(t.closest('.authority-pressure-btn')){clashTap(e);}
  }

  function capture(e){
    if(!authorityActive)return;
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return;
    if(e.target&&e.target.closest&&e.target.closest('.authority-desk-hotspot,.authority-deal-btn,.authority-pressure-btn,#modal-overlay'))return;
    if(modalOpen||clashState)return;
    // обычный тап — счётчик до авто-дела (~50), НЕ стычка каждый раз
    tapsSinceDeal++;
    if(tapsSinceDeal>=AUTO_DEAL_EVERY){
      tapsSinceDeal=0;
      setTimeout(function(){ try{ startDeal(true); }catch(err){} }, 30);
    }
  }

  function sync(){
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed){deactivate();return;}
    if(!authorityActive) renderAuthority();
    else {
      const el=$('authority-influence-value');
      if(el) el.textContent=fmt(s.points);
    }
  }

  window.startAuthorityDeal=function(){startDeal(true);};
  window.__authorityNoteTap=function(){
    if(!authorityActive||modalOpen||clashState)return;
    const s=state();
    if(!s||Number(s.points)<40000||s.currentObject!==4||s.jailed)return;
    tapsSinceDeal++;
    if(tapsSinceDeal>=AUTO_DEAL_EVERY){
      tapsSinceDeal=0;
      setTimeout(function(){ try{ startDeal(true); }catch(err){} }, 30);
    }
  };

  function init(){
    root=$('game-container');
    tapArea=$('tap-area');
    if(!root||!tapArea)return;
    originalTapHTML=tapArea.innerHTML;
    tapArea.addEventListener('pointerdown',capture,true);
    document.addEventListener('pointerdown',handleAuthorityButton,true);
    setInterval(sync,350);
    sync();
    const close=$('modal-close');
    if(close) close.addEventListener('click',()=>{ if(modalOpen&&$('modal-overlay')?.dataset.locked!=='1') closeAuthorityModal(); });
    console.log('[authority-ui] v2.2 root restore');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
