'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileText,
  Film,
  HardDrive,
  Image,
  Info,
  Loader2,
  Music,
  RefreshCw,
  Save,
  Search,
  Settings,
  Subtitles,
  Tv,
  Video,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
  importHistoryData,
  type ImportHistoryData,
  type ImportJob,
  type ImportLog,
  type ImportStatus,
  type ImportType,
  type ImportSource,
  type MediaType,
  type LogLevel,
} from '@/lib/import-history-data'

function importStatusTone(s: ImportStatus): StatusTone {
  return s === 'completed' ? 'success' : s === 'running' ? 'info' : s === 'failed' ? 'destructive' : s === 'queued' ? 'warning' : 'neutral'
}

function importStatusLabel(s: ImportStatus): string {
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

function importTypeIcon(type: ImportType) {
  if (type === 'metadata') return <FileText className="size-4" />
  if (type === 'artwork') return <Image className="size-4" />
  if (type === 'episode') return <Tv className="size-4" />
  if (type === 'subtitle') return <Subtitles className="size-4" />
  if (type === 'trailer') return <Video className="size-4" />
  if (type === 'audio') return <Music className="size-4" />
  return <RefreshCw className="size-4" />
}

function sourceBadge(source: ImportSource) {
  const colors: Record<ImportSource, string> = {
    tmdb: 'border-blue-500/50 text-blue-500',
    tvdb: 'border-green-500/50 text-green-500',
    mal: 'border-orange-500/50 text-orange-500',
    jellyfin: 'border-purple-500/50 text-purple-500',
    fanart: 'border-pink-500/50 text-pink-500',
    manual: 'border-gray-500/50 text-gray-500',
    auto: 'border-cyan-500/50 text-cyan-500',
  }
  return <Badge variant="outline" className={cn('text-[10px] uppercase', colors[source])}>{source}</Badge>
}

function mediaTypeIcon(type: MediaType) {
  if (type === 'movie') return <Film className="size-4" />
  if (type === 'series') return <Tv className="size-4" />
  if (type === 'anime') return <Tv className="size-4" />
  if (type === 'episode') return <Film className="size-4" />
  if (type === 'season') return <Tv className="size-4" />
  return <FileText className="size-4" />
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: ImportHistoryData }) {
  const { stats } = data
  const successPercent = stats.successRate
  const failedPercent = 100 - successPercent

  const statCards = [
    { label: 'Total Imports', value: stats.totalImports.toLocaleString(), sub: 'all time', icon: Database },
    { label: 'Today', value: stats.importsToday.toLocaleString(), sub: 'imports', icon: Clock },
    { label: 'This Week', value: stats.importsThisWeek.toLocaleString(), sub: 'imports', icon: Activity },
    { label: 'Success Rate', value: `${stats.successRate}%`, sub: `${stats.failedImports} failed`, icon: CheckCircle2 },
    { label: 'Items Processed', value: stats.totalItemsProcessed.toLocaleString(), sub: 'total items', icon: RefreshCw },
    { label: 'Bandwidth', value: stats.totalBandwidth, sub: 'total transferred', icon: HardDrive },
  ]

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

      {/* Success Rate + Source Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Import Success Rate</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-success">{stats.successRate}%</span>
              <span className="text-sm text-muted-foreground">{stats.successfulImports.toLocaleString()} / {stats.totalImports.toLocaleString()}</span>
            </div>
            <Progress value={successPercent} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Successful</p>
                <p className="text-sm font-semibold text-success">{stats.successfulImports.toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-sm font-semibold text-destructive">{stats.failedImports.toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-sm font-semibold">{stats.averageDuration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Import Activity</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.importsToday}</span>
              <span className="text-sm text-muted-foreground">imports today</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-sm font-semibold">{stats.importsToday.toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-sm font-semibold">{stats.importsThisWeek.toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-sm font-semibold">{stats.importsThisMonth.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Most active source:</span>
              {sourceBadge(stats.mostActiveSource)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  History Tab                                                               */
/* -------------------------------------------------------------------------- */

function HistoryTab({ jobs }: { jobs: ImportJob[] }) {
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [sourceFilter, setSourceFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.externalId.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || j.type === typeFilter
    const matchSource = sourceFilter === 'all' || j.source === sourceFilter
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    return matchSearch && matchType && matchSource && matchStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="metadata">Metadata</option>
          <option value="artwork">Artwork</option>
          <option value="episode">Episodes</option>
          <option value="subtitle">Subtitles</option>
          <option value="trailer">Trailers</option>
          <option value="audio">Audio</option>
          <option value="full-sync">Full Sync</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">All Sources</option>
          <option value="tmdb">TMDB</option>
          <option value="tvdb">TVDB</option>
          <option value="mal">MyAnimeList</option>
          <option value="jellyfin">Jellyfin</option>
          <option value="fanart">Fanart.tv</option>
          <option value="manual">Manual</option>
          <option value="auto">Auto</option>
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
        <Button size="sm" variant="outline" onClick={() => toast.info('Exporting import history...')}>
          <Download className="mr-1.5 size-3.5" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{job.externalId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {importTypeIcon(job.type)}
                      <span className="capitalize text-xs">{job.type.replace('-', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{sourceBadge(job.source)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(job.mediaType)}
                      <span className="capitalize text-xs">{job.mediaType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={importStatusTone(job.status)}>
                      {job.status === 'running' && <Loader2 className="size-3 animate-spin" />}
                      {importStatusLabel(job.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {job.status === 'running' ? (
                      <div className="flex items-center gap-2">
                        <Progress value={job.progress} className="h-1.5 w-16" />
                        <span className="text-xs text-muted-foreground">{job.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{job.itemsProcessed}/{job.itemsTotal}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{job.duration ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{job.fileSize ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo(job.startedAt)}</TableCell>
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

function LogsTab({ logs }: { logs: ImportLog[] }) {
  const [levelFilter, setLevelFilter] = React.useState<string>('all')
  const [search, setSearch] = React.useState('')

  const filtered = logs.filter((l) => {
    const matchLevel = levelFilter === 'all' || l.level === levelFilter
    const matchSearch = !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.source.toLowerCase().includes(search.toLowerCase())
    return matchLevel && matchSearch
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
                    {sourceBadge(log.source as ImportSource)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{log.jobId}</span>
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
    autoImport: true,
    importInterval: 3600,
    maxConcurrent: 3,
    retryOnFail: true,
    maxRetries: 3,
    retryDelay: 300,
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notifyOnPartial: true,
    logRetentionDays: 30,
    exportFormat: 'csv' as 'csv' | 'json',
    deduplication: true,
    conflictResolution: 'newest' as 'newest' | 'oldest' | 'manual',
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Import Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import Behavior</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Auto-import</p>
                <p className="text-xs text-muted-foreground">Automatically import new items from providers</p>
              </div>
              <Switch checked={form.autoImport} onCheckedChange={(v) => update('autoImport', v)} />
            </div>
            <Field>
              <FieldLabel>Import Interval (seconds)</FieldLabel>
              <Input type="number" value={form.importInterval} onChange={(e) => update('importInterval', parseInt(e.target.value) || 3600)} disabled={!form.autoImport} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Max Concurrent Imports</FieldLabel>
              <Input type="number" value={form.maxConcurrent} onChange={(e) => update('maxConcurrent', parseInt(e.target.value) || 3)} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Deduplication</p>
                <p className="text-xs text-muted-foreground">Skip duplicate imports automatically</p>
              </div>
              <Switch checked={form.deduplication} onCheckedChange={(v) => update('deduplication', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Retry Policy</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Retry on Fail</p>
                <p className="text-xs text-muted-foreground">Automatically retry failed imports</p>
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
            <FieldLabel>Conflict Resolution</FieldLabel>
            <select
              value={form.conflictResolution}
              onChange={(e) => update('conflictResolution', e.target.value as typeof form.conflictResolution)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="newest">Newest wins</option>
              <option value="oldest">Oldest wins</option>
              <option value="manual">Manual resolution</option>
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
                <p className="text-xs text-muted-foreground">Notify on successful imports</p>
              </div>
              <Switch checked={form.notifyOnSuccess} onCheckedChange={(v) => update('notifyOnSuccess', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Failure</p>
                <p className="text-xs text-muted-foreground">Notify on failed imports</p>
              </div>
              <Switch checked={form.notifyOnFailure} onCheckedChange={(v) => update('notifyOnFailure', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Partial</p>
                <p className="text-xs text-muted-foreground">Notify on partial imports</p>
              </div>
              <Switch checked={form.notifyOnPartial} onCheckedChange={(v) => update('notifyOnPartial', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Logs & Export</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Log Retention (days)</FieldLabel>
              <Input type="number" value={form.logRetentionDays} onChange={(e) => update('logRetentionDays', parseInt(e.target.value) || 30)} />
            </Field>
            <Field>
              <FieldLabel>Export Format</FieldLabel>
              <select
                value={form.exportFormat}
                onChange={(e) => update('exportFormat', e.target.value as typeof form.exportFormat)}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm({
          autoImport: true,
          importInterval: 3600,
          maxConcurrent: 3,
          retryOnFail: true,
          maxRetries: 3,
          retryDelay: 300,
          notifyOnSuccess: false,
          notifyOnFailure: true,
          notifyOnPartial: true,
          logRetentionDays: 30,
          exportFormat: 'csv',
          deduplication: true,
          conflictResolution: 'newest',
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
  { value: 'history', label: 'History', icon: Clock },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function ImportHistoryPage() {
  const data = importHistoryData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Import History"
        description="Track and manage all media imports across every provider. View history, logs, and configure import settings."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Refreshing...')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => toast.info('Exporting data...')}>
          <Download className="mr-1.5 size-3.5" />
          Export All
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
        <TabsContent value="history">
          <HistoryTab jobs={data.jobs} />
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
