'use strict';
(function(){
  /*
   * Единый ресурс игры: Чефир.
   *
   * Внутреннее имя cigarettes оставлено только как legacy-совместимость со
   * старыми сохранениями и существующей логикой. В localStorage новый формат
   * хранит chifir/confiscatedChifir, поэтому старые сохранения не теряют прогресс.
   */
  const SAVE_KEY='avtoritet_save_v2';
  const originalGet=Storage.prototype.getItem;
  const originalSet=Storage.prototype.setItem;

  function number(v){
    const n=Number(v);
    return Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
  }

  function normalizeForRuntime(value){
    if(typeof value!=='string')return value;
    try{
      const data=JSON.parse(value);
      if(!data||typeof data!=='object'||Array.isArray(data))return value;
      if(!Object.prototype.hasOwnProperty.call(data,'chifir')){
        data.chifir=number(data.cigarettes);
      }
      if(!Object.prototype.hasOwnProperty.call(data,'confiscatedChifir')){
        data.confiscatedChifir=number(data.confiscatedCigarettes);
      }
      /* Legacy aliases are supplied only in memory so old game modules keep working. */
      data.cigarettes=number(data.chifir);
      data.confiscatedCigarettes=number(data.confiscatedChifir);
      return JSON.stringify(data);
    }catch(e){return value}
  }

  function normalizeForStorage(value){
    if(typeof value!=='string')return value;
    try{
      const data=JSON.parse(value);
      if(!data||typeof data!=='object'||Array.isArray(data))return value;
      const chifir=Object.prototype.hasOwnProperty.call(data,'chifir')
        ?number(data.chifir)
        :number(data.cigarettes);
      const confiscated=Object.prototype.hasOwnProperty.call(data,'confiscatedChifir')
        ?number(data.confiscatedChifir)
        :number(data.confiscatedCigarettes);
      data.chifir=chifir;
      data.confiscatedChifir=confiscated;
      delete data.cigarettes;
      delete data.confiscatedCigarettes;
      return JSON.stringify(data);
    }catch(e){return value}
  }

  Storage.prototype.getItem=function(key){
    const value=originalGet.call(this,key);
    if(key===SAVE_KEY)return normalizeForRuntime(value);
    return value;
  };

  Storage.prototype.setItem=function(key,value){
    if(key===SAVE_KEY)value=normalizeForStorage(String(value));
    return originalSet.call(this,key,value);
  };

  const replacements=[
    [/🚬/gu,'🍵'],
    [/Спрятать папиросы/gu,'Спрятать запрещёнку'],
    [/папиросы/gu,'запрещёнку'],
    [/папирос/gu,'запрещёнки'],
    [/Конфискованные сигареты возвращены/gu,'Запасы чефира возвращены'],
    [/Все сигареты временно изъяты/gu,'Весь чефир временно изъят'],
    [/сигаретами/gu,'чефиром'],
    [/сигарет/gu,'чефира'],
    [/сигареты/gu,'чефир'],
    [/сигарету/gu,'чефир'],
    [/сигарета/gu,'чефир'],
    [/Не хватает сигарет/gu,'Не хватает чефира'],
    [/Купить за ([0-9.,]+(?:K|M)?)[ ]*🍵/gu,'Купить за $1 🍵']
  ];

  function cleanText(value){
    let text=String(value??'');
    replacements.forEach(([pattern,replacement])=>{text=text.replace(pattern,replacement)});
    return text;
  }

  function cleanNode(node){
    if(!node||node.nodeType!==Node.TEXT_NODE)return;
    const old=node.nodeValue||'';
    const next=cleanText(old);
    if(next!==old)node.nodeValue=next;
  }

  function cleanTree(root){
    if(!root)return;
    if(root.nodeType===Node.TEXT_NODE){cleanNode(root);return}
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(cleanNode);
  }

  function installGameAlias(){
    if(typeof window.getGameState!=='function')return;
    const state=window.getGameState();
    if(!state||typeof state!=='object'||state.__chifirAliasInstalled)return;
    try{
      if(!Object.prototype.hasOwnProperty.call(state,'chifir')){
        Object.defineProperty(state,'chifir',{
          configurable:true,
          enumerable:false,
          get(){return number(state.cigarettes)},
          set(value){state.cigarettes=number(value)}
        });
      }
      if(!Object.prototype.hasOwnProperty.call(state,'confiscatedChifir')){
        Object.defineProperty(state,'confiscatedChifir',{
          configurable:true,
          enumerable:false,
          get(){return number(state.confiscatedCigarettes)},
          set(value){state.confiscatedCigarettes=number(value)}
        });
      }
      Object.defineProperty(state,'__chifirAliasInstalled',{value:true,enumerable:false});
    }catch(e){}
  }

  function install(){
    cleanTree(document.body);
    installGameAlias();
    if(typeof window.msg==='function'&&!window.__chifirMsgWrapped){
      const originalMsg=window.msg;
      window.msg=function(text){return originalMsg(cleanText(text))};
      window.__chifirMsgWrapped=true;
    }
  }

  const observer=new MutationObserver(mutations=>{
    mutations.forEach(m=>m.addedNodes&&m.addedNodes.forEach(cleanTree));
    installGameAlias();
  });

  function start(){
    if(document.body)observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    install();
    window.setInterval(install,250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
