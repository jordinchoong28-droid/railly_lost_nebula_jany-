import { StationData, NetworkEdge, DisruptionAlert, TrainStatus, MRTLineCode, PlannedMaintenanceEvent } from '../types';
import { ADDITIONAL_STATIONS, ADDITIONAL_EDGES } from './allSingaporeStations';

const ALL_STATIONS_RAW: Record<string, StationData> = {
  'admiralty': {
    id: 'admiralty',
    name: 'Admiralty',
    nameZh: '海军部',
    nameMs: 'Admiralty',
    nameTa: 'அட்மிரல்டி',
    nameMy: 'အက်ဒ်မီရယ်တီ',
    codes: ['NS10'],
    lines: ['NSL'],
    x: 290, y: 110,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B'],
      averageDecibels: 66,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'aljunied': {
    id: 'aljunied',
    name: 'Aljunied',
    nameZh: '阿裕尼',
    nameMs: 'Aljunied',
    nameTa: 'அல்ஜூனிட்',
    nameMy: 'အယ်လ်ဂျူနိုက်',
    codes: ['EW9'],
    lines: ['EWL'],
    x: 430, y: 320,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Geylang Rd)'],
      averageDecibels: 71,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'ang-mo-kio': {
    id: 'ang-mo-kio',
    name: 'Ang Mo Kio',
    nameZh: '宏茂桥',
    nameMs: 'Ang Mo Kio',
    nameTa: 'ஆங் மோ கியோ',
    nameMy: 'အန်းမိုကီယို',
    codes: ['NS16'],
    lines: ['NSL'],
    x: 340, y: 220,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C (Underpass)'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit D'],
      averageDecibels: 78,
      wheelchairBoardingDoors: [2, 4]
    }
  },
  'bayfront': {
    id: 'bayfront',
    name: 'Bayfront',
    nameZh: '海湾舫',
    nameMs: 'Bayfront',
    nameTa: 'பேஃபிரண்ட்',
    nameMy: 'ဘေးဖရန့်',
    codes: ['DT16', 'CE1'],
    lines: ['DTL', 'CCL'],
    x: 375, y: 440,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit B (Gardens by the Bay)', 'Exit E (MBS)'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Meadow Link)'],
      averageDecibels: 68,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'bayshore': {
    id: 'bayshore',
    name: 'Bayshore',
    nameZh: '贝雅士',
    nameMs: 'Bayshore',
    nameTa: 'பேஷோர்',
    nameMy: 'ဘေးရှိုး',
    codes: ['TE29'],
    lines: ['TEL'],
    x: 520, y: 390,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit 1', 'Exit 2', 'Exit 3'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 3'],
      averageDecibels: 60,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'beauty-world': {
    id: 'beauty-world',
    name: 'Beauty World',
    nameZh: '美世界',
    nameMs: 'Beauty World',
    nameTa: 'பியூட்டி வேர்ல்ட்',
    nameMy: 'ဘျူးတီးဝေါလ်',
    codes: ['DT5'],
    lines: ['DTL'],
    x: 230, y: 270,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Jalan Jurong Kechil)'],
      averageDecibels: 65,
      wheelchairBoardingDoors: [2]
    }
  },
  'bedok': {
    id: 'bedok',
    name: 'Bedok',
    nameZh: '勿洛',
    nameMs: 'Bedok',
    nameTa: 'பெடோக்',
    nameMy: 'ဘီဒေါ့ခ်',
    codes: ['EW5'],
    lines: ['EWL'],
    x: 480, y: 300,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B'],
      averageDecibels: 76,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'bishan': {
    id: 'bishan',
    name: 'Bishan',
    nameZh: '碧山',
    nameMs: 'Bishan',
    nameTa: 'பீஷான்',
    nameMy: 'ဘီရှန်',
    codes: ['NS17', 'CC15'],
    lines: ['NSL', 'CCL'],
    x: 340, y: 250,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit D', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Bishan St 14)'],
      averageDecibels: 82,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'boon-lay': {
    id: 'boon-lay',
    name: 'Boon Lay',
    nameZh: '文礼',
    nameMs: 'Boon Lay',
    nameTa: 'பூன் லே',
    nameMy: 'ဘွန်းလေး',
    codes: ['EW27'],
    lines: ['EWL'],
    x: 100, y: 340,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Jurong Point 2 Quiet Walk)'],
      averageDecibels: 79,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'botanic-gardens': {
    id: 'botanic-gardens',
    name: 'Botanic Gardens',
    nameZh: '植物园',
    nameMs: 'Botanic Gardens',
    nameTa: 'போட்டானிக் கார்டன்ஸ்',
    nameMy: 'ဘိုတန်နစ်ဂါးဒန်းစ်',
    codes: ['CC19', 'DT9'],
    lines: ['CCL', 'DTL'],
    x: 270, y: 300,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A (Eco Garden)', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit A (Botanic Nature Link)'],
      averageDecibels: 62,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'bugis': {
    id: 'bugis',
    name: 'Bugis',
    nameZh: '武吉士',
    nameMs: 'Bugis',
    nameTa: 'பூகிஸ்',
    nameMy: 'ဘူဂစ်စ်',
    codes: ['EW12', 'DT14'],
    lines: ['EWL', 'DTL'],
    x: 370, y: 370,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit B', 'Exit C', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit D (Tan Quee Lan St)'],
      averageDecibels: 80,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'bukit-panjang': {
    id: 'bukit-panjang',
    name: 'Bukit Panjang',
    nameZh: '武吉班让',
    nameMs: 'Bukit Panjang',
    nameTa: 'புக்கிட் பாஞ்சாங்',
    nameMy: 'ဘူကစ်ပန်ဂျန်း',
    codes: ['DT1', 'BP6'],
    lines: ['DTL', 'BPLRT'],
    x: 180, y: 180,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B'],
      averageDecibels: 72,
      wheelchairBoardingDoors: [1, 3]
    }
  },
  'buona-vista': {
    id: 'buona-vista',
    name: 'Buona Vista',
    nameZh: '波那维斯达',
    nameMs: 'Buona Vista',
    nameTa: 'புவனா விஸ்டா',
    nameMy: 'ဘိုနာဗစ်စတာ',
    codes: ['EW21', 'CC22'],
    lines: ['EWL', 'CCL'],
    x: 230, y: 370,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Metropolis Link)'],
      averageDecibels: 75,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'caldecott': {
    id: 'caldecott',
    name: 'Caldecott',
    nameZh: '加利谷',
    nameMs: 'Caldecott',
    nameTa: 'கால்டிகாட்',
    nameMy: 'ကယ်လ်ဒီကော့တ်',
    codes: ['CC17', 'TE9'],
    lines: ['CCL', 'TEL'],
    x: 300, y: 270,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit 1', 'Exit 2', 'Exit 4'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 4 (Toa Payoh Rise)'],
      averageDecibels: 64,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'changi-airport': {
    id: 'changi-airport',
    name: 'Changi Airport',
    nameZh: '樟宜机场',
    nameMs: 'Changi Airport',
    nameTa: 'சாங்கி விமான நிலையம்',
    nameMy: 'ချန်ဂီလေဆိပ်',
    codes: ['CG2'],
    lines: ['EWL'],
    x: 620, y: 310,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Terminal 2 Link', 'Terminal 3 Link'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Terminal 3 Mezzanine Walk'],
      averageDecibels: 68,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'chinatown': {
    id: 'chinatown',
    name: 'Chinatown',
    nameZh: '牛车水',
    nameMs: 'Chinatown',
    nameTa: 'சைனாடவுன்',
    nameMy: 'တရုတ်တန်း (ချိုင်းနားတောင်း)',
    codes: ['NE4', 'DT19'],
    lines: ['NEL', 'DTL'],
    x: 320, y: 440,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit E (Hong Lim Park)'],
      averageDecibels: 78,
      wheelchairBoardingDoors: [2, 4]
    }
  },
  'choa-chu-kang': {
    id: 'choa-chu-kang',
    name: 'Choa Chu Kang',
    nameZh: '蔡厝港',
    nameMs: 'Choa Chu Kang',
    nameTa: 'சுவா சூ காங்',
    nameMy: 'ချိုချူကန်း',
    codes: ['NS4', 'BP1'],
    lines: ['NSL', 'BPLRT'],
    x: 150, y: 220,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Park Connector)'],
      averageDecibels: 77,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'city-hall': {
    id: 'city-hall',
    name: 'City Hall',
    nameZh: '政府大厦',
    nameMs: 'City Hall',
    nameTa: 'நகர மண்டபம்',
    nameMy: 'စီးတီးဟော',
    codes: ['NS25', 'EW13'],
    lines: ['NSL', 'EWL'],
    x: 350, y: 410,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (St Andrew Cathedral)'],
      averageDecibels: 81,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'clementi': {
    id: 'clementi',
    name: 'Clementi',
    nameZh: '金文泰',
    nameMs: 'Clementi',
    nameTa: 'கிளிமெண்டி',
    nameMy: 'ကလီမန်တီ',
    codes: ['EW23'],
    lines: ['EWL'],
    x: 180, y: 350,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Clementi Ave 3)'],
      averageDecibels: 74,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'dhoby-ghaut': {
    id: 'dhoby-ghaut',
    name: 'Dhoby Ghaut',
    nameZh: '多美歌',
    nameMs: 'Dhoby Ghaut',
    nameTa: 'தோபி காட்',
    nameMy: 'ဒိုဘီဂေါတ်',
    codes: ['NS24', 'NE6', 'CC1'],
    lines: ['NSL', 'NEL', 'CCL'],
    x: 335, y: 370,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Istana Park link)'],
      averageDecibels: 84,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'downtown': {
    id: 'downtown',
    name: 'Downtown',
    nameZh: '市中心',
    nameMs: 'Downtown',
    nameTa: 'டவுன்டவுன்',
    nameMy: 'ဒေါင်းတောင်း',
    codes: ['DT17'],
    lines: ['DTL'],
    x: 350, y: 460,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Marina Bay Link Mall)'],
      averageDecibels: 67,
      wheelchairBoardingDoors: [2]
    }
  },
  'expo': {
    id: 'expo',
    name: 'Expo',
    nameZh: '博览',
    nameMs: 'Expo',
    nameTa: 'எக்ஸ்போ',
    nameMy: 'အိတ်စ်ပို',
    codes: ['DT35', 'CG1'],
    lines: ['DTL', 'EWL'],
    x: 580, y: 320,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Changi City Point side)'],
      averageDecibels: 68,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'harbourfront': {
    id: 'harbourfront',
    name: 'HarbourFront',
    nameZh: '港湾',
    nameMs: 'HarbourFront',
    nameTa: 'ஹார்பர்ஃபிரண்ட்',
    nameMy: 'ဆိပ်ကမ်းရှေ့ (ဟာဘာဖရန့်)',
    codes: ['NE1', 'CC29'],
    lines: ['NEL', 'CCL'],
    x: 270, y: 490,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit B (Vivocity)', 'Exit C', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (HarbourFront Centre quiet path)'],
      averageDecibels: 80,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'havelock': {
    id: 'havelock',
    name: 'Havelock',
    nameZh: '合乐',
    nameMs: 'Havelock',
    nameTa: 'ஹேவ்லாக்',
    nameMy: 'ဟေ့ဗ်လော့ခ်',
    codes: ['TE16'],
    lines: ['TEL'],
    x: 300, y: 420,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit 1', 'Exit 2', 'Exit 3'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 2 (Zion Rd - Low Sensory)'],
      averageDecibels: 61,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'jurong-east': {
    id: 'jurong-east',
    name: 'Jurong East',
    nameZh: '裕廊东',
    nameMs: 'Jurong East',
    nameTa: 'ஜூரோங் கிழக்கு',
    nameMy: 'ဂျူရောင်းအရှေ့',
    codes: ['NS1', 'EW24'],
    lines: ['NSL', 'EWL'],
    x: 150, y: 320,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit D (Westgate 2F bridge)'],
      averageDecibels: 85,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'little-india': {
    id: 'little-india',
    name: 'Little India',
    nameZh: '小印度',
    nameMs: 'Little India',
    nameTa: 'லிட்டில் இந்தியா',
    nameMy: 'လစ်တဲလ်အိန္ဒိယ',
    codes: ['NE7', 'DT12'],
    lines: ['NEL', 'DTL'],
    x: 345, y: 350,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Race Course Rd)'],
      averageDecibels: 79,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'macpherson': {
    id: 'macpherson',
    name: 'MacPherson',
    nameZh: '麦波申',
    nameMs: 'MacPherson',
    nameTa: 'மெக்பர்சன்',
    nameMy: 'မက်ဖာဆန်',
    codes: ['CC10', 'DT26'],
    lines: ['CCL', 'DTL'],
    x: 420, y: 280,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Circuit Rd)'],
      averageDecibels: 69,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'marina-bay': {
    id: 'marina-bay',
    name: 'Marina Bay',
    nameZh: '滨海湾',
    nameMs: 'Marina Bay',
    nameTa: 'மெரினா பே',
    nameMy: 'မာရီနာဘေး',
    codes: ['NS27', 'TE20', 'CE2'],
    lines: ['NSL', 'TEL', 'CCL'],
    x: 350, y: 480,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit 1'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 1 (Marina View Link)'],
      averageDecibels: 70,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'newton': {
    id: 'newton',
    name: 'Newton',
    nameZh: '纽顿',
    nameMs: 'Newton',
    nameTa: 'நியூட்டன்',
    nameMy: 'နယူတန်',
    codes: ['NS21', 'DT11'],
    lines: ['NSL', 'DTL'],
    x: 310, y: 330,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Scotts Rd)'],
      averageDecibels: 73,
      wheelchairBoardingDoors: [2, 4]
    }
  },
  'orchard': {
    id: 'orchard',
    name: 'Orchard',
    nameZh: '乌节',
    nameMs: 'Orchard',
    nameTa: 'ஆர்ச்சர்ட்',
    nameMy: 'အော်ချဒ်',
    codes: ['NS22', 'TE14'],
    lines: ['NSL', 'TEL'],
    x: 300, y: 360,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit 1', 'Exit 3', 'Exit 7'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 3 (Paterson Rd calm link)'],
      averageDecibels: 83,
      wheelchairBoardingDoors: [2, 3, 4]
    }
  },
  'outram-park': {
    id: 'outram-park',
    name: 'Outram Park',
    nameZh: '欧南园',
    nameMs: 'Outram Park',
    nameTa: 'அவுட்ராம் பார்க்',
    nameMy: 'အောက်ထရမ်ပတ်ခ်',
    codes: ['EW16', 'NE3', 'TE17'],
    lines: ['EWL', 'NEL', 'TEL'],
    x: 290, y: 440,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit 1', 'Exit 3', 'Exit 7', 'Exit 8'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 8 (SGH underpass quiet lane)'],
      averageDecibels: 81,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'pasir-ris': {
    id: 'pasir-ris',
    name: 'Pasir Ris',
    nameZh: '巴西立',
    nameMs: 'Pasir Ris',
    nameTa: 'பாசிர் ரிஸ்',
    nameMy: 'ပါစီးရစ်စ်',
    codes: ['EW1'],
    lines: ['EWL'],
    x: 570, y: 230,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Pasir Ris Town Park)'],
      averageDecibels: 72,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'paya-lebar': {
    id: 'paya-lebar',
    name: 'Paya Lebar',
    nameZh: '巴耶利峇',
    nameMs: 'Paya Lebar',
    nameTa: 'பாய லேபார்',
    nameMy: 'ပါယာလဲဘား',
    codes: ['EW8', 'CC9'],
    lines: ['EWL', 'CCL'],
    x: 430, y: 300,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit E (PLQ Mall Garden)'],
      averageDecibels: 80,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'punggol': {
    id: 'punggol',
    name: 'Punggol',
    nameZh: '榜鹅',
    nameMs: 'Punggol',
    nameTa: 'பொங்கோல்',
    nameMy: 'ပွန်ဂိုး',
    codes: ['NE17', 'PTC'],
    lines: ['NEL', 'PGLRT'],
    x: 480, y: 150,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Waterway Point East)'],
      averageDecibels: 74,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'raffles-place': {
    id: 'raffles-place',
    name: 'Raffles Place',
    nameZh: '莱佛士坊',
    nameMs: 'Raffles Place',
    nameTa: 'ராஃபிள்ஸ் பிளேஸ்',
    nameMy: 'ရက်ဖဲလ်စ်ပလေးစ်',
    codes: ['NS26', 'EW14'],
    lines: ['NSL', 'EWL'],
    x: 340, y: 440,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit D (Battery Rd)'],
      averageDecibels: 83,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'sengkang': {
    id: 'sengkang',
    name: 'Sengkang',
    nameZh: '盛港',
    nameMs: 'Sengkang',
    nameTa: 'செங்காங்',
    nameMy: 'ဆန်ကန်း',
    codes: ['NE16', 'STC'],
    lines: ['NEL', 'SKLRT'],
    x: 460, y: 180,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit D'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit D (Compass One rear link)'],
      averageDecibels: 76,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'serangoon': {
    id: 'serangoon',
    name: 'Serangoon',
    nameZh: '实龙岗',
    nameMs: 'Serangoon',
    nameTa: 'சிராங்கூன்',
    nameMy: 'ဆာရန်ဂွန်း',
    codes: ['NE12', 'CC13'],
    lines: ['NEL', 'CCL'],
    x: 390, y: 250,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit E', 'Exit G'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Serangoon Ave 2)'],
      averageDecibels: 82,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'somerset': {
    id: 'somerset',
    name: 'Somerset',
    nameZh: '索美塞',
    nameMs: 'Somerset',
    nameTa: 'சாமர்செட்',
    nameMy: 'ဆာမာဆက်တ်',
    codes: ['NS23'],
    lines: ['NSL'],
    x: 320, y: 380,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Orchard Central rear)'],
      averageDecibels: 78,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'tampines': {
    id: 'tampines',
    name: 'Tampines',
    nameZh: '淡滨尼',
    nameMs: 'Tampines',
    nameTa: 'தெம்பனிஸ்',
    nameMy: 'တန်ပနီးစ်',
    codes: ['EW2', 'DT32'],
    lines: ['EWL', 'DTL'],
    x: 540, y: 260,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit E', 'Exit F'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit F (Tampines 1 Walkway)'],
      averageDecibels: 79,
      wheelchairBoardingDoors: [2, 3, 4]
    }
  },
  'tiong-bahru': {
    id: 'tiong-bahru',
    name: 'Tiong Bahru',
    nameZh: '中峇鲁',
    nameMs: 'Tiong Bahru',
    nameTa: 'தியோங் பாரு',
    nameMy: 'တီယွန်ဘာရူး',
    codes: ['EW17'],
    lines: ['EWL'],
    x: 270, y: 430,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Tiong Bahru Rd quiet lane)'],
      averageDecibels: 74,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'woodlands': {
    id: 'woodlands',
    name: 'Woodlands',
    nameZh: '兀兰',
    nameMs: 'Woodlands',
    nameTa: 'ஊட்லண்ட்ஸ்',
    nameMy: 'ဝုဒ်လန်းစ်',
    codes: ['NS9', 'TE2'],
    lines: ['NSL', 'TEL'],
    x: 240, y: 90,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit 1', 'Exit 3', 'Exit 5'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit 5 (Woodlands Square quiet corridor)'],
      averageDecibels: 76,
      wheelchairBoardingDoors: [2, 3, 4]
    }
  },
  'yishun': {
    id: 'yishun',
    name: 'Yishun',
    nameZh: '义顺',
    nameMs: 'Yishun',
    nameTa: 'யீஷூன்',
    nameMy: 'ရီရွှန်း',
    codes: ['NS13'],
    lines: ['NSL'],
    x: 310, y: 150,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit C', 'Exit E'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit E (Northpoint quiet wing)'],
      averageDecibels: 78,
      wheelchairBoardingDoors: [3, 4]
    }
  },
  'one-north': {
    id: 'one-north',
    name: 'one-north',
    nameZh: '纬壹',
    nameMs: 'one-north',
    nameTa: 'ஒன்-நோர்த்',
    nameMy: 'ဝမ်းနော့သ်',
    codes: ['CC23'],
    lines: ['CCL'],
    x: 235, y: 410,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A (Fusionopolis)', 'Exit B (Biopolis)'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Biopolis covered link)'],
      averageDecibels: 64,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'kent-ridge': {
    id: 'kent-ridge',
    name: 'Kent Ridge',
    nameZh: '肯特岗',
    nameMs: 'Kent Ridge',
    nameTa: 'கென்ட் ரிட்ஜ்',
    nameMy: 'ကန့်ရစ်ဒ်',
    codes: ['CC24'],
    lines: ['CCL'],
    x: 245, y: 430,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A (NUH)', 'Exit B'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B'],
      averageDecibels: 68,
      wheelchairBoardingDoors: [2, 3]
    }
  },
  'telok-ayer': {
    id: 'telok-ayer',
    name: 'Telok Ayer',
    nameZh: '直落亚逸',
    nameMs: 'Telok Ayer',
    nameTa: 'தெலுக் ஆயர்',
    nameMy: 'တီလွတ်ခ်အာယာ',
    codes: ['DT18'],
    lines: ['DTL'],
    x: 340, y: 445,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit B (Cross St)'],
      averageDecibels: 67,
      wheelchairBoardingDoors: [2]
    }
  },
  'tampines-east': {
    id: 'tampines-east',
    name: 'Tampines East',
    nameZh: '淡滨尼东',
    nameMs: 'Tampines East',
    nameTa: 'தெம்பனிஸ் கிழக்கு',
    nameMy: 'တန်ပနီးစ်အရှေ့',
    codes: ['DT33'],
    lines: ['DTL'],
    x: 555, y: 250,
    accessibility: {
      liftAccessible: true,
      rampExits: ['Exit A', 'Exit B', 'Exit C'],
      tactilePaving: true,
      wideGantry: true,
      quietExits: ['Exit C (Tampines St 21)'],
      averageDecibels: 65,
      wheelchairBoardingDoors: [2]
    }
  },

  // Bukit Panjang LRT (BPLRT) Stations
  'south-view': {
    id: 'south-view',
    name: 'South View',
    nameZh: '南 view / 南景',
    nameMs: 'South View',
    nameTa: 'சவுத் வியூ',
    nameMy: 'ဆောက်ဗျူး',
    codes: ['BP2'],
    lines: ['BPLRT'],
    x: 165, y: 195,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 2'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'keat-hong': {
    id: 'keat-hong',
    name: 'Keat Hong',
    nameZh: '吉丰',
    nameMs: 'Keat Hong',
    nameTa: 'கீட் ஹோங்',
    nameMy: 'ကီးဟောင်',
    codes: ['BP3'],
    lines: ['BPLRT'],
    x: 160, y: 185,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 63, wheelchairBoardingDoors: [1] }
  },
  'teck-whye': {
    id: 'teck-whye',
    name: 'Teck Whye',
    nameZh: '德惠',
    nameMs: 'Teck Whye',
    nameTa: 'டெக் வாய்',
    nameMy: 'တက်ဝှိုင်',
    codes: ['BP4'],
    lines: ['BPLRT'],
    x: 165, y: 175,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 64, wheelchairBoardingDoors: [1] }
  },
  'phoenix': {
    id: 'phoenix',
    name: 'Phoenix',
    nameZh: '凤凰',
    nameMs: 'Phoenix',
    nameTa: 'ஃபீனிக்ஸ்',
    nameMy: 'ဖီးနစ်',
    codes: ['BP5'],
    lines: ['BPLRT'],
    x: 172, y: 170,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 61, wheelchairBoardingDoors: [1] }
  },
  'petir': {
    id: 'petir',
    name: 'Petir',
    nameZh: '柏提',
    nameMs: 'Petir',
    nameTa: 'பெத்திர்',
    nameMy: 'ပီတီယာ',
    codes: ['BP7'],
    lines: ['BPLRT'],
    x: 185, y: 190,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'pending': {
    id: 'pending',
    name: 'Pending',
    nameZh: '秉定',
    nameMs: 'Pending',
    nameTa: 'பெண்டிங்',
    nameMy: 'ပန်ဒင်း',
    codes: ['BP8'],
    lines: ['BPLRT'],
    x: 190, y: 185,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 2'], averageDecibels: 63, wheelchairBoardingDoors: [1] }
  },
  'bangkit': {
    id: 'bangkit',
    name: 'Bangkit',
    nameZh: '万吉',
    nameMs: 'Bangkit',
    nameTa: 'பாங்கிட்',
    nameMy: 'ဘန်းကစ်',
    codes: ['BP9'],
    lines: ['BPLRT'],
    x: 195, y: 175,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 64, wheelchairBoardingDoors: [1] }
  },
  'fajar': {
    id: 'fajar',
    name: 'Fajar',
    nameZh: '法嘉',
    nameMs: 'Fajar',
    nameTa: 'ஃபஜார்',
    nameMy: 'ဖာဂျာ',
    codes: ['BP10'],
    lines: ['BPLRT'],
    x: 205, y: 165,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'segar': {
    id: 'segar',
    name: 'Segar',
    nameZh: '实加',
    nameMs: 'Segar',
    nameTa: 'செகார்',
    nameMy: 'ဆီဂါ',
    codes: ['BP11'],
    lines: ['BPLRT'],
    x: 205, y: 150,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 61, wheelchairBoardingDoors: [1] }
  },
  'jelapang': {
    id: 'jelapang',
    name: 'Jelapang',
    nameZh: '泽拉邦',
    nameMs: 'Jelapang',
    nameTa: 'ஜெலப்பாங்',
    nameMy: 'ဂျေလာပန်း',
    codes: ['BP12'],
    lines: ['BPLRT'],
    x: 195, y: 155,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'senja': {
    id: 'senja',
    name: 'Senja',
    nameZh: '信佳',
    nameMs: 'Senja',
    nameTa: 'செஞ்சா',
    nameMy: 'ဆန်ဂျာ',
    codes: ['BP13'],
    lines: ['BPLRT'],
    x: 185, y: 160,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 2'], averageDecibels: 63, wheelchairBoardingDoors: [1] }
  },

  // Sengkang LRT (SKLRT) Stations
  'compassvale': {
    id: 'compassvale',
    name: 'Compassvale',
    nameZh: '康埔桦',
    nameMs: 'Compassvale',
    nameTa: 'கம்பஸ்வேல்',
    nameMy: 'ကွန်ပတ်စ်ဗေးလ်',
    codes: ['SE1'],
    lines: ['SKLRT'],
    x: 440, y: 180,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'rumbia': {
    id: 'rumbia',
    name: 'Rumbia',
    nameZh: '罗美宜',
    nameMs: 'Rumbia',
    nameTa: 'ரும்பியா',
    nameMy: 'ရွမ်ဘီယာ',
    codes: ['SE2'],
    lines: ['SKLRT'],
    x: 450, y: 175,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'bakau': {
    id: 'bakau',
    name: 'Bakau',
    nameZh: '玛高',
    nameMs: 'Bakau',
    nameTa: 'பக்காவ்',
    nameMy: 'ဘာကောင်း',
    codes: ['SE3'],
    lines: ['SKLRT'],
    x: 450, y: 190,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 61, wheelchairBoardingDoors: [1] }
  },
  'kangkar': {
    id: 'kangkar',
    name: 'Kangkar',
    nameZh: '港脚',
    nameMs: 'Kangkar',
    nameTa: 'கங்கார்',
    nameMy: 'ကန်ကာ',
    codes: ['SE4'],
    lines: ['SKLRT'],
    x: 440, y: 200,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 63, wheelchairBoardingDoors: [1] }
  },
  'thanggam': {
    id: 'thanggam',
    name: 'Thanggam',
    nameZh: '丹甘',
    nameMs: 'Thanggam',
    nameTa: 'தங்கம்',
    nameMy: 'သန်းဂမ်',
    codes: ['SW4'],
    lines: ['SKLRT'],
    x: 405, y: 180,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'fernvale': {
    id: 'fernvale',
    name: 'Fernvale',
    nameZh: '芬微',
    nameMs: 'Fernvale',
    nameTa: 'ஃபெர்ன்வேல்',
    nameMy: 'ဖန်းဗေးလ်',
    codes: ['SW5'],
    lines: ['SKLRT'],
    x: 400, y: 190,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1', 'Exit 2 (Seletar Mall)'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 67, wheelchairBoardingDoors: [1] }
  },
  'layar': {
    id: 'layar',
    name: 'Layar',
    nameZh: '拉雅',
    nameMs: 'Layar',
    nameTa: 'லாயார்',
    nameMy: 'လာယာ',
    codes: ['SW6'],
    lines: ['SKLRT'],
    x: 410, y: 195,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'renjong': {
    id: 'renjong',
    name: 'Renjong',
    nameZh: '仁宗',
    nameMs: 'Renjong',
    nameTa: 'ரெஞ்சோங்',
    nameMy: 'ရန်ဂျုံ',
    codes: ['SW8'],
    lines: ['SKLRT'],
    x: 420, y: 195,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 63, wheelchairBoardingDoors: [1] }
  },

  // Punggol LRT (PGLRT) Stations
  'cove': {
    id: 'cove',
    name: 'Cove',
    nameZh: '海湾',
    nameMs: 'Cove',
    nameTa: 'கோவ்',
    nameMy: 'ကိုဗ်',
    codes: ['PE1'],
    lines: ['PGLRT'],
    x: 465, y: 140,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'meridian': {
    id: 'meridian',
    name: 'Meridian',
    nameZh: '丽园',
    nameMs: 'Meridian',
    nameTa: 'மெரிடியன்',
    nameMy: 'မရီဒီယန်',
    codes: ['PE2'],
    lines: ['PGLRT'],
    x: 475, y: 140,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 61, wheelchairBoardingDoors: [1] }
  },
  'coral-edge': {
    id: 'coral-edge',
    name: 'Coral Edge',
    nameZh: '珊瑚',
    nameMs: 'Coral Edge',
    nameTa: 'கோரல் எட்ஜ்',
    nameMy: 'ကိုရယ်လ်အက်ဒ်ဂျ်',
    codes: ['PE3'],
    lines: ['PGLRT'],
    x: 485, y: 145,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1 (Punggol Plaza)'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 66, wheelchairBoardingDoors: [1] }
  },
  'riviera': {
    id: 'riviera',
    name: 'Riviera',
    nameZh: '里维拉',
    nameMs: 'Riviera',
    nameTa: 'ரிவியரா',
    nameMy: 'ရီဗီယာရာ',
    codes: ['PE4'],
    lines: ['PGLRT'],
    x: 485, y: 135,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 61, wheelchairBoardingDoors: [1] }
  },
  'oasis': {
    id: 'oasis',
    name: 'Oasis',
    nameZh: '绿洲',
    nameMs: 'Oasis',
    nameTa: 'ஓயாசிஸ்',
    nameMy: 'အိုအေစစ်',
    codes: ['PE6'],
    lines: ['PGLRT'],
    x: 475, y: 125,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1 (Oasis Terraces Poly)'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 64, wheelchairBoardingDoors: [1] }
  },
  'damai': {
    id: 'damai',
    name: 'Damai',
    nameZh: '达迈',
    nameMs: 'Damai',
    nameTa: 'டாமாய்',
    nameMy: 'ဒါမိုင်',
    codes: ['PE7'],
    lines: ['PGLRT'],
    x: 465, y: 130,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'sam-kee': {
    id: 'sam-kee',
    name: 'Sam Kee',
    nameZh: '三记',
    nameMs: 'Sam Kee',
    nameTa: 'சாம் கீ',
    nameMy: 'ဆမ်ကီး',
    codes: ['PW1'],
    lines: ['PGLRT'],
    x: 445, y: 125,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1 (SAFRA Punggol)'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 64, wheelchairBoardingDoors: [1] }
  },
  'samudera': {
    id: 'samudera',
    name: 'Samudera',
    nameZh: '山姆',
    nameMs: 'Samudera',
    nameTa: 'சமுதேரா',
    nameMy: 'ဆာမူဒရာ',
    codes: ['PW4'],
    lines: ['PGLRT'],
    x: 440, y: 110,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1 (Northshore Plaza)'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 65, wheelchairBoardingDoors: [1] }
  },
  'sumang': {
    id: 'sumang',
    name: 'Sumang',
    nameZh: '苏芒',
    nameMs: 'Sumang',
    nameTa: 'சுமாங்',
    nameMy: 'ဆူမန်',
    codes: ['PW6'],
    lines: ['PGLRT'],
    x: 445, y: 135,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 62, wheelchairBoardingDoors: [1] }
  },
  'soo-teck': {
    id: 'soo-teck',
    name: 'Soo Teck',
    nameZh: '树德',
    nameMs: 'Soo Teck',
    nameTa: 'சூ டெக்',
    nameMy: 'ဆူတက်ခ်',
    codes: ['PW7'],
    lines: ['PGLRT'],
    x: 450, y: 140,
    accessibility: { liftAccessible: true, rampExits: ['Exit 1'], tactilePaving: true, wideGantry: true, quietExits: ['Exit 1'], averageDecibels: 63, wheelchairBoardingDoors: [1] }
  }
};

// Accurate OpenStreetMap / MasterPlan2014 GPS Coordinates & Ground Levels
const STATION_GEOMAP: Record<string, { lat: number; lng: number; groundLevel: 'UNDERGROUND' | 'ABOVEGROUND'; crowd: 'l' | 'm' | 'h'; crowd30m: 'l' | 'm' | 'h' }> = {
  'south-view': { lat: 1.3803, lng: 103.7453, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'keat-hong': { lat: 1.3786, lng: 103.7489, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'teck-whye': { lat: 1.3766, lng: 103.7537, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'phoenix': { lat: 1.3788, lng: 103.7580, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'petir': { lat: 1.3778, lng: 103.7667, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'pending': { lat: 1.3761, lng: 103.7713, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'bangkit': { lat: 1.3800, lng: 103.7727, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'fajar': { lat: 1.3839, lng: 103.7709, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'segar': { lat: 1.3878, lng: 103.7697, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'jelapang': { lat: 1.3867, lng: 103.7645, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'senja': { lat: 1.3828, lng: 103.7624, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'compassvale': { lat: 1.3945, lng: 103.9005, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'rumbia': { lat: 1.3915, lng: 103.9060, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'bakau': { lat: 1.3880, lng: 103.9054, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'kangkar': { lat: 1.3840, lng: 103.9022, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'thanggam': { lat: 1.3973, lng: 103.8757, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'fernvale': { lat: 1.3919, lng: 103.8763, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'layar': { lat: 1.3921, lng: 103.8799, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'renjong': { lat: 1.3868, lng: 103.8904, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'cove': { lat: 1.3993, lng: 103.9059, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'meridian': { lat: 1.3969, lng: 103.9089, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'coral-edge': { lat: 1.3939, lng: 103.9126, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'riviera': { lat: 1.3945, lng: 103.9161, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'oasis': { lat: 1.4023, lng: 103.9129, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'damai': { lat: 1.4052, lng: 103.9084, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'sam-kee': { lat: 1.4095, lng: 103.9048, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'samudera': { lat: 1.4158, lng: 103.9021, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'sumang': { lat: 1.4085, lng: 103.8986, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'soo-teck': { lat: 1.4053, lng: 103.9019, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'admiralty': { lat: 1.4406, lng: 103.8010, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'aljunied': { lat: 1.3164, lng: 103.8837, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'ang-mo-kio': { lat: 1.3699, lng: 103.8496, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'bayfront': { lat: 1.2829, lng: 103.8595, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'm' },
  'bayshore': { lat: 1.3125, lng: 103.9350, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'beauty-world': { lat: 1.3413, lng: 103.7758, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'bedok': { lat: 1.3240, lng: 103.9300, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'bishan': { lat: 1.3508, lng: 103.8481, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'h' },
  'boon-lay': { lat: 1.3386, lng: 103.7061, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'botanic-gardens': { lat: 1.3227, lng: 103.8158, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'bugis': { lat: 1.3005, lng: 103.8560, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'bukit-batok': { lat: 1.3490, lng: 103.7496, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'bukit-gombak': { lat: 1.3586, lng: 103.7518, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'bukit-panjang': { lat: 1.3781, lng: 103.7623, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'buona-vista': { lat: 1.3072, lng: 103.7904, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'caldecott': { lat: 1.3372, lng: 103.8395, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'changi-airport': { lat: 1.3573, lng: 103.9885, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'm' },
  'chinatown': { lat: 1.2848, lng: 103.8438, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'chinese-garden': { lat: 1.3424, lng: 103.7326, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'choa-chu-kang': { lat: 1.3853, lng: 103.7444, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'city-hall': { lat: 1.2931, lng: 103.8525, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'clarke-quay': { lat: 1.2883, lng: 103.8466, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'h' },
  'clementi': { lat: 1.3151, lng: 103.7652, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'commonwealth': { lat: 1.3025, lng: 103.7983, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'dhoby-ghaut': { lat: 1.2987, lng: 103.8461, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'dover': { lat: 1.3113, lng: 103.7786, groundLevel: 'ABOVEGROUND', crowd: 'l', crowd30m: 'l' },
  'downtown': { lat: 1.2794, lng: 103.8528, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'esplanade': { lat: 1.2934, lng: 103.8554, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'm' },
  'expo': { lat: 1.3352, lng: 103.9621, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'm' },
  'farrer-park': { lat: 1.3125, lng: 103.8544, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'm' },
  'farrer-road': { lat: 1.3175, lng: 103.8072, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'harbourfront': { lat: 1.2653, lng: 103.8214, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'havelock': { lat: 1.2885, lng: 103.8335, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'haw-par-villa': { lat: 1.2825, lng: 103.7818, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'holland-village': { lat: 1.3121, lng: 103.7963, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'jurong-east': { lat: 1.3332, lng: 103.7422, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'h' },
  'kallang': { lat: 1.3114, lng: 103.8714, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'kent-ridge': { lat: 1.2934, lng: 103.7845, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'khatib': { lat: 1.4173, lng: 103.8329, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'kranji': { lat: 1.4251, lng: 103.7621, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'labrador-park': { lat: 1.2723, lng: 103.8030, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'lakeside': { lat: 1.3442, lng: 103.7208, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'lavender': { lat: 1.3073, lng: 103.8630, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'm' },
  'little-india': { lat: 1.3068, lng: 103.8492, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'macpherson': { lat: 1.3262, lng: 103.8899, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'marina-bay': { lat: 1.2764, lng: 103.8548, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'marina-south-pier': { lat: 1.2710, lng: 103.8631, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'marsiling': { lat: 1.4326, lng: 103.7741, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'maxwell': { lat: 1.2806, lng: 103.8439, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'newton': { lat: 1.3129, lng: 103.8380, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'nicoll-highway': { lat: 1.2997, lng: 103.8636, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'novena': { lat: 1.3204, lng: 103.8438, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'one-north': { lat: 1.2996, lng: 103.7874, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'orchard': { lat: 1.3040, lng: 103.8318, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'outram-park': { lat: 1.2815, lng: 103.8395, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'pasir-panjang': { lat: 1.2762, lng: 103.7913, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'pasir-ris': { lat: 1.3730, lng: 103.9493, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'paya-lebar': { lat: 1.3178, lng: 103.8924, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'h' },
  'pioneer': { lat: 1.3376, lng: 103.6974, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'promenade': { lat: 1.2934, lng: 103.8608, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'm' },
  'punggol': { lat: 1.4050, lng: 103.9022, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'l' },
  'queenstown': { lat: 1.2946, lng: 103.8060, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'raffles-place': { lat: 1.2840, lng: 103.8515, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'redhill': { lat: 1.2896, lng: 103.8168, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'sembawang': { lat: 1.4491, lng: 103.8201, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'sengkang': { lat: 1.3916, lng: 103.8955, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'serangoon': { lat: 1.3498, lng: 103.8735, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'shenton-way': { lat: 1.2775, lng: 103.8509, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'm' },
  'simei': { lat: 1.3432, lng: 103.9533, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'somerset': { lat: 1.3004, lng: 103.8390, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'stadium': { lat: 1.3028, lng: 103.8753, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'h' },
  'tampines': { lat: 1.3532, lng: 103.9452, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'tampines-east': { lat: 1.3563, lng: 103.9547, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'tampines-west': { lat: 1.3454, lng: 103.9382, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'tanah-merah': { lat: 1.3272, lng: 103.9465, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'tanjong-pagar': { lat: 1.2766, lng: 103.8458, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'h' },
  'telok-ayer': { lat: 1.2822, lng: 103.8486, groundLevel: 'UNDERGROUND', crowd: 'm', crowd30m: 'l' },
  'telok-blangah': { lat: 1.2707, lng: 103.8097, groundLevel: 'UNDERGROUND', crowd: 'l', crowd30m: 'l' },
  'tiong-bahru': { lat: 1.2865, lng: 103.8270, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' },
  'toa-payoh': { lat: 1.3327, lng: 103.8475, groundLevel: 'UNDERGROUND', crowd: 'h', crowd30m: 'm' },
  'woodlands': { lat: 1.4368, lng: 103.7865, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'h' },
  'yew-tee': { lat: 1.3973, lng: 103.7474, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'yio-chu-kang': { lat: 1.3817, lng: 103.8449, groundLevel: 'ABOVEGROUND', crowd: 'm', crowd30m: 'l' },
  'yishun': { lat: 1.4294, lng: 103.8350, groundLevel: 'ABOVEGROUND', crowd: 'h', crowd30m: 'm' }
};

// Merge additional Singapore stations across all lines
Object.assign(ALL_STATIONS_RAW, ADDITIONAL_STATIONS);

// Augment stations with exact OpenStreetMap latitude, longitude, and groundLevel
Object.keys(ALL_STATIONS_RAW).forEach((id) => {
  const geo = STATION_GEOMAP[id] || {
    lat: ALL_STATIONS_RAW[id].lat || (1.3000 + (ALL_STATIONS_RAW[id].y - 300) * 0.0008),
    lng: ALL_STATIONS_RAW[id].lng || (103.8400 + (ALL_STATIONS_RAW[id].x - 300) * 0.0008),
    groundLevel: ALL_STATIONS_RAW[id].groundLevel || ('UNDERGROUND' as const),
    crowd: ALL_STATIONS_RAW[id].currentCrowd || ('m' as const),
    crowd30m: ALL_STATIONS_RAW[id].forecastCrowd30m || ('l' as const)
  };

  ALL_STATIONS_RAW[id].lat = geo.lat;
  ALL_STATIONS_RAW[id].lng = geo.lng;
  ALL_STATIONS_RAW[id].groundLevel = geo.groundLevel;
  ALL_STATIONS_RAW[id].currentCrowd = geo.crowd;
  ALL_STATIONS_RAW[id].forecastCrowd30m = geo.crowd30m;
});

export const ALL_STATIONS: Record<string, StationData> = ALL_STATIONS_RAW;

// Complete edge connections for key routing
export const MRT_EDGES: NetworkEdge[] = [
  ...ADDITIONAL_EDGES,
  // NSL
  { a: 'jurong-east', b: 'choa-chu-kang', line: 'NSL', time: 6, key: 'NSL:jurong-east-choa-chu-kang' },
  { a: 'choa-chu-kang', b: 'woodlands', line: 'NSL', time: 8, key: 'NSL:choa-chu-kang-woodlands' },
  { a: 'woodlands', b: 'admiralty', line: 'NSL', time: 2, key: 'NSL:admiralty-woodlands' },
  { a: 'admiralty', b: 'yishun', line: 'NSL', time: 4, key: 'NSL:admiralty-yishun' },
  { a: 'yishun', b: 'ang-mo-kio', line: 'NSL', time: 6, key: 'NSL:ang-mo-kio-yishun' },
  { a: 'ang-mo-kio', b: 'bishan', line: 'NSL', time: 3, key: 'NSL:ang-mo-kio-bishan' },
  { a: 'bishan', b: 'newton', line: 'NSL', time: 6, key: 'NSL:bishan-newton' },
  { a: 'newton', b: 'orchard', line: 'NSL', time: 2, key: 'NSL:newton-orchard' },
  { a: 'orchard', b: 'somerset', line: 'NSL', time: 2, key: 'NSL:orchard-somerset' },
  { a: 'somerset', b: 'dhoby-ghaut', line: 'NSL', time: 2, key: 'NSL:dhoby-ghaut-somerset' },
  { a: 'dhoby-ghaut', b: 'city-hall', line: 'NSL', time: 2, key: 'NSL:city-hall-dhoby-ghaut' },
  { a: 'city-hall', b: 'raffles-place', line: 'NSL', time: 2, key: 'NSL:city-hall-raffles-place' },
  { a: 'raffles-place', b: 'marina-bay', line: 'NSL', time: 2, key: 'NSL:marina-bay-raffles-place' },

  // EWL
  { a: 'boon-lay', b: 'jurong-east', line: 'EWL', time: 5, key: 'EWL:boon-lay-jurong-east' },
  { a: 'jurong-east', b: 'clementi', line: 'EWL', time: 4, key: 'EWL:clementi-jurong-east' },
  { a: 'clementi', b: 'buona-vista', line: 'EWL', time: 4, key: 'EWL:buona-vista-clementi' },
  { a: 'buona-vista', b: 'tiong-bahru', line: 'EWL', time: 7, key: 'EWL:buona-vista-tiong-bahru' },
  { a: 'tiong-bahru', b: 'outram-park', line: 'EWL', time: 3, key: 'EWL:outram-park-tiong-bahru' }, // DISRUPTED
  { a: 'outram-park', b: 'raffles-place', line: 'EWL', time: 3, key: 'EWL:outram-park-raffles-place' },
  { a: 'raffles-place', b: 'city-hall', line: 'EWL', time: 2, key: 'EWL:city-hall-raffles-place' },
  { a: 'city-hall', b: 'bugis', line: 'EWL', time: 2, key: 'EWL:bugis-city-hall' },
  { a: 'bugis', b: 'aljunied', line: 'EWL', time: 4, key: 'EWL:aljunied-bugis' },
  { a: 'aljunied', b: 'paya-lebar', line: 'EWL', time: 2, key: 'EWL:aljunied-paya-lebar' },
  { a: 'paya-lebar', b: 'bedok', line: 'EWL', time: 5, key: 'EWL:bedok-paya-lebar' },
  { a: 'bedok', b: 'tampines', line: 'EWL', time: 4, key: 'EWL:bedok-tampines' },
  { a: 'tampines', b: 'pasir-ris', line: 'EWL', time: 3, key: 'EWL:pasir-ris-tampines' },
  { a: 'bedok', b: 'expo', line: 'EWL', time: 5, key: 'EWL:bedok-expo' },
  { a: 'expo', b: 'changi-airport', line: 'EWL', time: 4, key: 'EWL:changi-airport-expo' },

  // NEL
  { a: 'harbourfront', b: 'outram-park', line: 'NEL', time: 4, key: 'NEL:harbourfront-outram-park' },
  { a: 'outram-park', b: 'chinatown', line: 'NEL', time: 2, key: 'NEL:chinatown-outram-park' },
  { a: 'chinatown', b: 'dhoby-ghaut', line: 'NEL', time: 3, key: 'NEL:chinatown-dhoby-ghaut' },
  { a: 'dhoby-ghaut', b: 'little-india', line: 'NEL', time: 2, key: 'NEL:dhoby-ghaut-little-india' },
  { a: 'little-india', b: 'serangoon', line: 'NEL', time: 6, key: 'NEL:little-india-serangoon' },
  { a: 'serangoon', b: 'sengkang', line: 'NEL', time: 7, key: 'NEL:sengkang-serangoon' },
  { a: 'sengkang', b: 'punggol', line: 'NEL', time: 2, key: 'NEL:punggol-sengkang' },

  // CCL (Includes one-north and kent-ridge)
  { a: 'dhoby-ghaut', b: 'paya-lebar', line: 'CCL', time: 9, key: 'CCL:dhoby-ghaut-paya-lebar' },
  { a: 'paya-lebar', b: 'macpherson', line: 'CCL', time: 2, key: 'CCL:macpherson-paya-lebar' },
  { a: 'macpherson', b: 'serangoon', line: 'CCL', time: 5, key: 'CCL:macpherson-serangoon' },
  { a: 'serangoon', b: 'bishan', line: 'CCL', time: 3, key: 'CCL:bishan-serangoon' },
  { a: 'bishan', b: 'caldecott', line: 'CCL', time: 3, key: 'CCL:bishan-caldecott' },
  { a: 'caldecott', b: 'botanic-gardens', line: 'CCL', time: 3, key: 'CCL:botanic-gardens-caldecott' },
  { a: 'botanic-gardens', b: 'buona-vista', line: 'CCL', time: 5, key: 'CCL:botanic-gardens-buona-vista' },
  { a: 'buona-vista', b: 'one-north', line: 'CCL', time: 2, key: 'CCL:buona-vista-one-north' },
  { a: 'one-north', b: 'kent-ridge', line: 'CCL', time: 2, key: 'CCL:kent-ridge-one-north' },
  { a: 'kent-ridge', b: 'harbourfront', line: 'CCL', time: 8, key: 'CCL:harbourfront-kent-ridge' },
  { a: 'bayfront', b: 'marina-bay', line: 'CCL', time: 3, key: 'CCL:bayfront-marina-bay' },

  // DTL (Includes tampines-east and telok-ayer)
  { a: 'bukit-panjang', b: 'beauty-world', line: 'DTL', time: 6, key: 'DTL:beauty-world-bukit-panjang' },
  { a: 'beauty-world', b: 'botanic-gardens', line: 'DTL', time: 6, key: 'DTL:beauty-world-botanic-gardens' },
  { a: 'botanic-gardens', b: 'newton', line: 'DTL', time: 3, key: 'DTL:botanic-gardens-newton' },
  { a: 'newton', b: 'little-india', line: 'DTL', time: 2, key: 'DTL:little-india-newton' },
  { a: 'little-india', b: 'bugis', line: 'DTL', time: 2, key: 'DTL:bugis-little-india' },
  { a: 'bugis', b: 'bayfront', line: 'DTL', time: 3, key: 'DTL:bayfront-bugis' },
  { a: 'bayfront', b: 'downtown', line: 'DTL', time: 2, key: 'DTL:bayfront-downtown' },
  { a: 'downtown', b: 'telok-ayer', line: 'DTL', time: 2, key: 'DTL:downtown-telok-ayer' },
  { a: 'telok-ayer', b: 'chinatown', line: 'DTL', time: 2, key: 'DTL:chinatown-telok-ayer' },
  { a: 'chinatown', b: 'macpherson', line: 'DTL', time: 9, key: 'DTL:chinatown-macpherson' },
  { a: 'macpherson', b: 'tampines', line: 'DTL', time: 9, key: 'DTL:macpherson-tampines' },
  { a: 'tampines', b: 'tampines-east', line: 'DTL', time: 2, key: 'DTL:tampines-tampines-east' },
  { a: 'tampines-east', b: 'expo', line: 'DTL', time: 3, key: 'DTL:expo-tampines-east' },

  // TEL
  { a: 'woodlands', b: 'caldecott', line: 'TEL', time: 14, key: 'TEL:caldecott-woodlands' },
  { a: 'caldecott', b: 'orchard', line: 'TEL', time: 5, key: 'TEL:caldecott-orchard' },
  { a: 'orchard', b: 'havelock', line: 'TEL', time: 3, key: 'TEL:havelock-orchard' },
  { a: 'havelock', b: 'outram-park', line: 'TEL', time: 2, key: 'TEL:havelock-outram-park' },
  { a: 'outram-park', b: 'marina-bay', line: 'TEL', time: 4, key: 'TEL:marina-bay-outram-park' },
  { a: 'marina-bay', b: 'bayshore', line: 'TEL', time: 11, key: 'TEL:bayshore-marina-bay' },

  // BPLRT (Bukit Panjang LRT)
  { a: 'choa-chu-kang', b: 'south-view', line: 'BPLRT', time: 2, key: 'BPLRT:choa-chu-kang-south-view' },
  { a: 'south-view', b: 'keat-hong', line: 'BPLRT', time: 1, key: 'BPLRT:south-view-keat-hong' },
  { a: 'keat-hong', b: 'teck-whye', line: 'BPLRT', time: 1, key: 'BPLRT:keat-hong-teck-whye' },
  { a: 'teck-whye', b: 'phoenix', line: 'BPLRT', time: 1, key: 'BPLRT:teck-whye-phoenix' },
  { a: 'phoenix', b: 'bukit-panjang', line: 'BPLRT', time: 2, key: 'BPLRT:phoenix-bukit-panjang' },
  { a: 'bukit-panjang', b: 'petir', line: 'BPLRT', time: 1, key: 'BPLRT:bukit-panjang-petir' },
  { a: 'petir', b: 'pending', line: 'BPLRT', time: 1, key: 'BPLRT:petir-pending' },
  { a: 'pending', b: 'bangkit', line: 'BPLRT', time: 1, key: 'BPLRT:pending-bangkit' },
  { a: 'bangkit', b: 'fajar', line: 'BPLRT', time: 1, key: 'BPLRT:bangkit-fajar' },
  { a: 'fajar', b: 'segar', line: 'BPLRT', time: 1, key: 'BPLRT:fajar-segar' },
  { a: 'segar', b: 'jelapang', line: 'BPLRT', time: 1, key: 'BPLRT:segar-jelapang' },
  { a: 'jelapang', b: 'senja', line: 'BPLRT', time: 1, key: 'BPLRT:jelapang-senja' },
  { a: 'senja', b: 'bukit-panjang', line: 'BPLRT', time: 2, key: 'BPLRT:senja-bukit-panjang' },

  // SKLRT (Sengkang LRT East & West Loops)
  { a: 'sengkang', b: 'compassvale', line: 'SKLRT', time: 1, key: 'SKLRT:sengkang-compassvale' },
  { a: 'compassvale', b: 'rumbia', line: 'SKLRT', time: 1, key: 'SKLRT:compassvale-rumbia' },
  { a: 'rumbia', b: 'bakau', line: 'SKLRT', time: 1, key: 'SKLRT:rumbia-bakau' },
  { a: 'bakau', b: 'kangkar', line: 'SKLRT', time: 1, key: 'SKLRT:bakau-kangkar' },
  { a: 'kangkar', b: 'ranggung', line: 'SKLRT', time: 1, key: 'SKLRT:kangkar-ranggung' },
  { a: 'ranggung', b: 'sengkang', line: 'SKLRT', time: 1, key: 'SKLRT:ranggung-sengkang' },
  { a: 'sengkang', b: 'thanggam', line: 'SKLRT', time: 2, key: 'SKLRT:sengkang-thanggam' },
  { a: 'thanggam', b: 'fernvale', line: 'SKLRT', time: 1, key: 'SKLRT:thanggam-fernvale' },
  { a: 'fernvale', b: 'layar', line: 'SKLRT', time: 1, key: 'SKLRT:fernvale-layar' },
  { a: 'layar', b: 'renjong', line: 'SKLRT', time: 1, key: 'SKLRT:layar-renjong' },
  { a: 'renjong', b: 'sengkang', line: 'SKLRT', time: 1, key: 'SKLRT:renjong-sengkang' },

  // PGLRT (Punggol LRT East & West Loops)
  { a: 'punggol', b: 'cove', line: 'PGLRT', time: 1, key: 'PGLRT:punggol-cove' },
  { a: 'cove', b: 'meridian', line: 'PGLRT', time: 1, key: 'PGLRT:cove-meridian' },
  { a: 'meridian', b: 'coral-edge', line: 'PGLRT', time: 1, key: 'PGLRT:meridian-coral-edge' },
  { a: 'coral-edge', b: 'riviera', line: 'PGLRT', time: 1, key: 'PGLRT:coral-edge-riviera' },
  { a: 'riviera', b: 'oasis', line: 'PGLRT', time: 1, key: 'PGLRT:riviera-oasis' },
  { a: 'oasis', b: 'damai', line: 'PGLRT', time: 1, key: 'PGLRT:oasis-damai' },
  { a: 'damai', b: 'punggol', line: 'PGLRT', time: 1, key: 'PGLRT:damai-punggol' },
  { a: 'punggol', b: 'sam-kee', line: 'PGLRT', time: 1, key: 'PGLRT:punggol-sam-kee' },
  { a: 'sam-kee', b: 'samudera', line: 'PGLRT', time: 2, key: 'PGLRT:sam-kee-samudera' },
  { a: 'samudera', b: 'sumang', line: 'PGLRT', time: 2, key: 'PGLRT:samudera-sumang' },
  { a: 'sumang', b: 'soo-teck', line: 'PGLRT', time: 1, key: 'PGLRT:sumang-soo-teck' },
  { a: 'soo-teck', b: 'punggol', line: 'PGLRT', time: 1, key: 'PGLRT:soo-teck-punggol' },
];

export const INITIAL_DISRUPTIONS: DisruptionAlert[] = [
  {
    id: 'disrupt-ewl-1',
    line: 'EWL',
    lineName: 'East West Line',
    segment: ['tiong-bahru', 'outram-park'],
    stations: ['Tiong Bahru', 'Outram Park'],
    type: 'Signal Delay',
    severity: 'moderate',
    extraMinutes: 7,
    message: 'Delay reported on East West Line between Tiong Bahru and Outram Park',
    sensoryImpact: 'Platform crowding at Tiong Bahru and Outram Park. High audio announcements.',
    lowSensoryBypass: 'Take Thomson-East Coast Line (TEL) via Havelock or Downtown Line (DTL) via Chinatown.',
    wheelchairNote: 'Lifts operating normally; anticipate 3-5 min lift queue at Outram Park during peak rush.',
    freePublicBus: 'Free boarding on public buses active between Queenstown and Outram Park',
    freeMRTShuttle: 'Free Shuttle Bus 11 loop running between Tiong Bahru and Havelock (TEL)'
  }
];

// LTA DataMall Planned Maintenance & Early Closure events
export const PLANNED_MAINTENANCE_EVENTS: PlannedMaintenanceEvent[] = [
  {
    id: 'plan-lift-sgh-1',
    title: 'Outram Park Lift Maintenance',
    line: 'EWL',
    scope: 'Lift #2 (Exit A towards Outram Rd)',
    startDate: 'Tomorrow, 09:00',
    endDate: 'Tomorrow, 14:00',
    impactSummary: 'Exit A lift out of service for preventative maintenance.',
    actionRecommendation: 'Use Central Lift Exit F directly connected via sheltered linkway to Singapore General Hospital (SGH). 100% barrier-free.',
    isLiftMaintenance: true,
    affectedExit: 'Exit A'
  },
  {
    id: 'plan-closure-nsl-1',
    title: 'North-South Line Early Closure',
    line: 'NSL',
    scope: 'Track renewal between Yishun and Woodlands',
    startDate: 'This Friday & Saturday',
    endDate: '23:00 to end of service',
    impactSummary: 'Train service ends early at 23:00 between Yishun and Woodlands.',
    actionRecommendation: 'Board Shuttle Bus Service 8 at designated bus stops outside Yishun, Khatib, Sembawang, Admiralty and Woodlands stations.',
    isLiftMaintenance: false
  },
  {
    id: 'plan-ccl-upgrade-1',
    title: 'Circle Line Capacity Enhancement',
    line: 'CCL',
    scope: 'Platform screen door testing at one-north & Buona Vista',
    startDate: 'Sunday',
    endDate: '06:00 to 09:00',
    impactSummary: 'Trains run at 7-min intervals (usually 4 min).',
    actionRecommendation: 'Multi-modal commuters with bicycles: board carriages 1 & 3 for spacious standing.',
    isLiftMaintenance: false
  }
];

// Problem Statement 2 (PS2) Commuter Profiles & Real End-to-End Journeys
export const COMMUTER_PROFILES: Record<string, {
  personaName: string;
  title: string;
  fromStationId: string;
  toStationId: string;
  usualLeaveTime: string;
  mustArriveTime: string;
  originAddress: string;
  destinationAddress: string;
  tagline: string;
  proactiveAdvice: string;
}> = {
  'fixed-schedule': {
    personaName: 'Rachel (Fixed-Schedule)',
    title: 'Fixed-Schedule Mode',
    fromStationId: 'tampines',
    toStationId: 'raffles-place',
    usualLeaveTime: '07:40',
    mustArriveTime: '08:45',
    originAddress: 'Tampines St 21 (Home)',
    destinationAddress: 'Ocean Financial Centre (Raffles Place desk)',
    tagline: 'Tampines to Raffles Place (EWL). Checks no app normally. Interrupted ONLY when delay > 15m.',
    proactiveAdvice: '⚡ Proactive Delay Alert: 18 min signalling fault on EWL will cause you to miss your 08:45 meeting. Action: Walk 4 min to Tampines East (DTL) -> take Downtown Line to Telok Ayer / Downtown — arrives 08:34 (+11m buffer).'
  },
  'flexible-multimodal': {
    personaName: 'Arjun (Multi-Modal Worker)',
    title: 'Multi-Modal & Flexible Start',
    fromStationId: 'punggol',
    toStationId: 'one-north',
    usualLeaveTime: '08:00',
    mustArriveTime: '09:30',
    originAddress: 'Punggol Field Walk (Home)',
    destinationAddress: 'Fusionopolis (one-north)',
    tagline: 'Punggol to one-north. Cycles to LRT, sometimes buses. Optimises comfort, crowding forecast, and sheltered paths.',
    proactiveAdvice: ' Comfort & Crowd Forecast: 08:00 Punggol platform is crowded (Level H). Departing at 08:25 drops crowd to Level L with seats available. Foldable bikes permitted on NEL/CCL. Sheltered ratio: 82% covered.'
  },
  'barrier-free': {
    personaName: 'Mdm Lim (Accessibility Constrained)',
    title: 'Barrier-Free & Healthcare Mode',
    fromStationId: 'bedok',
    toStationId: 'outram-park',
    usualLeaveTime: '09:15',
    mustArriveTime: '10:30',
    originAddress: 'Bedok South Ave 2 (Home)',
    destinationAddress: 'Singapore General Hospital (SGH Diabetes Clinic)',
    tagline: 'Bedok to SGH. Walks slowly, avoids stairs, needs lifts & covered linkways, advance lift warnings.',
    proactiveAdvice: '♿ 100% Step-Free Verified: Bedok Sheltered Walkway -> Lift Exit B -> EWL Carriage 3 Door 2 (level boarding) -> Outram Park Central Lift Exit F directly connected via covered bridge to SGH. Note: Day-before alert: Lift at Exit A under maintenance; central lift is fully operational.'
  }
};

// Carriage load model (Addressing Marcus Lim's quote:
// "Don't just tell me the train is coming in 2 minutes. Tell me which car isn't packed so I don't squeeze like a sardine.")
export function getCarriageStatus(line: MRTLineCode): TrainStatus {
  // Train sizes: EWL/NSL/NEL have 6 cars; TEL has 4 cars; CCL/DTL have 3 cars
  const carCount = (line === 'CCL' || line === 'DTL') ? 3 : line === 'TEL' ? 4 : 6;

  // Realistic commuter patterns: middle carriages (near escalators) are 75%-95% packed; end carriages are 30%-45%
  const carriages = Array.from({ length: carCount }, (_, idx) => {
    const carNum = idx + 1;
    let density = 40;
    if (carNum === 1 || carNum === carCount) {
      density = Math.floor(25 + (carNum % 3) * 8); // Quietest cars
    } else if (carNum === 3 || carNum === 4) {
      density = Math.floor(70 + (carNum % 4) * 6); // Busy escalator cars
    } else {
      density = 55;
    }

    return {
      carriageNumber: carNum,
      density,
      wheelchairBay: carNum === 3 || carNum === 4,
      prioritySeats: 4,
      doorAlignment: carNum === 3
        ? 'Direct lift access at Door 2 (Wheelchair Priority)'
        : carNum === 1 || carNum === carCount
        ? 'Low crowd zone — spacious boarding'
        : 'Near platform escalators'
    };
  });

  // Find least crowded carriage
  const leastCrowded = carriages.reduce((min, curr) => curr.density < min.density ? curr : min, carriages[0]);

  return {
    line,
    carriages,
    nextArrivalMins: 2,
    crowdLevel: leastCrowded.density > 60 ? 'High' : 'Moderate',
    recommendedCar: leastCrowded.carriageNumber
  };
}
