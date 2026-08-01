import chalk from 'chalk';
import Table from 'cli-table3';
import { getOutputFormat } from '../config/index.js';

export function success(message: string): void {
  console.log(chalk.green('✔') + ' ' + message);
}

export function error(message: string): void {
  console.error(chalk.red('✖') + ' ' + message);
}

export function warn(message: string): void {
  console.log(chalk.yellow('⚠') + ' ' + message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ') + ' ' + message);
}

export function heading(message: string): void {
  console.log(chalk.bold.underline(message));
}

export function dim(message: string): string {
  return chalk.dim(message);
}

export function bold(message: string): string {
  return chalk.bold(message);
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function output(data: unknown, label?: string): void {
  const format = getOutputFormat();
  if (label) heading(label);
  if (format === 'json') {
    console.log(formatJson(data));
  } else if (Array.isArray(data)) {
    printTable(data);
  } else if (typeof data === 'object' && data !== null) {
    printKeyValueTable(data as Record<string, unknown>);
  } else {
    console.log(String(data));
  }
}

export function printTable(rows: Record<string, unknown>[], columns?: string[]): void {
  if (rows.length === 0) {
    info('No data found.');
    return;
  }

  const keys = columns ?? Object.keys(rows[0]!);

  const table = new Table({
    head: keys.map((k) => chalk.cyan(k)),
    style: { head: ['cyan'] },
    wordWrap: true,
    colWidths: keys.map(() => null),
  });

  for (const row of rows) {
    table.push(keys.map((k) => formatCellValue(row[k])));
  }

  console.log(table.toString());
}

export function printKeyValueTable(data: Record<string, unknown>): void {
  const table = new Table({
    style: { head: ['cyan'] },
    colWidths: [25, 60],
    wordWrap: true,
  });

  for (const [key, value] of Object.entries(data)) {
    table.push({ [chalk.cyan(key)]: formatCellValue(value) });
  }

  console.log(table.toString());
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return chalk.dim('—');
  if (typeof value === 'boolean') return value ? chalk.green('yes') : chalk.red('no');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active': case 'healthy': case 'success': case 'completed': case 'approved':
      return chalk.green(status);
    case 'pending': case 'processing': case 'syncing': case 'in_progress':
      return chalk.yellow(status);
    case 'error': case 'failed': case 'rejected': case 'disabled': case 'unhealthy':
      return chalk.red(status);
    default:
      return chalk.white(status);
  }
}
