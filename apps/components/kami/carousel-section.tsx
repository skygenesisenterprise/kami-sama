'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CarouselSectionProps {
  title: string
  subtitle?: string
  href?: string
  children: React.ReactNode
  className?: string
  /** Fixed width applied to each child item wrapper. */
  itemClassName?: string
}

export function CarouselSection({
  title,
  subtitle,
  href,
  children,
  className,
  itemClassName = 'w-[150px] sm:w-[170px] lg:w-[185px]',
}: CarouselSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const items = Array.isArray(children) ? children : [children]

  return (
    <section className={cn('py-5', className)}>
      <div className="mb-3 flex items-end justify-between gap-4 px-4 md:px-8">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" nativeButton={false} render={<Link href={href} />}>
              See all
            </Button>
          )}
          <div className="hidden items-center gap-1 md:flex">
            <Button
              variant="secondary"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:gap-4 md:px-8"
      >
        {items.map((child, i) => (
          <div key={i} className={cn('shrink-0 snap-start', itemClassName)}>
            {child}
          </div>
        ))}
      </div>
    </section>
  )
}
