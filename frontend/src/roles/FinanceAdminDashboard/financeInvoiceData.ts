export type FinanceInvoiceStatus = 'Draft' | 'Unpaid' | 'Partially paid' | 'Paid' | 'Overdue'

export type FinanceInvoiceAmounts = {
  rentalCharges: number
  fuel: number
  transportation: number
  overtime: number
  tax: number
  discount: number
  penalties: number
  deposits: number
}

export type FinanceInvoice = FinanceInvoiceAmounts & {
  id: string
  customer: string
  bookingId: string
  issuedAt: string
  dueAt: string
  status: FinanceInvoiceStatus
  collected: number
  paymentReference?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export type FinanceInvoiceDraft = Omit<FinanceInvoice, 'id' | 'status' | 'collected' | 'paymentReference' | 'paidAt' | 'createdAt' | 'updatedAt'>

export const invoiceAmountKeys: Array<keyof FinanceInvoiceAmounts> = [
  'rentalCharges',
  'fuel',
  'transportation',
  'overtime',
  'tax',
  'discount',
  'penalties',
  'deposits',
]

export const financeInvoiceSeeds: FinanceInvoice[] = [
  {
    id: 'INV-58210', customer: 'Arjun Mehta', bookingId: 'BK-88213', issuedAt: '2026-03-28', dueAt: '2026-11-15',
    rentalCharges: 36000, fuel: 3500, transportation: 2500, overtime: 1800, tax: 4200, discount: 1000, penalties: 0, deposits: 10000,
    status: 'Unpaid', collected: 0, createdAt: '2026-03-28 09:10', updatedAt: '2026-03-28 09:10',
  },
  {
    id: 'INV-58204', customer: 'Priya Nair', bookingId: 'BK-88355', issuedAt: '2026-03-27', dueAt: '2026-11-12',
    rentalCharges: 24800, fuel: 1600, transportation: 1200, overtime: 0, tax: 3600, discount: 0, penalties: 0, deposits: 0,
    status: 'Partially paid', collected: 12500, paymentReference: 'UPI-INV-58204-125', createdAt: '2026-03-27 10:30', updatedAt: '2026-04-10 15:00',
  },
  {
    id: 'INV-58188', customer: 'Zainab Ali', bookingId: 'BK-88244', issuedAt: '2026-03-20', dueAt: '2026-04-03',
    rentalCharges: 18000, fuel: 1500, transportation: 1000, overtime: 0, tax: 3000, discount: 1000, penalties: 0, deposits: 0,
    status: 'Overdue', collected: 5000, paymentReference: 'NEFT-COL-58188-01', createdAt: '2026-03-20 08:45', updatedAt: '2026-04-01 12:05',
  },
  {
    id: 'INV-58302', customer: 'Karan Patel', bookingId: 'BK-88310', issuedAt: '2026-04-01', dueAt: '2026-11-22',
    rentalCharges: 46000, fuel: 5200, transportation: 2800, overtime: 3600, tax: 8700, discount: 2500, penalties: 1200, deposits: 12000,
    status: 'Unpaid', collected: 0, createdAt: '2026-04-01 11:10', updatedAt: '2026-04-01 11:10',
  },
  {
    id: 'INV-58318', customer: 'Neha Rao', bookingId: 'BK-90112', issuedAt: '2026-04-03', dueAt: '2026-11-25',
    rentalCharges: 42000, fuel: 4000, transportation: 3000, overtime: 2500, tax: 7900, discount: 1500, penalties: 0, deposits: 8000,
    status: 'Draft', collected: 0, createdAt: '2026-04-03 08:20', updatedAt: '2026-04-03 08:20',
  },
]

export const totalFinanceInvoice = (invoice: FinanceInvoiceAmounts) =>
  invoice.rentalCharges +
  invoice.fuel +
  invoice.transportation +
  invoice.overtime +
  invoice.tax -
  invoice.discount +
  invoice.penalties +
  invoice.deposits

const isCalendarDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value

export const financeInvoiceBalance = (invoice: FinanceInvoice) =>
  Math.max(0, totalFinanceInvoice(invoice) - invoice.collected)

export const financeInvoiceStatus = (invoice: FinanceInvoice, today: string): FinanceInvoiceStatus => {
  if (invoice.status === 'Draft') return 'Draft'
  const balance = financeInvoiceBalance(invoice)
  if (balance === 0) return 'Paid'
  if (invoice.dueAt < today) return 'Overdue'
  if (invoice.collected > 0) return 'Partially paid'
  return 'Unpaid'
}

export const createFinanceInvoice = (
  draft: FinanceInvoiceDraft,
  id: string,
  at: string,
): FinanceInvoice | null => {
  if (
    !draft.customer.trim() ||
    !draft.bookingId.trim() ||
    !isCalendarDate(draft.issuedAt) ||
    !isCalendarDate(draft.dueAt) ||
    draft.dueAt < draft.issuedAt ||
    totalFinanceInvoice(draft) <= 0 ||
    invoiceAmountKeys.some((key) => !Number.isFinite(draft[key]) || draft[key] < 0)
  ) return null
  return {
    ...draft,
    id,
    status: 'Draft',
    collected: 0,
    createdAt: at,
    updatedAt: at,
  }
}

export const editFinanceInvoice = (
  invoice: FinanceInvoice,
  draft: FinanceInvoiceDraft,
  at: string,
): FinanceInvoice | null => {
  if (invoice.status !== 'Draft') return null
  const updated = createFinanceInvoice(draft, invoice.id, at)
  return updated ? { ...updated, createdAt: invoice.createdAt, updatedAt: at } : null
}

export const issueFinanceInvoice = (invoice: FinanceInvoice, at: string): FinanceInvoice | null => {
  if (invoice.status !== 'Draft' || totalFinanceInvoice(invoice) <= 0) return null
  return { ...invoice, status: invoice.dueAt < at.slice(0, 10) ? 'Overdue' : 'Unpaid', updatedAt: at }
}

export const collectFinanceInvoicePayment = (
  invoice: FinanceInvoice,
  amount: number,
  reference: string,
  at: string,
): FinanceInvoice | null => {
  const balance = financeInvoiceBalance(invoice)
  if (invoice.status === 'Draft' || balance <= 0 || !Number.isFinite(amount) || amount <= 0 || amount > balance || !reference.trim()) return null
  const collected = invoice.collected + amount
  const updated = { ...invoice, collected, paymentReference: reference.trim(), paidAt: collected >= totalFinanceInvoice(invoice) ? at : invoice.paidAt, updatedAt: at }
  return { ...updated, status: financeInvoiceStatus(updated, at.slice(0, 10)) }
}
