export const ownerPayoutMethods = ['NEFT', 'IMPS', 'RTGS', 'UPI'] as const
export type OwnerPayoutMethod = (typeof ownerPayoutMethods)[number]

export type OwnerSettlementStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected'

export type OwnerSettlementEvent = {
  at: string
  actor: string
  action: string
  detail: string
}

export type OwnerSettlement = {
  id: string
  owner: string
  period: string
  cadence: 'Weekly' | 'Monthly'
  grossRentalEarnings: number
  platformCommission: number
  approvedExpenses: number
  deductions: number
  taxableAmount: number
  taxAmount: number
  netPayable: number
  payoutMethod: OwnerPayoutMethod
  status: OwnerSettlementStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  paymentReference?: string
  paidAt?: string
  history: OwnerSettlementEvent[]
}

const buildOwnerSettlement = (
  row: Omit<OwnerSettlement, 'netPayable'>,
): OwnerSettlement => ({
  ...row,
  netPayable:
    row.grossRentalEarnings -
    row.platformCommission -
    row.approvedExpenses -
    row.deductions -
    row.taxAmount,
})

export const ownerSettlementSeeds: OwnerSettlement[] = [
  buildOwnerSettlement({
    id: 'OS-2604-001',
    owner: 'Sri Balaji Rentals',
    period: '01–15 Apr 2026',
    cadence: 'Weekly',
    grossRentalEarnings: 486000,
    platformCommission: 63180,
    approvedExpenses: 12500,
    deductions: 8000,
    taxableAmount: 402320,
    taxAmount: 12070,
    payoutMethod: 'NEFT',
    status: 'Pending',
    requestedBy: 'Finance Operations',
    requestedAt: '2026-04-16 09:15',
    history: [{ at: '2026-04-16 09:15', actor: 'Finance Operations', action: 'Settlement prepared', detail: 'Weekly owner settlement submitted for review.' }],
  }),
  buildOwnerSettlement({
    id: 'OS-2604-002',
    owner: 'Green Field Partners',
    period: '01–15 Apr 2026',
    cadence: 'Weekly',
    grossRentalEarnings: 186000,
    platformCommission: 24180,
    approvedExpenses: 7500,
    deductions: 2000,
    taxableAmount: 152320,
    taxAmount: 4569,
    payoutMethod: 'IMPS',
    status: 'Pending',
    requestedBy: 'Finance Operations',
    requestedAt: '2026-04-16 08:20',
    history: [{ at: '2026-04-16 08:20', actor: 'Finance Operations', action: 'Settlement prepared', detail: 'Weekly owner settlement submitted for review.' }],
  }),
  buildOwnerSettlement({
    id: 'OS-2604-003',
    owner: 'Sunrise Equipment',
    period: '01–15 Apr 2026',
    cadence: 'Weekly',
    grossRentalEarnings: 724000,
    platformCommission: 94120,
    approvedExpenses: 28000,
    deductions: 15000,
    taxableAmount: 586880,
    taxAmount: 17606,
    payoutMethod: 'RTGS',
    status: 'Pending',
    requestedBy: 'Finance Operations',
    requestedAt: '2026-04-16 07:50',
    history: [{ at: '2026-04-16 07:50', actor: 'Finance Operations', action: 'Settlement prepared', detail: 'Above-limit owner payable submitted for review.' }],
  }),
  buildOwnerSettlement({
    id: 'OS-2603-004',
    owner: 'Lakshmi Traders',
    period: 'Mar 2026',
    cadence: 'Monthly',
    grossRentalEarnings: 312000,
    platformCommission: 40560,
    approvedExpenses: 9500,
    deductions: 0,
    taxableAmount: 261940,
    taxAmount: 7858,
    payoutMethod: 'NEFT',
    status: 'Paid',
    requestedBy: 'Finance Operations',
    requestedAt: '2026-04-02 08:10',
    approvedBy: 'Rohit Menon',
    approvedAt: '2026-04-02 09:00',
    paymentReference: 'UTR-NEFT-260402-7812',
    paidAt: '2026-04-02 14:26',
    history: [
      { at: '2026-04-02 08:10', actor: 'Finance Operations', action: 'Settlement prepared', detail: 'Monthly owner settlement submitted for review.' },
      { at: '2026-04-02 09:00', actor: 'Rohit Menon', action: 'Settlement approved', detail: 'Within single-approver limit.' },
      { at: '2026-04-02 14:26', actor: 'Payment Operations', action: 'Payout completed', detail: 'NEFT · UTR-NEFT-260402-7812.' },
    ],
  }),
  buildOwnerSettlement({
    id: 'OS-2603-005',
    owner: 'Metro Machines',
    period: 'Mar 2026',
    cadence: 'Monthly',
    grossRentalEarnings: 268000,
    platformCommission: 34840,
    approvedExpenses: 16000,
    deductions: 42000,
    taxableAmount: 175160,
    taxAmount: 5255,
    payoutMethod: 'UPI',
    status: 'Rejected',
    requestedBy: 'Finance Operations',
    requestedAt: '2026-04-02 08:30',
    rejectedBy: 'Anita Shah',
    rejectedAt: '2026-04-02 09:05',
    rejectionReason: 'Verify the damage deduction against the signed inspection report.',
    history: [
      { at: '2026-04-02 08:30', actor: 'Finance Operations', action: 'Settlement prepared', detail: 'Monthly owner settlement submitted for review.' },
      { at: '2026-04-02 09:05', actor: 'Anita Shah', action: 'Settlement rejected', detail: 'Verify the damage deduction against the signed inspection report.' },
    ],
  }),
]

export const canApproveOwnerSettlement = (settlement: OwnerSettlement, approver: string) => {
  if (settlement.status !== 'Pending') {
    return 'This settlement is not awaiting approval.'
  }
  if (settlement.requestedBy === approver) {
    return 'The settlement creator cannot approve their own settlement.'
  }
  return null
}

export const approveOwnerSettlement = (
  settlement: OwnerSettlement,
  approver: string,
  at: string,
): OwnerSettlement | null => {
  if (canApproveOwnerSettlement(settlement, approver)) return null
  return {
    ...settlement,
    status: 'Approved',
    approvedBy: approver,
    approvedAt: at,
    history: [...settlement.history, { at, actor: approver, action: 'Settlement approved', detail: 'Single independent approval recorded.' }],
  }
}

export const rejectOwnerSettlement = (
  settlement: OwnerSettlement,
  approver: string,
  reason: string,
  at: string,
): OwnerSettlement | null => {
  if (canApproveOwnerSettlement(settlement, approver) || reason.trim() === '') return null
  return {
    ...settlement,
    status: 'Rejected',
    rejectionReason: reason.trim(),
    rejectedBy: approver,
    rejectedAt: at,
    history: [...settlement.history, { at, actor: approver, action: 'Settlement rejected', detail: reason.trim() }],
  }
}

export const markOwnerSettlementPaid = (
  settlement: OwnerSettlement,
  actor: string,
  reference: string,
  at: string,
): OwnerSettlement | null => {
  if (settlement.status !== 'Approved' || reference.trim() === '') return null
  return {
    ...settlement,
    status: 'Paid',
    paymentReference: reference.trim(),
    paidAt: at,
    history: [...settlement.history, {
      at,
      actor,
      action: 'Payout completed',
      detail: `${settlement.payoutMethod} · ${reference.trim()}.`,
    }],
  }
}
