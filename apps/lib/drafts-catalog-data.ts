import type { StatusTone } from '@/components/dash/status-badge'

export type DraftType =
  | 'announcement'
  | 'news'
  | 'collection'
  | 'homepage-section'
  | 'event'
  | 'community-post'
  | 'review'
  | 'editorial'
  | 'landing-page'
  | 'banner'

export type DraftStatus =
  | 'draft'
  | 'in-review'
  | 'approved'
  | 'ready'
  | 'scheduled'
  | 'published'
  | 'archived'

export type Visibility = 'public' | 'members' | 'private' | 'unlisted'

export type Language = 'en' | 'ja' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ko'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface DraftActivity {
  id: string
  type: 'created' | 'edited' | 'reviewed' | 'commented' | 'scheduled' | 'published' | 'archived'
  author: string
  timestamp: string
  description: string
}

export interface DraftVersion {
  version: number
  author: string
  timestamp: string
  description: string
}

export interface DraftItem {
  id: string
  title: string
  slug: string
  type: DraftType
  status: DraftStatus
  author: string
  createdAt: string
  updatedAt: string
  publishDate?: string
  visibility: Visibility
  language: Language
  tags: string[]
  excerpt?: string
  thumbnail?: string
  version: number
  priority: Priority
  activity: DraftActivity[]
  versions: DraftVersion[]
}

export const DRAFT_TYPE_LABEL: Record<DraftType, string> = {
  announcement: 'Announcement',
  news: 'News',
  collection: 'Collection',
  'homepage-section': 'Homepage Section',
  event: 'Event',
  'community-post': 'Community Post',
  review: 'Review',
  editorial: 'Editorial',
  'landing-page': 'Landing Page',
  banner: 'Banner',
}

export const DRAFT_TYPE_TONE: Record<DraftType, StatusTone> = {
  announcement: 'info',
  news: 'info',
  collection: 'success',
  'homepage-section': 'warning',
  event: 'warning',
  'community-post': 'neutral',
  review: 'destructive',
  editorial: 'info',
  'landing-page': 'success',
  banner: 'warning',
}

export const DRAFT_STATUS_LABEL: Record<DraftStatus, string> = {
  draft: 'Draft',
  'in-review': 'In Review',
  approved: 'Approved',
  ready: 'Ready',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
}

export const DRAFT_STATUS_TONE: Record<DraftStatus, StatusTone> = {
  draft: 'neutral',
  'in-review': 'warning',
  approved: 'info',
  ready: 'success',
  scheduled: 'warning',
  published: 'success',
  archived: 'neutral',
}

export const ALL_DRAFT_TYPES: Array<DraftType | 'all'> = [
  'all',
  'announcement',
  'news',
  'collection',
  'homepage-section',
  'event',
  'community-post',
  'review',
  'editorial',
  'landing-page',
  'banner',
]

export const ALL_DRAFT_STATUSES: Array<DraftStatus | 'all'> = [
  'all',
  'draft',
  'in-review',
  'approved',
  'ready',
  'scheduled',
  'published',
  'archived',
]

export const ALL_LANGUAGES: Array<Language | 'all'> = [
  'all',
  'en',
  'ja',
  'fr',
  'es',
  'de',
  'pt',
  'zh',
  'ko',
]

export const LANGUAGE_LABEL: Record<Language, string> = {
  en: 'English',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  zh: 'Chinese',
  ko: 'Korean',
}

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: 'Public',
  members: 'Members',
  private: 'Private',
  unlisted: 'Unlisted',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const PRIORITY_TONE: Record<Priority, StatusTone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'destructive',
}

export const KANBAN_COLUMNS: DraftStatus[] = ['draft', 'in-review', 'ready', 'scheduled']

export const MOCK_AUTHORS = [
  'Elena Vasquez',
  'Marcus Chen',
  'Yuki Tanaka',
  'Sofia Andersson',
  'James Okafor',
  'Amélie Dubois',
  'Ravi Patel',
  'Lena Müller',
]

export const DRAFTS_MOCK: DraftItem[] = [
  {
    id: 'dr-001',
    title: 'Spring 2026 Anime Season Preview',
    slug: 'spring-2026-anime-preview',
    type: 'editorial',
    status: 'draft',
    author: 'Yuki Tanaka',
    createdAt: '2d ago',
    updatedAt: '3h ago',
    visibility: 'public',
    language: 'en',
    tags: ['seasonal', 'anime', 'preview'],
    excerpt: 'A comprehensive look at the most anticipated anime releases for Spring 2026.',
    version: 1,
    priority: 'high',
    activity: [
      { id: 'a1', type: 'created', author: 'Yuki Tanaka', timestamp: '2d ago', description: 'Created draft' },
      { id: 'a2', type: 'edited', author: 'Yuki Tanaka', timestamp: '3h ago', description: 'Updated introduction and added key visuals' },
    ],
    versions: [
      { version: 1, author: 'Yuki Tanaka', timestamp: '2d ago', description: 'Initial draft created' },
    ],
  },
  {
    id: 'dr-002',
    title: 'Platform Maintenance Notice — June 30',
    slug: 'platform-maintenance-june-30',
    type: 'announcement',
    status: 'in-review',
    author: 'Marcus Chen',
    createdAt: '5d ago',
    updatedAt: '1d ago',
    publishDate: '2026-06-28',
    visibility: 'public',
    language: 'en',
    tags: ['maintenance', 'platform', 'urgent'],
    excerpt: 'Scheduled maintenance window for database migration and performance improvements.',
    version: 3,
    priority: 'urgent',
    activity: [
      { id: 'a3', type: 'created', author: 'Marcus Chen', timestamp: '5d ago', description: 'Created maintenance notice' },
      { id: 'a4', type: 'edited', author: 'Marcus Chen', timestamp: '3d ago', description: 'Updated maintenance window times' },
      { id: 'a5', type: 'reviewed', author: 'Elena Vasquez', timestamp: '1d ago', description: 'Requested changes to downtime details' },
      { id: 'a6', type: 'commented', author: 'Elena Vasquez', timestamp: '1d ago', description: 'Please add fallback instructions for API users' },
    ],
    versions: [
      { version: 1, author: 'Marcus Chen', timestamp: '5d ago', description: 'Initial draft' },
      { version: 2, author: 'Marcus Chen', timestamp: '3d ago', description: 'Updated times' },
      { version: 3, author: 'Marcus Chen', timestamp: '1d ago', description: 'Addressed review feedback' },
    ],
  },
  {
    id: 'dr-003',
    title: 'Featured: Neon Samurai Collection',
    slug: 'neon-samurai-collection',
    type: 'collection',
    status: 'ready',
    author: 'Elena Vasquez',
    createdAt: '1w ago',
    updatedAt: '2d ago',
    publishDate: '2026-07-01',
    visibility: 'public',
    language: 'en',
    tags: ['collection', 'featured', 'cyberpunk'],
    excerpt: 'Curated collection of cyberpunk anime series inspired by Neon Samurai.',
    version: 2,
    priority: 'medium',
    activity: [
      { id: 'a7', type: 'created', author: 'Elena Vasquez', timestamp: '1w ago', description: 'Created collection' },
      { id: 'a8', type: 'reviewed', author: 'James Okafor', timestamp: '3d ago', description: 'Approved collection curation' },
      { id: 'a9', type: 'edited', author: 'Elena Vasquez', timestamp: '2d ago', description: 'Finalized series list' },
    ],
    versions: [
      { version: 1, author: 'Elena Vasquez', timestamp: '1w ago', description: 'Initial collection' },
      { version: 2, author: 'Elena Vasquez', timestamp: '2d ago', description: 'Finalized series list' },
    ],
  },
  {
    id: 'dr-004',
    title: 'Summer Festival Event 2026',
    slug: 'summer-festival-2026',
    type: 'event',
    status: 'scheduled',
    author: 'Amélie Dubois',
    createdAt: '2w ago',
    updatedAt: '4d ago',
    publishDate: '2026-07-15',
    visibility: 'public',
    language: 'en',
    tags: ['event', 'festival', 'summer'],
    excerpt: 'Annual summer anime festival with exclusive screenings and community events.',
    version: 4,
    priority: 'high',
    activity: [
      { id: 'a10', type: 'created', author: 'Amélie Dubois', timestamp: '2w ago', description: 'Created event page' },
      { id: 'a11', type: 'edited', author: 'Amélie Dubois', timestamp: '1w ago', description: 'Added venue details and schedule' },
      { id: 'a12', type: 'reviewed', author: 'Sofia Andersson', timestamp: '5d ago', description: 'Approved for scheduling' },
      { id: 'a13', type: 'scheduled', author: 'Amélie Dubois', timestamp: '4d ago', description: 'Scheduled for July 15 launch' },
    ],
    versions: [
      { version: 1, author: 'Amélie Dubois', timestamp: '2w ago', description: 'Initial event draft' },
      { version: 2, author: 'Amélie Dubois', timestamp: '1w ago', description: 'Added venue and schedule' },
      { version: 3, author: 'Sofia Andersson', timestamp: '5d ago', description: 'Review approved' },
      { version: 4, author: 'Amélie Dubois', timestamp: '4d ago', description: 'Scheduled for publication' },
    ],
  },
  {
    id: 'dr-005',
    title: 'Homepage Hero Banner — July Update',
    slug: 'homepage-hero-july',
    type: 'banner',
    status: 'draft',
    author: 'Sofia Andersson',
    createdAt: '1d ago',
    updatedAt: '6h ago',
    visibility: 'public',
    language: 'en',
    tags: ['banner', 'homepage', 'design'],
    excerpt: 'New hero banner for the July homepage refresh featuring Eternal Frost Season 2.',
    version: 1,
    priority: 'medium',
    activity: [
      { id: 'a14', type: 'created', author: 'Sofia Andersson', timestamp: '1d ago', description: 'Created banner draft' },
      { id: 'a15', type: 'edited', author: 'Sofia Andersson', timestamp: '6h ago', description: 'Updated banner dimensions and copy' },
    ],
    versions: [
      { version: 1, author: 'Sofia Andersson', timestamp: '1d ago', description: 'Initial banner design' },
    ],
  },
  {
    id: 'dr-006',
    title: 'Community Spotlight: Fan Art Showcase',
    slug: 'community-fan-art-showcase',
    type: 'community-post',
    status: 'in-review',
    author: 'Ravi Patel',
    createdAt: '3d ago',
    updatedAt: '1d ago',
    visibility: 'members',
    language: 'en',
    tags: ['community', 'fan-art', 'spotlight'],
    excerpt: 'Weekly community spotlight featuring the best fan art submissions.',
    version: 2,
    priority: 'low',
    activity: [
      { id: 'a16', type: 'created', author: 'Ravi Patel', timestamp: '3d ago', description: 'Created community post' },
      { id: 'a17', type: 'commented', author: 'Lena Müller', timestamp: '1d ago', description: 'Looks great! Minor formatting suggestions.' },
    ],
    versions: [
      { version: 1, author: 'Ravi Patel', timestamp: '3d ago', description: 'Initial post' },
      { version: 2, author: 'Ravi Patel', timestamp: '1d ago', description: 'Addressed formatting feedback' },
    ],
  },
  {
    id: 'dr-007',
    title: 'Eternal Frost Season 2 — Full Review',
    slug: 'eternal-frost-s2-review',
    type: 'review',
    status: 'approved',
    author: 'Lena Müller',
    createdAt: '1w ago',
    updatedAt: '2d ago',
    publishDate: '2026-07-05',
    visibility: 'public',
    language: 'en',
    tags: ['review', 'eternal-frost', 'anime'],
    excerpt: 'In-depth review of Eternal Frost Season 2, covering animation quality, narrative arc, and character development.',
    version: 3,
    priority: 'medium',
    activity: [
      { id: 'a18', type: 'created', author: 'Lena Müller', timestamp: '1w ago', description: 'Created review draft' },
      { id: 'a19', type: 'edited', author: 'Lena Müller', timestamp: '4d ago', description: 'Expanded character analysis section' },
      { id: 'a20', type: 'reviewed', author: 'Yuki Tanaka', timestamp: '2d ago', description: 'Approved for publication' },
    ],
    versions: [
      { version: 1, author: 'Lena Müller', timestamp: '1w ago', description: 'Initial review' },
      { version: 2, author: 'Lena Müller', timestamp: '4d ago', description: 'Expanded analysis' },
      { version: 3, author: 'Lena Müller', timestamp: '2d ago', description: 'Final polish' },
    ],
  },
  {
    id: 'dr-008',
    title: 'Japanese Anime Glossary — Landing Page',
    slug: 'anime-glossary-landing',
    type: 'landing-page',
    status: 'draft',
    author: 'James Okafor',
    createdAt: '4d ago',
    updatedAt: '12h ago',
    visibility: 'public',
    language: 'en',
    tags: ['glossary', 'landing', 'education'],
    excerpt: 'Comprehensive landing page for the Japanese anime terminology glossary.',
    version: 1,
    priority: 'low',
    activity: [
      { id: 'a21', type: 'created', author: 'James Okafor', timestamp: '4d ago', description: 'Created landing page structure' },
    ],
    versions: [
      { version: 1, author: 'James Okafor', timestamp: '4d ago', description: 'Initial page structure' },
    ],
  },
  {
    id: 'dr-009',
    title: 'What\'s New — June 2026 Roundup',
    slug: 'whats-new-june-2026',
    type: 'news',
    status: 'scheduled',
    author: 'Marcus Chen',
    createdAt: '1w ago',
    updatedAt: '3d ago',
    publishDate: '2026-07-01',
    visibility: 'public',
    language: 'en',
    tags: ['news', 'monthly', 'roundup'],
    excerpt: 'Monthly roundup of platform updates, new features, and community highlights.',
    version: 2,
    priority: 'medium',
    activity: [
      { id: 'a22', type: 'created', author: 'Marcus Chen', timestamp: '1w ago', description: 'Created news article' },
      { id: 'a23', type: 'reviewed', author: 'Elena Vasquez', timestamp: '4d ago', description: 'Approved for scheduling' },
      { id: 'a24', type: 'scheduled', author: 'Marcus Chen', timestamp: '3d ago', description: 'Scheduled for July 1' },
    ],
    versions: [
      { version: 1, author: 'Marcus Chen', timestamp: '1w ago', description: 'Initial draft' },
      { version: 2, author: 'Marcus Chen', timestamp: '3d ago', description: 'Finalized and scheduled' },
    ],
  },
  {
    id: 'dr-010',
    title: 'Featured Section: Dark Fantasy Marathon',
    slug: 'dark-fantasy-marathon-section',
    type: 'homepage-section',
    status: 'draft',
    author: 'Elena Vasquez',
    createdAt: '6h ago',
    updatedAt: '2h ago',
    visibility: 'public',
    language: 'en',
    tags: ['homepage', 'section', 'dark-fantasy'],
    excerpt: 'New homepage section featuring a curated dark fantasy anime marathon lineup.',
    version: 1,
    priority: 'medium',
    activity: [
      { id: 'a25', type: 'created', author: 'Elena Vasquez', timestamp: '6h ago', description: 'Created section draft' },
    ],
    versions: [
      { version: 1, author: 'Elena Vasquez', timestamp: '6h ago', description: 'Initial section layout' },
    ],
  },
  {
    id: 'dr-011',
    title: 'Vinland Saga — The Complete Retrospective',
    slug: 'vinland-saga-retrospective',
    type: 'editorial',
    status: 'in-review',
    author: 'Yuki Tanaka',
    createdAt: '1w ago',
    updatedAt: '2d ago',
    visibility: 'public',
    language: 'en',
    tags: ['editorial', 'vinland-saga', 'retrospective'],
    excerpt: 'A deep dive into Vinland Saga\'s thematic evolution across all seasons.',
    version: 2,
    priority: 'high',
    activity: [
      { id: 'a26', type: 'created', author: 'Yuki Tanaka', timestamp: '1w ago', description: 'Created editorial' },
      { id: 'a27', type: 'commented', author: 'Lena Müller', timestamp: '2d ago', description: 'Excellent analysis. Suggest adding more visual comparisons.' },
    ],
    versions: [
      { version: 1, author: 'Yuki Tanaka', timestamp: '1w ago', description: 'Initial editorial' },
      { version: 2, author: 'Yuki Tanaka', timestamp: '2d ago', description: 'Expanded thematic sections' },
    ],
  },
  {
    id: 'dr-012',
    title: 'Promotional Banner — New User Welcome',
    slug: 'new-user-welcome-banner',
    type: 'banner',
    status: 'published',
    author: 'Sofia Andersson',
    createdAt: '2w ago',
    updatedAt: '5d ago',
    publishDate: '2026-06-20',
    visibility: 'public',
    language: 'en',
    tags: ['banner', 'onboarding', 'welcome'],
    excerpt: 'Welcome banner for new users joining the platform.',
    version: 2,
    priority: 'medium',
    activity: [
      { id: 'a28', type: 'created', author: 'Sofia Andersson', timestamp: '2w ago', description: 'Created banner' },
      { id: 'a29', type: 'published', author: 'Sofia Andersson', timestamp: '5d ago', description: 'Published to production' },
    ],
    versions: [
      { version: 1, author: 'Sofia Andersson', timestamp: '2w ago', description: 'Initial design' },
      { version: 2, author: 'Sofia Andersson', timestamp: '5d ago', description: 'Published version' },
    ],
  },
  {
    id: 'dr-013',
    title: 'How to Build Your Anime Watchlist',
    slug: 'build-anime-watchlist-guide',
    type: 'news',
    status: 'draft',
    author: 'James Okafor',
    createdAt: '1d ago',
    updatedAt: '8h ago',
    visibility: 'public',
    language: 'en',
    tags: ['guide', 'watchlist', 'tutorial'],
    excerpt: 'Step-by-step guide for new users on creating and managing anime watchlists.',
    version: 1,
    priority: 'low',
    activity: [
      { id: 'a30', type: 'created', author: 'James Okafor', timestamp: '1d ago', description: 'Created guide draft' },
    ],
    versions: [
      { version: 1, author: 'James Okafor', timestamp: '1d ago', description: 'Initial guide outline' },
    ],
  },
  {
    id: 'dr-014',
    title: 'Crunchyroll Partnership Announcement',
    slug: 'crunchyroll-partnership',
    type: 'announcement',
    status: 'approved',
    author: 'Marcus Chen',
    createdAt: '3d ago',
    updatedAt: '1d ago',
    publishDate: '2026-07-03',
    visibility: 'public',
    language: 'en',
    tags: ['partnership', 'crunchyroll', 'announcement'],
    excerpt: 'Official announcement of the strategic partnership with Crunchyroll for content licensing.',
    version: 2,
    priority: 'urgent',
    activity: [
      { id: 'a31', type: 'created', author: 'Marcus Chen', timestamp: '3d ago', description: 'Created announcement' },
      { id: 'a32', type: 'reviewed', author: 'Elena Vasquez', timestamp: '1d ago', description: 'Approved by editorial team' },
    ],
    versions: [
      { version: 1, author: 'Marcus Chen', timestamp: '3d ago', description: 'Initial announcement' },
      { version: 2, author: 'Marcus Chen', timestamp: '1d ago', description: 'Finalized after review' },
    ],
  },
  {
    id: 'dr-015',
    title: 'Community Poll: Best Isekai of 2026',
    slug: 'best-isekai-2026-poll',
    type: 'community-post',
    status: 'ready',
    author: 'Ravi Patel',
    createdAt: '4d ago',
    updatedAt: '1d ago',
    publishDate: '2026-07-02',
    visibility: 'members',
    language: 'en',
    tags: ['community', 'poll', 'isekai'],
    excerpt: 'Community voting for the best isekai series of 2026 so far.',
    version: 2,
    priority: 'low',
    activity: [
      { id: 'a33', type: 'created', author: 'Ravi Patel', timestamp: '4d ago', description: 'Created poll' },
      { id: 'a34', type: 'reviewed', author: 'Lena Müller', timestamp: '1d ago', description: 'Approved for publication' },
    ],
    versions: [
      { version: 1, author: 'Ravi Patel', timestamp: '4d ago', description: 'Initial poll' },
      { version: 2, author: 'Ravi Patel', timestamp: '1d ago', description: 'Finalized nominees' },
    ],
  },
  {
    id: 'dr-016',
    title: 'French Subtitles — Summer Season Preview',
    slug: 'french-summer-preview',
    type: 'editorial',
    status: 'draft',
    author: 'Amélie Dubois',
    createdAt: '2d ago',
    updatedAt: '10h ago',
    visibility: 'public',
    language: 'fr',
    tags: ['french', 'seasonal', 'preview'],
    excerpt: 'Prévue d\'été 2026 : les anime les plus attendus par la communauté française.',
    version: 1,
    priority: 'medium',
    activity: [
      { id: 'a35', type: 'created', author: 'Amélie Dubois', timestamp: '2d ago', description: 'Créé la prévue en français' },
    ],
    versions: [
      { version: 1, author: 'Amélie Dubois', timestamp: '2d ago', description: 'Brouillon initial' },
    ],
  },
  {
    id: 'dr-017',
    title: 'Japanese Blog — Studio Aurora Interview',
    slug: 'studio-aurora-interview-jp',
    type: 'news',
    status: 'archived',
    author: 'Yuki Tanaka',
    createdAt: '3w ago',
    updatedAt: '1w ago',
    publishDate: '2026-06-10',
    visibility: 'public',
    language: 'ja',
    tags: ['japanese', 'interview', 'studio-aurora'],
    excerpt: 'スタジオオーロラへの独占インタビュー：今后の制作計画について語る。',
    version: 3,
    priority: 'medium',
    activity: [
      { id: 'a36', type: 'created', author: 'Yuki Tanaka', timestamp: '3w ago', description: 'Created interview article' },
      { id: 'a37', type: 'published', author: 'Yuki Tanaka', timestamp: '1w ago', description: 'Published and archived' },
    ],
    versions: [
      { version: 1, author: 'Yuki Tanaka', timestamp: '3w ago', description: 'Initial draft' },
      { version: 2, author: 'Yuki Tanaka', timestamp: '2w ago', description: 'Finalized translation' },
      { version: 3, author: 'Yuki Tanaka', timestamp: '1w ago', description: 'Published' },
    ],
  },
  {
    id: 'dr-018',
    title: 'Platform Changelog — v2.4 Release',
    slug: 'changelog-v2-4',
    type: 'announcement',
    status: 'ready',
    author: 'Marcus Chen',
    createdAt: '5d ago',
    updatedAt: '1d ago',
    publishDate: '2026-07-01',
    visibility: 'public',
    language: 'en',
    tags: ['changelog', 'release', 'v2.4'],
    excerpt: 'Complete changelog for platform version 2.4 including new features and bug fixes.',
    version: 2,
    priority: 'high',
    activity: [
      { id: 'a38', type: 'created', author: 'Marcus Chen', timestamp: '5d ago', description: 'Created changelog' },
      { id: 'a39', type: 'reviewed', author: 'James Okafor', timestamp: '1d ago', description: 'Technical review passed' },
    ],
    versions: [
      { version: 1, author: 'Marcus Chen', timestamp: '5d ago', description: 'Initial changelog' },
      { version: 2, author: 'Marcus Chen', timestamp: '1d ago', description: 'Technical review addressed' },
    ],
  },
  {
    id: 'dr-019',
    title: 'Holiday Collection: Winter Warmth Anime',
    slug: 'winter-warmth-collection',
    type: 'collection',
    status: 'archived',
    author: 'Elena Vasquez',
    createdAt: '4w ago',
    updatedAt: '2w ago',
    publishDate: '2026-01-15',
    visibility: 'public',
    language: 'en',
    tags: ['collection', 'winter', 'seasonal'],
    excerpt: 'Cozy winter anime collection featuring slice-of-life and heartwarming series.',
    version: 2,
    priority: 'low',
    activity: [
      { id: 'a40', type: 'created', author: 'Elena Vasquez', timestamp: '4w ago', description: 'Created collection' },
      { id: 'a41', type: 'published', author: 'Elena Vasquez', timestamp: '2w ago', description: 'Published and archived after season' },
    ],
    versions: [
      { version: 1, author: 'Elena Vasquez', timestamp: '4w ago', description: 'Initial collection' },
      { version: 2, author: 'Elena Vasquez', timestamp: '2w ago', description: 'Seasonal archive' },
    ],
  },
  {
    id: 'dr-020',
    title: 'Spanish Localization — Onboarding Flow',
    slug: 'spanish-onboarding-localization',
    type: 'landing-page',
    status: 'in-review',
    author: 'Sofia Andersson',
    createdAt: '6d ago',
    updatedAt: '2d ago',
    visibility: 'public',
    language: 'es',
    tags: ['localization', 'spanish', 'onboarding'],
    excerpt: 'Spanish localization of the new user onboarding landing page.',
    version: 2,
    priority: 'medium',
    activity: [
      { id: 'a42', type: 'created', author: 'Sofia Andersson', timestamp: '6d ago', description: 'Created Spanish onboarding page' },
      { id: 'a43', type: 'commented', author: 'Amélie Dubois', timestamp: '2d ago', description: 'Translation looks accurate. Minor UI adjustments needed.' },
    ],
    versions: [
      { version: 1, author: 'Sofia Andersson', timestamp: '6d ago', description: 'Initial Spanish translation' },
      { version: 2, author: 'Sofia Andersson', timestamp: '2d ago', description: 'UI adjustments' },
    ],
  },
  {
    id: 'dr-021',
    title: 'Mega Banner — 1000 Series Milestone',
    slug: '1000-series-milestone-banner',
    type: 'banner',
    status: 'scheduled',
    author: 'Sofia Andersson',
    createdAt: '1w ago',
    updatedAt: '3d ago',
    publishDate: '2026-07-10',
    visibility: 'public',
    language: 'en',
    tags: ['banner', 'milestone', 'celebration'],
    excerpt: 'Celebratory banner for reaching 1000 series in the catalog.',
    version: 3,
    priority: 'high',
    activity: [
      { id: 'a44', type: 'created', author: 'Sofia Andersson', timestamp: '1w ago', description: 'Created milestone banner' },
      { id: 'a45', type: 'reviewed', author: 'Marcus Chen', timestamp: '4d ago', description: 'Approved with minor copy tweaks' },
      { id: 'a46', type: 'scheduled', author: 'Sofia Andersson', timestamp: '3d ago', description: 'Scheduled for July 10' },
    ],
    versions: [
      { version: 1, author: 'Sofia Andersson', timestamp: '1w ago', description: 'Initial design' },
      { version: 2, author: 'Sofia Andersson', timestamp: '4d ago', description: 'Copy refinements' },
      { version: 3, author: 'Sofia Andersson', timestamp: '3d ago', description: 'Scheduled' },
    ],
  },
  {
    id: 'dr-022',
    title: 'Creator Spotlight: Independent Studio Guide',
    slug: 'independent-studio-guide',
    type: 'editorial',
    status: 'draft',
    author: 'James Okafor',
    createdAt: '3d ago',
    updatedAt: '5h ago',
    visibility: 'public',
    language: 'en',
    tags: ['editorial', 'studios', 'guide'],
    excerpt: 'A guide to independent anime studios and their contributions to the industry.',
    version: 1,
    priority: 'medium',
    activity: [
      { id: 'a47', type: 'created', author: 'James Okafor', timestamp: '3d ago', description: 'Created editorial outline' },
    ],
    versions: [
      { version: 1, author: 'James Okafor', timestamp: '3d ago', description: 'Initial outline' },
    ],
  },
  {
    id: 'dr-023',
    title: 'German Localization — Help Center',
    slug: 'german-help-center',
    type: 'landing-page',
    status: 'approved',
    author: 'Lena Müller',
    createdAt: '5d ago',
    updatedAt: '2d ago',
    publishDate: '2026-07-08',
    visibility: 'public',
    language: 'de',
    tags: ['localization', 'german', 'help-center'],
    excerpt: 'German localization of the platform help center landing page.',
    version: 2,
    priority: 'medium',
    activity: [
      { id: 'a48', type: 'created', author: 'Lena Müller', timestamp: '5d ago', description: 'Created German help center' },
      { id: 'a49', type: 'reviewed', author: 'Marcus Chen', timestamp: '2d ago', description: 'Translation reviewed and approved' },
    ],
    versions: [
      { version: 1, author: 'Lena Müller', timestamp: '5d ago', description: 'Initial translation' },
      { version: 2, author: 'Lena Müller', timestamp: '2d ago', description: 'Review addressed' },
    ],
  },
]

export function getDraftStats(drafts: DraftItem[]) {
  const total = drafts.length
  const byStatus: Record<DraftStatus, number> = {
    draft: 0,
    'in-review': 0,
    approved: 0,
    ready: 0,
    scheduled: 0,
    published: 0,
    archived: 0,
  }

  for (const d of drafts) {
    byStatus[d.status]++
  }

  const readyToPublish = byStatus['approved'] + byStatus['ready']
  const scheduled = byStatus['scheduled']

  return { total, byStatus, readyToPublish, scheduled }
}

export function getKanbanColumns(drafts: DraftItem[]) {
  return KANBAN_COLUMNS.map((status) => ({
    status,
    label: DRAFT_STATUS_LABEL[status],
    tone: DRAFT_STATUS_TONE[status],
    items: drafts.filter((d) => d.status === status),
  }))
}

export function parseTimeOffset(s: string) {
  const n = parseInt(s, 10)
  if (s.includes('m')) return n
  if (s.includes('h')) return n * 60
  if (s.includes('d')) return n * 1440
  if (s.includes('week')) return n * 10080
  if (s.includes('w')) return n * 10080
  return 99999
}
