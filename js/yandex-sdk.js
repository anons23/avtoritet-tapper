'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const HEALTH_KEY='avtoritet_health_v3';
  let ysdk=null,player=null,pendingData=null,saveTimer=null,cloudReady=false,adBusy=false;
  function log(){if(window.console&&console.debug)console.debug.apply(console,['[Yandex SDK]'].concat([].slice.call(arguments)));}
  function gameplayStart(){try{if(ysdk?.features?.GameplayAPI?.start)ysdk.features.GameplayAPI.start();}catch(e){log('gameplay start failed',e);}}
  function gameplayStop(){try{if(ysdk?.features?.GameplayAPI?.stop)ysdk.features.GameplayAPI.stop();}catch(e){log('gameplay stop failed',e);}}
  function snapshot(){const out={};try{const s=localStorage.getItem(SAVE_KEY);if(s)out.gameSave=JSON.parse(s);}catch(e){}try{const h=localStorage.getItem(HEALTH_KEY);if(h)out.healthSave=JSON.parse(h);}catch(e){}return Object.keys(out).length?out:null;}
  function queueCloudSave(flush){if(!player||!cloudReady)return;const data=snapshot();if(!data)return;pendingData=data;clearTimeout(saveTimer);if(flush)flushCloudSave(true);else saveTimer=setTimeout(()=>flushCloudSave(false),2000);}
  function flushCloudSave(force){clearTimeout(saveTimer);saveTimer=null;if(!player||!cloudReady||!pendingData)return;const data=pendingData;pendingData=null;player.setData(data,!!force).catch(function(err){pendingData=data;log('cloud save failed',err);});}
  function saveTime(obj){if(!obj||typeof obj!=='object')return 0;const t=Number(obj.saveUpdatedAt);return Number.isFinite(t)&&t>0?t:Number(obj.lastEnergyTime)||0;}
  async function clearCloudData(){
    if(!player||!cloudReady)return false;
    clearTimeout(saveTimer);saveTimer=null;pendingData=null;
    try{await player.setData({},true);await player.setStats({},true);return true;}
    catch(e){log('cloud reset failed',e);return false;}
  }
  async function init(){
    if(!window.YaGames){log('SDK loader unavailable; local save remains active.');return;}
    try{
      ysdk=await window.YaGames.init();window.ysdk=ysdk;
      try{player=await ysdk.getPlayer();}catch(e){log('player init failed',e);}
      if(player){
        try{
          const cloud=await player.getData(['gameSave','healthSave']);
          const localGameRaw=localStorage.getItem(SAVE_KEY),localHealthRaw=localStorage.getItem(HEALTH_KEY);
          let useCloudGame=false,useCloudHealth=false;
          if(cloud?.gameSave){if(!localGameRaw)useCloudGame=true;else{try{useCloudGame=saveTime(cloud.gameSave)>saveTime(JSON.parse(localGameRaw));}catch(e){useCloudGame=true;}}}
          if(cloud?.healthSave){if(!localHealthRaw)useCloudHealth=true;else{try{useCloudHealth=Number(cloud.healthSave.updatedAt||0)>Number(JSON.parse(localHealthRaw).updatedAt||0);}catch(e){useCloudHealth=true;}}}
          if(useCloudGame)localStorage.setItem(SAVE_KEY,JSON.stringify(cloud.gameSave));
          if(useCloudHealth)localStorage.setItem(HEALTH_KEY,JSON.stringify(cloud.healthSave));
          cloudReady=true;queueCloudSave(false);
        }catch(e){log('cloud load failed',e);}
      }
      if(ysdk.on){ysdk.on('game_api_pause',function(){gameplayStop();flushCloudSave(true);});ysdk.on('game_api_resume',function(){gameplayStart();});}
      gameplayStart();log('initialized');
    }catch(e){log('init failed',e);}
  }
  window.YandexGameReady=init();
  const nativeSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){const result=nativeSetItem.call(this,key,value);if(key===SAVE_KEY||key===HEALTH_KEY)queueCloudSave(false);return result;};
  window.showRewardedAd=function(onReward){
    if(adBusy||!ysdk?.adv||typeof ysdk.adv.showRewardedVideo!=='function'){if(!adBusy&&typeof onReward==='function')onReward(false);return false;}
    adBusy=true;gameplayStop();let finished=false;
    const reward=function(ok){if(finished)return;finished=true;if(typeof onReward==='function')onReward(ok!==false);};
    const done=function(){if(!adBusy)return;adBusy=false;gameplayStart();};
    try{ysdk.adv.showRewardedVideo({callbacks:{onRewarded:function(){reward(true);},onClose:done,onError:function(err){reward(false);done();log('rewarded ad error',err);}}});return true;}
    catch(e){reward(false);done();log('rewarded ad call failed',e);return false;}
  };
  window.YandexGameBridge={getSDK:function(){return ysdk;},flushSave:function(){flushCloudSave(true);},resetCloudData:clearCloudData,showFullscreenAd:function(){
    if(adBusy||!ysdk?.adv||typeof ysdk.adv.showFullscreenAdv!=='function')return false;
    adBusy=true;gameplayStop();const done=function(){if(!adBusy)return;adBusy=false;gameplayStart();};
    try{ysdk.adv.showFullscreenAdv({callbacks:{onClose:done,onError:done}});return true;}catch(e){done();return false;}
  }};
  window.addEventListener('pagehide',function(){flushCloudSave(true);});window.addEventListener('beforeunload',function(){flushCloudSave(true);});
})();