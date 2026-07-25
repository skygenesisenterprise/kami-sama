import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge, StatusDot } from '@/components/dash/status-badge'
import {
  activityTimeline,
  latestPublished,
  publicationQueue,
  recentErrors,
  recentImports,
  runningWorkers,
  storagePools,
} from '@/lib/ops-data'

export function PublicationQueueCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publication Queue</CardTitle>
        <CardDescription>
          Items moving through the release pipeline right now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="hidden lg:table-cell">Scheduled</TableHead>
              <TableHead className="hidden lg:table-cell">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publicationQueue.map((item) => (
              <TableRow key={item.title}>
                <TableCell className="max-w-64 truncate font-medium">
                  {item.title}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {item.type}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={item.tone}>{item.stage}</StatusBadge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {item.scheduledFor}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {item.owner}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function RecentImportsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Imports</CardTitle>
        <CardDescription>Latest metadata and asset imports.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recentImports.map((imp) => (
          <div key={`${imp.source}-${imp.summary}`} className="flex items-center gap-3">
            <StatusDot tone={imp.tone} pulse={imp.status === 'Running'} />
            <div className="flex flex-1 flex-col">
              <p className="text-sm font-medium">
                {imp.source}
                <span className="text-muted-foreground"> — {imp.summary}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {imp.items.toLocaleString()} items · {imp.time}
              </p>
            </div>
            <StatusBadge tone={imp.tone}>{imp.status}</StatusBadge>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-xs text-muted-foreground"
          render={<Link href="/dash/sources/import-history" />}
        >
          View import history
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}

export function RecentErrorsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Errors</CardTitle>
        <CardDescription>Grouped failures across all services.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recentErrors.map((err) => (
          <div key={err.message} className="flex items-start gap-3">
            <StatusDot tone="destructive" className="mt-1.5" />
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-sm leading-snug font-medium">{err.message}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {err.service} · ×{err.count} · {err.time}
              </p>
            </div>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-xs text-muted-foreground"
          render={<Link href="/dash/operations/logs" />}
        >
          Open error logs
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}

export function RunningWorkersCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Workers</CardTitle>
        <CardDescription>Live worker pool activity.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {runningWorkers.map((worker) => (
          <div key={worker.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-medium">
                {worker.name}
              </span>
              <StatusBadge tone={worker.status === 'busy' ? 'info' : 'neutral'}>
                {worker.status}
              </StatusBadge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {worker.task}
            </p>
            <Progress value={worker.progress} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function LatestPublishedCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Published Episodes</CardTitle>
        <CardDescription>Most recent releases across regions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {latestPublished.map((ep) => (
          <div key={ep.title} className="flex items-center gap-3">
            <StatusDot tone="success" />
            <p className="flex-1 truncate text-sm font-medium">{ep.title}</p>
            <span className="text-xs text-muted-foreground">{ep.views}</span>
            <span className="w-14 text-right text-xs text-muted-foreground">
              {ep.time}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function StorageUsageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
        <CardDescription>Capacity across storage pools.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {storagePools.map((pool) => {
          const pct = Math.round((pool.used / pool.total) * 100)
          return (
            <div key={pool.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium">{pool.name}</span>
                <span className="font-mono text-muted-foreground">
                  {pool.used} / {pool.total} {pool.unit} ({pct}%)
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function ActivityTimelineCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Audit trail across the whole console.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative flex flex-col gap-0 border-l border-border pl-4">
          {activityTimeline.map((event, i) => (
            <li key={i} className="relative flex flex-col gap-0.5 pb-5 last:pb-0">
              <span className="absolute top-1.5 -left-[21.5px] size-2.5 rounded-full border-2 border-background bg-muted-foreground" />
              <p className="text-sm leading-snug">
                <span className="font-medium">{event.actor}</span>{' '}
                <span className="text-muted-foreground">{event.action}</span>{' '}
                <span className="font-medium">{event.target}</span>
              </p>
              <span className="text-xs text-muted-foreground">
                {event.time}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
