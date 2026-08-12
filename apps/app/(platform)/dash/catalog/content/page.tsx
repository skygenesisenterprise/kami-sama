'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Archive,
  Check,
  ChevronRight,
  Columns3,
  Download,
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
  animeContentKind,
  apiAnimeToMovieItem,
  apiAnimeToSeriesItem,
  apiAnimeToTvShowItem,
  type ApiAnime,
} from '@/lib/api/anime'
import {
  anilistApi,
  type AniListSearchItem,
  type AniListSearchResult,
} from '@/lib/api/anilist'
import { myanimelistApi } from '@/lib/api/myanimelist'
import { plexApi, type PlexLibrary, type PlexLibraryItem } from '@/lib/api/plex'
import {
  jellyfinApi,
  type JellyfinMirrorStats,
} from '@/lib/api/jellyfin'
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

/* -------------------------------------------------------------------------- */
/*  AniList source → catalog rows                                             */
/* -------------------------------------------------------------------------- */

/** Maps an AniList feed hit (trending / popular / seasonal) into an ephemeral
 *  catalog row with status "Added", so connected sources feed the catalog
 *  automatically instead of requiring a manual add. */
function anilistItemToContentRow(item: AniListSearchItem): ContentRow | null {
  const kind: ContentKind = item.format === 'MOVIE' ? 'movie' : 'series'
  const poster = item.coverImage ?? ''
  const banner = item.bannerImage ?? ''
  return {
    key: `anilist-${item.anilistId}`,
    kind,
    title: item.title,
    subtitle: item.japaneseTitle ?? '',
    status: 'Added',
    tone:
      kind === 'movie' ? MOVIE_STATUS_TONE.Added : SERIES_STATUS_TONE.Added,
    sources: ['AniList'],
    year: null,
    rating: typeof item.averageScore === 'number' ? item.averageScore / 10 : 0,
    genres: item.genres ?? [],
    metadataStatus: 'synced',
    totalEpisodes: typeof item.episodes === 'number' ? item.episodes : 0,
    updatedAt: 'just now',
    updatedBy: 'AniList',
    synopsis: '',
    seasons: [],
    assets: {
      poster,
      banner,
      backdrop: banner || poster,
      thumbnail: '',
      still: '',
    },
  }
}

/** Persists an ephemeral source row (Plex / AniList) into the catalog and
 *  returns the persisted anime id, so follow-up actions (archive, delete,
 *  bulk status) can target the backend record. */
async function persistSourceRow(key: string): Promise<string> {
  if (key.startsWith('plex-')) {
    const res = await plexApi.importItem(key.replace(/^plex-/, ''))
    return res.animeId
  }
  const res = await anilistApi.import(Number(key.replace(/^anilist-/, '')))
  return res.id
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
  const [importingSources, setImportingSources] = React.useState(false)
  const [importProgress, setImportProgress] = React.useState({ done: 0, total: 0 })
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
      allAnimeRef.current = all
      // Classify persisted rows by their real content kind: Plex rows carry
      // metadata.type ("Movie" / "Series"), AniList rows carry
      // metadata.format ("MOVIE", "TV", …). Without this every row lands in
      // the "Series" tab and movies are never treated as movies.
      const series: ApiAnime[] = []
      const movies: ApiAnime[] = []
      const tvShows: ApiAnime[] = []
      for (const item of all) {
        const kind = animeContentKind(item)
        if (kind === 'movie') movies.push(item)
        else if (kind === 'tv-show') tvShows.push(item)
        else series.push(item)
      }
      setSeriesItems(series.map(apiAnimeToSeriesItem))
      setMovies(movies.map(apiAnimeToMovieItem))
      setTvShows(tvShows.map(apiAnimeToTvShowItem))
      setLoadError(null)
    } catch (err) {
      setLoadError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  /** IDs + external IDs already persisted in the backend catalog (anime
   *  table), used to avoid showing a source title both as an ephemeral row
   *  (Plex / AniList) and as a persisted series row. */
  /** Raw persisted catalog rows (every content kind) backing the dedup refs
   *  below — computed from the raw API payload so movies / tv-shows are
   *  matched exactly like series regardless of their mapped item type. */
  const allAnimeRef = React.useRef<ApiAnime[]>([])
  const persistedIdsRef = React.useRef<Set<string>>(new Set())
  const persistedExternalRef = React.useRef<{
    plex: Set<string>
    anilist: Set<string>
  }>({ plex: new Set(), anilist: new Set() })
  // Source-row dedup (fetchPlexCatalog / fetchAnilistCatalog) must recognize
  // EVERY persisted row — series, movies and tv-shows alike — otherwise a
  // persisted movie would reappear as an ephemeral Plex/AniList row.
  persistedIdsRef.current = new Set(allAnimeRef.current.map((a) => a.id))
  {
    const plex = new Set<string>()
    const anilist = new Set<string>()
    for (const a of allAnimeRef.current) {
      const meta = a.metadata ?? {}
      const ext = (meta.external_ids ?? {}) as Record<string, unknown>
      if (typeof meta.sourceId === 'string' && meta.sourceId) plex.add(meta.sourceId)
      else if (typeof ext.plex === 'string' && ext.plex) plex.add(ext.plex)
      const al = meta.anilist_id
      if (typeof al === 'string' && al) anilist.add(al)
      else if (typeof al === 'number' && al > 0) anilist.add(String(al))
      else if (typeof ext.anilist === 'string' && ext.anilist) anilist.add(ext.anilist)
    }
    persistedExternalRef.current = { plex, anilist }
  }

  /** Ephemeral source rows the user deleted: keep them dismissed for the
   *  session so a source refresh doesn't bring them straight back. */
  const dismissedKeysRef = React.useRef<Set<string>>(new Set())

  const [sourceAvailability, setSourceAvailability] = React.useState<{
    plex: boolean
    anilist: boolean
  }>({ plex: false, anilist: false })

  const fetchPlexCatalog = React.useCallback(async () => {
    let libraries: PlexLibrary[] = []
    try {
      const res = await plexApi.libraries()
      libraries = res.items
    } catch {
      return
    }
    if (libraries.length === 0) return
    setSourceAvailability((prev) => ({ ...prev, plex: true }))
    // Paginate through each library (up to 1200 items) so as much of the
    // library as possible lands in the catalog as "Added" rows.
    const batches = await Promise.all(
      libraries.map(async (lib) => {
        const items: PlexLibraryItem[] = []
        const pageSize = 200
        for (let offset = 0; offset < 1200; offset += pageSize) {
          try {
            const res = await plexApi.items(lib.id, {
              limit: pageSize,
              offset,
            })
            items.push(...res.items)
            if (items.length >= res.total) break
          } catch {
            break
          }
        }
        return items
      }),
    )
    const plexRows = batches.flatMap((items, i) =>
      items
        .map((item) => plexItemToContentRow(item, libraries[i]))
        .filter((row): row is ContentRow => row !== null),
    )
    // Deduplicate within this run too: the same rating key can surface from
    // several libraries (or a refresh collides with an in-flight one) and
    // `existing` below only knows about rows from previous runs.
    const seenKeys = new Set<string>()
    const uniquePlexRows = plexRows.filter((r) => {
      if (seenKeys.has(r.key)) return false
      seenKeys.add(r.key)
      return true
    })
    if (uniquePlexRows.length === 0) return
    setLocalRows((prev) => {
      const existing = new Set(prev.map((r) => r.key))
      // A Plex row whose rating key matches a persisted catalog row (series,
      // movie or tv-show) is already in the catalog — skip it to avoid
      // duplicates.
      return [
        ...uniquePlexRows.filter(
          (r) =>
            !existing.has(r.key) &&
            !dismissedKeysRef.current.has(r.key) &&
            !persistedIdsRef.current.has(r.key.replace(/^plex-/, '')) &&
            !persistedExternalRef.current.plex.has(
              r.key.replace(/^plex-/, ''),
            ),
        ),
        ...prev,
      ]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the persisted
    // refs are read lazily at call time; they always hold the latest ids.
  }, [])

  /** Pulls trending / popular / seasonal titles from AniList and exposes them
   *  as ephemeral "Added" rows, so the catalog fills up automatically. */
  const fetchAnilistCatalog = React.useCallback(async () => {
    const feeds = await Promise.allSettled([
      anilistApi.trending({ perPage: 50 }),
      anilistApi.popular({ perPage: 50 }),
      anilistApi.seasonal({ perPage: 50 }),
    ])
    if (!feeds.some((r) => r.status === 'fulfilled')) return
    const items = feeds
      .filter(
        (r): r is PromiseFulfilledResult<AniListSearchResult> =>
          r.status === 'fulfilled',
      )
      .flatMap((r) => r.value.items)
    // Deduplicate across the three feeds by AniList id.
    const seen = new Set<number>()
    const anilistRows = items
      .filter((item) => {
        if (seen.has(item.anilistId)) return false
        seen.add(item.anilistId)
        return true
      })
      .map(anilistItemToContentRow)
      .filter((row): row is ContentRow => row !== null)
    if (anilistRows.length === 0) return
    setSourceAvailability((prev) => ({ ...prev, anilist: true }))
    setLocalRows((prev) => {
      const existing = new Set(prev.map((r) => r.key))
      return [
        ...anilistRows.filter(
          (r) =>
            !existing.has(r.key) &&
            !dismissedKeysRef.current.has(r.key) &&
            !persistedExternalRef.current.anilist.has(
              r.key.replace(/^anilist-/, ''),
            ),
        ),
        ...prev,
      ]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persistedExternalRef
    // is read lazily at call time; it always holds the latest series ids.
  }, [])

  /** Refresh every connected source at once. */
  const fetchSources = React.useCallback(async () => {
    await Promise.all([fetchPlexCatalog(), fetchAnilistCatalog()])
  }, [fetchPlexCatalog, fetchAnilistCatalog])

  /**
   * Bulk-imports content from the connected Plex libraries straight into the
   * catalog — one click, no manual adds. Each library is synced server-side
   * (POST /source/libraries/:libraryId/sync) so every item lands as a real
   * catalog row with its provider metadata and, for shows, the actual
   * season/episode grid. Runs libraries sequentially with live progress; the
   * catalog + ephemeral source rows are refreshed afterwards.
   */
  const importFromSources = React.useCallback(async () => {
    if (importingSources) return
    setImportingSources(true)
    let created = 0
    let updated = 0
    let removed = 0
    let failed = 0
    let libraries: PlexLibrary[] = []
    try {
      const res = await plexApi.libraries()
      libraries = res.items
    } catch {
      // Plex not reachable — fall through with an empty list and report it.
    }
    setImportProgress({ done: 0, total: libraries.length })
    for (let i = 0; i < libraries.length; i++) {
      try {
        const result = await plexApi.sync(libraries[i].id)
        created += result.itemsCreated ?? 0
        updated += result.itemsUpdated ?? 0
        removed += result.itemsRemoved ?? 0
      } catch {
        failed += 1
      }
      setImportProgress({ done: i + 1, total: libraries.length })
    }
    setImportingSources(false)
    setImportProgress({ done: 0, total: 0 })

    // Reflect the freshly persisted rows (and any new ephemeral discoveries).
    await fetchCatalog()
    await fetchSources()

    if (libraries.length === 0) {
      toast.error('Import failed: no Plex libraries found', {
        description: 'Connect a Plex server and enable its libraries in Sources settings.',
      })
      return
    }
    if (failed === libraries.length) {
      toast.error('Import failed', {
        description: `Could not sync any of the ${libraries.length} Plex librar${libraries.length === 1 ? 'y' : 'ies'}. Check the Sources settings.`,
      })
      return
    }
    const parts = [`${created} created`, `${updated} updated`]
    if (removed > 0) parts.push(`${removed} removed`)
    if (failed > 0) parts.push(`${failed} failed`)
    toast.success(`Imported ${libraries.length} Plex librar${libraries.length === 1 ? 'y' : 'ies'}`, {
      description: parts.join(' · '),
    })
  }, [fetchCatalog, fetchSources, importingSources])

  // Load the persisted catalog first so the persisted external-id refs are
  // populated before source discovery runs — otherwise already-imported
  // titles could appear both as ephemeral source rows and series rows.
  React.useEffect(() => {
    async function load() {
      await fetchCatalog()
      await fetchSources()
    }
    void load()
  }, [fetchCatalog, fetchSources])

  const rows = React.useMemo(() => {
    return [
      ...localRows,
      ...seriesItems.map(fromSeries),
      ...movies.map(fromMovie),
      ...tvShows.map(fromTvShow),
    ]
  }, [localRows, seriesItems, movies, tvShows])

  /** Normalized titles already present (persisted + discovered), used by the
   *  manual-add dialog to flag titles that are already in the catalog. */
  const existingTitles = React.useMemo(
    () => new Set(rows.map((r) => normalizeTitle(r.title))),
    [rows],
  )

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

    // Persisted catalog rows (series, movie, tv-show) all live in the anime
    // table — route every kind through the backend.
    const catalogKeys = [...keys].filter(
      (k) =>
        k.startsWith('series-') ||
        k.startsWith('movie-') ||
        k.startsWith('tv-show-'),
    )
    const catalogIds = catalogKeys.map((k) =>
      k.replace(/^(series|movie|tv-show)-/, ''),
    )
    // Ephemeral source rows (Plex / AniList): persisted on demand so the
    // requested action is reflected server-side.
    const sourceKeys = [...keys].filter(
      (k) => k.startsWith('plex-') || k.startsWith('anilist-'),
    )
    const nextStatus = action === 'Publish' ? 'published' : 'archived'
    let failed = 0

    if (catalogIds.length > 0 || sourceKeys.length > 0) {
      const jobs: Promise<unknown>[] = [
        ...catalogIds.map((id) =>
          action === 'Delete' ? animeApi.remove(id) : animeApi.update(id, { status: nextStatus }),
        ),
        ...sourceKeys.map(async (key) => {
          const animeId = await persistSourceRow(key)
          if (action === 'Delete') return animeApi.remove(animeId)
          return animeApi.update(animeId, { status: nextStatus })
        }),
      ]
      const results = await Promise.allSettled(jobs)
      failed = results.filter((r) => r.status === 'rejected').length

      if (action === 'Delete') {
        // Keep deleted source rows dismissed so a refresh doesn't bring them back.
        for (const key of sourceKeys) dismissedKeysRef.current.add(key)
      }

      if (failed === 0 && sourceKeys.length > 0) {
        // Imported source rows are now persisted series — drop the ephemeral
        // rows so they don't show up twice.
        setLocalRows((prev) => prev.filter((r) => !sourceKeys.includes(r.key)))
      }
      await fetchCatalog()
      await fetchSources()
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
    const catalogMatch = row.key.match(/^(series|movie|tv-show)-(.+)$/)
    if (catalogMatch) {
      try {
        await animeApi.remove(catalogMatch[2])
        if (row.kind === 'movie') {
          setMovies((prev) => prev.filter((m) => `movie-${m.id}` !== row.key))
        } else if (row.kind === 'tv-show') {
          setTvShows((prev) => prev.filter((t) => `tv-show-${t.id}` !== row.key))
        } else {
          setSeriesItems((prev) =>
            prev.filter((s) => `series-${s.id}` !== row.key)
          )
        }
      } catch (err) {
        toast.error(formatApiError(err))
        return
      }
    } else if (
      row.key.startsWith('plex-') ||
      row.key.startsWith('anilist-')
    ) {
      // Persist the ephemeral source row first (upsert), then delete the
      // catalog record so the removal is reflected server-side, and keep it
      // dismissed so the next source refresh doesn't bring it back.
      try {
        const animeId = await persistSourceRow(row.key)
        await animeApi.remove(animeId)
        dismissedKeysRef.current.add(row.key)
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
    const catalogMatch = row.key.match(/^(series|movie|tv-show)-(.+)$/)
    if (catalogMatch) {
      try {
        await animeApi.update(catalogMatch[2], { status: 'archived' })
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
        } else {
          setSeriesItems((prev) =>
            prev.map((s) =>
              `series-${s.id}` === row.key ? { ...s, status: 'Archived' } : s,
            ),
          )
        }
        toast.success(`"${row.title}" archived`)
      } catch (err) {
        toast.error(formatApiError(err))
      }
      return
    }
    if (row.key.startsWith('plex-') || row.key.startsWith('anilist-')) {
      // Persist the ephemeral source row first, then archive it server-side.
      try {
        const animeId = await persistSourceRow(row.key)
        await animeApi.update(animeId, { status: 'archived' })
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
      // Refresh the backend catalog first (the imported item is persisted there
      // with its provider assets), then the live source rows so the newly added
      // title shows up with its artwork right away and isn't re-discovered as
      // an ephemeral duplicate.
      void (async () => {
        await fetchCatalog()
        await fetchSources()
      })()
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
        const isSeries = row.key.startsWith('series-')
        const isTvShow = row.key.startsWith('tv-show-')
        const isMovie = row.key.startsWith('movie-')
        if (isSeries || isTvShow || isMovie) {
          const animeId = isSeries
            ? row.key.replace('series-', '')
            : isTvShow
              ? row.key.replace('tv-show-', '')
              : row.key.replace('movie-', '')
          // Call backend sync to enrich data from sources — for Plex-sourced
          // tv-shows this backfills the real season/episode grid server-side.
          try {
            await animeApi.sync(animeId)
          } catch {
            // Sync may fail if sources not configured, continue with search
          }
          // Then fetch fresh data
          try {
            const freshAnime = await animeApi.get(animeId)
            const assetsBefore = assetCount(row.assets)
            if (isSeries) {
              const updatedSeries = apiAnimeToSeriesItem(freshAnime)
              setSeriesItems((prev) =>
                prev.map((s) =>
                  `series-${s.id}` === row.key ? updatedSeries : s,
                ),
              )
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
            if (isTvShow) {
              const updatedShow = apiAnimeToTvShowItem(freshAnime)
              setTvShows((prev) =>
                prev.map((t) =>
                  `tv-show-${t.id}` === row.key ? updatedShow : t,
                ),
              )
              const syncedRow: ContentRow = {
                ...row,
                seasons: updatedShow.seasons,
                assets: {
                  poster: updatedShow.assets.poster,
                  banner: updatedShow.assets.banner,
                  backdrop: updatedShow.assets.backdrop,
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
            const updatedMovie = apiAnimeToMovieItem(freshAnime)
            setMovies((prev) =>
              prev.map((m) =>
                `movie-${m.id}` === row.key ? updatedMovie : m,
              ),
            )
            const syncedRow: ContentRow = {
              ...row,
              seasons: row.seasons,
              assets: {
                poster: updatedMovie.assets.poster,
                banner: updatedMovie.assets.banner,
                backdrop: updatedMovie.assets.backdrop,
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
          } catch {
            // Backend fetch failed
          }
          return { status: 'empty', assetsGained: 0 }
        }

        // For source rows (Plex / AniList) that have no backend record yet,
        // search sources and merge client-side.
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
   * so missing provider data — assets, metadata, sources — is fetched, then
   * triggers the DB → Jellyfin mirror so the media-server library reflects the
   * freshly synced catalog (the watch page delegates all HLS playback to it).
   * Runs in small parallel batches to stay gentle on the API, with live
   * progress. The mirror is best-effort: when Jellyfin is not configured the
   * catalog sync still succeeds, and the toast reports the mirror outcome
   * (running / mirrored counts / skipped).
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

    // DB → Jellyfin mirror: the catalog rows synced above (Plex-sourced) are
    // pushed into the media-server library so the watch page delegates HLS
    // playback to Jellyfin without an on-the-fly bridge. Best-effort — the
    // server answers MEDIA_SERVER_DISABLED / PLEX_DISABLED when the media
    // server or the content provider isn't configured, which we surface as
    // "mirror skipped" instead of failing the whole Sync All.
    const mirror = await runJellyfinMirror()

    if (synced === 0 && failed === 0 && !mirror?.started) {
      toast.info('Nothing to sync')
      return
    }
    const parts = [
      synced > 0 ? `${synced} synced` : null,
      skipped > 0 ? `${skipped} no match` : null,
      failed > 0 ? `${failed} failed` : null,
    ].filter(Boolean)
    const assetsDesc =
      assetsGained > 0
        ? `${assetsGained} missing asset${assetsGained === 1 ? '' : 's'} fetched`
        : 'No missing assets found'
    const mirrorDesc = describeMirror(mirror)
    const description = mirrorDesc
      ? [assetsDesc, mirrorDesc].join(' · ')
      : assetsDesc
    if (failed === 0) {
      toast.success(parts.join(' · '), { description })
    } else {
      toast.error(parts.join(' · '), { description })
    }
  }

  return (
    <main className="flex flex-col gap-6 select-none">
      <PageHeader
        title="Content"
        description="Manage all media content in Kami-Sama. Edit metadata, sync sources, and control publication state."
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => void syncAllRows()}
          disabled={syncingAll || rows.length === 0}
          title="Sync all catalog items, fetch missing provider assets & metadata, then mirror the catalog to the Jellyfin media server"
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => void importFromSources()}
          disabled={importingSources}
          title="Query your connected Plex libraries and add their content to the catalog automatically"
        >
          {importingSources ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          {importingSources && importProgress.total > 0
            ? `Importing ${importProgress.done}/${importProgress.total}…`
            : 'Import from sources'}
        </Button>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          title="Only needed when the title isn't already available from your connected sources"
        >
          <Plus data-icon="inline-start" />
          Add manually
        </Button>
      </PageHeader>

      {(sourceAvailability.anilist || sourceAvailability.plex) && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 shrink-0 text-primary/70" />
          Auto-discovered from{' '}
          {[
            sourceAvailability.plex ? 'Plex' : null,
            sourceAvailability.anilist ? 'AniList' : null,
          ]
            .filter(Boolean)
            .join(' and ')}{' '}
          with status “Added”. Add manually only if a title is missing.
        </p>
      )}

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
                      Content is discovered automatically from your connected
                      sources (Plex, AniList) with status “Added”. Use Add
                      manually for anything that's still missing.
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
        existingTitles={existingTitles}
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

/** Best matching source hit for a title (exact normalized match preferred).
 *  Plex is the default source: an exact Plex match wins, otherwise any Plex
 *  hit, before falling back to the other sources. */
function bestSourceHit(title: string, hits: SourceHit[]): SourceHit | null {
  if (hits.length === 0) return null
  const key = normalizeTitle(title)
  const exact = hits.filter((h) => normalizeTitle(h.item.title) === key)
  const exactPlex = exact.find((h) => h.source === 'Plex')
  if (exactPlex) return exactPlex
  const plex = hits.find((h) => h.source === 'Plex')
  if (plex) return plex
  return exact[0] ?? hits[0]
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
    // Plex is the default source: whenever the merged hit adds Plex, list it
    // first so the item's primary source stays Plex.
    sources: row.sources.includes('Plex')
      ? row.sources
      : source === 'Plex'
        ? [source, ...row.sources]
        : row.sources.includes(source)
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
  existingTitles,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (row: ContentRow | null) => void
  /** Normalized titles already present in the catalog (persisted + discovered). */
  existingTitles: Set<string>
}) {
  const isInCatalog = (result: GroupedResult) =>
    result.hits.some((h) => existingTitles.has(normalizeTitle(h.item.title)))
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

  /** Imports a grouped result from Plex — the only importable source. Other
   *  providers (AniList, MyAnimeList) are used for discovery only, so a title
   *  can never be attributed to them. */
  const importFromSource = async (result: GroupedResult, source: AddSource) => {
    if (source !== 'Plex') return
    const hit = result.hits.find((h) => h.source === 'Plex')
    if (!hit) return
    const actionKey = `${result.key}::Plex`
    setActing(actionKey)
    try {
      await plexApi.importItem(hit.item.id)
      setDone((prev) => new Set(prev).add(actionKey))
      toast.success(`"${hit.item.title}" added from Plex`)
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
            Titles already synced from your sources appear automatically in
            the catalog. Use this only when a title isn't available yet —
            imports come from Plex only.
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

                    {/* Source buttons — Plex is the only importable source: a
                        result found on other providers but missing on Plex gets
                        a hint instead of an import button, so no other source
                        can be attributed. The "In catalog" badge stays
                        non-blocking so sequels and re-imports remain possible. */}
                    <div className="flex shrink-0 items-center gap-1">
                      {isInCatalog(result) && (
                        <StatusBadge tone="success">
                          <Check className="size-3.5" />
                          In catalog
                        </StatusBadge>
                      )}
                      {result.hits.some((h) => h.source === 'Plex') ? (
                        (() => {
                          const actionKey = `${result.key}::Plex`
                          const isActing = acting === actionKey
                          const isDone = done.has(actionKey)
                          return (
                            <Button
                              key={`${result.key}-Plex`}
                              size="sm"
                              variant={isDone ? 'outline' : 'default'}
                              className="h-8 px-2"
                              title="Add from Plex"
                              disabled={isActing || isDone}
                              onClick={() => void importFromSource(result, 'Plex')}
                            >
                              {isActing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : isDone ? (
                                <Check className="size-3.5" />
                              ) : (
                                <Tv className="size-3.5" />
                              )}
                            </Button>
                          )
                        })()
                      ) : (
                        <span className="max-w-28 text-right text-[10px] text-muted-foreground">
                          Not on Plex
                        </span>
                      )}
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

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
}

/** Outcome of the DB → Jellyfin mirror triggered by Sync All. */
type MirrorOutcome = {
  started: boolean
  stats: JellyfinMirrorStats
}

/**
 * Launches the DB → Jellyfin mirror sync and returns its immediate outcome.
 * The POST answers fast (the mirror runs in the background) with the
 * in-flight status; a short poll captures the final counts when the catalog
 * is small enough to finish within the wait. Best-effort: Jellyfin or Plex
 * not configured (MEDIA_SERVER_DISABLED / PLEX_DISABLED) is reported as a
 * non-started mirror — Sync All must never fail because of it.
 */
async function runJellyfinMirror(): Promise<MirrorOutcome | null> {
  let response: { started: boolean; status: JellyfinMirrorStats }
  try {
    response = await jellyfinApi.sync()
  } catch {
    return null // media-server or content provider not configured
  }
  const outcome: MirrorOutcome = {
    started: response.started || response.status.status !== 'idle',
    stats: response.status,
  }
  // Mirror runs in the background — give it time to finish so the toast
  // shows real counts instead of only "started". Each bridged item can take
  // a couple of seconds (Plex direct-URL fetch + Jellyfin library scan), so
  // poll up to ~30s before falling back to the "started" summary.
  if (outcome.stats.status === 'running') {
    for (let i = 0; i < 60; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      try {
        const stats = await jellyfinApi.syncStatus()
        outcome.stats = stats
        if (stats.status !== 'running') break
      } catch {
        break
      }
    }
  }
  return outcome
}

/** Formats the mirror outcome for the Sync All toast description. */
function describeMirror(mirror: MirrorOutcome | null): string | null {
  if (!mirror || !mirror.started) return null
  const s = mirror.stats
  if (s.status === 'failed') {
    return s.errorMessage
      ? `Jellyfin mirror failed: ${s.errorMessage}`
      : 'Jellyfin mirror failed'
  }
  if (s.status === 'running') {
    return 'Jellyfin mirror started'
  }
  const parts: string[] = []
  if (s.itemsCreated + s.episodesCreated > 0) {
    parts.push(`${s.itemsCreated + s.episodesCreated} mirrored`)
  }
  if (s.itemsUpdated + s.episodesUpdated > 0) {
    parts.push(`${s.itemsUpdated + s.episodesUpdated} refreshed`)
  }
  if (parts.length === 0) {
    return 'Jellyfin mirror up to date'
  }
  return `Jellyfin mirror: ${parts.join(' · ')}`
}
