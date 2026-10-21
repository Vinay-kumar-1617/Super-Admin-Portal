// City-scoped user management data for the Hyderabad City Admin dashboard.
import { cityProfile } from './cityAdminData'

export type UserTab = 'users' | 'roles' | 'assignments' | 'activity'

export const userTabs: Array<{ id: UserTab; label: string; hint: string }> = [
  { id: 'users', label: 'Users', hint: 'Create, edit, activate or deactivate authorized users' },
  { id: 'roles', label: 'Roles & permissions', hint: 'Manage role permissions within City Admin authority' },
  { id: 'assignments', label: 'Assignments', hint: 'Assign Zone Admins and operational staff' },
  { id: 'activity', label: 'Activity & history', hint: 'User activity and role-change history' },
]

export type CityUserRole =
  | 'Zone Admin'
  | 'Dispatcher'
  | 'Operations Staff'
  | 'Support Staff'
  | 'Finance Staff'
  | 'Fleet Inspector'

export const cityUserRoles: CityUserRole[] = [
  'Zone Admin',
  'Dispatcher',
  'Operations Staff',
  'Support Staff',
  'Finance Staff',
  'Fleet Inspector',
]

export type CityUserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Invited'

export type PermissionDef = { key: string; label: string; locked?: boolean }
export type PermissionGroup = { group: string; permissions: PermissionDef[] }

export const permissionGroups: PermissionGroup[] = [
  {
    group: 'Operators & fleet',
    permissions: [
      { key: 'operators.verify', label: 'Verify operators' },
      { key: 'operators.manage', label: 'Manage operator badges' },
      { key: 'fleet.manage', label: 'Manage fleet' },
      { key: 'fleet.inspect', label: 'Record inspections' },
    ],
  },
  {
    group: 'Bookings & dispatch',
    permissions: [
      { key: 'bookings.view', label: 'View bookings' },
      { key: 'bookings.manage', label: 'Manage bookings' },
      { key: 'bookings.refund', label: 'Approve refunds' },
      { key: 'dispatch.assign', label: 'Assign dispatch jobs' },
    ],
  },
  {
    group: 'Finance',
    permissions: [
      { key: 'finance.collect', label: 'Record collections' },
      { key: 'finance.reconcile', label: 'Reconcile payments' },
    ],
  },
  {
    group: 'Support & users',
    permissions: [
      { key: 'support.handle', label: 'Handle support tickets' },
      { key: 'users.view', label: 'View user directory' },
    ],
  },
  {
    group: 'Reports & settings',
    permissions: [
      { key: 'reports.view', label: 'View city reports' },
      { key: 'city.settings', label: 'Manage city settings', locked: true },
      { key: 'state.reports', label: 'State-wide reports', locked: true },
    ],
  },
]

export const allPermissions: PermissionDef[] = permissionGroups.flatMap((group) => group.permissions)

export const lockedPermissions = allPermissions.filter((permission) => permission.locked).map((permission) => permission.key)

export const rolePermissions: Record<CityUserRole, string[]> = {
  'Zone Admin': ['operators.verify', 'operators.manage', 'fleet.manage', 'bookings.view', 'bookings.manage', 'dispatch.assign', 'users.view', 'reports.view', 'support.handle'],
  Dispatcher: ['bookings.view', 'dispatch.assign', 'fleet.inspect', 'users.view'],
  'Operations Staff': ['operators.verify', 'fleet.manage', 'bookings.manage', 'dispatch.assign'],
  'Support Staff': ['support.handle', 'bookings.view', 'users.view'],
  'Finance Staff': ['bookings.view', 'bookings.refund', 'finance.collect', 'finance.reconcile', 'reports.view'],
  'Fleet Inspector': ['fleet.manage', 'fleet.inspect'],
}

export const roleScope: Record<CityUserRole, 'City' | 'Zone'> = {
  'Zone Admin': 'Zone',
  Dispatcher: 'Zone',
  'Operations Staff': 'City',
  'Support Staff': 'City',
  'Finance Staff': 'City',
  'Fleet Inspector': 'Zone',
}

export type UserHistoryEntry = {
  id: string
  action: string
  actor: string
  role: string
  time: string
  note?: string
}

export type CityUser = {
  id: string
  name: string
  email: string
  phone: string
  role: CityUserRole
  zone: string
  status: CityUserStatus
  permissions: string[]
  lastLogin: string
  lastLoginIp: string
  mfa: boolean
  createdAt: string
  history: UserHistoryEntry[]
}

export const cityUsers: CityUser[] = [
  {
    id: 'USR-4012', name: 'Srinivas Rao', email: 'srinivas.rao@equiphub.in', phone: '+91 98490 12001', role: 'Zone Admin', zone: 'Madhapur', status: 'Active', permissions: rolePermissions['Zone Admin'], lastLogin: 'Today · 09:12', lastLoginIp: '10.24.6.11', mfa: true, createdAt: '12 Jan 2024',
    history: [
      { id: 'h1', action: 'Created', actor: 'System', role: 'System', time: '12 Jan 2024' },
      { id: 'h2', action: 'Role changed', actor: cityProfile.adminName, role: 'City Admin', time: '02 Mar 2024', note: 'Dispatcher → Zone Admin.' },
    ],
  },
  {
    id: 'USR-4018', name: 'Bhavani Devi', email: 'bhavani.devi@equiphub.in', phone: '+91 98490 12018', role: 'Zone Admin', zone: 'Gachibowli', status: 'Active', permissions: rolePermissions['Zone Admin'], lastLogin: 'Today · 08:47', lastLoginIp: '10.24.6.24', mfa: true, createdAt: '20 Feb 2024',
    history: [{ id: 'h1', action: 'Created', actor: cityProfile.adminName, role: 'City Admin', time: '20 Feb 2024' }],
  },
  {
    id: 'USR-4025', name: 'Naresh Kumar', email: 'naresh.kumar@equiphub.in', phone: '+91 98490 12025', role: 'Dispatcher', zone: 'Kukatpally', status: 'Active', permissions: rolePermissions.Dispatcher, lastLogin: 'Yesterday · 18:30', lastLoginIp: '10.24.7.40', mfa: false, createdAt: '05 Apr 2024',
    history: [{ id: 'h1', action: 'Created', actor: 'Srinivas Rao', role: 'Zone Admin', time: '05 Apr 2024' }],
  },
  {
    id: 'USR-4031', name: 'Anitha Kumari', email: 'anitha.kumari@equiphub.in', phone: '+91 98490 12031', role: 'Operations Staff', zone: 'City-wide', status: 'Active', permissions: rolePermissions['Operations Staff'], lastLogin: 'Today · 10:05', lastLoginIp: '10.24.5.9', mfa: true, createdAt: '11 Apr 2024',
    history: [{ id: 'h1', action: 'Created', actor: cityProfile.adminName, role: 'City Admin', time: '11 Apr 2024' }],
  },
  {
    id: 'USR-4036', name: 'Rajesh Goud', email: 'rajesh.goud@equiphub.in', phone: '+91 98490 12036', role: 'Support Staff', zone: 'City-wide', status: 'Active', permissions: rolePermissions['Support Staff'], lastLogin: 'Today · 09:55', lastLoginIp: '10.24.5.14', mfa: false, createdAt: '22 Apr 2024',
    history: [{ id: 'h1', action: 'Created', actor: cityProfile.adminName, role: 'City Admin', time: '22 Apr 2024' }],
  },
  {
    id: 'USR-4042', name: 'Divya Sharma', email: 'divya.sharma@equiphub.in', phone: '+91 98490 12042', role: 'Finance Staff', zone: 'City-wide', status: 'Active', permissions: rolePermissions['Finance Staff'], lastLogin: 'Yesterday · 16:12', lastLoginIp: '10.24.5.21', mfa: true, createdAt: '03 May 2024',
    history: [
      { id: 'h1', action: 'Created', actor: cityProfile.adminName, role: 'City Admin', time: '03 May 2024' },
      { id: 'h2', action: 'Permissions updated', actor: cityProfile.adminName, role: 'City Admin', time: '18 Jun 2024', note: 'Granted refund approval.' },
    ],
  },
  {
    id: 'USR-4047', name: 'Mahesh Babu', email: 'mahesh.babu@equiphub.in', phone: '+91 98490 12047', role: 'Fleet Inspector', zone: 'Uppal', status: 'Active', permissions: rolePermissions['Fleet Inspector'], lastLogin: 'Today · 07:40', lastLoginIp: '10.24.8.3', mfa: false, createdAt: '15 May 2024',
    history: [{ id: 'h1', action: 'Created', actor: 'Anil Kumar', role: 'Zone Admin', time: '15 May 2024' }],
  },
  {
    id: 'USR-4053', name: 'Farhana Begum', email: 'farhana.begum@equiphub.in', phone: '+91 98490 12053', role: 'Dispatcher', zone: 'Begumpet', status: 'Suspended', permissions: rolePermissions.Dispatcher, lastLogin: '28 Aug 2024', lastLoginIp: '10.24.7.66', mfa: false, createdAt: '02 Jun 2024',
    history: [
      { id: 'h1', action: 'Created', actor: 'Bhavani Devi', role: 'Zone Admin', time: '02 Jun 2024' },
      { id: 'h2', action: 'Deactivated', actor: cityProfile.adminName, role: 'City Admin', time: '28 Aug 2024', note: 'Suspended pending conduct review.' },
    ],
  },
  {
    id: 'USR-4058', name: 'Prasad Rao', email: 'prasad.rao@equiphub.in', phone: '+91 98490 12058', role: 'Zone Admin', zone: 'LB Nagar', status: 'Inactive', permissions: rolePermissions['Zone Admin'], lastLogin: '12 Jul 2024', lastLoginIp: '10.24.6.88', mfa: false, createdAt: '19 Jun 2024',
    history: [
      { id: 'h1', action: 'Created', actor: cityProfile.adminName, role: 'City Admin', time: '19 Jun 2024' },
      { id: 'h2', action: 'Deactivated', actor: cityProfile.adminName, role: 'City Admin', time: '12 Jul 2024', note: 'Moved to central support.' },
    ],
  },
  {
    id: 'USR-4061', name: 'Shanti Kumari', email: 'shanti.kumari@equiphub.in', phone: '+91 98490 12061', role: 'Operations Staff', zone: 'City-wide', status: 'Invited', permissions: rolePermissions['Operations Staff'], lastLogin: '—', lastLoginIp: '—', mfa: false, createdAt: '28 Aug 2024',
    history: [{ id: 'h1', action: 'Invited', actor: cityProfile.adminName, role: 'City Admin', time: '28 Aug 2024', note: 'Invitation sent to email.' }],
  },
  {
    id: 'USR-4064', name: 'Kiran Kumar', email: 'kiran.kumar@equiphub.in', phone: '+91 98490 12064', role: 'Dispatcher', zone: 'Madhapur', status: 'Active', permissions: rolePermissions.Dispatcher, lastLogin: 'Today · 06:58', lastLoginIp: '10.24.7.72', mfa: true, createdAt: '30 Aug 2024',
    history: [
      { id: 'h1', action: 'Created', actor: 'Srinivas Rao', role: 'Zone Admin', time: '30 Aug 2024' },
      { id: 'h2', action: 'Role changed', actor: cityProfile.adminName, role: 'City Admin', time: '04 Sep 2024', note: 'Fleet Inspector → Dispatcher.' },
    ],
  },
  {
    id: 'USR-4066', name: 'Sunitha Rao', email: 'sunitha.rao@equiphub.in', phone: '+91 98490 12066', role: 'Support Staff', zone: 'City-wide', status: 'Active', permissions: rolePermissions['Support Staff'], lastLogin: 'Yesterday · 19:20', lastLoginIp: '10.24.5.37', mfa: false, createdAt: '01 Sep 2024',
    history: [{ id: 'h1', action: 'Created', actor: cityProfile.adminName, role: 'City Admin', time: '01 Sep 2024' }],
  },
]

export const historyActionTypes = [
  'Created',
  'Invited',
  'Role changed',
  'Permissions updated',
  'Activated',
  'Deactivated',
  'Zone changed',
] as const
