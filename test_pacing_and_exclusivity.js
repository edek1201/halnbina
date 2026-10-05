const { io } = require('socket.io-client');

async function testPacingAndExclusivity() {
  console.log("=== Rozpoczynanie testu: Pacing, Exclusive Events, Shout Cooldown i UI ===");
  const SERVER_URL = 'http://localhost:3000';

  const clientHost = io(SERVER_URL, { forceNew: true, reconnection: false });
  const client2 = io(SERVER_URL, { forceNew: true, reconnection: false });

  await Promise.all([
    new Promise(r => clientHost.on('connect', r)),
    new Promise(r => client2.on('connect', r)),
  ]);

  let roomCode = null;

  // 1. Host creates room
  await new Promise((resolve, reject) => {
    clientHost.emit('create_room', { character: 'romanowski', mode: 'normal' }, (res) => {
      if (!res.success) return reject(res.message);
      roomCode = res.code;
      resolve();
    });
  });

  // 2. Gracz 2 dołącza
  await new Promise((resolve, reject) => {
    client2.emit('join_room', { code: roomCode, character: 'rzepa' }, (res) => {
      if (!res.success) return reject(res.message);
      resolve();
    });
  });

  // 3. Start gry
  await new Promise((resolve) => {
    clientHost.emit('start_game_request', { teacherSelection: 'bot' });
    client2.once('lesson_started', resolve);
  });
  console.log("✅ Lekcja wystartowała w zbalansowanym trybie 'Normalna Lekcja'.");

  // 4. Test Shout Cooldown: 1st shout succeeds, 2nd instant shout blocked by cooldown
  console.log("-> 4. Test cooldownu okrzyków (3.5s)...");
  let shoutReceivedCount = 0;
  client2.on('player_shouted', () => {
    shoutReceivedCount++;
  });

  client2.emit('shout_trigger', { shoutText: 'Szkieły jadą!' });
  await new Promise(r => setTimeout(r, 100)); // wait brief instant
  client2.emit('shout_trigger', { shoutText: 'Spam 2' }); // should be ignored by server
  client2.emit('shout_trigger', { shoutText: 'Spam 3' }); // should be ignored by server
  await new Promise(r => setTimeout(r, 400));

  if (shoutReceivedCount !== 1) {
    throw new Error(`BŁĄD: Otrzymano ${shoutReceivedCount} okrzyków zamiast 1! Cooldown na serwerze nie zadziałał!`);
  }
  console.log("✅ Cooldown na krzyk zadziałał poprawnie: zablokowano natychmiastowy spam okrzyków!");

  // 5. Test Teacher Warning Pacing: Sprawdzamy czas trwania ostrzeżenia
  console.log("-> 5. Weryfikacja ostrzeżenia (TURNING) Halbiny...");
  let warningTime = 0;
  let turnedTime = 0;

  const warningPromise = new Promise((resolve) => {
    client2.once('teacher_warning', () => {
      warningTime = Date.now();
      console.log("👀 Otrzymano ostrzeżenie [!] przed obrotem Halbiny.");
      resolve();
    });
  });

  const turnedPromise = new Promise((resolve) => {
    client2.once('teacher_turned', (data) => {
      if (data.state === 'CLASS') {
        turnedTime = Date.now();
        console.log("🚨 Halbina odwróciła się twarzą do sali.");
        resolve();
      }
    });
  });

  await warningPromise;
  await turnedPromise;

  const reactionWindow = (turnedTime - warningTime) / 1000;
  console.log(`⏱️ Czas trwania fazy ostrzeżenia: ${reactionWindow.toFixed(2)}s (Oczekiwano ok. 2.2s).`);
  if (reactionWindow < 1.8) {
    throw new Error(`BŁĄD: Czas ostrzeżenia za krótki (${reactionWindow}s)!`);
  }
  console.log("✅ Czas na reakcję gracza jest sprawiedliwy i zbalansowany!");

  // 6. Test Exclusivity: Rzut krzesłem -> Wezwanie policji -> Próba wywołania drugiej policji lub kartkówki
  console.log("-> 6. Test wzajemnego wykluczania wydarzeń (brak nachodzenia na siebie)...");
  clientHost.emit('student_throw_chair', { targetX: 500, targetY: 135 });
  await new Promise(r => setTimeout(r, 500));

  // Próba ponownego rzutu krzesłem podczas wezwania policji
  await new Promise((resolve) => {
    clientHost.emit('student_throw_chair', { targetX: 500, targetY: 135 });
    clientHost.once('action_failed', (data) => {
      console.log(`✅ Zablokowano ponowny rzut krzesłem: "${data.message}"`);
      resolve();
    });
  });

  console.log("==================================================");
  console.log("🎉 WSZYSTKIE TESTY PACINGU I ZAPOBIEGANIA DOPAMINE WARRIOR ZALICZONE! 🎉");
  console.log("==================================================");

  clientHost.disconnect();
  client2.disconnect();
  process.exit(0);
}

testPacingAndExclusivity().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
