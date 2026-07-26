'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Post, type Review, type Recommendation, type CommunityUser } from '@/lib/community-forum-data'
import { UserAvatar } from '@/components/kami/user-avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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

/* -------------------------------------------------------------------------- */
/*  Post Card                                                                  */
/* -------------------------------------------------------------------------- */

function PostCard({ post, t }: { post: Post; t: (k: string) => string }) {
  const router = useRouter()
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => router.push(`/community/discussions/${post.slug}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <UserAvatar user={post.author} className="size-6" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {post.isPinned && <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs">Pinned</Badge>}
              {post.hasSpoilers && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">⚠ Spoilers</Badge>}
              <Badge variant="outline" className="text-xs">{post.category.name}</Badge>
            </div>
            <h3 className="font-semibold text-sm mt-1 line-clamp-1">{post.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.excerpt}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{post.author.displayName}</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              <span>·</span>
              <span>{post.commentCount} {t('comments')}</span>
              <span>·</span>
              <span>{post.totalReactions} {t('reactions')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Review Card                                                                */
/* -------------------------------------------------------------------------- */

function ReviewCard({ review, t }: { review: Review; t: (k: string) => string }) {
  const router = useRouter()
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => router.push(`/community/discussions/${review.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <UserAvatar user={review.author} className="size-6" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs">Review</Badge>
              <span className={cn('font-bold text-sm', ratingColor(review.rating))}>{review.rating}/10</span>
              {review.hasSpoilers && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">⚠ Spoilers</Badge>}
            </div>
            <h3 className="font-semibold text-sm mt-1">{review.contentLink.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{review.content}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{review.author.displayName}</span>
              <span>·</span>
              <span>{timeAgo(review.createdAt)}</span>
              <span>·</span>
              <span>{review.helpfulCount} {t('helpful')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Recommendation Card                                                        */
/* -------------------------------------------------------------------------- */

function RecommendationCard({ rec, t }: { rec: Recommendation; t: (k: string) => string }) {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <UserAvatar user={rec.author} className="size-6" />
          <div className="flex-1 min-w-0">
            <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs">Recommendation</Badge>
            <h3 className="font-semibold text-sm mt-1">{rec.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.reason}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="outline" className="text-xs">{rec.fromContent.title}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="secondary" className="text-xs">{rec.toContent.title}</Badge>
              <span className="ml-auto text-muted-foreground">👍 {rec.votes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Top Contributor Card                                                       */
/* -------------------------------------------------------------------------- */

function ContributorCard({ user }: { user: CommunityUser }) {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} className="size-9" />
          <div>
            <div className="font-semibold text-sm">{user.displayName}</div>
            <div className="text-xs text-muted-foreground">@{user.username}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">⭐ {user.reputation.toLocaleString()}</Badge>
              <Badge variant="outline" className="text-xs">📝 {user.stats.reviews}</Badge>
              <Badge variant="outline" className="text-xs">💬 {user.stats.comments}</Badge>
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

export default function CommunityPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const pathname = usePathname()
  const { overview, categories, posts, reviews, recommendations, announcements, users } = communityData
  const topPosts = [...posts].sort((a, b) => b.totalReactions - a.totalReactions).slice(0, 5)
  const topContributors = [...users].sort((a, b) => b.reputation - a.reputation).slice(0, 5)

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
              <a href="/community" className="font-medium text-primary">{t('nav.community')}</a>
              <a href="/community/discussions" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.discussions')}</a>
              <a href="/community/reviews" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.reviews')}</a>
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
        {/* Hero */}
        <section className="mb-8">
          <div className="rounded-xl border bg-linear-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold">{t('homepage.title')}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">{t('homepage.description')}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overview.totalMembers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t('stats.members')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overview.totalPosts}</div>
                <div className="text-xs text-muted-foreground">{t('stats.posts')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overview.totalReviews}</div>
                <div className="text-xs text-muted-foreground">{t('stats.reviews')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overview.onlineNow}</div>
                <div className="text-xs text-muted-foreground">{t('stats.onlineNow')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('sections.announcements')}</h2>
            <div className="space-y-3">
              {announcements.map(a => (
                <Card key={a.id} className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{a.author.displayName}</span>
                      <span>·</span>
                      <span>{timeAgo(a.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Popular Discussions */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t('sections.popularDiscussions')}</h2>
                <Button variant="ghost" size="sm" onClick={() => router.push('/community/discussions')}>
                  {t('actions.viewAll')} →
                </Button>
              </div>
              <div className="space-y-2">
                {topPosts.map(p => <PostCard key={p.id} post={p} t={t} />)}
              </div>
            </section>

            {/* Recent Reviews */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t('sections.recentReviews')}</h2>
                <Button variant="ghost" size="sm" onClick={() => router.push('/community/reviews')}>
                  {t('actions.viewAll')} →
                </Button>
              </div>
              <div className="space-y-2">
                {reviews.slice(0, 3).map(r => <ReviewCard key={r.id} review={r} t={t} />)}
              </div>
            </section>

            {/* Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t('sections.topRecommendations')}</h2>
                <Button variant="ghost" size="sm" onClick={() => router.push('/community/recommendations')}>
                  {t('actions.viewAll')} →
                </Button>
              </div>
              <div className="space-y-2">
                {recommendations.slice(0, 3).map(r => <RecommendationCard key={r.id} rec={r} t={t} />)}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <section>
              <h2 className="text-lg font-semibold mb-3">{t('sections.categories')}</h2>
              <Card>
                <CardContent className="p-0">
                  {categories.map((cat, i) => (
                    <React.Fragment key={cat.id}>
                      {i > 0 && <Separator />}
                      <button
                        className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/community/discussions?category=${cat.slug}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{cat.name}</div>
                            <div className="text-xs text-muted-foreground">{cat.postCount} {t('categories.posts')}</div>
                          </div>
                        </div>
                      </button>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* Top Contributors */}
            <section>
              <h2 className="text-lg font-semibold mb-3">{t('sections.topContributors')}</h2>
              <div className="space-y-2">
                {topContributors.map(u => <ContributorCard key={u.id} user={u} />)}
              </div>
            </section>

            {/* Stats */}
            <section>
              <h2 className="text-lg font-semibold mb-3">{t('sections.communityStats')}</h2>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.totalComments')}</span>
                    <span className="font-medium">{overview.totalComments.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.newToday')}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">+{overview.newToday}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.topContributor')}</span>
                    <span className="font-medium">{overview.topContributor.displayName}</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
