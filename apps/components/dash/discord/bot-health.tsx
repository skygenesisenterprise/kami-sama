'use client'

import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Timer,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, type StatusTone } from '@/components/dash/status-badge'
import { cn } from '@/lib/utils'
import type { DiscordBotStatus, ServiceStatus } from '@/lib/discord-data'

function serviceTone(status: ServiceStatus): StatusTone {
  switch (status) {
    case 'healthy':
      return 'success'
    case 'warning':
      return 'warning'
    case 'offline':
      return 'destructive'
    default:
      return 'neutral'
  }
}

function serviceIcon(status: ServiceStatus): LucideIcon {
  switch (status) {
    case 'healthy':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'offline':
      return XCircle
    default:
      return HelpCircle
  }
}

export function BotHealthCard({ bot }: { bot: DiscordBotStatus }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Bot className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base">Bot health</CardTitle>
            <CardDescription>Kami-Sama Bot v{bot.version}</CardDescription>
          </div>
        </div>
        <CardAction>
          <StatusBadge tone={bot.state === 'online' ? 'success' : 'destructive'} pulse={bot.state === 'online'}>
            {bot.state}
          </StatusBadge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1">
          {bot.services.map((service) => {
            const Icon = serviceIcon(service.status)
            return (
              <li
                key={service.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center gap-2.5 text-sm">
                  <Icon
                    className={cn(
                      'size-3.5',
                      service.status === 'healthy' && 'text-success',
                      service.status === 'warning' && 'text-warning',
                      service.status === 'offline' && 'text-destructive',
                      service.status === 'unknown' && 'text-muted-foreground',
                    )}
                  />
                  {service.label}
                </span>
                <span className="flex items-center gap-2">
                  {service.detail && (
                    <span className="font-mono text-xs text-muted-foreground">{service.detail}</span>
                  )}
                  <StatusBadge tone={serviceTone(service.status)}>{service.status}</StatusBadge>
                </span>
              </li>
            )
          })}
        </ul>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              Latency
            </p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{bot.latencyMs} ms</p>
          </div>
          <div className="rounded-md bg-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              Uptime
            </p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{bot.uptime}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Last heartbeat: <span className="text-foreground">{bot.lastHeartbeat}</span>
        </p>

        <Button
          variant="ghost"
          size="sm"
          className={cn('justify-start text-xs text-muted-foreground')}
          onClick={() => toast.info('Opening bot diagnostics…')}
        >
          View diagnostics
          <ChevronRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
