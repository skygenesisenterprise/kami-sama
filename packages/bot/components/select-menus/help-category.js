import { EmbedBuilder, MessageFlags } from "discord.js";

export const customId = "help:category";

export async function execute(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const category = interaction.values[0];
  const commands = [...interaction.client.commands.values()].filter(
    (command) => command.category === category
  );

  if (commands.length === 0) {
    return interaction.reply({
      content: "Aucune commande dans cette catégorie.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const lines = commands.map((command) => {
    const description = command.data.description ?? "";
    return `**/${command.name}** — ${description}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`Aide — ${category}`)
    .setDescription(lines.join("\n"))
    .setFooter({ text: `${commands.length} commande(s)` })
    .setTimestamp();

  return interaction.update({ embeds: [embed] });
}
