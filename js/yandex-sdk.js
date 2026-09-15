'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  let ysdk=null,player=null,pendingSave=null,saveTimer=null,cloudReady=false;
  function log(){if(window.console&&console.debug)console.debug.apply(console,['[Yandex SDK]'].concat([].slice.call(arguments)));}
  function gameplayStart(){try{if(ysdk&&ysdk.features&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.start)ysdk.features.GameplayAPI.start();}catch(e){log('gameplay start failed',e);}}
  function gameplayStop(){try{if(ysdk&&ysdk.features&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.stop)ysdk.features.GameplayAPI.stop();}catch(e){log('gameplay stop failed',e);}}
  function queueCloudSave(value,flush){
    if(!player||!cloudReady)return;
    try{pendingSave=JSON.parse(value);}catch(e){return;}
    clearTimeout(saveTimer);
    if(flush)flushCloudSave();else saveTimer=setTimeout(flushCloudSave,2000);
  }
  function flushCloudSave(){
    clearTimeout(saveTimer);saveTimer=null;
    if(!player||!cloudReady||!pendingSave)return;
    const data=pendingSave;pendingSave=null;
    player.setData({gameSave:data},false).catch(function(err){pendingSave=data;log('cloud save failed',err);});
  }
  function signalLoadingReady(){try{if(ysdk&&ysdk.features&&ysdk.features.LoadingAPI&&typeof ysdk.features.LoadingAPI.ready==='function')ysdk.features.LoadingAPI.ready();}catch(e){log('loading ready failed',e);}}
  async function init(){
    if(!window.YaGames){log('SDK loader unavailable; local save remains active.');return;}
    try{
      ysdk=await window.YaGames.init();window.ysdk=ysdk;
      try{player=await ysdk.getPlayer();}catch(e){log('player init failed',e);}
      if(player){
        try{
          const cloud=await player.getData(['gameSave']);
          const local=localStorage.getItem(SAVE_KEY);
          if(!local&&cloud&&cloud.gameSave){localStorage.setItem(SAVE_KEY,JSON.stringify(cloud.gameSave));}
          cloudReady=true;
          const current=localStorage.getItem(SAVE_KEY);
          if(current)queueCloudSave(current,false);
        }catch(e){log('cloud load failed',e);}
      }
      if(ysdk.on){
        ysdk.on('game_api_pause',function(){gameplayStop();flushCloudSave();});
        ysdk.on('game_api_resume',function(){gameplayStart();});
      }
      gameplayStart();
      signalLoadingReady();
      log('initialized');
    }catch(e){log('init failed',e);}
  }
  window.YandexGameReady=init();
  const nativeSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){const result=nativeSetItem.call(this,key,value);if(key===SAVE_KEY)queueCloudSave(value,false);return result;};
  window.showRewardedAd=function(onReward){
    if(!ysdk||!ysdk.adv||typeof ysdk.adv.showRewardedVideo!=='function'){if(typeof onReward==='function')onReward(false);return false;}
    gameplayStop();
    let finished=false;
    const reward=function(ok){if(finished)return;finished=true;if(typeof onReward==='function')onReward(ok!==false);};
    try{
      ysdk.adv.showRewardedVideo({callbacks:{
        onRewarded:function(){reward(true);},
        onClose:function(){gameplayStart();},
        onError:function(err){reward(false);gameplayStart();log('rewarded ad error',err);}
      }});
      return true;
    }catch(e){reward(false);gameplayStart();log('rewarded ad call failed',e);return false;}
  };
  window.YandexGameBridge={getSDK:function(){return ysdk;},flushSave:flushCloudSave,showFullscreenAd:function(){
    if(!ysdk||!ysdk.adv||typeof ysdk.adv.showFullscreenAdv!=='function')return false;
    gameplayStop();
    try{ysdk.adv.showFullscreenAdv({callbacks:{onClose:gameplayStart,onError:gameplayStart}});return true;}catch(e){gameplayStart();return false;}
  }};
  window.addEventListener('pagehide',flushCloudSave);
  window.addEventListener('beforeunload',flushCloudSave);
})();