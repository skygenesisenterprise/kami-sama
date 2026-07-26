'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Globe,
  Heart,
  Info,
  Layers,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  Scan,
  Settings,
  Star,
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
  anilistProviderData,
  type AniListProviderData,
  type ListCategory,
  type SyncJob,
  type MediaMapping,
  type ProviderCapability,
  type ProviderLog,
  type ProviderSettings,
  type ProviderStatus,
  type JobStatus,
  type LogLevel,
  type AniListMediaType,
  type AniListMediaFormat,
  type AniListListStatus,
} from '@/lib/anilist-provider-data'

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

function mediaTypeIcon(type: AniListMediaType) {
  return type === 'anime' ? <Tv className="size-4" /> : <BookOpen className="size-4" />
}

function listStatusLabel(status: AniListListStatus): string {
  const map: Record<AniListListStatus, string> = {
    CURRENT: 'Current',
    PLANNING: 'Planning',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'Paused',
    REPEATING: 'Repeating',
  }
  return map[status] ?? status
}

function listStatusTone(status: AniListListStatus): StatusTone {
  if (status === 'CURRENT') return 'success'
  if (status === 'COMPLETED') return 'info'
  if (status === 'DROPPED') return 'destructive'
  if (status === 'PAUSED') return 'warning'
  return 'neutral'
}

function matchScoreBadge(score: number) {
  if (score >= 95) return <Badge variant="outline" className="border-success/50 text-success">{score}%</Badge>
  if (score >= 80) return <Badge variant="outline" className="border-warning/50 text-warning">{score}%</Badge>
  return <Badge variant="outline" className="border-destructive/50 text-destructive">{score}%</Badge>
}

function formatLabel(fmt: AniListMediaFormat): string {
  return fmt.replace('_', ' ')
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: AniListProviderData }) {
  const { provider, stats } = data
  const apiPercent = Math.round((stats.apiCallsToday / stats.apiCallsLimit) * 100)
  const rateLimitPercent = Math.round((provider.rateLimitRemaining / provider.rateLimitMax) * 100)

  const statCards = [
    { label: 'Tracked', value: stats.totalTracked, sub: 'total entries', icon: Layers },
    { label: 'Anime', value: stats.animeTracked, sub: 'titles tracked', icon: Tv },
    { label: 'Manga', value: stats.mangaTracked, sub: 'titles tracked', icon: BookOpen },
    { label: 'Watch Hours', value: stats.watchHours.toLocaleString(), sub: 'total watched', icon: Clock },
    { label: 'Chapters', value: stats.chaptersRead.toLocaleString(), sub: 'total read', icon: BookOpen },
    { label: 'Avg Score', value: stats.averageScore.toFixed(1), sub: '/ 10', icon: Star },
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
              {provider.oauthValid && (
                <Badge variant="outline" className="border-success/50 text-success text-[10px]">
                  <CheckCircle2 className="mr-1 size-3" />
                  OAuth Valid
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.version} &middot; {provider.apiUrl} &middot; {provider.totalTracked} tracked &middot; Rate limit: {provider.rateLimitRemaining}/{provider.rateLimitMax}
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

      {/* API Usage + Rate Limit */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.apiCallsToday.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">of {stats.apiCallsLimit.toLocaleString()} today</span>
            </div>
            <Progress value={apiPercent} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Last Sync</p>
                <p className="text-sm font-semibold">{stats.lastSyncDuration}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Errors</p>
                <p className="text-sm font-semibold">{stats.syncErrors}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-sm font-semibold">{(stats.apiCallsLimit - stats.apiCallsToday).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{provider.rateLimitRemaining}</span>
              <span className="text-sm text-muted-foreground">of {provider.rateLimitMax} remaining</span>
            </div>
            <Progress value={rateLimitPercent} className={cn('h-2', rateLimitPercent < 20 && '[&>div]:bg-destructive')} />
            <p className="text-xs text-muted-foreground">
              {rateLimitPercent}% available &middot; Resets every 60 seconds
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Lists Tab (Libraries equivalent)                                           */
/* -------------------------------------------------------------------------- */

function ListsTab({ lists }: { lists: ListCategory[] }) {
  const [enabledMap, setEnabledMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(lists.map((l) => [l.id, l.enabled])),
  )
  const [autoSyncMap, setAutoSyncMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(lists.map((l) => [l.id, l.autoSync])),
  )

  function toggleEnabled(id: string) {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('List setting updated')
  }

  function toggleAutoSync(id: string) {
    setAutoSyncMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Auto-sync setting updated')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{lists.length} lists configured &middot; {lists.filter((l) => enabledMap[l.id]).length} active</p>
        <Button size="sm" variant="outline">
          <RefreshCw className="mr-1.5 size-3.5" />
          Sync All
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {lists.map((list) => (
          <Card key={list.id} className={cn(!enabledMap[list.id] && 'opacity-60')}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    {mediaTypeIcon(list.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{list.label}</h3>
                      <Badge variant="secondary" className="text-[10px] capitalize">{list.type}</Badge>
                      <StatusBadge tone={listStatusTone(list.status)} className="text-[10px]">
                        {listStatusLabel(list.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {list.count} {list.type === 'anime' ? 'titles' : 'titles'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => toast.info(`Syncing ${list.label}...`)}>
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Enabled</Label>
                  <Switch checked={enabledMap[list.id]} onCheckedChange={() => toggleEnabled(list.id)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Auto-sync</Label>
                  <Switch checked={autoSyncMap[list.id]} onCheckedChange={() => toggleAutoSync(list.id)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">Type</span>
                  {list.type === 'anime' ? 'Anime' : 'Manga'}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Last Synced</span>
                  {timeAgo(list.lastSyncedAt)}
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
/*  Imports Tab (Sync History)                                                */
/* -------------------------------------------------------------------------- */

function ImportsTab({ lists }: { lists: ListCategory[] }) {
  const recentSyncs = lists
    .filter((l) => l.lastSyncedAt)
    .sort((a, b) => new Date(b.lastSyncedAt!).getTime() - new Date(a.lastSyncedAt!).getTime())

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSyncs.map((list) => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">{list.label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(list.type)}
                      <span className="capitalize text-xs">{list.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={listStatusTone(list.status)}>{listStatusLabel(list.status)}</StatusBadge>
                  </TableCell>
                  <TableCell>{list.count}</TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(list.lastSyncedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Re-syncing ${list.label}...`)}>
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
          <CardTitle className="text-sm">Sync Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sync Ratings</p>
                <p className="text-xs text-muted-foreground">Sync scores from AniList</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Watch History</p>
                <p className="text-xs text-muted-foreground">Import episode progress</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Reading Progress</p>
                <p className="text-xs text-muted-foreground">Import chapter progress</p>
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
        {['all', 'list-sync', 'metadata-refresh', 'seasonal-fetch', 'chart-update', 'character-sync'].map((t) => (
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
                    {job.type === 'list-sync' && <Layers className="size-4" />}
                    {job.type === 'metadata-refresh' && <FileText className="size-4" />}
                    {job.type === 'seasonal-fetch' && <Tv className="size-4" />}
                    {job.type === 'chart-update' && <BarChart3 className="size-4" />}
                    {job.type === 'character-sync' && <Heart className="size-4" />}
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
                      {job.target ?? 'All'} &middot; Triggered by {job.triggeredBy} &middot; {timeAgo(job.startedAt)}
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
          m.anilistTitle.toLowerCase().includes(search.toLowerCase()) ||
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
                <TableHead>AniList</TableHead>
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
                      <p className="font-medium">{m.anilistTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: {m.anilistId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(m.type)}
                      <Badge variant="secondary" className="text-[10px]">{formatLabel(m.format)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.externalIds.myAnimeList && <Badge variant="outline" className="text-[10px]">MAL: {m.externalIds.myAnimeList}</Badge>}
                      {m.externalIds.tmdb && <Badge variant="outline" className="text-[10px]">TMDB: {m.externalIds.tmdb}</Badge>}
                      {m.externalIds.imdb && <Badge variant="outline" className="text-[10px]">IMDB: {m.externalIds.imdb}</Badge>}
                      {m.externalIds.kitsu && <Badge variant="outline" className="text-[10px]">Kitsu: {m.externalIds.kitsu}</Badge>}
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
          <CardTitle className="text-sm">API Connection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>GraphQL URL</FieldLabel>
              <Input value={form.graphqlUrl} onChange={(e) => update('graphqlUrl', e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>API Key</FieldLabel>
              <Input type="password" value={form.apiKey} onChange={(e) => update('apiKey', e.target.value)} placeholder="Your AniList API key" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>OAuth Token</FieldLabel>
              <Input type="password" value={form.oauthToken} onChange={(e) => update('oauthToken', e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>OAuth Refresh Token</FieldLabel>
              <Input type="password" value={form.oauthRefreshToken} onChange={(e) => update('oauthRefreshToken', e.target.value)} />
            </Field>
          </div>
          <Field>
            <FieldLabel>Timeout (seconds)</FieldLabel>
            <Input type="number" value={form.timeout} onChange={(e) => update('timeout', parseInt(e.target.value) || 15)} />
          </Field>
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Auto-add to List</p>
                <p className="text-xs text-muted-foreground">Automatically add new media to lists</p>
              </div>
              <Switch checked={form.autoAddToList} onCheckedChange={(v) => update('autoAddToList', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tracking</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Track Anime</p>
                <p className="text-xs text-muted-foreground">Sync anime watching progress</p>
              </div>
              <Switch checked={form.trackAnime} onCheckedChange={(v) => update('trackAnime', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Track Manga</p>
                <p className="text-xs text-muted-foreground">Sync manga reading progress</p>
              </div>
              <Switch checked={form.trackManga} onCheckedChange={(v) => update('trackManga', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sync Ratings</p>
                <p className="text-xs text-muted-foreground">Sync scores bidirectionally</p>
              </div>
              <Switch checked={form.syncRatings} onCheckedChange={(v) => update('syncRatings', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Watch History</p>
                <p className="text-xs text-muted-foreground">Import episode progress</p>
              </div>
              <Switch checked={form.syncWatchHistory} onCheckedChange={(v) => update('syncWatchHistory', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Reading Progress</p>
                <p className="text-xs text-muted-foreground">Import chapter progress</p>
              </div>
              <Switch checked={form.syncReadingProgress} onCheckedChange={(v) => update('syncReadingProgress', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Character Data</p>
                <p className="text-xs text-muted-foreground">Fetch character and staff info</p>
              </div>
              <Switch checked={form.fetchCharacterData} onCheckedChange={(v) => update('fetchCharacterData', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Seasonal Charts</p>
                <p className="text-xs text-muted-foreground">Sync seasonal anime charts</p>
              </div>
              <Switch checked={form.fetchSeasonalCharts} onCheckedChange={(v) => update('fetchSeasonalCharts', v)} />
            </div>
          </div>
          <Field>
            <FieldLabel>Default Score Format</FieldLabel>
            <select
              value={form.defaultScoreFormat}
              onChange={(e) => update('defaultScoreFormat', e.target.value as ProviderSettings['defaultScoreFormat'])}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="POINT_10">10 Point</option>
              <option value="POINT_10_DECIMAL">10 Point Decimal</option>
              <option value="POINT_100">100 Point</option>
              <option value="POINT_5">5 Point</option>
              <option value="POINT_3">3 Point (Smiley)</option>
              <option value="SMILEY">Smiley</option>
              <option value="TEXT">Text</option>
            </select>
          </Field>
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
              <p className="text-xs text-muted-foreground">Receive notifications from AniList</p>
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
  { value: 'lists', label: 'Lists', icon: Layers },
  { value: 'imports', label: 'Sync History', icon: Download },
  { value: 'jobs', label: 'Jobs', icon: Clock },
  { value: 'mappings', label: 'Mappings', icon: Link2 },
  { value: 'capabilities', label: 'Capabilities', icon: Zap },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function AniListProviderPage() {
  const data = anilistProviderData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="AniList"
        description="Configure and monitor your AniList integration. Track anime and manga, sync lists, and manage metadata mappings."
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
        <TabsContent value="lists">
          <ListsTab lists={data.lists} />
        </TabsContent>
        <TabsContent value="imports">
          <ImportsTab lists={data.lists} />
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
