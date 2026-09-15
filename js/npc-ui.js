'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const NPCS={
    шайба:{name:'Шайба',icon:'🧢',desc:'торгаш',action:'Сходить на дело',reward:'25 🚬 +1 🧠'},
    бугор:{name:'Бугор',icon:'💪',desc:'тренер',action:'Прокачаться',reward:'+1 💪 +2 🧠 +15 ⭐'},
    косой:{name:'Косой',icon:'😏',desc:'решала',action:'Рискнуть',reward:'шанс на +100 🚬 +40 ⭐'},
    смотрящий:{name:'Смотрящий',icon:'👑',desc:'старший',action:'Получить совет',reward:'цель по масти'}
  };
  const REPKEY='avtoritet_npc_rep_v1';
  let rep={};
  try{rep=JSON.parse(localStorage.getItem(REPKEY)||'{}')||{}}catch(e){rep={}}
  const getRep=id=>Math.max(0,Number(rep[id]||0));
  const saveRep=()=>{try{localStorage.setItem(REPKEY,JSON.stringify(rep))}catch(e){}};
  const level=id=>Math.floor(getRep(id)/3)+1;
  function card(id,n){const r=getRep(id),lv=level(id);return '<button type="button" class="npc-btn npc-custom" data-custom-npc="'+id+'" style="text-align:left;padding:14px;margin-bottom:8px">'+n.icon+' <b>'+n.name+'</b><br><small>'+n.desc+' · доверие '+r+' · уровень '+lv+'</small><br><span>▶ '+n.action+'</span><br><small>Награда: '+n.reward+'</small></button>'}
  function render(){const c=$('modal-content');if(!c)return;const title=c.querySelector('h2');if(!title||!title.textContent.includes('Ещё'))return;c.innerHTML='<h2>☰ Общак</h2><p>Здесь решаются дела. Чем чаще обращаешься к своим — тем выше доверие.</p><div>'+Object.entries(NPCS).map(([id,n])=>'<button type="button" class="npc-link" data-open-npc="'+id+'" style="width:100%;margin:5px 0;padding:11px">'+n.icon+' '+n.name+' — '+n.desc+'</button>').join('')+'</div><hr><h3>🏆 Достижения</h3><p>Тап-машина, Критический удар, Решала, Пачка за пачкой.</p><h3>💎 Новый срок</h3><p>После 25 000 ⭐ можно начать новый срок и сохранить постоянный бонус силы.</p><button type="button" id="prestige-custom" style="width:100%;padding:12px">Начать новый срок</button>';c.querySelectorAll('[data-open-npc]').forEach(b=>b.onclick=()=>openNpc(b.dataset.openNpc));const p=$('prestige-custom');if(p)p.onclick=()=>{if(typeof window.more==='function'){window.more();setTimeout(()=>{$('prestige')?.click()},20)}}}
  function openNpc(id){if(typeof window.npcMenu!=='function')return;window.npcMenu();setTimeout(()=>{const c=$('modal-content');if(!c)return;c.innerHTML='<h2>'+NPCS[id].icon+' '+NPCS[id].name+'</h2>'+card(id,NPCS[id])+'<button type="button" id="npc-back" style="width:100%;margin-top:6px">← Назад в общак</button>';const b=c.querySelector('[data-custom-npc]');if(b)b.onclick=()=>{rep[id]=getRep(id)+1;saveRep();window.npcMenu();setTimeout(()=>{const real=document.querySelector('[data-npc="'+id+'"]');if(real)real.click()},30)};const back=$('npc-back');if(back)back.onclick=render},20)}
  function hideNameButton(){const c=$('modal-content');if(!c)return;c.querySelectorAll('#name-btn').forEach(x=>x.remove());[...c.querySelectorAll('*')].forEach(x=>{if(x.children.length===0&&/сменить имя/i.test(x.textContent||''))x.remove()})}
  function init(){const o=$('modal-overlay');if(!o)return;new MutationObserver(()=>{hideNameButton();render()}).observe(o,{childList:true,subtree:true,characterData:true});document.addEventListener('click',e=>{if(e.target.closest('#btn-more'))setTimeout(render,20)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
