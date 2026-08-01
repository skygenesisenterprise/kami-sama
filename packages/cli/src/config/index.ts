import Conf from 'conf';
import { z } from 'zod';

// ── Environment detection ───────────────────────────────
// Kami API URLs:
//   Dev:  http://api.kami-sama.localhost/api/v1/*
//   Prod: https://api.kami-sama.tv/api/v1/*
//
// Priority: KAMI_API_URL env > KAMI_ENV env > stored config > default
// ────────────────────────────────────────────────────────

function getDefaultServerUrl(): string {
  // 1. Explicit env var takes highest priority
  if (process.env.KAMI_API_URL) return process.env.KAMI_API_URL;

  // 2. KAMI_ENV flag
  const env = process.env.KAMI_ENV;
  if (env === 'prod' || env === 'production') return 'https://api.kami-sama.tv';
  if (env === 'dev' || env === 'development') return 'http://api.kami-sama.localhost';

  // 3. Auto-detect: hostname containing 'kami-sama.localhost' => dev, otherwise prod
  // This is a safe default for local development
  return 'http://api.kami-sama.localhost';
}

const ConfigSchema = z.object({
  serverUrl: z.string().default(getDefaultServerUrl()),
  token: z.string().nullable().default(null),
  refreshToken: z.string().nullable().default(null),
  workspaceId: z.string().nullable().default(null),
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string(),
    roles: z.array(z.string()).default([]),
  }).nullable().default(null),
  outputFormat: z.enum(['table', 'json', 'yaml']).default('table'),
});

export type Config = z.infer<typeof ConfigSchema>;

const store = new Conf<Config>({
  projectName: 'kami-cli',
  defaults: {
    serverUrl: getDefaultServerUrl(),
    token: null,
    refreshToken: null,
    workspaceId: null,
    user: null,
    outputFormat: 'table',
  },
});

export function getConfig(): Config {
  return store.store;
}

export function setConfig(updates: Partial<Config>): void {
  const current = store.store;
  store.store = { ...current, ...updates };
}

export function getServerUrl(): string {
  return store.get('serverUrl');
}

export function setServerUrl(url: string): void {
  store.set('serverUrl', url);
}

export function getToken(): string | null {
  return store.get('token');
}

export function setToken(token: string | null): void {
  store.set('token', token);
}

export function setRefreshToken(token: string | null): void {
  store.set('refreshToken', token);
}

export function getUser(): Config['user'] {
  return store.get('user');
}

export function setUser(user: Config['user']): void {
  store.set('user', user);
}

export function getWorkspaceId(): string | null {
  return store.get('workspaceId');
}

export function setWorkspaceId(id: string | null): void {
  store.set('workspaceId', id);
}

export function getOutputFormat(): 'table' | 'json' | 'yaml' {
  return store.get('outputFormat');
}

export function setOutputFormat(format: 'table' | 'json' | 'yaml'): void {
  store.set('outputFormat', format);
}

export function clearConfig(): void {
  store.clear();
}

export function isAuthenticated(): boolean {
  return store.get('token') !== null;
}

export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated. Run `kami auth login` first.');
  }
}
