'use client'

import {
  BellRing,
  BookOpen,
  MessageSquareHeart,
  Settings2,
  Sparkles,
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { DiscordIntegration } from '@/lib/discord-data'

const integrationIcons: Record<string, LucideIcon> = {
  'anime-releases': BellRing,
  'manga-releases': BookOpen,
  'account-linking': Sparkles,
  'community-recommendations': MessageSquareHeart,
}

export function DiscordIntegrationsCard({
  integrations,
  onToggle,
}: {
  integrations: DiscordIntegration[]
  onToggle: (id: string, enabled: boolean) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Kami-Sama Integrations</CardTitle>
        <CardDescription>
          Modules that connect the community server to the Kami-Sama platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {integrations.map((integration, index) => {
          const Icon = integrationIcons[integration.id] ?? Sparkles
          return (
            <div
              key={integration.id}
              className={cn(
                'flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50',
                index > 0 && 'border-t border-border/50',
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4.5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.description}</p>
              </div>

              {integration.configurable && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label={`Configure ${integration.name}`}
                  onClick={() => toast.info(`Configure ${integration.name}…`)}
                >
                  <Settings2 className="size-4" />
                </Button>
              )}

              <div className="flex w-14 items-center justify-end">
                <Switch
                  checked={integration.state === 'enabled'}
                  onCheckedChange={(checked) => {
                    onToggle(integration.id, checked)
                    toast.success(
                      `${integration.name} ${checked ? 'enabled' : 'disabled'}`,
                    )
                  }}
                  aria-label={`${integration.name} toggle`}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
