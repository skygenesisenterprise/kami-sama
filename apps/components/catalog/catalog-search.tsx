'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CatalogSearch({ value, onChange, placeholder }: CatalogSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-11 w-full rounded-lg bg-white/5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground',
          'ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-white/20 focus:outline-none',
        )}
      />
      {value && (
        <button
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
