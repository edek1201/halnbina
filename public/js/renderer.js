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

    // Desks layout reference (with chair coordinates matching server)
    this.deskSlots = [
      { id: 0, x: 200, y: 260, chairX: 200, chairY: 278, label: 'Ławka 1' },
      { id: 1, x: 420, y: 260, chairX: 420, chairY: 278, label: 'Ławka 2' },
      { id: 2, x: 640, y: 260, chairX: 640, chairY: 278, label: 'Ławka 3' },
      { id: 3, x: 840, y: 260, chairX: 840, chairY: 278, label: 'Ławka 4' },

      { id: 4, x: 200, y: 410, chairX: 200, chairY: 428, label: 'Ławka 5' },
      { id: 5, x: 420, y: 410, chairX: 420, chairY: 428, label: 'Ławka 6' },
      { id: 6, x: 640, y: 410, chairX: 640, chairY: 428, label: 'Ławka 7' },
      { id: 7, x: 840, y: 410, chairX: 840, chairY: 428, label: 'Ławka 8' },

      { id: 8, x: 200, y: 560, chairX: 200, chairY: 578, label: 'Ławka 9' },
      { id: 9, x: 420, y: 560, chairX: 420, chairY: 578, label: 'Ławka 10' },
      { id: 10, x: 640, y: 560, chairX: 640, chairY: 578, label: 'Ławka 11' },
      { id: 11, x: 840, y: 560, chairX: 840, chairY: 578, label: 'Ławka 12' },
    ];

    // Smooth position interpolation cache for remote players
    this.playerPositions = new Map();
  }

  loadSprites() {
    const assetList = {
      // Romanowski
      romanowskiIdle: '/assets/romanowski.png',
      romanowskiWalk: '/assets/romanowskiidzie.png',
      romanowskiShout: '/assets/romanowskikrzyczy.png',

      // Leszczyński
      leszczynskiIdle: '/assets/leszczynski.png',
      leszczynskiWalk: '/assets/leszczynskiidzie.png',
      leszczynskiShout: '/assets/leszczynskikrzyczy.png',

      // Wolff
      wolffIdle: '/assets/wolff.png',
      wolffWalk: '/assets/wolffidzie.png',
      wolffShout: '/assets/wolffkrzyczy.png',

      // Items
      mleko: '/assets/mleko.png',
      kleszcz: '/assets/kleszcz.png',

      // Teacher
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

  render(gameState, myId, dt, hoveredStudentId) {
    const ctx = this.ctx;
    this.updateParticles(dt);

    ctx.clearRect(0, 0, this.width, this.height);

    // Camera shake during Halbina rage outburst or Boss phase 3 enrage
    const isRaging = gameState.teacher && gameState.teacher.state === 'RAGE';
    const isBossEnraged = gameState.boss && gameState.boss.phase === 3;
    if (isRaging || isBossEnraged) {
      ctx.save();
      const shakeAmp = isBossEnraged ? 8 : 6;
      ctx.translate((Math.random() - 0.5) * shakeAmp, (Math.random() - 0.5) * shakeAmp);
    }

    // 1. Draw Classroom Floor
    this.drawFloor(ctx);

    // 2. Draw Blackboard & Wall
    this.drawBlackboard(ctx);

    // 3. Draw Boss Acid Puddles & Chalk Pickups (Floor hazards & items)
    if (gameState.boss) {
      if (gameState.boss.acidPuddles) {
        this.drawAcidPuddles(ctx, gameState.boss.acidPuddles);
      }
      if (gameState.boss.chalkPickups) {
        this.drawChalkPickups(ctx, gameState.boss.chalkPickups);
      }
    }

    // 4. Draw Student Desks & Chairs
    this.drawDesks(ctx, gameState, myId);

    // 5. Draw Teacher Executive Desk
    this.drawTeacherDesk(ctx);

    // 6. Draw Vision Cone / Attention Field (Normal modes only)
    if (!gameState.boss && gameState.teacher && (gameState.teacher.state === 'CLASS' || gameState.teacher.state === 'RAGE')) {
      this.drawTeacherVisionCone(ctx, gameState.teacher);
    }

    // 7. Draw Teacher / Mega Halbina Boss
    if (gameState.teacher) {
      this.drawTeacher(ctx, gameState.teacher, dt, gameState.boss);
    }

    // 8. Interpolate & Draw Students
    if (gameState.players) {
      // Clean up disconnected players from lerp map
      const activeIds = new Set(gameState.players.map(p => p.id));
      for (const id of this.playerPositions.keys()) {
        if (!activeIds.has(id)) this.playerPositions.delete(id);
      }

      // Smooth 60 FPS lerp for remote players
      gameState.players.forEach(p => {
        let pos = this.playerPositions.get(p.id);
        if (!pos) {
          pos = { x: p.x, y: p.y };
          this.playerPositions.set(p.id, pos);
        }
        if (p.id === myId) {
          pos.x = p.x;
          pos.y = p.y;
        } else {
          pos.x += (p.x - pos.x) * Math.min(1, dt * 18);
          pos.y += (p.y - pos.y) * Math.min(1, dt * 18);
        }
        p.renderX = pos.x;
        p.renderY = pos.y;
      });

      // Sort by Y for depth layering
      const sorted = [...gameState.players].sort((a, b) => (a.renderY || a.y) - (b.renderY || b.y));
      sorted.forEach(player => {
        if (player.role === 'STUDENT') {
          this.drawStudent(ctx, player, player.id === myId);
        }
      });
    }

    // 9. Draw Vape Smoke Clouds (conceals students inside)
    if (gameState.smokeClouds) {
      this.drawSmokeClouds(ctx, gameState.smokeClouds);
    }

    // 10. Draw Projectiles (Paper airplanes, Super Chalk, Kleszcze, Acid Flasks, Exams)
    if (gameState.projectiles) {
      this.drawProjectiles(ctx, gameState.projectiles);
    }

    // 11. Draw Teacher Desk Inspection Reticle (if teacher is inspecting)
    if (gameState.teacher && gameState.players) {
      const isTeacher = gameState.teacher.teacherId === myId || gameState.players.find(p => p.id === myId)?.role === 'TEACHER';
      if (isTeacher) {
        this.drawTeacherInspectTarget(ctx, gameState.teacher, gameState.players, hoveredStudentId);
      }
    }

    // 12. Draw Police Raid flashing lights (Szkieły jadą!)
    if (gameState.policeActive) {
      this.drawPoliceLights(ctx);
    }

    // 13. Draw Particles (ripples, dust, steam)
    this.drawParticles(ctx);

    // 14. Draw Speech Bubbles (on top of characters)
    if (gameState.players) {
      gameState.players.forEach(player => {
        if (player.isShouting && player.shoutText) {
          const px = player.renderX || player.x;
          const py = player.renderY || player.y;
          this.drawSpeechBubble(ctx, px, py - 48, player.shoutText);
        }
      });
    }

    // 15. Draw Halbina Speech Bubble & RAGE bubble on center above her
    if (gameState.teacher) {
      if (isRaging && gameState.teacher.rageText) {
        this.drawHalbinaRageBubble(ctx, gameState.teacher.x, gameState.teacher.y - 85, gameState.teacher.rageText);
      } else if (gameState.teacher.speechText) {
        this.drawTeacherSpeechBubble(ctx, gameState.teacher.x, gameState.teacher.y - 80, gameState.teacher.speechText);
      }
    }

    if (isRaging || isBossEnraged) {
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

  drawAcidPuddles(ctx, acidPuddles) {
    if (!acidPuddles || acidPuddles.length === 0) return;
    const time = Date.now() / 1000;

    acidPuddles.forEach(puddle => {
      ctx.save();
      const radius = puddle.radius || 46;
      const progress = puddle.timer / puddle.duration;
      const alpha = Math.min(0.9, Math.max(0.2, progress * 1.1));

      // Outer warning ring
      ctx.strokeStyle = `rgba(46, 204, 113, ${alpha * 0.8})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, radius + 4, (radius + 4) * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Acid puddle liquid radial gradient
      const grad = ctx.createRadialGradient(puddle.x, puddle.y, 4, puddle.x, puddle.y, radius);
      grad.addColorStop(0, `rgba(168, 230, 207, ${alpha * 0.95})`);
      grad.addColorStop(0.4, `rgba(46, 204, 113, ${alpha * 0.85})`);
      grad.addColorStop(0.8, `rgba(39, 174, 96, ${alpha * 0.7})`);
      grad.addColorStop(1, `rgba(22, 160, 133, 0.1)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, radius, radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated rising green acid bubbles
      for (let b = 0; b < 4; b++) {
        const bubblePhase = (time * 2 + b * 1.5) % 1;
        const bx = puddle.x + Math.sin(time * 3 + b * 2) * (radius * 0.6);
        const by = puddle.y + Math.cos(time * 2 + b * 2) * (radius * 0.3) - bubblePhase * 14;
        const br = 2 + bubblePhase * 3.5;
        const bAlpha = (1 - bubblePhase) * alpha;

        ctx.fillStyle = `rgba(240, 255, 0, ${bAlpha})`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // Toxic Hazard icon & label in center
      ctx.font = '700 12px "Fredoka", sans-serif';
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.textAlign = 'center';
      ctx.fillText('☣️ KWAS H₂SO₄', puddle.x, puddle.y + 4);

      // Remaining duration timer ring
      const timerAngle = (1 - progress) * Math.PI * 2;
      ctx.strokeStyle = `rgba(241, 196, 15, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(puddle.x, puddle.y + 4, 13, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 - timerAngle));
      ctx.stroke();

      ctx.restore();
    });
  }

  drawChalkPickups(ctx, chalkPickups) {
    if (!chalkPickups || chalkPickups.length === 0) return;
    const time = Date.now() / 300;

    chalkPickups.forEach(chalk => {
      ctx.save();
      const bounce = Math.sin(time) * 4;
      const cy = chalk.y + bounce;

      // Glow halo on floor
      ctx.fillStyle = 'rgba(0, 206, 201, 0.35)';
      ctx.beginPath();
      ctx.ellipse(chalk.x, chalk.y + 10, 22, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floating rotating Super Chalk stick
      ctx.save();
      ctx.translate(chalk.x, cy);
      ctx.rotate(Math.sin(time * 0.8) * 0.15);

      // Chalk body
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(-13, -5, 26, 10);
      ctx.fillStyle = '#81ecec';
      ctx.fillRect(-11, -3, 22, 6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-13, -5, 26, 10);

      // Sparkles ✨
      ctx.font = '11px Arial';
      ctx.fillText('✨', 8, -7);
      ctx.restore();

      // Prompt label
      ctx.font = '700 10px "Fredoka", sans-serif';
      ctx.fillStyle = '#00cec9';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText('🖍️ KREDA (+85 DMG)', chalk.x, chalk.y - 16 + bounce);

      ctx.restore();
    });
  }

  drawDesks(ctx, gameState, myId) {
    const myPlayer = gameState.players ? gameState.players.find(p => p.id === myId) : null;
    const assignedDeskIndex = myPlayer ? myPlayer.assignedDeskIndex : -1;
    const currentDeskIndex = myPlayer ? myPlayer.currentDeskIndex : -1;

    this.deskSlots.forEach(desk => {
      const isMyAssigned = desk.id === assignedDeskIndex;
      const isMyCurrent = desk.id === currentDeskIndex;
      const cx = desk.chairX || desk.x;
      const cy = desk.chairY || (desk.y + 18);

      // --- 1. DRAW SCHOOL CHAIR ---
      // Chair shadow on floor
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chair tubular metal legs
      ctx.strokeStyle = '#34495e';
      ctx.lineWidth = 2.5;
      // Front left leg
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy + 3);
      ctx.lineTo(cx - 15, cy + 13);
      ctx.stroke();
      // Front right leg
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy + 3);
      ctx.lineTo(cx + 15, cy + 13);
      ctx.stroke();
      // Back frame uprights
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 2);
      ctx.lineTo(cx - 14, cy - 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy - 2);
      ctx.lineTo(cx + 14, cy - 14);
      ctx.stroke();

      // Wooden chair seat
      ctx.fillStyle = '#b3804d';
      ctx.beginPath();
      ctx.roundRect(cx - 15, cy - 3, 30, 11, 3);
      ctx.fill();
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Wooden curved chair backrest
      ctx.fillStyle = '#b3804d';
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 16, 32, 7, 2);
      ctx.fill();
      ctx.strokeStyle = '#8b5a2b';
      ctx.stroke();

      // --- 2. ASSIGNED & CURRENT SEAT INDICATORS ---
      if (isMyAssigned) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.22)';
        ctx.beginPath();
        ctx.ellipse(desk.x, desk.y + 10, 62, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '700 11px "Fredoka", sans-serif';
        ctx.fillStyle = '#2ecc71';
        ctx.textAlign = 'center';
        ctx.fillText("TWOJA ŁAWKA", desk.x, desk.y + 44);
      } else if (isMyCurrent) {
        ctx.fillStyle = 'rgba(243, 156, 18, 0.22)';
        ctx.beginPath();
        ctx.ellipse(desk.x, desk.y + 10, 62, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f39c12';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '700 10px "Fredoka", sans-serif';
        ctx.fillStyle = '#f39c12';
        ctx.textAlign = 'center';
        ctx.fillText("OBCA ŁAWKA (Ryzyko!)", desk.x, desk.y + 44);
      }

      // --- 3. DRAW DESK TABLETOP & METAL LEGS ---
      // Desk shadow on floor
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(desk.x, desk.y + 18, 54, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tubular steel desk legs (Left and Right U-frame)
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(desk.x - 45, desk.y + 4, 5, 14);
      ctx.fillRect(desk.x + 40, desk.y + 4, 5, 14);
      // Rubber feet
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(desk.x - 46, desk.y + 17, 7, 3);
      ctx.fillRect(desk.x + 39, desk.y + 17, 7, 3);

      // Desk tabletop outer bevel
      ctx.fillStyle = '#7a4e28';
      ctx.beginPath();
      ctx.roundRect(desk.x - 49, desk.y - 13, 98, 25, 4);
      ctx.fill();

      // Desk tabletop warm polished surface
      ctx.fillStyle = '#a66a38';
      ctx.beginPath();
      ctx.roundRect(desk.x - 47, desk.y - 11, 94, 21, 3);
      ctx.fill();

      // Top bevel highlight edge
      ctx.fillStyle = '#c58a56';
      ctx.fillRect(desk.x - 47, desk.y - 11, 94, 2);

      // Pencil groove with blue pen
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(desk.x - 42, desk.y - 8, 30, 2);
      ctx.fillStyle = '#3498db';
      ctx.fillRect(desk.x - 39, desk.y - 9, 24, 2);

      // Open notebook with lined pages
      ctx.fillStyle = '#f5f6fa';
      ctx.fillRect(desk.x + 2, desk.y - 8, 20, 15);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(desk.x + 2, desk.y - 8, 20, 15);
      // Ruled lines in notebook
      ctx.strokeStyle = '#74b9ff';
      ctx.beginPath();
      ctx.moveTo(desk.x + 5, desk.y - 4);
      ctx.lineTo(desk.x + 19, desk.y - 4);
      ctx.moveTo(desk.x + 5, desk.y);
      ctx.lineTo(desk.x + 19, desk.y);
      ctx.stroke();

      // Chemistry textbook on desk corner
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(desk.x - 18, desk.y - 7, 15, 13);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 6px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CHEM', desk.x - 11, desk.y + 1);

      // Desk number badge
      ctx.font = '700 9px "Fredoka", sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.textAlign = 'right';
      ctx.fillText(`Nr ${desk.id + 1}`, desk.x + 44, desk.y + 6);
    });
  }

  drawTeacherVisionCone(ctx, teacher) {
    const tx = teacher.x;
    const ty = teacher.y + 15;
    const dyBottom = 700 - ty;
    const maxDxBottom = 55 + dyBottom * 0.62;

    const grad = ctx.createRadialGradient(tx, ty, 30, tx, ty + 240, 480);
    grad.addColorStop(0, 'rgba(231, 76, 60, 0.42)');
    grad.addColorStop(0.5, 'rgba(231, 76, 60, 0.20)');
    grad.addColorStop(1, 'rgba(231, 76, 60, 0.04)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx - 55, ty);
    ctx.lineTo(tx + 55, ty);
    ctx.lineTo(tx + maxDxBottom, 700);
    ctx.lineTo(tx - maxDxBottom, 700);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawTeacher(ctx, teacher, dt, boss) {
    const x = teacher.x;
    const y = teacher.y;
    const isBoss = boss && boss.isBossMode;

    // --- BOSS FIGHT AURAS & EFFECTS ---
    if (isBoss) {
      ctx.save();
      const phase = boss.phase || 1;
      const time = Date.now() / 200;

      if (phase === 1) {
        // Toxic chemical vapor aura
        const auraGrad = ctx.createRadialGradient(x, y - 15, 15, x, y - 15, 55);
        auraGrad.addColorStop(0, 'rgba(46, 204, 113, 0.45)');
        auraGrad.addColorStop(0.7, 'rgba(155, 89, 182, 0.25)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(x, y - 15, 55, 0, Math.PI * 2);
        ctx.fill();
      } else if (phase === 2) {
        // Irritated crackling electricity aura
        const auraGrad = ctx.createRadialGradient(x, y - 15, 20, x, y - 15, 65);
        auraGrad.addColorStop(0, 'rgba(243, 156, 18, 0.55)');
        auraGrad.addColorStop(0.7, 'rgba(230, 126, 34, 0.3)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(x, y - 15, 65, 0, Math.PI * 2);
        ctx.fill();

        // Electric sparks around Halbina
        for (let s = 0; s < 3; s++) {
          const sx = x + (Math.sin(time + s * 2) * 40);
          const sy = y - 15 + (Math.cos(time + s * 2) * 35);
          ctx.strokeStyle = '#f1c40f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx - 4, sy - 4);
          ctx.lineTo(sx + 4, sy + 4);
          ctx.stroke();
        }
      } else if (phase === 3) {
        // Enraged Inferno Firestorm!
        const auraGrad = ctx.createRadialGradient(x, y - 15, 20, x, y - 15, 75);
        auraGrad.addColorStop(0, 'rgba(231, 76, 60, 0.7)');
        auraGrad.addColorStop(0.5, 'rgba(192, 57, 43, 0.45)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(x, y - 15, 75, 0, Math.PI * 2);
        ctx.fill();

        // Rising fire particles
        for (let f = 0; f < 4; f++) {
          const fx = x + Math.sin(time * 2 + f * 1.6) * 35;
          const fy = y - 10 - ((Date.now() / 80 + f * 15) % 45);
          ctx.fillStyle = '#ff7675';
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // --- TEACHER BODY RENDERING ---
    if (teacher.state === 'BOARD' && !isBoss) {
      if (Math.random() < 0.2) this.addChalkDust(x + 15, y - 20);

      if (this.images.teacherBoard && this.images.teacherBoard.complete) {
        ctx.drawImage(this.images.teacherBoard, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, true);
      }
    } else if (teacher.state === 'TURNING' && !isBoss) {
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
    } else if (teacher.state === 'RAGE' || isBoss) {
      this.addSteamPuff(x - 20, y - 48);
      this.addSteamPuff(x + 20, y - 48);

      if (this.images.teacherClass && this.images.teacherClass.complete) {
        ctx.drawImage(this.images.teacherClass, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, false);
      }

      // Blazing red glaring eyes
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(x - 6, y - 32, 3.5, 0, Math.PI * 2);
      ctx.arc(x + 6, y - 32, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Comic anger vein mark (💢)
      ctx.fillStyle = '#ff1744';
      ctx.font = '900 22px Arial';
      ctx.fillText('💢', x + 18, y - 48);
    } else {
      if (this.images.teacherClass && this.images.teacherClass.complete) {
        ctx.drawImage(this.images.teacherClass, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, false);
      }

      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.arc(x - 5, y - 32, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 32, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- BOSS STATUS OVERHEAD: STUN / BLEED / HP BAR ---
    if (isBoss) {
      // Stun dizzy stars 💫
      if (boss.isStunned) {
        ctx.save();
        const stunAngle = Date.now() / 200;
        for (let s = 0; s < 3; s++) {
          const sa = stunAngle + s * (Math.PI * 2 / 3);
          const sx = x + Math.cos(sa) * 26;
          const sy = y - 55 + Math.sin(sa) * 10;
          ctx.font = '16px Arial';
          ctx.fillText('💫', sx, sy);
        }
        ctx.restore();
      }

      // Bleed indicator 🩸
      if (boss.isBleeding) {
        ctx.save();
        ctx.font = '700 11px "Fredoka", sans-serif';
        ctx.fillStyle = '#e74c3c';
        ctx.textAlign = 'center';
        ctx.fillText('🩸 KRWAWIENIE (-20 HP/s)', x, y - 66);
        ctx.restore();
      }

      // Name & Phase badge
      ctx.font = '900 14px "Bangers", cursive, sans-serif';
      ctx.fillStyle = boss.phase === 3 ? '#ff4d4d' : boss.phase === 2 ? '#f39c12' : '#2ecc71';
      ctx.textAlign = 'center';
      ctx.fillText(`💀 MEGA HALBINA [FAZA ${boss.phase}]`, x, y + 36);

      // Mini Health Bar on canvas
      const barW = 120;
      const barH = 10;
      const barX = x - barW / 2;
      const barY = y + 42;
      const hpPct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

      ctx.fillStyle = hpPct > 0.6 ? '#2ecc71' : hpPct > 0.3 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(barX, barY, barW * hpPct, barH);

      ctx.font = '700 9px "Fredoka", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${boss.hp} / ${boss.maxHp} HP`, x, barY + 8);
    } else {
      // Normal Teacher Name Badge
      ctx.font = '700 13px "Fredoka", sans-serif';
      ctx.fillStyle = teacher.state === 'RAGE' ? '#ff4d4d' : '#f6e58d';
      ctx.textAlign = 'center';
      const tag = teacher.state === 'RAGE' ? '🔥 WŚCIEKŁA KATARZYNA HALBINA 🔥' : 'Katarzyna Halbina';
      ctx.fillText(tag, x, y + 36);
    }
  }

  drawStudent(ctx, student, isMe) {
    const x = student.renderX || student.x;
    const y = student.renderY || student.y;

    if (student.isEliminated) {
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

    if (student.immunity && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const char = student.character || 'romanowski';

    // Ducking under desk pose!
    if (student.isDucking) {
      ctx.save();
      let sprite = this.images[`${char}Idle`];
      if (sprite && sprite.complete) {
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

    // Romanowski Speed Boost Milk Effect
    if (student.speedBoost) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.ellipse(x - (student.isMoving ? 16 * i : 0), y + 15, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (this.images.mleko && this.images.mleko.complete) {
        ctx.drawImage(this.images.mleko, x - 36, y - 40, 22, 22);
      }
      ctx.restore();
    }

    // Super Chalk Carrier Aura
    if (student.hasSuperChalk) {
      ctx.save();
      ctx.strokeStyle = '#00cec9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 10, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '12px Arial';
      ctx.fillText('🖍️', x + 16, y - 36);
      ctx.restore();
    }

    // Wolff Vape Smoke Veil
    if (student.isInSmoke) {
      ctx.save();
      ctx.fillStyle = 'rgba(162, 155, 254, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y - 10, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let sprite = this.images[`${char}Idle`];
    if (student.isShouting) {
      sprite = this.images[`${char}Shout`];
      if (Math.random() < 0.15) {
        this.addSoundRipples(x, y - 25);
      }
    } else if (student.isMoving) {
      sprite = this.images[`${char}Walk`];
    }

    if (sprite && sprite.complete) {
      ctx.drawImage(sprite, x - 32, y - 50, 64, 80);
    } else {
      this.drawStudentProcedural(ctx, x, y, student.isShouting, student.isMoving);
    }

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

    if (student.uwagi > 0) {
      let strikesStr = '';
      for (let i = 0; i < student.uwagi; i++) strikesStr += '⚠️ ';
      ctx.font = '11px Arial';
      ctx.fillText(strikesStr.trim(), x, y + 46);
    }
  }

  // Draw Flying Paper Airplanes, Super Chalk, Kleszcze, Acid Flasks, Exams
  drawProjectiles(ctx, projectiles) {
    projectiles.forEach(p => {
      const curX = p.startX + (p.targetX - p.startX) * p.t;
      const arcHeight = Math.sin(p.t * Math.PI) * 55;
      const curY = p.startY + (p.targetY - p.startY) * p.t - arcHeight;
      const shadowY = p.startY + (p.targetY - p.startY) * p.t;

      // Shadow on floor
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(curX, shadowY, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Acid Flask Projectile (Boss attack)
      if (p.type === 'acid_flask') {
        ctx.save();
        ctx.translate(curX, curY);
        const spin = (Date.now() / 60) % (Math.PI * 2);
        ctx.rotate(spin);

        ctx.fillStyle = 'rgba(46, 204, 113, 0.85)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(6, -14);
        ctx.lineTo(4, -4);
        ctx.lineTo(14, 12);
        ctx.lineTo(-14, 12);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d35400';
        ctx.fillRect(-5, -18, 10, 5);
        ctx.restore();
        return;
      }

      // Exam Barrage Sheet Projectile (Boss attack)
      if (p.type === 'exam') {
        ctx.save();
        ctx.translate(curX, curY);
        const spin = (Date.now() / 90) % (Math.PI * 2);
        ctx.rotate(spin);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -18, 28, 36);
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-14, -18, 28, 36);

        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 1;
        for (let ly = -10; ly <= 12; ly += 6) {
          ctx.beginPath();
          ctx.moveTo(-10, ly);
          ctx.lineTo(10, ly);
          ctx.stroke();
        }

        ctx.font = '900 20px "Bangers", cursive, sans-serif';
        ctx.fillStyle = '#d63031';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1', 0, 0);

        ctx.restore();
        return;
      }

      // Tick Projectile (Leszczyński superpower)
      if (p.type === 'kleszcz') {
        ctx.save();
        ctx.translate(curX, curY);
        const spin = (Date.now() / 40) % (Math.PI * 2);
        ctx.rotate(spin);
        if (this.images.kleszcz && this.images.kleszcz.complete) {
          ctx.drawImage(this.images.kleszcz, -16, -16, 32, 32);
        } else {
          ctx.fillStyle = '#800000';
          ctx.beginPath();
          ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#2c3e50';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      // Super Chalk Projectile (from picking up super chalk)
      if (p.isChalk) {
        ctx.save();
        ctx.translate(curX, curY);
        const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
        ctx.rotate(angle);

        ctx.fillStyle = '#00cec9';
        ctx.fillRect(-16, -6, 32, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -4, 28, 8);
        ctx.strokeStyle = '#55efc4';
        ctx.lineWidth = 2;
        ctx.strokeRect(-16, -6, 32, 12);

        // Blazing cyan trail
        ctx.fillStyle = 'rgba(0, 206, 201, 0.6)';
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(-32, 0);
        ctx.lineTo(-16, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        return;
      }

      // Paper airplane
      ctx.save();
      ctx.translate(curX, curY);
      const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
      ctx.rotate(angle);

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

      ctx.strokeStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-4, 0);
      ctx.stroke();

      ctx.restore();
    });
  }

  // Draw Vape Smoke Clouds (Wolff superpower)
  drawSmokeClouds(ctx, smokeClouds) {
    if (!smokeClouds || smokeClouds.length === 0) return;
    smokeClouds.forEach(cloud => {
      ctx.save();
      const progress = cloud.timer / cloud.duration;
      const alpha = Math.min(0.8, progress * 1.2);

      // Radial gradient for thick vape smoke
      const grad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.radius);
      grad.addColorStop(0, `rgba(240, 240, 245, ${alpha * 0.95})`);
      grad.addColorStop(0.4, `rgba(180, 175, 235, ${alpha * 0.75})`);
      grad.addColorStop(0.8, `rgba(108, 92, 231, ${alpha * 0.35})`);
      grad.addColorStop(1, 'rgba(108, 92, 231, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling smoke puffs around cloud
      for (let i = 0; i < 5; i++) {
        const angle = (Date.now() / 800 + i * (Math.PI * 2 / 5));
        const px = cloud.x + Math.cos(angle) * (cloud.radius * 0.45);
        const py = cloud.y + Math.sin(angle) * (cloud.radius * 0.35);
        ctx.fillStyle = `rgba(245, 246, 250, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small badge: 💨 DYM E-VAPE (UKRYCIE)
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.5)})`;
      ctx.textAlign = 'center';
      ctx.fillText('💨 DYM E-VAPE (UKRYCIE PRZED HALBINĄ)', cloud.x, cloud.y - cloud.radius + 15);

      ctx.restore();
    });
  }

  // Teacher Inspection Target Reticle (Click to inspect student desk)
  drawTeacherInspectTarget(ctx, teacher, players, hoveredStudentId) {
    if (!teacher || (teacher.state !== 'CLASS' && teacher.state !== 'RAGE')) return;
    if (teacher.inspectionsThisTurn >= 1) return;
    if (!hoveredStudentId) return;

    const student = players.find(p => p.id === hoveredStudentId && p.role === 'STUDENT' && !p.isEliminated);
    if (!student) return;

    ctx.save();
    const x = student.x;
    const y = student.y;
    const bounce = Math.sin(Date.now() / 90) * 3;

    // Crosshair circle
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x, y - 10, 36 + bounce, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner targeting marks
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    const s = 25;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - s, y - 10 - s + 8);
    ctx.lineTo(x - s, y - 10 - s);
    ctx.lineTo(x - s + 8, y - 10 - s);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + s, y - 10 - s + 8);
    ctx.lineTo(x + s, y - 10 - s);
    ctx.lineTo(x + s - 8, y - 10 - s);
    ctx.stroke();

    // Inspection prompt tag
    ctx.font = '700 12px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('🔍 KLIKNIJ: SPRAWDŹ ŁAWKĘ!', x, y - 55);

    ctx.restore();
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
    ctx.restore();
  }

  // Comic speech bubble for Halbina in the center above her head
  drawTeacherSpeechBubble(ctx, x, y, text) {
    if (!text) return;
    ctx.save();
    const bounce = Math.sin(Date.now() / 80) * 2;
    const by = y + bounce;

    ctx.font = '900 19px "Bangers", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Check if text needs 2-line wrap
    const words = text.split(' ');
    let line1 = text;
    let line2 = '';
    if (words.length > 5 || ctx.measureText(text).width > 440) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(' ');
      line2 = words.slice(mid).join(' ');
    }

    const w1 = ctx.measureText(line1).width;
    const w2 = line2 ? ctx.measureText(line2).width : 0;
    const maxW = Math.max(w1, w2);
    const boxW = Math.min(620, Math.max(220, maxW + 40));
    const boxH = line2 ? 56 : 38;

    const bx = Math.max(30, Math.min(1000 - boxW - 30, x - boxW / 2));
    const topY = by - boxH;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Speech bubble background
    ctx.fillStyle = '#fffdf7';
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(bx, topY, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Bubble pointer down to Halbina's head
    ctx.beginPath();
    ctx.moveTo(x - 8, topY + boxH);
    ctx.lineTo(x, topY + boxH + 12);
    ctx.lineTo(x + 8, topY + boxH);
    ctx.fillStyle = '#fffdf7';
    ctx.fill();
    ctx.stroke();

    // Bubble text
    ctx.fillStyle = '#c0392b';
    if (line2) {
      ctx.fillText(line1, bx + boxW / 2, topY + 18);
      ctx.fillText(line2, bx + boxW / 2, topY + 39);
    } else {
      ctx.fillText(line1, bx + boxW / 2, topY + boxH / 2);
    }

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
