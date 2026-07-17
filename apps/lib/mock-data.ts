import type {
  Anime,
  CommunityActivity,
  CommunityPick,
  ContinueWatchingItem,
  Episode,
  Genre,
  Recommendation,
  RecentlyAddedItem,
  Review,
  TrendingItem,
  UserSummary,
} from '@/types/anime'

/**
 * Mock data source. In production these would be fetched from api.kami-sama.fr.
 * The shapes mirror the interfaces in types/anime.ts so swapping to the real
 * API only requires replacing the accessor functions at the bottom of this file.
 */

export const GENRES: Genre[] = [
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'slice-of-life', name: 'Slice of Life' },
  { id: 'sci-fi', name: 'Sci-Fi' },
  { id: 'supernatural', name: 'Supernatural' },
  { id: 'sports', name: 'Sports' },
  { id: 'romance', name: 'Romance' },
  { id: 'drama', name: 'Drama' },
  { id: 'mystery', name: 'Mystery' },
]

const g = (id: string) => GENRES.find((x) => x.id === id)!

export const USERS: Record<string, UserSummary> = {
  me: {
    id: 'me',
    username: 'you',
    displayName: 'You',
    avatar: '/avatars/me.png',
  },
  aoi: {
    id: 'u1',
    username: 'aoi_watches',
    displayName: 'Aoi',
    avatar: '/avatars/user-1.png',
  },
  ren: {
    id: 'u2',
    username: 'ren_reviews',
    displayName: 'Ren',
    avatar: '/avatars/user-2.png',
  },
  yuki: {
    id: 'u3',
    username: 'yuki_no_hana',
    displayName: 'Yuki',
    avatar: '/avatars/user-3.png',
  },
}

function makeEpisodes(
  animeId: string,
  seasonCounts: number[],
  thumbnail: string,
): Episode[] {
  const episodes: Episode[] = []
  seasonCounts.forEach((count, sIndex) => {
    const season = sIndex + 1
    for (let n = 1; n <= count; n++) {
      episodes.push({
        id: `${animeId}-s${season}e${n}`,
        animeId,
        season,
        number: n,
        title: EPISODE_TITLES[(n - 1) % EPISODE_TITLES.length],
        description:
          'The story deepens as our heroes confront new challenges and uncover truths that will reshape their journey.',
        thumbnail,
        duration: 1440,
        releaseDate: `2024-0${((n % 9) + 1)}-15`,
      })
    }
  })
  return episodes
}

const EPISODE_TITLES = [
  'The Journey Begins',
  'Whispers in the Snow',
  'A Fragile Promise',
  'Echoes of the Past',
  'The Weight of a Blade',
  'Beneath the Lantern Light',
  'Crossroads',
  'The Longest Night',
  'Embers',
  'What Remains',
  'A Distant Melody',
  'Homecoming',
]

export const ANIME: Anime[] = [
  {
    id: 'eternal-frost',
    slug: 'eternal-frost',
    title: 'Eternal Frost',
    japaneseTitle: '永遠の霜',
    synopsis:
      'Long after the demon war has ended, the elven mage Liora journeys across a peaceful world she no longer recognizes. As the decades pass in an instant for her kind, she sets out to understand the fleeting human lives she once fought beside — and the memories she never let herself feel.',
    cover: '/covers/eternal-frost.png',
    banner: '/banners/eternal-frost-banner.png',
    genres: [g('fantasy'), g('adventure'), g('drama')],
    studio: { id: 'aurora', name: 'Studio Aurora' },
    year: 2024,
    status: 'airing',
    rating: 9.3,
    ratingCount: 48210,
    ageRating: 'PG-13',
    seasons: [
      { number: 1, title: 'Season 1', episodeCount: 12, year: 2024 },
      { number: 2, title: 'Season 2', episodeCount: 8, year: 2025 },
    ],
    totalEpisodes: 20,
  },
  {
    id: 'crimson-blade',
    slug: 'crimson-blade',
    title: 'Crimson Blade',
    japaneseTitle: '紅の刃',
    synopsis:
      'In a feudal capital ruled by fear, a wandering swordsman with a scarlet scarf hunts the corrupt lords who destroyed his village. Each strike of his blade brings him closer to the truth — and further from the man he used to be.',
    cover: '/covers/crimson-blade.png',
    banner: '/banners/crimson-blade-banner.png',
    genres: [g('action'), g('adventure'), g('drama')],
    studio: { id: 'kaze', name: 'Kaze Animation' },
    year: 2023,
    status: 'completed',
    rating: 8.9,
    ratingCount: 61240,
    ageRating: 'R',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2023 }],
    totalEpisodes: 12,
  },
  {
    id: 'neon-orbit',
    slug: 'neon-orbit',
    title: 'Neon Orbit',
    japaneseTitle: 'ネオンオービット',
    synopsis:
      'In the floating megacity of New Kanazawa, an ace pilot bonds with an experimental AI-driven mech. Together they are drawn into a conspiracy that could send the entire orbital colony crashing back to Earth.',
    cover: '/covers/neon-orbit.png',
    banner: '/banners/neon-orbit-banner.png',
    genres: [g('sci-fi'), g('action'), g('mystery')],
    studio: { id: 'helix', name: 'Helix Works' },
    year: 2025,
    status: 'airing',
    rating: 8.6,
    ratingCount: 22980,
    ageRating: 'PG-13',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 10, year: 2025 }],
    totalEpisodes: 10,
  },
  {
    id: 'spirit-veil',
    slug: 'spirit-veil',
    title: 'Spirit Veil',
    japaneseTitle: '霊の帳',
    synopsis:
      'A young shrine maiden discovers she can see the spirits that drift between our world and the next. When restless souls begin gathering in her mountain town, she must learn to guide them home before the veil tears open.',
    cover: '/covers/spirit-veil.png',
    banner: '/banners/eternal-frost-banner.png',
    genres: [g('supernatural'), g('mystery'), g('drama')],
    studio: { id: 'aurora', name: 'Studio Aurora' },
    year: 2024,
    status: 'airing',
    rating: 8.8,
    ratingCount: 33450,
    ageRating: 'PG-13',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 11, year: 2024 }],
    totalEpisodes: 11,
  },
  {
    id: 'after-school-skies',
    slug: 'after-school-skies',
    title: 'After School Skies',
    japaneseTitle: '放課後の空',
    synopsis:
      'Three friends in their final year of high school make a pact to chase one impossible dream each before graduation. A tender, funny, and bittersweet story about the last golden days before growing up.',
    cover: '/covers/after-school-skies.png',
    banner: '/banners/eternal-frost-banner.png',
    genres: [g('slice-of-life'), g('drama'), g('romance')],
    studio: { id: 'lumine', name: 'Lumine Studio' },
    year: 2023,
    status: 'completed',
    rating: 8.4,
    ratingCount: 19870,
    ageRating: 'PG',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 13, year: 2023 }],
    totalEpisodes: 13,
  },
  {
    id: 'hollow-kingdom',
    slug: 'hollow-kingdom',
    title: 'Hollow Kingdom',
    japaneseTitle: '虚ろな王国',
    synopsis:
      'The last knight of a fallen realm awakens beneath a ruined cathedral with no memory and a cursed blade. To reclaim his name he must descend through the hollow kingdom and face the god that devoured it.',
    cover: '/covers/hollow-kingdom.png',
    banner: '/banners/crimson-blade-banner.png',
    genres: [g('fantasy'), g('action'), g('mystery')],
    studio: { id: 'kaze', name: 'Kaze Animation' },
    year: 2025,
    status: 'upcoming',
    rating: 8.7,
    ratingCount: 8120,
    ageRating: 'R',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2025 }],
    totalEpisodes: 12,
  },
  {
    id: 'last-serve',
    slug: 'last-serve',
    title: 'Last Serve',
    japaneseTitle: 'ラストサーブ',
    synopsis:
      'A washed-up volleyball prodigy returns to his hometown court to coach a ragtag high school team with more heart than talent. Their road to nationals starts with a single, impossible serve.',
    cover: '/covers/last-serve.png',
    banner: '/banners/neon-orbit-banner.png',
    genres: [g('sports'), g('slice-of-life'), g('drama')],
    studio: { id: 'lumine', name: 'Lumine Studio' },
    year: 2024,
    status: 'airing',
    rating: 8.2,
    ratingCount: 14560,
    ageRating: 'PG',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 14, year: 2024 }],
    totalEpisodes: 14,
  },
  {
    id: 'letter-to-spring',
    slug: 'letter-to-spring',
    title: 'Letter to Spring',
    japaneseTitle: '春への手紙',
    synopsis:
      'Two childhood friends separated by years reconnect through a series of letters left beneath a cherry tree. A quiet romance about distance, timing, and the courage it takes to say how you really feel.',
    cover: '/covers/letter-to-spring.png',
    banner: '/banners/eternal-frost-banner.png',
    genres: [g('romance'), g('slice-of-life'), g('drama')],
    studio: { id: 'lumine', name: 'Lumine Studio' },
    year: 2022,
    status: 'completed',
    rating: 8.5,
    ratingCount: 27310,
    ageRating: 'PG',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2022 }],
    totalEpisodes: 12,
  },
]

const EPISODE_CACHE: Record<string, Episode[]> = Object.fromEntries(
  ANIME.map((a) => [
    a.id,
    makeEpisodes(
      a.id,
      a.seasons.map((s) => s.episodeCount),
      a.cover,
    ),
  ]),
)

/* ---------------------------------------------------------------------------
 * Accessor functions — swap these to fetch from api.kami-sama.fr in production.
 * ------------------------------------------------------------------------- */

export function getAllAnime(): Anime[] {
  return ANIME
}

export function getAnime(idOrSlug: string): Anime | undefined {
  return ANIME.find((a) => a.id === idOrSlug || a.slug === idOrSlug)
}

export function getEpisodes(animeId: string): Episode[] {
  return EPISODE_CACHE[animeId] ?? []
}

export function getEpisode(animeId: string, episodeId: string): Episode | undefined {
  return getEpisodes(animeId).find((e) => e.id === episodeId)
}

export function getContinueWatching(): ContinueWatchingItem[] {
  const picks: [string, number][] = [
    ['eternal-frost', 62],
    ['neon-orbit', 25],
    ['crimson-blade', 88],
    ['spirit-veil', 40],
    ['last-serve', 10],
  ]
  return picks.map(([id, percent]) => {
    const anime = getAnime(id)!
    const episode = getEpisodes(id)[Math.min(2, getEpisodes(id).length - 1)]
    const remaining = Math.round((episode.duration * (100 - percent)) / 100 / 60)
    return {
      anime,
      episode,
      progressPercent: percent,
      remainingLabel: `${remaining}m left`,
    }
  })
}

export function getTrending(): TrendingItem[] {
  return [
    { anime: getAnime('crimson-blade')!, rank: 1, trend: 2 },
    { anime: getAnime('eternal-frost')!, rank: 2, trend: 0 },
    { anime: getAnime('neon-orbit')!, rank: 3, trend: 1 },
    { anime: getAnime('spirit-veil')!, rank: 4, trend: -1 },
    { anime: getAnime('last-serve')!, rank: 5, trend: 3 },
    { anime: getAnime('hollow-kingdom')!, rank: 6, trend: 2 },
  ]
}

export function getRecentlyAdded(): RecentlyAddedItem[] {
  return ['neon-orbit', 'eternal-frost', 'spirit-veil', 'last-serve', 'crimson-blade'].map(
    (id) => {
      const eps = getEpisodes(id)
      return { anime: getAnime(id)!, episode: eps[eps.length - 1] }
    },
  )
}

export function getCommunityPicks(): CommunityPick[] {
  return [
    { anime: getAnime('hollow-kingdom')!, votes: 12840, communityRating: 9.1 },
    { anime: getAnime('eternal-frost')!, votes: 9430, communityRating: 9.3 },
    { anime: getAnime('spirit-veil')!, votes: 7210, communityRating: 8.8 },
    { anime: getAnime('crimson-blade')!, votes: 6890, communityRating: 8.9 },
    { anime: getAnime('neon-orbit')!, votes: 5120, communityRating: 8.6 },
  ]
}

export function getRecommendations(): Recommendation[] {
  return [
    {
      anime: getAnime('spirit-veil')!,
      reason: 'Because you watched Eternal Frost',
      detail: 'Similar quiet, atmospheric fantasy',
    },
    {
      anime: getAnime('hollow-kingdom')!,
      reason: 'Because you like dark fantasy',
      detail: 'Same studio as Crimson Blade',
    },
    {
      anime: getAnime('letter-to-spring')!,
      reason: 'Because you watched After School Skies',
      detail: 'Same studio, gentle slice-of-life mood',
    },
    {
      anime: getAnime('neon-orbit')!,
      reason: 'Trending in Sci-Fi',
      detail: 'Highly rated by viewers like you',
    },
  ]
}

export function getReviews(animeId: string): Review[] {
  return [
    {
      id: `${animeId}-r1`,
      user: USERS.aoi,
      rating: 9,
      title: 'A quiet masterpiece',
      body: 'Every frame feels intentional. The pacing is slow in the best possible way — it trusts you to sit with its emotions. Easily one of the best things I have watched this year.',
      createdAt: '2 days ago',
      likes: 342,
    },
    {
      id: `${animeId}-r2`,
      user: USERS.ren,
      rating: 8,
      title: 'Gorgeous, if a little uneven',
      body: 'The animation and soundtrack are top tier. A couple of episodes in the middle drag, but the payoff in the finale absolutely earns it.',
      createdAt: '5 days ago',
      likes: 128,
    },
    {
      id: `${animeId}-r3`,
      user: USERS.yuki,
      rating: 10,
      title: 'I was not ready',
      body: 'I went in with no expectations and came out completely changed. The character writing is so genuine. Please watch this with subtitles and give it your full attention.',
      createdAt: '1 week ago',
      likes: 96,
    },
  ]
}

export function getCommunityActivity(): CommunityActivity[] {
  return [
    {
      id: 'a1',
      type: 'review',
      user: USERS.aoi,
      anime: pick('eternal-frost'),
      content: 'reviewed Eternal Frost — "A quiet masterpiece"',
      createdAt: '12m ago',
      meta: '9/10',
    },
    {
      id: 'a2',
      type: 'discussion',
      user: USERS.ren,
      anime: pick('crimson-blade'),
      content: 'started a discussion: "That finale twist — did anyone see it coming?"',
      createdAt: '38m ago',
      meta: '54 replies',
    },
    {
      id: 'a3',
      type: 'request',
      user: USERS.yuki,
      anime: pick('hollow-kingdom'),
      content: 'requested Hollow Kingdom be added in dub',
      createdAt: '1h ago',
      meta: '+248 votes',
    },
    {
      id: 'a4',
      type: 'rating',
      user: USERS.aoi,
      anime: pick('spirit-veil'),
      content: 'rated Spirit Veil',
      createdAt: '2h ago',
      meta: '8.5/10',
    },
    {
      id: 'a5',
      type: 'discussion',
      user: USERS.ren,
      anime: pick('neon-orbit'),
      content: 'started a discussion: "The worldbuilding in episode 4 is incredible"',
      createdAt: '3h ago',
      meta: '21 replies',
    },
  ]
}

function pick(id: string) {
  const a = getAnime(id)!
  return { id: a.id, slug: a.slug, title: a.title, cover: a.cover }
}

export function getLibrarySection(
  section: 'watching' | 'completed' | 'watchlater' | 'favorites',
): Anime[] {
  switch (section) {
    case 'watching':
      return ['eternal-frost', 'neon-orbit', 'spirit-veil', 'last-serve'].map(
        (id) => getAnime(id)!,
      )
    case 'completed':
      return ['crimson-blade', 'after-school-skies', 'letter-to-spring'].map(
        (id) => getAnime(id)!,
      )
    case 'watchlater':
      return ['hollow-kingdom', 'letter-to-spring'].map((id) => getAnime(id)!)
    case 'favorites':
      return ['eternal-frost', 'crimson-blade', 'spirit-veil'].map((id) => getAnime(id)!)
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60)
  return `${m}m`
}

export function searchAnime(query: string): Anime[] {
  const q = query.trim().toLowerCase()
  if (!q) return ANIME
  return ANIME.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.japaneseTitle.includes(query) ||
      a.genres.some((gg) => gg.name.toLowerCase().includes(q)) ||
      a.studio.name.toLowerCase().includes(q),
  )
}
