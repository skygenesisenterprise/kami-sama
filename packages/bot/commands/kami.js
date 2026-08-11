import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { env } from "../config/env.js";
import { kamiSamaClient } from "../services/api/index.js";
import { ApiError } from "../services/errors.js";
import { defer, replyOrEdit } from "../utils/respond.js";
import { kamiLink, releaseInfoFields, statusEmbed } from "../utils/embeds.js";

export const category = "kami";

export const data = new SlashCommandBuilder()
  .setName("kami")
  .setDescription("Commandes Kami-Sama — statut, version et informations de la plateforme.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("status")
      .setDescription("Afficher l'état des services Kami-Sama")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("version")
      .setDescription("Afficher la version du bot et de la plateforme")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("about")
      .setDescription("À propos de Kami-Sama")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("services")
      .setDescription("Lister les services Kami-Sama")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("stats")
      .setDescription("Statistiques du bot et de la plateforme")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("roadmap")
      .setDescription("Feuille de route Kami-Sama")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("links")
      .setDescription("Liens utiles Kami-Sama")
  );

export async function execute(interaction) {
  await defer(interaction);

  const subcommand = interaction.options.getSubcommand();
  const handler = {
    status: showStatus,
    version: showVersion,
    about: showAbout,
    services: showServices,
    stats: showStats,
    roadmap: showRoadmap,
    links: showLinks,
  }[subcommand];

  const embed = await handler(interaction);
  return replyOrEdit(interaction, { embeds: [embed] });
}

async function measureApi() {
  const startedAt = Date.now();
  try {
    const health = await kamiSamaClient.health();
    return {
      ok: true,
      latencyMs: Date.now() - startedAt,
      health,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      health: null,
      error: error instanceof ApiError ? error : new ApiError(error.message),
    };
  }
}

async function showStatus(interaction) {
  const api = await measureApi();
  const embed = new EmbedBuilder()
    .setColor(api.ok ? 0x00ff00 : 0xff0000)
    .setTitle("🟢 Kami-Sama — Statut des services")
    .setDescription(
      api.ok
        ? "L'API Kami-Sama est **opérationnelle**."
        : "L'API Kami-Sama est **injoignable** actuellement."
    )
    .addFields(
      {
        name: "API",
        value: api.ok
          ? `✅ ${api.latencyMs} ms · ${kamiLink("api.kami-sama", env.apiUrl)}`
          : `❌ ${api.error?.message ?? "injoignable"}`,
        inline: false,
      },
      {
        name: "Discord",
        value: `✅ ${Math.round(interaction.client.ws.ping)} ms`,
        inline: false,
      }
    )
    .setFooter({ text: `Base API: ${env.apiUrl}` })
    .setTimestamp();

  if (api.ok && api.health?.status) {
    embed.addFields({ name: "Health", value: `\`${api.health.status}\``, inline: false });
  }

  if (env.apiToken) {
    try {
      const services = await kamiSamaClient.systemHealthServices(env.apiToken);
      const rows = normalizeServices(services);
      if (rows.length > 0) {
        embed.addFields({ name: "Services", value: rows.join("\n"), inline: false });
      }
    } catch {
      // Service-level status requires a token; keep the public summary.
    }
  }

  return embed;
}

function normalizeServices(services) {
  const list = Array.isArray(services) ? services : services?.services ?? [];
  if (list.length === 0) return [];

  return list.map((service) => {
    const name = service.name ?? service.id ?? "service";
    const status = service.status ?? service.healthy ?? "unknown";
    const icon = status === "healthy" || status === "ok" || status === true
      ? "🟢"
      : status === "degraded" || status === "warning"
        ? "🟡"
        : status === "down" || status === false
          ? "🔴"
          : "⚪";
    return `${icon} **${name}** — ${String(status)}`;
  });
}

async function showVersion(interaction) {
  const api = await measureApi();
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🚀 Kami-Sama — Version")
    .addFields(...releaseInfoFields());

  if (api.ok && api.health?.version) {
    embed.addFields({ name: "API version", value: String(api.health.version), inline: true });
  }
  if (api.ok && api.health?.commit) {
    embed.addFields({ name: "API commit", value: String(api.health.commit).slice(0, 7), inline: true });
  }

  embed.setTimestamp();
  return embed;
}

async function showAbout(interaction) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Kami-Sama")
    .setDescription(
      "Kami-Sama est la plateforme communautaire de **Sky Genesis Enterprise (SGE)** " +
      "dédiée à l'anime et au manga : catalogue, découverte, watchlist, notifications " +
      "et streaming — le tout dans un écosystème unifié."
    )
    .addFields(
      { name: "🌐 Plateforme", value: kamiLink(env.webUrl, env.webUrl), inline: true },
      { name: "🔌 API", value: kamiLink("api.kami-sama", env.apiUrl), inline: true },
      { name: "🤖 Bot", value: `Version ${env.version}`, inline: true }
    )
    .setFooter({ text: "Fait partie de l'écosystème SGE" })
    .setTimestamp();
}

async function showServices(interaction) {
  const api = await measureApi();
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🧩 Kami-Sama — Services")
    .setDescription("Services de l'écosystème Kami-Sama.");

  const known = [
    { name: "Web", url: env.webUrl },
    { name: "API", url: env.apiUrl },
    { name: "Streaming (Jellyfin)", url: null },
    { name: "Base de données (PostgreSQL)", url: null },
    { name: "Cache (Redis)", url: null },
    { name: "File d'attente (RabbitMQ)", url: null },
    { name: "Recherche (Meilisearch)", url: null },
  ];

  const rows = known.map((service) => {
    if (service.name === "API") {
      return api.ok ? `✅ **${service.name}** — ${api.latencyMs} ms` : `❌ **${service.name}** — injoignable`;
    }
    return `⚪ **${service.name}** — non vérifié`;
  });

  embed.addFields({ name: "Écosystème", value: rows.join("\n"), inline: false });

  if (env.apiToken) {
    try {
      const services = await kamiSamaClient.systemHealthServices(env.apiToken);
      const rows = normalizeServices(services);
      if (rows.length > 0) {
        embed.addFields({ name: "Détail API", value: rows.join("\n"), inline: false });
      }
    } catch {
      // optional
    }
  }

  embed.setTimestamp();
  return embed;
}

async function showStats(interaction) {
  const api = await measureApi();
  const guildCount = interaction.client.guilds.cache.size;
  const userCount = interaction.client.guilds.cache.reduce(
    (total, guild) => total + (guild.memberCount ?? 0),
    0
  );
  const commandCount = interaction.client.commands.size;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📊 Kami-Sama — Statistiques")
    .addFields(
      { name: "Serveurs", value: String(guildCount), inline: true },
      { name: "Utilisateurs", value: String(userCount), inline: true },
      { name: "Commandes", value: String(commandCount), inline: true },
      { name: "Uptime du bot", value: formatUptime(process.uptime()), inline: true },
      {
        name: "API Kami-Sama",
        value: api.ok ? `✅ ${api.latencyMs} ms` : `❌ ${api.error?.message ?? "injoignable"}`,
        inline: true,
      }
    )
    .setTimestamp();

  return embed;
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

async function showRoadmap(interaction) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🗺️ Kami-Sama — Feuille de route")
    .setDescription("Les grandes étapes de la plateforme Kami-Sama.")
    .addFields(
      { name: "Fondation", value: "Architecture du bot, client API, permissions, erreurs, logging", inline: false },
      { name: "Catalogue", value: "Recherche anime/manga, fiches interactives, watchlist, favoris", inline: false },
      { name: "Communauté", value: "Profil, historique, recommandations, notifications, classements", inline: false },
      { name: "Écosystème", value: "Serveur, modération, intégrations SGE, commandes admin", inline: false }
    )
    .setTimestamp();
}

async function showLinks(interaction) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🔗 Kami-Sama — Liens")
    .setDescription(
      [
        `${kamiLink("🌐 Plateforme", env.webUrl)}`,
        `${kamiLink("🔌 API", env.apiUrl)}`,
        `${kamiLink("🤖 Inviter le bot", `${env.webUrl}/discord`)}`,
        `${kamiLink("📚 Documentation", `${env.webUrl}/docs`)}`,
      ].join("\n")
    )
    .setFooter({ text: "Sky Genesis Enterprise" })
    .setTimestamp();
}
