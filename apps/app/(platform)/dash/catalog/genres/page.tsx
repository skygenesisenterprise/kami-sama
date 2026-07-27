'use client'

import * as React from 'react'
import {
  Archive,
  BarChart3,
  Columns3,
  Eye,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Tag,
  TrendingUp,
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
  GENRE_MOCK,
  USAGE_TREND_TONE,
  USAGE_TREND_LABEL,
  getGenreStats,
  type GenreItem,
  type UsageTrend,
} from '@/lib/genres-catalog-data'

type SortKey = 'name' | 'series' | 'trend' | 'updated'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'series', label: 'Series count' },
  { value: 'trend', label: 'Usage trend' },
  { value: 'updated', label: 'Last updated' },
]

const ALL_TRENDS: Array<UsageTrend | 'all'> = ['all', 'growing', 'stable', 'declining']

export default function GenresCatalogPage() {
  const [query, setQuery] = React.useState('')
  const [trend, setTrend] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('name')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<GenreItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    color: true,
    series: true,
    trend: true,
    description: true,
    updated: true,
  })

  const stats = React.useMemo(() => getGenreStats(GENRE_MOCK), [])

  const filtered = React.useMemo(() => {
    let items = GENRE_MOCK.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.slug.toLowerCase().includes(query.toLowerCase())
      const matchesTrend = trend === 'all' || item.usageTrend === trend
      return matchesQuery && matchesTrend
    })

    items.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'series':
          cmp = a.seriesCount - b.seriesCount
          break
        case 'trend': {
          const trendOrder: Record<UsageTrend, number> = { growing: 0, stable: 1, declining: 2 }
          cmp = trendOrder[a.usageTrend] - trendOrder[b.usageTrend]
          break
        }
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
  }, [query, trend, sortKey, sortDir])

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
    toast.success(`${action} applied to ${selected.size} genres`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Genres Catalog"
        description="Manage your genre taxonomy. Organize series, track usage trends, and maintain consistent categorization."
      >
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus data-icon="inline-start" />
          New genre
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total genres"
          value={stats.total}
          icon={<Tag className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Series using genres"
          value={stats.totalSeriesUsage}
          icon={<BarChart3 className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Growing"
          value={stats.growing}
          icon={<TrendingUp className="size-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="Unused genres"
          value={stats.unused}
          icon={<Tag className="size-4 text-muted-foreground" />}
          tone={stats.unused > 0 ? 'destructive' : 'neutral'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={trend} onValueChange={(v) => setTrend(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_TRENDS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All trends' : USAGE_TREND_LABEL[t]}
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
            <EmptyTitle>No genres found</EmptyTitle>
            <EmptyDescription>
              No genres match the current filters. Try adjusting your search or
              create a new genre.
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
                <TableHead>Name</TableHead>
                {columns.color && <TableHead className="w-10" />}
                {columns.series && (
                  <TableHead className="hidden md:table-cell">
                    Series
                  </TableHead>
                )}
                {columns.trend && (
                  <TableHead className="hidden md:table-cell">
                    Usage trend
                  </TableHead>
                )}
                {columns.description && (
                  <TableHead className="hidden lg:table-cell">
                    Description
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
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-left"
                      onClick={() => setInspecting(item)}
                    >
                      <span className="max-w-64 truncate font-medium hover:underline">
                        {item.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.slug}
                      </span>
                    </button>
                  </TableCell>
                  {columns.color && (
                    <TableCell>
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </TableCell>
                  )}
                  {columns.series && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {item.seriesCount}
                    </TableCell>
                  )}
                  {columns.trend && (
                    <TableCell className="hidden md:table-cell">
                      <StatusBadge tone={USAGE_TREND_TONE[item.usageTrend]}>
                        {USAGE_TREND_LABEL[item.usageTrend]}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.description && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      <span className="line-clamp-1 max-w-64">
                        {item.description}
                      </span>
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
                            Edit genre
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye />
                            Preview series
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
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
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="line-clamp-1 text-sm leading-snug font-medium">
                    {item.name}
                  </p>
                </div>
                <StatusBadge tone={USAGE_TREND_TONE[item.usageTrend]}>
                  {USAGE_TREND_LABEL[item.usageTrend]}
                </StatusBadge>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.seriesCount} series</span>
                <span>{item.updatedAt}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {GENRE_MOCK.length} genres
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

      <GenreDetailSheet
        item={inspecting}
        onClose={() => setInspecting(null)}
      />

      <NewGenreDialog open={creating} onOpenChange={setCreating} />
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

function GenreDetailSheet({
  item,
  onClose,
}: {
  item: GenreItem | null
  onClose: () => void
}) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <SheetTitle className="text-base">{item.name}</SheetTitle>
                <StatusBadge tone={USAGE_TREND_TONE[item.usageTrend]}>
                  {USAGE_TREND_LABEL[item.usageTrend]}
                </StatusBadge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                /{item.slug} · Last updated {item.updatedAt} by{' '}
                {item.updatedBy}
              </span>
            </SheetHeader>
            <Tabs
              defaultValue="overview"
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="series">Series</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input defaultValue={item.name} />
                    </Field>
                    <Field>
                      <FieldLabel>Slug</FieldLabel>
                      <Input defaultValue={item.slug} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea rows={3} defaultValue={item.description} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Color</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          defaultValue={item.color}
                          className="size-8 cursor-pointer rounded border-0 p-0"
                        />
                        <Input defaultValue={item.color} className="font-mono text-xs" />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel>Usage trend</FieldLabel>
                      <Select defaultValue={item.usageTrend}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="growing">Growing</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="declining">Declining</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="series" className="pt-4">
                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {item.topSeries.length} series · {item.seriesCount} total
                      usages
                    </span>
                  </div>
                  {item.topSeries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No series are currently tagged with this genre.
                    </p>
                  ) : (
                    item.topSeries.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{s.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.year}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="size-7">
                          <Eye />
                          <span className="sr-only">View series</span>
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
                    description: `${item.name} was updated.`,
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

function NewGenreDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [color, setColor] = React.useState('#6366f1')
  const [trend, setTrend] = React.useState<string>('stable')

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    )
  }

  const reset = () => {
    setName('')
    setSlug('')
    setDescription('')
    setColor('#6366f1')
    setTrend('stable')
  }

  const handleCreate = () => {
    toast.success('Genre created', {
      description: `"${name}" has been added to the catalog.`,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New genre</DialogTitle>
          <DialogDescription>
            Add a new genre to your taxonomy. Define how series will be categorized.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Name *</FieldLabel>
            <Input
              placeholder="e.g. Cyberpunk"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Slug</FieldLabel>
            <Input
              placeholder="auto-generated-from-name"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono text-xs"
            />
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              rows={3}
              placeholder="Describe what this genre encompasses..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Color</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-8 cursor-pointer rounded border-0 p-0"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </Field>
            <Field>
              <FieldLabel>Usage trend</FieldLabel>
              <Select value={trend} onValueChange={setTrend}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="declining">Declining</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button disabled={!name.trim()} onClick={handleCreate}>
            Create genre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
