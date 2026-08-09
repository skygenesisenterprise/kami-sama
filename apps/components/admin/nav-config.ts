import {
  Activity,
  BarChart3,
  Blocks,
  Bot,
  Clock,
  Cloud,
  Code2,
  Cog,
  Eye,
  FileClock,
  Flag,
  Flame,
  FolderOpen,
  Gauge,
  Globe,
  HardDrive,
  Home,
  Image,
  Import,
  Key,
  Library,
  ListChecks,
  Lock,
  Mail,
  MessageSquare,
  MonitorPlay,
  Puzzle,
  ScrollText,
  Server,
  Shield,
  ShieldAlert,
  Smartphone,
  Star,
  Tags,
  Timer,
  Users,
  Webhook,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon?: LucideIcon
  badge?: string
}

export type NavGroup = {
  title: string
  icon: LucideIcon
  href?: string
  items: NavItem[]
}

export const navHome: NavItem = { title: 'Home', href: '/dash', icon: Home }

export const navGroups: NavGroup[] = [
  {
    title: 'Catalog',
    icon: Library,
    items: [
      { title: 'Contenu', href: '/dash/catalog/content', icon: MonitorPlay },
      { title: 'Collections', href: '/dash/catalog/collections', icon: FolderOpen },
      { title: 'Genres', href: '/dash/catalog/genres', icon: Blocks },
      { title: 'Tags', href: '/dash/catalog/tags', icon: Tags },
    ],
  },
  {
    title: 'Sources',
    icon: Import,
    items: [
      { title: 'TMDB', href: '/dash/sources/tmdb', icon: Globe },
      { title: 'AniList', href: '/dash/sources/anilist', icon: Globe },
      { title: 'MyAnimeList', href: '/dash/sources/myanimelist', icon: Globe },
      { title: 'TVDB', href: '/dash/sources/tvdb', icon: Globe },
      { title: 'FanArt', href: '/dash/sources/fanart', icon: Image },
      { title: 'Plex', href: '/dash/sources/plex', icon: MonitorPlay },
      { title: 'Jellyfin', href: '/dash/sources/jellyfin', icon: MonitorPlay },
    ],
  },
  {
    title: 'Automation',
    icon: Workflow,
    items: [
      { title: 'Workflows', href: '/dash/automation/workflows', icon: Workflow },
      { title: 'Scheduled Jobs', href: '/dash/automation/scheduled', icon: Timer },
      { title: 'Workers', href: '/dash/automation/workers', icon: Bot },
      { title: 'Queues', href: '/dash/automation/queues', icon: ListChecks },
      { title: 'Webhooks', href: '/dash/automation/webhooks', icon: Webhook },
    ],
  },
  {
    title: 'Operations',
    icon: Server,
    items: [
      { title: 'Infrastructure', href: '/dash/operations/infra', icon: Server },
      { title: 'Storage', href: '/dash/operations/storage', icon: HardDrive },
      { title: 'Streaming Nodes', href: '/dash/operations/streaming-nodes', icon: Cloud },
      { title: 'Encoding', href: '/dash/operations/encoding', icon: Cog },
      { title: 'Logs', href: '/dash/operations/logs', icon: ScrollText },
      { title: 'Monitoring', href: '/dash/operations/monitoring', icon: Gauge },
      { title: 'Health Checks', href: '/dash/operations/health-checks', icon: Activity },
    ],
  },
  {
    title: 'Community',
    icon: Users,
    items: [
      { title: 'Users', href: '/dash/community/users', icon: Users },
      { title: 'Roles', href: '/dash/community/role', icon: Shield },
      { title: 'Permissions', href: '/dash/community/permissions', icon: Lock },
      { title: 'Reviews', href: '/dash/community/reviews', icon: Star },
      { title: 'Reports', href: '/dash/community/reports', icon: ShieldAlert, badge: '12' },
      { title: 'Comments', href: '/dash/community/comments', icon: MessageSquare },
      { title: 'Sessions', href: '/dash/community/sessions', icon: Smartphone },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    items: [
      { title: 'Views', href: '/dash/analytics/view', icon: Eye },
      { title: 'Watch Time', href: '/dash/analytics/watch-time', icon: Clock },
      { title: 'Devices', href: '/dash/analytics/devices', icon: Smartphone },
      { title: 'Countries', href: '/dash/analytics/countries', icon: Globe },
      { title: 'Popularity', href: '/dash/analytics/popularity', icon: Flame },
    ],
  },
  {
    title: 'Developer',
    icon: Code2,
    items: [
      { title: 'API Keys', href: '/dash/developer/api-keys', icon: Key },
      { title: 'OAuth', href: '/dash/developer/oauth', icon: Lock },
      { title: 'Webhooks', href: '/dash/developer/webhooks', icon: Webhook },
      { title: 'SDK', href: '/dash/developer/sdk', icon: Puzzle },
      { title: 'Audit Logs', href: '/dash/developer/audit-logs', icon: FileClock },
    ],
  },
  {
    title: 'Platform',
    icon: Cog,
    items: [
      { title: 'Overview', href: '/dash/settings/overview', icon: Cog },
      { title: 'Feature Flags', href: '/dash/settings/feature-flag', icon: Flag },
      { title: 'Email', href: '/dash/settings/email', icon: Mail },
      { title: 'Security', href: '/dash/settings/security', icon: Shield },
    ],
  },
]

/** Flat list of every route for command palette + breadcrumbs. */
export const allRoutes: Array<NavItem & { group: string }> = [
  { ...navHome, group: 'General' },
  ...navGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.title })),
  ),
]

export function findRoute(pathname: string) {
  return allRoutes.find((r) => r.href === pathname)
}

export function findGroup(pathname: string) {
  return navGroups.find((g) => g.items.some((i) => pathname.startsWith(i.href)))
}
