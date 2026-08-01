import type { Metadata } from 'next'

import { PageHeader } from '@/components/dash/page-header'
import { HealthStrip } from '@/components/dash/home/health-strip'
import {
  ActivityTimelineCard,
  LatestPublishedCard,
  PublicationQueueCard,
  RecentErrorsCard,
  RecentImportsCard,
  RunningWorkersCard,
  StorageUsageCard,
} from '@/components/dash/home/ops-widgets'
import {
  BackgroundJobsCard,
  LicenseAlertsCard,
  ModeratorQueueCard,
  PendingTasksCard,
  QuickActionsCard,
  SyncStatusCard,
  UpcomingReleasesCard,
} from '@/components/dash/home/side-rail'

export const metadata: Metadata = {
  title: 'Kami-Sama: Operations Center',
}

export default function DashHomePage() {
  return (
    <main className="flex flex-col gap-6 select-none">
      <PageHeader
        title="Operations Center"
        description="Live view of everything moving through the Kami-Sama platform. Take action on imports, publications, infrastructure and moderation."
      />
      <HealthStrip />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <PublicationQueueCard />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentImportsCard />
            <RecentErrorsCard />
            <RunningWorkersCard />
            <LatestPublishedCard />
          </div>
          <ActivityTimelineCard />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActionsCard />
          <PendingTasksCard />
          <UpcomingReleasesCard />
          <LicenseAlertsCard />
          <ModeratorQueueCard />
          <SyncStatusCard />
          <StorageUsageCard />
          <BackgroundJobsCard />
        </div>
      </div>
    </main>
  )
}
