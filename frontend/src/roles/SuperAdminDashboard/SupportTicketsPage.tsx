import { useMemo, useState } from 'react'

type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
type TicketCategory = 'Booking' | 'Payment' | 'Refund' | 'Vehicle' | 'Documents' | 'Account' | 'Other'
type TicketStatus = 'Open' | 'In Progress' | 'Waiting for Response' | 'Resolved' | 'Closed'

type TicketMessage = {
  id: number
  author: string
  authorRole: 'Customer' | 'Owner' | 'Support'
  time: string
  body: string
  attachments?: string[]
}

type TicketAttachment = {
  name: string
  size: string
}

type TicketEvent = {
  time: string
  activity: string
}

type TicketRecord = {
  id: string
  subject: string
  customerName: string
  customerId: string
  customerType: 'Company / Project' | 'Individual / Personal'
  ownerName: string
  category: TicketCategory
  priority: TicketPriority
  assignedTo: string
  createdDate: string
  lastUpdated: string
  status: TicketStatus
  messages: TicketMessage[]
  internalNotes: { time: string; note: string }[]
  attachments: TicketAttachment[]
  activity: TicketEvent[]
}

type SupportTicketsPageProps = {
  onBack: () => void
}

const supportStaff = ['Rahul Verma', 'Sneha Kulkarni', 'Arjun Nair', 'Priya Sharma', 'Nikhil Joshi']

const priorityClass = (priority: TicketPriority) =>
  priority === 'Urgent'
    ? 'urgent'
    : priority === 'High'
      ? 'high'
      : priority === 'Medium'
        ? 'medium'
        : 'low'

const priorityOrder: Record<TicketPriority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 }
const levelStyle = (priority: TicketPriority) => {
  const { color, bg } =
    priority === 'Urgent'
      ? { color: '#b91c1c', bg: 'rgba(239,68,68,0.12)' }
      : priority === 'High'
        ? { color: '#c2410c', bg: 'rgba(249,115,22,0.12)' }
        : priority === 'Medium'
          ? { color: '#1d4ed8', bg: 'rgba(37,99,235,0.11)' }
          : { color: '#16a34a', bg: 'rgba(22,163,74,0.11)' }
  return { color, bg }
}

const initialTickets: TicketRecord[] = [
  {
    id: 'TKT-1101',
    subject: 'Excavator not delivered on time',
    customerName: 'Pune Metro Contractors',
    customerId: 'CUST-4840',
    customerType: 'Company / Project',
    ownerName: 'Sahyadri Plant Hire',
    category: 'Vehicle',
    priority: 'Urgent',
    assignedTo: 'Rahul Verma',
    createdDate: '02-Oct-26',
    lastUpdated: '05-Oct-26 · 14:30',
    status: 'Resolved',
    messages: [
      { id: 1, author: 'Pune Metro Contractors', authorRole: 'Customer', time: '02-Oct-26 · 09:12', body: 'The excavator for TB-12003 has not reached site. Deployment was promised by 8 AM.', attachments: ['booking_id.png'] },
      { id: 2, author: 'Rahul Verma', authorRole: 'Support', time: '02-Oct-26 · 10:40', body: 'Escalated to the owner dispatch team. Tracking the vehicle location now.' },
      { id: 3, author: 'Support Team', authorRole: 'Support', time: '04-Oct-26 · 16:05', body: 'Machine delivered and accepted. Compensatory discount applied for the delay and refund #RFD-9002 opened.', attachments: ['delivery_log.pdf'] },
    ],
    internalNotes: [
      { time: '03-Oct-26 · 11:00', note: 'Owner SLA penalty applies — confirm discount percentage with business team.' },
    ],
    attachments: [{ name: 'booking_id.png', size: '412 KB' }, { name: 'delivery_log.pdf', size: '130 KB' }],
    activity: [
      { time: '02-Oct-26 · 09:12', activity: 'Ticket created by Pune Metro Contractors' },
      { time: '02-Oct-26 · 10:40', activity: 'Assigned to Rahul Verma' },
      { time: '04-Oct-26 · 16:05', activity: 'Marked as resolved by Support Team' },
    ],
  },
  {
    id: 'TKT-1102',
    subject: 'Double charge applied on booking TB-12004',
    customerName: 'Bengaluru BuildTech',
    customerId: 'CUST-4855',
    customerType: 'Company / Project',
    ownerName: 'Karnataka Earthmovers',
    category: 'Payment',
    priority: 'High',
    assignedTo: 'Sneha Kulkarni',
    createdDate: '03-Oct-26',
    lastUpdated: '13-Oct-26 · 10:15',
    status: 'Open',
    messages: [
      { id: 1, author: 'Bengaluru BuildTech', authorRole: 'Customer', time: '03-Oct-26 · 18:22', body: 'Our account was charged twice for the JCB hire. Please issue a refund for the duplicate payment.', attachments: ['payment_receipts.pdf'] },
      { id: 2, author: 'Sneha Kulkarni', authorRole: 'Support', time: '04-Oct-26 · 11:30', body: 'Confirmed the duplicate in the payment ledger. Refund request RFD-9008 has been raised in parallel.' },
    ],
    internalNotes: [
      { time: '05-Oct-26 · 09:15', note: 'Double charge confirmed. Coordinate with finance so refund is prioritized.' },
    ],
    attachments: [{ name: 'payment_receipts.pdf', size: '890 KB' }],
    activity: [
      { time: '03-Oct-26 · 18:22', activity: 'Ticket created by Bengaluru BuildTech' },
      { time: '04-Oct-26 · 11:30', activity: 'Assigned to Sneha Kulkarni' },
    ],
  },
  {
    id: 'TKT-1103',
    subject: 'Refund status for RFD-9007',
    customerName: 'Hubli Cement Works',
    customerId: 'CUST-4884',
    customerType: 'Company / Project',
    ownerName: 'North Karnataka Rentals',
    category: 'Refund',
    priority: 'High',
    assignedTo: 'Rahul Verma',
    createdDate: '04-Oct-26',
    lastUpdated: '12-Oct-26 · 15:40',
    status: 'In Progress',
    messages: [
      { id: 1, author: 'Hubli Cement Works', authorRole: 'Customer', time: '05-Oct-26 · 08:50', body: 'When will the refund for RFD-9007 be settled? Our accounts team needs an ETA.', attachments: ['rfd-9007-screenshot.png'] },
      { id: 2, author: 'Rahul Verma', authorRole: 'Support', time: '06-Oct-26 · 13:10', body: 'Refund is under review for owner SLA. I have escalated it and will update you by Friday.' },
    ],
    internalNotes: [
      { time: '07-Oct-26 · 10:30', note: 'Waiting on owner confirmation of dispatch failure. Follow up on Friday.' },
    ],
    attachments: [{ name: 'rfd-9007-screenshot.png', size: '226 KB' }],
    activity: [
      { time: '05-Oct-26 · 08:50', activity: 'Ticket created by Hubli Cement Works' },
      { time: '06-Oct-26 · 13:10', activity: 'Assigned to Rahul Verma' },
      { time: '08-Oct-26 · 09:20', activity: 'Moved to In Progress' },
    ],
  },
  {
    id: 'TKT-1104',
    subject: 'Document verification pending for account',
    customerName: 'Raman Nair',
    customerId: 'CUST-4861',
    customerType: 'Individual / Personal',
    ownerName: 'Marina Machinery',
    category: 'Account',
    priority: 'Medium',
    assignedTo: 'Priya Sharma',
    createdDate: '05-Oct-26',
    lastUpdated: '11-Oct-26 · 12:00',
    status: 'Waiting for Response',
    messages: [
      { id: 1, author: 'Raman Nair', authorRole: 'Customer', time: '05-Oct-26 · 19:02', body: 'My ID proof resubmission was done two days ago. Why is it still unverified?', attachments: ['aadhar.jpeg'] },
      { id: 2, author: 'Priya Sharma', authorRole: 'Support', time: '06-Oct-26 · 10:20', body: 'Thanks, we received the resubmission. KYC team will verify within 24 hours.' },
      { id: 3, author: 'Priya Sharma', authorRole: 'Support', time: '11-Oct-26 · 12:00', body: 'Could you share a clearer scan of the address page? The current upload is partially blurred.' },
    ],
    internalNotes: [
      { time: '07-Oct-26 · 09:45', note: 'Document clarity issue — requested resubmission of address page.' },
    ],
    attachments: [{ name: 'aadhar.jpeg', size: '1.2 MB' }],
    activity: [
      { time: '05-Oct-26 · 19:02', activity: 'Ticket created by Raman Nair' },
      { time: '06-Oct-26 · 10:20', activity: 'Assigned to Priya Sharma' },
      { time: '11-Oct-26 · 12:00', activity: 'Marked as Waiting for Response' },
    ],
  },
  {
    id: 'TKT-1105',
    subject: 'Operator damaged driveway surface',
    customerName: 'Valli Devi',
    customerId: 'CUST-4890',
    customerType: 'Individual / Personal',
    ownerName: 'Kongu Plant Solutions',
    category: 'Other',
    priority: 'Low',
    assignedTo: 'Arjun Nair',
    createdDate: '06-Oct-26',
    lastUpdated: '09-Oct-26 · 17:50',
    status: 'Closed',
    messages: [
      { id: 1, author: 'Valli Devi', authorRole: 'Customer', time: '06-Oct-26 · 09:30', body: 'The compactor left scuffs on the driveway while turning around.', attachments: ['scuff_photo.jpg'] },
      { id: 2, author: 'Arjun Nair', authorRole: 'Support', time: '06-Oct-26 · 16:20', body: 'We received the photos. Owner has agreed to cover a polishing claim.' },
      { id: 3, author: 'Valli Devi', authorRole: 'Customer', time: '08-Oct-26 · 11:10', body: 'Polishing done, claim settled. Thank you.' },
    ],
    internalNotes: [
      { time: '07-Oct-26 · 14:00', note: 'Owner liability confirmed. Claim settled offline, ticket to be closed.' },
    ],
    attachments: [{ name: 'scuff_photo.jpg', size: '540 KB' }],
    activity: [
      { time: '06-Oct-26 · 09:30', activity: 'Ticket created by Valli Devi' },
      { time: '06-Oct-26 · 16:20', activity: 'Assigned to Arjun Nair' },
      { time: '09-Oct-26 · 17:50', activity: 'Closed by Support Team' },
    ],
  },
  {
    id: 'TKT-1106',
    subject: 'Booking period extension request TB-12011',
    customerName: 'Mumbai Coastal Builders',
    customerId: 'CUST-4902',
    customerType: 'Company / Project',
    ownerName: 'Sahyadri Plant Hire',
    category: 'Booking',
    priority: 'Medium',
    assignedTo: 'Sneha Kulkarni',
    createdDate: '06-Oct-26',
    lastUpdated: '12-Oct-26 · 16:30',
    status: 'In Progress',
    messages: [
      { id: 1, author: 'Mumbai Coastal Builders', authorRole: 'Customer', time: '06-Oct-26 · 15:42', body: 'Our sea-wall project is running late. Can we extend TB-12011 by 7 days?', attachments: ['extension_request.docx'] },
      { id: 2, author: 'Sneha Kulkarni', authorRole: 'Support', time: '07-Oct-26 · 09:00', body: 'Extension request shared with the owner for availability confirmation.' },
    ],
    internalNotes: [
      { time: '09-Oct-26 · 11:20', note: 'Owner confirmed availability. Rate renegotiation needed for the extended days.' },
    ],
    attachments: [{ name: 'extension_request.docx', size: '88 KB' }],
    activity: [
      { time: '06-Oct-26 · 15:42', activity: 'Ticket created by Mumbai Coastal Builders' },
      { time: '07-Oct-26 · 09:00', activity: 'Assigned to Sneha Kulkarni' },
      { time: '09-Oct-26 · 11:20', activity: 'Moved to In Progress' },
    ],
  },
  {
    id: 'TKT-1107',
    subject: 'Invoice GST mismatch for tower crane',
    customerName: 'Delhi Urban Infra',
    customerId: 'CUST-4870',
    customerType: 'Company / Project',
    ownerName: 'Capital Equipment Bank',
    category: 'Payment',
    priority: 'Urgent',
    assignedTo: 'Nikhil Joshi',
    createdDate: '08-Oct-26',
    lastUpdated: '13-Oct-26 · 09:10',
    status: 'Open',
    messages: [
      { id: 1, author: 'Delhi Urban Infra', authorRole: 'Customer', time: '08-Oct-26 · 12:35', body: 'Invoice INV-TC4402 shows 18% GST but our PO confirms 12%. Please correct before month-end filing.', attachments: ['inv-tc4402.pdf'] },
      { id: 2, author: 'Nikhil Joshi', authorRole: 'Support', time: '08-Oct-26 · 17:45', body: 'Raised with finance. A revised invoice will be issued within 2 business days.' },
    ],
    internalNotes: [
      { time: '10-Oct-26 · 10:00', note: 'Rate card mismatch in GST config. Finance to re-issue invoice; confirm before EOD 15 Oct.' },
    ],
    attachments: [{ name: 'inv-tc4402.pdf', size: '180 KB' }],
    activity: [
      { time: '08-Oct-26 · 12:35', activity: 'Ticket created by Delhi Urban Infra' },
      { time: '08-Oct-26 · 17:45', activity: 'Assigned to Nikhil Joshi' },
    ],
  },
  {
    id: 'TKT-1108',
    subject: 'PUC certificate expired for tipper',
    customerName: 'Nalgonda Irrigation Dept',
    customerId: 'CUST-4896',
    customerType: 'Company / Project',
    ownerName: 'Deccan Heavy Machinery',
    category: 'Documents',
    priority: 'High',
    assignedTo: 'Arjun Nair',
    createdDate: '09-Oct-26',
    lastUpdated: '11-Oct-26 · 18:05',
    status: 'Resolved',
    messages: [
      { id: 1, author: 'Nalgonda Irrigation Dept', authorRole: 'Customer', time: '09-Oct-26 · 10:05', body: 'The tipper on site has an expired PUC. Government sites cannot run without a valid certificate.', attachments: ['puc_copy.jpg'] },
      { id: 2, author: 'Arjun Nair', authorRole: 'Support', time: '09-Oct-26 · 15:30', body: 'Owner has been notified. Replacement certificate collected and uploaded to the vehicle record.' },
      { id: 3, author: 'Support Team', authorRole: 'Support', time: '11-Oct-26 · 18:05', body: 'PUC renewed and verified. Ticket resolved.' },
    ],
    internalNotes: [
      { time: '10-Oct-26 · 12:40', note: 'PUC renewed at test centre, uploaded. Remind owner about compliance tracking feature.' },
    ],
    attachments: [{ name: 'puc_copy.jpg', size: '311 KB' }, { name: 'puc_renewed.pdf', size: '95 KB' }],
    activity: [
      { time: '09-Oct-26 · 10:05', activity: 'Ticket created by Nalgonda Irrigation Dept' },
      { time: '09-Oct-26 · 15:30', activity: 'Assigned to Arjun Nair' },
      { time: '11-Oct-26 · 18:05', activity: 'Marked as resolved by Support Team' },
    ],
  },
  {
    id: 'TKT-1109',
    subject: 'Unable to update firm GSTIN',
    customerName: 'Sri Krishna Projects',
    customerId: 'CUST-4821',
    customerType: 'Company / Project',
    ownerName: 'Deccan Heavy Machinery',
    category: 'Account',
    priority: 'Medium',
    assignedTo: 'Priya Sharma',
    createdDate: '10-Oct-26',
    lastUpdated: '13-Oct-26 · 08:40',
    status: 'Open',
    messages: [
      { id: 1, author: 'Sri Krishna Projects', authorRole: 'Customer', time: '10-Oct-26 · 13:22', body: 'We are unable to update our GSTIN in the account settings. The save button does nothing.', attachments: ['gstin_form.png'] },
      { id: 2, author: 'Priya Sharma', authorRole: 'Support', time: '11-Oct-26 · 09:35', body: 'We reproduced the issue. Engineering has been notified for the settings form.' },
    ],
    internalNotes: [
      { time: '12-Oct-26 · 16:00', note: 'Bug reproduced on production. Track in engineering board; temporary workaround for customer in 2 days.' },
    ],
    attachments: [{ name: 'gstin_form.png', size: '402 KB' }],
    activity: [
      { time: '10-Oct-26 · 13:22', activity: 'Ticket created by Sri Krishna Projects' },
      { time: '11-Oct-26 · 09:35', activity: 'Assigned to Priya Sharma' },
      { time: '12-Oct-26 · 16:00', activity: 'Bug escalated to engineering' },
    ],
  },
  {
    id: 'TKT-1110',
    subject: 'Safety gear missing on grader',
    customerName: 'Warangal Roads Authority',
    customerId: 'CUST-4878',
    customerType: 'Company / Project',
    ownerName: 'Warangal Earthmovers',
    category: 'Vehicle',
    priority: 'Low',
    assignedTo: 'Nikhil Joshi',
    createdDate: '11-Oct-26',
    lastUpdated: '12-Oct-26 · 14:20',
    status: 'Closed',
    messages: [
      { id: 1, author: 'Warangal Roads Authority', authorRole: 'Customer', time: '11-Oct-26 · 08:15', body: 'The grader arrived without safety cones and signage.', attachments: ['grader_photo.jpg'] },
      { id: 2, author: 'Nikhil Joshi', authorRole: 'Support', time: '11-Oct-26 · 12:00', body: 'Owner dispatched safety cone kit to site within the day.' },
      { id: 3, author: 'Warangal Roads Authority', authorRole: 'Customer', time: '12-Oct-26 · 14:20', body: 'Received. No further action needed.' },
    ],
    internalNotes: [
      { time: '11-Oct-26 · 17:30', note: 'SLA compliance check on owner — add safety-checklist to dispatch checklist.' },
    ],
    attachments: [{ name: 'grader_photo.jpg', size: '287 KB' }],
    activity: [
      { time: '11-Oct-26 · 08:15', activity: 'Ticket created by Warangal Roads Authority' },
      { time: '11-Oct-26 · 12:00', activity: 'Assigned to Nikhil Joshi' },
      { time: '12-Oct-26 · 14:20', activity: 'Closed by Support Team' },
    ],
  },
  {
    id: 'TKT-1111',
    subject: 'Duplicate refund ticket confusion',
    customerName: 'Suryapet Solar Farms',
    customerId: 'CUST-4909',
    customerType: 'Company / Project',
    ownerName: 'Greenfield Machinery',
    category: 'Refund',
    priority: 'Medium',
    assignedTo: 'Sneha Kulkarni',
    createdDate: '12-Oct-26',
    lastUpdated: '13-Oct-26 · 11:20',
    status: 'Waiting for Response',
    messages: [
      { id: 1, author: 'Suryapet Solar Farms', authorRole: 'Customer', time: '12-Oct-26 · 16:48', body: 'We raised RFD-9011 yesterday but the portal shows another ticket now. Which is active?', attachments: ['portal_screenshot.png'] },
      { id: 2, author: 'Sneha Kulkarni', authorRole: 'Support', time: '13-Oct-26 · 11:20', body: 'Please share the ticket number from the portal so we can merge the duplicate entry.' },
    ],
    internalNotes: [
      { time: '13-Oct-26 · 11:25', note: 'Awaiting portal ticket number from customer to merge duplicates.' },
    ],
    attachments: [{ name: 'portal_screenshot.png', size: '350 KB' }],
    activity: [
      { time: '12-Oct-26 · 16:48', activity: 'Ticket created by Suryapet Solar Farms' },
      { time: '13-Oct-26 · 11:20', activity: 'Assigned to Sneha Kulkarni' },
      { time: '13-Oct-26 · 11:20', activity: 'Marked as Waiting for Response' },
    ],
  },
  {
    id: 'TKT-1112',
    subject: 'Dispatch photobook unavailable',
    customerName: 'Charminar Infra',
    customerId: 'CUST-4833',
    customerType: 'Company / Project',
    ownerName: 'Sri Krishna Equipment Rentals',
    category: 'Documents',
    priority: 'Low',
    assignedTo: 'Rahul Verma',
    createdDate: '13-Oct-26',
    lastUpdated: '13-Oct-26 · 09:05',
    status: 'Open',
    messages: [
      { id: 1, author: 'Charminar Infra', authorRole: 'Customer', time: '13-Oct-26 · 09:05', body: 'The dispatch photobook for the excavator batch is not visible in the job documents.' },
    ],
    internalNotes: [],
    attachments: [],
    activity: [
      { time: '13-Oct-26 · 09:05', activity: 'Ticket created by Charminar Infra' },
      { time: '13-Oct-26 · 09:20', activity: 'Assigned to Rahul Verma' },
    ],
  },
]

const statusClass = (status: TicketStatus) =>
  status === 'Resolved' || status === 'Closed'
    ? 'completed'
    : status === 'Open'
      ? 'ongoing'
      : 'pending'

export default function SupportTicketsPage({ onBack }: SupportTicketsPageProps) {
  const [tickets, setTickets] = useState<TicketRecord[]>(initialTickets)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All')
  const [categoryFilter, setCategoryFilter] = useState<'All' | TicketCategory>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | TicketPriority>('All')
  const [quickFilter, setQuickFilter] = useState<'total' | 'open' | 'in-progress' | 'resolved' | 'high-priority'>('total')
  const [sortKey, setSortKey] = useState<'createdDate' | 'priority' | 'lastUpdated' | 'id'>('lastUpdated')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const pageSize = 5

  const currentTime = '13-Oct-26 · 18:35'

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  const applyQuick = (quick: typeof quickFilter) => {
    setQuickFilter(quick)
    setStatusFilter('All')
    setCategoryFilter('All')
    setPriorityFilter('All')
    setPage(1)
  }

  const selectDropdown = (setter: (value: never) => void) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    setQuickFilter('total')
    setter(event.target.value as never)
    setPage(1)
  }

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tickets
      .filter((ticket) => {
        const matchesQuick =
          quickFilter === 'total' ||
          (quickFilter === 'open'
            ? ticket.status === 'Open'
            : quickFilter === 'in-progress'
              ? ticket.status === 'In Progress'
              : quickFilter === 'resolved'
                ? ticket.status === 'Resolved'
                : ticket.priority === 'High' || ticket.priority === 'Urgent')
        if (!matchesQuick) return false
        if (statusFilter !== 'All' && ticket.status !== statusFilter) return false
        if (categoryFilter !== 'All' && ticket.category !== categoryFilter) return false
        if (priorityFilter !== 'All' && ticket.priority !== priorityFilter) return false
        if (!q) return true
        return (
          ticket.id.toLowerCase().includes(q) ||
          ticket.subject.toLowerCase().includes(q) ||
          ticket.customerName.toLowerCase().includes(q) ||
          ticket.customerId.toLowerCase().includes(q) ||
          ticket.ownerName.toLowerCase().includes(q) ||
          ticket.assignedTo.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        let result = 0
        if (sortKey === 'priority') result = priorityOrder[a.priority] - priorityOrder[b.priority]
        else if (sortKey === 'createdDate') result = a.createdDate.localeCompare(b.createdDate)
        else if (sortKey === 'id') result = a.id.localeCompare(b.id)
        else result = a.lastUpdated.localeCompare(b.lastUpdated)
        return sortDir === 'asc' ? result : -result
      })
  }, [tickets, searchQuery, quickFilter, statusFilter, categoryFilter, priorityFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filteredTickets.slice((safePage - 1) * pageSize, safePage * pageSize)

  const selected = selectedId ? tickets.find((ticket) => ticket.id === selectedId) ?? null : null

  const updateTicket = (id: string, updater: (ticket: TicketRecord) => TicketRecord) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? updater(ticket) : ticket)))
  }

  const changePriority = (id: string, priority: TicketPriority) => {
    updateTicket(id, (ticket) => ({
      ...ticket,
      priority,
      lastUpdated: currentTime,
      activity: [...ticket.activity, { time: currentTime, activity: `Priority changed to ${priority}` }],
    }))
    showToast(`Priority updated to ${priority}.`)
  }

  const assignTicket = (id: string, assignedTo: string) => {
    updateTicket(id, (ticket) => ({
      ...ticket,
      assignedTo,
      lastUpdated: currentTime,
      activity: [...ticket.activity, { time: currentTime, activity: `Assigned to ${assignedTo}` }],
    }))
    showToast(`Ticket assigned to ${assignedTo}.`)
  }

  const changeStatus = (id: string, status: TicketStatus) => {
    updateTicket(id, (ticket) => ({
      ...ticket,
      status,
      lastUpdated: currentTime,
      activity: [...ticket.activity, { time: currentTime, activity: `Status changed to ${status}` }],
    }))
    showToast(`Status set to ${status}.`)
  }

  const sendReply = (id: string) => {
    const body = replyDraft.trim()
    if (!body) return
    const messageId = Math.max(0, ...(tickets.find((t) => t.id === id)?.messages.map((m) => m.id) ?? [0])) + 1
    updateTicket(id, (ticket) => ({
      ...ticket,
      status: ticket.status === 'Resolved' || ticket.status === 'Open' ? 'In Progress' : ticket.status,
      lastUpdated: currentTime,
      messages: [...ticket.messages, { id: messageId, author: 'Support Team', authorRole: 'Support', time: currentTime, body }],
      activity: [...ticket.activity, { time: currentTime, activity: 'Reply added by Support Team' }],
    }))
    setReplyDraft('')
    showToast('Reply sent to the customer.')
  }

  const addNote = (id: string) => {
    const note = noteDraft.trim()
    if (!note) return
    updateTicket(id, (ticket) => ({
      ...ticket,
      lastUpdated: currentTime,
      internalNotes: [...ticket.internalNotes, { time: currentTime, note }],
      activity: [...ticket.activity, { time: currentTime, activity: 'Internal note added' }],
    }))
    setNoteDraft('')
    showToast('Internal note saved.')
  }

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'priority' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  const sortArrow = (key: typeof sortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '')

  const card = (
    icon: string,
    label: string,
    value: string,
    caption: string,
    accent: string,
    quick: typeof quickFilter,
  ) => (
    <button
      type="button"
      className={`ticket-card ${accent} ${quickFilter === quick ? 'selected' : ''}`}
      onClick={() => applyQuick(quick)}
    >
      <span className="ticket-card-top"><span className="ticket-card-icon">{icon}</span><span>{label}</span></span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </button>
  )

  return (
    <div className="ticket-page">
      <style>{`
        .ticket-page { display: grid; gap: 18px; min-width: 0; }

        .kpi-detail-back {
          display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 0;
          font: inherit; font-size: 0.78rem; font-weight: 700; color: #2563eb; cursor: pointer;
        }
        .kpi-detail-back:hover { color: #1d4ed8; text-decoration: underline; }

        .ticket-summary-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 1200px) { .ticket-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

        .ticket-card {
          display: grid; gap: 6px; padding: 16px 18px; border-radius: 16px;
          background: linear-gradient(180deg, #fff, #fffdf9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-left: 4px solid rgba(100, 116, 139, 0.5);
          box-shadow: 0 12px 26px -18px rgba(15, 23, 42, 0.4);
          text-align: left; font: inherit; cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ticket-card strong { font-size: 1.45rem; letter-spacing: -0.03em; }
        .ticket-card small { color: var(--muted); }
        .ticket-card.selected { box-shadow: inset 0 0 0 2px rgba(8, 166, 108, 0.25), 0 12px 26px -18px rgba(15, 23, 42, 0.4); }
        .ticket-card-top { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; font-weight: 700; color: #475569; }
        .ticket-card-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; font-size: 0.72rem; background: rgba(15, 23, 42, 0.08); }

        .ticket-card.accent-slate { border-left-color: #64748b; }
        .ticket-card.accent-orange { border-left-color: var(--brand-orange); }
        .ticket-card.accent-orange strong { color: #c94310; }
        .ticket-card.accent-orange .ticket-card-icon { background: rgba(255, 107, 44, 0.15); color: #c94310; }
        .ticket-card.accent-purple { border-left-color: #7c3aed; }
        .ticket-card.accent-purple strong { color: #6d28d9; }
        .ticket-card.accent-purple .ticket-card-icon { background: rgba(124, 58, 237, 0.13); color: #6d28d9; }
        .ticket-card.accent-green { border-left-color: #08a66c; }
        .ticket-card.accent-green strong { color: #078653; }
        .ticket-card.accent-green .ticket-card-icon { background: rgba(8, 166, 108, 0.14); color: #078653; }
        .ticket-card.accent-red { border-left-color: #ef4444; }
        .ticket-card.accent-red strong { color: #dc2626; }
        .ticket-card.accent-red .ticket-card-icon { background: rgba(239, 68, 68, 0.13); color: #dc2626; }

        .ticket-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
        .ticket-search {
          flex: 1 1 220px; padding: 9px 12px; border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14); background: #fff;
          font: inherit; font-size: 0.83rem; color: var(--text);
        }
        .ticket-select {
          padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff; font: inherit; font-size: 0.8rem; font-weight: 700; color: var(--text);
        }

        .ticket-th { cursor: pointer; user-select: none; white-space: nowrap; }
        .ticket-th:hover { color: var(--brand-orange); }

        .ticket-subject { font-weight: 700; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }

        .ticket-priority {
          display: inline-block; padding: 4px 10px; border-radius: 999px;
          font-size: 0.68rem; font-weight: 800; letter-spacing: 0.02em; white-space: nowrap;
        }
        .ticket-priority.urgent { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
        .ticket-priority.high { background: rgba(249, 115, 22, 0.12); color: #c2410c; }
        .ticket-priority.medium { background: rgba(37, 99, 235, 0.11); color: #1d4ed8; }
        .ticket-priority.low { background: rgba(22, 163, 74, 0.11); color: #16a34a; }

        .ticket-pagination {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 14px 18px; border-top: 1px solid rgba(15, 23, 42, 0.06);
        }
        .ticket-page-btn {
          border: 1px solid rgba(15, 23, 42, 0.14); background: #fff; border-radius: 10px;
          padding: 7px 14px; font: inherit; font-size: 0.78rem; font-weight: 700; color: var(--text); cursor: pointer;
        }
        .ticket-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .ticket-page-info { font-size: 0.8rem; color: var(--muted); }

        .ticket-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 200; }
        .ticket-detail {
          position: fixed; top: 0; right: 0; bottom: 0; width: 520px; max-width: 94vw;
          background: #fff; z-index: 201; overflow-y: auto; box-shadow: -24px 0 60px -24px rgba(15, 23, 42, 0.5);
        }
        .ticket-detail-inner { display: grid; gap: 16px; padding: 20px; }
        .ticket-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .ticket-close {
          border: 0; background: rgba(15, 23, 42, 0.06); color: var(--text); border-radius: 10px;
          width: 34px; height: 34px; font-size: 1rem; cursor: pointer;
        }
        .ticket-meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .ticket-chip {
          padding: 4px 10px; border-radius: 999px; font-size: 0.68rem; font-weight: 800;
          background: rgba(15, 23, 42, 0.06); color: #475569; white-space: nowrap;
        }
        .ticket-chip.category { background: rgba(37, 99, 235, 0.1); color: #1d4ed8; }

        .ticket-info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .ticket-info-item { display: grid; gap: 3px; padding: 10px 12px; border-radius: 10px; background: rgba(15, 23, 42, 0.04); }
        .ticket-info-item > span { font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
        .ticket-info-item > strong { font-size: 0.85rem; }
        .ticket-info-item > select { margin-top: 4px; font: inherit; font-size: 0.8rem; font-weight: 700; color: var(--text); border: 1px solid rgba(15, 23, 42, 0.14); border-radius: 8px; padding: 6px 8px; background: #fff; }

        .ticket-section-title { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin: 0; }

        .ticket-thread { display: grid; gap: 10px; }
        .ticket-message {
          display: grid; gap: 6px; padding: 11px 13px; border-radius: 12px;
          background: rgba(15, 23, 42, 0.04); border: 1px solid rgba(15, 23, 42, 0.06);
        }
        .ticket-message.customer { background: rgba(255, 107, 44, 0.06); border-color: rgba(255, 107, 44, 0.18); margin-left: 22px; }
        .ticket-message.owner { background: rgba(124, 58, 237, 0.06); border-color: rgba(124, 58, 237, 0.16); margin-left: 22px; }
        .ticket-message.support { margin-right: 22px; }
        .ticket-msg-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .ticket-msg-author { font-size: 0.78rem; font-weight: 800; }
        .ticket-msg-author .role { font-weight: 700; font-size: 0.66rem; color: var(--muted); text-transform: uppercase; }
        .ticket-msg-time { font-size: 0.7rem; color: var(--muted); }
        .ticket-msg-body { margin: 0; font-size: 0.82rem; line-height: 1.5; color: var(--text); }
        .ticket-msg-attach { display: flex; flex-wrap: wrap; gap: 6px; }
        .ticket-attach {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 8px;
          background: #fff; border: 1px solid rgba(15, 23, 42, 0.12); font-size: 0.7rem; font-weight: 700; color: #475569;
        }

        .ticket-reply-box { display: grid; gap: 8px; }
        .ticket-reply-box textarea {
          width: 100%; box-sizing: border-box; min-height: 74px; resize: vertical;
          padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(15, 23, 42, 0.14);
          font: inherit; font-size: 0.83rem; color: var(--text);
        }
        .ticket-send-row { display: flex; justify-content: flex-end; }

        .ticket-note-list { display: grid; gap: 8px; }
        .ticket-note { display: grid; gap: 3px; padding: 9px 12px; border-radius: 10px; background: rgba(255, 184, 77, 0.09); border: 1px dashed rgba(255, 154, 0, 0.35); }
        .ticket-note time { font-size: 0.68rem; color: var(--muted); }
        .ticket-note p { margin: 0; font-size: 0.8rem; line-height: 1.45; }

        .ticket-activity { display: grid; gap: 0; }
        .ticket-act {
          position: relative; padding-left: 18px; padding-bottom: 12px;
        }
        .ticket-act::before {
          content: ''; position: absolute; left: 4px; top: 3px; bottom: 0; width: 2px; background: rgba(15, 23, 42, 0.1);
        }
        .ticket-act:last-child::before { bottom: auto; height: 8px; }
        .ticket-act::after {
          content: ''; position: absolute; left: 0; top: 5px; width: 10px; height: 10px; border-radius: 999px;
          background: #cbd5e1; border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
        }
        .ticket-act strong { display: block; font-size: 0.8rem; font-weight: 700; }
        .ticket-act time { font-size: 0.68rem; color: var(--muted); }

        .ticket-actions { display: flex; flex-wrap: wrap; gap: 10px; padding-top: 4px; }
        .ticket-btn {
          border: 1px solid rgba(8, 166, 108, 0.35); background: #fff; color: #078653;
          border-radius: 10px; padding: 9px 16px; font: inherit; font-size: 0.8rem; font-weight: 800; cursor: pointer;
        }
        .ticket-btn.primary { background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep)); color: #fff; border-color: transparent; }

        .ticket-toast {
          position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
          background: #0f172a; color: #fff; padding: 11px 18px; border-radius: 999px;
          font-size: 0.82rem; font-weight: 700; z-index: 300;
          box-shadow: 0 16px 40px -16px rgba(15, 23, 42, 0.7);
        }

        .ticket-empty { margin: 0; padding: 0 18px 18px; color: #64748b; font-size: 0.78rem; line-height: 1.5; }
      `}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="kpi-detail-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          <p className="header-kicker">Support / Ticket Management</p>
          <h1 className="header-title">Support Ticket Management</h1>
          <div className="header-breadcrumb">Support / Ticket Management / Dashboard</div>
        </div>
        <span className="chip active">Support desk · 9 AM – 9 PM</span>
      </header>

      <section className="ticket-summary-grid" aria-label="Ticket dashboard summary">
        {card('🎫', 'Total tickets', String(tickets.length), 'Across all categories', 'accent-slate', 'total')}
        {card('◌', 'Open tickets', String(tickets.filter((t) => t.status === 'Open').length), 'Awaiting first action', 'accent-orange', 'open')}
        {card('⚙', 'In progress', String(tickets.filter((t) => t.status === 'In Progress').length), 'Being worked on now', 'accent-purple', 'in-progress')}
        {card('✓', 'Resolved', String(tickets.filter((t) => t.status === 'Resolved').length), 'Solved for the customer', 'accent-green', 'resolved')}
        {card('⚡', 'High priority', String(tickets.filter((t) => t.priority === 'High' || t.priority === 'Urgent').length), 'High + urgent tickets', 'accent-red', 'high-priority')}
      </section>

      <section className="panel" aria-labelledby="ticket-requests-title">
        <div className="panel-header">
          <div>
            <h3 id="ticket-requests-title">Tickets</h3>
            <span className="health-meta">Showing {filteredTickets.length} of {tickets.length} tickets</span>
          </div>
          <div className="ticket-toolbar">
            <input
              className="ticket-search"
              type="search"
              placeholder="Search by ticket ID, subject, customer, owner or staff..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(1)
              }}
              aria-label="Search tickets"
            />
            <select className="ticket-select" value={statusFilter} onChange={selectDropdown(setStatusFilter)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Response">Waiting for Response</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <select className="ticket-select" value={categoryFilter} onChange={selectDropdown(setCategoryFilter)} aria-label="Filter by category">
              <option value="All">All categories</option>
              <option value="Booking">Booking</option>
              <option value="Payment">Payment</option>
              <option value="Refund">Refund</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Documents">Documents</option>
              <option value="Account">Account</option>
              <option value="Other">Other</option>
            </select>
            <select className="ticket-select" value={priorityFilter} onChange={selectDropdown(setPriorityFilter)} aria-label="Filter by priority">
              <option value="All">All priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="chart-wrap kpi-detail-table-wrap">
          <table className="state-table kpi-detail-table">
            <thead>
              <tr>
                <th className="ticket-th" onClick={() => toggleSort('id')}>Ticket ID{sortArrow('id')}</th>
                <th>Subject</th>
                <th>Customer / Owner</th>
                <th>Category</th>
                <th className="ticket-th" onClick={() => toggleSort('priority')}>Priority{sortArrow('priority')}</th>
                <th>Assigned staff</th>
                <th className="ticket-th" onClick={() => toggleSort('createdDate')}>Created{sortArrow('createdDate')}</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((ticket) => (
                <tr key={ticket.id}>
                  <td><strong>{ticket.id}</strong></td>
                  <td><span className="ticket-subject" title={ticket.subject}>{ticket.subject}</span></td>
                  <td>
                    <span className="booking-record-entity">
                      <span>{ticket.customerName}</span>
                      <small>{ticket.customerId} · {ticket.ownerName}</small>
                    </span>
                  </td>
                  <td><span className="ticket-chip category">{ticket.category}</span></td>
                  <td>
                    <span className={`ticket-priority ${priorityClass(ticket.priority)}`}
                      style={levelStyle(ticket.priority)}>{ticket.priority}</span>
                  </td>
                  <td>{ticket.assignedTo}</td>
                  <td>{ticket.createdDate}</td>
                  <td><span className={`booking-date-status ${statusClass(ticket.status)}`}>{ticket.status}</span></td>
                  <td>
                    <button type="button" className="ticket-btn" onClick={() => setSelectedId(ticket.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && (
          <p className="ticket-empty">No tickets match the current search or filters.</p>
        )}

        <div className="ticket-pagination">
          <button type="button" className="ticket-page-btn" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
          <span className="ticket-page-info">Page {safePage} of {totalPages} · {pageSize} per page</span>
          <button type="button" className="ticket-page-btn" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
        </div>
      </section>

      {selected && (
        <>
          <div className="ticket-backdrop" onClick={() => setSelectedId(null)} />
          <aside className="ticket-detail" aria-label={`Ticket details for ${selected.id}`}>
            <div className="ticket-detail-inner">
              <div className="ticket-detail-head">
                <div>
                  <p className="header-kicker">Support ticket</p>
                  <h3 style={{ margin: 0 }}>{selected.subject}</h3>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{selected.id} · Created {selected.createdDate}</div>
                </div>
                <button type="button" className="ticket-close" onClick={() => setSelectedId(null)} aria-label="Close ticket details">✕</button>
              </div>

              <div className="ticket-meta-row">
                <span className="ticket-chip category">{selected.category}</span>
                <span className={`ticket-priority ${priorityClass(selected.priority)}`} style={levelStyle(selected.priority)}>{selected.priority}</span>
                <span className={`booking-date-status ${statusClass(selected.status)}`}>{selected.status}</span>
              </div>

              <div className="ticket-info-grid">
                <div className="ticket-info-item"><span>Customer</span><strong>{selected.customerName}</strong></div>
                <div className="ticket-info-item"><span>Customer ID</span><strong>{selected.customerId}</strong></div>
                <div className="ticket-info-item"><span>Customer type</span><strong>{selected.customerType}</strong></div>
                <div className="ticket-info-item"><span>Owner</span><strong>{selected.ownerName}</strong></div>
                <div className="ticket-info-item">
                  <span>Priority</span>
                  <select
                    value={selected.priority}
                    onChange={(event) => changePriority(selected.id, event.target.value as TicketPriority)}
                    aria-label="Change priority"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="ticket-info-item">
                  <span>Assigned staff</span>
                  <select
                    value={selected.assignedTo}
                    onChange={(event) => assignTicket(selected.id, event.target.value)}
                    aria-label="Assign to staff"
                  >
                    {supportStaff.map((staff) => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
                <div className="ticket-info-item">
                  <span>Status</span>
                  <select
                    value={selected.status}
                    onChange={(event) => changeStatus(selected.id, event.target.value as TicketStatus)}
                    aria-label="Change status"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Response">Waiting for Response</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="ticket-info-item"><span>Last updated</span><strong>{selected.lastUpdated}</strong></div>
              </div>

              {selected.attachments.length > 0 && (
                <div>
                  <p className="ticket-section-title">Attachments</p>
                  <div className="ticket-msg-attach" style={{ marginTop: 8 }}>
                    {selected.attachments.map((attachment) => (
                      <span key={attachment.name} className="ticket-attach">📎 {attachment.name} · {attachment.size}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="ticket-section-title">Conversation</p>
                <div className="ticket-thread" style={{ marginTop: 8 }}>
                  {selected.messages.map((message) => (
                    <div key={message.id} className={`ticket-message ${message.authorRole === 'Customer' ? 'customer' : message.authorRole === 'Owner' ? 'owner' : 'support'}`}>
                      <div className="ticket-msg-head">
                        <span className="ticket-msg-author">
                          {message.author} <span className="role">· {message.authorRole}</span>
                        </span>
                        <span className="ticket-msg-time">{message.time}</span>
                      </div>
                      <p className="ticket-msg-body">{message.body}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="ticket-msg-attach">
                          {message.attachments.map((attachment) => (
                            <span key={attachment} className="ticket-attach">📎 {attachment}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="ticket-reply-box" style={{ marginTop: 10 }}>
                  <textarea
                    placeholder="Reply to the customer..."
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    aria-label="Reply to customer"
                  />
                  <div className="ticket-send-row">
                    <button type="button" className="ticket-btn primary" disabled={!replyDraft.trim()} onClick={() => sendReply(selected.id)}>Send reply</button>
                  </div>
                </div>
              </div>

              <div>
                <p className="ticket-section-title">Internal notes</p>
                <div className="ticket-note-list" style={{ marginTop: 8 }}>
                  {selected.internalNotes.map((note, index) => (
                    <div key={index} className="ticket-note">
                      <time>{note.time}</time>
                      <p>{note.note}</p>
                    </div>
                  ))}
                  {selected.internalNotes.length === 0 && <p className="ticket-empty">No internal notes yet.</p>}
                </div>
                <div className="ticket-reply-box" style={{ marginTop: 8 }}>
                  <textarea
                    placeholder="Add an internal note (only staff can see this)..."
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    aria-label="Add internal note"
                  />
                  <div className="ticket-send-row">
                    <button type="button" className="ticket-btn" disabled={!noteDraft.trim()} onClick={() => addNote(selected.id)}>Add note</button>
                  </div>
                </div>
              </div>

              <div>
                <p className="ticket-section-title">Activity history</p>
                <div className="ticket-activity" style={{ marginTop: 8 }}>
                  {selected.activity.map((event, index) => (
                    <div key={index} className="ticket-act">
                      <time>{event.time}</time>
                      <strong>{event.activity}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ticket-actions">
                {selected.status !== 'Resolved' && selected.status !== 'Closed' && (
                  <button type="button" className="ticket-btn primary" onClick={() => changeStatus(selected.id, 'Resolved')}>Resolve</button>
                )}
                {(selected.status === 'Resolved' || selected.status === 'Closed') && (
                  <button type="button" className="ticket-btn" onClick={() => changeStatus(selected.id, 'Open')}>Reopen</button>
                )}
                {selected.status === 'Open' && (
                  <button type="button" className="ticket-btn" onClick={() => changeStatus(selected.id, 'In Progress')}>Start progress</button>
                )}
                {selected.status === 'Resolved' && (
                  <button type="button" className="ticket-btn" onClick={() => changeStatus(selected.id, 'Closed')}>Close</button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      {toast && <div className="ticket-toast" role="status">{toast}</div>}
    </div>
  )
}