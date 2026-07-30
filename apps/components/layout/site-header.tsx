'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronRight,
  Film,
  HelpCircle,
  History,
  Library,
  LogIn,
  LogOut,
  Menu,
  Search,
  User,
  UserRoundCog,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
  Tag,
  Users,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/kami/user-avatar'
import { CastDeviceSelector } from '@/components/kami/cast-device-selector'
import { Logo } from '@/components/kami/logo'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { getSelectedProfile, onProfileChange, saveSelectedProfile, setProfileSelected, type SelectedProfileInfo } from '@/lib/profile-selection'
import { getDomainUrl } from '@/lib/domains'
import { getAnime } from '@/lib/mock-data'

export function SiteHeader() {
  const t = useTranslations('Public.header')
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const discoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use selected profile info when available, fall back to user account info
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfileInfo | null>(() => {
    // Check URL params first (from SSO redirect)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const urlProfileId = urlParams.get('profileId')
      const urlProfileName = urlParams.get('profileName')
      if (urlProfileId && urlProfileName) {
        // Clean URL immediately so user never sees the params
        window.history.replaceState({}, '', window.location.pathname)
        return { id: urlProfileId, displayName: urlProfileName, avatarUrl: urlParams.get('profileAvatar') || undefined }
      }
    }
    return getSelectedProfile()
  })
  const displayName = selectedProfile?.displayName || user?.displayName || 'User'
  const avatarUrl = selectedProfile?.avatarUrl || user?.avatarUrl || ''

  // Re-read profile from storage when it changes (cross-subdomain or cross-tab)
  useEffect(() => {
    const PROFILE_SELECTED_KEY = 'kami_sama_profile_selected'
    const SELECTED_PROFILE_ID_KEY = 'kami_sama_selected_profile_id'

    // On mount: save URL profile params to localStorage if present
    const urlParams = new URLSearchParams(window.location.search)
    const urlProfileId = urlParams.get('profileId')
    const urlProfileName = urlParams.get('profileName')
    if (urlProfileId && urlProfileName) {
      const urlProfileAvatar = urlParams.get('profileAvatar') || undefined
      saveSelectedProfile({ id: urlProfileId, displayName: urlProfileName, avatarUrl: urlProfileAvatar })
      setProfileSelected(true)
      setSelectedProfile(getSelectedProfile())
    }

    function refreshProfile() {
      setSelectedProfile(getSelectedProfile())
    }

    // storage event fires when localStorage changes in another tab/window
    function onStorage(e: StorageEvent) {
      if (e.key === PROFILE_SELECTED_KEY || e.key === SELECTED_PROFILE_ID_KEY) {
        refreshProfile()
      }
    }

    // Also re-read on focus — handles redirect back from SSO subdomain
    function onFocus() {
      refreshProfile()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)

    // Also subscribe to in-memory listeners (same-page changes)
    const unsub = onProfileChange(refreshProfile)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
      unsub()
    }
  }, [])

  const locale = useLocale()
  const homeHref = `/${locale}/discover`

  // Mobile menu — mirrors the desktop items
  const NAV_LINKS = [
    { href: `/${locale}/catalog`, label: t('navBrowse'), icon: Search },
    { href: `/${locale}/simulcast`, label: t('navSimulcast'), icon: Calendar },
    { href: `/${locale}/rankings`, label: t('navRankings'), icon: TrendingUp },
    { href: `/${locale}/calendar`, label: t('navCalendar'), icon: Calendar },
    { href: `/${locale}/collections`, label: t('navCollections'), icon: Film },
    { href: `/${locale}/random`, label: t('navRandom'), icon: Sparkles },
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
              <Logo />
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
                <a
                  href={getDomainUrl('studios', '/dash')}
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </a>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Logo className="hidden sm:flex" />
          <Logo className="sm:hidden [&>span:last-child]:hidden" />
        </div>

        {/* Desktop nav — Netflix-style with mega-menu */}
        <nav className="ml-6 hidden items-center gap-0.5 md:flex">
          <DesktopNavLink
            href={homeHref}
            active={isActive(homeHref)}
          >
            {t('navHome')}
          </DesktopNavLink>

          <DesktopNavLink
            href={`/${locale}/simulcast`}
            active={isActive(`/${locale}/simulcast`)}
          >
            {t('navSimulcast')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/rankings`}
            active={isActive(`/${locale}/rankings`)}
          >
            {t('navRankings')}
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

                    <div className="flex min-w-225">
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
                            href={`/${locale}/catalog`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navBrowse')}
                          </Link>
                          <Link
                            href={`/${locale}/library`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navLibrary')}
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
                            href={`/${locale}/live`}
                            onClick={() => setDiscoverOpen(false)}
                            className="mega-menu-link rounded-md px-2.5 py-1.5 text-[13px] text-white/70"
                          >
                            {t('navLiveTV')}
                          </Link>
                        </div>
                      </div>

                      {/* Col 3: genres */}
                      <div className="flex-1 p-4">
                        <SectionHeader>{t('megaByGenre')}</SectionHeader>
                        <div className="mt-2.5 grid grid-cols-3 gap-x-4 gap-y-0.5">
                          {[
                            { label: t('genreAction'), slug: 'action' },
                            { label: t('genreAdventure'), slug: 'aventure' },
                            { label: t('genreComedy'), slug: 'comedie' },
                            { label: t('genreDrama'), slug: 'drame' },
                            { label: t('genreFantasy'), slug: 'fantasy' },
                            { label: t('genreMusic'), slug: 'musique' },
                            { label: t('genreRomance'), slug: 'romance' },
                            { label: t('genreSciFi'), slug: 'science-fiction' },
                            { label: t('genreSeinen'), slug: 'psychologique' },
                            { label: t('genreShoujo'), slug: 'slice-of-life' },
                            { label: t('genreShonen'), slug: 'isekai' },
                            { label: t('genreSliceOfLife'), slug: 'mystere' },
                            { label: t('genreSports'), slug: 'sport' },
                            { label: t('genreSupernatural'), slug: 'horreur' },
                            { label: t('genreThriller'), slug: 'thriller' },
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

          {/* Separator */}
          <span className="mx-1 h-4 w-px bg-white/20" />

          <DesktopNavLink
            href={`/${locale}/community`}
            active={isActive(`/${locale}/community`)}
          >
            {t('navCommunity')}
          </DesktopNavLink>
          <DesktopNavLink
            href={`/${locale}/videos/new`}
            active={isActive(`/${locale}/videos/new`)}
          >
            {t('navNew')}
          </DesktopNavLink>
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Search — link to search page */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            asChild
          >
            <Link href={`/${locale}/search`} aria-label={t('search')}>
              <Search className="size-5" />
            </Link>
          </Button>

          {/* Notifications */}
          <NotificationsMenu />

          {/* Watchlist */}
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

          {/* Cast */}
          <CastDeviceSelector />

          {/* Profile / Guest mode */}
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
              aria-label={isAuthenticated ? t('profileMenu') : t('guestMode')}
              className={cn(
                'ml-1 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring',
                profileOpen && 'ring-2 ring-white/20',
              )}
            >
              {isAuthenticated ? (
                <UserAvatar user={{ id: user?.id ?? '', username: displayName, displayName, avatar: avatarUrl }} className="size-8" />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white/80">
                  <User className="size-4" />
                </div>
              )}
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

                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                      {isAuthenticated ? (
                        <>
                          <UserAvatar user={{ id: user?.id ?? '', username: displayName, displayName, avatar: avatarUrl }} className="size-10" />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{displayName}</span>
                        </>
                      ) : (
                        <>
                          <div className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">
                            <User className="size-5" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-semibold text-white/80">{t('guestMode')}</span>
                            <span className="truncate text-xs text-white/40">{t('guestModeSub')}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      {isAuthenticated && (
                        <a
                          href={getDomainUrl('sso', '/profile-change')}
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <Users className="size-4" />
                          {t('switchProfile')}
                        </a>
                      )}
                      {isAuthenticated && (
                        <Link
                          href={`/${locale}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <UserRoundCog className="size-4" />
                          {t('settings')}
                        </Link>
                      )}
                      {isAuthenticated && user?.roles?.some(role => ['superadmin', 'admin', 'owner'].includes(role)) && (
                        <a
                          href={getDomainUrl('studios', '/dash')}
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                        >
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </a>
                      )}
                    </div>

                    {isAuthenticated && <div className="mx-3 h-px bg-white/10" />}

                    <div className="py-1.5">
                      <Link
                        href={`/${locale}/support`}
                        onClick={() => setProfileOpen(false)}
                        className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                      >
                        <HelpCircle className="size-4" />
                        {t('support')}
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

                    {/* Footer: sign out or sign in CTA */}
                    <div className="mx-3 h-px bg-white/10" />

                    <div className="py-1.5">
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false)
                            logout(homeHref)
                          }}
                          className="mega-menu-link flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300"
                        >
                          <LogOut className="size-4" />
                          {t('signOut')}
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          onClick={() => setProfileOpen(false)}
                          className="mega-menu-link flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:text-primary/80"
                        >
                          <LogIn className="size-4" />
                          {t('login')}
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
              <div className="py-6 text-center">
                <p className="text-sm text-white/40">{t('notifEmpty')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
