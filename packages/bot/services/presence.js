import { ActivityType } from "discord.js";
import { env } from "../config/env.js";
import { resolveCustomStatus } from "./bot-config.js";

export function buildActivities(client) {
  const customStatus = resolveCustomStatus();
  const guildCount = client.guilds.cache.size;
  const memberCount = client.guilds.cache.reduce(
    (total, guild) => total + (guild.memberCount ?? 0),
    0
  );

  const activities = [];

  // Free-form custom status, exactly like a regular user's status.
  if (customStatus) {
    activities.push({
      name: "status",
      state: customStatus,
      type: ActivityType.Custom,
    });
  }

  activities.push(
    {
      name: `${guildCount} guild - ${memberCount} users`,
      type: ActivityType.Watching,
    },
    {
      name: `Version ${env.version}`,
      type: ActivityType.Playing,
    }
  );

  return activities;
}

export function applyPresence(client) {
  if (!client.user) return;
  client.user.setPresence({
    activities: buildActivities(client),
    status: "online",
  });
}
