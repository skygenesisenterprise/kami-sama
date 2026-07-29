'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  CaretDown,
  List,
  ThumbsUp,
  ThumbsDown,
  Share,
} from 'phosphor-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/kami/scroll-reveal'
import VideoPlayer from '@/components/video-player'
import {
  getAnime,
  getEpisode,
  getEpisodes,
} from '@/lib/mock-data'

export default function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = use(params)
  const t = useTranslations('watch')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const epId = searchParams.get('ep')

  // Extraire la locale depuis le pathname si ce n'est pas dans params
  const currentLocale = locale || pathname?.split('/')[1] || 'fr'

  const anime = getAnime(slug)
  const allEpisodes = useMemo(() => (anime ? getEpisodes(anime.id) : []), [anime])

  const currentEpisode = useMemo(() => {
    if (!anime) return null
    if (epId) return getEpisode(anime.id, epId) ?? allEpisodes[1] ?? allEpisodes[0]
    return allEpisodes[1] ?? allEpisodes[0]
  }, [anime, epId, allEpisodes])

  const currentIndex = currentEpisode
    ? allEpisodes.findIndex((e) => e.id === currentEpisode.id)
    : -1
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null

  const [showFullInfo, setShowFullInfo] = useState(false)
  const [showEpisodeList, setShowEpisodeList] = useState(false)
  const [openSeason, setOpenSeason] = useState(currentEpisode?.season ?? 1)

  useEffect(() => {
    if (anime) {
      document.title = `Kami-Sama: ${anime.title}`
    }
  }, [anime])

  if (!anime || !currentEpisode) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">{t('notFound.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('notFound.description')}
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/">{t('notFound.goHome')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh select-none bg-[#141414]">
      <div className="mesh-gradient-bg" />

      {/* ── Video Player ── */}
      <div className="relative w-full bg-black">
        <div className="relative mx-auto w-full">
          <VideoPlayer episode={currentEpisode} />
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
                    E{currentEpisode.number} – {currentEpisode.title}
                  </h1>

                  {/* Metadata row */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {anime.ageRating}
                    </span>
                    <span>•</span>
                    <span>{t('meta.subtitled')}</span>
                    <span>•</span>
                    <span>{t('meta.availableSince', { date: currentEpisode.releaseDate })}</span>
                  </div>

                  {/* Like / Dislike / Share */}
                  <div className="mt-4 flex items-center gap-3">
                    <button type="button" className="flex items-center gap-1.5 text-white/60 transition-colors hover:text-white">
                      <ThumbsUp className="size-5" weight="light" />
                      <span className="text-sm">66.4K</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 text-white/60 transition-colors hover:text-white">
                      <ThumbsDown className="size-5" weight="light" />
                      <span className="text-sm">1.5K</span>
                    </button>
                    <button type="button" className="ml-2 text-white/60 transition-colors hover:text-white">
                      <Share className="size-5" weight="light" />
                    </button>
                  </div>

                  {/* Description */}
                  {currentEpisode.description && (
                    <p className="mt-5 text-sm leading-relaxed text-white/70">
                      {currentEpisode.description}
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
                        <span className="mr-2 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                          {anime.ageRating}
                        </span>
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">{t('comments.title')}</h2>
                  <span className="text-sm text-white/50">{t('comments.count', { count: 8 })}</span>
                </div>

                {/* ── Comment Input ── */}
                <div className="flex gap-3 mb-8">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src="" alt="" />
                    <AvatarFallback className="bg-white/10 text-xs text-white/70">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={t('comments.addPlaceholder')}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-white/50"
                    />
                  </div>
                </div>

                {/* ── Sort ── */}
                <div className="flex items-center gap-2 mb-6">
                  <button type="button" className="flex items-center gap-1 text-sm font-semibold text-white">
                    {t('comments.sortBy')}
                    <CaretDown className="size-3" weight="light" />
                  </button>
                </div>

                {/* ── Comments List ── */}
                <div className="space-y-5">
                  {/* Comment 1 */}
                  <div className="flex gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-[#e50914]/20 text-[10px] font-bold text-[#e50914]">AK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">AkiraKing92</span>
                        <span className="text-xs text-white/40">il y a 2 heures</span>
                      </div>
                      <p className="mt-1 text-sm text-white/80 leading-relaxed">
                        L&apos;animation de ce épisode était absolument INCROYABLE. La scène de combat à 12:34 est peut-être la meilleure chose que j&apos;ai vue cette année. MAPPA a vraiment surhumainé cette saison.
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsUp className="size-3.5" weight="light" />
                          <span>243</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsDown className="size-3.5" weight="light" />
                        </button>
                        <button type="button" className="text-xs text-white/50 transition-colors hover:text-white">
                          {t('actions.reply')}
                        </button>
                      </div>

                      {/* Reply */}
                      <div className="mt-4 flex gap-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src="" alt="" />
                          <AvatarFallback className="bg-white/10 text-[9px] text-white/70">LW</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">LunaWatches</span>
                            <span className="text-xs text-white/40">il y a 1 heure</span>
                          </div>
                          <p className="mt-1 text-sm text-white/80 leading-relaxed">
                            Tellement d&apos;accord! Et la OST pendant cette scène était parfaite. On dirait qu&apos;ils ont tout donné pour ce dernier arc.
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                              <ThumbsUp className="size-3.5" weight="light" />
                              <span>87</span>
                            </button>
                            <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                              <ThumbsDown className="size-3.5" weight="light" />
                            </button>
                            <button type="button" className="text-xs text-white/50 transition-colors hover:text-white">
                              {t('actions.reply')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="flex gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-purple-500/20 text-[10px] font-bold text-purple-400">SN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">SakuraNoir</span>
                        <span className="text-xs text-white/40">il y a 5 heures</span>
                      </div>
                      <p className="mt-1 text-sm text-white/80 leading-relaxed">
                        Est-ce que quelqu&apos;un a remarqué le Easter egg à 8:12? On voit le poster du prochain arc sur le mur. Hâte de voir comment ils vont adapter la suite!
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsUp className="size-3.5" weight="light" />
                          <span>156</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsDown className="size-3.5" weight="light" />
                        </button>
                        <button type="button" className="text-xs text-white/50 transition-colors hover:text-white">
                          {t('actions.reply')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment 3 */}
                  <div className="flex gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-emerald-500/20 text-[10px] font-bold text-emerald-400">CN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">CinemaNerd</span>
                        <span className="text-xs text-white/40">il y a 8 heures</span>
                      </div>
                      <p className="mt-1 text-sm text-white/80 leading-relaxed">
                        Ce qui me plaît le plus c&apos;est la direction artistique. Chaque plan est comme une peinture. C&apos;est rare d&apos;avoir une qualité constante pareille sur 24 épisodes.
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsUp className="size-3.5" weight="light" />
                          <span>312</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsDown className="size-3.5" weight="light" />
                        </button>
                        <button type="button" className="text-xs text-white/50 transition-colors hover:text-white">
                          {t('actions.reply')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment 4 */}
                  <div className="flex gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-amber-500/20 text-[10px] font-bold text-amber-400">MF</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">MangaFanFR</span>
                        <span className="text-xs text-white/40">il y a 12 heures</span>
                      </div>
                      <p className="mt-1 text-sm text-white/80 leading-relaxed">
                        Pour ceux qui lisent le manga, cette adaptation est fidèle à 95%. Les scènes ajoutées en plus sont vraiment un bonus. Studio MAPPA ne déçoit jamais.
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsUp className="size-3.5" weight="light" />
                          <span>98</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white">
                          <ThumbsDown className="size-3.5" weight="light" />
                        </button>
                        <button type="button" className="text-xs text-white/50 transition-colors hover:text-white">
                          {t('actions.reply')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Load More */}
                  <button
                    type="button"
                    className="w-full py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    {t('comments.loadMore')}
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ Right Column: Episode List ═══ */}
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
                        <Link
                          href={`/${currentLocale}/watch/${slug}?ep=${nextEpisode.id}`}
                          className="group flex gap-3"
                        >
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-white/10">
                            <img
                              src={nextEpisode.thumbnail || anime.cover || '/placeholder.svg'}
                              alt={nextEpisode.title}
                              className="size-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              23m
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <h4 className="text-sm font-semibold leading-snug text-white">
                              E{nextEpisode.number} – {nextEpisode.title}
                            </h4>
                            <p className="mt-1 text-xs text-white/50">{t('meta.subtitled')}</p>
                          </div>
                        </Link>
                      </div>
                    )}
                    {prevEpisode && (
                      <div>
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                          {t('episodes.prevEpisode')}
                        </h3>
                        <Link
                          href={`/${currentLocale}/watch/${slug}?ep=${prevEpisode.id}`}
                          className="group flex gap-3"
                        >
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-white/10">
                            <img
                              src={prevEpisode.thumbnail || anime.cover || '/placeholder.svg'}
                              alt={prevEpisode.title}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <h4 className="text-sm font-semibold leading-snug text-white">
                              E{prevEpisode.number} – {prevEpisode.title}
                            </h4>
                            <p className="mt-1 text-xs text-white/50">
                              {prevEpisode.number === 1 ? t('episodes.dubbed') : t('meta.subtitled')}
                            </p>
                          </div>
                        </Link>
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
                    {(() => {
                      const seasons = Array.from(new Set(allEpisodes.map((e) => e.season))).sort()
                      return seasons.map((season) => {
                        const seasonEpisodes = allEpisodes.filter((e) => e.season === season)
                        const isOpen = openSeason === season
                        return (
                          <div key={season}>
                            <button
                              type="button"
                              onClick={() => setOpenSeason(isOpen ? -1 : season)}
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
                                {seasonEpisodes.map((ep) => {
                                  const isCurrent = ep.id === currentEpisode.id
                                  const isWatched = (ep.progress ?? 0) >= (ep.duration ?? 1) * 0.9
                                  const isWatching = ep.progress != null && ep.progress > 0 && !isWatched
                                  return (
                                    <Link
                                      key={ep.id}
                                      href={`/${currentLocale}/watch/${slug}?ep=${ep.id}`}
                                      className={`group flex gap-3 rounded-md p-1.5 transition-colors ${
                                        isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                                      }`}
                                    >
                                      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-white/10">
                                        <img
                                          src={ep.thumbnail || anime.cover || '/placeholder.svg'}
                                          alt={ep.title}
                                          className="size-full object-cover"
                                        />
                                        {isWatched && (
                                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] font-bold text-white">
                                            {t('episodes.watched')}
                                          </span>
                                        )}
                                        {isWatching && (
                                          <span className="absolute top-1 left-1 rounded bg-[#e50914] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                            {t('episodes.watching')}
                                          </span>
                                        )}
                                        {!isWatched && !isWatching && (
                                          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                            23m
                                          </span>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1 pt-0.5">
                                        <h4 className={`text-sm font-semibold leading-snug ${isCurrent ? 'text-white' : 'text-white/80'}`}>
                                          E{ep.number} – {ep.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-white/50">
                                          {ep.number === 1 ? t('episodes.dubbed') : t('meta.subtitled')}
                                        </p>
                                      </div>
                                    </Link>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })
                    })()}
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
          </div>
      </div>
    </div>
  )
}
