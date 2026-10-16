class SoundAndHapticsManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    try {
      const savedSound = localStorage.getItem('2048_sound_enabled');
      if (savedSound !== null) this.soundEnabled = savedSound === 'true';

      const savedHaptics = localStorage.getItem('2048_haptics_enabled');
      if (savedHaptics !== null) this.hapticsEnabled = savedHaptics === 'true';
    } catch {
      // LocalStorage fallback
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setSoundEnabled(val: boolean) {
    this.soundEnabled = val;
    try {
      localStorage.setItem('2048_sound_enabled', String(val));
    } catch {}
  }

  public isSoundEnabled() {
    return this.soundEnabled;
  }

  public setHapticsEnabled(val: boolean) {
    this.hapticsEnabled = val;
    try {
      localStorage.setItem('2048_haptics_enabled', String(val));
    } catch {}
  }

  public isHapticsEnabled() {
    return this.hapticsEnabled;
  }

  // Trigger haptic vibration on devices supporting navigator.vibrate
  public triggerHaptic(pattern: number | number[]) {
    if (!this.hapticsEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }

  public onSlide() {
    this.triggerHaptic(12);
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public onMerge(highestMergedValue: number = 4) {
    // Punchier haptic for bigger tiles
    if (highestMergedValue >= 2048) {
      this.triggerHaptic([40, 50, 100]);
    } else if (highestMergedValue >= 256) {
      this.triggerHaptic([30, 30, 45]);
    } else {
      this.triggerHaptic(28);
    }

    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Base note determined by tile power of 2
      const power = Math.log2(highestMergedValue);
      const baseFreq = 220 * Math.pow(1.05946, (power - 1) * 2); // ascending musical tone

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = highestMergedValue >= 1024 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public onWin() {
    this.triggerHaptic([60, 40, 80, 40, 140]);
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }

  public onGameOver() {
    this.triggerHaptic([45, 50, 45]);
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [330, 293.66, 261.63, 220]; // E4, D4, C4, A3
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.2);
      });
    } catch {}
  }
}

export const soundAndHaptics = new SoundAndHapticsManager();
