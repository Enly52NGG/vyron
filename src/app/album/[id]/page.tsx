"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAlbum } from "@/lib/deezer";
import type { Album, Track } from "@/types";
import { TrackCard } from "@/components/ui/TrackCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { usePlayerStore } from "@/store/player-store";
import { useLibraryStore } from "@/store/library-store";
import { Play, Plus, ListPlus } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function AlbumPage() {
  const params = useParams();
  const id = params.id as string;
  const [album, setAlbum] = useState<(Album & { tracks: Track[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const { setTrack, addToQueue } = usePlayerStore();
  const { playlists, addTrackToPlaylist, createPlaylist } = useLibraryStore();

  useEffect(() => {
    if (!id) return;
    getAlbum(id)
      .then(setAlbum)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-6">
          <div className="w-48 h-48 skeleton rounded-2xl" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 skeleton" />
            <div className="h-4 w-40 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return <div className="text-white/50 py-20 text-center">Альбом не найден</div>;
  }

  const totalDuration = album.tracks?.reduce((s, t) => s + (t.duration || 0), 0) || 0;

  const playAll = () => {
    if (album.tracks?.[0]) {
      setTrack(album.tracks[0], album.tracks);
    }
  };

  const addAllToQueue = () => {
    album.tracks?.forEach((t) => addToQueue(t));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl"
        />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            {album.type === "single" ? "Сингл" : album.type === "ep" ? "EP" : "Альбом"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{album.title}</h1>
          <p className="text-white/70">
            {album.artist}
            {album.releaseDate && ` • ${album.releaseDate.slice(0, 4)}`}
            {album.tracks && ` • ${album.tracks.length} треков`}
            {totalDuration > 0 && ` • ${formatTime(totalDuration)}`}
          </p>
          <div className="flex flex-wrap gap-2 pt-3">
            <Button variant="primary" onClick={playAll}>
              <Play className="w-4 h-4 fill-black" />
              Слушать
            </Button>
            <Button variant="secondary" onClick={addAllToQueue}>
              <ListPlus className="w-4 h-4" />
              В очередь
            </Button>
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setShowPlaylistMenu((v) => !v)}
              >
                <Plus className="w-4 h-4" />
                В плейлист
              </Button>
              {showPlaylistMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 glass-strong rounded-xl p-2 z-20 shadow-2xl border border-white/10">
                  <button
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/10"
                    onClick={() => {
                      const name = prompt("Название нового плейлиста");
                      if (name) {
                        const pid = createPlaylist(name);
                        album.tracks?.forEach((t) => addTrackToPlaylist(pid, t));
                      }
                      setShowPlaylistMenu(false);
                    }}
                  >
                    + Создать новый плейлист
                  </button>
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/10 truncate"
                      onClick={() => {
                        album.tracks?.forEach((t) => addTrackToPlaylist(pl.id, t));
                        setShowPlaylistMenu(false);
                      }}
                    >
                      {pl.name}
                    </button>
                  ))}
                  {playlists.length === 0 && (
                    <p className="px-3 py-2 text-xs text-white/40">Нет плейлистов</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <GlassCard className="p-2">
        {album.tracks?.map((t, i) => (
          <TrackCard
            key={t.id}
            track={t}
            queue={album.tracks}
            index={i}
          />
        ))}
      </GlassCard>
    </div>
  );
}
