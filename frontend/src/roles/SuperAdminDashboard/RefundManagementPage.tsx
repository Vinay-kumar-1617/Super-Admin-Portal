import { useMemo, useState } from 'react'

type RefundStatus = 'Requested' | 'Under Review' | 'Approved' | 'Processing' | 'Completed' | 'Rejected'

type RefundEvent = {
  time: string
  label: string
  note?: string
}

type RefundRecord = {
  id: string
  bookingId: string
  bookingPeriod: string
  customerName: string
  customerId: string
  customerType: 'Company / Project' | 'Individual / Personal'
  ownerName: string
  ownerId: string
  rentalAmount: number
  refundAmount: number
  reason: string
  requestDate: string
  status: RefundStatus
  paymentMethod: string
  accountLast4: string
  rejectionReason?: string
  events: RefundEvent[]
}

type RefundManagementPageProps = {
  onBack: () => void
}

const initialRefunds: RefundRecord[] = [
  {
    id: 'RFD-9001',
    bookingId: 'TB-12011',
    bookingPeriod: '01-Oct-26 → 31-Oct-26',
    customerName: 'Mumbai Coastal Builders',
    customerId: 'CUST-4902',
    customerType: 'Company / Project',
    ownerName: 'Sahyadri Plant Hire',
    ownerId: 'OWN-2256',
    rentalAmount: 168000,
    refundAmount: 168000,
    reason: 'Booking cancelled by customer',
    requestDate: '04-Oct-26',
    status: 'Completed',
    paymentMethod: 'Bank transfer · HDFC',
    accountLast4: '4821',
    events: [
      { time: '04-Oct-26 · 11:20', label: 'Refund requested', note: 'Raised by Mumbai Coastal Builders against TB-12011.' },
      { time: '05-Oct-26 · 09:10', label: 'Moved to under review', note: 'Booking and payment records pulled for review.' },
      { time: '06-Oct-26 · 15:40', label: 'Refund approved', note: 'Approved by Finance Admin for full settlement.' },
      { time: '07-Oct-26 · 10:05', label: 'Refund processing', note: 'Bank transfer initiated to account ending 4821.' },
      { time: '08-Oct-26 · 13:22', label: 'Refund completed', note: '₹1,68,000 credited to the customer.' },
    ],
  },
  {
    id: 'RFD-9002',
    bookingId: 'TB-12003',
    bookingPeriod: '04-Oct-26 → 11-Oct-26',
    customerName: 'Pune Metro Contractors',
    customerId: 'CUST-4840',
    customerType: 'Company / Project',
    ownerName: 'Sahyadri Plant Hire',
    ownerId: 'OWN-2210',
    rentalAmount: 38493,
    refundAmount: 16800,
    reason: 'Equipment not available',
    requestDate: '06-Oct-26',
    status: 'Processing',
    paymentMethod: 'Bank transfer · ICICI',
    accountLast4: '9054',
    events: [
      { time: '06-Oct-26 · 08:45', label: 'Refund requested', note: 'Partial refund for machine unavailable on day one.' },
      { time: '07-Oct-26 · 12:30', label: 'Moved to under review', note: 'Slot allocation log verified for TB-12003.' },
      { time: '08-Oct-26 · 14:00', label: 'Refund approved', note: 'Approved as per non-availability clause.' },
      { time: '09-Oct-26 · 09:55', label: 'Refund processing', note: 'Transfer of ₹16,800 initiated to account ending 9054.' },
    ],
  },
  {
    id: 'RFD-9003',
    bookingId: 'TB-12001',
    bookingPeriod: '02-Oct-26 → 01-Nov-26',
    customerName: 'Sri Krishna Projects',
    customerId: 'CUST-4821',
    customerType: 'Company / Project',
    ownerName: 'Deccan Heavy Machinery',
    ownerId: 'OWN-2201',
    rentalAmount: 74970,
    refundAmount: 24990,
    reason: 'Service quality issue',
    requestDate: '07-Oct-26',
    status: 'Under Review',
    paymentMethod: 'UPI transfer',
    accountLast4: '7740',
    events: [
      { time: '07-Oct-26 · 16:12', label: 'Refund requested', note: 'Customer reported 3 idle days at metro site.' },
      { time: '08-Oct-26 · 11:00', label: 'Moved to under review', note: 'Operator logs and fuel records being verified.' },
    ],
  },
  {
    id: 'RFD-9004',
    bookingId: 'TB-12006',
    bookingPeriod: '12-Oct-26 → 12-Jan-27',
    customerName: 'Delhi Urban Infra',
    customerId: 'CUST-4870',
    customerType: 'Company / Project',
    ownerName: 'Capital Equipment Bank',
    ownerId: 'OWN-2224',
    rentalAmount: 352000,
    refundAmount: 70400,
    reason: 'Booking cancelled by owner',
    requestDate: '08-Oct-26',
    status: 'Requested',
    paymentMethod: 'Bank transfer · Kotak',
    accountLast4: '1183',
    events: [
      { time: '08-Oct-26 · 10:22', label: 'Refund requested', note: 'Owner confirmed tower crane unavailability.' },
    ],
  },
  {
    id: 'RFD-9005',
    bookingId: 'TB-12005',
    bookingPeriod: '08-Oct-26 → 10-Oct-26',
    customerName: 'Raman Nair',
    customerId: 'CUST-4861',
    customerType: 'Individual / Personal',
    ownerName: 'Marina Machinery',
    ownerId: 'OWN-2220',
    rentalAmount: 6150,
    refundAmount: 6150,
    reason: 'Duplicate payment',
    requestDate: '09-Oct-26',
    status: 'Completed',
    paymentMethod: 'UPI transfer',
    accountLast4: '2093',
    events: [
      { time: '09-Oct-26 · 09:10', label: 'Refund requested', note: 'Charged twice for the compactor hire.' },
      { time: '09-Oct-26 · 12:45', label: 'Moved to under review', note: 'Double charge confirmed in payment ledger.' },
      { time: '10-Oct-26 · 09:30', label: 'Refund approved', note: 'Duplicate charge refund approved.' },
      { time: '10-Oct-26 · 14:20', label: 'Refund processing', note: 'UPI refund initiated.' },
      { time: '11-Oct-26 · 08:15', label: 'Refund completed', note: '₹6,150 credited via UPI.' },
    ],
  },
  {
    id: 'RFD-9006',
    bookingId: 'TB-12009',
    bookingPeriod: '09-Oct-26 → 09-Oct-26',
    customerName: 'Valli Devi',
    customerId: 'CUST-4890',
    customerType: 'Individual / Personal',
    ownerName: 'Kongu Plant Solutions',
    ownerId: 'OWN-2244',
    rentalAmount: 5400,
    refundAmount: 2700,
    reason: 'Booking cancelled by customer',
    requestDate: '09-Oct-26',
    status: 'Rejected',
    paymentMethod: 'Cash settlement',
    accountLast4: '—',
    rejectionReason: 'Service was delivered as booked; cancellation happened after deployment.',
    events: [
      { time: '09-Oct-26 · 17:05', label: 'Refund requested', note: 'Cancelled request raised post slab pour.' },
      { time: '10-Oct-26 · 11:40', label: 'Moved to under review', note: 'Deployment records checked.' },
      { time: '11-Oct-26 · 15:10', label: 'Refund rejected', note: 'Service was delivered as booked; cancellation happened after deployment.' },
    ],
  },
  {
    id: 'RFD-9007',
    bookingId: 'TB-12008',
    bookingPeriod: '05-Oct-26 → 04-Nov-26',
    customerName: 'Hubli Cement Works',
    customerId: 'CUST-4884',
    customerType: 'Company / Project',
    ownerName: 'North Karnataka Rentals',
    ownerId: 'OWN-2238',
    rentalAmount: 129000,
    refundAmount: 64500,
    reason: 'Owner failed to deploy',
    requestDate: '10-Oct-26',
    status: 'Under Review',
    paymentMethod: 'Bank transfer · SBI',
    accountLast4: '6210',
    events: [
      { time: '10-Oct-26 · 13:48', label: 'Refund requested', note: 'Tipper not deployed for first 10 days.' },
      { time: '11-Oct-26 · 09:20', label: 'Moved to under review', note: 'Owner SLA and dispatch logs under review.' },
    ],
  },
  {
    id: 'RFD-9008',
    bookingId: 'TB-12004',
    bookingPeriod: '06-Oct-26 → 05-Nov-26',
    customerName: 'Bengaluru BuildTech',
    customerId: 'CUST-4855',
    customerType: 'Company / Project',
    ownerName: 'Karnataka Earthmovers',
    ownerId: 'OWN-2215',
    rentalAmount: 88488,
    refundAmount: 26546,
    reason: 'Service quality issue',
    requestDate: '10-Oct-26',
    status: 'Approved',
    paymentMethod: 'Bank transfer · Axis',
    accountLast4: '3308',
    events: [
      { time: '10-Oct-26 · 10:25', label: 'Refund requested', note: 'Downtime downtime of 5 days at data-centre site.' },
      { time: '11-Oct-26 · 12:05', label: 'Moved to under review', note: 'Downtime confirmed against maintenance logs.' },
      { time: '12-Oct-26 · 15:35', label: 'Refund approved', note: 'Approved by Finance Admin.' },
    ],
  },
  {
    id: 'RFD-9009',
    bookingId: 'TB-12010',
    bookingPeriod: '11-Oct-26 → 18-Oct-26',
    customerName: 'Nalgonda Irrigation Dept',
    customerId: 'CUST-4896',
    customerType: 'Company / Project',
    ownerName: 'Deccan Heavy Machinery',
    ownerId: 'OWN-2250',
    rentalAmount: 17430,
    refundAmount: 17430,
    reason: 'Booking cancelled by customer',
    requestDate: '11-Oct-26',
    status: 'Completed',
    paymentMethod: 'NEFT · Canara',
    accountLast4: '8715',
    events: [
      { time: '11-Oct-26 · 09:40', label: 'Refund requested', note: 'Works postponed by the irrigation dept.' },
      { time: '11-Oct-26 · 14:10', label: 'Moved to under review', note: 'No cancellation charges apply within window.' },
      { time: '12-Oct-26 · 10:00', label: 'Refund approved', note: 'Approved for full amount.' },
      { time: '12-Oct-26 · 11:45', label: 'Refund processing', note: 'NEFT initiated.' },
      { time: '13-Oct-26 · 09:00', label: 'Refund completed', note: '₹17,430 credited.' },
    ],
  },
  {
    id: 'RFD-9010',
    bookingId: 'TB-12002',
    bookingPeriod: '01-Oct-26 → 30-Dec-26',
    customerName: 'Charminar Infra',
    customerId: 'CUST-4833',
    customerType: 'Company / Project',
    ownerName: 'Sri Krishna Equipment Rentals',
    ownerId: 'OWN-2202',
    rentalAmount: 275910,
    refundAmount: 55182,
    reason: 'Booking cancelled by owner',
    requestDate: '12-Oct-26',
    status: 'Requested',
    paymentMethod: 'Bank transfer · HDFC',
    accountLast4: '9012',
    events: [
      { time: '12-Oct-26 · 12:18', label: 'Refund requested', note: 'Excavator withdrawn from township project.' },
    ],
  },
  {
    id: 'RFD-9011',
    bookingId: 'TB-12012',
    bookingPeriod: '07-Oct-26 → 06-Dec-26',
    customerName: 'Suryapet Solar Farms',
    customerId: 'CUST-4909',
    customerType: 'Company / Project',
    ownerName: 'Greenfield Machinery',
    ownerId: 'OWN-2262',
    rentalAmount: 198000,
    refundAmount: 99000,
    reason: 'Equipment not available',
    requestDate: '12-Oct-26',
    status: 'Rejected',
    paymentMethod: 'Bank transfer · Union',
    accountLast4: '5560',
    rejectionReason: 'Replacement equipment was provided within the SLA window.',
    events: [
      { time: '12-Oct-26 · 15:00', label: 'Refund requested', note: 'Solar park trenching claim for backhoe switch-out.' },
      { time: '13-Oct-26 · 10:30', label: 'Moved to under review', note: 'Replacement dispatch log reviewed.' },
      { time: '13-Oct-26 · 16:20', label: 'Refund rejected', note: 'Replacement equipment was provided within the SLA window.' },
    ],
  },
  {
    id: 'RFD-9012',
    bookingId: 'TB-12007',
    bookingPeriod: '03-Oct-26 → 10-Oct-26',
    customerName: 'Warangal Roads Authority',
    customerId: 'CUST-4878',
    customerType: 'Company / Project',
    ownerName: 'Warangal Earthmovers',
    ownerId: 'OWN-2231',
    rentalAmount: 26600,
    refundAmount: 13300,
    reason: 'Duplicate payment',
    requestDate: '13-Oct-26',
    status: 'Under Review',
    paymentMethod: 'B2B payment gateway',
    accountLast4: '2044',
    events: [
      { time: '13-Oct-26 · 09:15', label: 'Refund requested', note: 'Partial charge duplication noticed for grader hire.' },
      { time: '13-Oct-26 · 13:50', label: 'Moved to under review', note: 'Gateway reconciliation in progress.' },
    ],
  },
]

const statusClass = (status: RefundStatus) =>
  status === 'Completed'
    ? 'completed'
    : status === 'Rejected'
      ? 'cancelled'
      : status === 'Processing' || status === 'Approved'
        ? 'ongoing'
        : 'pending'

const pendingStatuses: RefundStatus[] = ['Requested', 'Under Review', 'Approved', 'Processing']

export default function RefundManagementPage({ onBack }: RefundManagementPageProps) {
  const [refunds, setRefunds] = useState<RefundRecord[]>(initialRefunds)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | RefundStatus | 'Pending'>('All')
  const [sortKey, setSortKey] = useState<'requestDate' | 'refundAmount' | 'customerName' | 'status' | 'id'>('requestDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const pageSize = 5

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  const currentTime = '13-Oct-26 · 18:05'

  const filteredRefunds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return refunds
      .filter((refund) => {
        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Pending' ? pendingStatuses.includes(refund.status) : refund.status === statusFilter)
        if (!matchesStatus) return false
        if (!q) return true
        return (
          refund.id.toLowerCase().includes(q) ||
          refund.bookingId.toLowerCase().includes(q) ||
          refund.customerName.toLowerCase().includes(q) ||
          refund.customerId.toLowerCase().includes(q) ||
          refund.ownerName.toLowerCase().includes(q) ||
          refund.reason.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        let result = 0
        if (sortKey === 'refundAmount') result = a.refundAmount - b.refundAmount
        else if (sortKey === 'customerName') result = a.customerName.localeCompare(b.customerName)
        else if (sortKey === 'status') result = a.status.localeCompare(b.status)
        else if (sortKey === 'id') result = a.id.localeCompare(b.id)
        else result = a.requestDate.localeCompare(b.requestDate)
        return sortDir === 'asc' ? result : -result
      })
  }, [refunds, searchQuery, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredRefunds.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filteredRefunds.slice((safePage - 1) * pageSize, safePage * pageSize)

  const totalRefundAmount = refunds.reduce((total, refund) => total + refund.refundAmount, 0)
  const pendingRefunds = refunds.filter((refund) => pendingStatuses.includes(refund.status))
  const completedRefunds = refunds.filter((refund) => refund.status === 'Completed')
  const rejectedRefunds = refunds.filter((refund) => refund.status === 'Rejected')

  const openRefund = (refund: RefundRecord) => {
    setSelectedRefund(refund)
    setRejectionReason('')
  }

  const closeRefund = () => {
    setSelectedRefund(null)
    setRejectionReason('')
  }

  const applyStatus = (id: string, status: RefundStatus, extraNote?: string) => {
    setRefunds((prev) =>
      prev.map((refund) => {
        if (refund.id !== id) return refund
        const events = [
          ...refund.events,
          { time: currentTime, label: `Refund ${status.toLowerCase()}`, note: extraNote },
        ]
        if (status === 'Approved') {
          events.push({ time: currentTime, label: 'Refund scheduled for processing', note: 'Awaiting payment initiation.' })
        }
        return { ...refund, status, events }
      }),
    )
    setSelectedRefund((prev) => (prev && prev.id === id ? { ...prev, status, events: [...prev.events, { time: currentTime, label: `Refund ${status.toLowerCase()}`, note: extraNote }, ...(status === 'Approved' ? [{ time: currentTime, label: 'Refund scheduled for processing', note: 'Awaiting payment initiation.' }] : [])] } : prev))
    setConfirmAction(null)
    setRejectionReason('')
  }

  const approveRefund = () => {
    if (!confirmAction) return
    applyStatus(confirmAction.id, 'Approved', 'Approved by Super Admin.')
    showToast('Refund request approved.')
  }

  const rejectRefund = () => {
    if (!confirmAction) return
    const reason = rejectionReason.trim()
    if (!reason) return
    setRefunds((prev) =>
      prev.map((refund) =>
        refund.id === confirmAction.id
          ? { ...refund, status: 'Rejected' as RefundStatus, rejectionReason: reason, events: [...refund.events, { time: currentTime, label: 'Refund rejected', note: reason }] }
          : refund,
      ),
    )
    setSelectedRefund((prev) => (prev && prev.id === confirmAction.id ? { ...prev, status: 'Rejected' as RefundStatus, rejectionReason: reason, events: [...prev.events, { time: currentTime, label: 'Refund rejected', note: reason }] } : prev))
    setConfirmAction(null)
    setRejectionReason('')
    showToast('Refund request rejected.')
  }

  const advanceRefund = (id: string) => {
    const refund = refunds.find((item) => item.id === id)
    if (!refund || refund.status === 'Completed' || refund.status === 'Rejected') return
    const nextStatus: RefundStatus = refund.status === 'Approved' ? 'Processing' : 'Completed'
    const note = nextStatus === 'Completed' ? 'Payment credited to the customer.' : 'Payment initiation confirmed.'
    const event = { time: currentTime, label: `Refund ${nextStatus.toLowerCase()}`, note }
    setRefunds((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: nextStatus, events: [...item.events, event] }
          : item,
      ),
    )
    setSelectedRefund((prev) => (prev && prev.id === id ? { ...prev, status: nextStatus, events: [...prev.events, event] } : prev))
    showToast(nextStatus === 'Completed' ? 'Refund marked as completed.' : 'Refund moved to processing.')
  }

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'refundAmount' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  const sortArrow = (key: typeof sortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '')

  const summaryCard = (
    icon: string,
    label: string,
    value: string,
    caption: string,
    accent: 'accent-slate' | 'accent-orange' | 'accent-green' | 'accent-red' | 'accent-blue' | 'accent-purple',
    filterValue: 'All' | 'Pending' | 'Completed' | 'Rejected',
    active: boolean,
  ) => (
    <button
      type="button"
      className={`refund-card ${accent} ${active ? 'selected' : ''}`}
      onClick={() => {
        setStatusFilter(filterValue)
        setPage(1)
      }}
    >
      <span className="refund-card-top"><span className="refund-card-icon">{icon}</span><span>{label}</span></span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </button>
  )

  return (
    <div className="refund-page">
      <style>{`
        .refund-page {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .kpi-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          padding: 0;
          font: inherit;
          font-size: 0.78rem;
          font-weight: 700;
          color: #2563eb;
          cursor: pointer;
        }
        .kpi-detail-back:hover { color: #1d4ed8; text-decoration: underline; }

        .refund-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .refund-card {
          display: grid;
          gap: 6px;
          padding: 16px 18px;
          border-radius: 16px;
          background: linear-gradient(180deg, #fff, #fffdf9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-left: 4px solid rgba(100, 116, 139, 0.5);
          box-shadow: 0 12px 26px -18px rgba(15, 23, 42, 0.4);
          text-align: left;
          font: inherit;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .refund-card strong { font-size: 1.45rem; letter-spacing: -0.03em; }
        .refund-card small { color: var(--muted); }
        .refund-card.selected {
          box-shadow: inset 0 0 0 2px rgba(8, 166, 108, 0.25), 0 12px 26px -18px rgba(15, 23, 42, 0.4);
        }

        .refund-card-top { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; font-weight: 700; color: #475569; }
        .refund-card-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; font-size: 0.72rem; background: rgba(15, 23, 42, 0.08); }

        .refund-card.accent-slate { border-left-color: #64748b; }
        .refund-card.accent-green { border-left-color: #08a66c; }
        .refund-card.accent-green strong { color: #078653; }
        .refund-card.accent-green .refund-card-icon { background: rgba(8, 166, 108, 0.14); color: #078653; }
        .refund-card.accent-red { border-left-color: #ef4444; }
        .refund-card.accent-red strong { color: #dc2626; }
        .refund-card.accent-red .refund-card-icon { background: rgba(239, 68, 68, 0.13); color: #dc2626; }
        .refund-card.accent-orange { border-left-color: var(--brand-orange); }
        .refund-card.accent-orange strong { color: #c94310; }
        .refund-card.accent-orange .refund-card-icon { background: rgba(255, 107, 44, 0.15); color: #c94310; }
        .refund-card.accent-blue { border-left-color: #2563eb; }
        .refund-card.accent-blue strong { color: #1d4ed8; }
        .refund-card.accent-blue .refund-card-icon { background: rgba(37, 99, 235, 0.13); color: #1d4ed8; }
        .refund-card.accent-purple { border-left-color: #7c3aed; }
        .refund-card.accent-purple strong { color: #6d28d9; }
        .refund-card.accent-purple .refund-card-icon { background: rgba(124, 58, 237, 0.13); color: #6d28d9; }

        .refund-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }
        .refund-search {
          flex: 1 1 240px;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          font: inherit;
          font-size: 0.83rem;
          color: var(--text);
        }
        .refund-select {
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text);
        }

        .refund-th {
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }
        .refund-th:hover { color: var(--brand-orange); }

        .refund-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 18px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
        }
        .refund-page-btn {
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          border-radius: 10px;
          padding: 7px 14px;
          font: inherit;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text);
          cursor: pointer;
        }
        .refund-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .refund-page-info { font-size: 0.8rem; color: var(--muted); }

        .refund-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          z-index: 200;
        }
        .refund-detail {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 440px;
          max-width: 92vw;
          background: #fff;
          z-index: 201;
          overflow-y: auto;
          box-shadow: -24px 0 60px -24px rgba(15, 23, 42, 0.5);
        }
        .refund-detail-inner { display: grid; gap: 16px; padding: 20px; }
        .refund-detail-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .refund-close {
          border: 0;
          background: rgba(15, 23, 42, 0.06);
          color: var(--text);
          border-radius: 10px;
          width: 34px;
          height: 34px;
          font-size: 1rem;
          cursor: pointer;
        }

        .refund-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .refund-info-item {
          display: grid;
          gap: 3px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.04);
        }
        .refund-info-item span { font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
        .refund-info-item strong { font-size: 0.85rem; }

        .refund-timeline { display: grid; gap: 0; }
        .refund-event {
          position: relative;
          padding-left: 20px;
          padding-bottom: 14px;
        }
        .refund-event::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 4px;
          bottom: 0;
          width: 2px;
          background: rgba(15, 23, 42, 0.1);
        }
        .refund-event:last-child::before { bottom: auto; height: 8px; }
        .refund-event::after {
          content: '';
          position: absolute;
          left: 1px;
          top: 5px;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #cbd5e1;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
        }
        .refund-event.done::after { background: #08a66c; }
        .refund-event.rejected::after { background: #ef4444; }
        .refund-event strong { display: block; font-size: 0.85rem; }
        .refund-event time { font-size: 0.7rem; color: var(--muted); display: block; margin-bottom: 3px; }
        .refund-event p { margin: 0; font-size: 0.75rem; color: #475569; line-height: 1.45; }

        .refund-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 4px;
        }
        .refund-btn {
          border: 1px solid rgba(8, 166, 108, 0.35);
          background: #fff;
          color: #078653;
          border-radius: 10px;
          padding: 9px 16px;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
        }
        .refund-btn.danger { border-color: rgba(239, 68, 68, 0.35); color: #dc2626; }
        .refund-btn.primary { background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep)); color: #fff; border-color: transparent; }
        .refund-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .refund-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          z-index: 220;
          display: grid;
          place-items: center;
        }
        .refund-modal {
          width: 440px;
          max-width: 92vw;
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          display: grid;
          gap: 14px;
          box-shadow: 0 30px 80px -30px rgba(15, 23, 42, 0.6);
        }
        .refund-modal h3 { margin: 0; font-size: 1.05rem; }
        .refund-modal p { margin: 0; color: var(--muted); font-size: 0.85rem; line-height: 1.5; }
        .refund-modal textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 90px;
          resize: vertical;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          font: inherit;
          font-size: 0.85rem;
          color: var(--text);
        }
        .refund-modal-row { display: flex; justify-content: flex-end; gap: 10px; }

        .refund-toast {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #fff;
          padding: 11px 18px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          z-index: 300;
          box-shadow: 0 16px 40px -16px rgba(15, 23, 42, 0.7);
        }

        .refund-note {
          margin: 0;
          padding: 0 18px 18px;
          color: #64748b;
          font-size: 0.78rem;
          line-height: 1.5;
        }
      `}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="kpi-detail-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          <p className="header-kicker">Finance / Refund Management</p>
          <h1 className="header-title">Refund Management</h1>
          <div className="header-breadcrumb">Finance / Refund Management / Dashboard</div>
        </div>
        <span className="chip active">Payments active</span>
      </header>

      <section className="refund-summary-grid" aria-label="Refund dashboard summary">
        {summaryCard('₹', 'Total refunds', `₹${totalRefundAmount.toLocaleString('en-IN')}`, `${refunds.length} requests tracked`, 'accent-slate', 'All', statusFilter === 'All')}
        {summaryCard('⏳', 'Pending refunds', String(pendingRefunds.length), 'Requested · Under review · Approved · Processing', 'accent-orange', 'Pending', statusFilter === 'Pending')}
        {summaryCard('✓', 'Completed refunds', String(completedRefunds.length), 'Successfully settled', 'accent-green', 'Completed', statusFilter === 'Completed')}
        {summaryCard('✕', 'Rejected refunds', String(rejectedRefunds.length), 'Denied with reason', 'accent-red', 'Rejected', statusFilter === 'Rejected')}
      </section>

      <section className="panel" aria-labelledby="refund-requests-title">
        <div className="panel-header">
          <div>
            <h3 id="refund-requests-title">Refund requests</h3>
            <span className="health-meta">Showing {filteredRefunds.length} of {refunds.length} requests</span>
          </div>
          <div className="refund-toolbar">
            <input
              className="refund-search"
              type="search"
              placeholder="Search by refund ID, booking, customer, owner or reason..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(1)
              }}
              aria-label="Search refund requests"
            />
            <select
              className="refund-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as typeof statusFilter)
                setPage(1)
              }}
              aria-label="Filter refunds by status"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Requested">Requested</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="chart-wrap kpi-detail-table-wrap">
          <table className="state-table kpi-detail-table">
            <thead>
              <tr>
                <th className="refund-th" onClick={() => toggleSort('id')}>Refund ID{sortArrow('id')}</th>
                <th>Booking</th>
                <th className="refund-th" onClick={() => toggleSort('customerName')}>Customer{sortArrow('customerName')}</th>
                <th>Owner</th>
                <th>Rental</th>
                <th className="refund-th" onClick={() => toggleSort('refundAmount')}>Refund amount{sortArrow('refundAmount')}</th>
                <th>Reason</th>
                <th className="refund-th" onClick={() => toggleSort('requestDate')}>Request date{sortArrow('requestDate')}</th>
                <th className="refund-th" onClick={() => toggleSort('status')}>Status{sortArrow('status')}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((refund) => (
                <tr key={refund.id}>
                  <td><strong>{refund.id}</strong></td>
                  <td>{refund.bookingId}</td>
                  <td>
                    <span className="booking-record-entity">
                      <span>{refund.customerName}</span>
                      <small>{refund.customerId} · {refund.customerType === 'Individual / Personal' ? 'Individual' : 'Company'}</small>
                    </span>
                  </td>
                  <td>
                    <span className="booking-record-entity">
                      <span>{refund.ownerName}</span>
                      <small>{refund.ownerId}</small>
                    </span>
                  </td>
                  <td>₹{refund.rentalAmount.toLocaleString('en-IN')}</td>
                  <td><strong>₹{refund.refundAmount.toLocaleString('en-IN')}</strong></td>
                  <td className="operator-record-details">{refund.reason}</td>
                  <td>{refund.requestDate}</td>
                  <td><span className={`booking-date-status ${statusClass(refund.status)}`}>{refund.status}</span></td>
                  <td>
                    <button type="button" className="refund-btn" onClick={() => openRefund(refund)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRefunds.length === 0 && (
          <p className="refund-note">No refund requests match the current search or filters.</p>
        )}

        <div className="refund-pagination">
          <button type="button" className="refund-page-btn" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
          <span className="refund-page-info">Page {safePage} of {totalPages} · {pageSize} per page</span>
          <button type="button" className="refund-page-btn" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
        </div>
      </section>

      {selectedRefund && (
        <>
          <div className="refund-backdrop" onClick={closeRefund} />
          <aside className="refund-detail" aria-label={`Refund details for ${selectedRefund.id}`}>
            <div className="refund-detail-inner">
              <div className="refund-detail-head">
                <div>
                  <p className="header-kicker">Refund request</p>
                  <h3 style={{ margin: 0 }}>{selectedRefund.id}</h3>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>Booking {selectedRefund.bookingId}</div>
                </div>
                <button type="button" className="refund-close" onClick={closeRefund} aria-label="Close refund details">✕</button>
              </div>

              <span className={`booking-date-status ${statusClass(selectedRefund.status)}`}>{selectedRefund.status}</span>

              <div className="refund-info-grid">
                <div className="refund-info-item"><span>Customer</span><strong>{selectedRefund.customerName}</strong></div>
                <div className="refund-info-item"><span>Customer ID</span><strong>{selectedRefund.customerId}</strong></div>
                <div className="refund-info-item"><span>Customer type</span><strong>{selectedRefund.customerType}</strong></div>
                <div className="refund-info-item"><span>Owner</span><strong>{selectedRefund.ownerName}</strong></div>
                <div className="refund-info-item"><span>Owner ID</span><strong>{selectedRefund.ownerId}</strong></div>
                <div className="refund-info-item"><span>Booking period</span><strong>{selectedRefund.bookingPeriod}</strong></div>
                <div className="refund-info-item"><span>Rental amount</span><strong>₹{selectedRefund.rentalAmount.toLocaleString('en-IN')}</strong></div>
                <div className="refund-info-item"><span>Refund amount</span><strong>₹{selectedRefund.refundAmount.toLocaleString('en-IN')}</strong></div>
                <div className="refund-info-item"><span>Payment method</span><strong>{selectedRefund.paymentMethod}</strong></div>
                <div className="refund-info-item"><span>Account ending</span><strong>{selectedRefund.accountLast4}</strong></div>
              </div>

              <div className="refund-info-item">
                <span>Refund reason</span>
                <strong style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedRefund.reason}</strong>
              </div>

              {selectedRefund.status === 'Rejected' && selectedRefund.rejectionReason && (
                <div className="refund-info-item" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
                  <span>Rejection reason</span>
                  <strong style={{ fontWeight: 600, fontSize: '0.85rem', color: '#b91c1c' }}>{selectedRefund.rejectionReason}</strong>
                </div>
              )}

              <div>
                <div className="panel-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Refund timeline</h3>
                  </div>
                </div>
                <div className="refund-timeline">
                  {selectedRefund.events.map((event, index) => (
                    <div key={index} className={`refund-event ${event.label === 'Refund rejected' ? 'rejected' : event.label.startsWith('Refund completed') || event.label.startsWith('Refund moved') ? '' : index < selectedRefund.events.length - 1 ? 'done' : ''}`}>
                      <time>{event.time}</time>
                      <strong>{event.label}</strong>
                      {event.note && <p>{event.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="refund-actions">
                {(selectedRefund.status === 'Requested' || selectedRefund.status === 'Under Review') && (
                  <>
                    <button type="button" className="refund-btn primary" onClick={() => { setConfirmAction({ type: 'approve', id: selectedRefund.id }); setRejectionReason('') }}>Approve refund</button>
                    <button type="button" className="refund-btn danger" onClick={() => { setConfirmAction({ type: 'reject', id: selectedRefund.id }); setRejectionReason('') }}>Reject</button>
                  </>
                )}
                {selectedRefund.status === 'Approved' && (
                  <button type="button" className="refund-btn primary" onClick={() => advanceRefund(selectedRefund.id)}>Begin processing</button>
                )}
                {selectedRefund.status === 'Processing' && (
                  <button type="button" className="refund-btn primary" onClick={() => advanceRefund(selectedRefund.id)}>Mark completed</button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      {confirmAction && (
        <div className="refund-modal-backdrop" onClick={() => { setConfirmAction(null); setRejectionReason('') }}>
          <div className="refund-modal" role="dialog" aria-modal="true" aria-label={confirmAction.type === 'approve' ? 'Confirm refund approval' : 'Reject refund request'} onClick={(event) => event.stopPropagation()}>
            {confirmAction.type === 'approve' ? (
              <>
                <h3>Approve refund request?</h3>
                <p>Refund <strong>{refunds.find((refund) => refund.id === confirmAction.id)?.refundAmount.toLocaleString('en-IN')}</strong> ₹ for {refunds.find((refund) => refund.id === confirmAction.id)?.bookingId}. The refund will move to Approved and can be processed from the detail panel.</p>
                <div className="refund-modal-row">
                  <button type="button" className="refund-btn danger" onClick={() => { setConfirmAction(null); setRejectionReason('') }}>Cancel</button>
                  <button type="button" className="refund-btn primary" onClick={approveRefund}>Confirm approve</button>
                </div>
              </>
            ) : (
              <>
                <h3>Reject refund request?</h3>
                <p>Provide a reason. The customer and owner will be notified of the rejection.</p>
                <textarea
                  placeholder="Reason for rejection..."
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  aria-label="Rejection reason"
                />
                <div className="refund-modal-row">
                  <button type="button" className="refund-btn danger" onClick={() => { setConfirmAction(null); setRejectionReason('') }}>Cancel</button>
                  <button type="button" className="refund-btn primary" disabled={!rejectionReason.trim()} onClick={rejectRefund}>Confirm reject</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="refund-toast" role="status">{toast}</div>}
    </div>
  )
}