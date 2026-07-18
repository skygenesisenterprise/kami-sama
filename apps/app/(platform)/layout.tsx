import { DashboardShell } from '@/components/admin/dashboard-shell'

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardShell>{children}</DashboardShell>
}
