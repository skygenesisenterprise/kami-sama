import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerIntegrationCommands(program: Command): void {
  const integrations = program.command('integrations').description('External integrations (AniList, Plex)');

  // --- AniList ---
  const anilist = integrations.command('anilist').description('AniList integration');

  anilist
    .command('search')
    .description('Search AniList')
    .argument('[query]', 'Search query')
    .action(async (query) => {
      requireAuth();
      const q = query || await input({ message: 'Search query:' });
      const spinner = ora('Searching AniList...').start();
      try {
        const client = getClient();
        const data = await client.anilistSearch(q);
        spinner.stop();
        output(data, `AniList: "${q}"`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anilist
    .command('trending')
    .description('View trending anime on AniList')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading trending...').start();
      try {
        const client = getClient();
        const data = await client.anilistTrending();
        spinner.stop();
        output(data, 'AniList Trending');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anilist
    .command('popular')
    .description('View popular anime on AniList')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading popular...').start();
      try {
        const client = getClient();
        const data = await client.anilistPopular();
        spinner.stop();
        output(data, 'AniList Popular');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anilist
    .command('import <anilistId>')
    .description('Import media from AniList')
    .action(async (anilistId) => {
      requireAuth();
      const spinner = ora('Importing from AniList...').start();
      try {
        const client = getClient();
        await client.anilistImport(anilistId);
        spinner.succeed('Imported from AniList!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Plex ---
  const plex = integrations.command('plex').description('Plex integration');

  plex
    .command('health')
    .description('Check Plex server health')
    .action(async () => {
      requireAuth();
      const spinner = ora('Checking Plex...').start();
      try {
        const client = getClient();
        const data = await client.plexHealth();
        spinner.stop();
        heading('Plex Health');
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  plex
    .command('libraries')
    .description('List Plex libraries')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.plexLibraries();
        spinner.stop();
        output(data, 'Plex Libraries');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  plex
    .command('search')
    .description('Search Plex')
    .argument('[query]', 'Search query')
    .action(async (query) => {
      requireAuth();
      const q = query || await input({ message: 'Search query:' });
      const spinner = ora('Searching Plex...').start();
      try {
        const client = getClient();
        const data = await client.plexSearch(q);
        spinner.stop();
        output(data, `Plex: "${q}"`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  plex
    .command('import <ratingKey>')
    .description('Import item from Plex')
    .action(async (ratingKey) => {
      requireAuth();
      const spinner = ora('Importing from Plex...').start();
      try {
        const client = getClient();
        await client.plexImport(ratingKey);
        spinner.succeed('Imported from Plex!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
