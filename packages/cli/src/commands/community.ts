import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerCommunityCommands(program: Command): void {
  const community = program.command('community').description('Community features: reviews, comments, watchlists');

  // --- Reviews ---
  const reviews = community.command('reviews').description('Manage reviews');

  reviews
    .command('list')
    .description('List all reviews')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching reviews...').start();
      try {
        const client = getClient();
        const data = await client.listReviews();
        spinner.stop();
        output(data, 'Reviews');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  reviews
    .command('create')
    .description('Create a review')
    .option('--anime <id>', 'Anime ID')
    .option('--rating <n>', 'Rating (1-10)')
    .option('--body <text>', 'Review body')
    .action(async (opts) => {
      requireAuth();
      const animeId = opts.anime || await input({ message: 'Anime ID:' });
      const rating = opts.rating || await input({ message: 'Rating (1-10):' });
      const body = opts.body || await input({ message: 'Review text:' });
      const spinner = ora('Creating review...').start();
      try {
        const client = getClient();
        await client.createReview({ animeId, rating: parseInt(rating), body });
        spinner.succeed('Review created!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Comments ---
  const comments = community.command('comments').description('Manage comments');

  comments
    .command('list <reviewId>')
    .description('List comments on a review')
    .action(async (reviewId) => {
      requireAuth();
      const spinner = ora('Fetching comments...').start();
      try {
        const client = getClient();
        const data = await client.listComments(reviewId);
        spinner.stop();
        output(data, 'Comments');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  comments
    .command('create <reviewId>')
    .description('Comment on a review')
    .option('--body <text>', 'Comment text')
    .action(async (reviewId, opts) => {
      requireAuth();
      const body = opts.body || await input({ message: 'Comment:' });
      const spinner = ora('Posting comment...').start();
      try {
        const client = getClient();
        await client.createComment(reviewId, { body });
        spinner.succeed('Comment posted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Watchlists ---
  const watchlists = community.command('watchlists').description('Manage watchlists');

  watchlists
    .command('list')
    .description('List all watchlists')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching watchlists...').start();
      try {
        const client = getClient();
        const data = await client.listWatchlists();
        spinner.stop();
        output(data, 'Watchlists');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  watchlists
    .command('create')
    .description('Create a watchlist')
    .option('-n, --name <name>', 'Watchlist name')
    .option('-d, --description <desc>', 'Description')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Watchlist name:' });
      const description = opts.description || await input({ message: 'Description (optional):', default: '' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createWatchlist({ name, description });
        spinner.succeed(`Watchlist "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Reports ---
  const reports = community.command('reports').description('Manage reports');

  reports
    .command('list')
    .description('List all reports')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching reports...').start();
      try {
        const client = getClient();
        const data = await client.listReports();
        spinner.stop();
        output(data, 'Reports');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  reports
    .command('create')
    .description('Create a report')
    .option('--target <type>', 'Target type (review|comment|user)')
    .option('--target-id <id>', 'Target ID')
    .option('--reason <reason>', 'Reason')
    .action(async (opts) => {
      requireAuth();
      const targetType = opts.target || await input({ message: 'Target type (review|comment|user):' });
      const targetId = opts.targetId || await input({ message: 'Target ID:' });
      const reason = opts.reason || await input({ message: 'Reason:' });
      const spinner = ora('Submitting report...').start();
      try {
        const client = getClient();
        await client.createReport({ targetType, targetId, reason });
        spinner.succeed('Report submitted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
