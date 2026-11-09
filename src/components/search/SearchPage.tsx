"use client";

import { useState, useEffect, useCallback } from "react";
import { searchDeezer } from "@/lib/deezer";
import type { Track, Artist, Album } from "@/types";
import { TrackCard } from "@/components/ui/TrackCard";
import { MediaCard } from "@/components/ui/MediaCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLibraryStore } from "@/store/library-store";
import { Search as SearchIcon, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "tracks" | "artists" | "albums">("all");

  const { searchHistory, addSearchHistory, clearSearchHistory } = useLibraryStore();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchDeezer(q, "all", 20);
      setTracks(res.tracks);
      setArtists(res.artists);
      setAlbums(res.albums);
      addSearchHistory(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [addSearchHistory]);

  useEffect(() => {
    doSearch(debounced);
  }, [debounced, doSearch]);

  const hasResults = tracks.length > 0 || artists.length > 0 || albums.length > 0;

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Искать исполнителей, треки, альбомы..."
          className="w-full h-12 pl-12 pr-12 rounded-2xl glass-strong border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-white/25 transition-colors text-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        )}
      </div>

      {/* History when empty */}
      {!query && searchHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/60">Недавние поиски</h2>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-white/40 hover:text-white"
            >
              Очистить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((h) => (
              <button
                key={h}
                onClick={() => setQuery(h)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      {query && (
        <div className="flex gap-2">
          {(["all", "tracks", "artists", "albums"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              {tab === "all" ? "Все" : tab === "tracks" ? "Треки" : tab === "artists" ? "Исполнители" : "Альбомы"}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 skeleton" />
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {!loading && hasResults && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Tracks */}
            {(activeTab === "all" || activeTab === "tracks") && tracks.length > 0 && (
              <section>
                {activeTab === "all" && (
                  <h2 className="text-lg font-semibold mb-3">Треки</h2>
                )}
                <GlassCard className="p-2">
                  {tracks.map((t, i) => (
                    <TrackCard key={t.id} track={t} queue={tracks} index={i} />
                  ))}
                </GlassCard>
              </section>
            )}

            {/* Artists */}
            {(activeTab === "all" || activeTab === "artists") && artists.length > 0 && (
              <section>
                {activeTab === "all" && (
                  <h2 className="text-lg font-semibold mb-3">Исполнители</h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {artists.map((a) => (
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

            {/* Albums */}
            {(activeTab === "all" || activeTab === "albums") && albums.length > 0 && (
              <section>
                {activeTab === "all" && (
                  <h2 className="text-lg font-semibold mb-3">Альбомы</h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {albums.map((a) => (
                    <MediaCard
                      key={a.id}
                      href={`/album/${a.id}`}
                      imageUrl={a.coverUrl}
                      title={a.title}
                      subtitle={a.artist}
                    />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && query && !hasResults && (
        <div className="text-center py-20 text-white/40">
          Ничего не найдено по запросу «{query}»
        </div>
      )}
    </div>
  );
}
