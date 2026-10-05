const { io } = require('socket.io-client');
const http = require('http');

async function testPoliceMachete() {
  console.log("=== Rozpoczynanie testu: Filip Rzepa, Wbieg policji i Walka Maczetą ===");
  const SERVER_URL = 'http://localhost:3000';

  const clientHost = io(SERVER_URL, { forceNew: true, reconnection: false });
  const clientRzepa = io(SERVER_URL, { forceNew: true, reconnection: false });
  const clientRzepa2 = io(SERVER_URL, { forceNew: true, reconnection: false });

  await Promise.all([
    new Promise(r => clientHost.on('connect', r)),
    new Promise(r => clientRzepa.on('connect', r)),
    new Promise(r => clientRzepa2.on('connect', r))
  ]);
  console.log("✅ Wszyscy 3 klienci połączeni z serwerem.");

  let roomCode = null;

  // 1. Host creates room as Romanowski
  console.log("-> 1. Tworzenie pokoju...");
  await new Promise((resolve, reject) => {
    clientHost.emit('create_room', { character: 'romanowski', mode: 'classic' }, (res) => {
      if (!res.success) return reject(res.message);
      roomCode = res.code;
      console.log(`✅ Pokój utworzony: ${roomCode}`);
      resolve();
    });
  });

  // 2. Gracz dołącza jako Filip Rzepa
  console.log("-> 2. Gracz 2 dołącza jako Filip Rzepa...");
  await new Promise((resolve, reject) => {
    clientRzepa.emit('join_room', { code: roomCode, character: 'rzepa' }, (res) => {
      if (!res.success) return reject(res.message);
      console.log(`✅ Gracz 2 dołączył jako Filip Rzepa (${res.player.name})!`);
      resolve();
    });
  });

  // 3. Drugi gracz próbuje dołączyć jako Filip Rzepa (powinno być zablokowane - max 1 Rzepa!)
  console.log("-> 3. Sprawdzanie blokady drugiego Filipa Rzepy w lobby...");
  await new Promise((resolve, reject) => {
    clientRzepa2.emit('join_room', { code: roomCode, character: 'rzepa' }, (res) => {
      if (res.success) {
        return reject("BŁĄD: Pozwolono na drugiego Filipa Rzepę w lobby!");
      }
      console.log(`✅ Prawidłowo zablokowano drugiego Rzepę: "${res.message}"`);
      resolve();
    });
  });

  // Gracz 3 dołącza jako Wolff
  await new Promise((resolve, reject) => {
    clientRzepa2.emit('join_room', { code: roomCode, character: 'wolff' }, (res) => {
      if (!res.success) return reject(res.message);
      console.log(`✅ Gracz 3 dołączył jako Wolff.`);
      resolve();
    });
  });

  // 4. Start gry z botem Halbina
  console.log("-> 4. Start lekcji (teacherSelection: bot)...");
  await new Promise((resolve) => {
    clientHost.emit('start_game_request', { teacherSelection: 'bot' });
    clientRzepa.once('lesson_started', () => {
      console.log("✅ Gra wystartowała pomyślnie!");
      resolve();
    });
  });

  // 5. Host rzuca krzesłem w Halbinę [X]
  console.log("-> 5. Rzut krzesłem w Halbinę (wywołanie telefonu po policję)...");
  await new Promise((resolve) => {
    clientHost.emit('student_throw_chair', { targetX: 500, targetY: 135 });
    clientRzepa.once('police_call_initiated', (data) => {
      console.log(`✅ Zarejestrowano wezwanie policji: "${data.message}"`);
      resolve();
    });
  });

  // 6. Czekamy na wbieg policji (lub przyspieszamy w teście czekając na ticki)
  console.log("-> 6. Czekamy na pojawienie się szkiełów w sali...");
  let copsInRoom = false;
  let testTimeout = setTimeout(() => {
    if (!copsInRoom) {
      console.error("❌ Błąd: Policja nie pojawiła się na czas!");
      process.exit(1);
    }
  }, 12000);

  await new Promise((resolve) => {
    const checkTick = (state) => {
      if (state.policeOfficers && state.policeOfficers.length > 0) {
        copsInRoom = true;
        clearTimeout(testTimeout);
        clientRzepa.off('game_tick', checkTick);
        console.log(`✅ SZKIEŁY W SALI! Liczba policjantów: ${state.policeOfficers.length}`);
        state.policeOfficers.forEach(c => console.log(`   - ${c.name} (HP: ${c.hp}/${c.maxHp}, stan: ${c.state}, x: ${c.x}, y: ${c.y})`));
        resolve();
      }
    };
    clientRzepa.on('game_tick', checkTick);
  });

  // 7. Filip Rzepa podchodzi do policjantów i tnie maczetą [V]
  console.log("-> 7. Filip Rzepa podchodzi do szkiełów i wyprowadza ciosy maczetą...");
  let hitsReceived = 0;
  clientRzepa.on('cop_hit', (data) => {
    hitsReceived++;
    console.log(`💥 CIĘCIE MACZETĄ! Trafiono: ${data.copName}, pozostałe HP: ${data.hp}`);
  });

  let copsDefeated = 0;
  clientRzepa.on('cop_defeated', (data) => {
    copsDefeated++;
    console.log(`💀 POKONANO SZKIEŁA: ${data.message}`);
  });

  let rescued = false;
  const rescuePromise = new Promise((resolve) => {
    clientRzepa.once('police_raid_rescued', (data) => {
      rescued = true;
      console.log(`🏆 KLASA URATOWANA: ${data.message}`);
      resolve();
    });
  });

  // Wykonajmy cięcia maczetą w pętli podchodząc do policjantów
  let latestCops = [];
  clientRzepa.on('game_tick', (state) => {
    if (state.policeOfficers) latestCops = state.policeOfficers.filter(c => c.state !== 'FLEEING');
  });

  const attackInterval = setInterval(() => {
    if (latestCops.length > 0) {
      const targetCop = latestCops[0];
      clientRzepa.emit('player_move', { x: targetCop.x, y: targetCop.y, isMoving: false });
      clientRzepa.emit('student_machete_swing', { x: targetCop.x, y: targetCop.y });
    }
  }, 350);

  await rescuePromise;
  clearInterval(attackInterval);

  console.log("==================================================");
  console.log("🎉 WSZYSTKIE TESTY POLICJI I MACZETY ZALICZONE NA 100%! 🎉");
  console.log("==================================================");

  clientHost.disconnect();
  clientRzepa.disconnect();
  clientRzepa2.disconnect();
  process.exit(0);
}

// Sprawdź czy serwer działa przed uruchomieniem
testPoliceMachete().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
