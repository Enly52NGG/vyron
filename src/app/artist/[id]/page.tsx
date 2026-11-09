"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getArtist } from "@/lib/deezer";
import type { Artist, Track, Album } from "@/types";
import { TrackCard } from "@/components/ui/TrackCard";
import { MediaCard } from "@/components/ui/MediaCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useLibraryStore } from "@/store/library-store";
import { usePlayerStore } from "@/store/player-store";
import { formatNumber } from "@/lib/utils";
import { Play, UserPlus, UserCheck } from "lucide-react";

export default function ArtistPage() {
  const params = useParams();
  const id = params.id as string;
  const [artist, setArtist] = useState<(Artist & { topTracks: Track[]; albums: Album[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  const { isFollowing, followArtist, unfollowArtist } = useLibraryStore();
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    getArtist(id)
      .then(setArtist)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 skeleton rounded-2xl" />
        <div className="h-8 w-48 skeleton" />
      </div>
    );
  }

  if (!artist) {
    return <div className="text-white/50 py-20 text-center">Исполнитель не найден</div>;
  }

  const following = isFollowing(artist.id);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-end">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover shadow-2xl"
        />
        <div className="flex-1 space-y-3">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Исполнитель</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{artist.name}</h1>
          {artist.followers && (
            <p className="text-sm text-white/50">
              {formatNumber(artist.followers)} слушателей
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                if (artist.topTracks?.[0]) {
                  setTrack(artist.topTracks[0], artist.topTracks);
                }
              }}
            >
              <Play className="w-4 h-4 fill-black" />
              Слушать
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                following ? unfollowArtist(artist.id) : followArtist(artist)
              }
            >
              {following ? (
                <>
                  <UserCheck className="w-4 h-4" /> Подписка
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Подписаться
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Popular tracks */}
      {artist.topTracks && artist.topTracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Популярные треки</h2>
          <GlassCard className="p-2">
            {artist.topTracks.map((t, i) => (
              <TrackCard key={t.id} track={t} queue={artist.topTracks} index={i} />
            ))}
          </GlassCard>
        </section>
      )}

      {/* Albums */}
      {artist.albums && artist.albums.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Альбомы и синглы</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {artist.albums.map((a) => (
              <MediaCard
                key={a.id}
                href={`/album/${a.id}`}
                imageUrl={a.coverUrl}
                title={a.title}
                subtitle={a.releaseDate?.slice(0, 4)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
