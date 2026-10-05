// Main Client Controller for Lekcja Chemii z Halbiną

(function () {
  const socket = io();
  const soundManager = window.soundManager;

  // DOM Elements
  const screenMenu = document.getElementById('screenMenu');
  const screenLobby = document.getElementById('screenLobby');
  const screenGame = document.getElementById('screenGame');

  const playerNameInput = document.getElementById('playerNameInput');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const gameModeSelect = document.getElementById('gameModeSelect');
  const btnCreateRoom = document.getElementById('btnCreateRoom');
  const btnJoinRoom = document.getElementById('btnJoinRoom');

  // Lobby DOM
  const displayRoomCode = document.getElementById('displayRoomCode');
  const btnCopyCode = document.getElementById('btnCopyCode');
  const playerCount = document.getElementById('playerCount');
  const lobbyPlayersList = document.getElementById('lobbyPlayersList');
  const hostRoleControls = document.getElementById('hostRoleControls');
  const nonHostNotice = document.getElementById('nonHostNotice');
  const btnStartGame = document.getElementById('btnStartGame');
  const btnLeaveLobby = document.getElementById('btnLeaveLobby');

  // Game DOM
  const canvas = document.getElementById('gameCanvas');
  const hudTimer = document.getElementById('hudTimer');
  const halbinaStatusBadge = document.getElementById('halbinaStatusBadge');
  const halbinaStatusText = document.getElementById('halbinaStatusText');
  const hudRole = document.getElementById('hudRole');
  const strike1 = document.getElementById('strike1');
  const strike2 = document.getElementById('strike2');
  const strike3 = document.getElementById('strike3');
  const hudPoints = document.getElementById('hudPoints');
  const tickerText = document.getElementById('tickerText');

  // Anger & Police DOM
  const angerMeterFill = document.getElementById('angerMeterFill');
  const hudAngerText = document.getElementById('hudAngerText');
  const policeBanner = document.getElementById('policeBanner');

  // Romanowski actions DOM
  const btnDuck = document.getElementById('btnDuck');
  const btnCheat = document.getElementById('btnCheat');
  const btnThrowPaper = document.getElementById('btnThrowPaper');

  const deskNotice = document.getElementById('deskNotice');
  const shoutCards = [
    { btn: document.getElementById('shoutBtn1'), text: document.getElementById('shoutText1') },
    { btn: document.getElementById('shoutBtn2'), text: document.getElementById('shoutText2') },
    { btn: document.getElementById('shoutBtn3'), text: document.getElementById('shoutText3') },
  ];
  const studentControls = document.getElementById('studentControls');
  const teacherControls = document.getElementById('teacherControls');
  const btnTeacherTurn = document.getElementById('btnTeacherTurn');

  const alarmOverlay = document.getElementById('alarmOverlay');
  const alarmTitle = document.getElementById('alarmTitle');
  const alarmDesc = document.getElementById('alarmDesc');
  const lessonIntroOverlay = document.getElementById('lessonIntroOverlay');
  const introCountdown = document.getElementById('introCountdown');

  // Game Over Modal DOM
  const modalGameOver = document.getElementById('modalGameOver');
  const gameOverTitle = document.getElementById('gameOverTitle');
  const gameOverSubtitle = document.getElementById('gameOverSubtitle');
  const leaderboardBody = document.getElementById('leaderboardBody');
  const btnRestartLobby = document.getElementById('btnRestartLobby');
  const btnQuitToMenu = document.getElementById('btnQuitToMenu');

  // Audio Buttons DOM
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundStatusText = document.getElementById('soundStatusText');
  const testAudioBtn = document.getElementById('testAudioBtn');

  // Local State
  let myPlayerId = null;
  let currentRoomCode = null;
  let isHost = false;
  let myRole = 'STUDENT';
  let shoutCooldown = false;
  let isDucking = false;
  let isCheating = false;
  let paperCooldown = false;

  // Local movement
  let posX = 500;
  let posY = 400;
  let speed = 210; // px/sec
  const keysDown = {};

  // Renderer instance
  const renderer = new GameRenderer(canvas);
  let currentGameState = {
    teacher: null,
    players: []
  };
  let lastFrameTime = performance.now();

  function showScreen(screen) {
    [screenMenu, screenLobby, screenGame].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // Audio bar listeners
  soundToggleBtn.addEventListener('click', () => {
    const isMuted = soundManager.toggleMute();
    soundStatusText.textContent = isMuted ? 'Dźwięk: WYŁ' : 'Dźwięk: WŁ';
    soundToggleBtn.style.background = isMuted ? '#7f8c8d' : '#27ae60';
  });

  testAudioBtn.addEventListener('click', () => {
    soundManager.playBell();
  });

  // Copy Room Code
  btnCopyCode.addEventListener('click', () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode).then(() => {
        btnCopyCode.textContent = '✅ Skopiowano!';
        setTimeout(() => { btnCopyCode.textContent = '📋 Kopiuj'; }, 2000);
      });
    }
  });

  // Create Room
  btnCreateRoom.addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Romanowski';
    const mode = gameModeSelect.value;
    socket.emit('create_room', { playerName: name, mode: mode }, (res) => {
      if (res.success) {
        myPlayerId = res.playerId;
        currentRoomCode = res.code;
        isHost = true;
        displayRoomCode.textContent = res.code;
        showScreen(screenLobby);
      }
    });
  });

  // Join Room
  btnJoinRoom.addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Romanowski';
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code || code.length < 3) {
      alert('Wpisz poprawny kod pokoju!');
      return;
    }

    socket.emit('join_room', { code: code, playerName: name }, (res) => {
      if (res.success) {
        myPlayerId = res.playerId;
        currentRoomCode = res.code;
        isHost = false;
        displayRoomCode.textContent = res.code;
        showScreen(screenLobby);
      } else {
        alert(res.message || 'Błąd podczas dołączania do lekcji!');
      }
    });
  });

  // Start Game Button
  btnStartGame.addEventListener('click', () => {
    if (!isHost) return;
    const teacherChoice = document.querySelector('input[name="teacherChoice"]:checked')?.value || 'random';
    socket.emit('start_game_request', { teacherSelection: teacherChoice });
  });

  // Leave Lobby
  btnLeaveLobby.addEventListener('click', () => {
    location.reload();
  });

  // Return to Lobby after game
  btnRestartLobby.addEventListener('click', () => {
    modalGameOver.classList.remove('active');
    if (isHost) {
      socket.emit('return_to_lobby');
    }
  });

  btnQuitToMenu.addEventListener('click', () => {
    location.reload();
  });

  // Shout Buttons
  shoutCards.forEach(card => {
    card.btn.addEventListener('click', () => {
      triggerShout(card.text.textContent);
    });
  });

  function triggerShout(text) {
    if (shoutCooldown || myRole !== 'STUDENT') return;
    shoutCooldown = true;

    // Trigger local shout audio
    soundManager.playScream();

    // Disable cards briefly
    shoutCards.forEach(c => c.btn.classList.add('cooldown'));

    socket.emit('shout_trigger', { shoutText: text });

    setTimeout(() => {
      shoutCooldown = false;
      shoutCards.forEach(c => c.btn.classList.remove('cooldown'));
    }, 2200);
  }

  // Teacher turn button
  btnTeacherTurn.addEventListener('click', () => {
    if (myRole === 'TEACHER') {
      socket.emit('teacher_toggle_look');
    }
  });

  // Keyboard Handlers
  window.addEventListener('keydown', (e) => {
    // Prevent scrolling with arrows/space
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      if (document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
      }
    }

    keysDown[e.code] = true;

    // Shouting keys: 1, 2, 3
    if (screenGame.classList.contains('active') && myRole === 'STUDENT') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        triggerShout(shoutCards[0].text.textContent);
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        triggerShout(shoutCards[1].text.textContent);
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        triggerShout(shoutCards[2].text.textContent);
      } else if (e.code === 'KeyR') {
        // Return directly towards desk
        returnToDesk();
      }
    }

    // Teacher space key
    if (screenGame.classList.contains('active') && myRole === 'TEACHER' && e.code === 'Space') {
      socket.emit('teacher_toggle_look');
    }
  });

  window.addEventListener('keyup', (e) => {
    keysDown[e.code] = false;
  });

  function returnToDesk() {
    const me = currentGameState.players.find(p => p.id === myPlayerId);
    if (!me) return;
    const desk = renderer.deskSlots[me.deskIndex];
    if (desk) {
      posX = desk.x;
      posY = desk.y;
      socket.emit('player_move', { x: posX, y: posY, isMoving: false });
    }
  }

  // SOCKET EVENTS

  // Room Updated (Lobby)
  socket.on('room_updated', (data) => {
    playerCount.textContent = data.players.length;
    isHost = data.hostId === myPlayerId;

    if (isHost) {
      btnStartGame.style.display = 'block';
      hostRoleControls.style.display = 'block';
      nonHostNotice.style.display = 'none';
    } else {
      btnStartGame.style.display = 'none';
      hostRoleControls.style.display = 'none';
      nonHostNotice.style.display = 'block';
    }

    // Render lobby cards
    lobbyPlayersList.innerHTML = '';
    data.players.forEach(p => {
      const card = document.createElement('div');
      card.className = `player-lobby-card ${p.id === data.hostId ? 'is-host' : ''}`;
      card.innerHTML = `
        <div class="player-lobby-avatar">🎓</div>
        <div class="player-lobby-name">${p.name}</div>
        <div class="player-lobby-badge">${p.id === data.hostId ? '👑 Gospodarz' : 'Uczeń'}</div>
      `;
      lobbyPlayersList.appendChild(card);
    });
  });

  // Game Starting (Countdown + Bell)
  socket.on('game_starting', (data) => {
    showScreen(screenGame);
    modalGameOver.classList.remove('active');

    // Ring school bell!
    soundManager.playBell();

    const me = data.players.find(p => p.id === myPlayerId);
    if (me) {
      myRole = me.role;
      posX = me.x;
      posY = me.y;
      hudRole.textContent = myRole === 'TEACHER' ? '👩‍🏫 Katarzyna Halbina' : '🎓 Uczeń Romanowski';

      if (myRole === 'TEACHER') {
        studentControls.style.display = 'none';
        teacherControls.style.display = 'block';
      } else {
        studentControls.style.display = 'flex';
        teacherControls.style.display = 'none';
      }
    }

    // Intro countdown overlay
    lessonIntroOverlay.classList.add('active');
    let count = 3;
    introCountdown.textContent = count;
    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        introCountdown.textContent = count;
      } else {
        introCountdown.textContent = 'ROZPOCZĘCIE!';
        clearInterval(countInterval);
      }
    }, 1000);
  });

  socket.on('lesson_started', () => {
    lessonIntroOverlay.classList.remove('active');
    tickerText.textContent = '🔔 Dzwonek zadzwonił! Lekcja trwa – zachowaj ostrożność!';
  });

  // Shout options refreshed with new cards
  socket.on('shout_options_updated', ({ options }) => {
    if (options && options.length >= 3) {
      options.forEach((opt, idx) => {
        shoutCards[idx].text.textContent = opt;
      });
    }
  });

  // Teacher Warning ("!" alert)
  socket.on('teacher_warning', () => {
    soundManager.playWarning();
    halbinaStatusBadge.className = 'hud-item halbina-status status-turning';
    halbinaStatusText.textContent = '👀 UWAGA! HALBINA ZARAZ SIĘ ODWRÓCI!';
  });

  // Teacher Turned
  socket.on('teacher_turned', ({ state }) => {
    if (state === 'CLASS') {
      halbinaStatusBadge.className = 'hud-item halbina-status status-class';
      halbinaStatusText.textContent = '🚨 HALBINA PATRZY NA KLASĘ!';
    } else {
      halbinaStatusBadge.className = 'hud-item halbina-status status-board';
      halbinaStatusText.textContent = '✏️ Halbina pisze na tablicy... (Można krzyczeć!)';
    }
  });

  // Player shouted broadcast
  socket.on('player_shouted', (data) => {
    // If not local player, still play shout sound!
    if (data.playerId !== myPlayerId) {
      soundManager.playScream();
    }
    tickerText.textContent = `📢 ${data.playerName} krzyczy: "${data.text}"!`;
  });

  // Student caught
  socket.on('student_caught', (data) => {
    tickerText.textContent = data.logMsg;

    if (data.playerId === myPlayerId) {
      // Caught red handed!
      soundManager.playBusted();
      alarmOverlay.classList.add('active');
      alarmTitle.textContent = data.reason === 'SHOUTING' ? '🚨 PRZYŁAPANY NA KRZYKU! 🚨' : '⚠️ PRZYŁAPANY POZA ŁAWKĄ! ⚠️';
      alarmDesc.textContent = `Otrzymujesz ${data.uwagi}. uwagę! Wracaj do porządku!`;

      setTimeout(() => {
        alarmOverlay.classList.remove('active');
      }, 1600);
    }
  });

  // Student Expelled
  socket.on('student_expelled', (data) => {
    tickerText.textContent = data.message;
    if (data.playerId === myPlayerId) {
      soundManager.playBusted();
      alarmOverlay.classList.add('active');
      alarmTitle.textContent = '❌ WYRZUCENIE DO DYREKTORA! ❌';
      alarmDesc.textContent = '3 uwagi w dzienniku! Masz natychmiast opuścić salę lekcyjną!';
      setTimeout(() => {
        alarmOverlay.classList.remove('active');
      }, 2500);
    }
  });

  // Game Ended
  socket.on('game_ended', (data) => {
    soundManager.playBell(); // Bell rings!

    if (data.reason === 'BELL') {
      gameOverTitle.textContent = '🔔 DZWONEK NA PRZERWĘ!';
      gameOverSubtitle.textContent = 'Lekcja chemii dobiegła końca! Kto przetrwał rzeź?';
    } else {
      gameOverTitle.textContent = '🚨 WSZYSCY U DYREKTORA!';
      gameOverSubtitle.textContent = 'Katarzyna Halbina wyłapała wszystkich rozrabiaków!';
    }

    // Fill leaderboard
    leaderboardBody.innerHTML = '';
    data.leaderboard.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      tr.innerHTML = `
        <td><strong>${medal}</strong></td>
        <td><strong>${entry.name}</strong></td>
        <td style="color: #f1c40f; font-weight: bold;">${entry.points} pkt</td>
        <td>${entry.uwagi} / 3</td>
        <td style="color: ${entry.isEliminated ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">${entry.status}</td>
      `;
      leaderboardBody.appendChild(tr);
    });

    modalGameOver.classList.add('active');
  });

  // Return to lobby
  socket.on('returned_to_lobby', () => {
    showScreen(screenLobby);
  });

  // State snapshot tick
  socket.on('game_tick', (state) => {
    currentGameState = state;

    // Update timer
    const mins = Math.floor(state.timeRemaining / 60);
    const secs = state.timeRemaining % 60;
    hudTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Update local player HUD
    const me = state.players.find(p => p.id === myPlayerId);
    if (me) {
      hudPoints.textContent = `${me.points} pkt`;

      // Update strikes
      strike1.className = `strike ${me.uwagi >= 1 ? 'active' : ''}`;
      strike2.className = `strike ${me.uwagi >= 2 ? 'active' : ''}`;
      strike3.className = `strike ${me.uwagi >= 3 ? 'active' : ''}`;

      // Update desk status badge
      if (me.role === 'STUDENT') {
        if (me.isAtDesk) {
          deskNotice.className = 'desk-indicator safe';
          deskNotice.textContent = '🪑 Jesteś w swojej ławce (Bezpiecznie)';
        } else {
          deskNotice.className = 'desk-indicator danger';
          deskNotice.textContent = '⚠️ Poza ławką! Halbina może wstawić uwagę!';
        }
      }
    }
  });

  // Game Loop (Local movement interpolation & 60 FPS rendering)
  function gameLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp - lastFrameTime) / 1000);
    lastFrameTime = timestamp;

    if (screenGame.classList.contains('active')) {
      handleMovement(dt);
      renderer.render(currentGameState, myPlayerId, dt);
    }

    requestAnimationFrame(gameLoop);
  }

  function handleMovement(dt) {
    const me = currentGameState.players.find(p => p.id === myPlayerId);
    if (me && me.isEliminated) return;

    let moveX = 0;
    let moveY = 0;

    if (keysDown['KeyW'] || keysDown['ArrowUp']) moveY -= 1;
    if (keysDown['KeyS'] || keysDown['ArrowDown']) moveY += 1;
    if (keysDown['KeyA'] || keysDown['ArrowLeft']) moveX -= 1;
    if (keysDown['KeyD'] || keysDown['ArrowRight']) moveX += 1;

    const isMoving = moveX !== 0 || moveY !== 0;

    if (isMoving) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      posX += moveX * speed * dt;
      posY += moveY * speed * dt;

      // Restrict boundaries
      posX = Math.max(60, Math.min(940, posX));
      // If student, cannot walk into teacher's blackboard zone (y >= 180)
      const minY = myRole === 'STUDENT' ? 190 : 80;
      posY = Math.max(minY, Math.min(650, posY));

      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: true });
    } else {
      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: false });
    }
  }

  requestAnimationFrame(gameLoop);

})();
