/**
 * Deezer public API client (no key required for catalogue endpoints)
 * Base: https://api.deezer.com
 */

import type { Track, Artist, Album } from "@/types";

const BASE = "https://api.deezer.com";

async function fetchDeezer<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Deezer API error: ${res.status}`);
  return res.json();
}

function mapTrack(raw: any): Track {
  return {
    id: String(raw.id),
    title: raw.title || raw.title_short || "Unknown",
    artist: raw.artist?.name || "Unknown Artist",
    artistId: raw.artist?.id ? String(raw.artist.id) : undefined,
    album: raw.album?.title,
    albumId: raw.album?.id ? String(raw.album.id) : undefined,
    duration: raw.duration || 30,
    coverUrl:
      raw.album?.cover_xl ||
      raw.album?.cover_big ||
      raw.album?.cover_medium ||
      raw.album?.cover ||
      "/placeholder-cover.svg",
    previewUrl: raw.preview || undefined,
    explicit: raw.explicit_lyrics || false,
    source: "deezer",
  };
}

function mapArtist(raw: any): Artist {
  return {
    id: String(raw.id),
    name: raw.name,
    imageUrl: raw.picture_xl || raw.picture_big || raw.picture_medium || "",
    followers: raw.nb_fan,
    description: undefined,
  };
}

function mapAlbum(raw: any): Album {
  return {
    id: String(raw.id),
    title: raw.title,
    artist: raw.artist?.name || "Unknown",
    artistId: raw.artist?.id ? String(raw.artist.id) : undefined,
    coverUrl: raw.cover_xl || raw.cover_big || raw.cover_medium || "",
    releaseDate: raw.release_date,
    trackCount: raw.nb_tracks,
    type: raw.record_type === "single" ? "single" : raw.record_type === "ep" ? "ep" : "album",
  };
}

export async function searchDeezer(
  query: string,
  type: "track" | "artist" | "album" | "all" = "all",
  limit = 20
) {
  if (!query.trim()) return { tracks: [], artists: [], albums: [] };

  const q = encodeURIComponent(query.trim());

  if (type === "track") {
    const data = await fetchDeezer<{ data: any[] }>(`/search/track?q=${q}&limit=${limit}`);
    return { tracks: data.data.map(mapTrack), artists: [], albums: [] };
  }
  if (type === "artist") {
    const data = await fetchDeezer<{ data: any[] }>(`/search/artist?q=${q}&limit=${limit}`);
    return { tracks: [], artists: data.data.map(mapArtist), albums: [] };
  }
  if (type === "album") {
    const data = await fetchDeezer<{ data: any[] }>(`/search/album?q=${q}&limit=${limit}`);
    return { tracks: [], artists: [], albums: data.data.map(mapAlbum) };
  }

  // all
  const [tracksRes, artistsRes, albumsRes] = await Promise.all([
    fetchDeezer<{ data: any[] }>(`/search/track?q=${q}&limit=${limit}`),
    fetchDeezer<{ data: any[] }>(`/search/artist?q=${q}&limit=${Math.min(limit, 10)}`),
    fetchDeezer<{ data: any[] }>(`/search/album?q=${q}&limit=${Math.min(limit, 10)}`),
  ]);

  return {
    tracks: tracksRes.data.map(mapTrack),
    artists: artistsRes.data.map(mapArtist),
    albums: albumsRes.data.map(mapAlbum),
  };
}

export async function getArtist(id: string): Promise<Artist & { topTracks: Track[]; albums: Album[] }> {
  const [artist, top, albums] = await Promise.all([
    fetchDeezer<any>(`/artist/${id}`),
    fetchDeezer<{ data: any[] }>(`/artist/${id}/top?limit=10`),
    fetchDeezer<{ data: any[] }>(`/artist/${id}/albums?limit=20`),
  ]);

  return {
    ...mapArtist(artist),
    description: undefined,
    popularTracks: top.data.map(mapTrack),
    albums: albums.data.map(mapAlbum),
    topTracks: top.data.map(mapTrack),
  };
}

export async function getAlbum(id: string): Promise<Album & { tracks: Track[] }> {
  const data = await fetchDeezer<any>(`/album/${id}`);
  return {
    ...mapAlbum(data),
    tracks: (data.tracks?.data || []).map(mapTrack),
  };
}

export async function getChartTracks(limit = 20): Promise<Track[]> {
  const data = await fetchDeezer<{ data: any[] }>(`/chart/0/tracks?limit=${limit}`);
  return data.data.map(mapTrack);
}

export async function getChartArtists(limit = 12): Promise<Artist[]> {
  const data = await fetchDeezer<{ data: any[] }>(`/chart/0/artists?limit=${limit}`);
  return data.data.map(mapArtist);
}

export async function getChartAlbums(limit = 12): Promise<Album[]> {
  const data = await fetchDeezer<{ data: any[] }>(`/chart/0/albums?limit=${limit}`);
  return data.data.map(mapAlbum);
}

export async function getEditorialReleases(limit = 12): Promise<Album[]> {
  try {
    const data = await fetchDeezer<{ data: any[] }>(`/editorial/0/releases?limit=${limit}`);
    return data.data.map(mapAlbum);
  } catch {
    return getChartAlbums(limit);
  }
}
