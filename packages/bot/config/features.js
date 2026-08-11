import { env } from "./env.js";

const FEATURE_LABELS = {
  catalog: "Catalogue",
  manga: "Manga",
  recommendations: "Recommandations",
  notifications: "Notifications",
  community: "Communauté",
  moderation: "Modération",
  account: "Compte",
  accountLinking: "Liaison de compte",
  sge: "SGE",
};

export function isFeatureEnabled(name) {
  const value = env.featureFlags[name];
  if (value === undefined) return true;
  return value;
}

export function requireFeature(interaction, name) {
  if (!isFeatureEnabled(name)) {
    return {
      ok: false,
      message: `La fonctionnalité **${FEATURE_LABELS[name] ?? name}** est désactivée sur ce bot.`,
    };
  }
  return { ok: true };
}

export function featureLabel(name) {
  return FEATURE_LABELS[name] ?? name;
}

export function listFeatures() {
  return Object.entries(env.featureFlags).map(([key, enabled]) => ({
    key,
    label: FEATURE_LABELS[key] ?? key,
    enabled,
  }));
}
