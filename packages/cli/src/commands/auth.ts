import { Command } from 'commander';
import { input, password, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { randomBytes } from 'node:crypto';
import { getClient } from '../api/client.js';
import { setToken, setRefreshToken, setUser, clearConfig, setServerUrl, getConfig, isAuthenticated, getUser } from '../config/index.js';
import { success, error, heading, output, printKeyValueTable } from '../ui/format.js';
import { waitForOAuthCallback } from '../auth/oauth-server.js';
import { getSsoUrl, openBrowser } from '../auth/sso.js';

export function registerAuthCommands(program: Command): void {
  const auth = program.command('auth').description('Authentication & configuration');

  auth
    .command('login')
    .description('Login to your Kami server')
    .option('-e, --email <email>', 'Email address')
    .option('-p, --password <password>', 'Password')
    .option('-s, --server <url>', 'Server URL')
    .option('--sso', 'Login via SSO (opens browser)')
    .action(async (opts) => {
      const config = getConfig();
      let serverUrl = opts.server || config.serverUrl;

      if (!opts.server) {
        serverUrl = await input({ message: 'Server URL:', default: serverUrl });
      }
      setServerUrl(serverUrl);

      // ── SSO flow ──────────────────────────────────────
      if (opts.sso) {
        const port = 18923 + Math.floor(Math.random() * 1000);
        const state = randomBytes(16).toString('hex');
        const ssoUrl = getSsoUrl(`/cli-auth?port=${port}&state=${state}`);

        const spinner = ora('Starting local callback server...').start();
        try {
          const result = await waitForOAuthCallback(port, 120_000);

          if (result.state !== state) {
            spinner.fail('State mismatch — possible CSRF attack.');
            process.exit(1);
          }

          setToken(result.token);
          if (result.refreshToken) setRefreshToken(result.refreshToken);

          spinner.succeed('SSO login successful!');

          // Fetch user info with the new token
          const client = getClient();
          client.setToken(result.token);
          const user = await client.getMe();
          setUser(user as any);

          printKeyValueTable({
            Server: serverUrl,
            User: (user as any)?.displayName ?? (user as any)?.email ?? '—',
            Method: 'SSO',
          });
        } catch (err: any) {
          spinner.fail('SSO login failed');
          error(err.message);
          process.exit(1);
        }
        return;
      }

      // ── Email/password flow ───────────────────────────
      const email = opts.email || await input({ message: 'Email:' });
      const pass = opts.password || await password({ message: 'Password:' });

      const spinner = ora('Logging in...').start();
      try {
        const client = getClient();
        const result = await client.login(email, pass);
        setToken(result.accessToken);
        setRefreshToken(result.refreshToken);
        setUser(result.user as any);
        spinner.succeed('Logged in successfully!');
        printKeyValueTable({
          Email: email,
          Server: serverUrl,
          User: (result.user as any)?.displayName || email,
        });
      } catch (err: any) {
        spinner.fail('Login failed');
        error(err.message);
        process.exit(1);
      }
    });

  auth
    .command('logout')
    .description('Logout and clear stored credentials')
    .action(() => {
      clearConfig();
      success('Logged out. All credentials cleared.');
    });

  auth
    .command('register')
    .description('Register a new account')
    .option('-e, --email <email>', 'Email address')
    .option('-p, --password <password>', 'Password')
    .option('-n, --name <name>', 'Display name')
    .option('-s, --server <url>', 'Server URL')
    .action(async (opts) => {
      const config = getConfig();
      let serverUrl = opts.server || config.serverUrl;

      if (!opts.server) {
        serverUrl = await input({ message: 'Server URL:', default: serverUrl });
      }
      setServerUrl(serverUrl);

      const email = opts.email || await input({ message: 'Email:' });
      const pass = opts.password || await password({ message: 'Password:' });
      const name = opts.name || await input({ message: 'Display name:' });

      const spinner = ora('Registering...').start();
      try {
        const client = getClient();
        const result = await client.register(email, pass, name);
        setToken(result.accessToken);
        setRefreshToken(result.refreshToken);
        setUser(result.user as any);
        spinner.succeed('Registered and logged in!');
        printKeyValueTable({
          Email: email,
          Server: serverUrl,
          User: name,
        });
      } catch (err: any) {
        spinner.fail('Registration failed');
        error(err.message);
        process.exit(1);
      }
    });

  auth
    .command('whoami')
    .description('Show current authenticated user')
    .action(async () => {
      if (!isAuthenticated()) {
        error('Not logged in. Run `kami auth login` first.');
        process.exit(1);
      }
      const spinner = ora('Fetching user info...').start();
      try {
        const client = getClient();
        const user = await client.getMe();
        spinner.stop();
        heading('Current User');
        printKeyValueTable(user as Record<string, unknown>);
      } catch (err: any) {
        spinner.fail(err.message);
        process.exit(1);
      }
    });

  auth
    .command('configure')
    .description('Configure server URL and preferences')
    .option('-s, --server <url>', 'Server URL')
    .option('-f, --format <format>', 'Output format (table|json)')
    .action(async (opts) => {
      const config = getConfig();
      let serverUrl = opts.server;
      let format = opts.format;

      if (!serverUrl) {
        serverUrl = await input({ message: 'Server URL:', default: config.serverUrl });
      }
      if (!format) {
        format = await input({ message: 'Output format (table|json):', default: config.outputFormat });
      }

      setServerUrl(serverUrl);
      const { setOutputFormat } = await import('../config/index.js');
      setOutputFormat(format as 'table' | 'json');
      success('Configuration saved.');
    });

  auth
    .command('status')
    .description('Show authentication status')
    .action(() => {
      const config = getConfig();
      if (isAuthenticated()) {
        const user = getUser();
        heading('Authenticated');
        printKeyValueTable({
          Server: config.serverUrl,
          Email: user?.email ?? '—',
          User: user?.displayName ?? '—',
          Roles: (user?.roles ?? []).join(', ') || '—',
          'Output Format': config.outputFormat,
        });
      } else {
        heading('Not authenticated');
        console.log('Run `kami auth login` to authenticate.');
      }
    });
}
