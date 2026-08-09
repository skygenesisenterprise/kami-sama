'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Archive,
  Check,
  ChevronRight,
  Columns3,
  Eye,
  LayoutGrid,
  Layers,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Sparkles,
  Star,
  Trash2,
  Tv,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader } from '@/components/dash/page-header'
import { StatusBadge, type StatusTone } from '@/components/dash/status-badge'
import type { SourceResultItem } from '@/components/dash/source-result-card'
import { ApiError } from '@/lib/api/errors'
import { joinApiPath } from '@/lib/api/config'
import {
  animeApi,
  apiAnimeToSeriesItem,
  seriesItemToAnimeCreatePayload,
  type ApiAnime,
} from '@/lib/api/anime'
import { anilistApi } from '@/lib/api/anilist'
import { myanimelistApi } from '@/lib/api/myanimelist'
import { plexApi, type PlexLibrary, type PlexLibraryItem } from '@/lib/api/plex'
import { anilistItemToSourceItem, plexItemToSourceItem } from '@/lib/source-search'
import {
  SERIES_STATUS_TONE,
  METADATA_STATUS_LABEL,
  type SeriesItem,
  type MetadataStatus,
  type PublicationState as SeriesPublicationState,
} from '@/lib/series-catalog-data'
import {
  MOVIE_STATUS_TONE,
  type MovieItem,
  type PublicationState as MoviePublicationState,
} from '@/lib/movies-catalog-data'
import {
  TV_SHOW_STATUS_TONE,
  type TvShowItem,
  type PublicationState as TvShowPublicationState,
} from '@/lib/tv-shows-catalog-data'

type ContentKind = 'series' | 'movie' | 'tv-show'

type ContentAsset = {
  poster: string
  banner: string
  backdrop: string
  thumbnail: string
  still: string
}

type RowSeason = {
  id: string
  number: number
  title: string
  episodeCount: number
  year: number
  aired: boolean
}

type ContentRow = {
  key: string
  kind: ContentKind
  title: string
  subtitle: string
  status: string
  tone: StatusTone
  sources: string[]
  year: number | null
  rating: number
  genres: string[]
  metadataStatus: MetadataStatus
  totalEpisodes: number
  updatedAt: string
  updatedBy: string
  synopsis: string
  seasons: RowSeason[]
  assets: ContentAsset
}

type SortKey = 'title' | 'year' | 'rating' | 'episodes' | 'updated'
type SortDir = 'asc' | 'desc'

const KIND_LABEL: Record<ContentKind, string> = {
  series: 'Series',
  movie: 'Movie',
  'tv-show': 'TV Show',
}

const TABS: { value: ContentKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'series', label: 'Series' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv-show', label: 'TV Shows' },
]

const ALL_STATUSES: string[] = [
  'all',
  'Added',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

const ALL_SOURCES: string[] = [
  'all',
  'AniList',
  'MyAnimeList',
  'TMDB',
  'IMDb',
  'TheTVDB',
  'Kitsu',
  'Jellyfin',
  'Plex',
  'Trakt',
  'TMDb',
]

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

function toneFor(kind: ContentKind, status: string): StatusTone {
  switch (kind) {
    case 'series':
      return SERIES_STATUS_TONE[status as SeriesPublicationState]
    case 'movie':
      return MOVIE_STATUS_TONE[status as MoviePublicationState]
    case 'tv-show':
      return TV_SHOW_STATUS_TONE[status as TvShowPublicationState]
  }
}

function toSources(sources: { provider: string }[]): string[] {
  return sources.map((s) => s.provider)
}

function fromSeries(item: SeriesItem): ContentRow {
  return {
    key: `series-${item.id}`,
    kind: 'series',
    title: item.title,
    subtitle: item.titleOriginal,
    status: item.status,
    tone: SERIES_STATUS_TONE[item.status],
    sources: toSources(item.sources),
    year: item.year,
    rating: item.rating,
    genres: item.genres,
    metadataStatus: item.metadataStatus,
    totalEpisodes: item.totalEpisodes,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
    synopsis: item.synopsis,
    seasons: item.seasons,
    assets: {
      poster: item.assets.poster,
      banner: item.assets.banner,
      backdrop: item.assets.backdrop,
      thumbnail: '',
      still: '',
    },
  }
}

function fromMovie(item: MovieItem): ContentRow {
  return {
    key: `movie-${item.id}`,
    kind: 'movie',
    title: item.title,
    subtitle: item.titleOriginal,
    status: item.status,
    tone: MOVIE_STATUS_TONE[item.status],
    sources: toSources(item.sources),
    year: item.year,
    rating: item.rating,
    genres: item.genres,
    metadataStatus: item.metadataStatus,
    totalEpisodes: 0,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
    synopsis: item.synopsis,
    seasons: [],
    assets: {
      poster: item.assets.poster,
      banner: item.assets.banner,
      backdrop: item.assets.backdrop,
      thumbnail: '',
      still: '',
    },
  }
}

function fromTvShow(item: TvShowItem): ContentRow {
  return {
    key: `tv-show-${item.id}`,
    kind: 'tv-show',
    title: item.title,
    subtitle: item.titleOriginal,
    status: item.status,
    tone: TV_SHOW_STATUS_TONE[item.status],
    sources: toSources(item.sources),
    year: item.year,
    rating: item.rating,
    genres: item.genres,
    metadataStatus: item.metadataStatus,
    totalEpisodes: item.totalEpisodes,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
    synopsis: item.synopsis,
    seasons: item.seasons,
    assets: {
      poster: item.assets.poster,
      banner: item.assets.banner,
      backdrop: item.assets.backdrop,
      thumbnail: '',
      still: '',
    },
  }
}

/* -------------------------------------------------------------------------- */
/*  Plex source → catalog rows                                                 */
/* -------------------------------------------------------------------------- */

function plexGenresFromItem(item: PlexLibraryItem): string[] {
  const raw = item.Genre
  if (Array.isArray(raw)) {
    const out: string[] = []
    for (const entry of raw) {
      const tag =
        typeof entry === 'string'
          ? entry
          : entry && typeof entry === 'object'
            ? (entry as Record<string, unknown>).tag
            : undefined
      if (typeof tag === 'string' && tag) out.push(tag)
    }
    return out
  }
  return item.genres ?? []
}

/** Routes a raw Plex image path through the server-side proxy (keeps the token server-side). */
function plexImageUrl(path: unknown): string {
  const raw = typeof path === 'string' ? path : ''
  if (!raw) return ''
  return joinApiPath(`/integrations/plex/image?path=${encodeURIComponent(raw)}`)
}

function plexItemToContentRow(
  item: PlexLibraryItem,
  library: PlexLibrary,
): ContentRow | null {
  if (item.type !== 'movie' && item.type !== 'show') return null
  const id = String(item.ratingKey ?? item.sourceId ?? item.id ?? '')
  if (!id) return null
  const title = String(item.title ?? item.name ?? 'Unknown')
  const kind: ContentKind = item.type === 'movie' ? 'movie' : 'tv-show'
  const backdrop = plexImageUrl(item.art)
  const poster = plexImageUrl(item.thumb)
  return {
    key: `plex-${id}`,
    kind,
    title,
    subtitle: String(item.originalTitle ?? ''),
    status: 'Added',
    tone: kind === 'movie' ? MOVIE_STATUS_TONE.Added : TV_SHOW_STATUS_TONE.Added,
    sources: ['Plex'],
    year: typeof item.year === 'number' ? item.year : null,
    rating: typeof item.rating === 'number' ? item.rating : 0,
    genres: plexGenresFromItem(item),
    metadataStatus: 'synced',
    totalEpisodes: typeof item.leafCount === 'number' ? item.leafCount : 0,
    updatedAt: 'just now',
    updatedBy: 'Plex',
    synopsis: String(item.summary ?? item.overview ?? ''),
    seasons: [],
    assets: { poster, banner: backdrop, backdrop, thumbnail: '', still: '' },
  }
}

export default function ContentCatalogPage() {
  const [tab, setTab] = React.useState<ContentKind | 'all'>('all')
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [source, setSource] = React.useState('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('title')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    status: true,
    type: true,
    year: true,
    genres: true,
    rating: true,
    metadata: true,
    sources: true,
    updated: true,
  })

  const [seriesItems, setSeriesItems] = React.useState<SeriesItem[]>([])
  const [movies, setMovies] = React.useState<MovieItem[]>([])
  const [tvShows, setTvShows] = React.useState<TvShowItem[]>([])
  const [localRows, setLocalRows] = React.useState<ContentRow[]>([])

  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [inspecting, setInspecting] = React.useState<ContentRow | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [syncing, setSyncing] = React.useState<string | null>(null)
  const [syncingAll, setSyncingAll] = React.useState(false)
  const [syncProgress, setSyncProgress] = React.useState({ done: 0, total: 0 })
  const [page, setPage] = React.useState(1)

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
      setSeriesItems(all.map(apiAnimeToSeriesItem))
      setLoadError(null)
    } catch (err) {
      setLoadError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  /** IDs already persisted in the backend catalog (anime table), used to
   *  avoid showing an imported Plex title both as an ephemeral Plex row and
   *  as a persisted series row. */
  const persistedIdsRef = React.useRef<Set<string>>(new Set())
  persistedIdsRef.current = new Set(seriesItems.map((s) => s.id))

  const fetchPlexCatalog = React.useCallback(async () => {
    let libraries: PlexLibrary[] = []
    try {
      const res = await plexApi.libraries()
      libraries = res.items
    } catch {
      return
    }
    if (libraries.length === 0) return
    const batches = await Promise.all(
      libraries.map((lib) =>
        plexApi
          .items(lib.id, { limit: 200 })
          .then((r) => r.items)
          .catch(() => [] as PlexLibraryItem[]),
      ),
    )
    const plexRows = batches.flatMap((items, i) =>
      items
        .map((item) => plexItemToContentRow(item, libraries[i]))
        .filter((row): row is ContentRow => row !== null),
    )
    if (plexRows.length === 0) return
    setLocalRows((prev) => {
      const existing = new Set(prev.map((r) => r.key))
      // A Plex row whose rating key matches a persisted series is already in
      // the catalog — skip it to avoid duplicates.
      return [
        ...plexRows.filter(
          (r) =>
            !existing.has(r.key) &&
            !persistedIdsRef.current.has(r.key.replace(/^plex-/, '')),
        ),
        ...prev,
      ]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persistedIdsRef
    // is read lazily at call time; it always holds the latest series ids.
  }, [])

  React.useEffect(() => {
    void fetchCatalog()
    void fetchPlexCatalog()
  }, [fetchCatalog, fetchPlexCatalog])

  const rows = React.useMemo(() => {
    return [
      ...localRows,
      ...seriesItems.map(fromSeries),
      ...movies.map(fromMovie),
      ...tvShows.map(fromTvShow),
    ]
  }, [localRows, seriesItems, movies, tvShows])

  const counts = React.useMemo(() => {
    const out = new Map<ContentKind | 'all', number>([
      ['all', rows.length],
      ['series', 0],
      ['movie', 0],
      ['tv-show', 0],
    ])
    for (const row of rows) {
      out.set(row.kind, (out.get(row.kind) ?? 0) + 1)
    }
    return out
  }, [rows])

  const stats = React.useMemo(() => {
    const published = rows.filter((r) => r.status === 'Published').length
    const drafts = rows.filter((r) => r.status === 'Added').length
    const metadataErrors = rows.filter(
      (r) => r.metadataStatus === 'error' || r.metadataStatus === 'missing',
    ).length
    return { total: rows.length, published, drafts, metadataErrors }
  }, [rows])

  const filtered = React.useMemo(() => {
    let next = rows.filter((row) => {
      const matchesTab = tab === 'all' || row.kind === tab
      const haystack = `${row.title} ${row.subtitle}`.toLowerCase()
      const matchesQuery = haystack.includes(query.toLowerCase())
      const matchesStatus = status === 'all' || row.status === status
      const matchesSource =
        source === 'all' || row.sources.includes(source)
      return matchesTab && matchesQuery && matchesStatus && matchesSource
    })

    next = [...next].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'year':
          cmp = (a.year ?? 0) - (b.year ?? 0)
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
  }, [rows, tab, query, status, source, sortKey, sortDir])

  const PAGE_SIZE = 50
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const canGoPrevious = safePage > 1
  const canGoNext = safePage < totalPages

  React.useEffect(() => {
    setPage(1)
  }, [tab, query, status, source])

  const allSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selected.has(r.key))

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        for (const row of pagedRows) next.delete(row.key)
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        for (const row of pagedRows) next.add(row.key)
        return next
      })
    }
  }

  const toggleOne = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const applyStatusLocal = (keys: Set<string>, newStatus: string) => {
    setLocalRows((prev) =>
      prev.map((r) =>
        keys.has(r.key)
          ? { ...r, status: newStatus, tone: toneFor(r.kind, newStatus) }
          : r,
      ),
    )
    const movieKeys = keys
    setMovies((prev) =>
      prev.map((m) =>
        movieKeys.has(`movie-${m.id}`)
          ? { ...m, status: newStatus as MoviePublicationState }
          : m,
      ),
    )
    const tvShowKeys = keys
    setTvShows((prev) =>
      prev.map((t) =>
        tvShowKeys.has(`tv-show-${t.id}`)
          ? { ...t, status: newStatus as TvShowPublicationState }
          : t,
      ),
    )
  }

  const bulkAction = async (action: 'Publish' | 'Archive' | 'Delete') => {
    const keys = selected
    if (keys.size === 0) return
    setSelected(new Set())

    if (action === 'Delete') {
      setLocalRows((prev) => prev.filter((r) => !keys.has(r.key)))
      setMovies((prev) => prev.filter((m) => !keys.has(`movie-${m.id}`)))
      setTvShows((prev) => prev.filter((t) => !keys.has(`tv-show-${t.id}`)))
      if (inspecting && keys.has(inspecting.key)) setInspecting(null)
    } else {
      applyStatusLocal(keys, action === 'Publish' ? 'Published' : 'Archived')
    }

    const seriesKeys = [...keys].filter((k) => k.startsWith('series-'))
    const seriesIds = seriesKeys.map((k) => k.replace(/^series-/, ''))
    const plexKeys = [...keys].filter((k) => k.startsWith('plex-'))
    const plexRatingKeys = plexKeys.map((k) => k.replace(/^plex-/, ''))
    const nextStatus = action === 'Publish' ? 'published' : 'archived'
    let failed = 0

    if (seriesIds.length > 0 || plexRatingKeys.length > 0) {
      const jobs: Promise<unknown>[] = [
        ...seriesIds.map((id) =>
          action === 'Delete' ? animeApi.remove(id) : animeApi.update(id, { status: nextStatus }),
        ),
        ...plexRatingKeys.map(async (ratingKey) => {
          // Plex rows are ephemeral (fetched from the Plex API): persist them
          // into the catalog first, then apply the requested action server-side.
          const res = await plexApi.importItem(ratingKey)
          if (action === 'Delete') return animeApi.remove(res.animeId)
          return animeApi.update(res.animeId, { status: nextStatus })
        }),
      ]
      const results = await Promise.allSettled(jobs)
      failed = results.filter((r) => r.status === 'rejected').length

      if (failed === 0 && plexKeys.length > 0) {
        // Imported Plex rows are now persisted series — drop the ephemeral rows.
        setLocalRows((prev) => prev.filter((r) => !plexKeys.includes(r.key)))
      }
      await fetchCatalog()
      await fetchPlexCatalog()
    }

    if (failed === 0) {
      toast.success(`${action} applied to ${keys.size} items`)
    } else {
      toast.error(`${action} failed for ${failed} items`, {
        description: 'Some items could not be updated.',
      })
    }
  }

  const removeRow = async (row: ContentRow) => {
    if (row.kind === 'series') {
      try {
        await animeApi.remove(row.key.replace(/^series-/, ''))
        setSeriesItems((prev) =>
          prev.filter((s) => `series-${s.id}` !== row.key)
        )
      } catch (err) {
        toast.error(formatApiError(err))
        return
      }
    } else if (row.key.startsWith('plex-')) {
      // Persist the ephemeral Plex row first (upsert), then delete the
      // catalog record so the removal is reflected server-side.
      try {
        const res = await plexApi.importItem(row.key.replace(/^plex-/, ''))
        await animeApi.remove(res.animeId)
        setLocalRows((prev) => prev.filter((r) => r.key !== row.key))
      } catch (err) {
        toast.error(formatApiError(err))
        return
      }
    } else {
      setLocalRows((prev) => prev.filter((r) => r.key !== row.key))
      if (row.kind === 'movie') {
        setMovies((prev) => prev.filter((m) => `movie-${m.id}` !== row.key))
      } else if (row.kind === 'tv-show') {
        setTvShows((prev) => prev.filter((t) => `tv-show-${t.id}` !== row.key))
      }
    }
    if (inspecting?.key === row.key) setInspecting(null)
    toast.success(`"${row.title}" deleted`)
  }

  const archiveRow = async (row: ContentRow) => {
    if (row.kind === 'series') {
      try {
        await animeApi.update(row.key.replace(/^series-/, ''), {
          status: 'archived',
        })
        setSeriesItems((prev) =>
          prev.map((s) =>
            `series-${s.id}` === row.key ? { ...s, status: 'Archived' } : s,
          ),
        )
        toast.success(`"${row.title}" archived`)
      } catch (err) {
        toast.error(formatApiError(err))
      }
      return
    }
    if (row.key.startsWith('plex-')) {
      // Persist the ephemeral Plex row first, then archive it server-side.
      try {
        const res = await plexApi.importItem(row.key.replace(/^plex-/, ''))
        await animeApi.update(res.animeId, { status: 'archived' })
        setLocalRows((prev) =>
          prev.map((r) =>
            r.key === row.key
              ? { ...r, status: 'Archived', tone: toneFor(r.kind, 'Archived') }
              : r,
          ),
        )
        toast.success(`"${row.title}" archived`)
      } catch (err) {
        toast.error(formatApiError(err))
      }
      return
    }
    setLocalRows((prev) =>
      prev.map((r) =>
        r.key === row.key
          ? { ...r, status: 'Archived', tone: toneFor(r.kind, 'Archived') }
          : r,
      ),
    )
    if (row.kind === 'movie') {
      setMovies((prev) =>
        prev.map((m) =>
          `movie-${m.id}` === row.key
            ? { ...m, status: 'Archived' as MoviePublicationState }
            : m,
        ),
      )
    } else if (row.kind === 'tv-show') {
      setTvShows((prev) =>
        prev.map((t) =>
          `tv-show-${t.id}` === row.key
            ? { ...t, status: 'Archived' as TvShowPublicationState }
            : t,
        ),
      )
    }
    if (inspecting?.key === row.key) {
      setInspecting({ ...row, status: 'Archived', tone: toneFor(row.kind, 'Archived') })
    }
    toast.success(`"${row.title}" archived`)
  }

  const handleCreated = (row: ContentRow | null) => {
    setTab('all')
    if (row === null || row.kind === 'series') {
      // Refresh both the backend catalog (the imported item is persisted there
      // with its provider assets) and the live Plex rows so the newly added
      // title shows up with its artwork right away.
      void fetchCatalog()
      void fetchPlexCatalog()
      return
    }
    setLocalRows((prev) => [row, ...prev])
  }

  /** Per-row sync result shared by the single-row and bulk sync flows. */
  type SyncOutcome = {
    status: 'ok' | 'empty' | 'error'
    row?: ContentRow
    assetsGained: number
    error?: string
  }

  /**
   * Shared sync logic: refreshes provider data for a row and merges missing
   * fields (assets, synopsis, genres, sources…) back into catalog state.
   * Returns the merged row and how many missing assets were fetched.
   */
  const syncRowInternal = React.useCallback(
    async (row: ContentRow): Promise<SyncOutcome> => {
      try {
        if (row.kind === 'series') {
          const animeId = row.key.replace('series-', '')
          // Call backend sync to enrich data from sources
          try {
            await animeApi.sync(animeId)
          } catch {
            // Sync may fail if sources not configured, continue with search
          }
          // Then fetch fresh data
          let updatedSeries: SeriesItem | null = null
          try {
            const freshAnime = await animeApi.get(animeId)
            updatedSeries = apiAnimeToSeriesItem(freshAnime)
          } catch {
            // Backend fetch failed
          }

          if (updatedSeries) {
            setSeriesItems((prev) =>
              prev.map((s) =>
                `series-${s.id}` === row.key ? updatedSeries! : s,
              ),
            )
            const assetsBefore = assetCount(row.assets)
            const syncedRow: ContentRow = {
              ...row,
              seasons: updatedSeries.seasons,
              assets: {
                poster: updatedSeries.assets.poster,
                banner: updatedSeries.assets.banner,
                backdrop: updatedSeries.assets.backdrop,
                thumbnail: row.assets.thumbnail,
                still: row.assets.still,
              },
            }
            setInspecting((cur) => (cur?.key === row.key ? syncedRow : cur))
            return {
              status: 'ok',
              row: syncedRow,
              assetsGained: Math.max(
                0,
                assetCount(syncedRow.assets) - assetsBefore,
              ),
            }
          }
          return { status: 'empty', assetsGained: 0 }
        }

        // For non-series items, search sources and merge client-side
        const { hits } = await searchAllSources(row.title, 8)
        const hit = bestSourceHit(row.title, hits)
        if (!hit) {
          return { status: 'empty', assetsGained: 0 }
        }
        const assetsBefore = assetCount(row.assets)
        const merged = mergeSourceIntoRow(row, hit)
        setLocalRows((prev) =>
          prev.map((r) => (r.key === row.key ? merged : r)),
        )
        setInspecting((cur) => (cur?.key === row.key ? merged : cur))
        return {
          status: 'ok',
          row: merged,
          assetsGained: Math.max(0, assetCount(merged.assets) - assetsBefore),
        }
      } catch (err) {
        return {
          status: 'error',
          assetsGained: 0,
          error: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    },
    [],
  )

  const syncRow = async (row: ContentRow) => {
    setSyncing(row.key)
    try {
      const outcome = await syncRowInternal(row)
      if (outcome.status === 'ok') {
        toast.success(`"${row.title}" synced`)
      } else if (outcome.status === 'empty') {
        toast.info(`No metadata found for "${row.title}"`)
      } else {
        toast.error(
          outcome.error
            ? `Sync failed: ${outcome.error}`
            : `Sync failed for "${row.title}"`,
        )
      }
    } catch (err) {
      toast.error(`Sync failed: ${formatApiError(err)}`)
    } finally {
      setSyncing(null)
    }
  }

  /**
   * Bulk sync: refreshes every row in the catalog (series, movies, TV shows)
   * so missing provider data — assets, metadata, sources — is fetched. Runs in
   * small parallel batches to stay gentle on the API, with live progress.
   */
  const syncAllRows = async () => {
    if (syncingAll || rows.length === 0) return
    const targets = [...rows]
    setSyncingAll(true)
    setSyncProgress({ done: 0, total: targets.length })
    let synced = 0
    let skipped = 0
    let assetsGained = 0
    let failed = 0
    const BATCH_SIZE = 5
    try {
      for (let i = 0; i < targets.length; i += BATCH_SIZE) {
        const batch = targets.slice(i, i + BATCH_SIZE)
        const outcomes = await Promise.allSettled(
          batch.map((row) => syncRowInternal(row)),
        )
        for (const out of outcomes) {
          if (out.status === 'fulfilled') {
            if (out.value.status === 'ok') {
              synced += 1
              assetsGained += out.value.assetsGained
            } else if (out.value.status === 'error') {
              failed += 1
            } else {
              skipped += 1
            }
          } else {
            failed += 1
          }
        }
        setSyncProgress({
          done: Math.min(i + batch.length, targets.length),
          total: targets.length,
        })
      }
    } finally {
      setSyncingAll(false)
    }

    if (synced === 0 && failed === 0) {
      toast.info('Nothing to sync')
      return
    }
    const parts = [
      `${synced} synced`,
      skipped > 0 ? `${skipped} no match` : null,
      failed > 0 ? `${failed} failed` : null,
    ].filter(Boolean)
    const assetsDesc =
      assetsGained > 0
        ? `${assetsGained} missing asset${assetsGained === 1 ? '' : 's'} fetched`
        : 'No missing assets found'
    if (failed === 0) {
      toast.success(parts.join(' · '), { description: assetsDesc })
    } else {
      toast.error(parts.join(' · '), { description: assetsDesc })
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Content"
        description="Manage all media content in Kami-Sama. Edit metadata, sync sources, and control publication state."
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => void syncAllRows()}
          disabled={syncingAll || rows.length === 0}
          title="Sync all catalog items and fetch missing provider assets & metadata"
        >
          {syncingAll ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {syncingAll && syncProgress.total > 0
            ? `Syncing ${syncProgress.done}/${syncProgress.total}…`
            : 'Sync All'}
        </Button>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total items"
          value={stats.total}
          icon={<Layers className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={<Rocket className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Added"
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
            placeholder="Search content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All sources' : s}
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

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as ContentKind | 'all')}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              {t.label}
              <span className="rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {counts.get(t.value) ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {selected.size > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
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
                <Trash2 data-icon="inline-start" />
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
              Loading content…
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Failed to load content: {loadError}
            </div>
          ) : filtered.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                {rows.length === 0 ? (
                  <>
                    <EmptyTitle>No content yet</EmptyTitle>
                    <EmptyDescription>
                      Add a series, movie or TV show to your catalog to get
                      started.
                    </EmptyDescription>
                  </>
                ) : (
                  <>
                    <EmptyTitle>No content found</EmptyTitle>
                    <EmptyDescription>
                      No content matches the current filters. Try adjusting
                      your search.
                    </EmptyDescription>
                  </>
                )}
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
                    {columns.metadata && (
                      <TableHead className="hidden xl:table-cell">
                        Metadata
                      </TableHead>
                    )}
                    {columns.sources && (
                      <TableHead className="hidden md:table-cell">
                        Sources
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
                  {pagedRows.map((row) => (
                    <TableRow
                      key={row.key}
                      data-state={selected.has(row.key) ? 'selected' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(row.key)}
                          onCheckedChange={() => toggleOne(row.key)}
                          aria-label={`Select ${row.title}`}
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="flex flex-col items-start gap-0.5 text-left"
                          onClick={() => setInspecting(row)}
                        >
                          <span className="max-w-72 truncate font-medium hover:underline">
                            {row.title}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {row.subtitle}
                          </span>
                        </button>
                      </TableCell>
                      {columns.status && (
                        <TableCell>
                          <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                        </TableCell>
                      )}
                      {columns.type && (
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {KIND_LABEL[row.kind]}
                          </Badge>
                        </TableCell>
                      )}
                      {columns.year && (
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {row.year ?? '—'}
                        </TableCell>
                      )}
                      {columns.genres && (
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex gap-1">
                            {row.genres.slice(0, 2).map((g) => (
                              <Badge key={g} variant="secondary" className="text-xs">
                                {g}
                              </Badge>
                            ))}
                            {row.genres.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{row.genres.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {columns.rating && (
                        <TableCell className="hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
                            <Star className="size-3 fill-gold text-gold" />
                            {row.rating > 0 ? row.rating.toFixed(1) : '—'}
                          </span>
                        </TableCell>
                      )}
                      {columns.metadata && (
                        <TableCell className="hidden xl:table-cell">
                          <StatusBadge tone={METADATA_TONE[row.metadataStatus]}>
                            {METADATA_STATUS_LABEL[row.metadataStatus]}
                          </StatusBadge>
                        </TableCell>
                      )}
                      {columns.sources && (
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {row.sources.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : (
                              row.sources.map((src) => (
                                <Badge
                                  key={src}
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {src}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                      )}
                      {columns.updated && (
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {row.updatedAt}
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
                                onClick={() => setInspecting(row)}
                              >
                                <Pencil />
                                Edit content
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={syncing === row.key}
                                onClick={() => void syncRow(row)}
                              >
                                {syncing === row.key ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <RefreshCw />
                                )}
                                {syncing === row.key
                                  ? 'Syncing…'
                                  : 'Sync metadata'}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => archiveRow(row)}>
                                <Archive />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => removeRow(row)}
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
              {pagedRows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-ring/40"
                  onClick={() => setInspecting(row)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="line-clamp-1 text-sm leading-snug font-medium">
                        {row.title}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {row.subtitle}
                      </p>
                    </div>
                    <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {row.genres.slice(0, 3).map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-gold text-gold" />
                      {row.rating > 0 ? row.rating.toFixed(1) : '—'}
                    </span>
                    <span>{row.year ?? '—'}</span>
                    {row.totalEpisodes > 0 ? (
                      <span>{row.totalEpisodes} eps</span>
                    ) : null}
                    <Badge variant="outline" className="text-xs">
                      {KIND_LABEL[row.kind]}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length === 0
                ? 'Showing 0 items'
                : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${(safePage - 1) * PAGE_SIZE + pagedRows.length} of ${filtered.length} items`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoPrevious}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoNext}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ContentDetailSheet
        row={inspecting}
        onClose={() => setInspecting(null)}
        onDelete={(row) => removeRow(row)}
        onSync={(row) => void syncRow(row)}
        syncing={syncing === inspecting?.key}
      />

      <AddContentDialog
        open={adding}
        onOpenChange={setAdding}
        onCreated={handleCreated}
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

function ContentDetailSheet({
  row,
  onClose,
  onDelete,
  onSync,
  syncing,
}: {
  row: ContentRow | null
  onClose: () => void
  onDelete: (row: ContentRow) => void
  onSync: (row: ContentRow) => void
  syncing: boolean
}) {
  return (
    <Sheet open={row !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        {row && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{row.title}</SheetTitle>
                <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                {row.subtitle} · {KIND_LABEL[row.kind]}
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
                {row.kind === 'series' || row.kind === 'tv-show' ? (
                  <TabsTrigger value="seasons">Seasons</TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  {row.synopsis ? (
                    <Field>
                      <FieldLabel>Synopsis</FieldLabel>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {row.synopsis}
                      </p>
                    </Field>
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <p className="text-sm font-medium">
                        {KIND_LABEL[row.kind]}
                      </p>
                    </Field>
                    <Field>
                      <FieldLabel>Year</FieldLabel>
                      <p className="text-sm font-medium">{row.year ?? '—'}</p>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Rating</FieldLabel>
                      <p className="text-sm font-medium">
                        {row.rating > 0 ? row.rating.toFixed(1) : '—'}
                      </p>
                    </Field>
                    <Field>
                      <FieldLabel>Episodes</FieldLabel>
                      <p className="text-sm font-medium">
                        {row.totalEpisodes > 0 ? row.totalEpisodes : '—'}
                      </p>
                    </Field>
                  </div>
                  {row.genres.length > 0 ? (
                    <Field>
                      <FieldLabel>Genres</FieldLabel>
                      <div className="flex flex-wrap gap-1">
                        {row.genres.map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    </Field>
                  ) : null}
                </FieldGroup>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Assets</span>
                    <span className="text-xs text-muted-foreground">
                      Images retrieved from sources
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSync(row)}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Sync
                  </Button>
                </div>
                <AssetGrid assets={row.assets} />
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
                    <StatusBadge tone={METADATA_TONE[row.metadataStatus]}>
                      {METADATA_STATUS_LABEL[row.metadataStatus]}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Last updated</FieldLabel>
                      <p className="text-sm font-medium">{row.updatedAt}</p>
                    </Field>
                    <Field>
                      <FieldLabel>Updated by</FieldLabel>
                      <p className="text-sm font-medium">{row.updatedBy}</p>
                    </Field>
                  </div>
                </FieldGroup>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Assets</span>
                    <span className="text-xs text-muted-foreground">
                      Asset retrieval status
                    </span>
                  </div>
                  <StatusBadge tone="info">
                    {assetCount(row.assets)}/{assetTotal(row.assets)} retrieved
                  </StatusBadge>
                </div>
                <AssetList assets={row.assets} />
              </TabsContent>

              <TabsContent value="assets" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Assets</span>
                      <span className="text-xs text-muted-foreground">
                        Images retrieved from connected sources
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSync(row)}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3.5" />
                      )}
                      Sync
                    </Button>
                  </div>
                  <AssetGrid assets={row.assets} />
                </FieldGroup>
              </TabsContent>

              <TabsContent value="sources" className="pt-4">
                <FieldGroup>
                  {row.sources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No sources linked to this content yet. Use Sync to fetch
                      metadata from Plex, AniList or MyAnimeList.
                    </p>
                  ) : (
                    row.sources.map((src) => (
                      <div
                        key={src}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{src}</span>
                          <span className="text-xs text-muted-foreground">
                            Connected source
                          </span>
                        </div>
                        <StatusBadge tone="success">Active</StatusBadge>
                      </div>
                    ))
                  )}
                </FieldGroup>
              </TabsContent>

              {(row.kind === 'series' || row.kind === 'tv-show') && (
                <TabsContent value="seasons" className="pt-4">
                  <FieldGroup>
                    <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Seasons</span>
                        <span className="text-xs text-muted-foreground">
                          {row.seasons.length === 0
                            ? 'No seasons found'
                            : 'Click a season to list its episodes'}
                        </span>
                      </div>
                      <StatusBadge tone="info">
                        {row.seasons.length} season
                        {row.seasons.length !== 1 ? 's' : ''} ·{' '}
                        {row.seasons.reduce(
                          (acc, s) => acc + s.episodeCount,
                          0,
                        )}{' '}
                        episodes
                      </StatusBadge>
                    </div>
                    <SeasonList seasons={row.seasons} />
                  </FieldGroup>
                </TabsContent>
              )}
            </Tabs>
            <SheetFooter className="flex-row items-center border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onSync(row)}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Sync
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onDelete(row)
                  onClose()
                }}
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
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

function SeasonList({ seasons }: { seasons: RowSeason[] }) {
  const [openSeason, setOpenSeason] = React.useState<string | null>(null)

  if (seasons.length === 0) {
    return (
      <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        No seasons found for this title. Season data is populated when metadata
        is synced.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {seasons.map((season) => {
        const open = openSeason === season.id
        return (
          <div
            key={season.id}
            className="overflow-hidden rounded-lg border bg-card"
          >
            <button
              type="button"
              onClick={() => setOpenSeason(open ? null : season.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{season.title}</span>
                <span className="text-xs text-muted-foreground">
                  {season.year || '—'} · {season.episodeCount} episodes
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge tone={season.aired ? 'success' : 'neutral'}>
                  {season.aired ? 'Aired' : 'Upcoming'}
                </StatusBadge>
                <ChevronRight
                  className={cn(
                    'size-4 text-muted-foreground transition-transform',
                    open && 'rotate-90',
                  )}
                />
              </div>
            </button>
            {open && (
              <div className="flex flex-col border-t">
                {Array.from({ length: season.episodeCount }, (_, i) => i + 1).map(
                  (n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        S{season.number}E{n}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        Episode {n}
                      </span>
                      <StatusBadge tone="neutral">Published</StatusBadge>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const ASSET_ITEMS: { key: keyof ContentAsset; label: string }[] = [
  { key: 'poster', label: 'Poster' },
  { key: 'banner', label: 'Banner' },
  { key: 'backdrop', label: 'Backdrop' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'still', label: 'Still' },
]

function assetList(assets: ContentAsset): { label: string; src: string }[] {
  return ASSET_ITEMS.map(({ key, label }) => ({
    label,
    src: assets[key],
  }))
}

function assetCount(assets: ContentAsset): number {
  return assetList(assets).filter((a) => Boolean(a.src)).length
}

function assetTotal(assets: ContentAsset): number {
  return assetList(assets).length
}

function AssetGrid({ assets }: { assets: ContentAsset }) {
  const items = assetList(assets)
  if (items.every((a) => !a.src)) {
    return (
      <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        No assets retrieved yet.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <AssetTile key={item.label} {...item} />
      ))}
    </div>
  )
}

function AssetTile({ label, src }: { label: string; src: string }) {
  const [broken, setBroken] = React.useState(false)
  React.useEffect(() => setBroken(false), [src])
  const available = Boolean(src) && !broken
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {available ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="size-full object-cover"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <span className="text-xs font-medium">{label}</span>
        <StatusBadge tone={available ? 'success' : 'neutral'}>
          {available ? 'OK' : 'Missing'}
        </StatusBadge>
      </div>
    </div>
  )
}

function AssetList({ assets }: { assets: ContentAsset }) {
  const items = assetList(assets)
  if (items.every((a) => !a.src)) {
    return (
      <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        No assets retrieved yet.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-lg border px-3 py-2.5"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">{item.label}</span>
            {item.src ? (
              <span className="max-w-56 truncate font-mono text-xs text-muted-foreground">
                {item.src}
              </span>
            ) : null}
          </div>
          <StatusBadge tone={item.src ? 'success' : 'neutral'}>
            {item.src ? 'Retrieved' : 'Missing'}
          </StatusBadge>
        </div>
      ))}
    </div>
  )
}

function ImageIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

type AddSource = 'Plex' | 'AniList' | 'MyAnimeList'

type SourceHit = {
  source: AddSource
  item: SourceResultItem
}

type GroupedResult = {
  key: string
  title: string
  subtitle: string
  hits: SourceHit[]
}

const SOURCE_ICON: Record<AddSource, React.ReactNode> = {
  Plex: <Tv className="size-3.5" />,
  AniList: <Sparkles className="size-3.5" />,
  MyAnimeList: <List className="size-3.5" />,
}

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\b\d+(st|nd|rd|th)\b/g, '') // "2nd" -> ""
    .replace(/\bseason\s*\d+\b/g, '') // "season 2" -> ""
    .replace(/\bpart\s*\d+\b/g, '') // "part 2" -> ""
    .replace(/\bseries\s*\d+\b/g, '') // "series 2" -> ""
    .replace(/\bii+\b/g, '') // "II", "III" -> ""
    .replace(/\biv\b/g, '') // "IV" -> ""
    .trim()
    .replace(/\s+/g, ' ')
}

/** Extract the base title by stripping season/sequel markers. */
function baseTitle(title: string): string {
  return title
    .replace(/\s*[-:]\s*(?:Season|Cour)\s*\d+/i, '')
    .replace(/\s+\d+(?:st|nd|rd|th)\s+Season/i, '')
    .replace(/\s+Season\s*\d+/i, '')
    .replace(/\s+Part\s*\d+/i, '')
    .replace(/\s+II+$/i, '')
    .trim()
}

function groupByTitle(hits: SourceHit[]): GroupedResult[] {
  const map = new Map<string, GroupedResult>()
  for (const hit of hits) {
    const key = normalizeTitle(hit.item.title)
    const existing = map.get(key)
    if (existing) {
      existing.hits.push(hit)
    } else {
      map.set(key, {
        key,
        title: baseTitle(hit.item.title),
        subtitle: hit.item.subtitle ?? '',
        hits: [hit],
      })
    }
  }
  return [...map.values()]
}

async function searchAllSources(
  query: string,
  limit = 12,
): Promise<{ hits: SourceHit[]; failed: AddSource[] }> {
  const [plex, anilist, mal] = await Promise.allSettled([
    plexApi.search(query, { limit }),
    anilistApi.search(query, { perPage: limit }),
    myanimelistApi.search(query, { limit }),
  ])
  const hits: SourceHit[] = []
  const failed: AddSource[] = []
  if (plex.status === 'fulfilled') {
    for (const item of plex.value.items) {
      hits.push({ source: 'Plex', item: plexItemToSourceItem(item) })
    }
  } else {
    failed.push('Plex')
  }
  if (anilist.status === 'fulfilled') {
    for (const item of anilist.value.items) {
      hits.push({ source: 'AniList', item: anilistItemToSourceItem(item) })
    }
  } else {
    failed.push('AniList')
  }
  if (mal.status === 'fulfilled') {
    for (const item of mal.value.items) {
      hits.push({ source: 'MyAnimeList', item: { ...item, source: 'MyAnimeList' } })
    }
  } else {
    failed.push('MyAnimeList')
  }
  return { hits, failed }
}

/** Best matching source hit for a title (exact normalized match preferred). */
function bestSourceHit(title: string, hits: SourceHit[]): SourceHit | null {
  if (hits.length === 0) return null
  const key = normalizeTitle(title)
  return hits.find((h) => normalizeTitle(h.item.title) === key) ?? hits[0]
}

/** Deduplicate hits by source, keeping the first hit per source. */
function dedupeBySource(hits: SourceHit[]): SourceHit[] {
  const seen = new Set<string>()
  return hits.filter((h) => {
    if (seen.has(h.source)) return false
    seen.add(h.source)
    return true
  })
}

/** Merges missing fields from a source hit into a catalog row. */
function mergeSourceIntoRow(row: ContentRow, hit: SourceHit): ContentRow {
  const { item, source } = hit
  const merged: ContentRow = {
    ...row,
    synopsis: row.synopsis || item.overview || row.synopsis,
    genres: row.genres.length > 0 ? row.genres : (item.genres ?? []),
    year: row.year ?? item.year ?? row.year,
    rating: row.rating > 0 ? row.rating : ((item.rating ?? 0) / 10),
    sources: row.sources.includes(source)
      ? row.sources
      : [...row.sources, source],
    metadataStatus:
      row.metadataStatus === 'missing' ? 'synced' : row.metadataStatus,
    updatedAt: 'just now',
    updatedBy: 'Sync',
    assets: {
      poster: row.assets.poster || item.imageUrl || '',
      banner: row.assets.banner || item.artUrl || '',
      backdrop: row.assets.backdrop || item.artUrl || item.imageUrl || '',
      thumbnail: row.assets.thumbnail || '',
      still: row.assets.still || '',
    },
  }
  return merged
}

function AddContentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (row: ContentRow | null) => void
}) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<GroupedResult[]>([])

  const [searching, setSearching] = React.useState(false)
  const [acting, setActing] = React.useState<string | null>(null)
  const [done, setDone] = React.useState<Set<string>>(new Set())
  const [error, setError] = React.useState<string | null>(null)
  const [unavailable, setUnavailable] = React.useState<AddSource[]>([])

  const runSearch = React.useCallback(async (value: string) => {
    const q = value.trim()
    if (!q) {
      setResults([])
      return
    }
    setSearching(true)
    setError(null)
    try {
      const { hits, failed } = await searchAllSources(q, 12)
      setUnavailable(failed)
      setResults(groupByTitle(hits))
    } catch (err) {
      setError(formatApiError(err))
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  React.useEffect(() => {
    if (!open) return
    const timeout = setTimeout(() => {
      void runSearch(query)
    }, 350)
    return () => clearTimeout(timeout)
  }, [query, open, runSearch])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (next) {
      setQuery('')
      setResults([])
      setSearching(false)
      setActing(null)
      setDone(new Set())
      setError(null)
      setUnavailable([])
    }
  }

  const importFromSource = async (result: GroupedResult, source: AddSource) => {
    const hit = result.hits.find((h) => h.source === source)
    if (!hit) return
    const actionKey = `${result.key}::${source}`
    setActing(actionKey)
    try {
      if (source === 'Plex') {
        await plexApi.importItem(hit.item.id)
      } else if (source === 'AniList') {
        // Use AniList import endpoint to fetch all seasons/episodes
        const anilistId = hit.item.id
        await anilistApi.import(Number(anilistId))
      } else {
        const item = buildSeriesFromSource(hit.item, source)
        await animeApi.create(seriesItemToAnimeCreatePayload(item))
      }
      setDone((prev) => new Set(prev).add(actionKey))
      toast.success(`"${hit.item.title}" added from ${source}`)
      onCreated(null)
    } catch (err) {
      toast.error(`Import failed: ${formatApiError(err)}`)
    } finally {
      setActing(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add content</DialogTitle>
          <DialogDescription>
            Search for a title across Plex, AniList and MyAnimeList. When an
            item exists in several sources, choose the one you want.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search a title (series or movie)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="min-h-48">
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : searching ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching sources…
            </div>
          ) : query.trim() === '' ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              Type a title to search your sources.
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              No results for "{query.trim()}".
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="flex flex-col gap-2 pr-3">
                {results.map((result) => {
                  const coverUrl =
                    result.hits[0]?.item.imageUrl ||
                    result.hits[0]?.item.artUrl ||
                    ''
                  return (
                  <div
                    key={result.key}
                    className="flex items-center gap-3 rounded-lg border bg-card p-2 transition-colors hover:bg-muted/50"
                  >
                    {/* Provider artwork (poster, falls back to backdrop) */}
                    <div className="size-14 shrink-0 overflow-hidden rounded-md border bg-muted shadow-sm">
                      {coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverUrl}
                          alt={result.title}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <Tv className="size-5" />
                        </div>
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {result.title}
                      </p>
                      {result.subtitle ? (
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      ) : null}
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        {result.hits[0]?.item.year ? (
                          <span>{result.hits[0].item.year}</span>
                        ) : null}
                        {result.hits[0]?.item.type ? (
                          <>
                            <span>·</span>
                            <span>{result.hits[0].item.type}</span>
                          </>
                        ) : null}
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          {dedupeBySource(result.hits)
                            .map((h) => h.source)
                            .join(' + ')}
                        </span>
                      </div>
                    </div>

                    {/* Source buttons */}
                    <div className="flex shrink-0 items-center gap-1">
                      {dedupeBySource(result.hits).map((hit) => {
                        const actionKey = `${result.key}::${hit.source}`
                        const isActing = acting === actionKey
                        const isDone = done.has(actionKey)
                        return (
                          <Button
                            key={`${result.key}-${hit.source}`}
                            size="sm"
                            variant={isDone ? 'outline' : 'secondary'}
                            className="h-8 px-2"
                            disabled={isActing || isDone}
                            onClick={() => void importFromSource(result, hit.source)}
                          >
                            {isActing ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : isDone ? (
                              <Check className="size-3.5" />
                            ) : (
                              SOURCE_ICON[hit.source]
                            )}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {unavailable.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {unavailable.join(', ')}{' '}
            {unavailable.length === 1 ? 'is' : 'are'} not available. Configure
            them in the{' '}
            <Link href="/dash/sources" className="underline">
              Sources
            </Link>{' '}
            settings.
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function buildSeriesFromSource(item: SourceResultItem, source: AddSource): SeriesItem {
  return {
    id: `source-${Date.now()}`,
    slug: slugify(item.title),
    title: item.title,
    titleOriginal: item.subtitle || item.title,
    synopsis: item.overview ?? '',
    type: 'anime',
    status: 'Added',
    airingStatus: 'upcoming',
    genres: item.genres ?? [],
    studios: [],
    tags: [],
    year: item.year ?? new Date().getFullYear(),
    rating: typeof item.rating === 'number' ? item.rating / 10 : 0,
    seasonCount: 0,
    totalEpisodes: 0,
    ageRating: 'Unknown',
    assets: {
      poster: item.imageUrl ?? '',
      banner: item.artUrl ?? '',
      backdrop: item.artUrl ?? '',
    },
    externalIds:
      source === 'AniList'
        ? { anilist: item.id }
        : source === 'MyAnimeList'
          ? { myAnimeList: item.id }
          : { plex: item.id },
    sources: [
      {
        provider: source,
        externalId: item.id,
        lastSyncedAt: 'just now',
        status: 'active',
      },
    ],
    seasons: [],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: 'just now',
    updatedBy: 'New content',
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
}
