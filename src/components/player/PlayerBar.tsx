"use client";

import { usePlayerStore } from "@/store/player-store";
import { useLibraryStore } from "@/store/library-store";
import { useEQStore } from "@/store/eq-store";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { formatTime, cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { audioEngine } from "@/lib/audio-engine";
import { EQ_PRESETS } from "@/types";

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setExpanded,
  } = usePlayerStore();

  const { isLiked, toggleLike, addToRecentlyPlayed } = useLibraryStore();
  const [showVolume, setShowVolume] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  // Visualization
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const data = audioEngine.getAnalyserData();
      if (!data.length) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barWidth = (w / data.length) * 2.2;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * h * 0.85;
        const alpha = 0.3 + (data[i] / 255) * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (currentTrack && isPlaying) {
      addToRecentlyPlayed(currentTrack);
    }
  }, [currentTrack?.id]);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[var(--player-height)] glass-strong border-t border-white/5 z-50 flex items-center justify-center text-white/40 text-sm">
        Выберите трек для воспроизведения
      </div>
    );
  }

  const liked = isLiked(currentTrack.id);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[var(--player-height)] glass-strong border-t border-white/8 z-50 px-4 flex items-center gap-4">
        {/* Visualization background */}
        <canvas
          ref={canvasRef}
          width={400}
          height={60}
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        />

        {/* Track info */}
        <div className="flex items-center gap-3 min-w-[200px] max-w-[280px] relative z-10">
          <motion.img
            key={currentTrack.id}
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-lg object-cover shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
          </div>
          <Button
            variant="icon"
            size="icon"
            onClick={() => toggleLike(currentTrack)}
            className={cn(liked && "text-white")}
          >
            <Heart
              className={cn("w-4 h-4", liked && "fill-white")}
              strokeWidth={1.5}
            />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="icon"
              size="icon"
              onClick={toggleShuffle}
              active={shuffle}
              className="w-8 h-8"
            >
              <Shuffle className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            <Button variant="icon" size="icon" onClick={previous} className="w-9 h-9">
              <SkipBack className="w-5 h-5" strokeWidth={1.5} />
            </Button>

            <Button
              variant="primary"
              size="icon"
              onClick={toggle}
              className="w-11 h-11 shadow-[0_0_24px_rgba(255,255,255,0.25)]"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" strokeWidth={0} />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" strokeWidth={0} />
              )}
            </Button>

            <Button variant="icon" size="icon" onClick={next} className="w-9 h-9">
              <SkipForward className="w-5 h-5" strokeWidth={1.5} />
            </Button>

            <Button
              variant="icon"
              size="icon"
              onClick={cycleRepeat}
              active={repeat !== "off"}
              className="w-8 h-8"
            >
              {repeat === "one" ? (
                <Repeat1 className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Repeat className="w-4 h-4" strokeWidth={1.5} />
              )}
            </Button>
          </div>

          {/* Progress */}
          <div className="w-full flex items-center gap-2 text-[11px] text-white/50 tabular-nums">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 relative group">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1 appearance-none bg-transparent cursor-pointer
                  [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full
                  [&::-webkit-slider-runnable-track]:bg-white/15
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:mt-[-4px]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.5)]
                  group-hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
              />
              <div
                className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-white pointer-events-none"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 min-w-[200px] justify-end relative z-10">
          <Button
            variant="icon"
            size="icon"
            onClick={() => setShowEQ((v) => !v)}
            active={showEQ}
            title="Equalizer"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          </Button>

          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <Button variant="icon" size="icon" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Volume2 className="w-4 h-4" strokeWidth={1.5} />
              )}
            </Button>
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 90 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <Slider
                    value={isMuted ? 0 : volume * 100}
                    min={0}
                    max={100}
                    onChange={(v) => setVolume(v / 100)}
                    className="w-20"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="icon" size="icon" title="Queue">
            <ListMusic className="w-4 h-4" strokeWidth={1.5} />
          </Button>

          <Button
            variant="icon"
            size="icon"
            onClick={() => setExpanded(true)}
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Mini EQ panel */}
      <AnimatePresence>
        {showEQ && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[calc(var(--player-height)+12px)] right-4 z-50"
          >
            <MiniEqualizer onClose={() => setShowEQ(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MiniEqualizer({ onClose }: { onClose: () => void }) {
  const { bands, setBand, applyPreset, reset, activePresetId } = useEQStore();
  

  return (
    <div className="glass-strong rounded-2xl p-4 w-[340px] shadow-2xl border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Equalizer</h3>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white text-xs"
        >
          Закрыть
        </button>
      </div>

      <div className="flex justify-between gap-1 h-32 mb-3">
        {bands.map((gain, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[9px] text-white/40 tabular-nums">
              {gain > 0 ? `+${gain}` : gain}
            </span>
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={gain}
              onChange={(e) => setBand(i, Number(e.target.value))}
              className="eq-slider h-24"
            />
            <span className="text-[8px] text-white/30">
              {[31, 62, 125, 250, 500, "1k", "2k", "4k", "8k", "16k"][i]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EQ_PRESETS.map((p: any) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md transition-colors",
              activePresetId === p.id
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            )}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={reset}
          className="text-[10px] px-2 py-1 rounded-md bg-white/10 text-white/70 hover:bg-white/15"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
