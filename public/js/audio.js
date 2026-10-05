// Audio Engine with dual support: Real audio files (/assets/dzwonek.mp3, /assets/krzyk.mp3)
// and Web Audio API procedural synthesis fallbacks!

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.audioFiles = {};
    this.initAudioContext();
    this.loadAudioFiles();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  loadAudioFiles() {
    const files = {
      bell: ['/assets/dzwonek.mp3', '/assets/dzwonek.wav'],
      scream: ['/assets/krzyk.mp3', '/assets/krzyk.wav']
    };

    for (const [key, paths] of Object.entries(files)) {
      this.audioFiles[key] = [];
      paths.forEach(src => {
        const audio = new Audio();
        audio.src = src;
        audio.preload = 'auto';
        this.audioFiles[key].push(audio);
      });
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Play School Bell (dzwonek.mp3)
  playBell() {
    if (this.isMuted) return;
    this.resumeContext();

    // Try HTML Audio element first
    let played = false;
    if (this.audioFiles.bell && this.audioFiles.bell.length > 0) {
      const audio = this.audioFiles.bell[0].cloneNode();
      audio.volume = this.volume;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          played = true;
        }).catch(err => {
          // Fallback to Web Audio synthesis
          this.synthBell();
        });
        return;
      }
    }

    if (!played) {
      this.synthBell();
    }
  }

  // Play Shout (krzyk.mp3)
  playScream() {
    if (this.isMuted) return;
    this.resumeContext();

    let played = false;
    if (this.audioFiles.scream && this.audioFiles.scream.length > 0) {
      const audio = this.audioFiles.scream[0].cloneNode();
      audio.volume = Math.min(1.0, this.volume * 1.1);
      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          played = true;
        }).catch(err => {
          this.synthScream();
        });
        return;
      }
    }

    if (!played) {
      this.synthScream();
    }
  }

  // Warning exclamation cue
  playWarning() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);

    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Caught red-handed dramatic buzz
  playBusted() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(160, t);
    osc1.frequency.linearRampToValueAtTime(80, t + 0.6);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(165, t);
    osc2.frequency.linearRampToValueAtTime(82, t + 0.6);

    gain.gain.setValueAtTime(0.4 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  // Synthesized realistic electric school bell (Dual bell chime)
  synthBell() {
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;
    const duration = 2.2;

    // Fast mechanical hammer frequency
    const modFreq = 18;
    const modOsc = this.audioCtx.createOscillator();
    modOsc.frequency.setValueAtTime(modFreq, t);

    const modGain = this.audioCtx.createGain();
    modGain.gain.setValueAtTime(0.5, t);

    // Harmonic bell frequencies (metallic gong)
    const freqs = [880, 1760, 2640, 700];
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (idx * 3), t);

      const amp = (0.25 / (idx + 1)) * this.volume;
      gain.gain.setValueAtTime(amp, t);
      gain.gain.setValueAtTime(amp, t + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // Synthesized comical chaotic cartoon scream
  synthScream() {
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;
    const duration = 1.0;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Chaotic pitch wobble
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350 + Math.random() * 80, t);
    osc.frequency.linearRampToValueAtTime(700 + Math.random() * 150, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(280, t + duration);

    gain.gain.setValueAtTime(0.35 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Police Siren (Szkieły jadą! Sygnały radiowozu)
  playPoliceSiren(duration = 5.0) {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    
    // Siren sound: alternating high-low frequencies (European police siren)
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    // Frequency modulation for wailing siren
    for (let sec = 0; sec < duration; sec += 0.8) {
      osc.frequency.setValueAtTime(580, t + sec);
      osc.frequency.linearRampToValueAtTime(880, t + sec + 0.4);
      osc.frequency.linearRampToValueAtTime(580, t + sec + 0.8);
    }

    gain.gain.setValueAtTime(0.28 * this.volume, t);
    gain.gain.setValueAtTime(0.28 * this.volume, t + duration - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Halbina Rage Outburst ("WY GŁUPIE SKURWYSYNY!")
  playHalbinaRage() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;

    // 1. Heavy desk slam / blackboard bang
    const slamOsc = this.audioCtx.createOscillator();
    const slamGain = this.audioCtx.createGain();
    slamOsc.type = 'triangle';
    slamOsc.frequency.setValueAtTime(140, t);
    slamOsc.frequency.exponentialRampToValueAtTime(40, t + 0.5);

    slamGain.gain.setValueAtTime(0.7 * this.volume, t);
    slamGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    slamOsc.connect(slamGain);
    slamGain.connect(this.audioCtx.destination);
    slamOsc.start(t);
    slamOsc.stop(t + 0.6);

    // 2. Furious shrieking tone
    const rageOsc = this.audioCtx.createOscillator();
    const rageGain = this.audioCtx.createGain();
    rageOsc.type = 'sawtooth';
    rageOsc.frequency.setValueAtTime(400, t + 0.1);
    rageOsc.frequency.linearRampToValueAtTime(750, t + 0.4);
    rageOsc.frequency.linearRampToValueAtTime(520, t + 1.2);
    rageOsc.frequency.exponentialRampToValueAtTime(250, t + 2.0);

    rageGain.gain.setValueAtTime(0.01, t);
    rageGain.gain.linearRampToValueAtTime(0.45 * this.volume, t + 0.2);
    rageGain.gain.exponentialRampToValueAtTime(0.01, t + 2.0);

    rageOsc.connect(rageGain);
    rageGain.connect(this.audioCtx.destination);
    rageOsc.start(t + 0.1);
    rageOsc.stop(t + 2.0);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    // Update any loaded audio elements
    for (const key of Object.keys(this.audioFiles)) {
      this.audioFiles[key].forEach(audio => {
        audio.volume = this.volume;
      });
    }
  }

  // Paper airplane throw whoosh
  playWhoosh() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.35);

    gain.gain.setValueAtTime(0.2 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Heavy wooden chair toss
  playChairThrow() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    // Low heavy whoosh
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(280, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.45);

    gain.gain.setValueAtTime(0.55 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Chair smashing crash into teacher
  playChairCrash() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;

    // 1. Wood impact transient
    const impactOsc = this.audioCtx.createOscillator();
    const impactGain = this.audioCtx.createGain();
    impactOsc.type = 'sawtooth';
    impactOsc.frequency.setValueAtTime(180, t);
    impactOsc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

    impactGain.gain.setValueAtTime(0.85 * this.volume, t);
    impactGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    impactOsc.connect(impactGain);
    impactGain.connect(this.audioCtx.destination);
    impactOsc.start(t);
    impactOsc.stop(t + 0.4);

    // 2. Wood splinter crash noise
    const bufferSize = this.audioCtx.sampleRate * 0.4;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * this.volume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.audioCtx.destination);

    whiteNoise.start(t);
  }

  // Police phone dialing DTMF beeps & dial tone
  playPhoneDial() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const tones = [941, 1336, 770, 1209, 852, 1477]; // Keypad frequencies

    tones.forEach((freq, idx) => {
      const beepTime = t + idx * 0.12;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, beepTime);

      gain.gain.setValueAtTime(0.28 * this.volume, beepTime);
      gain.gain.setValueAtTime(0.01, beepTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(beepTime);
      osc.stop(beepTime + 0.09);
    });
  }

  // Pepper spray 500ml pressurized continuous hissing burst
  playPepperSpray() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const duration = 1.2;
    const bufferSize = this.audioCtx.sampleRate * duration;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.65 * this.volume, t);
    gain.gain.setValueAtTime(0.6 * this.volume, t + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    whiteNoise.start(t);
  }

  // Machete slash razor metal schwing
  playMacheteSlash() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;

    // High metal ring
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.25);

    gain.gain.setValueAtTime(0.65 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    // Fast blade whoosh
    const whooshOsc = this.audioCtx.createOscillator();
    const whooshGain = this.audioCtx.createGain();
    whooshOsc.type = 'sawtooth';
    whooshOsc.frequency.setValueAtTime(750, t);
    whooshOsc.frequency.linearRampToValueAtTime(150, t + 0.22);

    whooshGain.gain.setValueAtTime(0.45 * this.volume, t);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    whooshOsc.connect(whooshGain);
    whooshGain.connect(this.audioCtx.destination);
    whooshOsc.start(t);
    whooshOsc.stop(t + 0.25);
  }

  // Stun dizzy stars buzzing for 3 seconds
  playStunDizzy() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const duration = 2.8;

    for (let i = 0; i < 4; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 220, t);
      // Vibrato wobble
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(6 + i * 2, t);
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(35, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.12 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      lfo.start(t);
      osc.start(t);
      lfo.stop(t + duration);
      osc.stop(t + duration);
    }
  }

  // Juicy comic cartoon spit sound
  playSpit() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);

    gain.gain.setValueAtTime(0.55 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Fast ballpoint pen scratching on paper
  playPenScribble() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    for (let s = 0; s < 3; s++) {
      const st = t + s * 0.08;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400 + Math.random() * 600, st);

      gain.gain.setValueAtTime(0.2 * this.volume, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.06);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(st);
      osc.stop(st + 0.07);
    }
  }

  // Wooden chair moving / scraping floor when standing up or sitting down
  playSeatAction() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.linearRampToValueAtTime(190, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.22);

    gain.gain.setValueAtTime(0.4 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Policeman comic scream when slashed by machete
  playCopScream() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(850, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.45);

    gain.gain.setValueAtTime(0.55 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Police baton hit thud
  playBatonHit() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);

    gain.gain.setValueAtTime(0.65 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Police whistle blast
  playCopWhistle() {
    if (this.isMuted || !this.audioCtx) return;
    this.resumeContext();

    const t = this.audioCtx.currentTime;
    [0, 0.15].forEach(delay => {
      const wt = t + delay;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, wt);
      osc.frequency.linearRampToValueAtTime(2800, wt + 0.05);
      osc.frequency.linearRampToValueAtTime(2400, wt + 0.1);

      gain.gain.setValueAtTime(0.35 * this.volume, wt);
      gain.gain.exponentialRampToValueAtTime(0.01, wt + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(wt);
      osc.stop(wt + 0.12);
    });
  }
}

window.soundManager = new SoundManager();
