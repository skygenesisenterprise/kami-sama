'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Bell,
  Bookmark,
  Calendar,
  Film,
  Home,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/kami/user-avatar'
import { SearchBar } from '@/components/kami/search-bar'
import { Logo } from '@/components/kami/logo'
import { USERS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const t = useTranslations('Public.header')
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const NAV_LINKS = [
    { href: '/', label: t('navHome'), icon: Home },
    { href: '/catalog', label: t('navBrowse'), icon: Film },
    { href: '/calendar', label: t('navCalendar'), icon: Calendar },
    { href: '/community', label: t('navCommunity'), icon: Sparkles },
    { href: '/library', label: t('navLibrary'), icon: Library },
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
        'sticky top-0 z-50 w-full transition-all duration-300',
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
          <Logo className="hidden sm:flex" />
          <Logo className="sm:hidden [&>span:last-child]:hidden" />
        </div>

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
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

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('profileMenu')}
                className="ml-1 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UserAvatar user={USERS.me} className="size-8" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {USERS.me.displayName}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    @{USERS.me.username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/library">
                    <User className="size-4" />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/library">
                    <Bookmark className="size-4" />
                    {t('navLibrary')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="size-4" />
                  {t('settings')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="size-4" />
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

function NotificationsMenu() {
  const t = useTranslations('Public.header')

  const items = [
    {
      title: 'New episode of Eternal Frost',
      meta: 'Season 2 · Episode 8 is now available',
    },
    {
      title: 'Aoi replied to your review',
      meta: 'Crimson Blade · 20m ago',
    },
    {
      title: 'Hollow Kingdom releases soon',
      meta: 'On your watchlist · 3 days',
    },
  ]

  return (
    <DropdownMenu>
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
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t('notifications')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.title}
              className="flex-col items-start gap-0.5 py-2.5"
            >
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.meta}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
