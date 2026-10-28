// Seed data, types and metadata for the global Finance Admin dashboard.
import { emailForRole } from '../../auth/roleAccounts.ts'

export type SectionId =
  | 'overview'
  | 'commission'
  | 'settlements'
  | 'owner-settlements'
  | 'operator-payments'
  | 'customer-payments'
  | 'payouts'
  | 'invoices'
  | 'refunds'
  | 'reconciliation'
  | 'approvals'
  | 'reports'
  | 'audit-log'
  | 'notifications'

export type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

export const financeSections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'Finance overview', crumb: 'Overview' },
  { id: 'commission', label: 'Commission', title: 'Commission controls', crumb: 'Commission' },
  { id: 'settlements', label: 'Settlements', title: 'Settlement runs', crumb: 'Settlements' },
  { id: 'owner-settlements', label: 'Owner settlements', title: 'Owner settlement center', crumb: 'Owner Settlements' },
  { id: 'operator-payments', label: 'Operator payments', title: 'Operator payment center', crumb: 'Operator Payments' },
  { id: 'customer-payments', label: 'Customer payments', title: 'Customer payment management', crumb: 'Customer Payments' },
  { id: 'payouts', label: 'Payouts', title: 'Payout approvals', crumb: 'Payouts' },
  { id: 'invoices', label: 'Invoices', title: 'Invoices & statements', crumb: 'Invoices' },
  { id: 'refunds', label: 'Refunds', title: 'Refund approvals', crumb: 'Refunds' },
  { id: 'reconciliation', label: 'Reconciliation', title: 'Reconciliation', crumb: 'Reconciliation' },
  { id: 'approvals', label: 'Approval center', title: 'Finance approval center', crumb: 'Approvals' },
  { id: 'reports', label: 'Reports', title: 'Finance reports', crumb: 'Reports' },
  { id: 'audit-log', label: 'Audit Log', title: 'Finance audit log', crumb: 'Audit Log' },
  { id: 'notifications', label: 'Notifications', title: 'Finance notifications', crumb: 'Notifications' },
]

export const financePeriods = ['This Month', 'Last Month', 'This Quarter', 'This Year'] as const

export const financeProfile = {
  name: 'Rohit Menon',
  email: emailForRole('finance-admin'),
  initials: 'RM',
  scopeLabel: 'Global finance',
  approvalLimit: '₹2,00,000',
  approvalLimitValue: 200000,
  currency: '₹',
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type FinanceKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export const financeKpis: FinanceKpi[] = [
  {
    label: 'Gross revenue',
    value: '₹24.86Cr',
    change: '+12.4%',
    tone: 'green',
    description: 'Rental revenue recorded across all states and cities this period.',
    target: 'reports',
  },
  {
    label: 'Commission earned',
    value: '₹3.73Cr',
    change: '+9.1%',
    tone: 'blue',
    description: 'Platform commission earned after settlement adjustments.',
    target: 'commission',
  },
  {
    label: 'Payouts due',
    value: '₹5.84Cr',
    change: '+4.6%',
    tone: 'orange',
    description: 'Owner and operator payouts approved but not yet released.',
    target: 'payouts',
  },
  {
    label: 'Payouts paid',
    value: '₹11.29Cr',
    change: '+15.2%',
    tone: 'purple',
    description: 'Payouts successfully settled to owners and operators this period.',
    target: 'payouts',
  },
  {
    label: 'Pending settlements',
    value: '14 runs',
    change: '-3 today',
    tone: 'orange',
    description: 'Settlement runs waiting for review, adjustment or finalization.',
    target: 'settlements',
  },
]

export type ScopeLevel = 'State' | 'City' | 'Zone'

export type ScopeRow = {
  id: string
  level: ScopeLevel
  name: string
  region: string
  revenue: string
  commission: string
  payouts: string
  pending: string
  share: number
}

export const scopeBreakdown: ScopeRow[] = [
  { id: 'sc-1', level: 'State', name: 'Telangana', region: 'South', revenue: '₹9.64Cr', commission: '₹1.45Cr', payouts: '₹4.12Cr', pending: '₹0.68Cr', share: 39 },
  { id: 'sc-2', level: 'State', name: 'Karnataka', region: 'South', revenue: '₹7.18Cr', commission: '₹1.02Cr', payouts: '₹3.04Cr', pending: '₹0.41Cr', share: 29 },
  { id: 'sc-3', level: 'State', name: 'Maharashtra', region: 'West', revenue: '₹5.02Cr', commission: '₹0.78Cr', payouts: '₹2.20Cr', pending: '₹0.52Cr', share: 20 },
  { id: 'sc-4', level: 'City', name: 'Hyderabad', region: 'Telangana', revenue: '₹4.62Cr', commission: '₹0.62Cr', payouts: '₹1.94Cr', pending: '₹0.30Cr', share: 19 },
  { id: 'sc-5', level: 'City', name: 'Bengaluru', region: 'Karnataka', revenue: '₹3.86Cr', commission: '₹0.55Cr', payouts: '₹1.61Cr', pending: '₹0.22Cr', share: 16 },
  { id: 'sc-6', level: 'City', name: 'Pune', region: 'Maharashtra', revenue: '₹2.11Cr', commission: '₹0.33Cr', payouts: '₹0.92Cr', pending: '₹0.24Cr', share: 8 },
  { id: 'sc-7', level: 'Zone', name: 'HITEC City', region: 'Hyderabad', revenue: '₹1.28Cr', commission: '₹0.18Cr', payouts: '₹0.54Cr', pending: '₹0.08Cr', share: 5 },
  { id: 'sc-8', level: 'Zone', name: 'Whitefield', region: 'Bengaluru', revenue: '₹1.04Cr', commission: '₹0.15Cr', payouts: '₹0.44Cr', pending: '₹0.06Cr', share: 4 },
]

export type FinanceAlert = {
  id: string
  title: string
  detail: string
  time: string
  severity: 'Critical' | 'Warning' | 'Info'
  target: SectionId
}

export const financeAlerts: FinanceAlert[] = [
  {
    id: 'al-1',
    title: 'Failed payouts',
    detail: '3 payouts failed at the gateway and need a retry or a bank detail correction.',
    time: '12 min ago',
    severity: 'Critical',
    target: 'payouts',
  },
  {
    id: 'al-2',
    title: 'Settlement mismatches',
    detail: '2 settlement lines do not match gateway payouts for the Mar 2026 period.',
    time: '48 min ago',
    severity: 'Warning',
    target: 'reconciliation',
  },
  {
    id: 'al-3',
    title: 'Payouts waiting for approval',
    detail: '4 payouts above the approval limit are waiting for a second approval.',
    time: '2 hrs ago',
    severity: 'Info',
    target: 'payouts',
  },
  {
    id: 'al-4',
    title: 'Unusual refund volume',
    detail: 'Refund requests are 2.4x the daily average in Hyderabad today.',
    time: '3 hrs ago',
    severity: 'Critical',
    target: 'refunds',
  },
]

export type FeedTone = 'green' | 'amber' | 'red' | 'blue'

export type FinanceNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target: SectionId
}

export const financeNotifications: FinanceNotification[] = [
  { id: 'nf-1', title: 'Settlement ST-2603 ready for review', detail: '1,842 bookings · net ₹15.98Cr awaiting finalization.', time: '10 min ago', tone: 'amber', read: false, target: 'settlements' },
  { id: 'nf-2', title: 'Payout PY-4471 above limit', detail: '₹4,12,000 requires a second approval (four-eyes).', time: '35 min ago', tone: 'blue', read: false, target: 'payouts' },
  { id: 'nf-3', title: 'Reconciliation mismatch RC-02', detail: 'Bank payout is ₹500 lower than expected.', time: '1 hr ago', tone: 'red', read: false, target: 'reconciliation' },
  { id: 'nf-4', title: 'Commission change scheduled', detail: 'Bengaluru city rate 12.5% takes effect on 01 May 2026.', time: '4 hrs ago', tone: 'green', read: true, target: 'commission' },
  { id: 'nf-5', title: 'Refund RF-9007 approved', detail: '₹12,500 linked to dispute DSP-4412, ready to process.', time: 'yesterday', tone: 'blue', read: true, target: 'refunds' },
]

export type ActivityItem = {
  id: string
  time: string
  actor: string
  action: string
  target: string
}

export const activityFeed: ActivityItem[] = [
  { id: 'ac-1', time: '09:42', actor: 'Rohit Menon', action: 'approved payout', target: 'PY-4468 · ₹1,86,000' },
  { id: 'ac-2', time: '09:15', actor: 'System', action: 'ran settlement', target: 'ST-2603 · Mar 2026' },
  { id: 'ac-3', time: '08:50', actor: 'Rohit Menon', action: 'scheduled commission', target: 'Bengaluru · 12.5%' },
  { id: 'ac-4', time: '08:12', actor: 'Anita Shah', action: 'flagged mismatch', target: 'RC-02 · PY-4465' },
  { id: 'ac-5', time: 'yesterday', actor: 'Rohit Menon', action: 'closed period', target: 'Feb 2026 · balanced' },
]

export type MonthlyPoint = {
  month: string
  revenue: number
  commission: number
  payouts: number
}

export const monthlySeries: MonthlyPoint[] = [
  { month: 'Apr', revenue: 186, commission: 28, payouts: 150 },
  { month: 'May', revenue: 204, commission: 31, payouts: 165 },
  { month: 'Jun', revenue: 221, commission: 34, payouts: 180 },
  { month: 'Jul', revenue: 198, commission: 30, payouts: 172 },
  { month: 'Aug', revenue: 233, commission: 35, payouts: 190 },
  { month: 'Sep', revenue: 248, commission: 37, payouts: 205 },
]

// ---------------------------------------------------------------------------
// Commission
// ---------------------------------------------------------------------------

export type CommissionScope = 'State' | 'City' | 'Vehicle Type'
export type CommissionStatus = 'Active' | 'Scheduled' | 'Draft'

export type CommissionRate = {
  id: string
  scope: CommissionScope
  name: string
  rate: number
  cap: number
  effectiveFrom: string
  status: CommissionStatus
  updatedBy: string
  updatedAt: string
}

export const commissionRates: CommissionRate[] = [
  { id: 'cm-001', scope: 'State', name: 'Telangana', rate: 12, cap: 15, effectiveFrom: '2026-04-01', status: 'Active', updatedBy: 'Rohit Menon', updatedAt: '2026-04-01' },
  { id: 'cm-002', scope: 'State', name: 'Karnataka', rate: 11.5, cap: 14, effectiveFrom: '2026-04-01', status: 'Active', updatedBy: 'Rohit Menon', updatedAt: '2026-04-01' },
  { id: 'cm-003', scope: 'State', name: 'Maharashtra', rate: 11, cap: 13.5, effectiveFrom: '2026-04-01', status: 'Active', updatedBy: 'Rohit Menon', updatedAt: '2026-04-01' },
  { id: 'cm-004', scope: 'City', name: 'Hyderabad', rate: 13, cap: 15, effectiveFrom: '2026-03-01', status: 'Active', updatedBy: 'Rohit Menon', updatedAt: '2026-02-18' },
  { id: 'cm-005', scope: 'City', name: 'Bengaluru', rate: 12.5, cap: 14.5, effectiveFrom: '2026-05-01', status: 'Scheduled', updatedBy: 'Rohit Menon', updatedAt: '2026-03-28' },
  { id: 'cm-006', scope: 'Vehicle Type', name: 'Excavator', rate: 14, cap: 16, effectiveFrom: '2026-02-01', status: 'Active', updatedBy: 'Rohit Menon', updatedAt: '2026-01-20' },
  { id: 'cm-007', scope: 'Vehicle Type', name: 'Crane', rate: 15, cap: 18, effectiveFrom: '2026-06-01', status: 'Draft', updatedBy: 'Rohit Menon', updatedAt: '2026-03-30' },
  { id: 'cm-008', scope: 'Vehicle Type', name: 'Generator', rate: 9.5, cap: 12, effectiveFrom: '2026-01-01', status: 'Active', updatedBy: 'Rohit Menon', updatedAt: '2025-12-22' },
]

export type CommissionChange = {
  id: string
  scope: CommissionScope
  name: string
  oldRate: number
  newRate: number
  effectiveDate: string
  changedBy: string
  changedAt: string
  note: string
}

export const commissionHistory: CommissionChange[] = [
  { id: 'ch-1', scope: 'City', name: 'Hyderabad', oldRate: 12, newRate: 13, effectiveDate: '2026-03-01', changedBy: 'Rohit Menon', changedAt: '2026-02-18', note: 'Festival demand uplift' },
  { id: 'ch-2', scope: 'State', name: 'Telangana', oldRate: 11.5, newRate: 12, effectiveDate: '2026-04-01', changedBy: 'Rohit Menon', changedAt: '2026-03-12', note: 'Annual rate revision' },
  { id: 'ch-3', scope: 'Vehicle Type', name: 'Excavator', oldRate: 13, newRate: 14, effectiveDate: '2026-02-01', changedBy: 'Rohit Menon', changedAt: '2026-01-20', note: 'High demand category' },
  { id: 'ch-4', scope: 'State', name: 'Karnataka', oldRate: 10.5, newRate: 11.5, effectiveDate: '2026-04-01', changedBy: 'Rohit Menon', changedAt: '2026-03-12', note: 'Align with market' },
  { id: 'ch-5', scope: 'Vehicle Type', name: 'Generator', oldRate: 9, newRate: 9.5, effectiveDate: '2026-01-01', changedBy: 'Rohit Menon', changedAt: '2025-12-22', note: 'Inflation adjustment' },
]

// ---------------------------------------------------------------------------
// Settlements
// ---------------------------------------------------------------------------

export type SettlementStatus = 'Draft' | 'Review' | 'Finalized' | 'Corrected'
export type SettlementCadence = 'Daily' | 'Weekly' | 'Monthly'

export type SettlementLine = {
  id: string
  booking: string
  customer: string
  owner: string
  gross: string
  commission: string
  adjustment: string
  net: string
  note: string
}

export type Settlement = {
  id: string
  period: string
  cadence: SettlementCadence
  status: SettlementStatus
  bookings: number
  gross: string
  commission: string
  adjustments: string
  net: string
  payout: string
  runAt: string
  runBy: string
  lines: SettlementLine[]
}

const settlementLines = (prefix: string): SettlementLine[] => [
  { id: `${prefix}-l1`, booking: 'BK-88213', customer: 'Arjun Mehta', owner: 'Sri Balaji Rentals', gross: '₹48,000', commission: '₹6,240', adjustment: '₹0', net: '₹41,760', note: '—' },
  { id: `${prefix}-l2`, booking: 'BK-88244', customer: 'Zainab Ali', owner: 'Green Field Partners', gross: '₹22,500', commission: '₹2,925', adjustment: '-₹2,000', net: '₹17,575', note: 'Cancellation fee waiver' },
  { id: `${prefix}-l3`, booking: 'BK-88310', customer: 'Karan Patel', owner: 'Sri Balaji Rentals', gross: '₹15,000', commission: '₹1,950', adjustment: '-₹1,500', net: '₹11,550', note: 'Damage deduction' },
  { id: `${prefix}-l4`, booking: 'BK-88355', customer: 'Priya Nair', owner: 'Sunrise Equipment', gross: '₹31,200', commission: '₹4,056', adjustment: '₹0', net: '₹27,144', note: '—' },
]

export const settlementRuns: Settlement[] = [
  {
    id: 'ST-2603',
    period: 'Mar 2026',
    cadence: 'Monthly',
    status: 'Review',
    bookings: 1842,
    gross: '₹18.42Cr',
    commission: '₹2.36Cr',
    adjustments: '-₹0.84Cr',
    net: '₹15.22Cr',
    payout: '₹15.98Cr',
    runAt: '2026-04-01 06:00',
    runBy: 'Auto · scheduler',
    lines: settlementLines('st2603'),
  },
  {
    id: 'ST-2602W4',
    period: 'Mar 2026 · Week 4',
    cadence: 'Weekly',
    status: 'Finalized',
    bookings: 462,
    gross: '₹4.62Cr',
    commission: '₹0.59Cr',
    adjustments: '-₹0.18Cr',
    net: '₹3.85Cr',
    payout: '₹4.03Cr',
    runAt: '2026-03-30 06:00',
    runBy: 'Auto · scheduler',
    lines: settlementLines('st2602'),
  },
  {
    id: 'ST-2601',
    period: 'Feb 2026',
    cadence: 'Monthly',
    status: 'Corrected',
    bookings: 1738,
    gross: '₹17.21Cr',
    commission: '₹2.18Cr',
    adjustments: '-₹0.51Cr',
    net: '₹14.52Cr',
    payout: '₹15.03Cr',
    runAt: '2026-03-01 06:00',
    runBy: 'Auto · scheduler',
    lines: settlementLines('st2601'),
  },
  {
    id: 'ST-2603D1',
    period: 'Apr 2026 · 01',
    cadence: 'Daily',
    status: 'Draft',
    bookings: 61,
    gross: '₹0.68Cr',
    commission: '₹0.09Cr',
    adjustments: '₹0',
    net: '₹0.59Cr',
    payout: '₹0.59Cr',
    runAt: '2026-04-01 23:30',
    runBy: 'Auto · scheduler',
    lines: settlementLines('st2603d1'),
  },
  {
    id: 'ST-2604D2',
    period: 'Apr 2026 · 02',
    cadence: 'Daily',
    status: 'Review',
    bookings: 58,
    gross: '₹0.61Cr',
    commission: '₹0.08Cr',
    adjustments: '-₹0.03Cr',
    net: '₹0.50Cr',
    payout: '₹0.53Cr',
    runAt: '2026-04-02 23:30',
    runBy: 'Auto · scheduler',
    lines: settlementLines('st2604d2'),
  },
]

// ---------------------------------------------------------------------------
// Payouts
// ---------------------------------------------------------------------------

export type PayoutStatus = 'Pending' | 'Awaiting second approval' | 'Approved' | 'Paid' | 'Failed' | 'Held' | 'Rejected'
export type PayoutType = 'Owner' | 'Operator'

export type Payout = {
  id: string
  payee: string
  payeeType: PayoutType
  amount: string
  numericAmount: number
  method: string
  settlement: string
  status: PayoutStatus
  aboveLimit: boolean
  requestedAt: string
  reason: string
}

export const payouts: Payout[] = [
  { id: 'PY-4471', payee: 'Sri Balaji Rentals', payeeType: 'Owner', amount: '₹4,12,000', numericAmount: 412000, method: 'NEFT', settlement: 'ST-2603', status: 'Pending', aboveLimit: true, requestedAt: '2026-04-01', reason: '' },
  { id: 'PY-4470', payee: 'Green Field Partners', payeeType: 'Owner', amount: '₹1,86,000', numericAmount: 186000, method: 'NEFT', settlement: 'ST-2603', status: 'Pending', aboveLimit: false, requestedAt: '2026-04-01', reason: '' },
  { id: 'PY-4469', payee: 'Imran Khan', payeeType: 'Operator', amount: '₹64,500', numericAmount: 64500, method: 'UPI', settlement: 'ST-2602W4', status: 'Approved', aboveLimit: false, requestedAt: '2026-03-30', reason: '' },
  { id: 'PY-4468', payee: 'Sunrise Equipment', payeeType: 'Owner', amount: '₹2,74,000', numericAmount: 274000, method: 'NEFT', settlement: 'ST-2603', status: 'Awaiting second approval', aboveLimit: true, requestedAt: '2026-03-31', reason: 'Above single-approver limit' },
  { id: 'PY-4467', payee: 'Lakshmi Traders', payeeType: 'Owner', amount: '₹1,12,000', numericAmount: 112000, method: 'NEFT', settlement: 'ST-2602W4', status: 'Paid', aboveLimit: false, requestedAt: '2026-03-29', reason: '' },
  { id: 'PY-4466', payee: 'Vikram Singh', payeeType: 'Operator', amount: '₹38,200', numericAmount: 38200, method: 'UPI', settlement: 'ST-2602W4', status: 'Failed', aboveLimit: false, requestedAt: '2026-03-29', reason: 'Gateway timeout at beneficiary bank' },
  { id: 'PY-4465', payee: 'Metro Machines', payeeType: 'Owner', amount: '₹2,12,000', numericAmount: 212000, method: 'IMPS', settlement: 'ST-2601', status: 'Held', aboveLimit: true, requestedAt: '2026-03-28', reason: 'Bank KYC name mismatch' },
  { id: 'PY-4464', payee: 'Anand Rao', payeeType: 'Operator', amount: '₹21,800', numericAmount: 21800, method: 'UPI', settlement: 'ST-2601', status: 'Rejected', aboveLimit: false, requestedAt: '2026-03-27', reason: 'Duplicate request for same settlement' },
]

// ---------------------------------------------------------------------------
// Invoices & statements
// ---------------------------------------------------------------------------

export type InvoiceKind = 'Customer invoice' | 'Receipt' | 'Commission statement' | 'Payout statement'
export type InvoiceStatus = 'Paid' | 'Sent' | 'Overdue' | 'Draft'

export type Invoice = {
  id: string
  kind: InvoiceKind
  party: string
  related: string
  amount: string
  issued: string
  due: string
  status: InvoiceStatus
}

export const invoices: Invoice[] = [
  { id: 'INV-58210', kind: 'Customer invoice', party: 'Arjun Mehta', related: 'BK-88213', amount: '₹48,000', issued: '2026-03-28', due: '2026-04-11', status: 'Sent' },
  { id: 'INV-58204', kind: 'Customer invoice', party: 'Priya Nair', related: 'BK-88355', amount: '₹31,200', issued: '2026-03-27', due: '2026-04-10', status: 'Paid' },
  { id: 'RCP-11980', kind: 'Receipt', party: 'Karan Patel', related: 'BK-88310', amount: '₹15,000', issued: '2026-03-26', due: '—', status: 'Paid' },
  { id: 'CS-3301', kind: 'Commission statement', party: 'Sri Balaji Rentals', related: 'ST-2603', amount: '₹2,36,000', issued: '2026-04-01', due: '—', status: 'Sent' },
  { id: 'PS-2210', kind: 'Payout statement', party: 'Green Field Partners', related: 'ST-2603', amount: '₹1,86,000', issued: '2026-04-01', due: '—', status: 'Draft' },
  { id: 'INV-58188', kind: 'Customer invoice', party: 'Zainab Ali', related: 'BK-88244', amount: '₹22,500', issued: '2026-03-20', due: '2026-04-03', status: 'Overdue' },
]

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------

export type RefundStatus = 'Pending' | 'Approved' | 'Processed' | 'Rejected'

export type Refund = {
  id: string
  booking: string
  customer: string
  dispute: string
  amount: string
  numericAmount: number
  supportCap: number
  decision: string
  status: RefundStatus
  requestedAt: string
  flagged: boolean
}

export const refunds: Refund[] = [
  { id: 'RF-9007', booking: 'BK-90112', customer: 'Neha Rao', dispute: 'DSP-4412', amount: '₹12,500', numericAmount: 12500, supportCap: 5000, decision: 'Split liability · owner 40%', status: 'Pending', requestedAt: '2026-03-29', flagged: true },
  { id: 'RF-9006', booking: 'BK-90088', customer: 'Rahul Verma', dispute: 'DSP-4405', amount: '₹4,200', numericAmount: 4200, supportCap: 5000, decision: 'Customer fault · goodwill', status: 'Approved', requestedAt: '2026-03-28', flagged: false },
  { id: 'RF-9005', booking: 'BK-90051', customer: 'Sara Khan', dispute: 'DSP-4399', amount: '₹18,000', numericAmount: 18000, supportCap: 5000, decision: 'Platform fault · full refund', status: 'Pending', requestedAt: '2026-03-28', flagged: true },
  { id: 'RF-9004', booking: 'BK-90012', customer: 'Mohit Jain', dispute: 'DSP-4390', amount: '₹2,900', numericAmount: 2900, supportCap: 5000, decision: 'Owner fault', status: 'Processed', requestedAt: '2026-03-25', flagged: false },
  { id: 'RF-9003', booking: 'BK-89980', customer: 'Divya Suresh', dispute: 'DSP-4381', amount: '₹7,600', numericAmount: 7600, supportCap: 5000, decision: 'Rejected · within policy', status: 'Rejected', requestedAt: '2026-03-24', flagged: false },
  { id: 'RF-9002', booking: 'BK-89945', customer: 'Amit Singh', dispute: 'DSP-4377', amount: '₹9,800', numericAmount: 9800, supportCap: 5000, decision: 'Damage dispute · partial', status: 'Processed', requestedAt: '2026-03-22', flagged: false },
]

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------

export type ReconStatus = 'Matched' | 'Mismatch' | 'Investigating' | 'Written off'
export type ReconType = 'Booking' | 'Payment' | 'Payout'

export type ReconItem = {
  id: string
  reference: string
  type: ReconType
  gateway: string
  bank: string
  expected: string
  actual: string
  variance: string
  status: ReconStatus
  note: string
}

export const reconItems: ReconItem[] = [
  { id: 'RC-01', reference: 'BK-88213', type: 'Booking', gateway: '₹48,000', bank: '₹48,000', expected: '₹48,000', actual: '₹48,000', variance: '₹0', status: 'Matched', note: '' },
  { id: 'RC-02', reference: 'PY-4465', type: 'Payout', gateway: '—', bank: '₹2,11,500', expected: '₹2,12,000', actual: '₹2,11,500', variance: '-₹500', status: 'Mismatch', note: 'Bank charge applied at beneficiary end' },
  { id: 'RC-03', reference: 'BK-88244', type: 'Payment', gateway: '₹22,500', bank: '₹22,500', expected: '₹22,500', actual: '₹22,500', variance: '₹0', status: 'Matched', note: '' },
  { id: 'RC-04', reference: 'PY-4466', type: 'Payout', gateway: '₹38,200', bank: '—', expected: '₹38,200', actual: '₹0', variance: '-₹38,200', status: 'Mismatch', note: 'Gateway timeout, not debited' },
  { id: 'RC-05', reference: 'BK-88310', type: 'Booking', gateway: '₹15,000', bank: '₹14,850', expected: '₹15,000', actual: '₹14,850', variance: '-₹150', status: 'Investigating', note: 'PSP fee variance under review' },
  { id: 'RC-06', reference: 'BK-88355', type: 'Payment', gateway: '₹31,200', bank: '₹31,200', expected: '₹31,200', actual: '₹31,200', variance: '₹0', status: 'Matched', note: '' },
  { id: 'RC-07', reference: 'BK-88110', type: 'Booking', gateway: '₹8,400', bank: '₹8,400', expected: '₹8,400', actual: '₹8,400', variance: '₹0', status: 'Written off', note: 'Legacy rounding, closed' },
]

export type ReconPeriodStatus = 'Open' | 'Balanced' | 'Closed'

export type ReconPeriod = {
  id: string
  period: string
  status: ReconPeriodStatus
  matched: number
  mismatches: number
  variance: string
  closedAt: string
}

export const reconPeriods: ReconPeriod[] = [
  { id: 'RP-2603', period: 'Mar 2026', status: 'Open', matched: 1836, mismatches: 6, variance: '-₹38,850', closedAt: '—' },
  { id: 'RP-2602', period: 'Feb 2026', status: 'Closed', matched: 1729, mismatches: 9, variance: '₹0', closedAt: '2026-03-05' },
  { id: 'RP-2601', period: 'Jan 2026', status: 'Closed', matched: 1614, mismatches: 4, variance: '₹0', closedAt: '2026-02-04' },
]

export const paymentGateways = ['Razorpay', 'PayU'] as const

// ---------------------------------------------------------------------------
// Reports & audit
// ---------------------------------------------------------------------------

export type ReportCard = {
  id: string
  title: string
  description: string
  formats: string[]
}

export const reportCards: ReportCard[] = [
  { id: 'rp-rev', title: 'Revenue report', description: 'Gross revenue by state, city, zone and vehicle type.', formats: ['CSV', 'PDF'] },
  { id: 'rp-com', title: 'Commission report', description: 'Commission earned and rate changes across scopes.', formats: ['CSV', 'PDF'] },
  { id: 'rp-pay', title: 'Payout report', description: 'Owner and operator payouts with approval trail.', formats: ['CSV', 'PDF'] },
  { id: 'rp-rec', title: 'Reconciliation report', description: 'Gateway and bank matching with variance notes.', formats: ['CSV'] },
  { id: 'rp-ref', title: 'Refund report', description: 'Refunds, approvals and dispute linkage.', formats: ['CSV', 'PDF'] },
  { id: 'rp-aud', title: 'Audit trail export', description: 'Every finance action with actor, time and scope.', formats: ['CSV'] },
]

export type AuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  area: SectionId
  detail: string
}

export const auditLog: AuditEntry[] = [
  { id: 'au-1', time: '2026-04-01 09:42', actor: 'Rohit Menon', action: 'Payout approved', area: 'payouts', detail: 'PY-4468 · ₹1,86,000 · within limit' },
  { id: 'au-2', time: '2026-04-01 09:15', actor: 'System', action: 'Settlement run', area: 'settlements', detail: 'ST-2603 · Mar 2026 · 1,842 bookings' },
  { id: 'au-3', time: '2026-04-01 08:50', actor: 'Rohit Menon', action: 'Commission scheduled', area: 'commission', detail: 'Bengaluru · 12% → 12.5%' },
  { id: 'au-4', time: '2026-04-01 08:12', actor: 'Anita Shah', action: 'Mismatch flagged', area: 'reconciliation', detail: 'RC-02 · PY-4465 · -₹500' },
  { id: 'au-5', time: '2026-03-31 17:20', actor: 'Rohit Menon', action: 'Refund approved', area: 'refunds', detail: 'RF-9007 · ₹12,500 · dispute DSP-4412' },
  { id: 'au-6', time: '2026-03-30 06:00', actor: 'System', action: 'Settlement finalised', area: 'settlements', detail: 'ST-2602W4 · Mar 2026 Week 4' },
  { id: 'au-7', time: '2026-03-29 11:05', actor: 'Rohit Menon', action: 'Payout held', area: 'payouts', detail: 'PY-4465 · ₹2,12,000 · KYC mismatch' },
  { id: 'au-8', time: '2026-03-05 10:00', actor: 'Rohit Menon', action: 'Period closed', area: 'reconciliation', detail: 'Feb 2026 · balanced · ₹0 variance' },
]
