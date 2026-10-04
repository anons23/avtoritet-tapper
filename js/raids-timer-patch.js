/* raid-timer v1.2 minimal */
'use strict';
(function(){
var MS=90*60*1000,EX=15*60*1000,K='avt_rt_v2',tick=0;
function $(i){return document.getElementById(i)}
function now(){return Date.now()}
function load(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return {}}}
function save(p){try{localStorage.setItem(K,JSON.stringify(p))}catch(e){}}
function fmt(ms){ms=Math.max(0,ms|0);var s=ms/1000|0,m=s/60|0,h=m/60|0;s%=60;m%=60;return(h?h+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function idOf(){
  var el=document.querySelector('.raid-name');if(!el)return null;
  var c=el.className||'',ids=['petrovich','vtirach','mafioznik','mongol','glaz','krest','psikh'];
  for(var i=0;i<ids.length;i++)if(c.indexOf(ids[i])>=0)return ids[i];
  return null;
}
function ensure(id){var p=load();if(!p[id])p[id]={d:0};save(p);return p[id]}
function left(pr){return Math.max(0,(pr.d||0)-now())}
function hud(){
  var id=idOf();if(!id)return;
  var pr=ensure(id);
  if(!pr.d){pr.d=now()+MS;var p=load();p[id]=pr;save(p)}
  var el=$('raid-fight-timer');
  if(!el){
    var hudEl=document.querySelector('.raid-hud');if(!hudEl)return;
    el=document.createElement('div');el.id='raid-fight-timer';
    el.style.cssText='padding:6px 12px;border-radius:8px;background:rgba(0,0,0,.9);color:#f3d27a;font-weight:900;font-size:16px;margin:6px 0;display:inline-block;z-index:20;position:relative';
    hudEl.appendChild(el);
  }
  var L=left(pr);
  el.textContent='⏱ '+fmt(L);
  el.style.color=L<=0?'#ff6b6b':(L<300000?'#ffb84d':'#f3d27a');
  if(L<=0) timeUp(id);
}
function timeUp(id){
  if($('raid-timeup'))return;
  if(tick){clearInterval(tick);tick=0}
  var c=$('modal-content');if(!c)return;
  var name=(document.querySelector('.raid-name')||{}).textContent||id;
  c.innerHTML='<div style="padding:24px;text-align:center;color:#fff;background:#111;min-height:50vh;display:flex;flex-direction:column;align-items:center;justify-content:center">'+
    '<div id="raid-timeup" style="max-width:340px;width:92%;padding:20px;border:1px solid #555;border-radius:16px;background:#1a1a1a">'+
    '<div style="font-size:22px;font-weight:900;color:#f3d27a;margin-bottom:10px">⏱ Время вышло</div>'+
    '<p style="color:#ccc;margin:0 0 14px">Бой с <b>'+name+'</b> закончился по таймеру (90 мин).</p>'+
    '<button id="rt-ad" style="width:100%;padding:14px;margin:0 0 8px;border-radius:12px;border:1px solid #80662e;background:#3a3420;color:#f3d27a;font-weight:900">🎬 Реклама · +15 мин</button>'+
    '<button id="rt-reset" style="width:100%;padding:14px;margin:0 0 8px;border-radius:12px;border:1px solid #666;background:#2a2a2a;color:#fff;font-weight:900">Выйти · полное HP</button>'+
    '<button id="rt-back" style="width:100%;padding:12px;border-radius:12px;border:1px solid #444;background:transparent;color:#aaa">← К бойцам</button>'+
    '</div></div>';
  var ad=$('rt-ad');if(ad)ad.onclick=function(){
    function g(){var p=load();var pr=p[id]||{d:0};pr.d=Math.max(now(),pr.d||now())+EX;p[id]=pr;save(p);if(window.openRaidMenu)window.openRaidMenu()}
    if(typeof window.showRewardedAd==='function')window.showRewardedAd(function(ok){if(ok!==false)g()});else g();
  };
  var rs=$('rt-reset');if(rs)rs.onclick=function(){var p=load();p[id]={d:0};save(p);if(window.openRaidMenu)window.openRaidMenu()};
  var bk=$('rt-back');if(bk)bk.onclick=function(){if(window.openRaidMenu)window.openRaidMenu()};
}
setInterval(function(){
  if(document.querySelector('#raid-fighter')&&document.querySelector('.raid-scene')&&!$('raid-timeup')){
    hud();
    if(!tick)tick=setInterval(function(){
      if(!document.querySelector('#raid-fighter')){clearInterval(tick);tick=0;return}
      hud();
    },500);
  }
},400);
console.log('[raid-timer] v1.2 ready');
})();
