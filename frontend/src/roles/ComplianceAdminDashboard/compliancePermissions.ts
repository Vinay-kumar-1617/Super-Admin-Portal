// Authorisation model for the Compliance Admin console.
//
// This module is the single source of truth for what a Compliance Admin may do:
//   * the permission catalogue (granted / requires approval / restricted)
//   * the delegated approval limits and the authority that owns anything above them
//   * the operations that are never available from this dashboard
//   * the escalation procedures and their SLAs
//   * the geographic and record scope the account can reach
//
// Every mutating handler in the dashboard runs through `evaluateCompliancePermission`
// so the UI, the audit trail and the backend enforcement all agree on the same rules.

export type CompliancePermissionTier = 'granted' | 'approval' | 'restricted'

export type ComplianceAuthority = 'State admin' | 'Auditor' | 'Super admin' | 'Finance admin'

export type CompliancePermission =
  | 'alert.acknowledge'
  | 'document.verify'
  | 'document.reject'
  | 'document.destroy'
  | 'permit.verify'
  | 'inspection.record'
  | 'inspection.schedule'
  | 'vehicle.suspend'
  | 'driver.suspend'
  | 'suspension.reinstate'
  | 'vehicle.hold-clear'
  | 'driver.credential-clear'
  | 'violation.resolve'
  | 'violation.waive'
  | 'action.raise'
  | 'action.complete'
  | 'action.extend'
  | 'audit.start'
  | 'audit.close'
  | 'escalation.create'
  | 'escalation.resolve'
  | 'expiry.remind'
  | 'report.export'
  | 'fleet.export'
  | 'rules.view'
  | 'account.manage'
  | 'role.assign'
  | 'scope.expand'

export type CompliancePermissionDefinition = {
  key: CompliancePermission
  label: string
  module: string
  tier: CompliancePermissionTier
  /** Authority that owns the decision when this permission is not self-approvable. */
  authority?: ComplianceAuthority
  /** Delegated limit. Anything above the threshold has to be escalated. */
  limit?: {
    threshold: number
    unit: string
    description: string
  }
  /** One-line statement shown on the rules page. */
  summary: string
  /** Why the rule exists / what the limit means. */
  detail: string
  /** Audit category used when the action is recorded. */
  auditCategory:
    | 'approval'
    | 'status_change'
    | 'create'
    | 'delete'
    | 'update'
    | 'export'
    | 'user_management'
    | 'permission_change'
}

export const COMPLIANCE_PERMISSIONS: Record<CompliancePermission, CompliancePermissionDefinition> = {
  'alert.acknowledge': {
    key: 'alert.acknowledge',
    label: 'Acknowledge a compliance alert',
    module: 'Overview',
    tier: 'granted',
    summary: 'Mark an urgent alert as seen and take ownership of the follow-up.',
    detail: 'Acknowledging an alert does not close it — the underlying violation still needs a decision.',
    auditCategory: 'status_change',
  },
  'document.verify': {
    key: 'document.verify',
    label: 'Verify compliance documents',
    module: 'Documents',
    tier: 'granted',
    summary: 'Mark a submitted licence, registration or insurance record as verified.',
    detail:
      'Verification is self-approving inside the Telangana compliance scope. Every decision is written to the audit trail with the actor and timestamp.',
    auditCategory: 'approval',
  },
  'document.reject': {
    key: 'document.reject',
    label: 'Reject non-conforming documents',
    module: 'Documents',
    tier: 'granted',
    summary: 'Reject a document with a recorded reason and start the resubmission cycle.',
    detail:
      'A rejection reason of at least four characters is mandatory and is stored against the record so the owner can correct and resubmit.',
    auditCategory: 'approval',
  },
  'document.destroy': {
    key: 'document.destroy',
    label: 'Permanently delete compliance records',
    module: 'Documents',
    tier: 'restricted',
    authority: 'Super admin',
    summary: 'Hard-delete documents, permits and inspection history.',
    detail:
      'Retention policy keeps compliance records for seven years. Deletion is a data-retention decision and is never available to a Compliance Admin.',
    auditCategory: 'delete',
  },
  'permit.verify': {
    key: 'permit.verify',
    label: 'Verify vehicle permits',
    module: 'Permits',
    tier: 'granted',
    summary: 'Confirm state, national and urban permit validity from the permit register.',
    detail: 'Permit verification only affects the permit register; it does not release a dispatch hold by itself.',
    auditCategory: 'approval',
  },
  'inspection.record': {
    key: 'inspection.record',
    label: 'Record inspection outcomes',
    module: 'Inspections',
    tier: 'granted',
    summary: 'Record pass, fail or pass-with-conditions against a scheduled inspection.',
    detail: 'A failed inspection automatically opens a follow-up line on the vehicle compliance record.',
    auditCategory: 'status_change',
  },
  'inspection.schedule': {
    key: 'inspection.schedule',
    label: 'Publish the inspection calendar',
    module: 'Inspections',
    tier: 'approval',
    authority: 'State admin',
    limit: {
      threshold: 12,
      unit: 'inspections per month',
      description: 'Up to 12 newly scheduled inspections per month are self-approved.',
    },
    summary: 'Schedule new fleet inspections inside the state calendar.',
    detail:
      'Compliance Admin may add inspections to the existing state calendar. Publishing a new inspection cycle for the state needs State Admin sign-off.',
    auditCategory: 'create',
  },
  'vehicle.suspend': {
    key: 'vehicle.suspend',
    label: 'Suspend a vehicle',
    module: 'Suspensions',
    tier: 'granted',
    summary: 'Block a vehicle from dispatch with a reason and supporting evidence.',
    detail: 'Suspension requires a reason and one piece of evidence; the vehicle is blocked from dispatch immediately.',
    auditCategory: 'status_change',
  },
  'driver.suspend': {
    key: 'driver.suspend',
    label: 'Suspend a driver',
    module: 'Suspensions',
    tier: 'granted',
    summary: 'Suspend a driver credential and remove the account from dispatch rotation.',
    detail: 'A suspended driver cannot be assigned to a vehicle until the suspension is reinstated.',
    auditCategory: 'status_change',
  },
  'suspension.reinstate': {
    key: 'suspension.reinstate',
    label: 'Reinstate a suspended vehicle or driver',
    module: 'Suspensions',
    tier: 'approval',
    authority: 'State admin',
    limit: {
      threshold: 30,
      unit: 'days suspended',
      description: 'Reinstations inside 30 days of suspension are self-approved.',
    },
    summary: 'Lift a compliance suspension and return the asset or driver to service.',
    detail:
      'Short suspensions are lifted by Compliance Admin. Suspensions older than 30 days need a State Admin decision because the underlying finding may need re-inspection.',
    auditCategory: 'status_change',
  },
  'vehicle.hold-clear': {
    key: 'vehicle.hold-clear',
    label: 'Clear a vehicle dispatch hold',
    module: 'Vehicles',
    tier: 'approval',
    authority: 'State admin',
    limit: {
      threshold: 2,
      unit: 'open violations',
      description: 'Holds on vehicles with up to 2 open violations are cleared directly.',
    },
    summary: 'Release a blocked vehicle back into the dispatch pool.',
    detail:
      'A hold is cleared once the blocking findings are closed. Vehicles carrying more than two open violations need State Admin approval before they re-enter dispatch.',
    auditCategory: 'status_change',
  },
  'driver.credential-clear': {
    key: 'driver.credential-clear',
    label: 'Clear a driver credential hold',
    module: 'Drivers',
    tier: 'granted',
    summary: 'Lift a credential hold once the renewed document is verified.',
    detail: 'The credential must be verified or renewed before the hold can be lifted.',
    auditCategory: 'status_change',
  },
  'violation.resolve': {
    key: 'violation.resolve',
    label: 'Resolve a violation',
    module: 'Violations',
    tier: 'granted',
    summary: 'Close a violation once the corrective evidence is accepted.',
    detail: 'Closing a violation does not waive it — the underlying finding stays on the record.',
    auditCategory: 'status_change',
  },
  'violation.waive': {
    key: 'violation.waive',
    label: 'Waive a violation',
    module: 'Violations',
    tier: 'restricted',
    authority: 'State admin',
    summary: 'Cancel a violation without a corrective action.',
    detail:
      'Waiving removes the finding from the compliance score, so it is never self-approvable. Requests are raised as an escalation and decided by the State Admin.',
    auditCategory: 'approval',
  },
  'action.raise': {
    key: 'action.raise',
    label: 'Raise a corrective action',
    module: 'Corrective actions',
    tier: 'granted',
    summary: 'Open a corrective action against a violation and assign an owner.',
    detail: 'One open corrective action per violation; a second request is rejected as a duplicate.',
    auditCategory: 'create',
  },
  'action.complete': {
    key: 'action.complete',
    label: 'Close a corrective action',
    module: 'Corrective actions',
    tier: 'approval',
    authority: 'State admin',
    limit: {
      threshold: 14,
      unit: 'days overdue',
      description: 'Actions closed within 14 days of the due date are self-approved.',
    },
    summary: 'Mark a corrective action as complete.',
    detail:
      'Actions closed inside the 14-day grace window are closed directly. Anything older than 14 days overdue is escalated because the breach itself needs a decision.',
    auditCategory: 'status_change',
  },
  'action.extend': {
    key: 'action.extend',
    label: 'Extend a corrective action due date',
    module: 'Corrective actions',
    tier: 'restricted',
    authority: 'State admin',
    summary: 'Push a corrective action due date past the agreed deadline.',
    detail:
      'Deadline extensions change the compliance obligation, so they are raised to the State Admin as an escalation instead of being applied directly.',
    auditCategory: 'update',
  },
  'audit.start': {
    key: 'audit.start',
    label: 'Start a scheduled audit',
    module: 'Audits',
    tier: 'granted',
    summary: 'Move an audit from preparation into the scheduled field phase.',
    detail: 'Only the audit schedule is affected — the result is signed off separately.',
    auditCategory: 'status_change',
  },
  'audit.close': {
    key: 'audit.close',
    label: 'Sign off a completed audit',
    module: 'Audits',
    tier: 'restricted',
    authority: 'Auditor',
    summary: 'Close an audit and publish its findings.',
    detail:
      'An audit cannot be signed off by the person who scheduled it. Sign-off belongs to the independent Auditor role so findings stay independently verified.',
    auditCategory: 'approval',
  },
  'escalation.create': {
    key: 'escalation.create',
    label: 'Raise an escalation',
    module: 'Escalations',
    tier: 'granted',
    summary: 'Send a case to the State Admin or Super Admin with a documented reason.',
    detail: 'Escalations carry the reason, the subject and the source record reference.',
    auditCategory: 'create',
  },
  'escalation.resolve': {
    key: 'escalation.resolve',
    label: 'Close an escalation',
    module: 'Escalations',
    tier: 'granted',
    summary: 'Close an escalation once the deciding authority has responded.',
    detail: 'The outcome of the escalation is recorded against the source record.',
    auditCategory: 'status_change',
  },
  'expiry.remind': {
    key: 'expiry.remind',
    label: 'Send expiry reminders',
    module: 'Expiry tracking',
    tier: 'granted',
    summary: 'Notify owners, drivers and partners about upcoming or lapsed documents.',
    detail: 'Reminders are batched for every record expiring inside seven days.',
    auditCategory: 'update',
  },
  'report.export': {
    key: 'report.export',
    label: 'Export compliance reports',
    module: 'Reports',
    tier: 'granted',
    summary: 'Export the document, permit, inspection and suspension registers as CSV.',
    detail: 'Exports are limited to the Telangana compliance scope and are logged.',
    auditCategory: 'export',
  },
  'fleet.export': {
    key: 'fleet.export',
    label: 'Export the fleet compliance register',
    module: 'Reports',
    tier: 'granted',
    summary: 'Export vehicle, credential, violation, corrective action and audit registers.',
    detail: 'The fleet export contains no customer contact data and stays inside the state scope.',
    auditCategory: 'export',
  },
  'rules.view': {
    key: 'rules.view',
    label: 'View rules and permissions',
    module: 'Rules',
    tier: 'granted',
    summary: 'Read the authority scope, delegated limits and escalation procedures.',
    detail: 'The rules page is read-only. It describes the limits, it does not change them.',
    auditCategory: 'update',
  },
  'account.manage': {
    key: 'account.manage',
    label: 'Create, edit or disable admin accounts',
    module: 'Privileges',
    tier: 'restricted',
    authority: 'Super admin',
    summary: 'Manage admin accounts and their scope.',
    detail:
      'Account administration is a Super Admin function. A Compliance Admin cannot create, edit, disable or re-scope any account — including their own.',
    auditCategory: 'user_management',
  },
  'role.assign': {
    key: 'role.assign',
    label: 'Assign roles or change permissions',
    module: 'Privileges',
    tier: 'restricted',
    authority: 'Super admin',
    summary: 'Grant, revoke or change the permissions attached to an account.',
    detail:
      'Privilege changes are refused by the API for every role except Super Admin. Attempts are recorded as denied permission-change events and surfaced to the Auditor.',
    auditCategory: 'permission_change',
  },
  'scope.expand': {
    key: 'scope.expand',
    label: 'Widen your own scope',
    module: 'Privileges',
    tier: 'restricted',
    authority: 'Super admin',
    summary: 'Extend the geographic or record scope attached to your own account.',
    detail:
      'Scope is set when the account is provisioned. Widening it is a privilege change and is refused by the API.',
    auditCategory: 'permission_change',
  },
}

export const COMPLIANCE_PERMISSION_KEYS = Object.keys(COMPLIANCE_PERMISSIONS) as CompliancePermission[]

export type ComplianceModuleMatrixRow = {
  module: string
  view: 'Allowed' | 'Own scope'
  create: 'Allowed' | 'Approval' | 'No'
  edit: 'Allowed' | 'Approval' | 'No'
  approve: 'Allowed' | 'Delegated' | 'Restricted'
  export: 'Allowed' | 'No'
  restricted: string
}

export const COMPLIANCE_MODULE_MATRIX: ComplianceModuleMatrixRow[] = [
  {
    module: 'Overview',
    view: 'Own scope',
    create: 'No',
    edit: 'Allowed',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Closing a critical alert without a recorded decision',
  },
  {
    module: 'Documents',
    view: 'Own scope',
    create: 'No',
    edit: 'Allowed',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Permanent deletion of compliance records',
  },
  {
    module: 'Permits',
    view: 'Own scope',
    create: 'No',
    edit: 'Allowed',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Permit issuance and fee decisions',
  },
  {
    module: 'Inspections',
    view: 'Own scope',
    create: 'Approval',
    edit: 'Allowed',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Publishing a new state inspection cycle',
  },
  {
    module: 'Suspensions',
    view: 'Own scope',
    create: 'Allowed',
    edit: 'Allowed',
    approve: 'Delegated',
    export: 'Allowed',
    restricted: 'Reinstating suspensions older than 30 days',
  },
  {
    module: 'Vehicles',
    view: 'Own scope',
    create: 'No',
    edit: 'Approval',
    approve: 'Delegated',
    export: 'Allowed',
    restricted: 'Clearing holds on vehicles with 3+ open violations',
  },
  {
    module: 'Drivers',
    view: 'Own scope',
    create: 'No',
    edit: 'Allowed',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Suspending a driver outside the state scope',
  },
  {
    module: 'Violations',
    view: 'Own scope',
    create: 'Allowed',
    edit: 'Allowed',
    approve: 'Restricted',
    export: 'Allowed',
    restricted: 'Waiving a violation without corrective action',
  },
  {
    module: 'Corrective actions',
    view: 'Own scope',
    create: 'Allowed',
    edit: 'Approval',
    approve: 'Delegated',
    export: 'Allowed',
    restricted: 'Extending an agreed due date',
  },
  {
    module: 'Audits',
    view: 'Own scope',
    create: 'No',
    edit: 'Allowed',
    approve: 'Restricted',
    export: 'Allowed',
    restricted: 'Signing off an audit that you scheduled',
  },
  {
    module: 'Escalations',
    view: 'Own scope',
    create: 'Allowed',
    edit: 'No',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Closing an escalation without a decision',
  },
  {
    module: 'Expiry tracking',
    view: 'Own scope',
    create: 'No',
    edit: 'Allowed',
    approve: 'Allowed',
    export: 'Allowed',
    restricted: 'Reinstating a lapsed account without re-verification',
  },
  {
    module: 'Rules & privileges',
    view: 'Own scope',
    create: 'No',
    edit: 'No',
    approve: 'Restricted',
    export: 'No',
    restricted: 'Role assignment, scope widening, self-service privilege changes',
  },
]

export type ComplianceApprovalLimit = {
  id: string
  label: string
  delegated: string
  above: string
  authority: ComplianceAuthority
  sla: string
}

export const COMPLIANCE_APPROVAL_LIMITS: ComplianceApprovalLimit[] = [
  {
    id: 'vehicle-hold',
    label: 'Vehicle dispatch holds',
    delegated: 'Up to 2 open violations',
    above: '3 or more open violations',
    authority: 'State admin',
    sla: 'Decision within 1 working day',
  },
  {
    id: 'corrective-action',
    label: 'Corrective action closure',
    delegated: 'Within 14 days of the due date',
    above: 'More than 14 days overdue',
    authority: 'State admin',
    sla: 'Decision within 2 working days',
  },
  {
    id: 'suspension-reinstate',
    label: 'Suspension reinstatement',
    delegated: 'Within 30 days of suspension',
    above: 'Older than 30 days',
    authority: 'State admin',
    sla: 'Decision within 1 working day',
  },
  {
    id: 'inspection-calendar',
    label: 'Inspection scheduling',
    delegated: 'Up to 12 per month',
    above: 'New state inspection cycle',
    authority: 'State admin',
    sla: 'Cycle published within 5 working days',
  },
  {
    id: 'penalty-settlement',
    label: 'Penalty and fine settlement',
    delegated: 'Not delegated',
    above: 'Any penalty value',
    authority: 'Finance admin',
    sla: 'Settlement within 3 working days',
  },
]

export type ComplianceRestrictedOperation = {
  id: string
  operation: string
  owner: ComplianceAuthority
  reason: string
  effect: string
}

export const COMPLIANCE_RESTRICTED_OPERATIONS: ComplianceRestrictedOperation[] = [
  {
    id: 'role-assign',
    operation: 'Assigning roles or editing permissions',
    owner: 'Super admin',
    reason: 'Privilege changes are separated from the duties they authorise.',
    effect: 'API returns 403 and records a denied permission-change event.',
  },
  {
    id: 'account-manage',
    operation: 'Creating, editing or disabling admin accounts',
    owner: 'Super admin',
    reason: 'Account lifecycle is owned by the platform owner.',
    effect: 'API returns 403; the account stays untouched.',
  },
  {
    id: 'scope-expand',
    operation: 'Widening the scope of an account, including your own',
    owner: 'Super admin',
    reason: 'Scope is fixed at provisioning time.',
    effect: 'API returns 403 and the requested scope is discarded.',
  },
  {
    id: 'violation-waive',
    operation: 'Waiving a violation without a corrective action',
    owner: 'State admin',
    reason: 'A waiver removes the finding from the compliance score.',
    effect: 'The request is routed to the escalation desk instead.',
  },
  {
    id: 'audit-close',
    operation: 'Signing off an audit and publishing its findings',
    owner: 'Auditor',
    reason: 'The auditor who scheduled an audit cannot sign it off.',
    effect: 'Audit results stay unsigned and are published by the Auditor role.',
  },
  {
    id: 'action-extend',
    operation: 'Extending a corrective action due date',
    owner: 'State admin',
    reason: 'Deadline changes alter the compliance obligation.',
    effect: 'The request is routed to the escalation desk instead.',
  },
  {
    id: 'record-delete',
    operation: 'Deleting compliance records',
    owner: 'Super admin',
    reason: 'Seven-year retention applies to every compliance record.',
    effect: 'Records are archived, never removed.',
  },
  {
    id: 'penalty-approve',
    operation: 'Approving penalty waivers or fine settlements',
    owner: 'Finance admin',
    reason: 'Financial decisions sit outside the compliance mandate.',
    effect: 'The request is routed to the escalation desk instead.',
  },
]

export type ComplianceEscalationStep = {
  id: string
  step: string
  owner: string
  sla: string
  detail: string
}

export type ComplianceEscalationProcedure = {
  id: string
  trigger: string
  authority: ComplianceAuthority
  sla: string
  steps: ComplianceEscalationStep[]
}

export const COMPLIANCE_ESCALATION_PROCEDURES: ComplianceEscalationProcedure[] = [
  {
    id: 'limit-breach',
    trigger: 'A decision exceeds a delegated limit',
    authority: 'State admin',
    sla: 'Escalate within 4 hours · decision within 1 working day',
    steps: [
      {
        id: 'limit-1',
        step: 'Capture the request',
        owner: 'Compliance Admin',
        sla: 'Immediate',
        detail: 'The subject, the requested decision and the limit that was exceeded are captured with the record.',
      },
      {
        id: 'limit-2',
        step: 'Raise the escalation',
        owner: 'Compliance Admin',
        sla: 'Within 4 hours',
        detail: 'The case is raised on the escalation desk with a reason and a link back to the source record.',
      },
      {
        id: 'limit-3',
        step: 'State Admin decision',
        owner: 'State admin',
        sla: '1 working day',
        detail: 'The State Admin approves, rejects or requests more evidence and the outcome is recorded.',
      },
      {
        id: 'limit-4',
        step: 'Apply and audit',
        owner: 'Compliance Admin',
        sla: 'Same day',
        detail: 'The approved decision is applied and both the approval and the application are written to the audit trail.',
      },
    ],
  },
  {
    id: 'restricted-operation',
    trigger: 'A restricted operation is requested',
    authority: 'Super admin',
    sla: 'Escalate within 4 hours · decision within 2 working days',
    steps: [
      {
        id: 'restricted-1',
        step: 'Refuse in place',
        owner: 'Compliance Admin',
        sla: 'Immediate',
        detail: 'The action is blocked before any state changes, and the attempt is recorded as denied.',
      },
      {
        id: 'restricted-2',
        step: 'Raise the escalation',
        owner: 'Compliance Admin',
        sla: 'Within 4 hours',
        detail: 'The request is written up with the business reason and the authority that owns it.',
      },
      {
        id: 'restricted-3',
        step: 'Authority decision',
        owner: 'Super admin',
        sla: '2 working days',
        detail: 'The owning authority decides and the outcome is attached to the escalation.',
      },
      {
        id: 'restricted-4',
        step: 'Audit the refusal',
        owner: 'Compliance Admin',
        sla: 'Same day',
        detail: 'The denial and the follow-up are both written to the audit trail for the Auditor.',
      },
    ],
  },
  {
    id: 'critical-breach',
    trigger: 'A critical violation or a repeated breach',
    authority: 'State admin',
    sla: 'Notify within 1 hour · decision within 4 hours',
    steps: [
      {
        id: 'critical-1',
        step: 'Place the hold',
        owner: 'Compliance Admin',
        sla: 'Immediate',
        detail: 'Dispatch is blocked on the vehicle or driver before any investigation completes.',
      },
      {
        id: 'critical-2',
        step: 'Raise a corrective action',
        owner: 'Compliance Admin',
        sla: 'Within 1 hour',
        detail: 'A corrective action is opened with a named owner and a due date.',
      },
      {
        id: 'critical-3',
        step: 'Notify the authority',
        owner: 'State admin',
        sla: 'Within 1 hour',
        detail: 'The State Admin is notified with the violation, the hold and the evidence on file.',
      },
      {
        id: 'critical-4',
        step: 'Close the loop',
        owner: 'Compliance Admin',
        sla: 'Within 4 hours of the decision',
        detail: 'The decision is applied and the compliance score is recalculated.',
      },
    ],
  },
]

export const COMPLIANCE_SCOPE = {
  role: 'Compliance admin',
  holder: 'Telangana state compliance',
  state: 'Telangana',
  cities: ['Hyderabad', 'Warangal'],
  recordTypes: [
    'Compliance documents',
    'Vehicle permits',
    'Inspection records',
    'Violations and notices',
    'Corrective actions',
    'Audit schedule',
    'Driver credentials',
    'Expiry reminders',
  ],
  outsideScope: [
    'Any other state',
    'Customer contact data',
    'Financial settlements and payouts',
    'Admin accounts and role assignment',
    'Billing, pricing and refund decisions',
  ],
  enforcement: [
    'Every mutation is authorised by the API before it is applied',
    'Denied operations return 403 and change nothing',
    'Denied attempts are written to the decision log for the Auditor',
    'Privilege changes are refused for every role except Super Admin',
  ],
}

export type ComplianceDecisionContext = {
  /** Number of open violations still attached to the subject. */
  openViolations?: number
  /** Days the corrective action is already overdue by. */
  daysOverdue?: number
  /** Days the subject has been suspended for. */
  daysSuspended?: number
  /** Inspections scheduled inside the current month. */
  inspectionsThisMonth?: number
}

export type ComplianceDecision = {
  permission: CompliancePermission
  allowed: boolean
  tier: CompliancePermissionTier
  /** True when the action may proceed, but only with the named authority's approval. */
  requiresApproval: boolean
  authority?: ComplianceAuthority
  /** Human readable explanation, used for toasts and the audit trail. */
  reason: string
}

const LIMIT_CHECKS: Partial<
  Record<CompliancePermission, (context: ComplianceDecisionContext) => { breached: boolean; description: string } | null>
> = {
  'vehicle.hold-clear': (context) => {
    const open = context.openViolations ?? 0
    return {
      breached: open > (COMPLIANCE_PERMISSIONS['vehicle.hold-clear'].limit?.threshold ?? 2),
      description: `${open} open violations on this vehicle`,
    }
  },
  'action.complete': (context) => {
    const days = context.daysOverdue ?? 0
    return {
      breached: days > (COMPLIANCE_PERMISSIONS['action.complete'].limit?.threshold ?? 14),
      description: `${days} days overdue`,
    }
  },
  'suspension.reinstate': (context) => {
    const days = context.daysSuspended ?? 0
    return {
      breached: days > (COMPLIANCE_PERMISSIONS['suspension.reinstate'].limit?.threshold ?? 30),
      description: `${days} days suspended`,
    }
  },
  'inspection.schedule': (context) => {
    const count = context.inspectionsThisMonth ?? 0
    return {
      breached: count > (COMPLIANCE_PERMISSIONS['inspection.schedule'].limit?.threshold ?? 12),
      description: `${count} inspections scheduled this month`,
    }
  },
}

/**
 * Single gate for every compliance action.
 *
 * `granted`  → allowed immediately.
 * `approval` → allowed now, but escalated once the delegated limit is breached.
 * `restricted` → never allowed from this dashboard; it belongs to another authority.
 */
export function evaluateCompliancePermission(
  permission: CompliancePermission,
  context: ComplianceDecisionContext = {},
): ComplianceDecision {
  const definition = COMPLIANCE_PERMISSIONS[permission]
  if (!definition) {
    return {
      permission,
      allowed: false,
      tier: 'restricted',
      requiresApproval: false,
      reason: `Unknown permission "${permission}".`,
    }
  }

  if (definition.tier === 'restricted') {
    return {
      permission,
      allowed: false,
      tier: 'restricted',
      requiresApproval: false,
      authority: definition.authority,
      reason: `${definition.label} is not available to the ${COMPLIANCE_SCOPE.role}. ${
        definition.authority ? `It requires ${definition.authority} authority.` : ''
      }`.trim(),
    }
  }

  if (definition.tier === 'approval') {
    const check = LIMIT_CHECKS[permission]?.(context) ?? null
    if (check?.breached) {
      return {
        permission,
        allowed: false,
        tier: 'approval',
        requiresApproval: true,
        authority: definition.authority,
        reason: `${definition.limit?.description ?? 'Delegated limit exceeded'} — ${check.description} exceeds the delegated limit. Raise an escalation for ${definition.authority} approval.`,
      }
    }
    return {
      permission,
      allowed: true,
      tier: 'approval',
      requiresApproval: false,
      authority: definition.authority,
      reason: definition.limit
        ? `Within the delegated limit — ${definition.limit.description}`
        : definition.summary,
    }
  }

  return {
    permission,
    allowed: true,
    tier: 'granted',
    requiresApproval: false,
    reason: definition.summary,
  }
}

/** Convenience wrapper used by the UI to enable or disable an action button. */
export function canPerform(
  permission: CompliancePermission,
  context: ComplianceDecisionContext = {},
): boolean {
  return evaluateCompliancePermission(permission, context).allowed
}

/**
 * Lookup handed to the dashboard sections so every action button can ask the
 * permission model whether it is allowed, and why it is not when it is not.
 */
export type ComplianceCheck = (
  permission: CompliancePermission,
  context?: ComplianceDecisionContext,
) => ComplianceDecision

/** Plain snapshot of the rules, shared by the rules page and the API payload. */
export function complianceRulesPayload() {
  return {
    scope: COMPLIANCE_SCOPE,
    permissions: COMPLIANCE_PERMISSION_KEYS.map((key) => COMPLIANCE_PERMISSIONS[key]),
    moduleMatrix: COMPLIANCE_MODULE_MATRIX,
    approvalLimits: COMPLIANCE_APPROVAL_LIMITS,
    restrictedOperations: COMPLIANCE_RESTRICTED_OPERATIONS,
    escalationProcedures: COMPLIANCE_ESCALATION_PROCEDURES,
  }
}
