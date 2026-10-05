const { io } = require('socket.io-client');

async function runBossFightTest() {
  console.log("==========================================================================");
  console.log("💀 ROZPOCZYNANIE TESTU: BOSS FIGHT Z MEGA HALBINĄ (CHEMICZNY TYRANT)");
  console.log("==========================================================================");
  const SERVER_URL = 'http://localhost:3000';

  const client1 = io(SERVER_URL, { forceNew: true, reconnection: false });
  const client2 = io(SERVER_URL, { forceNew: true, reconnection: false });
  const client3 = io(SERVER_URL, { forceNew: true, reconnection: false });

  await Promise.all([
    new Promise(r => client1.on('connect', r)),
    new Promise(r => client2.on('connect', r)),
    new Promise(r => client3.on('connect', r)),
  ]);
  console.log("✅ 3 graczy połączonych z serwerem.");

  let roomCode = null;

  // 1. Create Room with mode 'boss' and Character 'romanowski'
  console.log("-> 1. Gospodarz tworzy pokój w trybie BOSS FIGHT (Romanowski)...");
  await new Promise((resolve, reject) => {
    client1.emit('create_room', { character: 'romanowski', mode: 'boss' }, (res) => {
      if (!res.success) return reject('Nie udało się utworzyć pokoju!');
      roomCode = res.code;
      console.log(`✅ Pokój BOSS FIGHT utworzony! Kod: ${roomCode}`);
      resolve();
    });
  });

  // 2. Gracz 2 dołącza jako Leszczyński
  console.log("-> 2. Gracz 2 dołącza jako Leszczyński...");
  await new Promise((resolve, reject) => {
    client2.emit('join_room', { code: roomCode, character: 'leszczynski' }, (res) => {
      if (!res.success) return reject(res.message);
      console.log('✅ Gracz 2 dołączył jako Leszczyński.');
      resolve();
    });
  });

  // 3. Gracz 3 dołącza jako Wolff
  console.log("-> 3. Gracz 3 dołącza jako Wolff...");
  await new Promise((resolve, reject) => {
    client3.emit('join_room', { code: roomCode, character: 'wolff' }, (res) => {
      if (!res.success) return reject(res.message);
      console.log('✅ Gracz 3 dołączył jako Wolff.');
      resolve();
    });
  });

  // 4. Start Game
  console.log("-> 4. Rozpoczynanie walki z Mega Halbiną...");
  const startingPromise = new Promise(r => client1.on('game_starting', r));
  const startedPromise = new Promise(r => client1.on('lesson_started', r));
  client1.emit('start_game_request', { teacherSelection: 'bot' });
  await startingPromise;
  console.log("✅ Dzwonek zadzwonił, odliczanie do starcia...");
  await startedPromise;
  console.log("🔥 Starcie z bossem rozpoczęte!");

  // 5. Verify Boss initialized
  await new Promise((resolve, reject) => {
    const handler = (tick) => {
      if (tick.boss && tick.boss.isBossMode) {
        console.log(`✅ Boss zainicjalizowany poprawnie: HP: ${tick.boss.hp}/${tick.boss.maxHp}, Faza: ${tick.boss.phase}`);
        client1.off('game_tick', handler);
        resolve();
      }
    };
    client1.on('game_tick', handler);
  });

  // 6. Test Leszczyński: Rzut kleszczem w bossa (65 DMG + Stun 2.5s + Bleed)
  console.log("-> 5. Leszczyński wykonuje RZUT KLESZCZEM [Q] w Mega Halbinę...");
  const kleszczPromise = new Promise((resolve, reject) => {
    const handler = (data) => {
      if (data.reason === 'RZUT KLESZCZEM') {
        console.log(`✅ Boss oberwał kleszczem! Zadane obrażenia: ${data.damage} DMG, Pozostałe HP: ${data.hp}`);
        client1.off('boss_damaged', handler);
        resolve(data);
      }
    };
    client1.on('boss_damaged', handler);
  });
  client2.emit('use_ability', { abilityName: 'tick' });
  await kleszczPromise;

  // Verify stun and bleed in tick
  await new Promise((resolve) => {
    const handler = (tick) => {
      if (tick.boss && (tick.boss.isStunned || tick.boss.isBleeding)) {
        console.log(`✅ Boss ma status: Paraliż (isStunned: ${tick.boss.isStunned}), Krwawienie (isBleeding: ${tick.boss.isBleeding})`);
        client1.off('game_tick', handler);
        resolve();
      }
    };
    client1.on('game_tick', handler);
  });

  // 7. Test Wolff: Mogę do toalety [Q] (+2.5s opóźnienia bossa)
  console.log("-> 6. Wolff zgłasza wyjście do toalety [Q]...");
  const toiletPromise = new Promise((resolve) => {
    client3.on('ability_used', (data) => {
      if (data.ability === 'toilet') {
        console.log(`✅ Odebrano ability_used toilet: ${data.message}`);
        resolve();
      }
    });
  });
  client3.emit('use_ability', { abilityName: 'toilet' });
  await toiletPromise;

  // 8. Test Wolff: Zapal e-vape [V] (chmura dymu)
  console.log("-> 7. Wolff odpala e-vape [V] (chmura dymu chroniąca uczniów)...");
  const vapePromise = new Promise((resolve) => {
    client3.on('ability_used', (data) => {
      if (data.ability === 'vape') {
        console.log(`✅ Odebrano ability_used vape: ${data.message}`);
        resolve();
      }
    });
  });
  client3.emit('use_ability', { abilityName: 'vape' });
  await vapePromise;

  // 9. Test Paper Airplane attack [F]
  console.log("-> 8. Romanowski rzuca samolot z papieru [F] w Halbinę...");
  const airplaneDamagePromise = new Promise((resolve) => {
    const handler = (data) => {
      if (data.reason === 'SAMOLOT') {
        console.log(`✅ Samolot trafił w Halbinę! DMG: ${data.damage}, Pozostałe HP: ${data.hp}`);
        client1.off('boss_damaged', handler);
        resolve();
      }
    };
    client1.on('boss_damaged', handler);
  });
  client1.emit('student_throw_paper', { targetX: 500, targetY: 110 });
  await airplaneDamagePromise;

  // 10. Test Romanowski: Stwórz mleko [Q]
  console.log("-> 9. Romanowski tworzy mleko [Q] (+75% speed + czyszczenie kwasu)...");
  const milkPromise = new Promise((resolve) => {
    client1.on('ability_used', (data) => {
      if (data.ability === 'milk') {
        console.log(`✅ Odebrano ability_used milk: ${data.message}`);
        resolve();
      }
    });
  });
  client1.emit('use_ability', { abilityName: 'milk' });
  await milkPromise;

  // 11. Defeat Boss (Finish off remaining HP and test BOSS_DEFEATED victory)
  console.log("-> 10. Przeprowadzanie serii ataków aż do pokonania Mega Halbina...");
  const victoryPromise = new Promise((resolve) => {
    client1.on('game_ended', (data) => {
      if (data.reason === 'BOSS_DEFEATED') {
        console.log("👑 ODEBRANO game_ended: BOSS_DEFEATED!");
        console.log("🏆 Leaderboard obrażeń:");
        data.leaderboard.forEach((p, idx) => {
          console.log(`   ${idx + 1}. ${p.name} - ${p.bossDamage} DMG (${p.points} pkt) - ${p.status}`);
        });
        resolve(data);
      }
    });
  });

  // Rapidly deal damage with planes / kleszcz
  const hitInterval = setInterval(() => {
    client1.emit('student_throw_paper', { targetX: 500, targetY: 110 });
    client2.emit('student_throw_paper', { targetX: 500, targetY: 110 });
    client3.emit('student_throw_paper', { targetX: 500, targetY: 110 });
  }, 400);

  const victoryData = await victoryPromise;
  clearInterval(hitInterval);

  console.log("==========================================================================");
  console.log("🎉 TEST BOSS FIGHT ZAKOŃCZONY PEŁNYM SUKCESEM!");
  console.log("==========================================================================");

  client1.disconnect();
  client2.disconnect();
  client3.disconnect();
  process.exit(0);
}

runBossFightTest().catch((err) => {
  console.error("❌ Błąd testu Boss Fight:", err);
  process.exit(1);
});
