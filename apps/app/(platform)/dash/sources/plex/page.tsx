'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  Ban,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Film,
  Globe,
  HardDrive,
  Info,
  Layers,
  Link2,
  Loader2,
  Music,
  RefreshCw,
  Scan,
  Server,
  Settings,
  Trash2,
  Tv,
  Zap,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge, type StatusTone } from '@/components/dash/status-badge'
import { PageHeader } from '@/components/dash/page-header'
import { ApiError } from '@/lib/api/errors'
import { cn } from '@/lib/utils'
import {
  plexApi,
  sourceConfigApi,
  type PlexConnection,
  type PlexHealth,
  type PlexIdentity,
  type PlexLibrary,
  type PlexLibraryItem,
  type PlexServerResource,
  type PlexSyncLog,
  type SourceConfig,
} from '@/lib/api/plex'
import {
  type LogLevel,
  type MediaMapping,
  type ProviderCapability,
  type ProviderLog,
} from '@/lib/plex-provider-data'

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
}

function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'PLEX_INVALID_TOKEN'
}

function statusTone(s: string): StatusTone {
  return s === 'connected' ? 'success' : s === 'syncing' ? 'info' : s === 'error' ? 'destructive' : 'neutral'
}

function syncStatusTone(status: string): StatusTone {
  if (status === 'completed') return 'success'
  if (status === 'running') return 'info'
  if (status === 'failed') return 'destructive'
  return 'neutral'
}

function jobStatusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function logLevelIcon(l: LogLevel) {
  if (l === 'info') return <Info className="size-3.5" />
  if (l === 'warn') return <AlertTriangle className="size-3.5" />
  if (l === 'error') return <XCircle className="size-3.5" />
  return <FileText className="size-3.5" />
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDuration(startedAt: string, completedAt?: string | null): string {
  if (!completedAt) return ''
  const secs = Math.max(0, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000))
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ${secs % 60}s`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function mediaTypeIcon(type: string) {
  if (type === 'movie') return <Film className="size-4" />
  if (type === 'show') return <Tv className="size-4" />
  if (type === 'music') return <Music className="size-4" />
  return <Layers className="size-4" />
}

function lastLogFor(logs: PlexSyncLog[], libraryId: string): PlexSyncLog | undefined {
  return logs
    .filter((l) => l.libraryId === libraryId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
}

function matchScoreBadge(score: number) {
  if (score >= 95) return <Badge variant="outline" className="border-success/50 text-success">{score}%</Badge>
  if (score >= 80) return <Badge variant="outline" className="border-warning/50 text-warning">{score}%</Badge>
  return <Badge variant="outline" className="border-destructive/50 text-destructive">{score}%</Badge>
}

/* -------------------------------------------------------------------------- */
/*  Capabilities + Logs + Mappings derivation (no dedicated endpoints yet)    */
/* -------------------------------------------------------------------------- */

const PLEX_CAPABILITIES: ProviderCapability[] = [
  { id: 'cap-1', name: 'Library Scanning', description: 'Discover Plex library sections, item counts and media types through the server API.', supported: true, enabled: true },
  { id: 'cap-2', name: 'Metadata Fetch', description: 'Retrieve titles, ratings, genres, artwork and technical details for every item.', supported: true, enabled: true },
  { id: 'cap-3', name: 'Search', description: 'Full-text search across the server to resolve titles and rating keys.', supported: true, enabled: true },
  { id: 'cap-4', name: 'Import', description: 'Upsert individual Plex items into the Kami-Sama catalog by rating key.', supported: true, enabled: true },
  { id: 'cap-5', name: 'Library Sync', description: 'Run incremental syncs that create and update Kami-Sama records from Plex libraries.', supported: true, enabled: true },
  { id: 'cap-6', name: 'Metadata Refresh', description: 'Trigger on-demand metadata refresh for a library on the Plex server.', supported: true, enabled: true },
  { id: 'cap-7', name: 'Remote Discovery', description: 'Resolve local and remote connections via the app.plex.tv account API.', supported: true, enabled: true },
  { id: 'cap-8', name: 'OAuth Sign-in', description: 'Authorize the integration through the Plex PIN flow without sharing tokens.', supported: true, enabled: true },
  { id: 'cap-9', name: 'Watch History Sync', description: 'Synchronize watch history and playback progress from Plex.', supported: false, enabled: false },
  { id: 'cap-10', name: 'Live TV / DVR', description: 'Manage Plex Live TV channels and recordings.', supported: false, enabled: false },
  { id: 'cap-11', name: 'Downloads', description: 'Manage offline downloads and encoding sessions.', supported: false, enabled: false },
  { id: 'cap-12', name: 'Webhooks', description: 'Receive real-time change notifications from Plex.', supported: false, enabled: false },
]

function plexExternalIds(item: PlexLibraryItem): MediaMapping['externalIds'] {
  const out: MediaMapping['externalIds'] = {}
  const guid = item.Guid
  if (Array.isArray(guid)) {
    for (const g of guid) {
      const id = typeof g === 'string' ? g : asUnknownRecord(g).id
      const s = typeof id === 'string' ? id : ''
      if (s.startsWith('imdb://')) out.imdb = s.slice(7)
      else if (s.startsWith('tmdb://')) out.tmdb = s.slice(7)
      else if (s.startsWith('tvdb://')) out.tvdb = s.slice(7)
    }
  }
  return out
}

function asUnknownRecord(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {}
}

function plexItemToMapping(item: PlexLibraryItem): MediaMapping | null {
  const rawType = String(item.type ?? '')
  if (!['movie', 'show', 'episode', 'season'].includes(rawType)) return null
  const ratingKey = String(item.ratingKey ?? item.sourceId ?? item.id ?? '')
  const title = String(item.title ?? item.name ?? 'Unknown')
  if (!ratingKey) return null
  const externalIds = plexExternalIds(item)
  return {
    id: `map-${ratingKey}`,
    kamiId: `ks-${ratingKey}`,
    kamiTitle: title,
    plexRatingKey: ratingKey,
    plexTitle: title,
    type: rawType as MediaMapping['type'],
    externalIds,
    lastSyncedAt: new Date().toISOString(),
    matchScore: externalIds.tmdb || externalIds.imdb || externalIds.tvdb ? 100 : 0,
  }
}

function deriveProviderLogs(input: {
  identity: PlexIdentity | null
  health: PlexHealth | null
  libraries: PlexLibrary[]
  syncLogs: PlexSyncLog[]
  librariesError: string | null
  remoteError: string | null
}): ProviderLog[] {
  const logs: ProviderLog[] = []
  const now = new Date().toISOString()
  const serverName = asString(input.identity?.friendlyName) || 'Plex Media Server'

  if (input.health?.reachable) {
    logs.push({
      id: 'log-connection',
      timestamp: now,
      level: 'info',
      message: `Connected to ${serverName}`,
      source: 'connection',
      details: `Server reachable in ${input.health.latencyMs}ms`,
    })
  }
  if (input.identity && asString(input.identity.machineIdentifier)) {
    logs.push({
      id: 'log-identity',
      timestamp: now,
      level: 'info',
      message: 'Server identity resolved',
      source: 'identity',
      details: `machineIdentifier ${asString(input.identity.machineIdentifier)} · v${asString(input.identity.version)}`,
    })
  }
  if (input.libraries.length > 0) {
    const total = input.libraries.reduce((sum, l) => sum + l.itemCount, 0)
    logs.push({
      id: 'log-libraries',
      timestamp: now,
      level: 'info',
      message: `Loaded ${input.libraries.length} libraries`,
      source: 'libraries',
      details: `${total.toLocaleString()} items indexed`,
    })
  } else if (input.librariesError) {
    logs.push({
      id: 'log-libraries-error',
      timestamp: now,
      level: 'error',
      message: 'Failed to load libraries',
      source: 'libraries',
      details: input.librariesError,
    })
  }
  if (input.remoteError) {
    logs.push({
      id: 'log-remote',
      timestamp: now,
      level: 'warn',
      message: 'Remote connections unavailable',
      source: 'connection',
      details: input.remoteError,
    })
  }
  for (const l of input.syncLogs) {
    const libraryName = input.libraries.find((lib) => lib.id === l.libraryId)?.name ?? `library ${l.libraryId}`
    if (l.status === 'failed') {
      logs.push({
        id: `log-sync-${l.id}`,
        timestamp: l.startedAt,
        level: 'error',
        message: `Library sync failed for "${libraryName}"`,
        source: 'sync-engine',
        details: l.errorMessage ?? `${l.itemsCreated} created, ${l.itemsUpdated} updated`,
      })
    } else if (l.status === 'running') {
      logs.push({
        id: `log-sync-${l.id}`,
        timestamp: l.startedAt,
        level: 'info',
        message: `Library sync started for "${libraryName}"`,
        source: 'library-sync',
      })
    } else {
      logs.push({
        id: `log-sync-${l.id}`,
        timestamp: l.completedAt ?? l.startedAt,
        level: l.status === 'completed' ? 'info' : 'warn',
        message: `Library sync completed for "${libraryName}"`,
        source: 'sync-engine',
        details: `${l.itemsCreated} created, ${l.itemsUpdated} updated${l.itemsRemoved ? `, ${l.itemsRemoved} removed` : ''}`,
      })
    }
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function NoData({ icon: Icon, description }: { icon: LucideIcon; description?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">No data</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {description ?? 'Nothing to display yet.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({
  identity,
  health,
  libraries,
  syncLogs,
  remote,
  remoteError,
  librariesError,
  onRefreshRemote,
}: {
  identity: PlexIdentity
  health: PlexHealth
  libraries: PlexLibrary[]
  syncLogs: PlexSyncLog[]
  remote: PlexServerResource | null
  remoteError: string | null
  librariesError: string | null
  onRefreshRemote: () => void
}) {
  const providerName = (identity.friendlyName as string | undefined) || 'Plex Media Server'
  const version = (identity.version as string | undefined) || '—'
  const mediaCount = libraries.reduce((sum, l) => sum + l.itemCount, 0)
  const byType = (t: string) => libraries.filter((l) => l.type === t).reduce((sum, l) => sum + l.itemCount, 0)
  const lastLog = [...syncLogs].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0]
  const lastSyncAt = lastLog?.completedAt ?? lastLog?.startedAt ?? null
  const syncErrors = syncLogs.filter((l) => l.status === 'failed').length

  const statCards = [
    { label: 'Libraries', value: libraries.length.toLocaleString(), sub: 'configured sections', icon: Database },
    { label: 'Total Media', value: mediaCount.toLocaleString(), sub: 'items indexed', icon: Layers },
    { label: 'Movies', value: byType('movie').toLocaleString(), sub: 'in libraries', icon: Film },
    { label: 'TV Shows', value: byType('show').toLocaleString(), sub: 'in libraries', icon: Tv },
    { label: 'Music', value: byType('music').toLocaleString(), sub: 'in libraries', icon: Music },
    { label: 'Last Sync', value: timeAgo(lastSyncAt), sub: `${syncErrors} error${syncErrors === 1 ? '' : 's'}`, icon: RefreshCw },
  ]

  const connections = remote?.connections ?? []

  return (
    <div className="flex flex-col gap-6">
      {librariesError && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-foreground">Libraries could not be loaded</p>
            <p className="text-muted-foreground">{librariesError}</p>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{providerName}</CardTitle>
              <StatusBadge tone="success" pulse={health.reachable}>
                {health.reachable ? 'connected' : 'disconnected'}
              </StatusBadge>
              {health.reachable && (
                <Badge variant="outline" className="border-success/50 text-success text-[10px]">
                  <CheckCircle2 className="mr-1 size-3" />
                  Reachable
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {version} &middot; {libraries.length} libraries &middot; {mediaCount.toLocaleString()} media &middot; Avg {health.latencyMs}ms
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className="size-3.5" />
                {s.label}
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Details</CardTitle>
            <Server className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{health.latencyMs}ms</span>
              <span className="text-sm text-muted-foreground">average latency</span>
            </div>
            <Progress value={health.reachable ? 100 : 0} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Machine ID</p>
                <p className="truncate font-mono text-sm">{asString(identity.machineIdentifier) || '—'}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="truncate text-sm">{asString(identity.platform) || '—'}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Product</p>
                <p className="truncate text-sm">{asString(identity.product) || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Connections</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="size-8" onClick={onRefreshRemote} title="Refresh connections from app.plex.tv">
                <RefreshCw className="size-3.5" />
              </Button>
              <HardDrive className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {remoteError ? (
              <p className="text-sm text-muted-foreground">{remoteError}</p>
            ) : connections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No connections resolved. Sync the server's machine identifier, then refresh.
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold">{connections.length}</span>
                  <span className="text-sm text-muted-foreground">resolved via app.plex.tv</span>
                </div>
                <Progress value={100} className="h-2" />
                <div className="flex flex-col gap-2">
                  {connections.map((conn, i) => (
                    <div
                      key={`${conn.address}-${conn.port}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2"
                    >
                      <span className="truncate font-mono text-xs">{connectionLabel(conn)}</span>
                      <Badge variant={conn.local ? 'secondary' : conn.relay ? 'outline' : 'outline'} className="shrink-0 text-[10px]">
                        {conn.relay ? 'Relay' : conn.local ? 'Local' : 'Remote'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function connectionLabel(conn: PlexConnection): string {
  const proto = conn.protocol ? `${conn.protocol}://` : ''
  const port = conn.port && conn.port !== 443 ? `:${conn.port}` : ''
  return `${proto}${conn.address || conn.uri || '—'}${port}`
}

/* -------------------------------------------------------------------------- */
/*  Libraries Tab                                                             */
/* -------------------------------------------------------------------------- */

function LibrariesTab({
  libraries,
  syncLogs,
  onSync,
  onSyncAll,
  syncingId,
  librariesError,
}: {
  libraries: PlexLibrary[]
  syncLogs: PlexSyncLog[]
  onSync: (libraryId: string) => void
  onSyncAll: () => void
  syncingId: string | null
  librariesError: string | null
}) {
  const [enabledMap, setEnabledMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(libraries.map((l) => [l.id, true])),
  )
  const [autoSyncMap, setAutoSyncMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(libraries.map((l) => [l.id, true])),
  )

  function toggleEnabled(id: string) {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Library setting updated')
  }

  function toggleAutoSync(id: string) {
    setAutoSyncMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Auto-sync setting updated')
  }

  if (libraries.length === 0) {
    return (
      <NoData
        icon={Database}
        description={
          librariesError
            ? `Libraries could not be loaded: ${librariesError}`
            : 'No libraries are available. Once a Plex library is detected it will appear here.'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {libraries.length} libraries &middot; {libraries.filter((l) => enabledMap[l.id]).length} active
        </p>
        <Button size="sm" variant="outline" onClick={onSyncAll} disabled={syncingId !== null}>
          <RefreshCw className={cn('mr-1.5 size-3.5', syncingId === 'all' && 'animate-spin')} />
          Sync All
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {libraries.map((lib) => {
          const log = lastLogFor(syncLogs, lib.id)
          const synced = log ? log.itemsCreated + log.itemsUpdated : 0
          return (
            <Card key={lib.id} className={cn(!enabledMap[lib.id] && 'opacity-60')}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      {mediaTypeIcon(lib.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lib.name}</h3>
                        <Badge variant="secondary" className="text-[10px] capitalize">{lib.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lib.itemCount.toLocaleString()} items
                      </p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => onSync(lib.id)}>
                    {syncingId === lib.id ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                  </Button>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Enabled</Label>
                    <Switch checked={enabledMap[lib.id]} onCheckedChange={() => toggleEnabled(lib.id)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Auto-sync</Label>
                    <Switch checked={autoSyncMap[lib.id]} onCheckedChange={() => toggleAutoSync(lib.id)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block font-medium text-foreground">Synced</span>
                    {synced.toLocaleString()} / {lib.itemCount.toLocaleString()}
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Sync %</span>
                    {lib.itemCount > 0 ? Math.round((synced / lib.itemCount) * 100) : 0}%
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Last Synced</span>
                    {timeAgo(log?.completedAt ?? log?.startedAt)}
                  </div>
                </div>
                {log?.status === 'failed' && log.errorMessage && (
                  <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{log.errorMessage}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Imports Tab                                                               */
/* -------------------------------------------------------------------------- */

function ImportsTab({ syncLogs, onSync }: { syncLogs: PlexSyncLog[]; onSync: (libraryId: string) => void }) {
  if (syncLogs.length === 0) {
    return (
      <NoData
        icon={Download}
        description="No import history available. Each library sync records created, updated and removed items."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sync History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Library</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Synced</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium font-mono text-xs">{log.libraryId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 capitalize">
                      {mediaTypeIcon(log.sourceType)}
                      <span className="text-xs">{log.sourceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.itemsCreated.toLocaleString()} new / {log.itemsUpdated.toLocaleString()} updated
                    {log.itemsRemoved > 0 && ` / ${log.itemsRemoved.toLocaleString()} removed`}
                  </TableCell>
                  <TableCell>
                    {(log.itemsCreated + log.itemsUpdated).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={syncStatusTone(log.status)}>
                      {log.status === 'running' && <Loader2 className="size-3 animate-spin" />}
                      {log.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(log.startedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onSync(log.libraryId)} disabled={log.status === 'running'}>
                      <RefreshCw className="mr-1 size-3" />
                      Re-sync
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Auto-sync New</p>
                <p className="text-xs text-muted-foreground">Automatically sync newly added media</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Refresh Metadata</p>
                <p className="text-xs text-muted-foreground">Refresh Plex metadata on sync</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Include Music</p>
                <p className="text-xs text-muted-foreground">Sync music libraries</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Jobs Tab                                                                  */
/* -------------------------------------------------------------------------- */

function JobsTab({ syncLogs }: { syncLogs: PlexSyncLog[] }) {
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const filtered = typeFilter === 'all' ? syncLogs : syncLogs.filter((l) => l.status === typeFilter)

  if (syncLogs.length === 0) {
    return (
      <NoData
        icon={Clock}
        description="No jobs yet. Sync operations appear here once you trigger a sync."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'running', 'completed', 'failed'].map((t) => (
          <Button key={t} size="sm" variant={typeFilter === t ? 'default' : 'outline'} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((log) => (
          <Card key={log.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Library Sync</span>
                      <StatusBadge tone={syncStatusTone(log.status)}>
                        {log.status === 'running' && <Loader2 className="size-3 animate-spin" />}
                        {jobStatusLabel(log.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Library {log.libraryId} &middot; Triggered manually &middot; {timeAgo(log.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {log.completedAt && (
                    <p className="text-xs text-muted-foreground">{formatDuration(log.startedAt, log.completedAt)}</p>
                  )}
                  {log.status === 'failed' && <p className="text-xs text-destructive">1 error</p>}
                </div>
              </div>
              {log.status === 'running' && (
                <div className="flex items-center gap-3">
                  <Progress value={100} className="h-1.5 flex-1 animate-pulse" />
                  <span className="text-xs text-muted-foreground">in progress</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{(log.itemsCreated + log.itemsUpdated).toLocaleString()} items processed</span>
              </div>
              {log.status === 'failed' && log.errorMessage && (
                <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{log.errorMessage}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Mappings Tab                                                              */
/* -------------------------------------------------------------------------- */

function MappingsTab({
  mappings,
  loading,
  error,
}: {
  mappings: MediaMapping[]
  loading: boolean
  error: string | null
}) {
  const [search, setSearch] = React.useState('')
  const filtered = search
    ? mappings.filter((m) => m.kamiTitle.toLowerCase().includes(search.toLowerCase()) || m.plexTitle.toLowerCase().includes(search.toLowerCase()) || m.kamiId.toLowerCase().includes(search.toLowerCase()))
    : mappings

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Discovering items from Plex libraries…
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <NoData
        icon={Link2}
        description={`Mappings could not be loaded: ${error}`}
      />
    )
  }

  if (mappings.length === 0) {
    return (
      <NoData
        icon={Link2}
        description="No mappings available yet. Mappings link Plex titles to Kami-Sama records and appear here once library items are discovered."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search mappings..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Button size="sm" variant="outline" onClick={() => toast.info('Scan for new mappings...')}>
          <Scan className="mr-1.5 size-3.5" />
          Scan for New
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kami-Sama</TableHead>
                <TableHead>Plex</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>External IDs</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Last Synced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{m.kamiTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.kamiId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{m.plexTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">RK: {m.plexRatingKey}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(m.type)}
                      <Badge variant="secondary" className="text-[10px] capitalize">{m.type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.externalIds.tmdb && <Badge variant="outline" className="text-[10px]">TMDB: {m.externalIds.tmdb}</Badge>}
                      {m.externalIds.imdb && <Badge variant="outline" className="text-[10px]">IMDB: {m.externalIds.imdb}</Badge>}
                      {m.externalIds.tvdb && <Badge variant="outline" className="text-[10px]">TVDB: {m.externalIds.tvdb}</Badge>}
                      {m.externalIds.anilist && <Badge variant="outline" className="text-[10px]">AL: {m.externalIds.anilist}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{matchScoreBadge(m.matchScore)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{timeAgo(m.lastSyncedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Capabilities Tab                                                          */
/* -------------------------------------------------------------------------- */

function CapabilitiesTab({ capabilities }: { capabilities: ProviderCapability[] }) {
  if (capabilities.length === 0) {
    return (
      <NoData
        icon={Zap}
        description="No capabilities reported. Capabilities are detected at runtime by the Plex server."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {capabilities.filter((c) => c.supported).length} supported &middot; {capabilities.filter((c) => c.enabled).length} enabled
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap) => (
          <Card key={cap.id} className={cn(!cap.supported && 'opacity-50')}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {cap.supported ? (
                    cap.enabled ? <CheckCircle2 className="size-4 text-success" /> : <Eye className="size-4 text-muted-foreground" />
                  ) : (
                    <Ban className="size-4 text-muted-foreground" />
                  )}
                  <h3 className="text-sm font-medium">{cap.name}</h3>
                </div>
                {cap.version && <Badge variant="secondary" className="text-[10px]">v{cap.version}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant={cap.supported ? 'outline' : 'secondary'} className="text-[10px]">
                  {cap.supported ? 'Supported' : 'Not Supported'}
                </Badge>
                {cap.supported && (
                  <Badge variant={cap.enabled ? 'default' : 'secondary'} className="text-[10px]">
                    {cap.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Logs Tab                                                                  */
/* -------------------------------------------------------------------------- */

function LogsTab({ logs }: { logs: ProviderLog[] }) {
  const [levelFilter, setLevelFilter] = React.useState<string>('all')
  const filtered = levelFilter === 'all' ? logs : logs.filter((l) => l.level === levelFilter)

  if (logs.length === 0) {
    return (
      <NoData
        icon={FileText}
        description="No logs available. Sync and integration logs will appear here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'info', 'warn', 'error', 'debug'].map((l) => (
          <Button key={l} size="sm" variant={levelFilter === l ? 'default' : 'outline'} onClick={() => setLevelFilter(l)}>
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </Button>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50">
                <div className={cn('mt-0.5', log.level === 'error' ? 'text-destructive' : log.level === 'warn' ? 'text-warning' : 'text-muted-foreground')}>
                  {logLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{log.message}</p>
                    <Badge variant="outline" className={cn('text-[10px] shrink-0', log.level === 'error' && 'border-destructive/50 text-destructive', log.level === 'warn' && 'border-warning/50 text-warning')}>
                      {log.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{log.source}</span>
                    <span className="text-xs text-muted-foreground">&middot;</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(log.timestamp)}</span>
                  </div>
                  {log.details && <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Settings Tab                                                              */
/* -------------------------------------------------------------------------- */

interface PlexConnectInfo {
  serverName: string
  url: string
}

function SettingsTab({
  config,
  onConnected,
}: {
  config: SourceConfig | null
  onConnected: (info?: PlexConnectInfo | null) => void
}) {
  const [signingIn, setSigningIn] = React.useState(false)
  const [pinId, setPinId] = React.useState<string | null>(null)
  const [servers, setServers] = React.useState<PlexServerResource[]>([])
  const [connecting, setConnecting] = React.useState<string | null>(null)
  const [discoverError, setDiscoverError] = React.useState<string | null>(null)
  const [disconnecting, setDisconnecting] = React.useState(false)
  const [enabled, setEnabled] = React.useState(config?.enabled ?? true)
  const [updatingEnabled, setUpdatingEnabled] = React.useState(false)
  const pollRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const connectedUrl = asString(config?.config.url)
  const connectedMachine = asString(config?.config.machineIdentifier)

  React.useEffect(() => {
    setEnabled(config?.enabled ?? true)
  }, [config?.enabled])

  React.useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [])

  function stopPolling() {
    if (pollRef.current) {
      clearTimeout(pollRef.current)
      pollRef.current = null
    }
  }

  async function pollAuth(id: string) {
    stopPolling()
    const deadline = Date.now() + 10 * 60 * 1000
    const tick = async () => {
      try {
        const res = await plexApi.authStatus(id)
        if (res.authenticated) {
          stopPolling()
          setServers(res.servers ?? [])
          setDiscoverError(
            res.servers?.length ? null : 'Signed in, but no Plex Media Server was found on this account.',
          )
          setSigningIn(false)
          toast.success('Signed in to Plex')
          return
        }
        if (Date.now() > deadline) {
          stopPolling()
          setSigningIn(false)
          setDiscoverError('Sign-in timed out. Please try again.')
          return
        }
        pollRef.current = setTimeout(() => void tick(), 3000)
      } catch (err) {
        stopPolling()
        setSigningIn(false)
        setDiscoverError(formatError(err))
      }
    }
    pollRef.current = setTimeout(() => void tick(), 3000)
  }

  async function handleSignIn() {
    setSigningIn(true)
    setDiscoverError(null)
    setServers([])
    try {
      const pin = await plexApi.authStart()
      setPinId(pin.pinId)
      window.open(pin.authUrl, '_blank', 'noopener,noreferrer')
      await pollAuth(pin.pinId)
    } catch (err) {
      setSigningIn(false)
      setDiscoverError(formatError(err))
    }
  }

  async function handleUseServer(server: PlexServerResource) {
    if (!pinId) return
    setConnecting(server.clientIdentifier)
    setDiscoverError(null)
    try {
      const res = await plexApi.authConnect(pinId, server.clientIdentifier)
      stopPolling()
      setPinId(null)
      setServers([])
      setSigningIn(false)
      toast.success(`Connected to ${server.name}`)
      onConnected({ serverName: res.serverName || server.name, url: res.url })
    } catch (err) {
      setDiscoverError(formatError(err))
    } finally {
      setConnecting(null)
    }
  }

  async function toggleEnabled(value: boolean) {
    setEnabled(value)
    if (!config) return
    setUpdatingEnabled(true)
    try {
      await sourceConfigApi.update(config.id, { enabled: value })
      toast.success(value ? 'Plex source enabled' : 'Plex source disabled')
    } catch (err) {
      setEnabled(config.enabled)
      toast.error(`Failed to update: ${formatError(err)}`)
    } finally {
      setUpdatingEnabled(false)
    }
  }

  async function handleDisconnect() {
    if (!config) return
    setDisconnecting(true)
    try {
      await sourceConfigApi.remove(config.id)
      toast.success('Plex connection removed')
      onConnected(null)
    } catch (err) {
      setDiscoverError(`Failed to disconnect: ${formatError(err)}`)
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Connection</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {connectedUrl ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Connected to Plex</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{connectedUrl}</p>
                  {connectedMachine && (
                    <p className="truncate font-mono text-xs text-muted-foreground">{connectedMachine}</p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">Connected</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="self-start"
              >
                <Trash2 className="mr-1.5 size-3.5" />
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Not connected yet. Sign in with your Plex account to automatically discover and link your media server.
            </p>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Sign in with Plex</p>
              <p className="text-xs text-muted-foreground">
                Authorize with your Plex account, then pick your media server to connect.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleSignIn} disabled={signingIn}>
              {signingIn ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Link2 className="mr-1.5 size-3.5" />}
              {signingIn ? 'Waiting for authorization…' : config ? 'Reconnect' : 'Sign in with Plex'}
            </Button>
          </div>
          {signingIn && <span className="text-xs text-muted-foreground">Authorize the code in the new tab…</span>}
          {discoverError && <p className="text-sm text-destructive">{discoverError}</p>}
          {servers.length > 0 && (
            <div className="flex flex-col gap-2">
              {servers.map((server) => (
                <div key={server.clientIdentifier} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{server.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{server.clientIdentifier}</p>
                    <p className="text-xs text-muted-foreground">
                      {server.connections.length} connection{server.connections.length === 1 ? '' : 's'} &middot; {server.version}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUseServer(server)}
                    disabled={connecting === server.clientIdentifier}
                  >
                    {connecting === server.clientIdentifier ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <Link2 className="mr-1.5 size-3.5" />
                    )}
                    {connecting === server.clientIdentifier ? 'Connecting…' : 'Use'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Sync Options</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">Activate the Plex source configuration</p>
            </div>
            <Switch
              checked={enabled}
              disabled={!config || updatingEnabled}
              onCheckedChange={(v) => void toggleEnabled(v)}
            />
          </div>
          {!config && <p className="text-xs text-muted-foreground">Connect your Plex account to enable syncing.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

const TABS = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'libraries', label: 'Libraries', icon: Database },
  { value: 'imports', label: 'Imports', icon: Download },
  { value: 'jobs', label: 'Jobs', icon: Clock },
  { value: 'mappings', label: 'Mappings', icon: Link2 },
  { value: 'capabilities', label: 'Capabilities', icon: Zap },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function PlexProviderPage() {
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [connectionState, setConnectionState] = React.useState<
    'none' | 'ok' | 'auth' | 'unreachable'
  >('none')
  const [secondaryError, setSecondaryError] = React.useState<string | null>(null)
  const [librariesError, setLibrariesError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('overview')
  const [identity, setIdentity] = React.useState<PlexIdentity | null>(null)
  const [health, setHealth] = React.useState<PlexHealth | null>(null)
  const [libraries, setLibraries] = React.useState<PlexLibrary[]>([])
  const [syncLogs, setSyncLogs] = React.useState<PlexSyncLog[]>([])
  const [sourceConfig, setSourceConfig] = React.useState<SourceConfig | null>(null)

  const [mappings, setMappings] = React.useState<MediaMapping[]>([])
  const [mappingsLoading, setMappingsLoading] = React.useState(false)
  const [mappingsLoaded, setMappingsLoaded] = React.useState(false)
  const [mappingsError, setMappingsError] = React.useState<string | null>(null)
  const [capabilities, setCapabilities] = React.useState<ProviderCapability[]>([])
  const [logs, setLogs] = React.useState<ProviderLog[]>([])
  const [remoteResource, setRemoteResource] = React.useState<PlexServerResource | null>(null)
  const [remoteError, setRemoteError] = React.useState<string | null>(null)
  const [syncingId, setSyncingId] = React.useState<string | null>(null)
  const [testing, setTesting] = React.useState(false)

  const refreshLogs = React.useCallback(async () => {
    try {
      const res = await plexApi.syncLogs({ limit: 50 })
      setSyncLogs(res.items)
    } catch (err) {
      setSecondaryError(`Sync history unavailable: ${formatError(err)}`)
    }
  }, [])

  const load = React.useCallback(async () => {
    setStatus('loading')
    setSecondaryError(null)
    setLibrariesError(null)
    setMappings([])
    setMappingsLoaded(false)
    setMappingsError(null)
    setCapabilities([])
    // Resolve the persisted source config first so the page can show a clean
    // "connect your source" state instead of a PLEX_DISABLED error when no
    // Plex source is configured yet.
    try {
      const configs = await sourceConfigApi.list()
      const config = configs.items.find((c) => c.sourceType === 'plex') ?? null
      setSourceConfig(config)
      if (!config?.config.url) {
        setHealth(null)
        setIdentity(null)
        setLibraries([])
        setSyncLogs([])
        setRemoteResource(null)
        setRemoteError(null)
        setConnectionState('none')
        setStatus('ready')
        return
      }
    } catch (err) {
      setConnectionState('unreachable')
      setSecondaryError(`Source config unavailable: ${formatError(err)}`)
    }

    setCapabilities(PLEX_CAPABILITIES)

    // Probe connectivity first. health only hits /identity on the server, so
    // the data requests below are only fired once the server is actually
    // reachable — a failing /libraries must never hide the requests that work.
    try {
      const h = await plexApi.health()
      setHealth(h)
    } catch (err) {
      setHealth(null)
      setIdentity(null)
      setLibraries([])
      setConnectionState(isAuthError(err) ? 'auth' : 'unreachable')
      setSecondaryError(`Could not reach Plex: ${formatError(err)}`)
      setStatus('ready')
      return
    }
    try {
      const ident = await plexApi.identity()
      setIdentity(ident)
    } catch (err) {
      setIdentity(null)
      setConnectionState(isAuthError(err) ? 'auth' : 'unreachable')
      setSecondaryError(`Could not load Plex identity: ${formatError(err)}`)
      setStatus('ready')
      return
    }
    // Libraries is the request that actually validates the token server-side.
    // When the server rejects it, keep the working identity/health data and
    // prompt a reconnect instead of blanking the whole page.
    try {
      const libs = await plexApi.libraries()
      setLibraries(libs.items)
      setLibrariesError(null)
      setConnectionState('ok')
    } catch (err) {
      setLibraries([])
      setLibrariesError(formatError(err))
      setConnectionState(isAuthError(err) ? 'auth' : 'ok')
    }
    try {
      const logsRes = await plexApi.syncLogs({ limit: 50 })
      setSyncLogs(logsRes.items)
    } catch (err) {
      setSecondaryError(`Sync history unavailable: ${formatError(err)}`)
    }
    try {
      const remote = await plexApi.remote()
      setRemoteResource(remote)
      setRemoteError(null)
    } catch (err) {
      setRemoteResource(null)
      setRemoteError(`Remote connections unavailable: ${formatError(err)}`)
    }
    setStatus('ready')
  }, [])

  const refreshRemote = React.useCallback(async () => {
    try {
      const remote = await plexApi.remote()
      setRemoteResource(remote)
      setRemoteError(null)
    } catch (err) {
      setRemoteError(`Remote connections unavailable: ${formatError(err)}`)
    }
  }, [])

  const loadMappings = React.useCallback(async () => {
    if (libraries.length === 0) return
    setMappingsLoading(true)
    setMappingsError(null)
    try {
      const batches = await Promise.all(
        libraries.map((lib) =>
          plexApi
            .items(lib.id, { limit: 12 })
            .then((res) => res.items)
            .catch(() => [] as PlexLibraryItem[]),
        ),
      )
      const all = batches
        .flat()
        .map(plexItemToMapping)
        .filter((m): m is MediaMapping => m !== null)
      setMappings(all)
      setMappingsLoaded(true)
    } catch (err) {
      setMappingsError(formatError(err))
    } finally {
      setMappingsLoading(false)
    }
  }, [libraries])

  const handleTabChange = React.useCallback(
    (value: string) => {
      setActiveTab(value)
      if (value === 'mappings' && !mappingsLoaded && !mappingsLoading) {
        void loadMappings()
      }
    },
    [loadMappings, mappingsLoaded, mappingsLoading],
  )

  React.useEffect(() => {
    setLogs(
      deriveProviderLogs({
        identity,
        health,
        libraries,
        syncLogs,
        librariesError,
        remoteError,
      }),
    )
  }, [identity, health, libraries, syncLogs, librariesError, remoteError])

  React.useEffect(() => {
    void load()
  }, [load])

  const handleTest = React.useCallback(async () => {
    setTesting(true)
    try {
      const h = await plexApi.health()
      toast.success(`Connection OK — ${h.latencyMs}ms latency`)
      load()
    } catch (err) {
      toast.error(`Connection failed: ${formatError(err)}`)
    } finally {
      setTesting(false)
    }
  }, [load])

  const handleSync = React.useCallback(
    async (libraryId: string) => {
      const lib = libraries.find((l) => l.id === libraryId)
      setSyncingId(libraryId)
      try {
        await plexApi.sync(libraryId)
        toast.success(`Sync complete for ${lib?.name ?? libraryId}`)
      } catch (err) {
        toast.error(`Sync failed: ${formatError(err)}`)
      } finally {
        setSyncingId(null)
        await refreshLogs()
      }
    },
    [libraries, refreshLogs],
  )

  const handleSyncAll = React.useCallback(async () => {
    if (libraries.length === 0) return
    setSyncingId('all')
    const toastId = toast.loading(`Syncing ${libraries.length} libraries…`)
    try {
      for (const lib of libraries) {
        await plexApi.sync(lib.id)
      }
      toast.success(`Synced ${libraries.length} libraries`, { id: toastId })
    } catch (err) {
      toast.error(`Sync failed: ${formatError(err)}`, { id: toastId })
    } finally {
      setSyncingId(null)
      await refreshLogs()
    }
  }, [libraries, refreshLogs])

  if (status === 'loading') {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    )
  }

  const notConnected = connectionState === 'none'
  const connectionBroken = connectionState === 'auth' || connectionState === 'unreachable'

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Plex Media Server"
        description="Configure and monitor your Plex integration. Sync libraries, manage mappings, and track import jobs."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testing || syncingId !== null || notConnected || connectionBroken}
        >
          <Link2 className="mr-1.5 size-3.5" />
          Test Connection
        </Button>
        <Button
          size="sm"
          onClick={handleSyncAll}
          disabled={syncingId !== null || libraries.length === 0 || notConnected || connectionBroken}
        >
          <RefreshCw className={cn('mr-1.5 size-3.5', syncingId === 'all' && 'animate-spin')} />
          Sync Now
        </Button>
      </PageHeader>

      {status === 'error' && connectionState === 'unreachable' && (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>{secondaryError ?? 'No Plex data is available.'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      )}

      {connectionState === 'none' && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">No Plex source configured</p>
              <p className="text-muted-foreground">
                Sign in with your Plex account to discover your media server and sync libraries.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setActiveTab('settings')}>
            <Link2 className="mr-1.5 size-3.5" />
            Connect
          </Button>
        </div>
      )}

      {connectionState === 'auth' && (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="font-semibold text-foreground">Plex rejected the connection token</p>
              <p className="text-muted-foreground">
                {secondaryError ?? librariesError ?? 'The stored Plex token is no longer accepted by the server. Reconnect to refresh it.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void load()}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Retry
            </Button>
            <Button size="sm" onClick={() => setActiveTab('settings')}>
              <Link2 className="mr-1.5 size-3.5" />
              Reconnect
            </Button>
          </div>
        </div>
      )}

      {connectionState === 'unreachable' && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Plex server unreachable</p>
              <p className="text-muted-foreground">{secondaryError ?? 'Could not reach the configured Plex server.'}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          {identity && health ? (
            <OverviewTab
              identity={identity}
              health={health}
              libraries={libraries}
              syncLogs={syncLogs}
              remote={remoteResource}
              remoteError={remoteError}
              librariesError={librariesError}
              onRefreshRemote={refreshRemote}
            />
          ) : (
            <NoData
              icon={Globe}
              description="No server connection yet. Add your Plex URL and token in the Settings tab, then click Test Connection."
            />
          )}
        </TabsContent>
        <TabsContent value="libraries">
          <LibrariesTab
            libraries={libraries}
            syncLogs={syncLogs}
            onSync={handleSync}
            onSyncAll={handleSyncAll}
            syncingId={syncingId}
            librariesError={librariesError}
          />
        </TabsContent>
        <TabsContent value="imports">
          <ImportsTab syncLogs={syncLogs} onSync={handleSync} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab syncLogs={syncLogs} />
        </TabsContent>
        <TabsContent value="mappings">
          <MappingsTab mappings={mappings} loading={mappingsLoading} error={mappingsError} />
        </TabsContent>
        <TabsContent value="capabilities">
          <CapabilitiesTab capabilities={capabilities} />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab logs={logs} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab
            config={sourceConfig}
            onConnected={() => {
              void load()
            }}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
