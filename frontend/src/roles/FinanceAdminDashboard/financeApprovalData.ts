import { financeProfile, payouts, refunds } from './financeAdminData.ts'
import type { Payout, Refund } from './financeAdminData.ts'

export type ApprovalCategory =
  | 'Owner payout'
  | 'Operator payment'
  | 'Refund'
  | 'Expense claim'
  | 'Discount'
  | 'Manual adjustment'

export type ApprovalStatus =
  | 'Pending'
  | 'Awaiting second approval'
  | 'Approved'
  | 'Rejected'
  | 'Processed'
  | 'Paid'
  | 'Failed'
  | 'On hold'

export type FinanceApprovalRequest = {
  id: string
  category: ApprovalCategory
  subject: string
  requestedBy: string
  requestedAt: string
  amount: string
  numericAmount: number
  approvalLimit: number
  description: string
  status: ApprovalStatus
  firstApprover?: string
  firstApprovedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  legacyType?: 'payout' | 'refund'
}

export type FinanceApprover = {
  name: string
  role: string
}

export const financeApprovers: FinanceApprover[] = [
  { name: financeProfile.name, role: 'Finance Admin' },
  { name: 'Anita Shah', role: 'Finance Controller' },
  { name: 'Devika Nair', role: 'Finance Director' },
  { name: 'Kabir Rao', role: 'Chief Financial Officer' },
]

export const approvalLimits: Record<ApprovalCategory, number> = {
  'Owner payout': 200000,
  'Operator payment': 100000,
  Refund: 10000,
  'Expense claim': 25000,
  Discount: 15000,
  'Manual adjustment': 50000,
}

export const approvalCategories = Object.keys(approvalLimits) as ApprovalCategory[]

export const formatApprovalAmount = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`

const payoutStatus = (status: Payout['status']): ApprovalStatus => status === 'Held' ? 'On hold' : status

const refundStatus = (status: Refund['status']): ApprovalStatus => status

const payoutRequest = (item: Payout): FinanceApprovalRequest => ({
  id: item.id,
  category: item.payeeType === 'Owner' ? 'Owner payout' : 'Operator payment',
  subject: item.payee,
  requestedBy: 'Finance Operations',
  requestedAt: `${item.requestedAt} 09:00`,
  amount: item.amount,
  numericAmount: item.numericAmount,
  approvalLimit: approvalLimits[item.payeeType === 'Owner' ? 'Owner payout' : 'Operator payment'],
  description: `${item.method} · settlement ${item.settlement}`,
  status: payoutStatus(item.status),
  firstApprover: item.status === 'Awaiting second approval' ? 'Anita Shah' : undefined,
  firstApprovedAt: item.status === 'Awaiting second approval' ? `${item.requestedAt} 10:00` : undefined,
  approvedBy: item.status === 'Approved' || item.status === 'Paid' ? 'Rohit Menon' : undefined,
  approvedAt: item.status === 'Approved' || item.status === 'Paid' ? `${item.requestedAt} 10:00` : undefined,
  rejectedBy: item.status === 'Rejected' ? 'Rohit Menon' : undefined,
  rejectedAt: item.status === 'Rejected' ? `${item.requestedAt} 10:00` : undefined,
  rejectionReason: item.status === 'Rejected' ? item.reason : undefined,
  legacyType: 'payout',
})

const refundRequest = (item: Refund): FinanceApprovalRequest => ({
  id: item.id,
  category: 'Refund',
  subject: `${item.customer} · ${item.booking}`,
  requestedBy: 'Support Operations',
  requestedAt: `${item.requestedAt} 09:00`,
  amount: item.amount,
  numericAmount: item.numericAmount,
  approvalLimit: approvalLimits.Refund,
  description: `${item.dispute} · ${item.decision}`,
  status: refundStatus(item.status),
  approvedBy: item.status === 'Approved' || item.status === 'Processed' ? 'Rohit Menon' : undefined,
  approvedAt: item.status === 'Approved' || item.status === 'Processed' ? `${item.requestedAt} 10:00` : undefined,
  rejectedBy: item.status === 'Rejected' ? 'Rohit Menon' : undefined,
  rejectedAt: item.status === 'Rejected' ? `${item.requestedAt} 10:00` : undefined,
  rejectionReason: item.status === 'Rejected' ? item.decision : undefined,
  legacyType: 'refund',
})

const additionalRequests: FinanceApprovalRequest[] = [
  {
    id: 'EXP-3204',
    category: 'Expense claim',
    subject: 'Ravi Deshmukh · site travel',
    requestedBy: 'Ravi Deshmukh',
    requestedAt: '2026-04-02 08:40',
    amount: '₹18,450',
    numericAmount: 18450,
    approvalLimit: approvalLimits['Expense claim'],
    description: 'HITEC City equipment inspection · receipts attached',
    status: 'Pending',
  },
  {
    id: 'DSC-1182',
    category: 'Discount',
    subject: 'Hyderabad fleet renewal',
    requestedBy: 'Anita Shah',
    requestedAt: '2026-04-02 08:10',
    amount: '₹32,000',
    numericAmount: 32000,
    approvalLimit: approvalLimits.Discount,
    description: 'Quarterly partner retention discount · 8% of order',
    status: 'Pending',
  },
  {
    id: 'ADJ-0917',
    category: 'Manual adjustment',
    subject: 'Settlement ST-2603 · line 044',
    requestedBy: 'Finance Operations',
    requestedAt: '2026-04-01 16:25',
    amount: '₹72,500',
    numericAmount: 72500,
    approvalLimit: approvalLimits['Manual adjustment'],
    description: 'Correct equipment downtime credit after reconciliation',
    status: 'Awaiting second approval',
    firstApprover: 'Anita Shah',
    firstApprovedAt: '2026-04-02 08:30',
  },
  {
    id: 'EXP-3202',
    category: 'Expense claim',
    subject: 'Priya Nair · safety equipment',
    requestedBy: 'Priya Nair',
    requestedAt: '2026-04-01 11:15',
    amount: '₹8,900',
    numericAmount: 8900,
    approvalLimit: approvalLimits['Expense claim'],
    description: 'Approved PPE purchase for field inspection team',
    status: 'Approved',
    approvedBy: 'Rohit Menon',
    approvedAt: '2026-04-02 09:15',
  },
]

export const financeApprovalRequests: FinanceApprovalRequest[] = [
  ...payouts.map(payoutRequest),
  ...refunds.map(refundRequest),
  ...additionalRequests,
]

export const canApproveFinanceRequest = (
  request: FinanceApprovalRequest,
  approver: string,
): string | null => {
  if (request.status !== 'Pending' && request.status !== 'Awaiting second approval') {
    return 'This request is not awaiting approval.'
  }
  if (request.requestedBy === approver) {
    return 'Maker-checker control: the request creator cannot approve their own request.'
  }
  if (request.status === 'Awaiting second approval' && request.firstApprover === approver) {
    return 'A second approval must come from a different approver.'
  }
  return null
}

export const approveFinanceRequest = (
  request: FinanceApprovalRequest,
  approver: string,
  timestamp: string,
): FinanceApprovalRequest | null => {
  if (canApproveFinanceRequest(request, approver)) return null

  if (request.status === 'Awaiting second approval') {
    return { ...request, status: 'Approved', approvedBy: approver, approvedAt: timestamp }
  }
  if (request.numericAmount > request.approvalLimit) {
    return {
      ...request,
      status: 'Awaiting second approval',
      firstApprover: approver,
      firstApprovedAt: timestamp,
    }
  }
  return { ...request, status: 'Approved', approvedBy: approver, approvedAt: timestamp }
}

export const rejectFinanceRequest = (
  request: FinanceApprovalRequest,
  approver: string,
  reason: string,
  timestamp: string,
): FinanceApprovalRequest | null => {
  if (canApproveFinanceRequest(request, approver) || reason.trim() === '') return null
  return {
    ...request,
    status: 'Rejected',
    rejectedBy: approver,
    rejectedAt: timestamp,
    rejectionReason: reason.trim(),
  }
}
