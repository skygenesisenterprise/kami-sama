'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PartnerCardProps {
  title: string
  description: string
  icon: React.ReactNode
  className?: string
}

export function PartnerCard({ title, description, icon, className }: PartnerCardProps) {
  return (
    <div className={cn(
      'group rounded-xl border border-border bg-card p-6 transition-all hover:border-stamp/30 hover:shadow-lg',
      className,
    )}>
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-stamp/10 text-stamp transition-colors group-hover:bg-stamp/20">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
