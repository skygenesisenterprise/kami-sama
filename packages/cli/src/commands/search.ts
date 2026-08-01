import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerSearchCommands(program: Command): void {
  const search = program.command('search').description('Search the platform');

  search
    .command('all')
    .description('Search across all content')
    .argument('[query]', 'Search query')
    .action(async (query) => {
      requireAuth();
      const q = query || await input({ message: 'Search query:' });
      const spinner = ora('Searching...').start();
      try {
        const client = getClient();
        const data = await client.search(q);
        spinner.stop();
        output(data, `Search: "${q}"`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  search
    .command('anime')
    .description('Search anime specifically')
    .argument('[query]', 'Search query')
    .action(async (query) => {
      requireAuth();
      const q = query || await input({ message: 'Search anime:' });
      const spinner = ora('Searching...').start();
      try {
        const client = getClient();
        const data = await client.searchAnime(q);
        spinner.stop();
        output(data, `Anime: "${q}"`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
