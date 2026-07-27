'use client'

import * as React from 'react'
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  Beaker,
  Brain,
  Check,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Layers,
  List,
  LayoutGrid,
  MoreHorizontal,
  PieChart,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader } from '@/components/dash/page-header'
import { StatusBadge } from '@/components/dash/status-badge'
import {
  MOCK_RECOMMENDATIONS,
  MOCK_POOL_INFO,
  RECOMMENDATION_POOL_LABEL,
  RECOMMENDATION_TYPE_LABEL,
  RECOMMENDATION_STATUS_LABEL,
  RECOMMENDATION_STATUS_TONE,
  getRecommendationStats,
  formatNumber,
  type RecommendationItem,
  type RecommendationPool,
  type RecommendationType,
  type RecommendationStatus,
} from '@/lib/mock-recommendations'

type SortKey = 'title' | 'ctr' | 'relevance' | 'impressions' | 'clicks'
type SortDir = 'asc' | 'desc'
type ViewMode = 'table' | 'grid'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'ctr', label: 'CTR' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'clicks', label: 'Clicks' },
]

export default function RecommendationsPage() {
  const [query, setQuery] = React.useState('')
  const [poolFilter, setPoolFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('ctr')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [view, setView] = React.useState<ViewMode>('table')
  const [inspecting, setInspecting] =
    React.useState<RecommendationItem | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  const stats = React.useMemo(
    () => getRecommendationStats(MOCK_RECOMMENDATIONS),
    [],
  )

  const filtered = React.useMemo(() => {
    let items = MOCK_RECOMMENDATIONS.filter((item) => {
      const matchesQuery = item.title
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesPool = poolFilter === 'all' || item.pool === poolFilter
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter
      return matchesQuery && matchesPool && matchesType && matchesStatus
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'ctr':
          cmp = a.ctr - b.ctr
          break
        case 'relevance':
          cmp = a.relevance - b.relevance
          break
        case 'impressions':
          cmp = a.impressions - b.impressions
          break
        case 'clicks':
          cmp = a.clicks - b.clicks
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [query, poolFilter, typeFilter, statusFilter, sortKey, sortDir])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Recommendations"
        description="Manage and optimize content recommendation pools and algorithms."
      >
        <div className="flex items-center gap-2">
          <StatusBadge tone="success">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Engine Active
            </span>
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            Updated 5m ago
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard
          label="Active Recs"
          value={stats.totalActive}
          icon={<Layers className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Avg CTR"
          value={`${stats.avgCTR.toFixed(1)}%`}
          icon={<Target className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Avg Relevance"
          value={`${stats.avgRelevance.toFixed(0)}%`}
          icon={<Sparkles className="size-4 text-info" />}
          tone="info"
        />
        <StatCard
          label="Users Served"
          value={formatNumber(stats.usersServed)}
          icon={<Users className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="A/B Tests"
          value={stats.abTestsRunning}
          icon={<Beaker className="size-4 text-warning" />}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_POOL_INFO.map((pool) => (
          <Card key={pool.id} className="py-4">
            <CardHeader className="px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {pool.label}
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {pool.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-xs text-muted-foreground">
                {pool.description}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Avg CTR:</span>
                <span className="font-mono font-medium">
                  {pool.avgCTR}%
                </span>
              </div>
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
            placeholder="Search recommendations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={poolFilter} onValueChange={setPoolFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All pools</SelectItem>
              {(
                Object.keys(
                  RECOMMENDATION_POOL_LABEL,
                ) as RecommendationPool[]
              ).map((p) => (
                <SelectItem key={p} value={p}>
                  {RECOMMENDATION_POOL_LABEL[p]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All types</SelectItem>
              {(
                Object.keys(
                  RECOMMENDATION_TYPE_LABEL,
                ) as RecommendationType[]
              ).map((t) => (
                <SelectItem key={t} value={t}>
                  {RECOMMENDATION_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All statuses</SelectItem>
              {(
                Object.keys(
                  RECOMMENDATION_STATUS_LABEL,
                ) as RecommendationStatus[]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {RECOMMENDATION_STATUS_LABEL[s]}
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
            <EmptyTitle>No recommendations</EmptyTitle>
            <EmptyDescription>
              No recommendations match the current filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'table' ? (
        <RecommendationTable items={filtered} onInspect={setInspecting} />
      ) : (
        <RecommendationGrid items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {MOCK_RECOMMENDATIONS.length}{' '}
          recommendations
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

      <RecommendationDetailSheet
        item={inspecting}
        onClose={() => setInspecting(null)}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
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
  tone?: 'neutral' | 'success' | 'info' | 'warning' | 'destructive'
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
            tone === 'warning' && 'text-warning',
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

function RecommendationTable({
  items,
  onInspect,
}: {
  items: RecommendationItem[]
  onInspect: (item: RecommendationItem) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead>Content</TableHead>
            <TableHead className="hidden md:table-cell">Pool</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">CTR</TableHead>
            <TableHead className="hidden md:table-cell">Relevance</TableHead>
            <TableHead className="hidden lg:table-cell">Impressions</TableHead>
            <TableHead className="hidden lg:table-cell">Clicks</TableHead>
            <TableHead className="hidden xl:table-cell">Status</TableHead>
            <TableHead className="hidden xl:table-cell">A/B Test</TableHead>
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
                    <Sparkles className="size-4" />
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
                <Badge variant="outline" className="text-xs">
                  {RECOMMENDATION_POOL_LABEL[item.pool]}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="secondary" className="text-xs">
                  {RECOMMENDATION_TYPE_LABEL[item.type]}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Target className="size-3 text-muted-foreground" />
                  <span
                    className={cn(
                      'font-mono text-sm font-bold',
                      item.ctr >= 15
                        ? 'text-success'
                        : item.ctr >= 10
                          ? 'text-info'
                          : 'text-muted-foreground',
                    )}
                  >
                    {item.ctr}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Sparkles className="size-3 text-muted-foreground" />
                  <span className="font-mono text-sm">{item.relevance}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-sm">
                  {formatNumber(item.impressions)}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-sm">
                  {formatNumber(item.clicks)}
                </span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <StatusBadge tone={RECOMMENDATION_STATUS_TONE[item.status]}>
                  {RECOMMENDATION_STATUS_LABEL[item.status]}
                </StatusBadge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {item.abTest ? (
                  <Badge variant="secondary" className="text-xs">
                    <Beaker data-icon="inline-start" className="size-3" />
                    {item.abTest.confidence}%
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <EyeOff /> {item.isEnabled ? 'Disable' : 'Enable'}
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

function RecommendationGrid({
  items,
  onInspect,
}: {
  items: RecommendationItem[]
  onInspect: (item: RecommendationItem) => void
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
                <Sparkles className="size-4" />
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
            <StatusBadge tone={RECOMMENDATION_STATUS_TONE[item.status]}>
              {RECOMMENDATION_STATUS_LABEL[item.status]}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Target className="size-3" />
              {item.ctr}% CTR
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-3" />
              {item.relevance}%
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[10px]">
              {RECOMMENDATION_POOL_LABEL[item.pool]}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {RECOMMENDATION_TYPE_LABEL[item.type]}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.updatedAt}</span>
            {item.abTest && (
              <Badge variant="secondary" className="text-[10px]">
                A/B {item.abTest.confidence}%
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

function RecommendationDetailSheet({
  item,
  onClose,
}: {
  item: RecommendationItem | null
  onClose: () => void
}) {
  const [pinned, setPinned] = React.useState(false)
  const [enabled, setEnabled] = React.useState(true)
  const [excluded, setExcluded] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setPinned(item.isPinned)
      setEnabled(item.isEnabled)
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
                <StatusBadge tone={RECOMMENDATION_STATUS_TONE[item.status]}>
                  {RECOMMENDATION_STATUS_LABEL[item.status]}
                </StatusBadge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{RECOMMENDATION_POOL_LABEL[item.pool]}</span>
                <span>·</span>
                <span>{RECOMMENDATION_TYPE_LABEL[item.type]}</span>
                <span>·</span>
                <span>{item.provider}</span>
              </div>
            </SheetHeader>
            <Tabs defaultValue="analytics" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="ab-test">A/B Test</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat
                      label="CTR"
                      value={`${item.analytics.ctr}%`}
                    />
                    <MiniStat
                      label="Relevance"
                      value={`${item.analytics.avgRelevance}%`}
                    />
                    <MiniStat
                      label="Conversion"
                      value={`${item.analytics.conversionRate}%`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat
                      label="Impressions"
                      value={formatNumber(item.analytics.totalImpressions)}
                    />
                    <MiniStat
                      label="Clicks"
                      value={formatNumber(item.analytics.totalClicks)}
                    />
                    <MiniStat
                      label="Conversions"
                      value={formatNumber(item.conversions)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat
                      label="Session Depth"
                      value={item.analytics.avgSessionDepth.toFixed(1)}
                    />
                    <MiniStat
                      label="Return Rate"
                      value={`${item.analytics.returnRate}%`}
                    />
                    <MiniStat
                      label="Satisfaction"
                      value={`${item.analytics.satisfactionScore}/5`}
                    />
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="sources" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">
                    Algorithm Sources
                  </span>
                  <div className="flex flex-col gap-2">
                    {item.sources.map((source) => (
                      <div
                        key={source.name}
                        className="flex items-center gap-3"
                      >
                        <span className="w-32 text-xs text-muted-foreground">
                          {source.name}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${source.performance}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-8 text-right font-mono text-xs">
                          {source.weight}%
                        </span>
                        <span className="w-12 text-right font-mono text-xs text-muted-foreground">
                          {source.performance}
                        </span>
                      </div>
                    ))}
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="ab-test" className="pt-4">
                <FieldGroup>
                  {item.abTest ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Test Name</span>
                        <Badge variant="secondary">{item.abTest.name}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <MiniStat
                          label="Variant"
                          value={item.abTest.variant}
                        />
                        <MiniStat
                          label="Confidence"
                          value={`${item.abTest.confidence}%`}
                        />
                      </div>
                      <MiniStat
                        label="Started"
                        value={item.abTest.startDate}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                      <Beaker className="size-8" />
                      <span className="text-sm">No A/B test running</span>
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
                  variant={enabled ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEnabled(!enabled)
                    toast.success(enabled ? 'Disabled' : 'Enabled')
                  }}
                >
                  {enabled ? (
                    <EyeOff data-icon="inline-start" />
                  ) : (
                    <Eye data-icon="inline-start" />
                  )}
                  {enabled ? 'Disable' : 'Enable'}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  )
}

function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [weights, setWeights] = React.useState({
    collaborative: 30,
    contentBased: 25,
    trending: 20,
    editorial: 15,
    seasonal: 10,
  })

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recommendation Engine Settings</DialogTitle>
          <DialogDescription>
            Configure how recommendations are generated and ranked.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Algorithm Weights</span>
              <Badge variant={totalWeight === 100 ? 'secondary' : 'destructive'}>
                Total: {totalWeight}%
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-32 text-xs capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={value}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        [key]: Number(e.target.value),
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
              <FieldLabel>Max Pool Size</FieldLabel>
              <Input readOnly defaultValue="500" />
            </Field>
            <Field>
              <FieldLabel>Refresh Interval</FieldLabel>
              <Input readOnly defaultValue="15 minutes" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Min Relevance</FieldLabel>
              <Input readOnly defaultValue="60%" />
            </Field>
            <Field>
              <FieldLabel>Diversity Factor</FieldLabel>
              <Input readOnly defaultValue="0.3" />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
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
