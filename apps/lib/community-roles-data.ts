export type PermissionCategory = 'content' | 'users' | 'moderation' | 'settings' | 'analytics' | 'subscription' | 'api' | 'system'

export interface Permission {
  id: string
  name: string
  description: string
  category: PermissionCategory
}

export interface RoleMember {
  userId: string
  username: string
  email: string
  avatarUrl: string | null
  assignedAt: string
  assignedBy: string
}

export interface Role {
  id: string
  name: string
  slug: string
  description: string
  color: string
  isSystem: boolean
  isDefault: boolean
  priority: number
  permissions: string[]
  memberCount: number
  members: RoleMember[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface RoleActivityEvent {
  id: string
  type: 'role-created' | 'role-updated' | 'role-deleted' | 'permission-added' | 'permission-removed' | 'member-added' | 'member-removed'
  message: string
  role: string
  timestamp: string
  details: string | null
  actor: string
}

export interface RolesOverview {
  totalRoles: number
  systemRoles: number
  customRoles: number
  totalPermissions: number
  totalAssignedPermissions: number
  membersWithCustomRoles: number
}

export interface CommunityRolesData {
  overview: RolesOverview
  permissions: Permission[]
  roles: Role[]
  activities: RoleActivityEvent[]
}

export const permissionDefinitions: Permission[] = [
  { id: 'content:read', name: 'Read Content', description: 'View content library and metadata', category: 'content' },
  { id: 'content:write', name: 'Write Content', description: 'Create, edit, and delete content entries', category: 'content' },
  { id: 'content:publish', name: 'Publish Content', description: 'Publish or unpublish content to production', category: 'content' },
  { id: 'content:moderate', name: 'Moderate Content', description: 'Review and approve/reject content submissions', category: 'content' },

  { id: 'users:read', name: 'Read Users', description: 'View user profiles and account information', category: 'users' },
  { id: 'users:write', name: 'Write Users', description: 'Edit user profiles and account settings', category: 'users' },
  { id: 'users:delete', name: 'Delete Users', description: 'Permanently delete user accounts', category: 'users' },
  { id: 'users:impersonate', name: 'Impersonate Users', description: 'Log in as another user for support purposes', category: 'users' },

  { id: 'moderation:read', name: 'Read Reports', description: 'View user reports and moderation queue', category: 'moderation' },
  { id: 'moderation:warn', name: 'Warn Users', description: 'Issue warnings to users for policy violations', category: 'moderation' },
  { id: 'moderation:suspend', name: 'Suspend Users', description: 'Temporarily suspend user accounts', category: 'moderation' },
  { id: 'moderation:ban', name: 'Ban Users', description: 'Permanently ban user accounts', category: 'moderation' },

  { id: 'settings:read', name: 'Read Settings', description: 'View platform configuration settings', category: 'settings' },
  { id: 'settings:manage', name: 'Manage Settings', description: 'Modify platform configuration settings', category: 'settings' },

  { id: 'analytics:read', name: 'Read Analytics', description: 'View platform analytics and reports', category: 'analytics' },
  { id: 'analytics:export', name: 'Export Analytics', description: 'Export analytics data to external formats', category: 'analytics' },

  { id: 'subscription:read', name: 'Read Subscriptions', description: 'View user subscription details', category: 'subscription' },
  { id: 'subscription:manage', name: 'Manage Subscriptions', description: 'Modify user subscription tiers and billing', category: 'subscription' },

  { id: 'api:read', name: 'Read API', description: 'View API usage and rate limits', category: 'api' },
  { id: 'api:access', name: 'Access API', description: 'Generate and manage API keys', category: 'api' },
  { id: 'api:admin', name: 'Admin API', description: 'Full API administrative access', category: 'api' },

  { id: 'system:read', name: 'Read System', description: 'View system health and infrastructure status', category: 'system' },
  { id: 'system:manage', name: 'Manage System', description: 'Modify system configuration and infrastructure', category: 'system' },
  { id: 'system:deploy', name: 'Deploy', description: 'Trigger deployments and rollbacks', category: 'system' },
]

export const communityRolesData: CommunityRolesData = {
  overview: {
    totalRoles: 6,
    systemRoles: 3,
    customRoles: 3,
    totalPermissions: permissionDefinitions.length,
    totalAssignedPermissions: 47,
    membersWithCustomRoles: 23,
  },
  permissions: permissionDefinitions,
  roles: [
    {
      id: 'role-001', name: 'Super Admin', slug: 'super-admin', description: 'Full platform access with unrestricted permissions across all systems',
      color: '#ef4444', isSystem: true, isDefault: false, priority: 1000,
      permissions: permissionDefinitions.map((p) => p.id),
      memberCount: 2,
      members: [
        { userId: 'usr-002', username: 'sarah.connor', email: 'sarah.connor@proton.me', avatarUrl: null, assignedAt: '2023-11-01T14:20:00Z', assignedBy: 'system' },
        { userId: 'usr-019', username: 'admin.root', email: 'root@kamisama.io', avatarUrl: null, assignedAt: '2023-06-01T00:00:00Z', assignedBy: 'system' },
      ],
      createdAt: '2023-06-01T00:00:00Z', updatedAt: '2023-06-01T00:00:00Z', createdBy: 'system',
    },
    {
      id: 'role-002', name: 'Moderator', slug: 'moderator', description: 'Content and user moderation capabilities with limited admin access',
      color: '#f59e0b', isSystem: true, isDefault: false, priority: 500,
      permissions: ['content:read', 'content:moderate', 'users:read', 'moderation:read', 'moderation:warn', 'moderation:suspend', 'moderation:ban', 'analytics:read'],
      memberCount: 5,
      members: [
        { userId: 'usr-003', username: 'lucas_martin', email: 'lucas.martin@orange.fr', avatarUrl: null, assignedAt: '2024-03-15T10:00:00Z', assignedBy: 'usr-002' },
        { userId: 'usr-011', username: 'anna_andersson', email: 'anna.andersson@icloud.com', avatarUrl: null, assignedAt: '2024-02-20T08:00:00Z', assignedBy: 'usr-002' },
        { userId: 'usr-020', username: 'mike_chen', email: 'mike.chen@gmail.com', avatarUrl: null, assignedAt: '2024-06-10T14:30:00Z', assignedBy: 'usr-002' },
      ],
      createdAt: '2023-06-01T00:00:00Z', updatedAt: '2024-06-10T14:30:00Z', createdBy: 'system',
    },
    {
      id: 'role-003', name: 'User', slug: 'user', description: 'Default role for all registered platform users with basic access',
      color: '#6b7280', isSystem: true, isDefault: true, priority: 0,
      permissions: ['content:read', 'profile:edit'],
      memberCount: 14798,
      members: [],
      createdAt: '2023-06-01T00:00:00Z', updatedAt: '2023-06-01T00:00:00Z', createdBy: 'system',
    },
    {
      id: 'role-004', name: 'Content Curator', slug: 'content-curator', description: 'Specialized role for content curation, metadata editing, and catalog management',
      color: '#8b5cf6', isSystem: false, isDefault: false, priority: 200,
      permissions: ['content:read', 'content:write', 'content:moderate', 'users:read', 'analytics:read'],
      memberCount: 8,
      members: [
        { userId: 'usr-006', username: 'chloe_dubois', email: 'chloe.dubois@laposte.net', avatarUrl: null, assignedAt: '2024-04-01T09:00:00Z', assignedBy: 'usr-002' },
        { userId: 'usr-012', username: 'pedro_silva', email: 'pedro.silva@gmail.com', avatarUrl: null, assignedAt: '2024-05-15T11:00:00Z', assignedBy: 'usr-002' },
        { userId: 'usr-021', username: 'yuki_sato', email: 'yuki.sato@mixi.jp', avatarUrl: null, assignedAt: '2024-07-01T06:00:00Z', assignedBy: 'usr-003' },
      ],
      createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-07-01T06:00:00Z', createdBy: 'usr-002',
    },
    {
      id: 'role-005', name: 'Support Agent', slug: 'support-agent', description: 'Customer support role with user management and ticket handling capabilities',
      color: '#06b6d4', isSystem: false, isDefault: false, priority: 150,
      permissions: ['users:read', 'users:write', 'users:impersonate', 'subscription:read', 'moderation:read', 'moderation:warn'],
      memberCount: 6,
      members: [
        { userId: 'usr-022', username: 'lisa_park', email: 'lisa.park@kamisama.io', avatarUrl: null, assignedAt: '2024-06-01T08:00:00Z', assignedBy: 'usr-002' },
        { userId: 'usr-023', username: 'james_lee', email: 'james.lee@kamisama.io', avatarUrl: null, assignedAt: '2024-06-15T10:00:00Z', assignedBy: 'usr-002' },
      ],
      createdAt: '2024-05-20T12:00:00Z', updatedAt: '2024-06-15T10:00:00Z', createdBy: 'usr-002',
    },
    {
      id: 'role-006', name: 'Analytics Viewer', slug: 'analytics-viewer', description: 'Read-only access to platform analytics, reports, and usage data',
      color: '#10b981', isSystem: false, isDefault: false, priority: 100,
      permissions: ['content:read', 'users:read', 'analytics:read', 'analytics:export'],
      memberCount: 4,
      members: [
        { userId: 'usr-024', username: 'tom_wilson', email: 'tom.wilson@partner.com', avatarUrl: null, assignedAt: '2024-07-10T14:00:00Z', assignedBy: 'usr-002' },
      ],
      createdAt: '2024-07-01T09:00:00Z', updatedAt: '2024-07-10T14:00:00Z', createdBy: 'usr-002',
    },
  ],
  activities: [
    { id: 'ra-001', type: 'role-created', message: 'New role created: Analytics Viewer', role: 'Analytics Viewer', timestamp: new Date(Date.now() - 86400_000 * 25).toISOString(), details: 'Permissions: content:read, users:read, analytics:read, analytics:export', actor: 'sarah.connor' },
    { id: 'ra-002', type: 'member-added', message: 'Member added to Support Agent: lisa_park', role: 'Support Agent', timestamp: new Date(Date.now() - 86400_000 * 55).toISOString(), details: 'Assigned by: sarah.connor | User: lisa.park@kamisama.io', actor: 'sarah.connor' },
    { id: 'ra-003', type: 'permission-added', message: 'Permission added to Content Curator: analytics:read', role: 'Content Curator', timestamp: new Date(Date.now() - 86400_000 * 40).toISOString(), details: 'Permission: analytics:read | Reason: Enable curation performance tracking', actor: 'sarah.connor' },
    { id: 'ra-004', type: 'member-added', message: 'Member added to Content Curator: pedro_silva', role: 'Content Curator', timestamp: new Date(Date.now() - 86400_000 * 72).toISOString(), details: 'Assigned by: sarah.connor | User: pedro.silva@gmail.com', actor: 'sarah.connor' },
    { id: 'ra-005', type: 'role-updated', message: 'Role updated: Moderator — 2 permissions added', role: 'Moderator', timestamp: new Date(Date.now() - 86400_000 * 90).toISOString(), details: 'Added: moderation:suspend, moderation:ban | Reason: Expand moderation capabilities', actor: 'sarah.connor' },
    { id: 'ra-006', type: 'member-added', message: 'Member added to Moderator: mike_chen', role: 'Moderator', timestamp: new Date(Date.now() - 86400_000 * 45).toISOString(), details: 'Assigned by: sarah.connor | User: mike.chen@gmail.com', actor: 'sarah.connor' },
    { id: 'ra-007', type: 'permission-added', message: 'Permission added to Support Agent: users:impersonate', role: 'Support Agent', timestamp: new Date(Date.now() - 86400_000 * 30).toISOString(), details: 'Permission: users:impersonate | Reason: Enable support troubleshooting', actor: 'sarah.connor' },
    { id: 'ra-008', type: 'member-added', message: 'Member added to Analytics Viewer: tom_wilson', role: 'Analytics Viewer', timestamp: new Date(Date.now() - 86400_000 * 15).toISOString(), details: 'Assigned by: sarah.connor | User: tom.wilson@partner.com', actor: 'sarah.connor' },
  ],
}
