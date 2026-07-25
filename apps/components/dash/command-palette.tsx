'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2, Import, RefreshCw, Rocket, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { allRoutes } from '@/lib/navigation'

const quickActions = [
  { title: 'New content item', icon: FilePlus2, href: '/dash/catalog/anime' },
  { title: 'Run import from TMDB', icon: Import, href: '/dash/sources/tmdb' },
  {
    title: 'Trigger full synchronization',
    icon: RefreshCw,
    href: '/dash/sources/synchronization',
  },
  {
    title: 'Publish scheduled queue',
    icon: Rocket,
    href: '/dash/publishing/scheduled',
  },
]

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full max-w-56 justify-start text-muted-foreground md:max-w-64"
        onClick={() => setOpen(true)}
      >
        <Search data-icon="inline-start" />
        <span className="flex-1 text-left text-xs">Search console...</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, content, and actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.title}
                onSelect={() => navigate(action.href)}
              >
                <action.icon />
                <span>{action.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            {allRoutes.map((route) => (
              <CommandItem
                key={route.href}
                value={`${route.group} ${route.title}`}
                onSelect={() => navigate(route.href)}
              >
                {route.icon && <route.icon />}
                <span>{route.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {route.group}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
