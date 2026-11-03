/**
 * Web Audio API synthesizer for TokVibe
 * Provides real synthesized background audio tracks for each sound and UI sound effects
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentBeatType: string | null = null;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;
  private volume = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public playSound(beatType: string) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      if (this.isPlaying && this.currentBeatType === beatType) {
        return;
      }

      this.stop();
      this.isPlaying = true;
      this.currentBeatType = beatType;

      let step = 0;
      const bpm = beatType === 'dholak_edm' ? 128 : beatType === 'lofi_chill' ? 84 : beatType === 'synth_pop' ? 120 : beatType === 'funny_bounce' ? 135 : 100;
      const stepDuration = (60 / bpm) / 4 * 1000; // 16th notes

      this.intervalId = window.setInterval(() => {
        if (!this.isPlaying || !this.ctx || !this.masterGain) return;
        this.renderStep(beatType, step);
        step = (step + 1) % 16;
      }, stepDuration);
    } catch {
      // Audio autoplay policy guard
    }
  }

  private renderStep(beatType: string, step: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    switch (beatType) {
      case 'dholak_edm': {
        // Kick / Dhol bass on 0, 4, 8, 12
        if (step % 4 === 0) {
          this.triggerBass(now, 65, 0.2);
        }
        // Clap / Snare on 4, 12
        if (step === 4 || step === 12) {
          this.triggerSnare(now);
        }
        // Dholak slap / hihat on offbeats
        if (step % 2 === 1) {
          this.triggerHiHat(now, 0.05);
        }
        // Melodic synth pluck
        if (step === 0 || step === 3 || step === 6 || step === 10 || step === 14) {
          const notes = [220, 261.63, 329.63, 392, 440];
          const freq = notes[step % notes.length];
          this.triggerPluck(now, freq, 'sawtooth');
        }
        break;
      }
      case 'lofi_chill': {
        if (step === 0 || step === 8) {
          this.triggerBass(now, 55, 0.35);
        }
        if (step === 4 || step === 12) {
          this.triggerSnare(now, 0.1);
        }
        if (step % 4 === 2) {
          this.triggerHiHat(now, 0.04);
        }
        if (step === 0 || step === 6 || step === 10) {
          const chords = [261.63, 311.13, 392.00, 466.16];
          this.triggerElectricPiano(now, chords[step % chords.length]);
        }
        break;
      }
      case 'synth_pop': {
        if (step % 4 === 0) {
          this.triggerBass(now, 80, 0.15);
        }
        if (step === 4 || step === 12) {
          this.triggerSnare(now);
        }
        this.triggerHiHat(now, 0.03);
        if (step % 2 === 0) {
          const melody = [330, 392, 440, 523.25, 440, 392];
          this.triggerPluck(now, melody[(step / 2) % melody.length], 'square');
        }
        break;
      }
      case 'funny_bounce': {
        if (step % 4 === 0) {
          this.triggerSpringBounce(now, 180 + (step * 20));
        }
        if (step === 4 || step === 12) {
          this.triggerWoodblock(now, 600);
        }
        if (step % 4 === 2) {
          this.triggerWoodblock(now, 800);
        }
        break;
      }
      default: {
        // acoustic guitar feel
        if (step % 4 === 0) {
          this.triggerBass(now, 70, 0.2);
        }
        if (step % 2 === 1) {
          const notes = [196, 246.94, 293.66, 392];
          this.triggerPluck(now, notes[step % notes.length], 'triangle');
        }
        break;
      }
    }
  }

  private triggerBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + duration);

    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerSnare(time: number, duration = 0.15) {
    if (!this.ctx || !this.masterGain) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + duration);
  }

  private triggerHiHat(time: number, duration = 0.05) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + duration);
  }

  private triggerPluck(time: number, freq: number, type: OscillatorType) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerElectricPiano(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.6);
  }

  private triggerSpringBounce(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 2.2, time + 0.12);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private triggerWoodblock(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  // UI Sound Effects
  public playHeartPop() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playFollowCheer() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  public playGiftSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    [600, 800, 1000, 1200].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  public playWhooshSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playGlitchSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    [240, 1200, 480, 1800].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      gain.gain.setValueAtTime(0.2, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.05);
    });
  }

  public stop() {
    this.isPlaying = false;
    this.currentBeatType = null;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const audioEngine = new AudioEngine();
