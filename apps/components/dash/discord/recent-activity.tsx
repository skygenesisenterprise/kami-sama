'use client'

import {
  Activity,
  BellRing,
  Cog,
  Link2,
  Megaphone,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ActivityEventType, DiscordActivityEvent } from '@/lib/discord-data'

const eventStyles: Record<
  ActivityEventType,
  { icon: LucideIcon; className: string }
> = {
  episode: { icon: BellRing, className: 'bg-primary/15 text-primary' },
  member: { icon: UserPlus, className: 'bg-success/15 text-success' },
  automation: { icon: Activity, className: 'bg-info/15 text-info' },
  config: { icon: Cog, className: 'bg-muted text-muted-foreground' },
  integration: { icon: Link2, className: 'bg-warning/15 text-warning' },
  announcement: { icon: Megaphone, className: 'bg-muted text-muted-foreground' },
}

export function RecentActivityCard({
  events,
}: {
  events: DiscordActivityEvent[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription>What the bot has been up to.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="flex flex-col">
          {events.map((event, index) => {
            const { icon: Icon, className } = eventStyles[event.type]
            return (
              <li
                key={event.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                  index > 0 && 'border-t border-border/50',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
                    className,
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{event.time}</span>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
