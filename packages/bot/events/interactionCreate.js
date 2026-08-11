import { MessageFlags } from "discord.js";
import { reportError } from "../services/errors.js";
import { requirePermission, PermissionLevel } from "../services/permissions.js";
import { isFeatureEnabled } from "../config/features.js";
import {
  autocompleteRateLimiter,
  commandRateLimiter,
  rateLimiter,
} from "../services/rate-limiter.js";
import { resolveComponent } from "../components/registry.js";

export const name = "interactionCreate";

export async function execute(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      return handleCommand(interaction);
    }
    if (interaction.isAutocomplete()) {
      return handleAutocomplete(interaction);
    }
    if (interaction.isButton()) {
      return handleComponent(interaction, "buttons", interaction.customId);
    }
    if (interaction.isStringSelectMenu()) {
      return handleComponent(interaction, "selectMenus", interaction.customId);
    }
    if (interaction.isModalSubmit()) {
      return handleComponent(interaction, "modals", interaction.customId);
    }
  } catch (error) {
    await handleError(interaction, error);
  }
}

async function handleCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: "Commande inconnue.",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Feature flag gate
  if (command.feature && !isFeatureEnabled(command.feature)) {
    return interaction.reply({
      content: `La fonctionnalité **${command.feature}** est désactivée sur ce bot.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Rate limiting (user + command)
  const rateKey = RateLimiterKey(interaction, command.name);
  rateLimiter.assert(rateKey);
  commandRateLimiter.assert(`${command.name}:${interaction.user.id}`);

  // Permissions
  const required = command.permission ?? PermissionLevel.PUBLIC;
  if (required > PermissionLevel.PUBLIC) {
    requirePermission(interaction, required);
  }

  return command.execute(interaction);
}

async function handleAutocomplete(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command?.autocomplete) return;

  autocompleteRateLimiter.assert(`autocomplete:${interaction.user.id}`);

  const focused = interaction.options.getFocused(true);
  return command.autocomplete(interaction, focused);
}

async function handleComponent(interaction, kind, customId) {
  const entries = interaction.client.components[kind];
  const component = resolveComponent([...entries.values()], customId);

  if (!component) {
    return interaction.reply({
      content: "Ce composant n'est plus actif. Exécutez la commande à nouveau.",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (component.permission) {
    requirePermission(interaction, component.permission);
  }

  return component.execute(interaction);
}

async function handleError(interaction, error) {
  const context = describeInteraction(interaction);
  reportError(context, error);

  const userMessage =
    error && typeof error.userMessage === "string"
      ? error.userMessage
      : "Une erreur est survenue pendant l'exécution. Réessayez dans quelques instants.";

  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({
      content: `❌ ${userMessage}`,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (interaction.isAutocomplete()) {
    return interaction.respond([]).catch(() => {});
  }

  return interaction.reply({
    content: `❌ ${userMessage}`,
    flags: MessageFlags.Ephemeral,
  });
}

function describeInteraction(interaction) {
  const user = interaction.user?.id ?? "unknown";
  const guild = interaction.guildId ?? "dm";
  let action = interaction.type;

  if (interaction.isChatInputCommand()) action = `/${interaction.commandName}`;
  else if (interaction.customId) action = interaction.customId;

  return `interaction ${action} (guild=${guild}, user=${user})`;
}

function RateLimiterKey(interaction, suffix = "") {
  const user = interaction.user?.id ?? "unknown";
  const guild = interaction.guildId ?? "dm";
  return `${guild}:${user}:${suffix}`;
}
