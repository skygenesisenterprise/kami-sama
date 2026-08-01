import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerDiscoverCommands(program: Command): void {
  const discover = program.command('discover').description('Content discovery & recommendations');

  discover
    .command('home')
    .description('View discover home feed')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getDiscover();
        spinner.stop();
        output(data, 'Discover Feed');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  discover
    .command('sections')
    .description('View discover sections')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getDiscoverSections();
        spinner.stop();
        output(data, 'Discover Sections');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  discover
    .command('content <anilistId>')
    .description('View content details from AniList')
    .action(async (anilistId) => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getContentDetail(anilistId);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  discover
    .command('recommendations')
    .description('View personalized recommendations')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getRecommendations();
        spinner.stop();
        output(data, 'Recommendations');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
