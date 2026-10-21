// Read-only audit trail for the Operations Manager dashboard.
// Every entry records an already-authorised operational action (vehicle
// allocation, booking update, task assignment, status change, approval,
// escalation) together with the actor, their role, the timestamp, the
// affected record and the outcome. Records are never edited or deleted here.
import type { AuditActionCategory } from '@fieldwork/shared'
import type { AuditLogRecord } from '../../lib/auditAccess'
import { opsProfile, type AuditEntry } from './operationsData'

export type OpsAuditAction =
  | 'vehicle_allocation'
  | 'booking_update'
  | 'task_assignment'
  | 'status_change'
  | 'approval'
  | 'escalation'
  | 'authentication'
  | 'export'

export type OpsAuditRecord = AuditLogRecord & {
  opsAction: OpsAuditAction
  reason: string
}

export const OPS_AUDIT_ACTION_LABELS: Record<OpsAuditAction, string> = {
  vehicle_allocation: 'Vehicle allocation',
  booking_update: 'Booking update',
  task_assignment: 'Task assignment',
  status_change: 'Status change',
  approval: 'Approval',
  escalation: 'Escalation',
  authentication: 'Authentication',
  export: 'Data export',
}

export const OPS_AUDIT_ACTIONS: OpsAuditAction[] = [
  'vehicle_allocation',
  'booking_update',
  'task_assignment',
  'status_change',
  'approval',
  'escalation',
  'authentication',
  'export',
]

export const OPS_AUDIT_OUTCOME_LABELS: Record<string, string> = {
  success: 'Success',
  warning: 'Warning',
  denied: 'Denied',
  failure: 'Failure',
}

const MINUTES = 60 * 1000
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTES).toISOString()

type Seed = {
  id: string
  minutes: number
  actorName: string
  actorRole: string
  action: OpsAuditAction
  actionLabel: string
  category: AuditActionCategory
  entityType: string
  entityId: string
  entityLabel: string
  outcome: AuditLogRecord['outcome']
  reason: string
  zone?: string
  city?: string
}

const SEED: Seed[] = [
  {
    id: 'AU-204',
    minutes: 12,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'vehicle_allocation',
    actionLabel: 'Vehicle allocated to job',
    category: 'update',
    entityType: 'job',
    entityId: 'JOB-7802',
    entityLabel: 'JOB-7802 · CAT 320 Excavator',
    outcome: 'success',
    reason: 'Customer requested an excavator with trenching attachment.',
  },
  {
    id: 'AU-203',
    minutes: 38,
    actorName: 'Ayesha Khan',
    actorRole: 'dispatcher',
    action: 'task_assignment',
    actionLabel: 'Job prioritised',
    category: 'create',
    entityType: 'job',
    entityId: 'JOB-7801',
    entityLabel: 'JOB-7801 · Tower Crane 6T · Urgent',
    outcome: 'success',
    reason: 'Metro rail site outage — crane needed before noon.',
  },
  {
    id: 'AU-202',
    minutes: 96,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'status_change',
    actionLabel: 'Booking status changed to Cancelled',
    category: 'status_change',
    entityType: 'booking',
    entityId: 'BK-5131',
    entityLabel: 'BK-5131 · GCC Engineering',
    outcome: 'success',
    reason: 'Customer submitted written cancellation within the cooling-off window.',
  },
  {
    id: 'AU-201',
    minutes: 150,
    actorName: 'Neha Pillai',
    actorRole: 'dispatcher',
    action: 'task_assignment',
    actionLabel: 'Shift handover note added',
    category: 'create',
    entityType: 'shift',
    entityId: 'HN-118',
    entityLabel: 'Morning shift · Madhapur',
    outcome: 'success',
    reason: 'Crane queue flagged for the noon slot.',
  },
  {
    id: 'AU-200',
    minutes: 215,
    actorName: 'Ravi Teja',
    actorRole: 'operator',
    action: 'status_change',
    actionLabel: 'Job status changed to In Progress',
    category: 'status_change',
    entityType: 'job',
    entityId: 'JOB-7798',
    entityLabel: 'JOB-7798 · Volvo FMX Tipper',
    outcome: 'success',
    reason: 'Vehicle handed over at the Kondapur yard.',
  },
  {
    id: 'AU-199',
    minutes: 260,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'approval',
    actionLabel: 'Maintenance request approved',
    category: 'approval',
    entityType: 'maintenance_request',
    entityId: 'MT-089',
    entityLabel: 'MT-089 · CAT 320 Excavator',
    outcome: 'success',
    reason: 'Hydraulic hose replacement needed before the next rental cycle.',
  },
  {
    id: 'AU-198',
    minutes: 305,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'vehicle_allocation',
    actionLabel: 'Operator reassigned on in-progress job',
    category: 'update',
    entityType: 'job',
    entityId: 'JOB-7798',
    entityLabel: 'JOB-7798 · Rakesh Naidu',
    outcome: 'success',
    reason: 'Original operator dropped out — vehicle breakdown.',
  },
  {
    id: 'AU-197',
    minutes: 360,
    actorName: 'Priya Ramesh',
    actorRole: 'city-admin',
    action: 'booking_update',
    actionLabel: 'Booking machine changed',
    category: 'update',
    entityType: 'booking',
    entityId: 'BK-5182',
    entityLabel: 'BK-5182 · L&T Metro Rail',
    outcome: 'success',
    reason: 'Original excavator model was unavailable; a CAT 320 was substituted with customer consent.',
  },
  {
    id: 'AU-196',
    minutes: 420,
    actorName: 'Sridhar Nair',
    actorRole: 'zone-admin',
    action: 'approval',
    actionLabel: 'Overtime request approved',
    category: 'approval',
    entityType: 'shift',
    entityId: 'OT-042',
    entityLabel: 'OT-042 · Evening shift',
    outcome: 'success',
    reason: 'Two extra operators cleared for the metro rail handover.',
  },
  {
    id: 'AU-195',
    minutes: 520,
    actorName: 'Ayesha Khan',
    actorRole: 'dispatcher',
    action: 'status_change',
    actionLabel: 'Job marked stuck',
    category: 'status_change',
    entityType: 'job',
    entityId: 'JOB-7790',
    entityLabel: 'JOB-7790 · ACE Hydra Crane 14T',
    outcome: 'warning',
    reason: 'Site access denied at the Uppal entry gate.',
  },
  {
    id: 'AU-194',
    minutes: 640,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'escalation',
    actionLabel: 'Escalated to city admin',
    category: 'status_change',
    entityType: 'escalation',
    entityId: 'ESC-14',
    entityLabel: 'ESC-14 · Hyderabad dispatcher',
    outcome: 'success',
    reason: 'Unassigned queue breached the 30 minute SLA.',
  },
  {
    id: 'AU-193',
    minutes: 720,
    actorName: 'Anitha Rao',
    actorRole: 'state-admin',
    action: 'approval',
    actionLabel: 'Vehicle release approved',
    category: 'approval',
    entityType: 'vehicle',
    entityId: 'VH-031',
    entityLabel: 'VH-031 · Tower Crane 6T',
    outcome: 'success',
    reason: 'Idle crane redeployed from the Gachibowli yard.',
  },
  {
    id: 'AU-192',
    minutes: 810,
    actorName: 'Fatima Zahra',
    actorRole: 'operator',
    action: 'authentication',
    actionLabel: 'User login',
    category: 'auth',
    entityType: 'session',
    entityId: 'SES-771',
    entityLabel: 'Mobile app · Madhapur zone',
    outcome: 'success',
    reason: 'Shift sign-in from the operator app.',
  },
  {
    id: 'AU-191',
    minutes: 900,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'booking_update',
    actionLabel: 'Booking window extended',
    category: 'update',
    entityType: 'booking',
    entityId: 'BK-5182',
    entityLabel: 'BK-5182 · L&T Metro Rail',
    outcome: 'success',
    reason: 'Site timeline slipped by four days at the customer request.',
  },
  {
    id: 'AU-190',
    minutes: 1_040,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'export',
    actionLabel: 'Zone report exported',
    category: 'export',
    entityType: 'report',
    entityId: 'RPT-221',
    entityLabel: 'Zone operations report · CSV',
    outcome: 'success',
    reason: 'Monthly operations review shared with the city admin.',
  },
  {
    id: 'AU-189',
    minutes: 1_180,
    actorName: 'Ayesha Khan',
    actorRole: 'dispatcher',
    action: 'vehicle_allocation',
    actionLabel: 'Vehicle allocated to job',
    category: 'update',
    entityType: 'job',
    entityId: 'JOB-7793',
    entityLabel: 'JOB-7793 · Tower Crane 6T · Ayesha Siddiqui',
    outcome: 'success',
    reason: 'Sobha Realty confirmed the morning slot.',
  },
  {
    id: 'AU-188',
    minutes: 1_320,
    actorName: 'Imran Ali',
    actorRole: 'operator',
    action: 'status_change',
    actionLabel: 'Job status changed to Completed',
    category: 'status_change',
    entityType: 'job',
    entityId: 'JOB-7789',
    entityLabel: 'JOB-7789 · Schwing Stetter Mixer',
    outcome: 'success',
    reason: 'Equipment returned and inspected at the Raidurg yard.',
  },
  {
    id: 'AU-187',
    minutes: 1_500,
    actorName: 'Support Desk',
    actorRole: 'support-agent',
    action: 'booking_update',
    actionLabel: 'Booking machine changed',
    category: 'update',
    entityType: 'booking',
    entityId: 'BK-5176',
    entityLabel: 'BK-5176 · My Home Builders',
    outcome: 'success',
    reason: 'Requested model was unavailable; equivalent mixer substituted.',
  },
  {
    id: 'AU-186',
    minutes: 1_700,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'escalation',
    actionLabel: 'Escalated to city admin',
    category: 'status_change',
    entityType: 'escalation',
    entityId: 'ESC-13',
    entityLabel: 'ESC-13 · Vehicle allocation hold',
    outcome: 'denied',
    reason: 'Allocation held — crane reserved by another zone without release.',
  },
  {
    id: 'AU-185',
    minutes: 1_900,
    actorName: 'Ayesha Khan',
    actorRole: 'dispatcher',
    action: 'task_assignment',
    actionLabel: 'Task assigned to operator',
    category: 'create',
    entityType: 'job',
    entityId: 'JOB-7788',
    entityLabel: 'JOB-7788 · JCB 3CX Backhoe',
    outcome: 'success',
    reason: 'Assigned to the nearest available excavator crew.',
  },
  {
    id: 'AU-184',
    minutes: 2_100,
    actorName: 'Kiran Vardhan',
    actorRole: 'operator',
    action: 'authentication',
    actionLabel: 'Login attempt',
    category: 'auth',
    entityType: 'session',
    entityId: 'SES-764',
    entityLabel: 'Mobile app · Madhapur zone',
    outcome: 'failure',
    reason: 'Stale device token — re-authentication required.',
  },
  {
    id: 'AU-183',
    minutes: 2_320,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'approval',
    actionLabel: 'Maintenance request approved',
    category: 'approval',
    entityType: 'maintenance_request',
    entityId: 'MT-087',
    entityLabel: 'MT-087 · JCB 3CX Backhoe',
    outcome: 'success',
    reason: 'Engine oil service approved within the quarterly schedule.',
  },
  {
    id: 'AU-182',
    minutes: 2_540,
    actorName: 'Sridhar Nair',
    actorRole: 'zone-admin',
    action: 'vehicle_allocation',
    actionLabel: 'Vehicle allocation released',
    category: 'update',
    entityType: 'vehicle',
    entityId: 'VH-028',
    entityLabel: 'VH-028 · Volvo FMX Tipper',
    outcome: 'success',
    reason: 'Vehicle released back to the Madhapur pool after inspection.',
  },
  {
    id: 'AU-181',
    minutes: 2_800,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'status_change',
    actionLabel: 'Booking status changed to Confirmed',
    category: 'status_change',
    entityType: 'booking',
    entityId: 'BK-5190',
    entityLabel: 'BK-5190 · HCC Constructions',
    outcome: 'success',
    reason: 'Payment received and machine slot reserved.',
  },
  {
    id: 'AU-180',
    minutes: 3_100,
    actorName: 'Priya Ramesh',
    actorRole: 'city-admin',
    action: 'escalation',
    actionLabel: 'Escalated to state admin',
    category: 'status_change',
    entityType: 'escalation',
    entityId: 'ESC-12',
    entityLabel: 'ESC-12 · Zone allocation dispute',
    outcome: 'success',
    reason: 'Cross-zone allocation dispute referred to the state admin.',
  },
  {
    id: 'AU-179',
    minutes: 3_400,
    actorName: opsProfile.adminName,
    actorRole: 'operations-manager',
    action: 'export',
    actionLabel: 'Zone report exported',
    category: 'export',
    entityType: 'report',
    entityId: 'RPT-218',
    entityLabel: 'Fleet utilisation report · PDF',
    outcome: 'success',
    reason: 'Fleet utilisation snapshot sent to the city admin.',
  },
  // Records outside the operations manager's zone — hidden by the scope filter.
  {
    id: 'AU-178',
    minutes: 55,
    actorName: 'Mohit Bansal',
    actorRole: 'zone-admin',
    action: 'vehicle_allocation',
    actionLabel: 'Vehicle allocated to job',
    category: 'update',
    entityType: 'job',
    entityId: 'JOB-6602',
    entityLabel: 'JOB-6602 · Gachibowli zone',
    outcome: 'success',
    reason: 'Gachibowli zone allocation.',
    zone: 'Gachibowli',
  },
  {
    id: 'AU-177',
    minutes: 320,
    actorName: 'Sunita Devi',
    actorRole: 'operator',
    action: 'status_change',
    actionLabel: 'Job status changed to In Progress',
    category: 'status_change',
    entityType: 'job',
    entityId: 'JOB-6591',
    entityLabel: 'JOB-6591 · Uppal zone',
    outcome: 'success',
    reason: 'Uppal zone handover.',
    zone: 'Uppal',
  },
  {
    id: 'AU-176',
    minutes: 1_500,
    actorName: 'Anitha Rao',
    actorRole: 'state-admin',
    action: 'approval',
    actionLabel: 'Vehicle release approved',
    category: 'approval',
    entityType: 'vehicle',
    entityId: 'VH-088',
    entityLabel: 'VH-088 · Kukatpally zone',
    outcome: 'success',
    reason: 'Kukatpally zone redeployment.',
    zone: 'Kukatpally',
  },
  {
    id: 'AU-175',
    minutes: 2_200,
    actorName: 'Mohit Bansal',
    actorRole: 'zone-admin',
    action: 'task_assignment',
    actionLabel: 'Task assigned to operator',
    category: 'create',
    entityType: 'job',
    entityId: 'JOB-6530',
    entityLabel: 'JOB-6530 · Gachibowli zone',
    outcome: 'success',
    reason: 'Gachibowli zone task.',
    zone: 'Gachibowli',
  },
]

const toRecord = (seed: Seed): OpsAuditRecord => {
  const zone = seed.zone ?? opsProfile.zone
  return {
    id: seed.id,
    createdAt: minutesAgo(seed.minutes),
    actorId: null,
    actorEmail: null,
    actorName: seed.actorName,
    actorRole: seed.actorRole,
    action: seed.category,
    actionLabel: seed.actionLabel,
    entityType: seed.entityType,
    entityId: seed.entityId,
    entityLabel: seed.entityLabel,
    stateId: null,
    cityId: null,
    zoneId: null,
    stateName: opsProfile.state,
    cityName: seed.city ?? opsProfile.city,
    zoneName: zone,
    previousValues: null,
    newValues: null,
    outcome: seed.outcome,
    ipAddress: '192.168.1.56',
    userAgent: 'Mozilla/5.0',
    metadata: { reason: seed.reason },
    opsAction: seed.action,
    reason: seed.reason,
  }
}

export const opsAuditLogs: OpsAuditRecord[] = SEED.map(toRecord)

export type ClassifiedAction = {
  opsAction: OpsAuditAction
  category: AuditActionCategory
}

/** Maps a free-text action onto the operations audit taxonomy. */
export function classifyOpsAction(action: string): ClassifiedAction {
  const text = action.toLowerCase()
  if (text.includes('escalat')) return { opsAction: 'escalation', category: 'status_change' }
  if (text.includes('approv')) return { opsAction: 'approval', category: 'approval' }
  if (text.includes('export')) return { opsAction: 'export', category: 'export' }
  if (text.includes('login') || text.includes('sign-in') || text.includes('sign in')) {
    return { opsAction: 'authentication', category: 'auth' }
  }
  if (text.includes('cancel') || text.includes('status') || text.includes('stuck') || text.includes('resolved')) {
    return { opsAction: 'status_change', category: 'status_change' }
  }
  if (
    text.includes('allocat') ||
    text.includes('reassign') ||
    text.includes('dispatch override') ||
    text.includes('operator assigned') ||
    text.includes('vehicle')
  ) {
    return { opsAction: 'vehicle_allocation', category: 'update' }
  }
  if (text.includes('booking')) return { opsAction: 'booking_update', category: 'update' }
  if (text.includes('priorit') || text.includes('task') || text.includes('handover') || text.includes('assign')) {
    return { opsAction: 'task_assignment', category: 'create' }
  }
  return { opsAction: 'task_assignment', category: 'update' }
}

const todayAt = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return new Date().toISOString()
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

const entityFromTarget = (target: string) => {
  const id = target.split(' ')[0]
  if (id.startsWith('JOB-')) return { entityType: 'job', entityId: id }
  if (id.startsWith('BK-')) return { entityType: 'booking', entityId: id }
  if (id.startsWith('ESC-')) return { entityType: 'escalation', entityId: id }
  if (id.startsWith('MT-')) return { entityType: 'maintenance_request', entityId: id }
  if (id.startsWith('HN-')) return { entityType: 'shift', entityId: id }
  return { entityType: 'dispatch', entityId: id }
}

/** Converts the dashboard's live action trail into full audit records. */
export function sessionAuditToRecords(entries: AuditEntry[]): OpsAuditRecord[] {
  return entries.map((entry) => {
    const { opsAction, category } = classifyOpsAction(entry.action)
    const { entityType, entityId } = entityFromTarget(entry.target)
    const createdAt = entry.time === 'Just now' ? new Date().toISOString() : todayAt(entry.time)
    return {
      id: entry.id,
      createdAt,
      actorId: null,
      actorEmail: opsProfile.adminEmail,
      actorName: entry.actor,
      actorRole: 'operations-manager',
      action: category,
      actionLabel: entry.action,
      entityType,
      entityId,
      entityLabel: entry.target,
      stateId: null,
      cityId: null,
      zoneId: null,
      stateName: opsProfile.state,
      cityName: opsProfile.city,
      zoneName: opsProfile.zone,
      previousValues: null,
      newValues: null,
      outcome: 'success',
      ipAddress: null,
      userAgent: null,
      metadata: { reason: entry.reason },
      opsAction,
      reason: entry.reason,
    }
  })
}
