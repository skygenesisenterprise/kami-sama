import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { env } from "./config/env.js";
import { logger } from "./services/logger.js";
import { discoverCommands } from "./commands/registry.js";
import { discoverComponents, resolveComponent } from "./components/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
});

client.commands = new Collection();
client.components = {
  buttons: new Collection(),
  selectMenus: new Collection(),
  modals: new Collection(),
};
client.resolveComponent = resolveComponent;

async function loadCommands() {
  const commandsDir = path.join(__dirname, "commands");
  const commands = await discoverCommands(commandsDir);
  for (const command of commands) {
    client.commands.set(command.name, command);
  }
  logger.info(`Loaded ${client.commands.size} slash commands.`);
  return client.commands;
}

async function loadComponents() {
  const componentsDir = path.join(__dirname, "components");
  const components = await discoverComponents(componentsDir);

  for (const entry of components.buttons) {
    const key = entry.patterns.map((p) => (p instanceof RegExp ? p.source : p)).join("|");
    client.components.buttons.set(key, entry);
  }
  for (const entry of components.selectMenus) {
    const key = entry.patterns.map((p) => (p instanceof RegExp ? p.source : p)).join("|");
    client.components.selectMenus.set(key, entry);
  }
  for (const entry of components.modals) {
    const key = entry.patterns.map((p) => (p instanceof RegExp ? p.source : p)).join("|");
    client.components.modals.set(key, entry);
  }

  logger.info(
    `Loaded ${client.components.buttons.size} button(s), ${client.components.selectMenus.size} select menu(s), ${client.components.modals.size} modal(s).`
  );
}

async function loadEvents() {
  const { readdir } = await import("node:fs/promises");
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = (await readdir(eventsPath)).filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = await import(new URL(`./events/${file}`, import.meta.url).href);
    if (!event.name || typeof event.execute !== "function") {
      logger.warn(`[EVENTS] Skipping ${file}: missing name or execute.`);
      continue;
    }
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
  }
  logger.info(`Loaded ${eventFiles.length} event handler(s).`);
}

function registerSignalHandlers() {
  const shutdown = () => {
    logger.info("Shutting down Kami-Sama bot…");
    client.destroy();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function bootstrap() {
  try {
    if (!env.isConfigured) {
      logger.warn(`Discord bot config incomplete. Missing: ${env.missingRequiredVars.join(", ")}`);
      setInterval(() => {}, 1 << 30);
      return;
    }

    registerSignalHandlers();
    await loadCommands();
    await loadComponents();
    await loadEvents();
    await client.login(env.token);
  } catch (error) {
    logger.error("Bot startup failed", { error: error.stack });
    process.exit(1);
  }
}

void bootstrap();
