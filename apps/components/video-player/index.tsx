'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import Hls from 'hls.js'
import { Cast, Check, Settings } from 'lucide-react'
import type { Episode } from '@/types/anime'
import { formatTime } from './format-time'

/**
 * Imperative API exposed by {@link VideoPlayer} so parents can play / pause
 * the underlying `<video>` from inside an explicit user-gesture handler.
 * Calling `play()` from a click event preserves the gesture chain even on
 * browsers that block the `autoPlay` attribute alone.
 */
export interface VideoPlayerHandle {
  /**
   * Programmatically start playback. Returns the promise from `video.play()`
   * so callers can `await` and surface a fallback UI if the browser refuses.
   */
  play: () => Promise<void>
  /** Pause playback (used to back out of the Netflix overlay quickly). */
  pause: () => void
  /**
   * Unmute the element. Must be called from a user-gesture handler when the
   * player was started muted (see `startMuted`) so the browser allows the
   * audio to come up — mirroring how Netflix reveals a muted preview.
   */
  unmute: () => void
}

interface VideoPlayerProps {
  episode: Episode
  /**
   * When true, the player asks the browser to start playback as soon as a
   * source is attached. This attribute alone isn't reliable (Chrome blocks
   * it without a traceable user gesture), so callers should also poke the
   * imperative `play()` returned via `ref` from inside a click handler. The
   * attribute is kept so that direct play / Safari HLS sessions succeed
   * instantly when the page loads.
   */
  autoPlay?: boolean
  /**
   * Optional callback fired whenever playback toggles between playing and
   * paused. Used by the watch page to surface a "Press Play" overlay while
   * `playing` is still false.
   */
  onPlayingChange?: (playing: boolean) => void
  /**
   * Optional callback fired when playback fails. Covers the three sources of
   * failure that hit users most on a Plex-driven HLS playback: the
   * `<video>` element itself fired a `MEDIA_ERR_*` event, hls.js reported a
   * non-recoverable fatal error, OR the browser rejected `play()` with a
   * `NotAllowedError` because the active gesture was too old.
   */
  onPlaybackError?: (message: string) => void
  /**
   * Optional callback fired once the player has a *playable* source attached:
   * `.m3u8` manifest parsed by hls.js (or its native equivalent on Safari),
   * OR `loadedmetadata` fired for direct-play `<source>` streams. Lets the
   * watch page auto-dismiss a stale error banner if hls.js recovered from a
   * transient NETWORK_ERROR via `startLoad()`.
   */
  onPlaybackReady?: () => void
  /**
   * Optional callback fired on every `<video>` `timeupdate` (approx 4x/s)
   * with the current playhead + duration in seconds. Lets the watch page
   * persist watch progress (throttled by the caller) so the discover
   * "Reprendre" rail can resume where the user stopped.
   */
  onTimeUpdate?: (currentTime: number, duration: number) => void
  /**
   * Seconds to seek to once the source is ready (resume from a saved
   * position). Applied once per source, after the manifest/metadata has
   * loaded. Defaults to 0 (start from the beginning).
   */
  startTime?: number
  /**
   * Hide the big centered Play button the component renders when paused.
   * Set this when the parent overlays its own play CTA (e.g. a Netflix-style
   * pre-play overlay) so we don't end up with two competing play buttons
   * stacked on top of each other. After playback starts, the parent flips
   * this back to false so the internal button can take over for pause/resume.
   */
  hideBuiltInPlayOverlay?: boolean
  /**
   * Start playback muted (Netflix-style preview). Muted autoplay is exempt
   * from browser gesture policies, so the stream genuinely starts behind the
   * parent's overlay — the user sees the video replace the poster instead of
   * a dead still. The parent reveals the audio by calling `unmute()` from its
   * click handler. Defaults to false (unmuted, current behaviour).
   */
  startMuted?: boolean
  /**
   * Keep the video frame fully black until the first frame actually plays —
   * no poster while the stream is warming up. Used by the watch page so the
   * player doesn't look like an "asset loading screen" before autoplay kicks
   * in (the page shows the real artwork anyway).
   */
  hidePosterUntilPlay?: boolean
}

/** Playback speed presets offered by the settings menu (Netflix-style). */
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * The media-server stream URL (Jellyfin HLS master playlist, or the legacy
 * Plex universal transcode endpoint) can resolve to an HLS manifest
 * (`.m3u8`) when the server transcodes. Chrome/Edge/Firefox cannot play HLS
 * natively, so we attach hls.js for those browsers and fall back to the
 * native <video> playback everywhere else (Safari supports HLS natively,
 * and plain mp4 streams play without any shim).
 */
function isHlsUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return lower.includes('.m3u8') || lower.includes('/proxy/manifest')
}

/**
 * Translates a `<video>.error.code` into a human readable string the watch
 * page can show in its error banner. Media-server transcode endpoints
 * usually hit MEDIA_ERR_NETWORK behind CORS or auth issues;
 * MEDIA_ERR_DECODE when the manifest variant list and the requested codec
 * don't agree.
 */
function describeMediaError(code: number): string {
  switch (code) {
    case 1:
      return 'Lecture interrompue par le lecteur.'
    case 2:
      return 'Impossible de joindre le flux (réseau ou CORS).'
    case 3:
      return 'Le flux est corrompu (décodage impossible).'
    case 4:
      return 'Source vidéo introuvable ou non supportée.'
    default:
      return 'Erreur de lecture inconnue.'
  }
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  {
    episode,
    autoPlay = false,
    onPlayingChange,
    onPlaybackError,
    onPlaybackReady,
    hideBuiltInPlayOverlay = false,
    startMuted = false,
    hidePosterUntilPlay = false,
    onTimeUpdate,
    startTime = 0,
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  // Set to true the first time a persistent MEDIA_ERROR forces a full stream
  // restart (destroy + re-attach) — only ONE automatic restart per source is
  // allowed, so a genuinely undecodable stream surfaces an error banner
  // instead of remounting the player in a loop.
  const restartedRef = useRef(false)

  // ── HLS resilience budget ─────────────────────────────────────────────────
  // A media-server (Jellyfin) transcode session is not ready the instant the
  // player mounts: the first manifest / segment requests routinely fail while
  // ffmpeg spins up, and hls.js's stock retry counts (1 for the manifest, 2
  // for fragments) are exhausted in a couple of seconds. Instead of raising a
  // blocking "Lecture impossible" banner on the very first hiccup, we retry
  // silently with backoff and only surface onPlaybackError once the stream
  // has burned through the whole budget (≈ several seconds of genuine outage).
  const fatalRetryCount = useRef(0)
  const MAX_FATAL_RETRIES = 4

  /**
   * Becomes `false` synchronously on unmount. Any deferred callback that
   * resolves after this point — `video.play()` rejection, hls.js ERROR
   * events flushed during `destroy()`, `<video>` error events fired by the
   * browser as the element is removed from the DOM — must NOT bubble up via
   * `onPlaybackError`. Otherwise, a Retry click / episode switch / HMR
   * page reload manifests as a fake 'lecture impossible' banner to the user.
   */
  const mountedRef = useRef(true)

  const [playing, setPlaying] = useState(false)
  // Initialised from `startMuted` so a muted preview starts with the correct
  // icon/slider state without a second render.
  const [muted, setMuted] = useState(startMuted)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekPreview, setSeekPreview] = useState<number | null>(null)
  // Buffering flag — Netflix shows a small spinner while the stream stalls.
  const [isBuffering, setIsBuffering] = useState(false)
  // Settings (playback speed) menu state.
  const [showSettings, setShowSettings] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  // True once the first frame has played — used by `hidePosterUntilPlay` to
  // release the poster after the stream is genuinely live.
  const [hasPlayed, setHasPlayed] = useState(false)

  // ── Resume / progress plumbing ───────────────────────────────────────────
  // Keep the latest callback in a ref so `handleTimeUpdate` (stable across
  // renders) always invokes the current parent handler without rebinding.
  const onTimeUpdateRef = useRef(onTimeUpdate)
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
  }, [onTimeUpdate])
  // `startTime` is applied exactly once per source — reset the latch whenever
  // the stream URL changes so an episode switch seeks to its own resume point.
  const startTimeRef = useRef(startTime)
  useEffect(() => {
    startTimeRef.current = startTime
  }, [startTime])
  const startAppliedRef = useRef(false)
  useEffect(() => {
    startAppliedRef.current = false
  }, [episode.videoUrl])

  const applyStartTime = useCallback(() => {
    const videoEl = videoRef.current
    const target = startTimeRef.current
    if (!videoEl || !target || target <= 0 || startAppliedRef.current) return
    startAppliedRef.current = true
    try {
      videoEl.currentTime = target
    } catch {
      /* ignore — the seek is a best-effort resume */
    }
  }, [])

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setShowControls(true)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  useEffect(() => {
    // One-shot reaction to `playing` toggles — start the auto-hide there.
    resetHideTimer()
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [playing, resetHideTimer])

  // Closing the settings menu whenever the control bar hides keeps the
  // overlay clean (Netflix dismisses every menu with the controls).
  useEffect(() => {
    if (!showControls) setShowSettings(false)
  }, [showControls])

  // Sync fullscreen state
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  // Flip the mounted flag synchronously in the cleanup so late-arriving
  // <video> errors, hls.js destroy() errors and AbortError rejections from
  // `play()` don't reach the parent's banner.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Muted-preview mode: enforce muted on the live element. Declared before
  // the hls.js attach effect so the browser already considers the element
  // muted by the time MANIFEST_PARSED fires `play()` — that is what makes
  // autoplay legal without a user gesture.
  useEffect(() => {
    const v = videoRef.current
    if (v && startMuted) {
      v.muted = true
    }
  }, [startMuted])

  // Reset the poster latch whenever the source changes so an episode switch
  // also starts on a black frame while the next stream warms up.
  useEffect(() => {
    setHasPlayed(false)
  }, [episode.videoUrl])

  // Toggle helpers — pure side-effects on the current `<video>` ref. Defined
  // before the keyboard listener so its closure can reference them. The
  // dependency arrays are intentionally empty so identity is stable across
  // renders and the listener below only re-binds when `resetHideTimer`
  // updates (i.e. when `playing` flips).
  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await el.requestFullscreen()
    }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  // Keyboard shortcuts. Always read `videoRef.current` inside the handler
  // so we NEVER capture a stale snapshot across renders. Previous code used
  // a top-level `const video = videoRef.current` and put it in this effect's
  // deps — that made the deps array switch from `[null, fn]` to `[el, fn]`,
  // tripping the React warning "The final argument passed to useEffect
  // changed size between renders" every time the <video> ref attached.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const videoEl = videoRef.current
      if (!videoEl) return
      // Don't hijack typing in inputs / textareas (the user might be in
      // the comment field on the same page).
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          videoEl.paused ? videoEl.play() : videoEl.pause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          videoEl.currentTime = Math.max(0, videoEl.currentTime - 10)
          break
        case 'ArrowRight':
          e.preventDefault()
          videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          videoEl.volume = Math.min(1, videoEl.volume + 0.1)
          videoEl.muted = false
          break
        case 'ArrowDown':
          e.preventDefault()
          videoEl.volume = Math.max(0, videoEl.volume - 0.1)
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
      }
      resetHideTimer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleFullscreen, toggleMute, resetHideTimer])

  // Attach hls.js when the resolved stream is an HLS manifest and the browser
  // cannot play it natively (everything except Safari). The instance is torn
  // down on unmount or when the source changes, so episode switches always
  // attach a fresh player to the same <video> element.
  useEffect(() => {
    const videoEl = videoRef.current
    const url = episode.videoUrl
    if (!videoEl || !url) return

    console.log('[VideoPlayer] Mounting | url:', url, '| HLS supported:', Hls.isSupported(), '| native:', isHlsUrl(url) ? 'hls.js' : 'native')

    if (isHlsUrl(url) && Hls.isSupported()) {
      console.log('[VideoPlayer] Initializing hls.js for:', url)
      // Only ONE full stream restart per source is allowed after repeated
      // media errors; beyond that it is a real decode failure that must be
      // surfaced instead of looping recoverMediaError() forever (which only
      // re-detaches the MediaSource and re-triggers the NotSupportedError /
      // bufferAppendingError storm seen in the field).
      restartedRef.current = false

      const makeHls = () => {
        const hls = new Hls({
          enableWorker: true,
          manifestLoadingMaxRetry: 5,
          manifestLoadingRetryDelay: 1000,
          manifestLoadingMaxRetryTimeout: 30000,
          levelLoadingMaxRetry: 5,
          levelLoadingRetryDelay: 1000,
          // hls.js defaults to an 8s level timeout — too tight for a cold
          // media-server transcode, which can take 10-30s to probe a remote
          // (bridged Plex .strm) source before answering the first variant
          // request. Without a longer budget the player burns its whole retry
          // allowance on the cold session and surfaces a fake 'Lecture
          // impossible' banner.
          levelLoadingTimeOut: 30000,
          fragLoadingMaxRetry: 8,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetryTimeout: 60000,
          fragLoadingTimeOut: 45000,
          maxBufferLength: 30,
          // hls.js 1.6 defaults to a 0.1s hole tolerance — too tight for a
          // transcoded remux, where audio/video PTS alignment routinely leaves
          // sub-second gaps between appended fragments. With the default, the
          // gap-controller reports a stall (and, previously, the player tore
          // down the MediaSource) instead of quietly jumping the micro-hole.
          // 2s lets playback flow over those gaps without ever stalling.
          maxBufferHole: 2,
        })
        fatalRetryCount.current = 0
        hls.loadSource(url)
        hls.attachMedia(videoEl)
        hlsRef.current = hls
        // Consecutive MEDIA_ERRORs on THIS instance. A single append hiccup
        // is transient; a persistent one means the browser's MSE rejects the
        // data (codec mismatch) and recovery must escalate, not loop.
        let mediaErrors = 0

        hls.on(Hls.Events.MANIFEST_PARSED, (_ev, data) => {
          console.log('[VideoPlayer] MANIFEST_PARSED | levels:', data.levels?.length, '| duration:', hls.media?.duration)
          fatalRetryCount.current = 0
          setDuration(hls.media?.duration ?? 0)
          // Strong signal the stream URL is valid and hls.js has the manifest
          // parsed. Lets the parent dismiss any stale playback banner — useful
          // when the prior attempt 404'd but `startLoad()` quietly recovered.
          if (mountedRef.current) onPlaybackReady?.()
          // Resume the saved position now that the manifest is parsed.
          applyStartTime()
          // Kick off playback as soon as the manifest is parsed. The `autoPlay`
          // attribute on the <video> element can't trigger this on its own
          // because hls.js owns the source — the manifest is never pointed at
          // by <video>.src, so the browser has no signal to call play().
          if (autoPlay) {
            console.log('[VideoPlayer] Calling video.play()...')
            const attemptPlay = (canRetry: boolean) => {
              videoEl.play().catch((e: unknown) => {
                // React StrictMode's double-mount aborts the first play() with
                // an AbortError ("interrupted by a call to pause()"). Retry
                // once, after the remount settles, so the muted autoplay still
                // takes hold instead of silently never starting.
                const err = e as DOMException | undefined
                if (
                  canRetry &&
                  err?.name === 'AbortError' &&
                  mountedRef.current &&
                  hlsRef.current === hls
                ) {
                  setTimeout(() => attemptPlay(false), 500)
                  return
                }
                console.warn('[VideoPlayer] play() rejected:', err?.name, err?.message)
              })
            }
            attemptPlay(true)
          }
        })
        hls.on(Hls.Events.BUFFER_CREATED, (_ev, bufferData) => {
          // Diagnostic: the exact SourceBuffer types hls.js created. If the
          // codec declared here does not match the segment data, the browser
          // rejects every append (bufferAppendingError). Expect something
          // like `video:video/mp4;codecs=avc1.640028 | audio:audio/mp4;
          // codecs=mp4a.40.2` for the h264/aac transcode this proxy forces.
          const desc = (
            Object.entries(bufferData.tracks) as [
              string,
              { container?: string; codec?: string; levelCodec?: string }
            ][]
          )
            .map(
              ([name, t]) =>
                `${name}:${t.container};codecs=${t.codec}` +
                (t.levelCodec ? `(level:${t.levelCodec})` : '')
            )
            .join(' | ')
          console.log('[VideoPlayer] BUFFER_CREATED |', desc)
        })
        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('[VideoPlayer] hls.js ERROR | type:', data.type, '| fatal:', data.fatal, '| details:', data.details, '| response:', data.response?.code)
          if (!mountedRef.current) return
          // hls.js's gap-controller handles buffer stalls / holes on its own by
          // nudging the playhead (BUFFER_STALLED_ERROR, BUFFER_SEEK_OVER_HOLE,
          // BUFFER_NUDGE_ON_STALL). These arrive with `fatal: false` and hls.js
          // itself registers them as "do nothing". Escalating here would call
          // recoverMediaError(), which detaches and re-attaches the whole
          // MediaSource and flushes the buffer — the video freezes, restarts,
          // re-buffers and stutters (the exact "not smooth like Netflix"
          // symptom). Only FATAL media errors need our recovery ladder below.
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !data.fatal) {
            return
          }
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Manifest or segment unreachable. Most often transient — the
              // transcode session was still warming up — so reload the stream
              // silently with a short backoff. Only after the whole budget is
              // spent (genuine outage: media-server down, CORS misconfig, …) do
              // we bubble the failure up to the parent's error banner.
              if (fatalRetryCount.current < MAX_FATAL_RETRIES) {
                fatalRetryCount.current++
                const attempt = fatalRetryCount.current
                console.log('[VideoPlayer] NETWORK_ERROR retry', attempt, '/', MAX_FATAL_RETRIES)
                setTimeout(() => {
                  // Only restart if this is still the live session — the
                  // effect cleanup tears hls down on episode switches / unmount
                  // and must not be re-awakened by a stale timer.
                  if (mountedRef.current && hlsRef.current === hls) {
                    hls.startLoad()
                  }
                }, 1000 * attempt)
                return
              }
              onPlaybackError?.(
                "Le serveur vidéo est injoignable (CORS ou réseau)."
              )
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              // A single append/codec hiccup is transient — hls.js can skip
              // the bad fragment. But when the SAME append keeps failing (the
              // browser MSE rejects the data), recoverMediaError() only
              // detaches/re-attaches the MediaSource in a loop and re-triggers
              // NotSupportedError. Recover twice, restart the whole stream
              // once (a fresh session behind the same proxy URL), then surface
              // a real error message instead of spinning forever.
              mediaErrors += 1
              if (mediaErrors <= 2) {
                hls.recoverMediaError()
              } else if (mediaErrors <= 4 && !restartedRef.current) {
                restartedRef.current = true
                console.log('[VideoPlayer] MEDIA_ERROR persistent — restarting stream once')
                const doomed = hlsRef.current
                hlsRef.current = null
                try {
                  doomed?.destroy()
                } catch {
                  /* ignore */
                }
                setTimeout(() => {
                  // Only re-attach if the component is still mounted and no
                  // newer instance (episode switch / unmount) took over.
                  if (mountedRef.current && hlsRef.current === null) {
                    makeHls()
                  }
                }, 400)
              } else {
                onPlaybackError?.(
                  "Erreur de lecture : le flux renvoyé par le serveur est illisible (erreur de décodage audio ou vidéo)."
                )
              }
              break
            default:
              hls.destroy()
              hlsRef.current = null
              onPlaybackError?.(
                "Le flux n'a pas pu être lu (erreur codec ou playlist invalide)."
              )
              break
          }
        })
        return hls
      }

      const hls = makeHls()
      return () => {
        // Pause first so any in-flight `play()` Promise settles cleanly
        // (with an AbortError, which is filtered above) before we tear
        // hls.js down. Without this, hls.destroy() can race with the
        // browser's play() promise resolution and surface a spurious
        // MEDIA_ERR_* event during unmount.
        try {
          videoEl.pause()
        } catch {
          /* ignore */
        }
        hls.destroy()
        hlsRef.current = null
      }
    }

    // Non-HLS (mp4 / direct play) or native HLS (Safari): let the browser
    // drive playback through the <source> element below.
    return () => {
      hlsRef.current = null
    }
  }, [episode.videoUrl])

  // Auto-start playback once the source is attached. The `autoPlay`
  // attribute on the <video> element handles native (mp4 / Safari HLS)
  // playback; for hls.js driven sessions the manifest event above is
  // where we kick things off. This second useEffect covers the non-hls
  // path on mount / source change. A `NotAllowedError` here means the
  // user-gesture window closed before we got here — surface it so the
  // watch page can show a "Press Play" overlay instead of failing silently.
  //
  // `AbortError` is intentionally swallowed: it always fires when the
  // component unmounted (Retry click, episode switch, HMR) while `play()`
  // was still pending. It is NOT a real playback failure and the user
  // shouldn't see a banner because of it.
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl || !autoPlay || !episode.videoUrl) return
    videoEl.play().catch((err: unknown) => {
      if (!mountedRef.current) return
      if (err instanceof DOMException) {
        if (err.name === 'AbortError') return
        if (err.name === 'NotAllowedError') {
          onPlaybackError?.('Lecture automatique bloquée par le navigateur.')
          return
        }
      }
      // Anything else is a transient stream error — the existing banner
      // path already covers STREAM_UNAVAILABLE from the API call.
    })
  }, [episode.videoUrl, autoPlay])

  // Video event handlers
  // Bubble playback state up so parents (e.g. the watch page's Netflix
  // overlay) know when to fade out. effect is intentional so onPlayingChange
  // gets the latest setter without rebuilding the effect on every render.
  useEffect(() => {
    onPlayingChange?.(playing)
  }, [playing, onPlayingChange])

  // Imperative handle — caller can call `play()` from a click handler so the
  // user-gesture chain reaches the <video>. hls.js sessions in particular
  // ignore the `autoPlay` attribute because the manifest pointer never
  // lands on the <video> element's src.
  //
  // We swallow `AbortError` here too — the user clicked Play, but a re-render
  // (e.g. next-episode link navigation, HMR) detached the element before
  // `play()` resolved. That's not a playback failure, so the parent overlay
  // must keep listening rather than switching to the error banner.
  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        const videoEl = videoRef.current
        if (!videoEl) return Promise.reject(new Error('VideoPlayer not mounted'))
        return videoEl.play().catch((err: unknown) => {
          if (!mountedRef.current) return
          if (err instanceof DOMException) {
            if (err.name === 'AbortError') return
            if (err.name === 'NotAllowedError') {
              // Surface a real reason to the parent overlay so the "Press Play"
              // path can either retry or fall back to a clearer message.
              onPlaybackError?.('Le navigateur exige un clic pour démarrer la lecture.')
            }
          }
          throw err
        })
      },
      pause: () => {
        videoRef.current?.pause()
      },
      unmute: () => {
        const videoEl = videoRef.current
        if (!videoEl) return
        videoEl.muted = false
        setMuted(false)
      },
    }),
    [onPlaybackError]
  )

  // Wrapped in useCallback with stable identities so passing them as
  // <video> props doesn't unbind/rebind the DOM listeners on every render.
  // All of them read `videoRef.current` inline — never a captured snapshot
  // — so they always hit the live element after an HMR/episode switch.
  const handleTimeUpdate = useCallback(() => {
    const videoEl = videoRef.current
    if (videoEl && !isSeeking) {
      setCurrentTime(videoEl.currentTime)
      onTimeUpdateRef.current?.(videoEl.currentTime, videoEl.duration || 0)
    }
  }, [isSeeking])

  const handleProgress = useCallback(() => {
    const videoEl = videoRef.current
    if (videoEl && videoEl.buffered.length > 0) {
      setBuffered(videoEl.buffered.end(videoEl.buffered.length - 1))
    }
  }, [])

  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current
    if (!videoEl) return
    videoEl.paused ? videoEl.play() : videoEl.pause()
  }, [])

  const applyVolume = useCallback((val: number) => {
    const videoEl = videoRef.current
    if (!videoEl) return
    const clamped = Math.max(0, Math.min(1, val))
    videoEl.volume = clamped
    videoEl.muted = clamped === 0
    setVolume(clamped)
    setMuted(clamped === 0)
  }, [])

  // Vertical (Netflix-style) volume control: the bar grows upward from the
  // volume icon and is dragged like the progress bar.
  const handleVolumeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      const bar = e.currentTarget
      const update = (clientY: number) => {
        const rect = bar.getBoundingClientRect()
        const pct = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        applyVolume(pct)
      }
      update(e.clientY)
      const onMove = (ev: MouseEvent) => update(ev.clientY)
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [applyVolume]
  )

  const seekBack = useCallback(() => {
    const videoEl = videoRef.current
    if (videoEl) videoEl.currentTime = Math.max(0, videoEl.currentTime - 10)
  }, [])

  const seekForward = useCallback(() => {
    const videoEl = videoRef.current
    if (videoEl) videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 10)
  }, [])

  // Progress bar seeking
  const seekFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const videoEl = videoRef.current
      const bar = (e.target as HTMLElement).closest('[data-progress-bar]') as HTMLElement | null
      if (!bar || !videoEl || !duration) return
      const rect = bar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      videoEl.currentTime = pct * duration
      setCurrentTime(pct * duration)
    },
    [duration]
  )

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return
      setIsSeeking(true)
      seekFromEvent(e)

      const onMove = seekFromEvent
      const onUp = () => {
        setIsSeeking(false)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [duration, seekFromEvent]
  )

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      setSeekPreview(pct)
    },
    [duration]
  )

  const applyPlaybackRate = useCallback((rate: number) => {
    const videoEl = videoRef.current
    if (videoEl) videoEl.playbackRate = rate
    setPlaybackRate(rate)
    setShowSettings(false)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0
  const previewPct = seekPreview !== null ? seekPreview * 100 : 0
  const previewTime =
    seekPreview !== null && duration > 0 ? seekPreview * duration : 0

  // hls.js takes over the stream on HLS manifests for non-Safari browsers;
  // in that case the <source> child must not be rendered (it would make the
  // browser try to load the .m3u8 itself and fight with hls.js for the
  // element's src). Safari and mp4/direct streams keep the native <source>.
  const hlsDrivesPlayback =
    isHlsUrl(episode.videoUrl) && Hls.isSupported()

  const VolumeIcon = muted || volume === 0 ? (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : volume < 0.5 ? (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ) : (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )

  const controlsVisible = showControls || !playing

  return (
    <div
      ref={containerRef}
      className={`group/player relative w-full bg-black select-none ${
        controlsVisible ? '' : 'cursor-none'
      }`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (playing) setShowControls(false)
      }}
      // Netflix-style: double-click toggles fullscreen.
      onDoubleClick={toggleFullscreen}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        // In-page: wide cinematic 24:9 frame, the video fills the full width
        // and is cropped top/bottom (object-cover) so there are no pillarbox
        // bars. In fullscreen: drop the aspect frame and let the video fill
        // the ENTIRE screen edge-to-edge, same treatment as in-page — the
        // video is always full-bleed, never letterboxed on any monitor ratio.
        className={`w-full bg-black object-cover ${
          isFullscreen ? 'h-full' : 'aspect-24/9'
        }`}
        // Prefer the landscape backdrop over the portrait poster so the
        // pre-play frame isn't the item's portrait artwork. With
        // `hidePosterUntilPlay`, the poster is suppressed until the first
        // frame actually plays so the warm-up stays a clean black frame.
        poster={
          !hidePosterUntilPlay || hasPlayed
            ? episode.cover || episode.thumbnail
            : undefined
        }
        preload="metadata"
        playsInline
        // The `autoPlay` attribute kicks off native playback on mount
        // (mp4 / Safari HLS). hls.js sessions rely on the useEffect above
        // after MANIFEST_PARSED since the <video> src never points at the
        // .m3u8 itself in that path — keeping the native attribute there makes
        // the browser issue a SECOND, redundant play() on the src-less
        // element, which the effect cleanup's pause() then interrupts,
        // surfacing an unhandled "AbortError: The play() request was
        // interrupted by a call to pause()". So the attribute is only set
        // when the browser drives playback natively (Safari HLS / direct mp4).
        autoPlay={autoPlay && !hlsDrivesPlayback}
        // Bound to the component state (not `startMuted`) so toggleMute /
        // unmute() stay in control. A muted element makes autoplay legal
        // without a user gesture — the muted preview relies on this.
        muted={muted}
        // crossOrigin is only required when reading captions/canvas; leaving it
        // unset lets browsers play cross-origin streams (e.g. Plex direct play)
        // without requiring the media server to send CORS headers.
        crossOrigin={episode.tracks.length > 0 ? 'anonymous' : undefined}
        onPlay={() => {
          setPlaying(true)
          setIsBuffering(false)
          setHasPlayed(true)
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          // Native MP4 / Safari HLS path: the <source> child loaded its
          // metadata successfully — mirror hls.js's MANIFEST_PARSED signal
          // here so the parent can dismiss any stale error banner.
          applyStartTime()
          if (mountedRef.current) onPlaybackReady?.()
        }}
        onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => {
          setIsBuffering(false)
          // `canplay` fires when the browser has enough buffered data to
          // start playback. Mirror MANIFEST_PARSED for non-hls.js sessions
          // (Safari / direct mp4). The hls.js path is already covered by
          // MANIFEST_PARSED so we skip it here to avoid duplicates.
          if (mountedRef.current && !isHlsUrl(episode.videoUrl))
            onPlaybackReady?.()
        }}
        onProgress={handleProgress}
        onClick={togglePlay}
        onError={(e) => {
          if (!mountedRef.current) return
          const target = e.currentTarget as HTMLVideoElement
          const code = target.error?.code ?? 0
          console.error('[VideoPlayer] <video> error | code:', code, '| message:', target.error?.message)
          if (code === 1) return
          // When hls.js owns the stream, MEDIA_ERR_NETWORK usually tags along
          // with a transient fragment hiccup that hls.js retries on its own
          // (see the silent startLoad() budget above). Don't stack a second
          // blocking banner on top of that recovery path.
          if (hlsDrivesPlayback && code === 2) return
          onPlaybackError?.(describeMediaError(code))
        }}
      >
        {episode.videoUrl && !hlsDrivesPlayback && (
          <source src={episode.videoUrl} type={episode.videoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} />
        )}
        {episode.tracks.map((track) => (
          <track
            key={track.src}
            src={track.src}
            kind="subtitles"
            srcLang={track.lang}
            label={track.label}
            default={track.default}
          />
        ))}
      </video>

      {/* Buffering spinner — small, centered, non-interactive (Netflix-style). */}
      {isBuffering && playing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="size-12 rounded-full border-2 border-white/20 border-t-white/90 animate-spin" />
        </div>
      )}

      {/* Big play button when paused — hidden while a parent overlay covers
          the player (e.g. the watch page's Netflix-style CTA) so we don't
          stack two competing play buttons. After playback starts, the parent
          flips `hideBuiltInPlayOverlay` back to false and this button
          reasserts itself for pause/resume. */}
      {!playing && !hideBuiltInPlayOverlay && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 transition-opacity duration-300"
          aria-label="Lire"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl transition-transform duration-300 hover:scale-110">
            <svg className="size-7 ml-1 fill-current" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        </button>
      )}

      {/* Controls overlay — Netflix-style bottom panel with the episode info
          block, the control row and the progress bar at the very bottom edge. */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/60 pointer-events-none" />

        {/* Top spacer — keeps the bottom panel anchored to the bottom edge. */}
        <div className="relative z-10" />

        <div className="relative z-10 px-3 pb-2 pt-16 md:px-5 md:pb-3">
          {/* ── Control row ── */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Play, skip, volume */}
            <div className="flex items-center gap-1">
              {/* Play / Pause */}
              <button type="button" onClick={togglePlay} className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label={playing ? 'Pause' : 'Lire'}>
                {playing ? (
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="size-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              {/* Skip back 10s */}
              <button type="button" onClick={seekBack} className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label="Reculer 10 secondes">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>

              {/* Skip forward 10s */}
              <button type="button" onClick={seekForward} className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label="Avancer 10 secondes">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>

              {/* Volume — Netflix-style vertical bar that grows upward */}
              <div className="group/vol relative flex items-center">
                <button type="button" onClick={toggleMute} className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label={muted ? 'Activer le son' : 'Couper le son'}>
                  {VolumeIcon}
                </button>
                <div
                  data-volume-bar
                  role="slider"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
                  onMouseDown={handleVolumeMouseDown}
                  className="pointer-events-none absolute bottom-full left-1/2 mb-2 h-24 w-8 -translate-x-1/2 cursor-pointer opacity-0 transition-opacity duration-200 group-hover/vol:pointer-events-auto group-hover/vol:opacity-100"
                >
                  {/* Track */}
                  <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-white/30" />
                  {/* Fill (from the bottom up) */}
                  <div
                    className="absolute bottom-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-white"
                    style={{ height: `${(muted ? 0 : volume) * 100}%` }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-md"
                    style={{ bottom: `${(muted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Time, CC, settings, fullscreen */}
            <div className="flex items-center gap-1">
              {/* Time */}
              <span className="mr-1 hidden text-xs tabular-nums text-white/70 sm:inline">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Subtitles */}
              {episode.tracks.length > 0 && (
                <button type="button" className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label="Sous-titres">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <path d="M7 12h2" />
                    <path d="M11 12h4" />
                    <path d="M7 16h10" />
                  </svg>
                </button>
              )}

              {/* Cast */}
              <button type="button" className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label="Caster">
                <Cast className="size-5" />
              </button>

              {/* Settings — playback speed */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettings((v) => !v)}
                  className={`p-1.5 text-white/90 hover:text-white transition-colors rounded ${
                    playbackRate !== 1 ? 'text-white' : ''
                  }`}
                  aria-label="Réglages"
                >
                  <Settings className="size-5" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 z-40 mb-2 w-40 overflow-hidden rounded-md border border-white/10 bg-[#141414]/95 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                      Vitesse
                    </p>
                    <div className="pb-1">
                      {PLAYBACK_RATES.map((rate) => {
                        const active = playbackRate === rate
                        return (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => applyPlaybackRate(rate)}
                            className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold transition-colors ${
                              active
                                ? 'text-[#e50914]'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span>{rate}×</span>
                            {active && <Check className="size-3.5" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button type="button" onClick={toggleFullscreen} className="p-1.5 text-white/90 hover:text-white transition-colors rounded" aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
                {isFullscreen ? (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                  </svg>
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── Progress bar (bottom edge) ── */}
          <div
            data-progress-bar
            className="group/bar relative mt-2 h-1 w-full cursor-pointer rounded-full bg-white/20 transition-all duration-200 hover:h-1.5 md:mt-3"
            onMouseDown={handleProgressMouseDown}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setSeekPreview(null)}
          >
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/25"
              style={{ width: `${bufferedPct}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#e50914] transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
            {/* Seek preview segment (red, from played to hovered) */}
            {seekPreview !== null && previewPct > progress && (
              <div
                className="absolute inset-y-0 rounded-full bg-[#e50914]/60"
                style={{ left: `${progress}%`, width: `${previewPct - progress}%` }}
              />
            )}
            {/* Scrubber dot */}
            <div
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e50914] opacity-0 transition-opacity duration-200 group-hover/bar:opacity-100"
              style={{ left: `${progress}%` }}
            />
            {/* Time tooltip while scrubbing */}
            {seekPreview !== null && (
              <div
                className="pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-md"
                style={{ left: `${previewPct}%` }}
              >
                {formatTime(previewTime)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default VideoPlayer
