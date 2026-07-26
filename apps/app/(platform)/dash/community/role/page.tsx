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
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  communityRolesData,
  type CommunityRolesData,
  type Role,
  type Permission,
  type PermissionCategory,
  type RoleActivityEvent,
} from '@/lib/community-roles-data'

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

function userInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

function categoryLabel(cat: PermissionCategory): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function categoryColor(cat: PermissionCategory) {
  const map: Record<PermissionCategory, string> = {
    content: 'bg-blue-500/10 text-blue-600',
    users: 'bg-purple-500/10 text-purple-600',
    moderation: 'bg-amber-500/10 text-amber-600',
    settings: 'bg-gray-500/10 text-gray-600',
    analytics: 'bg-emerald-500/10 text-emerald-600',
    subscription: 'bg-cyan-500/10 text-cyan-600',
    api: 'bg-pink-500/10 text-pink-600',
    system: 'bg-red-500/10 text-red-600',
  }
  return map[cat] ?? 'bg-muted text-muted-foreground'
}

function activityIcon(type: RoleActivityEvent['type']) {
  const map: Record<RoleActivityEvent['type'], typeof Shield> = {
    'role-created': Plus,
    'role-updated': Edit,
    'role-deleted': Trash2,
    'permission-added': Key,
    'permission-removed': Key,
    'member-added': Users,
    'member-removed': Users,
  }
  return map[type] ?? Shield
}

function activityColor(type: RoleActivityEvent['type']) {
  if (type === 'role-created' || type === 'permission-added' || type === 'member-added') return 'text-success'
  if (type === 'role-deleted' || type === 'permission-removed' || type === 'member-removed') return 'text-destructive'
  if (type === 'role-updated') return 'text-info'
  return 'text-muted-foreground'
}

/* -------------------------------------------------------------------------- */
/*  Stat Cards                                                                */
/* -------------------------------------------------------------------------- */

function StatsCards({ overview }: { overview: CommunityRolesData['overview'] }) {
  const cards = [
    { label: 'Total Roles', value: overview.totalRoles, icon: Shield, color: 'text-foreground' },
    { label: 'System Roles', value: overview.systemRoles, icon: ShieldAlert, color: 'text-primary' },
    { label: 'Custom Roles', value: overview.customRoles, icon: ShieldCheck, color: 'text-info' },
    { label: 'Permissions', value: overview.totalPermissions, icon: Key, color: 'text-foreground' },
    { label: 'Assigned', value: overview.totalAssignedPermissions, icon: ShieldCheck, color: 'text-success' },
    { label: 'Custom Members', value: overview.membersWithCustomRoles, icon: Users, color: 'text-foreground' },
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
/*  Role Detail Modal                                                         */
/* -------------------------------------------------------------------------- */

function RoleDetailModal({
  role,
  allPermissions,
  open,
  onOpenChange,
}: {
  role: Role | null
  allPermissions: Permission[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!role) return null

  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (role.permissions.includes(perm.id)) {
        if (!acc[perm.category]) acc[perm.category] = []
        acc[perm.category].push(perm)
      }
      return acc
    },
    {} as Record<PermissionCategory, Permission[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
          <DialogDescription>Configuration and members for {role.name}</DialogDescription>
        </DialogHeader>

        {/* Role header */}
        <div className="flex items-center gap-4">
          <div
            className="flex size-14 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${role.color}15` }}
          >
            <Shield className="size-7" style={{ color: role.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{role.name}</h3>
              {role.isSystem && <Badge variant="secondary" className="text-[10px]">System</Badge>}
              {role.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>
        </div>

        <Separator />

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Priority</p>
            <p className="font-semibold">{role.priority}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Members</p>
            <p className="font-semibold">{role.memberCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Permissions</p>
            <p className="font-semibold">{role.permissions.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p>{formatDate(role.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Updated</p>
            <p>{formatDate(role.updatedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created By</p>
            <p>{role.createdBy}</p>
          </div>
        </div>

        <Separator />

        {/* Permissions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Permissions ({role.permissions.length})</h4>
          <div className="flex flex-col gap-3">
            {(Object.keys(groupedPermissions) as PermissionCategory[]).map((cat) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className={cn('text-[10px] capitalize', categoryColor(cat))}>
                    {categoryLabel(cat)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{groupedPermissions[cat].length} permissions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupedPermissions[cat].map((perm) => (
                    <Badge key={perm.id} variant="secondary" className="text-[10px]">{perm.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Members */}
        <div>
          <h4 className="text-sm font-medium mb-3">Members ({role.members.length})</h4>
          {role.members.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {role.isDefault ? 'This role is automatically assigned to all users' : 'No members assigned'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {role.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between rounded-md bg-muted/50 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={member.avatarUrl ?? undefined} alt={member.username} />
                      <AvatarFallback className="text-[10px]">{userInitials(member.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.username}</p>
                      <p className="text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p>Assigned: {formatDate(member.assignedAt)}</p>
                    <p>By: {member.assignedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*  Confirm Delete Modal                                                      */
/* -------------------------------------------------------------------------- */

function ConfirmDeleteModal({
  role,
  open,
  onOpenChange,
  onConfirm,
}: {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{role.name}</strong>?
            {role.isSystem ? ' This is a system role and cannot be deleted.' : ` This will remove the role from ${role.memberCount} member(s).`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={role.isSystem} onClick={() => { onConfirm(); onOpenChange(false) }}>
            <Trash2 className="mr-1.5 size-3.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*  Roles Table                                                               */
/* -------------------------------------------------------------------------- */

function RolesTable({
  roles,
  onViewDetail,
  onEdit,
  onDelete,
}: {
  roles: Role[]
  onViewDetail: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}) {
  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium">No roles found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or create a new role</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} className="cursor-pointer" onClick={() => onViewDetail(role)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${role.color}15` }}
                    >
                      <Shield className="size-4.5" style={{ color: role.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{role.name}</p>
                        {role.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate max-w-62.5">{role.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isSystem ? 'secondary' : 'outline'} className="text-[10px]">
                    {role.isSystem ? 'System' : 'Custom'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{role.priority}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{role.memberCount.toLocaleString()}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{role.permissions.length}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo(role.updatedAt)}</TableCell>
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetail(role) }}>
                          <Eye className="mr-2 size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(role) }}>
                          <Edit className="mr-2 size-4" />
                          Edit Role
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={role.isSystem}
                          onClick={(e) => { e.stopPropagation(); onDelete(role) }}
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
  )
}

/* -------------------------------------------------------------------------- */
/*  Activity Tab                                                              */
/* -------------------------------------------------------------------------- */

function ActivityTab({ activities }: { activities: RoleActivityEvent[] }) {
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
                    <Badge variant="outline" className="text-[10px]">{act.role}</Badge>
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
  { value: 'roles', label: 'Roles' },
  { value: 'activity', label: 'Activity' },
] as const

export default function CommunityRolesPage() {
  const data = communityRolesData

  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [tab, setTab] = React.useState<string>('roles')

  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [deleteRole, setDeleteRole] = React.useState<Role | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const filteredRoles = React.useMemo(() => {
    let result = data.roles

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.slug.includes(q),
      )
    }

    if (typeFilter === 'system') {
      result = result.filter((r) => r.isSystem)
    } else if (typeFilter === 'custom') {
      result = result.filter((r) => !r.isSystem)
    }

    return result
  }, [data.roles, search, typeFilter])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Roles"
        description="Manage user roles, permissions, and access control across the platform."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Export started')}>
          <Download className="mr-1.5 size-3.5" />
          Export
        </Button>
        <Button size="sm" onClick={() => toast.info('Create role dialog')}>
          <Plus className="mr-1.5 size-3.5" />
          Create Role
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

      {tab === 'roles' && (
        <>
          {/* Search & Filters */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <div className="relative flex-1 min-w-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger size="sm" className="w-32.5">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {(search || typeFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(''); setTypeFilter('all') }}
                  className="text-xs text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}

              <span className="text-xs text-muted-foreground ml-auto">
                {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''}
              </span>
            </CardContent>
          </Card>

          <RolesTable
            roles={filteredRoles}
            onViewDetail={(r) => { setSelectedRole(r); setDetailOpen(true) }}
            onEdit={(r) => toast.info(`Edit ${r.name}`)}
            onDelete={(r) => { setDeleteRole(r); setDeleteOpen(true) }}
          />
        </>
      )}

      {tab === 'activity' && (
        <ActivityTab activities={data.activities} />
      )}

      {/* Modals */}
      <RoleDetailModal
        role={selectedRole}
        allPermissions={data.permissions}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <ConfirmDeleteModal
        role={deleteRole}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => { if (deleteRole) toast.success(`Deleted ${deleteRole.name}`) }}
      />
    </main>
  )
}
