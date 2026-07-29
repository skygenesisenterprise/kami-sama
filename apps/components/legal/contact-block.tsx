'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'

interface ContactBlockProps {
  title: string
  email: string
  description?: string
  className?: string
}

export function ContactBlock({ title, email, description, className }: ContactBlockProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-6',
      className,
    )}>
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
          <Mail className="size-5" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
          <a
            href={`mailto:${email}`}
            className="mt-2 inline-block text-sm font-medium text-stamp hover:underline"
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  )
}
