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
    { btn: document.getElementById('shoutBtn1'), text: document.getElementById('shoutText1'), key: document.querySelector('#shoutBtn1 .card-key') },
    { btn: document.getElementById('shoutBtn2'), text: document.getElementById('shoutText2'), key: document.querySelector('#shoutBtn2 .card-key') },
    { btn: document.getElementById('shoutBtn3'), text: document.getElementById('shoutText3'), key: document.querySelector('#shoutBtn3 .card-key') },
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

  // Classic Mode DOM Elements
  const tabCategoryArcade = document.getElementById('tabCategoryArcade');
  const tabCategoryClassic = document.getElementById('tabCategoryClassic');
  const sectionClassicChar = document.getElementById('sectionClassicChar');
  const arcadeCharSection = document.getElementById('sectionArcadeChars') || document.getElementById('characterSelectorRow');
  const classicFullName = document.getElementById('customNameInput') || document.getElementById('classicFullName');
  const styleCards = document.querySelectorAll('.style-card');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const modeHintText = document.getElementById('modeHintText');

  // Classic HUD Widgets
  const hudClassicClock = document.getElementById('hudClassicClock');
  const hudGameClock = document.getElementById('hudGameClock');
  const hudClassicBank = document.getElementById('hudClassicBank');
  const hudBankBalance = document.getElementById('hudBankBalance');
  const hudClassicLocation = document.getElementById('hudClassicLocation');
  const hudLocationText = document.getElementById('hudLocationText');

  // Classic Controls & Floating Phone Button
  const phoneFloatingBtn = document.getElementById('phoneFloatingBtn');
  const phoneNotificationBadge = document.getElementById('phoneNotificationBadge');
  const btnOpenPhone = document.getElementById('btnOpenPhone');

  // Smartphone Modal & Apps
  const modalSmartphone = document.getElementById('modalSmartphone');
  const btnClosePhone = document.getElementById('btnClosePhone');
  const phoneClock = document.getElementById('phoneClock');
  const phoneDockBtns = document.querySelectorAll('.phone-dock-btn');
  const phoneAppViews = document.querySelectorAll('.phone-app-view');

  // EduVulcan App
  const vulcanStudentTag = document.getElementById('vulcanStudentTag');
  const vulcanRoomBadge = document.getElementById('vulcanRoomBadge');
  const vulcanAttendanceBadge = document.getElementById('vulcanAttendanceBadge');
  const vulcanGradesList = document.getElementById('vulcanGradesList');
  const vulcanNotesList = document.getElementById('vulcanNotesList');

  // Bank App
  const phoneBankBalance = document.getElementById('phoneBankBalance');
  const bankRecipientSelect = document.getElementById('bankRecipientSelect');
  const bankAmountInput = document.getElementById('bankAmountInput');
  const btnSendBankTransfer = document.getElementById('btnSendBankTransfer');
  const bankTransferStatus = document.getElementById('bankTransferStatus');
  const bankTxHistory = document.getElementById('bankTxHistory');

  // Dark Web App
  const darkwebDealerArrivalStatus = document.getElementById('darkwebDealerArrivalStatus');

  // RPG Quick Hotbar & Dedicated Backpack DOM
  const inventoryHotbar = document.getElementById('inventoryHotbar');
  const btnOpenBackpack = document.getElementById('btnOpenBackpack');
  const modalInventory = document.getElementById('modalInventory');
  const btnCloseBackpack = document.getElementById('btnCloseBackpack');
  const btnCloseBackpackBottom = document.getElementById('btnCloseBackpackBottom');
  const backpackGrid = document.getElementById('backpackGrid');
  const backpackItemPreview = document.getElementById('backpackItemPreview');
  const btnUseSelectedBackpackItem = document.getElementById('btnUseSelectedBackpackItem');

  // Teacher Action Buttons DOM
  const btnTeacherRollCall = document.getElementById('btnTeacherRollCall');
  const btnTeacherConfiscate = document.getElementById('btnTeacherConfiscate');
  const btnTeacherChalk = document.getElementById('btnTeacherChalk');
  const btnTeacherSlamDesk = document.getElementById('btnTeacherSlamDesk');
  const btnTeacherCallDirector = document.getElementById('btnTeacherCallDirector');

  // Halbina Tardy Modal
  const modalHalbinaTardy = document.getElementById('modalHalbinaTardy');
  const tardyStudentName = document.getElementById('tardyStudentName');
  const btnTardyOption1 = document.getElementById('btnTardyOption1');
  const btnTardyOption2 = document.getElementById('btnTardyOption2');
  const btnTardyOption3 = document.getElementById('btnTardyOption3');

  // Director Modal
  const modalDirector = document.getElementById('modalDirector');
  const directorSpeechText = document.getElementById('directorSpeechText');
  const btnDirectorOpt1 = document.getElementById('btnDirectorOpt1');
  const btnDirectorOpt2 = document.getElementById('btnDirectorOpt2');
  const btnDirectorOpt3 = document.getElementById('btnDirectorOpt3');
  const btnDirectorOpt4 = document.getElementById('btnDirectorOpt4');
  const btnDirectorWeaponText = document.getElementById('btnDirectorWeaponText');
  const btnDirectorOpt5 = document.getElementById('btnDirectorOpt5');
  const btnDirectorOpt6 = document.getElementById('btnDirectorOpt6');
  const btnDirectorOpt7 = document.getElementById('btnDirectorOpt7');
  const btnDirectorOpt8 = document.getElementById('btnDirectorOpt8');
  const btnDirectorOpt9 = document.getElementById('btnDirectorOpt9');
  const btnCloseDirector = document.getElementById('btnCloseDirector');

  // Dealer Shop Modal
  const modalDealerShop = document.getElementById('modalDealerShop');
  const dealerWalletDisplay = document.getElementById('dealerWalletDisplay');
  const tabDealerBuy = document.getElementById('tabDealerBuy');
  const tabDealerSell = document.getElementById('tabDealerSell');
  const dealerBuyContent = document.getElementById('dealerBuyContent');
  const dealerSellContent = document.getElementById('dealerSellContent');
  const btnCloseDealerShop = document.getElementById('btnCloseDealerShop');

  // Szkolny Sklepik / Bufet Modal
  const modalBuffetShop = document.getElementById('modalBuffetShop');
  const buffetWalletDisplay = document.getElementById('buffetWalletDisplay');
  const buffetItemsContainer = document.getElementById('buffetItemsContainer');
  const btnCloseBuffetShop = document.getElementById('btnCloseBuffetShop');

  // Pokój Nauczycielski Modal
  const modalStaffRoom = document.getElementById('modalStaffRoom');
  const btnStaffBrewCoffee = document.getElementById('btnStaffBrewCoffee');
  const btnStaffStealExam = document.getElementById('btnStaffStealExam');
  const btnStaffChat = document.getElementById('btnStaffChat');
  const staffRoomStatusMsg = document.getElementById('staffRoomStatusMsg');
  const btnCloseStaffRoom = document.getElementById('btnCloseStaffRoom');

  // Chemistry Notebook Exercise Modal
  const modalChemistryExercise = document.getElementById('modalChemistryExercise');
  const chemTaskPrompt = document.getElementById('chemTaskPrompt');
  const chemTaskOptionsGrid = document.getElementById('chemTaskOptionsGrid');
  const chemPenWarning = document.getElementById('chemPenWarning');
  const btnCloseChemTask = document.getElementById('btnCloseChemTask');

  // Fire Alarm & Smoke Interrogation Modal DOM
  const fireAlarmBanner = document.getElementById('fireAlarmBanner');
  const fireAlarmTimerDisplay = document.getElementById('fireAlarmTimerDisplay');
  const modalHalbinaSmokeExplain = document.getElementById('modalHalbinaSmokeExplain');
  const btnSmokeChoice1 = document.getElementById('btnSmokeChoice1');
  const btnSmokeChoice2 = document.getElementById('btnSmokeChoice2');
  const btnSmokeChoice3 = document.getElementById('btnSmokeChoice3');

  // Local State
  let selectedCharacter = 'romanowski'; // 'romanowski' | 'leszczynski' | 'wolff' | 'rzepa'
  let currentCategory = 'arcade'; // 'arcade' | 'classic'
  let classicStyle = 'klasyk';
  let classicColor = '#2c3e50';
  let isSmartphoneOpen = false;
  let isBackpackOpen = false;
  let selectedBackpackItemId = null;
  let activeEquippedItemId = null;
  let activeHotbarIndex = null;
  let activeSmartphoneApp = 'appEduVulcan';
  let activeTardyPromptData = null;
  let activeDirectorData = null;
  let activeDealerData = null;
  let activeBuffetData = null;
  let activeChemTaskData = null;
  const adminState = { isAdmin: false, godMode: false, noclip: false, speedMult: 1 };

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
  let playerFacingAngle = Math.PI / 2;
  let lastMouseMoveTime = 0;
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

  // Category Switcher (Arcade vs Classic)
  function switchCategory(category) {
    currentCategory = category;
    if (category === 'classic') {
      if (tabCategoryClassic) tabCategoryClassic.classList.add('active');
      if (tabCategoryArcade) tabCategoryArcade.classList.remove('active');
      if (sectionClassicChar) sectionClassicChar.style.display = 'block';
      if (arcadeCharSection) arcadeCharSection.style.display = 'none';
      if (gameModeSelect) gameModeSelect.value = 'classic_real';
      if (modeHintText) {
        modeHintText.textContent = "🏫 Tryb Realistyczny: start na korytarzu z 20s do dzwonka, smartfon [T], diler w kiblu o 11:55!";
      }
    } else {
      if (tabCategoryArcade) tabCategoryArcade.classList.add('active');
      if (tabCategoryClassic) tabCategoryClassic.classList.remove('active');
      if (sectionClassicChar) sectionClassicChar.style.display = 'none';
      if (arcadeCharSection) arcadeCharSection.style.display = 'block';
      if (gameModeSelect && gameModeSelect.value === 'classic_real') {
        gameModeSelect.value = 'normal';
      }
      if (modeHintText) {
        const curMode = gameModeSelect ? gameModeSelect.value : 'normal';
        if (curMode === 'normal') {
          modeHintText.textContent = "🏫 Rozgrywka w ławkach – wstajesz z krzesła klawiszem [Z].";
        } else if (curMode === 'classic') {
          modeHintText.textContent = "⚡ Klasyczny Szkolny Chaos (90s) – szybka, intensywna runda klasyczna!";
        } else if (curMode === 'hardcore') {
          modeHintText.textContent = "📝 Szybka Kartkówka (60s) – bezlitosna presja czasu, Halbina nie ma litości!";
        } else if (curMode === 'boss') {
          modeHintText.textContent = "💀 BOSS FIGHT: Mega Halbina (120s) – epicka walka z bossem, rakiety i myśliwce!";
        }
      }
    }
  }

  if (tabCategoryArcade) {
    tabCategoryArcade.addEventListener('click', () => switchCategory('arcade'));
  }
  if (tabCategoryClassic) {
    tabCategoryClassic.addEventListener('click', () => switchCategory('classic'));
  }

  // Classic Character Style selection
  styleCards.forEach(card => {
    card.addEventListener('click', () => {
      styleCards.forEach(c => c.classList.remove('selected', 'active'));
      card.classList.add('selected', 'active');
      let st = card.dataset.style || 'klasyk';
      if (st === 'hoodie') st = 'bluza';
      classicStyle = st;
      if (currentRoomCode) {
        socket.emit('select_character', {
          character: selectedCharacter,
          customProfile: getCustomProfile()
        });
      }
    });
  });

  // Classic Character Shirt Color swatches
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      classicColor = swatch.dataset.color || '#2c3e50';
      if (currentRoomCode) {
        socket.emit('select_character', {
          character: selectedCharacter,
          customProfile: getCustomProfile()
        });
      }
    });
  });

  // Live input sync for custom student name
  if (classicFullName) {
    classicFullName.addEventListener('input', () => {
      if (currentRoomCode) {
        socket.emit('select_character', {
          character: selectedCharacter,
          customProfile: getCustomProfile()
        });
      }
    });
  }

  function getCustomProfile() {
    return {
      customName: (classicFullName ? classicFullName.value.trim() : '') || 'Olivier Leszczyński',
      appearance: {
        style: classicStyle,
        color: classicColor
      }
    };
  }

  // Bidirectional Mode select change listener
  if (gameModeSelect) {
    gameModeSelect.addEventListener('change', () => {
      const mode = gameModeSelect.value;
      if (mode === 'classic_real') {
        switchCategory('classic');
      } else {
        switchCategory('arcade');
        if (modeHintText) {
          if (mode === 'normal') {
            modeHintText.textContent = "🏫 Normalna Lekcja (5 min) – rozgrywka w ławkach, wstajesz z krzesła klawiszem [Z].";
          } else if (mode === 'classic') {
            modeHintText.textContent = "⚡ Klasyczny Szkolny Chaos (90s) – szybka, intensywna runda klasyczna!";
          } else if (mode === 'hardcore') {
            modeHintText.textContent = "📝 Szybka Kartkówka (60s) – bezlitosna presja czasu, Halbina nie ma litości!";
          } else if (mode === 'boss') {
            modeHintText.textContent = "💀 BOSS FIGHT: Mega Halbina (120s) – epicka walka z bossem, rakiety i myśliwce!";
          }
        }
      }
    });
  }

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
        socket.emit('select_character', {
          character: selectedCharacter,
          customProfile: getCustomProfile()
        });
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
    const mode = (currentCategory === 'classic') ? 'classic_real' : gameModeSelect.value;
    socket.emit('create_room', {
      character: selectedCharacter,
      mode: mode,
      category: currentCategory,
      customProfile: getCustomProfile()
    }, (res) => {
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

    socket.emit('join_room', {
      code: code,
      character: selectedCharacter,
      category: currentCategory,
      customProfile: getCustomProfile()
    }, (res) => {
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

  let shoutCooldownTimer = null;
  function triggerShout(text) {
    if (shoutCooldown || myRole !== 'STUDENT') return;
    shoutCooldown = true;

    // Trigger local shout audio
    soundManager.playScream();

    // Disable cards and show cooldown
    shoutCards.forEach(c => c.btn.classList.add('cooldown'));

    socket.emit('shout_trigger', { shoutText: text });

    let remaining = 3.5;
    if (shoutCooldownTimer) clearInterval(shoutCooldownTimer);
    shoutCards.forEach((c) => {
      if (c.key) c.key.textContent = `⏳ ${remaining.toFixed(1)}s`;
    });

    shoutCooldownTimer = setInterval(() => {
      remaining -= 0.5;
      if (remaining <= 0) {
        clearInterval(shoutCooldownTimer);
        shoutCooldownTimer = null;
        shoutCooldown = false;
        shoutCards.forEach((c, idx) => {
          c.btn.classList.remove('cooldown');
          if (c.key) c.key.textContent = `${idx + 1}`;
        });
      } else {
        shoutCards.forEach((c) => {
          if (c.key) c.key.textContent = `⏳ ${remaining.toFixed(1)}s`;
        });
      }
    }, 500);
  }

  // Check if player is near any classroom desk (within 65px)
  function isNearAnyDesk(x, y) {
    const isClassic = (currentGameState && currentGameState.mode === 'classic_real');
    const slots = (isClassic && renderer.classicDeskSlots) ? renderer.classicDeskSlots : (renderer.deskSlots || []);
    return slots.some(d => Math.hypot(x - d.x, y - (d.chairY || d.y)) <= 65);
  }

  // Ducking / crouching action [C]
  function toggleDuck() {
    if (myRole !== 'STUDENT') return;
    isDucking = !isDucking;
    btnDuck.classList.toggle('active', isDucking);
    const underDesk = isNearAnyDesk(posX, posY);
    tickerText.textContent = isDucking 
      ? (underDesk ? "🧎 Kucasz pod ławką (jesteś niewidoczny dla pani Halbina!)" : "🧎 Kucasz (ciche skradanie i unik)")
      : "Wstałeś.";
    socket.emit('student_duck', { isDucking: isDucking }, (res) => {
      if (res && !res.success) {
        isDucking = false;
        btnDuck.classList.remove('active');
        tickerText.textContent = `⚠️ ${res.message}`;
      }
    });
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

  // Throw Chair [X] (Hurls chair at teacher - ONLY FILIP RZEPA!)
  function throwChair() {
    if (myRole !== 'STUDENT' || chairCooldown) return;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (!me || me.character !== 'rzepa') {
      tickerText.textContent = "⚠️ Tylko Filip Rzepa może rzucić krzesłem w Halbinę!";
      return;
    }

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
      me.isSwingingMachete = true;
      setTimeout(() => { me.isSwingingMachete = false; }, 420);
      socket.emit('student_machete_swing', { x: posX, y: posY });
    }
  }

  // Contextual interaction handler for Classic Mode [Key E / Click]
  function handleClassicInteractionKeyE() {
    if (!currentGameState || currentGameState.mode !== 'classic_real') return false;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    const isTeacher = (myRole === 'TEACHER');
    const defaultZone = isTeacher ? 'CHEMISTRY' : 'CORRIDOR';
    const zone = (me && me.currentZone) ? me.currentZone : defaultZone;

    if (zone === 'CORRIDOR') {
      // 1. Sala 204 Door (x: 180, y: 190)
      if (Math.hypot(posX - 180, posY - 190) < 95) {
        socket.emit('change_zone', { targetZone: 'CHEMISTRY' });
        return true;
      }
      // 2. Gabinet Dyrektora Door (x: 370, y: 190)
      if (Math.hypot(posX - 370, posY - 190) < 95) {
        socket.emit('change_zone', { targetZone: 'DIRECTOR' });
        return true;
      }
      // 3. Pokój Nauczycielski Door (x: 550, y: 190)
      if (Math.hypot(posX - 550, posY - 190) < 95) {
        socket.emit('change_zone', { targetZone: 'STAFF_ROOM' });
        return true;
      }
      // 4. Szkolny Sklepik / Bufet Door (x: 730, y: 190)
      if (Math.hypot(posX - 730, posY - 190) < 95) {
        socket.emit('change_zone', { targetZone: 'BUFFET' });
        return true;
      }
      // 5. Szkolna Toaleta Door (x: 890, y: 190)
      if (Math.hypot(posX - 890, posY - 190) < 95) {
        socket.emit('change_zone', { targetZone: 'TOILET' });
        return true;
      }
      // 6. Schowek Woźnego Door (x: 80, y: 350)
      if (posX < 100 && Math.abs(posY - 350) < 95) {
        socket.emit('change_zone', { targetZone: 'JANITOR_ROOM' });
        return true;
      }
      // 7. Radiowęzeł Door (x: 920, y: 440)
      if (posX > 900 && Math.abs(posY - 440) < 95) {
        socket.emit('change_zone', { targetZone: 'SERVER_ROOM' });
        return true;
      }
      // 8. Exit Door to Outdoor Field / Courtyard (Bottom center: x: 440 to 560, y >= 550)
      if (Math.hypot(posX - 500, posY - 635) < 95 || (posY > 550 && Math.abs(posX - 500) < 65)) {
        socket.emit('change_zone', { targetZone: 'COURTYARD' });
        return true;
      }
      // 9. Lockers along bottom wall (y >= 520)
      if (posY >= 520) {
        const lockerBays = [140, 340, 660, 860];
        const nearLocker = lockerBays.some(lx => Math.abs(posX - lx) < 75);
        if (nearLocker) {
          socket.emit('search_locker', { lockerIndex: 0 });
          return true;
        }
      }
    } else if (zone === 'CHEMISTRY') {
      // 1. Exit Door to Corridor (x: 500, y: 645)
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Door to Kantorek Odczynników (x: 80, y: 330)
      if (posX < 100 && Math.abs(posY - 330) < 95) {
        socket.emit('change_zone', { targetZone: 'CHEM_LAB' });
        return true;
      }
      // 3. Desks (Student)
      if (myRole === 'STUDENT') {
        const classicDesks = [
          { x: 260, y: 288 }, { x: 260, y: 408 }, { x: 260, y: 528 },
          { x: 740, y: 288 }, { x: 740, y: 408 }, { x: 740, y: 528 }
        ];
        const nearDesk = isSitting || (me && me.isSitting) || classicDesks.some(d => Math.hypot(posX - d.x, posY - d.y) < 70);
        if (nearDesk) {
          startChemistryTask();
          return true;
        }
      }
    } else if (zone === 'JANITOR_ROOM') {
      // 1. Exit Door
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Wooden Chest
      if (Math.hypot(posX - 315, posY - 340) < 95) {
        socket.emit('janitor_search_chest');
        return true;
      }
      // 3. Keyring
      if (Math.hypot(posX - 727, posY - 180) < 85) {
        socket.emit('janitor_take_keycard');
        return true;
      }
      // 4. Fuse Box
      if (Math.hypot(posX - 865, posY - 325) < 95) {
        socket.emit('janitor_sabotage_fuses');
        return true;
      }
    } else if (zone === 'CHEM_LAB') {
      // 1. Exit Door to Chemistry
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CHEMISTRY' });
        return true;
      }
      // 2. Synthesis Workbench
      if (Math.hypot(posX - 500, posY - 300) < 120) {
        socket.emit('chem_lab_synthesize');
        return true;
      }
    } else if (zone === 'SERVER_ROOM') {
      // 1. Exit Door
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. PA Broadcast Console
      if (Math.hypot(posX - 400, posY - 315) < 100) {
        openRadiowezelModal();
        return true;
      }
      // 3. CCTV Terminal
      if (Math.hypot(posX - 690, posY - 315) < 100) {
        socket.emit('server_room_clear_cctv');
        return true;
      }
    } else if (zone === 'DIRECTOR') {
      // 1. Exit Door to Corridor (x: 500, y: 645)
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Director Desk (x: 500, y: 260)
      if (Math.hypot(posX - 500, posY - 260) < 120) {
        socket.emit('director_interact');
        return true;
      }
    } else if (zone === 'STAFF_ROOM') {
      // 1. Exit Door to Corridor (x: 500, y: 645)
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Open Staff Room Dialog
      openStaffRoomModal();
      return true;
    } else if (zone === 'BUFFET') {
      // 1. Exit Door to Corridor (x: 500, y: 645)
      if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Counter / Shop with Pani Basia
      socket.emit('buffet_get_shop');
      return true;
    } else if (zone === 'TOILET') {
      // 1. Exit Door to Corridor (x: 220, y: 645)
      if (Math.hypot(posX - 220, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 220) < 70)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Shady Dealer at Kabina 2 (x: 750, y: 220)
      if (Math.hypot(posX - 750, posY - 220) < 110) {
        socket.emit('dealer_get_shop');
        return true;
      }
    } else if (zone === 'COURTYARD') {
      // 1. Entrance Doors back to School Corridor (x: 500, y: 85)
      if (Math.hypot(posX - 500, posY - 85) < 95 || (posY < 125 && Math.abs(posX - 500) < 65)) {
        socket.emit('change_zone', { targetZone: 'CORRIDOR' });
        return true;
      }
      // 2. Kaucjomat 2000 (x: 820, y: 150)
      if (Math.hypot(posX - 820, posY - 150) < 110) {
        socket.emit('use_kaucjomat');
        return true;
      }
      // 3. Pan Woźny / Grabienie liści (x: 160, y: 440)
      if (Math.hypot(posX - 160, posY - 440) < 105) {
        socket.emit('wozny_rake_leaves');
        return true;
      }
      // 4. Kosz do koszykówki / Zakład (x: 230, y: 320)
      if (Math.hypot(posX - 230, posY - 320) < 105) {
        socket.emit('basketball_shot_bet');
        return true;
      }
      // 5. Śmietniki na dziedzińcu
      if (Math.hypot(posX - 120, posY - 210) < 90 || Math.hypot(posX - 890, posY - 490) < 90) {
        socket.emit('search_courtyard_trash');
        return true;
      }
      // 6. Podnoszenie kaucjowanych puszek/butelek z ziemi
      if (currentGameState && currentGameState.courtyardDeposits && currentGameState.courtyardDeposits.length > 0) {
        const nearbyDep = currentGameState.courtyardDeposits.find(d => Math.hypot(posX - d.x, posY - d.y) < 70);
        if (nearbyDep) {
          socket.emit('pickup_deposit_item', { depositId: nearbyDep.id });
          return true;
        }
      }
    }
    return false;
  }

  btnSeatToggle.addEventListener('click', toggleSeat);
  btnThrowChair.addEventListener('click', throwChair);
  btnDuck.addEventListener('click', toggleDuck);
  btnCheat.addEventListener('mousedown', () => {
    if (currentGameState && currentGameState.mode === 'classic_real') {
      if (handleClassicInteractionKeyE()) return;
    }
    setCheating(true);
  });
  btnCheat.addEventListener('mouseup', () => setCheating(false));
  btnCheat.addEventListener('mouseleave', () => setCheating(false));
  btnCheat.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentGameState && currentGameState.mode === 'classic_real') {
      if (handleClassicInteractionKeyE()) return;
    }
    setCheating(true);
  });
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

  let lastMouseCanvasX = 500;
  let lastMouseCanvasY = 300;

  // Teacher Desk Inspection Target Tracking & Student Weapon Aiming on Canvas
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    lastMouseCanvasX = (e.clientX - rect.left) * scaleX;
    lastMouseCanvasY = (e.clientY - rect.top) * scaleY;
    lastMouseMoveTime = Date.now();

    if (myRole === 'TEACHER') {
      const dx = lastMouseCanvasX - posX;
      const dy = lastMouseCanvasY - posY;
      if (Math.hypot(dx, dy) > 15) {
        playerFacingAngle = Math.atan2(dy, dx);
        if (currentGameState && currentGameState.teacher) {
          currentGameState.teacher.angle = playerFacingAngle;
        }
      }
    }

    if (myRole !== 'TEACHER') {
      hoveredStudentId = null;
      return;
    }
    const mx = lastMouseCanvasX;
    const my = lastMouseCanvasY;

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
    if (myRole === 'STUDENT') {
      const isClassic = (currentGameState && currentGameState.mode === 'classic_real');
      if (isClassic) {
        const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
        const inv = (me && me.inventory) ? me.inventory : [];
        // Check if selected/equipped item or available weapon in inventory
        let itemToUse = null;
        if (activeEquippedItemId) {
          itemToUse = inv.find(i => i.id === activeEquippedItemId);
        } else if (selectedBackpackItemId) {
          itemToUse = inv.find(i => i.id === selectedBackpackItemId);
        }
        if (!itemToUse) {
          itemToUse = inv.find(i => ['ar15', 'makarov', 'machete', 'knife', 'vape', 'smoke_grenade'].includes(i.id));
        }
        if (itemToUse) {
          useClassicItem(itemToUse.id, lastMouseCanvasX, lastMouseCanvasY);
          return;
        }
      }
      return;
    }

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

    // Smoke interrogation dialogue hotkeys (1, 2, 3)
    if (modalHalbinaSmokeExplain && modalHalbinaSmokeExplain.style.display !== 'none') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') { explainSmokeOption(1); return; }
      if (e.code === 'Digit2' || e.code === 'Numpad2') { explainSmokeOption(2); return; }
      if (e.code === 'Digit3' || e.code === 'Numpad3') { explainSmokeOption(3); return; }
    }

    // Modal dialog hotkeys if active
    if (modalHalbinaTardy && modalHalbinaTardy.style.display !== 'none') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') { decideTardyOption(1); return; }
      if (e.code === 'Digit2' || e.code === 'Numpad2') { decideTardyOption(2); return; }
      if (e.code === 'Digit3' || e.code === 'Numpad3') { decideTardyOption(3); return; }
    }

    if (modalDirector && modalDirector.style.display !== 'none') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') { chooseDirectorOption(1); return; }
      if (e.code === 'Digit2' || e.code === 'Numpad2') { chooseDirectorOption(2); return; }
      if (e.code === 'Digit3' || e.code === 'Numpad3') { chooseDirectorOption(3); return; }
      if (e.code === 'Digit4' || e.code === 'Numpad4') { chooseDirectorOption(4); return; }
      if (e.code === 'Digit5' || e.code === 'Numpad5') { chooseDirectorOption(5); return; }
      if (e.code === 'Digit6' || e.code === 'Numpad6') { chooseDirectorOption(6); return; }
      if (e.code === 'Digit7' || e.code === 'Numpad7') { chooseDirectorOption(7); return; }
      if (e.code === 'Digit8' || e.code === 'Numpad8') { chooseDirectorOption(8); return; }
      if (e.code === 'Digit9' || e.code === 'Numpad9') { chooseDirectorOption(9); return; }
      if (e.code === 'Escape') { closeDirectorDialog(); return; }
    }

    if (modalDealerShop && modalDealerShop.style.display !== 'none') {
      if (e.code === 'Escape') { closeDealerShop(); return; }
    }

    if (modalBuffetShop && modalBuffetShop.style.display !== 'none') {
      if (e.code === 'Escape') { if (btnCloseBuffetShop) btnCloseBuffetShop.click(); return; }
    }

    if (modalStaffRoom && modalStaffRoom.style.display !== 'none') {
      if (e.code === 'Escape') { if (btnCloseStaffRoom) btnCloseStaffRoom.click(); return; }
    }

    if (modalInventory && modalInventory.style.display !== 'none') {
      if (e.code === 'Escape' || e.code === 'KeyI') { closeBackpack(); return; }
    }

    if (modalChemistryExercise && modalChemistryExercise.style.display !== 'none') {
      if (e.code === 'Escape') { closeChemistryTask(); return; }
    }

    if (adminDashboardModal && adminDashboardModal.style.display !== 'none') {
      if (e.code === 'Escape' || e.code === 'F2') { closeAdminDashboard(); return; }
    }

    if (adminAuthModal && adminAuthModal.style.display !== 'none') {
      if (e.code === 'Escape') { closeAdminAuth(); return; }
    }

    if (e.code === 'F2') {
      e.preventDefault();
      toggleAdminDashboard();
      return;
    }

    // Toggle Backpack [I] in classic mode
    if (e.code === 'KeyI') {
      if (currentGameState.mode === 'classic_real' || currentCategory === 'classic') {
        toggleBackpack();
        return;
      }
    }

    // Toggle Smartphone [T] in classic mode
    if (e.code === 'KeyT') {
      if (currentGameState.mode === 'classic_real' || currentCategory === 'classic') {
        toggleSmartphone();
        return;
      }
    }

    // Escape closes phone if open
    if (e.code === 'Escape' && isSmartphoneOpen) {
      closeSmartphone();
      return;
    }

    // Student controls: 1, 2, 3, C, E, F, Q, V, Z, X
    if (screenGame.classList.contains('active') && myRole === 'STUDENT') {
      const isClassic = (currentGameState.mode === 'classic_real');

      if (isClassic) {
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code) ||
            ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6'].includes(e.code)) {
          const num = parseInt(e.code.replace('Digit', '').replace('Numpad', ''), 10);
          useHotbarSlot(num - 1);
          return;
        }
      } else {
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
          triggerShout(shoutCards[0].text.textContent);
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
          triggerShout(shoutCards[1].text.textContent);
        } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
          triggerShout(shoutCards[2].text.textContent);
        }
      }

      if (e.code === 'KeyZ') {
        toggleSeat();
      } else if (e.code === 'KeyX') {
        const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
        if (me && me.character === 'rzepa') {
          throwChair();
        } else {
          tickerText.textContent = "⚠️ Tylko Filip Rzepa może rzucić krzesłem w Halbinę!";
        }
      } else if (e.code === 'KeyC') {
        toggleDuck();
      } else if (e.code === 'KeyE') {
        if (isClassic) {
          if (handleClassicInteractionKeyE()) return;
        }
        setCheating(true);
      } else if (e.code === 'KeyF') {
        throwPaper();
      } else if (e.code === 'KeyQ') {
        useAbility1();
      } else if (e.code === 'KeyV') {
        useAbility2();
      }
    }

    // Teacher space / door key
    if (screenGame.classList.contains('active') && myRole === 'TEACHER') {
      if (e.code === 'Space') {
        socket.emit('teacher_toggle_look');
      } else if (e.code === 'KeyF') {
        socket.emit('teacher_throw_chalk', { targetX: lastMouseCanvasX, targetY: lastMouseCanvasY });
      } else if (e.code === 'KeyE') {
        if (currentGameState.mode === 'classic_real') {
          handleClassicInteractionKeyE();
        }
      }
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
    // Only Filip Rzepa can throw chairs!
    if (btnThrowChair) {
      btnThrowChair.style.display = (char === 'rzepa') ? 'inline-flex' : 'none';
    }

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
      const copsInRoom = currentGameState.policeOfficers && currentGameState.policeOfficers.some(c => c.state !== 'FLEEING');
      if (cd2 > 0) {
        btnAbility2.classList.add('cooldown');
        btnAbility2Text.textContent = `[V] ⏳ ${cd2}s`;
      } else {
        btnAbility2.classList.remove('cooldown');
        if (copsInRoom) {
          btnAbility2Text.textContent = '[V] 🗡️ CIĘCIE MACZETĄ!';
          btnAbility2.title = 'Uderz policjanta maczetą! (Klawisz V)';
        } else {
          btnAbility2Text.textContent = '[V] Maczeta';
          btnAbility2.title = 'Maczeta: Rozgonić policję po rzucie krzesłem / atak (Klawisz V)';
        }
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

    // Render lobby cards with photos or classic avatars
    lobbyPlayersList.innerHTML = '';
    data.players.forEach(p => {
      const card = document.createElement('div');
      card.className = `player-lobby-card ${p.id === data.hostId ? 'is-host' : ''}`;
      const isClassicPlayer = p.isClassic || p.appearance;
      const styleEmojiMap = {
        dresiarz: '🧢',
        kujon: '👓',
        hoodie: '🎧',
        bluza: '🎧',
        alternatywka: '🎸',
        klasyk: '🎒'
      };
      const avatarEmoji = (p.appearance && styleEmojiMap[p.appearance.style]) || '🎒';
      const avatarHtml = isClassicPlayer
        ? `<div style="width:44px; height:44px; border-radius:50%; background:${p.appearance?.color || '#27ae60'}; display:flex; align-items:center; justify-content:center; font-size:1.5rem; border:2px solid #2ecc71; box-shadow: 0 0 10px rgba(46,204,113,0.4);">${avatarEmoji}</div>`
        : `<img src="assets/${p.character || 'romanowski'}_photo.png" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #f6e58d; box-shadow: 0 0 8px rgba(246,229,141,0.3);" alt="${p.name}">`;
      
      const displayName = p.fullName || p.name;
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          ${avatarHtml}
          <div>
            <div class="player-lobby-name">${displayName}</div>
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
      playerFacingAngle = (me.angle !== undefined) ? me.angle : (myRole === 'TEACHER' ? Math.PI / 2 : 0);
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
    if (currentGameState && currentGameState.mode !== 'classic_real') {
      halbinaStatusBadge.className = 'hud-item halbina-status status-turning';
      halbinaStatusText.textContent = '👀 UWAGA! HALBINA ZARAZ SIĘ ODWRÓCI!';
    }
  });

  // Teacher Turned
  socket.on('teacher_turned', ({ state, angle }) => {
    if (currentGameState && currentGameState.mode !== 'classic_real') {
      if (state === 'CLASS') {
        halbinaStatusBadge.className = 'hud-item halbina-status status-class';
        halbinaStatusText.textContent = '🚨 HALBINA PATRZY NA KLASĘ!';
      } else {
        halbinaStatusBadge.className = 'hud-item halbina-status status-board';
        halbinaStatusText.textContent = '✏️ Halbina pisze na tablicy... (Można krzyczeć!)';
      }
    }
    if (angle !== undefined) {
      if (currentGameState && currentGameState.teacher) currentGameState.teacher.angle = angle;
      if (myRole === 'TEACHER') playerFacingAngle = angle;
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
    soundManager.playPoliceSiren(data.duration || 12.0);
    soundManager.playHalbinaRage();

    policeBanner.classList.add('active');
    if (currentGameState && currentGameState.mode !== 'classic_real') {
      halbinaStatusBadge.className = 'hud-item halbina-status status-class';
      halbinaStatusText.textContent = `🔥 "WY GŁUPIE SKURWYSYNY!" 🔥`;
    }
    tickerText.textContent = data.logMsg;

    if (macheteAlertBanner) {
      macheteAlertBanner.style.display = 'block';
      macheteAlertBanner.classList.add('active');
      macheteAlertBanner.textContent = `🚨 SZKIEŁY W SALI! FILIP RZEPA – PODEJDŹ I ROZJEB ICH MACZETĄ [V]! 🚨`;
    }
  });

  socket.on('police_raid_ended', () => {
    policeBanner.classList.remove('active');
    if (macheteAlertBanner) {
      macheteAlertBanner.classList.remove('active');
      macheteAlertBanner.style.display = 'none';
    }
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

  // Machete swung broadcast
  socket.on('machete_swung', (data) => {
    if (data.playerId !== myPlayerId) {
      soundManager.playMacheteSlash();
    }
    if (currentGameState.players) {
      const swinger = currentGameState.players.find(p => p.id === data.playerId);
      if (swinger) {
        swinger.isSwingingMachete = true;
        setTimeout(() => { swinger.isSwingingMachete = false; }, 420);
      }
    }
  });

  // Cop hit by machete
  socket.on('cop_hit', (data) => {
    soundManager.playCopScream();
    tickerText.textContent = `💥 Filip Rzepa trafił ${data.copName}! HP szkieła: ${data.hp}/${data.maxHp}`;
  });

  // Cop defeated by machete
  socket.on('cop_defeated', (data) => {
    soundManager.playCopScream();
    tickerText.textContent = data.message;
  });

  // Cop tackled student with baton
  socket.on('cop_tackled_student', (data) => {
    soundManager.playBatonHit();
    if (data.studentId === myPlayerId) {
      soundManager.playBusted();
      alarmOverlay.classList.add('active');
      alarmTitle.textContent = '🚨 SPACYFIKOWANY PRZEZ POLICJĘ! 🚨';
      alarmDesc.textContent = `${data.copName} uderzył cię pałką policyjną! Otrzymujesz uwagę!`;
      setTimeout(() => {
        alarmOverlay.classList.remove('active');
      }, 1800);
    }
    tickerText.textContent = `🚨 ${data.copName} spałował ucznia ${data.studentName}!`;
  });

  // Police caught Filip Rzepa
  socket.on('police_caught_rzepa', (data) => {
    soundManager.playBusted();
    alarmOverlay.classList.add('active');
    alarmTitle.textContent = '🚨 FILIP RZEPA SPACYFIKOWANY! 🚨';
    alarmDesc.textContent = `${data.copName} powalił Rzepę na glebę! Interwencja policji zakończona!`;
    setTimeout(() => {
      alarmOverlay.classList.remove('active');
    }, 2500);

    if (macheteAlertBanner) {
      macheteAlertBanner.classList.remove('active');
      macheteAlertBanner.style.display = 'none';
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
    if (policeBanner) {
      policeBanner.classList.remove('active');
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
    if (data.ability === 'vape') {
      if (soundManager && soundManager.playVapePuff) soundManager.playVapePuff();
      if (renderer && renderer.triggerVapePuffAnimation) {
        const student = currentGameState && currentGameState.players && currentGameState.players.find(p => p.id === data.playerId);
        const vx = data.x || (student ? (student.renderX || student.x) : 0);
        const vy = data.y || (student ? (student.renderY || student.y) : 0);
        if (vx && vy) renderer.triggerVapePuffAnimation(vx, vy);
      }
    } else {
      soundManager.playWhoosh();
    }
  });

  // Item effect used broadcast (e.g. vape puff, energy drink)
  socket.on('item_effect_used', (data) => {
    if (data.message) tickerText.textContent = data.message;
    if (data.type === 'vape') {
      if (soundManager && soundManager.playVapePuff) soundManager.playVapePuff();
      if (renderer && renderer.triggerVapePuffAnimation && data.x && data.y) {
        renderer.triggerVapePuffAnimation(data.x, data.y);
      }
    }
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
    if (currentGameState && currentGameState.mode !== 'classic_real') {
      halbinaStatusBadge.className = 'hud-item halbina-status status-board';
      halbinaStatusText.textContent = '✏️ Halbina odwrócona z powodu zamieszania!';
    }
  });

  // Student caught
  socket.on('student_caught', (data) => {
    tickerText.textContent = data.logMsg;

    if (data.playerId === myPlayerId) {
      if (adminState && adminState.godMode) return;
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
    if (currentGameState && currentGameState.mode !== 'classic_real') {
      halbinaStatusBadge.className = 'hud-item halbina-status status-class';
      halbinaStatusText.textContent = `📢 "${data.speech}"`;
    }
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
    if (myRole === 'TEACHER' && currentGameState.teacher) {
      currentGameState.teacher.x = posX;
      currentGameState.teacher.y = posY;
      currentGameState.teacher.angle = playerFacingAngle;
    }

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

    // Update Halbina Status Banner (Arcade modes only)
    if (state.teacher && state.mode !== 'classic_real') {
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

    // CLASSIC MODE HUD & STATE UPDATES
    const isClassic = (state.mode === 'classic_real');
    if (isClassic) {
      // Hide arcade "Halbina pisze na tablicy / patrzy na klasę" banner in realistic mode
      if (halbinaStatusBadge) halbinaStatusBadge.style.display = 'none';

      // Show classic location widget
      if (hudClassicLocation) {
        hudClassicLocation.style.display = 'flex';
        const zoneNames = {
          CORRIDOR: 'Korytarz Szkolny',
          CHEMISTRY: 'Sala 204 - Chemia',
          DIRECTOR: 'Gabinet Dyrektora',
          STAFF_ROOM: 'Pokój Nauczycielski',
          BUFFET: 'Sklepik Szkolny',
          TOILET: 'Toaleta (Kibel)',
          JANITOR_ROOM: 'Schowek Woźnego',
          CHEM_LAB: 'Kantorek Odczynników',
          SERVER_ROOM: 'Radiowęzeł',
          COURTYARD: 'Na Polu / Boisko'
        };
        const curZone = (me && me.currentZone) ? me.currentZone : (myRole === 'TEACHER' ? (state.teacher?.currentZone || 'CHEMISTRY') : 'CORRIDOR');
        if (hudLocationText) hudLocationText.textContent = zoneNames[curZone] || 'Korytarz';
      }

      if (hudClassicClock) {
        hudClassicClock.style.display = 'flex';
        if (hudGameClock) hudGameClock.textContent = state.gameClock || '11:45';
      }
      if (hudClassicBank) {
        hudClassicBank.style.display = 'flex';
        if (hudBankBalance && me) {
          hudBankBalance.textContent = `${(me.bankBalance !== undefined ? me.bankBalance : 60).toFixed(2)} PLN`;
        }
      }

      if (phoneFloatingBtn) {
        phoneFloatingBtn.style.display = (myRole === 'STUDENT') ? 'flex' : 'none';
      }
      if (btnOpenPhone) {
        btnOpenPhone.style.display = (myRole === 'STUDENT') ? 'inline-flex' : 'none';
      }

      // Hide arcade superpower buttons in classic mode
      if (btnThrowPaper) btnThrowPaper.style.display = 'none';
      if (btnThrowChair) btnThrowChair.style.display = 'none';
      if (btnAbility1) btnAbility1.style.display = 'none';
      if (btnAbility2) btnAbility2.style.display = 'none';
      if (superChalkBadge) superChalkBadge.style.display = 'none';

      // Fire Alarm Banner
      if (fireAlarmBanner) {
        if (state.fireAlarmActive) {
          fireAlarmBanner.style.display = 'flex';
          if (fireAlarmTimerDisplay) {
            fireAlarmTimerDisplay.textContent = `${Math.ceil(state.fireAlarmTimer || 0)}s`;
          }
        } else {
          fireAlarmBanner.style.display = 'none';
        }
      }

      // Update Dark Web Dealer Arrival status (10 min countdown in cabina)
      if (darkwebDealerArrivalStatus) {
        const dSec = state.dealerRemainingSeconds !== undefined ? Math.ceil(state.dealerRemainingSeconds) : 600;
        if (dSec > 0) {
          const dM = Math.floor(dSec / 60);
          const dS = dSec % 60;
          darkwebDealerArrivalStatus.textContent = `⏳ Diler w kabinie 2: ${dM}:${dS < 10 ? '0' : ''}${dS} (Obecny przez 10 min)`;
          darkwebDealerArrivalStatus.style.color = '#2ecc71';
        } else {
          darkwebDealerArrivalStatus.textContent = `🚪 Diler uciekł przez okno w toalecie!`;
          darkwebDealerArrivalStatus.style.color = '#e74c3c';
        }
      }

      // Update EduVulcan lesson timer badge (1 min chemistry rotation)
      const vulcanLessonTimerBadge = document.getElementById('vulcanLessonTimerBadge');
      if (vulcanLessonTimerBadge && state.lessonRemainingSeconds !== undefined) {
        const lSec = Math.ceil(state.lessonRemainingSeconds);
        vulcanLessonTimerBadge.textContent = `00:${lSec < 10 ? '0' : ''}${lSec}`;
      }

      // Update Tardy Prompt for Teacher
      if (state.activeTardyPrompt) {
        if (myRole === 'TEACHER') {
          activeTardyPromptData = state.activeTardyPrompt;
          if (modalHalbinaTardy) modalHalbinaTardy.style.display = 'flex';
          if (tardyStudentName) tardyStudentName.textContent = state.activeTardyPrompt.studentName;
        } else if (state.activeTardyPrompt.studentId === myPlayerId) {
          tickerText.textContent = '⚠️ Spóźniłeś się na lekcję! Halbina decyduje o Twoim losie...';
        }
      } else {
        if (modalHalbinaTardy && modalHalbinaTardy.style.display !== 'none') {
          modalHalbinaTardy.style.display = 'none';
        }
      }

      // Update dynamic contextual label on [E] button in classic mode
      if (btnCheat && myRole === 'STUDENT') {
        const zone = (me && me.currentZone) ? me.currentZone : 'CORRIDOR';
        if (zone === 'CORRIDOR') {
          if (Math.hypot(posX - 180, posY - 190) < 95) {
            btnCheat.innerHTML = '🚪 <strong>[E] Wejdź do Sali 204</strong>';
          } else if (Math.hypot(posX - 370, posY - 190) < 95) {
            btnCheat.innerHTML = '🏛️ <strong>[E] Gabinet Dyrektora</strong>';
          } else if (Math.hypot(posX - 550, posY - 190) < 95) {
            btnCheat.innerHTML = '☕ <strong>[E] Pokój Nauczycielski</strong>';
          } else if (Math.hypot(posX - 730, posY - 190) < 95) {
            btnCheat.innerHTML = '🥪 <strong>[E] Szkolny Sklepik</strong>';
          } else if (Math.hypot(posX - 890, posY - 190) < 95) {
            btnCheat.innerHTML = '🚻 <strong>[E] Wejdź do Toalety</strong>';
          } else if (posY >= 520 && [140, 360, 640, 860].some(lx => Math.abs(posX - lx) < 80)) {
            btnCheat.innerHTML = '🎒 <strong>[E] Przeszukaj szafkę</strong>';
          } else {
            btnCheat.innerHTML = '🚪 <strong>[E] Podejdź do drzwi</strong>';
          }
        } else if (zone === 'CHEMISTRY') {
          if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
            btnCheat.innerHTML = '🚪 <strong>[E] Wyjdź na korytarz</strong>';
          } else if (isSitting || [{x:260, y:288}, {x:260, y:408}, {x:260, y:528}, {x:740, y:288}, {x:740, y:408}, {x:740, y:528}].some(d => Math.hypot(posX - d.x, posY - d.y) < 70)) {
            btnCheat.innerHTML = '📓 <strong>[E] Otwórz zeszyt (+35 PLN)</strong>';
          } else {
            btnCheat.innerHTML = '📝 <strong>[E] Ściągaj (+35 pkt)</strong>';
          }
        } else if (zone === 'DIRECTOR') {
          if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
            btnCheat.innerHTML = '🚪 <strong>[E] Wyjdź na korytarz</strong>';
          } else if (Math.hypot(posX - 500, posY - 260) < 120) {
            btnCheat.innerHTML = '💬 <strong>[E] Rozmawiaj z Dyrektorem</strong>';
          } else {
            btnCheat.innerHTML = '💬 <strong>[E] Podejdź do biurka</strong>';
          }
        } else if (zone === 'STAFF_ROOM') {
          if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
            btnCheat.innerHTML = '🚪 <strong>[E] Wyjdź na korytarz</strong>';
          } else {
            btnCheat.innerHTML = '☕ <strong>[E] Pokój Nauczycielski</strong>';
          }
        } else if (zone === 'BUFFET') {
          if (Math.hypot(posX - 500, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 500) < 70)) {
            btnCheat.innerHTML = '🚪 <strong>[E] Wyjdź na korytarz</strong>';
          } else {
            btnCheat.innerHTML = '🥪 <strong>[E] Sklepik u Pani Basi</strong>';
          }
        } else if (zone === 'TOILET') {
          if (Math.hypot(posX - 220, posY - 645) < 95 || (posY > 580 && Math.abs(posX - 220) < 70)) {
            btnCheat.innerHTML = '🚪 <strong>[E] Wyjdź na korytarz</strong>';
          } else if (Math.hypot(posX - 750, posY - 220) < 110) {
            btnCheat.innerHTML = '🧅 <strong>[E] Diler Dark Web</strong>';
          } else {
            btnCheat.innerHTML = '🚻 <strong>[E] Toaleta</strong>';
          }
        }
      }

      // Live update hotbar and backpack
      if (me) {
        updateHotbarUI(me.inventory || []);
      }

      // Live update smartphone if open
      if (isSmartphoneOpen && me) {
        updateSmartphoneLive(me, state);
      }
    } else {
      if (halbinaStatusBadge) halbinaStatusBadge.style.display = 'flex';
      if (hudClassicLocation) hudClassicLocation.style.display = 'none';
      if (hudClassicClock) hudClassicClock.style.display = 'none';
      if (hudClassicBank) hudClassicBank.style.display = 'none';
      if (phoneFloatingBtn) phoneFloatingBtn.style.display = 'none';
      if (btnOpenPhone) btnOpenPhone.style.display = 'none';
      if (btnCheat) {
        btnCheat.innerHTML = '📝 <strong>[E] Ściągaj (+35 pkt)</strong>';
      }
    }

    // Exclude banners during pop quiz modal to prevent UI clutter
    const isQuizActive = modalPopQuiz && modalPopQuiz.classList.contains('active');
    const activeCops = (state.policeOfficers || []).filter(c => c.state !== 'FLEEING');

    if (isQuizActive) {
      if (macheteAlertBanner) {
        macheteAlertBanner.classList.remove('active');
        macheteAlertBanner.style.display = 'none';
      }
      if (policeBanner) policeBanner.classList.remove('active');
    } else if (activeCops.length > 0) {
      if (policeBanner) policeBanner.classList.remove('active');
      if (macheteAlertBanner) {
        macheteAlertBanner.style.display = 'block';
        macheteAlertBanner.classList.add('active');
        macheteAlertBanner.textContent = `🚨 SZKIEŁY W SALI (${activeCops.length} pozostało)! FILIP RZEPA – PODEJDŹ I UDERZAJ MACZETĄ [V]! 🚨`;
      }
    } else if (state.policeRaidPending) {
      if (policeBanner) policeBanner.classList.remove('active');
      if (macheteAlertBanner) {
        macheteAlertBanner.style.display = 'block';
        macheteAlertBanner.classList.add('active');
        macheteAlertBanner.textContent = `🚨 SZKIEŁY WBIEGAJĄ DO SALI ZA ${Math.ceil(state.policeRaidTimer || 8)}s! FILIP RZEPA – PRZYGOTUJ MACZETĘ [V]! 🚨`;
      }
    } else if (state.policeActive) {
      if (macheteAlertBanner) {
        macheteAlertBanner.classList.remove('active');
        macheteAlertBanner.style.display = 'none';
      }
      if (policeBanner) policeBanner.classList.add('active');
    } else {
      if (macheteAlertBanner) {
        macheteAlertBanner.classList.remove('active');
        macheteAlertBanner.style.display = 'none';
      }
      if (policeBanner) policeBanner.classList.remove('active');
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
      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: false, angle: playerFacingAngle });
      return;
    }

    // Movement speed calculations
    let currentSpeed = speed;
    if (adminState && adminState.speedMult > 1) {
      currentSpeed *= adminState.speedMult;
    }
    if (me && me.speedBoost) {
      currentSpeed *= 1.75;
    }
    // Stealth sneaking speed when ducking / crouching
    if (isDucking) {
      currentSpeed *= 0.65;
    }

    if (isMoving) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      posX += moveX * currentSpeed * dt;
      posY += moveY * currentSpeed * dt;

      // Restrict boundaries (skip if admin noclip is enabled)
      if (!adminState || !adminState.noclip) {
        posX = Math.max(50, Math.min(950, posX));
        const isClassic = (currentGameState.mode === 'classic_real');
        const minY = isClassic ? 55 : (myRole === 'STUDENT' ? 190 : 80);
        posY = Math.max(minY, Math.min(650, posY));
      }

      // WASD updates facing angle if mouse was not moved recently (or not teacher)
      if (Date.now() - lastMouseMoveTime > 700 || myRole !== 'TEACHER') {
        playerFacingAngle = Math.atan2(moveY, moveX);
      } else if (myRole === 'TEACHER') {
        const dx = lastMouseCanvasX - posX;
        const dy = lastMouseCanvasY - posY;
        if (Math.hypot(dx, dy) > 15) {
          playerFacingAngle = Math.atan2(dy, dx);
        }
      }

      if (myRole === 'TEACHER' && currentGameState.teacher) {
        currentGameState.teacher.x = posX;
        currentGameState.teacher.y = posY;
        currentGameState.teacher.angle = playerFacingAngle;
      }

      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: true, angle: playerFacingAngle });
    } else {
      if (myRole === 'TEACHER' && Date.now() - lastMouseMoveTime < 700) {
        const dx = lastMouseCanvasX - posX;
        const dy = lastMouseCanvasY - posY;
        if (Math.hypot(dx, dy) > 15) {
          playerFacingAngle = Math.atan2(dy, dx);
        }
      }

      if (myRole === 'TEACHER' && currentGameState.teacher) {
        currentGameState.teacher.x = posX;
        currentGameState.teacher.y = posY;
        currentGameState.teacher.angle = playerFacingAngle;
      }

      socket.emit('player_move', { x: Math.round(posX), y: Math.round(posY), isMoving: false, angle: playerFacingAngle });
    }
  }

  // ====================================================
  // CLASSIC MODE CLIENT INTERACTION LOGIC
  // ====================================================

  // 1. SMARTPHONE HANDLERS
  function toggleSmartphone() {
    if (isSmartphoneOpen) {
      closeSmartphone();
    } else {
      openSmartphone();
    }
  }

  function openSmartphone() {
    isSmartphoneOpen = true;
    if (modalSmartphone) modalSmartphone.style.display = 'flex';
    if (soundManager && soundManager.playPhoneDing) soundManager.playPhoneDing();

    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      updateSmartphoneLive(me, currentGameState);
    }
  }

  function closeSmartphone() {
    isSmartphoneOpen = false;
    if (modalSmartphone) modalSmartphone.style.display = 'none';
  }

  if (phoneFloatingBtn) {
    phoneFloatingBtn.addEventListener('click', toggleSmartphone);
  }
  if (btnOpenPhone) {
    btnOpenPhone.addEventListener('click', toggleSmartphone);
  }
  if (btnClosePhone) {
    btnClosePhone.addEventListener('click', closeSmartphone);
  }

  // Smartphone Dock App Switching
  phoneDockBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      phoneDockBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetAppId = btn.dataset.app;
      activeSmartphoneApp = targetAppId;

      phoneAppViews.forEach(view => {
        view.classList.toggle('active', view.id === targetAppId);
      });
    });
  });

  // Live Smartphone Content Rendering
  function updateSmartphoneLive(me, state) {
    if (phoneClock) {
      phoneClock.textContent = state.gameClock || '11:45';
    }

    // A. EduVulcan App
    if (vulcanStudentTag) {
      vulcanStudentTag.textContent = `${me.fullName || me.name} (Klasa 2B)`;
    }
    if (vulcanAttendanceBadge) {
      vulcanAttendanceBadge.className = 'vulcan-badge ' + (me.isTardy ? 'badge-tardy' : 'badge-present');
      vulcanAttendanceBadge.textContent = me.isTardy ? '⚠️ Spóźniony' : '✅ Obecny';
    }

    const vulcanHomeworkBadge = document.getElementById('vulcanHomeworkBadge');
    const vulcanHomeworkDetails = document.getElementById('vulcanHomeworkDetails');
    if (vulcanHomeworkBadge) {
      const hasHw = me.hasHomework || (me.eduvulcan && me.eduvulcan.homeworkStatus && me.eduvulcan.homeworkStatus.includes('Odrobione'));
      if (hasHw) {
        vulcanHomeworkBadge.className = 'vulcan-badge badge-present';
        vulcanHomeworkBadge.style.background = '#27ae60';
        vulcanHomeworkBadge.textContent = '✅ Odrobione';
        if (vulcanHomeworkDetails) {
          vulcanHomeworkDetails.textContent = (me.eduvulcan && me.eduvulcan.homeworkChecked) ?
            `Status kontroli: ${me.eduvulcan.homeworkChecked}` :
            'Zadanie gotowe w zeszycie! Bezpiecznie przejdziesz kontrolę pani Halbina.';
        }
      } else {
        vulcanHomeworkBadge.className = 'vulcan-badge badge-tardy';
        vulcanHomeworkBadge.style.background = '#e74c3c';
        vulcanHomeworkBadge.textContent = '❌ Nieodrobione (Grozi 1!)';
        if (vulcanHomeworkDetails) {
          vulcanHomeworkDetails.textContent = (me.eduvulcan && me.eduvulcan.homeworkChecked) ?
            `Wynik kontroli: ${me.eduvulcan.homeworkChecked}` :
            'Zadanie domowe nieodrobione! Wciśnij [E] przy ławce z długopisem w dłoni, zanim Halbina sprawdzi zeszyty.';
        }
      }
    }

    if (vulcanGradesList) {
      const grades = (me.eduvulcan && me.eduvulcan.grades) ? me.eduvulcan.grades : [];
      if (grades.length === 0) {
        vulcanGradesList.innerHTML = '<span class="vulcan-empty">Brak ocen (Zrób zadanie w zeszycie w sali 204!)</span>';
      } else {
        vulcanGradesList.innerHTML = grades.map(g => `
          <div class="vulcan-item">
            <span>🧪 ${g.subject || 'Chemia'}: ${g.desc || 'Zadanie'}</span>
            <strong style="color:#2ecc71; font-size:1.1rem;">${g.grade || '5'}</strong>
          </div>
        `).join('');
      }
    }
    if (vulcanNotesList) {
      const notes = (me.eduvulcan && me.eduvulcan.notes) ? me.eduvulcan.notes : [];
      if (notes.length === 0) {
        vulcanNotesList.innerHTML = '<span class="vulcan-empty">Brak uwag w dzienniku. Wzorowe zachowanie!</span>';
      } else {
        vulcanNotesList.innerHTML = notes.map(n => `
          <div class="vulcan-item" style="color:#e74c3c;">
            <span>⚠️ ${n}</span>
          </div>
        `).join('');
      }
    }

    // EduVulcan Chemistry Schedule List (10 modules, 1 min each)
    const vulcanScheduleList = document.getElementById('vulcanScheduleList');
    if (vulcanScheduleList) {
      const curNum = (state.currentLesson && state.currentLesson.num) ? state.currentLesson.num : 1;
      const chemistryModules = [
        { num: 1, name: 'Budowa atomu i układ okresowy', formula: '1s² 2s² 2p⁶' },
        { num: 2, name: 'Reakcje redoks i stopnie utlenienia', formula: 'KMnO4 + HCl' },
        { num: 3, name: 'Węglowodory: alkany, alkeny i alkiny', formula: 'CnH2n+2' },
        { num: 4, name: 'Alkohole: Metanol i Etanol', formula: 'C2H5OH' },
        { num: 5, name: 'Aldehydy i ketony (Próba Tollensa)', formula: 'AgNO3 + NH3' },
        { num: 6, name: 'Kwasy karboksylowe i estryfikacja', formula: 'CH3COOH' },
        { num: 7, name: 'Polimeryzacja i tworzywa sztuczne', formula: '-(CH2-CH2)n-' },
        { num: 8, name: 'Materiały wybuchowe i nitrozwiązki', formula: 'C7H5N3O6' },
        { num: 9, name: 'Aminokwasy i wiązania peptydowe', formula: 'NH2-CH-COOH' },
        { num: 10, name: 'Powtórzenie maturalne i stężenia molowe', formula: 'Cm = n / V' }
      ];
      vulcanScheduleList.innerHTML = chemistryModules.map(m => {
        const isCurrent = (m.num === curNum);
        return `
          <div class="schedule-item ${isCurrent ? 'active' : ''}">
            <div class="schedule-item-left">
              <span class="schedule-num">Lekcja ${m.num} (Chemia)</span>
              <strong>🧪 ${m.name}</strong>
              <small>Wzór / temat: ${m.formula}</small>
            </div>
            <span class="schedule-status-badge ${isCurrent ? 'active-badge' : ''}">${isCurrent ? 'TRWA TERAZ (1 min)' : 'Zaplanowana'}</span>
          </div>
        `;
      }).join('');
    }

    // B. Bank App
    if (phoneBankBalance) {
      phoneBankBalance.textContent = `${(me.bankBalance !== undefined ? me.bankBalance : 60).toFixed(2)} PLN`;
    }

    // Populate bank recipient dropdown (other players in lobby)
    if (bankRecipientSelect) {
      const currentSelected = bankRecipientSelect.value;
      const otherStudents = (state.players || []).filter(p => p.id !== myPlayerId && p.role === 'STUDENT');
      bankRecipientSelect.innerHTML = '<option value="">Wybierz odbiorcę...</option>' + otherStudents.map(p => `
        <option value="${p.id}" ${p.id === currentSelected ? 'selected' : ''}>${p.fullName || p.name}</option>
      `).join('');
    }

  }

  // ====================================================
  // RPG QUICK HOTBAR & DEDICATED BACKPACK ([I])
  // ====================================================
  const ITEM_CATALOG = {
    notebook: { name: 'Zeszyt do chemii', icon: '📓', cat: 'Szkolny', desc: 'Służy do odrabiania zadań domowych z chemii. Zrób zadanie, zanim Halbina sprawdzi zeszyty!', usable: true },
    solved_task: { name: 'Odrobione zadanie', icon: '📓', cat: 'Szkolny', desc: 'Gotowe zadanie domowe w zeszycie! Chroni przed pałą i uwagą od pani Halbina.', usable: false },
    can_deposit: { name: 'Puszka kaucjowana (1.00 zł)', icon: '🥫', cat: 'Kaucja', desc: 'Pusta puszka aluminiowa z kodem kaucji. Wrzuć do Kaucjomatu 2000 na boisku za 1.00 PLN!', usable: false },
    bottle_deposit: { name: 'Butelka zwrotna (1.00 zł)', icon: '🍾', cat: 'Kaucja', desc: 'Szklana butelka zwrotna. Kaucjomat na boisku wypłaca za nią 1.00 PLN w gotówce!', usable: false },
    plastic_bottle_deposit: { name: 'Butelka PET (0.50 zł)', icon: '🥤', cat: 'Kaucja', desc: 'Plastikowa butelka z kaucją. Do zwrotu w Kaucjomacie za 0.50 PLN.', usable: false },
    pen: { name: 'Długopis z wkładem', icon: '🖊️', cat: 'Przybory', desc: 'Niezbędny do pisania w zeszycie i rozwiązywania zadań z chemii.', usable: false },
    vape: { name: 'E-Papieros (Vape)', icon: '💨', cat: 'Używki', desc: 'Zaciągnięcie się e-papierosem (buch). Daje chill i punkty. W sali Halbina wyczuje owocowy aromat! W trybie realistycznym nie tworzy zasłony dymnej.', usable: true },
    energy_drink: { name: 'Monster Energy', icon: '⚡', cat: 'Napój', desc: 'Daje potężny sprint (+75% prędkości) na 4 sekundy!', usable: true },
    monster: { name: 'Monster Energy', icon: '⚡', cat: 'Napój', desc: 'Daje potężny sprint (+75% prędkości) na 4 sekundy!', usable: true },
    cheat_sheet: { name: 'Ściąga z chemii', icon: '📝', cat: 'Nielegalne', desc: 'Gwarantuje poprawną odpowiedź na najbliższe pytanie z chemii.', usable: true },
    knife: { name: 'Nóż sprężynowy', icon: '🔪', cat: 'Broń biała', desc: 'Szybkie pchnięcie ostrzem. Może posłużyć do obrony lub sterroryzowania dyrektora.', usable: true },
    machete: { name: 'Bojowa Maczeta', icon: '🗡️', cat: 'Broń biała', desc: 'Ciężka stalowa maczeta. Szeroki zamach ogłusza policjantów i nauczycieli!', usable: true },
    ar15: { name: 'Karabin szturmowy AR-15', icon: '🔫', cat: 'Broń palna', desc: 'Samoczynny karabin bojowy 5.56mm. Strzela serią 3 pocisków! Wymaga Magazynka 5.56mm.', maxAmmo: 30, magType: 'mag_ar15', usable: true },
    makarov: { name: 'Pistolet Makarow (9mm)', icon: '🔫', cat: 'Broń palna', desc: 'Radziecki pistolet bojowy 9mm. Pojemność 8 naboi. Wymaga Magazynka 9mm!', maxAmmo: 8, magType: 'mag_makarov', usable: true },
    mag_ar15: { name: 'Magazynek 5.56mm (AR-15)', icon: '🗃️', cat: 'Amunicja', desc: 'Magazynek z 30 nabojami 5.56 NATO do Karabinu AR-15. Kliknij, by załadować karabin!', usable: true },
    mag_makarov: { name: 'Magazynek 9mm (Makarow)', icon: '🗃️', cat: 'Amunicja', desc: 'Magazynek stalowy z 8 nabojami 9mm do Pistoletu Makarow. Kliknij, by załadować!', usable: true },
    janitor_key: { name: 'Zardzewiały Klucz Woźnego', icon: '🗝️', cat: 'Klucze', desc: 'Ciężki żelazny klucz. Otwiera kłódkę do Schowka Woźnego.', usable: true },
    master_keycard: { name: 'Karta Główna Dyrekcji (Master)', icon: '💳', cat: 'Dostęp', desc: 'Karta magnetyczna z chipem RFID. Dostęp do Radiowęzła i gabinetów szkolnych.', usable: true },
    bolt_cutter: { name: 'Nożyce do metalu / Łom', icon: '🛠️', cat: 'Narzędzia', desc: 'Ciężkie nożyce do forsowania kłódek i krat wentylacyjnych.', usable: true },
    smoke_grenade: { name: 'Wojskowa Świeca Dymna', icon: '💨', cat: 'Taktyczne', desc: 'Potężna wojskowa świeca dymna zalewająca szkołę gęstym dymem: uruchamia ALARM POŻAROWY i ewakuację na boisko!', usable: true },
    sandwich: { name: 'Kanapka szkolna', icon: '🥪', cat: 'Jedzenie', desc: 'Świeża bułka z serem i szynką (+20 szacunku).', usable: true },
    bun: { name: 'Drożdżówka z serem', icon: '🥐', cat: 'Jedzenie', desc: 'Słodka i ciepła drożdżówka ze sklepiku u pani Basi (+15 szacunku).', usable: true },
    zapiekanka: { name: 'Ciepła Zapiekanka', icon: '🥖', cat: 'Jedzenie', desc: 'Klasyczna długa zapiekanka z pieczarkami i serem (+35 szacunku, sprint).', usable: true },
    tymbark: { name: 'Tymbark Jabłko-Mięta', icon: '🧃', cat: 'Napój', desc: 'Orzeźwiający kultowy napój. Zdejmij kapsel, aby poznać wróżbę!', usable: true },
    prince_polo: { name: 'Prince Polo XXL', icon: '🍫', cat: 'Słodycze', desc: 'Kruchy wafelek w czekoladzie. Szybki zastrzyk cukru (+15 pkt).', usable: true },
    firecracker: { name: 'Petarda Korsarz', icon: '🧨', cat: 'Pirotechnika', desc: 'Odpal i rzuć na korytarzu! Huk odwraca uwagę Halbina na 4 sekundy!', usable: true },
    coffee: { name: 'Kawa Tchibo', icon: '☕', cat: 'Napój', desc: 'Mocna parzona kawa z pokoju nauczycielskiego (+25 szacunku, resetuje stres).', usable: true },
    director_stamp: { name: 'Pieczątka Dyrektora', icon: '🔏', cat: 'Dokumenty', desc: 'Oficjalna pieczęć szkoły! Sfałszuj obecność w EduVulcan!', usable: true },
    exam_key: { name: 'Klucz odpowiedzi', icon: '📑', cat: 'Ściągi', desc: 'Wykradziony z pokoju nauczycielskiego klucz do wszystkich kartkówek!', usable: true },
    hall_pass: { name: 'Przepustka / Zwolnienie', icon: '🩺', cat: 'Dokumenty', desc: 'Zwolnienie od dyrektora na ból brzucha. Anuluje uwagi!', usable: true },
    excuse_note: { name: 'Usprawiedliwienie', icon: '📜', cat: 'Dokumenty', desc: 'Oficjalne usprawiedliwienie nieobecności od rodziców.', usable: true }
  };

  // Hotbar UI rendering
  function updateHotbarUI(inv) {
    if (!inventoryHotbar) return;
    const isClassic = (currentGameState.mode === 'classic_real');
    inventoryHotbar.style.display = (isClassic && myRole === 'STUDENT') ? 'flex' : 'none';
    if (btnOpenBackpack) {
      btnOpenBackpack.style.display = (isClassic && myRole === 'STUDENT') ? 'inline-flex' : 'none';
    }
    if (!isClassic || myRole !== 'STUDENT') return;

    const slots = inventoryHotbar.querySelectorAll('.hotbar-slot');
    slots.forEach((slot, idx) => {
      const item = inv && inv[idx];
      const slotItemEl = slot.querySelector('.slot-item');
      const isEquipped = (activeHotbarIndex === idx && item && item.id === activeEquippedItemId);
      slot.classList.toggle('selected', !!isEquipped);
      slot.classList.toggle('active', !!isEquipped);

      if (item) {
        const itemDef = ITEM_CATALOG[item.id] || { icon: '📦', name: item.name };
        const ammoInfo = (item.loadedAmmo !== undefined) ? ` [${item.loadedAmmo}/${itemDef.maxAmmo || 30}]` : '';
        slot.title = `${idx + 1}. ${item.name}${ammoInfo} (${item.quantity || 1}x)${isEquipped ? ' [TRZYMASZ W DŁONI]' : ' - Kliknij aby wyposażyć'}`;
        slotItemEl.innerHTML = `
          <span>${itemDef.icon}</span>
          ${(item.loadedAmmo !== undefined) ? `<span class="slot-qty" style="background:#e74c3c;">${item.loadedAmmo}</span>` : ((item.quantity > 1) ? `<span class="slot-qty">${item.quantity}</span>` : '')}
        `;
      } else {
        slot.title = `Slot ${idx + 1} (Pusty)`;
        slotItemEl.innerHTML = `<span class="slot-empty">—</span>`;
      }
    });
  }

  function useHotbarSlot(slotIndex) {
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (!me || !me.inventory) return;
    const item = me.inventory[slotIndex];
    if (!item) {
      // Empty slot clicked -> unequip item
      activeHotbarIndex = null;
      activeEquippedItemId = null;
      socket.emit('student_equip_item', { itemId: null });
      updateHotbarUI(me.inventory);
      tickerText.textContent = 'Schowałeś przedmiot z rąk do plecaka.';
      return;
    }

    if (activeHotbarIndex === slotIndex && activeEquippedItemId === item.id) {
      // Already equipped in hand -> use it!
      useClassicItem(item.id, lastMouseCanvasX, lastMouseCanvasY);
    } else {
      // Equip item in hand!
      activeHotbarIndex = slotIndex;
      activeEquippedItemId = item.id;
      socket.emit('student_equip_item', { itemId: item.id });
      tickerText.textContent = `✋ Trzymasz w dłoni: ${item.name}! (Wciśnij [${slotIndex + 1}] ponownie lub kliknij na ekranie, by użyć)`;
      updateHotbarUI(me.inventory);
    }
  }

  function useClassicItem(itemId, targetX, targetY) {
    if (itemId === 'notebook') {
      startChemistryTask();
      return;
    }
    if (itemId === 'vape' && soundManager && soundManager.playVapePuff) {
      soundManager.playVapePuff();
    } else if (itemId === 'smoke_grenade' && soundManager && soundManager.playSmokeDetonation) {
      soundManager.playSmokeDetonation();
    } else if ((itemId === 'energy_drink' || itemId === 'monster') && soundManager && soundManager.playDrinking) {
      soundManager.playDrinking();
    }

    const tx = (targetX !== undefined) ? targetX : (lastMouseCanvasX !== undefined ? lastMouseCanvasX : 500);
    const ty = (targetY !== undefined) ? targetY : (lastMouseCanvasY !== undefined ? lastMouseCanvasY : 300);
    socket.emit('use_classic_item', { itemId: itemId, targetX: tx, targetY: ty });
  }

  if (inventoryHotbar) {
    inventoryHotbar.querySelectorAll('.hotbar-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.dataset.slot, 10);
        useHotbarSlot(idx);
      });
    });
  }

  // Dedicated Backpack Modal Controls
  function toggleBackpack() {
    if (isBackpackOpen) {
      closeBackpack();
    } else {
      openBackpack();
    }
  }

  function openBackpack() {
    isBackpackOpen = true;
    if (modalInventory) modalInventory.style.display = 'flex';
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    const inv = (me && me.inventory) ? me.inventory : [];
    if (!selectedBackpackItemId && inv.length > 0 && inv[0]) {
      selectBackpackItem(inv[0].id);
    } else {
      renderBackpackGrid();
    }
  }

  function closeBackpack() {
    isBackpackOpen = false;
    if (modalInventory) modalInventory.style.display = 'none';
  }

  if (btnOpenBackpack) btnOpenBackpack.addEventListener('click', toggleBackpack);
  if (btnCloseBackpack) btnCloseBackpack.addEventListener('click', closeBackpack);
  if (btnCloseBackpackBottom) btnCloseBackpackBottom.addEventListener('click', closeBackpack);

  function renderBackpackGrid() {
    if (!backpackGrid) return;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    const inv = (me && me.inventory) ? me.inventory : [];

    // If selected item is no longer in inventory, clear preview
    if (selectedBackpackItemId && !inv.some(i => i && i.id === selectedBackpackItemId)) {
      selectedBackpackItemId = null;
      if (backpackItemPreview) {
        backpackItemPreview.innerHTML = `
          <div class="preview-empty-state">
            <span class="preview-empty-icon">🎒</span>
            <p>Wybierz przedmiot z plecaka, aby zobaczyć opis i akcje.</p>
          </div>
        `;
      }
      if (btnUseSelectedBackpackItem) {
        btnUseSelectedBackpackItem.disabled = true;
        btnUseSelectedBackpackItem.textContent = '⚡ UŻYJ PRZEDMIOTU';
      }
    }

    let html = '';
    for (let i = 0; i < 18; i++) {
      const item = inv[i];
      if (item) {
        const itemDef = ITEM_CATALOG[item.id] || { icon: '📦', name: item.name, cat: 'Przedmiot', desc: '' };
        const isSelected = selectedBackpackItemId === item.id;
        html += `
          <div class="backpack-slot ${isSelected ? 'selected' : ''}" data-item-id="${item.id}" data-slot-idx="${i}" title="${item.name} (Kliknij, aby wybrać)">
            <span class="backpack-slot-num">${i + 1}</span>
            <span class="backpack-slot-icon">${itemDef.icon}</span>
            <span class="backpack-slot-name">${item.name}</span>
            ${(item.quantity > 1) ? `<span class="slot-qty">${item.quantity}</span>` : ''}
          </div>
        `;
      } else {
        html += `
          <div class="backpack-slot empty" data-slot-idx="${i}" title="Pusta przegródka">
            <span class="backpack-slot-num">${i + 1}</span>
            <span class="slot-empty">—</span>
          </div>
        `;
      }
    }
    backpackGrid.innerHTML = html;

    backpackGrid.querySelectorAll('.backpack-slot:not(.empty)').forEach(slot => {
      slot.addEventListener('click', () => {
        const itemId = slot.dataset.itemId;
        selectBackpackItem(itemId);
      });
      slot.addEventListener('dblclick', () => {
        const itemId = slot.dataset.itemId;
        const itemDef = ITEM_CATALOG[itemId] || {};
        if (itemDef.usable !== false) {
          useClassicItem(itemId);
        }
      });
    });
  }

  function selectBackpackItem(itemId) {
    selectedBackpackItemId = itemId;
    const itemDef = ITEM_CATALOG[itemId] || { name: itemId, icon: '📦', cat: 'Przedmiot', desc: 'Szkolny ekwipunek.', usable: true };
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    const itemInInv = me && me.inventory && me.inventory.find(i => i.id === itemId);

    if (backpackItemPreview) {
      backpackItemPreview.innerHTML = `
        <div class="preview-item-header">
          <div class="preview-item-icon">${itemDef.icon}</div>
          <div class="preview-item-title">
            <h3>${itemDef.name}</h3>
            <span class="item-cat">${itemDef.cat}</span>
          </div>
        </div>
        <div class="preview-item-desc">${itemDef.desc}</div>
        <div class="preview-item-stats">
          📦 W plecaku: <strong>${itemInInv ? itemInInv.quantity || 1 : 1} szt.</strong>
          ${(itemInInv && (itemInInv.id === 'ar15' || itemInInv.id === 'makarov')) ? `
            <div style="margin-top:6px; color:#f1c40f; font-weight:700;">
              🔫 Amunicja w komorze: <span style="color:#2ecc71;">${itemInInv.loadedAmmo || 0} / ${itemDef.maxAmmo || 30}</span>
            </div>
            <div style="font-size:0.8rem; color:#e67e22; margin-top:2px;">
              ⚠️ Wymaga magazynka: <strong>${itemDef.magType === 'mag_ar15' ? 'Magazynek 5.56mm' : 'Magazynek 9mm'}</strong>
            </div>
          ` : ''}
        </div>
      `;
    }

    if (btnUseSelectedBackpackItem) {
      if (itemDef.usable === false) {
        btnUseSelectedBackpackItem.disabled = true;
        btnUseSelectedBackpackItem.textContent = '🔒 PRZEDMIOT PASYWNY (DO ZADAŃ)';
      } else {
        btnUseSelectedBackpackItem.disabled = false;
        if (itemInInv && (itemInInv.id === 'ar15' || itemInInv.id === 'makarov')) {
          if ((itemInInv.loadedAmmo || 0) <= 0) {
            btnUseSelectedBackpackItem.textContent = '🔄 PRZEŁADUJ BROŃ';
          } else {
            btnUseSelectedBackpackItem.textContent = '🔥 STRZAŁ W KIERUNKU KURSORA';
          }
        } else {
          btnUseSelectedBackpackItem.textContent = '⚡ UŻYJ PRZEDMIOTU';
        }
        btnUseSelectedBackpackItem.onclick = () => {
          useClassicItem(itemId, lastMouseCanvasX, lastMouseCanvasY);
        };
      }
    }

    renderBackpackGrid();
  }

  const handleItemUsed = (data) => {
    tickerText.textContent = data.message;
    if (data.quote || data.tymbarkQuote) {
      soundManager.playBell();
    } else {
      soundManager.playWhoosh();
    }
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && data.inventory) {
      me.inventory = data.inventory;
      updateHotbarUI(me.inventory);
      if (isBackpackOpen) renderBackpackGrid();
    }
  };
  socket.on('item_use_success', handleItemUsed);
  socket.on('item_used', handleItemUsed);

  // BLIK Bank Transfer Sender
  if (btnSendBankTransfer) {
    btnSendBankTransfer.addEventListener('click', () => {
      const recipientId = bankRecipientSelect ? bankRecipientSelect.value : '';
      const amount = bankAmountInput ? parseFloat(bankAmountInput.value) : 0;

      if (!recipientId) {
        if (bankTransferStatus) {
          bankTransferStatus.textContent = '❌ Wybierz odbiorcę przelewu!';
          bankTransferStatus.style.color = '#e74c3c';
        }
        return;
      }
      if (!amount || amount <= 0) {
        if (bankTransferStatus) {
          bankTransferStatus.textContent = '❌ Wpisz poprawną kwotę!';
          bankTransferStatus.style.color = '#e74c3c';
        }
        return;
      }

      socket.emit('bank_transfer', { toId: recipientId, amount: amount });
    });
  }

  socket.on('bank_transfer_result', (data) => {
    if (data.success) {
      if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
      if (bankTransferStatus) {
        bankTransferStatus.textContent = `✅ Wysłano ${data.amount.toFixed(2)} PLN do ${data.toName}!`;
        bankTransferStatus.style.color = '#2ecc71';
      }
      if (bankTxHistory) {
        const item = document.createElement('div');
        item.className = 'tx-item';
        item.innerHTML = `<span>Przelew do: ${data.toName}</span><strong class="tx-out">-${data.amount.toFixed(2)} PLN</strong>`;
        bankTxHistory.prepend(item);
      }
      tickerText.textContent = `💸 Wysłano przelew BLIK ${data.amount.toFixed(2)} PLN do ${data.toName}!`;
    } else {
      if (bankTransferStatus) {
        bankTransferStatus.textContent = `❌ ${data.message}`;
        bankTransferStatus.style.color = '#e74c3c';
      }
    }
  });

  socket.on('bank_transfer_received', (data) => {
    if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
    tickerText.textContent = `💰 Otrzymałeś przelew BLIK ${data.amount.toFixed(2)} PLN od ${data.fromName}!`;
    if (bankTxHistory) {
      const item = document.createElement('div');
      item.className = 'tx-item';
      item.innerHTML = `<span>Przelew od: ${data.fromName}</span><strong class="tx-in">+${data.amount.toFixed(2)} PLN</strong>`;
      bankTxHistory.prepend(item);
    }
  });

  // 2. DIRECTOR'S OFFICE DIALOGUE
  socket.on('director_dialogue', (data) => {
    activeDirectorData = data;
    if (modalDirector) modalDirector.style.display = 'flex';
    if (directorSpeechText) directorSpeechText.textContent = `"${data.speech || 'Co cię tu sprowadza, młody człowieku?!'}"`;

    if (btnDirectorOpt4) {
      if (data.hasWeapon) {
        btnDirectorOpt4.style.display = 'flex';
        if (btnDirectorWeaponText) {
          btnDirectorWeaponText.textContent = `🔪 [BROŃ] Wyciągnij ${data.weaponName || 'broń'} i sterroryzuj dyrektora! (+300 PLN z sejfu)`;
        }
      } else {
        btnDirectorOpt4.style.display = 'none';
      }
    }
  });

  function chooseDirectorOption(option) {
    socket.emit('director_choose_option', { option: option });
    closeDirectorDialog();
  }

  function closeDirectorDialog() {
    if (modalDirector) modalDirector.style.display = 'none';
    activeDirectorData = null;
  }

  if (btnDirectorOpt1) btnDirectorOpt1.addEventListener('click', () => chooseDirectorOption(1));
  if (btnDirectorOpt2) btnDirectorOpt2.addEventListener('click', () => chooseDirectorOption(2));
  if (btnDirectorOpt3) btnDirectorOpt3.addEventListener('click', () => chooseDirectorOption(3));
  if (btnDirectorOpt4) btnDirectorOpt4.addEventListener('click', () => chooseDirectorOption(4));
  if (btnDirectorOpt5) btnDirectorOpt5.addEventListener('click', () => chooseDirectorOption(5));
  if (btnDirectorOpt6) btnDirectorOpt6.addEventListener('click', () => chooseDirectorOption(6));
  if (btnDirectorOpt7) btnDirectorOpt7.addEventListener('click', () => chooseDirectorOption(7));
  if (btnDirectorOpt8) btnDirectorOpt8.addEventListener('click', () => chooseDirectorOption(8));
  if (btnDirectorOpt9) btnDirectorOpt9.addEventListener('click', () => chooseDirectorOption(9));
  if (btnCloseDirector) btnCloseDirector.addEventListener('click', closeDirectorDialog);

  socket.on('director_result', (data) => {
    tickerText.textContent = data.message;
    if (data.option === 4 || data.robbed || data.option === 6) {
      if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
      const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
      if (me && data.newBalance !== undefined) {
        me.bankBalance = data.newBalance;
        if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
      }
    }
  });

  // 3.5. SZKOLNY SKLEPIK / BUFET U PANI BASI
  socket.on('buffet_shop_data', (data) => {
    activeBuffetData = data;
    if (modalBuffetShop) modalBuffetShop.style.display = 'flex';
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    const curWallet = (data.wallet !== undefined ? data.wallet : (me ? me.bankBalance : 0)) || 0;
    if (buffetWalletDisplay) buffetWalletDisplay.textContent = `${curWallet.toFixed(2)} PLN`;

    const itemsList = data.items || data.stock || [];
    if (buffetItemsContainer) {
      buffetItemsContainer.innerHTML = itemsList.map(item => `
        <div class="buffet-item-card">
          <div class="buffet-item-info">
            <span class="buffet-item-icon">${item.icon || '🥪'}</span>
            <div class="buffet-item-details">
              <strong>${item.name}</strong>
              <small>${item.desc || ''}</small>
            </div>
          </div>
          <div class="buffet-item-buy">
            <span class="buffet-item-price">${(item.price || 0).toFixed(2)} PLN</span>
            <button class="btn-buy-buffet" data-item-id="${item.id}" ${(curWallet < item.price) ? 'disabled' : ''}>Kup</button>
          </div>
        </div>
      `).join('');

      buffetItemsContainer.querySelectorAll('.btn-buy-buffet').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.dataset.itemId;
          socket.emit('buffet_buy_item', { itemId: itemId });
        });
      });
    }
  });

  socket.on('buffet_buy_success', (data) => {
    if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
    tickerText.textContent = `🥪 Kupiłeś u pani Basi: ${data.itemName}! (${data.message})`;
    if (buffetWalletDisplay && data.wallet !== undefined) {
      buffetWalletDisplay.textContent = `${data.wallet.toFixed(2)} PLN`;
    }
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (data.wallet !== undefined) me.bankBalance = data.wallet;
      if (data.inventory) {
        me.inventory = data.inventory;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }
    if (activeBuffetData && data.wallet !== undefined) {
      activeBuffetData.wallet = data.wallet;
      if (buffetItemsContainer) {
        const stockList = activeBuffetData.items || activeBuffetData.stock || [];
        buffetItemsContainer.querySelectorAll('.btn-buy-buffet').forEach(btn => {
          const it = stockList.find(i => i.id === btn.dataset.itemId);
          if (it) {
            btn.disabled = (data.wallet < it.price);
          }
        });
      }
    }
  });

  if (btnCloseBuffetShop) {
    btnCloseBuffetShop.addEventListener('click', () => {
      if (modalBuffetShop) modalBuffetShop.style.display = 'none';
      activeBuffetData = null;
    });
  }

  // 3.6. POKÓJ NAUCZYCIELSKI
  function openStaffRoomModal() {
    if (modalStaffRoom) modalStaffRoom.style.display = 'flex';
    if (staffRoomStatusMsg) staffRoomStatusMsg.style.display = 'none';
  }

  if (btnCloseStaffRoom) {
    btnCloseStaffRoom.addEventListener('click', () => {
      if (modalStaffRoom) modalStaffRoom.style.display = 'none';
    });
  }

  if (btnStaffBrewCoffee) {
    btnStaffBrewCoffee.addEventListener('click', () => {
      socket.emit('staff_room_action', { action: 'brew_coffee' });
    });
  }
  if (btnStaffStealExam) {
    btnStaffStealExam.addEventListener('click', () => {
      socket.emit('staff_room_action', { action: 'steal_exam_key' });
    });
  }
  if (btnStaffChat) {
    btnStaffChat.addEventListener('click', () => {
      socket.emit('staff_room_action', { action: 'chat_teachers' });
    });
  }

  socket.on('staff_room_action_result', (data) => {
    tickerText.textContent = data.message;
    if (soundManager && soundManager.playWhoosh) soundManager.playWhoosh();
    if (staffRoomStatusMsg) {
      staffRoomStatusMsg.style.display = 'block';
      staffRoomStatusMsg.textContent = data.message;
      staffRoomStatusMsg.style.color = data.success ? '#2ecc71' : '#e74c3c';
    }
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && data.inventory) {
      me.inventory = data.inventory;
      updateHotbarUI(me.inventory);
      if (isBackpackOpen) renderBackpackGrid();
    }
  });

  // 3.7. TEACHER KATARZYNA HALBINA EXPANDED EVENT CONTROLS
  if (btnTeacherRollCall) {
    btnTeacherRollCall.addEventListener('click', () => {
      socket.emit('teacher_roll_call');
    });
  }
  if (btnTeacherConfiscate) {
    btnTeacherConfiscate.addEventListener('click', () => {
      socket.emit('teacher_confiscate');
    });
  }
  if (btnTeacherChalk) {
    btnTeacherChalk.addEventListener('click', () => {
      socket.emit('teacher_throw_chalk', { targetX: lastMouseCanvasX, targetY: lastMouseCanvasY });
    });
  }
  if (btnTeacherSlamDesk) {
    btnTeacherSlamDesk.addEventListener('click', () => {
      socket.emit('teacher_slam_desk');
    });
  }
  if (btnTeacherCallDirector) {
    btnTeacherCallDirector.addEventListener('click', () => {
      socket.emit('teacher_call_director');
    });
  }

  // 3. SHADY DEALER SHOP (SZKOLNY KIBEL)
  socket.on('dealer_shop_data', (data) => {
    activeDealerData = data;
    if (modalDealerShop) modalDealerShop.style.display = 'flex';
    if (dealerWalletDisplay) dealerWalletDisplay.textContent = `${(data.wallet || 0).toFixed(2)} PLN`;

    renderDealerBuyList(data.stock || [], data.wallet || 0);
    renderDealerSellList(data.playerInventory || []);
  });

  function renderDealerBuyList(stock, wallet) {
    if (!dealerBuyContent) return;
    const itemIcons = {
      pen: '🖊️',
      vape: '💨',
      cheat_sheet: '📝',
      monster: '⚡',
      knife: '🔪',
      machete: '🗡️',
      ar15: '🔥'
    };

    dealerBuyContent.innerHTML = stock.map(item => `
      <div class="dealer-item-card">
        <div class="dealer-item-info">
          <span class="dealer-item-icon">${itemIcons[item.id] || '📦'}</span>
          <div class="dealer-item-text">
            <strong>${item.name}</strong>
            <small>${item.desc || ''}</small>
          </div>
        </div>
        <button class="dealer-buy-btn" data-item-id="${item.id}" ${wallet < item.price ? 'disabled' : ''}>
          Kup za ${item.price.toFixed(2)} PLN
        </button>
      </div>
    `).join('');

    dealerBuyContent.querySelectorAll('.dealer-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.itemId;
        socket.emit('dealer_buy_item', { itemId: itemId });
      });
    });
  }

  function renderDealerSellList(playerInventory) {
    if (!dealerSellContent) return;
    const sellPrices = {
      solved_task: 35,
      notebook_solved: 35,
      notebook: 5,
      vape: 20,
      knife: 45,
      machete: 90,
      ar15: 350,
      energy_drink: 8,
      monster: 8,
      cheat_sheet: 15,
      pen: 5
    };
    const itemIcons = {
      solved_task: '🧪',
      notebook_solved: '🧪',
      notebook: '📓',
      vape: '💨',
      knife: '🔪',
      machete: '🗡️',
      ar15: '🔫',
      energy_drink: '⚡',
      monster: '⚡',
      cheat_sheet: '📝',
      pen: '🖊️'
    };

    const inv = playerInventory || [];
    const sellable = inv.filter(item => {
      const price = item.sellPrice !== undefined ? item.sellPrice : sellPrices[item.id];
      return price !== undefined && price > 0;
    });

    if (sellable.length === 0) {
      dealerSellContent.innerHTML = '<span class="vulcan-empty">Brak przedmiotów do opchnięcia dilerowi.<br><small>(Rozwiąż zadanie w zeszycie w sali 204, przeszukaj szafki na korytarzu lub kup fanty!)</small></span>';
      return;
    }

    dealerSellContent.innerHTML = sellable.map(item => {
      const price = item.sellPrice !== undefined ? item.sellPrice : (sellPrices[item.id] || 10);
      const qty = item.quantity || 1;
      const icon = itemIcons[item.id] || item.icon || '📦';
      return `
        <div class="dealer-item-card">
          <div class="dealer-item-info">
            <span class="dealer-item-icon">${icon}</span>
            <div class="dealer-item-text">
              <strong>${item.name} ${qty > 1 ? `(x${qty})` : ''}</strong>
              <small>Cena skupu: ${price.toFixed(2)} PLN</small>
            </div>
          </div>
          <button class="dealer-sell-btn" data-item-id="${item.id}">
            Sprzedaj za ${price.toFixed(2)} PLN
          </button>
        </div>
      `;
    }).join('');

    dealerSellContent.querySelectorAll('.dealer-sell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.itemId;
        socket.emit('dealer_sell_item', { itemId: itemId });
      });
    });
  }

  // Dealer tab switching (Buy vs Sell)
  if (tabDealerBuy && tabDealerSell) {
    tabDealerBuy.addEventListener('click', () => {
      tabDealerBuy.classList.add('active');
      tabDealerSell.classList.remove('active');
      if (dealerBuyContent) dealerBuyContent.style.display = 'flex';
      if (dealerSellContent) dealerSellContent.style.display = 'none';
    });
    tabDealerSell.addEventListener('click', () => {
      tabDealerSell.classList.add('active');
      tabDealerBuy.classList.remove('active');
      if (dealerBuyContent) dealerBuyContent.style.display = 'none';
      if (dealerSellContent) dealerSellContent.style.display = 'flex';
    });
  }

  function closeDealerShop() {
    if (modalDealerShop) modalDealerShop.style.display = 'none';
    activeDealerData = null;
  }
  if (btnCloseDealerShop) btnCloseDealerShop.addEventListener('click', closeDealerShop);

  socket.on('dealer_purchase_success', (data) => {
    if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
    tickerText.textContent = `🛒 ${data.message || `Kupiłeś: ${data.itemName}!`}`;
    const newBal = (data.wallet !== undefined ? data.wallet : data.newBalance);
    if (dealerWalletDisplay && newBal !== undefined) dealerWalletDisplay.textContent = `${newBal.toFixed(2)} PLN`;

    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (newBal !== undefined) me.bankBalance = newBal;
      if (data.inventory || data.playerInventory) {
        me.inventory = data.inventory || data.playerInventory;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }

    if (activeDealerData) {
      if (newBal !== undefined) activeDealerData.wallet = newBal;
      activeDealerData.playerInventory = data.inventory || data.playerInventory || (me ? me.inventory : []);
      renderDealerBuyList(activeDealerData.stock || [], activeDealerData.wallet);
      renderDealerSellList(activeDealerData.playerInventory);
    }
  });

  socket.on('dealer_sell_success', (data) => {
    if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
    tickerText.textContent = `💰 ${data.message || `Sprzedałeś: ${data.itemName} za +${data.earned} PLN!`}`;
    const newBal = (data.wallet !== undefined ? data.wallet : data.newBalance);
    if (dealerWalletDisplay && newBal !== undefined) dealerWalletDisplay.textContent = `${newBal.toFixed(2)} PLN`;

    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (newBal !== undefined) me.bankBalance = newBal;
      if (data.inventory || data.playerInventory) {
        me.inventory = data.inventory || data.playerInventory;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }

    if (activeDealerData) {
      if (newBal !== undefined) activeDealerData.wallet = newBal;
      activeDealerData.playerInventory = data.inventory || data.playerInventory || (me ? me.inventory : []);
      renderDealerBuyList(activeDealerData.stock || [], activeDealerData.wallet);
      renderDealerSellList(activeDealerData.playerInventory);
    }
  });

  // 4. HALBINA TARDY DECISION PROMPT
  socket.on('halbina_tardy_prompt', (data) => {
    if (myRole === 'TEACHER') {
      activeTardyPromptData = data;
      if (modalHalbinaTardy) modalHalbinaTardy.style.display = 'flex';
      if (tardyStudentName) tardyStudentName.textContent = data.studentName;
    }
  });

  function decideTardyOption(choice) {
    if (activeTardyPromptData) {
      socket.emit('halbina_decide_tardy', {
        studentId: activeTardyPromptData.studentId,
        choice: choice
      });
      if (modalHalbinaTardy) modalHalbinaTardy.style.display = 'none';
      activeTardyPromptData = null;
    }
  }

  if (btnTardyOption1) btnTardyOption1.addEventListener('click', () => decideTardyOption(1));
  if (btnTardyOption2) btnTardyOption2.addEventListener('click', () => decideTardyOption(2));
  if (btnTardyOption3) btnTardyOption3.addEventListener('click', () => decideTardyOption(3));

  socket.on('tardy_decision_result', (data) => {
    tickerText.textContent = data.message;
  });

  // 5. CHEMISTRY NOTEBOOK EXERCISE (SALA 204)
  function startChemistryTask() {
    socket.emit('start_chemistry_task');
  }

  socket.on('chemistry_task_started', (data) => {
    activeChemTaskData = data;
    if (modalChemistryExercise) modalChemistryExercise.style.display = 'flex';
    if (chemTaskPrompt) chemTaskPrompt.textContent = data.task.question;

    if (chemPenWarning) {
      chemPenWarning.style.display = data.hasPen ? 'none' : 'block';
    }

    if (chemTaskOptionsGrid) {
      chemTaskOptionsGrid.innerHTML = data.task.options.map((opt, idx) => `
        <button class="chem-opt-btn" data-opt-idx="${idx}" ${!data.hasPen ? 'disabled' : ''}>
          ${String.fromCharCode(65 + idx)}. ${opt}
        </button>
      `).join('');

      chemTaskOptionsGrid.querySelectorAll('.chem-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.optIdx, 10);
          socket.emit('submit_chemistry_task', {
            taskId: data.task.id,
            answerIndex: idx
          });
          closeChemistryTask();
        });
      });
    }
  });

  function closeChemistryTask() {
    if (modalChemistryExercise) modalChemistryExercise.style.display = 'none';
    activeChemTaskData = null;
  }
  if (btnCloseChemTask) btnCloseChemTask.addEventListener('click', closeChemistryTask);

  socket.on('chemistry_task_result', (data) => {
    if (data.success) {
      if (soundManager && soundManager.playHomeworkCheck) soundManager.playHomeworkCheck();
      tickerText.textContent = `📓 ${data.message || 'Zadanie domowe z chemii odrobione w zeszycie! (Ocena 5 w EduVulcan)'}`;
      const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
      if (me) {
        me.hasHomework = true;
        if (data.newBalance !== undefined) me.bankBalance = data.newBalance;
        if (data.inventory) {
          me.inventory = data.inventory;
          updateHotbarUI(me.inventory);
          if (isBackpackOpen) renderBackpackGrid();
        }
        if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
      }
    } else {
      tickerText.textContent = `❌ ${data.message || 'Błędna odpowiedź na zadanie z chemii!'}`;
      const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
      if (me) {
        me.hasHomework = false;
        if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
      }
    }
  });

  // 5.5. ALARM POŻAROWY & WYJAŚNIENIA HALBINA U DYREKTORA
  socket.on('fire_alarm_evacuation', (data) => {
    if (soundManager && soundManager.playFireAlarmSiren) soundManager.playFireAlarmSiren();
    if (fireAlarmBanner) fireAlarmBanner.style.display = 'flex';
    tickerText.textContent = `🚨 ${data.message || 'ALARM POŻAROWY W SZKOLE! Wszyscy na zbiórkę na boisko szkolne!'}`;
  });

  socket.on('fire_alarm_ended', (data) => {
    if (fireAlarmBanner) fireAlarmBanner.style.display = 'none';
    tickerText.textContent = `🧯 ${data.message || 'Alarm pożarowy odwołany. Ewakuacja zakończona.'}`;
  });

  socket.on('halbina_fire_alarm_interrogation', (data) => {
    if (myRole === 'TEACHER') {
      if (modalHalbinaSmokeExplain) modalHalbinaSmokeExplain.style.display = 'flex';
      if (soundManager && soundManager.playFireAlarmSiren) soundManager.playFireAlarmSiren();
    }
  });

  socket.on('halbina_fire_alarm_resolved', (data) => {
    if (modalHalbinaSmokeExplain) modalHalbinaSmokeExplain.style.display = 'none';
    tickerText.textContent = `👨‍💼 Dyrektor Janusz: ${data.message}`;
  });

  function explainSmokeOption(choice) {
    socket.emit('halbina_explain_fire_alarm', { choice: choice });
    if (modalHalbinaSmokeExplain) modalHalbinaSmokeExplain.style.display = 'none';
  }

  if (btnSmokeChoice1) btnSmokeChoice1.addEventListener('click', () => explainSmokeOption(1));
  if (btnSmokeChoice2) btnSmokeChoice2.addEventListener('click', () => explainSmokeOption(2));
  if (btnSmokeChoice3) btnSmokeChoice3.addEventListener('click', () => explainSmokeOption(3));

  // 6. ZONE TRANSITIONS & CLASSIC ENVIRONMENT SOCKET EVENTS
  socket.on('zone_changed', (data) => {
    posX = data.x;
    posY = data.y;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      me.currentZone = data.currentZone;
      me.x = data.x;
      me.y = data.y;
    }
    if (myRole === 'TEACHER' && currentGameState && currentGameState.teacher) {
      currentGameState.teacher.currentZone = data.currentZone;
      currentGameState.teacher.x = data.x;
      currentGameState.teacher.y = data.y;
      playerFacingAngle = (data.currentZone === 'CHEMISTRY' && data.y < 200) ? Math.PI / 2 : playerFacingAngle;
      currentGameState.teacher.angle = playerFacingAngle;
    }
    if (soundManager && soundManager.playDoor) soundManager.playDoor();
    tickerText.textContent = data.message;
  });

  socket.on('locker_loot', (data) => {
    if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (data.bankBalance !== undefined) me.bankBalance = data.bankBalance;
      if (data.inventory) {
        me.inventory = data.inventory;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }
  });

  socket.on('bell_rung', (data) => {
    soundManager.playBell();
    tickerText.textContent = data.message || '🔔 DZWONEK NA LEKCJĘ! Wszyscy mają być w Sali 204!';
  });

  socket.on('directive_go_to_director', (data) => {
    soundManager.playBusted();
    tickerText.textContent = `🚨 ${data.message}`;
  });

  socket.on('director_event', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('action_failed', (data) => {
    tickerText.textContent = `⚠️ ${data.message}`;
    if (soundManager && soundManager.playWhoosh) soundManager.playWhoosh();
  });

  // ====================================================
  // SZKOLNY RADIOWĘZEŁ & MONITORING MODAL CONTROLS
  // ====================================================
  const modalRadiowezel = document.getElementById('modalRadiowezel');
  const btnRadiowezelFireAlarm = document.getElementById('btnRadiowezelFireAlarm');
  const btnRadiowezelSummonTeacher = document.getElementById('btnRadiowezelSummonTeacher');
  const btnRadiowezelHardbass = document.getElementById('btnRadiowezelHardbass');
  const btnRadiowezelClearCCTV = document.getElementById('btnRadiowezelClearCCTV');
  const btnCloseRadiowezel = document.getElementById('btnCloseRadiowezel');
  const btnTeacherStoryInspection = document.getElementById('btnTeacherStoryInspection');
  const btnTeacherStoryPolice = document.getElementById('btnTeacherStoryPolice');

  function openRadiowezelModal() {
    if (modalRadiowezel) modalRadiowezel.style.display = 'flex';
  }

  function closeRadiowezelModal() {
    if (modalRadiowezel) modalRadiowezel.style.display = 'none';
  }

  if (btnCloseRadiowezel) btnCloseRadiowezel.addEventListener('click', closeRadiowezelModal);

  if (btnRadiowezelFireAlarm) {
    btnRadiowezelFireAlarm.addEventListener('click', () => {
      socket.emit('server_room_broadcast', { broadcastType: 'FIRE_ALARM' });
      closeRadiowezelModal();
    });
  }

  if (btnRadiowezelSummonTeacher) {
    btnRadiowezelSummonTeacher.addEventListener('click', () => {
      socket.emit('server_room_broadcast', { broadcastType: 'SUMMON_TEACHER' });
      closeRadiowezelModal();
    });
  }

  if (btnRadiowezelHardbass) {
    btnRadiowezelHardbass.addEventListener('click', () => {
      socket.emit('server_room_broadcast', { broadcastType: 'HARDBASS' });
      closeRadiowezelModal();
    });
  }

  if (btnRadiowezelClearCCTV) {
    btnRadiowezelClearCCTV.addEventListener('click', () => {
      socket.emit('server_room_clear_cctv');
      closeRadiowezelModal();
    });
  }

  // Teacher Storyline Triggers
  if (btnTeacherStoryInspection) {
    btnTeacherStoryInspection.addEventListener('click', () => {
      socket.emit('trigger_storyline', { arcType: 'INSPECTION' });
    });
  }

  if (btnTeacherStoryPolice) {
    btnTeacherStoryPolice.addEventListener('click', () => {
      socket.emit('trigger_storyline', { arcType: 'POLICE_RAID' });
    });
  }

  // ====================================================
  // WEAPONS, BALLISTICS & SECRET ROOM SOCKET LISTENERS
  // ====================================================
  socket.on('weapon_fired', (data) => {
    tickerText.textContent = data.message;
    if (data.itemId === 'ar15') {
      if (soundManager && soundManager.playGunshotAR15) soundManager.playGunshotAR15();
    } else if (data.itemId === 'makarov') {
      if (soundManager && soundManager.playGunshotMakarov) soundManager.playGunshotMakarov();
    } else {
      if (soundManager && soundManager.playWhoosh) soundManager.playWhoosh();
    }

    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && me.id === data.playerId && me.inventory) {
      const weapon = me.inventory.find(i => i.id === data.itemId);
      if (weapon) {
        weapon.loadedAmmo = data.loadedAmmo;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
    }
  });

  socket.on('weapon_reloaded', (data) => {
    if (soundManager && soundManager.playReload) soundManager.playReload();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && me.id === data.playerId && me.inventory) {
      const weapon = me.inventory.find(i => i.id === data.itemId);
      if (weapon) {
        weapon.loadedAmmo = data.loadedAmmo;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
    }
  });

  socket.on('weapon_dry_fire', (data) => {
    if (soundManager && soundManager.playDryFire) soundManager.playDryFire();
    tickerText.textContent = data.message;
  });

  socket.on('weapon_melee_swing', (data) => {
    if (soundManager && soundManager.playWhoosh) soundManager.playWhoosh();
    tickerText.textContent = data.message;
  });

  socket.on('smoke_grenade_detonated', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('door_locked', (data) => {
    if (soundManager && soundManager.playDryFire) soundManager.playDryFire();
    tickerText.textContent = data.message;
  });

  socket.on('school_blackout', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('school_power_restored', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('pa_broadcast_triggered', (data) => {
    if (soundManager && soundManager.playPAChime) soundManager.playPAChime();
    tickerText.textContent = data.message;
  });

  socket.on('cctv_logs_cleared', (data) => {
    if (soundManager && soundManager.playBell) soundManager.playBell();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      me.uwagi = 0;
      if (me.eduvulcan) {
        me.eduvulcan.notes = [];
        me.eduvulcan.uwagi = [];
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }
  });

  socket.on('janitor_chest_loot', (data) => {
    if (soundManager && soundManager.playDoorUnlock) soundManager.playDoorUnlock();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (data.bankBalance !== undefined) me.bankBalance = data.bankBalance;
      if (data.inventory) {
        me.inventory = data.inventory;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }
  });

  socket.on('janitor_keycard_taken', (data) => {
    if (soundManager && soundManager.playDoorUnlock) soundManager.playDoorUnlock();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && data.inventory) {
      me.inventory = data.inventory;
      updateHotbarUI(me.inventory);
      if (isBackpackOpen) renderBackpackGrid();
    }
  });

  socket.on('chem_lab_synth_result', (data) => {
    if (soundManager && soundManager.playBell) soundManager.playBell();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && data.inventory) {
      me.inventory = data.inventory;
      updateHotbarUI(me.inventory);
      if (isBackpackOpen) renderBackpackGrid();
    }
  });

  socket.on('storyline_stage_changed', (storyline) => {
    if (storyline && storyline.active) {
      if (soundManager && soundManager.playBell) soundManager.playBell();
      tickerText.textContent = `📜 [WĄTEK FABULARNY: ETAP ${storyline.stage}] ${storyline.title}: ${storyline.desc}`;
    } else if (storyline && storyline.message) {
      tickerText.textContent = `📜 ${storyline.message}`;
    }
  });

  // Outdoor Field Tasks & Homework Check Listeners
  const btnTeacherCheckHomework = document.getElementById('btnTeacherCheckHomework');
  if (btnTeacherCheckHomework) {
    btnTeacherCheckHomework.addEventListener('click', () => {
      socket.emit('teacher_check_homework');
    });
  }

  socket.on('deposit_picked_up', (data) => {
    if (soundManager && soundManager.playCanPickup) soundManager.playCanPickup();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && data.inventory) {
      me.inventory = data.inventory;
      updateHotbarUI(me.inventory);
      if (isBackpackOpen) renderBackpackGrid();
    }
  });

  socket.on('courtyard_deposits_updated', (data) => {
    if (currentGameState) {
      currentGameState.courtyardDeposits = data.deposits;
    }
  });

  socket.on('kaucjomat_result', (data) => {
    if (data.success) {
      if (soundManager && soundManager.playKaucjomatChime) soundManager.playKaucjomatChime();
      const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
      if (me) {
        if (data.newBalance !== undefined) me.bankBalance = data.newBalance;
        if (data.inventory) {
          me.inventory = data.inventory;
          updateHotbarUI(me.inventory);
          if (isBackpackOpen) renderBackpackGrid();
        }
        if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
      }
    }
    tickerText.textContent = data.message;
  });

  socket.on('kaucjomat_broadcast', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('wozny_rake_result', (data) => {
    if (data.success) {
      if (soundManager && soundManager.playCoins) soundManager.playCoins();
      const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
      if (me) {
        if (data.newBalance !== undefined) me.bankBalance = data.newBalance;
        if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
      }
    }
    tickerText.textContent = data.message;
  });

  socket.on('basketball_result', (data) => {
    if (data.won) {
      if (soundManager && soundManager.playBasketballSwish) soundManager.playBasketballSwish();
    }
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (data.newBalance !== undefined) me.bankBalance = data.newBalance;
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }
    tickerText.textContent = data.message;
  });

  socket.on('basketball_shot_event', (data) => {
    tickerText.textContent = data.success ?
      `🏀 ${data.shooter} trafił piękny rzut za 3 punkty!` :
      `🏀 ${data.shooter} spudłował rzut do kosza.`;
  });

  socket.on('trash_search_result', (data) => {
    if (soundManager && soundManager.playCanPickup) soundManager.playCanPickup();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me) {
      if (data.newBalance !== undefined) me.bankBalance = data.newBalance;
      if (data.inventory) {
        me.inventory = data.inventory;
        updateHotbarUI(me.inventory);
        if (isBackpackOpen) renderBackpackGrid();
      }
      if (isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
    }
  });

  socket.on('teacher_check_homework_result', (data) => {
    if (soundManager && soundManager.playHomeworkCheck) soundManager.playHomeworkCheck();
    tickerText.textContent = data.message;
    const me = currentGameState.players && currentGameState.players.find(p => p.id === myPlayerId);
    if (me && isSmartphoneOpen) updateSmartphoneLive(me, currentGameState);
  });

  socket.on('classic_bell_rung', (data) => {
    if (soundManager && soundManager.playBell) soundManager.playBell();
    tickerText.textContent = `🔔 ${data.message || 'Dzwonek zabrzmiał! Zmiana modułu chemii!'}`;
  });

  socket.on('evacuation_bonus_awarded', (data) => {
    if (soundManager && soundManager.playMoneyChime) soundManager.playMoneyChime();
    tickerText.textContent = `🚨 ${data.message || 'Wzorowa ewakuacja pożarowa na boisko szkolne!'}`;
  });

  socket.on('dealer_arrived', (data) => {
    tickerText.textContent = `🧅 ${data.message || 'Diler pojawił się w toalecie (Kabina 2)!'}`;
  });

  socket.on('dealer_departed', (data) => {
    tickerText.textContent = `🚪 ${data.message || 'Diler opuścił szkołę przez okno w toalecie!'}`;
  });

  socket.on('firecracker_lit', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('firecracker_exploded', (data) => {
    if (soundManager && soundManager.playSmokeDetonation) soundManager.playSmokeDetonation();
    tickerText.textContent = data.message;
  });

  socket.on('teacher_slammed_desk', (data) => {
    if (soundManager && soundManager.playDeskSlam) soundManager.playDeskSlam();
    tickerText.textContent = `📏 ${data.message}`;
  });

  socket.on('teacher_chalk_thrown', (data) => {
    if (soundManager && soundManager.playWhoosh) soundManager.playWhoosh();
    tickerText.textContent = `🖍️ ${data.message}`;
  });

  socket.on('teacher_coffee_drunk', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('teacher_roll_call_result', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('teacher_confiscate_result', (data) => {
    tickerText.textContent = data.message;
  });

  socket.on('cop_shot_down', (data) => {
    if (soundManager && soundManager.playCopScream) soundManager.playCopScream();
    tickerText.textContent = data.message;
  });

  socket.on('director_visit_started', (data) => {
    tickerText.textContent = `👨‍💼 ${data.message}`;
  });

  socket.on('director_visit_ended', (data) => {
    tickerText.textContent = `👨‍💼 ${data.message}`;
  });

  // ==========================================
  // ADMIN SYSTEM (PASSWORD: niger22)
  // ==========================================
  const adminSecretTrigger = document.getElementById('adminSecretTrigger');
  const btnOpenAdminAuth = document.getElementById('btnOpenAdminAuth');
  const adminAuthModal = document.getElementById('adminAuthModal');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const btnSubmitAdminPass = document.getElementById('btnSubmitAdminPass');
  const btnCloseAdminAuth = document.getElementById('btnCloseAdminAuth');
  const adminAuthError = document.getElementById('adminAuthError');
  const adminAuthForm = document.getElementById('adminAuthForm');

  const adminDashboardModal = document.getElementById('adminDashboardModal');
  const btnCloseAdminDash = document.getElementById('btnCloseAdminDash');
  const btnLogoutAdmin = document.getElementById('btnLogoutAdmin');
  const adminToggleGodMode = document.getElementById('adminToggleGodMode');
  const adminToggleNoclip = document.getElementById('adminToggleNoclip');
  const adminLastActionStatus = document.getElementById('adminLastActionStatus');
  const adminTeacherSayText = document.getElementById('adminTeacherSayText');
  const btnAdminTeacherSay = document.getElementById('btnAdminTeacherSay');
  const adminPaText = document.getElementById('adminPaText');
  const btnAdminPaBroadcast = document.getElementById('btnAdminPaBroadcast');

  function openAdminAuth() {
    if (adminState.isAdmin) {
      openAdminDashboard();
      return;
    }
    if (adminAuthModal) {
      adminAuthModal.style.display = 'flex';
      if (adminAuthError) adminAuthError.style.display = 'none';
      if (adminPasswordInput) {
        adminPasswordInput.value = '';
        setTimeout(() => adminPasswordInput.focus(), 60);
      }
    }
  }

  function closeAdminAuth() {
    if (adminAuthModal) adminAuthModal.style.display = 'none';
  }

  function openAdminDashboard() {
    if (!adminState.isAdmin) {
      openAdminAuth();
      return;
    }
    if (adminDashboardModal) {
      adminDashboardModal.style.display = 'flex';
      if (adminLastActionStatus) {
        adminLastActionStatus.textContent = '🟢 Zalogowano jako administrator [niger22]. Wybierz akcję.';
      }
    }
  }

  function closeAdminDashboard() {
    if (adminDashboardModal) adminDashboardModal.style.display = 'none';
  }

  function toggleAdminDashboard() {
    if (!adminState.isAdmin) {
      openAdminAuth();
      return;
    }
    if (adminDashboardModal && adminDashboardModal.style.display !== 'none') {
      closeAdminDashboard();
    } else {
      openAdminDashboard();
    }
  }

  function submitAdminLogin() {
    if (!adminPasswordInput) return;
    const pass = adminPasswordInput.value.trim();
    if (!pass) return;

    socket.emit('admin_login', { password: pass }, (res) => {
      if (res && res.success) {
        adminState.isAdmin = true;
        try { sessionStorage.setItem('halbina_admin_auth', 'niger22'); } catch(e){}
        if (adminSecretTrigger) adminSecretTrigger.classList.add('logged-in');
        closeAdminAuth();
        openAdminDashboard();
        tickerText.textContent = '🛡️ [ADMIN] Autoryzacja udana! Panel kontrolny aktywny [F2].';
        if (soundManager && soundManager.playBell) soundManager.playBell();
      } else {
        if (adminAuthError) {
          adminAuthError.style.display = 'block';
          adminAuthError.textContent = res ? res.message : '❌ Błędne hasło!';
        }
        if (soundManager && soundManager.playDryFire) soundManager.playDryFire();
      }
    });
  }

  function sendAdminAction(command, args) {
    if (!adminState.isAdmin) {
      openAdminAuth();
      return;
    }
    socket.emit('admin_action', { command, args: args || {} }, (res) => {
      if (res) {
        if (adminLastActionStatus) {
          adminLastActionStatus.textContent = res.message || 'Polecenie wykonane.';
        }
        tickerText.textContent = res.message || 'Polecenie administratora wykonane.';
        if (res.success && soundManager && soundManager.playWhoosh) {
          soundManager.playWhoosh();
        }
      }
    });
  }

  // Restore session if previously authenticated
  try {
    if (sessionStorage.getItem('halbina_admin_auth') === 'niger22') {
      socket.emit('admin_login', { password: 'niger22' }, (res) => {
        if (res && res.success) {
          adminState.isAdmin = true;
          if (adminSecretTrigger) adminSecretTrigger.classList.add('logged-in');
        }
      });
    }
  } catch(e){}

  if (btnOpenAdminAuth) {
    btnOpenAdminAuth.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAdminDashboard();
    });
  }

  if (btnCloseAdminAuth) {
    btnCloseAdminAuth.addEventListener('click', closeAdminAuth);
  }

  if (btnSubmitAdminPass) {
    btnSubmitAdminPass.addEventListener('click', (e) => {
      e.preventDefault();
      submitAdminLogin();
    });
  }

  if (adminAuthForm) {
    adminAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitAdminLogin();
    });
  }

  if (btnCloseAdminDash) {
    btnCloseAdminDash.addEventListener('click', closeAdminDashboard);
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.addEventListener('click', () => {
      adminState.isAdmin = false;
      adminState.godMode = false;
      adminState.noclip = false;
      adminState.speedMult = 1;
      try { sessionStorage.removeItem('halbina_admin_auth'); } catch(e){}
      if (adminSecretTrigger) adminSecretTrigger.classList.remove('logged-in');
      closeAdminDashboard();
      tickerText.textContent = '🛡️ Wylogowano z panelu administratora.';
    });
  }

  // Secret typing sequence (typing "niger22" anywhere opens and logs into admin)
  let adminKeySequenceBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }
    if (e.key && e.key.length === 1) {
      adminKeySequenceBuffer += e.key.toLowerCase();
      if (adminKeySequenceBuffer.length > 20) adminKeySequenceBuffer = adminKeySequenceBuffer.slice(-20);
      if (adminKeySequenceBuffer.endsWith('niger22')) {
        adminKeySequenceBuffer = '';
        if (adminPasswordInput) adminPasswordInput.value = 'niger22';
        submitAdminLogin();
      }
    }
  });

  // Admin tabs switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });

  // God Mode Toggle
  if (adminToggleGodMode) {
    adminToggleGodMode.addEventListener('change', () => {
      adminState.godMode = adminToggleGodMode.checked;
      sendAdminAction('god_mode', { enabled: adminState.godMode });
    });
  }

  // Noclip Toggle
  if (adminToggleNoclip) {
    adminToggleNoclip.addEventListener('change', () => {
      adminState.noclip = adminToggleNoclip.checked;
      sendAdminAction('noclip', { enabled: adminState.noclip });
    });
  }

  // Speed Buttons
  document.querySelectorAll('.btn-adm-speed').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-adm-speed').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const spd = Number(btn.dataset.speed) || 1;
      adminState.speedMult = spd;
      sendAdminAction('set_speed', { multiplier: spd });
    });
  });

  // Action Buttons
  document.querySelectorAll('.btn-adm-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!action) return;
      let argVal = btn.dataset.arg;
      if (action === 'give_money') sendAdminAction('give_money', { amount: Number(argVal) || 1000 });
      else if (action === 'give_points') sendAdminAction('give_points', { points: Number(argVal) || 1000 });
      else if (action === 'clear_notes') sendAdminAction('clear_notes', { allStudents: argVal === 'all' });
      else if (action === 'instant_homework') sendAdminAction('instant_homework', {});
      else if (action === 'switch_role') sendAdminAction('switch_role', {});
      else if (action === 'teacher_anger') sendAdminAction('teacher_anger', { anger: Number(argVal) || 0 });
      else if (action === 'teacher_turn') sendAdminAction('teacher_turn', { state: argVal });
      else if (action === 'teacher_stun') sendAdminAction('teacher_stun', { duration: Number(argVal) || 15 });
      else if (action === 'fire_alarm') sendAdminAction('fire_alarm', { active: argVal === 'true' });
      else if (action === 'blackout') sendAdminAction('blackout', { active: argVal === 'true' });
      else if (action === 'adjust_timer') sendAdminAction('adjust_timer', { deltaSeconds: Number(argVal) || 60 });
      else if (action === 'give_all_money') sendAdminAction('give_all_money', { amount: Number(argVal) || 1000 });
      else if (action === 'revive_all') sendAdminAction('revive_all', {});
    });
  });

  // Spawn Item Buttons
  document.querySelectorAll('.btn-adm-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.item;
      const qty = Number(btn.dataset.qty) || 1;
      sendAdminAction('give_item', { itemId, quantity: qty });
    });
  });

  // Give All Items Button
  const btnGiveAll = document.querySelector('.btn-adm-super');
  if (btnGiveAll) {
    btnGiveAll.addEventListener('click', () => {
      sendAdminAction('give_all_items', {});
    });
  }

  // Teleport Buttons
  document.querySelectorAll('.btn-adm-tp').forEach(btn => {
    btn.addEventListener('click', () => {
      const zone = btn.dataset.zone;
      const x = Number(btn.dataset.x) || 500;
      const y = Number(btn.dataset.y) || 350;
      sendAdminAction('teleport', { zone, x, y });
    });
  });

  // Teacher Say
  if (btnAdminTeacherSay && adminTeacherSayText) {
    btnAdminTeacherSay.addEventListener('click', () => {
      const text = adminTeacherSayText.value.trim();
      if (text) {
        sendAdminAction('teacher_say', { text });
        adminTeacherSayText.value = '';
      }
    });
    adminTeacherSayText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnAdminTeacherSay.click();
    });
  }

  // PA Broadcast
  if (btnAdminPaBroadcast && adminPaText) {
    btnAdminPaBroadcast.addEventListener('click', () => {
      const text = adminPaText.value.trim();
      if (text) {
        sendAdminAction('pa_broadcast', { text });
        adminPaText.value = '';
      }
    });
    adminPaText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnAdminPaBroadcast.click();
    });
  }

  // Admin Socket Listeners
  socket.on('player_teleported', (data) => {
    posX = data.x;
    posY = data.y;
    if (data.zone && currentGameState && currentGameState.players) {
      const me = currentGameState.players.find(p => p.id === myPlayerId);
      if (me) me.currentZone = data.zone;
    }
  });

  socket.on('inventory_updated', (data) => {
    if (currentGameState && currentGameState.players) {
      const me = currentGameState.players.find(p => p.id === myPlayerId);
      if (me && data.inventory) {
        me.inventory = data.inventory;
        if (typeof updateHotbarUI === 'function') updateHotbarUI(me.inventory);
        if (typeof renderBackpackGrid === 'function' && isBackpackOpen) renderBackpackGrid();
      }
    }
  });

  socket.on('money_updated', (data) => {
    if (currentGameState && currentGameState.players) {
      const me = currentGameState.players.find(p => p.id === myPlayerId);
      if (me && data.balance !== undefined) {
        me.bankBalance = data.balance;
        if (hudBankBalance) hudBankBalance.textContent = `${me.bankBalance.toFixed(2)} PLN`;
        if (phoneBankBalance) phoneBankBalance.textContent = `${me.bankBalance.toFixed(2)} PLN`;
      }
    }
  });

  requestAnimationFrame(gameLoop);

})();
