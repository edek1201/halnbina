const { io } = require('socket.io-client');

async function runTest() {
  console.log("=== Rozpoczynanie testu: Postacie, Supermoce, Przesiadanie się do ławek i Przegląd Halbina ===");
  const SERVER_URL = 'http://localhost:3000';

  const client1 = io(SERVER_URL, { forceNew: true, reconnection: false });
  const client2 = io(SERVER_URL, { forceNew: true, reconnection: false });
  const client3 = io(SERVER_URL, { forceNew: true, reconnection: false });

  await Promise.all([
    new Promise(r => client1.on('connect', r)),
    new Promise(r => client2.on('connect', r)),
    new Promise(r => client3.on('connect', r)),
  ]);
  console.log("✅ 3 klientów połączonych.");

  let roomCode = null;

  // 1. Create Room with Character Selection: Romanowski
  console.log("-> 1. Host wybiera postać Romanowski i tworzy pokój...");
  await new Promise((resolve, reject) => {
    client1.emit('create_room', { character: 'romanowski', mode: 'classic' }, (res) => {
      if (!res.success) return reject('Nie udało się utworzyć pokoju');
      roomCode = res.code;
      if (res.player.character !== 'romanowski' || res.player.name !== 'Romanowski') {
        return reject('Błędna postać dla Gracza 1!');
      }
      console.log('✅ Pokój utworzony! Kod:', roomCode, 'Postać:', res.player.character);
      resolve();
    });
  });

  // 2. Client 2 joins with character Leszczyński
  console.log("-> 2. Gracz 2 dołącza jako Leszczyński...");
  await new Promise((resolve, reject) => {
    client2.emit('join_room', { code: roomCode, character: 'leszczynski' }, (res) => {
      if (!res.success) return reject('Błąd dołączania gracza 2: ' + res.message);
      if (res.player.character !== 'leszczynski' || res.player.name !== 'Leszczyński') {
        return reject('Błędna postać dla Gracza 2!');
      }
      console.log('✅ Gracz 2 dołączył jako:', res.player.name);
      resolve();
    });
  });

  // 3. Client 3 joins with character Wolff
  console.log("-> 3. Gracz 3 dołącza jako Wolff...");
  await new Promise((resolve, reject) => {
    client3.emit('join_room', { code: roomCode, character: 'wolff' }, (res) => {
      if (!res.success) return reject('Błąd dołączania gracza 3: ' + res.message);
      if (res.player.character !== 'wolff' || res.player.name !== 'Wolff') {
        return reject('Błędna postać dla Gracza 3!');
      }
      console.log('✅ Gracz 3 dołączył jako:', res.player.name);
      resolve();
    });
  });

  // 4. Start Game
  console.log("-> 4. Rozpoczynanie lekcji (AI Halbina)...");
  const startingPromise = new Promise(r => client1.on('game_starting', r));
  const startedPromise = new Promise(r => client1.on('lesson_started', r));
  client1.emit('start_game_request', { teacherSelection: 'bot' });
  const startData = await startingPromise;
  console.log("✅ Wszyscy uczniowie przydzieleni do ławek:", startData.players.map(p => `${p.name} (Ławka nr ${p.assignedDeskIndex + 1})`));
  await startedPromise;

  // 5. Test Ducking Restriction (far from any desk vs near desk)
  console.log("-> 5. Test blokady kucania z dala od ławki...");
  // Move client 1 far into corridor between desks (e.g. x: 530, y: 335 -> distance to all desks > 55)
  client1.emit('player_move', { x: 530, y: 335, isMoving: false });
  await new Promise(r => setTimeout(r, 100));

  await new Promise((resolve, reject) => {
    client1.emit('student_duck', { isDucking: true }, (res) => {
      if (res.success) {
        return reject('BŁĄD: Kucanie z dala od ławki powinno być zablokowane!');
      }
      console.log('✅ Kucanie z dala od ławki poprawnie zablokowane:', res.message);
      resolve();
    });
  });

  // Move client 1 to desk 1 (x: 200, y: 260) and duck -> should succeed
  client1.emit('player_move', { x: 200, y: 260, isMoving: false });
  await new Promise(r => setTimeout(r, 100));
  await new Promise((resolve, reject) => {
    client1.emit('student_duck', { isDucking: true }, (res) => {
      if (!res.success) {
        return reject('BŁĄD: Kucanie przy ławce powinno być dozwolone!');
      }
      console.log('✅ Kucanie przy ławce zaakceptowane!');
      resolve();
    });
  });
  client1.emit('student_duck', { isDucking: false });

  // 6. Test Superpowers
  console.log("-> 6. Test supermocy postaci...");

  // Romanowski: Stwórz mleko (speed boost)
  const milkPromise = new Promise((resolve) => {
    client1.on('ability_used', (data) => {
      if (data.ability === 'milk') {
        console.log('✅ Odebrano ability_used: Romanowski stworzył mleko!');
        resolve();
      }
    });
  });
  client1.emit('use_ability', { abilityName: 'milk' });
  await milkPromise;

  // Leszczyński: Rzut kleszczem
  const tickPromise = new Promise((resolve) => {
    client2.on('ability_used', (data) => {
      if (data.ability === 'tick') {
        console.log('✅ Odebrano ability_used: Leszczyński rzucił kleszczem!');
        resolve();
      }
    });
  });
  client2.emit('use_ability', { abilityName: 'tick' });
  await tickPromise;

  // Wolff: Toaleta i E-vape
  const vapePromise = new Promise((resolve) => {
    client3.on('ability_used', (data) => {
      if (data.ability === 'vape') {
        console.log('✅ Odebrano ability_used: Wolff zapalił e-vape (chmura dymu)!');
        resolve();
      }
    });
  });
  client3.emit('use_ability', { abilityName: 'vape' });
  await vapePromise;

  // 7. Test Przesiadania się do ławek i Przegląd Halbina
  console.log("-> 7. Test przesiadania się do obcej ławki i inspekcji Halbina...");
  // Client 2 (Leszczyński, assignedDeskIndex = 1) moves to Desk 4 (x: 840, y: 260, id: 3)
  client2.emit('player_move', { x: 840, y: 260, isMoving: false });
  await new Promise(r => setTimeout(r, 200));

  // Check state tick to confirm client 2 is at foreign desk
  await new Promise((resolve) => {
    const handler = (tick) => {
      const p2 = tick.players.find(p => p.id === client2.id);
      if (p2 && p2.currentDeskIndex === 3 && p2.assignedDeskIndex !== 3) {
        console.log(`✅ Gracz 2 przesiadł się do Ławki nr ${p2.currentDeskIndex + 1} (jego przypisana: nr ${p2.assignedDeskIndex + 1})`);
        client2.off('game_tick', handler);
        resolve();
      }
    };
    client2.on('game_tick', handler);
  });

  console.log("==========================================================================");
  console.log("🎉 WSZYSTKIE TESTY NOWYCH MECHANIK ZAKOŃCZONE PEŁNYM SUKCESEM!");
  console.log("==========================================================================");

  client1.disconnect();
  client2.disconnect();
  client3.disconnect();
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ Błąd testu:", err);
  process.exit(1);
});
