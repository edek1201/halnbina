const { io } = require('socket.io-client');

async function runTest() {
  console.log("=== Rozpoczynanie testu multiplayer ===");
  const SERVER_URL = 'http://localhost:3000';

  const client1 = io(SERVER_URL, { forceNew: true, reconnection: false });
  const client2 = io(SERVER_URL, { forceNew: true, reconnection: false });

  let roomCode = null;

  await new Promise((resolve) => {
    client1.on('connect', () => {
      console.log('Client 1 połączony:', client1.id);
      resolve();
    });
  });

  await new Promise((resolve) => {
    client2.on('connect', () => {
      console.log('Client 2 połączony:', client2.id);
      resolve();
    });
  });

  // 1. Create Room by Player 1
  console.log("-> Tworzenie pokoju przez Gracza 1...");
  await new Promise((resolve, reject) => {
    client1.emit('create_room', { playerName: 'Romanowski', mode: 'classic' }, (res) => {
      if (!res.success) return reject('Nie udało się utworzyć pokoju');
      roomCode = res.code;
      console.log('Pokój stworzony! Kod pokoju:', roomCode);
      resolve();
    });
  });

  // 2. Join Room by Player 2
  console.log("-> Dołączanie Gracza 2 z kodem:", roomCode);
  await new Promise((resolve, reject) => {
    client2.emit('join_room', { code: roomCode, playerName: 'Kleszczyński' }, (res) => {
      if (!res.success) return reject('Nie udało się dołączyć: ' + res.message);
      console.log('Gracz 2 dołączył do pokoju pomyślnie!');
      resolve();
    });
  });

  // Wait for lobby update
  await new Promise((resolve) => {
    client1.on('room_updated', (data) => {
      if (data.players.length === 2) {
        console.log('W pokoju jest 2 graczy:', data.players.map(p => p.name));
        resolve();
      }
    });
  });

  // 3. Start Game by Host (force bot teacher so both are students, or test random)
  console.log("-> Rozpoczynanie gry przez Hosta (Tryb z AI Nauczycielką dla pewności roli obu)...");
  
  let startingData = null;
  const gameStartedPromise = new Promise((resolve) => {
    client1.on('game_starting', (data) => {
      startingData = data;
      console.log(`Otrzymano 'game_starting', role:`, data.players.map(p => `${p.name}: ${p.role}`));
      resolve();
    });
  });

  const lessonStartedPromise = new Promise((resolve) => {
    client1.on('lesson_started', () => {
      console.log("🔔 Odebrano 'lesson_started' po dzwonku i odliczaniu!");
      resolve();
    });
  });

  client1.emit('start_game_request', { teacherSelection: 'bot' });
  await gameStartedPromise;
  await lessonStartedPromise;

  // 4. Test shouting by Client 1 (Student)
  console.log("-> Test krzyczenia...");
  const shoutPromise = new Promise((resolve) => {
    client2.on('player_shouted', (shoutData) => {
      console.log(`Gracz 2 usłyszał krzyk: "${shoutData.text}" od ${shoutData.playerName} (Punkty: ${shoutData.points})`);
      resolve();
    });
  });

  client1.emit('shout_trigger', { shoutText: 'Szkieły jadą!' });
  await shoutPromise;

  // 5. Test moving
  console.log("-> Test poruszania się...");
  client1.emit('player_move', { x: 300, y: 350, isMoving: true });

  // 6. Wait for a game tick
  await new Promise((resolve) => {
    client1.once('game_tick', (tick) => {
      console.log(`Tick gry odebrany: Czas do dzwonka=${tick.timeRemaining}s, Halbina stan=${tick.teacher.state}`);
      resolve();
    });
  });

  console.log("====================================================");
  console.log("🎉 WSZYSTKIE TESTY MULTIPLAYER ZAKOŃCZONE SUKCESEM!");
  console.log("====================================================");
  client1.disconnect();
  client2.disconnect();
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Błąd testu:", err);
  process.exit(1);
});
