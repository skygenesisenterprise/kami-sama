'use client'

import * as React from 'react'
import {
  BookOpen,
  Check,
  Eye,
  Hash,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader } from '@/components/dash/page-header'
import { StatusBadge } from '@/components/dash/status-badge'
import {
  MOCK_COLLECTIONS,
  MOCK_COLLECTION_CHARTS,
  MOCK_COLLECTION_SETTINGS,
  COLLECTION_TYPES,
  COLLECTION_TYPE_LABEL,
  COLLECTION_STATUSES,
  COLLECTION_STATUS_LABEL,
  COLLECTION_STATUS_TONE,
  SORT_ORDERS,
  SORT_ORDER_LABEL,
  MOCK_TAGS,
  MOCK_GENRES,
  MOCK_CURATORS,
  getCollectionStats,
  formatNumber,
  type Collection,
  type CollectionSettings,
} from '@/lib/mock-collections'

type SortKey = 'title' | 'views' | 'followers' | 'items' | 'score' | 'updated'
type SortDir = 'asc' | 'desc'
type ViewMode = 'table' | 'grid'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'views', label: 'Views' },
  { value: 'followers', label: 'Followers' },
  { value: 'items', label: 'Items' },
  { value: 'score', label: 'Avg Score' },
  { value: 'updated', label: 'Recently Updated' },
]

export default function CollectionsPage() {
  const [query, setQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [genreFilter, setGenreFilter] = React.useState<string>('all')
  const [tagFilter, setTagFilter] = React.useState<string>('all')
  const [curatorFilter, setCuratorFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('views')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [view, setView] = React.useState<ViewMode>('grid')
  const [inspecting, setInspecting] = React.useState<Collection | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settings, setSettings] = React.useState<CollectionSettings>(
    MOCK_COLLECTION_SETTINGS,
  )

  const stats = React.useMemo(() => getCollectionStats(MOCK_COLLECTIONS), [])

  const filtered = React.useMemo(() => {
    let items = MOCK_COLLECTIONS.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter
      const matchesGenre =
        genreFilter === 'all' || item.genres.includes(genreFilter)
      const matchesTag = tagFilter === 'all' || item.tags.includes(tagFilter)
      const matchesCurator =
        curatorFilter === 'all' || item.curator === curatorFilter
      return (
        matchesQuery &&
        matchesType &&
        matchesStatus &&
        matchesGenre &&
        matchesTag &&
        matchesCurator
      )
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'views':
          cmp = a.totalViews - b.totalViews
          break
        case 'followers':
          cmp = a.totalFollowers - b.totalFollowers
          break
        case 'items':
          cmp = a.itemCount - b.itemCount
          break
        case 'score':
          cmp = a.avgScore - b.avgScore
          break
        case 'updated':
          cmp =
            new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [
    query,
    typeFilter,
    statusFilter,
    genreFilter,
    tagFilter,
    curatorFilter,
    sortKey,
    sortDir,
  ])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Collections"
        description="Manage curated anime collections and lists."
      >
        <div className="flex items-center gap-2">
          <StatusBadge tone="success">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              {stats.publishedCollections} Published
            </span>
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            {stats.totalCollections} total
          </span>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw data-icon="inline-start" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings data-icon="inline-start" />
          Settings
        </Button>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New Collection
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard
          label="Total Collections"
          value={stats.totalCollections}
          icon={<BookOpen className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Published"
          value={stats.publishedCollections}
          icon={<Check className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Total Views"
          value={formatNumber(stats.totalViews)}
          icon={<Eye className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Total Followers"
          value={formatNumber(stats.totalFollowers)}
          icon={<Users className="size-4 text-info" />}
          tone="info"
        />
        <StatCard
          label="Avg Items"
          value={stats.avgItemsPerCollection.toFixed(1)}
          icon={<Hash className="size-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MOCK_COLLECTION_CHARTS.map((chart) => (
          <Card key={chart.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {chart.type === 'line' && <LineChartMock data={chart.data} />}
              {chart.type === 'bar' && <BarChartMock data={chart.data} />}
              {chart.type === 'donut' && <DonutChartMock data={chart.data} />}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All types</SelectItem>
              {COLLECTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {COLLECTION_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All statuses</SelectItem>
              {COLLECTION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {COLLECTION_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All genres</SelectItem>
              {MOCK_GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All tags</SelectItem>
              {MOCK_TAGS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={curatorFilter} onValueChange={setCuratorFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All curators</SelectItem>
              {MOCK_CURATORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
        >
          {sortDir === 'asc' ? '↑' : '↓'}
        </Button>

        <div className="ml-auto">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v: string) => {
              if (v) setView(v as ViewMode)
            }}
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <List />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No collections</EmptyTitle>
            <EmptyDescription>
              No collections match the current filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'table' ? (
        <CollectionsTable items={filtered} onInspect={setInspecting} />
      ) : (
        <CollectionsGrid items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {MOCK_COLLECTIONS.length} collections
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      <CollectionDetailSheet
        item={inspecting}
        onClose={() => setInspecting(null)}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={setSettings}
      />
    </main>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone?: 'neutral' | 'success' | 'info' | 'destructive'
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <p
          className={cn(
            'text-2xl font-bold tracking-tight',
            tone === 'success' && 'text-success',
            tone === 'info' && 'text-info',
            tone === 'destructive' && 'text-destructive',
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function CollectionsTable({
  items,
  onInspect,
}: {
  items: Collection[]
  onInspect: (item: Collection) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead>Collection</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Items</TableHead>
            <TableHead className="hidden lg:table-cell">Views</TableHead>
            <TableHead className="hidden lg:table-cell">Followers</TableHead>
            <TableHead className="hidden xl:table-cell">Score</TableHead>
            <TableHead className="hidden xl:table-cell">Curator</TableHead>
            <TableHead className="hidden xl:table-cell">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <button
                  type="button"
                  className="flex items-center gap-3 text-left"
                  onClick={() => onInspect(item)}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="max-w-64 truncate font-medium hover:underline">
                      {item.title}
                    </span>
                    <span className="max-w-48 truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </button>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="text-xs">
                  {COLLECTION_TYPE_LABEL[item.type]}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="font-mono text-sm">{item.itemCount}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <Eye className="size-3 text-muted-foreground" />
                  <span className="font-mono text-sm">
                    {formatNumber(item.totalViews)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <Users className="size-3 text-muted-foreground" />
                  <span className="font-mono text-sm">
                    {formatNumber(item.totalFollowers)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-warning" />
                  <span className="font-mono text-sm">
                    {item.avgScore > 0 ? item.avgScore.toFixed(2) : '–'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="text-sm">{item.curator}</span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <StatusBadge tone={COLLECTION_STATUS_TONE[item.status]}>
                  {COLLECTION_STATUS_LABEL[item.status]}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onInspect(item)}>
                      <Eye /> View details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pin /> {item.isPinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star /> {item.isFeatured ? 'Unfeature' : 'Feature'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share2 /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CollectionsGrid({
  items,
  onInspect,
}: {
  items: Collection[]
  onInspect: (item: Collection) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-ring/40"
          onClick={() => onInspect(item)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
                <BookOpen className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="line-clamp-1 text-sm font-medium">
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.curator}
                </span>
              </div>
            </div>
            <StatusBadge tone={COLLECTION_STATUS_TONE[item.status]}>
              {COLLECTION_STATUS_LABEL[item.status]}
            </StatusBadge>
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Hash className="size-3" />
              {item.itemCount} items
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {formatNumber(item.totalViews)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {formatNumber(item.totalFollowers)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.updatedAt}</span>
            <Badge variant="secondary" className="text-[10px]">
              {COLLECTION_TYPE_LABEL[item.type]}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}

function CollectionDetailSheet({
  item,
  onClose,
}: {
  item: Collection | null
  onClose: () => void
}) {
  const [pinned, setPinned] = React.useState(false)
  const [featured, setFeatured] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setPinned(item.isPinned)
      setFeatured(item.isFeatured)
    }
  }, [item])

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-2xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={COLLECTION_STATUS_TONE[item.status]}>
                  {COLLECTION_STATUS_LABEL[item.status]}
                </StatusBadge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{COLLECTION_TYPE_LABEL[item.type]}</span>
                <span>·</span>
                <span>{item.curator}</span>
                <span>·</span>
                <span>{item.itemCount} items</span>
              </div>
            </SheetHeader>
            <Tabs defaultValue="analytics" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat label="Total Views" value={formatNumber(item.analytics.totalViews)} />
                    <MiniStat label="Unique Viewers" value={formatNumber(item.analytics.uniqueViewers)} />
                    <MiniStat label="Avg Time Spent" value={`${item.analytics.avgTimeSpent}m`} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat label="Conversion Rate" value={`${item.analytics.conversionRate}%`} />
                    <MiniStat label="Follower Growth" value={`${item.analytics.followerGrowth}%`} />
                    <MiniStat label="Share Rate" value={`${item.analytics.shareRate}%`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Completion Rate" value={`${item.analytics.completionRate}%`} />
                    <MiniStat label="Top Referrer" value={item.analytics.topReferrer} />
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="items" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">
                    Collection Items ({item.items.length})
                  </span>
                  {item.items.length === 0 ? (
                    <div className="rounded-lg border px-3 py-6 text-center text-sm text-muted-foreground">
                      No items in this collection
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {item.items.map((ep) => (
                        <div
                          key={ep.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground">
                              #{ep.order}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {ep.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Added {ep.addedAt}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs">
                              <Star className="size-3 text-warning" />
                              {ep.score > 0 ? ep.score.toFixed(2) : '–'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="info" className="pt-4">
                <FieldGroup>
                  <div>
                    <span className="text-sm font-medium">Description</span>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Sort Order" value={SORT_ORDER_LABEL[item.sortOrder]} />
                    <MiniStat label="Public" value={item.isPublic ? 'Yes' : 'No'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Created" value={item.createdAt} />
                    <MiniStat label="Last Updated" value={item.updatedAt} />
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Tags</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Genres</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.genres.map((g) => (
                        <Badge key={g} variant="outline" className="text-xs">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <div className="flex flex-1 gap-2">
                <Button
                  variant={pinned ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setPinned(!pinned)
                    toast.success(pinned ? 'Unpinned' : 'Pinned')
                  }}
                >
                  {pinned ? (
                    <PinOff data-icon="inline-start" />
                  ) : (
                    <Pin data-icon="inline-start" />
                  )}
                  {pinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button
                  variant={featured ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFeatured(!featured)
                    toast.success(featured ? 'Removed from featured' : 'Featured')
                  }}
                >
                  <Star data-icon="inline-start" />
                  {featured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  )
}

function Separator() {
  return <div className="my-2 h-px bg-border" />
}

function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: CollectionSettings
  onSave: (settings: CollectionSettings) => void
}) {
  const [local, setLocal] = React.useState(settings)

  React.useEffect(() => {
    setLocal(settings)
  }, [settings])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Collection Settings</DialogTitle>
          <DialogDescription>
            Configure how collections are managed and displayed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Max Items Per Collection</FieldLabel>
            <Input
              type="number"
              value={local.maxItemsPerCollection}
              onChange={(e) =>
                setLocal({
                  ...local,
                  maxItemsPerCollection: Number(e.target.value),
                })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Auto Refresh</FieldLabel>
              <Select
                value={local.autoRefreshEnabled ? 'yes' : 'no'}
                onValueChange={(v) =>
                  setLocal({ ...local, autoRefreshEnabled: v === 'yes' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Enabled</SelectItem>
                  <SelectItem value="no">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Refresh Frequency</FieldLabel>
              <Input
                value={local.autoRefreshFrequency}
                onChange={(e) =>
                  setLocal({ ...local, autoRefreshFrequency: e.target.value })
                }
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>Default Sort Order</FieldLabel>
            <Select
              value={local.defaultSortOrder}
              onValueChange={(v) =>
                setLocal({
                  ...local,
                  defaultSortOrder: v as CollectionSettings['defaultSortOrder'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_ORDERS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {SORT_ORDER_LABEL[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Allow Duplicates</FieldLabel>
              <Select
                value={local.allowDuplicates ? 'yes' : 'no'}
                onValueChange={(v) =>
                  setLocal({ ...local, allowDuplicates: v === 'yes' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Require Approval</FieldLabel>
              <Select
                value={local.requireApproval ? 'yes' : 'no'}
                onValueChange={(v) =>
                  setLocal({ ...local, requireApproval: v === 'yes' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel>Featured Threshold (Views)</FieldLabel>
            <Input
              type="number"
              value={local.featuredThreshold}
              onChange={(e) =>
                setLocal({
                  ...local,
                  featuredThreshold: Number(e.target.value),
                })
              }
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(local)
              toast.success('Settings saved')
              onOpenChange(false)
            }}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LineChartMock({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = max - min || 1
  const height = 120
  const width = 100

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d.value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: '120px' }}
      >
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width
          const y = height - ((d.value - min) / range) * height
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="hsl(var(--primary))"
            />
          )
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

function BarChartMock({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-16 text-right text-[10px] text-muted-foreground truncate">
            {d.label}
          </span>
          <div className="flex-1">
            <div className="h-4 rounded bg-muted">
              <div
                className="h-4 rounded bg-primary/70"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="w-12 text-right font-mono text-[10px]">
            {formatNumber(d.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function DonutChartMock({
  data,
}: {
  data: { label: string; value: number; color?: string }[]
}) {
  const total = data.reduce((a, b) => a + b.value, 0)
  let cumulative = 0

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 36 36" className="size-24 shrink-0">
        {data.map((d) => {
          const percent = (d.value / total) * 100
          const dasharray = `${percent} ${100 - percent}`
          const dashoffset = -cumulative
          cumulative += percent
          return (
            <circle
              key={d.label}
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke={d.color || '#6b7280'}
              strokeWidth="3.5"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
            />
          )
        })}
      </svg>
      <div className="flex flex-col gap-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: d.color || '#6b7280' }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-mono">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
