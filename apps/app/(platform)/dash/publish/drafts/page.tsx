'use client'

import * as React from 'react'
import {
  Archive,
  Calendar,
  Clock,
  Columns3,
  Eye,
  FileText,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Rocket,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { StatusBadge } from '@/components/dash/status-badge'
import {
  DRAFTS_MOCK,
  DRAFT_TYPE_LABEL,
  DRAFT_TYPE_TONE,
  DRAFT_STATUS_LABEL,
  DRAFT_STATUS_TONE,
  LANGUAGE_LABEL,
  VISIBILITY_LABEL,
  ALL_DRAFT_TYPES,
  ALL_DRAFT_STATUSES,
  ALL_LANGUAGES,
  MOCK_AUTHORS,
  getDraftStats,
  getKanbanColumns,
  parseTimeOffset,
  type DraftItem,
  type DraftType,
  type DraftStatus,
  type Language,
} from '@/lib/drafts-catalog-data'

type SortKey = 'title' | 'type' | 'status' | 'author' | 'updated' | 'publishDate'
type SortDir = 'asc' | 'desc'
type ViewMode = 'kanban' | 'table' | 'grid' | 'calendar' | 'timeline'
type QuickFilter = 'all' | 'mine' | 'needs-review' | 'ready' | 'scheduled' | 'archived'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'author', label: 'Author' },
  { value: 'updated', label: 'Last updated' },
  { value: 'publishDate', label: 'Publish date' },
]

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: 'All Drafts' },
  { value: 'mine', label: 'Mine' },
  { value: 'needs-review', label: 'Needs Review' },
  { value: 'ready', label: 'Ready' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'archived', label: 'Archived' },
]

export default function DraftsPage() {
  const [query, setQuery] = React.useState('')
  const [quickFilter, setQuickFilter] = React.useState<QuickFilter>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [authorFilter, setAuthorFilter] = React.useState<string>('all')
  const [languageFilter, setLanguageFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('updated')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [view, setView] = React.useState<ViewMode>('kanban')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<DraftItem | null>(null)
  const [creating, setCreating] = React.useState(false)

  const stats = React.useMemo(() => getDraftStats(DRAFTS_MOCK), [])

  const filtered = React.useMemo(() => {
    let items = DRAFTS_MOCK.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.slug.toLowerCase().includes(query.toLowerCase()) ||
        item.author.toLowerCase().includes(query.toLowerCase())
      const matchesQuick =
        quickFilter === 'all' ||
        (quickFilter === 'mine' && item.author === 'Yuki Tanaka') ||
        (quickFilter === 'needs-review' && item.status === 'in-review') ||
        (quickFilter === 'ready' && item.status === 'ready') ||
        (quickFilter === 'scheduled' && item.status === 'scheduled') ||
        (quickFilter === 'archived' && item.status === 'archived')
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesAuthor = authorFilter === 'all' || item.author === authorFilter
      const matchesLanguage = languageFilter === 'all' || item.language === languageFilter
      return matchesQuery && matchesQuick && matchesType && matchesStatus && matchesAuthor && matchesLanguage
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
        case 'status': {
          const order: Record<DraftStatus, number> = { draft: 0, 'in-review': 1, approved: 2, ready: 3, scheduled: 4, published: 5, archived: 6 }
          cmp = order[a.status] - order[b.status]
          break
        }
        case 'author':
          cmp = a.author.localeCompare(b.author)
          break
        case 'updated':
          cmp = parseTimeOffset(a.updatedAt) - parseTimeOffset(b.updatedAt)
          break
        case 'publishDate':
          cmp = (a.publishDate ?? '').localeCompare(b.publishDate ?? '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [query, quickFilter, typeFilter, statusFilter, authorFilter, languageFilter, sortKey, sortDir])

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
    toast.success(`${action} applied to ${selected.size} drafts`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Drafts"
        description="Manage, review, and publish all platform content from a single workspace."
      >
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus data-icon="inline-start" />
          New Draft
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total drafts"
          value={stats.total}
          icon={<FileText className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Ready to publish"
          value={stats.readyToPublish}
          icon={<Rocket className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          icon={<Clock className="size-4 text-warning" />}
          tone={stats.scheduled > 0 ? 'success' : 'neutral'}
        />
        <StatCard
          label="In review"
          value={stats.byStatus['in-review']}
          icon={<Send className="size-4 text-muted-foreground" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search drafts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <div className="flex gap-1 rounded-lg border p-1">
          {QUICK_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={quickFilter === f.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setQuickFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_DRAFT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All types' : DRAFT_TYPE_LABEL[t as DraftType]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={authorFilter} onValueChange={setAuthorFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All authors</SelectItem>
              {MOCK_AUTHORS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {l === 'all' ? 'All languages' : LANGUAGE_LABEL[l as Language]}
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
            onValueChange={(v: string) => { if (v) setView(v as ViewMode) }}
          >
            <ToggleGroupItem value="kanban" aria-label="Kanban view">
              <Columns3 />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view">
              <Calendar />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="ghost" size="sm" onClick={() => bulkAction('Publish')}>
            <Rocket data-icon="inline-start" /> Publish
          </Button>
          <Button variant="ghost" size="sm" onClick={() => bulkAction('Archive')}>
            <Archive data-icon="inline-start" /> Archive
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => bulkAction('Delete')}>
            <Trash2 data-icon="inline-start" /> Delete
          </Button>
          <Button variant="ghost" size="icon" className="ml-auto size-7" onClick={() => setSelected(new Set())}>
            <X /><span className="sr-only">Clear selection</span>
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No drafts found</EmptyTitle>
            <EmptyDescription>
              No drafts match the current filters. Try adjusting your search or create a new draft.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'kanban' ? (
        <KanbanView items={filtered} onInspect={setInspecting} />
      ) : view === 'table' ? (
        <TableView
          items={filtered}
          selected={selected}
          allSelected={allSelected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onInspect={setInspecting}
          columns={{
            type: true, status: true, author: true, updated: true,
            publishDate: true, visibility: true, language: true,
          }}
        />
      ) : view === 'grid' ? (
        <GridView items={filtered} onInspect={setInspecting} />
      ) : (
        <CalendarView items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {DRAFTS_MOCK.length} drafts</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      <DraftDetailSheet item={inspecting} onClose={() => setInspecting(null)} />
      <NewDraftDialog open={creating} onOpenChange={setCreating} />
    </main>
  )
}

function StatCard({
  label, value, icon, tone = 'neutral',
}: {
  label: string; value: number; icon: React.ReactNode; tone?: 'neutral' | 'success' | 'destructive'
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <p className={cn('text-2xl font-bold tracking-tight', tone === 'success' && 'text-success', tone === 'destructive' && 'text-destructive')}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function KanbanView({ items, onInspect }: { items: DraftItem[]; onInspect: (item: DraftItem) => void }) {
  const columns = getKanbanColumns(items)
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.status} className="flex w-80 min-w-80 flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <StatusBadge tone={col.tone}>{col.label}</StatusBadge>
              <span className="text-xs text-muted-foreground">{col.items.length}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {col.items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No drafts
              </div>
            ) : (
              col.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-colors hover:border-ring/40"
                  onClick={() => onInspect(item)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-medium">{item.title}</span>
                    <StatusBadge tone={DRAFT_TYPE_TONE[item.type]} className="shrink-0">
                      {DRAFT_TYPE_LABEL[item.type]}
                    </StatusBadge>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.author}</span>
                    <span>{item.updatedAt}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TableView({
  items, selected, allSelected, onToggleAll, onToggleOne, onInspect, columns,
}: {
  items: DraftItem[]; selected: Set<string>; allSelected: boolean
  onToggleAll: () => void; onToggleOne: (id: string) => void
  onInspect: (item: DraftItem) => void; columns: Record<string, boolean>
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Select all" />
            </TableHead>
            <TableHead>Title</TableHead>
            {columns.type && <TableHead className="hidden md:table-cell">Type</TableHead>}
            {columns.status && <TableHead className="hidden md:table-cell">Status</TableHead>}
            {columns.author && <TableHead className="hidden lg:table-cell">Author</TableHead>}
            {columns.updated && <TableHead className="hidden lg:table-cell">Updated</TableHead>}
            {columns.publishDate && <TableHead className="hidden xl:table-cell">Publish Date</TableHead>}
            {columns.visibility && <TableHead className="hidden xl:table-cell">Visibility</TableHead>}
            {columns.language && <TableHead className="hidden xl:table-cell">Language</TableHead>}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} data-state={selected.has(item.id) ? 'selected' : undefined}>
              <TableCell>
                <Checkbox checked={selected.has(item.id)} onCheckedChange={() => onToggleOne(item.id)} aria-label={`Select ${item.title}`} />
              </TableCell>
              <TableCell>
                <button type="button" className="flex flex-col items-start gap-0.5 text-left" onClick={() => onInspect(item)}>
                  <span className="max-w-72 truncate font-medium hover:underline">{item.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{item.slug}</span>
                </button>
              </TableCell>
              {columns.type && (
                <TableCell className="hidden md:table-cell">
                  <StatusBadge tone={DRAFT_TYPE_TONE[item.type]}>{DRAFT_TYPE_LABEL[item.type]}</StatusBadge>
                </TableCell>
              )}
              {columns.status && (
                <TableCell className="hidden md:table-cell">
                  <StatusBadge tone={DRAFT_STATUS_TONE[item.status]}>{DRAFT_STATUS_LABEL[item.status]}</StatusBadge>
                </TableCell>
              )}
              {columns.author && <TableCell className="hidden text-muted-foreground lg:table-cell">{item.author}</TableCell>}
              {columns.updated && <TableCell className="hidden text-muted-foreground lg:table-cell">{item.updatedAt}</TableCell>}
              {columns.publishDate && <TableCell className="hidden text-muted-foreground xl:table-cell">{item.publishDate ?? '—'}</TableCell>}
              {columns.visibility && <TableCell className="hidden text-muted-foreground xl:table-cell">{VISIBILITY_LABEL[item.visibility]}</TableCell>}
              {columns.language && <TableCell className="hidden text-muted-foreground xl:table-cell">{LANGUAGE_LABEL[item.language]}</TableCell>}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal /><span className="sr-only">Row actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onInspect(item)}><Pencil /> Edit draft</DropdownMenuItem>
                    <DropdownMenuItem><Eye /> Preview</DropdownMenuItem>
                    <DropdownMenuItem><Send /> Submit for review</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><Archive /> Archive</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive"><Trash2 /> Delete</DropdownMenuItem>
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

function GridView({ items, onInspect }: { items: DraftItem[]; onInspect: (item: DraftItem) => void }) {
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
            <div className="flex flex-col gap-0.5">
              <p className="line-clamp-2 text-sm leading-snug font-medium">{item.title}</p>
              <span className="font-mono text-xs text-muted-foreground">{item.slug}</span>
            </div>
            <StatusBadge tone={DRAFT_STATUS_TONE[item.status]}>{DRAFT_STATUS_LABEL[item.status]}</StatusBadge>
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</p>
          <div className="flex flex-wrap gap-1">
            <StatusBadge tone={DRAFT_TYPE_TONE[item.type]} className="text-[10px]">{DRAFT_TYPE_LABEL[item.type]}</StatusBadge>
            {item.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.author}</span>
            <span>{item.updatedAt}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function CalendarView({ items, onInspect }: { items: DraftItem[]; onInspect: (item: DraftItem) => void }) {
  const scheduled = items.filter((i) => i.publishDate)
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">July 2026</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">← Prev</Button>
            <Button variant="outline" size="sm">Next →</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-2 font-medium text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1
            const dateStr = `2026-07-${String(day).padStart(2, '0')}`
            const dayDrafts = scheduled.filter((d) => d.publishDate === dateStr)
            return (
              <div key={day} className="flex min-h-16 flex-col gap-1 rounded border bg-muted/20 p-1">
                <span className="text-xs text-muted-foreground">{day}</span>
                {dayDrafts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="rounded bg-primary/10 px-1 py-0.5 text-left text-[10px] font-medium text-primary hover:bg-primary/20"
                    onClick={() => onInspect(d)}
                  >
                    {d.title.length > 20 ? d.title.slice(0, 20) + '…' : d.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DraftDetailSheet({ item, onClose }: { item: DraftItem | null; onClose: () => void }) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={DRAFT_STATUS_TONE[item.status]}>{DRAFT_STATUS_LABEL[item.status]}</StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                /{item.slug} · v{item.version} · Last updated {item.updatedAt} by {item.author}
              </SheetDescription>
            </SheetHeader>
            <Tabs defaultValue="overview" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="publishing">Publishing</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field><FieldLabel>Title</FieldLabel><Input defaultValue={item.title} /></Field>
                    <Field><FieldLabel>Slug</FieldLabel><Input defaultValue={item.slug} /></Field>
                  </div>
                  <Field><FieldLabel>Excerpt</FieldLabel><Textarea rows={3} defaultValue={item.excerpt} /></Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Select defaultValue={item.type}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ALL_DRAFT_TYPES.filter((t) => t !== 'all').map((t) => (
                            <SelectItem key={t} value={t}>{DRAFT_TYPE_LABEL[t as DraftType]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select defaultValue={item.status}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ALL_DRAFT_STATUSES.filter((s) => s !== 'all').map((s) => (
                            <SelectItem key={s} value={s}>{DRAFT_STATUS_LABEL[s as DraftStatus]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Priority</FieldLabel>
                      <Select defaultValue={item.priority}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Visibility</FieldLabel>
                      <Select defaultValue={item.visibility}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="members">Members</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Language</FieldLabel>
                      <Select defaultValue={item.language}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ALL_LANGUAGES.filter((l) => l !== 'all').map((l) => (
                            <SelectItem key={l} value={l}>{LANGUAGE_LABEL[l as Language]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Version</FieldLabel>
                      <Input readOnly defaultValue={`v${item.version}`} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Tags</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                      <Badge variant="outline">+ Add tag</Badge>
                    </div>
                  </Field>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="content" className="pt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Body</FieldLabel>
                    <Textarea rows={8} placeholder="Write your content here..." defaultValue={item.excerpt} />
                  </Field>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="assets" className="pt-4">
                <FieldGroup>
                  {[
                    { key: 'thumbnail', label: 'Thumbnail', desc: 'Preview image for listings' },
                    { key: 'hero', label: 'Hero Image', desc: 'Main banner image' },
                    { key: 'og-image', label: 'OG Image', desc: 'Social media preview image' },
                  ].map((asset) => (
                    <div key={asset.key} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{asset.label}</span>
                        <span className="text-xs text-muted-foreground">{asset.desc}</span>
                      </div>
                      <Button variant="outline" size="sm">Upload</Button>
                    </div>
                  ))}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="seo" className="pt-4">
                <FieldGroup>
                  <Field><FieldLabel>Meta Title</FieldLabel><Input defaultValue={item.title} /></Field>
                  <Field><FieldLabel>Meta Description</FieldLabel><Textarea rows={2} defaultValue={item.excerpt} /></Field>
                  <Field><FieldLabel>OG Title</FieldLabel><Input defaultValue={item.title} /></Field>
                  <Field><FieldLabel>OG Description</FieldLabel><Textarea rows={2} defaultValue={item.excerpt} /></Field>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="publishing" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field><FieldLabel>Author</FieldLabel><Input readOnly defaultValue={item.author} /></Field>
                    <Field><FieldLabel>Created</FieldLabel><Input readOnly defaultValue={item.createdAt} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field><FieldLabel>Last Updated</FieldLabel><Input readOnly defaultValue={item.updatedAt} /></Field>
                    <Field>
                      <FieldLabel>Publish Date</FieldLabel>
                      <Input type="date" defaultValue={item.publishDate} />
                    </Field>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm"><Save /> Save Draft</Button>
                    <Button size="sm" variant="outline"><Send /> Submit for Review</Button>
                    <Button size="sm" variant="outline"><Rocket /> Publish Now</Button>
                    <Button size="sm" variant="outline"><Archive /> Archive</Button>
                    <Button size="sm" variant="destructive"><Trash2 /> Delete</Button>
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">{item.activity.length} activities</span>
                  {item.activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{act.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {act.author} · {act.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <Button className="flex-1" onClick={() => { toast.success('Changes saved', { description: `${item.title} was updated.` }); onClose() }}>
                Save changes
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function NewDraftDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = React.useState('')
  const [type, setType] = React.useState<string>('announcement')
  const [author, setAuthor] = React.useState('')
  const [language, setLanguage] = React.useState<string>('en')
  const [visibility, setVisibility] = React.useState<string>('public')

  const handleNameChange = (value: string) => {
    setTitle(value)
  }

  const reset = () => { setTitle(''); setType('announcement'); setAuthor(''); setLanguage('en'); setVisibility('public') }

  const handleCreate = () => {
    toast.success('Draft created', { description: `"${title}" has been created.` })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Draft</DialogTitle>
          <DialogDescription>Create a new draft. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Title *</FieldLabel>
            <Input placeholder="e.g. Summer Festival Announcement" value={title} onChange={(e) => handleNameChange(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_DRAFT_TYPES.filter((t) => t !== 'all').map((t) => (
                    <SelectItem key={t} value={t}>{DRAFT_TYPE_LABEL[t as DraftType]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Language</FieldLabel>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_LANGUAGES.filter((l) => l !== 'all').map((l) => (
                    <SelectItem key={l} value={l}>{LANGUAGE_LABEL[l as Language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel>Author</FieldLabel>
            <Select value={author} onValueChange={setAuthor}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select author..." /></SelectTrigger>
              <SelectContent>
                {MOCK_AUTHORS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
          <Button disabled={!title.trim()} onClick={handleCreate}>Create Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Save({ className }: { className?: string }) {
  return <FileText className={className} />
}
