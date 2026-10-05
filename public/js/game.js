// Main Client Controller for Lekcja Chemii z Halbiną

(function () {
  const socket = io();
  const soundManager = window.soundManager;

  // DOM Elements - Screens
  const screenMenu = document.getElementById('screenMenu');
  const screenLobby = document.getElementById('screenLobby');
  const screenGame = document.getElementById('screenGame');

  // Menu Character Selection & Room Inputs
  const charCards = document.querySelectorAll('.char-card');
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

  // Game HUD DOM
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

  // Boss Fight Bar DOM
  const bossBarContainer = document.getElementById('bossBarContainer');
  const bossPhaseBadge = document.getElementById('bossPhaseBadge');
  const bossHpText = document.getElementById('bossHpText');
  const bossHpFill = document.getElementById('bossHpFill');
  const superChalkBadge = document.getElementById('superChalkBadge');

  // Student Controls DOM
  const deskNotice = document.getElementById('deskNotice');
  const shoutCards = [
    { btn: document.getElementById('shoutBtn1'), text: document.getElementById('shoutText1') },
    { btn: document.getElementById('shoutBtn2'), text: document.getElementById('shoutText2') },
    { btn: document.getElementById('shoutBtn3'), text: document.getElementById('shoutText3') },
  ];
  const btnDuck = document.getElementById('btnDuck');
  const btnCheat = document.getElementById('btnCheat');
  const btnThrowPaper = document.getElementById('btnThrowPaper');
  const btnSeatToggle = document.getElementById('btnSeatToggle');
  const btnSeatText = document.getElementById('btnSeatText');
  const btnThrowChair = document.getElementById('btnThrowChair');
  const macheteAlertBanner = document.getElementById('macheteAlertBanner');
  const btnAbility1 = document.getElementById('btnAbility1');
  const btnAbility1Icon = document.getElementById('btnAbility1Icon');
  const btnAbility1Text = document.getElementById('btnAbility1Text');
  const btnAbility2 = document.getElementById('btnAbility2');
  const btnAbility2Icon = document.getElementById('btnAbility2Icon');
  const btnAbility2Text = document.getElementById('btnAbility2Text');

  const studentControls = document.getElementById('studentControls');
  const teacherControls = document.getElementById('teacherControls');
  const btnTeacherTurn = document.getElementById('btnTeacherTurn');
  const btnTeacherQuiz = document.getElementById('btnTeacherQuiz');
  const teacherInspectBadge = document.getElementById('teacherInspectBadge');

  // Pop Quiz DOM
  const modalPopQuiz = document.getElementById('modalPopQuiz');
  const quizNotebookSheet = document.getElementById('quizNotebookSheet');
  const quizTimerText = document.getElementById('quizTimerText');
  const quizTimerFill = document.getElementById('quizTimerFill');
  const wetPaperNotice = document.getElementById('wetPaperNotice');
  const popQuizQuestionText = document.getElementById('popQuizQuestionText');
  const quizOptBtns = [
    document.getElementById('quizOpt0'),
    document.getElementById('quizOpt1'),
    document.getElementById('quizOpt2'),
    document.getElementById('quizOpt3')
  ];
  const quizOptBtnContainers = document.querySelectorAll('.quiz-opt-btn');
  const spitArtwork = document.getElementById('spitArtwork');
  const dickArtwork = document.getElementById('dickArtwork');
  const dickCounterBadge = document.getElementById('dickCounterBadge');
  const dickGalleryContainer = document.getElementById('dickGalleryContainer');
  const quizPhoneProgressFill = document.getElementById('quizPhoneProgressFill');
  const btnQuizPhone = document.getElementById('btnQuizPhone');
  const btnQuizSpit = document.getElementById('btnQuizSpit');
  const btnQuizDick = document.getElementById('btnQuizDick');
  const btnQuizSubmit = document.getElementById('btnQuizSubmit');

  // Showcase Paper DOM
  const modalShowcasePaper = document.getElementById('modalShowcasePaper');
  const showcaseStudentTag = document.getElementById('showcaseStudentTag');
  const showcaseCenterpiece = document.getElementById('showcaseCenterpiece');
  const btnCloseShowcase = document.getElementById('btnCloseShowcase');

  // Alert & Intro Overlays
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

  // Audio Buttons & Volume Slider DOM
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundStatusText = document.getElementById('soundStatusText');
  const testAudioBtn = document.getElementById('testAudioBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePercent = document.getElementById('volumePercent');

  // Local State
  let selectedCharacter = 'romanowski'; // 'romanowski' | 'leszczynski' | 'wolff' | 'rzepa'
  let myPlayerId = null;
  let currentRoomCode = null;
  let isHost = false;
  let myRole = 'STUDENT';
  let shoutCooldown = false;
  let isDucking = false;
  let isCheating = false;
  let isSitting = true;
  let chairCooldown = false;
  let paperCooldown = false;
  let hoveredStudentId = null;

  // Pop Quiz state
  let selectedQuizOption = null;
  let quizCountdownInterval = null;
  let quizTimeRemaining = 15.0;
  let spitCooldownSeconds = 0;
  let spitCooldownInterval = null;
  let showcaseAutoCloseTimeout = null;
  let phoneCheatHoldTimer = null;
  let phoneCheatProgress = 0;
  let localDickCount = 0;

  // Local movement
  let posX = 500;
  let posY = 400;
  let speed = 210; // px/sec
  const keysDown = {};

  // Renderer instance
  const renderer = new GameRenderer(canvas);
  let currentGameState = {
    teacher: null,
    players: [],
    smokeClouds: [],
    projectiles: []
  };
  let lastFrameTime = performance.now();

  function showScreen(screen) {
    [screenMenu, screenLobby, screenGame].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // Volume Slider Control
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (volumePercent) volumePercent.textContent = `${val}%`;
      if (soundManager && soundManager.setVolume) {
        soundManager.setVolume(val / 100);
      }
    });
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

  // Character Picker Handler (with Filip Rzepa 1-player limit check)
  charCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('locked')) {
        alert('Filip Rzepa jest już zajęty przez innego gracza w tym lobby!');
        return;
      }
      charCards.forEach(c => {
        c.classList.remove('active');
        const chk = c.querySelector('.char-check');
        if (chk && !c.classList.contains('locked')) chk.textContent = 'WYBIERZ';
      });
      card.classList.add('active');
      const chk = card.querySelector('.char-check');
      if (chk) chk.textContent = '✓ WYBRANY';
      selectedCharacter = card.dataset.character || 'romanowski';

      if (currentRoomCode) {
        socket.emit('select_character', { character: selectedCharacter });
      }
    });
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
    const mode = gameModeSelect.value;
    socket.emit('create_room', { character: selectedCharacter, mode: mode }, (res) => {
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
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code || code.length < 3) {
      alert('Wpisz poprawny kod pokoju!');
      return;
    }

    socket.emit('join_room', { code: code, character: selectedCharacter }, (res) => {
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

  // Check if player is near any classroom desk (within 55px)
  function isNearAnyDesk(x, y) {
    return renderer.deskSlots.some(d => Math.hypot(x - d.x, y - d.y) <= 55);
  }

  // Ducking behind desk action
  function toggleDuck() {
    if (myRole !== 'STUDENT') return;
    if (!isDucking) {
      if (!isNearAnyDesk(posX, posY)) {
        tickerText.textContent = "⚠️ Musisz być tuż przy ławce, aby się schować!";
        return;
      }
      isDucking = true;
      btnDuck.classList.add('active');
      socket.emit('student_duck', { isDucking: true }, (res) => {
        if (res && !res.success) {
          isDucking = false;
          btnDuck.classList.remove('active');
          tickerText.textContent = `⚠️ ${res.message}`;
        }
      });
    } else {
      isDucking = false;
      btnDuck.classList.remove('active');
      socket.emit('student_duck', { isDucking: false });
    }
  }

  // Cheating action
  function setCheating(val) {
    if (myRole !== 'STUDENT') return;
    if (isCheating === val) return;
    isCheating = val;
    btnCheat.classList.toggle('active', isCheating);
    socket.emit('student_cheat', { isCheating: isCheating });
  }

  // Toggle Seated / Standing state [Z]
  function toggleSeat() {
    if (myRole !== 'STUDENT') return;
    socket.emit('student_toggle_seat', (res) => {
      if (res && res.success) {
        isSitting = res.isSitting;
        soundManager.playSeatAction();
        if (btnSeatText) {
          btnSeatText.textContent = isSitting ? '[Z] Wstań z ławki' : '[Z] Usiądź w ławce';
        }
        tickerText.textContent = res.message || (isSitting ? 'Usiadłeś w ławce!' : 'Wstałeś z ławki!');
      } else if (res && res.message) {
        tickerText.textContent = `⚠️ ${res.message}`;
      }
    });
  }

  // Throw Chair [X] (Hurls chair at teacher - triggers police call!)
  function throwChair() {
    if (myRole !== 'STUDENT' || chairCooldown) return;
    chairCooldown = true;
    soundManager.playChairThrow();

    if (btnThrowChair) {
      btnThrowChair.classList.add('cooldown');
      btnThrowChair.disabled = true;
    }

    socket.emit('student_throw_chair', {
      targetX: currentGameState.teacher ? currentGameState.teacher.x : 500,
      targetY: currentGameState.teacher ? currentGameState.teacher.y : 110
    });

    tickerText.textContent = "🪑 Cisnąłeś krzesłem w Halbinę! (Uwaga: Halbina dzwoni po policję!)";

    let cd = 15;
    const cdInt = setInterval(() => {
      cd--;
      if (cd <= 0) {
        clearInterval(cdInt);
        chairCooldown = false;
        if (btnThrowChair) {
          btnThrowChair.classList.remove('cooldown');
          btnThrowChair.disabled = false;
          btnThrowChair.innerHTML = '🪑 <strong>[X] Rzuć krzesłem</strong>';
        }
      } else if (btnThrowChair) {
        btnThrowChair.innerHTML = `🪑 <strong>[X] Krzesło (⏳ ${cd}s)</strong>`;
      }
    }, 1000);
  }

  // Paper airplane / Super chalk throw (ONLY in Boss Fight mode!)
  function throwPaper() {
    if (myRole !== 'STUDENT' || paperCooldown) return;

    // Check if mode is Boss Fight
    const isBoss = currentGameState.boss && currentGameState.boss.isBossMode;
    if (!isBoss) {
      tickerText.textContent = "⚠️ Samoloty z papieru działają WYŁĄCZNIE podczas BOSS FIGHT!";
      return;
    }

    paperCooldown = true;
    btnThrowPaper.classList.add('cooldown');
    btnThrowPaper.textContent = '⏳ Przeładowanie...';

    const cooldownTime = 2000;

    socket.emit('student_throw_paper', {
      targetX: currentGameState.teacher ? currentGameState.teacher.x : 500,
      targetY: currentGameState.teacher ? currentGameState.teacher.y : 110
    });

    setTimeout(() => {
      paperCooldown = false;
      btnThrowPaper.classList.remove('cooldown');
      const me = currentGameState.players.find(p => p.id === myPlayerId);
      if (me && me.hasSuperChalk) {
        btnThrowPaper.innerHTML = '🖍️ <strong>[F] Super Kreda (85 DMG)</strong>';
      } else {
        btnThrowPaper.innerHTML = '✈️ <strong>[F] Samolot</strong>';
      }
    }, cooldownTime);
  }

  // Character Superpower 1 (Key Q)
  function useAbility1() {
    if (myRole !== 'STUDENT') return;
    const me = currentGameState.players.find(p => p.id === myPlayerId);
    if (!me || me.isEliminated || me.abilityCooldown1 > 0) return;

    if (me.character === 'romanowski') {
      socket.emit('use_ability', { abilityName: 'milk' });
    } else if (me.character === 'leszczynski') {
      socket.emit('use_ability', { abilityName: 'tick' });
    } else if (me.character === 'wolff') {
      socket.emit('use_ability', { abilityName: 'toilet' });
    } else if (me.character === 'rzepa') {
      soundManager.playPepperSpray();
      socket.emit('use_ability', { abilityName: 'pepper_spray' });
    }
  }

  // Character Superpower 2 (Key V - Wolff e-vape / Filip Rzepa maczeta)
  function useAbility2() {
    if (myRole !== 'STUDENT') return;
    const me = currentGameState.players.find(p => p.id === myPlayerId);
    if (!me || me.isEliminated || me.abilityCooldown2 > 0) return;

    if (me.character === 'wolff') {
      socket.emit('use_ability', { abilityName: 'vape' });
    } else if (me.character === 'rzepa') {
      soundManager.playMacheteSlash();
      socket.emit('use_ability', { abilityName: 'machete' });
    }
  }

  btnSeatToggle.addEventListener('click', toggleSeat);
  btnThrowChair.addEventListener('click', throwChair);
  btnDuck.addEventListener('click', toggleDuck);
  btnCheat.addEventListener('mousedown', () => setCheating(true));
  btnCheat.addEventListener('mouseup', () => setCheating(false));
  btnCheat.addEventListener('mouseleave', () => setCheating(false));
  btnCheat.addEventListener('touchstart', (e) => { e.preventDefault(); setCheating(true); });
  btnCheat.addEventListener('touchend', (e) => { e.preventDefault(); setCheating(false); });
  btnThrowPaper.addEventListener('click', throwPaper);
  btnAbility1.addEventListener('click', useAbility1);
  btnAbility2.addEventListener('click', useAbility2);

  // Teacher turn look button
  btnTeacherTurn.addEventListener('click', () => {
    if (myRole === 'TEACHER') {
      socket.emit('teacher_toggle_look');
    }
  });

  // Teacher pop quiz trigger button (Anger >= 50%)
  if (btnTeacherQuiz) {
    btnTeacherQuiz.addEventListener('click', () => {
      if (myRole === 'TEACHER') {
        socket.emit('teacher_trigger_quiz', {});
      }
    });
  }

  // Pop Quiz: Multiple Choice Buttons
  quizOptBtnContainers.forEach(btn => {
    btn.addEventListener('click', () => {
      quizOptBtnContainers.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedQuizOption = parseInt(btn.dataset.opt, 10);
      btnQuizSubmit.disabled = false;
    });
  });

  // Pop Quiz: 4-Second Hold Phone Cheat Mechanics
  function startPhoneCheat() {
    phoneCheatProgress = 0;
    if (quizPhoneProgressFill) quizPhoneProgressFill.style.width = '0%';
    socket.emit('quiz_cheat_phone_start');

    if (phoneCheatHoldTimer) clearInterval(phoneCheatHoldTimer);
    const startT = performance.now();
    const duration = 4000; // 4.0 seconds

    phoneCheatHoldTimer = setInterval(() => {
      const elapsed = performance.now() - startT;
      phoneCheatProgress = Math.min(100, (elapsed / duration) * 100);
      if (quizPhoneProgressFill) quizPhoneProgressFill.style.width = `${phoneCheatProgress}%`;

      if (elapsed >= duration) {
        clearInterval(phoneCheatHoldTimer);
        phoneCheatHoldTimer = null;
        socket.emit('quiz_cheat_phone_finish');
      }
    }, 50);
  }

  function stopPhoneCheat() {
    if (phoneCheatHoldTimer) {
      clearInterval(phoneCheatHoldTimer);
      phoneCheatHoldTimer = null;
      if (quizPhoneProgressFill) quizPhoneProgressFill.style.width = '0%';
      socket.emit('quiz_cheat_phone_stop');
    }
  }

  if (btnQuizPhone) {
    btnQuizPhone.addEventListener('mousedown', startPhoneCheat);
    btnQuizPhone.addEventListener('mouseup', stopPhoneCheat);
    btnQuizPhone.addEventListener('mouseleave', stopPhoneCheat);
    btnQuizPhone.addEventListener('touchstart', (e) => { e.preventDefault(); startPhoneCheat(); });
    btnQuizPhone.addEventListener('touchend', (e) => { e.preventDefault(); stopPhoneCheat(); });
  }

  // Pop Quiz: Spit on Paper (Cooldown 3s, displaying 30s as requested)
  if (btnQuizSpit) {
    btnQuizSpit.addEventListener('click', () => {
      if (spitCooldownSeconds > 0) return;
      socket.emit('quiz_spit_paper');
    });
  }

  // Pop Quiz: Draw a Dick (Infinite dicks allowed)
  if (btnQuizDick) {
    btnQuizDick.addEventListener('click', () => {
      socket.emit('quiz_draw_dick');
    });
  }

  // Pop Quiz: Submit / Hand-in Paper
  if (btnQuizSubmit) {
    btnQuizSubmit.addEventListener('click', () => {
      socket.emit('quiz_submit_answer', {
        selectedOptionIndex: selectedQuizOption !== null ? selectedQuizOption : -1
      });
      btnQuizSubmit.disabled = true;
    });
  }

  // Showcase Paper Modal: Close
  if (btnCloseShowcase) {
    btnCloseShowcase.addEventListener('click', () => {
      modalShowcasePaper.classList.remove('active');
      if (showcaseAutoCloseTimeout) clearTimeout(showcaseAutoCloseTimeout);
    });
  }

  // Teacher Desk Inspection Target Tracking on Canvas
  canvas.addEventListener('mousemove', (e) => {
    if (myRole !== 'TEACHER') {
      hoveredStudentId = null;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const teacher = currentGameState.teacher;
    if (!teacher || (teacher.state !== 'CLASS' && teacher.state !== 'RAGE') || teacher.inspectionsThisTurn >= 1) {
      hoveredStudentId = null;
      return;
    }

    let found = null;
    if (currentGameState.players) {
      for (const p of currentGameState.players) {
        if (p.role === 'STUDENT' && !p.isEliminated) {
          if (Math.hypot(mx - p.x, my - p.y) <= 45) {
            found = p.id;
            break;
          }
        }
      }
    }
    hoveredStudentId = found;
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredStudentId = null;
  });

  canvas.addEventListener('click', () => {
    if (myRole !== 'TEACHER') return;
    const teacher = currentGameState.teacher;
    if (!teacher || (teacher.state !== 'CLASS' && teacher.state !== 'RAGE')) return;
    if (teacher.inspectionsThisTurn >= 1) {
      tickerText.textContent = "⚠️ Możesz sprawdzić tylko 1 osobę na obrót!";
      return;
    }

    if (hoveredStudentId) {
      socket.emit('teacher_inspect_student', { targetStudentId: hoveredStudentId });
      hoveredStudentId = null;
    }
  });

  // Keyboard Handlers
  window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      if (document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
      }
    }

    keysDown[e.code] = true;

    // Student controls: 1, 2, 3, C, E, F, Q, V, Z, X
    if (screenGame.classList.contains('active') && myRole === 'STUDENT') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        triggerShout(shoutCards[0].text.textContent);
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        triggerShout(shoutCards[1].text.textContent);
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        triggerShout(shoutCards[2].text.textContent);
      } else if (e.code === 'KeyZ') {
        toggleSeat();
      } else if (e.code === 'KeyX') {
        throwChair();
      } else if (e.code === 'KeyC') {
        toggleDuck();
      } else if (e.code === 'KeyE') {
        setCheating(true);
      } else if (e.code === 'KeyF') {
        throwPaper();
      } else if (e.code === 'KeyQ') {
        useAbility1();
      } else if (e.code === 'KeyV') {
        useAbility2();
      }
    }

    // Teacher space key
    if (screenGame.classList.contains('active') && myRole === 'TEACHER' && e.code === 'Space') {
      socket.emit('teacher_toggle_look');
    }
  });

  window.addEventListener('keyup', (e) => {
    keysDown[e.code] = false;
    if (e.code === 'KeyE' && myRole === 'STUDENT') {
      setCheating(false);
    }
  });

  // Configure Superpower HUD buttons for player's character
  function configureAbilityButtons(char) {
    if (char === 'romanowski') {
      btnAbility1Icon.textContent = '🥛';
      btnAbility1Text.textContent = '[Q] Stwórz Mleko';
      btnAbility1.title = 'Stwórz mleko: +75% prędkości na 3s (Klawisz Q)';
      btnAbility2.style.display = 'none';
    } else if (char === 'leszczynski') {
      btnAbility1Icon.textContent = '🕷️';
      btnAbility1Text.textContent = '[Q] Rzut Kleszczem';
      btnAbility1.title = 'Rzuć kleszczem w Halbinę (+2s do jej odwrócenia) (Klawisz Q)';
      btnAbility2.style.display = 'none';
    } else if (char === 'wolff') {
      btnAbility1Icon.textContent = '🚽';
      btnAbility1Text.textContent = '[Q] Mogę do Toalety?!';
      btnAbility1.title = 'Zgłoś wyjście do toalety (+1s opóźnienia Halbina) (Klawisz Q)';
      btnAbility2Icon.textContent = '💨';
      btnAbility2Text.textContent = '[V] Zapal e-vape';
      btnAbility2.title = 'Wypuść chmurę dymu ukrywającą uczniów (Klawisz V)';
      btnAbility2.style.display = 'inline-flex';
    } else if (char === 'rzepa') {
      btnAbility1Icon.textContent = '🌶️';
      btnAbility1Text.textContent = '[Q] Gaz 500ml';
      btnAbility1.title = 'Gaz pieprzowy 500ml: Ogłusza i oślepia Halbinę na 3 sekundy (Klawisz Q)';
      btnAbility2Icon.textContent = '🗡️';
      btnAbility2Text.textContent = '[V] Maczeta';
      btnAbility2.title = 'Maczeta: Rozgonić policję po rzucie krzesłem / atak (Klawisz V)';
      btnAbility2.style.display = 'inline-flex';
    }
  }

  // Update cooldown badges on buttons
  function updateAbilityCooldownUI(me) {
    const cd1 = me.abilityCooldown1 || 0;
    const cd2 = me.abilityCooldown2 || 0;

    if (cd1 > 0) {
      btnAbility1.classList.add('cooldown');
      btnAbility1Text.textContent = `[Q] ⏳ ${cd1}s`;
    } else {
      btnAbility1.classList.remove('cooldown');
      if (me.character === 'romanowski') btnAbility1Text.textContent = '[Q] Stwórz Mleko';
      else if (me.character === 'leszczynski') btnAbility1Text.textContent = '[Q] Rzut Kleszczem';
      else if (me.character === 'wolff') btnAbility1Text.textContent = '[Q] Do Toalety (+1s)';
      else if (me.character === 'rzepa') btnAbility1Text.textContent = '[Q] Gaz 500ml';
    }

    if (me.character === 'wolff') {
      if (cd2 > 0) {
        btnAbility2.classList.add('cooldown');
        btnAbility2Text.textContent = `[V] ⏳ ${cd2}s`;
      } else {
        btnAbility2.classList.remove('cooldown');
        btnAbility2Text.textContent = '[V] Zapal e-vape';
      }
    } else if (me.character === 'rzepa') {
      if (cd2 > 0) {
        btnAbility2.classList.add('cooldown');
        btnAbility2Text.textContent = `[V] ⏳ ${cd2}s`;
      } else {
        btnAbility2.classList.remove('cooldown');
        btnAbility2Text.textContent = '[V] Maczeta';
      }
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

    // Check if Filip Rzepa is taken in this lobby by another player
    const charCardRzepa = document.getElementById('charCardRzepa');
    const charCheckRzepa = document.getElementById('charCheckRzepa');
    if (charCardRzepa && charCheckRzepa) {
      const isRzepaTakenByOther = data.rzepaTaken && selectedCharacter !== 'rzepa';
      if (isRzepaTakenByOther) {
        charCardRzepa.classList.add('locked');
        charCardRzepa.classList.remove('active');
        charCheckRzepa.textContent = '🔒 ZAJĘTY W LOBBY';
      } else {
        charCardRzepa.classList.remove('locked');
        if (selectedCharacter === 'rzepa') {
          charCardRzepa.classList.add('active');
          charCheckRzepa.textContent = '✓ WYBRANY';
        } else {
          charCheckRzepa.textContent = 'WYBIERZ';
        }
      }
    }

    // Render lobby cards with photos
    lobbyPlayersList.innerHTML = '';
    data.players.forEach(p => {
      const card = document.createElement('div');
      card.className = `player-lobby-card ${p.id === data.hostId ? 'is-host' : ''}`;
      const charPhoto = `assets/${p.character || 'romanowski'}_photo.png`;
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${charPhoto}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #f6e58d;" alt="${p.name}">
          <div>
            <div class="player-lobby-name">${p.name}</div>
            <div class="player-lobby-badge">${p.id === data.hostId ? '👑 Gospodarz' : '🎓 Uczeń'}</div>
          </div>
        </div>
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
      hudRole.textContent = myRole === 'TEACHER' ? '👩‍🏫 Katarzyna Halbina' : `🎓 Uczeń ${me.name}`;

      if (myRole === 'TEACHER') {
        studentControls.style.display = 'none';
        teacherControls.style.display = 'block';
      } else {
        studentControls.style.display = 'flex';
        teacherControls.style.display = 'none';
        configureAbilityButtons(me.character);
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
    if (data.playerId !== myPlayerId) {
      soundManager.playScream();
    }
    tickerText.textContent = `📢 ${data.playerName} krzyczy: "${data.text}"!`;
  });

  // POLICE RAID EVENT (Szkieły jadą!)
  socket.on('police_raid_event', (data) => {
    soundManager.playPoliceSiren(data.duration || 7.5);
    soundManager.playHalbinaRage();

    policeBanner.classList.add('active');
    halbinaStatusBadge.className = 'hud-item halbina-status status-class';
    halbinaStatusText.textContent = `🔥 "WY GŁUPIE SKURWYSYNY!" 🔥`;
    tickerText.textContent = data.logMsg;

    setTimeout(() => {
      policeBanner.classList.remove('active');
    }, (data.duration || 7.5) * 1000);
  });

  socket.on('police_raid_ended', () => {
    policeBanner.classList.remove('active');
  });

  // Police Call Initiated (Halbina dials 997 after chair hit)
  socket.on('police_call_initiated', (data) => {
    soundManager.playPhoneDial();
    soundManager.playHalbinaRage();
    if (macheteAlertBanner) {
      macheteAlertBanner.style.display = 'block';
      macheteAlertBanner.classList.add('active');
      macheteAlertBanner.textContent = `🚨 SZKIEŁY WBIEGAJĄ DO SALI ZA ${Math.ceil(data.duration || 8)}s! FILIP RZEPA – ROZJEB ICH MACZETĄ [V]! 🚨`;
    }
    tickerText.textContent = data.message;
  });

  // Police Raid Rescued by Filip Rzepa with Machete
  socket.on('police_raid_rescued', (data) => {
    soundManager.playMacheteSlash();
    if (macheteAlertBanner) {
      macheteAlertBanner.classList.remove('active');
      macheteAlertBanner.style.display = 'none';
    }
    tickerText.textContent = data.message;
  });

  // Teacher Stunned & Blinded by Pepper Spray 500ml
  socket.on('teacher_stunned', (data) => {
    soundManager.playStunDizzy();
    tickerText.textContent = data.message;
  });

  // Teacher Recovered from Stun
  socket.on('teacher_recovered', () => {
    tickerText.textContent = "👀 Halbina odzyskała wzrok po gazie pieprzowym!";
  });

  // Chair Hit Teacher
  socket.on('chair_hit_teacher', (data) => {
    soundManager.playChairCrash();
    tickerText.textContent = `💥 Krzesło rzucone przez ${data.throwerName} uderzyło w Halbinę!`;
  });

  // Ability used broadcast
  socket.on('ability_used', (data) => {
    tickerText.textContent = data.message;
    soundManager.playWhoosh();
  });

  // Teacher desk inspection safe result
  socket.on('desk_inspected_safe', (data) => {
    tickerText.textContent = data.message || `ℹ️ Halbina sprawdziła ${data.studentName}: Siedzi grzecznie w swojej ławce.`;
  });

  // Inspection failed alert (for teacher)
  socket.on('inspection_failed', (data) => {
    tickerText.textContent = `⚠️ ${data.message}`;
  });

  // Paper airplane thrown sound
  socket.on('paper_thrown', () => {
    soundManager.playWhoosh();
  });

  // Teacher distracted
  socket.on('teacher_distracted', (data) => {
    tickerText.textContent = data.message;
    halbinaStatusBadge.className = 'hud-item halbina-status status-board';
    halbinaStatusText.textContent = '✏️ Halbina odwrócona z powodu zamieszania!';
  });

  // Student caught
  socket.on('student_caught', (data) => {
    tickerText.textContent = data.logMsg;

    if (data.playerId === myPlayerId) {
      soundManager.playBusted();
      alarmOverlay.classList.add('active');
      let title = '⚠️ PRZYŁAPANY POZA ŁAWKĄ! ⚠️';
      if (data.reason === 'SHOUTING') title = '🚨 PRZYŁAPANY NA KRZYKU! 🚨';
      else if (data.reason === 'CHEATING') title = '📝 PRZYŁAPANY NA ŚCIĄGANIU! 📝';
      else if (data.reason === 'WRONG_DESK') title = '🪑 PRZYŁAPANY NA ZŁEJ ŁAWCE! 🪑';
      else if (data.reason === 'ACID') title = '🧪 POPARZENIE KWASEM! 🧪';
      else if (data.reason === 'EXAM') title = '📝 OBERWAŁEŚ KARTKÓWKĄ! 📝';

      alarmTitle.textContent = title;
      alarmDesc.textContent = `Otrzymujesz ${data.uwagi}. uwagę! Wracaj na swoją ławkę!`;

      setTimeout(() => {
        alarmOverlay.classList.remove('active');
      }, 1800);
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

  // Pop Quiz Announced to Class
  socket.on('pop_quiz_announced', (data) => {
    tickerText.textContent = data.message;
    soundManager.playHalbinaRage();
    halbinaStatusBadge.className = 'hud-item halbina-status status-class';
    halbinaStatusText.textContent = `📢 "${data.speech}"`;
  });

  // Pop Quiz Modal Triggered for this Student
  socket.on('pop_quiz_modal', (data) => {
    selectedQuizOption = null;
    localDickCount = 0;
    popQuizQuestionText.textContent = data.question;

    data.options.forEach((optText, idx) => {
      if (quizOptBtns[idx]) quizOptBtns[idx].textContent = optText;
    });

    quizOptBtnContainers.forEach(btn => {
      btn.classList.remove('selected', 'phone-hint');
    });

    if (btnQuizSubmit) btnQuizSubmit.disabled = true;

    // Wet Paper Effect
    if (data.isWet) {
      quizNotebookSheet.classList.add('wet-paper');
      wetPaperNotice.style.display = 'block';
    } else {
      quizNotebookSheet.classList.remove('wet-paper');
      wetPaperNotice.style.display = 'none';
    }

    // Reset artwork & counters
    if (spitArtwork) spitArtwork.style.display = 'none';
    if (dickArtwork) dickArtwork.style.display = 'none';
    if (dickCounterBadge) dickCounterBadge.textContent = 'x0';
    if (dickGalleryContainer) dickGalleryContainer.innerHTML = '';
    if (quizPhoneProgressFill) quizPhoneProgressFill.style.width = '0%';
    const btnQuizSpitLabel = document.getElementById('btnQuizSpitLabel');
    if (btnQuizSpitLabel) btnQuizSpitLabel.textContent = 'Opluj kartkę (30 s)';
    if (btnQuizSpit) {
      btnQuizSpit.classList.remove('cooldown');
    }
    spitCooldownSeconds = 0;

    // Start 15s Countdown Bar
    if (quizCountdownInterval) clearInterval(quizCountdownInterval);
    quizTimeRemaining = data.timeRemaining || 15.0;
    quizTimerText.textContent = `${quizTimeRemaining.toFixed(1)}s`;
    quizTimerFill.style.width = '100%';

    const startTime = performance.now();
    const totalDuration = quizTimeRemaining * 1000;

    quizCountdownInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const left = Math.max(0, (totalDuration - elapsed) / 1000);
      quizTimerText.textContent = `${left.toFixed(1)}s`;
      const pct = (left / 15.0) * 100;
      quizTimerFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;

      if (left <= 0) {
        clearInterval(quizCountdownInterval);
      }
    }, 100);

    modalPopQuiz.classList.add('active');
  });

  // Pop Quiz Modal Closed
  socket.on('pop_quiz_closed', () => {
    modalPopQuiz.classList.remove('active');
    if (quizCountdownInterval) {
      clearInterval(quizCountdownInterval);
      quizCountdownInterval = null;
    }
  });

  // Pop Quiz Result (Grading)
  socket.on('pop_quiz_result', (data) => {
    tickerText.textContent = data.message;
    if (data.success) {
      soundManager.playBell();
    } else {
      soundManager.playBusted();
    }
  });

  // Phone Cheat Success
  socket.on('quiz_phone_success', (data) => {
    tickerText.textContent = data.message;
    soundManager.playWhoosh();

    if (data.correctIndex !== undefined && quizOptBtnContainers[data.correctIndex]) {
      quizOptBtnContainers.forEach(b => b.classList.remove('selected', 'phone-hint'));
      const targetBtn = quizOptBtnContainers[data.correctIndex];
      targetBtn.classList.add('phone-hint', 'selected');
      selectedQuizOption = data.correctIndex;
      if (btnQuizSubmit) btnQuizSubmit.disabled = false;
    }
  });

  // Spit on Paper Success (Cooldown 3s, displaying 30 s as requested)
  socket.on('quiz_spit_success', (data) => {
    tickerText.textContent = data.message;
    soundManager.playSpit();
    if (spitArtwork) spitArtwork.style.display = 'flex';
    const spitCountTag = document.getElementById('spitCountTag');
    if (spitCountTag) spitCountTag.textContent = `💦 OPLUTA ŚLINĄ (x${data.spitCount})!`;
    if (btnQuizSubmit) btnQuizSubmit.disabled = false;

    // Start 3s spit button cooldown (displaying 30 s)
    spitCooldownSeconds = 3;
    if (btnQuizSpit) {
      btnQuizSpit.classList.add('cooldown');
      const btnQuizSpitLabel = document.getElementById('btnQuizSpitLabel');
      if (btnQuizSpitLabel) btnQuizSpitLabel.textContent = 'Opluj (30 s)';
    }

    if (spitCooldownInterval) clearInterval(spitCooldownInterval);
    spitCooldownInterval = setInterval(() => {
      spitCooldownSeconds--;
      if (spitCooldownSeconds <= 0) {
        clearInterval(spitCooldownInterval);
        if (btnQuizSpit) {
          btnQuizSpit.classList.remove('cooldown');
          const btnQuizSpitLabel = document.getElementById('btnQuizSpitLabel');
          if (btnQuizSpitLabel) btnQuizSpitLabel.textContent = 'Opluj kartkę (30 s)';
        }
      }
    }, 1000);
  });

  // Dick Drawing Success (Infinite dicks allowed)
  socket.on('quiz_dick_success', (data) => {
    tickerText.textContent = data.message;
    soundManager.playPenScribble();

    localDickCount = data.dickCount || (localDickCount + 1);
    if (dickCounterBadge) dickCounterBadge.textContent = `x${localDickCount}`;
    if (dickArtwork) dickArtwork.style.display = 'flex';
    const penSignatureTag = document.getElementById('penSignatureTag');
    if (penSignatureTag) penSignatureTag.textContent = `~ kutasy na kartce: x${localDickCount}`;

    if (dickGalleryContainer) {
      const rot = (localDickCount * 22) % 36 - 18;
      const dickSvgHtml = `
        <svg viewBox="0 0 160 120" class="dick-svg" style="transform: rotate(${rot}deg); width: 85px; height: 65px; margin: 3px;">
          <ellipse cx="40" cy="85" rx="22" ry="20" fill="none" stroke="#1b3b82" stroke-width="3" stroke-dasharray="2 1" />
          <ellipse cx="78" cy="88" rx="22" ry="20" fill="none" stroke="#1b3b82" stroke-width="3" />
          <path d="M 45 70 C 45 40, 52 25, 54 18 C 55 12, 65 12, 66 18 C 68 25, 75 40, 75 70" fill="none" stroke="#1b3b82" stroke-width="3.5" />
          <path d="M 49 24 C 58 20, 62 20, 71 24" fill="none" stroke="#1b3b82" stroke-width="3" />
          <line x1="60" y1="13" x2="60" y2="21" stroke="#1b3b82" stroke-width="2.5" />
          <path d="M 54 58 Q 63 50 56 36" fill="none" stroke="#2551a3" stroke-width="2" />
          <path d="M 52 8 Q 45 4 40 5" fill="none" stroke="#2980b9" stroke-width="2" stroke-linecap="round" />
          <path d="M 60 7 Q 60 0 62 -4" fill="none" stroke="#2980b9" stroke-width="2" stroke-linecap="round" />
          <path d="M 68 8 Q 75 4 80 5" fill="none" stroke="#2980b9" stroke-width="2" stroke-linecap="round" />
        </svg>
      `;
      dickGalleryContainer.innerHTML += dickSvgHtml;
    }

    if (btnQuizSubmit) btnQuizSubmit.disabled = false;
  });

  // Showcase Paper in the Center of Classroom
  socket.on('showcase_paper', (data) => {
    soundManager.playHalbinaRage();
    tickerText.textContent = data.message;

    if (showcaseStudentTag) {
      showcaseStudentTag.textContent = `Uczeń: ${data.studentName}`;
    }

    if (showcaseCenterpiece) {
      if (data.type === 'dick') {
        const count = data.dickCount || 1;
        let dicksHtml = '';
        for (let i = 0; i < Math.min(12, count); i++) {
          const rot = (i * 23) % 40 - 20;
          dicksHtml += `
            <svg viewBox="0 0 160 120" class="dick-svg" style="transform: rotate(${rot}deg); width: 85px; height: 70px; margin: 4px;">
              <ellipse cx="40" cy="85" rx="22" ry="20" fill="none" stroke="#1b3b82" stroke-width="3.5" stroke-dasharray="2 1" />
              <ellipse cx="78" cy="88" rx="22" ry="20" fill="none" stroke="#1b3b82" stroke-width="3.5" />
              <path d="M 45 70 C 45 40, 52 25, 54 18 C 55 12, 65 12, 66 18 C 68 25, 75 40, 75 70" fill="none" stroke="#1b3b82" stroke-width="4" />
              <path d="M 49 24 C 58 20, 62 20, 71 24" fill="none" stroke="#1b3b82" stroke-width="3.5" />
              <line x1="60" y1="13" x2="60" y2="21" stroke="#1b3b82" stroke-width="3" />
              <path d="M 54 58 Q 63 50 56 36" fill="none" stroke="#2551a3" stroke-width="2.5" />
              <path d="M 52 8 Q 45 4 40 5" fill="none" stroke="#2980b9" stroke-width="2.5" stroke-linecap="round" />
              <path d="M 60 7 Q 60 0 62 -4" fill="none" stroke="#2980b9" stroke-width="2.5" stroke-linecap="round" />
              <path d="M 68 8 Q 75 4 80 5" fill="none" stroke="#2980b9" stroke-width="2.5" stroke-linecap="round" />
            </svg>
          `;
        }
        showcaseCenterpiece.innerHTML = `
          <div class="showcase-dick">
            <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; max-width:460px;">
              ${dicksHtml}
            </div>
            <span style="font-family:'Permanent Marker', cursive; font-size:1.1rem; color:#1b3b82; margin-top:8px;">
              ✏️ NARYSOWANE KUTASY DŁUGOPISEM (${count}x)
            </span>
          </div>
        `;
      } else if (data.type === 'spit') {
        const spitCount = data.spitCount || 1;
        showcaseCenterpiece.innerHTML = `
          <div class="showcase-spit">
            <div class="showcase-spit-puddle">
              <span>💦 OPLUTA KARTKÓWKA (${spitCount}x)!</span>
            </div>
            <span style="font-family:'Permanent Marker', cursive; font-size:1.1rem; color:#1e824c;">
              💦 WIELKA OBRZYDLIWA PLAMA ŚLINY
            </span>
          </div>
        `;
      }
    }

    modalShowcasePaper.classList.add('active');

    if (showcaseAutoCloseTimeout) clearTimeout(showcaseAutoCloseTimeout);
    showcaseAutoCloseTimeout = setTimeout(() => {
      modalShowcasePaper.classList.remove('active');
    }, 5500);
  });

  // Boss Fight Events
  socket.on('boss_phase_changed', (data) => {
    tickerText.textContent = data.message;
    soundManager.playHalbinaRage();
  });

  socket.on('boss_shockwave', (data) => {
    tickerText.textContent = data.message;
    soundManager.playHalbinaRage();
  });

  socket.on('boss_attack_warning', (data) => {
    tickerText.textContent = data.message;
    if (data.attack === 'acid') {
      soundManager.playWarning();
    }
  });

  socket.on('acid_puddle_created', () => {
    // Puddle spawned on floor
  });

  socket.on('acid_neutralized', (data) => {
    tickerText.textContent = data.message;
    soundManager.playWhoosh();
  });

  socket.on('chalk_picked_up', (data) => {
    tickerText.textContent = data.message;
    soundManager.playWhoosh();
    if (superChalkBadge) superChalkBadge.style.display = 'inline-flex';
    if (!paperCooldown) {
      btnThrowPaper.innerHTML = '🖍️ <strong>[F] Super Kreda (85 DMG)</strong>';
    }
  });

  socket.on('exam_dodged', (data) => {
    tickerText.textContent = '✨ ' + data.message;
  });

  socket.on('boss_damaged', (data) => {
    if (data.reason === 'SUPER KREDA' || data.reason === 'RZUT KLESZCZEM') {
      tickerText.textContent = `💥 ${data.reason}: -${data.damage} HP dla Halbina! Pozostało: ${data.hp} HP!`;
    }
  });

  // Game Ended
  socket.on('game_ended', (data) => {
    soundManager.playBell();

    if (data.reason === 'BOSS_DEFEATED') {
      gameOverTitle.textContent = '👑 MEGA HALBINA POKONANA!';
      gameOverSubtitle.textContent = 'Klasa zatriumfowała! Chemiczny tyrant został zneutralizowany!';
    } else if (data.reason === 'BELL') {
      gameOverTitle.textContent = '🔔 DZWONEK NA PRZERWĘ!';
      gameOverSubtitle.textContent = 'Lekcja chemii dobiegła końca! Kto przetrwał z największym respektem?';
    } else {
      gameOverTitle.textContent = '🚨 WSZYSCY U DYREKTORA!';
      gameOverSubtitle.textContent = 'Katarzyna Halbina wyłapała wszystkich rozrabiaków!';
    }

    // Fill leaderboard
    leaderboardBody.innerHTML = '';
    data.leaderboard.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      const pointsOrDmg = data.isBossMode 
        ? `${entry.bossDamage || 0} DMG (${entry.points} pkt)` 
        : `${entry.points} pkt`;

      tr.innerHTML = `
        <td><strong>${medal}</strong></td>
        <td><strong>${entry.name}</strong></td>
        <td style="color: #f1c40f; font-weight: bold;">${pointsOrDmg}</td>
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

    // Update Boss Fight Health Bar
    if (state.boss && state.boss.isBossMode) {
      if (bossBarContainer) bossBarContainer.style.display = 'block';
      if (bossHpText) bossHpText.textContent = `${state.boss.hp} / ${state.boss.maxHp} HP`;
      const hpPct = Math.max(0, Math.min(100, (state.boss.hp / state.boss.maxHp) * 100));
      if (bossHpFill) bossHpFill.style.width = hpPct + '%';
      if (bossPhaseBadge) {
        bossPhaseBadge.textContent = `FAZA ${state.boss.phase}`;
        bossPhaseBadge.className = `boss-phase-badge phase-${state.boss.phase}`;
      }
    } else {
      if (bossBarContainer) bossBarContainer.style.display = 'none';
    }

    // Update Halbina Anger Meter
    const angerVal = Math.min(100, Math.max(0, state.teacher ? state.teacher.anger : 0));
    angerMeterFill.style.width = angerVal + '%';
    hudAngerText.textContent = angerVal + '%';

    // Update Halbina Status Banner
    if (state.teacher) {
      if (state.teacher.state === 'RAGE') {
        halbinaStatusBadge.className = 'hud-item halbina-status status-class';
        halbinaStatusText.textContent = `🔥 "WY GŁUPIE SKURWYSYNY!" 🔥`;
      } else if (state.teacher.state === 'CLASS') {
        halbinaStatusBadge.className = 'hud-item halbina-status status-class';
        halbinaStatusText.textContent = '🚨 HALBINA PATRZY NA KLASĘ!';
      } else if (state.teacher.state === 'TURNING') {
        halbinaStatusBadge.className = 'hud-item halbina-status status-turning';
        halbinaStatusText.textContent = '👀 UWAGA! HALBINA ZARAZ SIĘ ODWRÓCI!';
      } else {
        halbinaStatusBadge.className = 'hud-item halbina-status status-board';
        halbinaStatusText.textContent = '✏️ Halbina pisze na tablicy... (Można krzyczeć!)';
      }

      // Teacher controls update (Inspection, 2s/5s Turn cooldown, Quiz trigger)
      if (myRole === 'TEACHER') {
        if (teacherInspectBadge) {
          if (state.teacher.inspectionsThisTurn >= 1) {
            teacherInspectBadge.className = 'inspect-badge used';
            teacherInspectBadge.textContent = '🔍 Przegląd: WYKORZYSTANY (1 na obrót)';
          } else {
            teacherInspectBadge.className = 'inspect-badge ready';
            teacherInspectBadge.textContent = '🔍 Przegląd: DOSTĘPNY (Kliknij ucznia)';
          }
        }

        // Update Teacher turn button (2s looking, 5s cooldown)
        if (btnTeacherTurn) {
          if (state.teacherTurnCooldown > 0) {
            btnTeacherTurn.classList.add('cooldown');
            btnTeacherTurn.disabled = true;
            btnTeacherTurn.textContent = `⏳ OBRÓT COOLDOWN: ${Math.ceil(state.teacherTurnCooldown)}s`;
          } else if (state.teacher.state === 'CLASS') {
            btnTeacherTurn.classList.remove('cooldown');
            btnTeacherTurn.disabled = false;
            btnTeacherTurn.textContent = `👀 PATRZYSZ NA KLASĘ (2s)`;
          } else {
            btnTeacherTurn.classList.remove('cooldown');
            btnTeacherTurn.disabled = false;
            btnTeacherTurn.textContent = `🔄 OBRÓĆ SIĘ (2s) / TABLICA (SPACJA)`;
          }
        }

        // Update Teacher Pop Quiz button (Anger >= 50%)
        if (btnTeacherQuiz) {
          const canQuiz = state.teacher.anger >= 50 && (!state.popQuizCooldown || state.popQuizCooldown <= 0) && !state.activeQuiz;
          if (canQuiz) {
            btnTeacherQuiz.classList.remove('cooldown');
            btnTeacherQuiz.disabled = false;
            btnTeacherQuiz.textContent = `📢 WEŹ DO ODPOWIEDZI! (GOTOWY)`;
          } else if (state.activeQuiz) {
            btnTeacherQuiz.classList.add('cooldown');
            btnTeacherQuiz.disabled = true;
            btnTeacherQuiz.textContent = `📢 KARTKÓWKA W TOKU...`;
          } else if (state.popQuizCooldown > 0) {
            btnTeacherQuiz.classList.add('cooldown');
            btnTeacherQuiz.disabled = true;
            btnTeacherQuiz.textContent = `⏳ KARTKÓWKA: ${Math.ceil(state.popQuizCooldown)}s`;
          } else {
            btnTeacherQuiz.classList.add('cooldown');
            btnTeacherQuiz.disabled = true;
            btnTeacherQuiz.textContent = `📢 DO ODPOWIEDZI (${state.teacher.anger}%/50%)`;
          }
        }
      }
    }

    // Update local player HUD
    const me = state.players.find(p => p.id === myPlayerId);
    if (me) {
      hudPoints.textContent = `${me.points} pkt`;

      // Update strikes
      strike1.className = `strike ${me.uwagi >= 1 ? 'active' : ''}`;
      strike2.className = `strike ${me.uwagi >= 2 ? 'active' : ''}`;
      strike3.className = `strike ${me.uwagi >= 3 ? 'active' : ''}`;

      // Paper airplanes / Super chalk (ONLY in Boss Fight mode)
      const isBossMode = state.boss && state.boss.isBossMode;
      if (btnThrowPaper) {
        btnThrowPaper.style.display = isBossMode ? 'inline-flex' : 'none';
      }

      // Super chalk badge on student actions bar
      if (superChalkBadge) {
        superChalkBadge.style.display = me.hasSuperChalk ? 'inline-flex' : 'none';
      }
      if (me.hasSuperChalk && !paperCooldown) {
        btnThrowPaper.innerHTML = '🖍️ <strong>[F] Super Kreda (85 DMG)</strong>';
      } else if (!paperCooldown) {
        btnThrowPaper.innerHTML = '✈️ <strong>[F] Samolot</strong>';
      }

      // Synchronize Sitting State
      if (me.isSitting !== undefined) {
        isSitting = me.isSitting;
      }
      if (btnSeatText) {
        btnSeatText.textContent = isSitting ? '[Z] Wstań z ławki' : '[Z] Usiądź w ławce';
      }
      if (btnSeatToggle) {
        btnSeatToggle.classList.toggle('active', isSitting);
      }

      // Update desk status badge
      if (me.role === 'STUDENT') {
        if (me.isDucking) {
          deskNotice.className = 'desk-indicator ducking';
          deskNotice.textContent = '🙈 Ukryty pod ławką (Bezpiecznie)';
        } else if (me.isCheating) {
          deskNotice.className = 'desk-indicator danger';
          deskNotice.textContent = '📝 Ściągasz pod ławką! (+35 pkt)';
        } else if (isSitting) {
          deskNotice.className = 'desk-indicator safe';
          deskNotice.textContent = `🪑 Siedzisz w ławce (#${me.currentDeskIndex + 1}) - Bezpiecznie`;
        } else if (me.isAtDesk) {
          deskNotice.className = 'desk-indicator warning';
          deskNotice.textContent = `🧍 Stoisz przy ławce (#${me.currentDeskIndex + 1}) - Wciśnij [Z], aby usiąść!`;
        } else {
          deskNotice.className = 'desk-indicator danger';
          deskNotice.textContent = '🏃 Chodzisz po klasie! Halbina da uwagę za chodzenie!';
        }

        // Update ability cooldowns
        updateAbilityCooldownUI(me);
      }
    }

    // Update Machete Alert Banner for Police Raid countdown
    if (state.policeRaidPending) {
      if (macheteAlertBanner) {
        macheteAlertBanner.style.display = 'block';
        macheteAlertBanner.classList.add('active');
        macheteAlertBanner.textContent = `🚨 SZKIEŁY WBIEGAJĄ DO SALI ZA ${Math.ceil(state.policeRaidTimer || 8)}s! FILIP RZEPA – ROZJEB ICH MACZETĄ [V]! 🚨`;
      }
    } else {
      if (macheteAlertBanner) {
        macheteAlertBanner.classList.remove('active');
        macheteAlertBanner.style.display = 'none';
      }
    }
  });

  // Game Loop (Local movement interpolation & 60 FPS rendering)
  function gameLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp - lastFrameTime) / 1000);
    lastFrameTime = timestamp;

    if (screenGame.classList.contains('active')) {
      handleMovement(dt);
      renderer.render(currentGameState, myPlayerId, dt, hoveredStudentId);
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

    // Seated students cannot walk until they stand up [Z]
    if (myRole === 'STUDENT' && isSitting) {
      if (isMoving) {
        tickerText.textContent = "🪑 Siedzisz w ławce! Wciśnij [Z], aby wstać i chodzić po klasie.";
      }
      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: false });
      return;
    }

    // Romanowski speed boost (+75%)
    let currentSpeed = speed;
    if (me && me.speedBoost) {
      currentSpeed *= 1.75;
    }

    if (isMoving) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      posX += moveX * currentSpeed * dt;
      posY += moveY * currentSpeed * dt;

      // Restrict boundaries
      posX = Math.max(60, Math.min(940, posX));
      const minY = myRole === 'STUDENT' ? 190 : 80;
      posY = Math.max(minY, Math.min(650, posY));

      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: true });
    } else {
      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: false });
    }
  }

  requestAnimationFrame(gameLoop);

})();
