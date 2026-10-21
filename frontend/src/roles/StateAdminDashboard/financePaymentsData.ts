// State-scoped finance & payments seed data for the Telangana State Admin dashboard.
import { stateProfile } from './stateAdminData'

export type FinanceTab = 'payments' | 'collections' | 'outstanding' | 'refunds' | 'invoices' | 'reports' | 'audit'

export const financeTabs: Array<{ id: FinanceTab; label: string; hint: string }> = [
  { id: 'payments', label: 'Payments & transactions', hint: 'Rental payments and full transaction history' },
  { id: 'collections', label: 'Collections', hint: 'Rent collected by city and zone' },
  { id: 'outstanding', label: 'Outstanding & overdue', hint: 'Unsettled invoices and overdue rent' },
  { id: 'refunds', label: 'Refunds & adjustments', hint: 'Authorized refunds and payment adjustments' },
  { id: 'invoices', label: 'Invoices & receipts', hint: 'Invoices, receipts and payment references' },
  { id: 'reports', label: 'Summaries & exports', hint: 'Generate financial summaries and permitted exports' },
  { id: 'audit', label: 'Finance audit', hint: 'Finance-related audit trail' },
]

export type PaymentStatus = 'Successful' | 'Pending' | 'Failed' | 'Refunded'

export type RentalPayment = {
  id: string
  reference: string
  bookingId: string
  customer: string
  city: string
  zone: string
  amount: number
  method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet' | 'NEFT'
  status: PaymentStatus
  date: string
  invoiceId: string
  receiptId: string
}

export const rentalPayments: RentalPayment[] = [
  { id: 'PMT-88412', reference: 'pay_R8x21Kd9', bookingId: 'BK-5182', customer: 'L&T Metro Rail', city: 'Hyderabad', zone: 'Madhapur', amount: 224000, method: 'NEFT', status: 'Successful', date: '12 Sep 2025', invoiceId: 'INV-5182', receiptId: 'RCT-88412' },
  { id: 'PMT-88409', reference: 'pay_Kd03Lm11', bookingId: 'BK-5179', customer: 'MEIL', city: 'Hyderabad', zone: 'Gachibowli', amount: 286000, method: 'Net Banking', status: 'Successful', date: '12 Sep 2025', invoiceId: 'INV-5179', receiptId: 'RCT-88409' },
  { id: 'PMT-88406', reference: 'pay_9Ff2Pq77', bookingId: 'BK-5176', customer: 'My Home Builders', city: 'Hyderabad', zone: 'Kukatpally', amount: 112000, method: 'UPI', status: 'Pending', date: '11 Sep 2025', invoiceId: 'INV-5176', receiptId: 'RCT-88406' },
  { id: 'PMT-88403', reference: 'pay_Lm55Rt20', bookingId: 'BK-5173', customer: 'Ramky Infrastructure', city: 'Hyderabad', zone: 'Uppal', amount: 156000, method: 'Card', status: 'Successful', date: '11 Sep 2025', invoiceId: 'INV-5173', receiptId: 'RCT-88403' },
  { id: 'PMT-88398', reference: 'pay_Zx71Yb34', bookingId: 'BK-5170', customer: 'Vascon Engineers', city: 'Warangal', zone: 'Hanamkonda', amount: 178000, method: 'NEFT', status: 'Successful', date: '10 Sep 2025', invoiceId: 'INV-5170', receiptId: 'RCT-88398' },
  { id: 'PMT-88395', reference: 'pay_Qw18Vc02', bookingId: 'BK-5166', customer: 'Nagarjuna Constructions', city: 'Karimnagar', zone: 'Chowrasta', amount: 194000, method: 'Net Banking', status: 'Failed', date: '10 Sep 2025', invoiceId: 'INV-5166', receiptId: 'RCT-88395' },
  { id: 'PMT-88390', reference: 'pay_Hj44Nk88', bookingId: 'BK-5158', customer: 'Greenko Energies', city: 'Khammam', zone: 'Wyra Road', amount: 348000, method: 'NEFT', status: 'Successful', date: '09 Sep 2025', invoiceId: 'INV-5158', receiptId: 'RCT-88390' },
  { id: 'PMT-88387', reference: 'pay_Bn92Mg15', bookingId: 'BK-5145', customer: 'Nizamabad Builders', city: 'Nizamabad', zone: 'Bodhan Road', amount: 124000, method: 'UPI', status: 'Successful', date: '09 Sep 2025', invoiceId: 'INV-5145', receiptId: 'RCT-88387' },
  { id: 'PMT-88382', reference: 'pay_Tr60Dq41', bookingId: 'BK-5149', customer: 'Suryapet Infra LLP', city: 'Suryapet', zone: 'Alair Road', amount: 72000, method: 'Wallet', status: 'Refunded', date: '08 Sep 2025', invoiceId: 'INV-5149', receiptId: 'RCT-88382' },
  { id: 'PMT-88379', reference: 'pay_Vc37Wp09', bookingId: 'BK-5131', customer: 'Twin Cities Builders', city: 'Hyderabad', zone: 'LB Nagar', amount: 74000, method: 'Card', status: 'Refunded', date: '08 Sep 2025', invoiceId: 'INV-5131', receiptId: 'RCT-88379' },
  { id: 'PMT-88374', reference: 'pay_Ld81Xs63', bookingId: 'BK-5161', customer: 'Singareni Collieries', city: 'Ramagundam', zone: 'Godavarikhani', amount: 96000, method: 'NEFT', status: 'Successful', date: '07 Sep 2025', invoiceId: 'INV-5161', receiptId: 'RCT-88374' },
  { id: 'PMT-88370', reference: 'pay_Mq29Yt50', bookingId: 'BK-5136', customer: 'Nalgonda Cement Co', city: 'Nalgonda', zone: 'Miryalaguda Road', amount: 218000, method: 'Net Banking', status: 'Pending', date: '07 Sep 2025', invoiceId: 'INV-5136', receiptId: 'RCT-88370' },
  { id: 'PMT-88365', reference: 'pay_Wk14Bn77', bookingId: 'BK-5154', customer: 'Kakatiya Developers', city: 'Warangal', zone: 'Kazipet', amount: 64000, method: 'UPI', status: 'Failed', date: '06 Sep 2025', invoiceId: 'INV-5154', receiptId: 'RCT-88365' },
  { id: 'PMT-88361', reference: 'pay_Pz53Gh28', bookingId: 'BK-5140', customer: 'Deccan Roadlines', city: 'Hyderabad', zone: 'Begumpet', amount: 88000, method: 'Card', status: 'Successful', date: '06 Sep 2025', invoiceId: 'INV-5140', receiptId: 'RCT-88361' },
]

export type CollectionRow = {
  id: string
  city: string
  zone: string
  collected: number
  target: number
  outstanding: number
}

export const collectionRows: CollectionRow[] = [
  { id: 'col-hyd-1', city: 'Hyderabad', zone: 'Madhapur', collected: 1842000, target: 1900000, outstanding: 58000 },
  { id: 'col-hyd-2', city: 'Hyderabad', zone: 'Gachibowli', collected: 1716000, target: 1800000, outstanding: 84000 },
  { id: 'col-hyd-3', city: 'Hyderabad', zone: 'Kukatpally', collected: 1184000, target: 1300000, outstanding: 116000 },
  { id: 'col-hyd-4', city: 'Hyderabad', zone: 'Uppal', collected: 942000, target: 1000000, outstanding: 58000 },
  { id: 'col-hyd-5', city: 'Hyderabad', zone: 'Begumpet', collected: 736000, target: 820000, outstanding: 84000 },
  { id: 'col-hyd-6', city: 'Hyderabad', zone: 'LB Nagar', collected: 402000, target: 500000, outstanding: 98000 },
  { id: 'col-wgl-1', city: 'Warangal', zone: 'Hanamkonda', collected: 648000, target: 700000, outstanding: 52000 },
  { id: 'col-wgl-2', city: 'Warangal', zone: 'Kazipet', collected: 384000, target: 440000, outstanding: 56000 },
  { id: 'col-krm-1', city: 'Karimnagar', zone: 'Chowrasta', collected: 562000, target: 620000, outstanding: 58000 },
  { id: 'col-nzb-1', city: 'Nizamabad', zone: 'Bodhan Road', collected: 418000, target: 460000, outstanding: 42000 },
  { id: 'col-khm-1', city: 'Khammam', zone: 'Wyra Road', collected: 372000, target: 420000, outstanding: 48000 },
  { id: 'col-rmd-1', city: 'Ramagundam', zone: 'Godavarikhani', collected: 336000, target: 380000, outstanding: 44000 },
  { id: 'col-srt-1', city: 'Suryapet', zone: 'Alair Road', collected: 244000, target: 280000, outstanding: 36000 },
  { id: 'col-nlg-1', city: 'Nalgonda', zone: 'Miryalaguda Road', collected: 208000, target: 260000, outstanding: 52000 },
]

export type OutstandingRow = {
  id: string
  invoiceId: string
  customer: string
  city: string
  zone: string
  amount: number
  dueDate: string
  daysOverdue: number
  status: 'Current' | 'Overdue' | 'Critical'
}

export const outstandingRows: OutstandingRow[] = [
  { id: 'OS-518', invoiceId: 'INV-5166', customer: 'Nagarjuna Constructions', city: 'Karimnagar', zone: 'Chowrasta', amount: 194000, dueDate: '18 Sep 2025', daysOverdue: 0, status: 'Current' },
  { id: 'OS-517', invoiceId: 'INV-5136', customer: 'Nalgonda Cement Co', city: 'Nalgonda', zone: 'Miryalaguda Road', amount: 218000, dueDate: '16 Sep 2025', daysOverdue: 0, status: 'Current' },
  { id: 'OS-515', invoiceId: 'INV-5164', customer: 'Vascon Engineers', city: 'Hyderabad', zone: 'Madhapur', amount: 92000, dueDate: '05 Sep 2025', daysOverdue: 11, status: 'Overdue' },
  { id: 'OS-512', invoiceId: 'INV-5152', customer: 'Kences Builders', city: 'Hyderabad', zone: 'Kukatpally', amount: 104000, dueDate: '28 Aug 2025', daysOverdue: 19, status: 'Overdue' },
  { id: 'OS-509', invoiceId: 'INV-5144', customer: 'Smartworks Infra', city: 'Hyderabad', zone: 'Begumpet', amount: 82000, dueDate: '21 Aug 2025', daysOverdue: 26, status: 'Critical' },
  { id: 'OS-506', invoiceId: 'INV-5168', customer: 'TSIIC', city: 'Hyderabad', zone: 'Begumpet', amount: 118000, dueDate: '18 Aug 2025', daysOverdue: 29, status: 'Critical' },
  { id: 'OS-503', invoiceId: 'INV-5136', customer: 'Nalgonda Cement Co', city: 'Nalgonda', zone: 'Miryalaguda Road', amount: 76000, dueDate: '12 Aug 2025', daysOverdue: 35, status: 'Critical' },
  { id: 'OS-501', invoiceId: 'INV-5152', customer: 'Kences Builders', city: 'Hyderabad', zone: 'Kukatpally', amount: 48000, dueDate: '08 Aug 2025', daysOverdue: 39, status: 'Critical' },
]

export type RefundStatus = 'Pending' | 'Approved' | 'Processed' | 'Rejected'

export type RefundAdjustment = {
  id: string
  bookingId: string
  customer: string
  city: string
  zone: string
  amount: number
  reason: string
  status: RefundStatus
  requested: string
  authorizedBy?: string
  authorizedOn?: string
}

export const refundAdjustments: RefundAdjustment[] = [
  { id: 'RF-034', bookingId: 'BK-5149', customer: 'Suryapet Infra LLP', city: 'Suryapet', zone: 'Alair Road', amount: 18400, reason: 'Cancellation inside the cooling-off window', status: 'Pending', requested: '1 day ago' },
  { id: 'RF-033', bookingId: 'BK-5131', customer: 'Twin Cities Builders', city: 'Hyderabad', zone: 'LB Nagar', amount: 9600, reason: 'Damage waiver claim cleared after inspection', status: 'Approved', requested: '2 days ago', authorizedBy: stateProfile.adminName, authorizedOn: '1 day ago' },
  { id: 'RF-032', bookingId: 'BK-5144', customer: 'Smartworks Infra', city: 'Hyderabad', zone: 'Begumpet', amount: 7200, reason: 'Duplicate charge on September invoice', status: 'Processed', requested: '5 days ago', authorizedBy: 'Finance Desk', authorizedOn: '4 days ago' },
  { id: 'RF-031', bookingId: 'BK-5152', customer: 'Kences Builders', city: 'Hyderabad', zone: 'Kukatpally', amount: 4800, reason: 'Downtime adjustment for a late machine handover', status: 'Processed', requested: '6 days ago', authorizedBy: 'Finance Desk', authorizedOn: '5 days ago' },
  { id: 'RF-030', bookingId: 'BK-5148', customer: 'Sanghi Industries', city: 'Hyderabad', zone: 'Uppal', amount: 12600, reason: 'Booking cancelled before dispatch', status: 'Rejected', requested: '8 days ago', authorizedBy: 'Finance Desk', authorizedOn: '7 days ago' },
]

export type InvoiceKind = 'Invoice' | 'Receipt' | 'Credit note'
export type InvoiceStatus = 'Paid' | 'Sent' | 'Overdue' | 'Draft'

export type InvoiceRecord = {
  id: string
  kind: InvoiceKind
  bookingId: string
  customer: string
  city: string
  amount: number
  reference: string
  issued: string
  status: InvoiceStatus
}

export const invoiceRecords: InvoiceRecord[] = [
  { id: 'INV-5182', kind: 'Invoice', bookingId: 'BK-5182', customer: 'L&T Metro Rail', city: 'Hyderabad', amount: 224000, reference: 'pay_R8x21Kd9', issued: '12 Sep 2025', status: 'Paid' },
  { id: 'RCT-88412', kind: 'Receipt', bookingId: 'BK-5182', customer: 'L&T Metro Rail', city: 'Hyderabad', amount: 224000, reference: 'pay_R8x21Kd9', issued: '12 Sep 2025', status: 'Paid' },
  { id: 'INV-5179', kind: 'Invoice', bookingId: 'BK-5179', customer: 'MEIL', city: 'Hyderabad', amount: 286000, reference: 'pay_Kd03Lm11', issued: '12 Sep 2025', status: 'Paid' },
  { id: 'INV-5176', kind: 'Invoice', bookingId: 'BK-5176', customer: 'My Home Builders', city: 'Hyderabad', amount: 112000, reference: 'pay_9Ff2Pq77', issued: '11 Sep 2025', status: 'Sent' },
  { id: 'INV-5166', kind: 'Invoice', bookingId: 'BK-5166', customer: 'Nagarjuna Constructions', city: 'Karimnagar', amount: 194000, reference: 'pay_Qw18Vc02', issued: '10 Sep 2025', status: 'Sent' },
  { id: 'INV-5164', kind: 'Invoice', bookingId: 'BK-5164', customer: 'Vascon Engineers', city: 'Hyderabad', amount: 92000, reference: '—', issued: '05 Sep 2025', status: 'Overdue' },
  { id: 'INV-5158', kind: 'Invoice', bookingId: 'BK-5158', customer: 'Greenko Energies', city: 'Khammam', amount: 348000, reference: 'pay_Hj44Nk88', issued: '09 Sep 2025', status: 'Paid' },
  { id: 'CN-5152', kind: 'Credit note', bookingId: 'BK-5144', customer: 'Smartworks Infra', city: 'Hyderabad', amount: 7200, reference: 'adj_CN5152', issued: '05 Sep 2025', status: 'Paid' },
  { id: 'RCT-88382', kind: 'Receipt', bookingId: 'BK-5149', customer: 'Suryapet Infra LLP', city: 'Suryapet', amount: 72000, reference: 'pay_Tr60Dq41', issued: '08 Sep 2025', status: 'Paid' },
  { id: 'INV-5144', kind: 'Invoice', bookingId: 'BK-5144', customer: 'Smartworks Infra', city: 'Hyderabad', amount: 82000, reference: '—', issued: '30 Aug 2025', status: 'Draft' },
]

export type FinanceReport = {
  id: string
  title: string
  detail: string
  period: string
  tone: 'green' | 'blue' | 'purple' | 'orange'
  permitted: boolean
}

export const financeReports: FinanceReport[] = [
  { id: 'rep-1', title: 'State revenue summary', detail: 'Gross rental revenue, commission and net remittance by city.', period: 'This month', tone: 'green', permitted: true },
  { id: 'rep-2', title: 'Payment status report', detail: 'Successful, pending, failed and refunded payment counts and values.', period: 'Last 30 days', tone: 'blue', permitted: true },
  { id: 'rep-3', title: 'Collections by city & zone', detail: 'Target vs collected with achievement percentage per zone.', period: 'This month', tone: 'purple', permitted: true },
  { id: 'rep-4', title: 'Outstanding & overdue rent', detail: 'Ageing buckets for unpaid invoices and overdue rent.', period: 'As on date', tone: 'orange', permitted: true },
  { id: 'rep-5', title: 'Refunds & adjustments ledger', detail: 'Authorized refunds with approver and settlement reference.', period: 'This quarter', tone: 'green', permitted: true },
  { id: 'rep-6', title: 'GST summary statement', detail: 'Taxable value, CGST/SGST split and input credit summary.', period: 'This quarter', tone: 'blue', permitted: false },
]

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

export const financeAuditEntries: FinanceAuditEntry[] = [
  { id: 'fa-1', time: '20 min ago', actor: stateProfile.adminName, action: 'Approved refund', target: 'RF-033 · Twin Cities Builders', amount: 9600, outcome: 'Success' },
  { id: 'fa-2', time: '1 hour ago', actor: 'Finance Desk', action: 'Released settlement', target: 'SET-2025-09-04 · Hyderabad', amount: 384000, outcome: 'Success' },
  { id: 'fa-3', time: '3 hours ago', actor: stateProfile.adminName, action: 'Adjusted invoice', target: 'CN-5152 · Smartworks Infra', amount: 7200, outcome: 'Success' },
  { id: 'fa-4', time: '5 hours ago', actor: 'Payment Gateway', action: 'Payment failed', target: 'PMT-88395 · Nagarjuna Constructions', amount: 194000, outcome: 'Failed' },
  { id: 'fa-5', time: '8 hours ago', actor: 'Finance Desk', action: 'Flagged overdue account', target: 'Smartworks Infra · ₹82,000', amount: 82000, outcome: 'Warning' },
  { id: 'fa-6', time: '1 day ago', actor: stateProfile.adminName, action: 'Exported revenue summary', target: 'State revenue summary · CSV', outcome: 'Success' },
  { id: 'fa-7', time: '2 days ago', actor: 'Finance Desk', action: 'Rejected refund', target: 'RF-030 · Sanghi Industries', amount: 12600, outcome: 'Warning' },
]

export const financePeriods = ['This Month', 'Last Month', 'This Quarter', 'This Year'] as const
