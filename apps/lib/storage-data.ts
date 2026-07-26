export interface StorageVolume {
  id: string
  name: string
  mountPoint: string
  type: 'lvm' | 'zfs' | 'btrfs' | 'ext4' | 'xfs'
  status: 'healthy' | 'degraded' | 'critical' | 'offline'
  totalSize: number
  usedSize: number
  freeSize: number
  usagePercent: number
  filesystem: string
  ioRead: number
  ioWrite: number
  latencyRead: number
  latencyWrite: number
}

export interface PhysicalDisk {
  id: string
  model: string
  serial: string
  type: 'ssd' | 'hdd' | 'nvme'
  size: number
  temperature: number
  health: 'healthy' | 'warning' | 'critical'
  powerOnHours: number
  totalBytesWritten: number
  reallocatedSectors: number
  currentPendingSectors: number
  ioRead: number
  ioWrite: number
  smartStatus: 'passed' | 'failed' | 'unknown'
}

export interface BackupJob {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  status: 'completed' | 'running' | 'scheduled' | 'failed'
  lastRun: string
  nextRun: string
  duration: string
  size: number
  source: string
  destination: string
  retentionDays: number
}

export interface Snapshot {
  id: string
  name: string
  volume: string
  createdAt: string
  size: number
  status: 'active' | 'expired' | 'corrupted'
  description: string
  automatic: boolean
}

export interface StorageAlert {
  id: string
  level: 'critical' | 'warning' | 'info'
  message: string
  source: string
  timestamp: string
  acknowledged: boolean
}

export interface StorageActivity {
  id: string
  action: string
  user: string
  target: string
  timestamp: string
  details: string
}

export interface IoMetricPoint {
  time: string
  read: number
  write: number
}

export const storageOverview = {
  totalStorage: 16000,
  usedStorage: 11200,
  freeStorage: 4800,
  usagePercent: 70,
  totalVolumes: 6,
  healthyVolumes: 5,
  totalDisks: 8,
  healthyDisks: 7,
  totalSnapshots: 24,
  activeBackups: 12,
  lastBackup: '2026-07-26 02:30:00',
  ioReadTotal: 450,
  ioWriteTotal: 320,
  avgLatency: 2.4,
  iopsTotal: 12400
}

export const volumes: StorageVolume[] = [
  {
    id: 'vol-001',
    name: 'root',
    mountPoint: '/',
    type: 'ext4',
    status: 'healthy',
    totalSize: 500,
    usedSize: 280,
    freeSize: 220,
    usagePercent: 56,
    filesystem: 'ext4',
    ioRead: 120,
    ioWrite: 85,
    latencyRead: 1.2,
    latencyWrite: 2.1,
  },
  {
    id: 'vol-002',
    name: 'media',
    mountPoint: '/mnt/media',
    type: 'zfs',
    status: 'healthy',
    totalSize: 8000,
    usedSize: 5600,
    freeSize: 2400,
    usagePercent: 70,
    filesystem: 'zfs',
    ioRead: 180,
    ioWrite: 130,
    latencyRead: 0.8,
    latencyWrite: 1.4,
  },
  {
    id: 'vol-003',
    name: 'backups',
    mountPoint: '/mnt/backups',
    type: 'xfs',
    status: 'healthy',
    totalSize: 4000,
    usedSize: 2800,
    freeSize: 1200,
    usagePercent: 70,
    filesystem: 'xfs',
    ioRead: 45,
    ioWrite: 25,
    latencyRead: 1.8,
    latencyWrite: 3.2,
  },
  {
    id: 'vol-004',
    name: 'databases',
    mountPoint: '/mnt/databases',
    type: 'lvm',
    status: 'healthy',
    totalSize: 1000,
    usedSize: 750,
    freeSize: 250,
    usagePercent: 75,
    filesystem: 'ext4',
    ioRead: 85,
    ioWrite: 60,
    latencyRead: 0.4,
    latencyWrite: 0.9,
  },
  {
    id: 'vol-005',
    name: 'containers',
    mountPoint: '/mnt/containers',
    type: 'btrfs',
    status: 'degraded',
    totalSize: 2000,
    usedSize: 1420,
    freeSize: 580,
    usagePercent: 71,
    filesystem: 'btrfs',
    ioRead: 90,
    ioWrite: 70,
    latencyRead: 1.5,
    latencyWrite: 2.8,
  },
  {
    id: 'vol-006',
    name: 'logs',
    mountPoint: '/mnt/logs',
    type: 'ext4',
    status: 'healthy',
    totalSize: 500,
    usedSize: 350,
    freeSize: 150,
    usagePercent: 70,
    filesystem: 'ext4',
    ioRead: 30,
    ioWrite: 20,
    latencyRead: 2.0,
    latencyWrite: 3.5,
  },
]

export const disks: PhysicalDisk[] = [
  {
    id: 'disk-001',
    model: 'Samsung 990 PRO 2TB',
    serial: 'S6BENS0T123456',
    type: 'nvme',
    size: 2000,
    temperature: 42,
    health: 'healthy',
    powerOnHours: 8760,
    totalBytesWritten: 12000,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 120,
    ioWrite: 85,
    smartStatus: 'passed',
  },
  {
    id: 'disk-002',
    model: 'Samsung 990 PRO 2TB',
    serial: 'S6BENS0T654321',
    type: 'nvme',
    size: 2000,
    temperature: 44,
    health: 'healthy',
    powerOnHours: 8760,
    totalBytesWritten: 9800,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 180,
    ioWrite: 130,
    smartStatus: 'passed',
  },
  {
    id: 'disk-003',
    model: 'WD Red Plus 8TB',
    serial: 'WD-WMC1T0123456',
    type: 'hdd',
    size: 8000,
    temperature: 38,
    health: 'healthy',
    powerOnHours: 26280,
    totalBytesWritten: 45000,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 45,
    ioWrite: 25,
    smartStatus: 'passed',
  },
  {
    id: 'disk-004',
    model: 'WD Red Plus 8TB',
    serial: 'WD-WMC1T0654321',
    type: 'hdd',
    size: 8000,
    temperature: 39,
    health: 'healthy',
    powerOnHours: 26280,
    totalBytesWritten: 42000,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 40,
    ioWrite: 30,
    smartStatus: 'passed',
  },
  {
    id: 'disk-005',
    model: 'Samsung 870 EVO 1TB',
    serial: 'S5PENS0T789012',
    type: 'ssd',
    size: 1000,
    temperature: 36,
    health: 'healthy',
    powerOnHours: 17520,
    totalBytesWritten: 8500,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 85,
    ioWrite: 60,
    smartStatus: 'passed',
  },
  {
    id: 'disk-006',
    model: 'Samsung 870 EVO 1TB',
    serial: 'S5PENS0T345678',
    type: 'ssd',
    size: 1000,
    temperature: 37,
    health: 'warning',
    powerOnHours: 17520,
    totalBytesWritten: 9200,
    reallocatedSectors: 2,
    currentPendingSectors: 1,
    ioRead: 80,
    ioWrite: 55,
    smartStatus: 'passed',
  },
  {
    id: 'disk-007',
    model: 'Seagate Barracuda 2TB',
    serial: 'ZA10000123456',
    type: 'hdd',
    size: 2000,
    temperature: 41,
    health: 'healthy',
    powerOnHours: 13140,
    totalBytesWritten: 18000,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 25,
    ioWrite: 15,
    smartStatus: 'passed',
  },
  {
    id: 'disk-008',
    model: 'Seagate Barracuda 2TB',
    serial: 'ZA10000654321',
    type: 'hdd',
    size: 2000,
    temperature: 40,
    health: 'healthy',
    powerOnHours: 13140,
    totalBytesWritten: 16500,
    reallocatedSectors: 0,
    currentPendingSectors: 0,
    ioRead: 30,
    ioWrite: 20,
    smartStatus: 'passed',
  },
]

export const backups: BackupJob[] = [
  {
    id: 'bk-001',
    name: 'Nightly Full Backup',
    type: 'full',
    status: 'completed',
    lastRun: '2026-07-26 02:30:00',
    nextRun: '2026-07-27 02:30:00',
    duration: '45m 22s',
    size: 8200,
    source: '/mnt/media',
    destination: '/mnt/backups/media',
    retentionDays: 30,
  },
  {
    id: 'bk-002',
    name: 'Database Incremental',
    type: 'incremental',
    status: 'completed',
    lastRun: '2026-07-26 01:00:00',
    nextRun: '2026-07-26 13:00:00',
    duration: '12m 45s',
    size: 320,
    source: '/mnt/databases',
    destination: '/mnt/backups/databases',
    retentionDays: 14,
  },
  {
    id: 'bk-003',
    name: 'Config Backup',
    type: 'full',
    status: 'running',
    lastRun: '2026-07-26 03:00:00',
    nextRun: '2026-07-27 03:00:00',
    duration: '5m 30s',
    size: 45,
    source: '/etc',
    destination: '/mnt/backups/config',
    retentionDays: 90,
  },
  {
    id: 'bk-004',
    name: 'Container Volumes Backup',
    type: 'incremental',
    status: 'scheduled',
    lastRun: '2026-07-25 22:00:00',
    nextRun: '2026-07-26 22:00:00',
    duration: '28m 15s',
    size: 1200,
    source: '/mnt/containers',
    destination: '/mnt/backups/containers',
    retentionDays: 7,
  },
  {
    id: 'bk-005',
    name: 'Log Archival',
    type: 'differential',
    status: 'completed',
    lastRun: '2026-07-25 23:30:00',
    nextRun: '2026-07-26 23:30:00',
    duration: '8m 10s',
    size: 180,
    source: '/mnt/logs',
    destination: '/mnt/backups/logs',
    retentionDays: 60,
  },
  {
    id: 'bk-006',
    name: 'Critical Data Mirror',
    type: 'full',
    status: 'failed',
    lastRun: '2026-07-25 04:00:00',
    nextRun: '2026-07-26 04:00:00',
    duration: '0m 00s',
    size: 0,
    source: '/mnt/databases',
    destination: 'remote://nas-backup',
    retentionDays: 365,
  },
]

export const snapshots: Snapshot[] = [
  { id: 'snap-001', name: 'media-pre-update', volume: 'media', createdAt: '2026-07-26 00:00:00', size: 2400, status: 'active', description: 'Pre-update snapshot', automatic: false },
  { id: 'snap-002', name: 'media-daily-auto', volume: 'media', createdAt: '2026-07-25 06:00:00', size: 2380, status: 'active', description: 'Daily automatic snapshot', automatic: true },
  { id: 'snap-003', name: 'media-daily-auto', volume: 'media', createdAt: '2026-07-24 06:00:00', size: 2350, status: 'active', description: 'Daily automatic snapshot', automatic: true },
  { id: 'snap-004', name: 'databases-pre-migration', volume: 'databases', createdAt: '2026-07-25 14:00:00', size: 450, status: 'active', description: 'Pre-schema-migration snapshot', automatic: false },
  { id: 'snap-005', name: 'databases-hourly-auto', volume: 'databases', createdAt: '2026-07-26 03:00:00', size: 445, status: 'active', description: 'Hourly automatic snapshot', automatic: true },
  { id: 'snap-006', name: 'databases-hourly-auto', volume: 'databases', createdAt: '2026-07-26 02:00:00', size: 442, status: 'active', description: 'Hourly automatic snapshot', automatic: true },
  { id: 'snap-007', name: 'containers-pre-deploy', volume: 'containers', createdAt: '2026-07-24 18:00:00', size: 890, status: 'active', description: 'Pre-deployment snapshot', automatic: false },
  { id: 'snap-008', name: 'containers-daily-auto', volume: 'containers', createdAt: '2026-07-26 01:00:00', size: 870, status: 'active', description: 'Daily automatic snapshot', automatic: true },
  { id: 'snap-009', name: 'root-weekly-auto', volume: 'root', createdAt: '2026-07-21 00:00:00', size: 120, status: 'active', description: 'Weekly automatic snapshot', automatic: true },
  { id: 'snap-010', name: 'media-weekly-auto', volume: 'media', createdAt: '2026-07-20 06:00:00', size: 2300, status: 'expired', description: 'Weekly automatic snapshot (expired)', automatic: true },
  { id: 'snap-011', name: 'logs-daily-auto', volume: 'logs', createdAt: '2026-07-25 06:00:00', size: 85, status: 'active', description: 'Daily automatic snapshot', automatic: true },
  { id: 'snap-012', name: 'backups-pre-cleanup', volume: 'backups', createdAt: '2026-07-22 23:00:00', size: 2100, status: 'active', description: 'Pre-cleanup snapshot', automatic: false },
]

export const storageAlerts: StorageAlert[] = [
  { id: 'alert-001', level: 'critical', message: 'Disk S5PENS0T345678 has 2 reallocated sectors', source: 'disk-006', timestamp: '2026-07-26 03:45:00', acknowledged: false },
  { id: 'alert-002', level: 'warning', message: 'Volume containers is degraded — btrfs scrub found errors', source: 'vol-005', timestamp: '2026-07-26 02:10:00', acknowledged: false },
  { id: 'alert-003', level: 'warning', message: 'Disk temperature above threshold on disk-003 (38°C)', source: 'disk-003', timestamp: '2026-07-25 18:00:00', acknowledged: true },
  { id: 'alert-004', level: 'info', message: 'Backup job "Critical Data Mirror" failed — remote connection refused', source: 'bk-006', timestamp: '2026-07-25 04:05:00', acknowledged: true },
  { id: 'alert-005', level: 'critical', message: 'Volume containers usage at 71% — approaching threshold', source: 'vol-005', timestamp: '2026-07-26 01:00:00', acknowledged: false },
  { id: 'alert-006', level: 'warning', message: 'I/O latency spike detected on databases volume', source: 'vol-004', timestamp: '2026-07-25 20:30:00', acknowledged: true },
]

export const storageActivity: StorageActivity[] = [
  { id: 'act-001', action: 'Snapshot Created', user: 'system', target: 'media-daily-auto', timestamp: '2026-07-26 06:00:00', details: 'Automatic daily snapshot for media volume' },
  { id: 'act-002', action: 'Backup Completed', user: 'system', target: 'Nightly Full Backup', timestamp: '2026-07-26 03:15:00', details: 'Full backup of media completed successfully — 8.2 TB transferred' },
  { id: 'act-003', action: 'Volume Resized', user: 'admin', target: 'databases', timestamp: '2026-07-25 14:30:00', details: 'Expanded databases volume from 800 GB to 1 TB' },
  { id: 'act-004', action: 'SMART Alert', user: 'system', target: 'disk-006', timestamp: '2026-07-26 03:45:00', details: 'Reallocated sector count incremented to 2' },
  { id: 'act-005', action: 'Scrub Started', user: 'system', target: 'containers', timestamp: '2026-07-26 02:00:00', details: 'BTRFS scrub started on containers volume' },
  { id: 'act-006', action: 'Backup Failed', user: 'system', target: 'Critical Data Mirror', timestamp: '2026-07-25 04:05:00', details: 'Remote connection to nas-backup refused — SSH key may need rotation' },
  { id: 'act-007', action: 'Snapshot Pruned', user: 'system', target: 'media-weekly-auto', timestamp: '2026-07-24 06:05:00', details: 'Expired weekly snapshot pruned — freed 2.3 TB' },
  { id: 'act-008', action: 'Disk Temperature Warning', user: 'system', target: 'disk-003', timestamp: '2026-07-25 18:00:00', details: 'HDD temperature reached 38°C — above recommended threshold' },
  { id: 'act-009', action: 'Volume Mounted', user: 'admin', target: 'logs', timestamp: '2026-07-23 10:00:00', details: 'New logs volume mounted at /mnt/logs' },
  { id: 'act-010', action: 'Backup Completed', user: 'system', target: 'Database Incremental', timestamp: '2026-07-26 01:12:00', details: 'Incremental backup completed — 320 MB transferred in 12m 45s' },
  { id: 'act-011', action: 'SMART Test Run', user: 'admin', target: 'disk-006', timestamp: '2026-07-25 15:00:00', details: 'Short SMART self-test completed — 2 reallocated sectors detected' },
  { id: 'act-012', action: 'Snapshot Created', user: 'system', target: 'databases-hourly-auto', timestamp: '2026-07-26 03:00:00', details: 'Automatic hourly snapshot for databases volume' },
]

export const ioMetrics: IoMetricPoint[] = [
  { time: '04:00', read: 85, write: 60 },
  { time: '04:15', read: 120, write: 90 },
  { time: '04:30', read: 145, write: 110 },
  { time: '04:45', read: 130, write: 95 },
  { time: '05:00', read: 90, write: 65 },
  { time: '05:15', read: 110, write: 80 },
  { time: '05:30', read: 180, write: 130 },
  { time: '05:45', read: 220, write: 160 },
  { time: '06:00', read: 310, write: 240 },
  { time: '06:15', read: 280, write: 200 },
  { time: '06:30', read: 195, write: 140 },
  { time: '06:45', read: 150, write: 110 },
  { time: '07:00', read: 120, write: 85 },
  { time: '07:15', read: 100, write: 70 },
  { time: '07:30', read: 95, write: 65 },
  { time: '07:45', read: 110, write: 75 },
  { time: '08:00', read: 140, write: 100 },
  { time: '08:15', read: 170, write: 120 },
  { time: '08:30', read: 200, write: 150 },
  { time: '08:45', read: 185, write: 135 },
  { time: '09:00', read: 160, write: 115 },
  { time: '09:15', read: 145, write: 105 },
  { time: '09:30', read: 130, write: 90 },
  { time: '09:45', read: 155, write: 110 },
]

export function formatBytes(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} TB`
  return `${mb} GB`
}

export function statusColor(status: string): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'critical': return 'error'
    case 'degraded': return 'warning'
    case 'offline': return 'error'
    case 'passed': return 'success'
    case 'failed': return 'error'
    case 'active': return 'success'
    case 'expired': return 'info'
    case 'corrupted': return 'error'
    case 'completed': return 'success'
    case 'running': return 'info'
    case 'scheduled': return 'info'
    default: return 'info'
  }
}
