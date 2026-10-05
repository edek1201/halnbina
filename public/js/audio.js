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
}

window.soundManager = new SoundManager();
