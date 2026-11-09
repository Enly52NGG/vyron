export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration: number; // seconds
  coverUrl: string;
  previewUrl?: string; // 30s preview
  audioUrl?: string;   // full track if available (CC)
  explicit?: boolean;
  releaseDate?: string;
  isrc?: string;
  source?: "deezer" | "itunes" | "local" | "jamendo";
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  followers?: number;
  description?: string;
  genres?: string[];
  popularTracks?: Track[];
  albums?: Album[];
  lastReleaseDate?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  releaseDate?: string;
  trackCount?: number;
  tracks?: Track[];
  type?: "album" | "single" | "ep";
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  owner?: string;
}

export interface EQBand {
  frequency: number;
  gain: number; // dB -12 to +12
}

export interface EQPreset {
  id: string;
  name: string;
  bands: number[]; // 10 values
  isCustom?: boolean;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  progress: number; // 0-1
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  isExpanded: boolean;
}

export interface UserSettings {
  theme: "dark" | "light" | "system";
  glassOpacity: number;
  blurIntensity: number;
  glowIntensity: number;
  uiScale: number;
  audioQuality: "auto" | "high" | "medium" | "low";
  crossfade: number; // seconds
  autoplay: boolean;
  volumeNormalization: boolean;
  gapless: boolean;
  language: string;
  notifications: {
    newReleases: boolean;
    recommendations: boolean;
    platform: boolean;
  };
  privacy: {
    profilePublic: boolean;
    listenHistory: boolean;
  };
}

export const DEFAULT_EQ_BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: EQPreset[] = [
  { id: "normal", name: "Normal", bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass", name: "Bass Boost", bands: [6, 5, 3, 1, 0, 0, 0, 0, 0, 0] },
  { id: "vocal", name: "Vocal Boost", bands: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1] },
  { id: "treble", name: "Treble Boost", bands: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6] },
  { id: "rock", name: "Rock", bands: [4, 3, 1, 0, -1, 0, 2, 3, 3, 2] },
  { id: "electronic", name: "Electronic", bands: [5, 4, 1, 0, -2, 0, 1, 3, 4, 5] },
  { id: "acoustic", name: "Acoustic", bands: [3, 2, 1, 0, 1, 2, 2, 1, 0, -1] },
];
