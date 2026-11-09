"use client";

import { useParams, useRouter } from "next/navigation";
import { useLibraryStore } from "@/store/library-store";
import { usePlayerStore } from "@/store/player-store";
import { TrackCard } from "@/components/ui/TrackCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Play, Pencil, Trash2, ListPlus } from "lucide-react";
import { useState } from "react";
import { formatTime } from "@/lib/utils";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { playlists, renamePlaylist, deletePlaylist, removeTrackFromPlaylist } =
    useLibraryStore();
  const { setTrack, addToQueue } = usePlayerStore();

  const playlist = playlists.find((p) => p.id === id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(playlist?.name || "");

  if (!playlist) {
    return (
      <div className="text-center py-20 text-white/50">
        Плейлист не найден
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((s, t) => s + (t.duration || 0), 0);

  const playAll = () => {
    if (playlist.tracks[0]) setTrack(playlist.tracks[0], playlist.tracks);
  };

  const handleRename = () => {
    if (name.trim()) {
      renamePlaylist(id, name.trim());
      setEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Удалить плейлист «${playlist.name}»?`)) {
      deletePlaylist(id);
      router.push("/library");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
        <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/20 flex items-center justify-center shadow-xl">
          {playlist.tracks[0]?.coverUrl ? (
            <img
              src={playlist.tracks[0].coverUrl}
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-4xl text-white/30">♪</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Плейлист
          </p>
          {editing ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-2xl font-bold outline-none focus:border-white/40"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
              <Button variant="primary" size="sm" onClick={handleRename}>
                Сохранить
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Отмена
              </Button>
            </div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {playlist.name}
            </h1>
          )}
          <p className="text-white/60 text-sm">
            {playlist.tracks.length} треков
            {totalDuration > 0 && ` • ${formatTime(totalDuration)}`}
          </p>
          <div className="flex flex-wrap gap-2 pt-3">
            <Button variant="primary" onClick={playAll} disabled={!playlist.tracks.length}>
              <Play className="w-4 h-4 fill-black" />
              Слушать
            </Button>
            <Button
              variant="secondary"
              onClick={() => playlist.tracks.forEach((t) => addToQueue(t))}
              disabled={!playlist.tracks.length}
            >
              <ListPlus className="w-4 h-4" />
              В очередь
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>
      </div>

      {playlist.tracks.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          Плейлист пуст. Добавьте треки из поиска или альбомов.
        </div>
      ) : (
        <GlassCard className="p-2">
          {playlist.tracks.map((t, i) => (
            <div key={t.id} className="group relative">
              <TrackCard track={t} queue={playlist.tracks} index={i} />
              <button
                onClick={() => removeTrackFromPlaylist(id, t.id)}
                className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-red-400 transition-opacity"
                title="Удалить из плейлиста"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
