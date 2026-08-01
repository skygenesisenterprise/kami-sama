import { Command } from 'commander';
import { registerAuthCommands } from './auth.js';
import { registerCatalogCommands } from './catalog.js';
import { registerMediaCommands } from './media.js';
import { registerSourceCommands } from './source.js';
import { registerCommunityCommands } from './community.js';
import { registerSettingsCommands } from './settings.js';
import { registerAdminCommands } from './admin.js';
import { registerSystemCommands } from './system.js';
import { registerAnalyticsCommands } from './analytics.js';
import { registerDiscoverCommands } from './discover.js';
import { registerIntegrationCommands } from './integrations.js';
import { registerSupportCommands } from './support.js';
import { registerWorkspaceCommands } from './workspace.js';
import { registerSearchCommands } from './search.js';
import { registerWatchCommands } from './watch.js';
import { registerScheduleCommands } from './schedule.js';
import { registerNotificationCommands } from './notifications.js';

export function registerAllCommands(program: Command): void {
  registerAuthCommands(program);
  registerCatalogCommands(program);
  registerMediaCommands(program);
  registerSourceCommands(program);
  registerCommunityCommands(program);
  registerSettingsCommands(program);
  registerAdminCommands(program);
  registerSystemCommands(program);
  registerAnalyticsCommands(program);
  registerDiscoverCommands(program);
  registerIntegrationCommands(program);
  registerSupportCommands(program);
  registerWorkspaceCommands(program);
  registerSearchCommands(program);
  registerWatchCommands(program);
  registerScheduleCommands(program);
  registerNotificationCommands(program);
}
