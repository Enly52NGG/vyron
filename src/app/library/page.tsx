"use client";

import { useLibraryStore } from "@/store/library-store";
import { usePlayerStore } from "@/store/player-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { MediaCard } from "@/components/ui/MediaCard";
import { TrackCard } from "@/components/ui/TrackCard";
import Link from "next/link";
import { Plus, Heart, Clock, ListMusic } from "lucide-react";
import { useState } from "react";
import { listLocalTracks, addLocalTrack } from "@/lib/local-library";
import { useEffect } from "react";
import type { Track } from "@/types";

export default function LibraryPage() {
  const {
    playlists,
    likedTracks,
    recentlyPlayed,
    followedArtists,
    createPlaylist,
  } = useLibraryStore();
  const { setTrack } = usePlayerStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [localTracks, setLocalTracks] = useState<Track[]>([]);

  useEffect(() => {
    listLocalTracks().then(setLocalTracks).catch(console.error);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName("");
    setShowCreate(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("audio/")) continue;
      try {
        const track = await addLocalTrack(file);
        setLocalTracks((prev) => [track, ...prev]);
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Library</h1>
          <p className="text-sm text-white/50 mt-1">Плейлисты, лайки и локальные файлы</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <Button variant="secondary" size="sm">
              <span>
                <Plus className="w-3.5 h-3.5" />
                Добавить файлы
              </span>
            </Button>
            <input
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            Плейлист
          </Button>
        </div>
      </div>

      {showCreate && (
        <GlassCard className="p-4 flex gap-3 items-center">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Название плейлиста..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/30"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button variant="primary" size="sm" onClick={handleCreate}>
            Создать
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
            Отмена
          </Button>
        </GlassCard>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link href="/liked">
          <GlassCard hover className="p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/40 to-purple-600/30 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Liked Songs</p>
              <p className="text-xs text-white/40">{likedTracks.length} треков</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/recent">
          <GlassCard hover className="p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Recently Played</p>
              <p className="text-xs text-white/40">{recentlyPlayed.length} треков</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* Playlists */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Плейлисты</h2>
        {playlists.length === 0 ? (
          <p className="text-white/40 text-sm">Пока нет плейлистов</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {playlists.map((pl) => (
              <MediaCard
                key={pl.id}
                href={`/playlist/${pl.id}`}
                imageUrl={pl.tracks[0]?.coverUrl || "/placeholder-cover.svg"}
                title={pl.name}
                subtitle={`${pl.tracks.length} треков`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Local files */}
      {localTracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Локальные файлы</h2>
          <GlassCard className="p-2">
            {localTracks.map((t, i) => (
              <TrackCard key={t.id} track={t} queue={localTracks} index={i} />
            ))}
          </GlassCard>
        </section>
      )}

      {/* Followed artists */}
      {followedArtists.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Подписки</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {followedArtists.map((a) => (
              <MediaCard
                key={a.id}
                href={`/artist/${a.id}`}
                imageUrl={a.imageUrl}
                title={a.name}
                round
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
