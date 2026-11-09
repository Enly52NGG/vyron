"use client";

import { useEffect, useState } from "react";
import { getChartTracks, getChartArtists, getChartAlbums, getEditorialReleases } from "@/lib/deezer";
import type { Track, Artist, Album } from "@/types";
import { TrackCard } from "@/components/ui/TrackCard";
import { MediaCard } from "@/components/ui/MediaCard";
import { useLibraryStore } from "@/store/library-store";
import { usePlayerStore } from "@/store/player-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

export function HomeContent() {
  const [trending, setTrending] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const { recentlyPlayed } = useLibraryStore();
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    async function load() {
      try {
        const [t, a, al, nr] = await Promise.all([
          getChartTracks(12),
          getChartArtists(8),
          getChartAlbums(8),
          getEditorialReleases(8),
        ]);
        setTrending(t);
        setArtists(a);
        setAlbums(al);
        setNewReleases(nr);
      } catch (e) {
        console.error("Failed to load charts", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  };

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight"
        >
          {greeting()}
        </motion.h1>
        <p className="text-white/50 mt-1">Ваша музыкальная вселенная</p>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyPlayed.slice(0, 6).map((track) => (
              <MediaCard
                key={track.id}
                href="#"
                imageUrl={track.coverUrl}
                title={track.title}
                subtitle={track.artist}
                onPlay={() => setTrack(track, recentlyPlayed)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 skeleton" />
            ))}
          </div>
        ) : (
          <GlassCard className="p-2">
            {trending.slice(0, 8).map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                queue={trending}
                index={i}
              />
            ))}
          </GlassCard>
        )}
      </section>

      {/* New Releases */}
      <section>
        <h2 className="text-lg font-semibold mb-4">New Releases</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-2xl" />
              ))
            : newReleases.map((album) => (
                <MediaCard
                  key={album.id}
                  href={`/album/${album.id}`}
                  imageUrl={album.coverUrl}
                  title={album.title}
                  subtitle={album.artist}
                />
              ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Popular Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-full" />
              ))
            : artists.map((artist) => (
                <MediaCard
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  imageUrl={artist.imageUrl}
                  title={artist.name}
                  subtitle={
                    artist.followers
                      ? `${(artist.followers / 1000).toFixed(0)}K listeners`
                      : undefined
                  }
                  round
                />
              ))}
        </div>
      </section>

      {/* Popular Albums */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Popular Albums</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-2xl" />
              ))
            : albums.map((album) => (
                <MediaCard
                  key={album.id}
                  href={`/album/${album.id}`}
                  imageUrl={album.coverUrl}
                  title={album.title}
                  subtitle={album.artist}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
