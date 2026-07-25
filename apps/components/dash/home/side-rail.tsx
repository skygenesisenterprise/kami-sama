import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarClock,
  FilePlus2,
  Import,
  RefreshCw,
  Rocket,
  ShieldAlert,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StatusDot } from '@/components/dash/status-badge'
import {
  backgroundJobs,
  licenseAlerts,
  moderatorQueue,
  pendingTasks,
  syncStatus,
  upcomingReleases,
} from '@/lib/ops-data'

const quickActions = [
  { title: 'New content item', icon: FilePlus2, href: '/dash/catalog/anime' },
  { title: 'Run TMDB import', icon: Import, href: '/dash/sources/tmdb' },
  { title: 'Force synchronization', icon: RefreshCw, href: '/dash/sources/synchronization' },
  { title: 'Publish queue now', icon: Rocket, href: '/dash/publishing/scheduled' },
]

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            size="sm"
            className="h-auto justify-start gap-2 py-2.5 text-left"
            render={<Link href={action.href} />}
          >
            <action.icon data-icon="inline-start" />
            <span className="text-xs leading-tight">{action.title}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export function PendingTasksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
        <CardDescription>Items that need an administrator.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {pendingTasks.map((task) => (
          <Link
            key={task.title}
            href={task.href}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-accent/60"
          >
            <span className="flex-1 text-sm leading-snug">{task.title}</span>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {task.tag}
            </Badge>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export function UpcomingReleasesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Scheduled Releases</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {upcomingReleases.map((release) => (
          <div key={release.title} className="flex items-center gap-3">
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-1 flex-col">
              <p className="truncate text-sm font-medium">{release.title}</p>
              <p className="text-xs text-muted-foreground">
                {release.when} · {release.regions}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function LicenseAlertsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>License Expiration Alerts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {licenseAlerts.map((license) => (
          <div key={license.title} className="flex items-center gap-3">
            <StatusDot tone="warning" />
            <p className="flex-1 truncate text-sm font-medium">
              {license.title}
            </p>
            <span className="text-xs text-muted-foreground">
              {license.region}
            </span>
            <Badge variant="outline" className="text-warning text-xs">
              {license.expires}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ModeratorQueueCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderator Queue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {moderatorQueue.map((item) => (
          <div key={item.detail} className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-xs font-medium text-muted-foreground">
                {item.type}
              </p>
              <p className="text-sm leading-snug">{item.detail}</p>
            </div>
            <Badge variant="secondary">{item.count}</Badge>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="mt-1"
          render={<Link href="/dash/community/reports" />}
        >
          Open moderation
        </Button>
      </CardContent>
    </Card>
  )
}

export function SyncStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Synchronization Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {syncStatus.map((sync) => (
          <div key={sync.source} className="flex items-center gap-3">
            <StatusDot tone={sync.tone} pulse={sync.tone === 'info'} />
            <span className="flex-1 text-sm font-medium">{sync.source}</span>
            <span className="text-xs text-muted-foreground">
              {sync.lastSync}
            </span>
            <span className="w-16 text-right text-xs text-muted-foreground">
              {sync.nextSync}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function BackgroundJobsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Jobs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {backgroundJobs.map((job) => (
          <div key={job.name} className="flex items-center gap-3">
            <span className="flex-1 truncate text-sm">{job.name}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {job.running} running
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              {job.queued} queued
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
