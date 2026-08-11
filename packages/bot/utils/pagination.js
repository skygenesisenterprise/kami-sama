import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function paginate(items, page, pageSize = 5) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { page: current, totalPages, start, items: slice };
}

export function pageIndicator(current, total) {
  return `Page **${current}/${total}**`;
}

/**
 * Previous / Next buttons that emit `customIdPrefix:<page>`.
 */
export function paginationRow(customIdPrefix, page, totalPages) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}:${page - 1}`)
      .setLabel("◀ Précédent")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}:${page + 1}`)
      .setLabel("Suivant ▶")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages)
  );
  return row;
}

/** Parse a customId of the form `prefix:payload`. */
export function parseCustomId(customId, prefix) {
  if (!customId.startsWith(`${prefix}:`)) return null;
  return customId.slice(prefix.length + 1);
}
