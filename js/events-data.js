const TODAY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

// Eventy posortowane wg daty rozpoczęcia
const EVENTS = [
  { id:1,  dateFrom:'2026-06-17', dateTo:'2026-06-20', city:'Warszawa',    mall:'Promenada',              type:'Make Up Corner',      store:'086', cat:'A'  },
  { id:2,  dateFrom:'2026-06-24', dateTo:'2026-06-27', city:'Poznań',      mall:'Posnania',               type:'Make Up Corner',      store:'133', cat:'A'  },
  { id:3,  dateFrom:'2026-06-25', dateTo:'2026-06-27', city:'Wrocław',     mall:'Galeria Dominikańska',   type:'Beauty Street Pop Up',store:'001', cat:'A'  },
  { id:4,  dateFrom:'2026-07-01', dateTo:'2026-07-04', city:'Szczecin',    mall:'Galaxy Centrum',         type:'Make Up Corner',      store:'011', cat:'A+' },
  { id:5,  dateFrom:'2026-07-02', dateTo:'2026-07-04', city:'Warszawa',    mall:'Westfield Mokotów',      type:'Beauty Street Pop Up',store:'015', cat:'A+' },
  { id:6,  dateFrom:'2026-07-08', dateTo:'2026-07-11', city:'Kielce',      mall:'Galeria Echo',           type:'Make Up Corner',      store:'008', cat:'A'  },
  { id:7,  dateFrom:'2026-07-09', dateTo:'2026-07-11', city:'Łódź',        mall:'Manufaktura',            type:'Beauty Street Pop Up',store:'013', cat:'A+' },
  { id:8,  dateFrom:'2026-07-15', dateTo:'2026-07-18', city:'Toruń',       mall:'Galeria Copernicus',     type:'Make Up Corner',      store:'023', cat:'A'  },
  { id:9,  dateFrom:'2026-07-16', dateTo:'2026-07-18', city:'Zielona Góra',mall:'Focus Mall',             type:'Beauty Street Pop Up',store:'043', cat:'A'  },
  { id:10, dateFrom:'2026-07-22', dateTo:'2026-07-25', city:'Leszno',      mall:'Galeria Leszno',         type:'Make Up Corner',      store:'095', cat:'A'  },
  { id:11, dateFrom:'2026-07-23', dateTo:'2026-07-25', city:'Olsztyn',     mall:'Galeria Warmińska',      type:'Beauty Street Pop Up',store:'119', cat:'A'  },
  { id:12, dateFrom:'2026-07-29', dateTo:'2026-08-01', city:'Kraków',      mall:'Bonarka City Center',    type:'Make Up Corner',      store:'075', cat:'A+' },
  { id:13, dateFrom:'2026-07-30', dateTo:'2026-08-01', city:'Wrocław',     mall:'Magnolia Park',          type:'Beauty Street Pop Up',store:'035', cat:'A+' },
  { id:14, dateFrom:'2026-08-05', dateTo:'2026-08-08', city:'Warszawa',    mall:'Westfield Arkadia',      type:'Make Up Corner',      store:'018', cat:'A+' },
  { id:15, dateFrom:'2026-08-06', dateTo:'2026-08-08', city:'Katowice',    mall:'Silesia City Center',    type:'Beauty Street Pop Up',store:'024', cat:'A+' },
  { id:16, dateFrom:'2026-08-19', dateTo:'2026-08-22', city:'Radom',       mall:'Galeria Słoneczna',      type:'Make Up Corner',      store:'090', cat:'A'  },
  { id:17, dateFrom:'2026-08-20', dateTo:'2026-08-22', city:'Częstochowa', mall:'Galeria Jurajska',       type:'Beauty Street Pop Up',store:'074', cat:'A'  },
  { id:18, dateFrom:'2026-08-26', dateTo:'2026-08-29', city:'Nowy Sącz',   mall:'Galeria Trzy Korony',    type:'Make Up Corner',      store:'120', cat:'A'  },
  { id:19, dateFrom:'2026-08-27', dateTo:'2026-08-29', city:'Białystok',   mall:'Alfa',                   type:'Beauty Street Pop Up',store:'054', cat:'A'  },
];

// x = (lon - 13.8) / 10.4 * 490 + 5   (cos52° Mercator correction)
// y = (55.0 - lat) / 6.1  * 467 + 5
const CITIES = [
  { id:'warszawa',    name:'Warszawa',     cx:344.7, cy:217.1 },
  { id:'krakow',      name:'Kraków',       cx:294.3, cy:383.2 },
  { id:'wroclaw',     name:'Wrocław',      cx:157.2, cy:302.8 },
  { id:'poznan',      name:'Poznań',       cx:152.5, cy:203.3 },
  { id:'gdansk',      name:'Gdańsk',       cx:233.5, cy:54.8  },
  { id:'gdynia',      name:'Gdynia',       cx:227.9, cy:41.7  },
  { id:'lodz',        name:'Łódź',         cx:271.7, cy:252.3 },
  { id:'szczecin',    name:'Szczecin',     cx:40.3,  cy:125.2 },
  { id:'katowice',    name:'Katowice',     cx:250.9, cy:367.9 },
  { id:'lublin',      name:'Lublin',       cx:418.2, cy:292.1 },
  { id:'bialystok',   name:'Białystok',    cx:445.5, cy:148.2 },
  { id:'rzeszow',     name:'Rzeszów',      cx:391.3, cy:384.7 },
  { id:'bydgoszcz',   name:'Bydgoszcz',    cx:202.9, cy:148.9 },
  { id:'torun',       name:'Toruń',        cx:231.2, cy:157.3 },
  { id:'olsztyn',     name:'Olsztyn',      cx:319.7, cy:98.4  },
  { id:'kielce',      name:'Kielce',       cx:326.8, cy:321.2 },
  { id:'czestochowa', name:'Częstochowa',  cx:255.7, cy:325.8 },
  { id:'zielonagora', name:'Zielona Góra', cx:85.6,  cy:239.3 },
  { id:'leszno',      name:'Leszno',       cx:136.0, cy:246.2 },
  { id:'radom',       name:'Radom',        cx:351.3, cy:280.6 },
  { id:'nowysacz',    name:'Nowy Sącz',    cx:331.0, cy:416.9 },
];
