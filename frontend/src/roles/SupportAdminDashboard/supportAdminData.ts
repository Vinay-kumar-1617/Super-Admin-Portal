// Seed data, types and metadata for the Hyderabad Support Admin dashboard.
import { emailForRole } from '../../auth/roleAccounts'

export type SectionId =
  | 'overview'
  | 'tickets'
  | 'customer-support'
  | 'owner-support'
  | 'operator-support'
  | 'live-chat'
  | 'bookings'
  | 'users'
  | 'payment-support'
  | 'refunds'
  | 'escalations'
  | 'reports'
  | 'notifications'

export type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

export const supportSections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'Support overview', crumb: 'Overview' },
  { id: 'tickets', label: 'Tickets', title: 'Ticket desk', crumb: 'Tickets' },
  { id: 'customer-support', label: 'Customer Support', title: 'Customer support', crumb: 'Customer Support' },
  { id: 'owner-support', label: 'Owner Support', title: 'Owner support', crumb: 'Owner Support' },
  { id: 'operator-support', label: 'Operator Support', title: 'Operator support', crumb: 'Operator Support' },
  { id: 'live-chat', label: 'Live Chat', title: 'Live chat & conversations', crumb: 'Live Chat' },
  { id: 'bookings', label: 'Booking & rental issues', title: 'Booking & rental support', crumb: 'Booking support' },
  { id: 'payment-support', label: 'Payment & refund support', title: 'Payment & refund support', crumb: 'Payment support' },
  { id: 'users', label: 'User lookup', title: 'User lookup (masked)', crumb: 'User lookup' },
  { id: 'refunds', label: 'Refunds', title: 'Refund requests', crumb: 'Refunds' },
  { id: 'escalations', label: 'Escalations', title: 'Escalation desk', crumb: 'Escalations' },
  { id: 'reports', label: 'Reports', title: 'Reports & audit', crumb: 'Reports' },
  { id: 'notifications', label: 'Notifications', title: 'Support notifications', crumb: 'Notifications' },
]

export const supportPeriods = ['Today', 'This Week', 'This Month', 'This Quarter'] as const

export const supportProfile = {
  state: 'Telangana',
  city: 'Hyderabad',
  code: 'HYD',
  name: 'Anita Shah',
  email: emailForRole('support-admin'),
  initials: 'AS',
  responseTarget: '30 min',
  resolutionTarget: '8 hours',
  refundCap: '₹5,000',
  refundCapValue: 5000,
}

export const supportAgents = ['Unassigned', 'Anita Shah', 'Ravi Deshmukh', 'Sneha Iyer', 'Karthik Reddy'] as const

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type SupportKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export const supportKpis: SupportKpi[] = [
  { label: 'Open tickets', value: '42', change: '+6 today', tone: 'blue', description: 'Tickets open or pending across the Hyderabad queue.', target: 'tickets' },
  { label: 'Avg first response', value: '18m', change: '-4m', tone: 'green', description: 'Average time to first agent reply against a 30m target.', target: 'reports' },
  { label: 'Avg resolution', value: '6h 40m', change: '-50m', tone: 'purple', description: 'Average time to resolve a ticket against an 8h target.', target: 'reports' },
  { label: 'Refunds this month', value: '₹86K', change: '23 refunds', tone: 'orange', description: 'Refunds created by support, within the configured cap.', target: 'refunds' },
  { label: 'Unassigned queue', value: '9', change: '+2', tone: 'orange', description: 'Tickets waiting to be assigned to an agent.', target: 'tickets' },
]

export type TicketTypeSlice = { type: string; count: number }

export const ticketsByType: TicketTypeSlice[] = [
  { type: 'Booking', count: 148 },
  { type: 'Payment', count: 96 },
  { type: 'Operator', count: 74 },
  { type: 'Equipment', count: 52 },
  { type: 'Account', count: 31 },
]

export type MonthlyVolumePoint = { month: string; created: number; resolved: number }

export const monthlyVolume: MonthlyVolumePoint[] = [
  { month: 'Apr', created: 168, resolved: 155 },
  { month: 'May', created: 182, resolved: 174 },
  { month: 'Jun', created: 201, resolved: 190 },
  { month: 'Jul', created: 189, resolved: 183 },
  { month: 'Aug', created: 210, resolved: 198 },
  { month: 'Sep', created: 226, resolved: 214 },
]

export type SupportAlert = {
  id: string
  title: string
  detail: string
  time: string
  severity: 'Critical' | 'Warning' | 'Info'
  target: SectionId
}

export const supportAlerts: SupportAlert[] = [
  { id: 'al-1', title: 'Response target about to breach', detail: '3 open tickets are within 5 minutes of their 30m first-response target.', time: '4 min ago', severity: 'Critical', target: 'tickets' },
  { id: 'al-2', title: 'Repeated complaints from the same user', detail: 'Karan Patel has raised 4 tickets about operator delays in 7 days.', time: '26 min ago', severity: 'Critical', target: 'users' },
  { id: 'al-3', title: 'Overdue tickets unassigned', detail: '2 overdue tickets are still sitting in the unassigned queue.', time: '1 hr ago', severity: 'Warning', target: 'tickets' },
  { id: 'al-4', title: 'Refund awaiting finance', detail: '1 refund above the cap is escalated and waiting on the finance admin.', time: '2 hrs ago', severity: 'Info', target: 'refunds' },
]

export type FeedTone = 'green' | 'amber' | 'red' | 'blue'

export type SupportNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target: SectionId
}

export const supportNotifications: SupportNotification[] = [
  { id: 'nf-1', title: 'Ticket TK-4821 assigned to you', detail: 'Late operator · booking BK-88213 · priority High.', time: '6 min ago', tone: 'blue', read: false, target: 'tickets' },
  { id: 'nf-2', title: 'Finance approved refund RF-2205', detail: '₹12,500 above-cap refund can now be processed.', time: '40 min ago', tone: 'green', read: false, target: 'refunds' },
  { id: 'nf-3', title: 'Escalation ESC-118 acknowledged', detail: 'Operations manager picked up the zone shortage case.', time: '2 hrs ago', tone: 'blue', read: true, target: 'escalations' },
  { id: 'nf-4', title: 'Repeat complaint detected', detail: 'Same user raised a 4th ticket this week.', time: '3 hrs ago', tone: 'red', read: true, target: 'users' },
]

export type ActivityItem = { id: string; time: string; actor: string; action: string; target: string }

export const activityFeed: ActivityItem[] = [
  { id: 'ac-1', time: '10:05', actor: 'Anita Shah', action: 'closed ticket', target: 'TK-4810 · payment issue' },
  { id: 'ac-2', time: '09:48', actor: 'Ravi Deshmukh', action: 'assigned ticket', target: 'TK-4821 · late operator' },
  { id: 'ac-3', time: '09:20', actor: 'Anita Shah', action: 'created refund', target: 'RF-2210 · ₹3,200' },
  { id: 'ac-4', time: '08:55', actor: 'Sneha Iyer', action: 'escalated case', target: 'ESC-118 · operations' },
  { id: 'ac-5', time: 'yesterday', actor: 'Anita Shah', action: 'reopened ticket', target: 'TK-4772 · customer not satisfied' },
]

export type RepeatUser = { id: string; name: string; maskedPhone: string; tickets: number; lastIssue: string }

export const repeatUsers: RepeatUser[] = [
  { id: 'ru-1', name: 'Karan Patel', maskedPhone: '+91 ••••• 43210', tickets: 4, lastIssue: 'Operator delay' },
  { id: 'ru-2', name: 'Zainab Ali', maskedPhone: '+91 ••••• 77120', tickets: 3, lastIssue: 'Wrong location' },
  { id: 'ru-3', name: 'Mohit Jain', maskedPhone: '+91 ••••• 20981', tickets: 3, lastIssue: 'Refund delay' },
]

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export type TicketStatus = 'New' | 'Open' | 'Pending' | 'Resolved' | 'Closed'
export type TicketPriority = 'Urgent' | 'High' | 'Normal' | 'Low'
export type TicketCategory = 'Booking' | 'Payment' | 'Operator' | 'Equipment' | 'Account' | 'Refund'
export type TicketChannel = 'App' | 'Phone' | 'Email' | 'Chat'
export type RequesterType = 'Customer' | 'Owner' | 'Operator'

export type TicketMessage = {
  id: string
  author: string
  role: string
  body: string
  time: string
  internal: boolean
}

export type Ticket = {
  id: string
  subject: string
  requester: string
  requesterType: RequesterType
  channel: TicketChannel
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assignee: string
  booking: string
  created: string
  updated: string
  responseTarget: string
  overdue: boolean
  breachingSoon: boolean
  messages: TicketMessage[]
  reopened: number
}

export const tickets: Ticket[] = [
  {
    id: 'TK-4821',
    subject: 'Operator not arrived for scheduled slot',
    requester: 'Karan Patel',
    requesterType: 'Customer',
    channel: 'App',
    category: 'Operator',
    priority: 'High',
    status: 'Open',
    assignee: 'Anita Shah',
    booking: 'BK-88213',
    created: '2026-04-02 09:15',
    updated: '2026-04-02 09:42',
    responseTarget: 'in 4 min',
    overdue: false,
    breachingSoon: true,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Karan Patel', role: 'Customer', body: 'The operator has not arrived and the slot started 25 minutes ago. I need the machine for a morning pour.', time: '09:15', internal: false },
      { id: 'm2', author: 'Anita Shah', role: 'Support', body: 'Thanks for flagging this, Karan. I am contacting the operator now and will update you within 10 minutes.', time: '09:20', internal: false },
      { id: 'm3', author: 'Anita Shah', role: 'Support', body: 'Operator says he is stuck in traffic near Gachibowli. Checking if we can dispatch a backup.', time: '09:24', internal: true },
    ],
  },
  {
    id: 'TK-4820',
    subject: 'Charged twice for the same booking',
    requester: 'Neha Rao',
    requesterType: 'Customer',
    channel: 'Email',
    category: 'Payment',
    priority: 'Urgent',
    status: 'Open',
    assignee: 'Ravi Deshmukh',
    booking: 'BK-90112',
    created: '2026-04-02 08:40',
    updated: '2026-04-02 09:10',
    responseTarget: 'breached by 12 min',
    overdue: true,
    breachingSoon: false,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Neha Rao', role: 'Customer', body: 'My card shows two debits of ₹12,500 for one booking. Please refund the duplicate.', time: '08:40', internal: false },
      { id: 'm2', author: 'Ravi Deshmukh', role: 'Support', body: 'Investigating with the payment gateway, this looks like a duplicate authorisation.', time: '09:10', internal: true },
    ],
  },
  {
    id: 'TK-4819',
    subject: 'Machine delivered to the wrong location',
    requester: 'Zainab Ali',
    requesterType: 'Customer',
    channel: 'Phone',
    category: 'Booking',
    priority: 'High',
    status: 'Pending',
    assignee: 'Sneha Iyer',
    booking: 'BK-88244',
    created: '2026-04-02 08:05',
    updated: '2026-04-02 08:30',
    responseTarget: 'met · 14 min',
    overdue: false,
    breachingSoon: false,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Zainab Ali', role: 'Customer', body: 'The excavator was sent to Kokapet instead of Gachibowli. Nobody is available to redirect it.', time: '08:05', internal: false },
      { id: 'm2', author: 'Sneha Iyer', role: 'Support', body: 'Raised with dispatch. Awaiting reassignment confirmation before reverting.', time: '08:30', internal: false },
    ],
  },
  {
    id: 'TK-4818',
    subject: 'Owner wants payout statement clarification',
    requester: 'Sri Balaji Rentals',
    requesterType: 'Owner',
    channel: 'Email',
    category: 'Payment',
    priority: 'Normal',
    status: 'Open',
    assignee: 'Unassigned',
    booking: '—',
    created: '2026-04-02 07:50',
    updated: '2026-04-02 07:50',
    responseTarget: 'in 22 min',
    overdue: false,
    breachingSoon: false,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Sri Balaji Rentals', role: 'Owner', body: 'Please explain the adjustment line on the March payout statement.', time: '07:50', internal: false },
    ],
  },
  {
    id: 'TK-4817',
    subject: 'Login OTP not received',
    requester: 'Imran Khan',
    requesterType: 'Operator',
    channel: 'Chat',
    category: 'Account',
    priority: 'Normal',
    status: 'Resolved',
    assignee: 'Karthik Reddy',
    booking: '—',
    created: '2026-04-01 18:20',
    updated: '2026-04-01 18:40',
    responseTarget: 'met · 6 min',
    overdue: false,
    breachingSoon: false,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Imran Khan', role: 'Operator', body: 'Not getting the login OTP on my registered number.', time: '18:20', internal: false },
      { id: 'm2', author: 'Karthik Reddy', role: 'Support', body: 'Resent the OTP and verified it was delivered. Please try again.', time: '18:26', internal: false },
    ],
  },
  {
    id: 'TK-4772',
    subject: 'Customer unhappy with partial refund',
    requester: 'Mohit Jain',
    requesterType: 'Customer',
    channel: 'App',
    category: 'Refund',
    priority: 'High',
    status: 'Open',
    assignee: 'Anita Shah',
    booking: 'BK-88310',
    created: '2026-03-31 15:10',
    updated: '2026-04-02 09:00',
    responseTarget: 'met · 11 min',
    overdue: false,
    breachingSoon: false,
    reopened: 1,
    messages: [
      { id: 'm1', author: 'Mohit Jain', role: 'Customer', body: 'I was promised a full refund but only got half. Reopening this.', time: '2026-03-31 15:10', internal: false },
      { id: 'm2', author: 'Anita Shah', role: 'Support', body: 'Consulting the damage assessment before confirming the remaining amount.', time: '2026-04-02 09:00', internal: false },
    ],
  },
  {
    id: 'TK-4816',
    subject: 'Equipment damaged on return',
    requester: 'Arjun Mehta',
    requesterType: 'Customer',
    channel: 'App',
    category: 'Equipment',
    priority: 'Normal',
    status: 'Closed',
    assignee: 'Ravi Deshmukh',
    booking: 'BK-88355',
    created: '2026-04-01 12:00',
    updated: '2026-04-01 16:30',
    responseTarget: 'met · 9 min',
    overdue: false,
    breachingSoon: false,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Arjun Mehta', role: 'Customer', body: 'There is a crack on the bucket that was there before pickup.', time: '12:00', internal: false },
      { id: 'm2', author: 'Ravi Deshmukh', role: 'Support', body: 'Pre-pickup photos confirm the crack. No charge applied. Closing this.', time: '16:30', internal: false },
    ],
  },
  {
    id: 'TK-4815',
    subject: 'Operator asked for extra cash',
    requester: 'Priya Nair',
    requesterType: 'Customer',
    channel: 'Phone',
    category: 'Operator',
    priority: 'Urgent',
    status: 'New',
    assignee: 'Unassigned',
    booking: 'BK-88320',
    created: '2026-04-02 09:35',
    updated: '2026-04-02 09:35',
    responseTarget: 'in 3 min',
    overdue: false,
    breachingSoon: true,
    reopened: 0,
    messages: [
      { id: 'm1', author: 'Priya Nair', role: 'Customer', body: 'The operator is demanding extra cash beyond the app amount.', time: '09:35', internal: false },
    ],
  },
]

export type SavedReply = { id: string; title: string; body: string }

export const savedReplies: SavedReply[] = [
  { id: 'sr-1', title: 'Late operator apology', body: 'We are sorry for the delay. We have contacted the operator and will confirm a revised arrival time within 10 minutes. If the delay continues, we will arrange a backup or credit your account.' },
  { id: 'sr-2', title: 'Duplicate charge', body: 'We have flagged the duplicate authorisation with the payment gateway. It is usually reversed within 3 to 5 working days. We will keep this ticket updated until it clears.' },
  { id: 'sr-3', title: 'Refund policy', body: 'Refunds approved under the support cap are processed within 24 hours. Amounts above the cap require finance approval and may take 3 to 5 working days.' },
  { id: 'sr-4', title: 'How to reschedule', body: 'You can reschedule from the booking screen up to 4 hours before the slot at no cost. Inside 4 hours a nominal rescheduling fee may apply.' },
]

export type ChatAttachment = { name: string; type: string; size: number }
export type ChatMessage = { id: string; author: string; role: 'Customer' | 'Support'; body: string; time: string; attachments: ChatAttachment[] }
export type ChatStatus = 'Open' | 'Pending' | 'Closed'
export type LiveConversation = {
  id: string
  customer: string
  customerType: RequesterType
  booking: string
  subject: string
  status: ChatStatus
  assignee: string
  unread: number
  updated: string
  messages: ChatMessage[]
}

export const liveConversations: LiveConversation[] = [
  {
    id: 'CH-2104', customer: 'Karan Patel', customerType: 'Customer', booking: 'BK-88213',
    subject: 'Operator has not arrived', status: 'Open', assignee: 'Anita Shah', unread: 2, updated: '09:42',
    messages: [
      { id: 'ch1', author: 'Karan Patel', role: 'Customer', body: 'The operator has not arrived for the 9 AM slot. Can you check?', time: '09:15', attachments: [] },
      { id: 'ch2', author: 'Anita Shah', role: 'Support', body: 'I’m checking with dispatch now. I’ll update you shortly.', time: '09:21', attachments: [] },
      { id: 'ch3', author: 'Karan Patel', role: 'Customer', body: 'I have added a photo of the delivery entrance for reference.', time: '09:42', attachments: [{ name: 'site-entrance.jpg', type: 'image/jpeg', size: 284000 }] },
    ],
  },
  {
    id: 'CH-2103', customer: 'Neha Rao', customerType: 'Customer', booking: 'BK-90112',
    subject: 'Duplicate payment confirmation', status: 'Open', assignee: 'Unassigned', unread: 1, updated: '09:10',
    messages: [
      { id: 'ch1', author: 'Neha Rao', role: 'Customer', body: 'My bank shows two charges for the same booking. Please confirm the reversal.', time: '08:48', attachments: [] },
    ],
  },
  {
    id: 'CH-2102', customer: 'Sri Balaji Rentals', customerType: 'Owner', booking: '—',
    subject: 'Payout statement question', status: 'Pending', assignee: 'Ravi Deshmukh', unread: 0, updated: 'Yesterday',
    messages: [
      { id: 'ch1', author: 'Sri Balaji Rentals', role: 'Customer', body: 'Can someone explain the adjustment on my March settlement?', time: 'Yesterday', attachments: [] },
      { id: 'ch2', author: 'Ravi Deshmukh', role: 'Support', body: 'I have asked Finance to verify the adjustment and will follow up here.', time: 'Yesterday', attachments: [] },
    ],
  },
]

// ---------------------------------------------------------------------------
// Booking assistance
// ---------------------------------------------------------------------------

export type BookingStatus = 'Confirmed' | 'In progress' | 'Completed' | 'Cancelled'

export type BookingHistoryEvent = { id: string; time: string; label: string; actor: string; detail: string }

export type SupportBooking = {
  id: string
  customer: string
  customerMasked: string
  owner: string
  ownerMasked: string
  operator: string
  operatorMasked: string
  equipmentType: string
  machine: string
  zone: string
  window: string
  rentalStart: string
  rentalEnd: string
  amount: string
  status: BookingStatus
  cancellationReason: string | null
  disputeHistory: BookingHistoryEvent[]
  history: BookingHistoryEvent[]
}

export const bookings: SupportBooking[] = [
  {
    id: 'BK-88213',
    customer: 'Karan Patel',
    customerMasked: '+91 ••••• 43210',
    owner: 'Sri Balaji Rentals',
    ownerMasked: '+91 ••••• 88221',
    operator: 'Imran Khan',
    operatorMasked: '+91 ••••• 11002',
    equipmentType: 'Backhoe loader',
    machine: 'JCB 3DX · TS09 AB 4321',
    zone: 'HITEC City',
    window: '02 Apr · 09:00 – 13:00',
    rentalStart: '02 Apr 2026 · 09:00',
    rentalEnd: '02 Apr 2026 · 13:00',
    amount: '₹48,000',
    status: 'In progress',
    cancellationReason: null,
    disputeHistory: [],
    history: [
      { id: 'h1', time: '01 Apr 18:20', label: 'Booking confirmed', actor: 'Karan Patel', detail: 'Payment authorised and slot reserved.' },
      { id: 'h2', time: '01 Apr 19:05', label: 'Operator assigned', actor: 'Dispatch', detail: 'Imran Khan assigned to the slot.' },
      { id: 'h3', time: '02 Apr 09:15', label: 'Delay reported', actor: 'Karan Patel', detail: 'Ticket TK-4821 raised for operator delay.' },
    ],
  },
  {
    id: 'BK-90112',
    customer: 'Neha Rao',
    customerMasked: '+91 ••••• 55501',
    owner: 'Metro Machines',
    ownerMasked: '+91 ••••• 33019',
    operator: 'Vikram Singh',
    operatorMasked: '+91 ••••• 20881',
    equipmentType: 'Mobile crane',
    machine: 'Crane 20T · TS10 CD 1188',
    zone: 'Gachibowli',
    window: '03 Apr · 07:00 – 12:00',
    rentalStart: '03 Apr 2026 · 07:00',
    rentalEnd: '03 Apr 2026 · 12:00',
    amount: '₹12,500',
    status: 'Confirmed',
    cancellationReason: null,
    disputeHistory: [],
    history: [
      { id: 'h1', time: '02 Apr 08:30', label: 'Booking confirmed', actor: 'Neha Rao', detail: 'First debit captured.' },
      { id: 'h2', time: '02 Apr 08:38', label: 'Duplicate payment', actor: 'Gateway', detail: 'Second debit captured in error.' },
      { id: 'h3', time: '02 Apr 08:40', label: 'Ticket raised', actor: 'Neha Rao', detail: 'Ticket TK-4820 for duplicate charge.' },
    ],
  },
  {
    id: 'BK-88244',
    customer: 'Zainab Ali',
    customerMasked: '+91 ••••• 77120',
    owner: 'Green Field Partners',
    ownerMasked: '+91 ••••• 66442',
    operator: 'Anand Rao',
    operatorMasked: '+91 ••••• 90210',
    equipmentType: 'Hydraulic excavator',
    machine: 'Excavator EX-210 · TS09 EF 7788',
    zone: 'Kokapet',
    window: '02 Apr · 08:00 – 12:00',
    rentalStart: '02 Apr 2026 · 08:00',
    rentalEnd: '02 Apr 2026 · 12:00',
    amount: '₹22,500',
    status: 'In progress',
    cancellationReason: null,
    disputeHistory: [],
    history: [
      { id: 'h1', time: '01 Apr 20:10', label: 'Booking confirmed', actor: 'Zainab Ali', detail: 'Slot reserved for Gachibowli.' },
      { id: 'h2', time: '02 Apr 08:05', label: 'Wrong location', actor: 'Zainab Ali', detail: 'Machine delivered to Kokapet instead of Gachibowli.' },
      { id: 'h3', time: '02 Apr 08:30', label: 'Ticket raised', actor: 'Zainab Ali', detail: 'Ticket TK-4819 for location mix-up.' },
    ],
  },
  {
    id: 'BK-88310',
    customer: 'Mohit Jain',
    customerMasked: '+91 ••••• 20981',
    owner: 'Sunrise Equipment',
    ownerMasked: '+91 ••••• 40912',
    operator: 'Vikram Singh',
    operatorMasked: '+91 ••••• 20881',
    equipmentType: 'Industrial generator',
    machine: 'Generator 100kVA · TS11 GH 2210',
    zone: 'Madhapur',
    window: '31 Mar · 10:00 – 18:00',
    rentalStart: '31 Mar 2026 · 10:00',
    rentalEnd: '31 Mar 2026 · 18:00',
    amount: '₹15,000',
    status: 'Completed',
    cancellationReason: null,
    disputeHistory: [
      { id: 'd1', time: '31 Mar 15:10', label: 'Partial refund disputed', actor: 'Mohit Jain', detail: 'Customer disputes the partial damage refund. Ticket TK-4772 reopened for review.' },
    ],
    history: [
      { id: 'h1', time: '30 Mar 16:00', label: 'Booking confirmed', actor: 'Mohit Jain', detail: 'Payment authorised.' },
      { id: 'h2', time: '31 Mar 18:10', label: 'Completed', actor: 'Operator', detail: 'Job completed, damage reported.' },
      { id: 'h3', time: '31 Mar 15:10', label: 'Refund dispute', actor: 'Mohit Jain', detail: 'Partial refund disputed, ticket TK-4772 reopened.' },
    ],
  },
  {
    id: 'BK-88320',
    customer: 'Priya Nair',
    customerMasked: '+91 ••••• 60214',
    owner: 'Lakshmi Traders',
    ownerMasked: '+91 ••••• 55018',
    operator: 'Imran Khan',
    operatorMasked: '+91 ••••• 11002',
    equipmentType: 'Backhoe loader',
    machine: 'JCB 3DX · TS09 AB 1190',
    zone: 'Kondapur',
    window: '02 Apr · 10:00 – 14:00',
    rentalStart: '02 Apr 2026 · 10:00',
    rentalEnd: '02 Apr 2026 · 14:00',
    amount: '₹31,200',
    status: 'Confirmed',
    cancellationReason: null,
    disputeHistory: [],
    history: [
      { id: 'h1', time: '01 Apr 21:00', label: 'Booking confirmed', actor: 'Priya Nair', detail: 'Slot reserved.' },
      { id: 'h2', time: '02 Apr 09:35', label: 'Ticket raised', actor: 'Priya Nair', detail: 'Ticket TK-4815 for extra cash demand.' },
    ],
  },
  {
    id: 'BK-88360',
    customer: 'Aarav Mehta',
    customerMasked: '+91 ••••• 41826',
    owner: 'Deccan Earthmovers',
    ownerMasked: '+91 ••••• 74016',
    operator: 'Not assigned',
    operatorMasked: '—',
    equipmentType: 'Wheel loader',
    machine: 'CAT 950 GC · TS08 JK 6042',
    zone: 'Miyapur',
    window: '04 Apr · 08:00 – 12:00',
    rentalStart: '04 Apr 2026 · 08:00',
    rentalEnd: '04 Apr 2026 · 12:00',
    amount: '₹18,000',
    status: 'Cancelled',
    cancellationReason: 'Customer cancelled because the project schedule changed before dispatch.',
    disputeHistory: [
      { id: 'd1', time: '03 Apr 17:25', label: 'Cancellation fee disputed', actor: 'Aarav Mehta', detail: 'Customer requested a review of the cancellation fee; support is checking the cancellation window.' },
    ],
    history: [
      { id: 'h1', time: '02 Apr 16:40', label: 'Booking confirmed', actor: 'Aarav Mehta', detail: 'Rental slot confirmed and payment authorised.' },
      { id: 'h2', time: '03 Apr 17:20', label: 'Booking cancelled', actor: 'Aarav Mehta', detail: 'Customer cancelled after project timing changed.' },
      { id: 'h3', time: '03 Apr 17:25', label: 'Cancellation fee disputed', actor: 'Aarav Mehta', detail: 'Ticket opened to review the cancellation fee.' },
    ],
  },
]

export const quickProblems = ['Late operator', 'Wrong location', 'Booking question'] as const

// ---------------------------------------------------------------------------
// User lookup (masked)
// ---------------------------------------------------------------------------

export type UserType = 'Customer' | 'Owner' | 'Operator'

export type UserAccount = {
  id: string
  name: string
  type: UserType
  city: string
  maskedPhone: string
  maskedEmail: string
  maskedId: string
  status: 'Active' | 'Suspended' | 'Pending'
  joined: string
  bookings: number
  tickets: number
  activity: string[]
}

export const userAccounts: UserAccount[] = [
  { id: 'US-1001', name: 'Karan Patel', type: 'Customer', city: 'Hyderabad', maskedPhone: '+91 ••••• 43210', maskedEmail: 'k•••@gmail.com', maskedId: 'ID ••••4321', status: 'Active', joined: '2025-08-14', bookings: 12, tickets: 6, activity: ['Raised ticket TK-4821 · operator delay', 'Booked BK-88213 · HITEC City', 'Raised ticket TK-4701 · refund query'] },
  { id: 'US-1002', name: 'Neha Rao', type: 'Customer', city: 'Hyderabad', maskedPhone: '+91 ••••• 55501', maskedEmail: 'n•••@outlook.com', maskedId: 'ID ••••5501', status: 'Active', joined: '2025-11-02', bookings: 7, tickets: 3, activity: ['Raised ticket TK-4820 · duplicate charge', 'Booked BK-90112 · Gachibowli', 'Payment method updated'] },
  { id: 'US-1003', name: 'Sri Balaji Rentals', type: 'Owner', city: 'Hyderabad', maskedPhone: '+91 ••••• 88221', maskedEmail: 's•••@balajirentals.in', maskedId: 'GST ••••8821', status: 'Active', joined: '2024-06-19', bookings: 214, tickets: 9, activity: ['Raised ticket TK-4818 · payout statement', 'Added 3 machines to HITEC City', 'Payout statement downloaded'] },
  { id: 'US-1004', name: 'Imran Khan', type: 'Operator', city: 'Hyderabad', maskedPhone: '+91 ••••• 11002', maskedEmail: 'i•••@equiphub.demo', maskedId: 'ID ••••1100', status: 'Active', joined: '2025-02-27', bookings: 96, tickets: 4, activity: ['Ticket TK-4817 · OTP resolved', 'Completed 14 jobs this month', 'Rating updated to 4.7'] },
  { id: 'US-1005', name: 'Zainab Ali', type: 'Customer', city: 'Hyderabad', maskedPhone: '+91 ••••• 77120', maskedEmail: 'z•••@yahoo.com', maskedId: 'ID ••••7712', status: 'Active', joined: '2025-09-30', bookings: 9, tickets: 5, activity: ['Raised ticket TK-4819 · wrong location', 'Booked BK-88244 · Kokapet', 'Raised ticket TK-4660 · billing'] },
  { id: 'US-1006', name: 'Mohit Jain', type: 'Customer', city: 'Hyderabad', maskedPhone: '+91 ••••• 20981', maskedEmail: 'm•••@gmail.com', maskedId: 'ID ••••2098', status: 'Active', joined: '2024-12-11', bookings: 15, tickets: 7, activity: ['Reopened ticket TK-4772 · refund', 'Booked BK-88310 · Madhapur', 'Damage dispute DSP-4381'] },
  { id: 'US-1007', name: 'Anand Rao', type: 'Operator', city: 'Hyderabad', maskedPhone: '+91 ••••• 90210', maskedEmail: 'a•••@equiphub.demo', maskedId: 'ID ••••9021', status: 'Suspended', joined: '2024-10-05', bookings: 58, tickets: 8, activity: ['Wrong location on BK-88244', 'Suspended pending review', 'Raised ticket TK-4550 · account'] },
]

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------

export type SupportRefundStatus = 'Draft' | 'Escalated' | 'Approved' | 'Processed' | 'Rejected'

export type SupportRefund = {
  id: string
  booking: string
  ticket: string
  customer: string
  amount: string
  numericAmount: number
  reason: string
  status: SupportRefundStatus
  createdAt: string
  note: string
}

export const supportRefunds: SupportRefund[] = [
  { id: 'RF-2210', booking: 'BK-88310', ticket: 'TK-4772', customer: 'Mohit Jain', amount: '₹3,200', numericAmount: 3200, reason: 'Partial goodwill for delay', status: 'Processed', createdAt: '2026-04-01 09:20', note: 'Within cap, auto-approved' },
  { id: 'RF-2205', booking: 'BK-90112', ticket: 'TK-4820', customer: 'Neha Rao', amount: '₹12,500', numericAmount: 12500, reason: 'Duplicate charge reversal', status: 'Escalated', createdAt: '2026-04-02 08:55', note: 'Above cap · sent to finance admin' },
  { id: 'RF-2204', booking: 'BK-88320', ticket: 'TK-4815', customer: 'Priya Nair', amount: '₹4,800', numericAmount: 4800, reason: 'Operator misconduct credit', status: 'Approved', createdAt: '2026-04-02 09:40', note: 'Within cap, awaiting processing' },
  { id: 'RF-2203', booking: 'BK-88244', ticket: 'TK-4819', customer: 'Zainab Ali', amount: '₹2,000', numericAmount: 2000, reason: 'Location mix-up compensation', status: 'Draft', createdAt: '2026-04-02 09:05', note: 'Pending support confirmation' },
  { id: 'RF-2201', booking: 'BK-88110', ticket: '—', customer: 'Amit Singh', amount: '₹9,800', numericAmount: 9800, reason: 'Damage dispute partial', status: 'Rejected', createdAt: '2026-03-30 14:10', note: 'Rejected in policy review' },
]

export type PaymentIssueType = 'Failed payment' | 'Duplicate transaction' | 'Refund request' | 'Payment discrepancy' | 'Settlement complaint'
export type PaymentResolutionStatus = 'Open' | 'Investigating' | 'Resolved' | 'Escalated'

export type SupportPaymentIssue = {
  id: string
  reference: string
  booking: string
  ticket: string
  reporter: string
  reporterType: UserType
  issueType: PaymentIssueType
  amount: string
  reportedAt: string
  status: PaymentResolutionStatus
  summary: string
  resolution: string
}

export const supportPaymentIssues: SupportPaymentIssue[] = [
  { id: 'PI-3105', reference: 'TXN-8F21-9041', booking: 'BK-90112', ticket: 'TK-4820', reporter: 'Neha Rao', reporterType: 'Customer', issueType: 'Duplicate transaction', amount: '₹12,500', reportedAt: '2026-04-02 08:40', status: 'Investigating', summary: 'Two card debits appear for one confirmed booking.', resolution: 'Gateway trace requested; verify the duplicate authorisation before refund.' },
  { id: 'PI-3104', reference: 'TXN-7A30-1128', booking: 'BK-88213', ticket: '—', reporter: 'Karan Patel', reporterType: 'Customer', issueType: 'Failed payment', amount: '₹48,000', reportedAt: '2026-04-02 08:12', status: 'Open', summary: 'Payment attempt timed out, but the customer is unsure whether the charge went through.', resolution: 'Check gateway result and confirm whether the booking payment was captured.' },
  { id: 'PI-3103', reference: 'RFND-2204', booking: 'BK-88320', ticket: 'TK-4815', reporter: 'Priya Nair', reporterType: 'Customer', issueType: 'Refund request', amount: '₹4,800', reportedAt: '2026-04-02 09:40', status: 'Open', summary: 'Customer credit is approved but not yet visible in the original payment method.', resolution: 'Confirm refund processing status and expected bank settlement time.' },
  { id: 'PI-3102', reference: 'TXN-6D19-7783', booking: 'BK-88310', ticket: 'TK-4772', reporter: 'Mohit Jain', reporterType: 'Customer', issueType: 'Payment discrepancy', amount: '₹3,200', reportedAt: '2026-04-01 09:20', status: 'Resolved', summary: 'Customer disputes the amount returned after a damage deduction.', resolution: 'Refund RF-2210 processed; customer updated with the adjustment breakdown.' },
  { id: 'PI-3101', reference: 'SET-APR-0098', booking: '—', ticket: 'TK-4818', reporter: 'Sri Balaji Rentals', reporterType: 'Owner', issueType: 'Settlement complaint', amount: '₹18,400', reportedAt: '2026-04-01 07:50', status: 'Escalated', summary: 'Owner reports that the March payout statement does not match the expected net earnings.', resolution: 'Statement and booking adjustments sent to Finance Admin for reconciliation.' },
]

// ---------------------------------------------------------------------------
// Escalations
// ---------------------------------------------------------------------------

export type EscalationTarget = 'City admin' | 'Finance admin' | 'Compliance admin' | 'Operations manager'
export type EscalationCategory = 'Dispute / damage' | 'Payment problem' | 'Compliance / document' | 'Operational urgency'
export type EscalationStatus = 'Open' | 'Acknowledged' | 'Resolved'

export type SupportEscalation = {
  id: string
  subject: string
  category: EscalationCategory
  target: EscalationTarget
  reason: string
  status: EscalationStatus
  priority: TicketPriority
  level: 'Level 1' | 'Level 2' | 'Level 3'
  slaDeadline: string
  progress: number
  resolutionNote: string
  opened: string
  ticket: string
}

export const categoryTargetMap: Record<EscalationCategory, EscalationTarget> = {
  'Dispute / damage': 'City admin',
  'Payment problem': 'Finance admin',
  'Compliance / document': 'Compliance admin',
  'Operational urgency': 'Operations manager',
}

export const escalationCategories: EscalationCategory[] = [
  'Dispute / damage',
  'Payment problem',
  'Compliance / document',
  'Operational urgency',
]

export const escalationTargets: EscalationTarget[] = ['City admin', 'Finance admin', 'Compliance admin', 'Operations manager']

export const supportEscalations: SupportEscalation[] = [
  { id: 'ESC-118', subject: 'Operator shortage in Kondapur cluster', category: 'Operational urgency', target: 'Operations manager', reason: 'Three bookings at risk this morning with no available operators.', status: 'Acknowledged', priority: 'Urgent', level: 'Level 2', slaDeadline: '2026-04-02 11:00', progress: 45, resolutionNote: '', opened: '2026-04-02 08:55', ticket: '—' },
  { id: 'ESC-117', subject: 'Damage claim dispute on BK-88310', category: 'Dispute / damage', target: 'City admin', reason: 'Customer disputes the damage deduction, needs city admin decision.', status: 'Open', priority: 'High', level: 'Level 2', slaDeadline: '2026-04-02 17:00', progress: 25, resolutionNote: '', opened: '2026-04-01 17:10', ticket: 'TK-4772' },
  { id: 'ESC-116', subject: 'Payout statement mismatch', category: 'Payment problem', target: 'Finance admin', reason: 'Owner reports a difference between the app and the payout statement.', status: 'Open', priority: 'High', level: 'Level 1', slaDeadline: '2026-04-02 15:40', progress: 30, resolutionNote: '', opened: '2026-04-01 15:40', ticket: 'TK-4818' },
  { id: 'ESC-115', subject: 'Operator licence document expired', category: 'Compliance / document', target: 'Compliance admin', reason: 'Operator operating with an expired licence document.', status: 'Resolved', priority: 'Normal', level: 'Level 1', slaDeadline: '2026-03-31 11:20', progress: 100, resolutionNote: 'Expired operator document verified and access restricted pending renewal.', opened: '2026-03-30 11:20', ticket: '—' },
  { id: 'ESC-114', subject: 'Customer KYC name mismatch', category: 'Compliance / document', target: 'Compliance admin', reason: 'KYC name does not match the booking name.', status: 'Resolved', priority: 'Normal', level: 'Level 1', slaDeadline: '2026-03-29 09:15', progress: 100, resolutionNote: 'Customer identity details reviewed and corrected.', opened: '2026-03-28 09:15', ticket: '—' },
]

// ---------------------------------------------------------------------------
// Reports & audit
// ---------------------------------------------------------------------------

export type ReportCard = { id: string; title: string; description: string; formats: string[] }

export const reportCards: ReportCard[] = [
  { id: 'rp-vol', title: 'Ticket volume report', description: 'Tickets created and resolved by type, category and zone.', formats: ['CSV', 'PDF'] },
  { id: 'rp-sla', title: 'Response & resolution times', description: 'First response and resolution times against SLA targets.', formats: ['CSV', 'PDF'] },
  { id: 'rp-ref', title: 'Refund report', description: 'Refund counts and amounts, within cap and escalated.', formats: ['CSV', 'PDF'] },
  { id: 'rp-esc', title: 'Escalation report', description: 'Escalations by target team and category.', formats: ['CSV'] },
  { id: 'rp-aud', title: 'Audit trail export', description: 'Every support action with actor, time and area.', formats: ['CSV'] },
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
  { id: 'au-1', time: '2026-04-02 10:05', actor: 'Anita Shah', action: 'Ticket closed', area: 'tickets', detail: 'TK-4810 · payment issue resolved' },
  { id: 'au-2', time: '2026-04-02 09:48', actor: 'Ravi Deshmukh', action: 'Ticket assigned', area: 'tickets', detail: 'TK-4821 · late operator · High' },
  { id: 'au-3', time: '2026-04-02 09:40', actor: 'Anita Shah', action: 'Refund created', area: 'refunds', detail: 'RF-2204 · ₹4,800 · within cap' },
  { id: 'au-4', time: '2026-04-02 08:55', actor: 'Sneha Iyer', action: 'Escalation raised', area: 'escalations', detail: 'ESC-118 · Operations manager' },
  { id: 'au-5', time: '2026-04-02 08:50', actor: 'Anita Shah', action: 'Refund escalated', area: 'refunds', detail: 'RF-2205 · ₹12,500 · above cap to finance' },
  { id: 'au-6', time: '2026-04-01 17:10', actor: 'Anita Shah', action: 'Ticket reopened', area: 'tickets', detail: 'TK-4772 · customer not satisfied' },
  { id: 'au-7', time: '2026-04-01 16:30', actor: 'Ravi Deshmukh', action: 'Internal note added', area: 'tickets', detail: 'TK-4816 · pre-pickup photos verified' },
  { id: 'au-8', time: '2026-03-31 12:20', actor: 'Anita Shah', action: 'User looked up', area: 'users', detail: 'US-1006 · customer account' },
]
