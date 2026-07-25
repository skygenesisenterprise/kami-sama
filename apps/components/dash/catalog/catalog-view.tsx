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
  Rocket,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  statusToneMap,
  type CatalogItem,
  type CollectionConfig,
  type PublicationState,
} from '@/lib/catalog-data'

const allStatuses: Array<PublicationState | 'all'> = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

type ColumnKey = 'status' | 'year' | 'studio' | 'genres' | 'rating' | 'updated'

const columnLabels: Record<ColumnKey, string> = {
  status: 'Status',
  year: 'Year',
  studio: 'Studio',
  genres: 'Genres',
  rating: 'Rating',
  updated: 'Updated',
}

export function CatalogView({
  collection,
  items,
}: {
  collection: CollectionConfig
  items: CatalogItem[]
}) {
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [inspecting, setInspecting] = React.useState<CatalogItem | null>(null)
  const [columns, setColumns] = React.useState<Record<ColumnKey, boolean>>({
    status: true,
    year: true,
    studio: true,
    genres: true,
    rating: true,
    updated: true,
  })

  const filtered = items.filter((item) => {
    const matchesQuery = item.title
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesStatus = status === 'all' || item.status === status
    return matchesQuery && matchesStatus
  })

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(filtered.map((i) => i.id)))
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const bulkAction = (action: string) => {
    toast.success(`${action} applied to ${selected.size} items`, {
      description: 'Changes will sync to the API when connected.',
    })
    setSelected(new Set())
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title={collection.title} description={collection.description}>
        <Button variant="outline" size="sm">
          <Eye data-icon="inline-start" />
          Preview site
        </Button>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New {collection.singular}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={`Filter ${collection.title.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <Select value={status} onValueChange={(v) => setStatus(v as string)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Columns3 data-icon="inline-start" />
                Columns
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={columns[key]}
                  onCheckedChange={(checked) =>
                    setColumns((prev) => ({ ...prev, [key]: checked }))
                  }
                >
                  {columnLabels[key]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto">
          <ToggleGroup
            value={view}
            onValueChange={(v) => {
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

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No results</EmptyTitle>
            <EmptyDescription>
              No {collection.title.toLowerCase()} match the current filters.
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
                {columns.year && (
                  <TableHead className="hidden md:table-cell">Year</TableHead>
                )}
                {columns.studio && (
                  <TableHead className="hidden lg:table-cell">Studio</TableHead>
                )}
                {columns.genres && (
                  <TableHead className="hidden xl:table-cell">Genres</TableHead>
                )}
                {columns.rating && (
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
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
                        {item.id} · {item.subtitle}
                      </span>
                    </button>
                  </TableCell>
                  {columns.status && (
                    <TableCell>
                      <StatusBadge tone={statusToneMap[item.status]}>
                        {item.status}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {columns.year && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {item.year}
                    </TableCell>
                  )}
                  {columns.studio && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.studio}
                    </TableCell>
                  )}
                  {columns.genres && (
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex gap-1">
                        {item.genres.map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  )}
                  {columns.rating && (
                    <TableCell className="hidden font-mono text-muted-foreground md:table-cell">
                      {item.rating.toFixed(1)}
                    </TableCell>
                  )}
                  {columns.updated && (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {item.updated}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Row actions</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => setInspecting(item)}
                          >
                            <Pencil />
                            Quick edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem variant="destructive">
                            <Trash2 />
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
                <p className="line-clamp-2 text-sm leading-snug font-medium">
                  {item.title}
                </p>
                <StatusBadge tone={statusToneMap[item.status]}>
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
              <p className="mt-auto font-mono text-xs text-muted-foreground">
                {item.year} · {item.studio} · ★ {item.rating.toFixed(1)}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {items.length}{' '}
          {collection.title.toLowerCase()}
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

      <InspectorPanel
        item={inspecting}
        onClose={() => setInspecting(null)}
        collection={collection}
      />
    </main>
  )
}

function InspectorPanel({
  item,
  onClose,
  collection,
}: {
  item: CatalogItem | null
  onClose: () => void
  collection: CollectionConfig
}) {
  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{item.title}</SheetTitle>
                <StatusBadge tone={statusToneMap[item.status]}>
                  {item.status}
                </StatusBadge>
              </div>
              <SheetDescription className="font-mono text-xs">
                {item.id} · Last updated {item.updated} by {item.updatedBy}
              </SheetDescription>
            </SheetHeader>
            <Tabs defaultValue="metadata" className="flex-1 overflow-y-auto px-4 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="metadata" className="pt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="insp-title">Title</FieldLabel>
                    <Input id="insp-title" defaultValue={item.title} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="insp-year">Year</FieldLabel>
                      <Input id="insp-year" defaultValue={String(item.year)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="insp-studio">Studio</FieldLabel>
                      <Input id="insp-studio" defaultValue={item.studio} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="insp-synopsis">Synopsis</FieldLabel>
                    <Textarea
                      id="insp-synopsis"
                      rows={4}
                      defaultValue={`Synopsis for ${item.title} synced from TMDB. Edit to override the imported value for this ${collection.singular}.`}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Tags</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.map((g) => (
                        <Badge key={g} variant="secondary">
                          {g}
                        </Badge>
                      ))}
                      <Badge variant="outline">+ Add tag</Badge>
                    </div>
                  </Field>
                </FieldGroup>
              </TabsContent>
              <TabsContent value="relations" className="flex flex-col gap-3 pt-4">
                {[
                  { label: 'Seasons', value: item.subtitle },
                  { label: 'Episodes', value: `${item.episodes} episodes` },
                  { label: 'Studio', value: item.studio },
                  { label: 'Collections', value: 'Spring 2026 Simulcast, Staff Favorites' },
                ].map((rel) => (
                  <div
                    key={rel.label}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">{rel.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {rel.value}
                    </span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="sources" className="flex flex-col gap-3 pt-4">
                {item.sources.map((src) => (
                  <div
                    key={src}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{src}</span>
                      <span className="text-xs text-muted-foreground">
                        Linked · auto-sync enabled
                      </span>
                    </div>
                    <StatusBadge tone="success">Synced</StatusBadge>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                <ol className="relative flex flex-col border-l border-border pl-4">
                  {[
                    { v: 'v14', note: 'Metadata refreshed from TMDB', who: 'auto-import', when: item.updated },
                    { v: 'v13', note: 'Synopsis manually edited', who: item.updatedBy, when: '2 days ago' },
                    { v: 'v12', note: 'Poster replaced', who: 'K. Ito', when: 'last week' },
                    { v: 'v11', note: 'Initial import', who: 'auto-import', when: '3 months ago' },
                  ].map((rev) => (
                    <li key={rev.v} className="relative flex flex-col gap-0.5 pb-4 last:pb-0">
                      <span className="absolute top-1.5 -left-[21.5px] size-2.5 rounded-full border-2 border-background bg-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-mono font-medium">{rev.v}</span>{' '}
                        — {rev.note}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {rev.who} · {rev.when}
                      </span>
                    </li>
                  ))}
                </ol>
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
