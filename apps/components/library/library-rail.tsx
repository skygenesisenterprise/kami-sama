'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LibraryRailProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  children: React.ReactNode
  className?: string
}

export function LibraryRail({ title, subtitle, ctaLabel, ctaHref, children, className }: LibraryRailProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    check()

    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])

  return (
    <section className={cn('relative py-3 md:py-5', className)}>
      <div className="mb-3 flex items-center justify-between gap-4 px-4 md:px-8 xl:px-20">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>
          )}
        </div>
        {ctaLabel && ctaHref && (
          <a
            href={ctaHref}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {ctaLabel}
            <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="relative group/rail">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-linear-to-r from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Reculer"
          >
            <ChevronLeft className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 scroll-pl-4 md:px-8 md:scroll-pl-8 xl:px-20 xl:scroll-pl-20 scrollbar-hide"
        >
          {children}
        </div>
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-linear-to-l from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Voir plus"
          >
            <ChevronRight className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
      </div>
    </section>
  )
}
