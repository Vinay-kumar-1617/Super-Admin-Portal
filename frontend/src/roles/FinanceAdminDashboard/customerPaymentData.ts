import { invoices, refunds } from './financeAdminData.ts'

export type CustomerPaymentMethod = 'UPI' | 'Card' | 'NEFT' | 'Cash'
export type CustomerCollectionStatus = 'Due' | 'Partial' | 'Paid' | 'Overdue'
export const customerPaymentMethods: CustomerPaymentMethod[] = ['UPI', 'Card', 'NEFT', 'Cash']

export type CustomerPaymentEvent = {
  at: string
  actor: string
  action: string
  detail: string
}

export type CustomerBooking = {
  id: string
  equipment: string
  period: string
  rentalAmount: number
  invoiceId: string
  status: 'Completed' | 'Active'
}

export type CustomerInvoicePayment = {
  id: string
  bookingId: string
  issuedAt: string
  dueAt: string
  amount: number
  collected: number
  status: CustomerCollectionStatus
  paymentReference?: string
  paidAt?: string
}

export type CustomerPaymentProfile = {
  id: string
  customer: string
  phone: string
  email: string
  city: string
  preferredMethod: CustomerPaymentMethod
  advancePayment: number
  securityDeposit: number
  refundTotal: number
  bookings: CustomerBooking[]
  invoices: CustomerInvoicePayment[]
  history: CustomerPaymentEvent[]
}

export type CustomerPaymentRecord = CustomerPaymentProfile & {
  outstandingBalance: number
  overdueAmount: number
  totalInvoiced: number
  totalCollected: number
}

const customerDetails: Array<Omit<CustomerPaymentProfile, 'bookings' | 'invoices' | 'refundTotal' | 'history'> & {
  invoiceId: string
  bookingId: string
  equipment: string
  city: string
  amount: number
  advancePayment: number
  securityDeposit: number
  collected: number
  paymentReference?: string
  paidAt?: string
  secondBooking?: {
    invoiceId: string
    bookingId: string
    equipment: string
    amount: number
    collected: number
    issuedAt: string
    dueAt: string
    status: CustomerCollectionStatus
  }
}> = [
  {
    id: 'CUS-00912',
    customer: 'Arjun Mehta',
    phone: '+91 98765 40012',
    email: 'arjun.mehta@example.test',
    city: 'Hyderabad',
    preferredMethod: 'UPI',
    invoiceId: 'INV-58210',
    bookingId: 'BK-88213',
    equipment: 'Volvo FMX 440',
    amount: 48000,
    advancePayment: 12000,
    securityDeposit: 10000,
    collected: 28000,
    secondBooking: { invoiceId: 'INV-58194', bookingId: 'BK-88172', equipment: 'JCB 3DX', amount: 36000, collected: 36000, issuedAt: '2026-03-14', dueAt: '2026-03-28', status: 'Paid' },
  },
  {
    id: 'CUS-00918',
    customer: 'Priya Nair',
    phone: '+91 98765 40018',
    email: 'priya.nair@example.test',
    city: 'Bengaluru',
    preferredMethod: 'Card',
    invoiceId: 'INV-58204',
    bookingId: 'BK-88355',
    equipment: 'Tata Hitachi EX200',
    amount: 31200,
    advancePayment: 5000,
    securityDeposit: 8000,
    collected: 31200,
    paymentReference: 'UTR-CUS-260410-2204',
    paidAt: '2026-04-10 15:00',
  },
  {
    id: 'CUS-00844',
    customer: 'Zainab Ali',
    phone: '+91 98765 40044',
    email: 'zainab.ali@example.test',
    city: 'Hyderabad',
    preferredMethod: 'NEFT',
    invoiceId: 'INV-58188',
    bookingId: 'BK-88244',
    equipment: 'ACE AG-15',
    amount: 22500,
    advancePayment: 2500,
    securityDeposit: 7500,
    collected: 5000,
  },
  {
    id: 'CUS-01007',
    customer: 'Karan Patel',
    phone: '+91 98765 40107',
    email: 'karan.patel@example.test',
    city: 'Pune',
    preferredMethod: 'UPI',
    invoiceId: 'INV-58302',
    bookingId: 'BK-88310',
    equipment: 'Komatsu PC200',
    amount: 62500,
    advancePayment: 15000,
    securityDeposit: 12000,
    collected: 10000,
  },
  {
    id: 'CUS-01022',
    customer: 'Neha Rao',
    phone: '+91 98765 40122',
    email: 'neha.rao@example.test',
    city: 'Hyderabad',
    preferredMethod: 'Card',
    invoiceId: 'INV-58318',
    bookingId: 'BK-90112',
    equipment: 'Mobile crane 25T',
    amount: 54000,
    advancePayment: 10000,
    securityDeposit: 15000,
    collected: 44000,
  },
]

const refundTotalFor = (customer: string) =>
  refunds
    .filter((refund) => refund.customer === customer && refund.status === 'Processed')
    .reduce((total, refund) => total + refund.numericAmount, 0)

const historyFor = (customer: string, invoiceId: string, collected: number): CustomerPaymentEvent[] => {
  const existingRefunds = refunds
    .filter((refund) => refund.customer === customer)
    .map((refund) => ({
      at: `${refund.requestedAt} 12:00`,
      actor: 'Finance Admin',
      action: `Refund ${refund.status.toLowerCase()}`,
      detail: `${refund.id} · ₹${refund.numericAmount.toLocaleString('en-IN')} · ${refund.booking}`,
    }))
  return [
    { at: '2026-04-01 10:15', actor: 'Finance Admin', action: 'Customer account reviewed', detail: `${invoiceId} · collected ₹${collected.toLocaleString('en-IN')}.` },
    ...existingRefunds,
  ]
}

const invoiceIndex = new Map(invoices.map((invoice) => [invoice.id, invoice]))

export const customerPaymentSeeds: CustomerPaymentProfile[] = customerDetails.map((details) => {
  const baseInvoice = invoiceIndex.get(details.invoiceId)
  const primaryIssuedAt = baseInvoice?.issued ?? '2026-04-01'
  const primaryDueAt = baseInvoice?.due === '—' ? '2026-04-15' : baseInvoice?.due ?? '2026-04-15'
  const primaryStatus: CustomerCollectionStatus =
    details.collected >= details.amount ? 'Paid' : primaryDueAt < '2026-10-23' ? 'Overdue' : details.collected > 0 ? 'Partial' : 'Due'
  const additionalInvoice = details.secondBooking

  return {
    id: details.id,
    customer: details.customer,
    phone: details.phone,
    email: details.email,
    city: details.city,
    preferredMethod: details.preferredMethod,
    advancePayment: details.advancePayment,
    securityDeposit: details.securityDeposit,
    refundTotal: refundTotalFor(details.customer),
    bookings: [
      { id: details.bookingId, equipment: details.equipment, period: primaryIssuedAt, rentalAmount: details.amount, invoiceId: details.invoiceId, status: 'Completed' },
      ...(additionalInvoice
        ? [{ id: additionalInvoice.bookingId, equipment: additionalInvoice.equipment, period: additionalInvoice.issuedAt, rentalAmount: additionalInvoice.amount, invoiceId: additionalInvoice.invoiceId, status: 'Completed' as const }]
        : []),
    ],
    invoices: [
      { id: details.invoiceId, bookingId: details.bookingId, issuedAt: primaryIssuedAt, dueAt: primaryDueAt, amount: details.amount, collected: details.collected, status: primaryStatus, paymentReference: details.paymentReference, paidAt: details.paidAt },
      ...(additionalInvoice
        ? [{
            id: additionalInvoice.invoiceId,
            bookingId: additionalInvoice.bookingId,
            issuedAt: additionalInvoice.issuedAt,
            dueAt: additionalInvoice.dueAt,
            amount: additionalInvoice.amount,
            collected: additionalInvoice.collected,
            status: additionalInvoice.status,
          }]
        : []),
    ],
    history: historyFor(details.customer, details.invoiceId, details.collected),
  }
})

export const calculateCustomerBalances = (customer: CustomerPaymentProfile): CustomerPaymentRecord => {
  const totalInvoiced = customer.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalCollected = customer.invoices.reduce((sum, invoice) => sum + invoice.collected, 0)
  const availableCredits = customer.advancePayment
  const outstandingBalance = Math.max(0, totalInvoiced - totalCollected - availableCredits)
  const overdueAmount = customer.invoices
    .filter((invoice) => invoice.status === 'Overdue')
    .reduce((sum, invoice) => sum + Math.max(0, invoice.amount - invoice.collected), 0)
  return { ...customer, totalInvoiced, totalCollected, outstandingBalance, overdueAmount }
}

export const recordCustomerPayment = (
  customer: CustomerPaymentProfile,
  invoiceId: string,
  amount: number,
  method: CustomerPaymentMethod,
  reference: string,
  at: string,
): CustomerPaymentProfile | null => {
  const invoice = customer.invoices.find((item) => item.id === invoiceId)
  if (!invoice || invoice.status === 'Paid' || !Number.isFinite(amount) || amount <= 0 || amount > invoice.amount - invoice.collected || !reference.trim()) return null
  const collected = invoice.collected + amount
  const status: CustomerCollectionStatus = collected >= invoice.amount ? 'Paid' : invoice.dueAt < at.slice(0, 10) ? 'Overdue' : 'Partial'
  const paymentHistory: CustomerPaymentEvent[] = [
    { at, actor: 'Rohit Menon', action: 'Payment collected', detail: `${invoiceId} · ₹${amount.toLocaleString('en-IN')} · ${method} · ${reference.trim()}.` },
  ]
  return {
    ...customer,
    preferredMethod: method,
    invoices: customer.invoices.map((item) => item.id === invoiceId ? { ...item, collected, status, paymentReference: reference.trim(), paidAt: status === 'Paid' ? at : item.paidAt } : item),
    history: [...customer.history, ...paymentHistory],
  }
}

export const recordCustomerReminder = (
  customer: CustomerPaymentProfile,
  invoiceId: string,
  at: string,
): CustomerPaymentProfile | null => {
  const invoice = customer.invoices.find((item) => item.id === invoiceId)
  if (!invoice || invoice.status === 'Paid') return null
  return {
    ...customer,
    history: [...customer.history, { at, actor: 'Rohit Menon', action: 'Payment reminder sent', detail: `${customer.customer} · ${invoiceId} · outstanding ₹${(invoice.amount - invoice.collected).toLocaleString('en-IN')}.` }],
  }
}
