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
  CreditCard,
  Film,
  Gift,
  History,
  Home,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
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
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const locale = pathname.split('/')[1] || 'fr'
  const homeHref = `/${locale}/discover`

  const NAV_LINKS = [
    { href: '/discover', label: t('navHome'), icon: Home },
    { href: '/catalog', label: t('navBrowse'), icon: Film },
    { href: '/calendar', label: t('navCalendar'), icon: Calendar },
    { href: '/community', label: t('navCommunity'), icon: Sparkles },
    { href: '/library', label: t('navLibrary'), icon: Library },
  ]

  const CATEGORY_ITEMS = [
    { href: '/catalog?genre=action', label: t('genreAction') },
    { href: '/catalog?genre=adventure', label: t('genreAdventure') },
    { href: '/catalog?genre=comedy', label: t('genreComedy') },
    { href: '/catalog?genre=drama', label: t('genreDrama') },
    { href: '/catalog?genre=fantasy', label: t('genreFantasy') },
    { href: '/catalog?genre=music', label: t('genreMusic') },
    { href: '/catalog?genre=romance', label: t('genreRomance') },
    { href: '/catalog?genre=sci-fi', label: t('genreSciFi') },
    { href: '/catalog?genre=seinen', label: t('genreSeinen') },
    { href: '/catalog?genre=shoujo', label: t('genreShoujo') },
    { href: '/catalog?genre=shonen', label: t('genreShonen') },
    { href: '/catalog?genre=slice-of-life', label: t('genreSliceOfLife') },
    { href: '/catalog?genre=sports', label: t('genreSports') },
    { href: '/catalog?genre=supernatural', label: t('genreSupernatural') },
    { href: '/catalog?genre=thriller', label: t('genreThriller') },
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
          <SheetContent side="left" className="w-72 border-border/40 p-0">
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

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-0.5 md:flex">
          <Link
            href={`/${locale}/videos/new`}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              pathname.includes('/videos/new')
                ? 'text-white'
                : 'text-white/70 hover:text-white',
            )}
          >
            {t('navNew')}
            {pathname.includes('/videos/new') && (
              <span className="absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
          <Link
            href={`/${locale}/videos/popular`}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              pathname.includes('/videos/popular')
                ? 'text-white'
                : 'text-white/70 hover:text-white',
            )}
          >
            {t('navPopular')}
            {pathname.includes('/videos/popular') && (
              <span className="absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
          <Link
            href={`/${locale}/simulcast`}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              pathname.includes('/simulcast')
                ? 'text-white'
                : 'text-white/70 hover:text-white',
            )}
          >
            {t('navSimulcast')}
            {pathname.includes('/simulcast') && (
              <span className="absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
          <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white"
              >
                {t('navCategory')}
                <ChevronDown className={cn('size-3.5 transition-transform duration-200', categoryOpen && 'rotate-180')} />
              </button>
            </DropdownMenuTrigger>
            <AnimatedDropdownContent open={categoryOpen} align="start" className="w-auto border-white/10 bg-background/90 p-0 text-ink shadow-xl backdrop-blur-xl">
              <div className="flex">
                <div className="flex flex-col border-r border-white/10 py-3">
                  <Link
                    href={`/${locale}/catalog`}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t('browseAllAZ')}
                  </Link>
                  <Link
                    href={`/${locale}/calendar`}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t('agenda')}
                  </Link>
                </div>
                <div className="flex flex-col py-3 pl-4 pr-6">
                  <span className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/40">{t('genres')}</span>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-0.5">
                    {CATEGORY_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="whitespace-nowrap px-4 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedDropdownContent>
          </DropdownMenu>
          <span className="mx-1 h-4 w-px bg-white/20" aria-hidden="true" />
          <Link
            href="/community"
            className={cn(
              'relative rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              isActive('/community')
                ? 'text-white'
                : 'text-white/70 hover:text-white',
            )}
          >
            {t('navForum')}
            {isActive('/community') && (
              <span className="absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
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
