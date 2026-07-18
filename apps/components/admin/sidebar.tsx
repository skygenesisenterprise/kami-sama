'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { navItemsFlat, type NavItem } from './nav-config'
import { Play, X, LogOut, ChevronRight } from 'lucide-react'

type SidebarProps = {
  mobileOpen: boolean
  onCloseMobile: () => void
}

function ActiveIndicator() {
  return (
    <motion.span
      layoutId="sidebar-active"
      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-primary"
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    />
  )
}

function NavItemRow({ item, isActive, isChildActive, onCloseMobile }: {
  item: NavItem
  isActive: boolean
  isChildActive: boolean
  onCloseMobile: () => void
}) {
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0
  const [open, setOpen] = useState(isChildActive)

  if (!hasChildren) {
    return (
      <li className="relative">
        {isActive && <ActiveIndicator />}
        <Link
          href={item.href}
          onClick={onCloseMobile}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-primary/15 text-primary'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <Icon className={cn('size-4.5 shrink-0', isActive && 'text-primary')} />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/15 text-primary',
              )}
            >
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <li className="relative">
      {isChildActive && <ActiveIndicator />}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isChildActive
            ? 'bg-primary/15 text-primary'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        )}
        aria-expanded={open}
      >
        <Icon className={cn('size-4.5 shrink-0', isChildActive && 'text-primary')} />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
              'bg-primary/15 text-primary',
            )}
          >
            {item.badge}
          </span>
        )}
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronRight className="size-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
              {item.children!.map((child) => {
                const ChildIcon = child.icon
                return (
                  <li key={child.id} className="relative">
                    <SidebarLink child={child} ChildIcon={ChildIcon} onCloseMobile={onCloseMobile} />
                  </li>
                )
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

function SidebarLink({ child, ChildIcon, onCloseMobile }: {
  child: { id: string; label: string; icon: React.ElementType; href: string }
  ChildIcon: React.ElementType
  onCloseMobile: () => void
}) {
  const pathname = usePathname()
  const childActive = pathname === child.href

  return (
    <Link
      href={child.href}
      onClick={onCloseMobile}
      aria-current={childActive ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200',
        childActive
          ? 'bg-primary/15 text-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      {childActive && (
        <motion.span
          layoutId="sidebar-child-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[2px] rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <ChildIcon className={cn('size-3.5 shrink-0', childActive && 'text-primary')} />
      <span className="flex-1 text-left">{child.label}</span>
    </Link>
  )
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:self-start lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
          <Link href="/dash" className="flex items-center gap-2.5" onClick={onCloseMobile}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Play className="size-5 fill-current" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Kami-Sama</p>
              <p className="text-xs text-muted-foreground">Console streaming</p>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItemsFlat.map((item) => {
              const isActive =
                item.href === '/dash'
                  ? pathname === '/dash'
                  : pathname === item.href
              const isChildActive =
                item.children?.some((c) => pathname.startsWith(c.href)) ?? false
              return (
                <NavItemRow
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  isChildActive={isChildActive}
                  onCloseMobile={onCloseMobile}
                />
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              YK
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">Yuki Kobayashi</p>
              <p className="truncate text-xs text-muted-foreground">Administrateur</p>
            </div>
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Se déconnecter"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
