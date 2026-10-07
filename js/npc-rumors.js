/* npc-rumors v1.2 — только текст слуха (шутка или про задания NPC), без шансов и автоквестов */
'use strict';
(function(){
  var KEY='npcRumors';

  /* Атмосферные / шуточные */
  var FLAVOR=[
    'Вчера, говорят, нашего кума-надзирателя овчарка цапнула за штанину. 🤣 Теперь он на всех орёт вдвойне.',
    'На кухне снова «случайно» перепутали соль с стиральным порошком. Кто-то сегодня ужинает стоя.',
    'Шайба хвастался, что выиграл в карты три чайных пакета. К утру пакетов не было — зато синяк есть.',
    'Говорят, в ночной смене радио ловило шансон сквозь решётку. Даже надзиратель ногой в такт бил.',
    'Один салага пытался пронести конфеты в подшиве. Конфеты нашли. Подшиву тоже. Салагу — в карцер на разговор.',
    'В душевой якобы видели таракана размером с напёрсток. Три мужика одновременно «внезапно закончили мыться».',
    'Кум обещал «проверку на честность». Честными остались только те, кто спал.',
    'Кто-то подписал на стене «здесь был Вася». Васю нашли. Стену покрасили. Васю — нет.',
    'Передают: на прогулке ворона утянула у надзирателя фуражку. Ворону теперь уважают больше кума.',
    'В бараке спорили, что крепче — чай или чефир. Победил тот, кто не пил и молча забрал оба стакана.',
    'Говорят, крыса в кладовке организовала свой «общак». Люди завидуют.',
    'Ночью кто-то пел «Владимирский централ». Соседи просили на бис. Надзиратель — наоборот.'
  ];

  /* Текст про дела NPC — только по смыслу их обычных заданий, без запуска квеста */
  var ABOUT_NPC=[
    {minPoints:0, text:'По бараку шепчутся: Шайба снова собирает слухи — кто кого обсуждает и что за обмен в третьей хате.'},
    {minPoints:0, text:'Говорят, Шайба за чефир рассказывает, кто сейчас «мутит воду». Обычный его базар.'},
    {minPoints:1500, text:'Вчера в качалке Бугор чуть не сцепился с другим зэком. У него вечно то тренировка, то «разговор».'},
    {minPoints:1500, text:'Передают, Бугор снова ищет, кто придержит вещь до утра. Типичные его просьбы.'},
    {minPoints:1500, text:'Бугор якобы проверял технику на напарнике. Кто вписывается — тот и качается.'},
    {minPoints:5000, text:'Косой якобы ищет пару на тихую сделку: наводка за наводку, без лишнего шума.'},
    {minPoints:5000, text:'Говорят, у Косого снова свежая информация — но просто так он рот не откроет.'},
    {minPoints:15000, text:'В бараке спор: двое готовы сцепиться. Смотрящий обычно таких тихо разводит.'},
    {minPoints:15000, text:'Шепчутся, Смотрящий просил передать сообщение тому, кому сам не доверяет. Его стиль.'},
    {minPoints:50000, text:'Авторитету, говорят, нужен не слух, а факт. Пустая болтовня ему не заходит.'},
    {minPoints:50000, text:'По зоне: Авторитет запоминает, кто слово держит. Обычное его правило.'}
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

  function pickText(){
    var s=st();
    var rs=store(s);
    var pts=points();

    // ~50/50: шутка или слух «про дела» открытого по масти NPC
    if(Math.random()<0.5){
      var about=ABOUT_NPC.filter(function(a){ return pts>=Number(a.minPoints||0); });
      if(about.length){
        var i=Math.floor(Math.random()*about.length);
        if(rs&&typeof rs.lastAbout==='number'&&about.length>1&&i===rs.lastAbout) i=(i+1)%about.length;
        if(rs) rs.lastAbout=i;
        save();
        return '📢 Слух: '+about[i].text;
      }
    }

    var fi=Math.floor(Math.random()*FLAVOR.length);
    if(rs&&typeof rs.lastFlavor==='number'&&FLAVOR.length>1&&fi===rs.lastFlavor) fi=(fi+1)%FLAVOR.length;
    if(rs) rs.lastFlavor=fi;
    save();
    return '📢 Слух: '+FLAVOR[fi];
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
      var btn=e.target&&e.target.closest&&e.target.closest('.npc-choice');
      if(!btn)return;
      onRumorChoice(btn);
    },true);
    console.log('[npc-rumors] v1.2 text-only');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
