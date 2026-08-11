'use client'

import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  ExternalLink,
  Gauge,
  Hash,
  MessageSquare,
  Radio,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/dash/status-badge'
import { DiscordLogo } from '@/components/dash/discord/discord-logo'
import { cn } from '@/lib/utils'
import type { DiscordServer, DiscordStats } from '@/lib/discord-data'

/* -------------------------------------------------------------------------- */
/*  Server overview                                                            */
/* -------------------------------------------------------------------------- */

export function DiscordServerCard({ server }: { server: DiscordServer }) {
  const openDiscord = () => {
    if (server.inviteUrl) {
      window.open(server.inviteUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast.info('No Discord invite configured yet')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Icon */}
          <div className="relative shrink-0">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#5865F2]/15 text-[#5865F2] ring-1 ring-[#5865F2]/20">
              <DiscordLogo className="size-9" />
            </div>
            <span className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-background bg-success" />
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{server.name}</h2>
              <StatusBadge tone="success" pulse>
                Connected
              </StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">{server.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5" />
                <b className="font-medium text-foreground">{server.members.toLocaleString()}</b>
                members
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Radio className="size-3.5" />
                <b className="font-medium text-foreground">{server.online}</b>
                online
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="size-3.5" />
                <b className="font-medium text-foreground">{server.channels}</b>
                channels
              </span>
            </div>
          </div>
        </div>

        {/* Meta + actions */}
        <div className="flex shrink-0 flex-col gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Connected {new Date(server.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bot className="size-3.5" />
              Bot v{server.botVersion}
            </span>
          </div>
          <Button size="sm" onClick={openDiscord} className="md:self-end">
            <ExternalLink className="size-3.5" />
            Open Discord
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  KPI cards                                                                  */
/* -------------------------------------------------------------------------- */

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  delta?: number | null
  deltaLabel?: string
  icon: LucideIcon
  iconClass?: string
}

function KpiCard({ label, value, sub, delta, deltaLabel, icon: Icon, iconClass }: KpiCardProps) {
  const positive = delta !== undefined && delta !== null && delta >= 0
  const showDelta = delta !== undefined && delta !== null

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className={cn('flex size-7 items-center justify-center rounded-md bg-muted', iconClass)}>
            <Icon className="size-3.5" />
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        {showDelta && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              positive ? 'text-success' : 'text-destructive',
            )}
          >
            <ArrowUpRight className={cn('size-3', !positive && 'rotate-90')} />
            {delta! > 0 ? '+' : ''}{delta}%
            {deltaLabel && <span className="text-muted-foreground">&middot; {deltaLabel}</span>}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

export function DiscordStatsGrid({ stats }: { stats: DiscordStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Members"
        value={stats.members.toLocaleString()}
        delta={stats.membersDelta}
        deltaLabel="vs last month"
        icon={Users}
        iconClass="text-foreground"
      />
      <KpiCard
        label="Online"
        value={stats.online.toLocaleString()}
        sub="Currently online"
        icon={Radio}
        iconClass="text-success"
      />
      <KpiCard
        label="Messages"
        value={stats.messages30d.toLocaleString()}
        sub="Last 30 days"
        delta={stats.messagesDelta}
        deltaLabel="vs last month"
        icon={MessageSquare}
        iconClass="text-primary"
      />
      <KpiCard
        label="Bot uptime"
        value={`${stats.uptime30d}%`}
        sub="Last 30 days"
        delta={stats.uptimeDelta}
        icon={Gauge}
        iconClass="text-info"
      />
    </div>
  )
}
