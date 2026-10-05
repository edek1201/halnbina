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

function getDeskAtPosition(x, y) {
  for (let d = 0; d < DESK_SLOTS.length; d++) {
    const slot = DESK_SLOTS[d];
    // Optimized rectangular seating hitbox
    if (Math.abs(x - slot.x) <= 46 && Math.abs(y - slot.chairY) <= 30) {
      return slot.id;
    }
  }
  return -1;
}

function isNearAnyDesk(x, y, maxDist = 58) {
  for (let d = 0; d < DESK_SLOTS.length; d++) {
    const slot = DESK_SLOTS[d];
    if (Math.hypot(x - slot.x, y - slot.chairY) <= maxDist) {
      return true;
    }
  }
  return false;
}

// Vision Cone Field: Halbina looks downwards from her desk (tx, ty)
function isStudentInVisionCone(studentX, studentY, teacherX, teacherY) {
  if (studentY <= teacherY + 15) return false; // Behind or parallel with teacher
  const dy = studentY - (teacherY + 15);
  // Cone spreads out at 0.62 ratio with 55px base desk width
  const maxDx = 55 + dy * 0.62;
  return Math.abs(studentX - teacherX) <= maxDx;
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
    this.mode = 'normal'; // 'normal' (default 5min) | 'classic' | 'hardcore' | 'boss'
    this.players = new Map();
    this.teacherId = null; // socket.id of teacher, or 'BOT'
    this.lessonDuration = 300; // seconds (default 5 min for normal mode)
    this.timeRemaining = 300;
    this.lastTickTime = Date.now();
    this.gameLoopInterval = null;

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
      lastAction: 'Pisze na tablicy wzór chemiczny...'
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
    this.projectiles = []; // paper airplanes, kleszcze, chairs, pepper spray, acid flasks, exams
    this.smokeClouds = []; // vape smoke clouds

    this.roundLogs = [];
  }

  setTeacherSpeech(text, duration = 4.0) {
    this.teacher.speechText = text;
    this.teacher.speechTimer = duration;
    io.to(this.code).emit('teacher_speech', { text: text, duration: duration });
  }

  startPopQuiz(targetStudent) {
    if (this.activeQuiz || !targetStudent || targetStudent.isEliminated || targetStudent.role !== 'STUDENT') return false;

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

    this.popQuizCooldown = 18.0;

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

  addPlayer(socketId, characterChoice) {
    const isHost = this.players.size === 0;
    const charNames = {
      romanowski: 'Romanowski',
      leszczynski: 'Leszczyński',
      wolff: 'Wolff',
      rzepa: 'Filip Rzepa'
    };

    let requestedChar = ['romanowski', 'leszczynski', 'wolff', 'rzepa'].includes(characterChoice) ? characterChoice : 'romanowski';

    // Filip Rzepa limit: Maximum 1 per lobby!
    if (requestedChar === 'rzepa') {
      const alreadyHasRzepa = Array.from(this.players.values()).some(p => p.character === 'rzepa');
      if (alreadyHasRzepa) {
        requestedChar = 'romanowski'; // Fallback to Romanowski if Rzepa is taken
      }
    }

    const player = {
      id: socketId,
      character: requestedChar,
      name: charNames[requestedChar],
      isHost: isHost,
      role: 'STUDENT', // 'STUDENT' | 'TEACHER'
      x: 0,
      y: 0,
      assignedDeskIndex: -1,
      currentDeskIndex: -1,
      deskX: 0,
      deskY: 0,
      isSitting: this.mode === 'normal', // In normal lesson mode, students start seated
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
      if (this.mode === 'normal') {
        this.lessonDuration = 300; // 5 minut
        this.timeRemaining = 300;
      } else if (this.mode === 'hardcore') {
        this.lessonDuration = 60;
        this.timeRemaining = 60;
      } else {
        this.lessonDuration = 90;
        this.timeRemaining = 90;
      }

      // Assign Katarzyna Halbina
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

    // Assign desks and chairs to students
    let deskCounter = 0;
    playerList.forEach(p => {
      p.points = 0;
      p.uwagi = 0;
      p.isEliminated = false;
      p.immunityTimer = 0;
      p.isShouting = false;
      p.shoutText = '';
      p.isDucking = false;
      p.isCheating = false;
      p.isSitting = (this.mode === 'normal' && p.role === 'STUDENT'); // Start seated in normal mode
      p.chairCooldown = 0;
      p.paperCooldown = 0;
      p.speedBoostTimer = 0;
      p.abilityCooldowns = { ability1: 0, ability2: 0 };
      p.shoutOptions = getRandomShouts(3);
      p.bossDamage = 0;
      p.hasSuperChalk = false;

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
    });

    this.smokeClouds = [];
    this.projectiles = [];

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
        // Police arrived! Class was not rescued by Filip Rzepa with machete
        this.triggerPoliceRaid();
        const raidMsg = '🚨 SZKIEŁY WPAROWAŁY DO SALI! Nikt nie rozgonił policji maczetą! Uczniowie dostają uwagi!';
        this.roundLogs.unshift(raidMsg);
        this.players.forEach(p => {
          if (p.role === 'STUDENT' && !p.isEliminated && !p.isDucking && !p.isInSmoke) {
            this.penalizeStudent(p, 'POLICE_RAID');
          }
        });
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
    } else if (this.teacher.isAI && !this.boss.isBossMode && this.teacher.anger >= 50 && this.popQuizCooldown <= 0) {
      // AI Halbina triggers pop quiz when anger >= 50%
      if (Math.random() < 0.25 * dt) {
        const activeStudents = Array.from(this.players.values()).filter(p => p.role === 'STUDENT' && !p.isEliminated);
        if (activeStudents.length > 0) {
          const target = activeStudents[Math.floor(Math.random() * activeStudents.length)];
          this.startPopQuiz(target);
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
            if (p.role === 'STUDENT' && !p.isEliminated && p.immunityTimer <= 0) {
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

        // Stepping in acid without milk/immunity
        if (p.immunityTimer <= 0 && p.speedBoostTimer <= 0) {
          for (const puddle of this.boss.acidPuddles) {
            if (Math.hypot(p.x - puddle.x, p.y - puddle.y) <= puddle.radius) {
              this.penalizeStudent(p, 'ACID');
              break;
            }
          }
        }

        // Stepping over chalk pickup
        for (let i = this.boss.chalkPickups.length - 1; i >= 0; i--) {
          const chalk = this.boss.chalkPickups[i];
          if (Math.hypot(p.x - chalk.x, p.y - chalk.y) <= 32) {
            this.boss.chalkPickups.splice(i, 1);
            p.hasSuperChalk = true;
            io.to(p.id).emit('chalk_picked_up', { message: '🖍️ Podniosłeś Super Kredę! Twój następny rzut [F] zada 85 DMG!' });
            break;
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
          this.teacher.stateTimer = 0.8;
          this.teacher.inspectionsThisTurn = 0;
          io.to(this.code).emit('teacher_warning', { x: this.teacher.x, y: this.teacher.y });
        } else if (this.teacher.state === 'TURNING') {
          this.teacher.state = 'CLASS';
          this.teacher.stateTimer = 2.2 + Math.random() * 2.2;
          this.teacher.inspectionsThisTurn = 0;
          io.to(this.code).emit('teacher_turned', { state: 'CLASS' });
        } else if (this.teacher.state === 'CLASS') {
          this.teacher.state = 'BOARD';
          this.teacher.stateTimer = 3.5 + Math.random() * 3.0;
          this.teacher.inspectionsThisTurn = 0;
          io.to(this.code).emit('teacher_turned', { state: 'BOARD' });
        }
      }

      // AI Halbina Random Desk Inspection (checks 1 student's assigned desk)
      if (this.teacher.state === 'CLASS' && this.teacher.inspectionsThisTurn < 1 && this.teacher.stateTimer <= 1.4) {
        if (Math.random() < 0.15) {
          const activeStudents = Array.from(this.players.values()).filter(s => s.role === 'STUDENT' && !s.isEliminated);
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

    const teacherIsLooking = !this.boss.isBossMode && this.teacherStunTimer <= 0 && (this.teacher.state === 'CLASS' || this.teacher.state === 'RAGE');

    this.players.forEach(p => {
      if (p.role === 'TEACHER') {
        if (!this.teacher.isAI) {
          this.teacher.x = p.x;
          this.teacher.y = p.y;
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
      if (p.abilityCooldowns.ability1 > 0) p.abilityCooldowns.ability1 -= dt;
      if (p.abilityCooldowns.ability2 > 0) p.abilityCooldowns.ability2 -= dt;

      // Check shouting expiry
      if (p.isShouting && now >= p.shoutEndTime) {
        p.isShouting = false;
        p.shoutText = '';
      }

      // Optimized desk hitbox seating check
      p.currentDeskIndex = getDeskAtPosition(p.x, p.y);
      const isAtAnyDesk = p.currentDeskIndex !== -1;

      // Check if inside vape smoke cloud (Wolff's e-vape)
      let isInSmoke = false;
      for (const cloud of this.smokeClouds) {
        if (Math.hypot(p.x - cloud.x, p.y - cloud.y) <= cloud.radius) {
          isInSmoke = true;
          break;
        }
      }
      p.isInSmoke = isInSmoke;

      // Ducking only works if near any desk
      if (p.isDucking && !isNearAnyDesk(p.x, p.y, 58)) {
        p.isDucking = false;
      }

      // Vision cone & smoke check for this student
      const inVisionCone = isStudentInVisionCone(p.x, p.y, this.teacher.x, this.teacher.y);
      const canTeacherSee = inVisionCone && !isInSmoke;

      // Cheating at desk gives bonus respect points!
      if (p.isCheating && isAtAnyDesk) {
        p.points += Math.round(35 * dt);
        if (teacherIsLooking && p.immunityTimer <= 0 && canTeacherSee) {
          this.penalizeStudent(p, 'CHEATING');
        }
      }

      // Ducking behind desk protects from wandering/idle detection!
      const isProtectedByDesk = p.isDucking && isAtAnyDesk;

      // DETECTION BY TEACHER (Normal & Classic modes)
      // Only students in Halbina's vision cone get caught!
      if (teacherIsLooking && p.immunityTimer <= 0) {
        if (canTeacherSee) {
          if (p.isShouting) {
            this.penalizeStudent(p, 'SHOUTING');
          } else if (this.mode === 'normal' && !p.isSitting && !isProtectedByDesk) {
            this.penalizeStudent(p, 'WALKING_IN_CLASS');
          } else if (!isAtAnyDesk && !isProtectedByDesk) {
            this.penalizeStudent(p, 'OUT_OF_DESK');
          }
        }
      }
    });

    // Check if all students were eliminated
    if (activeStudentsCount === 0 && eliminatedStudentsCount > 0) {
      this.endGame('ALL_EXPELLED');
      return;
    }

    // Broadcast state snapshot to room
    io.to(this.code).emit('game_tick', {
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
        canQuiz: this.teacher.anger >= 50 && this.popQuizCooldown <= 0 && !this.activeQuiz
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
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        character: p.character,
        name: p.name,
        role: p.role,
        x: p.x,
        y: p.y,
        isSitting: !!p.isSitting,
        chairCooldown: Math.ceil(p.chairCooldown || 0),
        isMoving: p.isMoving,
        isShouting: p.isShouting,
        shoutText: p.shoutText,
        isDucking: p.isDucking,
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

  triggerPoliceRaid() {
    this.policeActiveTimer = 7.5; // 7.5 seconds of flashing police sirens
    this.policeShoutCount = 0;
    this.teacher.state = 'RAGE';
    this.teacher.rageTimer = 4.5;
    this.teacher.rageText = 'WY GŁUPIE SKURWYSYNY!';
    this.teacher.anger = 100;

    const logMsg = '🚨 SZKIEŁY JADĄ! Syreny radiowozu pod oknami! Halbina wpadła w szał: "WY GŁUPIE SKURWYSYNY!"';
    this.roundLogs.unshift(logMsg);

    io.to(this.code).emit('police_raid_event', {
      duration: 7.5,
      rageText: 'WY GŁUPIE SKURWYSYNY!',
      logMsg: logMsg
    });
  }

  handleShout(playerId, shoutText) {
    const player = this.players.get(playerId);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    player.isShouting = true;
    player.shoutText = shoutText;
    player.shoutEndTime = Date.now() + 1800; // 1.8 seconds duration
    player.points += 150; // Award Respect points

    // Bonus points if shouting while teacher's back is turned!
    if (this.teacher.state === 'BOARD') {
      player.points += 100;
    }

    // Check police triggers ("Szkieły jadą", "szkieły", "policja", "co jedzie", "surron")
    const isPolice = /szkieł|szkiel|policj|co jedzie|surron/i.test(shoutText);
    if (isPolice) {
      this.policeShoutCount++;
      this.teacher.anger = Math.min(100, this.teacher.anger + 35);
      if (this.policeShoutCount >= 3 && this.policeActiveTimer <= 0) {
        this.triggerPoliceRaid();
      }
    } else {
      this.teacher.anger = Math.min(100, this.teacher.anger + 12);
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

    // Send new options back to that player
    io.to(player.id).emit('shout_options_updated', {
      options: player.shoutOptions
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

  socket.on('create_room', ({ character, mode }, callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const room = new Room(code, socket.id);
    if (mode) room.mode = mode;
    room.addPlayer(socket.id, character);
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
      rzepaTaken: Array.from(room.players.values()).some(p => p.character === 'rzepa'),
      players: Array.from(room.players.values())
    });
  });

  socket.on('join_room', ({ code, character }, callback) => {
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

    const player = room.addPlayer(socket.id, character);
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
      rzepaTaken: Array.from(room.players.values()).some(p => p.character === 'rzepa'),
      players: Array.from(room.players.values())
    });
  });

  // Switch character in lobby
  socket.on('select_character', ({ character }, callback) => {
    if (!currentRoom || currentRoom.state !== 'LOBBY') return;
    const player = currentRoom.players.get(socket.id);
    if (!player) return;

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

    if (callback) callback({ success: true, character: validChar });

    io.to(currentRoom.code).emit('room_updated', {
      code: currentRoom.code,
      hostId: currentRoom.hostId,
      state: currentRoom.state,
      mode: currentRoom.mode,
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

  socket.on('player_move', ({ x, y, isMoving }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.isEliminated) return;

    // In normal lesson mode, seated students cannot walk until standing up [Z]
    if (player.isSitting) return;

    // Bounds checking
    player.x = Math.max(50, Math.min(950, x));
    player.y = Math.max(120, Math.min(650, y));
    player.isMoving = isMoving;
  });

  // Toggle seat [Z] (Stand up from desk or sit down)
  socket.on('student_toggle_seat', (callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    if (player.isSitting) {
      // Stand up
      player.isSitting = false;
      if (callback) callback({ success: true, isSitting: false, message: 'Wstałeś z ławki! Możesz chodzić [WASD].' });
    } else {
      // Sit down (must be near any desk)
      if (isNearAnyDesk(player.x, player.y, 58)) {
        player.isSitting = true;
        const deskId = getDeskAtPosition(player.x, player.y);
        if (deskId !== -1) {
          const desk = DESK_SLOTS.find(d => d.id === deskId);
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
  socket.on('student_duck', ({ isDucking }, callback) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;

    if (isDucking) {
      if (isNearAnyDesk(player.x, player.y, 58)) {
        player.isDucking = true;
        if (callback) callback({ success: true, isDucking: true });
      } else {
        player.isDucking = false;
        if (callback) callback({ success: false, message: 'Musisz być przy ławce, aby się schować!' });
      }
    } else {
      player.isDucking = false;
      if (callback) callback({ success: true, isDucking: false });
    }
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
    if (player.chairCooldown > 0) return;

    player.chairCooldown = 15.0; // 15 seconds cooldown

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
    // Wolff: Zapal e-vape (dym ukrywający uczniów)
    else if (abilityName === 'vape' && player.character === 'wolff') {
      if (player.abilityCooldowns.ability2 > 0) return;
      player.abilityCooldowns.ability2 = 22.0;
      const cloud = {
        id: 'smoke_' + Date.now(),
        x: player.x,
        y: player.y,
        radius: 110,
        duration: 6.5,
        timer: 6.5
      };
      currentRoom.smokeClouds.push(cloud);
      const msg = `💨 ${player.name} odpalił e-vape! Gęsta chmura dymu ukrywa uczniów przed wzrokiem Halbina!`;
      currentRoom.roundLogs.unshift(msg);
      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'vape',
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
    // Filip Rzepa [V]: Maczeta (ratuje klasę przed policją po rzucie krzesłem)
    else if (abilityName === 'machete' && player.character === 'rzepa') {
      if (player.abilityCooldowns.ability2 > 0) return;
      player.abilityCooldowns.ability2 = 20.0;

      if (currentRoom.policeRaidPending) {
        // Rescues the classroom from impending police raid!
        currentRoom.policeRaidPending = false;
        currentRoom.policeRaidTimer = 0;
        player.points += 500;
        const rescueMsg = `🗡️ ${player.name} (Filip Rzepa) WPAROWAŁ Z MACZETĄ I ROZGONIŁ SZKIEŁY! Klasa uratowana przed policją! (+500 pkt)`;
        currentRoom.roundLogs.unshift(rescueMsg);
        io.to(currentRoom.code).emit('police_raid_rescued', {
          heroId: player.id,
          heroName: player.name,
          message: rescueMsg
        });
      } else {
        // Outside police raid: slash attacks teacher / boss
        if (currentRoom.boss && currentRoom.boss.isBossMode) {
          currentRoom.damageBoss(80, player, 'MACZETA RZEPY');
          const slashMsg = `🗡️ Filip Rzepa zaatakował Mega Halbinę maczetą! Potężne 80 DMG!`;
          currentRoom.roundLogs.unshift(slashMsg);
          io.to(currentRoom.code).emit('teacher_distracted', { message: slashMsg });
        } else {
          currentRoom.teacher.state = 'BOARD';
          currentRoom.teacher.stateTimer = 3.2;
          const slashMsg = `🗡️ Filip Rzepa groźnie macha maczetą! Halbina kuli się przy tablicy ze strachu!`;
          currentRoom.roundLogs.unshift(slashMsg);
          io.to(currentRoom.code).emit('teacher_distracted', { message: slashMsg });
        }
      }

      io.to(currentRoom.code).emit('ability_used', {
        playerId: player.id,
        playerName: player.name,
        ability: 'machete',
        message: `🗡️ Filip Rzepa użył maczety!`
      });
    }
  });

  // Human Halbina controls (Turns for 2s, 5s cooldown)
  socket.on('teacher_toggle_look', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;
    if (currentRoom.teacherStunTimer > 0) {
      return socket.emit('inspection_failed', { message: 'Jesteś ogłuszona gazem pieprzowym! Nic nie widzisz!' });
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

  // Human Halbina triggers pop quiz (When anger >= 50%)
  socket.on('teacher_trigger_quiz', ({ targetStudentId }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;
    if (currentRoom.teacher.anger < 50) {
      return socket.emit('inspection_failed', { message: 'Potrzebujesz min. 50% wkurwienia, aby wziąć ucznia do odpowiedzi!' });
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
