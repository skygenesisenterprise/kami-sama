'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  badge?: string
  children?: React.ReactNode
  className?: string
}

export function HeroSection({ title, subtitle, description, badge, children, className }: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden px-4 py-24 md:px-8 md:py-32', className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-stamp/5 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-4xl text-center">
        {badge && (
          <span className="mb-6 inline-block rounded-full border border-stamp/20 bg-stamp/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-stamp">
            {badge}
          </span>
        )}
        <h1 className="font-display text-4xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg font-medium text-stamp md:text-xl">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
