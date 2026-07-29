'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CompanySectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}

export function CompanySection({ title, description, icon, children, className, id }: CompanySectionProps) {
  return (
    <section id={id} className={cn('px-4 py-16 md:px-8 md:py-24', className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          {icon && (
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
              {icon}
            </div>
          )}
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
