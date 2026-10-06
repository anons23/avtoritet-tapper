/* raid-patch v1.8 — cooldown + raid drops */
'use strict';
(function(){
var MS=90*60*1000,EX=15*60*1000,CD=30*60*1000,K='avt_rt_v2';
var HP={petrovich:1500,vtirach:2000,mafioznik:3000,mongol:4000,glaz:5000,krest:6500,psikh:8000};
var NAMES={petrovich:'ПЕТРОВИЧ',vtirach:'ВТИРАЧ',mafioznik:'МАФИОЗНИК',mongol:'МОНГОЛ',glaz:'ГЛАЗ',krest:'КРЕСТ',psikh:'ПСИХ АРКАША'};
var lastWinMark='';
function $(i){return document.getElementById(i)}
function now(){return Date.now()}
function load(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return{}}}
function save(p){try{localStorage.setItem(K,JSON.stringify(p))}catch(e){}}
function fmt(ms){ms=Math.max(0,ms|0);var s=ms/1000|0,m=s/60|0,h=m/60|0;s%=60;m%=60;return(h?h+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function cardId(card){var s=(card.querySelector('img')||{}).src||'';
if(/petrovich/i.test(s))return'petrovich';if(/Vtirach|vtirach/i.test(s))return'vtirach';
if(/mafioznik/i.test(s))return'mafioznik';if(/Mongol|mongol/i.test(s))return'mongol';
if(/Glaz|glaz/i.test(s))return'glaz';if(/Crest|krest/i.test(s))return'krest';
if(/Psish|psikh/i.test(s))return'psikh';return null}
function fightId(){var el=document.querySelector('.raid-name');if(!el)return null;var c=el.className||'';
var ids=['petrovich','vtirach','mafioznik','mongol','glaz','krest','psikh'];
for(var i=0;i<ids.length;i++)if(c.indexOf(ids[i])>=0)return ids[i];return null}
function ensure(id){var p=load();if(!p[id])p[id]={d:0,cd:0};if(typeof p[id].cd!=='number')p[id].cd=0;if(typeof p[id].d!=='number')p[id].d=0;save(p);return p[id]}
function left(pr){return Math.max(0,(pr&&pr.d||0)-now())}
function cdLeft(pr){return Math.max(0,(pr&&pr.cd||0)-now())}
function expired(pr){return !!(pr&&pr.d&&left(pr)<=0)}
function onCd(pr){return !!(pr&&pr.cd&&cdLeft(pr)>0)}
function killFT(){var e=$('raid-fight-timer');if(e)try{e.remove()}catch(x){}}
function markWin(id){
if(!id)return;
var key=id+':'+Math.floor(now()/1000);
if(lastWinMark===key)return;
lastWinMark=key;
var p=load(),pr=p[id]||{d:0,cd:0};
pr.cd=now()+CD;
p[id]=pr;save(p);
try{ if(typeof window.rollRaidDrops==='function') window.rollRaidDrops(id); }catch(e){}
}
function watchWin(){
var res=$('raid-result');
if(!res)return;
if(!res.classList.contains('show'))return;
var id=fightId();
if(!id)return;
var style=window.getComputedStyle?getComputedStyle(res):null;
if(style&&style.display==='none')return;
markWin(id);
}
function onFight(){
killFT();
var id=fightId();if(!id)return;
var pr=ensure(id);
if(!pr.d){pr.d=now()+MS;var p=load();p[id]=pr;save(p)}
fixHud();
watchWin();
}
function fixHud(){
var hud=document.querySelector('.raid-hud');if(!hud)return;
hud.style.cssText='display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:8px;padding:10px 12px;pointer-events:none';
var name=hud.querySelector('.raid-name');var hp=hud.querySelector('.raid-hp');
if(name&&!hud.querySelector('.raid-hud-left')){
var L=document.createElement('div');L.className='raid-hud-left';
L.style.cssText='display:flex;flex-direction:column;gap:6px;flex:1;min-width:0';
name.parentNode.insertBefore(L,name);L.appendChild(name);if(hp)L.appendChild(hp);
}
if(name)name.style.cssText='font-size:20px;font-weight:1000;color:#f3d27a;text-shadow:0 2px 6px #000';
if(hp){hp.style.cssText='width:min(220px,70vw)';
var tr=hp.querySelector('.raid-hp-track');if(tr)tr.style.cssText='height:12px;border-radius:8px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.15);overflow:hidden';
var tx=$('raid-hp-text');if(tx)tx.style.cssText='margin-top:3px;font-size:12px;font-weight:800;color:#eee;text-shadow:0 1px 3px #000'}
var en=$('raid-energy');
if(!en){en=document.createElement('div');en.id='raid-energy';hud.appendChild(en)}
en.style.cssText='padding:6px 12px;border-radius:12px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#7ee0ff;font-weight:800;font-size:14px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);white-space:nowrap';
var s=typeof window.getGameState==='function'?window.getGameState():null;
en.textContent=s?('⚡ '+Math.max(0,s.energy|0)+' / '+Math.max(0,s.maxEnergy|250)):'⚡ —';
}
function cards(){
var list=document.querySelector('.raid-fighter-list');if(!list)return;var p=load();
list.querySelectorAll('.raid-fighter-card').forEach(function(card){
var id=cardId(card);if(!id)return;var pr=p[id];var info=card.querySelector('.raid-card-info')||card;
var el=card.querySelector('.raid-card-timer');
if(!el){el=document.createElement('div');el.className='raid-card-timer';
el.style.cssText='margin-top:4px;font-size:12px;font-weight:800';info.appendChild(el)}
if(pr&&pr.cd&&cdLeft(pr)>0){el.textContent='⏳ '+fmt(cdLeft(pr));el.style.color='#7ec8ff';return;}
if(!pr||!pr.d){el.textContent='⏱ 1:30:00';el.style.color='#9a9a9a';return}
var L=left(pr);
if(L<=0){el.textContent='⏱ 00:00';el.style.color='#ff4d4d'}
else{el.textContent='⏱ '+fmt(L);el.style.color=L<300000?'#ffb84d':'#f3d27a'}
});
}
function box(html){
var content=$('modal-content');if(!content)return null;
content.innerHTML='<div style="padding:20px;display:flex;align-items:center;justify-content:center;min-height:40vh"><div style="width:min(340px,92vw);padding:20px 16px;border-radius:16px;background:#1a1a1a;border:1px solid #555;text-align:center;color:#fff">'+html+'</div></div>';
return content;
}
function modalExpired(id){
var name=NAMES[id]||id;
box('<div style="font-size:20px;font-weight:1000;color:#f3d27a;margin-bottom:8px">⏱ Время боя закончилось</div>'+
'<p style="margin:0 0 16px;color:#bbb;font-size:14px">Бой с <b style="color:#fff">'+name+'</b> истёк (1:30).</p>'+
'<button id="rt-ad" style="width:100%;margin:0 0 10px;padding:14px;border-radius:12px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;font-weight:900;font-size:14px">🎬 Продлить на 15 мин</button>'+
'<button id="rt-reset" style="width:100%;margin:0 0 10px;padding:14px;border-radius:12px;border:1px solid #666;background:#2a2a2a;color:#fff;font-weight:900">Начать заново</button>'+
'<button id="rt-back" style="width:100%;padding:12px;border-radius:12px;border:1px solid #444;background:transparent;color:#aaa">← Назад</button>');
var ad=$('rt-ad');if(ad)ad.onclick=function(){function g(){var p=load(),pr=p[id]||{d:0,cd:0};pr.d=Math.max(now(),pr.d||now())+EX;p[id]=pr;save(p);if(window.openRaidMenu)window.openRaidMenu()}
if(typeof window.showRewardedAd==='function')window.showRewardedAd(function(ok){if(ok!==false)g()});else g()};
var rs=$('rt-reset');if(rs)rs.onclick=function(){var p=load();p[id]={d:0,cd:(p[id]&&p[id].cd)||0};save(p);if(window.openRaidMenu)window.openRaidMenu()};
var bk=$('rt-back');if(bk)bk.onclick=function(){if(window.openRaidMenu)window.openRaidMenu()};
}
function modalCooldown(id){
var pr=ensure(id);var name=NAMES[id]||id;var leftMs=cdLeft(pr);
box('<div style="font-size:20px;font-weight:1000;color:#7ec8ff;margin-bottom:8px">⏳ Боец отдыхает</div>'+
'<p style="margin:0 0 8px;color:#bbb;font-size:14px">Ты уже победил <b style="color:#fff">'+name+'</b>.</p>'+
'<p style="margin:0 0 16px;color:#9ad;font-size:15px;font-weight:800">Повтор через '+fmt(leftMs)+'</p>'+
'<button id="rt-cd-ad" style="width:100%;margin:0 0 10px;padding:14px;border-radius:12px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;font-weight:900;font-size:14px">🎬 Реклама — напасть сейчас</button>'+
'<button id="rt-cd-back" style="width:100%;padding:12px;border-radius:12px;border:1px solid #444;background:transparent;color:#aaa">← Назад</button>');
var ad=$('rt-cd-ad');if(ad)ad.onclick=function(){function g(){var p=load(),pr=p[id]||{d:0,cd:0};pr.cd=0;p[id]=pr;save(p);if(window.openRaidMenu)window.openRaidMenu()}
if(typeof window.showRewardedAd==='function')window.showRewardedAd(function(ok){if(ok!==false)g()});else g()};
var bk=$('rt-cd-back');if(bk)bk.onclick=function(){if(window.openRaidMenu)window.openRaidMenu()};
}
document.addEventListener('click',function(e){
var card=e.target.closest&&e.target.closest('.raid-fighter-card:not(.locked)');if(!card)return;
var id=cardId(card);if(!id)return;var pr=ensure(id);
if(onCd(pr)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();modalCooldown(id);return}
if(expired(pr)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();modalExpired(id);return}
},true);
setInterval(function(){
if(document.querySelector('#raid-fighter')&&document.querySelector('.raid-scene'))onFight();
if(document.querySelector('.raid-fighter-list'))cards();
},400);
console.log('[raid-patch] v1.8 drops');
})();
