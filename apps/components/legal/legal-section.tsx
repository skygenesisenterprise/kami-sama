'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface LegalSectionProps {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function LegalSection({ id, title, description, children, className }: LegalSectionProps) {
  return (
    <section id={id} className={cn('px-4 py-12 md:px-8 md:py-16', className)}>
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </section>
  )
}
