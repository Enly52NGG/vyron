/**
 * Local audio library using IndexedDB.
 * User can add their own full tracks (files they own / CC / public domain).
 * No remote downloading of copyrighted material is performed here.
 */

import type { Track } from "@/types";

const DB_NAME = "vyron-local";
const STORE = "tracks";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("title", "title", { unique: false });
        store.createIndex("artist", "artist", { unique: false });
      }
    };
  });
}

export interface LocalTrackMeta {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string; // object URL or data URL
  addedAt: string;
  // The actual Blob is stored separately or as ArrayBuffer
}

/** Save a user-selected File as a local track */
export async function addLocalTrack(file: File, meta?: Partial<Track>): Promise<Track> {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const arrayBuffer = await file.arrayBuffer();

  // Try to read duration via temporary audio element
  const tempUrl = URL.createObjectURL(file);
  const duration = await new Promise<number>((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(audio.duration || 0);
      URL.revokeObjectURL(tempUrl);
    };
    audio.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(tempUrl);
    };
    audio.src = tempUrl;
  });

  const track: Track = {
    id,
    title: meta?.title || file.name.replace(/\.[^/.]+$/, ""),
    artist: meta?.artist || "Local File",
    album: meta?.album,
    duration: Math.round(duration) || 0,
    coverUrl: meta?.coverUrl || "/placeholder-cover.svg",
    audioUrl: "", // will be set to object URL when loading
    source: "local",
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put({
      ...track,
      blob: arrayBuffer,
      mimeType: file.type || "audio/mpeg",
    });
    tx.oncomplete = () => resolve(track);
    tx.onerror = () => reject(tx.error);
  });
}

/** Get object URL for playback of a local track */
export async function getLocalTrackUrl(id: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result;
      if (!row?.blob) {
        resolve(null);
        return;
      }
      const blob = new Blob([row.blob], { type: row.mimeType || "audio/mpeg" });
      resolve(URL.createObjectURL(blob));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function listLocalTracks(): Promise<Track[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = req.result || [];
      resolve(
        rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          artist: r.artist,
          album: r.album,
          duration: r.duration,
          coverUrl: r.coverUrl || "/placeholder-cover.svg",
          source: "local" as const,
        }))
      );
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removeLocalTrack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
