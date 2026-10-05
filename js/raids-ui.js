/* raids-ui v4.80 — weapon bonus dmg */
'use strict';
(function(){
  function $(id){ return document.getElementById(id); }
  var FIGHTERS=[
    {id:'petrovich',name:'Петрович',hp:1500,unlock:0},
    {id:'vtirach',name:'Втирач',hp:2200,unlock:1},
    {id:'mafioznik',name:'Мафиозник',hp:3000,unlock:2},
    {id:'mongol',name:'Монгол',hp:4000,unlock:3},
    {id:'glaz',name:'Глаз',hp:5500,unlock:4},
    {id:'krest',name:'Крест',hp:7500,unlock:5},
    {id:'psikh',name:'Псих',hp:10000,unlock:6}
  ];
  var PORTRAIT={
    petrovich:'./assets/raids/fighters/petrovich1.webp',
    vtirach:'./assets/raids/fighters/Vtirach1.webp',
    mafioznik:'./assets/raids/fighters/mafioznik_hit_1.webp',
    mongol:'./assets/raids/fighters/Mongol1.webp',
    glaz:'./assets/raids/fighters/Glaz1.webp',
    krest:'./assets/raids/fighters/Crest%20(1).webp',
    psikh:'./assets/raids/fighters/Psish1%20(1).webp'
  };
  var IDLE={
    petrovich:'./assets/raids/fighters/petrovich.webm',
    vtirach:'./assets/raids/fighters/Vtirach.webm',
    mafioznik:'./assets/raids/fighters/mafioznik_idle.webm',
    mongol:'./assets/raids/fighters/Mongol.webm',
    glaz:'./assets/raids/fighters/Glaz.webm',
    krest:'./assets/raids/fighters/krest.webm',
    psikh:'./assets/raids/fighters/Psish.webm'
  };
  var HIT={
    petrovich:['./assets/raids/fighters/petrovich1.webp','./assets/raids/fighters/petrovich2.webp','./assets/raids/fighters/petrovich3.webp','./assets/raids/fighters/petrovich4.webp'],
    vtirach:['./assets/raids/fighters/Vtirach1.webp','./assets/raids/fighters/Vtirach2.webp','./assets/raids/fighters/Vtirach3.webp','./assets/raids/fighters/Vtirach4.webp'],
    mafioznik:['./assets/raids/fighters/mafioznik_hit_1.webp','./assets/raids/fighters/mafioznik_hit_2.webp','./assets/raids/fighters/mafioznik_hit_3.webp','./assets/raids/fighters/mafioznik_hit_4.webp'],
    mongol:['./assets/raids/fighters/Mongol1.webp','./assets/raids/fighters/Mongol2.webp','./assets/raids/fighters/Mongol3.webp','./assets/raids/fighters/Mongol4.webp'],
    glaz:['./assets/raids/fighters/Glaz1.webp','./assets/raids/fighters/Glaz2.webp','./assets/raids/fighters/Glaz3.webp','./assets/raids/fighters/Glaz4.webp'],
    krest:['./assets/raids/fighters/Crest%20(1).webp','./assets/raids/fighters/Crest%20(2).webp','./assets/raids/fighters/Crest%20(3).webp','./assets/raids/fighters/Crest%20(4).webp','./assets/raids/fighters/Crest%20(5).webp'],
    psikh:['./assets/raids/fighters/Psish1%20(1).webp','./assets/raids/fighters/Psish1%20(2).webp','./assets/raids/fighters/Psish1%20(3).webp','./assets/raids/fighters/Psish1%20(4).webp','./assets/raids/fighters/Psish1%20(5).webp']
  };
