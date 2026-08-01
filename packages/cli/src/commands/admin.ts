import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerAdminCommands(program: Command): void {
  const admin = program.command('admin').description('Administrative operations');

  // --- Users ---
  const users = admin.command('users').description('Manage users');
  users
    .command('list')
    .description('List all users')
    .option('-p, --page <n>', 'Page number', '1')
    .option('-l, --limit <n>', 'Items per page', '20')
    .option('--search <query>', 'Search filter')
    .action(async (opts) => {
      requireAuth();
      const spinner = ora('Fetching users...').start();
      try {
        const client = getClient();
        const data = await client.adminListUsers({ page: opts.page, limit: opts.limit, search: opts.search });
        spinner.stop();
        output(data, 'Users');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  users
    .command('get <id>')
    .description('Get user details')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Fetching...').start();
      try {
        const client = getClient();
        const data = await client.adminGetUser(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  users
    .command('update <id>')
    .description('Update a user')
    .option('--email <email>', 'New email')
    .option('--name <name>', 'New display name')
    .option('--status <status>', 'New status')
    .action(async (id, opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.email) updates.email = opts.email;
      if (opts.name) updates.displayName = opts.name;
      if (opts.status) updates.status = opts.status;
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.adminUpdateUser(id, updates);
        spinner.succeed('User updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  users
    .command('disable <id>')
    .description('Disable a user')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Disable user ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Disabling...').start();
      try {
        const client = getClient();
        await client.adminDisableUser(id);
        spinner.succeed('User disabled!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  users
    .command('enable <id>')
    .description('Enable a user')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Enabling...').start();
      try {
        const client = getClient();
        await client.adminEnableUser(id);
        spinner.succeed('User enabled!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  users
    .command('delete <id>')
    .description('Delete a user')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Permanently delete user ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.adminDeleteUser(id);
        spinner.succeed('User deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Roles ---
  const roles = admin.command('roles').description('Manage roles');
  roles
    .command('list')
    .description('List all roles')
    .action(async () => {
      requireAuth();
      const spinner = ora('Fetching roles...').start();
      try {
        const client = getClient();
        const data = await client.adminListRoles();
        spinner.stop();
        output(data, 'Roles');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  roles
    .command('create')
    .description('Create a role')
    .option('-n, --name <name>', 'Role name')
    .option('-d, --description <desc>', 'Description')
    .action(async (opts) => {
      requireAuth();
      const name = opts.name || await input({ message: 'Role name:' });
      const description = opts.description || await input({ message: 'Description:', default: '' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.adminCreateRole({ name, description });
        spinner.succeed(`Role "${name}" created!`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  roles
    .command('update <id>')
    .description('Update a role')
    .option('-n, --name <name>', 'New name')
    .option('-d, --description <desc>', 'New description')
    .action(async (id, opts) => {
      requireAuth();
      const updates: Record<string, unknown> = {};
      if (opts.name) updates.name = opts.name;
      if (opts.description) updates.description = opts.description;
      if (Object.keys(updates).length === 0) {
        error('No fields to update.');
        process.exit(1);
      }
      const spinner = ora('Updating...').start();
      try {
        const client = getClient();
        await client.adminUpdateRole(id, updates);
        spinner.succeed('Role updated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  roles
    .command('delete <id>')
    .description('Delete a role')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: `Delete role ${id}?`, default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.adminDeleteRole(id);
        spinner.succeed('Role deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  roles
    .command('assign <roleId>')
    .description('Assign role to user')
    .option('--user <userId>', 'User ID')
    .action(async (roleId, opts) => {
      requireAuth();
      const userId = opts.user || await input({ message: 'User ID:' });
      const spinner = ora('Assigning role...').start();
      try {
        const client = getClient();
        await client.adminAssignRole(roleId, { userId });
        spinner.succeed('Role assigned!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Permissions ---
  const perms = admin.command('permissions').description('Manage permissions');
  perms
    .command('matrix')
    .description('Show permission matrix')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.adminGetPermissionMatrix();
        spinner.stop();
        output(data, 'Permission Matrix');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- Moderation ---
  const moderation = admin.command('moderation').description('Content moderation');
  moderation
    .command('queue')
    .description('View moderation queue')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.adminListModerations();
        spinner.stop();
        output(data, 'Moderation Queue');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  moderation
    .command('approve <id>')
    .description('Approve a moderation item')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Approving...').start();
      try {
        const client = getClient();
        await client.adminModerateItem(id, 'approve');
        spinner.succeed('Item approved!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  moderation
    .command('reject <id>')
    .description('Reject a moderation item')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Rejecting...').start();
      try {
        const client = getClient();
        await client.adminModerateItem(id, 'reject');
        spinner.succeed('Item rejected!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  moderation
    .command('escalate <id>')
    .description('Escalate a moderation item')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Escalating...').start();
      try {
        const client = getClient();
        await client.adminModerateItem(id, 'escalate');
        spinner.succeed('Item escalated!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
