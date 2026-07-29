'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface LegalCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

export function LegalCard({ title, description, icon, className }: LegalCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-5',
      className,
    )}>
      {icon && (
        <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
          {icon}
        </div>
      )}
      <h3 className="font-display text-sm font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
