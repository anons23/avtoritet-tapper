'use strict';
(function(){
  const SAVE_KEY='avtoritet_save_v2';
  const HEALTH_KEY='avtoritet_health_v3';
  let ysdk=null,player=null,pendingData=null,saveTimer=null,cloudReady=false,adBusy=false,adSessionId=0;
  let lastLocalSnapshot='';
  function log(){if(window.console&&console.debug)console.debug.apply(console,['[Yandex SDK]'].concat([].slice.call(arguments)));}
  function gameplayStart(){try{if(ysdk?.features?.GameplayAPI?.start)ysdk.features.GameplayAPI.start();}catch(e){log('gameplay start failed',e);}}
  function gameplayStop(){try{if(ysdk?.features?.GameplayAPI?.stop)ysdk.features.GameplayAPI.stop();}catch(e){log('gameplay stop failed',e);}}
  function snapshot(){const out={};try{const s=localStorage.getItem(SAVE_KEY);if(s)out.gameSave=JSON.parse(s);}catch(e){}try{const h=localStorage.getItem(HEALTH_KEY);if(h)out.healthSave=JSON.parse(h);}catch(e){}return Object.keys(out).length?out:null;}
  function snapshotKey(data){try{return JSON.stringify(data||null)}catch(e){return ''}}
  function queueCloudSave(flush){if(!player||!cloudReady||window.__AVT_RESET_LOCK)return;const data=snapshot();if(!data)return;pendingData=data;lastLocalSnapshot=localSnapshotKey();clearTimeout(saveTimer);if(flush)flushCloudSave(true);else saveTimer=setTimeout(()=>flushCloudSave(false),5000);}
  function flushCloudSave(force){clearTimeout(saveTimer);saveTimer=null;if(!player||!cloudReady||!pendingData||window.__AVT_RESET_LOCK)return;const data=pendingData;pendingData=null;player.setData(data,!!force).catch(function(err){pendingData=data;log('cloud save failed',err);});}
  function localSnapshotKey(){
    try{
      return [
        localStorage.getItem(SAVE_KEY)||'',
        localStorage.getItem(HEALTH_KEY)||''
      ].join('\\0');
    }catch(e){
      return '';
    }
  }

  function pollLocalChanges(){
    if(!cloudReady||!player||window.__AVT_RESET_LOCK)return;
    const key=localSnapshotKey();
    if(key&&key!==lastLocalSnapshot)queueCloudSave(false);
  }
  function saveTime(obj){if(!obj||typeof obj!=='object')return 0;const t=Number(obj.saveUpdatedAt);return Number.isFinite(t)&&t>0?t:Number(obj.lastEnergyTime)||0;}
  function backupConflict(name,value){
    try{
      if(value)localStorage.setItem(name,value);
    }catch(e){}
  }
async function clearCloudData(){
    if(!player||!cloudReady)return false;
    clearTimeout(saveTimer);saveTimer=null;pendingData=null;
    try{await player.setData({},true);await player.setStats({},true);return true;}
    catch(e){log('cloud reset failed',e);return false;}
  }
  async function init(){
    /* Sync: honor force-fresh before any cloud read */
    try{
      if(sessionStorage.getItem('avt_force_fresh')==='1'||sessionStorage.getItem('avt_skip_cloud_once')==='1'){
        window.__AVT_RESET_LOCK=true;
        try{['avtoritet_save_v2','avtoritet_save_v2_backup','avtoritet_health_v3'].forEach(function(k){localStorage.removeItem(k);});}catch(e){}
      }
    }catch(e){}
    if(!window.YaGames){log('SDK loader unavailable; local save remains active.');return;}
    try{
      ysdk=await window.YaGames.init();window.ysdk=ysdk;
      try{player=await ysdk.getPlayer();}catch(e){log('player init failed',e);}
      if(player){
        cloudReady=true;
        try{
          let skipCloud=false;
          try{
            skipCloud=sessionStorage.getItem('avt_skip_cloud_once')==='1'||sessionStorage.getItem('avt_force_fresh')==='1';
            if(skipCloud){
              sessionStorage.removeItem('avt_skip_cloud_once');
              sessionStorage.removeItem('avt_force_fresh');
            }
          }catch(e){}
          if(skipCloud){
            log('skip cloud restore (force fresh reset)');
            try{await player.setData({},true);await player.setStats({},true);}catch(e){log('post-reset cloud wipe failed',e);}
            lastLocalSnapshot=localSnapshotKey();
            throw new Error('skip-cloud-restore');
          }
          const cloud=await player.getData(['gameSave','healthSave']);
          const localGameRaw=localStorage.getItem(SAVE_KEY),localHealthRaw=localStorage.getItem(HEALTH_KEY);
          let useCloudGame=false,useCloudHealth=false;
          if(cloud?.gameSave){if(!localGameRaw)useCloudGame=true;else{try{useCloudGame=saveTime(cloud.gameSave)>saveTime(JSON.parse(localGameRaw));}catch(e){useCloudGame=true;}}}
          if(cloud?.healthSave){if(!localHealthRaw)useCloudHealth=true;else{try{useCloudHealth=Number(cloud.healthSave.updatedAt||0)>Number(JSON.parse(localHealthRaw).updatedAt||0);}catch(e){useCloudHealth=true;}}}
          if(cloud?.gameSave&&localGameRaw){
            const cloudRaw=JSON.stringify(cloud.gameSave);
            if(saveTime(cloud.gameSave)!==saveTime(JSON.parse(localGameRaw))){
              backupConflict('avtoritet_save_conflict_local_v1',localGameRaw);
              backupConflict('avtoritet_save_conflict_cloud_v1',cloudRaw);
            }
          }
          if(useCloudGame)localStorage.setItem(SAVE_KEY,JSON.stringify(cloud.gameSave));
          if(useCloudHealth&&localHealthRaw){
            const cloudRaw=JSON.stringify(cloud.healthSave);
            if(Number(cloud.healthSave.updatedAt||0)!==Number(JSON.parse(localHealthRaw).updatedAt||0)){
              backupConflict('avtoritet_health_conflict_local_v1',localHealthRaw);
              backupConflict('avtoritet_health_conflict_cloud_v1',cloudRaw);
            }
          }
          if(useCloudHealth)localStorage.setItem(HEALTH_KEY,JSON.stringify(cloud.healthSave));
        }catch(e){log('cloud load failed; local save will continue and cloud writes remain enabled',e);}
        if(!window.__AVT_RESET_LOCK)queueCloudSave(false);
      }
      if(ysdk.on){ysdk.on('game_api_pause',function(){gameplayStop();flushCloudSave(true);});ysdk.on('game_api_resume',function(){gameplayStart();});}
      gameplayStart();log('initialized');
    }catch(e){log('init failed',e);}
  }
  window.YandexGameReady=init();
  window.YandexGameBridge={getSDK:function(){return ysdk;},queueSave:function(){queueCloudSave(false);},flushSave:function(){queueCloudSave(true);},resetCloudData:clearCloudData,showFullscreenAd:function(){
    if(adBusy||!ysdk?.adv||typeof ysdk.adv.showFullscreenAdv!=='function')return false;
    adBusy=true;
    const sessionId=++adSessionId;
    gameplayStop();
    const done=function(){
      if(sessionId!==adSessionId)return;
      if(!adBusy)return;
      adBusy=false;
      gameplayStart();
    };
    try{ysdk.adv.showFullscreenAdv({callbacks:{onClose:done,onError:done}});return true;}catch(e){done();return false;}
  }};
  window.showRewardedAd=function(onReward){
    if(adBusy||!ysdk?.adv||typeof ysdk.adv.showRewardedVideo!=='function'){
      if(!adBusy&&typeof onReward==='function')onReward(false);
      return false;
    }

    adBusy=true;
    const sessionId=++adSessionId;
    gameplayStop();

    let active=true;
    let rewarded=false;
    let callbackSent=false;
    let watchdog=null;

    const notify=function(ok){
      if(callbackSent)return;
      callbackSent=true;
      if(typeof onReward==='function')onReward(ok===true);
    };

    const cleanup=function(){
      if(!active)return;
      active=false;
      if(watchdog){clearTimeout(watchdog);watchdog=null;}
      if(sessionId!==adSessionId)return;
      adBusy=false;
      gameplayStart();
    };

    const finishWithoutReward=function(){
      notify(false);
      cleanup();
    };

    const handleRewarded=function(){
      if(sessionId!==adSessionId||!active)return;
      rewarded=true;
      notify(true);
      log('rewarded ad reward granted');
    };

    const handleClose=function(wasShown){
      if(sessionId!==adSessionId)return;
      if(!rewarded)notify(false);
      cleanup();
      log('rewarded ad closed',wasShown);
    };

    const handleError=function(err){
      if(sessionId!==adSessionId)return;
      if(!rewarded)notify(false);
      cleanup();
      log('rewarded ad error',err);
    };

    watchdog=setTimeout(function(){
      if(sessionId!==adSessionId||!active)return;
      notify(false);
      cleanup();
      log('rewarded ad watchdog timeout');
    },120000);

    try{
      ysdk.adv.showRewardedVideo({
        callbacks:{
          onRewarded:handleRewarded,
          onClose:handleClose,
          onError:handleError
        }
      });
      return true;
    }catch(e){
      finishWithoutReward();
      log('rewarded ad call failed',e);
      return false;
    }
  };
  const pollTimer=setInterval(pollLocalChanges,2000);
  window.addEventListener('pagehide',function(){clearInterval(pollTimer);if(!window.__AVT_RESET_LOCK)flushCloudSave(true);});
  window.addEventListener('beforeunload',function(){if(!window.__AVT_RESET_LOCK)flushCloudSave(true);});
})();
