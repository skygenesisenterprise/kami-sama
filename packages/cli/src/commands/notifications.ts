import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerNotificationCommands(program: Command): void {
  const notifications = program.command('notifications').description('Notification management');

  notifications
    .command('list')
    .description('List notifications')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listNotifications();
        spinner.stop();
        output(data, 'Notifications');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  notifications
    .command('unread')
    .description('Show unread notification count')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getUnreadCount();
        spinner.stop();
        heading('Unread Notifications');
        console.log(`  Count: ${data.count}`);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  notifications
    .command('read <id>')
    .description('Mark a notification as read')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Marking as read...').start();
      try {
        const client = getClient();
        await client.markNotificationRead(id);
        spinner.succeed('Marked as read!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  notifications
    .command('read-all')
    .description('Mark all notifications as read')
    .action(async () => {
      requireAuth();
      const spinner = ora('Marking all as read...').start();
      try {
        const client = getClient();
        await client.markAllNotificationsRead();
        spinner.succeed('All notifications marked as read!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
