'use client'

import * as React from 'react'
import {
  AlertTriangle,
  Archive,
  Columns3,
  Eye,
  Film,
  Globe,
  GripVertical,
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { collectionsApi } from '@/lib/api/collections'
import type { ApiCollection } from '@/lib/api/collections'
import { mapApiCollectionToCollectionItem } from '@/lib/collections-api-mappers'
import {
  COLLECTIONS_MOCK,
  COLLECTION_STATUS_TONE,
  COLLECTION_TYPE_LABEL,
  ALL_COLLECTION_STATUSES,
  ALL_COLLECTION_TYPES,
  ALL_DATA_SOURCES,
  ALL_DISCOVER_FILTERS,
  DISCOVER_FILTER_LABEL,
  METADATA_STATUS_LABEL,
  getCollectionStats,
  setCollectionDiscover,
  type CollectionItem,
  type CollectionType,
  type DiscoverSection,
  type PublicationState,
  type MetadataStatus,
} from '@/lib/collections-catalog-data'

type SortKey = 'title' | 'type' | 'entries' | 'updated'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'type', label: 'Type' },
  { value: 'entries', label: 'Entries' },
  { value: 'updated', label: 'Last updated' },
]

const METADATA_TONE: Record<MetadataStatus, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  synced: 'success',
  stale: 'warning',
  error: 'destructive',
  missing: 'neutral',
}

const VISIBILITY_TONE: Record<string, 'success' | 'warning' | 'neutral'> = {
  public: 'success',
  unlisted: 'warning',
  private: 'neutral',
}

export default function CollectionsCatalogPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [source, setSource] = React.useState<string>('all')
  const [collectionType, setCollectionType] = React.useState<string>('all')
  const [discoverFilter, setDiscoverFilter] = React.useState<'all' | 'discover' | 'hidden'>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('title')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<CollectionItem | null>(null)
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    status: true,
    type: true,
    visibility: true,
    entries: true,
    tags: true,
    metadata: true,
    updated: true,
    discover: true,
  })
  const [collections, setCollections] = React.useState<CollectionItem[]>(COLLECTIONS_MOCK)
  const [apiMode, setApiMode] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [newCollectionOpen, setNewCollectionOpen] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function loadCollections() {
      try {
        const items = await collectionsApi.list()
        if (cancelled) return
        setCollections(items.map(mapApiCollectionToCollectionItem))
        setApiMode(true)
      } catch (error) {
        if (cancelled) return
        console.error('Failed to load collections from API', error)
        setCollections(COLLECTIONS_MOCK)
        setApiMode(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCollections()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = React.useMemo(() => getCollectionStats(collections), [collections])

  const filtered = React.useMemo(() => {
    let items = collections.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || item.status === status
      const matchesSource =
        source === 'all' ||
        item.sources.some((s) => s.provider === source)
      const matchesType =
        collectionType === 'all' || item.type === collectionType
      const matchesDiscover =
        discoverFilter === 'all' ||
        (discoverFilter === 'discover'
          ? item.status === 'Published'
          : item.status !== 'Published')
      return matchesQuery && matchesStatus && matchesSource && matchesType && matchesDiscover
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'type':
          cmp = a.type.localeCompare(b.type)
          break
        case 'entries':
          cmp = a.entries.length - b.entries.length
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
  }, [query, status, source, collectionType, discoverFilter, sortKey, sortDir, collections])

  const handleSaveDiscover = async (item: CollectionItem, draft: DiscoverSection) => {
    const description = `Discover settings updated for ${item.title}.`
    if (apiMode) {
      try {
        const updated = await collectionsApi.update(item.id, { discover: { ...draft } })
        const mapped = mapApiCollectionToCollectionItem(updated)
        setCollections((prev) => prev.map((c) => (c.id === item.id ? mapped : c)))
        toast.success('Changes saved', { description })
        setInspecting(null)
      } catch (error) {
        console.error('Failed to update collection discover settings', error)
        toast.error('Update failed', {
          description: 'The API could not update this collection.',
        })
      }
    } else {
      setCollectionDiscover(item.id, draft)
      toast.success('Changes saved', { description })
      setInspecting(null)
    }
  }

  const handleCollectionCreated = (created: ApiCollection) => {
    const mapped = mapApiCollectionToCollectionItem(created)
    setCollections((prev) => [mapped, ...prev])
    if (!apiMode) setApiMode(true)
  }

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
    toast.success(`${action} applied to ${selected.size} collections`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Collections"
        description="Manage curated collections of series. Organize by genre, theme, season, or editorial picks."
      >
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button
          size="sm"
          onClick={() => setNewCollectionOpen(true)}
        >
          <Plus data-icon="inline-start" />
          New collection
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total collections"
          value={stats.total}
          icon={<List className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={<Rocket className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Total entries"
          value={stats.totalEntries}
          icon={<Star className="size-4 text-muted-foreground" />}
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
            placeholder="Search collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={collectionType} onValueChange={(v) => setCollectionType(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_COLLECTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All types' : COLLECTION_TYPE_LABEL[t as CollectionType]}
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
              {ALL_COLLECTION_STATUSES.map((s) => (
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
          value={discoverFilter}
          onValueChange={(v) => setDiscoverFilter(v as 'all' | 'discover' | 'hidden')}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_DISCOVER_FILTERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {DISCOVER_FILTER_LABEL[f]}
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
            <EmptyTitle>
              {loading
                ? 'Loading collections…'
                : 'No collections found'}
            </EmptyTitle>
            <EmptyDescription>
              {loading
                ? 'Fetching collections from the API.'
                : 'No collections match the current filters. Try adjusting your search or create a new collection.'}
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
                {columns.visibility && (
                  <TableHead className="hidden md:table-cell">
                    Visibility
                  </TableHead>
                )}
                {columns.entries && (
                  <TableHead className="hidden lg:table-cell">
                    Entries
                  </TableHead>
                )}
                {columns.tags && (
                  <TableHead className="hidden xl:table-cell">
                    Tags
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
                {columns.discover && (
                  <TableHead className="hidden lg:table-cell">
                    Discover
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
                      <span className="line-clamp-1 max-w-72 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </button>
                  </TableCell>
                  {columns.status && (
                    <TableCell>
                      <StatusBadge tone={COLLECTION_STATUS_TONE[item.status]}>
                        {item.status}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.type && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {COLLECTION_TYPE_LABEL[item.type]}
                      </Badge>
                    </TableCell>
                  )}
                  {columns.visibility && (
                    <TableCell className="hidden md:table-cell">
                      <StatusBadge tone={VISIBILITY_TONE[item.visibility]}>
                        {item.visibility}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.entries && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.entries.length} series
                    </TableCell>
                  )}
                  {columns.tags && (
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
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
                  {columns.discover && (
                    <TableCell className="hidden lg:table-cell">
                      {item.status === 'Published' ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <LayoutGrid className="size-3" />
                          #{item.discover?.order ?? 1}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
                            Edit collection
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
                  <Badge variant="secondary" className="w-fit text-xs">
                    {COLLECTION_TYPE_LABEL[item.type]}
                  </Badge>
                </div>
                <StatusBadge tone={COLLECTION_STATUS_TONE[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.entries.length} series</span>
                <div className="flex items-center gap-1.5">
                  {item.status === 'Published' && (
                    <StatusBadge tone="info">Discover</StatusBadge>
                  )}
                  <StatusBadge tone={VISIBILITY_TONE[item.visibility]}>
                    {item.visibility}
                  </StatusBadge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {collections.length} collections
          {apiMode && ' · synced with API'}
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
        collections={collections}
        onClose={() => setInspecting(null)}
        onSaveDiscover={handleSaveDiscover}
      />

      <NewCollectionDialog
        open={newCollectionOpen}
        onOpenChange={setNewCollectionOpen}
        onCreated={handleCollectionCreated}
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

function nextDiscoverOrder(collections: CollectionItem[]): number {
  return Math.max(0, ...collections.map((c) => c.discover?.order ?? 0)) + 1
}

function CollectionDetailSheet({
  item,
  collections,
  onClose,
  onSaveDiscover,
}: {
  item: CollectionItem | null
  collections: CollectionItem[]
  onClose: () => void
  onSaveDiscover: (item: CollectionItem, draft: DiscoverSection) => void | Promise<void>
}) {
  const [discoverDraft, setDiscoverDraft] = React.useState<DiscoverSection>({
    enabled: true,
    order: 1,
  })

  React.useEffect(() => {
    if (!item) return
    setDiscoverDraft(
      item.discover
        ? { ...item.discover, enabled: true }
        : { enabled: true, order: nextDiscoverOrder(collections) },
    )
  }, [item, collections])

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={COLLECTION_STATUS_TONE[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                {COLLECTION_TYPE_LABEL[item.type]} · {item.entries.length} entries · Last updated{' '}
                {item.updatedAt} by {item.updatedBy}
              </SheetDescription>
            </SheetHeader>
            <Tabs
              defaultValue="overview"
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="entries">Entries</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="discover">Discover</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input defaultValue={item.title} />
                  </Field>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea rows={4} defaultValue={item.description} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Select defaultValue={item.type}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COLLECTION_TYPE_LABEL).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Visibility</FieldLabel>
                      <Select defaultValue={item.visibility}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <FieldLabel>Entries</FieldLabel>
                      <Input defaultValue={item.entries.length} readOnly />
                    </Field>
                  </div>
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

              <TabsContent value="entries" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {item.entries.length} series in this collection
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus data-icon="inline-start" />
                      Add series
                    </Button>
                  </div>
                  {item.entries
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((entry) => (
                      <div
                        key={entry.seriesId}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                      >
                        <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                          {entry.position}
                        </span>
                        <div className="flex flex-1 flex-col">
                          <span className="text-sm font-medium">
                            {entry.seriesTitle}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Added {entry.addedAt}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="size-7">
                          <X />
                          <span className="sr-only">Remove from collection</span>
                        </Button>
                      </div>
                    ))}
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
                    { key: 'poster', label: 'Poster', desc: 'Collection poster artwork' },
                    { key: 'banner', label: 'Banner', desc: 'Horizontal banner for collection pages' },
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

              <TabsContent value="discover" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Shown automatically when published
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Collections with status Published appear as a section on the public
                        Discover page.
                      </span>
                    </div>
                  </div>
                  <Field>
                    <FieldLabel>Order</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={discoverDraft.order}
                      onChange={(e) =>
                        setDiscoverDraft((prev) => ({
                          ...prev,
                          order: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                    />
                    <FieldDescription>
                      Lower numbers appear first on the Discover page.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Section title</FieldLabel>
                    <Input
                      value={discoverDraft.title ?? ''}
                      placeholder={item.title}
                      onChange={(e) =>
                        setDiscoverDraft((prev) => ({
                          ...prev,
                          title: e.target.value || undefined,
                        }))
                      }
                    />
                    <FieldDescription>
                      Leave empty to use the collection title.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Section subtitle</FieldLabel>
                    <Input
                      value={discoverDraft.subtitle ?? ''}
                      placeholder={item.description}
                      onChange={(e) =>
                        setDiscoverDraft((prev) => ({
                          ...prev,
                          subtitle: e.target.value || undefined,
                        }))
                      }
                    />
                    <FieldDescription>
                      Leave empty to use the collection description.
                    </FieldDescription>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>CTA label</FieldLabel>
                      <Input
                        value={discoverDraft.ctaLabel ?? ''}
                        placeholder="View all"
                        onChange={(e) =>
                          setDiscoverDraft((prev) => ({
                            ...prev,
                            ctaLabel: e.target.value || undefined,
                          }))
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Destination</FieldLabel>
                      <Input
                        value={discoverDraft.href ?? ''}
                        placeholder={`/catalog?collection=${item.slug}`}
                        onChange={(e) =>
                          setDiscoverDraft((prev) => ({
                            ...prev,
                            href: e.target.value || undefined,
                          }))
                        }
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <Button
                className="flex-1"
                onClick={() => {
                  void onSaveDiscover(item, discoverDraft)
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function NewCollectionDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (collection: ApiCollection) => void
}) {
  const [title, setTitle] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [type, setType] = React.useState<CollectionType>('editorial')
  const [visibility, setVisibility] = React.useState<'public' | 'private' | 'unlisted'>('private')
  const [status, setStatus] = React.useState<PublicationState>('Draft')
  const [tags, setTags] = React.useState('')
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTitle('')
      setSlug('')
      setDescription('')
      setType('editorial')
      setVisibility('private')
      setStatus('Draft')
      setTags('')
      setSlugTouched(false)
      setSubmitting(false)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return
    setSubmitting(true)
    try {
      const created = await collectionsApi.create({
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        type,
        visibility,
        status,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
      onCreated(created)
      toast.success('Collection created', {
        description: `${created.title} was created successfully.`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create collection', error)
      toast.error('Creation failed', {
        description: 'The API could not create this collection.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>
            Create a curated collection that can be displayed on the Discover page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input
                value={title}
                placeholder="e.g. Best Anime of 2025"
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slugTouched) {
                    setSlug(slugify(e.target.value))
                  }
                }}
              />
            </Field>
            <Field>
              <FieldLabel>Slug</FieldLabel>
              <Input
                value={slug}
                placeholder="auto-generated from title"
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value)
                }}
              />
              <FieldDescription>
                Used in URLs. Leave empty to auto-generate from the title.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                rows={3}
                value={description}
                placeholder="Short description of the collection"
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select value={type} onValueChange={(v) => setType(v as CollectionType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLLECTION_TYPE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Visibility</FieldLabel>
                <Select
                  value={visibility}
                  onValueChange={(v) => setVisibility(v as 'public' | 'private' | 'unlisted')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={status} onValueChange={(v) => setStatus(v as PublicationState)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_COLLECTION_STATUSES.filter((s) => s !== 'all').map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <Input
                  value={tags}
                  placeholder="editorial, best-of, 2025"
                  onChange={(e) => setTags(e.target.value)}
                />
                <FieldDescription>Comma-separated tags.</FieldDescription>
              </Field>
            </div>
          </FieldGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting || !title.trim()}>
            {submitting ? 'Creating…' : 'Create collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
