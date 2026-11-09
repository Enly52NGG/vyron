import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track, PlayerState } from "@/types";
import { audioEngine } from "@/lib/audio-engine";

interface PlayerStore extends PlayerState {
  setTrack: (track: Track, queue?: Track[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setExpanded: (v: boolean) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  updateProgress: (time: number, duration: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      history: [],
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      shuffle: false,
      repeat: "off",
      isExpanded: false,

      setTrack: async (track, queue = []) => {
        const { volume, isMuted } = get();
        set({
          currentTrack: track,
          queue,
          isPlaying: false,
          progress: 0,
          currentTime: 0,
          duration: track.duration || 0,
        });

        let url = track.audioUrl || track.previewUrl;

        // Local tracks stored in IndexedDB
        if ((!url || track.source === "local") && track.id.startsWith("local-")) {
          try {
            const { getLocalTrackUrl } = await import("@/lib/local-library");
            const localUrl = await getLocalTrackUrl(track.id);
            if (localUrl) url = localUrl;
          } catch (e) {
            console.error("Failed to resolve local track", e);
          }
        }

        if (!url) {
          console.warn("No playable URL for track", track.title);
          return;
        }

        try {
          await audioEngine.load(url);
          audioEngine.setVolume(isMuted ? 0 : volume);
          audioEngine.on("timeupdate", (time: number, dur: number) => {
            get().updateProgress(time, dur);
          });
          audioEngine.on("ended", () => {
            const { repeat, next } = get();
            if (repeat === "one") {
              audioEngine.seek(0);
              audioEngine.play();
            } else {
              next();
            }
          });
          set({ isPlaying: true });
          audioEngine.play();
        } catch (e) {
          console.error("Failed to load track", e);
        }
      },


      play: () => {
        audioEngine.play();
        set({ isPlaying: true });
      },

      pause: () => {
        audioEngine.pause();
        set({ isPlaying: false });
      },

      toggle: () => {
        const { isPlaying } = get();
        if (isPlaying) get().pause();
        else get().play();
      },

      next: () => {
        const { queue, currentTrack, shuffle, repeat, history } = get();
        if (!currentTrack) return;

        let nextTrack: Track | undefined;

        if (shuffle && queue.length > 0) {
          const idx = Math.floor(Math.random() * queue.length);
          nextTrack = queue[idx];
        } else {
          const idx = queue.findIndex((t) => t.id === currentTrack.id);
          if (idx >= 0 && idx < queue.length - 1) {
            nextTrack = queue[idx + 1];
          } else if (repeat === "all" && queue.length > 0) {
            nextTrack = queue[0];
          }
        }

        if (nextTrack) {
          set({ history: [...history, currentTrack].slice(-50) });
          get().setTrack(nextTrack, queue);
        } else {
          get().pause();
        }
      },

      previous: () => {
        const { history, currentTrack, queue } = get();
        if (history.length > 0) {
          const prev = history[history.length - 1];
          set({ history: history.slice(0, -1) });
          get().setTrack(prev, queue);
        } else if (currentTrack) {
          audioEngine.seek(0);
        }
      },

      seek: (time) => {
        audioEngine.seek(time);
        set({ currentTime: time });
      },

      setVolume: (v) => {
        const vol = Math.max(0, Math.min(1, v));
        audioEngine.setVolume(get().isMuted ? 0 : vol);
        set({ volume: vol, isMuted: vol === 0 ? true : get().isMuted });
      },

      toggleMute: () => {
        const { isMuted, volume } = get();
        const nextMuted = !isMuted;
        audioEngine.setVolume(nextMuted ? 0 : volume);
        set({ isMuted: nextMuted });
      },

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

      cycleRepeat: () =>
        set((s) => ({
          repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
        })),

      setExpanded: (v) => set({ isExpanded: v }),

      addToQueue: (track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      clearQueue: () => set({ queue: [] }),

      updateProgress: (time, duration) =>
        set({
          currentTime: time,
          duration: duration || get().duration,
          progress: duration ? time / duration : 0,
        }),
    }),
    {
      name: "vyron-player",
      partialize: (s) => ({
        volume: s.volume,
        shuffle: s.shuffle,
        repeat: s.repeat,
      }),
    }
  )
);
