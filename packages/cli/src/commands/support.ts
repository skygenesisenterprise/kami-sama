import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api/client.js';
import { requireAuth } from '../config/index.js';
import { success, error, heading, output, printTable, printKeyValueTable } from '../ui/format.js';

export function registerSupportCommands(program: Command): void {
  const support = program.command('support').description('Support tickets & FAQ');

  // --- Tickets ---
  const tickets = support.command('tickets').description('Manage support tickets');

  tickets
    .command('list')
    .description('List all tickets')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listTickets();
        spinner.stop();
        output(data, 'Support Tickets');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  tickets
    .command('create')
    .description('Create a support ticket')
    .option('-s, --subject <subject>', 'Subject')
    .option('-b, --body <body>', 'Message body')
    .option('--priority <priority>', 'Priority (low|medium|high|critical)')
    .action(async (opts) => {
      requireAuth();
      const subject = opts.subject || await input({ message: 'Subject:' });
      const body = opts.body || await input({ message: 'Message:' });
      const priority = opts.priority || await input({ message: 'Priority (low|medium|high|critical):', default: 'medium' });
      const spinner = ora('Creating ticket...').start();
      try {
        const client = getClient();
        const ticket = await client.createTicket({ subject, body, priority });
        spinner.succeed('Ticket created!');
        printKeyValueTable(ticket);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  tickets
    .command('get <id>')
    .description('View a ticket')
    .action(async (id) => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.getTicket(id);
        spinner.stop();
        printKeyValueTable(data);
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  tickets
    .command('reply <id>')
    .description('Reply to a ticket')
    .option('-b, --body <body>', 'Reply body')
    .action(async (id, opts) => {
      requireAuth();
      const body = opts.body || await input({ message: 'Reply:' });
      const spinner = ora('Sending reply...').start();
      try {
        const client = getClient();
        await client.replyToTicket(id, { body });
        spinner.succeed('Reply sent!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  tickets
    .command('close <id>')
    .description('Close a ticket')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Close this ticket?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Closing...').start();
      try {
        const client = getClient();
        await client.closeTicket(id);
        spinner.succeed('Ticket closed!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  // --- FAQ ---
  const faq = support.command('faq').description('FAQ management');

  faq
    .command('list')
    .description('List all FAQ entries')
    .action(async () => {
      requireAuth();
      const spinner = ora('Loading...').start();
      try {
        const client = getClient();
        const data = await client.listFaq();
        spinner.stop();
        output(data, 'FAQ');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  faq
    .command('create')
    .description('Create a FAQ entry')
    .option('-q, --question <q>', 'Question')
    .option('-a, --answer <a>', 'Answer')
    .action(async (opts) => {
      requireAuth();
      const question = opts.question || await input({ message: 'Question:' });
      const answer = opts.answer || await input({ message: 'Answer:' });
      const spinner = ora('Creating...').start();
      try {
        const client = getClient();
        await client.createFaq({ question, answer });
        spinner.succeed('FAQ entry created!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });

  faq
    .command('delete <id>')
    .description('Delete a FAQ entry')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id, opts) => {
      requireAuth();
      if (!opts.yes) {
        const answer = await confirm({ message: 'Delete this FAQ entry?', default: false });
        if (!answer) { console.log('Cancelled.'); return; }
      }
      const spinner = ora('Deleting...').start();
      try {
        const client = getClient();
        await client.deleteFaq(id);
        spinner.succeed('FAQ entry deleted!');
      } catch (err: any) { spinner.fail(err.message); process.exit(1); }
    });
}
