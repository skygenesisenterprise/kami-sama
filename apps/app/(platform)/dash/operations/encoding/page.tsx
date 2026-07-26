'use client'

import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  FileVideo,
  Gauge,
  Heart,
  History,
  Info,
  Power,
  RefreshCw,
  Server,
  Settings,
  Thermometer,
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
  encodingData,
  type EncodingData,
  type WorkerStatus,
  type JobStatus,
  type AlertSeverity,
  type GlobalEncodingStatus,
  type EncodingProfile,
  type QualityMetric,
  type EncodingActivityEvent,
  type EncodingEventType,
} from '@/lib/encoding-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function globalStatusTone(s: GlobalEncodingStatus): StatusTone {
  return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'destructive'
}

function workerStatusTone(s: WorkerStatus): StatusTone {
  return s === 'online' || s === 'busy' ? 'success' : s === 'maintenance' ? 'info' : s === 'error' ? 'destructive' : 'neutral'
}

function jobStatusTone(s: JobStatus): StatusTone {
  return s === 'completed' ? 'success' : s === 'encoding' ? 'info' : s === 'failed' ? 'destructive' : s === 'cancelled' ? 'neutral' : 'warning'
}

function alertSeverityTone(s: AlertSeverity): StatusTone {
  return s === 'critical' ? 'destructive' : s === 'warning' ? 'warning' : 'info'
}

function activityIcon(type: EncodingEventType) {
  const map: Record<EncodingEventType, typeof Server> = {
    'job-complete': CheckCircle2,
    'job-failed': XCircle,
    'worker-restart': Power,
    'profile-change': Settings,
    'queue-backlog': Clock,
    'quality-alert': AlertTriangle,
    'worker-down': XCircle,
    'worker-recovery': Heart,
  }
  return map[type] ?? Activity
}

function activityColor(type: EncodingEventType) {
  if (type === 'job-failed' || type === 'worker-down') return 'text-destructive'
  if (type === 'job-complete' || type === 'worker-recovery') return 'text-success'
  if (type === 'profile-change') return 'text-primary'
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

function vmafColor(score: number) {
  if (score >= 96) return 'text-success'
  if (score >= 90) return 'text-warning'
  return 'text-destructive'
}

/* -------------------------------------------------------------------------- */
/*  Overview Tab                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ data }: { data: EncodingData }) {
  const { overview } = data

  const statCards = [
    { label: 'Active Jobs', value: overview.activeJobs, sub: 'encoding now', icon: FileVideo, color: 'text-primary' },
    { label: 'Queued', value: overview.queuedJobs, sub: 'in pipeline', icon: Clock, color: overview.queuedJobs > 10 ? 'text-warning' : 'text-foreground' },
    { label: 'Completed', value: overview.completedToday, sub: 'today', icon: CheckCircle2, color: 'text-success' },
    { label: 'Failed', value: overview.failedToday, sub: 'today', icon: XCircle, color: overview.failedToday > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Workers', value: `${overview.onlineWorkers}/${overview.totalWorkers}`, sub: 'online', icon: Server, color: overview.onlineWorkers === overview.totalWorkers ? 'text-success' : 'text-warning' },
    { label: 'Avg Speed', value: overview.avgEncodingSpeed, sub: 'realtime', icon: Zap, color: 'text-foreground' },
    { label: 'Avg VMAF', value: overview.avgVmafScore.toFixed(1), sub: 'quality score', icon: Gauge, color: vmafColor(overview.avgVmafScore) },
    { label: 'Output', value: `${overview.totalOutputGb} GB`, sub: 'today', icon: Database, color: 'text-foreground' },
    { label: 'GPU Util', value: `${overview.gpuUtilization}%`, sub: 'avg across workers', icon: Cpu, color: gpuUtilColor(overview.gpuUtilization) },
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
            <CardTitle className="text-sm font-medium">GPU Encoding</CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{overview.gpuUtilization}%</span>
              <span className="text-sm text-muted-foreground">NVENC/AV1 load</span>
            </div>
            <Progress value={overview.gpuUtilization} className={cn('h-2', overview.gpuUtilization > 85 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              {data.workers.filter((w) => w.gpu.model !== 'None (CPU only)').map((w) => (
                <div key={w.id} className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">{w.name.split('-').pop()}</p>
                  <p className={cn('text-sm font-semibold', gpuUtilColor(w.gpu.utilization))}>{w.gpu.utilization}%</p>
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
              <span className="text-sm text-muted-foreground">across {overview.totalWorkers} workers</span>
            </div>
            <Progress value={overview.cpuUtilization} className={cn('h-2', overview.cpuUtilization > 80 && '[&>div]:bg-destructive')} />
            <div className="grid grid-cols-3 gap-2 text-center">
              {data.workers.map((w) => (
                <div key={w.id} className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">{w.name.split('-').pop()}</p>
                  <p className={cn('text-sm font-semibold', w.cpu.utilization > 80 ? 'text-destructive' : w.cpu.utilization > 60 ? 'text-warning' : 'text-foreground')}>{w.cpu.utilization}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality (VMAF)</CardTitle>
            <Gauge className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className={cn('text-3xl font-bold', vmafColor(overview.avgVmafScore))}>{overview.avgVmafScore}</span>
              <span className="text-sm text-muted-foreground">avg score</span>
            </div>
            <Progress value={overview.avgVmafScore} className="h-2" />
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Best</p>
                <p className="text-sm font-semibold text-success">{Math.max(...data.quality.map((q) => q.vmafScore)).toFixed(1)}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Worst</p>
                <p className={cn('text-sm font-semibold', vmafColor(Math.min(...data.quality.map((q) => q.vmafScore))))}>{Math.min(...data.quality.map((q) => q.vmafScore)).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Workers Tab                                                               */
/* -------------------------------------------------------------------------- */

function WorkersTab({ workers }: { workers: EncodingData['workers'] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {workers.map((worker) => (
        <Card key={worker.id} className={cn(worker.status === 'offline' && 'opacity-60')}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Server className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{worker.name}</h3>
                    <StatusBadge tone={workerStatusTone(worker.status)} pulse={worker.status === 'busy'}>
                      {worker.status}
                    </StatusBadge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{worker.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {worker.hostname} &middot; {worker.ip} &middot; {worker.os}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {worker.gpu.model !== 'None (CPU only)' && (
                  <div className="flex items-center gap-1">
                    <Thermometer className={cn('size-3.5', temperatureColor(worker.gpu.temperature))} />
                    <span className={cn('text-sm font-semibold', temperatureColor(worker.gpu.temperature))}>
                      {worker.gpu.temperature}°C
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">{worker.gpu.model}</p>
              </div>
            </div>

            <Separator />

            {worker.gpu.model !== 'None (CPU only)' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">GPU ({worker.gpu.encoder})</span>
                  <span className={cn('text-xs font-semibold', gpuUtilColor(worker.gpu.utilization))}>{worker.gpu.utilization}%</span>
                </div>
                <Progress value={worker.gpu.utilization} className={cn('h-1.5', worker.gpu.utilization > 85 && '[&>div]:bg-destructive')} />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>VRAM: {formatVram(worker.gpu.vramUsedMb)} / {formatVram(worker.gpu.vramTotalMb)}</span>
                  <span>Encoder: {worker.gpu.encoderLoad}%</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">CPU ({worker.cpu.cores} cores)</span>
                <span className="text-xs font-medium">{worker.cpu.utilization}%</span>
              </div>
              <Progress value={worker.cpu.utilization} className={cn('h-1.5', worker.cpu.utilization > 80 && '[&>div]:bg-destructive')} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">RAM</span>
                <span className="text-xs font-medium">{worker.ram.utilization}% &middot; {formatBytes(worker.ram.usedMb)} / {formatBytes(worker.ram.totalMb)}</span>
              </div>
              <Progress value={worker.ram.utilization} className={cn('h-1.5', worker.ram.utilization > 80 && '[&>div]:bg-destructive')} />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Jobs</p>
                <p className="font-semibold">{worker.activeJobs}/{worker.maxJobs}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Done</p>
                <p className="font-semibold">{worker.completedToday}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Failed</p>
                <p className={cn('font-semibold', worker.failedToday > 0 ? 'text-destructive' : 'text-foreground')}>{worker.failedToday}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Speed</p>
                <p className="font-semibold">{worker.avgSpeed}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uptime: {worker.uptime}</span>
              <span>v{worker.version}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Jobs Tab                                                                  */
/* -------------------------------------------------------------------------- */

function JobsTab({ jobs }: { jobs: EncodingData['jobs'] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Codec</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} className={cn(job.status === 'failed' && 'bg-destructive/5')}>
                <TableCell>
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-50">{job.sourceFile}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{job.workerName}</TableCell>
                <TableCell>
                  <StatusBadge tone={jobStatusTone(job.status)}>{job.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{job.profile}</Badge>
                </TableCell>
                <TableCell className="text-xs font-mono">{job.inputCodec} → {job.outputCodec}</TableCell>
                <TableCell className="text-sm">{job.outputResolution}</TableCell>
                <TableCell>
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className={cn('h-1', job.status === 'failed' && '[&>div]:bg-destructive')} />
                  </div>
                </TableCell>
                <TableCell className="text-sm font-mono">{job.speed}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {job.etaSec !== null ? `${Math.ceil(job.etaSec / 60)}m` : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {job.outputSizeGb !== null ? `${job.outputSizeGb} GB` : `${job.inputSizeGb} GB`}
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
/*  Profiles Tab                                                              */
/* -------------------------------------------------------------------------- */

function ProfilesTab({ profiles }: { profiles: EncodingProfile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {profiles.map((profile) => (
        <Card key={profile.id} className={cn(!profile.enabled && 'opacity-60')}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{profile.name}</h3>
                  <Badge variant={profile.enabled ? 'default' : 'outline'} className="text-[10px]">
                    {profile.enabled ? 'enabled' : 'disabled'}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{profile.codec}</span>
                  <span>&middot;</span>
                  <span>{profile.container}</span>
                  <span>&middot;</span>
                  <span>{profile.resolution}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={cn('text-2xl font-bold', vmafColor(profile.avgVmaf))}>{profile.avgVmaf.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">avg VMAF</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">CRF</div>
                <div className="font-medium font-mono">{profile.crf === 0 ? 'Lossless' : profile.crf}</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Preset</div>
                <div className="font-medium capitalize">{profile.preset}</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Framerate</div>
                <div className="font-medium">{profile.framerate} fps</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Audio</div>
                <div className="font-medium">{profile.audioCodec} {profile.audioBitrate}</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">HW Accel</div>
                <div className={cn('font-medium', profile.hardwareAccel ? 'text-success' : 'text-muted-foreground')}>
                  {profile.hardwareAccel ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">HDR</div>
                <div className={cn('font-medium', profile.hdr ? 'text-success' : 'text-muted-foreground')}>
                  {profile.hdr ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded bg-muted p-2 text-xs">
              <span className="text-muted-foreground">Used in {profile.jobsUsed} jobs &middot; Avg speed: {profile.avgSpeed}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Quality Tab                                                               */
/* -------------------------------------------------------------------------- */

function QualityTab({ quality }: { quality: QualityMetric[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="size-3.5" />
              Avg VMAF
            </div>
            <p className={cn('text-2xl font-bold tracking-tight', vmafColor(quality.reduce((s, q) => s + q.vmafScore, 0) / quality.length))}>
              {(quality.reduce((s, q) => s + q.vmafScore, 0) / quality.length).toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="size-3.5" />
              Avg SSIM
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {(quality.reduce((s, q) => s + q.ssimScore, 0) / quality.length).toFixed(4)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" />
              Avg PSNR
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {(quality.reduce((s, q) => s + q.psnrScore, 0) / quality.length).toFixed(1)} dB
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>VMAF</TableHead>
                <TableHead>SSIM</TableHead>
                <TableHead>PSNR</TableHead>
                <TableHead>Bitrate</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead>Codec</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quality.map((q) => (
                <TableRow key={q.jobId}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>
                    <span className={cn('font-semibold', vmafColor(q.vmafScore))}>{q.vmafScore.toFixed(1)}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{q.ssimScore.toFixed(4)}</TableCell>
                  <TableCell className="text-sm">{q.psnrScore.toFixed(1)} dB</TableCell>
                  <TableCell className="text-sm">{q.bitrate}</TableCell>
                  <TableCell className="text-sm">{q.resolution}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] font-mono">{q.codec}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{timeAgo(q.completedAt)}</TableCell>
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
/*  Alerts Tab                                                                */
/* -------------------------------------------------------------------------- */

function AlertsTab({ alerts }: { alerts: EncodingData['alerts'] }) {
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
                  <span>Worker: {alert.workerName}</span>
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

function ActivityTab({ activities }: { activities: EncodingData['activities'] }) {
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
                    <span className="text-xs text-muted-foreground">{act.workerName}</span>
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
  { value: 'workers', label: 'Workers', icon: Server },
  { value: 'jobs', label: 'Jobs', icon: FileVideo },
  { value: 'profiles', label: 'Profiles', icon: Settings },
  { value: 'quality', label: 'Quality', icon: Gauge },
  { value: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { value: 'activity', label: 'Activity', icon: History },
] as const

export default function EncodingPage() {
  const data = encodingData

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Encoding"
        description="Monitor encoding workers, job pipelines, codec profiles and output quality."
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
        <TabsContent value="workers">
          <WorkersTab workers={data.workers} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab jobs={data.jobs} />
        </TabsContent>
        <TabsContent value="profiles">
          <ProfilesTab profiles={data.profiles} />
        </TabsContent>
        <TabsContent value="quality">
          <QualityTab quality={data.quality} />
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
