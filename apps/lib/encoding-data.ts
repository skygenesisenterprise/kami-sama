export type WorkerStatus = 'online' | 'offline' | 'busy' | 'maintenance' | 'error'
export type JobStatus = 'queued' | 'encoding' | 'completed' | 'failed' | 'cancelled' | 'paused'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type GlobalEncodingStatus = 'healthy' | 'degraded' | 'critical'
export type EncodingEventType = 'job-complete' | 'job-failed' | 'worker-restart' | 'profile-change' | 'queue-backlog' | 'quality-alert' | 'worker-down' | 'worker-recovery'

export interface EncodingOverview {
  globalStatus: GlobalEncodingStatus
  lastHeartbeat: string
  totalWorkers: number
  onlineWorkers: number
  activeJobs: number
  queuedJobs: number
  completedToday: number
  failedToday: number
  avgEncodingSpeed: string
  avgVmafScore: number
  totalOutputGb: number
  cpuUtilization: number
  gpuUtilization: number
  ramUtilization: number
  uptime: string
}

export interface EncodingWorker {
  id: string
  name: string
  hostname: string
  ip: string
  status: WorkerStatus
  role: 'primary' | 'secondary' | 'standby'
  gpu: {
    model: string
    utilization: number
    vramUsedMb: number
    vramTotalMb: number
    temperature: number
    encoder: string
    encoderLoad: number
  }
  cpu: {
    cores: number
    utilization: number
    model: string
  }
  ram: {
    usedMb: number
    totalMb: number
    utilization: number
  }
  activeJobs: number
  maxJobs: number
  completedToday: number
  failedToday: number
  avgSpeed: string
  uptime: string
  lastSeen: string
  version: string
  os: string
}

export interface EncodingJob {
  id: string
  title: string
  sourceFile: string
  workerId: string
  workerName: string
  status: JobStatus
  profile: string
  inputCodec: string
  outputCodec: string
  inputResolution: string
  outputResolution: string
  progress: number
  speed: string
  fps: number
  etaSec: number | null
  startedAt: string | null
  estimatedDuration: string
  inputSizeGb: number
  outputSizeGb: number | null
  priority: 'high' | 'normal' | 'low'
  initiatedBy: string
}

export interface EncodingProfile {
  id: string
  name: string
  codec: string
  container: string
  preset: string
  crf: number
  resolution: string
  framerate: number
  audioCodec: string
  audioBitrate: string
  audioChannels: number
  hardwareAccel: boolean
  hdr: boolean
  twoPass: boolean
  jobsUsed: number
  avgVmaf: number
  avgSpeed: string
  enabled: boolean
}

export interface QualityMetric {
  jobId: string
  title: string
  vmafScore: number
  ssimScore: number
  psnrScore: number
  bitrate: string
  resolution: string
  codec: string
  completedAt: string
}

export interface EncodingAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  workerId: string
  workerName: string
  source: string
  date: string
  status: AlertStatus
}

export interface EncodingActivityEvent {
  id: string
  type: EncodingEventType
  message: string
  workerName: string
  timestamp: string
  details: string | null
}

export interface EncodingData {
  overview: EncodingOverview
  workers: EncodingWorker[]
  jobs: EncodingJob[]
  profiles: EncodingProfile[]
  quality: QualityMetric[]
  alerts: EncodingAlert[]
  activities: EncodingActivityEvent[]
}

export const encodingData: EncodingData = {
  overview: {
    globalStatus: 'healthy',
    lastHeartbeat: new Date(Date.now() - 15_000).toISOString(),
    totalWorkers: 3,
    onlineWorkers: 3,
    activeJobs: 5,
    queuedJobs: 8,
    completedToday: 47,
    failedToday: 2,
    avgEncodingSpeed: '142x',
    avgVmafScore: 96.8,
    totalOutputGb: 284,
    cpuUtilization: 62,
    gpuUtilization: 74,
    ramUtilization: 55,
    uptime: '47d 12h',
  },
  workers: [
    {
      id: 'ew-001',
      name: 'encoder-primary',
      hostname: 'encoder-primary.local',
      ip: '10.0.2.10',
      status: 'busy',
      role: 'primary',
      gpu: {
        model: 'NVIDIA RTX 4090',
        utilization: 82,
        vramUsedMb: 18400,
        vramTotalMb: 24576,
        temperature: 64,
        encoder: 'NVENC AV1',
        encoderLoad: 78,
      },
      cpu: {
        cores: 16,
        utilization: 58,
        model: 'AMD Ryzen 9 7950X',
      },
      ram: {
        usedMb: 28200,
        totalMb: 65536,
        utilization: 43,
      },
      activeJobs: 3,
      maxJobs: 4,
      completedToday: 22,
      failedToday: 0,
      avgSpeed: '156x',
      uptime: '47d 12h',
      lastSeen: new Date(Date.now() - 15_000).toISOString(),
      version: '2.1.0',
      os: 'Ubuntu 24.04',
    },
    {
      id: 'ew-002',
      name: 'encoder-worker-1',
      hostname: 'encoder-worker1.local',
      ip: '10.0.2.11',
      status: 'busy',
      role: 'secondary',
      gpu: {
        model: 'NVIDIA RTX 3090',
        utilization: 91,
        vramUsedMb: 20100,
        vramTotalMb: 24576,
        temperature: 72,
        encoder: 'NVENC H.265',
        encoderLoad: 88,
      },
      cpu: {
        cores: 12,
        utilization: 74,
        model: 'AMD Ryzen 7 7800X3D',
      },
      ram: {
        usedMb: 24800,
        totalMb: 32768,
        utilization: 76,
      },
      activeJobs: 2,
      maxJobs: 3,
      completedToday: 18,
      failedToday: 1,
      avgSpeed: '128x',
      uptime: '31d 6h',
      lastSeen: new Date(Date.now() - 20_000).toISOString(),
      version: '2.1.0',
      os: 'Ubuntu 24.04',
    },
    {
      id: 'ew-003',
      name: 'encoder-cpu-1',
      hostname: 'encoder-cpu1.local',
      ip: '10.0.2.12',
      status: 'online',
      role: 'standby',
      gpu: {
        model: 'None (CPU only)',
        utilization: 0,
        vramUsedMb: 0,
        vramTotalMb: 0,
        temperature: 0,
        encoder: 'libx265',
        encoderLoad: 0,
      },
      cpu: {
        cores: 32,
        utilization: 42,
        model: 'AMD Ryzen 9 7970X',
      },
      ram: {
        usedMb: 18600,
        totalMb: 131072,
        utilization: 14,
      },
      activeJobs: 0,
      maxJobs: 8,
      completedToday: 7,
      failedToday: 1,
      avgSpeed: '12x',
      uptime: '47d 12h',
      lastSeen: new Date(Date.now() - 30_000).toISOString(),
      version: '2.1.0',
      os: 'Ubuntu 24.04',
    },
  ],
  jobs: [
    { id: 'ej-001', title: 'Dune Part Two — 4K AV1', sourceFile: '/mnt/media/movies/dune2.mkv', workerId: 'ew-001', workerName: 'encoder-primary', status: 'encoding', profile: 'Streaming 4K AV1', inputCodec: 'H.264', outputCodec: 'AV1', inputResolution: '3840x2160', outputResolution: '3840x2160', progress: 45, speed: '156x', fps: 120, etaSec: 240, startedAt: new Date(Date.now() - 180_000).toISOString(), estimatedDuration: '7m', inputSizeGb: 48.2, outputSizeGb: null, priority: 'high', initiatedBy: 'alice' },
    { id: 'ej-002', title: 'The Bear S3E07 — 1080p H.265', sourceFile: '/mnt/media/tv/thebear/s3e07.mkv', workerId: 'ew-001', workerName: 'encoder-primary', status: 'encoding', profile: 'Streaming 1080p H.265', inputCodec: 'ProRes', outputCodec: 'H.265', inputResolution: '1920x1080', outputResolution: '1920x1080', progress: 72, speed: '189x', fps: 240, etaSec: 90, startedAt: new Date(Date.now() - 120_000).toISOString(), estimatedDuration: '4m', inputSizeGb: 12.4, outputSizeGb: null, priority: 'normal', initiatedBy: 'system' },
    { id: 'ej-003', title: 'Interstellar — 4K H.265 HDR', sourceFile: '/mnt/media/movies/interstellar.mkv', workerId: 'ew-002', workerName: 'encoder-worker-1', status: 'encoding', profile: 'Streaming 4K H.265 HDR', inputCodec: 'H.264', outputCodec: 'H.265', inputResolution: '3840x2160', outputResolution: '3840x2160', progress: 28, speed: '128x', fps: 85, etaSec: 420, startedAt: new Date(Date.now() - 240_000).toISOString(), estimatedDuration: '12m', inputSizeGb: 52.0, outputSizeGb: null, priority: 'normal', initiatedBy: 'charlie' },
    { id: 'ej-004', title: 'Severance S2E01 — 1080p H.264', sourceFile: '/mnt/media/tv/severance/s2e01.mkv', workerId: 'ew-001', workerName: 'encoder-primary', status: 'encoding', profile: 'Legacy 1080p H.264', inputCodec: 'H.265', outputCodec: 'H.264', inputResolution: '1920x1080', outputResolution: '1920x1080', progress: 89, speed: '201x', fps: 310, etaSec: 30, startedAt: new Date(Date.now() - 60_000).toISOString(), estimatedDuration: '2m', inputSizeGb: 8.1, outputSizeGb: null, priority: 'low', initiatedBy: 'system' },
    { id: 'ej-005', title: 'Planet Earth III E04 — 4K AV1', sourceFile: '/mnt/media/tv/planeteearth/s1e04.mkv', workerId: 'ew-002', workerName: 'encoder-worker-1', status: 'encoding', profile: 'Streaming 4K AV1', inputCodec: 'H.264', outputCodec: 'AV1', inputResolution: '3840x2160', outputResolution: '3840x2160', progress: 12, speed: '112x', fps: 68, etaSec: 600, startedAt: new Date(Date.now() - 300_000).toISOString(), estimatedDuration: '15m', inputSizeGb: 44.0, outputSizeGb: null, priority: 'normal', initiatedBy: 'grace' },
    { id: 'ej-006', title: 'Oppenheimer — 4K H.265', sourceFile: '/mnt/media/movies/oppenheimer.mkv', workerId: 'ew-002', workerName: 'encoder-worker-1', status: 'queued', profile: 'Streaming 4K H.265 HDR', inputCodec: 'H.264', outputCodec: 'H.265', inputResolution: '3840x2160', outputResolution: '3840x2160', progress: 0, speed: '—', fps: 0, etaSec: null, startedAt: null, estimatedDuration: '14m', inputSizeGb: 58.0, outputSizeGb: null, priority: 'normal', initiatedBy: 'eve' },
    { id: 'ej-007', title: 'Poor Things — 1080p H.265', sourceFile: '/mnt/media/movies/poorthings.mkv', workerId: 'ew-001', workerName: 'encoder-primary', status: 'queued', profile: 'Streaming 1080p H.265', inputCodec: 'H.264', outputCodec: 'H.265', inputResolution: '1920x1080', outputResolution: '1920x1080', progress: 0, speed: '—', fps: 0, etaSec: null, startedAt: null, estimatedDuration: '5m', inputSizeGb: 14.5, outputSizeGb: null, priority: 'low', initiatedBy: 'system' },
    { id: 'ej-008', title: 'Civil War — 4K AV1 HDR', sourceFile: '/mnt/media/movies/civilwar.mkv', workerId: 'ew-003', workerName: 'encoder-cpu-1', status: 'queued', profile: 'Streaming 4K AV1', inputCodec: 'H.264', outputCodec: 'AV1', inputResolution: '3840x2160', outputResolution: '3840x2160', progress: 0, speed: '—', fps: 0, etaSec: null, startedAt: null, estimatedDuration: '45m', inputSizeGb: 44.0, outputSizeGb: null, priority: 'normal', initiatedBy: 'system' },
    { id: 'ej-009', title: 'Past Lives — 1080p H.265', sourceFile: '/mnt/media/movies/pastlives.mkv', workerId: 'ew-001', workerName: 'encoder-primary', status: 'completed', profile: 'Streaming 1080p H.265', inputCodec: 'H.264', outputCodec: 'H.265', inputResolution: '1920x1080', outputResolution: '1920x1080', progress: 100, speed: '178x', fps: 280, etaSec: 0, startedAt: new Date(Date.now() - 900_000).toISOString(), estimatedDuration: '3m', inputSizeGb: 11.2, outputSizeGb: 4.8, priority: 'normal', initiatedBy: 'system' },
    { id: 'ej-010', title: 'Killers of the Flower Moon — 4K', sourceFile: '/mnt/media/movies/killers.mkv', workerId: 'ew-002', workerName: 'encoder-worker-1', status: 'failed', profile: 'Streaming 4K H.265 HDR', inputCodec: 'H.264', outputCodec: 'H.265', inputResolution: '3840x2160', outputResolution: '3840x2160', progress: 34, speed: '—', fps: 0, etaSec: null, startedAt: new Date(Date.now() - 600_000).toISOString(), estimatedDuration: '18m', inputSizeGb: 68.0, outputSizeGb: null, priority: 'normal', initiatedBy: 'system' },
    { id: 'ej-011', title: 'Shogun S1E10 — 1080p H.265', sourceFile: '/mnt/media/tv/shogun/s1e10.mkv', workerId: 'ew-003', workerName: 'encoder-cpu-1', status: 'completed', profile: 'Legacy 1080p H.264', inputCodec: 'H.264', outputCodec: 'H.264', inputResolution: '1920x1080', outputResolution: '1920x1080', progress: 100, speed: '14x', fps: 22, etaSec: 0, startedAt: new Date(Date.now() - 1800_000).toISOString(), estimatedDuration: '8m', inputSizeGb: 9.6, outputSizeGb: 5.2, priority: 'normal', initiatedBy: 'system' },
  ],
  profiles: [
    { id: 'ep-001', name: 'Streaming 4K AV1', codec: 'AV1', container: 'MKV', preset: 'slow', crf: 28, resolution: '3840x2160', framerate: 24, audioCodec: 'Opus', audioBitrate: '256k', audioChannels: 8, hardwareAccel: true, hdr: true, twoPass: false, jobsUsed: 34, avgVmaf: 97.2, avgSpeed: '134x', enabled: true },
    { id: 'ep-002', name: 'Streaming 4K H.265 HDR', codec: 'H.265', container: 'MKV', preset: 'medium', crf: 22, resolution: '3840x2160', framerate: 24, audioCodec: 'EAC3', audioBitrate: '640k', audioChannels: 8, hardwareAccel: true, hdr: true, twoPass: false, jobsUsed: 28, avgVmaf: 96.8, avgSpeed: '128x', enabled: true },
    { id: 'ep-003', name: 'Streaming 1080p H.265', codec: 'H.265', container: 'MKV', preset: 'fast', crf: 24, resolution: '1920x1080', framerate: 24, audioCodec: 'AAC', audioBitrate: '192k', audioChannels: 6, hardwareAccel: true, hdr: false, twoPass: false, jobsUsed: 52, avgVmaf: 95.4, avgSpeed: '189x', enabled: true },
    { id: 'ep-004', name: 'Legacy 1080p H.264', codec: 'H.264', container: 'MP4', preset: 'fast', crf: 20, resolution: '1920x1080', framerate: 24, audioCodec: 'AAC', audioBitrate: '192k', audioChannels: 6, hardwareAccel: true, hdr: false, twoPass: false, jobsUsed: 18, avgVmaf: 93.1, avgSpeed: '201x', enabled: true },
    { id: 'ep-005', name: 'Archive Lossless', codec: 'H.264', container: 'MKV', preset: 'veryslow', crf: 0, resolution: '3840x2160', framerate: 24, audioCodec: 'FLAC', audioBitrate: 'lossless', audioChannels: 8, hardwareAccel: false, hdr: true, twoPass: true, jobsUsed: 4, avgVmaf: 99.8, avgSpeed: '2x', enabled: false },
    { id: 'ep-006', name: 'Mobile 720p H.264', codec: 'H.264', container: 'MP4', preset: 'veryfast', crf: 26, resolution: '1280x720', framerate: 30, audioCodec: 'AAC', audioBitrate: '128k', audioChannels: 2, hardwareAccel: true, hdr: false, twoPass: false, jobsUsed: 0, avgVmaf: 88.5, avgSpeed: '312x', enabled: false },
  ],
  quality: [
    { jobId: 'ej-009', title: 'Past Lives — 1080p H.265', vmafScore: 96.4, ssimScore: 0.9847, psnrScore: 42.3, bitrate: '4.8 Mbps', resolution: '1920x1080', codec: 'H.265', completedAt: new Date(Date.now() - 900_000).toISOString() },
    { jobId: 'ej-011', title: 'Shogun S1E10 — 1080p H.264', vmafScore: 93.1, ssimScore: 0.9712, psnrScore: 39.8, bitrate: '5.2 Mbps', resolution: '1920x1080', codec: 'H.264', completedAt: new Date(Date.now() - 1800_000).toISOString() },
    { jobId: 'q-001', title: 'Dune Part Two — 4K AV1 (prev)', vmafScore: 97.8, ssimScore: 0.9921, psnrScore: 46.2, bitrate: '12.4 Mbps', resolution: '3840x2160', codec: 'AV1', completedAt: new Date(Date.now() - 86400_000).toISOString() },
    { jobId: 'q-002', title: 'Interstellar — 4K H.265 HDR (prev)', vmafScore: 96.8, ssimScore: 0.9889, psnrScore: 44.7, bitrate: '18.2 Mbps', resolution: '3840x2160', codec: 'H.265', completedAt: new Date(Date.now() - 86400_000).toISOString() },
    { jobId: 'q-003', title: 'The Bear S3E07 — 1080p (prev)', vmafScore: 95.9, ssimScore: 0.9801, psnrScore: 41.5, bitrate: '6.8 Mbps', resolution: '1920x1080', codec: 'H.265', completedAt: new Date(Date.now() - 43200_000).toISOString() },
    { jobId: 'q-004', title: 'Severance S2E01 — 1080p (prev)', vmafScore: 94.2, ssimScore: 0.9745, psnrScore: 40.1, bitrate: '5.6 Mbps', resolution: '1920x1080', codec: 'H.264', completedAt: new Date(Date.now() - 43200_000).toISOString() },
  ],
  alerts: [
    { id: 'ea-001', severity: 'critical', title: 'Encoder crash: Killers of the Flower Moon', description: 'NVENC session terminated — GPU memory overflow during 4K HDR encode at CRF 22', workerId: 'ew-002', workerName: 'encoder-worker-1', source: 'nvenc', date: new Date(Date.now() - 600_000).toISOString(), status: 'active' },
    { id: 'ea-002', severity: 'warning', title: 'GPU temperature high on encoder-worker-1', description: 'GPU temp reached 72°C — approaching thermal throttle threshold (75°C)', workerId: 'ew-002', workerName: 'encoder-worker-1', source: 'gpu-monitor', date: new Date(Date.now() - 180_000).toISOString(), status: 'active' },
    { id: 'ea-003', severity: 'warning', title: 'VRAM usage high on encoder-primary', description: 'GPU memory at 75% — 18.4 GB / 24 GB allocated across 3 concurrent jobs', workerId: 'ew-001', workerName: 'encoder-primary', source: 'gpu-monitor', date: new Date(Date.now() - 120_000).toISOString(), status: 'active' },
    { id: 'ea-004', severity: 'info', title: 'Encoding queue backlog growing', description: '8 jobs queued — estimated wait time 15 minutes at current throughput', workerId: 'ew-001', workerName: 'encoder-primary', source: 'queue-manager', date: new Date(Date.now() - 60_000).toISOString(), status: 'active' },
    { id: 'ea-005', severity: 'info', title: 'Profile updated: Streaming 4K AV1', description: 'CRF changed from 30 to 28 — improved quality target for HDR content', workerId: 'ew-001', workerName: 'encoder-primary', source: 'profile-manager', date: new Date(Date.now() - 3600_000).toISOString(), status: 'acknowledged' },
    { id: 'ea-006', severity: 'warning', title: 'CPU encoder fallback active', description: 'encoder-cpu-1 handling overflow — libx265 at 12x speed vs GPU 134x', workerId: 'ew-003', workerName: 'encoder-cpu-1', source: 'scheduler', date: new Date(Date.now() - 300_000).toISOString(), status: 'acknowledged' },
  ],
  activities: [
    { id: 'eact-001', type: 'job-complete', message: 'Encoding completed: Past Lives — 1080p H.265', workerName: 'encoder-primary', timestamp: new Date(Date.now() - 900_000).toISOString(), details: 'VMAF: 96.4 | Output: 4.8 GB | Speed: 178x | Duration: 3m' },
    { id: 'eact-002', type: 'job-failed', message: 'Encoding failed: Killers of the Flower Moon — 4K', workerName: 'encoder-worker-1', timestamp: new Date(Date.now() - 600_000).toISOString(), details: 'Error: NVENC memory overflow | CRF: 22 | Input: 68 GB | Job queued for retry with lower preset' },
    { id: 'eact-003', type: 'quality-alert', message: 'GPU temperature warning on encoder-worker-1', workerName: 'encoder-worker-1', timestamp: new Date(Date.now() - 180_000).toISOString(), details: 'Temperature: 72°C | Threshold: 75°C | Fan speed: 88% | Active jobs: 2' },
    { id: 'eact-004', type: 'queue-backlog', message: 'Encoding queue backlog growing', workerName: 'encoder-primary', timestamp: new Date(Date.now() - 60_000).toISOString(), details: 'Queued: 8 jobs | Active: 5 jobs | Estimated wait: 15 minutes | GPU util: 74%' },
    { id: 'eact-005', type: 'job-complete', message: 'Encoding completed: Shogun S1E10 — 1080p H.264', workerName: 'encoder-cpu-1', timestamp: new Date(Date.now() - 1800_000).toISOString(), details: 'VMAF: 93.1 | Output: 5.2 GB | Speed: 14x (CPU) | Duration: 8m' },
    { id: 'eact-006', type: 'profile-change', message: 'Encoding profile updated: Streaming 4K AV1', workerName: 'encoder-primary', timestamp: new Date(Date.now() - 3600_000).toISOString(), details: 'CRF: 30 → 28 | Preset: medium (unchanged) | Target VMAF: 97+' },
    { id: 'eact-007', type: 'worker-recovery', message: 'Worker encoder-worker-1 recovered from thermal throttling', workerName: 'encoder-worker-1', timestamp: new Date(Date.now() - 2400_000).toISOString(), details: 'GPU temp: 75°C → 62°C | Duration: 8 minutes | Jobs paused during cooldown' },
    { id: 'eact-008', type: 'job-complete', message: 'Encoding completed: Dune Part Two — 4K AV1', workerName: 'encoder-primary', timestamp: new Date(Date.now() - 7200_000).toISOString(), details: 'VMAF: 97.8 | Output: 12.4 GB | Speed: 156x | Duration: 7m' },
    { id: 'eact-009', type: 'worker-restart', message: 'Worker encoder-cpu-1 restarted', workerName: 'encoder-cpu-1', timestamp: new Date(Date.now() - 14400_000).toISOString(), details: 'Reason: Config reload | Duration: 12 seconds | Queued jobs preserved' },
    { id: 'eact-010', type: 'job-complete', message: 'Batch encoding completed: 12 episodes — The Bear S3', workerName: 'encoder-primary', timestamp: new Date(Date.now() - 28800_000).toISOString(), details: 'Total output: 57.6 GB | Avg VMAF: 95.9 | Avg speed: 189x | Duration: 42m total' },
  ],
}
