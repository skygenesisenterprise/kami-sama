'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Globe,
  Gauge,
  History,
  Info,
  Link2,
  Radio,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Target,
  Timer,
  TrendingUp,
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
  monitoringData,
  type MonitoringData,
  type Probe,
  type ProbeType,
  type ProbeStatus,
  type UptimeEntry,
  type SLO,
  type SloStatus,
  type SyntheticTest,
  type SyntheticStatus,
  type MonitoringAlert,
  type AlertSeverity,
  type MonitoringActivityEvent,
  type GlobalMonitoringStatus,
  type MetricPoint,
} from '@/lib/monitoring-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function globalStatusTone(s: GlobalMonitoringStatus): StatusTone {
  return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'destructive'
}

function probeStatusTone(s: ProbeStatus): StatusTone {
  return s === 'up' ? 'success' : s === 'degraded' ? 'warning' : s === 'down' ? 'destructive' : 'neutral'
}

function probeTypeIcon(t: ProbeType) {
  const map: Record<ProbeType, typeof Server> = {
    http: Globe,
    tcp: Link2,
    dns: Globe,
    icmp: Radio,
    grpc: Radio,
  }
  return map[t] ?? Globe
}

function sloStatusTone(s: SloStatus): StatusTone {
  return s === 'met' ? 'success' : s === 'at_risk' ? 'warning' : 'destructive'
}

function syntheticStatusTone(s: SyntheticStatus): StatusTone {
  return s === 'passed' ? 'success' : s === 'failed' ? 'destructive' : 'info'
}

function alertSeverityTone(s: AlertSeverity): StatusTone {
  return s === 'critical' ? 'destructive' : s === 'warning' ? 'warning' : 'info'
}

function activityIcon(type: MonitoringActivityEvent['type']) {
  const map: Record<MonitoringActivityEvent['type'], typeof Server> = {
    'probe-down': XCircle,
    'probe-up': CheckCircle2,
    'probe-degraded': AlertTriangle,
    'alert-triggered': AlertTriangle,
    'slo-breach': Shield,
    'config-change': Settings,
    'synthetic-failed': XCircle,
    'synthetic-recovered': CheckCircle2,
  }
  return map[type] ?? Activity
}

function activityColor(type: MonitoringActivityEvent['type']) {
  if (type === 'probe-down' || type === 'synthetic-failed' || type === 'slo-breach' || type === 'alert-triggered') return 'text-destructive'
  if (type === 'probe-up' || type === 'probe-degraded' || type === 'synthetic-recovered') return 'text-success'
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

function OverviewTab({ data }: { data: MonitoringData }) {
  const { overview } = data

  const statCards = [
    { label: 'Endpoints', value: overview.monitoredEndpoints, sub: 'monitored', icon: Target, color: 'text-foreground' },
    { label: 'Uptime', value: `${overview.uptimePercent}%`, sub: '30d average', icon: TrendingUp, color: overview.uptimePercent >= 99.9 ? 'text-success' : overview.uptimePercent >= 99.5 ? 'text-warning' : 'text-destructive' },
    { label: 'Avg Response', value: `${overview.avgResponseTimeMs}ms`, sub: 'P50 latency', icon: Timer, color: 'text-foreground' },
    { label: 'P99 Latency', value: `${overview.p99ResponseTimeMs}ms`, sub: 'tail latency', icon: Gauge, color: overview.p99ResponseTimeMs > 500 ? 'text-destructive' : overview.p99ResponseTimeMs > 200 ? 'text-warning' : 'text-foreground' },
    { label: 'Checks 24h', value: overview.totalChecks24h.toLocaleString(), sub: `${overview.failedChecks24h} failed`, icon: Activity, color: overview.failedChecks24h > 0 ? 'text-warning' : 'text-success' },
    { label: 'Active Alerts', value: overview.activeAlerts, sub: 'unresolved', icon: AlertTriangle, color: overview.activeAlerts > 0 ? 'text-destructive' : 'text-success' },
    { label: 'SLO Compliance', value: `${overview.sloCompliance}%`, sub: 'overall', icon: Shield, color: overview.sloCompliance >= 99.9 ? 'text-success' : overview.sloCompliance >= 99.5 ? 'text-warning' : 'text-destructive' },
    { label: 'Cluster Uptime', value: overview.uptime, sub: 'since restart', icon: Clock, color: 'text-success' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 lg:grid-cols-8">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probe Health</CardTitle>
            <Radio className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.upProbes}/{overview.totalProbes}</span>
              <span className="text-sm text-muted-foreground">probes up</span>
            </div>
            <Progress value={(overview.upProbes / overview.totalProbes) * 100} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-success/10 p-2">
                <p className="text-xs text-success font-medium">Up</p>
                <p className="text-sm font-semibold">{overview.upProbes}</p>
              </div>
              <div className="rounded-md bg-warning/10 p-2">
                <p className="text-xs text-warning font-medium">Degraded</p>
                <p className="text-sm font-semibold">{overview.degradedProbes}</p>
              </div>
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-xs text-destructive font-medium">Down</p>
                <p className="text-sm font-semibold">{overview.downProbes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Latency</CardTitle>
            <Timer className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.avgResponseTimeMs}ms</span>
              <span className="text-sm text-muted-foreground">P50 average</span>
            </div>
            <Progress value={Math.min((overview.avgResponseTimeMs / 500) * 100, 100)} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">P50</p>
                <p className="text-sm font-semibold">{overview.avgResponseTimeMs}ms</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">P99</p>
                <p className="text-sm font-semibold">{overview.p99ResponseTimeMs}ms</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">SLO</p>
                <p className={cn('text-sm font-semibold', overview.sloCompliance >= 99.9 ? 'text-success' : 'text-warning')}>
                  {overview.sloCompliance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Check Summary</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.totalChecks24h.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">total checks</span>
            </div>
            <Progress value={((overview.totalChecks24h - overview.failedChecks24h) / overview.totalChecks24h) * 100} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-success/10 p-2">
                <p className="text-xs text-success font-medium">Passed</p>
                <p className="text-sm font-semibold">{(overview.totalChecks24h - overview.failedChecks24h).toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-xs text-destructive font-medium">Failed</p>
                <p className="text-sm font-semibold">{overview.failedChecks24h}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Pass Rate</p>
                <p className="text-sm font-semibold">{((overview.totalChecks24h - overview.failedChecks24h) / overview.totalChecks24h * 100).toFixed(3)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Probes Tab                                                                */
/* -------------------------------------------------------------------------- */

function ProbesTab({ probes }: { probes: Probe[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {probes.map((probe) => {
        const TypeIcon = probeTypeIcon(probe.type)
        return (
          <Card key={probe.id} className={cn(probe.status === 'down' && 'border-destructive/50')}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <TypeIcon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{probe.name}</h3>
                      <StatusBadge tone={probeStatusTone(probe.status)} pulse={probe.status === 'down'}>
                        {probe.status}
                      </StatusBadge>
                      <Badge variant="secondary" className="text-[10px] uppercase">{probe.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{probe.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-2xl font-bold tracking-tight', probe.responseTimeMs > 200 ? 'text-destructive' : probe.responseTimeMs > 100 ? 'text-warning' : 'text-success')}>
                    {probe.responseTimeMs}ms
                  </p>
                  <p className="text-xs text-muted-foreground">response</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Region</p>
                  <p className="font-semibold">{probe.region}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Interval</p>
                  <p className="font-semibold">{probe.interval}s</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Uptime</p>
                  <p className={cn('font-semibold', probe.uptimePercent >= 99.9 ? 'text-success' : probe.uptimePercent >= 99.0 ? 'text-warning' : 'text-destructive')}>
                    {probe.uptimePercent}%
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold">{probe.statusCode ?? 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Checked: {timeAgo(probe.lastChecked)}</span>
                <span>Tags: {probe.tags.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Uptime Tab                                                                */
/* -------------------------------------------------------------------------- */

function UptimeTab({ entries }: { entries: UptimeEntry[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>30d Uptime</TableHead>
              <TableHead>24h Uptime</TableHead>
              <TableHead>30d Downtime</TableHead>
              <TableHead>Avg Latency</TableHead>
              <TableHead>P99 Latency</TableHead>
              <TableHead>Incidents</TableHead>
              <TableHead>Last Incident</TableHead>
              <TableHead>Regions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{entry.service}</p>
                    <p className="text-xs text-muted-foreground font-mono">{entry.url}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn('size-2 rounded-full', entry.uptime30d >= 99.95 ? 'bg-success' : entry.uptime30d >= 99.0 ? 'bg-warning' : 'bg-destructive')} />
                    <span className={cn('text-sm font-medium', entry.uptime30d >= 99.95 ? 'text-success' : entry.uptime30d >= 99.0 ? 'text-warning' : 'text-destructive')}>
                      {entry.uptime30d}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{entry.uptime24h}%</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.downtime30dMins}m</TableCell>
                <TableCell className="text-sm">{entry.avgResponseMs}ms</TableCell>
                <TableCell className="text-sm">{entry.p99ResponseMs}ms</TableCell>
                <TableCell>
                  <Badge variant={entry.totalIncidents30d === 0 ? 'outline' : 'secondary'} className={cn('text-[10px]', entry.totalIncidents30d > 2 && 'border-destructive/50 text-destructive')}>
                    {entry.totalIncidents30d}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.lastIncident ? timeAgo(entry.lastIncident) : 'None'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {entry.regions.map((r) => (
                      <Badge key={r} variant="secondary" className="text-[10px] font-mono">{r}</Badge>
                    ))}
                  </div>
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
/*  Metrics Tab                                                               */
/* -------------------------------------------------------------------------- */

function MetricsTab({ metrics }: { metrics: MetricPoint[] }) {
  const maxRT = Math.max(...metrics.map((m) => m.responseTime))
  const maxTP = Math.max(...metrics.map((m) => m.throughput))

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time (24h)</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Peak: {maxRT}ms</span>
            <span>&middot;</span>
            <span>Avg: {Math.round(metrics.reduce((a, m) => a + m.responseTime, 0) / metrics.length)}ms</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/60 transition-all hover:bg-primary"
                style={{ height: `${(m.responseTime / maxRT) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate (24h)</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Peak: {Math.max(...metrics.map((m) => m.errorRate)).toFixed(2)}%</span>
            <span>&middot;</span>
            <span>Avg: {(metrics.reduce((a, m) => a + m.errorRate, 0) / metrics.length).toFixed(2)}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-destructive/60 transition-all hover:bg-destructive"
                style={{ height: `${(m.errorRate / 0.1) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Throughput (24h)</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Peak: {maxTP.toLocaleString()} req/s</span>
            <span>&middot;</span>
            <span>Avg: {Math.round(metrics.reduce((a, m) => a + m.throughput, 0) / metrics.length).toLocaleString()} req/s</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-success/60 transition-all hover:bg-success"
                style={{ height: `${(m.throughput / maxTP) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SLOs Tab                                                                  */
/* -------------------------------------------------------------------------- */

function SLOsTab({ slos }: { slos: SLO[] }) {
  return (
    <div className="flex flex-col gap-4">
      {slos.map((slo) => (
        <Card key={slo.id} className={cn(slo.status === 'breached' && 'border-destructive/50')}>
          <CardContent className="flex items-center gap-6 p-5">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <Shield className={cn('size-6', slo.status === 'met' ? 'text-success' : slo.status === 'at_risk' ? 'text-warning' : 'text-destructive')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{slo.name}</h3>
                <StatusBadge tone={sloStatusTone(slo.status)}>{slo.status === 'at_risk' ? 'at risk' : slo.status}</StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground">{slo.service} &middot; {slo.window} window</p>
            </div>
            <div className="text-right">
              <p className={cn('text-2xl font-bold tracking-tight', slo.status === 'met' ? 'text-success' : slo.status === 'at_risk' ? 'text-warning' : 'text-destructive')}>
                {slo.current}%
              </p>
              <p className="text-xs text-muted-foreground">of {slo.target}%</p>
            </div>
            <div className="w-48">
              <Progress
                value={slo.current}
                className={cn('h-2', slo.status === 'breached' && '[&>div]:bg-destructive')}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {slo.status === 'breached' ? 'Budget exhausted' : `${slo.errorBudgetRemaining}% budget remaining`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {slo.lastBreached ? `Last breach: ${timeAgo(slo.lastBreached)}` : 'No breaches'}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Synthetics Tab                                                            */
/* -------------------------------------------------------------------------- */

function SyntheticsTab({ tests }: { tests: SyntheticTest[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {tests.map((test) => (
        <Card key={test.id} className={cn(test.status === 'failed' && 'border-destructive/50')}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Target className={cn('size-5', test.status === 'passed' ? 'text-success' : test.status === 'failed' ? 'text-destructive' : 'text-info')} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{test.name}</h3>
                    <StatusBadge tone={syntheticStatusTone(test.status)}>{test.status}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{test.url}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Duration</p>
                <p className="font-semibold">{test.durationMs}ms</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Steps</p>
                <p className={cn('font-semibold', test.stepsPassed === test.steps ? 'text-success' : 'text-destructive')}>
                  {test.stepsPassed}/{test.steps}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Region</p>
                <p className="font-semibold">{test.region}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Interval</p>
                <p className="font-semibold">{test.interval}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last run: {timeAgo(test.lastRun)}</span>
              {test.stepsPassed < test.steps && (
                <Badge variant="destructive" className="text-[10px]">{test.steps - test.stepsPassed} step failed</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Alerts Tab                                                                */
/* -------------------------------------------------------------------------- */

function AlertsTab({ alerts }: { alerts: MonitoringAlert[] }) {
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
/*  Activity Tab                                                              */
/* -------------------------------------------------------------------------- */

function ActivityTab({ activities }: { activities: MonitoringActivityEvent[] }) {
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
  { value: 'probes', label: 'Probes', icon: Radio },
  { value: 'uptime', label: 'Uptime', icon: TrendingUp },
  { value: 'metrics', label: 'Metrics', icon: Gauge },
  { value: 'slos', label: 'SLOs', icon: Shield },
  { value: 'synthetics', label: 'Synthetics', icon: Target },
  { value: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { value: 'activity', label: 'Activity', icon: History },
] as const

export default function MonitoringPage() {
  const data = monitoringData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Monitoring"
        description="Global observability across all services. Probes, uptime, latency metrics, SLAs, and synthetic tests."
      >
        <StatusBadge tone={globalStatusTone(data.overview.globalStatus)} pulse={data.overview.globalStatus !== 'healthy'}>
          {data.overview.globalStatus}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">Last heartbeat: {timeAgo(data.overview.lastHeartbeat)}</span>
        <Button variant="outline" size="sm" onClick={() => toast.success('All probes refreshed')}>
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
        <TabsContent value="probes">
          <ProbesTab probes={data.probes} />
        </TabsContent>
        <TabsContent value="uptime">
          <UptimeTab entries={data.uptime} />
        </TabsContent>
        <TabsContent value="metrics">
          <MetricsTab metrics={data.metrics} />
        </TabsContent>
        <TabsContent value="slos">
          <SLOsTab slos={data.slos} />
        </TabsContent>
        <TabsContent value="synthetics">
          <SyntheticsTab tests={data.synthetics} />
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
