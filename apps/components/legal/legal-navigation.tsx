'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
}

interface LegalNavigationProps {
  items: NavItem[]
  className?: string
}

export function LegalNavigation({ items, className }: LegalNavigationProps) {
  const [active, setActive] = React.useState(items[0]?.id ?? '')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActive(id)
    }
  }

  return (
    <nav className={cn('sticky top-24', className)}>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                active === item.id
                  ? 'bg-stamp/10 font-medium text-stamp'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
