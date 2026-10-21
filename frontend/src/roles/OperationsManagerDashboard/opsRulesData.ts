// Rules, permissions and delegated limits for the Operations Manager.
//
// These records describe what the Operations Manager may do inside the
// assigned zone. The screen that renders them is read-only by default:
// editing is unlocked only when an authorised administrator grants the
// `permission.manage` permission to the signed-in account.

export type PermissionScope = 'read' | 'write' | 'approve' | 'escalate'
export type PermissionEffect = 'allow' | 'deny'

export type RolePermission = {
  key: string
  label: string
  module: string
  scope: PermissionScope
  effect: PermissionEffect
  /** Maximum amount the role may approve. null = no ceiling. */
  approvalLimit: number | null
  requiresReason: boolean
  requiresAudit: boolean
  description: string
  restrictedNote: string
  escalationTarget: string
}

export type OperationalRestriction = {
  id: string
  title: string
  detail: string
  owner: string
}

export type EscalationProcedure = {
  id: string
  trigger: string
  target: string
  sla: string
  requires: string
}

export const opsPermissions: RolePermission[] = [
  {
    key: 'zone.read',
    label: 'Read zone data',
    module: 'Zone data',
    scope: 'read',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: false,
    requiresAudit: true,
    description: 'View zone vehicles, drivers, bookings, disputes, reports and the live map for the assigned zone.',
    restrictedNote: 'Records belonging to any other zone or city.',
    escalationTarget: '',
  },
  {
    key: 'booking.read',
    label: 'Read bookings',
    module: 'Bookings',
    scope: 'read',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: false,
    requiresAudit: true,
    description: 'View booking details, status, rental window and assigned operator for zone bookings.',
    restrictedNote: 'Bookings owned by another zone; city-wide pricing rules.',
    escalationTarget: '',
  },
  {
    key: 'booking.manage',
    label: 'Manage bookings',
    module: 'Bookings',
    scope: 'write',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: true,
    requiresAudit: true,
    description: 'Update booking status, rental window, machine and operator assignment.',
    restrictedNote: 'Cancelling outside the cooling-off window; refunding amounts.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'dispatch.override',
    label: 'Override dispatch',
    module: 'Dispatch',
    scope: 'write',
    effect: 'allow',
    approvalLimit: 75000,
    requiresReason: true,
    requiresAudit: true,
    description: 'Assign or reassign an operator, or raise a job priority, when the queue is stuck.',
    restrictedNote: 'Overrides on jobs owned by another zone; rate changes.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'vehicle.allocate',
    label: 'Allocate vehicles',
    module: 'Fleet',
    scope: 'write',
    effect: 'allow',
    approvalLimit: 100000,
    requiresReason: true,
    requiresAudit: true,
    description: 'Allocate a zone vehicle to a job and release it back to the pool after inspection.',
    restrictedNote: 'Taking a vehicle that is reserved for another zone.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'task.assign',
    label: 'Assign tasks',
    module: 'Dispatch',
    scope: 'write',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: false,
    requiresAudit: true,
    description: 'Raise dispatch tasks, set job priority and record shift handover notes.',
    restrictedNote: 'Creating operator accounts; changing shift rosters for other zones.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'status.update',
    label: 'Update job status',
    module: 'Jobs',
    scope: 'write',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: true,
    requiresAudit: true,
    description: 'Move a job through active, stuck, resolved and completed states.',
    restrictedNote: 'Reopening a completed job without a dispute reference.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'approval.maintenance',
    label: 'Approve maintenance',
    module: 'Maintenance',
    scope: 'approve',
    effect: 'allow',
    approvalLimit: 50000,
    requiresReason: true,
    requiresAudit: true,
    description: 'Approve maintenance requests raised on zone machines.',
    restrictedNote: 'Vendor contracts; purchase orders.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'approval.overtime',
    label: 'Approve overtime',
    module: 'Shift',
    scope: 'approve',
    effect: 'allow',
    approvalLimit: 15000,
    requiresReason: true,
    requiresAudit: true,
    description: 'Approve overtime for operators working beyond the rostered shift.',
    restrictedNote: 'Additional headcount beyond the sanctioned shift strength.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'approval.vehicle_release',
    label: 'Approve vehicle release',
    module: 'Fleet',
    scope: 'approve',
    effect: 'allow',
    approvalLimit: 100000,
    requiresReason: true,
    requiresAudit: true,
    description: 'Sign off releasing a vehicle to another zone or redeploying it across zones.',
    restrictedNote: 'Releasing a vehicle that is reserved for another zone.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'escalation.raise',
    label: 'Raise escalations',
    module: 'Escalations',
    scope: 'escalate',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: true,
    requiresAudit: true,
    description: 'Escalate a job, allocation or approval to the City Admin or State Admin.',
    restrictedNote: 'Escalating directly to a vendor or a customer.',
    escalationTarget: 'City Admin · Hyderabad, then State Admin · Telangana',
  },
  {
    key: 'report.export',
    label: 'Export zone reports',
    module: 'Reports',
    scope: 'write',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: false,
    requiresAudit: true,
    description: 'Export zone-scoped booking, fleet and financial reports.',
    restrictedNote: 'City-wide or multi-zone exports; customer contact exports.',
    escalationTarget: 'City Admin · Hyderabad',
  },
  {
    key: 'audit.read',
    label: 'Read the audit trail',
    module: 'Audit',
    scope: 'read',
    effect: 'allow',
    approvalLimit: null,
    requiresReason: false,
    requiresAudit: true,
    description: 'Read the zone audit trail of operational actions, including denied attempts.',
    restrictedNote: 'Audit rows raised in other zones; raw actor identifiers.',
    escalationTarget: '',
  },
  {
    key: 'permission.manage',
    label: 'Edit role permissions',
    module: 'Permissions',
    scope: 'write',
    effect: 'deny',
    approvalLimit: null,
    requiresReason: true,
    requiresAudit: true,
    description: 'Change the permission catalogue or the delegated approval limits for a role.',
    restrictedNote: 'Denied by default — only a Super Admin can grant this to an account.',
    escalationTarget: 'Super Admin',
  },
]

export const opsRestrictions: OperationalRestriction[] = [
  {
    id: 'r-zones',
    title: 'Other zones and cities',
    detail: 'Data outside the assigned zone is neither visible nor editable. Cross-zone reads are rejected by the server, not by the interface.',
    owner: 'Server scope policy',
  },
  {
    id: 'r-accounts',
    title: 'Admin accounts and roles',
    detail: 'Creating, editing or impersonating City Admin, State Admin, Super Admin or platform accounts is blocked for every session.',
    owner: 'Server role policy',
  },
  {
    id: 'r-pricing',
    title: 'Pricing and settlement',
    detail: 'City-wide rates, payouts, settlements, refunds and surcharge reversals belong to the Finance Admin and are blocked.',
    owner: 'Module ownership',
  },
  {
    id: 'r-fleet',
    title: 'Fleet acquisition',
    detail: 'Adding, removing or re-registering machines, and vendor contracts, are City Admin decisions.',
    owner: 'Module ownership',
  },
  {
    id: 'r-limits',
    title: 'Above the delegated limit',
    detail: 'Any approval, override or release above the limit shown on this page is rejected and must be escalated.',
    owner: 'Server approval limits',
  },
  {
    id: 'r-audit',
    title: 'Audit trail edits',
    detail: 'Audit rows are append-only. Entries cannot be edited or deleted by any role, including Super Admins.',
    owner: 'Server audit trigger',
  },
]

export const opsEscalationProcedures: EscalationProcedure[] = [
  {
    id: 'e-approval',
    trigger: 'Approval, override or release above the delegated limit',
    target: 'City Admin · Hyderabad',
    sla: '4 hours',
    requires: 'Reason, amount, zone context and a link to the source record.',
  },
  {
    id: 'e-sla',
    trigger: 'Unassigned queue breaching the 30 minute SLA',
    target: 'City Admin · Hyderabad',
    sla: '1 hour',
    requires: 'Job id, operator pool state and the customer impact.',
  },
  {
    id: 'e-zone',
    trigger: 'Request that touches another zone or city',
    target: 'State Admin · Telangana',
    sla: '8 hours',
    requires: 'Scope check result and the zone that owns the record.',
  },
  {
    id: 'e-repeat',
    trigger: 'Three or more dispatch overrides on the same day',
    target: 'State Admin · Telangana',
    sla: '24 hours',
    requires: 'Override history for the day and the reason for each change.',
  },
  {
    id: 'e-dispute',
    trigger: 'Reopening a closed job, or a booking cancellation outside the cooling-off window',
    target: 'City Admin · Hyderabad',
    sla: '2 hours',
    requires: 'Dispute reference, customer communication and the original closure reason.',
  },
]

export const opsZoneScope = {
  state: 'Telangana',
  city: 'Hyderabad',
  zone: 'Madhapur',
  visible: [
    'Zone bookings and their history',
    'Zone fleet, drivers and the live map',
    'Zone disputes, escalations and support tickets',
    'Zone reports, shift handovers and the audit trail',
  ],
  hidden: [
    'City-wide pricing, payouts and settlements',
    'Other zones under Hyderabad',
    'State-wide analytics and other states',
    'Admin accounts, roles and permission catalogues',
  ],
}
