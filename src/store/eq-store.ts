import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EQ_PRESETS, DEFAULT_EQ_BANDS, type EQPreset } from "@/types";
import { audioEngine } from "@/lib/audio-engine";

interface EQStore {
  bands: number[];
  activePresetId: string | null;
  customPresets: EQPreset[];
  setBand: (index: number, gain: number) => void;
  setBands: (bands: number[]) => void;
  applyPreset: (preset: EQPreset) => void;
  reset: () => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (id: string) => void;
  renameCustomPreset: (id: string, name: string) => void;
}

export const useEQStore = create<EQStore>()(
  persist(
    (set, get) => ({
      bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      activePresetId: "normal",
      customPresets: [],

      setBand: (index, gain) => {
        const clamped = Math.max(-12, Math.min(12, gain));
        set((s) => {
          const bands = [...s.bands];
          bands[index] = clamped;
          audioEngine.setEQBand(index, clamped);
          return { bands, activePresetId: null };
        });
      },

      setBands: (bands) => {
        const clamped = bands.map((g) => Math.max(-12, Math.min(12, g)));
        audioEngine.setEQ(clamped);
        set({ bands: clamped, activePresetId: null });
      },

      applyPreset: (preset) => {
        audioEngine.setEQ(preset.bands);
        set({ bands: [...preset.bands], activePresetId: preset.id });
      },

      reset: () => {
        const zero = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        audioEngine.setEQ(zero);
        set({ bands: zero, activePresetId: "normal" });
      },

      saveCustomPreset: (name) => {
        const id = `custom-${Date.now()}`;
        const preset: EQPreset = {
          id,
          name,
          bands: [...get().bands],
          isCustom: true,
        };
        set((s) => ({
          customPresets: [...s.customPresets, preset],
          activePresetId: id,
        }));
      },

      deleteCustomPreset: (id) => {
        set((s) => ({
          customPresets: s.customPresets.filter((p) => p.id !== id),
          activePresetId: s.activePresetId === id ? "normal" : s.activePresetId,
        }));
      },

      renameCustomPreset: (id, name) => {
        set((s) => ({
          customPresets: s.customPresets.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        }));
      },
    }),
    {
      name: "vyron-eq",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply saved bands after hydration
          setTimeout(() => audioEngine.setEQ(state.bands), 100);
        }
      },
    }
  )
);

export { EQ_PRESETS, DEFAULT_EQ_BANDS };
