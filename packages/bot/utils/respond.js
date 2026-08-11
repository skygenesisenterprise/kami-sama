import { MessageFlags } from "discord.js";

/**
 * Safe reply helpers that work whether the interaction was deferred or not.
 */

export async function replyOrEdit(interaction, payload) {
  const options = { ephemeral: payload.ephemeral ?? false, ...payload };
  delete options.ephemeral;

  if (interaction.replied) {
    return interaction.editReply(options);
  }
  if (interaction.deferred) {
    return interaction.editReply(options);
  }
  return interaction.reply(options);
}

export function ephemeral(payload) {
  return { ...payload, flags: MessageFlags.Ephemeral };
}

export async function defer(interaction, ephemeralReply = false) {
  if (interaction.deferred || interaction.replied) return;
  await interaction.deferReply({ flags: ephemeralReply ? MessageFlags.Ephemeral : undefined });
}

export async function replyError(interaction, message) {
  const payload = {
    content: `❌ ${message}`,
    flags: MessageFlags.Ephemeral,
  };
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
}

export async function replySuccess(interaction, message, extra = {}) {
  const payload = {
    content: `✅ ${message}`,
    ...extra,
  };
  return replyOrEdit(interaction, payload);
}
