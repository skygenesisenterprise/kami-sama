'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Bell,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  UserRoundCog,
  Users,
} from 'lucide-react'
import { UserAvatar } from '@/components/kami/user-avatar'
import { CastDeviceSelector } from '@/components/kami/cast-device-selector'
import { useAuth } from '@/context/AuthContext'
import { getSelectedProfile } from '@/lib/profile-selection'
import { getLocaleFromPath, defaultLocale } from '@/lib/locale'
import { cn } from '@/lib/utils'

type HeaderProps = {
  title: string
  onOpenMobileAction: () => void
}

export function Header({ title, onOpenMobileAction }: HeaderProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const locale = useMemo(() => getLocaleFromPath(pathname), [pathname])
  const [profileOpen, setProfileOpen] = useState(false)
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedProfile = getSelectedProfile()
  const displayName = selectedProfile?.displayName || user?.displayName || 'Admin'
  const avatarUrl = selectedProfile?.avatarUrl || user?.avatarUrl || ''

  useEffect(() => {
    return () => {
      if (profileTimer.current) clearTimeout(profileTimer.current)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onOpenMobileAction}
        className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden min-w-0 md:block">
        <h1 className="truncate text-base font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">Bon retour, voici l&apos;activité de la plateforme</p>
      </div>

      {/* Recherche */}
      <div className="relative ml-auto hidden w-full max-w-xs items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher un animé, un membre…"
          className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <button className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:hidden" aria-label="Rechercher">
          <Search className="size-4.5" />
        </button>

        <a
          href={`/${locale}/discover`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Revenir vers le site"
        >
          <ExternalLink className="size-4.5" />
        </a>

        <NotificationsMenu />

        {/* Cast */}
        <CastDeviceSelector />

        {/* Profile */}
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
            aria-label="Menu profil"
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
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{displayName}</span>
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/dash"
                      onClick={() => setProfileOpen(false)}
                      className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dash/community/users"
                      onClick={() => setProfileOpen(false)}
                      className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                    >
                      <Users className="size-4" />
                      Utilisateurs
                    </Link>
                    <Link
                      href="/dash/analytics/view"
                      onClick={() => setProfileOpen(false)}
                      className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                    >
                      <BarChart3 className="size-4" />
                      Analytics
                    </Link>
                  </div>

                  <div className="mx-3 h-px bg-white/10" />

                  <div className="py-1.5">
                    <Link
                      href="/dash/settings/overview"
                      onClick={() => setProfileOpen(false)}
                      className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                    >
                      <UserRoundCog className="size-4" />
                      Paramètres
                    </Link>
                    <Link
                      href="/dash/settings/security"
                      onClick={() => setProfileOpen(false)}
                      className="mega-menu-link flex items-center gap-3 px-4 py-2.5 text-sm text-white/70"
                    >
                      <Shield className="size-4" />
                      Sécurité
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
                      Déconnexion
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function NotificationsMenu() {
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
      <button
        className="relative flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4.5" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
      </button>

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
              <div className="px-4 py-3 font-semibold text-white">Notifications</div>
              <div className="mx-3 h-px bg-white/10" />
              <div className="py-6 text-center">
                <p className="text-sm text-white/40">Aucune notification</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
