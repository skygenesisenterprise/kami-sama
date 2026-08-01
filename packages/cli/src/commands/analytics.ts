import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerAnalyticsCommands(program: Command): void {
  const analytics = program.command('analytics').description('Analytics & insights');

  analytics
    .command('overview')
    .description('View analytics overview')
    .option('--period <period>', 'Time period (7d|30d|90d|1y)', '30d')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Loading analytics...').start();
      try {
        const client = getClient();
        const data = await client.getAnalyticsOverview({ period: opts.period });
        spinner.stop();
        heading('Analytics Overview');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  analytics
    .command('watch-time')
    .description('View watch time statistics')
    .option('--period <period>', 'Time period (7d|30d|90d|1y)', '30d')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Loading watch time...').start();
      try {
        const client = getClient();
        const data = await client.getWatchTime({ period: opts.period });
        spinner.stop();
        heading('Watch Time Statistics');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  analytics
    .command('devices')
    .description('View device statistics')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getDevices();
        spinner.stop();
        heading('Device Statistics');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  analytics
    .command('popular')
    .description('View popular content')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getPopular();
        spinner.stop();
        output(data, 'Popular Content');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  analytics
    .command('geography')
    .description('View geographic distribution')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getGeography();
        spinner.stop();
        heading('Geographic Distribution');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  analytics
    .command('active-users')
    .description('View active user statistics')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getActiveUsers();
        spinner.stop();
        heading('Active Users');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
