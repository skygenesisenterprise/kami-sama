import { EmbedBuilder, hyperlink } from "discord.js";
import { env } from "../config/env.js";

const BRAND_COLOR = 0x5865f2;

export function contentUrl(item) {
  const typePath = item.type === "movie" ? "movies" : "series";
  return `${env.webUrl}/${typePath}/${item.slug}`;
}

function statusLabel(status) {
  const labels = {
    airing: "En cours",
    finished: "Terminé",
    upcoming: "À venir",
    hiatus: "En pause",
    cancelled: "Annulé",
  };
  return labels[status] ?? status;
}

function truncate(value, max = 1024) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 3)}…` : value;
}

/** Embed for a single catalog/search item. */
export function contentItemEmbed(item, { title, description } = {}) {
  const metadata = item.metadata ?? {};
  const fields = [];

  if (metadata.year) fields.push({ name: "Année", value: String(metadata.year), inline: true });
  if (metadata.studio) fields.push({ name: "Studio", value: metadata.studio, inline: true });
  if (metadata.rating != null) fields.push({ name: "Score", value: `**${Number(metadata.rating).toFixed(1)}/10**`, inline: true });
  if (item.availability?.episodes != null) fields.push({ name: "Épisodes", value: String(item.availability.episodes), inline: true });
  if (item.status) fields.push({ name: "Statut", value: statusLabel(item.status), inline: true });
  if (Array.isArray(metadata.genres) && metadata.genres.length > 0) {
    fields.push({ name: "Genres", value: metadata.genres.slice(0, 5).join(", "), inline: false });
  }

  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(item.title)
    .setURL(contentUrl(item))
    .setFooter({ text: "Kami-Sama", iconURL: `${env.webUrl}/favicon.ico` })
    .setTimestamp();

  if (title) embed.setDescription(description ?? title);
  if (metadata.synopsis) embed.addFields({ name: "Synopsis", value: truncate(metadata.synopsis), inline: false });

  if (fields.length > 0) embed.addFields(fields);

  const image = item.images?.poster?.url ?? item.images?.backdrop?.url;
  if (image) embed.setImage(image);

  return embed;
}

export function statusEmbed(client) {
  const uptimeSeconds = Math.floor(process.uptime());
  const uptime = new Date(uptimeSeconds * 1000).toISOString().slice(11, 19);
  const memory = Math.round(process.memoryUsage().rss / 1024 / 1024);

  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle("Kami-Sama Bot")
    .setDescription("Client Discord de l'écosystème Kami-Sama.")
    .addFields(
      { name: "Uptime", value: uptime, inline: true },
      { name: "Mémoire", value: `${memory} MB`, inline: true },
      { name: "Serveurs", value: String(client.guilds.cache.size), inline: true },
      { name: "Utilisateurs", value: String(client.guilds.cache.reduce((total, guild) => total + (guild.memberCount ?? 0), 0)), inline: true },
      { name: "Version", value: env.version, inline: true },
      { name: "Environnement", value: env.isProduction ? "production" : "development", inline: true }
    )
    .setTimestamp();
}

export function releaseInfoFields() {
  return [
    { name: "Version", value: env.version, inline: true },
    { name: "Commit", value: env.commitSha === "unknown" ? "unknown" : env.commitSha.slice(0, 7), inline: true },
    { name: "Environnement", value: env.environment, inline: true },
    { name: "Build", value: env.buildDate, inline: true },
  ];
}

export const kamiLink = (text, href) => hyperlink(text, href);
