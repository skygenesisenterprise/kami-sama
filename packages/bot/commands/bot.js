import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { env } from "../config/env.js";
import { kamiSamaClient } from "../services/api/index.js";
import { releaseInfoFields, statusEmbed } from "../utils/embeds.js";
import { defer, replyOrEdit } from "../utils/respond.js";

export const category = "core";

export const data = new SlashCommandBuilder()
  .setName("bot")
  .setDescription("Informations et statistiques du bot Kami-Sama.")
  .addSubcommand((subcommand) =>
    subcommand.setName("info").setDescription("Afficher les informations du bot")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("status").setDescription("Afficher l'état du bot et de l'API")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("latency").setDescription("Afficher la latence du bot")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("version").setDescription("Afficher la version du bot")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("stats").setDescription("Afficher les statistiques du bot")
  );

export async function execute(interaction) {
  await defer(interaction);

  const subcommand = interaction.options.getSubcommand();
  let embed;

  switch (subcommand) {
    case "info":
      embed = statusEmbed(interaction.client);
      break;
    case "status": {
      embed = statusEmbed(interaction.client);
      const api = await measureApi();
      embed.addFields({
        name: "API Kami-Sama",
        value: api.ok ? `✅ ${api.latencyMs} ms` : `❌ ${api.error}`,
        inline: false,
      });
      break;
    }
    case "latency": {
      const api = await measureApi();
      embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("⚡ Latence")
        .setDescription(
          `Discord: **${Math.round(interaction.client.ws.ping)} ms**\n` +
            `API Kami-Sama: **${api.ok ? api.latencyMs : "—"} ms**`
        )
        .setTimestamp();
      break;
    }
    case "version":
      embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🚀 Bot — Version")
        .addFields(...releaseInfoFields())
        .setTimestamp();
      break;
    case "stats": {
      const uptimeSeconds = Math.floor(process.uptime());
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const memory = Math.round(process.memoryUsage().rss / 1024 / 1024);
      const userCount = interaction.client.guilds.cache.reduce(
        (total, guild) => total + (guild.memberCount ?? 0),
        0
      );
      embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📊 Bot — Statistiques")
        .addFields(
          { name: "Serveurs", value: String(interaction.client.guilds.cache.size), inline: true },
          { name: "Utilisateurs", value: String(userCount), inline: true },
          { name: "Commandes", value: String(interaction.client.commands.size), inline: true },
          { name: "Uptime", value: `${hours}h ${minutes}m`, inline: true },
          { name: "Mémoire", value: `${memory} MB`, inline: true },
          {
            name: "Environnement",
            value: env.isProduction ? "production" : "development",
            inline: true,
          }
        )
        .setTimestamp();
      break;
    }
  }

  return replyOrEdit(interaction, { embeds: [embed] });
}

async function measureApi() {
  const startedAt = Date.now();
  try {
    await kamiSamaClient.health();
    return { ok: true, latencyMs: Date.now() - startedAt, error: null };
  } catch (error) {
    return { ok: false, latencyMs: null, error: error.message ?? "injoignable" };
  }
}
