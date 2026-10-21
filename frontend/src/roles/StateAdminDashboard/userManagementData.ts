import type { StatTone } from './shared'

export type ManagedUserStatus = 'Active' | 'Inactive' | 'Pending'
export type UserScopeType = 'state' | 'city' | 'zone'

export const managedRoleKeys = [
  'city-admin',
  'zone-admin',
  'operations-manager',
  'finance-admin',
  'compliance-admin',
  'support-admin',
  'support-agent',
  'dispatcher',
  'fleet-manager',
  'kyc-verifier',
  'dispute-handler',
  'moderator',
  'auditor',
] as const

export type ManagedRoleKey = (typeof managedRoleKeys)[number]

export type RoleMeta = {
  key: ManagedRoleKey
  label: string
  scope: UserScopeType
  description: string
}

export const MANAGED_ROLES: RoleMeta[] = [
  { key: 'city-admin', label: 'City Admin', scope: 'city', description: 'Runs city operations, approves operators and monitors zones.' },
  { key: 'zone-admin', label: 'Zone Admin', scope: 'zone', description: 'Owns dispatch and jobs inside a single zone.' },
  { key: 'operations-manager', label: 'Operations Manager', scope: 'state', description: 'Oversees day-to-day logistics across every city.' },
  { key: 'finance-admin', label: 'Finance Admin', scope: 'state', description: 'Handles payouts, refunds and settlement approvals.' },
  { key: 'compliance-admin', label: 'Compliance Admin', scope: 'state', description: 'Tracks documents, expiry and regulatory escalations.' },
  { key: 'support-admin', label: 'Support Admin', scope: 'state', description: 'Leads the support desk and escalations.' },
  { key: 'support-agent', label: 'Support Agent', scope: 'city', description: 'Answers tickets for customers and partners.' },
  { key: 'dispatcher', label: 'Dispatcher', scope: 'city', description: 'Assigns machines and operators to live jobs.' },
  { key: 'fleet-manager', label: 'Fleet Manager', scope: 'state', description: 'Maintains machine availability and inspections.' },
  { key: 'kyc-verifier', label: 'KYC Verifier', scope: 'state', description: 'Verifies partner and operator identity documents.' },
  { key: 'dispute-handler', label: 'Dispute Handler', scope: 'state', description: 'Resolves payment and service disputes.' },
  { key: 'moderator', label: 'Moderator', scope: 'state', description: 'Reviews listings and user reports.' },
  { key: 'auditor', label: 'Auditor', scope: 'state', description: 'Read-only access to state activity and reports.' },
]

export const roleMeta = (role: ManagedRoleKey): RoleMeta =>
  MANAGED_ROLES.find((item) => item.key === role) ?? MANAGED_ROLES[0]

export const roleLabel = (role: ManagedRoleKey): string => roleMeta(role).label

export const FORBIDDEN_ROLES = ['super-admin'] as const

export const isForbiddenRole = (role: string): boolean =>
  (FORBIDDEN_ROLES as readonly string[]).includes(role)

export type PermissionDef = {
  key: string
  label: string
  group: string
}

export const PERMISSION_CATALOG: PermissionDef[] = [
  { key: 'users.view', label: 'View team', group: 'User management' },
  { key: 'users.create', label: 'Create users', group: 'User management' },
  { key: 'users.edit', label: 'Edit users', group: 'User management' },
  { key: 'users.deactivate', label: 'Activate / deactivate', group: 'User management' },
  { key: 'users.reset_password', label: 'Reset passwords', group: 'User management' },
  { key: 'users.revoke_sessions', label: 'Revoke sessions', group: 'User management' },
  { key: 'bookings.view', label: 'View bookings', group: 'Bookings' },
  { key: 'bookings.assign', label: 'Assign bookings', group: 'Bookings' },
  { key: 'bookings.cancel', label: 'Cancel bookings', group: 'Bookings' },
  { key: 'fleet.view', label: 'View fleet', group: 'Fleet' },
  { key: 'fleet.manage', label: 'Manage fleet', group: 'Fleet' },
  { key: 'finance.view', label: 'View finance', group: 'Finance' },
  { key: 'finance.payouts', label: 'Approve payouts', group: 'Finance' },
  { key: 'finance.refunds', label: 'Approve refunds', group: 'Finance' },
  { key: 'geography.view', label: 'View geography', group: 'Geography' },
  { key: 'geography.manage', label: 'Manage cities & zones', group: 'Geography' },
  { key: 'approvals.review', label: 'Review approvals', group: 'Approvals' },
  { key: 'reports.view', label: 'View reports', group: 'Reports' },
  { key: 'reports.export', label: 'Export reports', group: 'Reports' },
  { key: 'support.tickets', label: 'Handle tickets', group: 'Support' },
  { key: 'support.escalate', label: 'Escalate tickets', group: 'Support' },
  { key: 'audit.view', label: 'View audit logs', group: 'Audit' },
]

export const permissionLabel = (key: string): string =>
  PERMISSION_CATALOG.find((item) => item.key === key)?.label ?? key

export const ROLE_DEFAULT_PERMISSIONS: Record<ManagedRoleKey, string[]> = {
  'city-admin': ['users.view', 'bookings.view', 'bookings.assign', 'fleet.view', 'geography.view', 'approvals.review', 'reports.view', 'support.tickets'],
  'zone-admin': ['users.view', 'bookings.view', 'bookings.assign', 'fleet.view', 'support.tickets'],
  'operations-manager': ['users.view', 'bookings.view', 'bookings.assign', 'bookings.cancel', 'fleet.view', 'fleet.manage', 'geography.view', 'reports.view', 'support.tickets', 'support.escalate'],
  'finance-admin': ['finance.view', 'finance.payouts', 'finance.refunds', 'reports.view', 'reports.export', 'bookings.view'],
  'compliance-admin': ['audit.view', 'geography.view', 'reports.view', 'reports.export', 'approvals.review'],
  'support-admin': ['users.view', 'support.tickets', 'support.escalate', 'bookings.view', 'reports.view'],
  'support-agent': ['support.tickets', 'bookings.view'],
  dispatcher: ['bookings.view', 'bookings.assign', 'fleet.view', 'support.tickets'],
  'fleet-manager': ['fleet.view', 'fleet.manage', 'bookings.view', 'reports.view'],
  'kyc-verifier': ['approvals.review', 'users.view'],
  'dispute-handler': ['support.tickets', 'support.escalate', 'finance.refunds', 'bookings.view'],
  moderator: ['reports.view', 'support.tickets'],
  auditor: ['audit.view', 'reports.view', 'reports.export'],
}

export type ManagedUser = {
  id: string
  fullName: string
  email: string
  phone: string
  role: ManagedRoleKey
  status: ManagedUserStatus
  scopeType: UserScopeType
  city: string | null
  zone: string | null
  state: string
  lastLogin: string | null
  createdAt: string
  invitedAt: string | null
  emailVerified: boolean
  mfaEnabled: boolean
  permissions: string[]
}

export const userStatusTone: Record<ManagedUserStatus, StatTone> = {
  Active: 'green',
  Inactive: 'slate',
  Pending: 'amber',
}

export const userStatusPillClass: Record<ManagedUserStatus, string> = {
  Active: 'green',
  Inactive: 'slate',
  Pending: 'amber',
}

export const DEMO_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr-1001',
    fullName: 'Ramesh Varma',
    email: 'city.admin.hyderabad@equiphub.demo',
    phone: '+91 98490 11223',
    role: 'city-admin',
    status: 'Active',
    scopeType: 'city',
    city: 'Hyderabad',
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-13T09:12:00.000Z',
    createdAt: '2025-04-02T06:30:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['city-admin'],
  },
  {
    id: 'usr-1002',
    fullName: 'Sneha Kulkarni',
    email: 'zone.admin.madhapur@equiphub.demo',
    phone: '+91 90100 55441',
    role: 'zone-admin',
    status: 'Active',
    scopeType: 'zone',
    city: 'Hyderabad',
    zone: 'Madhapur',
    state: 'Telangana',
    lastLogin: '2026-10-13T07:45:00.000Z',
    createdAt: '2025-05-18T10:05:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS['zone-admin'],
  },
  {
    id: 'usr-1003',
    fullName: 'Imran Qureshi',
    email: 'operations.telangana@equiphub.demo',
    phone: '+91 99480 22001',
    role: 'operations-manager',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-14T05:30:00.000Z',
    createdAt: '2024-12-11T05:00:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['operations-manager'],
  },
  {
    id: 'usr-1004',
    fullName: 'Deepa Nair',
    email: 'finance.telangana@equiphub.demo',
    phone: '+91 96320 78451',
    role: 'finance-admin',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-12T14:20:00.000Z',
    createdAt: '2025-02-27T09:15:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['finance-admin'],
  },
  {
    id: 'usr-1005',
    fullName: 'Karthik Reddy',
    email: 'dispatcher.warangal@equiphub.demo',
    phone: '+91 91770 33420',
    role: 'dispatcher',
    status: 'Active',
    scopeType: 'city',
    city: 'Warangal',
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-11T11:05:00.000Z',
    createdAt: '2025-06-09T08:40:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS.dispatcher,
  },
  {
    id: 'usr-1006',
    fullName: 'Ayesha Siddiqui',
    email: 'support.agent.hyderabad@equiphub.demo',
    phone: '+91 90900 66512',
    role: 'support-agent',
    status: 'Active',
    scopeType: 'city',
    city: 'Hyderabad',
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-13T16:48:00.000Z',
    createdAt: '2025-07-21T12:00:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS['support-agent'],
  },
  {
    id: 'usr-1007',
    fullName: 'Vikram Sethi',
    email: 'kyc.verifier.telangana@equiphub.demo',
    phone: '+91 98850 44780',
    role: 'kyc-verifier',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-10T09:02:00.000Z',
    createdAt: '2025-03-15T07:20:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS['kyc-verifier'],
  },
  {
    id: 'usr-1008',
    fullName: 'Meera Iyer',
    email: 'fleet.manager.telangana@equiphub.demo',
    phone: '+91 91210 99831',
    role: 'fleet-manager',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-13T13:37:00.000Z',
    createdAt: '2025-01-30T06:10:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['fleet-manager'],
  },
  {
    id: 'usr-1009',
    fullName: 'Suresh Babu',
    email: 'zone.admin.uppal@equiphub.demo',
    phone: '+91 99890 12009',
    role: 'zone-admin',
    status: 'Inactive',
    scopeType: 'zone',
    city: 'Hyderabad',
    zone: 'Uppal',
    state: 'Telangana',
    lastLogin: '2026-08-02T10:11:00.000Z',
    createdAt: '2025-05-22T09:55:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS['zone-admin'],
  },
  {
    id: 'usr-1010',
    fullName: 'Nandini Rao',
    email: 'compliance.telangana@equiphub.demo',
    phone: '+91 96660 55219',
    role: 'compliance-admin',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-09T15:26:00.000Z',
    createdAt: '2024-11-18T04:45:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['compliance-admin'],
  },
  {
    id: 'usr-1011',
    fullName: 'Rajat Menon',
    email: 'moderator.telangana@equiphub.demo',
    phone: '+91 93450 77610',
    role: 'moderator',
    status: 'Inactive',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-07-19T12:40:00.000Z',
    createdAt: '2025-02-03T11:30:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS.moderator,
  },
  {
    id: 'usr-1012',
    fullName: 'Priya Deshmukh',
    email: 'dispute.handler.telangana@equiphub.demo',
    phone: '+91 98470 33108',
    role: 'dispute-handler',
    status: 'Pending',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: null,
    createdAt: '2026-10-08T08:05:00.000Z',
    invitedAt: '2026-10-08T08:05:00.000Z',
    emailVerified: false,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS['dispute-handler'],
  },
  {
    id: 'usr-1013',
    fullName: 'Harsha Vardhan',
    email: 'support.admin.telangana@equiphub.demo',
    phone: '+91 90000 45218',
    role: 'support-admin',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-14T04:15:00.000Z',
    createdAt: '2025-01-08T09:00:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['support-admin'],
  },
  {
    id: 'usr-1014',
    fullName: 'Lakshmi Prasanna',
    email: 'city.admin.karimnagar@equiphub.demo',
    phone: '+91 99390 66277',
    role: 'city-admin',
    status: 'Pending',
    scopeType: 'city',
    city: 'Karimnagar',
    zone: null,
    state: 'Telangana',
    lastLogin: null,
    createdAt: '2026-10-11T07:45:00.000Z',
    invitedAt: '2026-10-11T07:45:00.000Z',
    emailVerified: false,
    mfaEnabled: false,
    permissions: ROLE_DEFAULT_PERMISSIONS['city-admin'],
  },
  {
    id: 'usr-1015',
    fullName: 'Anil Kumar',
    email: 'auditor.telangana@equiphub.demo',
    phone: '+91 95500 21894',
    role: 'auditor',
    status: 'Active',
    scopeType: 'state',
    city: null,
    zone: null,
    state: 'Telangana',
    lastLogin: '2026-10-07T09:50:00.000Z',
    createdAt: '2024-10-25T05:35:00.000Z',
    invitedAt: null,
    emailVerified: true,
    mfaEnabled: true,
    permissions: ROLE_DEFAULT_PERMISSIONS.auditor,
  },
]

export type DetailTab = 'overview' | 'permissions' | 'access' | 'logins' | 'audit'

export const AUDIT_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'access', label: 'Access & Sessions' },
  { id: 'logins', label: 'Login history' },
  { id: 'audit', label: 'Audit trail' },
]

export type UserSession = {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: string
  current: boolean
}

export type LoginEvent = {
  id: string
  at: string
  ip: string
  device: string
  method: 'Password' | 'SSO' | 'Magic link'
  result: 'success' | 'failed'
}

export type UserAuditEntry = {
  id: string
  at: string
  actor: string
  action: string
}

export function sessionsFor(user: ManagedUser): UserSession[] {
  if (user.status === 'Pending' || user.lastLogin === null) return []
  const base = new Date(user.lastLogin).getTime()
  const sessions: UserSession[] = [
    {
      id: `${user.id}-s1`,
      device: 'Windows workstation',
      browser: 'Chrome 129',
      ip: '192.168.1.42',
      location: `${user.city ?? user.state}, IN`,
      lastActive: new Date(base).toISOString(),
      current: true,
    },
    {
      id: `${user.id}-s2`,
      device: 'Android phone',
      browser: 'EquipHub app',
      ip: '10.4.9.201',
      location: `${user.city ?? user.state}, IN`,
      lastActive: new Date(base - 1000 * 60 * 60 * 6).toISOString(),
      current: false,
    },
  ]
  if (user.role === 'operations-manager' || user.role === 'fleet-manager') {
    sessions.push({
      id: `${user.id}-s3`,
      device: 'iPad',
      browser: 'Safari 18',
      ip: '10.4.9.88',
      location: `${user.state}, IN`,
      lastActive: new Date(base - 1000 * 60 * 60 * 30).toISOString(),
      current: false,
    })
  }
  return sessions
}

export function loginHistoryFor(user: ManagedUser): LoginEvent[] {
  if (user.status === 'Pending' || user.lastLogin === null) return []
  const base = new Date(user.lastLogin).getTime()
  const day = 1000 * 60 * 60 * 24
  return [
    { id: `${user.id}-l1`, at: new Date(base).toISOString(), ip: '192.168.1.42', device: 'Chrome 129 · Windows', method: 'Password', result: 'success' },
    { id: `${user.id}-l2`, at: new Date(base - day).toISOString(), ip: '10.4.9.201', device: 'EquipHub app · Android', method: 'Password', result: 'success' },
    { id: `${user.id}-l3`, at: new Date(base - day * 2).toISOString(), ip: '203.0.113.77', device: 'Chrome 129 · Windows', method: 'Password', result: 'failed' },
    { id: `${user.id}-l4`, at: new Date(base - day * 3).toISOString(), ip: '192.168.1.42', device: 'Chrome 128 · Windows', method: 'SSO', result: 'success' },
    { id: `${user.id}-l5`, at: new Date(base - day * 5).toISOString(), ip: '192.168.1.42', device: 'Chrome 128 · Windows', method: 'Password', result: 'success' },
  ]
}

export function auditTrailFor(user: ManagedUser): UserAuditEntry[] {
  const entries: UserAuditEntry[] = [
    { id: `${user.id}-a1`, at: user.createdAt, actor: 'Anitha Rao', action: 'Account created and role assigned' },
  ]
  if (user.invitedAt) {
    entries.unshift({ id: `${user.id}-a2`, at: user.invitedAt, actor: 'Anitha Rao', action: 'Invitation sent' })
  }
  if (user.lastLogin) {
    entries.unshift({ id: `${user.id}-a3`, at: user.lastLogin, actor: user.email, action: `Signed in (${user.mfaEnabled ? 'MFA verified' : 'password'})` })
  }
  if (user.status === 'Inactive') {
    entries.unshift({ id: `${user.id}-a5`, at: '2026-08-15T06:00:00.000Z', actor: 'Anitha Rao', action: 'Account deactivated' })
  }
  entries.push({ id: `${user.id}-a4`, at: user.createdAt, actor: 'System', action: `Default permissions applied for ${roleLabel(user.role)}` })
  return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

export function usersToCsv(users: ManagedUser[]): string {
  const header = ['id', 'name', 'email', 'phone', 'role', 'status', 'city', 'zone', 'state', 'lastLogin', 'createdAt']
  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? '' : String(value)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = users.map((u) =>
    [
      u.id,
      u.fullName,
      u.email,
      u.phone,
      roleLabel(u.role),
      u.status,
      u.city ?? '',
      u.zone ?? '',
      u.state,
      u.lastLogin ?? '',
      u.createdAt,
    ]
      .map(escape)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelative(value: string | null): string {
  if (!value) return 'Never signed in'
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return formatDateTime(value)
}
