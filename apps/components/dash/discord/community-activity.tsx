'use client'

import * as React from 'react'
import { Activity } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { DiscordActivitySeries } from '@/lib/discord-data'

const chartConfig = {
  messages: {
    label: 'Messages',
    color: 'var(--color-chart-1)',
  },
  members: {
    label: 'New members',
    color: 'var(--color-chart-4)',
  },
} satisfies ChartConfig

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
] as const

export function CommunityActivityCard({
  series,
}: {
  series: DiscordActivitySeries[]
}) {
  const [range, setRange] = React.useState<(typeof RANGES)[number]['value']>('30d')
  const active = series.find((s) => s.range === range) ?? series[0]

  const totalMessages = active.points.reduce((acc, p) => acc + p.messages, 0)
  const totalMembers = active.points.reduce((acc, p) => acc + p.members, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Activity className="size-4 text-muted-foreground" />
            </span>
            <div>
              <CardTitle className="text-base">Community activity</CardTitle>
              <CardDescription>{active.label}</CardDescription>
            </div>
          </div>

          <div
            role="group"
            aria-label="Activity range"
            className="inline-flex items-center rounded-md border bg-muted/30 p-0.5"
          >
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                aria-pressed={range === r.value}
                className={cn(
                  'rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors',
                  range === r.value
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:max-w-60">
          <div>
            <p className="text-xs text-muted-foreground">Messages</p>
            <p className="text-xl font-semibold tabular-nums">{totalMessages.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">New members</p>
            <p className="text-xl font-semibold tabular-nums">{totalMembers.toLocaleString()}</p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart
            data={active.points}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-messages)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-messages)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-members)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-members)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={36}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="members"
              stroke="var(--color-members)"
              strokeWidth={2}
              fill="url(#fillMembers)"
            />
            <Area
              type="monotone"
              dataKey="messages"
              stroke="var(--color-messages)"
              strokeWidth={2}
              fill="url(#fillMessages)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
