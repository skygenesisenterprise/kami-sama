import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { logger } from "../services/logger.js";

/**
 * Recursively discover command modules under `commandsDir`. Every module must
 * export a `data` (SlashCommandBuilder) and an `execute(interaction)`.
 * Optional exports: `autocomplete(interaction)`, `permission` (PermissionLevel),
 * `feature` (feature flag name), `cooldown`.
 */
export async function discoverCommands(commandsDir) {
  const files = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js") && entry.name !== "registry.js") {
        files.push(fullPath);
      }
    }
  }

  await walk(commandsDir);

  const commands = [];
  for (const file of files) {
    const modulePath = pathToFileURL(file).href;
    const command = await import(modulePath);

    if (!command.data || typeof command.execute !== "function") {
      logger.warn(`[COMMANDS] Skipping ${path.basename(file)}: missing data or execute.`);
      continue;
    }

    const name = command.data.name;
    commands.push({
      name,
      file: path.relative(commandsDir, file),
      category: command.category ?? "autres",
      data: command.data,
      execute: command.execute,
      autocomplete: command.autocomplete,
      permission: command.permission,
      feature: command.feature,
      cooldown: command.cooldown,
    });
  }

  commands.sort((a, b) => a.name.localeCompare(b.name));
  return commands;
}
