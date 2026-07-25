'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, CircleHelp, LogOut, Settings, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { CommandPalette } from '@/components/dash/command-palette'
import { StatusDot, type StatusTone } from '@/components/dash/status-badge'
import { findGroup, findRoute } from '@/lib/navigation'

const notifications: Array<{
  title: string
  detail: string
  time: string
  tone: StatusTone
}> = [
  {
    title: 'Encoding job failed',
    detail: 'Frieren S02E08 — 4K HDR profile exited with code 137.',
    time: '2m ago',
    tone: 'destructive',
  },
  {
    title: 'License expiring',
    detail: 'Jujutsu Kaisen (US region) expires in 14 days.',
    time: '1h ago',
    tone: 'warning',
  },
  {
    title: 'Import complete',
    detail: 'TMDB sync imported 214 new episodes.',
    time: '3h ago',
    tone: 'success',
  },
  {
    title: 'New moderation reports',
    detail: '12 comment reports are waiting for review.',
    time: '5h ago',
    tone: 'info',
  },
]

function DashBreadcrumb() {
  const pathname = usePathname()
  const route = findRoute(pathname)
  const group = findGroup(pathname)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink render={<Link href="/dash" />}>
            Kami-Sama
          </BreadcrumbLink>
        </BreadcrumbItem>
        {group && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <span className="text-muted-foreground">{group.title}</span>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {route?.title ?? (pathname === '/dash' ? 'Home' : 'Console')}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function NotificationsMenu() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative size-8">
            <Bell />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Mark all as read
          </Button>
        </div>
        <div className="flex max-h-96 flex-col overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.title}
              className="flex items-start gap-3 border-b px-4 py-3 last:border-0 hover:bg-accent/50"
            >
              <StatusDot tone={n.tone} className="mt-1.5" />
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {n.detail}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {n.time}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="size-8 rounded-full p-0">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">AK</AvatarFallback>
            </Avatar>
            <span className="sr-only">Open user menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Aiko Kurosawa</span>
            <span className="text-xs font-normal text-muted-foreground">
              aiko@kami-sama.tv · Owner
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CircleHelp />
            Support
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive">
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <DashBreadcrumb />
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block">
          <CommandPalette />
        </div>
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  )
}
