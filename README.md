# VYRON — Premium Music Streaming (Local / Personal)

Liquid Glass design • Full player • Real Web Audio EQ • Deezer metadata • Local files

## Важно про аудио

Плеер умеет играть **полные треки**, которые ты сам добавляешь:

- Локальные файлы (drag & drop / «Добавить файлы» в Library) → хранятся в IndexedDB
- Любой `audioUrl`, который ты укажешь (свои хостинги, CC, public domain)
- 30-секундные превью Deezer (легальные) для быстрого прослушивания из поиска/чартов

Скачивание и раздача защищённой авторским правом коммерческой музыки **не реализуется** и не поддерживается.

## Что сделано

### Player
- Полный нижний бар + Expanded mode
- Shuffle / Repeat / Queue / Like / Volume
- Реальная визуализация + 10-полосный EQ (влияет на звук)
- Поддержка local IndexedDB tracks

### Pages
- Home (чарты Deezer)
- Search (треки / артисты / альбомы)
- Artist profile + Follow
- **Album page** — play all, add to queue, add to playlist
- **Playlist page** — rename, delete, remove tracks, play
- Library — create playlists, upload local audio files, followed artists
- Liked / Recently Played
- Settings + Equalizer
- **Mobile bottom navigation**

### Backend-ready
- `docs/supabase-schema.sql` — профили, likes, playlists, followed artists, new_releases
- `docs/release-tracker.md` — архитектура автоматического отслеживания релизов (Deezer + cron)
- `src/lib/supabase.ts` — клиент (включается при наличии env)

## Запуск

```bash
cd vyron
npm install
npm run dev
```

Опционально Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Затем выполни SQL из `docs/supabase-schema.sql`.

## Структура

```
src/
  app/           # routes
  components/    # UI, player, equalizer, layout, search
  lib/           # audio-engine, deezer, local-library, supabase
  store/         # player, eq, library, settings
docs/            # schema + release tracker
```

## Следующие улучшения (по желанию)

- Синхронизация local library ↔ Supabase после логина
- UI уведомлений о новых релизах
- Drag-and-drop сортировка треков в плейлисте
- PWA / offline
