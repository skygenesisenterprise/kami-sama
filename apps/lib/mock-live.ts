import type {
  LiveStream,
  LiveChannel,
  LiveEvent,
  LiveCategoryInfo,
  LiveHeroItem,
  LiveCategory,
  LiveRadioChannel,
} from '@/types/live'

// ── Channels ──────────────────────────────────────────────────────────────
export const LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'ch1',
    slug: 'anime-japan-official',
    name: 'Anime Japan Official',
    avatarUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    description: 'Chaîne officielle d\'Anime Japan. Événements, annonces et coulisses.',
    followerCount: 245000,
    isVerified: true,
    category: 'events',
  },
  {
    id: 'ch2',
    slug: 'mappa-studio',
    name: 'MAPPA Studio',
    avatarUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    description: 'Studio d\'animation MAPPA. Behind the scenes, annonces et live reactions.',
    followerCount: 180000,
    isVerified: true,
    category: 'studios',
  },
  {
    id: 'ch3',
    slug: 'kami-sama-originals',
    name: 'Kami-Sama Originals',
    avatarUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    description: 'Contenus exclusifs Kami-Sama. Interviews, analyses et documentaires.',
    followerCount: 95000,
    isVerified: true,
    category: 'news',
  },
  {
    id: 'ch4',
    slug: 'sakura-vtuber',
    name: 'Sakura VTuber',
    avatarUrl: '/kami-sama.png',
    description: 'VTuber française. Streams, gaming et discussions anime.',
    followerCount: 62000,
    isVerified: false,
    category: 'vtuber',
  },
  {
    id: 'ch5',
    slug: 'otaku-gaming',
    name: 'Otaku Gaming FR',
    avatarUrl: '/kami-sama.png',
    description: 'Gaming japonais et asiatique. Let\'s plays, reviews et sorties.',
    followerCount: 110000,
    isVerified: false,
    category: 'gaming',
  },
  {
    id: 'ch6',
    slug: 'shonen-jump-live',
    name: 'Shonen Jump Live',
    avatarUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    description: 'Chaîne officielle Shueisha. Annonces manga et événements.',
    followerCount: 320000,
    isVerified: true,
    category: 'anime',
  },
  {
    id: 'ch7',
    slug: 'anime-news-network',
    name: 'Anime News Network FR',
    avatarUrl: '/kami-sama.png',
    description: 'Actualités anime en français. News, analyses et interviews.',
    followerCount: 78000,
    isVerified: true,
    category: 'news',
  },
  {
    id: 'ch8',
    slug: 'concert-anime-live',
    name: 'Concert Anime Live',
    avatarUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    description: 'Concerts et performances musicales d\'anime en direct.',
    followerCount: 145000,
    isVerified: true,
    category: 'concerts',
  },
]

// ── Live Streams ──────────────────────────────────────────────────────────
export const LIVE_STREAMS: LiveStream[] = [
  {
    id: 'ls1',
    slug: 'anime-japan-2026-announcements',
    title: 'Anime Japan 2026 — Annonces Exclusives',
    description: 'Les dernières annonces des studios d\'animation pour la saison Printemps 2026. Trailers exclusifs, interviews et coulisses.',
    thumbnailUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[0],
    status: 'live',
    category: 'events',
    viewerCount: 45200,
    peakViewerCount: 52000,
    duration: '2h 15min',
    startedAt: '2026-07-29T14:00:00Z',
    tags: ['événement', 'annonces', 'printemps 2026'],
  },
  {
    id: 'ls2',
    slug: 'mappa-jjk-season-4-react',
    title: 'MAPPA — Réaction Jujutsu Kaisen S4 Ep.1',
    description: 'L\'équipe MAPPA réagit en direct à la première de la saison 4 de Jujutsu Kaisen.',
    thumbnailUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[1],
    status: 'live',
    category: 'studios',
    viewerCount: 31800,
    peakViewerCount: 38000,
    duration: '1h 45min',
    startedAt: '2026-07-29T15:30:00Z',
    tags: ['jujutsu kaisen', 'saison 4', 'réaction'],
  },
  {
    id: 'ls3',
    slug: 'sakura-minecraft-anime',
    title: 'Sakura — Minecraft mais c\'est un anime RPG',
    description: 'On construit un village d\'anime dans Minecraft. Builds thèmes et challenges.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[3],
    status: 'live',
    category: 'vtuber',
    viewerCount: 8400,
    peakViewerCount: 12000,
    duration: '3h 10min',
    startedAt: '2026-07-29T13:00:00Z',
    tags: ['minecraft', 'rpg', 'build'],
  },
  {
    id: 'ls4',
    slug: 'otaku-gaming-gta-japan',
    title: 'Otaku Gaming — GTA VI Édition Japon',
    description: 'On explore Tokyo dans GTA VI. Tour de la ville, missions et découverts.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[4],
    status: 'live',
    category: 'gaming',
    viewerCount: 15600,
    peakViewerCount: 19000,
    duration: '2h 30min',
    startedAt: '2026-07-29T12:00:00Z',
    tags: ['gta vi', 'tokyo', 'gaming'],
  },
  {
    id: 'ls5',
    slug: 'kami-deep-dive-berserk',
    title: 'Kami Deep Dive — L\'héritage de Kentaro Miura',
    description: 'Documentaire exclusif sur l\'œuvre de Miura et son influence sur le manga moderne.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[2],
    status: 'live',
    category: 'news',
    viewerCount: 12300,
    peakViewerCount: 14500,
    duration: '1h 20min',
    startedAt: '2026-07-29T16:00:00Z',
    tags: ['berserk', 'miura', 'documentaire'],
  },
]

// ── Upcoming Events ───────────────────────────────────────────────────────
export const LIVE_EVENTS: LiveEvent[] = [
  {
    id: 'ev1',
    slug: 'shonen-jump-announcements',
    title: 'Shonen Jump — Grandes Annonces Été 2026',
    description: 'Les nouvelles séries et les retour de shōnen populaires.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[5],
    scheduledAt: '2026-07-30T18:00:00Z',
    category: 'anime',
    reminderCount: 12400,
    tags: ['shonen jump', 'annonces', 'été 2026'],
  },
  {
    id: 'ev2',
    slug: 'anime-news-summer-preview',
    title: 'Anime News — Preview Saison Été',
    description: 'Tout ce qu\'il faut savoir sur la saison été 2026.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[6],
    scheduledAt: '2026-07-31T19:00:00Z',
    category: 'news',
    reminderCount: 5600,
    tags: ['été 2026', 'preview', 'saison'],
  },
  {
    id: 'ev3',
    slug: 'concert-anime-summer-fest',
    title: 'Concert Anime Summer Fest 2026',
    description: 'Concert en direct depuis le Summer Fest. Artistes d\'opening et ending.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[7],
    scheduledAt: '2026-08-01T20:00:00Z',
    category: 'concerts',
    reminderCount: 28000,
    tags: ['concert', 'music', 'summer fest'],
  },
  {
    id: 'ev4',
    slug: 'mappa-new-project-reveal',
    title: 'MAPPA — Révélation Nouveau Projet',
    description: 'Le studio MAPPA dévoile son prochain projet original.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[1],
    scheduledAt: '2026-08-02T17:00:00Z',
    category: 'studios',
    reminderCount: 19200,
    tags: ['mappa', 'nouveau projet', 'révélation'],
  },
  {
    id: 'ev5',
    slug: 'sakura-birthday-live',
    title: 'Sakura — Birthday Live Stream 🌸',
    description: 'Stream spécial anniversaire de Sakura. Jeux, chants et surprises.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[3],
    scheduledAt: '2026-08-03T15:00:00Z',
    category: 'vtuber',
    reminderCount: 8900,
    tags: ['anniversaire', 'special', 'sakura'],
  },
  {
    id: 'ev6',
    slug: 'otaku-gaming-new-release',
    title: 'Otaku Gaming — Sortie Exclusive Jeu Anime',
    description: 'Premier test du nouvel RPG anime avant sa sortie officielle.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[4],
    scheduledAt: '2026-08-04T16:00:00Z',
    category: 'gaming',
    reminderCount: 7200,
    tags: ['jeu vidéo', 'rpg', 'test'],
  },
]

// ── Ended Streams (Replays) ──────────────────────────────────────────────
export const LIVE_REPLAYS: LiveStream[] = [
  {
    id: 'lr1',
    slug: 'anime-japan-2025-opening',
    title: 'Anime Japan 2025 — Opening Ceremony',
    description: 'La cérémonie d\'ouverture d\'Anime Japan 2025 avec toutes les annonces.',
    thumbnailUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[0],
    status: 'ended',
    category: 'events',
    viewerCount: 0,
    peakViewerCount: 68000,
    duration: '3h 45min',
    startedAt: '2025-03-23T09:00:00Z',
    endedAt: '2025-03-23T12:45:00Z',
    tags: ['anime japan', '2025', 'opening'],
  },
  {
    id: 'lr2',
    slug: 'mappa-10th-anniversary',
    title: 'MAPPA — 10ème Anniversaire (Replay)',
    description: 'Célébration du 10ème anniversaire du studio MAPPA avec les créateurs.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[1],
    status: 'ended',
    category: 'studios',
    viewerCount: 0,
    peakViewerCount: 42000,
    duration: '2h 30min',
    startedAt: '2025-06-15T18:00:00Z',
    endedAt: '2025-06-15T20:30:00Z',
    tags: ['mappa', 'anniversaire', '10 ans'],
  },
  {
    id: 'lr3',
    slug: 'concert-anime-winter-2025',
    title: 'Concert Anime Winter 2025 (Replay)',
    description: 'Le concert d\'hiver avec les openings et endings de la saison.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[7],
    status: 'ended',
    category: 'concerts',
    viewerCount: 0,
    peakViewerCount: 55000,
    duration: '4h 10min',
    startedAt: '2025-12-20T19:00:00Z',
    endedAt: '2025-12-20T23:10:00Z',
    tags: ['concert', 'hiver 2025', 'music'],
  },
  {
    id: 'lr4',
    slug: 'kami-interview-oda-assistant',
    title: 'Kami Interview — L\'assistant d\'Eiichiro Oda (Replay)',
    description: 'Interview exclusive de l\'assistant principal d\'Oda sur le processus de création de One Piece.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[2],
    status: 'ended',
    category: 'interviews',
    viewerCount: 0,
    peakViewerCount: 35000,
    duration: '1h 55min',
    startedAt: '2026-02-10T20:00:00Z',
    endedAt: '2026-02-10T21:55:00Z',
    tags: ['one piece', 'oda', 'interview'],
  },
  {
    id: 'lr5',
    slug: 'sakura-gaming-marathon',
    title: 'Sakura — 24h Gaming Marathon (Replay)',
    description: 'Le marathon de 24h de gaming de Sakura avec les meilleurs moments.',
    thumbnailUrl: '/kami-sama.png',
    channel: LIVE_CHANNELS[3],
    status: 'ended',
    category: 'vtuber',
    viewerCount: 0,
    peakViewerCount: 18000,
    duration: '24h 00min',
    startedAt: '2026-04-05T10:00:00Z',
    endedAt: '2026-04-06T10:00:00Z',
    tags: ['marathon', '24h', 'gaming'],
  },
]

// ── Radio Channels ────────────────────────────────────────────────────────
export const LIVE_RADIOS: LiveRadioChannel[] = [
  {
    id: 'r1',
    slug: 'anime-radio',
    name: 'Anime Radio FR',
    logoUrl: '/kami-sama.png',
    currentShow: 'Playlist Opening & Ending',
    isLive: true,
    category: 'Anime',
  },
  {
    id: 'r2',
    slug: 'jpop-radio',
    name: 'J-Pop Vibes',
    logoUrl: '/kami-sama.png',
    currentShow: 'Top 20 J-Pop du moment',
    isLive: true,
    category: 'Musique',
  },
  {
    id: 'r3',
    slug: 'lofi-studio',
    name: 'Lo-Fi Studio',
    logoUrl: '/kami-sama.png',
    currentShow: 'Chill Beats to Read To',
    isLive: true,
    category: 'Ambiance',
  },
  {
    id: 'r4',
    slug: 'kawaii-fm',
    name: 'Kawaii FM',
    logoUrl: '/kami-sama.png',
    currentShow: 'Anime OST Non-Stop',
    isLive: true,
    category: 'Musique',
  },
  {
    id: 'r5',
    slug: 'seiyuu-voice',
    name: 'Seiyuu Voice',
    logoUrl: '/kami-sama.png',
    currentShow: 'Interviews &幕后',
    isLive: true,
    category: 'Culture',
  },
  {
    id: 'r6',
    slug: 'gaming-beats',
    name: 'Gaming Beats',
    logoUrl: '/kami-sama.png',
    currentShow: 'JRPG Soundtrack Mix',
    isLive: true,
    category: 'Gaming',
  },
  {
    id: 'r7',
    slug: 'manga-read',
    name: 'Manga Read Radio',
    logoUrl: '/kami-sama.png',
    currentShow: 'Lecture commentée — Berserk',
    isLive: true,
    category: 'Lecture',
  },
  {
    id: 'r8',
    slug: 'conan-radio',
    name: 'Détective Conan Radio',
    logoUrl: '/kami-sama.png',
    currentShow: 'Thème mystère de la semaine',
    isLive: true,
    category: 'Anime',
  },
]

// ── Categories ────────────────────────────────────────────────────────────
export const LIVE_CATEGORIES: LiveCategoryInfo[] = [
  { id: 'anime', label: 'Anime', icon: 'Clapperboard', streamCount: 24 },
  { id: 'studios', label: 'Studios', icon: 'Building2', streamCount: 8 },
  { id: 'concerts', label: 'Concerts', icon: 'Music', streamCount: 5 },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', streamCount: 32 },
  { id: 'vtuber', label: 'VTuber', icon: 'Sparkles', streamCount: 18 },
  { id: 'interviews', label: 'Interviews', icon: 'Mic', streamCount: 6 },
  { id: 'events', label: 'Événements', icon: 'Trophy', streamCount: 12 },
  { id: 'news', label: 'News', icon: 'Newspaper', streamCount: 15 },
  { id: 'creation', label: 'Création', icon: 'Palette', streamCount: 10 },
]

// ── Helpers ───────────────────────────────────────────────────────────────

export function getLiveStreams(): LiveStream[] {
  return LIVE_STREAMS
}

export function getLiveBySlug(slug: string): LiveStream | undefined {
  return LIVE_STREAMS.find((s) => s.slug === slug)
}

export function getUpcomingEvents(): LiveEvent[] {
  return [...LIVE_EVENTS].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )
}

export function getReplays(): LiveStream[] {
  return LIVE_REPLAYS
}

export function getLiveChannels(): LiveChannel[] {
  return LIVE_CHANNELS
}

export function getChannelBySlug(slug: string): LiveChannel | undefined {
  return LIVE_CHANNELS.find((c) => c.slug === slug)
}

export function getStreamsByChannel(channelSlug: string): LiveStream[] {
  const channel = getChannelBySlug(channelSlug)
  if (!channel) return []
  return LIVE_STREAMS.filter((s) => s.channel.id === channel.id)
}

export function getStreamsByCategory(category: LiveCategory): LiveStream[] {
  return LIVE_STREAMS.filter((s) => s.category === category)
}

export function getEventsByCategory(category: LiveCategory): LiveEvent[] {
  return LIVE_EVENTS.filter((e) => e.category === category)
}

export function getTrendingLive(): LiveStream[] {
  return [...LIVE_STREAMS].sort((a, b) => b.viewerCount - a.viewerCount)
}

export function getFeaturedLive(): LiveHeroItem | null {
  const topStream = LIVE_STREAMS.sort((a, b) => b.viewerCount - a.viewerCount)[0]
  if (!topStream) return null
  return {
    stream: topStream,
    headline: topStream.title,
    subheadline: topStream.description,
  }
}

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return String(count)
}

export function formatFollowerCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
  return String(count)
}

export function getRadios(): LiveRadioChannel[] {
  return LIVE_RADIOS
}

export function getTimeRemaining(startedAt: string): string {
  const start = new Date(startedAt).getTime()
  const now = Date.now()
  const elapsed = now - start
  const hours = Math.floor(elapsed / 3600000)
  const mins = Math.floor((elapsed % 3600000) / 60000)
  if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
  return `${mins}min`
}

export function formatScheduledTime(dateStr: string): { day: string; time: string } {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (diffDays <= 0) return { day: "Aujourd'hui", time }
  if (diffDays === 1) return { day: 'Demain', time }
  if (diffDays <= 7) {
    return { day: d.toLocaleDateString('fr-FR', { weekday: 'long' }), time }
  }
  return {
    day: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    time,
  }
}

export function formatScheduledShort(dateStr: string): string {
  const { day, time } = formatScheduledTime(dateStr)
  return `${day} à ${time}`
}

export function getContinueWatching(): LiveStream[] {
  return LIVE_STREAMS.filter((s) => s.status === 'live').slice(0, 3)
}

export function getRecommendedLive(): LiveStream[] {
  return [...LIVE_STREAMS].sort((a, b) => b.peakViewerCount - a.peakViewerCount).slice(0, 6)
}

export function getTopStreams(): LiveStream[] {
  return [...LIVE_STREAMS].sort((a, b) => b.viewerCount - a.viewerCount)
}

export function getStreamsByChannelGroup(): { channel: LiveChannel; streams: LiveStream[] }[] {
  const map = new Map<string, { channel: LiveChannel; streams: LiveStream[] }>()
  for (const stream of LIVE_STREAMS) {
    const existing = map.get(stream.channel.id)
    if (existing) {
      existing.streams.push(stream)
    } else {
      map.set(stream.channel.id, { channel: stream.channel, streams: [stream] })
    }
  }
  return Array.from(map.values())
}
