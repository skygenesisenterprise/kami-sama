'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface PressCardProps {
  title: string
  date: string
  excerpt: string
  category?: string
  href?: string
  className?: string
}

export function PressCard({ title, date, excerpt, category, href, className }: PressCardProps) {
  const Wrapper = href ? 'a' : 'div'

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={cn(
        'group block rounded-xl border border-border bg-card p-6 transition-all hover:border-stamp/30 hover:shadow-lg',
        href && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {category && (
          <span className="rounded-full bg-stamp/10 px-2.5 py-0.5 font-medium text-stamp">
            {category}
          </span>
        )}
        <time>{date}</time>
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-foreground transition-colors group-hover:text-stamp">
        {title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {excerpt}
      </p>
      {href && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-stamp opacity-0 transition-opacity group-hover:opacity-100">
          Read more <ArrowRight className="size-4" />
        </div>
      )}
    </Wrapper>
  )
}
