export const operatorPaymentMethods = ['UPI', 'NEFT', 'IMPS', 'RTGS'] as const
export type OperatorPaymentMethod = (typeof operatorPaymentMethods)[number]
export type OperatorPaymentCycle = 'Weekly' | 'Fortnightly' | 'Monthly'
export type OperatorPaymentStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected'

export type RentalJob = {
  id: string
  equipment: string
  location: string
  workDate: string
  regularHours: number
  overtimeHours: number
  basePay: number
  overtimePay: number
}

export type OperatorPaymentEvent = {
  at: string
  actor: string
  action: string
  detail: string
}

export type OperatorPayment = {
  id: string
  operator: string
  phone: string
  operatorCode: string
  period: string
  cycle: OperatorPaymentCycle
  payoutMethod: OperatorPaymentMethod
  jobs: RentalJob[]
  allowances: number
  bonuses: number
  deductions: number
  taxWithheld: number
  grossWages: number
  netWages: number
  status: OperatorPaymentStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  paymentReference?: string
  paidAt?: string
  history: OperatorPaymentEvent[]
}

const buildOperatorPayment = (
  payment: Omit<OperatorPayment, 'grossWages' | 'netWages'>,
): OperatorPayment => {
  const basePay = payment.jobs.reduce((sum, job) => sum + job.basePay, 0)
  const overtimePay = payment.jobs.reduce((sum, job) => sum + job.overtimePay, 0)
  const grossWages = basePay + overtimePay + payment.allowances + payment.bonuses
  return {
    ...payment,
    grossWages,
    netWages: grossWages - payment.deductions - payment.taxWithheld,
  }
}

export const operatorPaymentSeeds: OperatorPayment[] = [
  buildOperatorPayment({
    id: 'OP-2604-021',
    operator: 'Imran Khan',
    phone: '+91 90000 00021',
    operatorCode: 'OP-HYD-104',
    period: '08–14 Apr 2026',
    cycle: 'Weekly',
    payoutMethod: 'UPI',
    jobs: [
      { id: 'JOB-88213', equipment: 'Volvo FMX 440', location: 'HITEC City', workDate: '2026-04-08', regularHours: 8, overtimeHours: 2, basePay: 2400, overtimePay: 900 },
      { id: 'JOB-88244', equipment: 'Tata Hitachi EX200', location: 'Gachibowli', workDate: '2026-04-10', regularHours: 9, overtimeHours: 1, basePay: 2700, overtimePay: 450 },
      { id: 'JOB-88310', equipment: 'JCB 3DX', location: 'Madhapur', workDate: '2026-04-12', regularHours: 8, overtimeHours: 0, basePay: 2400, overtimePay: 0 },
    ],
    allowances: 1200,
    bonuses: 1500,
    deductions: 350,
    taxWithheld: 0,
    status: 'Pending',
    requestedBy: 'Operations Payroll',
    requestedAt: '2026-04-15 09:10',
    history: [{ at: '2026-04-15 09:10', actor: 'Operations Payroll', action: 'Payment submitted', detail: 'Weekly operator wages submitted for finance approval.' }],
  }),
  buildOperatorPayment({
    id: 'OP-2604-022',
    operator: 'Vikram Singh',
    phone: '+91 90000 00022',
    operatorCode: 'OP-HYD-118',
    period: '08–14 Apr 2026',
    cycle: 'Weekly',
    payoutMethod: 'NEFT',
    jobs: [
      { id: 'JOB-88355', equipment: 'ACE AG-15', location: 'Kukatpally', workDate: '2026-04-09', regularHours: 8, overtimeHours: 3, basePay: 2400, overtimePay: 1350 },
      { id: 'JOB-88402', equipment: 'Volvo FMX 440', location: 'Secunderabad', workDate: '2026-04-13', regularHours: 8, overtimeHours: 1, basePay: 2400, overtimePay: 450 },
    ],
    allowances: 900,
    bonuses: 750,
    deductions: 200,
    taxWithheld: 0,
    status: 'Pending',
    requestedBy: 'Operations Payroll',
    requestedAt: '2026-04-15 09:25',
    history: [{ at: '2026-04-15 09:25', actor: 'Operations Payroll', action: 'Payment submitted', detail: 'Weekly operator wages submitted for finance approval.' }],
  }),
  buildOperatorPayment({
    id: 'OP-2604-018',
    operator: 'Ravi Deshmukh',
    phone: '+91 90000 00018',
    operatorCode: 'OP-BLR-076',
    period: '01–15 Apr 2026',
    cycle: 'Fortnightly',
    payoutMethod: 'IMPS',
    jobs: [
      { id: 'JOB-88110', equipment: 'Komatsu PC200', location: 'Whitefield', workDate: '2026-04-04', regularHours: 8, overtimeHours: 2, basePay: 2400, overtimePay: 900 },
      { id: 'JOB-88182', equipment: 'Tata Hitachi EX200', location: 'Electronic City', workDate: '2026-04-07', regularHours: 9, overtimeHours: 0, basePay: 2700, overtimePay: 0 },
      { id: 'JOB-88281', equipment: 'ACE AG-15', location: 'Whitefield', workDate: '2026-04-12', regularHours: 8, overtimeHours: 1, basePay: 2400, overtimePay: 450 },
    ],
    allowances: 1800,
    bonuses: 2500,
    deductions: 600,
    taxWithheld: 0,
    status: 'Approved',
    requestedBy: 'Operations Payroll',
    requestedAt: '2026-04-15 08:00',
    approvedBy: 'Rohit Menon',
    approvedAt: '2026-04-15 10:05',
    history: [
      { at: '2026-04-15 08:00', actor: 'Operations Payroll', action: 'Payment submitted', detail: 'Fortnightly operator wages submitted for finance approval.' },
      { at: '2026-04-15 10:05', actor: 'Rohit Menon', action: 'Payment approved', detail: 'Operator payment cleared for payout.' },
    ],
  }),
  buildOperatorPayment({
    id: 'OP-2604-014',
    operator: 'Anand Rao',
    phone: '+91 90000 00014',
    operatorCode: 'OP-PUN-052',
    period: 'Mar 2026',
    cycle: 'Monthly',
    payoutMethod: 'NEFT',
    jobs: [
      { id: 'JOB-87892', equipment: 'JCB 3DX', location: 'Hinjewadi', workDate: '2026-03-18', regularHours: 8, overtimeHours: 0, basePay: 2400, overtimePay: 0 },
      { id: 'JOB-87988', equipment: 'Volvo FMX 440', location: 'Pimpri', workDate: '2026-03-26', regularHours: 8, overtimeHours: 2, basePay: 2400, overtimePay: 900 },
    ],
    allowances: 2000,
    bonuses: 1000,
    deductions: 400,
    taxWithheld: 0,
    status: 'Paid',
    requestedBy: 'Operations Payroll',
    requestedAt: '2026-04-02 08:30',
    approvedBy: 'Rohit Menon',
    approvedAt: '2026-04-02 09:20',
    paymentReference: 'UTR-OP-260402-1438',
    paidAt: '2026-04-02 14:10',
    history: [
      { at: '2026-04-02 08:30', actor: 'Operations Payroll', action: 'Payment submitted', detail: 'Monthly operator wages submitted for finance approval.' },
      { at: '2026-04-02 09:20', actor: 'Rohit Menon', action: 'Payment approved', detail: 'Operator payment cleared for payout.' },
      { at: '2026-04-02 14:10', actor: 'Payment Operations', action: 'Payment completed', detail: 'NEFT · UTR-OP-260402-1438.' },
    ],
  }),
]

export const approveOperatorPayment = (
  payment: OperatorPayment,
  approver: string,
  at: string,
): OperatorPayment | null => {
  if (payment.status !== 'Pending' || payment.requestedBy === approver) return null
  return {
    ...payment,
    status: 'Approved',
    approvedBy: approver,
    approvedAt: at,
    history: [...payment.history, { at, actor: approver, action: 'Payment approved', detail: 'Operator payment cleared for payout.' }],
  }
}

export const rejectOperatorPayment = (
  payment: OperatorPayment,
  approver: string,
  reason: string,
  at: string,
): OperatorPayment | null => {
  if (payment.status !== 'Pending' || payment.requestedBy === approver || reason.trim() === '') return null
  return {
    ...payment,
    status: 'Rejected',
    rejectedBy: approver,
    rejectedAt: at,
    rejectionReason: reason.trim(),
    history: [...payment.history, { at, actor: approver, action: 'Payment rejected', detail: reason.trim() }],
  }
}

export const markOperatorPaymentPaid = (
  payment: OperatorPayment,
  reference: string,
  at: string,
): OperatorPayment | null => {
  if (payment.status !== 'Approved' || reference.trim() === '') return null
  return {
    ...payment,
    status: 'Paid',
    paymentReference: reference.trim(),
    paidAt: at,
    history: [...payment.history, { at, actor: 'Payment Operations', action: 'Payment completed', detail: `${payment.payoutMethod} · ${reference.trim()}.` }],
  }
}

export const updateOperatorPaymentMethod = (
  payment: OperatorPayment,
  method: OperatorPaymentMethod,
  at: string,
): OperatorPayment | null => {
  if (payment.status === 'Paid') return null
  return {
    ...payment,
    payoutMethod: method,
    history: [...payment.history, { at, actor: 'Rohit Menon', action: 'Payout method updated', detail: `Payment method changed to ${method}.` }],
  }
}
