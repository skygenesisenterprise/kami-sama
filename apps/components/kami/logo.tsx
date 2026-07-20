import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn('group inline-flex items-center gap-2', className)}
      aria-label="Kami-Sama home"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <span className="font-display text-lg font-bold leading-none">神</span>
      </span>
      <span className="flex items-baseline font-display text-lg font-semibold leading-none tracking-tight">
        Kami<span className="text-primary">-</span>Sama<span className="text-muted-foreground text-sm font-normal">.tv</span>
      </span>
    </Link>
  )
}
