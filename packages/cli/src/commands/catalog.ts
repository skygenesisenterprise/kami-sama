import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable, truncate, statusColor } from '../ui/format.js';

export function registerCatalogCommands(program: Command): void {
  const catalog = program.command('catalog').description('Manage your media catalog');

  // --- Anime ---
  const anime = catalog.command('anime').description('Manage anime entries');

  anime
    .command('list')
    .description('List all anime')
    .option('-p, --page <n>', 'Page number', '1')
    .option('-l, --limit <n>', 'Items per page', '20')
    .option('--search <query>', 'Search filter')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Fetching anime...').start();
      try {
        const client = getClient();
        const data = await client.listAnime({ page: opts.page, limit: opts.limit, search: opts.search });
        spinner.stop();
        output(data, 'Anime List');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anime
    .command('get <id>')
    .description('Get anime details')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.getAnime(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anime
    .command('create')
    .description('Create a new anime entry')
    .option('-t, --title <title>', 'Anime title')
    .option('--slug <slug>', 'URL slug')
    .action(async (opts) => {
      requireAuth();
      const title = opts.title || await input({ message: 'Title:' });
      const slug = opts.slug || await input({ message: 'Slug:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        const data = await client.createAnime({ title, slug });
        spinner.succeed(`Anime "${title}" created!`);
        output(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anime
    .command('update <id>')
    .description('Update an anime entry')
    .option('-t, --title <title>', 'New title')
    .option('--slug <slug>', 'New slug')
    .option('--status <status>', 'New status')
    .action(async (id, opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.title) updates.title = opts.title;
      if (opts.slug) updates.slug = opts.slug;
      if (opts.status) updates.status = opts.status;
      if (Object.keys(updates).length === 0) {
        error('No fields to update. Use --title, --slug, or --status.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.updateAnime(id, updates);
        spinner.succeed('Anime updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  anime
    .command('delete <id>')
    .description('Delete an anime entry')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete anime ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteAnime(id);
        spinner.succeed('Anime deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Genres ---
  const genres = catalog.command('genres').description('Manage genres');

  genres
    .command('list')
    .description('List all genres')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listGenres();
        spinner.stop();
        output(data, 'Genres');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  genres
    .command('create')
    .description('Create a genre')
    .option('-n, --name <name>', 'Genre name')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Genre name:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createGenre({ name });
        spinner.succeed(`Genre "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  genres
    .command('delete <id>')
    .description('Delete a genre')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete genre ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteGenre(id);
        spinner.succeed('Genre deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Studios ---
  const studios = catalog.command('studios').description('Manage studios');

  studios
    .command('list')
    .description('List all studios')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listStudios();
        spinner.stop();
        output(data, 'Studios');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  studios
    .command('create')
    .description('Create a studio')
    .option('-n, --name <name>', 'Studio name')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Studio name:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createStudio({ name });
        spinner.succeed(`Studio "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  studios
    .command('delete <id>')
    .description('Delete a studio')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete studio ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteStudio(id);
        spinner.succeed('Studio deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Characters ---
  const characters = catalog.command('characters').description('Manage characters');

  characters
    .command('list')
    .description('List all characters')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listCharacters();
        spinner.stop();
        output(data, 'Characters');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  characters
    .command('create')
    .description('Create a character')
    .option('-n, --name <name>', 'Character name')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Character name:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createCharacter({ name });
        spinner.succeed(`Character "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  characters
    .command('delete <id>')
    .description('Delete a character')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete character ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteCharacter(id);
        spinner.succeed('Character deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Episodes ---
  const episodes = catalog.command('episodes').description('Manage episodes');

  episodes
    .command('list <animeId>')
    .description('List episodes for an anime')
    .action(async (animeId) => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listEpisodes(animeId);
        spinner.stop();
        output(data, 'Episodes');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  episodes
    .command('create <animeId>')
    .description('Create an episode')
    .option('-n, --number <n>', 'Episode number')
    .option('-t, --title <title>', 'Episode title')
    .action(async (animeId, opts) => {
      requireAuth();
      const number = opts.number || await input({ message: 'Episode number:' });
      const title = opts.title || await input({ message: 'Title:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createEpisode(animeId, { number: parseInt(number), title });
        spinner.succeed('Episode created!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  episodes
    .command('delete <animeId> <episodeId>')
    .description('Delete an episode')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (animeId, episodeId, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Delete this episode?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteEpisode(animeId, episodeId);
        spinner.succeed('Episode deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Collections ---
  const collections = catalog.command('collections').description('Manage collections');

  collections
    .command('list')
    .description('List all collections')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listCollections();
        spinner.stop();
        output(data, 'Collections');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  collections
    .command('create')
    .description('Create a collection')
    .option('-n, --name <name>', 'Collection name')
    .option('-d, --description <desc>', 'Description')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Collection name:' });
      const description = opts.description || await input({ message: 'Description (optional):', default: '' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createCollection({ name, description });
        spinner.succeed(`Collection "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  collections
    .command('delete <id>')
    .description('Delete a collection')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete collection ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteCollection(id);
        spinner.succeed('Collection deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Tags ---
  const tags = catalog.command('tags').description('Manage tags');

  tags
    .command('list')
    .description('List all tags')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listTags();
        spinner.stop();
        output(data, 'Tags');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  tags
    .command('create')
    .description('Create a tag')
    .option('-n, --name <name>', 'Tag name')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Tag name:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createTag({ name });
        spinner.succeed(`Tag "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  tags
    .command('delete <id>')
    .description('Delete a tag')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete tag ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteTag(id);
        spinner.succeed('Tag deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Categories ---
  const categories = catalog.command('categories').description('Manage categories');

  categories
    .command('list')
    .description('List all categories')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.listCategories();
        spinner.stop();
        output(data, 'Categories');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  categories
    .command('create')
    .description('Create a category')
    .option('-n, --name <name>', 'Category name')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Category name:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createCategory({ name });
        spinner.succeed(`Category "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  categories
    .command('delete <id>')
    .description('Delete a category')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete category ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteCategory(id);
        spinner.succeed('Category deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
