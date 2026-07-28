'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Post, type Review, type Recommendation, type CommunityUser, type Category } from '@/lib/community-forum-data'
import { UserAvatar } from '@/components/kami/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months}mo`
}

function ratingColor(r: number): string {
  if (r >= 9) return 'text-emerald-500'
  if (r >= 7) return 'text-amber-500'
  return 'text-red-500'
}

/* -------------------------------------------------------------------------- */
/*  Vote Arrows                                                                */
/* -------------------------------------------------------------------------- */

function VoteArrows({ count, direction = 'vertical' }: { count: number; direction?: 'vertical' | 'horizontal' }) {
  const [vote, setVote] = React.useState<'up' | 'down' | null>(null)
  const display = vote === 'up' ? count + 1 : vote === 'down' ? count - 1 : count

  return (
    <div className={cn(
      'flex items-center gap-0.5',
      direction === 'vertical' ? 'flex-col' : 'flex-row',
    )}>
      <button
        onClick={(e) => { e.stopPropagation(); setVote(vote === 'up' ? null : 'up') }}
        className={cn(
          'p-1 rounded-sm transition-colors',
          vote === 'up' ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10',
        )}
        aria-label="Upvote"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
      </button>
      <span className={cn(
        'text-xs font-bold tabular-nums min-w-[2ch] text-center',
        vote === 'up' && 'text-orange-500',
        vote === 'down' && 'text-blue-500',
        !vote && 'text-muted-foreground',
      )}>
        {display}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); setVote(vote === 'down' ? null : 'down') }}
        className={cn(
          'p-1 rounded-sm transition-colors',
          vote === 'down' ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10',
        )}
        aria-label="Downvote"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20l8-8h-5V4H9v8H4z" />
        </svg>
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Post Card — Reddit style                                                   */
/* -------------------------------------------------------------------------- */

function PostCard({ post, t }: { post: Post; t: (k: string) => string }) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  return (
    <div
      className="flex gap-2 p-2 rounded-md border border-transparent hover:border-line-strong bg-card/40 hover:bg-card transition-colors cursor-pointer group"
      onClick={() => router.push(`/${locale}/community/discussions/${post.slug}`)}
    >
      <VoteArrows count={post.totalReactions} />

      <div className="flex-1 min-w-0">
        {/* Meta line */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <span className="font-bold text-foreground hover:underline">{post.category.name}</span>
          <span>·</span>
          <span>Posted by</span>
          <span className="hover:underline">u/{post.author.username}</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold mt-1 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.isPinned && <span className="text-primary mr-1.5">📌</span>}
          {post.hasSpoilers && <span className="text-red-500 mr-1.5">⚠</span>}
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{post.excerpt}</p>

        {/* Action bar */}
        <div className="flex items-center gap-1 mt-2 -ml-1">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.commentCount} {t('comments')}
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Review Card — Reddit style                                                 */
/* -------------------------------------------------------------------------- */

function ReviewCard({ review, t }: { review: Review; t: (k: string) => string }) {
  return (
    <div className="flex gap-2 p-2 rounded-md border border-transparent hover:border-line-strong bg-card/40 hover:bg-card transition-colors cursor-pointer group">
      <VoteArrows count={review.totalReactions} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <Badge className="bg-amber-500/15 text-amber-500 text-[10px] px-1.5 py-0 h-4 font-semibold">Review</Badge>
          <span className={cn('font-bold', ratingColor(review.rating))}>{review.rating}/10</span>
          <span>·</span>
          <span className="font-bold text-foreground">u/{review.author.username}</span>
          <span>{timeAgo(review.createdAt)}</span>
        </div>

        <h3 className="text-base font-semibold mt-1 leading-snug group-hover:text-primary transition-colors">
          {review.contentLink.title}
          {review.hasSpoilers && <span className="text-red-500 ml-1.5 text-xs">⚠ Spoilers</span>}
        </h3>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{review.content}</p>

        <div className="flex items-center gap-1 mt-2 -ml-1">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {review.commentCount} {t('comments')}
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            👍 {review.helpfulCount} {t('helpful')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Recommendation Card                                                        */
/* -------------------------------------------------------------------------- */

function RecommendationCard({ rec, t }: { rec: Recommendation; t: (k: string) => string }) {
  return (
    <div className="flex gap-2 p-2 rounded-md border border-transparent hover:border-line-strong bg-card/40 hover:bg-card transition-colors cursor-pointer group">
      <VoteArrows count={rec.votes} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <Badge className="bg-cyan-500/15 text-cyan-500 text-[10px] px-1.5 py-0 h-4 font-semibold">Rec</Badge>
          <span className="font-bold text-foreground">u/{rec.author.username}</span>
          <span>{timeAgo(rec.createdAt)}</span>
        </div>

        <h3 className="text-base font-semibold mt-1 leading-snug group-hover:text-primary transition-colors">
          {rec.title}
        </h3>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{rec.reason}</p>

        <div className="flex items-center gap-2 mt-2 text-xs">
          <Badge variant="outline" className="text-xs">{rec.fromContent.title}</Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="secondary" className="text-xs">{rec.toContent.title}</Badge>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sort Tabs                                                                  */
/* -------------------------------------------------------------------------- */

type SortTab = 'hot' | 'new' | 'top' | 'rising'

function SortTabs({ active, onChange }: { active: SortTab; onChange: (s: SortTab) => void }) {
  const tabs: { key: SortTab; label: string; icon: React.ReactNode }[] = [
    { key: 'hot', label: 'Hot', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-4.97 0-9-3.13-9-7 0-2.61 1.67-5.46 4.5-7.5.54-.39 1.14.13.94.74-.37 1.14.34 2.34 1.76 2.76.36.11.62.46.62.86 0 .28-.14.54-.36.7C8.14 14.37 9 16.1 9 18c0 2.76 2.69 5 6 5s6-2.24 6-5c0-4-3-7.5-3-9 0-1.44.93-2.42 1.87-3.16.4-.31.97-.06 1.02.43.17 1.57-.89 3.23-2.89 4.23C17.17 6.55 18 4.33 18 2c0-.55-.45-.96-.93-.72C14.89 2.48 13 4.68 13 7c0 .88.15 1.73.43 2.5.26.72-.07 1.52-.76 1.88-.3.16-.65.08-.87-.18C10.73 10.02 9 8.13 9 6c0-1.52.67-2.9 1.73-3.87.37-.34.35-.92-.04-1.23C9.18.2 7.23.65 5.5 2 3.44 3.69 2 5.94 2 8.5 2 14.3 6.95 19 12 19h0c5.05 0 9-4.7 9-10.5 0-3.64-2.12-6.84-5.5-8.5-.38-.19-.82.08-.82.51 0 2.48 1.25 4.77 3.32 6.49z"/></svg> },
    { key: 'new', label: 'New', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { key: 'top', label: 'Top', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
    { key: 'rising', label: 'Rising', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  ]

  return (
    <div className="flex items-center gap-1 border-b border-line pb-2">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            active === tab.key
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sidebar — Community Info                                                   */
/* -------------------------------------------------------------------------- */

function CommunitySidebar({ overview, categories, topContributors, t }: {
  overview: typeof communityData.overview
  categories: Category[]
  topContributors: CommunityUser[]
  t: (k: string) => string
}) {
  return (
    <div className="space-y-4">
      {/* About Community */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="bg-primary/20 px-4 py-3">
          <h3 className="font-bold text-sm">r/KamiSama Community</h3>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            The place for anime fans to discuss, review, and discover new series together.
          </p>
          <Separator />
          <div className="flex items-center gap-3">
            <div>
              <div className="font-bold">{overview.totalMembers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div className="w-px h-8 bg-line" />
            <div>
              <div className="font-bold text-emerald-500">{overview.onlineNow}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>
          <Separator />
          <Button className="w-full" size="sm">Create Post</Button>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <h3 className="font-bold text-sm">r/KamiSama Rules</h3>
        </div>
        <div className="p-2">
          {[
            'Be respectful and civil',
            'No piracy or illegal content',
            'Use spoiler tags appropriately',
            'No self-promotion spam',
            'Search before posting',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 px-2 py-1.5 text-sm">
              <span className="font-bold text-muted-foreground">{i + 1}.</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <h3 className="font-bold text-sm">Top Contributors</h3>
        </div>
        <div className="p-2">
          {topContributors.slice(0, 5).map((user, i) => (
            <div key={user.id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50 transition-colors">
              <span className="text-xs font-bold text-muted-foreground w-4 text-center">{i + 1}</span>
              <UserAvatar user={user} className="size-6" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.displayName}</div>
                <div className="text-xs text-muted-foreground">⭐ {user.reputation.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <h3 className="font-bold text-sm">Categories</h3>
        </div>
        <div className="p-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <span className="text-base">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{cat.name}</div>
                <div className="text-xs text-muted-foreground">{cat.postCount} posts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Create Post Banner                                                         */
/* -------------------------------------------------------------------------- */

function CreatePostBanner() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md border border-line bg-card">
      <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
        ▶
      </div>
      <input
        type="text"
        placeholder="Create Post"
        className="flex-1 bg-muted/50 border border-line rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted transition-colors"
        readOnly
      />
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CommunityPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const { overview, categories, posts, reviews, recommendations, announcements, users } = communityData
  const [sort, setSort] = React.useState<SortTab>('hot')
  const topContributors = [...users].sort((a, b) => b.reputation - a.reputation).slice(0, 5)

  const sortedPosts = React.useMemo(() => {
    const arr = [...posts]
    switch (sort) {
      case 'hot': return arr.sort((a, b) => b.totalReactions - a.totalReactions)
      case 'new': return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'top': return arr.sort((a, b) => b.totalReactions - a.totalReactions)
      case 'rising': return arr.sort((a, b) => b.commentCount - a.commentCount)
      default: return arr
    }
  }, [posts, sort])

  function switchLocale(newLocale: 'fr' | 'en') {
    router.push(`/${newLocale}${pathname.slice(locale.length)}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Content */}
      <div className="max-w-300 mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main Feed */}
          <main className="flex-1 min-w-0 space-y-3">
            <CreatePostBanner />
            <SortTabs active={sort} onChange={setSort} />

            {/* Announcements */}
            {announcements.map(a => {
              const linkedPost = posts.find(p => p.type === 'announcement' && p.title === a.title)
              return (
                <div
                  key={a.id}
                  className="flex gap-2 p-2 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                  onClick={() => linkedPost && router.push(`/${locale}/community/discussions/${linkedPost.slug}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0 h-4 font-semibold">Announcement</Badge>
                      <span className="font-bold text-foreground">u/{a.author.username}</span>
                      <span>{timeAgo(a.createdAt)}</span>
                    </div>
                    <h3 className="text-base font-semibold mt-1 group-hover:text-primary transition-colors">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                  </div>
                </div>
              )
            })}

            {/* Feed Items */}
            {sortedPosts.map(p => (
              <PostCard key={p.id} post={p} t={t} />
            ))}

            {/* Reviews */}
            {reviews.slice(0, 3).map(r => (
              <ReviewCard key={r.id} review={r} t={t} />
            ))}

            {/* Recommendations */}
            {recommendations.slice(0, 3).map(r => (
              <RecommendationCard key={r.id} rec={r} t={t} />
            ))}
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-77.5 shrink-0">
            <div className="sticky top-16">
              <CommunitySidebar
                overview={overview}
                categories={categories}
                topContributors={topContributors}
                t={t}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
