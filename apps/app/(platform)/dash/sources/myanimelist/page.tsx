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
  HardDrive,
  Info,
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
  malProviderData,
  type MalProviderData,
  type MediaCategory,
  type SyncJob,
  type MediaMapping,
  type ProviderCapability,
  type ProviderLog,
  type ProviderSettings,
  type ProviderStatus,
  type JobStatus,
  type JobType,
  type LogLevel,
  type MediaType,
  type AnimeStatus,
} from '@/lib/mal-provider-data'
import { myanimelistApi } from '@/lib/api/myanimelist'
import { ApiError } from '@/lib/api/errors'

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code ? `${err.code}: ${err.message}` : err.message
  }
  return err instanceof Error ? err.message : 'Unknown error'
}

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
  if (type === 'anime') return <Tv className="size-4" />
  return <FileText className="size-4" />
}

function animeStatusBadge(status: AnimeStatus) {
  const map: Record<AnimeStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    airing: { label: 'Airing', variant: 'default' },
    complete: { label: 'Complete', variant: 'secondary' },
    upcoming: { label: 'Upcoming', variant: 'outline' },
    hiatus: { label: 'Hiatus', variant: 'destructive' },
  }
  const s = map[status]
  return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
}

function matchScoreBadge(score: number) {
  if (score >= 95) return <Badge variant="outline" className="border-success/50 text-success">{score}%</Badge>
  if (score >= 80) return <Badge variant="outline" className="border-warning/50 text-warning">{score}%</Badge>
  return <Badge variant="outline" className="border-destructive/50 text-destructive">{score}%</Badge>
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data, onTest, onSync }: { data: MalProviderData; onTest: () => void; onSync: () => void }) {
  const { provider, stats } = data
  const cachePercent = Math.round((parseFloat(stats.cacheSize) / parseFloat(stats.cacheTotalSize)) * 100)
  const apiPercent = Math.round((stats.apiCallsToday / stats.apiCallsLimit) * 100)

  const statCards = [
    { label: 'Total Anime', value: stats.totalAnime.toLocaleString(), sub: 'entries indexed', icon: Tv },
    { label: 'Total Manga', value: stats.totalManga.toLocaleString(), sub: 'entries indexed', icon: FileText },
    { label: 'Airing', value: stats.airingAnime.toLocaleString(), sub: 'currently airing', icon: Activity },
    { label: 'Cached', value: stats.cachedEntries.toLocaleString(), sub: `of ${(stats.totalAnime + stats.totalManga).toLocaleString()}`, icon: Database },
    { label: 'API Calls', value: stats.apiCallsToday.toLocaleString(), sub: `of ${stats.apiCallsLimit.toLocaleString()} today`, icon: Activity },
    { label: 'Last Sync', value: stats.lastSyncDuration, sub: `${stats.syncErrors} error${stats.syncErrors !== 1 ? 's' : ''}`, icon: RefreshCw },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Tv className="size-6 text-primary" />
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
              {provider.version} &middot; {provider.apiUrl} &middot; {provider.mediaCount.toLocaleString()} entries &middot; Avg {stats.averageResponseMs}ms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onTest}>
              <Link2 className="mr-1.5 size-3.5" />
              Test Connection
            </Button>
            <Button size="sm" onClick={onSync}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Sync Now
            </Button>
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
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-sm font-semibold">{stats.averageResponseMs}ms</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Bandwidth Saved</p>
                <p className="text-sm font-semibold">{stats.bandwidthSaved}</p>
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
            <CardTitle className="text-sm font-medium">Cache Usage</CardTitle>
            <HardDrive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{stats.cacheSize}</span>
              <span className="text-sm text-muted-foreground">of {stats.cacheTotalSize}</span>
            </div>
            <Progress value={cachePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">{cachePercent}% utilized &middot; {stats.cachedEntries.toLocaleString()} entries cached</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Categories Tab                                                            */
/* -------------------------------------------------------------------------- */

function CategoriesTab({ categories, onSync }: { categories: MediaCategory[]; onSync: (type: string) => void }) {
  const [enabledMap, setEnabledMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.id, c.enabled])),
  )
  const [autoSyncMap, setAutoSyncMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.id, c.autoSync])),
  )

  function toggleEnabled(id: string) {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Category setting updated')
  }

  function toggleAutoSync(id: string) {
    setAutoSyncMap((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Auto-sync setting updated')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} media categories &middot; {categories.filter((c) => enabledMap[c.id]).length} active</p>
        <Button size="sm" variant="outline" onClick={() => onSync('all')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Sync All
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {categories.map((cat) => (
          <Card key={cat.id} className={cn(!enabledMap[cat.id] && 'opacity-60')}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    {mediaTypeIcon(cat.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{cat.label}</h3>
                      <Badge variant="secondary" className="text-[10px] capitalize">{cat.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cat.count.toLocaleString()} entries
                      {cat.season && <> &middot; {cat.season}</>}
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => onSync(cat.type)}>
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Enabled</Label>
                  <Switch checked={enabledMap[cat.id]} onCheckedChange={() => toggleEnabled(cat.id)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Auto-sync</Label>
                  <Switch checked={autoSyncMap[cat.id]} onCheckedChange={() => toggleAutoSync(cat.id)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">Synced</span>
                  {cat.syncedCount.toLocaleString()} / {cat.count.toLocaleString()}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Sync %</span>
                  {cat.count > 0 ? Math.round((cat.syncedCount / cat.count) * 100) : 0}%
                </div>
                <div>
                  <span className="block font-medium text-foreground">Last Synced</span>
                  {timeAgo(cat.lastSyncedAt)}
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

function ImportsTab({ categories, onSync }: { categories: MediaCategory[]; onSync: (type: string) => void }) {
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
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Synced</TableHead>
                <TableHead>Sync Rate</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(cat.type)}
                      <span className="capitalize text-xs">{cat.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cat.count.toLocaleString()}</TableCell>
                  <TableCell>{cat.syncedCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={cat.count > 0 && cat.syncedCount / cat.count > 0.95 ? 'outline' : 'secondary'} className="text-[10px]">
                      {cat.count > 0 ? Math.round((cat.syncedCount / cat.count) * 100) : 0}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{timeAgo(cat.lastSyncedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onSync(cat.type)}>
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
                <p className="text-xs text-muted-foreground">Automatically sync new anime/manga</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Seasonal Sync</p>
                <p className="text-xs text-muted-foreground">Sync seasonal anime lineups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Include NSFW</p>
                <p className="text-xs text-muted-foreground">Fetch adult-rated content</p>
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

function JobsTab({ jobs }: { jobs: SyncJob[] }) {
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const filtered = typeFilter === 'all' ? jobs : jobs.filter((j) => j.type === typeFilter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'anime-sync', 'manga-sync', 'character-fetch', 'review-fetch', 'seasonal-sync', 'cleanup'].map((t) => (
          <Button key={t} size="sm" variant={typeFilter === t ? 'default' : 'outline'} onClick={() => setTypeFilter(t)}>
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
                    {job.type === 'anime-sync' && <Tv className="size-4" />}
                    {job.type === 'manga-sync' && <FileText className="size-4" />}
                    {job.type === 'character-fetch' && <Star className="size-4" />}
                    {job.type === 'review-fetch' && <Eye className="size-4" />}
                    {job.type === 'seasonal-sync' && <RefreshCw className="size-4" />}
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
                      {job.category ?? 'All'} &middot; Triggered by {job.triggeredBy} &middot; {timeAgo(job.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {job.duration && <p className="text-xs text-muted-foreground">{job.duration}</p>}
                  {job.errors > 0 && <p className="text-xs text-destructive">{job.errors} error{job.errors > 1 ? 's' : ''}</p>}
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
    ? mappings.filter((m) => m.kamiTitle.toLowerCase().includes(search.toLowerCase()) || m.malId.toLowerCase().includes(search.toLowerCase()) || m.kamiId.toLowerCase().includes(search.toLowerCase()))
    : mappings

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search mappings..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Button size="sm" variant="outline" onClick={() => toast.info('Scan for new anime/manga...')}>
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
                <TableHead>MyAnimeList</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>External IDs</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Score</TableHead>
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
                      <p className="font-medium text-xs font-mono">{m.malId}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.malType.replace('_', ' ')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeIcon(m.mediaType)}
                      <Badge variant="secondary" className="text-[10px] capitalize">{m.mediaType}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{animeStatusBadge(m.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.externalIds.tmdb && <Badge variant="outline" className="text-[10px]">TMDB: {m.externalIds.tmdb}</Badge>}
                      {m.externalIds.anilist && <Badge variant="outline" className="text-[10px]">AL: {m.externalIds.anilist}</Badge>}
                      {m.externalIds.kitsu && <Badge variant="outline" className="text-[10px]">Kitsu: {m.externalIds.kitsu}</Badge>}
                      {m.externalIds.anidb && <Badge variant="outline" className="text-[10px]">AniDB: {m.externalIds.anidb}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{matchScoreBadge(m.matchScore)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-warning fill-warning" />
                      <span className="text-sm font-medium">{m.score.toFixed(2)}</span>
                    </div>
                  </TableCell>
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

function SettingsTab({ settings, onSave }: { settings: ProviderSettings; onSave: (settings: ProviderSettings) => void }) {
  const [form, setForm] = React.useState(settings)
  function update<K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">API Connection</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>API Key</FieldLabel>
              <Input type="password" value={form.apiKey} onChange={(e) => update('apiKey', e.target.value)} placeholder="Your MAL API key" />
            </Field>
            <Field>
              <FieldLabel>API URL</FieldLabel>
              <Input value={form.apiUrl} onChange={(e) => update('apiUrl', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Timeout (seconds)</FieldLabel>
              <Input type="number" value={form.timeout} onChange={(e) => update('timeout', parseInt(e.target.value) || 15)} />
            </Field>
            <Field>
              <FieldLabel>Rate Limit (req/s)</FieldLabel>
              <Input type="number" value={form.rateLimitPerSecond} onChange={(e) => update('rateLimitPerSecond', parseInt(e.target.value) || 3)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Cache</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Cache Enabled</p>
                <p className="text-xs text-muted-foreground">Cache entries locally to reduce API calls</p>
              </div>
              <Switch checked={form.cacheEnabled} onCheckedChange={(v) => update('cacheEnabled', v)} />
            </div>
            <Field>
              <FieldLabel>Cache TTL (hours)</FieldLabel>
              <Input type="number" value={form.cacheTtlHours} onChange={(e) => update('cacheTtlHours', parseInt(e.target.value) || 48)} disabled={!form.cacheEnabled} />
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
                <p className="text-xs text-muted-foreground">Automatically retry failed requests</p>
              </div>
              <Switch checked={form.retryOnFail} onCheckedChange={(v) => update('retryOnFail', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Data Fetching</CardTitle></CardHeader>
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
              <Input type="number" value={form.syncInterval} onChange={(e) => update('syncInterval', parseInt(e.target.value) || 3600)} disabled={!form.autoSync} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Fetch Characters</p>
                <p className="text-xs text-muted-foreground">Sync character data</p>
              </div>
              <Switch checked={form.fetchCharacters} onCheckedChange={(v) => update('fetchCharacters', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Fetch Reviews</p>
                <p className="text-xs text-muted-foreground">Sync user reviews</p>
              </div>
              <Switch checked={form.fetchReviews} onCheckedChange={(v) => update('fetchReviews', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Fetch Recommendations</p>
                <p className="text-xs text-muted-foreground">Sync similar titles</p>
              </div>
              <Switch checked={form.fetchRecommendations} onCheckedChange={(v) => update('fetchRecommendations', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Include Manga</p>
                <p className="text-xs text-muted-foreground">Sync manga entries</p>
              </div>
              <Switch checked={form.includeManga} onCheckedChange={(v) => update('includeManga', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Seasonal Sync</p>
                <p className="text-xs text-muted-foreground">Sync seasonal anime lineups</p>
              </div>
              <Switch checked={form.seasonalSync} onCheckedChange={(v) => update('seasonalSync', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Webhooks</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Webhook Enabled</p>
              <p className="text-xs text-muted-foreground">Receive notifications on updates</p>
            </div>
            <Switch checked={form.webhookEnabled} onCheckedChange={(v) => update('webhookEnabled', v)} />
          </div>
          <Field>
            <FieldLabel>Webhook URL</FieldLabel>
            <Input value={form.webhookUrl} onChange={(e) => update('webhookUrl', e.target.value)} disabled={!form.webhookEnabled} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Sync Notifications</p>
              <p className="text-xs text-muted-foreground">Notify on sync completion or errors</p>
            </div>
            <Switch checked={form.notificationsEnabled} onCheckedChange={(v) => update('notificationsEnabled', v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm(settings)}>Reset</Button>
        <Button onClick={() => onSave(form)}>
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
  { value: 'categories', label: 'Categories', icon: Tv },
  { value: 'imports', label: 'Imports', icon: Download },
  { value: 'jobs', label: 'Jobs', icon: Clock },
  { value: 'mappings', label: 'Mappings', icon: Link2 },
  { value: 'capabilities', label: 'Capabilities', icon: Zap },
  { value: 'logs', label: 'Logs', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function MalProviderPage() {
  const [data, setData] = React.useState<MalProviderData>(malProviderData)
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')

  const load = React.useCallback(async () => {
    try {
      const snapshot = await myanimelistApi.getSnapshot()
      setData(snapshot)
      setStatus('ready')
    } catch (error) {
      setData(malProviderData)
      setStatus('error')
      toast.error(`Could not load MyAnimeList data: ${formatError(error)}`)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleTest = React.useCallback(async () => {
    try {
      const result = await myanimelistApi.testConnection()
      toast.success(`Connection OK — ${result.latencyMs}ms latency`)
      load()
    } catch (error) {
      toast.error(`Connection failed: ${formatError(error)}`)
    }
  }, [load])

  const handleSync = React.useCallback(
    async (jobType: JobType = 'anime-sync') => {
      try {
        const job = await myanimelistApi.runSync(jobType, 'manual')
        toast.success(`${job.type} sync started`)
        load()
      } catch (error) {
        toast.error(`Sync failed: ${formatError(error)}`)
      }
    },
    [load],
  )

  const handleSyncCategory = React.useCallback(
    (type: string) => {
      if (type === 'manga') handleSync('manga-sync')
      else if (type === 'anime') handleSync('anime-sync')
      else handleSync('seasonal-sync')
    },
    [handleSync],
  )

  const handleSave = React.useCallback(
    async (settings: ProviderSettings) => {
      try {
        await myanimelistApi.saveSettings(settings)
        toast.success('Settings saved')
        load()
      } catch (error) {
        toast.error(`Failed to save settings: ${formatError(error)}`)
      }
    },
    [load],
  )

  if (status === 'loading') {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="MyAnimeList"
        description="Configure and monitor your MAL integration. Sync anime, manga, characters, and seasonal data for your library."
      >
        <Button variant="outline" size="sm" onClick={handleTest}>
          <Link2 className="mr-1.5 size-3.5" />
          Test Connection
        </Button>
        <Button size="sm" onClick={() => handleSync('anime-sync')}>
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

        <TabsContent value="overview"><OverviewTab data={data} onTest={handleTest} onSync={() => handleSync('anime-sync')} /></TabsContent>
        <TabsContent value="categories"><CategoriesTab categories={data.categories} onSync={handleSyncCategory} /></TabsContent>
        <TabsContent value="imports"><ImportsTab categories={data.categories} onSync={handleSyncCategory} /></TabsContent>
        <TabsContent value="jobs"><JobsTab jobs={data.jobs} /></TabsContent>
        <TabsContent value="mappings"><MappingsTab mappings={data.mappings} /></TabsContent>
        <TabsContent value="capabilities"><CapabilitiesTab capabilities={data.capabilities} /></TabsContent>
        <TabsContent value="logs"><LogsTab logs={data.logs} /></TabsContent>
        <TabsContent value="settings"><SettingsTab settings={data.settings} onSave={handleSave} /></TabsContent>
      </Tabs>
    </main>
  )
}
