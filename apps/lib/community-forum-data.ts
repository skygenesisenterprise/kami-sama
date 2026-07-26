/* ========================================================================== */
/*  Community Forum — Types & Mock Data                                        */
/* ========================================================================== */

export type PostType = 'discussion' | 'review' | 'recommendation' | 'announcement'
export type PostStatus = 'active' | 'hidden' | 'deleted'
export type UserRole = 'user' | 'moderator' | 'admin'
export type SortMode = 'recent' | 'popular' | 'unanswered'
export type ReactionType = 'like' | 'love' | 'insightful' | 'funny'

export interface CommunityUser {
  id: string
  username: string
  displayName: string
  avatar: string
  avatarUrl: string | null
  role: UserRole
  joinedAt: string
  reputation: number
  badges: Badge[]
  stats: UserStats
}

export interface Badge {
  id: string
  name: string
  icon: string
  color: string
  description: string
  earnedAt: string
}

export interface UserStats {
  posts: number
  comments: number
  reviews: number
  recommendations: number
  likesReceived: number
  reputation: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  postCount: number
  lastActivity: string | null
}

export interface Post {
  id: string
  type: PostType
  title: string
  slug: string
  content: string
  excerpt: string
  author: CommunityUser
  category: Category
  tags: string[]
  status: PostStatus
  createdAt: string
  updatedAt: string
  views: number
  commentCount: number
  reactions: ReactionCount[]
  totalReactions: number
  isPinned: boolean
  isLocked: boolean
  hasSpoilers: boolean
  contentLink: ContentLink | null
}

export interface ContentLink {
  type: 'anime' | 'movie' | 'series'
  title: string
  slug: string
  imageUrl: string | null
  year: number
}

export interface ReactionCount {
  type: ReactionType
  count: number
  userReacted: boolean
}

export interface Comment {
  id: string
  postId: string
  parentId: string | null
  author: CommunityUser
  content: string
  createdAt: string
  updatedAt: string | null
  reactions: ReactionCount[]
  totalReactions: number
  status: PostStatus
  hasSpoilers: boolean
  replies: Comment[]
}

export interface Review {
  id: string
  author: CommunityUser
  content: string
  rating: number
  hasSpoilers: boolean
  contentLink: ContentLink
  createdAt: string
  reactions: ReactionCount[]
  totalReactions: number
  commentCount: number
  helpfulCount: number
}

export interface Recommendation {
  id: string
  author: CommunityUser
  title: string
  reason: string
  fromContent: ContentLink
  toContent: ContentLink
  votes: number
  userVoted: boolean
  createdAt: string
  commentCount: number
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: CommunityUser
  createdAt: string
  isPinned: boolean
  reactions: ReactionCount[]
}

export interface CommunityOverview {
  totalMembers: number
  totalPosts: number
  totalComments: number
  totalReviews: number
  onlineNow: number
  newToday: number
  topContributor: CommunityUser
}

export interface CommunityData {
  overview: CommunityOverview
  categories: Category[]
  posts: Post[]
  reviews: Review[]
  recommendations: Recommendation[]
  announcements: Announcement[]
  users: CommunityUser[]
}

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const users: CommunityUser[] = [
  {
    id: 'u-001', username: 'akira_m', displayName: 'Akira M.', avatar: '', avatarUrl: null, role: 'user',
    joinedAt: '2024-01-15T08:00:00Z', reputation: 1240,
    badges: [
      { id: 'b-001', name: 'Early Supporter', icon: '🌟', color: '#f59e0b', description: 'Joined during beta', earnedAt: '2024-01-15T08:00:00Z' },
      { id: 'b-002', name: 'Reviewer', icon: '📝', color: '#8b5cf6', description: 'Published 10+ reviews', earnedAt: '2024-06-01T00:00:00Z' },
    ],
    stats: { posts: 45, comments: 234, reviews: 18, recommendations: 12, likesReceived: 567, reputation: 1240 },
  },
  {
    id: 'u-002', username: 'luna_watches', displayName: 'Luna', avatar: '', avatarUrl: null, role: 'moderator',
    joinedAt: '2023-12-01T10:00:00Z', reputation: 3450,
    badges: [
      { id: 'b-001', name: 'Early Supporter', icon: '🌟', color: '#f59e0b', description: 'Joined during beta', earnedAt: '2023-12-01T10:00:00Z' },
      { id: 'b-003', name: 'Moderator', icon: '🛡️', color: '#06b6d4', description: 'Community moderator', earnedAt: '2024-01-01T00:00:00Z' },
      { id: 'b-004', name: 'Top Contributor', icon: '🏆', color: '#ef4444', description: 'Top 1% contributor', earnedAt: '2024-03-01T00:00:00Z' },
    ],
    stats: { posts: 89, comments: 1234, reviews: 56, recommendations: 34, likesReceived: 2340, reputation: 3450 },
  },
  {
    id: 'u-003', username: 'cinema_nerd', displayName: 'CinemaNerd', avatar: '', avatarUrl: null, role: 'user',
    joinedAt: '2024-03-10T14:00:00Z', reputation: 890,
    badges: [
      { id: 'b-002', name: 'Reviewer', icon: '📝', color: '#8b5cf6', description: 'Published 10+ reviews', earnedAt: '2024-07-01T00:00:00Z' },
    ],
    stats: { posts: 23, comments: 156, reviews: 24, recommendations: 8, likesReceived: 345, reputation: 890 },
  },
  {
    id: 'u-004', username: 'sakura_fan', displayName: 'Sakura', avatar: '', avatarUrl: null, role: 'user',
    joinedAt: '2024-05-20T09:00:00Z', reputation: 560,
    badges: [
      { id: 'b-005', name: 'Explorer', icon: '🔍', color: '#10b981', description: 'Explored 100+ titles', earnedAt: '2024-08-01T00:00:00Z' },
    ],
    stats: { posts: 12, comments: 89, reviews: 8, recommendations: 15, likesReceived: 123, reputation: 560 },
  },
  {
    id: 'u-005', username: 'admin_kami', displayName: 'Kami-Sama', avatar: '', avatarUrl: null, role: 'admin',
    joinedAt: '2023-06-01T00:00:00Z', reputation: 9999,
    badges: [
      { id: 'b-006', name: 'Admin', icon: '👑', color: '#f59e0b', description: 'Platform administrator', earnedAt: '2023-06-01T00:00:00Z' },
    ],
    stats: { posts: 156, comments: 2340, reviews: 45, recommendations: 67, likesReceived: 8900, reputation: 9999 },
  },
]

const categories: Category[] = [
  { id: 'cat-001', name: 'Anime Discussion', slug: 'anime', description: 'Discuss your favorite anime series and movies', icon: '🎬', color: '#ef4444', postCount: 1234, lastActivity: new Date(Date.now() - 300_000).toISOString() },
  { id: 'cat-002', name: 'Films', slug: 'films', description: 'Movies, cinema, and film discussions', icon: '🎥', color: '#8b5cf6', postCount: 567, lastActivity: new Date(Date.now() - 600_000).toISOString() },
  { id: 'cat-003', name: 'Series', slug: 'series', description: 'TV series and web series discussions', icon: '📺', color: '#06b6d4', postCount: 890, lastActivity: new Date(Date.now() - 900_000).toISOString() },
  { id: 'cat-004', name: 'Manga', slug: 'manga', description: 'Manga and light novel discussions', icon: '📚', color: '#f59e0b', postCount: 456, lastActivity: new Date(Date.now() - 1200_000).toISOString() },
  { id: 'cat-005', name: 'Suggestions Kami-Sama', slug: 'suggestions', description: 'Feature requests and platform feedback', icon: '💡', color: '#10b981', postCount: 234, lastActivity: new Date(Date.now() - 1800_000).toISOString() },
  { id: 'cat-006', name: 'Général', slug: 'general', description: 'Off-topic and general chat', icon: '💬', color: '#6b7280', postCount: 1789, lastActivity: new Date(Date.now() - 120_000).toISOString() },
]

const posts: Post[] = [
  {
    id: 'p-001', type: 'discussion', title: 'Best anime of 2024 — Your top picks?',
    slug: 'best-anime-2024', content: 'With 2024 coming to an end, what were your favorite anime this year? Personally, I think Frieren and Dandadan were standout titles. The quality of animation has been incredible this year.',
    excerpt: 'With 2024 coming to an end, what were your favorite anime this year?',
    author: users[1], category: categories[0], tags: ['anime', '2024', 'favorites'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
    views: 2340, commentCount: 67,
    reactions: [{ type: 'like', count: 89, userReacted: false }, { type: 'love', count: 34, userReacted: false }],
    totalReactions: 123, isPinned: true, isLocked: false, hasSpoilers: false, contentLink: null,
  },
  {
    id: 'p-002', type: 'discussion', title: 'Frieren — Episode 28 discussion',
    slug: 'frieren-ep28', content: 'Just watched the latest episode and wow, the animation was breathtaking. The way they handled the magic system reveal was so well done. What did everyone think?',
    excerpt: 'Just watched the latest episode and wow, the animation was breathtaking.',
    author: users[0], category: categories[0], tags: ['frieren', 'episode', 'discussion'],
    status: 'active', createdAt: new Date(Date.now() - 300_000).toISOString(), updatedAt: new Date(Date.now() - 300_000).toISOString(),
    views: 456, commentCount: 23,
    reactions: [{ type: 'like', count: 34, userReacted: false }, { type: 'love', count: 12, userReacted: false }],
    totalReactions: 46, isPinned: false, isLocked: false, hasSpoilers: true,
    contentLink: { type: 'anime', title: 'Frieren: Beyond Journey\'s End', slug: 'frieren', imageUrl: null, year: 2023 },
  },
  {
    id: 'p-003', type: 'discussion', title: 'Which streaming service has the best anime library?',
    slug: 'best-anime-streaming', content: 'Comparing Crunchyroll, Netflix, and others for anime streaming. Which one do you think offers the best value and selection?',
    excerpt: 'Comparing streaming services for anime. Which offers the best value?',
    author: users[2], category: categories[0], tags: ['streaming', 'crunchyroll', 'netflix'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 5).toISOString(),
    views: 1890, commentCount: 45,
    reactions: [{ type: 'like', count: 56, userReacted: false }, { type: 'insightful', count: 23, userReacted: false }],
    totalReactions: 79, isPinned: false, isLocked: false, hasSpoilers: false, contentLink: null,
  },
  {
    id: 'p-004', type: 'discussion', title: 'Dandadan — The new shonen sensation?',
    slug: 'dandadan-discussion', content: 'Dandadan has taken the anime world by storm. The animation by Science SARU is phenomenal. Let\'s discuss what makes this series so special.',
    excerpt: 'Dandadan has taken the anime world by storm. The animation is phenomenal.',
    author: users[3], category: categories[0], tags: ['dandadan', 'shonen', 'animation'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000).toISOString(), updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    views: 890, commentCount: 34,
    reactions: [{ type: 'like', count: 45, userReacted: false }, { type: 'love', count: 23, userReacted: false }],
    totalReactions: 68, isPinned: false, isLocked: false, hasSpoilers: false, contentLink: { type: 'anime', title: 'Dandadan', slug: 'dandadan', imageUrl: null, year: 2024 },
  },
  {
    id: 'p-005', type: 'discussion', title: 'Netflix vs Crunchyroll: Who wins for movies?',
    slug: 'netflix-vs-crunchyroll-movies', content: 'When it comes to anime films specifically, which platform do you prefer? Netflix has some exclusives but Crunchyroll has the Simulcast catalog.',
    excerpt: 'Which platform is better for anime films specifically?',
    author: users[0], category: categories[1], tags: ['movies', 'netflix', 'crunchyroll', 'comparison'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
    views: 670, commentCount: 28,
    reactions: [{ type: 'like', count: 32, userReacted: false }, { type: 'insightful', count: 15, userReacted: false }],
    totalReactions: 47, isPinned: false, isLocked: false, hasSpoilers: false, contentLink: null,
  },
  {
    id: 'p-006', type: 'discussion', title: 'Squid Game S2 — Worth the wait?',
    slug: 'squid-game-s2', content: 'After years of waiting, Squid Game Season 2 is finally here. Without major spoilers, what are your initial impressions?',
    excerpt: 'After years of waiting, Squid Game Season 2 is finally here.',
    author: users[2], category: categories[2], tags: ['squid-game', 'netflix', 'series'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 4).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 4).toISOString(),
    views: 1560, commentCount: 56,
    reactions: [{ type: 'like', count: 67, userReacted: false }, { type: 'love', count: 28, userReacted: false }],
    totalReactions: 95, isPinned: false, isLocked: false, hasSpoilers: true, contentLink: { type: 'series', title: 'Squid Game', slug: 'squid-game', imageUrl: null, year: 2024 },
  },
  {
    id: 'p-007', type: 'discussion', title: 'Best manga to read while waiting for anime adaptation',
    slug: 'manga-before-anime', content: 'What manga are you currently reading that you think deserve an anime adaptation? Or ones where the manga is ahead of the anime?',
    excerpt: 'What manga deserve an anime adaptation? Or are ahead of the anime?',
    author: users[3], category: categories[3], tags: ['manga', 'adaptation', 'recommendation'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 6).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 6).toISOString(),
    views: 780, commentCount: 19,
    reactions: [{ type: 'like', count: 28, userReacted: false }, { type: 'insightful', count: 11, userReacted: false }],
    totalReactions: 39, isPinned: false, isLocked: false, hasSpoilers: false, contentLink: null,
  },
  {
    id: 'p-008', type: 'discussion', title: 'Add a dark mode toggle to the mobile app',
    slug: 'dark-mode-mobile', content: 'It would be great to have a system-level dark mode toggle for the mobile app instead of following the device setting.',
    excerpt: 'A dark mode toggle for the mobile app would be great.',
    author: users[0], category: categories[4], tags: ['feature', 'mobile', 'dark-mode'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 7).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 7).toISOString(),
    views: 340, commentCount: 12,
    reactions: [{ type: 'like', count: 45, userReacted: false }],
    totalReactions: 45, isPinned: false, isLocked: false, hasSpoilers: false, contentLink: null,
  },
  {
    id: 'p-009', type: 'discussion', title: 'What are you watching this weekend?',
    slug: 'weekend-watch', content: 'Share your weekend watchlist! I\'m planning to catch up on Frieren and maybe start Dandadan.',
    excerpt: 'Share your weekend watchlist!',
    author: users[4], category: categories[5], tags: ['casual', 'weekend', 'watchlist'],
    status: 'active', createdAt: new Date(Date.now() - 120_000).toISOString(), updatedAt: new Date(Date.now() - 120_000).toISOString(),
    views: 123, commentCount: 8,
    reactions: [{ type: 'like', count: 12, userReacted: false }, { type: 'funny', count: 5, userReacted: false }],
    totalReactions: 17, isPinned: false, isLocked: false, hasSpoilers: false, contentLink: null,
  },
  {
    id: 'p-010', type: 'announcement', title: 'Kami-Sama v2.5 — New community features!',
    slug: 'v2-5-announcement', content: 'We\'re excited to announce v2.5 with new community features including reviews, recommendations, and a revamped forum. Check out what\'s new!',
    excerpt: 'Kami-Sama v2.5 brings reviews, recommendations, and a revamped forum.',
    author: users[4], category: categories[4], tags: ['announcement', 'update', 'community'],
    status: 'active', createdAt: new Date(Date.now() - 86400_000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400_000 * 10).toISOString(),
    views: 4560, commentCount: 89,
    reactions: [{ type: 'love', count: 156, userReacted: false }, { type: 'like', count: 234, userReacted: false }],
    totalReactions: 390, isPinned: true, isLocked: false, hasSpoilers: false, contentLink: null,
  },
]

const reviews: Review[] = [
  {
    id: 'rv-001', author: users[0], content: 'Frieren is a masterpiece of storytelling. The way it explores themes of mortality, time, and connection through the lens of an immortal elf is nothing short of brilliant. The animation by Madhouse is stunning, with every frame feeling like a painting. The character development, especially for Frieren herself, is incredibly nuanced. This is anime at its finest.',
    rating: 9.5, hasSpoilers: false, createdAt: new Date(Date.now() - 86400_000 * 15).toISOString(),
    contentLink: { type: 'anime', title: 'Frieren: Beyond Journey\'s End', slug: 'frieren', imageUrl: null, year: 2023 },
    reactions: [{ type: 'like', count: 123, userReacted: false }, { type: 'insightful', count: 45, userReacted: false }],
    totalReactions: 168, commentCount: 34, helpfulCount: 89,
  },
  {
    id: 'rv-002', author: users[2], content: 'Dandadan delivers a fresh take on the shonen genre with its wild blend of supernatural, sci-fi, and comedy. Science SARU\'s animation is absolutely insane — the action sequences are some of the best I\'ve seen in recent years. The chemistry between Okarun and Momo is fantastic.',
    rating: 9.0, hasSpoilers: false, createdAt: new Date(Date.now() - 86400_000 * 8).toISOString(),
    contentLink: { type: 'anime', title: 'Dandadan', slug: 'dandadan', imageUrl: null, year: 2024 },
    reactions: [{ type: 'like', count: 78, userReacted: false }, { type: 'love', count: 34, userReacted: false }],
    totalReactions: 112, commentCount: 21, helpfulCount: 56,
  },
  {
    id: 'rv-003', author: users[1], content: 'Squid Game Season 2 manages to expand the world while keeping the tension high. The new games are creative and the social commentary remains sharp. Some pacing issues in the middle, but the finale makes up for it. Highly recommend.',
    rating: 8.5, hasSpoilers: true, createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
    contentLink: { type: 'series', title: 'Squid Game', slug: 'squid-game', imageUrl: null, year: 2024 },
    reactions: [{ type: 'like', count: 56, userReacted: false }, { type: 'insightful', count: 23, userReacted: false }],
    totalReactions: 79, commentCount: 18, helpfulCount: 45,
  },
  {
    id: 'rv-004', author: users[3], content: 'One Piece Film: Red delivers spectacular musical sequences and emotional depth. Uta is a compelling character and the animation during the concert scenes is breathtaking. The plot has some predictable elements but the execution is top-notch.',
    rating: 8.0, hasSpoilers: false, createdAt: new Date(Date.now() - 86400_000 * 20).toISOString(),
    contentLink: { type: 'movie', title: 'One Piece Film: Red', slug: 'one-piece-film-red', imageUrl: null, year: 2022 },
    reactions: [{ type: 'like', count: 45, userReacted: false }, { type: 'love', count: 19, userReacted: false }],
    totalReactions: 64, commentCount: 15, helpfulCount: 34,
  },
  {
    id: 'rv-005', author: users[0], content: 'Jujutsu Kaisen Season 2 raises the bar with the Hidden Inventory arc. MAPPA delivered incredible animation, especially during the Gojo vs Toji fight. The emotional weight of Geto\'s descent is perfectly handled. A must-watch for any anime fan.',
    rating: 9.2, hasSpoilers: true, createdAt: new Date(Date.now() - 86400_000 * 30).toISOString(),
    contentLink: { type: 'anime', title: 'Jujutsu Kaisen Season 2', slug: 'jujutsu-kaisen-s2', imageUrl: null, year: 2023 },
    reactions: [{ type: 'like', count: 89, userReacted: false }, { type: 'love', count: 45, userReacted: false }],
    totalReactions: 134, commentCount: 28, helpfulCount: 67,
  },
]

const recommendations: Recommendation[] = [
  {
    id: 'rec-001', author: users[0], title: 'If you love Frieren, watch Mushishi',
    reason: 'Both series share a contemplative, episodic structure with stunning natural settings. Mushishi explores the relationship between humans and supernatural creatures in a similarly peaceful yet profound way.',
    fromContent: { type: 'anime', title: 'Frieren: Beyond Journey\'s End', slug: 'frieren', imageUrl: null, year: 2023 },
    toContent: { type: 'anime', title: 'Mushishi', slug: 'mushishi', imageUrl: null, year: 2005 },
    votes: 234, userVoted: false, createdAt: new Date(Date.now() - 86400_000 * 12).toISOString(), commentCount: 23,
  },
  {
    id: 'rec-002', author: users[2], title: 'If you love Attack on Titan, read Berserk',
    reason: 'Berserk\'s dark fantasy world, complex characters, and epic scope directly inspired Attack on Titan. The Golden Age arc is a masterpiece of manga storytelling.',
    fromContent: { type: 'anime', title: 'Attack on Titan', slug: 'attack-on-titan', imageUrl: null, year: 2013 },
    toContent: { type: 'anime', title: 'Berserk', slug: 'berserk', imageUrl: null, year: 1997 },
    votes: 189, userVoted: false, createdAt: new Date(Date.now() - 86400_000 * 25).toISOString(), commentCount: 34,
  },
  {
    id: 'rec-003', author: users[1], title: 'If you love Squid Game, watch Alice in Borderland',
    reason: 'Both feature deadly games with social commentary, but Alice in Borderland leans more into the survival/thriller aspect with interesting game mechanics.',
    fromContent: { type: 'series', title: 'Squid Game', slug: 'squid-game', imageUrl: null, year: 2021 },
    toContent: { type: 'series', title: 'Alice in Borderland', slug: 'alice-in-borderland', imageUrl: null, year: 2020 },
    votes: 156, userVoted: false, createdAt: new Date(Date.now() - 86400_000 * 18).toISOString(), commentCount: 19,
  },
  {
    id: 'rec-004', author: users[3], title: 'If you love Demon Slayer, watch Samurai Champloo',
    reason: 'Both feature incredible sword-fighting animation and blend traditional Japanese culture with modern style. Champloo\'s hip-hop influence makes it unique.',
    fromContent: { type: 'anime', title: 'Demon Slayer', slug: 'demon-slayer', imageUrl: null, year: 2019 },
    toContent: { type: 'anime', title: 'Samurai Champloo', slug: 'samurai-champloo', imageUrl: null, year: 2004 },
    votes: 112, userVoted: false, createdAt: new Date(Date.now() - 86400_000 * 35).toISOString(), commentCount: 15,
  },
  {
    id: 'rec-005', author: users[0], title: 'If you love Death Note, watch Monster',
    reason: 'Monster is the psychological thriller masterpiece that Death Note fans will love. It\'s a slower burn but the cat-and-mouse dynamic between Tenma and Johan is unforgettable.',
    fromContent: { type: 'anime', title: 'Death Note', slug: 'death-note', imageUrl: null, year: 2006 },
    toContent: { type: 'anime', title: 'Monster', slug: 'monster', imageUrl: null, year: 2004 },
    votes: 98, userVoted: false, createdAt: new Date(Date.now() - 86400_000 * 40).toISOString(), commentCount: 12,
  },
]

const announcements: Announcement[] = [
  {
    id: 'ann-001', title: '🎉 Welcome to the Kami-Sama Community!',
    content: 'We\'re thrilled to launch our community platform. Join discussions, share reviews, and connect with fellow anime and media enthusiasts. Let\'s build something amazing together!',
    author: users[4], createdAt: new Date(Date.now() - 86400_000 * 30).toISOString(), isPinned: true,
    reactions: [{ type: 'love', count: 234, userReacted: false }, { type: 'like', count: 456, userReacted: false }],
  },
  {
    id: 'ann-002', title: '📋 Community Guidelines Updated',
    content: 'We\'ve updated our community guidelines to better reflect our values. Please take a moment to review the changes, especially around spoiler tagging and respectful discourse.',
    author: users[4], createdAt: new Date(Date.now() - 86400_000 * 15).toISOString(), isPinned: true,
    reactions: [{ type: 'like', count: 89, userReacted: false }],
  },
]

export const communityData: CommunityData = {
  overview: {
    totalMembers: 14832,
    totalPosts: posts.length,
    totalComments: 5234,
    totalReviews: reviews.length,
    onlineNow: 342,
    newToday: 23,
    topContributor: users[1],
  },
  categories,
  posts,
  reviews,
  recommendations,
  announcements,
  users,
}
