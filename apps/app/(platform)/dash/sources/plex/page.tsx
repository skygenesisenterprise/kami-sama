'use client'

import * as React from 'react'
import {
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
  Info,
  Layers,
  Link2,
  Loader2,
  Music,
  RefreshCw,
  Save,
  Scan,
  Server,
  Settings,
  Tv,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  type PlexHealth,
  type PlexIdentity,
  type PlexLibrary,
  type PlexSyncLog,
  type SourceConfig,
} from '@/lib/api/plex'
import {
  plexProviderData,
  type LogLevel,
  type MediaMapping,
  type ProviderCapability,
  type ProviderLog,
} from '@/lib/plex-provider-data'

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

function asString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
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

function libraryTypeIcon(type: string) {
  if (type === 'movie') return <Film className="size-4" />
  if (type === 'show') return <Tv className="size-4" />
  if (type === 'music') return <Music className="size-4" />
  return <Layers className="size-4" />
}

function syncStatusTone(status: string): StatusTone {
  if (status === 'completed') return 'success'
  if (status === 'running') return 'info'
  if (status === 'failed') return 'destructive'
  return 'neutral'
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

function logLevelTone(l: LogLevel): StatusTone {
  return l === 'info' ? 'info' : l === 'warn' ? 'warning' : l === 'error' ? 'destructive' : 'neutral'
}

function logLevelIcon(l: LogLevel) {
  if (l === 'info') return <Info className="size-3.5" />
  if (l === 'warn') return <AlertTriangle className="size-3.5" />
  if (l === 'error') return <XCircle className="size-3.5" />
  return <FileText className="size-3.5" />
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Demo / mock fallback (used when the API reports PLEX_DISABLED)            */
/* -------------------------------------------------------------------------- */

interface MockBundle {
  identity: PlexIdentity
  health: PlexHealth
  libraries: PlexLibrary[]
  syncLogs: PlexSyncLog[]
  config: SourceConfig
  mappings: MediaMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
}

function buildMockBundle(): MockBundle {
  return {
    identity: {
      friendlyName: plexProviderData.provider.name,
      version: plexProviderData.provider.version,
      machineIdentifier: plexProviderData.provider.id,
      platform: 'linux',
      product: 'Plex Media Server',
    },
    health: {
      reachable: true,
      latencyMs: 42,
      identityKeys: ['friendlyName', 'machineIdentifier', 'platform', 'product', 'version'],
    },
    libraries: plexProviderData.libraries.map((l) => ({
      id: l.id,
      sourceId: l.id,
      name: l.name,
      type: l.type,
      itemCount: l.mediaCount,
    })),
    syncLogs: plexProviderData.jobs.map((j) => ({
      id: j.id,
      libraryId: j.libraryId ?? j.libraryName,
      sourceType: 'plex',
      status: j.status,
      itemsCreated: j.itemsProcessed,
      itemsUpdated: 0,
      itemsRemoved: 0,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      errorMessage: j.errors > 0 ? `${j.errors} error${j.errors > 1 ? 's' : ''}` : undefined,
      createdAt: j.startedAt,
      updatedAt: j.completedAt ?? j.startedAt,
    })),
    config: {
      id: 'plex-config-demo',
      sourceType: 'plex',
      enabled: true,
      config: {
        url: plexProviderData.settings.url,
        token: plexProviderData.settings.token,
        timeoutSeconds: plexProviderData.settings.timeout,
      },
      lastSyncAt: plexProviderData.provider.lastSyncAt,
      createdAt: '2026-07-25T10:00:00Z',
      updatedAt: plexProviderData.provider.lastSyncAt ?? '2026-07-26T10:30:00Z',
    },
    mappings: plexProviderData.mappings,
    capabilities: plexProviderData.capabilities,
    logs: plexProviderData.logs,
  }
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({
  identity,
  health,
  libraries,
  syncLogs,
  onTestConnection,
  onSyncAll,
  syncing,
}: {
  identity: PlexIdentity
  health: PlexHealth
  libraries: PlexLibrary[]
  syncLogs: PlexSyncLog[]
  onTestConnection: () => void
  onSyncAll: () => void
  syncing: boolean
}) {
  const providerName = asString(identity.friendlyName) || 'Plex Media Server'
  const version = asString(identity.version)
  const mediaCount = libraries.reduce((sum, l) => sum + l.itemCount, 0)
  const byType = (t: string) => libraries.filter((l) => l.type === t).reduce((sum, l) => sum + l.itemCount, 0)
  const lastLog = [...syncLogs].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0]
  const lastSyncAt = lastLog?.completedAt ?? lastLog?.startedAt ?? null
  const syncErrors = syncLogs.filter((l) => l.status === 'failed').length

  const statCards = [
    { label: 'Libraries', value: libraries.length, sub: 'configured sections', icon: Database },
    { label: 'Total Media', value: mediaCount.toLocaleString(), sub: 'items indexed', icon: Layers },
    { label: 'Movies', value: byType('movie').toLocaleString(), sub: 'in libraries', icon: Film },
    { label: 'TV Shows', value: byType('show').toLocaleString(), sub: 'in libraries', icon: Tv },
    { label: 'Music', value: byType('music').toLocaleString(), sub: 'in libraries', icon: Music },
    { label: 'Last Sync', value: timeAgo(lastSyncAt), sub: `${syncErrors} error${syncErrors === 1 ? '' : 's'}`, icon: RefreshCw },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Provider info card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{providerName}</CardTitle>
              <StatusBadge tone="success" pulse={syncing}>
                {syncing ? 'syncing' : 'connected'}
              </StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">
              {version && <>v{version} &middot; </>}
              {libraries.length} libraries &middot; {mediaCount.toLocaleString()} media
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onTestConnection} disabled={syncing}>
              <Link2 className="mr-1.5 size-3.5" />
              Test Connection
            </Button>
            <Button size="sm" onClick={onSyncAll} disabled={syncing || libraries.length === 0}>
              <RefreshCw className={cn('mr-1.5 size-3.5', syncing && 'animate-spin')} />
              Sync Now
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats grid */}
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

      {/* Server details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Details</CardTitle>
          <Server className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <p className="text-xs text-muted-foreground">Machine Identifier</p>
              <p className="mt-0.5 truncate font-mono text-xs">{asString(identity.machineIdentifier) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="mt-0.5 truncate text-sm">{asString(identity.platform) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Product</p>
              <p className="mt-0.5 truncate text-sm">{asString(identity.product) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="mt-0.5 truncate text-sm">{version || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Latency</p>
              <p className="mt-0.5 text-sm">{health.latencyMs} ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Libraries Tab                                                             */
/* -------------------------------------------------------------------------- */

function LibrariesTab({
  libraries,
  syncLogs,
  onSync,
  onSyncAll,
  onRefresh,
  syncingId,
}: {
  libraries: PlexLibrary[]
  syncLogs: PlexSyncLog[]
  onSync: (libraryId: string) => void
  onSyncAll: () => void
  onRefresh: (libraryId: string) => void
  syncingId: string | null
}) {
  const totalItems = libraries.reduce((sum, l) => sum + l.itemCount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {libraries.length} libraries configured &middot; {totalItems.toLocaleString()} items
        </p>
        <Button size="sm" variant="outline" onClick={onSyncAll} disabled={syncingId !== null || libraries.length === 0}>
          <RefreshCw className={cn('mr-1.5 size-3.5', syncingId === 'all' && 'animate-spin')} />
          Sync All
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {libraries.map((lib) => {
          const log = lastLogFor(syncLogs, lib.id)
          const isSyncing = syncingId === lib.id
          return (
            <Card key={lib.id}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      {libraryTypeIcon(lib.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lib.name}</h3>
                        {log?.status === 'completed' && <CheckCircle2 className="size-3.5 text-success" />}
                        {log?.status === 'failed' && <XCircle className="size-3.5 text-destructive" />}
                        {log?.status === 'running' && <Loader2 className="size-3.5 animate-spin text-info" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lib.itemCount.toLocaleString()} items &middot; {lib.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => onRefresh(lib.id)}
                      disabled={isSyncing}
                      title="Refresh metadata on Plex"
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSync(lib.id)}
                      disabled={syncingId !== null}
                    >
                      <Loader2 className={cn('mr-1.5 size-3.5', isSyncing ? 'animate-spin' : 'hidden')} />
                      {isSyncing ? 'Syncing…' : 'Sync Now'}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block font-medium text-foreground">Status</span>
                    <StatusBadge tone={syncStatusTone(log?.status ?? 'idle')}>
                      {log?.status ?? 'never synced'}
                    </StatusBadge>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Last Sync</span>
                    {timeAgo(log?.completedAt ?? log?.startedAt)}
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Source ID</span>
                    <span className="font-mono">{lib.sourceId}</span>
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
      <EmptyState
        icon={Download}
        title="No imports yet"
        description="Run a sync on a library to see import history here. Each sync records how many items were created, updated or removed."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Import History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Library</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syncLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium font-mono text-xs">{log.libraryId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 capitalize">
                    {libraryTypeIcon(log.sourceType)}
                    {log.sourceType}
                  </div>
                </TableCell>
                <TableCell>
                  {log.itemsCreated.toLocaleString()} new / {log.itemsUpdated.toLocaleString()} updated
                  {log.itemsRemoved > 0 && ` / ${log.itemsRemoved.toLocaleString()} removed`}
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
                    Re-import
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Jobs Tab                                                                  */
/* -------------------------------------------------------------------------- */

type DerivedJob = {
  id: string
  libraryId: string
  status: string
  startedAt: string
  completedAt: string | null
  itemsProcessed: number
  errorMessage?: string
}

function JobsTab({ syncLogs }: { syncLogs: PlexSyncLog[] }) {
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const jobs: DerivedJob[] = syncLogs
    .map((log) => ({
      id: log.id,
      libraryId: log.libraryId,
      status: log.status,
      startedAt: log.startedAt,
      completedAt: log.completedAt ?? null,
      itemsProcessed: log.itemsCreated + log.itemsUpdated,
      errorMessage: log.errorMessage,
    }))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  const filtered = statusFilter === 'all' ? jobs : jobs.filter((j) => j.status === statusFilter)

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No jobs yet"
        description="Sync operations appear here once you trigger a sync. Running jobs show live progress."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'running', 'completed', 'failed'].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={statusFilter === t ? 'default' : 'outline'}
            onClick={() => setStatusFilter(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Library Sync</span>
                      <StatusBadge tone={syncStatusTone(job.status)}>
                        {job.status === 'running' && <Loader2 className="size-3 animate-spin" />}
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Library {job.libraryId} &middot; Triggered manually &middot; {timeAgo(job.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {job.completedAt && (
                    <p className="text-xs text-muted-foreground">{formatDuration(job.startedAt, job.completedAt)}</p>
                  )}
                  {job.status === 'failed' && <p className="text-xs text-destructive">1 error</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{job.itemsProcessed.toLocaleString()} items processed</span>
              </div>

              {job.status === 'failed' && job.errorMessage && (
                <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{job.errorMessage}</p>
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

function MappingsTab({ mappings }: { mappings: MediaMapping[] }) {
  const [search, setSearch] = React.useState('')

  const filtered = search
    ? mappings.filter(
        (m) =>
          m.kamiTitle.toLowerCase().includes(search.toLowerCase()) ||
          m.plexTitle.toLowerCase().includes(search.toLowerCase()) ||
          m.kamiId.toLowerCase().includes(search.toLowerCase()),
      )
    : mappings

  if (mappings.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No mappings available"
        description="Mappings link Plex titles to Kami-Sama records. They are created automatically when a library is synced. The API does not currently expose a dedicated mappings endpoint."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search mappings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
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
                    <Badge variant="secondary" className="capitalize">{m.type}</Badge>
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
      <EmptyState
        icon={Zap}
        title="No capabilities reported"
        description="Capabilities are reported by the Plex server at runtime. The API does not currently expose a capabilities endpoint for this integration."
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
                    cap.enabled ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <Eye className="size-4 text-muted-foreground" />
                    )
                  ) : (
                    <Ban className="size-4 text-muted-foreground" />
                  )}
                  <h3 className="text-sm font-medium">{cap.name}</h3>
                </div>
                {cap.version && (
                  <Badge variant="secondary" className="text-[10px]">v{cap.version}</Badge>
                )}
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
      <EmptyState
        icon={FileText}
        title="No logs available"
        description="Sync and integration logs will appear here once the API exposes a logs endpoint. Existing events are visible on the Imports and Jobs tabs."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'info', 'warn', 'error', 'debug'].map((l) => (
          <Button
            key={l}
            size="sm"
            variant={levelFilter === l ? 'default' : 'outline'}
            onClick={() => setLevelFilter(l)}
          >
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
                  {log.details && (
                    <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">{log.details}</p>
                  )}
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

function SettingsTab({
  config,
  onSave,
  onTestConnection,
  saving,
  testing,
}: {
  config: SourceConfig | null
  onSave: (input: { url: string; token: string; timeoutSeconds: number; enabled: boolean }) => void
  onTestConnection: () => void
  saving: boolean
  testing: boolean
}) {
  const [url, setUrl] = React.useState(() => asString(config?.config.url))
  const [token, setToken] = React.useState(() => asString(config?.config.token))
  const [timeoutSeconds, setTimeoutSeconds] = React.useState(() => Number(config?.config.timeoutSeconds ?? 30))
  const [enabled, setEnabled] = React.useState(config?.enabled ?? true)

  return (
    <div className="flex flex-col gap-6">
      {!config && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            No Plex configuration has been saved yet. Fill in the connection details below and save to create a
            persistent <code className="font-mono text-xs">plex</code> source configuration.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Connection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Server URL</FieldLabel>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://192.168.1.50:32400" />
            </Field>
            <Field>
              <FieldLabel>Token</FieldLabel>
              <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Timeout (seconds)</FieldLabel>
              <Input
                type="number"
                min={1}
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10) || 30)}
              />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Enabled</p>
                <p className="text-xs text-muted-foreground">Activate the Plex source configuration</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onTestConnection} disabled={testing}>
          <Link2 className={cn('mr-1.5 size-3.5', testing && 'animate-pulse')} />
          Test Connection
        </Button>
        <Button onClick={() => onSave({ url, token, timeoutSeconds, enabled })} disabled={saving || !url.trim()}>
          <Save className="mr-1.5 size-3.5" />
          {saving ? 'Saving…' : config ? 'Save Settings' : 'Create Configuration'}
        </Button>
      </div>
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
  const [loading, setLoading] = React.useState(true)
  const [usingMock, setUsingMock] = React.useState(false)
  const [secondaryError, setSecondaryError] = React.useState<string | null>(null)
  const [identity, setIdentity] = React.useState<PlexIdentity | null>(null)
  const [health, setHealth] = React.useState<PlexHealth | null>(null)
  const [libraries, setLibraries] = React.useState<PlexLibrary[]>([])
  const [syncLogs, setSyncLogs] = React.useState<PlexSyncLog[]>([])
  const [sourceConfig, setSourceConfig] = React.useState<SourceConfig | null>(null)
  const [mappings, setMappings] = React.useState<MediaMapping[]>([])
  const [capabilities, setCapabilities] = React.useState<ProviderCapability[]>([])
  const [logs, setLogs] = React.useState<ProviderLog[]>([])
  const [syncingId, setSyncingId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState(false)

  const refreshLogs = React.useCallback(async () => {
    if (usingMock) return
    try {
      const res = await plexApi.syncLogs({ limit: 50 })
      setSyncLogs(res.items)
      setSecondaryError(null)
    } catch (err) {
      setSecondaryError(`Sync history unavailable: ${formatError(err)}`)
    }
  }, [usingMock])

  const load = React.useCallback(async () => {
    setLoading(true)
    setSecondaryError(null)
    try {
      const [h, ident, libs] = await Promise.all([plexApi.health(), plexApi.identity(), plexApi.libraries()])
      setHealth(h)
      setIdentity(ident)
      setLibraries(libs.items)
      setUsingMock(false)
    } catch {
      const mock = buildMockBundle()
      setIdentity(mock.identity)
      setHealth(mock.health)
      setLibraries(mock.libraries)
      setSyncLogs(mock.syncLogs)
      setSourceConfig(mock.config)
      setMappings(mock.mappings)
      setCapabilities(mock.capabilities)
      setLogs(mock.logs)
      setUsingMock(true)
      setSecondaryError('Plex is not configured on the server. Showing demo data.')
      setLoading(false)
      return
    }
    try {
      const [logsRes, configs] = await Promise.all([plexApi.syncLogs({ limit: 50 }), sourceConfigApi.list()])
      setSyncLogs(logsRes.items)
      setSourceConfig(configs.items.find((c) => c.sourceType === 'plex') ?? null)
    } catch (err) {
      setSecondaryError(`Sync history unavailable: ${formatError(err)}`)
    }
    setMappings([])
    setCapabilities([])
    setLogs([])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const testConnection = React.useCallback(async () => {
    setTesting(true)
    try {
      if (usingMock) {
        await new Promise((r) => setTimeout(r, 300))
        toast.success('Connection OK — 42ms')
        return
      }
      const h = await plexApi.health()
      toast.success(`Connection OK — ${h.latencyMs}ms`)
    } catch (err) {
      toast.error(`Connection failed: ${formatError(err)}`)
    } finally {
      setTesting(false)
    }
  }, [usingMock])

  const syncLibrary = React.useCallback(
    async (libraryId: string) => {
      const lib = libraries.find((l) => l.id === libraryId)
      setSyncingId(libraryId)
      if (usingMock) {
        await new Promise((r) => setTimeout(r, 900))
        setSyncingId(null)
        toast.success(`Sync complete for ${lib?.name ?? libraryId} (demo)`)
        return
      }
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
    [usingMock, libraries, refreshLogs],
  )

  const syncAll = React.useCallback(async () => {
    if (libraries.length === 0) return
    setSyncingId('all')
    const toastId = toast.loading(`Syncing ${libraries.length} libraries…`)
    if (usingMock) {
      await new Promise((r) => setTimeout(r, 1500))
      setSyncingId(null)
      toast.success(`Synced ${libraries.length} libraries (demo)`, { id: toastId })
      return
    }
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
  }, [usingMock, libraries, refreshLogs])

  const refreshLibrary = React.useCallback(
    async (libraryId: string) => {
      const lib = libraries.find((l) => l.id === libraryId)
      if (usingMock) {
        toast.success(`Metadata refresh triggered for ${lib?.name ?? libraryId} (demo)`)
        return
      }
      try {
        await plexApi.refresh(libraryId)
        toast.success(`Metadata refresh triggered for ${lib?.name ?? libraryId}`)
      } catch (err) {
        toast.error(`Refresh failed: ${formatError(err)}`)
      }
    },
    [usingMock, libraries],
  )

  const saveConfig = React.useCallback(
    async (input: { url: string; token: string; timeoutSeconds: number; enabled: boolean }) => {
      setSaving(true)
      try {
        if (usingMock) {
          setSourceConfig((prev) =>
            prev
              ? {
                  ...prev,
                  enabled: input.enabled,
                  config: {
                    ...prev.config,
                    url: input.url.trim(),
                    token: input.token.trim(),
                    timeoutSeconds: input.timeoutSeconds,
                  },
                }
              : prev,
          )
          toast.success('Settings saved (demo)')
          return
        }
        const cfg = {
          url: input.url.trim(),
          token: input.token.trim(),
          timeoutSeconds: input.timeoutSeconds,
        }
        if (sourceConfig) {
          const updated = await sourceConfigApi.update(sourceConfig.id, {
            sourceType: 'plex',
            enabled: input.enabled,
            config: cfg,
          })
          setSourceConfig(updated)
        } else {
          const created = await sourceConfigApi.create({
            sourceType: 'plex',
            enabled: input.enabled,
            config: cfg,
          })
          setSourceConfig(created)
        }
        toast.success('Settings saved')
      } catch (err) {
        toast.error(`Failed to save: ${formatError(err)}`)
      } finally {
        setSaving(false)
      }
    },
    [usingMock, sourceConfig],
  )

  if (loading) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader
          title="Plex Media Server"
          description="Configure and monitor your Plex integration. Sync libraries, manage mappings, and track import jobs."
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading Plex configuration…</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!identity || !health) {
    return null
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Plex Media Server"
        description="Configure and monitor your Plex integration. Sync libraries, manage mappings, and track import jobs."
      >
        <Button variant="outline" size="sm" onClick={testConnection} disabled={testing || syncingId !== null}>
          <Link2 className="mr-1.5 size-3.5" />
          Test Connection
        </Button>
        <Button size="sm" onClick={syncAll} disabled={syncingId !== null || libraries.length === 0}>
          <RefreshCw className={cn('mr-1.5 size-3.5', syncingId === 'all' && 'animate-spin')} />
          Sync Now
        </Button>
      </PageHeader>

      {usingMock ? (
        <div className="flex flex-col gap-3 rounded-lg border border-info/40 bg-info/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-info" />
            <p>{secondaryError ?? 'Plex is not configured on the server. Showing demo data.'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            <Link2 className="mr-1.5 size-3.5" />
            Connect Plex
          </Button>
        </div>
      ) : (
        secondaryError && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>{secondaryError}</p>
          </div>
        )
      )}

      <Tabs defaultValue="overview" className="flex flex-col gap-6">
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
          <OverviewTab
            identity={identity}
            health={health}
            libraries={libraries}
            syncLogs={syncLogs}
            onTestConnection={testConnection}
            onSyncAll={syncAll}
            syncing={syncingId !== null}
          />
        </TabsContent>
        <TabsContent value="libraries">
          <LibrariesTab
            libraries={libraries}
            syncLogs={syncLogs}
            onSync={syncLibrary}
            onSyncAll={syncAll}
            onRefresh={refreshLibrary}
            syncingId={syncingId}
          />
        </TabsContent>
        <TabsContent value="imports">
          <ImportsTab syncLogs={syncLogs} onSync={syncLibrary} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab syncLogs={syncLogs} />
        </TabsContent>
        <TabsContent value="mappings">
          <MappingsTab mappings={mappings} />
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
            onSave={saveConfig}
            onTestConnection={testConnection}
            saving={saving}
            testing={testing}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
