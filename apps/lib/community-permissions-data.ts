export type PermissionCategory = 'content' | 'users' | 'moderation' | 'settings' | 'analytics' | 'subscription' | 'api' | 'system'

export interface PermissionRoleAssignment {
  roleId: string
  roleName: string
  roleColor: string
  memberCount: number
}

export interface PermissionDetail {
  id: string
  name: string
  description: string
  category: PermissionCategory
  roleCount: number
  totalUsers: number
  roles: PermissionRoleAssignment[]
  isSystem: boolean
  createdAt: string
}

export interface PermissionsActivityEvent {
  id: string
  type: 'permission-added' | 'permission-removed' | 'permission-updated' | 'bulk-assign'
  message: string
  permission: string
  timestamp: string
  details: string | null
  actor: string
}

export interface PermissionsOverview {
  totalPermissions: number
  totalCategories: number
  assignedPermissions: number
  unassignedPermissions: number
  totalRoles: number
  totalUsersWithPermissions: number
}

export interface CommunityPermissionsData {
  overview: PermissionsOverview
  permissions: PermissionDetail[]
  activities: PermissionsActivityEvent[]
}

export const communityPermissionsData: CommunityPermissionsData = {
  overview: {
    totalPermissions: 24,
    totalCategories: 8,
    assignedPermissions: 19,
    unassignedPermissions: 5,
    totalRoles: 6,
    totalUsersWithPermissions: 23,
  },
  permissions: [
    { id: 'content:read', name: 'Read Content', description: 'View content library and metadata', category: 'content', roleCount: 5, totalUsers: 14832, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }, { roleId: 'role-003', roleName: 'User', roleColor: '#6b7280', memberCount: 14798 }, { roleId: 'role-004', roleName: 'Content Curator', roleColor: '#8b5cf6', memberCount: 8 }, { roleId: 'role-006', roleName: 'Analytics Viewer', roleColor: '#10b981', memberCount: 4 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'content:write', name: 'Write Content', description: 'Create, edit, and delete content entries', category: 'content', roleCount: 2, totalUsers: 10, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-004', roleName: 'Content Curator', roleColor: '#8b5cf6', memberCount: 8 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'content:publish', name: 'Publish Content', description: 'Publish or unpublish content to production', category: 'content', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'content:moderate', name: 'Moderate Content', description: 'Review and approve/reject content submissions', category: 'content', roleCount: 2, totalUsers: 13, roles: [{ roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }, { roleId: 'role-004', roleName: 'Content Curator', roleColor: '#8b5cf6', memberCount: 8 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },

    { id: 'users:read', name: 'Read Users', description: 'View user profiles and account information', category: 'users', roleCount: 4, totalUsers: 21, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }, { roleId: 'role-004', roleName: 'Content Curator', roleColor: '#8b5cf6', memberCount: 8 }, { roleId: 'role-005', roleName: 'Support Agent', roleColor: '#06b6d4', memberCount: 6 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'users:write', name: 'Write Users', description: 'Edit user profiles and account settings', category: 'users', roleCount: 2, totalUsers: 8, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-005', roleName: 'Support Agent', roleColor: '#06b6d4', memberCount: 6 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'users:delete', name: 'Delete Users', description: 'Permanently delete user accounts', category: 'users', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'users:impersonate', name: 'Impersonate Users', description: 'Log in as another user for support purposes', category: 'users', roleCount: 2, totalUsers: 8, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-005', roleName: 'Support Agent', roleColor: '#06b6d4', memberCount: 6 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },

    { id: 'moderation:read', name: 'Read Reports', description: 'View user reports and moderation queue', category: 'moderation', roleCount: 3, totalUsers: 13, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }, { roleId: 'role-005', roleName: 'Support Agent', roleColor: '#06b6d4', memberCount: 6 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'moderation:warn', name: 'Warn Users', description: 'Issue warnings to users for policy violations', category: 'moderation', roleCount: 3, totalUsers: 13, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }, { roleId: 'role-005', roleName: 'Support Agent', roleColor: '#06b6d4', memberCount: 6 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'moderation:suspend', name: 'Suspend Users', description: 'Temporarily suspend user accounts', category: 'moderation', roleCount: 2, totalUsers: 7, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'moderation:ban', name: 'Ban Users', description: 'Permanently ban user accounts', category: 'moderation', roleCount: 2, totalUsers: 7, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },

    { id: 'settings:read', name: 'Read Settings', description: 'View platform configuration settings', category: 'settings', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'settings:manage', name: 'Manage Settings', description: 'Modify platform configuration settings', category: 'settings', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },

    { id: 'analytics:read', name: 'Read Analytics', description: 'View platform analytics and reports', category: 'analytics', roleCount: 4, totalUsers: 19, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-002', roleName: 'Moderator', roleColor: '#f59e0b', memberCount: 5 }, { roleId: 'role-004', roleName: 'Content Curator', roleColor: '#8b5cf6', memberCount: 8 }, { roleId: 'role-006', roleName: 'Analytics Viewer', roleColor: '#10b981', memberCount: 4 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'analytics:export', name: 'Export Analytics', description: 'Export analytics data to external formats', category: 'analytics', roleCount: 2, totalUsers: 6, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-006', roleName: 'Analytics Viewer', roleColor: '#10b981', memberCount: 4 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },

    { id: 'subscription:read', name: 'Read Subscriptions', description: 'View user subscription details', category: 'subscription', roleCount: 2, totalUsers: 8, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }, { roleId: 'role-005', roleName: 'Support Agent', roleColor: '#06b6d4', memberCount: 6 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'subscription:manage', name: 'Manage Subscriptions', description: 'Modify user subscription tiers and billing', category: 'subscription', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },

    { id: 'api:read', name: 'Read API', description: 'View API usage and rate limits', category: 'api', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'api:access', name: 'Access API', description: 'Generate and manage API keys', category: 'api', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: false, createdAt: '2024-01-15T10:00:00Z' },
    { id: 'api:admin', name: 'Admin API', description: 'Full API administrative access', category: 'api', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: false, createdAt: '2024-01-15T10:00:00Z' },

    { id: 'system:read', name: 'Read System', description: 'View system health and infrastructure status', category: 'system', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'system:manage', name: 'Manage System', description: 'Modify system configuration and infrastructure', category: 'system', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: true, createdAt: '2023-06-01T00:00:00Z' },
    { id: 'system:deploy', name: 'Deploy', description: 'Trigger deployments and rollbacks', category: 'system', roleCount: 1, totalUsers: 2, roles: [{ roleId: 'role-001', roleName: 'Super Admin', roleColor: '#ef4444', memberCount: 2 }], isSystem: false, createdAt: '2024-02-01T08:00:00Z' },
  ],
  activities: [
    { id: 'pa-001', type: 'permission-added', message: 'Permission added to Support Agent: users:impersonate', permission: 'users:impersonate', timestamp: new Date(Date.now() - 86400_000 * 30).toISOString(), details: 'Role: Support Agent | Reason: Enable support troubleshooting | Approved by: sarah.connor', actor: 'sarah.connor' },
    { id: 'pa-002', type: 'permission-added', message: 'Permission added to Content Curator: analytics:read', permission: 'analytics:read', timestamp: new Date(Date.now() - 86400_000 * 40).toISOString(), details: 'Role: Content Curator | Reason: Enable curation performance tracking', actor: 'sarah.connor' },
    { id: 'pa-003', type: 'permission-updated', message: 'Permission description updated: content:read', permission: 'content:read', timestamp: new Date(Date.now() - 86400_000 * 60).toISOString(), details: 'Old: Read content | New: View content library and metadata | Reason: Clarify scope', actor: 'sarah.connor' },
    { id: 'pa-004', type: 'bulk-assign', message: 'Bulk permission update: Moderator role — 2 permissions added', permission: 'moderation:suspend', timestamp: new Date(Date.now() - 86400_000 * 90).toISOString(), details: 'Role: Moderator | Added: moderation:suspend, moderation:ban | Reason: Expand moderation capabilities', actor: 'sarah.connor' },
    { id: 'pa-005', type: 'permission-added', message: 'New permission created: system:deploy', permission: 'system:deploy', timestamp: new Date(Date.now() - 86400_000 * 120).toISOString(), details: 'Category: system | Description: Trigger deployments and rollbacks | Assigned to: Super Admin', actor: 'sarah.connor' },
    { id: 'pa-006', type: 'permission-removed', message: 'Permission removed from User role: subscription:manage', permission: 'subscription:manage', timestamp: new Date(Date.now() - 86400_000 * 150).toISOString(), details: 'Role: User | Reason: Prevent accidental subscription modifications | Replaced with: subscription:read (via Support Agent)', actor: 'sarah.connor' },
    { id: 'pa-007', type: 'permission-added', message: 'Permission added to Analytics Viewer: analytics:export', permission: 'analytics:export', timestamp: new Date(Date.now() - 86400_000 * 15).toISOString(), details: 'Role: Analytics Viewer | Reason: Enable data export for partner reports', actor: 'sarah.connor' },
  ],
}
