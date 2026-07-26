'use client'

import * as React from 'react'
import {
  AlertTriangle,
  Archive,
  Columns3,
  Eye,
  Film,
  Globe,
  Image,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Tv,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
  SEASONS_MOCK,
  SEASON_STATUS_TONE,
  ALL_SEASON_STATUSES,
  ALL_DATA_SOURCES,
  METADATA_STATUS_LABEL,
  getSeasonStats,
  type SeasonItem,
  type DataSource,
  type PublicationState,
  type MetadataStatus,
} from '@/lib/seasons-catalog-data'

type SortKey = 'series' | 'number' | 'title' | 'episodes' | 'year' | 'updated'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'series', label: 'Series' },
  { value: 'number', label: 'Season number' },
  { value: 'title', label: 'Title' },
  { value: 'episodes', label: 'Episodes' },
  { value: 'year', label: 'Year' },
  { value: 'updated', label: 'Last updated' },
]

const METADATA_TONE: Record<MetadataStatus, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  synced: 'success',
  stale: 'warning',
  error: 'destructive',
  missing: 'neutral',
}

const ALL_SERIES_FILTER: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All series' },
  ...Array.from(new Set(SEASONS_MOCK.map((s) => s.seriesId))).map((id) => ({
    id,
    label: SEASONS_MOCK.find((s) => s.seriesId === id)!.seriesTitle,
  })),
]

function formatSeasonCode(item: SeasonItem) {
  return `S${String(item.number).padStart(2, '0')}`
}

export default function SeasonsCatalogPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [source, setSource] = React.useState<string>('all')
  const [seriesFilter, setSeriesFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('series')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<SeasonItem | null>(null)
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    series: true,
    number: true,
    status: true,
    episodes: true,
    year: true,
    aired: true,
    metadata: true,
    updated: true,
  })

  const stats = React.useMemo(() => getSeasonStats(SEASONS_MOCK), [])

  const filtered = React.useMemo(() => {
    let items = SEASONS_MOCK.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.seriesTitle.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || item.status === status
      const matchesSource =
        source === 'all' ||
        item.sources.some((s) => s.provider === source)
      const matchesSeries =
        seriesFilter === 'all' || item.seriesId === seriesFilter
      return matchesQuery && matchesStatus && matchesSource && matchesSeries
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'series':
          cmp = a.seriesTitle.localeCompare(b.seriesTitle)
          break
        case 'number':
          cmp = a.number - b.number
          break
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'episodes':
          cmp = a.episodeCount - b.episodeCount
          break
        case 'year':
          cmp = a.year - b.year
          break
        case 'updated': {
          const parseOffset = (s: string) => {
            const n = parseInt(s, 10)
            if (s.includes('m')) return n
            if (s.includes('h')) return n * 60
            if (s.includes('d')) return n * 1440
            if (s.includes('week')) return n * 10080
            return 99999
          }
          cmp = parseOffset(a.updatedAt) - parseOffset(b.updatedAt)
          break
        }
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [query, status, source, seriesFilter, sortKey, sortDir])

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(filtered.map((i) => i.id)))
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkAction = (action: string) => {
    toast.success(`${action} applied to ${selected.size} seasons`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Seasons Catalog"
        description="Manage all seasons across your series. Edit metadata, control publication state, and sync sources."
      >
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New season
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total seasons"
          value={stats.total}
          icon={<Tv className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={<Rocket className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon={<Pencil className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Metadata errors"
          value={stats.metadataErrors}
          icon={<AlertTriangle className="size-4 text-destructive" />}
          tone={stats.metadataErrors > 0 ? 'destructive' : 'neutral'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search seasons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={seriesFilter} onValueChange={(v) => setSeriesFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_SERIES_FILTER.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_SEASON_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={(v) => setSource(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_DATA_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All sources' : s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={sortKey}
          onValueChange={(v) => setSortKey(v as SortKey)}
        >
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 data-icon="inline-start" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {Object.keys(columns).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={columns[key]}
                  onCheckedChange={(checked) =>
                    setColumns((prev) => ({ ...prev, [key]: checked }))
                  }
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v: string) => {
              if (v) setView(v as 'table' | 'grid')
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

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <span className="text-sm font-medium">
            {selected.size} selected
          </span>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="ghost" size="sm" onClick={() => bulkAction('Publish')}>
            <Rocket data-icon="inline-start" />
            Publish
          </Button>
          <Button variant="ghost" size="sm" onClick={() => bulkAction('Archive')}>
            <Archive data-icon="inline-start" />
            Archive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => bulkAction('Delete')}
          >
            <X data-icon="inline-start" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-7"
            onClick={() => setSelected(new Set())}
          >
            <X />
            <span className="sr-only">Clear selection</span>
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No seasons found</EmptyTitle>
            <EmptyDescription>
              No seasons match the current filters. Try adjusting your search or
              create a new season.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'table' ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                {columns.series && <TableHead>Series</TableHead>}
                {columns.number && (
                  <TableHead className="hidden md:table-cell">
                    Season
                  </TableHead>
                )}
                <TableHead>Title</TableHead>
                {columns.status && <TableHead>Status</TableHead>}
                {columns.episodes && (
                  <TableHead className="hidden md:table-cell">
                    Episodes
                  </TableHead>
                )}
                {columns.year && (
                  <TableHead className="hidden lg:table-cell">
                    Year
                  </TableHead>
                )}
                {columns.aired && (
                  <TableHead className="hidden lg:table-cell">
                    Aired
                  </TableHead>
                )}
                {columns.metadata && (
                  <TableHead className="hidden xl:table-cell">
                    Metadata
                  </TableHead>
                )}
                {columns.updated && (
                  <TableHead className="hidden lg:table-cell">
                    Updated
                  </TableHead>
                )}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  data-state={selected.has(item.id) ? 'selected' : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                      aria-label={`Select ${item.title}`}
                    />
                  </TableCell>
                  {columns.series && (
                    <TableCell>
                      <button
                        type="button"
                        className="text-left text-sm font-medium hover:underline"
                        onClick={() => setInspecting(item)}
                      >
                        {item.seriesTitle}
                      </button>
                    </TableCell>
                  )}
                  {columns.number && (
                    <TableCell className="hidden md:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatSeasonCode(item)}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    <button
                      type="button"
                      className="flex flex-col items-start gap-0.5 text-left"
                      onClick={() => setInspecting(item)}
                    >
                      <span className="max-w-64 truncate font-medium hover:underline">
                        {item.title}
                      </span>
                      <span className="line-clamp-1 max-w-64 text-xs text-muted-foreground">
                        {item.synopsis}
                      </span>
                    </button>
                  </TableCell>
                  {columns.status && (
                    <TableCell>
                      <StatusBadge tone={SEASON_STATUS_TONE[item.status]}>
                        {item.status}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.episodes && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {item.episodeCount} episodes
                    </TableCell>
                  )}
                  {columns.year && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.year}
                    </TableCell>
                  )}
                  {columns.aired && (
                    <TableCell className="hidden lg:table-cell">
                      <StatusBadge tone={item.aired ? 'success' : 'neutral'}>
                        {item.aired ? 'Aired' : 'Upcoming'}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.metadata && (
                    <TableCell className="hidden xl:table-cell">
                      <StatusBadge tone={METADATA_TONE[item.metadataStatus]}>
                        {METADATA_STATUS_LABEL[item.metadataStatus]}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.updated && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.updatedAt}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                        >
                          <MoreHorizontal />
                          <span className="sr-only">Row actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => setInspecting(item)}
                          >
                            <Pencil />
                            Edit season
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw />
                            Sync metadata
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => bulkAction('Archive')}
                          >
                            <Archive />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
                            <X />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-ring/40"
              onClick={() => setInspecting(item)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.seriesTitle} · {formatSeasonCode(item)}
                  </span>
                  <p className="line-clamp-1 text-sm leading-snug font-medium">
                    {item.title}
                  </p>
                </div>
                <StatusBadge tone={SEASON_STATUS_TONE[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {item.synopsis}
              </p>
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.episodeCount} episodes</span>
                <span>{item.year}</span>
                <StatusBadge tone={item.aired ? 'success' : 'neutral'}>
                  {item.aired ? 'Aired' : 'Upcoming'}
                </StatusBadge>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {SEASONS_MOCK.length} seasons
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

      <SeasonDetailSheet
        item={inspecting}
        onClose={() => setInspecting(null)}
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
  value: number
  icon: React.ReactNode
  tone?: 'neutral' | 'success' | 'destructive'
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

function SeasonDetailSheet({
  item,
  onClose,
}: {
  item: SeasonItem | null
  onClose: () => void
}) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">
                  <span className="font-mono text-muted-foreground">
                    {formatSeasonCode(item)}
                  </span>{' '}
                  {item.title}
                </SheetTitle>
                <StatusBadge tone={SEASON_STATUS_TONE[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                {item.seriesTitle} · Last updated {item.updatedAt} by{' '}
                {item.updatedBy}
              </SheetDescription>
            </SheetHeader>
            <Tabs
              defaultValue="overview"
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Series</FieldLabel>
                      <Input defaultValue={item.seriesTitle} readOnly />
                    </Field>
                    <Field>
                      <FieldLabel>Season number</FieldLabel>
                      <Input type="number" defaultValue={item.number} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input defaultValue={item.title} />
                  </Field>
                  <Field>
                    <FieldLabel>Synopsis</FieldLabel>
                    <Textarea rows={4} defaultValue={item.synopsis} />
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Episodes</FieldLabel>
                      <Input type="number" defaultValue={item.episodeCount} />
                    </Field>
                    <Field>
                      <FieldLabel>Year</FieldLabel>
                      <Input type="number" defaultValue={item.year} />
                    </Field>
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select defaultValue={item.status}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Aired</FieldLabel>
                      <Select defaultValue={item.aired ? 'yes' : 'no'}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Rating</FieldLabel>
                      <Input defaultValue={item.status} readOnly />
                    </Field>
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="metadata" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Metadata status
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Sync status with external databases
                      </span>
                    </div>
                    <StatusBadge tone={METADATA_TONE[item.metadataStatus]}>
                      {METADATA_STATUS_LABEL[item.metadataStatus]}
                    </StatusBadge>
                  </div>
                  <Field>
                    <FieldLabel>External IDs</FieldLabel>
                    <div className="flex flex-col gap-2">
                      {[
                        { key: 'tmdb', label: 'TMDB', icon: <Film className="size-4" /> },
                        { key: 'imdb', label: 'IMDb', icon: <Film className="size-4" /> },
                        { key: 'thetvdb', label: 'TheTVDB', icon: <Globe className="size-4" /> },
                        { key: 'anilist', label: 'AniList', icon: <Globe className="size-4" /> },
                      ].map((ext) => (
                        <div
                          key={ext.key}
                          className="flex items-center gap-3"
                        >
                          <span className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                            {ext.icon}
                            {ext.label}
                          </span>
                          <Input
                            className="flex-1 font-mono text-xs"
                            defaultValue={
                              item.externalIds[
                                ext.key as keyof typeof item.externalIds
                              ] ?? ''
                            }
                            placeholder={`Add ${ext.label} ID`}
                          />
                        </div>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="assets" className="pt-4">
                <FieldGroup>
                  {[
                    { key: 'poster', label: 'Poster', desc: 'Season poster artwork' },
                    { key: 'banner', label: 'Banner', desc: 'Horizontal banner for season pages' },
                  ].map((asset) => (
                    <div
                      key={asset.key}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                          <Image className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {asset.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {asset.desc}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Upload
                        </Button>
                      </div>
                    </div>
                  ))}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="sources" className="pt-4">
                <FieldGroup>
                  {item.sources.map((src) => (
                    <div
                      key={src.provider}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {src.provider}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          External ID: {src.externalId} · Last sync:{' '}
                          {src.lastSyncedAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          tone={
                            src.status === 'active'
                              ? 'success'
                              : src.status === 'error'
                                ? 'destructive'
                                : 'neutral'
                          }
                        >
                          {src.status === 'active'
                            ? 'Active'
                            : src.status === 'error'
                              ? 'Error'
                              : 'Inactive'}
                        </StatusBadge>
                        <Button variant="ghost" size="icon" className="size-7">
                          <RefreshCw />
                          <span className="sr-only">Sync</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-fit">
                    <Plus data-icon="inline-start" />
                    Connect source
                  </Button>
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success('Changes saved', {
                    description: `${item.seriesTitle} ${formatSeasonCode(item)} was updated.`,
                  })
                  onClose()
                }}
              >
                Save changes
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
