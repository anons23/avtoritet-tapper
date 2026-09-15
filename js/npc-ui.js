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
  const REPKEY='avtoritet_npc_rep_v2';
  const USEKEY='avtoritet_npc_uses_v2';
  const COOLDOWN=30*60*1000;
  const MAX_FREE=2;
  const AD_BONUS=2;
  let rep={},uses={};
  try{rep=JSON.parse(localStorage.getItem(REPKEY)||'{}')||{}}catch(e){rep={}}
  try{uses=JSON.parse(localStorage.getItem(USEKEY)||'{}')||{}}catch(e){uses={}}
  const save=()=>{try{localStorage.setItem(REPKEY,JSON.stringify(rep));localStorage.setItem(USEKEY,JSON.stringify(uses))}catch(e){}};
  const getRep=id=>Math.max(0,Number(rep[id]||0));
  const rankIndex=()=>{try{const txt=$('rank')?.textContent||'';const i=RANKS.indexOf(txt.trim());return i<0?0:i}catch(e){return 0}};
  const unlocked=id=>rankIndex()>=NPCS[id].rank;
  const data=id=>{const x=uses[id]||{};return {used:Number(x.used||0),extra:Number(x.extra||0),until:Number(x.until||0)}};
  const level=id=>Math.floor(getRep(id)/3)+1;
  function state(id){
    const d=data(id),now=Date.now();
    if(d.until&&now>=d.until){d.used=0;d.extra=0;d.until=0;uses[id]=d;save()}
    const free=Math.max(0,MAX_FREE-d.used),extra=Math.max(0,d.extra);
    return {used:d.used,extra,free,total:free+extra,locked:d.until>now,until:d.until};
  }
  function successChance(id){
    const r=getRep(id);
    if(id!=='косой')return 1;
    return Math.min(.50,.20+r*.05);
  }
  function cooldownText(until){
    const left=Math.max(0,until-Date.now());
    const m=Math.ceil(left/60000),sec=Math.ceil((left%60000)/1000);
    return m>1?m+' мин':sec+' сек';
  }
  function card(id,n){
    const st=state(id),r=getRep(id),lv=level(id),chance=successChance(id);
    const unavailable=!unlocked(id),blocked=st.total<=0||st.locked;
    let note='';
    if(unavailable)note='🔒 Откроется с мастью «'+RANKS[n.rank]+'»';
    else if(st.locked)note='⏳ Отдохни ещё '+cooldownText(st.until);
    else if(st.total<=0)note='🎬 Нажми сюда — можно получить ещё 2 обращения за рекламу';
    else note='Осталось обращений: '+st.total;
    if(id==='косой'&&!unavailable)note+=' · шанс успеха '+Math.round(chance*100)+'%';
    return '<button type="button" class="npc-btn npc-custom" data-custom-npc="'+id+'" style="text-align:left;padding:14px;margin-bottom:8px;width:100%;opacity:'+(unavailable?.55:1)+'">'+n.icon+' <b>'+n.name+'</b><br><small>'+n.desc+' · доверие '+r+' · уровень '+lv+'</small><br><span>▶ '+n.action+'</span><br><small>Награда: '+n.reward+'</small><br><small>'+note+'</small></button>';
  }
  function render(){
    const c=$('modal-content');if(!c)return;
    const title=c.querySelector('h2');if(!title||!title.textContent.includes('Ещё'))return;
    c.innerHTML='<h2>☰ Общак</h2><p>Свои не раздают доверие за просто так. Обращения ограничены: 2 раза, затем перерыв 30 минут.</p><div>'+Object.entries(NPCS).map(([id,n])=>'<button type="button" class="npc-link" data-open-npc="'+id+'" style="width:100%;margin:5px 0;padding:11px;text-align:left">'+n.icon+' '+n.name+' — '+n.desc+'</button>').join('')+'</div><hr><h3>🏆 Достижения</h3><p>Тап-машина, Критический удар, Решала, Пачка за пачкой.</p><h3>💎 Новый срок</h3><p>После 25 000 ⭐ можно начать новый срок и сохранить постоянный бонус силы.</p><button type="button" id="prestige-custom" style="width:100%;padding:12px">Начать новый срок</button>';
    c.querySelectorAll('[data-open-npc]').forEach(b=>b.onclick=()=>openNpc(b.dataset.openNpc));
    const p=$('prestige-custom');if(p)p.onclick=()=>{if(typeof window.more==='function'){window.more();setTimeout(()=>{$('prestige')?.click()},20)}};
  }
  function openNpc(id){
    const n=NPCS[id];if(!n)return;
    if(!unlocked(id)){alert('🔒 '+n.name+' пока не для твоей масти. Нужна масть «'+RANKS[n.rank]+'».');return}
    if(typeof window.npcMenu!=='function')return;
    window.npcMenu();
    setTimeout(()=>{
      const c=$('modal-content');if(!c)return;
      c.innerHTML='<h2>'+n.icon+' '+n.name+'</h2>'+card(id,n)+'<button type="button" id="npc-back" style="width:100%;margin-top:6px">← Назад в общак</button>';
      const b=c.querySelector('[data-custom-npc]');
      if(b)b.onclick=()=>useNpc(id);
      const back=$('npc-back');if(back)back.onclick=render;
    },20);
  }
  function useNpc(id){
    const n=NPCS[id];if(!n||!unlocked(id))return;
    let st=state(id);
    if(st.locked){msgLocal('⏳ '+n.name+' отшил тебя. Ещё '+cooldownText(st.until)+'.');return}
    if(st.total<=0){offerAd(id);return}
    const d=data(id);d.used=(d.used||0)+1;
    if(d.used>=MAX_FREE){d.until=Date.now()+COOLDOWN;d.used=0;d.extra=0}
    uses[id]=d;
    if((d.used||0)===0&&d.until){};
    const oldRandom=Math.random;
    if(id==='косой'){
      const p=successChance(id);
      Math.random=()=>oldRandom()<p?0:.55;
    }
    try{
      window.npcMenu();
      setTimeout(()=>{const real=document.querySelector('[data-npc="'+id+'"];');},0);
      const real=document.querySelector('[data-npc="'+id+'"]');
      if(real)real.click();
    }finally{Math.random=oldRandom}
    const totalBefore=getRep(id);
    const interactionCount=Number(localStorage.getItem('avtoritet_npc_interactions_v2_'+id)||'0')+1;
    try{localStorage.setItem('avtoritet_npc_interactions_v2_'+id,String(interactionCount))}catch(e){}
    if(interactionCount%3===0){rep[id]=totalBefore+1;save();setTimeout(()=>msgLocal('🤝 '+n.name+' стал доверять тебе чуть больше. Доверие: '+rep[id]),40)}else save();
    setTimeout(()=>openNpc(id),80);
  }
  function offerAd(id){
    const n=NPCS[id];
    const c=$('modal-content');if(!c)return;
    c.innerHTML='<h2>🎬 Ещё два дела</h2><p>'+n.icon+' '+n.name+' сейчас недоступен.</p><p>Посмотри рекламу и получи ещё <b>2 обращения</b> к '+n.name+'.</p><button type="button" id="npc-ad" style="width:100%;padding:13px">🎬 Посмотреть рекламу → +2 обращения</button><button type="button" id="npc-ad-back" style="width:100%;margin-top:7px">← Назад</button>';
    $('npc-ad').onclick=()=>{
      if(typeof window.showRewardedAd==='function'){
        window.showRewardedAd(()=>grantAd(id));
      }else{
        msgLocal('📺 Реклама пока не подключена. Подключи rewarded-рекламу — после просмотра будут выдаваться 2 обращения.');
      }
    };
    $('npc-ad-back').onclick=()=>openNpc(id);
  }
  function grantAd(id){const d=data(id);d.extra=(d.extra||0)+AD_BONUS;d.until=0;uses[id]=d;save();msgLocal('🎁 '+NPCS[id].name+': +2 обращения получены за рекламу.');openNpc(id)}
  function msgLocal(x){if(typeof window.msg==='function')window.msg(x);else alert(x)}
  function hideNameButton(){const c=$('modal-content');if(!c)return;c.querySelectorAll('#name-btn').forEach(x=>x.remove());[...c.querySelectorAll('*')].forEach(x=>{if(x.children.length===0&&/сменить имя/i.test(x.textContent||''))x.remove()})}
  function init(){
    const o=$('modal-overlay');if(!o)return;
    new MutationObserver(()=>{hideNameButton();render()}).observe(o,{childList:true,subtree:true,characterData:true});
    document.addEventListener('click',e=>{if(e.target.closest('#btn-more'))setTimeout(render,20)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();