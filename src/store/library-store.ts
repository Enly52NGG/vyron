import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track, Playlist, Artist } from "@/types";

interface LibraryStore {
  likedTracks: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  followedArtists: Artist[];
  searchHistory: string[];

  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
  addToRecentlyPlayed: (track: Track) => void;
  createPlaylist: (name: string, description?: string) => string;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  followArtist: (artist: Artist) => void;
  unfollowArtist: (artistId: string) => void;
  isFollowing: (artistId: string) => boolean;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      likedTracks: [],
      playlists: [],
      recentlyPlayed: [],
      followedArtists: [],
      searchHistory: [],

      toggleLike: (track) => {
        set((s) => {
          const exists = s.likedTracks.some((t) => t.id === track.id);
          return {
            likedTracks: exists
              ? s.likedTracks.filter((t) => t.id !== track.id)
              : [track, ...s.likedTracks],
          };
        });
      },

      isLiked: (trackId) => get().likedTracks.some((t) => t.id === trackId),

      addToRecentlyPlayed: (track) => {
        set((s) => {
          const filtered = s.recentlyPlayed.filter((t) => t.id !== track.id);
          return {
            recentlyPlayed: [track, ...filtered].slice(0, 50),
          };
        });
      },

      createPlaylist: (name, description = "") => {
        const id = `pl-${Date.now()}`;
        const playlist: Playlist = {
          id,
          name,
          description,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ playlists: [playlist, ...s.playlists] }));
        return id;
      },

      deletePlaylist: (id) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),

      renamePlaylist: (id, name) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
          ),
        })),

      addTrackToPlaylist: (playlistId, track) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.tracks.some((t) => t.id === track.id)
              ? {
                  ...p,
                  tracks: [...p.tracks, track],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      removeTrackFromPlaylist: (playlistId, trackId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  tracks: p.tracks.filter((t) => t.id !== trackId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      followArtist: (artist) =>
        set((s) => {
          if (s.followedArtists.some((a) => a.id === artist.id)) return s;
          return { followedArtists: [artist, ...s.followedArtists] };
        }),

      unfollowArtist: (artistId) =>
        set((s) => ({
          followedArtists: s.followedArtists.filter((a) => a.id !== artistId),
        })),

      isFollowing: (artistId) =>
        get().followedArtists.some((a) => a.id === artistId),

      addSearchHistory: (query) => {
        const q = query.trim();
        if (!q) return;
        set((s) => {
          const filtered = s.searchHistory.filter(
            (h) => h.toLowerCase() !== q.toLowerCase()
          );
          return { searchHistory: [q, ...filtered].slice(0, 12) };
        });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    { name: "vyron-library" }
  )
);
