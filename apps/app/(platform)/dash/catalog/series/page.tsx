'use client'

import * as React from 'react'
import Link from 'next/link'
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
  Loader2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { PlexImportDialog } from '@/components/dash/plex-import-dialog'
import type { SourceResultItem } from '@/components/dash/source-result-card'
import { StatusBadge } from '@/components/dash/status-badge'
import {
  SERIES_STATUS_TONE,
  ALL_SERIES_STATUSES,
  ALL_SERIES_TYPES,
  ALL_DATA_SOURCES,
  METADATA_STATUS_LABEL,
  getSeriesStats,
  type SeriesItem,
  type MetadataStatus,
  type SeriesType,
  type DataSource,
  type PublicationState,
} from '@/lib/series-catalog-data'
import { anilistApi, type AniListSearchResult } from '@/lib/api/anilist'
import { ApiError } from '@/lib/api/errors'
import {
  animeApi,
  apiAnimeToSeriesItem,
  seriesItemToAnimeCreatePayload,
  seriesItemToAnimeUpdatePayload,
  type ApiAnime,
} from '@/lib/api/anime'
import { myanimelistApi } from '@/lib/api/myanimelist'
import { plexApi, type PlexImportResult } from '@/lib/api/plex'
import { anilistItemToSourceItem, plexItemToSourceItem } from '@/lib/source-search'

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

export default function SeriesCatalogPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [source, setSource] = React.useState<string>('all')
  const [seriesType, setSeriesType] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('title')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<SeriesItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    status: true,
    type: true,
    year: true,
    studio: true,
    genres: true,
    rating: true,
    episodes: true,
    metadata: true,
    sources: true,
    updated: true,
  })
  const [items, setItems] = React.useState<SeriesItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)
  const [enriching, setEnriching] = React.useState(false)

  const fetchCatalog = React.useCallback(async () => {
    try {
      const all: ApiAnime[] = []
      const pageSize = 1000
      let page = 1
      let total = 0
      do {
        const res = await animeApi.list({
          page,
          limit: pageSize,
          sort: 'created_at',
        })
        all.push(...res.items)
        total = res.total
        page += 1
      } while (all.length < total && page <= 1000)
      setItems(all.map(apiAnimeToSeriesItem))
      setLoadError(null)
    } catch (err) {
      setLoadError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchCatalog()
  }, [fetchCatalog])

  const stats = React.useMemo(() => getSeriesStats(items), [items])

  const filtered = React.useMemo(() => {
    let next = [...items].filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.titleOriginal.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || item.status === status
      const matchesSource =
        source === 'all' ||
        item.sources.some((s) => s.provider === source)
      const matchesType = seriesType === 'all' || item.type === seriesType
      return matchesQuery && matchesStatus && matchesSource && matchesType
    })

    next.sort((a, b) => {
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

    return next
  }, [items, query, status, source, seriesType, sortKey, sortDir])

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

  const bulkAction = async (action: 'Publish' | 'Archive' | 'Delete') => {
    const ids = [...selected]
    setSelected(new Set())
    if (ids.length === 0) return
    const statusMap: Record<string, string> = { Publish: 'published', Archive: 'archived' }
    const results = await Promise.allSettled(
      ids.map((id) =>
        action === 'Delete'
          ? animeApi.remove(id)
          : animeApi.update(id, { status: statusMap[action] })
      )
    )
    const failed = results.filter((r) => r.status === 'rejected').length
    await fetchCatalog()
    if (failed === 0) {
      toast.success(`${action} applied to ${ids.length} series`)
    } else {
      toast.error(`${action} failed for ${failed} series`, {
        description: 'Some series could not be updated.',
      })
    }
  }

  const removeSeries = async (item: SeriesItem) => {
    try {
      await animeApi.remove(item.id)
      setItems((prev) => prev.filter((s) => s.id !== item.id))
      toast.success(`"${item.title}" deleted`)
    } catch (err) {
      toast.error(formatApiError(err))
    }
  }

  const archiveSeries = async (item: SeriesItem) => {
    try {
      await animeApi.update(item.id, { status: 'archived' })
      setItems((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'Archived' } : s))
      )
      toast.success(`"${item.title}" archived`)
    } catch (err) {
      toast.error(formatApiError(err))
    }
  }

  const handleImported = (_result: PlexImportResult) => {
    void fetchCatalog()
  }

  const handleSave = async (updated: SeriesItem): Promise<void> => {
    await animeApi.update(updated.id, seriesItemToAnimeUpdatePayload(updated))
    setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    toast.success('Changes saved', {
      description: `${updated.title} was updated.`,
    })
  }

  const handleCreatedFromDialog = async (item: SeriesItem): Promise<void> => {
    if (item.externalIds.plex) {
      await plexApi.importItem(item.externalIds.plex)
      await fetchCatalog()
      return
    }
    const created = await animeApi.create(seriesItemToAnimeCreatePayload(item))
    setItems((prev) => [
      apiAnimeToSeriesItem(created),
      ...prev.filter((s) => s.id !== created.id),
    ])
  }

  const enrichCatalog = async () => {
    if (enriching) return
    setEnriching(true)
    const outcomes: string[] = []
    const existingAnilist = new Set(
      items
        .map((s) => s.externalIds.anilist)
        .filter((v): v is string => Boolean(v))
    )
    const existingTitles = new Set(items.map((s) => s.title.toLowerCase()))

    let malSynced = false
    try {
      await myanimelistApi.runSync('seasonal-sync', 'manual')
      malSynced = true
      outcomes.push('MAL seasonal synced')
    } catch (err) {
      outcomes.push(
        isProviderDisabled(err)
          ? 'MAL disabled'
          : `MAL: ${formatApiError(err)}`
      )
    }

    let created = 0
    let failed = 0
    let imports = 0
    try {
      const lists = await Promise.allSettled([
        anilistApi.trending({ perPage: 50 }),
        anilistApi.popular({ perPage: 50 }),
        anilistApi.seasonal({ perPage: 50 }),
      ])
      const fulfilled = lists.filter(
        (l): l is PromiseFulfilledResult<AniListSearchResult> =>
          l.status === 'fulfilled'
      )
      if (fulfilled.length === 0) {
        const firstError = lists.find(
          (l): l is PromiseRejectedResult => l.status === 'rejected'
        )
        outcomes.push(
          isProviderDisabled(firstError?.reason)
            ? 'AniList disabled'
            : `AniList: ${formatApiError(firstError?.reason)}`
        )
      } else {
        const seen = new Set<number>()
        const candidates: SeriesItem[] = []
        for (const res of fulfilled) {
          for (const raw of res.value.items) {
            if (seen.has(raw.anilistId)) continue
            seen.add(raw.anilistId)
            const id = String(raw.anilistId)
            if (existingAnilist.has(id)) continue
            if (existingTitles.has(raw.title.toLowerCase())) continue
            const src = anilistItemToSourceItem(raw)
            candidates.push(
              buildImportedSeriesItem({ ...src, source: 'AniList' })
            )
          }
        }
        imports = candidates.length
        for (const batch of chunk(candidates, 5)) {
          const results = await Promise.allSettled(
            batch.map((item) =>
              animeApi.create(seriesItemToAnimeCreatePayload(item))
            )
          )
          for (const r of results) {
            if (r.status === 'fulfilled') created++
            else failed++
          }
        }
        outcomes.push(
          `${created} added${imports - created - failed > 0 ? `, ${imports - created - failed} skipped` : ''}${failed > 0 ? `, ${failed} failed` : ''}`
        )
      }
    } catch (err) {
      outcomes.push(
        isProviderDisabled(err)
          ? 'AniList disabled'
          : `AniList: ${formatApiError(err)}`
      )
    }

    await fetchCatalog()
    setEnriching(false)
    if (malSynced || created > 0) {
      toast.success('Catalog enriched', {
        description: outcomes.join(' · '),
      })
    } else {
      toast.error('Enrichment could not fetch any source', {
        description: outcomes.join(' · '),
      })
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Series Catalog"
        description="Manage your full series catalog. Edit metadata, sync sources, and control publication state."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void enrichCatalog()}
          disabled={enriching}
        >
          {enriching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw data-icon="inline-start" />
          )}
          {enriching ? 'Enriching…' : 'Enrich'}
        </Button>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus data-icon="inline-start" />
          New series
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total series"
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
            placeholder="Search series..."
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
              {ALL_SERIES_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={seriesType} onValueChange={(v) => setSeriesType(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_SERIES_TYPES.map((t) => (
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

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-card py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading catalog…
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Failed to load catalog: {loadError}
        </div>
      ) : filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            {items.length === 0 ? (
              <>
                <EmptyTitle>No series yet</EmptyTitle>
                <EmptyDescription>
                  Search Plex to find a series by title and add it to your
                  catalog, or create a new series manually.
                </EmptyDescription>
              </>
            ) : (
              <>
                <EmptyTitle>No series found</EmptyTitle>
                <EmptyDescription>
                  No series match the current filters. Try adjusting your
                  search or import another series from Plex.
                </EmptyDescription>
              </>
            )}
          </EmptyHeader>
          {items.length === 0 ? (
            <Button onClick={() => setImportOpen(true)}>
              <Tv data-icon="inline-start" />
              Search Plex
            </Button>
          ) : null}
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
                {columns.studio && (
                  <TableHead className="hidden lg:table-cell">
                    Studio
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
                {columns.sources && (
                  <TableHead className="hidden md:table-cell">Sources</TableHead>
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
                      <StatusBadge tone={SERIES_STATUS_TONE[item.status]}>
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
                  {columns.studio && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.studios[0]}
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
                  {columns.sources && (
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {item.sources.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          item.sources.map((src) => (
                            <Badge
                              key={`${src.provider}-${src.externalId}`}
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {src.provider}
                            </Badge>
                          ))
                        )}
                      </div>
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
                            Edit series
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
                            onClick={() => archiveSeries(item)}
                          >
                            <Archive />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => removeSeries(item)}
                          >
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
                <StatusBadge tone={SERIES_STATUS_TONE[item.status]}>
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
          Showing {filtered.length} of {items.length} series
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

      <SeriesDetailSheet
        item={inspecting}
        onClose={() => setInspecting(null)}
        onSave={handleSave}
      />

      <NewSeriesDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={handleCreatedFromDialog}
      />

      <PlexImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        kind="series"
        onImported={handleImported}
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

function SeriesDetailSheet({
  item,
  onClose,
  onSave,
}: {
  item: SeriesItem | null
  onClose: () => void
  onSave: (item: SeriesItem) => Promise<void>
}) {
  const [title, setTitle] = React.useState('')
  const [titleOriginal, setTitleOriginal] = React.useState('')
  const [synopsis, setSynopsis] = React.useState('')
  const [type, setType] = React.useState<string>('anime')
  const [year, setYear] = React.useState(0)
  const [ageRating, setAgeRating] = React.useState('')
  const [status, setStatus] = React.useState<string>('Added')
  const [airingStatus, setAiringStatus] = React.useState<string>('upcoming')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (item) {
      setTitle(item.title)
      setTitleOriginal(item.titleOriginal)
      setSynopsis(item.synopsis)
      setType(item.type)
      setYear(item.year)
      setAgeRating(item.ageRating)
      setStatus(item.status)
      setAiringStatus(item.airingStatus)
      setError(null)
      setSaving(false)
    }
  }, [item])

  const save = async () => {
    if (!item || saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        ...item,
        title,
        titleOriginal,
        synopsis,
        type: type as SeriesItem['type'],
        year,
        ageRating,
        status: status as PublicationState,
        airingStatus: airingStatus as SeriesItem['airingStatus'],
      })
      onClose()
    } catch (err) {
      setError(formatApiError(err))
      setSaving(false)
    }
  }

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={SERIES_STATUS_TONE[item.status]}>
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
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Original title</FieldLabel>
                      <Input
                        value={titleOriginal}
                        onChange={(e) => setTitleOriginal(e.target.value)}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Synopsis</FieldLabel>
                    <Textarea
                      rows={4}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="live-action">Live Action</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="animation">Animation</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Year</FieldLabel>
                      <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Age rating</FieldLabel>
                      <Input
                        value={ageRating}
                        onChange={(e) => setAgeRating(e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Added">Added</SelectItem>
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
                      <Select value={airingStatus} onValueChange={setAiringStatus}>
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
                    <FieldLabel>Studios</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.studios.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                      <Badge variant="outline">+ Add studio</Badge>
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
                        { key: 'anilist', label: 'AniList', icon: <Globe className="size-4" /> },
                        { key: 'myAnimeList', label: 'MyAnimeList', icon: <Globe className="size-4" /> },
                        { key: 'tmdb', label: 'TMDB', icon: <Film className="size-4" /> },
                        { key: 'imdb', label: 'IMDb', icon: <Film className="size-4" /> },
                        { key: 'kitsu', label: 'Kitsu', icon: <Globe className="size-4" /> },
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
                      {item.relations.length} related series
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus data-icon="inline-start" />
                      Add relation
                    </Button>
                  </div>
                  {item.relations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No relations configured for this series.
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
            <SheetFooter className="flex-row items-center border-t">
              {error ? (
                <span className="min-w-0 flex-1 truncate text-xs text-destructive">
                  {error}
                </span>
              ) : null}
              <Button
                className="flex-1"
                disabled={saving}
                onClick={save}
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
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

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
}

function isProviderDisabled(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    (err.code === 'ANILIST_DISABLED' || err.code === 'MYANIMELIST_DISABLED')
  )
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

function buildImportedSeriesItem(item: SourceResultItem): SeriesItem {
  const source = item.source ?? 'AniList'
  return {
    id: `${source.toLowerCase()}-${item.id}`,
    slug: slugify(item.title),
    title: item.title,
    titleOriginal: item.subtitle || item.title,
    synopsis: item.overview ?? '',
    type:
      source === 'AniList' || source === 'MyAnimeList'
        ? 'anime'
        : 'animation',
    status: 'Added' as PublicationState,
    airingStatus: 'upcoming',
    genres: item.genres ?? [],
    studios: [],
    tags: [],
    year: item.year ?? new Date().getFullYear(),
    rating: item.rating ?? 0,
    seasonCount: 0,
    totalEpisodes: 0,
    ageRating: 'Unknown',
    assets: {
      poster: item.imageUrl ?? '',
      banner: item.artUrl ?? '',
      backdrop: item.artUrl ?? '',
    },
    externalIds:
      source === 'Plex'
        ? { plex: item.id }
        : source === 'MyAnimeList'
          ? { myAnimeList: item.id }
          : { anilist: item.id },
    sources: [
      {
        provider: source as DataSource,
        externalId: item.id,
        lastSyncedAt: new Date().toISOString(),
        status: 'active',
      },
    ],
    seasons: [],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: 'just now',
    updatedBy: 'New series',
  }
}

function NewSeriesDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (item: SeriesItem) => Promise<void>
}) {
  const [title, setTitle] = React.useState('')
  const [titleOriginal, setTitleOriginal] = React.useState('')
  const [synopsis, setSynopsis] = React.useState('')
  const [type, setType] = React.useState<string>('anime')
  const [year, setYear] = React.useState(new Date().getFullYear())
  const [ageRating, setAgeRating] = React.useState('')
  const [status, setStatus] = React.useState<string>('Draft')
  const [airingStatus, setAiringStatus] = React.useState<string>('upcoming')
  const [provider, setProvider] = React.useState<string>('')
  const [genres, setGenres] = React.useState<string[]>([])
  const [genreInput, setGenreInput] = React.useState('')
  const [studios, setStudios] = React.useState<string[]>([])
  const [studioInput, setStudioInput] = React.useState('')
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState('')

  const [sourceQuery, setSourceQuery] = React.useState('')
  const [sourceResults, setSourceResults] = React.useState<SourceResultItem[]>([])
  const [sourceSearching, setSourceSearching] = React.useState(false)
  const [sourceError, setSourceError] = React.useState<string | null>(null)
  const [unavailableSources, setUnavailableSources] = React.useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set())

  const addGenre = () => {
    const trimmed = genreInput.trim()
    if (trimmed && !genres.includes(trimmed)) {
      setGenres((prev) => [...prev, trimmed])
      setGenreInput('')
    }
  }

  const addStudio = () => {
    const trimmed = studioInput.trim()
    if (trimmed && !studios.includes(trimmed)) {
      setStudios((prev) => [...prev, trimmed])
      setStudioInput('')
    }
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
      setTagInput('')
    }
  }

  React.useEffect(() => {
    if (!open) return
    const q = sourceQuery.trim()
    if (!q) {
      setSourceResults([])
      return
    }
    let cancelled = false
    const timeout = setTimeout(async () => {
      setSourceSearching(true)
      setSourceError(null)
      setUnavailableSources([])
      try {
        const [plexRes, anilistRes, malRes] = await Promise.allSettled([
          plexApi.search(q, { type: 'show', limit: 8 }),
          anilistApi.search(q, { perPage: 8 }),
          myanimelistApi.search(q, { type: 'anime', limit: 8 }),
        ])
        if (cancelled) return
        const results: SourceResultItem[] = []
        const unavailable: string[] = []
        let error: string | null = null

        if (plexRes.status === 'fulfilled') {
          const wanted = ['Series', 'show']
          results.push(
            ...plexRes.value.items
              .filter((i) => wanted.includes(i.type ?? ''))
              .map((i) => ({ ...plexItemToSourceItem(i), source: 'Plex' }))
          )
        } else {
          const err = plexRes.reason
          if (err instanceof ApiError && err.code === 'PLEX_DISABLED') {
            unavailable.push('Plex')
          } else {
            error = `Plex: ${formatApiError(err)}`
          }
        }

        if (anilistRes.status === 'fulfilled') {
          results.push(
            ...anilistRes.value.items.map((i) => ({
              ...anilistItemToSourceItem(i),
              source: 'AniList',
            }))
          )
        } else {
          const err = anilistRes.reason
          if (err instanceof ApiError && err.code === 'ANILIST_DISABLED') {
            unavailable.push('AniList')
          } else {
            error = error
              ? `${error} · AniList: ${formatApiError(err)}`
              : `AniList: ${formatApiError(err)}`
          }
        }

        if (malRes.status === 'fulfilled') {
          results.push(
            ...malRes.value.items.map((i) => ({ ...i, source: 'MyAnimeList' }))
          )
        } else {
          const err = malRes.reason
          if (err instanceof ApiError && err.code === 'MYANIMELIST_DISABLED') {
            unavailable.push('MyAnimeList')
          } else {
            error = error
              ? `${error} · MyAnimeList: ${formatApiError(err)}`
              : `MyAnimeList: ${formatApiError(err)}`
          }
        }

        setSourceResults(results)
        setUnavailableSources(unavailable)
        setSourceError(error)
      } catch (err) {
        if (cancelled) return
        setSourceError(formatApiError(err))
        setSourceResults([])
      } finally {
        if (!cancelled) setSourceSearching(false)
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [open, sourceQuery])

  const toggleSelect = (item: SourceResultItem) => {
    const key = `${item.source ?? 'AniList'}-${item.id}`
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectedItems = React.useMemo(
    () => sourceResults.filter((r) => selectedKeys.has(`${r.source}-${r.id}`)),
    [sourceResults, selectedKeys],
  )

  const buildItemFromResult = (item: SourceResultItem): SeriesItem => {
    const source = item.source ?? 'AniList'
    return {
      id: `${source.toLowerCase()}-${item.id}`,
      slug: slugify(item.title),
      title: item.title,
      titleOriginal: item.subtitle || item.title,
      synopsis: item.overview ?? '',
      type: source === 'AniList' || source === 'MyAnimeList' ? 'anime' : 'animation',
      status: 'Draft' as PublicationState,
      airingStatus: 'upcoming',
      genres: item.genres ?? [],
      studios: [],
      tags: [],
      year: item.year ?? new Date().getFullYear(),
      rating: item.rating ?? 0,
      seasonCount: 0,
      totalEpisodes: 0,
      ageRating: 'Unknown',
      assets: {
        poster: item.imageUrl ?? '',
        banner: item.artUrl ?? '',
        backdrop: item.artUrl ?? '',
      },
      externalIds:
        source === 'Plex'
          ? { plex: item.id }
          : source === 'MyAnimeList'
            ? { myAnimeList: item.id }
            : { anilist: item.id },
      sources: [
        {
          provider: source as DataSource,
          externalId: item.id,
          lastSyncedAt: new Date().toISOString(),
          status: 'active',
        },
      ],
      seasons: [],
      relations: [],
      metadataStatus: 'synced',
      updatedAt: 'just now',
      updatedBy: 'New series',
    }
  }

  const reset = () => {
    setTitle('')
    setTitleOriginal('')
    setSynopsis('')
    setType('anime')
    setYear(new Date().getFullYear())
    setAgeRating('')
    setStatus('Draft')
    setAiringStatus('upcoming')
    setProvider('')
    setGenres([])
    setGenreInput('')
    setStudios([])
    setStudioInput('')
    setTags([])
    setTagInput('')
    setSourceQuery('')
    setSourceResults([])
    setSourceSearching(false)
    setSourceError(null)
    setUnavailableSources([])
    setSelectedKeys(new Set())
  }

  const handleCreate = async () => {
    if (selectedItems.length > 0) {
      const failures: string[] = []
      for (const item of selectedItems) {
        try {
          await onCreated(buildItemFromResult(item))
        } catch {
          failures.push(item.title)
        }
      }
      reset()
      onOpenChange(false)
      if (failures.length === 0) {
        toast.success('Series added', {
          description: `${selectedItems.length} series have been added to the catalog.`,
        })
      } else {
        toast.error('Some series could not be added', {
          description: `These could not be added: ${failures.join(', ')}`,
        })
      }
      return
    }

    const item: SeriesItem = {
      id: `manual-${Date.now()}`,
      slug: slugify(title),
      title,
      titleOriginal: titleOriginal || title,
      synopsis,
      type: type as SeriesType,
      status: status as PublicationState,
      airingStatus: airingStatus as SeriesItem['airingStatus'],
      genres,
      studios,
      tags,
      year,
      rating: 0,
      seasonCount: 0,
      totalEpisodes: 0,
      ageRating: ageRating || 'Unknown',
      assets: { poster: '', banner: '', backdrop: '' },
      externalIds: {},
      sources: [],
      seasons: [],
      relations: [],
      metadataStatus: 'missing',
      updatedAt: 'just now',
      updatedBy: 'New series',
    }
    try {
      await onCreated(item)
      toast.success('Series created', {
        description: `"${item.title}" has been added to the catalog.`,
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error('Could not create series', {
        description: formatApiError(err),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New series</DialogTitle>
          <DialogDescription>
            Search across your connected sources, select one or more titles, and
            add them to the catalog — or create a series manually.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search all sources by title..."
                value={sourceQuery}
                onChange={(e) => setSourceQuery(e.target.value)}
              />
            </div>
          </div>

          {selectedItems.length > 0 ? (
            <p className="rounded-md bg-primary/10 px-3 py-1.5 text-xs text-primary">
              <span className="font-medium">{selectedItems.length}</span> title
              {selectedItems.length === 1 ? '' : 's'} selected — they will be
              added to the catalog.
            </p>
          ) : null}

          {unavailableSources.length > 0 ? (
            <div className="flex items-center justify-between gap-2 rounded-md border bg-warning/10 px-3 py-2 text-xs text-warning">
              <span>
                {unavailableSources.join(' and ')}{' '}
                {unavailableSources.length === 1 ? 'is' : 'are'} not configured.
              </span>
              {unavailableSources.includes('Plex') ? (
                <Link
                  href="/dash/sources/plex"
                  className="shrink-0 font-medium underline underline-offset-2"
                >
                  Open Plex settings
                </Link>
              ) : null}
              {unavailableSources.includes('MyAnimeList') ? (
                <Link
                  href="/dash/sources/myanimelist"
                  className="shrink-0 font-medium underline underline-offset-2"
                >
                  Open MyAnimeList settings
                </Link>
              ) : null}
            </div>
          ) : null}

          {sourceError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Search failed: {sourceError}
            </div>
          ) : null}

          {sourceSearching ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching Plex, AniList and MyAnimeList…
            </div>
          ) : sourceQuery.trim() === '' ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Search a title to verify it is available in Plex, AniList or MyAnimeList.
            </p>
          ) : sourceResults.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              No results for “{sourceQuery.trim()}” in Plex, AniList or MyAnimeList.
            </p>
          ) : (
            <div className="flex max-h-72 flex-col divide-y divide-border overflow-y-auto rounded-md border">
              {sourceResults.map((item) => {
                const key = `${item.source}-${item.id}`
                const selected = selectedKeys.has(key)
                const meta = [
                  item.year ? String(item.year) : null,
                  item.type,
                  ...(item.extraMeta ?? []),
                ].filter(Boolean)
                const sub = [item.subtitle, meta.join(' · ') || null]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      selected ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleSelect(item)}
                      aria-label={`Select ${item.title}`}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => toggleSelect(item)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{item.title}</span>
                        <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
                          {item.source}
                        </Badge>
                      </span>
                      {sub ? (
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {sub}
                        </span>
                      ) : null}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedItems.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {selectedItems.length} title{selectedItems.length === 1 ? '' : 's'} added with
            their metadata. Adjust the details later from the catalog.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Title *</FieldLabel>
              <Input
                placeholder="e.g. Attack on Titan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Original title</FieldLabel>
              <Input
                placeholder="e.g. 進撃の巨人"
                value={titleOriginal}
                onChange={(e) => setTitleOriginal(e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Synopsis</FieldLabel>
            <Textarea
              rows={3}
              placeholder="Brief description of the series..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="live-action">Live Action</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="animation">Animation</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Year</FieldLabel>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </Field>
            <Field>
              <FieldLabel>Age rating</FieldLabel>
              <Input
                placeholder="e.g. PG-13"
                value={ageRating}
                onChange={(e) => setAgeRating(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Added">Added</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Airing status</FieldLabel>
              <Select value={airingStatus} onValueChange={setAiringStatus}>
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
            <FieldLabel>Provider</FieldLabel>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a provider..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_DATA_SOURCES.filter((s) => s !== 'all').map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Genres</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <Badge key={g} variant="secondary">
                  {g}
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    onClick={() => setGenres((prev) => prev.filter((v) => v !== g))}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type a genre and press Enter..."
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addGenre()
                }
              }}
            />
          </Field>

          <Field>
            <FieldLabel>Studios</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {studios.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    onClick={() => setStudios((prev) => prev.filter((v) => v !== s))}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type a studio and press Enter..."
              value={studioInput}
              onChange={(e) => setStudioInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addStudio()
                }
              }}
            />
          </Field>

          <Field>
            <FieldLabel>Tags</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    onClick={() => setTags((prev) => prev.filter((v) => v !== t))}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type a tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
          </Field>
        </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          {selectedItems.length > 0 ? (
            <Button onClick={handleCreate}>
              Add {selectedItems.length} series to catalog
            </Button>
          ) : (
            <Button disabled={!title.trim()} onClick={handleCreate}>
              Create series
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
