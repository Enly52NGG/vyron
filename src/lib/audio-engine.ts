/**
 * VYRON Audio Engine
 * Uses Web Audio API for real equalizer processing and visualization.
 * Supports preview URLs and full tracks.
 */

import { DEFAULT_EQ_BANDS } from "@/types";

export class AudioEngine {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private audioElement: HTMLAudioElement | null = null;
  private isConnected = false;

  private currentUrl: string | null = null;
  private onTimeUpdate?: (time: number, duration: number) => void;
  private onEnded?: () => void;

  async init() {
    if (this.context) return;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.context.createGain();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create 10-band peaking EQ
    this.filters = DEFAULT_EQ_BANDS.map((freq, i) => {
      const filter = this.context!.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.Q.value = 1.4;
      filter.gain.value = 0;
      return filter;
    });

    // Chain: source -> filters[0] -> ... -> filters[9] -> gain -> analyser -> destination
    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }
    this.filters[this.filters.length - 1].connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  private async ensureContext() {
    if (!this.context) await this.init();
    if (this.context!.state === "suspended") {
      await this.context!.resume();
    }
  }

  async load(url: string) {
    await this.ensureContext();
    if (this.currentUrl === url && this.audioElement) return;

    this.stop();
    this.currentUrl = url;

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
    this.audioElement.preload = "auto";
    this.audioElement.src = url;

    await new Promise<void>((resolve, reject) => {
      if (!this.audioElement) return reject();
      this.audioElement.oncanplaythrough = () => resolve();
      this.audioElement.onerror = () => reject(new Error("Failed to load audio"));
      this.audioElement.load();
    });

    // Re-create source from media element
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {}
    }

    this.source = this.context!.createMediaElementSource(this.audioElement);
    this.source.connect(this.filters[0]);
    this.isConnected = true;

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement && this.onTimeUpdate) {
        this.onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || 0);
      }
    };

    this.audioElement.onended = () => {
      this.onEnded?.();
    };
  }

  play() {
    this.ensureContext().then(() => {
      this.audioElement?.play().catch(console.error);
    });
  }

  pause() {
    this.audioElement?.pause();
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = "";
      this.audioElement = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {}
      this.source = null;
    }
    this.currentUrl = null;
    this.isConnected = false;
  }

  seek(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(time, this.audioElement.duration || 0));
    }
  }

  setVolume(value: number) {
    // value 0-1
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, value));
    }
    if (this.audioElement) {
      this.audioElement.volume = 1; // we control via gainNode
    }
  }

  setEQBand(index: number, gainDb: number) {
    if (this.filters[index]) {
      this.filters[index].gain.value = Math.max(-12, Math.min(12, gainDb));
    }
  }

  setEQ(bands: number[]) {
    bands.forEach((gain, i) => this.setEQBand(i, gain));
  }

  getAnalyserData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getCurrentTime() {
    return this.audioElement?.currentTime || 0;
  }

  getDuration() {
    return this.audioElement?.duration || 0;
  }

  isPlaying() {
    return this.audioElement ? !this.audioElement.paused : false;
  }

  on(event: "timeupdate", cb: (time: number, duration: number) => void): void;
  on(event: "ended", cb: () => void): void;
  on(event: string, cb: any) {
    if (event === "timeupdate") this.onTimeUpdate = cb;
    if (event === "ended") this.onEnded = cb;
  }

  destroy() {
    this.stop();
    this.context?.close();
    this.context = null;
  }
}

// Singleton
export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : (null as any);
