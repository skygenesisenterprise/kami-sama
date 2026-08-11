import {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { defer, replyOrEdit } from "../utils/respond.js";

export const category = "core";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Aide — liste les commandes du bot par catégorie.")
  .setDMPermission(true);

const CATEGORIES = [
  { key: "core", label: "🎛️ Fondations", description: "ping, help, bot" },
  {
    key: "kami",
    label: "⛩️ Kami-Sama",
    description: "status, version, about, services, stats, roadmap, links",
  },
  { key: "sge", label: "🚀 SGE", description: "about, services, projects, status" },
  { key: "anime", label: "🎬 Anime", description: "search, info, trending, seasonal…" },
  { key: "manga", label: "📚 Manga", description: "search, info, popular, random…" },
  { key: "catalog", label: "🗂️ Catalogue", description: "explorer le catalogue Kami-Sama" },
  { key: "search", label: "🔍 Recherche", description: "recherche globale multi-types" },
  {
    key: "user",
    label: "👤 Compte",
    description: "account, profile, watchlist, favorites, history, continue, recommend",
  },
  {
    key: "community",
    label: "💬 Communauté",
    description: "stats, leaderboard, activity, trending",
  },
  { key: "server", label: "🖥️ Serveur", description: "info, stats, settings, notifications, logs" },
  { key: "moderation", label: "🛡️ Modération", description: "warn, timeout, ban, kick, purge…" },
  { key: "notifications", label: "🔔 Notifications", description: "gérer vos notifications" },
];

export async function execute(interaction) {
  await defer(interaction, true);

  const commands = [...interaction.client.commands.values()];
  const select = new StringSelectMenuBuilder()
    .setCustomId("help:category")
    .setPlaceholder("Choisir une catégorie")
    .addOptions(
      CATEGORIES.filter((category) =>
        commands.some((command) => command.category === category.key)
      ).map((category) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(category.label)
          .setDescription(category.description)
          .setValue(category.key)
      )
    );

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Aide Kami-Sama")
    .setDescription("Sélectionnez une catégorie pour afficher les commandes correspondantes.")
    .addFields(
      CATEGORIES.filter((category) =>
        commands.some((command) => command.category === category.key)
      ).map((category) => ({
        name: category.label,
        value: category.description,
        inline: true,
      }))
    )
    .setFooter({ text: `${commands.length} commandes disponibles` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(select);
  return replyOrEdit(interaction, {
    embeds: [embed],
    components: [row],
  });
}
