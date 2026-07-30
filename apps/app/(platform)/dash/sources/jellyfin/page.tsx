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
  HardDrive,
  Image,
  Info,
  Link2,
  Loader2,
  Music,
  RefreshCw,
  Save,
  Scan,
  Server,
  Settings,
  Tv,
  Users,
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
  jellyfinProviderData,
  type JellyfinProviderData,
  type MediaLibrary,
  type SyncJob,
  type MediaMapping,
  type ProviderCapability,
  type ProviderLog,
  type ProviderSettings,
  type ProviderStatus,
  type JobStatus,
  type LogLevel,
  type MediaType,
} from '@/lib/jellyfin-provider-data'

function statusTone(s: ProviderStatus): StatusTone {
  return s === 'connected' ? 'success' : s === 'syncing' ? 'info' : s === 'error' ? 'destructive' : 'neutral'
}

function jobStatusTone(s: JobStatus): StatusTone {
  return s === 'completed' ? 'success' : s === 'running' ? 'info' : s === 'failed' ? 'destructive' : s === 'queued' ? 'warning' : 'neutral'
}

function jobStatusLabel(s: JobStatus): string {
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

function mediaTypeIcon(type: MediaType) {
  if (type === 'movie') return <Film className="size-4" />
  if (type === 'series' || type === 'season' || type === 'episode') return <Tv className="size-4" />
  if (type === 'music') return <Music className="size-4" />
  return <FileText className="size-4" />
}

function matchScoreBadge(score: number) {
  if (score >= 95) return <Badge variant="outline" className="border-success/50 text-success">{score}%</Badge>
  if (score >= 80) return <Badge variant="outline" className="border-warning/50 text-warning">{score}%</Badge>
  return <Badge variant="outline" className="border-destructive/50 text-destructive">{score}%</Badge>
}

function libraryTypeIcon(type: string) {
  if (type === 'movies') return <Film className="size-4" />
  if (type === 'series') return <Tv className="size-4" />
  if (type === 'music') return <Music className="size-4" />
  return <FileText className="size-4" />
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: JellyfinProviderData }) {
  const { provider, stats } = data
  const storagePercent = Math.round((parseFloat(stats.storageUsed) / parseFloat(stats.storageTotal)) * 100)
  const apiPercent = Math.round((stats.apiCallsToday / stats.apiCallsLimit) * 100)

  const statCards = [
    { label: 'Total Items', value: stats.totalItems.toLocaleString(), sub: 'media indexed', icon: Database },
    { label: 'Movies', value: stats.movies.toLocaleString(), sub: 'films', icon: Film },
    { label: 'Series', value: stats.series.toLocaleString(), sub: `${stats.episodes.toLocaleString()} episodes`, icon: Tv },
    { label: 'Users', value: stats.totalUsers.toLocaleString(), sub: `${stats.activeStreams} active streams`, icon: Users },
    { label: 'Storage', value: stats.storageUsed, sub: `of ${stats.storageTotal}`, icon: HardDrive },
    { label: 'Last Scan', value: stats.lastScanDuration, sub: `${stats.syncErrors} error${stats.syncErrors !== 1 ? 's' : ''}`, icon: RefreshCw },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Provider info card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Server className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <StatusBadge tone={statusTone(provider.status)} pulse={provider.status === 'syncing'}>
                {provider.status}
              </StatusBadge>
              {provider.apiKeyValid && (
                <Badge variant="outline" className="border-success/50 text-success text-[10px]">
                  <CheckCircle2 className="mr-1 size-3" />
                  API Key Valid
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.serverVersion} &middot; {provider.apiUrl} &middot; {stats.totalItems.toLocaleString()} items &middot; Avg {stats.averageResponseMs}ms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success('Test connection: OK')}>
              <Link2 className="mr-1.5 size-3.5" />
              Test Connection
            </Button>
            <Button size="sm" onClick={() => toast.info('Full library scan started...')}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Scan All
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

      {/* Storage + Bandwidth */}
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
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Movies</p>
                <p className="text-sm font-semibold">2.8 TB</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Series</p>
                <p className="text-sm font-semibold">1.1 TB</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Other</p>
                <p className="text-sm font-semibold">321 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth & API</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.bandwidthToday}</span>
              <span className="text-sm text-muted-foreground">today</span>
            </div>
            <Progress value={apiPercent} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">API Calls</p>
                <p className="text-sm font-semibold">{stats.apiCallsToday.toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Active Streams</p>
                <p className="text-sm font-semibold">{stats.activeStreams}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Transcoding</p>
                <p className="text-sm font-semibold">{stats.transcodingJobs}</p>
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

function LibrariesTab({ libraries }: { libraries: MediaLibrary[] }) {
  const [enabledMap, setEnabledMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(libraries.map((l) => [l.id, l.enabled])),
  )
  const [autoScanMap, setAutoScanMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(libraries.map((l) => [l.id, l.autoScan])),
  )

  function toggleEnabled(id: string) {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Library setting updated')
  }

  function toggleAutoScan(id: string) {
    setAutoScanMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Auto-scan setting updated')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{libraries.length} libraries &middot; {libraries.filter((l) => enabledMap[l.id]).length} active</p>
        <Button size="sm" variant="outline">
          <RefreshCw className="mr-1.5 size-3.5" />
          Scan All
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
                      <Badge variant="secondary" className="text-[10px] capitalize">{lib.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lib.itemCount.toLocaleString()} items &middot; {lib.size} &middot; {lib.path}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => toast.info(`Scanning ${lib.name}...`)}>
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
                  <Label className="text-xs text-muted-foreground">Auto-scan</Label>
                  <Switch checked={autoScanMap[lib.id]} onCheckedChange={() => toggleAutoScan(lib.id)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">Items</span>
                  {lib.itemCount.toLocaleString()}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Size</span>
                  {lib.size}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Last Scan</span>
                  {timeAgo(lib.lastScannedAt)}
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
/*  Imports Tab (Scan History)                                                */
/* -------------------------------------------------------------------------- */

function ImportsTab({ libraries }: { libraries: MediaLibrary[] }) {
  const recentScans = libraries
    .filter((l) => l.lastScannedAt)
    .sort((a, b) => new Date(b.lastScannedAt!).getTime() - new Date(a.lastScannedAt!).getTime())

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Library</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.map((lib) => (
                <TableRow key={lib.id}>
                  <TableCell className="font-medium">{lib.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {libraryTypeIcon(lib.type)}
                      <span className="capitalize text-xs">{lib.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lib.itemCount.toLocaleString()}</TableCell>
                  <TableCell>{lib.size}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{lib.path}</TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(lib.lastScannedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Scanning ${lib.name}...`)}>
                      <RefreshCw className="mr-1 size-3" />
                      Scan
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
          <CardTitle className="text-sm">Scan Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Real-time Monitoring</p>
                <p className="text-xs text-muted-foreground">Watch for file changes automatically</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Deep Scan</p>
                <p className="text-xs text-muted-foreground">Re-scan all metadata on each run</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">NFO Refresh</p>
                <p className="text-xs text-muted-foreground">Always re-read NFO files</p>
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
        {['all', 'library-scan', 'metadata-fetch', 'image-download', 'transcode-prep', 'cleanup'].map((t) => (
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
                    {job.type === 'library-scan' && <Scan className="size-4" />}
                    {job.type === 'metadata-fetch' && <FileText className="size-4" />}
                    {job.type === 'image-download' && <Image className="size-4" />}
                    {job.type === 'transcode-prep' && <Film className="size-4" />}
                    {job.type === 'cleanup' && <Settings className="size-4" />}
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
                      {job.library ?? 'All Libraries'} &middot; Triggered by {job.triggeredBy} &middot; {timeAgo(job.startedAt)}
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
          m.jellyfinId.toLowerCase().includes(search.toLowerCase()) ||
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
        <Button size="sm" variant="outline" onClick={() => toast.info('Scan for new items...')}>
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
                <TableHead>Jellyfin</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Rating</TableHead>
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
                    <p className="font-medium text-xs font-mono">{m.jellyfinId}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(m.mediaType)}
                      <span className="capitalize text-xs">{m.mediaType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{m.year}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{m.rating}/10</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.externalIds.imdb && <Badge variant="outline" className="text-[10px]">IMDB: {m.externalIds.imdb}</Badge>}
                      {m.externalIds.tmdb && <Badge variant="outline" className="text-[10px]">TMDB: {m.externalIds.tmdb}</Badge>}
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
          <CardTitle className="text-sm">Server Connection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>API Key</FieldLabel>
              <Input type="password" value={form.apiKey} onChange={(e) => update('apiKey', e.target.value)} placeholder="Your Jellyfin API key" />
            </Field>
            <Field>
              <FieldLabel>Server URL</FieldLabel>
              <Input value={form.apiUrl} onChange={(e) => update('apiUrl', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Timeout (seconds)</FieldLabel>
              <Input type="number" value={form.timeout} onChange={(e) => update('timeout', parseInt(e.target.value) || 30)} />
            </Field>
            <Field>
              <FieldLabel>Max Bitrate (kbps)</FieldLabel>
              <Input type="number" value={form.maxBitrate} onChange={(e) => update('maxBitrate', parseInt(e.target.value) || 100000)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cache</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Cache Enabled</p>
                <p className="text-xs text-muted-foreground">Cache metadata and images locally</p>
              </div>
              <Switch checked={form.cacheEnabled} onCheckedChange={(v) => update('cacheEnabled', v)} />
            </div>
            <Field>
              <FieldLabel>Cache TTL (hours)</FieldLabel>
              <Input type="number" value={form.cacheTtlHours} onChange={(e) => update('cacheTtlHours', parseInt(e.target.value) || 24)} disabled={!form.cacheEnabled} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Max Cache Size (MB)</FieldLabel>
              <Input type="number" value={form.maxCacheSizeMb} onChange={(e) => update('maxCacheSizeMb', parseInt(e.target.value) || 4096)} disabled={!form.cacheEnabled} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Retry on Fail</p>
                <p className="text-xs text-muted-foreground">Automatically retry failed operations</p>
              </div>
              <Switch checked={form.retryOnFail} onCheckedChange={(v) => update('retryOnFail', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Library Sync</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Auto-scan</p>
                <p className="text-xs text-muted-foreground">Automatically scan libraries on schedule</p>
              </div>
              <Switch checked={form.autoScan} onCheckedChange={(v) => update('autoScan', v)} />
            </div>
            <Field>
              <FieldLabel>Scan Interval (seconds)</FieldLabel>
              <Input type="number" value={form.scanInterval} onChange={(e) => update('scanInterval', parseInt(e.target.value) || 3600)} disabled={!form.autoScan} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sync Metadata</p>
                <p className="text-xs text-muted-foreground">Sync titles, ratings, descriptions</p>
              </div>
              <Switch checked={form.syncMetadata} onCheckedChange={(v) => update('syncMetadata', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sync Images</p>
                <p className="text-xs text-muted-foreground">Download posters and backdrops</p>
              </div>
              <Switch checked={form.syncImages} onCheckedChange={(v) => update('syncImages', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Transcode on Sync</p>
                <p className="text-xs text-muted-foreground">Pre-transcode during sync</p>
              </div>
              <Switch checked={form.transcodeOnSync} onCheckedChange={(v) => update('transcodeOnSync', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Language</FieldLabel>
              <Input value={form.language} onChange={(e) => update('language', e.target.value)} placeholder="fr" />
            </Field>
            <Field>
              <FieldLabel>Max Retries</FieldLabel>
              <Input type="number" value={form.maxRetries} onChange={(e) => update('maxRetries', parseInt(e.target.value) || 3)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Transcoding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Transcoding</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Hardware Acceleration</p>
                <p className="text-xs text-muted-foreground">Use GPU for transcoding</p>
              </div>
              <Switch checked={form.hardwareAcceleration} onCheckedChange={(v) => update('hardwareAcceleration', v)} />
            </div>
            <Field>
              <FieldLabel>Hardware Device</FieldLabel>
              <Input value={form.hardwareDevice} onChange={(e) => update('hardwareDevice', e.target.value)} disabled={!form.hardwareAcceleration} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Live TV</p>
                <p className="text-xs text-muted-foreground">Enable live TV and DVR</p>
              </div>
              <Switch checked={form.enableLiveTv} onCheckedChange={(v) => update('enableLiveTv', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Downloads</p>
                <p className="text-xs text-muted-foreground">Allow offline downloads</p>
              </div>
              <Switch checked={form.enableDownloads} onCheckedChange={(v) => update('enableDownloads', v)} />
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
              <p className="text-sm font-medium">Webhook Enabled</p>
              <p className="text-xs text-muted-foreground">Receive notifications on library changes</p>
            </div>
            <Switch checked={form.webhookEnabled} onCheckedChange={(v) => update('webhookEnabled', v)} />
          </div>
          <Field>
            <FieldLabel>Webhook URL</FieldLabel>
            <Input value={form.webhookUrl} onChange={(e) => update('webhookUrl', e.target.value)} disabled={!form.webhookEnabled} />
          </Field>
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
              <p className="text-sm font-medium">Scan Notifications</p>
              <p className="text-xs text-muted-foreground">Notify on scan completion or errors</p>
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
  { value: 'imports', label: 'Scan History', icon: RefreshCw },
  { value: 'jobs', label: 'Jobs', icon: Clock },
  { value: 'mappings', label: 'Mappings', icon: Link2 },
  { value: 'capabilities', label: 'Capabilities', icon: Zap },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function JellyfinProviderPage() {
  const data = jellyfinProviderData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Jellyfin"
        description="Configure and monitor your Jellyfin media server. Manage libraries, sync metadata, and track transcoding activity."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Test connection...')}>
          <Link2 className="mr-1.5 size-3.5" />
          Test Connection
        </Button>
        <Button size="sm" onClick={() => toast.info('Full scan started...')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Scan All
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
