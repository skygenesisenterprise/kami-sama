import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable, statusColor } from '../ui/format.js';

export function registerSystemCommands(program: Command): void {
  const system = program.command('system').description('System monitoring & operations');

  // --- Health ---
  const health = system.command('health').description('Health checks');
  health
    .command('status')
    .description('Check system health')
    .action(async () => {
      requireAuth();
      const spinner = ora('Checking health...').start();
      try {
        const client = getClient();
        const data = await client.getSystemHealth();
        spinner.stop();
        heading('System Health');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  health
    .command('uptime')
    .description('Check system uptime')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getSystemUptime();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Logs ---
  const logs = system.command('logs').description('System logs');
  logs
    .command('list')
    .description('List recent logs')
    .option('-l, --limit <n>', 'Number of entries', '50')
    .option('--level <level>', 'Filter by level (info|warn|error)')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Fetching logs...').start();
      try {
        const client = getClient();
        const data = await client.listSystemLogs({ limit: opts.limit, level: opts.level });
        spinner.stop();
        output(data, 'System Logs');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  logs
    .command('search')
    .description('Search logs')
    .argument('[query]', 'Search query')
    .action(async (query) => {
      requireAuth();
      const q = query || await input({ message: 'Search query:' });
      const spinner = ora('Searching...').start();
      try {
        const client = getClient();
        const data = await client.searchSystemLogs(q);
        spinner.stop();
        output(data, `Log search: "${q}"`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Queue ---
  const queue = system.command('queue').description('Background job queue');
  queue
    .command('status')
    .description('View queue status')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getQueueStatus();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  queue
    .command('jobs')
    .description('List queued jobs')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listQueueJobs();
        spinner.stop();
        output(data, 'Queue Jobs');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  queue
    .command('retry <id>')
    .description('Retry a failed job')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Retrying...').start();
      try {
        const client = getClient();
        await client.retryQueueJob(id);
        spinner.succeed('Job retry queued!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  queue
    .command('cancel <id>')
    .description('Cancel a queued job')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Cancel this job?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Cancelling...').start();
      try {
        const client = getClient();
        await client.cancelQueueJob(id);
        spinner.succeed('Job cancelled!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  queue
    .command('flush')
    .description('Flush the entire queue')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Flush entire queue?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Flushing queue...').start();
      try {
        const client = getClient();
        await client.flushQueue();
        spinner.succeed('Queue flushed!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Cache ---
  const cache = system.command('cache').description('Cache management');
  cache
    .command('status')
    .description('View cache status')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getCacheStatus();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  cache
    .command('flush')
    .description('Flush entire cache')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Flush entire cache?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Flushing cache...').start();
      try {
        const client = getClient();
        await client.flushCacheSystem();
        spinner.succeed('Cache flushed!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  cache
    .command('keys')
    .description('List cache keys')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listCacheKeys();
        spinner.stop();
        output(data, 'Cache Keys');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  cache
    .command('delete <key>')
    .description('Delete a cache key')
    .action(async (key) => {
      requireAuth();
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteCacheKey(key);
        spinner.succeed('Cache key deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Search ---
  const search = system.command('search').description('Search engine management');
  search
    .command('status')
    .description('View search engine status')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getSearchStatus();
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  search
    .command('reindex')
    .description('Trigger full reindex')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Trigger full reindex?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Triggering reindex...').start();
      try {
        const client = getClient();
        await client.triggerReindex();
        spinner.succeed('Reindex triggered!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Background Jobs ---
  const bgJobs = system.command('jobs').description('Background job management');
  bgJobs
    .command('list')
    .description('List background jobs')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listBackgroundJobs();
        spinner.stop();
        output(data, 'Background Jobs');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  bgJobs
    .command('run <id>')
    .description('Manually run a background job')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Running job...').start();
      try {
        const client = getClient();
        await client.runBackgroundJob(id);
        spinner.succeed('Job started!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
