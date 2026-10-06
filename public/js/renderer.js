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

    // Desks in Sala 204 for Classic Mode
    this.classicDeskSlots = [
      { id: 0, x: 260, y: 270, chairX: 260, chairY: 288, label: 'Ławka 1' },
      { id: 1, x: 260, y: 390, chairX: 260, chairY: 408, label: 'Ławka 2' },
      { id: 2, x: 260, y: 510, chairX: 260, chairY: 528, label: 'Ławka 3' },
      { id: 3, x: 740, y: 270, chairX: 740, chairY: 288, label: 'Ławka 4' },
      { id: 4, x: 740, y: 390, chairX: 740, chairY: 408, label: 'Ławka 5' },
      { id: 5, x: 740, y: 510, chairX: 740, chairY: 528, label: 'Ławka 6' }
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

      // Filip Rzepa (Własna postać 2D z maczetą)
      rzepaIdle: '/assets/rzepa.png',
      rzepaWalk: '/assets/rzepaidzie.png',
      rzepaShout: '/assets/rzepakrzyczy.png',
      rzepaMachete: '/assets/rzepamaczeta.png',

      // Policemen (Szkieły)
      policemanIdle: '/assets/policeman.png',
      policemanWalk: '/assets/policemanidzie.png',
      policemanFlee: '/assets/policemanucieka.png',

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
        life: 0.7,
        maxLife: 0.7
      });
    }
  }

  // Realistic quick vape exhale vapor wisps (rises and dissipates quickly)
  triggerVapePuffAnimation(x, y) {
    if (!x && !y) return;
    for (let i = 0; i < 9; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.1;
      const speed = 24 + Math.random() * 28;
      this.particles.push({
        type: 'vape',
        x: x + (Math.random() - 0.5) * 8,
        y: y - 22 + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 3,
        maxRadius: 18,
        expansionRate: 14 + Math.random() * 6,
        alpha: 0.8,
        life: 0.85 + Math.random() * 0.45,
        maxLife: 0.85 + Math.random() * 0.45
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
      } else if (p.type === 'steam' || p.type === 'vape') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.radius += (p.expansionRate || 14) * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / (p.maxLife || 0.7));
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

    const isClassicMode = (gameState.mode === 'classic_real');
    const myPlayer = gameState.players ? gameState.players.find(p => p.id === myId) : null;
    const isTeacher = (myPlayer && myPlayer.role === 'TEACHER') || (gameState.teacher && gameState.teacher.teacherId === myId);
    let myZone = isClassicMode ? ((myPlayer && myPlayer.currentZone) ? myPlayer.currentZone : (isTeacher ? 'CHEMISTRY' : 'CORRIDOR')) : 'CHEMISTRY';
    const teacherZone = (gameState.teacher && gameState.teacher.currentZone) ? gameState.teacher.currentZone : (isTeacher ? myZone : 'CHEMISTRY');

    if (isClassicMode) {
      // 1. Draw distinct full-screen room based on player's current location!
      if (myZone === 'CORRIDOR') {
        this.drawRoomCorridor(ctx, gameState, myId);
      } else if (myZone === 'CHEMISTRY') {
        this.drawRoomChemistry(ctx, gameState, myId);
      } else if (myZone === 'DIRECTOR') {
        this.drawRoomDirector(ctx, gameState, myId);
        // Director NPC in Gabinet
        if (gameState.director) {
          this.drawDirectorNPC(ctx, gameState.director);
        }
      } else if (myZone === 'STAFF_ROOM') {
        this.drawRoomStaff(ctx, gameState, myId);
      } else if (myZone === 'BUFFET') {
        this.drawRoomBuffet(ctx, gameState, myId);
      } else if (myZone === 'TOILET') {
        this.drawRoomToilet(ctx, gameState, myId);
        // Shady Dealer in Kabina 2 (if spawned at 11:55)
        if (gameState.dealer && gameState.dealer.spawned) {
          this.drawDealerNPC(ctx, gameState.dealer);
        }
      } else if (myZone === 'JANITOR_ROOM') {
        this.drawRoomJanitor(ctx, gameState, myId);
      } else if (myZone === 'CHEM_LAB') {
        this.drawRoomChemLab(ctx, gameState, myId);
      } else if (myZone === 'SERVER_ROOM') {
        this.drawRoomServer(ctx, gameState, myId);
      } else if (myZone === 'COURTYARD') {
        this.drawRoomCourtyard(ctx, gameState, myId);
      }

      // Draw Halbina & Vision Cone if present in the viewer's current room!
      const isTeacherPresent = gameState.teacher && (teacherZone === myZone);
      if (isTeacherPresent) {
        if (!gameState.teacher.isStunned && !gameState.policeActive) {
          this.drawTeacherVisionCone(ctx, gameState.teacher, isTeacher);
        }
        this.drawTeacher(ctx, gameState.teacher, dt, null);
      }
    } else {
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

      // 6. Draw Vision Cone / Attention Field (Normal modes only - not during police raid)
      if (!gameState.boss && gameState.teacher && (gameState.teacher.state === 'CLASS' || gameState.teacher.state === 'RAGE') && !gameState.policeActive && !gameState.teacher.isStunned) {
        this.drawTeacherVisionCone(ctx, gameState.teacher);
      }

      // 7. Draw Teacher / Mega Halbina Boss
      if (gameState.teacher) {
        this.drawTeacher(ctx, gameState.teacher, dt, gameState.boss);
      }
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
          // In Classic Mode, only draw students that are currently in the same room!
          if (isClassicMode && (player.currentZone || 'CORRIDOR') !== myZone) {
            return;
          }
          if (isClassicMode || player.isClassic || player.appearance) {
            this.drawClassicStudent(ctx, player, player.id === myId);
          } else {
            this.drawStudent(ctx, player, player.id === myId);
          }
        }
      });

      // Draw Proximity Interaction Hints for Local Player in Classic Mode
      if (isClassicMode) {
        this.drawClassicInteractionPrompts(ctx, gameState, myId, myZone);
      }
    }

    // 8.5. Draw Police Officers (Szkieły)
    if (gameState.policeOfficers && gameState.policeOfficers.length > 0) {
      this.drawPoliceOfficers(ctx, gameState.policeOfficers, dt);
    }

    // 9. Draw Vape Smoke Clouds (conceals students inside)
    if (gameState.smokeClouds) {
      this.drawSmokeClouds(ctx, gameState.smokeClouds);
    }

    // 9.5 Teacher Limited Field of View Mask (Darkness outside vision cone in classic realistic mode)
    if (isClassicMode && isTeacher && gameState.teacher) {
      this.drawTeacherFieldOfViewMask(ctx, gameState.teacher);
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
    if (gameState.teacher && (!isClassicMode || teacherZone === myZone)) {
      if (isRaging && gameState.teacher.rageText) {
        this.drawHalbinaRageBubble(ctx, gameState.teacher.x, gameState.teacher.y - 85, gameState.teacher.rageText);
      } else if (gameState.teacher.speechText) {
        this.drawTeacherSpeechBubble(ctx, gameState.teacher.x, gameState.teacher.y - 80, gameState.teacher.speechText);
      }
    }

    // School Blackout overlay (sabotaged fuse box)
    if (gameState.schoolBlackout) {
      ctx.save();
      ctx.fillStyle = 'rgba(8, 12, 20, 0.92)';
      ctx.fillRect(0, 0, this.width, this.height);
      const myPlayer = gameState.players ? gameState.players.find(p => p.id === myId) : null;
      if (myPlayer) {
        const px = myPlayer.renderX || myPlayer.x;
        const py = myPlayer.renderY || myPlayer.y;
        const spot = ctx.createRadialGradient(px, py, 10, px, py, 110);
        spot.addColorStop(0, 'rgba(255, 245, 180, 0.35)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spot;
        ctx.beginPath();
        ctx.arc(px, py, 110, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = '800 15px "Fredoka", sans-serif';
      ctx.fillStyle = '#f1c40f';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ AWARIA ZASILANIA - SZKOŁA W CIEMNOŚCIACH! ⚡', 500, 35);
      ctx.restore();
    }

    // 16. Teacher Fog of War & Blindness Blackout (applies when client is playing as teacher!)
    this.drawTeacherBlackout(ctx, gameState, myId);

    if (isRaging || isBossEnraged) {
      ctx.restore();
    }
  }

  drawTeacherBlackout(ctx, gameState, myId) {
    if (!gameState || !gameState.teacher) return;
    const isTeacherMe = (gameState.teacher.teacherId === myId) ||
                        (gameState.players && gameState.players.find(p => p.id === myId)?.role === 'TEACHER');
    if (!isTeacherMe) return;

    const teacher = gameState.teacher;

    // Case 1: Stunned & Blinded by Pepper Spray 500ml (Blackout + burning red eyes)
    if (teacher.isStunned || (teacher.stunTimer && teacher.stunTimer > 0)) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 5, 5, 0.97)';
      ctx.fillRect(0, 0, this.width, this.height);

      // Red burning eye irritation vignette
      const grad = ctx.createRadialGradient(this.width / 2, this.height / 2, 80, this.width / 2, this.height / 2, 450);
      grad.addColorStop(0, 'rgba(235, 77, 75, 0.25)');
      grad.addColorStop(1, 'rgba(192, 57, 43, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.font = '900 36px "Bangers", cursive, sans-serif';
      ctx.fillStyle = '#ff4d4d';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText('🌶️ OŚLEPIONA GAZEM PIEPRZOWYM 500ML! 🌶️', this.width / 2, this.height / 2 - 25);

      ctx.font = '700 20px "Fredoka", sans-serif';
      ctx.fillStyle = '#f5f6fa';
      ctx.fillText(`Jesteś ogłuszona i nic nie widzisz! (${Math.ceil(teacher.stunTimer || 3)}s)`, this.width / 2, this.height / 2 + 20);
      ctx.restore();
      return;
    }

    // Case 2: Facing blackboard (BOARD state) -> Blackout below teacher desk (cannot see behind her back)
    if (teacher.state === 'BOARD') {
      ctx.save();
      ctx.fillStyle = 'rgba(12, 14, 20, 0.96)';
      ctx.fillRect(0, 165, this.width, this.height - 165);

      ctx.font = '900 28px "Bangers", cursive, sans-serif';
      ctx.fillStyle = '#f1c40f';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText('👀 PISZESZ NA TABLICY...', this.width / 2, 380);

      ctx.font = '700 17px "Fredoka", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Nie widzisz co dzieje się za Twoimi plecami w klasie!', this.width / 2, 415);

      ctx.font = '600 15px "Fredoka", sans-serif';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('Wciśnij [SPACJA] lub kliknij "OBRÓĆ SIĘ", aby spojrzeć na uczniów!', this.width / 2, 445);
      ctx.restore();
      return;
    }

    // Case 3: Facing class (CLASS state) -> Only sees within her vision cone, blackout everywhere else!
    if (teacher.state === 'CLASS') {
      ctx.save();
      const tx = teacher.x;
      const ty = teacher.y + 15;
      const dyBottom = 700 - ty;
      const maxDxBottom = 55 + dyBottom * 0.62;

      ctx.beginPath();
      // Outer canvas rectangle (clockwise)
      ctx.rect(0, 0, this.width, this.height);
      // Inner vision cone polygon (counter-clockwise)
      ctx.moveTo(tx - 55, ty);
      ctx.lineTo(tx - maxDxBottom, 700);
      ctx.lineTo(tx + maxDxBottom, 700);
      ctx.lineTo(tx + 55, ty);
      ctx.closePath();

      ctx.fillStyle = 'rgba(10, 12, 18, 0.95)';
      ctx.fill('evenodd');

      ctx.font = '700 13px "Fredoka", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.textAlign = 'center';
      ctx.fillText('🌑 MGŁA WOJNY (Poza polem widzenia)', 120, 420);
      ctx.fillText('🌑 MGŁA WOJNY (Poza polem widzenia)', 880, 420);
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

  drawTeacherVisionCone(ctx, teacher, isTeacherMe = false) {
    if (!teacher) return;
    const tx = teacher.x;
    const ty = teacher.y - 8;
    const angle = (teacher.angle !== undefined) ? teacher.angle : Math.PI / 2;
    const halfFov = 0.785; // 45 deg half-angle (total 90 deg FOV)
    const range = 500;

    const startAngle = angle - halfFov;
    const endAngle = angle + halfFov;

    ctx.save();

    // Radial gradient from Halbina's eyes
    const grad = ctx.createRadialGradient(tx, ty, 20, tx, ty, range);
    if (isTeacherMe) {
      // Warm golden amber surveillance flashlight / line of sight for teacher player
      grad.addColorStop(0, 'rgba(255, 235, 120, 0.42)');
      grad.addColorStop(0.35, 'rgba(241, 196, 15, 0.22)');
      grad.addColorStop(0.7, 'rgba(241, 196, 15, 0.09)');
      grad.addColorStop(1, 'rgba(241, 196, 15, 0.01)');
    } else {
      // Ominous crimson red detection zone for students
      grad.addColorStop(0, 'rgba(231, 76, 60, 0.48)');
      grad.addColorStop(0.35, 'rgba(231, 76, 60, 0.25)');
      grad.addColorStop(0.7, 'rgba(231, 76, 60, 0.10)');
      grad.addColorStop(1, 'rgba(231, 76, 60, 0.02)');
    }

    // Vision cone wedge
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.arc(tx, ty, range, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Boundary dashed perimeter
    ctx.strokeStyle = isTeacherMe ? 'rgba(241, 196, 15, 0.65)' : 'rgba(231, 76, 60, 0.60)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central sightline laser beam
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(angle) * range, ty + Math.sin(angle) * range);
    ctx.strokeStyle = isTeacherMe ? 'rgba(255, 235, 120, 0.45)' : 'rgba(231, 76, 60, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eye glint / lens origin
    ctx.fillStyle = isTeacherMe ? '#f1c40f' : '#e74c3c';
    ctx.beginPath();
    ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawTeacherFieldOfViewMask(ctx, teacher) {
    if (!teacher) return;
    const tx = teacher.x;
    const ty = teacher.y - 8;
    const angle = (teacher.angle !== undefined) ? teacher.angle : Math.PI / 2;
    const halfFov = 0.785;
    const range = 520;
    const w = this.width;
    const h = this.height;

    ctx.save();
    // Native canvas evenodd masking: dark fog-of-war everywhere outside vision cone & personal 65px perimeter
    ctx.beginPath();
    // Outer boundary: entire viewport
    ctx.rect(0, 0, w, h);

    // Inner cutout: 65px personal buffer circle around teacher
    ctx.arc(tx, ty, 65, 0, Math.PI * 2, true);

    // Inner cutout: 90-degree vision cone wedge
    ctx.moveTo(tx, ty);
    ctx.arc(tx, ty, range, angle + halfFov, angle - halfFov, true);
    ctx.closePath();

    ctx.fillStyle = 'rgba(10, 14, 22, 0.70)';
    ctx.fill('evenodd');

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
    const angle = (teacher.angle !== undefined) ? teacher.angle : Math.PI / 2;
    const isFacingUp = !isBoss && ((angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) || teacher.state === 'BOARD');
    const isFacingLeft = Math.cos(angle) < -0.35;

    ctx.save();
    if (isFacingLeft) {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }

    if (isFacingUp) {
      if (Math.random() < 0.2) this.addChalkDust(x + 15, y - 20);

      if (this.images.teacherBoard && this.images.teacherBoard.complete) {
        ctx.drawImage(this.images.teacherBoard, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, true);
      }
    } else if (teacher.state === 'TURNING' && !isBoss) {
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
    } else if (teacher.state === 'SHOCKED') {
      if (this.images.teacherClass && this.images.teacherClass.complete) {
        ctx.drawImage(this.images.teacherClass, x - 32, y - 50, 64, 80);
      } else {
        this.drawTeacherProcedural(ctx, x, y, false);
      }

      // Shocked sweat droplets and wide eyes
      ctx.font = '16px Arial';
      ctx.fillText('💦', x + 24, y - 46);
      ctx.fillText('👀', x - 24, y - 46);
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

    ctx.restore();

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
      ctx.fillStyle = teacher.state === 'RAGE' ? '#ff4d4d' : (teacher.state === 'SHOCKED' ? '#7ed6df' : '#f6e58d');
      ctx.textAlign = 'center';
      let tag = 'Katarzyna Halbina';
      if (teacher.state === 'RAGE') tag = '🔥 WŚCIEKŁA KATARZYNA HALBINA 🔥';
      else if (teacher.state === 'SHOCKED') tag = '😱 Zszokowana Halbina (Bezradna)';
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
    if (student.isSwingingMachete || student.macheteSwingTimer > 0) {
      sprite = this.images[`${char}Machete`] || this.images.rzepaMachete || sprite;
      this.drawMacheteSlashEffect(ctx, x, y);
    } else if (student.isShouting) {
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
      if (p.type === 'paper') {
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
        return;
      }

      // Thrown Chair Projectile
      if (p.type === 'chair') {
        ctx.save();
        ctx.translate(curX, curY);
        const spin = (Date.now() / 45) % (Math.PI * 2);
        ctx.rotate(spin);

        // Tubular steel legs
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-14, 22);
        ctx.moveTo(12, 10);
        ctx.lineTo(14, 22);
        ctx.moveTo(-14, 6);
        ctx.lineTo(-14, -14);
        ctx.moveTo(14, 6);
        ctx.lineTo(14, -14);
        ctx.stroke();

        // Wooden chair seat
        ctx.fillStyle = '#b3804d';
        ctx.fillRect(-16, 2, 32, 9);
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-16, 2, 32, 9);

        // Curved backrest
        ctx.fillStyle = '#b3804d';
        ctx.fillRect(-16, -16, 32, 7);
        ctx.strokeRect(-16, -16, 32, 7);

        // Motion blur whoosh arc
        ctx.strokeStyle = 'rgba(230, 126, 34, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
        return;
      }

      // Pepper Spray Stream Projectile (500ml can stream)
      if (p.type === 'pepper_spray') {
        ctx.save();
        ctx.translate(curX, curY);
        const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
        ctx.rotate(angle);

        // Glowing cloud of orange/red burning pepper stream
        const sprayGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
        sprayGrad.addColorStop(0, 'rgba(235, 77, 75, 0.95)');
        sprayGrad.addColorStop(0.5, 'rgba(240, 147, 43, 0.75)');
        sprayGrad.addColorStop(1, 'rgba(255, 121, 63, 0)');
        ctx.fillStyle = sprayGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Chili pepper icon and smoke
        ctx.font = '15px Arial';
        ctx.fillText('🌶️', -12, -4);
        ctx.fillText('💨', 6, 8);

        ctx.restore();
        return;
      }

      // AR-15 High-Velocity 5.56mm Rifle Bullet with Tracer & Smoke
      if (p.type === 'bullet_ar15') {
        ctx.save();
        ctx.translate(curX, curY);
        const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
        ctx.rotate(angle);

        // Blazing yellow tracer
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-12, -2, 24, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -1, 14, 2);

        // Fiery tracer tail
        ctx.strokeStyle = 'rgba(230, 126, 34, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-32, 0);
        ctx.stroke();

        ctx.restore();
        return;
      }

      // Makarov 9mm Pistol Bullet with Brass Glow
      if (p.type === 'bullet_makarov') {
        ctx.save();
        ctx.translate(curX, curY);
        const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
        ctx.rotate(angle);

        // 9mm bullet head
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(-6, -3, 6, 6);

        // Orange tracer streak
        ctx.strokeStyle = 'rgba(243, 156, 18, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-20, 0);
        ctx.stroke();

        ctx.restore();
        return;
      }

      // Chalk thrown by Halbina
      if (p.type === 'chalk') {
        ctx.save();
        ctx.translate(curX, curY);
        const angle = Math.atan2((p.targetY - p.startY), (p.targetX - p.startX));
        ctx.rotate(angle);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -3, 20, 6);
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -3, 20, 6);

        // White chalk dust tail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-14, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return;
      }
    });
  }

  // Draw Smoke Clouds (Military smoke grenade / arcade clouds)
  drawSmokeClouds(ctx, smokeClouds) {
    if (!smokeClouds || smokeClouds.length === 0) return;
    smokeClouds.forEach(cloud => {
      ctx.save();
      const progress = cloud.timer / cloud.duration;
      const alpha = Math.min(0.85, progress * 1.25);
      const isHeavyGrenade = cloud.id && (cloud.id.startsWith('heavy_smoke') || cloud.id.startsWith('smoke_plume') || cloud.radius > 120);

      // Radial gradient: dense grey for military smoke grenade, soft purple for arcade
      const grad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.radius);
      if (isHeavyGrenade) {
        grad.addColorStop(0, `rgba(230, 230, 235, ${alpha * 0.95})`);
        grad.addColorStop(0.4, `rgba(170, 170, 180, ${alpha * 0.8})`);
        grad.addColorStop(0.8, `rgba(110, 110, 120, ${alpha * 0.45})`);
        grad.addColorStop(1, 'rgba(80, 80, 90, 0)');
      } else {
        grad.addColorStop(0, `rgba(240, 240, 245, ${alpha * 0.95})`);
        grad.addColorStop(0.4, `rgba(180, 175, 235, ${alpha * 0.75})`);
        grad.addColorStop(0.8, `rgba(108, 92, 231, ${alpha * 0.35})`);
        grad.addColorStop(1, 'rgba(108, 92, 231, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling smoke puffs around cloud
      for (let i = 0; i < 6; i++) {
        const angle = (Date.now() / 800 + i * (Math.PI * 2 / 6));
        const px = cloud.x + Math.cos(angle) * (cloud.radius * 0.45);
        const py = cloud.y + Math.sin(angle) * (cloud.radius * 0.35);
        ctx.fillStyle = isHeavyGrenade ? `rgba(210, 210, 215, ${alpha * 0.45})` : `rgba(245, 246, 250, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Badge label
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.5)})`;
      ctx.textAlign = 'center';
      const cloudLabel = isHeavyGrenade ? '🚨 GĘSTY DYM WOJSKOWY (ŚWIECA DYMNA)' : '💨 DYM E-VAPE (UKRYCIE)';
      ctx.fillText(cloudLabel, cloud.x, cloud.y - cloud.radius + 15);

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

  // Draw Real Police Officers (Szkieły) running into the classroom
  drawPoliceOfficers(ctx, policeOfficers, dt) {
    if (!policeOfficers || policeOfficers.length === 0) return;

    policeOfficers.forEach(cop => {
      const x = cop.x;
      const y = cop.y;

      // Shadow on floor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(x, y + 16, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flashing siren light aura around cop
      const sirenColor = Math.floor(Date.now() / 150) % 2 === 0 ? 'rgba(52, 152, 219, 0.35)' : 'rgba(231, 76, 60, 0.35)';
      ctx.fillStyle = sirenColor;
      ctx.beginPath();
      ctx.arc(x, y - 10, 24, 0, Math.PI * 2);
      ctx.fill();

      // Sprite selection
      let sprite = this.images.policemanIdle;
      if (cop.state === 'FLEEING') {
        sprite = this.images.policemanFlee || sprite;
      } else {
        sprite = this.images.policemanWalk || sprite;
      }

      ctx.save();
      if (cop.hitTimer) {
        ctx.filter = 'brightness(2.2) drop-shadow(0 0 10px #ff3838)';
      }

      if (sprite && sprite.complete) {
        if (cop.state === 'FLEEING') {
          const wobble = Math.sin(Date.now() / 40) * 0.15;
          ctx.translate(x, y);
          ctx.rotate(wobble);
          ctx.drawImage(sprite, -32, -50, 64, 80);
        } else {
          ctx.drawImage(sprite, x - 32, y - 50, 64, 80);
        }
      } else {
        // Fallback procedural policeman
        ctx.fillStyle = '#1e3799';
        ctx.fillRect(x - 14, y - 30, 28, 40);
        ctx.fillStyle = '#f6b93b';
        ctx.fillRect(x - 14, y - 20, 28, 16);
      }
      ctx.restore();

      // Name badge
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.fillStyle = cop.state === 'FLEEING' ? '#e74c3c' : '#3498db';
      ctx.textAlign = 'center';
      ctx.fillText(`👮 ${cop.name}`, x, y + 30);

      // Mini Health Bar (HP pips)
      const barW = 34;
      const barH = 5;
      const barX = x - barW / 2;
      const barY = y - 56;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      const hpPct = Math.max(0, cop.hp / cop.maxHp);
      ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : '#e74c3c';
      ctx.fillRect(barX, barY, barW * hpPct, barH);

      // Speech bubble
      if (cop.speech) {
        this.drawSpeechBubble(ctx, x, y - 52, cop.speech);
      }
    });
  }

  // Glowing Machete Slash Arc Visual Effect for Filip Rzepa
  drawMacheteSlashEffect(ctx, x, y) {
    ctx.save();
    // Glowing crescent slash arc in front of Filip Rzepa
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(x + 18, y - 10, 38, -Math.PI * 0.6, Math.PI * 0.4);
    ctx.stroke();

    // Secondary silver blade trail
    ctx.strokeStyle = 'rgba(200, 225, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 24, y - 10, 44, -Math.PI * 0.5, Math.PI * 0.3);
    ctx.stroke();

    // Slash spark glints
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 46, y - 24, 4, 0, Math.PI * 2);
    ctx.arc(x + 40, y + 18, 3, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.shadowBlur = 6;
    ctx.fillText(text, bx, by);
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
      } else if (p.type === 'steam' || p.type === 'vape') {
        ctx.fillStyle = `rgba(235, 240, 255, ${p.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
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

  // ====================================================
  // CLASSIC MODE RENDERING (TRYB REALISTYCZNY)
  // ====================================================

  // 1. KORYTARZ SZKOLNY (CORRIDOR: 1000 x 700)
  drawRoomCorridor(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Shiny linoleum terrazzo floor
    ctx.fillStyle = '#c5beae';
    ctx.fillRect(0, 0, w, h);

    // Subtle 50x50 tile grid
    ctx.strokeStyle = 'rgba(140, 130, 120, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 190);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 190; y <= h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Upper Hallway Wall (y: 0 to 190)
    // Upper plaster
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, w, 130);
    // Lower hallway wainscoting (dark petrol blue)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 130, w, 60);
    // Brass dividing molding trim
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(0, 128, w, 4);

    // School Crest Banner in Center
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(360, 8, 280, 32);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.strokeRect(360, 8, 280, 32);
    ctx.font = '900 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('🏫 ZESPÓŁ SZKÓŁ TECHNICZNYCH', 500, 24);
    ctx.font = '600 10px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('KORYTARZ GŁÓWNY - I PIĘTRO', 500, 36);

    // Large Hallway Wall Clock at (500, 75)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(500, 75, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.font = '700 11px "Fredoka", sans-serif';
    ctx.fillStyle = '#c0392b';
    ctx.fillText(gameState.gameClock || '11:45', 500, 79);

    // ---------------------------------------------
    // 5 INTERACTIVE CLASSROOM DOORS ON TOP WALL
    // ---------------------------------------------

    // DOOR 1: SALA 204 - CHEMIA (x: 180, y: 70 to 190)
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(142, 70, 76, 120);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(146, 75, 68, 115);
    ctx.fillStyle = '#6e4722';
    ctx.fillRect(151, 125, 27, 55);
    ctx.fillRect(182, 125, 27, 55);
    // Glass window at top of door
    ctx.fillStyle = '#a8e6cf';
    ctx.fillRect(151, 82, 58, 36);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(151, 82, 58, 36);
    ctx.font = '16px Arial';
    ctx.fillText('🧪', 180, 106);
    // Brass handle
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(148, 145, 5, 10);
    // Sign above door
    ctx.fillStyle = '#1e382b';
    ctx.fillRect(130, 48, 100, 20);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.strokeRect(130, 48, 100, 20);
    ctx.font = '800 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('SALA 204 - CHEMIA', 180, 62);
    // Entrance rug with hazard lines
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(142, 190, 76, 16);
    ctx.fillStyle = '#f1c40f';
    for (let hx = 142; hx < 218; hx += 14) {
      ctx.fillRect(hx, 190, 7, 16);
    }

    // DOOR 2: GABINET DYREKTORA (x: 370, y: 70 to 190)
    ctx.fillStyle = '#3a1b11';
    ctx.fillRect(332, 70, 76, 120);
    ctx.fillStyle = '#5c2c16';
    ctx.fillRect(336, 75, 68, 115);
    ctx.fillStyle = '#421f10';
    ctx.fillRect(341, 125, 27, 55);
    ctx.fillRect(372, 125, 27, 55);
    // Brass eagle plate
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(350, 84, 40, 28);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(350, 84, 40, 28);
    ctx.font = '14px Arial';
    ctx.fillText('🦅', 370, 103);
    // Brass handle
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(397, 145, 5, 10);
    // Sign above door
    ctx.fillStyle = '#6d1b24';
    ctx.fillRect(320, 48, 100, 20);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.strokeRect(320, 48, 100, 20);
    ctx.font = '800 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('GABINET DYREKTORA', 370, 62);
    // Red plush runner mat
    ctx.fillStyle = '#922b21';
    ctx.fillRect(332, 190, 76, 18);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1;
    ctx.strokeRect(332, 190, 76, 18);

    // DOOR 3: POKÓJ NAUCZYCIELSKI (x: 550, y: 70 to 190)
    ctx.fillStyle = '#2c1e3b';
    ctx.fillRect(512, 70, 76, 120);
    ctx.fillStyle = '#472d62';
    ctx.fillRect(516, 75, 68, 115);
    ctx.fillStyle = '#341f4a';
    ctx.fillRect(521, 125, 27, 55);
    ctx.fillRect(552, 125, 27, 55);
    // Frosted glass window with coffee cup
    ctx.fillStyle = '#dcdde1';
    ctx.fillRect(521, 82, 58, 36);
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(521, 82, 58, 36);
    ctx.font = '16px Arial';
    ctx.fillText('☕', 550, 106);
    // Silver handle
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(518, 145, 5, 10);
    // Sign above door
    ctx.fillStyle = '#341f4a';
    ctx.fillRect(495, 48, 110, 20);
    ctx.strokeStyle = '#bb8fce';
    ctx.lineWidth = 2;
    ctx.strokeRect(495, 48, 110, 20);
    ctx.font = '800 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#bb8fce';
    ctx.fillText('POKÓJ NAUCZYCIELSKI', 550, 62);
    // Purple welcome mat
    ctx.fillStyle = '#5e3370';
    ctx.fillRect(512, 190, 76, 16);
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 1;
    ctx.strokeRect(512, 190, 76, 16);

    // DOOR 4: SZKOLNY SKLEPIK / BUFET (x: 730, y: 70 to 190)
    ctx.fillStyle = '#5c2d13';
    ctx.fillRect(692, 70, 76, 120);
    ctx.fillStyle = '#87431d';
    ctx.fillRect(696, 75, 68, 115);
    ctx.fillStyle = '#6e3514';
    ctx.fillRect(701, 125, 27, 55);
    ctx.fillRect(732, 125, 27, 55);
    // Showcase glass window
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(701, 82, 58, 36);
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(701, 82, 58, 36);
    ctx.font = '16px Arial';
    ctx.fillText('🥪', 730, 106);
    // Handle
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(765, 145, 5, 10);
    // Sign above door
    ctx.fillStyle = '#78390e';
    ctx.fillRect(678, 48, 104, 20);
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.strokeRect(678, 48, 104, 20);
    ctx.font = '800 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#f39c12';
    ctx.fillText('SZKOLNY SKLEPIK', 730, 62);
    // Orange mat
    ctx.fillStyle = '#d35400';
    ctx.fillRect(692, 190, 76, 16);
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 1;
    ctx.strokeRect(692, 190, 76, 16);

    // DOOR 5: TOALETA / WC (x: 890, y: 70 to 190)
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(852, 70, 76, 120);
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(856, 75, 68, 115);
    // Kickplate
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(856, 160, 68, 30);
    // Handle
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(858, 138, 5, 12);
    // Sign above door
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(840, 48, 100, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(840, 48, 100, 20);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚻 WC / TOALETA', 890, 62);
    // Tiled entrance mat
    ctx.fillStyle = '#dff9fb';
    ctx.fillRect(852, 190, 76, 16);
    ctx.strokeStyle = '#7ed6df';
    ctx.lineWidth = 1;
    ctx.strokeRect(852, 190, 76, 16);

    // ---------------------------------------------
    // CORRIDOR SIDES & FURNITURE
    // ---------------------------------------------
    // Left: Vending Machine (x: 40, y: 270)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(40, 270, 65, 130);
    ctx.strokeStyle = '#1abc9c';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 270, 65, 130);
    ctx.fillStyle = 'rgba(26, 188, 156, 0.25)';
    ctx.fillRect(46, 280, 53, 75);
    ctx.font = '11px Arial';
    ctx.fillText('⚡ 🍫', 72, 305);
    ctx.fillText('🥤 ⚡', 72, 335);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(50, 370, 45, 18);
    ctx.font = '700 8px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('AUTOMAT', 72, 382);

    // Right: Water Dispenser (x: 915, y: 330)
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(915, 330, 40, 70);
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(915, 330, 40, 70);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.85)';
    ctx.beginPath();
    ctx.arc(935, 310, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '8px "Fredoka", sans-serif';
    ctx.fillStyle = '#2980b9';
    ctx.fillText('WODA', 935, 360);

    // Notice board
    ctx.fillStyle = '#d2b48c';
    ctx.fillRect(35, 440, 75, 90);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 440, 75, 90);
    ctx.font = '700 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('📌 EduVulcan', 72, 455);
    ctx.font = '7px sans-serif';
    ctx.fillText('Chemia: sala 204', 72, 472);
    ctx.fillText('Dyrektor: sala 200', 72, 488);
    ctx.fillText('Kibel: koniec korytarza', 72, 504);

    // ---------------------------------------------
    // LOCKED SECRET DOORS IN CORRIDOR
    // ---------------------------------------------
    // SECRET DOOR 1: SCHOWEK WOŹNEGO (Left Wall: x: 0 to 26, y: 300 to 400)
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(0, 300, 26, 100);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(2, 304, 22, 92);
    ctx.fillStyle = '#212121';
    ctx.fillRect(2, 330, 22, 8);
    ctx.fillRect(2, 360, 22, 8);
    // Heavy iron padlock 🔒
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(14, 345, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(14, 340, 5, Math.PI, Math.PI * 2);
    ctx.stroke();
    // Warning tag
    ctx.font = '700 7px "Fredoka", sans-serif';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('🔒 KŁÓDKA', 14, 375);

    // SECRET DOOR 2: RADIOWĘZEŁ I MONITORING (Right Wall: x: 974 to 1000, y: 400 to 500)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(974, 400, 26, 100);
    ctx.fillStyle = '#2f3640';
    ctx.fillRect(976, 404, 22, 92);
    // Glowing RFID Keycard Reader
    ctx.fillStyle = '#00d2d3';
    ctx.fillRect(977, 435, 12, 18);
    ctx.fillStyle = (Math.sin(Date.now() / 200) > 0) ? '#10ac84' : '#ff4757';
    ctx.beginPath();
    ctx.arc(983, 440, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '700 7px "Fredoka", sans-serif';
    ctx.fillStyle = '#00d2d3';
    ctx.fillText('RFID', 983, 475);

    // Benches (Left and Right, keeping middle corridor open for courtyard exit)
    const benches = [
      { x: 220, y: 530 },
      { x: 780, y: 530 }
    ];
    benches.forEach(b => {
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(b.x - 55, b.y, 110, 18);
      ctx.strokeStyle = '#5c3a1e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x - 55, b.y, 110, 18);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(b.x - 50, b.y + 18, 8, 12);
      ctx.fillRect(b.x + 42, b.y + 18, 8, 12);
    });

    // ---------------------------------------------
    // BOTTOM WALL: 4 LOCKER BAYS & EXIT TO COURTYARD
    // ---------------------------------------------
    const lockerBays = [
      { x: 140, color: '#2980b9', trim: '#1f618d' },
      { x: 340, color: '#27ae60', trim: '#1e8449' },
      { x: 660, color: '#c0392b', trim: '#922b21' },
      { x: 860, color: '#d35400', trim: '#a04000' }
    ];

    lockerBays.forEach((bay, bIdx) => {
      for (let i = 0; i < 4; i++) {
        const lx = bay.x - 56 + i * 28;
        const ly = 635;
        ctx.fillStyle = bay.color;
        ctx.fillRect(lx, ly, 26, 60);
        ctx.strokeStyle = bay.trim;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(lx, ly, 26, 60);

        // Slots & lock
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(lx + 5, ly + 8, 16, 2);
        ctx.fillRect(lx + 5, ly + 13, 16, 2);
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(lx + 20, ly + 32, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx + 6, ly + 26, 10, 7);
        ctx.font = '600 5px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(`${101 + bIdx * 4 + i}`, lx + 11, ly + 32);
      }
    });

    // Double Glass Doors to Outdoor Courtyard / Field (x: 440 to 560, y: 620 to 700)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(442, 620, 116, 80);
    // Dark steel frame
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(446, 624, 52, 76);
    ctx.fillRect(502, 624, 52, 76);
    // Glass panes with outdoor greenery preview
    ctx.fillStyle = 'rgba(76, 138, 62, 0.75)';
    ctx.fillRect(450, 628, 44, 68);
    ctx.fillRect(506, 628, 44, 68);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(450, 628, 44, 68);
    ctx.strokeRect(506, 628, 44, 68);
    // Push bars
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(454, 658, 36, 4);
    ctx.fillRect(510, 658, 36, 4);

    // Illuminated Emergency Exit Sign above doors
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(435, 598, 130, 20);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.strokeRect(435, 598, 130, 20);
    ctx.font = '800 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('🏃🌿 WYJŚCIE NA POLE [E]', 500, 612);

    // Floor entrance ribbed rubber mat
    ctx.fillStyle = '#111827';
    ctx.fillRect(442, 582, 116, 12);
    ctx.fillStyle = '#f1c40f';
    for (let mx = 444; mx < 556; mx += 14) {
      ctx.fillRect(mx, 582, 7, 12);
    }

    // Corridor 20s Countdown Banner
    if (gameState.corridorTimer > 0) {
      ctx.save();
      const pulse = Math.sin(Date.now() / 150) * 0.15 + 0.85;
      ctx.fillStyle = `rgba(231, 76, 60, ${pulse})`;
      ctx.fillRect(180, 205, 640, 36);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(180, 205, 640, 36);

      ctx.font = '800 15px "Fredoka", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`🔔 DZWONEK NA LEKCJĘ ZA: ${gameState.corridorTimer}s! BIEGNIJ DO SALI 204!`, 500, 228);
      ctx.restore();
    }
  }

  // 2. SALA 204 - PRACOWNIA CHEMICZNA (CHEMISTRY: 1000 x 700)
  drawRoomChemistry(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Green linoleum lab flooring
    ctx.fillStyle = '#1a3326';
    ctx.fillRect(0, 0, w, h);

    // Laboratory vinyl tile grid
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top wall plaster
    ctx.fillStyle = '#22382c';
    ctx.fillRect(0, 0, w, 120);

    // HUGE BLACKBOARD (TABLICA SZKOLNA) spanning x: 120 to 880, y: 12 to 110
    ctx.fillStyle = '#0d2117';
    ctx.fillRect(120, 12, 760, 98);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 6;
    ctx.strokeRect(120, 12, 760, 98);

    // Chalk tray
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(120, 110, 760, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(320, 108, 14, 4);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(340, 108, 12, 4);
    ctx.fillStyle = '#ff7675';
    ctx.fillRect(358, 108, 12, 4);
    ctx.fillStyle = '#555555';
    ctx.fillRect(650, 106, 24, 7);

    // Chemical formulas in chalk
    ctx.font = '700 15px "Permanent Marker", cursive';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText('CH₃COOH + C₂H₅OH ⇄ CH₃COOC₂H₅ + H₂O (kat. H₂SO₄)', 500, 38);

    ctx.font = '600 13px "Permanent Marker", cursive';
    ctx.fillStyle = '#badc58';
    ctx.fillText('CH₃-CH=CH₂ + HCl → CH₃-CH(Cl)-CH₃ (Reguła Markownikowa)', 500, 62);

    ctx.font = '600 13px "Permanent Marker", cursive';
    ctx.fillStyle = '#f6e58d';
    ctx.fillText('2C₃H₈ + 10O₂ → 6CO₂ + 8H₂O | ZADANIE W ZESZYCIE (+35 PLN, OCENA 5)', 500, 86);

    ctx.font = '700 11px "Permanent Marker", cursive';
    ctx.fillStyle = '#ff7675';
    ctx.fillText('R-CHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → R-COO⁻ + 2Ag↓ (Próba Tollensa)', 500, 104);

    // Periodic Table Poster on left wall
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 18, 85, 95);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 18, 85, 95);
    ctx.font = '800 8px Arial';
    ctx.fillStyle = '#c0392b';
    ctx.fillText('UKŁAD OKRESOWY', 57, 30);
    ctx.fillText('PIERWIASTKÓW', 57, 40);
    const elemColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        ctx.fillStyle = elemColors[(r + c) % elemColors.length];
        ctx.fillRect(20 + c * 10.5, 46 + r * 11, 8.5, 8.5);
      }
    }

    // Safety Rules Poster on right wall
    ctx.fillStyle = '#fff9e6';
    ctx.fillRect(900, 18, 85, 95);
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 2;
    ctx.strokeRect(900, 18, 85, 95);
    ctx.font = '800 8px Arial';
    ctx.fillStyle = '#d35400';
    ctx.fillText('BHP W PRACOWNI', 942, 30);
    ctx.fillText('CHEMICZNEJ', 942, 40);
    ctx.font = '7px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('1. Okulary ochronne', 942, 55);
    ctx.fillText('2. Nie wąchać kolb!', 942, 68);
    ctx.fillText('3. Słuchać Pani Halbiny', 942, 81);
    ctx.fillText('4. Zakaz rzucania krzesłami', 942, 94);

    // Teacher Executive Chemical Desk at (500, 150)
    const tdx = 500;
    const tdy = 150;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(tdx, tdy + 25, 120, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(tdx - 110, tdy - 18, 220, 42);
    ctx.strokeStyle = '#3d2512';
    ctx.lineWidth = 2;
    ctx.strokeRect(tdx - 110, tdy - 18, 220, 42);

    // Bunsen burner
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(tdx - 85, tdy - 6, 12, 16);
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(tdx - 79, tdy - 6);
    ctx.lineTo(tdx - 83, tdy - 14 + Math.sin(Date.now() / 80) * 2);
    ctx.lineTo(tdx - 75, tdy - 14 + Math.sin(Date.now() / 80) * 2);
    ctx.closePath();
    ctx.fill();

    // Erlenmeyer Flask
    ctx.fillStyle = 'rgba(46, 204, 113, 0.85)';
    ctx.beginPath();
    ctx.moveTo(tdx - 55, tdy - 12);
    ctx.lineTo(tdx - 47, tdy - 12);
    ctx.lineTo(tdx - 42, tdy + 6);
    ctx.lineTo(tdx - 60, tdy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Test tubes
    ctx.fillStyle = '#d35400';
    ctx.fillRect(tdx - 30, tdy - 10, 32, 16);
    const tubeColors = ['#e74c3c', '#f1c40f', '#3498db', '#9b59b6'];
    tubeColors.forEach((tc, idx) => {
      ctx.fillStyle = tc;
      ctx.fillRect(tdx - 28 + idx * 7, tdy - 16, 4, 18);
    });

    // Laptop & Register
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(tdx + 18, tdy - 8, 32, 20);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(tdx + 20, tdy - 6, 28, 16);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(tdx + 60, tdy - 10, 40, 24);
    ctx.font = '700 8px Arial';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('DZIENNIK', tdx + 80, tdy + 4);

    // ---------------------------------------------
    // 6 STUDENT LAB DESKS IN SALA 204
    // ---------------------------------------------
    const myPlayer = gameState.players ? gameState.players.find(p => p.id === myId) : null;
    const assignedId = myPlayer ? myPlayer.assignedDeskIndex : -1;

    this.classicDeskSlots.forEach(desk => {
      const isAssigned = desk.id === assignedId;
      const cx = desk.chairX;
      const cy = desk.chairY;

      // Chair shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden chair
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(cx - 18, cy - 8, 36, 20);
      ctx.strokeStyle = '#5c3a1e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 18, cy - 8, 36, 20);

      // Desk Tabletop
      ctx.fillStyle = '#c7925b';
      ctx.fillRect(desk.x - 55, desk.y - 20, 110, 38);
      ctx.strokeStyle = '#7c4d21';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(desk.x - 55, desk.y - 20, 110, 38);

      // Chemistry notebook on desk
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(desk.x - 36, desk.y - 14, 28, 22);
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 1;
      ctx.strokeRect(desk.x - 36, desk.y - 14, 28, 22);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(desk.x - 36, desk.y - 14, 4, 22);

      // Pen
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(desk.x - 4, desk.y - 6, 18, 3);

      // Glass beaker
      ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
      ctx.fillRect(desk.x + 24, desk.y - 12, 14, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(desk.x + 24, desk.y - 12, 14, 16);

      // Highlight indicator
      if (isAssigned) {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(desk.x - 57, desk.y - 22, 114, 42);
        ctx.setLineDash([]);
        ctx.font = '700 9px "Fredoka", sans-serif';
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('★ TWOJA ŁAWKA', desk.x, desk.y + 26);
      } else {
        ctx.font = '600 9px "Fredoka", sans-serif';
        ctx.fillStyle = '#f1f2f6';
        ctx.fillText(desk.label, desk.x, desk.y + 26);
      }
    });

    // SECRET DOOR TO KANTOREK ODCZYNNIKÓW (Left Wall: x: 0 to 26, y: 280 to 380)
    ctx.fillStyle = '#0f241a';
    ctx.fillRect(0, 280, 26, 100);
    ctx.fillStyle = '#1c3d2e';
    ctx.fillRect(2, 284, 22, 92);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('☣️', 13, 335);
    ctx.font = '700 6.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('MAGAZYN', 13, 360);

    // Bottom exit door to corridor at (500, 645)
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 WYJŚCIE', 500, 642);
  }

  // 3. GABINET DYREKTORA (DIRECTOR: 1000 x 700)
  drawRoomDirector(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Dark oak herringbone parquet floor
    ctx.fillStyle = '#4a2810';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(30, 15, 5, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Crimson Red Persian Executive Rug (x: 160 to 840, y: 120 to 620)
    ctx.fillStyle = '#6d1b24';
    ctx.fillRect(160, 120, 680, 500);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    ctx.strokeRect(170, 130, 660, 480);
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(180, 140, 640, 460);

    // Top wall dark mahogany wainscoting (y: 0 to 150)
    ctx.fillStyle = '#2e1509';
    ctx.fillRect(0, 0, w, 150);

    // Polish Flag on Flagpole (x: 100, y: 30)
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(98, 20, 4, 120);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(100, 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(102, 25, 45, 18);
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(102, 43, 45, 18);
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(102, 25, 45, 36);

    // White Eagle Emblem (Godło Polski) at (500, 65)
    ctx.fillStyle = '#8f2530';
    ctx.fillRect(470, 20, 60, 75);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 5;
    ctx.strokeRect(470, 20, 60, 75);
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🦅', 500, 68);
    ctx.font = '700 8px Arial';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('RZECZPOSPOLITA POLSKA', 500, 88);

    // Bookshelves with trophies
    ctx.fillStyle = '#421f10';
    ctx.fillRect(860, 20, 120, 120);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.strokeRect(860, 20, 120, 120);
    ctx.font = '16px Arial';
    ctx.fillText('🏆 📚 🏆', 920, 55);
    ctx.fillText('📜 📚 📜', 920, 95);
    ctx.fillText('🏆 📜 🏆', 920, 130);

    // School Safe at (140, 150)
    const isRobbed = gameState.director && gameState.director.isRobbed;
    ctx.fillStyle = isRobbed ? '#2c3e50' : '#34495e';
    ctx.fillRect(115, 120, 55, 65);
    ctx.strokeStyle = isRobbed ? '#e74c3c' : '#1a252f';
    ctx.lineWidth = 3;
    ctx.strokeRect(115, 120, 55, 65);

    ctx.font = '800 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('SEJF SZKOLNY', 142, 135);

    if (isRobbed) {
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('OPRÓŻNIONY!', 142, 148);
      ctx.font = '14px Arial';
      ctx.fillText('💸 💵 💸', 142, 170);
    } else {
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.arc(142, 155, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.font = '9px Arial';
      ctx.fillText('🔒', 142, 158);
    }

    // Director's Massive Desk at (500, 230)
    const ddx = 500;
    const ddy = 230;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(ddx, ddy + 35, 130, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#421f10';
    ctx.fillRect(ddx - 120, ddy - 20, 240, 55);
    ctx.strokeStyle = '#271007';
    ctx.lineWidth = 3;
    ctx.strokeRect(ddx - 120, ddy - 20, 240, 55);

    // Green blotter
    ctx.fillStyle = '#1e382b';
    ctx.fillRect(ddx - 55, ddy - 10, 110, 36);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1;
    ctx.strokeRect(ddx - 55, ddy - 10, 110, 36);

    // Red rotary phone & lamp
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(ddx - 100, ddy - 8, 22, 18);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(ddx + 85, ddy - 6, 8, 14);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(ddx + 75, ddy - 14, 28, 8);

    // Guest armchairs
    [ddx - 80, ddx + 80].forEach(gx => {
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(gx - 22, ddy + 55, 44, 35);
      ctx.strokeStyle = '#271007';
      ctx.lineWidth = 2;
      ctx.strokeRect(gx - 22, ddy + 55, 44, 35);
      ctx.font = '700 8px "Fredoka", sans-serif';
      ctx.fillStyle = '#f1c40f';
      ctx.fillText('FOTEL', gx, ddy + 75);
    });

    // Sofa
    ctx.fillStyle = '#5c2c16';
    ctx.fillRect(870, 320, 95, 140);
    ctx.strokeStyle = '#271007';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(870, 320, 95, 140);
    ctx.font = '700 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('SOFA', 917, 395);

    // Bottom Exit Door to Corridor at (500, 645)
    ctx.fillStyle = '#421f10';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#5c2c16';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('🚪 WYJŚCIE', 500, 642);
  }

  // 4. SZKOLNA TOALETA / WC (TOILET: 1000 x 700)
  drawRoomToilet(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Turquoise & White institutional tile grid
    ctx.fillStyle = '#dff9fb';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(126, 214, 223, 0.45)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top wall tiles
    ctx.fillStyle = '#c7ecee';
    ctx.fillRect(0, 0, w, 140);
    ctx.fillStyle = '#22a6b3';
    ctx.fillRect(0, 138, w, 4);

    // Floor drain
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(450, 420, 16, 0, Math.PI * 2);
    ctx.fill();

    // Bathroom Graffiti
    ctx.font = '700 12px "Permanent Marker", cursive';
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';
    ctx.fillText('HWDP', 120, 50);
    ctx.fillStyle = '#2980b9';
    ctx.fillText('ZSTU TUCHOLA', 340, 45);
    ctx.fillStyle = '#8e44ad';
    ctx.fillText('WOLFF PALI TU E-VAPE', 240, 85);
    ctx.fillStyle = '#d35400';
    ctx.fillText('SURRON 125CC', 440, 75);

    // SINKS & CRACKED MIRRORS
    const sinks = [140, 260, 380];
    sinks.forEach((sx, idx) => {
      ctx.fillStyle = '#dff9fb';
      ctx.fillRect(sx - 35, 30, 70, 70);
      ctx.strokeStyle = '#7ed6df';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - 35, 30, 70, 70);

      // Cracked mirror
      if (idx === 1) {
        ctx.strokeStyle = 'rgba(44, 62, 80, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, 65);
        ctx.lineTo(sx - 20, 40);
        ctx.moveTo(sx, 65);
        ctx.lineTo(sx + 25, 45);
        ctx.moveTo(sx, 65);
        ctx.lineTo(sx - 10, 95);
        ctx.moveTo(sx, 65);
        ctx.lineTo(sx + 15, 90);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 38, 110, 76, 40);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - 38, 110, 76, 40);
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(sx - 4, 102, 8, 14);
    });

    // 3 TOILET STALLS
    // Kabina 1
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(530, 40, 130, 240);
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.strokeRect(530, 40, 130, 240);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(540, 150, 12, 12);
    ctx.font = '800 12px "Fredoka", sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('KABINA 1', 595, 120);
    ctx.font = '700 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#c0392b';
    ctx.fillText('(ZAJĘTE)', 595, 140);

    // Kabina 2: Shady Dealer Hideout
    ctx.fillStyle = '#1c1024';
    ctx.fillRect(680, 40, 140, 240);
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(680, 40, 140, 240);

    const grad = ctx.createRadialGradient(750, 160, 10, 750, 160, 100);
    grad.addColorStop(0, 'rgba(142, 68, 173, 0.45)');
    grad.addColorStop(1, 'rgba(28, 16, 36, 0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(680, 40, 140, 240);

    ctx.font = '700 11px "Permanent Marker", cursive';
    ctx.fillStyle = '#f39c12';
    ctx.fillText('TOR 11:55', 750, 75);
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('DARK WEB', 750, 95);
    ctx.font = '800 12px "Fredoka", sans-serif';
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('KABINA 2', 750, 260);

    // Kabina 3
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(840, 40, 130, 240);
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.strokeRect(840, 40, 130, 240);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(905, 150, 25, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(905, 158, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '800 12px "Fredoka", sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('KABINA 3', 905, 230);

    // Open Window in bottom right (vape smoke lounge)
    ctx.fillStyle = '#74b9ff';
    ctx.fillRect(860, 520, 100, 80);
    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 3;
    ctx.strokeRect(860, 520, 100, 80);
    ctx.font = '700 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#2d3436';
    ctx.fillText('💨 PALARNIA VAPE', 910, 565);

    // Bottom Exit Door to Corridor at (220, 645)
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(170, 645, 100, 55);
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(175, 645, 90, 50);
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(185, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 WYJŚCIE', 220, 642);
  }

  // 5. POKÓJ NAUCZYCIELSKI (STAFF_ROOM: 1000 x 700)
  drawRoomStaff(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Warm parquet / violet institutional carpet
    ctx.fillStyle = '#2b1b36';
    ctx.fillRect(0, 0, w, h);

    // Large Persian-style staff carpet
    ctx.fillStyle = '#4a2656';
    ctx.fillRect(180, 150, 640, 460);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.strokeRect(190, 160, 620, 440);
    ctx.strokeStyle = '#bb8fce';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(200, 170, 600, 420);

    // Top wall wainscoting
    ctx.fillStyle = '#1e1126';
    ctx.fillRect(0, 0, w, 140);
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(0, 138, w, 4);

    // Notice Board on wall (x: 400 to 600, y: 20 to 120)
    ctx.fillStyle = '#c7925b';
    ctx.fillRect(390, 20, 220, 100);
    ctx.strokeStyle = '#7c4d21';
    ctx.lineWidth = 3;
    ctx.strokeRect(390, 20, 220, 100);
    ctx.font = '700 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.fillText('📌 POKÓJ NAUCZYCIELSKI - DYŻURY', 500, 36);
    ctx.font = '7px sans-serif';
    ctx.fillText('• Halbina: Parter & Korytarz Główny', 500, 52);
    ctx.fillText('• Grażyna: 1. Piętro (Biologia)', 500, 66);
    ctx.fillText('• Wiesiu: Sala Gimnastyczna & Boisko', 500, 80);
    ctx.fillStyle = '#c0392b';
    ctx.font = '700 8px sans-serif';
    ctx.fillText('⚠️ ZAKAZ WSTĘPU DLA UCZNIÓW BEZ WEZWANIA!', 500, 104);

    // ---------------------------------------------
    // COFFEE CORNER (EKSPRES DO KAWY) - TOP LEFT
    // ---------------------------------------------
    const kx = 80;
    const ky = 160;
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(kx, ky, 90, 110);
    ctx.strokeStyle = '#271714';
    ctx.lineWidth = 2;
    ctx.strokeRect(kx, ky, 90, 110);

    // Coffee machine
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(kx + 15, ky + 15, 60, 65);
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(kx + 15, ky + 15, 60, 65);

    // Dispenser spout & cup
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(kx + 35, ky + 58, 20, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(kx + 37, ky + 60, 16, 14);

    // Steam puffing from coffee
    if (Math.random() < 0.25) {
      this.addSteamPuff(kx + 45, ky + 50);
    }

    ctx.font = '800 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('☕ EKSPRES TCHIBO', kx + 45, ky + 98);

    // ---------------------------------------------
    // EXAM FILING CABINET (SZAFA ZE SPRAWDZIANAMI) - TOP RIGHT
    // ---------------------------------------------
    const fx = 830;
    const fy = 150;
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(fx, fy, 95, 130);
    ctx.strokeStyle = '#1a252f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(fx, fy, 95, 130);

    // Drawers with handles
    for (let d = 0; d < 3; d++) {
      const dy = fy + 10 + d * 38;
      ctx.fillStyle = '#34495e';
      ctx.fillRect(fx + 8, dy, 79, 32);
      ctx.strokeStyle = '#1f2a38';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(fx + 8, dy, 79, 32);

      // Silver handle
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(fx + 38, dy + 12, 20, 5);

      // Keyhole
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(fx + 72, dy + 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = '800 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';
    ctx.fillText('📑 SPRAWDZIANY 204', fx + 47, fy + 120);

    // ---------------------------------------------
    // CONFERENCE TABLE (STÓŁ NAUCZYCIELSKI) - CENTER
    // ---------------------------------------------
    const tx = 500;
    const ty = 370;

    // Table shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(tx, ty + 10, 220, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wood table
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.ellipse(tx, ty, 200, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3d2413';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Table items: exam papers with red grades, mugs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tx - 120, ty - 18, 45, 30);
    ctx.strokeStyle = '#bdc3c7';
    ctx.strokeRect(tx - 120, ty - 18, 45, 30);
    ctx.font = '800 12px Arial';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('1', tx - 100, ty);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tx + 75, ty - 18, 45, 30);
    ctx.strokeStyle = '#bdc3c7';
    ctx.strokeRect(tx + 75, ty - 18, 45, 30);
    ctx.font = '800 12px Arial';
    ctx.fillStyle = '#27ae60';
    ctx.fillText('5', tx + 95, ty);

    // Coffee mugs on table
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(tx - 20, ty - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(tx + 30, ty - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // ---------------------------------------------
    // TEACHERS NPCs
    // ---------------------------------------------
    // 1. mgr Grażyna (Biologia) at tx - 100, ty - 55
    const gx = tx - 90;
    const gy = ty - 55;
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(gx - 14, gy - 8, 28, 24);
    ctx.fillStyle = '#f8a5c2';
    ctx.beginPath();
    ctx.arc(gx, gy - 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5cd79';
    ctx.beginPath();
    ctx.arc(gx, gy - 20, 11, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.font = '700 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#bb8fce';
    ctx.fillText('mgr Grażyna', gx, gy + 26);

    // 2. pan Wiesiu (WF) at tx + 90, ty - 55
    const wx = tx + 90;
    const wy = ty - 55;
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(wx - 14, wy - 8, 28, 24);
    ctx.fillStyle = '#e0a96d';
    ctx.beginPath();
    ctx.arc(wx, wy - 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(wx, wy - 20, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    // Whistle
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(wx - 3, wy - 5, 6, 8);
    ctx.font = '700 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#5dade2';
    ctx.fillText('pan Wiesiu (WF)', wx, wy + 26);

    // Bottom exit door to corridor at (500, 645)
    ctx.fillStyle = '#341f4a';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#472d62';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#bb8fce';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 WYJŚCIE', 500, 642);
  }

  // 6. SZKOLNY SKLEPIK / BUFET (BUFFET: 1000 x 700)
  drawRoomBuffet(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Cheerful warm checkerboard tile floor
    ctx.fillStyle = '#faebd7';
    ctx.fillRect(0, 0, w, h);

    const tileSize = 40;
    ctx.fillStyle = '#f5d6ba';
    for (let r = 0; r < Math.ceil(h / tileSize); r++) {
      for (let c = 0; c < Math.ceil(w / tileSize); c++) {
        if ((r + c) % 2 === 1) {
          ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        }
      }
    }

    // Top kitchen wall
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 0, w, 140);
    ctx.fillStyle = '#d35400';
    ctx.fillRect(0, 136, w, 6);

    // Buffet Banner
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(320, 16, 360, 40);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(320, 16, 360, 40);
    ctx.font = '900 15px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('🥪 SZKOLNY SKLEPIK - U PANI BASI 🥤', 500, 42);

    // ---------------------------------------------
    // CHALKBOARD PRICE MENU ON WALL - RIGHT
    // ---------------------------------------------
    const mx = 820;
    const my = 20;
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(mx, my, 160, 110);
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 3;
    ctx.strokeRect(mx, my, 160, 110);

    ctx.font = '700 9px "Permanent Marker", cursive';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('📋 CENNIK PRZEKĄSEK', mx + 80, my + 18);
    ctx.font = '600 8px "Permanent Marker", cursive';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('• Zapiekanka: 12.00 zł', mx + 80, my + 36);
    ctx.fillText('• Drożdżówka: 6.00 zł', mx + 80, my + 52);
    ctx.fillText('• Kanapka: 7.50 zł', mx + 80, my + 68);
    ctx.fillText('• Tymbark: 5.00 zł', mx + 80, my + 84);
    ctx.fillText('• Prince Polo: 4.00 zł', mx + 80, my + 100);

    // ---------------------------------------------
    // KIOSK COUNTER & DISPLAY CASE (LADA SKLEPIKOWA) - CENTER
    // ---------------------------------------------
    const cx = 500;
    const cy = 250;

    // Counter body
    ctx.fillStyle = '#87431d';
    ctx.fillRect(200, cy, 600, 70);
    ctx.strokeStyle = '#5c2d13';
    ctx.lineWidth = 3;
    ctx.strokeRect(200, cy, 600, 70);

    // Glass display case on counter
    ctx.fillStyle = 'rgba(255, 234, 167, 0.35)';
    ctx.fillRect(220, cy - 45, 560, 45);
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2;
    ctx.strokeRect(220, cy - 45, 560, 45);

    // Food inside display case
    // 1. Hot Zapiekanki
    ctx.font = '18px Arial';
    ctx.fillText('🥖🥖🥖', 280, cy - 18);
    ctx.font = '700 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#d35400';
    ctx.fillText('Ciepłe zapiekanki', 280, cy - 2);

    // 2. Sweet Buns (Drożdżówki)
    ctx.font = '18px Arial';
    ctx.fillText('🥐🥯🍩', 440, cy - 18);
    ctx.font = '700 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#d35400';
    ctx.fillText('Drożdżówki z serem', 440, cy - 2);

    // 3. Cold drinks (Tymbarki)
    ctx.font = '18px Arial';
    ctx.fillText('🧃🥤🧃', 600, cy - 18);
    ctx.font = '700 8px "Fredoka", sans-serif';
    ctx.fillStyle = '#27ae60';
    ctx.fillText('Tymbarki z kapslem', 600, cy - 2);

    // 4. Cash register at right end
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(720, cy - 35, 45, 35);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(725, cy - 30, 35, 12);
    ctx.font = '700 7px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('0.00 PLN', 742, cy - 21);

    // ---------------------------------------------
    // PANI BASIA NPC (BEHIND COUNTER)
    // ---------------------------------------------
    const bx = 500;
    const by = 185;

    // Body in white & green apron
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(bx - 18, by - 10, 36, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 10, by - 8, 20, 26);

    // Head
    ctx.fillStyle = '#f8a5c2';
    ctx.beginPath();
    ctx.arc(bx, by - 22, 14, 0, Math.PI * 2);
    ctx.fill();

    // Curly hair
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(bx, by - 28, 14, Math.PI, Math.PI * 2);
    ctx.fill();

    // White baker headband
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 14, by - 28, 28, 6);

    // Friendly face
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(bx - 4, by - 22, 1.8, 0, Math.PI * 2);
    ctx.arc(bx + 4, by - 22, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#d35400';
    ctx.fillText('🥪 Pani Basia (Sklepik)', bx, by - 42);

    // Bottom exit door to corridor at (500, 645)
    ctx.fillStyle = '#5c2d13';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#87431d';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 WYJŚCIE', 500, 642);
  }

  // 7. SCHOWEK WOŹNEGO & ARCHIWUM (JANITOR_ROOM: 1000 x 700)
  drawRoomJanitor(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Dark dusty concrete floor
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, w, h);

    // Floor grime and dust texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Bare swinging ceiling lightbulb with warm flicker
    const bulbX = 500 + Math.sin(Date.now() / 900) * 8;
    const bulbGrad = ctx.createRadialGradient(bulbX, 60, 20, bulbX, 60, 320);
    bulbGrad.addColorStop(0, 'rgba(254, 211, 48, 0.28)');
    bulbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.arc(bulbX, 60, 320, 0, Math.PI * 2);
    ctx.fill();

    // Wire & lightbulb
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(500, 0);
    ctx.lineTo(bulbX, 50);
    ctx.stroke();
    ctx.fillStyle = '#fed330';
    ctx.beginPath();
    ctx.arc(bulbX, 55, 7, 0, Math.PI * 2);
    ctx.fill();

    // Top wall
    ctx.fillStyle = '#1e2227';
    ctx.fillRect(0, 0, w, 110);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗝️ SCHOWEK WOŹNEGO & ARCHIWUM SZKOLNE', 500, 30);

    // Left Shelves with cleaning supplies, mops & detergents
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(40, 140, 130, 420);
    ctx.strokeStyle = '#271b13';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 140, 130, 420);

    // Shelves tiers
    [210, 290, 370, 450, 520].forEach(sy => {
      ctx.fillStyle = '#533b2b';
      ctx.fillRect(42, sy, 126, 8);
    });

    // Mops, brooms, buckets
    ctx.font = '22px Arial';
    ctx.fillText('🧹', 70, 195);
    ctx.fillText('🪣', 125, 200);
    ctx.fillText('🧴', 75, 275);
    ctx.fillText('🧼', 125, 275);
    ctx.fillText('📦', 75, 355);
    ctx.fillText('🗂️', 125, 355);
    ctx.fillText('🧰', 85, 435);
    ctx.fillText('👢', 125, 505);

    // Heavy Skrzynia Woźnego (Old Wooden Chest) at (260, 310, w: 110, h: 65)
    const isChestLooted = !!gameState.janitorChestLooted;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(260, 310, 110, 65);
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 3;
    ctx.strokeRect(260, 310, 110, 65);

    // Iron bands
    ctx.fillStyle = '#212121';
    ctx.fillRect(280, 310, 8, 65);
    ctx.fillRect(342, 310, 8, 65);

    // Gold padlock / hasp
    ctx.fillStyle = isChestLooted ? '#7f8c8d' : '#f1c40f';
    ctx.fillRect(308, 335, 14, 16);
    ctx.font = '700 9px "Fredoka", sans-serif';
    ctx.fillStyle = isChestLooted ? '#95a5a6' : '#f1c40f';
    ctx.fillText(isChestLooted ? '📦 Otwarta' : '🔒 Skrzynia Woźnego', 315, 395);

    // Keyring board on back wall at (720, 160, w: 85, h: 70)
    const isKeycardTaken = !!gameState.janitorKeycardTaken;
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(680, 150, 95, 75);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.strokeRect(680, 150, 95, 75);
    ctx.font = '700 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TABLICA KLUCZY', 727, 168);

    if (!isKeycardTaken) {
      ctx.font = '18px Arial';
      ctx.fillText('💳', 727, 200);
      ctx.font = '700 8px "Fredoka", sans-serif';
      ctx.fillStyle = '#00d2d3';
      ctx.fillText('Karta Master [E]', 727, 216);
    } else {
      ctx.font = '14px Arial';
      ctx.fillText('🗝️', 727, 198);
      ctx.font = '600 7.5px "Fredoka", sans-serif';
      ctx.fillStyle = '#bdc3c7';
      ctx.fillText('(Pusty haczyk)', 727, 214);
    }

    // Industrial Main Fuse Box (Skrzynka Bezpieczników) at (820, 260, w: 90, h: 130)
    ctx.fillStyle = '#34495e';
    ctx.fillRect(820, 260, 90, 130);
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 3;
    ctx.strokeRect(820, 260, 90, 130);

    // Hazard lightning sign
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(845, 275, 40, 30);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('⚡', 865, 296);

    // Knife switch lever
    const isBlackout = !!gameState.schoolBlackout;
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(860, isBlackout ? 345 : 325, 10, 30);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(855, 340, 20, 8);

    ctx.font = '700 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = isBlackout ? '#e74c3c' : '#2ecc71';
    ctx.fillText(isBlackout ? '⚡ PRĄD: WYŁĄCZONY' : '⚡ GŁÓWNE ZASILANIE', 865, 410);

    // Exit Door at bottom (500, 645)
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 WYJŚCIE', 500, 642);
  }

  // 8. KANTOREK ODCZYNNIKÓW CHEMICZNYCH (CHEM_LAB: 1000 x 700)
  drawRoomChemLab(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // Dark teal laboratory tile flooring
    ctx.fillStyle = '#0b201d';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(26, 188, 156, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top wall
    ctx.fillStyle = '#14302b';
    ctx.fillRect(0, 0, w, 115);
    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#1abc9c';
    ctx.textAlign = 'center';
    ctx.fillText('☣️ KANTOREK ODCZYNNIKÓW CHEMICZNYCH - MAGAZYN KLASY A', 500, 32);

    // Chemical Glass Cabinets along top/left
    ctx.fillStyle = '#164038';
    ctx.fillRect(60, 140, 180, 180);
    ctx.strokeStyle = '#1abc9c';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(60, 140, 180, 180);
    ctx.fillStyle = 'rgba(26, 188, 156, 0.2)';
    ctx.fillRect(68, 150, 164, 160);

    // Glowing bottles
    ctx.font = '24px Arial';
    ctx.fillText('🧪', 105, 195);
    ctx.fillText('⚗️', 150, 195);
    ctx.fillText('🧫', 195, 195);
    ctx.fillText('🧴', 105, 260);
    ctx.fillText('☢️', 150, 260);
    ctx.fillText('🔥', 195, 260);

    ctx.font = '700 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('SZAFA ODCZYNNIKÓW H₂SO₄ / HNO₃', 150, 336);

    // Central Chemical Synthesis Workbench at (380, 250, w: 240, h: 100)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(380, 250, 240, 100);
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(380, 250, 240, 100);

    // Stainless steel top
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(384, 254, 232, 25);

    // Bunsen burner with animated flame
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(430, 245, 16, 20);
    const flameH = 12 + Math.sin(Date.now() / 80) * 3;
    ctx.fillStyle = '#00d2d3';
    ctx.beginPath();
    ctx.moveTo(438, 245 - flameH);
    ctx.lineTo(444, 245);
    ctx.lineTo(432, 245);
    ctx.closePath();
    ctx.fill();

    // Distillation Apparatus & Boiling Flask
    ctx.font = '22px Arial';
    ctx.fillText('⚗️', 500, 245);
    ctx.fillText('🧪', 555, 245);

    // Green chemical bubble
    const bubY = 225 + Math.sin(Date.now() / 120) * 4;
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(520, bubY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '800 11px "Fredoka", sans-serif';
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('STANOWISKO SYNTEZY [E]', 500, 380);
    ctx.font = '600 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('(Wytwarza Wojskowe Świece Dymne)', 500, 396);

    // Toxic barrel on right wall
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(780, 200, 70, 95);
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 3;
    ctx.strokeRect(780, 200, 70, 95);
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('☣️', 815, 245);
    ctx.font = '700 8px Arial';
    ctx.fillText('TOXIC ACID', 815, 270);

    // Exit Door at bottom (500, 645) -> returns to CHEMISTRY room
    ctx.fillStyle = '#0f241a';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#1c3d2e';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 SALA 204', 500, 642);
  }

  // 9. RADIOWĘZEŁ I MONITORING SZKOLNY (SERVER_ROOM: 1000 x 700)
  drawRoomServer(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // High tech dark datacenter floor
    ctx.fillStyle = '#10141d';
    ctx.fillRect(0, 0, w, h);

    // Glowing blue cable lines on floor
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 280);
    ctx.lineTo(400, 280);
    ctx.lineTo(400, 600);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(860, 280);
    ctx.lineTo(650, 280);
    ctx.lineTo(650, 600);
    ctx.stroke();

    // Top wall
    ctx.fillStyle = '#181e2b';
    ctx.fillRect(0, 0, w, 115);
    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#00d2d3';
    ctx.textAlign = 'center';
    ctx.fillText('🎙️ SZKOLNY RADIOWĘZEŁ & CENTRUM MONITORINGU CCTV', 500, 32);

    // Server Racks on Left Wall (x: 40 to 140, y: 150 to 520)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(40, 150, 100, 370);
    ctx.strokeStyle = '#2f3640';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 150, 100, 370);

    // Blinking network LEDs
    for (let ry = 170; ry <= 490; ry += 35) {
      ctx.fillStyle = '#0c1017';
      ctx.fillRect(46, ry, 88, 24);
      for (let li = 0; li < 6; li++) {
        const ledOn = Math.sin(Date.now() / 150 + ry + li * 2) > 0;
        ctx.fillStyle = ledOn ? (li % 2 === 0 ? '#10ac84' : '#ff9f43') : '#333333';
        ctx.beginPath();
        ctx.arc(56 + li * 13, ry + 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Server Racks on Right Wall (x: 860 to 960, y: 150 to 520)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(860, 150, 100, 370);
    ctx.strokeStyle = '#2f3640';
    ctx.lineWidth = 3;
    ctx.strokeRect(860, 150, 100, 370);
    for (let ry = 170; ry <= 490; ry += 35) {
      ctx.fillStyle = '#0c1017';
      ctx.fillRect(866, ry, 88, 24);
      for (let li = 0; li < 6; li++) {
        const ledOn = Math.sin(Date.now() / 180 + ry + li * 3) > 0;
        ctx.fillStyle = ledOn ? (li % 3 === 0 ? '#ee5253' : '#10ac84') : '#333333';
        ctx.beginPath();
        ctx.arc(876 + li * 13, ry + 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // PA Broadcast Console Table at (300, 270, w: 200, h: 90)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(300, 270, 200, 90);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(300, 270, 200, 90);

    // Audio Mixer Faceplate
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(310, 278, 180, 60);

    // Faders & VU meters
    for (let fi = 0; fi < 6; fi++) {
      ctx.fillStyle = '#576574';
      ctx.fillRect(324 + fi * 26, 284, 4, 40);
      const faderY = 288 + Math.sin(Date.now() / 200 + fi) * 10 + 10;
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(320 + fi * 26, faderY, 12, 6);
    }

    // Studio Gooseneck Microphone
    ctx.fillStyle = '#00d2d3';
    ctx.font = '24px Arial';
    ctx.fillText('🎙️', 400, 255);

    // "ON AIR" Sign
    const onAirOn = Math.sin(Date.now() / 300) > 0;
    ctx.fillStyle = onAirOn ? '#ff3838' : '#7f1d1d';
    ctx.fillRect(360, 210, 80, 24);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(360, 210, 80, 24);
    ctx.font = '800 11px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ON AIR', 400, 226);

    ctx.font = '800 11px "Fredoka", sans-serif';
    ctx.fillStyle = '#00d2d3';
    ctx.fillText('KONSOLA RADIOWĘZŁA [E]', 400, 395);

    // CCTV Monitoring Station at (580, 210, w: 220, h: 160)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(580, 210, 220, 160);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(580, 210, 220, 160);

    // 4 CCTV Screens (2x2 grid)
    const cams = [
      { label: 'CAM 01: KORYTARZ', icon: '🏫', x: 590, y: 220 },
      { label: 'CAM 02: SALA 204', icon: '🧪', x: 695, y: 220 },
      { label: 'CAM 03: WC', icon: '🚻', x: 590, y: 290 },
      { label: 'CAM 04: GABINET', icon: '🏛️', x: 695, y: 290 }
    ];

    cams.forEach(cam => {
      ctx.fillStyle = '#0c1017';
      ctx.fillRect(cam.x, cam.y, 95, 60);
      ctx.strokeStyle = '#10ac84';
      ctx.lineWidth = 1;
      ctx.strokeRect(cam.x, cam.y, 95, 60);

      ctx.font = '16px Arial';
      ctx.fillText(cam.icon, cam.x + 47, cam.y + 35);

      ctx.font = '700 7px "Fredoka", sans-serif';
      ctx.fillStyle = '#10ac84';
      ctx.fillText(cam.label, cam.x + 47, cam.y + 53);
    });

    const isCctvCleared = !!gameState.cctvCleared;
    ctx.font = '800 11px "Fredoka", sans-serif';
    ctx.fillStyle = isCctvCleared ? '#2ecc71' : '#e74c3c';
    ctx.fillText(isCctvCleared ? '✅ NAGRANIA CCTV WYCZYSZCZONE' : '🖥️ TERMINAL CCTV [E]', 690, 395);

    // Exit Door at bottom (500, 645)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(450, 645, 100, 55);
    ctx.fillStyle = '#2f3640';
    ctx.fillRect(455, 645, 90, 50);
    ctx.fillStyle = '#00d2d3';
    ctx.fillRect(465, 630, 70, 16);
    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚪 WYJŚCIE', 500, 642);
  }

  drawRoomCourtyard(ctx, gameState, myId) {
    const w = this.width;
    const h = this.height;

    // 1. Lush Green Grass Lawn Background
    ctx.fillStyle = '#4c8a3e';
    ctx.fillRect(0, 0, w, h);

    // Subtle grass blade textures & patterns
    ctx.fillStyle = '#437c37';
    for (let gx = 15; gx < w; gx += 45) {
      for (let gy = 100; gy < h; gy += 40) {
        ctx.fillRect(gx + ((gy % 80 === 0) ? 20 : 0), gy, 12, 4);
      }
    }

    // 2. High Wire-Mesh Chainlink Fence (Left, Bottom, Right perimeters)
    ctx.strokeStyle = 'rgba(180, 190, 200, 0.4)';
    ctx.lineWidth = 1;
    // Left fence
    ctx.strokeRect(4, 85, 14, h - 90);
    // Right fence
    ctx.strokeRect(w - 18, 85, 14, h - 90);
    // Fence posts
    ctx.fillStyle = '#7f8c8d';
    for (let fy = 90; fy < h; fy += 70) {
      ctx.fillRect(8, fy, 6, 60);
      ctx.fillRect(w - 14, fy, 6, 60);
    }

    // 3. School Building North Facade (Red Brick Wall) at Top (y: 0 to 90)
    ctx.fillStyle = '#a84234';
    ctx.fillRect(0, 0, w, 85);
    // Dark foundation molding
    ctx.fillStyle = '#5c231a';
    ctx.fillRect(0, 80, w, 8);
    // School brick mortar lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let by = 0; by < 80; by += 14) {
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(w, by);
      ctx.stroke();
    }
    // Brick wall windows
    const winX = [90, 220, 350, 650, 780, 910];
    winX.forEach(wx => {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(wx - 26, 12, 52, 48);
      ctx.fillStyle = '#a8e6cf';
      ctx.fillRect(wx - 22, 16, 44, 40);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wx - 22, 16, 44, 40);
      ctx.beginPath();
      ctx.moveTo(wx, 16);
      ctx.lineTo(wx, 56);
      ctx.moveTo(wx - 22, 36);
      ctx.lineTo(wx + 22, 36);
      ctx.stroke();
    });

    // 4. Double Glass School Doors & Entrance Steps (x: 450 to 550, y: 15 to 88)
    // Concrete steps
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(440, 78, 120, 18);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(446, 72, 108, 8);
    // Entrance frame
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(452, 16, 96, 66);
    // Glass double doors
    ctx.fillStyle = 'rgba(52, 152, 219, 0.45)';
    ctx.fillRect(456, 20, 42, 58);
    ctx.fillRect(502, 20, 42, 58);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(456, 20, 42, 58);
    ctx.strokeRect(502, 20, 42, 58);
    // Door handles
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(492, 48, 4, 12);
    ctx.fillRect(504, 48, 4, 12);
    // Sign above doors
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(435, 2, 130, 16);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(435, 2, 130, 16);
    ctx.font = '800 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('🏫 WEJŚCIE DO SZKOŁY', 500, 13);

    // Paved concrete walkway from school entrance down to field & court
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(460, 94, 80, 110);
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1;
    for (let py = 94; py < 204; py += 22) {
      ctx.beginPath();
      ctx.moveTo(460, py);
      ctx.lineTo(540, py);
      ctx.stroke();
    }

    // 5. Multisport Tartan / Basketball Court (x: 180 to 520, y: 220 to 510)
    ctx.fillStyle = '#b33927';
    ctx.fillRect(180, 220, 340, 290);
    ctx.strokeStyle = '#872b1d';
    ctx.lineWidth = 3;
    ctx.strokeRect(180, 220, 340, 290);

    // Court White Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    // Outer boundary
    ctx.strokeRect(188, 228, 324, 274);
    // Center line
    ctx.beginPath();
    ctx.moveTo(350, 228);
    ctx.lineTo(350, 502);
    ctx.stroke();
    // Center circle
    ctx.beginPath();
    ctx.arc(350, 365, 36, 0, Math.PI * 2);
    ctx.stroke();
    // 3-point key / arc on left
    ctx.beginPath();
    ctx.arc(225, 365, 52, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    // Free throw line
    ctx.strokeRect(188, 335, 50, 60);

    // Basketball Hoop Structure at (225, 365)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(225, 375, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(205, 340, 8, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(213, 332, 5, 40);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(213, 332, 5, 40);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(218, 350, 16, 3);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(218, 353);
    ctx.lineTo(224, 366);
    ctx.lineTo(230, 366);
    ctx.lineTo(234, 353);
    ctx.stroke();

    ctx.font = '800 9px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🏀 KOSZ: ZAKŁAD 10 PLN [E]', 275, 345);

    // 6. KAUCJOMAT 2000 (Recycling Return Kiosk) at (820, 140, w: 100, h: 110)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(820, 248, 55, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b4d3e';
    ctx.fillRect(770, 135, 100, 110);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 3;
    ctx.strokeRect(770, 135, 100, 110);
    ctx.fillStyle = '#0f2b23';
    ctx.fillRect(775, 140, 90, 24);
    ctx.font = '800 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#2ecc71';
    ctx.textAlign = 'center';
    ctx.fillText('♻️ KAUCJOMAT 2000', 820, 156);

    const ledGlow = (Math.sin(Date.now() / 180) > 0) ? '#2ecc71' : '#27ae60';
    ctx.fillStyle = '#0c1613';
    ctx.beginPath();
    ctx.arc(820, 185, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ledGlow;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.font = '14px Arial';
    ctx.fillText('🍾', 820, 190);

    ctx.fillStyle = '#34495e';
    ctx.fillRect(800, 218, 40, 18);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(800, 218, 40, 18);
    ctx.font = '700 8px Arial';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('🪙 1.00 ZŁ', 820, 230);

    // 7. Pan Woźny & Sterta Liści at (160, 440)
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.ellipse(155, 455, 38, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(145, 452, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(165, 456, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 470);
    ctx.lineTo(150, 415);
    ctx.stroke();
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(122, 465);
    ctx.lineTo(138, 475);
    ctx.stroke();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(160, 415, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(153, 403, 14, 6);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(151, 407, 18, 3);

    ctx.font = '800 8.5px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🍂 PAN WOŹNY (+20 PLN) [E]', 160, 395);

    // 8. Kontenery na odpady (Śmietniki)
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(95, 185, 52, 44);
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 2;
    ctx.strokeRect(95, 185, 52, 44);
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(92, 180, 58, 8);
    ctx.font = '700 7px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🗑️ ODPADY', 121, 210);

    ctx.fillStyle = '#2980b9';
    ctx.fillRect(865, 465, 52, 44);
    ctx.strokeStyle = '#1f618d';
    ctx.lineWidth = 2;
    ctx.strokeRect(865, 465, 52, 44);
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(862, 460, 58, 8);
    ctx.font = '700 7px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🗑️ PAPIER', 891, 490);

    // 9. Benches & Trees
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(295, 555, 110, 18);
    ctx.strokeStyle = '#5c3a1e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(295, 555, 110, 18);

    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(645, 555, 110, 18);
    ctx.strokeStyle = '#5c3a1e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(645, 555, 110, 18);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(65, 610, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(65, 595, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40916c';
    ctx.beginPath();
    ctx.arc(70, 590, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(935, 610, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(935, 595, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40916c';
    ctx.beginPath();
    ctx.arc(930, 590, 28, 0, Math.PI * 2);
    ctx.fill();

    // 10. REFUNDABLE DEPOSIT ITEMS SCATTERED ON FIELD (Kaucja)
    if (gameState.courtyardDeposits && gameState.courtyardDeposits.length > 0) {
      gameState.courtyardDeposits.forEach(dep => {
        const spark = Math.sin((Date.now() + (dep.x * 7)) / 220);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.35 + spark * 0.25) + ')';
        ctx.beginPath();
        ctx.arc(dep.x, dep.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dep.icon || '🥫', dep.x, dep.y + 6);

        ctx.font = '800 7px "Fredoka", sans-serif';
        ctx.fillStyle = '#f1c40f';
        ctx.fillText(`${(dep.value || 1).toFixed(2)} zł`, dep.x, dep.y - 10);
      });
    }

    // 11. Evacuation Muster Point & Assembly Zone during Fire Alarm
    if (gameState.fireAlarmActive) {
      const flash = (Math.floor(Date.now() / 250) % 2 === 0);
      ctx.save();
      // Assembly ground zone (x: 560 to 800, y: 310 to 490)
      ctx.fillStyle = flash ? 'rgba(231, 76, 60, 0.28)' : 'rgba(243, 156, 18, 0.22)';
      ctx.fillRect(560, 310, 240, 180);
      ctx.strokeStyle = flash ? '#e74c3c' : '#f39c12';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(560, 310, 240, 180);
      ctx.setLineDash([]);

      // Muster Point Banner
      ctx.fillStyle = '#f1c40f';
      ctx.font = '800 13px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚨 PUNKT ZBIÓRKI EWAKUACYJNEJ 🚨', 680, 335);
      ctx.font = '700 10.5px "Fredoka", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('(SEKTOR A - ZBIÓRKA PRZED SZKOŁĄ)', 680, 354);

      // Director Janusz with Megaphone in center of muster point
      ctx.font = '32px Arial';
      ctx.fillText('👨‍💼📣', 680, 410);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.fillText('«W SZEREGU ZBIÓR! NIE PANIKOWAĆ!»', 680, 440);
      ctx.restore();
    }
  }

  drawDirectorNPC(ctx, director) {
    const x = director.x || 500;
    const y = director.y || 190;

    // Director body (behind desk)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(x - 20, y - 10, 40, 32);
    // White shirt & red tie
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y - 10, 12, 16);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 5);
    ctx.lineTo(x + 3, y - 5);
    ctx.lineTo(x, y + 14);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#fed330';
    ctx.beginPath();
    ctx.arc(x, y - 24, 15, 0, Math.PI * 2);
    ctx.fill();

    // Glasses
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 11, y - 26, 9, 7);
    ctx.strokeRect(x + 2, y - 26, 9, 7);
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 23);
    ctx.lineTo(x + 2, y - 23);
    ctx.stroke();

    // Grey hair
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(x, y - 29, 14, Math.PI, Math.PI * 2);
    ctx.fill();

    // Name badge
    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('👨‍💼 mgr Janusz Nowak (Dyrektor Szkoły)', x, y + 36);

    if (director.isRobbed) {
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('😱 ZSZOKOWANY (SEJF OBRABOWANY)', x, y + 50);
    }
  }

  drawDealerNPC(ctx, dealer) {
    const x = dealer.x || 750;
    const y = dealer.y || 175;

    // Trenchcoat body
    ctx.fillStyle = '#111111';
    ctx.fillRect(x - 20, y - 12, 40, 34);

    // Head with dark hood
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(x, y - 24, 17, 0, Math.PI * 2);
    ctx.fill();

    // Face shadow
    ctx.fillStyle = '#e0a96d';
    ctx.beginPath();
    ctx.arc(x, y - 22, 11, 0, Math.PI * 2);
    ctx.fill();

    // Sunglasses
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 10, y - 24, 20, 6);

    // Duffel bag with contraband
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(x + 18, y, 26, 18);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 18, y, 26, 18);

    // Cigarette / vape smoke puff
    if (Math.random() < 0.3) {
      this.addSteamPuff(x + 6, y - 16);
    }

    // Name badge
    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#9b59b6';
    ctx.textAlign = 'center';
    ctx.fillText('🕶️ Cichy Seba (Dark Web Dealer)', x, y + 38);
    ctx.font = '700 10px "Fredoka", sans-serif';
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('🧅 KUPNO / SPRZEDAŻ TOWARU', x, y + 52);
  }

  drawClassicStudent(ctx, student, isMe) {
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
      ctx.fillText("WYRZUCONY", x, y + 16);
      ctx.restore();
      return;
    }

    const app = student.appearance || { style: 'klasyk', color: '#2c3e50' };
    const style = app.style || 'klasyk';
    const shirtColor = app.color || '#2c3e50';
    const isMoving = student.isMoving;
    const isDucking = !!student.isDucking;
    const duckOffset = isDucking ? 10 : 0;
    const walkBob = (isMoving && !isDucking) ? Math.sin(Date.now() / 90) * 2.5 : 0;

    ctx.save();

    // Speed boost aura (Monster Energy)
    if (student.speedBoost) {
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y - 12 + duckOffset, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Legs / Pants
    const pantsColor = (style === 'dresiarz') ? '#1e272e' : (style === 'alternatywka' ? '#111' : '#2c3e50');
    ctx.fillStyle = pantsColor;
    if (student.isSitting) {
      // Sitting legs folded forward
      ctx.fillRect(x - 12, y + 6, 24, 10);
    } else if (isDucking) {
      // Crouching / ducking posture: bent legs low to ground
      ctx.fillRect(x - 12, y + 10, 10, 10);
      ctx.fillRect(x + 2, y + 10, 10, 10);
    } else {
      ctx.fillRect(x - 9, y + 8, 7, 16);
      ctx.fillRect(x + 2, y + 8, 7, 16);
    }

    // Shoes
    ctx.fillStyle = '#ffffff';
    if (!student.isSitting && !isDucking) {
      ctx.fillRect(x - 10, y + 22, 8, 4);
      ctx.fillRect(x + 2, y + 22, 8, 4);
    } else if (isDucking) {
      ctx.fillRect(x - 13, y + 18, 9, 4);
      ctx.fillRect(x + 4, y + 18, 9, 4);
    }

    // Torso / Shirt (lowered when crouching)
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x - 13, y - 14 + walkBob + duckOffset, 26, isDucking ? 18 : 23);

    // Style Specific Details
    if (style === 'dresiarz') {
      // 3 White stripes on sides
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 13, y - 12 + walkBob + duckOffset, 2, isDucking ? 14 : 20);
      ctx.fillRect(x - 10, y - 12 + walkBob + duckOffset, 2, isDucking ? 14 : 20);
      ctx.fillRect(x + 8, y - 12 + walkBob + duckOffset, 2, isDucking ? 14 : 20);
      ctx.fillRect(x + 11, y - 12 + walkBob + duckOffset, 2, isDucking ? 14 : 20);
    } else if (style === 'kujon') {
      // Shirt collar & backpack straps
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 14 + walkBob + duckOffset);
      ctx.lineTo(x, y - 8 + walkBob + duckOffset);
      ctx.lineTo(x + 6, y - 14 + walkBob + duckOffset);
      ctx.fill();
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(x - 10, y - 14 + walkBob + duckOffset, 3, isDucking ? 16 : 22);
      ctx.fillRect(x + 7, y - 14 + walkBob + duckOffset, 3, isDucking ? 16 : 22);
    } else if (style === 'bluza') {
      // Hoodie pocket & white drawstrings
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x - 8, y - 2 + walkBob + duckOffset, 16, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 3, y - 12 + walkBob + duckOffset, 1.5, 7);
      ctx.fillRect(x + 1.5, y - 12 + walkBob + duckOffset, 1.5, 7);
    } else if (style === 'alternatywka') {
      // Choker on neck
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 6, y - 16 + walkBob + duckOffset, 12, 3);
      // Striped sleeves
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 13, y - 4 + walkBob + duckOffset, 26, 3);
    }

    // Head (lowered when crouching)
    ctx.fillStyle = '#fed330';
    ctx.beginPath();
    ctx.arc(x, y - 25 + walkBob + duckOffset, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    if (style === 'dresiarz') {
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(x, y - 27 + walkBob + duckOffset, 12.5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
    } else if (style === 'kujon') {
      ctx.fillStyle = '#57606f';
      ctx.beginPath();
      ctx.arc(x, y - 28 + walkBob + duckOffset, 13, Math.PI, Math.PI * 2);
      ctx.fill();
      // Round glasses
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 8, y - 26 + walkBob + duckOffset, 6, 5);
      ctx.strokeRect(x + 2, y - 26 + walkBob + duckOffset, 6, 5);
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 23 + walkBob + duckOffset);
      ctx.lineTo(x + 2, y - 23 + walkBob + duckOffset);
      ctx.stroke();
    } else if (style === 'alternatywka') {
      // Dark gothic hair with purple fringe
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(x, y - 27 + walkBob + duckOffset, 14, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(x - 8, y - 32 + walkBob + duckOffset, 16, 5);
    } else {
      // Classic brown hair
      ctx.fillStyle = '#833471';
      ctx.beginPath();
      ctx.arc(x, y - 27 + walkBob + duckOffset, 13, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.arc(x - 4, y - 24 + walkBob + duckOffset, 1.8, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 24 + walkBob + duckOffset, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Visual Held / Equipped Item in hand
    const heldItemId = student.equippedItemId || (student.inventory && student.inventory.length > 0 ? student.inventory[0].id : null);
    if (heldItemId) {
      this.drawHeldItem(ctx, x, y, heldItemId, isDucking, walkBob, duckOffset);
    }

    ctx.restore();

    // Name badge & status tags
    ctx.font = isMe ? '700 13px "Fredoka", sans-serif' : '600 12px "Fredoka", sans-serif';
    ctx.fillStyle = isMe ? '#2ecc71' : '#ffffff';
    ctx.textAlign = 'center';

    const displayName = student.fullName || student.name;
    const nameLabel = isMe ? `★ ${displayName} (TY) ★` : displayName;
    ctx.fillText(nameLabel, x, y + 36);

    // Subtag for tardy, sitting, ducking or uwagi
    let subTags = [];
    if (student.isTardy) subTags.push('⚠️ SPÓŹNIONY');
    if (isDucking) subTags.push(student.isUnderDesk ? '🙈 W UKRYCIU (POD ŁAWKĄ)' : '🧎 KUCANIE');
    else if (student.isSitting) subTags.push('🪑 W ŁAWCE');
    if (student.uwagi > 0) subTags.push(`⚠️ x${student.uwagi}`);

    if (subTags.length > 0) {
      ctx.font = '700 10px "Fredoka", sans-serif';
      ctx.fillStyle = student.isTardy ? '#e74c3c' : (isDucking ? '#2ecc71' : '#f1c40f');
      ctx.fillText(subTags.join(' | '), x, y + 48);
    }
  }

  // Draw authentic 2D vector pixel-art held item in player's hands
  drawHeldItem(ctx, x, y, itemId, isDucking, walkBob, duckOffset = 0) {
    if (!itemId) return;

    if (itemId === 'ar15') {
      // Tactical Carbine AR-15 (Assault Rifle)
      ctx.save();
      ctx.translate(x + 10, y - 6 + walkBob + duckOffset);
      // Buttstock
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(-12, -2, 10, 5);
      // Buffer tube & Receiver
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(-2, -3, 16, 6);
      // Handguard with heat shield vents
      ctx.fillStyle = '#2f3640';
      ctx.fillRect(14, -2, 12, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(17, -1, 2, 2);
      ctx.fillRect(21, -1, 2, 2);
      // Long barrel & muzzle flash hider
      ctx.fillStyle = '#636e72';
      ctx.fillRect(26, -1, 8, 2);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(34, -1.5, 3, 3);
      // Curved 30-round STANAG magazine
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(6, 3);
      ctx.lineTo(4, 13);
      ctx.lineTo(8, 14);
      ctx.lineTo(10, 3);
      ctx.closePath();
      ctx.fill();
      // Pistol grip
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(0, 3, 4, 7);
      // Holographic Sight (Cyan reticle)
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(5, -6, 5, 3);
      ctx.restore();
    } else if (itemId === 'makarov') {
      // Russian Makarov 9mm Pistol
      ctx.save();
      ctx.translate(x + 8, y - 4 + walkBob + duckOffset);
      // Blued steel slide
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(0, -4, 14, 5);
      ctx.fillStyle = '#57606f';
      ctx.fillRect(13, -3, 3, 3);
      // Trigger guard
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(3, 1, 5, 5);
      // Reddish-brown Bakelite Star Grip
      ctx.fillStyle = '#b33927';
      ctx.fillRect(2, 1, 6, 9);
      // Soviet star circle
      ctx.fillStyle = '#d63031';
      ctx.beginPath();
      ctx.arc(5, 5.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (itemId === 'machete') {
      // Heavy Combat Machete
      ctx.save();
      ctx.translate(x + 8, y - 8 + walkBob + duckOffset);
      ctx.rotate(0.35);
      // Silver blade with curved belly
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(26, -5);
      ctx.lineTo(28, -2);
      ctx.lineTo(22, 5);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      // Polished blade spine highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, -1, 22, 1.5);
      // Cord-wrapped tactical handle
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(-6, 0, 7, 4);
      ctx.fillStyle = '#718093';
      ctx.fillRect(-8, -0.5, 2, 5);
      ctx.restore();
    } else if (itemId === 'knife') {
      // Tactical Folding Knife / Scyzoryk
      ctx.save();
      ctx.translate(x + 7, y - 2 + walkBob + duckOffset);
      ctx.fillStyle = '#f5f6fa';
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.lineTo(13, -2);
      ctx.lineTo(11, 2);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-5, -1, 6, 3.5);
      ctx.restore();
    } else if (itemId === 'vape') {
      // Electronic Vape Pod with Neon LED & Vapor Wisps
      ctx.save();
      ctx.translate(x + 8, y - 4 + walkBob + duckOffset);
      // Vape body
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(0, -6, 5, 14);
      ctx.strokeStyle = '#74b9ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, -6, 5, 14);
      // Mouthpiece
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(1, -9, 3, 3);
      // Illuminated LED base
      const ledPulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(0, 206, 201, ${ledPulse})`;
      ctx.fillRect(1, 8, 3, 2);
      // Tiny rising wisps of white vapor
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      const vOffset = (Date.now() / 60) % 9;
      ctx.beginPath();
      ctx.arc(2.5, -11 - vOffset, 1.8 + vOffset * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (itemId === 'smoke_grenade') {
      // Military Smoke Grenade
      ctx.save();
      ctx.translate(x + 8, y - 2 + walkBob + duckOffset);
      ctx.fillStyle = '#4b6584';
      ctx.fillRect(0, -4, 9, 13);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(0, 0, 9, 3);
      ctx.fillStyle = '#778ca3';
      ctx.fillRect(2, -7, 5, 3);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-1, -7, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (itemId === 'can_deposit') {
      // Refundable Aluminum Can
      ctx.save();
      ctx.translate(x + 7, y - 2 + walkBob + duckOffset);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(0, -5, 7, 12);
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(0, -6, 7, 1.5);
      ctx.fillRect(0, 7, 7, 1.5);
      ctx.restore();
    } else if (itemId === 'bottle_deposit') {
      // Refundable Glass Bottle
      ctx.save();
      ctx.translate(x + 7, y - 4 + walkBob + duckOffset);
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(0, 0, 7, 10);
      ctx.fillRect(2, -6, 3, 6);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(1.5, -8, 4, 2);
      ctx.restore();
    } else if (itemId === 'plastic_bottle_deposit') {
      // Plastic PET Bottle
      ctx.save();
      ctx.translate(x + 7, y - 4 + walkBob + duckOffset);
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(0, -2, 7, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, -5, 3, 3);
      ctx.restore();
    } else if (itemId === 'notebook') {
      // Chemistry Notebook
      ctx.save();
      ctx.translate(x + 6, y - 6 + walkBob + duckOffset);
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(0, 0, 11, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 7, 10);
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(3, 4, 5, 1.5);
      ctx.fillRect(3, 7, 5, 1.5);
      ctx.restore();
    } else if (itemId === 'pen') {
      // Ballpoint Pen
      ctx.save();
      ctx.translate(x + 7, y - 4 + walkBob + duckOffset);
      ctx.rotate(0.35);
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(0, -6, 2.5, 12);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(0, 6, 2.5, 2.5);
      ctx.restore();
    } else if (itemId === 'energy_drink' || itemId === 'monster') {
      // Monster Energy Can
      ctx.save();
      ctx.translate(x + 7, y - 3 + walkBob + duckOffset);
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(0, -5, 7, 13);
      ctx.fillStyle = '#2ecc71';
      ctx.font = '700 8px Arial';
      ctx.fillText('M', 2, 4);
      ctx.restore();
    } else if (itemId === 'master_keycard') {
      // Master RFID Keycard
      ctx.save();
      ctx.translate(x + 7, y - 4 + walkBob + duckOffset);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 10, 7);
      ctx.fillStyle = '#00d2d3';
      ctx.fillRect(0, 2, 10, 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(2, 4, 2.5, 2);
      ctx.restore();
    }
  }

  drawClassicInteractionPrompts(ctx, gameState, myId, myZone) {
    if (!gameState || !gameState.players) return;
    const me = gameState.players.find(p => p.id === myId);
    if (!me) return;

    const px = me.renderX || me.x;
    const py = me.renderY || me.y;
    const zone = myZone || me.currentZone || 'CORRIDOR';

    if (zone === 'CORRIDOR') {
      // 1. Sala 204 (Chemia) Door
      if (Math.hypot(px - 180, py - 190) < 90) {
        this.drawInteractionBadge(ctx, 180, 120, '🚪 [E] WEJDŹ DO SALI 204 (CHEMIA)');
        return;
      }
      // 2. Gabinet Dyrektora Door
      if (Math.hypot(px - 370, py - 190) < 90) {
        this.drawInteractionBadge(ctx, 370, 120, '🏛️ [E] WEJDŹ DO GABINETU DYREKTORA');
        return;
      }
      // 3. Pokój Nauczycielski Door
      if (Math.hypot(px - 550, py - 190) < 90) {
        this.drawInteractionBadge(ctx, 550, 120, '☕ [E] WEJDŹ DO POKOJU NAUCZYCIELSKIEGO');
        return;
      }
      // 4. Szkolny Sklepik / Bufet Door
      if (Math.hypot(px - 730, py - 190) < 90) {
        this.drawInteractionBadge(ctx, 730, 120, '🥪 [E] WEJDŹ DO SKLEPIKU SZKOLNEGO');
        return;
      }
      // 5. Szkolna Toaleta Door
      if (Math.hypot(px - 890, py - 190) < 90) {
        this.drawInteractionBadge(ctx, 890, 120, '🚻 [E] WEJDŹ DO TOALETY');
        return;
      }
      // 6. Schowek Woźnego Door (Left Wall: x: 0 to 40, y: 350)
      if (px < 80 && Math.abs(py - 350) < 80) {
        this.drawInteractionBadge(ctx, 95, 320, '🗝️ [E] SCHOWEK WOŹNEGO (KŁÓDKA)');
        return;
      }
      // 7. Radiowęzeł Door (Right Wall: x: 960 to 1000, y: 440)
      if (px > 910 && Math.abs(py - 440) < 80) {
        this.drawInteractionBadge(ctx, 905, 410, '🎙️ [E] RADIOWĘZEŁ I MONITORING (CZYTNIK RFID)');
        return;
      }
      // 8. Exit Door to Outdoor Field / Courtyard (Bottom center: x: 440 to 560, y >= 550)
      if (Math.hypot(px - 500, py - 635) < 85 || (py > 550 && Math.abs(px - 500) < 60)) {
        this.drawInteractionBadge(ctx, 500, 580, '🌿 [E] WYJDŹ NA POLE / BOISKO SZKOLNE');
        return;
      }
      // 9. Lockers along bottom wall (y > 520)
      if (py >= 520) {
        const lockerBays = [140, 340, 660, 860];
        const nearLocker = lockerBays.some(lx => Math.abs(px - lx) < 75);
        if (nearLocker) {
          this.drawInteractionBadge(ctx, px, py - 46, '🎒 [E] PRZESZUKAJ SZAFKĘ (+PLN / PRZEDMIOTY)');
          return;
        }
      }
    } else if (zone === 'CHEMISTRY') {
      // 1. Exit Door to Corridor
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. Secret Door to Kantorek Odczynników (Left wall: x < 70, y: 330)
      if (px < 80 && Math.abs(py - 330) < 80) {
        this.drawInteractionBadge(ctx, 95, 300, '☣️ [E] KANTOREK ODCZYNNIKÓW CHEMICZNYCH');
        return;
      }
      // 3. Chemistry Desks
      if (me.role === 'STUDENT') {
        if (me.isSitting) {
          this.drawInteractionBadge(ctx, px, py - 46, '📓 [E] ODRÓB ZADANIE DOMOWE | [Z] WSTAŃ');
          return;
        } else {
          const nearDesk = this.classicDeskSlots.some(d => Math.hypot(px - d.x, py - d.chairY) < 65);
          if (nearDesk) {
            this.drawInteractionBadge(ctx, px, py - 46, '🪑 [Z] USIĄDŹ W ŁAWCE | 📓 [E] ODRÓB ZADANIE');
            return;
          }
        }
      }
    } else if (zone === 'JANITOR_ROOM') {
      // 1. Exit Door
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. Wooden Chest
      if (Math.hypot(px - 315, py - 340) < 90) {
        this.drawInteractionBadge(ctx, 315, 275, '🧰 [E] OTWÓRZ SKRZYNIĘ WOŹNEGO');
        return;
      }
      // 3. Keyring Board
      if (Math.hypot(px - 727, py - 180) < 80) {
        this.drawInteractionBadge(ctx, 727, 120, '💳 [E] WEŹ KARTĘ MASTER DYREKCJI');
        return;
      }
      // 4. Fuse Box
      if (Math.hypot(px - 865, py - 325) < 90) {
        this.drawInteractionBadge(ctx, 865, 220, '⚡ [E] WYŁĄCZ PRĄD W SZKOLE (SABOTAŻ)');
        return;
      }
    } else if (zone === 'CHEM_LAB') {
      // 1. Exit Door to Chemistry Room
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] POWRÓT DO SALI 204');
        return;
      }
      // 2. Synthesis Workbench
      if (Math.hypot(px - 500, py - 300) < 115) {
        this.drawInteractionBadge(ctx, 500, 205, '🧪 [E] SYNTEZUJ ŚWIECĘ DYMNĄ');
        return;
      }
    } else if (zone === 'SERVER_ROOM') {
      // 1. Exit Door
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. PA Broadcast Console
      if (Math.hypot(px - 400, py - 315) < 95) {
        this.drawInteractionBadge(ctx, 400, 235, '🎙️ [E] NADAJNIK RADIOWĘZŁA (KOMUNIKAT)');
        return;
      }
      // 3. CCTV Terminal
      if (Math.hypot(px - 690, py - 315) < 95) {
        this.drawInteractionBadge(ctx, 690, 235, '🖥️ [E] KONSOLA CCTV (SKASUJ NAGRANIA I UWAGI)');
        return;
      }
    } else if (zone === 'DIRECTOR') {
      // 1. Exit Door to Corridor
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. Director Desk
      if (Math.hypot(px - 500, py - 260) < 115) {
        this.drawInteractionBadge(ctx, 500, 160, '💬 [E] ROZMAWIAJ Z DYREKTOREM');
        return;
      }
    } else if (zone === 'STAFF_ROOM') {
      // 1. Exit Door to Corridor
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. Coffee Corner
      if (Math.hypot(px - 125, py - 215) < 85) {
        this.drawInteractionBadge(ctx, 125, 140, '☕ [E] ZAPARZ KAWĘ TCHIBO');
        return;
      }
      // 3. Exam Filing Cabinet
      if (Math.hypot(px - 875, py - 215) < 85) {
        this.drawInteractionBadge(ctx, 875, 130, '📑 [E] SZAFA ZE SPRAWDZIANAMI');
        return;
      }
      // 4. Conference Table
      if (Math.hypot(px - 500, py - 370) < 115) {
        this.drawInteractionBadge(ctx, 500, 310, '💬 [E] POKÓJ NAUCZYCIELSKI (OPCJE)');
        return;
      }
    } else if (zone === 'BUFFET') {
      // 1. Exit Door to Corridor
      if (Math.hypot(px - 500, py - 645) < 90 || (py > 580 && Math.abs(px - 500) < 70)) {
        this.drawInteractionBadge(ctx, 500, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. Buffet Counter / Pani Basia
      if (Math.hypot(px - 500, py - 320) < 140 || (py < 360 && Math.abs(px - 500) < 280)) {
        this.drawInteractionBadge(ctx, 500, 210, '🥪 [E] SKLEPIK U PANI BASI (KUP JEDZENIE)');
        return;
      }
    } else if (zone === 'TOILET') {
      // 1. Exit Door to Corridor
      if (Math.hypot(px - 220, py - 645) < 90 || (py > 580 && Math.abs(px - 220) < 70)) {
        this.drawInteractionBadge(ctx, 220, 615, '🚪 [E] WYJDŹ NA KORYTARZ');
        return;
      }
      // 2. Shady Dealer in Kabina 2
      if (Math.hypot(px - 750, py - 220) < 105) {
        if (gameState.dealer && gameState.dealer.spawned) {
          this.drawInteractionBadge(ctx, 750, 140, '🧅 [E] CIEMNY RYNEK (CICHY SEBA - KUP / SPRZEDAJ)');
        } else {
          this.drawInteractionBadge(ctx, 750, 140, '⏳ KABINA 2: CICHY SEBA BĘDZIE O 11:55');
        }
        return;
      }
    } else if (zone === 'COURTYARD') {
      // 1. Entrance Doors back to School (x: 500, y: 70..100)
      if (Math.hypot(px - 500, py - 85) < 85 || (py < 125 && Math.abs(px - 500) < 65)) {
        this.drawInteractionBadge(ctx, 500, 115, '🏫 [E] WEJDŹ DO SZKOŁY (KORYTARZ)');
        return;
      }
      // 2. Kaucjomat 2000 (x: 820, y: 150)
      if (Math.hypot(px - 820, py - 150) < 105) {
        this.drawInteractionBadge(ctx, 820, 110, '♻️ [E] KAUCJOMAT: ZWRÓĆ PUSZKI I BUTELKI');
        return;
      }
      // 3. Pan Woźny / Grabienie liści (x: 160, y: 440)
      if (Math.hypot(px - 160, py - 440) < 95) {
        this.drawInteractionBadge(ctx, 160, 365, '🍂 [E] POMÓŻ WOŹNEMU GRABIĆ LIŚCIE (+20 PLN)');
        return;
      }
      // 4. Kosz do koszykówki / Zakład (x: 230, y: 320)
      if (Math.hypot(px - 230, py - 320) < 95) {
        this.drawInteractionBadge(ctx, 230, 275, '🏀 [E] RZUT DO KOSZA O ZAKŁAD (10 PLN)');
        return;
      }
      // 5. Śmietniki na dziedzińcu
      if (Math.hypot(px - 120, py - 210) < 85 || Math.hypot(px - 890, py - 490) < 85) {
        this.drawInteractionBadge(ctx, px, py - 46, '🗑️ [E] PRZESZUKAJ KONTENER');
        return;
      }
      // 6. Zbieranie kaucjowanych puszek i butelek z ziemi
      if (gameState.courtyardDeposits && gameState.courtyardDeposits.length > 0) {
        const nearbyDep = gameState.courtyardDeposits.find(d => Math.hypot(px - d.x, py - d.y) < 65);
        if (nearbyDep) {
          this.drawInteractionBadge(ctx, nearbyDep.x, nearbyDep.y - 30, `🥫 [E] PODNIEŚ: ${nearbyDep.name}`);
          return;
        }
      }
    }
  }

  drawInteractionBadge(ctx, x, y, text) {
    ctx.save();
    const pulse = Math.sin(Date.now() / 150) * 0.15 + 0.85;
    ctx.font = '700 12px "Fredoka", sans-serif';
    const textW = ctx.measureText(text).width;

    ctx.fillStyle = `rgba(39, 174, 96, ${pulse})`;
    ctx.fillRect(x - textW / 2 - 10, y - 14, textW + 20, 22);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - textW / 2 - 10, y - 14, textW + 20, 22);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 2);
    ctx.restore();
  }
}

window.GameRenderer = GameRenderer;
