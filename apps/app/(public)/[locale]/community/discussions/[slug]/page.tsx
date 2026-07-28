'use client'

import * as React from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Post, type Comment, type ReactionType } from '@/lib/community-forum-data'
import { UserAvatar } from '@/components/kami/user-avatar'
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
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months}mo`
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
/*  Comment — Reddit style                                                     */
/* -------------------------------------------------------------------------- */

function CommentItem({ comment, depth = 0, t }: { comment: Comment; depth?: number; t: (k: string) => string }) {
  const [showReply, setShowReply] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className={cn('flex gap-0', depth > 0 && 'ml-5')}>
      {/* Thread line */}
      <div className="flex flex-col items-center">
        <div className={cn('w-5 h-5 flex items-center justify-center', depth === 0 && 'invisible')}>
          <div className="w-px h-full bg-line-strong hover:bg-primary cursor-pointer transition-colors" />
        </div>
        {depth > 0 && (
          <button
            className="flex-1 w-px bg-line-strong hover:bg-primary cursor-pointer transition-colors min-h-5"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-2">
        {/* Comment header */}
        <div className="flex items-center gap-1.5 text-xs py-1">
          <UserAvatar user={comment.author} className="size-5" />
          <span className={cn(
            'font-bold hover:underline cursor-pointer',
            comment.author.role === 'moderator' && 'text-cyan-500',
            comment.author.role === 'admin' && 'text-amber-500',
          )}>
            {comment.author.displayName}
          </span>
          {comment.author.role === 'moderator' && <Badge className="bg-cyan-500/15 text-cyan-500 text-[9px] px-1 py-0 h-3.5 font-semibold">Mod</Badge>}
          {comment.author.role === 'admin' && <Badge className="bg-amber-500/15 text-amber-500 text-[9px] px-1 py-0 h-3.5 font-semibold">Admin</Badge>}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          {comment.hasSpoilers && (
            <Badge className="bg-red-500/15 text-red-500 text-[9px] px-1 py-0 h-3.5 font-semibold">⚠ Spoilers</Badge>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              [+] {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Comment body */}
        {!collapsed && (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

            {/* Action bar */}
            <div className="flex items-center gap-0.5 mt-1 -ml-1">
              <div className="flex items-center">
                <VoteArrows count={comment.totalReactions} direction="horizontal" />
              </div>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setShowReply(!showReply)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Reply
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            {/* Reply box */}
            {showReply && (
              <div className="mt-2 pl-2">
                <div className="border border-line rounded-md overflow-hidden focus-within:border-primary/50 transition-colors">
                  <Textarea
                    placeholder={`Comment as u/${communityData.users[0]?.username || 'you'}`}
                    className="text-sm min-h-20 border-0 focus-visible:ring-0 bg-transparent"
                  />
                  <div className="flex justify-end gap-2 p-2 bg-muted/30 border-t border-line">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowReply(false)}>Cancel</Button>
                    <Button size="sm" className="h-7 text-xs">Reply</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} t={t} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Comment Sort Bar                                                           */
/* -------------------------------------------------------------------------- */

type CommentSort = 'best' | 'top' | 'new' | 'controversial'

function CommentSortBar({ active, onChange }: { active: CommentSort; onChange: (s: CommentSort) => void }) {
  const options: { key: CommentSort; label: string }[] = [
    { key: 'best', label: 'Best' },
    { key: 'top', label: 'Top' },
    { key: 'new', label: 'New' },
    { key: 'controversial', label: 'Controversial' },
  ]

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-muted-foreground mr-1">Sort by:</span>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-2 py-1 rounded-sm font-medium transition-colors',
            active === opt.key ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

function PostSidebar({ post, categories, locale, t }: {
  post: Post
  categories: typeof communityData.categories
  locale: string
  t: (k: string) => string
}) {
  return (
    <div className="space-y-4">
      {/* About Community */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="bg-primary/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{post.category.icon}</span>
            <span className="font-bold text-sm">r/KamiSama</span>
          </div>
        </div>
        <div className="p-3 text-xs text-muted-foreground leading-relaxed">
          {post.category.description}
        </div>
        <div className="px-3 pb-3">
          <Button className="w-full" size="sm">Join</Button>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-line">
          <h3 className="font-bold text-xs">r/KamiSama Rules</h3>
        </div>
        <div className="p-2">
          {[
            'Be respectful and civil',
            'No piracy or illegal content',
            'Use spoiler tags appropriately',
            'No self-promotion spam',
            'Search before posting',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 px-2 py-1 text-xs">
              <span className="font-bold text-muted-foreground">{i + 1}.</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-line">
          <h3 className="font-bold text-xs">Tags</h3>
        </div>
        <div className="p-3 flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Related Categories */}
      <div className="rounded-md border border-line bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-line">
          <h3 className="font-bold text-xs">Categories</h3>
        </div>
        <div className="p-1">
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 rounded-sm transition-colors"
              onClick={() => {}}
            >
              <span>{cat.icon}</span>
              <span className="flex-1 text-left">{cat.name}</span>
              <span className="opacity-50">{cat.postCount}</span>
            </button>
          ))}
        </div>
      </div>
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
  const locale = pathname.split('/')[1] || 'en'
  const params = useParams()
  const { posts, categories } = communityData

  const slug = params.slug as string
  const post = posts.find(p => p.slug === slug || p.id === slug)

  const [newComment, setNewComment] = React.useState('')
  const [commentSort, setCommentSort] = React.useState<CommentSort>('best')

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <Button variant="ghost" onClick={() => router.push(`/${locale}/community/discussions`)}>
            Back to discussions
          </Button>
        </div>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Content */}
      <div className="max-w-300 mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <button
                onClick={() => router.push(`/${locale}/community`)}
                className="hover:text-foreground transition-colors font-medium"
              >
                r/KamiSama
              </button>
              <span>/</span>
              <span className="text-foreground">Posts</span>
            </div>

            {/* Post */}
            <div className="flex gap-2 p-3 rounded-md border border-line bg-card">
              <VoteArrows count={post.totalReactions} />

              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                  <span className="font-bold text-foreground">{post.category.name}</span>
                  <span>·</span>
                  <span>Posted by</span>
                  <span className="hover:underline cursor-pointer">u/{post.author.username}</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>

                {/* Title */}
                <h1 className="text-lg font-bold mt-1 leading-snug">
                  {post.isPinned && <span className="text-primary mr-1.5">📌</span>}
                  {post.hasSpoilers && <span className="text-red-500 mr-1.5">⚠</span>}
                  {post.title}
                </h1>

                {/* Content */}
                <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {post.content}
                </div>

                {/* Content link */}
                {post.contentLink && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted border border-line">📎 {post.contentLink.title} ({post.contentLink.year})</span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs text-primary/80 hover:text-primary cursor-pointer">#{tag}</span>
                  ))}
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-1 mt-3 -ml-1 border-t border-line pt-2">
                  <span className="text-xs text-muted-foreground px-2">
                    💬 {post.commentCount} Comments
                  </span>
                  <span className="text-xs text-muted-foreground px-2">
                    👁 {post.views.toLocaleString()} Views
                  </span>
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

            {/* Comment input */}
            <div className="mt-3 rounded-md border border-line bg-card p-3">
              <div className="text-xs text-muted-foreground mb-2">
                Comment as <span className="text-primary font-medium">u/{communityData.users[0]?.username || 'you'}</span>
              </div>
              <div className="border border-line rounded-md overflow-hidden focus-within:border-primary/50 transition-colors">
                <Textarea
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-sm min-h-25 border-0 focus-visible:ring-0 bg-transparent"
                />
                <div className="flex justify-end p-2 bg-muted/30 border-t border-line">
                  <Button size="sm" className="h-7 text-xs" disabled={!newComment.trim()}>Comment</Button>
                </div>
              </div>
            </div>

            {/* Comment sort */}
            <div className="mt-4 mb-3">
              <CommentSortBar active={commentSort} onChange={setCommentSort} />
            </div>

            {/* Comments */}
            <div className="space-y-0">
              {mockReplies.map(c => (
                <CommentItem key={c.id} comment={c} t={t} />
              ))}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-77.5 shrink-0">
            <div className="sticky top-4">
              <PostSidebar post={post} categories={categories} locale={locale} t={t} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
