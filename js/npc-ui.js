'use strict';
(function(){
  const RANKS=['Салага','Пацан','Блатной','Смотрящий','Авторитет','Вор в законе'];
  const USES_KEY='avtoritet_npc_uses_v2';
  const COOLDOWN=30*60*1000;
  const NPCS=['шайба','бугор','косой','смотрящий'];
  let state={free:2,extra:0,lastAd:0};
  const $=id=>document.getElementById(id);
  function load(){try{const d=JSON.parse(localStorage.getItem(USES_KEY)||'null');if(d&&typeof d==='object')state={...state,...d}}catch(e){}state.free=Math.max(0,Math.floor(Number(state.free)||0));state.extra=Math.max(0,Math.floor(Number(state.extra)||0));state.lastAd=Math.max(0,Number(state.lastAd)||0)}
  function save(){try{localStorage.setItem(USES_KEY,JSON.stringify(state))}catch(e){}}
  function msgLocal(t){if(typeof window.msg==='function')window.msg(t);else{const e=$('event-message');if(e){e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),3200)}}}
  function totalUses(){return state.free+state.extra}
  function consume(){if(state.free>0){state.free--;return true}if(state.extra>0){state.extra--;return true}return false}
  function offerAd(){if(Date.now()-state.lastAd<COOLDOWN){const left=Math.ceil((COOLDOWN-(Date.now()-state.lastAd))/60000);msgLocal('📺 Следующая награда за рекламой будет доступна примерно через '+left+' мин.');return}if(typeof window.showRewardedAd!=='function'){msgLocal('📺 Реклама сейчас недоступна.');return}window.showRewardedAd(function(rewarded){if(rewarded===false){msgLocal('📺 Награда не получена. Попробуй позже.');return}state.lastAd=Date.now();state.extra+=2;save();msgLocal('📺 За рекламу: +2 использования NPC');render()})}
  function render(){const c=$('modal-content');if(!c)return;c.querySelectorAll('[data-npc]').forEach(b=>{b.disabled=totalUses()<1})}
  function useNpc(id){if(totalUses()<1){offerAd();return}if(typeof window.npcMenu!=='function'){msgLocal('⚠️ NPC временно недоступны.');return}if(!consume())return;save();try{let oldMsg=window.msg;let resultSeen=false;window.msg=function(text){resultSeen=true;oldMsg(text)};window.npcMenu();setTimeout(function(){const b=document.querySelector('[data-npc="'+id+'"]');if(b)b.click();window.msg=oldMsg;if(!resultSeen){state.free++;save();msgLocal('⚠️ Не удалось выполнить действие. Использование возвращено.')}render()},0)}catch(e){state.free++;save();msgLocal('⚠️ Не удалось выполнить действие. Использование возвращено.')}}
  function menu(){if(typeof window.npcMenu!=='function'){msgLocal('⚠️ NPC временно недоступны.');return}window.npcMenu();setTimeout(()=>{document.querySelectorAll('[data-npc]').forEach(b=>{if(b.dataset.npcBound)return;b.dataset.npcBound='1';b.addEventListener('click',()=>useNpc(b.dataset.npc))});render()},0)}
  function init(){load();window.NPCUI={menu,useNpc,render};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();