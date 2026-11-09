"use client";

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { PlayerBar } from "@/components/player/PlayerBar";
import { usePlayerStore } from "@/store/player-store";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isExpanded, setExpanded, currentTrack } = usePlayerStore();

  return (
    <div className="h-screen flex flex-col bg-atmosphere overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-[calc(var(--player-height)+56px+16px)] md:pb-[calc(var(--player-height)+24px)]">
          {children}
        </main>
      </div>

      <MobileNav />
      <PlayerBar />


      {/* Expanded Player */}
      <AnimatePresence>
        {isExpanded && currentTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-2xl flex flex-col"
          >
            <div className="absolute top-6 right-6">
              <Button variant="icon" size="icon" onClick={() => setExpanded(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8">
              <motion.img
                key={currentTrack.id}
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-72 h-72 md:w-96 md:h-96 rounded-3xl object-cover shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />

              <div className="text-center max-w-md">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-lg text-white/60 mt-2">{currentTrack.artist}</p>
              </div>

              <div className="w-full max-w-md">
                {/* Progress will be controlled by the same store */}
                <ExpandedProgress />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandedProgress() {
  const { currentTime, duration, seek, progress } = usePlayerStore();
  return (
    <div className="flex items-center gap-3 text-sm text-white/50 tabular-nums">
      <span>{formatTime(currentTime)}</span>
      <div className="flex-1 relative h-1.5 bg-white/15 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
}
