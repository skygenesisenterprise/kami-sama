import { Star } from 'phosphor-react'
import { cn } from '@/lib/utils'

export function RatingBadge({
  rating,
  className,
  size = 'default',
}: {
  rating: number
  className?: string
  size?: 'sm' | 'default'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-background/70 font-medium text-gold backdrop-blur',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
        className,
      )}
    >
      <Star className={cn('fill-gold text-gold', size === 'sm' ? 'size-3' : 'size-3.5')} />
      {rating.toFixed(1)}
    </span>
  )
}
