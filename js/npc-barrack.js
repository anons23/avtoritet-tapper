/* npc-barrack v2.5 — список персонажей барака + диалоги */
'use strict';
(function(){
  var AV='./assets/backgrounds/';
  var NPCS=[
    {id:'shaiba',unlockPoints:0,name:'Шайба',role:'Сокамерник',icon:'🪙',avatar:AV+'shaiba_avatar.webp',
      greet:'Шайба кивает: «Ну что, по делу или просто так зашёл?»',
      dialogs:[
        {q:'Шайба понижает голос: «В бараке сегодня неспокойно. Что хочешь узнать?»',choices:[
          {t:'Спросить, кто мутит воду',ok:.65,pts:20,msg:'Шайба шепчет имя и добавляет: «Только меня не сдавай.»'},
          {t:'Дать 30 🍵 за свежий слух',ok:.75,chifir:-30,pts:45,msg:'Шайба берёт чефир и рассказывает свежий слух. Получаешь 45 ⭐.'},
          {t:'Сказать, что тебе всё равно',ok:1,msg:'Шайба усмехается: «Вот и правильно. Лишние вопросы иногда дорого стоят.»'}
        ]},
        {q:'Шайба ухмыляется: «Есть разговор про одну вещь из кладовки. Интересно?»',choices:[
          {t:'Расспросить про кладовку',ok:.55,pts:30,msg:'Шайба делится полезной наводкой. Теперь ты знаешь, где искать.'},
          {t:'Заплатить 30 🍵 за подробности',ok:.7,chifir:-30,pts:55,msg:'Шайба рассказывает подробности. Слух оказался правдой.'},
          {t:'Не лезть в чужие дела',ok:1,msg:'Шайба одобрительно кивает: «Умный ход.»'}
        ]},
        {q:'Шайба: «Хочешь узнать, кто сейчас набирает влияние?»',choices:[
          {t:'Назвать того, кого подозреваешь',ok:.7,pts:25,msg:'Шайба подтверждает догадку и добавляет пару деталей.'},
          {t:'30 🍵 за точное имя',ok:.65,chifir:-30,pts:70,msg:'За чефир Шайба выдаёт имя и важную деталь.'},
          {t:'Сменить тему',ok:1,msg:'Шайба: «И правильно. Сегодня язык лучше держать за зубами.»'}
        ]},
        {q:'Шайба смеётся: «Последний слух на сегодня. Проверишь удачу?»',choices:[
          {t:'Спросить напрямую',ok:.5,pts:35,msg:'Слух оказывается правдой. Неплохая удача.'},
          {t:'Заплатить 30 🍵 и рискнуть',ok:.6,chifir:-30,pts:90,msg:'Шайба рассказывает редкий слух. За любопытство ты получил хорошую награду.'},
          {t:'Отказаться',ok:1,msg:'Шайба пожимает плечами: «Тоже вариант.»'}
        ]}
      ]},
    {id:'bugor',unlockPoints:1500,name:'Бугор',role:'Тренер',icon:'💪',avatar:AV+'Bugor_avatar.webp',
      greet:'Бугор хрустит костяшками: «Готов поработать?»',
      dialogs:[
        {q:'Бугор: «Как думаешь, что важнее — сила или терпение?»',choices:[
          {t:'Сказать: сила',ok:.7,pts:25,msg:'Бугор кивает: «Сила нужна. Но без головы она бесполезна.» +25 ⭐.'},
          {t:'Спросить за 20 🍵',ok:.8,chifir:-20,pts:45,msg:'Бугор даёт совет и заставляет сделать несколько подходов. +45 ⭐.'},
          {t:'Сказать: терпение',ok:.9,pts:20,msg:'Бугор одобряет: «Вот это уже разговор.»'}
        ]},
        {q:'Бугор: «В зале народ спорит, кто самый крепкий. Хочешь проверить себя?»',choices:[
          {t:'Вызваться первым',ok:.6,pts:35,msg:'Ты выдерживаешь испытание. Бугор уважительно кивает. +25 ⭐.'},
          {t:'Заплатить 25 🍵 за тренировочный секрет',ok:.75,chifir:-25,pts:50,msg:'Бугор показывает секретный приём. +50 ⭐.'},
          {t:'Сказать, что сегодня без геройства',ok:1,msg:'Бугор усмехается: «Разумно. Завтра доберём.»'}
        ]},
        {q:'Бугор смотрит на тебя: «Нужен совет перед тяжёлым делом?»',choices:[
          {t:'Попросить короткий совет',ok:.75,pts:40,msg:'Бугор даёт простой, но полезный совет. +40 ⭐.'},
          {t:'20 🍵 за подробный совет',ok:.8,chifir:-20,pts:70,msg:'Бугор разбирает ситуацию по шагам. +70 ⭐.'},
          {t:'Отказаться',ok:1,msg:'Бугор: «Сам разберёшься — тоже навык.»'}
        ]},
        {q:'Бугор: «Последний вопрос. Пойдёшь на риск ради авторитета?»',choices:[
          {t:'Да, если риск оправдан',ok:.6,pts:50,msg:'Бугор хлопает по плечу: «Вот теперь понимаю.» +25 ⭐.'},
          {t:'30 🍵 за тренировку перед риском',ok:.7,chifir:-30,pts:80,msg:'Тренировка прошла жёстко. +80 ⭐.'},
          {t:'Нет, сначала подготовлюсь',ok:.95,pts:25,msg:'Бугор одобряет осторожность. «Подготовка тоже сила.»'}
        ]}
      ]},
    {id:'kosoy',unlockPoints:5000,name:'Косой',role:'Торговец слухами',icon:'👁',avatar:AV+'Kosoy_avatar.webp',
      greet:'Косой щурится: «Информация — товар. Что нужно?»',
      dialogs:[
        {q:'Косой: «Есть слух, который стоит тридцать чефира. Берёшь?»',choices:[
          {t:'Заплатить 30 🍵 за слух',ok:.65,chifir:-30,rewardChifir:45,pts:60,msg:'Косой шепчет: «Слух свежий. Проверяй сам.» Ты получил ценную наводку.'},
          {t:'Попробовать выведать бесплатно',ok:.35,pts:30,msg:'Косой неожиданно сдаётся и делится частью информации.'},
          {t:'Отказаться',ok:1,msg:'Косой пожимает плечами: «Дешевле любопытства ничего нет.»'}
        ]},
        {q:'Косой улыбается: «Хочешь узнать, кто получил редкую вещь?»',choices:[
          {t:'Спросить прямо',ok:.55,pts:35,msg:'Косой называет имя и примету вещи.'},
          {t:'Заплатить 30 🍵 за точный ответ',ok:.7,chifir:-30,pts:75,msg:'Косой выдаёт точную информацию. Сделка удалась.'},
          {t:'Сделать вид, что неинтересно',ok:1,msg:'Косой: «Вот это выдержка. Не каждый умеет остановиться.»'}
        ]},
        {q:'Косой: «За тридцать чефира могу рассказать, где сегодня лучше не появляться.»',choices:[
          {t:'Заплатить 30 🍵',ok:.5,chifir:-30,pts:80,msg:'Косой рассказывает опасное место. Хорошо, что спросил.'},
          {t:'Попросить намёк бесплатно',ok:.45,pts:25,msg:'Косой даёт небольшой намёк, но просит не распространяться.'},
          {t:'Сказать, что не боишься',ok:.7,msg:'Косой смеётся: «Смелость без информации долго не живёт.»'}
        ]},
        {q:'Косой прищуривается: «Последняя сделка. Готов рискнуть ради редкого слуха?»',choices:[
          {t:'30 🍵 и рискнуть',ok:.55,chifir:-30,rewardChifir:80,pts:100,msg:'Слух оказывается ценным. Ты сорвал хороший куш.'},
          {t:'Поторговаться',ok:.45,pts:40,msg:'Косой уступает часть информации. Неплохо для бесплатного разговора.'},
          {t:'Уйти',ok:1,msg:'Косой: «Возвращайся, когда любопытство победит осторожность.»'}
        ]}
      ]},
    {id:'smotryashiy',unlockPoints:15000,name:'Смотрящий',role:'Порядок в бараке',icon:'👁‍🗨',avatar:AV+'Smotraishia_avatar.webp',
      greet:'Смотрящий смотрит холодно: «Говори по делу.»',
      dialogs:[
        {q:'Смотрящий: «В бараке есть напряжение. Что будешь делать?»',choices:[
          {t:'Доложить обстановку',ok:.7,chifir:-10,pts:45,msg:'Смотрящий кивает: «Нормально доложил.» +45 ⭐.'},
          {t:'Заплатить 30 🍵 за совет',ok:.65,chifir:-30,pts:70,msg:'Смотрящий даёт совет, который поможет избежать проблем.'},
          {t:'Не вмешиваться',ok:.9,pts:15,msg:'Смотрящий: «Иногда молчание — правильный ответ.»'}
        ]},
        {q:'Смотрящий: «Хочешь, чтобы к тебе относились серьёзнее?»',choices:[
          {t:'Спросить, как заработать уважение',ok:.65,pts:60,msg:'Смотрящий объясняет, какой поступок здесь ценят.'},
          {t:'30 🍵 за личную рекомендацию',ok:.7,chifir:-30,pts:90,msg:'Смотрящий даёт конкретный совет. +90 ⭐.'},
          {t:'Сказать, что справишься сам',ok:.75,pts:25,msg:'Смотрящий: «Посмотрим.»'}
        ]},
        {q:'Смотрящий: «Есть одна проблема. Хочешь узнать детали?»',choices:[
          {t:'Выслушать',ok:.6,pts:50,msg:'Ты получаешь важную информацию о проблеме.'},
          {t:'Заплатить 40 🍵 за полную картину',ok:.65,chifir:-40,pts:110,msg:'Смотрящий раскрывает детали. Информация действительно стоила денег.'},
          {t:'Не лезть',ok:1,msg:'Смотрящий коротко кивает: «Мудро.»'}
        ]},
        {q:'Смотрящий: «Последний вопрос. Готов отвечать за свои слова?»',choices:[
          {t:'Да',ok:.75,pts:70,msg:'Смотрящий: «Тогда слова чего-то стоят.» +70 ⭐.'},
          {t:'30 🍵 за шанс узнать больше',ok:.55,chifir:-30,pts:120,msg:'Смотрящий делится редкой информацией. +120 ⭐.'},
          {t:'Промолчать',ok:.9,pts:20,msg:'Смотрящий принимает молчание за разумность.'}
        ]}
      ]},
    {id:'avtoritet',unlockPoints:50000,name:'Авторитет',role:'Старый волк',icon:'👑',avatar:AV+'avtoritet_avatar.webp',
      greet:'Авторитет не торопится: «Слова должны весить.»',
      dialogs:[
        {q:'Авторитет: «Скажи, что для тебя важнее — деньги или имя?»',choices:[
          {t:'Имя',ok:.7,pts:80,msg:'Авторитет кивает: «Правильный ответ, если за именем стоят поступки.»'},
          {t:'30 🍵 за его мнение',ok:.75,chifir:-30,rewardChifir:60,pts:110,msg:'Он делится старым правилом зоны. +110 ⭐.'},
          {t:'Деньги',ok:.6,pts:40,msg:'Авторитет усмехается: «Честно. Но деньги без имени быстро заканчиваются.»'}
        ]},
        {q:'Авторитет: «Хочешь услышать историю, которую здесь мало кто знает?»',choices:[
          {t:'Попросить рассказать',ok:.65,pts:90,msg:'Авторитет рассказывает старую историю и делает из неё вывод.'},
          {t:'40 🍵 за всю историю',ok:.8,chifir:-40,pts:140,msg:'История оказывается ценной. Авторитет уважает твоё любопытство.'},
          {t:'Не сейчас',ok:1,msg:'Авторитет: «Умение ждать тоже дорогого стоит.»'}
        ]},
        {q:'Авторитет смотрит прямо: «Иногда за любопытство приходится платить. Проверишь?»',choices:[
          {t:'Рискнуть и спросить',ok:.45,pts:120,msg:'В этот раз тебе повезло. Авторитет отвечает прямо.'},
          {t:'30 🍵 за честный ответ',ok:.55,chifir:-30,pts:150,msg:'Авторитет отвечает, но предупреждает: «Теперь ты знаешь. Не болтай.»'},
          {t:'Отказаться',ok:1,msg:'Авторитет одобрительно кивает: «Значит, умеешь держать себя в руках.»'}
        ]},
        {q:'Авторитет: «Последний разговор. Как поступишь, если никто не видит?»',choices:[
          {t:'Сделаю как правильно',ok:.7,pts:130,msg:'Авторитет улыбается: «Вот теперь ты начинаешь понимать.»'},
          {t:'50 🍵 за его совет',ok:.75,chifir:-50,pts:180,msg:'Авторитет даёт редкий совет. +180 ⭐.'},
          {t:'Промолчу',ok:.9,pts:35,msg:'Авторитет: «Иногда молчание говорит больше слов.»'}
        ]}
      ]}
  ];


  // Отношения с каждым персонажем: репутация, память поступков и уровни доверия.
  var REL_KEY='npcRelations';
  var REL_LEVELS=[
    {min:0,max:9,name:'Незнакомец'},
    {min:10,max:24,name:'Знакомый'},
    {min:25,max:49,name:'Кент'},
    {min:50,max:999,name:'Брат'}
  ];
  var REL_DIALOGS={
    shaiba:[
      {minRep:10,q:'Шайба: «Слышь, есть одна вещь. Узнай, кто в третьей хате меня обсуждает. Только без шума.»',choices:[
        {t:'Узнаю аккуратно и принесу тебе имя',ok:.75,rep:2,pts:45,msg:'Ты аккуратно собрал информацию и принёс её Шайбе. Он это запомнил. +45 ⭐.'},
        {t:'Попробую узнать, но без обещаний',ok:.9,rep:1,pts:20,msg:'Ты собрал только часть информации, но Шайба ценит, что ты не бросил дело.'},
        {t:'Не хочу лезть в чужие разговоры',ok:1,rep:0,msg:'Шайба кивает: «И правильно. Не каждое слово стоит того, чтобы его искать.»'}
      ]},
      {minRep:10,q:'Шайба: «Мне нужно обменять одну вещь. Сможешь провести её до нужного человека?»',choices:[
        {t:'Давай, проведу',ok:.8,rep:2,pts:60,risk:{chance:.16,pts:-20,msg:'По дороге подняли лишний шум, и тебе пришлось бросить вещь. Ты потерял 20 ⭐ опыта, но Шайба видит, что ты пытался помочь.',rep:1},msg:'Обмен прошёл чисто. Шайба отдаёт тебе часть выгоды. +60 ⭐.'},
        {t:'Сначала скажи, что за вещь',ok:.9,rep:1,pts:25,msg:'Ты выяснил детали и решил, что сделка безопасна.'},
        {t:'Нет, слишком мутно',ok:1,rep:0,msg:'Шайба не обижается: «Осторожность иногда дороже выгоды.»'}
      ]},
      {minRep:25,q:'Шайба: «Есть свободное место на обмен. Можем заработать оба. Впишешься?»',choices:[
        {t:'Вписываюсь',ok:.72,rep:2,pts:90,risk:{chance:.14,pts:-25,msg:'Покупатель попытался сыграть грязно. Сделка сорвалась, и ты потерял 25 ⭐ опыта.',rep:0},msg:'Сделка удалась. Вы делите прибыль. +90 ⭐.'},
        {t:'Давай сначала проверим покупателя',ok:.9,rep:2,pts:35,msg:'Проверка спасла сделку от лишнего риска. Шайба уважает такой подход. +35 ⭐.'},
        {t:'Не сегодня',ok:1,rep:0,msg:'Шайба принимает отказ без лишних вопросов.'}
      ]},
      {minRep:25,q:'Шайба: «Мне сообщили, что завтра в хате будет шмон. Можешь помочь подготовиться?»',choices:[
        {t:'Да, уберём всё лишнее',ok:.82,rep:2,pts:55,risk:{chance:.1,pts:-15,msg:'Шмон начался раньше ожидаемого. Ты потерял 15 ⭐ опыта, но успел предупредить Шайбу.',rep:1},msg:'Вы успели подготовиться. Шайба запомнил помощь. +55 ⭐.'},
        {t:'Рассказывай, что именно убрать',ok:.95,rep:1,pts:30,msg:'Ты действуешь спокойно и помогаешь без лишнего риска.'},
        {t:'Я в это не полезу',ok:1,rep:-1,msg:'Шайба хмурится: «Ладно. Значит, сам.»'}
      ]},
      {minRep:50,q:'Шайба: «Мне нужно доверить тебе одну вещь до завтра. Не подведёшь?»',choices:[
        {t:'Доверяй',ok:.82,rep:3,pts:120,risk:{chance:.12,pts:-30,term:2,msg:'Тебя остановили во время проверки, и вещь пришлось бросить. -30 ⭐ опыта и +2 дня срока.',rep:-1},msg:'Ты сохранил вещь и вернул её Шайбе. Он теперь действительно считает тебя своим. +120 ⭐.'},
        {t:'Сначала расскажи, какой риск',ok:.95,rep:2,pts:45,msg:'Ты проверил условия и только потом согласился. Шайба уважает голову на плечах.'},
        {t:'Не хочу рисковать',ok:1,rep:0,msg:'Шайба кивает: «Хотя бы честно сказал.»'}
      ]},
      {minRep:50,q:'Шайба: «Мне пришла информация о предстоящей подставе. Можешь проверить, правда ли это?»',choices:[
        {t:'Проверю и вернусь с ответом',ok:.78,rep:3,pts:100,risk:{chance:.12,pts:-20,msg:'Тебя заметили, пока ты проверял информацию. Пришлось отступить. -20 ⭐ опыта.',rep:1},msg:'Ты подтвердил подставу и предупредил Шайбу. +100 ⭐.'},
        {t:'Лучше расскажи всё, что знаешь',ok:.9,rep:2,pts:50,msg:'Шайба делится деталями и благодарит за серьёзный подход.'},
        {t:'Не хочу вмешиваться',ok:1,rep:-1,msg:'Шайба: «После такого я дважды подумаю, прежде чем просить тебя.»'}
      ]}
    ],
    bugor:[
      {minRep:10,q:'Бугор: «Есть одна старая гантеля. Принеси её из подсобки, пока её не разобрали.»',choices:[
        {t:'Сейчас принесу',ok:.82,rep:2,pts:45,risk:{chance:.12,pts:-10,msg:'Гантеля оказалась тяжелее, чем казалось. Ты сорвал тренировку и потерял 10 ⭐ опыта.',rep:1},msg:'Ты принёс гантелю. Бугор доволен. +25 ⭐.'},
        {t:'Покажи, какую именно',ok:.95,rep:1,pts:25,msg:'Ты уточнил детали и не стал тащить не то.'},
        {t:'Сам сходи',ok:1,rep:-1,msg:'Бугор пожимает плечами: «Ладно, понял.»'}
      ]},
      {minRep:10,q:'Бугор: «Хочу проверить одну технику. Нужен напарник. Впишешься?»',choices:[
        {t:'Впишусь',ok:.72,rep:2,pts:55,risk:{chance:.18,pts:-15,msg:'На тренировке ты неудачно принял удар. -15 ⭐ опыта, но Бугор видит, что ты не сдался.',rep:1},msg:'Тренировка прошла жёстко, но ты выдержал. +25 ⭐.'},
        {t:'Сначала объясни технику',ok:.9,rep:1,pts:25,msg:'Бугор объясняет всё по шагам.'},
        {t:'Сегодня пас',ok:1,rep:0,msg:'Бугор: «Отдых тоже часть тренировки.»'}
      ]},
      {minRep:25,q:'Бугор: «Есть тип, который решил проверить нас. Пойдёшь со мной на разговор?»',choices:[
        {t:'Пошли вместе',ok:.7,rep:2,pts:80,risk:{chance:.18,pts:-20,msg:'Разговор перерос в драку. Тебя зацепили, и ты потерял 20 ⭐ опыта. Но ты пришёл к Бугру и не бросил его.',rep:0},msg:'Вы спокойно решили вопрос. Бугор уважает, что ты пришёл. +80 ⭐.'},
        {t:'Пойдём, но сначала узнаем, кто там',ok:.88,rep:2,pts:40,msg:'Вы собрали информацию и избежали лишней драки. +40 ⭐.'},
        {t:'Разбирайся сам',ok:1,rep:-1,msg:'Бугор хмурится: «Понял.»'}
      ]},
      {minRep:25,q:'Бугор: «Есть катала, который разводит салаг. Поможешь сыграть против него честно?»',choices:[
        {t:'Да, сыграем',ok:.65,rep:2,pts:100,risk:{chance:.2,pts:-25,msg:'Катала раскусил схему. Ты потерял 25 ⭐ опыта, но Бугор знает, что ты не струсил.',rep:0},msg:'Катала попался на собственной игре. Вы делите выигрыш. +100 ⭐.'},
        {t:'Сначала разберём его привычки',ok:.9,rep:2,pts:45,msg:'Вы подготовились и нашли слабое место в его игре.'},
        {t:'Не люблю такие игры',ok:1,rep:0,msg:'Бугор: «Тоже позиция.»'}
      ]},
      {minRep:50,q:'Бугор: «Завтра может быть серьёзная стрела. Я пойду. Ты со мной?»',choices:[
        {t:'Со мной считай',ok:.68,rep:3,pts:130,risk:{chance:.2,pts:-30,msg:'На стреле тебя сразу зацепили заточкой. Ты потерял 30 ⭐ опыта и не смог помочь Бугру. Но ты пришёл и не сбежал.',rep:0},msg:'Выстояли вместе. Бугор знает, что на тебя можно рассчитывать. +130 ⭐.'},
        {t:'Пойду, но сначала подготовимся',ok:.82,rep:3,pts:60,msg:'Вы подготовились и подошли к делу без лишнего геройства. +60 ⭐.'},
        {t:'Нет, это уже слишком',ok:1,rep:0,msg:'Бугор принимает решение без обиды: «Каждый сам выбирает свой риск.»'}
      ]},
      {minRep:50,q:'Бугор: «После всего, что было, могу доверить тебе свой запас. Поможешь сохранить его до завтра?»',choices:[
        {t:'Сохраним, не вопрос',ok:.84,rep:3,pts:110,risk:{chance:.1,pts:-30,term:2,msg:'Во время шмона запас нашли у тебя. -30 ⭐ опыта и +2 дня срока. Бугор недоволен потерей, но понимает, что ты пытался.',rep:-1},msg:'Ты сохранил запас и вернул его Бугру. Он явно стал относиться к тебе как к брату.'},
        {t:'Сначала придумаем безопасное место',ok:.95,rep:3,pts:50,msg:'Ты предложил более безопасный вариант. Бугор уважает рассудительность.'},
        {t:'Не хочу хранить чужое',ok:1,rep:0,msg:'Бугор: «Честный отказ лучше пустых обещаний.»'}
      ]}
    ],
    kosoy:[
      {minRep:10,q:'Косой: «Могу проверить одну информацию для тебя. Но услуга за услугу. Согласен?»',choices:[
        {t:'Согласен',ok:.82,rep:2,pts:55,msg:'Косой проверяет слух и приносит подтверждение. +55 ⭐.'},
        {t:'Сначала скажи, что понадобится',ok:.95,rep:1,pts:20,msg:'Косой раскрывает условия заранее.'},
        {t:'Нет, не хочу быть должен',ok:1,rep:0,msg:'Косой усмехается: «Здравый подход.»'}
      ]},
      {minRep:10,q:'Косой: «Хочешь обменять одну наводку на другую?»',choices:[
        {t:'Давай обмен',ok:.8,rep:2,pts:50,msg:'Обмен оказался выгодным. +50 ⭐.'},
        {t:'Сначала проверю твою наводку',ok:.9,rep:2,pts:25,msg:'Косой уважает проверку и подтверждает информацию.'},
        {t:'Мне нечего отдавать',ok:1,rep:0,msg:'Косой: «Значит, в другой раз.»'}
      ]},
      {minRep:25,q:'Косой: «Мне сообщили, что завтра хотят подставить одного твоего знакомого. Раскопаешь подробности?»',choices:[
        {t:'Раскопаю и предупрежу его',ok:.75,rep:3,pts:100,risk:{chance:.14,pts:-20,msg:'Тебя заметили во время проверки. Ты потерял 20 ⭐ опыта, но успел уйти.',rep:1},msg:'Ты подтвердил подставу и предупредил человека. +100 ⭐.'},
        {t:'Сначала узнай, кто стоит за этим',ok:.82,rep:2,pts:55,msg:'Ты получил имя организатора и важную деталь.'},
        {t:'Не моё дело',ok:1,rep:-1,msg:'Косой: «Вот это уже понятно. Буду знать.»'}
      ]},
      {minRep:25,q:'Косой: «Есть покупатель на редкую вещь. Хочешь войти в сделку?»',choices:[
        {t:'Да, но проверим покупателя',ok:.85,rep:2,pts:120,risk:{chance:.1,pts:-25,msg:'Покупатель оказался хитрее. Сделка сорвалась, -25 ⭐ опыта.',rep:1},msg:'Проверка прошла, сделка закрыта. +120 ⭐.'},
        {t:'Сколько можно заработать?',ok:.9,rep:1,pts:40,msg:'Косой называет сумму и условия.'},
        {t:'Слишком рискованно',ok:1,rep:0,msg:'Косой: «Значит, не твой день.»'}
      ]},
      {minRep:50,q:'Косой: «Я первым узнал о большой подставе. Если хочешь, могу назвать имя. Но это уже серьёзно.»',choices:[
        {t:'Говори. Я не забуду',ok:.82,rep:3,pts:140,risk:{chance:.08,pts:-20,msg:'Ты слишком близко подошёл к тем, кто стоял за схемой. -20 ⭐ опыта, но имя у тебя.',rep:1},msg:'Косой раскрывает имя. Такая информация дорогого стоит. +140 ⭐.'},
        {t:'Рассказывай только то, что можно проверить',ok:.95,rep:3,pts:70,msg:'Ты получил проверяемые детали без лишнего риска.'},
        {t:'Не хочу знать',ok:1,rep:0,msg:'Косой кивает: «Иногда незнание действительно спокойнее.»'}
      ]},
      {minRep:50,q:'Косой: «Есть редкая вещь. Могу достать, если проведём сделку вдвоём. И шанс хороший, и риск настоящий.»',choices:[
        {t:'Вписываюсь',ok:.62,rep:3,pts:170,risk:{chance:.18,pts:-35,msg:'В последний момент покупатель соскочил. -35 ⭐ опыта, а Косой всё равно ценит, что ты был готов.',rep:0},msg:'Сделка удалась. Косой делится прибылью.'},
        {t:'Сначала проверим обе стороны',ok:.88,rep:3,pts:80,msg:'Проверка позволила провести сделку чисто. +80 ⭐.'},
        {t:'Нет, слишком много неизвестных',ok:1,rep:0,msg:'Косой: «Понимаю. Не каждый день стоит рисковать.»'}
      ]}
    ],
    smotryashiy:[
      {minRep:10,q:'Смотрящий: «В бараке спор. Нужно решить без шума. Поможешь?»',choices:[
        {t:'Помогу разойтись мирно',ok:.82,rep:2,pts:50,msg:'Ты помог остановить конфликт без лишнего шума. +50 ⭐.'},
        {t:'Сначала выясню причину',ok:.95,rep:2,pts:30,msg:'Ты не стал судить вслепую. Смотрящий это отметил.'},
        {t:'Не вмешиваюсь',ok:1,rep:0,msg:'Смотрящий: «Главное — не мешай тем, кто решает.»'}
      ]},
      {minRep:10,q:'Смотрящий: «Нужно передать сообщение человеку, которому я не доверяю. Сделаешь?»',choices:[
        {t:'Передам лично',ok:.85,rep:2,pts:55,risk:{chance:.1,pts:-15,msg:'Получатель устроил неприятный разговор. -15 ⭐ опыта, но сообщение дошло.',rep:1},msg:'Сообщение передано точно.'},
        {t:'Дай мне знать, что нельзя говорить',ok:.95,rep:1,pts:25,msg:'Смотрящий предупреждает о границах разговора.'},
        {t:'Нет, не хочу в это лезть',ok:1,rep:0,msg:'Смотрящий кивает: «По крайней мере, честно.»'}
      ]},
      {minRep:25,q:'Смотрящий: «Кто-то регулярно нарушает порядок. Можешь узнать, кто именно?»',choices:[
        {t:'Узнаю без шума',ok:.75,rep:2,pts:75,risk:{chance:.12,pts:-15,msg:'Тебя заметили во время проверки. -15 ⭐ опыта.',rep:1},msg:'Ты принёс точную информацию. +75 ⭐.'},
        {t:'Поговорю с людьми и проверю слухи',ok:.9,rep:2,pts:45,msg:'Ты собрал несколько независимых подтверждений.'},
        {t:'Я не стукач',ok:1,rep:-1,msg:'Смотрящий холодно отвечает: «Я спросил про порядок, а не про стукачество.»'}
      ]},
      {minRep:25,q:'Смотрящий: «Двое сейчас могут сцепиться. Если увидишь — остановишь?»',choices:[
        {t:'Остановлю',ok:.72,rep:2,pts:70,risk:{chance:.2,pts:-20,msg:'Тебя зацепили в суматохе. -20 ⭐ опыта. Смотрящий видит, что ты реально вмешался.',rep:1},msg:'Ты разнял их до серьёзной драки. +70 ⭐.'},
        {t:'Сначала позову помощь',ok:.92,rep:2,pts:45,msg:'Ты выбрал более безопасный вариант и всё равно помог.'},
        {t:'Пусть сами разбираются',ok:1,rep:-1,msg:'Смотрящий: «Запомнил.»'}
      ]},
      {minRep:50,q:'Смотрящий: «Мне нужно, чтобы ты сохранил одну важную информацию в тайне. Сможешь?»',choices:[
        {t:'Слово держу',ok:.9,rep:3,pts:120,risk:{chance:.08,pts:-25,msg:'Тебя пытались разговорить. Ты потерял 25 ⭐ опыта, но тайну не выдал.',rep:2},msg:'Ты сохранил тайну. Смотрящий впервые говорит с тобой без лишней дистанции.'},
        {t:'Расскажи, насколько это серьёзно',ok:.95,rep:2,pts:50,msg:'Смотрящий объясняет ровно столько, сколько нужно знать.'},
        {t:'Не обещаю того, чего не знаю',ok:1,rep:1,msg:'Смотрящий: «Вот за это и ценят честность.»'}
      ]},
      {minRep:50,q:'Смотрящий: «Есть рискованный вопрос, который лучше решать вдвоём. Пойдёшь со мной?»',choices:[
        {t:'Пойду',ok:.75,rep:3,pts:150,risk:{chance:.15,pts:-30,msg:'Ситуация стала жёстче, чем ожидалось. -30 ⭐ опыта, но ты не оставил Смотрящего одного.',rep:1},msg:'Вы решили вопрос вместе. +150 ⭐.'},
        {t:'Пойду, но сначала узнаю детали',ok:.9,rep:3,pts:65,msg:'Ты подготовился и помог решить вопрос без лишнего риска.'},
        {t:'Нет, это не моя проблема',ok:1,rep:-1,msg:'Смотрящий: «Понял. Больше не буду предлагать подобное.»'}
      ]}
    ],
    avtoritet:[
      {minRep:10,q:'Авторитет: «Мне нужно проверить, умеешь ли ты держать слово. Поможешь с простой услугой?»',choices:[
        {t:'Сделаю',ok:.85,rep:2,pts:65,msg:'Ты выполнил просьбу без лишних слов. Авторитет это отметил.'},
        {t:'Сначала объясни условия',ok:.95,rep:2,pts:30,msg:'Авторитет уважает, что ты не обещаешь вслепую.'},
        {t:'Не хочу брать обязательства',ok:1,rep:0,msg:'Авторитет: «Честный отказ лучше пустого обещания.»'}
      ]},
      {minRep:10,q:'Авторитет: «Есть человек, который просит слишком много. Как бы ты поступил?»',choices:[
        {t:'Сначала проверил бы его мотивы',ok:.9,rep:2,pts:45,msg:'Авторитет одобряет рассудительность.'},
        {t:'Поставил бы условия',ok:.82,rep:2,pts:60,msg:'Ты показал, что умеешь торговаться без лишнего шума.'},
        {t:'Сделал бы вид, что не заметил',ok:1,rep:-1,msg:'Авторитет: «Иногда бездействие тоже решение. Но не всегда хорошее.»'}
      ]},
      {minRep:25,q:'Авторитет: «Есть сделка. Если проведём её чисто, выгода будет хорошей. Готов?»',choices:[
        {t:'Готов',ok:.72,rep:3,pts:120,risk:{chance:.14,pts:-25,msg:'Сделка сорвалась из-за неожиданного изменения условий. -25 ⭐ опыта.',rep:1},msg:'Сделка прошла чисто. Авторитет отдаёт тебе обещанную долю. +120 ⭐.'},
        {t:'Сначала проверим вторую сторону',ok:.92,rep:3,pts:65,msg:'Проверка позволила избежать ловушки. +65 ⭐.'},
        {t:'Слишком большой риск',ok:1,rep:0,msg:'Авторитет: «Понимаешь свои границы. Это неплохо.»'}
      ]},
      {minRep:25,q:'Авторитет: «Мне нужна информация о человеке. Не слух, а проверенный факт. Возьмёшься?»',choices:[
        {t:'Проверю',ok:.75,rep:3,pts:110,risk:{chance:.12,pts:-20,msg:'Проверка оказалась опаснее ожидаемого. -20 ⭐ опыта, но ты вернулся с частью фактов.',rep:1},msg:'Ты принёс проверенную информацию. +110 ⭐.'},
        {t:'Дай мне время собрать факты',ok:.95,rep:2,pts:50,msg:'Авторитет ценит точность больше скорости.'},
        {t:'Не хочу вмешиваться',ok:1,rep:0,msg:'Авторитет: «Понимаю. Значит, это не твоя тема.»'}
      ]},
      {minRep:50,q:'Авторитет: «Есть дело, где я могу довериться только одному человеку. Если возьмёшься — назад легко не свернуть.»',choices:[
        {t:'Я в деле',ok:.7,rep:3,pts:180,risk:{chance:.16,pts:-35,term:3,msg:'Проверка пошла не по плану. -35 ⭐ опыта и +3 дня срока. Но ты не бросил дело на полпути.',rep:1},msg:'Дело удалось. Авторитет признаёт тебя человеком, на которого можно опереться. +180 ⭐.'},
        {t:'Сначала расскажи риски',ok:.9,rep:3,pts:80,msg:'Ты выяснил риски и предложил более безопасный план. +80 ⭐.'},
        {t:'Не сейчас',ok:1,rep:0,msg:'Авторитет: «Значит, ещё не время.»'}
      ]},
      {minRep:50,q:'Авторитет: «У меня есть вещь, которую я не отдам первому встречному. Можешь заслужить её одной последней проверкой.»',choices:[
        {t:'Готов пройти проверку',ok:.65,rep:4,pts:200,risk:{chance:.15,pts:-40,msg:'Проверка оказалась жёсткой. -40 ⭐ опыта, но ты выдержал её условия.',rep:2},drop:{chance:.15,type:'крайне редкий'},msg:'Ты прошёл проверку. Авторитет открывает тебе доступ к особой награде. +200 ⭐.'},
        {t:'Сначала хочу понять правила',ok:.92,rep:3,pts:90,msg:'Ты выяснил правила и избежал ненужного риска. +90 ⭐.'},
        {t:'Не буду играть вслепую',ok:1,rep:1,msg:'Авторитет: «И правильно. Человек должен понимать, во что входит.»'}
      ]}
    ]
  };
  Object.keys(REL_DIALOGS).forEach(function(id){
    var n=NPCS.find(function(x){return x.id===id});
    if(n)n.dialogs=n.dialogs.concat(REL_DIALOGS[id]);
  });

  function relStore(s){if(!s)return {};if(!s[REL_KEY]||typeof s[REL_KEY]!=='object')s[REL_KEY]={};return s[REL_KEY];}
  function relState(npc,s){
    var a=relStore(s),x=a[npc.id]||{};
    return {rep:Math.max(0,Math.min(60,Number(x.rep)||0)),helped:Math.max(0,Number(x.helped)||0),failed:Math.max(0,Number(x.failed)||0),betrayed:Math.max(0,Number(x.betrayed)||0),saved:Math.max(0,Number(x.saved)||0)};
  }
  function relLevel(rep){for(var i=REL_LEVELS.length-1;i>=0;i--)if(rep>=REL_LEVELS[i].min)return REL_LEVELS[i];return REL_LEVELS[0];}
  function changeRel(npc,delta,s,kind){
    if(!delta)return;
    var a=relStore(s),x=a[npc.id]||{rep:0,helped:0,failed:0,betrayed:0,saved:0};
    x.rep=Math.max(0,Math.min(60,(Number(x.rep)||0)+Number(delta)));
    if(kind==='help')x.helped=(Number(x.helped)||0)+1;
    if(kind==='fail')x.failed=(Number(x.failed)||0)+1;
    if(kind==='save')x.saved=(Number(x.saved)||0)+1;
    if(kind==='betray')x.betrayed=(Number(x.betrayed)||0)+1;
    a[npc.id]=x;
  }
  function relationChance(npc,s){
    var r=relState(npc,s).rep;
    return 1 + Math.min(.15,r/100);
  }

  function rareWeaponLossOnFailure(s){
    // Крайне редкий провал: около 5% шанс, что при вмешательстве ментов
    // игрок лишится надетого оружия. Кулаки потерять нельзя.
    if(!s || Math.random()>=0.05 || !s.equipment || !s.ownedWeapons)return '';
    var wid=s.equipment.weapon||'fists';
    if(!wid || wid==='fists')return '';
    var itemId=wid, idx=s.ownedWeapons.indexOf(itemId);
    if(idx>=0)s.ownedWeapons.splice(idx,1);
    s.equipment.weapon='fists';
    var names={
      nail:'Ржавый гвоздь',glass:'Осколок стекла',razor:'Бритва',awl:'Шило',
      hammer:'Молоток',shank:'Заточка',bat:'Бита',butterfly:'Нож-бабочка',
      knuckles:'Кастет',pipe:'Труба',chain:'Цепь',authority:'Секира'
    };
    return ' Менты забрали твоё оружие: '+(names[itemId]||'оружие')+'.';
  }

  function dropRoll(npc,choice,s){
    if(!choice.drop)return '';
    var r=relState(npc,s).rep;
    if(r<50 || Math.random()>=Number(choice.drop.chance||0))return '';
    var type=choice.drop.type||'редкий';
    s.tasks=s.tasks||{};
    s.tasks.npcDrop=(s.tasks.npcDrop||0)+1;
    return ' 🎁 Бонус: выпал '+type+' дроп!';
  }

  function $(id){return document.getElementById(id)}
  function st(){
    try{ if(typeof window.getGameState==='function') return window.getGameState(); }catch(e){}
    return window.s||null;
  }
  function save(){ try{ if(typeof window.saveGame==='function') window.saveGame(); }catch(e){} }
  function ui(){ try{ if(typeof window.ui==='function') window.ui(); }catch(e){} }
  function fmt(n){ n=Math.floor(Number(n)||0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
  function msg(t){
    var e=$('event-message');
    if(e){ e.textContent=t; e.classList.add('show'); setTimeout(function(){ e.classList.remove('show'); },2200); }
  }
  function openModal(html){
    if(typeof window.openModal==='function'){ window.openModal(html); return; }
    var c=$('modal-content'), o=$('modal-overlay'), m=$('modal');
    if(!c||!o)return;
    c.innerHTML=html;
    o.classList.remove('hidden');
    o.classList.add('show');
    if(m) m.classList.remove('npc-modal');
  }
  function openNpcModal(html){
    openModal(html);
    var m=$('modal');
    if(m) m.classList.add('npc-modal');
  }

  var TALK_KEY='npcTalks';
  var TALK_LIMIT=2, TALK_COOLDOWN=15*60*1000, AD_BONUS=2;
  var adBusyNpc=null, npcTimer=null;
  function talkStore(s){if(!s)return {};if(!s[TALK_KEY]||typeof s[TALK_KEY]!=='object')s[TALK_KEY]={};return s[TALK_KEY];}
  function talkState(npc,s){var all=talkStore(s),x=all[npc.id]||{};return {used:Math.max(0,Number(x.used)||0),extra:Math.max(0,Number(x.extra)||0),until:Math.max(0,Number(x.until)||0)};}
  function saveTalkState(npc,d,s){talkStore(s)[npc.id]=d;save();}
  function cooldownText(until){var sec=Math.ceil(Math.max(0,Number(until)-Date.now())/1000),min=Math.floor(sec/60);sec%=60;return min?min+' мин '+String(sec).padStart(2,'0')+' сек':sec+' сек';}
  function normalizeTalkState(npc,s){var d=talkState(npc,s);if(d.until&&d.until<=Date.now()){d.until=0;d.used=0;saveTalkState(npc,d,s);}return d;}
  function availableTalks(npc,s){var d=normalizeTalkState(npc,s);return d.extra+(!d.until?Math.max(0,TALK_LIMIT-d.used):0);}
  function consumeTalk(npc,s){var d=normalizeTalkState(npc,s);if(d.extra>0){d.extra--;saveTalkState(npc,d,s);return true;}if(d.until)return false;if(d.used<TALK_LIMIT){d.used++;if(d.used>=TALK_LIMIT){d.until=Date.now()+TALK_COOLDOWN;d.used=0;}saveTalkState(npc,d,s);return true;}return false;}
  function nextRoundFor(npc,s){
    var all=talkStore(s),start=Number(all[npc.id+'_round']);
    if(!Number.isFinite(start)||start<0||start>=npc.dialogs.length)start=0;
    var rep=relState(npc,s).rep;
    for(var step=0;step<npc.dialogs.length;step++){
      var idx=(start+step)%npc.dialogs.length, d=npc.dialogs[idx];
      if(!d.minRep || rep>=d.minRep)return idx;
    }
    return 0;
  }
  function showUrgentNpc(npc,s){if(npcTimer){clearInterval(npcTimer);npcTimer=null;}var d=normalizeTalkState(npc,s);if(availableTalks(npc,s)>0)return false;var phrases={bugor:'Бугор отдыхает, не беспокой его.',kosoy:'Косой ушёл на стрелку. Вернётся через ',shaiba:'Шайба ушёл по делам. Вернётся через ',smotryashiy:'Смотрящий занят. Освободится через ',avtoritet:'Авторитет отдыхает. Вернётся через '};var text=phrases[npc.id]||(npc.name+' сейчас занят. Вернётся через ');if(d.until)text+='<span id="npc-cooldown-value">'+cooldownText(d.until)+'</span>.';else text=npc.name+' уже всё рассказал на сегодня.';var rr=relState(npc,s),rl=relLevel(rr.rep);var html='<div class="npc-hero"><img class="npc-hero-img" src="'+npc.avatar+'" alt="" draggable="false"><div class="npc-hero-title"><b>'+npc.name+'</b><small>'+npc.role+'</small></div></div><div class="npc-action-panel npc-rest-panel"><div class="npc-talk-status">Отношение: <b>'+rl.name+'</b> · '+rr.rep+'/50</div><div class="npc-dialogue"><p>'+text+'</p></div><div class="npc-choice-title">СРОЧНЫЙ ВЫЗОВ</div><button type="button" class="npc-primary" id="npc-call-ad">📺 Позвать '+npc.name+' срочно!</button><small class="npc-cooldown-note">За просмотр рекламы откроются ещё 2 диалога с '+npc.name+'.</small><button type="button" class="npc-primary npc-secondary" id="npc-back-list">← К списку</button></div>';openNpcModal(html);if(d.until){var tick=function(){var el=$('npc-cooldown-value');if(!el){clearInterval(npcTimer);npcTimer=null;return;}if(Date.now()>=d.until){clearInterval(npcTimer);npcTimer=null;renderList();return;}el.textContent=cooldownText(d.until);};npcTimer=setInterval(tick,1000);tick();}var ad=$('npc-call-ad');if(ad)ad.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();requestNpcAd(npc);});var back=$('npc-back-list');if(back)back.addEventListener('click',function(e){e.preventDefault();renderList();});return true;}
  function requestNpcAd(npc){if(adBusyNpc){msg('📺 Реклама уже запускается.');return;}if(typeof window.showRewardedAd!=='function'){msg('📺 Реклама пока недоступна.');return;}adBusyNpc=npc.id;window.showRewardedAd(function(ok){var s=st();if(adBusyNpc!==npc.id)return;adBusyNpc=null;if(!ok){msg('📺 Реклама не просмотрена полностью. Диалоги не разблокированы.');showUrgentNpc(npc,s);return;}var d=talkState(npc,s);d.extra=(d.extra||0)+AD_BONUS;saveTalkState(npc,d,s);ui();msg('🎁 '+npc.name+': +2 диалога получены за рекламу.');openDialogue(npc,nextRoundFor(npc,s));});}
  function renderList(){
    var html='<div class="barrack-window section-window">'+
      '<div class="section-kicker">ТВОЁ МЕСТО</div>'+
      '<h2>☰ Барак</h2>'+
      '<p class="section-subtitle">Люди, с которыми стоит говорить</p>'+
      '<div class="npc-list">';
    var s=st();
    var points=Number(s&&s.points)||0;
    NPCS.forEach(function(n){
      var unlocked=points>=Number(n.unlockPoints||0);
      if(unlocked){
        html+='<button type="button" class="npc-link" data-npc="'+n.id+'"><span aria-hidden="true">'+n.icon+'</span><b>'+n.name+'</b><small>'+n.role+'</small></button>';
      }else{
        html+='<button type="button" class="npc-link npc-link-locked" disabled aria-disabled="true"><span aria-hidden="true">🔒</span><b>'+n.name+'</b><small>Откроется с мастью «'+(function(){var rr={0:'Салага',1500:'Пацан',5000:'Блатной',15000:'Смотрящий',50000:'Авторитет'};return rr[Number(n.unlockPoints)]||'следующей мастью';})()+'»</small></button>';
      }
    });
    html+='</div></div>';
    openModal(html);
    var m=$('modal');
    if(m) m.classList.remove('npc-modal');
    document.querySelectorAll('.npc-link[data-npc]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        var id=btn.getAttribute('data-npc');
        var npc=NPCS.find(function(x){return x.id===id});
        if(npc) openDialogue(npc);
      });
    });
  }

  function openDialogue(npc, roundIndex){
    var s=st();
    if(!s){msg('Игра ещё загружается…');return;}
    if(showUrgentNpc(npc,s))return;
    roundIndex=Number(roundIndex);
    if(!Number.isFinite(roundIndex)||roundIndex<0||roundIndex>=npc.dialogs.length)roundIndex=nextRoundFor(npc,s);
    var round=npc.dialogs[roundIndex];
    var talkLeft=availableTalks(npc,s);
    var rs=relState(npc,s), rl=relLevel(rs.rep);
    var statusHtml=talkLeft>0
      ? '<div class="npc-talk-status">Осталось диалогов: <b>'+talkLeft+'</b></div>'
      : '';
    var relHtml='<div class="npc-talk-status">Отношение: <b>'+rl.name+'</b> · '+rs.rep+'/50</div>';
    var html='<div class="npc-hero">'+
      '<img class="npc-hero-img" src="'+npc.avatar+'" alt="" draggable="false">'+
      '<div class="npc-hero-title"><b>'+npc.name+'</b><small>'+npc.role+'</small></div>'+
      '</div>'+
      '<div class="npc-action-panel">'+
      '<div class="npc-dialogue"><p>'+(round?round.q:npc.greet)+'</p></div>'+
      relHtml+statusHtml+
      '<div class="npc-choice-title">ТВОЙ ОТВЕТ</div>';
    if(!round){
      html+='<div class="npc-dialogue npc-dialogue-finished"><p>На сегодня разговор закончен.</p></div>'+
        '<button type="button" class="npc-primary" id="npc-back-list">← К списку</button>';
    }else{
      round.choices.forEach(function(choice,i){
        html+='<button type="button" class="npc-choice" data-choice="'+i+'">'+choice.t+'</button>';
      });
      html+='<button type="button" class="npc-primary" id="npc-back-list">← К списку</button>';
    }
    html+='</div>';
    openNpcModal(html);
    document.querySelectorAll('.npc-choice[data-choice]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        var i=Number(btn.getAttribute('data-choice'));
        resolveLine(npc, round, round.choices[i], roundIndex);
      });
    });
    var back=$('npc-back-list');
    if(back) back.addEventListener('click',function(e){ e.preventDefault(); renderList(); });
  }

  function showNpcResponse(npc, text, nextRound){
    // Храним следующий раунд отдельно и всегда читаем его из сохранения при продолжении.
    var s=st();
    if(s){
      talkStore(s)[npc.id+'_round']=nextRound;
      save();
    }
    var html='<div class="npc-hero">'+
      '<img class="npc-hero-img" src="'+npc.avatar+'" alt="" draggable="false">'+
      '<div class="npc-hero-title"><b>'+npc.name+'</b><small>'+npc.role+'</small></div>'+
      '</div>'+
      '<div class="npc-action-panel npc-response-panel">'+
      (function(){var rr=relState(npc,st()),ll=relLevel(rr.rep);return '<div class="npc-talk-status">Отношение: <b>'+ll.name+'</b> · '+rr.rep+'/50</div>';})()+
      '<div class="npc-dialogue npc-dialogue-response"><p>'+text+'</p></div>'+
      '<button type="button" class="npc-primary" id="npc-continue">'+
      (nextRound<npc.dialogs.length?'Продолжить разговор':'Закончить разговор')+
      '</button>'+
      '<button type="button" class="npc-primary npc-secondary" id="npc-back-list">← К списку</button>'+
      '</div>';
    openNpcModal(html);
    var next=$('npc-continue');
    if(next) next.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      if(availableTalks(npc,st())>0)openDialogue(npc,nextRoundFor(npc,st()));else showUrgentNpc(npc,st());
    });
    var back=$('npc-back-list');
    if(back) back.addEventListener('click',function(e){ e.preventDefault(); renderList(); });
  }

  function failureOutcome(npc, choice, cost){
    var t=String(choice.t||'').toLowerCase();
    var pts=Number(choice.failPts);
    if(!isFinite(pts)){
      // По смыслу ответа: осторожность/отказ чаще воспринимаются как рассудительность,
      // а уклонение от серьёзного дела может вызвать наезд.
      if(/не лезть|не вмеш|отказ|уйти|не сейчас|сначала подготов|без геройства|не боюсь|неинтерес|промолч|сменить тему|всё равно/.test(t)){
        return {pts:0,msg:'Ты не ввязался в сомнительную историю. В этот раз это выглядит как осторожность и рассудительность.'};
      }
      if(/риск|вызваться|прям|назвать|спросить|выслушать|доложить|имя|попросить|заплатить|дать|сказать/.test(t)){
        return {pts:-15,msg:'Ответ оказался неудачным. Тебя задели за излишнюю прямоту — уважение просело на 15 ⭐.'};
      }
      return {pts:cost<0?-30:-10,msg:'Неудачный разговор. Ты потерял '+Math.abs(cost<0?-30:-10)+' ⭐ опыта.'};
    }
    var msg=choice.failMsg||('Неудачный ответ: опыт потерян на '+Math.abs(pts)+' ⭐.');
    if(pts<0 && !/\d/.test(msg)) msg+=' Опыт потерян на '+Math.abs(pts)+' ⭐.';
    return {pts:pts,msg:msg.replace(/\{lost\}/g,String(Math.abs(pts)))};
  }

  function resolveLine(npc, round, choice, roundIndex){
    if(!choice)return;
    var s=st();
    if(!s){ showNpcResponse(npc,'Игра ещё загружается…',roundIndex+1); return; }
    var cost=Math.min(0,Number(choice.chifir)||0);
    if(cost<0 && (Number(s.chifir)||0)<Math.abs(cost)){
      showNpcResponse(npc,'🍵 Не хватает чефира. Для этого ответа нужно '+fmt(Math.abs(cost))+' чефира.',roundIndex);
      return;
    }
    if(!consumeTalk(npc,s)){showUrgentNpc(npc,s);return;}

    // Оплата за риск происходит сразу, а результат определяется отдельно.
    if(cost<0) s.chifir=(Number(s.chifir)||0)+cost;

    var ok=Math.random() < Math.max(0,Math.min(1,Number(choice.ok)||0));
    // Уважение зависит от результата, а не начисляется автоматически за сам выбор.
    // Удача: применяем обычную репутацию ответа. Провал: только 0, мягкий +1 за
    // достойную попытку или редкий -1 за явно плохой поступок.
    var baseRep=Number(choice.rep);
    if(!isFinite(baseRep))baseRep=0;
    var text;
    if(ok){
      if(baseRep) changeRel(npc,baseRep,s,baseRep>0?'help':baseRep<0?'fail':'');
      var rewardChifir=Math.max(0,Number(choice.rewardChifir)||0);
      var rewardPts=Number(choice.pts)||0;
      if(rewardChifir) s.chifir=(Number(s.chifir)||0)+rewardChifir;
      if(rewardPts) s.points=(Number(s.points)||0)+rewardPts;
      if(choice.power) s.power=(Number(s.power)||1)+Number(choice.power);
      s.tasks=s.tasks||{};
      s.tasks.npcSuccess=(Number(s.tasks.npcSuccess)||0)+1;
      if(choice.bugor) s.tasks.bugorSuccess=(Number(s.tasks.bugorSuccess)||0)+1;
      var riskText='';
      if(choice.risk && Math.random()<Number(choice.risk.chance||0)){
        var rr=choice.risk;
        if(rr.pts)s.points=Math.max(0,(Number(s.points)||0)+Number(rr.pts));
        if(rr.chifir)s.chifir=Math.max(0,(Number(s.chifir)||0)+Number(rr.chifir));
        if(rr.term){
          s.sentence=s.sentence||{};
          s.sentence.extraDays=(Number(s.sentence.extraDays)||0)+Number(rr.term);
          s.termExtraDays=(Number(s.termExtraDays)||0)+Number(rr.term);
        }
        changeRel(npc,Number(rr.rep)||0,s,(Number(rr.rep)||0)<0?'fail':(Number(rr.rep)||0)>0?'save':'');
        riskText=' '+(rr.msg||'Ситуация обернулась неприятно.');
        // Только при уже случившемся провале рискованной ситуации возможна редкая потеря оружия.
        // Базовый шанс строго 5%, независимо от уровня отношений.
        if(rr.weaponLoss!==false){
          var weaponLossText=rareWeaponLossOnFailure(s);
          if(weaponLossText)riskText+=weaponLossText;
        }
      }
      var dropText=dropRoll(npc,choice,s);
      text=(npc.icon||'')+' '+(choice.msg||'Получилось.')+riskText+dropText;
    }else{
      var outcome=failureOutcome(npc,choice,cost);
      var failRep=Number(choice.failRep);
      if(!isFinite(failRep)){
        var ct=String(choice.t||'').toLowerCase();
        if(baseRep<0){
          failRep=-1;
        }else if(baseRep>0 && /помог|провед|принес|принести|узнаю|провер|подготов|впис|вызов|держ|сделаю|попроб|договор|предупред|выясн|займ|пойти|дать|найти|помощ|вмеш|разоб|защит|поговор|передам/.test(ct)){
          failRep=1;
        }else{
          failRep=0;
        }
      }
      if(failRep)changeRel(npc,Math.max(-1,Math.min(1,failRep)),s,failRep>0?'help':'fail');
      if(outcome.pts) s.points=Math.max(0,(Number(s.points)||0)+outcome.pts);
      if(choice.failChifir) s.chifir=Math.max(0,(Number(s.chifir)||0)+Number(choice.failChifir));
      text=(npc.icon||'')+' '+outcome.msg;
    }
    var nextRound=roundIndex+1;
    if(nextRound>=npc.dialogs.length)nextRound=0;
    talkStore(s)[npc.id+'_round']=nextRound;
    save(); ui();
    showNpcResponse(npc,text,nextRound);
  }

  function bind(){
    var btn=$('btn-more');
    if(btn && !btn.dataset.npcBarrack){
      btn.dataset.npcBarrack='1';
      btn.addEventListener('click', function(){
        // чуть позже game.more() откроет «загружаются» — заменим
        setTimeout(renderList, 30);
        setTimeout(renderList, 120);
      }, true);
    }
    // если кто-то открыл заглушку — подменим
    var overlay=$('modal-overlay');
    if(overlay && !overlay.dataset.npcObs){
      overlay.dataset.npcObs='1';
      new MutationObserver(function(){
        var c=$('modal-content');
        if(!c)return;
        var t=c.textContent||'';
        if(t.indexOf('Персонажи барака загружаются')>=0){
          renderList();
        }
      }).observe(overlay,{childList:true,subtree:true});
    }
  }

  window.openBarrack=renderList;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  console.log('[npc-barrack] v4.0 relationships ready');
})();
