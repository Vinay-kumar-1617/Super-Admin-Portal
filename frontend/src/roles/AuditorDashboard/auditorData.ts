// Auditor-scoped seed data for the national, read-only auditor dashboard.
// The auditor can review everything but can never change business records —
// the only writes are to the audit log, findings and report exports.
import { emailForRole } from '../../auth/roleAccounts'

export type SectionId =
  | 'overview'
  | 'audit-log'
  | 'read-only'
  | 'controls'
  | 'findings'
  | 'reports'

export type AuditArea =
  | 'Access'
  | 'Finance'
  | 'Pricing'
  | 'Dispatch'
  | 'Compliance'
  | 'Support'
  | 'Bookings'

export type AuditResult = 'Allowed' | 'Denied' | 'Flagged'

export type AuditChange = {
  field: string
  before: string
  after: string
}

export type AuditEvent = {
  id: string
  time: string
  timestamp?: string
  actor: string
  user?: string
  role: string
  action: string
  target: string
  module?: 'Bookings' | 'Fleet' | 'Finance' | 'Users' | 'Pricing' | 'Compliance' | 'System' | 'Equipment' | 'Rental' | 'Payments' | AuditArea
  area: AuditArea
  state: string
  city: string
  result: AuditResult | 'Failed' | 'Success'
  status?: 'Reviewed' | 'Unreviewed'
  riskLevel?: 'High' | 'Medium' | 'Low'
  sensitive: boolean
  amount?: string
  recordId?: string
  previousValues?: Record<string, string>
  newValues?: Record<string, string>
  riskAlerts?: string[]
  auditorNotes?: string
  investigationStatus?: 'Open' | 'In Progress' | 'Closed' | 'N/A'
  changes: AuditChange[]
  flagged: boolean
  note?: string
}

export type SavedFilter = {
  id: string
  name: string
  area: 'All' | AuditArea
  result: 'All' | AuditResult
  actor: string
  state: string
  query: string
}

export type AuditFilters = {
  query: string
  area: 'All' | AuditArea
  result: 'All' | AuditResult
  actor: string
  role: string
  state: string
  city: string
  action: string
  target: string
  date: string
  flaggedOnly: boolean
}

export const emptyAuditFilters: AuditFilters = {
  query: '',
  area: 'All',
  result: 'All',
  actor: '',
  role: 'All',
  state: 'All',
  city: '',
  action: '',
  target: '',
  date: 'All',
  flaggedOnly: false,
}

export type FindingSeverity = 'High' | 'Medium' | 'Low'
export type FindingStatus = 'Open' | 'Assigned' | 'In review' | 'Fixed' | 'Verified' | 'Reopened'

export type FindingComment = {
  id: string
  author: string
  role: string
  time: string
  body: string
}

export type FindingDraft = {
  title: string
  detail: string
  area: AuditArea
  severity: FindingSeverity
  evidence: string[]
}

export type Finding = {
  id: string
  title: string
  detail: string
  area: AuditArea
  severity: FindingSeverity
  status: FindingStatus
  assignee: string
  evidence: string[]
  opened: string
  rechecks: number
  comments: FindingComment[]
  auditor: string
}

export type OwnActivityEntry = {
  id: string
  time: string
  action: string
  detail: string
}

export type ExportRecord = {
  id: string
  time: string
  name: string
  kind: string
  rows: number
}

export type ScheduledReport = {
  id: string
  name: string
  cadence: 'Weekly' | 'Monthly' | 'Quarterly'
  recipients: string
  lastRun: string
  nextRun: string
  status: 'Active' | 'Paused'
}

export type AccountRow = {
  id: string
  person: string
  email: string
  phone: string
  role: string
  scope: 'National' | 'State' | 'City' | 'Zone'
  area: string
  status: 'Active' | 'Dormant' | 'Suspended' | 'Former staff'
  lastActive: string
  approvalLimit: string
  accessLevel: 'Within role' | 'Above role need'
}

export type RoleScopeRow = {
  role: string
  scope: string
  members: number
  approvalLimit: string
  keyPermissions: string
}

export type RuleHistoryRow = {
  id: string
  level: 'Global' | 'State' | 'City'
  area: AuditArea
  rule: string
  before: string
  after: string
  changedBy: string
  changedOn: string
  approvedBy: string
}

export type PriceHistoryRow = {
  id: string
  item: string
  city: string
  before: string
  after: string
  changedBy: string
  changedOn: string
  reason: string
}

export type CommissionHistoryRow = {
  id: string
  partner: string
  city: string
  before: string
  after: string
  changedBy: string
  changedOn: string
}

export type FinanceRecord = {
  id: string
  kind: 'Settlement' | 'Payout' | 'Refund' | 'Reconciliation'
  subject: string
  amount: string
  state: string
  city: string
  preparedBy: string
  approvedBy: string
  status: 'Cleared' | 'Pending' | 'Held' | 'Mismatch'
  date: string
}

export type OperationsRecord = {
  id: string
  kind: 'Booking' | 'Dispute' | 'Vehicle' | 'Driver' | 'Compliance'
  subject: string
  state: string
  city: string
  owner: string
  status: string
  date: string
}

export type SodCheck = {
  id: string
  process: string
  person: string
  preparedOn: string
  approvedOn: string
  amount: string
  severity: FindingSeverity
  status: 'Confirmed' | 'Dismissed' | 'Needs review'
}

export type LimitCheck = {
  id: string
  subject: string
  kind: 'Payout' | 'Refund' | 'Claim'
  amount: string
  limit: string
  utilisation: number
  approvedBy: string
  date: string
}

export type PatternCheck = {
  id: string
  pattern: string
  detail: string
  signalCount: number
  severity: FindingSeverity
  area: AuditArea
}

export type AccessReviewRow = {
  id: string
  person: string
  role: string
  scope: string
  issue: 'Dormant account' | 'More access than role needs' | 'Former staff still active'
  detail: string
  lastActive: string
}

export type OverrideRow = {
  id: string
  subject: string
  kind: 'Compliance override' | 'Dispatch override' | 'Limit override'
  reason: string
  authorisedBy: string
  date: string
  reviewed: boolean
}

export type AuditorNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: 'green' | 'amber' | 'red' | 'blue'
  read: boolean
  target: SectionId
}

export const auditorProfile = {
  name: 'National audit',
  adminName: 'Ishaan Kapoor',
  adminEmail: emailForRole('auditor'),
  adminInitials: 'IK',
}

export const permissions = [
  { group: 'View', items: ['audit.log.read', 'accounts.read', 'rules.read', 'finance.read', 'operations.read'] },
  { group: 'Review', items: ['control.review', 'access.review', 'override.review'] },
  { group: 'Raise', items: ['finding.raise', 'finding.assign', 'finding.recheck'] },
  { group: 'Never', items: ['approve', 'pay', 'refund', 'edit business records'] },
]

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export const auditEvents: AuditEvent[] = [
  {
    id: 'AUD-9021',
    time: 'Today · 09:41',
    timestamp: '2026-10-25T09:41:00Z',
    actor: 'Rohit Malhotra',
    user: 'rohit.malhotra@equiphub.com',
    role: 'Super admin',
    action: 'Role granted',
    target: 'Priya Nair → City admin, Hyderabad',
    module: 'Users',
    area: 'Access',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    status: 'Unreviewed',
    riskLevel: 'High',
    sensitive: true,
    recordId: 'USR-PR-221',
    previousValues: { role_key: 'support-agent', scope_type: 'city → Hyderabad (support)', approval_limit: '₹50,000' },
    newValues: { role_key: 'city-admin', scope_type: 'city → Hyderabad (full)', approval_limit: '₹2,00,000' },
    riskAlerts: ['Privilege escalation detected', 'Approval limit increased 4x'],
    auditorNotes: '',
    investigationStatus: 'Open',
    changes: [
      { field: 'role_key', before: 'support-agent', after: 'city-admin' },
      { field: 'scope_type', before: 'city → Hyderabad (support)', after: 'city → Hyderabad (full)' },
      { field: 'approval_limit', before: '₹50,000', after: '₹2,00,000' },
    ],
    flagged: true,
    note: 'Privilege escalation — review the justification for the temporary uplift.',
  },
  {
    id: 'AUD-9020',
    time: 'Today · 09:12',
    timestamp: '2026-10-25T09:12:00Z',
    actor: 'Ankit Rao',
    user: 'ankit.rao@equiphub.com',
    role: 'Finance admin',
    action: 'Payout prepared',
    target: 'SET-7741 · Sri Krishna Equipment Rentals',
    module: 'Finance',
    area: 'Finance',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    status: 'Reviewed',
    riskLevel: 'Medium',
    sensitive: true,
    amount: '₹18,42,000',
    recordId: 'SET-7741',
    riskAlerts: ['Large payout amount'],
    auditorNotes: 'Verified against settlement',
    investigationStatus: 'Closed',
    changes: [
      { field: 'status', before: 'Reconciled', after: 'Payout prepared' },
      { field: 'beneficiary_bank', before: 'HDFC ••4471', after: 'HDFC ••4471' },
    ],
    flagged: false,
  },
  {
    id: 'AUD-9019',
    time: 'Today · 08:58',
    timestamp: '2026-10-25T08:58:00Z',
    actor: 'Ankit Rao',
    user: 'ankit.rao@equiphub.com',
    role: 'Finance admin',
    action: 'Payout approved',
    target: 'SET-7741 · Sri Krishna Equipment Rentals',
    module: 'Finance',
    area: 'Finance',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    status: 'Unreviewed',
    riskLevel: 'High',
    sensitive: true,
    amount: '₹18,42,000',
    recordId: 'SET-7741',
    riskAlerts: ['SoD violation: preparer and approver same user'],
    auditorNotes: '',
    investigationStatus: 'Open',
    changes: [{ field: 'status', before: 'Payout prepared', after: 'Payout approved' }],
    flagged: true,
    note: 'Same operator prepared and approved — separation-of-duties breach.',
  },
  {
    id: 'AUD-9018',
    time: 'Today · 08:30',
    timestamp: '2026-10-25T08:30:00Z',
    actor: 'Farhan Qureshi',
    user: 'farhan.q@equiphub.com',
    role: 'Dispatcher',
    action: 'Dispatch override',
    target: 'BK-55012 · JCB 3DX assigned to Mahesh Kumar',
    module: 'Bookings',
    area: 'Dispatch',
    state: 'Karnataka',
    city: 'Bengaluru',
    result: 'Allowed',
    status: 'Unreviewed',
    riskLevel: 'Medium',
    sensitive: false,
    recordId: 'BK-55012',
    riskAlerts: ['Dispatch override'],
    auditorNotes: '',
    investigationStatus: 'Open',
    changes: [
      { field: 'assigned_driver', before: 'System pick · Ravi Teja', after: 'Manual · Mahesh Kumar' },
      { field: 'override_reason', before: '—', after: 'Driver unavailable at yard' },
    ],
    flagged: false,
  },
  {
    id: 'AUD-9017',
    time: 'Today · 08:04',
    actor: 'Neha Sethi',
    role: 'Support admin',
    action: 'Refund approved',
    target: 'RF-3319 · customer 48221',
    area: 'Support',
    state: 'Maharashtra',
    city: 'Pune',
    result: 'Allowed',
    sensitive: true,
    amount: '₹9,900',
    changes: [{ field: 'status', before: 'Requested', after: 'Approved' }],
    flagged: true,
    note: 'Refund is 1% under the ₹10,000 approval cap — pattern check flagged.',
  },
  {
    id: 'AUD-9016',
    time: 'Today · 07:44',
    actor: 'Vikram Desai',
    role: 'Super admin',
    action: 'Commission overridden',
    target: 'Deccan Heavy Machinery · Hyderabad',
    area: 'Pricing',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    sensitive: true,
    changes: [
      { field: 'commission_rate', before: '12.0%', after: '7.5%' },
      { field: 'override_window', before: '—', after: '90 days' },
    ],
    flagged: true,
    note: 'Super admin override outside the standard pricing band.',
  },
  {
    id: 'AUD-9015',
    time: 'Yesterday · 21:10',
    actor: 'System',
    role: 'Control engine',
    action: 'Action denied',
    target: 'RF-3318 · refund above cap',
    area: 'Support',
    state: 'Delhi',
    city: 'Delhi',
    result: 'Denied',
    sensitive: true,
    amount: '₹42,000',
    changes: [{ field: 'decision', before: 'Requested', after: 'Blocked · above ₹40,000 cap' }],
    flagged: false,
  },
  {
    id: 'AUD-9014',
    time: 'Yesterday · 19:02',
    actor: 'Rohit Malhotra',
    role: 'Super admin',
    action: 'Price rule changed',
    target: 'Crane · national base rate',
    area: 'Pricing',
    state: '—',
    city: '—',
    result: 'Allowed',
    sensitive: true,
    changes: [
      { field: 'base_rate', before: '₹5,499/day', after: '₹6,199/day' },
      { field: 'effective_from', before: '—', after: '01 Nov 2026' },
    ],
    flagged: false,
  },
  {
    id: 'AUD-9013',
    time: 'Yesterday · 17:35',
    actor: 'Meera Iyer',
    role: 'Compliance admin',
    action: 'Account suspended',
    target: 'Driver · Ashok Yadav',
    area: 'Compliance',
    state: 'Telangana',
    city: 'Karimnagar',
    result: 'Allowed',
    sensitive: false,
    changes: [{ field: 'status', before: 'Active', after: 'Suspended · licence expired' }],
    flagged: false,
  },
  {
    id: 'AUD-9012',
    time: 'Yesterday · 15:20',
    actor: 'Sana Kapoor',
    role: 'Finance admin',
    action: 'Reconciliation mismatch',
    target: 'REC-4412 · Chennai gateway batch',
    area: 'Finance',
    state: 'Tamil Nadu',
    city: 'Chennai',
    result: 'Flagged',
    sensitive: true,
    amount: '₹2,10,500',
    changes: [
      { field: 'ledger_total', before: '₹41,88,000', after: '₹41,67,950' },
      { field: 'status', before: 'Reconciling', after: 'Mismatch' },
    ],
    flagged: true,
    note: '₹20,050 unaccounted in the gateway settlement.',
  },
  {
    id: 'AUD-9011',
    time: 'Yesterday · 13:48',
    actor: 'Rohit Malhotra',
    role: 'Super admin',
    action: 'Account suspended',
    target: 'Operator account · Gopal Rao',
    area: 'Access',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    sensitive: true,
    changes: [{ field: 'status', before: 'Active', after: 'Suspended' }],
    flagged: false,
  },
  {
    id: 'AUD-9010',
    time: '2 days ago · 18:22',
    actor: 'Kabir Shah',
    role: 'Operations manager',
    action: 'Claim paid',
    target: 'CLM-512 · accident damage claim',
    area: 'Compliance',
    state: 'Karnataka',
    city: 'Bengaluru',
    result: 'Allowed',
    sensitive: true,
    amount: '₹3,75,000',
    changes: [{ field: 'status', before: 'Decided · approved', after: 'Paid' }],
    flagged: true,
    note: 'Same person decided and paid the claim — separation-of-duties breach.',
  },
  {
    id: 'AUD-9009',
    time: '2 days ago · 16:05',
    actor: 'Farhan Qureshi',
    role: 'Dispatcher',
    action: 'Dispatch override',
    target: 'BK-54988 · Crane re-assigned',
    area: 'Dispatch',
    state: 'Karnataka',
    city: 'Bengaluru',
    result: 'Allowed',
    sensitive: false,
    changes: [{ field: 'assigned_driver', before: 'System pick · Imran Sheikh', after: 'Manual · Imran Sheikh' }],
    flagged: false,
  },
  {
    id: 'AUD-9008',
    time: '2 days ago · 11:40',
    actor: 'Vikram Desai',
    role: 'Super admin',
    action: 'Approval limit changed',
    target: 'City admin · Hyderabad',
    area: 'Access',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    sensitive: true,
    changes: [{ field: 'approval_limit', before: '₹2,00,000', after: '₹5,00,000' }],
    flagged: false,
  },
  {
    id: 'AUD-9007',
    time: '3 days ago · 20:14',
    actor: 'Neha Sethi',
    role: 'Support admin',
    action: 'Refund approved',
    target: 'RF-3302 · customer 47110',
    area: 'Support',
    state: 'Maharashtra',
    city: 'Pune',
    result: 'Allowed',
    sensitive: true,
    amount: '₹9,750',
    changes: [{ field: 'status', before: 'Requested', after: 'Approved' }],
    flagged: false,
  },
  {
    id: 'AUD-9006',
    time: '3 days ago · 14:30',
    actor: 'Meera Iyer',
    role: 'Compliance admin',
    action: 'Compliance override',
    target: 'Permit PMT-805 · Nalgonda',
    area: 'Compliance',
    state: 'Telangana',
    city: 'Nalgonda',
    result: 'Allowed',
    sensitive: true,
    changes: [
      { field: 'permit_status', before: 'Expired', after: 'Temporary waive · 15 days' },
      { field: 'authorised_by', before: '—', after: 'Compliance admin' },
    ],
    flagged: true,
    note: 'Override authorised below the required state-admin level.',
  },
  {
    id: 'AUD-9005',
    time: '4 days ago · 10:02',
    actor: 'Priya Nair',
    role: 'City admin',
    action: 'Booking cancelled',
    target: 'BK-54880 · customer 49903',
    area: 'Bookings',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Denied',
    sensitive: false,
    changes: [{ field: 'cancel_request', before: 'Requested', after: 'Blocked · within 24h window' }],
    flagged: false,
  },
  {
    id: 'AUD-9004',
    time: '4 days ago · 09:15',
    actor: 'Rohit Malhotra',
    role: 'Super admin',
    action: 'Role revoked',
    target: 'Priya Nair → support-agent',
    area: 'Access',
    state: 'Telangana',
    city: 'Hyderabad',
    result: 'Allowed',
    sensitive: true,
    changes: [{ field: 'role_key', before: 'city-admin', after: 'support-agent' }],
    flagged: false,
  },
  {
    id: 'AUD-9003',
    time: '5 days ago · 17:44',
    actor: 'Ankit Rao',
    role: 'Finance admin',
    action: 'Payout prepared',
    target: 'SET-7712 · Warangal Earthmovers',
    area: 'Finance',
    state: 'Telangana',
    city: 'Warangal',
    result: 'Allowed',
    sensitive: true,
    amount: '₹6,90,000',
    changes: [{ field: 'status', before: 'Reconciled', after: 'Payout prepared' }],
    flagged: false,
  },
  {
    id: 'AUD-9002',
    time: '5 days ago · 12:20',
    actor: 'Sana Kapoor',
    role: 'Finance admin',
    action: 'Payout approved',
    target: 'SET-7712 · Warangal Earthmovers',
    area: 'Finance',
    state: 'Telangana',
    city: 'Warangal',
    result: 'Allowed',
    sensitive: true,
    amount: '₹6,90,000',
    changes: [{ field: 'status', before: 'Payout prepared', after: 'Payout approved' }],
    flagged: true,
    note: 'Approved within 3 minutes of preparation — verify independent review.',
  },
  {
    id: 'AUD-9001',
    time: '6 days ago · 08:55',
    actor: 'Farhan Qureshi',
    role: 'Dispatcher',
    action: 'Dispatch override',
    target: 'BK-54855 · Excavator',
    area: 'Dispatch',
    state: 'Karnataka',
    city: 'Bengaluru',
    result: 'Allowed',
    sensitive: false,
    changes: [{ field: 'assigned_driver', before: 'System pick · Gopal Rao', after: 'Manual · Gopal Rao' }],
    flagged: false,
  },
]

export const initialSavedFilters: SavedFilter[] = [
  { id: 'SF-1', name: 'All role grants this month', area: 'Access', result: 'All', actor: '', state: '', query: 'Role' },
  { id: 'SF-2', name: 'Denied actions — last 7 days', area: 'All', result: 'Denied', actor: '', state: '', query: '' },
  { id: 'SF-3', name: 'Large payouts over ₹5L', area: 'Finance', result: 'All', actor: '', state: '', query: 'Payout' },
]

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export const overviewStats = {
  activityVolume: 18432,
  activityChange: '+6.4% vs last month',
  deniedActions: 27,
  deniedChange: '9 blocked at the control layer',
  alertsTriggered: 14,
  alertsChange: '5 high severity',
  sensitiveActions: 312,
  sensitiveChange: '38 need review',
}

export const overviewHighlights = [
  { id: 'HL-1', kind: 'Role grant', detail: 'Priya Nair elevated to City admin · Hyderabad', actor: 'Rohit Malhotra', time: 'Today 09:41', tone: 'amber' as const, target: 'audit-log' as SectionId },
  { id: 'HL-2', kind: 'Override', detail: 'Commission cut to 7.5% for Deccan Heavy Machinery', actor: 'Vikram Desai', time: 'Today 07:44', tone: 'red' as const, target: 'audit-log' as SectionId },
  { id: 'HL-3', kind: 'Large payout', detail: '₹18,42,000 payout prepared and approved by same operator', actor: 'Ankit Rao', time: 'Today 08:58', tone: 'red' as const, target: 'controls' as SectionId },
  { id: 'HL-4', kind: 'Super admin activity', detail: 'Price rule changed for national crane base rate', actor: 'Rohit Malhotra', time: 'Yesterday 19:02', tone: 'amber' as const, target: 'audit-log' as SectionId },
  { id: 'HL-5', kind: 'Reconciliation', detail: '₹20,050 unaccounted in Chennai gateway batch', actor: 'Sana Kapoor', time: 'Yesterday 15:20', tone: 'red' as const, target: 'read-only' as SectionId },
]

export const trendByState = [
  { label: 'Telangana', allowed: 6420, denied: 9, flagged: 5 },
  { label: 'Karnataka', allowed: 4180, denied: 6, flagged: 3 },
  { label: 'Maharashtra', allowed: 3560, denied: 5, flagged: 2 },
  { label: 'Tamil Nadu', allowed: 2410, denied: 4, flagged: 3 },
  { label: 'Delhi', allowed: 1862, denied: 3, flagged: 1 },
]

export const trendByCity = [
  { label: 'Hyderabad', allowed: 3120, denied: 4, flagged: 3 },
  { label: 'Bengaluru', allowed: 2410, denied: 3, flagged: 2 },
  { label: 'Pune', allowed: 1880, denied: 3, flagged: 1 },
  { label: 'Chennai', allowed: 1420, denied: 2, flagged: 2 },
  { label: 'Delhi', allowed: 1120, denied: 2, flagged: 1 },
]

export const trendByRole = [
  { label: 'Finance admin', allowed: 4120, denied: 4, flagged: 6 },
  { label: 'Dispatcher', allowed: 3860, denied: 2, flagged: 3 },
  { label: 'Support admin', allowed: 3210, denied: 8, flagged: 4 },
  { label: 'Compliance admin', allowed: 2640, denied: 5, flagged: 3 },
  { label: 'Super admin', allowed: 980, denied: 0, flagged: 7 },
  { label: 'City admin', allowed: 3622, denied: 8, flagged: 2 },
]

export const auditNotifications: AuditorNotification[] = [
  { id: 'an-1', title: 'Separation-of-duties breach', detail: 'Same operator prepared and approved SET-7741 (₹18.42L).', time: '18 min ago', tone: 'red', read: false, target: 'controls' },
  { id: 'an-2', title: '5 findings awaiting re-check', detail: 'Findings marked fixed are queued for verification.', time: '1 hour ago', tone: 'amber', read: false, target: 'findings' },
  { id: 'an-3', title: 'Weekly access review due', detail: '3 dormant accounts and 1 former staff account still active.', time: '3 hours ago', tone: 'blue', read: false, target: 'controls' },
  { id: 'an-4', title: 'Reconciliation mismatch', detail: 'REC-4412 Chennai batch shows a ₹20,050 gap.', time: 'Yesterday', tone: 'red', read: true, target: 'read-only' },
  { id: 'an-5', title: 'Monthly audit report ready', detail: 'October audit pack is available to export.', time: '2 days ago', tone: 'green', read: true, target: 'reports' },
]

// ---------------------------------------------------------------------------
// Read-only module data
// ---------------------------------------------------------------------------

export const accountRows: AccountRow[] = [
  { id: 'ACC-1001', person: 'Rohit Malhotra', email: 'rohit.malhotra@equiphub.demo', phone: '+91 98100 22110', role: 'Super admin', scope: 'National', area: 'All territories', status: 'Active', lastActive: 'Today 09:41', approvalLimit: 'Unlimited', accessLevel: 'Within role' },
  { id: 'ACC-1002', person: 'Vikram Desai', email: 'vikram.desai@equiphub.demo', phone: '+91 98100 22111', role: 'Super admin', scope: 'National', area: 'All territories', status: 'Active', lastActive: 'Today 07:44', approvalLimit: 'Unlimited', accessLevel: 'Within role' },
  { id: 'ACC-1003', person: 'Priya Nair', email: 'priya.nair@equiphub.demo', phone: '+91 98100 33120', role: 'City admin', scope: 'City', area: 'Hyderabad', status: 'Active', lastActive: 'Today 09:12', approvalLimit: '₹5,00,000', accessLevel: 'Above role need' },
  { id: 'ACC-1004', person: 'Ankit Rao', email: 'ankit.rao@equiphub.demo', phone: '+91 98100 44130', role: 'Finance admin', scope: 'National', area: 'All territories', status: 'Active', lastActive: 'Today 09:12', approvalLimit: '₹20,00,000', accessLevel: 'Within role' },
  { id: 'ACC-1005', person: 'Neha Sethi', email: 'neha.sethi@equiphub.demo', phone: '+91 98100 55140', role: 'Support admin', scope: 'National', area: 'All territories', status: 'Active', lastActive: 'Today 08:04', approvalLimit: '₹40,000', accessLevel: 'Within role' },
  { id: 'ACC-1006', person: 'Meera Iyer', email: 'meera.iyer@equiphub.demo', phone: '+91 98100 66150', role: 'Compliance admin', scope: 'National', area: 'All territories', status: 'Active', lastActive: 'Yesterday 17:35', approvalLimit: '₹0 (no financial)', accessLevel: 'Within role' },
  { id: 'ACC-1007', person: 'Kabir Shah', email: 'kabir.shah@equiphub.demo', phone: '+91 98100 77160', role: 'Operations manager', scope: 'State', area: 'Karnataka', status: 'Active', lastActive: '2 days ago', approvalLimit: '₹5,00,000', accessLevel: 'Above role need' },
  { id: 'ACC-1008', person: 'Farhan Qureshi', email: 'farhan.qureshi@equiphub.demo', phone: '+91 98100 88170', role: 'Dispatcher', scope: 'City', area: 'Bengaluru', status: 'Active', lastActive: 'Today 08:30', approvalLimit: '₹0 (no financial)', accessLevel: 'Within role' },
  { id: 'ACC-1009', person: 'Deepak Menon', email: 'deepak.menon@equiphub.demo', phone: '+91 98100 99180', role: 'Finance admin', scope: 'State', area: 'Tamil Nadu', status: 'Dormant', lastActive: '84 days ago', approvalLimit: '₹10,00,000', accessLevel: 'Within role' },
  { id: 'ACC-1010', person: 'Lakshmi Rao', email: 'lakshmi.rao@equiphub.demo', phone: '+91 98100 10190', role: 'City admin', scope: 'City', area: 'Chennai', status: 'Former staff', lastActive: '12 days ago', approvalLimit: '₹2,00,000', accessLevel: 'Above role need' },
]

export const roleScopeRows: RoleScopeRow[] = [
  { role: 'Super admin', scope: 'National', members: 2, approvalLimit: 'Unlimited', keyPermissions: 'Manage rules · roles · pricing · payouts' },
  { role: 'State admin', scope: 'State', members: 9, approvalLimit: '₹10,00,000', keyPermissions: 'Approve · override · manage cities' },
  { role: 'City admin', scope: 'City', members: 41, approvalLimit: '₹5,00,000', keyPermissions: 'Approve bookings · refunds · zone ops' },
  { role: 'Finance admin', scope: 'National / State', members: 12, approvalLimit: '₹20,00,000', keyPermissions: 'Prepare · approve payouts · reconcile' },
  { role: 'Compliance admin', scope: 'National', members: 6, approvalLimit: 'No financial', keyPermissions: 'Verify docs · suspend · override' },
  { role: 'Support admin', scope: 'National', members: 34, approvalLimit: '₹40,000', keyPermissions: 'Refund · assist bookings' },
  { role: 'Dispatcher', scope: 'City', members: 58, approvalLimit: 'No financial', keyPermissions: 'Assign · override dispatch' },
]

export const ruleHistoryRows: RuleHistoryRow[] = [
  { id: 'RH-501', level: 'Global', area: 'Support', rule: 'Max refund without state sign-off', before: '₹10,000', after: '₹40,000', changedBy: 'Rohit Malhotra', changedOn: '28 Sep 2026', approvedBy: 'Board · finance' },
  { id: 'RH-500', level: 'Global', area: 'Pricing', rule: 'Crane base rate', before: '₹5,499/day', after: '₹6,199/day', changedBy: 'Rohit Malhotra', changedOn: '08 Oct 2026', approvedBy: 'Pricing committee' },
  { id: 'RH-499', level: 'State', area: 'Dispatch', rule: 'Auto-dispatch radius · Karnataka', before: '12 km', after: '18 km', changedBy: 'Kabir Shah', changedOn: '02 Oct 2026', approvedBy: 'State admin' },
  { id: 'RH-498', level: 'City', area: 'Compliance', rule: 'Permit grace period · Nalgonda', before: '0 days', after: '15 days', changedBy: 'Meera Iyer', changedOn: '05 Oct 2026', approvedBy: 'Pending review' },
  { id: 'RH-497', level: 'Global', area: 'Access', rule: 'City admin approval limit', before: '₹2,00,000', after: '₹5,00,000', changedBy: 'Vikram Desai', changedOn: '06 Oct 2026', approvedBy: 'Super admin' },
]

export const priceHistoryRows: PriceHistoryRow[] = [
  { id: 'PH-301', item: 'Hydraulic Crane 25T', city: 'Hyderabad', before: '₹5,499/day', after: '₹6,199/day', changedBy: 'Rohit Malhotra', changedOn: '08 Oct 2026', reason: 'National base rate revision' },
  { id: 'PH-300', item: 'JCB 3DX', city: 'Pune', before: '₹2,499/day', after: '₹2,299/day', changedBy: 'Kabir Shah', changedOn: '04 Oct 2026', reason: 'Local demand dip' },
  { id: 'PH-299', item: 'Compactor RM-800', city: 'Bengaluru', before: '₹1,899/day', after: '₹2,050/day', changedBy: 'Farhan Qureshi', changedOn: '30 Sep 2026', reason: 'Competitive alignment' },
  { id: 'PH-298', item: 'Excavator CAT 320', city: 'Chennai', before: '₹3,199/day', after: '₹3,499/day', changedBy: 'Deepak Menon', changedOn: '27 Sep 2026', reason: 'Fuel surcharge' },
]

export const commissionHistoryRows: CommissionHistoryRow[] = [
  { id: 'CH-210', partner: 'Deccan Heavy Machinery', city: 'Hyderabad', before: '12.0%', after: '7.5%', changedBy: 'Vikram Desai', changedOn: '08 Oct 2026' },
  { id: 'CH-209', partner: 'Sri Krishna Equipment Rentals', city: 'Hyderabad', before: '12.0%', after: '11.0%', changedBy: 'Rohit Malhotra', changedOn: '01 Oct 2026' },
  { id: 'CH-208', partner: 'Warangal Earthmovers', city: 'Warangal', before: '13.5%', after: '12.0%', changedBy: 'Ankit Rao', changedOn: '26 Sep 2026' },
]

export const financeRecords: FinanceRecord[] = [
  { id: 'SET-7741', kind: 'Payout', subject: 'Sri Krishna Equipment Rentals', amount: '₹18,42,000', state: 'Telangana', city: 'Hyderabad', preparedBy: 'Ankit Rao', approvedBy: 'Ankit Rao', status: 'Pending', date: '08 Oct 2026' },
  { id: 'SET-7712', kind: 'Payout', subject: 'Warangal Earthmovers', amount: '₹6,90,000', state: 'Telangana', city: 'Warangal', preparedBy: 'Ankit Rao', approvedBy: 'Sana Kapoor', status: 'Cleared', date: '05 Oct 2026' },
  { id: 'REC-4412', kind: 'Reconciliation', subject: 'Chennai gateway batch', amount: '₹41,67,950', state: 'Tamil Nadu', city: 'Chennai', preparedBy: 'Sana Kapoor', approvedBy: '—', status: 'Mismatch', date: '07 Oct 2026' },
  { id: 'SET-7690', kind: 'Settlement', subject: 'Deccan Heavy Machinery', amount: '₹12,10,000', state: 'Telangana', city: 'Hyderabad', preparedBy: 'Ankit Rao', approvedBy: 'Rohit Malhotra', status: 'Cleared', date: '02 Oct 2026' },
  { id: 'RF-3319', kind: 'Refund', subject: 'Customer 48221 · Pune', amount: '₹9,900', state: 'Maharashtra', city: 'Pune', preparedBy: 'Neha Sethi', approvedBy: 'Neha Sethi', status: 'Pending', date: '08 Oct 2026' },
  { id: 'RF-3302', kind: 'Refund', subject: 'Customer 47110 · Pune', amount: '₹9,750', state: 'Maharashtra', city: 'Pune', preparedBy: 'Neha Sethi', approvedBy: 'Neha Sethi', status: 'Cleared', date: '06 Oct 2026' },
  { id: 'REC-4409', kind: 'Reconciliation', subject: 'Delhi UPI batch', amount: '₹9,84,300', state: 'Delhi', city: 'Delhi', preparedBy: 'Sana Kapoor', approvedBy: '—', status: 'Cleared', date: '04 Oct 2026' },
]

export const operationsRecords: OperationsRecord[] = [
  { id: 'BK-55012', kind: 'Booking', subject: 'JCB 3DX · customer 51002', state: 'Karnataka', city: 'Bengaluru', owner: 'Farhan Qureshi', status: 'Dispatched', date: '08 Oct 2026' },
  { id: 'BK-54988', kind: 'Booking', subject: 'Crane 25T · customer 49330', state: 'Karnataka', city: 'Bengaluru', owner: 'Farhan Qureshi', status: 'In transit', date: '07 Oct 2026' },
  { id: 'DSP-1021', kind: 'Dispute', subject: 'Damage claim · customer 48811', state: 'Maharashtra', city: 'Pune', owner: 'Support admin', status: 'Open', date: '06 Oct 2026' },
  { id: 'VEH-2201', kind: 'Vehicle', subject: 'TS-07-TK-1178 · Volvo FMX 440', state: 'Telangana', city: 'Hyderabad', owner: 'Compliance admin', status: 'Suspended', date: '06 Oct 2026' },
  { id: 'DRV-3390', kind: 'Driver', subject: 'Ashok Yadav', state: 'Telangana', city: 'Karimnagar', owner: 'Compliance admin', status: 'Suspended', date: '07 Oct 2026' },
  { id: 'CMP-812', kind: 'Compliance', subject: 'DOC-4110 · insurance mismatch', state: 'Telangana', city: 'Karimnagar', owner: 'Compliance admin', status: 'Escalated', date: '05 Oct 2026' },
  { id: 'BK-54880', kind: 'Booking', subject: 'Excavator · customer 49903', state: 'Telangana', city: 'Hyderabad', owner: 'Priya Nair', status: 'Cancelled', date: '04 Oct 2026' },
]

// ---------------------------------------------------------------------------
// Control reviews
// ---------------------------------------------------------------------------

export const sodChecks: SodCheck[] = [
  { id: 'SOD-81', process: 'Payout prepared and approved by same person', person: 'Ankit Rao', preparedOn: 'SET-7741 · 08 Oct 08:58', approvedOn: 'SET-7741 · 08:58', amount: '₹18,42,000', severity: 'High', status: 'Confirmed' },
  { id: 'SOD-80', process: 'Claim decided and paid by same person', person: 'Kabir Shah', preparedOn: 'CLM-512 · 06 Oct', approvedOn: 'CLM-512 · 06 Oct', amount: '₹3,75,000', severity: 'High', status: 'Confirmed' },
  { id: 'SOD-79', process: 'Refund requested and approved by same person', person: 'Neha Sethi', preparedOn: 'RF-3302 · 06 Oct', approvedOn: 'RF-3302 · 06 Oct', amount: '₹9,750', severity: 'Medium', status: 'Confirmed' },
  { id: 'SOD-78', process: 'Price change requested and approved by same person', person: 'Kabir Shah', preparedOn: 'PH-300 · 04 Oct', approvedOn: 'PH-300 · 04 Oct', amount: '—', severity: 'Medium', status: 'Needs review' },
]

export const limitChecks: LimitCheck[] = [
  { id: 'LIM-61', subject: 'Payout SET-7741', kind: 'Payout', amount: '₹18,42,000', limit: '₹20,00,000', utilisation: 92, approvedBy: 'Ankit Rao', date: '08 Oct 2026' },
  { id: 'LIM-60', subject: 'Claim CLM-512', kind: 'Claim', amount: '₹3,75,000', limit: '₹5,00,000', utilisation: 75, approvedBy: 'Kabir Shah', date: '06 Oct 2026' },
  { id: 'LIM-59', subject: 'Refund RF-3319', kind: 'Refund', amount: '₹9,900', limit: '₹10,000', utilisation: 99, approvedBy: 'Neha Sethi', date: '08 Oct 2026' },
  { id: 'LIM-58', subject: 'Refund RF-3302', kind: 'Refund', amount: '₹9,750', limit: '₹10,000', utilisation: 98, approvedBy: 'Neha Sethi', date: '06 Oct 2026' },
]

export const patternChecks: PatternCheck[] = [
  { id: 'PAT-41', pattern: 'Refunds just under the cap', detail: '7 refunds between ₹9,500 and ₹10,000 approved by the same operator in 14 days.', signalCount: 7, severity: 'High', area: 'Support' },
  { id: 'PAT-40', pattern: 'Repeated dispatch overrides', detail: 'Dispatcher Farhan Qureshi overrode auto-dispatch 22 times this month, 8 to the same driver.', signalCount: 22, severity: 'Medium', area: 'Dispatch' },
  { id: 'PAT-39', pattern: 'One operator takes most manual assignments', detail: 'Gopal Rao received 41% of all manual assignments across Bengaluru.', signalCount: 41, severity: 'Medium', area: 'Dispatch' },
  { id: 'PAT-38', pattern: 'Role grants outside change window', detail: '3 of 4 role grants this month were made after 21:00.', signalCount: 3, severity: 'Low', area: 'Access' },
]

export const superAdminActivity = auditEvents.filter((event) => event.role === 'Super admin')

export const accessReviewRows: AccessReviewRow[] = [
  { id: 'AR-71', person: 'Deepak Menon', role: 'Finance admin', scope: 'Tamil Nadu', issue: 'Dormant account', detail: 'No activity for 84 days but retains payout preparation rights.', lastActive: '84 days ago' },
  { id: 'AR-70', person: 'Lakshmi Rao', role: 'City admin', scope: 'Chennai', issue: 'Former staff still active', detail: 'Offboarded 12 days ago; account never disabled.', lastActive: '12 days ago' },
  { id: 'AR-69', person: 'Priya Nair', role: 'City admin', scope: 'Hyderabad', issue: 'More access than role needs', detail: 'Holds unlimited rule-edit rights beyond city scope.', lastActive: 'Today 09:12' },
  { id: 'AR-68', person: 'Kabir Shah', role: 'Operations manager', scope: 'Karnataka', issue: 'More access than role needs', detail: 'Payout approval limit (₹5L) exceeds operations role needs.', lastActive: '2 days ago' },
]

export const overrideRows: OverrideRow[] = [
  { id: 'OVR-51', subject: 'Permit PMT-805 · Nalgonda', kind: 'Compliance override', reason: '15-day fitness waive for a live project', authorisedBy: 'Meera Iyer (Compliance admin)', date: '05 Oct 2026', reviewed: false },
  { id: 'OVR-50', subject: 'Commission · Deccan Heavy Machinery', kind: 'Limit override', reason: 'Commission cut to 7.5% for 90 days', authorisedBy: 'Vikram Desai (Super admin)', date: '08 Oct 2026', reviewed: false },
  { id: 'OVR-49', subject: 'Dispatch radius · Karnataka', kind: 'Dispatch override', reason: 'Extend auto-dispatch radius to 18 km', authorisedBy: 'Kabir Shah (Operations manager)', date: '02 Oct 2026', reviewed: false },
  { id: 'OVR-48', subject: 'Refund cap · RF-3318', kind: 'Limit override', reason: '₹42,000 refund above cap', authorisedBy: 'Blocked by control engine', date: '07 Oct 2026', reviewed: true },
]

export const initialFindings: Finding[] = [
  {
    id: 'FND-1201',
    title: 'Segregation of duties breach on payout SET-7741',
    detail: 'Ankit Rao prepared and approved a ₹18,42,000 payout with no second reviewer. Two-person control was bypassed.',
    area: 'Finance',
    severity: 'High',
    status: 'Assigned',
    assignee: 'Rohit Malhotra',
    evidence: ['AUD-9020', 'AUD-9019', 'SET-7741'],
    opened: '08 Oct 2026',
    rechecks: 0,
    auditor: 'Ishaan Kapoor',
    comments: [
      { id: 'c1', author: 'Ishaan Kapoor', role: 'Auditor', time: '08 Oct 10:10', body: 'Raised from the finance control review. Evidence attached.' },
      { id: 'c2', author: 'Rohit Malhotra', role: 'Super admin', time: '08 Oct 11:02', body: 'Acknowledged. Assigning a second approver and freezing the batch.' },
    ],
  },
  {
    id: 'FND-1200',
    title: 'Dormant finance account with live payout rights',
    detail: 'Deepak Menon has not signed in for 84 days yet can still prepare payouts in Tamil Nadu.',
    area: 'Access',
    severity: 'Medium',
    status: 'Open',
    assignee: 'Unassigned',
    evidence: ['ACC-1009', 'AR-71'],
    opened: '07 Oct 2026',
    rechecks: 0,
    auditor: 'Ishaan Kapoor',
    comments: [{ id: 'c1', author: 'Ishaan Kapoor', role: 'Auditor', time: '07 Oct 16:20', body: 'Flagged in the weekly access review.' }],
  },
  {
    id: 'FND-1199',
    title: 'Compliance override authorised below required level',
    detail: 'A 15-day permit waive was authorised by a compliance admin instead of the state admin.',
    area: 'Compliance',
    severity: 'High',
    status: 'In review',
    assignee: 'Meera Iyer',
    evidence: ['AUD-9006', 'OVR-51'],
    opened: '06 Oct 2026',
    rechecks: 1,
    auditor: 'Ishaan Kapoor',
    comments: [
      { id: 'c1', author: 'Ishaan Kapoor', role: 'Auditor', time: '06 Oct 09:00', body: 'Override taken outside delegated authority.' },
      { id: 'c2', author: 'Meera Iyer', role: 'Compliance admin', time: '06 Oct 14:30', body: 'Needed for a safety-critical project. Ratification pending.' },
    ],
  },
  {
    id: 'FND-1198',
    title: 'Refund pattern just under approval cap',
    detail: 'Seven refunds between ₹9,500 and ₹10,000 by one operator suggest deliberate cap avoidance.',
    area: 'Support',
    severity: 'Medium',
    status: 'Fixed',
    assignee: 'Neha Sethi',
    evidence: ['PAT-41', 'RF-3319', 'RF-3302'],
    opened: '04 Oct 2026',
    rechecks: 0,
    auditor: 'Ishaan Kapoor',
    comments: [
      { id: 'c1', author: 'Ishaan Kapoor', role: 'Auditor', time: '04 Oct 12:00', body: 'Please confirm the refunds were independently justified.' },
      { id: 'c2', author: 'Neha Sethi', role: 'Support admin', time: '05 Oct 09:40', body: 'Added a mandatory second-check for refunds over ₹9,000. Marking fixed.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const reportCards = [
  { id: 'RPT-1', name: 'Monthly audit report', detail: 'Summary of reviews, findings and open issues for October 2026.', updated: '08 Oct 2026', kind: 'Audit' },
  { id: 'RPT-2', name: 'Access review report', detail: 'Dormant, over-privileged and former-staff accounts.', updated: '07 Oct 2026', kind: 'Access' },
  { id: 'RPT-3', name: 'Control exceptions report', detail: 'SoD, approval-limit and pattern-rule exceptions.', updated: '08 Oct 2026', kind: 'Controls' },
  { id: 'RPT-4', name: 'Super admin activity report', detail: 'Every privileged action taken by super admins.', updated: '08 Oct 2026', kind: 'Privileged' },
]

export const scheduledReports: ScheduledReport[] = [
  { id: 'SCH-1', name: 'Weekly control exception digest', cadence: 'Weekly', recipients: 'Audit lead · Super admin', lastRun: '06 Oct 2026', nextRun: '13 Oct 2026', status: 'Active' },
  { id: 'SCH-2', name: 'Monthly access review', cadence: 'Monthly', recipients: 'Audit lead · HR', lastRun: '01 Oct 2026', nextRun: '01 Nov 2026', status: 'Active' },
  { id: 'SCH-3', name: 'Quarterly full audit pack', cadence: 'Quarterly', recipients: 'Board · Audit lead', lastRun: '01 Oct 2026', nextRun: '01 Jan 2027', status: 'Paused' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let ownActivitySeed = 1

export const nextOwnActivityId = () => `OWN-${100 + ownActivitySeed++}`

export const maskPhone = (phone: string) => phone.replace(/\+91\s*(\d{2})\d{3}\s*(\d{2})\d{3}/, '+91 $1*** $2***')

export const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')
  if (!domain) return '•••••'
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(name.length - 2, 3))}@${domain}`
}

export const severityTone: Record<FindingSeverity, 'red' | 'amber' | 'blue'> = {
  High: 'red',
  Medium: 'amber',
  Low: 'blue',
}

export const resultTone: Record<AuditResult, 'green' | 'red' | 'amber'> = {
  Allowed: 'green',
  Denied: 'red',
  Flagged: 'amber',
}

export const areaOptions: Array<'All' | AuditArea> = [
  'All',
  'Access',
  'Finance',
  'Pricing',
  'Dispatch',
  'Compliance',
  'Support',
  'Bookings',
]

export const stateOptions = ['All', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi']

export const roleOptions = [
  'All',
  'Super admin',
  'State admin',
  'City admin',
  'Finance admin',
  'Compliance admin',
  'Support admin',
  'Dispatcher',
  'Operations manager',
]

export const resultOptions: Array<'All' | AuditResult> = ['All', 'Allowed', 'Denied', 'Flagged']

export const actionOptions = [
  'All',
  'Role granted',
  'Role revoked',
  'Approval limit changed',
  'Account suspended',
  'Payout prepared',
  'Payout approved',
  'Refund approved',
  'Commission overridden',
  'Price rule changed',
  'Dispatch override',
  'Claim paid',
  'Compliance override',
  'Reconciliation mismatch',
  'Booking cancelled',
  'Action denied',
]

export const dateOptions = ['All', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days']

export const matchesDate = (time: string, date: string): boolean => {
  if (date === 'All') return true
  const lower = time.toLowerCase()
  if (date === 'Today') return lower.startsWith('today')
  if (date === 'Yesterday') return lower.startsWith('yesterday')
  if (date === 'Last 7 days') return true
  if (date === 'Last 30 days') return true
  return true
}

export const filterEvents = (events: AuditEvent[], filters: AuditFilters): AuditEvent[] =>
  events.filter((event) => {
    const haystack = `${event.id} ${event.actor} ${event.role} ${event.action} ${event.target} ${event.area} ${event.state} ${event.city}`.toLowerCase()
    const query = filters.query.trim().toLowerCase()
    return (
      (query === '' || haystack.includes(query)) &&
      (filters.area === 'All' || event.area === filters.area) &&
      (filters.result === 'All' || event.result === filters.result) &&
      (filters.actor.trim() === '' || event.actor.toLowerCase().includes(filters.actor.trim().toLowerCase())) &&
      (filters.role === 'All' || event.role === filters.role) &&
      (filters.state === 'All' || event.state === filters.state) &&
      (filters.city.trim() === '' || event.city.toLowerCase().includes(filters.city.trim().toLowerCase())) &&
      (filters.action === 'All' || event.action === filters.action) &&
      (filters.target.trim() === '' || event.target.toLowerCase().includes(filters.target.trim().toLowerCase())) &&
      matchesDate(event.time, filters.date) &&
      (!filters.flaggedOnly || event.flagged)
    )
  })
