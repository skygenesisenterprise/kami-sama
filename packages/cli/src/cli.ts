#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { registerAllCommands } from './commands/index.js';

const program = new Command();

program
  .name('kami')
  .description(`${chalk.bold.cyan('Kami Sama')} — Terminal dashboard for managing your media platform`)
  .version('1.0.0');

// Register all command modules
registerAllCommands(program);

// Global error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (err: any) {
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
    process.exit(0);
  }
  if (err.code === 'commander.missingArgument' || err.code === 'commander.missingMandatoryOptionValue') {
    console.error(chalk.red('Error:'), err.message);
    process.exit(1);
  }
  if (err.message) {
    console.error(chalk.red('Error:'), err.message);
  }
  process.exit(1);
}
