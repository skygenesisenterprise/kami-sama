export type CheckType = 'http' | 'tcp' | 'dns' | 'icmp' | 'grpc' | 'database'
export type CheckStatus = 'healthy' | 'degraded' | 'down' | 'pending'
export type CertStatus = 'valid' | 'expiring_soon' | 'expired'
export type DependencyStatus = 'operational' | 'degraded' | 'down'
export type GlobalHealth = 'healthy' | 'degraded' | 'critical'

export interface HealthOverview {
  globalHealth: GlobalHealth
  lastCheck: string
  totalChecks: number
  healthyChecks: number
  degradedChecks: number
  downChecks: number
  avgResponseTimeMs: number
  successRate: number
  checksLast24h: number
  failuresLast24h: number
  totalEndpoints: number
  totalDependencies: number
  certsExpiring30d: number
  uptime: string
}

export interface HealthCheck {
  id: string
  name: string
  type: CheckType
  url: string
  method: string | null
  expectedStatus: number | null
  status: CheckStatus
  responseTimeMs: number
  statusCode: number | null
  lastChecked: string
  lastSuccess: string
  lastFailure: string | null
  successCount24h: number
  failureCount24h: number
  uptimePercent: number
  region: string
  interval: number
  timeout: number
  tags: string[]
  errorMessage: string | null
}

export interface Endpoint {
  id: string
  name: string
  url: string
  method: string
  expectedStatus: number
  expectedBody: string | null
  headers: Record<string, string>
  status: CheckStatus
  lastChecked: string
  responseTimeMs: number
  statusCode: number | null
  uptimePercent: number
  region: string
  checkInterval: number
  retries: number
  authentication: boolean
  tags: string[]
}

export interface SSLCert {
  id: string
  domain: string
  issuer: string
  status: CertStatus
  validFrom: string
  validTo: string
  daysUntilExpiry: number
  serialNumber: string
  fingerprint: string
  protocol: string
  keySize: number
  autoRenew: boolean
}

export interface Dependency {
  id: string
  name: string
  type: 'service' | 'database' | 'cache' | 'queue' | 'storage' | 'external'
  status: DependencyStatus
  url: string | null
  responseTimeMs: number
  lastChecked: string
  uptimePercent: number
  version: string | null
  region: string
  healthEndpoint: string
  lastIncident: string | null
  dependencies: string[]
}

export interface HistoryEntry {
  id: string
  checkId: string
  checkName: string
  status: CheckStatus
  responseTimeMs: number
  statusCode: number | null
  timestamp: string
  region: string
  errorMessage: string | null
}

export interface HealthAlert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  source: string
  date: string
  status: 'active' | 'acknowledged' | 'resolved'
  checkId: string | null
}

export interface HealthActivityEvent {
  id: string
  type: 'check-down' | 'check-recovered' | 'check-degraded' | 'cert-expiring' | 'dependency-down' | 'dependency-recovered' | 'config-change' | 'alert-triggered'
  message: string
  source: string
  timestamp: string
  details: string | null
}

export interface HealthChecksData {
  overview: HealthOverview
  checks: HealthCheck[]
  endpoints: Endpoint[]
  sslCerts: SSLCert[]
  dependencies: Dependency[]
  history: HistoryEntry[]
  alerts: HealthAlert[]
  activities: HealthActivityEvent[]
}

export const healthChecksData: HealthChecksData = {
  overview: {
    globalHealth: 'healthy',
    lastCheck: new Date(Date.now() - 3_000).toISOString(),
    totalChecks: 18,
    healthyChecks: 15,
    degradedChecks: 2,
    downChecks: 1,
    avgResponseTimeMs: 85,
    successRate: 99.72,
    checksLast24h: 25920,
    failuresLast24h: 73,
    totalEndpoints: 24,
    totalDependencies: 12,
    certsExpiring30d: 1,
    uptime: '47d 12h',
  },
  checks: [
    { id: 'hc-001', name: 'API Gateway — Health', type: 'http', url: 'https://api.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 35, statusCode: 200, lastChecked: new Date(Date.now() - 3_000).toISOString(), lastSuccess: new Date(Date.now() - 3_000).toISOString(), lastFailure: null, successCount24h: 2879, failureCount24h: 1, uptimePercent: 99.97, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production', 'critical'], errorMessage: null },
    { id: 'hc-002', name: 'Auth Service — Health', type: 'http', url: 'https://auth.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 42, statusCode: 200, lastChecked: new Date(Date.now() - 5_000).toISOString(), lastSuccess: new Date(Date.now() - 5_000).toISOString(), lastFailure: null, successCount24h: 2878, failureCount24h: 0, uptimePercent: 99.99, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production', 'critical'], errorMessage: null },
    { id: 'hc-003', name: 'Streaming Engine — Health', type: 'http', url: 'https://stream.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'degraded', responseTimeMs: 320, statusCode: 200, lastChecked: new Date(Date.now() - 8_000).toISOString(), lastSuccess: new Date(Date.now() - 8_000).toISOString(), lastFailure: new Date(Date.now() - 900_000).toISOString(), successCount24h: 2860, failureCount24h: 20, uptimePercent: 99.30, region: 'us-east-1', interval: 15, timeout: 5, tags: ['production', 'critical'], errorMessage: 'Response time above threshold (320ms > 200ms)' },
    { id: 'hc-004', name: 'Encoding Workers — Health', type: 'http', url: 'https://encoder.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 58, statusCode: 200, lastChecked: new Date(Date.now() - 10_000).toISOString(), lastSuccess: new Date(Date.now() - 10_000).toISOString(), lastFailure: null, successCount24h: 2875, failureCount24h: 2, uptimePercent: 99.93, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production'], errorMessage: null },
    { id: 'hc-005', name: 'Media Scanner — Health', type: 'http', url: 'https://scanner.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 65, statusCode: 200, lastChecked: new Date(Date.now() - 12_000).toISOString(), lastSuccess: new Date(Date.now() - 12_000).toISOString(), lastFailure: null, successCount24h: 1438, failureCount24h: 1, uptimePercent: 99.93, region: 'us-east-1', interval: 60, timeout: 15, tags: ['production'], errorMessage: null },
    { id: 'hc-006', name: 'Database Primary — TCP', type: 'tcp', url: 'db-primary.internal:5432', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 2, statusCode: null, lastChecked: new Date(Date.now() - 2_000).toISOString(), lastSuccess: new Date(Date.now() - 2_000).toISOString(), lastFailure: null, successCount24h: 8640, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 10, timeout: 5, tags: ['production', 'database', 'critical'], errorMessage: null },
    { id: 'hc-007', name: 'Database Replica — TCP', type: 'tcp', url: 'db-replica.internal:5432', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 4, statusCode: null, lastChecked: new Date(Date.now() - 4_000).toISOString(), lastSuccess: new Date(Date.now() - 4_000).toISOString(), lastFailure: null, successCount24h: 8638, failureCount24h: 2, uptimePercent: 99.98, region: 'us-east-1', interval: 10, timeout: 5, tags: ['production', 'database'], errorMessage: null },
    { id: 'hc-008', name: 'Redis Cache — TCP', type: 'tcp', url: 'redis.internal:6379', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 1, statusCode: null, lastChecked: new Date(Date.now() - 1_000).toISOString(), lastSuccess: new Date(Date.now() - 1_000).toISOString(), lastFailure: null, successCount24h: 8640, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 10, timeout: 3, tags: ['production', 'cache'], errorMessage: null },
    { id: 'hc-009', name: 'DNS — kamisama.io', type: 'dns', url: 'kamisama.io', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 8, statusCode: null, lastChecked: new Date(Date.now() - 15_000).toISOString(), lastSuccess: new Date(Date.now() - 15_000).toISOString(), lastFailure: null, successCount24h: 5760, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 60, timeout: 10, tags: ['infrastructure'], errorMessage: null },
    { id: 'hc-010', name: 'DNS — api.kamisama.io', type: 'dns', url: 'api.kamisama.io', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 10, statusCode: null, lastChecked: new Date(Date.now() - 18_000).toISOString(), lastSuccess: new Date(Date.now() - 18_000).toISOString(), lastFailure: null, successCount24h: 5760, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 60, timeout: 10, tags: ['infrastructure'], errorMessage: null },
    { id: 'hc-011', name: 'CDN Edge — US Health', type: 'http', url: 'https://cdn-us.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 15, statusCode: 200, lastChecked: new Date(Date.now() - 6_000).toISOString(), lastSuccess: new Date(Date.now() - 6_000).toISOString(), lastFailure: null, successCount24h: 5758, failureCount24h: 2, uptimePercent: 99.97, region: 'us-east-1', interval: 60, timeout: 10, tags: ['cdn'], errorMessage: null },
    { id: 'hc-012', name: 'CDN Edge — EU Health', type: 'http', url: 'https://cdn-eu.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'degraded', responseTimeMs: 280, statusCode: 200, lastChecked: new Date(Date.now() - 9_000).toISOString(), lastSuccess: new Date(Date.now() - 9_000).toISOString(), lastFailure: new Date(Date.now() - 7200_000).toISOString(), successCount24h: 5700, failureCount24h: 60, uptimePercent: 98.96, region: 'eu-west-1', interval: 60, timeout: 10, tags: ['cdn'], errorMessage: 'Elevated latency from EU edge node' },
    { id: 'hc-013', name: 'Backup Service — gRPC', type: 'grpc', url: 'backup.internal:443', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 22, statusCode: null, lastChecked: new Date(Date.now() - 20_000).toISOString(), lastSuccess: new Date(Date.now() - 20_000).toISOString(), lastFailure: null, successCount24h: 1439, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 60, timeout: 10, tags: ['production', 'backup'], errorMessage: null },
    { id: 'hc-014', name: 'Search API — Health', type: 'http', url: 'https://search.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 48, statusCode: 200, lastChecked: new Date(Date.now() - 7_000).toISOString(), lastSuccess: new Date(Date.now() - 7_000).toISOString(), lastFailure: null, successCount24h: 2876, failureCount24h: 3, uptimePercent: 99.90, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production'], errorMessage: null },
    { id: 'hc-015', name: 'Notification Service — Health', type: 'http', url: 'https://notify.kamisama.io/health', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 38, statusCode: 200, lastChecked: new Date(Date.now() - 4_000).toISOString(), lastSuccess: new Date(Date.now() - 4_000).toISOString(), lastFailure: null, successCount24h: 2879, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production'], errorMessage: null },
    { id: 'hc-016', name: 'RabbitMQ — TCP', type: 'tcp', url: 'rabbitmq.internal:5672', method: null, expectedStatus: null, status: 'healthy', responseTimeMs: 3, statusCode: null, lastChecked: new Date(Date.now() - 3_000).toISOString(), lastSuccess: new Date(Date.now() - 3_000).toISOString(), lastFailure: null, successCount24h: 8640, failureCount24h: 0, uptimePercent: 100, region: 'us-east-1', interval: 10, timeout: 5, tags: ['production', 'queue'], errorMessage: null },
    { id: 'hc-017', name: 'MinIO Storage — Health', type: 'http', url: 'https://minio.internal/minio/health/live', method: 'GET', expectedStatus: 200, status: 'healthy', responseTimeMs: 12, statusCode: 200, lastChecked: new Date(Date.now() - 5_000).toISOString(), lastSuccess: new Date(Date.now() - 5_000).toISOString(), lastFailure: null, successCount24h: 8638, failureCount24h: 2, uptimePercent: 99.98, region: 'us-east-1', interval: 30, timeout: 10, tags: ['production', 'storage'], errorMessage: null },
    { id: 'hc-018', name: 'Prometheus — Health', type: 'http', url: 'https://prometheus.internal:9090/-/healthy', method: 'GET', expectedStatus: 200, status: 'down', responseTimeMs: 5000, statusCode: null, lastChecked: new Date(Date.now() - 10_000).toISOString(), lastSuccess: new Date(Date.now() - 1800_000).toISOString(), lastFailure: new Date(Date.now() - 300_000).toISOString(), successCount24h: 2400, failureCount24h: 480, uptimePercent: 83.33, region: 'us-east-1', interval: 60, timeout: 10, tags: ['monitoring'], errorMessage: 'Connection timeout after 5000ms — service unreachable' },
  ],
  endpoints: [
    { id: 'ep-001', name: 'Login Endpoint', url: 'https://api.kamisama.io/v1/auth/login', method: 'POST', expectedStatus: 200, expectedBody: '{"token":', headers: { 'Content-Type': 'application/json' }, status: 'healthy', lastChecked: new Date(Date.now() - 30_000).toISOString(), responseTimeMs: 120, statusCode: 200, uptimePercent: 99.98, region: 'us-east-1', checkInterval: 60, retries: 3, authentication: false, tags: ['auth', 'critical'] },
    { id: 'ep-002', name: 'Search Endpoint', url: 'https://api.kamisama.io/v1/search?q=test', method: 'GET', expectedStatus: 200, expectedBody: '"results":', headers: {}, status: 'healthy', lastChecked: new Date(Date.now() - 45_000).toISOString(), responseTimeMs: 85, statusCode: 200, uptimePercent: 99.95, region: 'us-east-1', checkInterval: 60, retries: 3, authentication: false, tags: ['search'] },
    { id: 'ep-003', name: 'Media Library List', url: 'https://api.kamisama.io/v1/library', method: 'GET', expectedStatus: 200, expectedBody: null, headers: { 'Authorization': 'Bearer ***' }, status: 'healthy', lastChecked: new Date(Date.now() - 60_000).toISOString(), responseTimeMs: 95, statusCode: 200, uptimePercent: 99.92, region: 'us-east-1', checkInterval: 120, retries: 3, authentication: true, tags: ['library', 'auth-required'] },
    { id: 'ep-004', name: 'Streaming Session Start', url: 'https://stream.kamisama.io/v1/session', method: 'POST', expectedStatus: 201, expectedBody: '"session_id":', headers: { 'Content-Type': 'application/json' }, status: 'degraded', lastChecked: new Date(Date.now() - 20_000).toISOString(), responseTimeMs: 450, statusCode: 201, uptimePercent: 99.10, region: 'us-east-1', checkInterval: 60, retries: 2, authentication: true, tags: ['streaming', 'critical'] },
    { id: 'ep-005', name: 'User Profile Update', url: 'https://api.kamisama.io/v1/user/profile', method: 'PUT', expectedStatus: 200, expectedBody: null, headers: { 'Authorization': 'Bearer ***', 'Content-Type': 'application/json' }, status: 'healthy', lastChecked: new Date(Date.now() - 90_000).toISOString(), responseTimeMs: 65, statusCode: 200, uptimePercent: 99.99, region: 'us-east-1', checkInterval: 300, retries: 3, authentication: true, tags: ['user'] },
    { id: 'ep-006', name: 'Webhook Delivery', url: 'https://api.kamisama.io/v1/webhooks', method: 'POST', expectedStatus: 202, expectedBody: null, headers: { 'Content-Type': 'application/json' }, status: 'healthy', lastChecked: new Date(Date.now() - 120_000).toISOString(), responseTimeMs: 45, statusCode: 202, uptimePercent: 99.97, region: 'us-east-1', checkInterval: 300, retries: 3, authentication: false, tags: ['webhooks'] },
  ],
  sslCerts: [
    { id: 'ssl-001', domain: 'kamisama.io', issuer: "Let's Encrypt Authority X3", status: 'valid', validFrom: new Date(Date.now() - 86400_000 * 30).toISOString(), validTo: new Date(Date.now() + 86400_000 * 60).toISOString(), daysUntilExpiry: 60, serialNumber: '04:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78', fingerprint: 'SHA256:a1b2c3d4e5f6...', protocol: 'TLS 1.3', keySize: 256, autoRenew: true },
    { id: 'ssl-002', domain: 'api.kamisama.io', issuer: "Let's Encrypt Authority X3", status: 'valid', validFrom: new Date(Date.now() - 86400_000 * 45).toISOString(), validTo: new Date(Date.now() + 86400_000 * 45).toISOString(), daysUntilExpiry: 45, serialNumber: '05:BC:DE:F0:23:45:67:89:01:BC:DE:F0:23:45:67:89', fingerprint: 'SHA256:b2c3d4e5f6g7...', protocol: 'TLS 1.3', keySize: 256, autoRenew: true },
    { id: 'ssl-003', domain: 'stream.kamisama.io', issuer: 'DigiCert SHA2 Secure CA', status: 'expiring_soon', validFrom: new Date(Date.now() - 86400_000 * 330).toISOString(), validTo: new Date(Date.now() + 86400_000 * 35).toISOString(), daysUntilExpiry: 35, serialNumber: '06:CD:EF:01:34:56:78:90:12:CD:EF:01:34:56:78:90', fingerprint: 'SHA256:c3d4e5f6g7h8...', protocol: 'TLS 1.2', keySize: 2048, autoRenew: false },
    { id: 'ssl-004', domain: 'auth.kamisama.io', issuer: "Let's Encrypt Authority X3", status: 'valid', validFrom: new Date(Date.now() - 86400_000 * 20).toISOString(), validTo: new Date(Date.now() + 86400_000 * 70).toISOString(), daysUntilExpiry: 70, serialNumber: '07:DE:F0:12:45:67:89:01:23:DE:F0:12:45:67:89:01', fingerprint: 'SHA256:d4e5f6g7h8i9...', protocol: 'TLS 1.3', keySize: 256, autoRenew: true },
    { id: 'ssl-005', domain: 'cdn.kamisama.io', issuer: 'Cloudflare Inc ECC CA-3', status: 'valid', validFrom: new Date(Date.now() - 86400_000 * 10).toISOString(), validTo: new Date(Date.now() + 86400_000 * 355).toISOString(), daysUntilExpiry: 355, serialNumber: '08:EF:01:23:56:78:90:12:34:EF:01:23:56:78:90:12', fingerprint: 'SHA256:e5f6g7h8i9j0...', protocol: 'TLS 1.3', keySize: 256, autoRenew: true },
  ],
  dependencies: [
    { id: 'dep-001', name: 'PostgreSQL Primary', type: 'database', status: 'operational', url: 'db-primary.internal:5432', responseTimeMs: 3, lastChecked: new Date(Date.now() - 2_000).toISOString(), uptimePercent: 100, version: '16.2', region: 'us-east-1', healthEndpoint: 'tcp:5432', lastIncident: null, dependencies: [] },
    { id: 'dep-002', name: 'PostgreSQL Replica', type: 'database', status: 'operational', url: 'db-replica.internal:5432', responseTimeMs: 5, lastChecked: new Date(Date.now() - 3_000).toISOString(), uptimePercent: 99.99, version: '16.2', region: 'us-east-1', healthEndpoint: 'tcp:5432', lastIncident: null, dependencies: ['dep-001'] },
    { id: 'dep-003', name: 'Redis Cache', type: 'cache', status: 'operational', url: 'redis.internal:6379', responseTimeMs: 1, lastChecked: new Date(Date.now() - 1_000).toISOString(), uptimePercent: 100, version: '7.2.4', region: 'us-east-1', healthEndpoint: 'tcp:6379', lastIncident: null, dependencies: [] },
    { id: 'dep-004', name: 'RabbitMQ', type: 'queue', status: 'operational', url: 'rabbitmq.internal:5672', responseTimeMs: 3, lastChecked: new Date(Date.now() - 2_000).toISOString(), uptimePercent: 100, version: '3.13.1', region: 'us-east-1', healthEndpoint: 'tcp:5672', lastIncident: null, dependencies: [] },
    { id: 'dep-005', name: 'MinIO Object Storage', type: 'storage', status: 'operational', url: 'minio.internal', responseTimeMs: 12, lastChecked: new Date(Date.now() - 4_000).toISOString(), uptimePercent: 99.98, version: '2024.03.15', region: 'us-east-1', healthEndpoint: 'https://minio.internal/minio/health/live', lastIncident: null, dependencies: [] },
    { id: 'dep-006', name: 'Prometheus', type: 'service', status: 'down', url: 'prometheus.internal:9090', responseTimeMs: 5000, lastChecked: new Date(Date.now() - 10_000).toISOString(), uptimePercent: 83.33, version: '2.51.0', region: 'us-east-1', healthEndpoint: 'https://prometheus.internal:9090/-/healthy', lastIncident: new Date(Date.now() - 300_000).toISOString(), dependencies: ['dep-005'] },
    { id: 'dep-007', name: 'Grafana', type: 'service', status: 'degraded', url: 'grafana.internal:3000', responseTimeMs: 180, lastChecked: new Date(Date.now() - 5_000).toISOString(), uptimePercent: 99.50, version: '10.4.0', region: 'us-east-1', healthEndpoint: 'https://grafana.internal:3000/api/health', lastIncident: new Date(Date.now() - 7200_000).toISOString(), dependencies: ['dep-006'] },
    { id: 'dep-008', name: 'Cloudflare CDN', type: 'external', status: 'operational', url: null, responseTimeMs: 15, lastChecked: new Date(Date.now() - 6_000).toISOString(), uptimePercent: 99.99, version: null, region: 'global', healthEndpoint: 'https://cdn.kamisama.io/health', lastIncident: null, dependencies: [] },
    { id: 'dep-009', name: 'Stripe API', type: 'external', status: 'operational', url: 'api.stripe.com', responseTimeMs: 95, lastChecked: new Date(Date.now() - 30_000).toISOString(), uptimePercent: 99.99, version: null, region: 'global', healthEndpoint: 'https://api.stripe.com/v1/health', lastIncident: null, dependencies: [] },
    { id: 'dep-010', name: 'SendGrid API', type: 'external', status: 'operational', url: 'api.sendgrid.com', responseTimeMs: 110, lastChecked: new Date(Date.now() - 45_000).toISOString(), uptimePercent: 99.95, version: null, region: 'global', healthEndpoint: 'https://api.sendgrid.com/v3/health', lastIncident: null, dependencies: [] },
    { id: 'dep-011', name: 'TMDB API', type: 'external', status: 'operational', url: 'api.themoviedb.org', responseTimeMs: 150, lastChecked: new Date(Date.now() - 60_000).toISOString(), uptimePercent: 99.90, version: null, region: 'global', healthEndpoint: 'https://api.themoviedb.org/3/configuration', lastIncident: new Date(Date.now() - 86400_000 * 7).toISOString(), dependencies: [] },
    { id: 'dep-012', name: 'JWT Signing Service', type: 'service', status: 'operational', url: 'auth.internal:443', responseTimeMs: 2, lastChecked: new Date(Date.now() - 1_000).toISOString(), uptimePercent: 100, version: '1.0.0', region: 'us-east-1', healthEndpoint: 'grpc:auth.internal:443', lastIncident: null, dependencies: [] },
  ],
  history: [
    { id: 'hist-001', checkId: 'hc-001', checkName: 'API Gateway — Health', status: 'healthy', responseTimeMs: 32, statusCode: 200, timestamp: new Date(Date.now() - 3_000).toISOString(), region: 'us-east-1', errorMessage: null },
    { id: 'hist-002', checkId: 'hc-003', checkName: 'Streaming Engine — Health', status: 'degraded', responseTimeMs: 310, statusCode: 200, timestamp: new Date(Date.now() - 8_000).toISOString(), region: 'us-east-1', errorMessage: 'Response time above threshold' },
    { id: 'hist-003', checkId: 'hc-018', checkName: 'Prometheus — Health', status: 'down', responseTimeMs: 5000, statusCode: null, timestamp: new Date(Date.now() - 10_000).toISOString(), region: 'us-east-1', errorMessage: 'Connection timeout after 5000ms' },
    { id: 'hist-004', checkId: 'hc-012', checkName: 'CDN Edge — EU Health', status: 'degraded', responseTimeMs: 275, statusCode: 200, timestamp: new Date(Date.now() - 9_000).toISOString(), region: 'eu-west-1', errorMessage: 'Elevated latency' },
    { id: 'hist-005', checkId: 'hc-006', checkName: 'Database Primary — TCP', status: 'healthy', responseTimeMs: 2, statusCode: null, timestamp: new Date(Date.now() - 2_000).toISOString(), region: 'us-east-1', errorMessage: null },
    { id: 'hist-006', checkId: 'hc-008', checkName: 'Redis Cache — TCP', status: 'healthy', responseTimeMs: 1, statusCode: null, timestamp: new Date(Date.now() - 1_000).toISOString(), region: 'us-east-1', errorMessage: null },
    { id: 'hist-007', checkId: 'hc-002', checkName: 'Auth Service — Health', status: 'healthy', responseTimeMs: 40, statusCode: 200, timestamp: new Date(Date.now() - 5_000).toISOString(), region: 'us-east-1', errorMessage: null },
    { id: 'hist-008', checkId: 'hc-018', checkName: 'Prometheus — Health', status: 'healthy', responseTimeMs: 85, statusCode: 200, timestamp: new Date(Date.now() - 3600_000).toISOString(), region: 'us-east-1', errorMessage: null },
    { id: 'hist-009', checkId: 'hc-003', checkName: 'Streaming Engine — Health', status: 'down', responseTimeMs: 5000, statusCode: null, timestamp: new Date(Date.now() - 7200_000).toISOString(), region: 'us-east-1', errorMessage: 'Connection refused' },
    { id: 'hist-010', checkId: 'hc-003', checkName: 'Streaming Engine — Health', status: 'healthy', responseTimeMs: 115, statusCode: 200, timestamp: new Date(Date.now() - 7100_000).toISOString(), region: 'us-east-1', errorMessage: null },
    { id: 'hist-011', checkId: 'hc-012', checkName: 'CDN Edge — EU Health', status: 'healthy', responseTimeMs: 42, statusCode: 200, timestamp: new Date(Date.now() - 14400_000).toISOString(), region: 'eu-west-1', errorMessage: null },
    { id: 'hist-012', checkId: 'hc-014', checkName: 'Search API — Health', status: 'healthy', responseTimeMs: 52, statusCode: 200, timestamp: new Date(Date.now() - 7_000).toISOString(), region: 'us-east-1', errorMessage: null },
  ],
  alerts: [
    { id: 'hca-001', severity: 'critical', title: 'Prometheus health check down', description: 'Connection timeout after 5000ms — service unreachable since 5 minutes ago', source: 'prometheus', date: new Date(Date.now() - 300_000).toISOString(), status: 'active', checkId: 'hc-018' },
    { id: 'hca-002', severity: 'warning', title: 'Streaming Engine response time degraded', description: 'P99 latency at 320ms — threshold is 200ms. Service returning 200 but slowly', source: 'streaming-engine', date: new Date(Date.now() - 600_000).toISOString(), status: 'active', checkId: 'hc-003' },
    { id: 'hca-003', severity: 'warning', title: 'CDN Edge EU latency elevated', description: 'EU edge node response time at 280ms — expected < 50ms for CDN. Possible cache miss cascade', source: 'cdn-eu', date: new Date(Date.now() - 7200_000).toISOString(), status: 'acknowledged', checkId: 'hc-012' },
    { id: 'hca-004', severity: 'info', title: 'SSL certificate expiring soon: stream.kamisama.io', description: 'Certificate expires in 35 days. Auto-renewal is disabled — manual renewal required', source: 'ssl-monitor', date: new Date(Date.now() - 86400_000).toISOString(), status: 'acknowledged', checkId: null },
    { id: 'hca-005', severity: 'critical', title: 'Grafana dependency degraded — depends on Prometheus', description: 'Grafana health check degraded due to Prometheus being down. Dashboard rendering may fail', source: 'dependency-graph', date: new Date(Date.now() - 300_000).toISOString(), status: 'active', checkId: null },
    { id: 'hca-006', severity: 'info', title: 'Health check configuration updated: CDN Edge — US', description: 'Check interval changed from 120s to 60s for faster detection', source: 'config', date: new Date(Date.now() - 86400_000 * 2).toISOString(), status: 'resolved', checkId: null },
  ],
  activities: [
    { id: 'hact-001', type: 'check-down', message: 'Health check failed: Prometheus — Connection timeout after 5000ms', source: 'prometheus', timestamp: new Date(Date.now() - 300_000).toISOString(), details: 'Endpoint: prometheus.internal:9090/-/healthy | Region: us-east-1 | Consecutive failures: 5 | Last success: 30 minutes ago' },
    { id: 'hact-002', type: 'check-degraded', message: 'Health check degraded: Streaming Engine — response time 320ms', source: 'streaming-engine', timestamp: new Date(Date.now() - 600_000).toISOString(), details: 'Threshold: 200ms | Current: 320ms | Success rate: 99.30% | Region: us-east-1' },
    { id: 'hact-003', type: 'cert-expiring', message: 'SSL certificate expiring in 35 days: stream.kamisama.io', source: 'ssl-monitor', timestamp: new Date(Date.now() - 86400_000).toISOString(), details: 'Issuer: DigiCert SHA2 Secure CA | Protocol: TLS 1.2 | Auto-renew: disabled | Action required: manual renewal' },
    { id: 'hact-004', type: 'dependency-down', message: 'Dependency down: Prometheus — health check unreachable', source: 'dependency-graph', timestamp: new Date(Date.now() - 300_000).toISOString(), details: 'Type: service | Endpoint: prometheus.internal:9090 | Impact: Grafana dashboards degraded' },
    { id: 'hact-005', type: 'check-recovered', message: 'Health check recovered: Streaming Engine — back to healthy', source: 'streaming-engine', timestamp: new Date(Date.now() - 14400_000).toISOString(), details: 'Response time: 115ms (was 5000ms) | Downtime: 10 minutes | Region: us-east-1' },
    { id: 'hact-006', type: 'config-change', message: 'Check interval updated: CDN Edge — US (120s → 60s)', source: 'cdn-us', timestamp: new Date(Date.now() - 86400_000 * 2).toISOString(), details: 'Previous: 120s | New: 60s | Reason: Faster detection for CDN edge issues | Changed by: admin@kamisama.io' },
    { id: 'hact-007', type: 'check-recovered', message: 'Health check recovered: Prometheus — back to healthy', source: 'prometheus', timestamp: new Date(Date.now() - 2400_000).toISOString(), details: 'Response time: 85ms | Status: 200 OK | Duration of outage: 5 minutes | Root cause: disk full' },
    { id: 'hact-008', type: 'alert-triggered', message: 'Alert fired: Grafana dependency degraded', source: 'dependency-graph', timestamp: new Date(Date.now() - 300_000).toISOString(), details: 'Grafana depends on Prometheus | Prometheus is down | Impact: dashboard rendering may fail | Severity: critical' },
  ],
}
