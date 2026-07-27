'use client'

import * as React from 'react'
import {
  Activity,
  CalendarDays,
  Check,
  Eye,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Star,
  Tv,
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
  MOCK_SEASONAL,
  MOCK_SEASONAL_CHARTS,
  MOCK_SEASONAL_SETTINGS,
  SEASONS,
  SEASON_LABEL,
  SEASON_EMOJI,
  YEARS,
  AIRING_STATUSES,
  AIRING_STATUS_LABEL,
  AIRING_STATUS_TONE,
  SEASONAL_CONTENT_TYPES,
  CONTENT_TYPE_LABEL,
  MOCK_GENRES,
  MOCK_PROVIDERS,
  MOCK_STUDIOS,
  getSeasonalStats,
  formatNumber,
  type SeasonalAnime,
  type Season,
  type SeasonalSettings,
} from '@/lib/mock-seasonal'

type SortKey = 'rank' | 'title' | 'score' | 'members' | 'popularity'
type SortDir = 'asc' | 'desc'
type ViewMode = 'table' | 'grid'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rank', label: 'Rank' },
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
  { value: 'members', label: 'Members' },
  { value: 'popularity', label: 'Popularity' },
]

export default function SeasonalPage() {
  const [query, setQuery] = React.useState('')
  const [season, setSeason] = React.useState<Season>('summer')
  const [year, setYear] = React.useState(2026)
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [genreFilter, setGenreFilter] = React.useState<string>('all')
  const [studioFilter, setStudioFilter] = React.useState<string>('all')
  const [providerFilter, setProviderFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('rank')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<ViewMode>('table')
  const [inspecting, setInspecting] = React.useState<SeasonalAnime | null>(
    null,
  )
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settings, setSettings] = React.useState<SeasonalSettings>(
    MOCK_SEASONAL_SETTINGS,
  )

  const stats = React.useMemo(() => getSeasonalStats(MOCK_SEASONAL), [])

  const filtered = React.useMemo(() => {
    let items = MOCK_SEASONAL.filter((item) => {
      const matchesQuery = item.title
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesSeason = item.season === season && item.year === year
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesStatus =
        statusFilter === 'all' || item.airingStatus === statusFilter
      const matchesGenre =
        genreFilter === 'all' || item.genres.includes(genreFilter)
      const matchesStudio =
        studioFilter === 'all' || item.studio === studioFilter
      const matchesProvider =
        providerFilter === 'all' || item.provider === providerFilter
      return (
        matchesQuery &&
        matchesSeason &&
        matchesType &&
        matchesStatus &&
        matchesGenre &&
        matchesStudio &&
        matchesProvider
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
          cmp = a.score - b.score
          break
        case 'members':
          cmp = a.members - b.members
          break
        case 'popularity':
          cmp = a.popularity - b.popularity
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [
    query,
    season,
    year,
    typeFilter,
    statusFilter,
    genreFilter,
    studioFilter,
    providerFilter,
    sortKey,
    sortDir,
  ])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title={`${SEASON_EMOJI[season]} ${SEASON_LABEL[season]} ${year}`}
        description="Track and manage seasonal anime releases and schedules."
      >
        <div className="flex items-center gap-2">
          <StatusBadge tone="success">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Season Active
            </span>
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            Updated 2h ago
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
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
        <StatCard
          label="Total Anime"
          value={stats.totalAnime}
          icon={<Tv className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Currently Airing"
          value={stats.currentlyAiring}
          icon={<Activity className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          icon={<CalendarDays className="size-4 text-info" />}
          tone="info"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<Check className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Avg Score"
          value={`${stats.avgScore.toFixed(2)}`}
          icon={<Star className="size-4 text-warning" />}
        />
        <StatCard
          label="Total Members"
          value={formatNumber(stats.totalMembers)}
          icon={<Eye className="size-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MOCK_SEASONAL_CHARTS.map((chart) => (
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
            placeholder="Search seasonal anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <div className="flex gap-1 rounded-lg border p-1">
          {SEASONS.map((s) => (
            <Button
              key={s}
              variant={season === s ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSeason(s)}
            >
              {SEASON_EMOJI[s]} {SEASON_LABEL[s]}
            </Button>
          ))}
        </div>

        <Select
          value={year.toString()}
          onValueChange={(v) => setYear(Number(v))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All types</SelectItem>
              {SEASONAL_CONTENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {CONTENT_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All statuses</SelectItem>
              {AIRING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {AIRING_STATUS_LABEL[s]}
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

        <Select value={studioFilter} onValueChange={setStudioFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All studios</SelectItem>
              {MOCK_STUDIOS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
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
            <EmptyTitle>No seasonal content</EmptyTitle>
            <EmptyDescription>
              No anime found for {SEASON_LABEL[season]} {year} with the current
              filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'table' ? (
        <SeasonalTable items={filtered} onInspect={setInspecting} />
      ) : (
        <SeasonalGrid items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {MOCK_SEASONAL.length} seasonal items
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

      <SeasonalDetailSheet
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

function SeasonalTable({
  items,
  onInspect,
}: {
  items: SeasonalAnime[]
  onInspect: (item: SeasonalAnime) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Score</TableHead>
            <TableHead className="hidden md:table-cell">Episodes</TableHead>
            <TableHead className="hidden lg:table-cell">Studio</TableHead>
            <TableHead className="hidden lg:table-cell">Type</TableHead>
            <TableHead className="hidden xl:table-cell">Status</TableHead>
            <TableHead className="hidden xl:table-cell">Members</TableHead>
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
                      {item.premiereDate}
                    </span>
                  </div>
                </button>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-warning" />
                  <span className="font-mono text-sm font-bold">
                    {item.score > 0 ? item.score.toFixed(2) : '–'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <span className="font-mono text-sm">
                    {item.airedEpisodes}/{item.episodes}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.airingStatus === 'upcoming'
                      ? 'Premieres soon'
                      : item.airingStatus === 'completed'
                        ? 'Complete'
                        : `${item.episodes - item.airedEpisodes} remaining`}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm">{item.studio}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline" className="text-xs">
                  {CONTENT_TYPE_LABEL[item.type]}
                </Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <StatusBadge tone={AIRING_STATUS_TONE[item.airingStatus]}>
                  {AIRING_STATUS_LABEL[item.airingStatus]}
                </StatusBadge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="font-mono text-sm">
                  {formatNumber(item.members)}
                </span>
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

function SeasonalGrid({
  items,
  onInspect,
}: {
  items: SeasonalAnime[]
  onInspect: (item: SeasonalAnime) => void
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
                  {item.studio}
                </span>
              </div>
            </div>
            <StatusBadge tone={AIRING_STATUS_TONE[item.airingStatus]}>
              {AIRING_STATUS_LABEL[item.airingStatus]}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Star className="size-3 text-warning" />
              {item.score > 0 ? item.score.toFixed(2) : '–'}
            </span>
            <span className="flex items-center gap-1">
              <Tv className="size-3" />
              {item.airedEpisodes}/{item.episodes} eps
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {formatNumber(item.members)}
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
            <span>{item.premiereDate}</span>
            <Badge variant="secondary" className="text-[10px]">
              {CONTENT_TYPE_LABEL[item.type]}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}

function SeasonalDetailSheet({
  item,
  onClose,
}: {
  item: SeasonalAnime | null
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
                <StatusBadge tone={AIRING_STATUS_TONE[item.airingStatus]}>
                  {AIRING_STATUS_LABEL[item.airingStatus]}
                </StatusBadge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Rank #{item.rank}</span>
                <span>·</span>
                <span>{item.studio}</span>
                <span>·</span>
                <span>
                  {SEASON_EMOJI[item.season]} {SEASON_LABEL[item.season]}{' '}
                  {item.year}
                </span>
              </div>
            </SheetHeader>
            <Tabs defaultValue="analytics" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="episodes">Episodes</TabsTrigger>
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
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat label="Reviews" value={formatNumber(item.analytics.reviewCount)} />
                    <MiniStat label="Avg Rating" value={`${item.analytics.averageRating}/5`} />
                    <MiniStat label="Peak Concurrent" value={formatNumber(item.analytics.peakConcurrent)} />
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="schedule" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Premiere Date" value={item.premiereDate} />
                    <MiniStat
                      label="End Date"
                      value={item.endDate || 'TBD'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat
                      label="Episodes"
                      value={`${item.airedEpisodes}/${item.episodes}`}
                    />
                    <MiniStat
                      label="Status"
                      value={AIRING_STATUS_LABEL[item.airingStatus]}
                    />
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Progress</span>
                    <div className="mt-2">
                      <div className="h-3 rounded-full bg-muted">
                        <div
                          className="h-3 rounded-full bg-primary"
                          style={{
                            width: `${item.episodes > 0 ? (item.airedEpisodes / item.episodes) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>
                          {item.airedEpisodes} aired
                        </span>
                        <span>
                          {item.episodes - item.airedEpisodes} remaining
                        </span>
                      </div>
                    </div>
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="info" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Studio" value={item.studio} />
                    <MiniStat label="Source" value={item.source} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Rating" value={item.rating} />
                    <MiniStat label="Score" value={item.score > 0 ? item.score.toFixed(2) : 'Not yet rated'} />
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
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Countries</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.countries.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Members" value={formatNumber(item.members)} />
                    <MiniStat label="Favorites" value={formatNumber(item.favorites)} />
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="episodes" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">
                    Episode History
                  </span>
                  {item.episodesList.length === 0 ? (
                    <div className="rounded-lg border px-3 py-6 text-center text-sm text-muted-foreground">
                      {item.airingStatus === 'upcoming'
                        ? 'No episodes aired yet'
                        : 'Episode data not available'}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {item.episodesList.map((ep) => (
                        <div
                          key={ep.number}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground">
                              EP{ep.number}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {ep.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {ep.airDate}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-xs">
                              {formatNumber(ep.views)} views
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                              <Star className="size-3 text-warning" />
                              {ep.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
  settings: SeasonalSettings
  onSave: (settings: SeasonalSettings) => void
}) {
  const [local, setLocal] = React.useState(settings)

  React.useEffect(() => {
    setLocal(settings)
  }, [settings])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seasonal Settings</DialogTitle>
          <DialogDescription>
            Configure how seasonal content is displayed and managed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Auto Update Frequency</FieldLabel>
            <Input
              value={local.autoUpdateFrequency}
              onChange={(e) =>
                setLocal({ ...local, autoUpdateFrequency: e.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Highlight Threshold (Score)</FieldLabel>
            <Input
              type="number"
              value={local.highlightThreshold}
              onChange={(e) =>
                setLocal({
                  ...local,
                  highlightThreshold: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Max Featured</FieldLabel>
            <Input
              type="number"
              value={local.maxFeatured}
              onChange={(e) =>
                setLocal({ ...local, maxFeatured: Number(e.target.value) })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Show Score</FieldLabel>
              <Select
                value={local.showScore ? 'yes' : 'no'}
                onValueChange={(v) =>
                  setLocal({ ...local, showScore: v === 'yes' })
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
              <FieldLabel>Show Members</FieldLabel>
              <Select
                value={local.showMembers ? 'yes' : 'no'}
                onValueChange={(v) =>
                  setLocal({ ...local, showMembers: v === 'yes' })
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
            <FieldLabel>Default Sort</FieldLabel>
            <Select
              value={local.defaultSort}
              onValueChange={(v) =>
                setLocal({
                  ...local,
                  defaultSort: v as SeasonalSettings['defaultSort'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="episodes">Episodes</SelectItem>
              </SelectContent>
            </Select>
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
