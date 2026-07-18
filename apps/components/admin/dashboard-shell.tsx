'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { navItemsFlat } from './nav-config'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = navItemsFlat.find((item) =>
    item.href === '/dash' ? pathname === '/dash' : pathname.startsWith(item.href),
  )
  const title = current?.label ?? 'Overview'

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
