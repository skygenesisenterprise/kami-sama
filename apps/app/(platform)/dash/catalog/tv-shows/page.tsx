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
  Star,
  Tv,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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
  TV_SHOWS_MOCK,
  TV_SHOW_STATUS_TONE,
  ALL_TV_SHOW_STATUSES,
  ALL_TV_SHOW_TYPES,
  ALL_DATA_SOURCES,
  AIRING_STATUS_LABEL,
  METADATA_STATUS_LABEL,
  getTvShowStats,
  type TvShowItem,
  type TvShowType,
  type DataSource,
  type PublicationState,
  type MetadataStatus,
} from '@/lib/tv-shows-catalog-data'

type SortKey = 'title' | 'year' | 'rating' | 'episodes' | 'updated'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'year', label: 'Year' },
  { value: 'rating', label: 'Rating' },
  { value: 'episodes', label: 'Episodes' },
  { value: 'updated', label: 'Last updated' },
]

const METADATA_TONE: Record<MetadataStatus, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  synced: 'success',
  stale: 'warning',
  error: 'destructive',
  missing: 'neutral',
}

export default function TvShowsCatalogPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [source, setSource] = React.useState<string>('all')
  const [showType, setShowType] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('title')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<TvShowItem | null>(null)
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    status: true,
    type: true,
    year: true,
    network: true,
    genres: true,
    rating: true,
    episodes: true,
    metadata: true,
    updated: true,
  })

  const stats = React.useMemo(() => getTvShowStats(TV_SHOWS_MOCK), [])

  const filtered = React.useMemo(() => {
    let items = TV_SHOWS_MOCK.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.titleOriginal.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || item.status === status
      const matchesSource =
        source === 'all' ||
        item.sources.some((s) => s.provider === source)
      const matchesType = showType === 'all' || item.type === showType
      return matchesQuery && matchesStatus && matchesSource && matchesType
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'year':
          cmp = a.year - b.year
          break
        case 'rating':
          cmp = a.rating - b.rating
          break
        case 'episodes':
          cmp = a.totalEpisodes - b.totalEpisodes
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
  }, [query, status, source, showType, sortKey, sortDir])

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
    toast.success(`${action} applied to ${selected.size} TV shows`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="TV Shows Catalog"
        description="Manage your TV shows catalog. Edit metadata, sync sources, and control publication state."
      >
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New TV show
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total TV shows"
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
            placeholder="Search TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_TV_SHOW_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={showType} onValueChange={(v) => setShowType(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_TV_SHOW_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}
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
            <EmptyTitle>No TV shows found</EmptyTitle>
            <EmptyDescription>
              No TV shows match the current filters. Try adjusting your search or
              create a new TV show.
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
                <TableHead>Title</TableHead>
                {columns.status && <TableHead>Status</TableHead>}
                {columns.type && (
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                )}
                {columns.year && (
                  <TableHead className="hidden md:table-cell">Year</TableHead>
                )}
                {columns.network && (
                  <TableHead className="hidden lg:table-cell">
                    Network
                  </TableHead>
                )}
                {columns.genres && (
                  <TableHead className="hidden xl:table-cell">
                    Genres
                  </TableHead>
                )}
                {columns.rating && (
                  <TableHead className="hidden md:table-cell">
                    Rating
                  </TableHead>
                )}
                {columns.episodes && (
                  <TableHead className="hidden lg:table-cell">
                    Episodes
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
                  <TableCell>
                    <button
                      type="button"
                      className="flex flex-col items-start gap-0.5 text-left"
                      onClick={() => setInspecting(item)}
                    >
                      <span className="max-w-72 truncate font-medium hover:underline">
                        {item.title}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.titleOriginal}
                      </span>
                    </button>
                  </TableCell>
                  {columns.status && (
                    <TableCell>
                      <StatusBadge tone={TV_SHOW_STATUS_TONE[item.status]}>
                        {item.status}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.type && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </TableCell>
                  )}
                  {columns.year && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {item.year}
                    </TableCell>
                  )}
                  {columns.network && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.networks[0]}
                    </TableCell>
                  )}
                  {columns.genres && (
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex gap-1">
                        {item.genres.slice(0, 2).map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                        {item.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {columns.rating && (
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
                        <Star className="size-3 fill-gold text-gold" />
                        {item.rating.toFixed(1)}
                      </span>
                    </TableCell>
                  )}
                  {columns.episodes && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.totalEpisodes}
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
                            Edit TV show
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
                  <p className="line-clamp-1 text-sm leading-snug font-medium">
                    {item.title}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.titleOriginal}
                  </p>
                </div>
                <StatusBadge tone={TV_SHOW_STATUS_TONE[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.genres.map((g) => (
                  <Badge key={g} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-gold text-gold" />
                  {item.rating.toFixed(1)}
                </span>
                <span>{item.year}</span>
                <span>{item.totalEpisodes} eps</span>
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {TV_SHOWS_MOCK.length} TV shows
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

      <TvShowDetailSheet
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

function TvShowDetailSheet({
  item,
  onClose,
}: {
  item: TvShowItem | null
  onClose: () => void
}) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={TV_SHOW_STATUS_TONE[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                {item.titleOriginal} · Last updated {item.updatedAt} by{' '}
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
                <TabsTrigger value="seasons">Seasons</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Title</FieldLabel>
                      <Input defaultValue={item.title} />
                    </Field>
                    <Field>
                      <FieldLabel>Original title</FieldLabel>
                      <Input defaultValue={item.titleOriginal} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Synopsis</FieldLabel>
                    <Textarea rows={4} defaultValue={item.synopsis} />
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Select defaultValue={item.type}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drama">Drama</SelectItem>
                          <SelectItem value="comedy">Comedy</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="reality">Reality</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="animation">Animation</SelectItem>
                          <SelectItem value="talk-show">Talk Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Year</FieldLabel>
                      <Input type="number" defaultValue={item.year} />
                    </Field>
                    <Field>
                      <FieldLabel>Age rating</FieldLabel>
                      <Input defaultValue={item.ageRating} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <Field>
                      <FieldLabel>Airing status</FieldLabel>
                      <Select defaultValue={item.airingStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airing">Airing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="hiatus">Hiatus</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Genres</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.map((g) => (
                        <Badge key={g} variant="secondary">
                          {g}
                        </Badge>
                      ))}
                      <Badge variant="outline">+ Add genre</Badge>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel>Networks</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.networks.map((n) => (
                        <Badge key={n} variant="secondary">
                          {n}
                        </Badge>
                      ))}
                      <Badge variant="outline">+ Add network</Badge>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel>Tags</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                      <Badge variant="outline">+ Add tag</Badge>
                    </div>
                  </Field>
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
                        { key: 'trakt', label: 'Trakt', icon: <Globe className="size-4" /> },
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
                    { key: 'poster', label: 'Poster', desc: 'Vertical cover art (recommended 2:3 ratio)' },
                    { key: 'banner', label: 'Banner', desc: 'Horizontal banner (recommended 16:9 ratio)' },
                    { key: 'backdrop', label: 'Backdrop', desc: 'Wide background image for detail pages' },
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

              <TabsContent value="seasons" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {item.seasons.length} seasons · {item.totalEpisodes}{' '}
                      episodes
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus data-icon="inline-start" />
                      Add season
                    </Button>
                  </div>
                  {item.seasons.map((season) => (
                    <div
                      key={season.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          Season {season.number}: {season.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {season.episodeCount} episodes · {season.year} ·{' '}
                          {season.aired ? 'Aired' : 'Upcoming'}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7">
                        <Pencil />
                        <span className="sr-only">Edit season</span>
                      </Button>
                    </div>
                  ))}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="relations" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {item.relations.length} related shows
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus data-icon="inline-start" />
                      Add relation
                    </Button>
                  </div>
                  {item.relations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No relations configured for this TV show.
                    </p>
                  ) : (
                    item.relations.map((rel) => (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {rel.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {rel.type.charAt(0).toUpperCase() + rel.type.slice(1)}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="size-7">
                          <X />
                          <span className="sr-only">Remove relation</span>
                        </Button>
                      </div>
                    ))
                  )}
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success('Changes saved', {
                    description: `${item.title} was updated.`,
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
