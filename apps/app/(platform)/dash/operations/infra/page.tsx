'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Heart,
  History,
  Info,
  Layers,
  MemoryStick,
  Network,
  Power,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Thermometer,
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
  infraData,
  type InfraData,
  type InfraOverview,
  type Node,
  type Service,
  type Container,
  type StorageVolume,
  type NetworkStats,
  type Deployment,
  type Alert,
  type ActivityEvent,
  type GlobalStatus,
  type NodeStatus,
  type ServiceStatus,
  type ContainerStatus,
  type AlertSeverity,
  type AlertStatus,
  type DeploymentStatus,
  type ActivityEventType,
} from '@/lib/infra-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function globalStatusTone(s: GlobalStatus): StatusTone {
  return s === 'operational' ? 'success' : s === 'warning' ? 'warning' : 'destructive'
}

function nodeStatusTone(s: NodeStatus): StatusTone {
  return s === 'healthy' ? 'success' : s === 'warning' ? 'warning' : s === 'critical' ? 'destructive' : 'neutral'
}

function serviceStatusTone(s: ServiceStatus): StatusTone {
  return s === 'running' ? 'success' : s === 'degraded' ? 'warning' : s === 'stopped' ? 'destructive' : 'neutral'
}

function containerStatusTone(s: ContainerStatus): StatusTone {
  return s === 'running' ? 'success' : s === 'restarting' ? 'warning' : s === 'stopped' || s === 'dead' ? 'destructive' : 'neutral'
}

function alertSeverityTone(s: AlertSeverity): StatusTone {
  return s === 'critical' ? 'destructive' : s === 'warning' ? 'warning' : 'info'
}

function deploymentStatusTone(s: DeploymentStatus): StatusTone {
  return s === 'success' ? 'success' : s === 'failed' ? 'destructive' : s === 'in-progress' ? 'info' : 'warning'
}

function activityIcon(type: ActivityEventType) {
  const map: Record<ActivityEventType, typeof Server> = {
    'container-restart': RefreshCw,
    'deployment': Globe,
    'backup': Database,
    'sync': RefreshCw,
    'reboot': Power,
    'health-check': Heart,
    'alert': AlertTriangle,
    'recovery': CheckCircle2,
  }
  return map[type] ?? Activity
}

function activityColor(type: ActivityEventType) {
  if (type === 'alert') return 'text-destructive'
  if (type === 'recovery' || type === 'health-check') return 'text-success'
  if (type === 'deployment') return 'text-primary'
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

function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} TB`
  return `${mb} GB`
}

function temperatureColor(temp: number) {
  if (temp === 0) return 'text-muted-foreground'
  if (temp < 50) return 'text-success'
  if (temp < 65) return 'text-warning'
  return 'text-destructive'
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: InfraData }) {
  const { overview } = data

  const statCards = [
    { label: 'CPU', value: `${overview.cpuPercent}%`, sub: 'global usage', icon: Cpu, color: overview.cpuPercent > 80 ? 'text-destructive' : overview.cpuPercent > 60 ? 'text-warning' : 'text-success' },
    { label: 'RAM', value: overview.ramUsed, sub: `${overview.ramPercent}% of ${overview.ramTotal}`, icon: MemoryStick, color: overview.ramPercent > 80 ? 'text-destructive' : overview.ramPercent > 60 ? 'text-warning' : 'text-success' },
    { label: 'Storage', value: overview.storageUsed, sub: `of ${overview.storageTotal}`, icon: HardDrive, color: 'text-foreground' },
    { label: 'Bandwidth', value: `${overview.bandwidthMbps} Mbps`, sub: 'current', icon: Network, color: 'text-foreground' },
    { label: 'Uptime', value: overview.uptime, sub: 'cluster', icon: Clock, color: 'text-success' },
    { label: 'VMs', value: overview.vmCount, sub: 'running', icon: Server, color: 'text-foreground' },
    { label: 'Containers', value: overview.containerCount, sub: 'running', icon: Layers, color: 'text-foreground' },
    { label: 'Services', value: overview.serviceCount, sub: 'registered', icon: Settings, color: 'text-foreground' },
    { label: 'Critical', value: overview.criticalAlerts, sub: 'alerts', icon: AlertTriangle, color: overview.criticalAlerts > 0 ? 'text-destructive' : 'text-success' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
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

      {/* CPU + RAM + Storage gauges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.cpuPercent}%</span>
              <span className="text-sm text-muted-foreground">48 cores total</span>
            </div>
            <Progress value={overview.cpuPercent} className={cn('h-2', overview.cpuPercent > 80 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Master</p>
                <p className="text-sm font-semibold">35%</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Worker 1</p>
                <p className="text-sm font-semibold text-warning">78%</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Worker 2</p>
                <p className="text-sm font-semibold">22%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.ramPercent}%</span>
              <span className="text-sm text-muted-foreground">{overview.ramUsed} / {overview.ramTotal}</span>
            </div>
            <Progress value={overview.ramPercent} className={cn('h-2', overview.ramPercent > 80 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Master</p>
                <p className="text-sm font-semibold">58%</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Worker 1</p>
                <p className="text-sm font-semibold text-warning">82%</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Worker 2</p>
                <p className="text-sm font-semibold">45%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.storageUsed}</span>
              <span className="text-sm text-muted-foreground">of {overview.storageTotal}</span>
            </div>
            <Progress value={45} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Database</p>
                <p className="text-sm font-semibold">180 GB</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Media</p>
                <p className="text-sm font-semibold">1.2 TB</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Backups</p>
                <p className="text-sm font-semibold">240 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Nodes Tab                                                                 */
/* -------------------------------------------------------------------------- */

function NodesTab({ nodes }: { nodes: Node[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {nodes.map((node) => (
        <Card key={node.id} className={cn(node.status === 'offline' && 'opacity-60')}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Server className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{node.name}</h3>
                    <StatusBadge tone={nodeStatusTone(node.status)} pulse={node.status === 'critical'}>
                      {node.status}
                    </StatusBadge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{node.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {node.hostname} &middot; {node.ip} &middot; {node.os}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Thermometer className={cn('size-3.5', temperatureColor(node.temperature))} />
                  <span className={cn('text-sm font-semibold', temperatureColor(node.temperature))}>
                    {node.temperature > 0 ? `${node.temperature}°C` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Resource bars */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">CPU ({node.cpuCores} cores)</span>
                  <span className="text-xs font-medium">{node.cpuPercent}%</span>
                </div>
                <Progress value={node.cpuPercent} className={cn('h-1.5', node.cpuPercent > 80 && '[&>div]:bg-destructive')} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">RAM</span>
                  <span className="text-xs font-medium">{node.ramPercent}% &middot; {node.ramUsed} / {node.ramTotal}</span>
                </div>
                <Progress value={node.ramPercent} className={cn('h-1.5', node.ramPercent > 80 && '[&>div]:bg-destructive')} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <span className="text-xs font-medium">{node.storageUsed} / {node.storageTotal}</span>
                </div>
                <Progress value={Math.round((parseFloat(node.storageUsed) / parseFloat(node.storageTotal)) * 100)} className="h-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Network In</p>
                <p className="font-semibold">{node.networkIn}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Network Out</p>
                <p className="font-semibold">{node.networkOut}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">VMs</p>
                <p className="font-semibold">{node.vmCount}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Containers</p>
                <p className="font-semibold">{node.containerCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uptime: {node.uptime}</span>
              <span>Last seen: {timeAgo(node.lastSeen)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Services Tab                                                              */
/* -------------------------------------------------------------------------- */

function ServicesTab({ services }: { services: Service[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Replicas</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Last Restart</TableHead>
              <TableHead>Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((svc) => (
              <TableRow key={svc.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{svc.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">:{svc.port}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={serviceStatusTone(svc.status)}>{svc.status}</StatusBadge>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px] font-mono">v{svc.version}</Badge></TableCell>
                <TableCell className="font-mono text-sm">{svc.replicas}</TableCell>
                <TableCell>
                  <span className={cn('text-sm', svc.latencyMs > 30 ? 'text-warning' : 'text-foreground')}>
                    {svc.latencyMs}ms
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{svc.uptime}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(svc.lastRestart)}</TableCell>
                <TableCell>
                  <Badge variant={svc.healthCheck === 'passing' ? 'outline' : 'secondary'} className={cn('text-[10px]', svc.healthCheck === 'warning' && 'border-warning/50 text-warning')}>
                    {svc.healthCheck}
                  </Badge>
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
/*  Containers Tab                                                            */
/* -------------------------------------------------------------------------- */

function ContainersTab({ containers }: { containers: Container[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Container</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>Restarts</TableHead>
              <TableHead>Node</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.map((ctr) => (
              <TableRow key={ctr.id}>
                <TableCell className="font-medium font-mono text-sm">{ctr.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{ctr.image}</TableCell>
                <TableCell>
                  <StatusBadge tone={containerStatusTone(ctr.status)}>{ctr.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <span className={cn('text-sm', ctr.cpuPercent > 70 ? 'text-destructive' : ctr.cpuPercent > 50 ? 'text-warning' : 'text-foreground')}>
                    {ctr.cpuPercent}%
                  </span>
                </TableCell>
                <TableCell className="text-sm">{ctr.ramMb} / {ctr.ramLimit} MB</TableCell>
                <TableCell>
                  <span className={cn('text-sm font-medium', ctr.restartCount > 3 ? 'text-destructive' : ctr.restartCount > 0 ? 'text-warning' : 'text-foreground')}>
                    {ctr.restartCount}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{ctr.node}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Storage Tab                                                               */
/* -------------------------------------------------------------------------- */

function StorageTab({ volumes }: { volumes: StorageVolume[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {volumes.map((vol) => {
        const percent = Math.round((vol.used / vol.total) * 100)
        return (
          <Card key={vol.id}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-muted-foreground" />
                  <h3 className="font-semibold">{vol.name}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px] capitalize">{vol.type}</Badge>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-bold">{vol.usedLabel}</span>
                  <span className="text-sm text-muted-foreground">of {vol.totalLabel}</span>
                </div>
                <Progress value={percent} className={cn('h-2', percent > 85 && '[&>div]:bg-destructive')} />
                <p className="mt-1 text-xs text-muted-foreground">{vol.freeLabel} free &middot; {percent}% utilized</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">IOPS</span>
                  {vol.iops.toLocaleString()}
                </div>
                <div>
                  <span className="block font-medium text-foreground">Mount</span>
                  <span className="font-mono text-[10px]">{vol.mountPath}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Network Tab                                                               */
/* -------------------------------------------------------------------------- */

function NetworkTab({ network }: { network: NetworkStats }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowDown className="size-3.5" />
              Traffic In
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.trafficIn}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUp className="size-3.5" />
              Traffic Out
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.trafficOut}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" />
              Active Connections
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.activeConnections.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              Avg Latency
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.avgLatencyMs}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="size-3.5" />
              Requests/sec
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.requestsPerSec.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mock chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bandwidth (24h)</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Peak: {network.peakBandwidth}</span>
            <span>&middot;</span>
            <span>Current: {network.currentBandwidth}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {network.chartData.map((value, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/60 transition-all hover:bg-primary"
                style={{ height: `${(value / 100) * 100}%` }}
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

      {/* Security */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              Open Ports
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.openPorts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              Firewall Rules
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.firewallRules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              SSL Certificates
            </div>
            <p className="text-2xl font-bold tracking-tight">{network.sslCerts}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Deployments Tab                                                           */
/* -------------------------------------------------------------------------- */

function DeploymentsTab({ deployments }: { deployments: Deployment[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Initiated By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Commit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((dep) => (
              <TableRow key={dep.id}>
                <TableCell><Badge variant="secondary" className="font-mono text-xs">v{dep.version}</Badge></TableCell>
                <TableCell>
                  <StatusBadge tone={deploymentStatusTone(dep.status)}>{dep.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <Badge variant={dep.environment === 'production' ? 'default' : 'outline'} className="text-[10px] capitalize">{dep.environment}</Badge>
                </TableCell>
                <TableCell className="text-sm">{dep.services.join(', ')}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dep.duration}</TableCell>
                <TableCell className="text-sm">{dep.initiatedBy}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(dep.date)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{dep.commitHash}</TableCell>
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

function AlertsTab({ alerts }: { alerts: Alert[] }) {
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
                  <span>Node: {alert.node}</span>
                  <span>&middot;</span>
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

function ActivityTab({ activities }: { activities: ActivityEvent[] }) {
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
                    <span className="text-xs text-muted-foreground">{act.node}</span>
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
  { value: 'nodes', label: 'Nodes', icon: Server },
  { value: 'services', label: 'Services', icon: Settings },
  { value: 'containers', label: 'Containers', icon: Layers },
  { value: 'storage', label: 'Storage', icon: HardDrive },
  { value: 'network', label: 'Network', icon: Network },
  { value: 'deployments', label: 'Deployments', icon: Globe },
  { value: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { value: 'activity', label: 'Activity', icon: History },
] as const

export default function InfraPage() {
  const data = infraData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Infrastructure"
        description="Real-time monitoring of your production cluster. Nodes, services, containers, storage and network at a glance."
      >
        <StatusBadge tone={globalStatusTone(data.overview.globalStatus)} pulse={data.overview.globalStatus !== 'operational'}>
          {data.overview.globalStatus}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">Heartbeat: {timeAgo(data.overview.lastHeartbeat)}</span>
        <Button variant="outline" size="sm" onClick={() => toast.success('Refreshed')}>
          <RefreshCw className="mr-1.5 size-3.5" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Maintenance mode toggled')}>
          <Settings className="mr-1.5 size-3.5" />
          Maintenance
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
        <TabsContent value="nodes">
          <NodesTab nodes={data.nodes} />
        </TabsContent>
        <TabsContent value="services">
          <ServicesTab services={data.services} />
        </TabsContent>
        <TabsContent value="containers">
          <ContainersTab containers={data.containers} />
        </TabsContent>
        <TabsContent value="storage">
          <StorageTab volumes={data.storage} />
        </TabsContent>
        <TabsContent value="network">
          <NetworkTab network={data.network} />
        </TabsContent>
        <TabsContent value="deployments">
          <DeploymentsTab deployments={data.deployments} />
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
