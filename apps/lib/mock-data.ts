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
  SeasonalPick,
  SimulcastItem,
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
  {
    id: 'starfall-academy',
    slug: 'starfall-academy',
    title: 'Starfall Academy',
    japaneseTitle: 'スターフォール学園',
    synopsis:
      'At a prestigious academy orbiting Earth, gifted cadets train to defend the solar system. When a first-year student discovers she can interface with ancient alien technology, she becomes the target of both corporate agents and a shadowy military faction.',
    cover: '/covers/neon-orbit.png',
    banner: '/banners/neon-orbit-banner.png',
    genres: [g('sci-fi'), g('action'), g('mystery')],
    studio: { id: 'helix', name: 'Helix Works' },
    year: 2025,
    status: 'airing',
    rating: 8.3,
    ratingCount: 11240,
    ageRating: 'PG-13',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2025 }],
    totalEpisodes: 12,
  },
  {
    id: 'blade-of-the-fallen',
    slug: 'blade-of-the-fallen',
    title: 'Blade of the Fallen',
    japaneseTitle: '堕ちた者の刃',
    synopsis:
      'A disgraced knight is resurrected by a vengeful spirit with one condition: wield the cursed blade until the one who betrayed him falls. But the sword hungers for more than just revenge — it feeds on the wielder\'s memories.',
    cover: '/covers/crimson-blade.png',
    banner: '/banners/crimson-blade-banner.png',
    genres: [g('fantasy'), g('action'), g('supernatural')],
    studio: { id: 'kaze', name: 'Kaze Animation' },
    year: 2025,
    status: 'airing',
    rating: 8.7,
    ratingCount: 15890,
    ageRating: 'R',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 13, year: 2025 }],
    totalEpisodes: 13,
  },
  {
    id: 'moonlit-path',
    slug: 'moonlit-path',
    title: 'Moonlit Path',
    japaneseTitle: '月明かりの道',
    synopsis:
      'Every full moon, a narrow alley in old Kyoto opens a door to the spirit world. A teenage fox spirit and a human girl with no memory of her past walk this path together, uncovering a centuries-old pact that binds their fates.',
    cover: '/covers/spirit-veil.png',
    banner: '/banners/eternal-frost-banner.png',
    genres: [g('supernatural'), g('mystery'), g('romance')],
    studio: { id: 'aurora', name: 'Studio Aurora' },
    year: 2025,
    status: 'airing',
    rating: 8.9,
    ratingCount: 20130,
    ageRating: 'PG-13',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2025 }],
    totalEpisodes: 12,
  },
  {
    id: 'oceans-whisper',
    slug: 'oceans-whisper',
    title: "Ocean's Whisper",
    japaneseTitle: '海の囁き',
    synopsis:
      'A marine biologist returns to her coastal hometown and reunites with the childhood friend who once promised to show her every secret the ocean held. As they explore tide pools and shipwrecks, old feelings resurface alongside something ancient stirring in the deep.',
    cover: '/covers/letter-to-spring.png',
    banner: '/banners/eternal-frost-banner.png',
    genres: [g('romance'), g('slice-of-life'), g('drama')],
    studio: { id: 'lumine', name: 'Lumine Studio' },
    year: 2025,
    status: 'airing',
    rating: 8.6,
    ratingCount: 16780,
    ageRating: 'PG',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2025 }],
    totalEpisodes: 12,
  },
  {
    id: 'thunder-league',
    slug: 'thunder-league',
    title: 'Thunder League',
    japaneseTitle: 'サンダーリーグ',
    synopsis:
      'In a world where soccer matches are decided by both skill and elemental power, a boy with no affinity for magic joins a underdog team. His only weapon: relentless training and a tactical mind that can outwit any storm.',
    cover: '/covers/last-serve.png',
    banner: '/banners/neon-orbit-banner.png',
    genres: [g('sports'), g('action'), g('adventure')],
    studio: { id: 'kaze', name: 'Kaze Animation' },
    year: 2025,
    status: 'airing',
    rating: 8.1,
    ratingCount: 9870,
    ageRating: 'PG',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 24, year: 2025 }],
    totalEpisodes: 24,
  },
  {
    id: 'crimson-vow',
    slug: 'crimson-vow',
    title: 'Crimson Vow',
    japaneseTitle: '紅の誓い',
    synopsis:
      'A vampire countess breaks her ancient blood oath to protect a human scholar she has loved across centuries. Hunted by her own kind, she must choose between immortality and the one person who made eternity worth living.',
    cover: '/covers/eternal-frost.png',
    banner: '/banners/crimson-blade-banner.png',
    genres: [g('romance'), g('supernatural'), g('drama')],
    studio: { id: 'aurora', name: 'Studio Aurora' },
    year: 2024,
    status: 'completed',
    rating: 9.0,
    ratingCount: 31200,
    ageRating: 'PG-13',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2024 }],
    totalEpisodes: 12,
  },
  {
    id: 'neon-samurai',
    slug: 'neon-samurai',
    title: 'Neon Samurai',
    japaneseTitle: 'ネオン侍',
    synopsis:
      'In rain-soaked Neo-Kyoto 2187, a ronin without a clan takes mercenary jobs while searching for the AI that murdered his master. Every circuit he follows leads deeper into a conspiracy linking the city\'s founding families to a weapon that could end consciousness itself.',
    cover: '/covers/neon-orbit.png',
    banner: '/banners/neon-orbit-banner.png',
    genres: [g('sci-fi'), g('action'), g('mystery')],
    studio: { id: 'helix', name: 'Helix Works' },
    year: 2024,
    status: 'completed',
    rating: 9.1,
    ratingCount: 42350,
    ageRating: 'R',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 12, year: 2024 }],
    totalEpisodes: 12,
  },
  {
    id: 'ember-crown',
    slug: 'ember-crown',
    title: 'Ember Crown',
    japaneseTitle: '炎の王冠',
    synopsis:
      'When the fire god chooses a peasant girl as the new Flame Sovereign, the five noble houses unite against her. Guided by a disgraced general and a trickster spirit, she must master her power before the kingdom tears itself apart.',
    cover: '/covers/hollow-kingdom.png',
    banner: '/banners/crimson-blade-banner.png',
    genres: [g('fantasy'), g('adventure'), g('drama')],
    studio: { id: 'kaze', name: 'Kaze Animation' },
    year: 2025,
    status: 'upcoming',
    rating: 8.8,
    ratingCount: 12450,
    ageRating: 'PG-13',
    seasons: [{ number: 1, title: 'Season 1', episodeCount: 24, year: 2025 }],
    totalEpisodes: 24,
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
  const picks: [string, number, number][] = [
    ['eternal-frost', 62, 7],
    ['neon-orbit', 25, 3],
    ['crimson-blade', 88, 11],
    ['spirit-veil', 40, 5],
    ['moonlit-path', 15, 2],
    ['blade-of-the-fallen', 73, 9],
    ['last-serve', 10, 1],
  ]
  return picks.map(([id, percent, epIndex]) => {
    const anime = getAnime(id)!
    const episodes = getEpisodes(id)
    const episode = episodes[Math.min(epIndex, episodes.length - 1)]
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
    { anime: getAnime('neon-samurai')!, rank: 2, trend: 4 },
    { anime: getAnime('eternal-frost')!, rank: 3, trend: 0 },
    { anime: getAnime('moonlit-path')!, rank: 4, trend: 3 },
    { anime: getAnime('neon-orbit')!, rank: 5, trend: 1 },
    { anime: getAnime('crimson-vow')!, rank: 6, trend: -1 },
    { anime: getAnime('spirit-veil')!, rank: 7, trend: -2 },
    { anime: getAnime('blade-of-the-fallen')!, rank: 8, trend: 5 },
    { anime: getAnime('last-serve')!, rank: 9, trend: 3 },
    { anime: getAnime('hollow-kingdom')!, rank: 10, trend: 2 },
  ]
}

export function getRecentlyAdded(): RecentlyAddedItem[] {
  return [
    'moonlit-path',
    'blade-of-the-fallen',
    'starfall-academy',
    'oceans-whisper',
    'thunder-league',
    'neon-orbit',
    'eternal-frost',
    'spirit-veil',
  ].map((id) => {
    const eps = getEpisodes(id)
    return { anime: getAnime(id)!, episode: eps[eps.length - 1] }
  })
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
      anime: getAnime('moonlit-path')!,
      reason: 'Because you watched Spirit Veil',
      detail: 'Same studio, atmospheric supernatural',
    },
    {
      anime: getAnime('blade-of-the-fallen')!,
      reason: 'Because you like dark fantasy',
      detail: 'Same studio as Crimson Blade',
    },
    {
      anime: getAnime('oceans-whisper')!,
      reason: 'Because you watched After School Skies',
      detail: 'Same studio, gentle romance vibe',
    },
    {
      anime: getAnime('neon-samurai')!,
      reason: 'Trending in Sci-Fi',
      detail: 'Highest rated cyberpunk this year',
    },
    {
      anime: getAnime('crimson-vow')!,
      reason: 'Because you like supernatural romance',
      detail: 'Dark, atmospheric, and emotionally rich',
    },
    {
      anime: getAnime('ember-crown')!,
      reason: 'Most anticipated upcoming fantasy',
      detail: 'From the studio behind Hollow Kingdom',
    },
    {
      anime: getAnime('starfall-academy')!,
      reason: 'Because you watched Neon Orbit',
      detail: 'Similar sci-fi setting, new perspective',
    },
    {
      anime: getAnime('thunder-league')!,
      reason: 'Popular in Sports',
      detail: 'Action-packed with a tactical twist',
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

export function getSimulcasts(): SimulcastItem[] {
  function lastEp(id: string) {
    const eps = getEpisodes(id)
    return eps[eps.length - 1]
  }
  return [
    {
      anime: getAnime('moonlit-path')!,
      nextEpisode: lastEp('moonlit-path'),
      airDay: 'Monday',
      nextAirDate: '2025-07-14',
    },
    {
      anime: getAnime('blade-of-the-fallen')!,
      nextEpisode: lastEp('blade-of-the-fallen'),
      airDay: 'Tuesday',
      nextAirDate: '2025-07-15',
    },
    {
      anime: getAnime('spirit-veil')!,
      nextEpisode: lastEp('spirit-veil'),
      airDay: 'Wednesday',
      nextAirDate: '2025-07-16',
    },
    {
      anime: getAnime('neon-orbit')!,
      nextEpisode: lastEp('neon-orbit'),
      airDay: 'Thursday',
      nextAirDate: '2025-07-17',
    },
    {
      anime: getAnime('starfall-academy')!,
      nextEpisode: lastEp('starfall-academy'),
      airDay: 'Friday',
      nextAirDate: '2025-07-18',
    },
    {
      anime: getAnime('eternal-frost')!,
      nextEpisode: lastEp('eternal-frost'),
      airDay: 'Saturday',
      nextAirDate: '2025-07-19',
    },
    {
      anime: getAnime('last-serve')!,
      nextEpisode: lastEp('last-serve'),
      airDay: 'Sunday',
      nextAirDate: '2025-07-20',
    },
  ]
}

export function getSeasonalPicks(): SeasonalPick[] {
  return [
    { anime: getAnime('moonlit-path')!, label: 'Summer 2025 Hit' },
    { anime: getAnime('blade-of-the-fallen')!, label: 'Dark Fantasy Pick' },
    { anime: getAnime('starfall-academy')!, label: 'Sci-Fi Gem' },
    { anime: getAnime('oceans-whisper')!, label: 'Romance Standout' },
    { anime: getAnime('eternal-frost')!, label: 'Fan Favorite' },
    { anime: getAnime('thunder-league')!, label: 'Sports Surprise' },
    { anime: getAnime('neon-orbit')!, label: 'Action Classic' },
    { anime: getAnime('spirit-veil')!, label: 'Supernatural Gem' },
  ]
}

/** Newest anime by year and status — used for "Derniers ajouts". */
export function getLatestAdditions(): Anime[] {
  return [...ANIME]
    .filter((a) => a.year >= 2025)
    .sort((a, b) => {
      const statusOrder = { airing: 0, upcoming: 1, hiatus: 2, completed: 3 }
      const sa = statusOrder[a.status]
      const sb = statusOrder[b.status]
      return sa !== sb ? sa - sb : b.year - a.year
    })
    .slice(0, 8)
}

/** Curated editorial picks — used for "Sélection du moment". */
export function getEditorialPicks(): Anime[] {
  return [
    getAnime('neon-samurai')!,
    getAnime('crimson-vow')!,
    getAnime('moonlit-path')!,
    getAnime('eternal-frost')!,
    getAnime('crimson-blade')!,
    getAnime('blade-of-the-fallen')!,
    getAnime('spirit-veil')!,
    getAnime('oceans-whisper')!,
  ]
}
