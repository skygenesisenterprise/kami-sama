'use client'

import * as React from 'react'
import {
  Activity,
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BarChart4,
  BarChartBig,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Hash,
  Info,
  LineChart,
  List,
  LayoutGrid,
  MoreHorizontal,
  Music,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  X,
  Zap,
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
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader } from '@/components/dash/page-header'
import { StatusBadge } from '@/components/dash/status-badge'
import {
  MOCK_TRENDING,
  MOCK_TRENDING_CHARTS,
  MOCK_TRENDING_SETTINGS,
  MOCK_GENRES,
  MOCK_PROVIDERS,
  MOCK_COUNTRIES,
  COUNTRY_LABEL,
  TRENDING_PERIODS,
  TRENDING_CONTENT_TYPES,
  TRENDING_STATUS_LABEL,
  TRENDING_STATUS_TONE,
  CONTENT_TYPE_LABEL,
  getTrendingStats,
  formatNumber,
  type TrendingContent,
  type TrendingPeriod,
  type TrendingContentType,
  type TrendingSettings,
} from '@/lib/mock-trending'

type SortKey = 'rank' | 'title' | 'score' | 'views' | 'growth'
type SortDir = 'asc' | 'desc'
type ViewMode = 'table' | 'grid'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rank', label: 'Rank' },
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Trend Score' },
  { value: 'views', label: 'Views' },
  { value: 'growth', label: 'Growth' },
]

export default function TrendingPage() {
  const [query, setQuery] = React.useState('')
  const [period, setPeriod] = React.useState<TrendingPeriod>('7d')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [countryFilter, setCountryFilter] = React.useState<string>('all')
  const [genreFilter, setGenreFilter] = React.useState<string>('all')
  const [providerFilter, setProviderFilter] = React.useState<string>('all')
  const [scoreFilter, setScoreFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('rank')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<ViewMode>('table')
  const [inspecting, setInspecting] = React.useState<TrendingContent | null>(
    null,
  )
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settings, setSettings] = React.useState<TrendingSettings>(
    MOCK_TRENDING_SETTINGS,
  )

  const stats = React.useMemo(() => getTrendingStats(MOCK_TRENDING), [])

  const filtered = React.useMemo(() => {
    let items = MOCK_TRENDING.filter((item) => {
      const matchesQuery = item.title
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesCountry =
        countryFilter === 'all' || item.countries.includes(countryFilter)
      const matchesGenre =
        genreFilter === 'all' || item.genres.includes(genreFilter)
      const matchesProvider =
        providerFilter === 'all' || item.provider === providerFilter
      const matchesScore =
        scoreFilter === 'all' ||
        (scoreFilter === 'high' && item.trendScore >= 9000) ||
        (scoreFilter === 'medium' &&
          item.trendScore >= 7000 &&
          item.trendScore < 9000) ||
        (scoreFilter === 'low' && item.trendScore < 7000)
      return (
        matchesQuery &&
        matchesType &&
        matchesCountry &&
        matchesGenre &&
        matchesProvider &&
        matchesScore
      )
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'rank':
          cmp = a.rank - b.rank
          break
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'score':
          cmp = a.trendScore - b.trendScore
          break
        case 'views':
          cmp = a.views - b.views
          break
        case 'growth':
          cmp = a.growth - b.growth
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [
    query,
    typeFilter,
    countryFilter,
    genreFilter,
    providerFilter,
    scoreFilter,
    sortKey,
    sortDir,
  ])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Trending"
        description="Monitor and manage trending content across the platform."
      >
        <div className="flex items-center gap-2">
          <StatusBadge tone="success">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Engine Active
            </span>
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            Updated 2m ago
          </span>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw data-icon="inline-start" />
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Sparkles data-icon="inline-start" />
          Recalculate
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings data-icon="inline-start" />
          Settings
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard
          label="Trending Now"
          value={stats.totalTrending}
          icon={<TrendingUp className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Total Views"
          value={formatNumber(stats.totalViews)}
          icon={<Eye className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Avg Growth"
          value={`${stats.avgGrowth.toFixed(1)}%`}
          icon={<ArrowUpRight className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Avg Watch Time"
          value={`${stats.avgWatchTime.toFixed(1)}m`}
          icon={<Clock className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Countries"
          value={stats.countriesActive}
          icon={<Globe className="size-4 text-info" />}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MOCK_TRENDING_CHARTS.map((chart) => (
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
            placeholder="Search trending..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <div className="flex gap-1 rounded-lg border p-1">
          {TRENDING_PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All types</SelectItem>
              {TRENDING_CONTENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {CONTENT_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All countries</SelectItem>
              {MOCK_COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {COUNTRY_LABEL[c]}
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

        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All providers</SelectItem>
              {MOCK_PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={scoreFilter} onValueChange={setScoreFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All scores</SelectItem>
              <SelectItem value="high">High (9000+)</SelectItem>
              <SelectItem value="medium">Medium (7000-9000)</SelectItem>
              <SelectItem value="low">Low (&lt;7000)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-36">
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
            <EmptyTitle>No trending content</EmptyTitle>
            <EmptyDescription>
              No trending items match the current filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'table' ? (
        <TrendingTable items={filtered} onInspect={setInspecting} />
      ) : (
        <TrendingGrid items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {MOCK_TRENDING.length} trending items
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

      <TrendingDetailSheet
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

function TrendingTable({
  items,
  onInspect,
}: {
  items: TrendingContent[]
  onInspect: (item: TrendingContent) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="hidden md:table-cell">Score</TableHead>
            <TableHead className="hidden md:table-cell">Views</TableHead>
            <TableHead className="hidden md:table-cell">Growth</TableHead>
            <TableHead className="hidden lg:table-cell">Type</TableHead>
            <TableHead className="hidden lg:table-cell">Countries</TableHead>
            <TableHead className="hidden xl:table-cell">Updated</TableHead>
            <TableHead className="hidden xl:table-cell">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <span className="text-sm font-bold text-muted-foreground">
                  {item.rank}
                </span>
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  className="flex items-center gap-3 text-left"
                  onClick={() => onInspect(item)}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
                    {item.rank}
                  </div>
                  <div className="flex flex-col">
                    <span className="max-w-64 truncate font-medium hover:underline">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.provider}
                    </span>
                  </div>
                </button>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Sparkles className="size-3 text-warning" />
                  <span className="font-mono text-sm font-bold">
                    {formatNumber(item.trendScore)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <span className="font-mono text-sm">
                    {formatNumber(item.views)}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      item.viewsChange >= 0
                        ? 'text-success'
                        : 'text-destructive',
                    )}
                  >
                    {item.viewsChange >= 0 ? '+' : ''}
                    {item.viewsChange}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  {item.growth >= 0 ? (
                    <ArrowUpRight className="size-3 text-success" />
                  ) : (
                    <ArrowDownRight className="size-3 text-destructive" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      item.growth >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {item.growth >= 0 ? '+' : ''}
                    {item.growth}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline" className="text-xs">
                  {CONTENT_TYPE_LABEL[item.type]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex gap-1">
                  {item.countries.slice(0, 3).map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                  {item.countries.length > 3 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{item.countries.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">
                {item.updatedAt}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <StatusBadge tone={TRENDING_STATUS_TONE[item.status]}>
                  {TRENDING_STATUS_LABEL[item.status]}
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
                      <Zap /> {item.isBoosted ? 'Remove boost' : 'Boost'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <EyeOff /> {item.isHidden ? 'Unhide' : 'Hide'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive />{' '}
                      {item.isExcluded ? 'Include' : 'Exclude'}
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

function TrendingGrid({
  items,
  onInspect,
}: {
  items: TrendingContent[]
  onInspect: (item: TrendingContent) => void
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
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-sm font-bold">
                #{item.rank}
              </div>
              <div className="flex flex-col">
                <span className="line-clamp-1 text-sm font-medium">
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.provider}
                </span>
              </div>
            </div>
            <StatusBadge tone={TRENDING_STATUS_TONE[item.status]}>
              {TRENDING_STATUS_LABEL[item.status]}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-warning" />
              {formatNumber(item.trendScore)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {formatNumber(item.views)}
            </span>
            <span
              className={cn(
                'flex items-center gap-1',
                item.growth >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {item.growth >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {item.growth >= 0 ? '+' : ''}
              {item.growth}%
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.genres.slice(0, 2).map((g) => (
              <Badge key={g} variant="outline" className="text-[10px]">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.updatedAt}</span>
            <div className="flex gap-1">
              {item.countries.slice(0, 3).map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function TrendingDetailSheet({
  item,
  onClose,
}: {
  item: TrendingContent | null
  onClose: () => void
}) {
  const [pinned, setPinned] = React.useState(false)
  const [boosted, setBoosted] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const [excluded, setExcluded] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setPinned(item.isPinned)
      setBoosted(item.isBoosted)
      setHidden(item.isHidden)
      setExcluded(item.isExcluded)
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
                <StatusBadge tone={TRENDING_STATUS_TONE[item.status]}>
                  {TRENDING_STATUS_LABEL[item.status]}
                </StatusBadge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Rank #{item.rank}</span>
                <span>·</span>
                <span>{item.provider}</span>
                <span>·</span>
                <span>{item.updatedAt}</span>
              </div>
            </SheetHeader>
            <Tabs defaultValue="analytics" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="discovery">Discovery</TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat label="Total Views" value={formatNumber(item.analytics.totalViews)} />
                    <MiniStat label="Unique Viewers" value={formatNumber(item.analytics.uniqueViewers)} />
                    <MiniStat label="Avg Watch Time" value={`${item.analytics.avgWatchTime}m`} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat label="Completion Rate" value={`${item.analytics.completionRate}%`} />
                    <MiniStat label="Favorite Rate" value={`${item.analytics.favoriteRate}%`} />
                    <MiniStat label="Share Rate" value={`${item.analytics.shareRate}%`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Reviews" value={formatNumber(item.analytics.reviewCount)} />
                    <MiniStat label="Avg Rating" value={`${item.analytics.averageRating}/5`} />
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="discovery" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Discovery Score</span>
                    <Badge variant="secondary" className="font-mono">
                      {item.discoveryScore}/100
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Trend Score</span>
                    <Badge variant="secondary" className="font-mono">
                      {formatNumber(item.trendScore)}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Why it's trending</span>
                    <ul className="mt-2 flex flex-col gap-2">
                      {item.trendReasons.map((reason, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Sparkles className="mt-0.5 size-3 shrink-0 text-warning" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Genres</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.genres.map((g) => (
                        <Badge key={g} variant="secondary">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="ranking" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">Ranking History</span>
                  <div className="flex flex-col gap-2">
                    {item.rankingHistory.map((entry) => (
                      <div
                        key={entry.date}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <span className="text-xs text-muted-foreground">
                          {entry.date}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">
                            Rank #{entry.rank}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatNumber(entry.score)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="sources" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">
                    Source Breakdown
                  </span>
                  <div className="flex flex-col gap-2">
                    {item.sources.map((source) => (
                      <div key={source.source} className="flex items-center gap-3">
                        <span className="w-24 text-xs capitalize text-muted-foreground">
                          {source.source}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${source.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-xs">
                          {source.percentage}%
                        </span>
                      </div>
                    ))}
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
                  variant={boosted ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setBoosted(!boosted)
                    toast.success(boosted ? 'Boost removed' : 'Boosted')
                  }}
                >
                  <Zap data-icon="inline-start" />
                  {boosted ? 'Unboost' : 'Boost'}
                </Button>
                <Button
                  variant={hidden ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setHidden(!hidden)
                    toast.success(hidden ? 'Unhidden' : 'Hidden')
                  }}
                >
                  {hidden ? (
                    <Eye data-icon="inline-start" />
                  ) : (
                    <EyeOff data-icon="inline-start" />
                  )}
                  {hidden ? 'Unhide' : 'Hide'}
                </Button>
                <Button
                  variant={excluded ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setExcluded(!excluded)
                    toast.success(excluded ? 'Included' : 'Excluded')
                  }}
                >
                  <Archive data-icon="inline-start" />
                  {excluded ? 'Include' : 'Exclude'}
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
  settings: TrendingSettings
  onSave: (settings: TrendingSettings) => void
}) {
  const [local, setLocal] = React.useState(settings)

  React.useEffect(() => {
    setLocal(settings)
  }, [settings])

  const totalWeight = Object.values(local.weights).reduce((a, b) => a + b, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trending Engine Settings</DialogTitle>
          <DialogDescription>
            Configure how trending scores are calculated.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score Weights</span>
              <Badge variant={totalWeight === 100 ? 'secondary' : 'destructive'}>
                Total: {totalWeight}%
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(local.weights).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-28 text-xs capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={value}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        weights: {
                          ...local.weights,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-8 text-right font-mono text-xs">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Recalculation</FieldLabel>
              <Input readOnly defaultValue={local.recalculationFrequency} />
            </Field>
            <Field>
              <FieldLabel>Decay Factor</FieldLabel>
              <Input readOnly defaultValue={local.decayFactor} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Min Threshold</FieldLabel>
              <Input readOnly defaultValue={local.minimumThreshold} />
            </Field>
            <Field>
              <FieldLabel>Max Items</FieldLabel>
              <Input readOnly defaultValue={local.maxTrendingItems} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Boost Multiplier</FieldLabel>
              <Input readOnly defaultValue={`${local.boostMultiplier}x`} />
            </Field>
            <Field>
              <FieldLabel>Pin Priority</FieldLabel>
              <Input readOnly defaultValue={local.pinPriority ? 'Yes' : 'No'} />
            </Field>
          </div>
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
