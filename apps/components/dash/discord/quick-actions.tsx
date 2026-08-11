'use client'

import {
  Bell,
  Bot,
  ExternalLink,
  Hash,
  Users,
  Workflow,
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

const actions: Array<{
  label: string
  icon: LucideIcon
  action: 'toast' | 'open-discord' | 'link'
  href?: string
}> = [
  { label: 'Configure notifications', icon: Bell, action: 'toast' },
  { label: 'Manage bot', icon: Bot, action: 'toast' },
  { label: 'View members', icon: Users, action: 'toast' },
  { label: 'Manage channels', icon: Hash, action: 'toast' },
  { label: 'View automations', icon: Workflow, action: 'toast' },
  { label: 'Open Discord', icon: ExternalLink, action: 'open-discord' },
]

export function QuickActions({
  inviteUrl,
}: {
  inviteUrl: string | null
}) {
  const handle = (action: (typeof actions)[number]) => {
    if (action.action === 'open-discord') {
      if (inviteUrl) {
        window.open(inviteUrl, '_blank', 'noopener,noreferrer')
      } else {
        toast.info('No Discord invite configured yet')
      }
      return
    }
    toast.info(`${action.label}…`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick actions</CardTitle>
        <CardDescription>Jump straight to common tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="h-auto justify-start gap-2 py-2.5"
              onClick={() => handle(action)}
            >
              <action.icon className="size-3.5 text-muted-foreground" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
