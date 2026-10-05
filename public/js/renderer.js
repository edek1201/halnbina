class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Preload image assets
    this.images = {};
    this.imagesLoaded = false;
    this.loadSprites();

    // Particle system for effects (chalk dust, sound ripples)
    this.particles = [];

    // Periodic table and chemistry formulas decor
    this.formulas = [
      { text: "2H₂ + O₂ → 2H₂O", x: 220, y: 40 },
      { text: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O", x: 480, y: 42 },
      { text: "NaCl", x: 760, y: 38 },
      { text: "KARTKÓWKA!", x: 480, y: 70, isRed: true }
    ];

    // Desks layout reference
    this.deskSlots = [
      { id: 0, x: 200, y: 260 }, { id: 1, x: 420, y: 260 }, { id: 2, x: 640, y: 260 }, { id: 3, x: 840, y: 260 },
      { id: 4, x: 200, y: 410 }, { id: 5, x: 420, y: 410 }, { id: 6, x: 640, y: 410 }, { id: 7, x: 840, y: 410 },
      { id: 8, x: 200, y: 560 }, { id: 9, x: 420, y: 560 }, { id: 10, x: 640, y: 560 }, { id: 11, x: 840, y: 560 },
    ];
  }

  loadSprites() {
    const assetList = {
      studentIdle: '/assets/romanowski.png',
      studentWalk: '/assets/romanowskiidzie.png',
      studentShout: '/assets/romanowskikrzyczy.png',
      teacherClass: '/assets/halbina.png',
      teacherBoard: '/assets/halbina_tyl.png',
    };

    let loadedCount = 0;
    const totalAssets = Object.keys(assetList).length;

    for (const [key, src] of Object.entries(assetList)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[key] = img;
        loadedCount++;
        if (loadedCount === totalAssets) {
          this.imagesLoaded = true;
        }
      };
      img.onerror = () => {
        console.warn(`Could not load ${src}, fallback procedural rendering will be used.`);
      };
    }
  }

  addSoundRipples(x, y) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'ripple',
        x: x,
        y: y,
        radius: 10 + i * 15,
        maxRadius: 70 + i * 20,
        alpha: 0.9,
        speed: 120 + i * 30
      });
    }
  }

  addChalkDust(x, y) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        type: 'dust',
        x: x + (Math.random() - 0.5) * 15,
        y: y,
        vx: (Math.random() - 0.5) * 20,
        vy: 20 + Math.random() * 30,
        alpha: 0.8,
        life: 0.8
      });
    }
  }

  addSteamPuff(x, y) {
    if (Math.random() < 0.4) {
      this.particles.push({
        type: 'steam',
        x: x + (Math.random() - 0.5) * 6,
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: -35 - Math.random() * 25,
        radius: 4 + Math.random() * 4,
        maxRadius: 16,
        alpha: 0.85,
        life: 0.7
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.type === 'ripple') {
        p.radius += p.speed * dt;
        p.alpha -= 1.2 * dt;
        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          this.particles.splice(i, 1);
        }
      } else if (p.type === 'dust') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      } else if (p.type === 'steam') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.radius += 14 * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / 0.7);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  render(gameState, myId, dt) {
    const ctx = this.ctx;
    this.updateParticles(dt);

    ctx.clearRect(0, 0, this.width, this.height);

    // Camera shake during Halbina rage outburst
    let isRaging = gameState.teacher && gameState.teacher.state === 'RAGE';
    if (isRaging) {
      ctx.save();
      const shakeAmp = 6;
      ctx.translate((Math.random() - 0.5) * shakeAmp, (Math.random() - 0.5) * shakeAmp);
    }

    // 1. Draw Classroom Floor
    this.drawFloor(ctx);

    // 2. Draw Blackboard & Wall
    this.drawBlackboard(ctx);

    // 3. Draw Student Desks
    this.drawDesks(ctx, gameState, myId);

    // 4. Draw Teacher Desk
    this.drawTeacherDesk(ctx);

    // 5. Draw Vision Cone / Attention Field
    if (gameState.teacher && (gameState.teacher.state === 'CLASS' || gameState.teacher.state === 'RAGE')) {
      this.drawTeacherVisionCone(ctx, gameState.teacher);
    }

    // 6. Draw Teacher
    if (gameState.teacher) {
      this.drawTeacher(ctx, gameState.teacher, dt);
    }

    // 7. Draw Students
    if (gameState.players) {
      // Sort by Y for depth layering
      const sorted = [...gameState.players].sort((a, b) => a.y - b.y);
      sorted.forEach(player => {
        if (player.role === 'STUDENT') {
          this.drawStudent(ctx, player, player.id === myId);
        }
      });
    }

    // 8. Draw Flying Paper Airplanes
    if (gameState.projectiles) {
      this.drawProjectiles(ctx, gameState.projectiles);
    }

    // 9. Draw Police Raid flashing lights (Szkieły jadą!)
    if (gameState.policeActive) {
      this.drawPoliceLights(ctx);
    }

    // 10. Draw Particles (ripples, dust, steam)
    this.drawParticles(ctx);

    // 11. Draw Speech Bubbles (on top of characters)
    if (gameState.players) {
      gameState.players.forEach(player => {
        if (player.isShouting && player.shoutText) {
          this.drawSpeechBubble(ctx, player.x, player.y - 48, player.shoutText);
        }
      });
    }

    // 12. Draw Halbina RAGE giant explosive bubble ("WY GŁUPIE SKURWYSYNY!")
    if (isRaging && gameState.teacher.rageText) {
      this.drawHalbinaRageBubble(ctx, gameState.teacher.x, gameState.teacher.y - 85, gameState.teacher.rageText);
    }

    if (isRaging) {
      ctx.restore();
    }
  }

  drawFloor(ctx) {
    // Parquet wooden classroom floor
    ctx.fillStyle = '#b77943';
    ctx.fillRect(0, 0, this.width, this.height);

    // Parquet plank stripes
    ctx.strokeStyle = 'rgba(92, 58, 30, 0.25)';
    ctx.lineWidth = 1;
    const plankH = 28;
    for (let y = 140; y < this.height; y += plankH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();

      const offset = (Math.floor(y / plankH) % 2) * 50;
      for (let x = offset; x < this.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + plankH);
        ctx.stroke();
      }
    }
  }

  drawBlackboard(ctx) {
    // Top wall
    ctx.fillStyle = '#e8d5b5';
    ctx.fillRect(0, 0, this.width, 130);

    // Wooden border for Tablica
    ctx.fillStyle = '#6e4722';
    ctx.fillRect(120, 10, 760, 95);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(124, 14, 752, 87);

    // Blackboard slate green surface
    ctx.fillStyle = '#1b3b2b';
    ctx.fillRect(130, 20, 740, 75);

    // Chalk dust texture & board frame shadow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(130, 75, 740, 20);

    // Chemistry formulas written on board
    ctx.font = '700 16px "Permanent Marker", cursive, sans-serif';
    this.formulas.forEach(f => {
      ctx.fillStyle = f.isRed ? '#ff6b6b' : 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    });

    // Chalk tray below board
    ctx.fillStyle = '#4a2f15';
    ctx.fillRect(130, 95, 740, 7);
    // Pieces of white & yellow chalk in tray
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(350, 93, 14, 4);
    ctx.fillStyle = '#f6e58d';
    ctx.fillRect(375, 93, 16, 4);
    // Sponge / chalk eraser
    ctx.fillStyle = '#444';
    ctx.fillRect(620, 91, 24, 7);
  }

  drawTeacherDesk(ctx) {
    const dx = 500;
    const dy = 135;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(dx, dy + 22, 95, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teacher Desk Top (Large wooden executive desk)
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(dx - 90, dy - 18, 180, 36);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(dx - 88, dy - 16, 176, 30);

    // Chemistry flask with bubbling green liquid
    ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
    ctx.beginPath();
    ctx.arc(dx + 55, dy - 4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Test tube rack
    ctx.fillStyle = '#d35400';
    ctx.fillRect(dx - 70, dy - 10, 26, 12);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(dx - 66, dy - 16, 4, 14);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(dx - 58, dy - 16, 4, 14);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(dx - 50, dy - 16, 4, 14);

    // Grade Register (Dziennik lekcyjny)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(dx - 18, dy - 12, 34, 22);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '700 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("DZIENNIK", dx - 1, dy + 2);
  }

  drawDesks(ctx, gameState, myId) {
    const myPlayer = gameState.players ? gameState.players.find(p => p.id === myId) : null;
    const myDeskIndex = myPlayer ? myPlayer.deskIndex : -1;

    this.deskSlots.forEach(desk => {
      const isMyDesk = desk.id === myDeskIndex;

      // Soft glow for player's own assigned desk
      if (isMyDesk) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
        ctx.beginPath();
        ctx.ellipse(desk.x, desk.y, 60, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '700 11px "Fredoka", sans-serif';
        ctx.fillStyle = '#27ae60';
        ctx.textAlign = 'center';
        ctx.fillText("TWOJA ŁAWKA", desk.x, desk.y + 36);
      }

      // Desk shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(desk.x, desk.y + 16, 52, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Student Desk Body
      ctx.fillStyle = '#7a4e28';
      ctx.fillRect(desk.x - 48, desk.y - 12, 96, 24);
      ctx.fillStyle = '#a66a38';
      ctx.fillRect(desk.x - 46, desk.y - 10, 92, 20);

      // Metal frame legs
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(desk.x - 44, desk.y + 8, 4, 12);
      ctx.fillRect(desk.x + 40, desk.y + 8, 4, 12);

      // Chemistry textbook on desk
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(desk.x - 30, desk.y - 8, 16, 14);
      ctx.fillStyle = '#f5f6fa';
      ctx.fillRect(desk.x - 28, desk.y - 6, 12, 10);

      // Pen
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(desk.x - 8, desk.y - 4, 14, 2);

      // Desk number label
      ctx.font = '700 10px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText(`Nr ${desk.id + 1}`, desk.x + 42, desk.y + 5);
    });
  }

  drawTeacherVisionCone(ctx, teacher) {
    // Red semi-transparent field of view sweeping the classroom
    const tx = teacher.x;
    const ty = teacher.y + 25;

    const grad = ctx.createRadialGradient(tx, ty, 20, tx, ty, 600);
    grad.addColorStop(0, 'rgba(231, 76, 60, 0.45)');
    grad.addColorStop(0.5, 'rgba(231, 76, 60, 0.25)');
    grad.addColorStop(1, 'rgba(231, 76, 60, 0.05)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    // Downward cone spreading across classroom
    ctx.lineTo(0, 700);
    ctx.lineTo(1000, 700);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Laser scanning lines
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  drawTeacher(ctx, teacher, dt) {
    const x = teacher.x;
    const y = teacher.y;

    if (teacher.state === 'BOARD') {
      // Chalk dust particles while writing
      if (Math.random() < 0.2) {
        this.addChalkDust(x + 15, y - 20);
      }

      if (this.images.teacherBoard && this.images.teacherBoard.complete) {
        ctx.drawImage(this.images.teacherBoard, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, true);
      }
    } else if (teacher.state === 'TURNING') {
      // Exclamation alert warning icon above teacher
      ctx.save();
      const bounce = Math.sin(Date.now() / 80) * 5;
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(x, y - 65 + bounce, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#2c3e50';
      ctx.font = '900 24px "Bangers", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y - 64 + bounce);
      ctx.restore();

      if (this.images.teacherClass && this.images.teacherClass.complete) {
        ctx.drawImage(this.images.teacherClass, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, false);
      }
    } else if (teacher.state === 'RAGE') {
      // FURIOUS RAGE OUTBURST! Steam puffs from ears!
      this.addSteamPuff(x - 20, y - 48);
      this.addSteamPuff(x + 20, y - 48);

      if (this.images.teacherClass && this.images.teacherClass.complete) {
        ctx.drawImage(this.images.teacherClass, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, false);
      }

      // Red furious rage aura
      ctx.fillStyle = 'rgba(235, 77, 75, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y - 25, 38, 0, Math.PI * 2);
      ctx.fill();

      // Comic anger vein mark (💢) near forehead
      ctx.fillStyle = '#ff1744';
      ctx.font = '900 22px Arial';
      ctx.fillText('💢', x + 18, y - 48);

      // Blazing red glaring eyes
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(x - 6, y - 32, 3.5, 0, Math.PI * 2);
      ctx.arc(x + 6, y - 32, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Looking at class
      if (this.images.teacherClass && this.images.teacherClass.complete) {
        ctx.drawImage(this.images.teacherClass, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, false);
      }

      // Angry glaring red eyes effect
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.arc(x - 5, y - 32, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 32, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Name badge
    ctx.font = '700 13px "Fredoka", sans-serif';
    ctx.fillStyle = teacher.state === 'RAGE' ? '#ff4d4d' : '#f6e58d';
    ctx.textAlign = 'center';
    const tag = teacher.state === 'RAGE' ? '🔥 WŚCIEKŁA KATARZYNA HALBINA 🔥' : 'Katarzyna Halbina';
    ctx.fillText(tag, x, y + 36);
  }

  drawStudent(ctx, student, isMe) {
    const x = student.x;
    const y = student.y;

    if (student.isEliminated) {
      // Expelled student: ghost effect
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#ecf0f1';
      ctx.beginPath();
      ctx.arc(x, y - 10, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '700 12px Arial';
      ctx.fillStyle = '#e74c3c';
      ctx.textAlign = 'center';
      ctx.fillText("U DYREKTORA", x, y + 16);
      ctx.restore();
      return;
    }

    // Immunity flash effect
    if (student.immunity && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Ducking under desk pose!
    if (student.isDucking) {
      ctx.save();
      // Lowered sprite tucked behind desk
      let sprite = this.images.studentIdle;
      if (sprite && sprite.complete) {
        // Draw squished/ducked behind desk
        ctx.drawImage(sprite, x - 26, y - 26, 52, 45);
      } else {
        ctx.fillStyle = '#f5cd79';
        ctx.beginPath();
        ctx.arc(x, y - 5, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#2ecc71';
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🙈 UKRYTY", x, y + 18);
      ctx.restore();
      return;
    }

    // Determine sprite
    let sprite = this.images.studentIdle;
    if (student.isShouting) {
      sprite = this.images.studentShout;
      // Emit sound wave ripple
      if (Math.random() < 0.15) {
        this.addSoundRipples(x, y - 25);
      }
    } else if (student.isMoving) {
      sprite = this.images.studentWalk;
    }

    if (sprite && sprite.complete) {
      ctx.drawImage(sprite, x - 32, y - 50, 64, 80);
    } else {
      this.drawStudentProcedural(ctx, x, y, student.isShouting, student.isMoving);
    }

    // Cheating indicator
    if (student.isCheating) {
      ctx.fillStyle = '#f1c40f';
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("📝 Ściąga (+35 pkt)", x, y - 55);
    }

    ctx.globalAlpha = 1.0;

    // Student Nickname & Uwagi Badges
    ctx.font = isMe ? '700 13px "Fredoka", sans-serif' : '600 12px "Fredoka", sans-serif';
    ctx.fillStyle = isMe ? '#2ecc71' : '#f5f6fa';
    ctx.textAlign = 'center';

    let label = student.name;
    if (isMe) label = `★ ${label} (TY) ★`;
    ctx.fillText(label, x, y + 34);

    // Strike icons under name
    if (student.uwagi > 0) {
      let strikesStr = '';
      for (let i = 0; i < student.uwagi; i++) strikesStr += '⚠️ ';
      ctx.font = '11px Arial';
      ctx.fillText(strikesStr.trim(), x, y + 46);
    }
  }

  // Draw Flying Paper Airplanes
  drawProjectiles(ctx, projectiles) {
    projectiles.forEach(p => {
      const curX = p.startX + (p.targetX - p.startX) * p.t;
      // Arc trajectory
      const arcHeight = Math.sin(p.t * Math.PI) * 55;
      const curY = p.startY + (p.targetY - p.startY) * p.t - arcHeight;
      const shadowY = p.startY + (p.targetY - p.startY) * p.t;

      // Shadow on floor
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(curX, shadowY, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Paper airplane
      ctx.save();
      ctx.translate(curX, curY);
      const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
      ctx.rotate(angle);

      // Folded white triangle paper shape
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Wing fold line
      ctx.strokeStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-4, 0);
      ctx.stroke();

      ctx.restore();
    });
  }

  // Police lights sweep across room (Szkieły jadą!)
  drawPoliceLights(ctx) {
    const time = Date.now() / 150;
    const isBlue = Math.floor(time) % 2 === 0;

    ctx.save();
    // Top windows light flash
    const grad = ctx.createLinearGradient(0, 0, this.width, 200);
    if (isBlue) {
      grad.addColorStop(0, 'rgba(41, 128, 185, 0.55)');
      grad.addColorStop(0.5, 'rgba(52, 152, 219, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      grad.addColorStop(0, 'rgba(231, 76, 60, 0.55)');
      grad.addColorStop(0.5, 'rgba(235, 77, 75, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Flashing emergency strobe on walls
    ctx.fillStyle = isBlue ? 'rgba(52, 152, 219, 0.15)' : 'rgba(231, 76, 60, 0.15)';
    ctx.fillRect(0, 0, this.width, 140);
    ctx.restore();
  }

  // Giant explosive jagged comic bubble for Halbina RAGE ("WY GŁUPIE SKURWYSYNY!")
  drawHalbinaRageBubble(ctx, x, y, text) {
    ctx.save();
    const bounce = Math.sin(Date.now() / 40) * 3;
    const bx = x;
    const by = y + bounce;

    ctx.font = '900 28px "Bangers", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(text).width;
    const boxW = Math.max(300, textWidth + 50);
    const boxH = 65;

    // Red jagged spiked starburst comic bubble
    ctx.fillStyle = '#c0392b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    ctx.beginPath();
    const spikes = 18;
    const outerRadius = boxW / 2;
    const innerRadius = boxW / 2 - 15;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const nextAngle = ((i + 0.5) / spikes) * Math.PI * 2;
      const rx = (i % 2 === 0 ? outerRadius : innerRadius) * Math.cos(angle);
      const ry = ((i % 2 === 0 ? outerRadius : innerRadius) * (boxH / boxW)) * Math.sin(angle);
      if (i === 0) ctx.moveTo(bx + rx, by + ry);
      else ctx.lineTo(bx + rx, by + ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text in bubble with vibrant yellow glow
    ctx.fillStyle = '#f1c40f';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(text, bx, by);

    ctx.restore();
  }

  drawSpeechBubble(ctx, x, y, text) {
    ctx.save();
    ctx.font = '900 17px "Bangers", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(text).width;
    const paddingX = 14;
    const boxW = Math.max(90, textWidth + paddingX * 2);
    const boxH = 34;

    const bx = x - boxW / 2;
    const by = y - boxH - 12;

    // Comic speech bubble outline
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    // Bubble box with rounded corners
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer triangle to mouth
    ctx.beginPath();
    ctx.moveTo(x - 6, by + boxH);
    ctx.lineTo(x, by + boxH + 10);
    ctx.lineTo(x + 6, by + boxH);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Bubble text
    ctx.fillStyle = '#c0392b';
    ctx.fillText(text, x, by + boxH / 2);
    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      if (p.type === 'ripple') {
        ctx.strokeStyle = `rgba(243, 156, 18, ${p.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'dust') {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
      ctx.restore();
    });
  }

  // Procedural fallback character rendering in case image files aren't ready
  drawStudentProcedural(ctx, x, y, isShouting, isMoving) {
    // Head
    ctx.fillStyle = '#f5cd79';
    ctx.beginPath();
    ctx.arc(x, y - 25, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#303952';
    ctx.beginPath();
    ctx.arc(x, y - 30, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x - 12, y - 13, 24, 22);

    // Legs
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(x - 9, y + 9, 7, 16);
    ctx.fillRect(x + 2, y + 9, 7, 16);

    // Mouth
    if (isShouting) {
      ctx.fillStyle = '#ea2027';
      ctx.beginPath();
      ctx.arc(x, y - 22, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawTeacherProcedural(ctx, x, y, isBoard) {
    // Hair bun
    ctx.fillStyle = '#574b90';
    ctx.beginPath();
    ctx.arc(x, y - 35, 14, 0, Math.PI * 2);
    ctx.fill();

    if (!isBoard) {
      // Face
      ctx.fillStyle = '#f8a5c2';
      ctx.beginPath();
      ctx.arc(x, y - 24, 11, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lab Coat
    ctx.fillStyle = '#f1f2f6';
    ctx.fillRect(x - 14, y - 12, 28, 30);
    ctx.strokeStyle = '#747d8c';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 14, y - 12, 28, 30);
  }
}

window.GameRenderer = GameRenderer;
