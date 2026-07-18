import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FileText,
  Film,
  Users,
  Calendar,
  ChartColumn,
  LifeBuoy,
  Settings,
  Server,
  Clapperboard,
  Tags,
  BookOpen,
  Tv,
  Popcorn,
  Mic,
  Palette,
  Building2,
  Languages,
  BookMarked,
  Video,
  Play,
  Music,
  Captions,
  Image,
  Upload,
  HardDrive,
  Scissors,
  Globe,
  MessageSquare,
  Shield,
  UserCheck,
  Star,
  Eye,
  Flag,
  Bookmark,
  Lock,
  Bell,
  CalendarCheck,
  Radio,
  Sparkles,
  CalendarClock,
  BarChart3,
  MonitorSmartphone,
  Map,
  TrendingUp,
  Clock,
  AlertTriangle,
  Phone,
  HelpCircle,
  FileWarning,
  Ticket,
  Database,
  Cog,
  Gauge,
  FileSearch,
  Layers,
  Mail,
  Puzzle,
  SearchCode,
  ServerCrash,
  Wifi,
  HardDriveIcon,
  Paintbrush,
  Link,
  Wrench,
} from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: string
  children?: NavChildItem[]
}

export type NavChildItem = {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dash' },
    ],
  },
  {
    label: 'Contenu',
    items: [
      {
        id: 'content', label: 'Content', icon: FileText, href: '/dash/content',
        children: [
          { id: 'content-anime', label: 'Anime', icon: Clapperboard, href: '/dash/content/anime' },
          { id: 'content-movies', label: 'Movies', icon: Film, href: '/dash/content/movies' },
          { id: 'content-series', label: 'Series', icon: Tv, href: '/dash/content/series' },
          { id: 'content-library', label: 'Library', icon: BookOpen, href: '/dash/content/library' },
          { id: 'content-categories', label: 'Categories', icon: Palette, href: '/dash/content/categories' },
          { id: 'content-genres', label: 'Genres', icon: Popcorn, href: '/dash/content/genres' },
          { id: 'content-tags', label: 'Tags', icon: Tags, href: '/dash/content/tags' },
          { id: 'content-studios', label: 'Studios', icon: Building2, href: '/dash/content/studios' },
          { id: 'content-licences', label: 'Licences', icon: BookMarked, href: '/dash/content/licences' },
          { id: 'content-voices', label: 'Voices', icon: Languages, href: '/dash/content/voices' },
          { id: 'content-lives', label: 'Lives', icon: Mic, href: '/dash/content/lives' },
        ],
      },
      {
        id: 'media', label: 'Media', icon: Film, href: '/dash/media',
        children: [
          { id: 'media-videos', label: 'Videos', icon: Video, href: '/dash/media/videos' },
          { id: 'media-trailers', label: 'Trailers', icon: Play, href: '/dash/media/trailers' },
          { id: 'media-audio', label: 'Audio', icon: Music, href: '/dash/media/audio' },
          { id: 'media-subtitles', label: 'Subtitles', icon: Captions, href: '/dash/media/subtitles' },
          { id: 'media-posters', label: 'Posters', icon: Image, href: '/dash/media/posters' },
          { id: 'media-thumbnails', label: 'Thumbnails', icon: HardDrive, href: '/dash/media/thumbnails' },
          { id: 'media-uploads', label: 'Uploads', icon: Upload, href: '/dash/media/uploads' },
          { id: 'media-encoding', label: 'Encoding', icon: Scissors, href: '/dash/media/encoding' },
        ],
      },
    ],
  },
  {
    label: 'Engagement',
    items: [
      {
        id: 'community', label: 'Community', icon: Users, href: '/dash/community',
        children: [
          { id: 'community-users', label: 'Users', icon: Users, href: '/dash/community/users' },
          { id: 'community-profiles', label: 'Profiles', icon: UserCheck, href: '/dash/community/profiles' },
          { id: 'community-roles', label: 'Roles', icon: Shield, href: '/dash/community/roles' },
          { id: 'community-comments', label: 'Comments', icon: MessageSquare, href: '/dash/community/comments' },
          { id: 'community-reviews', label: 'Reviews', icon: Star, href: '/dash/community/reviews' },
          { id: 'community-reports', label: 'Reports', icon: Flag, href: '/dash/community/reports' },
          { id: 'community-moderations', label: 'Moderations', icon: Eye, href: '/dash/community/moderations' },
          { id: 'community-watchlists', label: 'Watchlists', icon: Bookmark, href: '/dash/community/watchlists' },
          { id: 'community-permissions', label: 'Permissions', icon: Lock, href: '/dash/community/permissions' },
        ],
      },
      {
        id: 'scheduling', label: 'Scheduling', icon: Calendar, href: '/dash/scheduling',
        children: [
          { id: 'scheduling-calendar', label: 'Calendar', icon: CalendarCheck, href: '/dash/scheduling/calendar' },
          { id: 'scheduling-releases', label: 'Releases', icon: Sparkles, href: '/dash/scheduling/releases' },
          { id: 'scheduling-premieres', label: 'Premieres', icon: CalendarClock, href: '/dash/scheduling/premieres' },
          { id: 'scheduling-simulcasts', label: 'Simulcasts', icon: Radio, href: '/dash/scheduling/simulcasts' },
          { id: 'scheduling-notifications', label: 'Notifications', icon: Bell, href: '/dash/scheduling/notifications' },
        ],
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        id: 'analytics', label: 'Analytics', icon: ChartColumn, href: '/dash/analytics',
        children: [
          { id: 'analytics-overview', label: 'Overview', icon: BarChart3, href: '/dash/analytics/overview' },
          { id: 'analytics-watch-time', label: 'Watch Time', icon: Clock, href: '/dash/analytics/watch-time' },
          { id: 'analytics-devices', label: 'Devices', icon: MonitorSmartphone, href: '/dash/analytics/devices' },
          { id: 'analytics-geography', label: 'Geography', icon: Map, href: '/dash/analytics/geography' },
          { id: 'analytics-popular', label: 'Popular', icon: TrendingUp, href: '/dash/analytics/popular' },
          { id: 'analytics-actives', label: 'Active Users', icon: Users, href: '/dash/analytics/actives' },
        ],
      },
      {
        id: 'support', label: 'Support', icon: LifeBuoy, href: '/dash/support',
        children: [
          { id: 'support-tickets', label: 'Tickets', icon: Ticket, href: '/dash/support/tickets' },
          { id: 'support-contact', label: 'Contact', icon: Phone, href: '/dash/support/contact' },
          { id: 'support-faq', label: 'FAQ', icon: HelpCircle, href: '/dash/support/faq' },
          { id: 'support-abuse', label: 'Abuse Reports', icon: AlertTriangle, href: '/dash/support/abuse' },
          { id: 'support-logs', label: 'Logs', icon: FileWarning, href: '/dash/support/logs' },
        ],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        id: 'system', label: 'System', icon: Server, href: '/dash/system',
        children: [
          { id: 'system-health', label: 'Health', icon: Gauge, href: '/dash/system/health' },
          { id: 'system-logs', label: 'Logs', icon: FileSearch, href: '/dash/system/logs' },
          { id: 'system-queue', label: 'Queue', icon: Layers, href: '/dash/system/queue' },
          { id: 'system-cache', label: 'Cache', icon: HardDriveIcon, href: '/dash/system/cache' },
          { id: 'system-search', label: 'Search', icon: SearchCode, href: '/dash/system/search' },
          { id: 'system-background', label: 'Background Jobs', icon: ServerCrash, href: '/dash/system/backroung' },
        ],
      },
      {
        id: 'settings', label: 'Settings', icon: Settings, href: '/dash/settings',
        children: [
          { id: 'settings-general', label: 'General', icon: Cog, href: '/dash/settings' },
          { id: 'settings-security', label: 'Security', icon: Shield, href: '/dash/settings/security' },
          { id: 'settings-branding', label: 'Branding', icon: Paintbrush, href: '/dash/settings/branding' },
          { id: 'settings-email', label: 'Email', icon: Mail, href: '/dash/settings/email' },
          { id: 'settings-seo', label: 'SEO', icon: SearchCode, href: '/dash/settings/seo' },
          { id: 'settings-storage', label: 'Storage', icon: Database, href: '/dash/settings/storage' },
          { id: 'settings-cdn', label: 'CDN', icon: Globe, href: '/dash/settings/cdn' },
          { id: 'settings-domains', label: 'Domains', icon: Link, href: '/dash/settings/domains' },
          { id: 'settings-apis', label: 'APIs', icon: Puzzle, href: '/dash/settings/apis' },
          { id: 'settings-oauth', label: 'OAuth', icon: Lock, href: '/dash/settings/oauth' },
          { id: 'settings-integrations', label: 'Integrations', icon: Wifi, href: '/dash/settings/integrations' },
          { id: 'settings-maintenance', label: 'Maintenance', icon: Wrench, href: '/dash/settings/maintenance' },
        ],
      },
    ],
  },
]

export const navItemsFlat: NavItem[] = navGroups.flatMap((group) => group.items)
