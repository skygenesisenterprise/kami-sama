'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  Compass,
  CreditCard,
  Film,
  History,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/kami/user-avatar'
import { SearchBar } from '@/components/kami/search-bar'
import { Logo } from '@/components/kami/logo'
import { USERS } from '@/lib/mock-data'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const t = useTranslations('Public.header')
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const locale = pathname.split('/')[1] || 'fr'
  const homeHref = `/${locale}/discover`

  // Mobile menu — mirrors the 5 desktop items
  const NAV_LINKS = [
    { href: '/videos/new', label: t('navNew'), icon: Sparkles },
    { href: '/videos/popular', label: t('navPopular'), icon: TrendingUp },
    { href: '/simulcast', label: t('navSimulcast'), icon: Calendar },
    { href: '/explore', label: t('navExplorer'), icon: Compass },
    { href: `/${locale}/calendar`, label: t('navCalendar'), icon: Calendar },
    { href: `/${locale}/community`, label: t('navCommunity'), icon: Users },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  /* Explorer dropdown — new 4-column architecture (Découvrir / Contenu / Collections / Recherche). */
  const EXPLORER_DISCOVER = [
    { key: 'discoverNew', href: '/explore?sort=newest' },
    { key: 'navPopular', href: '/explore?sort=popular' },
    { key: 'discoverTrending', href: '/explore?status=airing' },
    { key: 'discoverUpcoming', href: '/explore?status=upcoming' },
  ]

  const EXPLORER_CONTENT = [
    { key: 'formatAnime', href: '/explore?format=anime' },
    { key: 'formatFilms', href: '/explore?format=movie' },
    { key: 'formatSeries', href: '/explore?format=tv' },
    { key: 'formatOva', href: '/explore?format=ova' },
  ]

  const EXPLORER_COLLECTIONS_LIST = [
    { key: 'collectionKami', href: '/explore?collection=kami' },
    { key: 'collectionClassics', href: '/explore?collection=classics' },
    { key: 'collectionCommunity', href: '/explore?collection=community' },
    { key: 'collectionSeasons', href: '/explore?collection=seasons' },
  ]

  const EXPLORER_SEARCH = [
    { key: 'browseAllAZ', href: '/explore?sort=title' },
    { key: 'explorerGenres', href: '/explore?by=genre' },
    { key: 'explorerStudios', href: '/explore?by=studio' },
    { key: 'explorerYears', href: '/explore?by=year' },
  ]


  return (
    <header
      className={cn(
        'sticky top-0 z-60 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/90 shadow-lg shadow-black/20 backdrop-blur-xl'
          : 'bg-background/70 backdrop-blur-md',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 md:hidden"
              aria-label={t('openMenu')}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-border/40 p-0">
            <SheetTitle className="sr-only">{t('navigation')}</SheetTitle>
            {/* Mobile header */}
            <div className="flex h-14 items-center border-b border-border/40 px-4">
              <Logo href={homeHref} />
            </div>
            <nav className="flex flex-col gap-0.5 p-3">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                )
              })}
              <div className="mt-3 border-t border-border/40 pt-3">
                <Link
                  href="/library"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Library className="size-4" />
                  {t('navLibrary')}
                </Link>
              </div>
            </nav>
            <div className="absolute bottom-0 inset-x-0 border-t border-border/40 p-4">
              <Link
                href="/library"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <UserAvatar user={USERS.me} className="size-7" />
                <div className="flex flex-col">
                  <span>{USERS.me.displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    @{USERS.me.username}
                  </span>
                </div>
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Logo href={homeHref} className="hidden sm:flex" />
          <Logo href={homeHref} className="sm:hidden [&>span:last-child]:hidden" />
        </div>

        {/* Desktop nav — single bar, 5 items, no duplicate menu */}
        <nav className="ml-6 hidden items-center gap-0.5 md:flex">
          <DesktopNavLink
            href={`/${locale}/videos/new`}
            active={pathname.startsWith('/videos/new')}
          >
            {t('navNew')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/videos/popular`}
            active={pathname.startsWith('/videos/popular')}
          >
            {t('navPopular')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/simulcast`}
            active={pathname.startsWith('/simulcast')}
          >
            {t('navSimulcast')}
          </DesktopNavLink>
          {/* Explorer — dropdown with genres only (compact) */}
          <DropdownMenu open={explorerOpen} onOpenChange={setExplorerOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  explorerOpen
                    ? 'text-white'
                    : 'text-white/70 hover:text-white',
                )}
                aria-expanded={explorerOpen}
              >
                {t('navExplorer')}
                <ChevronDown
                  className={cn(
                    'size-3.5 transition-transform duration-200',
                    explorerOpen && 'rotate-180',
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <AnimatedDropdownContent
              open={explorerOpen}
              align="start"
              className="w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-y-auto border-white/10 bg-background/95 p-0 text-ink shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
                <div className="grid grid-cols-3 divide-x divide-white/10">
                {/* Col 1 — Contenu */} 
                <div className="min-w-0 px-4 py-5">
                  <SectionHeader icon={Film}>{t('explorerContent')}</SectionHeader>
                  <div className="mt-3 flex flex-col gap-0.5">
                    {EXPLORER_CONTENT.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setExplorerOpen(false)}
                        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Col 2 — Collections */}
                <div className="min-w-0 px-4 py-5">
                  <SectionHeader icon={Sparkles}>{t('explorerCollections')}</SectionHeader>
                  <div className="mt-3 flex flex-col gap-0.5">
                    {EXPLORER_COLLECTIONS_LIST.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setExplorerOpen(false)}
                        className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:text-primary"
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Col 3 — Recherche */}
                <div className="min-w-0 px-4 py-5">
                  <SectionHeader icon={Search}>{t('explorerSearch')}</SectionHeader>
                  <div className="mt-3 flex flex-col gap-0.5">
                    {EXPLORER_SEARCH.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setExplorerOpen(false)}
                        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedDropdownContent>
          </DropdownMenu>
          <DesktopNavLink
            href={`/${locale}/calendar`}
            active={pathname.startsWith('/calendar')}
          >
            {t('navCalendar')}
          </DesktopNavLink>
          <span className="mx-1 h-4 w-px bg-white/15" aria-hidden="true" />
          <DesktopNavLink
            href={`/${locale}/community`}
            active={pathname.startsWith('/community')}
          >
            {t('navCommunity')}
          </DesktopNavLink>
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Search — desktop inline, mobile toggle */}
          <div className="hidden lg:block">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <SearchBar
                  autoFocus
                  className="w-64 [&_input]:h-9"
                  placeholder={t('searchPlaceholder')}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={() => setSearchOpen(true)}
                aria-label={t('search')}
              >
                <Search className="size-5" />
              </Button>
            )}
          </div>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 lg:hidden"
            aria-label={t('search')}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-5" />
          </Button>

          {/* Notifications */}
          <NotificationsMenu />

          {/* Watchlist */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              asChild
            >
              <Link href={`/${locale}/watchlist`} aria-label={t('watchlist')}>
                <Bookmark className="size-5" />
              </Link>
            </Button>
          )}

          {/* Profile */}
          {isAuthenticated ? (
            <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('profileMenu')}
                  className="ml-1 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserAvatar user={USERS.me} className="size-8" />
                </button>
              </DropdownMenuTrigger>
              <AnimatedDropdownContent open={profileOpen} align="end" className="w-64 border-white/10 bg-black p-0 text-ink shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                  <UserAvatar user={USERS.me} className="size-10" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{USERS.me.displayName}</span>
                    <span className="text-xs text-white/50">
                      @{USERS.me.username}
                    </span>
                  </div>
                </div>
                <div className="py-1.5">
                  <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                    <Link href={`/${locale}/profile`}>
                      <Users className="size-4" />
                      {t('switchProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                    <Link href={`/${locale}/settings`}>
                      <Settings className="size-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div className="mx-3 h-px bg-white/10" />
                <div className="py-1.5">
                  <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                    <Link href={`/${locale}/watchlist`}>
                      <Bookmark className="size-4" />
                      {t('watchlist')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                    <Link href={`/${locale}/crunchylists`}>
                      <CreditCard className="size-4" />
                      {t('crunchylists')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                    <Link href={`/${locale}/history`}>
                      <History className="size-4" />
                      {t('history')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                    <Link href={`/${locale}/notifications`}>
                      <Bell className="size-4" />
                      {t('notifications')}
                      <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        1
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div className="mx-3 h-px bg-white/10" />
                <div className="border-t border-white/10 py-1.5">
                  <DropdownMenuItem className="gap-3 px-4 py-2.5 text-red-400 focus:bg-white/10 focus:text-red-300">
                    <LogOut className="size-4" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </div>
              </AnimatedDropdownContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="ml-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile expandable search */}
      {searchOpen && (
        <div className="border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <SearchBar autoFocus placeholder={t('searchAnimePlaceholder')} />
        </div>
      )}
    </header>
  )
}

/* -------------------------------------------------------------------------- *
 * DesktopNavLink — single underlined nav item with active highlight
 * -------------------------------------------------------------------------- */
function SectionHeader({
  icon: Icon,
  children,
}: {
  icon?: typeof Tag
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="size-3.5 text-white/50" strokeWidth={2.25} />}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
        {children}
      </span>
    </div>
  )
}

function DesktopNavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors',
        active ? 'text-white' : 'text-white/70 hover:text-white',
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  )
}

/* -------------------------------------------------------------------------- *
 * SectionHeader — uppercase label with optional icon used inside the mega-menu
 * -------------------------------------------------------------------------- */
function AnimatedDropdownContent({
  open,
  align = 'end',
  className,
  children,
}: {
  open: boolean
  align?: 'start' | 'center' | 'end'
  className?: string
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <DropdownMenuContent
          align={align}
          forceMount
          className={className}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </DropdownMenuContent>
      )}
    </AnimatePresence>
  )
}

function NotificationsMenu() {
  const t = useTranslations('Public.header')
  const [open, setOpen] = useState(false)

  const items = [
    {
      title: t('notifNewEpisodeTitle'),
      meta: t('notifNewEpisodeMeta'),
    },
    {
      title: t('notifReplyTitle'),
      meta: t('notifReplyMeta'),
    },
    {
      title: t('notifReleaseTitle'),
      meta: t('notifReleaseMeta'),
    },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('notificationsLabel')}
          className="relative size-9"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>
      </DropdownMenuTrigger>
      <AnimatedDropdownContent open={open} align="end" className="w-80 border-white/10 bg-black p-0 text-ink shadow-xl">
        <div className="px-4 py-3 font-semibold">{t('notifications')}</div>
        <div className="mx-3 h-px bg-white/10" />
        <div className="py-1.5">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.title}
              className="flex-col items-start gap-0.5 px-4 py-2.5 focus:bg-white/10"
            >
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-white/50">{item.meta}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </AnimatedDropdownContent>
    </DropdownMenu>
  )
}
