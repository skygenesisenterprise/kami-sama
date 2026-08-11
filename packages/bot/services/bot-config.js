import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const configPath = path.join(dataDir, "bot-config.json");

export function getBotConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return {};
  }
}

export function setBotConfig(patch) {
  const next = { ...getBotConfig(), ...patch };
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

/**
 * Custom Discord status (the free-form one regular users can set).
 * Precedence: value saved via `/bot status set` wins over the DISCORD_STATUS
 * env default.
 */
export function resolveCustomStatus() {
  const persisted = getBotConfig().customStatus;
  if (persisted !== undefined && persisted !== "") return persisted;
  return env.customStatus ?? "";
}

export function setCustomStatus(text) {
  setBotConfig({ customStatus: text });
}

export function clearCustomStatus() {
  const config = getBotConfig();
  if (config.customStatus !== undefined) {
    delete config.customStatus;
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }
}
