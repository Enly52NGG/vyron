# Automatic Music Release Tracking

## Goal
When an artist you follow releases a new album / single / EP, VYRON detects it and can notify you.

## Legal data sources (metadata only)
- **Deezer** public API: `/artist/{id}/albums`
- **MusicBrainz**: browse releases by artist MBID (rate limit ~1 req/s, requires User-Agent)
- **iTunes Search API**: recent albums by artist

We only store metadata + cover URLs. No full audio is downloaded.

## Architecture

1. User follows artist → row in `followed_artists` (Deezer artist_id + name).
2. Scheduled job (every 6–12 hours):
   - For each followed artist (or batch):
     - Fetch latest albums from Deezer
     - Compare with `last_release_id` / `last_release_date`
     - Insert new rows into `new_releases`
     - Update `last_checked_at` / `last_release_*`
3. Optional: Supabase Realtime or email/push notification when `new_releases.notified = false`.

## Implementation options

### A. Supabase Edge Function + pg_cron / external cron
```ts
// supabase/functions/check-releases/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function checkArtist(artistId: string, name: string) {
  const res = await fetch(`https://api.deezer.com/artist/${artistId}/albums?limit=5`);
  const data = await res.json();
  const albums = data.data || [];

  for (const album of albums) {
    const { error } = await supabase.from("new_releases").upsert({
      artist_id: artistId,
      artist_name: name,
      release_id: String(album.id),
      title: album.title,
      cover_url: album.cover_xl || album.cover_big,
      release_date: album.release_date,
      release_type: album.record_type,
    }, { onConflict: "artist_id,release_id" });
  }

  if (albums[0]) {
    await supabase.from("followed_artists")
      .update({
        last_checked_at: new Date().toISOString(),
        last_release_id: String(albums[0].id),
        last_release_date: albums[0].release_date,
      })
      .eq("artist_id", artistId);
  }
}

Deno.serve(async () => {
  const { data: artists } = await supabase.from("followed_artists").select("artist_id, name");
  for (const a of artists || []) {
    await checkArtist(a.artist_id, a.name);
    await new Promise(r => setTimeout(r, 300)); // be polite
  }
  return new Response(JSON.stringify({ ok: true, checked: artists?.length }));
});
```

Schedule with:
- Supabase Dashboard → Edge Functions → Schedules (or)
- External cron hitting the function URL with a secret header
- Vercel Cron / GitHub Actions

### B. Next.js Route Handler + Vercel Cron
`app/api/cron/releases/route.ts` + `vercel.json` cron expression.

## Rate limits
- Deezer: be respectful, ~50 req / 5s is usually fine for personal use.
- MusicBrainz: max 1 request per second, identify with User-Agent.

## UI
On Home or a “New Releases” section, query `new_releases` joined with the user’s follows and show cards. Mark as notified when opened.
