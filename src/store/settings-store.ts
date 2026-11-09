import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "@/types";

const defaultSettings: UserSettings = {
  theme: "dark",
  glassOpacity: 0.65,
  blurIntensity: 24,
  glowIntensity: 0.18,
  uiScale: 1,
  audioQuality: "high",
  crossfade: 0,
  autoplay: true,
  volumeNormalization: true,
  gapless: true,
  language: "ru",
  notifications: {
    newReleases: true,
    recommendations: true,
    platform: true,
  },
  privacy: {
    profilePublic: false,
    listenHistory: true,
  },
};

interface SettingsStore extends UserSettings {
  update: (partial: Partial<UserSettings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      update: (partial) => set((s) => ({ ...s, ...partial })),
      reset: () => set({ ...defaultSettings }),
    }),
    { name: "vyron-settings" }
  )
);
