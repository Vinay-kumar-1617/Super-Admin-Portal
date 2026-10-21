export type ZoneStaffRole = 'Dispatcher' | 'Support Agent' | 'Fleet Inspector' | 'Operations Staff'
export type ZoneStaffStatus = 'Active' | 'Inactive' | 'Suspended' | 'Invited'

export type ZoneStaffMember = {
  id: string
  name: string
  email: string
  phone: string
  role: ZoneStaffRole
  zone: string
  status: ZoneStaffStatus
  permissions: string[]
  lastLogin: string
  lastLoginIp: string
  mfa: boolean
  createdAt: string
  history: Array<{ id: string; action: string; actor: string; role: string; time: string; note?: string }>
}

export const zoneStaffRoles: ZoneStaffRole[] = ['Dispatcher', 'Support Agent', 'Fleet Inspector', 'Operations Staff']
export const eligibleToggleRoles: ZoneStaffRole[] = ['Dispatcher', 'Support Agent']

export const rolePermissions: Record<ZoneStaffRole, string[]> = {
  Dispatcher: ['bookings.view', 'dispatch.assign', 'fleet.inspect', 'users.view'],
  'Support Agent': ['support.handle', 'bookings.view', 'users.view'],
  'Fleet Inspector': ['fleet.manage', 'fleet.inspect'],
  'Operations Staff': ['operators.verify', 'fleet.manage', 'bookings.manage', 'dispatch.assign'],
}

export const zoneStaff: ZoneStaffMember[] = [
  { id: 'ZS-201', name: 'Kiran Kumar', email: 'kiran.kumar@equiphub.in', phone: '+91 98490 12064', role: 'Dispatcher', zone: 'Madhapur', status: 'Active', permissions: rolePermissions.Dispatcher, lastLogin: 'Today · 06:58', lastLoginIp: '10.24.7.72', mfa: true, createdAt: '30 Aug 2024', history: [{ id: 'h1', action: 'Created', actor: 'Sridhar Nair', role: 'Zone Admin', time: '30 Aug 2024' }] },
  { id: 'ZS-202', name: 'Farhana Begum', email: 'farhana.begum@equiphub.in', phone: '+91 98490 12053', role: 'Dispatcher', zone: 'Madhapur', status: 'Suspended', permissions: rolePermissions.Dispatcher, lastLogin: '28 Aug 2024', lastLoginIp: '10.24.7.66', mfa: false, createdAt: '02 Jun 2024', history: [{ id: 'h1', action: 'Created', actor: 'Bhavani Devi', role: 'Zone Admin', time: '02 Jun 2024' }, { id: 'h2', action: 'Suspended', actor: 'City Admin', role: 'City Admin', time: '28 Aug 2024', note: 'Suspended pending conduct review.' }] },
  { id: 'ZS-203', name: 'Sunitha Rao', email: 'sunitha.rao@equiphub.in', phone: '+91 98490 12066', role: 'Support Agent', zone: 'Madhapur', status: 'Active', permissions: rolePermissions['Support Agent'], lastLogin: 'Yesterday · 19:20', lastLoginIp: '10.24.5.37', mfa: false, createdAt: '01 Sep 2024', history: [{ id: 'h1', action: 'Created', actor: 'City Admin', role: 'City Admin', time: '01 Sep 2024' }] },
  { id: 'ZS-204', name: 'Anitha Kumari', email: 'anitha.kumari@equiphub.in', phone: '+91 98490 12031', role: 'Operations Staff', zone: 'Madhapur', status: 'Active', permissions: rolePermissions['Operations Staff'], lastLogin: 'Today · 10:05', lastLoginIp: '10.24.5.9', mfa: true, createdAt: '11 Apr 2024', history: [{ id: 'h1', action: 'Created', actor: 'City Admin', role: 'City Admin', time: '11 Apr 2024' }] },
  { id: 'ZS-205', name: 'Mahesh Babu', email: 'mahesh.babu@equiphub.in', phone: '+91 98490 12047', role: 'Fleet Inspector', zone: 'Madhapur', status: 'Active', permissions: rolePermissions['Fleet Inspector'], lastLogin: 'Today · 07:40', lastLoginIp: '10.24.8.3', mfa: false, createdAt: '15 May 2024', history: [{ id: 'h1', action: 'Created', actor: 'Sridhar Nair', role: 'Zone Admin', time: '15 May 2024' }] },
  { id: 'ZS-206', name: 'Shanti Kumari', email: 'shanti.kumari@equiphub.in', phone: '+91 98490 12061', role: 'Operations Staff', zone: 'Madhapur', status: 'Invited', permissions: rolePermissions['Operations Staff'], lastLogin: '—', lastLoginIp: '—', mfa: false, createdAt: '28 Aug 2024', history: [{ id: 'h1', action: 'Invited', actor: 'City Admin', role: 'City Admin', time: '28 Aug 2024', note: 'Invitation sent to email.' }] },
]

export type ZoneTaskStatus = 'Open' | 'Assigned' | 'Completed'
export type ZoneTask = { id: string; title: string; detail: string; locality: string; priority: 'High' | 'Medium' | 'Low'; due: string; status: ZoneTaskStatus; assigneeId?: string | null }

export const zoneTasks: ZoneTask[] = [
  { id: 'ZT-301', title: 'Morning dispatch coordination', detail: 'Coordinate HITEC City and Raidurg morning fleet dispatch.', locality: 'HITEC City', priority: 'High', due: 'Today · 09:00', status: 'Open' },
  { id: 'ZT-302', title: 'Support callback backlog', detail: 'Call back open customer support tickets from yesterday.', locality: 'Madhapur', priority: 'Medium', due: 'Today · 14:00', status: 'Open' },
  { id: 'ZT-303', title: 'Fleet inspection round', detail: 'Inspect MC-3046 and MC-3062 at Raidurg yard.', locality: 'Raidurg', priority: 'High', due: 'Tomorrow · 10:00', status: 'Assigned', assigneeId: 'ZS-205' },
  { id: 'ZT-304', title: 'Operator badge renewal follow-up', detail: 'Follow up with pending operator badge renewals.', locality: 'Kavuri Hills', priority: 'Low', due: '2 days', status: 'Open' },
  { id: 'ZT-305', title: 'Incident report closure', detail: 'Close out IN-26 incident report with site notes.', locality: 'Nanakramguda', priority: 'Medium', due: 'Today · 18:00', status: 'Completed', assigneeId: 'ZS-201' },
]

export type PermissionRequestStatus = 'Pending' | 'Approved' | 'Denied'
export type PermissionRequest = { id: string; staffId: string; staffName: string; permission: string; permissionLabel: string; status: PermissionRequestStatus; reason: string; requestedAt: string; requestedBy: string }

export const initialPermissionRequests: PermissionRequest[] = [
  { id: 'PR-101', staffId: 'ZS-201', staffName: 'Kiran Kumar', permission: 'bookings.refund', permissionLabel: 'Approve refunds', status: 'Pending', reason: 'Needs refund approval authority for weekend dispatch.', requestedAt: 'Today · 08:10', requestedBy: 'Sridhar Nair' },
  { id: 'PR-102', staffId: 'ZS-203', staffName: 'Sunitha Rao', permission: 'support.escalate', permissionLabel: 'Escalate tickets', status: 'Approved', reason: 'Escalation rights for VIP customer cases.', requestedAt: 'Yesterday', requestedBy: 'Sridhar Nair' },
]

export const requestablePermissions: Array<{ key: string; label: string }> = [
  { key: 'dispatch.assign', label: 'Assign dispatch jobs' },
  { key: 'support.handle', label: 'Handle support tickets' },
  { key: 'fleet.inspect', label: 'Record inspections' },
  { key: 'bookings.refund', label: 'Approve refunds' },
  { key: 'bookings.manage', label: 'Manage bookings' },
  { key: 'users.view', label: 'View user directory' },
]

export const cityAdminName = 'Praveen Kumar'