import type {
  CatalogItem,
  CatalogGenre,
  CatalogType,
  CatalogStatus,
  CatalogSort,
  CatalogFilter,
  CatalogResponse,
  CatalogGenreInfo,
  CatalogTypeInfo,
} from '@/types/catalog'

// ── Catalog Items ─────────────────────────────────────────────────────────
export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'c1',
    slug: 'solo-leveling',
    title: 'Solo Leveling',
    japaneseTitle: '俺だけレベルアップな件',
    coverUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    score: 8.7,
    type: 'anime',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2024,
    status: 'completed',
    studio: 'A-1 Pictures',
    episodes: 12,
    favorites: 245000,
    synopsis: "Dans un monde où des portails dimensionnels apparaissent, Sung Jin-Woo, le chasseur le plus faible, découvre un système secret qui lui permet de devenir plus fort que quiconque.",
    ageRating: '16+',
    language: 'japonais',
  },
  {
    id: 'c2',
    slug: 'one-piece',
    title: 'One Piece',
    japaneseTitle: 'ワンピース',
    coverUrl: '/kami-sama.png',
    bannerUrl: '/kami-sama.png',
    score: 9.0,
    type: 'anime',
    genres: ['action', 'aventure', 'comedy'],
    year: 1999,
    status: 'airing',
    studio: 'Toei Animation',
    episodes: 1100,
    favorites: 520000,
    synopsis: "Monkey D. Luffy part en mer avec son équipage pour trouver le trésor ultime, le One Piece, et devenir le Roi des Pirates.",
    ageRating: '12+',
    language: 'japonais',
  },
  {
    id: 'c3',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    japaneseTitle: '呪術廻戦',
    coverUrl: '/kami-sama.png',
    score: 8.9,
    type: 'anime',
    genres: ['action', 'fantasy', 'horreur'],
    year: 2020,
    status: 'airing',
    studio: 'MAPPA',
    episodes: 48,
    favorites: 198000,
    synopsis: "Yuji Itadori rejoint une organisation secrète d'exorcistes après avoir avalé un doigt maudit du roi des fléaux, Ryomen Sukuna.",
    ageRating: '16+',
    language: 'japonais',
  },
  {
    id: 'c4',
    slug: 'attack-on-titan',
    title: "L'Attaque des Titans",
    japaneseTitle: '進撃の巨人',
    coverUrl: '/kami-sama.png',
    score: 9.1,
    type: 'anime',
    genres: ['action', 'drame', 'militaire'],
    year: 2013,
    status: 'completed',
    studio: 'Wit Studio',
    episodes: 94,
    favorites: 410000,
    synopsis: "L'humanité vit retranchée derrière d'immenses murs pour se protéger des Titans. Eren Jäger jure de les exterminer tous après la destruction de sa ville.",
    ageRating: '18+',
    language: 'japonais',
  },
  {
    id: 'c5',
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    japaneseTitle: '鬼滅の刃',
    coverUrl: '/kami-sama.png',
    score: 8.8,
    type: 'anime',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2019,
    status: 'airing',
    studio: 'Ufotable',
    episodes: 55,
    favorites: 320000,
    synopsis: "Tanjiro Kamado devient un pourfendeur de démons après le massacre de sa famille et la transformation de sa sœur en démon.",
    ageRating: '16+',
    language: 'japonais',
  },
  {
    id: 'c6',
    slug: 'chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    coverUrl: '/kami-sama.png',
    score: 8.5,
    type: 'anime',
    genres: ['action', 'horreur', 'thriller'],
    year: 2022,
    status: 'airing',
    studio: 'MAPPA',
    episodes: 12,
    favorites: 175000,
    synopsis: "Denji fusionne avec son démon scie et devient un chasseur de démons pour rembourser les dettes de son père décédé.",
    ageRating: '18+',
    language: 'japonais',
  },
  {
    id: 'c7',
    slug: 'spy-family',
    title: 'Spy x Family',
    japaneseTitle: 'スパイファミリー',
    coverUrl: '/kami-sama.png',
    score: 8.6,
    type: 'anime',
    genres: ['action', 'comedy', 'slice-of-life'],
    year: 2022,
    status: 'airing',
    studio: 'Wit Studio',
    episodes: 37,
    favorites: 210000,
    synopsis: "Un espion, une tueuse et une télépath forment une fausse famille sans connaître les secrets les uns des autres.",
    ageRating: '12+',
    language: 'japonais',
  },
  {
    id: 'c8',
    slug: 'my-hero-academia',
    title: 'My Hero Academia',
    japaneseTitle: '僕のヒーローアカデミア',
    coverUrl: '/kami-sama.png',
    score: 8.4,
    type: 'anime',
    genres: ['action', 'aventure'],
    year: 2016,
    status: 'completed',
    studio: 'Bones',
    episodes: 138,
    favorites: 280000,
    synopsis: "Izuku Midoriya, né sans super-pouvoir dans un monde où 80% de la population en possède, rêve de devenir un héros.",
    ageRating: '12+',
    language: 'japonais',
  },
  {
    id: 'c9',
    slug: 'tokyo-ghoul',
    title: 'Tokyo Ghoul',
    japaneseTitle: '東京喰種',
    coverUrl: '/kami-sama.png',
    score: 8.3,
    type: 'anime',
    genres: ['action', 'horreur', 'drame'],
    year: 2014,
    status: 'completed',
    studio: 'Pierrot',
    episodes: 48,
    favorites: 195000,
    synopsis: "Ken Kaneki devient mi-humain mi-goule après une greffe d'organe et doit naviguer entre les deux mondes.",
    ageRating: '18+',
    language: 'japonais',
  },
  {
    id: 'c10',
    slug: 'death-note',
    title: 'Death Note',
    japaneseTitle: 'デスノート',
    coverUrl: '/kami-sama.png',
    score: 9.0,
    type: 'anime',
    genres: ['thriller', 'psychologique', 'mystere'],
    year: 2006,
    status: 'completed',
    studio: 'Madhouse',
    episodes: 37,
    favorites: 450000,
    synopsis: "Light Yagami découvre un cahier surnaturel qui donne le pouvoir de tuer quiconque dont on écrit le nom.",
    ageRating: '16+',
    language: 'japonais',
  },
  {
    id: 'c11',
    slug: 'naruto-shippuden',
    title: 'Naruto Shippuden',
    japaneseTitle: 'ナルト 疾風伝',
    coverUrl: '/kami-sama.png',
    score: 8.7,
    type: 'anime',
    genres: ['action', 'aventure'],
    year: 2007,
    status: 'completed',
    studio: 'Pierrot',
    episodes: 500,
    favorites: 380000,
    synopsis: "Naruto Uzumaki continue son entraînement pour devenir le plus grand ninja et protéger son village.",
    ageRating: '12+',
    language: 'japonais',
  },
  {
    id: 'c12',
    slug: 'fullmetal-alchemist',
    title: "Fullmetal Alchemist: Brotherhood",
    japaneseTitle: '鋼の錬金術師 FULLMETAL ALCHEMIST',
    coverUrl: '/kami-sama.png',
    score: 9.2,
    type: 'anime',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2009,
    status: 'completed',
    studio: 'Bones',
    episodes: 64,
    favorites: 420000,
    synopsis: "Les frères Elric utilisent l'alchimie pour tenter de restaurer leurs corps après une tentative ratée de résurrection.",
    ageRating: '13+',
    language: 'japonais',
  },
  {
    id: 'c13',
    slug: 'solo-leveling-manga',
    title: 'Solo Leveling (Manga)',
    japaneseTitle: '俺だけレベルアップな件',
    coverUrl: '/kami-sama.png',
    score: 8.5,
    type: 'manga',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2018,
    status: 'completed',
    author: 'Chugong',
    chapters: 200,
    volumes: 12,
    favorites: 180000,
    synopsis: "La version manga du best-seller coréen. Sung Jin-Woo monte en puissance dans un monde de chasseurs.",
    language: 'coréen',
  },
  {
    id: 'c14',
    slug: 'tower-of-god',
    title: 'Tower of God',
    japaneseTitle: '신의 탑',
    coverUrl: '/kami-sama.png',
    score: 8.3,
    type: 'manhwa',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2010,
    status: 'airing',
    author: 'SIU',
    chapters: 600,
    favorites: 145000,
    synopsis: "Bam monte dans la Tour de Dieu pour retrouver son amie Rachel et découvrir les secrets de cette structure神秘.",
    language: 'coréen',
  },
  {
    id: 'c15',
    slug: 'the-beginning-after-the-end',
    title: 'The Beginning After the End',
    japaneseTitle: '',
    coverUrl: '/kami-sama.png',
    score: 8.6,
    type: 'manhwa',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2018,
    status: 'airing',
    author: 'TurtleMe',
    chapters: 250,
    favorites: 98000,
    synopsis: "Un roi réincarné dans un monde de magie utilise ses connaissances passées pour devenir plus fort.",
    language: 'coréen',
  },
  {
    id: 'c16',
    slug: 'ogres-movie',
    title: 'Ogres',
    coverUrl: '/kami-sama.png',
    score: 7.8,
    type: 'film',
    genres: ['action', 'fantasy'],
    year: 2025,
    status: 'upcoming',
    studio: 'CloverWorks',
    favorites: 12000,
    synopsis: "Un film original explorant un monde où les ogres et les humains coexistent dans un fragile équilibre.",
    ageRating: '12+',
    language: 'japonais',
  },
  {
    id: 'c17',
    slug: 'suzume',
    title: 'Suzume',
    japaneseTitle: 'すずめの戸締まり',
    coverUrl: '/kami-sama.png',
    score: 8.4,
    type: 'film',
    genres: ['aventure', 'fantasy', 'drame'],
    year: 2022,
    status: 'completed',
    studio: 'CoMix Wave Films',
    favorites: 87000,
    synopsis: "Suzume voyage à travers le Japon pour fermer les portes qui provoquent des catastrophes.",
    ageRating: '10+',
    language: 'japonais',
  },
  {
    id: 'c18',
    slug: 'your-name',
    title: 'Your Name',
    japaneseTitle: '君の名は。',
    coverUrl: '/kami-sama.png',
    score: 8.9,
    type: 'film',
    genres: ['romance', 'fantasy', 'drame'],
    year: 2016,
    status: 'completed',
    studio: 'CoMix Wave Films',
    favorites: 320000,
    synopsis: "Deux adolescents échangent leurs corps et tombent amoureux sans jamais s'être rencontrés.",
    ageRating: '10+',
    language: 'japonais',
  },
  {
    id: 'c19',
    slug: 'mushoku-tensei',
    title: 'Mushoku Tensei',
    japaneseTitle: '無職転生',
    coverUrl: '/kami-sama.png',
    score: 8.5,
    type: 'light-novel',
    genres: ['aventure', 'fantasy', 'isekai'],
    year: 2012,
    status: 'completed',
    author: 'Rifujin na Magonote',
    volumes: 26,
    favorites: 95000,
    synopsis: "Un homme de 34 ans renaît dans un monde de magie et décide de vivre sa nouvelle vie sans regret.",
    language: 'japonais',
  },
  {
    id: 'c20',
    slug: 'overlord',
    title: 'Overlord',
    japaneseTitle: 'オーバーロード',
    coverUrl: '/kami-sama.png',
    score: 8.1,
    type: 'light-novel',
    genres: ['action', 'fantasy', 'isekai'],
    year: 2010,
    status: 'airing',
    author: 'Kugane Maruyama',
    volumes: 16,
    favorites: 78000,
    synopsis: "Un joueur reste piégé dans son jeu vidéo préféré et décide de conquérir le monde en tant que Seigneur des Ténèbres.",
    language: 'japonais',
  },
  {
    id: 'c21',
    slug: 'martial-peak',
    title: 'Martial Peak',
    coverUrl: '/kami-sama.png',
    score: 7.9,
    type: 'manhua',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2014,
    status: 'airing',
    author: 'Momo',
    chapters: 3000,
    favorites: 65000,
    synopsis: "Yang Kai découvre un manuel d'arts martiaux secret qui va transformer sa destiny.",
    language: 'chinois',
  },
  {
    id: 'c22',
    slug: 'omniscient-reader',
    title: 'Omniscient Reader',
    japaneseTitle: '전지적 독자 시점',
    coverUrl: '/kami-sama.png',
    score: 8.8,
    type: 'manhwa',
    genres: ['action', 'aventure', 'thriller'],
    year: 2018,
    status: 'airing',
    author: 'Sing Shong',
    chapters: 220,
    favorites: 112000,
    synopsis: "Un lecteur de webnovel se retrouve piégé dans le monde de son histoire préférée avec ses connaissances de l'intrigue.",
    language: 'coréen',
  },
  {
    id: 'c23',
    slug: 'jujutsu-kaisen-manga',
    title: 'Jujutsu Kaisen (Manga)',
    japaneseTitle: '呪術廻戦',
    coverUrl: '/kami-sama.png',
    score: 8.9,
    type: 'manga',
    genres: ['action', 'fantasy', 'horreur'],
    year: 2018,
    status: 'completed',
    author: 'Gege Akutami',
    chapters: 271,
    favorites: 210000,
    synopsis: "Le manga original de Jujutsu Kaisen, suivi par des millions de lecteurs dans le monde.",
    language: 'japonais',
  },
  {
    id: 'c24',
    slug: 'one-punch-man',
    title: 'One Punch Man',
    japaneseTitle: 'ワンパンマン',
    coverUrl: '/kami-sama.png',
    score: 8.7,
    type: 'manga',
    genres: ['action', 'comedy', 'aventure'],
    year: 2009,
    status: 'airing',
    author: 'ONE',
    chapters: 200,
    favorites: 290000,
    synopsis: "Saitama est un héros tellement puissant qu'il vainc tous ses ennemis d'un seul coup de poing, ce qui le rend déprimé.",
    language: 'japonais',
  },
  {
    id: 'c25',
    slug: 'bleach-thousand-year',
    title: 'Bleach: Thousand-Year Blood War',
    japaneseTitle: 'BLEACH 千年血戦篇',
    coverUrl: '/kami-sama.png',
    score: 9.0,
    type: 'anime',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2022,
    status: 'airing',
    studio: 'Pierrot',
    episodes: 40,
    favorites: 260000,
    synopsis: "Ichigo Kurosaki affronte les Quincy dans le conflit le plus sanglant de l'histoire des Shinigami.",
    ageRating: '16+',
    language: 'japonais',
  },
  {
    id: 'c26',
    slug: 'dragon-ball-daima',
    title: 'Dragon Ball Daima',
    japaneseTitle: 'ドラゴンボールDAIMA',
    coverUrl: '/kami-sama.png',
    score: 8.2,
    type: 'anime',
    genres: ['action', 'aventure', 'comedy'],
    year: 2024,
    status: 'airing',
    studio: 'Toei Animation',
    episodes: 20,
    favorites: 145000,
    synopsis: "Goku et ses amis sont transformés en enfants et doivent explorer un nouveau monde pour retrouver leur forme.",
    ageRating: '10+',
    language: 'japonais',
  },
  {
    id: 'c27',
    slug: 'frieren',
    title: 'Frieren',
    japaneseTitle: '葬送のフリーレン',
    coverUrl: '/kami-sama.png',
    score: 9.1,
    type: 'anime',
    genres: ['aventure', 'drame', 'fantasy'],
    year: 2023,
    status: 'airing',
    studio: 'Madhouse',
    episodes: 28,
    favorites: 175000,
    synopsis: "Une magie elfe voyage à travers le monde des humains pour comprendre les émotions qu'elle n'a jamais ressenties.",
    ageRating: '10+',
    language: 'japonais',
  },
  {
    id: 'c28',
    slug: 'dandadan',
    title: 'Dandadan',
    japaneseTitle: 'ダンダダン',
    coverUrl: '/kami-sama.png',
    score: 8.6,
    type: 'manga',
    genres: ['action', 'comedy', 'horreur'],
    year: 2021,
    status: 'airing',
    author: 'Tatsu Yukinobu',
    chapters: 150,
    favorites: 125000,
    synopsis: "Un otaku de l'esprit et une voyante doivent combattre des aliens et des fantômes tout en cherchant leurs objets sacrés.",
    language: 'japonais',
  },
  {
    id: 'c29',
    slug: 'blue-lock',
    title: 'Blue Lock',
    japaneseTitle: 'ブルーロック',
    coverUrl: '/kami-sama.png',
    score: 8.3,
    type: 'manga',
    genres: ['sport'],
    year: 2018,
    status: 'airing',
    author: 'Muneyuki Kaneshiro',
    chapters: 280,
    favorites: 135000,
    synopsis: "300 attaquants adolescents s'affrontent dans un entraînement impitoyable pour devenir le meilleur attaquant du monde.",
    language: 'japonais',
  },
  {
    id: 'c30',
    slug: 'elden-ring',
    title: 'Elden Ring',
    coverUrl: '/kami-sama.png',
    score: 9.3,
    type: 'jeu',
    genres: ['action', 'aventure', 'fantasy'],
    year: 2022,
    status: 'completed',
    studio: 'FromSoftware',
    favorites: 420000,
    synopsis: "Explorez un monde ouvert vaste et sombre créé en collaboration avec George R.R. Martin.",
    ageRating: '18+',
  },
]

// ── Genre Info ────────────────────────────────────────────────────────────
export const CATALOG_GENRES: CatalogGenreInfo[] = [
  { id: 'action', label: 'Action', count: 18 },
  { id: 'aventure', label: 'Aventure', count: 15 },
  { id: 'romance', label: 'Romance', count: 6 },
  { id: 'fantasy', label: 'Fantasy', count: 16 },
  { id: 'science-fiction', label: 'Science-fiction', count: 4 },
  { id: 'horreur', label: 'Horreur', count: 5 },
  { id: 'comedie', label: 'Comédie', count: 7 },
  { id: 'drame', label: 'Drame', count: 8 },
  { id: 'mystere', label: 'Mystère', count: 3 },
  { id: 'thriller', label: 'Thriller', count: 5 },
  { id: 'sport', label: 'Sport', count: 3 },
  { id: 'slice-of-life', label: 'Tranche de vie', count: 4 },
  { id: 'musique', label: 'Musique', count: 2 },
  { id: 'mecha', label: 'Mecha', count: 2 },
  { id: 'isekai', label: 'Isekai', count: 5 },
  { id: 'psychologique', label: 'Psychologique', count: 3 },
  { id: 'historique', label: 'Historique', count: 2 },
  { id: 'militaire', label: 'Militaire', count: 2 },
  { id: 'nature', label: 'Nature', count: 1 },
  { id: 'policier', label: 'Policier', count: 2 },
]

// ── Type Info ─────────────────────────────────────────────────────────────
export const CATALOG_TYPES: CatalogTypeInfo[] = [
  { id: 'anime', label: 'Anime', count: 14 },
  { id: 'manga', label: 'Manga', count: 6 },
  { id: 'manhwa', label: 'Manhwa', count: 3 },
  { id: 'manhua', label: 'Manhua', count: 1 },
  { id: 'webtoon', label: 'Webtoon', count: 0 },
  { id: 'light-novel', label: 'Light Novel', count: 2 },
  { id: 'novel', label: 'Novel', count: 0 },
  { id: 'film', label: 'Film', count: 3 },
  { id: 'ova', label: 'OVA', count: 0 },
  { id: 'jeu', label: 'Jeu', count: 1 },
]

// ── Status Info ───────────────────────────────────────────────────────────
export const CATALOG_STATUS_MAP: Record<CatalogStatus, { label: string; color: string }> = {
  airing: { label: 'En cours', color: 'text-green-400' },
  completed: { label: 'Terminé', color: 'text-blue-400' },
  upcoming: { label: 'À venir', color: 'text-yellow-400' },
  hiatus: { label: 'En pause', color: 'text-orange-400' },
  cancelled: { label: 'Annulé', color: 'text-red-400' },
}

// ── Years ─────────────────────────────────────────────────────────────────
export const CATALOG_YEARS = Array.from({ length: 30 }, (_, i) => 2026 - i)

// ── Studios (extracted from items) ────────────────────────────────────────
export const CATALOG_STUDIOS = [
  'A-1 Pictures',
  'MAPPA',
  'Ufotable',
  'Wit Studio',
  'Bones',
  'Madhouse',
  'Pierrot',
  'Toei Animation',
  'CloverWorks',
  'CoMix Wave Films',
  'Kyoto Animation',
  'Production I.G',
  'Studio Trigger',
  'Khara',
  'Science SARU',
]

// ── Helpers ───────────────────────────────────────────────────────────────

export function getCatalogItems(filter: CatalogFilter = {}): CatalogResponse {
  let items = [...CATALOG_ITEMS]

  if (filter.search) {
    const q = filter.search.toLowerCase()
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.japaneseTitle?.toLowerCase().includes(q) ||
        item.studio?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q),
    )
  }

  if (filter.type) {
    items = items.filter((item) => item.type === filter.type)
  }

  if (filter.genre) {
    items = items.filter((item) => item.genres.includes(filter.genre!))
  }

  if (filter.status) {
    items = items.filter((item) => item.status === filter.status)
  }

  if (filter.year) {
    items = items.filter((item) => item.year === filter.year)
  }

  if (filter.studio) {
    const s = filter.studio.toLowerCase()
    items = items.filter(
      (item) => item.studio?.toLowerCase().includes(s) || item.author?.toLowerCase().includes(s),
    )
  }

  // Sort
  const sort = filter.sort || 'popular'
  switch (sort) {
    case 'popular':
      items.sort((a, b) => b.favorites - a.favorites)
      break
    case 'rating':
      items.sort((a, b) => b.score - a.score)
      break
    case 'favorites':
      items.sort((a, b) => b.favorites - a.favorites)
      break
    case 'newest':
      items.sort((a, b) => b.year - a.year)
      break
    case 'release':
      items.sort((a, b) => b.year - a.year)
      break
    case 'alpha':
      items.sort((a, b) => a.title.localeCompare(b.title))
      break
  }

  const total = items.length
  const page = filter.page || 1
  const pageSize = filter.pageSize || 20
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return {
    total,
    items: paged,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return CATALOG_ITEMS.find((item) => item.slug === slug)
}

export function getCatalogGenres(): CatalogGenreInfo[] {
  return CATALOG_GENRES
}

export function getCatalogTypes(): CatalogTypeInfo[] {
  return CATALOG_TYPES
}

export function getCatalogItemByType(type: CatalogType): CatalogItem[] {
  return CATALOG_ITEMS.filter((item) => item.type === type)
}

export function getCatalogItemByGenre(genre: CatalogGenre): CatalogItem[] {
  return CATALOG_ITEMS.filter((item) => item.genres.includes(genre))
}

export function getCatalogFeatured(): CatalogItem[] {
  return [...CATALOG_ITEMS].sort((a, b) => b.score - a.score).slice(0, 6)
}

export function getCatalogNew(): CatalogItem[] {
  return [...CATALOG_ITEMS].sort((a, b) => b.year - a.year).slice(0, 6)
}

export function getCatalogTrending(): CatalogItem[] {
  return [...CATALOG_ITEMS].sort((a, b) => b.favorites - a.favorites).slice(0, 6)
}
