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
  HardDrive,
  Heart,
  History,
  Info,
  MemoryStick,
  Network,
  Power,
  RefreshCw,
  Server,
  Settings,
  Thermometer,
  Timer,
  Video,
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
  streamingData,
  type StreamingData,
  type NodeStatus,
  type StreamStatus,
  type TranscodeStatus,
  type AlertSeverity,
  type GlobalClusterStatus,
  type NodeActivityEvent,
} from '@/lib/streaming-nodes-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function globalStatusTone(s: GlobalClusterStatus): StatusTone {
  return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'destructive'
}

function nodeStatusTone(s: NodeStatus): StatusTone {
  return s === 'online' ? 'success' : s === 'maintenance' ? 'info' : s === 'overloaded' ? 'warning' : 'destructive'
}

function streamStatusTone(s: StreamStatus): StatusTone {
  return s === 'playing' ? 'success' : s === 'transcoding' ? 'info' : s === 'buffering' ? 'warning' : s === 'paused' ? 'neutral' : 'destructive'
}

function transcodeStatusTone(s: TranscodeStatus): StatusTone {
  return s === 'completed' ? 'success' : s === 'processing' ? 'info' : s === 'failed' ? 'destructive' : s === 'cancelled' ? 'neutral' : 'warning'
}

function alertSeverityTone(s: AlertSeverity): StatusTone {
  return s === 'critical' ? 'destructive' : s === 'warning' ? 'warning' : 'info'
}

function activityIcon(type: NodeActivityEvent['type']) {
  const map: Record<NodeActivityEvent['type'], typeof Server> = {
    'stream-start': Video,
    'stream-end': Video,
    'transcode-complete': CheckCircle2,
    'node-restart': Power,
    'gpu-alert': AlertTriangle,
    'node-down': XCircle,
    'node-recovery': Heart,
    'config-change': Settings,
  }
  return map[type] ?? Activity
}

function activityColor(type: NodeActivityEvent['type']) {
  if (type === 'node-down' || type === 'gpu-alert') return 'text-destructive'
  if (type === 'node-recovery' || type === 'transcode-complete') return 'text-success'
  if (type === 'stream-start') return 'text-primary'
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

function temperatureColor(temp: number) {
  if (temp === 0) return 'text-muted-foreground'
  if (temp < 50) return 'text-success'
  if (temp < 65) return 'text-warning'
  return 'text-destructive'
}

function gpuUtilColor(pct: number) {
  if (pct > 85) return 'text-destructive'
  if (pct > 70) return 'text-warning'
  return 'text-success'
}

function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} TB`
  return `${mb} GB`
}

function formatVram(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: StreamingData }) {
  const { overview } = data

  const statCards = [
    { label: 'Active Streams', value: overview.activeStreams, sub: `peak ${overview.peakConcurrent}`, icon: Video, color: 'text-primary' },
    { label: 'Nodes Online', value: `${overview.onlineNodes}/${overview.totalNodes}`, sub: 'cluster', icon: Server, color: overview.onlineNodes === overview.totalNodes ? 'text-success' : 'text-warning' },
    { label: 'Bandwidth', value: `${overview.totalBandwidthMbps} Mbps`, sub: 'total outbound', icon: Network, color: 'text-foreground' },
    { label: 'GPU Util', value: `${overview.gpuUtilization}%`, sub: 'avg across nodes', icon: Zap, color: gpuUtilColor(overview.gpuUtilization) },
    { label: 'CPU Util', value: `${overview.cpuUtilization}%`, sub: 'avg across nodes', icon: Cpu, color: overview.cpuUtilization > 80 ? 'text-destructive' : overview.cpuUtilization > 60 ? 'text-warning' : 'text-success' },
    { label: 'RAM Util', value: `${overview.ramUtilization}%`, sub: 'avg across nodes', icon: MemoryStick, color: overview.ramUtilization > 80 ? 'text-destructive' : overview.ramUtilization > 60 ? 'text-warning' : 'text-success' },
    { label: 'Storage', value: overview.totalStorageUsed, sub: `of ${overview.totalStorage}`, icon: HardDrive, color: 'text-foreground' },
    { label: 'Queue', value: overview.queuedTranscodes, sub: 'transcodes pending', icon: Clock, color: overview.queuedTranscodes > 5 ? 'text-warning' : 'text-foreground' },
    { label: 'Failed (24h)', value: overview.failedTranscodes24h, sub: 'transcode errors', icon: AlertTriangle, color: overview.failedTranscodes24h > 0 ? 'text-destructive' : 'text-success' },
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
            <CardTitle className="text-sm font-medium">GPU Usage</CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.gpuUtilization}%</span>
              <span className="text-sm text-muted-foreground">avg NVENC load</span>
            </div>
            <Progress value={overview.gpuUtilization} className={cn('h-2', overview.gpuUtilization > 85 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              {data.nodes.filter((n) => n.status !== 'maintenance').map((n) => (
                <div key={n.id} className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">{n.name.split('-').pop()}</p>
                  <p className={cn('text-sm font-semibold', gpuUtilColor(n.gpu.utilization))}>{n.gpu.utilization}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.cpuUtilization}%</span>
              <span className="text-sm text-muted-foreground">across {overview.totalNodes} nodes</span>
            </div>
            <Progress value={overview.cpuUtilization} className={cn('h-2', overview.cpuUtilization > 80 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              {data.nodes.filter((n) => n.status !== 'maintenance').map((n) => (
                <div key={n.id} className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">{n.name.split('-').pop()}</p>
                  <p className={cn('text-sm font-semibold', n.cpu.utilization > 80 ? 'text-destructive' : n.cpu.utilization > 60 ? 'text-warning' : 'text-foreground')}>{n.cpu.utilization}%</p>
                </div>
              ))}
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
              <span className="text-3xl font-bold">{overview.ramUtilization}%</span>
              <span className="text-sm text-muted-foreground">avg across nodes</span>
            </div>
            <Progress value={overview.ramUtilization} className={cn('h-2', overview.ramUtilization > 80 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              {data.nodes.filter((n) => n.status !== 'maintenance').map((n) => (
                <div key={n.id} className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">{n.name.split('-').pop()}</p>
                  <p className={cn('text-sm font-semibold', n.ram.utilization > 80 ? 'text-destructive' : n.ram.utilization > 60 ? 'text-warning' : 'text-foreground')}>{n.ram.utilization}%</p>
                </div>
              ))}
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

function NodesTab({ nodes }: { nodes: StreamingData['nodes'] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {nodes.map((node) => (
        <Card key={node.id} className={cn(node.status === 'offline' && 'opacity-60', node.status === 'maintenance' && 'border-dashed')}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Server className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{node.name}</h3>
                    <StatusBadge tone={nodeStatusTone(node.status)} pulse={node.status === 'overloaded'}>
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
                  <Thermometer className={cn('size-3.5', temperatureColor(node.gpu.temperature))} />
                  <span className={cn('text-sm font-semibold', temperatureColor(node.gpu.temperature))}>
                    {node.gpu.temperature}°C
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{node.gpu.model}</p>
              </div>
            </div>

            <Separator />

            {/* GPU */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">GPU ({node.gpu.encoder})</span>
                <span className={cn('text-xs font-semibold', gpuUtilColor(node.gpu.utilization))}>{node.gpu.utilization}%</span>
              </div>
              <Progress value={node.gpu.utilization} className={cn('h-1.5', node.gpu.utilization > 85 && '[&>div]:bg-destructive')} />
              <p className="text-[10px] text-muted-foreground">VRAM: {formatVram(node.gpu.vramUsedMb)} / {formatVram(node.gpu.vramTotalMb)}</p>
            </div>

            {/* CPU */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">CPU ({node.cpu.cores} cores)</span>
                <span className="text-xs font-medium">{node.cpu.utilization}%</span>
              </div>
              <Progress value={node.cpu.utilization} className={cn('h-1.5', node.cpu.utilization > 80 && '[&>div]:bg-destructive')} />
            </div>

            {/* RAM */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">RAM</span>
                <span className="text-xs font-medium">{node.ram.utilization}% &middot; {formatBytes(node.ram.usedMb)} / {formatBytes(node.ram.totalMb)}</span>
              </div>
              <Progress value={node.ram.utilization} className={cn('h-1.5', node.ram.utilization > 80 && '[&>div]:bg-destructive')} />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Streams</p>
                <p className="font-semibold">{node.concurrentStreams}/{node.maxStreams}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Transcodes</p>
                <p className="font-semibold">{node.activeTranscodes}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Inbound</p>
                <p className="font-semibold">{node.network.inboundMbps} Mbps</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Outbound</p>
                <p className="font-semibold">{node.network.outboundMbps} Mbps</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uptime: {node.uptime}</span>
              <span>v{node.version}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Streams Tab                                                               */
/* -------------------------------------------------------------------------- */

function StreamsTab({ streams }: { streams: StreamingData['streams'] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Node</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Bitrate</TableHead>
              <TableHead>Codec</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {streams.map((stream) => (
              <TableRow key={stream.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{stream.title}</p>
                    <p className="text-xs text-muted-foreground">{stream.client} &middot; {stream.resolution}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{stream.user}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{stream.nodeName}</TableCell>
                <TableCell>
                  <StatusBadge tone={streamStatusTone(stream.status)}>{stream.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{stream.quality}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={stream.protocol === 'directplay' ? 'outline' : 'secondary'} className="text-[10px] font-mono">{stream.protocol}</Badge>
                </TableCell>
                <TableCell className="text-sm">{stream.bitrateMbps > 0 ? `${stream.bitrateMbps} Mbps` : '—'}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <span className="font-mono">{stream.codec}</span>
                    <span className="text-muted-foreground"> / {stream.audioCodec}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{stream.progress}%</span>
                      <span className="text-[10px] text-muted-foreground">{stream.bufferPercent}% buf</span>
                    </div>
                    <Progress value={stream.progress} className="h-1" />
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
/*  Transcode Queue Tab                                                       */
/* -------------------------------------------------------------------------- */

function TranscodesTab({ transcodes }: { transcodes: StreamingData['transcodes'] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Node</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Input → Output</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transcodes.map((tc) => (
              <TableRow key={tc.id} className={cn(tc.status === 'failed' && 'bg-destructive/5')}>
                <TableCell className="font-medium">{tc.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{tc.nodeName}</TableCell>
                <TableCell>
                  <StatusBadge tone={transcodeStatusTone(tc.status)}>{tc.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <Badge variant={tc.priority === 'high' ? 'destructive' : tc.priority === 'low' ? 'outline' : 'secondary'} className="text-[10px] capitalize">{tc.priority}</Badge>
                </TableCell>
                <TableCell className="text-xs font-mono">{tc.inputCodec} → {tc.outputCodec}</TableCell>
                <TableCell className="text-sm">{tc.resolution}</TableCell>
                <TableCell>
                  <div className="w-20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{tc.progress}%</span>
                    </div>
                    <Progress value={tc.progress} className={cn('h-1', tc.status === 'failed' && '[&>div]:bg-destructive')} />
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {tc.etaSec !== null ? `${Math.ceil(tc.etaSec / 60)}m` : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatBytes(tc.fileSizeMb)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Bandwidth Tab                                                             */
/* -------------------------------------------------------------------------- */

function BandwidthTab({ bandwidth, nodes }: { bandwidth: StreamingData['bandwidth']; nodes: StreamingData['nodes'] }) {
  const maxBw = Math.max(...bandwidth.map((b) => Math.max(b.node1, b.node2, b.node3)))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {nodes.map((node) => (
          <Card key={node.id}>
            <CardContent className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowDown className="size-3.5" />
                {node.name} In
              </div>
              <p className="text-2xl font-bold tracking-tight">{node.network.inboundMbps} Mbps</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="size-3.5" />
                Out: {node.network.outboundMbps} Mbps
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bandwidth per Node (24h)</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-primary" />Primary</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />Worker 1</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />Standby</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-48">
            {bandwidth.map((point, i) => (
              <div key={i} className="flex flex-1 items-end gap-px" title={point.time}>
                <div
                  className="w-1/3 rounded-t bg-primary/60 transition-all hover:bg-primary"
                  style={{ height: `${(point.node1 / maxBw) * 100}%` }}
                />
                <div
                  className="w-1/3 rounded-t bg-blue-500/60 transition-all hover:bg-blue-500"
                  style={{ height: `${(point.node2 / maxBw) * 100}%` }}
                />
                <div
                  className="w-1/3 rounded-t bg-muted-foreground/20 transition-all hover:bg-muted-foreground/40"
                  style={{ height: `${(point.node3 / maxBw) * 100}%` }}
                />
              </div>
            ))}
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" />
              Total Inbound
            </div>
            <p className="text-2xl font-bold tracking-tight">{nodes.reduce((s, n) => s + n.network.inboundMbps, 0)} Mbps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" />
              Total Outbound
            </div>
            <p className="text-2xl font-bold tracking-tight">{nodes.reduce((s, n) => s + n.network.outboundMbps, 0)} Mbps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="size-3.5" />
              Avg Bitrate/Stream
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {(nodes.reduce((s, n) => s + n.network.outboundMbps, 0) / Math.max(nodes.reduce((s, n) => s + n.concurrentStreams, 0), 1)).toFixed(1)} Mbps
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              Peak Today
            </div>
            <p className="text-2xl font-bold tracking-tight">{Math.max(...bandwidth.map((b) => b.node1 + b.node2 + b.node3))} Mbps</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Alerts Tab                                                                */
/* -------------------------------------------------------------------------- */

function AlertsTab({ alerts }: { alerts: StreamingData['alerts'] }) {
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
                  <span>Node: {alert.nodeName}</span>
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

function ActivityTab({ activities }: { activities: StreamingData['activities'] }) {
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
                    <span className="text-xs text-muted-foreground">{act.nodeName}</span>
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
  { value: 'streams', label: 'Streams', icon: Video },
  { value: 'transcodes', label: 'Transcodes', icon: RefreshCw },
  { value: 'bandwidth', label: 'Bandwidth', icon: Activity },
  { value: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { value: 'activity', label: 'Activity', icon: History },
] as const

export default function StreamingNodesPage() {
  const data = streamingData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Streaming Nodes"
        description="Monitor transcoding nodes, active streams, GPU usage and bandwidth distribution."
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
        <TabsContent value="nodes">
          <NodesTab nodes={data.nodes} />
        </TabsContent>
        <TabsContent value="streams">
          <StreamsTab streams={data.streams} />
        </TabsContent>
        <TabsContent value="transcodes">
          <TranscodesTab transcodes={data.transcodes} />
        </TabsContent>
        <TabsContent value="bandwidth">
          <BandwidthTab bandwidth={data.bandwidth} nodes={data.nodes} />
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
