'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  FileKey,
  Globe,
  Heart,
  History,
  Info,
  Link2,
  Radio,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  Timer,
  XCircle,
  TrendingUp,
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
  healthChecksData,
  type HealthChecksData,
  type HealthCheck,
  type CheckType,
  type CheckStatus,
  type Endpoint,
  type SSLCert,
  type CertStatus,
  type Dependency,
  type DependencyStatus,
  type HistoryEntry,
  type HealthAlert,
  type HealthActivityEvent,
  type GlobalHealth,
} from '@/lib/health-checks-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function globalHealthTone(s: GlobalHealth): StatusTone {
  return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'destructive'
}

function checkStatusTone(s: CheckStatus): StatusTone {
  return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : s === 'down' ? 'destructive' : 'neutral'
}

function certStatusTone(s: CertStatus): StatusTone {
  return s === 'valid' ? 'success' : s === 'expiring_soon' ? 'warning' : 'destructive'
}

function depStatusTone(s: DependencyStatus): StatusTone {
  return s === 'operational' ? 'success' : s === 'degraded' ? 'warning' : 'destructive'
}

function alertSeverityTone(s: 'critical' | 'warning' | 'info'): StatusTone {
  return s === 'critical' ? 'destructive' : s === 'warning' ? 'warning' : 'info'
}

function checkTypeIcon(t: CheckType) {
  const map: Record<CheckType, typeof Server> = {
    http: Globe,
    tcp: Link2,
    dns: Globe,
    icmp: Radio,
    grpc: Radio,
    database: Server,
  }
  return map[t] ?? Globe
}

function activityIcon(type: HealthActivityEvent['type']) {
  const map: Record<HealthActivityEvent['type'], typeof Server> = {
    'check-down': XCircle,
    'check-recovered': CheckCircle2,
    'check-degraded': AlertTriangle,
    'cert-expiring': FileKey,
    'dependency-down': XCircle,
    'dependency-recovered': CheckCircle2,
    'config-change': Shield,
    'alert-triggered': AlertTriangle,
  }
  return map[type] ?? Activity
}

function activityColor(type: HealthActivityEvent['type']) {
  if (type === 'check-down' || type === 'dependency-down' || type === 'alert-triggered' || type === 'cert-expiring') return 'text-destructive'
  if (type === 'check-recovered' || type === 'check-degraded' || type === 'dependency-recovered') return 'text-success'
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

function OverviewTab({ data }: { data: HealthChecksData }) {
  const { overview } = data

  const statCards = [
    { label: 'Endpoints', value: overview.totalEndpoints, sub: 'monitored', icon: Globe, color: 'text-foreground' },
    { label: 'Healthy', value: overview.healthyChecks, sub: `of ${overview.totalChecks}`, icon: CheckCircle2, color: 'text-success' },
    { label: 'Degraded', value: overview.degradedChecks, sub: 'checks', icon: AlertTriangle, color: overview.degradedChecks > 0 ? 'text-warning' : 'text-success' },
    { label: 'Down', value: overview.downChecks, sub: 'checks', icon: XCircle, color: overview.downChecks > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Avg Response', value: `${overview.avgResponseTimeMs}ms`, sub: 'across checks', icon: Timer, color: 'text-foreground' },
    { label: 'Success Rate', value: `${overview.successRate}%`, sub: '24h', icon: TrendingUp, color: overview.successRate >= 99.5 ? 'text-success' : overview.successRate >= 99.0 ? 'text-warning' : 'text-destructive' },
    { label: 'Dependencies', value: overview.totalDependencies, sub: 'registered', icon: Link2, color: 'text-foreground' },
    { label: 'Certs Expiring', value: overview.certsExpiring30d, sub: 'within 30d', icon: FileKey, color: overview.certsExpiring30d > 0 ? 'text-warning' : 'text-success' },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check Health</CardTitle>
            <Heart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.healthyChecks}/{overview.totalChecks}</span>
              <span className="text-sm text-muted-foreground">checks healthy</span>
            </div>
            <Progress value={(overview.healthyChecks / overview.totalChecks) * 100} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-success/10 p-2">
                <p className="text-xs text-success font-medium">Healthy</p>
                <p className="text-sm font-semibold">{overview.healthyChecks}</p>
              </div>
              <div className="rounded-md bg-warning/10 p-2">
                <p className="text-xs text-warning font-medium">Degraded</p>
                <p className="text-sm font-semibold">{overview.degradedChecks}</p>
              </div>
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-xs text-destructive font-medium">Down</p>
                <p className="text-sm font-semibold">{overview.downChecks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Check Results</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.checksLast24h.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">total checks</span>
            </div>
            <Progress value={((overview.checksLast24h - overview.failuresLast24h) / overview.checksLast24h) * 100} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-success/10 p-2">
                <p className="text-xs text-success font-medium">Passed</p>
                <p className="text-sm font-semibold">{(overview.checksLast24h - overview.failuresLast24h).toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-xs text-destructive font-medium">Failed</p>
                <p className="text-sm font-semibold">{overview.failuresLast24h}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Pass Rate</p>
                <p className="text-sm font-semibold">{overview.successRate}%</p>
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
              <span className="text-sm text-muted-foreground">average</span>
            </div>
            <Progress value={Math.min((overview.avgResponseTimeMs / 500) * 100, 100)} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">HTTP</p>
                <p className="text-sm font-semibold">85ms</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">TCP</p>
                <p className="text-sm font-semibold">3ms</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">DNS</p>
                <p className="text-sm font-semibold">9ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Checks Tab                                                                */
/* -------------------------------------------------------------------------- */

function ChecksTab({ checks }: { checks: HealthCheck[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {checks.map((check) => {
        const TypeIcon = checkTypeIcon(check.type)
        return (
          <Card key={check.id} className={cn(check.status === 'down' && 'border-destructive/50')}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <TypeIcon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{check.name}</h3>
                      <StatusBadge tone={checkStatusTone(check.status)} pulse={check.status === 'down'}>
                        {check.status}
                      </StatusBadge>
                      <Badge variant="secondary" className="text-[10px] uppercase">{check.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{check.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-2xl font-bold tracking-tight', check.responseTimeMs > 200 ? 'text-destructive' : check.responseTimeMs > 100 ? 'text-warning' : 'text-success')}>
                    {check.responseTimeMs}ms
                  </p>
                  <p className="text-xs text-muted-foreground">response</p>
                </div>
              </div>

              {check.errorMessage && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                  {check.errorMessage}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Region</p>
                  <p className="font-semibold">{check.region}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Interval</p>
                  <p className="font-semibold">{check.interval}s</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Uptime</p>
                  <p className={cn('font-semibold', check.uptimePercent >= 99.9 ? 'text-success' : check.uptimePercent >= 99.0 ? 'text-warning' : 'text-destructive')}>
                    {check.uptimePercent}%
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold">{check.statusCode ?? 'N/A'}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">24h Fail</p>
                  <p className={cn('font-semibold', check.failureCount24h > 10 ? 'text-destructive' : check.failureCount24h > 0 ? 'text-warning' : 'text-success')}>
                    {check.failureCount24h}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Checked: {timeAgo(check.lastChecked)}</span>
                <span>Tags: {check.tags.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Endpoints Tab                                                             */
/* -------------------------------------------------------------------------- */

function EndpointsTab({ endpoints }: { endpoints: Endpoint[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Auth</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((ep) => (
              <TableRow key={ep.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{ep.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-50">{ep.url}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ep.method === 'GET' ? 'outline' : 'secondary'} className="text-[10px] font-mono">
                    {ep.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={checkStatusTone(ep.status)}>{ep.status}</StatusBadge>
                </TableCell>
                <TableCell className="font-mono text-sm">{ep.expectedStatus}</TableCell>
                <TableCell>
                  <span className={cn('text-sm font-mono', ep.statusCode === ep.expectedStatus ? 'text-success' : 'text-destructive')}>
                    {ep.statusCode ?? 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn('text-sm', ep.uptimePercent >= 99.9 ? 'text-success' : ep.uptimePercent >= 99.0 ? 'text-warning' : 'text-destructive')}>
                    {ep.uptimePercent}%
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{ep.region}</TableCell>
                <TableCell>
                  <Badge variant={ep.authentication ? 'secondary' : 'outline'} className="text-[10px]">
                    {ep.authentication ? 'required' : 'none'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {ep.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
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
/*  SSL/TLS Tab                                                               */
/* -------------------------------------------------------------------------- */

function SSLTab({ certs }: { certs: SSLCert[] }) {
  return (
    <div className="flex flex-col gap-4">
      {certs.map((cert) => (
        <Card key={cert.id} className={cn(cert.status === 'expiring_soon' && 'border-warning/50', cert.status === 'expired' && 'border-destructive/50')}>
          <CardContent className="flex items-center gap-6 p-5">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <FileKey className={cn('size-6', cert.status === 'valid' ? 'text-success' : cert.status === 'expiring_soon' ? 'text-warning' : 'text-destructive')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{cert.domain}</h3>
                <StatusBadge tone={certStatusTone(cert.status)}>{cert.status === 'expiring_soon' ? 'expiring soon' : cert.status}</StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground">Issuer: {cert.issuer} &middot; {cert.protocol} &middot; {cert.keySize}-bit key</p>
            </div>
            <div className="text-right">
              <p className={cn('text-2xl font-bold tracking-tight', cert.daysUntilExpiry <= 30 ? 'text-warning' : cert.daysUntilExpiry <= 7 ? 'text-destructive' : 'text-foreground')}>
                {cert.daysUntilExpiry}d
              </p>
              <p className="text-xs text-muted-foreground">until expiry</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={cert.autoRenew ? 'outline' : 'secondary'} className={cn('text-[10px]', !cert.autoRenew && 'border-warning/50 text-warning')}>
                {cert.autoRenew ? 'auto-renew' : 'manual renew'}
              </Badge>
              <span className="text-xs text-muted-foreground">{cert.validFrom.split('T')[0]}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Dependencies Tab                                                          */
/* -------------------------------------------------------------------------- */

function DependenciesTab({ dependencies }: { dependencies: Dependency[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dependency</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Health Endpoint</TableHead>
              <TableHead>Last Incident</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dependencies.map((dep) => (
              <TableRow key={dep.id} className={cn(dep.status === 'down' && 'bg-destructive/5')}>
                <TableCell className="font-medium">{dep.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] capitalize">{dep.type}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={depStatusTone(dep.status)} pulse={dep.status === 'down'}>
                    {dep.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <span className={cn('text-sm', dep.responseTimeMs > 200 ? 'text-destructive' : dep.responseTimeMs > 50 ? 'text-warning' : 'text-foreground')}>
                    {dep.responseTimeMs}ms
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn('text-sm', dep.uptimePercent >= 99.9 ? 'text-success' : dep.uptimePercent >= 99.0 ? 'text-warning' : 'text-destructive')}>
                    {dep.uptimePercent}%
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{dep.version ?? 'N/A'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dep.region}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-37.5">{dep.healthEndpoint}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dep.lastIncident ? timeAgo(dep.lastIncident) : 'None'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  History Tab                                                               */
/* -------------------------------------------------------------------------- */

function HistoryTab({ history }: { history: HistoryEntry[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Status Code</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.checkName}</TableCell>
                <TableCell>
                  <StatusBadge tone={checkStatusTone(entry.status)}>{entry.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <span className={cn('text-sm', entry.responseTimeMs > 200 ? 'text-destructive' : entry.responseTimeMs > 100 ? 'text-warning' : 'text-foreground')}>
                    {entry.responseTimeMs}ms
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{entry.statusCode ?? 'N/A'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.region}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(entry.timestamp)}</TableCell>
                <TableCell>
                  {entry.errorMessage ? (
                    <span className="text-xs text-destructive">{entry.errorMessage}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
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

function AlertsTab({ alerts }: { alerts: HealthAlert[] }) {
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

function ActivityTab({ activities }: { activities: HealthActivityEvent[] }) {
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
  { value: 'checks', label: 'Checks', icon: Heart },
  { value: 'endpoints', label: 'Endpoints', icon: Globe },
  { value: 'ssl', label: 'SSL/TLS', icon: Shield },
  { value: 'dependencies', label: 'Dependencies', icon: Link2 },
  { value: 'history', label: 'History', icon: History },
  { value: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { value: 'activity', label: 'Activity', icon: Activity },
] as const

export default function HealthChecksPage() {
  const data = healthChecksData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Health Checks"
        description="Monitor endpoint availability, response times, SSL certificates, and service dependencies across your infrastructure."
      >
        <StatusBadge tone={globalHealthTone(data.overview.globalHealth)} pulse={data.overview.globalHealth !== 'healthy'}>
          {data.overview.globalHealth}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">Last check: {timeAgo(data.overview.lastCheck)}</span>
        <Button variant="outline" size="sm" onClick={() => toast.success('All health checks refreshed')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Maintenance mode toggled')}>
          <ShieldAlert className="mr-1.5 size-3.5" />
          Silence
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
        <TabsContent value="checks">
          <ChecksTab checks={data.checks} />
        </TabsContent>
        <TabsContent value="endpoints">
          <EndpointsTab endpoints={data.endpoints} />
        </TabsContent>
        <TabsContent value="ssl">
          <SSLTab certs={data.sslCerts} />
        </TabsContent>
        <TabsContent value="dependencies">
          <DependenciesTab dependencies={data.dependencies} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab history={data.history} />
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
