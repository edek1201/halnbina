const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Pool of comic school shouts
const SHOUT_POOL = [
  "Szkieły jadą!",
  "Bagno!",
  "Surron!",
  "Gruby!",
  "Co jedzie?!",
  "Szkieły!",
  "Kleszczyński!",
  "Zwierzę na 6 liter!",
  "Skunks!",
  "Obiecasz na mamę?!",
  "Masz długopis?!",
  "Oddaj kanapkę!",
  "Daj spisać chemię!",
  "Kiedy dzwonek?!",
  "Zgłaszam NP!",
  "To nie moje!",
  "Kwas siarkowy!",
  "Pani Halinko!",
  "Mogę do toalety?!",
  "Halo, policja?!"
];

// 12 predefined student desks with chairs in classroom layout (Canvas: 1000 x 700)
const DESK_SLOTS = [
  // Row 1
  { id: 0, x: 200, y: 260, chairX: 200, chairY: 278, w: 96, h: 28, label: "Ławka 1" },
  { id: 1, x: 420, y: 260, chairX: 420, chairY: 278, w: 96, h: 28, label: "Ławka 2" },
  { id: 2, x: 640, y: 260, chairX: 640, chairY: 278, w: 96, h: 28, label: "Ławka 3" },
  { id: 3, x: 840, y: 260, chairX: 840, chairY: 278, w: 96, h: 28, label: "Ławka 4" },
  // Row 2
  { id: 4, x: 200, y: 410, chairX: 200, chairY: 428, w: 96, h: 28, label: "Ławka 5" },
  { id: 5, x: 420, y: 410, chairX: 420, chairY: 428, w: 96, h: 28, label: "Ławka 6" },
  { id: 6, x: 640, y: 410, chairX: 640, chairY: 428, w: 96, h: 28, label: "Ławka 7" },
  { id: 7, x: 840, y: 410, chairX: 840, chairY: 428, w: 96, h: 28, label: "Ławka 8" },
  // Row 3
  { id: 8, x: 200, y: 560, chairX: 200, chairY: 578, w: 96, h: 28, label: "Ławka 9" },
  { id: 9, x: 420, y: 560, chairX: 420, chairY: 578, w: 96, h: 28, label: "Ławka 10" },
  { id: 10, x: 640, y: 560, chairX: 640, chairY: 578, w: 96, h: 28, label: "Ławka 11" },
  { id: 11, x: 840, y: 560, chairX: 840, chairY: 578, w: 96, h: 28, label: "Ławka 12" },
];

// 6 student desks in Sala 204 for Classic Mode (Canvas: 1000 x 700)
const CLASSIC_DESK_SLOTS = [
  { id: 0, x: 260, y: 270, chairX: 260, chairY: 288, label: "Ławka 1 (Lewa przód)" },
  { id: 1, x: 260, y: 390, chairX: 260, chairY: 408, label: "Ławka 2 (Lewa środek)" },
  { id: 2, x: 260, y: 510, chairX: 260, chairY: 528, label: "Ławka 3 (Lewa tył)" },
  { id: 3, x: 740, y: 270, chairX: 740, chairY: 288, label: "Ławka 4 (Prawa przód)" },
  { id: 4, x: 740, y: 390, chairX: 740, chairY: 408, label: "Ławka 5 (Prawa środek)" },
  { id: 5, x: 740, y: 510, chairX: 740, chairY: 528, label: "Ławka 6 (Prawa tył)" }
];

// Classic mode items definition (Realistic Polish school & contraband economy)
const CLASSIC_ITEMS = {
  pen: { id: 'pen', name: 'Długopis niebieski', price: 4.0, sellPrice: 2.0, icon: '🖊️', desc: 'Niezbędny do robienia zadań z chemii w zeszycie.' },
  vape: { id: 'vape', name: 'E-papieros Vape Pod', price: 110, sellPrice: 60, icon: '💨', desc: 'E-papieros z owocowym liquidem. Daje chill i punkty. W sali Halbina wyczuje aromat! Nie tworzy chmury dymu.' },
  cheat_sheet: { id: 'cheat_sheet', name: 'Ściąga z chemii', price: 30, sellPrice: 15, icon: '📝', desc: 'Podświetla poprawne odpowiedzi w zeszycie i na kartkówkach.' },
  energy_drink: { id: 'energy_drink', name: 'Monster Energy', price: 8.5, sellPrice: 4.0, icon: '⚡', desc: 'Wypij puszkę, by zyskać potężny Speed Boost (+85%) na 6 sekund!' },
  sandwich: { id: 'sandwich', name: 'Kanapka z pasztetem babuni', price: 7.0, sellPrice: 3.5, icon: '🥪', desc: 'Pożywna kanapka regenerująca siły (+80 pkt respektu).' },
  bun: { id: 'bun', name: 'Drożdżówka z makiem', price: 5.5, sellPrice: 2.5, icon: '🥐', desc: 'Cieplutka drożdżówka ze szkolnego sklepiku (+60 pkt).' },
  zapiekanka: { id: 'zapiekanka', name: 'Zapiekanka z pieczarkami', price: 12.0, sellPrice: 6.0, icon: '🥖', desc: 'Legendarna chrupiąca zapiekanka z sosem czosnkowym (+120 pkt).' },
  tymbark: { id: 'tymbark', name: 'Tymbark jabłko-mięta', price: 4.5, sellPrice: 2.0, icon: '🧃', desc: 'Odkręć kapsel z zabawnym hasłem! (+75 pkt respektu).' },
  prince_polo: { id: 'prince_polo', name: 'Baton Prince Polo', price: 3.5, sellPrice: 1.5, icon: '🍫', desc: 'Chrupiący czekoladowy wafelek pod ławkę (+40 pkt).' },
  firecracker: { id: 'firecracker', name: 'Petarda Korsarz', price: 35, sellPrice: 15, icon: '🧨', desc: 'Odpala wybuch i kłęby dymu! Panika nauczycieli i odwrócenie uwagi Halbina na 7s!' },
  coffee: { id: 'coffee', name: 'Kawa z Pokoju Nauczycielskiego', price: 12, sellPrice: 6, icon: '☕', desc: 'Mocna kawa: zeruje wkurwienie Halbina lub daje speed boost uczniowi!' },
  director_stamp: { id: 'director_stamp', name: 'Pieczątka Dyrektora', price: 1200, sellPrice: 600, icon: '📑', desc: 'Skradziona pieczęć ze stołu dyrektora. Generuje lewe zwolnienia!' },
  exam_key: { id: 'exam_key', name: 'Klucz odpowiedzi ze sprawdzianu', price: 450, sellPrice: 250, icon: '🔑', desc: 'Wykradziony z pokoju nauczycielskiego. Auto-sukces w zeszycie (+50 PLN, ocena 6)!' },
  knife: { id: 'knife', name: 'Scyzoryk sprężynowy', price: 140, sellPrice: 70, icon: '🔪', desc: 'Niebezpieczne narzędzie... Może podważyć proste zamki i sterroryzować dyrektora!' },
  machete: { id: 'machete', name: 'Bojowa Maczeta', price: 260, sellPrice: 140, icon: '🗡️', desc: 'Ciężka maczeta: szeroki zamach [V / użyj] obezwładnia policjantów!' },
  ar15: { id: 'ar15', name: 'Karabin szturmowy AR-15', price: 5800, sellPrice: 3500, icon: '🔫', desc: 'Samoczynny karabin bojowy 5.56mm. Strzela serią 3 pocisków! Wymaga Magazynka 5.56mm.', maxAmmo: 30, magType: 'mag_ar15' },
  makarov: { id: 'makarov', name: 'Pistolet Makarow (9mm)', price: 2200, sellPrice: 1300, icon: '🔫', desc: 'Radziecki pistolet bojowy kaliber 9mm. Pojemność: 8 naboi. Wymaga Magazynka 9mm!', maxAmmo: 8, magType: 'mag_makarov' },
  mag_ar15: { id: 'mag_ar15', name: 'Magazynek 5.56mm (AR-15)', price: 200, sellPrice: 110, icon: '🗃️', desc: 'Magazynek z 30 ostrymi nabojami 5.56 NATO do Karabinu AR-15.', rounds: 30 },
  mag_makarov: { id: 'mag_makarov', name: 'Magazynek 9mm (Makarov)', price: 130, sellPrice: 70, icon: '🗃️', desc: 'Magazynek stalowy z 8 nabojami 9x18mm do Pistoletu Makarow.', rounds: 8 },
  janitor_key: { id: 'janitor_key', name: 'Zardzewiały Klucz Woźnego', price: 180, sellPrice: 90, icon: '🗝️', desc: 'Ciężki żelazny klucz otwierający kłódkę do Schowka Woźnego.' },
  master_keycard: { id: 'master_keycard', name: 'Karta Główna Dyrekcji (Master)', price: 850, sellPrice: 400, icon: '💳', desc: 'Karta magnetyczna z dostępem do radiowęzła i sal szkolnych.' },
  bolt_cutter: { id: 'bolt_cutter', name: 'Nożyce do metalu / Łom', price: 160, sellPrice: 80, icon: '🛠️', desc: 'Narzędzie do forsowania kłódek i krat wentylacyjnych.' },
  smoke_grenade: { id: 'smoke_grenade', name: 'Wojskowa Świeca Dymna', price: 220, sellPrice: 110, icon: '💨', desc: 'Potężna świeca dymna: uruchamia ALARM POŻAROWY i ewakuację na boisko!' },
  notebook: { id: 'notebook', name: 'Zeszyt w kratkę do chemii', price: 5.0, sellPrice: 2.5, icon: '📓', desc: 'Służy do odrabiania zadań domowych z chemii. Zrób zadanie, zanim Halbina sprawdzi zeszyty!' },
  solved_task: { id: 'solved_task', name: 'Odrobione zadanie z chemii', price: 0, sellPrice: 0, icon: '📓', desc: 'Gotowe zadanie domowe w zeszycie! Chroni przed uwagą i pałą od pani Halbina.' },
  can_deposit: { id: 'can_deposit', name: 'Puszka kaucjowana (1.00 zł)', price: 1.0, sellPrice: 1.0, icon: '🥫', desc: 'Pusta puszka aluminiowa z kodem kaucji. Wrzuć do Kaucjomatu na zewnątrz za 1.00 PLN!' },
  bottle_deposit: { id: 'bottle_deposit', name: 'Butelka szklana zwrotna (1.00 zł)', price: 1.0, sellPrice: 1.0, icon: '🍾', desc: 'Zwrotna butelka szklana. Kaucjomat na boisku wypłaca za nią 1.00 PLN gotówki!' },
  plastic_bottle_deposit: { id: 'plastic_bottle_deposit', name: 'Butelka plastikowa PET (0.50 zł)', price: 0.5, sellPrice: 0.5, icon: '🥤', desc: 'Plastikowa butelka z kaucją. Do zwrotu w Kaucjomacie za 0.50 PLN.' },
  excuse_note: { id: 'excuse_note', name: 'Usprawiedliwienie od Dyrektora', price: 0, sellPrice: 0, icon: '📜', desc: 'Oficjalny papier chroniący przed uwagą Halbiny.' },
  hall_pass: { id: 'hall_pass', name: 'Przepustka do domu', price: 0, sellPrice: 0, icon: '🎫', desc: 'Podpisana przez Dyrektora zgoda na wyjście ze szkoły (+150 pkt).' }
};

// Buffet Shop items (Pani Basia)
const BUFFET_ITEMS = [
  { id: 'bun', name: 'Drożdżówka z makiem', price: 5.50, icon: '🥐', desc: 'Słodka i świeża buła ze szkolnego sklepiku (+60 pkt).' },
  { id: 'zapiekanka', name: 'Zapiekanka z pieczarkami', price: 12.00, icon: '🥖', desc: 'Chrupiąca zapiekanka z sosem czosnkowym (+120 pkt).' },
  { id: 'tymbark', name: 'Tymbark jabłko-mięta', price: 4.50, icon: '🧃', desc: 'Klasyk z kapslem z zabawnym hasłem (+75 pkt).' },
  { id: 'prince_polo', name: 'Baton Prince Polo', price: 3.50, icon: '🍫', desc: 'Czekoladowy wafelek do chrupania pod ławką (+40 pkt).' },
  { id: 'pen', name: 'Zapasowy długopis', price: 4.00, icon: '🖊️', desc: 'Długopis niebieski do rozwiązywania chemii.' },
  { id: 'notebook', name: 'Czysty zeszyt w kratkę', price: 5.00, icon: '📓', desc: 'Zeszyt do chemii na nowe zadania.' }
];

// All lessons are Chemistry! Each lesson lasts 1 minute (60s).
const CHEMISTRY_LESSONS_SCHEDULE = [
  { num: 1, time: '11:45 - 11:46', title: 'Chemia Ogólna: Budowa atomu i wiązania kowalencyjne' },
  { num: 2, time: '11:46 - 11:47', title: 'Chemia Nieorganiczna: Reakcje redoks i kwasy tlenowe' },
  { num: 3, time: '11:47 - 11:48', title: 'Chemia Organiczna: Węglowodory (Alkany, Alkeny i Alkiny)' },
  { num: 4, time: '11:48 - 11:49', title: 'Chemia Organiczna: Alkohole monohydroksylowe i fenole' },
  { num: 5, time: '11:49 - 11:50', title: 'Chemia Analityczna: Aldehydy i próby Trommera/Tollensa' },
  { num: 6, time: '11:50 - 11:51', title: 'Chemia Organiczna: Kwasy karboksylowe i reakcja estryfikacji' },
  { num: 7, time: '11:51 - 11:52', title: 'Chemia Stosowana: Polimery syntetyczne i tworzywa sztuczne' },
  { num: 8, time: '11:52 - 11:53', title: 'Chemia Doświadczalna: Niebezpieczne związki azotowe i wybuchowe' },
  { num: 9, time: '11:53 - 11:54', title: 'Chemia Biologiczna: Aminokwasy, peptydy i białka' },
  { num: 10, time: '11:54 - 11:55', title: 'Powtórzenie Maturalne: Egzamin komisyjny u prof. Katarzyny Halbina' }
];

const TYMBARK_QUOTES = [
  "Halbina dzisiaj nie pyta!",
  "2 z chemii to też pozytywna!",
  "Uciekaj szybko do kibla!",
  "Uśmiechnij się do Dyrektora",
  "Nie daj się złapać na ściąganiu",
  "Zaraz będzie dzwonek na przerwę!",
  "Masa molowa to stan umysłu",
  "Zgłoś NP i miej spokój"
];

// Chemistry exercise tasks for notebook in Classic mode (NO CASH REWARD - HOMEWORK OBLIGATION)
const CHEMISTRY_TASKS = [
  {
    id: 'task_1',
    title: 'Reakcja estryfikacji',
    desc: 'Uzupełnij równanie reakcji: CH₃COOH + C₂H₅OH --(H₂SO₄)--> [?] + H₂O',
    options: ['CH₃COOC₂H₅ (octan etylu)', 'CH₃OCH₃', 'CH₃CHO', 'HCOOCH₃'],
    correctIndex: 0
  },
  {
    id: 'task_2',
    title: 'Reguła Markownikowa',
    desc: 'Wskaż produkt główny addycji HCl do propenu:',
    options: ['2-chloropropan', '1-chloropropan', '1,2-dichloropropan', 'cyklopropan'],
    correctIndex: 0
  },
  {
    id: 'task_3',
    title: 'Próba Tollensa',
    desc: 'Jaki jest efekt pozytywnej próby Tollensa dla aldehydów?',
    options: ['Lustro srebrne na ściankach probówki', 'Ceglastoczerwony osad Cu₂O', 'Biały osad AgCl', 'Odbarwienie roztworu KMnO₄'],
    correctIndex: 0
  },
  {
    id: 'task_4',
    title: 'Spalanie całkowite propanu',
    desc: 'Ile moli tlenu O₂ potrzeba do całkowitego spalenia 1 mola C₃H₈ (C₃H₈ + ?O₂ -> 3CO₂ + 4H₂O)?',
    options: ['5 moli O₂', '3 mole O₂', '7 moli O₂', '10 moli O₂'],
    correctIndex: 0
  }
];

function getClassicZone(playerOrX) {
  if (typeof playerOrX === 'object' && playerOrX !== null) {
    return playerOrX.currentZone || 'CORRIDOR';
  }
  return 'CORRIDOR';
}

function getDeskAtPosition(x, y, isClassic = false) {
  const slots = isClassic ? CLASSIC_DESK_SLOTS : DESK_SLOTS;
  for (let d = 0; d < slots.length; d++) {
    const slot = slots[d];
    if (Math.abs(x - slot.x) <= 50 && Math.abs(y - slot.chairY) <= 32) {
      return slot.id;
    }
  }
  return -1;
}

function isNearAnyDesk(x, y, maxDist = 58, isClassic = false) {
  const slots = isClassic ? CLASSIC_DESK_SLOTS : DESK_SLOTS;
  for (let d = 0; d < slots.length; d++) {
    const slot = slots[d];
    if (Math.hypot(x - slot.x, y - slot.chairY) <= maxDist) {
      return true;
    }
  }
  return false;
}

// Dynamic 360-degree Vision Cone Field: Halbina looks in direction of teacherAngle (radians)
function isStudentInVisionCone(studentX, studentY, teacherX, teacherY, teacherAngle = Math.PI / 2) {
  const dx = studentX - teacherX;
  const dy = studentY - teacherY;
  const dist = Math.hypot(dx, dy);
  if (dist < 15) return true; // Extremely close proximity (right in front / touching)
  if (dist > 520) return false; // Beyond max vision range

  const angleToStudent = Math.atan2(dy, dx);
  let diff = Math.abs(angleToStudent - teacherAngle);
  while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

  // 86-degree total field of view (half angle approx 43 deg = 0.785 rad)
  return diff <= 0.785;
}

// Chemistry Quiz Questions for 2nd Grade Technical School (Technikum Klasa 2)
const CHEMISTRY_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Jaki produkt główny powstaje w reakcji addycji bromowodoru (HBr) do propenu zgodnie z regułą Markownikowa?",
    options: ["2-bromopropan", "1-bromopropan", "1,2-dibromopropan", "Cyklopropan"],
    correctIndex: 0
  },
  {
    id: 2,
    question: "Wskaż odczynnik i wynik pozytywnej próby Trommera na obecność grupy aldehydowej:",
    options: [
      "Wodorotlenek miedzi(II) Cu(OH)₂ -> ceglastoczerwony osad Cu₂O",
      "Amoniakalny roztwór tlenku srebra(I) -> lustro srebrne",
      "Chlorek żelaza(III) FeCl₃ -> intensywnie fioletowy kompleks",
      "Woda bromowa w ciemności -> odbarwienie bez osadu"
    ],
    correctIndex: 0
  },
  {
    id: 3,
    question: "W wyniku reakcji estryfikacji kwasu etanowego z etanolem w obecności stężonego H₂SO₄ powstaje:",
    options: ["Octan etylu (etanian etylu) i woda", "Mrówczan metylu i gazowy wodór", "Eter dietylowy i kwas siarkawy", "Aldehyd octowy i woda"],
    correctIndex: 0
  },
  {
    id: 4,
    question: "Jaki typ hybrydyzacji orbitali atomowych węgla występuje w cząsteczce etynu (acetylenu C₂H₂)?",
    options: ["sp (liniowa)", "sp² (trygonalna)", "sp³ (tetraedryczna)", "dsp² (płaska kwadratowa)"],
    correctIndex: 0
  },
  {
    id: 5,
    question: "Który z poniższych alkoholi NIE ulega łagodnemu utlenieniu za pomocą CuO do aldehydu ani ketonu?",
    options: ["2-metylopropan-2-ol (alkohol III-rzędowy)", "Butan-1-ol (alkohol I-rzędowy)", "Propan-2-ol (alkohol II-rzędowy)", "Etanol (alkohol I-rzędowy)"],
    correctIndex: 0
  },
  {
    id: 6,
    question: "Jaka jest systematyczna nazwa IUPAC związku o wzorze CH₃-CH(CH₃)-CH₂-COOH?",
    options: ["Kwas 3-metylobutanowy", "Kwas 2-metylobutanowy", "Kwas izowalerianowy", "Kwas 3,3-dimetylopropanowy"],
    correctIndex: 0
  },
  {
    id: 7,
    question: "Reakcja nitrowania benzenu mieszaniną nitrującą (stęż. HNO₃ + stęż. H₂SO₄) to:",
    options: [
      "Substytucja elektrofilowa z atakiem jonu nitroniowego (NO₂⁺)",
      "Addycja rodnikowa z atakiem rodnika hydroksylowego",
      "Substytucja nukleofilowa jonu azotanowego (NO₃⁻)",
      "Eliminacja elektrofilowa wodoru z pierścienia"
    ],
    correctIndex: 0
  },
  {
    id: 8,
    question: "Wskaż węglowodór, który w temperaturze pokojowej natychmiast odbarwia wodę bromową bez dostępu światła:",
    options: ["Eten (reakcja addycji do wiązania podwójnego)", "Etan (nasycony alkan)", "Benzen w ciemności", "Cykloheksan"],
    correctIndex: 0
  },
  {
    id: 9,
    question: "Wskaż produkt katalitycznej redukcji acetonu (propan-2-onu) gazowym wodorem w obecności niklu:",
    options: ["Propan-2-ol (alkohol II-rzędowy)", "Propan-1-ol (alkohol I-rzędowy)", "Kwas propanowy", "Propanal (aldehyd)"],
    correctIndex: 0
  },
  {
    id: 10,
    question: "Który ze związków daje pozytywny wynik próby jodoformowej (żółty krystaliczny osad CHI₃ z I₂ w obecności NaOH)?",
    options: ["Etanol oraz propanon (aceton)", "Metanol oraz formaldehyd", "Benzen oraz fenol", "Kwas mrówkowy oraz etan"],
    correctIndex: 0
  }
];

function getRandomShouts(count = 3, exclude = []) {
  const available = SHOUT_POOL.filter(s => !exclude.includes(s));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

// Active game rooms
const rooms = new Map();

class Room {
  constructor(code, hostId, hostName) {
    this.code = code;
    this.hostId = hostId;
    this.state = 'LOBBY'; // 'LOBBY' | 'STARTING' | 'IN_GAME' | 'ROUND_OVER'
    this.category = 'arcade'; // 'arcade' | 'classic'
    this.mode = 'normal'; // 'normal' | 'classic_real' | 'hardcore' | 'boss'
    this.players = new Map();
    this.teacherId = null; // socket.id of teacher, or 'BOT'
    this.lessonDuration = 300; // seconds (default 5 min for normal mode)
    this.timeRemaining = 300;
    this.lastTickTime = Date.now();
    this.gameLoopInterval = null;

    // Classic Mode (Realistyczny symulator szkoły) Specifics
    this.gameClockSeconds = (11 * 60 + 45) * 60; // 11:45:00
    this.corridorTimer = 20.0; // 20s until bell
    this.bellRung = false;
    this.dealerSpawned = false;
    this.dealerStock = [];
    this.directorRobbed = false;
    this.activeTardyPrompt = null;
    this.pendingTardyStudents = [];

    // Teacher state
    this.teacher = {
      x: 500,
      y: 110,
      targetX: 500,
      speed: 120,
      state: 'BOARD', // 'BOARD' | 'TURNING' | 'CLASS' | 'RAGE'
      stateTimer: 4.0,
      isAI: true,
      anger: 0,
      rageText: '',
      rageTimer: 0,
      speechText: '', // Spoken text visible centered above Halbina
      speechTimer: 0,
      shoutCooldown: 0,
      lastAction: 'Pisze na tablicy wzór chemiczny...',
      currentZone: 'CHEMISTRY',
      angle: Math.PI / 2
    };

    // Human teacher turn timers (turn to class for 2s, 5s cooldown)
    this.teacherTurnDuration = 0;
    this.teacherTurnCooldown = 0;
    this.teacherStunTimer = 0; // Stun & blackout from pepper spray

    // Pop Quiz / Przepytywanka State (Anger >= 50%)
    this.activeQuiz = null; // { studentId, studentName, question, options, correctIndex, isWet, isSpit, spitCount, hasDick, dickCount, isCheatingPhone, phoneCheatTimer, timeRemaining, spitCooldown }
    this.popQuizCooldown = 0;

    // Boss Fight State
    this.boss = {
      isBossMode: false,
      maxHp: 1200,
      hp: 1200,
      phase: 1, // 1 (100-66%), 2 (66-33%), 3 (33-0%)
      attackTimer: 3.0,
      acidPuddles: [], // { id, x, y, radius: 46, duration: 9.0, timer: 9.0 }
      chalkPickups: [], // { id, x, y, timer: 16.0 }
      stunTimer: 0,
      bleedTimer: 0
    };

    // Police Raid & Chaos Mechanics
    this.policeShoutCount = 0;
    this.policeActiveTimer = 0;
    this.policeRaidPending = false; // 8s alert after chair throw
    this.policeRaidTimer = 0;
    this.policeOfficers = []; // Physical police officers running in
    this.projectiles = []; // paper airplanes, kleszcze, chairs, pepper spray, acid flasks, exams
    this.smokeClouds = []; // vape smoke clouds

    // Secret Rooms State
    this.janitorChestLooted = false;
    this.janitorKeycardTaken = false;
    this.schoolBlackoutTimer = 0;
    this.chemLabUsed = false;
    this.cctvCleared = false;

    // Outdoor / Schoolyard (Courtyard) State
    this.courtyardDeposits = []; // refundable cans & bottles on ground
    this.depositSpawnTimer = 0;
    this.aiHomeworkChecked = false;
    this.aiHomeworkCheckTimer = 55.0;

    // 1-minute Chemistry Lesson Rotation & 10-minute Dark Web Dealer
    this.currentLessonIndex = 0;
    this.lessonTimer = 60.0;
    this.dealerDuration = 600.0; // 10 minutes (600s)
    this.dealerRemainingSeconds = 600.0;

    // Fire Alarm & School Evacuation Assembly Mechanics
    this.fireAlarmActive = false;
    this.fireAlarmTimer = 0;
    this.pendingSmokeInterrogation = null;
    this.evacuatedStudents = new Set();

    // Narrative Plot Arcs & Storylines
    this.storyline = null;

    this.roundLogs = [];
  }

  resolveSmokeInterrogation(choice, responderName = 'Pani Halbina') {
    if (!this.pendingSmokeInterrogation || !this.pendingSmokeInterrogation.active) return;
    this.pendingSmokeInterrogation.active = false;
    let answerText = '';
    let directorResponse = '';
    let logMsg = '';

    if (choice === 1) {
      answerText = "To kontrolowany eksperyment z sublimacji i reakcji redoks! Wszystko pod pełną kontrolą dydaktyczną!";
      directorResponse = "Eksperyment?! Pani Katarzyno, całe kuratorium i straż pożarna tu pędzi na sygnale! Odwołuję alarm, ale ma Pani u mnie oficjalną naganę z wpisem do akt!";
      logMsg = `🚨 [DYREKTOR JANUSZ]: «${directorResponse}»`;
      this.teacher.anger = Math.max(0, this.teacher.anger - 25);
    } else if (choice === 2) {
      answerText = "To sprawka tego chuligana z ostatniej ławki! Podpalił coś za szafą, natychmiast wyciągnę surowe konsekwencje!";
      directorResponse = "Wiedziałem! Zawsze ta sama klasa! Proszę natychmiast wstawić temu łobuzowi naganę dyrektorską i wezwać rodziców!";
      logMsg = `🚨 [DYREKTOR JANUSZ]: «${directorResponse}»`;
      this.players.forEach(p => {
        if (p.role === 'STUDENT' && p.eduvulcan) {
          if (!p.eduvulcan.uwagi) p.eduvulcan.uwagi = [];
          p.eduvulcan.uwagi.push("Zawiadomienie: podejrzenie wywołania pożaru świecą dymną!");
        }
      });
      this.teacher.anger = Math.min(100, this.teacher.anger + 15);
    } else {
      answerText = "Panie Dyrektorze, w piwnicy rozszczelnił się stary piec węglowy woźnego! Trzeba natychmiast ratować kotłownię!";
      directorResponse = "CO?! Stary kocioł Stanisława znowu grozi eksplozją?! Wszyscy z drogi, biegniemy z gaśnicami do piwnicy!";
      logMsg = `🚨 [DYREKTOR JANUSZ]: «${directorResponse}» (Dyrektor w panice ucieka do kotłowni!)`;
      this.players.forEach(p => { p.points += 150; });
      this.teacher.anger = 0;
    }

    this.roundLogs.unshift(logMsg);
    this.roundLogs.unshift(`👩‍🏫 [HALBINA]: «${answerText}»`);

    io.to(this.code).emit('halbina_fire_alarm_resolved', {
      choice: choice,
      responder: responderName,
      answer: answerText,
      directorReaction: directorResponse,
      message: logMsg
    });

    this.fireAlarmTimer = Math.min(this.fireAlarmTimer, 3.5);
  }

  spawnCourtyardDeposits(minCount = 12) {
    if (!this.courtyardDeposits) this.courtyardDeposits = [];
    const types = [
      { id: 'can_deposit', name: 'Puszka kaucjowana (1.00 zł)', icon: '🥫', value: 1.0 },
      { id: 'bottle_deposit', name: 'Butelka szklana zwrotna (1.00 zł)', icon: '🍾', value: 1.0 },
      { id: 'plastic_bottle_deposit', name: 'Butelka plastikowa PET (0.50 zł)', icon: '🥤', value: 0.5 }
    ];
    const spawnSpots = [
      { x: 120, y: 220 },
      { x: 160, y: 260 },
      { x: 90, y: 560 },
      { x: 150, y: 610 },
      { x: 330, y: 580 },
      { x: 370, y: 540 },
      { x: 670, y: 570 },
      { x: 720, y: 540 },
      { x: 880, y: 510 },
      { x: 920, y: 460 },
      { x: 880, y: 310 },
      { x: 920, y: 260 },
      { x: 760, y: 190 },
      { x: 440, y: 280 },
      { x: 570, y: 410 },
      { x: 260, y: 460 }
    ];

    while (this.courtyardDeposits.length < minCount) {
      const spot = spawnSpots[Math.floor(Math.random() * spawnSpots.length)];
      const offset = (Math.random() - 0.5) * 40;
      const itemType = types[Math.floor(Math.random() * types.length)];
      this.courtyardDeposits.push({
        id: 'dep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        typeId: itemType.id,
        name: itemType.name,
        icon: itemType.icon,
        value: itemType.value,
        x: Math.max(70, Math.min(930, Math.round(spot.x + offset))),
        y: Math.max(160, Math.min(630, Math.round(spot.y + offset)))
      });
    }
  }

  triggerAiHomeworkCheck() {
    const prepared = [];
    const unprepared = [];

    this.players.forEach(p => {
      if (p.role === 'STUDENT' && !p.isEliminated) {
        if (p.currentZone === 'CHEMISTRY') {
          if (p.hasHomework) {
            prepared.push(p);
            p.points += 60;
            if (p.eduvulcan) {
              if (!p.eduvulcan.grades) p.eduvulcan.grades = [];
              p.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Kontrola zeszytu (Zadanie domowe)', grade: 5 });
              p.eduvulcan.homeworkChecked = 'Odrobione (Plus za aktywność!)';
            }
          } else {
            unprepared.push(p);
            p.points = Math.max(0, p.points - 60);
            if (p.eduvulcan) {
              if (!p.eduvulcan.grades) p.eduvulcan.grades = [];
              p.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Brak zadania domowego', grade: 1 });
              if (!p.eduvulcan.uwagi) p.eduvulcan.uwagi = [];
              p.eduvulcan.uwagi.push('Brak zadania domowego z chemii!');
              p.eduvulcan.homeworkChecked = 'Nieodrobione! (Ocena 1 + Uwaga)';
            }
            this.penalizeStudent(p, 'UNPREPARED');
          }
        }
      }
    });

    let msg = '';
    if (unprepared.length > 0) {
      const unpNames = unprepared.map(u => u.fullName || u.name).join(', ');
      msg = `📓 Halbina sprawdziła zadania domowe! Brak zadania: ${unpNames} (Wstawiono 1 i uwagę!).`;
      if (prepared.length > 0) {
        msg += ` Odrobione: ${prepared.map(p => p.fullName || p.name).join(', ')} (+5 w dzienniku).`;
      }
      this.setTeacherSpeech("Co to ma być?! Kto nie odrobił zadania, ten ma jedynkę i uwagę w EduVulcan!", 6.0);
    } else if (prepared.length > 0) {
      msg = `📓 Halbina sprawdziła zadania domowe! Wszyscy obecni uczniowie mają odrobione zadanie (+5 w dzienniku)!`;
      this.setTeacherSpeech("No, widzę że wszyscy odrobiliście zadanie. Aż jestem w szoku...", 5.0);
    }

    if (msg) {
      this.roundLogs.unshift(msg);
      io.to(this.code).emit('teacher_check_homework_result', {
        message: msg,
        prepared: prepared.map(p => ({ id: p.id, name: p.fullName || p.name })),
        unprepared: unprepared.map(u => ({ id: u.id, name: u.fullName || u.name }))
      });
    }
  }

  startStoryline(arcType) {
    if (this.storyline && this.storyline.active) return false;
    this.storyline = {
      active: true,
      arc: arcType, // 'INSPECTION' | 'POLICE_RAID' | 'STUDENT_REVOLT'
      stage: 1,
      timer: 25.0,
      stageDuration: 25.0,
      title: '',
      desc: '',
      data: {}
    };

    if (arcType === 'INSPECTION') {
      this.storyline.title = 'Wielka Wizytacja z Kuratorium';
      this.storyline.desc = 'Wizytator zmierza do Sali 204! Wszyscy do ławek i schować nielegalne fanty!';
      this.teacher.anger = 30;
      this.setTeacherSpeech("Jezus Maria! Kurator wchodzi do szkoły! Schować telefony i usiąść prosto!", 6.0);
    } else if (arcType === 'POLICE_RAID') {
      this.storyline.title = 'Kryminalny Nalot Policji & K9';
      this.storyline.desc = 'Radiowóz pod szkołą! Policjanci przeszukują korytarz i toalety!';
      this.policeRaidPending = true;
      this.policeRaidTimer = 6.0;
    } else if (arcType === 'STUDENT_REVOLT') {
      this.storyline.title = 'Generalny Bunt Uczniów & Strajk';
      this.storyline.desc = 'Uczniowie przejęli radiowęzeł i protestują przeciwko kartkówkom Halbina!';
      this.teacher.anger = 60;
      this.setTeacherSpeech("CO TO ZA STRAJK?! WRACAĆ MI DO SALI W TEJ CHWILI!", 5.0);
    }

    const startMsg = `📜 WĄTEK FABULARNY: Rozpoczęto "${this.storyline.title}"!`;
    this.roundLogs.unshift(startMsg);
    io.to(this.code).emit('storyline_stage_changed', this.storyline);
    return true;
  }

  advanceStoryline() {
    if (!this.storyline || !this.storyline.active) return;
    this.storyline.stage++;

    if (this.storyline.arc === 'INSPECTION') {
      if (this.storyline.stage === 2) {
        this.storyline.timer = 28.0;
        this.storyline.stageDuration = 28.0;
        this.storyline.desc = 'Wizytator Hanna Grabska wizytuje Salę 204! Sprawdza dyscyplinę i wiedzę chemiczną.';

        const hasSmokeInClass = this.smokeClouds.some(c => c.x > 100 && c.x < 900 && c.y > 100 && c.y < 600);
        if (hasSmokeInClass) {
          this.teacher.anger = 100;
          this.teacherStunTimer = 22.0;
          this.setTeacherSpeech("PANI WIZYTATOR TO NIE MOJE PAPIEROSY! JA TYLKO UCZĘ!", 6.0);
          const scMsg = `💥 SKANDAL WIZYTACYJNY! Wizytatorka poczuła dym w sali 204! Halbina zawieszona na 22s!`;
          this.roundLogs.unshift(scMsg);
          io.to(this.code).emit('notification', { message: scMsg });
        } else {
          this.teacher.anger = 0;
          this.setTeacherSpeech("Dziękuję pani Wizytator, klasa wykazuje niezwykłe postępy w chemii organicznej!", 5.0);
          this.players.forEach(p => {
            if (p.role === 'STUDENT' && !p.isEliminated && p.currentZone === 'CHEMISTRY') {
              p.bankBalance = Math.round(((p.bankBalance || 0) + 80.0) * 100) / 100;
              p.points += 200;
              if (p.eduvulcan) {
                if (!p.eduvulcan.grades) p.eduvulcan.grades = [];
                p.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Wizytacja Kuratorium', grade: 6 });
              }
            }
          });
          const grantMsg = `🏆 SUKCES WIZYTACJI! Kuratorium przyznało grant: 80 PLN dla obecnych uczniów i ocena 6 w EduVulcan!`;
          this.roundLogs.unshift(grantMsg);
          io.to(this.code).emit('notification', { message: grantMsg });
        }
        io.to(this.code).emit('storyline_stage_changed', this.storyline);
      } else {
        const endMsg = '📋 Wizytacja z Kuratorium dobiegła końca. Raport powizytacyjny został zatwierdzony.';
        this.roundLogs.unshift(endMsg);
        this.storyline.active = false;
        io.to(this.code).emit('storyline_stage_changed', { active: false, message: endMsg });
      }
    } else if (this.storyline.arc === 'POLICE_RAID') {
      if (this.storyline.stage === 2) {
        this.storyline.timer = 24.0;
        this.storyline.stageDuration = 24.0;
        this.storyline.desc = 'Obława K9 trwa! Funkcjonariusze zabezpieczają szafki i toalety.';
        io.to(this.code).emit('storyline_stage_changed', this.storyline);
      } else {
        const endMsg = '🚓 Policja opuściła teren szkoły. Sytuacja na korytarzu opanowana.';
        this.roundLogs.unshift(endMsg);
        this.storyline.active = false;
        io.to(this.code).emit('storyline_stage_changed', { active: false, message: endMsg });
      }
    } else if (this.storyline.arc === 'STUDENT_REVOLT') {
      if (this.storyline.stage === 2) {
        this.storyline.timer = 25.0;
        this.storyline.stageDuration = 25.0;
        this.storyline.desc = 'Dyrektor szkoły wkracza do akcji z propozycją amnestii dla strajkujących!';
        io.to(this.code).emit('storyline_stage_changed', this.storyline);
      } else {
        this.players.forEach(p => {
          if (p.role === 'STUDENT' && !p.isEliminated) {
            p.uwagi = 0;
            if (p.eduvulcan) p.eduvulcan.notes = [];
            p.bankBalance = Math.round(((p.bankBalance || 0) + 40.0) * 100) / 100;
          }
        });
        const revMsg = '✊ Porozumienie podpisane! Dyrektor anulował wszystkie uwagi w EduVulcan i wypłacił 40 PLN odszkodowania!';
        this.roundLogs.unshift(revMsg);
        this.storyline.active = false;
        io.to(this.code).emit('storyline_stage_changed', { active: false, message: revMsg });
      }
    }
  }

  formatGameClock() {
    const totalMins = Math.floor(this.gameClockSeconds / 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const hh = String(hrs).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  spawnToiletDealer() {
    const stock = [
      { ...CLASSIC_ITEMS.pen },
      { ...CLASSIC_ITEMS.vape }
    ];
    // Firearms and specific magazines rolled separately (user requirement!)
    if (Math.random() < 0.40) {
      stock.push({ ...CLASSIC_ITEMS.ar15, loadedAmmo: 0 });
    }
    if (Math.random() < 0.55) {
      stock.push({ ...CLASSIC_ITEMS.makarov, loadedAmmo: 0 });
    }
    if (Math.random() < 0.50) {
      stock.push({ ...CLASSIC_ITEMS.mag_ar15 });
    }
    if (Math.random() < 0.65) {
      stock.push({ ...CLASSIC_ITEMS.mag_makarov });
    }

    // Other contraband items
    const pool = [
      CLASSIC_ITEMS.cheat_sheet,
      CLASSIC_ITEMS.energy_drink,
      CLASSIC_ITEMS.knife,
      CLASSIC_ITEMS.machete,
      CLASSIC_ITEMS.bolt_cutter,
      CLASSIC_ITEMS.janitor_key,
      CLASSIC_ITEMS.smoke_grenade
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    stock.push({ ...shuffled[0] });
    stock.push({ ...shuffled[1] });

    this.dealerStock = stock;

    const alertMsg = '🧅 DARK WEB ALERT: Diler właśnie wbił do szkolnego kibla (Kabina 2)! Ma towar i skupuje fanty!';
    this.roundLogs.unshift(alertMsg);
    io.to(this.code).emit('dealer_arrived', {
      message: alertMsg,
      clock: this.formatGameClock(),
      stock: this.dealerStock
    });
  }

  setTeacherSpeech(text, duration = 4.0) {
    this.teacher.speechText = text;
    this.teacher.speechTimer = duration;
    io.to(this.code).emit('teacher_speech', { text: text, duration: duration });
  }

  startPopQuiz(targetStudent) {
    if (this.activeQuiz || !targetStudent || targetStudent.isEliminated || targetStudent.role !== 'STUDENT') return false;
    // Exclusive events: do not trigger quiz during police raid or stun
    if (this.policeRaidPending || (this.policeOfficers && this.policeOfficers.length > 0) || this.teacherStunTimer > 0) {
      return false;
    }

    const q = CHEMISTRY_QUIZ_QUESTIONS[Math.floor(Math.random() * CHEMISTRY_QUIZ_QUESTIONS.length)];
    const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    const shuffledOptions = indices.map(idx => q.options[idx]);
    const correctIdx = indices.indexOf(q.correctIndex);
    const isWet = Math.random() < 0.4; // 40% chance for wet paper

    this.activeQuiz = {
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      question: q.question,
      options: shuffledOptions,
      correctIndex: correctIdx,
      isWet: isWet,
      isSpit: false,
      spitCount: 0,
      hasDick: false,
      dickCount: 0,
      isCheatingPhone: false,
      phoneCheatTimer: 0,
      timeRemaining: 15.0,
      spitCooldown: 0
    };

    this.popQuizCooldown = 35.0; // 35 seconds cooldown so quizzes don't spam

    const speech = "Miarka się przebrała skurwysynie jebany do odpowiedzi!";
    this.setTeacherSpeech(speech, 5.0);

    const logMsg = `📢 Halbina wzywa ${targetStudent.name} do odpowiedzi: "${speech}"!`;
    this.roundLogs.unshift(logMsg);

    io.to(this.code).emit('pop_quiz_announced', {
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      message: logMsg,
      speech: speech
    });

    io.to(targetStudent.id).emit('pop_quiz_modal', {
      question: q.question,
      options: shuffledOptions,
      isWet: isWet,
      timeRemaining: 15.0
    });

    return true;
  }

  addPlayer(socketId, characterChoice, customProfile) {
    const isHost = this.players.size === 0;
    const isClassic = this.mode === 'classic_real' || this.category === 'classic';
    const charNames = {
      romanowski: 'Romanowski',
      leszczynski: 'Leszczyński',
      wolff: 'Wolff',
      rzepa: 'Filip Rzepa'
    };

    let requestedChar = ['romanowski', 'leszczynski', 'wolff', 'rzepa'].includes(characterChoice) ? characterChoice : 'romanowski';

    // Filip Rzepa limit: Maximum 1 per lobby in arcade mode!
    if (!isClassic && requestedChar === 'rzepa') {
      const alreadyHasRzepa = Array.from(this.players.values()).some(p => p.character === 'rzepa');
      if (alreadyHasRzepa) {
        requestedChar = 'romanowski'; // Fallback to Romanowski if Rzepa is taken
      }
    }

    const customName = (customProfile && customProfile.customName) ? customProfile.customName.trim() : '';
    const fullName = isClassic ? (customName || 'Olivier Leszczyński') : charNames[requestedChar];

    const player = {
      id: socketId,
      character: requestedChar,
      name: fullName,
      fullName: fullName,
      isClassic: isClassic,
      appearance: (customProfile && customProfile.appearance) ? customProfile.appearance : {
        style: 'dresiarz',
        shirtColor: '#2c3e50',
        hairColor: '#2d3436'
      },
      bankBalance: 60.0,
      inventory: [
        { ...CLASSIC_ITEMS.notebook, quantity: 1 },
        { ...CLASSIC_ITEMS.pen, quantity: 1 }
      ],
      eduvulcan: {
        room: 'Sala 204 - Chemia',
        teacher: 'mgr Katarzyna Halbina',
        status: 'Korytarz',
        attendance: 'Oczekuje na dzwonek',
        grades: [4, 5, 3],
        uwagi: [],
        hasExcuse: false
      },
      isTardy: false,
      currentZone: isClassic ? 'CORRIDOR' : 'CHEMISTRY',
      isHost: isHost,
      role: 'STUDENT', // 'STUDENT' | 'TEACHER'
      x: 0,
      y: 0,
      angle: 0,
      assignedDeskIndex: -1,
      currentDeskIndex: -1,
      deskX: 0,
      deskY: 0,
      isSitting: (this.mode === 'normal'),
      isMoving: false,
      isShouting: false,
      shoutText: '',
      shoutEndTime: 0,
      isDucking: false,
      isCheating: false,
      chairCooldown: 0,
      paperCooldown: 0,
      speedBoostTimer: 0,
      abilityCooldowns: {
        ability1: 0,
        ability2: 0
      },
      uwagi: 0, // max 3
      points: 0,
      isEliminated: false,
      eliminationReason: '',
      immunityTimer: 0, // grace period after being caught
      shoutOptions: getRandomShouts(3),
      pingCooldown: 0
    };
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId) {
    const wasHost = this.hostId === socketId;
    this.players.delete(socketId);
    if (this.players.size === 0) {
      this.destroy();
      return null;
    }
    if (wasHost) {
      const nextHost = this.players.values().next().value;
      if (nextHost) {
        this.hostId = nextHost.id;
        nextHost.isHost = true;
      }
    }
    // If teacher left mid-game, switch teacher to AI
    if (this.teacherId === socketId) {
      this.teacherId = 'BOT';
      this.teacher.isAI = true;
    }
    return this.hostId;
  }

  startGame(teacherSelection = 'random') {
    this.state = 'STARTING';
    this.roundLogs = [];
    this.policeRaidPending = false;
    this.policeRaidTimer = 0;
    this.teacherStunTimer = 0;

    const playerList = Array.from(this.players.values());

    if (this.mode === 'boss') {
      // BOSS FIGHT MODE: Mega Halbina AI Boss vs all students!
      this.teacherId = 'BOT';
      this.teacher.isAI = true;
      this.lessonDuration = 120;
      this.timeRemaining = 120;
      this.boss.isBossMode = true;
      const count = Math.max(1, playerList.length);
      this.boss.maxHp = 900 + count * 350;
      this.boss.hp = this.boss.maxHp;
      this.boss.phase = 1;
      this.boss.acidPuddles = [];
      this.boss.chalkPickups = [];
      this.boss.stunTimer = 0;
      this.boss.bleedTimer = 0;
      this.boss.attackTimer = 2.5;

      this.teacher.x = 500;
      this.teacher.y = 110;
      this.teacher.state = 'RAGE';
      this.teacher.speed = 160;
      this.teacher.anger = 100;
      this.teacher.rageText = 'CZAS NA KARTKÓWKĘ Z ŻYCIA!';

      playerList.forEach(p => { p.role = 'STUDENT'; });
      this.roundLogs.unshift('💀 BOSS FIGHT ROZPOCZĘTY! Pokonajcie Mega Halbinę zanim minie czas!');
    } else {
      this.boss.isBossMode = false;
      if (this.mode === 'classic_real' || this.category === 'classic') {
        this.category = 'classic';
        this.mode = 'classic_real';
        this.currentLessonIndex = 0;
        this.lessonDuration = 60; // 1 minute per chemistry lesson!
        this.lessonTimer = 60.0;
        this.timeRemaining = 600; // 10 minutes session
        this.gameClockSeconds = (11 * 60 + 45) * 60; // 11:45:00
        this.corridorTimer = 20.0;
        this.bellRung = false;
        this.directorRobbed = false;
        this.activeTardyPrompt = null;
        this.pendingTardyStudents = [];
        this.courtyardDeposits = [];
        this.spawnCourtyardDeposits(12);
        this.depositSpawnTimer = 0;
        this.aiHomeworkChecked = false;
        this.aiHomeworkCheckTimer = 55.0;

        // Dark Web Toilet Dealer: Present for 10 minutes (600s)!
        this.dealerDuration = 600.0;
        this.dealerRemainingSeconds = 600.0;
        this.dealerSpawned = true;
        this.spawnToiletDealer();

        // Fire alarm & evacuation assembly
        this.fireAlarmActive = false;
        this.fireAlarmTimer = 0;
        this.pendingSmokeInterrogation = null;
        this.evacuatedStudents = new Set();

        // Teacher assignment for classic mode (supports human host, random player, or bot teacher)
        if (teacherSelection === 'bot') {
          this.teacher.isAI = true;
          this.teacherId = 'BOT';
          playerList.forEach(p => { p.role = 'STUDENT'; });
        } else if (teacherSelection === 'host' || teacherSelection === 'teacher') {
          this.teacher.isAI = false;
          const hostPlayer = playerList.find(p => p.isHost) || playerList[0];
          hostPlayer.role = 'TEACHER';
          hostPlayer.name = 'Katarzyna Halbina';
          hostPlayer.fullName = 'Katarzyna Halbina';
          this.teacherId = hostPlayer.id;
          playerList.filter(p => p.id !== hostPlayer.id).forEach(p => { p.role = 'STUDENT'; });
        } else if (playerList.length >= 2) {
          this.teacher.isAI = false;
          const teacherIndex = Math.floor(Math.random() * playerList.length);
          playerList.forEach((p, idx) => {
            if (idx === teacherIndex) {
              p.role = 'TEACHER';
              p.name = 'Katarzyna Halbina';
              p.fullName = 'Katarzyna Halbina';
              this.teacherId = p.id;
            } else {
              p.role = 'STUDENT';
            }
          });
        } else {
          // Solo testing as student -> AI Halbina
          this.teacher.isAI = true;
          this.teacherId = 'BOT';
          playerList[0].role = 'STUDENT';
        }

        this.teacher.x = 500;
        this.teacher.y = 140;
        this.teacher.currentZone = 'CHEMISTRY';
        this.teacher.angle = Math.PI / 2;
        this.teacher.state = 'BOARD';
        this.teacher.stateTimer = 4.0;
        this.teacher.anger = 0;
        this.teacher.speed = 120;
      } else if (this.mode === 'normal') {
        this.lessonDuration = 300; // 5 minut
        this.timeRemaining = 300;
      } else if (this.mode === 'hardcore') {
        this.lessonDuration = 60;
        this.timeRemaining = 60;
      } else {
        this.lessonDuration = 90;
        this.timeRemaining = 90;
      }

      if (this.mode !== 'classic_real') {
        // Assign Katarzyna Halbina for arcade modes
        if (playerList.length === 1 || teacherSelection === 'bot') {
          this.teacherId = 'BOT';
          this.teacher.isAI = true;
          playerList[0].role = 'STUDENT';
        } else {
          const teacherIndex = Math.floor(Math.random() * playerList.length);
          playerList.forEach((p, idx) => {
            if (idx === teacherIndex) {
              p.role = 'TEACHER';
              this.teacherId = p.id;
              this.teacher.isAI = false;
            } else {
              p.role = 'STUDENT';
            }
          });
        }

        this.teacher.x = 500;
        this.teacher.y = 110;
        this.teacher.state = 'BOARD';
        this.teacher.stateTimer = 4.0;
        this.teacher.anger = 0;
        this.teacher.inspectionsThisTurn = 0;
        this.teacher.speed = 120;
      }
    }

    // Assign desks and chairs to students
    let deskCounter = 0;
    playerList.forEach((p, idx) => {
      p.points = 0;
      p.uwagi = 0;
      p.isEliminated = false;
      p.immunityTimer = 0;
      p.isShouting = false;
      p.shoutText = '';
      p.isDucking = false;
      p.isCheating = false;
      p.chairCooldown = 0;
      p.paperCooldown = 0;
      p.speedBoostTimer = 0;
      p.abilityCooldowns = { ability1: 0, ability2: 0 };
      p.shoutOptions = getRandomShouts(3);
      p.bossDamage = 0;
      p.hasSuperChalk = false;
      p.hasHomework = false;
      if (p.eduvulcan) {
        p.eduvulcan.homeworkStatus = 'Nieodrobione ❌';
        p.eduvulcan.homeworkChecked = null;
      }

      if (this.mode === 'classic_real') {
        if (p.role === 'STUDENT') {
          // Classic Mode: Students spawn in school corridor!
          p.currentZone = 'CORRIDOR';
          p.x = 320 + ((idx * 85) % 360);
          p.y = 380 + ((idx * 40) % 180);
          p.isSitting = false;
          p.currentDeskIndex = -1;
          p.assignedDeskIndex = deskCounter % CLASSIC_DESK_SLOTS.length;
          p.isTardy = false;
          if (p.eduvulcan) {
            p.eduvulcan.status = 'Korytarz';
            p.eduvulcan.attendance = 'Oczekuje na dzwonek (20s)';
          }
          deskCounter++;
        } else {
          // Teacher Halbina in Sala 204
          p.currentZone = 'CHEMISTRY';
          p.x = 500;
          p.y = 140;
          p.angle = Math.PI / 2;
          p.isSitting = false;
        }
      } else {
        // Arcade Modes: Students spawn seated at desks in Sala 204
        p.currentZone = 'CHEMISTRY';
        p.isSitting = (this.mode === 'normal' && p.role === 'STUDENT');
        if (p.role === 'STUDENT') {
          const desk = DESK_SLOTS[deskCounter % DESK_SLOTS.length];
          p.assignedDeskIndex = desk.id;
          p.currentDeskIndex = desk.id;
          p.deskX = desk.chairX;
          p.deskY = desk.chairY;
          p.x = desk.chairX;
          p.y = desk.chairY;
          deskCounter++;
        } else {
          p.x = 500;
          p.y = 110;
        }
      }
    });

    this.smokeClouds = [];
    this.projectiles = [];
    this.policeOfficers = [];
    this.policeRaidPending = false;
    this.policeRaidTimer = 0;

    // Start game loop
    this.lastTickTime = Date.now();
    if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
    this.gameLoopInterval = setInterval(() => this.tick(), 1000 / 25); // 25 updates/sec
  }

  damageBoss(amount, player, reason) {
    if (!this.boss.isBossMode || this.boss.hp <= 0) return;
    this.boss.hp = Math.max(0, this.boss.hp - amount);
    if (player) {
      player.points += Math.round(amount * 10);
      player.bossDamage = (player.bossDamage || 0) + Math.round(amount);
    }

    const pct = this.boss.hp / this.boss.maxHp;
    if (pct <= 0.33 && this.boss.phase < 3) {
      this.boss.phase = 3;
      this.teacher.state = 'RAGE';
      this.teacher.speed = 200;
      const rageMsg = '🔥 MEGA HALBINA WPADA W SZAŁ OSTATECZNY (FAZA 3)!';
      this.roundLogs.unshift(rageMsg);
      io.to(this.code).emit('boss_phase_changed', { phase: 3, message: rageMsg });
    } else if (pct <= 0.66 && this.boss.phase < 2) {
      this.boss.phase = 2;
      this.teacher.speed = 175;
      const phase2Msg = '⚡ HALBINA PRZECHODZI DO FAZY 2: ZIRYTOWANA CHEMICZKA!';
      this.roundLogs.unshift(phase2Msg);
      io.to(this.code).emit('boss_phase_changed', { phase: 2, message: phase2Msg });
    }

    io.to(this.code).emit('boss_damaged', {
      damage: Math.round(amount),
      hp: Math.round(this.boss.hp),
      maxHp: Math.round(this.boss.maxHp),
      reason: reason,
      attackerName: player ? player.name : null
    });

    if (this.boss.hp <= 0) {
      this.endGame('BOSS_DEFEATED');
    }
  }

  executeBossAttack() {
    if (this.state !== 'IN_GAME' || !this.boss.isBossMode) return;
    const attacks = ['acid', 'exams'];
    if (this.boss.phase >= 2) attacks.push('shockwave');
    const attack = attacks[Math.floor(Math.random() * attacks.length)];

    if (attack === 'acid') {
      const flaskCount = this.boss.phase === 3 ? 3 : 2;
      for (let i = 0; i < flaskCount; i++) {
        const tx = 180 + Math.random() * 640;
        const ty = 250 + Math.random() * 330;
        const flask = {
          id: 'acid_' + Date.now() + '_' + i,
          type: 'acid_flask',
          startX: this.teacher.x,
          startY: this.teacher.y + 10,
          targetX: tx,
          targetY: ty,
          t: 0,
          duration: 1.15
        };
        this.projectiles.push(flask);
      }
      const msg = '🧪 Halbina ciska kolbami z wrzącym kwasem siarkowym!';
      this.roundLogs.unshift(msg);
      io.to(this.code).emit('boss_attack_warning', { attack: 'acid', message: msg });
    } else if (attack === 'exams') {
      const examCount = this.boss.phase === 3 ? 5 : 3;
      const students = Array.from(this.players.values()).filter(p => !p.isEliminated && p.role === 'STUDENT');
      for (let i = 0; i < examCount; i++) {
        let tx = 500 + (Math.random() - 0.5) * 600;
        let ty = 300 + Math.random() * 300;
        if (students.length > 0 && Math.random() < 0.75) {
          const targetStudent = students[Math.floor(Math.random() * students.length)];
          tx = targetStudent.x;
          ty = targetStudent.y;
        }
        const examProj = {
          id: 'exam_' + Date.now() + '_' + i,
          type: 'exam',
          startX: this.teacher.x,
          startY: this.teacher.y + 10,
          targetX: tx,
          targetY: ty,
          t: 0,
          duration: 1.25 + Math.random() * 0.3
        };
        this.projectiles.push(examProj);
      }
      const msg = '📝 "NIEZAPOWIEDZIANA KARTKÓWKA!" – Halbina ciska jedynkami! Schowaj się pod ławką [C]!';
      this.roundLogs.unshift(msg);
      io.to(this.code).emit('boss_attack_warning', { attack: 'exams', message: msg });
    } else if (attack === 'shockwave') {
      const msg = '💥 "WY GŁUPIE SKURWYSYNY!" – Fala uderzeniowa Halbina odrzuca całą klasę!';
      this.roundLogs.unshift(msg);
      io.to(this.code).emit('boss_shockwave', { message: msg });
      this.players.forEach(p => {
        if (p.role === 'STUDENT' && !p.isEliminated) {
          p.y = Math.min(650, p.y + 65);
        }
      });
    }
  }

  tick() {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    if (this.state !== 'IN_GAME') return;

    // Lesson countdown
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.endGame('BELL'); // Lesson finished, bell rings!
      return;
    }

    // Classic Mode: Clock, Corridor 20s bell, and Toilet Dealer at 11:55
    if (this.mode === 'classic_real') {
      // 1s real time = 15s game time (every 4s = 1 min game time)
      this.gameClockSeconds += dt * 15;

      // 20-second corridor countdown before bell rings
      if (this.corridorTimer > 0) {
        this.corridorTimer -= dt;
        if (this.corridorTimer <= 0 && !this.bellRung) {
          this.corridorTimer = 0;
          this.bellRung = true;
          io.to(this.code).emit('classic_bell_rung', {
            message: '🔔 DZWONEK NA LEKCJĘ! Wszyscy powinni być już w Sali 204 z EduVulcan!'
          });
          this.roundLogs.unshift('🔔 DZWONEK! Rozpoczęła się lekcja chemii w Sali 204!');

          // Check who made it into Sala 204
          this.players.forEach(p => {
            if (p.role === 'STUDENT' && !p.isEliminated) {
              const zone = p.currentZone || 'CORRIDOR';
              if (zone === 'CHEMISTRY') {
                if (p.eduvulcan) p.eduvulcan.attendance = 'Obecny (Przed dzwonkiem)';
                p.isTardy = false;
                p.points += 150;
              } else {
                if (p.eduvulcan) p.eduvulcan.attendance = 'Spóźniony na lekcję';
                p.isTardy = true;
                const tardyMsg = `⚠️ ${p.fullName || p.name} spóźnił się na lekcję (jest w: ${zone})!`;
                this.roundLogs.unshift(tardyMsg);
              }
            }
          });
        }
      }

      // 1-minute chemistry lesson rotation timer (each lesson is 60s)
      if (this.bellRung) {
        this.lessonTimer -= dt;
        if (this.lessonTimer <= 0) {
          this.lessonTimer = 60.0;
          this.currentLessonIndex = (this.currentLessonIndex + 1) % CHEMISTRY_LESSONS_SCHEDULE.length;
          const currentLesson = CHEMISTRY_LESSONS_SCHEDULE[this.currentLessonIndex];
          const bellMsg = `🔔 DZWONEK! Nowa lekcja: ${currentLesson.title} (${currentLesson.time})!`;
          this.roundLogs.unshift(bellMsg);
          io.to(this.code).emit('classic_bell_rung', {
            message: bellMsg,
            lesson: currentLesson
          });
          this.players.forEach(p => {
            if (p.eduvulcan) {
              p.eduvulcan.currentLesson = currentLesson;
            }
          });
        }
      }

      // Dark Web Toilet Dealer countdown (stays for 10 minutes = 600s)
      if (this.dealerSpawned) {
        this.dealerRemainingSeconds = Math.max(0, this.dealerRemainingSeconds - dt);
        if (this.dealerRemainingSeconds <= 0) {
          this.dealerSpawned = false;
          const depMsg = '🧅 DARK WEB: Diler zwinął towar i uciekł ze szkolnego kibla przez okno!';
          this.roundLogs.unshift(depMsg);
          io.to(this.code).emit('dealer_departed', { message: depMsg });
        }
      }

      // Fire Alarm & School Evacuation Assembly in Courtyard
      if (this.fireAlarmActive) {
        this.fireAlarmTimer = Math.max(0, this.fireAlarmTimer - dt);

        // Award students who safely evacuated to courtyard
        this.players.forEach(p => {
          if (p.role === 'STUDENT' && !p.isEliminated && p.currentZone === 'COURTYARD') {
            if (!this.evacuatedStudents.has(p.id)) {
              this.evacuatedStudents.add(p.id);
              p.points += 100;
              io.to(p.id).emit('evacuation_bonus_awarded', {
                message: '🏃 Wzorowa ewakuacja pożarowa na boisko szkolne! (+100 pkt)'
              });
            }
          }
        });

        // If teacher is AI or human didn't respond in 3.5s, auto-answer for AI Halbina
        if (this.pendingSmokeInterrogation && this.pendingSmokeInterrogation.active) {
          this.pendingSmokeInterrogation.timer = (this.pendingSmokeInterrogation.timer || 0) + dt;
          const isAiTeacher = (this.teacherId === 'BOT' || !this.teacherId);
          if (isAiTeacher && this.pendingSmokeInterrogation.timer >= 2.5) {
            this.resolveSmokeInterrogation(Math.floor(Math.random() * 3) + 1, 'Halbina (AI)');
          }
        }

        if (this.fireAlarmTimer <= 0) {
          this.fireAlarmActive = false;
          this.pendingSmokeInterrogation = null;
          io.to(this.code).emit('fire_alarm_ended', { message: '🚨 Alarm pożarowy odwołany! Można wrócić do sal.' });
        }
      }

      // Outdoor deposit items periodic respawn on field
      this.depositSpawnTimer = (this.depositSpawnTimer || 0) + dt;
      if (this.depositSpawnTimer >= 15.0) {
        this.depositSpawnTimer = 0;
        if (!this.courtyardDeposits) this.courtyardDeposits = [];
        if (this.courtyardDeposits.length < 12) {
          this.spawnCourtyardDeposits(12);
          io.to(this.code).emit('courtyard_deposits_updated', { deposits: this.courtyardDeposits });
        }
      }

      // AI Halbina homework check
      if (this.bellRung && !this.aiHomeworkChecked && (this.teacherId === 'BOT' || !this.teacherId)) {
        this.aiHomeworkCheckTimer -= dt;
        if (this.aiHomeworkCheckTimer <= 0) {
          this.aiHomeworkChecked = true;
          this.triggerAiHomeworkCheck();
        }
      }
    }

    // Anger natural slow cooldown
    if (this.teacher.state !== 'RAGE' && this.teacher.anger > 0) {
      this.teacher.anger = Math.max(0, this.teacher.anger - 2.5 * dt);
    }

    // Police Raid Timer countdown (active sirens)
    if (this.policeActiveTimer > 0) {
      this.policeActiveTimer -= dt;
      if (this.policeActiveTimer <= 0) {
        io.to(this.code).emit('police_raid_ended');
      }
    }

    // Police Raid Pending (8s countdown after chair thrown before police storm in)
    if (this.policeRaidPending) {
      this.policeRaidTimer -= dt;
      if (this.policeRaidTimer <= 0) {
        this.policeRaidPending = false;
        this.policeRaidTimer = 0;
        this.spawnPoliceOfficers();
      }
    }

    // Police Officers update (AI chasing students & fleeing when defeated)
    // Police Officers update (AI chasing students & fleeing/leaving when resolved)
    if (this.policeOfficers && this.policeOfficers.length > 0) {
      const activeStudents = Array.from(this.players.values()).filter(p => p.role === 'STUDENT' && !p.isEliminated && (p.currentZone || 'CHEMISTRY') === 'CHEMISTRY');
      const rzepaStudent = activeStudents.find(p => p.character === 'rzepa');

      // Teacher is paralyzed in shock observing the police raid and cannot act
      this.teacher.state = 'SHOCKED';
      this.teacher.speechText = '👀 (W szoku obserwuje interwencję policji...)';
      this.teacher.stateTimer = 5.0;

      for (let i = this.policeOfficers.length - 1; i >= 0; i--) {
        const cop = this.policeOfficers[i];

        if (cop.speechTimer > 0) {
          cop.speechTimer -= dt;
          if (cop.speechTimer <= 0) cop.speech = '';
        }
        if (cop.tackleCooldown > 0) cop.tackleCooldown -= dt;
        if (cop.hitTimer > 0) cop.hitTimer -= dt;

        if (cop.state === 'FLEEING' || cop.state === 'LEAVING') {
          // Sprint out of classroom towards door (x = 30)
          cop.x -= cop.speed * dt;
          if (cop.x <= 30) {
            this.policeOfficers.splice(i, 1);
            continue;
          }
        } else {
          // CHASING: Police primarily targets Filip Rzepa with machete! If Rzepa is ducking/in smoke, chases nearest student
          let target = null;
          if (rzepaStudent && !rzepaStudent.isDucking && !rzepaStudent.isInSmoke) {
            target = rzepaStudent;
          } else {
            let minDist = 99999;
            for (const s of activeStudents) {
              const dist = Math.hypot(cop.x - s.x, cop.y - s.y);
              const prioDist = s.isDucking ? dist + 500 : dist;
              if (prioDist < minDist) {
                minDist = prioDist;
                target = s;
              }
            }
          }

          if (target) {
            const dx = target.x - cop.x;
            const dy = target.y - cop.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 15) {
              cop.x += (dx / dist) * cop.speed * dt;
              cop.y += (dy / dist) * cop.speed * dt;
            }

            // Tackling / hitting student with baton
            if (dist <= 44 && !target.isDucking && !target.isInSmoke && cop.tackleCooldown <= 0 && target.immunityTimer <= 0) {
              cop.tackleCooldown = 3.5;

              if (target.character === 'rzepa') {
                // FILIP RZEPA CAUGHT BY POLICE!
                cop.speech = 'MAMY GO! RZUĆ MACZETĘ! NA GLEBĘ!';
                cop.speechTimer = 3.5;

                this.penalizeStudent(target, 'POLICE_BATON');

                const caughtMsg = `🚨 POLICJA SPACYFIKOWAŁA FILIPA RZEPĘ! ${cop.name} obezwładnił Rzepę pałką! Interwencja zakończona!`;
                this.roundLogs.unshift(caughtMsg);

                io.to(this.code).emit('police_caught_rzepa', {
                  copName: cop.name,
                  rzepaName: target.name,
                  message: caughtMsg
                });

                // All cops wrap up and leave the classroom
                this.policeOfficers.forEach(c => {
                  c.state = 'LEAVING';
                  c.speed = 220;
                  c.speech = 'Interwencja zakończona! Wychodzimy!';
                  c.speechTimer = 3.0;
                });

                // Teacher recovers after police leaves
                setTimeout(() => {
                  if (this.state === 'IN_GAME') {
                    this.teacher.state = 'BOARD';
                    this.teacher.stateTimer = 5.0;
                    this.setTeacherSpeech("I bardzo dobrze! Koniec cyrku, wracamy do lekcji!", 4.0);
                  }
                }, 1600);
              } else {
                cop.speech = 'MASZ UWAGĘ! NA GLEBĘ!';
                cop.speechTimer = 2.0;

                this.penalizeStudent(target, 'POLICE_BATON');
                io.to(this.code).emit('cop_tackled_student', {
                  copName: cop.name,
                  studentId: target.id,
                  studentName: target.name
                });
              }
            }
          }
        }
      }

      // Check if all police officers left the classroom
      if (this.policeOfficers.length === 0 && this.policeActiveTimer > 0) {
        this.policeActiveTimer = 0;
        io.to(this.code).emit('police_raid_ended');
        this.teacher.state = 'BOARD';
        this.teacher.stateTimer = 5.0;
      }
    }

    // Teacher Stun & Blinded Timer (Pepper spray 500ml)
    if (this.teacherStunTimer > 0) {
      this.teacherStunTimer -= dt;
      if (this.teacherStunTimer <= 0) {
        this.teacherStunTimer = 0;
        io.to(this.code).emit('teacher_recovered');
      }
    }

    // Teacher speech bubble timer
    if (this.teacher.speechTimer > 0) {
      this.teacher.speechTimer -= dt;
      if (this.teacher.speechTimer <= 0) {
        this.teacher.speechText = '';
      }
    }

    // Human teacher turn timers (2 seconds looking at class, 5 seconds cooldown)
    if (this.teacherTurnCooldown > 0) {
      this.teacherTurnCooldown -= dt;
    }
    if (!this.teacher.isAI && this.teacher.state === 'CLASS') {
      this.teacherTurnDuration -= dt;
      if (this.teacherTurnDuration <= 0) {
        this.teacher.state = 'BOARD';
        this.teacherTurnCooldown = 5.0; // 5s cooldown
        this.teacher.inspectionsThisTurn = 0;
        io.to(this.code).emit('teacher_turned', { state: 'BOARD', cooldown: 5.0 });
      }
    }

    // Pop Quiz / Kartkówka timers & AI trigger
    if (this.popQuizCooldown > 0) {
      this.popQuizCooldown -= dt;
    }
    if (this.activeQuiz) {
      this.activeQuiz.timeRemaining -= dt;
      if (this.activeQuiz.spitCooldown > 0) {
        this.activeQuiz.spitCooldown -= dt;
      }

      // Check phone cheating progress & teacher vision
      if (this.activeQuiz.isCheatingPhone) {
        this.activeQuiz.phoneCheatTimer += dt;
        const student = this.players.get(this.activeQuiz.studentId);
        const teacherLooking = !this.boss.isBossMode && this.teacherStunTimer <= 0 && (this.teacher.state === 'CLASS' || this.teacher.state === 'RAGE');
        if (teacherLooking && student && !student.isEliminated) {
          const inVision = isStudentInVisionCone(student.x, student.y, this.teacher.x, this.teacher.y);
          if (inVision && !student.isInSmoke) {
            // CAUGHT RED-HANDED WITH PHONE -> STRAIGHT TO DIRECTOR!
            this.activeQuiz.isCheatingPhone = false;
            student.isEliminated = true;
            student.eliminationReason = 'Przyłapany na ściąganiu z telefonu na kartkówce!';
            student.uwagi = 3;

            this.setTeacherSpeech("DO DYREKTORA WYPIERDALAJ Z TYM TELEFONEM!", 5.0);
            const expellMsg = `🚨 ${student.name} został PRZYŁAPANY NA TELEFONIE podczas kartkówki i leci prosto do DYREKTORA!`;
            this.roundLogs.unshift(expellMsg);

            this.activeQuiz = null;
            io.to(this.code).emit('pop_quiz_closed');
            io.to(this.code).emit('student_expelled', {
              playerId: student.id,
              playerName: student.name,
              message: expellMsg
            });
          }
        }
      }

      if (this.activeQuiz && this.activeQuiz.timeRemaining <= 0) {
        const student = this.players.get(this.activeQuiz.studentId);
        this.activeQuiz = null;
        io.to(this.code).emit('pop_quiz_closed');
        if (student && !student.isEliminated) {
          this.penalizeStudent(student, 'QUIZ_FAIL');
          this.setTeacherSpeech("Ty kurwo głupia!", 4.0);
          const failMsg = `❌ Czas minął! ${student.name} nie odpowiedział na kartkówce! Halbina krzyczy: "TY KURWO GŁUPIA!"`;
          this.roundLogs.unshift(failMsg);
          io.to(this.code).emit('pop_quiz_result', { success: false, studentName: student.name, message: failMsg });
        }
      }
    } else if (this.teacher.isAI && !this.boss.isBossMode && this.teacher.anger >= 65 && this.popQuizCooldown <= 0 && !this.activeQuiz) {
      // AI Halbina triggers pop quiz only if anger is high and NO police raid is happening
      const hasPolice = this.policeRaidPending || (this.policeOfficers && this.policeOfficers.length > 0);
      if (!hasPolice && this.teacherStunTimer <= 0) {
        if (Math.random() < 0.05 * dt) {
          const activeStudents = Array.from(this.players.values()).filter(p => p.role === 'STUDENT' && !p.isEliminated && (p.currentZone || 'CHEMISTRY') === 'CHEMISTRY');
          if (activeStudents.length > 0) {
            const target = activeStudents[Math.floor(Math.random() * activeStudents.length)];
            this.startPopQuiz(target);
          }
        }
      }
    }

    // Teacher RAGE timer
    if (this.teacher.state === 'RAGE') {
      this.teacher.rageTimer -= dt;
      if (this.teacher.rageTimer <= 0) {
        this.teacher.state = 'CLASS';
        this.teacher.stateTimer = 3.5;
        this.teacher.rageText = '';
        this.teacher.inspectionsThisTurn = 0;
        io.to(this.code).emit('teacher_turned', { state: 'CLASS' });
      }
    }

    // Vape smoke clouds update
    for (let i = this.smokeClouds.length - 1; i >= 0; i--) {
      const cloud = this.smokeClouds[i];
      cloud.timer -= dt;
      if (cloud.timer <= 0) {
        this.smokeClouds.splice(i, 1);
      }
    }

    // Projectiles (Paper airplanes, Kleszcze, Chairs, Pepper Spray, Acid Flasks, Exams) update
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.t += dt / proj.duration;
      if (proj.t >= 1.0) {
        io.to(this.code).emit('projectile_landed', {
          id: proj.id,
          type: proj.type,
          x: proj.targetX,
          y: proj.targetY,
          ownerId: proj.ownerId
        });

        const thrower = proj.ownerId ? this.players.get(proj.ownerId) : null;

        if (proj.type === 'chair') {
          // Chair thrown hits Halbina!
          io.to(this.code).emit('chair_hit_teacher', {
            throwerName: thrower ? thrower.name : 'Uczeń',
            x: this.teacher.x,
            y: this.teacher.y
          });

          if (this.boss.isBossMode) {
            this.damageBoss(70, thrower, 'RZUT KRZESŁEM');
            this.boss.stunTimer = 2.0;
            const chairMsg = `🪑 Krzesło uderzyło w Mega Halbinę! (-70 HP, 2s ogłuszenia!)`;
            this.roundLogs.unshift(chairMsg);
            io.to(this.code).emit('teacher_distracted', { message: chairMsg });
          } else {
            this.teacher.anger = 100;
            const speech = "CO ZA BYDŁO! DZWONIĘ PO POLICJĘ!";
            this.setTeacherSpeech(speech, 5.0);
            this.policeRaidPending = true;
            this.policeRaidTimer = 8.0;

            const chairMsg = `🪑 Krzesło trafiło w Halbinę! Halbina wściekła (100% wkurwienia) DZWONI PO POLICJĘ! Szkieły wbijają za 8 sekund!`;
            this.roundLogs.unshift(chairMsg);
            io.to(this.code).emit('police_call_initiated', {
              duration: 8.0,
              speech: speech,
              message: chairMsg
            });
            if (thrower) thrower.points += 250;
          }
        } else if (proj.type === 'pepper_spray') {
          // Pepper Spray hits Halbina!
          this.teacherStunTimer = 3.0;
          if (this.boss.isBossMode) {
            this.damageBoss(50, thrower, 'GAZ PIEPRZOWY');
            this.boss.stunTimer = 3.0;
          }
          this.setTeacherSpeech("AARGH! MOJE OCZY! CO TO ZA GAZ?!", 3.5);
          const sprayMsg = `🌶️ Gaz pieprzowy 500ml trafił Halbinę prosto w twarz! Jest OGŁUSZONA i OŚLEPIONA na 3 sekundy!`;
          this.roundLogs.unshift(sprayMsg);
          io.to(this.code).emit('teacher_stunned', {
            duration: 3.0,
            message: sprayMsg
          });
          if (thrower) thrower.points += 200;
        } else if (proj.type === 'kleszcz') {
          if (this.boss.isBossMode) {
            // Boss Hit!
            this.damageBoss(65, thrower, 'RZUT KLESZCZEM');
            this.boss.stunTimer = 2.5;
            this.boss.bleedTimer = 4.0;
            const kleszczMsg = `🕷️ Kleszcz Leszczyńskiego wgryzł się w Halbinę! Halbina jest SPARALIŻOWANA (2.5s) i krwawi (-20 HP/s)!`;
            this.roundLogs.unshift(kleszczMsg);
            io.to(this.code).emit('teacher_distracted', { message: kleszczMsg });
          } else {
            this.teacher.stateTimer += 2.0;
            const kleszczMsg = `🕷️ Kleszcz Leszczyńskiego przyczepił się do Halbina! Halbina musi go wyciągać (+2s opóźnienia)!`;
            this.roundLogs.unshift(kleszczMsg);
            io.to(this.code).emit('teacher_distracted', { message: kleszczMsg });
            if (thrower) thrower.points += 200;
          }
        } else if (proj.type === 'paper') {
          if (this.boss.isBossMode) {
            if (proj.targetY <= 190) {
              if (proj.isChalk) {
                this.damageBoss(85, thrower, 'SUPER KREDA');
                const chalkHitMsg = `🖍️ ${thrower ? thrower.name : 'Uczeń'} trafił Halbinę SUPER KREDĄ! Potężne 85 DMG!`;
                this.roundLogs.unshift(chalkHitMsg);
                io.to(this.code).emit('teacher_distracted', { message: chalkHitMsg });
              } else {
                const dmg = (thrower && thrower.speedBoostTimer > 0) ? 52 : 35;
                this.damageBoss(dmg, thrower, 'SAMOLOT');
                const hitMsg = `✈️ Samolot trafił w Halbinę (-${dmg} HP)!`;
                this.roundLogs.unshift(hitMsg);
                io.to(this.code).emit('teacher_distracted', { message: hitMsg });
              }
            }
          } else {
            // Paper airplane hits near blackboard -> distracts Halbina
            if (proj.targetY <= 170 && (this.teacher.state === 'CLASS' || this.teacher.state === 'TURNING')) {
              this.teacher.state = 'BOARD';
              this.teacher.stateTimer = 2.8;
              this.teacher.inspectionsThisTurn = 0;
              const distractMsg = `✈️ Samolot z papieru trafił w tablicę! Halbina odwraca się sprawdzić, kto rzucił!`;
              this.roundLogs.unshift(distractMsg);
              io.to(this.code).emit('teacher_distracted', { message: distractMsg });
              if (thrower) thrower.points += 150;
            }
          }
        } else if (proj.type === 'acid_flask') {
          // Acid Flask lands on floor and spawns acid puddle
          this.boss.acidPuddles.push({
            id: 'acid_puddle_' + Date.now() + '_' + Math.random(),
            x: proj.targetX,
            y: proj.targetY,
            radius: 46,
            duration: 9.0,
            timer: 9.0
          });
          io.to(this.code).emit('acid_puddle_created', { x: proj.targetX, y: proj.targetY });
        } else if (proj.type === 'exam') {
          // Test paper barrage hits classroom
          this.players.forEach(p => {
            if (p.role === 'STUDENT' && !p.isEliminated && p.immunityTimer <= 0 && (p.currentZone || 'CHEMISTRY') === 'CHEMISTRY') {
              if (Math.hypot(p.x - proj.targetX, p.y - proj.targetY) <= 38) {
                // Ducking behind desk or being inside smoke cloud protects the student!
                if (p.isDucking || p.isInSmoke) {
                  io.to(p.id).emit('exam_dodged', { message: 'Uniknąłeś kartkówki!' });
                } else {
                  this.penalizeStudent(p, 'EXAM');
                }
              }
            }
          });
        } else if (proj.type === 'bullet_ar15' || proj.type === 'bullet_makarov') {
          // Check bullet hit on police officers
          if (this.policeOfficers && this.policeOfficers.length > 0) {
            for (let c = this.policeOfficers.length - 1; c >= 0; c--) {
              const cop = this.policeOfficers[c];
              if (cop.state !== 'FLEEING' && cop.state !== 'LEAVING' && Math.hypot(cop.x - proj.targetX, cop.y - proj.targetY) <= 65) {
                cop.hp -= (proj.damage || 50);
                cop.hitTimer = 0.5;
                const shooterName = thrower ? (thrower.fullName || thrower.name) : 'Uczeń';
                if (cop.hp <= 0) {
                  cop.state = 'FLEEING';
                  cop.speech = 'DOSTAŁEM KULKĘ! ODWRÓT!';
                  cop.speechTimer = 3.0;
                  cop.speed = 280;
                  const copMsg = `💥 POLICJANT ${cop.name} ZOSTAŁ POSTRZELONY PRZEZ ${shooterName} I UCIEKA ZE SZKOŁY!`;
                  this.roundLogs.unshift(copMsg);
                  io.to(this.code).emit('cop_shot_down', { copName: cop.name, shooterName: shooterName, message: copMsg });
                  if (thrower) thrower.points += 400;
                } else {
                  cop.speech = 'AŁA! STRZELAJĄ DO NAS!';
                  cop.speechTimer = 2.0;
                }
              }
            }
          }

          if (this.boss.isBossMode && Math.hypot(this.teacher.x - proj.targetX, this.teacher.y - proj.targetY) <= 75) {
            this.damageBoss(proj.damage || 50, thrower, 'STRZAŁ Z BRONI');
          } else if (!this.boss.isBossMode && Math.hypot(this.teacher.x - proj.targetX, this.teacher.y - proj.targetY) <= 80) {
            this.teacherStunTimer = 5.0;
            this.teacher.anger = 0;
            this.setTeacherSpeech("JEZUS MARIA! KTOŚ DO MNIE STRZELA! SCHOWAJCIE SIĘ!", 5.0);
            const shotMsg = `💥 Pocisk trafił w katedrę Halbina! Halbina w panice kuli się pod biurkiem (ogłuszenie 5s)!`;
            this.roundLogs.unshift(shotMsg);
            io.to(this.code).emit('teacher_stunned', { duration: 5.0, message: shotMsg });
            if (thrower) thrower.points += 300;
          }
        }
        this.projectiles.splice(i, 1);
      }
    }

    // BOSS FIGHT LOOP
    if (this.boss.isBossMode) {
      // 1. Boss Stun & Bleed DoT
      if (this.boss.stunTimer > 0) {
        this.boss.stunTimer -= dt;
      }
      if (this.boss.bleedTimer > 0) {
        this.boss.bleedTimer -= dt;
        this.damageBoss(20 * dt, null, 'KRWAWIENIE');
      }

      // 2. Boss Patrol along blackboard
      if (this.boss.stunTimer <= 0) {
        if (Math.random() < 0.03) {
          this.teacher.targetX = 260 + Math.random() * 480;
        }
        if (this.teacher.x < this.teacher.targetX) {
          this.teacher.x = Math.min(this.teacher.targetX, this.teacher.x + this.teacher.speed * 0.7 * dt);
        } else if (this.teacher.x > this.teacher.targetX) {
          this.teacher.x = Math.max(this.teacher.targetX, this.teacher.x - this.teacher.speed * 0.7 * dt);
        }
      }

      // 3. Acid Puddles timer
      for (let i = this.boss.acidPuddles.length - 1; i >= 0; i--) {
        const puddle = this.boss.acidPuddles[i];
        puddle.timer -= dt;
        if (puddle.timer <= 0) {
          this.boss.acidPuddles.splice(i, 1);
        }
      }

      // 4. Chalk Pickups timer & spawn
      for (let i = this.boss.chalkPickups.length - 1; i >= 0; i--) {
        const chalk = this.boss.chalkPickups[i];
        chalk.timer -= dt;
        if (chalk.timer <= 0) {
          this.boss.chalkPickups.splice(i, 1);
        }
      }
      if (this.boss.chalkPickups.length < 3 && Math.random() < 0.035) {
        this.boss.chalkPickups.push({
          id: 'chalk_' + Date.now() + '_' + Math.random(),
          x: 180 + Math.random() * 640,
          y: 280 + Math.random() * 300,
          timer: 16.0
        });
      }

      // 5. Boss Attack Trigger
      if (this.boss.stunTimer <= 0) {
        this.boss.attackTimer -= dt;
        if (this.boss.attackTimer <= 0) {
          this.executeBossAttack();
          const cooldownByPhase = [3.8, 3.0, 2.2];
          this.boss.attackTimer = cooldownByPhase[this.boss.phase - 1] + Math.random() * 0.9;
        }
      }

      // 6. Student interactions with acid puddles & chalk pickups
      this.players.forEach(p => {
        if (p.isEliminated || p.role !== 'STUDENT') return;

        // Romanowski milk cleans acid on contact
        if (p.speedBoostTimer > 0) {
          for (let i = this.boss.acidPuddles.length - 1; i >= 0; i--) {
            const puddle = this.boss.acidPuddles[i];
            if (Math.hypot(p.x - puddle.x, p.y - puddle.y) <= puddle.radius + 35) {
              this.boss.acidPuddles.splice(i, 1);
              p.points += 100;
              const msg = `🥛 ${p.name} zneutralizował kwas mlekiem! (+100 pkt)`;
              this.roundLogs.unshift(msg);
              io.to(this.code).emit('acid_neutralized', { x: puddle.x, y: puddle.y, message: msg });
            }
          }
        }

        // Stepping in acid without milk/immunity (only in classroom)
        if (p.immunityTimer <= 0 && p.speedBoostTimer <= 0 && (p.currentZone || 'CHEMISTRY') === 'CHEMISTRY') {
          for (const puddle of this.boss.acidPuddles) {
            if (Math.hypot(p.x - puddle.x, puddle.y - p.y) <= puddle.radius) {
              this.penalizeStudent(p, 'ACID');
              break;
            }
          }
        }

        // Stepping over chalk pickup (only in classroom)
        if ((p.currentZone || 'CHEMISTRY') === 'CHEMISTRY') {
          for (let i = this.boss.chalkPickups.length - 1; i >= 0; i--) {
            const chalk = this.boss.chalkPickups[i];
            if (Math.hypot(p.x - chalk.x, p.y - chalk.y) <= 32) {
              this.boss.chalkPickups.splice(i, 1);
              p.hasSuperChalk = true;
              io.to(p.id).emit('chalk_picked_up', { message: '🖍️ Podniosłeś Super Kredę! Twój następny rzut [F] zada 85 DMG!' });
              break;
            }
          }
        }
      });
    }

    // CLASSIC / HARDCORE / NORMAL AI TEACHER LOGIC
    if (!this.boss.isBossMode && this.teacher.isAI && this.teacher.state !== 'RAGE' && this.teacherStunTimer <= 0) {
      this.teacher.stateTimer -= dt;

      // Small teacher patrol along blackboard
      if (Math.random() < 0.02) {
        this.teacher.targetX = 350 + Math.random() * 300;
      }
      if (this.teacher.x < this.teacher.targetX) {
        this.teacher.x = Math.min(this.teacher.targetX, this.teacher.x + this.teacher.speed * 0.5 * dt);
      } else if (this.teacher.x > this.teacher.targetX) {
        this.teacher.x = Math.max(this.teacher.targetX, this.teacher.x - this.teacher.speed * 0.5 * dt);
      }

      if (this.teacher.stateTimer <= 0) {
        if (this.teacher.state === 'BOARD') {
          this.teacher.state = 'TURNING';
          this.teacher.angle = 0;
          this.teacher.stateTimer = 2.2; // 2.2 seconds clear reaction window with warning sound & !
          this.teacher.inspectionsThisTurn = 0;
          io.to(this.code).emit('teacher_warning', { x: this.teacher.x, y: this.teacher.y });
        } else if (this.teacher.state === 'TURNING') {
          this.teacher.state = 'CLASS';
          this.teacher.angle = Math.PI / 2;
          this.teacher.stateTimer = 2.6 + Math.random() * 1.0; // Looks at class for 2.6-3.6 seconds
          this.teacher.inspectionsThisTurn = 0;
          io.to(this.code).emit('teacher_turned', { state: 'CLASS' });
        } else if (this.teacher.state === 'CLASS') {
          this.teacher.state = 'BOARD';
          this.teacher.angle = -Math.PI / 2;
          const baseBoardTime = (this.mode === 'normal') ? 6.5 : 5.0;
          this.teacher.stateTimer = baseBoardTime + Math.random() * 3.0; // 5.0-9.5s safe writing window
          this.teacher.inspectionsThisTurn = 0;
          io.to(this.code).emit('teacher_turned', { state: 'BOARD' });
        }
      }

      // AI Halbina Random Desk Inspection (checks 1 student's assigned desk - ONLY when NO police raid)
      const hasPoliceRaidActive = (this.policeOfficers && this.policeOfficers.some(c => c.state !== 'FLEEING' && c.state !== 'LEAVING')) || this.policeRaidPending;

      if (!hasPoliceRaidActive && this.teacher.state === 'CLASS' && this.teacher.inspectionsThisTurn < 1 && this.teacher.stateTimer <= 1.4) {
        if (Math.random() < 0.15) {
          const activeStudents = Array.from(this.players.values()).filter(s => s.role === 'STUDENT' && !s.isEliminated && (s.currentZone || 'CHEMISTRY') === 'CHEMISTRY');
          if (activeStudents.length > 0) {
            const inspected = activeStudents[Math.floor(Math.random() * activeStudents.length)];
            this.teacher.inspectionsThisTurn++;
            if (inspected.currentDeskIndex !== inspected.assignedDeskIndex) {
              this.penalizeStudent(inspected, 'WRONG_DESK');
            } else {
              io.to(this.code).emit('desk_inspected_safe', { studentName: inspected.name });
            }
          }
        }
      }
    }

    // Check student states & penalties
    let activeStudentsCount = 0;
    let eliminatedStudentsCount = 0;

    const hasPoliceRaidActive = (this.policeOfficers && this.policeOfficers.some(c => c.state !== 'FLEEING' && c.state !== 'LEAVING')) || this.policeRaidPending;
    const teacherIsLooking = !this.boss.isBossMode && !hasPoliceRaidActive && !this.fireAlarmActive && this.teacherStunTimer <= 0 && (this.teacher.state === 'CLASS' || this.teacher.state === 'RAGE' || (this.mode === 'classic_real' && !this.teacher.isAI));

    this.players.forEach(p => {
      if (p.role === 'TEACHER') {
        if (!this.teacher.isAI) {
          this.teacher.x = p.x;
          this.teacher.y = p.y;
          this.teacher.currentZone = p.currentZone || 'CHEMISTRY';
          if (p.angle !== undefined) this.teacher.angle = p.angle;
        }
        return;
      }

      if (p.isEliminated) {
        eliminatedStudentsCount++;
        return;
      }

      activeStudentsCount++;

      // Immunity timer countdown
      if (p.immunityTimer > 0) p.immunityTimer -= dt;
      if (p.paperCooldown > 0) p.paperCooldown -= dt;
      if (p.chairCooldown > 0) p.chairCooldown -= dt;
      if (p.speedBoostTimer > 0) p.speedBoostTimer -= dt;
      if (p.macheteSwingTimer > 0) p.macheteSwingTimer -= dt;
      if (p.abilityCooldowns.ability1 > 0) p.abilityCooldowns.ability1 -= dt;
      if (p.abilityCooldowns.ability2 > 0) p.abilityCooldowns.ability2 -= dt;

      // Check shouting expiry
      if (p.isShouting && now >= p.shoutEndTime) {
        p.isShouting = false;
        p.shoutText = '';
      }

      // Zone & Room presence check: Teacher and student must be in the same zone for vision!
      const studentZone = p.currentZone || 'CHEMISTRY';
      const teacherZone = this.teacherId && this.players.has(this.teacherId) ? (this.players.get(this.teacherId)?.currentZone || 'CHEMISTRY') : (this.teacher.currentZone || 'CHEMISTRY');
      const inTeacherRoom = (studentZone === teacherZone);
      const isStudentInClassroom = (studentZone === 'CHEMISTRY');

      // Optimized desk hitbox seating check (only applies if inside classroom)
      const isClassicMode = (this.mode === 'classic_real');
      p.currentDeskIndex = isStudentInClassroom ? getDeskAtPosition(p.x, p.y, isClassicMode) : -1;
      const isAtAnyDesk = p.currentDeskIndex !== -1;
      const nearAnyDesk = isStudentInClassroom && isNearAnyDesk(p.x, p.y, 65, isClassicMode);

      // Check if inside vape smoke cloud (Wolff's e-vape or item vape)
      let isInSmoke = false;
      for (const cloud of this.smokeClouds) {
        if (Math.hypot(p.x - cloud.x, p.y - cloud.y) <= cloud.radius) {
          isInSmoke = true;
          break;
        }
      }
      p.isInSmoke = isInSmoke;

      // Ducking / crouching works anywhere!
      // Under desk protection applies if student is near or at any classroom desk
      p.isUnderDesk = p.isDucking && (isAtAnyDesk || nearAnyDesk);

      // Vision cone & smoke check for this student:
      // Halbina can ONLY see students if they are in the SAME zone (not outside on the field or in corridor)!
      const inVisionCone = inTeacherRoom && isStudentInVisionCone(p.x, p.y, this.teacher.x, this.teacher.y, this.teacher.angle);
      const canTeacherSee = inVisionCone && !isInSmoke && !p.isUnderDesk;

      // Cheating at desk gives bonus respect points!
      if (p.isCheating && isAtAnyDesk && inTeacherRoom) {
        p.points += Math.round(35 * dt);
        if (teacherIsLooking && p.immunityTimer <= 0 && canTeacherSee) {
          this.penalizeStudent(p, 'CHEATING');
        }
      }

      // Ducking behind desk protects from wandering/idle detection!
      const isProtectedByDesk = p.isUnderDesk;

      // DETECTION BY TEACHER (Normal & Classic modes)
      // Only students in Halbina's vision cone inside the same room get caught!
      if (teacherIsLooking && p.immunityTimer <= 0 && inTeacherRoom) {
        if (canTeacherSee) {
          if (p.isShouting) {
            this.penalizeStudent(p, 'SHOUTING');
          } else if (isStudentInClassroom && this.mode === 'normal' && !p.isSitting && !isProtectedByDesk) {
            this.penalizeStudent(p, 'WALKING_IN_CLASS');
          } else if (isStudentInClassroom && !isAtAnyDesk && !isProtectedByDesk) {
            this.penalizeStudent(p, 'OUT_OF_DESK');
          } else if (!isStudentInClassroom && this.bellRung && !isProtectedByDesk) {
            this.penalizeStudent(p, 'TRUANCY');
          }
        }
      }
    });

    // Storyline Progression Loop
    if (this.storyline && this.storyline.active) {
      this.storyline.timer -= dt;
      if (this.storyline.timer <= 0) {
        this.advanceStoryline();
      }
    }

    // Blackout timer
    if (this.schoolBlackoutTimer > 0) {
      this.schoolBlackoutTimer -= dt;
      if (this.schoolBlackoutTimer <= 0) {
        this.schoolBlackoutTimer = 0;
        io.to(this.code).emit('school_power_restored', { message: '💡 Zasilanie w szkole zostało przywrócone!' });
      }
    }

    // Check if all students were eliminated
    if (activeStudentsCount === 0 && eliminatedStudentsCount > 0) {
      this.endGame('ALL_EXPELLED');
      return;
    }

    // Broadcast state snapshot to room
    io.to(this.code).emit('game_tick', {
      category: this.category || 'arcade',
      mode: this.mode,
      gameClock: this.formatGameClock ? this.formatGameClock() : '11:45',
      corridorTimer: Math.max(0, Math.ceil(this.corridorTimer || 0)),
      bellRung: !!this.bellRung,
      fireAlarmActive: !!this.fireAlarmActive,
      fireAlarmTimer: Math.max(0, Math.ceil(this.fireAlarmTimer || 0)),
      currentLesson: (typeof CHEMISTRY_LESSONS_SCHEDULE !== 'undefined' && CHEMISTRY_LESSONS_SCHEDULE[this.currentLessonIndex]) ? CHEMISTRY_LESSONS_SCHEDULE[this.currentLessonIndex] : null,
      lessonRemainingSeconds: Math.max(0, Math.ceil(this.lessonTimer || 60)),
      dealerRemainingSeconds: Math.max(0, Math.ceil(this.dealerRemainingSeconds || 0)),
      dealerSchedule: { start: '11:45', end: '11:55', durationMins: 10 },
      storyline: this.storyline ? {
        active: !!this.storyline.active,
        arc: this.storyline.arc,
        stage: this.storyline.stage,
        timer: Math.max(0, Math.ceil(this.storyline.timer)),
        duration: this.storyline.stageDuration,
        title: this.storyline.title,
        desc: this.storyline.desc
      } : null,
      schoolBlackout: this.schoolBlackoutTimer > 0,
      courtyardDeposits: this.courtyardDeposits || [],
      dealer: {
        spawned: !!this.dealerSpawned,
        x: 765,
        y: 210,
        stock: this.dealerStock || []
      },
      director: {
        x: 500,
        y: 220,
        name: 'mgr Janusz Nowak',
        isRobbed: !!this.directorRobbed
      },
      activeTardyPrompt: this.activeTardyPrompt,
      timeRemaining: Math.ceil(this.timeRemaining),
      policeActive: this.policeActiveTimer > 0,
      policeRaidPending: this.policeRaidPending,
      policeRaidTimer: Math.max(0, Math.ceil(this.policeRaidTimer)),
      teacher: {
        x: this.teacher.x,
        y: this.teacher.y,
        state: this.teacher.state,
        anger: Math.round(this.teacher.anger),
        rageText: this.teacher.rageText,
        speechText: this.teacher.speechText,
        isAI: this.teacher.isAI,
        isStunned: this.teacherStunTimer > 0,
        stunTimer: Math.max(0, this.teacherStunTimer),
        teacherId: this.teacherId,
        inspectionsThisTurn: this.teacher.inspectionsThisTurn,
        turnDuration: Math.max(0, this.teacherTurnDuration),
        turnCooldown: Math.max(0, this.teacherTurnCooldown),
        canQuiz: this.teacher.anger >= 50 && this.popQuizCooldown <= 0 && !this.activeQuiz,
        currentZone: this.teacher.currentZone || 'CHEMISTRY',
        angle: this.teacher.angle !== undefined ? this.teacher.angle : Math.PI / 2
      },
      activeQuiz: this.activeQuiz ? {
        studentId: this.activeQuiz.studentId,
        studentName: this.activeQuiz.studentName,
        timeRemaining: Math.ceil(this.activeQuiz.timeRemaining),
        dickCount: this.activeQuiz.dickCount || 0,
        spitCount: this.activeQuiz.spitCount || 0,
        spitCooldown: Math.max(0, this.activeQuiz.spitCooldown || 0)
      } : null,
      boss: this.boss.isBossMode ? {
        isBossMode: true,
        hp: Math.round(this.boss.hp),
        maxHp: Math.round(this.boss.maxHp),
        phase: this.boss.phase,
        isStunned: this.boss.stunTimer > 0,
        isBleeding: this.boss.bleedTimer > 0,
        acidPuddles: this.boss.acidPuddles.map(ap => ({
          id: ap.id,
          x: ap.x,
          y: ap.y,
          radius: ap.radius,
          timer: ap.timer,
          duration: ap.duration
        })),
        chalkPickups: this.boss.chalkPickups.map(cp => ({
          id: cp.id,
          x: cp.x,
          y: cp.y,
          timer: cp.timer
        }))
      } : null,
      smokeClouds: this.smokeClouds.map(c => ({
        id: c.id,
        x: c.x,
        y: c.y,
        radius: c.radius,
        timer: c.timer,
        duration: c.duration
      })),
      projectiles: this.projectiles.map(pr => ({
        id: pr.id,
        type: pr.type,
        isChalk: !!pr.isChalk,
        startX: pr.startX,
        startY: pr.startY,
        targetX: pr.targetX,
        targetY: pr.targetY,
        t: pr.t
      })),
      policeOfficers: this.policeOfficers ? this.policeOfficers.map(c => ({
        id: c.id,
        name: c.name,
        x: Math.round(c.x),
        y: Math.round(c.y),
        hp: c.hp,
        maxHp: c.maxHp,
        state: c.state,
        speech: c.speech || '',
        hitTimer: (c.hitTimer || 0) > 0,
        speed: c.speed
      })) : [],
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        character: p.character,
        name: p.fullName || p.name,
        fullName: p.fullName || p.name,
        isClassic: !!p.isClassic,
        appearance: p.appearance || null,
        bankBalance: p.bankBalance !== undefined ? Math.round(p.bankBalance * 100) / 100 : 60.0,
        inventory: p.inventory || [],
        eduvulcan: p.eduvulcan || null,
        currentZone: p.currentZone || (this.mode === 'classic_real' ? 'CORRIDOR' : 'CHEMISTRY'),
        isTardy: !!p.isTardy,
        hasHomework: !!p.hasHomework,
        role: p.role,
        x: p.x,
        y: p.y,
        angle: p.angle !== undefined ? p.angle : 0,
        isSitting: !!p.isSitting,
        chairCooldown: Math.ceil(p.chairCooldown || 0),
        isMoving: p.isMoving,
        isShouting: p.isShouting,
        isSwingingMachete: (p.macheteSwingTimer || 0) > 0,
        shoutText: p.shoutText,
        isDucking: p.isDucking,
        isUnderDesk: !!p.isUnderDesk,
        equippedItemId: p.equippedItemId || (p.inventory && p.inventory.length > 0 ? p.inventory[0].id : null),
        isCheating: p.isCheating,
        speedBoost: p.speedBoostTimer > 0,
        hasSuperChalk: !!p.hasSuperChalk,
        bossDamage: p.bossDamage || 0,
        isInSmoke: p.isInSmoke,
        abilityCooldown1: Math.ceil(p.abilityCooldowns.ability1),
        abilityCooldown2: Math.ceil(p.abilityCooldowns.ability2),
        uwagi: p.uwagi,
        points: p.points,
        isEliminated: p.isEliminated,
        assignedDeskIndex: p.assignedDeskIndex,
        currentDeskIndex: p.currentDeskIndex,
        isAtDesk: p.currentDeskIndex !== -1,
        isAtAssignedDesk: p.currentDeskIndex === p.assignedDeskIndex,
        immunity: p.immunityTimer > 0
      }))
    });
  }

  penalizeStudent(student, reason) {
    if (student.isGodMode) return;
    student.immunityTimer = 2.5; // Grace period so they don't immediately get hit again
    student.uwagi++;

    let logMsg = '';
    if (reason === 'SHOUTING') {
      logMsg = `🚨 Halbina przyłapała ${student.name} na krzyku "${student.shoutText}"! (+1 Uwaga)`;
      student.isShouting = false;
      student.shoutText = '';
    } else if (reason === 'CHEATING') {
      logMsg = `📝 Halbina przyłapała ${student.name} na ściąganiu pod ławką! (+1 Uwaga)`;
      student.isCheating = false;
    } else if (reason === 'WRONG_DESK') {
      const assigned = DESK_SLOTS.find(d => d.id === student.assignedDeskIndex);
      const assignedLabel = assigned ? assigned.label : `Ławka ${student.assignedDeskIndex + 1}`;
      logMsg = `🚨 Halbina sprawdziła ${student.name}: Siedzi na złej ławce (powinien być w ${assignedLabel})! (+1 Uwaga)`;
    } else if (reason === 'WALKING_IN_CLASS') {
      logMsg = `⚠️ Halbina przyłapała ${student.name}: Wstał z ławki i chodzi po klasie w trakcie lekcji! (+1 Uwaga)`;
    } else if (reason === 'INSULTING_DIRECTOR') {
      logMsg = `🚨 ${student.fullName || student.name} obraził Dyrektora szkoły w gabinecie! (+1 Uwaga)`;
    } else if (reason === 'DIRECTOR_EXPULSION') {
      logMsg = `❌ ${student.fullName || student.name} bezczelnie obraził Dyrektora: Natychmiastowe wyrzucenie ze szkoły!`;
    } else if (reason === 'POLICE_BATON') {
      logMsg = `🚨 Szkieł spacyfikował ${student.name} pałką policyjną! (+1 Uwaga)`;
    } else if (reason === 'POLICE_RAID') {
      logMsg = `🚨 ${student.name} został spisany przez policję podczas nalotu! (+1 Uwaga)`;
    } else if (reason === 'ACID') {
      logMsg = `🧪 Halbina przyłapała ${student.name} w kałuży kwasu siarkowego! (+1 Uwaga)`;
    } else if (reason === 'EXAM') {
      logMsg = `📝 ${student.name} oberwał latającą jedynką z kartkówki! (+1 Uwaga)`;
    } else if (reason === 'QUIZ_FAIL') {
      logMsg = `🚨 ${student.name} dostał pizdę na kartkówce od Halbina: "TY KURWO GŁUPIA!" (+1 Uwaga)`;
    } else if (reason === 'DRAWING_DICK') {
      logMsg = `🚨 ${student.name} narysował kutasa na kartkówce dla Halbina: "TY SOBIE ZE MNIE ŻARTUJESZ?!" (+1 Uwaga)`;
    } else if (reason === 'SPIT_PAPER') {
      logMsg = `🚨 ${student.name} opluł kartkówkę i oddał Halbinie: "TY SOBIE ZE MNIE ŻARTUJESZ?!" (+1 Uwaga)`;
    } else if (reason === 'TRUANCY') {
      logMsg = `🚨 Halbina przyłapała ${student.name} na wagarach podczas lekcji! (+1 Uwaga)`;
    } else {
      logMsg = `⚠️ Halbina przyłapała ${student.name} poza ławką! (+1 Uwaga)`;
    }

    this.roundLogs.unshift(logMsg);

    io.to(this.code).emit('student_caught', {
      playerId: student.id,
      playerName: student.name,
      reason: reason,
      uwagi: student.uwagi,
      logMsg: logMsg
    });

    // Check expulsion (3 uwagi)
    if (student.uwagi >= 3) {
      student.isEliminated = true;
      student.eliminationReason = '3 uwagi - Wezwanie do Dyrektora!';
      const expellMsg = `❌ ${student.name} otrzymał 3 uwagi i ląduje u DYREKTORA!`;
      this.roundLogs.unshift(expellMsg);

      io.to(this.code).emit('student_expelled', {
        playerId: student.id,
        playerName: student.name,
        message: expellMsg
      });
    }
  }

  spawnPoliceOfficers() {
    this.policeActiveTimer = 25.0; // 25s max
    this.policeOfficers = [
      {
        id: 'cop_1',
        name: 'Sierżant Kleszczyński',
        x: 60,
        y: 280,
        hp: 2,
        maxHp: 2,
        speed: 135,
        state: 'CHASING',
        speech: 'STÓJ! POLICJA!',
        speechTimer: 3.5,
        targetId: null,
        tackleCooldown: 0,
        hitTimer: 0
      },
      {
        id: 'cop_2',
        name: 'Aspirant Szkiieł',
        x: 60,
        y: 430,
        hp: 2,
        maxHp: 2,
        speed: 125,
        state: 'CHASING',
        speech: 'GLEBA WSZYSCY!',
        speechTimer: 3.5,
        targetId: null,
        tackleCooldown: 0,
        hitTimer: 0
      },
      {
        id: 'cop_3',
        name: 'Posterunkowy Bagno',
        x: 60,
        y: 570,
        hp: 2,
        maxHp: 2,
        speed: 140,
        state: 'CHASING',
        speech: 'KTO RZUCIŁ KRZESŁEM?!',
        speechTimer: 3.5,
        targetId: null,
        tackleCooldown: 0,
        hitTimer: 0
      }
    ];

    this.teacher.state = 'RAGE';
    this.teacher.rageTimer = 4.5;
    this.teacher.rageText = 'WY GŁUPIE SKURWYSYNY!';
    this.teacher.anger = 100;

    const logMsg = '🚨 SZKIEŁY WPAROWAŁY DO SALI! FILIP RZEPA – WYCIĄGNIJ MACZETĘ [V] I ROZJEB ICH!';
    this.roundLogs.unshift(logMsg);

    io.to(this.code).emit('police_raid_event', {
      duration: 25.0,
      rageText: 'WY GŁUPIE SKURWYSYNY!',
      logMsg: logMsg,
      copsCount: this.policeOfficers.length
    });
  }

  triggerPoliceRaid() {
    this.policeShoutCount = 0;
    this.spawnPoliceOfficers();
  }

  handleMacheteSwing(player, x, y) {
    if (!player || player.character !== 'rzepa' || player.isEliminated) return;

    player.isSwingingMachete = true;
    player.macheteSwingTimer = 0.45;

    io.to(this.code).emit('machete_swung', {
      playerId: player.id,
      playerName: player.name,
      x: player.x,
      y: player.y
    });

    // Check hit on police officers!
    if (this.policeOfficers && this.policeOfficers.length > 0) {
      let hitAny = false;

      this.policeOfficers.forEach(cop => {
        if (cop.state === 'FLEEING') return;

        const dist = Math.hypot(player.x - cop.x, player.y - cop.y);
        if (dist <= 90) { // Within machete range
          hitAny = true;
          cop.hp -= 1;
          cop.hitTimer = 0.5;

          // Knockback away from Filip Rzepa
          const kx = (cop.x - player.x) || 1;
          const ky = (cop.y - player.y) || 0;
          const klen = Math.hypot(kx, ky);
          cop.x = Math.max(50, Math.min(950, cop.x + (kx / klen) * 70));
          cop.y = Math.max(140, Math.min(650, cop.y + (ky / klen) * 50));

          if (cop.hp <= 0) {
            cop.state = 'FLEEING';
            cop.speed = 290;
            cop.speech = 'AŁA! ON MA MACZETĘ! SPIERDALAMY!';
            cop.speechTimer = 3.5;
            player.points += 250;

            const defeatMsg = `💥 ${player.name} (Filip Rzepa) ROZJEBAŁ MACZETĄ ${cop.name}! Szkieł ucieka w panice! (+250 pkt)`;
            this.roundLogs.unshift(defeatMsg);
            io.to(this.code).emit('cop_defeated', {
              copId: cop.id,
              copName: cop.name,
              message: defeatMsg
            });
          } else {
            cop.speech = 'AŁA! ON MA MACZETĘ!';
            cop.speechTimer = 2.0;
            player.points += 100;

            io.to(this.code).emit('cop_hit', {
              copId: cop.id,
              copName: cop.name,
              hp: cop.hp,
              maxHp: cop.maxHp,
              x: cop.x,
              y: cop.y
            });
          }
        }
      });

      // Check if all active cops are defeated or fleeing
      const remainingCops = this.policeOfficers.filter(c => c.state !== 'FLEEING');
      if (hitAny && remainingCops.length === 0) {
        // ALL POLICE DEFEATED! CLASS RESCUED!
        this.policeRaidPending = false;
        player.points += 500;

        const rescueMsg = `🗡️ ${player.name} (Filip Rzepa) POKONAŁ WSZYSTKIE SZKIEŁY MACZETĄ! Klasa uratowana przed policją! (+500 PKT)`;
        this.roundLogs.unshift(rescueMsg);
        io.to(this.code).emit('police_raid_rescued', {
          heroId: player.id,
          heroName: player.name,
          message: rescueMsg
        });
      }
    } else {
      // Outside police raid: slash against teacher or boss
      if (this.boss && this.boss.isBossMode) {
        const distBoss = Math.hypot(player.x - this.teacher.x, player.y - this.teacher.y);
        if (distBoss <= 100) {
          this.damageBoss(80, player, 'MACZETA RZEPY');
          const slashMsg = `🗡️ Filip Rzepa trafił Mega Halbinę MACZETĄ! -80 HP!`;
          this.roundLogs.unshift(slashMsg);
          io.to(this.code).emit('teacher_distracted', { message: slashMsg });
        }
      } else {
        const distTeacher = Math.hypot(player.x - this.teacher.x, player.y - this.teacher.y);
        if (distTeacher <= 95) {
          this.teacher.state = 'BOARD';
          this.teacher.stateTimer = 3.5;
          const slashMsg = `🗡️ Filip Rzepa machnął maczetą przed nosem Halbiny! Halbina uciekła do tablicy!`;
          this.roundLogs.unshift(slashMsg);
          io.to(this.code).emit('teacher_distracted', { message: slashMsg });
        }
      }
    }
  }

  handleShout(playerId, shoutText) {
    const player = this.players.get(playerId);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    // Cooldown: min. 3.5 seconds between shouts to prevent spamming
    const now = Date.now();
    if (player.lastShoutTime && (now - player.lastShoutTime) < 3500) {
      return;
    }
    player.lastShoutTime = now;

    player.isShouting = true;
    player.shoutText = shoutText;
    player.shoutEndTime = now + 1800; // 1.8 seconds speech bubble
    player.points += 150; // Award Respect points

    // Bonus points if shouting while teacher's back is turned!
    if (this.teacher.state === 'BOARD') {
      player.points += 100;
    }

    // Check police triggers ("Szkieły jadą", "szkieły", "policja", "co jedzie", "surron")
    const isPolice = /szkieł|szkiel|policj|co jedzie|surron/i.test(shoutText);
    if (isPolice) {
      const policeBlocked = this.activeQuiz || this.policeRaidPending || (this.policeOfficers && this.policeOfficers.length > 0);
      if (!policeBlocked) {
        this.policeShoutCount++;
        this.teacher.anger = Math.min(100, this.teacher.anger + 12);
        if (this.policeShoutCount >= 5 && this.policeActiveTimer <= 0) {
          this.triggerPoliceRaid();
        }
      } else {
        this.teacher.anger = Math.min(100, this.teacher.anger + 6);
      }
    } else {
      this.teacher.anger = Math.min(100, this.teacher.anger + 6);
    }

    // Refresh shout options for this student
    player.shoutOptions = getRandomShouts(3, [shoutText]);

    io.to(this.code).emit('player_shouted', {
      playerId: player.id,
      playerName: player.name,
      text: shoutText,
      points: player.points,
      x: player.x,
      y: player.y
    });

    // Send new options back to that player with 3.5s cooldown timer
    io.to(player.id).emit('shout_options_updated', {
      options: player.shoutOptions,
      cooldown: 3.5
    });
  }

  endGame(reason) {
    this.state = 'ROUND_OVER';
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }

    const isBossDefeated = reason === 'BOSS_DEFEATED';
    const isBossMode = this.boss.isBossMode;

    const leaderboard = Array.from(this.players.values())
      .filter(p => p.role === 'STUDENT')
      .map(p => ({
        name: p.name,
        character: p.character,
        points: p.points,
        bossDamage: p.bossDamage || 0,
        uwagi: p.uwagi,
        isEliminated: p.isEliminated,
        status: p.isEliminated ? 'Wyrzucony do Dyrektora' : (isBossDefeated ? 'POKONAŁ HALBINĘ!' : 'Przetrwał lekcję!')
      }))
      .sort((a, b) => isBossMode ? ((b.bossDamage || 0) - (a.bossDamage || 0)) : (b.points - a.points));

    io.to(this.code).emit('game_ended', {
      reason: reason, // 'BELL', 'ALL_EXPELLED', or 'BOSS_DEFEATED'
      leaderboard: leaderboard,
      teacherId: this.teacherId,
      teacherIsAI: this.teacher.isAI,
      isBossMode: isBossMode
    });
  }

  destroy() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    rooms.delete(this.code);
  }
}

// Socket.io Connection & Events
io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('create_room', ({ character, mode, category, customProfile }, callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const room = new Room(code, socket.id);
    if (category) room.category = category;
    if (mode) room.mode = mode;
    if (room.mode === 'classic_real') room.category = 'classic';
    room.addPlayer(socket.id, character, customProfile);
    rooms.set(code, room);
    currentRoom = room;

    socket.join(code);

    callback({
      success: true,
      code: code,
      playerId: socket.id,
      player: room.players.get(socket.id)
    });

    io.to(code).emit('room_updated', {
      code: code,
      hostId: room.hostId,
      state: room.state,
      mode: room.mode,
      category: room.category,
      rzepaTaken: Array.from(room.players.values()).some(p => p.character === 'rzepa'),
      players: Array.from(room.players.values())
    });
  });

  socket.on('join_room', ({ code, character, customProfile }, callback) => {
    code = (code || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      return callback({ success: false, message: 'Pokój o takim kodzie nie istnieje!' });
    }

    if (room.state !== 'LOBBY') {
      return callback({ success: false, message: 'Lekcja już trwa w tym pokoju!' });
    }

    if (room.players.size >= 12) {
      return callback({ success: false, message: 'Klasa jest już pełna (max 12 uczniów)!' });
    }

    const isClassic = room.mode === 'classic_real' || room.category === 'classic';

    if (!isClassic && character === 'rzepa') {
      const rzepaTaken = Array.from(room.players.values()).some(p => p.character === 'rzepa');
      if (rzepaTaken) {
        return callback({ success: false, message: 'Filip Rzepa jest już wybrany w tej klasie (może być tylko jeden w lobby)!' });
      }
    }

    const player = room.addPlayer(socket.id, character, customProfile);
    currentRoom = room;
    socket.join(code);

    callback({
      success: true,
      code: code,
      playerId: socket.id,
      player: player
    });

    io.to(code).emit('room_updated', {
      code: code,
      hostId: room.hostId,
      state: room.state,
      mode: room.mode,
      category: room.category,
      rzepaTaken: Array.from(room.players.values()).some(p => p.character === 'rzepa'),
      players: Array.from(room.players.values())
    });
  });

  // Switch character in lobby
  socket.on('select_character', ({ character, customProfile }, callback) => {
    if (!currentRoom || currentRoom.state !== 'LOBBY') return;
    const player = currentRoom.players.get(socket.id);
    if (!player) return;

    const isClassic = currentRoom.mode === 'classic_real' || currentRoom.category === 'classic';

    if (customProfile) {
      if (customProfile.customName) {
        player.fullName = customProfile.customName.trim();
        player.name = player.fullName;
      }
      if (customProfile.appearance) {
        player.appearance = customProfile.appearance;
      }
    }

    if (!isClassic) {
      if (character === 'rzepa') {
        const alreadyTaken = Array.from(currentRoom.players.values()).some(p => p.id !== socket.id && p.character === 'rzepa');
        if (alreadyTaken) {
          if (callback) callback({ success: false, message: 'Filip Rzepa jest już zajęty w tym lobby!' });
          return;
        }
      }

      const charNames = {
        romanowski: 'Romanowski',
        leszczynski: 'Leszczyński',
        wolff: 'Wolff',
        rzepa: 'Filip Rzepa'
      };
      const validChar = ['romanowski', 'leszczynski', 'wolff', 'rzepa'].includes(character) ? character : 'romanowski';
      player.character = validChar;
      player.name = charNames[validChar];
      player.fullName = player.name;
    }

    if (callback) callback({ success: true, character: player.character, player });

    io.to(currentRoom.code).emit('room_updated', {
      code: currentRoom.code,
      hostId: currentRoom.hostId,
      state: currentRoom.state,
      mode: currentRoom.mode,
      category: currentRoom.category,
      rzepaTaken: Array.from(currentRoom.players.values()).some(p => p.character === 'rzepa'),
      players: Array.from(currentRoom.players.values())
    });
  });

  socket.on('start_game_request', ({ teacherSelection }) => {
    if (!currentRoom || currentRoom.hostId !== socket.id) return;
    if (currentRoom.state !== 'LOBBY') return;

    currentRoom.startGame(teacherSelection);

    // Notify all players that game is starting (bell ring + countdown)
    io.to(currentRoom.code).emit('game_starting', {
      teacherId: currentRoom.teacherId,
      isAI: currentRoom.teacher.isAI,
      players: Array.from(currentRoom.players.values())
    });

    // 3.5 seconds lesson intro countdown with bell
    setTimeout(() => {
      if (currentRoom && currentRoom.state === 'STARTING') {
        currentRoom.state = 'IN_GAME';
        io.to(currentRoom.code).emit('lesson_started');
      }
    }, 3500);
  });

  socket.on('player_move', ({ x, y, isMoving, angle }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    // In normal lesson mode, seated students cannot walk until standing up [Z]
    if (player.isSitting) return;

    if (typeof angle === 'number' && !isNaN(angle)) {
      player.angle = angle;
    }

    const isClassic = currentRoom.mode === 'classic_real';

    if (player.isNoclip) {
      player.x = x;
      player.y = y;
      player.isMoving = isMoving;
      if (player.role === 'TEACHER') {
        currentRoom.teacher.x = player.x;
        currentRoom.teacher.y = player.y;
      }
      return;
    }

    if (isClassic) {
      const zone = player.currentZone || 'CORRIDOR';
      let nextX = Math.max(50, Math.min(950, x));
      let minY = 180;
      if (zone === 'CORRIDOR') minY = 190;
      else if (zone === 'CHEMISTRY') minY = (player.role === 'TEACHER') ? 90 : 150;
      else if (zone === 'COURTYARD') minY = 60;
      else if (zone === 'DIRECTOR') minY = 240;
      else if (zone === 'STAFF_ROOM') minY = 200;
      else if (zone === 'BUFFET') minY = 210;
      else if (zone === 'TOILET') minY = 160;

      let nextY = Math.max(minY, Math.min(650, y));

      player.x = nextX;
      player.y = nextY;
      player.isMoving = isMoving;

      if (player.role === 'TEACHER') {
        currentRoom.teacher.x = player.x;
        currentRoom.teacher.y = player.y;
        currentRoom.teacher.currentZone = player.currentZone || 'CHEMISTRY';
        if (player.angle !== undefined) {
          currentRoom.teacher.angle = player.angle;
        }
        currentRoom.teacher.isAI = false;
      }

      if (player.eduvulcan) {
        player.eduvulcan.status = (zone === 'CHEMISTRY') ? 'W Sali 204' : ((zone === 'DIRECTOR') ? 'W Gabinecie Dyrektora' : ((zone === 'STAFF_ROOM') ? 'W Pokoju Nauczycielskim' : ((zone === 'BUFFET') ? 'W Sklepiku Szkolnym' : ((zone === 'TOILET') ? 'W Toalecie (Kibel)' : 'Korytarz'))));
      }
    } else {
      // Arcade bounds
      player.x = Math.max(50, Math.min(950, x));
      player.y = Math.max(120, Math.min(650, y));
      player.isMoving = isMoving;

      if (player.role === 'TEACHER') {
        currentRoom.teacher.x = player.x;
        currentRoom.teacher.y = player.y;
        if (player.angle !== undefined) {
          currentRoom.teacher.angle = player.angle;
        }
      }
    }
  });

  // Toggle seat [Z] (Stand up from desk or sit down)
  socket.on('student_toggle_seat', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;
    const isClassic = currentRoom.mode === 'classic_real';

    if (player.isSitting) {
      // Stand up
      player.isSitting = false;
      if (callback) callback({ success: true, isSitting: false, message: 'Wstałeś z ławki! Możesz chodzić [WASD].' });
    } else {
      // Sit down (must be in CHEMISTRY and near any desk in Classic)
      if (isClassic && (player.currentZone || 'CORRIDOR') !== 'CHEMISTRY') {
        if (callback) callback({ success: false, message: 'W ławkach można siadać tylko w Sali 204 (Chemia)!' });
        return;
      }
      if (isNearAnyDesk(player.x, player.y, 70, isClassic)) {
        player.isSitting = true;
        const deskId = getDeskAtPosition(player.x, player.y, isClassic);
        if (deskId !== -1) {
          const slots = isClassic ? CLASSIC_DESK_SLOTS : DESK_SLOTS;
          const desk = slots.find(d => d.id === deskId);
          if (desk) {
            player.x = desk.chairX;
            player.y = desk.chairY;
          }
        }
        if (callback) callback({ success: true, isSitting: true, message: 'Usiadłeś w ławce!' });
      } else {
        if (callback) callback({ success: false, message: 'Musisz podejść do ławki, aby na niej usiąść!' });
      }
    }
  });

  socket.on('shout_trigger', ({ shoutText }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    currentRoom.handleShout(socket.id, shoutText);
  });

  // Ducking under desk (Only allowed when near ANY desk!)
  // Ducking / crouching (allowed anywhere, sneaking & concealing)
  socket.on('student_duck', ({ isDucking }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    player.isDucking = !!isDucking;
    const isClassic = currentRoom.mode === 'classic_real';
    const nearDesk = isNearAnyDesk(player.x, player.y, 65, isClassic);
    player.isUnderDesk = player.isDucking && nearDesk;

    const msg = player.isDucking
      ? (player.isUnderDesk ? 'Schowałeś się pod ławką!' : 'Kucnąłeś (skradanie)!')
      : 'Wstałeś z kucków.';

    if (callback) callback({ success: true, isDucking: player.isDucking, isUnderDesk: player.isUnderDesk, message: msg });
  });

  // Cheating (Copying notes under desk)
  socket.on('student_cheat', ({ isCheating }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;
    player.isCheating = !!isCheating;
  });

  // Throw Chair [X] (Hurls chair at teacher; triggers police phone call!)
  socket.on('student_throw_chair', ({ targetX, targetY }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    // Strict constraint: Only Filip Rzepa can throw chairs!
    if (player.character !== 'rzepa') {
      return socket.emit('action_failed', { message: 'Tylko Filip Rzepa może rzucić krzesłem w Halbinę!' });
    }

    if (player.chairCooldown > 0) return;

    // Exclusive events: Cannot throw chair during pop quiz or active police raid
    if (currentRoom.activeQuiz) {
      return socket.emit('action_failed', { message: 'Nie możesz rzucić krzesłem w trakcie kartkówki!' });
    }
    if (currentRoom.policeRaidPending || (currentRoom.policeOfficers && currentRoom.policeOfficers.length > 0)) {
      return socket.emit('action_failed', { message: 'Policja już jest w klasie!' });
    }

    player.chairCooldown = 20.0; // 20 seconds cooldown

    const proj = {
      id: 'chair_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'chair',
      ownerId: player.id,
      ownerName: player.name,
      startX: player.x,
      startY: player.y - 15,
      targetX: targetX || currentRoom.teacher.x,
      targetY: targetY || currentRoom.teacher.y,
      t: 0,
      duration: 1.05
    };

    currentRoom.projectiles.push(proj);
    const msg = `🪑 ${player.name} cisnął krzesłem w Halbinę!`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('chair_thrown', {
      projectile: proj,
      message: msg
    });
  });

  // Paper Airplane Throw (ONLY in Boss Fight mode!)
  socket.on('student_throw_paper', ({ targetX, targetY }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;
    if (player.paperCooldown > 0) return;

    // Strict constraint: Paper airplanes only in BOSS FIGHT
    if (!currentRoom.boss || !currentRoom.boss.isBossMode) {
      return socket.emit('action_failed', { message: 'Samolotów z papieru można używać WYŁĄCZNIE w trybie BOSS FIGHT!' });
    }

    const isBoss = currentRoom.boss && currentRoom.boss.isBossMode;
    player.paperCooldown = isBoss ? 2.0 : 3.5;
    const isChalk = !!player.hasSuperChalk;
    player.hasSuperChalk = false;

    const proj = {
      id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'paper',
      isChalk: isChalk,
      ownerId: player.id,
      ownerName: player.name,
      startX: player.x,
      startY: player.y - 15,
      targetX: targetX || currentRoom.teacher.x,
      targetY: targetY || currentRoom.teacher.y,
      t: 0,
      duration: isChalk ? 0.95 : 1.1
    };

    currentRoom.projectiles.push(proj);
    io.to(currentRoom.code).emit('paper_thrown', proj);
  });

  // Teacher Desk Inspection (max 1 person per turn)
  socket.on('teacher_inspect_student', ({ targetStudentId }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;
    if (currentRoom.teacher.state !== 'CLASS' && currentRoom.teacher.state !== 'RAGE') {
      return socket.emit('inspection_failed', { message: 'Możesz sprawdzać uczniów tylko, gdy patrzysz na klasę!' });
    }
    if (currentRoom.teacher.inspectionsThisTurn >= 1) {
      return socket.emit('inspection_failed', { message: 'Możesz sprawdzić tylko 1 osobę na obrót!' });
    }

    const targetStudent = currentRoom.players.get(targetStudentId);
    if (!targetStudent || targetStudent.role !== 'STUDENT' || targetStudent.isEliminated) return;

    currentRoom.teacher.inspectionsThisTurn++;

    if (targetStudent.currentDeskIndex !== targetStudent.assignedDeskIndex) {
      // Wrong desk detected!
      currentRoom.penalizeStudent(targetStudent, 'WRONG_DESK');
    } else {
      const assigned = DESK_SLOTS.find(d => d.id === targetStudent.assignedDeskIndex);
      const safeMsg = `ℹ️ Halbina sprawdziła ${targetStudent.name}: Siedzi grzecznie w swojej ławce (${assigned ? assigned.label : ''}).`;
      currentRoom.roundLogs.unshift(safeMsg);
      io.to(currentRoom.code).emit('desk_inspected_safe', {
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        message: safeMsg
      });
    }
  });

  // Character Superpowers
  socket.on('use_ability', ({ abilityName }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    // Romanowski: Stwórz mleko (speed boost 3s + clears acid puddles in Boss Mode)
    if (abilityName === 'milk' && player.character === 'romanowski') {
      if (player.abilityCooldowns.ability1 > 0) return;
      player.abilityCooldowns.ability1 = 14.0;
      player.speedBoostTimer = 3.0;

      if (currentRoom.boss && currentRoom.boss.isBossMode) {
        for (let i = currentRoom.boss.acidPuddles.length - 1; i >= 0; i--) {
          const puddle = currentRoom.boss.acidPuddles[i];
          if (Math.hypot(player.x - puddle.x, player.y - puddle.y) <= 130) {
            currentRoom.boss.acidPuddles.splice(i, 1);
            player.points += 100;
            const cleanMsg = `🥛 ${player.name} zneutralizował kwas mlekiem! (+100 pkt)`;
            currentRoom.roundLogs.unshift(cleanMsg);
            io.to(currentRoom.code).emit('acid_neutralized', { x: puddle.x, y: puddle.y, message: cleanMsg });
          }
        }
      }

      const msg = `🥛 ${player.name} stworzył mleko! Pędzi jak szalony przez 3 sekundy!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'milk',
        message: msg
      });
    }
    // Leszczyński: Rzut kleszczem (+2s opóźnienia Halbina / stun & bleed w Boss Mode)
    else if (abilityName === 'tick' && player.character === 'leszczynski') {
      if (player.abilityCooldowns.ability1 > 0) return;
      player.abilityCooldowns.ability1 = 18.0;
      const proj = {
        id: 'tick_' + Date.now(),
        type: 'kleszcz',
        ownerId: player.id,
        ownerName: player.name,
        startX: player.x,
        startY: player.y - 10,
        targetX: currentRoom.teacher.x,
        targetY: currentRoom.teacher.y,
        t: 0,
        duration: 0.9
      };
      currentRoom.projectiles.push(proj);
      const msg = `🕷️ ${player.name} rzucił kleszczem w Halbinę!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'tick',
        message: msg,
        projectile: proj
      });
    }
    // Wolff: Mogę do toalety? (+1s do odwrotu Halbina / +2.5s opóźnienia bossa)
    else if (abilityName === 'toilet' && player.character === 'wolff') {
      if (player.abilityCooldowns.ability1 > 0) return;
      player.abilityCooldowns.ability1 = 14.0;
      if (currentRoom.boss && currentRoom.boss.isBossMode) {
        currentRoom.boss.attackTimer += 2.5;
      } else {
        currentRoom.teacher.stateTimer += 1.0;
      }
      const msg = (currentRoom.boss && currentRoom.boss.isBossMode)
        ? `🚽 ${player.name}: "Pani profesor, MOGĘ DO TOALETY?!" (+2.5s opóźnienia ataku bossa!)`
        : `🚽 ${player.name}: "Pani profesor, MOGĘ DO TOALETY?!" (+1s do odwrotu Halbina)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'toilet',
        message: msg
      });
    }
    // Wolff: Zapal e-vape
    else if (abilityName === 'vape' && player.character === 'wolff') {
      if (player.abilityCooldowns.ability2 > 0) return;
      player.abilityCooldowns.ability2 = 22.0;

      const isClassic = currentRoom.mode === 'classic_real';
      let cloud = null;
      if (!isClassic) {
        cloud = {
          id: 'smoke_' + Date.now(),
          x: player.x,
          y: player.y,
          radius: 110,
          duration: 6.5,
          timer: 6.5
        };
        currentRoom.smokeClouds.push(cloud);
      }
      player.points += 40;
      const msg = isClassic
        ? `💨 ${player.name} wziął głębokiego bucha z e-papierosa (owocowy liquid)!`
        : `💨 ${player.name} odpalił e-vape! Gęsta chmura dymu ukrywa uczniów przed wzrokiem Halbina!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'vape',
        x: player.x,
        y: player.y,
        isClassic: isClassic,
        message: msg,
        cloud: cloud
      });
    }
    // Filip Rzepa [Q]: Gaz pieprzowy 500ml (ogłuszenie na 3s, blackout i brak ruchu)
    else if (abilityName === 'pepper_spray' && player.character === 'rzepa') {
      if (player.abilityCooldowns.ability1 > 0) return;
      player.abilityCooldowns.ability1 = 18.0;

      const proj = {
        id: 'spray_' + Date.now(),
        type: 'pepper_spray',
        ownerId: player.id,
        ownerName: player.name,
        startX: player.x,
        startY: player.y - 12,
        targetX: currentRoom.teacher.x,
        targetY: currentRoom.teacher.y,
        t: 0,
        duration: 0.65
      };
      currentRoom.projectiles.push(proj);

      const msg = `🌶️ ${player.name} (Filip Rzepa) wypuścił strumień z butli 500ml gazu pieprzowego prosto w Halbinę!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'pepper_spray',
        message: msg,
        projectile: proj
      });
    }
    // Filip Rzepa [V]: Maczeta (aktywne uderzenie maczetą)
    else if (abilityName === 'machete' && player.character === 'rzepa') {
      const hasPolice = currentRoom.policeOfficers && currentRoom.policeOfficers.some(c => c.state !== 'FLEEING');
      if (player.abilityCooldowns.ability2 > 0) return;
      player.abilityCooldowns.ability2 = hasPolice ? 0.5 : 15.0;

      currentRoom.handleMacheteSwing(player, player.x, player.y);
    }
  });

  // Dedicated socket event for Filip Rzepa swinging his machete
  socket.on('student_machete_swing', ({ x, y }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.character !== 'rzepa' || player.isEliminated) return;

    const hasPolice = currentRoom.policeOfficers && currentRoom.policeOfficers.some(c => c.state !== 'FLEEING');
    if (player.abilityCooldowns.ability2 > 0) return;
    player.abilityCooldowns.ability2 = hasPolice ? 0.5 : 15.0;

    currentRoom.handleMacheteSwing(player, x || player.x, y || player.y);
  });

  // Human Halbina controls (Turns for 2s, 5s cooldown)
  socket.on('teacher_toggle_look', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;
    const hasPolice = (currentRoom.policeOfficers && currentRoom.policeOfficers.some(c => c.state !== 'FLEEING' && c.state !== 'LEAVING')) || currentRoom.policeRaidPending;
    if (hasPolice) {
      return socket.emit('inspection_failed', { message: 'Trwa interwencja policji! Możesz tylko bezradnie obserwować walkę!' });
    }
    if (currentRoom.teacherStunTimer > 0) {
      return socket.emit('inspection_failed', { message: 'Jesteś ogłuszona gazem pieprzowym! Nic nie widzisz!' });
    }

    if (currentRoom.mode === 'classic_real') {
      currentRoom.teacher.angle = ((currentRoom.teacher.angle !== undefined ? currentRoom.teacher.angle : Math.PI / 2) + Math.PI) % (Math.PI * 2);
      const player = currentRoom.players.get(socket.id);
      if (player) player.angle = currentRoom.teacher.angle;
      io.to(currentRoom.code).emit('teacher_turned', { state: 'CLASS', angle: currentRoom.teacher.angle });
      return;
    }

    if (currentRoom.teacher.state === 'BOARD') {
      if (currentRoom.teacherTurnCooldown > 0) {
        return socket.emit('inspection_failed', { message: `Odczekaj cooldown obrotu: ${Math.ceil(currentRoom.teacherTurnCooldown)}s` });
      }
      currentRoom.teacher.state = 'CLASS';
      currentRoom.teacherTurnDuration = 2.0; // Looks at class for exactly 2 seconds
      currentRoom.teacher.inspectionsThisTurn = 0;
      io.to(currentRoom.code).emit('teacher_turned', { state: 'CLASS', duration: 2.0 });
    } else {
      // Manual quick return
      currentRoom.teacher.state = 'BOARD';
      currentRoom.teacherTurnCooldown = 5.0; // 5s cooldown
      io.to(currentRoom.code).emit('teacher_turned', { state: 'BOARD', cooldown: 5.0 });
    }
  });

  // Human Halbina triggers pop quiz (When anger >= 65%)
  socket.on('teacher_trigger_quiz', ({ targetStudentId }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;
    const hasPolice = (currentRoom.policeOfficers && currentRoom.policeOfficers.some(c => c.state !== 'FLEEING' && c.state !== 'LEAVING')) || currentRoom.policeRaidPending;
    if (hasPolice) {
      return socket.emit('inspection_failed', { message: 'Nie możesz zrobić kartkówki podczas interwencji policji!' });
    }
    if (currentRoom.teacher.anger < 65) {
      return socket.emit('inspection_failed', { message: 'Potrzebujesz min. 65% wkurwienia, aby wziąć ucznia do odpowiedzi!' });
    }
    if (currentRoom.popQuizCooldown > 0 || currentRoom.activeQuiz) {
      return socket.emit('inspection_failed', { message: 'Kartkówka jest na cooldownie!' });
    }

    let target = null;
    if (targetStudentId) {
      target = currentRoom.players.get(targetStudentId);
    }
    if (!target || target.role !== 'STUDENT' || target.isEliminated) {
      const activeStudents = Array.from(currentRoom.players.values()).filter(p => p.role === 'STUDENT' && !p.isEliminated);
      if (activeStudents.length > 0) {
        target = activeStudents[Math.floor(Math.random() * activeStudents.length)];
      }
    }

    if (target) {
      currentRoom.startPopQuiz(target);
    }
  });

  // Student submits answer to quiz
  socket.on('quiz_submit_answer', ({ selectedOptionIndex }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME' || !currentRoom.activeQuiz) return;
    if (currentRoom.activeQuiz.studentId !== socket.id) return;

    const quiz = currentRoom.activeQuiz;
    const student = currentRoom.players.get(socket.id);
    currentRoom.activeQuiz = null;
    io.to(currentRoom.code).emit('pop_quiz_closed');

    if (!student) return;

    // Check if student drew dicks on paper
    if (quiz.hasDick) {
      const dickCount = quiz.dickCount || 1;
      currentRoom.setTeacherSpeech("Ty sobie ze mnie żartujesz pajacu głupi?!", 5.0);
      const dickMsg = `🍆 ${student.name} oddał kartkówkę z narysowanymi KUTASAMI (${dickCount}x)! Halbina krzyczy: "TY SOBIE ZE MNIE ŻARTUJESZ PAJACU GŁUPI?!"`;
      currentRoom.roundLogs.unshift(dickMsg);
      currentRoom.penalizeStudent(student, 'DRAWING_DICK');
      io.to(currentRoom.code).emit('showcase_paper', {
        type: 'dick',
        dickCount: dickCount,
        studentName: student.name,
        message: dickMsg
      });
      return;
    }

    // Check if student spat on paper
    if (quiz.isSpit) {
      const spitCount = quiz.spitCount || 1;
      currentRoom.setTeacherSpeech("Ty sobie ze mnie żartujesz pajacu głupi?!", 5.0);
      const spitMsg = `💦 ${student.name} oddał OPLUTĄ KARTKÓWKĘ (${spitCount}x)! Halbina krzyczy: "TY SOBIE ZE MNIE ŻARTUJESZ PAJACU GŁUPI?!"`;
      currentRoom.roundLogs.unshift(spitMsg);
      currentRoom.penalizeStudent(student, 'SPIT_PAPER');
      io.to(currentRoom.code).emit('showcase_paper', {
        type: 'spit',
        spitCount: spitCount,
        studentName: student.name,
        message: spitMsg
      });
      return;
    }

    if (selectedOptionIndex === quiz.correctIndex) {
      // Correct answer!
      student.points += 350;
      currentRoom.teacher.anger = Math.max(0, currentRoom.teacher.anger - 25);
      currentRoom.setTeacherSpeech("O dziwo dobrze, siadaj na miejsce...", 3.5);
      const winMsg = `✅ ${student.name} odpowiedział poprawnie na kartkówce z chemii! (+350 pkt respektu, -25% wkurwienia)`;
      currentRoom.roundLogs.unshift(winMsg);
      io.to(currentRoom.code).emit('pop_quiz_result', {
        success: true,
        studentName: student.name,
        message: winMsg
      });
    } else {
      // Wrong answer -> "Ty kurwo głupia!"
      currentRoom.penalizeStudent(student, 'QUIZ_FAIL');
      currentRoom.setTeacherSpeech("Ty kurwo głupia!", 4.0);
      const failMsg = `❌ ${student.name} odpowiedział ŹLE na kartkówce! Halbina krzyczy: "TY KURWO GŁUPIA!" (+1 Uwaga)`;
      currentRoom.roundLogs.unshift(failMsg);
      io.to(currentRoom.code).emit('pop_quiz_result', {
        success: false,
        studentName: student.name,
        message: failMsg
      });
    }
  });

  // Student starts cheating with phone during quiz (Requires holding min 4.0s!)
  socket.on('quiz_cheat_phone_start', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME' || !currentRoom.activeQuiz) return;
    if (currentRoom.activeQuiz.studentId !== socket.id) return;
    currentRoom.activeQuiz.isCheatingPhone = true;
    currentRoom.activeQuiz.phoneCheatTimer = 0;
  });

  socket.on('quiz_cheat_phone_stop', () => {
    if (!currentRoom || !currentRoom.activeQuiz) return;
    if (currentRoom.activeQuiz.studentId !== socket.id) return;
    currentRoom.activeQuiz.isCheatingPhone = false;
  });

  socket.on('quiz_cheat_phone_finish', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME' || !currentRoom.activeQuiz) return;
    if (currentRoom.activeQuiz.studentId !== socket.id) return;

    const quiz = currentRoom.activeQuiz;
    const student = currentRoom.players.get(socket.id);
    if (!student) return;

    // Verify student held for min 3.8s
    if (quiz.phoneCheatTimer >= 3.8) {
      quiz.isCheatingPhone = false;
      student.points += 150;
      socket.emit('quiz_phone_success', {
        correctIndex: quiz.correctIndex,
        message: '📱 Sukces! Ściągałeś 4 sekundy z telefonu i znasz poprawną odpowiedź! (+150 pkt)'
      });
    } else {
      socket.emit('action_failed', { message: 'Musisz przytrzymać ściąganie przez pełne 4 sekundy!' });
    }
  });

  // Student spits on quiz paper (Cooldown: exactly 3 seconds!)
  socket.on('quiz_spit_paper', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME' || !currentRoom.activeQuiz) return;
    if (currentRoom.activeQuiz.studentId !== socket.id) return;
    if (currentRoom.activeQuiz.spitCooldown > 0) return;

    currentRoom.activeQuiz.isSpit = true;
    currentRoom.activeQuiz.spitCount = (currentRoom.activeQuiz.spitCount || 0) + 1;
    currentRoom.activeQuiz.spitCooldown = 3.0; // Exactly 3 seconds cooldown!

    socket.emit('quiz_spit_success', {
      spitCount: currentRoom.activeQuiz.spitCount,
      cooldown: 3.0,
      message: `💦 Oplułeś kartkówkę (#${currentRoom.activeQuiz.spitCount})! Wielka plama śliny powiększa się!`
    });
  });

  // Student draws a dick on quiz paper (Can draw as many as they want!)
  socket.on('quiz_draw_dick', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME' || !currentRoom.activeQuiz) return;
    if (currentRoom.activeQuiz.studentId !== socket.id) return;

    currentRoom.activeQuiz.hasDick = true;
    currentRoom.activeQuiz.dickCount = (currentRoom.activeQuiz.dickCount || 0) + 1;

    socket.emit('quiz_dick_success', {
      dickCount: currentRoom.activeQuiz.dickCount,
      message: `✏️ Narysowałeś kutasa #${currentRoom.activeQuiz.dickCount} na kartkówce!`
    });
  });

  // ================= CLASSIC MODE EVENT LISTENERS =================

  // Teacher Halbina decides fate of tardy student: 1 - Odpuść, 2 - Do odpowiedzi, 3 - Do Dyrektora
  socket.on('halbina_decide_tardy', ({ studentId, choice }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    const student = currentRoom.players.get(studentId);
    if (!student || student.role !== 'STUDENT') return;

    currentRoom.activeTardyPrompt = null;
    student.isTardy = false;

    if (choice === 1) {
      // 1 - Odpuść mu daj obecność
      if (student.eduvulcan) {
        student.eduvulcan.attendance = 'Obecny (Ułaskawiony przez Halbinę)';
        student.eduvulcan.status = 'W sali 204 (Obecny)';
      }
      currentRoom.setTeacherSpeech('No dobra, siadaj szybko w ławce i nie rób rabanu!', 4.0);
      const msg = `✅ Halbina ułaskawiła spóźnionego ${student.name}: "Siadaj szybko w ławce!"`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('tardy_resolved', { studentId: student.id, choice: 1, message: msg });
      if (callback) callback({ success: true, message: msg });
    } else if (choice === 2) {
      // 2 - Weź go do odpowiedzi
      if (student.eduvulcan) {
        student.eduvulcan.attendance = 'Spóźniony (Przy tablicy)';
      }
      currentRoom.setTeacherSpeech('Miarka się przebrała skurwysynie jebany do odpowiedzi!', 5.0);
      const msg = `📝 Halbina wzywa spóźnionego ${student.name} natychmiast do odpowiedzi przy tablicy!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('tardy_resolved', { studentId: student.id, choice: 2, message: msg });
      currentRoom.startPopQuiz(student);
      if (callback) callback({ success: true, message: msg });
    } else if (choice === 3) {
      // 3 - Wyślij go do dyrektora
      if (student.eduvulcan) {
        student.eduvulcan.attendance = 'Spóźniony (Wysłany do Dyrektora)';
        student.eduvulcan.status = 'Wezwany do Gabinetu Dyrektora';
      }
      student.sentToDirector = true;
      currentRoom.setTeacherSpeech('Za takie spóźnienie marsz natychmiast do Dyrektora!', 4.5);
      const msg = `🚪 Halbina wywaliła ${student.name} z lekcji do Gabinetu Dyrektora!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('tardy_resolved', { studentId: student.id, choice: 3, message: msg });
      io.to(student.id).emit('directive_go_to_director', { message: 'Pani Halbina wyrzuciła cię do Gabinetu Dyrektora! Udaj się do gabinetu na dywanik!' });
      if (callback) callback({ success: true, message: msg });
    }
  });

  // ====================================================
  // CLASSIC MODE MULTI-ROOM & INTERACTIVE EVENT HANDLERS
  // ====================================================

  // Change school room / zone: CORRIDOR, CHEMISTRY, DIRECTOR, TOILET
  socket.on('change_zone', ({ targetZone }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    const validZones = ['CORRIDOR', 'CHEMISTRY', 'DIRECTOR', 'STAFF_ROOM', 'BUFFET', 'TOILET', 'JANITOR_ROOM', 'CHEM_LAB', 'SERVER_ROOM', 'COURTYARD'];
    if (!validZones.includes(targetZone)) {
      if (callback) callback({ success: false, message: 'Nieprawidłowa sala!' });
      return;
    }

    const prevZone = player.currentZone || 'CORRIDOR';
    if (prevZone === targetZone) return;

    // Check locked room access
    const isTeacher = (player.role === 'TEACHER');
    if (targetZone === 'JANITOR_ROOM') {
      const hasKey = isTeacher || (player.inventory && player.inventory.some(it => ['janitor_key', 'knife', 'bolt_cutter', 'master_keycard'].includes(it.id)));
      if (!hasKey) {
        const lockMsg = '🔒 ZAMKNIĘTE NA KLUCZ: Ciężka żelazna kłódka woźnego! Potrzebujesz klucza lub narzędzia do podważenia...';
        socket.emit('door_locked', { zone: 'JANITOR_ROOM', message: lockMsg });
        if (callback) callback({ success: false, message: lockMsg });
        return;
      }
      player.x = 500;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'Schowek Woźnego & Archiwum';
    } else if (targetZone === 'CHEM_LAB') {
      const solvedCount = player.inventory ? player.inventory.filter(it => it.id === 'solved_task').length : 0;
      const hasAccess = isTeacher || (player.inventory && (
        player.inventory.some(it => ['master_keycard', 'bolt_cutter', 'firecracker', 'knife'].includes(it.id)) ||
        solvedCount >= 2
      ));
      if (!hasAccess) {
        const lockMsg = '🔒 ZAMKNIĘTE: Zamek szyfrowy magazynu odczynników! Wymagana Karta Główna lub wiedza chemiczna...';
        socket.emit('door_locked', { zone: 'CHEM_LAB', message: lockMsg });
        if (callback) callback({ success: false, message: lockMsg });
        return;
      }
      player.x = 500;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'Magazyn Odczynników Chemicznych';
    } else if (targetZone === 'SERVER_ROOM') {
      const hasAccess = isTeacher || (player.inventory && player.inventory.some(it => ['master_keycard', 'bolt_cutter', 'director_stamp'].includes(it.id)));
      if (!hasAccess) {
        const lockMsg = '🔒 ZAMKNIĘTE: Czytnik kart magnetycznych radiowęzła! Wymagana Karta Główna Dyrekcji lub odpowiedni sprzęt...';
        socket.emit('door_locked', { zone: 'SERVER_ROOM', message: lockMsg });
        if (callback) callback({ success: false, message: lockMsg });
        return;
      }
      player.x = 500;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'Radiowęzeł i Monitoring';
    } else if (targetZone === 'COURTYARD') {
      player.x = 500;
      player.y = 130;
      if (player.eduvulcan) player.eduvulcan.status = 'Na polu / Boisko szkolne';
    }

    player.currentZone = targetZone;
    player.isSitting = false;

    // Position player at entrance doorway in target room
    if (targetZone === 'CHEMISTRY') {
      if (prevZone === 'CHEM_LAB') {
        player.x = 80;
        player.y = 330;
      } else {
        player.x = 500;
        player.y = 590; // Entering from bottom doorway
      }

      // Check tardiness when entering Sala 204
      if (player.role === 'STUDENT') {
        if (currentRoom.bellRung && !player.sentToDirector) {
          player.isTardy = true;
          if (player.eduvulcan) player.eduvulcan.attendance = 'Spóźniony na lekcję (Halbina decyduje...)';
          if (!currentRoom.activeTardyPrompt && currentRoom.teacherId && currentRoom.teacherId !== player.id) {
            currentRoom.activeTardyPrompt = { studentId: player.id, studentName: player.fullName || player.name };
            io.to(currentRoom.teacherId).emit('halbina_tardy_prompt', currentRoom.activeTardyPrompt);
          }
        } else if (!currentRoom.bellRung) {
          player.isTardy = false;
          if (player.eduvulcan) {
            player.eduvulcan.attendance = 'W sali 204 (Przed dzwonkiem)';
            player.eduvulcan.status = 'W sali 204';
          }
        }
      }
    } else if (targetZone === 'DIRECTOR') {
      player.x = 500;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'W Gabinecie Dyrektora';
    } else if (targetZone === 'STAFF_ROOM') {
      player.x = 500;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'W Pokoju Nauczycielskim';
    } else if (targetZone === 'BUFFET') {
      player.x = 500;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'W Sklepiku Szkolnym';
    } else if (targetZone === 'TOILET') {
      player.x = 220;
      player.y = 580;
      if (player.eduvulcan) player.eduvulcan.status = 'W Toalecie (Kibel)';
    } else if (targetZone === 'CORRIDOR') {
      // Exiting back into corridor outside corresponding door
      if (prevZone === 'CHEMISTRY') {
        player.x = 180;
        player.y = 260;
      } else if (prevZone === 'DIRECTOR') {
        player.x = 370;
        player.y = 260;
      } else if (prevZone === 'STAFF_ROOM') {
        player.x = 550;
        player.y = 260;
      } else if (prevZone === 'BUFFET') {
        player.x = 730;
        player.y = 260;
      } else if (prevZone === 'TOILET') {
        player.x = 890;
        player.y = 260;
      } else if (prevZone === 'JANITOR_ROOM') {
        player.x = 80;
        player.y = 350;
      } else if (prevZone === 'SERVER_ROOM') {
        player.x = 910;
        player.y = 440;
      } else if (prevZone === 'COURTYARD') {
        player.x = 500;
        player.y = 600;
      } else {
        player.x = 500;
        player.y = 350;
      }
      if (player.eduvulcan) player.eduvulcan.status = 'Korytarz';
    }

    if (player.role === 'TEACHER') {
      currentRoom.teacher.currentZone = targetZone;
      currentRoom.teacher.x = player.x;
      currentRoom.teacher.y = player.y;
      if (player.angle !== undefined) {
        currentRoom.teacher.angle = player.angle;
      }
      currentRoom.teacher.isAI = false;
    }

    const roomNames = {
      CORRIDOR: 'Korytarz Szkolny',
      CHEMISTRY: 'Sala 204 - Chemia',
      DIRECTOR: 'Gabinet Dyrektora',
      STAFF_ROOM: 'Pokój Nauczycielski',
      BUFFET: 'Szkolny Sklepik / Bufet',
      TOILET: 'Szkolna Toaleta (Kibel)',
      JANITOR_ROOM: 'Schowek Woźnego & Archiwum',
      CHEM_LAB: 'Kantorek Odczynników Chemicznych',
      SERVER_ROOM: 'Radiowęzeł i Monitoring Szkolny',
      COURTYARD: 'Dziedziniec i Boisko Szkolne (Na polu)'
    };

    const msg = `🚪 Przeszedłeś do: ${roomNames[targetZone]}`;
    socket.emit('zone_changed', { currentZone: targetZone, x: player.x, y: player.y, message: msg });
    if (callback) callback({ success: true, currentZone: targetZone, x: player.x, y: player.y, message: msg });
  });

  // Search corridor student lockers for loot & coins
  socket.on('search_locker', ({ lockerIndex }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'CORRIDOR') {
      const err = { success: false, message: 'Szafki znajdują się na korytarzu!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (player.lockerSearchCooldown && player.lockerSearchCooldown > Date.now()) {
      const waitSec = Math.ceil((player.lockerSearchCooldown - Date.now()) / 1000);
      const err = { success: false, message: `Poczekaj jeszcze ${waitSec}s przed kolejnym przeszukaniem szafki!` };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    player.lockerSearchCooldown = Date.now() + 18000; // 18s cooldown

    const roll = Math.random();
    let lootMsg = '';
    if (!player.inventory) player.inventory = [];

    if (roll < 0.45) {
      const foundMoney = Math.floor(10 + Math.random() * 25);
      player.bankBalance = Math.round(((player.bankBalance || 0) + foundMoney) * 100) / 100;
      player.points += 40;
      lootMsg = `🪙 Znalazłeś ${foundMoney} PLN w szkolnej szafce!`;
    } else if (roll < 0.65) {
      const penDef = CLASSIC_ITEMS.pen;
      const ex = player.inventory.find(i => i.id === 'pen');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...penDef, quantity: 1 });
      player.points += 50;
      lootMsg = `🖊️ Znalazłeś zapasowy długopis do chemii w szafce!`;
    } else if (roll < 0.78) {
      const energyDef = CLASSIC_ITEMS.energy_drink;
      const ex = player.inventory.find(i => i.id === 'energy_drink');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...energyDef, quantity: 1 });
      player.points += 60;
      lootMsg = `⚡ Znalazłeś puszkę Monstera w szafce!`;
    } else if (roll < 0.88) {
      const magMak = CLASSIC_ITEMS.mag_makarov;
      const ex = player.inventory.find(i => i.id === 'mag_makarov');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...magMak, quantity: 1 });
      player.points += 120;
      lootMsg = `📦 UKRYTY ŁUP: Znalazłeś w szafce Magazynek 9mm do pistoletu Makarow!`;
    } else if (roll < 0.94) {
      const magAr = CLASSIC_ITEMS.mag_ar15;
      const ex = player.inventory.find(i => i.id === 'mag_ar15');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...magAr, quantity: 1 });
      player.points += 150;
      lootMsg = `🔥 RZADKI ŁUP: Znalazłeś za książkami Magazynek 5.56mm do Karabinu AR-15!`;
    } else {
      const keyDef = CLASSIC_ITEMS.janitor_key;
      const ex = player.inventory.find(i => i.id === 'janitor_key');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...keyDef, quantity: 1 });
      player.points += 160;
      lootMsg = `🗝️ SEKRETNY ZNALEZISKO: Znalazłeś na dnie szafki stary Zardzewiały Klucz Woźnego!`;
    }

    currentRoom.roundLogs.unshift(`🎒 ${player.fullName || player.name}: ${lootMsg}`);
    socket.emit('locker_loot', { message: lootMsg, bankBalance: player.bankBalance, inventory: player.inventory });
    if (callback) callback({ success: true, message: lootMsg });
  });

  // Interact with School Director (Gabinet Dyrektora)
  socket.on('director_interact', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.role !== 'STUDENT' || student.isEliminated) return;

    if (student.currentZone !== 'DIRECTOR') {
      const err = { success: false, message: 'Musisz wejść do Gabinetu Dyrektora!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const weaponItem = student.inventory ? student.inventory.find(it => ['knife', 'machete', 'ar15'].includes(it.id)) : null;

    const data = {
      success: true,
      directorName: 'mgr Janusz Nowak',
      speech: student.sentToDirector
        ? 'Pani Halbina cię przysłała?! Znowu zakłócasz lekcję chemii?! Tłumacz się natychmiast!'
        : 'W czym mogę pomóc? Lekcje trwają, dlaczego nie jesteś w klasie?!',
      hasWeapon: !!weaponItem,
      weaponName: weaponItem ? weaponItem.name : null,
      weaponId: weaponItem ? weaponItem.id : null,
      isRobbed: !!currentRoom.directorRobbed,
      sentByHalbina: !!student.sentToDirector
    };

    socket.emit('director_dialogue', data);
    if (callback) callback(data);
  });

  socket.on('director_choose_option', ({ choice, option }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.role !== 'STUDENT' || student.isEliminated) return;

    if (student.currentZone !== 'DIRECTOR') {
      const err = { success: false, message: 'Nie jesteś w gabinecie dyrektora!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const opt = choice !== undefined ? choice : option;

    if (opt === 1) {
      // 1 - Ta stara kurwa wyslala mnie
      const logMsg = `🚨 ${student.name} do Dyrektora: "Ta stara kurwa wysłała mnie"! Dyrektor wpadł w furię!`;
      currentRoom.roundLogs.unshift(logMsg);
      if (student.eduvulcan) {
        if (!student.eduvulcan.uwagi) student.eduvulcan.uwagi = [];
        student.eduvulcan.uwagi.push('Wulgarne odzywki wobec nauczyciela i dyrektora ("stara k...")');
      }
      currentRoom.penalizeStudent(student, 'INSULTING_DIRECTOR');
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 1,
        response: 'Dyrektor krzyczy: "CO TO ZA SŁOWNICTWO?! Nagana dyrektorska w EduVulcan i dzwonię po twoich rodziców!"',
        message: 'Dyrektor wpadł w furię za wyzwiska! Otrzymujesz naganę dyrektorską!',
        penalty: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 2) {
      // 2 - Obciagnij mi
      const logMsg = `❌ ${student.name} do Dyrektora: "Obciągnij mi"! Natychmiastowe wyrzucenie ze szkoły!`;
      currentRoom.roundLogs.unshift(logMsg);
      if (student.eduvulcan) {
        if (!student.eduvulcan.uwagi) student.eduvulcan.uwagi = [];
        student.eduvulcan.uwagi.push('Ekstremalna bezczelność wobec Dyrektora Szkoły - wyrzucenie!');
      }
      student.uwagi = 3;
      student.isEliminated = true;
      student.eliminationReason = 'Wyrzucony dyscyplinarnie przez Dyrektora ze szkoły!';
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      io.to(currentRoom.code).emit('student_expelled', { playerId: student.id, playerName: student.name, message: logMsg });
      const res = {
        success: true,
        option: 2,
        response: 'Dyrektor wstaje zza biurka czerwony z wściekłości: "CO PROSZĘ?! JESTEŚ SKREŚLONY Z LISTY UCZNIÓW! WYPADAJ ZE SZKOŁY!"',
        message: 'Zostałeś dyscyplinarnie wyrzucony ze szkoły przez Dyrektora!',
        expelled: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 3) {
      // 3 - Przepraszam dyrektorze ale się spożniłem na lekcje pani halbiny
      const logMsg = `📜 Dyrektor wydał oficjalne usprawiedliwienie dla ${student.name}: "Wracaj do sali 204 i bądź grzeczny."`;
      currentRoom.roundLogs.unshift(logMsg);
      if (student.eduvulcan) {
        student.eduvulcan.hasExcuse = true;
        student.eduvulcan.attendance = 'Usprawiedliwiony przez Dyrektora';
        student.eduvulcan.status = 'Usprawiedliwiony przez Dyrektora';
      }
      student.sentToDirector = false;
      student.isTardy = false;
      student.points += 150;
      if (student.inventory && !student.inventory.some(it => it.id === 'excuse_note')) {
        student.inventory.push({ ...CLASSIC_ITEMS.excuse_note, quantity: 1 });
      }
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 3,
        response: 'Dyrektor uśmiecha się: "No dobrze, przynajmniej mówisz prawdę i masz szacunek. Masz tu oficjalne usprawiedliwienie, wracaj do sali pani Halbiny."',
        message: 'Otrzymałeś oficjalne usprawiedliwienie od Dyrektora (+150 pkt)! Wracaj do sali 204.',
        excused: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 4) {
      // 4 - Broń / Terror / Sejf
      const weaponItem = student.inventory ? student.inventory.find(it => ['knife', 'machete', 'ar15'].includes(it.id)) : null;
      if (!weaponItem) {
        const err = { success: false, message: 'Nie masz żadnej broni ani narzędzia w ekwipunku!' };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }
      if (currentRoom.directorRobbed) {
        const err = { success: false, message: 'Dyrektor już oddał wszystkie pieniądze ze szkolnego sejfu!' };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }

      currentRoom.directorRobbed = true;
      student.bankBalance = Math.round(((student.bankBalance || 0) + 300.0) * 100) / 100;
      student.points += 500;
      const logMsg = `🚨 ${student.name} wyciągnął ${weaponItem.name} w gabinecie dyrektora! Dyrektor oddał 300.00 PLN z sejfu Rady Rodziców!`;
      currentRoom.roundLogs.unshift(logMsg);
      io.to(currentRoom.code).emit('director_event', { message: logMsg, terror: true });
      const res = {
        success: true,
        option: 4,
        response: `Dyrektor podnosi ręce do góry z przerażeniem: "JEZUS MARIA! Bierz pieniądze z sejfu (+300 PLN) tylko schowaj ten ${weaponItem.name}!"`,
        message: `Dyrektor sterroryzowany! Zgarniasz 300.00 PLN z sejfu Rady Rodziców!`,
        robbed: true,
        reward: 300,
        newBalance: student.bankBalance
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 5) {
      // 5 - Skarga na Halbinę
      const logMsg = `🗣️ ${student.name} złożył oficjalną skargę na panią Halbinę u Dyrektora!`;
      currentRoom.roundLogs.unshift(logMsg);
      currentRoom.teacher.anger = 0;
      currentRoom.popQuizCooldown = 35.0;
      currentRoom.setTeacherSpeech("Dzień dobry panie Dyrektorze! Oczywiście, lekcja przebiega w pełnym spokoju...", 6.0);
      student.points += 200;
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 5,
        response: 'Dyrektor marszczy brwi: "Wyzywa od skurwysynów?! Niedopuszczalne! Idę natychmiast na kontrolę do Sali 204!"',
        message: 'Dyrektor wyruszył na hospitację do pani Halbiny! Gniew zresetowany na 35s (+200 pkt)!',
        inspectionTriggered: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 6) {
      // 6 - Łapówka / Datek na Radę Rodziców (50 PLN)
      if ((student.bankBalance || 0) < 50) {
        const err = { success: false, message: 'Nie masz 50 PLN na koncie bankowym na datek!' };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }
      student.bankBalance = Math.round((student.bankBalance - 50.0) * 100) / 100;
      student.uwagi = 0;
      if (student.eduvulcan) {
        student.eduvulcan.notes = [];
        student.eduvulcan.notes.push('Pochwała Dyrektora: Wzorowa postawa prospołeczna i wsparcie szkoły');
      }
      student.points += 250;
      const logMsg = `🤝 ${student.name} wpłacił 50 PLN na Radę Rodziców! Dyrektor wyczyścił wszystkie uwagi w EduVulcan!`;
      currentRoom.roundLogs.unshift(logMsg);
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 6,
        response: 'Dyrektor uśmiecha się szeroko i chowa gotówkę do kieszeni: "Och, dziękuję za hojne wsparcie Rady Rodziców! Wszystkie uwagi anulowane."',
        message: 'Wpłacono 50 PLN. Dyrektor anulował wszystkie Twoje uwagi w EduVulcan (+250 pkt)!',
        newBalance: student.bankBalance
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 7) {
      // 7 - Prośba o zwolnienie do domu (bóle brzucha)
      const logMsg = `🎫 Dyrektor wypisał oficjalną Przepustkę do domu dla ${student.name}!`;
      currentRoom.roundLogs.unshift(logMsg);
      if (!student.inventory) student.inventory = [];
      if (!student.inventory.some(it => it.id === 'hall_pass')) {
        student.inventory.push({ ...CLASSIC_ITEMS.hall_pass, quantity: 1 });
      }
      student.points += 150;
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 7,
        response: 'Dyrektor wzdycha: "Znowu te zapiekanki ze sklepiku... Masz tu Przepustkę, wracaj do domu się wykurować."',
        message: 'Otrzymałeś oficjalną Przepustkę do domu (+150 pkt)!',
        hallPass: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 8) {
      // 8 - Kradzież pieczątki Dyrektora
      if (currentRoom.stampStolen) {
        const err = { success: false, message: 'Pieczątka dyrektora została już wcześniej skradziona z biurka!' };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }
      currentRoom.stampStolen = true;
      if (!student.inventory) student.inventory = [];
      student.inventory.push({ ...CLASSIC_ITEMS.director_stamp, quantity: 1 });
      student.points += 300;
      const logMsg = `📑 ${student.name} ukradł Pieczątkę Dyrektora z biurka, gdy ten spojrzał przez okno!`;
      currentRoom.roundLogs.unshift(logMsg);
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 8,
        response: 'Dyrektor odwraca się do okna, a ty błyskawicznie chwytasz ciężką metalową pieczątkę ze stołu!',
        message: 'Ukradłeś Pieczątkę Dyrektora Szkoły (+300 pkt)! Możesz podbijać lewe zwolnienia!',
        stolenStamp: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    } else if (opt === 9) {
      // 9 - Pytanie o Rolexa / zegarek
      const logMsg = `🚨 ${student.name} zapytał Dyrektora skąd ma Rolexa! Dyrektor wściekły wlepił uwagę!`;
      currentRoom.roundLogs.unshift(logMsg);
      if (student.eduvulcan) {
        if (!student.eduvulcan.uwagi) student.eduvulcan.uwagi = [];
        student.eduvulcan.uwagi.push('Wścibskie pytania o finanse osobiste Dyrekcji');
      }
      currentRoom.penalizeStudent(student, 'INSULTING_DIRECTOR');
      io.to(currentRoom.code).emit('director_event', { message: logMsg });
      const res = {
        success: true,
        option: 9,
        response: 'Dyrektor chowa rękę za plecy czerwony na twarzy: "To pamiątka rodzinna, smarkaczu! Marsz z gabinetu z uwagą w dzienniku!"',
        message: 'Dyrektor wpadł w panikę i dał ci uwagę za wścibskość!',
        penalty: true
      };
      socket.emit('director_result', res);
      if (callback) callback(res);
    }
  });

  // ====================================================
  // UNIVERSAL USABLE ITEM HANDLER (CLASSIC HOTBAR / BACKPACK)
  // ====================================================
  socket.on('use_classic_item', ({ itemId, targetX, targetY }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (!player.inventory) player.inventory = [];
    const itemIdx = player.inventory.findIndex(i => i.id === itemId);
    if (itemIdx === -1) {
      const err = { success: false, message: 'Nie posiadasz tego przedmiotu!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const item = player.inventory[itemIdx];
    const isTeacher = player.role === 'TEACHER';

    // 1. Vape (E-papieros)
    if (itemId === 'vape') {
      const now = Date.now();
      if (player.lastVapeTime && now - player.lastVapeTime < 2500) {
        const remaining = ((2500 - (now - player.lastVapeTime)) / 1000).toFixed(1);
        const err = { success: false, message: `Odczekaj ${remaining}s przed kolejnym buchem z vape'a!` };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }
      player.lastVapeTime = now;
      player.equippedItemId = 'vape';

      const isClassic = currentRoom.mode === 'classic_real';
      if (!isClassic) {
        currentRoom.smokeClouds.push({
          id: 'smoke_' + Date.now(),
          x: player.x,
          y: player.y,
          radius: 75,
          duration: 8.5,
          timer: 8.5
        });
      }
      player.points += 40;
      let msg = isClassic
        ? `💨 ${player.name} wziął bucha z e-papierosa (owocowy liquid)!`
        : `💨 ${player.name} zaciągnął się vape'em i puścił gęstą chmurę! (Dym maskuje gracza na 8.5s)`;

      if (player.currentZone === 'CHEMISTRY' && currentRoom.teacher && currentRoom.teacher.state === 'CLASS') {
        currentRoom.teacher.anger = Math.min(100, currentRoom.teacher.anger + 20);
        currentRoom.setTeacherSpeech("KTO TU PALI E-PAPIEROSA W MOJEJ SALI?! DO DYREKTORA!", 5.0);
        msg += ` | Halbina poczuła aromat owocowy! (+20% wkurwienia)`;
      }
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', {
        type: 'vape',
        playerId: player.id,
        x: player.x,
        y: player.y,
        isClassic: isClassic,
        message: msg
      });
      const res = { success: true, message: msg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 2. Monster Energy / Tiger
    if (itemId === 'energy_drink' || itemId === 'monster') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.speedBoostTimer = 6.0;
      player.points += 50;
      const msg = `⚡ ${player.name} wypił duszkiem puszkę Monstera! Pędzi ze Speed Boostem (+85%) przez 6 sekund!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', { type: 'energy_drink', playerId: player.id, message: msg });
      const res = { success: true, message: msg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 3. Kanapka z pasztetem
    if (itemId === 'sandwich') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.points += 80;
      const msg = `🥪 ${player.name} zjadł pożywną kanapkę z pasztetem babuni! (+80 pkt respektu)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', { type: 'food', playerId: player.id, message: msg });
      const res = { success: true, message: msg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 4. Drożdżówka z makiem
    if (itemId === 'bun') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.points += 60;
      const msg = `🥐 ${player.name} schrupał świeżą drożdżówkę z makiem ze sklepiku! (+60 pkt)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', { type: 'food', playerId: player.id, message: msg });
      const res = { success: true, message: msg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 5. Zapiekanka z pieczarkami
    if (itemId === 'zapiekanka') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.points += 120;
      const msg = `🥖 ${player.name} wciągnął legendarną gorącą zapiekankę z sosem czosnkowym! (+120 pkt respektu)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', { type: 'food', playerId: player.id, message: msg });
      const res = { success: true, message: msg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 6. Tymbark jabłko-mięta
    if (itemId === 'tymbark') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.points += 75;
      const quote = TYMBARK_QUOTES[Math.floor(Math.random() * TYMBARK_QUOTES.length)];
      const msg = `🧃 ${player.name} odkręcił Tymbarka! Napis pod kapslem: "${quote}" (+75 pkt)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', { type: 'tymbark', quote: quote, message: msg });
      const res = { success: true, message: msg, quote: quote, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 7. Baton Prince Polo
    if (itemId === 'prince_polo') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.points += 45;
      const msg = `🍫 ${player.name} zjadł wafelek Prince Polo! (+45 pkt)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('item_effect_used', { type: 'food', playerId: player.id, message: msg });
      const res = { success: true, message: msg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 8. Petarda Korsarz
    if (itemId === 'firecracker') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      const fX = player.x;
      const fY = player.y;
      const fZone = player.currentZone || 'CORRIDOR';

      io.to(currentRoom.code).emit('firecracker_lit', { x: fX, y: fY, zone: fZone, message: `🧨 ${player.name} odpalił lont petardy Korsarz!` });

      setTimeout(() => {
        if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
        currentRoom.smokeClouds.push({
          id: 'smoke_' + Date.now(),
          x: fX,
          y: fY,
          radius: 90,
          duration: 9.0
        });

        // Distract teacher & staff room
        currentRoom.teacher.anger = 0;
        currentRoom.popQuizCooldown = 15.0;
        currentRoom.setTeacherSpeech("CO TO ZA JEBANY WYBUCH?! KTO ODPALIŁ PETARDĘ?!", 6.0);
        const boomMsg = `💥 BOOM! Petarda wybuchła w strefie ${fZone}! Cała szkoła w dymie, Halbina i nauczyciele zdezorientowani na 8 sekund!`;
        currentRoom.roundLogs.unshift(boomMsg);
        io.to(currentRoom.code).emit('firecracker_exploded', { x: fX, y: fY, zone: fZone, message: boomMsg });
      }, 2200);

      const res = { success: true, message: 'Odpalono petardę! Uciekaj za 2 sekundy!', inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 9. Kawa z pokoju nauczycielskiego
    if (itemId === 'coffee') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      if (isTeacher) {
        currentRoom.teacher.anger = 0;
        currentRoom.teacher.speed = 170;
        currentRoom.setTeacherSpeech("Ahhh, pyszna gorąca kawusia z pokoju nauczycielskiego... Aż miło uczyć!", 5.0);
        const msg = `☕ Pani Halbina wypiła gorącą kawę! Wkurwienie zresetowane do 0%, prędkość wzrosła!`;
        currentRoom.roundLogs.unshift(msg);
        io.to(currentRoom.code).emit('teacher_coffee_drunk', { message: msg });
      } else {
        player.speedBoostTimer = 5.0;
        player.points += 100;
        const msg = `☕ ${player.name} wypił skradzioną profesorską kawę! (+100 pkt respektu i Speed Boost!)`;
        currentRoom.roundLogs.unshift(msg);
        io.to(currentRoom.code).emit('item_effect_used', { type: 'coffee', message: msg });
      }
      const res = { success: true, message: 'Wypito gorącą kawę!', inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 10. Pieczątka Dyrektora
    if (itemId === 'director_stamp') {
      if (!player.inventory.some(i => i.id === 'excuse_note')) {
        player.inventory.push({ ...CLASSIC_ITEMS.excuse_note, quantity: 1 });
      } else {
        const ex = player.inventory.find(i => i.id === 'excuse_note');
        ex.quantity = (ex.quantity || 1) + 1;
      }
      player.points += 80;
      const msg = `📑 ${player.name} użył Pieczątki Dyrektora i podbił oficjalne usprawiedliwienie!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(player.id).emit('notification', { message: msg });
      const res = { success: true, message: 'Podbito nowe usprawiedliwienie pieczątką dyrektora!', inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 11. Klucz odpowiedzi do kartkówek
    if (itemId === 'exam_key') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      player.bankBalance = Math.round(((player.bankBalance || 0) + 50.0) * 100) / 100;
      player.points += 250;
      if (player.eduvulcan) {
        if (!player.eduvulcan.grades) player.eduvulcan.grades = [];
        player.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Kartkówka (Klucz)', grade: 6 });
      }
      const msg = `🔑 ${player.name} wykorzystał Klucz Odpowiedzi! Zadanie zaliczone z oceną 6 (+50 PLN)!`;
      currentRoom.roundLogs.unshift(msg);
      const res = { success: true, message: msg, newBalance: player.bankBalance, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 12. Ściąga z chemii
    if (itemId === 'cheat_sheet') {
      player.hasActiveCheatSheet = true;
      const msg = `📝 ${player.name} przygotował ściągę w rękawie! Następne pytanie będzie miało ujawnioną odpowiedź!`;
      socket.emit('item_use_success', { success: true, message: msg, inventory: player.inventory });
      if (callback) callback({ success: true, message: msg });
      return;
    }

    // 13. Karabin AR-15 (Karabin szturmowy 5.56mm)
    if (itemId === 'ar15') {
      if (item.loadedAmmo === undefined) item.loadedAmmo = 0;

      if (item.loadedAmmo <= 0) {
        // Empty chamber! Check if player has mag_ar15 in backpack
        const magIdx = player.inventory.findIndex(i => i.id === 'mag_ar15');
        if (magIdx !== -1) {
          const magItem = player.inventory[magIdx];
          if (magItem.quantity > 1) magItem.quantity--;
          else player.inventory.splice(magIdx, 1);
          item.loadedAmmo = 30;

          const reloadMsg = `🔄 ${player.fullName || player.name} załadował Magazynek 5.56mm do Karabinu AR-15! (30/30 naboi)`;
          currentRoom.roundLogs.unshift(reloadMsg);
          io.to(currentRoom.code).emit('weapon_reloaded', {
            playerId: player.id,
            itemId: 'ar15',
            loadedAmmo: 30,
            maxAmmo: 30,
            message: reloadMsg
          });
          const res = { success: true, reloaded: true, loadedAmmo: 30, maxAmmo: 30, message: reloadMsg, inventory: player.inventory };
          socket.emit('item_use_success', res);
          if (callback) callback(res);
          return;
        } else {
          // Dry fire click!
          const dryMsg = `⚠️ KLIK! Pusta komora w AR-15! Brak Magazynka 5.56mm w ekwipunku!`;
          socket.emit('weapon_dry_fire', { itemId: 'ar15', message: dryMsg });
          socket.emit('action_failed', { success: false, dryFire: true, message: dryMsg });
          if (callback) callback({ success: false, dryFire: true, message: dryMsg });
          return;
        }
      }

      // Fire 3-round burst (or remainder if < 3)
      const burstCount = Math.min(3, item.loadedAmmo);
      item.loadedAmmo -= burstCount;

      const tx = (targetX !== undefined) ? targetX : (player.x + 300);
      const ty = (targetY !== undefined) ? targetY : (player.y - 80);
      const angle = Math.atan2(ty - player.y, tx - player.x);

      for (let b = 0; b < burstCount; b++) {
        const spread = (b - (burstCount - 1) / 2) * 0.08;
        const curAngle = angle + spread;
        const dist = Math.hypot(tx - player.x, ty - player.y);
        const bulletTargetX = player.x + Math.cos(curAngle) * dist;
        const bulletTargetY = player.y + Math.sin(curAngle) * dist;

        currentRoom.projectiles.push({
          id: 'bullet_ar15_' + Date.now() + '_' + b + '_' + Math.random(),
          type: 'bullet_ar15',
          damage: 48,
          ownerId: player.id,
          startX: player.x,
          startY: player.y,
          targetX: bulletTargetX,
          targetY: bulletTargetY,
          t: 0,
          duration: 0.16 + b * 0.04
        });
      }

      const fireMsg = `💥 RATATAT! ${player.fullName || player.name} wystrzelił serię z Karabinu AR-15! (${item.loadedAmmo}/30 naboi)`;
      currentRoom.roundLogs.unshift(fireMsg);

      io.to(currentRoom.code).emit('weapon_fired', {
        playerId: player.id,
        playerName: player.fullName || player.name,
        itemId: 'ar15',
        shots: burstCount,
        loadedAmmo: item.loadedAmmo,
        maxAmmo: 30,
        startX: player.x,
        startY: player.y,
        targetX: tx,
        targetY: ty,
        message: fireMsg
      });

      const res = { success: true, fired: true, shots: burstCount, loadedAmmo: item.loadedAmmo, maxAmmo: 30, message: fireMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 14. Pistolet Makarow (9mm)
    if (itemId === 'makarov') {
      if (item.loadedAmmo === undefined) item.loadedAmmo = 0;

      if (item.loadedAmmo <= 0) {
        // Empty chamber! Check for mag_makarov in backpack
        const magIdx = player.inventory.findIndex(i => i.id === 'mag_makarov');
        if (magIdx !== -1) {
          const magItem = player.inventory[magIdx];
          if (magItem.quantity > 1) magItem.quantity--;
          else player.inventory.splice(magIdx, 1);
          item.loadedAmmo = 8;

          const reloadMsg = `🔄 ${player.fullName || player.name} załadował Magazynek 9mm do Makarowa! (8/8 naboi)`;
          currentRoom.roundLogs.unshift(reloadMsg);
          io.to(currentRoom.code).emit('weapon_reloaded', {
            playerId: player.id,
            itemId: 'makarov',
            loadedAmmo: 8,
            maxAmmo: 8,
            message: reloadMsg
          });
          const res = { success: true, reloaded: true, loadedAmmo: 8, maxAmmo: 8, message: reloadMsg, inventory: player.inventory };
          socket.emit('item_use_success', res);
          if (callback) callback(res);
          return;
        } else {
          // Dry fire click!
          const dryMsg = `⚠️ KLIK! Pistolet Makarow nie ma amunicji! Potrzebny Magazynek 9mm!`;
          socket.emit('weapon_dry_fire', { itemId: 'makarov', message: dryMsg });
          socket.emit('action_failed', { success: false, dryFire: true, message: dryMsg });
          if (callback) callback({ success: false, dryFire: true, message: dryMsg });
          return;
        }
      }

      // Fire 1 single bullet
      item.loadedAmmo -= 1;
      const tx = (targetX !== undefined) ? targetX : (player.x + 280);
      const ty = (targetY !== undefined) ? targetY : (player.y - 80);

      currentRoom.projectiles.push({
        id: 'bullet_makarov_' + Date.now() + '_' + Math.random(),
        type: 'bullet_makarov',
        damage: 55,
        ownerId: player.id,
        startX: player.x,
        startY: player.y,
        targetX: tx,
        targetY: ty,
        t: 0,
        duration: 0.18
      });

      const fireMsg = `💥 BANG! ${player.fullName || player.name} oddał strzał z Pistoletu Makarow 9mm! (${item.loadedAmmo}/8 naboi)`;
      currentRoom.roundLogs.unshift(fireMsg);

      io.to(currentRoom.code).emit('weapon_fired', {
        playerId: player.id,
        playerName: player.fullName || player.name,
        itemId: 'makarov',
        shots: 1,
        loadedAmmo: item.loadedAmmo,
        maxAmmo: 8,
        startX: player.x,
        startY: player.y,
        targetX: tx,
        targetY: ty,
        message: fireMsg
      });

      const res = { success: true, fired: true, shots: 1, loadedAmmo: item.loadedAmmo, maxAmmo: 8, message: fireMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 15. Magazynek 5.56mm (AR-15)
    if (itemId === 'mag_ar15') {
      const ar15 = player.inventory.find(i => i.id === 'ar15');
      if (!ar15) {
        const msg = '❌ Magazynek 5.56mm pasuje tylko do Karabinu AR-15! Nie masz takiego karabinu.';
        socket.emit('action_failed', { success: false, message: msg });
        if (callback) callback({ success: false, message: msg });
        return;
      }
      if ((ar15.loadedAmmo || 0) >= 30) {
        const msg = '⚠️ Twój Karabin AR-15 ma już pełny magazynek (30/30)!';
        socket.emit('action_failed', { success: false, message: msg });
        if (callback) callback({ success: false, message: msg });
        return;
      }
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);
      ar15.loadedAmmo = 30;

      const reloadMsg = `🔄 ${player.fullName || player.name} przeładował Karabin AR-15! (30/30 naboi)`;
      currentRoom.roundLogs.unshift(reloadMsg);
      io.to(currentRoom.code).emit('weapon_reloaded', {
        playerId: player.id,
        itemId: 'ar15',
        loadedAmmo: 30,
        maxAmmo: 30,
        message: reloadMsg
      });
      const res = { success: true, message: reloadMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 16. Magazynek 9mm (Makarov)
    if (itemId === 'mag_makarov') {
      const mak = player.inventory.find(i => i.id === 'makarov');
      if (!mak) {
        const msg = '❌ Magazynek 9mm pasuje wyłącznie do Pistoletu Makarow! Nie masz tego pistoletu.';
        socket.emit('action_failed', { success: false, message: msg });
        if (callback) callback({ success: false, message: msg });
        return;
      }
      if ((mak.loadedAmmo || 0) >= 8) {
        const msg = '⚠️ Twój Pistolet Makarow ma już pełen magazynek (8/8)!';
        socket.emit('action_failed', { success: false, message: msg });
        if (callback) callback({ success: false, message: msg });
        return;
      }
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);
      mak.loadedAmmo = 8;

      const reloadMsg = `🔄 ${player.fullName || player.name} przeładował Pistolet Makarow! (8/8 naboi)`;
      currentRoom.roundLogs.unshift(reloadMsg);
      io.to(currentRoom.code).emit('weapon_reloaded', {
        playerId: player.id,
        itemId: 'makarov',
        loadedAmmo: 8,
        maxAmmo: 8,
        message: reloadMsg
      });
      const res = { success: true, message: reloadMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 17. Bojowa Maczeta
    if (itemId === 'machete') {
      let hitCount = 0;
      if (currentRoom.policeOfficers && currentRoom.policeOfficers.length > 0) {
        currentRoom.policeOfficers.forEach(cop => {
          if (cop.state !== 'FLEEING' && Math.hypot(cop.x - player.x, cop.y - player.y) <= 125) {
            cop.hp -= 65;
            cop.hitTimer = 0.6;
            hitCount++;
            if (cop.hp <= 0) {
              cop.state = 'FLEEING';
              cop.speech = 'Dostałem maczetą! Uciekamy!';
              cop.speed = 290;
            }
          }
        });
      }

      if (player.currentZone === 'CHEMISTRY' && Math.hypot(currentRoom.teacher.x - player.x, currentRoom.teacher.y - player.y) <= 130) {
        currentRoom.teacherStunTimer = 4.0;
        currentRoom.teacher.anger = 0;
        currentRoom.setTeacherSpeech("CO TY ROBISZ Z TĄ MACZETĄ WARIACIE?!", 4.0);
        hitCount++;
      }

      player.points += 100;
      const swingMsg = `🗡️ ${player.fullName || player.name} wykonał szeroki zamach Bojową Maczetą!`;
      currentRoom.roundLogs.unshift(swingMsg);
      io.to(currentRoom.code).emit('weapon_melee_swing', {
        playerId: player.id,
        type: 'machete',
        x: player.x,
        y: player.y,
        hitCount: hitCount,
        message: swingMsg
      });
      const res = { success: true, message: swingMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 18. Sprężynowy Nóż
    if (itemId === 'knife') {
      let hitCount = 0;
      if (currentRoom.policeOfficers && currentRoom.policeOfficers.length > 0) {
        currentRoom.policeOfficers.forEach(cop => {
          if (cop.state !== 'FLEEING' && Math.hypot(cop.x - player.x, cop.y - player.y) <= 90) {
            cop.hp -= 35;
            cop.hitTimer = 0.5;
            hitCount++;
          }
        });
      }
      player.points += 50;
      const knifeMsg = `🔪 ${player.fullName || player.name} pchnął ostrzem noża sprężynowego!`;
      currentRoom.roundLogs.unshift(knifeMsg);
      io.to(currentRoom.code).emit('weapon_melee_swing', {
        playerId: player.id,
        type: 'knife',
        x: player.x,
        y: player.y,
        hitCount: hitCount,
        message: knifeMsg
      });
      const res = { success: true, message: knifeMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    // 19. Wojskowa Świeca Dymna
    if (itemId === 'smoke_grenade') {
      if (item.quantity > 1) item.quantity--;
      else player.inventory.splice(itemIdx, 1);

      // Create primary and secondary dense smoke clouds
      currentRoom.smokeClouds.push({
        id: 'heavy_smoke_' + Date.now(),
        x: player.x,
        y: player.y,
        radius: 175,
        duration: 22.0,
        timer: 22.0
      });
      currentRoom.smokeClouds.push({
        id: 'smoke_plume_' + Date.now(),
        x: player.x + (Math.random() - 0.5) * 80,
        y: player.y + (Math.random() - 0.5) * 80,
        radius: 130,
        duration: 20.0,
        timer: 20.0
      });

      if (currentRoom.teacher) {
        currentRoom.teacherStunTimer = Math.max(currentRoom.teacherStunTimer || 0, 10.0);
        currentRoom.setTeacherSpeech("KASZEL... NIC NIE WIDZĘ! DYREKTORZE, ALARM POŻAROWY!", 5.0);
      }

      // ACTIVATE FULL FIRE ALARM & EVACUATION ASSEMBLY
      currentRoom.fireAlarmActive = true;
      currentRoom.fireAlarmTimer = 55.0;
      currentRoom.evacuatedStudents = new Set();
      currentRoom.pendingSmokeInterrogation = {
        active: true,
        startTime: Date.now(),
        timer: 0
      };

      player.points += 150;
      const smokeMsg = `🚨🔥 ${player.fullName || player.name} odbezpieczył Wojskową Świecę Dymną! ALARM POŻAROWY! Zbiórka ewakuacyjna przed szkołą!`;
      currentRoom.roundLogs.unshift(smokeMsg);

      io.to(currentRoom.code).emit('smoke_grenade_detonated', {
        x: player.x,
        y: player.y,
        message: smokeMsg,
        fireAlarmActive: true,
        duration: 55.0
      });

      io.to(currentRoom.code).emit('fire_alarm_evacuation', {
        active: true,
        message: '🚨 ALARM POŻAROWY! Kłęby dymu w szkole! Wszyscy na boisko / dziedziniec do sektora ewakuacyjnego!',
        duration: 55.0
      });

      // TRIGGER INTERROGATION FOR HALBINA:
      // If a human player is Halbina (role === 'TEACHER'), send prompt to her socket!
      const humanTeacher = [...currentRoom.players.values()].find(p => p.role === 'TEACHER' && p.id !== 'BOT');
      if (humanTeacher) {
        io.to(humanTeacher.id).emit('halbina_fire_alarm_interrogation', {
          directorName: 'mgr Janusz Nowak',
          question: 'PANI KATARZYNO! Co tu się do diabła dzieje?! Cała szkoła stoi w kłębach gryzącego dymu! Ma Pani 10 sekund na wyjaśnienia!',
          options: [
            { id: 1, text: '🔬 To kontrolowany eksperyment z sublimacji i reakcji redoks! Wszystko pod pełną kontrolą dydaktyczną!' },
            { id: 2, text: '🎯 To sprawka tego chuligana z ostatniej ławki! Podpalił coś za szafą, natychmiast wyciągnę surowe konsekwencje!' },
            { id: 3, text: '💨 Panie Dyrektorze, w piwnicy rozszczelnił się stary piec węglowy woźnego! Trzeba natychmiast ratować kotłownię!' }
          ]
        });
      }

      const res = { success: true, message: smokeMsg, inventory: player.inventory };
      socket.emit('item_use_success', res);
      if (callback) callback(res);
      return;
    }

    socket.emit('item_use_success', { success: true, message: `Wybrano przedmiot: ${item.name}`, inventory: player.inventory });
    if (callback) callback({ success: true, message: `Wybrano przedmiot: ${item.name}` });
  });

  // Equip active item to show in hands
  socket.on('student_equip_item', ({ itemId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player) return;
    player.equippedItemId = itemId || null;
    if (callback) callback({ success: true, equippedItemId: player.equippedItemId });
  });

  // Halbina answers Director Janusz during fire alarm interrogation (3 options)
  socket.on('halbina_explain_fire_alarm', ({ choice }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player) return;

    const isTeacher = player.role === 'TEACHER' || currentRoom.teacherId === player.id;
    if (!isTeacher && currentRoom.teacherId && currentRoom.teacherId !== player.id) {
      const err = { success: false, message: 'Tylko pani Halbina może tłumaczyć się Dyrektorowi!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const choiceNum = parseInt(choice, 10) || 1;
    currentRoom.resolveSmokeInterrogation(choiceNum, player.fullName || player.name || 'Pani Halbina');
    if (callback) callback({ success: true, choice: choiceNum });
  });

  // ====================================================
  // SZKOLNY SKLEPIK / BUFET (PANI BASIA)
  // ====================================================
  socket.on('buffet_get_shop', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player) return;

    if (player.currentZone !== 'BUFFET') {
      const err = { success: false, message: 'Musisz wejść do Szkolnego Sklepiku!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const data = {
      success: true,
      shopkeeper: 'Pani Basia',
      stock: BUFFET_ITEMS,
      items: BUFFET_ITEMS, // For complete backward/forward client compatibility
      wallet: player.bankBalance || 0,
      inventory: player.inventory || []
    };
    socket.emit('buffet_shop_data', data);
    if (callback) callback(data);
  });

  socket.on('buffet_buy_item', ({ itemId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'BUFFET') {
      const err = { success: false, message: 'Musisz być w Szkolnym Sklepiku przy ladzie!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const itemDef = BUFFET_ITEMS.find(it => it.id === itemId) || CLASSIC_ITEMS[itemId];
    if (!itemDef) {
      const err = { success: false, message: 'Nie ma takiego produktu w sklepiku!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if ((player.bankBalance || 0) < itemDef.price) {
      const err = { success: false, message: 'Brak wystarczających środków na koncie bankowym!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    player.bankBalance = Math.round((player.bankBalance - itemDef.price) * 100) / 100;
    if (!player.inventory) player.inventory = [];
    const ex = player.inventory.find(i => i.id === itemId);
    if (ex) ex.quantity = (ex.quantity || 1) + 1;
    else player.inventory.push({ ...itemDef, quantity: 1 });

    player.points += 30;
    const logMsg = `🛒 ${player.name} kupił ${itemDef.name} (${itemDef.price.toFixed(2)} PLN) w szkolnym sklepiku u pani Basi!`;
    currentRoom.roundLogs.unshift(logMsg);

    const res = {
      success: true,
      item: itemDef,
      itemName: itemDef.name,
      wallet: player.bankBalance,
      inventory: player.inventory,
      message: `Kupiono ${itemDef.name} za ${itemDef.price.toFixed(2)} PLN!`
    };
    socket.emit('buffet_buy_success', res);
    if (callback) callback(res);
  });

  // ====================================================
  // POKÓJ NAUCZYCIELSKI (STAFF ROOM)
  // ====================================================
  socket.on('staff_room_action', ({ action }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'STAFF_ROOM') {
      const err = { success: false, message: 'Musisz wejść do Pokoju Nauczycielskiego!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const isTeacher = player.role === 'TEACHER';

    if (action === 'brew_coffee') {
      if (player.coffeeCooldown && player.coffeeCooldown > Date.now()) {
        const wait = Math.ceil((player.coffeeCooldown - Date.now()) / 1000);
        const err = { success: false, message: `Ekspres do kawy stygnie! Poczekaj ${wait}s.` };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }
      player.coffeeCooldown = Date.now() + 25000;
      if (!player.inventory) player.inventory = [];
      const ex = player.inventory.find(i => i.id === 'coffee');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...CLASSIC_ITEMS.coffee, quantity: 1 });

      const logMsg = `☕ ${player.name} zaparzył gorącą kawę z ekspresu w Pokoju Nauczycielskim!`;
      currentRoom.roundLogs.unshift(logMsg);
      const res = { success: true, message: 'Zaparzono świeżą kawę z ekspresu!', inventory: player.inventory };
      socket.emit('staff_room_action_result', res);
      if (callback) callback(res);
      return;
    }

    if (action === 'steal_exam_key') {
      if (isTeacher) {
        const res = { success: false, message: 'Jesteś nauczycielką, ty układasz te sprawdziany!' };
        socket.emit('action_failed', res);
        if (callback) callback(res);
        return;
      }
      if (currentRoom.examKeyStolen) {
        const err = { success: false, message: 'Klucz odpowiedzi został już wcześniej skradziony!' };
        socket.emit('action_failed', err);
        if (callback) callback(err);
        return;
      }
      // 70% chance of success, 30% caught
      if (Math.random() < 0.75) {
        currentRoom.examKeyStolen = true;
        if (!player.inventory) player.inventory = [];
        player.inventory.push({ ...CLASSIC_ITEMS.exam_key, quantity: 1 });
        player.points += 350;
        const logMsg = `🕵️ ${player.name} przekopał teczki na stole i wykradł Klucz Odpowiedzi do sprawdzianu z chemii!`;
        currentRoom.roundLogs.unshift(logMsg);
        const res = { success: true, message: 'Zdobyłeś Klucz Odpowiedzi do sprawdzianu (+350 pkt)!', inventory: player.inventory };
        socket.emit('staff_room_action_result', res);
        if (callback) callback(res);
      } else {
        const logMsg = `🚨 ${player.name} został przyłapany w Pokoju Nauczycielskim przez pana Wiesia z WF-u!`;
        currentRoom.roundLogs.unshift(logMsg);
        currentRoom.penalizeStudent(player, 'WRONG_DESK');
        player.sentToDirector = true;
        const res = { success: false, message: 'Zostałeś przyłapany na grzebaniu w sprawdzianach! Marsz do Dyrektora!' };
        socket.emit('staff_room_action_result', res);
        if (callback) callback(res);
      }
      return;
    }

    if (action === 'chat_teachers') {
      const dialogues = [
        "mgr Grażyna (Matematyka): 'Niech pan Wiesiu nie wchodzi w brudnych butach z boiska...'",
        "pan Wiesiu (WF): 'Młody, masz zwolnienie? Bo jak nie to 10 okrążeń wokół szkoły!'",
        "mgr Grażyna: 'Halbina znowu krzyczy na całe piętro... co ta kobieta bierze?'",
        "pan Wiesiu: 'Pamiętaj: sport to zdrowie, a chemia to tylko smród i wybuchy.'"
      ];
      const selected = dialogues[Math.floor(Math.random() * dialogues.length)];
      const res = { success: true, message: selected };
      socket.emit('staff_room_action_result', res);
      if (callback) callback(res);
      return;
    }
  });

  // ====================================================
  // SECRET ROOMS (SCHOWEK WOŹNEGO, KANTOREK, RADIOWĘZEŁ)
  // ====================================================

  // 1. Schowek Woźnego: Przeszukiwanie skrzyni
  socket.on('janitor_search_chest', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;
    if (player.currentZone !== 'JANITOR_ROOM') {
      const err = { success: false, message: 'Musisz być w Schowku Woźnego!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }
    if (currentRoom.janitorChestLooted) {
      const err = { success: false, message: 'Ciężka skrzynia woźnego została już wcześniej opróżniona!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    currentRoom.janitorChestLooted = true;
    if (!player.inventory) player.inventory = [];
    const roll = Math.random();
    let lootItem = null;
    const cash = Math.floor(60 + Math.random() * 80);
    player.bankBalance = Math.round(((player.bankBalance || 0) + cash) * 100) / 100;

    if (roll < 0.5) {
      lootItem = CLASSIC_ITEMS.bolt_cutter;
      const ex = player.inventory.find(i => i.id === 'bolt_cutter');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...lootItem, quantity: 1 });
    } else {
      lootItem = CLASSIC_ITEMS.master_keycard;
      const ex = player.inventory.find(i => i.id === 'master_keycard');
      if (ex) ex.quantity = (ex.quantity || 1) + 1;
      else player.inventory.push({ ...lootItem, quantity: 1 });
    }

    player.points += 220;
    const msg = `🧰 ${player.fullName || player.name} otworzył skrzynię woźnego! Znalazł: ${lootItem.name} oraz ${cash} PLN w starym portfelu!`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('notification', { message: msg });
    const res = { success: true, message: msg, item: lootItem, cash: cash, inventory: player.inventory, bankBalance: player.bankBalance };
    socket.emit('janitor_chest_loot', res);
    if (callback) callback(res);
  });

  // 2. Schowek Woźnego: Zdjęcie breloka z kluczami ze ściany
  socket.on('janitor_take_keycard', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;
    if (player.currentZone !== 'JANITOR_ROOM') return;

    if (currentRoom.janitorKeycardTaken) {
      const err = { success: false, message: 'Brelok z kartą został już zdjęty ze ściany!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    currentRoom.janitorKeycardTaken = true;
    if (!player.inventory) player.inventory = [];
    const ex = player.inventory.find(i => i.id === 'master_keycard');
    if (ex) ex.quantity = (ex.quantity || 1) + 1;
    else player.inventory.push({ ...CLASSIC_ITEMS.master_keycard, quantity: 1 });

    player.points += 150;
    const msg = `💳 ${player.fullName || player.name} zdjął ze ściany Kartę Główną Dyrekcji (Master Keycard)!`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('notification', { message: msg });
    const res = { success: true, message: msg, inventory: player.inventory };
    socket.emit('janitor_keycard_taken', res);
    if (callback) callback(res);
  });

  // 3. Schowek Woźnego: Sabotaż bezpieczników
  socket.on('janitor_sabotage_fuses', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;
    if (player.currentZone !== 'JANITOR_ROOM') return;

    if (currentRoom.schoolBlackoutTimer > 0) {
      const err = { success: false, message: 'Główne zasilanie jest już odcięte!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    currentRoom.schoolBlackoutTimer = 14.0;
    currentRoom.teacherStunTimer = Math.max(currentRoom.teacherStunTimer || 0, 10.0);
    currentRoom.setTeacherSpeech("A CO TO ZA CIEMNOŚCI?! KTO WYŁĄCZYŁ PRĄD W SZKOLE?!", 5.0);

    player.points += 180;
    const msg = `⚡ ${player.fullName || player.name} opuścił główny hebel zasilania! Cała szkoła pogrążyła się w ciemnościach na 14 sekund!`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('school_blackout', { duration: 14.0, message: msg });
    const res = { success: true, message: msg };
    if (callback) callback(res);
  });

  // 4. Kantorek Odczynników: Synteza chemiczna
  socket.on('chem_lab_synthesize', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;
    if (player.currentZone !== 'CHEM_LAB') return;

    if (player.chemSynthCooldown && player.chemSynthCooldown > Date.now()) {
      const wait = Math.ceil((player.chemSynthCooldown - Date.now()) / 1000);
      const err = { success: false, message: `Aparatura laboratoryjna stygnie! Poczekaj ${wait}s.` };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    player.chemSynthCooldown = Date.now() + 20000;
    if (!player.inventory) player.inventory = [];
    const ex = player.inventory.find(i => i.id === 'smoke_grenade');
    if (ex) ex.quantity = (ex.quantity || 1) + 1;
    else player.inventory.push({ ...CLASSIC_ITEMS.smoke_grenade, quantity: 1 });

    player.points += 150;
    const msg = `🧪 ${player.fullName || player.name} przeprowadził syntezę w kantorku i otrzymał Wojskową Świecę Dymną!`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('notification', { message: msg });
    const res = { success: true, message: msg, inventory: player.inventory };
    socket.emit('chem_lab_synth_result', res);
    if (callback) callback(res);
  });

  // 5. Radiowęzeł: Komunikat przez głośniki
  socket.on('server_room_broadcast', ({ broadcastType, text }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;
    if (player.currentZone !== 'SERVER_ROOM') return;

    let chimeMsg = '';
    if (broadcastType === 'FIRE_ALARM') {
      chimeMsg = `🚨 RADIOWĘZEŁ: "UWAGA! ALARM POŻAROWY! PROSIMY O SPOKOJNE OPUSZCZENIE BUDYNKU!"`;
      currentRoom.teacherStunTimer = 12.0;
      currentRoom.popQuizCooldown = 25.0;
      currentRoom.setTeacherSpeech("EWAKUACJA?! TYLKO BEZ PANIKI DZIECI!", 5.0);
    } else if (broadcastType === 'SUMMON_TEACHER') {
      chimeMsg = `📢 RADIOWĘZEŁ: "KOMUNIKAT DYREKCJI: Pani mgr Halbina proszona jest pilnie do gabinetu Dyrektora!"`;
      currentRoom.teacher.x = 80;
      currentRoom.teacherStunTimer = 18.0;
      currentRoom.setTeacherSpeech("Zaraz wracam, macie siedzieć cicho jak trusie!", 5.0);
    } else if (broadcastType === 'HARDBASS') {
      chimeMsg = `🔊 RADIOWĘZEŁ: "${player.fullName || player.name} puścił na całą szkołę potężny HARDBASS przez głośniki!"`;
      currentRoom.players.forEach(p => {
        if (!p.isEliminated) p.points += 250;
      });
      currentRoom.startStoryline('STUDENT_REVOLT');
    } else {
      chimeMsg = `📢 RADIOWĘZEŁ [${player.fullName || player.name}]: "${text || 'Uwaga wszyscy uczniowie!'}"`;
    }

    currentRoom.roundLogs.unshift(chimeMsg);
    io.to(currentRoom.code).emit('pa_broadcast_triggered', {
      senderName: player.fullName || player.name,
      broadcastType: broadcastType,
      text: text,
      message: chimeMsg
    });
    const res = { success: true, message: chimeMsg };
    if (callback) callback(res);
  });

  // 6. Radiowęzeł: Skasowanie nagrań CCTV i uwag
  socket.on('server_room_clear_cctv', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;
    if (player.currentZone !== 'SERVER_ROOM') return;

    currentRoom.cctvCleared = true;
    currentRoom.players.forEach(p => {
      p.uwagi = 0;
      if (p.eduvulcan) {
        p.eduvulcan.notes = [];
        p.eduvulcan.uwagi = [];
      }
    });

    player.points += 300;
    const msg = `🖥️ ${player.fullName || player.name} wyczyścił nagrania monitoringu! Wszystkie uwagi w EduVulcan zostały usunięte!`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('cctv_logs_cleared', { message: msg });
    const res = { success: true, message: msg };
    if (callback) callback(res);
  });

  // 7. Uruchomienie wątku fabularnego (Nauczyciel / Gracz)
  socket.on('trigger_storyline', ({ arcType }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const ok = currentRoom.startStoryline(arcType);
    if (ok) {
      if (callback) callback({ success: true, message: `Rozpoczęto wątek: ${arcType}` });
    } else {
      const err = { success: false, message: 'Wątek fabularny jest już w toku!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
    }
  });
  // 8. Podnoszenie kaucjowanych puszek/butelek z ziemi na boisku
  socket.on('pickup_deposit_item', ({ depositId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'COURTYARD') {
      const err = { success: false, message: 'Przedmioty kaucjowane znajdują się na zewnątrz na boisku!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (!currentRoom.courtyardDeposits) currentRoom.courtyardDeposits = [];
    const depIdx = currentRoom.courtyardDeposits.findIndex(d => d.id === depositId);
    if (depIdx === -1) {
      const err = { success: false, message: 'Ktoś już podniósł tę puszkę/butelkę!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const dep = currentRoom.courtyardDeposits[depIdx];
    const dist = Math.hypot(player.x - dep.x, player.y - dep.y);
    if (dist > 90) {
      const err = { success: false, message: 'Podejdź bliżej, aby podnieść puszkę/butelkę!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    currentRoom.courtyardDeposits.splice(depIdx, 1);

    if (!player.inventory) player.inventory = [];
    const existing = player.inventory.find(i => i.id === dep.typeId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      const def = CLASSIC_ITEMS[dep.typeId] || { id: dep.typeId, name: dep.name, price: dep.value, sellPrice: dep.value, icon: dep.icon };
      player.inventory.push({ ...def, quantity: 1 });
    }
    player.points += 15;

    const res = {
      success: true,
      depositId: dep.id,
      item: dep,
      inventory: player.inventory,
      message: `Podniesiono: ${dep.name} (Wartość kaucji: ${dep.value.toFixed(2)} PLN)!`
    };

    socket.emit('deposit_picked_up', res);
    io.to(currentRoom.code).emit('courtyard_deposits_updated', { deposits: currentRoom.courtyardDeposits });
    if (callback) callback(res);
  });

  // 9. Kaucjomat 2000: Zwrot puszek i butelek za gotówkę
  socket.on('use_kaucjomat', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'COURTYARD') {
      const err = { success: false, message: 'Kaucjomat znajduje się na boisku szkolnym!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (Math.hypot(player.x - 820, player.y - 150) > 115) {
      const err = { success: false, message: 'Podejdź bliżej Kaucjomatu!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (!player.inventory) player.inventory = [];
    const depositTypes = ['can_deposit', 'bottle_deposit', 'plastic_bottle_deposit'];
    let totalItems = 0;
    let totalPayout = 0;

    for (let i = player.inventory.length - 1; i >= 0; i--) {
      const it = player.inventory[i];
      if (depositTypes.includes(it.id)) {
        const qty = it.quantity || 1;
        totalItems += qty;
        const val = it.id === 'plastic_bottle_deposit' ? 0.5 : 1.0;
        totalPayout += val * qty;
        player.inventory.splice(i, 1);
      }
    }

    if (totalItems === 0) {
      const err = {
        success: false,
        message: '♻️ KAUCJOMAT: Pusty plecak! Pozbieraj puszki i butelki z trawy, ławek i śmietników na boisku.'
      };
      socket.emit('kaucjomat_result', err);
      if (callback) callback(err);
      return;
    }

    player.bankBalance = Math.round(((player.bankBalance || 0) + totalPayout) * 100) / 100;
    player.points += totalItems * 25;

    const logMsg = `♻️ ${player.fullName || player.name} zwrócił ${totalItems} opakowań do Kaucjomatu (+${totalPayout.toFixed(2)} PLN gotówki)!`;
    currentRoom.roundLogs.unshift(logMsg);

    const res = {
      success: true,
      itemsCount: totalItems,
      payout: totalPayout,
      newBalance: player.bankBalance,
      inventory: player.inventory,
      message: `♻️ KAUCJOMAT: Włożono ${totalItems} sztuk! Wypłacono +${totalPayout.toFixed(2)} PLN gotówki!`
    };

    socket.emit('kaucjomat_result', res);
    io.to(currentRoom.code).emit('kaucjomat_broadcast', { message: logMsg });
    if (callback) callback(res);
  });

  // 10. Grabienie liści dla Woźnego na boisku
  socket.on('wozny_rake_leaves', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'COURTYARD') {
      const err = { success: false, message: 'Pan Woźny pracuje na boisku szkolnym!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (Math.hypot(player.x - 160, player.y - 440) > 115) {
      const err = { success: false, message: 'Podejdź do pana Woźnego przy stercie liści!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (player.woznyRakeCooldown && player.woznyRakeCooldown > Date.now()) {
      const waitSec = Math.ceil((player.woznyRakeCooldown - Date.now()) / 1000);
      const err = { success: false, message: `Pan Woźny: "Daj mi chwilę odpocząć, młody! Przyjdź za ${waitSec}s!"` };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    player.woznyRakeCooldown = Date.now() + 25000;
    const reward = Math.floor(15 + Math.random() * 11);
    player.bankBalance = Math.round(((player.bankBalance || 0) + reward) * 100) / 100;
    player.points += 50;

    const logMsg = `🍂 ${player.fullName || player.name} pomógł Woźnemu grabić liście (+${reward} PLN od ręki)!`;
    currentRoom.roundLogs.unshift(logMsg);

    const res = {
      success: true,
      reward: reward,
      newBalance: player.bankBalance,
      message: `🍂 Pan Woźny: "Dobra robota, plac ogarnięty! Masz tu ${reward} PLN na drożdżówkę w sklepiku."`
    };

    socket.emit('wozny_rake_result', res);
    if (callback) callback(res);
  });

  // 11. Rzuty do kosza o zakład na boisku
  socket.on('basketball_shot_bet', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'COURTYARD') {
      const err = { success: false, message: 'Kosz do koszykówki jest na boisku!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (Math.hypot(player.x - 230, player.y - 320) > 115) {
      const err = { success: false, message: 'Podejdź pod kosz na boisku!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if ((player.bankBalance || 0) < 10) {
      const err = { success: false, message: 'Potrzebujesz min. 10 PLN w kieszeni, aby zagrać o zakład!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (player.basketballCooldown && player.basketballCooldown > Date.now()) {
      const waitSec = Math.ceil((player.basketballCooldown - Date.now()) / 1000);
      const err = { success: false, message: `Poczekaj jeszcze ${waitSec}s przed kolejnym rzutem!` };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    player.basketballCooldown = Date.now() + 8000;
    const isSuccess = Math.random() < 0.65;

    if (isSuccess) {
      player.bankBalance = Math.round(((player.bankBalance || 0) + 15) * 100) / 100;
      player.points += 60;
      const logMsg = `🏀 ${player.fullName || player.name} trafił czyściutki rzut za 3 punkty i wygrał 25 PLN zakładu!`;
      currentRoom.roundLogs.unshift(logMsg);
      const res = {
        success: true,
        won: true,
        newBalance: player.bankBalance,
        message: '🏀 CZYSTY KOSZ (SWISH)! Trafiłeś za 3 punkty i wygrywasz 25 PLN (zysk +15 PLN)!'
      };
      socket.emit('basketball_result', res);
      io.to(currentRoom.code).emit('basketball_shot_event', { success: true, shooter: player.name });
      if (callback) callback(res);
    } else {
      player.bankBalance = Math.round(Math.max(0, (player.bankBalance || 0) - 10) * 100) / 100;
      const logMsg = `🏀 ${player.fullName || player.name} spudłował rzut do kosza i stracił 10 PLN!`;
      currentRoom.roundLogs.unshift(logMsg);
      const res = {
        success: true,
        won: false,
        newBalance: player.bankBalance,
        message: '🏀 Pudło! Piłka odbiła się od tablicy. Tracisz 10 PLN z zakładu.'
      };
      socket.emit('basketball_result', res);
      io.to(currentRoom.code).emit('basketball_shot_event', { success: false, shooter: player.name });
      if (callback) callback(res);
    }
  });

  // 12. Przeszukiwanie kontenerów na dziedzińcu
  socket.on('search_courtyard_trash', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    if (player.currentZone !== 'COURTYARD') {
      const err = { success: false, message: 'Kontenery na śmieci są na dziedzińcu!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const nearTrash = (Math.hypot(player.x - 120, player.y - 210) < 95) || (Math.hypot(player.x - 890, player.y - 490) < 95);
    if (!nearTrash) {
      const err = { success: false, message: 'Podejdź do zielonego kontenera na odpady!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (player.courtyardTrashCooldown && player.courtyardTrashCooldown > Date.now()) {
      const waitSec = Math.ceil((player.courtyardTrashCooldown - Date.now()) / 1000);
      const err = { success: false, message: `Kontener już przeszukany. Sprawdź ponownie za ${waitSec}s!` };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    player.courtyardTrashCooldown = Date.now() + 18000;
    const roll = Math.random();
    let msg = '';

    if (!player.inventory) player.inventory = [];

    if (roll < 0.55) {
      const canCount = Math.floor(1 + Math.random() * 2);
      const itemDef = CLASSIC_ITEMS.can_deposit;
      const existing = player.inventory.find(i => i.id === 'can_deposit');
      if (existing) existing.quantity = (existing.quantity || 1) + canCount;
      else player.inventory.push({ ...itemDef, quantity: canCount });
      player.points += 25;
      msg = `🗑️ Wyłowiłeś z kontenera ${canCount}x ${itemDef.name}! Wrzuć do Kaucjomatu!`;
    } else if (roll < 0.85) {
      const coins = Math.floor(2 + Math.random() * 5);
      player.bankBalance = Math.round(((player.bankBalance || 0) + coins) * 100) / 100;
      player.points += 30;
      msg = `🪙 Znalazłeś ${coins} PLN w porzuconym kartoniku pod kontenerem!`;
    } else {
      msg = `🗑️ Przeszukałeś kontener, ale znalazłeś tylko stare papierki po drożdżówkach.`;
    }

    const res = {
      success: true,
      newBalance: player.bankBalance,
      inventory: player.inventory,
      message: msg
    };
    socket.emit('trash_search_result', res);
    if (callback) callback(res);
  });

  // 13. Sprawdzanie zadania domowego przez Halbinę
  socket.on('teacher_check_homework', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    const prepared = [];
    const unprepared = [];

    currentRoom.players.forEach(p => {
      if (p.role === 'STUDENT' && !p.isEliminated) {
        if (p.currentZone === 'CHEMISTRY') {
          if (p.hasHomework) {
            prepared.push(p);
            p.points += 60;
            if (p.eduvulcan) {
              if (!p.eduvulcan.grades) p.eduvulcan.grades = [];
              p.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Kontrola zeszytu (Zadanie domowe)', grade: 5 });
              p.eduvulcan.homeworkChecked = 'Odrobione (Plus za aktywność!)';
            }
          } else {
            unprepared.push(p);
            p.points = Math.max(0, p.points - 60);
            if (p.eduvulcan) {
              if (!p.eduvulcan.grades) p.eduvulcan.grades = [];
              p.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Brak zadania domowego', grade: 1 });
              if (!p.eduvulcan.uwagi) p.eduvulcan.uwagi = [];
              p.eduvulcan.uwagi.push('Brak zadania domowego z chemii!');
              p.eduvulcan.homeworkChecked = 'Nieodrobione! (Ocena 1 + Uwaga)';
            }
            currentRoom.penalizeStudent(p, 'UNPREPARED');
          }
        }
      }
    });

    let msg = '';
    if (unprepared.length > 0) {
      const unpNames = unprepared.map(u => u.fullName || u.name).join(', ');
      msg = `📓 Halbina sprawdziła zadania domowe! Brak zadania: ${unpNames} (Wstawiono 1 i uwagę!).`;
      if (prepared.length > 0) {
        msg += ` Odrobione: ${prepared.map(p => p.fullName || p.name).join(', ')} (+5 w dzienniku).`;
      }
      currentRoom.setTeacherSpeech("Co to ma być?! Kto nie odrobił zadania, ten ma jedynkę i uwagę w EduVulcan!", 6.0);
    } else if (prepared.length > 0) {
      msg = `📓 Halbina sprawdziła zadania domowe! Wszyscy obecni uczniowie mają odrobione zadanie (+5 w dzienniku)!`;
      currentRoom.setTeacherSpeech("No, widzę że wszyscy odrobiliście zadanie. Aż jestem w szoku...", 5.0);
    } else {
      msg = `📓 Halbina chciała sprawdzić zeszyty, ale w Sali 204 nikogo nie ma!`;
      currentRoom.setTeacherSpeech("Gdzie są uczniowie?! Nikogo nie ma w klasie!", 4.0);
    }

    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('teacher_check_homework_result', {
      message: msg,
      prepared: prepared.map(p => ({ id: p.id, name: p.fullName || p.name })),
      unprepared: unprepared.map(u => ({ id: u.id, name: u.fullName || u.name }))
    });
    if (callback) callback({ success: true, message: msg });
  });

  // HALBINA TEACHER EXPANDED EVENT HANDLERS
  // ====================================================
  // 1. Sprawdzanie obecności (Roll Call)
  socket.on('teacher_roll_call', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    const absentees = [];
    currentRoom.players.forEach(p => {
      if (p.role === 'STUDENT' && !p.isEliminated) {
        if (p.currentZone !== 'CHEMISTRY') {
          absentees.push(p);
          if (p.eduvulcan) {
            p.eduvulcan.attendance = 'Nieobecny (Na wagarach)';
            if (!p.eduvulcan.uwagi) p.eduvulcan.uwagi = [];
            p.eduvulcan.uwagi.push('Nieobecność w sali podczas sprawdzania obecności (Wagary)');
          }
          currentRoom.penalizeStudent(p, 'WRONG_DESK');
        }
      }
    });

    let msg = '';
    if (absentees.length > 0) {
      const names = absentees.map(a => a.name).join(', ');
      msg = `📋 Halbina sprawdziła listę obecności! Nieobecni poza salą: ${names} (+1 uwaga dla każdego)!`;
      currentRoom.setTeacherSpeech("A gdzie są ci uciekinierzy?! Wszyscy mają wagary w dzienniku!", 5.0);
    } else {
      msg = `📋 Halbina sprawdziła listę obecności! Wszyscy obecni w Sali 204.`;
      currentRoom.setTeacherSpeech("No, przynajmniej nikt nie zwiał na korytarz...", 4.0);
    }

    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('teacher_roll_call_result', { message: msg, absenteesCount: absentees.length });
    if (callback) callback({ success: true, message: msg });
  });

  // 2. Konfiskata kontrabandy
  socket.on('teacher_confiscate', ({ targetStudentId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    const student = currentRoom.players.get(targetStudentId);
    if (!student || student.role !== 'STUDENT' || student.isEliminated) return;

    // Check proximity to student
    if (Math.hypot(currentRoom.teacher.x - student.x, currentRoom.teacher.y - student.y) > 130) {
      const err = { success: false, message: 'Podejdź bliżej do ucznia, aby go przeszukać!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const contrabandIds = ['vape', 'firecracker', 'energy_drink', 'monster', 'knife', 'machete', 'cheat_sheet', 'ar15'];
    if (!student.inventory) student.inventory = [];
    const foundIdx = student.inventory.findIndex(i => contrabandIds.includes(i.id));

    if (foundIdx !== -1) {
      const confiscated = student.inventory[foundIdx];
      if (confiscated.quantity > 1) confiscated.quantity--;
      else student.inventory.splice(foundIdx, 1);

      currentRoom.penalizeStudent(student, 'CHEATING');
      currentRoom.setTeacherSpeech(`Oddaj ten ${confiscated.name} pajacu! Do odebrania przez rodziców!`, 5.0);
      const msg = `🔍 Halbina przeszukała ${student.name} i SKONFISKOWAŁA: ${confiscated.name}! (+1 uwaga w dzienniku)`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('teacher_confiscate_result', { studentName: student.name, itemName: confiscated.name, message: msg });
      if (callback) callback({ success: true, message: msg });
    } else {
      const msg = `🔍 Halbina przeszukała ${student.name}: brak zakazanych przedmiotów!`;
      currentRoom.setTeacherSpeech("Masz szczęście, że tym razem nic nie masz...", 3.5);
      currentRoom.roundLogs.unshift(msg);
      socket.emit('action_failed', { message: msg });
      if (callback) callback({ success: false, message: msg });
    }
  });

  // 3. Rzut kredą przez Halbinę
  socket.on('teacher_throw_chalk', ({ targetX, targetY }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    if (currentRoom.teacherChalkCooldown > 0) {
      const err = { success: false, message: `Poczekaj ${Math.ceil(currentRoom.teacherChalkCooldown)}s na kolejny rzut kredą!` };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }
    currentRoom.teacherChalkCooldown = 4.0;

    const proj = {
      id: 'teacher_chalk_' + Date.now(),
      type: 'chalk',
      ownerId: socket.id,
      startX: currentRoom.teacher.x,
      startY: currentRoom.teacher.y + 10,
      targetX: targetX || 500,
      targetY: targetY || 380,
      t: 0,
      duration: 0.7
    };
    currentRoom.projectiles.push(proj);

    // Check hit on students near target
    currentRoom.players.forEach(p => {
      if (p.role === 'STUDENT' && !p.isEliminated && p.currentZone === 'CHEMISTRY') {
        if (Math.hypot(p.x - proj.targetX, p.y - proj.targetY) < 65) {
          p.isSitting = true;
          io.to(p.id).emit('notification', { message: '🎯 Dostałeś kredą od Halbina w głowę! Siadasz natychmiast w ławce!' });
        }
      }
    });

    const msg = `🖍️ Halbina cisnęła kredą w stronę ławki! "CISZA TAM Z TYŁU!"`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('teacher_chalk_thrown', { projectile: proj, message: msg });
    if (callback) callback({ success: true });
  });

  // 4. Wezwanie Dyrektora do Sali przez Halbinę
  socket.on('teacher_call_director', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    if (currentRoom.directorVisitCooldown > 0) {
      const err = { success: false, message: 'Dyrektor niedawno był na interwencji!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }
    currentRoom.directorVisitCooldown = 60.0;
    currentRoom.directorInClassroom = true;

    const msg = `📞 Halbina zadzwoniła do gabinetu! mgr Janusz Nowak przybywa na dyscyplinującą kontrolę do Sali 204!`;
    currentRoom.roundLogs.unshift(msg);
    currentRoom.setTeacherSpeech("Zaraz pan Dyrektor zrobi z wami porządek!", 5.0);
    io.to(currentRoom.code).emit('director_visit_started', { message: msg });

    setTimeout(() => {
      if (currentRoom) {
        currentRoom.directorInClassroom = false;
        io.to(currentRoom.code).emit('director_visit_ended', { message: 'Dyrektor wrócił do swojego gabinetu.' });
      }
    }, 22000);

    if (callback) callback({ success: true, message: msg });
  });

  // 5. Uderzenie linijką / dziennikiem w katedrę (Cisza w klasie!)
  socket.on('teacher_slam_desk', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    currentRoom.teacher.anger = Math.max(0, currentRoom.teacher.anger - 20);
    currentRoom.setTeacherSpeech("CISZA W TEJ SALI BO POWSTAWIAM WSZYSTKIM JEDYNKI!", 5.0);
    const msg = `💥 Halbina z całej siły pierdolnęła dziennikiem w katedrę! "CISZA W TEJ SALI!" (Wszyscy uczniowie zamilkli)`;
    currentRoom.roundLogs.unshift(msg);
    io.to(currentRoom.code).emit('teacher_slammed_desk', { message: msg });
    if (callback) callback({ success: true, message: msg });
  });

  // Bank transfer between students
  socket.on('bank_transfer', ({ toId, recipientId, amount }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const sender = currentRoom.players.get(socket.id);
    if (!sender || sender.isEliminated) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      const err = { success: false, message: 'Nieprawidłowa kwota przelewu!' };
      socket.emit('bank_transfer_result', err);
      if (callback) callback(err);
      return;
    }

    if ((sender.bankBalance || 0) < val) {
      const err = { success: false, message: 'Niewystarczające środki na koncie bankowym!' };
      socket.emit('bank_transfer_result', err);
      if (callback) callback(err);
      return;
    }

    const targetId = toId || recipientId;
    const recipient = currentRoom.players.get(targetId);
    if (!recipient || recipient.id === sender.id) {
      const err = { success: false, message: 'Nie znaleziono odbiorcy przelewu!' };
      socket.emit('bank_transfer_result', err);
      if (callback) callback(err);
      return;
    }

    sender.bankBalance = Math.round((sender.bankBalance - val) * 100) / 100;
    recipient.bankBalance = Math.round(((recipient.bankBalance || 0) + val) * 100) / 100;

    const logMsg = `💸 ${sender.name} przelał ${val.toFixed(2)} PLN dla ${recipient.name} przez aplikację Bank!`;
    currentRoom.roundLogs.unshift(logMsg);

    io.to(recipient.id).emit('bank_transfer_received', {
      senderName: sender.fullName || sender.name,
      fromName: sender.fullName || sender.name,
      amount: val,
      newBalance: recipient.bankBalance,
      message: `💸 Otrzymałeś przelew ${val.toFixed(2)} PLN od ${sender.fullName || sender.name}!`
    });

    const res = {
      success: true,
      toName: recipient.fullName || recipient.name,
      amount: val,
      newBalance: sender.bankBalance,
      message: `Wysłano ${val.toFixed(2)} PLN do ${recipient.fullName || recipient.name}!`
    };

    socket.emit('bank_transfer_result', res);
    if (callback) callback(res);
  });

  // Dark Web toilet dealer shop
  socket.on('dealer_get_shop', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student) return;

    if (student.currentZone !== 'TOILET') {
      const err = { success: false, message: 'Diler znajduje się w szkolnej toalecie!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (!currentRoom.dealerSpawned) {
      const err = { success: false, message: 'Diler z Dark Weba jeszcze nie dotarł do kibla (będzie o 11:55)!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const data = {
      success: true,
      stock: currentRoom.dealerStock || [],
      wallet: student.bankBalance || 0,
      bankBalance: student.bankBalance || 0,
      inventory: student.inventory || [],
      playerInventory: student.inventory || []
    };

    socket.emit('dealer_shop_data', data);
    if (callback) callback(data);
  });

  socket.on('dealer_buy_item', ({ itemId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.isEliminated) return;

    if (student.currentZone !== 'TOILET') {
      const err = { success: false, message: 'Musisz być w toalecie przy dilerze!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (!currentRoom.dealerSpawned) {
      const err = { success: false, message: 'Diler jeszcze się nie pojawił w kiblu!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const itemDef = CLASSIC_ITEMS[itemId];
    if (!itemDef) {
      const err = { success: false, message: 'Nieznany przedmiot!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if ((student.bankBalance || 0) < itemDef.price) {
      const err = { success: false, message: 'Brak wystarczających środków na koncie bankowym!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    student.bankBalance = Math.round((student.bankBalance - itemDef.price) * 100) / 100;
    if (!student.inventory) student.inventory = [];

    const existing = student.inventory.find(it => it.id === itemId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      student.inventory.push({ ...itemDef, quantity: 1 });
    }

    student.points += 50;
    const logMsg = `🛒 ${student.name} kupił ${itemDef.name} (${itemDef.price} PLN) od dilera w kiblu!`;
    currentRoom.roundLogs.unshift(logMsg);

    const res = {
      success: true,
      item: itemDef,
      itemName: itemDef.name,
      wallet: student.bankBalance,
      newBalance: student.bankBalance,
      inventory: student.inventory,
      playerInventory: student.inventory,
      message: `Kupiono ${itemDef.name} za ${itemDef.price} PLN!`
    };

    socket.emit('dealer_purchase_success', res);
    if (callback) callback(res);
  });

  socket.on('dealer_sell_item', ({ itemId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.isEliminated) return;

    if (student.currentZone !== 'TOILET') {
      const err = { success: false, message: 'Musisz być w toalecie przy dilerze!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (!student.inventory) {
      const err = { success: false, message: 'Twój ekwipunek jest pusty!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const itemIdx = student.inventory.findIndex(it => it.id === itemId);
    if (itemIdx === -1) {
      const err = { success: false, message: 'Nie posiadasz tego przedmiotu!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const item = student.inventory[itemIdx];
    const itemDef = CLASSIC_ITEMS[itemId] || item;
    const sellPrice = itemDef.sellPrice || 0;

    if (sellPrice <= 0 || itemId === 'solved_task') {
      const err = { success: false, message: 'Diler: "Nie skupuję zadań domowych ani zeszytów! Przynieś mi fanty, puszki albo klamki!"' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    if (item.quantity > 1) {
      item.quantity--;
    } else {
      student.inventory.splice(itemIdx, 1);
    }

    student.bankBalance = Math.round(((student.bankBalance || 0) + sellPrice) * 100) / 100;
    student.points += 75;

    const logMsg = `💵 ${student.name} opchnął ${itemDef.name} dilerowi za ${sellPrice} PLN!`;
    currentRoom.roundLogs.unshift(logMsg);

    const res = {
      success: true,
      item: itemDef,
      itemName: itemDef.name,
      earned: sellPrice,
      sellPrice: sellPrice,
      wallet: student.bankBalance,
      newBalance: student.bankBalance,
      inventory: student.inventory,
      playerInventory: student.inventory,
      message: `Sprzedano ${itemDef.name} za ${sellPrice} PLN!`
    };

    socket.emit('dealer_sell_success', res);
    if (callback) callback(res);
  });

  // Chemistry notebook exercises (NO MONEY - REQUIRED HOMEWORK)
  socket.on('start_chemistry_task', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.role !== 'STUDENT' || student.isEliminated) return;

    if (student.currentZone !== 'CHEMISTRY') {
      const err = { success: false, message: 'Zadania z chemii możesz rozwiązywać tylko w Sali 204!' };
      socket.emit('action_failed', err);
      if (callback) callback(err);
      return;
    }

    const hasPen = student.inventory && student.inventory.some(it => it.id === 'pen' && it.quantity > 0);
    if (!hasPen) {
      const err = {
        success: false,
        needPen: true,
        hasPen: false,
        message: 'Brak długopisu! Kup długopis u dilera w kiblu (10 PLN) lub przeszukaj szafkę!'
      };
      socket.emit('chemistry_task_started', { success: false, hasPen: false, task: { question: 'Brak długopisu!', options: [] } });
      if (callback) callback(err);
      return;
    }

    const task = CHEMISTRY_TASKS[Math.floor(Math.random() * CHEMISTRY_TASKS.length)];
    const data = {
      success: true,
      hasPen: true,
      task: {
        id: task.id,
        question: task.desc || task.title,
        desc: task.desc,
        title: task.title,
        options: task.options
      }
    };

    socket.emit('chemistry_task_started', data);
    if (callback) callback(data);
  });

  socket.on('submit_chemistry_task', ({ taskId, selectedOptionIndex, answerIndex }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.role !== 'STUDENT' || student.isEliminated) return;

    const task = CHEMISTRY_TASKS.find(t => t.id === taskId);
    if (!task) {
      const err = { success: false, message: 'Nie znaleziono zadania!' };
      socket.emit('chemistry_task_result', err);
      if (callback) callback(err);
      return;
    }

    const chosenIdx = selectedOptionIndex !== undefined ? selectedOptionIndex : answerIndex;

    if (chosenIdx === task.correctIndex) {
      student.hasHomework = true;
      student.points += 150;
      if (student.eduvulcan) {
        if (!student.eduvulcan.grades) student.eduvulcan.grades = [];
        student.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Zadanie domowe: ' + task.title, grade: 5 });
        student.eduvulcan.homeworkStatus = 'Odrobione ✅';
      }
      if (!student.inventory) student.inventory = [];
      const hasTask = student.inventory.find(it => it.id === 'solved_task');
      if (hasTask) hasTask.quantity = (hasTask.quantity || 1) + 1;
      else student.inventory.push({ ...CLASSIC_ITEMS.solved_task, quantity: 1 });

      const logMsg = `📓 ${student.name} odrobił zadanie domowe z chemii w zeszycie! (Ocena 5 w EduVulcan, bezpieczny przed Halbiną)`;
      currentRoom.roundLogs.unshift(logMsg);

      const res = {
        success: true,
        hasHomework: true,
        grade: 5,
        newBalance: student.bankBalance,
        message: `✅ Brawo! Zadanie domowe odrobione w zeszycie! Jesteś bezpieczny przed kontrolą Halbina i otrzymujesz ocenę 5 w EduVulcan!`
      };
      socket.emit('chemistry_task_result', res);
      if (callback) callback(res);
    } else {
      student.hasHomework = false;
      if (student.eduvulcan) {
        if (!student.eduvulcan.grades) student.eduvulcan.grades = [];
        student.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Niepoprawne zadanie domowe', grade: 2 });
        student.eduvulcan.homeworkStatus = 'Błędne / Nieodrobione ❌';
      }
      const res = {
        success: false,
        hasHomework: false,
        grade: 2,
        message: '❌ Błąd w reakcji chemicznej! Zadanie domowe nie zostało poprawnie odrobione. Popraw je, zanim Halbina sprawdzi zeszyty!'
      };
      socket.emit('chemistry_task_result', res);
      if (callback) callback(res);
    }
  });

  // Use inventory item
  socket.on('use_inventory_item', ({ itemId }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const student = currentRoom.players.get(socket.id);
    if (!student || student.isEliminated) return;

    if (itemId === 'vape') {
      const isClassic = currentRoom.mode === 'classic_real';
      const isToilet = student.currentZone === 'TOILET';
      let cloud = null;
      if (!isClassic) {
        cloud = {
          id: 'smoke_' + Date.now(),
          x: student.x,
          y: student.y,
          radius: isToilet ? 55 : 35,
          duration: 4.5,
          timer: 4.5
        };
        currentRoom.smokeClouds.push(cloud);
      }
      student.points += 30;
      const msg = isClassic
        ? (isToilet
            ? `💨 ${student.name} wziął dyskretnego bucha z e-papierosa w kabinie toalety!`
            : `💨 ${student.name} zaciągnął się e-papierosem!`)
        : (isToilet
            ? `💨 ${student.name} puścił wielką chmurę z vape'a w kabinie toalety!`
            : `💨 ${student.name} zaciągnął się vape'em na korytarzu!`);
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: student.id,
        playerName: student.name,
        cloud,
        isClassic,
        x: student.x,
        y: student.y,
        message: msg
      });
      if (callback) callback({ success: true, message: 'Zaciągnąłeś się e-papierosem!' });
    } else if (itemId === 'energy_drink') {
      student.speedBoostTimer = 5.0;
      student.points += 50;
      const itemIdx = student.inventory ? student.inventory.findIndex(it => it.id === 'energy_drink') : -1;
      if (itemIdx !== -1) {
        if (student.inventory[itemIdx].quantity > 1) student.inventory[itemIdx].quantity--;
        else student.inventory.splice(itemIdx, 1);
      }
      if (callback) callback({ success: true, message: 'Wypiłeś Monster Energy! +50% prędkości na 5s!' });
    } else {
      if (callback) callback({ success: true, message: 'Przedmiot w gotowości.' });
    }
  });

  // ==========================================
  // ADMIN SYSTEM (PASSWORD: niger22)
  // ==========================================
  socket.on('admin_login', ({ password }, callback) => {
    if (password === 'niger22') {
      socket.isAdmin = true;
      const res = { success: true, message: '🛡️ Autoryzacja pomyślna! Witaj w panelu administratora (niger22).' };
      if (callback) callback(res);
    } else {
      const res = { success: false, message: '❌ Nieprawidłowe hasło administratora! Odmowa dostępu.' };
      if (callback) callback(res);
    }
  });

  socket.on('admin_action', ({ command, args }, callback) => {
    if (!socket.isAdmin) {
      const err = { success: false, message: 'Brak uprawnień administratora! Wpisz najpierw poprawne hasło (niger22).' };
      if (callback) callback(err);
      return;
    }

    if (!currentRoom) {
      const err = { success: false, message: 'Brak aktywnego pokoju do modyfikacji.' };
      if (callback) callback(err);
      return;
    }

    const player = currentRoom.players.get(socket.id);
    args = args || {};
    let replyMsg = 'Polecenie administratora wykonane.';

    switch (command) {
      case 'god_mode': {
        if (player) {
          player.isGodMode = !!args.enabled;
          if (player.isGodMode) {
            player.immunityTimer = 999999;
            player.uwagi = 0;
            player.isEliminated = false;
            replyMsg = '🛡️ God Mode WŁĄCZONY (Nieśmiertelność i brak kar).';
          } else {
            player.immunityTimer = 0;
            replyMsg = '🛡️ God Mode WYŁĄCZONY.';
          }
        }
        break;
      }

      case 'noclip': {
        if (player) {
          player.isNoclip = !!args.enabled;
          replyMsg = player.isNoclip ? '👻 Noclip WŁĄCZONY (Przenikanie przez ściany i drzwi).' : '👻 Noclip WYŁĄCZONY.';
        }
        break;
      }

      case 'set_speed': {
        if (player) {
          const mult = Math.max(1, Math.min(10, Number(args.multiplier) || 1));
          player.adminSpeedMultiplier = mult;
          replyMsg = `🚀 Mnożnik prędkości ustawiony na: ${mult}x!`;
        }
        break;
      }

      case 'give_money': {
        if (player) {
          const amt = Number(args.amount) || 1000;
          player.bankBalance = Math.round(((player.bankBalance || 0) + amt) * 100) / 100;
          socket.emit('money_updated', { balance: player.bankBalance });
          replyMsg = `💵 Dodano ${amt} PLN! Nowe saldo: ${player.bankBalance} PLN.`;
        }
        break;
      }

      case 'give_points': {
        if (player) {
          const pts = Number(args.points) || 1000;
          player.points += pts;
          replyMsg = `🏆 Dodano ${pts} pkt respektu! Suma: ${player.points} pkt.`;
        }
        break;
      }

      case 'give_item': {
        if (player) {
          const itemId = args.itemId;
          const qty = Number(args.quantity) || 1;
          if (!player.inventory) player.inventory = [];
          const existing = player.inventory.find(i => i.id === itemId);
          const def = CLASSIC_ITEMS[itemId] || { id: itemId, name: itemId, icon: '📦' };
          if (existing) {
            existing.quantity = (existing.quantity || 1) + qty;
          } else {
            player.inventory.push({ ...def, quantity: qty });
          }
          socket.emit('inventory_updated', { inventory: player.inventory });
          replyMsg = `🎒 Dodano do ekwipunku: ${def.name || itemId} (x${qty})!`;
        }
        break;
      }

      case 'give_all_items': {
        if (player) {
          const allIds = [
            'ar15', 'mag_ar15', 'makarov', 'mag_makarov', 'machete', 'knife',
            'smoke_grenade', 'vape', 'firecracker', 'master_keycard', 'janitor_key',
            'bolt_cutter', 'director_stamp', 'exam_key', 'energy_drink', 'coffee',
            'solved_task', 'pen', 'sandwich', 'zapiekanka'
          ];
          if (!player.inventory) player.inventory = [];
          allIds.forEach(id => {
            const def = CLASSIC_ITEMS[id] || { id, name: id, icon: '📦' };
            const count = id.includes('mag') ? 4 : (id === 'smoke_grenade' ? 3 : 1);
            const ex = player.inventory.find(i => i.id === id);
            if (ex) ex.quantity = (ex.quantity || 1) + count;
            else player.inventory.push({ ...def, quantity: count });
          });
          socket.emit('inventory_updated', { inventory: player.inventory });
          replyMsg = '🎒 Przyznano pełny arsenał broni, amunicji i kluczy!';
        }
        break;
      }

      case 'teleport': {
        if (player) {
          const zone = args.zone || player.currentZone || 'CORRIDOR';
          const x = Number(args.x) || 500;
          const y = Number(args.y) || 350;
          player.currentZone = zone;
          player.x = x;
          player.y = y;
          if (player.role === 'TEACHER' && currentRoom.teacher) {
            currentRoom.teacher.currentZone = zone;
            currentRoom.teacher.x = x;
            currentRoom.teacher.y = y;
          }
          socket.emit('player_teleported', { x, y, zone });
          socket.emit('zone_changed', { zone });
          replyMsg = `📍 Przeniesiono do: ${zone} (${x}, ${y})!`;
        }
        break;
      }

      case 'clear_notes': {
        if (args.allStudents) {
          currentRoom.players.forEach(p => {
            p.uwagi = 0;
            p.isEliminated = false;
            if (p.eduvulcan) {
              p.eduvulcan.notes = [];
              p.eduvulcan.attendance = 'Obecny (Wzorowy) ⭐';
            }
          });
          io.to(currentRoom.code).emit('notification', { message: '🛡️ [ADMIN] Wszelkie uwagi w szkole zostały skasowane!' });
          replyMsg = '📋 Wyczyszczono uwagi wszystkim uczniom w szkole!';
        } else if (player) {
          player.uwagi = 0;
          player.isEliminated = false;
          if (player.eduvulcan) {
            player.eduvulcan.notes = [];
            player.eduvulcan.attendance = 'Wzorowy Uczeń ⭐';
          }
          replyMsg = '📋 Twoje uwagi w EduVulcan zostały usunięte!';
        }
        break;
      }

      case 'instant_homework': {
        if (player) {
          player.hasHomework = true;
          if (player.eduvulcan) {
            if (!player.eduvulcan.grades) player.eduvulcan.grades = [];
            player.eduvulcan.grades.unshift({ subject: 'Chemia', desc: 'Zadanie domowe (Admin)', grade: 6 });
            player.eduvulcan.homeworkStatus = 'Wzorowe (Ocena 6) 🌟';
          }
          if (!player.inventory) player.inventory = [];
          const hasTask = player.inventory.find(it => it.id === 'solved_task');
          if (hasTask) hasTask.quantity = (hasTask.quantity || 1) + 1;
          else player.inventory.push({ ...CLASSIC_ITEMS.solved_task, quantity: 1 });
          socket.emit('inventory_updated', { inventory: player.inventory });
          replyMsg = '📓 Zadanie domowe odrobione na szóstkę z gwiazdką!';
        }
        break;
      }

      case 'switch_role': {
        if (player) {
          player.role = (player.role === 'TEACHER') ? 'STUDENT' : 'TEACHER';
          if (player.role === 'TEACHER' && currentRoom.teacher) {
            currentRoom.teacher.isAI = false;
            currentRoom.teacher.controlledByPlayer = true;
            currentRoom.teacher.playerId = player.id;
            currentRoom.teacher.name = player.fullName || player.name || 'Halbina';
          }
          socket.emit('notification', { message: `🛡️ Zmiana roli: Jesteś teraz jako ${player.role === 'TEACHER' ? '👩‍🏫 Pani Halbina' : '🎒 Uczeń'}!` });
          replyMsg = `Przełączono rolę na: ${player.role}!`;
        }
        break;
      }

      case 'teacher_anger': {
        if (currentRoom.teacher) {
          const val = Math.max(0, Math.min(100, Number(args.anger) || 0));
          currentRoom.teacher.anger = val;
          if (val >= 100) {
            currentRoom.teacher.state = 'RAGE';
            currentRoom.teacher.rageTimer = 10.0;
            currentRoom.setTeacherSpeech("MOJA CIERPLIWOŚĆ SIĘ SKOŃCZYŁA! DO DYREKTORA WSZYSCY!", 5.0);
          } else {
            if (currentRoom.teacher.state === 'RAGE') currentRoom.teacher.state = 'CLASS';
          }
          replyMsg = `👩‍🏫 Wkurwienie Halbina ustawione na: ${val}%!`;
        }
        break;
      }

      case 'teacher_turn': {
        if (currentRoom.teacher) {
          const targetState = args.state || (currentRoom.teacher.state === 'BOARD' ? 'CLASS' : 'BOARD');
          currentRoom.teacher.state = targetState;
          io.to(currentRoom.code).emit('teacher_turned', { state: targetState });
          replyMsg = `👩‍🏫 Halbina odwrócona: ${targetState === 'BOARD' ? 'do tablicy' : 'na klasę'}!`;
        }
        break;
      }

      case 'teacher_stun': {
        if (currentRoom.teacher) {
          const dur = Number(args.duration) || 15.0;
          currentRoom.teacherStunTimer = dur;
          currentRoom.setTeacherSpeech("ZAWROTY GŁOWY... 💫 NIC NIE WIDZĘ PRZEZ KILKA CHWIL!", 5.0);
          replyMsg = `💫 Halbina ogłuszona na ${dur}s!`;
        }
        break;
      }

      case 'teacher_say': {
        if (currentRoom.teacher && args.text) {
          currentRoom.setTeacherSpeech(args.text, 8.0);
          replyMsg = `🗣️ Halbina mówi: "${args.text}"!`;
        }
        break;
      }

      case 'fire_alarm': {
        const active = !!args.active;
        currentRoom.fireAlarmActive = active;
        if (active) {
          currentRoom.fireAlarmTimer = 60.0;
          currentRoom.roundLogs.unshift('🚨🔥 [ADMIN] ALARM POŻAROWY URUCHOMIONY PRZEZ ADMINISTRATORA!');
          io.to(currentRoom.code).emit('smoke_grenade_detonated', {
            x: 500,
            y: 350,
            message: '🚨🔥 [ADMIN] ALARM POŻAROWY! Zbiórka ewakuacyjna przed szkołą!',
            fireAlarmActive: true,
            duration: 60.0
          });
          io.to(currentRoom.code).emit('fire_alarm_evacuation', {
            active: true,
            message: '🚨 ALARM POŻAROWY! Wszyscy na boisko / dziedziniec do sektora ewakuacyjnego!',
            duration: 60.0
          });
          replyMsg = '🚨 Alarm pożarowy i ewakuacja uruchomione!';
        } else {
          currentRoom.fireAlarmTimer = 0;
          io.to(currentRoom.code).emit('notification', { message: '✅ [ADMIN] Alarm pożarowy odwołany przez dyrekcję!' });
          replyMsg = '✅ Alarm pożarowy odwołany!';
        }
        break;
      }

      case 'blackout': {
        const active = !!args.active;
        currentRoom.isBlackout = active;
        if (active) {
          io.to(currentRoom.code).emit('school_blackout', { message: '⚡ [ADMIN] Zasilanie szkoły wyłączone (Blackout)!' });
          replyMsg = '⚡ Wyłączono światła w szkole!';
        } else {
          io.to(currentRoom.code).emit('school_power_restored', { message: '💡 [ADMIN] Zasilanie szkoły przywrócone!' });
          replyMsg = '💡 Przywrócono prąd w szkole!';
        }
        break;
      }

      case 'pa_broadcast': {
        const text = args.text || 'Wszyscy uczniowie proszeni są o spokój!';
        io.to(currentRoom.code).emit('pa_broadcast_triggered', {
          type: 'custom',
          message: `📢 [RADIOWĘZEŁ - DYREKCJA]: "${text}"`
        });
        replyMsg = `📢 Wyemitowano komunikat przez radiowęzeł!`;
        break;
      }

      case 'adjust_timer': {
        const delta = Number(args.deltaSeconds) || 60;
        currentRoom.timeRemaining = Math.max(1, currentRoom.timeRemaining + delta);
        replyMsg = `⏱️ Czas lekcji zmieniony o ${delta > 0 ? '+' : ''}${delta}s (pozostało: ${Math.round(currentRoom.timeRemaining)}s)!`;
        break;
      }

      case 'revive_all': {
        currentRoom.players.forEach(p => {
          p.isEliminated = false;
          p.uwagi = 0;
        });
        io.to(currentRoom.code).emit('notification', { message: '✨ [ADMIN] Wszyscy wyeliminowani uczniowie zostali ożywieni!' });
        replyMsg = '✨ Ożywiono wszystkich uczniów!';
        break;
      }

      case 'give_all_money': {
        const amt = Number(args.amount) || 1000;
        currentRoom.players.forEach(p => {
          p.bankBalance = Math.round(((p.bankBalance || 0) + amt) * 100) / 100;
        });
        io.to(currentRoom.code).emit('notification', { message: `💵 [ADMIN] Każdy uczeń otrzymał stypendium ${amt} PLN!` });
        replyMsg = `💵 Rozdano po ${amt} PLN wszystkim graczom!`;
        break;
      }

      default:
        replyMsg = `Nieznane polecenie administratora: ${command}`;
    }

    if (callback) callback({ success: true, message: replyMsg });
  });

  socket.on('return_to_lobby', () => {
    if (!currentRoom || currentRoom.hostId !== socket.id) return;
    currentRoom.state = 'LOBBY';
    currentRoom.policeRaidPending = false;
    currentRoom.policeRaidTimer = 0;
    currentRoom.teacherStunTimer = 0;
    currentRoom.players.forEach(p => {
      p.uwagi = 0;
      p.points = 0;
      p.isEliminated = false;
      p.isShouting = false;
      p.isSitting = (currentRoom.mode === 'normal');
      p.chairCooldown = 0;
    });

    io.to(currentRoom.code).emit('returned_to_lobby', {
      rzepaTaken: Array.from(currentRoom.players.values()).some(p => p.character === 'rzepa'),
      players: Array.from(currentRoom.players.values())
    });
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      const code = currentRoom.code;
      const newHost = currentRoom.removePlayer(socket.id);
      if (rooms.has(code)) {
        io.to(code).emit('room_updated', {
          code: code,
          hostId: currentRoom.hostId,
          state: currentRoom.state,
          mode: currentRoom.mode,
          rzepaTaken: Array.from(currentRoom.players.values()).some(p => p.character === 'rzepa'),
          players: Array.from(currentRoom.players.values())
        });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🧪 LEKCJA CHEMII Z HALBINĄ - SERWER URUCHOMIONY`);
  console.log(`🌐 Dostęp: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
