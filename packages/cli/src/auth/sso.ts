import chalk from 'chalk';
import { getConfig } from '../config/index.js';

export type Environment = 'production' | 'localhost';

export interface DomainConfig {
  sso: string;
  api: string;
  protocol: string;
}

const DOMAINS: Record<Environment, DomainConfig> = {
  production: {
    sso: 'sso.kami-sama.tv',
    api: 'api.kami-sama.tv',
    protocol: 'https',
  },
  localhost: {
    sso: 'sso.kami-sama.localhost',
    api: 'api.kami-sama.localhost',
    protocol: 'http',
  },
};

function detectEnvironment(): Environment {
  const serverUrl = getConfig().serverUrl;
  return serverUrl.includes('kami-sama.tv') ? 'production' : 'localhost';
}

export function getDomainConfig(): DomainConfig {
  return DOMAINS[detectEnvironment()];
}

export function getSsoUrl(path: string = ''): string {
  const config = getDomainConfig();
  return `${config.protocol}://${config.sso}${path}`;
}

export function getApiUrl(path: string = ''): string {
  const config = getDomainConfig();
  return `${config.protocol}://${config.api}${path}`;
}

export function openBrowser(url: string): void {
  const { exec } = require('node:child_process');
  const platform = process.platform;
  let cmd: string;

  if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else if (platform === 'win32') {
    cmd = `start "${url}"`;
  } else {
    cmd = `xdg-open "${url}" 2>/dev/null || sensible-browser "${url}" 2>/dev/null || echo "${url}"`;
  }

  exec(cmd, (err: Error | null) => {
    if (err) {
      console.log(chalk.yellow('⚠ Could not open browser automatically.'));
      console.log(`  Open this URL manually:\n  ${chalk.cyan(url)}`);
    }
  });
}
