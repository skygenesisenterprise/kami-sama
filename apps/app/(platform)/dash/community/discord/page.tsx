'use client'

import { ExternalLink, Settings } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dash/page-header'
import { StatusBadge } from '@/components/dash/status-badge'
import { DiscordServerCard, DiscordStatsGrid } from '@/components/dash/discord/server-overview'
import { CommunityActivityCard } from '@/components/dash/discord/community-activity'
import { BotHealthCard } from '@/components/dash/discord/bot-health'
import { DiscordIntegrationsCard } from '@/components/dash/discord/integrations'
import { AutomationPreviewCard } from '@/components/dash/discord/automation-preview'
import { RecentActivityCard } from '@/components/dash/discord/recent-activity'
import { QuickActions } from '@/components/dash/discord/quick-actions'
import { DiscordEmptyState, DiscordErrorState } from '@/components/dash/discord/discord-states'
import { DiscordPageSkeleton } from '@/components/dash/discord/discord-skeletons'
import { useDiscordCommunity } from '@/hooks/use-discord-community'

export default function DiscordCommunityPage() {
  const {
    data,
    status,
    connect,
    retry,
    toggleIntegration,
  } = useDiscordCommunity()

  /* ------------------------------ Loading ------------------------------ */
  if (!data) {
    return (
      <main className="flex flex-col gap-6">
        <DiscordPageSkeleton />
      </main>
    )
  }

  /* ---------------------------- Not connected --------------------------- */
  if (data.connectionState === 'disconnected') {
    return (
      <main className="flex flex-col gap-6">
        <DiscordEmptyState connecting={status === 'loading'} onConnect={connect} />
      </main>
    )
  }

  /* ------------------------------- Error ------------------------------- */
  if (data.connectionState === 'error') {
    return (
      <main className="flex flex-col gap-6">
        <DiscordErrorState lastSync={data.lastSync} onRetry={retry} />
      </main>
    )
  }

  /* ----------------------------- Connected ----------------------------- */
  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Discord Community"
        description="Manage the Kami-Sama Discord integration and community."
      >
        <StatusBadge tone="success" pulse>
          Connected
        </StatusBadge>
        <span className="text-xs text-muted-foreground">
          Synced {data.lastSync}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (data.server.inviteUrl) {
              window.open(data.server.inviteUrl, '_blank', 'noopener,noreferrer')
            } else {
              toast.info('No Discord invite configured yet')
            }
          }}
        >
          <ExternalLink className="size-3.5" />
          Open Discord
        </Button>
        <Button size="sm" onClick={() => toast.info('Discord settings…')}>
          <Settings className="size-3.5" />
          Manage
        </Button>
      </PageHeader>

      <DiscordServerCard server={data.server} />

      <DiscordStatsGrid stats={data.stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CommunityActivityCard series={data.activity} />
        </div>
        <BotHealthCard bot={data.bot} />
      </div>

      <DiscordIntegrationsCard
        integrations={data.integrations}
        onToggle={toggleIntegration}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AutomationPreviewCard previews={data.previews} />
        </div>
        <RecentActivityCard events={data.activityFeed} />
      </div>

      <QuickActions inviteUrl={data.server.inviteUrl} />
    </main>
  )
}
