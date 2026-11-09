"use client";

import { useLibraryStore } from "@/store/library-store";
import { TrackCard } from "@/components/ui/TrackCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock } from "lucide-react";

export default function RecentPage() {
  const { recentlyPlayed } = useLibraryStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Recently Played</h1>
          <p className="text-sm text-white/50">{recentlyPlayed.length} треков</p>
        </div>
      </div>

      {recentlyPlayed.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          История прослушивания пуста
        </div>
      ) : (
        <GlassCard className="p-2">
          {recentlyPlayed.map((t, i) => (
            <TrackCard key={`${t.id}-${i}`} track={t} queue={recentlyPlayed} index={i} />
          ))}
        </GlassCard>
      )}
    </div>
  );
}
