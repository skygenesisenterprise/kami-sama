import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable, statusColor } from '../ui/format.js';

export function registerMediaCommands(program: Command): void {
  const media = program.command('media').description('Manage media files');

  media
    .command('list')
    .description('List all media')
    .option('-p, --page <n>', 'Page number', '1')
    .option('-l, --limit <n>', 'Items per page', '20')
    .option('--type <type>', 'Filter by type (video|audio|image)')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Fetching media...').start();
      try {
        const client = getClient();
        const data = await client.listMedia({ page: opts.page, limit: opts.limit, type: opts.type });
        spinner.stop();
        output(data, 'Media Files');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  media
    .command('get <id>')
    .description('Get media details')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.getMedia(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  media
    .command('delete <id>')
    .description('Delete a media file')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete media ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteMedia(id);
        spinner.succeed('Media deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Encoding Jobs ---
  const encoding = media.command('encoding').description('Manage encoding jobs');

  encoding
    .command('list')
    .description('List encoding jobs')
    .option('-p, --page <n>', 'Page number', '1')
    .option('-l, --limit <n>', 'Items per page', '20')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Fetching encoding jobs...').start();
      try {
        const client = getClient();
        const data = await client.listEncodingJobs();
        spinner.stop();
        output(data, 'Encoding Jobs');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  encoding
    .command('get <id>')
    .description('Get encoding job details')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.getEncodingJob(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  encoding
    .command('retry <id>')
    .description('Retry a failed encoding job')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Retrying...').start();
      try {
        const client = getClient();
        await client.retryEncodingJob(id);
        spinner.succeed('Job retry queued!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  encoding
    .command('cancel <id>')
    .description('Cancel an encoding job')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Cancel this encoding job?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Cancelling...').start();
      try {
        const client = getClient();
        await client.cancelEncodingJob(id);
        spinner.succeed('Job cancelled!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
