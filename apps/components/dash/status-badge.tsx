import { cn } from '@/lib/utils'

export type StatusTone =
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'neutral'

const toneStyles: Record<StatusTone, { dot: string; text: string }> = {
  success: { dot: 'bg-success', text: 'text-success' },
  warning: { dot: 'bg-warning', text: 'text-warning' },
  destructive: { dot: 'bg-destructive', text: 'text-destructive' },
  info: { dot: 'bg-info', text: 'text-info' },
  neutral: { dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
}

export function StatusDot({
  tone,
  pulse = false,
  className,
}: {
  tone: StatusTone
  pulse?: boolean
  className?: string
}) {
  return (
    <span className={cn('relative inline-flex size-2 shrink-0', className)}>
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex size-full animate-ping rounded-full opacity-40',
            toneStyles[tone].dot,
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex size-2 rounded-full',
          toneStyles[tone].dot,
        )}
      />
    </span>
  )
}

export function StatusBadge({
  tone,
  children,
  pulse = false,
  className,
}: {
  tone: StatusTone
  children: React.ReactNode
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-xs font-medium',
        toneStyles[tone].text,
        className,
      )}
    >
      <StatusDot tone={tone} pulse={pulse} />
      {children}
    </span>
  )
}
