'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Info,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Save,
  Settings,
  Shield,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
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
import { cn } from '@/lib/utils'

import {
  synchronizationData,
  type SynchronizationData,
  type SyncJob,
  type SyncPipeline,
  type SyncConflict,
  type SyncProviderStatus,
  type SyncLog,
  type SyncStats,
  type SyncStatus,
  type SyncType,
  type SyncDirection,
  type SyncProvider,
  type LogLevel,
} from '@/lib/synchronization-data'

function syncStatusTone(s: SyncStatus): StatusTone {
  return s === 'completed' ? 'success' : s === 'running' ? 'info' : s === 'failed' ? 'destructive' : s === 'queued' ? 'warning' : s === 'paused' ? 'neutral' : 'neutral'
}

function syncStatusLabel(s: SyncStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function logLevelIcon(l: LogLevel) {
  if (l === 'info') return <Info className="size-3.5" />
  if (l === 'warn') return <AlertTriangle className="size-3.5" />
  if (l === 'error') return <XCircle className="size-3.5" />
  return <FileText className="size-3.5" />
}

function timeAgo(dateStr: string | null): string {
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

function providerBadge(provider: SyncProvider) {
  const colors: Record<SyncProvider, string> = {
    tmdb: 'border-blue-500/50 text-blue-500',
    tvdb: 'border-green-500/50 text-green-500',
    mal: 'border-orange-500/50 text-orange-500',
    jellyfin: 'border-purple-500/50 text-purple-500',
    fanart: 'border-pink-500/50 text-pink-500',
    trakt: 'border-red-500/50 text-red-500',
    simkl: 'border-cyan-500/50 text-cyan-500',
    anilist: 'border-blue-400/50 text-blue-400',
  }
  return <Badge variant="outline" className={cn('text-[10px] uppercase', colors[provider])}>{provider}</Badge>
}

function directionIcon(dir: SyncDirection) {
  if (dir === 'push') return <ArrowLeftRight className="size-4 rotate-0" />
  if (dir === 'pull') return <ArrowLeftRight className="size-4 rotate-180" />
  return <ArrowLeftRight className="size-4" />
}

function directionLabel(dir: SyncDirection): string {
  return dir.charAt(0).toUpperCase() + dir.slice(1)
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: SynchronizationData }) {
  const { stats, providerStatuses, pipelines } = data
  const successRate = Math.round((stats.successfulSyncs / stats.totalSyncs) * 100)

  const statCards = [
    { label: 'Total Syncs', value: stats.totalSyncs.toLocaleString(), sub: 'all time', icon: RefreshCw },
    { label: 'Today', value: stats.syncsToday.toLocaleString(), sub: 'syncs', icon: Clock },
    { label: 'Items Synced', value: stats.totalItemsSynced.toLocaleString(), sub: 'total items', icon: Database },
    { label: 'Success Rate', value: `${successRate}%`, sub: `${stats.failedSyncs} failed`, icon: CheckCircle2 },
    { label: 'Active Pipelines', value: stats.pipelinesActive.toString(), sub: `of ${pipelines.length}`, icon: Activity },
    { label: 'Conflicts', value: stats.conflictsDetected.toString(), sub: `${stats.conflictsResolved} resolved`, icon: Shield },
  ]

  const connectedCount = providerStatuses.filter((p) => p.connected).length
  const pendingTotal = providerStatuses.reduce((sum, p) => sum + p.pendingChanges, 0)

  return (
    <div className="flex flex-col gap-6">
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

      {/* Provider Status + Pipeline Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provider Status</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{connectedCount}</span>
              <span className="text-sm text-muted-foreground">of {providerStatuses.length} connected</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {providerStatuses.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                  <div className="flex items-center gap-2">
                    {providerBadge(p.provider)}
                    <div className={cn('size-2 rounded-full', p.connected ? 'bg-success' : 'bg-muted-foreground')} />
                  </div>
                  <span className="text-muted-foreground">{p.pendingChanges} pending</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{pendingTotal} total pending changes across all providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Activity</CardTitle>
            <ArrowLeftRight className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.syncsToday}</span>
              <span className="text-sm text-muted-foreground">syncs today</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-sm font-semibold">{stats.syncsToday}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-sm font-semibold">{stats.syncsThisWeek}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-sm font-semibold">{stats.averageSyncDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Bandwidth used:</span>
              <span className="font-medium text-foreground">{stats.totalBandwidth}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Pipelines Tab                                                             */
/* -------------------------------------------------------------------------- */

function PipelinesTab({ pipelines }: { pipelines: SyncPipeline[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{pipelines.length} pipelines &middot; {pipelines.filter((p) => p.enabled).length} active</p>
        <Button size="sm" variant="outline" onClick={() => toast.info('Syncing all pipelines...')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Sync All
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pipelines.map((pl) => (
          <Card key={pl.id} className={cn(!pl.enabled && 'opacity-60')}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <ArrowLeftRight className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{pl.name}</h3>
                      {pl.lastStatus && (
                        <StatusBadge tone={syncStatusTone(pl.lastStatus)}>
                          {syncStatusLabel(pl.lastStatus)}
                        </StatusBadge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{pl.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => toast.info(`Running ${pl.name}...`)}>
                    <Play className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => toast.info(`Pausing ${pl.name}...`)}>
                    <Pause className="size-3.5" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Flow:</span>
                {providerBadge(pl.source)}
                {directionIcon(pl.direction)}
                {providerBadge(pl.target)}
                <Badge variant="secondary" className="text-[10px] capitalize ml-auto">{pl.type.replace('-', ' ')}</Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">Synced</span>
                  {pl.totalSynced.toLocaleString()}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Pending</span>
                  {pl.pendingItems}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Last Run</span>
                  {timeAgo(pl.lastRunAt)}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Interval</span>
                  {pl.syncInterval}s
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Enabled</Label>
                  <Switch checked={pl.enabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Auto-sync</Label>
                  <Switch checked={pl.autoSync} disabled={!pl.enabled} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Jobs Tab                                                                  */
/* -------------------------------------------------------------------------- */

function JobsTab({ jobs }: { jobs: SyncJob[] }) {
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const filtered = jobs.filter((j) => {
    const matchType = typeFilter === 'all' || j.type === typeFilter
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    return matchType && matchStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="metadata">Metadata</option>
          <option value="artwork">Artwork</option>
          <option value="episodes">Episodes</option>
          <option value="watchlist">Watchlist</option>
          <option value="ratings">Ratings</option>
          <option value="collections">Collections</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <ArrowLeftRight className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{job.pipelineName}</span>
                      <StatusBadge tone={syncStatusTone(job.status)}>
                        {job.status === 'running' && <Loader2 className="size-3 animate-spin" />}
                        {syncStatusLabel(job.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {job.type.replace('-', ' ')} &middot; {directionLabel(job.direction)} &middot; Triggered by {job.triggeredBy} &middot; {timeAgo(job.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {job.duration && <p className="text-xs text-muted-foreground">{job.duration}</p>}
                  {job.errors > 0 && (
                    <p className="text-xs text-destructive">{job.errors} error{job.errors > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>

              {job.status === 'running' && (
                <div className="flex items-center gap-3">
                  <Progress value={job.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{job.progress}%</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{job.itemsProcessed.toLocaleString()} / {job.itemsTotal.toLocaleString()} items</span>
                <span className="text-success">+{job.itemsCreated} created</span>
                <span className="text-blue-500">↻{job.itemsUpdated} updated</span>
                <span>⊘{job.itemsSkipped} skipped</span>
                {job.bandwidth && <span>↕{job.bandwidth}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Conflicts Tab                                                             */
/* -------------------------------------------------------------------------- */

function ConflictsTab({ conflicts }: { conflicts: SyncConflict[] }) {
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const filtered = conflicts.filter((c) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'unresolved') return !c.resolvedAt
    if (statusFilter === 'resolved') return !!c.resolvedAt
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'unresolved', 'resolved'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">
          {conflicts.filter((c) => !c.resolvedAt).length} unresolved
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Media</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Conflict Type</TableHead>
                <TableHead>Source Value</TableHead>
                <TableHead>Target Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cf) => (
                <TableRow key={cf.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cf.mediaTitle}</p>
                      <Badge variant="secondary" className="text-[10px] capitalize">{cf.mediaType}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">{cf.pipelineName}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">{cf.conflictType}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-mono text-muted-foreground max-w-37.5 truncate">{cf.sourceValue}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-mono text-muted-foreground max-w-37.5 truncate">{cf.targetValue}</p>
                  </TableCell>
                  <TableCell>
                    {cf.resolvedAt ? (
                      <StatusBadge tone="success">
                        <CheckCircle2 className="size-3" />
                        {cf.resolution?.replace('-', ' ')}
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="warning">Unresolved</StatusBadge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo(cf.detectedAt)}</TableCell>
                  <TableCell className="text-right">
                    {!cf.resolvedAt && (
                      <Button size="sm" variant="ghost" onClick={() => toast.info(`Resolving conflict for ${cf.mediaTitle}...`)}>
                        <Shield className="mr-1 size-3" />
                        Resolve
                      </Button>
                    )}
                  </TableCell>
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
/*  Logs Tab                                                                  */
/* -------------------------------------------------------------------------- */

function LogsTab({ logs }: { logs: SyncLog[] }) {
  const [levelFilter, setLevelFilter] = React.useState<string>('all')

  const filtered = levelFilter === 'all' ? logs : logs.filter((l) => l.level === levelFilter)

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
                    <span className="text-xs text-muted-foreground font-mono">{log.pipelineId}</span>
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

function SettingsTab() {
  const [form, setForm] = React.useState({
    globalAutoSync: true,
    globalSyncInterval: 3600,
    maxConcurrentPipelines: 4,
    retryOnFail: true,
    maxRetries: 3,
    retryDelay: 300,
    conflictStrategy: 'newest' as 'newest' | 'oldest' | 'manual' | 'merge',
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notifyOnConflict: true,
    logRetentionDays: 30,
    bandwidthLimit: 0,
    priorityMode: 'balanced' as 'speed' | 'balanced' | 'conservative',
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Global Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Global Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Global Auto-sync</p>
                <p className="text-xs text-muted-foreground">Enable automatic sync for all pipelines</p>
              </div>
              <Switch checked={form.globalAutoSync} onCheckedChange={(v) => update('globalAutoSync', v)} />
            </div>
            <Field>
              <FieldLabel>Global Sync Interval (seconds)</FieldLabel>
              <Input type="number" value={form.globalSyncInterval} onChange={(e) => update('globalSyncInterval', parseInt(e.target.value) || 3600)} disabled={!form.globalAutoSync} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Max Concurrent Pipelines</FieldLabel>
              <Input type="number" value={form.maxConcurrentPipelines} onChange={(e) => update('maxConcurrentPipelines', parseInt(e.target.value) || 4)} />
            </Field>
            <Field>
              <FieldLabel>Priority Mode</FieldLabel>
              <select
                value={form.priorityMode}
                onChange={(e) => update('priorityMode', e.target.value as typeof form.priorityMode)}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="speed">Speed (parallel)</option>
                <option value="balanced">Balanced</option>
                <option value="conservative">Conservative (sequential)</option>
              </select>
            </Field>
          </div>
          <Field>
            <FieldLabel>Bandwidth Limit (MB/s, 0 = unlimited)</FieldLabel>
            <Input type="number" value={form.bandwidthLimit} onChange={(e) => update('bandwidthLimit', parseInt(e.target.value) || 0)} />
          </Field>
        </CardContent>
      </Card>

      {/* Retry & Conflicts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Retry & Conflict Resolution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Retry on Fail</p>
                <p className="text-xs text-muted-foreground">Automatically retry failed syncs</p>
              </div>
              <Switch checked={form.retryOnFail} onCheckedChange={(v) => update('retryOnFail', v)} />
            </div>
            <Field>
              <FieldLabel>Max Retries</FieldLabel>
              <Input type="number" value={form.maxRetries} onChange={(e) => update('maxRetries', parseInt(e.target.value) || 3)} disabled={!form.retryOnFail} />
            </Field>
            <Field>
              <FieldLabel>Retry Delay (seconds)</FieldLabel>
              <Input type="number" value={form.retryDelay} onChange={(e) => update('retryDelay', parseInt(e.target.value) || 300)} disabled={!form.retryOnFail} />
            </Field>
          </div>
          <Field>
            <FieldLabel>Conflict Resolution Strategy</FieldLabel>
            <select
              value={form.conflictStrategy}
              onChange={(e) => update('conflictStrategy', e.target.value as typeof form.conflictStrategy)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="newest">Newest wins</option>
              <option value="oldest">Oldest wins</option>
              <option value="manual">Manual resolution</option>
              <option value="merge">Auto-merge</option>
            </select>
          </Field>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Success</p>
                <p className="text-xs text-muted-foreground">Notify on successful syncs</p>
              </div>
              <Switch checked={form.notifyOnSuccess} onCheckedChange={(v) => update('notifyOnSuccess', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Failure</p>
                <p className="text-xs text-muted-foreground">Notify on failed syncs</p>
              </div>
              <Switch checked={form.notifyOnFailure} onCheckedChange={(v) => update('notifyOnFailure', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Conflict</p>
                <p className="text-xs text-muted-foreground">Notify on conflicts detected</p>
              </div>
              <Switch checked={form.notifyOnConflict} onCheckedChange={(v) => update('notifyOnConflict', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel>Log Retention (days)</FieldLabel>
            <Input type="number" value={form.logRetentionDays} onChange={(e) => update('logRetentionDays', parseInt(e.target.value) || 30)} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm({
          globalAutoSync: true,
          globalSyncInterval: 3600,
          maxConcurrentPipelines: 4,
          retryOnFail: true,
          maxRetries: 3,
          retryDelay: 300,
          conflictStrategy: 'newest',
          notifyOnSuccess: false,
          notifyOnFailure: true,
          notifyOnConflict: true,
          logRetentionDays: 30,
          bandwidthLimit: 0,
          priorityMode: 'balanced',
        })}>
          Reset
        </Button>
        <Button onClick={() => toast.success('Settings saved')}>
          <Save className="mr-1.5 size-3.5" />
          Save Settings
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
  { value: 'pipelines', label: 'Pipelines', icon: ArrowLeftRight },
  { value: 'jobs', label: 'Jobs', icon: Clock },
  { value: 'conflicts', label: 'Conflicts', icon: Shield },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function SynchronizationPage() {
  const data = synchronizationData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Synchronization"
        description="Manage data sync across all providers. Configure pipelines, monitor jobs, and resolve conflicts."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Refreshing...')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => toast.info('Syncing all pipelines...')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Sync All
        </Button>
      </PageHeader>

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
          <OverviewTab data={data} />
        </TabsContent>
        <TabsContent value="pipelines">
          <PipelinesTab pipelines={data.pipelines} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab jobs={data.jobs} />
        </TabsContent>
        <TabsContent value="conflicts">
          <ConflictsTab conflicts={data.conflicts} />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab logs={data.logs} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
