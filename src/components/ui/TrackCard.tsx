"use client";

import type { Track } from "@/types";
import { usePlayerStore } from "@/store/player-store";
import { useLibraryStore } from "@/store/library-store";
import { Play, Pause, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  index?: number;
  showIndex?: boolean;
  compact?: boolean;
}

export function TrackCard({
  track,
  queue,
  index,
  showIndex,
  compact,
}: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, toggle } = usePlayerStore();
  const { isLiked, toggleLike } = useLibraryStore();

  const isCurrent = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      toggle();
    } else {
      setTrack(track, queue || [track]);
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
      className={cn(
        "group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors",
        isCurrent && "bg-white/5"
      )}
      onClick={handlePlay}
    >
      {showIndex !== false && (
        <div className="w-6 text-center text-sm text-white/40 tabular-nums relative">
          <span className={cn("group-hover:hidden", isCurrent && isPlaying && "hidden")}>
            {index !== undefined ? index + 1 : ""}
          </span>
          <button
            onClick={handlePlay}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              isCurrent && isPlaying ? "flex" : "hidden group-hover:flex"
            )}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 text-white" fill="white" />
            ) : (
              <Play className="w-4 h-4 text-white" fill="white" />
            )}
          </button>
        </div>
      )}

      <img
        src={track.coverUrl}
        alt={track.title}
        className={cn(
          "rounded-lg object-cover shadow-md",
          compact ? "w-10 h-10" : "w-12 h-12"
        )}
        loading="lazy"
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCurrent ? "text-white" : "text-white/90"
          )}
        >
          {track.title}
        </p>
        <p className="text-xs text-white/50 truncate">{track.artist}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(track);
        }}
        className={cn(
          "p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          liked && "opacity-100 text-white"
        )}
      >
        <Heart
          className={cn("w-4 h-4", liked && "fill-white")}
          strokeWidth={1.5}
        />
      </button>

      <span className="text-xs text-white/40 tabular-nums w-10 text-right">
        {Math.floor(track.duration / 60)}:
        {(track.duration % 60).toString().padStart(2, "0")}
      </span>
    </motion.div>
  );
}
