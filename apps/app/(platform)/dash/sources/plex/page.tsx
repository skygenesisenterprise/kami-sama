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
  Save,
  Scan,
  Settings,
  Tv,
  Zap,
  XCircle,
  Ban,
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
  plexProviderData,
  type PlexProviderData,
  type ProviderLibrary,
  type SyncJob,
  type MediaMapping,
  type ProviderCapability,
  type ProviderLog,
  type ProviderSettings,
  type ProviderStatus,
  type JobStatus,
  type LogLevel,
} from '@/lib/plex-provider-data'

function statusTone(s: ProviderStatus): StatusTone {
  return s === 'connected' ? 'success' : s === 'syncing' ? 'info' : s === 'error' ? 'destructive' : 'neutral'
}

function jobStatusTone(s: JobStatus): StatusTone {
  return s === 'completed' ? 'success' : s === 'running' ? 'info' : s === 'failed' ? 'destructive' : s === 'queued' ? 'warning' : 'neutral'
}

function jobStatusLabel(s: JobStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
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

function libraryTypeIcon(type: string) {
  if (type === 'movie') return <Film className="size-4" />
  if (type === 'show') return <Tv className="size-4" />
  if (type === 'music') return <Music className="size-4" />
  return <Layers className="size-4" />
}

function matchScoreBadge(score: number) {
  if (score >= 95) return <Badge variant="outline" className="border-success/50 text-success">{score}%</Badge>
  if (score >= 80) return <Badge variant="outline" className="border-warning/50 text-warning">{score}%</Badge>
  return <Badge variant="outline" className="border-destructive/50 text-destructive">{score}%</Badge>
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: PlexProviderData }) {
  const { provider, stats } = data
  const storagePercent = Math.round((parseFloat(stats.storageUsed) / parseFloat(stats.storageTotal)) * 100)

  const statCards = [
    { label: 'Libraries', value: stats.totalLibraries, sub: `${stats.activeLibraries} active`, icon: Database },
    { label: 'Total Media', value: stats.totalMedia.toLocaleString(), sub: 'items indexed', icon: Layers },
    { label: 'Movies', value: stats.movies.toLocaleString(), sub: 'in libraries', icon: Film },
    { label: 'TV Shows', value: stats.shows.toLocaleString(), sub: `${stats.episodes.toLocaleString()} episodes`, icon: Tv },
    { label: 'Last Sync', value: stats.lastSyncDuration, sub: `${stats.syncErrors} errors`, icon: RefreshCw },
    { label: 'Storage', value: stats.storageUsed, sub: `of ${stats.storageTotal}`, icon: HardDrive },
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
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <StatusBadge tone={statusTone(provider.status)} pulse={provider.status === 'syncing'}>
                {provider.status}
              </StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">
              v{provider.version} &middot; Uptime: {provider.uptime} &middot; {provider.libraryCount} libraries &middot; {provider.mediaCount.toLocaleString()} media
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success('Test connection: OK')}>
              <Link2 className="mr-1.5 size-3.5" />
              Test Connection
            </Button>
            <Button size="sm" onClick={() => toast.info('Sync started...')}>
              <RefreshCw className="mr-1.5 size-3.5" />
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

      {/* Storage + bandwidth */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.storageUsed}</span>
              <span className="text-sm text-muted-foreground">of {stats.storageTotal}</span>
            </div>
            <Progress value={storagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">{storagePercent}% utilized</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.bandwidthMbps}</span>
              <span className="text-sm text-muted-foreground">Mbps current</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Peak</p>
                <p className="text-sm font-semibold">1.2 Gbps</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Avg 24h</p>
                <p className="text-sm font-semibold">680 Mbps</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Streams</p>
                <p className="text-sm font-semibold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Libraries Tab                                                             */
/* -------------------------------------------------------------------------- */

function LibrariesTab({ libraries }: { libraries: ProviderLibrary[] }) {
  const [enabledMap, setEnabledMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(libraries.map((l) => [l.id, l.enabled])),
  )
  const [autoSyncMap, setAutoSyncMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(libraries.map((l) => [l.id, l.autoSync])),
  )

  function toggleEnabled(id: string) {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Library setting updated')
  }

  function toggleAutoSync(id: string) {
    setAutoSyncMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Auto-sync setting updated')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{libraries.length} libraries configured &middot; {libraries.filter((l) => enabledMap[l.id]).length} active</p>
        <Button size="sm" variant="outline">
          <RefreshCw className="mr-1.5 size-3.5" />
          Sync All
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {libraries.map((lib) => (
          <Card key={lib.id} className={cn(!enabledMap[lib.id] && 'opacity-60')}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    {libraryTypeIcon(lib.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{lib.name}</h3>
                      {lib.lastSyncStatus === 'success' && <CheckCircle2 className="size-3.5 text-success" />}
                      {lib.lastSyncStatus === 'partial' && <AlertTriangle className="size-3.5 text-warning" />}
                      {lib.lastSyncStatus === 'failed' && <XCircle className="size-3.5 text-destructive" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lib.mediaCount.toLocaleString()} items &middot; {lib.folder}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => toast.info(`Syncing ${lib.name}...`)}>
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
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
                  <span className="block font-medium text-foreground">Agent</span>
                  {lib.agent}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Scanner</span>
                  {lib.scanner}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Last Sync</span>
                  {timeAgo(lib.lastSyncAt)}
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
/*  Imports Tab                                                               */
/* -------------------------------------------------------------------------- */

function ImportsTab({ libraries }: { libraries: ProviderLibrary[] }) {
  const recentImports = libraries
    .filter((l) => l.lastSyncAt)
    .sort((a, b) => new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime())

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Library</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentImports.map((lib) => (
                <TableRow key={lib.id}>
                  <TableCell className="font-medium">{lib.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 capitalize">
                      {libraryTypeIcon(lib.type)}
                      {lib.type}
                    </div>
                  </TableCell>
                  <TableCell>{lib.mediaCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge tone={lib.lastSyncStatus === 'success' ? 'success' : lib.lastSyncStatus === 'partial' ? 'warning' : 'neutral'}>
                      {lib.lastSyncStatus}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(lib.lastSyncAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Re-importing ${lib.name}...`)}>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Import Profiles</p>
                <p className="text-xs text-muted-foreground">Sync user profiles from Plex</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Watch History</p>
                <p className="text-xs text-muted-foreground">Import viewing progress</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">User Ratings</p>
                <p className="text-xs text-muted-foreground">Sync ratings bidirectionally</p>
              </div>
              <Switch defaultChecked />
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

function JobsTab({ jobs }: { jobs: SyncJob[] }) {
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  const filtered = typeFilter === 'all' ? jobs : jobs.filter((j) => j.type === typeFilter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'full-sync', 'library-sync', 'metadata-refresh', 'scan', 'repair'].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={typeFilter === t ? 'default' : 'outline'}
            onClick={() => setTypeFilter(t)}
          >
            {t === 'all' ? 'All' : t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                    {job.type === 'full-sync' && <RefreshCw className="size-4" />}
                    {job.type === 'library-sync' && <Database className="size-4" />}
                    {job.type === 'metadata-refresh' && <FileText className="size-4" />}
                    {job.type === 'scan' && <Scan className="size-4" />}
                    {job.type === 'repair' && <Settings className="size-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {job.type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <StatusBadge tone={jobStatusTone(job.status)}>
                        {job.status === 'running' && <Loader2 className="size-3 animate-spin" />}
                        {jobStatusLabel(job.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {job.libraryName} &middot; Triggered by {job.triggeredBy} &middot; {timeAgo(job.startedAt)}
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
                {job.status !== 'running' && job.duration && <span>Duration: {job.duration}</span>}
              </div>
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

function SettingsTab({ settings }: { settings: ProviderSettings }) {
  const [form, setForm] = React.useState(settings)

  function update<K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Connection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Server URL</FieldLabel>
              <Input value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="http://192.168.1.50:32400" />
            </Field>
            <Field>
              <FieldLabel>Token</FieldLabel>
              <Input type="password" value={form.token} onChange={(e) => update('token', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Timeout (seconds)</FieldLabel>
              <Input type="number" value={form.timeout} onChange={(e) => update('timeout', parseInt(e.target.value) || 30)} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">SSL Verification</p>
                <p className="text-xs text-muted-foreground">Verify SSL certificates</p>
              </div>
              <Switch checked={form.sslVerification} onCheckedChange={(v) => update('sslVerification', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Synchronization</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Auto-sync</p>
                <p className="text-xs text-muted-foreground">Automatically sync on schedule</p>
              </div>
              <Switch checked={form.autoSync} onCheckedChange={(v) => update('autoSync', v)} />
            </div>
            <Field>
              <FieldLabel>Sync Interval (seconds)</FieldLabel>
              <Input type="number" value={form.syncInterval} onChange={(e) => update('syncInterval', parseInt(e.target.value) || 3600)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sync on Startup</p>
                <p className="text-xs text-muted-foreground">Trigger sync when server starts</p>
              </div>
              <Switch checked={form.syncOnStartup} onCheckedChange={(v) => update('syncOnStartup', v)} />
            </div>
            <Field>
              <FieldLabel>Max Concurrent Syncs</FieldLabel>
              <Input type="number" value={form.maxConcurrentSyncs} onChange={(e) => update('maxConcurrentSyncs', parseInt(e.target.value) || 2)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Metadata Refresh (days)</FieldLabel>
              <Input type="number" value={form.metadataRefreshDays} onChange={(e) => update('metadataRefreshDays', parseInt(e.target.value) || 7)} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Scan All Libraries</p>
                <p className="text-xs text-muted-foreground">Include disabled libraries in scan</p>
              </div>
              <Switch checked={form.scanAllLibraries} onCheckedChange={(v) => update('scanAllLibraries', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Webhooks Enabled</p>
              <p className="text-xs text-muted-foreground">Receive real-time events from Plex</p>
            </div>
            <Switch checked={form.webhooksEnabled} onCheckedChange={(v) => update('webhooksEnabled', v)} />
          </div>
          <Field>
            <FieldLabel>Webhook URL</FieldLabel>
            <Input value={form.webhookUrl} onChange={(e) => update('webhookUrl', e.target.value)} disabled={!form.webhooksEnabled} />
          </Field>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Import Profiles</p>
                <p className="text-xs text-muted-foreground">Sync user profiles</p>
              </div>
              <Switch checked={form.importProfiles} onCheckedChange={(v) => update('importProfiles', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Watch History</p>
                <p className="text-xs text-muted-foreground">Import viewing data</p>
              </div>
              <Switch checked={form.importWatchHistory} onCheckedChange={(v) => update('importWatchHistory', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Ratings</p>
                <p className="text-xs text-muted-foreground">Sync ratings</p>
              </div>
              <Switch checked={form.importRatings} onCheckedChange={(v) => update('importRatings', v)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Prefer Local Metadata</p>
              <p className="text-xs text-muted-foreground">Use local metadata files over online sources</p>
            </div>
            <Switch checked={form.preferLocalMetadata} onCheckedChange={(v) => update('preferLocalMetadata', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Sync Notifications</p>
              <p className="text-xs text-muted-foreground">Receive notifications on sync completion or errors</p>
            </div>
            <Switch checked={form.notificationsEnabled} onCheckedChange={(v) => update('notificationsEnabled', v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm(settings)}>
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
  { value: 'libraries', label: 'Libraries', icon: Database },
  { value: 'imports', label: 'Imports', icon: Download },
  { value: 'jobs', label: 'Jobs', icon: Clock },
  { value: 'mappings', label: 'Mappings', icon: Link2 },
  { value: 'capabilities', label: 'Capabilities', icon: Zap },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function PlexProviderPage() {
  const data = plexProviderData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Plex Media Server"
        description="Configure and monitor your Plex integration. Sync libraries, manage mappings, and track import jobs."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Test connection...')}>
          <Link2 className="mr-1.5 size-3.5" />
          Test Connection
        </Button>
        <Button size="sm" onClick={() => toast.info('Sync started...')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Sync Now
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
        <TabsContent value="libraries">
          <LibrariesTab libraries={data.libraries} />
        </TabsContent>
        <TabsContent value="imports">
          <ImportsTab libraries={data.libraries} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab jobs={data.jobs} />
        </TabsContent>
        <TabsContent value="mappings">
          <MappingsTab mappings={data.mappings} />
        </TabsContent>
        <TabsContent value="capabilities">
          <CapabilitiesTab capabilities={data.capabilities} />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab logs={data.logs} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab settings={data.settings} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
