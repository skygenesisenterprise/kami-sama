import path from "node:path";
import { fileURLToPath } from "node:url";
import { REST, Routes } from "discord.js";
import { assertDiscordEnv, env } from "./config/env.js";
import { logger } from "./services/logger.js";
import { discoverCommands } from "./commands/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  assertDiscordEnv();

  const commandsDir = path.join(__dirname, "commands");
  const commands = await discoverCommands(commandsDir);
  const payload = commands.map((command) => command.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(env.token);
  const scope = (env.commandScope ?? "global").trim().toLowerCase();

  if (scope === "none") {
    logger.info("No commands deployed (DISCORD_COMMAND_SCOPE=none).");
    return;
  }

  if (scope === "global") {
    await rest.put(Routes.applicationCommands(env.clientId), { body: payload });
    logger.info(`Deployed ${payload.length} global command(s).`);
    return;
  }

  if (/^\d{17,20}$/.test(scope)) {
    await rest.put(Routes.applicationGuildCommands(env.clientId, scope), { body: payload });
    logger.info(`Deployed ${payload.length} command(s) to guild ${scope}.`);
    return;
  }

  throw new Error(
    `Invalid DISCORD_COMMAND_SCOPE: ${env.commandScope}. Expected: global, none, or a guild ID.`
  );
}

deploy().catch((error) => {
  logger.error("Command deployment failed", { error: error.stack });
  process.exit(1);
});
