import type { ApiCollection } from "@/lib/api/collections";
import type {
  CollectionEntry,
  CollectionItem,
  CollectionSource,
  CollectionType,
  DataSource,
  DiscoverSection,
  MetadataStatus,
  PublicationState,
} from "@/lib/collections-catalog-data";

export function formatRelativeTime(iso: string): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return new Date(then).toLocaleDateString();
}

export function mapApiCollectionToCollectionItem(c: ApiCollection): CollectionItem {
  const discover: DiscoverSection = {
    enabled: c.discover.enabled,
    order: c.discover.order,
    title: c.discover.title,
    subtitle: c.discover.subtitle,
    ctaLabel: c.discover.ctaLabel,
    href: c.discover.href,
  };

  const entries: CollectionEntry[] = c.entries.map((e) => ({
    seriesId: e.animeId,
    seriesTitle: e.seriesTitle,
    position: e.position,
    addedAt: e.addedAt,
  }));

  const sources: CollectionSource[] = (c.sources ?? []).map((s) => ({
    provider: s.provider as DataSource,
    externalId: s.externalId ?? "",
    lastSyncedAt: s.lastSyncedAt ? formatRelativeTime(s.lastSyncedAt) : "—",
    status: (s.status as CollectionSource["status"]) ?? "active",
  }));

  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    type: (c.type || "editorial") as CollectionType,
    status: (c.status || "Draft") as PublicationState,
    visibility: (c.visibility || "private") as CollectionItem["visibility"],
    entries,
    tags: c.tags ?? [],
    assets: {
      poster: c.assets?.poster ?? "",
      banner: c.assets?.banner ?? "",
    },
    sources,
    metadataStatus: (c.metadataStatus || "missing") as MetadataStatus,
    createdAt: c.createdAt || "",
    updatedAt: formatRelativeTime(c.updatedAt),
    updatedBy: c.updatedBy || "system",
    discover,
  };
}
