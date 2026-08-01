import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerScheduleCommands(program: Command): void {
  const schedule = program.command('schedule').description('Scheduling & releases');

  schedule
    .command('simulcasts')
    .description('List simulcast schedule')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listSimulcasts();
        spinner.stop();
        output(data, 'Simulcast Schedule');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  schedule
    .command('upcoming')
    .description('List upcoming releases')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listUpcomingReleases();
        spinner.stop();
        output(data, 'Upcoming Releases');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  schedule
    .command('releases')
    .description('List all releases')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listReleases();
        spinner.stop();
        output(data, 'Releases');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
