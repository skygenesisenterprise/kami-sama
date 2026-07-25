import { StatusBadge } from '@/components/dash/status-badge'
import { platformHealth } from '@/lib/ops-data'

export function HealthStrip() {
  return (
    <section aria-label="Platform health">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {platformHealth.map((svc) => (
          <div
            key={svc.name}
            className="flex flex-col gap-2 rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{svc.name}</p>
            </div>
            <StatusBadge tone={svc.tone} pulse={svc.tone !== 'success'}>
              {svc.status}
            </StatusBadge>
            <p className="font-mono text-xs text-muted-foreground">
              {svc.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
