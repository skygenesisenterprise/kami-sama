export type ProbeType = 'http' | 'tcp' | 'dns' | 'icmp' | 'grpc'
export type ProbeStatus = 'up' | 'down' | 'degraded' | 'pending'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type GlobalMonitoringStatus = 'healthy' | 'degraded' | 'critical'
export type SyntheticStatus = 'passed' | 'failed' | 'running'
export type SloStatus = 'met' | 'at_risk' | 'breached'

export interface MonitoringOverview {
  globalStatus: GlobalMonitoringStatus
  lastHeartbeat: string
  totalProbes: number
  upProbes: number
  downProbes: number
  degradedProbes: number
  avgResponseTimeMs: number
  p99ResponseTimeMs: number
  uptimePercent: number
  totalChecks24h: number
  failedChecks24h: number
  activeAlerts: number
  sloCompliance: number
  monitoredEndpoints: number
  uptime: string
}

export interface Probe {
  id: string
  name: string
  type: ProbeType
  url: string
  status: ProbeStatus
  responseTimeMs: number
  statusCode: number | null
  lastChecked: string
  lastUp: string
  uptimePercent: number
  region: string
  interval: number
  timeout: number
  tags: string[]
}

export interface UptimeEntry {
  id: string
  service: string
  url: string
  uptime30d: number
  uptime24h: number
  downtime30dMins: number
  downtime24hMins: number
  avgResponseMs: number
  p95ResponseMs: number
  p99ResponseMs: number
  lastIncident: string | null
  totalIncidents30d: number
  regions: string[]
}

export interface MetricPoint {
  time: string
  responseTime: number
  errorRate: number
  throughput: number
}

export interface SLO {
  id: string
  name: string
  target: number
  current: number
  status: SloStatus
  window: string
  service: string
  errorBudgetRemaining: number
  errorBudgetTotal: number
  lastBreached: string | null
}

export interface SyntheticTest {
  id: string
  name: string
  url: string
  status: SyntheticStatus
  durationMs: number
  steps: number
  stepsPassed: number
  lastRun: string
  interval: string
  region: string
  screenshot: string | null
}

export interface MonitoringAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  source: string
  date: string
  status: AlertStatus
  probeId: string | null
}

export interface MonitoringActivityEvent {
  id: string
  type: 'probe-down' | 'probe-up' | 'probe-degraded' | 'alert-triggered' | 'slo-breach' | 'config-change' | 'synthetic-failed' | 'synthetic-recovered'
  message: string
  source: string
  timestamp: string
  details: string | null
}

export interface MonitoringData {
  overview: MonitoringOverview
  probes: Probe[]
  uptime: UptimeEntry[]
  metrics: MetricPoint[]
  slos: SLO[]
  synthetics: SyntheticTest[]
  alerts: MonitoringAlert[]
  activities: MonitoringActivityEvent[]
}

export const monitoringData: MonitoringData = {
  overview: {
    globalStatus: 'healthy',
    lastHeartbeat: new Date(Date.now() - 5_000).toISOString(),
    totalProbes: 12,
    upProbes: 10,
    downProbes: 0,
    degradedProbes: 2,
    avgResponseTimeMs: 142,
    p99ResponseTimeMs: 380,
    uptimePercent: 99.97,
    totalChecks24h: 17280,
    failedChecks24h: 5,
    activeAlerts: 2,
    sloCompliance: 99.95,
    monitoredEndpoints: 24,
    uptime: '47d 12h',
  },
  probes: [
    { id: 'pb-001', name: 'API Gateway — Primary', type: 'http', url: 'https://api.kamisama.io/health', status: 'up', responseTimeMs: 42, statusCode: 200, lastChecked: new Date(Date.now() - 5_000).toISOString(), lastUp: new Date(Date.now() - 5_000).toISOString(), uptimePercent: 99.99, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production', 'critical'] },
    { id: 'pb-002', name: 'API Gateway — Auth', type: 'http', url: 'https://auth.kamisama.io/health', status: 'up', responseTimeMs: 38, statusCode: 200, lastChecked: new Date(Date.now() - 8_000).toISOString(), lastUp: new Date(Date.now() - 8_000).toISOString(), uptimePercent: 99.98, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production', 'critical'] },
    { id: 'pb-003', name: 'Streaming Engine', type: 'http', url: 'https://stream.kamisama.io/health', status: 'degraded', responseTimeMs: 280, statusCode: 200, lastChecked: new Date(Date.now() - 10_000).toISOString(), lastUp: new Date(Date.now() - 10_000).toISOString(), uptimePercent: 99.85, region: 'us-east-1', interval: 15, timeout: 5, tags: ['production', 'critical'] },
    { id: 'pb-004', name: 'Encoding Workers', type: 'http', url: 'https://encoder.kamisama.io/health', status: 'up', responseTimeMs: 55, statusCode: 200, lastChecked: new Date(Date.now() - 12_000).toISOString(), lastUp: new Date(Date.now() - 12_000).toISOString(), uptimePercent: 99.92, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production'] },
    { id: 'pb-005', name: 'Database Primary', type: 'tcp', url: 'db-primary.internal:5432', status: 'up', responseTimeMs: 3, statusCode: null, lastChecked: new Date(Date.now() - 6_000).toISOString(), lastUp: new Date(Date.now() - 6_000).toISOString(), uptimePercent: 99.999, region: 'us-east-1', interval: 10, timeout: 5, tags: ['production', 'critical', 'database'] },
    { id: 'pb-006', name: 'Database Replica', type: 'tcp', url: 'db-replica.internal:5432', status: 'up', responseTimeMs: 5, statusCode: null, lastChecked: new Date(Date.now() - 7_000).toISOString(), lastUp: new Date(Date.now() - 7_000).toISOString(), uptimePercent: 99.99, region: 'us-east-1', interval: 10, timeout: 5, tags: ['production', 'database'] },
    { id: 'pb-007', name: 'Redis Cache', type: 'tcp', url: 'redis.internal:6379', status: 'up', responseTimeMs: 1, statusCode: null, lastChecked: new Date(Date.now() - 4_000).toISOString(), lastUp: new Date(Date.now() - 4_000).toISOString(), uptimePercent: 100, region: 'us-east-1', interval: 10, timeout: 3, tags: ['production', 'cache'] },
    { id: 'pb-008', name: 'DNS Resolution', type: 'dns', url: 'kamisama.io', status: 'up', responseTimeMs: 12, statusCode: null, lastChecked: new Date(Date.now() - 15_000).toISOString(), lastUp: new Date(Date.now() - 15_000).toISOString(), uptimePercent: 100, region: 'us-east-1', interval: 60, timeout: 10, tags: ['infrastructure'] },
    { id: 'pb-009', name: 'CDN Edge — US', type: 'http', url: 'https://cdn-us.kamisama.io/health', status: 'up', responseTimeMs: 18, statusCode: 200, lastChecked: new Date(Date.now() - 9_000).toISOString(), lastUp: new Date(Date.now() - 9_000).toISOString(), uptimePercent: 99.95, region: 'us-east-1', interval: 30, timeout: 10, tags: ['cdn'] },
    { id: 'pb-010', name: 'CDN Edge — EU', type: 'http', url: 'https://cdn-eu.kamisama.io/health', status: 'degraded', responseTimeMs: 320, statusCode: 200, lastChecked: new Date(Date.now() - 11_000).toISOString(), lastUp: new Date(Date.now() - 11_000).toISOString(), uptimePercent: 99.88, region: 'eu-west-1', interval: 30, timeout: 10, tags: ['cdn'] },
    { id: 'pb-011', name: 'Media Scanner', type: 'http', url: 'https://scanner.kamisama.io/health', status: 'up', responseTimeMs: 65, statusCode: 200, lastChecked: new Date(Date.now() - 14_000).toISOString(), lastUp: new Date(Date.now() - 14_000).toISOString(), uptimePercent: 99.90, region: 'us-east-1', interval: 60, timeout: 15, tags: ['production'] },
    { id: 'pb-012', name: 'Backup Service', type: 'grpc', url: 'backup.internal:443', status: 'up', responseTimeMs: 28, statusCode: null, lastChecked: new Date(Date.now() - 20_000).toISOString(), lastUp: new Date(Date.now() - 20_000).toISOString(), uptimePercent: 99.94, region: 'us-east-1', interval: 60, timeout: 10, tags: ['production', 'backup'] },
  ],
  uptime: [
    { id: 'ut-001', service: 'API Gateway', url: 'api.kamisama.io', uptime30d: 99.99, uptime24h: 100, downtime30dMins: 4.3, downtime24hMins: 0, avgResponseMs: 42, p95ResponseMs: 85, p99ResponseMs: 142, lastIncident: null, totalIncidents30d: 0, regions: ['us-east-1', 'eu-west-1'] },
    { id: 'ut-002', service: 'Auth Service', url: 'auth.kamisama.io', uptime30d: 99.98, uptime24h: 100, downtime30dMins: 8.6, downtime24hMins: 0, avgResponseMs: 38, p95ResponseMs: 72, p99ResponseMs: 118, lastIncident: new Date(Date.now() - 86400_000 * 12).toISOString(), totalIncidents30d: 1, regions: ['us-east-1'] },
    { id: 'ut-003', service: 'Streaming Engine', url: 'stream.kamisama.io', uptime30d: 99.85, uptime24h: 99.92, downtime30dMins: 64.8, downtime24hMins: 11.5, avgResponseMs: 120, p95ResponseMs: 280, p99ResponseMs: 520, lastIncident: new Date(Date.now() - 3600_000).toISOString(), totalIncidents30d: 4, regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'] },
    { id: 'ut-004', service: 'Encoding Workers', url: 'encoder.kamisama.io', uptime30d: 99.92, uptime24h: 99.98, downtime30dMins: 34.5, downtime24hMins: 2.9, avgResponseMs: 55, p95ResponseMs: 120, p99ResponseMs: 210, lastIncident: new Date(Date.now() - 86400_000 * 3).toISOString(), totalIncidents30d: 2, regions: ['us-east-1'] },
    { id: 'ut-005', service: 'Database', url: 'db-primary.internal', uptime30d: 99.999, uptime24h: 100, downtime30dMins: 0.4, downtime24hMins: 0, avgResponseMs: 3, p95ResponseMs: 8, p99ResponseMs: 15, lastIncident: null, totalIncidents30d: 0, regions: ['us-east-1'] },
    { id: 'ut-006', service: 'CDN', url: 'cdn.kamisama.io', uptime30d: 99.95, uptime24h: 99.96, downtime30dMins: 21.6, downtime24hMins: 5.8, avgResponseMs: 18, p95ResponseMs: 45, p99ResponseMs: 82, lastIncident: new Date(Date.now() - 7200_000).toISOString(), totalIncidents30d: 3, regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'] },
    { id: 'ut-007', service: 'Media Scanner', url: 'scanner.kamisama.io', uptime30d: 99.90, uptime24h: 100, downtime30dMins: 43.2, downtime24hMins: 0, avgResponseMs: 65, p95ResponseMs: 140, p99ResponseMs: 250, lastIncident: new Date(Date.now() - 86400_000 * 5).toISOString(), totalIncidents30d: 2, regions: ['us-east-1'] },
    { id: 'ut-008', service: 'Backup Service', url: 'backup.internal', uptime30d: 99.94, uptime24h: 100, downtime30dMins: 25.9, downtime24hMins: 0, avgResponseMs: 28, p95ResponseMs: 55, p99ResponseMs: 92, lastIncident: null, totalIncidents30d: 0, regions: ['us-east-1'] },
  ],
  metrics: [
    { time: '00:00', responseTime: 45, errorRate: 0.02, throughput: 1200 },
    { time: '01:00', responseTime: 42, errorRate: 0.01, throughput: 980 },
    { time: '02:00', responseTime: 38, errorRate: 0.01, throughput: 750 },
    { time: '03:00', responseTime: 35, errorRate: 0.00, throughput: 620 },
    { time: '04:00', responseTime: 36, errorRate: 0.01, throughput: 580 },
    { time: '05:00', responseTime: 40, errorRate: 0.01, throughput: 820 },
    { time: '06:00', responseTime: 48, errorRate: 0.02, throughput: 1100 },
    { time: '07:00', responseTime: 62, errorRate: 0.03, throughput: 1450 },
    { time: '08:00', responseTime: 85, errorRate: 0.05, throughput: 1800 },
    { time: '09:00', responseTime: 78, errorRate: 0.04, throughput: 1600 },
    { time: '10:00', responseTime: 68, errorRate: 0.03, throughput: 1350 },
    { time: '11:00', responseTime: 65, errorRate: 0.02, throughput: 1280 },
    { time: '12:00', responseTime: 72, errorRate: 0.03, throughput: 1400 },
    { time: '13:00', responseTime: 82, errorRate: 0.04, throughput: 1650 },
    { time: '14:00', responseTime: 95, errorRate: 0.06, throughput: 1900 },
    { time: '15:00', responseTime: 78, errorRate: 0.04, throughput: 1500 },
    { time: '16:00', responseTime: 65, errorRate: 0.03, throughput: 1300 },
    { time: '17:00', responseTime: 58, errorRate: 0.02, throughput: 1200 },
    { time: '18:00', responseTime: 52, errorRate: 0.02, throughput: 1100 },
    { time: '19:00', responseTime: 48, errorRate: 0.01, throughput: 950 },
    { time: '20:00', responseTime: 45, errorRate: 0.01, throughput: 880 },
    { time: '21:00', responseTime: 42, errorRate: 0.01, throughput: 820 },
    { time: '22:00', responseTime: 40, errorRate: 0.01, throughput: 750 },
    { time: '23:00', responseTime: 38, errorRate: 0.01, throughput: 680 },
  ],
  slos: [
    { id: 'slo-001', name: 'API Availability', target: 99.95, current: 99.99, status: 'met', window: '30d', service: 'API Gateway', errorBudgetRemaining: 98, errorBudgetTotal: 21.6, lastBreached: null },
    { id: 'slo-002', name: 'Auth Latency P99 < 200ms', target: 99.9, current: 99.85, status: 'at_risk', window: '30d', service: 'Auth Service', errorBudgetRemaining: 42, errorBudgetTotal: 43.2, lastBreached: new Date(Date.now() - 86400_000 * 5).toISOString() },
    { id: 'slo-003', name: 'Stream Availability', target: 99.9, current: 99.85, status: 'at_risk', window: '30d', service: 'Streaming Engine', errorBudgetRemaining: 22, errorBudgetTotal: 43.2, lastBreached: new Date(Date.now() - 3600_000).toISOString() },
    { id: 'slo-004', name: 'Encoding Success Rate', target: 99.5, current: 99.92, status: 'met', window: '30d', service: 'Encoding Workers', errorBudgetRemaining: 85, errorBudgetTotal: 216, lastBreached: null },
    { id: 'slo-005', name: 'Database Latency P99 < 20ms', target: 99.99, current: 99.995, status: 'met', window: '30d', service: 'Database', errorBudgetRemaining: 99, errorBudgetTotal: 4.32, lastBreached: null },
    { id: 'slo-006', name: 'CDN Cache Hit Ratio', target: 99.0, current: 97.8, status: 'breached', window: '30d', service: 'CDN', errorBudgetRemaining: 0, errorBudgetTotal: 432, lastBreached: new Date(Date.now() - 7200_000).toISOString() },
  ],
  synthetics: [
    { id: 'sy-001', name: 'Login Flow — Full E2E', url: 'https://app.kamisama.io/login', status: 'passed', durationMs: 2400, steps: 5, stepsPassed: 5, lastRun: new Date(Date.now() - 300_000).toISOString(), interval: '5m', region: 'us-east-1', screenshot: null },
    { id: 'sy-002', name: 'Media Playback — 4K Stream', url: 'https://stream.kamisama.io/play', status: 'passed', durationMs: 4200, steps: 8, stepsPassed: 8, lastRun: new Date(Date.now() - 600_000).toISOString(), interval: '10m', region: 'us-east-1', screenshot: null },
    { id: 'sy-003', name: 'Search & Browse Library', url: 'https://app.kamisama.io/search', status: 'passed', durationMs: 1800, steps: 4, stepsPassed: 4, lastRun: new Date(Date.now() - 300_000).toISOString(), interval: '5m', region: 'eu-west-1', screenshot: null },
    { id: 'sy-004', name: 'API Search — Response Validation', url: 'https://api.kamisama.io/v1/search', status: 'passed', durationMs: 320, steps: 2, stepsPassed: 2, lastRun: new Date(Date.now() - 120_000).toISOString(), interval: '2m', region: 'us-east-1', screenshot: null },
    { id: 'sy-005', name: 'CDN Asset Delivery — EU', url: 'https://cdn-eu.kamisama.io/assets', status: 'failed', durationMs: 12000, steps: 3, stepsPassed: 1, lastRun: new Date(Date.now() - 180_000).toISOString(), interval: '5m', region: 'eu-west-1', screenshot: null },
    { id: 'sy-006', name: 'Mobile App — Onboarding', url: 'https://app.kamisama.io/onboarding', status: 'passed', durationMs: 3600, steps: 6, stepsPassed: 6, lastRun: new Date(Date.now() - 900_000).toISOString(), interval: '15m', region: 'us-east-1', screenshot: null },
  ],
  alerts: [
    { id: 'ma-001', severity: 'warning', title: 'Streaming Engine response time degraded', description: 'P99 latency exceeded 500ms threshold — currently at 520ms for the last 10 minutes', source: 'streaming-engine', date: new Date(Date.now() - 600_000).toISOString(), status: 'active', probeId: 'pb-003' },
    { id: 'ma-002', severity: 'warning', title: 'CDN Edge EU degraded performance', description: 'Response time elevated to 320ms — expected < 50ms for CDN edge', source: 'cdn-eu', date: new Date(Date.now() - 7200_000).toISOString(), status: 'active', probeId: 'pb-010' },
    { id: 'ma-003', severity: 'critical', title: 'Synthetic test failed: CDN Asset Delivery — EU', description: 'Step 2 failed: asset returned 503 Service Unavailable — cache miss cascade', source: 'synthetic', date: new Date(Date.now() - 180_000).toISOString(), status: 'acknowledged', probeId: null },
    { id: 'ma-004', severity: 'info', title: 'SLO error budget consumed: CDN Cache Hit Ratio', description: 'CDN cache hit ratio at 97.8% — below 99% target, error budget exhausted', source: 'slo-monitor', date: new Date(Date.now() - 7200_000).toISOString(), status: 'acknowledged', probeId: null },
    { id: 'ma-005', severity: 'info', title: 'New probe added: Backup Service', description: 'gRPC probe for backup.internal:443 configured — 60s interval, 10s timeout', source: 'config', date: new Date(Date.now() - 86400_000).toISOString(), status: 'resolved', probeId: null },
  ],
  activities: [
    { id: 'mact-001', type: 'probe-degraded', message: 'Probe degraded: Streaming Engine — response time 280ms', source: 'streaming-engine', timestamp: new Date(Date.now() - 600_000).toISOString(), details: 'P99 latency: 520ms (threshold: 500ms) | Region: us-east-1 | Checks failed: 3/10' },
    { id: 'mact-002', type: 'alert-triggered', message: 'Alert fired: CDN Edge EU performance degraded', source: 'cdn-eu', timestamp: new Date(Date.now() - 7200_000).toISOString(), details: 'Response time: 320ms | Expected: < 50ms | Region: eu-west-1 | Impact: EU users' },
    { id: 'mact-003', type: 'synthetic-failed', message: 'Synthetic test failed: CDN Asset Delivery — EU', source: 'synthetic', timestamp: new Date(Date.now() - 180_000).toISOString(), details: 'Duration: 12s | Steps: 1/3 passed | Failed step: asset load returned 503' },
    { id: 'mact-004', type: 'slo-breach', message: 'SLO breached: CDN Cache Hit Ratio', source: 'slo-monitor', timestamp: new Date(Date.now() - 7200_000).toISOString(), details: 'Current: 97.8% | Target: 99.0% | Error budget: 0% remaining | Window: 30d' },
    { id: 'mact-005', type: 'config-change', message: 'New monitoring probe registered: Backup Service', source: 'backup-service', timestamp: new Date(Date.now() - 86400_000).toISOString(), details: 'Type: gRPC | Endpoint: backup.internal:443 | Interval: 60s | Timeout: 10s' },
    { id: 'mact-006', type: 'probe-up', message: 'Probe recovered: Auth Service — response time normalized', source: 'auth-service', timestamp: new Date(Date.now() - 14400_000).toISOString(), details: 'Response time: 38ms | Previous: 180ms | Duration of degradation: 12 minutes' },
    { id: 'mact-007', type: 'probe-down', message: 'Probe down: Streaming Engine — connection timeout', source: 'streaming-engine', timestamp: new Date(Date.now() - 28800_000).toISOString(), details: 'Endpoint: stream.kamisama.io/health | Timeout: 5s | Region: us-east-1 | Downtime: 8 minutes' },
    { id: 'mact-008', type: 'probe-up', message: 'Probe recovered: Streaming Engine — all systems operational', source: 'streaming-engine', timestamp: new Date(Date.now() - 28700_000).toISOString(), details: 'Response time: 120ms | Status: 200 OK | Recovery confirmed across all regions' },
    { id: 'mact-009', type: 'config-change', message: 'Probe interval updated: API Gateway — 30s → 15s', source: 'api-gateway', timestamp: new Date(Date.now() - 43200_000).toISOString(), details: 'Previous: 30s | New: 15s | Reason: Increased monitoring granularity for production' },
    { id: 'mact-010', type: 'synthetic-recovered', message: 'Synthetic test recovered: Login Flow — Full E2E', source: 'synthetic', timestamp: new Date(Date.now() - 86400_000).toISOString(), details: 'Duration: 2.4s | Steps: 5/5 passed | Previous failure: OAuth callback timeout' },
  ],
}
