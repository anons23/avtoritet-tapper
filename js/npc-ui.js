'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const NPCS={
    шайба:{name:'Шайба',icon:'🧢',desc:'торгаш',rank:0,action:'Сходить на дело',reward:'25 🚬 +1 🧠'},
    бугор:{name:'Бугор',icon:'💪',desc:'тренер',rank:1,action:'Прокачаться',reward:'+1 💪 +2 🧠 +15 ⭐'},
    косой:{name:'Косой',icon:'😏',desc:'решала',rank:2,action:'Рискнуть',reward:'шанс на +100 🚬 +40 ⭐'},
    смотрящий:{name:'Смотрящий',icon:'👑',desc:'старший',rank:3,action:'Получить совет',reward:'цель по масти'}
  };
  const RANKS=['Салага','Пацан','Блатной','Смотрящий','Авторитет','Вор в законе'];
  const REPKEY='avtoritet_npc_rep_v2',USEKEY='avtoritet_npc_uses_v2',INTKEY='avtoritet_npc_interactions_v2_';
  const COOLDOWN=30*60*1000,MAX_FREE=2,AD_BONUS=2;
  let rep={},uses={};
  try{rep=JSON.parse(localStorage.getItem(REPKEY)||'{}')||{}}catch(e){rep={}}
  try{uses=JSON.parse(localStorage.getItem(USEKEY)||'{}')||{}}catch(e){uses={}}
  const save=()=>{try{localStorage.setItem(REPKEY,JSON.stringify(rep));localStorage.setItem(USEKEY,JSON.stringify(uses))}catch(e){}};
  const getRep=id=>Math.max(0,Number(rep[id]||0));
  const rankIndex=()=>{const txt=$('rank')?.textContent||'';const i=RANKS.indexOf(txt.trim());return i<0?0:i};
  const unlocked=id=>rankIndex()>=NPCS[id].rank;
  const data=id=>{const x=uses[id]||{};return {used:Number(x.used||0),extra:Number(x.extra||0),until:Number(x.until||0)}};
  const level=id=>Math.floor(getRep(id)/3)+1;
  function state(id){
    const d=data(id),now=Date.now();
    if(d.until&&now>=d.until){d.used=0;d.extra=0;d.until=0;uses[id]=d;save()}
    const free=Math.max(0,MAX_FREE-d.used),extra=Math.max(0,d.extra);
    return {used:d.used,extra,free,total:free+extra,locked:d.until>now,until:d.until};
  }
  function successChance(id){if(id!=='косой')return 1;return Math.min(.70,.35+getRep(id)*.05)}
  function cooldownText(until){const left=Math.max(0,until-Date.now()),m=Math.ceil(left/60000),sec=Math.ceil((left%60000)/1000);return m>1?m+' мин':sec+' сек'}
  function card(id,n){
    const st=state(id),r=getRep(id),lv=level(id),chance=successChance(id),unavailable=!unlocked(id);
    let note='';
    if(unavailable)note='🔒 Откроется с мастью «'+RANKS[n.rank]+'»';
    else if(st.locked)note='⏳ Отдохни ещё '+cooldownText(st.until);
    else if(st.total<=0)note='🎬 Ещё 2 обращения можно получить за рекламу';
    else note='Осталось обращений: '+st.total;
    if(id==='косой'&&!unavailable)note+=' · шанс успеха '+Math.round(chance*100)+'%';
    return '<button type="button" class="npc-btn npc-custom" data-custom-npc="'+id+'" style="text-align:left;padding:14px;margin-bottom:8px;width:100%;opacity:'+(unavailable?.55:1)+'">'+n.icon+' <b>'+n.name+'</b><br><small>'+n.desc+' · доверие '+r+' · уровень '+lv+'</small><br><span>▶ '+n.action+'</span><br><small>Награда: '+n.reward+'</small><br><small>'+note+'</small></button>';
  }
  function render(){
    const c=$('modal-content');if(!c)return;const title=c.querySelector('h2');if(!title||!title.textContent.includes('Ещё'))return;
    c.innerHTML='<h2>☰ Общак</h2><p>Свои не раздают доверие за просто так. У каждого — 2 обращения, потом перерыв 30 минут.</p><div>'+Object.entries(NPCS).map(([id,n])=>'<button type="button" class="npc-link" data-open-npc="'+id+'" style="width:100%;margin:5px 0;padding:11px;text-align:left">'+n.icon+' '+n.name+' — '+n.desc+'</button>').join('')+'</div><hr><h3>🏆 Достижения</h3><p>Тап-машина, Критический удар, Решала, Пачка за пачкой.</p><h3>💎 Новый срок</h3><p>После 25 000 ⭐ можно начать новый срок и сохранить постоянный бонус силы.</p><button type="button" id="prestige-custom" style="width:100%;padding:12px">Начать новый срок</button>';
    c.querySelectorAll('[data-open-npc]').forEach(b=>b.onclick=()=>openNpc(b.dataset.openNpc));
    const p=$('prestige-custom');if(p)p.onclick=()=>{if(typeof window.more==='function'){window.more();setTimeout(()=>{$('prestige')?.click()},20)}};
  }
  function openNpc(id){
    const n=NPCS[id];if(!n)return;
    if(!unlocked(id)){msgLocal('🔒 '+n.name+' пока не для твоей масти. Нужна масть «'+RANKS[n.rank]+'».');return}
    if(typeof window.npcMenu!=='function')return;window.npcMenu();
    setTimeout(()=>{const c=$('modal-content');if(!c)return;c.innerHTML='<h2>'+n.icon+' '+n.name+'</h2>'+card(id,n)+'<button type="button" id="npc-back" style="width:100%;margin-top:6px">← Назад в общак</button>';const b=c.querySelector('[data-custom-npc]');if(b)b.onclick=()=>useNpc(id);const back=$('npc-back');if(back)back.onclick=render},20);
  }
  function showNpcResult(id,text){
    const n=NPCS[id],c=$('modal-content');if(!c)return;
    const st=state(id);
    c.innerHTML='<h2>'+n.icon+' '+n.name+'</h2><div style="padding:18px 10px;text-align:center"><div style="font-size:34px;margin-bottom:10px">'+(text.includes('провал')||text.includes('пострадал')?'❌':'✅')+'</div><p style="font-size:18px;margin:0 0 14px"><b>'+text+'</b></p><small>Осталось обращений: '+st.total+'</small></div><button type="button" id="npc-back" style="width:100%;margin-top:6px">← К НПС</button>';
    const back=$('npc-back');if(back)back.onclick=()=>openNpc(id);
  }
  function useNpc(id){
    const n=NPCS[id];if(!n||!unlocked(id))return;const st=state(id);
    if(st.locked){msgLocal('⏳ '+n.name+' отшил тебя. Ещё '+cooldownText(st.until)+'.');return}
    if(st.total<=0){offerAd(id);return}
    const d=data(id);
    if(d.used<MAX_FREE)d.used++;
    else if(d.extra>0)d.extra--;
    if(d.used>=MAX_FREE&&d.extra<=0)d.until=Date.now()+COOLDOWN;
    uses[id]=d;save();
    const oldRandom=Math.random,oldMsg=window.msg;
    let result='';
    if(id==='косой'){const p=successChance(id);Math.random=()=>oldRandom()<p?0:.55}
    if(typeof oldMsg==='function')window.msg=x=>{result=String(x)};
    try{window.npcMenu();const real=document.querySelector('[data-npc="'+id+'"]');if(real)real.click()}finally{Math.random=oldRandom;if(typeof oldMsg==='function')window.msg=oldMsg}
    if(!result)result='🤝 '+n.name+' закончил разговор.';
    const key=INTKEY+id;let count=0;try{count=Number(localStorage.getItem(key)||'0')+1;localStorage.setItem(key,String(count))}catch(e){count=1}
    if(count%3===0){rep[id]=getRep(id)+1;save();result+=' · 🤝 Доверие выросло: '+rep[id]}
    showNpcResult(id,result);
  }
  function offerAd(id){
    const n=NPCS[id],c=$('modal-content');if(!c)return;
    c.innerHTML='<h2>🎬 Ещё два дела</h2><p>'+n.icon+' '+n.name+' сейчас недоступен.</p><p>Посмотри рекламу и получи ещё <b>2 обращения</b> к '+n.name+'.</p><button type="button" id="npc-ad" style="width:100%;padding:13px">🎬 Посмотреть рекламу → +2 обращения</button><button type="button" id="npc-ad-back" style="width:100%;margin-top:7px">← Назад</button>';
    $('npc-ad').onclick=()=>{if(typeof window.showRewardedAd==='function')window.showRewardedAd(()=>grantAd(id));else msgLocal('📺 Реклама пока не подключена. После подключения rewarded-рекламы здесь будут выдаваться 2 обращения.')};
    $('npc-ad-back').onclick=()=>openNpc(id);
  }
  function grantAd(id){const d=data(id);d.extra=(d.extra||0)+AD_BONUS;uses[id]=d;save();showNpcResult(id,'🎁 '+NPCS[id].name+': +2 обращения получены за рекламу.');}
  function msgLocal(x){if(typeof window.msg==='function')window.msg(x);else alert(x)}
  function hideNameButton(){const c=$('modal-content');if(!c)return;c.querySelectorAll('#name-btn').forEach(x=>x.remove());[...c.querySelectorAll('*')].forEach(x=>{if(x.children.length===0&&/сменить имя/i.test(x.textContent||''))x.remove()})}
  function init(){const o=$('modal-overlay');if(!o)return;new MutationObserver(()=>{hideNameButton();render()}).observe(o,{childList:true,subtree:true,characterData:true});document.addEventListener('click',e=>{if(e.target.closest('#btn-more'))setTimeout(render,20)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();