'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  HardDrive,
  History,
  Info,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Timer,
  Zap,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
  logsData,
  type LogsData,
  type LogLevel,
  type LogSourceStatus,
  type AlertSeverity,
  type GlobalLogsStatus,
  type LogEntry,
  type LogSource,
  type LogActivityEvent,
} from '@/lib/logs-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function globalStatusTone(s: GlobalLogsStatus): StatusTone {
  return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'destructive'
}

function logLevelTone(s: LogLevel): StatusTone {
  return s === 'error' ? 'destructive' : s === 'warn' ? 'warning' : s === 'info' ? 'info' : s === 'debug' ? 'neutral' : 'neutral'
}

function logLevelColor(s: LogLevel) {
  return s === 'error' ? 'text-destructive' : s === 'warn' ? 'text-warning' : s === 'info' ? 'text-info' : s === 'debug' ? 'text-muted-foreground' : 'text-muted-foreground'
}

function sourceStatusTone(s: LogSourceStatus): StatusTone {
  return s === 'active' ? 'success' : s === 'inactive' ? 'neutral' : 'destructive'
}

function alertSeverityTone(s: AlertSeverity): StatusTone {
  return s === 'critical' ? 'destructive' : s === 'warning' ? 'warning' : 'info'
}

function activityIcon(type: LogActivityEvent['type']) {
  const map: Record<LogActivityEvent['type'], typeof Server> = {
    'source-added': Plus,
    'source-removed': XCircle,
    'alert-triggered': AlertTriangle,
    'pattern-detected': Search,
    'config-change': Settings,
    'retention-applied': Clock,
    'index-rebuilt': RefreshCw,
    'source-recovered': CheckCircle2,
  }
  return map[type] ?? Activity
}

function activityColor(type: LogActivityEvent['type']) {
  if (type === 'alert-triggered' || type === 'source-removed') return 'text-destructive'
  if (type === 'source-recovered' || type === 'index-rebuilt') return 'text-success'
  if (type === 'config-change') return 'text-primary'
  return 'text-muted-foreground'
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

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: LogsData }) {
  const { overview } = data

  const statCards = [
    { label: 'Logs/min', value: overview.logsPerMinute.toLocaleString(), sub: 'current rate', icon: Activity, color: 'text-primary' },
    { label: 'Sources', value: `${overview.activeSources}/${overview.totalSources}`, sub: 'active', icon: Database, color: overview.activeSources === overview.totalSources ? 'text-success' : 'text-warning' },
    { label: 'Error Rate', value: `${overview.errorRate}%`, sub: 'of total', icon: XCircle, color: overview.errorRate > 1 ? 'text-destructive' : 'text-success' },
    { label: 'Warn Rate', value: `${overview.warnRate}%`, sub: 'of total', icon: AlertTriangle, color: overview.warnRate > 5 ? 'text-warning' : 'text-foreground' },
    { label: 'Stored', value: `${overview.totalStoredGb} GB`, sub: `${overview.retentionDays}d retention`, icon: HardDrive, color: 'text-foreground' },
    { label: 'Query Latency', value: `${overview.avgQueryLatencyMs}ms`, sub: 'avg', icon: Timer, color: overview.avgQueryLatencyMs > 100 ? 'text-warning' : 'text-success' },
    { label: 'Active Alerts', value: overview.activeAlerts, sub: 'firing', icon: AlertTriangle, color: overview.activeAlerts > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Logs/hour', value: overview.logsPerHour.toLocaleString(), sub: 'throughput', icon: Zap, color: 'text-foreground' },
    { label: 'Uptime', value: overview.uptime, sub: 'cluster', icon: Clock, color: 'text-success' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className="size-3.5" />
                {s.label}
              </div>
              <p className={cn('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Log Volume (24h)</CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-red-500" />Error</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-500" />Warn</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />Info</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-px h-40">
              {data.analytics.map((point, i) => {
                const maxVal = Math.max(...data.analytics.map((d) => d.error + d.warn + d.info)) * 1.1
                const infoH = (point.info / maxVal) * 100
                const warnH = (point.warn / maxVal) * 100
                const errorH = (point.error / maxVal) * 100
                return (
                  <div key={i} className="flex flex-1 items-end gap-px" title={point.time}>
                    <div className="w-full relative" style={{ height: `${infoH + warnH + errorH}%` }}>
                      <div className="absolute bottom-0 w-full rounded-t bg-blue-500/60 transition-all hover:bg-blue-500" style={{ height: `${infoH / (infoH + warnH + errorH) * 100}%` }} />
                      <div className="absolute w-full bg-amber-500/60 transition-all hover:bg-amber-500" style={{ bottom: `${infoH / (infoH + warnH + errorH) * 100}%`, height: `${warnH / (infoH + warnH + errorH) * 100}%` }} />
                      <div className="absolute top-0 w-full rounded-t bg-red-500/60 transition-all hover:bg-red-500" style={{ height: `${errorH / (infoH + warnH + errorH) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Log Patterns</CardTitle>
            <Badge variant="outline" className="text-[10px]">{data.patterns.length} patterns</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.patterns.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', logLevelColor(p.level))} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono truncate">{p.pattern}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{p.count}</span>
                    </div>
                    <Progress value={p.percentage} className="h-1 mt-1" />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 w-12 text-right">{p.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              Error Logs (24h)
            </div>
            <p className="text-2xl font-bold tracking-tight text-destructive">
              {data.analytics.reduce((s, d) => s + d.error, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              Warn Logs (24h)
            </div>
            <p className="text-2xl font-bold tracking-tight text-warning">
              {data.analytics.reduce((s, d) => s + d.warn, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              Info Logs (24h)
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {data.analytics.reduce((s, d) => s + d.info, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              Debug Logs (24h)
            </div>
            <p className="text-2xl font-bold tracking-tight text-muted-foreground">
              {data.analytics.reduce((s, d) => s + d.debug, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Live Tail Tab                                                             */
/* -------------------------------------------------------------------------- */

function LiveTailTab({ entries }: { entries: LogEntry[] }) {
  const [levelFilter, setLevelFilter] = React.useState<LogLevel | 'all'>('all')
  const [search, setSearch] = React.useState('')

  const filtered = entries.filter((e) => {
    if (levelFilter !== 'all' && e.level !== levelFilter) return false
    if (search && !e.message.toLowerCase().includes(search.toLowerCase()) && !e.source.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter logs by message or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm font-mono"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'error', 'warn', 'info', 'debug', 'trace'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={cn(
                'rounded-md px-2 py-1 text-xs capitalize transition-colors font-medium',
                levelFilter === level ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y max-h-150 overflow-y-auto">
            {filtered.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-2 hover:bg-muted/50 font-mono text-xs">
                <span className="text-muted-foreground shrink-0 w-44">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span className={cn('shrink-0 w-14 font-semibold uppercase', logLevelColor(entry.level))}>
                  {entry.level}
                </span>
                <span className="shrink-0 w-32 text-muted-foreground truncate">
                  {entry.source}
                </span>
                <span className="flex-1 min-w-0">
                  {entry.message}
                  {entry.traceId && (
                    <span className="ml-2 text-muted-foreground">[{entry.traceId.slice(0, 12)}]</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Search Tab                                                                */
/* -------------------------------------------------------------------------- */

function SearchTab({ entries }: { entries: LogEntry[] }) {
  const [query, setQuery] = React.useState('')
  const [level, setLevel] = React.useState<LogLevel | 'all'>('all')
  const [source, setSource] = React.useState('all')
  const sources = [...new Set(entries.map((e) => e.source))]

  const results = entries.filter((e) => {
    if (level !== 'all' && e.level !== level) return false
    if (source !== 'all' && e.source !== source) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        e.message.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.service.toLowerCase().includes(q) ||
        (e.traceId && e.traceId.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs — supports text, traceId, service name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm font-mono"
              />
            </div>
            <Button onClick={() => toast.success(`Found ${results.length} results`)}>
              Search
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as LogLevel | 'all')}
              className="rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="trace">Trace</option>
            </select>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value="all">All Sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">{results.length} results</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y max-h-125 overflow-y-auto">
            {results.map((entry) => (
              <div key={entry.id} className="px-4 py-3 hover:bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-[10px] font-semibold uppercase', logLevelColor(entry.level))}>{entry.level}</span>
                  <span className="text-xs text-muted-foreground font-mono">{entry.source}</span>
                  <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                  {entry.traceId && (
                    <Badge variant="outline" className="text-[10px] font-mono">{entry.traceId.slice(0, 12)}</Badge>
                  )}
                </div>
                <p className="text-sm font-mono">{entry.message}</p>
                {entry.metadata && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(entry.metadata).map(([k, v]) => (
                      <span key={k} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sources Tab                                                               */
/* -------------------------------------------------------------------------- */

function SourcesTab({ sources }: { sources: LogSource[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Logs/min</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Last Ingested</TableHead>
              <TableHead>Retention</TableHead>
              <TableHead>Compressed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((src) => (
              <TableRow key={src.id}>
                <TableCell>
                  <div>
                    <p className="font-medium font-mono text-sm">{src.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-50">{src.path}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">{src.type}</Badge></TableCell>
                <TableCell>
                  <StatusBadge tone={sourceStatusTone(src.status)}>{src.status}</StatusBadge>
                </TableCell>
                <TableCell className="text-xs font-mono">{src.format}</TableCell>
                <TableCell className="text-sm">{src.logsPerMin.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={cn('text-sm font-medium', src.errorCount > 5 ? 'text-destructive' : src.errorCount > 0 ? 'text-warning' : 'text-foreground')}>
                    {src.errorCount}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(src.lastIngested)}</TableCell>
                <TableCell className="text-sm">{src.retentionDays}d</TableCell>
                <TableCell>
                  {src.compressionEnabled ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" />
                  )}
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
/*  Alerts Tab                                                                */
/* -------------------------------------------------------------------------- */

function AlertsTab({ alerts }: { alerts: LogsData['alerts'] }) {
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const filtered = statusFilter === 'all' ? alerts : alerts.filter((a) => a.status === statusFilter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {['all', 'active', 'acknowledged', 'resolved'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && (
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {alerts.filter((a) => a.status === s).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((alert) => (
          <Card key={alert.id} className={cn(alert.severity === 'critical' && 'border-destructive/50')}>
            <CardContent className="flex items-start gap-4 p-4">
              <div className={cn('mt-0.5', alert.severity === 'critical' ? 'text-destructive' : alert.severity === 'warning' ? 'text-warning' : 'text-info')}>
                {alert.severity === 'critical' ? <XCircle className="size-5" /> : alert.severity === 'warning' ? <AlertTriangle className="size-5" /> : <Info className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{alert.title}</h3>
                  <StatusBadge tone={alertSeverityTone(alert.severity)} className="text-[10px]">{alert.severity}</StatusBadge>
                  <Badge variant={alert.status === 'active' ? 'destructive' : alert.status === 'acknowledged' ? 'secondary' : 'outline'} className="text-[10px]">{alert.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Source: {alert.source}</span>
                  <span>&middot;</span>
                  <span>Triggered: {alert.triggerCount}x</span>
                  <span>&middot;</span>
                  <span>{timeAgo(alert.date)}</span>
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
/*  Analytics Tab                                                             */
/* -------------------------------------------------------------------------- */

function AnalyticsTab({ analytics }: { analytics: LogsData['analytics'] }) {
  const maxVal = Math.max(...analytics.map((d) => d.error + d.warn + d.info + d.debug))
  const totalErrors = analytics.reduce((s, d) => s + d.error, 0)
  const totalWarns = analytics.reduce((s, d) => s + d.warn, 0)
  const totalInfo = analytics.reduce((s, d) => s + d.info, 0)
  const totalDebug = analytics.reduce((s, d) => s + d.debug, 0)
  const totalAll = totalErrors + totalWarns + totalInfo + totalDebug

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Errors
            </div>
            <p className="text-2xl font-bold tracking-tight text-destructive">{totalErrors.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{((totalErrors / totalAll) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Warnings
            </div>
            <p className="text-2xl font-bold tracking-tight text-warning">{totalWarns.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{((totalWarns / totalAll) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Info
            </div>
            <p className="text-2xl font-bold tracking-tight">{totalInfo.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{((totalInfo / totalAll) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
              Debug
            </div>
            <p className="text-2xl font-bold tracking-tight text-muted-foreground">{totalDebug.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{((totalDebug / totalAll) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Log Volume by Hour</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Peak: {maxVal.toLocaleString()} / hour</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-px h-48">
            {analytics.map((point, i) => {
              const total = point.error + point.warn + point.info + point.debug
              const h = (total / maxVal) * 100
              return (
                <div key={i} className="flex-1 rounded-t bg-primary/60 transition-all hover:bg-primary relative group" style={{ height: `${h}%` }} title={`${point.time}: ${total.toLocaleString()} logs`}>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="rounded bg-foreground px-2 py-1 text-[10px] text-background whitespace-nowrap">
                      {point.time}: {total.toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Distribution by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'api-gateway', count: 340, pct: 38 },
                { name: 'streaming-engine', count: 180, pct: 20 },
                { name: 'encoding-worker', count: 150, pct: 17 },
                { name: 'media-scanner', count: 120, pct: 13 },
                { name: 'database-proxy', count: 80, pct: 9 },
                { name: 'kubernetes', count: 25, pct: 3 },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-32 truncate text-muted-foreground">{s.name}</span>
                  <div className="flex-1">
                    <Progress value={s.pct} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{s.count} ({s.pct}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-px h-32">
              {analytics.map((point, i) => {
                const total = point.error + point.warn + point.info + point.debug
                const errorPct = total > 0 ? (point.error / total) * 100 : 0
                return (
                  <div key={i} className="flex-1 rounded-t bg-destructive/60 transition-all hover:bg-destructive" style={{ height: `${errorPct * 5}%` }} title={`${point.time}: ${errorPct.toFixed(1)}%`} />
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Retention Tab                                                             */
/* -------------------------------------------------------------------------- */

function RetentionTab({ retention }: { retention: LogsData['retention'] }) {
  const totalSize = retention.reduce((s, r) => s + r.totalSizeGb, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="size-3.5" />
              Total Log Storage
            </div>
            <p className="text-2xl font-bold tracking-tight">{totalSize} GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="size-3.5" />
              Active Policies
            </div>
            <p className="text-2xl font-bold tracking-tight">{retention.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="size-3.5" />
              Compressed
            </div>
            <p className="text-2xl font-bold tracking-tight">{retention.filter((r) => r.compressed).length}/{retention.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Retention</TableHead>
                <TableHead>Archive After</TableHead>
                <TableHead>Compressed</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retention.map((rp) => (
                <TableRow key={rp.id}>
                  <TableCell className="font-medium">{rp.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{rp.source}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn('text-[10px]', logLevelColor(rp.level))}>{rp.level}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{rp.retentionDays} days</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rp.archiveAfterDays} days</TableCell>
                  <TableCell>
                    {rp.compressed ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{rp.totalSizeGb} GB</TableCell>
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
/*  Activity Tab                                                              */
/* -------------------------------------------------------------------------- */

function ActivityTab({ activities }: { activities: LogActivityEvent[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.map((act) => {
            const Icon = activityIcon(act.type)
            const color = activityColor(act.type)
            return (
              <div key={act.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50">
                <div className={cn('mt-0.5', color)}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{act.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{act.source}</span>
                    <span className="text-xs text-muted-foreground">&middot;</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(act.timestamp)}</span>
                  </div>
                  {act.details && (
                    <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">{act.details}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

const TABS = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'live', label: 'Live Tail', icon: Activity },
  { value: 'search', label: 'Search', icon: Search },
  { value: 'sources', label: 'Sources', icon: Database },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'retention', label: 'Retention', icon: HardDrive },
  { value: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { value: 'activity', label: 'Activity', icon: History },
] as const

export default function LogsPage() {
  const data = logsData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Logs"
        description="Centralized log management — search, tail, and analyze logs across all services."
      >
        <StatusBadge tone={globalStatusTone(data.overview.globalStatus)} pulse={data.overview.globalStatus !== 'healthy'}>
          {data.overview.globalStatus}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">Heartbeat: {timeAgo(data.overview.lastHeartbeat)}</span>
        <Button variant="outline" size="sm" onClick={() => toast.success('Refreshed')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Refresh
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
        <TabsContent value="live">
          <LiveTailTab entries={data.entries} />
        </TabsContent>
        <TabsContent value="search">
          <SearchTab entries={data.entries} />
        </TabsContent>
        <TabsContent value="sources">
          <SourcesTab sources={data.sources} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab analytics={data.analytics} />
        </TabsContent>
        <TabsContent value="retention">
          <RetentionTab retention={data.retention} />
        </TabsContent>
        <TabsContent value="alerts">
          <AlertsTab alerts={data.alerts} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab activities={data.activities} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
