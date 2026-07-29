'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Download } from 'lucide-react'

interface AssetCardProps {
  title: string
  description: string
  format?: string
  href?: string
  className?: string
}

export function AssetCard({ title, description, format, href, className }: AssetCardProps) {
  const Wrapper = href ? 'a' : 'div'

  return (
    <Wrapper
      {...(href ? { href, download: true } : {})}
      className={cn(
        'group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-stamp/30 hover:shadow-lg',
        href && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp transition-colors group-hover:bg-stamp/20">
        <Download className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-display text-sm font-bold text-foreground">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      {format && (
        <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-muted-foreground">
          {format}
        </span>
      )}
    </Wrapper>
  )
}
