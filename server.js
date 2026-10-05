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

// 12 predefined student desks in classroom layout (Canvas: 1000 x 700)
const DESK_SLOTS = [
  // Row 1
  { id: 0, x: 200, y: 260, label: "Ławka 1" },
  { id: 1, x: 420, y: 260, label: "Ławka 2" },
  { id: 2, x: 640, y: 260, label: "Ławka 3" },
  { id: 3, x: 840, y: 260, label: "Ławka 4" },
  // Row 2
  { id: 4, x: 200, y: 410, label: "Ławka 5" },
  { id: 5, x: 420, y: 410, label: "Ławka 6" },
  { id: 6, x: 640, y: 410, label: "Ławka 7" },
  { id: 7, x: 840, y: 410, label: "Ławka 8" },
  // Row 3
  { id: 8, x: 200, y: 560, label: "Ławka 9" },
  { id: 9, x: 420, y: 560, label: "Ławka 10" },
  { id: 10, x: 640, y: 560, label: "Ławka 11" },
  { id: 11, x: 840, y: 560, label: "Ławka 12" },
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
    this.mode = 'classic'; // 'classic' | 'hardcore'
    this.players = new Map();
    this.teacherId = null; // socket.id of teacher, or 'BOT'
    this.lessonDuration = 90; // seconds
    this.timeRemaining = 90;
    this.lastTickTime = Date.now();
    this.gameLoopInterval = null;

    // Teacher state
    this.teacher = {
      x: 500,
      y: 110,
      targetX: 500,
      speed: 120,
      state: 'BOARD', // 'BOARD' (writing) | 'TURNING' (warning) | 'CLASS' (watching students) | 'RAGE' (furious screaming)
      stateTimer: 4.0, // seconds until next state change in AI mode
      isAI: true,
      anger: 0, // 0 to 100
      rageText: '',
      rageTimer: 0,
      shoutCooldown: 0,
      lastAction: 'Pisze na tablicy wzór chemiczny...'
    };

    // Police Raid & Chaos Mechanics
    this.policeShoutCount = 0;
    this.policeActiveTimer = 0;
    this.projectiles = []; // paper airplanes

    this.roundLogs = [];
  }

  addPlayer(socketId, name) {
    const isHost = this.players.size === 0;
    const player = {
      id: socketId,
      name: name || `Uczeń ${this.players.size + 1}`,
      isHost: isHost,
      role: 'STUDENT', // 'STUDENT' | 'TEACHER'
      x: 0,
      y: 0,
      deskIndex: -1,
      deskX: 0,
      deskY: 0,
      isMoving: false,
      isShouting: false,
      shoutText: '',
      shoutEndTime: 0,
      isDucking: false, // Romanowski hiding under desk
      isCheating: false, // Romanowski copying chemistry cheat-sheet
      paperCooldown: 0, // paper airplane cooldown
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
    this.timeRemaining = this.lessonDuration;
    this.roundLogs = [];

    const playerList = Array.from(this.players.values());
    
    // Assign Katarzyna Halbina
    if (playerList.length === 1 || teacherSelection === 'bot') {
      // 1 player or forced bot: Halbina is AI
      this.teacherId = 'BOT';
      this.teacher.isAI = true;
      playerList[0].role = 'STUDENT';
    } else {
      // Pick 1 random player as Katarzyna Halbina
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

    // Assign desks to students
    let deskCounter = 0;
    playerList.forEach(p => {
      p.points = 0;
      p.uwagi = 0;
      p.isEliminated = false;
      p.immunityTimer = 0;
      p.isShouting = false;
      p.shoutText = '';
      p.shoutOptions = getRandomShouts(3);

      if (p.role === 'STUDENT') {
        const desk = DESK_SLOTS[deskCounter % DESK_SLOTS.length];
        p.deskIndex = desk.id;
        p.deskX = desk.x;
        p.deskY = desk.y;
        p.x = desk.x;
        p.y = desk.y;
        deskCounter++;
      } else {
        // Human Halbina position
        p.x = 500;
        p.y = 110;
      }
    });

    this.teacher.x = 500;
    this.teacher.y = 110;
    this.teacher.state = 'BOARD';
    this.teacher.stateTimer = 4.0;
    this.teacher.anger = 0;

    // Start game loop
    this.lastTickTime = Date.now();
    if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
    this.gameLoopInterval = setInterval(() => this.tick(), 1000 / 25); // 25 updates/sec
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

    // Police Raid Timer countdown
    if (this.policeActiveTimer > 0) {
      this.policeActiveTimer -= dt;
      if (this.policeActiveTimer <= 0) {
        io.to(this.code).emit('police_raid_ended');
      }
    }

    // Teacher RAGE timer
    if (this.teacher.state === 'RAGE') {
      this.teacher.rageTimer -= dt;
      if (this.teacher.rageTimer <= 0) {
        this.teacher.state = 'CLASS';
        this.teacher.stateTimer = 3.5;
        this.teacher.rageText = '';
        io.to(this.code).emit('teacher_turned', { state: 'CLASS' });
      }
    }

    // Projectiles (Paper airplanes) update
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.t += dt / proj.duration;
      if (proj.t >= 1.0) {
        io.to(this.code).emit('paper_landed', {
          id: proj.id,
          x: proj.targetX,
          y: proj.targetY,
          ownerId: proj.ownerId
        });
        // If hit near blackboard/teacher area, distract Halbina!
        if (proj.targetY <= 170 && (this.teacher.state === 'CLASS' || this.teacher.state === 'TURNING')) {
          this.teacher.state = 'BOARD';
          this.teacher.stateTimer = 2.8;
          const distractMsg = `✈️ Samolot z papieru trafił w tablicę! Halbina odwraca się sprawdzić, kto rzucił!`;
          this.roundLogs.unshift(distractMsg);
          io.to(this.code).emit('teacher_distracted', { message: distractMsg });
          const thrower = this.players.get(proj.ownerId);
          if (thrower) thrower.points += 150;
        }
        this.projectiles.splice(i, 1);
      }
    }

    // AI Teacher Logic
    if (this.teacher.isAI && this.teacher.state !== 'RAGE') {
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
          // Warning turn! Exclamation cue
          this.teacher.state = 'TURNING';
          this.teacher.stateTimer = 0.8; // 0.8s warning period
          io.to(this.code).emit('teacher_warning', { x: this.teacher.x, y: this.teacher.y });
        } else if (this.teacher.state === 'TURNING') {
          // Whip around to check classroom!
          this.teacher.state = 'CLASS';
          // Stay watching for 2.0 to 4.2 seconds
          this.teacher.stateTimer = 2.0 + Math.random() * 2.2;
          io.to(this.code).emit('teacher_turned', { state: 'CLASS' });
        } else if (this.teacher.state === 'CLASS') {
          // Turn back to blackboard
          this.teacher.state = 'BOARD';
          // Write on blackboard for 3.5 to 6.5 seconds
          this.teacher.stateTimer = 3.5 + Math.random() * 3.0;
          io.to(this.code).emit('teacher_turned', { state: 'BOARD' });
        }
      }
    }

    // Check student states & penalties
    let activeStudentsCount = 0;
    let eliminatedStudentsCount = 0;

    const teacherIsLooking = this.teacher.state === 'CLASS' || this.teacher.state === 'RAGE';

    this.players.forEach(p => {
      if (p.role === 'TEACHER') {
        // Sync position of human teacher
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
      if (p.immunityTimer > 0) {
        p.immunityTimer -= dt;
      }

      if (p.paperCooldown > 0) {
        p.paperCooldown -= dt;
      }

      // Check shouting expiry
      if (p.isShouting && now >= p.shoutEndTime) {
        p.isShouting = false;
        p.shoutText = '';
      }

      // Check desk proximity
      const distFromDesk = Math.hypot(p.x - p.deskX, p.y - p.deskY);
      const isAtDesk = distFromDesk <= 48;

      // Cheating at desk gives bonus respect points!
      if (p.isCheating && isAtDesk) {
        p.points += Math.round(35 * dt);
        if (teacherIsLooking && p.immunityTimer <= 0) {
          this.penalizeStudent(p, 'CHEATING');
        }
      }

      // Ducking behind desk protects from wandering/idle detection!
      const isProtectedByDesk = p.isDucking && isAtDesk;

      // DETECTION BY TEACHER
      if (teacherIsLooking && p.immunityTimer <= 0) {
        // Teacher field of view covers y >= 160 (looking down at the class)
        const canTeacherSee = p.y >= 160;

        if (canTeacherSee) {
          // CASE 1: Student is shouting while teacher is looking! (Ducking does NOT hide loud shout)
          if (p.isShouting) {
            this.penalizeStudent(p, 'SHOUTING');
          }
          // CASE 2: Student is out of desk (wandering the classroom) while teacher is looking!
          else if (!isAtDesk && !isProtectedByDesk) {
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
      teacher: {
        x: this.teacher.x,
        y: this.teacher.y,
        state: this.teacher.state,
        anger: Math.round(this.teacher.anger),
        rageText: this.teacher.rageText,
        isAI: this.teacher.isAI,
        teacherId: this.teacherId
      },
      projectiles: this.projectiles.map(pr => ({
        id: pr.id,
        startX: pr.startX,
        startY: pr.startY,
        targetX: pr.targetX,
        targetY: pr.targetY,
        t: pr.t
      })),
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        x: p.x,
        y: p.y,
        isMoving: p.isMoving,
        isShouting: p.isShouting,
        shoutText: p.shoutText,
        isDucking: p.isDucking,
        isCheating: p.isCheating,
        uwagi: p.uwagi,
        points: p.points,
        isEliminated: p.isEliminated,
        deskIndex: p.deskIndex,
        isAtDesk: Math.hypot(p.x - p.deskX, p.y - p.deskY) <= 48,
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

    const leaderboard = Array.from(this.players.values())
      .filter(p => p.role === 'STUDENT')
      .map(p => ({
        name: p.name,
        points: p.points,
        uwagi: p.uwagi,
        isEliminated: p.isEliminated,
        status: p.isEliminated ? 'Wyrzucony do Dyrektora' : 'Przetrwał lekcję!'
      }))
      .sort((a, b) => b.points - a.points);

    io.to(this.code).emit('game_ended', {
      reason: reason, // 'BELL' or 'ALL_EXPELLED'
      leaderboard: leaderboard,
      teacherId: this.teacherId,
      teacherIsAI: this.teacher.isAI
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

  socket.on('create_room', ({ playerName, mode }, callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const room = new Room(code, socket.id, playerName);
    if (mode) room.mode = mode;
    room.addPlayer(socket.id, playerName);
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
      players: Array.from(room.players.values())
    });
  });

  socket.on('join_room', ({ code, playerName }, callback) => {
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

    const player = room.addPlayer(socket.id, playerName);
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
      players: Array.from(room.players.values())
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

    // Bounds checking
    player.x = Math.max(50, Math.min(950, x));
    player.y = Math.max(120, Math.min(650, y));
    player.isMoving = isMoving;
  });

  socket.on('shout_trigger', ({ shoutText }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    currentRoom.handleShout(socket.id, shoutText);
  });

  // Romanowski Ducking under desk
  socket.on('student_duck', ({ isDucking }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;
    player.isDucking = !!isDucking;
  });

  // Romanowski Cheating (Copying notes under desk)
  socket.on('student_cheat', ({ isCheating }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;
    player.isCheating = !!isCheating;
  });

  // Romanowski Paper Airplane Throw
  socket.on('student_throw_paper', ({ targetX, targetY }) => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    const player = currentRoom.players.get(socket.id);
    if (!player || player.role !== 'STUDENT' || player.isEliminated) return;
    if (player.paperCooldown > 0) return;

    player.paperCooldown = 3.5; // 3.5s cooldown

    const proj = {
      id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      ownerId: player.id,
      ownerName: player.name,
      startX: player.x,
      startY: player.y - 15,
      targetX: targetX || (200 + Math.random() * 600),
      targetY: targetY || (60 + Math.random() * 50),
      t: 0,
      duration: 1.1
    };

    currentRoom.projectiles.push(proj);
    io.to(currentRoom.code).emit('paper_thrown', proj);
  });

  // Human Halbina controls
  socket.on('teacher_toggle_look', () => {
    if (!currentRoom || currentRoom.state !== 'IN_GAME') return;
    if (currentRoom.teacherId !== socket.id) return;

    if (currentRoom.teacher.state === 'BOARD') {
      currentRoom.teacher.state = 'CLASS';
      io.to(currentRoom.code).emit('teacher_turned', { state: 'CLASS' });
    } else {
      currentRoom.teacher.state = 'BOARD';
      io.to(currentRoom.code).emit('teacher_turned', { state: 'BOARD' });
    }
  });

  socket.on('return_to_lobby', () => {
    if (!currentRoom || currentRoom.hostId !== socket.id) return;
    currentRoom.state = 'LOBBY';
    currentRoom.players.forEach(p => {
      p.uwagi = 0;
      p.points = 0;
      p.isEliminated = false;
      p.isShouting = false;
    });

    io.to(currentRoom.code).emit('returned_to_lobby', {
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
