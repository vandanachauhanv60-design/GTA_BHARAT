/**
 * High-performance Web Audio procedural sound synthesizer
 * Zero external assets needed, ultra-low latency, mobile-friendly
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch {
      console.warn('AudioContext not supported');
    }
  }

  private ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx) {
      if (this.engineGain) this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.rainGain) this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.sirenGain) this.sirenGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public getIsMuted() {
    return this.isMuted;
  }

  // --- Engine Audio ---
  public updateEngineSound(active: boolean, speedRatio: number, isDrifting: boolean = false) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    if (!active) {
      if (this.engineGain) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      return;
    }

    if (!this.engineOsc) {
      // Create dual-oscillator engine synthesis
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      osc1.frequency.setValueAtTime(45, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(90, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      osc1.start();
      osc2.start();

      this.engineOsc = osc1;
      this.engineOsc2 = osc2;
      this.engineGain = gain;
    }

    if (this.engineGain && this.engineOsc && this.engineOsc2) {
      const targetVol = isDrifting ? 0.14 : 0.08 + speedRatio * 0.07;
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);

      const baseFreq = 42 + speedRatio * 160 + (isDrifting ? 30 : 0);
      this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, this.ctx.currentTime, 0.05);
    }
  }

  // --- Car Horn (Indian Multi-Tone Brass Horn) ---
  public playHorn(type: 'car' | 'tuktuk' = 'car') {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'tuktuk') {
      // High-pitched peppy rickshaw horn
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(780, t);
      osc2.frequency.setValueAtTime(1040, t);
    } else {
      // Rich two-tone Indian automotive horn
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(440, t); // A4
      osc2.frequency.setValueAtTime(554.37, t); // C#5
    }

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.5);
    osc2.stop(t + 0.5);
  }

  // --- Police Siren ---
  public setPoliceSiren(active: boolean) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    if (!active) {
      if (this.sirenGain) {
        this.sirenGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      return;
    }

    if (!this.sirenOsc) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();

      this.sirenOsc = osc;
      this.sirenGain = gain;
    }

    if (this.sirenGain && this.sirenOsc) {
      this.sirenGain.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.1);
      // Continuous wail modulated
      const t = this.ctx.currentTime;
      const cycle = Math.sin(t * 4);
      const freq = 650 + cycle * 280;
      this.sirenOsc.frequency.setTargetAtTime(freq, t, 0.03);
    }
  }

  // --- Weapon Fire Sound ---
  public playWeaponShot(weaponType: string) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (weaponType === 'bat') {
      // Whoosh impact sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else if (weaponType === 'shotgun') {
      // Heavy boom
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    } else if (weaponType === 'ak47') {
      // Sharp metallic rifle crack
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else {
      // 9mm Pistol
      osc.type = 'square';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + (weaponType === 'shotgun' ? 0.4 : 0.2));
  }

  // --- Door / Car Enter / Exit ---
  public playDoorThud() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // --- Cash Transaction ---
  public playCashSound() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.18, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.35);
    });
  }

  // --- Monsoon Rain & Thunder Ambience ---
  public setRainActive(active: boolean) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    if (!active) {
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      }
      return;
    }

    if (!this.rainNode) {
      // White noise buffer for rain
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.rainNode = whiteNoise;
      this.rainGain = gain;
    } else if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(0.07, this.ctx.currentTime, 0.3);
    }
  }

  // Thunder rumble
  public playThunder() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.linearRampToValueAtTime(30, t + 1.2);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.4);
  }

  // Crash / Hit Impact
  public playImpact() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const sound = new SoundEngine();
