'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { allRoutes } from './nav-config'

const PAGE_TITLE = 'Kami-Sama: Operations Center'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = allRoutes.find((item) =>
    item.href === '/dash' ? pathname === '/dash' : pathname.startsWith(item.href),
  )
  const headerTitle = current?.title ?? 'Overview'

  useEffect(() => {
    document.title = PAGE_TITLE
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobileAction={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={headerTitle} onOpenMobileAction={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
