'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Database,
  HardDrive,
  Server,
  Activity,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  CheckCircle,
  XCircle,
  Info,
  Terminal,
  Settings,
  BarChart3,
  Thermometer,
  Zap,
  Copy,
  Shield,
  Timer,
  Gauge,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/dash/page-header'
import {
  storageOverview,
  volumes,
  disks,
  backups,
  snapshots,
  storageAlerts,
  storageActivity,
  ioMetrics,
  formatBytes,
  statusColor,
} from '@/lib/storage-data'

function StorageOverviewTab() {
  const [filter, setFilter] = React.useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const criticalAlerts = storageAlerts.filter((a) => !a.acknowledged && a.level === 'critical')

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Database className="h-4 w-4" />
            Total Storage
          </div>
          <div className="mt-2 font-bold text-2xl">{formatBytes(storageOverview.totalStorage)}</div>
          <div className="mt-1 text-muted-foreground text-xs">
            {formatBytes(storageOverview.usedStorage)} used ({storageOverview.usagePercent}%)
          </div>
          <Progress value={storageOverview.usagePercent} className="mt-2 h-1.5" />
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Layers className="h-4 w-4" />
            Volumes
          </div>
          <div className="mt-2 font-bold text-2xl">{storageOverview.totalVolumes}</div>
          <div className="mt-1 text-muted-foreground text-xs">
            {storageOverview.healthyVolumes} healthy, {storageOverview.totalVolumes - storageOverview.healthyVolumes} degraded
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <HardDrive className="h-4 w-4" />
            Physical Disks
          </div>
          <div className="mt-2 font-bold text-2xl">{storageOverview.totalDisks}</div>
          <div className="mt-1 text-muted-foreground text-xs">
            {storageOverview.healthyDisks} healthy, {storageOverview.totalDisks - storageOverview.healthyDisks} warning
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Activity className="h-4 w-4" />
            IOPS
          </div>
          <div className="mt-2 font-bold text-2xl">{storageOverview.iopsTotal.toLocaleString()}</div>
          <div className="mt-1 text-muted-foreground text-xs">
            R: {storageOverview.ioReadTotal} MB/s &middot; W: {storageOverview.ioWriteTotal} MB/s
          </div>
        </div>
      </div>

      {/* I/O Latency Bar Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">I/O Throughput</div>
            <div className="text-muted-foreground text-xs">Read vs Write (MB/s) — last 24h</div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Read</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />Write</span>
          </div>
        </div>
        <div className="flex h-48 items-end gap-1">
          {ioMetrics.map((point, i) => {
            const maxVal = 350
            const readHeight = (point.read / maxVal) * 100
            const writeHeight = (point.write / maxVal) * 100
            return (
              <div key={i} className="flex flex-1 items-end gap-px">
                <div
                  className="w-1/2 rounded-t bg-emerald-500/80 transition-all hover:bg-emerald-500"
                  style={{ height: `${readHeight}%` }}
                  title={`Read: ${point.read} MB/s`}
                />
                <div
                  className="w-1/2 rounded-t bg-blue-500/80 transition-all hover:bg-blue-500"
                  style={{ height: `${writeHeight}%` }}
                  title={`Write: ${point.write} MB/s`}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-muted-foreground text-xs">
          <span>04:00</span>
          <span>06:00</span>
          <span>08:00</span>
          <span>09:45</span>
        </div>
      </div>

      {/* Disk Status */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 font-medium text-sm">Physical Disk Health</div>
        <div className="space-y-3">
          {disks.map((disk) => (
            <div key={disk.id} className="flex items-center gap-4 rounded-md border p-3">
              <HardDrive className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-sm">{disk.model}</span>
                  <Badge variant={disk.health === 'healthy' ? 'default' : disk.health === 'warning' ? 'outline' : 'destructive'} className="shrink-0">
                    {disk.health}
                  </Badge>
                </div>
                <div className="mt-0.5 text-muted-foreground text-xs">
                  {disk.type.toUpperCase()} &middot; {formatBytes(disk.size)} &middot; {disk.temperature}°C &middot; SMART: {disk.smartStatus}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs">
                  <ArrowUpRight className="inline h-3 w-3 text-emerald-500" /> {disk.ioRead} MB/s
                </div>
                <div className="font-mono text-xs">
                  <ArrowDownRight className="inline h-3 w-3 text-blue-500" /> {disk.ioWrite} MB/s
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-medium text-sm">Active Alerts</div>
          <div className="flex gap-1">
            {(['all', 'critical', 'warning', 'info'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs capitalize transition-colors',
                  filter === level ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {storageAlerts
            .filter((a) => filter === 'all' || a.level === filter)
            .map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center gap-3 rounded-md border p-3',
                  alert.acknowledged && 'opacity-60'
                )}
              >
                {alert.level === 'critical' ? (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : alert.level === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 text-blue-500" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{alert.message}</div>
                  <div className="text-muted-foreground text-xs">{alert.timestamp}</div>
                </div>
                {alert.acknowledged && (
                  <Badge variant="outline" className="shrink-0">acknowledged</Badge>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function VolumesTab() {
  return (
    <div className="space-y-4">
      {volumes.map((vol) => (
        <div
          key={vol.id}
          className={cn(
            'rounded-lg border bg-card p-4',
            vol.status === 'degraded' && 'border-amber-500/50'
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{vol.name}</span>
                  <Badge variant={vol.status === 'healthy' ? 'default' : vol.status === 'degraded' ? 'outline' : 'destructive'}>
                    {vol.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-xs">
                  {vol.mountPoint} &middot; {vol.type.toUpperCase()} &middot; {vol.filesystem}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{vol.usagePercent}%</div>
              <div className="text-muted-foreground text-xs">{formatBytes(vol.usedSize)} / {formatBytes(vol.totalSize)}</div>
            </div>
          </div>
          <Progress value={vol.usagePercent} className="mb-3 h-1.5" />
          <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <div>
              <div className="text-muted-foreground">Free</div>
              <div className="font-medium">{formatBytes(vol.freeSize)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Read</div>
              <div className="font-medium">{vol.ioRead} MB/s</div>
            </div>
            <div>
              <div className="text-muted-foreground">Write</div>
              <div className="font-medium">{vol.ioWrite} MB/s</div>
            </div>
            <div>
              <div className="text-muted-foreground">Latency</div>
              <div className="font-medium">{vol.latencyRead}ms R / {vol.latencyWrite}ms W</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DisksTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {disks.map((disk) => (
          <div
            key={disk.id}
            className={cn(
              'rounded-lg border bg-card p-4',
              disk.health === 'warning' && 'border-amber-500/50'
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{disk.model}</span>
                    <Badge variant={disk.health === 'healthy' ? 'default' : 'outline'}>
                      {disk.health}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-xs">S/N: {disk.serial}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Thermometer className="h-3.5 w-3.5" />
                  {disk.temperature}°C
                </div>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium uppercase">{disk.type}</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Size</div>
                <div className="font-medium">{formatBytes(disk.size)}</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Hours</div>
                <div className="font-medium">{disk.powerOnHours.toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">TBW</div>
                <div className="font-medium">{formatBytes(disk.totalBytesWritten)}</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Realloc</div>
                <div className={cn('font-medium', disk.reallocatedSectors > 0 && 'text-amber-500')}>
                  {disk.reallocatedSectors}
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Pending</div>
                <div className={cn('font-medium', disk.currentPendingSectors > 0 && 'text-amber-500')}>
                  {disk.currentPendingSectors}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded bg-muted p-2 text-xs">
              <span className="text-muted-foreground">SMART Status</span>
              <span className={cn('font-medium', disk.smartStatus === 'passed' ? 'text-emerald-500' : 'text-red-500')}>
                {disk.smartStatus === 'passed' ? '✓ Passed' : disk.smartStatus === 'failed' ? '✗ Failed' : '? Unknown'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SnapshotsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Snapshots</div>
            <div className="text-muted-foreground text-xs">{snapshots.filter((s) => s.status === 'active').length} active &middot; {snapshots.filter((s) => s.automatic).length} automatic</div>
          </div>
          <Badge variant="outline">{snapshots.length} total</Badge>
        </div>
        <div className="space-y-2">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className={cn(
                'flex items-center gap-3 rounded-md border p-3',
                snap.status !== 'active' && 'opacity-50'
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <Copy className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{snap.name}</span>
                  <Badge variant={snap.status === 'active' ? 'default' : 'outline'}>
                    {snap.status}
                  </Badge>
                  {snap.automatic && (
                    <Badge variant="secondary" className="text-xs">auto</Badge>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  {snap.volume} &middot; {snap.description} &middot; {snap.createdAt}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{formatBytes(snap.size)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BackupsTab() {
  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    running: <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />,
    scheduled: <Clock className="h-4 w-4 text-muted-foreground" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
  }

  return (
    <div className="space-y-4">
      {backups.map((bk) => (
        <div
          key={bk.id}
          className={cn(
            'rounded-lg border bg-card p-4',
            bk.status === 'failed' && 'border-red-500/50'
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusIcons[bk.status] || <Info className="h-4 w-4 text-muted-foreground" />}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{bk.name}</span>
                  <Badge variant={bk.status === 'completed' ? 'default' : bk.status === 'failed' ? 'destructive' : 'outline'}>
                    {bk.status}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{bk.type}</Badge>
                </div>
                <div className="text-muted-foreground text-xs">
                  {bk.source} → {bk.destination}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              {bk.size > 0 && <div className="font-medium">{formatBytes(bk.size)}</div>}
              <div className="text-muted-foreground text-xs">{bk.duration}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <div>
              <div className="text-muted-foreground">Last Run</div>
              <div className="font-medium">{bk.lastRun}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Next Run</div>
              <div className="font-medium">{bk.nextRun}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Retention</div>
              <div className="font-medium">{bk.retentionDays} days</div>
            </div>
            <div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium">{bk.duration}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function IoMetricsTab() {
  const maxRead = Math.max(...ioMetrics.map((m) => m.read))
  const maxWrite = Math.max(...ioMetrics.map((m) => m.write))
  const avgRead = Math.round(ioMetrics.reduce((s, m) => s + m.read, 0) / ioMetrics.length)
  const avgWrite = Math.round(ioMetrics.reduce((s, m) => s + m.write, 0) / ioMetrics.length)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-muted-foreground text-sm">Avg Read</div>
          <div className="mt-1 font-bold text-2xl">{avgRead} MB/s</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-muted-foreground text-sm">Avg Write</div>
          <div className="mt-1 font-bold text-2xl">{avgWrite} MB/s</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-muted-foreground text-sm">Peak Read</div>
          <div className="mt-1 font-bold text-2xl text-emerald-500">{maxRead} MB/s</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-muted-foreground text-sm">Peak Write</div>
          <div className="mt-1 font-bold text-2xl text-blue-500">{maxWrite} MB/s</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">I/O Throughput Over Time</div>
            <div className="text-muted-foreground text-xs">Read vs Write (MB/s) — last 6 hours</div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Read</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />Write</span>
          </div>
        </div>
        <div className="flex h-64 items-end gap-1">
          {ioMetrics.map((point, i) => {
            const maxVal = Math.max(maxRead, maxWrite) * 1.1
            const readHeight = (point.read / maxVal) * 100
            const writeHeight = (point.write / maxVal) * 100
            return (
              <div key={i} className="flex flex-1 items-end gap-px" title={point.time}>
                <div
                  className="w-1/2 rounded-t bg-emerald-500/80 transition-all hover:bg-emerald-500"
                  style={{ height: `${readHeight}%` }}
                />
                <div
                  className="w-1/2 rounded-t bg-blue-500/80 transition-all hover:bg-blue-500"
                  style={{ height: `${writeHeight}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-muted-foreground text-xs">
          <span>04:00</span>
          <span>05:30</span>
          <span>07:00</span>
          <span>08:30</span>
          <span>09:45</span>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 font-medium text-sm">Recent I/O Data</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Read (MB/s)</th>
                <th className="pb-2 pr-4 font-medium">Write (MB/s)</th>
                <th className="pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ioMetrics.slice(-8).reverse().map((point, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-mono">{point.time}</td>
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      {point.read}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3 text-blue-500" />
                      {point.write}
                    </span>
                  </td>
                  <td className="py-2 font-medium">{point.read + point.write} MB/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AlertsTab() {
  const [filter, setFilter] = React.useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const unacknowledged = storageAlerts.filter((a) => !a.acknowledged).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {unacknowledged} unacknowledged alert{unacknowledged !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-1">
          {(['all', 'critical', 'warning', 'info'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={cn(
                'rounded-md px-2 py-1 text-xs capitalize transition-colors',
                filter === level ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {storageAlerts
          .filter((a) => filter === 'all' || a.level === filter)
          .map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border bg-card p-4',
                alert.acknowledged && 'opacity-60'
              )}
            >
              {alert.level === 'critical' ? (
                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
              ) : alert.level === 'warning' ? (
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              ) : (
                <Info className="h-5 w-5 shrink-0 text-blue-500" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm">{alert.message}</div>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                  <span>Source: {alert.source}</span>
                  <span>&middot;</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.acknowledged && (
                  <Badge variant="outline" className="shrink-0">acknowledged</Badge>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function ActivityTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 font-medium text-sm">Storage Activity</div>
        <div className="relative ml-3 border-l-2 border-muted pl-6">
          {storageActivity.map((act, i) => (
            <div key={act.id} className={cn('relative pb-6', i === storageActivity.length - 1 && 'pb-0')}>
              <div className={cn(
                'absolute -left-7.75 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background',
                act.action.includes('Failed') || act.action.includes('Alert') ? 'bg-red-500' :
                act.action.includes('Warning') ? 'bg-amber-500' :
                'bg-emerald-500'
              )} />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{act.action}</span>
                    <span className="text-muted-foreground text-xs">by {act.user}</span>
                  </div>
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    Target: <span className="font-mono">{act.target}</span>
                  </div>
                  <div className="mt-0.5 text-xs">{act.details}</div>
                </div>
                <div className="shrink-0 text-muted-foreground text-xs">{act.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 font-medium text-sm">Storage Policies</div>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel>Automated Snapshots</FieldLabel>
                <p className="text-muted-foreground text-xs">Create automatic snapshots on schedule</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel>SMART Monitoring</FieldLabel>
                <p className="text-muted-foreground text-xs">Run SMART self-tests weekly</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel>Scrub on Degraded</FieldLabel>
                <p className="text-muted-foreground text-xs">Automatically scrub BTRFS volumes when degraded</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel>Backup Notifications</FieldLabel>
                <p className="text-muted-foreground text-xs">Send alerts on backup failures</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel>Temperature Alerts</FieldLabel>
                <p className="text-muted-foreground text-xs">Alert when disk temperature exceeds threshold</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Field>
        </FieldGroup>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 font-medium text-sm">Thresholds</div>
        <FieldGroup>
          <Field>
            <FieldLabel>Volume Usage Warning (%)</FieldLabel>
            <input
              type="number"
              defaultValue={75}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel>Volume Usage Critical (%)</FieldLabel>
            <input
              type="number"
              defaultValue={90}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel>Disk Temperature Warning (°C)</FieldLabel>
            <input
              type="number"
              defaultValue={45}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel>Disk Temperature Critical (°C)</FieldLabel>
            <input
              type="number"
              defaultValue={55}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel>I/O Latency Warning (ms)</FieldLabel>
            <input
              type="number"
              defaultValue={10}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 font-medium text-sm">Backup Defaults</div>
        <FieldGroup>
          <Field>
            <FieldLabel>Default Retention (days)</FieldLabel>
            <input
              type="number"
              defaultValue={30}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel>Compression</FieldLabel>
            <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="zstd">ZSTD (Recommended)</option>
              <option value="lz4">LZ4</option>
              <option value="gzip">GZIP</option>
              <option value="none">None</option>
            </select>
          </Field>
          <Field>
            <FieldLabel>Encryption</FieldLabel>
            <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="aes256">AES-256</option>
              <option value="none">None</option>
            </select>
          </Field>
        </FieldGroup>
      </div>
    </div>
  )
}

export default function StoragePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Storage"
        description="Monitor volumes, disks, backups, and I/O performance"
      >
        <button className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </button>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="volumes">
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Volumes
          </TabsTrigger>
          <TabsTrigger value="disks">
            <HardDrive className="mr-1.5 h-3.5 w-3.5" />
            Disks
          </TabsTrigger>
          <TabsTrigger value="snapshots">
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Snapshots
          </TabsTrigger>
          <TabsTrigger value="backups">
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="io">
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            I/O Metrics
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Terminal className="mr-1.5 h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StorageOverviewTab />
        </TabsContent>
        <TabsContent value="volumes">
          <VolumesTab />
        </TabsContent>
        <TabsContent value="disks">
          <DisksTab />
        </TabsContent>
        <TabsContent value="snapshots">
          <SnapshotsTab />
        </TabsContent>
        <TabsContent value="backups">
          <BackupsTab />
        </TabsContent>
        <TabsContent value="io">
          <IoMetricsTab />
        </TabsContent>
        <TabsContent value="alerts">
          <AlertsTab />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
