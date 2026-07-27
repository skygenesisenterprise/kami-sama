import type { StatusTone } from '@/components/dash/status-badge'

export type UsageTrend = 'growing' | 'stable' | 'declining'

export interface GenreSeriesRef {
  id: string
  title: string
  year: number
}

export interface GenreItem {
  id: string
  slug: string
  name: string
  description: string
  color: string
  seriesCount: number
  usageTrend: UsageTrend
  topSeries: GenreSeriesRef[]
  updatedAt: string
  updatedBy: string
}

export const USAGE_TREND_LABEL: Record<UsageTrend, string> = {
  growing: 'Growing',
  stable: 'Stable',
  declining: 'Declining',
}

export const USAGE_TREND_TONE: Record<UsageTrend, StatusTone> = {
  growing: 'success',
  stable: 'neutral',
  declining: 'warning',
}

export const GENRE_MOCK: GenreItem[] = [
  {
    id: 'g1',
    slug: 'action',
    name: 'Action',
    description: 'Fast-paced series centered around physical conflict, battles, and high-stakes confrontations.',
    color: '#ef4444',
    seriesCount: 8,
    usageTrend: 'growing',
    topSeries: [
      { id: 'ser-002', title: 'Crimson Blade', year: 2023 },
      { id: 'ser-003', title: 'Neon Orbit', year: 2025 },
      { id: 'ser-009', title: 'Blade of the Fallen', year: 2025 },
    ],
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'g2',
    slug: 'adventure',
    name: 'Adventure',
    description: 'Stories driven by exploration, quests, and journeys through unknown or dangerous territories.',
    color: '#3b82f6',
    seriesCount: 5,
    usageTrend: 'stable',
    topSeries: [
      { id: 'ser-001', title: 'Eternal Frost', year: 2024 },
      { id: 'ser-002', title: 'Crimson Blade', year: 2023 },
      { id: 'ser-012', title: 'Thunder League', year: 2025 },
    ],
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'g3',
    slug: 'comedy',
    name: 'Comedy',
    description: 'Lighthearted or humorous series focused on entertainment, parody, and comedic situations.',
    color: '#f59e0b',
    seriesCount: 3,
    usageTrend: 'stable',
    topSeries: [
      { id: 'ser-005', title: 'After School Skies', year: 2023 },
    ],
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'g4',
    slug: 'drama',
    name: 'Drama',
    description: 'Character-driven narratives emphasizing emotional depth, interpersonal relationships, and personal growth.',
    color: '#8b5cf6',
    seriesCount: 9,
    usageTrend: 'growing',
    topSeries: [
      { id: 'ser-001', title: 'Eternal Frost', year: 2024 },
      { id: 'ser-002', title: 'Crimson Blade', year: 2023 },
      { id: 'ser-004', title: 'Spirit Veil', year: 2024 },
    ],
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'g5',
    slug: 'fantasy',
    name: 'Fantasy',
    description: 'Series set in magical or supernatural worlds featuring mythical creatures, sorcery, and epic lore.',
    color: '#10b981',
    seriesCount: 5,
    usageTrend: 'growing',
    topSeries: [
      { id: 'ser-001', title: 'Eternal Frost', year: 2024 },
      { id: 'ser-006', title: 'Hollow Kingdom', year: 2025 },
      { id: 'ser-011', title: 'Ember Crown', year: 2025 },
    ],
    updatedAt: '12h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'g6',
    slug: 'mystery',
    name: 'Mystery',
    description: 'Narratives built around investigations, puzzles, and uncovering hidden truths or conspiracies.',
    color: '#6366f1',
    seriesCount: 5,
    usageTrend: 'stable',
    topSeries: [
      { id: 'ser-003', title: 'Neon Orbit', year: 2025 },
      { id: 'ser-004', title: 'Spirit Veil', year: 2024 },
      { id: 'ser-010', title: 'Neon Samurai', year: 2024 },
    ],
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'g7',
    slug: 'romance',
    name: 'Romance',
    description: 'Stories centered on romantic relationships, love, and emotional connections between characters.',
    color: '#ec4899',
    seriesCount: 3,
    usageTrend: 'stable',
    topSeries: [
      { id: 'ser-005', title: 'After School Skies', year: 2023 },
      { id: 'ser-013', title: "Ocean's Whisper", year: 2025 },
      { id: 'ser-014', title: 'Crimson Vow', year: 2024 },
    ],
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'g8',
    slug: 'sci-fi',
    name: 'Sci-Fi',
    description: 'Speculative fiction exploring futuristic technology, space exploration, and scientific advancements.',
    color: '#06b6d4',
    seriesCount: 4,
    usageTrend: 'growing',
    topSeries: [
      { id: 'ser-003', title: 'Neon Orbit', year: 2025 },
      { id: 'ser-008', title: 'Starfall Academy', year: 2025 },
      { id: 'ser-010', title: 'Neon Samurai', year: 2024 },
    ],
    updatedAt: '8h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'g9',
    slug: 'slice-of-life',
    name: 'Slice of Life',
    description: 'Grounded, everyday stories focusing on ordinary characters and realistic situations.',
    color: '#84cc16',
    seriesCount: 3,
    usageTrend: 'declining',
    topSeries: [
      { id: 'ser-005', title: 'After School Skies', year: 2023 },
      { id: 'ser-007', title: 'Last Serve', year: 2024 },
      { id: 'ser-013', title: "Ocean's Whisper", year: 2025 },
    ],
    updatedAt: '1w ago',
    updatedBy: 'admin',
  },
  {
    id: 'g10',
    slug: 'sports',
    name: 'Sports',
    description: 'Competitive series focusing on athletic contests, teamwork, and personal achievement through sport.',
    color: '#f97316',
    seriesCount: 2,
    usageTrend: 'stable',
    topSeries: [
      { id: 'ser-007', title: 'Last Serve', year: 2024 },
      { id: 'ser-012', title: 'Thunder League', year: 2025 },
    ],
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  {
    id: 'g11',
    slug: 'supernatural',
    name: 'Supernatural',
    description: 'Series featuring paranormal phenomena, ghosts, demons, and elements beyond the natural world.',
    color: '#a855f7',
    seriesCount: 3,
    usageTrend: 'stable',
    topSeries: [
      { id: 'ser-004', title: 'Spirit Veil', year: 2024 },
      { id: 'ser-009', title: 'Blade of the Fallen', year: 2025 },
      { id: 'ser-014', title: 'Crimson Vow', year: 2024 },
    ],
    updatedAt: '5h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'g12',
    slug: 'documentary',
    name: 'Documentary',
    description: 'Non-fiction series presenting factual content, real events, and educational material.',
    color: '#64748b',
    seriesCount: 1,
    usageTrend: 'declining',
    topSeries: [],
    updatedAt: '2w ago',
    updatedBy: 'admin',
  },
  {
    id: 'g13',
    slug: 'thriller',
    name: 'Thriller',
    description: 'Tense, suspenseful narratives designed to keep audiences on edge with high-stakes situations.',
    color: '#dc2626',
    seriesCount: 2,
    usageTrend: 'growing',
    topSeries: [
      { id: 'ser-010', title: 'Neon Samurai', year: 2024 },
    ],
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'g14',
    slug: 'horror',
    name: 'Horror',
    description: 'Series designed to frighten, disturb, or unsettle audiences through supernatural or psychological terror.',
    color: '#7c3aed',
    seriesCount: 1,
    usageTrend: 'stable',
    topSeries: [],
    updatedAt: '1w ago',
    updatedBy: 'admin',
  },
]

export function getGenreStats(genres: GenreItem[]) {
  const total = genres.length
  const totalSeriesUsage = genres.reduce((acc, g) => acc + g.seriesCount, 0)
  const unused = genres.filter((g) => g.seriesCount === 0).length
  const growing = genres.filter((g) => g.usageTrend === 'growing').length
  const avgUsage = total > 0 ? totalSeriesUsage / total : 0

  return {
    total,
    totalSeriesUsage,
    unused,
    growing,
    avgUsage,
  }
}
