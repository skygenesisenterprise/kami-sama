'use client'

import * as React from 'react'
import {
  Activity,
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserPlus,
  Users,
  UserX,
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
import { Progress } from '@/components/ui/progress'
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
import { StatusBadge, type StatusTone } from '@/components/dash/status-badge'
import { PageHeader } from '@/components/dash/page-header'
import { cn } from '@/lib/utils'

import {
  communityUsersData,
  type CommunityUsersData,
  type User,
  type UserStatus,
  type UserRole,
  type SubscriptionTier,
  countryFlag,
  countryName,
} from '@/lib/community-users-data'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function userStatusTone(s: UserStatus): StatusTone {
  return s === 'active' ? 'success' : s === 'suspended' ? 'warning' : s === 'banned' ? 'destructive' : 'info'
}

function roleIcon(role: UserRole) {
  return role === 'admin' ? ShieldAlert : role === 'moderator' ? ShieldCheck : Shield
}

function roleBadgeVariant(role: UserRole) {
  return role === 'admin' ? 'destructive' : role === 'moderator' ? 'secondary' : 'outline'
}

function subBadgeVariant(sub: SubscriptionTier) {
  return sub === 'enterprise' ? 'default' : sub === 'premium' ? 'secondary' : 'outline'
}

function subLabel(sub: SubscriptionTier) {
  return sub.charAt(0).toUpperCase() + sub.slice(1)
}

function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 100) return `${hours}h ${mins}m`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function userInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

/* -------------------------------------------------------------------------- */
/*  Stat Cards                                                                */
/* -------------------------------------------------------------------------- */

function StatsCards({ overview }: { overview: CommunityUsersData['overview'] }) {
  const cards = [
    { label: 'Total Users', value: overview.totalUsers.toLocaleString(), icon: Users, color: 'text-foreground' },
    { label: 'Active Users', value: overview.activeUsers.toLocaleString(), icon: Activity, color: 'text-success' },
    { label: 'New This Month', value: overview.newUsersThisMonth.toLocaleString(), icon: UserPlus, color: 'text-info' },
    { label: 'Premium', value: overview.premiumUsers.toLocaleString(), icon: ShieldCheck, color: 'text-primary' },
    { label: 'Enterprise', value: overview.enterpriseUsers.toLocaleString(), icon: ShieldAlert, color: 'text-foreground' },
    { label: 'Suspended', value: overview.suspendedUsers.toLocaleString(), icon: ShieldOff, color: 'text-warning' },
    { label: 'Banned', value: overview.bannedUsers.toLocaleString(), icon: Ban, color: 'text-destructive' },
    { label: 'Pending', value: overview.pendingUsers.toLocaleString(), icon: UserX, color: 'text-info' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 lg:grid-cols-8">
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
/*  User Detail Modal                                                         */
/* -------------------------------------------------------------------------- */

function UserDetailModal({
  user,
  open,
  onOpenChange,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!user) return null

  const RoleIcon = roleIcon(user.role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Account details for {user.username}</DialogDescription>
        </DialogHeader>

        {/* Profile header */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
            <AvatarFallback className="text-lg">{userInitials(user.username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{user.username}</h3>
              <StatusBadge tone={userStatusTone(user.status)}>{user.status}</StatusBadge>
              <Badge variant={roleBadgeVariant(user.role)} className="text-[10px] capitalize">
                <RoleIcon className="mr-1 size-3" />
                {user.role}
              </Badge>
              <Badge variant={subBadgeVariant(user.subscription)} className="text-[10px]">
                {subLabel(user.subscription)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.bio && <p className="mt-1 text-sm text-muted-foreground italic">&ldquo;{user.bio}&rdquo;</p>}
          </div>
        </div>

        <Separator />

        {/* Account info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Account ID</p>
            <p className="font-mono text-xs">{user.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Country</p>
            <p>{countryFlag(user.country)} {countryName(user.country)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p>{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last Login</p>
            <p>{formatDateTime(user.lastLogin)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email Verified</p>
            <StatusBadge tone={user.emailVerified ? 'success' : 'warning'}>
              {user.emailVerified ? 'verified' : 'unverified'}
            </StatusBadge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">OAuth Provider</p>
            <p>{user.oauthProvider ?? 'Email/Password'}</p>
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div>
          <h4 className="text-sm font-medium mb-3">Activity Statistics</h4>
          <div className="grid grid-cols-5 gap-3">
            <div className="rounded-md bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Watch Time</p>
              <p className="text-sm font-semibold">{formatWatchTime(user.stats.watchTimeMinutes)}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Content Watched</p>
              <p className="text-sm font-semibold">{user.stats.contentWatched}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Favorites</p>
              <p className="text-sm font-semibold">{user.stats.favorites}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Lists</p>
              <p className="text-sm font-semibold">{user.stats.lists}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">History</p>
              <p className="text-sm font-semibold">{user.stats.historyEntries.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Permissions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Permissions</h4>
          <div className="flex flex-wrap gap-1.5">
            {user.permissions.map((perm) => (
              <Badge key={perm} variant="outline" className="text-[10px] font-mono">{perm}</Badge>
            ))}
            {user.permissions.length === 0 && (
              <p className="text-xs text-muted-foreground">No permissions assigned</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Sessions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Active Sessions ({user.sessions.length})</h4>
          {user.sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active sessions</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-md bg-muted/50 p-3 text-xs">
                  <div>
                    <p className="font-medium">{session.device} &middot; {session.browser}</p>
                    <p className="text-muted-foreground">{session.ip} &middot; {session.location}</p>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p>Active: {timeAgo(session.lastActive)}</p>
                    <p>Since: {formatDate(session.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Recent History */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Watch History</h4>
          {user.recentHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No watch history</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.recentHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-md bg-muted/50 p-3 text-xs">
                  <div>
                    <p className="font-medium">{entry.contentTitle}</p>
                    <p className="text-muted-foreground capitalize">{entry.contentType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={entry.progressPercent} className="h-1.5" />
                    </div>
                    <span className="text-muted-foreground w-8 text-right">{entry.progressPercent}%</span>
                    <span className="text-muted-foreground">{timeAgo(entry.watchedAt)}</span>
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
  user,
  open,
  onOpenChange,
  onConfirm,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete <strong>{user.username}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false) }}>
            <Trash2 className="mr-1.5 size-3.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*  Users Table                                                               */
/* -------------------------------------------------------------------------- */

function UsersTable({
  users,
  onViewProfile,
  onEdit,
  onDisable,
  onDelete,
  onImpersonate,
}: {
  users: User[]
  onViewProfile: (user: User) => void
  onEdit: (user: User) => void
  onDisable: (user: User) => void
  onDelete: (user: User) => void
  onImpersonate: (user: User) => void
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const RoleIcon = roleIcon(user.role)
              return (
                <TableRow key={user.id} className="cursor-pointer" onClick={() => onViewProfile(user)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
                        <AvatarFallback className="text-[10px]">{userInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.username}</p>
                        {user.bio && <p className="text-[10px] text-muted-foreground truncate max-w-37.5">{user.bio}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{user.email}</TableCell>
                  <TableCell>
                    <StatusBadge tone={userStatusTone(user.status)}>{user.status}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.role)} className="text-[10px] capitalize">
                      <RoleIcon className="mr-1 size-3" />
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subBadgeVariant(user.subscription)} className="text-[10px]">
                      {subLabel(user.subscription)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span>{countryFlag(user.country)} {user.country}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{timeAgo(user.lastActivity)}</TableCell>
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
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProfile(user) }}>
                            <Eye className="mr-2 size-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(user) }}>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onImpersonate(user) }}>
                            <UserX className="mr-2 size-4" />
                            Impersonate
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDisable(user) }} className={user.status === 'suspended' ? 'text-success' : 'text-warning'}>
                            <ShieldOff className="mr-2 size-4" />
                            {user.status === 'suspended' ? 'Re-enable Account' : 'Suspend Account'}
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(user) }}>
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10

export default function CommunityUsersPage() {
  const data = communityUsersData

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [subFilter, setSubFilter] = React.useState<string>('all')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  const [page, setPage] = React.useState(1)

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const filteredUsers = React.useMemo(() => {
    let result = data.users

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((u) => u.status === statusFilter)
    }

    if (subFilter !== 'all') {
      result = result.filter((u) => u.subscription === subFilter)
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }

    return result
  }, [data.users, search, statusFilter, subFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [search, statusFilter, subFilter, roleFilter])

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage platform user accounts, roles, subscriptions, and access control."
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Export started')}>
          <Download className="mr-1.5 size-3.5" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Filters applied')}>
          <Filter className="mr-1.5 size-3.5" />
          Filter
        </Button>
        <Button size="sm" onClick={() => toast.info('Create user dialog')}>
          <UserPlus className="mr-1.5 size-3.5" />
          Create User
        </Button>
      </PageHeader>

      <StatsCards overview={data.overview} />

      {/* Search & Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-32.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subFilter} onValueChange={setSubFilter}>
            <SelectTrigger size="sm" className="w-32.5">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger size="sm" className="w-32.5">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          {(search || statusFilter !== 'all' || subFilter !== 'all' || roleFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setStatusFilter('all'); setSubFilter('all'); setRoleFilter('all') }}
              className="text-xs text-muted-foreground"
            >
              Clear filters
            </Button>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>

      {/* Table */}
      <UsersTable
        users={paginatedUsers}
        onViewProfile={(u) => { setSelectedUser(u); setDetailOpen(true) }}
        onEdit={(u) => toast.info(`Edit ${u.username}`)}
        onDisable={(u) => toast.warning(`${u.status === 'suspended' ? 'Re-enabled' : 'Suspended'} ${u.username}`)}
        onDelete={(u) => { setDeleteUser(u); setDeleteOpen(true) }}
        onImpersonate={(u) => toast.info(`Impersonating ${u.username}`)}
      />

      {/* Pagination */}
      {filteredUsers.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserDetailModal user={selectedUser} open={detailOpen} onOpenChange={setDetailOpen} />
      <ConfirmDeleteModal
        user={deleteUser}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => { if (deleteUser) toast.success(`Deleted ${deleteUser.username}`) }}
      />
    </main>
  )
}
