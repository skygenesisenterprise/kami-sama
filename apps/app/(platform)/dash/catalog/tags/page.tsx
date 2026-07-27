'use client'

import * as React from 'react'
import {
  Archive,
  Columns3,
  Eye,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
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
import { StatusBadge } from '@/components/dash/status-badge'
import {
  TAG_MOCK,
  USAGE_FREQUENCY_TONE,
  USAGE_FREQUENCY_LABEL,
  getTagStats,
  type TagItem,
  type UsageFrequency,
} from '@/lib/tags-catalog-data'

type SortKey = 'name' | 'series' | 'people' | 'frequency' | 'updated'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'series', label: 'Series count' },
  { value: 'people', label: 'People count' },
  { value: 'frequency', label: 'Usage frequency' },
  { value: 'updated', label: 'Last updated' },
]

const ALL_FREQUENCIES: Array<UsageFrequency | 'all'> = ['all', 'high', 'medium', 'low']

export default function TagsCatalogPage() {
  const [query, setQuery] = React.useState('')
  const [frequency, setFrequency] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('name')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<TagItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [columns, setColumns] = React.useState<Record<string, boolean>>({
    series: true,
    people: true,
    frequency: true,
    lastUsed: true,
    updated: true,
  })

  const stats = React.useMemo(() => getTagStats(TAG_MOCK), [])

  const filtered = React.useMemo(() => {
    let items = TAG_MOCK.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
      const matchesFrequency = frequency === 'all' || item.usageFrequency === frequency
      return matchesQuery && matchesFrequency
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
        case 'people':
          cmp = a.peopleCount - b.peopleCount
          break
        case 'frequency': {
          const freqOrder: Record<UsageFrequency, number> = { high: 0, medium: 1, low: 2 }
          cmp = freqOrder[a.usageFrequency] - freqOrder[b.usageFrequency]
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
  }, [query, frequency, sortKey, sortDir])

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
    toast.success(`${action} applied to ${selected.size} tags`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Tags Catalog"
        description="Manage your tag taxonomy. Organize series and people with descriptive labels, track usage, and maintain consistent tagging."
      >
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus data-icon="inline-start" />
          New tag
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total tags"
          value={stats.total}
          icon={<Tag className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Series usages"
          value={stats.totalSeriesUsage}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="People usages"
          value={stats.totalPeopleUsage}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="High usage"
          value={stats.highUsage}
          icon={<Tag className="size-4 text-success" />}
          tone="success"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select value={frequency} onValueChange={(v) => setFrequency(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_FREQUENCIES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f === 'all' ? 'All frequencies' : USAGE_FREQUENCY_LABEL[f]}
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
            <EmptyTitle>No tags found</EmptyTitle>
            <EmptyDescription>
              No tags match the current filters. Try adjusting your search or
              create a new tag.
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
                {columns.series && (
                  <TableHead className="hidden md:table-cell">
                    Series
                  </TableHead>
                )}
                {columns.people && (
                  <TableHead className="hidden md:table-cell">
                    People
                  </TableHead>
                )}
                {columns.frequency && (
                  <TableHead className="hidden lg:table-cell">
                    Frequency
                  </TableHead>
                )}
                {columns.lastUsed && (
                  <TableHead className="hidden lg:table-cell">
                    Last used
                  </TableHead>
                )}
                {columns.updated && (
                  <TableHead className="hidden xl:table-cell">
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
                      <Badge variant="secondary" className="text-xs">
                        {item.name}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.slug}
                      </span>
                    </button>
                  </TableCell>
                  {columns.series && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {item.seriesCount}
                    </TableCell>
                  )}
                  {columns.people && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {item.peopleCount}
                    </TableCell>
                  )}
                  {columns.frequency && (
                    <TableCell className="hidden lg:table-cell">
                      <StatusBadge tone={USAGE_FREQUENCY_TONE[item.usageFrequency]}>
                        {USAGE_FREQUENCY_LABEL[item.usageFrequency]}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.lastUsed && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.lastUsedAt}
                    </TableCell>
                  )}
                  {columns.updated && (
                    <TableCell className="hidden text-muted-foreground xl:table-cell">
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
                            Edit tag
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye />
                            Preview series
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw />
                            Sync usage
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
                <Badge variant="secondary" className="text-sm">
                  {item.name}
                </Badge>
                <StatusBadge tone={USAGE_FREQUENCY_TONE[item.usageFrequency]}>
                  {USAGE_FREQUENCY_LABEL[item.usageFrequency]}
                </StatusBadge>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.topSeries.slice(0, 3).map((s) => (
                  <Badge key={s.id} variant="outline" className="text-xs">
                    {s.title}
                  </Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.seriesCount} series</span>
                <span>{item.peopleCount} people</span>
                <span>{item.lastUsedAt}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {TAG_MOCK.length} tags
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

      <TagDetailSheet
        item={inspecting}
        onClose={() => setInspecting(null)}
      />

      <NewTagDialog open={creating} onOpenChange={setCreating} />
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

function TagDetailSheet({
  item,
  onClose,
}: {
  item: TagItem | null
  onClose: () => void
}) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {item.name}
                </Badge>
                <StatusBadge tone={USAGE_FREQUENCY_TONE[item.usageFrequency]}>
                  {USAGE_FREQUENCY_LABEL[item.usageFrequency]}
                </StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                /{item.slug} · Last used {item.lastUsedAt} · Last updated{' '}
                {item.updatedAt} by {item.updatedBy}
              </SheetDescription>
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
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Series</FieldLabel>
                      <Input readOnly defaultValue={item.seriesCount} />
                    </Field>
                    <Field>
                      <FieldLabel>People</FieldLabel>
                      <Input readOnly defaultValue={item.peopleCount} />
                    </Field>
                    <Field>
                      <FieldLabel>Frequency</FieldLabel>
                      <Select defaultValue={item.usageFrequency}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
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
                      No series are currently tagged with this tag.
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
                    description: `Tag "${item.name}" was updated.`,
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

function NewTagDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [frequency, setFrequency] = React.useState<string>('medium')

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
    setFrequency('medium')
  }

  const handleCreate = () => {
    toast.success('Tag created', {
      description: `Tag "${name}" has been added to the catalog.`,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New tag</DialogTitle>
          <DialogDescription>
            Add a new tag to your taxonomy. Tags help organize series and people with descriptive labels.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Name *</FieldLabel>
            <Input
              placeholder="e.g. isekai"
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
            <FieldLabel>Usage frequency</FieldLabel>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button disabled={!name.trim()} onClick={handleCreate}>
            Create tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
