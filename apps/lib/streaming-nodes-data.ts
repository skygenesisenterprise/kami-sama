export type NodeStatus = 'online' | 'offline' | 'overloaded' | 'maintenance'
export type StreamStatus = 'playing' | 'buffering' | 'transcoding' | 'paused' | 'error'
export type TranscodeStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type GlobalClusterStatus = 'healthy' | 'degraded' | 'critical'

export interface StreamingOverview {
  globalStatus: GlobalClusterStatus
  lastHeartbeat: string
  totalNodes: number
  onlineNodes: number
  activeStreams: number
  peakConcurrent: number
  totalBandwidthMbps: number
  avgTranscodeTimeSec: number
  gpuUtilization: number
  cpuUtilization: number
  ramUtilization: number
  totalStorageUsed: string
  totalStorage: string
  queuedTranscodes: number
  failedTranscodes24h: number
  uptime: string
}

export interface StreamingNode {
  id: string
  name: string
  hostname: string
  ip: string
  status: NodeStatus
  role: 'primary' | 'secondary' | 'standby'
  gpu: {
    model: string
    utilization: number
    vramUsedMb: number
    vramTotalMb: number
    temperature: number
    encoder: string
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
  storage: {
    usedGb: number
    totalGb: number
  }
  network: {
    inboundMbps: number
    outboundMbps: number
  }
  concurrentStreams: number
  maxStreams: number
  activeTranscodes: number
  uptime: string
  lastSeen: string
  version: string
  os: string
}

export interface ActiveStream {
  id: string
  title: string
  user: string
  nodeId: string
  nodeName: string
  client: string
  protocol: 'hls' | 'dash' | 'directplay' | 'transcode'
  status: StreamStatus
  quality: string
  bitrateMbps: number
  resolution: string
  codec: string
  audioCodec: string
  progress: number
  bufferPercent: number
  startedAt: string
  duration: string
}

export interface TranscodeJob {
  id: string
  title: string
  nodeId: string
  nodeName: string
  status: TranscodeStatus
  inputCodec: string
  outputCodec: string
  resolution: string
  progress: number
  etaSec: number | null
  startedAt: string | null
  estimatedDuration: string
  fileSizeMb: number
  priority: 'high' | 'normal' | 'low'
  initiatedBy: string
}

export interface NodeBandwidth {
  time: string
  node1: number
  node2: number
  node3: number
}

export interface NodeAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  nodeId: string
  nodeName: string
  source: string
  date: string
  status: AlertStatus
}

export interface NodeActivityEvent {
  id: string
  type: 'stream-start' | 'stream-end' | 'transcode-complete' | 'node-restart' | 'gpu-alert' | 'node-down' | 'node-recovery' | 'config-change'
  message: string
  nodeName: string
  timestamp: string
  details: string | null
}

export interface StreamingData {
  overview: StreamingOverview
  nodes: StreamingNode[]
  streams: ActiveStream[]
  transcodes: TranscodeJob[]
  bandwidth: NodeBandwidth[]
  alerts: NodeAlert[]
  activities: NodeActivityEvent[]
}

export const streamingData: StreamingData = {
  overview: {
    globalStatus: 'healthy',
    lastHeartbeat: new Date(Date.now() - 30_000).toISOString(),
    totalNodes: 3,
    onlineNodes: 3,
    activeStreams: 24,
    peakConcurrent: 48,
    totalBandwidthMbps: 2840,
    avgTranscodeTimeSec: 12,
    gpuUtilization: 67,
    cpuUtilization: 42,
    ramUtilization: 58,
    totalStorageUsed: '4.2 TB',
    totalStorage: '8.0 TB',
    queuedTranscodes: 3,
    failedTranscodes24h: 1,
    uptime: '47d 12h',
  },
  nodes: [
    {
      id: 'sn-001',
      name: 'stream-primary',
      hostname: 'stream-primary.local',
      ip: '10.0.1.10',
      status: 'online',
      role: 'primary',
      gpu: {
        model: 'NVIDIA RTX 4090',
        utilization: 78,
        vramUsedMb: 14200,
        vramTotalMb: 24576,
        temperature: 62,
        encoder: 'NVENC H.265',
      },
      cpu: {
        cores: 16,
        utilization: 45,
        model: 'AMD Ryzen 9 7950X',
      },
      ram: {
        usedMb: 24500,
        totalMb: 65536,
        utilization: 37,
      },
      storage: {
        usedGb: 1800,
        totalGb: 4000,
      },
      network: {
        inboundMbps: 850,
        outboundMbps: 1200,
      },
      concurrentStreams: 12,
      maxStreams: 16,
      activeTranscodes: 4,
      uptime: '47d 12h',
      lastSeen: new Date(Date.now() - 30_000).toISOString(),
      version: '1.32.8',
      os: 'Ubuntu 24.04',
    },
    {
      id: 'sn-002',
      name: 'stream-worker-1',
      hostname: 'stream-worker1.local',
      ip: '10.0.1.11',
      status: 'online',
      role: 'secondary',
      gpu: {
        model: 'NVIDIA RTX 3080 Ti',
        utilization: 92,
        vramUsedMb: 9800,
        vramTotalMb: 12288,
        temperature: 71,
        encoder: 'NVENC H.265',
      },
      cpu: {
        cores: 12,
        utilization: 68,
        model: 'AMD Ryzen 7 7800X3D',
      },
      ram: {
        usedMb: 22100,
        totalMb: 32768,
        utilization: 68,
      },
      storage: {
        usedGb: 1400,
        totalGb: 2000,
      },
      network: {
        inboundMbps: 620,
        outboundMbps: 890,
      },
      concurrentStreams: 8,
      maxStreams: 10,
      activeTranscodes: 3,
      uptime: '23d 8h',
      lastSeen: new Date(Date.now() - 45_000).toISOString(),
      version: '1.32.8',
      os: 'Ubuntu 24.04',
    },
    {
      id: 'sn-003',
      name: 'stream-standby',
      hostname: 'stream-standby.local',
      ip: '10.0.1.12',
      status: 'maintenance',
      role: 'standby',
      gpu: {
        model: 'NVIDIA RTX 3060',
        utilization: 0,
        vramUsedMb: 512,
        vramTotalMb: 12288,
        temperature: 34,
        encoder: 'NVENC H.264',
      },
      cpu: {
        cores: 8,
        utilization: 5,
        model: 'AMD Ryzen 5 7600X',
      },
      ram: {
        usedMb: 4200,
        totalMb: 32768,
        utilization: 13,
      },
      storage: {
        usedGb: 980,
        totalGb: 2000,
      },
      network: {
        inboundMbps: 12,
        outboundMbps: 24,
      },
      concurrentStreams: 0,
      maxStreams: 8,
      activeTranscodes: 0,
      uptime: '0d 0h',
      lastSeen: new Date(Date.now() - 3600_000).toISOString(),
      version: '1.32.7',
      os: 'Ubuntu 24.04',
    },
  ],
  streams: [
    { id: 'st-001', title: 'Dune: Part Two', user: 'alice', nodeId: 'sn-001', nodeName: 'stream-primary', client: 'Android TV', protocol: 'transcode', status: 'playing', quality: '4K HDR', bitrateMbps: 25.4, resolution: '3840x2160', codec: 'H.265', audioCodec: 'DTS-HD MA', progress: 67, bufferPercent: 98, startedAt: new Date(Date.now() - 4200_000).toISOString(), duration: '2h 46m' },
    { id: 'st-002', title: 'The Bear S3E07', user: 'bob', nodeId: 'sn-001', nodeName: 'stream-primary', client: 'iOS', protocol: 'hls', status: 'playing', quality: '1080p', bitrateMbps: 8.2, resolution: '1920x1080', codec: 'H.264', audioCodec: 'AAC', progress: 45, bufferPercent: 100, startedAt: new Date(Date.now() - 1500_000).toISOString(), duration: '35m' },
    { id: 'st-003', title: 'Interstellar', user: 'charlie', nodeId: 'sn-002', nodeName: 'stream-worker-1', client: 'Roku', protocol: 'transcode', status: 'transcoding', quality: '4K', bitrateMbps: 18.7, resolution: '3840x2160', codec: 'H.265', audioCodec: 'TrueHD', progress: 32, bufferPercent: 85, startedAt: new Date(Date.now() - 2400_000).toISOString(), duration: '2h 49m' },
    { id: 'st-004', title: 'Severance S2E01', user: 'diana', nodeId: 'sn-001', nodeName: 'stream-primary', client: 'Web', protocol: 'dash', status: 'playing', quality: '1080p', bitrateMbps: 6.8, resolution: '1920x1080', codec: 'H.264', audioCodec: 'AAC', progress: 89, bufferPercent: 100, startedAt: new Date(Date.now() - 2100_000).toISOString(), duration: '47m' },
    { id: 'st-005', title: 'Oppenheimer', user: 'eve', nodeId: 'sn-002', nodeName: 'stream-worker-1', client: 'Apple TV', protocol: 'directplay', status: 'playing', quality: '4K HDR', bitrateMbps: 42.1, resolution: '3840x2160', codec: 'H.265', audioCodec: 'Atmos', progress: 15, bufferPercent: 100, startedAt: new Date(Date.now() - 2100_000).toISOString(), duration: '3h 1m' },
    { id: 'st-006', title: 'Shogun S1E10', user: 'frank', nodeId: 'sn-001', nodeName: 'stream-primary', client: 'Android', protocol: 'hls', status: 'buffering', quality: '720p', bitrateMbps: 3.4, resolution: '1280x720', codec: 'H.264', audioCodec: 'AAC', progress: 52, bufferPercent: 42, startedAt: new Date(Date.now() - 1800_000).toISOString(), duration: '58m' },
    { id: 'st-007', title: 'Planet Earth III E04', user: 'grace', nodeId: 'sn-002', nodeName: 'stream-worker-1', client: 'Web', protocol: 'dash', status: 'playing', quality: '4K', bitrateMbps: 22.3, resolution: '3840x2160', codec: 'H.265', audioCodec: 'AAC', progress: 78, bufferPercent: 96, startedAt: new Date(Date.now() - 2700_000).toISOString(), duration: '50m' },
    { id: 'st-008', title: 'The Matrix', user: 'henry', nodeId: 'sn-001', nodeName: 'stream-primary', client: 'Kodi', protocol: 'directplay', status: 'paused', quality: '1080p', bitrateMbps: 0, resolution: '1920x1080', codec: 'H.264', audioCodec: 'DTS', progress: 34, bufferPercent: 100, startedAt: new Date(Date.now() - 3600_000).toISOString(), duration: '2h 16m' },
  ],
  transcodes: [
    { id: 'tq-001', title: 'Dune: Part Two', nodeId: 'sn-001', nodeName: 'stream-primary', status: 'processing', inputCodec: 'ProRes 4444', outputCodec: 'H.265', resolution: '3840x2160', progress: 67, etaSec: 180, startedAt: new Date(Date.now() - 420_000).toISOString(), estimatedDuration: '12m', fileSizeMb: 48200, priority: 'high', initiatedBy: 'alice' },
    { id: 'tq-002', title: 'Interstellar', nodeId: 'sn-002', nodeName: 'stream-worker-1', status: 'processing', inputCodec: 'H.264', outputCodec: 'H.265', resolution: '3840x2160', progress: 32, etaSec: 540, startedAt: new Date(Date.now() - 180_000).toISOString(), estimatedDuration: '14m', fileSizeMb: 52000, priority: 'normal', initiatedBy: 'charlie' },
    { id: 'tq-003', title: 'Alien: Romulus', nodeId: 'sn-001', nodeName: 'stream-primary', status: 'queued', inputCodec: 'H.264', outputCodec: 'H.265', resolution: '3840x2160', progress: 0, etaSec: null, startedAt: null, estimatedDuration: '15m', fileSizeMb: 44000, priority: 'normal', initiatedBy: 'system' },
    { id: 'tq-004', title: 'Civil War', nodeId: 'sn-002', nodeName: 'stream-worker-1', status: 'queued', inputCodec: 'H.264', outputCodec: 'H.265', resolution: '1920x1080', progress: 0, etaSec: null, startedAt: null, estimatedDuration: '8m', fileSizeMb: 12000, priority: 'low', initiatedBy: 'system' },
    { id: 'tq-005', title: 'Poor Things', nodeId: 'sn-001', nodeName: 'stream-primary', status: 'queued', inputCodec: 'H.264', outputCodec: 'H.265', resolution: '1920x1080', progress: 0, etaSec: null, startedAt: null, estimatedDuration: '9m', fileSizeMb: 14500, priority: 'low', initiatedBy: 'system' },
    { id: 'tq-006', title: 'Past Lives', nodeId: 'sn-001', nodeName: 'stream-primary', status: 'completed', inputCodec: 'H.264', outputCodec: 'H.265', resolution: '1920x1080', progress: 100, etaSec: 0, startedAt: new Date(Date.now() - 900_000).toISOString(), estimatedDuration: '7m', fileSizeMb: 11200, priority: 'normal', initiatedBy: 'system' },
    { id: 'tq-007', title: 'Killers of the Flower Moon', nodeId: 'sn-002', nodeName: 'stream-worker-1', status: 'failed', inputCodec: 'H.264', outputCodec: 'H.265', resolution: '3840x2160', progress: 23, etaSec: null, startedAt: new Date(Date.now() - 600_000).toISOString(), estimatedDuration: '18m', fileSizeMb: 68000, priority: 'normal', initiatedBy: 'system' },
  ],
  bandwidth: [
    { time: '00:00', node1: 420, node2: 310, node3: 0 },
    { time: '02:00', node1: 280, node2: 190, node3: 0 },
    { time: '04:00', node1: 150, node2: 100, node3: 0 },
    { time: '06:00', node1: 320, node2: 240, node3: 0 },
    { time: '08:00', node1: 580, node2: 420, node3: 0 },
    { time: '10:00', node1: 720, node2: 540, node3: 0 },
    { time: '12:00', node1: 890, node2: 650, node3: 0 },
    { time: '14:00', node1: 950, node2: 710, node3: 0 },
    { time: '16:00', node1: 1050, node2: 780, node3: 0 },
    { time: '18:00', node1: 1180, node2: 860, node3: 0 },
    { time: '20:00', node1: 1200, node2: 890, node3: 0 },
    { time: '22:00', node1: 980, node2: 720, node3: 0 },
  ],
  alerts: [
    { id: 'sa-001', severity: 'warning', title: 'GPU temperature high on stream-worker-1', description: 'GPU temp reached 71°C — approaching thermal throttle threshold (75°C)', nodeId: 'sn-002', nodeName: 'stream-worker-1', source: 'gpu-monitor', date: new Date(Date.now() - 300_000).toISOString(), status: 'active' },
    { id: 'sa-002', severity: 'critical', title: 'Transcode failed: Killers of the Flower Moon', description: 'NVENC encoder timeout — GPU memory exhausted during 4K HDR encode', nodeId: 'sn-002', nodeName: 'stream-worker-1', source: 'transcoder', date: new Date(Date.now() - 600_000).toISOString(), status: 'acknowledged' },
    { id: 'sa-003', severity: 'info', title: 'Node stream-standby entering maintenance', description: 'Scheduled maintenance window — GPU driver update in progress', nodeId: 'sn-003', nodeName: 'stream-standby', source: 'scheduler', date: new Date(Date.now() - 3600_000).toISOString(), status: 'acknowledged' },
    { id: 'sa-004', severity: 'warning', title: 'Stream buffering on stream-primary', description: 'Client "frank" on Android experiencing buffer underruns — bitrate throttle applied', nodeId: 'sn-001', nodeName: 'stream-primary', source: 'stream-manager', date: new Date(Date.now() - 120_000).toISOString(), status: 'active' },
    { id: 'sa-005', severity: 'info', title: 'New transcoding queue backlog', description: '3 jobs queued — estimated wait time 12 minutes', nodeId: 'sn-001', nodeName: 'stream-primary', source: 'queue-manager', date: new Date(Date.now() - 60_000).toISOString(), status: 'active' },
    { id: 'sa-006', severity: 'warning', title: 'VRAM usage high on stream-primary', description: 'GPU memory at 58% — 14.2 GB / 24 GB allocated across 12 concurrent streams', nodeId: 'sn-001', nodeName: 'stream-primary', source: 'gpu-monitor', date: new Date(Date.now() - 180_000).toISOString(), status: 'active' },
  ],
  activities: [
    { id: 'sact-001', type: 'stream-start', message: 'New stream started: Dune: Part Two (4K HDR)', nodeName: 'stream-primary', timestamp: new Date(Date.now() - 4200_000).toISOString(), details: 'User: alice | Client: Android TV | Protocol: transcode' },
    { id: 'sact-002', type: 'transcode-complete', message: 'Transcode completed: Past Lives (1080p H.265)', nodeName: 'stream-primary', timestamp: new Date(Date.now() - 900_000).toISOString(), details: 'Duration: 7m | Output: 11.2 GB | Codec: H.264 → H.265' },
    { id: 'sact-003', type: 'gpu-alert', message: 'GPU temperature warning on stream-worker-1', nodeName: 'stream-worker-1', timestamp: new Date(Date.now() - 300_000).toISOString(), details: 'Temperature: 71°C | Threshold: 75°C | Fan speed: 85%' },
    { id: 'sact-004', type: 'node-down', message: 'Node stream-standby entering maintenance mode', nodeName: 'stream-standby', timestamp: new Date(Date.now() - 3600_000).toISOString(), details: 'Reason: GPU driver update | Estimated: 45 minutes | Traffic migrated to primary' },
    { id: 'sact-005', type: 'stream-start', message: 'New stream started: Interstellar (4K Transcode)', nodeName: 'stream-worker-1', timestamp: new Date(Date.now() - 2400_000).toISOString(), details: 'User: charlie | Client: Roku | Protocol: transcode' },
    { id: 'sact-006', type: 'transcode-complete', message: 'Transcode failed: Killers of the Flower Moon', nodeName: 'stream-worker-1', timestamp: new Date(Date.now() - 600_000).toISOString(), details: 'Error: NVENC encoder timeout | GPU memory exhausted | Job queued for retry' },
    { id: 'sact-007', type: 'config-change', message: 'Stream bitrate throttle applied', nodeName: 'stream-primary', timestamp: new Date(Date.now() - 120_000).toISOString(), details: 'Client: frank@android | Original: 8.2 Mbps → Throttled: 3.4 Mbps | Reason: buffer underrun' },
    { id: 'sact-008', type: 'stream-end', message: 'Stream ended: The Mandalorian S3E08', nodeName: 'stream-primary', timestamp: new Date(Date.now() - 5400_000).toISOString(), details: 'User: grace | Duration: 35m | Watched: 100% | Protocol: HLS' },
    { id: 'sact-009', type: 'node-recovery', message: 'Node stream-primary recovered from load spike', nodeName: 'stream-primary', timestamp: new Date(Date.now() - 7200_000).toISOString(), details: 'CPU peak: 94% → 45% | GPU peak: 98% → 78% | Duration: 12 minutes' },
    { id: 'sact-010', type: 'stream-start', message: 'New stream started: Oppenheimer (4K Direct Play)', nodeName: 'stream-worker-1', timestamp: new Date(Date.now() - 2100_000).toISOString(), details: 'User: eve | Client: Apple TV | Protocol: directplay | No transcode needed' },
  ],
}
