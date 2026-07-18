'use client'

import { Menu, Search, Bell, Plus, ChevronDown } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

type HeaderProps = {
  title: string
  onOpenMobile: () => void
}

export function Header({ title, onOpenMobile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onOpenMobile}
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

        <button
          className="relative flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <ThemeToggle />

        <button className="hidden h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 md:flex">
          <Plus className="size-4" />
          Ajouter un animé
        </button>

        <button className="flex items-center gap-2 rounded-md border border-border py-1 pl-1 pr-2 text-sm hover:bg-accent hover:text-accent-foreground">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            YK
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  )
}
