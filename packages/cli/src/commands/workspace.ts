import { Command } from 'commander';
import { input, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth, setWorkspaceId, getWorkspaceId } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerWorkspaceCommands(program: Command): void {
  const workspace = program.command('workspace').description('Workspace management');

  workspace
    .command('list')
    .description('List all workspaces')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading workspaces...').start();
      try {
        const client = getClient();
        const data = await client.listWorkspaces();
        spinner.stop();
        output(data, 'Workspaces');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  workspace
    .command('current')
    .description('Show current workspace')
    .action(() => {
      const wsId = getWorkspaceId();
      if (wsId) {
        heading('Current Workspace');
        console.log(`  ID: ${wsId}`);
      } else {
        info('No workspace selected. Use `kami workspace switch` to select one.');
      }
    });

  workspace
    .command('switch')
    .description('Switch to a workspace')
    .argument('[id]', 'Workspace ID')
    .action(async (id) => {
      requireAuth();
      let wsId = id;
      if (!wsId) {
        const spinner = ora('Loading workspaces...').start();
        try {
          const client = getClient();
          const workspaces = await client.listWorkspaces() as any[];
          spinner.stop();
          if (workspaces.length === 0) {
            error('No workspaces found.');
            return;
          }
          wsId = await select({
            message: 'Select workspace:',
            choices: workspaces.map((ws: any) => ({
              name: `${ws.name || ws.id} (${ws.id})`,
              value: ws.id,
            })),
          });
        } catch (err: any) { spinner.fail(err.message); process.exit(1); }
      }
      setWorkspaceId(wsId);
      success(`Switched to workspace ${wsId}`);
    });

  workspace
    .command('create')
    .description('Create a workspace')
    .option('-n, --name <name>', 'Workspace name')
    .option('-s, --slug <slug>', 'URL slug')
    .option('-d, --description <desc>', 'Description')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Workspace name:' });
      const slug = opts.slug || await input({ message: 'Slug:' });
      const description = opts.description || await input({ message: 'Description:', default: '' });
      const spinner = ora('Creating workspace...').start();
      try {
        const client = getClient();
        const ws = await client.createWorkspace({ name, slug, description });
        spinner.succeed(`Workspace "${name}" created!`);
        printKeyValueTable(ws);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  workspace
    .command('delete <id>')
    .description('Delete a workspace')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Permanently delete workspace ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting workspace...').start();
      try {
        const client = getClient();
        await client.deleteWorkspace(id);
        spinner.succeed('Workspace deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}

function info(message: string): void {
  console.log(chalk.blue('ℹ') + ' ' + message);
}
