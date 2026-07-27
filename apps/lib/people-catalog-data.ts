import type { StatusTone } from '@/components/dash/status-badge'

export type PersonRole = 'voice-actor' | 'director' | 'animator' | 'writer' | 'composer' | 'character'

export type PublicationState = 'Draft' | 'Review' | 'Approved' | 'Scheduled' | 'Published' | 'Archived'

export type MetadataStatus = 'synced' | 'stale' | 'error' | 'missing'

export interface PersonExternalIds {
  anilist?: string
  myAnimeList?: string
  malCharacterId?: string
  aniDb?: string
  imdb?: string
}

export interface PersonCredit {
  id: string
  seriesTitle: string
  role: string
  episodeRange?: string
}

export interface PersonItem {
  id: string
  slug: string
  name: string
  nameOriginal: string
  role: PersonRole
  status: PublicationState
  metadataStatus: MetadataStatus
  gender: string
  birthday: string
  birthplace: string
  imageUrl: string
  synopsis: string
  credits: PersonCredit[]
  externalIds: PersonExternalIds
  tags: string[]
  updatedAt: string
  updatedBy: string
}

export const ALL_PERSON_ROLES: PersonRole[] = [
  'voice-actor',
  'director',
  'animator',
  'writer',
  'composer',
  'character',
]

export const ALL_PERSON_STATUSES: string[] = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

export const PERSON_STATUS_TONE: Record<PublicationState, StatusTone> = {
  Draft: 'neutral',
  Review: 'warning',
  Approved: 'info',
  Scheduled: 'info',
  Published: 'success',
  Archived: 'neutral',
}

export const METADATA_STATUS_LABEL: Record<MetadataStatus, string> = {
  synced: 'Synced',
  stale: 'Stale',
  error: 'Error',
  missing: 'Missing',
}

export const METADATA_TONE: Record<MetadataStatus, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  synced: 'success',
  stale: 'warning',
  error: 'destructive',
  missing: 'neutral',
}

export const PEOPLE_MOCK: PersonItem[] = [
  {
    id: 'p1',
    slug: 'yui-ishikawa',
    name: 'Yui Ishikawa',
    nameOriginal: '石川 由依',
    role: 'voice-actor',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Female',
    birthday: '1989-05-30',
    birthplace: 'Hyogo, Japan',
    imageUrl: '',
    synopsis: 'Japanese voice actress affiliated with Mitras. Known for voicing Mikasa Ackerman in Attack on Titan and Violet Evergarden.',
    credits: [
      { id: 'c1', seriesTitle: 'Attack on Titan', role: 'Mikasa Ackerman', episodeRange: 'S1-S4' },
      { id: 'c2', seriesTitle: 'Violet Evergarden', role: 'Violet Evergarden', episodeRange: 'S1-S2 + Movies' },
      { id: 'c3', seriesTitle: 'My Hero Academia', role: 'Ragdoll', episodeRange: 'S2-S4' },
    ],
    externalIds: { anilist: '1342', myAnimeList: '22849' },
    tags: ['prominent', 'award-winning'],
    updatedAt: '2h ago',
    updatedBy: 'system',
  },
  {
    id: 'p2',
    slug: 'hajime-isayama',
    name: 'Hajime Isayama',
    nameOriginal: '諫山 創',
    role: 'writer',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Male',
    birthday: '1986-08-29',
    birthplace: 'Oita, Japan',
    imageUrl: '',
    synopsis: 'Japanese manga artist and writer, best known for creating Attack on Titan which became one of the best-selling manga series of all time.',
    credits: [
      { id: 'c4', seriesTitle: 'Attack on Titan', role: 'Original Creator', episodeRange: 'All' },
    ],
    externalIds: { anilist: '1453', myAnimeList: '24263' },
    tags: ['original-creator'],
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'p3',
    slug: 'tetsuro-araki',
    name: 'Tetsuro Araki',
    nameOriginal: '荒木 哲郎',
    role: 'director',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Male',
    birthday: '1976-11-07',
    birthplace: 'Miyazaki, Japan',
    imageUrl: '',
    synopsis: 'Japanese anime director known for directing Attack on Titan, Death Note, and Kabaneri of the Iron Fortress.',
    credits: [
      { id: 'c5', seriesTitle: 'Attack on Titan', role: 'Director', episodeRange: 'S1-S3' },
      { id: 'c6', seriesTitle: 'Death Note', role: 'Director', episodeRange: 'S1' },
      { id: 'c7', seriesTitle: 'Kabaneri of the Iron Fortress', role: 'Director', episodeRange: 'S1 + Movies' },
    ],
    externalIds: { anilist: '1296', myAnimeList: '1830' },
    tags: ['prominent'],
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'p4',
    slug: 'hiroyuki-sawano',
    name: 'Hiroyuki Sawano',
    nameOriginal: '澤野 弘之',
    role: 'composer',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Male',
    birthday: '1980-09-05',
    birthplace: 'Tokyo, Japan',
    imageUrl: '',
    synopsis: 'Japanese composer and pianist known for his work on anime soundtracks including Attack on Titan, Kill la Kill, and Promare.',
    credits: [
      { id: 'c8', seriesTitle: 'Attack on Titan', role: 'Music Composer', episodeRange: 'S1-S3' },
      { id: 'c9', seriesTitle: 'Kill la Kill', role: 'Music Composer', episodeRange: 'S1' },
      { id: 'c10', seriesTitle: 'Promare', role: 'Music Composer', episodeRange: 'Movie' },
    ],
    externalIds: { anilist: '1485' },
    tags: ['prominent', 'prolific'],
    updatedAt: '5d ago',
    updatedBy: 'system',
  },
  {
    id: 'p5',
    slug: 'mikasa-ackerman',
    name: 'Mikasa Ackerman',
    nameOriginal: 'ミカサ・アッカーマン',
    role: 'character',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Female',
    birthday: 'unknown',
    birthplace: 'Shiganshina District',
    imageUrl: '',
    synopsis: 'One of the main protagonists of Attack on Titan. A member of the Survey Corps and the ackerman family with exceptional combat abilities.',
    credits: [
      { id: 'c11', seriesTitle: 'Attack on Titan', role: 'Main Character', episodeRange: 'S1-S4' },
    ],
    externalIds: { anilist: '1453', myAnimeList: '24263', malCharacterId: '73' },
    tags: ['main-cast', 'fan-favorite'],
    updatedAt: '1h ago',
    updatedBy: 'system',
  },
  {
    id: 'p6',
    slug: 'kaji-yuki',
    name: 'Yuki Kaji',
    nameOriginal: '梶 裕貴',
    role: 'voice-actor',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Male',
    birthday: '1985-09-03',
    birthplace: 'Nagoya, Japan',
    imageUrl: '',
    synopsis: 'Prolific Japanese voice actor known for voicing Eren Jaeger in Attack on Titan, Todoroki in My Hero Academia, and Meliodas in The Seven Deadly Sins.',
    credits: [
      { id: 'c12', seriesTitle: 'Attack on Titan', role: 'Eren Jaeger', episodeRange: 'S1-S4' },
      { id: 'c13', seriesTitle: 'My Hero Academia', role: 'Shoto Todoroki', episodeRange: 'S1-S7' },
      { id: 'c14', seriesTitle: 'The Seven Deadly Sins', role: 'Meliodas', episodeRange: 'S1-S4' },
    ],
    externalIds: { anilist: '1311', myAnimeList: '18441' },
    tags: ['prominent', 'prolific'],
    updatedAt: '6h ago',
    updatedBy: 'system',
  },
  {
    id: 'p7',
    slug: 'wit-staff',
    name: 'Wit Studio',
    nameOriginal: 'ウィットスタジオ',
    role: 'animator',
    status: 'Published',
    metadataStatus: 'stale',
    gender: 'Unknown',
    birthday: '',
    birthplace: 'Tokyo, Japan',
    imageUrl: '',
    synopsis: 'Japanese animation studio founded in 2012. Known for producing Attack on Titan seasons 1-3, Vinland Saga, and Ranking of Kings.',
    credits: [
      { id: 'c15', seriesTitle: 'Attack on Titan', role: 'Animation Studio', episodeRange: 'S1-S3' },
      { id: 'c16', seriesTitle: 'Vinland Saga', role: 'Animation Studio', episodeRange: 'S1-S2' },
      { id: 'c17', seriesTitle: 'Ranking of Kings', role: 'Animation Studio', episodeRange: 'S1' },
    ],
    externalIds: { anilist: '569', myAnimeList: '569' },
    tags: ['studio', 'prominent'],
    updatedAt: '1w ago',
    updatedBy: 'admin',
  },
  {
    id: 'p8',
    slug: 'kenshi-yonezu',
    name: 'Kenshi Yonezu',
    nameOriginal: '米津 玄師',
    role: 'composer',
    status: 'Draft',
    metadataStatus: 'missing',
    gender: 'Male',
    birthday: '1991-03-10',
    birthplace: 'Kochi, Japan',
    imageUrl: '',
    synopsis: 'Japanese musician and singer-songwriter. Known for performing the opening theme "KICK BACK" for Chainsaw Man and "LADY" for My Hero Academia.',
    credits: [
      { id: 'c18', seriesTitle: 'Chainsaw Man', role: 'Opening Theme Artist', episodeRange: 'S1 OP1' },
      { id: 'c19', seriesTitle: 'My Hero Academia S6', role: 'Opening Theme Artist', episodeRange: 'S6 OP1' },
    ],
    externalIds: {},
    tags: ['music'],
    updatedAt: '30m ago',
    updatedBy: 'admin',
  },
  {
    id: 'p9',
    slug: 'mao-inoue',
    name: 'Mao Inoue',
    nameOriginal: '井上 真央',
    role: 'voice-actor',
    status: 'Review',
    metadataStatus: 'error',
    gender: 'Female',
    birthday: '1987-01-12',
    birthplace: 'Nagoya, Japan',
    imageUrl: '',
    synopsis: 'Japanese actress and voice actress. Voiced the main character in Fullmetal Alchemist: Brotherhood.',
    credits: [
      { id: 'c20', seriesTitle: 'Fullmetal Alchemist: Brotherhood', role: 'Winry Rockbell', episodeRange: 'S1' },
    ],
    externalIds: { anilist: '846' },
    tags: [],
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  {
    id: 'p10',
    slug: 'toshihiko-araki',
    name: 'Toshihiko Araki',
    nameOriginal: '荒木 利彦',
    role: 'director',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Male',
    birthday: '1976-11-07',
    birthplace: 'Japan',
    imageUrl: '',
    synopsis: 'Japanese anime director known for JoJo\'s Bizarre Adventure series.',
    credits: [
      { id: 'c21', seriesTitle: 'JoJo\'s Bizarre Adventure', role: 'Director', episodeRange: 'S1-S6' },
    ],
    externalIds: { anilist: '1114' },
    tags: ['prominent'],
    updatedAt: '4d ago',
    updatedBy: 'system',
  },
  {
    id: 'p11',
    slug: 'senku-ishigami',
    name: 'Senku Ishigami',
    nameOriginal: '石神 千空',
    role: 'character',
    status: 'Published',
    metadataStatus: 'synced',
    gender: 'Male',
    birthday: 'unknown',
    birthplace: 'Ishigami Village',
    imageUrl: '',
    synopsis: 'The protagonist of Dr. Stone. A scientific genius who aims to rebuild civilization after humanity is petrified.',
    credits: [
      { id: 'c22', seriesTitle: 'Dr. Stone', role: 'Main Character', episodeRange: 'S1-S3' },
    ],
    externalIds: { anilist: '10416' },
    tags: ['main-cast'],
    updatedAt: '12h ago',
    updatedBy: 'system',
  },
  {
    id: 'p12',
    slug: 'tatsuya-fujisawa',
    name: 'Tatsuya Fujisawa',
    nameOriginal: '藤沢 タツヤ',
    role: 'animator',
    status: 'Archived',
    metadataStatus: 'stale',
    gender: 'Male',
    birthday: '',
    birthplace: 'Japan',
    imageUrl: '',
    synopsis: 'Key animator known for work on various anime productions.',
    credits: [
      { id: 'c23', seriesTitle: 'Attack on Titan', role: 'Key Animator', episodeRange: 'S4' },
    ],
    externalIds: {},
    tags: [],
    updatedAt: '3w ago',
    updatedBy: 'admin',
  },
]

export function getPeopleStats(people: PersonItem[]) {
  let published = 0
  let drafts = 0
  let metadataErrors = 0
  let byRole: Record<string, number> = {}

  for (const p of people) {
    if (p.status === 'Published') published++
    if (p.status === 'Draft') drafts++
    if (p.metadataStatus === 'error' || p.metadataStatus === 'missing') metadataErrors++
    byRole[p.role] = (byRole[p.role] || 0) + 1
  }

  return { total: people.length, published, drafts, metadataErrors, byRole }
}
