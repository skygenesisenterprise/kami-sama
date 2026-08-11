'use client'

import * as React from 'react'
import {
  BookOpenText,
  Flame,
  Hash,
  Play,
  Sparkles,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DiscordLogo } from '@/components/dash/discord/discord-logo'
import { cn } from '@/lib/utils'
import type { DiscordAutomationPreview, PreviewKind } from '@/lib/discord-data'

const previewIcons: Record<PreviewKind, LucideIcon> = {
  'anime-release': Sparkles,
  'new-anime': BookOpenText,
  'weekly-trending': Flame,
}

export function AutomationPreviewCard({
  previews,
}: {
  previews: DiscordAutomationPreview[]
}) {
  const [active, setActive] = React.useState<PreviewKind>('anime-release')
  const current = previews.find((p) => p.kind === active) ?? previews[0]
  const PreviewIcon = previewIcons[current.kind]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <WandSparkles className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">Automation Preview</CardTitle>
              <CardDescription>
                How Kami-Sama will publish events to your server.
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Preview type selector */}
        <div
          role="group"
          aria-label="Preview type"
          className="flex flex-wrap items-center gap-1.5"
        >
          {previews.map((preview) => {
            const Icon = previewIcons[preview.kind]
            return (
              <Button
                key={preview.kind}
                size="sm"
                variant={active === preview.kind ? 'default' : 'outline'}
                className={cn(active !== preview.kind && 'text-muted-foreground')}
                onClick={() => setActive(preview.kind)}
              >
                <Icon className="size-3.5" />
                {preview.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Discord-style message mock */}
        <div className="overflow-hidden rounded-xl border bg-background/60">
          {/* Channel header */}
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#5865F2]/15 text-[#5865F2]">
              <DiscordLogo className="size-3.5" />
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Hash className="size-3.5 text-muted-foreground" />
              {current.channel}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <BotPill />
            </span>
          </div>

          {/* Message body */}
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5865F2]/15 text-[#5865F2]">
                <PreviewIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Kami-Sama Bot</span>
                  <span className="text-[10px] text-muted-foreground">APP</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Today at 21:42
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{current.title}</p>
              </div>
            </div>

            {/* Embed */}
            <div className="ml-1 flex items-stretch overflow-hidden rounded-lg border">
              <div className="w-1 shrink-0 bg-primary" />
              <div className="flex flex-1 flex-col gap-1.5 bg-card p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {current.meta}
                </p>
                <p className="text-sm font-semibold">{current.subtitle}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{current.body}</p>
                <div className="mt-2">
                  <Button size="sm" onClick={() => toast.info(`Opening ${current.kind} flow…`)}>
                    <Play className="size-3.5 fill-current" />
                    {current.cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BotPill() {
  return (
    <>
      <span className="size-1.5 rounded-full bg-success" />
      BOT
    </>
  )
}
