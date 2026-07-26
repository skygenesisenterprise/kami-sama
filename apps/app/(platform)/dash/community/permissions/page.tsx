'use client'

import * as React from 'react'
import {
  Download,
  Edit,
  Eye,
  Key,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/dash/page-header'
import { cn } from '@/lib/utils'

import {
  communityPermissionsData,
  type CommunityPermissionsData,
  type PermissionDetail,
  type PermissionCategory,
  type PermissionsActivityEvent,
} from '@/lib/community-permissions-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function categoryLabel(cat: PermissionCategory): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function categoryColor(cat: PermissionCategory) {
  const map: Record<PermissionCategory, string> = {
    content: 'bg-blue-500/10 text-blue-600 border-blue-200',
    users: 'bg-purple-500/10 text-purple-600 border-purple-200',
    moderation: 'bg-amber-500/10 text-amber-600 border-amber-200',
    settings: 'bg-gray-500/10 text-gray-600 border-gray-200',
    analytics: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    subscription: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    api: 'bg-pink-500/10 text-pink-600 border-pink-200',
    system: 'bg-red-500/10 text-red-600 border-red-200',
  }
  return map[cat] ?? 'bg-muted text-muted-foreground'
}

function categoryDotColor(cat: PermissionCategory) {
  const map: Record<PermissionCategory, string> = {
    content: 'bg-blue-500',
    users: 'bg-purple-500',
    moderation: 'bg-amber-500',
    settings: 'bg-gray-500',
    analytics: 'bg-emerald-500',
    subscription: 'bg-cyan-500',
    api: 'bg-pink-500',
    system: 'bg-red-500',
  }
  return map[cat] ?? 'bg-muted-foreground'
}

const ALL_CATEGORIES: PermissionCategory[] = ['content', 'users', 'moderation', 'settings', 'analytics', 'subscription', 'api', 'system']

function activityIcon(type: PermissionsActivityEvent['type']) {
  const map: Record<PermissionsActivityEvent['type'], typeof Key> = {
    'permission-added': Plus,
    'permission-removed': Trash2,
    'permission-updated': Edit,
    'bulk-assign': Shield,
  }
  return map[type] ?? Key
}

function activityColor(type: PermissionsActivityEvent['type']) {
  if (type === 'permission-added' || type === 'bulk-assign') return 'text-success'
  if (type === 'permission-removed') return 'text-destructive'
  if (type === 'permission-updated') return 'text-info'
  return 'text-muted-foreground'
}

/* -------------------------------------------------------------------------- */
/*  Stat Cards                                                                */
/* -------------------------------------------------------------------------- */

function StatsCards({ overview }: { overview: CommunityPermissionsData['overview'] }) {
  const cards = [
    { label: 'Total Permissions', value: overview.totalPermissions, icon: Key, color: 'text-foreground' },
    { label: 'Categories', value: overview.totalCategories, icon: Shield, color: 'text-info' },
    { label: 'Assigned', value: overview.assignedPermissions, icon: Edit, color: 'text-success' },
    { label: 'Unassigned', value: overview.unassignedPermissions, icon: Trash2, color: overview.unassignedPermissions > 0 ? 'text-warning' : 'text-success' },
    { label: 'Roles Using', value: overview.totalRoles, icon: Shield, color: 'text-foreground' },
    { label: 'Users with Access', value: overview.totalUsersWithPermissions, icon: Eye, color: 'text-foreground' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.icon className="size-3.5" />
              {s.label}
            </div>
            <p className={cn('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Permission Detail Modal                                                   */
/* -------------------------------------------------------------------------- */

function PermissionDetailModal({
  permission,
  open,
  onOpenChange,
}: {
  permission: PermissionDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!permission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permission Details</DialogTitle>
          <DialogDescription>{permission.description}</DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={cn('flex size-10 items-center justify-center rounded-lg', categoryColor(permission.category))}>
            <Key className="size-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-semibold">{permission.id}</h3>
              {permission.isSystem && <Badge variant="secondary" className="text-[10px]">System</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{permission.name}</p>
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Roles</p>
            <p className="text-lg font-semibold">{permission.roleCount}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Users</p>
            <p className="text-lg font-semibold">{permission.totalUsers.toLocaleString()}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Category</p>
            <Badge variant="outline" className={cn('text-[10px] capitalize mt-1', categoryColor(permission.category))}>
              {categoryLabel(permission.category)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Roles */}
        <div>
          <h4 className="text-sm font-medium mb-3">Assigned Roles ({permission.roles.length})</h4>
          <div className="flex flex-col gap-2">
            {permission.roles.map((role) => (
              <div key={role.roleId} className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${role.roleColor}15` }}
                  >
                    <Shield className="size-4" style={{ color: role.roleColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{role.roleName}</p>
                    <p className="text-[10px] text-muted-foreground">{role.memberCount} member{role.memberCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{role.memberCount} users</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          Created: {formatDate(permission.createdAt)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*  Permissions Table                                                         */
/* -------------------------------------------------------------------------- */

function PermissionsTable({
  permissions,
  onViewDetail,
  onEdit,
  onDelete,
}: {
  permissions: PermissionDetail[]
  onViewDetail: (perm: PermissionDetail) => void
  onEdit: (perm: PermissionDetail) => void
  onDelete: (perm: PermissionDetail) => void
}) {
  if (permissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Key className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium">No permissions found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    )
  }

  const grouped = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = []
      acc[perm.category].push(perm)
      return acc
    },
    {} as Record<PermissionCategory, PermissionDetail[]>,
  )

  return (
    <div className="flex flex-col gap-4">
      {ALL_CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
        <div key={cat} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className={cn('size-2 rounded-full', categoryDotColor(cat))} />
            <h3 className="text-sm font-medium">{categoryLabel(cat)}</h3>
            <Badge variant="secondary" className="text-[10px]">{grouped[cat].length}</Badge>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="w-12.5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped[cat].map((perm) => (
                    <TableRow key={perm.id} className="cursor-pointer" onClick={() => onViewDetail(perm)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium">{perm.id}</span>
                          {!perm.isSystem && <Badge variant="outline" className="text-[10px]">Custom</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{perm.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {perm.roles.slice(0, 3).map((role) => (
                            <Badge key={role.roleId} variant="secondary" className="text-[10px]">
                              <div className="mr-1 size-1.5 rounded-full" style={{ backgroundColor: role.roleColor }} />
                              {role.roleName}
                            </Badge>
                          ))}
                          {perm.roles.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">+{perm.roles.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{perm.totalUsers.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetail(perm) }}>
                                <Eye className="mr-2 size-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(perm) }}>
                                <Edit className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={perm.isSystem}
                                onClick={(e) => { e.stopPropagation(); onDelete(perm) }}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Activity Tab                                                              */
/* -------------------------------------------------------------------------- */

function ActivityTab({ activities }: { activities: PermissionsActivityEvent[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.map((act) => {
            const Icon = activityIcon(act.type)
            const color = activityColor(act.type)
            return (
              <div key={act.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50">
                <div className={cn('mt-0.5', color)}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{act.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] font-mono">{act.permission}</Badge>
                    <span className="text-xs text-muted-foreground">&middot;</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(act.timestamp)}</span>
                    <span className="text-xs text-muted-foreground">&middot;</span>
                    <span className="text-xs text-muted-foreground">{act.actor}</span>
                  </div>
                  {act.details && (
                    <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">{act.details}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

const TABS = [
  { value: 'permissions', label: 'Permissions' },
  { value: 'activity', label: 'Activity' },
] as const

export default function CommunityPermissionsPage() {
  const data = communityPermissionsData

  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [tab, setTab] = React.useState<string>('permissions')

  const [selectedPerm, setSelectedPerm] = React.useState<PermissionDetail | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [deletePerm, setDeletePerm] = React.useState<PermissionDetail | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const filteredPermissions = React.useMemo(() => {
    let result = data.permissions

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter)
    }

    return result
  }, [data.permissions, search, categoryFilter])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Permissions"
        description="Manage platform permissions, view role assignments, and audit access control."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Export started')}>
          <Download className="mr-1.5 size-3.5" />
          Export
        </Button>
        <Button size="sm" onClick={() => toast.info('Create permission dialog')}>
          <Plus className="mr-1.5 size-3.5" />
          Create Permission
        </Button>
      </PageHeader>

      <StatsCards overview={data.overview} />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b pb-0">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'permissions' && (
        <>
          {/* Search & Filters */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <div className="relative flex-1 min-w-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger size="sm" className="w-32.5">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{categoryLabel(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(search || categoryFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(''); setCategoryFilter('all') }}
                  className="text-xs text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}

              <span className="text-xs text-muted-foreground ml-auto">
                {filteredPermissions.length} permission{filteredPermissions.length !== 1 ? 's' : ''}
              </span>
            </CardContent>
          </Card>

          <PermissionsTable
            permissions={filteredPermissions}
            onViewDetail={(p) => { setSelectedPerm(p); setDetailOpen(true) }}
            onEdit={(p) => toast.info(`Edit ${p.id}`)}
            onDelete={(p) => { setDeletePerm(p); setDeleteOpen(true) }}
          />
        </>
      )}

      {tab === 'activity' && (
        <ActivityTab activities={data.activities} />
      )}

      {/* Modals */}
      <PermissionDetailModal
        permission={selectedPerm}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              {deletePerm?.isSystem ? (
                'This is a system permission and cannot be deleted.'
              ) : (
                <>Are you sure you want to delete <strong className="font-mono">{deletePerm?.id}</strong>? This will remove it from all assigned roles.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deletePerm?.isSystem} onClick={() => { if (deletePerm) toast.success(`Deleted ${deletePerm.id}`); setDeleteOpen(false) }}>
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
