import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import {
  getNotificationChannels,
  setNotificationChannel,
  removeNotificationChannel,
  getGuildSettings,
  updateGuildSettings,
} from "../utils/store.js";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const ANIME_RELEASE_CHANNEL_TYPE = "anime_releases";

/**
 * Bridge between the Kami-Sama catalog and Discord: publishes structured
 * notifications to per-guild channels configured with `/server notifications`.
 */
export async function resolveTextChannel(client, channelId) {
  if (!channelId) return null;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased() || channel.isDMBased()) return null;
  return channel;
}

export function getAnimeReleaseChannelId(guildId) {
  const channels = getNotificationChannels(guildId);
  return channels[ANIME_RELEASE_CHANNEL_TYPE] ?? null;
}

export async function setAnimeReleaseChannel(client, guildId, channelId) {
  const channel = await resolveTextChannel(client, channelId);
  if (!channel) return { ok: false, error: "Salon introuvable ou non textuel." };
  setNotificationChannel(guildId, ANIME_RELEASE_CHANNEL_TYPE, channelId);
  return { ok: true, channel };
}

export function disableAnimeReleaseChannel(guildId) {
  removeNotificationChannel(guildId, ANIME_RELEASE_CHANNEL_TYPE);
}

export function listNotificationChannels(guildId) {
  return getNotificationChannels(guildId);
}

/**
 * Publish a "new episode" card to every guild that configured an
 * anime_releases channel. `payload` comes from the catalog API.
 */
export async function publishAnimeRelease(client, payload) {
  const guilds = client.guilds.cache.values();
  let published = 0;

  for (const guild of guilds) {
    const channelId = getAnimeReleaseChannelId(guild.id);
    if (!channelId) continue;

    const channel = await resolveTextChannel(client, channelId);
    if (!channel) {
      logger.warn(`[NOTIF] anime_releases channel unreachable`, { guildId: guild.id, channelId });
      continue;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🆕 Nouvel épisode disponible")
      .setDescription(
        `**${payload.anime?.title ?? "Anime"}**\nÉpisode **${payload.episode?.number ?? "?"}**`
      )
      .setURL(payload.url ?? env.webUrl)
      .setThumbnail(payload.anime?.image ?? null)
      .setFooter({ text: "Kami-Sama" })
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch((error) => {
      logger.error(`[NOTIF] failed to publish anime release`, {
        guildId: guild.id,
        channelId,
        error: error.message,
      });
    });
    published += 1;
  }

  return published;
}

/** Store which server (announcements / releases / logs / welcome) channels map to. */
export function setServerChannel(guildId, type, channelId) {
  const settings = getGuildSettings(guildId);
  settings.channels = settings.channels ?? {};
  settings.channels[type] = channelId;
  updateGuildSettings(guildId, settings);
}

export function getServerChannel(guildId, type) {
  const settings = getGuildSettings(guildId);
  return settings.channels?.[type] ?? null;
}

export async function requireManageChannels(interaction) {
  if (!interaction.inCachedGuild()) return false;
  return interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
    || interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
}
