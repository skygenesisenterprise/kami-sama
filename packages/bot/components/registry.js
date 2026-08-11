import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { logger } from "../services/logger.js";

/**
 * Recursively discover interaction components (buttons / select menus /
 * modals). Each module exports `{ customId, execute }` where `customId` may be
 * a string, a RegExp, or an array mixing both. Exact matches win first, then
 * regex matches.
 */
export async function discoverComponents(componentsDir) {
  const files = [];

  async function walk(dir) {
    let entries = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js") && entry.name !== "registry.js") {
        files.push(fullPath);
      }
    }
  }

  await walk(componentsDir);

  const components = { buttons: [], selectMenus: [], modals: [] };

  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    if (!mod.customId || typeof mod.execute !== "function") {
      logger.warn(`[COMPONENTS] Skipping ${path.basename(file)}: missing customId or execute.`);
      continue;
    }

    const entry = {
      file: path.relative(componentsDir, file),
      patterns: Array.isArray(mod.customId) ? mod.customId : [mod.customId],
      execute: mod.execute,
      permission: mod.permission,
    };

    const dirName = path.basename(path.dirname(file));
    if (dirName === "buttons") components.buttons.push(entry);
    else if (dirName === "select-menus") components.selectMenus.push(entry);
    else if (dirName === "modals") components.modals.push(entry);
    else logger.warn(`[COMPONENTS] Unknown component kind for ${path.basename(file)}`);
  }

  return components;
}

/** Resolve the first component whose customId pattern matches. */
export function resolveComponent(entries, customId) {
  for (const entry of entries) {
    for (const pattern of entry.patterns) {
      if (pattern instanceof RegExp) {
        if (pattern.test(customId)) return entry;
      } else if (pattern === customId) {
        return entry;
      }
    }
  }
  return null;
}
