'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronRight,
  Film,
  History,
  Library,
  LogOut,
  Menu,
  Search,
  UserRoundCog,
  Sparkles,
  TrendingUp,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/kami/user-avatar'
import { SearchBar } from '@/components/kami/search-bar'
import { CastDeviceSelector } from '@/components/kami/cast-device-selector'
import { Logo } from '@/components/kami/logo'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { getSelectedProfile } from '@/lib/profile-selection'
import { getAnime } from '@/lib/mock-data'

export function SiteHeader() {
  const t = useTranslations('Public.header')
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const discoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use selected profile info when available, fall back to user account info
  const selectedProfile = getSelectedProfile()
  const displayName = selectedProfile?.displayName || user?.displayName || 'User'
  const avatarUrl = selectedProfile?.avatarUrl || user?.avatarUrl || ''

  const locale = pathname.split('/')[1] || 'fr'
  const homeHref = `/${locale}/discover`

  // Mobile menu — mirrors the desktop items
  const NAV_LINKS = [
    { href: `/${locale}/calendar`, label: t('navCalendar'), icon: Calendar },
    { href: `/${locale}/collections`, label: t('navCollections'), icon: Film },
    { href: `/${locale}/random`, label: t('navRandom'), icon: Sparkles },
    { href: `/${locale}/simulcast`, label: t('navSimulcast'), icon: Calendar },
    { href: `/${locale}/rankings`, label: t('navRankings'), icon: TrendingUp },
    { href: `/${locale}/community`, label: t('navCommunity'), icon: Users },
    { href: `/${locale}/videos/new`, label: t('navNew'), icon: Sparkles },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (discoverTimer.current) clearTimeout(discoverTimer.current)
      if (profileTimer.current) clearTimeout(profileTimer.current)
    }
  }, [])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }


  return (
    <header
      className={cn(
        'sticky top-0 z-60 w-full select-none transition-all duration-300',
        scrolled
          ? 'bg-background/90 shadow-lg shadow-black/20 backdrop-blur-xl'
          : 'bg-background/70 backdrop-blur-md',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4 md:px-5 lg:px-8 xl:px-20">
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
                <UserAvatar user={{ id: user?.id ?? '', username: displayName, displayName, avatar: avatarUrl }} className="size-7" />
                <div className="flex flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email ?? ''}
                  </span>
                </div>
              </Link>
              {/* Lien vers le dashboard pour les administrateurs - version mobile */}
              {user?.roles?.some(role => ['superadmin', 'admin', 'owner'].includes(role)) && (
                <Link
                  href="/dash"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <TrendingUp className="size-4" />
                  Dashboard
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Logo href={homeHref} className="hidden sm:flex" />
          <Logo href={homeHref} className="sm:hidden [&>span:last-child]:hidden" />
        </div>

        {/* Desktop nav — Netflix-style with mega-menu */}
        <nav className="ml-6 hidden items-center gap-0.5 md:flex">
          <DesktopNavLink
            href={homeHref}
            active={pathname.endsWith('/discover')}
          >
            {t('navHome')}
          </DesktopNavLink>

          {/* Découvrir mega-menu */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (discoverTimer.current) clearTimeout(discoverTimer.current)
              setDiscoverOpen(true)
            }}
            onMouseLeave={() => {
              discoverTimer.current = setTimeout(() => setDiscoverOpen(false), 200)
            }}
          >
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white',
                discoverOpen && 'text-white',
              )}
              aria-expanded={discoverOpen}
              onClick={() => setDiscoverOpen((v) => !v)}
            >
              <span>{t('navDiscover')}</span>
              <ChevronDown
                className={cn(
                  'size-3 transition-transform duration-200',
                  discoverOpen && 'rotate-180',
                )}
              />
            </button>

            <AnimatePresence>
              {discoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 pt-2"
                >
                  <div className="mega-menu-panel relative overflow-hidden rounded-lg border border-white/10 bg-[#111] shadow-2xl shadow-black/60">
                    {/* Orange gradient top line */}
                    <div className="h-0.5 bg-linear-to-r from-transparent via-primary to-transparent" />

                    <div className="flex min-w-175">
                      {/* Col 1: featured anime */}
                      <div className="w-64 shrink-0 border-r border-white/5 p-4">
                        <div className="mb-3 overflow-hidden rounded-md">
                          <img
                            src={getAnime('neon-samurai')?.banner || getAnime('neon-samurai')?.cover}
                            alt="Neon Samurai"
                            className="aspect-video w-full object-cover"
                          />
                        </div>
                        <span className="mb-1 inline-block rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {t('megaHighlight')}
                        </span>
                        <p className="mb-1 text-sm font-bold leading-tight text-white">Neon Samurai</p>
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/50">
                          {t('megaHighlightSub')}
                        </p>
                        <Link
                          href={`/${locale}/catalog?sort=exclusive`}
                          onClick={() => setDiscoverOpen(false)}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          {t('megaExplore')}
                          <ChevronRight className="size-3" />
                        </Link>
                      </div>

                      {/* Col 2: quick links */}
                      <div className="w-44 shrink-0 border-r border-white/5 p-4">
                        <SectionHeader>{t('megaQuickLinks')}</SectionHeader>
                        <div className="mt-2.5 flex flex-col gap-0.5">
                          <Link
                            href={`/${locale}/catalog?type=movie`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('megaFilms')}
                          </Link>
                          <Link
                            href={`/${locale}/catalog?sort=new`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navNew')}
                          </Link>
                          <Link
                            href={`/${locale}/calendar`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navCalendar')}
                          </Link>
                          <Link
                            href={`/${locale}/collections`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navCollections')}
                          </Link>
                          <Link
                            href={`/${locale}/random`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navRandom')}
                          </Link>
                          <Link
                            href={`/${locale}/catalog?sort=top10`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navRankings')}
                          </Link>
                        </div>
                      </div>

                      {/* Col 3: genres */}
                      <div className="flex-1 p-4">
                        <SectionHeader>{t('megaByGenre')}</SectionHeader>
                        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                          {[
                            { label: t('genreAction'), slug: 'action' },
                            { label: t('genreFantasy'), slug: 'fantasy' },
                            { label: t('genreRomance'), slug: 'romance' },
                            { label: t('genreSciFi'), slug: 'sci-fi' },
                            { label: t('genreThriller'), slug: 'thriller' },
                            { label: t('genreSliceOfLife'), slug: 'slice-of-life' },
                            { label: t('genreAdventure'), slug: 'adventure' },
                            { label: t('genreSupernatural'), slug: 'supernatural' },
                            { label: t('genreDrama'), slug: 'drama' },
                            { label: t('genreSports'), slug: 'sports' },
                          ].map((genre) => (
                            <Link
                              key={genre.slug}
                              href={`/${locale}/catalog?genre=${genre.slug}`}
                              onClick={() => setDiscoverOpen(false)}
                              className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                            >
                              {genre.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DesktopNavLink
            href={`/${locale}/simulcast`}
            active={pathname.startsWith('/simulcast')}
          >
            {t('navSimulcast')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/rankings`}
            active={pathname.startsWith('/rankings')}
          >
            {t('navRankings')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/community`}
            active={pathname.startsWith('/community')}
          >
            {t('navCommunity')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/videos/new`}
            active={pathname.startsWith('/videos/new')}
          >
            {t('navNew')}
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

          {/* Cast */}
          <CastDeviceSelector />

          {/* Profile */}
          {isAuthenticated ? (
            <div
              className="relative"
              onMouseEnter={() => {
                if (profileTimer.current) clearTimeout(profileTimer.current)
                setProfileOpen(true)
              }}
              onMouseLeave={() => {
                profileTimer.current = setTimeout(() => setProfileOpen(false), 200)
              }}
            >
              <button
                type="button"
                aria-label={t('profileMenu')}
                className={cn(
                  'ml-1 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring',
                  profileOpen && 'ring-2 ring-white/20',
                )}
              >
                <UserAvatar user={{ id: user?.id ?? '', username: displayName, displayName, avatar: avatarUrl }} className="size-8" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full z-50 pt-2"
                  >
                    <div className="w-64 overflow-hidden rounded-lg border border-white/10 bg-[#111] shadow-2xl shadow-black/60">
                      <div className="h-0.5 bg-linear-to-r from-transparent via-primary to-transparent" />

                      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                        <UserAvatar user={{ id: user?.id ?? '', username: displayName, displayName, avatar: avatarUrl }} className="size-10" />
                        <span className="text-sm font-semibold">{displayName}</span>
                      </div>

                      <div className="py-1.5">
                        <Link
                          href="/profile-change"
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <Users className="size-4" />
                          {t('switchProfile')}
                        </Link>
                        <Link
                          href={`/${locale}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <UserRoundCog className="size-4" />
                          {t('settings')}
                        </Link>
                        {user?.roles?.some(role => ['superadmin', 'admin', 'owner'].includes(role)) && (
                          <Link
                            href="/dash"
                            onClick={() => setProfileOpen(false)}
                            className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                          >
                            <TrendingUp className="size-4" />
                            Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="mx-3 h-px bg-white/10" />

                      <div className="py-1.5">
                        <Link
                          href={`/${locale}/watchlist`}
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <Bookmark className="size-4" />
                          {t('watchlist')}
                        </Link>
                        <Link
                          href={`/${locale}/history`}
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <History className="size-4" />
                          {t('history')}
                        </Link>
                      </div>

                      <div className="mx-3 h-px bg-white/10" />

                      <div className="py-1.5">
                        <button
                          type="button"
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300"
                        >
                          <LogOut className="size-4" />
                          {t('signOut')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm" className="ml-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile expandable search */}
      {searchOpen && (
        <div className="border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden md:px-5">
          <SearchBar autoFocus placeholder={t('searchAnimePlaceholder')} />
        </div>
      )}
    </header>
  )
}

/* -------------------------------------------------------------------------- *
 * DesktopNavLink — underline hover effect inspired by Netflix
 * -------------------------------------------------------------------------- */
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
        'nav-underline-link group relative',
        active && 'text-white',
      )}
    >
      <span>{children}</span>
      {active && (
        <span className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary group-hover:hidden" />
      )}
    </Link>
  )
}

/* -------------------------------------------------------------------------- *
 * SectionHeader — uppercase label with optional icon used inside the mega-menu
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

function NotificationsMenu() {
  const t = useTranslations('Public.header')
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    <div
      className="relative"
      onMouseEnter={() => {
        if (timer.current) clearTimeout(timer.current)
        setOpen(true)
      }}
      onMouseLeave={() => {
        timer.current = setTimeout(() => setOpen(false), 200)
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('notificationsLabel')}
        className="relative size-9"
      >
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 pt-2"
          >
            <div className="w-80 overflow-hidden rounded-lg border border-white/10 bg-[#111] shadow-2xl shadow-black/60">
              <div className="h-0.5 bg-linear-to-r from-transparent via-primary to-transparent" />
              <div className="px-4 py-3 font-semibold">{t('notifications')}</div>
              <div className="mx-3 h-px bg-white/10" />
              <div className="py-1.5">
                {items.map((item) => (
                  <div
                    key={item.title}
                    className="mega-menu-link flex flex-col items-start gap-0.5 px-4 py-2.5"
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-white/50">{item.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
