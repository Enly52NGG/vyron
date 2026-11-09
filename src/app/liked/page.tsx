"use client";

import { useLibraryStore } from "@/store/library-store";
import { TrackCard } from "@/components/ui/TrackCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Heart } from "lucide-react";

export default function LikedPage() {
  const { likedTracks } = useLibraryStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Liked Songs</h1>
          <p className="text-sm text-white/50">{likedTracks.length} треков</p>
        </div>
      </div>

      {likedTracks.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          Пока нет любимых треков. Нажмите ♥ на любом треке.
        </div>
      ) : (
        <GlassCard className="p-2">
          {likedTracks.map((t, i) => (
            <TrackCard key={t.id} track={t} queue={likedTracks} index={i} />
          ))}
        </GlassCard>
      )}
    </div>
  );
}
