'use client'

import * as React from 'react'
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Columns3,
  Eye,
  FileText,
  Globe,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Search,
  TrendingUp,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ALL_LANGUAGES,
  MOCK_AUTHORS,
  parseTimeOffset,
  type DraftItem,
  type DraftType,
  type Language,
} from '@/lib/drafts-catalog-data'

type SortKey = 'title' | 'type' | 'author' | 'publishDate' | 'updated'
type SortDir = 'asc' | 'desc'
type ViewMode = 'kanban' | 'table' | 'grid'
type QuickFilter = 'all' | 'published' | 'archived' | 'this-month' | 'public'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'type', label: 'Type' },
  { value: 'author', label: 'Author' },
  { value: 'publishDate', label: 'Publish date' },
  { value: 'updated', label: 'Last updated' },
]

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: 'All Published' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'this-month', label: 'This Month' },
  { value: 'public', label: 'Public Only' },
]

function getPublishedStats(items: DraftItem[]) {
  const total = items.length
  const published = items.filter((i) => i.status === 'published').length
  const archived = items.filter((i) => i.status === 'archived').length
  const publicItems = items.filter((i) => i.visibility === 'public').length
  const byType: Record<string, number> = {}
  for (const item of items) {
    byType[item.type] = (byType[item.type] || 0) + 1
  }
  return { total, published, archived, publicItems, byType }
}

export default function PublishedPage() {
  const [query, setQuery] = React.useState('')
  const [quickFilter, setQuickFilter] = React.useState<QuickFilter>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [authorFilter, setAuthorFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('publishDate')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [view, setView] = React.useState<ViewMode>('table')
  const [inspecting, setInspecting] = React.useState<DraftItem | null>(null)

  const publishedItems = React.useMemo(
    () =>
      DRAFTS_MOCK.filter(
        (i) => i.status === 'published' || i.status === 'archived',
      ),
    [],
  )

  const stats = React.useMemo(
    () => getPublishedStats(publishedItems),
    [publishedItems],
  )

  const filtered = React.useMemo(() => {
    let items = publishedItems.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.slug.toLowerCase().includes(query.toLowerCase()) ||
        item.author.toLowerCase().includes(query.toLowerCase())
      const matchesFilter =
        quickFilter === 'all' ||
        (quickFilter === 'published' && item.status === 'published') ||
        (quickFilter === 'archived' && item.status === 'archived') ||
        (quickFilter === 'this-month' && (() => {
          if (!item.publishDate) return false
          return item.publishDate.startsWith('2026-07')
        })()) ||
        (quickFilter === 'public' && item.visibility === 'public')
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesAuthor = authorFilter === 'all' || item.author === authorFilter
      return matchesQuery && matchesFilter && matchesType && matchesAuthor
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
        case 'author':
          cmp = a.author.localeCompare(b.author)
          break
        case 'publishDate':
          cmp = (a.publishDate ?? '').localeCompare(b.publishDate ?? '')
          break
        case 'updated':
          cmp = parseTimeOffset(a.updatedAt) - parseTimeOffset(b.updatedAt)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [publishedItems, query, quickFilter, typeFilter, authorFilter, sortKey, sortDir])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Published"
        description="Browse all published and archived content on the platform."
      >
        <Button variant="outline" size="sm">
          <Globe data-icon="inline-start" />
          View live site
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total published"
          value={stats.total}
          icon={<CheckCircle2 className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Live content"
          value={stats.published}
          icon={<Globe className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Archived"
          value={stats.archived}
          icon={<Archive className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Public visibility"
          value={stats.publicItems}
          icon={<TrendingUp className="size-4 text-info" />}
          tone="info"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search published content..."
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
                <SelectItem key={a} value={a}>
                  {a}
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
            <ToggleGroupItem value="kanban" aria-label="Kanban view">
              <Columns3 />
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
            <EmptyTitle>No published content</EmptyTitle>
            <EmptyDescription>
              No published items match the current filters. Try adjusting your
              search.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === 'table' ? (
        <PublishedTable items={filtered} onInspect={setInspecting} />
      ) : view === 'kanban' ? (
        <PublishedKanban items={filtered} onInspect={setInspecting} />
      ) : (
        <PublishedGrid items={filtered} onInspect={setInspecting} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {publishedItems.length} published items
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

      <PublishedDetailSheet item={inspecting} onClose={() => setInspecting(null)} />
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

function PublishedKanban({
  items,
  onInspect,
}: {
  items: DraftItem[]
  onInspect: (item: DraftItem) => void
}) {
  const columns = [
    {
      status: 'published',
      label: 'Published',
      tone: 'success' as const,
      items: items.filter((i) => i.status === 'published'),
    },
    {
      status: 'archived',
      label: 'Archived',
      tone: 'neutral' as const,
      items: items.filter((i) => i.status === 'archived'),
    },
  ]

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
                No items
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
                    <span className="line-clamp-2 text-sm font-medium">
                      {item.title}
                    </span>
                    <StatusBadge tone={DRAFT_TYPE_TONE[item.type]} className="shrink-0">
                      {DRAFT_TYPE_LABEL[item.type]}
                    </StatusBadge>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.author}</span>
                    {item.publishDate && (
                      <Badge variant="outline" className="text-[10px]">
                        {item.publishDate}
                      </Badge>
                    )}
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

function PublishedTable({
  items,
  onInspect,
}: {
  items: DraftItem[]
  onInspect: (item: DraftItem) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Visibility</TableHead>
            <TableHead className="hidden lg:table-cell">Author</TableHead>
            <TableHead className="hidden lg:table-cell">Published</TableHead>
            <TableHead className="hidden xl:table-cell">Language</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <button
                  type="button"
                  className="flex flex-col items-start gap-0.5 text-left"
                  onClick={() => onInspect(item)}
                >
                  <span className="max-w-72 truncate font-medium hover:underline">
                    {item.title}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.slug}
                  </span>
                </button>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <StatusBadge tone={DRAFT_TYPE_TONE[item.type]}>
                  {DRAFT_TYPE_LABEL[item.type]}
                </StatusBadge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <StatusBadge tone={DRAFT_STATUS_TONE[item.status]}>
                  {DRAFT_STATUS_LABEL[item.status]}
                </StatusBadge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {VISIBILITY_LABEL[item.visibility]}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {item.author}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {item.publishDate ?? '—'}
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">
                {LANGUAGE_LABEL[item.language]}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal />
                      <span className="sr-only">Row actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onInspect(item)}>
                      <Pencil /> View details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye /> View live
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Undo2 /> Unpublish
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

function PublishedGrid({
  items,
  onInspect,
}: {
  items: DraftItem[]
  onInspect: (item: DraftItem) => void
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
            <div className="flex flex-col gap-0.5">
              <p className="line-clamp-2 text-sm leading-snug font-medium">
                {item.title}
              </p>
              <span className="font-mono text-xs text-muted-foreground">
                {item.slug}
              </span>
            </div>
            <StatusBadge tone={DRAFT_STATUS_TONE[item.status]}>
              {DRAFT_STATUS_LABEL[item.status]}
            </StatusBadge>
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</p>
          <div className="flex flex-wrap gap-1">
            <StatusBadge tone={DRAFT_TYPE_TONE[item.type]} className="text-[10px]">
              {DRAFT_TYPE_LABEL[item.type]}
            </StatusBadge>
            <Badge variant="outline" className="text-[10px]">
              {VISIBILITY_LABEL[item.visibility]}
            </Badge>
          </div>
          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.author}</span>
            {item.publishDate && (
              <Badge variant="outline" className="text-[10px]">
                {item.publishDate}
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

function PublishedDetailSheet({
  item,
  onClose,
}: {
  item: DraftItem | null
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
                <StatusBadge tone={DRAFT_STATUS_TONE[item.status]}>
                  {DRAFT_STATUS_LABEL[item.status]}
                </StatusBadge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">/{item.slug}</span>
                <span>·</span>
                <span>v{item.version}</span>
                <span>·</span>
                <span>{item.author}</span>
              </div>
            </SheetHeader>
            <Tabs defaultValue="details" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Input readOnly defaultValue={DRAFT_TYPE_LABEL[item.type]} />
                    </Field>
                    <Field>
                      <FieldLabel>Visibility</FieldLabel>
                      <Input
                        readOnly
                        defaultValue={VISIBILITY_LABEL[item.visibility]}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Author</FieldLabel>
                      <Input readOnly defaultValue={item.author} />
                    </Field>
                    <Field>
                      <FieldLabel>Language</FieldLabel>
                      <Input readOnly defaultValue={LANGUAGE_LABEL[item.language]} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Published</FieldLabel>
                      <Input readOnly defaultValue={item.publishDate ?? '—'} />
                    </Field>
                    <Field>
                      <FieldLabel>Last Updated</FieldLabel>
                      <Input readOnly defaultValue={item.updatedAt} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Excerpt</FieldLabel>
                    <Textarea rows={3} readOnly defaultValue={item.excerpt} />
                  </Field>
                  <Field>
                    <FieldLabel>Tags</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </Field>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        toast.success('Opening live page', {
                          description: `Viewing "${item.title}" on the live site.`,
                        })
                      }}
                    >
                      <Eye data-icon="inline-start" />
                      View Live
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        toast.success('Content archived', {
                          description: `"${item.title}" has been archived.`,
                        })
                        onClose()
                      }}
                    >
                      <Archive data-icon="inline-start" />
                      Archive
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      toast.success('Content unpublished', {
                        description: `"${item.title}" has been unpublished.`,
                      })
                      onClose()
                    }}
                  >
                    <Undo2 data-icon="inline-start" />
                    Unpublish
                  </Button>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="seo" className="pt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Meta Title</FieldLabel>
                    <Input readOnly defaultValue={item.title} />
                  </Field>
                  <Field>
                    <FieldLabel>Meta Description</FieldLabel>
                    <Textarea rows={2} readOnly defaultValue={item.excerpt} />
                  </Field>
                  <Field>
                    <FieldLabel>OG Title</FieldLabel>
                    <Input readOnly defaultValue={item.title} />
                  </Field>
                  <Field>
                    <FieldLabel>OG Description</FieldLabel>
                    <Textarea rows={2} readOnly defaultValue={item.excerpt} />
                  </Field>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <FieldGroup>
                  <span className="text-sm font-medium">
                    {item.activity.length} activities
                  </span>
                  {item.activity.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
                    >
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
