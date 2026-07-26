'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Review } from '@/lib/community-forum-data'
import { UserAvatar } from '@/components/kami/user-avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function ratingColor(r: number): string {
  if (r >= 9) return 'text-emerald-600 dark:text-emerald-400'
  if (r >= 7) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

function ratingBg(r: number): string {
  if (r >= 9) return 'bg-emerald-500/10 border-emerald-500/30'
  if (r >= 7) return 'bg-amber-500/10 border-amber-500/30'
  return 'bg-red-500/10 border-red-500/30'
}

/* -------------------------------------------------------------------------- */
/*  Review Card                                                                */
/* -------------------------------------------------------------------------- */

function ReviewCard({ review, t }: { review: Review; t: (k: string) => string }) {
  const [expanded, setExpanded] = React.useState(false)
  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn('shrink-0 w-16 h-16 rounded-lg border flex items-center justify-center', ratingBg(review.rating))}>
            <span className={cn('text-2xl font-bold', ratingColor(review.rating))}>{review.rating}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs">Review</Badge>
              {review.hasSpoilers && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">⚠ Spoilers</Badge>}
            </div>
            <h3 className="font-semibold text-base mt-1">{review.contentLink.title}</h3>
            <div className="flex items-center gap-3 mt-1 mb-2">
              <span className="text-xs text-muted-foreground">{review.contentLink.year} · {review.contentLink.type}</span>
              {review.contentLink.imageUrl && (
                <img src={review.contentLink.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />
              )}
            </div>
            <p className={cn('text-sm text-muted-foreground leading-relaxed', !expanded && 'line-clamp-3')}>
              {review.content}
            </p>
            {review.content.length > 200 && (
              <button
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? t('reviews.showLess') : t('reviews.readMore')}
              </button>
            )}
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar user={review.author} className="size-6" />
                <div>
                  <div className="font-medium text-sm">{review.author.displayName}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>👍 {review.helpfulCount} {t('reviews.helpful')}</span>
                <span>💬 {review.commentCount}</span>
                <div className="flex items-center gap-1">
                  {review.reactions.map(r => (
                    <span key={r.type} className="text-xs">
                      {r.type === 'like' ? '👍' : r.type === 'love' ? '❤️' : r.type === 'insightful' ? '💡' : '😂'} {r.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Stats Card                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className={cn('text-2xl font-bold', color)}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ReviewsPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const pathname = usePathname()
  const { reviews } = communityData

  const [search, setSearch] = React.useState('')
  const [minRating, setMinRating] = React.useState<number>(0)
  const [spoilerFilter, setSpoilerFilter] = React.useState<'all' | 'no-spoilers' | 'with-spoilers'>('all')

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const filtered = React.useMemo(() => {
    let result = [...reviews]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.contentLink.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        r.author.displayName.toLowerCase().includes(q)
      )
    }
    if (minRating > 0) {
      result = result.filter(r => r.rating >= minRating)
    }
    if (spoilerFilter === 'no-spoilers') {
      result = result.filter(r => !r.hasSpoilers)
    } else if (spoilerFilter === 'with-spoilers') {
      result = result.filter(r => r.hasSpoilers)
    }
    result.sort((a, b) => b.rating - a.rating)
    return result
  }, [reviews, search, minRating, spoilerFilter])

  function switchLocale(locale: 'fr' | 'en') {
    router.push(`/${locale}${pathname}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-semibold text-lg">{t('siteTitle')}</a>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <a href="/community" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.community')}</a>
              <a href="/community/discussions" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.discussions')}</a>
              <a href="/community/reviews" className="font-medium text-primary">{t('nav.reviews')}</a>
              <a href="/community/recommendations" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.recommendations')}</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => switchLocale('fr')}>🇫🇷 FR</Button>
            <Button variant="ghost" size="sm" onClick={() => switchLocale('en')}>🇬🇧 EN</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('reviews.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('reviews.description')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label={t('reviews.stats.total')} value={reviews.length} />
          <StatCard label={t('reviews.stats.avgRating')} value={avgRating} color="text-amber-600 dark:text-amber-400" />
          <StatCard label={t('reviews.stats.helpfulVotes')} value={reviews.reduce((s, r) => s + r.helpfulCount, 0).toLocaleString()} color="text-emerald-600 dark:text-emerald-400" />
          <StatCard label={t('reviews.stats.comments')} value={reviews.reduce((s, r) => s + r.commentCount, 0).toLocaleString()} color="text-cyan-600 dark:text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder={t('reviews.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />

            {/* Min Rating */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">{t('reviews.minRating')}</div>
              <div className="flex gap-1">
                {[0, 5, 6, 7, 8, 9].map(r => (
                  <button
                    key={r}
                    className={cn(
                      'px-2 py-1 rounded text-xs transition-colors',
                      minRating === r
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    )}
                    onClick={() => setMinRating(r)}
                  >
                    {r === 0 ? t('reviews.all') : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Spoiler Filter */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">{t('reviews.spoilerFilter')}</div>
              <div className="space-y-1">
                {(['all', 'no-spoilers', 'with-spoilers'] as const).map(mode => (
                  <button
                    key={mode}
                    className={cn(
                      'w-full px-3 py-1.5 text-left rounded text-sm transition-colors',
                      spoilerFilter === mode
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    )}
                    onClick={() => setSpoilerFilter(mode)}
                  >
                    {t(`reviews.filter.${mode}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {t('reviews.noResults')}
                </CardContent>
              </Card>
            ) : (
              filtered.map(r => <ReviewCard key={r.id} review={r} t={t} />)
            )}
            <div className="text-xs text-muted-foreground text-right">
              {filtered.length} {t('reviews.resultCount')}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
