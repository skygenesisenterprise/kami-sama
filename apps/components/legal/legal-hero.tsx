'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface LegalHeroProps {
  title: string
  description?: string
  lastUpdated?: string
  className?: string
}

export function LegalHero({ title, description, lastUpdated, className }: LegalHeroProps) {
  return (
    <section className={cn('relative overflow-hidden px-4 py-20 md:px-8 md:py-28', className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-stamp/5 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-4xl">
        <h1 className="font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
        {lastUpdated && (
          <p className="mt-4 text-xs text-muted-foreground">
            {lastUpdated}
          </p>
        )}
      </div>
    </section>
  )
}
