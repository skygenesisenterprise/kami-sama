'use client'

import * as React from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Post, type Comment, type ReactionType } from '@/lib/community-forum-data'
import { UserAvatar } from '@/components/kami/user-avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
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

const reactionEmoji: Record<ReactionType, string> = {
  like: '👍', love: '❤️', insightful: '💡', funny: '😂',
}

/* -------------------------------------------------------------------------- */
/*  Comment Component                                                          */
/* -------------------------------------------------------------------------- */

function CommentItem({ comment, depth = 0, t }: { comment: Comment; depth?: number; t: (k: string) => string }) {
  const [showReply, setShowReply] = React.useState(false)
  return (
    <div className={cn('border-l-2', depth > 0 ? 'ml-6 border-muted' : 'border-transparent')}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          <UserAvatar user={comment.author} className="size-6" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author.displayName}</span>
              {comment.author.role === 'moderator' && <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs">Mod</Badge>}
              {comment.author.role === 'admin' && <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs">Admin</Badge>}
              <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
              {comment.hasSpoilers && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">⚠ Spoilers</Badge>}
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
            <div className="flex items-center gap-3 mt-2">
              {comment.reactions.map(r => (
                <button
                  key={r.type}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full border transition-colors',
                    r.userReacted ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                  )}
                >
                  {reactionEmoji[r.type]} {r.count}
                </button>
              ))}
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowReply(!showReply)}
              >
                {t('detail.reply')}
              </button>
            </div>
            {showReply && (
              <div className="mt-2">
                <Textarea placeholder={t('detail.replyPlaceholder')} className="text-sm min-h-15" />
                <div className="flex justify-end gap-2 mt-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowReply(false)}>Cancel</Button>
                  <Button size="sm">{t('detail.postReply')}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} t={t} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DiscussionDetailPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const { posts, categories } = communityData

  const slug = params.slug as string
  const post = posts.find(p => p.slug === slug || p.id === slug)

  const [newComment, setNewComment] = React.useState('')

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('detail.notFound')}</h1>
          <Button variant="ghost" onClick={() => router.push('/community/discussions')}>
            {t('detail.backToDiscussions')}
          </Button>
        </div>
      </div>
    )
  }

  // Mock replies
  const mockReplies: Comment[] = [
    {
      id: 'c-001', postId: post.id, parentId: null, author: communityData.users[1],
      content: 'Great discussion topic! I completely agree. The quality of anime production this year has been outstanding.',
      createdAt: new Date(Date.now() - 3600_000).toISOString(), updatedAt: null,
      reactions: [{ type: 'like', count: 12, userReacted: false }, { type: 'insightful', count: 3, userReacted: false }],
      totalReactions: 15, status: 'active', hasSpoilers: false,
      replies: [
        {
          id: 'c-002', postId: post.id, parentId: 'c-001', author: communityData.users[2],
          content: 'Totally! And the soundtrack work has been incredible too.',
          createdAt: new Date(Date.now() - 1800_000).toISOString(), updatedAt: null,
          reactions: [{ type: 'like', count: 5, userReacted: false }],
          totalReactions: 5, status: 'active', hasSpoilers: false, replies: [],
        },
      ],
    },
    {
      id: 'c-003', postId: post.id, parentId: null, author: communityData.users[3],
      content: 'Don\'t forget about the indie anime scene! There are some real gems this year that flew under the radar.',
      createdAt: new Date(Date.now() - 7200_000).toISOString(), updatedAt: null,
      reactions: [{ type: 'like', count: 8, userReacted: false }, { type: 'love', count: 2, userReacted: false }],
      totalReactions: 10, status: 'active', hasSpoilers: false, replies: [],
    },
    {
      id: 'c-004', postId: post.id, parentId: null, author: communityData.users[0],
      content: 'For me, Frieren is the clear anime of the year. The storytelling depth is unlike anything else.',
      createdAt: new Date(Date.now() - 14400_000).toISOString(), updatedAt: null,
      reactions: [{ type: 'like', count: 15, userReacted: false }, { type: 'love', count: 7, userReacted: false }],
      totalReactions: 22, status: 'active', hasSpoilers: false, replies: [],
    },
  ]

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
              <a href="/community/discussions" className="font-medium text-primary">{t('nav.discussions')}</a>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <button onClick={() => router.push('/community/discussions')} className="hover:text-foreground transition-colors">
            {t('nav.discussions')}
          </button>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Post */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {post.isPinned && <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs">Pinned</Badge>}
                  {post.hasSpoilers && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">⚠ Spoilers</Badge>}
                  <Badge variant="outline" className="text-xs">{post.category.icon} {post.category.name}</Badge>
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
                <h1 className="text-xl font-bold">{post.title}</h1>
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <UserAvatar user={post.author} className="size-6" />
                  <div>
                    <div className="font-medium text-sm">{post.author.displayName}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</div>
                  </div>
                  {post.contentLink && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      📎 {post.contentLink.title} ({post.contentLink.year})
                    </Badge>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                <Separator className="my-4" />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>👁 {post.views} {t('detail.views')}</span>
                  <span>💬 {post.commentCount} {t('detail.comments')}</span>
                  <div className="flex items-center gap-2">
                    {post.reactions.map(r => (
                      <button
                        key={r.type}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border transition-colors',
                          r.userReacted ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                        )}
                      >
                        {reactionEmoji[r.type]} {r.count}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Comment */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">{t('detail.leaveComment')}</h3>
                <Textarea
                  placeholder={t('detail.commentPlaceholder')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20"
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="rounded" />
                    {t('detail.containsSpoilers')}
                  </label>
                  <Button size="sm">{t('detail.postComment')}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <div>
              <h3 className="font-semibold text-sm mb-3">{t('detail.comments')} ({mockReplies.length})</h3>
              <Card>
                <CardContent className="p-0 divide-y">
                  {mockReplies.map(c => <CommentItem key={c.id} comment={c} t={t} />)}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Author Card */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-3">{t('detail.author')}</h3>
                <div
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
                  onClick={() => router.push(`/community/users/${post.author.id}`)}
                >
                  <UserAvatar user={post.author} className="size-9" />
                  <div>
                    <div className="font-medium text-sm">{post.author.displayName}</div>
                    <div className="text-xs text-muted-foreground">@{post.author.username}</div>
                    <div className="text-xs text-muted-foreground mt-1">⭐ {post.author.reputation.toLocaleString()} {t('detail.reputation')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-3">{t('detail.relatedCategories')}</h3>
                <div className="space-y-1">
                  {categories.slice(0, 4).map(cat => (
                    <button
                      key={cat.id}
                      className="w-full px-3 py-1.5 text-left rounded text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
                      onClick={() => router.push(`/community/discussions?category=${cat.slug}`)}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h3 className="text-xs font-medium text-primary mb-2">{t('detail.communityGuidelines')}</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t('guidelines.respectful')}</li>
                  <li>• {t('guidelines.noSpoilers')}</li>
                  <li>• {t('guidelines.stayOnTopic')}</li>
                  <li>• {t('guidelines.noSpam')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
