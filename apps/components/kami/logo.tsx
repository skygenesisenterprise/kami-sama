import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2', className)}
      aria-label="Kami-Sama home"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <span className="font-display text-lg font-bold leading-none">神</span>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Kami<span className="text-primary">-</span>Sama
      </span>
    </Link>
  )
}
