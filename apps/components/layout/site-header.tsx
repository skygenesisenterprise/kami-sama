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
  TrendingUp,
  Tag,
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
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

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
                <UserAvatar user={{ id: user?.id ?? '', username: user?.email?.split('@')[0] ?? '', displayName: user?.displayName ?? '', avatar: user?.avatarUrl ?? '' }} className="size-7" />
                <div className="flex flex-col">
                  <span>{user?.displayName ?? 'User'}</span>
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

        {/* Desktop nav — single bar, 5 items, no duplicate menu */}
        <nav className="ml-6 hidden items-center gap-0.5 md:flex">
          {/* Découvrir dropdown */}
          <DropdownMenu open={discoverOpen} onOpenChange={setDiscoverOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  discoverOpen
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:text-white',
                )}
                aria-expanded={discoverOpen}
                onMouseEnter={() => {
                  if (discoverTimer.current) clearTimeout(discoverTimer.current)
                  setDiscoverOpen(true)
                }}
                onMouseLeave={() => {
                  discoverTimer.current = setTimeout(() => setDiscoverOpen(false), 200)
                }}
              >
                {t('navDiscover')}
                <ChevronDown
                  className={cn(
                    'size-3 transition-transform duration-200',
                    discoverOpen && 'rotate-180',
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <AnimatedDropdownContent
              open={discoverOpen}
              align="start"
              className="w-48 border-white/10 bg-black p-1.5 text-ink shadow-xl"
              onMouseEnter={() => {
                if (discoverTimer.current) clearTimeout(discoverTimer.current)
              }}
              onMouseLeave={() => {
                discoverTimer.current = setTimeout(() => setDiscoverOpen(false), 200)
              }}
            >
              <DropdownMenuItem asChild className="gap-2 rounded-md px-3 py-2 text-sm text-white/90 focus:bg-white/10">
                <Link href={`/${locale}/calendar`} onClick={() => setDiscoverOpen(false)}>
                  <Calendar className="size-4" />
                  {t('navCalendar')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 rounded-md px-3 py-2 text-sm text-white/90 focus:bg-white/10">
                <Link href={`/${locale}/collections`} onClick={() => setDiscoverOpen(false)}>
                  <Film className="size-4" />
                  {t('navCollections')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 rounded-md px-3 py-2 text-sm text-white/90 focus:bg-white/10">
                <Link href={`/${locale}/random`} onClick={() => setDiscoverOpen(false)}>
                  <Sparkles className="size-4" />
                  {t('navRandom')}
                </Link>
              </DropdownMenuItem>
            </AnimatedDropdownContent>
          </DropdownMenu>
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
          <span className="mx-1 h-4 w-px bg-white/15" aria-hidden="true" />
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

          {/* Profile */}
          {isAuthenticated ? (
            <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('profileMenu')}
                  className="ml-1 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserAvatar user={{ id: user?.id ?? '', username: user?.email?.split('@')[0] ?? '', displayName: user?.displayName ?? '', avatar: user?.avatarUrl ?? '' }} className="size-8" />
                </button>
              </DropdownMenuTrigger>
              <AnimatedDropdownContent open={profileOpen} align="end" className="w-64 border-white/10 bg-black p-0 text-ink shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                  <UserAvatar user={{ id: user?.id ?? '', username: user?.email?.split('@')[0] ?? '', displayName: user?.displayName ?? '', avatar: user?.avatarUrl ?? '' }} className="size-10" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user?.displayName ?? 'User'}</span>
                    <span className="text-xs text-white/50">
                      {user?.email ?? ''}
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
                  {/* Lien vers le dashboard pour les administrateurs */}
                  {user?.roles?.some(role => ['superadmin', 'admin', 'owner'].includes(role)) && (
                    <DropdownMenuItem asChild className="gap-3 px-4 py-2.5 focus:bg-white/10">
                      <Link href="/dash">
                        <TrendingUp className="size-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
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
        <div className="border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden md:px-5">
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
        'relative rounded-md px-2 py-1 text-xs font-medium transition-colors',
        active ? 'bg-white text-black' : 'text-white/80 hover:text-white',
      )}
    >
      {children}
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
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean
  align?: 'start' | 'center' | 'end'
  className?: string
  children: ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <DropdownMenuContent
      align={align}
      className={cn('overflow-hidden', className)}
      onPointerEnter={onMouseEnter}
      onPointerLeave={onMouseLeave}
      forceMount
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </DropdownMenuContent>
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
