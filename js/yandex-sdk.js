'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const HEALTH_KEY='avtoritet_health_v3';
  let ysdk=null,player=null,pendingData=null,saveTimer=null,cloudReady=false;
  function log(){if(window.console&&console.debug)console.debug.apply(console,['[Yandex SDK]'].concat([].slice.call(arguments)));}
  function gameplayStart(){try{if(ysdk?.features?.GameplayAPI?.start)ysdk.features.GameplayAPI.start();}catch(e){log('gameplay start failed',e);}}
  function gameplayStop(){try{if(ysdk?.features?.GameplayAPI?.stop)ysdk.features.GameplayAPI.stop();}catch(e){log('gameplay stop failed',e);}}
  function snapshot(){
    const out={};
    try{const s=localStorage.getItem(SAVE_KEY);if(s)out.gameSave=JSON.parse(s);}catch(e){}
    try{const h=localStorage.getItem(HEALTH_KEY);if(h)out.healthSave=JSON.parse(h);}catch(e){}
    return Object.keys(out).length?out:null;
  }
  function queueCloudSave(flush){
    if(!player||!cloudReady)return;
    const data=snapshot();if(!data)return;
    pendingData=data;clearTimeout(saveTimer);
    if(flush)flushCloudSave();else saveTimer=setTimeout(flushCloudSave,2000);
  }
  function flushCloudSave(){
    clearTimeout(saveTimer);saveTimer=null;
    if(!player||!cloudReady||!pendingData)return;
    const data=pendingData;pendingData=null;
    player.setData(data,false).catch(function(err){pendingData=data;log('cloud save failed',err);});
  }
  function signalLoadingReady(){try{if(ysdk?.features?.LoadingAPI?.ready)ysdk.features.LoadingAPI.ready();}catch(e){log('loading ready failed',e);}}
  async function init(){
    if(!window.YaGames){log('SDK loader unavailable; local save remains active.');return;}
    try{
      ysdk=await window.YaGames.init();window.ysdk=ysdk;
      try{player=await ysdk.getPlayer();}catch(e){log('player init failed',e);}
      if(player){
        try{
          const cloud=await player.getData(['gameSave','healthSave']);
          const localGame=localStorage.getItem(SAVE_KEY),localHealth=localStorage.getItem(HEALTH_KEY);
          if(!localGame&&cloud?.gameSave)localStorage.setItem(SAVE_KEY,JSON.stringify(cloud.gameSave));
          if(!localHealth&&cloud?.healthSave)localStorage.setItem(HEALTH_KEY,JSON.stringify(cloud.healthSave));
          cloudReady=true;
          queueCloudSave(false);
        }catch(e){log('cloud load failed',e);}
      }
      if(ysdk.on){
        ysdk.on('game_api_pause',function(){gameplayStop();flushCloudSave();});
        ysdk.on('game_api_resume',function(){gameplayStart();});
      }
      gameplayStart();signalLoadingReady();log('initialized');
    }catch(e){log('init failed',e);}
  }
  window.YandexGameReady=init();
  const nativeSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const result=nativeSetItem.call(this,key,value);
    if(key===SAVE_KEY||key===HEALTH_KEY)queueCloudSave(false);
    return result;
  };
  window.showRewardedAd=function(onReward){
    if(!ysdk?.adv||typeof ysdk.adv.showRewardedVideo!=='function'){if(typeof onReward==='function')onReward(false);return false;}
    gameplayStop();let finished=false;
    const reward=function(ok){if(finished)return;finished=true;if(typeof onReward==='function')onReward(ok!==false);};
    try{
      ysdk.adv.showRewardedVideo({callbacks:{onRewarded:function(){reward(true);},onClose:function(){gameplayStart();},onError:function(err){reward(false);gameplayStart();log('rewarded ad error',err);}}});
      return true;
    }catch(e){reward(false);gameplayStart();log('rewarded ad call failed',e);return false;}
  };
  window.YandexGameBridge={getSDK:function(){return ysdk;},flushSave:flushCloudSave,showFullscreenAd:function(){
    if(!ysdk?.adv||typeof ysdk.adv.showFullscreenAdv!=='function')return false;
    gameplayStop();try{ysdk.adv.showFullscreenAdv({callbacks:{onClose:gameplayStart,onError:gameplayStart}});return true;}catch(e){gameplayStart();return false;}
  }};
  window.addEventListener('pagehide',flushCloudSave);
  window.addEventListener('beforeunload',flushCloudSave);
})();