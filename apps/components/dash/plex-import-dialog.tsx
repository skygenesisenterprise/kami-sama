'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Film, Loader2, Search, Tv } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SourceResultCard, type SourceResultItem } from '@/components/dash/source-result-card'
import { plexItemToSourceItem } from '@/lib/source-search'
import { ApiError } from '@/lib/api/errors'
import { plexApi, type PlexImportResult, type PlexLibraryItem } from '@/lib/api/plex'

type PlexImportKind = 'series' | 'movie'

interface PlexImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: PlexImportKind
  onImported: (result: PlexImportResult) => void
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
}

function typeIcon(kind: PlexImportKind) {
  return kind === 'series' ? <Tv className="size-3.5" /> : <Film className="size-3.5" />
}

/**
 * Search dialog that queries the configured Plex server by title and imports
 * a result into the catalog via POST /integrations/plex/import.
 */
export function PlexImportDialog({ open, onOpenChange, kind, onImported }: PlexImportDialogProps) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<PlexLibraryItem[]>([])
  const [searching, setSearching] = React.useState(false)
  const [importingKey, setImportingKey] = React.useState<string | null>(null)
  const [notConfigured, setNotConfigured] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [imported, setImported] = React.useState<Set<string>>(new Set())

  const type = kind === 'series' ? 'show' : 'movie'

  const runSearch = React.useCallback(
    async (value: string) => {
      const q = value.trim()
      if (!q) {
        setResults([])
        return
      }
      setSearching(true)
      setError(null)
      setNotConfigured(false)
      try {
        const res = await plexApi.search(q, { type, limit: 12 })
        const wanted = kind === 'series' ? ['Series', 'show'] : ['Movie', 'movie']
        const filtered = res.items.filter((i) => wanted.includes(i.type ?? ''))
        setResults(filtered)
      } catch (err) {
        if (err instanceof ApiError && err.code === 'PLEX_DISABLED') {
          setNotConfigured(true)
        } else {
          setError(formatError(err))
        }
        setResults([])
      } finally {
        setSearching(false)
      }
    },
    [kind, type],
  )

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
      setImportingKey(null)
      setNotConfigured(false)
      setError(null)
    }
  }

  const doImport = React.useCallback(
    async (item: SourceResultItem) => {
      const ratingKey = item.id
      if (!ratingKey) return
      setImportingKey(ratingKey)
      try {
        const result = await plexApi.importItem(ratingKey)
        toast.success(
          result.created
            ? `Imported "${result.title}"`
            : `"${result.title}" was already in the catalog — updated`,
        )
        setImported((prev) => new Set(prev).add(ratingKey))
        onImported(result)
      } catch (err) {
        toast.error(`Import failed: ${formatError(err)}`)
      } finally {
        setImportingKey(null)
      }
    },
    [onImported],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Import from Plex
            <Badge variant="secondary" className="text-[10px] capitalize">
              {kind === 'series' ? 'shows' : 'movies'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Search the connected Plex server by title and add a {kind === 'series' ? 'show' : 'movie'} to your
            catalog. Imports are persisted and deduplicated by Plex rating key.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={`Search Plex ${kind === 'series' ? 'shows' : 'movies'}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="min-h-48">
          {notConfigured ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Plex is not configured on the server. Connect your Plex server first.
              </p>
              <Link href="/dash/sources/plex">
                <Button size="sm" variant="outline">
                  <Tv className="mr-1.5 size-3.5" />
                  Open Plex settings
                </Button>
              </Link>
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Search failed: {error}
            </div>
          ) : searching ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching…
            </div>
          ) : query.trim() === '' ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              Type a title to search your Plex server.
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              No {kind === 'series' ? 'shows' : 'movies'} found for “{query.trim()}”.
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="flex flex-col gap-3 pr-3">
                {results.map((item) => {
                  const source = plexItemToSourceItem(item)
                  const done = imported.has(source.id)
                  return (
                    <SourceResultCard
                      key={source.id}
                      item={source}
                      icon={kind}
                      actionLabel="Add to catalog"
                      isActing={source.id === importingKey}
                      done={done}
                      onAction={(it) => void doImport(it)}
                    />
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
