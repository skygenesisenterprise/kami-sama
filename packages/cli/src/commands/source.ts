import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable, statusColor } from '../ui/format.js';

export function registerSourceCommands(program: Command): void {
  const source = program.command('source').description('Manage the content media source (Plex, local); streaming is delegated to the media-server');

  // --- Libraries ---
  const libraries = source.command('libraries').description('Manage source libraries');

  libraries
    .command('list')
    .description('List all source libraries')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching libraries...').start();
      try {
        const client = getClient();
        const data = await client.listSourceLibraries();
        spinner.stop();
        output(data, 'Source Libraries');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  libraries
    .command('get <id>')
    .description('Get library details')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.getSourceLibrary(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  libraries
    .command('sync <id>')
    .description('Sync a library from its source')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Syncing library...').start();
      try {
        const client = getClient();
        await client.syncLibrary(id);
        spinner.succeed('Library sync initiated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  libraries
    .command('status <id>')
    .description('Get sync status for a library')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Fetching sync status...').start();
      try {
        const client = getClient();
        const data = await client.getSyncStatus(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Items ---
  const items = source.command('items').description('Manage source items');

  items
    .command('list')
    .description('List items from sources')
    .option('-l, --library <id>', 'Filter by library ID')
    .option('-p, --page <n>', 'Page number', '1')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Fetching items...').start();
      try {
        const client = getClient();
        const data = await client.listSourceItems({ libraryId: opts.library, page: opts.page });
        spinner.stop();
        output(data, 'Source Items');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  items
    .command('search')
    .description('Search items across all sources')
    .argument('[query]', 'Search query')
    .action(async (query) => {
      requireAuth();
      const q = query || await input({ message: 'Search query:' });
      const spinner = ora('Searching...').start();
      try {
        const client = getClient();
        const data = await client.searchSourceItems(q);
        spinner.stop();
        output(data, `Results for "${q}"`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
