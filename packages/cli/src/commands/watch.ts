import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerWatchCommands(program: Command): void {
  const watch = program.command('watch').description('Watch progress & history');

  watch
    .command('continue')
    .description('Continue watching (shows in-progress episodes)')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.continueWatching();
        spinner.stop();
        output(data, 'Continue Watching');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  watch
    .command('history')
    .description('View watch history')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listWatchHistory();
        spinner.stop();
        output(data, 'Watch History');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  watch
    .command('progress <episodeId>')
    .description('View progress for an episode')
    .action(async (episodeId) => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getWatchProgress(episodeId);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  watch
    .command('update-progress <episodeId>')
    .description('Update watch progress for an episode')
    .option('--position <seconds>', 'Current position in seconds')
    .option('--completed <bool>', 'Mark as completed (true|false)')
    .action(async (episodeId, opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.position) updates.position = parseInt(opts.position);
      if (opts.completed) updates.completed = opts.completed === 'true';
      if (Object.keys(updates).length === 0) {
        error('Specify --position or --completed.');
        process.exit(1);
      }
      const spinner = ora('Updating progress...').start();
      try {
        const client = getClient();
        await client.updateWatchProgress(episodeId, updates);
        spinner.succeed('Progress updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
