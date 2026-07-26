export type GlobalStatus = 'operational' | 'warning' | 'critical'
export type NodeStatus = 'healthy' | 'warning' | 'critical' | 'offline'
export type ServiceStatus = 'running' | 'degraded' | 'stopped' | 'unknown'
export type ContainerStatus = 'running' | 'stopped' | 'restarting' | 'paused' | 'dead'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type DeploymentStatus = 'success' | 'failed' | 'in-progress' | 'rolled-back'
export type ActivityEventType = 'container-restart' | 'deployment' | 'backup' | 'sync' | 'reboot' | 'health-check' | 'alert' | 'recovery'

export interface InfraOverview {
  globalStatus: GlobalStatus
  lastHeartbeat: string
  nodeCount: number
  serviceCount: number
  containerCount: number
  alertCount: number
  cpuPercent: number
  ramPercent: number
  ramUsed: string
  ramTotal: string
  storageUsed: string
  storageTotal: string
  bandwidthMbps: number
  uptime: string
  vmCount: number
  criticalAlerts: number
}

export interface Node {
  id: string
  name: string
  hostname: string
  status: NodeStatus
  ip: string
  os: string
  cpuCores: number
  cpuPercent: number
  ramPercent: number
  ramUsed: string
  ramTotal: string
  storageUsed: string
  storageTotal: string
  networkIn: string
  networkOut: string
  temperature: number
  vmCount: number
  containerCount: number
  uptime: string
  lastSeen: string
  role: 'master' | 'worker' | 'standby'
}

export interface Service {
  id: string
  name: string
  status: ServiceStatus
  version: string
  uptime: string
  latencyMs: number
  lastRestart: string
  port: number
  replicas: string
  healthCheck: string
}

export interface Container {
  id: string
  name: string
  image: string
  status: ContainerStatus
  cpuPercent: number
  ramMb: number
  ramLimit: number
  restartCount: number
  node: string
  startedAt: string
  ports: string
}

export interface StorageVolume {
  id: string
  name: string
  type: 'database' | 'media' | 'backups' | 'logs' | 'cache'
  used: number
  total: number
  usedLabel: string
  totalLabel: string
  freeLabel: string
  iops: number
  mountPath: string
}

export interface NetworkStats {
  trafficIn: string
  trafficOut: string
  activeConnections: number
  avgLatencyMs: number
  requestsPerSec: number
  peakBandwidth: string
  currentBandwidth: string
  openPorts: number
  firewallRules: number
  sslCerts: number
  chartData: number[]
}

export interface Deployment {
  id: string
  version: string
  status: DeploymentStatus
  environment: 'production' | 'staging' | 'development'
  duration: string
  initiatedBy: string
  date: string
  commitHash: string
  services: string[]
}

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  node: string
  date: string
  status: AlertStatus
  source: string
}

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  message: string
  node: string
  timestamp: string
  details?: string
}

export interface InfraData {
  overview: InfraOverview
  nodes: Node[]
  services: Service[]
  containers: Container[]
  storage: StorageVolume[]
  network: NetworkStats
  deployments: Deployment[]
  alerts: Alert[]
  activities: ActivityEvent[]
}

export const infraData: InfraData = {
  overview: {
    globalStatus: 'warning',
    lastHeartbeat: '2026-07-26T11:45:00Z',
    nodeCount: 4,
    serviceCount: 10,
    containerCount: 23,
    alertCount: 3,
    cpuPercent: 42,
    ramPercent: 67,
    ramUsed: '21.4 GB',
    ramTotal: '32 GB',
    storageUsed: '1.8 TB',
    storageTotal: '4 TB',
    bandwidthMbps: 847,
    uptime: '47d 12h 33m',
    vmCount: 6,
    criticalAlerts: 1,
  },
  nodes: [
    {
      id: 'node-1', name: 'prod-master-01', hostname: 'kami-prod-01', status: 'healthy',
      ip: '10.0.1.10', os: 'Ubuntu 24.04 LTS', cpuCores: 16, cpuPercent: 35,
      ramPercent: 58, ramUsed: '18.6 GB', ramTotal: '32 GB', storageUsed: '420 GB',
      storageTotal: '1 TB', networkIn: '245 Mbps', networkOut: '180 Mbps',
      temperature: 52, vmCount: 3, containerCount: 8, uptime: '47d 12h',
      lastSeen: '2026-07-26T11:45:00Z', role: 'master',
    },
    {
      id: 'node-2', name: 'prod-worker-01', hostname: 'kami-prod-02', status: 'warning',
      ip: '10.0.1.11', os: 'Ubuntu 24.04 LTS', cpuCores: 16, cpuPercent: 78,
      ramPercent: 82, ramUsed: '26.2 GB', ramTotal: '32 GB', storageUsed: '580 GB',
      storageTotal: '1 TB', networkIn: '312 Mbps', networkOut: '245 Mbps',
      temperature: 68, vmCount: 2, containerCount: 7, uptime: '32d 8h',
      lastSeen: '2026-07-26T11:45:00Z', role: 'worker',
    },
    {
      id: 'node-3', name: 'prod-worker-02', hostname: 'kami-prod-03', status: 'healthy',
      ip: '10.0.1.12', os: 'Ubuntu 24.04 LTS', cpuCores: 8, cpuPercent: 22,
      ramPercent: 45, ramUsed: '14.4 GB', ramTotal: '32 GB', storageUsed: '310 GB',
      storageTotal: '1 TB', networkIn: '98 Mbps', networkOut: '76 Mbps',
      temperature: 44, vmCount: 1, containerCount: 5, uptime: '47d 12h',
      lastSeen: '2026-07-26T11:45:00Z', role: 'worker',
    },
    {
      id: 'node-4', name: 'prod-standby-01', hostname: 'kami-standby-01', status: 'offline',
      ip: '10.0.1.13', os: 'Ubuntu 24.04 LTS', cpuCores: 8, cpuPercent: 0,
      ramPercent: 0, ramUsed: '0 GB', ramTotal: '16 GB', storageUsed: '120 GB',
      storageTotal: '500 GB', networkIn: '0 Mbps', networkOut: '0 Mbps',
      temperature: 0, vmCount: 0, containerCount: 3, uptime: '0d 0h',
      lastSeen: '2026-07-25T18:30:00Z', role: 'standby',
    },
  ],
  services: [
    { id: 'svc-1', name: 'API Gateway', status: 'running', version: '3.12.0', uptime: '47d 12h', latencyMs: 12, lastRestart: '2026-06-08T23:00:00Z', port: 8080, replicas: '3/3', healthCheck: 'passing' },
    { id: 'svc-2', name: 'Go API', status: 'running', version: '2.8.1', uptime: '47d 12h', latencyMs: 8, lastRestart: '2026-06-08T23:00:00Z', port: 3000, replicas: '2/2', healthCheck: 'passing' },
    { id: 'svc-3', name: 'PostgreSQL', status: 'running', version: '16.3', uptime: '47d 12h', latencyMs: 3, lastRestart: '2026-06-08T23:00:00Z', port: 5432, replicas: '1/1', healthCheck: 'passing' },
    { id: 'svc-4', name: 'Redis', status: 'running', version: '7.2.5', uptime: '47d 12h', latencyMs: 1, lastRestart: '2026-06-08T23:00:00Z', port: 6379, replicas: '1/1', healthCheck: 'passing' },
    { id: 'svc-5', name: 'Meilisearch', status: 'degraded', version: '1.7.3', uptime: '5d 3h', latencyMs: 45, lastRestart: '2026-07-21T08:00:00Z', port: 7700, replicas: '1/1', healthCheck: 'warning' },
    { id: 'svc-6', name: 'Traefik', status: 'running', version: '3.0.4', uptime: '47d 12h', latencyMs: 5, lastRestart: '2026-06-08T23:00:00Z', port: 443, replicas: '2/2', healthCheck: 'passing' },
    { id: 'svc-7', name: 'Auth Service', status: 'running', version: '1.14.0', uptime: '47d 12h', latencyMs: 15, lastRestart: '2026-06-08T23:00:00Z', port: 4000, replicas: '2/2', healthCheck: 'passing' },
    { id: 'svc-8', name: 'Media Worker', status: 'running', version: '1.5.2', uptime: '12d 6h', latencyMs: 22, lastRestart: '2026-07-14T05:00:00Z', port: 5000, replicas: '3/3', healthCheck: 'passing' },
    { id: 'svc-9', name: 'Scheduler', status: 'running', version: '1.3.0', uptime: '47d 12h', latencyMs: 6, lastRestart: '2026-06-08T23:00:00Z', port: 9090, replicas: '1/1', healthCheck: 'passing' },
    { id: 'svc-10', name: 'Web Frontend', status: 'running', version: '4.2.0', uptime: '2d 8h', latencyMs: 18, lastRestart: '2026-07-24T03:00:00Z', port: 3001, replicas: '2/2', healthCheck: 'passing' },
  ],
  containers: [
    { id: 'ctr-1', name: 'api-gateway-1', image: 'kami-sama/gateway:3.12.0', status: 'running', cpuPercent: 12, ramMb: 256, ramLimit: 512, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '8080:8080' },
    { id: 'ctr-2', name: 'api-gateway-2', image: 'kami-sama/gateway:3.12.0', status: 'running', cpuPercent: 14, ramMb: 268, ramLimit: 512, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '8081:8080' },
    { id: 'ctr-3', name: 'api-gateway-3', image: 'kami-sama/gateway:3.12.0', status: 'running', cpuPercent: 11, ramMb: 245, ramLimit: 512, restartCount: 0, node: 'prod-worker-01', startedAt: '2026-06-08T23:00:00Z', ports: '8082:8080' },
    { id: 'ctr-4', name: 'go-api-1', image: 'kami-sama/api:2.8.1', status: 'running', cpuPercent: 28, ramMb: 512, ramLimit: 1024, restartCount: 1, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '3000:3000' },
    { id: 'ctr-5', name: 'go-api-2', image: 'kami-sama/api:2.8.1', status: 'running', cpuPercent: 32, ramMb: 548, ramLimit: 1024, restartCount: 0, node: 'prod-worker-01', startedAt: '2026-06-08T23:00:00Z', ports: '3001:3000' },
    { id: 'ctr-6', name: 'postgresql', image: 'postgres:16.3-alpine', status: 'running', cpuPercent: 18, ramMb: 2048, ramLimit: 4096, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '5432:5432' },
    { id: 'ctr-7', name: 'redis', image: 'redis:7.2.5-alpine', status: 'running', cpuPercent: 5, ramMb: 128, ramLimit: 256, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '6379:6379' },
    { id: 'ctr-8', name: 'meilisearch', image: 'getmeili/meilisearch:1.7.3', status: 'running', cpuPercent: 45, ramMb: 1024, ramLimit: 2048, restartCount: 2, node: 'prod-worker-01', startedAt: '2026-07-21T08:00:00Z', ports: '7700:7700' },
    { id: 'ctr-9', name: 'traefik-1', image: 'traefik:v3.0.4', status: 'running', cpuPercent: 8, ramMb: 64, ramLimit: 128, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '443:443,80:80' },
    { id: 'ctr-10', name: 'traefik-2', image: 'traefik:v3.0.4', status: 'running', cpuPercent: 7, ramMb: 58, ramLimit: 128, restartCount: 0, node: 'prod-worker-02', startedAt: '2026-06-08T23:00:00Z', ports: '444:443,81:80' },
    { id: 'ctr-11', name: 'auth-service-1', image: 'kami-sama/auth:1.14.0', status: 'running', cpuPercent: 15, ramMb: 192, ramLimit: 384, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '4000:4000' },
    { id: 'ctr-12', name: 'auth-service-2', image: 'kami-sama/auth:1.14.0', status: 'running', cpuPercent: 13, ramMb: 185, ramLimit: 384, restartCount: 0, node: 'prod-worker-02', startedAt: '2026-06-08T23:00:00Z', ports: '4001:4000' },
    { id: 'ctr-13', name: 'media-worker-1', image: 'kami-sama/worker:1.5.2', status: 'running', cpuPercent: 52, ramMb: 768, ramLimit: 1024, restartCount: 3, node: 'prod-worker-01', startedAt: '2026-07-14T05:00:00Z', ports: '5000:5000' },
    { id: 'ctr-14', name: 'media-worker-2', image: 'kami-sama/worker:1.5.2', status: 'running', cpuPercent: 48, ramMb: 725, ramLimit: 1024, restartCount: 1, node: 'prod-worker-01', startedAt: '2026-07-14T05:00:00Z', ports: '5001:5000' },
    { id: 'ctr-15', name: 'media-worker-3', image: 'kami-sama/worker:1.5.2', status: 'running', cpuPercent: 41, ramMb: 680, ramLimit: 1024, restartCount: 0, node: 'prod-worker-02', startedAt: '2026-07-14T05:00:00Z', ports: '5002:5000' },
    { id: 'ctr-16', name: 'scheduler', image: 'kami-sama/scheduler:1.3.0', status: 'running', cpuPercent: 6, ramMb: 96, ramLimit: 256, restartCount: 0, node: 'prod-master-01', startedAt: '2026-06-08T23:00:00Z', ports: '9090:9090' },
    { id: 'ctr-17', name: 'web-frontend-1', image: 'kami-sama/web:4.2.0', status: 'running', cpuPercent: 18, ramMb: 384, ramLimit: 512, restartCount: 0, node: 'prod-master-01', startedAt: '2026-07-24T03:00:00Z', ports: '3001:3000' },
    { id: 'ctr-18', name: 'web-frontend-2', image: 'kami-sama/web:4.2.0', status: 'running', cpuPercent: 16, ramMb: 370, ramLimit: 512, restartCount: 0, node: 'prod-worker-02', startedAt: '2026-07-24T03:00:00Z', ports: '3002:3000' },
  ],
  storage: [
    { id: 'vol-1', name: 'Database', type: 'database', used: 180, total: 500, usedLabel: '180 GB', totalLabel: '500 GB', freeLabel: '320 GB', iops: 12400, mountPath: '/var/lib/postgresql/data' },
    { id: 'vol-2', name: 'Media', type: 'media', used: 1200, total: 2000, usedLabel: '1.2 TB', totalLabel: '2 TB', freeLabel: '800 GB', iops: 850, mountPath: '/data/media' },
    { id: 'vol-3', name: 'Backups', type: 'backups', used: 240, total: 500, usedLabel: '240 GB', totalLabel: '500 GB', freeLabel: '260 GB', iops: 320, mountPath: '/data/backups' },
    { id: 'vol-4', name: 'Logs', type: 'logs', used: 45, total: 200, usedLabel: '45 GB', totalLabel: '200 GB', freeLabel: '155 GB', iops: 2100, mountPath: '/var/log' },
    { id: 'vol-5', name: 'Cache', type: 'cache', used: 32, total: 100, usedLabel: '32 GB', totalLabel: '100 GB', freeLabel: '68 GB', iops: 18500, mountPath: '/data/cache' },
  ],
  network: {
    trafficIn: '3.2 TB',
    trafficOut: '1.8 TB',
    activeConnections: 1247,
    avgLatencyMs: 12,
    requestsPerSec: 3420,
    peakBandwidth: '1.2 Gbps',
    currentBandwidth: '847 Mbps',
    openPorts: 18,
    firewallRules: 142,
    sslCerts: 6,
    chartData: [65, 72, 68, 74, 71, 78, 82, 79, 85, 88, 92, 87, 84, 80, 76, 82, 88, 91, 86, 83, 79, 75, 81, 85],
  },
  deployments: [
    { id: 'dep-1', version: '4.2.0', status: 'success', environment: 'production', duration: '2m 15s', initiatedBy: 'liam', date: '2026-07-24T03:00:00Z', commitHash: 'a3f8c21', services: ['Web Frontend'] },
    { id: 'dep-2', version: '1.5.2', status: 'success', environment: 'production', duration: '3m 42s', initiatedBy: 'liam', date: '2026-07-14T05:00:00Z', commitHash: 'e7b2d44', services: ['Media Worker'] },
    { id: 'dep-3', version: '2.8.1', status: 'success', environment: 'production', duration: '1m 58s', initiatedBy: 'ci-bot', date: '2026-07-10T12:00:00Z', commitHash: 'f91a3c7', services: ['Go API'] },
    { id: 'dep-4', version: '3.12.0', status: 'success', environment: 'production', duration: '2m 05s', initiatedBy: 'liam', date: '2026-06-08T23:00:00Z', commitHash: '1c4e8b2', services: ['API Gateway'] },
    { id: 'dep-5', version: '1.7.3', status: 'failed', environment: 'staging', duration: '0m 45s', initiatedBy: 'liam', date: '2026-07-21T08:00:00Z', commitHash: 'd5f6a90', services: ['Meilisearch'] },
    { id: 'dep-6', version: '1.3.0', status: 'success', environment: 'production', duration: '1m 12s', initiatedBy: 'ci-bot', date: '2026-06-08T23:00:00Z', commitHash: '8e2c7f1', services: ['Scheduler'] },
  ],
  alerts: [
    { id: 'alert-1', severity: 'critical', title: 'Node offline', description: 'prod-standby-01 has been unreachable for 17 hours. Last seen at 18:30 UTC.', node: 'prod-standby-01', date: '2026-07-25T18:30:00Z', status: 'active', source: 'health-check' },
    { id: 'alert-2', severity: 'warning', title: 'High memory usage', description: 'prod-worker-01 RAM usage at 82%. Threshold: 80%.', node: 'prod-worker-01', date: '2026-07-26T11:30:00Z', status: 'active', source: 'monitoring' },
    { id: 'alert-3', severity: 'warning', title: 'Meilisearch degraded', description: 'Search latency increased to 45ms (threshold: 30ms). 2 container restarts in the last 24h.', node: 'prod-worker-01', date: '2026-07-26T10:00:00Z', status: 'acknowledged', source: 'service-health' },
    { id: 'alert-4', severity: 'info', title: 'Backup completed', description: 'Daily backup of database completed successfully. Size: 12.4 GB.', node: 'prod-master-01', date: '2026-07-26T04:00:00Z', status: 'resolved', source: 'backup-cron' },
    { id: 'alert-5', severity: 'info', title: 'SSL certificate renewal', description: 'Certificate for *.kami-sama.app expires in 14 days. Auto-renewal scheduled.', node: 'prod-master-01', date: '2026-07-26T00:00:00Z', status: 'acknowledged', source: 'cert-manager' },
    { id: 'alert-6', severity: 'warning', title: 'Disk IOPS spike', description: 'Database volume IOPS at 12,400 (threshold: 10,000). Possible slow query.', node: 'prod-master-01', date: '2026-07-26T09:15:00Z', status: 'active', source: 'monitoring' },
  ],
  activities: [
    { id: 'act-1', type: 'alert', message: 'Critical: Node prod-standby-01 is offline', node: 'prod-standby-01', timestamp: '2026-07-25T18:30:00Z' },
    { id: 'act-2', type: 'health-check', message: 'Health check passed for all production services', node: 'prod-master-01', timestamp: '2026-07-26T11:45:00Z' },
    { id: 'act-3', type: 'container-restart', message: 'Container meilisearch restarted (attempt 2/5)', node: 'prod-worker-01', timestamp: '2026-07-26T10:00:00Z', details: 'OOM killed. Memory limit: 2048 MB' },
    { id: 'act-4', type: 'sync', message: 'Media sync completed: 1,247 items processed', node: 'prod-worker-01', timestamp: '2026-07-26T10:30:00Z' },
    { id: 'act-5', type: 'backup', message: 'Daily database backup completed (12.4 GB)', node: 'prod-master-01', timestamp: '2026-07-26T04:00:00Z' },
    { id: 'act-6', type: 'deployment', message: 'Web Frontend v4.2.0 deployed to production', node: 'prod-master-01', timestamp: '2026-07-24T03:00:00Z' },
    { id: 'act-7', type: 'recovery', message: 'Node prod-worker-02 recovered from high CPU', node: 'prod-worker-02', timestamp: '2026-07-25T16:00:00Z' },
    { id: 'act-8', type: 'reboot', message: 'Node prod-worker-01 rebooted for kernel update', node: 'prod-worker-01', timestamp: '2026-07-20T02:00:00Z' },
    { id: 'act-9', type: 'health-check', message: 'Health check warning: Meilisearch latency above threshold', node: 'prod-worker-01', timestamp: '2026-07-26T10:05:00Z' },
    { id: 'act-10', type: 'container-restart', message: 'Container media-worker-1 restarted', node: 'prod-worker-01', timestamp: '2026-07-25T22:00:00Z', details: 'OOM killed. Memory limit: 1024 MB' },
    { id: 'act-11', type: 'sync', message: 'Metadata sync completed: 347 entries from AniList', node: 'prod-master-01', timestamp: '2026-07-26T10:00:00Z' },
    { id: 'act-12', type: 'alert', message: 'Warning: High memory usage on prod-worker-01 (82%)', node: 'prod-worker-01', timestamp: '2026-07-26T11:30:00Z' },
  ],
}
