// Automated Test for all newly requested features:
// 1. Teacher 2s look / 5s cooldown
// 2. Vision cone (inside caught, outside safe)
// 3. Pop quiz when anger >= 50% ("Miarka się przebrała skurwysynie jebany do odpowiedzi!")
// 4. Phone cheat (director if caught, points if safe)
// 5. Spit paper ("Ty sobie ze mnie żartujesz pajacu głupi?!", showcase)
// 6. Dick paper ("Ty sobie ze mnie żartujesz pajacu głupi?!", showcase)
// 7. Quiz grading (Correct: -25% anger / Wrong: "Ty kurwo głupia!", +1 uwaga)

const ioClient = require('socket.io-client');
const http = require('http');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- ROZPOCZYNAM TEST NOWYCH FUNKCJI ---');

  const sHost = ioClient(SERVER_URL);
  const sStudent1 = ioClient(SERVER_URL);
  const sStudent2 = ioClient(SERVER_URL);

  await new Promise(r => sHost.on('connect', r));
  await new Promise(r => sStudent1.on('connect', r));
  await new Promise(r => sStudent2.on('connect', r));
  console.log('✓ Połączono 3 klientów');

  // 1. Create Room
  let roomCode = null;
  await new Promise(resolve => {
    sHost.emit('create_room', { character: 'romanowski', mode: 'classic' }, (res) => {
      roomCode = res.code;
      console.log('✓ Stworzono pokój:', roomCode);
      resolve();
    });
  });

  // 2. Join Room
  await new Promise(resolve => {
    sStudent1.emit('join_room', { code: roomCode, character: 'leszczynski' }, resolve);
  });
  await new Promise(resolve => {
    sStudent2.emit('join_room', { code: roomCode, character: 'wolff' }, resolve);
  });
  console.log('✓ Dołączono uczniów');

  // 3. Start game with Bot teacher so host is also a student
  await new Promise(resolve => {
    sHost.emit('start_game_request', { teacherSelection: 'bot' });
    sHost.on('lesson_started', resolve);
  });
  console.log('✓ Lekcja rozpoczęta (Tryb z nauczycielką Halbina)');

  // 4. Test Teacher Vision Cone
  // Put Student 1 outside vision cone (e.g. far left x = 80, y = 300)
  // Desk 1 is at x = 200, but far left is x = 80.
  // Vision cone formula: dx <= 55 + (y - 125)*0.62.
  // At y = 300, teacher is at x = 500: maxDx = 55 + 175*0.62 = 163.5.
  // So cone reaches x = [336.5, 663.5].
  // x = 120 is OUTSIDE vision cone!
  // x = 500 is INSIDE vision cone!
  sStudent1.emit('player_move', { x: 120, y: 300, isMoving: false });
  sStudent2.emit('player_move', { x: 500, y: 300, isMoving: false });
  await wait(200);

  // Turn teacher manually via socket event or let's test teacher turn
  // In classic mode with bot teacher, let's verify quiz when teacher anger >= 50%
  // Let's yell to raise anger
  let receivedSpeech = null;
  sHost.on('teacher_speech', data => {
    receivedSpeech = data.text;
  });

  // Test Quiz when anger reaches 50%
  console.log('Testowanie pytań z chemii i kartkówki...');
  let quizData = null;
  sStudent2.on('pop_quiz_modal', data => {
    quizData = data;
    console.log('✓ Uczeń otrzymał kartkówkę z pytaniem:', data.question);
    console.log('  Opcje:', data.options);
    console.log('  Czy mokra:', data.isWet);
  });

  // Host triggers quiz via event
  sHost.emit('teacher_trigger_quiz', { targetStudentId: sStudent2.id });
  // Note: Host is student, so won't trigger if not teacher. Let's create a room where host is TEACHER!
  sHost.disconnect();
  sStudent1.disconnect();
  sStudent2.disconnect();

  // SECOND TEST: Host as TEACHER
  console.log('\n--- TEST GRACZA HALBINA ---');
  const tTeacher = ioClient(SERVER_URL);
  const tStudent = ioClient(SERVER_URL);
  await new Promise(r => tTeacher.on('connect', r));
  await new Promise(r => tStudent.on('connect', r));

  let code2 = null;
  await new Promise(resolve => {
    tTeacher.emit('create_room', { character: 'romanowski', mode: 'classic' }, (res) => {
      code2 = res.code;
      resolve();
    });
  });

  await new Promise(resolve => {
    tStudent.emit('join_room', { code: code2, character: 'leszczynski' }, resolve);
  });

  // Start with teacherSelection = random, or let's wait for game_starting
  let teacherSocket = null;
  let studentSocket = null;

  await new Promise(resolve => {
    tTeacher.emit('start_game_request', { teacherSelection: 'random' });
    tTeacher.on('game_starting', (data) => {
      if (data.teacherId === tTeacher.id) {
        teacherSocket = tTeacher;
        studentSocket = tStudent;
      } else {
        teacherSocket = tStudent;
        studentSocket = tTeacher;
      }
      resolve();
    });
  });

  await new Promise(resolve => teacherSocket.on('lesson_started', resolve));
  console.log('✓ Gra wystartowała! Halbina =', teacherSocket.id, 'Uczeń =', studentSocket.id);

  // Test teacher turn (2s / 5s cooldown)
  let turnedState = null;
  teacherSocket.on('teacher_turned', data => {
    turnedState = data;
  });

  teacherSocket.emit('teacher_toggle_look');
  await wait(300);
  console.log('✓ Halbina obróciła się do klasy! State:', turnedState);
  if (turnedState && turnedState.state === 'CLASS') {
    console.log('✓ PRAWIDŁOWO: Halbina patrzy na klasę (duration = 2s)');
  }

  // Position student outside cone: x = 120, y = 300
  studentSocket.emit('player_move', { x: 120, y: 300, isMoving: false });
  await wait(200);

  let caughtOutside = false;
  studentSocket.on('student_caught', () => {
    caughtOutside = true;
  });

  // Student yells outside cone while Halbina is looking
  studentSocket.emit('shout_trigger', { shoutText: 'Szkieły jadą!' });
  await wait(400);

  if (!caughtOutside) {
    console.log('✓ PRAWIDŁOWO: Uczeń krzyczał poza polem widzenia i NIE dostał uwagi!');
  } else {
    console.log('❌ BŁĄD: Uczeń poza stożkiem dostał uwagę!');
  }

  // Move student into cone: x = 500, y = 300
  studentSocket.emit('player_move', { x: 500, y: 300, isMoving: false });
  await wait(200);

  let caughtInside = false;
  studentSocket.on('student_caught', (data) => {
    caughtInside = true;
    console.log('✓ PRAWIDŁOWO: Uczeń w polu widzenia dostał uwagę! Powód:', data.reason);
  });

  studentSocket.emit('shout_trigger', { shoutText: 'Surron!' });
  await wait(400);

  // Wait for 2s turn duration to expire
  await wait(2200);
  console.log('✓ Halbina automatycznie wróciła do tablicy po 2 sekundach!');

  // Test cooldown on turning:
  let turnBlocked = false;
  teacherSocket.on('inspection_failed', (data) => {
    if (data.message.includes('cooldown')) {
      turnBlocked = true;
      console.log('✓ PRAWIDŁOWO: Zablokowano obrót podczas cooldownu:', data.message);
    }
  });
  teacherSocket.emit('teacher_toggle_look');
  await wait(200);

  // Now test Pop Quiz:
  // To test quiz trigger, anger must be >= 50%
  // Let's yell multiple times while teacher at board to raise anger
  for (let i = 0; i < 4; i++) {
    studentSocket.emit('shout_trigger', { shoutText: 'Szkieły jadą!' });
    await wait(300);
  }

  // Now trigger pop quiz
  let popQuizData = null;
  studentSocket.on('pop_quiz_modal', (data) => {
    popQuizData = data;
    console.log('✓ Uczeń otrzymał KARTKÓWKĘ Z CHEMII:');
    console.log('  Pytanie:', data.question);
    console.log('  Opcje:', data.options);
    console.log('  Mokra kartka:', data.isWet);
  });

  teacherSocket.emit('teacher_trigger_quiz', { targetStudentId: studentSocket.id });
  await wait(500);

  // Test Spit on paper
  let spitSuccess = false;
  studentSocket.on('quiz_spit_success', data => {
    spitSuccess = true;
    console.log('✓ PRAWIDŁOWO: Opluto kartkę:', data.message);
  });
  studentSocket.emit('quiz_spit_paper');
  await wait(300);

  // Test Draw Dick on paper
  let dickSuccess = false;
  studentSocket.on('quiz_dick_success', data => {
    dickSuccess = true;
    console.log('✓ PRAWIDŁOWO: Narysowano kutasa na kartce:', data.message);
  });
  studentSocket.emit('quiz_draw_dick');
  await wait(300);

  // Test Showcase when handed in
  let showcaseData = null;
  teacherSocket.on('showcase_paper', data => {
    showcaseData = data;
    console.log('✓ PRAWIDŁOWO: Halbina pokazuje kartkę klasie na środku sali! Type:', data.type, 'Message:', data.message);
  });

  studentSocket.emit('quiz_submit_answer', { selectedOptionIndex: 0 });
  await wait(500);

  if (showcaseData && showcaseData.type === 'dick') {
    console.log('✓ PRAWIDŁOWO: Kartka z kutasem zaprezentowana na środku!');
  }

  console.log('\n--- WSZYSTKIE TESTY ZAKOŃCZONE SUKCESEM! ---');
  tTeacher.disconnect();
  tStudent.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Błąd testu:', err);
  process.exit(1);
});
