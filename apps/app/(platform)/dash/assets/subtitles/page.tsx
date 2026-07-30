'use client'

import * as React from 'react'
import {
  AudioLines,
  Captions,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileWarning,
  Globe,
  Grid3X3,
  LayoutGrid,
  List,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Replace,
  Search,
  Trash2,
  Upload,
  X,
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
  MOCK_SUBTITLES,
  MOCK_SUBTITLE_SETTINGS,
  SUBTITLE_MEDIA_TYPES,
  SUBTITLE_MEDIA_TYPE_LABEL,
  SUBTITLE_FORMATS,
  SUBTITLE_STATUSES,
  SUBTITLE_STATUS_LABEL,
  SUBTITLE_STATUS_TONE,
  SUBTITLE_SOURCES,
  SUBTITLE_SOURCE_LABEL,
  SUBTITLE_LANGUAGES,
  SUBTITLE_LANGUAGE_LABEL,
  IMPORT_SOURCES,
  IMPORT_SOURCE_LABEL,
  QUALITY_LABEL,
  formatBytes,
  type SubtitleTrack,
  type SubtitleSettings,
  type ImportSource,
  type ImportPreview,
} from '@/lib/mock-subtitles'

type SortKey = 'title' | 'language' | 'size' | 'usage' | 'updated' | 'imported'
type SortDir = 'asc' | 'desc'
type ViewMode = 'grid' | 'table' | 'gallery'
type UsageFilter = 'all' | 'used' | 'unused' | 'missing'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'language', label: 'Language' },
  { value: 'size', label: 'File Size' },
  { value: 'usage', label: 'Usage Count' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'imported', label: 'Recently Imported' },
]

const MOCK_IMPORT_PREVIEWS: ImportPreview[] = [
  { id: 'imp-1', source: 'opensubtitles', title: 'One Piece Film: Red - English', url: '/subtitles/opm-red-en.srt', format: 'srt', sizeBytes: 58000, language: 'en', alreadyExists: false, selected: true, lineCount: 380 },
  { id: 'imp-2', source: 'opensubtitles', title: 'Solo Leveling S2 - French', url: '/subtitles/solo-leveling-s2-fr.ass', format: 'ass', sizeBytes: 62000, language: 'fr', alreadyExists: true, selected: false, lineCount: 410 },
  { id: 'imp-3', source: 'anilist', title: 'Jujutsu Kaisen S3 - English', url: '/subtitles/jjk-s3-en.srt', format: 'srt', sizeBytes: 48000, language: 'en', alreadyExists: false, selected: true, lineCount: 320 },
  { id: 'imp-4', source: 'subscene', title: 'My Hero Academia S7 - Spanish', url: '/subtitles/mha-s7-es.srt', format: 'srt', sizeBytes: 52000, language: 'es', alreadyExists: false, selected: true, lineCount: 350 },
  { id: 'imp-5', source: 'opensubtitles', title: 'Blue Lock S2 - Japanese', url: '/subtitles/blue-lock-s2-ja.srt', format: 'srt', sizeBytes: 35000, language: 'ja', alreadyExists: true, selected: false, lineCount: 280 },
]

export default function SubtitlesPage() {
  const [query, setQuery] = React.useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<string>('all')
  const [formatFilter, setFormatFilter] = React.useState<string>('all')
  const [sourceFilter, setSourceFilter] = React.useState<string>('all')
  const [languageFilter, setLanguageFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [usageFilter, setUsageFilter] = React.useState<UsageFilter>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('updated')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [view, setView] = React.useState<ViewMode>('grid')
  const [inspecting, setInspecting] = React.useState<SubtitleTrack | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settings, setSettings] = React.useState<SubtitleSettings>(MOCK_SUBTITLE_SETTINGS)

  const stats = React.useMemo(() => {
    const total = MOCK_SUBTITLES.length
    const storage = MOCK_SUBTITLES.reduce((s, t) => s + t.sizeBytes, 0)
    const unused = MOCK_SUBTITLES.filter((t) => t.status === 'unused').length
    const missing = MOCK_SUBTITLES.filter((t) => t.status === 'missing').length
    const languages = new Set(MOCK_SUBTITLES.map((t) => t.language)).size
    return { total, storage, unused, missing, languages }
  }, [])

  const filtered = React.useMemo(() => {
    let items = MOCK_SUBTITLES.filter((item) => {
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase())
      const matchesType = mediaTypeFilter === 'all' || item.mediaType === mediaTypeFilter
      const matchesFormat = formatFilter === 'all' || item.format === formatFilter
      const matchesSource = sourceFilter === 'all' || item.source === sourceFilter
      const matchesLanguage = languageFilter === 'all' || item.language === languageFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesUsage =
        usageFilter === 'all' ||
        (usageFilter === 'used' && item.usageCount > 0) ||
        (usageFilter === 'unused' && item.usageCount === 0 && item.status !== 'missing') ||
        (usageFilter === 'missing' && item.status === 'missing')
      return matchesQuery && matchesType && matchesFormat && matchesSource && matchesLanguage && matchesStatus && matchesUsage
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title': cmp = a.title.localeCompare(b.title); break
        case 'language': cmp = a.language.localeCompare(b.language); break
        case 'size': cmp = a.sizeBytes - b.sizeBytes; break
        case 'usage': cmp = a.usageCount - b.usageCount; break
        case 'updated': cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break
        case 'imported': cmp = new Date(a.importedAt).getTime() - new Date(b.importedAt).getTime(); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [query, mediaTypeFilter, formatFilter, sourceFilter, languageFilter, statusFilter, usageFilter, sortKey, sortDir])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Subtitles" description="Manage and organize all subtitle tracks across the platform.">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{stats.total} tracks</span>
          <span>·</span>
          <span>{stats.languages} languages</span>
          <span>·</span>
          <span>{formatBytes(stats.storage)} used</span>
          <span>·</span>
          <span className="text-warning">{stats.unused} unused</span>
          <span>·</span>
          <span className="text-destructive">{stats.missing} missing</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload data-icon="inline-start" />
          Import
        </Button>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Upload
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCw data-icon="inline-start" />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total Tracks" value={stats.total} icon={<Captions className="size-4 text-muted-foreground" />} />
        <StatCard label="Languages" value={stats.languages} icon={<Globe className="size-4 text-muted-foreground" />} />
        <StatCard label="Storage" value={formatBytes(stats.storage)} icon={<AudioLines className="size-4 text-muted-foreground" />} />
        <StatCard label="Unused" value={stats.unused} icon={<EyeOff className="size-4 text-warning" />} tone="warning" />
        <StatCard label="Missing" value={stats.missing} icon={<FileWarning className="size-4 text-destructive" />} tone="destructive" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput placeholder="Search subtitles..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>

        <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="all">All types</SelectItem>
            {SUBTITLE_MEDIA_TYPES.map((t) => <SelectItem key={t} value={t}>{SUBTITLE_MEDIA_TYPE_LABEL[t]}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>

        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="all">All formats</SelectItem>
            {SUBTITLE_FORMATS.map((f) => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="all">All sources</SelectItem>
            {SUBTITLE_SOURCES.map((s) => <SelectItem key={s} value={s}>{SUBTITLE_SOURCE_LABEL[s]}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>

        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="all">All languages</SelectItem>
            {SUBTITLE_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{SUBTITLE_LANGUAGE_LABEL[l]}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="all">All statuses</SelectItem>
            {SUBTITLE_STATUSES.map((s) => <SelectItem key={s} value={s}>{SUBTITLE_STATUS_LABEL[s]}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>

        <Select value={usageFilter} onValueChange={(v) => setUsageFilter(v as UsageFilter)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="all">All usage</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="unused">Unused</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectGroup></SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            {SORT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>Sort: {opt.label}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '↑' : '↓'}
        </Button>

        <div className="ml-auto">
          <ToggleGroup type="single" value={view} onValueChange={(v: string) => { if (v) setView(v as ViewMode) }}>
            <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid /></ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view"><List /></ToggleGroupItem>
            <ToggleGroupItem value="gallery" aria-label="Gallery view"><Grid3X3 /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No subtitles found</EmptyTitle>
            <EmptyDescription>No subtitle tracks match the current filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'grid' ? (
        <SubtitlesGrid items={filtered} onInspect={setInspecting} />
      ) : view === 'table' ? (
        <SubtitlesTable items={filtered} onInspect={setInspecting} />
      ) : (
        <SubtitlesGallery items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {MOCK_SUBTITLES.length} subtitle tracks</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      <SubtitleDetailSheet item={inspecting} onClose={() => setInspecting(null)} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSave={setSettings} />
    </main>
  )
}

function StatCard({ label, value, icon, tone = 'neutral' }: { label: string; value: string | number; icon: React.ReactNode; tone?: 'neutral' | 'success' | 'info' | 'destructive' | 'warning' }) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <p className={cn('text-2xl font-bold tracking-tight', tone === 'success' && 'text-success', tone === 'info' && 'text-info', tone === 'destructive' && 'text-destructive', tone === 'warning' && 'text-warning')}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function SubtitlePlaceholder({ title, className = '' }: { title: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center rounded-lg bg-muted', className)}>
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Captions className="size-8" />
        <span className="text-xs">{title}</span>
      </div>
    </div>
  )
}

function SubtitlesGrid({ items, onInspect }: { items: SubtitleTrack[]; onInspect: (item: SubtitleTrack) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          className="group flex flex-col gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-ring/40 cursor-pointer"
          onClick={() => onInspect(item)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onInspect(item) }}
        >
          <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
            {item.status === 'missing' ? (
              <SubtitlePlaceholder title="Missing" className="size-full" />
            ) : (
              <SubtitlePlaceholder title={item.title} className="size-full" />
            )}
            <div className="absolute left-2 top-2 flex gap-1">
              <Badge variant={item.status === 'active' ? 'default' : item.status === 'missing' ? 'destructive' : 'secondary'} className="text-[10px]">
                {SUBTITLE_STATUS_LABEL[item.status]}
              </Badge>
              {item.isDuplicate && <Badge variant="secondary" className="text-[10px]">Duplicate</Badge>}
            </div>
            <div className="absolute right-2 top-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onInspect(item) }}><Eye /> Preview</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Download /> Download</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Replace /> Replace</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Pencil /> Edit Metadata</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Copy /> Copy URL</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive"><Trash2 /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px] font-mono">{item.format.toUpperCase()}</Badge>
              <Badge variant="secondary" className="text-[10px]">{formatBytes(item.sizeBytes)}</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="line-clamp-1 text-sm font-medium">{item.title}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{SUBTITLE_MEDIA_TYPE_LABEL[item.mediaType]}</span>
              <span>·</span>
              <span>{SUBTITLE_LANGUAGE_LABEL[item.language]}</span>
              <span>·</span>
              <span>{SUBTITLE_SOURCE_LABEL[item.source]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.usageCount} uses</span>
              <span>·</span>
              <span>{item.updatedAt}</span>
            </div>
            {item.qualityIndicators.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {item.qualityIndicators.slice(0, 2).map((qi) => (
                  <Badge key={qi} variant="outline" className="text-[10px]">{QUALITY_LABEL[qi]}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function SubtitlesTable({ items, onInspect }: { items: SubtitleTrack[]; onInspect: (item: SubtitleTrack) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead className="w-10">Preview</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Language</TableHead>
            <TableHead className="hidden lg:table-cell">Format</TableHead>
            <TableHead className="hidden lg:table-cell">Size</TableHead>
            <TableHead className="hidden xl:table-cell">Source</TableHead>
            <TableHead className="hidden xl:table-cell">Lines</TableHead>
            <TableHead className="hidden xl:table-cell">Used By</TableHead>
            <TableHead className="hidden xl:table-cell">Status</TableHead>
            <TableHead className="hidden 2xl:table-cell">Updated</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <button type="button" className="size-10 shrink-0 overflow-hidden rounded bg-muted" onClick={() => onInspect(item)}>
                  <SubtitlePlaceholder title="" className="size-full" />
                </button>
              </TableCell>
              <TableCell>
                <button type="button" className="text-left" onClick={() => onInspect(item)}>
                  <span className="max-w-48 truncate font-medium hover:underline text-sm">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">{item.format.toUpperCase()} · {SUBTITLE_LANGUAGE_LABEL[item.language]}</span>
                </button>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="text-xs">{SUBTITLE_MEDIA_TYPE_LABEL[item.mediaType]}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="secondary" className="text-xs">{SUBTITLE_LANGUAGE_LABEL[item.language]}</Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-xs">{item.format.toUpperCase()}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-xs">{formatBytes(item.sizeBytes)}</span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="text-xs">{SUBTITLE_SOURCE_LABEL[item.source]}</span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="font-mono text-xs">{item.lineCount.toLocaleString()}</span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="font-mono text-xs">{item.usageCount}</span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <StatusBadge tone={SUBTITLE_STATUS_TONE[item.status]}>{SUBTITLE_STATUS_LABEL[item.status]}</StatusBadge>
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">
                <span className="text-xs text-muted-foreground">{item.updatedAt}</span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onInspect(item)}><Eye /> Details</DropdownMenuItem>
                    <DropdownMenuItem><Download /> Download</DropdownMenuItem>
                    <DropdownMenuItem><Replace /> Replace</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive"><Trash2 /> Delete</DropdownMenuItem>
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

function SubtitlesGallery({ items, onInspect }: { items: SubtitleTrack[]; onInspect: (item: SubtitleTrack) => void }) {
  const [selected, setSelected] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {selected && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="aspect-video w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
              <SubtitlePlaceholder title="Preview" className="size-full" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{MOCK_SUBTITLES.find((t) => t.id === selected)?.title}</h3>
              <p className="text-sm text-muted-foreground">
                {SUBTITLE_LANGUAGE_LABEL[MOCK_SUBTITLES.find((t) => t.id === selected)?.language || 'en']} · {MOCK_SUBTITLES.find((t) => t.id === selected)?.format.toUpperCase()} · {formatBytes(MOCK_SUBTITLES.find((t) => t.id === selected)?.sizeBytes || 0)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => onInspect(MOCK_SUBTITLES.find((t) => t.id === selected)!)}>
                  <Eye data-icon="inline-start" /> View Details
                </Button>
                <Button size="sm" variant="outline"><Download data-icon="inline-start" /> Download</Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X /></Button>
          </div>
        </Card>
      )}
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'mb-3 w-full break-inside-avoid overflow-hidden rounded-lg border bg-card text-left transition-all hover:border-ring/40',
              selected === item.id && 'ring-2 ring-primary',
            )}
            onClick={() => setSelected(item.id === selected ? null : item.id)}
          >
            <div className="aspect-video bg-muted">
              {item.status === 'missing' ? (
                <SubtitlePlaceholder title="Missing" className="size-full rounded-t-lg" />
              ) : (
                <SubtitlePlaceholder title={item.title} className="size-full rounded-t-lg" />
              )}
            </div>
            <div className="p-2">
              <span className="line-clamp-1 text-xs font-medium">{item.title}</span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>{item.format.toUpperCase()}</span>
                <span>·</span>
                <span>{formatBytes(item.sizeBytes)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SubtitleDetailSheet({ item, onClose }: { item: SubtitleTrack | null; onClose: () => void }) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-2xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={SUBTITLE_STATUS_TONE[item.status]}>{SUBTITLE_STATUS_LABEL[item.status]}</StatusBadge>
                {item.isDuplicate && <Badge variant="secondary" className="text-[10px]">Duplicate</Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{SUBTITLE_MEDIA_TYPE_LABEL[item.mediaType]}</span>
                <span>·</span>
                <span>{SUBTITLE_LANGUAGE_LABEL[item.language]}</span>
                <span>·</span>
                <span>{item.format.toUpperCase()}</span>
                <span>·</span>
                <span>{formatBytes(item.sizeBytes)}</span>
                <span>·</span>
                <span>{item.lineCount.toLocaleString()} lines</span>
              </div>
            </SheetHeader>
            <Tabs defaultValue="overview" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  <div className="aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-muted">
                    <SubtitlePlaceholder title={item.title} className="size-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Language" value={SUBTITLE_LANGUAGE_LABEL[item.language]} />
                    <MiniStat label="Format" value={item.format.toUpperCase()} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="File Size" value={formatBytes(item.sizeBytes)} />
                    <MiniStat label="Line Count" value={item.lineCount.toLocaleString()} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Provider" value={item.provider} />
                    <MiniStat label="Hearing Impaired" value={item.isHearingImpaired ? 'Yes' : 'No'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Forced" value={item.isForced ? 'Yes' : 'No'} />
                    <MiniStat label="Imported" value={item.importedAt} />
                  </div>
                  <Separator />
                  {item.qualityIndicators.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Quality Indicators</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.qualityIndicators.map((qi) => (
                          <Badge key={qi} variant="outline" className="text-xs">{QUALITY_LABEL[qi]}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="relations" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Used By ({item.usedBy.length} resources)</span>
                    <Badge variant="secondary">{item.usageCount} total uses</Badge>
                  </div>
                  {item.usedBy.length === 0 ? (
                    <div className="rounded-lg border px-3 py-6 text-center text-sm text-muted-foreground">
                      This subtitle is not used by any resource
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {item.usedBy.map((use) => (
                        <div key={use.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[10px] w-16 justify-center">{use.type}</Badge>
                            <span className="text-sm font-medium">{use.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{use.url}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="versions" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Available Versions ({item.versions.length})</span>
                  </div>
                  {item.versions.length === 0 ? (
                    <div className="rounded-lg border px-3 py-6 text-center text-sm text-muted-foreground">
                      No versions available
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {item.versions.map((v) => (
                        <div key={v.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                          <div className="flex items-center gap-3">
                            {v.isOriginal && <Badge variant="default" className="text-[10px]">Original</Badge>}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{v.label}</span>
                              <span className="text-xs text-muted-foreground">{SUBTITLE_LANGUAGE_LABEL[v.language]}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-xs">{formatBytes(v.sizeBytes)}</span>
                            <Badge variant="secondary" className="text-[10px]">{v.format.toUpperCase()}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="metadata" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Encoding" value={item.metadata.encoding} />
                    <MiniStat label="FPS" value={item.metadata.fps?.toString() || 'N/A'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Timecodes" value={item.metadata.timecodes || 'N/A'} />
                    <MiniStat label="Cued By" value={item.metadata.cuedBy || 'N/A'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MiniStat label="Software" value={item.metadata.software || 'N/A'} />
                    <MiniStat label="Checksum" value={item.checksum ? item.checksum.slice(0, 20) + '...' : 'N/A'} />
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">External IDs</span>
                    <div className="mt-2 flex flex-col gap-1">
                      {Object.entries(item.externalIds).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between rounded border px-3 py-1.5">
                          <span className="text-xs capitalize text-muted-foreground">{key}</span>
                          <span className="font-mono text-xs">{value}</span>
                        </div>
                      ))}
                      {Object.keys(item.externalIds).length === 0 && (
                        <span className="text-xs text-muted-foreground">No external IDs</span>
                      )}
                    </div>
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">Activity Timeline</span>
                  <div className="flex flex-col gap-3">
                    {item.history.map((entry) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'size-2 rounded-full',
                            entry.action === 'upload' && 'bg-success',
                            entry.action === 'replace' && 'bg-info',
                            entry.action === 'modify' && 'bg-warning',
                            entry.action === 'sync' && 'bg-info',
                            entry.action === 'delete' && 'bg-destructive',
                            entry.action === 'restore' && 'bg-success',
                          )} />
                          <div className="w-px flex-1 bg-border" />
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{entry.action}</Badge>
                            <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                          </div>
                          <p className="mt-1 text-sm">{entry.description}</p>
                          {entry.details && <p className="mt-0.5 text-xs text-muted-foreground">{entry.details}</p>}
                          <span className="mt-1 block text-xs text-muted-foreground">by {entry.performedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <div className="flex flex-1 flex-wrap gap-2">
                <Button variant="outline" size="sm"><Download data-icon="inline-start" /> Download</Button>
                <Button variant="outline" size="sm"><Replace data-icon="inline-start" /> Replace</Button>
                <Button variant="outline" size="sm"><Maximize2 data-icon="inline-start" /> Sync</Button>
              </div>
              <Button variant="outline" onClick={onClose}>Close</Button>
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
      <span className="text-sm font-bold truncate">{value}</span>
    </div>
  )
}

function Separator() {
  return <div className="my-2 h-px bg-border" />
}

function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [source, setSource] = React.useState<ImportSource>('opensubtitles')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [previews, setPreviews] = React.useState(MOCK_IMPORT_PREVIEWS)

  const togglePreview = (id: string) => {
    setPreviews((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)))
  }

  const selectedCount = previews.filter((p) => p.selected).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Subtitles</DialogTitle>
          <DialogDescription>Select a source and search for subtitle tracks to import.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Source</FieldLabel>
            <Select value={source} onValueChange={(v) => setSource(v as ImportSource)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {IMPORT_SOURCES.map((s) => <SelectItem key={s} value={s}>{IMPORT_SOURCE_LABEL[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Search</FieldLabel>
            <InputGroup>
              <InputGroupAddon><Search /></InputGroupAddon>
              <InputGroupInput
                placeholder={`Search ${IMPORT_SOURCE_LABEL[source]}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Field>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Results ({previews.length})</span>
            {previews.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                  item.selected ? 'border-primary bg-primary/5' : 'hover:border-ring/40',
                )}
                onClick={() => togglePreview(item.id)}
              >
                <input type="checkbox" checked={item.selected} onChange={() => togglePreview(item.id)} className="size-4" />
                <div className="size-10 shrink-0 overflow-hidden rounded bg-muted flex items-center justify-center">
                  <Captions className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{item.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.format.toUpperCase()}</span>
                    <span>·</span>
                    <span>{formatBytes(item.sizeBytes)}</span>
                    <span>·</span>
                    <span>{item.lineCount} lines</span>
                  </div>
                </div>
                {item.alreadyExists ? (
                  <Badge variant="destructive" className="text-[10px]">Already exists</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">{SUBTITLE_LANGUAGE_LABEL[item.language]}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={selectedCount === 0}
            onClick={() => {
              toast.success(`${selectedCount} subtitle track(s) imported`)
              onOpenChange(false)
            }}
          >
            <Upload data-icon="inline-start" />
            Import {selectedCount > 0 ? `(${selectedCount})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SettingsDialog({ open, onOpenChange, settings, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; settings: SubtitleSettings; onSave: (settings: SubtitleSettings) => void }) {
  const [local, setLocal] = React.useState(settings)
  React.useEffect(() => { setLocal(settings) }, [settings])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subtitle Settings</DialogTitle>
          <DialogDescription>Configure how subtitles are managed and processed.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Max Upload Size (MB)</FieldLabel>
            <Input type="number" value={local.maxUploadSizeMB} onChange={(e) => setLocal({ ...local, maxUploadSizeMB: Number(e.target.value) })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Auto Sync</FieldLabel>
              <Select value={local.autoSync ? 'yes' : 'no'} onValueChange={(v) => setLocal({ ...local, autoSync: v === 'yes' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Auto Detect Language</FieldLabel>
              <Select value={local.autoDetectLanguage ? 'yes' : 'no'} onValueChange={(v) => setLocal({ ...local, autoDetectLanguage: v === 'yes' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Duplicate Detection</FieldLabel>
              <Select value={local.duplicateDetection ? 'yes' : 'no'} onValueChange={(v) => setLocal({ ...local, duplicateDetection: v === 'yes' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Auto Cleanup Unused</FieldLabel>
              <Select value={local.autoCleanupUnused ? 'yes' : 'no'} onValueChange={(v) => setLocal({ ...local, autoCleanupUnused: v === 'yes' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel>Default Format</FieldLabel>
            <Select value={local.defaultFormat} onValueChange={(v) => setLocal({ ...local, defaultFormat: v as SubtitleSettings['defaultFormat'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['srt', 'ass', 'vtt'] as const).map((f) => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Unused Days Threshold</FieldLabel>
            <Input type="number" value={local.unusedDaysThreshold} onChange={(e) => setLocal({ ...local, unusedDaysThreshold: Number(e.target.value) })} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(local); toast.success('Settings saved'); onOpenChange(false) }}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
