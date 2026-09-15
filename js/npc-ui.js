'use strict';
(function(){
  const RANKS=['Салага','Пацан','Блатной','Смотрящий','Авторитет','Вор в законе'];
  const USES_KEY='avtoritet_npc_uses_v2';
  const COOLDOWN=30*60*1000;
  const NPCS=['шайба','бугор','косой','смотрящий'];
  let state={free:2,extra:0,lastAd:0};
  const $=id=>document.getElementById(id);
  function load(){try{const d=JSON.parse(localStorage.getItem(USES_KEY)||'null');if(d&&typeof d==='object')state={...state,...d}}catch(e){};state.free=Math.max(0,Math.floor(Number(state.free)||0));state.extra=Math.max(0,Math.floor(Number(state.extra)||0));state.lastAd=Math.max(0,Number(state.lastAd)||0)}
  function save(){try{localStorage.setItem(USES_KEY,JSON.stringify(state))}catch(e){}}
  function msgLocal(t){const e=$('event-message');if(!e)return;e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),3200)}
  function totalUses(){return state.free+state.extra}
  function consume(){if(state.free>0){state.free--;return true}if(state.extra>0){state.extra--;return true}return false}
  function offerAd(id){if(Date.now()-state.lastAd<COOLDOWN){const left=Math.ceil((COOLDOWN-(Date.now()-state.lastAd))/60000);msgLocal('📺 Следующая награда за рекламой будет доступна примерно через '+left+' мин.');return}if(typeof window.showRewardedAd!=='function'){msgLocal('📺 Реклама сейчас недоступна.');return}state.lastAd=Date.now();save();window.showRewardedAd(function(rewarded){if(rewarded===false){msgLocal('📺 Награда не получена. Попробуй позже.');return}state.extra+=2;save();msgLocal('📺 За рекламу: +2 использования NPC');render();})}
  function rank(){const s=window.gameState||null;const p=Number(s&&s.points||0);let i=0;RANKS.forEach((_,n)=>{const need=[0,100,500,2000,8000,25000][n];if(p>=need)i=n});return RANKS[i]}
  function render(){const host=$('modal-content');if(!host)return;host.querySelectorAll('[data-npc]').forEach(b=>{b.disabled=totalUses()<1});}
  function useNpc(id){const npc=window.NPCS&&window.NPCS[id]||null;if(!npc||typeof npc.run!=='function')return;if(totalUses()<1){offerAd(id);return}if(!consume())return;save();try{npc.run()}catch(e){state.free++;save();msgLocal('⚠️ Не удалось выполнить действие. Использование возвращено.')}render()}
  function menu(){if(window.gameState&&window.gameState.jailed){msgLocal('🔒 Сначала выйди из карцера');return}const h='<h2>👥 Люди</h2><p>Два бесплатных использования. Ещё +2 можно получить за добровольный просмотр рекламы.</p><div class="shop-grid">'+NPCS.map(id=>{const n=window.NPCS&&window.NPCS[id];return n?'<button type="button" data-npc="'+id+'">'+n.icon+' '+n.name+'<br>'+n.action+'</button>':''}).join('')+'</div><p>Осталось использований: <b>'+totalUses()+'</b></p>';if(typeof window.openGameModal==='function')window.openGameModal(h);else if(typeof window.openModal==='function')window.openModal(h);hosten();document.querySelectorAll('[data-npc]').forEach(b=>b.addEventListener('click',()=>useNpc(b.dataset.npc)));render()}
  function hosten(){}
  function init(){load();window.NPCUI={menu,useNpc,render};window.openNpcMenu=menu;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();