'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Recommendation } from '@/lib/community-forum-data'
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

/* -------------------------------------------------------------------------- */
/*  Recommendation Card                                                        */
/* -------------------------------------------------------------------------- */

function RecommendationCard({ rec, t }: { rec: Recommendation; t: (k: string) => string }) {
  const [voted, setVoted] = React.useState(rec.userVoted)
  const [votes, setVotes] = React.useState(rec.votes)

  function handleVote() {
    if (voted) {
      setVotes(v => v - 1)
    } else {
      setVotes(v => v + 1)
    }
    setVoted(!voted)
  }

  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Vote Column */}
          <div className="flex flex-col items-center gap-1">
            <button
              className={cn(
                'w-10 h-10 rounded-lg border flex items-center justify-center transition-all',
                voted
                  ? 'bg-primary/15 border-primary/30 text-primary scale-110'
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
              onClick={handleVote}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2L14 8H10V14H6V8H2L8 2Z" />
              </svg>
            </button>
            <span className={cn('text-sm font-bold', voted ? 'text-primary' : 'text-muted-foreground')}>
              {votes}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs">Recommendation</Badge>
              {rec.fromContent.type && (
                <Badge variant="outline" className="text-xs">{rec.fromContent.type}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-base mt-1">{rec.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{rec.reason}</p>

            {/* Content Link */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
                <span className="text-xs text-muted-foreground">{t('recommendations.ifYouLike')}</span>
                <Badge variant="secondary" className="text-xs font-medium">{rec.fromContent.title}</Badge>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xs text-primary">{t('recommendations.try')}</span>
                <Badge className="bg-primary/15 text-primary text-xs font-medium">{rec.toContent.title}</Badge>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar user={rec.author} className="size-6" />
                <div>
                  <div className="font-medium text-sm">{rec.author.displayName}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(rec.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>💬 {rec.commentCount} {t('recommendations.comments')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function RecommendationsPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const pathname = usePathname()
  const { recommendations } = communityData

  const [search, setSearch] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'top' | 'recent' | 'discussed'>('top')
  const locale = pathname.split('/')[1] || 'en'

  const filtered = React.useMemo(() => {
    let result = [...recommendations]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.fromContent.title.toLowerCase().includes(q) ||
        r.toContent.title.toLowerCase().includes(q) ||
        r.author.displayName.toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case 'top':
        result.sort((a, b) => b.votes - a.votes)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'discussed':
        result.sort((a, b) => b.commentCount - a.commentCount)
        break
    }
    return result
  }, [recommendations, search, sortBy])

  function switchLocale(locale: 'fr' | 'en') {
    router.push(`/${locale}${pathname}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={`/${locale}`} className="font-semibold text-lg">{t('siteTitle')}</a>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <a href={`/${locale}/community`} className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.community')}</a>
              <a href={`/${locale}/community/discussions`} className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.discussions')}</a>
              <a href={`/${locale}/community/reviews`} className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.reviews')}</a>
              <a href={`/${locale}/community/recommendations`} className="font-medium text-primary">{t('nav.recommendations')}</a>
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
            <h1 className="text-2xl font-bold">{t('recommendations.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('recommendations.description')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <Input
            placeholder={t('recommendations.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('recommendations.sortBy')}</span>
            {(['top', 'recent', 'discussed'] as const).map(s => (
              <button
                key={s}
                className={cn(
                  'px-3 py-1.5 rounded text-xs transition-colors',
                  sortBy === s
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'hover:bg-muted/50 text-muted-foreground'
                )}
                onClick={() => setSortBy(s)}
              >
                {t(`recommendations.sort.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                {t('recommendations.noResults')}
              </CardContent>
            </Card>
          ) : (
            filtered.map(r => <RecommendationCard key={r.id} rec={r} t={t} />)
          )}
        </div>

        <div className="text-xs text-muted-foreground text-right mt-2">
          {filtered.length} {t('recommendations.resultCount')}
        </div>
      </main>
    </div>
  )
}
