'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { communityData, type Post, type Category } from '@/lib/community-forum-data'
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

type SortMode = 'recent' | 'popular' | 'unanswered'

/* -------------------------------------------------------------------------- */
/*  Post Row                                                                   */
/* -------------------------------------------------------------------------- */

function PostRow({ post, t }: { post: Post; t: (k: string) => string }) {
  const router = useRouter()
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0"
      onClick={() => router.push(`/community/discussions/${post.slug}`)}
    >
      <UserAvatar user={post.author} className="size-6" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {post.isPinned && <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs">Pinned</Badge>}
          {post.hasSpoilers && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">⚠ Spoilers</Badge>}
          <Badge variant="outline" className="text-xs">{post.category.icon} {post.category.name}</Badge>
        </div>
        <h3 className="font-semibold text-sm mt-1 line-clamp-1">{post.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.author.displayName}</span>
          <span>{timeAgo(post.createdAt)}</span>
          <span>💬 {post.commentCount}</span>
          <span>❤️ {post.totalReactions}</span>
          <span>👁 {post.views}</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Category Sidebar Item                                                      */
/* -------------------------------------------------------------------------- */

function CategoryItem({ cat, active, onClick, t }: { cat: Category; active: boolean; onClick: () => void; t: (k: string) => string }) {
  return (
    <button
      className={cn(
        'w-full px-3 py-2 text-left rounded-lg text-sm transition-colors',
        active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span>{cat.icon}</span>
        <span className="flex-1">{cat.name}</span>
        <span className="text-xs opacity-60">{cat.postCount}</span>
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DiscussionsPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { posts, categories } = communityData

  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(searchParams.get('category'))
  const [sort, setSort] = React.useState<SortMode>('recent')

  const filtered = React.useMemo(() => {
    let result = posts.filter(p => p.type !== 'announcement')
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.displayName.toLowerCase().includes(q)
      )
    }
    if (selectedCategory) {
      result = result.filter(p => p.category.slug === selectedCategory)
    }
    switch (sort) {
      case 'popular':
        result.sort((a, b) => b.totalReactions - a.totalReactions)
        break
      case 'unanswered':
        result = result.filter(p => p.commentCount === 0)
        break
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    // Pinned always first
    const pinned = result.filter(p => p.isPinned)
    const unpinned = result.filter(p => !p.isPinned)
    return [...pinned, ...unpinned]
  }, [posts, search, selectedCategory, sort])

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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('discussions.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('discussions.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <Input
              placeholder={t('discussions.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />

            {/* Sort */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">{t('discussions.sortBy')}</div>
              <div className="space-y-1">
                {(['recent', 'popular', 'unanswered'] as SortMode[]).map(s => (
                  <button
                    key={s}
                    className={cn(
                      'w-full px-3 py-1.5 text-left rounded text-sm transition-colors',
                      sort === s ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                    )}
                    onClick={() => setSort(s)}
                  >
                    {t(`discussions.sort.${s}`)}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">{t('discussions.categories')}</div>
              <div className="space-y-1">
                <CategoryItem
                  cat={{ id: 'all', name: t('discussions.allCategories'), slug: '', description: '', icon: '📋', color: '#6b7280', postCount: posts.length, lastActivity: null }}
                  active={selectedCategory === null}
                  onClick={() => setSelectedCategory(null)}
                  t={t}
                />
                {categories.map(cat => (
                  <CategoryItem
                    key={cat.id}
                    cat={cat}
                    active={selectedCategory === cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t('discussions.noResults')}
                  </div>
                ) : (
                  filtered.map(p => <PostRow key={p.id} post={p} t={t} />)
                )}
              </CardContent>
            </Card>
            <div className="text-xs text-muted-foreground mt-2 text-right">
              {filtered.length} {t('discussions.resultCount')}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
