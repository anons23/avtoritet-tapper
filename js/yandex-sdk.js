'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  let ysdk=null;
  let player=null;
  let pendingSave=null;
  let saveTimer=null;

  function log(){
    if(window.console&&console.debug) console.debug.apply(console,['[Yandex SDK]'].concat([].slice.call(arguments)));
  }

  function queueCloudSave(value, flush){
    if(!player) return;
    try{ pendingSave=JSON.parse(value); }catch(e){ return; }
    clearTimeout(saveTimer);
    if(flush) flushCloudSave();
    else saveTimer=setTimeout(flushCloudSave,2000);
  }

  function flushCloudSave(){
    clearTimeout(saveTimer);
    saveTimer=null;
    if(!player||!pendingSave) return;
    const data=pendingSave;
    pendingSave=null;
    player.setData({gameSave:data},false).catch(function(err){log('cloud save failed',err);});
  }

  async function init(){
    if(!window.YaGames){ log('SDK loader unavailable; local save remains active.'); return; }
    try{
      ysdk=await window.YaGames.init();
      window.ysdk=ysdk;
      try{ player=await ysdk.getPlayer(); }catch(e){ log('player init failed',e); }
      if(player){
        try{
          const cloud=await player.getData(['gameSave']);
          const local=localStorage.getItem(SAVE_KEY);
          if(cloud&&cloud.gameSave&&!local){
            localStorage.setItem(SAVE_KEY,JSON.stringify(cloud.gameSave));
          }
        }catch(e){ log('cloud load failed',e); }
      }
      if(ysdk.on){
        ysdk.on('game_api_pause',flushCloudSave);
        ysdk.on('game_api_resume',function(){});
      }
      log('initialized');
    }catch(e){ log('init failed',e); }
  }

  window.YandexGameReady=init();

  const nativeSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const result=nativeSetItem.call(this,key,value);
    if(key===SAVE_KEY) queueCloudSave(value,false);
    return result;
  };

  window.showRewardedAd=function(onReward){
    if(!ysdk||!ysdk.adv||typeof ysdk.adv.showRewardedVideo!=='function'){
      if(typeof onReward==='function') onReward(false);
      return false;
    }
    try{
      ysdk.adv.showRewardedVideo({callbacks:{
        onRewarded:function(){if(typeof onReward==='function')onReward(true);},
        onError:function(err){log('rewarded ad error',err);},
        onClose:function(){}
      }});
      return true;
    }catch(e){log('rewarded ad call failed',e);return false;}
  };

  window.YandexGameBridge={getSDK:function(){return ysdk;},flushSave:flushCloudSave,showFullscreenAd:function(){
    if(ysdk&&ysdk.adv&&ysdk.adv.showFullscreenAdv)ysdk.adv.showFullscreenAdv();
  }};
  window.addEventListener('pagehide',flushCloudSave);
  window.addEventListener('beforeunload',flushCloudSave);
})();
