/* npc-rumors v1.4 — слух не про того, кто рассказывает */
'use strict';
(function(){
  var KEY='npcRumors';
  var currentNpcId=null;

  var NPC_NAMES={
    shaiba:['шайба','шайбы','шайбе','шайбой'],
    bugor:['бугор','бугра','бугру','бугром'],
    kosoy:['косой','косого','косому','косым'],
    smotryashiy:['смотрящий','смотрящего','смотрящему','смотрящим'],
    avtoritet:['авторитет','авторитета','авторитету','авторитетом']
  };

  var FLAVOR=[
    'Вчера, говорят, нашего кума-надзирателя овчарка цапнула за штанину. 🤣 Теперь он на всех орёт вдвойне.',
    'На кухне снова «случайно» перепутали соль с стиральным порошком. Кто-то сегодня ужинает стоя.',
    'Говорят, в ночной смене радио ловило шансон сквозь решётку. Даже надзиратель ногой в такт бил.',
    'Один салага пытался пронести конфеты в подшиве. Конфеты нашли. Подшиву тоже. Салагу — в карцер на разговор.',
    'В душевой якобы видели таракана размером с напёрсток. Три мужика одновременно «внезапно закончили мыться».',
    'Кум обещал «проверку на честность». Честными остались только те, кто спал.',
    'Кто-то подписал на стене «здесь был Вася». Васю нашли. Стену покрасили. Васю — нет.',
    'Передают: на прогулке ворона утянула у надзирателя фуражку. Ворону теперь уважают больше кума.',
    'В бараке спорили, что крепче — чай или чефир. Победил тот, кто не пил и молча забрал оба стакана.',
    'Говорят, крыса в кладовке организовала свой «общак». Люди завидуют.',
    'Ночью кто-то пел «Владимирский централ». Соседи просили на бис. Надзиратель — наоборот.',
    'На столе в общей оставили записку «верните кружку». Кружку вернули. Записку забрали на память.',
    'Говорят, в бане поспорили, кто дольше выдержит пар. Выиграл тот, кто просто не заходил.'
  ];

  /* about = про кого слух (id NPC). Рассказчик не должен совпадать с about */
  var ABOUT_NPC=[
    /* Шайба */
    {about:'shaiba',minPoints:0,text:'По бараку шепчутся: Шайба снова собирает, кто кого обсуждает и что за обмен в третьей хате.'},
    {about:'shaiba',minPoints:0,text:'Говорят, Шайба за чефир рассказывает, кто сейчас «мутит воду». Обычный его базар.'},
    {about:'shaiba',minPoints:0,text:'Шайба якобы вынюхивает, кто набирает влияние. Любит знать расклад раньше всех.'},
    {about:'shaiba',minPoints:0,text:'Передают: у Шайбы снова разговор про кладовку — кому что «светнуло».'},
    {about:'shaiba',minPoints:0,text:'Шайба просил кого-то тихо провести вещь до нужного человека. Его стиль — без шума.'},
    {about:'shaiba',minPoints:0,text:'В хате шушукаются: Шайбе нужно имя из третьей хаты. Кто принесёт — будет в плюсе.'},
    {about:'shaiba',minPoints:0,text:'Шайба хвастался, что выиграл в карты три чайных пакета. К утру пакетов не было — зато синяк есть.'},

    /* Бугор */
    {about:'bugor',minPoints:1500,text:'Вчера в качалке Бугор чуть не сцепился с другим зэком. У него вечно то тренировка, то «разговор».'},
    {about:'bugor',minPoints:1500,text:'Передают, Бугор снова ищет, кто прикроет его на стрелке. Без своего человека не идёт.'},
    {about:'bugor',minPoints:1500,text:'Говорят, Бугор после качалки раздаёт советы — и смотрит, кто слушает.'},
    {about:'bugor',minPoints:1500,text:'В зале шепчутся: у Бугра намечается кипеш. Ищет надёжного на подстраховку.'},
    {about:'bugor',minPoints:1500,text:'Бугор якобы просил кого-то подержать схрон «на часок». Обычная его просьба.'},
    {about:'bugor',minPoints:1500,text:'Слышал: Бугор недоволен, что его на стрелке кинули. Теперь выбирает людей осторожнее.'},
    {about:'bugor',minPoints:1500,text:'Бугор вчера в качалке подрался с другим зэком — глядишь, у него намечается серьёзный разбор.'},

    /* Косой */
    {about:'kosoy',minPoints:5000,text:'Косой вчера наводку кому-то скинул. Любит знать, кто куда ходит.'},
    {about:'kosoy',minPoints:5000,text:'Передают: Косой ищет, кто поможет «прогнать» слух по бараку без лишнего шума.'},
    {about:'kosoy',minPoints:5000,text:'Говорят, Косой снова торгуется информацией — кому что выгодно услышать.'},
    {about:'kosoy',minPoints:5000,text:'У Косого якобы есть вопрос про одного человека из соседней хаты. Ищет язык.'},
    {about:'kosoy',minPoints:5000,text:'Косой шепчет, что скоро «движение» — и смотрит, кто рядом стоит.'},
    {about:'kosoy',minPoints:5000,text:'Слышал: Косой обижается на тех, кто кидает на стрелке. Долго помнит.'},
    {about:'kosoy',minPoints:5000,text:'Косой вчера кому-то скинул наводку — обычный его промысел.'},

    /* Смотрящий */
    {about:'smotryashiy',minPoints:15000,text:'Смотрящий снова раздаёт поручения по бараку — кому порядок, кому «поговорить».'},
    {about:'smotryashiy',minPoints:15000,text:'Говорят, Смотрящий ищет, кто спрячет схрон на время. Доверяет только ровным.'},
    {about:'smotryashiy',minPoints:15000,text:'Передают: Смотрящий недоволен шумом после отбоя. Будет разбор.'},
    {about:'smotryashiy',minPoints:15000,text:'У Смотрящего якобы есть дело — провести вещь без глаз кума.'},
    {about:'smotryashiy',minPoints:15000,text:'Смотрящий хвалил одного пацана за помощь Бугру. Теперь к нему очередь с просьбами.'},
    {about:'smotryashiy',minPoints:15000,text:'Слышал: Смотрящий проверяет, кто держит слово. Лишним словам не рад.'},
    {about:'smotryashiy',minPoints:15000,text:'Смотрящий просил кого-то на время присмотреть за порядком в хате.'},

    /* Авторитет */
    {about:'avtoritet',minPoints:40000,text:'Авторитет снова разбирает чужие споры — очередь на «решение» не кончается.'},
    {about:'avtoritet',minPoints:40000,text:'Говорят, Авторитет смотрит, кто держит марку в стычках. Слабых запоминает.'},
    {about:'avtoritet',minPoints:40000,text:'Передают: у Авторитета сегодня несколько дел барака подряд.'},
    {about:'avtoritet',minPoints:40000,text:'Авторитет якобы недоволен, что кто-то лезет без спроса. Будет разговор.'},
    {about:'avtoritet',minPoints:40000,text:'Слышал: Авторитет ищет, кто может прикрыть спину на серьёзном разговоре.'},
    {about:'avtoritet',minPoints:40000,text:'В хате шепчутся: Авторитет сегодня жёстко закрыл одно дело. Другие притихли.'},
    {about:'avtoritet',minPoints:40000,text:'Авторитет снова вызвал двоих «на ковёр» — спор из-за места не утих.'}
  ];

  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }

  function store(s){
    if(!s)return null;
    if(!s[KEY]||typeof s[KEY]!=='object') s[KEY]={lastFlavor:-1,lastAbout:-1};
    return s[KEY];
  }

  function points(){
    var s=st();
    return Number(s&&s.points)||0;
  }

  function isRumorClick(text){
    var t=String(text||'').toLowerCase();
    return /слух|наводк|кладовк|мутит|влияние|заплатить.*🍵|дать .*🍵|точное имя|рискнуть|расспросить|спросить напрям|кто мутит|свежий слух|редкого слуха|за слух/.test(t);
  }
  function isRefuse(text){
    return /отказ|не лезть|уйти|всё равно|сменить тему|не сейчас|неинтерес/.test(String(text||'').toLowerCase());
  }

  function detectSpeakerFromDom(){
    if(currentNpcId) return currentNpcId;
    var content=document.getElementById('modal-content');
    if(!content) return null;
    var html=(content.textContent||'').toLowerCase();
    var order=['smotryashiy','avtoritet','bugor','kosoy','shaiba']; // длинные имена раньше
    for(var i=0;i<order.length;i++){
      var id=order[i];
      var forms=NPC_NAMES[id]||[];
      for(var j=0;j<forms.length;j++){
        if(html.indexOf(forms[j])>=0) return id;
      }
    }
    return null;
  }

  function mentionsNpc(text, npcId){
    if(!npcId||!text) return false;
    var forms=NPC_NAMES[npcId]||[];
    var low=String(text).toLowerCase();
    for(var i=0;i<forms.length;i++){
      if(low.indexOf(forms[i])>=0) return true;
    }
    return false;
  }

  function pickText(){
    var s=st();
    var rs=store(s);
    var pts=points();
    var speaker=detectSpeakerFromDom();

    // 55% — слух про другого NPC (не про рассказчика)
    if(Math.random()<0.55){
      var about=ABOUT_NPC.filter(function(a){
        if(pts<Number(a.minPoints||0)) return false;
        if(speaker && a.about===speaker) return false;
        return true;
      });
      if(about.length){
        var i=Math.floor(Math.random()*about.length);
        if(rs&&typeof rs.lastAbout==='number'&&about.length>1&&i===rs.lastAbout) i=(i+1)%about.length;
        if(rs) rs.lastAbout=i;
        save();
        return '📢 Слух: '+about[i].text;
      }
    }

    // шутки — тоже без упоминания рассказчика
    var flavors=FLAVOR.filter(function(t){ return !mentionsNpc(t, speaker); });
    if(!flavors.length) flavors=FLAVOR.slice();
    var fi=Math.floor(Math.random()*flavors.length);
    if(rs&&typeof rs.lastFlavor==='number'&&flavors.length>1&&fi===rs.lastFlavor) fi=(fi+1)%flavors.length;
    if(rs) rs.lastFlavor=fi;
    save();
    return '📢 Слух: '+flavors[fi];
  }

  function onRumorChoice(btn){
    var text=btn.textContent||'';
    if(!isRumorClick(text)||isRefuse(text))return;
    var rumor=pickText();
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      var p=document.querySelector('.npc-dialogue-response p');
      if(p){
        clearInterval(timer);
        var base=p.textContent||'';
        if(/слух|наводк|шепч|рассказ/i.test(base)||base.length<80) p.textContent=rumor;
        else p.textContent=base+'\n\n'+rumor;
        p.style.whiteSpace='pre-wrap';
      }else if(tries>25) clearInterval(timer);
    },40);
  }

  function boot(){
    document.addEventListener('click',function(e){
      var link=e.target&&e.target.closest&&e.target.closest('.npc-link[data-npc]');
      if(link){
        currentNpcId=link.getAttribute('data-npc')||null;
        return;
      }
      var btn=e.target&&e.target.closest&&e.target.closest('.npc-choice');
      if(!btn)return;
      onRumorChoice(btn);
    },true);
    console.log('[npc-rumors] v1.4 no self-rumors, about',ABOUT_NPC.length);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
