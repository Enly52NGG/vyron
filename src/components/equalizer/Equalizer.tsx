"use client";

import { useEQStore, EQ_PRESETS, DEFAULT_EQ_BANDS } from "@/store/eq-store";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { RotateCcw, Plus, Trash2, Save } from "lucide-react";
import { motion } from "framer-motion";

const FREQ_LABELS = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

export function Equalizer() {
  const {
    bands,
    setBand,
    applyPreset,
    reset,
    activePresetId,
    customPresets,
    saveCustomPreset,
    deleteCustomPreset,
  } = useEQStore();

  const [newPresetName, setNewPresetName] = useState("");
  const [showSave, setShowSave] = useState(false);

  const allPresets = [...EQ_PRESETS, ...customPresets];

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    saveCustomPreset(newPresetName.trim());
    setNewPresetName("");
    setShowSave(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equalizer</h1>
          <p className="text-sm text-white/50 mt-1">
            10-полосный графический эквалайзер • влияет на реальный звук
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={reset}>
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      {/* Main EQ */}
      <GlassCard strong className="p-8">
        <div className="flex items-end justify-between gap-2 h-56">
          {bands.map((gain, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[60px]">
              <motion.span
                key={gain}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-xs tabular-nums text-white/70 h-5"
              >
                {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
              </motion.span>

              <div className="relative h-40 w-full flex justify-center">
                {/* Track background */}
                <div className="absolute inset-y-0 w-1 bg-white/10 rounded-full" />
                {/* Active fill from center */}
                <div
                  className="absolute w-1 bg-white/40 rounded-full transition-all duration-75"
                  style={{
                    height: `${(Math.abs(gain) / 12) * 50}%`,
                    bottom: gain >= 0 ? "50%" : undefined,
                    top: gain < 0 ? "50%" : undefined,
                  }}
                />
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={gain}
                  onChange={(e) => setBand(i, Number(e.target.value))}
                  className="eq-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                />
                {/* Thumb visual */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-75"
                  style={{
                    top: `${50 - (gain / 12) * 50}%`,
                    transform: "translateY(-50%)",
                  }}
                />
              </div>

              <span className="text-[10px] text-white/40 font-medium">
                {FREQ_LABELS[i]}
              </span>
              <span className="text-[9px] text-white/25">Hz</span>
            </div>
          ))}
        </div>

        {/* dB scale */}
        <div className="flex justify-between text-[10px] text-white/20 mt-4 px-2">
          <span>+12 dB</span>
          <span>0 dB</span>
          <span>-12 dB</span>
        </div>
      </GlassCard>

      {/* Presets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/70">Пресеты</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSave(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Сохранить текущий
          </Button>
        </div>

        {showSave && (
          <GlassCard className="p-4 mb-4 flex gap-3 items-center">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Название пресета..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/30"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
              Сохранить
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSave(false)}>
              Отмена
            </Button>
          </GlassCard>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={cn(
                "relative group text-left p-4 rounded-xl border transition-all duration-200",
                activePresetId === preset.id
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "glass glass-hover border-white/10 text-white"
              )}
            >
              <p className="text-sm font-medium">{preset.name}</p>
              <p className="text-[10px] opacity-60 mt-0.5">
                {preset.isCustom ? "Пользовательский" : "Системный"}
              </p>
              {preset.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomPreset(preset.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
