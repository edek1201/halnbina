const { io } = require('socket.io-client');

async function testPoliceObservationAndRzepa() {
  console.log("=== Rozpoczynanie testu: Pani obserwuje policję bezradnie, aż Rzepa zostanie złapany lub ich pokona ===");
  const SERVER_URL = 'http://localhost:3000';

  const clientHost = io(SERVER_URL, { forceNew: true, reconnection: false });
  const clientRzepa = io(SERVER_URL, { forceNew: true, reconnection: false });
  const clientStudent = io(SERVER_URL, { forceNew: true, reconnection: false });

  await Promise.all([
    new Promise(r => clientHost.on('connect', r)),
    new Promise(r => clientRzepa.on('connect', r)),
    new Promise(r => clientStudent.on('connect', r)),
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

  // 2. Dołącza Filip Rzepa i Gracz 3 (Wolff)
  await new Promise((resolve, reject) => {
    clientRzepa.emit('join_room', { code: roomCode, character: 'rzepa' }, (res) => {
      if (!res.success) return reject(res.message);
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    clientStudent.emit('join_room', { code: roomCode, character: 'wolff' }, (res) => {
      if (!res.success) return reject(res.message);
      resolve();
    });
  });

  // 3. Start lekcji z botem Halbina
  await new Promise((resolve) => {
    clientHost.emit('start_game_request', { teacherSelection: 'bot' });
    clientRzepa.once('lesson_started', resolve);
  });
  console.log("✅ Lekcja wystartowała.");

  // 4. Test blokady rzutu krzesłem dla innych postaci i wykonanie rzutu przez Filipa Rzepę
  console.log("-> 4. Weryfikacja: Romanowski próbuje rzucić krzesłem (powinno być zablokowane)...");
  await new Promise((resolve) => {
    clientHost.emit('student_throw_chair', { targetX: 500, targetY: 135 });
    clientHost.once('action_failed', (data) => {
      console.log(`✅ Zablokowano rzut krzesłem dla Romanowskiego: "${data.message}"`);
      resolve();
    });
  });

  console.log("-> Filip Rzepa rzuca krzesłem w Halbinę i wzywa policję...");
  clientRzepa.emit('student_throw_chair', { targetX: 500, targetY: 135 });

  // 5. Czekamy na wbieg policji
  await new Promise((resolve) => {
    const onTick = (state) => {
      if (state.policeOfficers && state.policeOfficers.length > 0) {
        clientRzepa.off('game_tick', onTick);
        console.log(`✅ Policja w sali! Stan Halbina: ${state.teacher.state}`);
        if (state.teacher.state !== 'SHOCKED') {
          throw new Error(`BŁĄD: Oczekiwano stanu SHOCKED dla Halbina, otrzymano: ${state.teacher.state}`);
        }
        resolve();
      }
    };
    clientRzepa.on('game_tick', onTick);
  });
  console.log("✅ Halbina jest w stanie SHOCKED - bezradnie obserwuje interwencję policji!");

  // 6. Podczas gdy szkieły są w sali, uczeń Wolff wstaje z ławki i biega po klasie:
  // Halbina NIE POWINNA dać mu uwagi za chodzenie!
  console.log("-> 6. Uczeń wstaje i chodzi po sali - weryfikacja, że Halbina nie daje uwag...");
  clientStudent.emit('player_move', { x: 500, y: 400, isMoving: true });
  await new Promise(r => setTimeout(r, 600));

  let uwagaReceived = false;
  const onCaught = (data) => {
    if (data.reason === 'WALKING_IN_CLASS' || data.reason === 'OUT_OF_DESK') {
      uwagaReceived = true;
    }
  };
  clientStudent.on('student_caught', onCaught);
  await new Promise(r => setTimeout(r, 800));
  clientStudent.off('student_caught', onCaught);

  if (uwagaReceived) {
    throw new Error("BŁĄD: Halbina wlepiła uwagę podczas nalotu policji!");
  }
  console.log("✅ Potwierdzono: Halbina nie karze uczniów, skupia się na interwencji policji!");

  // 7. Test zakończenia interwencji: Policjant dopada Filipa Rzepę
  console.log("-> 7. Sprawdzamy spacyfikowanie Filipa Rzepy przez policjanta...");
  let caughtRzepaEvent = false;

  const caughtPromise = new Promise((resolve) => {
    clientRzepa.once('police_caught_rzepa', (data) => {
      caughtRzepaEvent = true;
      console.log(`✅ Zarejestrowano spacyfikowanie Filipa Rzepy: "${data.message}"`);
      resolve();
    });
  });

  // Filip Rzepa podchodzi do policjanta, by dać się spacyfikować
  const approachCopInterval = setInterval(() => {
    clientRzepa.emit('player_move', { x: 70, y: 300, isMoving: false });
  }, 200);

  await caughtPromise;
  clearInterval(approachCopInterval);

  console.log("==================================================");
  console.log("🎉 TEST INTERWENCJI POLICJI I OBSERWACJI HALBINY ZALICZONY W 100%! 🎉");
  console.log("==================================================");

  clientHost.disconnect();
  clientRzepa.disconnect();
  clientStudent.disconnect();
  process.exit(0);
}

testPoliceObservationAndRzepa().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
