'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function SearchBar({
  defaultValue = '',
  autoFocus = false,
  placeholder = 'Search anime, studios, genres…',
  className,
  onValueChange,
}: {
  defaultValue?: string
  autoFocus?: boolean
  placeholder?: string
  className?: string
  onValueChange?: (value: string) => void
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (onValueChange) return
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)} role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onValueChange?.(e.target.value)
        }}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label="Search"
        className="h-11 rounded-full border-border/70 bg-secondary/60 pl-10 text-sm"
      />
    </form>
  )
}
