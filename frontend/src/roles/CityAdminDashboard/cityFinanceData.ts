// City-scoped finance & payments seed data for the Hyderabad City Admin dashboard.
import { cityProfile } from './cityAdminData'

export type FinanceTab = 'collections' | 'transactions' | 'outstanding' | 'refunds' | 'reports' | 'permissions'

export const financeTabs: Array<{ id: FinanceTab; label: string; hint: string }> = [
  { id: 'collections', label: 'Collections', hint: 'Rent collected by zone against target' },
  { id: 'transactions', label: 'Transactions', hint: 'Successful, pending, failed and refunded payments' },
  { id: 'outstanding', label: 'Outstanding & overdue', hint: 'Unsettled invoices and overdue rent' },
  { id: 'refunds', label: 'Refunds & adjustments', hint: 'Authorized refunds and payment adjustments' },
  { id: 'reports', label: 'Reports', hint: 'Generate city-level financial reports' },
  { id: 'permissions', label: 'Permissions & audit', hint: 'Permission-controlled actions and finance audit trail' },
]

export const financePeriods = ['This Month', 'Last Month', 'This Quarter', 'This Year'] as const

export type PaymentStatus = 'Successful' | 'Pending' | 'Failed' | 'Refunded'

export type CityPayment = {
  id: string
  reference: string
  bookingId: string
  customer: string
  zone: string
  amount: number
  method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet' | 'NEFT'
  status: PaymentStatus
  date: string
  invoiceId: string
  receiptId: string
}

export const cityPayments: CityPayment[] = [
  { id: 'PMT-88412', reference: 'pay_R8x21Kd9', bookingId: 'BK-5182', customer: 'L&T Metro Rail', zone: 'Madhapur', amount: 224000, method: 'NEFT', status: 'Successful', date: '12 Sep 2025', invoiceId: 'INV-5182', receiptId: 'RCT-88412' },
  { id: 'PMT-88409', reference: 'pay_Kd03Lm11', bookingId: 'BK-5179', customer: 'MEIL', zone: 'Gachibowli', amount: 286000, method: 'Net Banking', status: 'Successful', date: '12 Sep 2025', invoiceId: 'INV-5179', receiptId: 'RCT-88409' },
  { id: 'PMT-88406', reference: 'pay_9Ff2Pq77', bookingId: 'BK-5176', customer: 'My Home Builders', zone: 'Kukatpally', amount: 112000, method: 'UPI', status: 'Pending', date: '11 Sep 2025', invoiceId: 'INV-5176', receiptId: 'RCT-88406' },
  { id: 'PMT-88403', reference: 'pay_Lm55Rt20', bookingId: 'BK-5173', customer: 'Ramky Infrastructure', zone: 'Uppal', amount: 156000, method: 'Card', status: 'Successful', date: '11 Sep 2025', invoiceId: 'INV-5173', receiptId: 'RCT-88403' },
  { id: 'PMT-88400', reference: 'pay_Zx71Yb34', bookingId: 'BK-5171', customer: 'Sobha Realty', zone: 'Gachibowli', amount: 324000, method: 'NEFT', status: 'Successful', date: '10 Sep 2025', invoiceId: 'INV-5171', receiptId: 'RCT-88400' },
  { id: 'PMT-88395', reference: 'pay_Qw18Vc02', bookingId: 'BK-5166', customer: 'TSIIC', zone: 'Begumpet', amount: 118000, method: 'Net Banking', status: 'Failed', date: '10 Sep 2025', invoiceId: 'INV-5166', receiptId: 'RCT-88395' },
  { id: 'PMT-88390', reference: 'pay_Hj44Nk88', bookingId: 'BK-5160', customer: 'Emaar India', zone: 'Gachibowli', amount: 248000, method: 'NEFT', status: 'Successful', date: '09 Sep 2025', invoiceId: 'INV-5160', receiptId: 'RCT-88390' },
  { id: 'PMT-88387', reference: 'pay_Bn92Mg15', bookingId: 'BK-5156', customer: 'Auroville Structures', zone: 'LB Nagar', amount: 76000, method: 'UPI', status: 'Successful', date: '09 Sep 2025', invoiceId: 'INV-5156', receiptId: 'RCT-88387' },
  { id: 'PMT-88382', reference: 'pay_Tr60Dq41', bookingId: 'BK-5149', customer: 'Sanghi Industries', zone: 'Uppal', amount: 98000, method: 'Wallet', status: 'Refunded', date: '08 Sep 2025', invoiceId: 'INV-5149', receiptId: 'RCT-88382' },
  { id: 'PMT-88379', reference: 'pay_Vc37Wp09', bookingId: 'BK-5131', customer: 'Twin Cities Builders', zone: 'LB Nagar', amount: 74000, method: 'Card', status: 'Refunded', date: '08 Sep 2025', invoiceId: 'INV-5131', receiptId: 'RCT-88379' },
  { id: 'PMT-88374', reference: 'pay_Ld81Xs63', bookingId: 'BK-5152', customer: 'Kences Builders', zone: 'Kukatpally', amount: 104000, method: 'NEFT', status: 'Pending', date: '07 Sep 2025', invoiceId: 'INV-5152', receiptId: 'RCT-88374' },
  { id: 'PMT-88370', reference: 'pay_Mq29Yt50', bookingId: 'BK-5144', customer: 'Smartworks Infra', zone: 'Begumpet', amount: 82000, method: 'Net Banking', status: 'Failed', date: '07 Sep 2025', invoiceId: 'INV-5144', receiptId: 'RCT-88370' },
  { id: 'PMT-88365', reference: 'pay_Wk14Bn77', bookingId: 'BK-5140', customer: 'Deccan Roadlines', zone: 'Madhapur', amount: 88000, method: 'UPI', status: 'Successful', date: '06 Sep 2025', invoiceId: 'INV-5140', receiptId: 'RCT-88365' },
  { id: 'PMT-88361', reference: 'pay_Pz53Gh28', bookingId: 'BK-5164', customer: 'Vascon Engineers', zone: 'Madhapur', amount: 92000, method: 'NEFT', status: 'Pending', date: '06 Sep 2025', invoiceId: 'INV-5164', receiptId: 'RCT-88361' },
]

export type CollectionRow = {
  id: string
  zone: string
  collected: number
  target: number
  outstanding: number
}

export const cityCollectionRows: CollectionRow[] = [
  { id: 'col-hyd-1', zone: 'Madhapur', collected: 1842000, target: 1900000, outstanding: 58000 },
  { id: 'col-hyd-2', zone: 'Gachibowli', collected: 1716000, target: 1800000, outstanding: 84000 },
  { id: 'col-hyd-3', zone: 'Kukatpally', collected: 1184000, target: 1300000, outstanding: 116000 },
  { id: 'col-hyd-4', zone: 'Uppal', collected: 942000, target: 1000000, outstanding: 58000 },
  { id: 'col-hyd-5', zone: 'Begumpet', collected: 736000, target: 820000, outstanding: 84000 },
  { id: 'col-hyd-6', zone: 'LB Nagar', collected: 402000, target: 500000, outstanding: 98000 },
]

export type OutstandingRow = {
  id: string
  invoiceId: string
  customer: string
  zone: string
  amount: number
  dueDate: string
  daysOverdue: number
  status: 'Current' | 'Overdue' | 'Critical'
}

export const cityOutstandingRows: OutstandingRow[] = [
  { id: 'OS-518', invoiceId: 'INV-5166', customer: 'TSIIC', zone: 'Begumpet', amount: 118000, dueDate: '18 Sep 2025', daysOverdue: 0, status: 'Current' },
  { id: 'OS-517', invoiceId: 'INV-5152', customer: 'Kences Builders', zone: 'Kukatpally', amount: 104000, dueDate: '16 Sep 2025', daysOverdue: 0, status: 'Current' },
  { id: 'OS-515', invoiceId: 'INV-5164', customer: 'Vascon Engineers', zone: 'Madhapur', amount: 92000, dueDate: '05 Sep 2025', daysOverdue: 11, status: 'Overdue' },
  { id: 'OS-512', invoiceId: 'INV-5152', customer: 'Kences Builders', zone: 'Kukatpally', amount: 48000, dueDate: '28 Aug 2025', daysOverdue: 19, status: 'Overdue' },
  { id: 'OS-509', invoiceId: 'INV-5144', customer: 'Smartworks Infra', zone: 'Begumpet', amount: 82000, dueDate: '21 Aug 2025', daysOverdue: 26, status: 'Critical' },
  { id: 'OS-506', invoiceId: 'INV-5168', customer: 'TSIIC', zone: 'Begumpet', amount: 118000, dueDate: '18 Aug 2025', daysOverdue: 29, status: 'Critical' },
  { id: 'OS-501', invoiceId: 'INV-5149', customer: 'Sanghi Industries', zone: 'Uppal', amount: 76000, dueDate: '08 Aug 2025', daysOverdue: 39, status: 'Critical' },
]

export type RefundStatus = 'Pending' | 'Approved' | 'Processed' | 'Rejected'

export type RefundAdjustment = {
  id: string
  bookingId: string
  customer: string
  zone: string
  amount: number
  reason: string
  status: RefundStatus
  requested: string
  authorizedBy?: string
  authorizedOn?: string
}

export const cityRefundAdjustments: RefundAdjustment[] = [
  { id: 'RF-034', bookingId: 'BK-5149', customer: 'Twin Cities Builders', zone: 'LB Nagar', amount: 18400, reason: 'Cancellation inside the cooling-off window', status: 'Pending', requested: '1 day ago' },
  { id: 'RF-035', bookingId: 'BK-5144', customer: 'Smartworks Infra', zone: 'Begumpet', amount: 9600, reason: 'Damage waiver claim cleared after inspection', status: 'Pending', requested: '2 days ago' },
  { id: 'RF-033', bookingId: 'BK-5131', customer: 'Kences Builders', zone: 'Kukatpally', amount: 7200, reason: 'Duplicate charge on September invoice', status: 'Approved', requested: '4 days ago', authorizedBy: cityProfile.adminName, authorizedOn: '3 days ago' },
  { id: 'RF-032', bookingId: 'BK-5148', customer: 'Sanghi Industries', zone: 'Uppal', amount: 12600, reason: 'Downtime adjustment for a late machine handover', status: 'Processed', requested: '6 days ago', authorizedBy: cityProfile.adminName, authorizedOn: '5 days ago' },
  { id: 'RF-031', bookingId: 'BK-5152', customer: 'Deccan Roadlines', zone: 'Madhapur', amount: 4800, reason: 'Booking cancelled before dispatch', status: 'Rejected', requested: '8 days ago', authorizedBy: cityProfile.adminName, authorizedOn: '7 days ago' },
]

export type FinanceReport = {
  id: string
  title: string
  detail: string
  period: string
  tone: 'green' | 'blue' | 'purple' | 'orange'
  permission: string
}

export const cityFinanceReports: FinanceReport[] = [
  { id: 'rep-1', title: 'City revenue summary', detail: 'Gross rental revenue, commission and net remittance for Hyderabad.', period: 'This month', tone: 'green', permission: 'reports.view' },
  { id: 'rep-2', title: 'Payment status report', detail: 'Successful, pending, failed and refunded payment counts and values.', period: 'Last 30 days', tone: 'blue', permission: 'finance.export' },
  { id: 'rep-3', title: 'Collections by zone', detail: 'Target vs collected with achievement percentage per zone.', period: 'This month', tone: 'purple', permission: 'finance.collect' },
  { id: 'rep-4', title: 'Outstanding & overdue rent', detail: 'Ageing buckets for unpaid invoices and overdue rent across zones.', period: 'As on date', tone: 'orange', permission: 'finance.reconcile' },
  { id: 'rep-5', title: 'Refunds & adjustments ledger', detail: 'Authorized refunds with approver and settlement reference.', period: 'This quarter', tone: 'green', permission: 'bookings.refund' },
  { id: 'rep-6', title: 'GST summary statement', detail: 'Taxable value, CGST/SGST split and input credit summary.', period: 'This quarter', tone: 'blue', permission: 'finance.tax' },
]

export type FinancePermission = {
  key: string
  label: string
  description: string
  granted: boolean
  locked?: boolean
}

export const cityFinancePermissions: FinancePermission[] = [
  { key: 'finance.view', label: 'View city financial data', description: 'See collections, transactions and outstanding rent for Hyderabad.', granted: true },
  { key: 'finance.collect', label: 'Record collections', description: 'Log rent collections against zones and invoices.', granted: true },
  { key: 'finance.reconcile', label: 'Reconcile payments', description: 'Match gateway settlements to bookings and invoices.', granted: true },
  { key: 'bookings.refund', label: 'Approve refunds & adjustments', description: 'Authorize refunds and payment adjustments within the city limit.', granted: true },
  { key: 'reports.view', label: 'View city reports', description: 'Open and export city-level financial reports.', granted: true },
  { key: 'finance.export', label: 'Export financial data', description: 'Download finance tables and summaries as CSV.', granted: true },
  { key: 'finance.tax', label: 'Tax / GST statements', description: 'Generate tax statements — held by State Admin.', granted: false, locked: true },
  { key: 'finance.settings', label: 'Change finance settings', description: 'Edit payout, tax and invoice configuration — State Admin only.', granted: false, locked: true },
]

export const hasFinancePermission = (key: string): boolean =>
  cityFinancePermissions.some((permission) => permission.key === key && permission.granted)

export type FinanceAuditOutcome = 'Success' | 'Warning' | 'Failed'

export type FinanceAuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  target: string
  amount?: number
  outcome: FinanceAuditOutcome
}

export const cityFinanceAudit: FinanceAuditEntry[] = [
  { id: 'fa-1', time: '20 min ago', actor: cityProfile.adminName, action: 'Approved refund', target: 'RF-033 · Kences Builders', amount: 7200, outcome: 'Success' },
  { id: 'fa-2', time: '1 hour ago', actor: 'Finance Desk', action: 'Reconciled settlement', target: 'SET-2025-09-04 · Hyderabad', amount: 384000, outcome: 'Success' },
  { id: 'fa-3', time: '3 hours ago', actor: cityProfile.adminName, action: 'Adjusted invoice', target: 'CN-5152 · Smartworks Infra', amount: 7200, outcome: 'Success' },
  { id: 'fa-4', time: '5 hours ago', actor: 'Payment Gateway', action: 'Payment failed', target: 'PMT-88395 · TSIIC', amount: 118000, outcome: 'Failed' },
  { id: 'fa-5', time: '8 hours ago', actor: 'Finance Desk', action: 'Flagged overdue account', target: 'Smartworks Infra · ₹82,000', amount: 82000, outcome: 'Warning' },
  { id: 'fa-6', time: '1 day ago', actor: cityProfile.adminName, action: 'Exported collections report', target: 'Collections by zone · CSV', outcome: 'Success' },
  { id: 'fa-7', time: '2 days ago', actor: cityProfile.adminName, action: 'Rejected refund', target: 'RF-031 · Deccan Roadlines', amount: 4800, outcome: 'Warning' },
  { id: 'fa-8', time: '2 days ago', actor: 'System', action: 'Blocked tax statement export', target: 'GST summary statement · requires finance.tax', outcome: 'Warning' },
]
