import { PermissionFlagsBits } from "discord.js";
import { env } from "../config/env.js";
import { PermissionError } from "./errors.js";

export const PermissionLevel = Object.freeze({
  PUBLIC: 0,
  USER: 1,
  MODERATOR: 10,
  ADMIN: 20,
  SGE_STAFF: 30,
  KAMI_ADMIN: 40,
  BOT_OWNER: 50,
});

const LEVEL_NAMES = Object.fromEntries(
  Object.entries(PermissionLevel).map(([name, value]) => [value, name])
);

export function permissionName(level) {
  return LEVEL_NAMES[level] ?? "PUBLIC";
}

function hasAnyRole(interaction, roleIds) {
  if (!interaction.inCachedGuild()) return false;
  const roles = interaction.member.roles.cache;
  return roleIds.some((roleId) => roles.has(roleId));
}

function resolveBotOwner(interaction) {
  return env.botOwnerIds.includes(interaction.user.id);
}

function resolveKamiAdmin(interaction) {
  return hasAnyRole(interaction, env.kamiAdminRoles);
}

function resolveSgeStaff(interaction) {
  return resolveKamiAdmin(interaction) || hasAnyRole(interaction, env.sgeStaffRoles);
}

function resolveAdmin(interaction) {
  if (interaction.inCachedGuild()) {
    return interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      || interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      || hasAnyRole(interaction, env.moderatorRoles);
  }
  return false;
}

function resolveModerator(interaction) {
  if (interaction.inCachedGuild()) {
    return resolveAdmin(interaction)
      || interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)
      || interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
  }
  return false;
}

/** Compute the highest permission level for an interaction author. */
export function resolvePermissionLevel(interaction) {
  if (resolveBotOwner(interaction)) return PermissionLevel.BOT_OWNER;
  if (resolveKamiAdmin(interaction)) return PermissionLevel.KAMI_ADMIN;
  if (resolveSgeStaff(interaction)) return PermissionLevel.SGE_STAFF;
  if (resolveAdmin(interaction)) return PermissionLevel.ADMIN;
  if (resolveModerator(interaction)) return PermissionLevel.MODERATOR;
  return PermissionLevel.USER;
}

/**
 * Assert that an interaction author meets the required permission level.
 * Throws PermissionError otherwise. Pass `interaction` through the central
 * handler to get a clean ephemeral response.
 */
export function requirePermission(interaction, required) {
  const level = resolvePermissionLevel(interaction);
  if (level < required) {
    throw new PermissionError(
      `Vous devez être au niveau **${permissionName(required)}** pour utiliser cette commande.`
    );
  }
  return level;
}

export function isBotOwner(userId) {
  return env.botOwnerIds.includes(userId);
}

/** Ensure the command is used inside a guild. Returns the cached guild. */
export function requireGuild(interaction) {
  if (!interaction.inCachedGuild()) {
    throw new PermissionError("Cette commande doit être utilisée dans un serveur.");
  }
  return interaction.guild;
}
