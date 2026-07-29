'use client'

import * as React from 'react'
import { use, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import {
  Eye,
  Zap,
  Radio,
  Play,
  Info,
  Tv,
  Film,
  CalendarClock,
  Trophy,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getLiveStreams,
  getUpcomingEvents,
  getReplays,
  getTrendingLive,
  getFeaturedLive,
  getLiveChannels,
  getRadios,
  getContinueWatching,
  getRecommendedLive,
  getTopStreams,
  LIVE_CATEGORIES,
} from '@/lib/mock-live'
import { LiveCard } from '@/components/live/live-card'
import { UpcomingCard } from '@/components/live/upcoming-card'
import { ChannelCard } from '@/components/live/channel-card'
import { CategoryCard } from '@/components/live/category-card'
import { ReplayCard } from '@/components/live/replay-card'
import { RadioCard } from '@/components/live/radio-card'

interface LivePageProps {
  params: Promise<{ locale: string }>
}

const SLIDE_DURATION = 8000

export default function LivePage({ params }: LivePageProps) {
  const { locale } = use(params)
  const t = useTranslations('Live')

  const allStreams = useMemo(() => getLiveStreams(), [])
  const featured = useMemo(() => getFeaturedLive(), [])
  const channels = useMemo(() => getLiveChannels(), [])
  const radios = useMemo(() => getRadios(), [])
  const trending = useMemo(() => getTrendingLive(), [])
  const upcoming = useMemo(() => getUpcomingEvents(), [])
  const replays = useMemo(() => getReplays(), [])
  const recommended = useMemo(() => getRecommendedLive(), [])
  const topStreams = useMemo(() => getTopStreams(), [])

  const heroStreams = useMemo(() => trending.slice(0, 5), [trending])
  const [heroIndex, setHeroIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const heroItem = heroStreams[heroIndex] ?? featured?.stream

  React.useEffect(() => {
    if (heroIndex >= heroStreams.length) setHeroIndex(0)
  }, [heroIndex, heroStreams.length])

  React.useEffect(() => {
    if (heroStreams.length < 2 || isPaused) return
    const timer = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroStreams.length)
    }, SLIDE_DURATION)
    return () => window.clearInterval(timer)
  }, [isPaused, heroStreams.length])

  return (
    <main className="relative min-h-screen select-none bg-background pb-24">
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      {heroItem && (
        <section
          className="relative isolate mx-1 mt-2 h-[82.5vh] min-h-110 max-h-[88vh] overflow-hidden rounded-xl bg-[#1a1a1a] md:mx-2 md:mt-3 lg:mx-4 xl:mx-8"
          aria-roledescription="carousel"
          aria-label="Lives à la une"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          {heroStreams.map((stream, index) => (
            <div
              key={stream.id}
              aria-hidden={index !== heroIndex}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none',
                index === heroIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <Image
                src={stream.thumbnailUrl || '/placeholder.jpg'}
                alt={stream.title}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : undefined}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#141414] via-[#141414]/60 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-16 pt-20 sm:px-8 lg:px-12 xl:px-16">
            <div
              key={heroItem.id}
              className="max-w-3xl animate-[hero-copy-in_450ms_ease-out] motion-reduce:animate-none"
            >
              {/* Channel + Live badge row */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/20 sm:size-12">
                  <img
                    src={heroItem.channel.avatarUrl}
                    alt={heroItem.channel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-white"
                    style={{ fontSize: 'clamp(0.875rem, 1vw + 0.5rem, 1.125rem)' }}
                  >
                    {heroItem.channel.name}
                  </span>
                  {heroItem.channel.isVerified && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
                      ✓
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {t('heroLive')}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1
                className="font-display font-black leading-[0.9] tracking-[-0.03em] text-white"
                style={{ fontSize: 'clamp(2.5rem, 5vw + 1rem, 7.5rem)' }}
              >
                {heroItem.title}
              </h1>

              {/* Meta */}
              <div
                className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-medium text-white/80"
                style={{ fontSize: 'clamp(0.8rem, 1vw + 0.4rem, 1rem)' }}
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-red-400" />
                  {heroItem.viewerCount?.toLocaleString('fr-FR')} {t('viewers')}
                </span>
                <span aria-hidden="true" className="text-white/30">•</span>
                <span className="text-white/60">
                  Pic {heroItem.peakViewerCount?.toLocaleString('fr-FR')}
                </span>
                <span aria-hidden="true" className="text-white/30">•</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/90">
                  {heroItem.category}
                </span>
                {heroItem.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/60 ring-1 ring-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p
                className="mt-4 max-w-xl leading-relaxed text-white/60 line-clamp-2"
                style={{ fontSize: 'clamp(0.875rem, 1.2vw + 0.4rem, 1.125rem)' }}
              >
                {heroItem.description}
              </p>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <Button
                  asChild
                  className="h-11 rounded-sm bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Link href={`/${locale}/live/${heroItem.slug}`}>
                    <Play className="size-5 fill-current" aria-hidden="true" />
                    Regarder
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-sm border-white/40 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Link href={`/${locale}/live/${heroItem.slug}`}>
                    <Info className="size-5" aria-hidden="true" />
                    Plus d&apos;infos
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes hero-copy-in {
              from { opacity: 0; transform: translateY(1rem); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </section>
      )}

      {/* ── Channels ─────────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Tv className="h-5 w-5 text-green-500" />
            Chaînes
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {channels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} locale={locale} />
          ))}
        </div>
      </section>

      {/* ── Live Now ─────────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Zap className="h-5 w-5 text-red-500" />
            {t('liveNow')}
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {allStreams.map((stream) => (
            <div key={stream.id} className="min-w-75 max-w-85 shrink-0">
              <LiveCard stream={stream} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Upcoming ─────────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <CalendarClock className="h-5 w-5 text-blue-500" />
            {t('upcoming')}
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {upcoming.map((event) => (
            <div key={event.id} className="min-w-75 max-w-85 shrink-0">
              <UpcomingCard event={event} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Top streams ──────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('trendingLive')}
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {topStreams.map((stream) => (
            <div key={stream.id} className="min-w-65 max-w-75 shrink-0">
              <LiveCard stream={stream} compact />
            </div>
          ))}
        </div>
      </section>

      {/* ── Recommended ──────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Recommandés pour vous
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recommended.map((stream) => (
            <div key={stream.id} className="min-w-75 max-w-85 shrink-0">
              <LiveCard stream={stream} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Radio en direct ──────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Radio className="h-5 w-5 text-purple-500" />
            Radio en direct
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {radios.map((radio) => (
            <RadioCard key={radio.id} radio={radio} />
          ))}
        </div>
      </section>

      {/* ── Replays ──────────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Film className="h-5 w-5 text-orange-500" />
            {t('replays')}
          </h2>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            VOIR TOUT
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {replays.map((stream) => (
            <div key={stream.id} className="min-w-70 max-w-80 shrink-0">
              <ReplayCard stream={stream} locale={locale} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section className="mt-10 px-4 md:px-12">
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">
          {t('categories')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {LIVE_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  )
}
