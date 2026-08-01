import { Command } from 'commander';
import { input, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerSettingsCommands(program: Command): void {
  const settings = program.command('settings').description('Platform settings & configuration');

  // --- General ---
  const general = settings.command('general').description('General settings');
  general
    .command('get')
    .description('View general settings')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getGeneralSettings();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  general
    .command('update')
    .description('Update general settings')
    .option('--site-name <name>', 'Site name')
    .option('--site-url <url>', 'Site URL')
    .option('--description <desc>', 'Site description')
    .option('--language <lang>', 'Default language')
    .option('--timezone <tz>', 'Timezone')
    .action(async (opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.siteName) updates.siteName = opts.siteName;
      if (opts.siteUrl) updates.siteUrl = opts.siteUrl;
      if (opts.description) updates.description = opts.description;
      if (opts.language) updates.language = opts.language;
      if (opts.timezone) updates.timezone = opts.timezone;
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateGeneralSettings(updates);
        spinner.succeed('General settings updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Security ---
  const security = settings.command('security').description('Security settings');
  security
    .command('get')
    .description('View security settings')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getSecuritySettings();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  security
    .command('update')
    .description('Update security settings')
    .option('--enable-2fa <bool>', 'Enable 2FA (true|false)')
    .option('--session-timeout <minutes>', 'Session timeout in minutes')
    .option('--max-login-attempts <n>', 'Max login attempts before lockout')
    .action(async (opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.enable2fa) updates.enable2fa = opts.enable2fa === 'true';
      if (opts.sessionTimeout) updates.sessionTimeout = parseInt(opts.sessionTimeout);
      if (opts.maxLoginAttempts) updates.maxLoginAttempts = parseInt(opts.maxLoginAttempts);
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateSecuritySettings(updates);
        spinner.succeed('Security settings updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Branding ---
  const branding = settings.command('branding').description('Branding settings');
  branding
    .command('get')
    .description('View branding settings')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getBrandingSettings();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  branding
    .command('update')
    .description('Update branding settings')
    .option('--brand-color <color>', 'Primary brand color')
    .option('--accent-color <color>', 'Accent color')
    .option('--font <font>', 'Primary font')
    .action(async (opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.brandColor) updates.brandColor = opts.brandColor;
      if (opts.accentColor) updates.accentColor = opts.accentColor;
      if (opts.font) updates.font = opts.font;
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateBrandingSettings(updates);
        spinner.succeed('Branding updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Email ---
  const email = settings.command('email').description('Email settings');
  email
    .command('get')
    .description('View email settings')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getEmailSettings();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  email
    .command('update')
    .description('Update email settings')
    .option('--smtp-host <host>', 'SMTP host')
    .option('--smtp-port <port>', 'SMTP port')
    .option('--smtp-user <user>', 'SMTP username')
    .option('--smtp-pass <pass>', 'SMTP password')
    .option('--from-email <email>', 'Sender email')
    .option('--from-name <name>', 'Sender name')
    .action(async (opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.smtpHost) updates.smtpHost = opts.smtpHost;
      if (opts.smtpPort) updates.smtpPort = parseInt(opts.smtpPort);
      if (opts.smtpUser) updates.smtpUser = opts.smtpUser;
      if (opts.smtpPass) updates.smtpPass = opts.smtpPass;
      if (opts.fromEmail) updates.fromEmail = opts.fromEmail;
      if (opts.fromName) updates.fromName = opts.fromName;
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateEmailSettings(updates);
        spinner.succeed('Email settings updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Storage ---
  const storage = settings.command('storage').description('Storage settings');
  storage
    .command('get')
    .description('View storage settings')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getStorageSettings();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  storage
    .command('update')
    .description('Update storage settings')
    .option('--provider <provider>', 'Storage provider (s3|gcs|azure|local)')
    .option('--bucket <bucket>', 'Bucket name')
    .option('--region <region>', 'Region')
    .action(async (opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.provider) updates.provider = opts.provider;
      if (opts.bucket) updates.bucket = opts.bucket;
      if (opts.region) updates.region = opts.region;
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateStorageSettings(updates);
        spinner.succeed('Storage settings updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- CDN ---
  const cdn = settings.command('cdn').description('CDN settings');
  cdn
    .command('get')
    .description('View CDN settings')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getCDNSettings();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  cdn
    .command('update')
    .description('Update CDN settings')
    .option('--url <url>', 'CDN URL')
    .option('--enabled <bool>', 'Enable CDN (true|false)')
    .action(async (opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.url) updates.url = opts.url;
      if (opts.enabled) updates.enabled = opts.enabled === 'true';
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateCDNSettings(updates);
        spinner.succeed('CDN settings updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  cdn
    .command('purge')
    .description('Purge CDN cache')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Purge entire CDN cache?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Purging CDN cache...').start();
      try {
        const client = getClient();
        await client.updateCDNSettings({ purge: true });
        spinner.succeed('CDN cache purged!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Domains ---
  const domains = settings.command('domains').description('Domain management');
  domains
    .command('list')
    .description('List all domains')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listDomains();
        spinner.stop();
        output(data, 'Domains');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  domains
    .command('add')
    .description('Add a domain')
    .option('-d, --domain <domain>', 'Domain name')
    .action(async (opts) => {
      requireAuth();
      const domain = opts.domain || await input({ message: 'Domain name:' });
      const spinner = ora('Adding domain...').start();
      try {
        const client = getClient();
        await client.createDomain({ domain });
        spinner.succeed(`Domain "${domain}" added!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  domains
    .command('delete <id>')
    .description('Remove a domain')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Remove this domain?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Removing...').start();
      try {
        const client = getClient();
        await client.deleteDomain(id);
        spinner.succeed('Domain removed!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- API Keys ---
  const apis = settings.command('api-keys').description('API key management');
  apis
    .command('list')
    .description('List all API keys')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listApiKeys();
        spinner.stop();
        output(data, 'API Keys');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  apis
    .command('create')
    .description('Create a new API key')
    .option('-n, --name <name>', 'Key name')
    .option('--scopes <scopes>', 'Comma-separated scopes')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Key name:' });
      const scopes = opts.scopes || await input({ message: 'Scopes (comma-separated):', default: '*' });
      const spinner = ora('Creating key...').start();
      try {
        const client = getClient();
        const result = await client.createApiKey({ name, scopes: scopes.split(',').map((s: string) => s.trim()) });
        spinner.succeed('API key created!');
        printKeyValueTable(result);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  apis
    .command('delete <id>')
    .description('Revoke an API key')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Revoke this API key?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Revoking...').start();
      try {
        const client = getClient();
        await client.deleteApiKey(id);
        spinner.succeed('API key revoked!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- OAuth ---
  const oauth = settings.command('oauth').description('OAuth provider settings');
  oauth
    .command('update <provider>')
    .description('Update OAuth provider config')
    .option('--client-id <id>', 'Client ID')
    .option('--client-secret <secret>', 'Client secret')
    .option('--enabled <bool>', 'Enable provider (true|false)')
    .action(async (provider, opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.clientId) updates.clientId = opts.clientId;
      if (opts.clientSecret) updates.clientSecret = opts.clientSecret;
      if (opts.enabled) updates.enabled = opts.enabled === 'true';
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateOAuth(provider, updates);
        spinner.succeed(`OAuth "${provider}" updated!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Maintenance ---
  const maintenance = settings.command('maintenance').description('Maintenance & system operations');
  maintenance
    .command('status')
    .description('View maintenance status')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getMaintenance();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  maintenance
    .command('clear-cache')
    .description('Clear application cache')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Clear all cache?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Clearing cache...').start();
      try {
        const client = getClient();
        await client.clearCache();
        spinner.succeed('Cache cleared!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  maintenance
    .command('optimize-db')
    .description('Optimize the database')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Optimize database?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Optimizing database...').start();
      try {
        const client = getClient();
        await client.optimizeDB();
        spinner.succeed('Database optimized!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
