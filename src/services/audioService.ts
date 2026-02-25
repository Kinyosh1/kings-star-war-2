
class AudioService {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    // Context is initialized on first user interaction to comply with browser policies
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.connect(this.ctx.destination);
      this.masterVolume.gain.value = 0.3;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.masterVolume) {
      this.masterVolume.gain.value = enabled ? 0.3 : 0;
    }
  }

  // Laser shoot sound
  playShoot() {
    if (!this.enabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Explosion sound
  playExplosion() {
    if (!this.enabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // Player hit sound
  playHit() {
    if (!this.enabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // Powerup collect sound
  playPowerup() {
    if (!this.enabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // Level up sound
  playLevelUp() {
    if (!this.enabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
      osc.frequency.setValueAtTime(note, ctx.currentTime + i * 0.1);
    });

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  // Game over sound
  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(ctx.currentTime + 1);
  }
}

export const audioService = new AudioService();
