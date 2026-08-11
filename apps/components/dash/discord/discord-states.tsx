'use client'

import {
  BellRing,
  Check,
  Link2,
  MessageSquareHeart,
  RefreshCw,
  Sparkles,
  UserRoundPlus,
  Wifi,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DiscordLogo } from '@/components/dash/discord/discord-logo'

/* -------------------------------------------------------------------------- */
/*  Empty state — Discord not connected                                        */
/* -------------------------------------------------------------------------- */

const emptyFeatures: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Community analytics', icon: MessageSquareHeart },
  { label: 'Kami-Sama notifications', icon: BellRing },
  { label: 'Account linking', icon: Link2 },
  { label: 'Anime release announcements', icon: Sparkles },
  { label: 'Community automations', icon: UserRoundPlus },
]

export function DiscordEmptyState({
  connecting,
  onConnect,
}: {
  connecting: boolean
  onConnect: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 px-6 py-14 text-center sm:py-16">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-[#5865F2]/15 text-[#5865F2] ring-1 ring-[#5865F2]/20">
            <DiscordLogo className="size-10" />
          </div>
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground">
            <WifiOff className="size-3" />
          </span>
        </div>

        <div className="flex max-w-md flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Discord isn&apos;t connected</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Connect your Discord community to unlock Kami-Sama&apos;s community features.
          </p>
        </div>

        <ul className="grid w-full max-w-sm grid-cols-1 gap-2 text-left sm:grid-cols-2">
          {emptyFeatures.map((feature) => (
            <li
              key={feature.label}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="size-3" />
              </span>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2">
          <Button onClick={onConnect} disabled={connecting} size="lg" className="min-w-44">
            {connecting ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <DiscordLogo className="size-4" />
            )}
            {connecting ? 'Connecting…' : 'Connect Discord'}
          </Button>
          <p className="text-xs text-muted-foreground">
            You&apos;ll be redirected to Discord to authorize the bot.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Error state — connection unavailable                                       */
/* -------------------------------------------------------------------------- */

export function DiscordErrorState({
  lastSync,
  onRetry,
}: {
  lastSync: string
  onRetry: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 px-6 py-14 text-center sm:py-16">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <WifiOff className="size-9" />
        </div>

        <div className="flex max-w-md flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Discord connection unavailable</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t reach the Discord API. Your settings are safe — nothing was changed.
          </p>
          <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="size-3.5" />
            Last successful synchronization: {lastSync}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" onClick={() => toast.info('Opening diagnostics…')}>
            View diagnostics
          </Button>
          <Button onClick={onRetry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
