'use client'

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  CaretDown,
  List,
  SpeakerSlash,
  ThumbsUp,
  ThumbsDown,
  Share,
  WarningCircle,
  ArrowClockwise,
} from 'phosphor-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/kami/scroll-reveal'
import { Spinner } from '@/components/ui/spinner'
import VideoPlayer, { type VideoPlayerHandle } from '@/components/video-player'
import { useAuth } from '@/context/AuthContext'
import { discoverApi } from '@/lib/api/discover'
import { takePendingEpisode } from '@/lib/watch-session'
import { mapApiItemToAnime } from '@/lib/api/discover-adapter'
import { ApiError, getUserFacingError } from '@/lib/api/errors'
import { formatDuration } from '@/lib/mock-data'
import type { Anime, Episode } from '@/types/anime'
import type {
  ApiContentDetailResponse,
  ApiEpisode,
  ApiSeasonDetail,
} from '@/types/api/discover'

interface FlatEpisode {
  season: number
  episode: ApiEpisode
}

function flattenEpisodes(seasons: ApiSeasonDetail[]): FlatEpisode[] {
  return seasons.flatMap((s) =>
    s.episodes.map((ep) => ({ season: s.number, episode: ep }))
  )
}

function toPlayerEpisode(item: ApiContentDetailResponse, flat: FlatEpisode): Episode {
  return {
    id: flat.episode.id,
    animeId: item.item.id,
    season: flat.season,
    number: flat.episode.number,
    title: flat.episode.title,
    description: flat.episode.synopsis,
    thumbnail: flat.episode.thumbnailUrl || item.item.images.poster.url,
    cover: item.item.images.backdrop.url || item.item.images.poster.url,
    videoUrl: '', // filled with the stream URL once resolved
    tracks: [],
    duration: flat.episode.duration,
    releaseDate: String(item.item.year),
  }
}

function movieEpisode(item: ApiContentDetailResponse): Episode {
  return {
    id: item.item.id,
    animeId: item.item.id,
    season: 1,
    number: 1,
    title: item.item.title,
    thumbnail: item.item.images.poster.url,
    cover: item.item.images.backdrop.url || item.item.images.poster.url,
    videoUrl: '',
    tracks: [],
    duration: 0,
    releaseDate: String(item.item.year),
  }
}

interface StreamState {
  url: string
  loading: boolean
  /** 'unavailable' when the provider has no source, otherwise a message. */
  error: string | null
}

export default function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = use(params)
  const t = useTranslations('watch')
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const currentLocale = locale || pathname?.split('/')[1] || 'fr'

  /**
   * Client-side episode selection. The URL stays clean (`/watch/<slug>` —
   * no `?ep=`), so switching episodes only updates this state; the selected
   * episode is chosen automatically (pending hand-off, saved progress, then
   * episode 1).
   */
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  /** Seconds to resume at for the currently selected episode (0 = start). */
  const [resumeAt, setResumeAt] = useState(0)

  // ── Real data ──
  const [detail, setDetail] = useState<ApiContentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const [stream, setStream] = useState<StreamState>({
    url: '',
    loading: true,
    error: null,
  })

  /**
   * Surfaced from inside the player: a `<video>` MEDIA_ERR_*, a fatal hls.js
   * event, or a `NotAllowedError` because the auto-play gesture window
   * already closed. Displayed in the existing error banner so the user
   * understands *why* playback isn't starting — without this we silently
   * fail behind a poster image.
   */
  const [playbackError, setPlaybackError] = useState<string | null>(null)

  /**
   * Whether playback has actually started at least once. Driven by the
   * VideoPlayer's `onPlayingChange(true)` callback (i.e. the <video> element
   * fired `onPlay`) AFTER the user clicked the overlay (`userActivated`).
   * The muted preview runs behind the overlay without a gesture, but it must
   * NOT auto-dismiss the Netflix CTA — that would defeat the "press play"
   * moment. If the browser rejects play(), the overlay stays up and the
   * user can simply click again.
   */
  const [started, setStarted] = useState(false)

  /** True once the user clicked the overlay (play intent given). */
  const userActivated = useRef(false)
  /** True once the muted preview is actually playing (first frame flowing). */
  const previewLive = useRef(false)

  /**
   * Latches `started=true` the first time the <video> actually plays AND
   * dismisses any stale playback-error banner. `started` is gated on
   * `userActivated` so the silent muted preview never hides the overlay by
   * itself. The dismiss step is essential for the "transient error → retry →
   * plays" recovery path: without it, the banner stays stuck even after
   * hls.js recovered or play() finally succeeded.
   *
   * Wrapped in useCallback so the VideoPlayer doesn't rebuild its event
   * listener effect on every parent render.
   */
  const handlePlayingChange = useCallback((playing: boolean) => {
    if (playing) {
      previewLive.current = true
      if (userActivated.current) setStarted(true)
      setPlaybackError(null)
    }
  }, [])

  /**
   * Fires when the player has a *playable* source attached (hls.js manifest
   * parsed, or native <source> delivered `loadedmetadata` / `canplay`). We
   * use this to pre-emptively clear any banner from a previous attempt —
   * hls.js's `startLoad()` recovery path (network blip → retry → manifest
   * loads) would otherwise leave the user staring at an error banner on
   * top of a video that's about to play.
   */
  const handlePlaybackReady = useCallback(() => {
    setPlaybackError(null)
  }, [])

  /**
   * Playback failure (hls.js fatal / <video> MEDIA_ERR_* / autoplay gate).
   * Besides surfacing the banner, it clears the "preview is live" latch so
   * a subsequent overlay click can't optimistically dismiss the CTA while
   * the stream is actually broken.
   */
  const handlePlaybackError = useCallback((message: string) => {
    previewLive.current = false
    setPlaybackError(message)
  }, [])

  /** Imperative handle so the overlay click lands as a real user-gesture
   *  call into `video.play()` — bypassing browser auto-play blocks that
   *  would otherwise fire after the Next.js page transition. */
  const playerRef = useRef<VideoPlayerHandle>(null)

  const [showFullInfo, setShowFullInfo] = useState(false)
  const [showEpisodeList, setShowEpisodeList] = useState(false)
  const [openSeason, setOpenSeason] = useState<number | null>(null)

  // Fetch the published item (header + seasons/episodes).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)

    discoverApi
      .itemBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setDetail(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(getUserFacingError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  /**
   * Resolve the initial episode to play (client-side, no URL param):
   *   1. a pending episode handed off via sessionStorage (episode grid,
   *      history, calendar…) — also cleans up a legacy `?ep=` query so the
   *      address bar stays `/watch/<slug>`;
   *   2. the user's saved watch progress for this title (auto-resume);
   *   3. episode 1.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const pending = takePendingEpisode()
    // Legacy deep links (`/watch/<slug>?ep=<id>`) are honored then rewritten
    // to the clean URL.
    const url = new URL(window.location.href)
    const legacyEp = url.searchParams.get('ep')
    const initial = pending ?? legacyEp
    if (initial) setSelectedEpisodeId(initial)
    if (legacyEp) {
      url.searchParams.delete('ep')
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false })
    }
  }, [router])

  const anime: Anime | null = detail ? mapApiItemToAnime(detail.item) : null
  const isMovie =
    !!detail && (detail.item.type === 'movie' || detail.item.format === 'movie')

  const episodes = useMemo(
    () => (detail ? flattenEpisodes(detail.seasons) : []),
    [detail]
  )

  const currentFlat = useMemo(() => {
    if (!detail || isMovie) return null
    if (selectedEpisodeId) {
      return (
        episodes.find((e) => e.episode.id === selectedEpisodeId) ??
        episodes[0] ??
        null
      )
    }
    return episodes[0] ?? null
  }, [detail, isMovie, selectedEpisodeId, episodes])

  const episodesBySeason = useMemo(() => {
    const map = new Map<number, FlatEpisode[]>()
    for (const ep of episodes) {
      const list = map.get(ep.season) ?? []
      list.push(ep)
      map.set(ep.season, list)
    }
    return Array.from(map.entries())
  }, [episodes])

  const currentIndex = currentFlat
    ? episodes.findIndex((e) => e.episode.id === currentFlat.episode.id)
    : -1
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex >= 0 && currentIndex < episodes.length - 1
      ? episodes[currentIndex + 1]
      : null

  /** Switch episode client-side — the URL never changes. */
  const selectEpisode = useCallback(
    (episodeId: string) => {
      setSelectedEpisodeId(episodeId)
      setResumeAt(0)
    },
    []
  )

  /**
   * Auto-resume: when the user is signed in and has in-progress playback for
   * this title, jump straight to that episode and seek to the saved position.
   * Only applies when nothing else (pending hand-off / ?ep=) already picked
   * an episode — user intent wins over history.
   */
  const resumeAppliedRef = useRef(false)
  useEffect(() => {
    if (!isAuthenticated || !detail || resumeAppliedRef.current) return
    if (selectedEpisodeId) {
      resumeAppliedRef.current = true
      return
    }
    let cancelled = false
    discoverApi
      .continueWatching(50)
      .then((res) => {
        if (cancelled || resumeAppliedRef.current) return
        const progress = res.items.find(
          (p) => p.animeId === detail.item.id && p.percentage > 0 && p.percentage < 98
        )
        if (!progress) return
        resumeAppliedRef.current = true
        setSelectedEpisodeId(progress.episodeId)
        if (progress.progress > 0) setResumeAt(progress.progress)
      })
      .catch(() => {
        /* no progress / not authenticated — default to episode 1 */
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, detail, selectedEpisodeId])

  // Memoized so its identity stays stable across re-renders — the stream
  // effect below must not re-run (and re-set state) on every render.
  const playerEpisode: Episode | null = useMemo(() => {
    if (isMovie) return detail ? movieEpisode(detail) : null
    return currentFlat ? toPlayerEpisode(detail!, currentFlat) : null
  }, [detail, currentFlat, isMovie])

  // Resolve the playable stream URL as soon as the item + selected episode
  // are known. This MUST complete before the player's proxy request fires:
  // the /stream endpoint performs the provider resolution AND, for Plex-fed
  // content, the Plex→Jellyfin bridge (writes the .strm, waits for the
  // library scan) plus the transcode pre-warm. The proxy depends on that
  // cached state — racing it (mounting the player first) makes two
  // concurrent bridges fight over the same .strm and the manifest request
  // answers 400. First resolution of a title can be slow (the bridge), so
  // this call gets a generous timeout instead of failing the first play.
  const streamReqId = useRef(0)
  const episodeKey = playerEpisode?.id ?? null
  useEffect(() => {
    if (!detail || !playerEpisode) return
    // Metadata-only item (no media linked on Plex/Jellyfin — e.g. rows
    // imported from AniList): the stream resolver would only fail with
    // "No … found on the media server" after a slow provider search, so
    // surface the unavailable state immediately instead.
    if (detail.item.availability?.watchable === false) {
      setStream({ url: '', loading: false, error: 'unavailable' })
      return
    }
    const id = ++streamReqId.current
    console.log('[Watch] Resolving stream for slug:', detail.item.slug, '| episode:', episodeKey, '| isMovie:', isMovie)
    setStream({ url: '', loading: true, error: null })
    const controller = new AbortController()

    discoverApi
      .streamUrl(detail.item.slug, {
        episodeId: isMovie ? undefined : episodeKey ?? undefined,
        signal: controller.signal,
        timeoutMs: 90_000,
      })
      .then((res) => {
        if (streamReqId.current !== id) return
        const proxyUrl = discoverApi.streamProxyUrl(detail.item.slug, {
          episodeId: res.isMovie ? undefined : episodeKey ?? undefined,
        })
        console.log('[Watch] Stream URL resolved:', { streamUrl: res.streamUrl, proxyUrl, isMovie: res.isMovie })
        setStream({ url: proxyUrl, loading: false, error: null })
      })
      .catch((err) => {
        if (streamReqId.current !== id || controller.signal.aborted) return
        console.error('[Watch] Stream URL failed:', err)
        const message =
          err instanceof ApiError && err.code === 'STREAM_UNAVAILABLE'
            ? 'unavailable'
            : getUserFacingError(err)
        setStream({ url: '', loading: false, error: message })
      })

    return () => controller.abort()
  }, [detail, episodeKey, isMovie, retryCount, playerEpisode])

  useEffect(() => {
    if (detail) {
      document.title = `Kami-Sama: ${detail.item.title}`
    }
  }, [detail])

  // Any episode switch resets the "I clicked play" state so the overlay
  // reappears — this matches what Crunchyroll/Netflix do when you skip
  // to an episode from the chapter rail.
  useEffect(() => {
    userActivated.current = false
    previewLive.current = false
    setStarted(false)
    setPlaybackError(null)
  }, [episodeKey])

  /* ── Watch progress persistence ────────────────────────────────────────
     Every ~8s of real playback the page PUTs the playhead to
     /watch/progress/:episodeId. That is what feeds the discover "Reprendre"
     rail (continue-watching) and the auto-resume above. A final write is
     flushed when playback pauses / the episode switches, so the stored
     position is never more than a few seconds stale. */
  const lastReportedRef = useRef(0)
  const reportProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!isAuthenticated || !detail || !playerEpisode) return
      const now = Date.now()
      if (now - lastReportedRef.current < 8000) return
      lastReportedRef.current = now
      const percentage = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
      discoverApi
        .updateProgress(playerEpisode.id, {
          animeId: playerEpisode.animeId,
          progress: currentTime,
          duration,
          percentage,
          completed: percentage >= 95,
        })
        .catch(() => {
          /* silent — progress is best-effort */
        })
    },
    [isAuthenticated, detail, playerEpisode]
  )

  const handlePlayerTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      reportProgress(currentTime, duration)
    },
    [reportProgress]
  )

  // Flush a final progress write whenever playback stops (pause / episode
  // switch / unmount) so the stored position is current.
  const flushProgressRef = useRef<() => void>(() => {})
  flushProgressRef.current = () => {
    const video = document.querySelector('video')
    if (!video || !isAuthenticated || !detail || !playerEpisode) return
    const duration = video.duration || 0
    const percentage = duration > 0 ? Math.min(100, (video.currentTime / duration) * 100) : 0
    discoverApi
      .updateProgress(playerEpisode.id, {
        animeId: playerEpisode.animeId,
        progress: video.currentTime,
        duration,
        percentage,
        completed: percentage >= 95,
      })
      .catch(() => {
        /* silent */
      })
  }

  const handlePlayingChangeWithFlush = useCallback(
    (playing: boolean) => {
      handlePlayingChange(playing)
      if (!playing) {
        flushProgressRef.current()
        lastReportedRef.current = 0
      }
    },
    [handlePlayingChange]
  )

  // Flush on episode switch + unmount so the last position sticks.
  useEffect(() => {
    flushProgressRef.current()
  }, [episodeKey])
  useEffect(() => {
    return () => {
      flushProgressRef.current()
    }
  }, [playerEpisode])

  // Shared retry logic for the two error banners: forget the click intent
  // and the preview state, clear the per-attempt flags and re-resolve the
  // stream so the fresh Netflix overlay comes back with a live session.
  const retryStream = useCallback(() => {
    userActivated.current = false
    previewLive.current = false
    setPlaybackError(null)
    setStarted(false)
    setRetryCount((c) => c + 1)
  }, [])

  useEffect(() => {
    if (currentFlat && openSeason === null) {
      setOpenSeason(currentFlat.season)
    }
  }, [currentFlat, openSeason])

  // ── Loading / error states ──
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!detail || !anime || !playerEpisode) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">{t('notFound.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error || t('notFound.description')}</p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/">{t('notFound.goHome')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentTitle = isMovie
    ? detail.item.title
    : `E${currentFlat!.episode.number} – ${currentFlat!.episode.title}`
  const currentDescription = isMovie
    ? anime.synopsis
    : currentFlat!.episode.synopsis || anime.synopsis

  return (
    <div className="relative min-h-dvh select-none bg-[#141414]">
      <div className="mesh-gradient-bg" />

      {/* ── Video Player ── */}
      <div className="relative w-full bg-black">
        <div className="relative mx-auto w-full">
          {/* While the stream resolves, show a clean black frame with a
              spinner — NO movie/series asset (the old "loading screen" is
              gone). The /stream call must finish first: it runs the
              Plex→Jellyfin bridge + transcode pre-warm, so the proxy
              manifest request that follows always hits a ready session and
              the muted autoplay launches the content automatically. */}
          {stream.loading && (
            <div className="relative aspect-24/9 w-full overflow-hidden bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-10 rounded-full border-2 border-white/20 border-t-white/90 animate-spin" />
              </div>
            </div>
          )}

          {!stream.loading && stream.error && (
            <div className="flex aspect-24/9 w-full flex-col items-center justify-center gap-3 px-6 text-center">
              <WarningCircle className="size-10 text-white/40" weight="light" />
              <h2 className="text-lg font-bold text-white">
                {stream.error === 'unavailable'
                  ? t('stream.unavailableTitle')
                  : t('stream.error')}
              </h2>
              <p className="max-w-md text-sm text-white/50">
                {stream.error === 'unavailable'
                  ? t('stream.unavailableDescription')
                  : stream.error}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/25 text-white hover:bg-white/10"
                  onClick={retryStream}
                >
                  <ArrowClockwise className="size-4" />
                  {t('stream.retry')}
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-white/70 hover:bg-white/10">
                  <Link href={isMovie ? `/${currentLocale}/movies/${detail.item.slug}` : `/${currentLocale}/series/${detail.item.slug}`}>
                    {t('notFound.goHome')}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {!stream.loading && !stream.error && stream.url && (
            <VideoPlayer
              ref={playerRef}
              episode={{ ...playerEpisode, videoUrl: stream.url }}
              // Auto-play: the stream engine (Jellyfin transcoding + hls.js)
              // starts as soon as the manifest is ready. If the browser blocks
              // autoplay (NotAllowedError), the Netflix-style overlay stays up
              // so the user can click to start manually.
              autoPlay={true}
              onPlaybackError={handlePlaybackError}
              onPlayingChange={handlePlayingChangeWithFlush}
              onPlaybackReady={handlePlaybackReady}
              // Persist watch progress (throttled inside the handler) so the
              // discover "Reprendre" rail resumes where the user stopped.
              onTimeUpdate={handlePlayerTimeUpdate}
              // Auto-resume: seek to the saved position once the stream loads.
              startTime={resumeAt}
              // Muted autoplay: browsers allow it without a gesture, so the
              // stream genuinely starts the instant the manifest is ready —
              // the video is live instead of a dead still. The click below
              // reveals the audio.
              startMuted
              // No poster until the first frame flows: the frame stays black
              // during the short warm-up after mount (no art flash).
              hidePosterUntilPlay
              // While the Netflix overlay is visible (`!started`), suppress
              // the player's intrinsic big Play button so the two CTAs don't
              // compete. Once playback starts, this flips back to false and
              // the player's button reasserts itself for pause/resume.
              hideBuiltInPlayOverlay={!started}
            />
          )}

          {/* Playback error (raised by VideoPlayer — hls.js / <video> /
              autoplay gate). Shown in front of the player while keeping the
              same Retry CTA so the user can re-trigger the stream. */}
          {!stream.loading && !stream.error && stream.url && playbackError && (
            <div className="absolute inset-0 z-30 flex aspect-24/9 w-full flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
              <WarningCircle className="size-10 text-white/40" weight="light" />
              <h2 className="text-lg font-bold text-white">
                {t('stream.playbackErrorTitle')}
              </h2>
              <p className="max-w-md text-sm text-white/60">
                {playbackError}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/25 text-white hover:bg-white/10"
                  onClick={retryStream}
                >
                  <ArrowClockwise className="size-4" />
                  {t('stream.retry')}
                </Button>
              </div>
            </div>
          )}

          {/* ── Audio-reveal chip ──
              The stream autoplays MUTED the moment the manifest is ready, so
              the video is genuinely visible on the player — no full-screen
              asset stands between the user and the content (that was the
              "no video, only the poster" state). This small chip is the
              only affordance: one click reveals the audio from a real user
              gesture and dismisses it. If the muted preview is already
              live, playback is confirmed — dismiss immediately. Otherwise
              `started` flips via onPlayingChange once play() delivers the
              first frame, so a still-buffering stream keeps the chip up
              rather than hiding it before anything plays. */}
          {!stream.loading && !stream.error && stream.url && !started && !playbackError && (
            <button
              type="button"
              onClick={() => {
                userActivated.current = true
                setPlaybackError(null)
                const player = playerRef.current
                player?.unmute()
                player?.play().catch(() => undefined)
                if (previewLive.current) setStarted(true)
              }}
              className="absolute bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-black/80"
              aria-label={t('preview.unmute')}
            >
              <SpeakerSlash className="size-4" weight="fill" />
              {t('preview.unmute')}
            </button>
          )}
        </div>
      </div>

      {/* ── Content Below Player ── */}
      <div className="mx-auto max-w-350 px-4 pt-4 pb-20 md:px-8 md:pt-6 md:pb-28">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
          {/* ═══ Left Column: Episode Info ═══ */}
          <div className="min-w-0 space-y-6">
            <ScrollReveal>
              <div>
                {/* Anime title (orange) */}
                <p className="text-sm font-semibold text-[#e50914]">
                  {anime.title}
                </p>

                {/* Episode title */}
                <h1 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl">
                  {currentTitle}
                </h1>

                {/* Metadata row */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
                  {anime.ageRating && (
                    <>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {anime.ageRating}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{t('meta.subtitled')}</span>
                  {anime.year > 0 && (
                    <>
                      <span>•</span>
                      <span>{anime.year}</span>
                    </>
                  )}
                </div>

                {/* Like / Dislike / Share */}
                <div className="mt-4 flex items-center gap-3">
                  <button type="button" className="flex items-center gap-1.5 text-white/60 transition-colors hover:text-white">
                    <ThumbsUp className="size-5" weight="light" />
                    <span className="text-sm">{anime.ratingCount > 0 ? anime.ratingCount.toLocaleString('fr-FR') : '0'}</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 text-white/60 transition-colors hover:text-white">
                    <ThumbsDown className="size-5" weight="light" />
                    <span className="text-sm">0</span>
                  </button>
                  <button type="button" className="ml-2 text-white/60 transition-colors hover:text-white">
                    <Share className="size-5" weight="light" />
                  </button>
                </div>

                {/* Description */}
                {currentDescription && (
                  <p className="mt-5 text-sm leading-relaxed text-white/70">
                    {currentDescription}
                  </p>
                )}

                {/* Collapsible info section */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    showFullInfo ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {/* Divider */}
                  <div className="mt-6 border-t border-white/10" />

                  {/* Audio */}
                  <div className="flex items-baseline justify-between py-4">
                    <span className="text-sm font-bold text-white">{t('meta.audio')}</span>
                    <span className="text-sm text-white/60">Japanese</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Sous-titres */}
                  <div className="flex items-baseline justify-between py-4">
                    <span className="text-sm font-bold text-white">{t('meta.subtitles')}</span>
                    <span className="max-w-[60%] text-right text-sm text-white/60">
                      Français, English, Deutsch, Español (América Latina), Español (España), Italiano, Polski, Português (Brasil), Русский, العربية
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Avertissement lié au contenu */}
                  <div className="flex items-baseline justify-between py-4">
                    <span className="text-sm font-bold text-white">{t('meta.contentWarning')}</span>
                    <span className="max-w-[60%] text-right text-sm text-white/60">
                      {anime.ageRating && (
                        <span className="mr-2 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                          {anime.ageRating}
                        </span>
                      )}
                      {anime.genres.map((g) => g.name).join(', ')}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />
                </div>

                {/* Toggle VOIR PLUS / VOIR MOINS */}
                <button
                  type="button"
                  onClick={() => setShowFullInfo((prev) => !prev)}
                  className="mt-4 text-sm font-semibold text-[#e50914] transition-colors hover:text-[#ff3d47]"
                >
                  {showFullInfo ? t('meta.seeLess') : t('meta.seeMore')}
                </button>
              </div>
            </ScrollReveal>

            {/* ── YouTube-style Comments Section ── */}
            <div className="border-t border-white/10 pt-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{t('comments.title')}</h2>
                <span className="text-sm text-white/50">{t('comments.count', { count: 0 })}</span>
              </div>

              {/* ── Comment Input ── */}
              <div className="mb-8 flex gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback className="bg-white/10 text-xs text-white/70">U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('comments.addPlaceholder')}
                    className="w-full border-b border-white/20 bg-transparent pb-2 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/50"
                  />
                </div>
              </div>

              {/* ── Sort ── */}
              <div className="mb-6 flex items-center gap-2">
                <button type="button" className="flex items-center gap-1 text-sm font-semibold text-white">
                  {t('comments.sortBy')}
                  <CaretDown className="size-3" weight="light" />
                </button>
              </div>

              {/* ── Comments List ── */}
              <div className="space-y-5">
                <button
                  type="button"
                  className="w-full py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                >
                  {t('comments.loadMore')}
                </button>
              </div>
            </div>
          </div>

          {/* ═══ Right Column: Episode List (series only) ═══ */}
          {!isMovie && (
            <aside className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* ── Collapsed: Next + Prev + Button ── */}
                {!showEpisodeList && (
                  <>
                    {nextEpisode && (
                      <div>
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                          {t('episodes.nextEpisode')}
                        </h3>
                        <button
                          type="button"
                          onClick={() => selectEpisode(nextEpisode.episode.id)}
                          className="group flex w-full gap-3 text-left"
                        >
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-white/10">
                            <img
                              src={nextEpisode.episode.thumbnailUrl || anime.cover || '/placeholder.svg'}
                              alt={nextEpisode.episode.title}
                              className="size-full object-cover"
                            />
                            {nextEpisode.episode.duration > 0 && (
                              <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {formatDuration(nextEpisode.episode.duration)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <h4 className="text-sm font-semibold leading-snug text-white">
                              E{nextEpisode.episode.number} – {nextEpisode.episode.title}
                            </h4>
                            <p className="mt-1 text-xs text-white/50">{t('meta.subtitled')}</p>
                          </div>
                        </button>
                      </div>
                    )}
                    {prevEpisode && (
                      <div>
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                          {t('episodes.prevEpisode')}
                        </h3>
                        <button
                          type="button"
                          onClick={() => selectEpisode(prevEpisode.episode.id)}
                          className="group flex w-full gap-3 text-left"
                        >
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-white/10">
                            <img
                              src={prevEpisode.episode.thumbnailUrl || anime.cover || '/placeholder.svg'}
                              alt={prevEpisode.episode.title}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <h4 className="text-sm font-semibold leading-snug text-white">
                              E{prevEpisode.episode.number} – {prevEpisode.episode.title}
                            </h4>
                            <p className="mt-1 text-xs text-white/50">{t('meta.subtitled')}</p>
                          </div>
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowEpisodeList(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent py-2.5 text-xs font-bold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                    >
                      <List className="size-4" weight="light" />
                      {t('episodes.seeMoreEpisodes')}
                    </button>
                  </>
                )}

                {/* ── Expanded: Full Season/Episode List ── */}
                {showEpisodeList && (
                  <>
                    {episodesBySeason.map(([season, seasonEpisodes]) => {
                      const isOpen = openSeason === season
                      return (
                        <div key={season}>
                          <button
                            type="button"
                            onClick={() => setOpenSeason(isOpen ? null : season)}
                            className="flex w-full items-center justify-between py-2 text-left"
                          >
                            <span className="text-base font-bold text-white">
                              {t('episodes.season', { number: season })}
                            </span>
                            <CaretDown
                              className={`size-4 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                              weight="light"
                            />
                          </button>
                          {isOpen && (
                            <div className="space-y-1 pb-2">
                              {seasonEpisodes.map((item) => {
                                const isCurrent = item.episode.id === currentFlat?.episode.id
                                return (
                                  <button
                                    key={item.episode.id}
                                    type="button"
                                    onClick={() => selectEpisode(item.episode.id)}
                                    className={`group flex w-full gap-3 rounded-md p-1.5 text-left transition-colors ${
                                      isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-white/10">
                                      <img
                                        src={item.episode.thumbnailUrl || anime.cover || '/placeholder.svg'}
                                        alt={item.episode.title}
                                        className="size-full object-cover"
                                      />
                                      {item.episode.duration > 0 && (
                                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                          {formatDuration(item.episode.duration)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                      <h4 className={`text-sm font-semibold leading-snug ${isCurrent ? 'text-white' : 'text-white/80'}`}>
                                        E{item.episode.number} – {item.episode.title}
                                      </h4>
                                      <p className="mt-1 text-xs text-white/50">{t('meta.subtitled')}</p>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setShowEpisodeList(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent py-2.5 text-xs font-bold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                    >
                      {t('episodes.seeLess')}
                    </button>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
